import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, Suit, Rank } from '../../core/types/CombatTypes';

enum TutorialStage {
    INTRODUCTION,
    FORM_PAIR,
    FORM_STRAIGHT,
    FORM_FLUSH,
    FORM_FULL_HOUSE,
    FORM_HIGH_CARD_DEFEND,
    MORAL_CHOICE,
    CONCLUSION
}

export class Prologue extends Scene {
    private isStoryPhase: boolean = true;
    private tutorialContainer: GameObjects.Container;
    private skipButton: GameObjects.Container;
    private typingTimer: Phaser.Time.TimerEvent | null = null;
    private currentTutorialStage: TutorialStage;

    constructor() {
        super('Prologue');
    }

    create() {
        if (this.cameras.main) {
            this.cameras.main.setBackgroundColor(0x000000);
        }
        this.startStoryPhase();
    }

    // --- STORY PHASE --- //

    private startStoryPhase() {
        this.isStoryPhase = true;
        const slides = [
            "Long ago, two gods, Bathala, the sky-father, and Amihan, the sea-mother, created the islands.",
            "These islands were a paradise for the anito, spirits of nature, who lived in harmony.",
            "But the engkanto, spirits of deceit, grew jealous. They wove lies and discord, turning the anito against each other.",
            "A hero is needed to restore balance.",
            "You must channel the power of the four elements - Apoy, Tubig, Lupa, and Hangin - through sacred cards.",
            "Combine these cards to form powerful hands, and vanquish the corrupted spirits."
        ];
        let currentSlide = 0;

        const imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222).setStrokeStyle(3, 0x4a90e2).setAlpha(0);
        const border = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, undefined, 0).setStrokeStyle(6, 0x8e44ad).setAlpha(0);
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { fontFamily: 'dungeon-mode', fontSize: 28, color: '#FFFFFF', align: 'center', wordWrap: { width: this.cameras.main.width - 100 } }).setOrigin(0.5);
        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click or press SPACE to continue', { fontFamily: 'dungeon-mode', fontSize: 18, color: '#AAAAAA', align: 'center' }).setOrigin(0.5);

        const storyElements = [imagePlaceholder, border, displayedText, controlsText];

        const transitionToTutorial = () => {
            if (!this.isStoryPhase) return; // Prevent double transition
            this.isStoryPhase = false;
            this.input.off('pointerdown', showNextSlide);
            this.input.keyboard?.off('keydown-SPACE');

            this.tweens.add({
                targets: [...storyElements, this.skipButton],
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    storyElements.forEach(el => el.destroy());
                    if (this.skipButton && this.skipButton.active) this.skipButton.destroy();
                    this.startTutorial();
                }
            });
        };

        const skipCallback = () => {
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
            this.tweens.killTweensOf(storyElements);
            transitionToTutorial();
        };

        this.skipButton = this.createButton(this.cameras.main.width - 120, this.cameras.main.height - 60, 'Skip Intro', skipCallback);
        this.skipButton.setAlpha(0);

        const showNextSlide = () => {
            if (!this.isStoryPhase) return;
            if (currentSlide >= slides.length) {
                transitionToTutorial();
                return;
            }

            this.tweens.add({ targets: [imagePlaceholder, border, this.skipButton], alpha: 1, duration: 500, ease: 'Power2' });
            this.typeText(displayedText, slides[currentSlide++]);
        };

        this.input.on('pointerdown', showNextSlide);
        this.input.keyboard?.on('keydown-SPACE', showNextSlide);
        showNextSlide();
    }

    // --- TUTORIAL PHASE --- //

    private startTutorial() {
        this.tutorialContainer = this.add.container(0, 0);
        this.skipButton = this.createButton(this.cameras.main.width - 120, this.cameras.main.height - 60, 'Skip Tutorial', () => this.endTutorial(true));
        this.tutorialContainer.add(this.skipButton);

        const tutorialBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x1a1a2a).setAlpha(0.9);
        this.tutorialContainer.add(tutorialBg);

        this.currentTutorialStage = TutorialStage.INTRODUCTION;
        this.runTutorialStage();
    }

    private runTutorialStage() {
        switch (this.currentTutorialStage) {
            case TutorialStage.INTRODUCTION: this.handleIntroduction(); break;
            case TutorialStage.FORM_PAIR: this.handleFormPair(); break;
            case TutorialStage.FORM_STRAIGHT: this.handleFormStraight(); break;
            case TutorialStage.FORM_FLUSH: this.handleFormFlush(); break;
            case TutorialStage.FORM_FULL_HOUSE: this.handleFormFullHouse(); break;
            case TutorialStage.FORM_HIGH_CARD_DEFEND: this.handleFormHighCardAndDefend(); break;
            case TutorialStage.MORAL_CHOICE: this.handleMoralChoice(); break;
            case TutorialStage.CONCLUSION: this.handleConclusion(); break;
        }
    }

    private handleIntroduction() {
        // Using 'tikbalang' as a placeholder for the neutral guide sprite
        const guide = this.add.sprite(this.cameras.main.width / 2, 150, 'tikbalang').setScale(1.5);
        this.tutorialContainer.add(guide);
        this.showDialogue('You who walk the path between worlds... the spirits are in disarray. The cards you hold are the key.', () => {
            this.currentTutorialStage = TutorialStage.FORM_PAIR;
            this.runTutorialStage();
        });
    }

    private handleFormPair() {
        this.showDialogue('Let\'s start with the foundation. A Pair is two cards of the same rank. Form one now.', () => {
            this.drawCards('pair', (selected) => {
                if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'pair') {
                    this.showDialogue('Not quite. A Pair is two cards of the same rank. Try again.', () => this.handleFormPair());
                    return;
                }
                this.showDialogue('Good. Now, Attack the illusion.', () => {
                    const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'tikbalang').setAlpha(0.5).setScale(1.2);
                    this.tutorialContainer.add(illusion);
                    this.showActionButtons((action) => {
                        this.playAttackAnimation(illusion, '2', () => {
                            illusion.destroy();
                            this.currentTutorialStage = TutorialStage.FORM_STRAIGHT;
                            this.runTutorialStage();
                        });
                    }, ['attack']);
                });
            });
        });
    }

    private handleFormStraight() {
        this.showDialogue('Now, look for a sequence. Five cards in numerical order form a Straight. Use it to Attack!', () => {
            this.drawCards('straight', (selected) => {
                if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'straight') {
                    this.showDialogue('Look for a sequence of 5 cards, like 3-4-5-6-7.', () => this.handleFormStraight());
                    return;
                }
                const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'tikbalang').setAlpha(0.5).setScale(1.2);
                this.tutorialContainer.add(illusion);
                this.showActionButtons((action) => {
                    this.playAttackAnimation(illusion, '10', () => {
                        illusion.destroy();
                        this.currentTutorialStage = TutorialStage.FORM_FLUSH;
                        this.runTutorialStage();
                    });
                }, ['attack']);
            });
        });
    }

    private handleFormFlush() {
        this.showDialogue('Power also comes from unity. Five cards of the same element form a Flush. This unlocks a Special ability.', () => {
            this.drawCards('flush', (selected) => {
                if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'flush') {
                    this.showDialogue('A Flush is five cards of the same element. Try again.', () => this.handleFormFlush());
                    return;
                }
                const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'tikbalang').setAlpha(0.5).setScale(1.2);
                this.tutorialContainer.add(illusion);
                this.showActionButtons((action) => {
                    this.playAttackAnimation(illusion, '14', () => {
                        illusion.destroy();
                        this.currentTutorialStage = TutorialStage.FORM_FULL_HOUSE;
                        this.runTutorialStage();
                    });
                }, ['special']);
            });
        });
    }

    private handleFormFullHouse() {
        this.showDialogue('Combine your knowledge. A Pair and a Three of a Kind form a Full House. Use it on this stronger foe.', () => {
            this.drawCards('full_house', (selected) => {
                if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'full_house') {
                    this.showDialogue('Find a trio and a pair.', () => this.handleFormFullHouse());
                    return;
                }
                const strongIllusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'tikbalang').setScale(1.4);
                this.tutorialContainer.add(strongIllusion);
                this.showActionButtons((action) => {
                    this.playAttackAnimation(strongIllusion, '18', () => {
                        this.tutorialContainer.bringToTop(strongIllusion);
                        this.currentTutorialStage = TutorialStage.FORM_HIGH_CARD_DEFEND;
                        this.runTutorialStage();
                    });
                }, ['attack']);
            });
        });
    }

    private handleFormHighCardAndDefend() {
        this.showDialogue('But what if there is no pattern? Then, your highest card is your guide. This is a High Card hand.', () => {
            this.drawCards('high_card', (selected) => {
                this.showDialogue('A High Card hand is weak. It is best used for Defense when you are desperate. The illusion will strike. Defend!', () => {
                    const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'tikbalang').setAlpha(0.5).setScale(1.2);
                    this.tutorialContainer.add(illusion);
                    this.tweens.add({ targets: illusion, scale: 1.3, alpha: 0.9, duration: 500, yoyo: true });
                    this.showActionButtons((action) => {
                        if (action === 'defend') {
                            illusion.destroy();
                            this.showDialogue('You gained some block, absorbing the attack. Sometimes, that is enough.', () => {
                                this.currentTutorialStage = TutorialStage.MORAL_CHOICE;
                                this.runTutorialStage();
                            });
                        }
                    }, ['defend']);
                });
            });
        });
    }

    private handleMoralChoice() {
        const defeatedSpirit = this.tutorialContainer.list.find(go => go.type === 'Sprite' && (go as GameObjects.Sprite).texture.key === 'tikbalang' && go.scaleX === 1.4) as GameObjects.Sprite;
        if (defeatedSpirit) defeatedSpirit.setTint(0xff0000);

        this.showDialogue('The illusion is gone, but the choice it represents is real. When you defeat a corrupted spirit, you are left with its essence.', () => {
            const slayButton = this.createButton(this.cameras.main.width / 2 - 220, this.cameras.main.height - 100, 'Slay', () => {
                this.showDialogue('You absorb the spirit\'s power. A path of conquest.', () => {
                    this.currentTutorialStage = TutorialStage.CONCLUSION;
                    this.runTutorialStage();
                });
                slayButton.destroy();
                spareButton.destroy();
            });
            const spareButton = this.createButton(this.cameras.main.width / 2 + 220, this.cameras.main.height - 100, 'Spare', () => {
                if (defeatedSpirit) this.playSpareAnimation(defeatedSpirit, () => {});
                this.showDialogue('You purify the spirit\'s essence. A path of mercy.', () => {
                    this.currentTutorialStage = TutorialStage.CONCLUSION;
                    this.runTutorialStage();
                });
                slayButton.destroy();
                spareButton.destroy();
            });
            this.tutorialContainer.add([slayButton, spareButton]);
        });
    }

    private handleConclusion() {
        this.showDialogue('Your path is set. The omens are before you. Go forth and mend the balance.', () => {
            this.endTutorial();
        });
    }

    private async endTutorial(skipped = false) {
        if (this.skipButton && this.skipButton.active) {
            this.skipButton.destroy();
        }
        if (skipped) {
            this.scene.start('Overworld');
            return;
        }
        this.tweens.add({ targets: this.tutorialContainer, alpha: 0, duration: 1000, ease: 'Power2', onComplete: () => { this.scene.start('Overworld'); } });
    }

    // --- HELPER FUNCTIONS --- //

    private drawCards(type: 'high_card' | 'pair' | 'straight' | 'flush' | 'full_house', onHandComplete: (selected: PlayingCard[]) => void) {
        let handConfig: {r: Rank, s: Suit}[];
        switch(type) {
            case 'pair': handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}]; break;
            case 'straight': handConfig = [{r: '3', s: 'Apoy'}, {r: '4', s: 'Tubig'}, {r: '5', s: 'Lupa'}, {r: '6', s: 'Hangin'}, {r: '7', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '9', s: 'Hangin'}]; break;
            case 'flush': handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Apoy'}, {r: '7', s: 'Apoy'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
            case 'full_house': handConfig = [{r: '8', s: 'Apoy'}, {r: '8', s: 'Tubig'}, {r: '8', s: 'Lupa'}, {r: 'Datu', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
            default: handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
        }
        
        const hand = handConfig.map((def, i) => ({ id: `p_${i}`, rank: def.r, suit: def.s, selected: false, playable: true, element: 'neutral' }));
        const selectedCards: PlayingCard[] = [];
        const handSprites: GameObjects.Sprite[] = [];

        const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};
        const cardWidth = 200 * 0.35;
        const handWidth = hand.length * (cardWidth * 0.9);
        const startX = this.cameras.main.width / 2 - handWidth / 2;
        const y = this.cameras.main.height - 250;

        const cardAreaBg = this.add.rectangle(this.cameras.main.width / 2, y, handWidth + 50, cardWidth * 1.5 + 80, 0x2c3e50).setAlpha(0.3);
        const selectionIndicator = this.add.text(this.cameras.main.width / 2, y + 120, 'Selected: 0/5', { fontFamily: 'dungeon-mode', fontSize: 18, color: '#FFFFFF' }).setOrigin(0.5);
        
        const cardElements: GameObjects.GameObject[] = [cardAreaBg, selectionIndicator];

        const playHandCallback = () => {
            if (selectedCards.length !== 5) return;
            cardElements.forEach(el => el.destroy());
            handSprites.forEach(s => s.destroy());
            playHandButton.destroy();
            onHandComplete(selectedCards);
        };

        const playHandButton = this.createButton(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Play Hand', playHandCallback);
        playHandButton.setVisible(false);
        cardElements.push(playHandButton);

        hand.forEach((card, i) => {
            const spriteRank = rankMap[card.rank] || "1";
            const spriteSuit = card.suit.toLowerCase();
            const cardSprite = this.add.sprite(startX + i * (cardWidth * 0.9), y, `card_${spriteRank}_${spriteSuit}`).setInteractive().setScale(0.35);
            cardSprite.setData('card', card);
            handSprites.push(cardSprite);

            cardSprite.on('pointerdown', () => {
                card.selected = !card.selected;
                const selIndex = selectedCards.findIndex(c => c.id === card.id);
                if (card.selected && selIndex === -1 && selectedCards.length < 5) {
                    cardSprite.y -= 30;
                    cardSprite.setTint(0x4a90e2);
                    selectedCards.push(card);
                } else if (selIndex > -1) {
                    card.selected = false;
                    cardSprite.y += 30;
                    cardSprite.clearTint();
                    selectedCards.splice(selIndex, 1);
                }

                selectionIndicator.setText(`Selected: ${selectedCards.length}/5`);
                playHandButton.setVisible(selectedCards.length === 5);
            });
        });

        this.tutorialContainer.add([...cardElements, ...handSprites]);
    }

    private showActionButtons(onAction: (action: string) => void, enabled: string[] = ['attack', 'defend', 'special']) {
        const actions = ['Attack', 'Defend', 'Special'];
        const actionButtonsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
        this.tutorialContainer.add(actionButtonsContainer);
        
        actions.forEach((action, i) => {
            const lowerCaseAction = action.toLowerCase();
            const isEnabled = enabled.includes(lowerCaseAction);
            const button = this.createButton(-220 + i * 220, 0, action, () => {
                if (!isEnabled) return;
                actionButtonsContainer.destroy();
                onAction(lowerCaseAction);
            });

            if (!isEnabled) {
                (button.getAt(0) as GameObjects.Rectangle).setFillStyle(0x1a1a1a, 0.5);
                (button.getAt(1) as GameObjects.Text).setAlpha(0.5);
            } else {
                this.tweens.add({ targets: button, scale: 1.05, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', duration: 700 });
            }
            actionButtonsContainer.add(button);
        });
    }

    private playAttackAnimation(target: GameObjects.Sprite, damage: string, onComplete: () => void) {
        if (!target || !target.active) { onComplete(); return; }
        this.cameras.main.shake(100, 0.01);
        target.setTint(0xff0000);
        const damageText = this.add.text(target.x, target.y, damage, { fontFamily: 'dungeon-mode', fontSize: 48, color: '#ff0000' }).setOrigin(0.5);
        this.tutorialContainer.add(damageText);
        this.tweens.add({ targets: damageText, y: target.y - 100, alpha: 0, duration: 1000, ease: 'Power1' });
        this.time.delayedCall(200, () => target.clearTint());
        this.time.delayedCall(1000, onComplete);
    }

    private playSpareAnimation(target: GameObjects.Sprite, onComplete: () => void) {
        if (!target || !target.active) { onComplete(); return; }
        const spareEffect = this.add.particles(0, 0, 'pixel', { x: target.x, y: target.y, speed: { min: -100, max: 100 }, angle: { min: 0, max: 360 }, scale: { start: 0.5, end: 0 }, blendMode: 'add', frequency: 20, lifespan: 800, quantity: 5, tint: 0x2ecc71 });
        this.tweens.add({ targets: target, tint: 0x2ecc71, duration: 200, yoyo: true, repeat: 4, onComplete: () => { target.clearTint(); spareEffect.destroy(); onComplete(); } });
    }

    private showDialogue(text: string, onComplete: () => void) {
        const dialogueContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
        this.tutorialContainer.add(dialogueContainer);
        
        const bg = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 120, 0x1a1a2e, 0.9).setStrokeStyle(3, 0x8e44ad).setInteractive();
        const dialogueText = this.add.text(0, 0, '', { fontFamily: 'dungeon-mode', fontSize: 22, color: '#ecf0f1', align: 'center', wordWrap: { width: this.cameras.main.width * 0.75 } }).setOrigin(0.5);
        const continueIndicator = this.add.text(bg.width/2 - 40, bg.height/2 - 20, '▼', { fontSize: 28, color: '#e74c3c' }).setOrigin(0.5).setVisible(false);
        dialogueContainer.add([bg, dialogueText, continueIndicator]);
        
        dialogueContainer.setAlpha(0);
        this.tweens.add({ targets: dialogueContainer, alpha: 1, duration: 400, ease: 'Power2' });
        
        this.typeText(dialogueText, text).then(() => {
            continueIndicator.setVisible(true);
            this.tweens.add({ targets: continueIndicator, y: '+=8', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            
            bg.once('pointerdown', () => {
                if (this.typingTimer) this.typingTimer.remove();
                this.tweens.killTweensOf(continueIndicator);
                this.tweens.add({ targets: dialogueContainer, alpha: 0, duration: 300, ease: 'Power2', onComplete: () => { dialogueContainer.destroy(); onComplete(); } });
            });
        });
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        if (this.typingTimer) this.typingTimer.remove();
        return new Promise(resolve => {
            textObject.setText('');
            let charIndex = 0;
            this.typingTimer = this.time.addEvent({
                delay: 30,
                callback: () => {
                    textObject.setText(textObject.text + text[charIndex++]);
                    if (charIndex === text.length) {
                        this.typingTimer = null;
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }

    private createButton(x: number, y: number, text: string, callback: () => void): GameObjects.Container {
        const button = this.add.container(x, y);
        const bg = this.add.rectangle(0, 0, 220, 60, 0x2f3542).setStrokeStyle(2, 0x57606f);
        const buttonText = this.add.text(0, 0, text, { fontFamily: "dungeon-mode", fontSize: 24, color: "#e8eced", align: "center" }).setOrigin(0.5);
        button.add([bg, buttonText]);
        
        button.setSize(220, 60);
        button.setInteractive(new Phaser.Geom.Rectangle(-110, -30, 220, 60), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
                event.stopPropagation();
                if (!button.active) return;
                button.disableInteractive();

                this.tweens.add({
                    targets: button,
                    scale: 0.95,
                    duration: 100,
                    ease: 'Power1',
                    onComplete: () => {
                        callback();
                    }
                });
                this.cameras.main.shake(30, 0.01);
            })
            .on('pointerover', () => {
                if (!button.active) return;
                this.input.manager.canvas.style.cursor = 'pointer';
                this.tweens.add({ targets: button, scale: 1.05, duration: 200, ease: 'Power2' });
                bg.setFillStyle(0x3d4454);
            })
            .on('pointerout', () => {
                if (!button.active) return;
                this.input.manager.canvas.style.cursor = 'default';
                this.tweens.add({ targets: button, scale: 1, duration: 200, ease: 'Power2' });
                bg.setFillStyle(0x2f3542);
            });
            
        return button;
    }
}

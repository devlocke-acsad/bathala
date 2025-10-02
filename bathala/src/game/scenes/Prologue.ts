import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, Suit, Rank } from '../../core/types/CombatTypes';

// Represents the linear progression through the new tutorial
enum TutorialStage {
    INTRODUCTION,
    FORM_PAIR,      // Player learns to make a Pair
    ATTACK,         // Player learns to Attack
    DEFEND,         // Player learns to Defend
    FORM_STRONGER,  // Player learns about stronger hands (3-of-a-kind)
    SPECIAL,        // Player learns to use Special
    MORAL_CHOICE,   // Player learns about Slay/Spare
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
        this.cameras.main.setBackgroundColor(0x000000);
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
                    this.skipButton.destroy();
                    this.startTutorial();
                }
            });
        };

        const skipCallback = () => {
            // Forcefully stop all ongoing animations and timers related to the story phase
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
            if (this.isStoryPhase && currentSlide >= slides.length) {
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
            case TutorialStage.INTRODUCTION:
                this.handleIntroduction();
                break;
            case TutorialStage.FORM_PAIR:
                this.handleFormPair();
                break;
            case TutorialStage.ATTACK:
                this.handleAttack();
                break;
            case TutorialStage.DEFEND:
                this.handleDefend();
                break;
            case TutorialStage.FORM_STRONGER:
                this.handleFormStronger();
                break;
            case TutorialStage.SPECIAL:
                this.handleSpecial();
                break;
            case TutorialStage.MORAL_CHOICE:
                this.handleMoralChoice();
                break;
            case TutorialStage.CONCLUSION:
                this.handleConclusion();
                break;
        }
    }

    private handleIntroduction() {
        const duwende = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'duwende').setScale(2);
        this.tutorialContainer.add(duwende);
        this.showDialogue('Halt, traveler! The woods are twisted, but I can show you the way of the cards. First, let\'s see your strength. Form a hand of 5 cards.', () => {
            this.currentTutorialStage = TutorialStage.FORM_PAIR;
            this.runTutorialStage();
        });
    }

    private handleFormPair() {
        this.showDialogue('Find a connection. Two cards of the same rank make a Pair. This is the simplest way to focus your power.', () => {
            this.drawCards('pair', (selected) => {
                const evaluation = HandEvaluator.evaluateHand(selected, 'attack');
                if (evaluation.type === 'pair') {
                    this.currentTutorialStage = TutorialStage.ATTACK;
                    this.runTutorialStage();
                } else {
                    this.showDialogue('Not quite. Try again. Select two cards with the same rank to form a Pair.', () => this.handleFormPair());
                }
            });
        });
    }

    private handleAttack() {
        this.showDialogue('You\'ve formed a Pair! Now, use it to Attack.', () => {
            this.showActionButtons((action) => {
                if (action === 'attack') {
                    this.playAttackAnimation(this.tutorialContainer.getAt(2) as GameObjects.Sprite, '2', () => {
                        this.currentTutorialStage = TutorialStage.DEFEND;
                        this.runTutorialStage();
                    });
                }
            }, ['attack']);
        });
    }

    private handleDefend() {
        this.showDialogue('Not bad! But defense is just as important. I will strike now. Form another hand and Defend!', () => {
            // Here you could add a "charge up" animation for the duwende
            this.drawCards('pair', (selected) => {
                this.showActionButtons((action) => {
                    if (action === 'defend') {
                        this.showDialogue('You gained 10 block, absorbing my attack! Good.', () => {
                            this.currentTutorialStage = TutorialStage.FORM_STRONGER;
                            this.runTutorialStage();
                        });
                    }
                }, ['defend']);
            });
        });
    }

    private handleFormStronger() {
        this.showDialogue('To cleanse the corruption, you need greater power. Three cards of the same rank make a powerful trio.', () => {
            this.drawCards('three_of_a_kind', (selected) => {
                const evaluation = HandEvaluator.evaluateHand(selected, 'special');
                if (evaluation.type === 'three_of_a_kind') {
                    this.currentTutorialStage = TutorialStage.SPECIAL;
                    this.runTutorialStage();
                } else {
                    this.showDialogue('Almost. Select the three cards with the same rank.', () => this.handleFormStronger());
                }
            });
        });
    }

    private handleSpecial() {
        this.showDialogue('Excellent! A hand this strong unlocks a Special ability. Use it!', () => {
            this.showActionButtons((action) => {
                if (action === 'special') {
                    this.playAttackAnimation(this.tutorialContainer.getAt(2) as GameObjects.Sprite, '10', () => {
                        this.currentTutorialStage = TutorialStage.MORAL_CHOICE;
                        this.runTutorialStage();
                    });
                }
            }, ['special']);
        });
    }

    private handleMoralChoice() {
        const duwende = this.tutorialContainer.getAt(2) as GameObjects.Sprite;
        duwende.setTint(0xff0000); // Show the spirit is weakened

        this.showDialogue('The spirit is defeated. Your path is now yours to choose...', () => {
            const choices = ['Slay (Gain Power)', 'Spare (Restore Spirit)'];
            const choiceContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height - 100);
            this.tutorialContainer.add(choiceContainer);

            choices.forEach((choiceText, i) => {
                const choice = i === 0 ? 'slay' : 'spare';
                const button = this.createButton(-220 + i * 440, 0, choiceText, () => {
                    choiceContainer.destroy();
                    if (choice === 'slay') {
                        this.showDialogue('You chose the path of power. You feel stronger.', () => {
                            this.currentTutorialStage = TutorialStage.CONCLUSION;
                            this.runTutorialStage();
                        });
                    } else {
                        this.playSpareAnimation(duwende, () => {
                            this.showDialogue('You chose to restore the spirit. The forest feels a little brighter.', () => {
                                this.currentTutorialStage = TutorialStage.CONCLUSION;
                                this.runTutorialStage();
                            });
                        });
                    }
                });
                choiceContainer.add(button);
            });
        });
    }

    private handleConclusion() {
        this.showDialogue('Your journey begins now. Remember what you have learned. Go forth.', () => {
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

        this.tweens.add({
            targets: this.tutorialContainer,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.start('Overworld');
            }
        });
    }

    // --- HELPER FUNCTIONS --- //

    private drawCards(type: 'pair' | 'three_of_a_kind', onHandComplete: (selected: PlayingCard[]) => void) {
        let handConfig;
        switch(type) {
            case 'pair':
                handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
            case 'three_of_a_kind':
                handConfig = [{r: '7', s: 'Apoy'}, {r: '7', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '2', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}];
                break;
        }
        
        const hand = handConfig.map((def, i) => ({ id: `p_${i}`, rank: def.r as Rank, suit: def.s as Suit, selected: false, playable: true, element: 'neutral' }));
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
                if (card.selected) {
                    if (selectedCards.length < 5) {
                        cardSprite.y -= 30;
                        cardSprite.setTint(0x4a90e2);
                        selectedCards.push(card);
                    } else {
                        card.selected = false;
                    }
                } else {
                    cardSprite.y += 30;
                    cardSprite.clearTint();
                    const index = selectedCards.findIndex(c => c.id === card.id);
                    if (index > -1) selectedCards.splice(index, 1);
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
        if (!target || !target.active) {
            onComplete();
            return;
        }
        this.cameras.main.shake(100, 0.01);
        target.setTint(0xff0000);
        const damageText = this.add.text(target.x, target.y, damage, { fontFamily: 'dungeon-mode', fontSize: 48, color: '#ff0000' }).setOrigin(0.5);
        this.tutorialContainer.add(damageText);
        this.tweens.add({ targets: damageText, y: target.y - 100, alpha: 0, duration: 1000, ease: 'Power1' });
        this.time.delayedCall(200, () => target.clearTint());
        this.time.delayedCall(1000, onComplete);
    }

    private playSpareAnimation(target: GameObjects.Sprite, onComplete: () => void) {
        if (!target || !target.active) {
            onComplete();
            return;
        }
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
                this.tweens.add({ targets: dialogueContainer, alpha: 0, duration: 300, ease: 'Power2', onComplete: () => { dialogueContainer.destroy(); onComplete(); } });
            });
        });
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        if (this.typingTimer) {
            this.typingTimer.remove();
        }
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

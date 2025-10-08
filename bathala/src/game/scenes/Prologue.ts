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
    private instructionText: GameObjects.Text;

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

        const imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x150E10).setStrokeStyle(3, 0x77888C).setAlpha(0);
        const border = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, undefined, 0).setStrokeStyle(6, 0x77888C).setAlpha(0);
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { fontFamily: 'dungeon-mode', fontSize: 28, color: '#77888C', align: 'center', wordWrap: { width: this.cameras.main.width - 100 } }).setOrigin(0.5);
        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click or press SPACE to continue', { fontFamily: 'dungeon-mode', fontSize: 18, color: '#77888C', align: 'center' }).setOrigin(0.5);

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
        
        // Add background image
        const tutorialBgImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'chap1_no_leaves_boss');
        
        // Scale the background to cover the screen
        const scaleX = this.cameras.main.width / tutorialBgImage.width;
        const scaleY = this.cameras.main.height / tutorialBgImage.height;
        const scale = Math.max(scaleX, scaleY);
        tutorialBgImage.setScale(scale);
        
        // Add 75% opacity overlay with #150E10
        const tutorialOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.75);
        
        // Add persistent instruction text at the top
        this.instructionText = this.add.text(this.cameras.main.width / 2, 40, '', {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#77888C',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);
        
        this.tutorialContainer.add([tutorialBgImage, tutorialOverlay, this.instructionText]);
        
        // Position skip button relative to viewport (top-right corner with proper margin)
        const skipButtonX = this.cameras.main.width * 0.88; // 88% from left (12% margin from right)
        const skipButtonY = this.cameras.main.height * 0.92; // 92% from top (8% from bottom)
        this.skipButton = this.createButton(skipButtonX, skipButtonY, 'Skip Tutorial', () => this.endTutorial(true));
        this.tutorialContainer.add(this.skipButton);

        this.currentTutorialStage = TutorialStage.INTRODUCTION;
        this.runTutorialStage();
    }
    
    private updateInstruction(text: string) {
        if (this.instructionText) {
            this.instructionText.setText(text);
        }
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
        // No visible guide sprite - just dialogue
        this.updateInstruction('Learn the basics of combat');
        this.showDialogue('Greetings, traveler. The spirits whisper of your coming. You hold sacred cards that channel the four elements.', () => {
            this.showDialogue('These cards are your weapon and shield. Let me guide you in their use.', () => {
                this.currentTutorialStage = TutorialStage.FORM_PAIR;
                this.runTutorialStage();
            });
        });
    }

    private handleFormPair() {
        this.updateInstruction('Select 5 cards including a Pair (two cards with the same rank)');
        this.showDialogue('First, understand the foundation. When two cards share the same rank, they form a Pair.', () => {
            this.showDialogue('Select two cards with matching numbers to create a Pair. Once you have selected 5 cards, play your hand.', () => {
                this.drawCards('pair', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'pair') {
                        this.showDialogue('Look again. A Pair requires two cards of the same rank. Try once more.', () => this.handleFormPair());
                        return;
                    }
                    this.updateInstruction('Click the Attack button to strike the illusion');
                    this.showDialogue('Well done. A Pair grants +2 to your action. Now, Attack this illusion.', () => {
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.35, 'duwende').setAlpha(0.7).setScale(1.2);
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
        });
    }

    private handleFormStraight() {
        this.updateInstruction('Select 5 cards in sequence (3-4-5-6-7) to form a Straight');
        this.showDialogue('Excellent. Now we advance to sequences. Five cards in numerical order form a Straight.', () => {
            this.showDialogue('Find five cards that follow in sequence, like 3-4-5-6-7. Elements do not matter for Straights.', () => {
                this.drawCards('straight', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'straight') {
                        this.showDialogue('Not quite. Look for five cards in numerical order, regardless of element.', () => this.handleFormStraight());
                        return;
                    }
                    this.updateInstruction('Click the Attack button to strike with your Straight');
                    this.showDialogue('Perfect! A Straight grants +10 to your action. Strike this illusion down!', () => {
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.35, 'duwende').setAlpha(0.7).setScale(1.2);
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
            });
        });
    }

    private handleFormFlush() {
        this.updateInstruction('Select 5 cards of the same element to form a Flush');
        this.showDialogue('The elements themselves hold power. Five cards of the same element create a Flush.', () => {
            this.showDialogue('Select five cards sharing the same element. A Flush grants +14 and unlocks Special abilities.', () => {
                this.drawCards('flush', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'flush') {
                        this.showDialogue('The elements must align. Find five cards of the same element.', () => this.handleFormFlush());
                        return;
                    }
                    this.updateInstruction('Click the Special button to unleash elemental power');
                    this.showDialogue('Magnificent! The element flows through you. Use the Special action to channel its unique power.', () => {
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.35, 'duwende').setAlpha(0.7).setScale(1.2);
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
            });
        });
    }

    private handleFormFullHouse() {
        this.updateInstruction('Select 5 cards: three of one rank and two of another (Full House)');
        this.showDialogue('Now we combine what you have learned. A Full House requires both a Pair and a Three of a Kind.', () => {
            this.showDialogue('Find three cards of one rank and two cards of another. This powerful hand grants +18.', () => {
                this.drawCards('full_house', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'full_house') {
                        this.showDialogue('You need three of one rank and two of another rank together.', () => this.handleFormFullHouse());
                        return;
                    }
                    this.updateInstruction('Click the Attack button to strike with your Full House');
                    this.showDialogue('Impressive mastery! Face this stronger foe with your Full House.', () => {
                        const strongIllusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.35, 'duwende').setScale(1.4);
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
            });
        });
    }

    private handleFormHighCardAndDefend() {
        this.updateInstruction('Select any 5 cards to form a High Card hand');
        this.showDialogue('Sometimes, fortune does not favor you. When no patterns emerge, you have only a High Card.', () => {
            this.drawCards('high_card', (selected) => {
                this.updateInstruction('Click the Defend button to protect yourself from the attack');
                this.showDialogue('A High Card is the weakest hand. But it can still be used to Defend yourself when needed.', () => {
                    this.showDialogue('The illusion prepares to strike! Use Defend to protect yourself.', () => {
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.35, 'duwende').setAlpha(0.7).setScale(1.2);
                        this.tutorialContainer.add(illusion);
                        this.tweens.add({ targets: illusion, scale: 1.3, alpha: 0.85, duration: 500, yoyo: true, repeat: -1 });
                        this.showActionButtons((action) => {
                            if (action === 'defend') {
                                this.tweens.killTweensOf(illusion);
                                illusion.destroy();
                                this.showDialogue('You gained block, absorbing the blow. Defense can save you when offense fails.', () => {
                                    this.currentTutorialStage = TutorialStage.MORAL_CHOICE;
                                    this.runTutorialStage();
                                });
                            }
                        }, ['defend']);
                    });
                });
            });
        });
    }

    private handleMoralChoice() {
        const defeatedSpirit = this.tutorialContainer.list.find(go => go.type === 'Sprite' && (go as GameObjects.Sprite).texture.key === 'duwende' && go.scaleX === 1.4) as GameObjects.Sprite;
        if (defeatedSpirit) defeatedSpirit.setTint(0xff0000);

        this.updateInstruction('Choose to Slay or Spare the defeated spirit');
        this.showDialogue('The illusion has fallen. But know this: when you face true corrupted spirits, a choice awaits.', () => {
            this.showDialogue('You may Slay them, taking their power. Or you may Spare them, purifying their essence. This choice shapes your path.', () => {
                this.showDialogue('Make your choice now, as practice for the trials ahead.', () => {
                    const buttonY = this.cameras.main.height * 0.85; // 85% from top
                    const slayButton = this.createButton(this.cameras.main.width * 0.35, buttonY, 'Slay', () => {
                        this.showDialogue('The path of Conquest. Power through dominance. Your journey will be fierce.', () => {
                            this.currentTutorialStage = TutorialStage.CONCLUSION;
                            this.runTutorialStage();
                        });
                        slayButton.destroy();
                        spareButton.destroy();
                    });
                    const spareButton = this.createButton(this.cameras.main.width * 0.65, buttonY, 'Spare', () => {
                        if (defeatedSpirit) this.playSpareAnimation(defeatedSpirit, () => {});
                        this.showDialogue('The path of Mercy. Restoration through compassion. Your journey will be noble.', () => {
                            this.currentTutorialStage = TutorialStage.CONCLUSION;
                            this.runTutorialStage();
                        });
                        slayButton.destroy();
                        spareButton.destroy();
                    });
                    this.tutorialContainer.add([slayButton, spareButton]);
                });
            });
        });
    }

    private handleConclusion() {
        this.updateInstruction('Tutorial complete - beginning your journey');
        this.showDialogue('You understand the cards. You understand the choice. The spirits await your judgment.', () => {
            this.showDialogue('Go forth, traveler. Restore balance to these corrupted lands. May the elements guide you.', () => {
                this.endTutorial();
            });
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
        const cardSpacing = cardWidth * 0.75;
        const totalWidth = (hand.length - 1) * cardSpacing;
        const centerX = this.cameras.main.width / 2;
        const baseY = this.cameras.main.height * 0.75; // 75% from top - higher up to avoid button overlap
        
        // Arc parameters
        const arcHeight = 30; // How much the cards curve upward
        const maxRotation = 8; // Maximum rotation angle in degrees

        // Position elements relative to viewport
        const selectionIndicatorY = this.cameras.main.height * 0.88; // 88% from top
        const playButtonY = this.cameras.main.height * 0.95; // 95% from top - very bottom
        
        const selectionIndicator = this.add.text(centerX, selectionIndicatorY, 'Selected: 0/5', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 20, 
            color: '#77888C' 
        }).setOrigin(0.5);
        
        const cardElements: GameObjects.GameObject[] = [selectionIndicator];

        const playHandCallback = () => {
            if (selectedCards.length !== 5) return;
            cardElements.forEach(el => el.destroy());
            handSprites.forEach(s => s.destroy());
            playHandButton.destroy();
            onHandComplete(selectedCards);
        };

        const playHandButton = this.createButton(centerX, playButtonY, 'Play Hand', playHandCallback);
        playHandButton.setVisible(false);
        cardElements.push(playHandButton);

        hand.forEach((card, i) => {
            const spriteRank = rankMap[card.rank] || "1";
            const spriteSuit = card.suit.toLowerCase();
            
            // Calculate position along arc
            const normalizedPos = (i / (hand.length - 1)) - 0.5; // -0.5 to 0.5
            const xPos = centerX + (normalizedPos * totalWidth);
            const yOffset = Math.abs(normalizedPos) * arcHeight; // Arc curve
            const yPos = baseY + yOffset;
            const rotation = normalizedPos * maxRotation; // Rotation based on position
            
            const cardSprite = this.add.sprite(xPos, yPos, `card_${spriteRank}_${spriteSuit}`)
                .setInteractive()
                .setScale(0.35)
                .setAngle(rotation);
            
            cardSprite.setData('card', card);
            cardSprite.setData('originalY', yPos);
            cardSprite.setData('originalRotation', rotation);
            handSprites.push(cardSprite);

            cardSprite.on('pointerdown', () => {
                card.selected = !card.selected;
                const selIndex = selectedCards.findIndex(c => c.id === card.id);
                if (card.selected && selIndex === -1 && selectedCards.length < 5) {
                    cardSprite.y -= 40;
                    cardSprite.setTint(0x4a90e2);
                    selectedCards.push(card);
                } else if (selIndex > -1) {
                    card.selected = false;
                    cardSprite.y = cardSprite.getData('originalY');
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
                (button.getAt(2) as GameObjects.Rectangle).setFillStyle(0x0a0605, 0.5);
                (button.getAt(3) as GameObjects.Text).setAlpha(0.3);
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
        
        // Double border design with new colors
        const outerBorder = this.add.rectangle(0, 0, this.cameras.main.width * 0.8 + 8, 128, undefined, 0).setStrokeStyle(2, 0x77888C);
        const innerBorder = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 120, undefined, 0).setStrokeStyle(2, 0x77888C);
        const bg = this.add.rectangle(0, 0, this.cameras.main.width * 0.8, 120, 0x150E10).setInteractive();
        
        const dialogueText = this.add.text(0, 0, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 22, 
            color: '#77888C', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width * 0.75 } 
        }).setOrigin(0.5);
        
        const continueIndicator = this.add.text(bg.width/2 - 40, bg.height/2 - 20, '▼', { 
            fontFamily: 'dungeon-mode',
            fontSize: 20, 
            color: '#77888C' 
        }).setOrigin(0.5).setVisible(false);
        
        dialogueContainer.add([outerBorder, innerBorder, bg, dialogueText, continueIndicator]);
        
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
        
        // Create text first to measure size
        const buttonText = this.add.text(0, 0, text, { 
            fontFamily: "dungeon-mode", 
            fontSize: 24, 
            color: "#77888C", 
            align: "center" 
        }).setOrigin(0.5);
        
        // Calculate dynamic size based on text with padding
        const paddingX = 40;
        const paddingY = 20;
        const buttonWidth = Math.max(buttonText.width + paddingX, 180);
        const buttonHeight = buttonText.height + paddingY;
        
        // Double border design
        const outerBorder = this.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
        const innerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
        
        button.add([outerBorder, innerBorder, bg, buttonText]);
        
        button.setSize(buttonWidth, buttonHeight);
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight);
        button.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        
        button.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation();
            if (!button.active) return;
            
            // Disable further interactions
            button.disableInteractive();

            this.tweens.add({
                targets: button,
                scale: 0.95,
                duration: 100,
                ease: 'Power1',
                onComplete: () => {
                    this.tweens.add({
                        targets: button,
                        scale: 1,
                        duration: 100,
                        ease: 'Power1',
                        onComplete: () => {
                            callback();
                        }
                    });
                }
            });
            this.cameras.main.shake(30, 0.01);
        });
        
        button.on('pointerover', () => {
            if (!button.active) return;
            this.input.manager.canvas.style.cursor = 'pointer';
            this.tweens.add({ targets: button, scale: 1.05, duration: 200, ease: 'Power2' });
            bg.setFillStyle(0x1f1410);
        });
        
        button.on('pointerout', () => {
            if (!button.active) return;
            this.input.manager.canvas.style.cursor = 'default';
            this.tweens.add({ targets: button, scale: 1, duration: 200, ease: 'Power2' });
            bg.setFillStyle(0x150E10);
        });
            
        return button;
    }
}

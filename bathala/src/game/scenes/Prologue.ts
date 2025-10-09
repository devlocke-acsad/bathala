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
        
        // Add cleanup when scene shuts down
        this.events.once('shutdown', () => {
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
        });
        
        this.startStoryPhase();
    }

    // --- STORY PHASE --- //

    private startStoryPhase() {
        this.isStoryPhase = true;
        const slides = [
            "In the age before memory, when the world was still young...\n\nBathala shaped the heavens with his breath.\n\nAmihan wove the seas with her song.",
            "From their divine union, the islands were born.\n\nA paradise where anito—spirits of wind, water, earth, and flame—danced in perfect harmony.\n\nBalance was law. Kapwa was sacred.",
            "But in shadow, envy festered.\n\nThe engkanto—spirits of lies and illusion—whispered poison into willing ears.\n\nThey twisted truth. Corrupted bonds. Shattered the sacred balance.",
            "Brother turned against brother.\n\nThe elements warred.\n\nHarmony bled into chaos.",
            "The elders spoke of one who would come.\n\nOne who would walk between worlds.\n\nOne who would restore what was broken.",
            "You are that one.\n\nThe sacred deck is yours to master—each card a channel of elemental power.\n\nApoy's fury. Tubig's grace. Lupa's strength. Hangin's swiftness.",
            "Form hands. Strike true. Choose wisely.\n\nFor in your judgment lies the fate of all.",
            "The corrupted await.\n\nThe balance trembles.\n\nYour journey begins now."
        ];
        let currentSlide = 0;

        // Create space key for keyboard input
        const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add background image
        const introBgImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'chap1_no_leaves_boss');
        
        // Scale the background to cover the screen
        const scaleX = this.cameras.main.width / introBgImage.width;
        const scaleY = this.cameras.main.height / introBgImage.height;
        const scale = Math.max(scaleX, scaleY);
        introBgImage.setScale(scale);
        
        // Add 90% opacity overlay with #150E10
        const introOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.90);

        // Text occupies 60% of screen width, centered vertically
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 24, 
            color: '#77888C', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width * 0.6 }, // 60% of screen width
            lineSpacing: 12
        }).setOrigin(0.5);
        
        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.92, 'Click or press SPACE to continue', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 18, 
            color: '#77888C', 
            align: 'center',
            alpha: 0.7
        }).setOrigin(0.5);

        const storyElements = [introBgImage, introOverlay, displayedText, controlsText];

        const transitionToTutorial = () => {
            if (!this.isStoryPhase) return; // Prevent double transition
            this.isStoryPhase = false;
            
            // Clean up typing timer before destroying elements
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
            
            this.input.off('pointerdown', showNextSlide);
            if (spaceKey) {
                spaceKey.off('down', showNextSlide);
            }

            // Enhanced transition effect
            this.tweens.add({
                targets: displayedText,
                alpha: 0,
                y: displayedText.y - 50,
                duration: 600,
                ease: 'Power2'
            });
            
            this.tweens.add({
                targets: [controlsText, this.skipButton],
                alpha: 0,
                duration: 400,
                ease: 'Power2'
            });
            
            this.tweens.add({
                targets: introOverlay,
                alpha: 0.9,
                duration: 800,
                ease: 'Power2'
            });

            this.time.delayedCall(800, () => {
                storyElements.forEach(el => el.destroy());
                if (this.skipButton && this.skipButton.active) this.skipButton.destroy();
                
                // Fade in tutorial
                this.cameras.main.fadeIn(600, 21, 14, 16); // #150E10 in RGB
                this.time.delayedCall(300, () => {
                    this.startTutorial();
                });
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

        // Position skip button same as tutorial - bottom right
        const skipButtonX = this.cameras.main.width * 0.88; // 88% from left (12% margin from right)
        const skipButtonY = this.cameras.main.height * 0.92; // 92% from top (8% from bottom)
        this.skipButton = this.createButton(skipButtonX, skipButtonY, 'Skip Intro', skipCallback);
        this.skipButton.setAlpha(0);

        const showNextSlide = () => {
            if (!this.isStoryPhase) return;
            if (currentSlide >= slides.length) {
                transitionToTutorial();
                return;
            }

            // Fade out current text
            if (currentSlide > 0) {
                this.tweens.add({
                    targets: displayedText,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        displayedText.setText('');
                        displayedText.setAlpha(1);
                        this.typeText(displayedText, slides[currentSlide++]);
                    }
                });
            } else {
                this.typeText(displayedText, slides[currentSlide++]);
            }

            this.tweens.add({ targets: [this.skipButton, controlsText], alpha: 1, duration: 500, ease: 'Power2' });
        };

        this.input.on('pointerdown', showNextSlide);
        if (spaceKey) {
            spaceKey.on('down', showNextSlide);
        }
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
        
        // Add 90% opacity overlay with #150E10
        const tutorialOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.90);
        
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
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.33, 'duwende').setAlpha(0.85).setScale(2.5);
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
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.33, 'duwende').setAlpha(0.85).setScale(2.5);
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
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.33, 'duwende').setAlpha(0.85).setScale(2.5);
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
                        const strongIllusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.33, 'duwende').setScale(2.7);
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
                        const illusion = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height * 0.33, 'duwende').setAlpha(0.85).setScale(2.5);
                        this.tutorialContainer.add(illusion);
                        this.tweens.add({ targets: illusion, scale: 2.7, alpha: 0.95, duration: 500, yoyo: true, repeat: -1 });
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
        const defeatedSpirit = this.tutorialContainer.list.find(go => go.type === 'Sprite' && (go as GameObjects.Sprite).texture.key === 'duwende' && go.scaleX === 2.7) as GameObjects.Sprite;
        if (defeatedSpirit) defeatedSpirit.setTint(0xff0000);

        this.updateInstruction('Choose to Slay or Spare the defeated spirit');
        this.showDialogue('The illusion has fallen. But know this: when you face true corrupted spirits, a choice awaits.', () => {
            this.showDialogue('You may Slay them, taking their power. Or you may Spare them, purifying their essence. This choice shapes your path.', () => {
                this.showDialogue('Make your choice now, as practice for the trials ahead.', () => {
                    const buttonY = this.cameras.main.height * 0.82; // 82% from top - moved up
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
        // Clean up any running timers
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.typingTimer = null;
        }
        
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
        const cardWidth = 200 * 0.35; // 70px
        const cardSpacing = cardWidth * 1.43; // 100px spacing - ensures 95% of each card is visible (70 * 0.95 = 66.5px visible, 70-66.5 = 3.5px overlap per side)
        const totalWidth = (hand.length - 1) * cardSpacing;
        const centerX = this.cameras.main.width / 2;
        const baseY = this.cameras.main.height * 0.64; // 64% from top
        
        // Arc parameters
        const arcHeight = 40; // Arc curve height
        const maxRotation = 10; // Maximum rotation angle in degrees

        // Position elements relative to viewport
        const selectionIndicatorY = this.cameras.main.height * 0.82; // 82% from top
        const playButtonY = this.cameras.main.height * 0.90; // 90% from top
        
        const selectionIndicator = this.add.text(centerX, selectionIndicatorY, 'Selected: 0/5', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 20, 
            color: '#77888C' 
        }).setOrigin(0.5).setDepth(900);
        
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
                .setAngle(rotation)
                .setDepth(100 + i); // Set depth so cards layer properly
            
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
                    cardSprite.setDepth(500 + i); // Bring selected cards to front
                    selectedCards.push(card);
                } else if (selIndex > -1) {
                    card.selected = false;
                    cardSprite.y = cardSprite.getData('originalY');
                    cardSprite.clearTint();
                    cardSprite.setDepth(100 + i); // Return to normal depth
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
        actionButtonsContainer.setDepth(2000); // High depth to ensure clickability
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
                // Properly disable the button
                button.disableInteractive();
                button.setAlpha(0.4); // Make it visually clear it's disabled
                const bg = button.getAt(2) as GameObjects.Rectangle;
                bg.setFillStyle(0x0a0605);
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
        dialogueContainer.setDepth(2000); // Very high depth to ensure it's on top
        
        dialogueContainer.setAlpha(0);
        this.tweens.add({ targets: dialogueContainer, alpha: 1, duration: 400, ease: 'Power2' });
        
        let typingComplete = false;
        
        this.typeText(dialogueText, text).then(() => {
            typingComplete = true;
            continueIndicator.setVisible(true);
            this.tweens.add({ targets: continueIndicator, y: '+=8', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        });
        
        // Click to skip typing or continue
        bg.on('pointerdown', () => {
            if (!typingComplete) {
                // Skip typing animation
                if (this.typingTimer) {
                    this.typingTimer.remove();
                    this.typingTimer = null;
                }
                dialogueText.setText(text);
                typingComplete = true;
                continueIndicator.setVisible(true);
                this.tweens.add({ targets: continueIndicator, y: '+=8', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            } else {
                // Continue to next dialogue
                if (this.typingTimer) this.typingTimer.remove();
                this.tweens.killTweensOf(continueIndicator);
                bg.removeAllListeners('pointerdown');
                this.tweens.add({ targets: dialogueContainer, alpha: 0, duration: 300, ease: 'Power2', onComplete: () => { dialogueContainer.destroy(); onComplete(); } });
            }
        });
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        if (this.typingTimer) this.typingTimer.remove();
        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }
            textObject.setText('');
            let charIndex = 0;
            this.typingTimer = this.time.addEvent({
                delay: 30,
                callback: () => {
                    if (!textObject || !textObject.active) {
                        if (this.typingTimer) {
                            this.typingTimer.remove();
                            this.typingTimer = null;
                        }
                        resolve();
                        return;
                    }
                    const currentText = textObject.text || '';
                    textObject.setText(currentText + text[charIndex++]);
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
        
        // Calculate dynamic size based on text with increased padding for better clickability
        const paddingX = 60; // Increased padding
        const paddingY = 30; // Increased padding
        const buttonWidth = Math.max(buttonText.width + paddingX, 200); // Minimum width 200
        const buttonHeight = Math.max(buttonText.height + paddingY, 50); // Minimum height 50
        
        // Double border design
        const outerBorder = this.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
        const innerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
        const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
        
        // Make background the interactive element instead of container
        bg.setInteractive({ useHandCursor: true });
        
        button.add([outerBorder, innerBorder, bg, buttonText]);
        
        // Set container size and depth
        button.setSize(buttonWidth, buttonHeight);
        button.setDepth(1000);
        
        let isHovering = false;
        
        bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!button.active) return;
            
            // Visual feedback
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
                            if (button.active) {
                                callback();
                            }
                        }
                    });
                }
            });
            this.cameras.main.shake(30, 0.01);
        });
        
        bg.on('pointerover', () => {
            if (!button.active) return;
            isHovering = true;
            this.input.setDefaultCursor('pointer');
            this.tweens.add({ targets: button, scale: 1.05, duration: 200, ease: 'Power2' });
            bg.setFillStyle(0x1f1410);
        });
        
        bg.on('pointerout', () => {
            if (!button.active) return;
            isHovering = false;
            this.input.setDefaultCursor('default');
            this.tweens.add({ targets: button, scale: 1, duration: 200, ease: 'Power2' });
            bg.setFillStyle(0x150E10);
        });
        
        // Store original disable method
        const originalDisable = button.disableInteractive.bind(button);
        button.disableInteractive = () => {
            bg.disableInteractive();
            if (isHovering) {
                this.input.setDefaultCursor('default');
            }
            return button;
        };
            
        return button;
    }
}

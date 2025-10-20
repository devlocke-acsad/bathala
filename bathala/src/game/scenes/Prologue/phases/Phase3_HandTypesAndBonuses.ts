import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { drawCards } from '../ui/CardInteraction';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';
import { PlayingCard } from '../../../../core/types/CombatTypes';

/**
 * Custom dialogue box for Phase 3 with optimized dimensions for hand types list
 */
function showLargeDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);

    // Optimized box dimensions for Phase 3 hand types explanation
    const boxWidth = Math.min(scene.cameras.main.width * 0.92, 1500);
    const boxHeight = scene.cameras.main.height * 0.52; // Adjusted height for better fit
    
    // Text should wrap INSIDE the box with padding
    const textWrapWidth = boxWidth - 120;
    
    const dialogueText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#77888C',
        align: 'center',
        wordWrap: { width: textWrapWidth },
        lineSpacing: 10
    }).setOrigin(0.5);

    // Background - matching intro style
    const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x150E10, 0.95).setInteractive();

    // Double border design (matching intro style)
    const outerBorder = scene.add.rectangle(0, 0, boxWidth + 8, boxHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x77888C, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, boxWidth + 2, boxHeight + 2, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.6);

    dialogueText.setText(''); // Clear text for typing effect

    // Continue indicator - using arrow symbol
    const continueIndicator = scene.add.text(0, boxHeight/2 - 40, '▼', {
        fontFamily: 'dungeon-mode',
        fontSize: 24,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.7).setVisible(false);

    dialogueContainer.add([bg, outerBorder, innerBorder, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(2000);

    // Fade in with scale animation
    dialogueContainer.setAlpha(0).setScale(0.95);
    scene.tweens.add({ 
        targets: dialogueContainer, 
        alpha: 1, 
        scale: 1,
        duration: 500, 
        ease: 'Back.easeOut'
    });

    let typingComplete = false;
    let typingTimer: Phaser.Time.TimerEvent | null = null;

    const typeText = (textObject: Phaser.GameObjects.Text, text: string): Promise<void> => {
        if (typingTimer) typingTimer.remove();
        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }
            textObject.setText('');
            let charIndex = 0;
            typingTimer = scene.time.addEvent({
                delay: 25,
                callback: () => {
                    if (!textObject || !textObject.active) {
                        if (typingTimer) {
                            typingTimer.remove();
                            typingTimer = null;
                        }
                        resolve();
                        return;
                    }
                    const currentText = textObject.text || '';
                    textObject.setText(currentText + text[charIndex++]);
                    if (charIndex === text.length) {
                        typingTimer = null;
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }

    typeText(dialogueText, text).then(() => {
        typingComplete = true;
        continueIndicator.setVisible(true).setAlpha(0);
        scene.tweens.add({ 
            targets: continueIndicator, 
            alpha: 1,
            y: '+=10', 
            duration: 800, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
    });

    bg.on('pointerdown', () => {
        if (!typingComplete) {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            dialogueText.setText(text);
            typingComplete = true;
            continueIndicator.setVisible(true).setAlpha(0);
            scene.tweens.add({ 
                targets: continueIndicator, 
                alpha: 1,
                y: '+=10', 
                duration: 800, 
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' 
            });
        } else {
            if (typingTimer) typingTimer.remove();
            scene.tweens.killTweensOf(continueIndicator);
            bg.removeAllListeners('pointerdown');
            scene.tweens.add({ 
                targets: dialogueContainer, 
                alpha: 0,
                scale: 0.95,
                duration: 400, 
                ease: 'Power2', 
                onComplete: () => { 
                    dialogueContainer.destroy(); 
                    onComplete(); 
                } 
            });
        }
    });

    return dialogueContainer;
}

export class Phase3_HandTypesAndBonuses extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    /**
     * Creates a reference image showing example cards for a hand type
     */
    private createHandReferenceImage(
        _handType: string,
        cards: {rank: string, suit: string}[]
    ): Phaser.GameObjects.Container {
        const { width, height } = this.scene.cameras.main;
        const container = this.scene.add.container(width / 2, height * 0.35); // Position at center-top

        // Background panel with border
        const panelWidth = 600;
        const panelHeight = 180;
        
        const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x150E10, 0.92);
        bg.setStrokeStyle(2, 0x77888C, 0.6);
        
        const innerBorder = this.scene.add.rectangle(0, 0, panelWidth - 8, panelHeight - 8, undefined, 0);
        innerBorder.setStrokeStyle(1, 0x556065, 0.4);
        
        container.add([bg, innerBorder]);

        // Label - better centered
        const label = this.scene.add.text(0, -60, 'EXAMPLE:', {
            fontFamily: 'dungeon-mode',
            fontSize: 16,
            color: '#FFAA00',
            align: 'center'
        }).setOrigin(0.5);
        container.add(label);

        // Add cards - better centered vertically
        const cardScale = 0.65;
        const cardWidth = 80 * cardScale;
        const cardSpacing = 12;
        const totalWidth = cards.length * cardWidth + (cards.length - 1) * cardSpacing;
        const startX = -totalWidth / 2 + cardWidth / 2;

        cards.forEach((card, index) => {
            const x = startX + index * (cardWidth + cardSpacing);
            this.addReferenceCard(container, card.rank, card.suit, x, 5, cardScale); // Moved down slightly for better centering
        });

        return container;
    }

    /**
     * Adds a single card sprite to the reference image
     */
    private addReferenceCard(
        container: Phaser.GameObjects.Container,
        rank: string,
        suit: string,
        x: number,
        y: number,
        scale: number
    ): void {
        const rankMap: Record<string, string> = {
            "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
            "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
            "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
        };
        const spriteRank = rankMap[rank] || rank;

        const suitMap: Record<string, string> = {
            "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
        };
        const spriteSuit = suitMap[suit] || "apoy";

        const textureKey = `card_${spriteRank}_${spriteSuit}`;

        if (this.scene.textures.exists(textureKey)) {
            const cardSprite = this.scene.add.image(x, y, textureKey);
            cardSprite.setDisplaySize(80 * scale, 112 * scale);
            if (cardSprite.texture) {
                cardSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            container.add(cardSprite);
        } else {
            // Fallback placeholder if texture doesn't exist
            const cardPlaceholder = this.scene.add.rectangle(x, y, 80 * scale, 112 * scale, 0xffffff);
            cardPlaceholder.setStrokeStyle(3 * scale, 0x333333);
            container.add(cardPlaceholder);

            const rankText = this.scene.add.text(x, y, rank, {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(16 * scale),
                color: '#000000'
            }).setOrigin(0.5);
            container.add(rankText);
        }
    }

    public start(): void {
        // Fade in container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
        
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 3, 8);
        progress.setAlpha(0);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Hand Types & Bonuses',
            'Understanding poker hands and their power'
        );
        header.setAlpha(0);
        this.container.add(header);
        
        // Stagger fade-in
        this.scene.tweens.add({
            targets: [progress, header],
            alpha: 1,
            duration: 600,
            delay: 300,
            ease: 'Power2'
        });

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    this.cleanup();
                    this.onComplete();
                }
            });
        });

        const dialogue = "Poker hands grant bonuses and multipliers to amplify your power.\nBetter hands = stronger actions!\n\nHigh Card: +0\nPair: +3, ×1.2\nTwo Pair: +6, ×1.3\nThree of a Kind: +10, ×1.5\nStraight: +12, ×1.6\nFlush: +15, ×1.7\nFull House: +20, ×2.0\nFour of a Kind: +25, ×2.2\nStraight Flush: +35, ×2.5\nFive of a Kind: +38, ×2.6 (requires relic)";

        const exampleCards: Partial<PlayingCard>[] = [
            { id: 'ex1', rank: '5', suit: 'Apoy' },
            { id: 'ex2', rank: '5', suit: 'Tubig' },
            { id: 'ex3', rank: '9', suit: 'Lupa' },
            { id: 'ex4', rank: '9', suit: 'Hangin' },
            { id: 'ex5', rank: 'Datu', suit: 'Apoy' }
        ];

        this.scene.time.delayedCall(900, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Higher hands = more powerful actions. Master them!',
                    'tip'
                );
                tip.setAlpha(0);
                this.container.add(tip);
                
                this.scene.tweens.add({
                    targets: tip,
                    alpha: 1,
                    duration: 400,
                    ease: 'Power2'
                });

                // Card showcase - only show when tooltip appears
                const { width, height } = this.scene.cameras.main;
                const cardContainer = this.scene.add.container(width / 2, height * 0.55);
                this.container.add(cardContainer);

                const cardSpacing = 100;
                const totalWidth = (exampleCards.length - 1) * cardSpacing;
                const startX = -totalWidth / 2;

                exampleCards.forEach((cardData, index) => {
                    const x = startX + index * cardSpacing;
                    const card = this.tutorialUI.createCardSprite(
                        { ...cardData, element: 'fire', selected: false, playable: true } as PlayingCard,
                        x,
                        0,
                        false
                    );

                    card.setAlpha(0).setY(-30).setScale(0.9);
                    cardContainer.add(card);

                    this.scene.tweens.add({
                        targets: card,
                        alpha: 1,
                        y: 0,
                        scale: 1,
                        duration: 600,
                        delay: index * 100,
                        ease: 'Back.easeOut'
                    });
                });

                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: this.container,
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.container.setAlpha(1);
                            this.practicePair();
                        }
                    });
                });
            });
            dialogueBox.setAlpha(0);
            this.container.add(dialogueBox);
            
            this.scene.tweens.add({
                targets: dialogueBox,
                alpha: 1,
                duration: 600,
                ease: 'Power2'
            });
        });
    }

    private practicePair(): void {
        // New progress indicator
        const progress = createProgressIndicator(this.scene, 3, 9);
        progress.setAlpha(0);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Form a Pair',
            'Two cards with matching ranks'
        );
        header.setAlpha(0);
        this.container.add(header);
        
        // Add reference image - showing a pair example (two 7s + three other cards)
        const refContainer = this.createHandReferenceImage(
            'pair',
            [{rank: '7', suit: 'Lupa'}, {rank: '7', suit: 'Apoy'}, {rank: '3', suit: 'Tubig'}, {rank: '9', suit: 'Hangin'}, {rank: 'Datu', suit: 'Lupa'}]
        );
        refContainer.setAlpha(0); // Hidden initially, will show when cards appear
        this.container.add(refContainer);
        
        // Fade in elements (except refContainer which shows with cards)
        this.scene.tweens.add({
            targets: [progress, header],
            alpha: 1,
            duration: 600,
            delay: 200,
            ease: 'Power2'
        });

        const dialogue = "Form a Pair (two cards with the same rank)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(800, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
                // Show reference container when cards appear
                refContainer.setAlpha(1);
                
                const cardInteraction = drawCards(this.scene, 'pair', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'pair') {
                        const warning = createInfoBox(
                            this.scene,
                            'Not quite! A Pair requires two cards of the same rank. Try again!',
                            'warning'
                        );
                        this.container.add(warning);
                        
                        this.scene.time.delayedCall(2000, () => {
                            warning.destroy();
                            cardInteraction.destroy();
                            this.practicePair();
                        });
                        return;
                    }
                    
                    const success = createInfoBox(
                        this.scene,
                        'Perfect! This grants +3 bonus and ×1.2 multiplier!',
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(2000, () => {
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => this.practiceTwoPair()
                        });
                    });
                });
                this.container.add(cardInteraction);
            });
            this.container.add(dialogueBox);
        });
    }

    private practiceTwoPair(): void {
        // New progress indicator
        const progress = createProgressIndicator(this.scene, 3, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Form Two Pair',
            'Two different pairs of matching ranks'
        );
        this.container.add(header);

        // Add reference image - showing two pair example (5s and Datus + one kicker)
        const refContainer = this.createHandReferenceImage(
            'two_pair',
            [{rank: '5', suit: 'Hangin'}, {rank: '5', suit: 'Apoy'}, {rank: 'Datu', suit: 'Tubig'}, {rank: 'Datu', suit: 'Lupa'}, {rank: '9', suit: 'Hangin'}]
        );
        refContainer.setAlpha(0); // Hidden initially, will show when cards appear
        this.container.add(refContainer);

        const dialogue = "Form Two Pair (two separate pairs)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
                // Show reference container when cards appear
                refContainer.setAlpha(1);
                
                const cardInteraction = drawCards(this.scene, 'twoPair', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'two_pair') {
                        const warning = createInfoBox(
                            this.scene,
                            'Not quite! Two Pair requires two different pairs. Try again!',
                            'warning'
                        );
                        this.container.add(warning);
                        
                        this.scene.time.delayedCall(2000, () => {
                            warning.destroy();
                            cardInteraction.destroy();
                            this.practiceTwoPair();
                        });
                        return;
                    }
                    
                    const success = createInfoBox(
                        this.scene,
                        'Excellent! This grants +6 bonus and ×1.3 multiplier!',
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(2000, () => {
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => this.practiceThreeOfAKind()
                        });
                    });
                });
                this.container.add(cardInteraction);
            });
            this.container.add(dialogueBox);
        });
    }

    private practiceThreeOfAKind(): void {
        // New progress indicator
        const progress = createProgressIndicator(this.scene, 3, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Form Three of a Kind',
            'Three cards with matching ranks'
        );
        this.container.add(header);

        // Add reference image - showing three of a kind example (three 8s + two kickers)
        const refContainer = this.createHandReferenceImage(
            'three_of_a_kind',
            [{rank: '8', suit: 'Apoy'}, {rank: '8', suit: 'Tubig'}, {rank: '8', suit: 'Lupa'}, {rank: '4', suit: 'Hangin'}, {rank: 'Babaylan', suit: 'Apoy'}]
        );
        refContainer.setAlpha(0); // Hidden initially, will show when cards appear
        this.container.add(refContainer);

        const dialogue = "Form Three of a Kind (three cards with the same rank)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
                // Show reference container when cards appear
                refContainer.setAlpha(1);
                
                const cardInteraction = drawCards(this.scene, 'threeOfAKind', (selected) => {
                    if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'three_of_a_kind') {
                        const warning = createInfoBox(
                            this.scene,
                            'Not quite! Three of a Kind requires three cards of the same rank. Try again!',
                            'warning'
                        );
                        this.container.add(warning);
                        
                        this.scene.time.delayedCall(2000, () => {
                            warning.destroy();
                            cardInteraction.destroy();
                            this.practiceThreeOfAKind();
                        });
                        return;
                    }
                    
                    const success = createInfoBox(
                        this.scene,
                        'Outstanding! This grants +10 bonus and ×1.5 multiplier!',
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(2000, () => {
                        this.scene.tweens.add({
                            targets: this.container,
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => {
                                this.cleanup();
                                this.onComplete();
                            }
                        });
                    });
                });
                this.container.add(cardInteraction);
            });
            this.container.add(dialogueBox);
        });
    }
}

import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { drawCards } from '../ui/CardInteraction';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';
import { PlayingCard } from '../../../../core/types/CombatTypes';

export class Phase3_HandTypesAndBonuses extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
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

        const dialogue = "Hands determine your action's power. Here's the hierarchy:\n\nHigh Card: +0\nPair: +2\nTwo Pair: +4\nThree of a Kind: +7\nStraight: +10\nFlush: +14 (UNLOCKS SPECIAL)\nFull House: +18\nFour of a Kind: +22\nStraight Flush: +35\nFive of a Kind: +30 (requires relic)";

        const exampleCards: Partial<PlayingCard>[] = [
            { id: 'ex1', rank: '5', suit: 'Apoy' },
            { id: 'ex2', rank: '5', suit: 'Tubig' },
            { id: 'ex3', rank: '9', suit: 'Lupa' },
            { id: 'ex4', rank: '9', suit: 'Hangin' },
            { id: 'ex5', rank: 'Datu', suit: 'Apoy' }
        ];

        this.scene.time.delayedCall(900, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
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
        
        // Fade in elements
        this.scene.tweens.add({
            targets: [progress, header],
            alpha: 1,
            duration: 600,
            delay: 200,
            ease: 'Power2'
        });

        const dialogue = "Form a Pair (two cards with the same rank)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(800, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
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
                        'Perfect! This grants +2 to your action!',
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

        const dialogue = "Form Two Pair (two separate pairs)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
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
                        'Excellent! This grants +4 to your action!',
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

        const dialogue = "Form Three of a Kind (three cards with the same rank)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                dialogueBox.destroy();
                
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
                        'Outstanding! This grants +7 to your action!',
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

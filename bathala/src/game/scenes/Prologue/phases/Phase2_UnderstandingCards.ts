import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { createPhaseHeader, createSectionDivider } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase2_UnderstandingCards extends TutorialPhase {
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
        const progress = createProgressIndicator(this.scene, 2, 8);
        progress.setAlpha(0);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'The Four Sacred Elements',
            'Master the elemental forces that shape combat'
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

        const dialogue = "Your deck contains 52 cards across four sacred elements:\n\nAPOY (Fire) - Inflicts BURN damage over time\nTUBIG (Water) - Provides HEALING\nLUPA (Earth) - STUNS enemies (cannot move for 1 turn)\nHANGIN (Wind) - Applies WEAK (enemy damage halved)";

        const cardsToShow: Partial<PlayingCard>[] = [
            { id: '1-Apoy', rank: '1', suit: 'Apoy' },
            { id: '1-Tubig', rank: '1', suit: 'Tubig' },
            { id: '1-Lupa', rank: '1', suit: 'Lupa' },
            { id: '1-Hangin', rank: '1', suit: 'Hangin' }
        ];

        this.scene.time.delayedCall(900, () => {
            this.displayUI('The Elements', dialogue, cardsToShow, () => {
                // Add info box before transitioning
                const info = createInfoBox(
                    this.scene,
                    'Each element offers unique advantages - combine them wisely!',
                    'info'
                );
                info.setAlpha(0);
                this.container.add(info);
                
                this.scene.tweens.add({
                    targets: info,
                    alpha: 1,
                    duration: 400,
                    ease: 'Power2'
                });
                
                this.scene.time.delayedCall(1800, () => {
                    this.showCardValues();
                });
            }, progress);
        });
    }

    private showCardValues(): void {
        // Fade out current elements
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                
                // Reset container alpha
                this.container.setAlpha(1);
                
                // Progress indicator for second part
                const progress = createProgressIndicator(this.scene, 2, 9);
                progress.setAlpha(0);
                this.container.add(progress);

                // New header
                const header = createPhaseHeader(
                    this.scene,
                    'Card Ranks & Values',
                    'From humble warriors to mighty chiefs'
                );
                header.setAlpha(0);
                this.container.add(header);
                
                // Fade in new elements
                this.scene.tweens.add({
                    targets: [progress, header],
                    alpha: 1,
                    duration: 600,
                    delay: 200,
                    ease: 'Power2'
                });

                const dialogue = "Each card has a rank from 1 to 13:\n\nAce, 2-10: Number Cards (basic values)\nJack (J): Mandirigma (Warrior)\nQueen (Q): Babaylan (Shaman)\nKing (K): Datu (Chief)\n\nHigher ranks create stronger hands and more powerful actions!";

                const cardsToShow: Partial<PlayingCard>[] = [
                    { id: '1-Apoy', rank: '1', suit: 'Apoy' },
                    { id: '5-Apoy', rank: '5', suit: 'Apoy' },
                    { id: '11-Apoy', rank: 'Mandirigma', suit: 'Apoy' },
                    { id: '12-Apoy', rank: 'Babaylan', suit: 'Apoy' },
                    { id: '13-Apoy', rank: 'Datu', suit: 'Apoy' }
                ];

                this.scene.time.delayedCall(800, () => {
                    this.displayUI('Card Ranks', dialogue, cardsToShow, () => {
                        const success = createInfoBox(
                            this.scene,
                            'You now understand the foundation of your deck!',
                            'success'
                        );
                        success.setAlpha(0);
                        this.container.add(success);
                        
                        this.scene.tweens.add({
                            targets: success,
                            alpha: 1,
                            duration: 400,
                            ease: 'Power2'
                        });
                        
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
                    }, progress);
                });
            }
        });
    }

    private displayUI(
        sectionTitle: string, 
        dialogue: string, 
        cards: Partial<PlayingCard>[], 
        onDialogueComplete: () => void,
        existingProgress?: Phaser.GameObjects.Container
    ): void {
        const { width, height } = this.scene.cameras.main;

        // Section divider
        const divider = createSectionDivider(this.scene, 240);
        this.container.add(divider);

        // Dialogue box - positioned closer to cards
        this.scene.time.delayedCall(400, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, onDialogueComplete);
            dialogueBox.setPosition(width / 2, height / 2 - 100);
            this.container.add(dialogueBox);
        });

        // Enhanced card display with stagger animation - moved up closer to dialogue
        this.scene.time.delayedCall(600, () => {
            const cardContainer = this.scene.add.container(width / 2, height / 2 + 180);
            this.container.add(cardContainer);

            const cardSpacing = cards.length <= 4 ? 160 : 130;
            const totalWidth = (cards.length - 1) * cardSpacing;
            const startX = -totalWidth / 2;

            cards.forEach((cardData, index) => {
                const x = startX + index * cardSpacing;
                const card = this.tutorialUI.createCardSprite(
                    { ...cardData, element: 'fire', selected: false, playable: true } as PlayingCard, 
                    x, 
                    0, 
                    false
                );
                
                // Set initial state for animation
                card.setAlpha(0).setY(-30).setScale(0.9);
                cardContainer.add(card);

                // Stagger animation for each card
                this.scene.tweens.add({
                    targets: card,
                    alpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 600,
                    delay: index * 150,
                    ease: 'Back.easeOut'
                });

                // Add subtle hover effect
                card.setInteractive();
                card.on('pointerover', () => {
                    this.scene.tweens.add({
                        targets: card,
                        y: -15,
                        scale: 1.1,
                        duration: 300,
                        ease: 'Power2'
                    });
                });

                card.on('pointerout', () => {
                    this.scene.tweens.add({
                        targets: card,
                        y: 0,
                        scale: 1,
                        duration: 300,
                        ease: 'Power2'
                    });
                });
            });
        });
    }
}

import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { createButton } from '../../../ui/Button';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase5_DiscardMechanic extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 5, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Discard Mechanic',
            'Reroll bad hands for better combinations'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        const dialogue = "Sometimes your hand lacks good combinations.\n\nDISCARD lets you redraw up to 5 cards once per combat.\n\nUse it wisely - you start with 1 discard charge.\nRelics can increase this!\n\nLet's practice:";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Select cards to discard, then click the Discard button!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(1800, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, info],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.giveWeakHand();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private giveWeakHand(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 5, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Try Discarding',
            'This is a weak hand - use discard to improve it'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            this.tutorialUI.drawHand(0);
            const weakHand: PlayingCard[] = [
                { id: '1-Apoy', rank: '1', suit: 'Apoy', element: 'fire', selected: false, playable: true },
                { id: '3-Tubig', rank: '3', suit: 'Tubig', element: 'water', selected: false, playable: true },
                { id: '5-Lupa', rank: '5', suit: 'Lupa', element: 'earth', selected: false, playable: true },
                { id: '7-Hangin', rank: '7', suit: 'Hangin', element: 'air', selected: false, playable: true },
                { id: '9-Apoy', rank: '9', suit: 'Apoy', element: 'fire', selected: false, playable: true },
            ];
            this.tutorialUI.addCardsToHand(weakHand);
            this.tutorialUI.updateHandDisplay();

            this.scene.events.on('selectCard', (card: PlayingCard) => {
                this.tutorialUI.selectCard(card);
            });

            const discardButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2, 
                this.scene.cameras.main.height - 100, 
                'Discard Selected', 
                () => {
                    const discarded = this.tutorialUI.discard();
                    if (discarded.length === 0) {
                        const warning = createInfoBox(
                            this.scene,
                            'Select some cards first by clicking them!',
                            'warning',
                            this.scene.cameras.main.width / 2,
                            this.scene.cameras.main.height - 180
                        );
                        this.container.add(warning);
                        this.scene.time.delayedCall(2000, () => warning.destroy());
                        return;
                    }

                    this.tutorialUI.drawHand(discarded.length);
                    this.tutorialUI.updateHandDisplay();
                    discardButton.destroy();

                    const success = createInfoBox(
                        this.scene,
                        'Much better! Discard charges are precious - use them strategically!',
                        'success'
                    );
                    this.container.add(success);

                    this.scene.time.delayedCall(2500, () => {
                        this.scene.events.off('selectCard');
                        this.scene.tweens.add({
                            targets: this.container.getAll(),
                            alpha: 0,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => this.onComplete()
                        });
                    });
                }
            );
            this.container.add(discardButton);
        });
    }
}


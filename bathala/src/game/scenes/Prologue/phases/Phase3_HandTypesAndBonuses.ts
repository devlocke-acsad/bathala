import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { drawCards } from '../ui/CardInteraction';
import { HandEvaluator } from '../../../../utils/HandEvaluator';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase3_HandTypesAndBonuses extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 3, 8);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Hand Types & Bonuses',
            'Understanding poker hands and their power'
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

        const dialogue = "Hands determine your action's power. Here's the hierarchy:\n\nHigh Card: +0 (no pattern)\nPair: +2 (two matching ranks)\nTwo Pair: +4 (two pairs)\nThree of a Kind: +7 (three matching)\nStraight: +10 (5 in sequence)\nFlush: +14 (5 same element) - UNLOCKS SPECIAL\nFull House: +18 (three + pair)\nFour of a Kind: +22 (four matching)\nStraight Flush: +35 (straight + flush)\nFive of a Kind: +30 (requires special relic)";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Higher hands = more powerful actions. Master them!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, tip],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.practicePair();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private practicePair(): void {
        // New progress indicator
        const progress = createProgressIndicator(this.scene, 3, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Practice: Form a Pair',
            'Two cards with matching ranks'
        );
        this.container.add(header);

        const dialogue = "Form a Pair (two cards with the same rank)\n\nSelect 5 cards total to form your hand.";

        this.scene.time.delayedCall(700, () => {
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
                            onComplete: () => this.onComplete()
                        });
                    });
                });
                this.container.add(cardInteraction);
            });
            this.container.add(dialogueBox);
        });
    }
}

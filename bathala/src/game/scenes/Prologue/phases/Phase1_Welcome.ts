import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase1_Welcome extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 1, 9);
        this.container.add(progress);

        // Phase header with subtitle
        const header = createPhaseHeader(
            this.scene,
            'Welcome, Traveler',
            'Begin your journey to master the sacred arts'
        );
        this.container.add(header);

        // Main dialogue
        const dialogue = "Welcome, traveler. This tutorial will guide you through every skill needed to survive the corrupted realms.\n\nYou may skip at any time using the button in the corner, but knowledge is your greatest weapon.\n\nAre you ready to begin your training?";

        // Delay dialogue to appear after header animation
        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                // Show a tip before transitioning
                const tip = createInfoBox(
                    this.scene,
                    'Pay close attention - the elements hold the key to victory!',
                    'tip'
                );
                this.container.add(tip);
                
                this.scene.time.delayedCall(2000, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, tip],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.onComplete();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }
}

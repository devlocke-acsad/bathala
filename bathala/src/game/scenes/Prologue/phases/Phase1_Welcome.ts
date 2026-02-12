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
        // Fade in container
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });
        
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 1, 9);
        progress.setAlpha(0);
        this.container.add(progress);

        // Phase header with subtitle
        const header = createPhaseHeader(
            this.scene,
            'Welcome, Traveler',
            'Begin your journey to master the sacred arts'
        );
        header.setAlpha(0);
        this.container.add(header);

        // Stagger fade-in of elements
        this.scene.tweens.add({
            targets: [progress, header],
            alpha: 1,
            duration: 600,
            delay: 300,
            ease: 'Power2'
        });

        // Main dialogue
        const dialogue = "Welcome, traveler. This tutorial will guide you through every skill needed to survive the corrupted realms.\n\nYou may skip at any time using the button in the corner, but knowledge is your greatest weapon.\n\nAre you ready to begin your training?";

        // Delay dialogue to appear after header animation
        this.delayedCall(900, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                // Show a tip before transitioning
                const tip = createInfoBox(
                    this.scene,
                    'Pay close attention - the elements hold the key to victory!',
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
                
                this.delayedCall(2000, () => {
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
}

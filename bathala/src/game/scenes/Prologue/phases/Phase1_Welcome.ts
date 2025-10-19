import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';

import { TutorialUI } from '../ui/TutorialUI';

export class Phase1_Welcome extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Welcome, traveler. This tutorial will teach you everything you need to survive.\n\nYou may skip at any time using the button in the corner, \nbut knowledge is your greatest weapon.";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.onComplete();
        });
        this.container.add(dialogueBox);
    }
}

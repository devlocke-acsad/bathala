import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';

import { TutorialUI } from '../ui/TutorialUI';

export class Phase2_UnderstandingCards extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Your deck contains 52 cards across four sacred elements:\n\n🔥 APOY (Fire) - 13 cards\n   Effect: Inflicts BURN damage over time\n\n💧 TUBIG (Water) - 13 cards\n   Effect: Provides HEALING\n\n🌍 LUPA (Earth) - 13 cards\n   Effect: Grants STRENGTH (increased damage)\n\n💨 HANGIN (Wind) - 13 cards\n   Effect: Grants DEXTERITY (increased block)";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.showCardValues();
        });
        this.container.add(dialogueBox);
    }

    private showCardValues(): void {
        const dialogue = "Each card has a rank from 1 to 13:\n\nNumbers: 1-10 (straightforward values)\nMandirigma (Warrior): 11\nBabaylan (Shaman): 12\nDatu (Chief): 13\n\nHigher-ranked cards create stronger hands.";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.onComplete();
        });
        this.container.add(dialogueBox);
    }
}

import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';

export class Phase10_AdvancedConcepts extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue1 = "A few final lessons:\n\nDECK-SCULPTING:\n- PURIFY (Shop): Remove cards from deck\n- ATTUNE (Rest): Upgrade card values\n- INFUSE (Elite/Boss): Add powerful cards";

        const dialogueBox1 = showDialogue(this.scene, dialogue1, () => {
            const dialogue2 = "DAY/NIGHT CYCLE:\n- Day: Neutral enemies\n- Night: Aggressive enemies, better rewards\n- Boss spawns after 5 cycles (~500 actions)";
            const dialogueBox2 = showDialogue(this.scene, dialogue2, () => {
                const dialogue3 = "THE JOURNEY:\n- Navigate the overworld\n- Choose your path\n- Grow stronger\n- Face chapter bosses\n- Restore balance";
                const dialogueBox3 = showDialogue(this.scene, dialogue3, () => {
                    this.onComplete();
                });
                this.container.add(dialogueBox3);
            });
            this.container.add(dialogueBox2);
        });
        this.container.add(dialogueBox1);
    }
}

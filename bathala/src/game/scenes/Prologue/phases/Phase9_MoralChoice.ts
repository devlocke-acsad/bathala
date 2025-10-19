import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { createButton } from '../../../ui/Button';

export class Phase9_MoralChoice extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Victory! But now, a choice defines you:\n\nSLAY: +Gold, +Power, move toward CONQUEST path\n       More gold, more aggressive enemies\n\nSPARE: +Spirit Fragments, +Lore, move toward MERCY path\n       More fragments for meta-progression, calmer enemies\n\nBALANCE: Equal mix of both choices\n         Standard experience\n\nYour choice shapes rewards - NOT difficulty.\nMake your choice:";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.presentChoice();
        });
        this.container.add(dialogueBox);
    }

    private presentChoice(): void {
        const slayButton = createButton(this.scene, this.scene.cameras.main.width / 2 - 150, 500, 'Slay', () => {
            const slayDialogue = showDialogue(this.scene, 'Your path begins. The realm remembers your judgment.', () => {
                this.onComplete();
            });
            this.container.add(slayDialogue);
        });

        const spareButton = createButton(this.scene, this.scene.cameras.main.width / 2 + 150, 500, 'Spare', () => {
            const spareDialogue = showDialogue(this.scene, 'Your path begins. The realm remembers your judgment.', () => {
                this.onComplete();
            });
            this.container.add(spareDialogue);
        });

        this.container.add([slayButton, spareButton]);
    }
}

import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { createButton } from '../../../ui/Button';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';

export class Phase5_DiscardMechanic extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Sometimes your hand lacks good combinations.\n\nDISCARD lets you redraw up to 5 cards once per combat.\nUse it wisely - you start with 1 discard charge.\n\nTry it now:";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.giveWeakHand();
        });
        this.container.add(dialogueBox);
    }

    private giveWeakHand(): void {
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

        const discardButton = createButton(this.scene, this.scene.cameras.main.width / 2, 500, 'Discard', () => {
            const discarded = this.tutorialUI.discard();
            this.tutorialUI.drawHand(discarded.length);
            this.tutorialUI.updateHandDisplay();

            const successDialogue = showDialogue(this.scene, 'Much better! Discard charges are precious - relics can increase them.', () => {
                this.onComplete();
            });
            this.container.add(successDialogue);
        });
        this.container.add(discardButton);
    }
}


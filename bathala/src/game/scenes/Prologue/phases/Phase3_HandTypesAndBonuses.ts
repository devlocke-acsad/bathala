import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { drawCards } from '../ui/CardInteraction';
import { HandEvaluator } from '../../../../utils/HandEvaluator';

import { TutorialUI } from '../ui/TutorialUI';

export class Phase3_HandTypesAndBonuses extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        const dialogue = "Hands determine your action\'s power. Here\'s the hierarchy:\n\nHigh Card: +0 (no pattern)\nPair: +2 (two matching ranks)\nTwo Pair: +4 (two pairs)\nThree of a Kind: +7 (three matching)\nStraight: +10 (5 in sequence)\nFlush: +14 (5 same element) - UNLOCKS SPECIAL\nFull House: +18 (three + pair)\nFour of a Kind: +22 (four matching)\nStraight Flush: +35 (straight + flush)\nFive of a Kind: +30 (requires special relic)";

        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.practicePair();
        });
        this.container.add(dialogueBox);
    }

    private practicePair(): void {
        const dialogue = "Form a Pair (two cards with the same rank)";
        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            const cardInteraction = drawCards(this.scene, 'pair', (selected) => {
                if (HandEvaluator.evaluateHand(selected, 'attack').type !== 'pair') {
                    const wrongHandDialogue = showDialogue(this.scene, 'Look again. A Pair requires two cards of the same rank. Try once more.', () => this.practicePair());
                    this.container.add(wrongHandDialogue);
                    return;
                }
                const successDialogue = showDialogue(this.scene, 'Well done! This grants +2 to your action.', () => {
                    this.onComplete();
                });
                this.container.add(successDialogue);
            });
            this.container.add(cardInteraction);
        });
        this.container.add(dialogueBox);
    }
}

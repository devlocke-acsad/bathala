import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase6_StatusEffects extends TutorialPhase {
    private currentSection: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        this.nextSection();
    }

    private nextSection(): void {
        this.currentSection++;
        
        if (this.currentSection > 1) {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.showNextContent();
                }
            });
        } else {
            this.showNextContent();
        }
    }

    private showNextContent(): void {
        switch (this.currentSection) {
            case 1:
                this.showBuffsIntro();
                break;
            case 2:
                this.showDebuffsIntro();
                break;
            default:
                this.onComplete();
                break;
        }
    }

    private showBuffsIntro(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 11);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Status Effects: Buffs',
            'Beneficial effects that enhance your power'
        );
        this.container.add(header);

        const dialogue = "Status effects shape battles. First, BUFFS:\n\nSTRENGTH: +[X] damage per stack\nDEXTERITY: +[X] block per stack\nBLOCK: Absorbs damage this turn (resets next turn)\n\nBuffs make you stronger! Use Lupa (Earth) Special to gain Strength.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Buffs stack up! Use them to become powerful!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(2000, () => {
                    this.nextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showDebuffsIntro(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 6, 11);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'Status Effects: Debuffs',
            'Harmful effects enemies inflict on you'
        );
        this.container.add(header);

        const dialogue = "Now DEBUFFS - enemies inflict these:\n\nWEAK: -25% damage dealt\nVULNERABLE: +50% damage taken\nBURN: [X] damage at turn end\nSTUN: Skip your next turn\nSEAL: Can't use Special abilities\n\nCleanse debuffs when possible! Some potions can help.";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Watch out for debuffs - they can turn the tide against you!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(2500, () => {
                    this.scene.tweens.add({
                        targets: this.container.getAll(),
                        alpha: 0,
                        duration: 500,
                        ease: 'Power2',
                        onComplete: () => this.onComplete()
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }
}

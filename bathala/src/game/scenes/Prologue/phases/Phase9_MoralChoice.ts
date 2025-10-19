import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { showDialogue } from '../ui/Dialogue';
import { TutorialUI } from '../ui/TutorialUI';
import { createButton } from '../../../ui/Button';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

export class Phase9_MoralChoice extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Clear any lingering cards from previous phases
        this.tutorialUI.handContainer.setVisible(false);
        this.tutorialUI.handContainer.removeAll(true);
        this.tutorialUI.cardSprites = [];
        
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 7, 9);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'The Landás System',
            'Your moral choices shape your journey'
        );
        this.container.add(header);

        const dialogue = "Victory! But now, a choice defines you:\n\n⚔️ SLAY: +Gold, +Power → CONQUEST path\n     More gold, aggressive playstyle\n\n❤️ SPARE: +Spirit Fragments, +Lore → MERCY path\n     More fragments for meta-progression\n\n⚖️ BALANCE: Equal mix of both\n     Standard experience\n\nImportant: Your choice shapes REWARDS - NOT difficulty!\nMake your choice:";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'This choice affects rewards only - difficulty adapts to your skill!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(1800, () => {
                    this.scene.tweens.add({
                        targets: [progress, header, dialogueBox, info],
                        alpha: 0,
                        duration: 400,
                        ease: 'Power2',
                        onComplete: () => {
                            this.container.removeAll(true);
                            this.presentChoice();
                        }
                    });
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private presentChoice(): void {
        // Progress indicator
        const progress = createProgressIndicator(this.scene, 7, 9);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Make Your Choice',
            'Slay for power, or spare for wisdom?'
        );
        this.container.add(header);

        this.scene.time.delayedCall(600, () => {
            // Enemy representation (defeated)
            const enemyContainer = this.scene.add.container(this.scene.cameras.main.width / 2, 340);
            
            const enemySprite = this.scene.add.text(0, -40, '👹', {
                fontFamily: 'dungeon-mode',
                fontSize: 64
            }).setOrigin(0.5).setAlpha(0.5);

            const defeatedText = this.scene.add.text(0, 40, 'Kapre Shade - Defeated', {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#77888C'
            }).setOrigin(0.5);

            enemyContainer.add([enemySprite, defeatedText]);
            this.container.add(enemyContainer);

            // Choice buttons
            const slayButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2 - 180, 
                this.scene.cameras.main.height - 120, 
                '⚔️ Slay', 
                () => this.handleChoice('slay')
            );

            const spareButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2 + 180, 
                this.scene.cameras.main.height - 120, 
                '❤️ Spare', 
                () => this.handleChoice('spare')
            );

            this.container.add([slayButton, spareButton]);
        });
    }

    private handleChoice(choice: 'slay' | 'spare'): void {
        const message = choice === 'slay' 
            ? 'You chose CONQUEST. The realm trembles at your power!'
            : 'You chose MERCY. The realm remembers your compassion!';
        
        const infoType = choice === 'slay' ? 'warning' : 'success';

        const feedback = createInfoBox(
            this.scene,
            message,
            infoType as any
        );
        this.container.add(feedback);

        this.scene.time.delayedCall(2500, () => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => this.onComplete()
            });
        });
    }
}

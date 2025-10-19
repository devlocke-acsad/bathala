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
        const progress = createProgressIndicator(this.scene, 7, 8);
        this.container.add(progress);

        // Phase header
        const header = createPhaseHeader(
            this.scene,
            'The Landás System',
            'Your moral choices shape your journey'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        const dialogue = "Victory! But now, a choice defines you:\n\nSLAY: +Gold, +Power → CONQUEST path\n     More gold, aggressive playstyle\n\nSPARE: +Spirit Fragments, +Lore → MERCY path\n     More fragments for meta-progression\n\nBALANCE: Equal mix of both\n     Standard experience\n\nImportant: Your choice shapes REWARDS - NOT difficulty!\nMake your choice:";

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
        const progress = createProgressIndicator(this.scene, 7, 8);
        this.container.add(progress);

        const header = createPhaseHeader(
            this.scene,
            'Make Your Choice',
            'Slay for power, or spare for wisdom?'
        );
        this.container.add(header);

        // Skip Phase button
        this.createSkipPhaseButton(() => {
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.onComplete();
                }
            });
        });

        this.scene.time.delayedCall(600, () => {
            // Enemy sprite display (Kapre Shade) - centered, larger size, pushed to bottom
            const enemyX = this.scene.cameras.main.width / 2;
            const enemyY = this.scene.cameras.main.height * 0.5; // Centered vertically
            
            const enemySpriteKey = 'kapre_combat'; // Kapre Shade sprite
            const enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
            
            // Scale the enemy sprite appropriately - increased size
            const targetWidth = 280;
            const targetHeight = 280;
            const scaleX = targetWidth / enemySprite.width;
            const scaleY = targetHeight / enemySprite.height;
            const finalScale = Math.min(scaleX, scaleY);
            enemySprite.setScale(finalScale);
            enemySprite.setAlpha(0.5); // Defeated/faded appearance
            
            if (enemySprite.texture) {
                enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
            }
            this.container.add(enemySprite);

            // Calculate proper Y position for name (below sprite)
            const enemySpriteScaledHeight = enemySprite.height * finalScale;
            const enemyNameY = enemyY + (enemySpriteScaledHeight / 2) + 20;

            const defeatedText = this.scene.add.text(enemyX, enemyNameY, 'Kapre Shade - Defeated', {
                fontFamily: 'dungeon-mode',
                fontSize: 24,
                color: '#77888C'
            }).setOrigin(0.5);
            this.container.add(defeatedText);

            // Choice buttons - closer together, pushed to bottom
            const slayButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2 - 120, 
                this.scene.cameras.main.height - 80, 
                'Slay', 
                () => this.handleChoice('slay')
            );

            const spareButton = createButton(
                this.scene, 
                this.scene.cameras.main.width / 2 + 120, 
                this.scene.cameras.main.height - 80, 
                'Spare', 
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

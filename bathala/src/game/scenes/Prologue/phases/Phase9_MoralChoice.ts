import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { TutorialUI } from '../ui/TutorialUI';
import { createButton } from '../../../ui/Button';
import { createPhaseHeader } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

/**
 * Custom dialogue box for Phase 9 with larger dimensions to accommodate longer text
 */
function showLargeDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);

    // Larger box dimensions for Phase 9 moral choice explanation
    const boxWidth = Math.min(scene.cameras.main.width * 0.95, 1600);
    const boxHeight = scene.cameras.main.height * 0.55; // Taller box for more text
    
    // Text should wrap INSIDE the box with padding
    const textWrapWidth = boxWidth - 120; // More padding for readability
    
    const dialogueText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#77888C',
        align: 'center',
        wordWrap: { width: textWrapWidth },
        lineSpacing: 10 // Slightly more line spacing
    }).setOrigin(0.5);

    // Background - matching intro style
    const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x150E10, 0.95).setInteractive();

    // Double border design (matching intro style)
    const outerBorder = scene.add.rectangle(0, 0, boxWidth + 8, boxHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x77888C, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, boxWidth + 2, boxHeight + 2, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.6);

    dialogueText.setText(''); // Clear text for typing effect

    // Continue indicator - using arrow symbol
    const continueIndicator = scene.add.text(0, boxHeight/2 - 40, '▼', {
        fontFamily: 'dungeon-mode',
        fontSize: 24,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.7).setVisible(false);

    dialogueContainer.add([bg, outerBorder, innerBorder, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(2000);

    // Fade in with scale animation
    dialogueContainer.setAlpha(0).setScale(0.95);
    scene.tweens.add({ 
        targets: dialogueContainer, 
        alpha: 1, 
        scale: 1,
        duration: 500, 
        ease: 'Back.easeOut'
    });

    let typingComplete = false;
    let typingTimer: Phaser.Time.TimerEvent | null = null;

    const typeText = (textObject: Phaser.GameObjects.Text, text: string): Promise<void> => {
        if (typingTimer) typingTimer.remove();
        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }
            textObject.setText('');
            let charIndex = 0;
            typingTimer = scene.time.addEvent({
                delay: 25,
                callback: () => {
                    if (!textObject || !textObject.active) {
                        if (typingTimer) {
                            typingTimer.remove();
                            typingTimer = null;
                        }
                        resolve();
                        return;
                    }
                    const currentText = textObject.text || '';
                    textObject.setText(currentText + text[charIndex++]);
                    if (charIndex === text.length) {
                        typingTimer = null;
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }

    typeText(dialogueText, text).then(() => {
        typingComplete = true;
        continueIndicator.setVisible(true).setAlpha(0);
        scene.tweens.add({ 
            targets: continueIndicator, 
            alpha: 1,
            y: '+=10', 
            duration: 800, 
            yoyo: true, 
            repeat: -1, 
            ease: 'Sine.easeInOut' 
        });
    });

    bg.on('pointerdown', () => {
        if (!typingComplete) {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            dialogueText.setText(text);
            typingComplete = true;
            continueIndicator.setVisible(true).setAlpha(0);
            scene.tweens.add({ 
                targets: continueIndicator, 
                alpha: 1,
                y: '+=10', 
                duration: 800, 
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' 
            });
        } else {
            if (typingTimer) typingTimer.remove();
            scene.tweens.killTweensOf(continueIndicator);
            bg.removeAllListeners('pointerdown');
            scene.tweens.add({ 
                targets: dialogueContainer, 
                alpha: 0,
                scale: 0.95,
                duration: 400, 
                ease: 'Power2', 
                onComplete: () => { 
                    dialogueContainer.destroy(); 
                    onComplete(); 
                } 
            });
        }
    });

    return dialogueContainer;
}

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
        const progress = createProgressIndicator(this.scene, 8, 9);
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

        const dialogue = "Victory! But now, a choice defines you:\n\nSLAY: The path of dominion beckons...\n     Power flows to those who seize it.\n     Gold and strength await the ruthless.\n\nSPARE: The path of wisdom whispers...\n     Knowledge endures beyond death.\n     Fragments of ancient truths await the merciful.\n\nEach path offers its own rewards.\nYour choice echoes through the realm.\nChoose wisely, for the spirits remember...";

        this.scene.time.delayedCall(700, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'The spirits watch your choices, but judge only your heart - not your skill.',
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
        const progress = createProgressIndicator(this.scene, 8, 9);
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

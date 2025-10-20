import { Scene } from 'phaser';
import { TutorialPhase } from './TutorialPhase';
import { TutorialUI } from '../ui/TutorialUI';
import { createPhaseHeader, createSectionDivider } from '../ui/PhaseHeader';
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createInfoBox } from '../ui/InfoBox';

/**
 * Custom dialogue box for Phase 10 with larger dimensions for advanced concepts
 */
function showLargeDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);

    // Larger box dimensions for Phase 10 advanced concepts
    const boxWidth = Math.min(scene.cameras.main.width * 0.95, 1600);
    const boxHeight = scene.cameras.main.height * 0.58; // Taller for more content
    
    // Text should wrap INSIDE the box with padding
    const textWrapWidth = boxWidth - 120;
    
    const dialogueText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#77888C',
        align: 'center',
        wordWrap: { width: textWrapWidth },
        lineSpacing: 10
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

export class Phase10_AdvancedConcepts extends TutorialPhase {
    private sectionIndex: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // Clear any lingering cards from previous phases
        this.tutorialUI.handContainer.setVisible(false);
        this.tutorialUI.handContainer.removeAll(true);
        this.tutorialUI.cardSprites = [];
        
        // Skip Phase button (add early so it persists through sections)
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
        
        this.showNextSection();
    }

    private showNextSection(): void {
        this.sectionIndex++;
        
        if (this.sectionIndex > 3) {
            this.onComplete();
            return;
        }

        // Clear previous
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                
                // Progress indicator
                const progress = createProgressIndicator(this.scene, 8, 8);
                this.container.add(progress);

                switch (this.sectionIndex) {
                    case 1:
                        this.showDeckSculpting(progress);
                        break;
                    case 2:
                        this.showDayNightCycle(progress);
                        break;
                    case 3:
                        this.showJourney(progress);
                        break;
                }
            }
        });
    }

    private showDeckSculpting(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Advanced: Deck-Sculpting',
            'Shape your deck throughout your journey'
        );
        this.container.add(header);

        const dialogue = "Master deck-sculpting to grow stronger:\n\nPURIFY (Shop): Remove unwanted cards\n     Slim down your deck for consistency\n\nATTUNE (Rest Sites): Upgrade card values\n     Make your cards more powerful\n\nINFUSE (Obtain rarely from Elites/Bosses): Add powerful cards\n     Expand your arsenal with rare cards\n\nA lean, upgraded deck is key to victory!";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                const tip = createInfoBox(
                    this.scene,
                    'Quality over quantity - a small, focused deck is often best!',
                    'tip'
                );
                this.container.add(tip);

                this.scene.time.delayedCall(2500, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showDayNightCycle(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Advanced: Day/Night Cycle',
            'Time affects the dangers you face'
        );
        this.container.add(header);

        const dialogue = "The realm cycles between day and night:\n\nDAY (50 actions):\n   • Neutral, standard enemies\n   • Safer exploration\n   • Normal rewards\n\nNIGHT (50 actions):\n   • Aggressive, dangerous enemies\n   • Higher risk encounters\n   • Better rewards!\n\nBOSS: Appears after 5 complete cycles (~500 actions)";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                const info = createInfoBox(
                    this.scene,
                    'Risk vs reward - night is dangerous but lucrative!',
                    'info'
                );
                this.container.add(info);

                this.scene.time.delayedCall(2500, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private showJourney(progress: Phaser.GameObjects.Container): void {
        const header = createPhaseHeader(
            this.scene,
            'Your Journey Begins',
            'Restore balance to the corrupted realms'
        );
        this.container.add(header);

        const dialogue = "THE PATH AHEAD:\n\nNavigate the overworld\n   Choose your route carefully\n\nGrow stronger\n   Collect relics, upgrade cards, master combos\n\nFace the corruption\n   Three realms writhe under dark influence...\n   • Ancient groves twisted by hexes and deception\n   • Sunken depths where a great hunger stirs\n   • A sky citadel where false divinity reigns\n\nRestore balance\n   The spirits cry out for salvation!";

        this.scene.time.delayedCall(600, () => {
            const dialogueBox = showLargeDialogue(this.scene, dialogue, () => {
                const success = createInfoBox(
                    this.scene,
                    'You are ready. The corrupted realms await your judgment.',
                    'success'
                );
                this.container.add(success);

                this.scene.time.delayedCall(3000, () => {
                    this.showNextSection();
                });
            });
            this.container.add(dialogueBox);
        });
    }
}

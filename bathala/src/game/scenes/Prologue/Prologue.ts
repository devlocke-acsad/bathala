import { Scene, GameObjects } from 'phaser';
import { TutorialManager } from './TutorialManager';
import { createButton } from '../../ui/Button';

export class Prologue extends Scene {
    private isStoryPhase: boolean = true;
    private tutorialContainer: GameObjects.Container;
    private skipButton: GameObjects.Container;
    private typingTimer: Phaser.Time.TimerEvent | null = null;


    constructor() {
        super('Prologue');
    }

    create() {
        if (this.cameras.main) {
            this.cameras.main.setBackgroundColor(0x000000);
        }
        
        // Add cleanup when scene shuts down
        this.events.once('shutdown', () => {
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
        });
        
        this.startStoryPhase();
    }

    // --- STORY PHASE --- //

    private startStoryPhase() {
        this.isStoryPhase = true;
        const slides = [
            "In the age before memory, when the world was still young...\n\nBathala shaped the heavens with his breath.\n\nAmihan wove the seas with her song.",
            "From their divine union, the islands were born.\n\nA paradise where anito—spirits of wind, water, earth, and flame—danced in perfect harmony.\n\nBalance was law. Kapwa was sacred.",
            "But in shadow, envy festered.\n\nThe engkanto—spirits of lies and illusion—whispered poison into willing ears.\n\nThey twisted truth. Corrupted bonds. Shattered the sacred balance.",
            "Brother turned against brother.\n\nThe elements warred.\n\nHarmony bled into chaos.",
            "The elders spoke of one who would come.\n\nOne who would walk between worlds.\n\nOne who would restore what was broken.",
            "You are that one.\n\nThe sacred deck is yours to master—each card a channel of elemental power.\n\nApoy's fury. Tubig's grace. Lupa's strength. Hangin's swiftness.",
            "Form hands. Strike true. Choose wisely.\n\nFor in your judgment lies the fate of all.",
            "The corrupted await.\n\nThe balance trembles.\n\nYour journey begins now."
        ];
        let currentSlide = 0;

        // Create space key for keyboard input
        const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add background image
        const introBgImage = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'chap1_no_leaves_boss');
        
        // Scale the background to cover the screen
        const scaleX = this.cameras.main.width / introBgImage.width;
        const scaleY = this.cameras.main.height / introBgImage.height;
        const scale = Math.max(scaleX, scaleY);
        introBgImage.setScale(scale);
        
        // Add 90% opacity overlay with #150E10
        const introOverlay = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.90);

        // Text occupies 60% of screen width, centered vertically
        const displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 24, 
            color: '#77888C', 
            align: 'center', 
            wordWrap: { width: this.cameras.main.width * 0.6 }, // 60% of screen width
            lineSpacing: 12
        }).setOrigin(0.5);
        
        const controlsText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.92, 'Click or press SPACE to continue', { 
            fontFamily: 'dungeon-mode', 
            fontSize: 18, 
            color: '#77888C', 
            align: 'center',
            alpha: 0.7
        }).setOrigin(0.5);

        const storyElements = [introBgImage, introOverlay, displayedText, controlsText];

        const transitionToTutorial = () => {
            if (!this.isStoryPhase) return; // Prevent double transition
            this.isStoryPhase = false;
            
            // Clean up typing timer before destroying elements
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
            
            this.input.off('pointerdown', showNextSlide);
            if (spaceKey) {
                spaceKey.off('down', showNextSlide);
            }

            // Enhanced transition effect
            this.tweens.add({
                targets: displayedText,
                alpha: 0,
                y: displayedText.y - 50,
                duration: 600,
                ease: 'Power2'
            });
            
            this.tweens.add({
                targets: [controlsText, this.skipButton],
                alpha: 0,
                duration: 400,
                ease: 'Power2'
            });
            
            this.tweens.add({
                targets: introOverlay,
                alpha: 0.9,
                duration: 800,
                ease: 'Power2'
            });

            this.time.delayedCall(800, () => {
                storyElements.forEach(el => el.destroy());
                if (this.skipButton && this.skipButton.active) this.skipButton.destroy();
                
                // Fade in tutorial
                this.cameras.main.fadeIn(600, 21, 14, 16); // #150E10 in RGB
                this.time.delayedCall(300, () => {
                    const tutorialManager = new TutorialManager(this);
                    tutorialManager.start();
                });
            });
        };

        const skipCallback = () => {
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
            this.tweens.killTweensOf(storyElements);
            transitionToTutorial();
        };

        // Position skip button same as tutorial - bottom right
        const skipButtonX = this.cameras.main.width * 0.88; // 88% from left (12% margin from right)
        const skipButtonY = this.cameras.main.height * 0.92; // 92% from top (8% from bottom)
        this.skipButton = createButton(this, skipButtonX, skipButtonY, 'Skip Intro', skipCallback);
        this.skipButton.setAlpha(0);

        const showNextSlide = () => {
            if (!this.isStoryPhase) return;
            if (currentSlide >= slides.length) {
                transitionToTutorial();
                return;
            }

            // Fade out current text
            if (currentSlide > 0) {
                this.tweens.add({
                    targets: displayedText,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        displayedText.setText('');
                        displayedText.setAlpha(1);
                        this.typeText(displayedText, slides[currentSlide++]);
                    }
                });
            } else {
                this.typeText(displayedText, slides[currentSlide++]);
            }

            this.tweens.add({ targets: [this.skipButton, controlsText], alpha: 1, duration: 500, ease: 'Power2' });
        };

        this.input.on('pointerdown', showNextSlide);
        if (spaceKey) {
            spaceKey.on('down', showNextSlide);
        }
        showNextSlide();
    }

    private typeText(textObject: GameObjects.Text, text: string): Promise<void> {
        if (this.typingTimer) this.typingTimer.remove();
        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }
            textObject.setText('');
            let charIndex = 0;
            this.typingTimer = this.time.addEvent({
                delay: 30,
                callback: () => {
                    if (!textObject || !textObject.active) {
                        if (this.typingTimer) {
                            this.typingTimer.remove();
                            this.typingTimer = null;
                        }
                        resolve();
                        return;
                    }
                    const currentText = textObject.text || '';
                    textObject.setText(currentText + text[charIndex++]);
                    if (charIndex === text.length) {
                        this.typingTimer = null;
                        resolve();
                    }
                },
                repeat: text.length - 1
            });
        });
    }


}

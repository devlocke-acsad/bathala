import { Scene, GameObjects } from 'phaser';
import { Phase1_Welcome } from './phases/Phase1_Welcome';
import { Phase2_UnderstandingCards } from './phases/Phase2_UnderstandingCards';
import { Phase3_HandTypesAndBonuses } from './phases/Phase3_HandTypesAndBonuses';
import { Phase4_CombatActions } from './phases/Phase4_CombatActions';
import { Phase5_DiscardMechanic } from './phases/Phase5_DiscardMechanic';
import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';
import { Phase7_Items } from './phases/Phase7_Items';
// import { Phase8_EnemyIntents } from './phases/Phase8_EnemyIntents'; // REMOVED - Intents deferred
import { Phase9_MoralChoice } from './phases/Phase9_MoralChoice';
import { Phase10_AdvancedConcepts } from './phases/Phase10_AdvancedConcepts';
// import { Phase11_FinalTrial } from './phases/Phase11_FinalTrial'; // REMOVED - Transition directly to game
import { createButton } from '../../ui/Button';
import { TutorialUI } from './ui/TutorialUI';

export class TutorialManager {
    private scene: Scene;
    private container: GameObjects.Container;
    private bgContainer: GameObjects.Container;
    private phases: any[];
    private currentPhaseIndex: number;
    private skipButton: GameObjects.Container;
    private skipPhaseButton: GameObjects.Container;
    private helpButton: GameObjects.Container;
    private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
    private tutorialUI!: TutorialUI;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = this.scene.add.container(0, 0);
        this.bgContainer = this.scene.add.container(0, 0);
        this.currentPhaseIndex = 0;
    }

    public start() {
        // Enhanced background with parallax effect
        const bg = this.scene.add.image(
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2, 
            'chap1_no_leaves_boss'
        );
        const scaleX = this.scene.cameras.main.width / bg.width;
        const scaleY = this.scene.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale * 1.05); // Slightly larger for parallax effect
        
        // Layered overlays for depth
        const overlay1 = this.scene.add.rectangle(
            0,
            0,
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height, 
            0x150E10
        ).setOrigin(0, 0).setAlpha(0.85);

        this.bgContainer.add([bg, overlay1]);

        // Subtle parallax scrolling on background
        this.scene.tweens.add({
            targets: bg,
            x: bg.x + 20,
            y: bg.y - 10,
            duration: 60000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add ambient particle effects
        if (this.scene.add.particles) {
            try {
                // Create a simple graphics texture for particles
                const graphics = this.scene.add.graphics();
                graphics.fillStyle(0x77888C, 0.6);
                graphics.fillCircle(2, 2, 2);
                graphics.generateTexture('particle', 4, 4);
                graphics.destroy();

                const emitter = this.scene.add.particles(0, 0, 'particle', {
                    x: { min: 0, max: this.scene.cameras.main.width },
                    y: { min: -50, max: 0 },
                    lifespan: 8000,
                    speedY: { min: 20, max: 50 },
                    speedX: { min: -10, max: 10 },
                    scale: { start: 0.3, end: 0 },
                    alpha: { start: 0.4, end: 0 },
                    frequency: 300,
                    blendMode: 'ADD'
                });
                this.particles = emitter;
                this.bgContainer.add(emitter);
            } catch (e) {
                console.warn('Particle system not available');
            }
        }

        // Enhanced skip button with hover effects (bottom right)
        const skipButtonX = this.scene.cameras.main.width * 0.88;
        const skipButtonY = this.scene.cameras.main.height * 0.92;
        const buttonWidth = 300; // Larger width to prevent text wrapping
        this.skipButton = createButton(
            this.scene, 
            skipButtonX, 
            skipButtonY, 
            'Skip Tutorial', 
            () => this.confirmSkip(),
            buttonWidth
        );
        
        // Add Skip Phase button (bottom right, above Skip Tutorial)
        const skipPhaseButtonX = this.scene.cameras.main.width * 0.88;
        const skipPhaseButtonY = this.scene.cameras.main.height * 0.85; // Above Skip Tutorial
        this.skipPhaseButton = createButton(
            this.scene, 
            skipPhaseButtonX, 
            skipPhaseButtonY, 
            'Skip Phase', 
            () => this.skipCurrentPhase(),
            buttonWidth // Same fixed width for uniformity
        );
        
        // Add Help/Navigation button (top right) - aligned with skip buttons
        const helpButtonX = this.scene.cameras.main.width * 0.94; // Further right, aligned with skip buttons
        const helpButtonY = this.scene.cameras.main.height * 0.08;
        this.helpButton = createButton(
            this.scene,
            helpButtonX,
            helpButtonY,
            'ℹ',
            () => this.showPhaseNavigation(),
            80 // Smaller width for just the icon
        );
        
        // Don't add buttons to container - add them directly to scene so they're always visible
        
        // Ensure buttons are always visible at top depth - add to scene directly
        this.skipButton.setDepth(5000);
        this.skipPhaseButton.setDepth(5000);
        this.helpButton.setDepth(5000);
        
        // Make sure buttons are always visible
        this.skipButton.setAlpha(1);
        this.skipPhaseButton.setAlpha(1);
        this.helpButton.setAlpha(1);

        this.tutorialUI = new TutorialUI(this.scene);
        const tutorialUI = this.tutorialUI;

        this.phases = [
            new Phase1_Welcome(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase2_UnderstandingCards(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase3_HandTypesAndBonuses(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase4_CombatActions(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase5_DiscardMechanic(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase6_StatusEffects(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase7_Items(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            // Phase8_EnemyIntents - Removed (intents deferred)
            new Phase9_MoralChoice(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase10_AdvancedConcepts(this.scene, tutorialUI, this.completeTutorial.bind(this))
            // Phase11_FinalTrial - Removed (transition directly to game)
        ];
        
        // Fade in everything
        this.container.setAlpha(0);
        this.bgContainer.setAlpha(0);
        
        this.scene.tweens.add({
            targets: this.bgContainer,
            alpha: 1,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.container,
                    alpha: 1,
                    duration: 600,
                    ease: 'Power2',
                    onComplete: () => {
                        this.startNextPhase();
                    }
                });
            }
        });
    }

    private confirmSkip() {
        // Create confirmation dialogue
        const confirmContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );

        const bg = this.scene.add.rectangle(0, 0, 500, 250, 0x150E10, 0.98);
        
        // Double border design
        const outerBorder = this.scene.add.rectangle(0, 0, 508, 258, undefined, 0)
            .setStrokeStyle(3, 0xFF6B35, 0.8);
        const innerBorder = this.scene.add.rectangle(0, 0, 502, 252, undefined, 0)
            .setStrokeStyle(2, 0x77888C, 0.6);

        const warningText = this.scene.add.text(0, -60, 'Skip Tutorial?', {
            fontFamily: 'dungeon-mode',
            fontSize: 32,
            color: '#77888C',
            align: 'center'
        }).setOrigin(0.5);

        const descText = this.scene.add.text(0, -10, 'You will miss important lessons.\nAre you sure you want to skip?', {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#77888C',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setAlpha(0.8);

        const yesButton = createButton(this.scene, -100, 60, 'Yes, Skip', () => {
            confirmContainer.destroy();
            this.endTutorial(true);
        });

        const noButton = createButton(this.scene, 100, 60, 'Continue', () => {
            this.scene.tweens.add({
                targets: confirmContainer,
                alpha: 0,
                scale: 0.9,
                duration: 300,
                ease: 'Power2',
                onComplete: () => confirmContainer.destroy()
            });
        });

        confirmContainer.add([outerBorder, bg, innerBorder, warningText, descText, yesButton, noButton]);
        confirmContainer.setDepth(3000).setAlpha(0).setScale(0.9);

        this.scene.tweens.add({
            targets: confirmContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    private skipCurrentPhase() {
        // Use the standardized cleanup helper (handles shutdown, event listeners, handContainer, etc.)
        this.cleanupCurrentPhase();
        
        // Show brief notification
        const notification = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height * 0.3,
            'Phase Skipped',
            {
                fontFamily: 'dungeon-mode',
                fontSize: 28,
                color: '#FFAA00',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(2500);

        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: notification.y - 20,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.scene.time.delayedCall(600, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => notification.destroy()
                    });
                });
            }
        });

        // Move to next phase with proper delay
        this.scene.time.delayedCall(1000, () => {
            this.startNextPhase();
        });
    }

    private showPhaseNavigation() {
        // Create phase navigation menu
        const navContainer = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2
        );

        const menuWidth = 550;
        const menuHeight = 740; // Increased to accommodate larger gaps

        const bg = this.scene.add.rectangle(0, 0, menuWidth, menuHeight, 0x150E10, 0.98);
        
        // Double border design
        const outerBorder = this.scene.add.rectangle(0, 0, menuWidth + 8, menuHeight + 8, undefined, 0)
            .setStrokeStyle(3, 0x77888C, 0.8);
        const innerBorder = this.scene.add.rectangle(0, 0, menuWidth + 2, menuHeight + 2, undefined, 0)
            .setStrokeStyle(2, 0x556065, 0.6);

        const titleText = this.scene.add.text(0, -menuHeight/2 + 50, 'Phase Navigation', {
            fontFamily: 'dungeon-mode',
            fontSize: 32,
            color: '#77888C',
            align: 'center'
        }).setOrigin(0.5);

        const currentPhaseText = this.scene.add.text(0, -menuHeight/2 + 95, `Current: Phase ${this.currentPhaseIndex}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#FFAA00',
            align: 'center'
        }).setOrigin(0.5);

        navContainer.add([outerBorder, bg, innerBorder, titleText, currentPhaseText]);

        // Phase names
        const phaseNames = [
            'Welcome',
            'Understanding Cards',
            'Hand Types & Bonuses',
            'Combat Actions',
            'Discard Mechanic',
            'Status Effects & Elements',
            'Items (Relics & Potions)',
            'Moral Choice (Landás)',
            'Advanced Concepts'
        ];

        // Create phase buttons - single column, more compact
        const buttonWidth = 450;
        const buttonHeight = 45;
        const buttonSpacing = 64; // Further increased gap between buttons
        const startY = -menuHeight/2 + 150; // More space from top

        phaseNames.forEach((phaseName, index) => {
            const y = startY + (index * buttonSpacing);

            // Highlight current phase
            if (index === this.currentPhaseIndex - 1) {
                const highlight = this.scene.add.rectangle(0, y, buttonWidth + 10, buttonHeight, 0xFFAA00, 0.2);
                navContainer.add(highlight);
            }

            const phaseButton = createButton(
                this.scene,
                0,
                y,
                `${index + 1}. ${phaseName}`,
                () => this.jumpToPhase(index, navContainer),
                buttonWidth
            );

            navContainer.add(phaseButton);
        });

        // Close button
        const closeButton = createButton(
            this.scene,
            0,
            menuHeight/2 - 48, // More space from bottom
            'Close',
            () => {
                this.scene.tweens.add({
                    targets: navContainer,
                    alpha: 0,
                    scale: 0.9,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => navContainer.destroy()
                });
            }
        );

        navContainer.add(closeButton);
        navContainer.setDepth(6000).setAlpha(0).setScale(0.9);

        this.scene.tweens.add({
            targets: navContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    /**
     * Properly clean up the currently active phase.
     * Calls phase-specific cleanup methods (shutdown/cleanup) and resets the phase for potential re-entry.
     */
    private cleanupCurrentPhase(): void {
        const currentPhase = this.phases[this.currentPhaseIndex - 1];
        if (!currentPhase) return;
        
        // Call phase-specific cleanup methods (shutdown handles event listeners, etc.)
        if (currentPhase.shutdown && typeof currentPhase.shutdown === 'function') {
            currentPhase.shutdown();
        } else if (currentPhase.cleanup && typeof currentPhase.cleanup === 'function') {
            currentPhase.cleanup();
        }
        
        // Ensure container is cleaned up even if phase methods missed something
        if (currentPhase.container && currentPhase.container.active) {
            this.scene.tweens.killTweensOf(currentPhase.container);
            currentPhase.container.getAll().forEach((child: any) => {
                this.scene.tweens.killTweensOf(child);
            });
            currentPhase.container.removeAll(true);
            currentPhase.container.setAlpha(0);
        }
        
        // Hide shared TutorialUI elements that live outside phase containers
        if (this.tutorialUI) {
            if (this.tutorialUI.handContainer) {
                this.scene.tweens.killTweensOf(this.tutorialUI.handContainer);
                this.tutorialUI.handContainer.setVisible(false);
                this.tutorialUI.handContainer.setAlpha(0);
            }
        }
        
        // Reset the phase so it can be re-entered later
        if (currentPhase.reset && typeof currentPhase.reset === 'function') {
            currentPhase.reset();
        }
    }

    private jumpToPhase(phaseIndex: number, navContainer: GameObjects.Container) {
        // Close navigation menu
        this.scene.tweens.add({
            targets: navContainer,
            alpha: 0,
            scale: 0.9,
            duration: 300,
            ease: 'Power2',
            onComplete: () => navContainer.destroy()
        });

        // Properly clean up the current phase (calls shutdown/cleanup, removes event listeners, hides hand)
        this.cleanupCurrentPhase();

        // Set index so startNextPhase picks up the right phase
        // startNextPhase does phases[currentPhaseIndex++], so set to target index
        this.currentPhaseIndex = phaseIndex;
        
        // Reset the TARGET phase for re-entry (in case it was previously visited)
        const targetPhase = this.phases[phaseIndex];
        if (targetPhase && targetPhase.reset && typeof targetPhase.reset === 'function') {
            targetPhase.reset();
        }
        
        // Show notification
        const notification = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height * 0.3,
            `Jumping to Phase ${phaseIndex + 1}`,
            {
                fontFamily: 'dungeon-mode',
                fontSize: 28,
                color: '#77DD77',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(2500);

        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: notification.y - 20,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.scene.time.delayedCall(800, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => notification.destroy()
                    });
                });
            }
        });

        // Start the selected phase (skip cleanup in startNextPhase since we already did it)
        this.scene.time.delayedCall(500, () => {
            this.startPhaseDirectly();
        });
    }

    /**
     * Advance to the next phase. Called by phases when they complete (onComplete callback)
     * and by skipCurrentPhase(). Handles cleanup of the previous phase.
     */
    private startNextPhase() {
        if (this.currentPhaseIndex < this.phases.length) {
            // Clean up previous phase properly using the standardized cleanup helper
            this.cleanupCurrentPhase();
            
            const phase = this.phases[this.currentPhaseIndex++];
            
            // Skip phase button is always visible
            this.skipPhaseButton.setVisible(true);
            
            // Subtle transition - remove flash, use gentle fade
            this.scene.time.delayedCall(400, () => {
                // Start phase with container at 0 alpha
                if (phase.container) {
                    phase.container.setAlpha(0);
                }
                
                phase.start();
                
                // Fade in new phase
                this.scene.time.delayedCall(100, () => {
                    if (phase.container && phase.container.active) {
                        this.scene.tweens.add({
                            targets: phase.container,
                            alpha: 1,
                            duration: 500,
                            ease: 'Power2'
                        });
                    }
                });
            });
        } else {
            this.endTutorial();
        }
    }

    /**
     * Start the phase at currentPhaseIndex directly, WITHOUT cleaning up a previous phase.
     * Used by jumpToPhase() which handles its own cleanup separately.
     */
    private startPhaseDirectly() {
        if (this.currentPhaseIndex < this.phases.length) {
            const phase = this.phases[this.currentPhaseIndex++];
            
            // Skip phase button is always visible
            this.skipPhaseButton.setVisible(true);
            
            // Subtle transition - use gentle fade
            this.scene.time.delayedCall(400, () => {
                // Start phase with container at 0 alpha
                if (phase.container) {
                    phase.container.setAlpha(0);
                }
                
                phase.start();
                
                // Fade in new phase
                this.scene.time.delayedCall(100, () => {
                    if (phase.container && phase.container.active) {
                        this.scene.tweens.add({
                            targets: phase.container,
                            alpha: 1,
                            duration: 500,
                            ease: 'Power2'
                        });
                    }
                });
            });
        } else {
            this.endTutorial();
        }
    }

    /**
     * Complete tutorial and transition to main game
     */
    private completeTutorial() {
        // Clear phase containers
        this.scene.children.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Container) {
                child.removeAll(true);
            }
        });

        // Completion message
        const { width, height } = this.scene.cameras.main;
        
        // Add background image (same as used throughout prologue)
        const completionBg = this.scene.add.image(
            width / 2,
            height / 2,
            'chap1_no_leaves_boss'
        );
        const scaleX = width / completionBg.width;
        const scaleY = height / completionBg.height;
        const scale = Math.max(scaleX, scaleY);
        completionBg.setScale(scale).setDepth(2900).setAlpha(0);
        
        // Add overlay (matching prologue style)
        const completionOverlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x150E10
        ).setAlpha(0).setDepth(2950);
        
        const completionText = this.scene.add.text(
            width / 2,
            height / 2 - 100,
            'Tutorial Complete!',
            {
                fontFamily: 'dungeon-mode',
                fontSize: 48,
                color: '#FFD700',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(3000);

        const messageText = this.scene.add.text(
            width / 2,
            height / 2 + 20,
            'You have learned the ways of the Babaylan.\n\nThe corrupted realms await your judgment.\n\nRestore balance to the sacred lands!',
            {
                fontFamily: 'dungeon-mode',
                fontSize: 26,
                color: '#77888C',
                align: 'center',
                wordWrap: { width: width * 0.65 },
                lineSpacing: 8
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(3000);

        const readyText = this.scene.add.text(
            width / 2,
            height / 2 + 160,
            'Click anywhere to begin your journey...',
            {
                fontFamily: 'dungeon-mode',
                fontSize: 22,
                color: '#FFAA00',
                align: 'center'
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(3000);

        // Fade in background first
        this.scene.tweens.add({
            targets: completionBg,
            alpha: 1,
            duration: 800,
            ease: 'Power2'
        });

        this.scene.tweens.add({
            targets: completionOverlay,
            alpha: 0.92,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Then fade in text with stagger
                this.scene.tweens.add({
                    targets: [completionText, messageText, readyText],
                    alpha: 1,
                    duration: 1000,
                    ease: 'Power2',
                    stagger: 300
                });

                // Pulse ready text
                this.scene.tweens.add({
                    targets: readyText,
                    alpha: 0.6,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Click to continue with enhanced transition
        this.scene.input.once('pointerdown', () => {
            // Stop the pulsing animation on ready text
            this.scene.tweens.killTweensOf(readyText);
            
            // Fade out all text quickly
            this.scene.tweens.add({
                targets: [completionText, messageText, readyText],
                alpha: 0,
                duration: 400,
                ease: 'Power2.easeOut'
            });

            // Wait for text to fade before starting background transition
            this.scene.time.delayedCall(400, () => {
                // Fade background and overlay together
                this.scene.tweens.add({
                    targets: [completionBg, completionOverlay],
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2.easeInOut',
                    onComplete: () => {
                        completionText.destroy();
                        messageText.destroy();
                        readyText.destroy();
                        completionBg.destroy();
                        completionOverlay.destroy();
                        this.endTutorial();
                    }
                });
            });
        });
    }

    private endTutorial(_skipped = false) {
        if (this.particles) {
            this.particles.stop();
        }

        const { width, height } = this.scene.cameras.main;

        // Create a fade overlay that starts transparent
        const fadeOverlay = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000
        ).setDepth(4000).setAlpha(0);

        // Smooth fade to black
        this.scene.tweens.add({
            targets: fadeOverlay,
            alpha: 1,
            duration: 1000,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                // Clean up all containers
                if (this.container) {
                    this.container.removeAll(true);
                    this.container.destroy();
                }
                if (this.bgContainer) {
                    this.bgContainer.removeAll(true);
                    this.bgContainer.destroy();
                }
                
                // Keep the black screen for a moment before transitioning
                this.scene.time.delayedCall(300, () => {
                    // Start the overworld scene
                    this.scene.scene.start('Overworld');
                    
                    // The fade overlay will be destroyed when the scene changes
                    fadeOverlay.destroy();
                });
            }
        });
    }
}

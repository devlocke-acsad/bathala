import { Scene, GameObjects } from 'phaser';
import { Phase1_Welcome } from './phases/Phase1_Welcome';
import { Phase2_UnderstandingCards } from './phases/Phase2_UnderstandingCards';
import { Phase3_HandTypesAndBonuses } from './phases/Phase3_HandTypesAndBonuses';
import { Phase4_CombatActions } from './phases/Phase4_CombatActions';
import { Phase5_DiscardMechanic } from './phases/Phase5_DiscardMechanic';
import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';
import { Phase7_Items } from './phases/Phase7_Items';
import { Phase8_EnemyIntents } from './phases/Phase8_EnemyIntents';
import { Phase9_MoralChoice } from './phases/Phase9_MoralChoice';
import { Phase10_AdvancedConcepts } from './phases/Phase10_AdvancedConcepts';
import { Phase11_FinalTrial } from './phases/Phase11_FinalTrial';
import { createButton } from '../../ui/Button';
import { TutorialUI } from './ui/TutorialUI';

export class TutorialManager {
    private scene: Scene;
    private container: GameObjects.Container;
    private bgContainer: GameObjects.Container;
    private phases: any[];
    private currentPhaseIndex: number;
    private skipButton: GameObjects.Container;
    private particles?: Phaser.GameObjects.Particles.ParticleEmitter;

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
            this.scene.cameras.main.width / 2, 
            this.scene.cameras.main.height / 2, 
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height, 
            0x150E10
        ).setAlpha(0.85);
        
        const overlay2 = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2, 
            0, 
            this.scene.cameras.main.width, 
            this.scene.cameras.main.height * 0.3, 
            0x000000
        ).setAlpha(0.4).setOrigin(0.5, 0);

        this.bgContainer.add([bg, overlay1, overlay2]);

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

        // Enhanced skip button with hover effects
        const skipButtonX = this.scene.cameras.main.width * 0.88;
        const skipButtonY = this.scene.cameras.main.height * 0.92;
        this.skipButton = createButton(
            this.scene, 
            skipButtonX, 
            skipButtonY, 
            'Skip Tutorial', 
            () => this.confirmSkip()
        );
        
        // Add glow to skip button
        const skipGlow = this.scene.add.circle(skipButtonX, skipButtonY, 80, 0xFFFFFF, 0.05)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.scene.tweens.add({
            targets: skipGlow,
            alpha: 0.15,
            scale: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.container.add([skipGlow, this.skipButton]);

        const tutorialUI = new TutorialUI(this.scene);

        this.phases = [
            new Phase1_Welcome(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase2_UnderstandingCards(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase3_HandTypesAndBonuses(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase4_CombatActions(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase5_DiscardMechanic(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase6_StatusEffects(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase7_Items(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase8_EnemyIntents(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase9_MoralChoice(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase10_AdvancedConcepts(this.scene, tutorialUI, this.startNextPhase.bind(this)),
            new Phase11_FinalTrial(this.scene, tutorialUI, this.startNextPhase.bind(this))
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

        const bg = this.scene.add.rectangle(0, 0, 500, 250, 0x1A1215, 0.98);
        const border1 = this.scene.add.rectangle(0, 0, 506, 256, undefined, 0)
            .setStrokeStyle(3, 0xFF6B35);
        const border2 = this.scene.add.rectangle(0, 0, 500, 250, undefined, 0)
            .setStrokeStyle(2, 0x77888C);

        const warningText = this.scene.add.text(0, -60, '⚠️ Skip Tutorial?', {
            fontFamily: 'dungeon-mode',
            fontSize: 32,
            color: '#E8E8E8',
            align: 'center'
        }).setOrigin(0.5);

        const descText = this.scene.add.text(0, -10, 'You will miss important lessons.\nAre you sure you want to skip?', {
            fontFamily: 'dungeon-mode',
            fontSize: 18,
            color: '#99A0A5',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

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

        confirmContainer.add([border1, bg, border2, warningText, descText, yesButton, noButton]);
        confirmContainer.setDepth(3000).setAlpha(0).setScale(0.9);

        this.scene.tweens.add({
            targets: confirmContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
    }

    private startNextPhase() {
        if (this.currentPhaseIndex < this.phases.length) {
            const phase = this.phases[this.currentPhaseIndex++];
            
            // Add phase transition effect
            this.scene.cameras.main.flash(300, 21, 14, 16, false); // #150E10 flash
            
            phase.start();
        } else {
            this.endTutorial();
        }
    }

    private endTutorial(skipped = false) {
        if (this.particles) {
            this.particles.stop();
        }

        if (skipped) {
            this.scene.cameras.main.fadeOut(800, 21, 14, 16);
            this.scene.time.delayedCall(800, () => {
                this.scene.scene.start('Overworld');
            });
            return;
        }

        // Completion celebration
        const { width, height } = this.scene.cameras.main;
        const completionText = this.scene.add.text(
            width / 2, 
            height / 2, 
            '✓ Training Complete!\n\nYou are ready to face the corrupted realms.', 
            {
                fontFamily: 'dungeon-mode',
                fontSize: 36,
                color: '#4CAF50',
                align: 'center',
                lineSpacing: 12
            }
        ).setOrigin(0.5).setAlpha(0).setDepth(4000);

        this.scene.tweens.add({
            targets: completionText,
            alpha: 1,
            scale: 1.1,
            duration: 800,
            ease: 'Back.easeOut'
        });

        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [this.container, this.bgContainer, completionText],
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.scene.start('Overworld');
                }
            });
        });
    }
}

import { Scene } from 'phaser';
import { Player } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';
import { createButton } from '../../../ui/Button';

export abstract class TutorialPhase {
    protected scene: Scene;
    protected container: Phaser.GameObjects.Container;
    protected tutorialUI: TutorialUI;
    protected player: Player;
    protected skipPhaseButton?: Phaser.GameObjects.Container;
    protected isCleaningUp: boolean = false;

    constructor(scene: Scene, tutorialUI: TutorialUI) {
        this.scene = scene;
        this.tutorialUI = tutorialUI;
        this.container = this.scene.add.container(0, 0);
        this.container.setAlpha(0); // Start hidden for smooth fade-in
        this.player = {
            name: 'Player',
            x: this.scene.cameras.main.width / 2,
            y: this.scene.cameras.main.height / 2,
            maxHealth: 100,
            currentHealth: 100,
            block: 0,
            statusEffects: [],
            relics: [],
            potions: [],
            drawPile: [],
            hand: [],
            discardPile: [],
            playedHand: [],
        };
    }

    public abstract start(): void;

    /**
     * Create a skip phase button (bottom right corner)
     */
    protected createSkipPhaseButton(onSkip: () => void): void {
        const screenWidth = this.scene.cameras.main.width;
        const screenHeight = this.scene.cameras.main.height;
        
        const skipButtonX = screenWidth * 0.88; // 88% from left (12% margin from right)
        const skipButtonY = screenHeight * 0.92; // 92% from top (8% from bottom)
        
        this.skipPhaseButton = createButton(
            this.scene,
            skipButtonX,
            skipButtonY,
            'Skip Phase',
            onSkip
        );
        
        this.container.add(this.skipPhaseButton);
    }

    /**
     * Cleanup method to properly dispose of phase resources.
     * Kills all tweens and removes all children from the container.
     */
    public cleanup(): void {
        if (this.isCleaningUp) return;
        this.isCleaningUp = true;
        
        // Kill all tweens on container and its children
        if (this.container && this.container.active) {
            this.scene.tweens.killTweensOf(this.container);
            this.container.getAll().forEach((child: any) => {
                this.scene.tweens.killTweensOf(child);
            });
            
            // Remove all children
            this.container.removeAll(true);
        }

        // Hide shared TutorialUI hand container (used by Phase4, Phase6)
        if (this.tutorialUI && this.tutorialUI.handContainer) {
            this.scene.tweens.killTweensOf(this.tutorialUI.handContainer);
            this.tutorialUI.handContainer.setVisible(false);
            this.tutorialUI.handContainer.setAlpha(0);
        }
    }

    /**
     * Reset phase state so it can be re-entered after cleanup.
     * Called before start() when jumping back to a previously visited phase.
     */
    public reset(): void {
        this.isCleaningUp = false;
        
        // Ensure container exists and is ready for re-use
        if (!this.container || !this.container.active) {
            this.container = this.scene.add.container(0, 0);
        }
        this.container.setAlpha(0); // Ready for fade-in
    }

    public destroy(): void {
        this.cleanup();
        if (this.container && this.container.active) {
            this.container.destroy();
        }
    }
}

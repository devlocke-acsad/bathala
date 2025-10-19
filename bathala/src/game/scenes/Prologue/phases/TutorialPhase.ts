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

    constructor(scene: Scene, tutorialUI: TutorialUI) {
        this.scene = scene;
        this.tutorialUI = tutorialUI;
        this.container = this.scene.add.container(0, 0);
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

    public destroy(): void {
        this.container.destroy();
    }
}

import { Scene } from 'phaser';
import { Player } from '../../../../core/types/CombatTypes';
import { TutorialUI } from '../ui/TutorialUI';

export abstract class TutorialPhase {
    protected scene: Scene;
    protected container: Phaser.GameObjects.Container;
    protected tutorialUI: TutorialUI;
    protected player: Player;

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

    public destroy(): void {
        this.container.destroy();
    }
}

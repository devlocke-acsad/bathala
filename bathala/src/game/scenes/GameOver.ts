import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        // Create UI elements
        this.createUI();

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }

    /**
     * Create UI elements
     */
    private createUI(): void {
        // Get screen dimensions
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        this.background = this.add.image(screenWidth/2, screenHeight/2, 'background');
        this.background.setAlpha(0.5);

        this.gameover_text = this.add.text(screenWidth/2, screenHeight/2, 'Game Over', {
            fontFamily: 'dungeon-mode-inverted', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);
    }

    /**
     * Handle scene resize
     */
    private handleResize(): void {
        // Clear and recreate UI
        this.children.removeAll();
        this.createUI();
    }
}

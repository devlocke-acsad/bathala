import { Scene } from 'phaser';

interface GameOverData {
    defeatedBy?: string;
    enemySpriteKey?: string;
    finalHealth?: number;
    turnsPlayed?: number;
}

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    private defeatData: GameOverData = {};
    private uiContainer!: Phaser.GameObjects.Container;

    constructor ()
    {
        super('GameOver');
    }

    init(data: GameOverData) {
        // Store defeat data passed from Combat scene
        this.defeatData = data || {};
    }

    create ()
    {
        this.camera = this.cameras.main;
        // Dark red-tinted background for death atmosphere
        this.camera.setBackgroundColor(0x2d0f0f);

        // Create UI elements
        this.createUI();

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        // Allow click to return to main menu (with visual feedback)
        this.input.once('pointerdown', () => {
            // Fade out effect
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });
    }

    /**
     * Create UI elements
     */
    private createUI(): void {
        // Get screen dimensions safely
        const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
        const screenHeight = this.cameras.main?.height || this.scale.height || 768;
        const scaleFactor = Math.min(screenWidth / 1024, screenHeight / 768);
        
        // Create container for all UI elements
        this.uiContainer = this.add.container(0, 0);

        // Dark background with vignette effect
        this.background = this.add.image(screenWidth/2, screenHeight/2, 'background');
        this.background.setAlpha(0.3);
        this.background.setTint(0x330000); // Red tint
        this.uiContainer.add(this.background);

        // Add dark overlay for better text contrast
        const overlay = this.add.rectangle(
            screenWidth/2, 
            screenHeight/2, 
            screenWidth, 
            screenHeight, 
            0x000000, 
            0.6
        );
        this.uiContainer.add(overlay);

        // Main "DEFEATED" text with dramatic styling
        this.gameover_text = this.add.text(screenWidth/2, screenHeight * 0.25, 'DEFEATED', {
            fontFamily: 'dungeon-mode-inverted', 
            fontSize: Math.floor(80 * scaleFactor), 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 10,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);
        this.uiContainer.add(this.gameover_text);

        // Subtitle text
        const subtitleY = screenHeight * 0.32;
        const subtitle = this.add.text(
            screenWidth/2, 
            subtitleY, 
            'Your journey has ended...', 
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(24 * scaleFactor),
                color: '#cccccc',
                align: 'center'
            }
        );
        subtitle.setOrigin(0.5);
        this.uiContainer.add(subtitle);

        // Defeat details panel - positioned lower to avoid overlap
        const panelY = screenHeight * 0.55;
        const panelWidth = Math.min(500 * scaleFactor, screenWidth * 0.8);
        const panelHeight = 220 * scaleFactor;

        // Panel background with border
        const panelBg = this.add.rectangle(
            screenWidth/2, 
            panelY, 
            panelWidth, 
            panelHeight, 
            0x1a0a0a
        );
        panelBg.setStrokeStyle(3, 0x663333);
        this.uiContainer.add(panelBg);

        // Defeated by text
        let detailsY = panelY - (panelHeight * 0.35);
        
        if (this.defeatData.defeatedBy) {
            const defeatedByText = this.add.text(
                screenWidth/2,
                detailsY,
                'Defeated By:',
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(18 * scaleFactor),
                    color: '#999999'
                }
            );
            defeatedByText.setOrigin(0.5);
            this.uiContainer.add(defeatedByText);

            detailsY += 35 * scaleFactor;

            const enemyName = this.add.text(
                screenWidth/2,
                detailsY,
                this.defeatData.defeatedBy,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(28 * scaleFactor),
                    color: '#ff6666'
                }
            );
            enemyName.setOrigin(0.5);
            this.uiContainer.add(enemyName);

            detailsY += 50 * scaleFactor;
        }

        // Combat stats
        const statsY = detailsY;

        if (this.defeatData.turnsPlayed !== undefined) {
            const turnsText = this.add.text(
                screenWidth/2,
                statsY,
                `Turns Survived: ${this.defeatData.turnsPlayed}`,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(16 * scaleFactor),
                    color: '#aaaaaa'
                }
            );
            turnsText.setOrigin(0.5);
            this.uiContainer.add(turnsText);
        }

        // Footer instruction
        const footerY = screenHeight * 0.85;
        const clickText = this.add.text(
            screenWidth/2,
            footerY,
            'Click anywhere to return to Main Menu',
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(20 * scaleFactor),
                color: '#888888'
            }
        );
        clickText.setOrigin(0.5);
        this.uiContainer.add(clickText);

        // Animate click text (pulsing effect)
        this.tweens.add({
            targets: clickText,
            alpha: { from: 0.5, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Fade in effect
        this.uiContainer.setAlpha(0);
        this.tweens.add({
            targets: this.uiContainer,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
    }

    /**
     * Handle scene resize
     */
    private handleResize(): void {
        // Only resize if scene is active and cameras are ready
        if (!this.scene.isActive() || !this.cameras.main) {
            return;
        }
        
        // Clear and recreate UI
        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        this.createUI();
    }

    shutdown() {
        // Clean up event listeners
        this.scale.off('resize', this.handleResize, this);
    }
}

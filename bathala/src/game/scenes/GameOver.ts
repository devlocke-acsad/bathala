import { Scene } from 'phaser';
import { ENEMY_LORE_DATA } from '../../data/lore/EnemyLore';

interface GameOverData {
    defeatedBy?: string;
    enemySpriteKey?: string;
    finalHealth?: number;
    turnsPlayed?: number;
    totalDamageDealt?: number;
    cardsPlayed?: number;
    relicsObtained?: number;
}

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    private defeatData: GameOverData = {};
    private uiContainer!: Phaser.GameObjects.Container;
    private enemySpriteContainer!: Phaser.GameObjects.Container; // Separate container for enemy sprite

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
        this.gameover_text = this.add.text(screenWidth/2, screenHeight * 0.15, 'DEFEATED', {
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
        const subtitleY = screenHeight * 0.22;
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

        // Create enemy sprite display on the left side (separate container)
        this.createEnemySpriteDisplay(screenWidth, screenHeight, scaleFactor);

        // Defeat details panel - center of screen
        const panelY = screenHeight * 0.52;
        const panelWidth = Math.min(550 * scaleFactor, screenWidth * 0.5);
        const panelHeight = 380 * scaleFactor;

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
        let detailsY = panelY - (panelHeight * 0.42);
        
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

            detailsY += 32 * scaleFactor;

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

            detailsY += 45 * scaleFactor;
        }

        // Divider line
        const divider1 = this.add.rectangle(
            screenWidth/2,
            detailsY,
            panelWidth * 0.8,
            2,
            0x663333
        );
        this.uiContainer.add(divider1);
        detailsY += 30 * scaleFactor;

        // Run Statistics section
        const statsTitle = this.add.text(
            screenWidth/2,
            detailsY,
            '━━━ RUN STATISTICS ━━━',
            {
                fontFamily: 'dungeon-mode-inverted',
                fontSize: Math.floor(20 * scaleFactor),
                color: '#ffd93d',
                align: 'center'
            }
        );
        statsTitle.setOrigin(0.5);
        this.uiContainer.add(statsTitle);
        detailsY += 35 * scaleFactor;

        // Stats display - three columns
        const statsConfig = [
            { label: 'Turns Survived', value: this.defeatData.turnsPlayed ?? 0, color: '#4ecdc4' },
            { label: 'Total Damage', value: this.defeatData.totalDamageDealt ?? 0, color: '#ff6b6b' },
            { label: 'Cards Played', value: this.defeatData.cardsPlayed ?? 0, color: '#95e1d3' },
            { label: 'Relics Obtained', value: this.defeatData.relicsObtained ?? 0, color: '#ffd93d' }
        ];

        statsConfig.forEach((stat, index) => {
            const statY = detailsY + Math.floor(index / 2) * (28 * scaleFactor);
            const statX = screenWidth/2 + ((index % 2 === 0 ? -1 : 1) * panelWidth * 0.25);

            const statText = this.add.text(
                statX,
                statY,
                `${stat.label}: ${stat.value}`,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(16 * scaleFactor),
                    color: stat.color
                }
            );
            statText.setOrigin(0.5);
            this.uiContainer.add(statText);
        });

        detailsY += 70 * scaleFactor;

        // Divider line
        const divider2 = this.add.rectangle(
            screenWidth/2,
            detailsY,
            panelWidth * 0.8,
            2,
            0x663333
        );
        this.uiContainer.add(divider2);
        detailsY += 30 * scaleFactor;

        // Lore snippet section
        this.createLoreSection(screenWidth/2, detailsY, panelWidth, scaleFactor);

        // Footer instruction
        const footerY = screenHeight * 0.92;
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
        if (this.enemySpriteContainer) {
            this.enemySpriteContainer.destroy();
        }
        this.createUI();
    }

    /**
     * Create enemy sprite display (separate container on left side)
     */
    private createEnemySpriteDisplay(screenWidth: number, screenHeight: number, scaleFactor: number): void {
        this.enemySpriteContainer = this.add.container(0, 0);

        // Position on left side
        const spriteX = screenWidth * 0.2;
        const spriteY = screenHeight * 0.52;

        // Background panel for sprite
        const spriteBg = this.add.rectangle(
            spriteX,
            spriteY,
            200 * scaleFactor,
            280 * scaleFactor,
            0x1a0a0a
        );
        spriteBg.setStrokeStyle(3, 0x663333);
        this.enemySpriteContainer.add(spriteBg);

        // Debug log
        console.log(`[GameOver] Enemy sprite key: ${this.defeatData.enemySpriteKey}`);
        console.log(`[GameOver] Texture exists: ${this.defeatData.enemySpriteKey ? this.textures.exists(this.defeatData.enemySpriteKey) : false}`);

        // Try to display enemy sprite if available
        if (this.defeatData.enemySpriteKey && this.textures.exists(this.defeatData.enemySpriteKey)) {
            const enemySprite = this.add.sprite(
                spriteX,
                spriteY - 20 * scaleFactor,
                this.defeatData.enemySpriteKey
            );
            
            // Scale sprite to fit panel
            const maxWidth = 150 * scaleFactor;
            const maxHeight = 180 * scaleFactor;
            const spriteScale = Math.min(
                maxWidth / enemySprite.width,
                maxHeight / enemySprite.height
            );
            enemySprite.setScale(spriteScale);
            
            console.log(`[GameOver] Enemy sprite created with scale: ${spriteScale}`);
            
            this.enemySpriteContainer.add(enemySprite);

            // Add subtle glow effect behind sprite
            const glow = this.add.rectangle(
                spriteX,
                spriteY - 20 * scaleFactor,
                enemySprite.width * spriteScale + 20,
                enemySprite.height * spriteScale + 20,
                0xff4444,
                0.2
            );
            this.enemySpriteContainer.add(glow);
            this.enemySpriteContainer.sendToBack(glow);
            this.enemySpriteContainer.sendToBack(spriteBg); // Ensure background is at back
        } else {
            console.warn(`[GameOver] Enemy sprite not found or not loaded: ${this.defeatData.enemySpriteKey}`);
            
            // Show placeholder icon if sprite unavailable
            const placeholderText = this.add.text(
                spriteX,
                spriteY - 20 * scaleFactor,
                '👹',
                {
                    fontSize: Math.floor(80 * scaleFactor),
                    align: 'center'
                }
            );
            placeholderText.setOrigin(0.5);
            this.enemySpriteContainer.add(placeholderText);
        }

        // Label below sprite
        const spriteLabel = this.add.text(
            spriteX,
            spriteY + 110 * scaleFactor,
            'Your Nemesis',
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(16 * scaleFactor),
                color: '#999999',
                align: 'center'
            }
        );
        spriteLabel.setOrigin(0.5);
        this.enemySpriteContainer.add(spriteLabel);

        // Fade in sprite container separately
        this.enemySpriteContainer.setAlpha(0);
        this.tweens.add({
            targets: this.enemySpriteContainer,
            alpha: 1,
            duration: 1200,
            delay: 300,
            ease: 'Power2'
        });
    }

    /**
     * Create lore snippet section from enemy mythology data
     */
    private createLoreSection(centerX: number, startY: number, panelWidth: number, scaleFactor: number): void {
        // Title
        const loreTitle = this.add.text(
            centerX,
            startY,
            '━━━ MYTHOLOGY ━━━',
            {
                fontFamily: 'dungeon-mode-inverted',
                fontSize: Math.floor(20 * scaleFactor),
                color: '#ffd93d',
                align: 'center'
            }
        );
        loreTitle.setOrigin(0.5);
        this.uiContainer.add(loreTitle);

        // Get lore data for the enemy
        let loreText = 'A creature of Filipino mythology...';
        
        if (this.defeatData.defeatedBy) {
            // Convert enemy name to lore key (lowercase and replace spaces with underscores)
            const loreKey = this.defeatData.defeatedBy.toLowerCase().replace(/\s+/g, '_');
            const enemyLore = ENEMY_LORE_DATA[loreKey];
            
            if (enemyLore) {
                // Use the mythology field for the lore snippet
                loreText = enemyLore.mythology;
            }
        }

        const lore = this.add.text(
            centerX,
            startY + 30 * scaleFactor,
            loreText,
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(15 * scaleFactor),
                color: '#d4b878',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: panelWidth * 0.85 }
            }
        );
        lore.setOrigin(0.5, 0);
        this.uiContainer.add(lore);
    }

    shutdown() {
        // Clean up event listeners
        this.scale.off('resize', this.handleResize, this);
    }
}

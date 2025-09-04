import { Scene, GameObjects } from 'phaser';

export class Boot extends Scene
{
    loadingText: GameObjects.Text;
    loadingBar: GameObjects.Rectangle;
    loadingBarOutline: GameObjects.Rectangle;
    scanlines: GameObjects.TileSprite;
    scanlineTimer: number = 0;

    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        // Create a simple background
        this.load.image('bg', 'assets/bg.png');
        
        // Load the dungeon-mode font files directly
        this.load.setPath("");
        this.load.binary('dungeon-mode', 'assets/fonts/dungeon-mode/dungeon-mode.ttf');
        this.load.binary('dungeon-mode-inverted', 'assets/fonts/dungeon-mode/dungeon-mode-inverted.ttf');
        this.load.setPath("assets");
    }

    create ()
    {
        // Set background color
        this.cameras.main.setBackgroundColor(0x150E10);
        
        // Create loading UI with dark fantasy theme
        this.createLoadingUI();
        
        // Start the preloader after a short delay to show the custom loading screen
        this.time.delayedCall(500, () => {
            this.scene.start("Preloader");
        });
    }
    
    private createLoadingUI(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add "BATHALA" text in the center using dungeon-mode-inverted font
        this.loadingText = this.add.text(width/2, height/2 - 50, 'BATHALA', {
            fontFamily: 'dungeon-mode-inverted, Arial, sans-serif',
            fontSize: 48,
            color: '#77888C',
        }).setOrigin(0.5);
        
        // Add loading status text using dungeon-mode font
        this.add.text(width/2, height/2 + 20, 'AWAKENING THE ANCIENTS...', {
            fontFamily: 'dungeon-mode, Arial, sans-serif',
            fontSize: 16,
            color: '#77888C',
        }).setOrigin(0.5);
        
        // Create loading bar outline
        this.loadingBarOutline = this.add.rectangle(width/2, height/2 + 60, 300, 20)
            .setStrokeStyle(2, 0x77888C);
            
        // Create loading bar
        this.loadingBar = this.add.rectangle((width/2) - 145, height/2 + 60, 10, 16, 0x77888C)
            .setOrigin(0, 0);
            
        // Create retro CRT scanline effect
        this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
            .setOrigin(0)
            .setAlpha(0.1)
            .setTint(0x77888C);
            
        // Create the scanline pattern
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 2, 1);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 1, 2, 1);
        
        const texture = graphics.generateTexture('boot_scanline', 2, 2);
        this.scanlines.setTexture('boot_scanline');
        
        // Animate the loading bar
        this.tweens.add({
            targets: this.loadingBar,
            width: 290,
            duration: 500,
            ease: 'Linear'
        });
    }
    
    update(time: number, delta: number): void {
        // Animate the scanlines
        if (this.scanlines) {
            this.scanlineTimer += delta;
            this.scanlines.tilePositionY = this.scanlineTimer * 0.05;
        }
    }
}

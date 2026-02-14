import { Scene } from 'phaser';

export class Boot extends Scene
{
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
        if (this.cameras.main) {
            this.cameras.main.setBackgroundColor(0x150E10);
        }
        
        // Start Preloader immediately — Boot only loads minimal assets (fonts, bg).
        // Showing a separate loading screen here caused two loading screens to appear.
        this.scene.start("Preloader");
    }
}

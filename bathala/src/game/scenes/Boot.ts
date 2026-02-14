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
        
        // Register custom fonts with the document before starting Preloader.
        // Otherwise the Preloader's loading screen text uses a fallback font on first load
        // and only shows the correct style after reload (when fonts are cached).
        this.registerFontsFromCache().then(() => {
            this.scene.start("Preloader");
        });
    }

    /**
     * Create FontFace from Boot's cached binary font data and add to document.fonts
     * so the Preloader loading screen uses the correct font on first paint.
     */
    private registerFontsFromCache(): Promise<void> {
        if (!("fonts" in document)) {
            return Promise.resolve();
        }
        const docFonts = (document as any).fonts as FontFaceSet;
        const promises: Promise<void>[] = [];
        for (const key of ["dungeon-mode", "dungeon-mode-inverted"] as const) {
            const data = this.cache.binary.get(key);
            if (!data) continue;
            const buffer = data instanceof ArrayBuffer ? data : (data as Uint8Array).buffer;
            const font = new FontFace(key, buffer);
            promises.push(
                font.load().then(() => {
                    docFonts.add(font);
                }).catch((err) => {
                    console.warn(`Boot: failed to register font "${key}"`, err);
                })
            );
        }
        return promises.length ? Promise.all(promises).then(() => {}) : Promise.resolve();
    }
}

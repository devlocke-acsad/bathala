import { Scene } from 'phaser';
import { SettingsManager } from '../../core/managers/SettingsManager';
import { AudioSystem } from '../../systems/audio/AudioSystem';

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
        // Hero artwork used on loading/title screens — must be ready before Preloader.init()
        this.load.image('hero_bg', 'assets/hero.jpg');
        
        // Load font files directly so they're registered before Preloader.init()
        this.load.setPath("");
        this.load.binary('dungeon-mode', 'assets/fonts/dungeon-mode/dungeon-mode.ttf');
        this.load.binary('dungeon-mode-inverted', 'assets/fonts/dungeon-mode/dungeon-mode-inverted.ttf');
        this.load.binary('pixeled-english', 'assets/fonts/pixeled-english/Pixeled English Font.ttf');
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
            // Validate data-driven audio profiles early so missing keys are visible
            // before gameplay scenes start.
            AudioSystem.getInstance().validateProfiles(true);
            // Auto-bind hover/press SFX to interactive objects across all scenes.
            AudioSystem.getInstance().enableGlobalInteractiveAudio(this.game);
            // Load and apply persisted settings before any music starts.
            SettingsManager.getInstance().applyToAudio();
            // Start the global ESC pause listener once, early.
            if (!this.scene.isActive('PauseController')) {
                this.scene.launch('PauseController');
            }
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
        const fontMap: Record<string, string> = {
            'dungeon-mode': 'dungeon-mode',
            'dungeon-mode-inverted': 'dungeon-mode-inverted',
            'pixeled-english': 'Pixeled English Font',
        };
        for (const [cacheKey, fontFamily] of Object.entries(fontMap)) {
            const data = this.cache.binary.get(cacheKey);
            if (!data) continue;
            const buffer = data instanceof ArrayBuffer ? data : (data as Uint8Array).buffer;
            const font = new FontFace(fontFamily, buffer);
            promises.push(
                font.load().then(() => {
                    docFonts.add(font);
                }).catch((err) => {
                    console.warn(`Boot: failed to register font "${fontFamily}"`, err);
                })
            );
        }
        return promises.length ? Promise.all(promises).then(() => {}) : Promise.resolve();
    }
}

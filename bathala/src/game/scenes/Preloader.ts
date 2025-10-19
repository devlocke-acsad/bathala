import { Scene, GameObjects } from "phaser";

export class Preloader extends Scene {
  progressBar: Phaser.GameObjects.Rectangle;
  progressBox: Phaser.GameObjects.Rectangle;
  loadingText: GameObjects.Text;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;

  constructor() {
    super("Preloader");
  }

  init() {
    // Set background color
    this.cameras.main.setBackgroundColor(0x150E10);
    
    //  We loaded this image in our Boot Scene, so we can display it here
    //  Position the background in the center of the screen
    const screenWidth = this.game.config.width as number;
    const screenHeight = this.game.config.height as number;
    
    // Add "BATHALA" text in the center using dungeon-mode-inverted font
    this.loadingText = this.add.text(screenWidth/2, screenHeight/2 - 100, 'BATHALA', {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: 48,
      color: '#77888C',
    }).setOrigin(0.5);
    
    // Add loading status text using dungeon-mode font
    this.add.text(screenWidth/2, screenHeight/2 - 30, 'GATHERING THE ELEMENTS...', {
      fontFamily: 'dungeon-mode',
      fontSize: 16,
      color: '#77888C',
    }).setOrigin(0.5);

    //  A simple progress bar. This is the outline of the bar.
    this.progressBox = this.add.rectangle(screenWidth/2, screenHeight/2, 400, 20).setStrokeStyle(2, 0x77888C);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    this.progressBar = this.add.rectangle((screenWidth/2) - 195, screenHeight/2, 10, 16, 0x77888C);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 390px wide, so 100% = 390px)
      this.progressBar.width = 10 + 380 * progress;
    });

    // Create more subtle retro CRT scanline effect
    this.scanlines = this.add.tileSprite(0, 0, screenWidth, screenHeight, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.15) // More subtle opacity
      .setTint(0x77888C);
      
    // Create a subtle scanline pattern
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 1);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 1, 4, 1);
    
    const texture = graphics.generateTexture('preloader_scanline', 4, 2);
    this.scanlines.setTexture('preloader_scanline');
    
    // Move scanlines to the back
    this.scanlines.setDepth(-10);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath("assets");

    // Basic assets
    this.load.image("logo", "logo.png");
    this.load.image("bg", "bg.png");
    this.load.image("forest_bg", "forest_bg.png");
    
    // Background assets
    this.load.image("floor1", "background/floor1.png");
    this.load.image("floor2", "background/floor2.png");
    this.load.image("floor3", "background/floor3.png");
    this.load.image("wall1", "background/wall1.png");
    this.load.image("wall2", "background/wall2.png");
    this.load.image("wall3", "background/wall3.png");
    this.load.image("wall4", "background/wall4.png");
    this.load.image("wall5", "background/wall5.png");
    this.load.image("wall6", "background/wall6.png");
    this.load.image("chap1_no_leaves_boss", "background/chap1_no_leaves_boss.png");

    // Fonts
    this.loadFont("Chivo", "fonts/chivo/Chivo-Medium.ttf");
    this.loadFont("dungeon-mode", "fonts/dungeon-mode/dungeon-mode.ttf");
    this.loadFont("dungeon-mode-inverted", "fonts/dungeon-mode/dungeon-mode-inverted.ttf");
    this.loadFont("HeinzHeinrich", "fonts/heinzheinrich/HeinzHeinrich-Regular.otf");
    this.loadFont("Pixeled English Font", "fonts/pixeled-english/Pixeled English Font.ttf");

    // Player sprite for Combat
    this.load.image("combat_player", "sprites/combat/player/mc_combat.png");

    // Avatar sprite sheet for Overworld - 1 row, 10 columns of 16x16 (160x16 total)
    this.load.spritesheet("overworld_player", "sprites/overworld/player.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Mysterious Merchant sprite frames for Shop - 7 individual frames
    this.load.image("merchant_f01", "sprites/merchant/merchant_f01.png");
    this.load.image("merchant_f02", "sprites/merchant/merchant_f02.png");
    this.load.image("merchant_f03", "sprites/merchant/merchant_f03.png");
    this.load.image("merchant_f04", "sprites/merchant/merchant_f04.png");
    this.load.image("merchant_f05", "sprites/merchant/merchant_f05.png");
    this.load.image("merchant_f06", "sprites/merchant/merchant_f06.png");
    this.load.image("merchant_f07", "sprites/merchant/merchant_f07.png");
    
    // Main merchant sprite (hooded figure with backpack)
    this.load.image("merchant_main", "sprites/merchant/merchant1.png");

    // Act 1 Relic Sprites (20 relics with sprite assets)
    this.load.image("relic_swift_wind_agimat", "relics/act1relics/Agimat of the Swift Wind.png");
    this.load.image("relic_amomongo_claw", "relics/act1relics/Amomongo Claw.png");
    this.load.image("relic_ancestral_blade", "relics/act1relics/Ancestral Blade.png");
    this.load.image("relic_balete_root", "relics/act1relics/Balete Root.png");
    this.load.image("relic_babaylans_talisman", "relics/act1relics/Baybalan's Talisman.png");
    this.load.image("relic_bungisngis_grin", "relics/act1relics/Bungisngis Grin.png");
    this.load.image("relic_diwatas_crown", "relics/act1relics/Diwata's Crown.png");
    this.load.image("relic_duwende_charm", "relics/act1relics/Duwende Charm.png");
    this.load.image("relic_earthwardens_plate", "relics/act1relics/Earthwarden's Plate.png");
    this.load.image("relic_ember_fetish", "relics/act1relics/Ember Fetish.png");
    this.load.image("relic_kapres_cigar", "relics/act1relics/Kapre Cigar.png");
    this.load.image("relic_lucky_charm", "relics/act1relics/Lucky Charm.png");
    this.load.image("relic_mangangaway_wand", "relics/act1relics/Mangangaway's Wand.png");
    this.load.image("relic_sarimanok_feather", "relics/act1relics/Sarimanok Feather.png");
    this.load.image("relic_sigbin_heart", "relics/act1relics/Sigbin Heart.png");
    this.load.image("relic_stone_golem_heart", "relics/act1relics/Stone Golem Heart.png");
    this.load.image("relic_tidal_amulet", "relics/act1relics/Tidal Amulet.png");
    this.load.image("relic_tikbalangs_hoof", "relics/act1relics/Tikbalang Hoof.png");
    this.load.image("relic_tiyanak_tear", "relics/act1relics/Tiyanak Tear.png");
    this.load.image("relic_umalagad_spirit", "relics/act1relics/Umalagad Spirit.png");

    // Enemy sprites for Combat
    this.load.image("amomongo_combat", "sprites/combat/enemy/chap1/amomongo_combat.png");
    this.load.image("balete_combat", "sprites/combat/enemy/chap1/balete_combat.png");
    this.load.image("bungisngis_combat", "sprites/combat/enemy/chap1/bungisngis_combat.png");
    this.load.image("duwende_combat", "sprites/combat/enemy/chap1/duwende_combat.png");
    this.load.image("kapre_combat", "sprites/combat/enemy/chap1/kapre_combat.png");
    this.load.image("mangangaway_combat", "sprites/combat/enemy/chap1/mangangaway_combat.png");
    this.load.image("sigbin_combat", "sprites/combat/enemy/chap1/sigbin_combat.png");
    this.load.image("tawonglipod_combat", "sprites/combat/enemy/chap1/tawonglipod_combat.png");
    this.load.image("tikbalang_combat", "sprites/combat/enemy/chap1/tikbalang_combat.png");
    this.load.image("tiyanak_combat", "sprites/combat/enemy/chap1/tiyanak_combat.png");

    // Legacy enemy sprite keys for backward compatibility
    this.load.image("amomongo", "sprites/combat/enemy/chap1/amomongo_combat.png");
    this.load.image("balete", "sprites/combat/enemy/chap1/balete_combat.png");
    this.load.image("bungisngis", "sprites/combat/enemy/chap1/bungisngis_combat.png");
    this.load.image("duwende", "sprites/combat/enemy/chap1/duwende_combat.png");
    this.load.image("kapre", "sprites/combat/enemy/chap1/kapre_combat.png");
    this.load.image("mangangaway", "sprites/combat/enemy/chap1/mangangaway_combat.png");
    this.load.image("sigbin", "sprites/combat/enemy/chap1/sigbin_combat.png");
    this.load.image("tawong_lipod", "sprites/combat/enemy/chap1/tawonglipod_combat.png");
    this.load.image("tikbalang", "sprites/combat/enemy/chap1/tikbalang_combat.png");
    this.load.image("tiyanak", "sprites/combat/enemy/chap1/tiyanak_combat.png");

    // Overworld enemy sprites
    this.load.image("amomongo_overworld", "sprites/overworld/combat/chap1/amomongo_overworld.png");
    this.load.image("balete_overworld", "sprites/overworld/combat/chap1/balete_overworld.png");
    this.load.image("bungisngis_overworld", "sprites/overworld/combat/chap1/bungisngis_overworld.png");
    this.load.image("duwende_overworld", "sprites/overworld/combat/chap1/duwende_overworld.png");
    this.load.image("kapre_overworld", "sprites/overworld/combat/chap1/kapre_overworld.png");
    this.load.image("mangangaway_overworld", "sprites/overworld/combat/chap1/mangangaway_overworld.png");
    this.load.image("sigbin_overworld", "sprites/overworld/combat/chap1/sigbin_overworld.png");
    this.load.image("tawonglipod_overworld", "sprites/overworld/combat/chap1/tawonglipod_overworld.png");
    this.load.image("tikbalang_overworld", "sprites/overworld/combat/chap1/tikbalang_overworld.png");
    this.load.image("tiyanak_overworld", "sprites/overworld/combat/chap1/tiyanak_overworld.png");
    
    // Overworld node sprites
    // Combat node sprites (chort)
    this.load.image("chort_f0", "sprites/overworld/combat/chort_idle_anim_f0.png");
    this.load.image("chort_f1", "sprites/overworld/combat/chort_idle_anim_f1.png");
    this.load.image("chort_f2", "sprites/overworld/combat/chort_idle_anim_f2.png");
    
    // Elite node sprites (big demon)
    this.load.image("big_demon_f0", "sprites/overworld/elite/big_demon_idle_anim_f0.png");
    this.load.image("big_demon_f1", "sprites/overworld/elite/big_demon_idle_anim_f1.png");
    this.load.image("big_demon_f2", "sprites/overworld/elite/big_demon_idle_anim_f2.png");
    this.load.image("big_demon_f3", "sprites/overworld/elite/big_demon_idle_anim_f3.png");
    
    // Campfire node sprites (angel)
    this.load.image("angel_f0", "sprites/overworld/campfire/angel_idle_anim_f0.png");
    this.load.image("angel_f1", "sprites/overworld/campfire/angel_idle_anim_f1.png");
    this.load.image("angel_f2", "sprites/overworld/campfire/angel_idle_anim_f2.png");
    this.load.image("angel_f3", "sprites/overworld/campfire/angel_idle_anim_f3.png");
    
    // Add campfire spritesheet for animated campfire
    this.load.spritesheet("campfire", "sprites/overworld/campfire/angel_idle_anim_f0.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    
    // Shop node sprites (necromancer)
    this.load.image("necromancer_f0", "sprites/overworld/shop/necromancer_anim_f0.png");
    this.load.image("necromancer_f1", "sprites/overworld/shop/necromancer_anim_f1.png");
    this.load.image("necromancer_f2", "sprites/overworld/shop/necromancer_anim_f2.png");
    this.load.image("necromancer_f3", "sprites/overworld/shop/necromancer_anim_f3.png");
    
    // Event node sprites (doc)
    this.load.image("doc_f0", "sprites/overworld/event/doc_idle_anim_f0.png");
    this.load.image("doc_f1", "sprites/overworld/event/doc_idle_anim_f1.png");
    this.load.image("doc_f2", "sprites/overworld/event/doc_idle_anim_f2.png");
    
    // Treasure node sprites (chest)
    this.load.image("chest_f0", "sprites/overworld/treasure/chest_full_open_anim_f0.png");
    this.load.image("chest_f1", "sprites/overworld/treasure/chest_full_open_anim_f1.png");
    this.load.image("chest_f2", "sprites/overworld/treasure/chest_full_open_anim_f2.png");
    
    // Shop merchant sprites
    this.load.image("merchant_f01", "sprites/merchant/merchant_f01.png");
    this.load.image("merchant_f02", "sprites/merchant/merchant_f02.png");
    this.load.image("merchant_f03", "sprites/merchant/merchant_f03.png");
    this.load.image("merchant_f04", "sprites/merchant/merchant_f04.png");
    this.load.image("merchant_f05", "sprites/merchant/merchant_f05.png");
    this.load.image("merchant_f06", "sprites/merchant/merchant_f06.png");
    this.load.image("merchant_f07", "sprites/merchant/merchant_f07.png");
    
    // Load card sprites
    const suits = ["apoy", "tubig", "lupa", "hangin"];
    const ranks = [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
      "11", "12", "13"  // Mandirigma, Babaylan, Datu
    ];
    
    // Load all card sprites
    for (const suit of suits) {
      for (const rank of ranks) {
        const fileName = `${rank}${suit}.png`;
        const key = `card_${rank}_${suit}`;
        console.log(`Loading card sprite: ${key} from ${fileName}`);
        this.load.image(key, `sprites/cards/${fileName}`);
      }
    }
    
    // Load card back art for discard pile
    this.load.image("backart", "sprites/cards/backart.png");
    
    // Load UI icons for day/night tracker
    this.load.image("bathala_sun_icon", "ui/icons/bathala_sun_icon.png");
    this.load.image("bathala_moon_icon", "ui/icons/bathala_moon_icon.png");
    this.load.image("bathala_boss_icon", "ui/icons/bathala_boss_icon.png");
    
    // Debug: Log when assets are loaded
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`Loaded asset: ${key} (${type})`);
    });
  }

  create() {
    // Set pixel-perfect rendering for sprite textures
    if (this.textures.exists("combat_player")) {
      this.textures.get("combat_player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("amomongo")) {
      this.textures.get("amomongo").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("balete")) {
      this.textures.get("balete").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("bungisngis")) {
      this.textures.get("bungisngis").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("duwende")) {
      this.textures.get("duwende").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("kapre")) {
      this.textures.get("kapre").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("mangangaway")) {
      this.textures.get("mangangaway").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("sigbin")) {
      this.textures.get("sigbin").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tawong_lipod")) {
      this.textures.get("tawong_lipod").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tikbalang")) {
      this.textures.get("tikbalang").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("tiyanak")) {
      this.textures.get("tiyanak").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("overworld_player")) {
      this.textures.get("overworld_player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Ensure fonts are loaded before proceeding
    this.waitForFontsToLoad().then(() => {
      //  Create animations for the sprites
      try {
        this.createPlayerAnimations();
        this.createAvatarAnimations();
        this.createNodeAnimations(); // Add this line
      } catch (error) {
        console.warn("Could not create sprite animations:", error);
      }

      //  Move to the MainMenu instead of directly to Overworld
      this.scene.start("MainMenu");
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Reposition progress bar on resize
    const screenWidth = this.game.config.width as number;
    const screenHeight = this.game.config.height as number;
    
    if (this.progressBox) {
      this.progressBox.setPosition(screenWidth/2, screenHeight/2);
    }
    
    if (this.progressBar) {
      this.progressBar.setPosition((screenWidth/2) - 195, screenHeight/2);
    }
    
    // Resize scanlines
    if (this.scanlines) {
      this.scanlines.setSize(screenWidth, screenHeight);
    }
  }

  /**
   * Create player animations
   */
  private createPlayerAnimations(): void {
    // Combat player is now a static image (mc_combat.png), no animations needed
    /* Animations removed - using static sprite
    this.anims.create({
      key: "player_idle",
      frames: [{ key: "combat_player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "player_idle_down",
      frames: [{ key: "combat_player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "player_walk",
      frames: this.anims.generateFrameNumbers("combat_player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    */
  }

  /**
   * Create avatar animations for Overworld
   */
  private createAvatarAnimations(): void {
    console.log("Creating avatar animations");
    
    // Avatar idle down animation (middle frame of down animation)
    this.anims.create({
      key: "avatar_idle_down",
      frames: [{ key: "overworld_player", frame: 1 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created avatar_idle_down animation");

    // Avatar walk down animation (columns 1-3)
    this.anims.create({
      key: "avatar_walk_down",
      frames: this.anims.generateFrameNumbers("overworld_player", { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    });
    console.log("Created avatar_walk_down animation");

    // Avatar idle up animation (middle frame of up animation)
    this.anims.create({
      key: "avatar_idle_up",
      frames: [{ key: "overworld_player", frame: 4 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created avatar_idle_up animation");

    // Avatar walk up animation (columns 4-6)
    this.anims.create({
      key: "avatar_walk_up",
      frames: this.anims.generateFrameNumbers("overworld_player", { start: 3, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    console.log("Created avatar_walk_up animation");

    // Avatar idle left animation (first frame of left animation)
    this.anims.create({
      key: "avatar_idle_left",
      frames: [{ key: "overworld_player", frame: 6 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created avatar_idle_left animation");

    // Avatar walk left animation (columns 7-8)
    this.anims.create({
      key: "avatar_walk_left",
      frames: this.anims.generateFrameNumbers("overworld_player", { start: 6, end: 7 }),
      frameRate: 6,
      repeat: -1,
    });
    console.log("Created avatar_walk_left animation");

    // Avatar idle right animation (first frame of right animation)
    this.anims.create({
      key: "avatar_idle_right",
      frames: [{ key: "overworld_player", frame: 8 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created avatar_idle_right animation");

    // Avatar walk right animation (columns 9-10)
    this.anims.create({
      key: "avatar_walk_right",
      frames: this.anims.generateFrameNumbers("overworld_player", { start: 8, end: 9 }),
      frameRate: 6,
      repeat: -1,
    });
    console.log("Created avatar_walk_right animation");
  }



  /**
   * Create overworld node animations
   */
  private createNodeAnimations(): void {
    console.log("Creating node animations");
    
    // Combat node animation (chort)
    this.anims.create({
      key: "chort_idle",
      frames: [
        { key: "chort_f0" },
        { key: "chort_f1" },
        { key: "chort_f2" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created chort_idle animation");
    
    // Elite node animation (big demon)
    this.anims.create({
      key: "big_demon_idle",
      frames: [
        { key: "big_demon_f0" },
        { key: "big_demon_f1" },
        { key: "big_demon_f2" },
        { key: "big_demon_f3" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created big_demon_idle animation");
    
    // Campfire node animation (angel)
    this.anims.create({
      key: "angel_idle",
      frames: [
        { key: "angel_f0" },
        { key: "angel_f1" },
        { key: "angel_f2" },
        { key: "angel_f3" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created angel_idle animation");
    
    // Campfire animation (same as angel)
    this.anims.create({
      key: "campfire_burn",
      frames: [
        { key: "angel_f0" },
        { key: "angel_f1" },
        { key: "angel_f2" },
        { key: "angel_f3" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created campfire_burn animation");
    
    // Shop node animation (necromancer)
    this.anims.create({
      key: "necromancer_idle",
      frames: [
        { key: "necromancer_f0" },
        { key: "necromancer_f1" },
        { key: "necromancer_f2" },
        { key: "necromancer_f3" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created necromancer_idle animation");
    
    // Event node animation (doc)
    this.anims.create({
      key: "doc_idle",
      frames: [
        { key: "doc_f0" },
        { key: "doc_f1" },
        { key: "doc_f2" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created doc_idle animation");
    
    // Treasure node animation (chest)
    this.anims.create({
      key: "chest_open",
      frames: [
        { key: "chest_f0" },
        { key: "chest_f1" },
        { key: "chest_f2" }
      ],
      frameRate: 4,
      repeat: -1,
    });
    console.log("Created chest_open animation");
    
    // Merchant animation (shop scene)
    this.anims.create({
      key: "merchant_idle",
      frames: [
        { key: "merchant_f01" },
        { key: "merchant_f02" },
        { key: "merchant_f03" },
        { key: "merchant_f04" },
        { key: "merchant_f05" },
        { key: "merchant_f06" },
        { key: "merchant_f07" }
      ],
      frameRate: 8,
      repeat: -1,
    });
    console.log("Created merchant_idle animation");
  }

  /**
   * Load a font file
   */
  private loadFont(name: string, path: string): void {
    // For the Pixeled English Font, also load it via CSS to ensure it's available
    if (name === "Pixeled English Font") {
      // Create a temporary element to trigger font loading
      const tempElement = document.createElement('div');
      tempElement.style.fontFamily = `"${name}", Arial, sans-serif`;
      tempElement.style.fontSize = '250px';
      tempElement.style.position = 'absolute';
      tempElement.style.visibility = 'hidden';
      tempElement.textContent = 'bathala';
      document.body.appendChild(tempElement);
      
      // Remove the element after a short time
      setTimeout(() => {
        if (tempElement.parentNode) {
          tempElement.parentNode.removeChild(tempElement);
        }
      }, 1000);
    }
    
    const font = new FontFace(name, `url(${path})`);
    font.load().then(() => {
      (document as any).fonts.add(font);
      console.log(`Font ${name} loaded successfully`);
    }).catch((error) => {
      console.warn(`Failed to load font ${name}:`, error);
    });
  }

  /**
   * Wait for fonts to load from CSS/Google Fonts
   */
  private async waitForFontsToLoad(): Promise<void> {
    return new Promise((resolve) => {
      // Check if fonts are loaded using FontFaceSet API
      if ("fonts" in document) {
        document.fonts.ready.then(() => {
          console.log("Fonts loaded successfully");
          resolve();
        });
      } else {
        // Fallback for browsers without FontFaceSet API
        setTimeout(() => {
          console.log("Font loading fallback timeout");
          resolve();
        }, 1000);
      }
    });
  }
  
  update(time: number, delta: number): void {
    // Animate the scanlines
    if (this.scanlines) {
      this.scanlineTimer += delta;
      this.scanlines.tilePositionY = this.scanlineTimer * 0.15; // Increased speed
    }
  }
}

import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "bg");

    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath("assets");

    // Basic assets
    this.load.image("logo", "logo.png");
    this.load.image("bg", "bg.png");

    // Player sprite sheet for Combat - 4 frames, 32x32 each (128x32 total)
    this.load.spritesheet("player", "sprites/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Avatar sprite sheet for Overworld - 1 row, 10 columns of 16x16 (160x16 total)
    this.load.spritesheet("overworld_player", "sprites/overworld/player.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Enemy sprite sheet - 4 frames, 32x32 each (128x32 total)
    this.load.spritesheet("enemy", "sprites/enemy.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    
    // Debug: Log when assets are loaded
    this.load.on('filecomplete', (key: string, type: string) => {
      console.log(`Loaded asset: ${key} (${type})`);
    });
  }

  create() {
    // Set pixel-perfect rendering for sprite textures
    if (this.textures.exists("player")) {
      this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("enemy")) {
      this.textures.get("enemy").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    if (this.textures.exists("overworld_player")) {
      this.textures.get("overworld_player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Ensure fonts are loaded before proceeding
    this.waitForFontsToLoad().then(() => {
      //  Create animations for the sprites
      try {
        this.createPlayerAnimations();
        this.createEnemyAnimations();
        this.createAvatarAnimations();
      } catch (error) {
        console.warn("Could not create sprite animations:", error);
      }

      //  Move to the Overworld
      this.scene.start("Overworld");
    });
  }

  /**
   * Create player animations
   */
  private createPlayerAnimations(): void {
    console.log("Creating player animations");
    
    // Player idle animation (first frame)
    this.anims.create({
      key: "player_idle",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created player_idle animation");

    // Player idle down animation (first frame)
    this.anims.create({
      key: "player_idle_down",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });
    console.log("Created player_idle_down animation");

    // Player walk animation (frames 0-3)
    this.anims.create({
      key: "player_walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    console.log("Created player_walk animation");
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
   * Create enemy animations
   */
  private createEnemyAnimations(): void {
    // Enemy idle animation (frames 0-3)
    this.anims.create({
      key: "enemy_idle",
      frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
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
}

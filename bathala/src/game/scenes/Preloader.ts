import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(512, 384, "background");

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

    // Avatar sprite sheet for Overworld - 3x3 grid, 16x16 each (48x48 total)
    this.load.spritesheet("avatar", "sprites/avatar/avatar-test.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Enemy sprite sheet - 4 frames, 32x32 each (128x32 total)
    this.load.spritesheet("enemy", "sprites/enemy.png", {
      frameWidth: 32,
      frameHeight: 32,
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
    if (this.textures.exists("avatar")) {
      this.textures.get("avatar").setFilter(Phaser.Textures.FilterMode.NEAREST);
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
    // Player idle animation (first frame)
    this.anims.create({
      key: "player_idle",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    // Player idle down animation (first frame)
    this.anims.create({
      key: "player_idle_down",
      frames: [{ key: "player", frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    // Player walk animation (frames 0-3)
    this.anims.create({
      key: "player_walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  /**
   * Create avatar animations for Overworld
   */
  private createAvatarAnimations(): void {
    // Avatar idle down animation (middle frame of bottom row)
    this.anims.create({
      key: "avatar_idle_down",
      frames: [{ key: "avatar", frame: 1 }],
      frameRate: 1,
      repeat: -1,
    });

    // Avatar walk down animation (bottom row: frames 0,1,2)
    this.anims.create({
      key: "avatar_walk_down",
      frames: this.anims.generateFrameNumbers("avatar", { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    });

    // Avatar walk left animation (middle row: frames 3,4,5)
    this.anims.create({
      key: "avatar_walk_left",
      frames: this.anims.generateFrameNumbers("avatar", { start: 3, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Avatar walk right animation (top row: frames 6,7,8)
    this.anims.create({
      key: "avatar_walk_right",
      frames: this.anims.generateFrameNumbers("avatar", { start: 6, end: 8 }),
      frameRate: 6,
      repeat: -1,
    });
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

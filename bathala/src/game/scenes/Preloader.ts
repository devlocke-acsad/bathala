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

    // Player sprite sheet - 3 frames, 48x48 each (192x48 total)
    this.load.spritesheet("player", "sprites/player.png", {
      frameWidth: 64,
      frameHeight: 48,
    });

    // Enemy sprite sheet - 4 frames, 32x32 each (128x32 total)
    this.load.spritesheet("enemy", "sprites/enemy.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Set pixel-perfect rendering for sprite textures
    this.textures.get("player").setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.textures.get("enemy").setFilter(Phaser.Textures.FilterMode.NEAREST);

    //  Create animations for the sprites
    try {
      this.createPlayerAnimations();
      this.createEnemyAnimations();
    } catch (error) {
      console.warn("Could not create sprite animations:", error);
    }

    //  Move to the MainMenu
    this.scene.start("MainMenu");
  }

  /**
   * Create player animations
   */
  private createPlayerAnimations(): void {
    // Player idle animation (frames 0-2 for 3 total frames)
    this.anims.create({
      key: "player_idle",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
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
}

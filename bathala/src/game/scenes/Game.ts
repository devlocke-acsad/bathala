import { Scene } from "phaser";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    // Use custom background color (from CSS variable --background)
    // Phaser expects a hex number, so we hardcode the color value
    this.camera.setBackgroundColor(0x0e1112); // #0e1112

    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.background = this.add.image(screenWidth/2, screenHeight/2, "background");
    this.background.setAlpha(0.5);

    // Use custom font and colors for text
    this.msg_text = this.add.text(
      screenWidth/2,
      screenHeight/2,
      "Welcome to Bathala!\\nClick to enter the overworld\\nand begin your journey",
      {
        fontFamily: "Centrion", // Custom font loaded via CSS
        fontSize: 38,
        color: "#e8eced", // --text
        align: "center",
        // --accent (optional)
      }
    );
    this.msg_text.setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("Overworld");
    });
  }
}

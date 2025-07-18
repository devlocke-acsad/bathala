import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x0e1112); // --background (#0e1112)

    // Title (Bathala) with custom font and color
    this.title = this.add
      .text(512, 180, "BATHALA", {
        fontFamily: "Centrion", // Custom font for title
        fontSize: 96,
        color: "#e8eced", // --text

        align: "center",
      })
      .setOrigin(0.5);

    // Menu options with secondary font and color
    const menuOptions = ["Play", "Compendium", "Settings", "Quit"];
    menuOptions.forEach((option, i) => {
      const menuText = this.add
        .text(512, 320 + i * 48, option, {
          fontFamily: "Centrion", // Secondary font for menu
          fontSize: 32,
          color: "#abb6bd", // --primary

          align: "center",
        })
        .setOrigin(0.5);
      // Add pointer interaction for Play (example)
      if (option === "Play") {
        menuText
          .setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            this.scene.start("Game");
          });
      }
    });
  }
}

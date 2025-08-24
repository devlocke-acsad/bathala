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

    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Center the content vertically on the screen
    const centerY = screenHeight / 2;
    
    // Create wavy BATHALA text with alternating vertical offsets
    this.createWavyTitle(screenWidth/2, centerY - 100, "BATHALA");

    // Menu options - centered below the title
    const menuOptions = ["Play", "Compendium", "Settings", "Quit"];
    const startY = centerY + 20; // Start menu options below the title
    const spacing = 60; // Increase spacing between options
    
    menuOptions.forEach((option, i) => {
      const menuText = this.add
        .text(screenWidth/2, startY + i * spacing, option, {
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
            this.scene.start("Overworld");
          });
      }
    });
  }

  /**
   * Create a wavy title effect by offsetting each letter vertically
   */
  private createWavyTitle(x: number, y: number, text: string): void {
    const letters = text.split('');
    const baseFontSize = 120; 
    const verticalOffset = 20; 
    const horizontalSpacing = 0.65; 
    
    letters.forEach((letter, index) => {
      // Calculate horizontal position for each letter
      const letterX = x + (index - (letters.length - 1) / 2) * (baseFontSize * horizontalSpacing);
      
      // Alternate vertical offset (even indices go down, odd indices go up)
      const letterY = y + (index % 2 === 0 ? verticalOffset : -verticalOffset);
      
      // Create the letter with styling
      const letterText = this.add
        .text(letterX, letterY, letter, {
          fontFamily: "Centrion",
          fontSize: baseFontSize,
          color: "#e8eced",
        })
        .setOrigin(0.5);
      
      // Add subtle pixelated effect with a slight offset shadow
      letterText.setShadow(2, 2, '#000000', 0, true, false);
    });
  }
}

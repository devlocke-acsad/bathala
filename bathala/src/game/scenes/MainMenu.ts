import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  menuTexts: GameObjects.Text[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Create UI elements
    this.createUI();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Clear existing menu texts
    this.menuTexts = [];

    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add version text in top right with more margin
    this.versionText = this.add
      .text(screenWidth - 40, 40, "0.5.0", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C", // --primary
        align: "right",
      })
      .setOrigin(1, 0);

    // Add footer text with more margin
    this.footerText = this.add
      .text(screenWidth/2, screenHeight - 40, "Bathala. Developed by Devlocke. Copyright 2025.", {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C", // --primary
        align: "center",
      })
      .setOrigin(0.5, 1);

    // Center the content vertically on the screen
    const centerY = screenHeight / 2;
    
    // Create "bathala" text in lowercase with HeinzHeinrich font
    this.createStraightTitle(screenWidth/2, centerY - 150, "bathala");

    // Menu options - centered below the title with increased gap
    const menuOptions = ["Play", "Discover", "Settings"]; // Updated options
    const startY = centerY + 48; // Increased gap between title and menu options
    const spacing = 64; // Increased spacing between options
    
    menuOptions.forEach((option, i) => {
      const menuText = this.add
        .text(screenWidth/2, startY + i * spacing, option, {
          fontFamily: "dungeon-mode-inverted", // Updated font for menu
          fontSize: 32,
          color: "#77888C", // Updated color --primary
          align: "center",
        })
        .setOrigin(0.5);
        
      // Add pointer interaction for all menu options
      menuText
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          switch (option) {
            case "Play":
              this.scene.start("Overworld");
              break;
            case "Discover":
              // TODO: Implement compendium scene
              break;
            case "Settings":
              // TODO: Implement settings scene
              break;
          }
        });
      
      this.menuTexts.push(menuText);
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createUI();
  }

  /**
   * Create a straight title with HeinzHeinrich font and updated color
   */
  private createStraightTitle(x: number, y: number, text: string): void {
    // Create the text with styling
    const titleText = this.add
      .text(x, y, text, {
        fontFamily: "HeinzHeinrich", // Updated font
        fontSize: 120,
        color: "#77888C", // Updated color
      })
      .setOrigin(0.5);
    
    // Add subtle shadow
    titleText.setShadow(2, 2, '#000000', 0, true, false);
  }
}

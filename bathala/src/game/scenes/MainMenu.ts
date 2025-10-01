import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  menuTexts: GameObjects.Text[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    this.createUI();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Create prominent CRT scanline effect
   */
  private createBackgroundEffects(): void {
    // Safety check for cameras
    if (!this.cameras || !this.cameras.main) {
      console.warn("Cameras not available yet, skipping background effects");
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create more prominent scanlines using a tile sprite
    this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.15) // Increased opacity for more prominence
      .setTint(0x77888C);
      
    // Create a more pronounced scanline pattern
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 2); // Thicker lines
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 2, 4, 2); // Thicker lines
    
    const texture = graphics.generateTexture('scanline', 4, 4);
    this.scanlines.setTexture('scanline');
    
    // Move background to the back
    this.scanlines.setDepth(-10);
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
    
    // Add version text in top right with more margin using dungeon-mode font
    this.versionText = this.add
      .text(screenWidth - 40, 40, "0.5.0", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C", // --primary
        align: "right",
      })
      .setOrigin(1, 0);

    // Add footer text with more margin using dungeon-mode font
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
    
    // Create "bathala" text with special handling for font loading
    this.createBathalaText(screenWidth/2, centerY - 150);

    // Menu options - centered below the title with increased gap using dungeon-mode-inverted font
    const menuOptions = ["Play", "Discover", "Credits", "Settings"]; // Updated options
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
              this.scene.start("Prologue");
              break;
            case "Discover":
              this.scene.start("Discover");
              break;
            case "Credits":
              this.scene.start("Credits");
              break;
            case "Settings":
              this.scene.start("Settings");
              break;
          }
        });
      
      this.menuTexts.push(menuText);
    });
  }

  /**
   * Create the "bathala" text with special font loading handling
   */
  private createBathalaText(x: number, y: number): void {
    // Create the text
    const titleText = this.add
      .text(x, y, "bathala", {
        fontFamily: "Pixeled English Font",
        fontSize: 250,
        color: "#77888C",
      })
      .setOrigin(0.5);
    
    // Add subtle shadow
    titleText.setShadow(2, 2, '#000000', 0, true, false);
    
    // Force refresh after a short delay
    this.time.delayedCall(50, () => {
      titleText.setText("bathala");
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Safety check for cameras before clearing
    if (!this.cameras || !this.cameras.main) {
      console.warn("Cameras not available during resize, skipping");
      return;
    }
    
    // Clear and recreate UI
    this.children.removeAll();
    this.createBackgroundEffects();
    this.createUI();
  }

  /**
   * Update method for animation effects
   */
  update(time: number, delta: number): void {
    // Animate the scanlines
    if (this.scanlines) {
      this.scanlineTimer += delta;
      // Move scanlines vertically to simulate CRT effect at a faster pace
      this.scanlines.tilePositionY = this.scanlineTimer * 0.1; // Increased speed
    }
  }
}

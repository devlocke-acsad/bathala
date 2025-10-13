import { Scene, GameObjects } from "phaser";

export class Credits extends Scene {
  background: GameObjects.Image;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;
  backButton: GameObjects.Text;
  creditsContainer: GameObjects.Container;
  scrollSpeed: number = 30; // Pixels per second
  scrollY: number = 0;
  isScrolling: boolean = true;
  maxScroll: number = 0;

  constructor() {
    super("Credits");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Create background effects
    this.createBackgroundEffects();

    // Create credits content
    this.createCreditsContent();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);

    // Handle keyboard input for scrolling
    this.input.keyboard?.on('keydown-UP', () => {
      this.scrollY += 10;
      this.isScrolling = false;  // Stop auto-scrolling when user interacts
      this.updateCreditsPosition();
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.scrollY -= 10;
      this.isScrolling = false;  // Stop auto-scrolling when user interacts
      this.updateCreditsPosition();
    });

    // Handle mouse wheel for scrolling
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number) => {
      this.scrollY -= deltaY * 0.5;
      this.isScrolling = false;  // Stop auto-scrolling when user interacts
      this.updateCreditsPosition();
    });
  }

  /**
   * Create prominent CRT scanline effect
   */
  private createBackgroundEffects(): void {
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
    
    const texture = graphics.generateTexture('credits_scanline', 4, 4);
    this.scanlines.setTexture('credits_scanline');
    
    // Move background to the back
    this.scanlines.setDepth(-10);
  }

  /**
   * Create the credits content
   */
  private createCreditsContent(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create a container for all credits content
    this.creditsContainer = this.add.container(0, 0);
    
    // Title
    const title = this.add.text(width/2, 100, "Credits", {
      fontFamily: "Pixeled English Font",
      fontSize: 48,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    this.creditsContainer.add(title);
    
    // Credits content with proper formatting
    const creditsData = [
      { header: "DEVELOPERS", names: [
        "EXEQUEL B. ADIZON", 
        "CLEMENT HAROLD MIGUEL CABUS", 
        "CHESTER B. MAGTAJAS", 
        "DAVID CHRISTIAN C. OLIMBERIO"
      ] },
      { header: "ART", names: [
        "KEVIN REI ODI", 
        "SEBASTIAN BALUYUT"
      ] },
      { header: "ADVISERS", names: [
        "Prof. MARY ELLAINE R. CERVANTES, MIS, MTE",
        "Course Adviser",
        "Prof. CHRISTIAN MICHAEL MANSUETO, MSIT",
        "Technical Adviser",
        "Prof. ALI A. NAIM, MIS",
        "Program Director CS, IS and ITE Allied Programs"
      ]},
      { header: "PANELISTS", names: [
        "Prof. LESTER GLOVER DIAMPOC, MSI",
        "Panel Chair",
        "Prof. NOMAR B. MAESTOR, MIST",
        "Panel Member",
        "Prof. ROMMEL DORIN, MSI",
        "Panel Member"
      ]},
      { header: "SPECIAL THANKS", names: [
        "Nitten 'Big N' Nair - CEO, Creator of Mythlok",
        "Aylmer 'Sir A' Velez - Creator of Y Realm Studios",
        "Apyongs", 
        "Comrad's Comembo", 
        "Converse", 
        "Mama Cleofe", 
        "Friends and Family", 
        "GCash", 
        "SeaBank",
        "TikTok",
        "Instagram Reels",
        "YouTube ReVanced",
        "GOMO Sim Card",
        "Library Wifi",
        "Dali 14peso Python Energy Drink",
        "10 Pesos Kwekdog with Chumbucket Sauce",
        "Windsurf",
        "ClemSMP",
        "GoSort Family",
        "Spotify Premium Mod APK", 
        "Move It",
        "SPayLater",
        "John Rey Nable",
        "Kim Galledo",
        "Jomari Estrella",
        "Apple Oabel <3",
        "Copilot",
        "PEAK",
        "TFT",
        "Left 4 Dead 2",
        "Romeo Bargabino",
        "Motor ni Lita",
        "Motor ni Tempra",
        "Justin Nabunturan",
        "Exequel Adizon",
        "GOD",
      ]},
      { header: "IN MEMORY OF:", names: [
          "PALAD",
          "2024-2024"
        ]}
    ];
    
    let yPos = 250;
    
    creditsData.forEach((section, index) => {
      // Section header
      const header = this.add.text(width/2, yPos, section.header, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      this.creditsContainer.add(header);
      yPos += 60;  // Increased spacing after header
      
      // Names in the section
      section.names.forEach((name) => {
        const nameText = this.add.text(width/2, yPos, name, {
          fontFamily: "dungeon-mode",
          fontSize: 24,
          color: "#77888C",
          align: "center"
        }).setOrigin(0.5);
        
        this.creditsContainer.add(nameText);
        yPos += 40;  // Reduced spacing between names
      });
      
      // Add extra spacing between sections
      yPos += 60;  // Increased spacing between sections
    });
    
    // Add copyright information at the bottom
    const copyright = this.add.text(width/2, yPos + 100, "Bathala. Developed by Devlocke. Copyright 2025.", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    this.creditsContainer.add(copyright);
    
    // Calculate max scroll value
    this.maxScroll = copyright.y + 200;
  }

  /**
   * Create back button
   */
  private createBackButton(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.backButton = this.add
      .text(80, height - 40, "BACK", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.start("MainMenu");
      });
  }

  /**
   * Update the credits position for scrolling effect
   */
  private updateCreditsPosition(): void {
    if (this.creditsContainer) {
      // Calculate the maximum scroll based on container height
      const containerHeight = this.creditsContainer.getBounds().height;
      const screenHeight = this.cameras.main.height;
      
      // Set limits for scrolling
      const maxY = 100;  // Top limit
      const minY = -(containerHeight - screenHeight + 100);  // Bottom limit
      
      // Clamp the scroll position between limits
      this.scrollY = Phaser.Math.Clamp(this.scrollY, minY, maxY);
      this.creditsContainer.y = this.scrollY;
      
      // Stop auto-scrolling when we reach the bottom
      if (this.scrollY <= minY + 5) {
        this.isScrolling = false;
      }
    }
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createBackgroundEffects();
    this.createCreditsContent();
    this.createBackButton();
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
    
    // Auto-scroll if enabled
    if (this.isScrolling && this.creditsContainer) {
      this.scrollY -= (this.scrollSpeed * delta) / 1000;
      this.updateCreditsPosition();
    }
  }
}
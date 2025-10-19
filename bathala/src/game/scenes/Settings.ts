import { Scene, GameObjects } from "phaser";
import { MusicManager } from "../../core/managers/MusicManager";

export class Settings extends Scene {
  background: GameObjects.Image;
  title: GameObjects.Text;
  menuTexts: GameObjects.Text[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;
  backButton: GameObjects.Text;

  constructor() {
    super("Settings");
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
    
    const texture = graphics.generateTexture('settings_scanline', 4, 4);
    this.scanlines.setTexture('settings_scanline');
    
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
    
    // Create "settings" text with Pixeled English Font
    this.createStraightTitle(screenWidth/2, centerY - 150, "settings");

    // Settings options - centered below the title with increased gap using dungeon-mode-inverted font
    const settingsOptions = [
      "Audio Settings", 
      "Video Settings", 
      "Gameplay Settings", 
      "Controls", 
      "Back to Main Menu"
    ];
    const startY = centerY - 50; // Start higher to accommodate more options
    const spacing = 64; // Increased spacing between options
    
    settingsOptions.forEach((option, i) => {
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
            case "Audio Settings":
              this.showAudioSettings();
              break;
            case "Video Settings":
              this.showVideoSettings();
              break;
            case "Gameplay Settings":
              this.showGameplaySettings();
              break;
            case "Controls":
              this.showControls();
              break;
            case "Back to Main Menu":
              this.scene.start("MainMenu");
              break;
          }
        })
        .on("pointerover", () => {
          menuText.setColor("#e8eced"); // Highlight on hover
        })
        .on("pointerout", () => {
          menuText.setColor("#77888C"); // Return to normal
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
    this.createBackgroundEffects();
    this.createUI();
  }

  /**
   * Create a straight title with Pixeled English Font and updated color
   */
  private createStraightTitle(x: number, y: number, text: string): void {
    // Create the text with styling
    const titleText = this.add
      .text(x, y, text, {
        fontFamily: "Pixeled English Font", // Updated font
        fontSize: 100, // Smaller than main title
        color: "#77888C", // Updated color
      })
      .setOrigin(0.5);
    
    // Add subtle shadow
    titleText.setShadow(2, 2, '#000000', 0, true, false);
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

  /**
   * Audio settings with functional volume controls
   */
  private showAudioSettings(): void {
    // Clear existing UI
    this.children.removeAll();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "audio settings");
    
    // Get current music volume from MusicManager
    const musicManager = MusicManager.getInstance();
    const currentMusicVolume = musicManager.getVolume();
    const currentMasterVolume = this.sound.volume; // Phaser's master volume
    
    // Master Volume Slider
    this.createVolumeSlider(
      screenWidth/2,
      screenHeight/2 - 80,
      "Master Volume",
      currentMasterVolume,
      (volume: number) => {
        // Update Phaser's master volume
        this.sound.volume = volume;
        console.log(`Master Volume set to: ${Math.round(volume * 100)}%`);
      }
    );
    
    // Music Volume Slider
    this.createVolumeSlider(
      screenWidth/2,
      screenHeight/2,
      "Music Volume",
      currentMusicVolume,
      (volume: number) => {
        // Update MusicManager volume
        musicManager.setVolume(volume, true);
        console.log(`Music Volume set to: ${Math.round(volume * 100)}%`);
      }
    );
    
    // Add mute/unmute button for music
    const muteButton = this.add.text(
      screenWidth/2,
      screenHeight/2 + 80,
      musicManager.isMusicMuted() ? "Unmute Music" : "Mute Music",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 20,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
      musicManager.toggleMute();
      muteButton.setText(musicManager.isMusicMuted() ? "Unmute Music" : "Mute Music");
    })
    .on("pointerover", () => {
      muteButton.setColor("#e8eced");
    })
    .on("pointerout", () => {
      muteButton.setColor("#77888C");
    });
    
    // Add back button
    this.createBackButton();
  }
  
  /**
   * Create an interactive volume slider
   */
  private createVolumeSlider(
    x: number,
    y: number,
    label: string,
    initialVolume: number,
    onChange: (volume: number) => void
  ): void {
    // Label
    this.add.text(x, y - 30, label, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Slider background
    const sliderWidth = 400;
    const sliderHeight = 20;
    this.add.rectangle(x, y, sliderWidth, sliderHeight, 0x1f1410)
      .setStrokeStyle(2, 0x77888C);
    
    // Slider fill - positioned from left edge
    const sliderFill = this.add.rectangle(
      x - sliderWidth/2,
      y,
      sliderWidth * initialVolume,
      sliderHeight - 4,
      0x77888C
    ).setOrigin(0, 0.5);
    
    // Slider handle
    const handleSize = 30;
    const sliderHandle = this.add.rectangle(
      x - sliderWidth/2 + sliderWidth * initialVolume,
      y,
      handleSize,
      handleSize,
      0xe8eced
    ).setStrokeStyle(2, 0x77888C);
    
    // Volume percentage text
    const volumeText = this.add.text(
      x + sliderWidth/2 + 60,
      y,
      `${Math.round(initialVolume * 100)}%`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    ).setOrigin(0, 0.5);
    
    // Make slider interactive
    const sliderZone = this.add.rectangle(x, y, sliderWidth + 40, sliderHeight + 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true, draggable: true });
    
    const updateSlider = (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (x - sliderWidth/2);
      const volume = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      
      // Update visuals - fill grows from left
      sliderFill.width = sliderWidth * volume;
      sliderHandle.x = x - sliderWidth/2 + sliderWidth * volume;
      volumeText.setText(`${Math.round(volume * 100)}%`);
      
      // Call onChange callback
      onChange(volume);
    };
    
    sliderZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer);
    });
    
    sliderZone.on("drag", (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer);
    });
    
    // Hover effect on handle
    sliderZone.on("pointerover", () => {
      sliderHandle.setFillStyle(0xffffff);
    });
    
    sliderZone.on("pointerout", () => {
      sliderHandle.setFillStyle(0xe8eced);
    });
  }

  /**
   * Placeholder methods for settings categories
   */
  private showVideoSettings(): void {
    // Clear existing UI
    this.children.removeAll();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "video settings");
    
    // Add placeholder content
    this.add.text(
      screenWidth/2,
      screenHeight/2 - 50,
      "Video Settings - Placeholder",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2,
      screenHeight/2,
      "Resolution: [1920x1080] <- Click to change",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2,
      screenHeight/2 + 40,
      "Fullscreen: [ON] <- Click to toggle",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2,
      screenHeight/2 + 80,
      "VSync: [ON] <- Click to toggle",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Add back button
    this.createBackButton();
  }

  private showGameplaySettings(): void {
    // Clear existing UI
    this.children.removeAll();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "gameplay settings");
    
    // Add placeholder content
    this.add.text(
      screenWidth/2,
      screenHeight/2 - 50,
      "Gameplay Settings - Placeholder",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2,
      screenHeight/2,
      "Difficulty: [Normal] <- Click to change",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2,
      screenHeight/2 + 40,
      "Auto-Save: [ON] <- Click to toggle",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Add back button
    this.createBackButton();
  }

  private showControls(): void {
    // Clear existing UI
    this.children.removeAll();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "controls");
    
    // Add placeholder content
    this.add.text(
      screenWidth/2,
      screenHeight/2 - 100,
      "Controls - Placeholder",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 - 50,
      "Movement:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 - 50,
      "WASD / Arrow Keys",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 - 10,
      "Confirm:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 - 10,
      "Enter / Space",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 + 30,
      "Cancel:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 + 30,
      "Escape",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    // Add back button
    this.createBackButton();
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const backText = this.add
      .text(100, screenHeight - 100, "Back", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // Recreate the main settings UI
        this.children.removeAll();
        this.createBackgroundEffects();
        this.createUI();
      })
      .on("pointerover", () => {
        backText.setColor("#e8eced");
      })
      .on("pointerout", () => {
        backText.setColor("#77888C");
      });
  }
}
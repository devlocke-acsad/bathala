import { Scene, GameObjects } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { MusicLifecycleSystem } from "../../systems/shared/MusicLifecycleSystem";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  menuTexts: GameObjects.Text[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;
  private musicLifecycle!: MusicLifecycleSystem;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Start main menu music via MusicLifecycleSystem
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    this.createUI();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
    
    // Dev mode: Backtick (`) key to open Combat Debug Scene
    this.input.keyboard?.on('keydown-BACKTICK', () => {
      console.log('Opening Combat Debug Scene...');
      this.scene.launch('CombatDebugScene');
    });
    
    // Dev mode: Also bind to "1" key for easier access
    this.input.keyboard?.on('keydown-ONE', () => {
      console.log('Opening Combat Debug Scene...');
      this.scene.launch('CombatDebugScene');
    });
  }

  /**
   * Create epic atmospheric background effects
   */
  private createBackgroundEffects(): void {
    // Safety check for cameras
    if (!this.cameras || !this.cameras.main) {
      console.warn("Cameras not available yet, skipping background effects");
      return;
    }
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add background image
    const bgImage = this.add.image(width / 2, height / 2, 'chap1_no_leaves_boss');
    
    // Scale the background to cover the screen
    const scaleX = width / bgImage.width;
    const scaleY = height / bgImage.height;
    const scale = Math.max(scaleX, scaleY);
    bgImage.setScale(scale);
    bgImage.setDepth(-100);
    
    // Add lighter overlay - 50% opacity to show more background
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x150E10, 0.50);
    overlay.setDepth(-90);
    
    // Create highly visible floating embers/spirits
    const particles = this.add.particles(0, 0, '__WHITE', {
      x: { min: 0, max: width },
      y: { min: -20, max: height + 20 },
      lifespan: 5000,
      speed: { min: 20, max: 60 },
      angle: { min: 75, max: 105 }, // Slight drift
      scale: { start: 1.2, end: 0.3 }, // Much larger
      alpha: { start: 0.7, end: 0 }, // Very visible
      blendMode: 'ADD',
      frequency: 80, // Spawn faster
      tint: 0x77888C,
      maxParticles: 100, // Many more particles
      gravityY: 15 // Gentle downward pull
    });
    particles.setDepth(-70);
    
    // Add second layer of smaller, faster particles for depth
    const dustParticles = this.add.particles(0, 0, '__WHITE', {
      x: { min: 0, max: width },
      y: { min: -10, max: height + 10 },
      lifespan: 3000,
      speed: { min: 30, max: 80 },
      angle: { min: 70, max: 110 },
      scale: { start: 0.5, end: 0.1 },
      alpha: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      frequency: 60,
      tint: 0x99aabb,
      maxParticles: 80,
      gravityY: 20
    });
    dustParticles.setDepth(-75);
    
    // Create proper vignette effect with theme color #150E10
    const vignette = this.add.graphics();
    
    // Draw radial gradient manually with circles using #150E10
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height);
    
    for (let i = 0; i < 20; i++) {
      const radius = maxRadius * (1 - i / 20);
      const alpha = (i / 20) * 0.5; // Fade from 0 to 0.5 (reduced for visibility)
      vignette.fillStyle(0x150E10, alpha); // Using theme color
      vignette.fillCircle(centerX, centerY, radius);
    }
    
    vignette.setDepth(-80);
    
    // Subtle vignette pulse
    this.tweens.add({
      targets: vignette,
      alpha: 0.8,
      duration: 5000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
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
          // Music will auto-stop via shutdown() when scene.start() is called
          
          switch (option) {
            case "Play":
              // Reset game state when starting a new game
              console.log('🎮 Starting new game - resetting all game state...');
              GameState.getInstance().reset();
              OverworldGameState.getInstance().reset();
              RuleBasedDDA.getInstance().resetSession();
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
    
    // Add Dev Mode button in bottom right corner
    this.add
      .text(screenWidth - 40, screenHeight - 80, "[Dev Mode]", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d", // Yellow to stand out
        align: "right",
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        console.log('Opening Combat Debug Scene...');
        // Launch the scene if not already running
        if (!this.scene.isActive('CombatDebugScene')) {
          this.scene.launch('CombatDebugScene');
        }
        // Get the scene and make it visible
        const debugScene = this.scene.get('CombatDebugScene') as any;
        if (debugScene && debugScene.toggleVisibility) {
          // If it's hidden, show it
          if (!debugScene.isVisible) {
            debugScene.toggleVisibility();
          }
        }
      })
      .on("pointerover", function(this: Phaser.GameObjects.Text) {
        this.setColor("#ffffff"); // White on hover
      })
      .on("pointerout", function(this: Phaser.GameObjects.Text) {
        this.setColor("#ffd93d"); // Back to yellow
      });

    // Add Educational Debug Mode button (Above Dev Mode)
    this.add
      .text(screenWidth - 40, screenHeight - 110, "[Edu Mode]", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#2ed573", // Green to distinguish
        align: "right",
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        console.log('Opening Educational Events Debug Scene...');
        if (!this.scene.isActive('EducationalEventsDebugScene')) {
          this.scene.launch('EducationalEventsDebugScene');
        }
        const debugScene = this.scene.get('EducationalEventsDebugScene') as any;
        if (debugScene && debugScene.toggleVisibility) {
          if (!debugScene.isVisible) {
            debugScene.toggleVisibility();
          }
        }
      })
      .on("pointerover", function(this: Phaser.GameObjects.Text) {
        this.setColor("#ffffff");
      })
      .on("pointerout", function(this: Phaser.GameObjects.Text) {
        this.setColor("#2ed573");
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
    
    // Add subtle pulsing glow effect (no shadow)
    this.tweens.add({
      targets: titleText,
      alpha: 0.85,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
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
   * Shutdown cleanup
   * Music cleanup is handled automatically by MusicLifecycleSystem
   */
  shutdown(): void {
    // Clean up resize listener
    this.scale.off('resize', this.handleResize, this);
  }

  /**
   * Update method for animation effects
   */
  update(_time: number, _delta: number): void {
    // No animations to update
  }
}

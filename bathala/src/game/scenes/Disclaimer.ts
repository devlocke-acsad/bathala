import { Scene, GameObjects } from "phaser";
import { MusicManager } from "../../core/managers/MusicManager";

export class Disclaimer extends Scene {
  private canContinue: boolean = false;
  private continueText: GameObjects.Text;
  private currentPage: number = 0;
  private totalPages: number = 3;
  private contentContainer: GameObjects.Container;
  private isTransitioning: boolean = false;
  private music?: Phaser.Sound.BaseSound;

  constructor() {
    super("Disclaimer");
  }

  create() {
    // Set camera background color
    this.cameras.main.setBackgroundColor(0x150E10);

    // Start disclaimer music (placeholder_music according to sceneMusicMap)
    this.startMusic();

    // Create background effects
    this.createBackgroundEffects();

    // Create container for content (easier to fade in/out)
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setAlpha(0);

    // Show first page
    this.showPage(0);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Create atmospheric background effects
   */
  private createBackgroundEffects(): void {
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
    
    // Add overlay - 50% opacity
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x150E10, 0.50);
    overlay.setDepth(-90);
    
    // Create subtle floating particles
    const particles = this.add.particles(0, 0, '__WHITE', {
      x: { min: 0, max: width },
      y: { min: -20, max: height + 20 },
      lifespan: 5000,
      speed: { min: 20, max: 60 },
      angle: { min: 75, max: 105 },
      scale: { start: 0.8, end: 0.2 },
      alpha: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      frequency: 100,
      tint: 0x77888C,
      maxParticles: 60,
      gravityY: 15
    });
    particles.setDepth(-70);
    
    // Create vignette effect
    const vignette = this.add.graphics();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height);
    
    for (let i = 0; i < 20; i++) {
      const radius = maxRadius * (1 - i / 20);
      const alpha = (i / 20) * 0.4;
      vignette.fillStyle(0x150E10, alpha);
      vignette.fillCircle(centerX, centerY, radius);
    }
    
    vignette.setDepth(-80);
  }

  /**
   * Show a specific page of disclaimers
   */
  private showPage(pageIndex: number): void {
    this.currentPage = pageIndex;
    
    // Clear previous content
    this.contentContainer.removeAll(true);
    
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    // Create content based on page
    switch (pageIndex) {
      case 0:
        this.createPage1Content(centerX, centerY);
        break;
      case 1:
        this.createPage2Content(centerX, centerY);
        break;
      case 2:
        this.createPage3Content(centerX, centerY);
        break;
    }

    // Fade in the content
    this.tweens.add({
      targets: this.contentContainer,
      alpha: 1,
      duration: 800,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Enable input after fade in completes
        this.time.delayedCall(500, () => {
          this.canContinue = true;
          if (this.currentPage < this.totalPages - 1) {
            this.setupInputHandlers();
            this.startContinueTextPulse();
          } else {
            // Last page - continue to main menu
            this.setupInputHandlers();
            this.startContinueTextPulse();
          }
        });
      }
    });
  }

  /**
   * Page 1: Fullscreen Recommendation
   */
  private createPage1Content(centerX: number, centerY: number): void {
    // Main text
    const mainText = this.add.text(centerX, centerY - 60, "For the best gameplay experience,\nplease play in FULLSCREEN mode.", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    this.contentContainer.add(mainText);

    // Instructions
    const instructions = this.add.text(centerX, centerY + 30, "Press F11 (Windows/Linux) or Cmd+Ctrl+F (Mac)\nto toggle fullscreen.", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    this.contentContainer.add(instructions);

    // Continue prompt
    this.continueText = this.add.text(centerX, centerY + 160, "Press ANY KEY or CLICK to continue", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5).setAlpha(0);
    this.contentContainer.add(this.continueText);
  }

  /**
   * Page 2: Work of Fiction
   */
  private createPage2Content(centerX: number, centerY: number): void {
    // Main text
    const mainText = this.add.text(centerX, centerY - 80, "This game is inspired by Filipino mythology\nand folklore.", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    this.contentContainer.add(mainText);

    // Explanation
    const explanation = this.add.text(centerX, centerY + 10, "While we honor authentic cultural sources,\nBathala is a creative interpretation and does not\nrepresent 100% accurate historical or\ncultural depictions.", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    this.contentContainer.add(explanation);

    // Continue prompt
    this.continueText = this.add.text(centerX, centerY + 160, "Press ANY KEY or CLICK to continue", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5).setAlpha(0);
    this.contentContainer.add(this.continueText);
  }

  /**
   * Page 3: Cultural Respect
   */
  private createPage3Content(centerX: number, centerY: number): void {
    // Main message
    const mainText = this.add.text(centerX, centerY - 40, "Created with deep respect and reverence\nfor Filipino culture and its rich\nmythological traditions.", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    this.contentContainer.add(mainText);

    // Continue prompt
    this.continueText = this.add.text(centerX, centerY + 120, "Press ANY KEY or CLICK to continue", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5).setAlpha(0);
    this.contentContainer.add(this.continueText);
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers(): void {
    // Keyboard input
    this.input.keyboard?.on('keydown', this.handleContinue, this);
    
    // Mouse click input
    this.input.on('pointerdown', this.handleContinue, this);
  }

  /**
   * Handle continue action - advance to next page or go to main menu
   */
  private handleContinue(): void {
    if (!this.canContinue || this.isTransitioning) return;
    
    // Prevent multiple triggers
    this.canContinue = false;
    this.isTransitioning = true;
    
    // Remove input listeners
    this.input.keyboard?.off('keydown', this.handleContinue, this);
    this.input.off('pointerdown', this.handleContinue, this);
    
    // Stop continue text pulse
    this.tweens.killTweensOf(this.continueText);
    
    // Fade out current content
    this.tweens.add({
      targets: this.contentContainer,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeOut',
      onComplete: () => {
        if (this.currentPage < this.totalPages - 1) {
          // Show next page
          this.isTransitioning = false;
          this.showPage(this.currentPage + 1);
        } else {
          // All pages shown, go to MainMenu
          // Stop music BEFORE transitioning
          if (this.music) {
            console.log(`Disclaimer: Stopping music before transition to MainMenu`);
            this.music.stop();
            this.music.destroy();
            this.music = undefined;
          }
          
          this.cameras.main.fadeOut(500, 21, 14, 16);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MainMenu');
          });
        }
      }
    });
  }

  /**
   * Start pulsing animation for continue text
   */
  private startContinueTextPulse(): void {
    // Fade in first
    this.tweens.add({
      targets: this.continueText,
      alpha: 1,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Then start pulsing
        this.tweens.add({
          targets: this.continueText,
          alpha: 0.4,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Don't attempt resize if scene is not fully initialized
    if (!this.cameras || !this.cameras.main) {
      return;
    }
    
    // Clear and recreate everything on resize
    this.children.removeAll();
    this.tweens.killAll();
    this.canContinue = false;
    this.isTransitioning = false;
    
    this.createBackgroundEffects();
    
    // Recreate container
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setAlpha(0);
    
    // Show current page again
    this.showPage(this.currentPage);
  }

  /**
   * Start music for this scene
   */
  private startMusic(): void {
    try {
      // Stop any existing music first
      if (this.music) {
        console.log(`Disclaimer: Stopping existing music before starting new track`);
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
      
      const manager = MusicManager.getInstance();
      const musicConfig = manager.getMusicKeyForScene(this.scene.key);
      
      if (!musicConfig) {
        console.warn(`Disclaimer: No music configured for scene "${this.scene.key}"`);
        return;
      }

      // Check if audio key exists in cache
      if (!this.cache.audio.exists(musicConfig.musicKey)) {
        console.warn(`Disclaimer: Audio key "${musicConfig.musicKey}" not found in cache. Skipping music.`);
        return;
      }
      
      this.music = this.sound.add(musicConfig.musicKey, {
        volume: manager.getEffectiveMusicVolume(),
        loop: true
      });
      
      this.music.play();
      console.log(`✅ Disclaimer: Started music "${musicConfig.musicKey}"`);
    } catch (error) {
      console.error(`Disclaimer: Failed to start music:`, error);
      // Game continues without music
    }
  }

  /**
   * Stop music when leaving the scene
   */
  shutdown(): void {
    try {
      if (this.music) {
        console.log(`Disclaimer: Stopping music on scene shutdown`);
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
    } catch (error) {
      console.error(`Disclaimer: Failed to stop music:`, error);
    }
    
    // Clean up resize listener
    this.scale.off('resize', this.handleResize, this);
  }
}

import { Scene } from "phaser";
import { ActManager } from "../../core/managers/ActManager";

/**
 * ChapterTransition Scene
 * Displays a cinematic chapter title screen when transitioning between chapters.
 * Uses ActManager for chapter-aware names, subtitles, and colors.
 */
export class ChapterTransition extends Scene {
  private targetChapter: number = 1;
  private isSkipping: boolean = false;

  constructor() {
    super({ key: "ChapterTransition" });
  }

  init(data: { chapter: number }): void {
    this.targetChapter = data.chapter || 1;
    this.isSkipping = false;
    console.log(`🎬 ChapterTransition initialized for Chapter ${this.targetChapter}`);
  }

  create(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Get chapter configuration from ActManager
    const actManager = ActManager.getInstance();
    const actConfig = actManager.getActConfig(this.targetChapter);

    // Chapter name and subtitle from ActConfig (with fallbacks)
    const chapterName = actConfig?.subtitle || `Act ${this.targetChapter}`;
    const chapterSubtitleText = actConfig ? `Where ${actConfig.theme.primaryElements.join(' and ').toLowerCase()} converge` : "";

    // Chapter-specific colors from ActConfig theme palette
    const defaultColors = { primary: "#4ade80", secondary: "#166534", bg: 0x0d1f0d };
    const colors = actConfig ? {
      primary: `#${actConfig.theme.colorPalette.primary.toString(16).padStart(6, '0')}`,
      secondary: `#${actConfig.theme.colorPalette.secondary.toString(16).padStart(6, '0')}`,
      bg: actConfig.theme.colorPalette.secondary
    } : defaultColors;

    // Set background color
    this.cameras.main.setBackgroundColor(colors.bg);

    // Create dark overlay
    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000,
      0.9
    );

    // Create decorative lines (use scaleX to expand from center)
    const lineWidth = screenWidth * 0.6;
    const topLine = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2 - 100,
      lineWidth,
      2,
      Phaser.Display.Color.HexStringToColor(colors.primary).color
    ).setOrigin(0.5).setScale(0, 1).setAlpha(0);

    const bottomLine = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2 + 100,
      lineWidth,
      2,
      Phaser.Display.Color.HexStringToColor(colors.primary).color
    ).setOrigin(0.5).setScale(0, 1).setAlpha(0);

    // Chapter number text
    const chapterNumber = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 50,
      `CHAPTER ${this.targetChapter}`,
      {
        fontFamily: "dungeon-mode",
        fontSize: "24px",
        color: colors.primary,
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0);

    // Chapter title text
    const chapterTitle = this.add.text(
      screenWidth / 2,
      screenHeight / 2,
      chapterName,
      {
        fontFamily: "dungeon-mode",
        fontSize: "48px",
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.8);

    // Chapter subtitle text
    const chapterSubtitle = this.add.text(
      screenWidth / 2,
      screenHeight / 2 + 60,
      chapterSubtitleText,
      {
        fontFamily: "dungeon-mode",
        fontSize: "18px",
        color: colors.secondary,
        align: "center",
        fontStyle: "italic"
      }
    ).setOrigin(0.5).setAlpha(0);

    // Skip hint
    const skipHint = this.add.text(
      screenWidth / 2,
      screenHeight - 40,
      "Press any key or click to skip",
      {
        fontFamily: "dungeon-mode",
        fontSize: "12px",
        color: "#666666",
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0);

    // Create particle effect
    this.createParticleEffect(screenWidth, screenHeight, colors.primary);

    // Animation sequence using chained tweens
    // Step 1: Show lines (animate scaleX from 0 to 1 to expand from center)
    this.tweens.add({
      targets: [topLine, bottomLine],
      alpha: 1,
      scaleX: 1,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        if (this.isSkipping) return;
        
        // Step 2: Show chapter number
        this.tweens.add({
          targets: chapterNumber,
          alpha: 1,
          y: screenHeight / 2 - 70,
          duration: 500,
          ease: 'Back.easeOut',
          onComplete: () => {
            if (this.isSkipping) return;
            
            // Step 3: Show chapter title
            this.tweens.add({
              targets: chapterTitle,
              alpha: 1,
              scale: 1,
              duration: 800,
              ease: 'Back.easeOut'
            });
            
            // Step 4: Show subtitle (slightly delayed)
            this.tweens.add({
              targets: chapterSubtitle,
              alpha: 1,
              duration: 500,
              delay: 200,
              ease: 'Power2',
              onComplete: () => {
                if (this.isSkipping) return;
                
                // Show skip hint
                this.tweens.add({
                  targets: skipHint,
                  alpha: 0.5,
                  duration: 500
                });
                
                // Step 5: Hold then fade out (after 2.5 seconds)
                this.time.delayedCall(2500, () => {
                  if (this.isSkipping) return;
                  this.fadeOutAndTransition(overlay, chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint);
                });
              }
            });
          }
        });
      }
    });

    // Allow skip with any key or click
    this.input.keyboard?.once('keydown', () => this.skipTransition());
    this.input.once('pointerdown', () => this.skipTransition());
  }

  /**
   * Fade out all elements and transition to Overworld
   */
  private fadeOutAndTransition(
    overlay: Phaser.GameObjects.Rectangle,
    chapterNumber: Phaser.GameObjects.Text,
    chapterTitle: Phaser.GameObjects.Text,
    chapterSubtitle: Phaser.GameObjects.Text,
    topLine: Phaser.GameObjects.Rectangle,
    bottomLine: Phaser.GameObjects.Rectangle,
    skipHint: Phaser.GameObjects.Text
  ): void {
    // Fade out all text and lines
    this.tweens.add({
      targets: [chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint],
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // Fade to full black
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            this.startOverworld();
          }
        });
      }
    });
  }

  /**
   * Skip the transition and go directly to Overworld
   */
  private skipTransition(): void {
    if (this.isSkipping) return;
    this.isSkipping = true;
    
    console.log("⏭️ Chapter transition skipped");
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.startOverworld();
  }

  /**
   * Start the Overworld scene
   */
  private startOverworld(): void {
    console.log("🗺️ Chapter transition complete, starting Overworld...");
    this.scene.start("Overworld");
  }

  /**
   * Create subtle floating particle effect
   */
  private createParticleEffect(screenWidth: number, screenHeight: number, color: string): void {
    const particleCount = 15;
    const colorNum = Phaser.Display.Color.HexStringToColor(color).color;

    for (let i = 0; i < particleCount; i++) {
      const x = Phaser.Math.Between(0, screenWidth);
      const y = Phaser.Math.Between(screenHeight / 2, screenHeight);
      const size = Phaser.Math.Between(2, 4);
      
      const particle = this.add.circle(x, y, size, colorNum, 0.2);
      
      // Floating animation
      this.tweens.add({
        targets: particle,
        y: y - Phaser.Math.Between(100, 300),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 8000),
        ease: 'Power1.easeOut',
        delay: Phaser.Math.Between(0, 3000)
      });
    }
  }
}

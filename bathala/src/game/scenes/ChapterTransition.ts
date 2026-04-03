import { Scene } from "phaser";
import { ActManager } from "../../core/managers/ActManager";
import { CHAPTER_NARRATIVES } from "../../data/NarrativeData";
import { MusicLifecycleSystem } from "../../systems/audio/MusicLifecycleSystem";

/**
 * ChapterTransition Scene
 * Displays a cinematic chapter title screen when transitioning between chapters.
 * Uses ActManager for chapter-aware names, subtitles, and colors.
 * Now includes narrative text from the story design.
 */
export class ChapterTransition extends Scene {
  private targetChapter: number = 1;
  private isSkipping: boolean = false;
  private musicLifecycle?: MusicLifecycleSystem;

  constructor() {
    super({ key: "ChapterTransition" });
  }

  init(data: { chapter: number }): void {
    this.targetChapter = data.chapter || 1;
    this.isSkipping = false;
    console.log(`🎬 ChapterTransition initialized for Chapter ${this.targetChapter}`);
  }

  create(): void {
    this.musicLifecycle = new MusicLifecycleSystem(this, { actId: this.targetChapter });
    this.musicLifecycle.start();

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Get chapter configuration from ActManager
    const actManager = ActManager.getInstance();
    const actConfig = actManager.getActConfig(this.targetChapter);

    // Chapter name and subtitle from ActConfig (with fallbacks)
    const chapterName = actConfig?.subtitle || `Act ${this.targetChapter}`;
    const chapterSubtitleText = actConfig ? `Where ${actConfig.theme.primaryElements.join(' and ').toLowerCase()} converge` : "";

    // Get narrative text for this chapter
    const narrative = CHAPTER_NARRATIVES[this.targetChapter];
    const narrativeText = narrative?.entryText || "";

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
    const lineWidth = screenWidth * 0.7; // Wider to fit narrative
    const topLine = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2 - 120, // Moved higher for spacing
      lineWidth,
      2,
      Phaser.Display.Color.HexStringToColor(colors.primary).color
    ).setOrigin(0.5).setScale(0, 1).setAlpha(0);

    const bottomLine = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2 + 180, // Brought further down to give narrative more space
      lineWidth,
      2,
      Phaser.Display.Color.HexStringToColor(colors.primary).color
    ).setOrigin(0.5).setScale(0, 1).setAlpha(0);

    // Chapter number text
    const chapterNumber = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 100, // Move higher up to wait for animation
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
      screenHeight / 2 - 60, // Pulled slightly higher
      chapterName,
      {
        fontFamily: "dungeon-mode",
        fontSize: "36px", // Smaller
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.8);

    // Chapter subtitle text
    const chapterSubtitle = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 15, // Keep at same place
      chapterSubtitleText,
      {
        fontFamily: "dungeon-mode",
        fontSize: "16px", // Smaller
        color: colors.secondary,
        align: "center",
        fontStyle: "italic"
      }
    ).setOrigin(0.5).setAlpha(0);

    // Narrative text — story-driven line below the subtitle, more prominent
    const narrativeLabel = this.add.text(
      screenWidth / 2,
      screenHeight / 2 + 80, // Pushed much lower to clear subtitle
      narrativeText,
      {
        fontFamily: "dungeon-mode",
        fontSize: "16px", // Smaller
        color: "#d4e0e8",
        align: "center",
        fontStyle: "normal", // changed to normal for dark souls impact
        wordWrap: { width: screenWidth * 0.7 },
        lineSpacing: 18 // Pushed lines further apart
      }
    ).setOrigin(0.5).setAlpha(0);

    // Initial position lower for the slide up effect
    narrativeLabel.setY(screenHeight / 2 + 130);

    // Skip hint
    const skipHint = this.add.text(
      screenWidth / 2,
      screenHeight - 40,
      "Press any key or click to continue",
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
          y: screenHeight / 2 - 90, // Ends up slightly higher
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

                // Step 4b: Show narrative text with clean fade and slide-up
                this.tweens.add({
                  targets: narrativeLabel,
                  alpha: 0.9,
                  y: screenHeight / 2 + 80, // slide to final position
                  duration: 1000,
                  ease: 'Power3.easeOut'
                });

                // Show skip hint
                this.tweens.add({
                  targets: skipHint,
                  alpha: 0.5,
                  duration: 500,
                  delay: 1000
                });

                // Step 5: Wait for user input to continue, or auto-continue after a shorter timer
                this.time.delayedCall(4000, () => {
                  if (this.isSkipping) return;
                  this.fadeOutAndTransition(overlay, chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint, narrativeLabel);
                });
              }
            });
          }
        });
      }
    });

    // Allow advance/skip with any key or click
    this.input.keyboard?.once('keydown', () => {
      if (!this.isSkipping) {
        this.isSkipping = true;
        this.fadeOutAndTransition(overlay, chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint, narrativeLabel);
      }
    });
    this.input.once('pointerdown', () => {
      if (!this.isSkipping) {
        this.isSkipping = true;
        this.fadeOutAndTransition(overlay, chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint, narrativeLabel);
      }
    });
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
    skipHint: Phaser.GameObjects.Text,
    narrativeLabel: Phaser.GameObjects.Text
  ): void {
    // Fade out all text and lines
    this.tweens.add({
      targets: [chapterNumber, chapterTitle, chapterSubtitle, topLine, bottomLine, skipHint, narrativeLabel],
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        // Fade to full black, then hand off to per-chapter cutscene
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            this.startChapterCutscene();
          }
        });
      }
    });
  }

  // Function removed because logic is handled in the input event listeners

  /**
   * Start the per-chapter cutscene scene.
   * This ensures story cutscenes always appear immediately after the transition card.
   */
  private startChapterCutscene(): void {
    console.log("🎬 Chapter transition complete, starting ChapterCutscene...");
    this.scene.start("ChapterCutscene", { chapter: this.targetChapter });
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

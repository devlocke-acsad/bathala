import { Scene, GameObjects } from "phaser";
import { CHAPTER_NARRATIVES } from "../../data/NarrativeData";
import { ActManager } from "../../core/managers/ActManager";

/** Theme for cutscene VFX: bg, particle colors, and effect style */
interface ChapterEffectTheme {
  bg: number;
  overlayTint: number;
  overlayAlpha: number;
  particleColors: number[];
  /** "forest" | "water" | "celestial" */
  effectStyle: "forest" | "water" | "celestial";
}

function getChapterEffectTheme(chapter: number): ChapterEffectTheme {
  const actConfig = ActManager.getInstance().getActConfig(chapter);
  switch (chapter) {
    case 1:
      return {
        bg: actConfig?.theme.colorPalette.secondary ?? 0x0d1f0d,
        overlayTint: 0x0a1812,
        overlayAlpha: 0.92,
        particleColors: [
          actConfig?.theme.colorPalette.primary ?? 0x2d4a3e,
          actConfig?.theme.colorPalette.secondary ?? 0x1a2f26,
          actConfig?.theme.colorPalette.accent ?? 0x77888c,
          0x3d5c4e,
          0x4a6b5a,
        ],
        effectStyle: "forest",
      };
    case 2:
      return {
        bg: 0x0a1628,
        overlayTint: 0x061020,
        overlayAlpha: 0.92,
        particleColors: [0x1e3a5f, 0x2d5a87, 0x4a90b8, 0x6bb3d0, 0x8fc9e8],
        effectStyle: "water",
      };
    case 3:
      return {
        bg: 0x1a0a2e,
        overlayTint: 0x120818,
        overlayAlpha: 0.92,
        particleColors: [0xffd700, 0xf5e6a3, 0xc0b0e0, 0x8899cc, 0xffffff],
        effectStyle: "celestial",
      };
    default:
      return {
        bg: 0x0d0d12,
        overlayTint: 0x08080a,
        overlayAlpha: 0.95,
        particleColors: [0x444466, 0x77888c],
        effectStyle: "forest",
      };
  }
}

/**
 * ChapterCutscene Scene
 * Plays a short, story-driven cutscene right after the per-chapter transition.
 * Uses the chapter's `cutsceneSlides` from NarrativeData and theme-matched VFX.
 */
export class ChapterCutscene extends Scene {
  private targetChapter: number = 1;
  private typingTween?: Phaser.Tweens.Tween;
  private effectObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "ChapterCutscene" });
  }

  init(data: { chapter: number }): void {
    this.targetChapter = data.chapter || 1;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const theme = getChapterEffectTheme(this.targetChapter);

    this.cameras.main.setBackgroundColor(theme.bg);

    const narrative = CHAPTER_NARRATIVES[this.targetChapter];
    const slides =
      narrative?.cutsceneSlides && narrative.cutsceneSlides.length > 0
        ? narrative.cutsceneSlides
        : [narrative?.entryText ?? ""];

    let currentSlide = 0;

    // Themed overlay (slightly tinted instead of pure black)
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      theme.overlayTint,
      theme.overlayAlpha
    );
    overlay.setDepth(0);

    // Vignette: darken edges for a cinematic look
    this.createVignette(width, height, theme);

    // Chapter-themed ambient effects (behind text)
    this.createChapterEffects(width, height, theme);

    const textObject = this.add.text(width / 2, height / 2, "", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#d4e0e8",
      align: "center",
      wordWrap: { width: width * 0.7 },
      lineSpacing: 14,
    })
      .setOrigin(0.5)
      .setDepth(25);

    const controlsText = this.add
      .text(width / 2, height - 40, "Click or press SPACE to continue", {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setDepth(25);

    const spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    const advance = () => {
      if (currentSlide >= slides.length) {
        this.finishCutscene();
        return;
      }

      const slideText = slides[currentSlide++];
      this.playSlide(textObject, slideText);
    };

    this.input.on("pointerdown", advance);
    if (spaceKey) {
      spaceKey.on("down", advance);
    }

    advance();
  }

  private createVignette(
    width: number,
    height: number,
    theme: ChapterEffectTheme
  ): void {
    const g = this.add.graphics().setDepth(1);
    this.effectObjects.push(g);
    const centerX = width / 2;
    const centerY = height / 2;
    const maxR = Math.max(width, height) * 0.72;
    const steps = 10;
    // Draw rings from outside in so center stays clear; inner punch uses overlay color
    for (let i = steps - 1; i >= 0; i--) {
      const r0 = (maxR * i) / steps;
      const r1 = (maxR * (i + 1)) / steps;
      const alpha = 0.06 + (i / steps) * 0.4;
      g.fillStyle(0x000000, alpha);
      g.fillCircle(centerX, centerY, r1);
      g.fillStyle(theme.overlayTint, 1);
      g.fillCircle(centerX, centerY, r0);
    }
  }

  private createChapterEffects(
    width: number,
    height: number,
    theme: ChapterEffectTheme
  ): void {
    if (theme.effectStyle === "forest") {
      this.createForestEffects(width, height, theme.particleColors);
    } else if (theme.effectStyle === "water") {
      this.createWaterEffects(width, height, theme.particleColors);
    } else {
      this.createCelestialEffects(width, height, theme.particleColors);
    }
  }

  /** Floating leaves / dust: elongated shapes drifting upward from bottom */
  private createForestEffects(width: number, height: number, colors: number[]): void {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, width);
      const startY = height + Phaser.Math.Between(0, 120);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const w = Phaser.Math.Between(4, 14);
      const h = Phaser.Math.Between(2, 6);
      const leaf = this.add.rectangle(x, startY, w, h, color, 0.25);
      leaf.setAngle(Phaser.Math.Between(0, 360));
      leaf.setDepth(5);
      this.effectObjects.push(leaf);

      const duration = Phaser.Math.Between(8000, 16000);
      const endY = -20 - Phaser.Math.Between(0, 80);
      const driftX = Phaser.Math.Between(-80, 80);

      this.tweens.add({
        targets: leaf,
        y: endY,
        x: leaf.x + driftX,
        alpha: 0.08,
        duration,
        ease: "Linear",
        delay: i * 200,
        onComplete: () => {
          if (leaf.active) {
            leaf.setY(height + Phaser.Math.Between(0, 60));
            leaf.setAlpha(0.25);
            leaf.setX(Phaser.Math.Between(0, width));
            this.tweens.add({
              targets: leaf,
              y: -30,
              x: leaf.x + Phaser.Math.Between(-60, 60),
              alpha: 0.08,
              duration: Phaser.Math.Between(7000, 14000),
              ease: "Linear",
            });
          }
        },
      });
    }

    // Subtle “root” lines at bottom (static, very faint)
    const g = this.add.graphics().setDepth(4);
    this.effectObjects.push(g);
    g.lineStyle(1, colors[0], 0.06);
    for (let i = 0; i < 6; i++) {
      const bx = (width * (i + 1)) / 7 + Phaser.Math.Between(-20, 20);
      g.beginPath();
      g.moveTo(bx, height);
      g.lineTo(bx - 15, height + 40);
      g.lineTo(bx + 10, height + 70);
      g.strokePath();
    }
  }

  /** Rising bubbles and soft horizontal wave lines */
  private createWaterEffects(width: number, height: number, colors: number[]): void {
    const bubbleCount = 24;
    for (let i = 0; i < bubbleCount; i++) {
      const x = Phaser.Math.Between(0, width);
      const startY = height + Phaser.Math.Between(0, 100);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const radius = Phaser.Math.Between(3, 10);
      const bubble = this.add.circle(x, startY, radius, color, 0.2);
      bubble.setDepth(5);
      this.effectObjects.push(bubble);

      const duration = Phaser.Math.Between(6000, 12000);
      const endY = -30;
      const driftX = Phaser.Math.Between(-40, 40);

      this.tweens.add({
        targets: bubble,
        y: endY,
        x: bubble.x + driftX,
        alpha: 0.05,
        scale: 0.6,
        duration,
        ease: "Linear",
        delay: i * 180,
        onComplete: () => {
          if (bubble.active) {
            bubble.setY(height + Phaser.Math.Between(0, 80));
            bubble.setAlpha(0.2);
            bubble.setScale(1);
            bubble.setX(Phaser.Math.Between(0, width));
            this.tweens.add({
              targets: bubble,
              y: -30,
              x: bubble.x + Phaser.Math.Between(-30, 30),
              alpha: 0.05,
              scale: 0.5,
              duration: Phaser.Math.Between(5000, 11000),
              ease: "Linear",
            });
          }
        },
      });
    }

    // Gentle horizontal “wave” lines (subtle)
    const waveY = height * 0.85;
    const wave = this.add.rectangle(
      width / 2,
      waveY,
      width + 100,
      2,
      colors[2],
      0.06
    ).setDepth(4);
    this.effectObjects.push(wave);
    this.tweens.add({
      targets: wave,
      y: waveY + 8,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /** Twinkling stars and soft drifting particles */
  private createCelestialEffects(
    width: number,
    height: number,
    colors: number[]
  ): void {
    const starCount = 35;
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, color, 0.15);
      star.setDepth(5);
      this.effectObjects.push(star);

      // Twinkle: alpha pulse
      this.tweens.add({
        targets: star,
        alpha: 0.45,
        duration: Phaser.Math.Between(1200, 2500),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 80,
      });

      // Very slow drift
      this.tweens.add({
        targets: star,
        x: star.x + Phaser.Math.Between(-30, 30),
        y: star.y - Phaser.Math.Between(10, 40),
        duration: Phaser.Math.Between(10000, 18000),
        ease: "Linear",
        onComplete: () => {
          if (star.active) {
            star.setX(Phaser.Math.Between(0, width));
            star.setY(height + Phaser.Math.Between(0, 20));
            this.tweens.add({
              targets: star,
              x: star.x + Phaser.Math.Between(-25, 25),
              y: -10,
              duration: Phaser.Math.Between(12000, 20000),
              ease: "Linear",
            });
          }
        },
      });
    }

    // Soft radial “glow” at top-center (ethereal)
    const glow = this.add.circle(width / 2, height * 0.2, 200, 0xffd700, 0.03);
    glow.setDepth(3);
    this.effectObjects.push(glow);
    this.tweens.add({
      targets: glow,
      alpha: 0.08,
      scale: 1.3,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private playSlide(textObject: GameObjects.Text, text: string): void {
    if (this.typingTween?.isPlaying()) {
      this.typingTween.stop();
    }

    textObject.setAlpha(0);
    textObject.setText(text);

    const targetY = this.cameras.main.height / 2;
    textObject.setY(targetY + 20);

    this.typingTween = this.tweens.add({
      targets: textObject,
      alpha: 1,
      y: targetY,
      duration: 800,
      ease: "Power3",
    });
  }

  private finishCutscene(): void {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.start("Overworld", { fadeIn: true });
    });
  }
}


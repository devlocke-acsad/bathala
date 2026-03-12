import { Scene, GameObjects } from "phaser";
import { CHAPTER_NARRATIVES } from "../../data/NarrativeData";

/**
 * ChapterCutscene Scene
 * Plays a short, story-driven cutscene right after the per-chapter transition.
 * Uses the chapter's `cutsceneSlides` from NarrativeData as source of truth.
 */
export class ChapterCutscene extends Scene {
  private targetChapter: number = 1;
  private typingTween?: Phaser.Tweens.Tween;
  private skipButton?: GameObjects.Text;

  constructor() {
    super({ key: "ChapterCutscene" });
  }

  init(data: { chapter: number }): void {
    this.targetChapter = data.chapter || 1;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x000000);

    const narrative = CHAPTER_NARRATIVES[this.targetChapter];
    const slides = narrative?.cutsceneSlides && narrative.cutsceneSlides.length > 0
      ? narrative.cutsceneSlides
      : [narrative?.entryText ?? ""];

    let currentSlide = 0;

    // Dim background overlay for cinematic feel
    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x050608,
      0.95
    );

    const textObject = this.add.text(width / 2, height / 2, "", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#d4e0e8",
      align: "center",
      wordWrap: { width: width * 0.7 },
      lineSpacing: 14,
    }).setOrigin(0.5);

    const controlsText = this.add.text(
      width / 2,
      height - 40,
      "Click or press SPACE to continue",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setAlpha(0.8);

    const spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

  private playSlide(textObject: GameObjects.Text, text: string): void {
    // Kill any ongoing tween
    if (this.typingTween && this.typingTween.isPlaying()) {
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
    // Simple fade-out, then go to Overworld
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.scene.start("Overworld", { fadeIn: true });
    });
  }
}


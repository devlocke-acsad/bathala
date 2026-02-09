/**
 * ChapterIndicatorController - Chapter name badge + transition cinematic
 *
 * Manages:
 *  - The small HUD badge showing "CHAPTER 1 — The Enchanted Forest"
 *  - The full-screen chapter transition sequence (fade → title → fade)
 *
 * @module systems/world/ChapterIndicatorController
 */

import Phaser from 'phaser';
import type { Chapter } from '../../core/types/CombatTypes';

// =============================================================================
// CHAPTER METADATA
// =============================================================================

interface ChapterMeta {
  name: string;
  subtitle: string;
  borderColor: number;
}

const CHAPTER_META: Record<Chapter, ChapterMeta> = {
  1: {
    name: 'The Enchanted Forest',
    subtitle: 'Where ancient spirits dwell',
    borderColor: 0x44bb44,
  },
  2: {
    name: 'The Submerged Barangays',
    subtitle: 'Depths of forgotten villages',
    borderColor: 0x4488ff,
  },
  3: {
    name: 'The Skyward Citadel',
    subtitle: 'Realm of the divine',
    borderColor: 0x9944ff,
  },
};

// =============================================================================
// CONTROLLER
// =============================================================================

export class ChapterIndicatorController {
  private scene: Phaser.Scene;
  private badgeContainer: Phaser.GameObjects.Container | null = null;
  private transitionContainer: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ---- Badge (HUD) -----------------------------------------------------------

  /**
   * Create or update the small chapter badge in the HUD.
   * Position it above the left panel, for example.
   */
  createBadge(x: number, y: number, chapter: Chapter): void {
    this.destroyBadge();

    const meta = CHAPTER_META[chapter];
    const w = 220;
    const h = 44;

    this.badgeContainer = this.scene.add.container(x, y).setDepth(850);

    const bg = this.scene.add.rectangle(0, 0, w, h, 0x150E10).setStrokeStyle(2, meta.borderColor);
    const chapterLabel = this.scene.add.text(0, -8, `CHAPTER ${chapter}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '12px',
      color: '#FFD368',
    }).setOrigin(0.5);
    const nameLabel = this.scene.add.text(0, 10, meta.name, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#e8eced',
    }).setOrigin(0.5);

    this.badgeContainer.add([bg, chapterLabel, nameLabel]);
  }

  destroyBadge(): void {
    if (this.badgeContainer) {
      this.badgeContainer.destroy();
      this.badgeContainer = null;
    }
  }

  // ---- Transition cinematic --------------------------------------------------

  /**
   * Play the full-screen chapter transition.
   *
   * Sequence:
   *  1. Fade to black (1 s)
   *  2. Show chapter text (fade in 0.8 s)
   *  3. Hold (2 s)
   *  4. Fade out text + unlock (0.8 s)
   *
   * @returns Promise that resolves when the transition is complete.
   */
  playTransition(chapter: Chapter): Promise<void> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      const meta = CHAPTER_META[chapter];

      this.transitionContainer = this.scene.add.container(0, 0).setDepth(2000);

      // Full-screen black
      const black = this.scene.add
        .rectangle(width / 2, height / 2, width, height, 0x000000)
        .setAlpha(0);
      this.transitionContainer.add(black);

      // Text (invisible initially)
      const chapterNum = this.scene.add.text(width / 2, height * 0.35, `Chapter ${chapter}`, {
        fontFamily: 'dungeon-mode',
        fontSize: '36px',
        color: '#FFD368',
      }).setOrigin(0.5).setAlpha(0);

      const chapterName = this.scene.add.text(width / 2, height * 0.45, meta.name, {
        fontFamily: 'dungeon-mode',
        fontSize: '24px',
        color: '#e8eced',
      }).setOrigin(0.5).setAlpha(0);

      const subtitle = this.scene.add.text(width / 2, height * 0.53, `"${meta.subtitle}"`, {
        fontFamily: 'dungeon-mode',
        fontSize: '14px',
        color: '#77888C',
        fontStyle: 'italic',
      }).setOrigin(0.5).setAlpha(0);

      this.transitionContainer.add([chapterNum, chapterName, subtitle]);

      // Phase 1: fade to black
      this.scene.tweens.add({
        targets: black,
        alpha: 1,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          // Phase 2: show text
          this.scene.tweens.add({
            targets: [chapterNum, chapterName, subtitle],
            alpha: 1,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
              // Phase 3: hold
              this.scene.time.delayedCall(2000, () => {
                // Phase 4: fade out everything
                this.scene.tweens.add({
                  targets: this.transitionContainer,
                  alpha: 0,
                  duration: 800,
                  ease: 'Power2',
                  onComplete: () => {
                    this.destroyTransition();
                    resolve();
                  },
                });
              });
            },
          });
        },
      });
    });
  }

  private destroyTransition(): void {
    if (this.transitionContainer) {
      this.transitionContainer.destroy();
      this.transitionContainer = null;
    }
  }

  // ---- Queries ---------------------------------------------------------------

  static getChapterMeta(chapter: Chapter): ChapterMeta {
    return CHAPTER_META[chapter];
  }

  static getChapterName(chapter: Chapter): string {
    return CHAPTER_META[chapter].name;
  }

  // ---- Cleanup ---------------------------------------------------------------

  destroy(): void {
    this.destroyBadge();
    this.destroyTransition();
  }
}

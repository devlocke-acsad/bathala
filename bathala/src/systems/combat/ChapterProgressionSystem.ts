/**
 * ChapterProgressionSystem - Handles boss-defeat → chapter transition logic
 * 
 * Replaces the hardcoded boss-name checks in Combat.ts's
 * handleChapterProgression() and returnToOverworld() methods.
 * 
 * @module systems/combat/ChapterProgressionSystem
 */

/** Defines what happens when a boss is defeated */
export interface BossChapterMapping {
  /** Boss name to match */
  bossName: string;
  /** Chapter this boss appears in */
  chapter: number;
  /** Next chapter to unlock (null means game complete / epilogue) */
  nextChapter: number | null;
}

/**
 * Registry of boss → chapter transition mappings.
 * Add new bosses here to support additional acts.
 */
const BOSS_MAPPINGS: BossChapterMapping[] = [
  { bossName: 'Kapre Shade', chapter: 1, nextChapter: 2 },
  { bossName: 'Bakunawa', chapter: 2, nextChapter: 3 },
  { bossName: 'False Bathala', chapter: 3, nextChapter: null },
];

/**
 * Result of checking boss defeat for chapter progression
 */
export interface ProgressionResult {
  /** Whether a chapter transition should occur */
  shouldTransition: boolean;
  /** The new chapter to start (null means game complete) */
  nextChapter: number | null;
  /** Whether this is the final boss (triggers epilogue) */
  isGameComplete: boolean;
}

/**
 * Pure logic system for chapter progression.
 * No Phaser or GameState dependency.
 */
export class ChapterProgressionSystem {

  /**
   * Check if defeating this enemy triggers a chapter transition.
   * 
   * @param enemyName - Name of the defeated enemy
   * @param currentChapter - The chapter the combat took place in
   * @returns Progression result indicating what should happen next
   */
  static checkProgression(
    enemyName: string,
    currentChapter: number
  ): ProgressionResult {
    const mapping = BOSS_MAPPINGS.find(
      m => m.bossName === enemyName && m.chapter === currentChapter
    );

    if (!mapping) {
      return {
        shouldTransition: false,
        nextChapter: null,
        isGameComplete: false,
      };
    }

    return {
      shouldTransition: true,
      nextChapter: mapping.nextChapter,
      isGameComplete: mapping.nextChapter === null,
    };
  }

  /**
   * Check if a given enemy name is a boss in any chapter
   */
  static isBoss(enemyName: string): boolean {
    return BOSS_MAPPINGS.some(m => m.bossName === enemyName);
  }

  /**
   * Get the boss name for a given chapter
   */
  static getBossNameForChapter(chapter: number): string | undefined {
    return BOSS_MAPPINGS.find(m => m.chapter === chapter)?.bossName;
  }

  /**
   * Register a new boss → chapter mapping (for extensibility)
   */
  static registerBossMapping(mapping: BossChapterMapping): void {
    // Remove existing mapping for same boss/chapter if present
    const idx = BOSS_MAPPINGS.findIndex(
      m => m.bossName === mapping.bossName && m.chapter === mapping.chapter
    );
    if (idx !== -1) {
      BOSS_MAPPINGS.splice(idx, 1);
    }
    BOSS_MAPPINGS.push(mapping);
  }
}

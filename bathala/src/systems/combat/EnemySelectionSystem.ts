/**
 * EnemySelectionSystem - Chapter-aware enemy selection
 * 
 * Replaces the hardcoded switch-case in Combat.ts that imports
 * from Act1Enemies, Act2Enemies, Act3Enemies separately.
 * 
 * Delegates to chapter-specific data modules through a unified interface.
 * 
 * @module systems/combat/EnemySelectionSystem
 */

import { Enemy } from '../../core/types/CombatTypes';
import {
  getRandomCommonEnemy as getAct1Common,
  getRandomEliteEnemy as getAct1Elite,
  getBossEnemy as getAct1Boss,
  getEnemyByName as getAct1ByName,
} from '../../data/enemies/Act1Enemies';
import {
  getRandomCommonEnemy as getAct2Common,
  getRandomEliteEnemy as getAct2Elite,
  getBossEnemy as getAct2Boss,
  getEnemyByName as getAct2ByName,
} from '../../data/enemies/Act2Enemies';
import {
  getRandomCommonEnemy as getAct3Common,
  getRandomEliteEnemy as getAct3Elite,
  getBossEnemy as getAct3Boss,
  getEnemyByName as getAct3ByName,
} from '../../data/enemies/Act3Enemies';

/** Functions to fetch enemies for a specific chapter */
interface ChapterEnemyProvider {
  getRandomCommon: () => Omit<Enemy, 'id'>;
  getRandomElite: () => Omit<Enemy, 'id'>;
  getBoss: () => Omit<Enemy, 'id'>;
  getByName: (name: string) => Omit<Enemy, 'id'> | null;
}

/** Registry of chapter providers */
const CHAPTER_PROVIDERS: Record<number, ChapterEnemyProvider> = {
  1: {
    getRandomCommon: getAct1Common,
    getRandomElite: getAct1Elite,
    getBoss: getAct1Boss,
    getByName: getAct1ByName,
  },
  2: {
    getRandomCommon: getAct2Common,
    getRandomElite: getAct2Elite,
    getBoss: getAct2Boss,
    getByName: getAct2ByName,
  },
  3: {
    getRandomCommon: getAct3Common,
    getRandomElite: getAct3Elite,
    getBoss: getAct3Boss,
    getByName: getAct3ByName,
  },
};

/**
 * Provides chapter-aware enemy selection.
 * 
 * Centralizes the logic previously duplicated in Combat.ts
 * as switch-case statements over currentChapter.
 */
export class EnemySelectionSystem {
  
  /**
   * Get a provider for the given chapter.
   * Falls back to chapter 1 if unknown.
   */
  private static getProvider(chapter: number): ChapterEnemyProvider {
    return CHAPTER_PROVIDERS[chapter] ?? CHAPTER_PROVIDERS[1];
  }

  /**
   * Get an enemy based on node type and chapter.
   * Replaces the hardcoded getEnemyForNodeType() in Combat.ts.
   */
  static getEnemyForNodeType(
    nodeType: string,
    chapter: number
  ): Omit<Enemy, 'id'> {
    const provider = this.getProvider(chapter);

    switch (nodeType) {
      case 'elite':
        return provider.getRandomElite();
      case 'boss':
        return provider.getBoss();
      case 'common':
      case 'combat':
      default:
        return provider.getRandomCommon();
    }
  }

  /**
   * Get a specific enemy by name, searching across all chapters.
   * Replaces getSpecificEnemyById() in Combat.ts.
   */
  static getEnemyByName(
    enemyId: string,
    fallbackChapter: number = 1
  ): Omit<Enemy, 'id'> {
    // Search all chapters in order
    for (const chapterNum of Object.keys(CHAPTER_PROVIDERS).map(Number)) {
      const provider = CHAPTER_PROVIDERS[chapterNum];
      const enemy = provider.getByName(enemyId);
      if (enemy) return enemy;
    }

    // Fallback to random common in the fallback chapter
    console.warn(
      `Enemy "${enemyId}" not found in any chapter, falling back to random common`
    );
    return this.getProvider(fallbackChapter).getRandomCommon();
  }

  /**
   * Generate a unique enemy ID from a name
   */
  static generateEnemyId(enemyName: string): string {
    return (
      enemyName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    );
  }

  /**
   * Register a new chapter provider (for extensibility)
   */
  static registerChapter(
    chapter: number,
    provider: ChapterEnemyProvider
  ): void {
    CHAPTER_PROVIDERS[chapter] = provider;
  }
}

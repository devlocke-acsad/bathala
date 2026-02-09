/**
 * ActContentProvider - Centralized, act-aware content access
 *
 * Merges functionality from ActManager, the enemy registry, relic helpers,
 * potion helpers, and event pools into a single façade. Scenes call
 * `ActContentProvider.forChapter(1)` to get type-safe access to everything
 * for that chapter.
 *
 * This replaces scattered imports like:
 *   import { act1CommonRelics } from 'data/relics/Act1Relics'
 *   import { getEnemiesByTier } from 'data/enemies/registry'
 *   import { act1Events } from 'data/events/Act1Events'
 *
 * with:
 *   const content = ActContentProvider.forChapter(1);
 *   content.getRelicPool('elite')
 *   content.getEnemiesByTier('common')
 *   content.getEvents()
 *
 * @module systems/combat/ActContentProvider
 */

import type { Chapter } from '../../core/types/CombatTypes';
import type { Relic } from '../../core/types/CombatTypes';
import type { EnemyConfig, BossConfig } from '../../core/types/EnemyTypes';

// Import enemy registry
import {
  getEnemiesByTier,
  getEnemiesByChapter,
  getEnemy,
  getAllBosses,
} from '../../data/enemies/registry';

// Import relic data — barrel re-exports with act-prefixed aliases
import {
  act1CommonRelics,
  act1EliteRelics,
  act1BossRelics,
  act1TreasureRelics,
  act1ShopRelics,
  act1MythologicalRelics,
} from '../../data/relics';
import {
  act2CommonRelics,
  act2EliteRelics,
  act2BossRelics,
  act2TreasureRelics,
  act2ShopRelics,
} from '../../data/relics';
import {
  act3CommonRelics,
  act3EliteRelics,
  act3BossRelics,
  act3TreasureRelics,
  act3ShopRelics,
} from '../../data/relics';
import { getRelicById } from '../../data/relics';

// Import potion data
import {
  getChapterCommonPotions,
  getChapterUncommonPotions,
  getChapterRarePotions,
} from '../../data/potions';

// Import event data
import {
  Act1Events,
  Act1EducationalEvents,
} from '../../data/events';

// =============================================================================
// TYPES
// =============================================================================

export type RelicPoolSource =
  | 'common'
  | 'elite'
  | 'boss'
  | 'treasure'
  | 'shop'
  | 'mythological';

export type PotionRarity = 'common' | 'uncommon' | 'rare';

export type EnemyTier = 'common' | 'elite' | 'boss';

export interface Potion {
  id: string;
  name: string;
  description: string;
  effect: string;
  emoji: string;
  rarity: PotionRarity;
}

// =============================================================================
// PER-CHAPTER CONTENT HANDLE
// =============================================================================

export class ChapterContent {
  constructor(public readonly chapter: Chapter) {}

  // ---- Enemies ---------------------------------------------------------------

  /** All enemies for this chapter */
  getEnemies(): EnemyConfig[] {
    return getEnemiesByChapter(this.chapter);
  }

  /** Enemies filtered by tier */
  getEnemiesByTier(tier: EnemyTier): EnemyConfig[] {
    return getEnemiesByTier(tier).filter(e => e.chapter === this.chapter);
  }

  /** Get a specific enemy by id */
  getEnemy(id: string): EnemyConfig | undefined {
    return getEnemy(id);
  }

  /** Pick a random enemy by tier from this chapter */
  getRandomEnemy(tier: EnemyTier): EnemyConfig | undefined {
    const pool = this.getEnemiesByTier(tier);
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** Get the chapter boss */
  getBoss(): BossConfig | undefined {
    // Find the boss whose chapter matches this chapter
    return getAllBosses().find(b => b.chapter === this.chapter);
  }

  // ---- Relics ----------------------------------------------------------------

  /** Get relics for a particular source pool */
  getRelicPool(source: RelicPoolSource): Relic[] {
    return RELIC_POOLS[this.chapter]?.[source] ?? [];
  }

  /** Get ALL relics for this chapter */
  getAllRelics(): Relic[] {
    const pools = RELIC_POOLS[this.chapter];
    if (!pools) return [];
    return Object.values(pools).flat();
  }

  /** Look up a relic by id (across all chapters) */
  getRelicById(id: string): Relic | undefined {
    try {
      return getRelicById(id);
    } catch {
      return undefined;
    }
  }

  /** Pick a random relic from a given source pool */
  getRandomRelic(source: RelicPoolSource): Relic | undefined {
    const pool = this.getRelicPool(source);
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ---- Potions ---------------------------------------------------------------

  /** Get potions by rarity for this chapter */
  getPotionsByRarity(rarity: PotionRarity): Potion[] {
    switch (rarity) {
      case 'common': return getChapterCommonPotions(this.chapter) as Potion[];
      case 'uncommon': return getChapterUncommonPotions(this.chapter) as Potion[];
      case 'rare': return getChapterRarePotions(this.chapter) as Potion[];
    }
  }

  /** Get ALL potions for this chapter */
  getAllPotions(): Potion[] {
    return [
      ...this.getPotionsByRarity('common'),
      ...this.getPotionsByRarity('uncommon'),
      ...this.getPotionsByRarity('rare'),
    ];
  }

  /** Pick a random potion weighted by rarity */
  getRandomPotion(): Potion | undefined {
    const roll = Math.random();
    let pool: Potion[];
    if (roll < 0.50) {
      pool = this.getPotionsByRarity('common');
    } else if (roll < 0.85) {
      pool = this.getPotionsByRarity('uncommon');
    } else {
      pool = this.getPotionsByRarity('rare');
    }
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** Look up a potion by id (across all chapters) */
  getPotionById(id: string): Potion | undefined {
    for (const ch of [1, 2, 3] as Chapter[]) {
      const all = [
        ...getChapterCommonPotions(ch),
        ...getChapterUncommonPotions(ch),
        ...getChapterRarePotions(ch),
      ] as Potion[];
      const found = all.find(p => p.id === id);
      if (found) return found;
    }
    return undefined;
  }

  // ---- Events ----------------------------------------------------------------

  /** Traditional game events for this chapter */
  getEvents(): unknown[] {
    // Traditional events are currently only available for Act 1
    return Act1Events;
  }

  /** Educational events for this chapter */
  getEducationalEvents(): unknown[] {
    // Educational events currently only for Act 1
    return Act1EducationalEvents;
  }
}

// =============================================================================
// RELIC POOL REGISTRY
// =============================================================================

const RELIC_POOLS: Record<Chapter, Record<RelicPoolSource, Relic[]>> = {
  1: {
    common: act1CommonRelics,
    elite: act1EliteRelics,
    boss: act1BossRelics,
    treasure: act1TreasureRelics,
    shop: act1ShopRelics,
    mythological: act1MythologicalRelics ?? [],
  },
  2: {
    common: act2CommonRelics,
    elite: act2EliteRelics,
    boss: act2BossRelics,
    treasure: act2TreasureRelics,
    shop: act2ShopRelics,
    mythological: [],
  },
  3: {
    common: act3CommonRelics,
    elite: act3EliteRelics,
    boss: act3BossRelics,
    treasure: act3TreasureRelics,
    shop: act3ShopRelics,
    mythological: [],
  },
};

// =============================================================================
// STATIC PROVIDER
// =============================================================================

export class ActContentProvider {
  private static cache = new Map<Chapter, ChapterContent>();

  /**
   * Get a content handle for a specific chapter
   * Results are cached per chapter.
   */
  static forChapter(chapter: Chapter): ChapterContent {
    let content = ActContentProvider.cache.get(chapter);
    if (!content) {
      content = new ChapterContent(chapter);
      ActContentProvider.cache.set(chapter, content);
    }
    return content;
  }

  /**
   * Look up a relic by id across all chapters
   */
  static getRelicById(id: string): Relic | undefined {
    try {
      return getRelicById(id);
    } catch {
      return undefined;
    }
  }

  /**
   * Look up a potion by id across all chapters
   */
  static getPotionById(id: string): Potion | undefined {
    for (const ch of [1, 2, 3] as Chapter[]) {
      const content = ActContentProvider.forChapter(ch);
      const found = content.getPotionById(id);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Look up an enemy by id (not chapter-scoped)
   */
  static getEnemy(id: string): EnemyConfig | undefined {
    return getEnemy(id);
  }

  /** Clear cached handles (for testing) */
  static clearCache(): void {
    ActContentProvider.cache.clear();
  }
}

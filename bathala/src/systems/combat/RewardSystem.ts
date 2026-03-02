/**
 * RewardSystem - Calculates post-combat rewards independent of Phaser
 * 
 * Handles:
 * - Gold (ginto) rewards scaled by enemy tier and DDA
 * - Spirit fragment rewards based on Landás alignment
 * - Relic drop selection based on chapter and enemy tier
 * - Potion drop selection based on chapter
 * 
 * @module systems/combat/RewardSystem
 */

import { Landas } from '../../core/types/CombatTypes';

/** Enemy tier for reward calculation */
export type RewardEnemyTier = 'common' | 'elite' | 'boss';

/** Reward calculation inputs */
export interface RewardInput {
  enemyTier: RewardEnemyTier;
  chapter: number;
  landasScore: number;
  ddaGoldMultiplier: number;
  playerRelicIds: string[];
}

/** Calculated combat reward */
export interface CombatReward {
  ginto: number;
  spiritFragments: number;
  relicDropChance: number;
  potionDropChance: number;
}

/**
 * Base gold rewards by enemy tier
 */
const BASE_GINTO: Record<RewardEnemyTier, number> = {
  common: 15,
  elite: 35,
  boss: 100,
};

/**
 * Relic drop chances by enemy tier (percentage)
 */
const RELIC_DROP_CHANCE: Record<RewardEnemyTier, number> = {
  common: 0.1,   // 10%
  elite: 0.6,    // 60%
  boss: 1.0,     // 100%
};

/**
 * Potion drop chances by enemy tier (percentage)
 */
const POTION_DROP_CHANCE: Record<RewardEnemyTier, number> = {
  common: 0.3,   // 30%
  elite: 0.5,    // 50%
  boss: 0.8,     // 80%
};

/**
 * Calculates post-combat rewards.
 * Pure logic - no Phaser or singleton dependency.
 */
export class RewardSystem {
  /**
   * Scale an existing gold reward by DDA multiplier.
   * Useful when rewards are authored externally (e.g. dialogue rewards).
   */
  scaleGoldReward(baseGold: number, ddaGoldMultiplier: number): number {
    return Math.round(baseGold * ddaGoldMultiplier);
  }

  /**
   * Calculate rewards for a combat victory
   */
  calculateRewards(input: RewardInput): CombatReward {
    const baseGinto = BASE_GINTO[input.enemyTier] ?? BASE_GINTO.common;
    const adjustedGinto = Math.round(baseGinto * input.ddaGoldMultiplier);

    const spiritFragments = this.calculateSpiritFragments(
      input.landasScore,
      input.enemyTier
    );

    return {
      ginto: adjustedGinto,
      spiritFragments,
      relicDropChance: RELIC_DROP_CHANCE[input.enemyTier] ?? 0,
      potionDropChance: POTION_DROP_CHANCE[input.enemyTier] ?? 0,
    };
  }

  /**
   * Calculate spirit fragment reward based on Landás alignment
   * 
   * Per GDD v5.8.14.25:
   * - Mercy (+5 to +10): More Spirit Fragments
   * - Balance (-4 to +4): Standard
   * - Conquest (-10 to -5): More gold (handled in ginto)
   */
  private calculateSpiritFragments(
    landasScore: number,
    enemyTier: RewardEnemyTier
  ): number {
    const baseTierBonus: Record<RewardEnemyTier, number> = {
      common: 1,
      elite: 3,
      boss: 10,
    };

    const base = baseTierBonus[enemyTier] ?? 1;

    // Mercy alignment bonus
    if (landasScore >= 5) {
      return Math.round(base * 1.5);
    }
    // Conquest alignment - reduced fragments
    if (landasScore <= -5) {
      return Math.round(base * 0.5);
    }
    // Balance - standard
    return base;
  }

  /**
   * Get the Landás tier for a given score
   */
  getLandasTier(landasScore: number): Landas {
    if (landasScore >= 5) return 'Mercy';
    if (landasScore <= -5) return 'Conquest';
    return 'Balance';
  }

  /**
   * Determine if a relic should drop based on tier chance
   */
  shouldDropRelic(enemyTier: RewardEnemyTier): boolean {
    return Math.random() < (RELIC_DROP_CHANCE[enemyTier] ?? 0);
  }

  /**
   * Determine if a potion should drop based on tier chance
   */
  shouldDropPotion(enemyTier: RewardEnemyTier): boolean {
    return Math.random() < (POTION_DROP_CHANCE[enemyTier] ?? 0);
  }
}

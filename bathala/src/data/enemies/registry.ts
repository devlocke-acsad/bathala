/**
 * Enemy Registry - Central lookup for all enemy configurations
 * 
 * @module EnemyRegistry
 * @description Provides lookup functions for the enemy pool
 * 
 * This registry allows:
 * - Looking up any enemy by ID
 * - Filtering enemies by tier, chapter, activity time, etc.
 * - Easy addition of new enemies without modifying manager code
 * 
 * Usage:
 * ```typescript
 * import { getEnemy, getEnemiesByTier, getAllEnemies } from '../data/enemies/registry';
 * 
 * const kapre = getEnemy('kapre_shade');
 * const elites = getEnemiesByTier('elite');
 * ```
 */

import { EnemyConfig, BossConfig, EnemyTier, isBossConfig } from '../../core/types/EnemyTypes';

// Import all creatures
import {
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  KAPRE_SHADE,
  TAWONG_LIPOD,
  MANGANGAWAY
} from './creatures';

// =============================================================================
// ENEMY POOL - All enemies in the game
// =============================================================================

/**
 * Master list of all enemies
 * Add new enemies here to make them available throughout the game
 */
const ALL_ENEMIES: EnemyConfig[] = [
  // Common
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  // Elite
  KAPRE_SHADE,
  TAWONG_LIPOD,
  // Boss
  MANGANGAWAY,
];

/**
 * Enemy lookup map (built once, used for O(1) lookups)
 */
const ENEMY_MAP: Map<string, EnemyConfig> = new Map(
  ALL_ENEMIES.map(enemy => [enemy.id, enemy])
);

/**
 * Boss lookup map
 */
const BOSS_MAP: Map<string, BossConfig> = new Map(
  ALL_ENEMIES.filter(isBossConfig).map(boss => [boss.id, boss])
);

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get an enemy by ID
 * 
 * @param id - Enemy ID (e.g., 'tikbalang_scout')
 * @returns The enemy config or undefined
 */
export function getEnemy(id: string): EnemyConfig | undefined {
  return ENEMY_MAP.get(id);
}

/**
 * Get a boss by ID
 * 
 * @param id - Boss ID (e.g., 'mangangaway')
 * @returns The boss config or undefined
 */
export function getBoss(id: string): BossConfig | undefined {
  return BOSS_MAP.get(id);
}

/**
 * Check if an enemy exists
 * 
 * @param id - Enemy ID to check
 * @returns true if enemy exists in registry
 */
export function hasEnemy(id: string): boolean {
  return ENEMY_MAP.has(id);
}

/**
 * Get all enemies
 * 
 * @returns Array of all enemy configs
 */
export function getAllEnemies(): EnemyConfig[] {
  return [...ALL_ENEMIES];
}

/**
 * Get all bosses
 * 
 * @returns Array of all boss configs
 */
export function getAllBosses(): BossConfig[] {
  return ALL_ENEMIES.filter(isBossConfig);
}

// =============================================================================
// FILTERING FUNCTIONS
// =============================================================================

/**
 * Get enemies by tier
 * 
 * @param tier - 'common', 'elite', or 'boss'
 * @returns Array of matching enemies
 */
export function getEnemiesByTier(tier: EnemyTier): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.tier === tier);
}

/**
 * Get enemies by chapter (first appearance)
 * Note: Enemies can appear in ANY chapter, this is just their origin
 * 
 * @param chapter - Chapter number (1, 2, 3)
 * @returns Array of enemies that first appear in that chapter
 */
export function getEnemiesByChapter(chapter: number): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.chapter === chapter);
}

/**
 * Get enemies active during day
 * 
 * @returns Array of day-active enemies
 */
export function getDayActiveEnemies(): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.activeAtDay);
}

/**
 * Get enemies active during night
 * 
 * @returns Array of night-active enemies
 */
export function getNightActiveEnemies(): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.activeAtNight);
}

/**
 * Get enemies by pathing type
 * 
 * @param pathingType - The movement behavior type
 * @returns Array of matching enemies
 */
export function getEnemiesByPathingType(
  pathingType: EnemyConfig['pathingType']
): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.pathingType === pathingType);
}

/**
 * Get enemies by elemental weakness
 * 
 * @param element - The element they're weak to
 * @returns Array of matching enemies
 */
export function getEnemiesWeakTo(element: string): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.elementalWeakness === element);
}

/**
 * Get enemies by elemental resistance
 * 
 * @param element - The element they resist
 * @returns Array of matching enemies
 */
export function getEnemiesResistantTo(element: string): EnemyConfig[] {
  return ALL_ENEMIES.filter(e => e.elementalResistance === element);
}

// =============================================================================
// RANDOM SELECTION
// =============================================================================

/**
 * Get a random enemy matching filter criteria
 * 
 * @param options - Filter options (optional)
 * @returns A random enemy config or undefined if none match
 * 
 * @example
 * // Random common enemy from chapter 1
 * const enemy = getRandomEnemy({ tier: 'common', chapter: 1 });
 * 
 * // Random enemy from any tier (excludes bosses by default)
 * const anyEnemy = getRandomEnemy();
 */
export function getRandomEnemy(options?: EnemyFilterOptions): EnemyConfig | undefined {
  let pool: EnemyConfig[];
  
  if (options) {
    pool = filterEnemies(options);
  } else {
    // Default: exclude bosses
    pool = ALL_ENEMIES.filter(e => e.tier !== 'boss');
  }
  
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get multiple random enemies matching filter criteria (no duplicates)
 * 
 * @param count - Number of enemies to select
 * @param options - Filter options (optional)
 * @returns Array of random enemies
 * 
 * @example
 * // Get 3 random elite enemies from chapter 2
 * const elites = getRandomEnemies(3, { tier: 'elite', chapter: 2 });
 */
export function getRandomEnemies(count: number, options?: EnemyFilterOptions): EnemyConfig[] {
  let pool: EnemyConfig[];
  
  if (options) {
    pool = filterEnemies(options);
  } else {
    // Default: exclude bosses
    pool = ALL_ENEMIES.filter(e => e.tier !== 'boss');
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// =============================================================================
// MULTI-CRITERIA FILTERING
// =============================================================================

/**
 * Filter options for enemy queries
 */
export interface EnemyFilterOptions {
  tier?: EnemyTier;
  chapter?: number;
  activeAtDay?: boolean;
  activeAtNight?: boolean;
  pathingType?: EnemyConfig['pathingType'];
  elementalWeakness?: string;
  elementalResistance?: string;
  excludeIds?: string[];
}

/**
 * Get enemies matching multiple criteria
 * 
 * @param options - Filter criteria
 * @returns Array of matching enemies
 * 
 * @example
 * // Get common enemies active at night, weak to fire
 * const enemies = filterEnemies({
 *   tier: 'common',
 *   activeAtNight: true,
 *   elementalWeakness: 'fire'
 * });
 */
export function filterEnemies(options: EnemyFilterOptions): EnemyConfig[] {
  return ALL_ENEMIES.filter(enemy => {
    if (options.tier && enemy.tier !== options.tier) return false;
    if (options.chapter && enemy.chapter !== options.chapter) return false;
    if (options.activeAtDay !== undefined && enemy.activeAtDay !== options.activeAtDay) return false;
    if (options.activeAtNight !== undefined && enemy.activeAtNight !== options.activeAtNight) return false;
    if (options.pathingType && enemy.pathingType !== options.pathingType) return false;
    if (options.elementalWeakness && enemy.elementalWeakness !== options.elementalWeakness) return false;
    if (options.elementalResistance && enemy.elementalResistance !== options.elementalResistance) return false;
    if (options.excludeIds && options.excludeIds.includes(enemy.id)) return false;
    return true;
  });
}

// =============================================================================
// STATISTICS
// =============================================================================

/**
 * Get registry statistics
 */
export function getRegistryStats(): {
  total: number;
  byTier: Record<EnemyTier, number>;
  byChapter: Record<number, number>;
} {
  const byTier: Record<EnemyTier, number> = { common: 0, elite: 0, boss: 0 };
  const byChapter: Record<number, number> = {};
  
  for (const enemy of ALL_ENEMIES) {
    byTier[enemy.tier]++;
    byChapter[enemy.chapter] = (byChapter[enemy.chapter] || 0) + 1;
  }
  
  return {
    total: ALL_ENEMIES.length,
    byTier,
    byChapter
  };
}

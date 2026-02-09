/**
 * EnemyManager.ts
 * 
 * Singleton manager for enemy configurations. Provides act-aware enemy
 * selection by delegating to the central registry.
 * 
 * Enemies are defined independently in src/data/enemies/creatures/ and
 * registered in the registry. This manager provides convenient access
 * methods that integrate with the ActManager.
 * 
 * @module core/managers/EnemyManager
 * 
 * @example
 * ```typescript
 * const enemyManager = EnemyManager.getInstance();
 * 
 * // Get a specific enemy by ID
 * const tikbalang = enemyManager.getEnemyConfig('tikbalang_scout');
 * 
 * // Get random common enemy for current act
 * const enemy = enemyManager.getRandomEnemy('common');
 * 
 * // Get boss for current act
 * const boss = enemyManager.getBossForCurrentAct();
 * ```
 */

import type { EnemyConfig, BossConfig, EnemyTier } from '../types/EnemyTypes';
import { ActManager } from './ActManager';
import * as Registry from '../../data/enemies/registry';

/**
 * EnemyManager - Singleton for enemy configuration management
 * 
 * Delegates to the central registry for lookups while providing
 * act-aware selection methods.
 */
export class EnemyManager {
  private static instance: EnemyManager;
  
  /**
   * Private constructor - use getInstance() instead
   * All enemy data comes from the registry.
   */
  private constructor() {
    // No manual registration needed - uses registry
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): EnemyManager {
    if (!EnemyManager.instance) {
      EnemyManager.instance = new EnemyManager();
    }
    return EnemyManager.instance;
  }
  
  // ===========================================================================
  // RETRIEVAL - BY ID (delegates to registry)
  // ===========================================================================
  
  /**
   * Get enemy config by ID
   * 
   * @param enemyId - The enemy ID to look up
   * @returns The enemy config or undefined if not found
   */
  getEnemyConfig(enemyId: string): EnemyConfig | undefined {
    return Registry.getEnemy(enemyId);
  }
  
  /**
   * Get boss config by ID
   * 
   * @param bossId - The boss ID to look up
   * @returns The boss config or undefined if not found
   */
  getBossConfig(bossId: string): BossConfig | undefined {
    return Registry.getBoss(bossId);
  }
  
  /**
   * Check if an enemy exists in the registry
   * 
   * @param enemyId - The enemy ID to check
   * @returns true if enemy exists
   */
  isEnemyRegistered(enemyId: string): boolean {
    return Registry.getEnemy(enemyId) !== undefined;
  }
  
  // ===========================================================================
  // RETRIEVAL - BY ACT
  // ===========================================================================
  
  /**
   * Get all enemies for current act
   * 
   * @param tier - Optional tier filter ('common', 'elite', 'boss')
   * @returns Array of enemy configs for current act
   */
  getEnemiesForCurrentAct(tier?: EnemyTier): EnemyConfig[] {
    const actManager = ActManager.getInstance();
    const currentAct = actManager.getCurrentActId();
    return this.getEnemiesForAct(currentAct, tier);
  }
  
  /**
   * Get all enemies for a specific act
   * 
   * @param actId - The act ID
   * @param tier - Optional tier filter
   * @returns Array of enemy configs for the specified act
   */
  getEnemiesForAct(actId: number, tier?: EnemyTier): EnemyConfig[] {
    return Registry.filterEnemies({
      chapter: actId,
      tier: tier
    });
  }
  
  /**
   * Get boss for current act
   * 
   * @returns The boss config for current act, or undefined
   */
  getBossForCurrentAct(): BossConfig | undefined {
    const actManager = ActManager.getInstance();
    const actConfig = actManager.getCurrentActConfig();
    return Registry.getBoss(actConfig.bossId);
  }
  
  /**
   * Get boss for a specific act
   * 
   * @param actId - The act ID
   * @returns The boss config or undefined
   */
  getBossForAct(actId: number): BossConfig | undefined {
    const actManager = ActManager.getInstance();
    const actConfig = actManager.getActConfig(actId);
    if (!actConfig) return undefined;
    return Registry.getBoss(actConfig.bossId);
  }
  
  // ===========================================================================
  // RANDOM SELECTION
  // ===========================================================================
  
  /**
   * Get random enemy for current act
   * 
   * @param tier - Enemy tier (default: 'common')
   * @returns A random enemy config or undefined if none available
   */
  getRandomEnemy(tier: EnemyTier = 'common'): EnemyConfig | undefined {
    const actManager = ActManager.getInstance();
    const currentAct = actManager.getCurrentActId();
    return Registry.getRandomEnemy({
      chapter: currentAct,
      tier: tier
    });
  }
  
  /**
   * Get random enemy from a specific act
   * 
   * @param actId - The act ID
   * @param tier - Enemy tier (default: 'common')
   * @returns A random enemy config or undefined
   */
  getRandomEnemyForAct(actId: number, tier: EnemyTier = 'common'): EnemyConfig | undefined {
    return Registry.getRandomEnemy({
      chapter: actId,
      tier: tier
    });
  }
  
  /**
   * Get multiple random enemies (no duplicates)
   * 
   * @param count - Number of enemies to select
   * @param tier - Enemy tier (default: 'common')
   * @returns Array of random enemy configs
   */
  getRandomEnemies(count: number, tier: EnemyTier = 'common'): EnemyConfig[] {
    const actManager = ActManager.getInstance();
    const currentAct = actManager.getCurrentActId();
    return Registry.getRandomEnemies(count, {
      chapter: currentAct,
      tier: tier
    });
  }
  
  // ===========================================================================
  // SPRITE HELPERS
  // ===========================================================================
  
  /**
   * Get sprite key for an enemy
   * Uses convention: chap{N}/{enemyId} if not explicitly set
   * 
   * @param enemyId - The enemy ID
   * @returns Sprite key string or empty string if not found
   */
  getSpriteKey(enemyId: string): string {
    const config = Registry.getEnemy(enemyId);
    if (!config) return '';
    return config.combatSpriteKey || `chap${config.chapter}/${enemyId}`;
  }
  
  /**
   * Get portrait key for an enemy (for dialogue display)
   * 
   * @param enemyId - The enemy ID
   * @returns Portrait key or undefined
   */
  getPortraitKey(enemyId: string): string | undefined {
    return Registry.getEnemy(enemyId)?.portraitKey;
  }
  
  // ===========================================================================
  // TIME-OF-DAY FILTERING
  // ===========================================================================
  
  /**
   * Get enemies active during day
   * 
   * @param actId - Optional act ID (uses current if not specified)
   * @returns Array of enemy configs active during day
   */
  getDayActiveEnemies(actId?: number): EnemyConfig[] {
    const chapter = actId ?? ActManager.getInstance().getCurrentActId();
    return Registry.filterEnemies({
      chapter,
      activeAtDay: true
    });
  }
  
  /**
   * Get enemies active during night
   * 
   * @param actId - Optional act ID (uses current if not specified)
   * @returns Array of enemy configs active during night
   */
  getNightActiveEnemies(actId?: number): EnemyConfig[] {
    const chapter = actId ?? ActManager.getInstance().getCurrentActId();
    return Registry.filterEnemies({
      chapter,
      activeAtNight: true
    });
  }
  
  /**
   * Get enemies by pathing type
   * 
   * @param pathingType - The pathing behavior type
   * @param actId - Optional act ID
   * @returns Array of matching enemy configs
   */
  getEnemiesByPathingType(
    pathingType: EnemyConfig['pathingType'],
    actId?: number
  ): EnemyConfig[] {
    const chapter = actId ?? ActManager.getInstance().getCurrentActId();
    return Registry.filterEnemies({
      chapter,
      pathingType
    });
  }
  
  // ===========================================================================
  // STATS & UTILITIES
  // ===========================================================================
  
  /**
   * Get total number of enemies in registry
   * 
   * @returns Count of all enemies
   */
  getTotalEnemies(): number {
    return Registry.getAllEnemies().length;
  }
  
  /**
   * Get total number of bosses in registry
   * 
   * @returns Count of all bosses
   */
  getTotalBosses(): number {
    return Registry.getAllBosses().length;
  }
  
  /**
   * Get all enemy IDs in registry
   * 
   * @returns Array of all enemy IDs
   */
  getAllEnemyIds(): string[] {
    return Registry.getAllEnemies().map(e => e.id);
  }
  
  /**
   * Reset singleton instance (for testing only)
   * 
   * @internal
   */
  static _resetForTesting(): void {
    EnemyManager.instance = undefined as unknown as EnemyManager;
  }
}

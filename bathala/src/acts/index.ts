/**
 * Acts Module Index
 * 
 * @module acts
 * @description Barrel export for all act configurations
 * 
 * Act configs reference enemy IDs. The actual enemy definitions
 * live in src/data/enemies/creatures/ and are accessed via the registry.
 * 
 * Usage:
 * ```typescript
 * import { ACT1_CONFIG } from '../acts';
 * import { getEnemy, filterEnemies } from '../data/enemies/registry';
 * 
 * // Get enemies for an act
 * const commonEnemies = ACT1_CONFIG.commonEnemyIds.map(id => getEnemy(id));
 * ```
 */

// Act 1: The Corrupted Ancestral Forests
export { ACT1_CONFIG } from './act1/Act1Config';

// Future: Act 2 - The Submerged Barangays
// export { ACT2_CONFIG } from './act2/Act2Config';

// Future: Act 3 - The Skyward Citadel
// export { ACT3_CONFIG } from './act3/Act3Config';

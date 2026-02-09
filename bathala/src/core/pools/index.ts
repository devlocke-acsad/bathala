/**
 * Pools — Centralised content pools for the entire game.
 *
 * Import from here instead of raw data arrays:
 * ```ts
 * import {
 *   Act1Enemies, Act2Relics, AllRelics,
 *   EnemyPoolsByAct, RelicPoolsByAct,
 * } from '../core/pools';
 *
 * // Pull a random common enemy for Act 2
 * const foe = Act2Enemies.random('common');
 *
 * // Look up any relic across all acts
 * const relic = AllRelics.get('bakunawa_fang');
 *
 * // Programmatic act access
 * const pool = EnemyPoolsByAct[currentAct];
 * const elite = pool.random('elite');
 * ```
 *
 * @module pools
 */

// ── Generic pool class ────────────────────────────────────────────────────────
export { ContentPool } from './ContentPool';
export type { PoolConfig } from './ContentPool';

// ── Enemy pools ───────────────────────────────────────────────────────────────
export {
  Act1Enemies,
  Act2Enemies,
  Act3Enemies,
  AllEnemies,
  EnemyPoolsByAct,
} from './EnemyPools';
export type { EnemyTemplate, EnemyCategory } from './EnemyPools';

// ── Relic pools ───────────────────────────────────────────────────────────────
export {
  Act1Relics,
  Act2Relics,
  Act3Relics,
  AllRelics,
  RelicPoolsByAct,
} from './RelicPools';
export type { RelicCategory } from './RelicPools';

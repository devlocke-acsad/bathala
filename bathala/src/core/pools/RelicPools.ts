/**
 * RelicPools — Per-act relic pools built from existing data files.
 *
 * Pull relics by category without touching raw arrays:
 * ```ts
 * import { Act1Relics, Act2Relics, AllRelics } from '../core/pools';
 *
 * const reward   = Act1Relics.random('common');
 * const bossLoot = Act2Relics.category('boss');
 * const lookup   = AllRelics.get('earthwardens_plate');
 * ```
 *
 * @module RelicPools
 */

import { Relic } from '../types/CombatTypes';
import { ContentPool } from './ContentPool';

// ── Act 1 imports ────────────────────────────────────────────────────────────
import {
  commonRelics as a1Common,
  eliteRelics as a1Elite,
  bossRelics as a1Boss,
  treasureRelics as a1Treasure,
  shopRelics as a1Shop,
  mythologicalRelics as a1Mythological,
} from '../../data/relics/Act1Relics';

// ── Act 2 imports ────────────────────────────────────────────────────────────
import {
  commonRelics as a2Common,
  eliteRelics as a2Elite,
  bossRelics as a2Boss,
  treasureRelics as a2Treasure,
} from '../../data/relics/Act2Relics';

// ── Act 3 imports ────────────────────────────────────────────────────────────
import {
  commonRelics as a3Common,
  eliteRelics as a3Elite,
  bossRelics as a3Boss,
  treasureRelics as a3Treasure,
} from '../../data/relics/Act3Relics';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Standard relic category names. */
export type RelicCategory =
  | 'common'
  | 'elite'
  | 'boss'
  | 'treasure'
  | 'shop'
  | 'mythological';

// ─── Per-Act Pools ────────────────────────────────────────────────────────────

/** Act 1 — Corrupted Ancestral Forests. 20 relics across 6 categories. */
export const Act1Relics = new ContentPool<Relic>('Act 1 Relics', {
  keyOf: (r) => r.id,
})
  .register('common', a1Common)
  .register('elite', a1Elite)
  .register('boss', a1Boss)
  .register('treasure', a1Treasure)
  .register('shop', a1Shop)
  .register('mythological', a1Mythological);

/** Act 2 — The Submerged Barangays. 10 relics across 4 categories. */
export const Act2Relics = new ContentPool<Relic>('Act 2 Relics', {
  keyOf: (r) => r.id,
})
  .register('common', a2Common)
  .register('elite', a2Elite)
  .register('boss', a2Boss)
  .register('treasure', a2Treasure);

/** Act 3 — The Skyward Citadel. 10 relics across 4 categories. */
export const Act3Relics = new ContentPool<Relic>('Act 3 Relics', {
  keyOf: (r) => r.id,
})
  .register('common', a3Common)
  .register('elite', a3Elite)
  .register('boss', a3Boss)
  .register('treasure', a3Treasure);

// ─── Master Pool (all acts) ──────────────────────────────────────────────────

/** Combined pool across every act. Use `AllRelics.get('bakunawa_fang')` etc. */
export const AllRelics = new ContentPool<Relic>('All Relics', {
  keyOf: (r) => r.id,
})
  .register('common', [...a1Common, ...a2Common, ...a3Common])
  .register('elite', [...a1Elite, ...a2Elite, ...a3Elite])
  .register('boss', [...a1Boss, ...a2Boss, ...a3Boss])
  .register('treasure', [...a1Treasure, ...a2Treasure, ...a3Treasure])
  .register('shop', a1Shop)
  .register('mythological', a1Mythological);

// ─── Act-Indexed Lookup ──────────────────────────────────────────────────────

/** Indexed by act number (1-based) for programmatic access. */
export const RelicPoolsByAct: Record<number, ContentPool<Relic>> = {
  1: Act1Relics,
  2: Act2Relics,
  3: Act3Relics,
};

/**
 * EnemyPools — Per-act enemy pools built from existing data files.
 *
 * Pull enemies by category without touching raw arrays:
 * ```ts
 * import { Act1Enemies, Act2Enemies, AllEnemies } from '../core/pools';
 *
 * const foe = Act1Enemies.random('common');
 * const boss = Act2Enemies.category('boss');
 * const byName = AllEnemies.get('Bakunawa');
 * ```
 *
 * @module EnemyPools
 */

import { Enemy } from '../types/CombatTypes';
import { ContentPool } from './ContentPool';

// ── Act 1 imports ────────────────────────────────────────────────────────────
import {
  ACT1_COMMON_ENEMIES,
  ACT1_ELITE_ENEMIES,
  ACT1_BOSS_ENEMIES,
} from '../../data/enemies/Act1Enemies';

// ── Act 2 imports ────────────────────────────────────────────────────────────
import {
  ACT2_COMMON_ENEMIES,
  ACT2_ELITE_ENEMIES,
  ACT2_BOSS_ENEMIES,
} from '../../data/enemies/Act2Enemies';

// ── Act 3 imports ────────────────────────────────────────────────────────────
import {
  ACT3_COMMON_ENEMIES,
  ACT3_ELITE_ENEMIES,
  ACT3_BOSS_ENEMIES,
} from '../../data/enemies/Act3Enemies';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Enemy data as stored in data files (no runtime `id` yet). */
export type EnemyTemplate = Omit<Enemy, 'id'>;

/** Standard enemy category names. */
export type EnemyCategory = 'common' | 'elite' | 'boss';

// ─── Per-Act Pools ────────────────────────────────────────────────────────────

/** Act 1 — Corrupted Ancestral Forests. Lupa/Hangin focus. */
export const Act1Enemies = new ContentPool<EnemyTemplate>('Act 1 Enemies', {
  keyOf: (e) => e.name,
})
  .register('common', ACT1_COMMON_ENEMIES)
  .register('elite', ACT1_ELITE_ENEMIES)
  .register('boss', ACT1_BOSS_ENEMIES);

/** Act 2 — The Submerged Barangays. Tubig/Apoy focus. */
export const Act2Enemies = new ContentPool<EnemyTemplate>('Act 2 Enemies', {
  keyOf: (e) => e.name,
})
  .register('common', ACT2_COMMON_ENEMIES)
  .register('elite', ACT2_ELITE_ENEMIES)
  .register('boss', ACT2_BOSS_ENEMIES);

/** Act 3 — The Skyward Citadel. Multi-element focus. */
export const Act3Enemies = new ContentPool<EnemyTemplate>('Act 3 Enemies', {
  keyOf: (e) => e.name,
})
  .register('common', ACT3_COMMON_ENEMIES)
  .register('elite', ACT3_ELITE_ENEMIES)
  .register('boss', ACT3_BOSS_ENEMIES);

// ─── Master Pool (all acts) ──────────────────────────────────────────────────

/** Combined pool across every act. Use `AllEnemies.get('False Bathala')` etc. */
export const AllEnemies = new ContentPool<EnemyTemplate>('All Enemies', {
  keyOf: (e) => e.name,
})
  .register('common', [
    ...ACT1_COMMON_ENEMIES,
    ...ACT2_COMMON_ENEMIES,
    ...ACT3_COMMON_ENEMIES,
  ])
  .register('elite', [
    ...ACT1_ELITE_ENEMIES,
    ...ACT2_ELITE_ENEMIES,
    ...ACT3_ELITE_ENEMIES,
  ])
  .register('boss', [
    ...ACT1_BOSS_ENEMIES,
    ...ACT2_BOSS_ENEMIES,
    ...ACT3_BOSS_ENEMIES,
  ]);

// ─── Act-Indexed Lookup ──────────────────────────────────────────────────────

/** Indexed by act number (1-based) for programmatic access. */
export const EnemyPoolsByAct: Record<number, ContentPool<EnemyTemplate>> = {
  1: Act1Enemies,
  2: Act2Enemies,
  3: Act3Enemies,
};

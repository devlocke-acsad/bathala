/**
 * Act2Enemies — Bridge module for Act 2 (The Submerged Barangays).
 *
 * Imports from creature configs (source of truth) and re-exports
 * act-specific arrays grouped by tier, plus sprite helper functions.
 */
import { EnemyConfig } from '../../core/entities/EnemyEntity';
import {
  SIRENA_ILLUSIONIST,
  SIYOKOY_RAIDER,
  SANTELMO_FLICKER,
  BERBEROKA_LURKER,
  MAGINDARA_SWARM,
  KATAW,
  BERBALANG,
  SUNKEN_BANGKILAN,
  APOY_TUBIG_FURY,
  BAKUNAWA,
} from './creatures';

// ── Re-export named constants ─────────────────────────
export {
  SIRENA_ILLUSIONIST,
  SIYOKOY_RAIDER,
  SANTELMO_FLICKER,
  BERBEROKA_LURKER,
  MAGINDARA_SWARM,
  KATAW,
  BERBALANG,
  SUNKEN_BANGKILAN,
  APOY_TUBIG_FURY,
  BAKUNAWA,
};

// ── Tier-grouped arrays ───────────────────────────────

export const ACT2_COMMON_ENEMIES: EnemyConfig[] = [
  SIRENA_ILLUSIONIST,
  SIYOKOY_RAIDER,
  SANTELMO_FLICKER,
  BERBEROKA_LURKER,
  MAGINDARA_SWARM,
  KATAW,
  BERBALANG,
];

export const ACT2_ELITE_ENEMIES: EnemyConfig[] = [
  SUNKEN_BANGKILAN,
  APOY_TUBIG_FURY,
];

export const ACT2_BOSS_ENEMIES: EnemyConfig[] = [
  BAKUNAWA,
];

/** All Act 2 enemy configs in a single flat array. */
export const ACT2_ENEMY_CONFIGS: EnemyConfig[] = [
  ...ACT2_COMMON_ENEMIES,
  ...ACT2_ELITE_ENEMIES,
  ...ACT2_BOSS_ENEMIES,
];

// ── Auto-built sprite map ─────────────────────────────

type SpriteEntry = { combat: string; overworld: string };
const ENEMY_SPRITE_MAP: Record<string, SpriteEntry> = {};
for (const cfg of ACT2_ENEMY_CONFIGS) {
  ENEMY_SPRITE_MAP[cfg.name] = {
    combat: cfg.combatSpriteKey,
    overworld: cfg.overworldSpriteKey,
  };
}

/** Resolve combat sprite key by display name. */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? 'sirena_combat';
}

/** Resolve overworld sprite key by display name. */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? 'sirena_overworld';
}

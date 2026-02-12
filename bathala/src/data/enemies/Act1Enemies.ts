/**
 * Act1Enemies — Bridge module for Act 1 (The Corrupted Ancestral Forests).
 *
 * Imports from creature configs (source of truth) and re-exports
 * act-specific arrays grouped by tier, plus sprite helper functions.
 */
import { EnemyConfig } from '../../core/entities/EnemyEntity';
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
  MANGANGAWAY,
} from './creatures';

// ── Re-export named constants ─────────────────────────
export {
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  KAPRE_SHADE,
  TAWONG_LIPOD,
  MANGANGAWAY,
};

// ── Tier-grouped arrays ───────────────────────────────

export const ACT1_COMMON_ENEMIES: EnemyConfig[] = [
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
];

export const ACT1_ELITE_ENEMIES: EnemyConfig[] = [
  KAPRE_SHADE,
  TAWONG_LIPOD,
];

export const ACT1_BOSS_ENEMIES: EnemyConfig[] = [
  MANGANGAWAY,
];

/** All Act 1 enemy configs in a single flat array. */
export const ACT1_ENEMY_CONFIGS: EnemyConfig[] = [
  ...ACT1_COMMON_ENEMIES,
  ...ACT1_ELITE_ENEMIES,
  ...ACT1_BOSS_ENEMIES,
];

// ── Auto-built sprite map ─────────────────────────────

type SpriteEntry = { combat: string; overworld: string };
const ENEMY_SPRITE_MAP: Record<string, SpriteEntry> = {};
for (const cfg of ACT1_ENEMY_CONFIGS) {
  ENEMY_SPRITE_MAP[cfg.name] = {
    combat: cfg.combatSpriteKey,
    overworld: cfg.overworldSpriteKey,
  };
}

/** Resolve combat sprite key by display name. */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? 'tikbalang_combat';
}

/** Resolve overworld sprite key by display name. */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? 'tikbalang_overworld';
}

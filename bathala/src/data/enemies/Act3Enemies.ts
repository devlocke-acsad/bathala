/**
 * Act3Enemies — Bridge module for Act 3 (The Skyward Citadel).
 *
 * Imports from creature configs (source of truth) and re-exports
 * act-specific arrays grouped by tier, plus sprite helper functions.
 */
import { EnemyConfig } from '../../core/entities/EnemyEntity';
import {
  TIGMAMANUKAN_WATCHER,
  DIWATA_SENTINEL,
  SARIMANOK_KEEPER,
  BULALAKAW_FLAMEWINGS,
  MINOKAWA_HARBINGER,
  ALAN,
  EKEK,
  RIBUNG_LINTI_DUO,
  APOLAKI_GODLING,
  FALSE_BATHALA,
} from './creatures';

// ── Re-export named constants ─────────────────────────
export {
  TIGMAMANUKAN_WATCHER,
  DIWATA_SENTINEL,
  SARIMANOK_KEEPER,
  BULALAKAW_FLAMEWINGS,
  MINOKAWA_HARBINGER,
  ALAN,
  EKEK,
  RIBUNG_LINTI_DUO,
  APOLAKI_GODLING,
  FALSE_BATHALA,
};

// ── Tier-grouped arrays ───────────────────────────────

export const ACT3_COMMON_ENEMIES: EnemyConfig[] = [
  TIGMAMANUKAN_WATCHER,
  DIWATA_SENTINEL,
  SARIMANOK_KEEPER,
  BULALAKAW_FLAMEWINGS,
  MINOKAWA_HARBINGER,
  ALAN,
  EKEK,
];

export const ACT3_ELITE_ENEMIES: EnemyConfig[] = [
  RIBUNG_LINTI_DUO,
  APOLAKI_GODLING,
];

export const ACT3_BOSS_ENEMIES: EnemyConfig[] = [
  FALSE_BATHALA,
];

/** All Act 3 enemy configs in a single flat array. */
export const ACT3_ENEMY_CONFIGS: EnemyConfig[] = [
  ...ACT3_COMMON_ENEMIES,
  ...ACT3_ELITE_ENEMIES,
  ...ACT3_BOSS_ENEMIES,
];

// ── Auto-built sprite map ─────────────────────────────

type SpriteEntry = { combat: string; overworld: string };
const ENEMY_SPRITE_MAP: Record<string, SpriteEntry> = {};
for (const cfg of ACT3_ENEMY_CONFIGS) {
  ENEMY_SPRITE_MAP[cfg.name] = {
    combat: cfg.combatSpriteKey,
    overworld: cfg.overworldSpriteKey,
  };
}

/** Resolve combat sprite key by display name. */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? 'tigmamanukan_combat';
}

/** Resolve overworld sprite key by display name. */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? 'tigmamanukan_overworld';
}

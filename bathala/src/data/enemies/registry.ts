/**
 * Enemy Registry — Data-level registry that aggregates ALL creature configs
 * into lookup maps for ID-based and name-based access.
 *
 * This is the data layer complement to EnemyRegistry (core/registries).
 * Consumers can import from here for static data access without needing bootstrap.
 */
import { EnemyConfig } from '../../core/entities/EnemyEntity';
import { ACT1_ENEMY_CONFIGS } from './Act1Enemies';
import { ACT2_ENEMY_CONFIGS } from './Act2Enemies';
import { ACT3_ENEMY_CONFIGS } from './Act3Enemies';

// ── All enemies ───────────────────────────────────────

/** Every enemy config across all acts. */
export const ALL_ENEMY_CONFIGS: EnemyConfig[] = [
  ...ACT1_ENEMY_CONFIGS,
  ...ACT2_ENEMY_CONFIGS,
  ...ACT3_ENEMY_CONFIGS,
];

// ── Maps ──────────────────────────────────────────────

/** id → EnemyConfig lookup map. */
export const ENEMY_MAP: ReadonlyMap<string, EnemyConfig> = new Map(
  ALL_ENEMY_CONFIGS.map(cfg => [cfg.id, cfg])
);

/** displayName → EnemyConfig lookup map. */
export const ENEMY_NAME_MAP: ReadonlyMap<string, EnemyConfig> = new Map(
  ALL_ENEMY_CONFIGS.map(cfg => [cfg.name, cfg])
);

/** id → EnemyConfig for boss-tier enemies only. */
export const BOSS_MAP: ReadonlyMap<string, EnemyConfig> = new Map(
  ALL_ENEMY_CONFIGS.filter(cfg => cfg.tier === 'boss').map(cfg => [cfg.id, cfg])
);

// ── Sprite map (all acts) ─────────────────────────────

type SpriteEntry = { combat: string; overworld: string };

/** displayName → { combat, overworld } sprite keys for every enemy. */
export const ENEMY_SPRITE_MAP: Readonly<Record<string, SpriteEntry>> = Object.freeze(
  ALL_ENEMY_CONFIGS.reduce<Record<string, SpriteEntry>>((map, cfg) => {
    map[cfg.name] = { combat: cfg.combatSpriteKey, overworld: cfg.overworldSpriteKey };
    return map;
  }, {})
);

// ── Sprite helpers ────────────────────────────────────

/** Resolve combat sprite key by display name (any act). */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? 'tikbalang_combat';
}

/** Resolve overworld sprite key by display name (any act). */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? 'tikbalang_overworld';
}

// ── Query helpers ─────────────────────────────────────

/** Get all enemy configs for a given chapter. */
export function getEnemiesByChapter(chapter: number): EnemyConfig[] {
  return ALL_ENEMY_CONFIGS.filter(cfg => cfg.chapter === chapter);
}

/** Get all enemy configs for a given tier. */
export function getEnemiesByTier(tier: 'common' | 'elite' | 'boss'): EnemyConfig[] {
  return ALL_ENEMY_CONFIGS.filter(cfg => cfg.tier === tier);
}

/** Get config by id, or undefined. */
export function getEnemyById(id: string): EnemyConfig | undefined {
  return ENEMY_MAP.get(id);
}

/** Get config by display name, or undefined. */
export function getEnemyByName(name: string): EnemyConfig | undefined {
  return ENEMY_NAME_MAP.get(name);
}

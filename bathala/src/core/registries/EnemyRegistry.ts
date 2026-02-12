/**
 * EnemyRegistry — Centralised, ID-based lookup for all enemy definitions.
 * Single source of truth for sprite keys, tooltips, cross-chapter search.
 */
import { EnemyEntity, EnemyConfig, EnemyTier } from '../entities/EnemyEntity';

export class EnemyRegistry {
  /** id → EnemyConfig (immutable reference data) */
  private static readonly configs = new Map<string, EnemyConfig>();

  /** displayName → id (backward-compat lookup) */
  private static readonly nameToId = new Map<string, string>();

  // ── Registration ────────────────────────────────────

  /** Register an enemy config. Idempotent. */
  static register(config: EnemyConfig): void {
    this.configs.set(config.id, config);
    this.nameToId.set(config.name, config.id);
  }

  /** Register many at once. */
  static registerAll(configs: EnemyConfig[]): void {
    for (const cfg of configs) this.register(cfg);
  }

  // ── Lookup by ID ────────────────────────────────────

  static getConfig(id: string): EnemyConfig | undefined {
    return this.configs.get(id);
  }

  static getConfigOrThrow(id: string): EnemyConfig {
    const cfg = this.configs.get(id);
    if (!cfg) throw new Error(`EnemyRegistry: unknown enemy id "${id}"`);
    return cfg;
  }

  /** Create a fresh runtime EnemyEntity from a registered config id. */
  static create(id: string): EnemyEntity {
    return new EnemyEntity(this.getConfigOrThrow(id));
  }

  // ── Lookup by display name (backward compat) ───────

  static getIdByName(name: string): string | undefined {
    return this.nameToId.get(name);
  }

  /** Resolve either an ID or a legacy display name to a config. */
  static resolve(idOrName: string): EnemyConfig | undefined {
    return this.configs.get(idOrName) ?? this.configs.get(this.nameToId.get(idOrName) ?? '');
  }

  // ── Sprite lookups ──────────────────────────────────

  static getCombatSprite(idOrName: string): string {
    const cfg = this.resolve(idOrName);
    if (!cfg) {
      console.warn(`EnemyRegistry: unknown enemy "${idOrName}", falling back to tikbalang_combat`);
      return 'tikbalang_combat';
    }
    return cfg.combatSpriteKey;
  }

  static getOverworldSprite(idOrName: string): string {
    const cfg = this.resolve(idOrName);
    if (!cfg) {
      console.warn(`EnemyRegistry: unknown enemy "${idOrName}", falling back to tikbalang_overworld`);
      return 'tikbalang_overworld';
    }
    return cfg.overworldSpriteKey;
  }

  // ── Filtered queries ────────────────────────────────

  static getByChapter(chapter: number): EnemyConfig[] {
    return [...this.configs.values()].filter(c => c.chapter === chapter);
  }

  static getByTier(tier: EnemyTier): EnemyConfig[] {
    return [...this.configs.values()].filter(c => c.tier === tier);
  }

  static getByChapterAndTier(chapter: number, tier: EnemyTier): EnemyConfig[] {
    return [...this.configs.values()].filter(c => c.chapter === chapter && c.tier === tier);
  }

  /** Get a random config from a chapter + tier. */
  static getRandom(chapter: number, tier: EnemyTier): EnemyConfig {
    const pool = this.getByChapterAndTier(chapter, tier);
    if (pool.length === 0) throw new Error(`EnemyRegistry: no ${tier} enemies for chapter ${chapter}`);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /** Create a random EnemyEntity for combat. */
  static createRandom(chapter: number, tier: EnemyTier): EnemyEntity {
    return new EnemyEntity(this.getRandom(chapter, tier));
  }

  // ── Asset validation ────────────────────────────────

  /** Returns all sprite keys that should be preloaded. */
  static getAllSpriteKeys(): { combat: string[]; overworld: string[] } {
    const combat: string[] = [];
    const overworld: string[] = [];
    for (const cfg of this.configs.values()) {
      combat.push(cfg.combatSpriteKey);
      overworld.push(cfg.overworldSpriteKey);
    }
    return { combat, overworld };
  }

  /**
   * Validate that all sprite keys are loaded in a Phaser texture manager.
   * @returns array of missing keys.
   */
  static validateSprites(textureExists: (key: string) => boolean): string[] {
    const missing: string[] = [];
    for (const cfg of this.configs.values()) {
      if (!textureExists(cfg.combatSpriteKey)) missing.push(cfg.combatSpriteKey);
      if (!textureExists(cfg.overworldSpriteKey)) missing.push(cfg.overworldSpriteKey);
    }
    return missing;
  }

  // ── Utility ─────────────────────────────────────────

  static count(): number {
    return this.configs.size;
  }

  static all(): EnemyConfig[] {
    return [...this.configs.values()];
  }

  /** Clear the registry (useful for testing). */
  static clear(): void {
    this.configs.clear();
    this.nameToId.clear();
  }
}

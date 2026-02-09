/**
 * ActDefinition — abstract base class for all game acts/chapters.
 *
 * Each act (Forest, Submerged Barangays, Skyward Citadel, etc.)
 * extends this class and provides:
 *   - Enemy / relic / event pools
 *   - Generator strategy (maze, archipelago, sky islands…)
 *   - Theme, assets, and progression tuning
 *
 * **Adding a new act:**
 *  1. Create `src/acts/act{N}/Act{N}Definition.ts`
 *  2. Extend `ActDefinition`, fill in abstract members
 *  3. Export a singleton instance (e.g. `export const ACT2 = new Act2Definition()`)
 *  4. Register in `ActRegistry`
 *
 * @module ActDefinition
 */

import { Suit } from '../types/CombatTypes';
import {
  RNG,
  IChunkGenerator,
  EnemyPoolEntry,
  NodeDistributionConfig,
  DEFAULT_NODE_DISTRIBUTION,
} from '../types/GenerationTypes';

// =========================================================================
// Supporting types
// =========================================================================

/** Visual and elemental theme for an act */
export interface ActTheme {
  /** Primary elemental focus (e.g., Lupa/Hangin for Act 1) */
  readonly primaryElements: readonly Suit[];
  /** Hex color palette for UI theming */
  readonly colorPalette: {
    readonly primary: number;
    readonly secondary: number;
    readonly accent: number;
  };
}

/** Asset keys required for the act */
export interface ActAssets {
  readonly backgroundKey: string;
  readonly musicKey: string;
  readonly ambientSounds?: readonly string[];
  /** Tileset key for overworld rendering */
  readonly tilesetKey?: string;
  /** Combat background key */
  readonly combatBackgroundKey?: string;
}

/** Day/night cycle tuning */
export interface ActProgression {
  /** Day-night cycles before boss spawns (default 5) */
  readonly requiredCyclesToBoss: number;
  /** Total actions per full cycle (default 100) */
  readonly actionsPerCycle: number;
}

// =========================================================================
// Base class
// =========================================================================

/**
 * Abstract base class for all game acts.
 *
 * Subclasses MUST implement:
 *   - `createGenerator()` — terrain generation strategy
 *   - `commonEnemies`, `eliteEnemies`, `bossEnemy` — enemy pools
 *   - identity fields, theme, assets, progression
 *
 * Subclasses MAY override:
 *   - `nodeDistribution` — tweak node density/type weights
 */
export abstract class ActDefinition {
  // === Identity ===
  abstract readonly id: number;
  abstract readonly name: string;
  abstract readonly subtitle: string;

  // === Theme ===
  abstract readonly theme: ActTheme;

  // === Assets ===
  abstract readonly assets: ActAssets;

  // === Progression ===
  abstract readonly progression: ActProgression;

  // === Content pools (abstract — each act defines its own) ===

  /** Common enemies for this act. Order doesn't matter. */
  abstract readonly commonEnemies: readonly EnemyPoolEntry[];

  /** Elite enemies for this act */
  abstract readonly eliteEnemies: readonly EnemyPoolEntry[];

  /** Boss enemy config */
  abstract readonly bossEnemy: EnemyPoolEntry;

  /** Event IDs available in this act */
  abstract readonly eventIds: readonly string[];

  /** Relic IDs that can drop in this act */
  abstract readonly relicIds: readonly string[];

  // === Generation ===

  /**
   * Factory method: create the chunk generator for this act.
   * Called once when the act's overworld is initialized.
   * 
   * Override this to provide a completely different terrain style.
   */
  abstract createGenerator(): IChunkGenerator;

  /**
   * Node distribution config. Override to tweak density or type weights.
   * Defaults to standard settings suitable for most acts.
   */
  get nodeDistribution(): NodeDistributionConfig {
    return DEFAULT_NODE_DISTRIBUTION;
  }

  // === Convenience helpers ===

  /** Get a random common enemy entry */
  getRandomCommon(rng: RNG): EnemyPoolEntry {
    const idx = Math.floor(rng.next() * this.commonEnemies.length);
    return this.commonEnemies[idx];
  }

  /** Get a random elite enemy entry */
  getRandomElite(rng: RNG): EnemyPoolEntry {
    const idx = Math.floor(rng.next() * this.eliteEnemies.length);
    return this.eliteEnemies[idx];
  }

  /**
   * Get all enemy pool entries (common + elite + boss).
   * Useful for bestiary / compendium generation.
   */
  getAllEnemies(): readonly EnemyPoolEntry[] {
    return [...this.commonEnemies, ...this.eliteEnemies, this.bossEnemy];
  }
}

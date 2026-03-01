/**
 * Generation Types for Bathala
 *
 * Contracts for modular, per-act world generation.
 * Each act plugs in its own generator strategy while sharing
 * common node-placement and chunk-caching infrastructure.
 *
 * Architecture:
 * ```
 *  ActDefinition                      (content: enemies, relics, events, theme)
 *    └── createGenerator()  →  IChunkGenerator   (terrain grid)
 *
 *  OverworldGenerator                 (orchestrator: caching + seeded RNG)
 *    ├── IChunkGenerator.generate()   (produces RawChunk)
 *    └── NodePopulator.populate()     (places MapNodes onto terrain)
 * ```
 *
 * **Adding a new terrain type:**
 *  1. Create algorithm in `systems/generation/algorithms/`
 *  2. Create `IChunkGenerator` wrapper in `systems/generation/generators/`
 *  3. Return it from your `ActDefinition.createGenerator()`
 *
 * @module GenerationTypes
 */

import { NodeType } from './MapTypes';

// =========================================================================
// Random Number Generation
// =========================================================================

/** Minimal random number generator — accepts any PRNG implementation. */
export interface RNG {
  /** Returns a pseudo-random float in [0, 1). */
  next(): number;
}

/** Seeded PRNG with deterministic replay capability. */
export interface SeededRandom extends RNG {
  readonly seed: number;
}

/**
 * A raw generated chunk before node placement.
 *
 * `grid[y][x]`: 0 = walkable path, 1 = wall.
 */
export interface RawChunk {
  readonly grid: number[][];
  readonly width: number;
  readonly height: number;
  /** Border openings that allow connectivity to adjacent chunks */
  readonly borderConnections: readonly BorderConnection[];
}

export interface BorderConnection {
  readonly x: number;
  readonly y: number;
  readonly direction: 'north' | 'south' | 'east' | 'west';
}

/**
 * Strategy interface for chunk terrain generation.
 *
 * Each act provides its own implementation:
 *   - Act 1: Maze (Delaunay triangulation corridors)
 *   - Act 2: Archipelago (island clusters with bridges)
 *   - Act 3: Sky Islands (floating platforms with voids)
 *
 * Generators produce ONLY the terrain grid + border connections.
 * Node placement is handled separately by NodePopulator.
 */
export interface IChunkGenerator {
  /** Human-readable name for debug/logging */
  readonly name: string;

  /**
   * Generate a terrain chunk at the given chunk coordinates.
   * Must be deterministic for the same seed.
   */
  generate(chunkX: number, chunkY: number, rng: SeededRandom): RawChunk;

  /** Chunk dimension in tiles (square) */
  readonly chunkSize: number;

  /** Optional cleanup when generator is no longer needed */
  dispose?(): void;
}

// =========================================================================
// Node Population — placing interactive nodes on terrain
// =========================================================================

/**
 * Enemy pool descriptor passed to the node populator.
 * Decoupled from the actual Enemy type — only needs names for node IDs.
 */
export interface EnemyPoolEntry {
  readonly name: string;
}

/**
 * Configuration for how nodes should be distributed in a chunk.
 */
export interface NodeDistributionConfig {
  /** Base number of nodes per chunk */
  readonly baseNodeCount: number;
  /** Minimum distance from chunk edge (in tiles) */
  readonly edgeMargin: number;
  /** Minimum open neighbors required for a valid position */
  readonly minOpenNeighbors: number;
  /** Minimum distance between placed nodes (as fraction of chunkSize) */
  readonly minDistanceFactor: number;
  /** Node type weights — higher weight = more likely to spawn */
  readonly typeWeights: Partial<Record<NodeType, number>>;
}

/**
 * Default node distribution suitable for most acts.
 * Individual acts can override specific fields.
 */
export const DEFAULT_NODE_DISTRIBUTION: NodeDistributionConfig = {
  baseNodeCount: 3,
  edgeMargin: 3,
  minOpenNeighbors: 5,
  minDistanceFactor: 4,
  typeWeights: {
    // Keep elites meaningfully rarer than common encounters.
    combat: 5,
    elite: 0.5,
    shop: 1,
    event: 2,
    campfire: 1,
    treasure: 1,
  },
};

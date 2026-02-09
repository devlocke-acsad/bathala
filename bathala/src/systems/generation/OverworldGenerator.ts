/**
 * OverworldGenerator — orchestrates chunk generation and node population.
 *
 * One instance per act. Delegates terrain generation to the act's
 * IChunkGenerator and node placement to NodePopulator.
 *
 * @example
 *   const gen = new OverworldGenerator(act1Definition);
 *   const { maze, nodes } = gen.getChunk(chunkX, chunkY, gridSize);
 *
 * @module OverworldGenerator
 */

import { MapNode } from '../../core/types/MapTypes';
import { IChunkGenerator } from '../../core/types/GenerationTypes';
import { ActDefinition } from '../../core/acts/ActDefinition';
import { NodePopulator } from './NodePopulator';
import { createSeededRNG, chunkSeed } from './SeededRNG';

// =========================================================================
// Types
// =========================================================================

interface CachedChunk {
  grid: number[][];
  nodes: MapNode[];
}

// =========================================================================
// OverworldGenerator
// =========================================================================

export class OverworldGenerator {
  private readonly actDef: ActDefinition;
  private readonly chunkGen: IChunkGenerator;
  private readonly nodePopulator: NodePopulator;
  private readonly cache = new Map<string, CachedChunk>();

  private globalSeed: number;

  /** Maximum cached chunks (LRU eviction) */
  private static readonly MAX_CACHE = 50;

  constructor(actDef: ActDefinition, seed?: number) {
    this.actDef = actDef;
    this.chunkGen = actDef.createGenerator();
    this.nodePopulator = new NodePopulator(
      actDef.commonEnemies,
      actDef.eliteEnemies,
      actDef.nodeDistribution,
    );
    this.globalSeed = seed ?? Math.floor(Math.random() * 100000);
  }

  // =========================================================================
  // Public API
  // =========================================================================

  /** Generate or retrieve a cached chunk. */
  getChunk(chunkX: number, chunkY: number, gridSize: number): { maze: number[][]; nodes: MapNode[] } {
    const key = `${chunkX},${chunkY}`;
    const cached = this.cache.get(key);
    if (cached) return { maze: cached.grid, nodes: cached.nodes };

    const rng = createSeededRNG(chunkSeed(chunkX, chunkY, this.globalSeed));

    // 1. Generate terrain
    const raw = this.chunkGen.generate(chunkX, chunkY, rng);

    // 2. Populate nodes
    const nodes = this.nodePopulator.populate(
      raw.grid,
      chunkX,
      chunkY,
      raw.width,
      gridSize,
      rng,
    );

    const entry: CachedChunk = { grid: raw.grid, nodes };
    this.cacheSet(key, entry);

    return { maze: raw.grid, nodes };
  }

  /**
   * Batch get a rectangular region of chunks.
   */
  getChunkRegion(
    startX: number, startY: number,
    widthChunks: number, heightChunks: number,
    gridSize: number,
  ): Map<string, { maze: number[][]; nodes: MapNode[] }> {
    const result = new Map<string, { maze: number[][]; nodes: MapNode[] }>();
    for (let dy = 0; dy < heightChunks; dy++) {
      for (let dx = 0; dx < widthChunks; dx++) {
        const cx = startX + dx;
        const cy = startY + dy;
        result.set(`${cx},${cy}`, this.getChunk(cx, cy, gridSize));
      }
    }
    return result;
  }

  /**
   * Preload chunks around a center coordinate.
   */
  preloadAround(centerX: number, centerY: number, radius: number, gridSize: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        this.getChunk(centerX + dx, centerY + dy, gridSize);
      }
    }
  }

  /** Change global seed and clear cache */
  setSeed(seed: number): void {
    this.globalSeed = seed;
    this.clearCache();
  }

  /** Clear all cached chunks */
  clearCache(): void {
    this.cache.clear();
  }

  /** Cache stats for debugging */
  getCacheStats(): { cachedChunks: number; maxCached: number } {
    return { cachedChunks: this.cache.size, maxCached: OverworldGenerator.MAX_CACHE };
  }

  /** Chunk size in tiles (delegates to generator) */
  get chunkSize(): number {
    return this.chunkGen.chunkSize;
  }

  /** The act this generator was built for */
  get act(): ActDefinition {
    return this.actDef;
  }

  // =========================================================================
  // Internal
  // =========================================================================

  private cacheSet(key: string, data: CachedChunk): void {
    // Simple LRU: evict oldest when at capacity
    if (this.cache.size >= OverworldGenerator.MAX_CACHE) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, data);
  }
}

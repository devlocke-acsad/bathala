/**
 * OverworldGenerator — orchestrates chunk generation and node population.
 *
 * Moved to `orchestration/` to clarify its role as the top-level
 * coordinator. Composes:
 *   - IChunkGenerator (terrain strategy, from ActDefinition)
 *   - NodePopulator (node placement + content resolution)
 *   - ChunkCache (LRU caching)
 *   - SeededRNG (deterministic per-chunk seeds)
 *
 * One instance per act. When changing acts, create a new OverworldGenerator.
 *
 * @example
 *   const gen = new OverworldGenerator(act1Definition);
 *   const { maze, nodes } = gen.getChunk(chunkX, chunkY, gridSize);
 *
 * @module OverworldGenerator
 */

import { MapNode } from '../../../core/types/MapTypes';
import { IChunkGenerator } from '../../../core/types/GenerationTypes';
import { ActDefinition } from '../../../core/acts/ActDefinition';
import { NodePopulator, NodePopulatorConfig } from '../population/NodePopulator';
import { EnemyNodeResolver } from '../population/strategies/EnemyNodeResolver';
import { EventNodeResolver } from '../population/strategies/EventNodeResolver';
import { DefaultNodeResolver } from '../population/strategies/DefaultNodeResolver';
import { ChunkCache, CachedChunk } from './ChunkCache';
import { createSeededRNG, chunkSeed } from '../shared/SeededRNG';

/**
 * Configuration for OverworldGenerator.
 * All fields are optional — sensible defaults are derived from ActDefinition.
 */
export interface OverworldGeneratorConfig {
    /** Override the global seed (default: random) */
    readonly seed?: number;
    /** Override the chunk cache size (default: 50) */
    readonly maxCacheSize?: number;
    /** Override the node populator configuration */
    readonly populatorConfig?: NodePopulatorConfig;
}

export class OverworldGenerator {
    private readonly actDef: ActDefinition;
    private readonly chunkGen: IChunkGenerator;
    private readonly nodePopulator: NodePopulator;
    private readonly cache: ChunkCache;
    private globalSeed: number;

    constructor(actDef: ActDefinition, config: OverworldGeneratorConfig = {}) {
        this.actDef = actDef;
        this.chunkGen = actDef.createGenerator();
        this.globalSeed = config.seed ?? Math.floor(Math.random() * 100000);
        this.cache = new ChunkCache({ maxSize: config.maxCacheSize });

        // Build the node populator with act-specific resolvers
        if (config.populatorConfig) {
            this.nodePopulator = new NodePopulator(config.populatorConfig);
        } else {
            this.nodePopulator = new NodePopulator({
                resolvers: [
                    new EnemyNodeResolver(actDef.commonEnemies, actDef.eliteEnemies),
                    new EventNodeResolver(actDef.eventIds),
                    new DefaultNodeResolver(),
                ],
                distribution: actDef.nodeDistribution,
            });
        }
    }

    // =========================================================================
    // Public API
    // =========================================================================

    /** Generate or retrieve a cached chunk. */
    getChunk(
        chunkX: number, chunkY: number, gridSize: number,
    ): { maze: number[][]; nodes: MapNode[] } {
        const key = ChunkCache.key(chunkX, chunkY);
        const cached = this.cache.get(key);
        if (cached) return { maze: cached.grid, nodes: cached.nodes };

        const rng = createSeededRNG(chunkSeed(chunkX, chunkY, this.globalSeed));

        // 1. Generate terrain
        const raw = this.chunkGen.generate(chunkX, chunkY, rng);

        // 2. Populate nodes
        const nodes = this.nodePopulator.populate(
            raw.grid, chunkX, chunkY, raw.width, gridSize, rng,
        );

        const entry: CachedChunk = { grid: raw.grid, nodes };
        this.cache.set(key, entry);

        return { maze: raw.grid, nodes };
    }

    /** Batch get a rectangular region of chunks. */
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

    /** Preload chunks around a center coordinate. */
    preloadAround(
        centerX: number, centerY: number, radius: number, gridSize: number,
    ): void {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                this.getChunk(centerX + dx, centerY + dy, gridSize);
            }
        }
    }

    /** Change global seed and clear cache. */
    setSeed(seed: number): void {
        this.globalSeed = seed;
        this.clearCache();
    }

    /** Clear all cached chunks. */
    clearCache(): void {
        this.cache.clear();
    }

    /** Cache stats for debugging. */
    getCacheStats(): { cachedChunks: number; maxCached: number } {
        const s = this.cache.stats;
        return { cachedChunks: s.cachedChunks, maxCached: s.maxSize };
    }

    /** Chunk size in tiles (delegates to generator). */
    get chunkSize(): number {
        return this.chunkGen.chunkSize;
    }

    /** The act this generator was built for. */
    get act(): ActDefinition {
        return this.actDef;
    }
}

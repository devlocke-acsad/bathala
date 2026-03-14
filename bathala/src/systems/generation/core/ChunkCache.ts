/**
 * ChunkCache — LRU cache for generated chunk data.
 *
 * Extracted from OverworldGenerator to make caching strategy
 * independently testable, configurable, and reusable.
 *
 * @module ChunkCache
 */

import { MapNode } from '../../../core/types/MapTypes';

/** Cached data for a single chunk */
export interface CachedChunk {
    readonly grid: number[][];
    readonly nodes: MapNode[];
}

/** Configuration for the chunk cache */
export interface ChunkCacheConfig {
    /** Maximum number of cached chunks before LRU eviction (default 50) */
    readonly maxSize?: number;
}

export class ChunkCache {
    private readonly cache = new Map<string, CachedChunk>();
    private readonly maxSize: number;

    constructor(config: ChunkCacheConfig = {}) {
        this.maxSize = config.maxSize ?? 50;
    }

    /** Generate a cache key from chunk coordinates */
    static key(chunkX: number, chunkY: number): string {
        return `${chunkX},${chunkY}`;
    }

    /** Retrieve a cached chunk, or undefined */
    get(key: string): CachedChunk | undefined {
        return this.cache.get(key);
    }

    /** Store a chunk, evicting oldest if at capacity */
    set(key: string, data: CachedChunk): void {
        if (this.cache.size >= this.maxSize) {
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) this.cache.delete(oldest);
        }
        this.cache.set(key, data);
    }

    /** Check if a chunk is cached */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /** Clear all cached chunks */
    clear(): void {
        this.cache.clear();
    }

    /** Current cache statistics */
    get stats(): { cachedChunks: number; maxSize: number } {
        return { cachedChunks: this.cache.size, maxSize: this.maxSize };
    }
}

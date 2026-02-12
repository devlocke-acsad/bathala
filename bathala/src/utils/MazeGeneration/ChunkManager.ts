import { MapNode } from "../../core/types/MapTypes";
import { ChunkData, ChunkRegion } from "./types";

/*
  ChunkManager
  -------------
  Manages caching and retrieval of maze chunks for performance.
  
  Features:
    - LRU-like cache with automatic eviction when full
    - Batch operations for region loading
    - Preloading for smoother gameplay
    - Statistics tracking for debugging
  
  Key parameters:
    - maxCachedChunks: Maximum number of chunks to keep in memory
*/
export class ChunkManager {
  // =============================
  // Cache Management
  // =============================
  
  private static chunks: Map<string, ChunkData> = new Map();
  private static generatedChunks: Set<string> = new Set();
  private static maxCachedChunks: number = 100; // Memory management

  /**
   * Get chunk data from cache
   */
  static getCachedChunk(chunkKey: string): ChunkData | undefined {
    return this.chunks.get(chunkKey);
  }

  /**
   * Cache chunk data
   */
  static cacheChunk(chunkKey: string, chunk: ChunkData): void {
    // Memory management - remove oldest chunks if cache is full
    if (this.chunks.size >= this.maxCachedChunks) {
      const oldestKey = this.chunks.keys().next().value;
      if (oldestKey) {
        this.chunks.delete(oldestKey);
        this.generatedChunks.delete(oldestKey);
      }
    }

    this.chunks.set(chunkKey, chunk);
    this.generatedChunks.add(chunkKey);
  }

  /**
   * Get multiple chunks efficiently (batch operation)
   */
  static getChunkRegion(
    region: ChunkRegion,
    gridSize: number,
    getChunkCallback: (chunkX: number, chunkY: number, gridSize: number) => { maze: number[][]; nodes: MapNode[] }
  ): Map<string, { maze: number[][]; nodes: MapNode[] }> {
    const regionMap = new Map<string, { maze: number[][]; nodes: MapNode[] }>();
    
    for (let cy = region.startChunkY; cy < region.startChunkY + region.heightInChunks; cy++) {
      for (let cx = region.startChunkX; cx < region.startChunkX + region.widthInChunks; cx++) {
        const chunkKey = `${cx},${cy}`;
        const chunk = getChunkCallback(cx, cy, gridSize);
        regionMap.set(chunkKey, chunk);
      }
    }
    
    return regionMap;
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { cachedChunks: number; maxCachedChunks: number } {
    return {
      cachedChunks: this.chunks.size,
      maxCachedChunks: this.maxCachedChunks
    };
  }

  /**
   * Clear cached chunks (for new game or memory management)
   */
  static clearCache(): void {
    this.chunks.clear();
    this.generatedChunks.clear();
  }

  /**
   * Preload chunks around a position for smoother gameplay
   */
  static preloadChunksAround(
    centerChunkX: number, 
    centerChunkY: number, 
    radius: number, 
    gridSize: number,
    getChunkCallback: (chunkX: number, chunkY: number, gridSize: number) => void
  ): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        // Preload in background without blocking
        setTimeout(() => {
          getChunkCallback(centerChunkX + dx, centerChunkY + dy, gridSize);
        }, 0);
      }
    }
  }

  /**
   * Generate chunk key from coordinates
   */
  static generateChunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX},${chunkY}`;
  }
}

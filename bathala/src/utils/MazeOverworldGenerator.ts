import { MapNode } from "../core/types/MapTypes";
import { ChunkData, ChunkRegion } from "./MazeGeneration/types";
import { ChunkManager } from "./MazeGeneration/ChunkManager";
import { DelaunayMazeGenerator } from "./MazeGeneration/DelaunayMazeGenerator";
import { NodeGenerator } from "./MazeGeneration/NodeGenerator";
import { RandomUtil } from "./MazeGeneration/RandomUtil";

/*
  MazeOverworldGenerator
  ----------------------
  Main entry point for overworld maze generation using Delaunay triangulation.
  
  This class orchestrates the generation of maze chunks for the overworld,
  using the DelaunayMazeGenerator for the actual maze layout generation.
  
  Features:
    - Chunk-based generation for infinite worlds
    - Caching for performance
    - Node placement (enemies, shops, etc.)
    - Connection point generation for chunk connectivity
*/
export class MazeOverworldGenerator {
  // =============================
  // Generation Configuration
  // =============================
  
  private static chunkSize: number = 50; // Larger chunk size for corridor generation
  private static globalSeed: number = Math.floor(Math.random() * 100000); // Global seed for deterministic generation

  /**
   * Generate or retrieve a maze chunk with guaranteed connections
   */
  static getChunk(chunkX: number, chunkY: number, gridSize: number): {
    maze: number[][];
    nodes: MapNode[];
  } {
    const chunkKey = ChunkManager.generateChunkKey(chunkX, chunkY);
    
    // Return cached chunk if it exists
    const cached = ChunkManager.getCachedChunk(chunkKey);
    if (cached) {
      return { maze: cached.maze, nodes: cached.nodes };
    }
    
    // Generate new chunk
    const chunk = this.generateCorridorChunk(chunkX, chunkY, gridSize);
    ChunkManager.cacheChunk(chunkKey, chunk);
    
    return { maze: chunk.maze, nodes: chunk.nodes };
  }

  /**
   * Generate a chunk using Delaunay triangulation and A* pathfinding
   * This is the primary maze generation method using the DelaunayMazeGenerator class.
   */
  private static generateCorridorChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    // Create generator instance (uses Delaunay triangulation for connectivity)
    const generator = new DelaunayMazeGenerator();
    
    // Configure generator for this chunk
    generator.levelSize = [this.chunkSize, this.chunkSize];
    generator.regionCount = Math.max(this.chunkSize, this.chunkSize) * 2; // More regions for denser connections
    generator.minRegionDistance = 3;
    
    // Generate the layout
    const intGrid = generator.generateLayout();
    
    // Convert IntGrid to number[][] format (0 = path, 1 = wall)
    const maze: number[][] = [];
    for (let y = 0; y < this.chunkSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        row.push(intGrid.getTile(x, y));
      }
      maze.push(row);
    }
    
    // Generate connection points on borders for chunk connectivity
    const roadConnections = this.generateConnectionPoints(maze);
    
    // Generate nodes efficiently
    const nodes = NodeGenerator.generateOptimizedNodes(
      maze, 
      chunkX, 
      chunkY, 
      this.chunkSize, 
      gridSize, 
      // Create seeded random generator
      RandomUtil.createSeededRandom(RandomUtil.getChunkSeed(chunkX, chunkY, this.globalSeed))
    );
    
    return { maze, nodes, roadConnections };
  }

  /**
   * Generate connection points on chunk borders
   */
  private static generateConnectionPoints(maze: number[][]): { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] {
    const connections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] = [];
    const size = this.chunkSize;
    
    // North border (y = size-1)
    for (let x = 1; x < size - 1; x++) {
      if (maze[size - 1][x] === 0) { // Path tile
        connections.push({ x, y: size - 1, direction: 'north' });
        break; // Just one connection per border for simplicity
      }
    }
    
    // South border (y = 0)
    for (let x = 1; x < size - 1; x++) {
      if (maze[0][x] === 0) { // Path tile
        connections.push({ x, y: 0, direction: 'south' });
        break;
      }
    }
    
    // East border (x = size-1)
    for (let y = 1; y < size - 1; y++) {
      if (maze[y][size - 1] === 0) { // Path tile
        connections.push({ x: size - 1, y, direction: 'east' });
        break;
      }
    }
    
    // West border (x = 0)
    for (let y = 1; y < size - 1; y++) {
      if (maze[y][0] === 0) { // Path tile
        connections.push({ x: 0, y, direction: 'west' });
        break;
      }
    }
    
    return connections;
  }

  /**
   * Get multiple chunks efficiently (batch operation)
   */
  static getChunkRegion(
    startChunkX: number,
    startChunkY: number,
    widthInChunks: number,
    heightInChunks: number,
    gridSize: number
  ): Map<string, { maze: number[][]; nodes: MapNode[] }> {
    const region: ChunkRegion = {
      startChunkX,
      startChunkY,
      widthInChunks,
      heightInChunks
    };

    return ChunkManager.getChunkRegion(region, gridSize, (chunkX, chunkY, gridSize) => 
      this.getChunk(chunkX, chunkY, gridSize)
    );
  }

  /**
   * Set global seed for deterministic generation
   */
  static setSeed(seed: number): void {
    this.globalSeed = seed;
    this.clearCache(); // Clear cache when changing seed
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { cachedChunks: number; maxCachedChunks: number } {
    return ChunkManager.getCacheStats();
  }

  /**
   * Clear cached chunks (for new game or memory management)
   */
  static clearCache(): void {
    ChunkManager.clearCache();
  }

  /**
   * Preload chunks around a position for smoother gameplay
   */
  static preloadChunksAround(centerChunkX: number, centerChunkY: number, radius: number, gridSize: number): void {
    ChunkManager.preloadChunksAround(centerChunkX, centerChunkY, radius, gridSize, (chunkX, chunkY, gridSize) => {
      this.getChunk(chunkX, chunkY, gridSize);
    });
  }
}
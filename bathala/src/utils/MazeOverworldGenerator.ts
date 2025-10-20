import { MapNode } from "../core/types/MapTypes";
import { ChunkData, ChunkRegion } from "./MazeGeneration/Core/types";
import { ChunkManager } from "./MazeGeneration/Shared/ChunkManager";
import { MazeGeneratorRegistry } from "./MazeGeneration/MazeGeneratorRegistry";
import { NodeGenerator } from "./MazeGeneration/Shared/NodeGenerator";
import { RandomUtil } from "./MazeGeneration/Core/RandomUtil";

/*
  MazeOverworldGenerator
  ----------------------
  Main entry point for overworld maze generation.
  
  This class orchestrates the generation of maze chunks for the overworld,
  using any registered maze generator through the MazeGeneratorRegistry.
  
  Features:
    - Chunk-based generation for infinite worlds
    - Caching for performance
    - Node placement (enemies, shops, etc.)
    - Connection point generation for chunk connectivity
    - Seamless switching between different generation algorithms
    
  Usage:
    // Use default generator
    MazeOverworldGenerator.getChunk(0, 0, 20);
    
    // Switch to different generator
    MazeOverworldGenerator.setGeneratorType('cellular-automata');
    MazeOverworldGenerator.getChunk(0, 0, 20);
*/
export class MazeOverworldGenerator {
  // =============================
  // Generation Configuration
  // =============================
  
  private static chunkSize: number = 20; // Larger chunk size for corridor generation
  private static globalSeed: number = Math.floor(Math.random() * 100000); // Global seed for deterministic generation
  private static generatorType: string = 'delaunay'; // Current generator type

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
   * Generate a chunk using the currently selected maze generator
   * This method uses the MazeGeneratorRegistry to get the active generator.
   */
  private static generateCorridorChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    // Get the current generator from the registry
    const generator = MazeGeneratorRegistry.getGenerator(this.generatorType);
    
    // Configure generator for this chunk if it supports configuration
    if (generator.configure) {
      generator.configure({
        levelSize: [this.chunkSize, this.chunkSize],
        regionCount: Math.max(this.chunkSize, this.chunkSize) * 2,
        minRegionDistance: 3
      });
    }
    
    // Generate the layout using the chunk-specific seed
    const chunkSeed = RandomUtil.getChunkSeed(chunkX, chunkY, this.globalSeed);
    const intGrid = generator.generateLayout(this.chunkSize, this.chunkSize, chunkSeed);
    
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
   * Set the maze generator type to use for new chunks
   * Available types: 'delaunay', 'cellular-automata', etc.
   */
  static setGeneratorType(type: string): void {
    if (!MazeGeneratorRegistry.hasGenerator(type)) {
      const available = MazeGeneratorRegistry.getAvailableTypes();
      throw new Error(
        `Generator type '${type}' not found. Available types: ${available.join(', ')}`
      );
    }
    this.generatorType = type;
    this.clearCache(); // Clear cache when changing generator
    console.log(`✓ MazeOverworldGenerator now using: ${type}`);
  }

  /**
   * Get the current generator type
   */
  static getGeneratorType(): string {
    return this.generatorType;
  }

  /**
   * Get information about available generators
   */
  static getAvailableGenerators(): Array<{ type: string; name: string; config: Record<string, any> }> {
    return MazeGeneratorRegistry.getGeneratorInfo();
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
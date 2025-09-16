import { MapNode } from "../core/types/MapTypes";
import { 
  ChunkData,
  ChunkRegion,
  RandomUtil,
  CellularAutomataMazeGenerator,
  RoadNetworkGenerator,
  ChunkConnectivityManager,
  NodeGenerator,
  ChunkManager
} from "./MazeGeneration";

export class MazeOverworldGenerator {
  private static chunkSize: number = 8; // Increased for better performance ratio
  private static globalSeed: number = RandomUtil.get5DigitRandom(); // Global seed for deterministic generation

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
    const chunk = this.generateOptimizedChunk(chunkX, chunkY, gridSize);
    ChunkManager.cacheChunk(chunkKey, chunk);
    
    return { maze: chunk.maze, nodes: chunk.nodes };
  }

  /**
   * Generate an optimized chunk using Perlin-inspired noise and road networks
   */
  private static generateOptimizedChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    const chunkSeed = RandomUtil.getChunkSeed(chunkX, chunkY, this.globalSeed);
    const rng = RandomUtil.createSeededRandom(chunkSeed);
    
    // Initialize maze with cellular automata base
    let maze = CellularAutomataMazeGenerator.generateCellularAutomataMaze(this.chunkSize, rng);
    
    // Add road network
    const roadConnections = RoadNetworkGenerator.generateRoadNetwork(maze, this.chunkSize, rng);
    
    // Ensure connectivity between chunks
    ChunkConnectivityManager.ensureChunkConnectivity(maze, chunkX, chunkY, this.chunkSize, rng);
    
    // Remove any isolated roads
    RoadNetworkGenerator.removeIsolatedRoads(maze, this.chunkSize);
    
    // Post-process for better structure
    const processedMaze = CellularAutomataMazeGenerator.postProcessMaze(maze, this.chunkSize, rng);
    
    // Generate nodes efficiently
    const nodes = NodeGenerator.generateOptimizedNodes(
      processedMaze, 
      chunkX, 
      chunkY, 
      this.chunkSize, 
      gridSize, 
      rng
    );
    
    return { maze: processedMaze, nodes, roadConnections };
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
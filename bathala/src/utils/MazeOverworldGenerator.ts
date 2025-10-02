import { MapNode } from "../core/types/MapTypes";
import { 
  ChunkData,
  ChunkRegion,
  RandomUtil,
  CellularAutomataMazeGenerator,
  RoadNetworkGenerator,
  ChunkConnectivityManager,
  NodeGenerator,
  ChunkManager,
  DelaunayMazeGenerator,
  AnalyzerContext,
  analyzeAndFixDeadEnds
} from "./MazeGeneration";

export class MazeOverworldGenerator {
  private static chunkSize: number = 32; // Increased for proper Delaunay triangulation (external tool uses 50x50)
  private static globalSeed: number = RandomUtil.get5DigitRandom(); // Global seed for deterministic generation

  /**
   * Generation modes for different maze styles
   */
  public static readonly GENERATION_MODES = {
    DELAUNAY_TRIANGULATION: 'delaunay',    // Primary method with structured layouts
    HYBRID: 'hybrid',                      // Combines Delaunay with cellular automata
    CELLULAR_AUTOMATA: 'cellular'          // Legacy method for comparison
  } as const;

  /**
   * Generate or retrieve a maze chunk with guaranteed connections
   */
  static getChunk(chunkX: number, chunkY: number, gridSize: number, mode: string = MazeOverworldGenerator.GENERATION_MODES.DELAUNAY_TRIANGULATION): {
    maze: number[][];
    nodes: MapNode[];
  } {
    const chunkKey = ChunkManager.generateChunkKey(chunkX, chunkY);
    
    // Return cached chunk if it exists
    const cached = ChunkManager.getCachedChunk(chunkKey);
    if (cached) {
      return { maze: cached.maze, nodes: cached.nodes };
    }
    
    // Generate new chunk based on mode
    let chunk: ChunkData;
    switch (mode) {
      case this.GENERATION_MODES.DELAUNAY_TRIANGULATION:
        chunk = this.generateDelaunayChunk(chunkX, chunkY, gridSize);
        break;
      case this.GENERATION_MODES.HYBRID:
        chunk = this.generateHybridChunk(chunkX, chunkY, gridSize);
        break;
      default:
        chunk = this.generateOptimizedChunk(chunkX, chunkY, gridSize);
        break;
    }
    
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
   * Generate a chunk using Delaunay triangulation-based approach
   * Optimized for overworld exploration with natural path networks
   */
  private static generateDelaunayChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    const chunkSeed = RandomUtil.getChunkSeed(chunkX, chunkY, this.globalSeed);
    const rng = RandomUtil.createSeededRandom(chunkSeed);
    
    // Initialize Delaunay generator with overworld-optimized parameters
    const delaunayGen = new DelaunayMazeGenerator();
    delaunayGen.levelSize = [this.chunkSize, this.chunkSize];
    
    // Adjust region count for small chunks (external tool uses 15 regions for 50x50)
    // Scale appropriately: 8x8 chunk should have fewer regions
    const scaleFactor = (this.chunkSize * this.chunkSize) / (50 * 50); // Compare to external tool size
    const baseRegions = Math.max(3, Math.floor(15 * scaleFactor)); // Scale from external tool's 15 regions
    const variationRange = Math.max(1, Math.floor(baseRegions * 0.4)); // Reduce variation for small chunks
    delaunayGen.regionCount = baseRegions + Math.floor(rng.next() * variationRange);
    
    // Minimum distance scales with chunk size (external tool uses 4 for 50x50)
    delaunayGen.minRegionDistance = Math.max(1, Math.floor(4 * Math.sqrt(scaleFactor)));
    
    // Generate the base layout
    const intGrid = delaunayGen.generateLayout(rng, this.chunkSize);
    
    // Apply dead-end analysis for cleaner path networks
    const ctx: AnalyzerContext = {
      PATH_TILE: delaunayGen.PATH_TILE,
      REGION_TILE: delaunayGen.REGION_TILE,
      levelSize: [this.chunkSize, this.chunkSize],
      inBounds: (pos) => delaunayGen.inBounds(pos),
      getNeighbors: (pos) => this.getNeighbors(pos),
      wouldCreateDoubleWideAt: (pos, grid) => delaunayGen.wouldCreateDoubleWideAt(pos, grid),
    };
    
    analyzeAndFixDeadEnds(
      intGrid,
      ctx,
      (start, end, grid) => delaunayGen.findPathSegment(start, end, grid),
      (grid) => delaunayGen.fixDoubleWidePaths(grid)
    );
    
    // Convert to standard maze format (0 = path/open, 1 = wall/blocked)
    let maze = intGrid.toMazeFormat();
    
    // Convert Delaunay tiles to overworld format
    // PATH_TILE (1) -> 0 (walkable), REGION_TILE (2) -> 1 (blocked)
    for (let x = 0; x < this.chunkSize; x++) {
      for (let y = 0; y < this.chunkSize; y++) {
        if (maze[x][y] === delaunayGen.PATH_TILE) {
          maze[x][y] = 0; // Walkable path
        } else if (maze[x][y] === delaunayGen.REGION_TILE) {
          maze[x][y] = 1; // Blocked terrain
        } else {
          maze[x][y] = 1; // Default to blocked for any other values
        }
      }
    }
    
    // Add natural road network to connect regions better
    const roadConnections = RoadNetworkGenerator.generateRoadNetwork(maze, this.chunkSize, rng);
    
    // Ensure connectivity between chunks for seamless world navigation
    ChunkConnectivityManager.ensureChunkConnectivity(maze, chunkX, chunkY, this.chunkSize, rng);
    
    // Remove any isolated roads that don't connect to the main network
    RoadNetworkGenerator.removeIsolatedRoads(maze, this.chunkSize);
    
    // Generate nodes efficiently for game entities and events
    const nodes = NodeGenerator.generateOptimizedNodes(
      maze, 
      chunkX, 
      chunkY, 
      this.chunkSize, 
      gridSize, 
      rng
    );
    
    return { maze, nodes, roadConnections };
  }

  /**
   * Generate a hybrid chunk combining cellular automata and Delaunay approaches
   */
  private static generateHybridChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    const chunkSeed = RandomUtil.getChunkSeed(chunkX, chunkY, this.globalSeed);
    const rng = RandomUtil.createSeededRandom(chunkSeed);
    
    // Start with cellular automata base
    let maze = CellularAutomataMazeGenerator.generateCellularAutomataMaze(this.chunkSize, rng);
    
    // Use Delaunay for additional structure if chunk has enough open space
    const openSpaceCount = maze.flat().filter(tile => tile === 0).length;
    const totalCells = this.chunkSize * this.chunkSize;
    const openSpaceRatio = openSpaceCount / totalCells;
    
    if (openSpaceRatio > 0.3) { // If chunk has significant open space
      // Generate Delaunay structure
      const delaunayGen = new DelaunayMazeGenerator();
      delaunayGen.levelSize = [this.chunkSize, this.chunkSize];
      delaunayGen.regionCount = Math.floor(2 + rng.next() * 4); // Fewer regions for hybrid
      delaunayGen.minRegionDistance = 3;
      
      const delaunayLayout = delaunayGen.generateLayout(rng, this.chunkSize);
      
      // Merge Delaunay paths with cellular automata base
      for (let x = 0; x < this.chunkSize; x++) {
        for (let y = 0; y < this.chunkSize; y++) {
          if (delaunayLayout.getTile(x, y) === delaunayGen.PATH_TILE) {
            maze[x][y] = 0; // Convert to open space
          }
        }
      }
    }
    
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

  /** 4-connected neighbor generator (Up, Right, Down, Left). */
  private static getNeighbors(pos: [number, number]): [number, number][] {
    const [x, y] = pos;
    return [
      [x, y + 1],  // Up
      [x + 1, y],  // Right
      [x, y - 1],  // Down
      [x - 1, y]   // Left
    ];
  }

  /**
   * Get multiple chunks efficiently (batch operation)
   */
  static getChunkRegion(
    startChunkX: number,
    startChunkY: number,
    widthInChunks: number,
    heightInChunks: number,
    gridSize: number,
    mode: string = MazeOverworldGenerator.GENERATION_MODES.DELAUNAY_TRIANGULATION
  ): Map<string, { maze: number[][]; nodes: MapNode[] }> {
    const region: ChunkRegion = {
      startChunkX,
      startChunkY,
      widthInChunks,
      heightInChunks
    };

    return ChunkManager.getChunkRegion(region, gridSize, (chunkX, chunkY, gridSize) => 
      this.getChunk(chunkX, chunkY, gridSize, mode)
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
  static preloadChunksAround(centerChunkX: number, centerChunkY: number, radius: number, gridSize: number, mode: string = MazeOverworldGenerator.GENERATION_MODES.DELAUNAY_TRIANGULATION): void {
    ChunkManager.preloadChunksAround(centerChunkX, centerChunkY, radius, gridSize, (chunkX, chunkY, gridSize) => {
      this.getChunk(chunkX, chunkY, gridSize, mode);
    });
  }
}
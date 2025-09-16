import { MapNode, NodeType } from "../core/types/MapTypes";

class RandomUtil {
  // Private static helper method — not accessible outside this class
  private static generateSeed(): number {
    const now = Date.now();
    const perf = performance.now();
    return now + perf;
  }

  // Public static method to get a 5-digit random number
  static get5DigitRandom(): number {
    const seed = this.generateSeed();
    const raw = Math.sin(seed) * 1000000 + Math.cos(seed / 2) * 100000;
    const fiveDigit = Math.floor(Math.abs(raw)) % 90000 + 10000;
    return fiveDigit;
  }
}

interface ChunkData {
  maze: number[][];
  nodes: MapNode[];
  roadConnections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[];
}

interface SeededRandom {
  seed: number;
  next(): number;
}

export class MazeOverworldGenerator {
  private static chunks: Map<string, ChunkData> = new Map();
  private static chunkSize: number = 8; // Increased for better performance ratio
  private static generatedChunks: Set<string> = new Set();
  private static maxCachedChunks: number = 100; // Memory management
  private static globalSeed: number = RandomUtil.get5DigitRandom(); // Global seed for deterministic generation
  
  // Terrain constants
  private static readonly WALL = 1;
  private static readonly PATH = 0;
  
  // Road network parameters
  private static readonly ROAD_DENSITY = 0.8; // Probability of major road per chunk
  private static readonly SECONDARY_ROAD_CHANCE = 0.9;
  private static readonly ROAD_WIDTH = 1;

  /**
   * Generate or retrieve a maze chunk with guaranteed connections
   */
  static getChunk(chunkX: number, chunkY: number, gridSize: number): {
    maze: number[][];
    nodes: MapNode[];
  } {
    const chunkKey = `${chunkX},${chunkY}`;
    
    // Return cached chunk if it exists
    if (this.chunks.has(chunkKey)) {
      const cached = this.chunks.get(chunkKey)!;
      return { maze: cached.maze, nodes: cached.nodes };
    }
    
    // Memory management - remove oldest chu nks if cache is full
    if (this.chunks.size >= this.maxCachedChunks) {
      const oldestKey = this.chunks.keys().next().value;
      if (oldestKey) {
        this.chunks.delete(oldestKey);
        this.generatedChunks.delete(oldestKey);
      }
    }
    
    // Generate new chunk
    const chunk = this.generateOptimizedChunk(chunkX, chunkY, gridSize);
    this.chunks.set(chunkKey, chunk);
    this.generatedChunks.add(chunkKey);
    
    return { maze: chunk.maze, nodes: chunk.nodes };
  }

  /**
   * Create a seeded random number generator for deterministic generation
   */
  private static createSeededRandom(seed: number): SeededRandom {
    return {
      seed: seed,
      next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
      }
    };
  }

  /**
   * Get deterministic seed for a chunk
   */
  private static getChunkSeed(chunkX: number, chunkY: number): number {
    // Use bit manipulation for better distribution
    return ((chunkX * 73856093) ^ (chunkY * 19349663) ^ this.globalSeed) & 0x7fffffff;
  }

  /**
   * Generate an optimized chunk using Perlin-inspired noise and road networks
   */
  private static generateOptimizedChunk(chunkX: number, chunkY: number, gridSize: number): ChunkData {
    const chunkSeed = this.getChunkSeed(chunkX, chunkY);
    const rng = this.createSeededRandom(chunkSeed);
    
    // Initialize maze with cellular automata base
    let maze = this.generateCellularAutomataMaze(rng);
    
    // Add road network
    const roadConnections = this.generateRoadNetwork(maze, chunkX, chunkY, rng);
    
    // Ensure connectivity between chunks
    this.ensureChunkConnectivity(maze, chunkX, chunkY, rng);
    
    // Remove any isolated roads
    this.removeIsolatedRoads(maze);
    
    // Post-process for better structure
    const processedMaze = this.postProcessMaze(maze, rng);
    
    // Generate nodes efficiently
    const nodes = this.generateOptimizedNodes(processedMaze, chunkX, chunkY, gridSize, rng);
    
    return { maze: processedMaze, nodes, roadConnections };
}

/**
 * Check and remove isolated roads using a plus-shaped multi-chunk analysis
 * Processes the center chunk and its four adjacent chunks (north, south, east, west)
 */
private static removeIsolatedRoads(maze: number[][]): void {
  // Define sub-chunk size (must be smaller than chunkSize)
  const subChunkSize = 4; // Process in 4x4 chunks
  
  let hasIsolatedRoads = true;
  while (hasIsolatedRoads) {
    hasIsolatedRoads = false;
    
    // Process the center chunk and its four adjacent chunks in a plus shape
    const chunkDirections = [
      { dx: 0, dy: 0 },    // Center
      { dx: 0, dy: -1 },   // North
      { dx: 0, dy: 1 },    // South
      { dx: -1, dy: 0 },   // West
      { dx: 1, dy: 0 }     // East
    ];
    
    for (const direction of chunkDirections) {
      const offsetX = direction.dx * this.chunkSize;
      const offsetY = direction.dy * this.chunkSize;
      
      // Process each subchunk within the current chunk
      for (let chunkY = 0; chunkY < this.chunkSize; chunkY += subChunkSize) {
        for (let chunkX = 0; chunkX < this.chunkSize; chunkX += subChunkSize) {
          // Only process cells in the center chunk
          if (direction.dx === 0 && direction.dy === 0) {
            // Process each cell within the subchunk
            for (let dy = 0; dy < subChunkSize; dy++) {
              const y = chunkY + dy;
              if (y <= 0 || y >= this.chunkSize - 1) continue;
              
              for (let dx = 0; dx < subChunkSize; dx++) {
                const x = chunkX + dx;
                if (x <= 0 || x >= this.chunkSize - 1) continue;
                
                if (maze[y][x] === this.PATH) {
                  // Check if the road is isolated by examining adjacent chunks
                  const isIsolated = this.isRoadIsolated(maze, x, y, direction);
                  
                  if (isIsolated) {
                    maze[y][x] = this.WALL;
                    hasIsolatedRoads = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Check if a road cell is isolated by examining surrounding cells including adjacent chunks
 */
private static isRoadIsolated(maze: number[][], x: number, y: number, direction: { dx: number; dy: number }): boolean {
  const directions = [
    { dx: 0, dy: -1 },  // North
    { dx: 0, dy: 1 },   // South
    { dx: -1, dy: 0 },  // West
    { dx: 1, dy: 0 }    // East
  ];
  
  let wallCount = 0;
  
  for (const dir of directions) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    
    // Check if the position is within the current chunk
    if (nx >= 0 && nx < this.chunkSize && ny >= 0 && ny < this.chunkSize) {
      if (maze[ny][nx] === this.WALL) {
        wallCount++;
      }
    } else {
      // Position is in an adjacent chunk
      // For now, treat out-of-bounds as walls unless it's at the edge connecting to an adjacent chunk
      const isEdgeConnection = (
        (nx < 0 && direction.dx === -1) ||
        (nx >= this.chunkSize && direction.dx === 1) ||
        (ny < 0 && direction.dy === -1) ||
        (ny >= this.chunkSize && direction.dy === 1)
      );
      
      if (!isEdgeConnection) {
        wallCount++;
      }
    }
  }
  
  return wallCount === 4;
}

  /**
   * Generate base maze using cellular automata
   */
  private static generateCellularAutomataMaze(rng: SeededRandom): number[][] {
    let maze: number[][] = [];
    const fillProbability = 0.45; // 45% chance of initial wall
    
    // Initialize with random noise
    for (let y = 0; y < this.chunkSize; y++) {
      maze[y] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        maze[y][x] = rng.next() < fillProbability ? this.WALL : this.PATH;
      }
    }
    
    // Apply cellular automata rules (3-5 iterations for good results)
    for (let iteration = 0; iteration < 4; iteration++) {
      const newMaze = this.applyCellularRules(maze, rng);
      maze = newMaze;
    }
    
    return maze;
  }

  /**
   * Apply cellular automata rules
   */
  private static applyCellularRules(maze: number[][], rng: SeededRandom): number[][] {
    const newMaze: number[][] = [];
    
    for (let y = 0; y < this.chunkSize; y++) {
      newMaze[y] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        const wallCount = this.countWallNeighbors(maze, x, y);
        
        // Cellular automata rule: become wall if 5+ neighbors are walls
        if (wallCount >= 1) {
          newMaze[y][x] = this.WALL;
        } else if (wallCount <= 2) {
          newMaze[y][x] = this.PATH;
        } else {
          // Keep current state with slight randomization
          newMaze[y][x] = maze[y][x];
          if (rng.next() < 0.1) { // 10% chance to flip
            newMaze[y][x] = 1 - newMaze[y][x];
          }
        }
      }
    }
    
    return newMaze;
  }

  /**
   * Count wall neighbors for cellular automata
   */
  private static countWallNeighbors(maze: number[][], x: number, y: number): number {
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // Treat out-of-bounds as walls
        if (nx < 0 || nx >= this.chunkSize || ny < 0 || ny >= this.chunkSize) {
          count++;
        } else if (maze[ny][nx] === this.WALL) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Generate road network within chunk
   */
  private static generateRoadNetwork(maze: number[][], chunkX: number, chunkY: number, rng: SeededRandom): 
    { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] {
    
    const connections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[] = [];
    
    // Decide if this chunk should have major roads
    if (rng.next() < this.ROAD_DENSITY) {
      const center = Math.floor(this.chunkSize / 2);
      
      // Create main road (horizontal or vertical)
      if (rng.next() < 0.5) {
        // Horizontal road
        this.drawRoad(maze, 0, center, this.chunkSize - 1, center, this.ROAD_WIDTH);
        connections.push(
          { x: 0, y: center, direction: 'west' },
          { x: this.chunkSize - 1, y: center, direction: 'east' }
        );
      } else {
        // Vertical road
        this.drawRoad(maze, center, 0, center, this.chunkSize - 1, this.ROAD_WIDTH);
        connections.push(
          { x: center, y: 0, direction: 'north' },
          { x: center, y: this.chunkSize - 1, direction: 'south' }
        );
      }
    }
    
    // Add secondary roads
    if (rng.next() < this.SECONDARY_ROAD_CHANCE) {
      const numSecondary = Math.floor(rng.next() * 2) + 1; // 1-2 secondary roads
      
      for (let i = 0; i < numSecondary; i++) {
        const startX = Math.floor(rng.next() * (this.chunkSize - 4)) + 2;
        const startY = Math.floor(rng.next() * (this.chunkSize - 4)) + 2;
        const length = Math.floor(rng.next() * 15) + 8; // 8-22 length
        const angle = rng.next() * Math.PI * 2;
        
        const endX = Math.max(2, Math.min(this.chunkSize - 3, 
          startX + Math.floor(length * Math.cos(angle))));
        const endY = Math.max(2, Math.min(this.chunkSize - 3, 
          startY + Math.floor(length * Math.sin(angle))));
        
        this.drawRoad(maze, startX, startY, endX, endY, 1);
      }
    }
    
    return connections;
  }

  /**
   * Draw road between two points using Bresenham's algorithm
   */
  private static drawRoad(maze: number[][], x0: number, y0: number, x1: number, y1: number, width: number): void {
    const points = this.bresenhamLine(x0, y0, x1, y1);
    
    for (const [x, y] of points) {
      // Draw thick road
      for (let dx = -Math.floor(width/2); dx <= Math.floor(width/2); dx++) {
        for (let dy = -Math.floor(width/2); dy <= Math.floor(width/2); dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.chunkSize && ny >= 0 && ny < this.chunkSize) {
            maze[ny][nx] = this.PATH;
          }
        }
      }
    }
  }

  /**
   * Bresenham's line algorithm
   */
  private static bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const points: [number, number][] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      points.push([x, y]);
      
      if (x === x1 && y === y1) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return points;
  }

  /**
   * Ensure connectivity between adjacent chunks
   */
  private static ensureChunkConnectivity(maze: number[][], chunkX: number, chunkY: number, rng: SeededRandom): void {
    const center = Math.floor(this.chunkSize / 2);
    const connectionWidth = 2; // Wider connections for better flow
    
    // Check if adjacent chunks exist and create connections
    const adjacentChunks = [
      { dx: 0, dy: -1, edge: 'north', x: center, y: 0 },
      { dx: 0, dy: 1, edge: 'south', x: center, y: this.chunkSize - 1 },
      { dx: 1, dy: 0, edge: 'east', x: this.chunkSize - 1, y: center },
      { dx: -1, dy: 0, edge: 'west', x: 0, y: center }
    ];
    
    for (const adj of adjacentChunks) {
      const adjChunkKey = `${chunkX + adj.dx},${chunkY + adj.dy}`;
      
      // Create connection points (not necessarily to existing chunks, for future connectivity)
      if (rng.next() < 0.7) { // 70% chance of connection
        // Create wider entrance
        for (let i = -Math.floor(connectionWidth/2); i <= Math.floor(connectionWidth/2); i++) {
          if (adj.edge === 'north' || adj.edge === 'south') {
            const nx = adj.x + i;
            if (nx >= 0 && nx < this.chunkSize) {
              maze[adj.y][nx] = this.PATH;
              // Create a path leading inward
              const pathLength = Math.min(8, this.chunkSize / 4);
              for (let j = 1; j <= pathLength; j++) {
                const ny = adj.edge === 'north' ? adj.y + j : adj.y - j;
                if (ny >= 0 && ny < this.chunkSize) {
                  maze[ny][nx] = this.PATH;
                }
              }
            }
          } else {
            const ny = adj.y + i;
            if (ny >= 0 && ny < this.chunkSize) {
              maze[ny][adj.x] = this.PATH;
              // Create a path leading inward
              const pathLength = Math.min(8, this.chunkSize / 4);
              for (let j = 1; j <= pathLength; j++) {
                const nx = adj.edge === 'west' ? adj.x + j : adj.x - j;
                if (nx >= 0 && nx < this.chunkSize) {
                  maze[ny][nx] = this.PATH;
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Post-process maze to improve structure
   */
  private static postProcessMaze(maze: number[][], rng: SeededRandom): number[][] {
    // Remove small isolated wall clusters
    const processed = maze.map(row => [...row]);
    
    for (let y = 1; y < this.chunkSize - 1; y++) {
      for (let x = 1; x < this.chunkSize - 1; x++) {
        if (processed[y][x] === this.WALL) {
          const wallNeighbors = this.countWallNeighbors(processed, x, y);
          // Remove isolated walls
          if (wallNeighbors <= 2) {
            processed[y][x] = this.PATH;
          }
        }
      }
    }
    
    // Widen some paths randomly for better navigability
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(rng.next() * (this.chunkSize - 2)) + 1;
      const y = Math.floor(rng.next() * (this.chunkSize - 2)) + 1;
      
      if (processed[y][x] === this.PATH) {
        // Create small clearings
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.chunkSize && ny >= 0 && ny < this.chunkSize) {
              if (rng.next() < 0.1) { // 60% chance
                processed[ny][nx] = this.PATH;
              }
            }
          }
        }
      }
    }
    
    return processed;
  }

  /**
   * Generate nodes efficiently using spatial hashing
   */
  private static generateOptimizedNodes(
    maze: number[][],
    chunkX: number,
    chunkY: number,
    gridSize: number,
    rng: SeededRandom
  ): MapNode[] {
    const nodes: MapNode[] = [];
    const nodeTypes: NodeType[] = ["combat", "elite", "shop", "event", "campfire", "treasure"];
    
    // Pre-calculate valid positions (paths only)
    const validPositions: { x: number; y: number }[] = [];
    const minDistanceFromEdge = 3;
    
    for (let y = minDistanceFromEdge; y < this.chunkSize - minDistanceFromEdge; y++) {
      for (let x = minDistanceFromEdge; x < this.chunkSize - minDistanceFromEdge; x++) {
        if (maze[y][x] === this.PATH) {
          // Check if position has enough open space around it
          let openNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (maze[y + dy][x + dx] === this.PATH) {
                openNeighbors++;
              }
            }
          }
          
          // Only add positions with sufficient open space
          if (openNeighbors >= 5) {
            validPositions.push({ x, y });
          }
        }
      }
    }
    
    if (validPositions.length === 0) return nodes;
    
    // Determine number of nodes based on chunk size and valid positions
    const baseNodeCount = Math.min(3, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + baseNodeCount; // baseNodeCount to baseNodeCount+1
    
    // Use spatial distribution to avoid clustering
    const minNodeDistance = this.chunkSize / 4;
    const placedPositions: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount && validPositions.length > 0; i++) {
      // Find position far enough from existing nodes
      let bestPosition = null;
      let maxMinDistance = 0;
      
      for (const pos of validPositions) {
        let minDistanceToExisting = Infinity;
        
        for (const placed of placedPositions) {
          const distance = Math.sqrt((pos.x - placed.x) ** 2 + (pos.y - placed.y) ** 2);
          minDistanceToExisting = Math.min(minDistanceToExisting, distance);
        }
        
        if (minDistanceToExisting > maxMinDistance && minDistanceToExisting >= minNodeDistance) {
          maxMinDistance = minDistanceToExisting;
          bestPosition = pos;
        }
      }
      
      // If no position meets minimum distance, just pick randomly
      if (!bestPosition && validPositions.length > 0) {
        const randomIndex = Math.floor(rng.next() * validPositions.length);
        bestPosition = validPositions[randomIndex];
      }
      
      if (bestPosition) {
        const type = nodeTypes[Math.floor(rng.next() * nodeTypes.length)];
        
        nodes.push({
          id: `${type}-${chunkX}-${chunkY}-${i}`,
          type,
          x: (chunkX * this.chunkSize + bestPosition.x) * gridSize,
          y: (chunkY * this.chunkSize + bestPosition.y) * gridSize,
          row: chunkY * this.chunkSize + bestPosition.y,
          connections: [],
          visited: false,
          available: true,
          completed: false,
        });
        
        placedPositions.push(bestPosition);
        // Remove used position and nearby positions to avoid clustering
        validPositions.splice(validPositions.findIndex(p => p.x === bestPosition!.x && p.y === bestPosition!.y), 1);
      }
    }
    
    return nodes;
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
    const region = new Map<string, { maze: number[][]; nodes: MapNode[] }>();
    
    for (let cy = startChunkY; cy < startChunkY + heightInChunks; cy++) {
      for (let cx = startChunkX; cx < startChunkX + widthInChunks; cx++) {
        const chunkKey = `${cx},${cy}`;
        const chunk = this.getChunk(cx, cy, gridSize);
        region.set(chunkKey, chunk);
      }
    }
    
    return region;
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
  static preloadChunksAround(centerChunkX: number, centerChunkY: number, radius: number, gridSize: number): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        // Preload in background without blocking
        setTimeout(() => {
          this.getChunk(centerChunkX + dx, centerChunkY + dy, gridSize);
        }, 0);
      }
    }
  }
}
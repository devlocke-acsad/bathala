import { SeededRandom } from "../Core/types";

/**
 * Maze generation using cellular automata algorithm
 */
/*
  CellularAutomataMazeGenerator
  -----------------------------
  Generates mazes using cellular automata algorithm.
  
  Process:
    1. Initialize grid with random noise based on fill probability
    2. Apply cellular automata rules for several iterations
    3. Post-process to improve structure and navigability
  
  Key parameters:
    - fillProbability: Initial wall density
    - iterations: Number of cellular automata applications
    - post-processing: Removes isolated walls and widens paths
*/
export class CellularAutomataMazeGenerator {
  // =============================
  // Generation Constants
  // =============================
  
  private static readonly WALL = 1;
  private static readonly PATH = 0;

  // =============================
  // Generation Parameters
  // =============================
  
  // Cellular automata parameters
  private static readonly FILL_PROBABILITY = 0.45; // 45% chance of initial wall
  private static readonly ITERATIONS = 4;         // Number of cellular automata iterations
  private static readonly ISOLATED_WALL_THRESHOLD = 2; // Remove walls with fewer neighbors
  private static readonly PATH_WIDENING_CHANCE = 0.1;  // Chance to widen paths

  /**
   * Generate base maze using cellular automata
   */
  static generateCellularAutomataMaze(chunkSize: number, rng: SeededRandom): number[][] {
    let maze: number[][] = [];
    
    // Initialize with random noise
    for (let y = 0; y < chunkSize; y++) {
      maze[y] = [];
      for (let x = 0; x < chunkSize; x++) {
        maze[y][x] = rng.next() < this.FILL_PROBABILITY ? this.WALL : this.PATH;
      }
    }
    
    // Apply cellular automata rules
    for (let iteration = 0; iteration < this.ITERATIONS; iteration++) {
      const newMaze = this.applyCellularRules(maze, chunkSize, rng);
      maze = newMaze;
    }
    
    return maze;
  }

  /**
   * Apply cellular automata rules
   */
  private static applyCellularRules(maze: number[][], chunkSize: number, rng: SeededRandom): number[][] {
    const newMaze: number[][] = [];
    
    for (let y = 0; y < chunkSize; y++) {
      newMaze[y] = [];
      for (let x = 0; x < chunkSize; x++) {
        const wallCount = this.countWallNeighbors(maze, x, y, chunkSize);
        
        // Cellular automata rule: become wall if 5+ neighbors are walls
        if (wallCount >= 5) {
          newMaze[y][x] = this.WALL;
        } else if (wallCount <= 3) {
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
  private static countWallNeighbors(maze: number[][], x: number, y: number, chunkSize: number): number {
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // Treat out-of-bounds as walls
        if (nx < 0 || nx >= chunkSize || ny < 0 || ny >= chunkSize) {
          count++;
        } else if (maze[ny][nx] === this.WALL) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Post-process maze to improve structure
   */
  static postProcessMaze(maze: number[][], chunkSize: number, rng: SeededRandom): number[][] {
    // Remove small isolated wall clusters
    const processed = maze.map(row => [...row]);
    
    for (let y = 1; y < chunkSize - 1; y++) {
      for (let x = 1; x < chunkSize - 1; x++) {
        if (processed[y][x] === this.WALL) {
          const wallNeighbors = this.countWallNeighbors(processed, x, y, chunkSize);
          // Remove isolated walls
          if (wallNeighbors <= this.ISOLATED_WALL_THRESHOLD) {
            processed[y][x] = this.PATH;
          }
        }
      }
    }
    
    // Widen some paths randomly for better navigability
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(rng.next() * (chunkSize - 2)) + 1;
      const y = Math.floor(rng.next() * (chunkSize - 2)) + 1;
      
      if (processed[y][x] === this.PATH) {
        // Create small clearings
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < chunkSize && ny >= 0 && ny < chunkSize) {
              if (rng.next() < this.PATH_WIDENING_CHANCE) {
                processed[ny][nx] = this.PATH;
              }
            }
          }
        }
      }
    }
    
    return processed;
  }
}

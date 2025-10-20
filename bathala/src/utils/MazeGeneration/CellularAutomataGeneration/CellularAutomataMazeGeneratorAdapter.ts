/**
 * CellularAutomataMazeGeneratorAdapter
 * -------------------------------------
 * Adapter that wraps CellularAutomataMazeGenerator to implement the IMazeGenerator interface.
 * 
 * This allows the Cellular Automata generator to be used seamlessly through the
 * unified generator system.
 */

import { IMazeGenerator } from '../IMazeGenerator';
import { IntGrid } from '../Core/IntGrid';
import { CellularAutomataMazeGenerator } from './CellularAutomataMazeGenerator';
import { RandomUtil } from '../Core/RandomUtil';

export class CellularAutomataMazeGeneratorAdapter implements IMazeGenerator {
  readonly type = 'cellular-automata';
  readonly name = 'Cellular Automata Maze';

  /**
   * Generate a maze layout using Cellular Automata
   */
  generateLayout(width: number, height: number, seed: number): IntGrid {
    // Create seeded random generator
    const rng = RandomUtil.createSeededRandom(seed);
    
    // Generate the maze using cellular automata
    const maze = CellularAutomataMazeGenerator.generateCellularAutomataMaze(
      Math.max(width, height), 
      rng
    );
    
    // Post-process to improve structure
    const processedMaze = CellularAutomataMazeGenerator.postProcessMaze(
      maze, 
      Math.max(width, height), 
      rng
    );
    
    // Convert to IntGrid
    const intGrid = new IntGrid(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        intGrid.setTile(x, y, processedMaze[y][x]);
      }
    }
    
    return intGrid;
  }

  /**
   * Configure generator-specific parameters
   */
  configure(config: Record<string, any>): void {
    // Future: allow configuration of fill probability, iterations, etc.
    // For now, the CellularAutomataMazeGenerator uses static constants
    console.log('Cellular Automata configuration:', config);
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): Record<string, any> {
    return {
      fillProbability: 0.45,
      iterations: 4,
      isolatedWallThreshold: 2,
      pathWideningChance: 0.1,
      description: 'Uses cellular automata rules to create organic cave-like mazes'
    };
  }
}

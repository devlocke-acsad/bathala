/**
 * DelaunayMazeGeneratorAdapter
 * ----------------------------
 * Adapter that wraps DelaunayMazeGenerator to implement the IMazeGenerator interface.
 * 
 * This allows the Delaunay-based generator to be used seamlessly through the
 * unified generator system.
 */

import { IMazeGenerator } from '../IMazeGenerator';
import { IntGrid } from '../Core/IntGrid';
import { DelaunayMazeGenerator } from './DelaunayMazeGenerator';

export class DelaunayMazeGeneratorAdapter implements IMazeGenerator {
  readonly type = 'delaunay';
  readonly name = 'Delaunay Triangulation Maze';

  private generator: DelaunayMazeGenerator;

  constructor() {
    this.generator = new DelaunayMazeGenerator();
  }

  /**
   * Generate a maze layout using Delaunay triangulation
   */
  generateLayout(width: number, height: number, _seed: number): IntGrid {
    // Configure the generator
    this.generator.levelSize = [width, height];
    
    // Note: The current DelaunayMazeGenerator implementation uses Math.random()
    // Future enhancement: inject a seeded random number generator for deterministic generation
    // The seed parameter is prefixed with _ to indicate it's intentionally unused for now
    
    return this.generator.generateLayout();
  }

  /**
   * Configure generator-specific parameters
   */
  configure(config: Record<string, any>): void {
    if (config.regionCount !== undefined) {
      this.generator.regionCount = config.regionCount;
    }
    if (config.minRegionDistance !== undefined) {
      this.generator.minRegionDistance = config.minRegionDistance;
    }
    if (config.levelSize !== undefined) {
      this.generator.levelSize = config.levelSize;
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): Record<string, any> {
    return {
      regionCount: 15,
      minRegionDistance: 4,
      description: 'Uses Delaunay triangulation to create connected regions with A* pathfinding'
    };
  }
}

/**
 * MazeChunkGenerator — IChunkGenerator implementation for Act 1
 * (and any future act that wants Delaunay-maze terrain).
 * 
 * Wraps the existing DelaunayMazeGenerator to produce RawChunk objects.
 * 
 * @module MazeChunkGenerator
 */

import {
  IChunkGenerator,
  RawChunk,
  BorderConnection,
  SeededRandom,
} from '../../../core/types/GenerationTypes';
import { DelaunayMazeGenerator } from '../algorithms/DelaunayMazeGenerator';

/** Configuration knobs for the maze generator */
export interface MazeChunkConfig {
  /** Grid dimension of each chunk (square), default 20 */
  readonly chunkSize?: number;
  /** Region density multiplier — higher = denser corridors */
  readonly regionCountMultiplier?: number;
  /** Minimum distance between region seeds */
  readonly minRegionDistance?: number;
}

const DEFAULTS: Required<MazeChunkConfig> = {
  chunkSize: 20,
  regionCountMultiplier: 2, // regionCount = max(w,h) * multiplier
  minRegionDistance: 3,
};

export class MazeChunkGenerator implements IChunkGenerator {
  readonly name = 'maze';
  readonly chunkSize: number;

  private regionCountMultiplier: number;
  private minRegionDistance: number;

  constructor(config: MazeChunkConfig = {}) {
    this.chunkSize = config.chunkSize ?? DEFAULTS.chunkSize;
    this.regionCountMultiplier = config.regionCountMultiplier ?? DEFAULTS.regionCountMultiplier;
    this.minRegionDistance = config.minRegionDistance ?? DEFAULTS.minRegionDistance;
  }

  /**
   * Generate a terrain grid using Delaunay triangulation + A* corridors.
   * Determinism note: the underlying DelaunayMazeGenerator uses Math.random()
   * internally (no per-call seed), so the RNG param is recorded for future
   * refactoring but does not yet control generation.
   */
  generate(_chunkX: number, _chunkY: number, _rng: SeededRandom): RawChunk {
    const gen = new DelaunayMazeGenerator();
    gen.levelSize = [this.chunkSize, this.chunkSize];
    gen.regionCount = Math.max(this.chunkSize, this.chunkSize) * this.regionCountMultiplier;
    gen.minRegionDistance = this.minRegionDistance;

    const intGrid = gen.generateLayout();

    // Convert IntGrid to plain number[][]
    const grid: number[][] = [];
    for (let y = 0; y < this.chunkSize; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        row.push(intGrid.getTile(x, y));
      }
      grid.push(row);
    }

    const borderConnections = this.findBorderConnections(grid);

    return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
  }

  // =========================================================================
  // Border connections for inter-chunk connectivity
  // =========================================================================

  private findBorderConnections(grid: number[][]): BorderConnection[] {
    const size = this.chunkSize;
    const PATH = 0;
    const connections: BorderConnection[] = [];

    // North border (y = size-1)
    for (let x = 1; x < size - 1; x++) {
      if (grid[size - 1][x] === PATH) {
        connections.push({ x, y: size - 1, direction: 'north' });
        break;
      }
    }

    // South border (y = 0)
    for (let x = 1; x < size - 1; x++) {
      if (grid[0][x] === PATH) {
        connections.push({ x, y: 0, direction: 'south' });
        break;
      }
    }

    // East border (x = size-1)
    for (let y = 1; y < size - 1; y++) {
      if (grid[y][size - 1] === PATH) {
        connections.push({ x: size - 1, y, direction: 'east' });
        break;
      }
    }

    // West border (x = 0)
    for (let y = 1; y < size - 1; y++) {
      if (grid[y][0] === PATH) {
        connections.push({ x: 0, y, direction: 'west' });
        break;
      }
    }

    return connections;
  }
}

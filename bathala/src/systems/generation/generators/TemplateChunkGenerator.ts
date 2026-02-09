/**
 * TemplateChunkGenerator — boilerplate IChunkGenerator adapter.
 *
 * Wraps a framework-agnostic terrain algorithm and exposes the
 * standard IChunkGenerator interface used by OverworldGenerator.
 *
 * @module TemplateChunkGenerator
 */

import {
  IChunkGenerator,
  RawChunk,
  BorderConnection,
  SeededRandom,
} from '../../../core/types/GenerationTypes';
import { TemplateTerrainAlgorithm } from '../algorithms/TemplateTerrainAlgorithm';

export interface TemplateChunkConfig {
  readonly chunkSize?: number;
  readonly wallChance?: number;
}

const DEFAULTS: Required<TemplateChunkConfig> = {
  chunkSize: 20,
  wallChance: 0.25,
};

export class TemplateChunkGenerator implements IChunkGenerator {
  readonly name = 'template';
  readonly chunkSize: number;

  private readonly wallChance: number;

  constructor(config: TemplateChunkConfig = {}) {
    this.chunkSize = config.chunkSize ?? DEFAULTS.chunkSize;
    this.wallChance = config.wallChance ?? DEFAULTS.wallChance;
  }

  generate(_chunkX: number, _chunkY: number, rng: SeededRandom): RawChunk {
    const algorithm = new TemplateTerrainAlgorithm({
      width: this.chunkSize,
      height: this.chunkSize,
      wallChance: this.wallChance,
    });

    const intGrid = algorithm.generateLayout(() => rng.next());

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

  private findBorderConnections(grid: number[][]): BorderConnection[] {
    const size = this.chunkSize;
    const PATH = 0;
    const connections: BorderConnection[] = [];

    for (let x = 1; x < size - 1; x++) {
      if (grid[size - 1][x] === PATH) {
        connections.push({ x, y: size - 1, direction: 'north' });
        break;
      }
    }

    for (let x = 1; x < size - 1; x++) {
      if (grid[0][x] === PATH) {
        connections.push({ x, y: 0, direction: 'south' });
        break;
      }
    }

    for (let y = 1; y < size - 1; y++) {
      if (grid[y][size - 1] === PATH) {
        connections.push({ x: size - 1, y, direction: 'east' });
        break;
      }
    }

    for (let y = 1; y < size - 1; y++) {
      if (grid[y][0] === PATH) {
        connections.push({ x: 0, y, direction: 'west' });
        break;
      }
    }

    return connections;
  }
}

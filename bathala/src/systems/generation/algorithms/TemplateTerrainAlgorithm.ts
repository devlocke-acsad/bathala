/**
 * TemplateTerrainAlgorithm
 *
 * Boilerplate for new terrain algorithms. Keep this file in the repository
 * so developers can copy it when adding a new generator.
 *
 * Guidelines:
 * - No Phaser imports or game-specific types
 * - Deterministic if provided the same RNG sequence
 * - Return an IntGrid or a number[][] that can be adapted by a chunk generator
 *
 * @module TemplateTerrainAlgorithm
 */

import { IntGrid } from './IntGrid';

export interface TemplateTerrainConfig {
  readonly width: number;
  readonly height: number;
  /** Example tuning knobs — add your own */
  readonly wallChance?: number;
}

export class TemplateTerrainAlgorithm {
  private readonly config: TemplateTerrainConfig;

  constructor(config: TemplateTerrainConfig) {
    this.config = config;
  }

  /**
   * Generate a grid using an optional RNG function.
   *
   * @param rand - Optional RNG callback returning [0, 1). Use it for determinism.
   */
  generateLayout(rand?: () => number): IntGrid {
    const { width, height } = this.config;
    const grid = new IntGrid(width, height);
    const wallChance = this.config.wallChance ?? 0.25;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const roll = rand ? rand() : Math.random();
        const isWall = roll < wallChance;
        grid.setTile(x, y, isWall ? 1 : 0);
      }
    }

    return grid;
  }
}

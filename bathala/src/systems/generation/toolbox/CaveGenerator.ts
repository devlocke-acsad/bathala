/**
 * CaveGenerator — creates cave-like terrain using cellular automata.
 *
 * A reusable building block: generates organic, cave-style terrain grids.
 * Use this inside your algorithm when you want natural-looking open areas.
 *
 * How it works:
 *   1. Fill grid with random walls (based on fillProbability)
 *   2. Smooth repeatedly: cells with many wall neighbors become walls
 *   3. Clean up isolated walls and widen tight paths
 *
 * @example
 *   import { CaveGenerator } from '../../toolbox/CaveGenerator';
 *   const cave = new CaveGenerator({ fillProbability: 0.45 });
 *   const grid = cave.generate(20, 20, rng);
 *
 * @module CaveGenerator
 */

import { RNG } from '../../../core/types/GenerationTypes';

/** Configuration for the cave generator */
export interface CaveGeneratorConfig {
    /** Chance of initial wall (0–1, default 0.45) */
    readonly fillProbability?: number;
    /** Number of smoothing iterations (default 4) */
    readonly iterations?: number;
    /** Walls with fewer neighbors than this are removed (default 2) */
    readonly isolatedWallThreshold?: number;
    /** Chance to widen paths for navigability (default 0.1) */
    readonly pathWideningChance?: number;
}

/** @deprecated Use CaveGeneratorConfig */
export type CellularAutomataConfig = CaveGeneratorConfig;

const DEFAULTS: Required<CaveGeneratorConfig> = {
    fillProbability: 0.45,
    iterations: 4,
    isolatedWallThreshold: 2,
    pathWideningChance: 0.1,
};

const WALL = 1;
const PATH = 0;

export class CaveGenerator {
    private readonly config: Required<CaveGeneratorConfig>;

    constructor(config: CaveGeneratorConfig = {}) {
        this.config = { ...DEFAULTS, ...config };
    }

    /**
     * Generate a terrain grid using cellular automata.
     *
     * @param width  - Grid width
     * @param height - Grid height
     * @param rng    - Seeded RNG for determinism
     * @returns 2D grid (grid[y][x], 0 = path, 1 = wall)
     */
    generate(width: number, height: number, rng: RNG): number[][] {
        let grid = this.initGrid(width, height, rng);

        for (let i = 0; i < this.config.iterations; i++) {
            grid = this.applyRules(grid, width, height, rng);
        }

        grid = this.postProcess(grid, width, height, rng);
        return grid;
    }

    // =========================================================================
    // Internal pipeline stages
    // =========================================================================

    private initGrid(width: number, height: number, rng: RNG): number[][] {
        const grid: number[][] = [];
        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = rng.next() < this.config.fillProbability ? WALL : PATH;
            }
        }
        return grid;
    }

    private applyRules(grid: number[][], width: number, height: number, rng: RNG): number[][] {
        const next: number[][] = [];
        for (let y = 0; y < height; y++) {
            next[y] = [];
            for (let x = 0; x < width; x++) {
                const wallCount = this.countWallNeighbors(grid, x, y, width, height);
                if (wallCount >= 5) {
                    next[y][x] = WALL;
                } else if (wallCount <= 3) {
                    next[y][x] = PATH;
                } else {
                    next[y][x] = grid[y][x];
                    if (rng.next() < 0.1) next[y][x] = 1 - next[y][x];
                }
            }
        }
        return next;
    }

    private countWallNeighbors(
        grid: number[][], x: number, y: number,
        width: number, height: number,
    ): number {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                    count++;
                } else if (grid[ny][nx] === WALL) {
                    count++;
                }
            }
        }
        return count;
    }

    private postProcess(grid: number[][], width: number, height: number, rng: RNG): number[][] {
        const processed = grid.map(row => [...row]);

        // Remove isolated walls
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (processed[y][x] === WALL) {
                    const wallNeighbors = this.countWallNeighbors(processed, x, y, width, height);
                    if (wallNeighbors <= this.config.isolatedWallThreshold) {
                        processed[y][x] = PATH;
                    }
                }
            }
        }

        // Widen some paths randomly for navigability
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(rng.next() * (width - 2)) + 1;
            const y = Math.floor(rng.next() * (height - 2)) + 1;
            if (processed[y][x] === PATH) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            if (rng.next() < this.config.pathWideningChance) {
                                processed[ny][nx] = PATH;
                            }
                        }
                    }
                }
            }
        }

        return processed;
    }
}

/** @deprecated Use CaveGenerator */
export const CellularAutomataAlgorithm = CaveGenerator;

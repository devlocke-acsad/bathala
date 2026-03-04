/**
 * _TemplateAlgorithm — Copy and rename this file when creating a new terrain type.
 *
 * This is the ALGORITHM layer. It contains pure generation math with:
 *   ✅ No Phaser imports
 *   ✅ No game entity references
 *   ✅ Deterministic output via injected RNG
 *   ✅ Returns a plain number[][] grid (0 = path, 1 = wall)
 *
 * You can import building blocks from `../../components/`:
 *   import { CellularAutomataAlgorithm } from '../../components';
 *   import { RoadNetworkAlgorithm } from '../../components';
 *
 * And data structures from `../../shared/`:
 *   import { IntGrid } from '../../shared';
 *
 * IMPORTANT: Use rng.next() for ALL random decisions. NEVER use Math.random()!
 *
 * @module _TemplateAlgorithm
 */

import { RNG } from '../../../../core/types/GenerationTypes';

/** Configuration — add your tuning knobs here */
export interface _TemplateConfig {
    readonly fillChance?: number;
}

const DEFAULTS: Required<_TemplateConfig> = {
    fillChance: 0.3,
};

const WALL = 1;
const PATH = 0;

export class _TemplateAlgorithm {
    private readonly config: Required<_TemplateConfig>;

    constructor(config: _TemplateConfig = {}) {
        this.config = { ...DEFAULTS, ...config };
    }

    /**
     * Generate a raw terrain grid.
     *
     * @param width  - Grid width in tiles
     * @param height - Grid height in tiles
     * @param rng    - Seeded RNG — use rng.next() for ALL random decisions
     * @returns grid[y][x] where 0 = path, 1 = wall
     */
    generate(width: number, height: number, rng: RNG): number[][] {
        const grid: number[][] = [];

        for (let y = 0; y < height; y++) {
            grid[y] = [];
            for (let x = 0; x < width; x++) {
                grid[y][x] = rng.next() < this.config.fillChance ? WALL : PATH;
            }
        }

        // === YOUR ALGORITHM GOES HERE ===
        // Examples of what you can do:
        //   - Apply cellular automata smoothing (import from components/)
        //   - Run flood fill to ensure connectivity
        //   - Place rooms, carve tunnels, etc.
        //   - Use RoadNetworkAlgorithm to carve roads (import from components/)

        return grid;
    }
}

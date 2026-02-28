/**
 * RoadNetworkAlgorithm — generates road networks within terrain grids.
 *
 * Framework-agnostic algorithm using Bresenham's line drawing.
 * Originally in utils/MazeGeneration — moved here for modular generation.
 *
 * Algorithm:
 *   1. Generate major roads through chunk center
 *   2. Optionally add secondary roads for variant paths
 *   3. Remove isolated road segments
 *
 * @module RoadNetworkAlgorithm
 */

import { RNG } from '../../../core/types/GenerationTypes';

/** Road connection point on a grid border */
export interface RoadConnection {
    readonly x: number;
    readonly y: number;
    readonly direction: 'north' | 'south' | 'east' | 'west';
}

/** Configuration for road generation */
export interface RoadNetworkConfig {
    /** Probability of generating major roads (default 0.7) */
    readonly roadDensity?: number;
    /** Probability of secondary roads (default 0.3) */
    readonly secondaryRoadChance?: number;
    /** Width of roads in tiles (default 2) */
    readonly roadWidth?: number;
}

const DEFAULTS: Required<RoadNetworkConfig> = {
    roadDensity: 0.7,
    secondaryRoadChance: 0.3,
    roadWidth: 2,
};

const PATH = 0;

export class RoadNetworkAlgorithm {
    private readonly config: Required<RoadNetworkConfig>;

    constructor(config: RoadNetworkConfig = {}) {
        this.config = { ...DEFAULTS, ...config };
    }

    /**
     * Generate a road network on an existing terrain grid (in-place).
     *
     * @param grid   - 2D terrain grid (modified in place)
     * @param width  - Grid width
     * @param height - Grid height
     * @param rng    - Seeded RNG
     * @returns Road connection points on the grid border
     */
    generate(grid: number[][], width: number, height: number, rng: RNG): RoadConnection[] {
        const connections: RoadConnection[] = [];
        const center = Math.floor(width / 2);

        // Major horizontal road
        if (rng.next() < this.config.roadDensity) {
            const y = Math.floor(height / 2) + Math.floor(rng.next() * 3) - 1;
            this.drawRoad(grid, 0, y, width - 1, y, this.config.roadWidth, width, height);
            connections.push({ x: 0, y, direction: 'west' });
            connections.push({ x: width - 1, y, direction: 'east' });
        }

        // Major vertical road
        if (rng.next() < this.config.roadDensity) {
            const x = center + Math.floor(rng.next() * 3) - 1;
            this.drawRoad(grid, x, 0, x, height - 1, this.config.roadWidth, width, height);
            connections.push({ x, y: 0, direction: 'south' });
            connections.push({ x, y: height - 1, direction: 'north' });
        }

        // Secondary diagonal roads
        if (rng.next() < this.config.secondaryRoadChance) {
            const x0 = Math.floor(rng.next() * width);
            const y0 = Math.floor(rng.next() * height);
            const x1 = Math.floor(rng.next() * width);
            const y1 = Math.floor(rng.next() * height);
            this.drawRoad(grid, x0, y0, x1, y1, 1, width, height);
        }

        this.removeIsolatedRoads(grid, width, height);
        return connections;
    }

    // =========================================================================
    // Internal
    // =========================================================================

    private drawRoad(
        grid: number[][], x0: number, y0: number, x1: number, y1: number,
        roadWidth: number, gridWidth: number, gridHeight: number,
    ): void {
        const points = this.bresenhamLine(x0, y0, x1, y1);
        for (const [px, py] of points) {
            const halfW = Math.floor(roadWidth / 2);
            for (let dy = -halfW; dy <= halfW; dy++) {
                for (let dx = -halfW; dx <= halfW; dx++) {
                    const nx = px + dx;
                    const ny = py + dy;
                    if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                        grid[ny][nx] = PATH;
                    }
                }
            }
        }
    }

    private bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
        const points: [number, number][] = [];
        let dx = Math.abs(x1 - x0);
        let dy = -Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx + dy;

        let cx = x0;
        let cy = y0;
        while (true) {
            points.push([cx, cy]);
            if (cx === x1 && cy === y1) break;
            const e2 = 2 * err;
            if (e2 >= dy) { err += dy; cx += sx; }
            if (e2 <= dx) { err += dx; cy += sy; }
        }
        return points;
    }

    private removeIsolatedRoads(grid: number[][], width: number, height: number): void {
        const subChunkSize = Math.max(4, Math.floor(width / 5));
        for (let sy = 0; sy < height; sy += subChunkSize) {
            for (let sx = 0; sx < width; sx += subChunkSize) {
                const endX = Math.min(sx + subChunkSize, width);
                const endY = Math.min(sy + subChunkSize, height);
                let pathCount = 0;
                for (let y = sy; y < endY; y++) {
                    for (let x = sx; x < endX; x++) {
                        if (grid[y][x] === PATH) pathCount++;
                    }
                }
                // If too few paths in this sub-chunk, they're likely isolated
                if (pathCount > 0 && pathCount < 3) {
                    for (let y = sy; y < endY; y++) {
                        for (let x = sx; x < endX; x++) {
                            if (grid[y][x] === PATH) grid[y][x] = 1;
                        }
                    }
                }
            }
        }
    }
}

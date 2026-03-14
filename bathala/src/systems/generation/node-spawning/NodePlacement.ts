/**
 * NodePlacementStrategy — controls spatial placement rules for nodes.
 *
 * Encapsulates the logic for:
 *   - Finding valid positions on a terrain grid
 *   - Selecting positions with spatial distribution constraints
 *
 * This is extracted from NodePopulator so placement algorithms can be
 * swapped independently from content resolution.
 *
 * @module NodePlacementStrategy
 */

import { RNG } from '../../../core/types/GenerationTypes';

/** A 2D grid coordinate */
export interface GridPosition {
    readonly x: number;
    readonly y: number;
}

/** Configuration for placement constraints */
export interface PlacementConfig {
    /** Minimum distance from chunk edge (in tiles) */
    readonly edgeMargin: number;
    /** Minimum open neighbors required for a valid position */
    readonly minOpenNeighbors: number;
    /** Minimum distance between placed nodes (as fraction of chunkSize) */
    readonly minDistanceFactor: number;
}

const PATH = 0;

/**
 * Find all valid positions on a grid where nodes could be placed.
 *
 * A position is valid if:
 *   - It's a path tile (not a wall)
 *   - It's at least `edgeMargin` tiles from the chunk border
 *   - It has at least `minOpenNeighbors` adjacent path tiles
 *
 * @param grid       - 2D terrain grid (0 = path, 1 = wall)
 * @param gridWidth  - Width of the grid
 * @param gridHeight - Height of the grid
 * @param config     - Placement constraints
 * @returns Array of valid grid positions
 */
export function findValidPositions(
    grid: number[][],
    gridWidth: number,
    gridHeight: number,
    config: PlacementConfig,
): GridPosition[] {
    const { edgeMargin, minOpenNeighbors } = config;
    const positions: GridPosition[] = [];

    for (let y = edgeMargin; y < gridHeight - edgeMargin; y++) {
        for (let x = edgeMargin; x < gridWidth - edgeMargin; x++) {
            if (grid[y][x] !== PATH) continue;

            let openNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (grid[y + dy]?.[x + dx] === PATH) openNeighbors++;
                }
            }

            if (openNeighbors >= minOpenNeighbors) {
                positions.push({ x, y });
            }
        }
    }

    return positions;
}

/**
 * Select the best position from candidates that maximizes the minimum
 * distance to already-placed nodes. Falls back to a random pick if
 * no candidate satisfies the minimum distance constraint.
 *
 * @param candidates - Available positions
 * @param placed     - Already-placed positions
 * @param minDist    - Minimum required distance from existing nodes
 * @param rng        - Seeded RNG for fallback random selection
 * @returns Best position, or null if no candidates remain
 */
export function selectSpacedPosition(
    candidates: GridPosition[],
    placed: readonly GridPosition[],
    minDist: number,
    rng: RNG,
): GridPosition | null {
    if (candidates.length === 0) return null;

    let best: GridPosition | null = null;
    let bestMinDist = 0;

    for (const pos of candidates) {
        let nearest = Infinity;
        for (const p of placed) {
            const d = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
            nearest = Math.min(nearest, d);
        }
        if (nearest > bestMinDist && nearest >= minDist) {
            bestMinDist = nearest;
            best = pos;
        }
    }

    // Fallback: random pick
    if (!best) {
        best = candidates[Math.floor(rng.next() * candidates.length)];
    }

    return best;
}

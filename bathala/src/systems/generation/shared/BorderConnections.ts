/**
 * BorderConnectionFinder — shared utility for detecting border openings.
 *
 * Extracts the `findBorderConnections` logic that was duplicated across
 * MazeChunkGenerator, TemplateChunkGenerator, and MazeOverworldGenerator.
 *
 * Use this from any IChunkGenerator implementation to detect
 * which edges of a chunk have walkable openings for inter-chunk connectivity.
 *
 * @module BorderConnectionFinder
 */

import { BorderConnection } from '../../../core/types/GenerationTypes';

/** Configuration for how border connections are detected. */
export interface BorderConnectionConfig {
    /** Tile value that represents a walkable path (default 0) */
    readonly pathTile?: number;
    /** Whether to find only the first connection per side (default true) */
    readonly firstOnly?: boolean;
}

const DEFAULTS: Required<BorderConnectionConfig> = {
    pathTile: 0,
    firstOnly: true,
};

/**
 * Scan a grid's borders for walkable openings.
 *
 * @param grid     - 2D grid (grid[y][x])
 * @param gridSize - Dimension of the (square) grid
 * @param config   - Optional detection configuration
 * @returns Array of border connections found
 */
export function findBorderConnections(
    grid: number[][],
    gridSize: number,
    config: BorderConnectionConfig = {},
): BorderConnection[] {
    const { pathTile, firstOnly } = { ...DEFAULTS, ...config };
    const connections: BorderConnection[] = [];

    const scanBorder = (
        iterate: () => Iterable<{ x: number; y: number }>,
        direction: BorderConnection['direction'],
    ) => {
        for (const { x, y } of iterate()) {
            if (grid[y]?.[x] === pathTile) {
                connections.push({ x, y, direction });
                if (firstOnly) return;
            }
        }
    };

    // North border (y = gridSize - 1)
    scanBorder(function* () {
        for (let x = 1; x < gridSize - 1; x++) yield { x, y: gridSize - 1 };
    }, 'north');

    // South border (y = 0)
    scanBorder(function* () {
        for (let x = 1; x < gridSize - 1; x++) yield { x, y: 0 };
    }, 'south');

    // East border (x = gridSize - 1)
    scanBorder(function* () {
        for (let y = 1; y < gridSize - 1; y++) yield { x: gridSize - 1, y };
    }, 'east');

    // West border (x = 0)
    scanBorder(function* () {
        for (let y = 1; y < gridSize - 1; y++) yield { x: 0, y };
    }, 'west');

    return connections;
}

/**
 * ChunkConnectivityManager — ensures walkable connections between adjacent chunks.
 *
 * Moved from utils/MazeGeneration/ for modular generation.
 * Converted from static class to instance-based with injectable config.
 *
 * @module ChunkConnectivityManager
 */

import { RNG } from '../../../core/types/GenerationTypes';

/** Configuration for chunk connectivity */
export interface ConnectivityConfig {
    /** Chance of creating a connection on each edge (default 0.7) */
    readonly connectionProbability?: number;
    /** Width of chunk entrances in tiles (default 2) */
    readonly connectionWidth?: number;
    /** Maximum depth of inward paths from entrances (default 8) */
    readonly maxPathLength?: number;
}

const DEFAULTS: Required<ConnectivityConfig> = {
    connectionProbability: 0.7,
    connectionWidth: 2,
    maxPathLength: 8,
};

const PATH = 0;

export class ChunkConnectivityManager {
    private readonly config: Required<ConnectivityConfig>;

    constructor(config: ConnectivityConfig = {}) {
        this.config = { ...DEFAULTS, ...config };
    }

    /**
     * Ensure connectivity between adjacent chunks by carving border openings.
     *
     * @param grid      - 2D terrain grid (modified in place)
     * @param chunkX    - Chunk X coordinate (for deterministic variation)
     * @param chunkY    - Chunk Y coordinate (for deterministic variation)
     * @param chunkSize - Grid dimension
     * @param rng       - Seeded RNG
     */
    ensureConnectivity(
        grid: number[][],
        chunkX: number,
        chunkY: number,
        chunkSize: number,
        rng: RNG,
    ): void {
        const chunkPositionFactor = (chunkX + chunkY) % 2;
        const center = Math.floor(chunkSize / 2);
        const { connectionProbability, connectionWidth, maxPathLength } = this.config;

        const adjacentEdges = [
            { edge: 'north' as const, x: center, y: 0 },
            { edge: 'south' as const, x: center, y: chunkSize - 1 },
            { edge: 'east' as const, x: chunkSize - 1, y: center },
            { edge: 'west' as const, x: 0, y: center },
        ];

        for (const adj of adjacentEdges) {
            const adjustedProb = connectionProbability + (chunkPositionFactor * 0.1 - 0.05);
            const clampedProb = Math.max(0.5, Math.min(0.9, adjustedProb));

            if (rng.next() < clampedProb) {
                const halfW = Math.floor(connectionWidth / 2);
                const pathLen = Math.min(maxPathLength, Math.floor(chunkSize / 4));

                for (let i = -halfW; i <= halfW; i++) {
                    if (adj.edge === 'north' || adj.edge === 'south') {
                        const nx = adj.x + i;
                        if (nx >= 0 && nx < chunkSize) {
                            grid[adj.y][nx] = PATH;
                            for (let j = 1; j <= pathLen; j++) {
                                const ny = adj.edge === 'north' ? adj.y + j : adj.y - j;
                                if (ny >= 0 && ny < chunkSize) grid[ny][nx] = PATH;
                            }
                        }
                    } else {
                        const ny = adj.y + i;
                        if (ny >= 0 && ny < chunkSize) {
                            grid[ny][adj.x] = PATH;
                            for (let j = 1; j <= pathLen; j++) {
                                const nx = adj.edge === 'west' ? adj.x + j : adj.x - j;
                                if (nx >= 0 && nx < chunkSize) grid[ny][nx] = PATH;
                            }
                        }
                    }
                }
            }
        }
    }
}

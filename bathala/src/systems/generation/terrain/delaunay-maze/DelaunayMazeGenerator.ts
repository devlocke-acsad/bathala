/**
 * DelaunayMazeGenerator — IChunkGenerator for Delaunay triangulation corridors.
 *
 * This is the GENERATOR (adapter) for the Delaunay Maze terrain pipeline.
 * It wraps DelaunayMazeAlgorithm and exposes the standard IChunkGenerator
 * interface that OverworldGenerator expects.
 *
 * Used by: Act 1 (The Corrupted Ancestral Forests)
 *
 * Naming convention:
 *   [TerrainName]Algorithm.ts  — pure math (no game deps)
 *   [TerrainName]Generator.ts  — IChunkGenerator adapter (this file)
 *
 * @module DelaunayMazeGenerator
 */

import {
    IChunkGenerator,
    RawChunk,
    SeededRandom,
} from '../../../../core/types/GenerationTypes';
import { DelaunayMazeGenerator as DelaunayMazeAlgorithm } from './DelaunayMazeAlgorithm';
import { findBorderConnections } from '../../shared/BorderConnections';

/** Configuration knobs for the Delaunay maze terrain pipeline */
export interface DelaunayMazeConfig {
    /** Grid dimension of each chunk (square), default 20 */
    readonly chunkSize?: number;
    /** Region density multiplier — higher = denser corridors */
    readonly regionCountMultiplier?: number;
    /** Minimum distance between region seeds */
    readonly minRegionDistance?: number;
}

const DEFAULTS: Required<DelaunayMazeConfig> = {
    chunkSize: 20,
    regionCountMultiplier: 2, // regionCount = max(w,h) * multiplier
    minRegionDistance: 3,
};

export class DelaunayMazeChunkGenerator implements IChunkGenerator {
    readonly name = 'delaunay-maze';
    readonly chunkSize: number;

    private regionCountMultiplier: number;
    private minRegionDistance: number;

    constructor(config: DelaunayMazeConfig = {}) {
        this.chunkSize = config.chunkSize ?? DEFAULTS.chunkSize;
        this.regionCountMultiplier = config.regionCountMultiplier ?? DEFAULTS.regionCountMultiplier;
        this.minRegionDistance = config.minRegionDistance ?? DEFAULTS.minRegionDistance;
    }

    /**
     * Generate terrain using Delaunay triangulation + A* corridors.
     * The seeded RNG is forwarded through for deterministic output.
     */
    generate(_chunkX: number, _chunkY: number, rng: SeededRandom): RawChunk {
        const gen = new DelaunayMazeAlgorithm();
        gen.levelSize = [this.chunkSize, this.chunkSize];
        gen.regionCount = Math.max(this.chunkSize, this.chunkSize) * this.regionCountMultiplier;
        gen.minRegionDistance = this.minRegionDistance;

        const intGrid = gen.generateLayout(() => rng.next());

        // Convert IntGrid to plain number[][]
        const grid: number[][] = [];
        for (let y = 0; y < this.chunkSize; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                row.push(intGrid.getTile(x, y));
            }
            grid.push(row);
        }

        const borderConnections = findBorderConnections(grid, this.chunkSize);

        return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
    }
}

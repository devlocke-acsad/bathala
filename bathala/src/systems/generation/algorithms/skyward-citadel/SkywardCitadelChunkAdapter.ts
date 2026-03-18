/**
 * SkywardCitadelChunkAdapter — IChunkGenerator for floating cloud platforms.
 *
 * This is the CHUNK ADAPTER for the Skyward Citadel terrain pipeline.
 * It wraps SkywardCitadelAlgorithm and exposes the standard IChunkGenerator
 * interface that OverworldGenerator expects.
 *
 * Used by: Act 3 (The Skyward Citadel)
 *
 * Naming convention:
 *   [TerrainName]Algorithm.ts  — pure math (no game deps)
 *   [TerrainName]ChunkAdapter.ts  — IChunkGenerator adapter (this file)
 *
 * @module SkywardCitadelChunkAdapter
 */

import {
    IChunkGenerator,
    RawChunk,
    SeededRandom,
} from '../../../../core/types/GenerationTypes';
import { SkywardCitadelGenerator } from './SkywardCitadelAlgorithm';
import { findBorderConnections } from '../../core/BorderConnections';

/** Configuration knobs for the Skyward Citadel terrain pipeline */
export interface SkywardCitadelConfig {
    /** Grid dimension of each chunk (square), default 20 */
    readonly chunkSize?: number;
    /** Platform density multiplier — higher = more platforms */
    readonly platformCountMultiplier?: number;
    /** Minimum distance between platform centers */
    readonly minPlatformDistance?: number;
}

const DEFAULTS: Required<SkywardCitadelConfig> = {
    chunkSize: 20,
    platformCountMultiplier: 0.6, // platformCount = chunkSize * multiplier
    minPlatformDistance: 6,
};

export class SkywardCitadelChunkAdapter implements IChunkGenerator {
    readonly name = 'skyward-citadel';
    readonly chunkSize: number;

    private platformCountMultiplier: number;
    private minPlatformDistance: number;

    constructor(config: SkywardCitadelConfig = {}) {
        this.chunkSize = config.chunkSize ?? DEFAULTS.chunkSize;
        this.platformCountMultiplier = config.platformCountMultiplier ?? DEFAULTS.platformCountMultiplier;
        this.minPlatformDistance = config.minPlatformDistance ?? DEFAULTS.minPlatformDistance;
    }

    /**
     * Generate floating platform terrain using cloud bridges.
     * The seeded RNG is forwarded through for deterministic output.
     */
    generate(_chunkX: number, _chunkY: number, rng: SeededRandom): RawChunk {
        const gen = new SkywardCitadelGenerator();
        gen.levelSize = [this.chunkSize, this.chunkSize];
        gen.platformCount = Math.floor(this.chunkSize * this.platformCountMultiplier);
        gen.minPlatformDistance = this.minPlatformDistance;

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

/** @deprecated Use `SkywardCitadelChunkAdapter` instead. */
export const SkywardCitadelChunkGenerator = SkywardCitadelChunkAdapter;

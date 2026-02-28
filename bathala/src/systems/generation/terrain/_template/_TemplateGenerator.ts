/**
 * _TemplateGenerator — Copy and rename this file when creating a new terrain type.
 *
 * This is the GENERATOR layer (IChunkGenerator adapter). It:
 *   1. Creates an instance of your Algorithm
 *   2. Calls it with the seeded RNG
 *   3. Converts the output to a RawChunk with border connections
 *   4. Returns the RawChunk to OverworldGenerator
 *
 * Naming convention:
 *   [TerrainName]Algorithm.ts  — pure math (companion file)
 *   [TerrainName]Generator.ts  — this adapter
 *
 * After creating both files:
 *   1. Export your generator from `terrain/index.ts`
 *   2. Return it from your ActDefinition.createGenerator()
 *
 * @module _TemplateGenerator
 */

import {
    IChunkGenerator,
    RawChunk,
    SeededRandom,
} from '../../../../core/types/GenerationTypes';
import { _TemplateAlgorithm } from './_TemplateAlgorithm';
import { findBorderConnections } from '../../shared/BorderConnections';

export interface _TemplateChunkConfig {
    readonly chunkSize?: number;
    readonly fillChance?: number;
}

const DEFAULTS: Required<_TemplateChunkConfig> = {
    chunkSize: 20,
    fillChance: 0.3,
};

export class _TemplateChunkGenerator implements IChunkGenerator {
    readonly name = '_template'; // ← Change this to your terrain name
    readonly chunkSize: number;

    private readonly fillChance: number;

    constructor(config: _TemplateChunkConfig = {}) {
        this.chunkSize = config.chunkSize ?? DEFAULTS.chunkSize;
        this.fillChance = config.fillChance ?? DEFAULTS.fillChance;
    }

    /**
     * Called by OverworldGenerator for each chunk.
     * Forward the rng to your algorithm for deterministic output.
     */
    generate(_chunkX: number, _chunkY: number, rng: SeededRandom): RawChunk {
        // 1. Create algorithm with config
        const algorithm = new _TemplateAlgorithm({
            fillChance: this.fillChance,
        });

        // 2. Generate the raw terrain grid
        const grid = algorithm.generate(this.chunkSize, this.chunkSize, rng);

        // 3. Find border openings for inter-chunk connectivity
        const borderConnections = findBorderConnections(grid, this.chunkSize);

        // 4. Return the standard RawChunk format
        return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
    }
}

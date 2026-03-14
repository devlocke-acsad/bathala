/**
 * Toolbox — reusable building blocks for terrain algorithms.
 *
 * 🔧  Use these inside your algorithm to avoid reinventing common patterns.
 *
 * What's here:
 *   IntGrid       — 2D integer grid (0 = path, 1 = wall)
 *   SeededRNG     — Deterministic random number generator
 *   CaveGenerator — Creates cave-like terrain (cellular automata under the hood)
 *   RoadCarver    — Carves road corridors (Bresenham's line drawing)
 *
 * @module toolbox
 */

// Data structures
export { IntGrid } from './IntGrid';

// Random number generation
export { createSeededRNG, chunkSeed } from './SeededRNG';

// Building blocks
export { CaveGenerator, CellularAutomataAlgorithm } from './CaveGenerator';
export type { CaveGeneratorConfig, CellularAutomataConfig } from './CaveGenerator';

export { RoadCarver, RoadNetworkAlgorithm } from './RoadCarver';
export type { RoadCarverConfig, RoadNetworkConfig, RoadConnection } from './RoadCarver';

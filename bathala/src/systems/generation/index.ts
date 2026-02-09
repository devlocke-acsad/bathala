/**
 * Generation Module — world generation pipeline for Bathala.
 *
 * Import everything from here instead of individual files:
 *   import { OverworldGenerator, MazeChunkGenerator, createSeededRNG } from '../../systems/generation';
 *
 * Architecture:
 *   OverworldGenerator (orchestrator + LRU cache)
 *     ├── IChunkGenerator.generate()  → RawChunk (terrain grid)
 *     └── NodePopulator.populate()    → MapNode[] (interactive nodes)
 *
 * To add a new terrain type:
 *   1. Create algorithm in  algorithms/   (raw generation logic, no game deps)
 *   2. Create generator in  generators/   (IChunkGenerator adapter)
 *   3. Return it from your  ActDefinition.createGenerator()
 *
 * @module generation
 */

// === Orchestration ===
export { OverworldGenerator } from './OverworldGenerator';
export { NodePopulator } from './NodePopulator';

// === Seeded RNG ===
export { createSeededRNG, chunkSeed } from './SeededRNG';

// === Chunk generators (one per terrain style) ===
export { MazeChunkGenerator, TemplateChunkGenerator } from './generators';
export type { MazeChunkConfig, TemplateChunkConfig } from './generators';

// === Raw algorithms (framework-agnostic) ===
export { IntGrid, DelaunayMazeGenerator, TemplateTerrainAlgorithm } from './algorithms';

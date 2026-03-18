/**
 * Algorithms — one subfolder per level's terrain generation strategy.
 *
 * 🎯  NEW DEV? Start here: copy `_start-here/` to create a new level algorithm.
 *
 * Each subfolder contains exactly two files:
 *   [Name]Algorithm.ts  — pure math (no Phaser, no game entities)
 *   [Name]ChunkAdapter.ts  — adapter that plugs the algorithm into the pipeline
 *
 * @module algorithms
 */

// === Delaunay Maze (Act 1: The Corrupted Ancestral Forests) ===
export {
	DelaunayMazeChunkAdapter,
	DelaunayMazeChunkGenerator, // deprecated alias
} from './delaunay-maze/DelaunayMazeChunkAdapter';
export type { DelaunayMazeConfig } from './delaunay-maze/DelaunayMazeChunkAdapter';
export { DelaunayMazeGenerator as DelaunayMazeAlgorithm, Point, Edge, PathNode } from './delaunay-maze/DelaunayMazeAlgorithm';

// === Submerged Village (Act 2: The Submerged Barangays) ===
export { SubmergedVillageChunkAdapter, VillageChunkType } from './submerged-village/SubmergedVillageChunkAdapter';
export type { SubmergedVillageConfig } from './submerged-village/SubmergedVillageChunkAdapter';
export { SubmergedVillageAlgorithm, TILE as VILLAGE_TILE, DEFAULT_VILLAGE_PARAMS } from './submerged-village/SubmergedVillageAlgorithm';
export type { PlacedHouse, VillageLayoutParams } from './submerged-village/SubmergedVillageAlgorithm';

// === Skyward Citadel (Act 3: The Skyward Citadel) ===
export {
	SkywardCitadelChunkAdapter,
	SkywardCitadelChunkGenerator, // deprecated alias
} from './skyward-citadel/SkywardCitadelChunkAdapter';
export type { SkywardCitadelConfig } from './skyward-citadel/SkywardCitadelChunkAdapter';
export { SkywardCitadelGenerator as SkywardCitadelAlgorithm } from './skyward-citadel/SkywardCitadelAlgorithm';

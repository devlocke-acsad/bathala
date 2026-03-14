/**
 * Generation Module — world generation pipeline for Bathala.
 *
 * Import everything from here:
 *   import { OverworldGenerator, DelaunayMazeChunkAdapter, createSeededRNG } from '../systems/generation';
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Directory Guide (for new developers)                              │
 * │                                                                     │
 * │  algorithms/     🎯 START HERE — one folder per level algorithm    │
 * │    ├── _start-here/   Copy this to create a new level              │
 * │    └── delaunay-maze/ Act 1's algorithm (reference example)        │
 * │                                                                     │
 * │  toolbox/        🔧 Reusable building blocks for ANY algorithm     │
 * │    ├── IntGrid.ts     2D grid data structure                       │
 * │    ├── SeededRNG.ts   Deterministic random numbers                 │
 * │    ├── CaveGenerator  Cave-like terrain (cellular automata)        │
 * │    └── RoadCarver     Road corridors (Bresenham's line)            │
 * │                                                                     │
 * │  node-spawning/  📍 What interactive things appear on maps         │
 * │    ├── NodePopulator  Orchestrator: where + what to place          │
 * │    ├── NodePlacement  Pure functions: finding valid spots           │
 * │    └── resolvers/     What entity each node type becomes           │
 * │                                                                     │
 * │  core/           ⚙️  Pipeline infrastructure (rarely touched)      │
 * │    ├── OverworldGenerator  Main coordinator + cache                │
 * │    ├── ChunkCache         LRU cache for generated chunks           │
 * │    ├── BorderConnections  Walkable openings at chunk edges         │
 * │    └── ChunkConnectivity  Connections between chunks               │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @module generation
 */

// === Core (pipeline infrastructure) ===
export { OverworldGenerator } from './core';
export type { OverworldGeneratorConfig } from './core';
export { ChunkCache } from './core';
export type { CachedChunk, ChunkCacheConfig } from './core';
export { findBorderConnections } from './core';
export type { BorderConnectionConfig } from './core';
export { ChunkConnectivityManager } from './core';
export type { ConnectivityConfig } from './core';

// === Algorithms (terrain generation strategies) ===
export {
	DelaunayMazeChunkAdapter,
	DelaunayMazeChunkGenerator, // deprecated alias
	DelaunayMazeAlgorithm,
} from './algorithms';
export type { DelaunayMazeConfig } from './algorithms';
export { SubmergedVillageChunkAdapter, SubmergedVillageAlgorithm, VILLAGE_TILE, VillageChunkType, DEFAULT_VILLAGE_PARAMS } from './algorithms';
export type { SubmergedVillageConfig, VillageLayoutParams } from './algorithms';

// === Toolbox (reusable building blocks) ===
export { CaveGenerator, CellularAutomataAlgorithm } from './toolbox';
export type { CaveGeneratorConfig, CellularAutomataConfig } from './toolbox';
export { RoadCarver, RoadNetworkAlgorithm } from './toolbox';
export type { RoadCarverConfig, RoadNetworkConfig } from './toolbox';
export { IntGrid, createSeededRNG, chunkSeed } from './toolbox';

// === Node Spawning (map content placement) ===
export { NodePopulator } from './node-spawning';
export type { NodePopulatorConfig, GridPosition, PlacementConfig } from './node-spawning';
export type { INodeResolver, NodeResolution } from './node-spawning';
export { EnemyNodeResolver, EventNodeResolver, DefaultNodeResolver } from './node-spawning';
export { findValidPositions, selectSpacedPosition } from './node-spawning';

// === MazeGenSystem (Phaser scene bridge — rendering + AI) ===
export { MazeGenSystem } from './MazeGenSystem';

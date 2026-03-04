/**
 * Generation Module — world generation pipeline for Bathala.
 *
 * Import everything from here:
 *   import { OverworldGenerator, DelaunayMazeChunkGenerator, createSeededRNG } from '../systems/generation';
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Architecture                                                      │
 * │                                                                     │
 * │  OverworldGenerator (orchestrator + LRU cache)                      │
 * │    ├── IChunkGenerator.generate()  → RawChunk (terrain grid)       │
 * │    │     └── terrain/[name]/[Name]Generator.ts  (adapter)          │
 * │    │           └── terrain/[name]/[Name]Algorithm.ts  (math)       │
 * │    │                 └── components/  (reusable building blocks)   │
 * │    └── NodePopulator.populate()    → MapNode[] (interactive nodes) │
 * │          └── INodeResolver         → entity resolution             │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Module Structure:
 *   terrain/        — Complete terrain pipelines (one subfolder per type)
 *   components/     — Reusable algorithmic building blocks
 *   shared/         — Data structures & utility functions
 *   population/     — Node placement + content resolution
 *   connectivity/   — Chunk-to-chunk connectivity
 *   orchestration/  — High-level coordinators + cache
 *
 * @module generation
 */

// === Orchestration ===
export { OverworldGenerator } from './orchestration';
export type { OverworldGeneratorConfig } from './orchestration';
export { ChunkCache } from './orchestration';
export type { CachedChunk, ChunkCacheConfig } from './orchestration';

// === Terrain Pipelines ===
export { DelaunayMazeChunkGenerator, DelaunayMazeAlgorithm } from './terrain';
export type { DelaunayMazeConfig } from './terrain';

// === Reusable Components ===
export { CellularAutomataAlgorithm, RoadNetworkAlgorithm } from './components';
export type { CellularAutomataConfig, RoadNetworkConfig } from './components';

// === Shared Utilities ===
export { IntGrid, findBorderConnections, createSeededRNG, chunkSeed } from './shared';
export type { BorderConnectionConfig } from './shared';

// === Node Population ===
export { NodePopulator } from './population';
export type { NodePopulatorConfig, GridPosition, PlacementConfig } from './population';
export type { INodeResolver, NodeResolution } from './population';
export { EnemyNodeResolver, EventNodeResolver, DefaultNodeResolver } from './population';
export { findValidPositions, selectSpacedPosition } from './population';

// === Connectivity ===
export { ChunkConnectivityManager } from './connectivity';
export type { ConnectivityConfig } from './connectivity';

// === MazeGenSystem (rendering + AI — to be decomposed in Phase 2) ===
export { MazeGenSystem } from './MazeGenSystem';

/**
 * Terrain — complete terrain generation pipelines.
 *
 * Each subfolder here IS one terrain type. It contains exactly:
 *   [Name]Algorithm.ts  — pure math, no game deps, deterministic with RNG
 *   [Name]Generator.ts  — IChunkGenerator adapter (connects to OverworldGenerator)
 *
 * To create a new terrain type:
 *   1. Copy `_template/` into a new folder (e.g., `archipelago/`)
 *   2. Rename files and classes following the naming convention
 *   3. Wire it into your ActDefinition.createGenerator()
 *
 * Naming convention:
 *   Folder:    kebab-case (e.g., `delaunay-maze`, `sky-island`)
 *   Algorithm: PascalCase + "Algorithm" suffix (e.g., `SkyIslandAlgorithm.ts`)
 *   Generator: PascalCase + "Generator" suffix (e.g., `SkyIslandGenerator.ts`)
 *
 * @module terrain
 */

// === Delaunay Maze (Act 1: The Corrupted Ancestral Forests) ===
export { DelaunayMazeChunkGenerator } from './delaunay-maze/DelaunayMazeGenerator';
export type { DelaunayMazeConfig } from './delaunay-maze/DelaunayMazeGenerator';
export { DelaunayMazeGenerator as DelaunayMazeAlgorithm, Point, Edge, PathNode } from './delaunay-maze/DelaunayMazeAlgorithm';

// Future terrain types:
// export { ArchipelagoChunkGenerator } from './archipelago/ArchipelagoGenerator';
// export { SkyIslandChunkGenerator } from './sky-island/SkyIslandGenerator';

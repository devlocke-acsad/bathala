/**
 * Generation Algorithms — low-level maze/terrain generation primitives.
 * 
 * These are framework-agnostic algorithms that produce grids.
 * They know nothing about Phaser, acts, or game-specific types.
 * 
 * @module algorithms
 */

export { IntGrid } from './IntGrid';
export { DelaunayMazeGenerator, Point, Edge, PathNode } from './DelaunayMazeGenerator';
export { TemplateTerrainAlgorithm } from './TemplateTerrainAlgorithm';

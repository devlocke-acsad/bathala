/**
 * Shared — data structures and utility functions used across all generation modules.
 *
 * Contains:
 *   - IntGrid: 2D integer grid abstraction (0 = path, 1 = wall)
 *   - BorderConnections: finds chunk-edge openings for inter-chunk connectivity
 *   - SeededRNG: Mulberry32 PRNG + chunk-coordinate hashing
 *
 * @module shared
 */

export { IntGrid } from './IntGrid';
export { findBorderConnections } from './BorderConnections';
export type { BorderConnectionConfig } from './BorderConnections';
export { createSeededRNG, chunkSeed } from './SeededRNG';

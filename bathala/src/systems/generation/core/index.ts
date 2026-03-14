/**
 * Core — pipeline infrastructure that coordinates generation.
 *
 * ⚙️  You rarely need to modify these files. They handle:
 *   - OverworldGenerator: the main coordinator (composes algorithm + node spawning + cache)
 *   - ChunkCache: LRU cache for already-generated chunks
 *   - BorderConnections: finding walkable openings at chunk edges
 *   - ChunkConnectivity: carving connections between neighboring chunks
 *
 * @module core
 */

export { OverworldGenerator } from './OverworldGenerator';
export type { OverworldGeneratorConfig } from './OverworldGenerator';
export { ChunkCache } from './ChunkCache';
export type { CachedChunk, ChunkCacheConfig } from './ChunkCache';
export { findBorderConnections } from './BorderConnections';
export type { BorderConnectionConfig } from './BorderConnections';
export { ChunkConnectivityManager } from './ChunkConnectivity';
export type { ConnectivityConfig } from './ChunkConnectivity';

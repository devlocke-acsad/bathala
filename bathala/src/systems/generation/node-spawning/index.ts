/**
 * Node Spawning — controls what interactive things appear on generated maps.
 *
 * 📍  Two concerns:
 *   1. WHERE to place nodes (NodePlacement.ts — spatial algorithms)
 *   2. WHAT each node becomes (resolvers/ — entity resolution)
 *
 * NodePopulator orchestrates both. You rarely need to touch this
 * unless you're changing how nodes are distributed.
 *
 * @module node-spawning
 */

export { NodePopulator } from './NodePopulator';
export type { NodePopulatorConfig } from './NodePopulator';

export {
    findValidPositions,
    selectSpacedPosition,
} from './NodePlacement';
export type {
    GridPosition,
    PlacementConfig,
} from './NodePlacement';

export type { INodeResolver, NodeResolution } from './resolvers/INodeResolver';
export { EnemyNodeResolver } from './resolvers/EnemyNodeResolver';
export { EventNodeResolver } from './resolvers/EventNodeResolver';
export { DefaultNodeResolver } from './resolvers/DefaultNodeResolver';

/**
 * Node Population Module — modular node placement and content resolution.
 *
 * Architecture:
 *   NodePopulator (orchestrator)
 *     ├── NodePlacementStrategy (where to place)
 *     └── INodeResolver (what to place)
 *         ├── EnemyNodeResolver     (combat / elite)
 *         ├── EventNodeResolver     (events)
 *         └── DefaultNodeResolver   (shop / campfire / treasure)
 *
 * @module population
 */

export { NodePopulator } from './NodePopulator';
export type { NodePopulatorConfig } from './NodePopulator';

export {
    findValidPositions,
    selectSpacedPosition,
} from './NodePlacementStrategy';
export type {
    GridPosition,
    PlacementConfig,
} from './NodePlacementStrategy';

export type { INodeResolver, NodeResolution } from './strategies/INodeResolver';
export { EnemyNodeResolver } from './strategies/EnemyNodeResolver';
export { EventNodeResolver } from './strategies/EventNodeResolver';
export { DefaultNodeResolver } from './strategies/DefaultNodeResolver';

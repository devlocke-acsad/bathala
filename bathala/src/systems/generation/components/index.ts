/**
 * Components — reusable algorithmic building blocks.
 *
 * These are NOT complete terrain pipelines. They are sub-algorithms
 * you can COMPOSE inside a terrain pipeline to add specific behavior
 * (e.g., cave noise, road carving).
 *
 * Naming convention: [Technique].ts — PascalCase, no "Algorithm" suffix.
 *
 * Example usage inside a terrain pipeline:
 *   import { CellularAutomataAlgorithm } from '../../components';
 *   const ca = new CellularAutomataAlgorithm({ fillProbability: 0.4 });
 *   const noiseGrid = ca.generate(width, height, rng);
 *   // ... merge noiseGrid into your main terrain grid
 *
 * @module components
 */

export { CellularAutomataAlgorithm } from './CellularAutomata';
export type { CellularAutomataConfig } from './CellularAutomata';

export { RoadNetworkAlgorithm } from './RoadNetwork';
export type { RoadNetworkConfig, RoadConnection } from './RoadNetwork';

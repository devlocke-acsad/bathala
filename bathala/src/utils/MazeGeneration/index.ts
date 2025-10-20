/*
  MazeGeneration Index
  --------------------
  Main entry point for all maze generation utilities.
  
  This module provides a unified interface for maze generation with support for
  multiple generation algorithms through the MazeGeneratorRegistry.
  
  Exports:
    - Core Interface: IMazeGenerator, MazeGeneratorConfig
    - Registry: MazeGeneratorRegistry, initializeMazeGenerators
    - Generators: DelaunayMazeGeneratorAdapter, CellularAutomataMazeGeneratorAdapter
    - Types: ChunkData, SeededRandom, ChunkCoordinates, RoadConnection, ChunkRegion
    - Utilities: RandomUtil, ChunkManager, IntGrid
    - Specialized: RoadNetworkGenerator, ChunkConnectivityManager, NodeGenerator
*/

// Core interfaces and types
export type { IMazeGenerator, MazeGeneratorConfig } from "./IMazeGenerator";
export type { ChunkData, SeededRandom, ChunkCoordinates, RoadConnection, ChunkRegion } from "./Core/types";

// Registry and initialization
export { MazeGeneratorRegistry } from "./MazeGeneratorRegistry";
export { initializeMazeGenerators, getGeneratorInfo } from "./MazeGeneratorInitializer";

// Generator adapters
export { DelaunayMazeGeneratorAdapter } from "./DelaunayGeneration/DelaunayMazeGeneratorAdapter";
export { CellularAutomataMazeGeneratorAdapter } from "./CellularAutomataGeneration/CellularAutomataMazeGeneratorAdapter";

// Core utilities
export { RandomUtil } from "./Core/RandomUtil";
export { IntGrid } from "./Core/IntGrid";

// Shared utilities (used by MazeOverworldGenerator)
export { ChunkManager } from "./Shared/ChunkManager";
export { NodeGenerator } from "./Shared/NodeGenerator";

// Legacy exports (for backward compatibility)
export { CellularAutomataMazeGenerator } from "./CellularAutomataGeneration/CellularAutomataMazeGenerator";
export { DelaunayMazeGenerator } from "./DelaunayGeneration/DelaunayMazeGenerator";

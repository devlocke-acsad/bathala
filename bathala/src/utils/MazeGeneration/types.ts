import { MapNode } from "../../core/types/MapTypes";

export interface ChunkData {
  maze: number[][];
  nodes: MapNode[];
  roadConnections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[];
}

export interface SeededRandom {
  seed: number;
  next(): number;
}

export interface ChunkCoordinates {
  x: number;
  y: number;
}

export interface RoadConnection {
  x: number;
  y: number;
  direction: 'north' | 'south' | 'east' | 'west';
}

export interface ChunkRegion {
  startChunkX: number;
  startChunkY: number;
  widthInChunks: number;
  heightInChunks: number;
}

/** Grid coordinate tuple [x, y]. */
export type Pos = [number, number];

/**
 * Context for the dead-end analyzer to operate without duplicating game-specific logic.
 *
 * PATH_TILE / REGION_TILE: tile ID values used in the IntGrid
 * levelSize: [width, height]
 * inBounds: returns true if position lies inside the grid bounds
 * getNeighbors: returns 4-connected neighbors in any order
 * wouldCreateDoubleWideAt: returns true if placing PATH at pos would form a 2x2 block
 */
export interface AnalyzerContext {
  PATH_TILE: number;
  REGION_TILE: number;
  levelSize: [number, number];
  inBounds(pos: Pos): boolean;
  getNeighbors(pos: Pos): Pos[];
  wouldCreateDoubleWideAt(pos: Pos, intGrid: any): boolean;
}

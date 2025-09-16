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

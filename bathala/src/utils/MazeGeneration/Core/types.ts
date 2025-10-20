import { MapNode } from "../../core/types/MapTypes";

/**
 * ChunkData
 * ---------
 * Represents the data for a single chunk in the overworld.
 * 
 * Properties:
 * - maze: 2D array representing the maze layout (0 = path, 1 = wall)
 * - nodes: Array of MapNode objects placed in this chunk
 * - roadConnections: Array of connection points for chunk connectivity
 */
export interface ChunkData {
  maze: number[][];
  nodes: MapNode[];
  roadConnections: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[];
}

/**
 * SeededRandom
 * ------------
 * Interface for a seeded random number generator.
 * 
 * Methods:
 * - next(): Returns a random number between 0 and 1
 */
export interface SeededRandom {
  seed: number;
  next(): number;
}

/**
 * ChunkCoordinates
 * ----------------
 * Represents the coordinates of a chunk in the overworld.
 */
export interface ChunkCoordinates {
  x: number;
  y: number;
}

/**
 * RoadConnection
 * --------------
 * Represents a connection point for road networks.
 * 
 * Properties:
 * - x, y: Position of the connection point
 * - direction: Direction of the connection (north, south, east, west)
 */
export interface RoadConnection {
  x: number;
  y: number;
  direction: 'north' | 'south' | 'east' | 'west';
}

/**
 * ChunkRegion
 * -----------
 * Represents a rectangular region of chunks in the overworld.
 * 
 * Properties:
 * - startChunkX, startChunkY: Coordinates of the starting chunk
 * - widthInChunks, heightInChunks: Size of the region in chunks
 */
export interface ChunkRegion {
  startChunkX: number;
  startChunkY: number;
  widthInChunks: number;
  heightInChunks: number;
}

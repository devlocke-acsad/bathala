/**
 * World Generator Interface for Bathala
 * Defines the contract for procedural world generation strategies
 * 
 * @module IWorldGenerator
 * @description Enables different generation methods per Act using Strategy Pattern
 * 
 * Design Pattern: Strategy
 * - Allows interchangeable generation algorithms
 * - Act 1 uses MazeGenerator (current)
 * - Act 2 could use ArchipelagoGenerator (future)
 * - Act 3 could use SkyIslandsGenerator (future)
 * 
 * @see ActTypes.GeneratorType for available generator types
 */

import { MapNode } from './MapTypes';

/**
 * Decoration element for visual variety
 * Non-interactive visual elements placed in the world
 * 
 * @interface Decoration
 */
export interface Decoration {
  /** Sprite key for the decoration */
  readonly spriteKey: string;
  /** World X position */
  readonly x: number;
  /** World Y position */
  readonly y: number;
  /** Optional depth/z-index for layering */
  readonly depth?: number;
  /** Optional scale factor */
  readonly scale?: number;
  /** Optional tint color */
  readonly tint?: number;
}

/**
 * Data returned for a generated chunk
 * Contains all information needed to render and interact with a map section
 * 
 * @interface ChunkData
 * @example
 * const chunk = generator.generateChunk(0, 0);
 * // chunk.tiles: 2D array of tile type indices
 * // chunk.walkable: 2D array of walkability flags
 * // chunk.nodes: Interactive elements (shops, enemies, etc.)
 * // chunk.decorations: Visual decorations
 */
export interface ChunkData {
  /** 2D array of tile type indices */
  readonly tiles: readonly (readonly number[])[];
  
  /** 2D array of walkability flags (true = can walk) */
  readonly walkable: readonly (readonly boolean[])[];
  
  /** Interactive nodes in this chunk (NPCs, shops, etc.) */
  readonly nodes: readonly MapNode[];
  
  /** Visual decorations (non-interactive) */
  readonly decorations: readonly Decoration[];
  
  /** Chunk coordinates */
  readonly chunkX: number;
  readonly chunkY: number;
}

/**
 * World bounds definition
 * Defines the playable area limits
 * 
 * @interface WorldBounds
 */
export interface WorldBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/**
 * World Generator Interface
 * Contract that all world generation strategies must implement
 * 
 * Follows the Strategy Pattern to allow different generation algorithms
 * per act while maintaining a consistent interface.
 * 
 * @interface IWorldGenerator
 * @example
 * // Creating and using a generator
 * class MazeGenerator implements IWorldGenerator {
 *   initialize(config: Record<string, unknown>): void {
 *     this.chunkSize = config.chunkSize ?? 32;
 *   }
 *   // ... implement other methods
 * }
 * 
 * const generator: IWorldGenerator = new MazeGenerator();
 * generator.initialize({ chunkSize: 32, pathWidth: 1 });
 * const chunk = generator.generateChunk(0, 0);
 */
export interface IWorldGenerator {
  /**
   * Initialize the generator with act-specific configuration
   * Called once when an act begins
   * 
   * @param config - Generator-specific configuration options
   * @example
   * generator.initialize({
   *   chunkSize: 32,
   *   pathWidth: 1,
   *   roomChance: 0.15,
   *   seed: 12345
   * });
   */
  initialize(config: Record<string, unknown>): void;

  /**
   * Generate a chunk of the world at the given coordinates
   * Chunks should be deterministic for the same seed
   * 
   * @param chunkX - Chunk X coordinate
   * @param chunkY - Chunk Y coordinate
   * @returns Generated chunk data including tiles, walkability, and nodes
   */
  generateChunk(chunkX: number, chunkY: number): ChunkData;

  /**
   * Get valid spawn position for the player
   * Should return a walkable position, typically near the chunk origin
   * 
   * @returns World coordinates for player spawn
   */
  getPlayerSpawnPosition(): { x: number; y: number };

  /**
   * Check if a world position is walkable
   * Used for movement validation and pathfinding
   * 
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @returns true if the position can be walked on
   */
  isWalkable(worldX: number, worldY: number): boolean;

  /**
   * Get interactive nodes within a range of a position
   * Used for nearby interactions and enemy spawning
   * 
   * @param x - Center X coordinate
   * @param y - Center Y coordinate
   * @param range - Search radius in tiles
   * @returns Array of nodes within range
   */
  getNodesInRange(x: number, y: number, range: number): MapNode[];

  /**
   * Get all nodes in a specific chunk
   * 
   * @param chunkX - Chunk X coordinate
   * @param chunkY - Chunk Y coordinate
   * @returns Array of nodes in the chunk
   */
  getNodesInChunk(chunkX: number, chunkY: number): MapNode[];

  /**
   * Get the world bounds
   * Returns the playable area limits
   * 
   * @returns World bounds object
   */
  getWorldBounds(): WorldBounds;

  /**
   * Clear cached chunk data
   * Called when switching acts or resetting the game
   */
  clearCache(): void;

  /**
   * Cleanup resources when generator is no longer needed
   * Called on act completion or game over
   */
  dispose(): void;

  /**
   * Optional: Get the seed used for generation
   * Useful for debugging and save/load functionality
   * 
   * @returns The random seed, or undefined if not seeded
   */
  getSeed?(): number | undefined;

  /**
   * Optional: Set a specific seed for reproducible generation
   * 
   * @param seed - The random seed to use
   */
  setSeed?(seed: number): void;
}

/**
 * Type guard to check if an object implements IWorldGenerator
 * 
 * @param obj - Object to check
 * @returns true if obj implements IWorldGenerator
 */
export function isWorldGenerator(obj: unknown): obj is IWorldGenerator {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const generator = obj as IWorldGenerator;
  return (
    typeof generator.initialize === 'function' &&
    typeof generator.generateChunk === 'function' &&
    typeof generator.getPlayerSpawnPosition === 'function' &&
    typeof generator.isWalkable === 'function' &&
    typeof generator.getNodesInRange === 'function' &&
    typeof generator.clearCache === 'function' &&
    typeof generator.dispose === 'function'
  );
}

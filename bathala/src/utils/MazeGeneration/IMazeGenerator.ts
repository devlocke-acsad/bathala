/**
 * IMazeGenerator
 * --------------
 * Base interface for all maze generation algorithms.
 * 
 * This interface ensures all generators provide a consistent API
 * for the MazeOverworldGenerator to use seamlessly.
 */

import { IntGrid } from './Core/IntGrid';

export interface IMazeGenerator {
  /**
   * Unique identifier for this generator type
   */
  readonly type: string;

  /**
   * Human-readable name for this generator
   */
  readonly name: string;

  /**
   * Generate a maze layout
   * @param width - Width of the maze
   * @param height - Height of the maze
   * @param seed - Seed for deterministic generation
   * @returns IntGrid representing the maze (0 = path, 1 = wall)
   */
  generateLayout(width: number, height: number, seed: number): IntGrid;

  /**
   * Configure generator-specific parameters
   * @param config - Configuration object specific to this generator
   */
  configure?(config: Record<string, any>): void;

  /**
   * Get default configuration for this generator
   */
  getDefaultConfig?(): Record<string, any>;
}

/**
 * MazeGeneratorConfig
 * -------------------
 * Configuration object for maze generation
 */
export interface MazeGeneratorConfig {
  /** Generator type to use */
  generatorType: string;
  
  /** Size of the level */
  levelSize: [number, number];
  
  /** Seed for deterministic generation */
  seed: number;
  
  /** Generator-specific parameters */
  params?: Record<string, any>;
}

/**
 * MazeGeneratorRegistry
 * ---------------------
 * Central registry for all maze generation algorithms.
 * 
 * This class manages the registration and retrieval of maze generators,
 * allowing seamless switching between different generation strategies.
 * 
 * Usage:
 * ```typescript
 * // Register generators
 * MazeGeneratorRegistry.register(new DelaunayMazeGeneratorAdapter());
 * MazeGeneratorRegistry.register(new CellularAutomataMazeGeneratorAdapter());
 * 
 * // Get a generator
 * const generator = MazeGeneratorRegistry.getGenerator('delaunay');
 * 
 * // Generate maze
 * const maze = generator.generateLayout(50, 50, 12345);
 * ```
 */

import { IMazeGenerator, MazeGeneratorConfig } from './IMazeGenerator';
import { IntGrid } from './Core/IntGrid';

export class MazeGeneratorRegistry {
  private static generators: Map<string, IMazeGenerator> = new Map();
  private static defaultGeneratorType: string = 'delaunay';

  /**
   * Register a maze generator
   */
  static register(generator: IMazeGenerator): void {
    this.generators.set(generator.type, generator);
    console.log(`✓ Registered maze generator: ${generator.name} (${generator.type})`);
  }

  /**
   * Get a generator by type
   */
  static getGenerator(type: string): IMazeGenerator {
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(
        `Generator type '${type}' not found. Available types: ${Array.from(this.generators.keys()).join(', ')}`
      );
    }
    return generator;
  }

  /**
   * Get the default generator
   */
  static getDefaultGenerator(): IMazeGenerator {
    return this.getGenerator(this.defaultGeneratorType);
  }

  /**
   * Set the default generator type
   */
  static setDefaultGeneratorType(type: string): void {
    if (!this.generators.has(type)) {
      throw new Error(
        `Cannot set default generator to '${type}' - not registered. Available types: ${Array.from(this.generators.keys()).join(', ')}`
      );
    }
    this.defaultGeneratorType = type;
    console.log(`✓ Default generator set to: ${type}`);
  }

  /**
   * Get all registered generator types
   */
  static getAvailableTypes(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Get information about all registered generators
   */
  static getGeneratorInfo(): Array<{ type: string; name: string; config: Record<string, any> }> {
    const info: Array<{ type: string; name: string; config: Record<string, any> }> = [];
    
    for (const [type, generator] of this.generators) {
      info.push({
        type,
        name: generator.name,
        config: generator.getDefaultConfig ? generator.getDefaultConfig() : {}
      });
    }
    
    return info;
  }

  /**
   * Generate a maze using specified configuration
   */
  static generateMaze(config: MazeGeneratorConfig): IntGrid {
    const generator = this.getGenerator(config.generatorType);
    
    // Apply configuration if provided
    if (config.params && generator.configure) {
      generator.configure(config.params);
    }
    
    return generator.generateLayout(
      config.levelSize[0],
      config.levelSize[1],
      config.seed
    );
  }

  /**
   * Check if a generator type is registered
   */
  static hasGenerator(type: string): boolean {
    return this.generators.has(type);
  }

  /**
   * Unregister a generator (for testing or dynamic reloading)
   */
  static unregister(type: string): boolean {
    return this.generators.delete(type);
  }

  /**
   * Clear all registered generators (for testing)
   */
  static clear(): void {
    this.generators.clear();
  }

  /**
   * Get the current default generator type
   */
  static getDefaultGeneratorType(): string {
    return this.defaultGeneratorType;
  }
}

/**
 * MazeGeneratorInitializer
 * -------------------------
 * Initializes and registers all available maze generators.
 * 
 * This should be called once at application startup to ensure
 * all generators are available for use.
 */

import { MazeGeneratorRegistry } from './MazeGeneratorRegistry';
import { DelaunayMazeGeneratorAdapter } from './DelaunayGeneration/DelaunayMazeGeneratorAdapter';
import { CellularAutomataMazeGeneratorAdapter } from './CellularAutomataGeneration/CellularAutomataMazeGeneratorAdapter';

/**
 * Initialize all maze generators
 * Call this once at application startup
 */
export function initializeMazeGenerators(): void {
  console.log('🎲 Initializing maze generators...');
  
  // Register all available generators
  MazeGeneratorRegistry.register(new DelaunayMazeGeneratorAdapter());
  MazeGeneratorRegistry.register(new CellularAutomataMazeGeneratorAdapter());
  
  // Set default generator
  MazeGeneratorRegistry.setDefaultGeneratorType('delaunay');
  
  // Log summary
  const info = MazeGeneratorRegistry.getGeneratorInfo();
  console.log(`✓ Initialized ${info.length} maze generator(s):`);
  info.forEach(gen => {
    console.log(`  - ${gen.name} (${gen.type})`);
  });
}

/**
 * Get information about available generators
 */
export function getGeneratorInfo() {
  return MazeGeneratorRegistry.getGeneratorInfo();
}

/**
 * Quick access to registry for advanced usage
 */
export { MazeGeneratorRegistry } from './MazeGeneratorRegistry';

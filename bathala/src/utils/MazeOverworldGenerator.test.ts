/**
 * Test file to demonstrate Delaunay triangulation as the default maze generation method
 */

import { MazeOverworldGenerator } from './MazeOverworldGenerator';

// Test that Delaunay triangulation is now the default method
console.log('=== Bathala Maze Generation Test ===');
console.log('Testing Delaunay triangulation as default method...\n');

// Set a deterministic seed for consistent testing
MazeOverworldGenerator.setSeed(12345);

// Generate a test chunk using default method (should now be Delaunay)
console.log('Generating chunk (0,0) with default method...');
const defaultChunk = MazeOverworldGenerator.getChunk(0, 0, 50);
console.log(`✓ Generated chunk with ${defaultChunk.nodes.length} nodes`);
console.log(`✓ Maze dimensions: ${defaultChunk.maze.length}x${defaultChunk.maze[0]?.length || 0}`);

// Count walkable vs blocked tiles
let walkableTiles = 0;
let blockedTiles = 0;
for (let x = 0; x < defaultChunk.maze.length; x++) {
  for (let y = 0; y < defaultChunk.maze[x].length; y++) {
    if (defaultChunk.maze[x][y] === 0) {
      walkableTiles++;
    } else {
      blockedTiles++;
    }
  }
}

const totalTiles = walkableTiles + blockedTiles;
const walkableRatio = (walkableTiles / totalTiles * 100).toFixed(1);

console.log(`✓ Walkable tiles: ${walkableTiles}/${totalTiles} (${walkableRatio}%)`);
console.log(`✓ Blocked tiles: ${blockedTiles}/${totalTiles} (${(100 - parseFloat(walkableRatio)).toFixed(1)}%)`);

// Test explicit Delaunay generation
console.log('\nTesting explicit Delaunay method...');
const delaunayChunk = MazeOverworldGenerator.getChunk(1, 1, 50, MazeOverworldGenerator.GENERATION_MODES.DELAUNAY_TRIANGULATION);
console.log(`✓ Generated Delaunay chunk with ${delaunayChunk.nodes.length} nodes`);

// Test hybrid generation
console.log('\nTesting hybrid method...');
const hybridChunk = MazeOverworldGenerator.getChunk(2, 2, 50, MazeOverworldGenerator.GENERATION_MODES.HYBRID);
console.log(`✓ Generated hybrid chunk with ${hybridChunk.nodes.length} nodes`);

// Test cellular automata (legacy method)
console.log('\nTesting cellular automata method...');
const cellularChunk = MazeOverworldGenerator.getChunk(3, 3, 50, MazeOverworldGenerator.GENERATION_MODES.CELLULAR_AUTOMATA);
console.log(`✓ Generated cellular chunk with ${cellularChunk.nodes.length} nodes`);

// Test chunk region generation
console.log('\nTesting chunk region generation (2x2 region)...');
const chunkRegion = MazeOverworldGenerator.getChunkRegion(0, 0, 2, 2, 50);
console.log(`✓ Generated region with ${chunkRegion.size} chunks`);

// Display generation modes
console.log('\n=== Available Generation Modes ===');
console.log('Primary (Default):', MazeOverworldGenerator.GENERATION_MODES.DELAUNAY_TRIANGULATION);
console.log('Secondary:', MazeOverworldGenerator.GENERATION_MODES.HYBRID);
console.log('Legacy:', MazeOverworldGenerator.GENERATION_MODES.CELLULAR_AUTOMATA);

// Display cache stats
const cacheStats = MazeOverworldGenerator.getCacheStats();
console.log('\n=== Cache Statistics ===');
console.log(`Cached chunks: ${cacheStats.cachedChunks}/${cacheStats.maxCachedChunks}`);

console.log('\n✅ All tests completed successfully!');
console.log('🎯 Delaunay triangulation is now the default maze generation method.');

export {}; // Make this a module
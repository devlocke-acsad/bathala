/**
 * Test Delaunay generation to verify it matches external tool output
 */

import { DelaunayMazeGenerator } from './MazeGeneration/DelaunayMazeGenerator';
import { RandomUtil } from './MazeGeneration/RandomUtil';

console.log('=== Testing Delaunay Generation ===');

// Create a generator with external tool parameters
const generator = new DelaunayMazeGenerator();
generator.levelSize = [50, 50]; // Match external tool size
generator.regionCount = 15;      // Match external tool
generator.minRegionDistance = 4; // Match external tool

// Use a fixed seed for reproducible results
const rng = RandomUtil.createSeededRandom(12345);

console.log('Generating 50x50 layout with 15 regions...');
const intGrid = generator.generateLayout(rng, 50);

// Count tile types
let pathTiles = 0;
let regionTiles = 0;
let otherTiles = 0;

for (let x = 0; x < 50; x++) {
  for (let y = 0; y < 50; y++) {
    const tile = intGrid.getTile(x, y);
    if (tile === generator.PATH_TILE) {
      pathTiles++;
    } else if (tile === generator.REGION_TILE) {
      regionTiles++;
    } else {
      otherTiles++;
    }
  }
}

const totalTiles = pathTiles + regionTiles + otherTiles;
console.log(`Total tiles: ${totalTiles}`);
console.log(`Path tiles: ${pathTiles} (${(pathTiles/totalTiles*100).toFixed(1)}%)`);
console.log(`Region tiles: ${regionTiles} (${(regionTiles/totalTiles*100).toFixed(1)}%)`);
console.log(`Other tiles: ${otherTiles}`);

// Expected: Significant path network (20-40% paths) with connected regions
const pathRatio = pathTiles / totalTiles;
if (pathRatio > 0.15 && pathRatio < 0.6) {
  console.log('✅ Path ratio looks good for exploration');
} else {
  console.log('⚠️  Path ratio may be too high or too low');
}

// Display a small section for visual inspection
console.log('\n=== Visual Sample (top-left 20x20) ===');
for (let y = 19; y >= 0; y--) {
  let row = '';
  for (let x = 0; x < 20; x++) {
    const tile = intGrid.getTile(x, y);
    if (tile === generator.PATH_TILE) {
      row += '.';  // PATH
    } else if (tile === generator.REGION_TILE) {
      row += '#';  // REGION
    } else {
      row += '?';  // Unknown
    }
  }
  console.log(row);
}

console.log('\nLegend: . = Path, # = Region');

export {};
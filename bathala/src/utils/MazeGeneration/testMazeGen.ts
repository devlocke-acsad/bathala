import { DelaunayMazeGenerator } from './DelaunayMazeGenerator';

/*
  testMazeGen
  -----------
  Simple test utility to verify maze generation functionality.
  
  Process:
    1. Create a DelaunayMazeGenerator instance with test parameters
    2. Generate a small maze layout
    3. Count and display statistics about generated tiles
    4. Show a visual representation of the maze
  
  Test parameters:
    - Grid size: 20x20
    - Region count: 10
    - Minimum region distance: 3
*/
function testMazeGeneration() {
    console.log('Testing Delaunay Maze Generation...');
    
    const generator = new DelaunayMazeGenerator();
    generator.levelSize = [20, 20];
    generator.regionCount = 10;
    generator.minRegionDistance = 3;
    
    try {
        const grid = generator.generateLayout();
        console.log('Maze generation successful!');
        console.log(`Generated grid size: ${grid.width} x ${grid.height}`);
        
        // Count path and wall tiles
        let pathCount = 0;
        let wallCount = 0;
        
        for (let x = 0; x < grid.width; x++) {
            for (let y = 0; y < grid.height; y++) {
                if (grid.getTile(x, y) === generator.PATH_TILE) {
                    pathCount++;
                } else {
                    wallCount++;
                }
            }
        }
        
        console.log(`Path tiles: ${pathCount}`);
        console.log(`Wall tiles: ${wallCount}`);
        console.log(`Edges generated: ${generator.edges.length}`);
        
        // Display a small portion of the grid
        console.log('Sample of generated grid:');
        grid.display();
        
        return true;
    } catch (error) {
        console.error('Maze generation failed:', error);
        return false;
    }
}

// Run the test
if (typeof window === 'undefined') {
    // Only run in Node.js environment
    testMazeGeneration();
}

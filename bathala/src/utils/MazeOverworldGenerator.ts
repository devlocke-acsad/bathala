import { MapNode, NodeType } from "../core/types/MapTypes";

export class MazeOverworldGenerator {
  static generateMazeOverworld(width: number, height: number, gridSize: number): {
    nodes: MapNode[];
    maze: number[][];
  } {
    // Create a 2D array to represent the maze (0 = path, 1 = wall)
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);
    const maze: number[][] = [];

    // Initialize maze with walls
    for (let y = 0; y < rows; y++) {
      maze[y] = [];
      for (let x = 0; x < cols; x++) {
        maze[y][x] = 1; // 1 = wall
      }
    }

    // Generate maze using recursive backtracking
    this.generateMaze(maze, 1, 1);

    // Place nodes in the maze
    const nodes: MapNode[] = [];
    const nodeTypes: NodeType[] = ["combat", "elite", "shop", "event", "campfire", "treasure"];
    
    // Place nodes at random path positions
    let nodeCount = 0;
    const maxNodes = 20;
    
    while (nodeCount < maxNodes) {
      const x = Math.floor(Math.random() * (cols - 2)) + 1;
      const y = Math.floor(Math.random() * (rows - 2)) + 1;
      
      // Check if this position is a path (0) and doesn't already have a node
      if (maze[y][x] === 0 && !nodes.some(node => 
        node.x === x * gridSize && node.y === y * gridSize)) {
        
        const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        
        nodes.push({
          id: `${type}-${nodeCount}`,
          type,
          x: x * gridSize,
          y: y * gridSize,
          row: y,
          connections: [],
          visited: false,
          available: true,
          completed: false,
        });
        
        nodeCount++;
      }
    }

    return { nodes, maze };
  }

  private static generateMaze(maze: number[][], startX: number, startY: number): void {
    const cols = maze[0].length;
    const rows = maze.length;
    
    // Directions: right, down, left, up
    const directions = [
      [2, 0],  // right
      [0, 2],  // down
      [-2, 0], // left
      [0, -2]  // up
    ];

    // Shuffle directions
    this.shuffleArray(directions);

    // Mark current cell as path
    maze[startY][startX] = 0;

    // Try each direction
    for (const [dx, dy] of directions) {
      const newX = startX + dx;
      const newY = startY + dy;

      // Check if new position is valid and is a wall
      if (newX > 0 && newX < cols - 1 && newY > 0 && newY < rows - 1 && maze[newY][newX] === 1) {
        // Make the wall between current cell and new cell a path
        maze[startY + dy / 2][startX + dx / 2] = 0;
        // Recursively generate maze from new cell
        this.generateMaze(maze, newX, newY);
      }
    }
  }

  private static shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
import { MapNode, NodeType } from "../core/types/MapTypes";

export class MazeOverworldGenerator {
  private static chunks: Map<string, { maze: number[][], nodes: MapNode[] }> = new Map();
  private static chunkSize: number = 16; // 16x16 grid cells per chunk
  private static generatedChunks: Set<string> = new Set();

  /**
   * Generate or retrieve a maze chunk with guaranteed connections
   */
  static getChunk(chunkX: number, chunkY: number, gridSize: number): { 
    maze: number[][], 
    nodes: MapNode[] 
  } {
    const chunkKey = `${chunkX},${chunkY}`;
    
    // Return cached chunk if it exists
    if (this.chunks.has(chunkKey)) {
      return this.chunks.get(chunkKey)!;
    }
    
    // Generate new chunk with connections to adjacent chunks
    const chunk = this.generateConnectedChunk(chunkX, chunkY, gridSize);
    this.chunks.set(chunkKey, chunk);
    this.generatedChunks.add(chunkKey);
    return chunk;
  }

  /**
   * Generate a chunk with connections to adjacent chunks
   */
  private static generateConnectedChunk(chunkX: number, chunkY: number, gridSize: number): {
    maze: number[][];
    nodes: MapNode[];
  } {
    // Create a 2D array to represent the chunk (0 = path, 1 = wall)
    const maze: number[][] = [];
    
    // Initialize chunk with walls
    for (let y = 0; y < this.chunkSize; y++) {
      maze[y] = [];
      for (let x = 0; x < this.chunkSize; x++) {
        maze[y][x] = 1; // 1 = wall
      }
    }

    // Create guaranteed entrances to adjacent chunks
    // Always create entrances to ensure connectivity
    const center = Math.floor(this.chunkSize / 2);
    
    // North entrance (top edge) - always connect to chunk above
    maze[0][center] = 0;
    
    // South entrance (bottom edge) - always connect to chunk below
    maze[this.chunkSize - 1][center] = 0;
    
    // East entrance (right edge) - always connect to chunk right
    maze[center][this.chunkSize - 1] = 0;
    
    // West entrance (left edge) - always connect to chunk left
    maze[center][0] = 0;

    // Generate maze paths within the chunk using a more connected approach
    this.generateConnectedMaze(maze);

    // Place nodes in the chunk
    const nodes: MapNode[] = [];
    const nodeTypes: NodeType[] = ["combat", "elite", "shop", "event", "campfire", "treasure"];
    
    // Place nodes at random path positions
    const nodeCount = Math.floor(Math.random() * 2) + 1; // 1-2 nodes per chunk
    
    let placedNodes = 0;
    let attempts = 0;
    while (placedNodes < nodeCount && attempts < 50) {
      attempts++;
      const x = Math.floor(Math.random() * (this.chunkSize - 4)) + 2;
      const y = Math.floor(Math.random() * (this.chunkSize - 4)) + 2;
      
      // Check if this position is a path (0) and not too close to edges
      if (maze[y][x] === 0 && x > 1 && x < this.chunkSize - 2 && y > 1 && y < this.chunkSize - 2) {
        // Check if there's already a node at this position
        const nodeExists = nodes.some(node => 
          Math.abs(node.x - (chunkX * this.chunkSize + x) * gridSize) < this.chunkSize * gridSize / 4 &&
          Math.abs(node.y - (chunkY * this.chunkSize + y) * gridSize) < this.chunkSize * gridSize / 4
        );
        
        if (!nodeExists) {
          const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
          
          nodes.push({
            id: `${type}-${chunkX}-${chunkY}-${placedNodes}`,
            type,
            x: (chunkX * this.chunkSize + x) * gridSize,
            y: (chunkY * this.chunkSize + y) * gridSize,
            row: chunkY * this.chunkSize + y,
            connections: [],
            visited: false,
            available: true,
            completed: false,
          });
          
          placedNodes++;
        }
      }
    }

    return { maze, nodes };
  }

  /**
   * Generate a more connected maze within a chunk
   */
  private static generateConnectedMaze(maze: number[][]): void {
    // Use a different approach - create a path that connects all entrances
    const center = Math.floor(this.chunkSize / 2);
    
    // Create paths from each entrance to the center
    // North to center
    for (let y = 0; y <= center; y++) {
      maze[y][center] = 0;
      // Add some width to the path
      if (center > 0) maze[y][center-1] = 0;
      if (center < this.chunkSize - 1) maze[y][center+1] = 0;
    }
    
    // South to center
    for (let y = this.chunkSize - 1; y >= center; y--) {
      maze[y][center] = 0;
      // Add some width to the path
      if (center > 0) maze[y][center-1] = 0;
      if (center < this.chunkSize - 1) maze[y][center+1] = 0;
    }
    
    // East to center
    for (let x = this.chunkSize - 1; x >= center; x--) {
      maze[center][x] = 0;
      // Add some width to the path
      if (center > 0) maze[center-1][x] = 0;
      if (center < this.chunkSize - 1) maze[center+1][x] = 0;
    }
    
    // West to center
    for (let x = 0; x <= center; x++) {
      maze[center][x] = 0;
      // Add some width to the path
      if (center > 0) maze[center-1][x] = 0;
      if (center < this.chunkSize - 1) maze[center+1][x] = 0;
    }
    
    // Ensure the very center is open
    maze[center][center] = 0;
    if (center > 0) maze[center-1][center] = 0;
    if (center < this.chunkSize - 1) maze[center+1][center] = 0;
    if (center > 0) maze[center][center-1] = 0;
    if (center < this.chunkSize - 1) maze[center][center+1] = 0;
    
    // Add some random paths to make it more interesting
    for (let i = 0; i < 15; i++) {
      const x = Math.floor(Math.random() * (this.chunkSize - 4)) + 2;
      const y = Math.floor(Math.random() * (this.chunkSize - 4)) + 2;
      maze[y][x] = 0;
      
      // Add adjacent paths to create wider areas
      if (x > 1) maze[y][x-1] = 0;
      if (x < this.chunkSize - 2) maze[y][x+1] = 0;
      if (y > 1) maze[y-1][x] = 0;
      if (y < this.chunkSize - 2) maze[y+1][x] = 0;
    }
  }

  /**
   * Clear cached chunks (for new game)
   */
  static clearCache(): void {
    this.chunks.clear();
    this.generatedChunks.clear();
  }
}
import { MapNode, NodeType } from "../../../core/types/MapTypes";
import { SeededRandom } from "../Core/types";
import { ACT1_COMMON_ENEMIES, ACT1_ELITE_ENEMIES } from "../../../data/enemies/Act1Enemies";

/*
  NodeGenerator
  -------------
  Generates and places nodes (enemies, shops, etc.) in the maze.
  
  Process:
    1. Identify valid positions on paths with sufficient open space
    2. Distribute nodes spatially to avoid clustering
    3. Assign node types and enemy IDs randomly
    4. Convert grid coordinates to world coordinates
  
  Key parameters:
    - minDistanceFromEdge: Minimum distance from chunk edges
    - minOpenNeighbors: Minimum open neighbors for valid positions
    - baseNodeCount: Base number of nodes per chunk
    - minNodeDistance: Minimum distance between nodes
*/
export class NodeGenerator {
  // =============================
  // Node Generation Constants
  // =============================
  
  private static readonly PATH = 0;
  
  // =============================
  // Node Generation Parameters
  // =============================
  
  private static readonly MIN_DISTANCE_FROM_EDGE = 3;     // Minimum distance from chunk edges
  private static readonly MIN_OPEN_NEIGHBORS = 5;          // Minimum open neighbors for valid positions
  private static readonly BASE_NODE_COUNT = 3;             // Base number of nodes per chunk
  private static readonly MIN_NODE_DISTANCE_FACTOR = 4;    // Divisor for minimum distance between nodes

  /**
   * Generate nodes efficiently using spatial hashing
   */
  static generateOptimizedNodes(
    maze: number[][],
    chunkX: number,
    chunkY: number,
    chunkSize: number,
    gridSize: number,
    rng: SeededRandom
  ): MapNode[] {
    const nodes: MapNode[] = [];
    const nodeTypes: NodeType[] = ["combat", "elite", "shop", "event", "campfire", "treasure"];
    
    // Pre-calculate valid positions (paths only)
    const validPositions: { x: number; y: number }[] = [];
    
    for (let y = this.MIN_DISTANCE_FROM_EDGE; y < chunkSize - this.MIN_DISTANCE_FROM_EDGE; y++) {
      for (let x = this.MIN_DISTANCE_FROM_EDGE; x < chunkSize - this.MIN_DISTANCE_FROM_EDGE; x++) {
        if (maze[y][x] === this.PATH) {
          // Check if position has enough open space around it
          let openNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (maze[y + dy][x + dx] === this.PATH) {
                openNeighbors++;
              }
            }
          }
          
          // Only add positions with sufficient open space
          if (openNeighbors >= this.MIN_OPEN_NEIGHBORS) {
            validPositions.push({ x, y });
          }
        }
      }
    }
    
    if (validPositions.length === 0) return nodes;
    
    // Determine number of nodes based on chunk size and valid positions
    const baseNodeCount = Math.min(this.BASE_NODE_COUNT, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + baseNodeCount; // baseNodeCount to baseNodeCount+1
    
    // Use spatial distribution to avoid clustering
    const minNodeDistance = chunkSize / this.MIN_NODE_DISTANCE_FACTOR;
    const placedPositions: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount && validPositions.length > 0; i++) {
      // Find position far enough from existing nodes
      let bestPosition = null;
      let maxMinDistance = 0;
      
      for (const pos of validPositions) {
        let minDistanceToExisting = Infinity;
        
        for (const placed of placedPositions) {
          const distance = Math.sqrt((pos.x - placed.x) ** 2 + (pos.y - placed.y) ** 2);
          minDistanceToExisting = Math.min(minDistanceToExisting, distance);
        }
        
        if (minDistanceToExisting > maxMinDistance && minDistanceToExisting >= minNodeDistance) {
          maxMinDistance = minDistanceToExisting;
          bestPosition = pos;
        }
      }
      
      // If no position meets minimum distance, just pick randomly
      if (!bestPosition && validPositions.length > 0) {
        const randomIndex = Math.floor(rng.next() * validPositions.length);
        bestPosition = validPositions[randomIndex];
      }
      
      if (bestPosition) {
        const type = nodeTypes[Math.floor(rng.next() * nodeTypes.length)];
        
        let enemyId: string | undefined = undefined;
        if (type === "combat") {
          const enemyIndex = Math.floor(rng.next() * ACT1_COMMON_ENEMIES.length);
          enemyId = ACT1_COMMON_ENEMIES[enemyIndex].name;
          console.log(`Generated combat node: ${type}-${chunkX}-${chunkY}-${i}, enemyId: ${enemyId}, enemyIndex: ${enemyIndex}`);
        } else if (type === "elite") {
          const enemyIndex = Math.floor(rng.next() * ACT1_ELITE_ENEMIES.length);
          enemyId = ACT1_ELITE_ENEMIES[enemyIndex].name;
          console.log(`Generated elite node: ${type}-${chunkX}-${chunkY}-${i}, enemyId: ${enemyId}, enemyIndex: ${enemyIndex}`);
        }

        nodes.push({
          id: `${type}-${chunkX}-${chunkY}-${i}`,
          type,
          x: (chunkX * chunkSize + bestPosition.x) * gridSize,
          y: (chunkY * chunkSize + bestPosition.y) * gridSize,
          row: chunkY * chunkSize + bestPosition.y,
          connections: [],
          visited: false,
          available: true,
          completed: false,
          enemyId: enemyId
        });
        
        placedPositions.push(bestPosition);
        // Remove used position and nearby positions to avoid clustering
        validPositions.splice(validPositions.findIndex(p => p.x === bestPosition!.x && p.y === bestPosition!.y), 1);
      }
    }
    
    return nodes;
  }
}

import { MapNode, NodeType } from "../../core/types/MapTypes";
import { SeededRandom } from "./types";
import { ACT1_COMMON_ENEMIES, ACT1_ELITE_ENEMIES } from "../../data/enemies/Act1Enemies";

/**
 * Node generation and placement utilities
 */
export class NodeGenerator {
  private static readonly PATH = 0;

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
    const minDistanceFromEdge = 3;
    
    for (let y = minDistanceFromEdge; y < chunkSize - minDistanceFromEdge; y++) {
      for (let x = minDistanceFromEdge; x < chunkSize - minDistanceFromEdge; x++) {
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
          if (openNeighbors >= 5) {
            validPositions.push({ x, y });
          }
        }
      }
    }
    
    if (validPositions.length === 0) return nodes;
    
    // Determine number of nodes based on chunk size and valid positions
    const baseNodeCount = Math.min(3, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + baseNodeCount; // baseNodeCount to baseNodeCount+1
    
    // Use spatial distribution to avoid clustering
    const minNodeDistance = chunkSize / 4;
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

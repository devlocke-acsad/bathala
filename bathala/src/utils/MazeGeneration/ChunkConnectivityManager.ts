import { SeededRandom } from "./types";

/*
  ChunkConnectivityManager
  ------------------------
  Manages connectivity between adjacent chunks in the overworld.
  
  Process:
    1. Identify potential connection points on chunk edges
    2. Create wider entrances for better flow between chunks
    3. Generate inward paths to connect entrances to the chunk interior
  
  Key parameters:
    - connectionProbability: Chance of creating a connection on each edge
    - connectionWidth: Width of chunk entrances
    - pathLength: Depth of inward paths from entrances
*/
export class ChunkConnectivityManager {
  // =============================
  // Connectivity Constants
  // =============================
  
  private static readonly PATH = 0;
  
  // =============================
  // Connectivity Parameters
  // =============================
  
  private static readonly CONNECTION_PROBABILITY = 0.7; // 70% chance of connection
  private static readonly CONNECTION_WIDTH = 2;         // Width of chunk entrances
  private static readonly MAX_PATH_LENGTH = 8;          // Maximum depth of inward paths

  /**
   * Ensure connectivity between adjacent chunks
   */
  static ensureChunkConnectivity(
    maze: number[][], 
    chunkX: number, 
    chunkY: number, 
    chunkSize: number,
    rng: SeededRandom
  ): void {
    // Use chunkX and chunkY parameters for potential future use
    // For now, they help determine connection patterns based on chunk position
    const chunkPositionFactor = (chunkX + chunkY) % 2;
    
    const center = Math.floor(chunkSize / 2);
    
    // Define adjacent chunks with their positions and connection points
    const adjacentChunks = [
      { dx: 0, dy: -1, edge: 'north', x: center, y: 0 },
      { dx: 0, dy: 1, edge: 'south', x: center, y: chunkSize - 1 },
      { dx: 1, dy: 0, edge: 'east', x: chunkSize - 1, y: center },
      { dx: -1, dy: 0, edge: 'west', x: 0, y: center }
    ];
    
    for (const adj of adjacentChunks) {
      // In a more sophisticated implementation, we might use chunkX and chunkY to check 
      // if the adjacent chunk exists and adjust connection logic based on that
      
      // Apply slight variation based on chunk position to add some deterministic variety
      const adjustedProbability = this.CONNECTION_PROBABILITY + (chunkPositionFactor * 0.1 - 0.05);
      const clampedProbability = Math.max(0.5, Math.min(0.9, adjustedProbability));
      
      if (rng.next() < clampedProbability) { // Chance of connection
        // Create wider entrance
        for (let i = -Math.floor(this.CONNECTION_WIDTH/2); i <= Math.floor(this.CONNECTION_WIDTH/2); i++) {
          if (adj.edge === 'north' || adj.edge === 'south') {
            const nx = adj.x + i;
            if (nx >= 0 && nx < chunkSize) {
              maze[adj.y][nx] = this.PATH;
              // Create a path leading inward
              const pathLength = Math.min(this.MAX_PATH_LENGTH, Math.floor(chunkSize / 4));
              for (let j = 1; j <= pathLength; j++) {
                const ny = adj.edge === 'north' ? adj.y + j : adj.y - j;
                if (ny >= 0 && ny < chunkSize) {
                  maze[ny][nx] = this.PATH;
                }
              }
            }
          } else {
            const ny = adj.y + i;
            if (ny >= 0 && ny < chunkSize) {
              maze[ny][adj.x] = this.PATH;
              // Create a path leading inward
              const pathLength = Math.min(this.MAX_PATH_LENGTH, Math.floor(chunkSize / 4));
              for (let j = 1; j <= pathLength; j++) {
                const nx = adj.edge === 'west' ? adj.x + j : adj.x - j;
                if (nx >= 0 && nx < chunkSize) {
                  maze[ny][nx] = this.PATH;
                }
              }
            }
          }
        }
      }
    }
  }
}

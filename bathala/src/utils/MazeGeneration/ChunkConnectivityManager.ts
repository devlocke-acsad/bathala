import { SeededRandom } from "./types";

/**
 * Chunk connectivity utilities
 */
export class ChunkConnectivityManager {
  private static readonly PATH = 0;

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
    const center = Math.floor(chunkSize / 2);
    const connectionWidth = 2; // Wider connections for better flow
    
    // Check if adjacent chunks exist and create connections
    const adjacentChunks = [
      { dx: 0, dy: -1, edge: 'north', x: center, y: 0 },
      { dx: 0, dy: 1, edge: 'south', x: center, y: chunkSize - 1 },
      { dx: 1, dy: 0, edge: 'east', x: chunkSize - 1, y: center },
      { dx: -1, dy: 0, edge: 'west', x: 0, y: center }
    ];
    
    for (const adj of adjacentChunks) {
      // Create connection points for future connectivity with adjacent chunks
      // Adjacent chunk would be at position: (chunkX + adj.dx, chunkY + adj.dy)
      if (rng.next() < 0.7) { // 70% chance of connection
        // Create wider entrance
        for (let i = -Math.floor(connectionWidth/2); i <= Math.floor(connectionWidth/2); i++) {
          if (adj.edge === 'north' || adj.edge === 'south') {
            const nx = adj.x + i;
            if (nx >= 0 && nx < chunkSize) {
              maze[adj.y][nx] = this.PATH;
              // Create a path leading inward
              const pathLength = Math.min(8, chunkSize / 4);
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
              const pathLength = Math.min(8, chunkSize / 4);
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

import { SeededRandom, RoadConnection } from "./types";

/**
 * Road network generation and drawing utilities
 */
export class RoadNetworkGenerator {
  private static readonly WALL = 1;
  private static readonly PATH = 0;
  
  // Road network parameters
  private static readonly ROAD_DENSITY = 0.8; // Probability of major road per chunk
  private static readonly SECONDARY_ROAD_CHANCE = 0.9;
  private static readonly ROAD_WIDTH = 1;

  /**
   * Generate road network within chunk
   */
  static generateRoadNetwork(
    maze: number[][], 
    chunkSize: number,
    rng: SeededRandom
  ): RoadConnection[] {
    const connections: RoadConnection[] = [];
    
    // Decide if this chunk should have major roads
    if (rng.next() < this.ROAD_DENSITY) {
      const center = Math.floor(chunkSize / 2);
      
      // Create main road (horizontal or vertical)
      if (rng.next() < 0.5) {
        // Horizontal road
        this.drawRoad(maze, 0, center, chunkSize - 1, center, this.ROAD_WIDTH, chunkSize);
        connections.push(
          { x: 0, y: center, direction: 'west' },
          { x: chunkSize - 1, y: center, direction: 'east' }
        );
      } else {
        // Vertical road
        this.drawRoad(maze, center, 0, center, chunkSize - 1, this.ROAD_WIDTH, chunkSize);
        connections.push(
          { x: center, y: 0, direction: 'north' },
          { x: center, y: chunkSize - 1, direction: 'south' }
        );
      }
    }
    
    // Add secondary roads
    if (rng.next() < this.SECONDARY_ROAD_CHANCE) {
      const numSecondary = Math.floor(rng.next() * 2) + 1; // 1-2 secondary roads
      
      for (let i = 0; i < numSecondary; i++) {
        const startX = Math.floor(rng.next() * (chunkSize - 4)) + 2;
        const startY = Math.floor(rng.next() * (chunkSize - 4)) + 2;
        const length = Math.floor(rng.next() * 15) + 8; // 8-22 length
        const angle = rng.next() * Math.PI * 2;
        
        const endX = Math.max(2, Math.min(chunkSize - 3, 
          startX + Math.floor(length * Math.cos(angle))));
        const endY = Math.max(2, Math.min(chunkSize - 3, 
          startY + Math.floor(length * Math.sin(angle))));
        
        this.drawRoad(maze, startX, startY, endX, endY, 1, chunkSize);
      }
    }
    
    return connections;
  }

  /**
   * Draw road between two points using Bresenham's algorithm
   */
  private static drawRoad(
    maze: number[][], 
    x0: number, 
    y0: number, 
    x1: number, 
    y1: number, 
    width: number,
    chunkSize: number
  ): void {
    const points = this.bresenhamLine(x0, y0, x1, y1);
    
    for (const [x, y] of points) {
      // Draw thick road
      for (let dx = -Math.floor(width/2); dx <= Math.floor(width/2); dx++) {
        for (let dy = -Math.floor(width/2); dy <= Math.floor(width/2); dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < chunkSize && ny >= 0 && ny < chunkSize) {
            maze[ny][nx] = this.PATH;
          }
        }
      }
    }
  }

  /**
   * Bresenham's line algorithm
   */
  private static bresenhamLine(x0: number, y0: number, x1: number, y1: number): [number, number][] {
    const points: [number, number][] = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    
    let x = x0;
    let y = y0;
    
    while (true) {
      points.push([x, y]);
      
      if (x === x1 && y === y1) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return points;
  }

  /**
   * Remove isolated roads using a plus-shaped multi-chunk analysis
   */
  static removeIsolatedRoads(maze: number[][], chunkSize: number): void {
    // Define sub-chunk size (must be smaller than chunkSize)
    const subChunkSize = 4; // Process in 4x4 chunks
    
    let hasIsolatedRoads = true;
    while (hasIsolatedRoads) {
      hasIsolatedRoads = false;
      
      // Process the center chunk and its four adjacent chunks in a plus shape
      const chunkDirections = [
        { dx: 0, dy: 0 },    // Center
        { dx: 0, dy: -1 },   // North
        { dx: 0, dy: 1 },    // South
        { dx: -1, dy: 0 },   // West
        { dx: 1, dy: 0 }     // East
      ];
      
      for (const direction of chunkDirections) {
        // Process each subchunk within the current chunk
        for (let chunkY = 0; chunkY < chunkSize; chunkY += subChunkSize) {
          for (let chunkX = 0; chunkX < chunkSize; chunkX += subChunkSize) {
            // Only process cells in the center chunk
            if (direction.dx === 0 && direction.dy === 0) {
              // Process each cell within the subchunk
              for (let dy = 0; dy < subChunkSize; dy++) {
                const y = chunkY + dy;
                if (y <= 0 || y >= chunkSize - 1) continue;
                
                for (let dx = 0; dx < subChunkSize; dx++) {
                  const x = chunkX + dx;
                  if (x <= 0 || x >= chunkSize - 1) continue;
                  
                  if (maze[y][x] === this.PATH) {
                    // Check if the road is isolated by examining adjacent chunks
                    const isIsolated = this.isRoadIsolated(maze, x, y, chunkSize, direction);
                    
                    if (isIsolated) {
                      maze[y][x] = this.WALL;
                      hasIsolatedRoads = true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Check if a road cell is isolated by examining surrounding cells including adjacent chunks
   */
  private static isRoadIsolated(
    maze: number[][], 
    x: number, 
    y: number, 
    chunkSize: number,
    direction: { dx: number; dy: number }
  ): boolean {
    const directions = [
      { dx: 0, dy: -1 },  // North
      { dx: 0, dy: 1 },   // South
      { dx: -1, dy: 0 },  // West
      { dx: 1, dy: 0 }    // East
    ];
    
    let wallCount = 0;
    
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // Check if the position is within the current chunk
      if (nx >= 0 && nx < chunkSize && ny >= 0 && ny < chunkSize) {
        if (maze[ny][nx] === this.WALL) {
          wallCount++;
        }
      } else {
        // Position is in an adjacent chunk
        // For now, treat out-of-bounds as walls unless it's at the edge connecting to an adjacent chunk
        const isEdgeConnection = (
          (nx < 0 && direction.dx === -1) ||
          (nx >= chunkSize && direction.dx === 1) ||
          (ny < 0 && direction.dy === -1) ||
          (ny >= chunkSize && direction.dy === 1)
        );
        
        if (!isEdgeConnection) {
          wallCount++;
        }
      }
    }
    
    return wallCount === 4;
  }
}

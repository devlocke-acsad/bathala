import { IntGrid } from './data-structures';

/**
 * Connection information for an outer tile
 */
export interface OuterTileInfo {
    x: number;
    y: number;
    direction: 'north' | 'south' | 'east' | 'west';
    pathNeighbors: number;
    isIntersection: boolean;
    isCorner: boolean;
    isTerminal: boolean;
}

/**
 * OuterTileMarker
 * ---------------
 * Utility class for identifying special PATH tiles on the border of a level.
 * Determines which border tiles should be visually distinguished (darker color)
 * based on their connectivity patterns and position.
 * Enhanced for chunk connection support.
 */
export class OuterTileMarker {
    /**
     * Check if a PATH tile is an outside intersection or corner.
     * Returns true if the tile is on the border of the level AND has special significance
     * (intersection, corner, or terminal point).
     */
    static isOutsideIntersectionOrCorner(
        x: number, 
        y: number, 
        grid: IntGrid, 
        pathTileType: number
    ): boolean {
        if (!grid) return false;
        
        const tileType = grid.getTile(x, y);
        if (tileType !== pathTileType) return false;

        // Check if tile is on the border
        const width = grid.width;
        const height = grid.height;
        const isOnBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
        
        if (!isOnBorder) return false;

        // Count neighboring PATH tiles and track their directions
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // left, right, down, up
        ];
        
        let pathNeighbors = 0;
        let neighborPositions: [number, number][] = [];
        let hasHorizontalNeighbor = false;
        let hasVerticalNeighbor = false;
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (grid.getTile(nx, ny) === pathTileType) {
                    pathNeighbors++;
                    neighborPositions.push([dx, dy]);
                    
                    if (dx !== 0) hasHorizontalNeighbor = true;
                    if (dy !== 0) hasVerticalNeighbor = true;
                }
            }
        }

        // Mark as special if it's an intersection (more than 2 neighbors)
        if (pathNeighbors > 2) return true;

        // Mark as special if it's a corner (has both horizontal and vertical neighbors)
        if (pathNeighbors >= 2 && hasHorizontalNeighbor && hasVerticalNeighbor) return true;

        // Mark as special if it's a terminal point on the border (only 1 neighbor)
        if (pathNeighbors === 1) return true;

        // Mark as special if it has exactly 2 neighbors in a straight line but is at a corner of the level
        if (pathNeighbors === 2) {
            const isAtCorner = (x === 0 || x === width - 1) && (y === 0 || y === height - 1);
            if (isAtCorner) return true;
            
            // Also mark if it's a turning point (not in a straight line)
            const [dir1, dir2] = neighborPositions;
            const isStraightLine = (dir1[0] === -dir2[0] && dir1[1] === -dir2[1]);
            if (!isStraightLine) return true;
        }

        return false;
    }

    /**
     * Get detailed information about an outer tile for chunk connection purposes
     */
    static getOuterTileInfo(
        x: number,
        y: number,
        grid: IntGrid,
        pathTileType: number
    ): OuterTileInfo | null {
        if (!grid) return null;
        
        const tileType = grid.getTile(x, y);
        if (tileType !== pathTileType) return null;

        // Check if tile is on the border
        const width = grid.width;
        const height = grid.height;
        const isOnBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
        
        if (!isOnBorder) return null;

        // Determine direction based on border position
        let direction: 'north' | 'south' | 'east' | 'west';
        if (y === height - 1) direction = 'north';
        else if (y === 0) direction = 'south';
        else if (x === width - 1) direction = 'east';
        else direction = 'west';

        // Count neighboring PATH tiles and analyze connectivity
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // left, right, down, up
        ];
        
        let pathNeighbors = 0;
        let neighborPositions: [number, number][] = [];
        let hasHorizontalNeighbor = false;
        let hasVerticalNeighbor = false;
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                if (grid.getTile(nx, ny) === pathTileType) {
                    pathNeighbors++;
                    neighborPositions.push([dx, dy]);
                    
                    if (dx !== 0) hasHorizontalNeighbor = true;
                    if (dy !== 0) hasVerticalNeighbor = true;
                }
            }
        }

        // Classify the tile type
        const isIntersection = pathNeighbors > 2;
        const isCorner = pathNeighbors >= 2 && hasHorizontalNeighbor && hasVerticalNeighbor;
        const isTerminal = pathNeighbors === 1;

        // Also consider special cases for pathNeighbors === 2
        let isSpecialTwoNeighbor = false;
        if (pathNeighbors === 2) {
            const isAtCorner = (x === 0 || x === width - 1) && (y === 0 || y === height - 1);
            if (isAtCorner) {
                isSpecialTwoNeighbor = true;
            } else {
                // Check if it's a turning point (not in a straight line)
                const [dir1, dir2] = neighborPositions;
                const isStraightLine = (dir1[0] === -dir2[0] && dir1[1] === -dir2[1]);
                if (!isStraightLine) {
                    isSpecialTwoNeighbor = true;
                }
            }
        }

        // Only return info for tiles that are significant for connections
        if (isIntersection || isCorner || isTerminal || isSpecialTwoNeighbor) {
            return {
                x,
                y,
                direction,
                pathNeighbors,
                isIntersection,
                isCorner: isCorner || isSpecialTwoNeighbor,
                isTerminal
            };
        }

        return null;
    }

    /**
     * Get all outer tiles that could serve as connection points
     */
    static getAllOuterTiles(grid: IntGrid, pathTileType: number): OuterTileInfo[] {
        const outerTiles: OuterTileInfo[] = [];
        
        if (!grid) return outerTiles;

        const width = grid.width;
        const height = grid.height;

        // Check all border tiles
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const isOnBorder = x === 0 || x === width - 1 || y === 0 || y === height - 1;
                if (!isOnBorder) continue;

                const outerTileInfo = this.getOuterTileInfo(x, y, grid, pathTileType);
                if (outerTileInfo) {
                    outerTiles.push(outerTileInfo);
                }
            }
        }

        return outerTiles;
    }

    /**
     * Find the best connection points on a specific side of the grid
     */
    static getConnectionPointsOnSide(
        grid: IntGrid,
        pathTileType: number,
        side: 'north' | 'south' | 'east' | 'west'
    ): OuterTileInfo[] {
        const allOuterTiles = this.getAllOuterTiles(grid, pathTileType);
        return allOuterTiles.filter(tile => tile.direction === side);
    }
}
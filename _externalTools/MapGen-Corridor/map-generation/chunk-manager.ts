import { IntGrid } from './data-structures';
import { HeIsComingGenerator } from './level-generator';
import { OuterTileMarker } from './outer-tile-marker';

/**
 * ChunkCoordinate
 * ---------------
 * Represents a chunk's position in the chunk grid (not world coordinates)
 */
export interface ChunkCoordinate {
    chunkX: number;
    chunkY: number;
}

/**
 * WorldCoordinate
 * ---------------
 * Represents a position in world space spanning multiple chunks
 */
export interface WorldCoordinate {
    worldX: number;
    worldY: number;
}

/**
 * LocalCoordinate
 * ---------------
 * Represents a position within a specific chunk (0 to chunkSize-1)
 */
export interface LocalCoordinate {
    localX: number;
    localY: number;
}

/**
 * ConnectionPoint
 * ---------------
 * Represents a point where chunks can connect
 */
export interface ConnectionPoint {
    localX: number;
    localY: number;
    direction: 'north' | 'south' | 'east' | 'west';
    isConnected: boolean;
}

/**
 * Chunk
 * -----
 * Represents a single chunk with its grid and metadata
 */
export class Chunk {
    public grid: IntGrid;
    public chunkX: number;
    public chunkY: number;
    public connectionPoints: ConnectionPoint[] = [];
    public connectedChunks: Map<string, ChunkCoordinate> = new Map();

    constructor(grid: IntGrid, chunkX: number, chunkY: number) {
        this.grid = grid;
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.analyzeConnectionPoints();
    }

    /**
     * Analyze the chunk's border tiles to find potential connection points
     */
    private analyzeConnectionPoints(): void {
        const pathTile = 1; // Assuming PATH_TILE = 1, we'll get this from generator later
        this.connectionPoints = [];

        // Use the enhanced OuterTileMarker to get all outer tiles
        const outerTiles = OuterTileMarker.getAllOuterTiles(this.grid, pathTile);
        
        for (const outerTile of outerTiles) {
            this.connectionPoints.push({
                localX: outerTile.x,
                localY: outerTile.y,
                direction: outerTile.direction,
                isConnected: false
            });
        }
    }

    /**
     * Get the unique key for this chunk
     */
    getKey(): string {
        return `${this.chunkX},${this.chunkY}`;
    }
}

/**
 * ChunkManager
 * ------------
 * Manages multiple chunks, handles chunk generation, connections, and coordinate transformations
 */
export class ChunkManager {
    private chunks: Map<string, Chunk> = new Map();
    private generator: HeIsComingGenerator;
    private chunkSize: { width: number; height: number };
    private generationSettings: {
        regions: number;
        minDistance: number;
    };

    constructor(chunkWidth: number = 50, chunkHeight: number = 50) {
        this.generator = new HeIsComingGenerator();
        this.chunkSize = { width: chunkWidth, height: chunkHeight };
        this.generationSettings = {
            regions: Math.max(chunkWidth, chunkHeight) * 2,
            minDistance: 3
        };
    }

    /**
     * Generate a new chunk at the specified chunk coordinates
     */
    generateChunk(chunkX: number, chunkY: number): Chunk {
        const key = `${chunkX},${chunkY}`;
        
        if (this.chunks.has(key)) {
            return this.chunks.get(key)!;
        }

        // Configure generator for this chunk
        this.generator.levelSize = [this.chunkSize.width, this.chunkSize.height];
        this.generator.regionCount = this.generationSettings.regions;
        this.generator.minRegionDistance = this.generationSettings.minDistance;

        // Generate the grid
        const grid = this.generator.generateLayout();
        
        // Create chunk
        const chunk = new Chunk(grid, chunkX, chunkY);
        this.chunks.set(key, chunk);

        return chunk;
    }

    /**
     * Get a chunk by chunk coordinates, generating it if it doesn't exist
     */
    getChunk(chunkX: number, chunkY: number): Chunk {
        const key = `${chunkX},${chunkY}`;
        
        if (this.chunks.has(key)) {
            return this.chunks.get(key)!;
        }

        return this.generateChunk(chunkX, chunkY);
    }

    /**
     * Get all loaded chunks
     */
    getAllChunks(): Chunk[] {
        return Array.from(this.chunks.values());
    }

    /**
     * Convert world coordinates to chunk coordinates
     */
    worldToChunk(worldX: number, worldY: number): ChunkCoordinate {
        return {
            chunkX: Math.floor(worldX / this.chunkSize.width),
            chunkY: Math.floor(worldY / this.chunkSize.height)
        };
    }

    /**
     * Convert world coordinates to local coordinates within a chunk
     */
    worldToLocal(worldX: number, worldY: number): LocalCoordinate {
        return {
            localX: worldX % this.chunkSize.width,
            localY: worldY % this.chunkSize.height
        };
    }

    /**
     * Convert chunk + local coordinates to world coordinates
     */
    chunkLocalToWorld(chunkX: number, chunkY: number, localX: number, localY: number): WorldCoordinate {
        return {
            worldX: chunkX * this.chunkSize.width + localX,
            worldY: chunkY * this.chunkSize.height + localY
        };
    }

    /**
     * Get tile type at world coordinates
     */
    getTileAtWorld(worldX: number, worldY: number): number {
        const chunkCoord = this.worldToChunk(worldX, worldY);
        const localCoord = this.worldToLocal(worldX, worldY);
        
        const chunk = this.getChunk(chunkCoord.chunkX, chunkCoord.chunkY);
        return chunk.grid.getTile(localCoord.localX, localCoord.localY);
    }

    /**
     * Check if a world position is on an outer tile that can trigger chunk generation
     */
    isOnOuterTile(worldX: number, worldY: number): boolean {
        const chunkCoord = this.worldToChunk(worldX, worldY);
        const localCoord = this.worldToLocal(worldX, worldY);
        
        const chunk = this.getChunk(chunkCoord.chunkX, chunkCoord.chunkY);
        
        // Check if this local position matches any connection point
        return chunk.connectionPoints.some(cp => 
            cp.localX === localCoord.localX && cp.localY === localCoord.localY
        );
    }

    /**
     * Get the direction of the outer tile (which direction it connects to)
     */
    getOuterTileDirection(worldX: number, worldY: number): 'north' | 'south' | 'east' | 'west' | null {
        const chunkCoord = this.worldToChunk(worldX, worldY);
        const localCoord = this.worldToLocal(worldX, worldY);
        
        const chunk = this.getChunk(chunkCoord.chunkX, chunkCoord.chunkY);
        
        const connectionPoint = chunk.connectionPoints.find(cp => 
            cp.localX === localCoord.localX && cp.localY === localCoord.localY
        );
        
        return connectionPoint ? connectionPoint.direction : null;
    }

    /**
     * Handle player stepping on an outer tile - generate adjacent chunk if needed
     */
    handleOuterTileStep(worldX: number, worldY: number): { newChunkGenerated: boolean; targetChunk: ChunkCoordinate } | null {
        if (!this.isOnOuterTile(worldX, worldY)) {
            return null;
        }

        const direction = this.getOuterTileDirection(worldX, worldY);
        if (!direction) return null;

        const currentChunkCoord = this.worldToChunk(worldX, worldY);
        
        // Calculate target chunk coordinates based on direction
        let targetChunkX = currentChunkCoord.chunkX;
        let targetChunkY = currentChunkCoord.chunkY;

        switch (direction) {
            case 'north':
                targetChunkY += 1;
                break;
            case 'south':
                targetChunkY -= 1;
                break;
            case 'east':
                targetChunkX += 1;
                break;
            case 'west':
                targetChunkX -= 1;
                break;
        }

        const targetKey = `${targetChunkX},${targetChunkY}`;
        const newChunkGenerated = !this.chunks.has(targetKey);

        // Generate the adjacent chunk if it doesn't exist
        const targetChunk = this.getChunk(targetChunkX, targetChunkY);

        // Connect the chunks
        this.connectChunks(currentChunkCoord.chunkX, currentChunkCoord.chunkY, targetChunkX, targetChunkY);

        return {
            newChunkGenerated,
            targetChunk: { chunkX: targetChunkX, chunkY: targetChunkY }
        };
    }

    /**
     * Connect two adjacent chunks by marking their connection points as connected
     */
    private connectChunks(chunk1X: number, chunk1Y: number, chunk2X: number, chunk2Y: number): void {
        const chunk1 = this.getChunk(chunk1X, chunk1Y);
        const chunk2 = this.getChunk(chunk2X, chunk2Y);

        // Mark chunks as connected to each other
        chunk1.connectedChunks.set(chunk2.getKey(), { chunkX: chunk2X, chunkY: chunk2Y });
        chunk2.connectedChunks.set(chunk1.getKey(), { chunkX: chunk1X, chunkY: chunk1Y });

        // Get the connection direction
        const direction1to2 = this.getConnectionDirection(chunk1X, chunk1Y, chunk2X, chunk2Y);
        const direction2to1 = this.getOppositeDirection(direction1to2);

        // Find and align specific connection points
        this.alignConnectionPoints(chunk1, chunk2, direction1to2, direction2to1);

        // Mark relevant connection points as connected
        this.markConnectionPointsAsConnected(chunk1, direction1to2);
        this.markConnectionPointsAsConnected(chunk2, direction2to1);
    }

    /**
     * Align connection points between two adjacent chunks
     */
    private alignConnectionPoints(
        chunk1: Chunk,
        chunk2: Chunk,
        direction1to2: 'north' | 'south' | 'east' | 'west',
        direction2to1: 'north' | 'south' | 'east' | 'west'
    ): void {
        // Get connection points on the connecting sides
        const chunk1ConnectionPoints = chunk1.connectionPoints.filter(cp => cp.direction === direction1to2);
        const chunk2ConnectionPoints = chunk2.connectionPoints.filter(cp => cp.direction === direction2to1);

        // For now, we simply mark all connection points on the connecting sides as paired
        // In a more sophisticated system, you might want to:
        // 1. Find the closest connection points
        // 2. Ensure they align properly
        // 3. Maybe even create "bridge" tiles between chunks

        console.log(`Aligning ${chunk1ConnectionPoints.length} connection points from chunk (${chunk1.chunkX}, ${chunk1.chunkY}) with ${chunk2ConnectionPoints.length} connection points from chunk (${chunk2.chunkX}, ${chunk2.chunkY})`);
    }

    /**
     * Get the direction from chunk1 to chunk2
     */
    private getConnectionDirection(chunk1X: number, chunk1Y: number, chunk2X: number, chunk2Y: number): 'north' | 'south' | 'east' | 'west' {
        if (chunk2Y > chunk1Y) return 'north';
        if (chunk2Y < chunk1Y) return 'south';
        if (chunk2X > chunk1X) return 'east';
        return 'west';
    }

    /**
     * Get the opposite direction
     */
    private getOppositeDirection(direction: 'north' | 'south' | 'east' | 'west'): 'north' | 'south' | 'east' | 'west' {
        switch (direction) {
            case 'north': return 'south';
            case 'south': return 'north';
            case 'east': return 'west';
            case 'west': return 'east';
        }
    }

    /**
     * Mark connection points in a specific direction as connected
     */
    private markConnectionPointsAsConnected(chunk: Chunk, direction: 'north' | 'south' | 'east' | 'west'): void {
        chunk.connectionPoints.forEach(cp => {
            if (cp.direction === direction) {
                cp.isConnected = true;
            }
        });
    }

    /**
     * Get chunks within a specific distance from a center chunk (for culling)
     */
    getChunksInRange(centerChunkX: number, centerChunkY: number, range: number): Chunk[] {
        const chunksInRange: Chunk[] = [];

        for (let x = centerChunkX - range; x <= centerChunkX + range; x++) {
            for (let y = centerChunkY - range; y <= centerChunkY + range; y++) {
                const key = `${x},${y}`;
                if (this.chunks.has(key)) {
                    chunksInRange.push(this.chunks.get(key)!);
                }
            }
        }

        return chunksInRange;
    }

    /**
     * Get chunk size
     */
    getChunkSize(): { width: number; height: number } {
        return { ...this.chunkSize };
    }
}
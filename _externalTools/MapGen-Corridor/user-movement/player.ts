import { IntGrid } from '../map-generation/data-structures';
import { ChunkManager } from '../map-generation/chunk-manager';

/**
 * Player
 * ------
 * Represents the player character (red triangle) that can move on path tiles.
 * Handles WASD/Arrow key input and validates movement against the grid.
 * Enhanced to support world coordinates and chunk transitions.
 */
export class Player {
    public x: number; // World coordinates
    public y: number; // World coordinates
    private grid: IntGrid | null = null; // Legacy grid reference (for compatibility)
    private chunkManager: ChunkManager | null = null;
    private pathTileType: number;
    private keys: { [key: string]: boolean } = {};
    private lastMoveTime: number = 0;
    private readonly MOVE_COOLDOWN = 150; // milliseconds between moves
    private onChunkGenerated?: (chunkX: number, chunkY: number) => void;

    constructor(startX: number, startY: number, pathTileType: number) {
        this.x = startX;
        this.y = startY;
        this.pathTileType = pathTileType;
        this.setupKeyListeners();
    }

    /**
     * Set the grid reference for movement validation (legacy method)
     */
    setGrid(grid: IntGrid): void {
        this.grid = grid;
    }

    /**
     * Set the chunk manager for multi-chunk movement
     */
    setChunkManager(chunkManager: ChunkManager): void {
        this.chunkManager = chunkManager;
    }

    /**
     * Set callback for when new chunks are generated
     */
    setOnChunkGenerated(callback: (chunkX: number, chunkY: number) => void): void {
        this.onChunkGenerated = callback;
    }

    /**
     * Set up keyboard event listeners for WASD and arrow keys
     */
    private setupKeyListeners(): void {
        document.addEventListener('keydown', (event) => {
            const key = event.code.toLowerCase();
            if (this.isMovementKey(key)) {
                this.keys[key] = true;
                event.preventDefault();
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = event.code.toLowerCase();
            if (this.isMovementKey(key)) {
                this.keys[key] = false;
                event.preventDefault();
            }
        });
    }

    /**
     * Check if a key is a movement key
     */
    private isMovementKey(key: string): boolean {
        return ['keyw', 'keya', 'keys', 'keyd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key);
    }

    /**
     * Update player position based on input (call this each frame)
     */
    update(): boolean {
        // Prefer chunk manager if available, otherwise use legacy grid
        if (!this.chunkManager && !this.grid) return false;

        const now = Date.now();
        if (now - this.lastMoveTime < this.MOVE_COOLDOWN) {
            return false;
        }

        let newX = this.x;
        let newY = this.y;
        let moved = false;

        // Check for movement input (WASD or Arrow keys)
        if (this.keys['keyw'] || this.keys['arrowup']) {
            newY = this.y + 1;
            moved = true;
        } else if (this.keys['keys'] || this.keys['arrowdown']) {
            newY = this.y - 1;
            moved = true;
        } else if (this.keys['keya'] || this.keys['arrowleft']) {
            newX = this.x - 1;
            moved = true;
        } else if (this.keys['keyd'] || this.keys['arrowright']) {
            newX = this.x + 1;
            moved = true;
        }

        if (moved && this.canMoveTo(newX, newY)) {
            // Check if we're stepping on an outer tile before moving
            if (this.chunkManager) {
                const wasOnOuterTile = this.chunkManager.isOnOuterTile(this.x, this.y);
                
                this.x = newX;
                this.y = newY;
                this.lastMoveTime = now;

                // Check if we just stepped on an outer tile
                const nowOnOuterTile = this.chunkManager.isOnOuterTile(this.x, this.y);
                
                if (nowOnOuterTile && !wasOnOuterTile) {
                    // Handle stepping on outer tile
                    const result = this.chunkManager.handleOuterTileStep(this.x, this.y);
                    if (result && result.newChunkGenerated && this.onChunkGenerated) {
                        this.onChunkGenerated(result.targetChunk.chunkX, result.targetChunk.chunkY);
                    }
                }
            } else {
                // Legacy grid-based movement
                this.x = newX;
                this.y = newY;
                this.lastMoveTime = now;
            }

            return true;
        }

        return false;
    }

    /**
     * Check if the player can move to the specified position
     */
    private canMoveTo(x: number, y: number): boolean {
        // Use chunk manager if available
        if (this.chunkManager) {
            try {
                const tileType = this.chunkManager.getTileAtWorld(x, y);
                return tileType === this.pathTileType;
            } catch (error) {
                // If chunk doesn't exist or there's an error, can't move there
                return false;
            }
        }

        // Legacy grid-based movement
        if (!this.grid) return false;

        // Check bounds
        if (x < 0 || x >= this.grid.width || y < 0 || y >= this.grid.height) {
            return false;
        }

        // Check if the tile is a path tile (including outer paths)
        const tileType = this.grid.getTile(x, y);
        return tileType === this.pathTileType;
    }

    /**
     * Set player position (useful for spawning or teleporting)
     */
    setPosition(x: number, y: number): void {
        if (this.canMoveTo(x, y)) {
            this.x = x;
            this.y = y;
        }
    }

    /**
     * Find a valid spawn position on a path tile
     */
    findValidSpawnPosition(): boolean {
        // Use chunk manager if available
        if (this.chunkManager) {
            return this.findValidSpawnPositionInChunk(0, 0);
        }

        // Legacy grid-based spawning
        if (!this.grid) return false;

        // Try to find a path tile to spawn on
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                if (this.grid.getTile(x, y) === this.pathTileType) {
                    this.x = x;
                    this.y = y;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Find a valid spawn position within a specific chunk
     */
    private findValidSpawnPositionInChunk(chunkX: number, chunkY: number): boolean {
        if (!this.chunkManager) return false;

        const chunk = this.chunkManager.getChunk(chunkX, chunkY);
        const chunkSize = this.chunkManager.getChunkSize();

        // Try to find a path tile to spawn on within this chunk
        for (let localY = 0; localY < chunkSize.height; localY++) {
            for (let localX = 0; localX < chunkSize.width; localX++) {
                if (chunk.grid.getTile(localX, localY) === this.pathTileType) {
                    const worldCoord = this.chunkManager.chunkLocalToWorld(chunkX, chunkY, localX, localY);
                    this.x = worldCoord.worldX;
                    this.y = worldCoord.worldY;
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get current chunk coordinates
     */
    getCurrentChunk(): { chunkX: number; chunkY: number } | null {
        if (!this.chunkManager) return null;
        return this.chunkManager.worldToChunk(this.x, this.y);
    }

    /**
     * Get local coordinates within current chunk
     */
    getLocalCoordinates(): { localX: number; localY: number } | null {
        if (!this.chunkManager) return null;
        return this.chunkManager.worldToLocal(this.x, this.y);
    }
}
/**
 * ViewportCulling
 * ---------------
 * Handles viewport-based culling for efficient rendering.
 * Supports chunk-based culling where only the current chunk and adjacent chunks are rendered.
 * 
 * Chunk Definition:
 * A chunk is defined as the initial level we generate (and subsequently other levels 
 * we will connect to it in the future). Currently, we only have one chunk which is 
 * the entire generated grid.
 */

import { IntGrid } from './map-generation/data-structures';

export interface CullingBounds {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

export interface ChunkInfo {
    x: number;
    y: number;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

export enum CullingMode {
    VIEWPORT = 'viewport',
    CHUNK = 'chunk',
    FOG_OF_WAR = 'fog-of-war'
}

export class ViewportCulling {
    private static readonly CULL_BUFFER_CELLS = 2; // Extra tiles beyond viewport each side
    
    private enabled: boolean = true;
    private cullingMode: CullingMode = CullingMode.VIEWPORT;
    
    // Chunk system properties
    private chunkSize: { width: number; height: number } = { width: 50, height: 50 };
    private currentChunk: { x: number; y: number } = { x: 0, y: 0 };
    
    // Fog-of-war culling properties
    private fogOfWarFocusAreaBuffer: number = 5; // Extra tiles beyond maxTintRadius
    
    constructor() {}
    
    /**
     * Enable or disable viewport culling
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
    
    /**
     * Get current enabled state
     */
    isEnabled(): boolean {
        return this.enabled;
    }
    
    /**
     * Set the culling mode
     */
    setCullingMode(mode: CullingMode): void {
        this.cullingMode = mode;
    }
    
    /**
     * Get current culling mode
     */
    getCullingMode(): CullingMode {
        return this.cullingMode;
    }
    
    /**
     * Enable or disable chunk-based culling (legacy method)
     */
    setChunkBasedCulling(enabled: boolean): void {
        this.cullingMode = enabled ? CullingMode.CHUNK : CullingMode.VIEWPORT;
    }
    
    /**
     * Get current chunk-based culling state (legacy method)
     */
    isChunkBasedCulling(): boolean {
        return this.cullingMode === CullingMode.CHUNK;
    }
    
    /**
     * Set the fog-of-war focus area buffer
     */
    setFogOfWarFocusAreaBuffer(buffer: number): void {
        this.fogOfWarFocusAreaBuffer = Math.max(0, buffer);
    }
    
    /**
     * Get the fog-of-war focus area buffer
     */
    getFogOfWarFocusAreaBuffer(): number {
        return this.fogOfWarFocusAreaBuffer;
    }
    
    /**
     * Set the chunk size (for future multi-chunk support)
     */
    setChunkSize(width: number, height: number): void {
        this.chunkSize = { width, height };
    }
    
    /**
     * Set the current chunk coordinates (for future multi-chunk support)
     */
    setCurrentChunk(chunkX: number, chunkY: number): void {
        this.currentChunk = { x: chunkX, y: chunkY };
    }
    
    /**
     * Calculate culling bounds based on camera viewport, chunk-based visibility, or fog-of-war
     */
    calculateCullingBounds(
        grid: IntGrid,
        camera: Phaser.Cameras.Scene2D.Camera,
        cellSize: number,
        offsetX: number,
        offsetY: number,
        scaleWidth: number,
        scaleHeight: number,
        playerX?: number,
        playerY?: number,
        maxTintRadius?: number
    ): CullingBounds {
        if (!this.enabled) {
            // Return full grid bounds if culling is disabled
            return {
                startX: 0,
                endX: grid.width - 1,
                startY: 0,
                endY: grid.height - 1
            };
        }
        
        switch (this.cullingMode) {
            case CullingMode.CHUNK:
                return this.calculateChunkBasedBounds(grid);
            case CullingMode.FOG_OF_WAR:
                return this.calculateFogOfWarBounds(grid, camera, cellSize, offsetX, offsetY, scaleWidth, scaleHeight, playerX, playerY, maxTintRadius);
            case CullingMode.VIEWPORT:
            default:
                return this.calculateViewportBasedBounds(
                    grid, camera, cellSize, offsetX, offsetY, scaleWidth, scaleHeight
                );
        }
    }
    
    /**
     * Calculate bounds based on current chunk and adjacent chunks
     */
    private calculateChunkBasedBounds(grid: IntGrid): CullingBounds {
        // For now, since we only have one chunk (the entire grid),
        // we show the entire current chunk
        // In the future, this will be expanded to show current chunk + adjacent chunks
        
        const chunkStartX = this.currentChunk.x * this.chunkSize.width;
        const chunkStartY = this.currentChunk.y * this.chunkSize.height;
        
        let startX = Math.max(0, chunkStartX);
        let endX = Math.min(grid.width - 1, chunkStartX + this.chunkSize.width - 1);
        let startY = Math.max(0, chunkStartY);
        let endY = Math.min(grid.height - 1, chunkStartY + this.chunkSize.height - 1);
        
        // Future enhancement: Add adjacent chunks
        // For now, since we have only one chunk that covers the entire grid,
        // we include adjacent chunk areas (which don't exist yet)
        
        return { startX, endX, startY, endY };
    }
    
    /**
     * Calculate bounds based on camera viewport
     */
    private calculateViewportBasedBounds(
        grid: IntGrid,
        camera: Phaser.Cameras.Scene2D.Camera,
        cellSize: number,
        offsetX: number,
        offsetY: number,
        scaleWidth: number,
        scaleHeight: number
    ): CullingBounds {
        const zoom = camera.zoom;
        
        // Convert camera bounds to grid coordinates
        const viewLeft = (camera.scrollX - offsetX) / cellSize;
        const viewRight = ((camera.scrollX + scaleWidth / zoom) - offsetX) / cellSize;
        const viewTop = (camera.scrollY - offsetY) / cellSize;
        const viewBottom = ((camera.scrollY + scaleHeight / zoom) - offsetY) / cellSize;
        
        // Add buffer around visible area (in grid cells)
        const buffer = ViewportCulling.CULL_BUFFER_CELLS;
        const startX = Math.max(0, Math.floor(viewLeft) - buffer);
        const endX = Math.min(grid.width - 1, Math.ceil(viewRight) + buffer);
        const startY = Math.max(0, Math.floor(viewTop) - buffer);
        const endY = Math.min(grid.height - 1, Math.ceil(viewBottom) + buffer);
        
        return { startX, endX, startY, endY };
    }
    
    /**
     * Calculate bounds based on fog-of-war around player position
     */
    private calculateFogOfWarBounds(
        grid: IntGrid,
        camera: Phaser.Cameras.Scene2D.Camera,
        cellSize: number,
        offsetX: number,
        offsetY: number,
        scaleWidth: number,
        scaleHeight: number,
        playerX?: number,
        playerY?: number,
        maxTintRadius?: number
    ): CullingBounds {
        // If player position is not provided, fall back to viewport culling
        if (playerX === undefined || playerY === undefined || maxTintRadius === undefined) {
            return this.calculateViewportBasedBounds(
                grid, camera, cellSize, offsetX, offsetY, scaleWidth, scaleHeight
            );
        }
        
        // Calculate focus area size: maxTintRadius + buffer
        const focusRadius = maxTintRadius + this.fogOfWarFocusAreaBuffer;
        
        // Create culling bounds centered on player
        const startX = Math.max(0, playerX - focusRadius);
        const endX = Math.min(grid.width - 1, playerX + focusRadius);
        const startY = Math.max(0, playerY - focusRadius);
        const endY = Math.min(grid.height - 1, playerY + focusRadius);
        
        return { startX, endX, startY, endY };
    }
    
    /**
     * Get information about the current chunk
     */
    getCurrentChunkInfo(): ChunkInfo {
        const chunkX = this.currentChunk.x;
        const chunkY = this.currentChunk.y;
        const width = this.chunkSize.width;
        const height = this.chunkSize.height;
        
        return {
            x: chunkX,
            y: chunkY,
            width: width,
            height: height,
            offsetX: chunkX * width,
            offsetY: chunkY * height
        };
    }
    
    /**
     * Check if a tile coordinate is within the currently visible chunks
     */
    isTileInVisibleChunks(tileX: number, tileY: number): boolean {
        if (this.cullingMode !== CullingMode.CHUNK) {
            return true; // All tiles are visible when not using chunk-based culling
        }
        
        // Calculate which chunk this tile belongs to
        const tileChunkX = Math.floor(tileX / this.chunkSize.width);
        const tileChunkY = Math.floor(tileY / this.chunkSize.height);
        
        // Check if tile is in current chunk or adjacent chunks
        const currentX = this.currentChunk.x;
        const currentY = this.currentChunk.y;
        
        // For now, only show current chunk since we have only one
        // In future: allow adjacent chunks (currentX ± 1, currentY ± 1)
        return tileChunkX === currentX && tileChunkY === currentY;
    }
}
/**
 * VisibilitySystem
 * ----------------
 * Handles the fog of war and visibility effects around the player.
 * Can be toggled on/off and configured with different settings.
 * Creates a visibility radius where tiles become more tinted the further they are.
 */
export class VisibilitySystem {
    private enabled: boolean = true;         // Toggle fog of war on/off
    private clearRadius: number = 5;        // Tiles within this radius are clear
    private maxTintRadius: number = 8;      // Maximum radius for tinting effect
    private tintIntensity: number = 0.1;    // How strong the fog effect is (0-1)

    /**
     * Enable or disable the fog of war effect
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
     * Set the clear radius (tiles within this radius are completely visible)
     */
    setClearRadius(radius: number): void {
        this.clearRadius = Math.max(0, radius);
    }
    
    /**
     * Get current clear radius
     */
    getClearRadius(): number {
        return this.clearRadius;
    }
    
    /**
     * Set the maximum tint radius (beyond this tiles are completely fogged)
     */
    setMaxTintRadius(radius: number): void {
        this.maxTintRadius = Math.max(this.clearRadius + 1, radius);
    }
    
    /**
     * Get current maximum tint radius
     */
    getMaxTintRadius(): number {
        return this.maxTintRadius;
    }
    
    /**
     * Set the fog intensity (how strong the fog effect is)
     */
    setTintIntensity(intensity: number): void {
        this.tintIntensity = Math.max(0, Math.min(1, intensity));
    }
    
    /**
     * Get current fog intensity
     */
    getTintIntensity(): number {
        return this.tintIntensity;
    }

    /**
     * Calculate the tint intensity for a tile based on its distance from the player
     * @param playerX - Player's X position
     * @param playerY - Player's Y position
     * @param tileX - Tile's X position
     * @param tileY - Tile's Y position
     * @returns Tint intensity from 0 (no tint) to 1 (maximum tint)
     */
    calculateTintIntensity(playerX: number, playerY: number, tileX: number, tileY: number): number {
        if (!this.enabled) {
            return 0; // No fog when disabled
        }

        // Calculate distance using Chebyshev distance (max of dx, dy) for square effect
        const dx = Math.abs(tileX - playerX);
        const dy = Math.abs(tileY - playerY);
        const distance = Math.max(dx, dy);

        // No tint within clear radius
        if (distance <= this.clearRadius) {
            return 0;
        }

        // Fully tint (completely cover) beyond max radius
        if (distance > this.maxTintRadius) {
            return 1; // 1 means fully tinted, covers the tile color completely
        }

        // Gradual tint between clear radius and max radius
        const tintRange = this.maxTintRadius - this.clearRadius;
        const distanceInTintRange = distance - this.clearRadius;
        const normalizedDistance = distanceInTintRange / tintRange;
        return normalizedDistance * this.tintIntensity;
    }

    /**
     * Apply red tint to a color based on intensity
     * @param originalColor - The original color (hex)
     * @param tintIntensity - Tint intensity from 0 to 1
     * @returns Tinted color (hex)
     */
    applyRedTint(originalColor: number, tintIntensity: number): number {
        if (tintIntensity <= 0) {
            return originalColor;
        }

        // Extract RGB components
        const r = (originalColor >> 16) & 0xFF;
        const g = (originalColor >> 8) & 0xFF;
        const b = originalColor & 0xFF;

        // Apply red tint by reducing green and blue components
        const tintedR = Math.min(255, r + (255 - r) * tintIntensity * 0.3);
        const tintedG = Math.max(0, g - g * tintIntensity * 0.6);
        const tintedB = Math.max(0, b - b * tintIntensity * 0.6);

        // Combine back to hex
        return (Math.floor(tintedR) << 16) | (Math.floor(tintedG) << 8) | Math.floor(tintedB);
    }

    /**
     * Check if a tile should be affected by the visibility system
     * @param playerX - Player's X position
     * @param playerY - Player's Y position
     * @param tileX - Tile's X position
     * @param tileY - Tile's Y position
     * @returns True if the tile is within the visibility radius
     */
    isWithinVisibilityRadius(playerX: number, playerY: number, tileX: number, tileY: number): boolean {
        if (!this.enabled) {
            return false; // No visibility effects when disabled
        }
        
        const dx = Math.abs(tileX - playerX);
        const dy = Math.abs(tileY - playerY);
        const distance = Math.max(dx, dy);
        return distance <= this.maxTintRadius;
    }
}
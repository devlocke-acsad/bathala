import { Scene } from 'phaser';

/**
 * Overworld_FogOfWarManager
 * 
 * Manages fog of war visibility system for the Overworld scene.
 * Features:
 * - Pixel-based gradient visibility (stepped, not smooth)
 * - Positioned below HUDs but above map/NPCs
 * - Purely visual effect
 * - Easily configurable visibility parameters
 * 
 * Design: Creates a dynamic fog overlay that reveals areas as the player explores
 */
export class Overworld_FogOfWarManager {
  private scene: Scene;
  private fogContainer: Phaser.GameObjects.Container;
  private fogGraphics: Phaser.GameObjects.Graphics;
  private revealedAreas: Set<string> = new Set();
  
  // === EDITABLE VISIBILITY PARAMETERS ===
  
  /** Size of each fog tile in pixels (pixel-based grid) */
  public tileSize: number = 32;
  
  /** How far the player can see (in tiles) */
  public visibilityRadius: number = 8;
  
  /** Number of gradient steps from visible to fog (pixel-stepped gradient) */
  public gradientSteps: number = 4;
  
  /** Base fog color (RGB) */
  public fogColor: number = 0x000000;
  
  /** Maximum fog opacity (0-1) */
  public maxFogOpacity: number = 0.85;
  
  /** Minimum fog opacity at visible edge (0-1) */
  public minFogOpacity: number = 0.0;
  
  /** Whether fog persists (false = fog returns when player leaves) */
  public persistentFog: boolean = true;
  
  /** Depth layer (below HUDs, above map) */
  public fogDepth: number = 500;
  
  /** Update frequency in milliseconds */
  public updateInterval: number = 100;
  
  // === END EDITABLE PARAMETERS ===
  
  private lastUpdateTime: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   */
  constructor(scene: Scene) {
    this.scene = scene;
    console.log('🌫️ FogOfWarManager initialized');
  }

  /**
   * Initialize the fog of war system
   * @param playerX - Initial player X position
   * @param playerY - Initial player Y position
   */
  initialize(playerX: number, playerY: number): void {
    this.playerX = playerX;
    this.playerY = playerY;
    
    // Create container for fog
    this.fogContainer = this.scene.add.container(0, 0);
    this.fogContainer.setDepth(this.fogDepth);
    this.fogContainer.setScrollFactor(0, 0); // Fixed to camera
    
    // Create graphics for fog rendering
    this.fogGraphics = this.scene.add.graphics();
    this.fogContainer.add(this.fogGraphics);
    
    // Initial fog render
    this.renderFog();
    
    console.log('✅ FogOfWarManager: Fog of war initialized');
  }

  /**
   * Update fog of war based on player position
   * @param playerX - Current player X position
   * @param playerY - Current player Y position
   * @param forceUpdate - Force update regardless of interval
   */
  update(playerX: number, playerY: number, forceUpdate: boolean = false): void {
    const currentTime = Date.now();
    
    // Throttle updates based on updateInterval
    if (!forceUpdate && currentTime - this.lastUpdateTime < this.updateInterval) {
      return;
    }
    
    this.lastUpdateTime = currentTime;
    this.playerX = playerX;
    this.playerY = playerY;
    
    // Reveal areas around player
    this.revealAreasAroundPlayer();
    
    // Re-render fog
    this.renderFog();
  }

  /**
   * Reveal areas around the player's current position
   */
  private revealAreasAroundPlayer(): void {
    const playerTileX = Math.floor(this.playerX / this.tileSize);
    const playerTileY = Math.floor(this.playerY / this.tileSize);
    
    // Reveal tiles within visibility radius
    for (let dy = -this.visibilityRadius; dy <= this.visibilityRadius; dy++) {
      for (let dx = -this.visibilityRadius; dx <= this.visibilityRadius; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;
        
        // Calculate distance from player (in tiles)
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only reveal tiles within circular radius
        if (distance <= this.visibilityRadius) {
          const key = `${tileX},${tileY}`;
          this.revealedAreas.add(key);
        }
      }
    }
  }

  /**
   * Render the fog of war overlay
   */
  private renderFog(): void {
    if (!this.fogGraphics) return;
    
    this.fogGraphics.clear();
    
    const camera = this.scene.cameras.main;
    const screenWidth = camera.width;
    const screenHeight = camera.height;
    const cameraX = camera.scrollX;
    const cameraY = camera.scrollY;
    
    // Calculate tile range to render (only render visible tiles)
    const startTileX = Math.floor(cameraX / this.tileSize) - 1;
    const endTileX = Math.ceil((cameraX + screenWidth) / this.tileSize) + 1;
    const startTileY = Math.floor(cameraY / this.tileSize) - 1;
    const endTileY = Math.ceil((cameraY + screenHeight) / this.tileSize) + 1;
    
    const playerTileX = Math.floor(this.playerX / this.tileSize);
    const playerTileY = Math.floor(this.playerY / this.tileSize);
    
    // Render fog tiles
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      for (let tileX = startTileX; tileX <= endTileX; tileX++) {
        const key = `${tileX},${tileY}`;
        const isRevealed = this.revealedAreas.has(key);
        
        // Calculate distance from player
        const dx = tileX - playerTileX;
        const dy = tileY - playerTileY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Determine fog opacity based on distance and revealed status
        let opacity = this.maxFogOpacity;
        
        if (this.persistentFog) {
          // Persistent fog: once revealed, stays revealed
          if (isRevealed) {
            // Apply gradient based on current distance from player
            opacity = this.calculatePixelGradientOpacity(distance);
          } else {
            // Not yet revealed - full fog
            opacity = this.maxFogOpacity;
          }
        } else {
          // Non-persistent fog: fog returns when player leaves
          opacity = this.calculatePixelGradientOpacity(distance);
        }
        
        // Only render if there's fog to show
        if (opacity > 0.01) {
          const worldX = tileX * this.tileSize - cameraX;
          const worldY = tileY * this.tileSize - cameraY;
          
          this.fogGraphics.fillStyle(this.fogColor, opacity);
          this.fogGraphics.fillRect(worldX, worldY, this.tileSize, this.tileSize);
        }
      }
    }
  }

  /**
   * Calculate pixel-stepped gradient opacity based on distance
   * @param distance - Distance from player in tiles
   * @returns Opacity value (0-1)
   */
  private calculatePixelGradientOpacity(distance: number): number {
    // If within visibility radius, calculate stepped gradient
    if (distance <= this.visibilityRadius) {
      // Calculate which gradient step this distance falls into
      const normalizedDistance = distance / this.visibilityRadius; // 0 to 1
      const stepSize = 1 / this.gradientSteps;
      const step = Math.floor(normalizedDistance / stepSize);
      
      // Calculate opacity for this step (pixel-stepped, not smooth)
      const stepOpacity = (step / this.gradientSteps) * (this.maxFogOpacity - this.minFogOpacity) + this.minFogOpacity;
      
      return stepOpacity;
    }
    
    // Beyond visibility radius - full fog
    return this.maxFogOpacity;
  }

  /**
   * Clear all revealed areas (reset fog)
   */
  clearRevealedAreas(): void {
    this.revealedAreas.clear();
    this.renderFog();
    console.log('🌫️ FogOfWarManager: Revealed areas cleared');
  }

  /**
   * Set fog visibility parameters
   * @param params - Object containing fog parameters to update
   */
  setFogParameters(params: {
    tileSize?: number;
    visibilityRadius?: number;
    gradientSteps?: number;
    fogColor?: number;
    maxFogOpacity?: number;
    minFogOpacity?: number;
    persistentFog?: boolean;
    fogDepth?: number;
    updateInterval?: number;
  }): void {
    if (params.tileSize !== undefined) this.tileSize = params.tileSize;
    if (params.visibilityRadius !== undefined) this.visibilityRadius = params.visibilityRadius;
    if (params.gradientSteps !== undefined) this.gradientSteps = params.gradientSteps;
    if (params.fogColor !== undefined) this.fogColor = params.fogColor;
    if (params.maxFogOpacity !== undefined) this.maxFogOpacity = params.maxFogOpacity;
    if (params.minFogOpacity !== undefined) this.minFogOpacity = params.minFogOpacity;
    if (params.persistentFog !== undefined) this.persistentFog = params.persistentFog;
    if (params.fogDepth !== undefined) {
      this.fogDepth = params.fogDepth;
      if (this.fogContainer) {
        this.fogContainer.setDepth(this.fogDepth);
      }
    }
    if (params.updateInterval !== undefined) this.updateInterval = params.updateInterval;
    
    // Re-render with new parameters
    this.renderFog();
    
    console.log('🌫️ FogOfWarManager: Parameters updated', params);
  }

  /**
   * Get current fog parameters
   * @returns Object containing current fog parameters
   */
  getFogParameters(): {
    tileSize: number;
    visibilityRadius: number;
    gradientSteps: number;
    fogColor: number;
    maxFogOpacity: number;
    minFogOpacity: number;
    persistentFog: boolean;
    fogDepth: number;
    updateInterval: number;
  } {
    return {
      tileSize: this.tileSize,
      visibilityRadius: this.visibilityRadius,
      gradientSteps: this.gradientSteps,
      fogColor: this.fogColor,
      maxFogOpacity: this.maxFogOpacity,
      minFogOpacity: this.minFogOpacity,
      persistentFog: this.persistentFog,
      fogDepth: this.fogDepth,
      updateInterval: this.updateInterval
    };
  }

  /**
   * Enable or disable fog of war
   * @param enabled - Whether fog should be visible
   */
  setEnabled(enabled: boolean): void {
    if (this.fogContainer) {
      this.fogContainer.setVisible(enabled);
    }
  }

  /**
   * Check if a tile is revealed
   * @param tileX - Tile X coordinate
   * @param tileY - Tile Y coordinate
   * @returns True if tile is revealed
   */
  isTileRevealed(tileX: number, tileY: number): boolean {
    const key = `${tileX},${tileY}`;
    return this.revealedAreas.has(key);
  }

  /**
   * Manually reveal a specific area
   * @param centerX - World X coordinate
   * @param centerY - World Y coordinate
   * @param radius - Radius in tiles to reveal
   */
  revealArea(centerX: number, centerY: number, radius: number): void {
    const centerTileX = Math.floor(centerX / this.tileSize);
    const centerTileY = Math.floor(centerY / this.tileSize);
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const key = `${centerTileX + dx},${centerTileY + dy}`;
          this.revealedAreas.add(key);
        }
      }
    }
    
    this.renderFog();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.fogGraphics) {
      this.fogGraphics.destroy();
    }
    if (this.fogContainer) {
      this.fogContainer.destroy();
    }
    this.revealedAreas.clear();
    
    console.log('🌫️ FogOfWarManager cleanup');
  }
}

import { Scene } from 'phaser';

/**
 * FogOfWarSystem
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
export class FogOfWarSystem {
  private scene: Scene;
  private fogContainer: Phaser.GameObjects.Container;
  private fogGraphics: Phaser.GameObjects.Graphics;
  private revealedAreas: Set<string> = new Set();
  
  // === EDITABLE VISIBILITY PARAMETERS ===
  
  /** Size of each fog tile in pixels (pixel-based grid) */
  public tileSize: number = 32;
  
  /** Night fog - How far the player can see at night (in tiles) */
  public nightVisibilityRadius: number = 8;
  
  /** Day fog - How far the player can see during day (in tiles) - 1.4x night fog */
  public dayVisibilityRadius: number = 11;
  
  /** Current visibility radius (dynamically updated based on day/night) */
  private currentVisibilityRadius: number = 8;
  
  /** Transition duration for day/night fog changes (in milliseconds) */
  public transitionDuration: number = 2000;
  
  /** Camera zoom during day (less zoomed in - larger fog area) */
  public dayCameraZoom: number = 1.0;
  
  /** Camera zoom at night (more zoomed in - smaller fog area) */
  public nightCameraZoom: number = 1.3;
  
  /** Number of gradient steps from visible to fog (pixel-stepped gradient) */
  public gradientSteps: number = 4;
  
  /** Base fog color (RGB) - Dark reddish brown #150E10 */
  public fogColor: number = 0x150E10;
  
  /** Maximum fog opacity (0-1) */
  public maxFogOpacity: number = 0.85;
  
  /** Minimum fog opacity at visible edge (0-1) */
  public minFogOpacity: number = 0.0;
  
  /** Red highlight color for fog edges */
  public edgeHighlightColor: number = 0xff0000;
  
  /** Red highlight opacity at fog edges */
  public edgeHighlightOpacity: number =1;
  
  /** Whether fog persists (false = fog returns when player leaves) */
  public persistentFog: boolean = true;
  
  /** Depth layer (above map tiles, below NPCs and all UI) */
  public fogDepth: number = 50;
  
  /** Update frequency in milliseconds */
  public updateInterval: number = 100;
  
  // === END EDITABLE PARAMETERS ===
  
  private lastUpdateTime: number = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private isDay: boolean = true;
  private transitionTween: Phaser.Tweens.Tween | null = null;
  private transitionStartRadius: number = 8;
  private transitionTargetRadius: number = 8;

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   */
  constructor(scene: Scene) {
    this.scene = scene;
    console.log('🌫️ FogOfWarSystem initialized');
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
    this.fogContainer.setScrollFactor(1, 1); // Follow world coordinates, not camera
    
    // Create graphics for fog rendering
    this.fogGraphics = this.scene.add.graphics();
    this.fogContainer.add(this.fogGraphics);
    
    // Initial fog render
    this.renderFog();
    
    console.log('✅ FogOfWarSystem: Fog of war initialized');
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
    for (let dy = -this.currentVisibilityRadius; dy <= this.currentVisibilityRadius; dy++) {
      for (let dx = -this.currentVisibilityRadius; dx <= this.currentVisibilityRadius; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;
        
        // Calculate distance from player (in tiles)
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only reveal tiles within circular radius
        if (distance <= this.currentVisibilityRadius) {
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
        
        // Render fog or edge highlight using world coordinates
        const worldX = tileX * this.tileSize;
        const worldY = tileY * this.tileSize;
        
        // Check if tile is beyond visibility radius
        if (distance > this.currentVisibilityRadius) {
          // Completely black fog - hide everything beyond vision
          this.fogGraphics.fillStyle(this.fogColor, 1.0);
          this.fogGraphics.fillRect(worldX, worldY, this.tileSize, this.tileSize);
        } else if (opacity > 0.01) {
          // Gradient fog within visibility
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
    if (distance <= this.currentVisibilityRadius) {
      // Calculate which gradient step this distance falls into
      const normalizedDistance = distance / this.currentVisibilityRadius; // 0 to 1
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
    console.log('🌫️ FogOfWarSystem: Revealed areas cleared');
  }

  /**
   * Set fog visibility parameters
   * @param params - Object containing fog parameters to update
   */
  setFogParameters(params: {
    tileSize?: number;
    nightVisibilityRadius?: number;
    dayVisibilityRadius?: number;
    gradientSteps?: number;
    fogColor?: number;
    maxFogOpacity?: number;
    minFogOpacity?: number;
    edgeHighlightColor?: number;
    edgeHighlightOpacity?: number;
    persistentFog?: boolean;
    fogDepth?: number;
    updateInterval?: number;
  }): void {
    if (params.tileSize !== undefined) this.tileSize = params.tileSize;
    if (params.nightVisibilityRadius !== undefined) this.nightVisibilityRadius = params.nightVisibilityRadius;
    if (params.dayVisibilityRadius !== undefined) this.dayVisibilityRadius = params.dayVisibilityRadius;
    if (params.gradientSteps !== undefined) this.gradientSteps = params.gradientSteps;
    if (params.fogColor !== undefined) this.fogColor = params.fogColor;
    if (params.maxFogOpacity !== undefined) this.maxFogOpacity = params.maxFogOpacity;
    if (params.minFogOpacity !== undefined) this.minFogOpacity = params.minFogOpacity;
    if (params.edgeHighlightColor !== undefined) this.edgeHighlightColor = params.edgeHighlightColor;
    if (params.edgeHighlightOpacity !== undefined) this.edgeHighlightOpacity = params.edgeHighlightOpacity;
    if (params.persistentFog !== undefined) this.persistentFog = params.persistentFog;
    if (params.fogDepth !== undefined) {
      this.fogDepth = params.fogDepth;
      if (this.fogContainer) {
        this.fogContainer.setDepth(this.fogDepth);
      }
    }
    if (params.updateInterval !== undefined) this.updateInterval = params.updateInterval;
    
    // Update current visibility based on day/night state
    this.currentVisibilityRadius = this.isDay ? this.dayVisibilityRadius : this.nightVisibilityRadius;
    
    // Re-render with new parameters
    this.renderFog();
    
    console.log('🌫️ FogOfWarSystem: Parameters updated', params);
  }

  /**
   * Get current fog parameters
   * @returns Object containing current fog parameters
   */
  getFogParameters(): {
    tileSize: number;
    nightVisibilityRadius: number;
    dayVisibilityRadius: number;
    currentVisibilityRadius: number;
    gradientSteps: number;
    fogColor: number;
    maxFogOpacity: number;
    minFogOpacity: number;
    edgeHighlightColor: number;
    edgeHighlightOpacity: number;
    persistentFog: boolean;
    fogDepth: number;
    updateInterval: number;
    isDay: boolean;
  } {
    return {
      tileSize: this.tileSize,
      nightVisibilityRadius: this.nightVisibilityRadius,
      dayVisibilityRadius: this.dayVisibilityRadius,
      currentVisibilityRadius: this.currentVisibilityRadius,
      gradientSteps: this.gradientSteps,
      fogColor: this.fogColor,
      maxFogOpacity: this.maxFogOpacity,
      minFogOpacity: this.minFogOpacity,
      edgeHighlightColor: this.edgeHighlightColor,
      edgeHighlightOpacity: this.edgeHighlightOpacity,
      persistentFog: this.persistentFog,
      fogDepth: this.fogDepth,
      updateInterval: this.updateInterval,
      isDay: this.isDay
    };
  }

  /**
   * Update fog based on day/night cycle with smooth transition
   * @param isDay - Whether it's currently day time
   */
  updateDayNight(isDay: boolean): void {
    // Only update if state changed
    if (this.isDay !== isDay) {
      this.isDay = isDay;
      const targetRadius = isDay ? this.dayVisibilityRadius : this.nightVisibilityRadius;
      const targetZoom = isDay ? this.dayCameraZoom : this.nightCameraZoom;
      
      // Cancel any existing transition
      if (this.transitionTween) {
        this.transitionTween.stop();
        this.transitionTween = null;
      }
      
      // Store transition values
      this.transitionStartRadius = this.currentVisibilityRadius;
      this.transitionTargetRadius = targetRadius;
      
      // Get current camera zoom
      const camera = this.scene.cameras.main;
      const startZoom = camera.zoom;
      
      // Create smooth transition tween
      const transitionObject = { progress: 0 };
      this.transitionTween = this.scene.tweens.add({
        targets: transitionObject,
        progress: 1,
        duration: this.transitionDuration,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          // Interpolate between start and target radius
          this.currentVisibilityRadius = this.transitionStartRadius + 
            (this.transitionTargetRadius - this.transitionStartRadius) * transitionObject.progress;
          
          // Interpolate camera zoom
          const currentZoom = startZoom + (targetZoom - startZoom) * transitionObject.progress;
          camera.setZoom(currentZoom);
          
          // Update UI scale to compensate for zoom (keep UI at original size)
          this.updateUIScale(currentZoom);
          
          // Re-render fog with interpolated visibility radius
          this.renderFog();
        },
        onComplete: () => {
          // Ensure we end at exact target radius and zoom
          this.currentVisibilityRadius = targetRadius;
          camera.setZoom(targetZoom);
          this.updateUIScale(targetZoom);
          this.renderFog();
          this.transitionTween = null;
          
          console.log(`🌫️ FogOfWarSystem: ${isDay ? 'Day' : 'Night'} fog transition complete (radius: ${this.currentVisibilityRadius}, zoom: ${targetZoom})`);
        }
      });
      
      console.log(`🌫️ FogOfWarSystem: Starting ${isDay ? 'Day' : 'Night'} fog transition (${this.transitionStartRadius} → ${targetRadius}, zoom: ${startZoom} → ${targetZoom})`);
    }
  }

  /**
   * Update UI scale to compensate for camera zoom
   * This keeps UI elements at their original size and position regardless of zoom
   */
  private updateUIScale(cameraZoom: number): void {
    // Get the Overworld scene
    const overworldScene = this.scene as any;
    
    // Inverse scale factor to compensate for zoom
    const uiScale = 1 / cameraZoom;
    
    // Get camera dimensions
    const camera = this.scene.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Calculate position offset to keep UI in place
    // When zoomed in, UI needs to be repositioned to stay at screen edges
    const offsetX = (cameraWidth * (cameraZoom - 1)) / (2 * cameraZoom);
    const offsetY = (cameraHeight * (cameraZoom - 1)) / (2 * cameraZoom);
    
    // Scale and reposition UI container (left panel)
    if (overworldScene.uiContainer) {
      overworldScene.uiContainer.setScale(uiScale);
      overworldScene.uiContainer.setPosition(offsetX, offsetY);
    }
    
    // Day/night progress bar container - scale, center horizontally, and shift down
    if (overworldScene.dayNightProgressContainer) {
      overworldScene.dayNightProgressContainer.setScale(uiScale);
      // Horizontal: center the scaled container
      const progressBarCenterOffset = (cameraWidth * (1 - uiScale)) / 2;
      // Vertical: shift down to stay at top
      overworldScene.dayNightProgressContainer.setPosition(progressBarCenterOffset, offsetY);
      
      // Update indicator position within the container
      if (overworldScene.dayNightIndicator) {
        const progressBarWidth = cameraWidth * 0.6;
        const progressBarX = (cameraWidth - progressBarWidth) / 2;
        const progressBarY = 80;
        const totalProgress = Math.min(overworldScene.gameState.actionsTaken / overworldScene.gameState.totalActionsUntilBoss, 1);
        overworldScene.dayNightIndicator.x = progressBarX + (progressBarWidth * totalProgress);
        overworldScene.dayNightIndicator.y = progressBarY + 25;
      }
    }
    
    // Boss text (top left)
    if (overworldScene.bossText) {
      overworldScene.bossText.setScale(uiScale);
      overworldScene.bossText.setPosition(10 + offsetX, 40 + offsetY);
    }
    
    // Toggle button (top right)
    if (overworldScene.toggleButton) {
      overworldScene.toggleButton.setScale(uiScale);
      const toggleX = cameraWidth - 60 - offsetX;
      const toggleY = 50 + offsetY;
      overworldScene.toggleButton.setPosition(toggleX, toggleY);
    }
    
    // Test buttons container
    if (overworldScene.testButtonsContainer) {
      overworldScene.testButtonsContainer.setScale(uiScale);
    }
    
    // Action buttons are in the test container, so they inherit positioning
    if (overworldScene.actionButtons) {
      overworldScene.actionButtons.forEach((button: any) => {
        button.setScale(uiScale);
      });
    }
    
    // Note: Chapter indicator is now part of uiContainer, so it's automatically handled
    // Note: Tooltip handles its own zoom compensation in updateTooltipContent
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
    
    console.log('🌫️ FogOfWarSystem cleanup');
  }
}

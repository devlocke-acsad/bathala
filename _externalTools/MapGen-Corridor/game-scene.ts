import * as Phaser from 'phaser';
import { HeIsComingGenerator } from './map-generation/level-generator';
import { IntGrid } from './map-generation/data-structures';
import { OuterTileMarker } from './map-generation/outer-tile-marker';
import { Player } from './user-movement/player';
import { VisibilitySystem } from './user-movement/visibility-system';
import { GameUI } from './game-UI';
import { ViewportCulling, CullingMode } from './viewport-culling';

/*
    GameScene
    ---------
    Bridges Phaser's rendering loop with the procedural generator.

    Responsibilities:
        - Hold instance of HeIsComingGenerator and invoke generation on demand.
        - Render IntGrid as a colored tile map (simple rectangle fills per cell).
        - Provide basic camera interaction (zoom via wheel, pan via drag) and optional
            viewport culling to skip drawing off-screen tiles for perf.
        - Expose public methods triggered by UI (onGenerateButtonClick, onCullingToggle).

    High-level flow when user generates a level:
        main.ts click handler -> gameScene.onGenerateButtonClick() -> generateLevel()
        -> generator.generateLayout() -> currentGrid set -> drawGrid().

    Key fields:
        generator        : Procedural layout builder.
        currentGrid      : Latest generated IntGrid (null before first generation).
        graphics         : Phaser Graphics object used for immediate-mode drawing.
        cellSize         : Pixel size per grid cell (uniform square cells).
        drawThrottleMs   : Controls max redraw rate during drag to reduce overhead.
        useViewportCulling: Toggle for partial draw optimization.
*/

export class GameScene extends Phaser.Scene {
    // =============================
    // Tunable Rendering Constants
    // =============================
    private static readonly DEFAULT_CELL_SIZE = 12;        // Pixels per tile.
    private static readonly DRAG_REDRAW_THROTTLE_MS = 16;  // ~60 FPS.
    private static readonly WHEEL_ZOOM_FACTOR = 0.001;     // Scale wheel delta.
    private static readonly MIN_ZOOM = 0.1;
    private static readonly MAX_ZOOM = 3;
    private static readonly CAMERA_PADDING = 100;          // Extra world bounds padding around grid.
    private static readonly DEFAULT_WIDTH = 50;
    private static readonly DEFAULT_HEIGHT = 50;
    private static readonly DEFAULT_REGIONS = 0; // 0 means auto-calculate as width*height
    private static readonly DEFAULT_MIN_REGION_DIST = 3;
    private static readonly COLOR_PATH = 0x90EE90;
    private static readonly COLOR_PATH_OUTSIDE = 0x228B22; // Darker green for outside intersections
    private static readonly COLOR_REGION = 0x8B4513;
    private static readonly COLOR_REGION_CENTER = 0xFF0000;
    private static readonly COLOR_EMPTY = 0xF0F0F0;
    private static readonly STROKE_COLOR = 0xCCCCCC;
    private static readonly STROKE_ALPHA = 0.3;

    private generator: HeIsComingGenerator;
    private currentGrid: IntGrid | null = null;
    private graphics!: Phaser.GameObjects.Graphics;
    private cellSize: number = GameScene.DEFAULT_CELL_SIZE;                 // Pixels per grid cell.
    private lastDrawTime: number = 0;
    private drawThrottleMs: number = GameScene.DRAG_REDRAW_THROTTLE_MS;            // ~60 FPS pacing for drag redraw.
    
    // Viewport culling system
    private viewportCulling: ViewportCulling;
    
    // Player movement system
    private player: Player | null = null;
    private visibilitySystem: VisibilitySystem;
    private ui: GameUI;

    constructor() {
        super({ key: 'GameScene' });
        this.generator = new HeIsComingGenerator();
        this.visibilitySystem = new VisibilitySystem();
        this.ui = new GameUI();
        this.viewportCulling = new ViewportCulling();
    }

    create(): void {
        // Single graphics layer reused each draw (cleared & redrawn).
        this.graphics = this.add.graphics();

        // Neutral initial zoom (1 = 1:1 pixel per world unit).
        this.cameras.main.setZoom(1);
        
        // Wheel zoom: adjust zoom, clamp range, request redraw.
        // Disabled when fog-of-war culling is active to maintain proper focus area zoom
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
            if (this.viewportCulling.getCullingMode() !== CullingMode.FOG_OF_WAR) {
                const zoom = this.cameras.main.zoom;
                const newZoom = Phaser.Math.Clamp(
                    zoom - deltaY * GameScene.WHEEL_ZOOM_FACTOR,
                    GameScene.MIN_ZOOM,
                    GameScene.MAX_ZOOM
                );
                this.cameras.main.setZoom(newZoom);
                this.drawGrid();
            }
        });

        // Left mouse drag -> camera pan (pointermove registered only while pressed).
        // Disabled when fog-of-war culling is active to keep camera centered on player
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown() && this.viewportCulling.getCullingMode() !== CullingMode.FOG_OF_WAR) {
                this.input.on('pointermove', this.handleCameraDrag, this);
            }
        });

        this.input.on('pointerup', () => {
            this.input.off('pointermove', this.handleCameraDrag, this);
            this.drawGrid(); // Ensure final crisp frame after drag.
        });

        // First automatic generation so user sees content immediately.
        this.generateLevel(
            GameScene.DEFAULT_WIDTH,
            GameScene.DEFAULT_HEIGHT,
            GameScene.DEFAULT_REGIONS,
            GameScene.DEFAULT_MIN_REGION_DIST
        );
    }

    update(): void {
        // Update player movement
        if (this.player && this.player.update()) {
            // Player moved, redraw to update visibility effects
            this.drawGrid();
        }
        
        // Always center camera on player when fog-of-war culling is active
        if (this.player && this.viewportCulling.getCullingMode() === CullingMode.FOG_OF_WAR && this.currentGrid) {
            const width = this.currentGrid.width;
            const height = this.currentGrid.height;
            const offsetX = (this.scale.width - width * this.cellSize) / 2;
            const offsetY = (this.scale.height - height * this.cellSize) / 2;
            this.focusCameraOnPlayer(offsetX, offsetY, height);
        }
    }

    /**
     * Translate camera by pointer delta (scaled by current zoom so drag feels consistent).
     * Uses simple throttling to avoid re-rendering more often than drawThrottleMs during drag.
     */
    private handleCameraDrag(pointer: Phaser.Input.Pointer): void {
        if (pointer.isDown) {
            const deltaX = pointer.x - pointer.prevPosition.x;
            const deltaY = pointer.y - pointer.prevPosition.y;
            
            this.cameras.main.scrollX -= deltaX / this.cameras.main.zoom;
            this.cameras.main.scrollY -= deltaY / this.cameras.main.zoom;
            
            // Throttled redraw during drag for better performance
            const now = Date.now();
            if (now - this.lastDrawTime > this.drawThrottleMs) {
                this.drawGrid();
                this.lastDrawTime = now;
            }
        }
    }

    /**
     * Generate a new procedural layout and render it.
     *
     * Parameters (all have defaults so UI calls can omit some values):
     *  - width: horizontal tile count of the level grid.
     *  - height: vertical tile count of the level grid.
     *  - regions: number of region seed points to scatter prior to triangulation.
     *  - minDistance: enforced minimum Manhattan (or near) spacing between region seeds
     *      to reduce clustering and encourage coverage.
     *
     * Side Effects:
     *  - Mutates generator settings (levelSize, regionCount, minRegionDistance).
     *  - Replaces currentGrid with a freshly generated `IntGrid`.
     *  - Triggers a redraw (drawGrid) and updates UI info text.
     *  - On error, logs to console and displays a temporary user-facing message.
     */
    generateLevel(
        width: number = GameScene.DEFAULT_WIDTH,
        height: number = GameScene.DEFAULT_HEIGHT,
        regions: number = GameScene.DEFAULT_REGIONS,
        minDistance: number = GameScene.DEFAULT_MIN_REGION_DIST
    ): void {
        try {
            // Auto-calculate regions if set to 0 (double the max of width/height)
            const finalRegions = regions === 0 ? Math.max(width, height) * 2 : regions;
            
            // Update generator settings
            this.generator.levelSize = [width, height];
            this.generator.regionCount = finalRegions;
            this.generator.minRegionDistance = minDistance;

            // Generate the grid
            this.currentGrid = this.generator.generateLayout();

            // Create/respawn player
            this.createPlayer();

            // Draw the grid
            this.drawGrid();

            // Update info display
            this.updateInfoDisplay();

        } catch (error) {
            console.error('Error generating level:', error);
            this.showError('Failed to generate level. Please try different settings.');
        }
    }

    /**
     * Render currentGrid onto the graphics layer.
     * Steps:
     *   1. Compute center offset so grid is visually centered.
     *   2. Optionally compute culling bounds based on camera viewport.
     *   3. Iterate visible tiles and draw filled rectangles with outline.
     *   4. Update performance stats + expand camera bounds for smoother panning.
     */
    private drawGrid(): void {
        if (!this.currentGrid) return;

        this.graphics.clear();

        const width = this.currentGrid.width;
        const height = this.currentGrid.height;

    // Center the grid in the view (keeps smaller grids aesthetically placed).
        const offsetX = (this.scale.width - width * this.cellSize) / 2;
        const offsetY = (this.scale.height - height * this.cellSize) / 2;

        // Calculate culling bounds using the viewport culling system
        const cullingBounds = this.viewportCulling.calculateCullingBounds(
            this.currentGrid,
            this.cameras.main,
            this.cellSize,
            offsetX,
            offsetY,
            this.scale.width,
            this.scale.height,
            this.player?.x,
            this.player?.y,
            this.visibilitySystem.getMaxTintRadius()
        );
        
        // Handle fog-of-war culling camera focusing
        if (this.viewportCulling.getCullingMode() === CullingMode.FOG_OF_WAR && this.player) {
            this.focusCameraOnPlayer(offsetX, offsetY, height);
        }
        
        const startX = cullingBounds.startX;
        const endX = cullingBounds.endX;
        const startY = cullingBounds.startY;
        const endY = cullingBounds.endY;

        // Only draw visible tiles
        let tilesRendered = 0;
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                // Convert logical grid Y to screen Y (flip so y increases upwards visually).
                const screenY = (height - 1 - y) * this.cellSize + offsetY;
                const screenX = x * this.cellSize + offsetX;

                const tileType = this.currentGrid.getTile(x, y);

                // Color key (match with generator tile constants).
                let color: number;
                if (tileType === this.generator.PATH_TILE) {
                    // Check if this is an outside intersection or corner
                    if (OuterTileMarker.isOutsideIntersectionOrCorner(x, y, this.currentGrid, this.generator.PATH_TILE)) {
                        color = GameScene.COLOR_PATH_OUTSIDE; // Darker green for outside intersections/corners
                    } else {
                        color = GameScene.COLOR_PATH; // Light green for normal paths
                    }
                } else if (tileType === this.generator.REGION_TILE) {
                    color = GameScene.COLOR_REGION; // Brown for regions
                } else if (tileType === this.generator.REGION_CENTER_TILE) {
                    color = GameScene.COLOR_REGION_CENTER; // Red for region centers
                } else {
                    color = GameScene.COLOR_EMPTY; // Light gray for empty
                }

                // Apply visibility tinting if player exists
                if (this.player) {
                    const tintIntensity = this.visibilitySystem.calculateTintIntensity(this.player.x, this.player.y, x, y);
                    color = this.visibilitySystem.applyRedTint(color, tintIntensity);
                }

                // Filled rect (solid tile body)
                this.graphics.fillStyle(color);
                this.graphics.fillRect(screenX, screenY, this.cellSize, this.cellSize);

                // Subtle border to aid visual parsing of shapes.
                this.graphics.lineStyle(1, GameScene.STROKE_COLOR, GameScene.STROKE_ALPHA);
                this.graphics.strokeRect(screenX, screenY, this.cellSize, this.cellSize);
                
                tilesRendered++;
            }
        }

        // Update performance info
        this.updatePerformanceInfo(tilesRendered, width * height);

        // Draw player if it exists
        if (this.player) {
            this.drawPlayer(offsetX, offsetY, height);
        }

        // Expand camera bounds around grid with padding to allow some panning freedom.
        const gridWidth = width * this.cellSize;
        const gridHeight = height * this.cellSize;
        const pad = GameScene.CAMERA_PADDING;
        this.cameras.main.setBounds(offsetX - pad, offsetY - pad, gridWidth + pad * 2, gridHeight + pad * 2);
    }

    /** Display simple connection count summary (called after generation). */
    private updateInfoDisplay(): void {
        if (this.generator.edges) {
            this.ui.updateInfo(`Generated ${this.generator.edges.length} connections between regions`);
        }
    }

    /** Update render diagnostics (visible vs total tiles). */
    private updatePerformanceInfo(tilesRendered: number, totalTiles: number): void {
        if (this.generator.edges) {
            const percentage = ((tilesRendered / totalTiles) * 100).toFixed(1);
            this.ui.updateInfo(`Generated ${this.generator.edges.length} connections | Rendering ${tilesRendered}/${totalTiles} tiles (${percentage}%)`);
        }
    }

    /** Flash error message in info-text area (auto resets color). */
    private showError(message: string): void {
        this.ui.updateInfo(message);
        this.ui.setInfoColor('#e74c3c');
        setTimeout(() => this.ui.resetInfoColor(), 3000);
    }

    /**
     * Create or recreate the player at a valid spawn position
     */
    private createPlayer(): void {
        if (!this.currentGrid) return;

        // Create new player
        this.player = new Player(0, 0, this.generator.PATH_TILE);
        this.player.setGrid(this.currentGrid);
        
        // Find a valid spawn position
        if (!this.player.findValidSpawnPosition()) {
            console.warn('Could not find valid spawn position for player');
            this.player = null;
        }
    }

    /**
     * Draw the player as a red triangle
     */
    private drawPlayer(offsetX: number, offsetY: number, gridHeight: number): void {
        if (!this.player) return;

        // Convert player grid position to screen position
        const screenX = this.player.x * this.cellSize + offsetX;
        const screenY = (gridHeight - 1 - this.player.y) * this.cellSize + offsetY;

        // Draw red triangle pointing up
        this.graphics.fillStyle(0xFF0000); // Red color
        this.graphics.beginPath();
        
        const centerX = screenX + this.cellSize / 2;
        const centerY = screenY + this.cellSize / 2;
        const size = this.cellSize * 0.4; // Triangle size relative to cell
        
        // Triangle vertices (pointing up)
        this.graphics.moveTo(centerX, centerY - size); // Top point
        this.graphics.lineTo(centerX - size, centerY + size); // Bottom left
        this.graphics.lineTo(centerX + size, centerY + size); // Bottom right
        this.graphics.closePath();
        this.graphics.fill();

        // Add a black outline for visibility
        this.graphics.lineStyle(1, 0x000000, 1);
        this.graphics.strokePath();
    }

    /**
     * Focus camera on player for fog-of-war culling mode
     * Always keeps the player at the center of the screen
     */
    private focusCameraOnPlayer(offsetX: number, offsetY: number, gridHeight: number): void {
        if (!this.player) return;

        // Convert player grid position to screen position
        const screenX = this.player.x * this.cellSize + offsetX;
        const screenY = (gridHeight - 1 - this.player.y) * this.cellSize + offsetY;

        // Calculate focus area size based on fog-of-war settings
        const maxTintRadius = this.visibilitySystem.getMaxTintRadius();
        const focusBuffer = this.viewportCulling.getFogOfWarFocusAreaBuffer();
        const focusRadius = (maxTintRadius + focusBuffer) * this.cellSize;

        // Always center camera on player (center of the player's cell)
        const centerX = screenX + this.cellSize / 2;
        const centerY = screenY + this.cellSize / 2;
        
        // Force camera to center on player
        this.cameras.main.centerOn(centerX, centerY);

        // Remove camera bounds to allow free centering
        this.cameras.main.removeBounds();
        
        // Adjust zoom to fit the focus area nicely in the viewport
        const viewportWidth = this.scale.width;
        const viewportHeight = this.scale.height;
        const scaleX = viewportWidth / (focusRadius * 2);
        const scaleY = viewportHeight / (focusRadius * 2);
        const targetZoom = Math.min(scaleX, scaleY) * 0.9; // 0.9 to leave some padding
        
        // Clamp zoom to reasonable bounds
        const clampedZoom = Math.max(GameScene.MIN_ZOOM, Math.min(GameScene.MAX_ZOOM, targetZoom));
        this.cameras.main.setZoom(clampedZoom);
    }

    // Method to be called from UI
    /**
     * UI callback: Pull parameter inputs from DOM then regenerate.
     * Acts as boundary between DOM world and Phaser scene internals.
     */

    public onGenerateButtonClick(): void {
        // Use UI to get values
        const width = this.ui.getWidth();
        const height = this.ui.getHeight();
        const regions = this.ui.getRegions();
        const distance = this.ui.getDistance();
        
        // Update rendering settings
        this.viewportCulling.setEnabled(this.ui.getCullingChecked());
        this.viewportCulling.setCullingMode(this.ui.getCullingMode());
        this.viewportCulling.setFogOfWarFocusAreaBuffer(this.ui.getFogOfWarFocusAreaBuffer());
        
        // Update visibility settings
        this.updateVisibilitySettings();
        
        this.generateLevel(width, height, regions, distance);
    }

    // Method to toggle viewport culling from UI
    /** UI callback: toggle viewport culling & immediate redraw. */
    public onCullingToggle(): void {
        this.viewportCulling.setEnabled(this.ui.getCullingChecked());
        this.drawGrid(); // Redraw immediately to show effect
    }

    /** UI callback: toggle chunk-based culling & immediate redraw. */
    public onChunkCullingToggle(): void {
        this.viewportCulling.setChunkBasedCulling(this.ui.getChunkCullingChecked());
        this.drawGrid(); // Redraw immediately to show effect
    }

    /** UI callback: toggle fog of war & immediate redraw. */
    public onFogOfWarToggle(): void {
        this.visibilitySystem.setEnabled(this.ui.getFogOfWarChecked());
        this.drawGrid(); // Redraw immediately to show effect
    }

    /** UI callback: set culling mode & immediate redraw. */
    public onCullingModeChange(mode: CullingMode): void {
        this.viewportCulling.setCullingMode(mode);
        
        // Reset camera bounds and zoom when switching away from fog-of-war mode
        if (mode !== CullingMode.FOG_OF_WAR && this.currentGrid) {
            const width = this.currentGrid.width;
            const height = this.currentGrid.height;
            const offsetX = (this.scale.width - width * this.cellSize) / 2;
            const offsetY = (this.scale.height - height * this.cellSize) / 2;
            const gridWidth = width * this.cellSize;
            const gridHeight = height * this.cellSize;
            const pad = GameScene.CAMERA_PADDING;
            
            this.cameras.main.setBounds(offsetX - pad, offsetY - pad, gridWidth + pad * 2, gridHeight + pad * 2);
            this.cameras.main.setZoom(1); // Reset to default zoom
        }
        
        this.drawGrid(); // Redraw immediately to show effect
    }

    /** UI callback: update fog-of-war focus area buffer & immediate redraw. */
    public onFogOfWarFocusAreaChange(): void {
        this.viewportCulling.setFogOfWarFocusAreaBuffer(this.ui.getFogOfWarFocusAreaBuffer());
        this.drawGrid(); // Redraw immediately to show effect
    }

    /** Update visibility system settings from UI */
    private updateVisibilitySettings(): void {
        this.visibilitySystem.setEnabled(this.ui.getFogOfWarChecked());
        this.visibilitySystem.setClearRadius(this.ui.getClearRadius());
        this.visibilitySystem.setMaxTintRadius(this.ui.getMaxRadius());
        this.visibilitySystem.setTintIntensity(this.ui.getFogIntensity() / 100); // Convert percentage to 0-1
    }

    /** UI callback: update visibility settings & immediate redraw. */
    public onVisibilitySettingsChange(): void {
        this.updateVisibilitySettings();
        this.drawGrid(); // Redraw immediately to show effect
    }
}
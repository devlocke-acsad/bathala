import * as Phaser from 'phaser';
import { HeIsComingGenerator } from './level-generator';
import { IntGrid } from './data-structures';

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
    private static readonly CULL_BUFFER_CELLS = 2;         // Extra tiles beyond viewport each side.
    private static readonly CAMERA_PADDING = 100;          // Extra world bounds padding around grid.
    private static readonly DEFAULT_WIDTH = 30;
    private static readonly DEFAULT_HEIGHT = 20;
    private static readonly DEFAULT_REGIONS = 8;
    private static readonly DEFAULT_MIN_REGION_DIST = 3;
    private static readonly COLOR_PATH = 0x90EE90;
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
    private useViewportCulling: boolean = true;     // Skip drawing tiles outside camera view.

    constructor() {
        super({ key: 'GameScene' });
        this.generator = new HeIsComingGenerator();
    }

    create(): void {
        // Single graphics layer reused each draw (cleared & redrawn).
        this.graphics = this.add.graphics();

        // Neutral initial zoom (1 = 1:1 pixel per world unit).
        this.cameras.main.setZoom(1);
        
        // Wheel zoom: adjust zoom, clamp range, request redraw.
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
            const zoom = this.cameras.main.zoom;
            const newZoom = Phaser.Math.Clamp(
                zoom - deltaY * GameScene.WHEEL_ZOOM_FACTOR,
                GameScene.MIN_ZOOM,
                GameScene.MAX_ZOOM
            );
            this.cameras.main.setZoom(newZoom);
            this.drawGrid();
        });

        // Left mouse drag -> camera pan (pointermove registered only while pressed).
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (pointer.leftButtonDown()) {
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
            // Update generator settings
            this.generator.levelSize = [width, height];
            this.generator.regionCount = regions;
            this.generator.minRegionDistance = minDistance;

            // Generate the grid
            this.currentGrid = this.generator.generateLayout();

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

        // Viewport culling bounds - only if enabled
        let startX = 0, endX = width - 1, startY = 0, endY = height - 1;
        
        if (this.useViewportCulling) {
            const camera = this.cameras.main;
            const zoom = camera.zoom;
            
            // Convert camera bounds to grid coordinates
            const viewLeft = (camera.scrollX - offsetX) / this.cellSize;
            const viewRight = ((camera.scrollX + this.scale.width / zoom) - offsetX) / this.cellSize;
            const viewTop = (camera.scrollY - offsetY) / this.cellSize;
            const viewBottom = ((camera.scrollY + this.scale.height / zoom) - offsetY) / this.cellSize;

            // Add buffer around visible area (in grid cells)
            const buffer = GameScene.CULL_BUFFER_CELLS;
            startX = Math.max(0, Math.floor(viewLeft) - buffer);
            endX = Math.min(width - 1, Math.ceil(viewRight) + buffer);
            startY = Math.max(0, Math.floor(viewTop) - buffer);
            endY = Math.min(height - 1, Math.ceil(viewBottom) + buffer);
        }

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
                    color = GameScene.COLOR_PATH; // Light green for paths
                } else if (tileType === this.generator.REGION_TILE) {
                    color = GameScene.COLOR_REGION; // Brown for regions
                } else if (tileType === this.generator.REGION_CENTER_TILE) {
                    color = GameScene.COLOR_REGION_CENTER; // Red for region centers
                } else {
                    color = GameScene.COLOR_EMPTY; // Light gray for empty
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

        // Expand camera bounds around grid with padding to allow some panning freedom.
        const gridWidth = width * this.cellSize;
        const gridHeight = height * this.cellSize;
        const pad = GameScene.CAMERA_PADDING;
        this.cameras.main.setBounds(offsetX - pad, offsetY - pad, gridWidth + pad * 2, gridHeight + pad * 2);
    }

    /** Display simple connection count summary (called after generation). */
    private updateInfoDisplay(): void {
        const infoElement = document.getElementById('info-text');
        if (infoElement && this.generator.edges) {
            infoElement.textContent = `Generated ${this.generator.edges.length} connections between regions`;
        }
    }

    /** Update render diagnostics (visible vs total tiles). */
    private updatePerformanceInfo(tilesRendered: number, totalTiles: number): void {
        const infoElement = document.getElementById('info-text');
        if (infoElement && this.generator.edges) {
            const percentage = ((tilesRendered / totalTiles) * 100).toFixed(1);
            infoElement.textContent = `Generated ${this.generator.edges.length} connections | Rendering ${tilesRendered}/${totalTiles} tiles (${percentage}%)`;
        }
    }

    /** Flash error message in info-text area (auto resets color). */
    private showError(message: string): void {
        const infoElement = document.getElementById('info-text');
        if (infoElement) {
            infoElement.textContent = message;
            infoElement.style.color = '#e74c3c';
            
            // Reset color after 3 seconds
            setTimeout(() => {
                if (infoElement) {
                    infoElement.style.color = '#bdc3c7';
                }
            }, 3000);
        }
    }

    // Method to be called from UI
    /**
     * UI callback: Pull parameter inputs from DOM then regenerate.
     * Acts as boundary between DOM world and Phaser scene internals.
     */
    public onGenerateButtonClick(): void {
        const widthInput = document.getElementById('width') as HTMLInputElement;
        const heightInput = document.getElementById('height') as HTMLInputElement;
        const regionsInput = document.getElementById('regions') as HTMLInputElement;
        const distanceInput = document.getElementById('distance') as HTMLInputElement;
        const cullingInput = document.getElementById('culling') as HTMLInputElement;

        const width = parseInt(widthInput.value) || 30;
        const height = parseInt(heightInput.value) || 20;
        const regions = parseInt(regionsInput.value) || 8;
        const distance = parseInt(distanceInput.value) || 3;
        this.useViewportCulling = cullingInput.checked;

        this.generateLevel(width, height, regions, distance);
    }

    // Method to toggle viewport culling from UI
    /** UI callback: toggle viewport culling & immediate redraw. */
    public onCullingToggle(): void {
        const cullingInput = document.getElementById('culling') as HTMLInputElement;
        this.useViewportCulling = cullingInput.checked;
        this.drawGrid(); // Redraw immediately to show effect
    }
}
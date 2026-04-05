import { Scene } from 'phaser';
import { OverworldGenerator } from './core/OverworldGenerator';
import { MapNode } from '../../core/types/MapTypes';
import { EnemyRegistry } from '../../core/registries/EnemyRegistry';
import { ActRegistry } from '../../core/acts/ActRegistry';
import { GameState } from '../../core/managers/GameState';
import { ACT1 } from '../../acts/act1/Act1Definition';
import { ACT2 } from '../../acts/act2/Act2Definition';
import { ACT3 } from '../../acts/act3/Act3Definition';

/**
 * === DEBUG FLAG ===
 * Set to true to enable verbose enemy AI logging.
 * Keep false in production to avoid console spam.
 */
const DEBUG_ENEMY_AI = false;
const DEBUG_ACT2_PATH_TILES = false;
const ACT2_PATH_TILE_DEBUG_MAX_SELECTION_LOGS = 80;

const ACT2_DIRECTIONAL_PATH_TILE_ASSETS: Record<string, string> = {
  sv_path_3way_open_nse: 'assets/background/submergedvillageAssets/pathTiles/path_3way_open_NSE.png',
  sv_path_3way_open_wne: 'assets/background/submergedvillageAssets/pathTiles/path_3way_open_WNE.png',
  sv_path_3way_open_wns: 'assets/background/submergedvillageAssets/pathTiles/path_3way_open_WNS.png',
  sv_path_3way_open_wse: 'assets/background/submergedvillageAssets/pathTiles/path_3way_open_WSE.png',
  sv_path_4way: 'assets/background/submergedvillageAssets/pathTiles/path_4way.png',
  sv_path_corner_open_ne: 'assets/background/submergedvillageAssets/pathTiles/path_corner_open_NE.png',
  sv_path_corner_open_se: 'assets/background/submergedvillageAssets/pathTiles/path_corner_open_SE.png',
  sv_path_corner_open_wn: 'assets/background/submergedvillageAssets/pathTiles/path_corner_open_WN.png',
  sv_path_corner_open_ws: 'assets/background/submergedvillageAssets/pathTiles/path_corner_open_WS.png',
  sv_path_horizontal_center: 'assets/background/submergedvillageAssets/pathTiles/path_horizontal_center.png',
  // Asset pack end-cap labels are inverted relative to runtime direction flags.
  sv_path_horizontal_end_e: 'assets/background/submergedvillageAssets/pathTiles/path_horizontal_end_W.png',
  sv_path_horizontal_end_w: 'assets/background/submergedvillageAssets/pathTiles/path_horizontal_end_E.png',
  sv_path_vertical_center: 'assets/background/submergedvillageAssets/pathTiles/path_vertical_center.png',
  sv_path_vertical_end_n: 'assets/background/submergedvillageAssets/pathTiles/path_vertical_end_S.png',
  sv_path_vertical_end_s: 'assets/background/submergedvillageAssets/pathTiles/path_vertical_end_N.png',
};

/**
 * === DEPTH LAYER CONFIGURATION ===
 * Centralized depth values for easy editing
 */
const DEPTH = {
  MAP_TILES: 0,
  MAP_NPCS: 49,          // Above fog of war (50)
  FALLBACK_CIRCLE: 51,
  ENEMY_ALERT: 49        // Below fog (50) so the "!" is hidden when enemy is in unrevealed area
};

/**
 * Overworld_MazeGenManager
 * 
 * Centralizes all maze generation, chunk management, and node placement logic for the Overworld scene.
 * Manages:
 * - Maze generation and caching
 * - Chunk rendering and visibility culling
 * - Node placement and rendering
 * - Valid position checking for pathfinding
 * - Player spawn position calculation
 * 
 * Design: Provides a clean API for maze-related operations without exposing internal maze logic
 */
export class Overworld_MazeGenManager {
  private scene: Scene;
  private gridSize: number;
  private overworldGen: OverworldGenerator;

  // Chunk and node tracking
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.GameObject }> = new Map();
  private nodes: MapNode[] = [];
  private nodeSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  // Floor textures for randomization
  private floorTextures: string[] = ['floor1', 'floor2', 'floor3'];
  private skywardCitadelPathTextures: string[] = [
    'cloud_path1', 'cloud_path2', 'cloud_path3', 'cloud_path4',
  ];
  private skywardCitadelWallTextures: string[] = ['cloud_wall1', 'cloud_wall2', 'cloud_wall3'];
  private forestWallTextures: string[] = ['wall1', 'wall1', 'wall2', 'wall2', 'wall3'];
  private submergedVillageUnderlayTextures: string[] = [
    'sv_underlay_1',
    'sv_underlay_2',
    'sv_underlay_3',
    'sv_underlay_4',
    'sv_underlay_5',
  ];
  private submergedVillageTreeTextures: string[] = ['sv_tree_1', 'sv_tree_2', 'sv_tree_3', 'sv_tree_4', 'sv_tree_5'];
  private submergedVillageWaterDeepTextures: string[] = [
    'sv_water_debris_1',
    'sv_water_debris_2',
    'sv_water_debris_3',
    'sv_water_debris_4',
    'sv_water_middle',
  ];
  private submergedVillageGrassSandEdgeTextures: string[] = [
    'sv_patch_grass_sand_n',
    'sv_patch_grass_sand_s',
    'sv_patch_grass_sand_e',
    'sv_patch_grass_sand_w',
  ];
  private submergedVillageStoneTextures: string[] = ['sv_stone_1', 'sv_stone_2', 'sv_stone_3', 'sv_stone_4', 'sv_stone_5'];
  // House sets grouped by sprite family footprint.
  private submergedVillageHouseSet3x3Ids: number[] = [1, 2, 6, 7, 8, 9, 10];
  private submergedVillageHouseSet3x2Ids: number[] = [3, 4];
  private submergedVillageHouseSet2x3Ids: number[] = [5];

  // Outer tile markers for chunk connections
  private outerTileMarkers: Phaser.GameObjects.Graphics[] = [];
  private devMode: boolean = false;
  private hasLoggedAct2PathTileAvailability: boolean = false;
  private hasAttemptedAct2RuntimePathTileLoad: boolean = false;
  private act2PathTileSelectionLogs: number = 0;
  private missingAct2PathTextureKeys: Set<string> = new Set();

  // Advanced Pathfinding System — enhanced cache tracks enemy start position & waypoint progress
  private enemyPaths: Map<string, {
    path: Array<{ x: number, y: number }>,
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    waypointIndex: number,  // how far along the path the enemy has progressed
    age: number
  }> = new Map();

  // Visual alert system — tracks alert icon sprites above enemies
  private enemyAlertSprites: Map<string, Phaser.GameObjects.Text> = new Map();
  private enemyAlerted: Set<string> = new Set(); // enemies that have already shown their first alert

  // Tiles reserved during a single nighttime movement round to prevent stacking
  private reservedTiles: Set<string> = new Set();

  /**
   * Convert a world-center position to a tile key for reservation tracking.
   */
  private tileKey(x: number, y: number): string {
    return `${Math.round(x / this.gridSize)},${Math.round(y / this.gridSize)}`;
  }

  private reserveTileCenter(x: number, y: number): void {
    this.reservedTiles.add(this.tileKey(x, y));
  }

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   * @param gridSize - The size of each grid cell in pixels (default: 32)
   * @param devMode - Whether to show debug features like outer tile markers
   * @param overworldGen - Injected OverworldGenerator for chunk generation
   */
  constructor(scene: Scene, gridSize: number = 32, devMode: boolean = false, overworldGen?: OverworldGenerator) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.devMode = devMode;

    // Backward compatibility: main branch still instantiates MazeGenSystem
    // without injecting an OverworldGenerator. Build a safe default in that case.
    if (overworldGen) {
      this.overworldGen = overworldGen;
    } else {
      const actRegistry = ActRegistry.getInstance();
      if (!actRegistry.has(ACT1.id)) {
        actRegistry.register(ACT1);
      }
      if (!actRegistry.has(ACT2.id)) {
        actRegistry.register(ACT2);
      }
      if (!actRegistry.has(ACT3.id)) {
        actRegistry.register(ACT3);
      }

      const chapterId = GameState.getInstance().getCurrentChapter();
      const resolvedAct = actRegistry.tryGet(chapterId) ?? ACT1;
      const gameState = GameState.getInstance();
      const seed = gameState.getOrCreateOverworldSeed(chapterId);
      this.overworldGen = new OverworldGenerator(resolvedAct, { seed });
    }

    if (DEBUG_ENEMY_AI) console.log('🗺️ MazeGenManager initialized with gridSize:', gridSize, 'devMode:', devMode);

    // Act 2 uses dedicated directional path tiles from Update/pathTiles.
    // Act 3 uses cloud platform path tiles.
    if (this.isAct3Chapter()) {
      this.floorTextures = [...this.skywardCitadelPathTextures];
    }
  }

  /**
   * Determine if a tile value is traversable for overworld movement/spawn.
   * Act 2 treats all pathTiles-backed land IDs as walkable.
   */
  private isTraversableTile(tileValue: number): boolean {
    if (!this.isAct2Chapter()) {
      return tileValue === 0;
    }

    // Act 2 houses (tile 2) are hard obstacles; paths around them stay traversable.
    return tileValue === 0 || tileValue === 1 || tileValue === 3 || tileValue === 4;
  }

  /**
   * Initialize the maze generator and prepare for a new game
   * Clears the cache and prepares the initial chunk
   */
  initializeNewGame(): void {
    if (DEBUG_ENEMY_AI) console.log('🗺️ Initializing new game - clearing maze cache');

    // Reset the maze generator cache for a new game
    this.overworldGen.clearCache();

    // Clear any existing data
    this.visibleChunks.clear();
    this.nodes = [];
    this.nodeSprites.clear();

    // Clear outer tile markers
    this.outerTileMarkers.forEach(marker => marker.destroy());
    this.outerTileMarkers = [];

    // Clear enemy AI state
    this.enemyPaths.clear();
    this.enemyAlertSprites.forEach((s) => s.destroy());
    this.enemyAlertSprites.clear();
    this.enemyAlerted.clear();
  }

  /**
   * Calculate a valid starting position for the player
   * Ensures player spawns on a path, not a wall
   * @returns {x, y} - World coordinates for player spawn
   */
  calculatePlayerStartPosition(): { x: number; y: number } {
    if (DEBUG_ENEMY_AI) console.log('🗺️ Calculating player start position');

    // Get the initial chunk to ensure player starts in a valid position
    const initialChunk = this.overworldGen.getChunk(0, 0, this.gridSize);

    // Find a valid starting position in the center of the initial chunk
    const chunkCenterX = Math.floor(this.overworldGen.chunkSize / 2);
    const chunkCenterY = Math.floor(this.overworldGen.chunkSize / 2);

    // Ensure the center position is a path
    let startX = chunkCenterX * this.gridSize + this.gridSize / 2;
    let startY = chunkCenterY * this.gridSize + this.gridSize / 2;

    // If center is not traversable, find nearest traversable tile.
    if (!this.isTraversableTile(initialChunk.maze[chunkCenterY][chunkCenterX])) {
      if (DEBUG_ENEMY_AI) console.log('🗺️ Center is blocked, searching nearest path tile');

      let foundPath = false;
      const maxDistance = Math.max(initialChunk.maze.length, initialChunk.maze[0].length);

      // Ring search from center to guarantee nearest valid path in this chunk.
      for (let distance = 1; distance <= maxDistance && !foundPath; distance++) {
        for (let dy = -distance; dy <= distance && !foundPath; dy++) {
          for (let dx = -distance; dx <= distance && !foundPath; dx++) {
            // Check only ring perimeter for nearest-first behavior
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== distance) continue;

            const newY = chunkCenterY + dy;
            const newX = chunkCenterX + dx;
            if (newY >= 0 && newY < initialChunk.maze.length &&
              newX >= 0 && newX < initialChunk.maze[0].length &&
              this.isTraversableTile(initialChunk.maze[newY][newX])) {
              startX = newX * this.gridSize + this.gridSize / 2;
              startY = newY * this.gridSize + this.gridSize / 2;
              foundPath = true;
              if (DEBUG_ENEMY_AI) console.log('🗺️ Found valid path at offset:', { dx, dy, distance });
            }
          }
        }
      }

      // Fallback: first traversable tile scan (should rarely be needed, but prevents invalid spawn).
      if (!foundPath) {
        for (let y = 0; y < initialChunk.maze.length && !foundPath; y++) {
          for (let x = 0; x < initialChunk.maze[0].length && !foundPath; x++) {
            if (this.isTraversableTile(initialChunk.maze[y][x])) {
              startX = x * this.gridSize + this.gridSize / 2;
              startY = y * this.gridSize + this.gridSize / 2;
              foundPath = true;
              if (DEBUG_ENEMY_AI) console.log('🗺️ Fallback spawn path found at:', { x, y });
            }
          }
        }
      }
    }

    if (DEBUG_ENEMY_AI) console.log('🗺️ Player start position:', { x: startX, y: startY });
    return { x: startX, y: startY };
  }

  /**
   * Check if a world position is valid (on a path, not a wall)
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns true if position is valid, false otherwise
   */
  isValidPosition(x: number, y: number): boolean {
    // Convert world coordinates to chunk and grid coordinates
    const chunkSize = this.overworldGen.chunkSize;
    const chunkSizePixels = chunkSize * this.gridSize;

    const chunkX = Math.floor(x / chunkSizePixels);
    const chunkY = Math.floor(y / chunkSizePixels);
    const localX = x - (chunkX * chunkSizePixels);
    const localY = y - (chunkY * chunkSizePixels);
    const gridX = Math.floor(localX / this.gridSize);
    const gridY = Math.floor(localY / this.gridSize);

    // Get the chunk
    const chunk = this.overworldGen.getChunk(chunkX, chunkY, this.gridSize);

    // Check bounds
    if (gridX < 0 || gridX >= chunk.maze[0].length || gridY < 0 || gridY >= chunk.maze.length) {
      return false;
    }

    // Check traversability against the active chapter's walkable tile set.
    return this.isTraversableTile(chunk.maze[gridY][gridX]);
  }

  /**
   * Check if a world-center position is already occupied by another node.
   *
   * Nighttime enemies should not stack on each other *or* move onto special nodes
   * like treasure/shop/campfire/event/boss.
   *
   * @param x - World center X coordinate to test
   * @param y - World center Y coordinate to test
   * @param excludeId - The id of the enemy currently moving (so it doesn't collide with itself)
   * @returns true if another node is on that tile
   */
  private isOccupiedByEnemy(x: number, y: number, excludeId: string): boolean {
    // Check the reservation set first (prevents stacking during the same movement round)
    if (this.reservedTiles.has(this.tileKey(x, y))) {
      return true;
    }

    const half = this.gridSize / 2;
    for (const node of this.nodes) {
      if (node.id === excludeId) continue;
      const nx = node.x + half;
      const ny = node.y + half;
      if (Math.abs(nx - x) < half && Math.abs(ny - y) < half) {
        return true;
      }
    }
    return false;
  }

  // ─── Min-Heap helper for A* (refinement #7) ───────────────────────
  private static heapPush<T extends { f: number }>(heap: T[], node: T): void {
    heap.push(node);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent].f <= heap[i].f) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  private static heapPop<T extends { f: number }>(heap: T[]): T | undefined {
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const bottom = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = bottom;
      let i = 0;
      const len = heap.length;
      while (true) {
        let smallest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < len && heap[left].f < heap[smallest].f) smallest = left;
        if (right < len && heap[right].f < heap[smallest].f) smallest = right;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  }

  /**
   * IMPROVEMENT #1: A* Pathfinding Algorithm (with min-heap for O(log n) extraction)
   * Find optimal path from enemy to player using A* algorithm
   * 
   * @param startX - Start X world coordinate
   * @param startY - Start Y world coordinate
   * @param targetX - Target X world coordinate
   * @param targetY - Target Y world coordinate
   * @param maxDepth - Maximum search depth to prevent performance issues
   * @returns Array of positions forming the optimal path
   */
  private findPathToPlayer(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    maxDepth: number = 20
  ): Array<{ x: number, y: number }> {

    interface PathNode {
      x: number;
      y: number;
      g: number; // Cost from start
      h: number; // Heuristic to goal
      f: number; // Total cost (g + h)
      parent: PathNode | null;
    }

    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    // Track best g-score per cell for faster duplicate detection
    const bestG: Map<string, number> = new Map();

    // Helper to convert position to key
    const posKey = (x: number, y: number) => `${Math.round(x / this.gridSize)},${Math.round(y / this.gridSize)}`;

    // Manhattan distance heuristic
    const heuristic = (x: number, y: number) => {
      return (Math.abs(targetX - x) + Math.abs(targetY - y)) / this.gridSize;
    };

    // Start node
    const startNode: PathNode = {
      x: startX,
      y: startY,
      g: 0,
      h: heuristic(startX, startY),
      f: heuristic(startX, startY),
      parent: null
    };

    Overworld_MazeGenManager.heapPush(openSet, startNode);
    bestG.set(posKey(startX, startY), 0);
    let iterations = 0;

    while (openSet.length > 0 && iterations < maxDepth * 10) {
      iterations++;

      // Get node with lowest f score — O(log n) via min-heap
      const current = Overworld_MazeGenManager.heapPop(openSet)!;
      const currentKey = posKey(current.x, current.y);

      // Skip if we already found a better route to this cell
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      // Goal reached
      if (Math.abs(current.x - targetX) < this.gridSize &&
        Math.abs(current.y - targetY) < this.gridSize) {
        // Reconstruct path
        const path: Array<{ x: number, y: number }> = [];
        let node: PathNode | null = current;
        while (node && node.parent) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }

        if (DEBUG_ENEMY_AI) console.log(`🎯 A* found path with ${path.length} steps in ${iterations} iterations`);
        return path;
      }

      // Check neighbors (4-directional only — no diagonal movement)
      const neighbors = [
        // Cardinal directions
        { x: current.x + this.gridSize, y: current.y, diagonal: false },
        { x: current.x - this.gridSize, y: current.y, diagonal: false },
        { x: current.x, y: current.y + this.gridSize, diagonal: false },
        { x: current.x, y: current.y - this.gridSize, diagonal: false },
      ];

      for (const neighbor of neighbors) {
        const key = posKey(neighbor.x, neighbor.y);

        // Skip if already evaluated
        if (closedSet.has(key)) continue;

        // Check walkability
        if (!this.isValidPosition(neighbor.x, neighbor.y)) continue;

        const g = current.g + 1;

        // Skip if we already have a better g-score for this cell
        const prevG = bestG.get(key);
        if (prevG !== undefined && prevG <= g) continue;
        bestG.set(key, g);

        const h = heuristic(neighbor.x, neighbor.y);
        const f = g + h;

        // Push to min-heap — O(log n)
        Overworld_MazeGenManager.heapPush(openSet, {
          x: neighbor.x,
          y: neighbor.y,
          g, h, f,
          parent: current
        });
      }
    }

    if (DEBUG_ENEMY_AI) console.log(`⚠️ A* no path found after ${iterations} iterations`);
    // No path found - return empty
    return [];
  }

  /**
   * IMPROVEMENT #3: Path Caching System (enhanced — tracks enemy position & waypoint progress)
   * Get or calculate path for enemy with caching.
   * The cache is invalidated when:
   *   - The enemy has moved off its cached start position (it consumed waypoints)
   *   - The player moved more than 2 grid squares from the cached target
   *   - The cache is older than 5 turns
   * 
   * @param enemyId - Unique enemy identifier
   * @param currentX - Enemy current X coordinate
   * @param currentY - Enemy current Y coordinate
   * @param targetX - Player X coordinate
   * @param targetY - Player Y coordinate
   * @returns Remaining path waypoints from the enemy's current position
   */
  private getEnemyPath(
    enemyId: string,
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number
  ): Array<{ x: number, y: number }> {

    const cached = this.enemyPaths.get(enemyId);

    // Reuse cached path if:
    // 1. Path exists and has remaining waypoints
    // 2. Enemy is still near where we expect it (hasn't teleported / been displaced)
    // 3. Target hasn't moved much (within 2 grid squares)
    // 4. Path is recent (< 5 turns old)
    if (cached &&
      cached.path.length > cached.waypointIndex &&
      Math.abs(cached.startX - currentX) < this.gridSize &&
      Math.abs(cached.startY - currentY) < this.gridSize &&
      Math.abs(cached.targetX - targetX) < this.gridSize * 2 &&
      Math.abs(cached.targetY - targetY) < this.gridSize * 2 &&
      cached.age < 5) {

      cached.age++;
      // Return only the remaining waypoints from waypointIndex onward
      const remaining = cached.path.slice(cached.waypointIndex);
      if (DEBUG_ENEMY_AI) console.log(`📦 Using cached path for ${enemyId} (age: ${cached.age}, remaining: ${remaining.length})`);
      return remaining;
    }

    // Calculate new path using A*
    if (DEBUG_ENEMY_AI) console.log(`🔍 Calculating new path for ${enemyId}`);
    const path = this.findPathToPlayer(currentX, currentY, targetX, targetY);

    this.enemyPaths.set(enemyId, {
      path,
      startX: currentX,
      startY: currentY,
      targetX,
      targetY,
      waypointIndex: 0,
      age: 0
    });

    return path;
  }

  /**
   * Advance the cached waypoint index after an enemy consumes movement steps.
   * Also updates the cached start position to the enemy's new location.
   */
  private advanceEnemyPathCache(enemyId: string, stepsConsumed: number, newX: number, newY: number): void {
    const cached = this.enemyPaths.get(enemyId);
    if (cached) {
      cached.waypointIndex += stepsConsumed;
      cached.startX = newX;
      cached.startY = newY;
    }
  }

  /**
   * Update visible chunks based on camera position
   * Handles chunk culling and loading new chunks as the camera moves
   * @param camera - The main camera
   */
  updateVisibleChunks(camera: Phaser.Cameras.Scene2D.Camera): void {
    const chunkSizePixels = this.overworldGen.chunkSize * this.gridSize;
    const worldView = camera.worldView;
    const padding = chunkSizePixels;

    // Respect camera zoom so we only render chunks near the actual visible world area.
    const startX = Math.floor((worldView.x - padding) / chunkSizePixels);
    const endX = Math.ceil((worldView.right + padding) / chunkSizePixels);
    const startY = Math.floor((worldView.y - padding) / chunkSizePixels);
    const endY = Math.ceil((worldView.bottom + padding) / chunkSizePixels);

    // Remove chunks that are no longer visible
    for (const [key, chunk] of this.visibleChunks) {
      const [chunkX, chunkY] = key.split(',').map(Number);
      if (chunkX < startX || chunkX > endX || chunkY < startY || chunkY > endY) {
        // Clean up graphics
        chunk.graphics.destroy();

        // Clean up node sprites from this chunk
        const chunkSizePixels = this.overworldGen.chunkSize * this.gridSize;
        const chunkStartX = chunkX * chunkSizePixels;
        const chunkEndX = (chunkX + 1) * chunkSizePixels;
        const chunkStartY = chunkY * chunkSizePixels;
        const chunkEndY = (chunkY + 1) * chunkSizePixels;

        // Find and remove nodes that belong to this chunk
        const nodesToRemove = this.nodes.filter(node =>
          node.x >= chunkStartX && node.x < chunkEndX &&
          node.y >= chunkStartY && node.y < chunkEndY
        );

        // Clean up sprites for nodes in this chunk
        nodesToRemove.forEach(node => {
          const sprite = this.nodeSprites.get(node.id);
          if (sprite) {
            sprite.destroy();
            this.nodeSprites.delete(node.id);
          }
          // Also remove any nighttime alert icon for this node
          this.removeEnemyAlert(node.id);
        });

        // Remove nodes from the main array
        this.nodes = this.nodes.filter(node =>
          !(node.x >= chunkStartX && node.x < chunkEndX &&
            node.y >= chunkStartY && node.y < chunkEndY)
        );

        this.visibleChunks.delete(key);
      }
    }

    // Add new chunks that are now visible
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        if (!this.visibleChunks.has(key)) {
          const chunk = this.overworldGen.getChunk(x, y, this.gridSize);
          const graphics = this.renderChunk(x, y, chunk.maze);
          this.visibleChunks.set(key, { maze: chunk.maze, graphics });

          // Add nodes from this chunk
          chunk.nodes.forEach(node => {
            // Check if node already exists to avoid duplicates
            const existingNodeIndex = this.nodes.findIndex(n => n.id === node.id);
            if (existingNodeIndex === -1) {
              // Node doesn't exist, add it
              this.nodes.push(node);
              // Node rendering will be handled by caller passing in render callback
            } else {
              // Node exists but might have moved, update its position
              this.nodes[existingNodeIndex].x = node.x;
              this.nodes[existingNodeIndex].y = node.y;

              // Update sprite position if it exists
              const sprite = this.nodeSprites.get(node.id);
              if (sprite) {
                sprite.setPosition(
                  node.x + this.gridSize / 2,
                  node.y + this.gridSize / 2
                );
              }
            }
          });
        }
      }
    }
  }

  /**
   * Render a chunk of the maze
   * Creates visual representation of walls and floors
   * @param chunkX - Chunk X coordinate
   * @param chunkY - Chunk Y coordinate
   * @param maze - 2D array representing the chunk maze (0 = path, 1 = wall)
   * @returns Phaser GameObject containing the rendered chunk
   */
  private renderChunk(chunkX: number, chunkY: number, maze: number[][]): Phaser.GameObjects.GameObject {
    // Create a container with tile sprites for better performance
    const container = this.scene.add.container(0, 0);
    const chunkSize = this.overworldGen.chunkSize;
    const chunkSizePixels = chunkSize * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;
    const isAct2 = this.isAct2Chapter();
    const act2HouseVariantMap = isAct2 ? this.buildAct2HouseVariantMap(maze, chunkX, chunkY) : undefined;
    const act2PuddleTextureMap = isAct2 ? this.buildAct2PuddleTextureMap(maze) : undefined;

    if (isAct2) {
      this.logAct2PathTileAvailabilityOnce();
    }

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        const tileX = offsetX + x * this.gridSize;
        const tileY = offsetY + y * this.gridSize;
        const tileValue = maze[y][x];

        const isPathTile = isAct2 ? this.isTraversableTile(tileValue) : tileValue === 0;

        if (!isPathTile) {
          // Non-walkable tile — pick texture based on tile type
          if (isAct2) {
            const underlayIndex = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageUnderlayTextures.length);
            const underlayKey = this.submergedVillageUnderlayTextures[underlayIndex];
            if (this.scene.textures.exists(underlayKey)) {
              const underlaySprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, underlayKey);
              underlaySprite.setDisplaySize(this.gridSize, this.gridSize);
              underlaySprite.setOrigin(0.5);
              underlaySprite.clearTint();
              container.add(underlaySprite);
            }
          }

          const textureKey = this.getWallTexture(tileValue, maze, chunkX, chunkY, x, y, act2HouseVariantMap, act2PuddleTextureMap);
          const wallSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, textureKey);
          wallSprite.setDisplaySize(this.gridSize, this.gridSize);
          wallSprite.setOrigin(0.5);
          wallSprite.clearTint();
          container.add(wallSprite);
        } else {
          // Path tile rendering.
          let textureKey = isAct2
            ? (tileValue === 0
              ? this.getAct2PathTexture(maze, chunkX, chunkY, x, y)
              : this.getAct2LandTexture(chunkX, chunkY, x, y))
            : this.floorTextures[this.getDeterministicIndex(chunkX, chunkY, x, y, this.floorTextures.length)];

          if (isAct2 && !this.scene.textures.exists(textureKey)) {
            if (!this.missingAct2PathTextureKeys.has(textureKey)) {
              this.missingAct2PathTextureKeys.add(textureKey);
              console.warn(`[Act2 PathTiles] Fallback while texture is unavailable: ${textureKey} at chunk(${chunkX},${chunkY}) tile(${x},${y})`);
            }
            textureKey = this.getAct2LandTexture(chunkX, chunkY, x, y);
          }

          const floorSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, textureKey);
          floorSprite.setDisplaySize(this.gridSize, this.gridSize);
          floorSprite.setOrigin(0.5);
          floorSprite.clearTint();
          container.add(floorSprite);
        }
      }
    }

    return container;
  }

  /**
   * Get a deterministic index for texture selection based on position
   * @param chunkX - Chunk X coordinate
   * @param chunkY - Chunk Y coordinate
   * @param x - Tile X coordinate within chunk
   * @param y - Tile Y coordinate within chunk
   * @param maxIndex - Maximum index value (length of texture array)
   * @returns Deterministic index for texture selection
   */
  private getDeterministicIndex(chunkX: number, chunkY: number, x: number, y: number, maxIndex: number): number {
    // Create a hash from the coordinates
    const hash = (chunkX * 73856093) ^ (chunkY * 19349663) ^ (x * 83492791) ^ (y * 83492791);
    // Ensure positive value
    const positiveHash = Math.abs(hash);
    // Return index within bounds
    return positiveHash % maxIndex;
  }

  private getAct2LandTexture(chunkX: number, chunkY: number, x: number, y: number): string {
    const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageUnderlayTextures.length);
    return this.submergedVillageUnderlayTextures[idx];
  }

  private buildAct2HouseVariantMap(maze: number[][], chunkX: number, chunkY: number): Map<string, number> {
    const map = new Map<string, number>();
    const visited = new Set<string>();
    const h = maze.length;
    const w = h > 0 ? maze[0].length : 0;
    const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (maze[y][x] !== 2) continue;
        const rootKey = `${x},${y}`;
        if (visited.has(rootKey)) continue;

        const queue: Array<[number, number]> = [[x, y]];
        const component: Array<[number, number]> = [];
        let minX = x;
        let minY = y;
        let maxX = x;
        let maxY = y;

        visited.add(rootKey);

        for (let qHead = 0; qHead < queue.length; qHead++) {
          const [cx, cy] = queue[qHead];
          component.push([cx, cy]);
          minX = Math.min(minX, cx);
          minY = Math.min(minY, cy);
          maxX = Math.max(maxX, cx);
          maxY = Math.max(maxY, cy);

          for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (maze[ny][nx] !== 2) continue;

            const key = `${nx},${ny}`;
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push([nx, ny]);
          }
        }

        const componentWidth = (maxX - minX) + 1;
        const componentHeight = (maxY - minY) + 1;
        const componentArea = componentWidth * componentHeight;
        const isSolidRect = component.length === componentArea;
        const isSupportedRect =
          (componentWidth === 3 && componentHeight === 3) ||
          (componentWidth === 2 && componentHeight === 3) ||
          (componentWidth === 3 && componentHeight === 2);

        if (!isSolidRect || !isSupportedRect) {
          // Defensive fallback: invalid house blobs should never render as buildings.
          for (const [tx, ty] of component) {
            maze[ty][tx] = 0;
          }
          continue;
        }

        // Exact family mapping from filename sizes:
        // H3xL3 => 3x3, H2xL3 => 3x2, H3xL2 => 2x3.
        let stylePool = this.submergedVillageHouseSet3x3Ids;
        if (componentWidth === 2 && componentHeight === 3) {
          stylePool = this.submergedVillageHouseSet2x3Ids;
        } else if (componentWidth === 3 && componentHeight === 2) {
          stylePool = this.submergedVillageHouseSet3x2Ids;
        }
        const styleIdx = this.getDeterministicIndex(chunkX, chunkY, minX, minY, stylePool.length);
        const styleId = stylePool[styleIdx];
        for (const [tx, ty] of component) {
          map.set(`${tx},${ty}`, styleId);
        }
      }
    }

    return map;
  }

  private getAct2HouseTexture(
    maze: number[][],
    chunkX: number,
    chunkY: number,
    x: number,
    y: number,
    houseVariantMap?: Map<string, number>,
  ): string {
    const isHouse = (tx: number, ty: number): boolean => maze[ty]?.[tx] === 2;
    const n = isHouse(x, y - 1);
    const s = isHouse(x, y + 1);
    const e = isHouse(x + 1, y);
    const w = isHouse(x - 1, y);

    let suffix: 'center' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' = 'center';
    if (!n && !w) suffix = 'nw';
    else if (!n && !e) suffix = 'ne';
    else if (!s && !w) suffix = 'sw';
    else if (!s && !e) suffix = 'se';
    else if (!n) suffix = 'n';
    else if (!s) suffix = 's';
    else if (!e) suffix = 'e';
    else if (!w) suffix = 'w';

    const styleId = houseVariantMap?.get(`${x},${y}`)
      ?? this.submergedVillageHouseSet3x3Ids[
        this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageHouseSet3x3Ids.length)
      ];

    const orientedKey = `sv_house_${styleId}_${suffix}`;
    if (this.scene.textures.exists(orientedKey)) {
      return orientedKey;
    }

    const centerKey = `sv_house_${styleId}_center`;
    if (this.scene.textures.exists(centerKey)) {
      return centerKey;
    }

    return this.getAct2LandTexture(chunkX, chunkY, x, y);
  }

  private buildAct2PuddleTextureMap(maze: number[][]): Map<string, string> {
    const map = new Map<string, string>();
    const visited = new Set<string>();
    const h = maze.length;
    const w = h > 0 ? maze[0].length : 0;
    const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (maze[y][x] !== 11) continue;
        const rootKey = `${x},${y}`;
        if (visited.has(rootKey)) continue;

        const queue: Array<[number, number]> = [[x, y]];
        const component: Array<[number, number]> = [];
        let minX = x;
        let minY = y;
        let maxX = x;
        let maxY = y;

        visited.add(rootKey);

        for (let qHead = 0; qHead < queue.length; qHead++) {
          const [cx, cy] = queue[qHead];
          component.push([cx, cy]);
          minX = Math.min(minX, cx);
          minY = Math.min(minY, cy);
          maxX = Math.max(maxX, cx);
          maxY = Math.max(maxY, cy);

          for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
            if (maze[ny][nx] !== 11) continue;

            const key = `${nx},${ny}`;
            if (visited.has(key)) continue;
            visited.add(key);
            queue.push([nx, ny]);
          }
        }

        const componentWidth = (maxX - minX) + 1;
        const componentHeight = (maxY - minY) + 1;
        const componentArea = componentWidth * componentHeight;
        const isSolidRect = component.length === componentArea;

        if (isSolidRect && componentWidth === 3 && componentHeight === 3) {
          for (const [tx, ty] of component) {
            const localX = tx - minX;
            const localY = ty - minY;
            let texture = 'sv_puddle_big_middle';
            if (localX === 0 && localY === 0) texture = 'sv_puddle_big_nw';
            else if (localX === 1 && localY === 0) texture = 'sv_puddle_big_n';
            else if (localX === 2 && localY === 0) texture = 'sv_puddle_big_ne';
            else if (localX === 0 && localY === 1) texture = 'sv_puddle_big_w';
            else if (localX === 1 && localY === 1) texture = 'sv_puddle_big_middle';
            else if (localX === 2 && localY === 1) texture = 'sv_puddle_big_e';
            else if (localX === 0 && localY === 2) texture = 'sv_puddle_big_sw';
            else if (localX === 1 && localY === 2) texture = 'sv_puddle_big_s';
            else if (localX === 2 && localY === 2) texture = 'sv_puddle_big_se';
            map.set(`${tx},${ty}`, texture);
          }
          continue;
        }

        if (isSolidRect && componentWidth === 2 && componentHeight === 1) {
          for (const [tx, ty] of component) {
            const localX = tx - minX;
            map.set(`${tx},${ty}`, localX === 0 ? 'sv_puddle_small_w' : 'sv_puddle_small_e');
          }
          continue;
        }

        if (component.length > 1) {
          // Unsupported puddle clusters look like tiled standalones; downgrade to stones.
          for (const [tx, ty] of component) {
            maze[ty][tx] = 12;
          }
          continue;
        }

        for (const [tx, ty] of component) {
          map.set(`${tx},${ty}`, 'sv_puddle_standalone_1');
        }
      }
    }

    return map;
  }

  private logAct2PathTileAvailabilityOnce(): void {
    if (this.hasLoggedAct2PathTileAvailability || !DEBUG_ACT2_PATH_TILES) {
      return;
    }

    this.hasLoggedAct2PathTileAvailability = true;
    const requiredPathKeys = [
      'sv_path_3way_open_nse',
      'sv_path_3way_open_wne',
      'sv_path_3way_open_wns',
      'sv_path_3way_open_wse',
      'sv_path_4way',
      'sv_path_corner_open_ne',
      'sv_path_corner_open_se',
      'sv_path_corner_open_wn',
      'sv_path_corner_open_ws',
      'sv_path_horizontal_center',
      'sv_path_horizontal_end_e',
      'sv_path_horizontal_end_w',
      'sv_path_vertical_center',
      'sv_path_vertical_end_n',
      'sv_path_vertical_end_s',
    ];

    const rows = requiredPathKeys.map((key) => ({ key, loaded: this.scene.textures.exists(key) }));
    const missing = rows.filter((row) => !row.loaded).map((row) => row.key);

    console.groupCollapsed(`[Act2 PathTiles] Runtime texture availability: ${rows.length - missing.length}/${rows.length}`);
    console.table(rows);
    if (missing.length > 0) {
      console.warn('[Act2 PathTiles] Missing path texture keys at first render pass:', missing);
      this.ensureAct2DirectionalPathTilesLoaded(missing);
    } else {
      console.info('[Act2 PathTiles] All directional path textures are loaded.');
    }
    console.groupEnd();
  }

  private ensureAct2DirectionalPathTilesLoaded(missingKeys: string[]): void {
    if (this.hasAttemptedAct2RuntimePathTileLoad || missingKeys.length === 0) {
      return;
    }

    this.hasAttemptedAct2RuntimePathTileLoad = true;

    const keysToLoad = missingKeys.filter((key) => Boolean(ACT2_DIRECTIONAL_PATH_TILE_ASSETS[key]));
    if (keysToLoad.length === 0) {
      console.error('[Act2 PathTiles] Missing keys have no asset map entries:', missingKeys);
      return;
    }

    console.warn('[Act2 PathTiles] Attempting runtime load for missing keys:', keysToLoad);

    this.scene.load.on('loaderror', (file: Phaser.Loader.File) => {
      if (file.key.startsWith('sv_path_')) {
        console.error(`[Act2 PathTiles] Runtime loaderror key=${file.key} url=${file.url ?? '(unknown)'}`);
      }
    });

    this.scene.load.once('complete', () => {
      const unresolved = keysToLoad.filter((key) => !this.scene.textures.exists(key));
      if (unresolved.length > 0) {
        console.error('[Act2 PathTiles] Runtime load complete but keys still missing:', unresolved);
      } else {
        console.info('[Act2 PathTiles] Runtime load succeeded. Re-rendering visible chunks.');
        this.reRenderVisibleChunks();
      }
    });

    for (const key of keysToLoad) {
      if (this.scene.textures.exists(key)) {
        continue;
      }

      const assetPath = ACT2_DIRECTIONAL_PATH_TILE_ASSETS[key];
      this.scene.load.image(key, assetPath);
    }

    if (!this.scene.load.isLoading()) {
      this.scene.load.start();
    }
  }

  /**
   * Resolve Act 2 path texture by open directions around an actual PATH tile.
   * Includes cross-chunk neighbor checks so chunk seams keep correct directionality.
   */
  private getAct2PathTexture(maze: number[][], chunkX: number, chunkY: number, x: number, y: number): string {
    const chunkSize = this.overworldGen.chunkSize;

    const getTileValue = (tx: number, ty: number): number | undefined => {
      let localX = tx;
      let localY = ty;
      let targetChunkX = chunkX;
      let targetChunkY = chunkY;

      if (localX < 0) {
        localX = chunkSize - 1;
        targetChunkX -= 1;
      } else if (localX >= chunkSize) {
        localX = 0;
        targetChunkX += 1;
      }

      if (localY < 0) {
        localY = chunkSize - 1;
        targetChunkY -= 1;
      } else if (localY >= chunkSize) {
        localY = 0;
        targetChunkY += 1;
      }

      if (targetChunkX === chunkX && targetChunkY === chunkY) {
        return maze[localY]?.[localX];
      }

      const neighborChunk = this.overworldGen.getChunk(targetChunkX, targetChunkY, this.gridSize);
      return neighborChunk?.maze?.[localY]?.[localX];
    };

    const isPath = (tx: number, ty: number): boolean => getTileValue(tx, ty) === 0;

    const n = isPath(x, y - 1);
    const s = isPath(x, y + 1);
    const e = isPath(x + 1, y);
    const w = isPath(x - 1, y);
    const openCount = Number(n) + Number(s) + Number(e) + Number(w);

    let selectedKey = 'sv_path_4way';

    if (openCount === 4) {
      selectedKey = 'sv_path_4way';
    } else if (openCount === 3) {
      if (!w) selectedKey = 'sv_path_3way_open_nse';
      else if (!s) selectedKey = 'sv_path_3way_open_wne';
      else if (!e) selectedKey = 'sv_path_3way_open_wns';
      else selectedKey = 'sv_path_3way_open_wse';
    } else if (openCount === 2) {
      if (n && s) selectedKey = 'sv_path_vertical_center';
      else if (e && w) selectedKey = 'sv_path_horizontal_center';
      else if (n && e) selectedKey = 'sv_path_corner_open_ne';
      else if (s && e) selectedKey = 'sv_path_corner_open_se';
      else if (w && n) selectedKey = 'sv_path_corner_open_wn';
      else selectedKey = 'sv_path_corner_open_ws';
    } else if (openCount === 1) {
      if (n) selectedKey = 'sv_path_vertical_end_n';
      else if (s) selectedKey = 'sv_path_vertical_end_s';
      else if (e) selectedKey = 'sv_path_horizontal_end_e';
      else selectedKey = 'sv_path_horizontal_end_w';
    }

    if (DEBUG_ACT2_PATH_TILES && this.act2PathTileSelectionLogs < ACT2_PATH_TILE_DEBUG_MAX_SELECTION_LOGS) {
      this.act2PathTileSelectionLogs += 1;
      console.debug(
        `[Act2 PathTiles] select=${selectedKey} chunk=(${chunkX},${chunkY}) tile=(${x},${y}) open=[N:${Number(n)} S:${Number(s)} E:${Number(e)} W:${Number(w)}] count=${openCount}`,
      );
    }

    return selectedKey;
  }

  /**
   * Map non-path tile values to texture keys.
   * Act 2 favors submerged-village bundles with directional variants.
   */
  private getWallTexture(
    tileValue: number,
    maze: number[][],
    chunkX: number,
    chunkY: number,
    x: number,
    y: number,
    houseVariantMap?: Map<string, number>,
    puddleTextureMap?: Map<string, string>,
  ): string {
    const isAct2 = this.isAct2Chapter();
    const isAct3 = this.isAct3Chapter();
    const has = (dx: number, dy: number): boolean => {
      const ny = y + dy;
      const nx = x + dx;
      return maze[ny]?.[nx] === tileValue;
    };
    const fullyEnclosed = (): boolean => {
      return has(0, -1) && has(0, 1) && has(1, 0) && has(-1, 0)
        && has(1, -1) && has(-1, -1) && has(1, 1) && has(-1, 1);
    };

    const getStrict2x2Anchor = (isType: (tx: number, ty: number) => boolean): [number, number] | null => {
      // This tile can belong to one of four possible 2x2 anchors.
      const anchors: Array<[number, number]> = [
        [x, y],
        [x - 1, y],
        [x, y - 1],
        [x - 1, y - 1],
      ];

      for (const [ax, ay] of anchors) {
        const is2x2 =
          isType(ax, ay) &&
          isType(ax + 1, ay) &&
          isType(ax, ay + 1) &&
          isType(ax + 1, ay + 1);

        if (!is2x2) {
          continue;
        }

        // Enforce isolated 2x2: no extra same-type tiles touching the surrounding 1-tile ring.
        let contaminated = false;
        for (let ty = ay - 1; ty <= ay + 2 && !contaminated; ty++) {
          for (let tx = ax - 1; tx <= ax + 2; tx++) {
            const inCore = tx >= ax && tx <= ax + 1 && ty >= ay && ty <= ay + 1;
            if (!inCore && isType(tx, ty)) {
              contaminated = true;
              break;
            }
          }
        }

        if (!contaminated) {
          return [ax, ay];
        }
      }

      return null;
    };

    const getQuadrantKey = (ax: number, ay: number): 'nw' | 'ne' | 'sw' | 'se' | null => {
      if (x === ax && y === ay) return 'nw';
      if (x === ax + 1 && y === ay) return 'ne';
      if (x === ax && y === ay + 1) return 'sw';
      if (x === ax + 1 && y === ay + 1) return 'se';
      return null;
    };

    const renderGrassSandPatchTile = (): string => {
      const n = has(0, -1);
      const s = has(0, 1);
      const e = has(1, 0);
      const w = has(-1, 0);
      const ne = has(1, -1);
      const nw = has(-1, -1);
      const se = has(1, 1);
      const sw = has(-1, 1);
      const orthCount = Number(n) + Number(s) + Number(e) + Number(w);

      if (!n && !w) return 'sv_patch_grass_sand_nw';
      if (!n && !e) return 'sv_patch_grass_sand_ne';
      if (!s && !w) return 'sv_patch_grass_sand_sw';
      if (!s && !e) return 'sv_patch_grass_sand_se';

      // Concave routing for junctions between snakes and quadrilateral patches.
      if (orthCount >= 3) {
        if (n && w && !nw) return 'sv_patch_grass_sand_inner_bush_se';
        if (n && e && !ne) return 'sv_patch_grass_sand_inner_bush_sw';
        if (s && w && !sw) return 'sv_patch_grass_sand_inner_bush_ne';
        if (s && e && !se) return 'sv_patch_grass_sand_inner_bush_nw';
      }

      if (!n) return 'sv_patch_grass_sand_n';
      if (!s) return 'sv_patch_grass_sand_s';
      if (!e) return 'sv_patch_grass_sand_e';
      if (!w) return 'sv_patch_grass_sand_w';

      // Snake/irregular shapes must not use middle tiles.
      if (!fullyEnclosed()) {
        if (n && w && !nw) return 'sv_patch_grass_sand_inner_bush_se';
        if (n && e && !ne) return 'sv_patch_grass_sand_inner_bush_sw';
        if (s && w && !sw) return 'sv_patch_grass_sand_inner_bush_ne';
        if (s && e && !se) return 'sv_patch_grass_sand_inner_bush_nw';

        const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageGrassSandEdgeTextures.length);
        return this.submergedVillageGrassSandEdgeTextures[idx];
      }

      return 'sv_patch_grass_sand_middle';
    };

    const renderSandGrassPatchTile = (): string => {
      const isType = (tx: number, ty: number): boolean => maze[ty]?.[tx] === tileValue;
      const anchor = getStrict2x2Anchor(isType);
      if (anchor) {
        const [ax, ay] = anchor;
        const quadrant = getQuadrantKey(ax, ay);
        if (quadrant === 'nw') return 'sv_patch_sand_grass_bush_nw';
        if (quadrant === 'ne') return 'sv_patch_sand_grass_bush_ne';
        if (quadrant === 'sw') return 'sv_patch_sand_grass_bush_sw';
        if (quadrant === 'se') return 'sv_patch_sand_grass_bush_se';
      }

      // Hard visual guard against artifacting when a non-2x2 remnant survives generation.
      return this.getAct2LandTexture(chunkX, chunkY, x, y);
    };

    if (tileValue === 5) {
      const n = has(0, -1);
      const s = has(0, 1);
      const e = has(1, 0);
      const w = has(-1, 0);
      const ne = has(1, -1);
      const nw = has(-1, -1);
      const se = has(1, 1);
      const sw = has(-1, 1);
      const orthCount = Number(n) + Number(s) + Number(e) + Number(w);

      if (!n && !w) return 'sv_grass_cliff_nw';
      if (!n && !e) return 'sv_grass_cliff_ne';
      if (!s && !w) return 'sv_grass_cliff_sw';
      if (!s && !e) return 'sv_grass_cliff_se';

      // Dedicated inner-corner routing for irregular/concave shapes.
      // Gate this so narrow cliff elbows do not pick concave tiles and appear broken.
      if (orthCount >= 3) {
        if (n && w && !nw) return 'sv_grass_cliff_inner_se';
        if (n && e && !ne) return 'sv_grass_cliff_inner_sw';
        if (s && w && !sw) return 'sv_grass_cliff_inner_ne';
        if (s && e && !se) return 'sv_grass_cliff_inner_nw';
      }

      if (!n) return 'sv_grass_cliff_n';
      if (!s) return 'sv_grass_cliff_s';
      if (!e) return 'sv_grass_cliff_e';
      if (!w) return 'sv_grass_cliff_w';
      // Cardinal enclosure is enough to use the center fill tile.
      return 'sv_grass_cliff_middle';
    }

    if (tileValue === 7) {
      return renderGrassSandPatchTile();
    }

    if (tileValue === 8) {
      return renderSandGrassPatchTile();
    }

    if (tileValue === 6) {
      const n = has(0, -1);
      const s = has(0, 1);
      const e = has(1, 0);
      const w = has(-1, 0);
      const ne = has(1, -1);
      const nw = has(-1, -1);
      const se = has(1, 1);
      const sw = has(-1, 1);
      const orthCount = Number(n) + Number(s) + Number(e) + Number(w);

      const isHillAt = (tx: number, ty: number): boolean => maze[ty]?.[tx] === 6;
      const strictHillAnchor = getStrict2x2Anchor(isHillAt);
      if (strictHillAnchor) {
        const [ax, ay] = strictHillAnchor;
        const quadrant = getQuadrantKey(ax, ay);
        // Deterministic 50/50 variant for strict hill clusters: Hill or Bush.
        const useBushVariant = this.getDeterministicIndex(chunkX, chunkY, ax, ay, 2) === 1;

        if (useBushVariant) {
          if (quadrant === 'nw') return 'sv_patch_sand_grass_bush_nw';
          if (quadrant === 'ne') return 'sv_patch_sand_grass_bush_ne';
          if (quadrant === 'sw') return 'sv_patch_sand_grass_bush_sw';
          if (quadrant === 'se') return 'sv_patch_sand_grass_bush_se';
        } else {
          if (quadrant === 'nw') return 'sv_grass_hill_nw';
          if (quadrant === 'ne') return 'sv_grass_hill_ne';
          if (quadrant === 'sw') return 'sv_grass_hill_sw';
          if (quadrant === 'se') return 'sv_grass_hill_se';
        }
      }

      // Non-2x2 hill remnants/clusters use cliff autotile family (including middle fill).
      if (!n && !w) return 'sv_grass_cliff_nw';
      if (!n && !e) return 'sv_grass_cliff_ne';
      if (!s && !w) return 'sv_grass_cliff_sw';
      if (!s && !e) return 'sv_grass_cliff_se';

      if (orthCount >= 3) {
        if (n && w && !nw) return 'sv_grass_cliff_inner_se';
        if (n && e && !ne) return 'sv_grass_cliff_inner_sw';
        if (s && w && !sw) return 'sv_grass_cliff_inner_ne';
        if (s && e && !se) return 'sv_grass_cliff_inner_nw';
      }

      if (!n) return 'sv_grass_cliff_n';
      if (!s) return 'sv_grass_cliff_s';
      if (!e) return 'sv_grass_cliff_e';
      if (!w) return 'sv_grass_cliff_w';
      return 'sv_grass_cliff_middle';
    }

    if (tileValue === 9) {
      const n = has(0, -1);
      const s = has(0, 1);
      const e = has(1, 0);
      const w = has(-1, 0);
      const ne = has(1, -1);
      const nw = has(-1, -1);
      const se = has(1, 1);
      const sw = has(-1, 1);
      const orthCount = Number(n) + Number(s) + Number(e) + Number(w);

      type DiagDir = 'ne' | 'nw' | 'se' | 'sw';
      const orthWaterCountAt = (dx: number, dy: number): number => {
        if (!has(dx, dy)) return 0;
        return (
          Number(has(dx, dy - 1)) +
          Number(has(dx, dy + 1)) +
          Number(has(dx + 1, dy)) +
          Number(has(dx - 1, dy))
        );
      };
      const diagonalState = {
        ne: { water: ne, deep: ne && orthWaterCountAt(1, -1) >= 3 },
        nw: { water: nw, deep: nw && orthWaterCountAt(-1, -1) >= 3 },
        se: { water: se, deep: se && orthWaterCountAt(1, 1) >= 3 },
        sw: { water: sw, deep: sw && orthWaterCountAt(-1, 1) >= 3 },
      };
      const inferInteriorDiagonal = (preferred: DiagDir): DiagDir => {
        const preferredState = diagonalState[preferred];
        if (preferredState.deep || preferredState.water) return preferred;

        if (diagonalState.ne.deep) return 'ne';
        if (diagonalState.nw.deep) return 'nw';
        if (diagonalState.se.deep) return 'se';
        if (diagonalState.sw.deep) return 'sw';

        if (diagonalState.ne.water) return 'ne';
        if (diagonalState.nw.water) return 'nw';
        if (diagonalState.se.water) return 'se';
        if (diagonalState.sw.water) return 'sw';

        return preferred;
      };
      // Sprite semantics differ by family:
      // - water_cliff_* corner names indicate where land is (water is opposite).
      // - water_outer_* corner names indicate where water is.
      const cliffCornerForInterior = (diag: DiagDir): string => {
        if (diag === 'ne') return 'sv_water_cliff_sw';
        if (diag === 'nw') return 'sv_water_cliff_se';
        if (diag === 'se') return 'sv_water_cliff_nw';
        return 'sv_water_cliff_ne';
      };
      const outerCornerForInterior = (diag: DiagDir): string => {
        if (diag === 'ne') return 'sv_water_outer_ne';
        if (diag === 'nw') return 'sv_water_outer_nw';
        if (diag === 'se') return 'sv_water_outer_se';
        return 'sv_water_outer_sw';
      };

      // Single-neighbor water tips should use directional edge tiles,
      // not corner tiles (prevents "spilled" visual protrusions).
      if (orthCount === 1) {
        if (s) return 'sv_water_cliff_n';
        if (n) return 'sv_water_cliff_s';
        if (e) return 'sv_water_cliff_w';
        if (w) return 'sv_water_cliff_e';
      }

      // Convex water boundaries: use cliff corner sprites.
      if (!n && !w) return cliffCornerForInterior(inferInteriorDiagonal('se'));
      if (!n && !e) return cliffCornerForInterior(inferInteriorDiagonal('sw'));
      if (!s && !w) return cliffCornerForInterior(inferInteriorDiagonal('ne'));
      if (!s && !e) return cliffCornerForInterior(inferInteriorDiagonal('nw'));

      // Concave water corners (land notch intruding into water): use outer corner sprites.
      if (orthCount >= 3) {
        if (n && w && !nw) return outerCornerForInterior(inferInteriorDiagonal('se'));
        if (n && e && !ne) return outerCornerForInterior(inferInteriorDiagonal('sw'));
        if (s && w && !sw) return outerCornerForInterior(inferInteriorDiagonal('ne'));
        if (s && e && !se) return outerCornerForInterior(inferInteriorDiagonal('nw'));
      }

      if (!n) return 'sv_water_cliff_n';
      if (!s) return 'sv_water_cliff_s';
      if (!e) return 'sv_water_cliff_e';
      if (!w) return 'sv_water_cliff_w';

      const deepIdx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageWaterDeepTextures.length);
      return this.submergedVillageWaterDeepTextures[deepIdx];
    }

    if (isAct2 && tileValue === 1) {
      return this.getAct2LandTexture(chunkX, chunkY, x, y);
    }

    if (isAct2 && tileValue === 2) {
      return this.getAct2HouseTexture(maze, chunkX, chunkY, x, y, houseVariantMap);
    }

    // Act 2 puddle props (3x3, 1x2 horizontal, and standalone variants)
    if (isAct2 && tileValue === 11) {
      return puddleTextureMap?.get(`${x},${y}`) ?? 'sv_puddle_standalone_1';
    }

    // Act 2 stone props (standalone variants)
    if (isAct2 && tileValue === 12) {
      const stoneIdx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageStoneTextures.length);
      return this.submergedVillageStoneTextures[stoneIdx];
    }

    // Obstacle tiles (TILE.OBSTACLE = 10) - randomly select from available obstacle sprites
    if (tileValue === 10) {
      const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.submergedVillageTreeTextures.length);
      return this.submergedVillageTreeTextures[idx];
    }

    switch (tileValue) {
      case 2:
        return 'wall4';
      case 3:
      case 4:
        if (isAct2) {
          return this.getAct2LandTexture(chunkX, chunkY, x, y);
        }
        return tileValue === 3 ? 'wall5' : 'wall6';
      default: {
        if (isAct2) {
          return this.getAct2LandTexture(chunkX, chunkY, x, y);
        }
        if (isAct3) {
          // Cloud walls for Skyward Citadel
          const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.skywardCitadelWallTextures.length);
          return this.skywardCitadelWallTextures[idx];
        }
        // Forest / generic wall — weighted random from wall1-3
        const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, this.forestWallTextures.length);
        return this.forestWallTextures[idx];
      }
    }
  }

  private isAct2Chapter(): boolean {
    const chapter = GameState.getInstance().getCurrentChapter();
    const normalized = String(chapter).toLowerCase();
    return chapter === 2 || normalized === '2' || normalized.includes('act2') || normalized.includes('chapter2');
  }

  private isAct3Chapter(): boolean {
    const chapter = GameState.getInstance().getCurrentChapter();
    const normalized = String(chapter).toLowerCase();
    return chapter === 3 || normalized === '3' || normalized.includes('act3') || normalized.includes('chapter3');
  }

  /**
   * Mark an outer tile with a visual indicator
   */

  /**
   * Set dev mode on or off
   * @param devMode - Whether to enable or disable dev mode
   */
  setDevMode(devMode: boolean): void {
    const oldDevMode = this.devMode;
    this.devMode = devMode;

    // If turning dev mode off, hide all outer tile markers
    if (!devMode) {
      this.hideOuterTileMarkers();
    }
    // If dev mode state changed, we might want to re-render visible chunks
    // to show or hide the markers
    else if (devMode && !oldDevMode) {
      this.reRenderVisibleChunks();
    }
  }

  /**
   * Re-render all currently visible chunks to show/hide dev markers
   */
  private reRenderVisibleChunks(): void {
    // Store current visible chunks data and node data
    const visibleChunkData = new Map<string, { maze: number[][]; nodes: MapNode[] }>();

    for (const [key, chunk] of this.visibleChunks) {
      // Find nodes associated with this chunk
      const chunkNodes = this.nodes.filter(node => {
        // Extract chunk coordinates from node position
        const chunkSizePixels = this.overworldGen.chunkSize * this.gridSize;
        const nodeChunkX = Math.floor((node.x + this.gridSize / 2) / chunkSizePixels);
        const nodeChunkY = Math.floor((node.y + this.gridSize / 2) / chunkSizePixels);
        const [chunkX, chunkY] = key.split(',').map(Number);
        return nodeChunkX === chunkX && nodeChunkY === chunkY;
      });

      visibleChunkData.set(key, { maze: chunk.maze, nodes: chunkNodes });
    }

    // Clear current visible chunks
    this.clearVisibleChunks();

    // Re-render all previously visible chunks and their nodes
    for (const [key, chunkData] of visibleChunkData) {
      const [chunkX, chunkY] = key.split(',').map(Number);
      const graphics = this.renderChunk(chunkX, chunkY, chunkData.maze);
      this.visibleChunks.set(key, { maze: chunkData.maze, graphics });

      // Re-add nodes from this chunk
      chunkData.nodes.forEach(node => {
        // Check if node already exists to avoid duplicates
        if (!this.nodes.some(n => n.id === node.id)) {
          this.nodes.push(node);
        }
      });
    }
  }

  /**
   * Clear all currently visible chunks
   */
  private clearVisibleChunks(): void {
    // Destroy all visible chunk graphics
    for (const chunk of this.visibleChunks.values()) {
      chunk.graphics.destroy();
    }

    this.visibleChunks.clear();
    this.nodes = [];
    this.nodeSprites.clear();

    // Clear outer tile markers
    this.outerTileMarkers.forEach(marker => marker.destroy());
    this.outerTileMarkers = [];
  }

  /**
   * Hide all outer tile markers
   */
  private hideOuterTileMarkers(): void {
    for (const marker of this.outerTileMarkers) {
      marker.destroy();
    }
    this.outerTileMarkers = [];
  }

  /**
   * Get all nodes in the maze
   * @returns Array of MapNode objects
   */
  getNodes(): MapNode[] {
    return this.nodes;
  }

  /**
   * Remove the nighttime alert icon for an enemy node (e.g. after it is defeated in combat).
   * Safe to call if the node has no alert.
   */
  removeEnemyAlert(nodeId: string): void {
    const alertSprite = this.enemyAlertSprites.get(nodeId);
    if (alertSprite) {
      alertSprite.destroy();
      this.enemyAlertSprites.delete(nodeId);
    }
    this.enemyAlerted.delete(nodeId);
  }

  /**
   * Get a node sprite by node ID
   * @param nodeId - The ID of the node
   * @returns The sprite for the node, or undefined if not found
   */
  getNodeSprite(nodeId: string): Phaser.GameObjects.Sprite | undefined {
    return this.nodeSprites.get(nodeId);
  }

  /**
   * Register a node sprite for tracking
   * @param nodeId - The ID of the node
   * @param sprite - The sprite to register
   */
  registerNodeSprite(nodeId: string, sprite: Phaser.GameObjects.Sprite): void {
    this.nodeSprites.set(nodeId, sprite);
  }

  /**
   * Render a node sprite with appropriate visuals
   * @param node - The node to render
   * @param onHoverStart - Callback for hover start events
   * @param onHoverMove - Callback for hover move events
   * @param onHoverEnd - Callback for hover end events
   * @returns The created sprite
   */
  renderNodeSprite(
    node: MapNode,
    onHoverStart?: (node: MapNode, pointer: Phaser.Input.Pointer) => void,
    onHoverMove?: (node: MapNode, pointer: Phaser.Input.Pointer) => void,
    onHoverEnd?: (node: MapNode) => void
  ): Phaser.GameObjects.Sprite | null {
    // Create sprite based on node type
    let spriteKey = "";
    let animKey: string | null = null;

    switch (node.type) {
      case "combat":
      case "elite":
        if (node.enemyId) {
          spriteKey = EnemyRegistry.getOverworldSprite(node.enemyId);
        } else {
          // Fallback to a generic sprite if no enemyId is present
          spriteKey = node.type === "elite" ? "kapre_overworld" : "duwende_overworld";
        }
        break;
      case "boss":
        if (node.enemyId) {
          spriteKey = EnemyRegistry.getOverworldSprite(node.enemyId);
        } else {
          // Fallback to a generic sprite if no enemyId is present
          spriteKey = "kapre_overworld";
        }
        break;
      case "shop":
        spriteKey = "merchant_overworld";
        animKey = null; // Static sprite, no animation
        break;
      case "event":
        spriteKey = "event_overworld";
        animKey = "event_portal_loop";
        break;
      case "campfire":
        spriteKey = "campfire_overworld";
        animKey = "campfire_burn";
        break;
      case "treasure":
        spriteKey = "chest_f0";
        animKey = "chest_open";
        break;
      default:
        // Fallback to a simple circle if no sprite is available
        const fallbackCircle = this.scene.add.circle(
          node.x + this.gridSize / 2,
          node.y + this.gridSize / 2,
          this.gridSize / 4,
          0xffffff,
          1
        );
        fallbackCircle.setOrigin(0.5);
        fallbackCircle.setDepth(DEPTH.FALLBACK_CIRCLE);
        return null;
    }

    // If the expected texture was removed, skip sprite creation gracefully.
    if (!this.scene.textures.exists(spriteKey)) {
      const fallbackCircle = this.scene.add.circle(
        node.x + this.gridSize / 2,
        node.y + this.gridSize / 2,
        this.gridSize / 4,
        0xffffff,
        1
      );
      fallbackCircle.setOrigin(0.5);
      fallbackCircle.setDepth(DEPTH.FALLBACK_CIRCLE);
      return null;
    }

    // Create the sprite
    const nodeSprite = this.scene.add.sprite(
      node.x + this.gridSize / 2,
      node.y + this.gridSize / 2,
      spriteKey
    );
    nodeSprite.setOrigin(0.5);
    nodeSprite.setDepth(DEPTH.MAP_NPCS); // Above the maze

    // Scale the sprite to fit within the grid while maintaining aspect ratio
    const biggerSprites = ["amomongo_overworld", "balete_overworld", "tawonglipod_overworld", "kapre_overworld", "mangangaway_overworld", "tikbalang_overworld"];
    const targetSize = spriteKey === "merchant_overworld" ? 26 : (biggerSprites.includes(spriteKey) ? 48 : 32);
    const scale = targetSize / Math.max(nodeSprite.width, nodeSprite.height);
    nodeSprite.setScale(scale);

    // Store sprite reference for tracking
    this.registerNodeSprite(node.id, nodeSprite);

    // Add hover functionality for all interactive nodes
    if (node.type === "combat" || node.type === "elite" || node.type === "boss" ||
      node.type === "shop" || node.type === "event" || node.type === "campfire" || node.type === "treasure") {
      // Set interactive with an explicit hit area centered on the sprite.
      // NOTE: Phaser hit areas are defined in the GameObject's local space (unscaled),
      // so we compensate for the sprite scale to keep the on-screen hit radius stable.
      const hitAreaSize = targetSize; // desired on-screen diameter
      const localRadius = (hitAreaSize / Math.max(scale, 0.0001)) / 2;
      nodeSprite.setInteractive(
        new Phaser.Geom.Circle(nodeSprite.width / 2, nodeSprite.height / 2, localRadius),
        Phaser.Geom.Circle.Contains
      );

      if (onHoverStart) {
        nodeSprite.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          onHoverStart(node, pointer);

          // Set cursor to pointer when hovering over nodes
          this.scene.input.setDefaultCursor('pointer');

          // Add hover effect to sprite
          this.scene.tweens.add({
            targets: nodeSprite,
            scale: scale * 1.2, // Slightly bigger than normal
            duration: 150,
            ease: 'Power2'
          });
        });
      }

      if (onHoverMove) {
        nodeSprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
          onHoverMove(node, pointer);
        });
      }

      if (onHoverEnd) {
        nodeSprite.on('pointerout', () => {
          onHoverEnd(node);

          // Reset cursor when leaving node
          this.scene.input.setDefaultCursor('default');

          // Reset sprite scale
          this.scene.tweens.add({
            targets: nodeSprite,
            scale: scale, // Back to normal size
            duration: 150,
            ease: 'Power2'
          });
        });
      }
    }

    // Play the animation if it exists
    if (animKey && this.scene.anims.exists(animKey)) {
      const animation = this.scene.anims.get(animKey);
      if (!animation || animation.frames.length === 0) {
        return nodeSprite;
      }
      nodeSprite.play(animKey);
    }

    return nodeSprite;
  }

  /**
   * Update a node's position in the tracking system
   * @param node - The node to update
   */
  updateNodePosition(node: MapNode): void {
    const existingNode = this.nodes.find(n => n.id === node.id);
    if (existingNode) {
      existingNode.x = node.x;
      existingNode.y = node.y;
    }
  }

  /**
   * Get the grid size
   * @returns The size of each grid cell in pixels
   */
  getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Get chunk size in pixels
   * @returns The size of a chunk in pixels
   */
  getChunkSizePixels(): number {
    return this.overworldGen.chunkSize * this.gridSize;
  }

  /**
   * Move enemy nodes toward the player during nighttime.
   * 
   * Includes:
   *  - Alert visuals: a "!" icon appears above an enemy the first time it
   *    detects the player each night cycle.
   *  - Debug logging gated behind DEBUG_ENEMY_AI flag.
   */
  moveEnemiesNighttime(gameState: any, playerX: number, playerY: number, gridSize: number, scene: Scene): void {
    // Only move enemies during nighttime
    if (gameState.isDay) {
      // Day started — reset alert icons and path caches so next night is fresh
      this.resetNighttimeState();
      return;
    }

    // New movement round — clear reservations
    this.reservedTiles.clear();

    // Define proximity threshold for enemy movement (in pixels)
    const movementRange = gridSize * 10; // 10 grid squares for breathing room

    // Find nearby enemy nodes based on distance
    const enemyNodes = this.nodes.filter((node: MapNode) => {
      if (node.type !== "combat" && node.type !== "elite") {
        return false;
      }

      const enemyX = node.x + gridSize / 2;
      const enemyY = node.y + gridSize / 2;
      const distance = Phaser.Math.Distance.Between(playerX, playerY, enemyX, enemyY);

      return distance <= movementRange;
    });

    if (DEBUG_ENEMY_AI) console.log(`🌙 Night: ${enemyNodes.length} enemies nearby player`);

    // Move each enemy node with enhanced AI
    enemyNodes.forEach((enemyNode: MapNode) => {
      // Show alert icon on first detection
      this.showEnemyAlert(enemyNode, gridSize, scene);

      this.moveEnemyWithEnhancedAI(enemyNode, playerX, playerY, gridSize, scene);
    });
  }

  /**
   * Reset nighttime state (called when day starts).
   * Clears alert icons and path caches so next night is fresh.
   */
  private resetNighttimeState(): void {
    if (this.enemyAlerted.size === 0) return;

    this.enemyAlerted.clear();
    this.enemyPaths.clear();

    // Destroy all alert sprites
    this.enemyAlertSprites.forEach((sprite) => {
      sprite.destroy();
    });
    this.enemyAlertSprites.clear();
  }

  /**
   * Enhanced AI movement system for enemies with A* pathfinding.
   * Now also advances the path cache and moves alert icons with the enemy.
   */
  private moveEnemyWithEnhancedAI(enemyNode: MapNode, playerX: number, playerY: number, gridSize: number, scene: Scene): void {
    const currentX = enemyNode.x + gridSize / 2;
    const currentY = enemyNode.y + gridSize / 2;
    const distance = Phaser.Math.Distance.Between(currentX, currentY, playerX, playerY);

    // Check if enemy is already at collision distance before moving
    if (distance < gridSize) {
      if (DEBUG_ENEMY_AI) console.log(`💥 Enemy already at collision distance: ${distance.toFixed(2)}`);
      this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
      return; // Don't move, collision check will handle it
    }

    // Different movement strategies based on distance and enemy type
    const movementSpeed = this.calculateEnemyMovementSpeed(enemyNode, distance);
    const movements: { x: number, y: number }[] = [];

    // Use A* pathfinding with path caching
    const enemyId = enemyNode.id;
    const path = this.getEnemyPath(enemyId, currentX, currentY, playerX, playerY);

    if (path.length > 0) {
      if (DEBUG_ENEMY_AI) console.log(`🧭 Following A* path with ${path.length} waypoints`);

      // Take as many steps from the path as movement speed allows
      for (let i = 0; i < Math.min(movementSpeed, path.length); i++) {
        const waypoint = path[i];

        const stepPosition = {
          x: waypoint.x - gridSize / 2,
          y: waypoint.y - gridSize / 2
        };

        const stepCX = stepPosition.x + gridSize / 2;
        const stepCY = stepPosition.y + gridSize / 2;

        // Block move if another enemy already occupies this tile
        if (this.isOccupiedByEnemy(stepCX, stepCY, enemyId)) {
          break; // Can't pass through — stop before the occupied tile
        }

        const newDistance = Phaser.Math.Distance.Between(playerX, playerY, stepCX, stepCY);

        if (newDistance < gridSize) {
          // Stop one tile away; trigger collision handling instead of stepping onto player.
          if (DEBUG_ENEMY_AI) console.log(`💥 Would collide; stopping adjacent. Distance after move: ${newDistance.toFixed(2)}`);
          this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
          break;
        }

        movements.push(stepPosition);
        // Reserve immediately so other enemies can't pick this tile this round.
        this.reserveTileCenter(stepCX, stepCY);
      }

      // Advance the cached path so next turn picks up where we left off
      if (movements.length > 0) {
        const lastMove = movements[movements.length - 1];
        this.advanceEnemyPathCache(enemyId, movements.length, lastMove.x + gridSize / 2, lastMove.y + gridSize / 2);
      }
    } else {
      // Fallback to greedy single-step pathfinding if A* fails
      if (DEBUG_ENEMY_AI) console.log(`⚠️ A* failed, falling back to greedy pathfinding`);

      for (let i = 0; i < movementSpeed; i++) {
        const lastX = movements.length > 0 ? movements[movements.length - 1].x + gridSize / 2 : currentX;
        const lastY = movements.length > 0 ? movements[movements.length - 1].y + gridSize / 2 : currentY;

        const stepPosition = this.calculateSingleEnemyStep(
          lastX,
          lastY,
          playerX,
          playerY,
          gridSize,
          enemyId
        );

        if (stepPosition) {
          const stepCX = stepPosition.x + gridSize / 2;
          const stepCY = stepPosition.y + gridSize / 2;

          // Block move if another enemy already occupies this tile
          if (this.isOccupiedByEnemy(stepCX, stepCY, enemyId)) {
            break;
          }

          const newDistance = Phaser.Math.Distance.Between(playerX, playerY, stepCX, stepCY);

          if (newDistance < gridSize) {
            if (DEBUG_ENEMY_AI) console.log(`💥 Would collide; stopping adjacent. Distance after move: ${newDistance.toFixed(2)}`);
            this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
            break;
          }

          movements.push(stepPosition);
          this.reserveTileCenter(stepCX, stepCY);
        } else {
          break;
        }
      }
    }

    // Execute the movements with staggered timing
    if (movements.length > 0) {
      this.executeMultiStepMovement(enemyNode, movements, gridSize, scene);
    }
  }

  /**
   * Calculate enemy movement speed based on type and distance.
   * Currently all enemies move exactly 1 tile per player step to keep
   * pacing fair and predictable.
   */
  private calculateEnemyMovementSpeed(_enemyNode: MapNode, _distanceToPlayer: number): number {
    // 1 tile per player action — keeps movement feeling fair and consistent
    return 1;
  }

  /**
   * Calculate a single movement step toward the player.
   * @param excludeId - If provided, tiles occupied by other enemies are also rejected.
   */
  private calculateSingleEnemyStep(currentX: number, currentY: number, playerX: number, playerY: number, gridSize: number, excludeId?: string): { x: number, y: number } | null {
    // Calculate direction to player
    const deltaX = playerX - currentX;
    const deltaY = playerY - currentY;

    // If already at player position, don't move
    if (Math.abs(deltaX) < gridSize / 2 && Math.abs(deltaY) < gridSize / 2) {
      return null;
    }

    // Try different movement options in priority order, ensuring each is walkable
    const movementOptions: Array<{ x: number, y: number, priority: number }> = [];

    // Calculate potential positions
    const moveRight = currentX + gridSize;
    const moveLeft = currentX - gridSize;
    const moveDown = currentY + gridSize;
    const moveUp = currentY - gridSize;

    // Prioritize movements toward the player
    const shouldMoveRight = deltaX > gridSize / 2;
    const shouldMoveLeft = deltaX < -gridSize / 2;
    const shouldMoveDown = deltaY > gridSize / 2;
    const shouldMoveUp = deltaY < -gridSize / 2;

    // Build movement options with priorities (lower = higher priority)
    // Priority 1: Primary axis movement (toward player)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // X-axis is primary
      if (shouldMoveRight) movementOptions.push({ x: moveRight, y: currentY, priority: 1 });
      if (shouldMoveLeft) movementOptions.push({ x: moveLeft, y: currentY, priority: 1 });
      // Secondary Y-axis
      if (shouldMoveDown) movementOptions.push({ x: currentX, y: moveDown, priority: 2 });
      if (shouldMoveUp) movementOptions.push({ x: currentX, y: moveUp, priority: 2 });
    } else {
      // Y-axis is primary
      if (shouldMoveDown) movementOptions.push({ x: currentX, y: moveDown, priority: 1 });
      if (shouldMoveUp) movementOptions.push({ x: currentX, y: moveUp, priority: 1 });
      // Secondary X-axis
      if (shouldMoveRight) movementOptions.push({ x: moveRight, y: currentY, priority: 2 });
      if (shouldMoveLeft) movementOptions.push({ x: moveLeft, y: currentY, priority: 2 });
    }

    // Priority 3: Movements away from player (fallback)
    if (!shouldMoveRight) movementOptions.push({ x: moveRight, y: currentY, priority: 3 });
    if (!shouldMoveLeft) movementOptions.push({ x: moveLeft, y: currentY, priority: 3 });
    if (!shouldMoveDown) movementOptions.push({ x: currentX, y: moveDown, priority: 3 });
    if (!shouldMoveUp) movementOptions.push({ x: currentX, y: moveUp, priority: 3 });

    // Sort by priority and try each option until we find a walkable one
    movementOptions.sort((a, b) => a.priority - b.priority);

    for (const option of movementOptions) {
      // Check if this position is walkable and not occupied by another enemy
      if (this.isValidPosition(option.x, option.y)) {
        if (excludeId && this.isOccupiedByEnemy(option.x, option.y, excludeId)) {
          continue; // Tile is taken by another enemy — try next option
        }
        // Prevent stepping onto the player tile. Stop one tile away and let collision trigger.
        const distAfter = Phaser.Math.Distance.Between(playerX, playerY, option.x, option.y);
        if (distAfter < gridSize) {
          return null;
        }
        // Reserve chosen tile immediately so another enemy won't pick it later this round.
        this.reserveTileCenter(option.x, option.y);
        // Convert back to node coordinates (top-left corner)
        return {
          x: option.x - gridSize / 2,
          y: option.y - gridSize / 2
        };
      }
    }

    // No valid movement found - enemy stays in place
    return null;
  }

  /**
   * Execute multiple movement steps with staggered timing
   */
  private executeMultiStepMovement(enemyNode: MapNode, movements: { x: number, y: number }[], gridSize: number, scene: Scene): void {
    movements.forEach((movement, index) => {
      scene.time.delayedCall(index * 300, () => { // 300ms delay between each step
        this.animateEnemyMovement(enemyNode, movement.x, movement.y, gridSize, scene);
      });
    });
  }

  /**
   * Animate enemy movement to new position.
   * Also repositions the alert icon (if any) above the enemy.
   */
  private animateEnemyMovement(enemyNode: MapNode, newX: number, newY: number, gridSize: number, scene: Scene): void {
    // Update node position
    enemyNode.x = newX;
    enemyNode.y = newY;

    // Update position in manager
    this.updateNodePosition(enemyNode);

    // Get the corresponding sprite from manager
    const sprite = this.getNodeSprite(enemyNode.id);
    if (sprite) {
      // Add visual feedback for aggressive movement
      const isAggressiveMove = enemyNode.type === "elite";

      // Create a brief flash effect for elite enemies
      if (isAggressiveMove) {
        sprite.setTint(0xff4444); // Red tint for aggressive movement
        scene.time.delayedCall(150, () => {
          sprite.clearTint();
        });
      }

      // Destination center
      const destCX = newX + gridSize / 2;
      const destCY = newY + gridSize / 2;

      // Keep reservation (also reserved during planning).
      this.reserveTileCenter(destCX, destCY);

      // Animate sprite movement with dynamic timing (keep scale stable)
      scene.tweens.add({
        targets: sprite,
        x: destCX,
        y: destCY,
        duration: isAggressiveMove ? 120 : 180, // Faster movement for elite enemies
        ease: 'Power2',
        onComplete: () => {
          // Check for collision with player after enemy movement completes
          this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
        }
      });

      // Move the alert icon along with the enemy (if present)
      const alertSprite = this.enemyAlertSprites.get(enemyNode.id);
      if (alertSprite) {
        scene.tweens.add({
          targets: alertSprite,
          x: destCX,
          y: destCY - gridSize * 0.9,
          duration: isAggressiveMove ? 120 : 180,
          ease: 'Power2'
        });
      }
    }
  }

  /**
   * Check if enemy has collided with player and trigger combat if so
   */
  private checkEnemyPlayerCollision(enemyNode: MapNode, gridSize: number, scene: Scene): void {
    // Only check for combat/elite nodes
    if (enemyNode.type !== "combat" && enemyNode.type !== "elite") {
      return;
    }

    const overworldScene = scene as any;
    if (!overworldScene.player) {
      return;
    }

    const playerX = overworldScene.player.x;
    const playerY = overworldScene.player.y;

    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      enemyNode.x + gridSize / 2,
      enemyNode.y + gridSize / 2
    );

    const collisionThreshold = gridSize;

    if (distance < collisionThreshold) {
      if (DEBUG_ENEMY_AI) console.log(`💥 Enemy collision detected! Distance: ${distance.toFixed(2)}, Threshold: ${collisionThreshold}`);

      if (typeof overworldScene.checkNodeInteraction === 'function') {
        overworldScene.checkNodeInteraction();
      }
    }
  }

  // ─── Visual alert system (refinement #9) ──────────────────────────

  /**
   * Show a "!" alert icon above an enemy the first time it detects the player
   * during the current night cycle. The icon pulses once then stays visible
   * (semi-transparent) until the enemy de-aggros or day returns.
   */
  private showEnemyAlert(enemyNode: MapNode, gridSize: number, scene: Scene): void {
    // Only show alert once per enemy per night cycle
    if (this.enemyAlerted.has(enemyNode.id)) return;
    this.enemyAlerted.add(enemyNode.id);

    const cx = enemyNode.x + gridSize / 2;
    const cy = enemyNode.y + gridSize / 2;

    // Create a bold "!" text above the enemy
    const alert = scene.add.text(cx, cy - gridSize * 0.9, '!', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ff3333',
      align: 'center'
    });
    alert.setOrigin(0.5);
    alert.setDepth(DEPTH.ENEMY_ALERT);
    alert.setAlpha(0);

    this.enemyAlertSprites.set(enemyNode.id, alert);

    // Animate: pop-in → hold → fade to semi-transparent
    scene.tweens.add({
      targets: alert,
      alpha: 1,
      scaleX: { from: 2, to: 1 },
      scaleY: { from: 2, to: 1 },
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        // After holding briefly, fade to semi-transparent to stay visible but not distracting
        scene.tweens.add({
          targets: alert,
          alpha: 0.5,
          duration: 600,
          delay: 400,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Also briefly tint the enemy sprite red/orange regardless of type for the alert moment
    const sprite = this.getNodeSprite(enemyNode.id);
    if (sprite) {
      sprite.setTint(0xff6600);
      scene.time.delayedCall(300, () => {
        sprite.clearTint();
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (DEBUG_ENEMY_AI) console.log('🗺️ MazeGenManager cleanup');

    // Clean up alert sprites
    this.enemyAlertSprites.forEach((sprite) => sprite.destroy());
    this.enemyAlertSprites.clear();
    this.enemyAlerted.clear();
    this.enemyPaths.clear();

    this.clearVisibleChunks();
  }
}

/** Alias for consumers that import by the system name. */
export { Overworld_MazeGenManager as MazeGenSystem };

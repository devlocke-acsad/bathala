import { Scene } from 'phaser';
import { MazeOverworldGenerator } from '../../utils/MazeOverworldGenerator';
import { MapNode } from '../../core/types/MapTypes';

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
  
  // Chunk and node tracking
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.GameObject }> = new Map();
  private nodes: MapNode[] = [];
  private nodeSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  
  // Floor textures for randomization
  private floorTextures: string[] = ['floor1', 'floor2', 'floor3'];
  
  // Wall textures for randomization (wall1 and wall2 appear more often as they are trees)
  private wallTextures: string[] = ['wall1', 'wall1', 'wall1', 'wall2', 'wall2', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6'];
  
  // Outer tile markers for chunk connections
  private outerTileMarkers: Phaser.GameObjects.Graphics[] = [];
  private devMode: boolean = false;

  // Advanced Pathfinding System
  private enemyPaths: Map<string, {
    path: Array<{x: number, y: number}>,
    targetX: number,
    targetY: number,
    age: number
  }> = new Map();

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   * @param gridSize - The size of each grid cell in pixels (default: 32)
   * @param devMode - Whether to show debug features like outer tile markers
   */
  constructor(scene: Scene, gridSize: number = 32, devMode: boolean = false) {
    this.scene = scene;
    this.gridSize = gridSize;
    this.devMode = devMode;
    
    console.log('🗺️ MazeGenManager initialized with gridSize:', gridSize, 'devMode:', devMode);
  }

  /**
   * Initialize the maze generator and prepare for a new game
   * Clears the cache and prepares the initial chunk
   */
  initializeNewGame(): void {
    console.log('🗺️ Initializing new game - clearing maze cache');
    
    // Reset the maze generator cache for a new game
    MazeOverworldGenerator.clearCache();
    
    // Clear any existing data
    this.visibleChunks.clear();
    this.nodes = [];
    this.nodeSprites.clear();
    
    // Clear outer tile markers
    this.outerTileMarkers.forEach(marker => marker.destroy());
    this.outerTileMarkers = [];
  }

  /**
   * Calculate a valid starting position for the player
   * Ensures player spawns on a path, not a wall
   * @returns {x, y} - World coordinates for player spawn
   */
  calculatePlayerStartPosition(): { x: number; y: number } {
    console.log('🗺️ Calculating player start position');
    
    // Get the initial chunk to ensure player starts in a valid position
    const initialChunk = MazeOverworldGenerator.getChunk(0, 0, this.gridSize);
    
    // Find a valid starting position in the center of the initial chunk
    const chunkCenterX = Math.floor(MazeOverworldGenerator['chunkSize'] / 2);
    const chunkCenterY = Math.floor(MazeOverworldGenerator['chunkSize'] / 2);
    
    // Ensure the center position is a path
    let startX = chunkCenterX * this.gridSize + this.gridSize / 2;
    let startY = chunkCenterY * this.gridSize + this.gridSize / 2;
    
    // If center is a wall, find the nearest path
    if (initialChunk.maze[chunkCenterY][chunkCenterX] === 1) {
      console.log('🗺️ Center is a wall, searching for nearest path');
      
      // Search for nearby paths
      let foundPath = false;
      for (let distance = 1; distance < 5 && !foundPath; distance++) {
        for (let dy = -distance; dy <= distance && !foundPath; dy++) {
          for (let dx = -distance; dx <= distance && !foundPath; dx++) {
            const newY = chunkCenterY + dy;
            const newX = chunkCenterX + dx;
            if (newY >= 0 && newY < initialChunk.maze.length && 
                newX >= 0 && newX < initialChunk.maze[0].length && 
                initialChunk.maze[newY][newX] === 0) {
              startX = newX * this.gridSize + this.gridSize / 2;
              startY = newY * this.gridSize + this.gridSize / 2;
              foundPath = true;
              console.log('🗺️ Found valid path at offset:', { dx, dy });
            }
          }
        }
      }
    }
    
    console.log('🗺️ Player start position:', { x: startX, y: startY });
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
    const chunkSize = MazeOverworldGenerator['chunkSize'];
    const chunkSizePixels = chunkSize * this.gridSize;
    
    const chunkX = Math.floor(x / chunkSizePixels);
    const chunkY = Math.floor(y / chunkSizePixels);
    const localX = x - (chunkX * chunkSizePixels);
    const localY = y - (chunkY * chunkSizePixels);
    const gridX = Math.floor(localX / this.gridSize);
    const gridY = Math.floor(localY / this.gridSize);
    
    // Get the chunk
    const chunk = MazeOverworldGenerator.getChunk(chunkX, chunkY, this.gridSize);
    
    // Check bounds
    if (gridX < 0 || gridX >= chunk.maze[0].length || gridY < 0 || gridY >= chunk.maze.length) {
      return false;
    }
    
    // Check if it's a path (0) not a wall (1)
    return chunk.maze[gridY][gridX] === 0;
  }

  /**
   * IMPROVEMENT #1: A* Pathfinding Algorithm
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
  ): Array<{x: number, y: number}> {
    
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
    
    openSet.push(startNode);
    let iterations = 0;
    
    while (openSet.length > 0 && iterations < maxDepth * 10) {
      iterations++;
      
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      
      // Goal reached
      if (Math.abs(current.x - targetX) < this.gridSize && 
          Math.abs(current.y - targetY) < this.gridSize) {
        // Reconstruct path
        const path: Array<{x: number, y: number}> = [];
        let node: PathNode | null = current;
        while (node && node.parent) {
          path.unshift({x: node.x, y: node.y});
          node = node.parent;
        }
        
        console.log(`🎯 A* found path with ${path.length} steps in ${iterations} iterations`);
        return path;
      }
      
      closedSet.add(posKey(current.x, current.y));
      
      // Check neighbors (4-directional + diagonals)
      const neighbors = [
        // Cardinal directions
        {x: current.x + this.gridSize, y: current.y, diagonal: false},
        {x: current.x - this.gridSize, y: current.y, diagonal: false},
        {x: current.x, y: current.y + this.gridSize, diagonal: false},
        {x: current.x, y: current.y - this.gridSize, diagonal: false},
        // Diagonals
        {x: current.x + this.gridSize, y: current.y + this.gridSize, diagonal: true},
        {x: current.x + this.gridSize, y: current.y - this.gridSize, diagonal: true},
        {x: current.x - this.gridSize, y: current.y + this.gridSize, diagonal: true},
        {x: current.x - this.gridSize, y: current.y - this.gridSize, diagonal: true},
      ];
      
      for (const neighbor of neighbors) {
        const key = posKey(neighbor.x, neighbor.y);
        
        // Skip if already evaluated
        if (closedSet.has(key)) continue;
        
        // Check walkability
        if (!this.isValidPosition(neighbor.x, neighbor.y)) continue;
        
        // For diagonals, check adjacent tiles to prevent corner-cutting
        if (neighbor.diagonal) {
          const dx = neighbor.x - current.x;
          const dy = neighbor.y - current.y;
          if (!this.isValidPosition(current.x + dx, current.y) ||
              !this.isValidPosition(current.x, current.y + dy)) {
            continue; // Diagonal blocked
          }
        }
        
        const g = current.g + (neighbor.diagonal ? 1.414 : 1); // Diagonal costs more
        const h = heuristic(neighbor.x, neighbor.y);
        const f = g + h;
        
        // Check if neighbor is already in open set with lower cost
        const existingNode = openSet.find(n => 
          Math.abs(n.x - neighbor.x) < this.gridSize / 2 && 
          Math.abs(n.y - neighbor.y) < this.gridSize / 2
        );
        
        if (existingNode && existingNode.g <= g) continue;
        
        // Add to open set
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g, h, f,
          parent: current
        });
      }
    }
    
    console.log(`⚠️ A* no path found after ${iterations} iterations`);
    // No path found - return empty
    return [];
  }

  /**
   * IMPROVEMENT #3: Path Caching System
   * Get or calculate path for enemy with caching
   * 
   * @param enemyId - Unique enemy identifier
   * @param currentX - Enemy current X coordinate
   * @param currentY - Enemy current Y coordinate
   * @param targetX - Player X coordinate
   * @param targetY - Player Y coordinate
   * @returns Cached or newly calculated path
   */
  private getEnemyPath(
    enemyId: string,
    currentX: number,
    currentY: number,
    targetX: number,
    targetY: number
  ): Array<{x: number, y: number}> {
    
    const cached = this.enemyPaths.get(enemyId);
    
    // Reuse cached path if:
    // 1. Path exists
    // 2. Target hasn't moved much (within 2 grid squares)
    // 3. Path is recent (< 5 turns old)
    if (cached && 
        Math.abs(cached.targetX - targetX) < this.gridSize * 2 &&
        Math.abs(cached.targetY - targetY) < this.gridSize * 2 &&
        cached.age < 5) {
      
      cached.age++;
      console.log(`📦 Using cached path for ${enemyId} (age: ${cached.age})`);
      return cached.path;
    }
    
    // Calculate new path using A*
    console.log(`🔍 Calculating new path for ${enemyId}`);
    const path = this.findPathToPlayer(currentX, currentY, targetX, targetY);
    
    this.enemyPaths.set(enemyId, {
      path,
      targetX,
      targetY,
      age: 0
    });
    
    return path;
  }

  /**
   * Update visible chunks based on camera position
   * Handles chunk culling and loading new chunks as the camera moves
   * @param camera - The main camera
   */
  updateVisibleChunks(camera: Phaser.Cameras.Scene2D.Camera): void {
    // Determine which chunks are visible based on camera position
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    
    const startX = Math.floor((camera.scrollX - chunkSizePixels) / chunkSizePixels);
    const endX = Math.ceil((camera.scrollX + camera.width + chunkSizePixels) / chunkSizePixels);
    const startY = Math.floor((camera.scrollY - chunkSizePixels) / chunkSizePixels);
    const endY = Math.ceil((camera.scrollY + camera.height + chunkSizePixels) / chunkSizePixels);
    
    // Remove chunks that are no longer visible
    for (const [key, chunk] of this.visibleChunks) {
      const [chunkX, chunkY] = key.split(',').map(Number);
      if (chunkX < startX || chunkX > endX || chunkY < startY || chunkY > endY) {
        // Clean up graphics
        chunk.graphics.destroy();
        
        // Clean up node sprites from this chunk
        const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
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
          const chunk = MazeOverworldGenerator.getChunk(x, y, this.gridSize);
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
    const chunkSize = MazeOverworldGenerator['chunkSize'];
    const chunkSizePixels = chunkSize * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        const tileX = offsetX + x * this.gridSize;
        const tileY = offsetY + y * this.gridSize;
        
        if (maze[y][x] === 1) {
          // Wall - Use one of the wall assets with deterministic selection
          const wallIndex = this.getDeterministicIndex(chunkX, chunkY, x, y, this.wallTextures.length);
          const wallSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, this.wallTextures[wallIndex]);
          wallSprite.setDisplaySize(this.gridSize, this.gridSize);
          wallSprite.setOrigin(0.5);
          wallSprite.clearTint();
          container.add(wallSprite);
        } else {
          // Path - Use one of the floor assets with deterministic selection
          const floorIndex = this.getDeterministicIndex(chunkX, chunkY, x, y, this.floorTextures.length);
          const floorSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, this.floorTextures[floorIndex]);
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
   * Check if a tile position is on the border of a chunk
   */
  private isOuterTile(x: number, y: number, chunkSize: number): boolean {
    return x === 0 || x === chunkSize - 1 || y === 0 || y === chunkSize - 1;
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
        const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
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
          let spriteKeyBase = node.enemyId.toLowerCase().split(" ")[0];
          if (spriteKeyBase === "tawong") {
            spriteKeyBase = "tawonglipod";
          }
          // Additional check in case the enemyId is stored differently
          if (node.enemyId.toLowerCase().includes("tawong")) {
            spriteKeyBase = "tawonglipod";
          }
          spriteKey = spriteKeyBase + "_overworld";
        } else {
          // Fallback to a generic sprite if no enemyId is present
          spriteKey = node.type === "elite" ? "big_demon_f0" : "chort_f0";
        }
        break;
      case "boss":
        if (node.enemyId) {
          let spriteKeyBase = node.enemyId.toLowerCase().split(" ")[0];
          spriteKey = spriteKeyBase + "_overworld";
        } else {
          // Fallback to a generic sprite if no enemyId is present
          spriteKey = "big_demon_f0";
        }
        break;
      case "shop":
        spriteKey = "necromancer_f0";
        animKey = "necromancer_idle";
        break;
      case "event":
        spriteKey = "doc_f0";
        animKey = "doc_idle";
        break;
      case "campfire":
        spriteKey = "angel_f0";
        animKey = "angel_idle";
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
        fallbackCircle.setDepth(501);
        return null;
    }
    
    // Create the sprite
    const nodeSprite = this.scene.add.sprite(
      node.x + this.gridSize / 2, 
      node.y + this.gridSize / 2, 
      spriteKey
    );
    nodeSprite.setOrigin(0.5);
    nodeSprite.setDepth(501); // Above the maze

    // Scale the sprite to fit within the grid while maintaining aspect ratio
    const biggerSprites = ["amomongo_overworld", "balete_overworld", "tawonglipod_overworld", "kapre_overworld", "mangangaway_overworld", "tikbalang_overworld"];
    const targetSize = biggerSprites.includes(spriteKey) ? 48 : 32;
    const scale = targetSize / Math.max(nodeSprite.width, nodeSprite.height);
    nodeSprite.setScale(scale);
    
    // Store sprite reference for tracking
    this.registerNodeSprite(node.id, nodeSprite);
    
    // Add hover functionality for all interactive nodes
    if (node.type === "combat" || node.type === "elite" || node.type === "boss" || 
        node.type === "shop" || node.type === "event" || node.type === "campfire" || node.type === "treasure") {
      // Set interactive with explicit hit area to prevent cursor issues
      const hitAreaSize = targetSize;
      nodeSprite.setInteractive(
        new Phaser.Geom.Circle(0, 0, hitAreaSize / 2),
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
    return MazeOverworldGenerator['chunkSize'] * this.gridSize;
  }

  /**
   * Move enemy nodes toward the player during nighttime
   */
  moveEnemiesNighttime(gameState: any, playerX: number, playerY: number, gridSize: number, scene: Scene): void {
    // Only move enemies during nighttime
    if (gameState.isDay) {
      return;
    }

    // Define proximity threshold for enemy movement (in pixels)
    const movementRange = gridSize * 10; // 10 grid squares for breathing room

    // Find nearby enemy nodes based on distance only
    const enemyNodes = this.nodes.filter((node: MapNode) => {
      if (node.type !== "combat" && node.type !== "elite") {
        return false;
      }
      
      const enemyX = node.x + gridSize / 2;
      const enemyY = node.y + gridSize / 2;
      const distance = Phaser.Math.Distance.Between(playerX, playerY, enemyX, enemyY);
      
      // Only check: within movement range
      return distance <= movementRange;
    });

    console.log(`🌙 Night: ${enemyNodes.length} enemies nearby player`);

    // Move each enemy node with enhanced AI (now using A* pathfinding)
    enemyNodes.forEach((enemyNode: MapNode) => {
      this.moveEnemyWithEnhancedAI(enemyNode, playerX, playerY, gridSize, scene);
    });
  }

  /**
   * Enhanced AI movement system for enemies with A* pathfinding
   * IMPROVEMENT: Integrates A* pathfinding, line-of-sight, and path caching
   */
  private moveEnemyWithEnhancedAI(enemyNode: MapNode, playerX: number, playerY: number, gridSize: number, scene: Scene): void {
    const currentX = enemyNode.x + gridSize / 2;
    const currentY = enemyNode.y + gridSize / 2;
    const distance = Phaser.Math.Distance.Between(currentX, currentY, playerX, playerY);
    
    // Check if enemy is already at collision distance before moving
    if (distance < gridSize) {
      console.log(`💥 Enemy already at collision distance: ${distance.toFixed(2)}`);
      this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
      return; // Don't move, collision check will handle it
    }
    
    // Different movement strategies based on distance and enemy type
    let movementSpeed = this.calculateEnemyMovementSpeed(enemyNode, distance);
    let movements: {x: number, y: number}[] = [];
    
    // IMPROVEMENT: Use A* pathfinding with path caching
    const enemyId = enemyNode.id;
    const path = this.getEnemyPath(enemyId, currentX, currentY, playerX, playerY);
    
    if (path.length > 0) {
      // Use A* calculated path
      console.log(`🧭 Following A* path with ${path.length} waypoints`);
      
      // Take as many steps from the path as movement speed allows
      for (let i = 0; i < Math.min(movementSpeed, path.length); i++) {
        const waypoint = path[i];
        
        // Convert world coordinates to grid coordinates
        const stepPosition = {
          x: waypoint.x - gridSize / 2,
          y: waypoint.y - gridSize / 2
        };
        
        // Check if this movement would result in collision
        const newDistance = Phaser.Math.Distance.Between(
          playerX,
          playerY,
          stepPosition.x + gridSize / 2,
          stepPosition.y + gridSize / 2
        );
        
        // If movement brings us within collision range, stop here and trigger collision
        if (newDistance < gridSize) {
          movements.push(stepPosition);
          console.log(`💥 Movement will cause collision. Distance after move: ${newDistance.toFixed(2)}`);
          break; // Stop movement chain, collision will trigger after animation
        }
        
        movements.push(stepPosition);
      }
    } else {
      // Fallback to greedy single-step pathfinding if A* fails
      console.log(`⚠️ A* failed, falling back to greedy pathfinding`);
      
      // Calculate multiple movement steps for faster enemies
      for (let i = 0; i < movementSpeed; i++) {
        // Calculate next position from current position (or last movement position)
        const lastX = movements.length > 0 ? movements[movements.length - 1].x + gridSize / 2 : currentX;
        const lastY = movements.length > 0 ? movements[movements.length - 1].y + gridSize / 2 : currentY;
        
        const stepPosition = this.calculateSingleEnemyStep(
          lastX,
          lastY,
          playerX, 
          playerY,
          gridSize
        );
        
        // calculateSingleEnemyStep now handles walkability validation internally
        if (stepPosition) {
          // Check if this movement would result in collision
          const newDistance = Phaser.Math.Distance.Between(
            playerX,
            playerY,
            stepPosition.x + gridSize / 2,
            stepPosition.y + gridSize / 2
          );
          
          // If movement brings us within collision range, stop here and trigger collision
          if (newDistance < gridSize) {
            movements.push(stepPosition);
            console.log(`💥 Movement will cause collision. Distance after move: ${newDistance.toFixed(2)}`);
            break; // Stop movement chain, collision will trigger after animation
          }
          
          movements.push(stepPosition);
        } else {
          break; // Stop if no valid movement found
        }
      }
    }
    
    // Execute the movements with staggered timing
    if (movements.length > 0) {
      this.executeMultiStepMovement(enemyNode, movements, gridSize, scene);
    }
  }

  /**
   * Calculate enemy movement speed based on type and distance
   */
  private calculateEnemyMovementSpeed(enemyNode: MapNode, distanceToPlayer: number): number {
    let baseSpeed = 1;
    
    // Elite enemies only get a small speed boost
    if (enemyNode.type === "elite") {
      baseSpeed = 1; // Reduced from 2 to 1
    }
    
    // Much more conservative distance-based speed increases
    const gridDistance = distanceToPlayer / this.gridSize;
    if (gridDistance <= 2) {
      baseSpeed += 1; // Only very close enemies (2 grids) get +1 speed
    }
    
    // Reduced randomization chance and impact
    if (Math.random() < 0.15) { // Reduced from 30% to 15%
      baseSpeed += 1;
    }
    
    return Math.min(baseSpeed, 2); // Cap at 2 movements per turn instead of 4
  }

  /**
   * Calculate a single movement step toward the player
   */
  private calculateSingleEnemyStep(currentX: number, currentY: number, playerX: number, playerY: number, gridSize: number): { x: number, y: number } | null {
    // Calculate direction to player
    const deltaX = playerX - currentX;
    const deltaY = playerY - currentY;
    
    // If already at player position, don't move
    if (Math.abs(deltaX) < gridSize / 2 && Math.abs(deltaY) < gridSize / 2) {
      return null;
    }
    
    // Try different movement options in priority order, ensuring each is walkable
    const movementOptions: Array<{x: number, y: number, priority: number}> = [];
    
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
    // Priority 0: Direct diagonal movement toward player
    // IMPORTANT: Diagonal movement requires BOTH adjacent tiles to be walkable to prevent corner-cutting
    if (shouldMoveRight && shouldMoveDown && Math.random() < 0.3) {
      // Only allow diagonal if both horizontal AND vertical paths are clear
      if (this.isValidPosition(moveRight, currentY) && this.isValidPosition(currentX, moveDown)) {
        movementOptions.push({x: moveRight, y: moveDown, priority: 0});
      }
    }
    if (shouldMoveRight && shouldMoveUp && Math.random() < 0.3) {
      // Only allow diagonal if both horizontal AND vertical paths are clear
      if (this.isValidPosition(moveRight, currentY) && this.isValidPosition(currentX, moveUp)) {
        movementOptions.push({x: moveRight, y: moveUp, priority: 0});
      }
    }
    if (shouldMoveLeft && shouldMoveDown && Math.random() < 0.3) {
      // Only allow diagonal if both horizontal AND vertical paths are clear
      if (this.isValidPosition(moveLeft, currentY) && this.isValidPosition(currentX, moveDown)) {
        movementOptions.push({x: moveLeft, y: moveDown, priority: 0});
      }
    }
    if (shouldMoveLeft && shouldMoveUp && Math.random() < 0.3) {
      // Only allow diagonal if both horizontal AND vertical paths are clear
      if (this.isValidPosition(moveLeft, currentY) && this.isValidPosition(currentX, moveUp)) {
        movementOptions.push({x: moveLeft, y: moveUp, priority: 0});
      }
    }
    
    // Priority 1: Primary axis movement (toward player)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // X-axis is primary
      if (shouldMoveRight) movementOptions.push({x: moveRight, y: currentY, priority: 1});
      if (shouldMoveLeft) movementOptions.push({x: moveLeft, y: currentY, priority: 1});
      // Secondary Y-axis
      if (shouldMoveDown) movementOptions.push({x: currentX, y: moveDown, priority: 2});
      if (shouldMoveUp) movementOptions.push({x: currentX, y: moveUp, priority: 2});
    } else {
      // Y-axis is primary
      if (shouldMoveDown) movementOptions.push({x: currentX, y: moveDown, priority: 1});
      if (shouldMoveUp) movementOptions.push({x: currentX, y: moveUp, priority: 1});
      // Secondary X-axis
      if (shouldMoveRight) movementOptions.push({x: moveRight, y: currentY, priority: 2});
      if (shouldMoveLeft) movementOptions.push({x: moveLeft, y: currentY, priority: 2});
    }
    
    // Priority 3: Movements away from player (fallback)
    if (!shouldMoveRight) movementOptions.push({x: moveRight, y: currentY, priority: 3});
    if (!shouldMoveLeft) movementOptions.push({x: moveLeft, y: currentY, priority: 3});
    if (!shouldMoveDown) movementOptions.push({x: currentX, y: moveDown, priority: 3});
    if (!shouldMoveUp) movementOptions.push({x: currentX, y: moveUp, priority: 3});
    
    // Sort by priority and try each option until we find a walkable one
    movementOptions.sort((a, b) => a.priority - b.priority);
    
    for (const option of movementOptions) {
      // Check if this position is walkable
      if (this.isValidPosition(option.x, option.y)) {
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
  private executeMultiStepMovement(enemyNode: MapNode, movements: {x: number, y: number}[], gridSize: number, scene: Scene): void {
    movements.forEach((movement, index) => {
      scene.time.delayedCall(index * 300, () => { // Increased to 300ms delay between each step
        this.animateEnemyMovement(enemyNode, movement.x, movement.y, gridSize, scene);
      });
    });
  }

  /**
   * Animate enemy movement to new position
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
      
      // Animate sprite movement with dynamic timing
      scene.tweens.add({
        targets: sprite,
        x: newX + gridSize / 2,
        y: newY + gridSize / 2,
        duration: isAggressiveMove ? 120 : 180, // Faster movement for elite enemies
        ease: 'Power2',
        onStart: () => {
          // Slightly scale up during movement for emphasis
          sprite.setScale(1.6);
        },
        onComplete: () => {
          // Return to normal scale
          sprite.setScale(1.5);
          
          // Check for collision with player after enemy movement completes
          this.checkEnemyPlayerCollision(enemyNode, gridSize, scene);
        }
      });
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
    
    // Get player position from the scene (assuming Overworld scene has a player sprite)
    const overworldScene = scene as any;
    if (!overworldScene.player) {
      return;
    }
    
    const playerX = overworldScene.player.x;
    const playerY = overworldScene.player.y;
    
    // Calculate distance between enemy node center and player
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      enemyNode.x + gridSize / 2,
      enemyNode.y + gridSize / 2
    );
    
    // Use the same threshold as checkNodeInteraction for consistency
    const collisionThreshold = gridSize;
    
    if (distance < collisionThreshold) {
      console.log(`💥 Enemy collision detected! Distance: ${distance.toFixed(2)}, Threshold: ${collisionThreshold}`);
      
      // Trigger the node interaction in the overworld scene
      if (typeof overworldScene.checkNodeInteraction === 'function') {
        overworldScene.checkNodeInteraction();
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    console.log('🗺️ MazeGenManager cleanup');
    this.clearVisibleChunks();
  }
}

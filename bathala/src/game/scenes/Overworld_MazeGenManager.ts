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

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   * @param gridSize - The size of each grid cell in pixels (default: 32)
   */
  constructor(scene: Scene, gridSize: number = 32) {
    this.scene = scene;
    this.gridSize = gridSize;
    
    console.log('🗺️ MazeGenManager initialized with gridSize:', gridSize);
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
        chunk.graphics.destroy();
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
            if (!this.nodes.some(n => n.id === node.id)) {
              this.nodes.push(node);
              // Node rendering will be handled by caller passing in render callback
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
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        const tileX = offsetX + x * this.gridSize;
        const tileY = offsetY + y * this.gridSize;
        
        if (maze[y][x] === 1) {
          // Wall - Use wall1 asset
          const wallSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, 'wall1');
          wallSprite.setDisplaySize(this.gridSize, this.gridSize);
          wallSprite.setOrigin(0.5);
          wallSprite.clearTint();
          container.add(wallSprite);
        } else {
          // Path - Use one of the floor assets with randomization
          const randomFloor = Phaser.Utils.Array.GetRandom(this.floorTextures);
          const floorSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, randomFloor);
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
      nodeSprite.setInteractive();
      
      if (onHoverStart) {
        nodeSprite.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          onHoverStart(node, pointer);
          
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
   * Clean up resources
   */
  destroy(): void {
    console.log('🗺️ MazeGenManager cleanup');
    
    // Destroy all visible chunk graphics
    for (const chunk of this.visibleChunks.values()) {
      chunk.graphics.destroy();
    }
    
    this.visibleChunks.clear();
    this.nodes = [];
    this.nodeSprites.clear();
  }
}

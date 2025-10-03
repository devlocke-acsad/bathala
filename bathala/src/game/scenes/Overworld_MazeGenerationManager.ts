import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";

/**
 * Manager responsible for all maze generation, chunk rendering, and node management
 * in the Overworld scene. This separates maze-related functionality from the main scene logic.
 */
export class OverworldMazeGenerationManager {
  private scene: Scene;
  private nodes: MapNode[] = [];
  private nodeSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> = new Map();
  private gridSize: number = 32;
  
  // Player tracking for automatic chunk updates
  private lastPlayerPosition: { x: number, y: number } = { x: 0, y: 0 };
  private chunkUpdateThreshold: number = 64; // Update chunks when player moves this far

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initialize the maze system and return a valid starting position for the player
   */
  initializeMaze(savedPosition?: { x: number, y: number }): { x: number, y: number } {
    if (savedPosition) {
      return savedPosition;
    }

    // Reset the maze generator cache for a new game
    MazeOverworldGenerator.clearCache();
    
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
            }
          }
        }
      }
    }

    return { x: startX, y: startY };
  }

  /**
   * Update visible chunks based on camera position
   */
  updateVisibleChunks(): void {
    // Ensure camera is available before proceeding
    if (!this.scene.cameras || !this.scene.cameras.main) {
      console.warn("Camera not available, skipping chunk update");
      return;
    }
    
    // Determine which chunks are visible based on camera position
    const camera = this.scene.cameras.main;
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
              this.renderNode(node);
            }
          });
        }
      }
    }
  }

  /**
   * Render a chunk of the maze
   */
  private renderChunk(chunkX: number, chunkY: number, maze: number[][]): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        if (maze[y][x] === 1) { // Wall
          // Rich dark brown stone walls
          graphics.fillStyle(0x3d291f);
          graphics.fillRect(
            offsetX + x * this.gridSize,
            offsetY + y * this.gridSize,
            this.gridSize,
            this.gridSize
          );
        } else { // Path
          // Weathered stone path
          graphics.fillStyle(0x5a4a3f);
          graphics.fillRect(
            offsetX + x * this.gridSize,
            offsetY + y * this.gridSize,
            this.gridSize,
            this.gridSize
          );
        }
      }
    }
    
    return graphics;
  }

  /**
   * Render a node on the maze
   */
  private renderNode(node: MapNode): void {
    // Create sprite based on node type
    let spriteKey = "";
    let animKey = "";
    
    switch (node.type) {
      case "combat":
        spriteKey = "chort_f0";
        animKey = "chort_idle";
        break;
      case "elite":
        spriteKey = "big_demon_f0";
        animKey = "big_demon_idle";
        break;
      case "boss":
        // For now, use the elite sprite as placeholder for boss
        spriteKey = "big_demon_f0";
        animKey = "big_demon_idle";
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
        return;
    }
    
    // Create the sprite
    const nodeSprite = this.scene.add.sprite(
      node.x + this.gridSize / 2, 
      node.y + this.gridSize / 2, 
      spriteKey
    );
    nodeSprite.setOrigin(0.5);
    nodeSprite.setDepth(501); // Above the maze
    nodeSprite.setScale(1.5); // Scale up a bit for better visibility
    
    // Store sprite reference for tracking
    this.nodeSprites.set(node.id, nodeSprite);
    
    // Add hover functionality for all interactive nodes
    if (node.type === "combat" || node.type === "elite" || node.type === "boss" || 
        node.type === "shop" || node.type === "event" || node.type === "campfire" || node.type === "treasure") {
      nodeSprite.setInteractive();
      
      // Emit events that the parent scene can listen to
      nodeSprite.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        this.scene.events.emit('nodeHover', node, pointer);
      });
      
      nodeSprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        this.scene.events.emit('nodeMove', node, pointer);
      });
      
      nodeSprite.on('pointerout', () => {
        this.scene.events.emit('nodeHoverEnd', node);
      });
      
      nodeSprite.on('pointerdown', () => {
        this.scene.events.emit('nodeClick', node);
      });
    }
    
    // Play the animation if it exists
    if (this.scene.anims.exists(animKey)) {
      nodeSprite.play(animKey);
    }
  }

  /**
   * Check if a position is valid (not a wall)
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
   * Animate enemy movement to new position
   */
  animateEnemyMovement(enemyNode: MapNode, newX: number, newY: number): void {
    // Update node position
    enemyNode.x = newX;
    enemyNode.y = newY;
    
    // Get the corresponding sprite
    const sprite = this.nodeSprites.get(enemyNode.id);
    if (sprite) {
      // Add visual feedback for aggressive movement
      const isAggressiveMove = enemyNode.type === "elite";
      
      // Create a brief flash effect for elite enemies
      if (isAggressiveMove) {
        sprite.setTint(0xff4444); // Red tint for aggressive movement
        this.scene.time.delayedCall(150, () => {
          sprite.clearTint();
        });
      }
      
      // Animate sprite movement with dynamic timing
      this.scene.tweens.add({
        targets: sprite,
        x: newX + this.gridSize / 2,
        y: newY + this.gridSize / 2,
        duration: isAggressiveMove ? 120 : 180, // Faster movement for elite enemies
        ease: 'Power2',
        onStart: () => {
          // Slightly scale up during movement for emphasis
          sprite.setScale(1.6);
        },
        onComplete: () => {
          // Return to normal scale
          sprite.setScale(1.5);
        }
      });
    }
  }

  /**
   * Remove a node and its sprite from the game
   */
  removeNode(nodeId: string): void {
    // Remove from nodes array
    this.nodes = this.nodes.filter(node => node.id !== nodeId);
    
    // Remove and destroy sprite
    const sprite = this.nodeSprites.get(nodeId);
    if (sprite) {
      sprite.destroy();
      this.nodeSprites.delete(nodeId);
    }
  }

  // Getters for accessing manager data
  getNodes(): MapNode[] {
    return this.nodes;
  }

  getNodeSprites(): Map<string, Phaser.GameObjects.Sprite> {
    return this.nodeSprites;
  }

  getGridSize(): number {
    return this.gridSize;
  }

  getVisibleChunks(): Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> {
    return this.visibleChunks;
  }

  /**
   * Find a node by ID
   */
  findNodeById(nodeId: string): MapNode | undefined {
    return this.nodes.find(node => node.id === nodeId);
  }

  /**
   * Find nodes within a certain distance of a position
   */
  findNodesNear(x: number, y: number, maxDistance: number): MapNode[] {
    return this.nodes.filter(node => {
      const distance = Math.sqrt(
        Math.pow(node.x + this.gridSize / 2 - x, 2) + 
        Math.pow(node.y + this.gridSize / 2 - y, 2)
      );
      return distance <= maxDistance;
    });
  }

  /**
   * Find the nearest node within interaction distance
   */
  findNearbyNode(x: number, y: number): MapNode | null {
    const threshold = this.gridSize;
    
    return this.nodes.find((node) => {
      const distance = Phaser.Math.Distance.Between(
        x, 
        y, 
        node.x + this.gridSize / 2, 
        node.y + this.gridSize / 2
      );
      return distance < threshold;
    }) || null;
  }

  /**
   * Update player position and automatically update chunks if needed
   */
  updatePlayerPosition(x: number, y: number): void {
    const distance = Phaser.Math.Distance.Between(
      x, y, 
      this.lastPlayerPosition.x, this.lastPlayerPosition.y
    );
    
    // Only update chunks if player has moved significantly
    if (distance >= this.chunkUpdateThreshold) {
      this.lastPlayerPosition = { x, y };
      this.updateVisibleChunks();
      
      // Periodically clean up distant chunks for memory management
      if (Math.random() < 0.1) { // 10% chance to clean up each significant move
        this.cleanupDistantChunks(x, y);
      }
    }
  }

  /**
   * Force update chunks regardless of player movement
   */
  forceUpdateChunks(): void {
    this.updateVisibleChunks();
  }

  /**
   * Get current chunk coordinates for a world position
   */
  getChunkCoordinates(x: number, y: number): { chunkX: number, chunkY: number } {
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    return {
      chunkX: Math.floor(x / chunkSizePixels),
      chunkY: Math.floor(y / chunkSizePixels)
    };
  }

  /**
   * Preload chunks around a specific position
   */
  preloadChunksAround(centerX: number, centerY: number, radius: number = 2): void {
    const { chunkX: centerChunkX, chunkY: centerChunkY } = this.getChunkCoordinates(centerX, centerY);
    
    for (let x = centerChunkX - radius; x <= centerChunkX + radius; x++) {
      for (let y = centerChunkY - radius; y <= centerChunkY + radius; y++) {
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
              this.renderNode(node);
            }
          });
        }
      }
    }
  }

  /**
   * Clean up chunks that are too far from player
   */
  cleanupDistantChunks(playerX: number, playerY: number, maxDistance: number = 3): void {
    const { chunkX: playerChunkX, chunkY: playerChunkY } = this.getChunkCoordinates(playerX, playerY);
    
    for (const [key, chunk] of this.visibleChunks) {
      const [chunkX, chunkY] = key.split(',').map(Number);
      const distance = Math.abs(chunkX - playerChunkX) + Math.abs(chunkY - playerChunkY);
      
      if (distance > maxDistance) {
        chunk.graphics.destroy();
        this.visibleChunks.delete(key);
        
        // Remove nodes from this chunk
        this.nodes = this.nodes.filter(node => {
          const nodeChunk = this.getChunkCoordinates(node.x, node.y);
          if (nodeChunk.chunkX === chunkX && nodeChunk.chunkY === chunkY) {
            const sprite = this.nodeSprites.get(node.id);
            if (sprite) {
              sprite.destroy();
              this.nodeSprites.delete(node.id);
            }
            return false;
          }
          return true;
        });
      }
    }
  }

  /**
   * Initialize chunk system with smart preloading
   */
  initializeChunkSystem(playerX: number, playerY: number): void {
    this.lastPlayerPosition = { x: playerX, y: playerY };
    
    // Preload initial chunks around player
    this.preloadChunksAround(playerX, playerY, 2);
    
    // Set up automatic chunk management
    this.forceUpdateChunks();
  }

}
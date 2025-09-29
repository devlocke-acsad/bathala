import type { Overworld } from "./Overworld";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";

export class OverworldMazeGeneration {
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> = new Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }>();
  private readonly gridSize: number = 32;
  private nodes: MapNode[] = [];
  private nodeSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(private readonly scene: Overworld) {}

  /**
   * Get the grid size for the maze
   */
  public getGridSize(): number {
    return this.gridSize;
  }

  /**
   * Get all nodes in the world
   */
  public getNodes(): MapNode[] {
    return this.nodes;
  }

  /**
   * Get all node sprites
   */
  public getNodeSprites(): Map<string, Phaser.GameObjects.Sprite> {
    return this.nodeSprites;
  }

  /**
   * Initialize maze generation for a new game
   */
  public initializeNewGame(): { x: number, y: number } {
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
  public updateVisibleChunks(): void {
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
   * Render a single chunk of the maze
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
   * Render a node sprite on the world
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
      
      nodeSprite.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        console.log(`🖱️ Hovering over ${node.type} node at ${node.id}`);
        
        // Cancel any pending tooltip timer
        if (this.scene.uiManager.getTooltipTimer()) {
          this.scene.uiManager.getTooltipTimer()?.destroy();
        }
        
        // Set current hovered node
        this.scene.uiManager.setLastHoveredNodeId(node.id);
        
        // Show appropriate tooltip based on node type
        if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
          this.scene.uiManager.showEnemyTooltip(node.type, node.id, pointer.x, pointer.y);
        } else {
          this.scene.uiManager.showNodeTooltip(node.type, node.id, pointer.x, pointer.y);
        }
        
        // Add hover effect to sprite
        this.scene.tweens.add({
          targets: nodeSprite,
          scale: 1.7,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      // Update tooltip position on mouse move while hovering
      nodeSprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        // Only update if tooltip is currently visible and this is the active node
        if (this.scene.uiManager.getTooltipVisibility() && this.scene.uiManager.getLastHoveredNodeId() === node.id) {
          this.scene.uiManager.updateTooltipSizeAndPosition(pointer.x, pointer.y);
        }
      });
      
      nodeSprite.on('pointerout', () => {
        console.log(`🖱️ Stopped hovering over ${node.type} node at ${node.id}`);
        
        // Clear current hovered node
        this.scene.uiManager.setLastHoveredNodeId(undefined);
        
        // Cancel any pending tooltip timer
        if (this.scene.uiManager.getTooltipTimer()) {
          this.scene.uiManager.getTooltipTimer()?.destroy();
          this.scene.uiManager.setTooltipTimer(undefined);
        }
        
        // Hide tooltip immediately
        this.scene.uiManager.hideTooltip();
        
        // Reset sprite scale
        this.scene.tweens.add({
          targets: nodeSprite,
          scale: 1.5,
          duration: 150,
          ease: 'Power2'
        });
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
  public isValidPosition(x: number, y: number): boolean {
    // Convert world coordinates to chunk and local coordinates
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    const chunkX = Math.floor(x / chunkSizePixels);
    const chunkY = Math.floor(y / chunkSizePixels);
    
    const localX = Math.floor((x - chunkX * chunkSizePixels) / this.gridSize);
    const localY = Math.floor((y - chunkY * chunkSizePixels) / this.gridSize);
    
    // Get the chunk and check if the position is a path (0) or wall (1)
    const chunk = MazeOverworldGenerator.getChunk(chunkX, chunkY, this.gridSize);
    
    // Bounds check
    if (localY < 0 || localY >= chunk.maze.length || localX < 0 || localX >= chunk.maze[0].length) {
      return false;
    }
    
    return chunk.maze[localY][localX] === 0; // 0 = path, 1 = wall
  }

  /**
   * Find nodes near a position for interaction checking
   */
  public findNodeNear(x: number, y: number, threshold: number = 32): MapNode | null {
    return this.nodes.find((n) => {
      const distance = Phaser.Math.Distance.Between(
        x, 
        y, 
        n.x + this.gridSize / 2, 
        n.y + this.gridSize / 2
      );
      return distance < threshold;
    }) || null;
  }

  /**
   * Remove a node and its sprite from the world
   */
  public removeNode(nodeId: string): void {
    // Remove from nodes array
    const nodeIndex = this.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex !== -1) {
      this.nodes.splice(nodeIndex, 1);
    }
    
    // Clean up the corresponding sprite
    const sprite = this.nodeSprites.get(nodeId);
    if (sprite) {
      sprite.destroy();
      this.nodeSprites.delete(nodeId);
    }
  }

  /**
   * Clear all visible chunks (for cleanup)
   */
  public clearVisibleChunks(): void {
    for (const [, chunk] of this.visibleChunks) {
      chunk.graphics.destroy();
    }
    this.visibleChunks.clear();
  }

  /**
   * Get visible chunks (for debugging or advanced operations)
   */
  public getVisibleChunks(): Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> {
    return this.visibleChunks;
  }
}
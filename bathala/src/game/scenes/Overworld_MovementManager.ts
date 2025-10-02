import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { Overworld } from "./Overworld";

/**
 * MovementManager handles all player movement, input processing, and world interaction
 * for the Overworld scene. This manager is responsible for:
 * - Keyboard input setup and handling (WASD, arrow keys, special keys)
 * - Player movement validation and execution
 * - Grid-based collision detection
 * - Movement animations and state management
 */
export class OverworldMovementManager {
  private scene: Overworld;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shopKey!: Phaser.Input.Keyboard.Key;
  private isMoving: boolean = false;
  private gridSize: number = 32;

  constructor(scene: Overworld) {
    this.scene = scene;
  }

  /**
   * Initialize keyboard input handlers
   */
  public initializeInput(): void {
    // Enable keyboard input
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        'W': Phaser.Input.Keyboard.KeyCodes.W,
        'A': Phaser.Input.Keyboard.KeyCodes.A,
        'S': Phaser.Input.Keyboard.KeyCodes.S,
        'D': Phaser.Input.Keyboard.KeyCodes.D
      }) as { [key: string]: Phaser.Input.Keyboard.Key };
      
      // Add shop key (M for Mysterious Merchant)
      this.shopKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    }
  }

  /**
   * Handle all movement input during the update loop
   */
  public handleMovementInput(): void {
    // Skip input handling if player is currently moving or transitioning to combat
    if (this.isMoving || (this.scene as any).isTransitioningToCombat) {
      return;
    }

    const player = (this.scene as any).player;
    if (!player) {
      return;
    }
    
    // Check for movement input
    if (this.cursors.left.isDown || this.wasdKeys['A'].isDown) {
      const targetX = player.x - this.gridSize;
      if (this.isValidPosition(targetX, player.y)) {
        this.movePlayer(targetX, player.y, "left");
      }
    } else if (this.cursors.right.isDown || this.wasdKeys['D'].isDown) {
      const targetX = player.x + this.gridSize;
      if (this.isValidPosition(targetX, player.y)) {
        this.movePlayer(targetX, player.y, "right");
      }
    } else if (this.cursors.up.isDown || this.wasdKeys['W'].isDown) {
      const targetY = player.y - this.gridSize;
      if (this.isValidPosition(player.x, targetY)) {
        this.movePlayer(player.x, targetY, "up");
      }
    } else if (this.cursors.down.isDown || this.wasdKeys['S'].isDown) {
      const targetY = player.y + this.gridSize;
      if (this.isValidPosition(player.x, targetY)) {
        this.movePlayer(player.x, targetY, "down");
      }
    }
  }

  /**
   * Handle special key inputs (Enter, Shop key, debug keys)
   */
  public handleSpecialInput(): void {
    if (this.isMoving || (this.scene as any).isTransitioningToCombat) {
      return;
    }

    // Check for Enter key to interact with nodes
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
      this.scene.checkNodeInteraction();
    }
    
    // Check for shop key - delegate to scene for shop transition
    if (Phaser.Input.Keyboard.JustDown(this.shopKey)) {
      console.log("Shop key pressed");
      (this.scene as any).handleShopKeyPress();
    }
    
    // Debug: Add actions with P key for testing
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P))) {
      (this.scene as any).handleDebugActionsKey();
    }

    // Check for C key to trigger combat (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C))) {
      this.scene.startCombat("combat");
    }
    
    // Check for E key to trigger elite combat (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E))) {
      this.scene.startCombat("elite");
    }
  }

  /**
   * Move player to a new position with animation
   */
  public movePlayer(targetX: number, targetY: number, direction: string): void {
    const player = (this.scene as any).player;
    if (!player) {
      return;
    }

    // Set moving flag to prevent input during movement
    this.isMoving = true;
    
    // Play walking animation with error checking
    let walkAnimation = "avatar_walk_down";
    let idleAnimation = "avatar_idle_down";
    
    switch (direction) {
      case "up":
        walkAnimation = "avatar_walk_up";
        idleAnimation = "avatar_idle_up";
        break;
      case "down":
        walkAnimation = "avatar_walk_down";
        idleAnimation = "avatar_idle_down";
        break;
      case "left":
        walkAnimation = "avatar_walk_left";
        idleAnimation = "avatar_idle_left";
        break;
      case "right":
        walkAnimation = "avatar_walk_right";
        idleAnimation = "avatar_idle_right";
        break;
    }
    
    console.log("Playing walk animation:", walkAnimation);
    if (this.scene.anims.exists(walkAnimation)) {
      try {
        player.play(walkAnimation, true);
      } catch (error) {
        console.warn("Failed to play walk animation:", walkAnimation, error);
      }
    } else {
      console.warn("Walk animation not found:", walkAnimation);
    }

    // Check if the new position is valid (not a wall)
    if (this.isValidPosition(targetX, targetY)) {
      console.log("Position is valid, moving player");
      
      // Move player with tween
      this.scene.tweens.add({
        targets: player,
        x: targetX,
        y: targetY,
        duration: 150, // Slightly faster movement
        onComplete: () => {
          this.isMoving = false;
          this.scene.checkNodeInteraction();
          
          // Record the action for day/night cycle after movement completes
          (this.scene as any).gameState.recordAction();
          
          // Check if boss should appear after recording action
          this.scene.checkBossEncounter();
          
          // Update UI to reflect day/night cycle changes
          this.scene.updateUI();
          
          // Play idle animation after movement
          console.log("Playing idle animation:", idleAnimation);
          if (this.scene.anims.exists(idleAnimation)) {
            try {
              player.play(idleAnimation);
            } catch (error) {
              console.warn("Failed to play idle animation:", idleAnimation, error);
            }
          } else {
            console.warn("Idle animation not found:", idleAnimation);
          }
          
          // Update visible chunks as player moves
          this.scene.updateVisibleChunks();
          
          // Move nearby enemy nodes toward player during nighttime
          this.scene.moveEnemiesNighttime();
        }
      });
    } else {
      console.log("Position is invalid (wall or out of bounds)");
      // Invalid move, just reset the moving flag
      this.isMoving = false;
      console.log("Invalid move, playing idle animation");
      // Play appropriate idle animation based on last movement direction
      console.log("Playing idle animation:", idleAnimation);
      if (this.scene.anims.exists(idleAnimation)) {
        try {
          player.play(idleAnimation);
        } catch (error) {
          console.warn("Failed to play idle animation:", idleAnimation, error);
        }
      } else {
        console.warn("Idle animation not found:", idleAnimation);
      }
    }
  }

  /**
   * Check if a position is valid (not a wall and within bounds)
   */
  public isValidPosition(x: number, y: number): boolean {
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
   * Get the current moving state
   */
  public getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Set the moving state (for external control)
   */
  public setIsMoving(moving: boolean): void {
    this.isMoving = moving;
  }

  /**
   * Get the grid size used for movement calculations
   */
  public getGridSize(): number {
    return this.gridSize;
  }
}
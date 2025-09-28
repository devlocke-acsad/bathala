import type { Overworld } from "./Overworld";
import type { MapNode } from "../../core/types/MapTypes";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { GameState } from "../../core/managers/GameState";

export class OverworldMovementManager {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private shopKey!: Phaser.Input.Keyboard.Key;
  private isMoving: boolean = false;
  private readonly gridSize: number = 32;

  constructor(private readonly scene: Overworld) {}

  /**
   * Initialize input controls
   */
  public initializeInput(): void {
    if (!this.scene.input.keyboard) {
      console.warn("Keyboard input not available");
      return;
    }
    
    // Enable keyboard input
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wasdKeys = this.scene.input.keyboard.addKeys({
      'W': Phaser.Input.Keyboard.KeyCodes.W,
      'A': Phaser.Input.Keyboard.KeyCodes.A,
      'S': Phaser.Input.Keyboard.KeyCodes.S,
      'D': Phaser.Input.Keyboard.KeyCodes.D
    }) as { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Add shop key (M for Mysterious Merchant)
    this.shopKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    
    // Debug: Add global mouse tracking
    this.scene.input.on('pointermove', (pointer: any) => {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.01) { // 1% chance
        console.log('🖱️ Global mouse move:', { x: pointer.x, y: pointer.y });
      }
    });
    
    this.scene.input.on('pointerdown', (pointer: any) => {
      console.log('🖱️ Global mouse DOWN:', { x: pointer.x, y: pointer.y });
    });
  }

  /**
   * Get current movement state
   */
  public getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Set movement state (used by scene for transitions)
   */
  public setIsMoving(moving: boolean): void {
    this.isMoving = moving;
  }

  /**
   * Reset movement flags (called from resume)
   */
  public resetMovementFlags(): void {
    this.isMoving = false;
  }

  /**
   * Re-enable input (called from resume)
   */
  public enableInput(): void {
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = true;
      console.log("Keyboard input re-enabled");
    }
  }

  /**
   * Handle movement input in update loop
   */
  public handleInput(): void {
    // Skip input handling if player is currently moving or transitioning to combat
    if (this.isMoving || this.scene.getIsTransitioningToCombat()) {
      return;
    }
    
    // Ensure camera is available before processing input
    if (!this.scene.cameras || !this.scene.cameras.main) {
      return;
    }

    const player = this.scene.getPlayerSprite();
    
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
    
    // Check for Enter key to interact with nodes
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
      this.scene.checkNodeInteraction();
    }
    
    // Check for shop key
    if (Phaser.Input.Keyboard.JustDown(this.shopKey)) {
      console.log("Shop key pressed");
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(player.x, player.y);
      
      // Pause this scene and launch shop scene with actual player data
      this.scene.scene.pause();
      this.scene.scene.launch("Shop", { 
        player: this.scene.getPlayerData()
      });
    }
    
    // Debug: Add actions with P key for testing (adds 100 actions to test boss trigger faster)
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P))) {
      const gameState = this.scene.getGameState();
      for (let i = 0; i < 100; i++) {
        gameState.recordAction();
      }
      this.scene.updateUI();
      this.scene.checkBossEncounter();
    }

    // Check for C key to trigger combat (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C))) {
      this.scene.startCombat("combat");
    }
  }

  /**
   * Move player to a new position with animation
   */
  public movePlayer(targetX: number, targetY: number, direction: string): void {
    // Set moving flag to prevent input during movement
    this.isMoving = true;
    
    const player = this.scene.getPlayerSprite();
    
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
          this.scene.getGameState().recordAction();
          
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
          this.moveEnemiesNighttime();
        }
      });
    } else {
      console.log("Position is invalid (wall or out of bounds)");
      // Invalid move, just reset the moving flag
      this.isMoving = false;
      console.log("Invalid move, playing idle animation");
      
      // Play idle animation for invalid move
      if (this.scene.anims.exists(idleAnimation)) {
        try {
          player.play(idleAnimation);
        } catch (error) {
          console.warn("Failed to play idle animation:", idleAnimation, error);
        }
      }
    }
  }

  /**
   * Check if a position is valid (not a wall)
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
   * Move enemy nodes toward the player during nighttime
   */
  public moveEnemiesNighttime(): void {
    const gameState = this.scene.getGameState();
    
    // Only move enemies during nighttime
    if (gameState.isDay) {
      return;
    }

    // Define proximity threshold for enemy movement (in pixels)
    const movementRange = this.gridSize * 10; // Reduced to 10 grid squares for more breathing room

    // Get player position
    const player = this.scene.getPlayerSprite();
    const playerX = player.x;
    const playerY = player.y;

    // Find nearby enemy nodes that should move
    const nodes = this.scene.getNodes();
    const enemyNodes = nodes.filter((node: MapNode) => 
      (node.type === "combat" || node.type === "elite") &&
      Phaser.Math.Distance.Between(
        playerX, playerY,
        node.x + this.gridSize / 2, 
        node.y + this.gridSize / 2
      ) <= movementRange
    );

    // Move each enemy node with enhanced AI
    enemyNodes.forEach((enemyNode: MapNode) => {
      this.moveEnemyWithEnhancedAI(enemyNode, playerX, playerY);
    });
  }

  /**
   * Enhanced AI movement system for enemies
   */
  private moveEnemyWithEnhancedAI(enemyNode: MapNode, playerX: number, playerY: number): void {
    const currentX = enemyNode.x + this.gridSize / 2;
    const currentY = enemyNode.y + this.gridSize / 2;
    const distance = Phaser.Math.Distance.Between(currentX, currentY, playerX, playerY);
    
    // Different movement strategies based on distance and enemy type
    let movementSpeed = this.calculateEnemyMovementSpeed(enemyNode, distance);
    let movements: {x: number, y: number}[] = [];
    
    // Calculate multiple movement steps for faster enemies
    for (let i = 0; i < movementSpeed; i++) {
      const stepPosition = this.calculateSingleEnemyStep(
        currentX + (movements.length > 0 ? movements[movements.length - 1].x - currentX : 0),
        currentY + (movements.length > 0 ? movements[movements.length - 1].y - currentY : 0),
        playerX, 
        playerY
      );
      
      if (stepPosition && this.isValidPosition(stepPosition.x, stepPosition.y)) {
        movements.push(stepPosition);
      } else {
        break; // Stop if we hit a wall or invalid position
      }
    }
    
    // Execute the movements with staggered timing
    if (movements.length > 0) {
      this.executeMultiStepMovement(enemyNode, movements);
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
  private calculateSingleEnemyStep(currentX: number, currentY: number, playerX: number, playerY: number): { x: number, y: number } | null {
    // Calculate direction to player
    const deltaX = playerX - currentX;
    const deltaY = playerY - currentY;
    
    // If already at player position, don't move
    if (Math.abs(deltaX) < this.gridSize / 2 && Math.abs(deltaY) < this.gridSize / 2) {
      return null;
    }
    
    // More predictable movement: mostly stick to axis-aligned movement
    let newX = currentX;
    let newY = currentY;
    
    // Reduced diagonal movement chance for more predictable behavior
    if (Math.abs(deltaX) > this.gridSize / 2 && Math.abs(deltaY) > this.gridSize / 2 && Math.random() < 0.3) {
      newX = currentX + (deltaX > 0 ? this.gridSize : -this.gridSize);
      newY = currentY + (deltaY > 0 ? this.gridSize : -this.gridSize);
    } else {
      // Standard movement: prioritize the axis with larger distance
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newX = currentX + (deltaX > 0 ? this.gridSize : -this.gridSize);
      } else {
        newY = currentY + (deltaY > 0 ? this.gridSize : -this.gridSize);
      }
    }
    
    // Convert back to node coordinates (top-left corner)
    return {
      x: newX - this.gridSize / 2,
      y: newY - this.gridSize / 2
    };
  }

  /**
   * Execute multiple movement steps with staggered timing
   */
  private executeMultiStepMovement(enemyNode: MapNode, movements: {x: number, y: number}[]): void {
    movements.forEach((movement, index) => {
      this.scene.time.delayedCall(index * 300, () => { // Increased to 300ms delay between each step
        this.animateEnemyMovement(enemyNode, movement.x, movement.y);
      });
    });
  }

  /**
   * Animate enemy movement to new position
   */
  private animateEnemyMovement(enemyNode: MapNode, newX: number, newY: number): void {
    // Update node position
    enemyNode.x = newX;
    enemyNode.y = newY;
    
    // Get the corresponding sprite
    const nodeSprites = this.scene.getNodeSprites();
    const sprite = nodeSprites.get(enemyNode.id);
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
          // Scale effect on movement start
          sprite.setScale(1.8); // Slightly larger during movement
        },
        onComplete: () => {
          // Return to normal scale
          sprite.setScale(1.5);
        }
      });
    }
  }
}
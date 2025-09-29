import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import { Player } from "../../core/types/CombatTypes";
import { 
  TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK,
  MANANANGGAL, ASWANG, DUWENDE_CHIEF, BAKUNAWA
} from "../../data/enemies/Act1Enemies";
import {
  TIKBALANG_LORE, DWENDE_LORE, KAPRE_LORE, SIGBIN_LORE, 
  TIYANAK_LORE, MANANANGGAL_LORE, ASWANG_LORE, DUWENDE_CHIEF_LORE,
  BAKUNAWA_LORE
} from "../../data/lore/EnemyLore";
import { OverworldUIManager } from "./Overworld_UIManager";
import { OverworldMovementManager } from "./Overworld_MovementManager";
import { OverworldGameStateManager } from "./Overworld_GameStateManager";

export class Overworld extends Scene {
  private player!: Phaser.GameObjects.Sprite;
  private nodes: MapNode[] = [];
  private nodeSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> = new Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }>();
  private gridSize: number = 32;
  private uiManager!: OverworldUIManager;
  private movementManager!: OverworldMovementManager;
  private gameStateManager!: OverworldGameStateManager;
  
  // Tooltip state (minimal state kept for compatibility)
  private isTooltipVisible: boolean = false;
  private currentTooltipTimer?: Phaser.Time.TimerEvent;
  private lastHoveredNodeId?: string;
  
  // Tooltip elements (managed by UIManager but needed for compatibility)
  private tooltipContainer?: Phaser.GameObjects.Container;
  private tooltipBackground?: Phaser.GameObjects.Rectangle;
  private tooltipNameText?: Phaser.GameObjects.Text;
  private tooltipTypeText?: Phaser.GameObjects.Text;
  private tooltipSpriteContainer?: Phaser.GameObjects.Container;
  private tooltipStatsText?: Phaser.GameObjects.Text;
  private tooltipDescriptionText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Overworld" });
    
    // Initialize game state manager
    this.gameStateManager = new OverworldGameStateManager(this);
  }

  create(): void {
    // Check if we're returning from another scene
    const gameState = GameState.getInstance();
    const savedPosition = gameState.getPlayerPosition();
    
    if (savedPosition) {
      // Restore player at saved position
      this.player = this.add.sprite(savedPosition.x, savedPosition.y, "overworld_player");
      // Clear the saved position so it's not used again
      gameState.clearPlayerPosition();
    } else {
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
      
      this.player = this.add.sprite(startX, startY, "overworld_player");
    }
    
    this.player.setScale(2); // Scale up from 16x16 to 32x32
    this.player.setOrigin(0.5); // Center the sprite
    this.player.setDepth(1000); // Ensure player is above everything
    
    console.log("Playing avatar_idle_down animation");
    this.player.play("avatar_idle_down"); // Initial animation

    // Initialize movement manager and input controls
    this.movementManager = new OverworldMovementManager(this);
    this.movementManager.initializeInput();
    
    // Center the camera on the player
    this.cameras.main.startFollow(this.player);
    
    // Create enemy info tooltip
    this.createEnemyTooltip();

    // Initialize UI manager and create UI after camera is ready
    this.uiManager = new OverworldUIManager(this);
    this.time.delayedCall(10, () => {
      this.uiManager.createUI();
      // UI creation is now handled by UIManager
    });
    
    // Render initial chunks around player with a slight delay to ensure camera is ready
    this.time.delayedCall(20, this.updateVisibleChunks, [], this);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  updateUI(): void {
    this.uiManager?.updateUI();
  }

  // No need for resume method since we handle state restoration in create()
  
  /**
   * Called when the scene resumes from another scene
   */
  resume(): void {
    console.log("Overworld.resume() called - Re-enabling input and resetting flags");
    
    // Re-enable input when returning from other scenes
    this.movementManager.enableInput();
    this.movementManager.resetMovementFlags();
    
    // Handle scene resume via game state manager
    this.gameStateManager.handleSceneResume();
    
    // Update UI to reflect new player data
    this.uiManager?.updateUI();
    
    // Update visible chunks around player
    this.updateVisibleChunks();
    
    console.log("Overworld.resume() completed successfully");
  }

  public getGameState(): OverworldGameState {
    return this.gameStateManager.getGameState();
  }

  public getPlayerData(): Player {
    return this.gameStateManager.getPlayerData();
  }

  public getPlayerSprite(): Phaser.GameObjects.Sprite {
    return this.player;
  }

  public getNodes(): MapNode[] {
    return this.nodes;
  }

  public getNodeSprites(): Map<string, Phaser.GameObjects.Sprite> {
    return this.nodeSprites;
  }

  public getIsTransitioningToCombat(): boolean {
    return this.gameStateManager.getIsTransitioningToCombat();
  }

  public setIsMoving(moving: boolean): void {
    this.movementManager?.setIsMoving(moving);
  }

  /**
   * Move player to a new position with animation
   */
  // Movement methods now handled by OverworldMovementManager

  handleDayNightTransition(): void {
    this.uiManager?.updateNightOverlay();
  }

  /**
   * Check if boss encounter should be triggered
   */
  checkBossEncounter(): void {
    this.gameStateManager.checkBossEncounter();
  }

  /**
   * Trigger the boss encounter
   */
  triggerBossEncounter(): void {
    this.gameStateManager.triggerBossEncounter();
    
    // Hide any visible tooltips
    this.hideNodeTooltip();
    
    // Create dramatic effect for boss appearance
    this.createBossAppearanceEffect();
    
    // Delay the actual combat transition for dramatic effect
    this.time.delayedCall(3000, () => {
      this.startBossEncounter();
    });
  }

  /**
   * Create dramatic visual effects for boss appearance
   */
  createBossAppearanceEffect(): void {
    // Screen shake effect
    this.cameras.main.shake(2000, 0.02);
    
    // Screen flash effect
    const flashOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0xff0000
    ).setAlpha(0).setScrollFactor(0).setDepth(3000);
    
    // Flash sequence
    this.tweens.add({
      targets: flashOverlay,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        flashOverlay.destroy();
      }
    });
    
    // Dramatic text announcement
    const bossText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "THE FINAL BOSS AWAKENS!",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setAlpha(0);
    
    // Animate text appearance
    this.tweens.add({
      targets: bossText,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Fade out after showing
        this.tweens.add({
          targets: bossText,
          alpha: 0,
          scale: 1.5,
          duration: 1500,
          delay: 500,
          onComplete: () => {
            bossText.destroy();
          }
        });
      }
    });
    
    // Darken the entire screen progressively
    const darkOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(2999);
    
    this.tweens.add({
      targets: darkOverlay,
      alpha: 0.8,
      duration: 2500,
      ease: 'Power2'
    });
  }

  /**
   * Start the actual boss encounter
   */
  startBossEncounter(): void {
    // Save player position
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(this.player.x, this.player.y);
    
    // Start the epic boss transition animation (from debug boss button)
    this.startEpicBossTransition();
  }

  /**
   * Epic boss transition animation (same as debug boss button)
   */
  startEpicBossTransition(): void {
    // Get camera dimensions
    const camera = this.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create epic boss transition effect
    const overlay = this.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Epic fade in
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create epic radial effect
    this.time.delayedCall(500, () => {
      // Create expanding circles
      const circles = [];
      for (let i = 0; i < 5; i++) {
        const circle = this.add.circle(
          cameraWidth / 2,
          cameraHeight / 2,
          10,
          0xff0000,
          0.7
        ).setScrollFactor(0).setDepth(2001);
        
        circles.push(circle);
        
        // Animate circle expansion
        this.tweens.add({
          targets: circle,
          radius: cameraWidth,
          alpha: 0,
          duration: 2000,
          delay: i * 200,
          ease: 'Power2'
        });
      }
      
      // Final transition
      this.time.delayedCall(2500, () => {
        // Final zoom and transition
        this.tweens.add({
          targets: camera,
          zoom: 2,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and launch boss combat
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: "boss",
              transitionOverlay: overlay
            });
          }
        });
      });
    });
  }

  /**
   * Move enemy nodes toward the player during nighttime
   */
  // Enemy movement methods now handled by OverworldMovementManager

  updateVisibleChunks(): void {
    // Ensure camera is available before proceeding
    if (!this.cameras || !this.cameras.main) {
      console.warn("Camera not available, skipping chunk update");
      return;
    }
    
    // Determine which chunks are visible based on camera position
    const camera = this.cameras.main;
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

  renderChunk(chunkX: number, chunkY: number, maze: number[][]): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
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

  renderNode(node: MapNode): void {
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
        const fallbackCircle = this.add.circle(
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
    const nodeSprite = this.add.sprite(
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
        if (this.currentTooltipTimer) {
          this.currentTooltipTimer.destroy();
        }
        
        // Set current hovered node
        this.lastHoveredNodeId = node.id;
        
        // Show appropriate tooltip based on node type
        if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
          this.showEnemyTooltipImmediate(node.type, node.id, pointer.x, pointer.y);
        } else {
          this.showNodeTooltipImmediate(node.type, node.id, pointer.x, pointer.y);
        }
        
        // Add hover effect to sprite
        this.tweens.add({
          targets: nodeSprite,
          scale: 1.7,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      // Update tooltip position on mouse move while hovering
      nodeSprite.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        // Only update if tooltip is currently visible and this is the active node
        if (this.isTooltipVisible && this.lastHoveredNodeId === node.id) {
          this.updateTooltipSizeAndPositionImmediate(pointer.x, pointer.y);
        }
      });
      
      nodeSprite.on('pointerout', () => {
        console.log(`🖱️ Stopped hovering over ${node.type} node at ${node.id}`);
        
        // Clear current hovered node
        this.lastHoveredNodeId = undefined;
        
        // Cancel any pending tooltip timer
        if (this.currentTooltipTimer) {
          this.currentTooltipTimer.destroy();
          this.currentTooltipTimer = undefined;
        }
        
        // Hide tooltip immediately
        this.hideNodeTooltip();
        
        // Reset sprite scale
        this.tweens.add({
          targets: nodeSprite,
          scale: 1.5,
          duration: 150,
          ease: 'Power2'
        });
      });
    }
    
    // Play the animation if it exists
    if (this.anims.exists(animKey)) {
      nodeSprite.play(animKey);
    }
  }

  // Position validation now handled by OverworldMovementManager
  public isValidPosition(x: number, y: number): boolean {
    return this.movementManager.isValidPosition(x, y);
  }

  checkNodeInteraction(): void {
    // Check if player is close to any node
    const threshold = this.gridSize;

    const nodeIndex = this.nodes.findIndex((n) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        n.x + this.gridSize / 2, 
        n.y + this.gridSize / 2
      );
      return distance < threshold;
    });

    if (nodeIndex !== -1) {
      const node = this.nodes[nodeIndex];
      
      // Handle different node types
      switch (node.type) {
        case "combat":
        case "elite":
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
          
          // Clean up the corresponding sprite
          const sprite = this.nodeSprites.get(node.id);
          if (sprite) {
            sprite.destroy();
            this.nodeSprites.delete(node.id);
          }
          
          // Hide tooltip if it's visible
          this.hideEnemyTooltip();
          
          this.startCombat(node.type);
          break;
          
        case "boss":
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
          
          // Clean up the corresponding sprite
          const bossSprite = this.nodeSprites.get(node.id);
          if (bossSprite) {
            bossSprite.destroy();
            this.nodeSprites.delete(node.id);
          }
          
          // Hide tooltip if it's visible
          this.hideEnemyTooltip();
          
          this.startCombat("boss");
          break;
          
        case "shop":
          // Save player position before transitioning
          const gameState = GameState.getInstance();
          gameState.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch shop scene with actual player data
          this.scene.pause();
          this.scene.launch("Shop", { 
            player: this.getPlayerData()
          });
          break;
          
        case "campfire":
          // Save player position before transitioning
          const gameState2 = GameState.getInstance();
          gameState2.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch campfire scene
          this.scene.pause();
          this.scene.launch("Campfire", { 
            player: {
              id: "player",
              name: "Hero",
              maxHealth: 80,
              currentHealth: 80,
              block: 0,
              statusEffects: [],
              hand: [],
              deck: [],
              discardPile: [],
              drawPile: [],
              playedHand: [],
              landasScore: 0,
              ginto: 100,
              diamante: 0,
              relics: [
                {
                  id: "placeholder_relic",
                  name: "Placeholder Relic",
                  description: "This is a placeholder relic.",
                  emoji: "⚙️",
                },
              ],
            }
          });
          break;
          
        case "treasure":
          // Save player position before transitioning
          const gameState3 = GameState.getInstance();
          gameState3.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch treasure scene
          this.scene.pause();
          this.scene.launch("Treasure", { 
            player: {
              id: "player",
              name: "Hero",
              maxHealth: 80,
              currentHealth: 80,
              block: 0,
              statusEffects: [],
              hand: [],
              deck: [],
              discardPile: [],
              drawPile: [],
              playedHand: [],
              landasScore: 0,
              ginto: 100,
              diamante: 0,
              relics: [
                {
                  id: "placeholder_relic",
                  name: "Placeholder Relic",
                  description: "This is a placeholder relic.",
                  emoji: "⚙️",
                },
              ],
            }
          });
          break;
          
        case "event":
          // Test event for random event
          this.showNodeEvent("Mysterious Event", "You encounter a mysterious figure who offers you a choice...", 0x0000ff);
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
          break;
      }
    }
    

  }

  showBossAppearance(): void {
    // Disable player movement during boss appearance
    this.setIsMoving(true);
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(3000);
    
    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create boss appearance text
    const bossText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "THE BOSS APPROACHES...",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: "#ff0000",
        align: "center"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setScale(0.1);
    
    // Animate text scaling
    this.tweens.add({
      targets: bossText,
      scale: 1,
      duration: 1500,
      ease: 'Elastic.easeOut'
    });
    
    // Shake camera for dramatic effect
    this.cameras.main.shake(2000, 0.02);
    
    // After delay, start boss combat
    this.time.delayedCall(3000, () => {
      // Clean up
      overlay.destroy();
      bossText.destroy();
      
      // Start boss combat
      this.startCombat("boss");
    });
  }

  /**
   * Show a simple event dialog for node interactions
   */
  private showNodeEvent(title: string, message: string, color: number): void {
    // Disable player movement during event
    this.setIsMoving(true);
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(2000);
    
    // Create dialog box
    const dialogBox = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      600,
      300,
      0x2f3542
    ).setStrokeStyle(3, color).setScrollFactor(0).setDepth(2001);
    
    // Create title
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      title,
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: `#${color.toString(16).padStart(6, '0')}`,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
    
    // Create message
    const messageText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: 500 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
    
    // Create continue button
    const buttonTextContent = "Continue";
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, buttonTextContent, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 20;
    const buttonWidth = Math.max(150, textWidth + padding); // Minimum width of 150px
    const buttonHeight = Math.max(40, textHeight + 10); // Minimum height of 40px
    
    const continueButton = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100
    ).setScrollFactor(0).setDepth(2002);
    
    const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x3d4454)
      .setStrokeStyle(2, color);
    const buttonText = this.add.text(0, 0, buttonTextContent, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    continueButton.add([buttonBg, buttonText]);
    continueButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    continueButton.on('pointerdown', () => {
      // Clean up dialog elements
      overlay.destroy();
      dialogBox.destroy();
      titleText.destroy();
      messageText.destroy();
      continueButton.destroy();
      
      // Re-enable player movement
      this.setIsMoving(false);
    });
    
    continueButton.on('pointerover', () => {
      buttonBg.setFillStyle(0x4a5464);
    });
    
    continueButton.on('pointerout', () => {
      buttonBg.setFillStyle(0x3d4454);
    });
  }

  startCombat(nodeType: string): void {
    this.gameStateManager.startCombat(nodeType);
  }

  startBossCombat(): void {
    this.gameStateManager.startBossCombat();
  }





  /**
   * Handle scene resize
   */
  private handleResize(): void {
    this.uiManager?.handleResize();
    this.uiManager?.updateUI();
  }

  /**
   * Update method for animation effects and player movement
   */
  update(_time: number, _delta: number): void {
    // Delegate input handling to movement manager
    this.movementManager.handleInput();
  }

  /**
   * Create the overworld UI panel with health, relics, and potions
   */














  /**
   * Create grid-based inventory section (4x2 grid like reference image)
   */


  /**
   * Create bottom actions section for potions and controls
   */

















      

      


      



      




      

      

      


      
      
      // Removed duplicate click handler - keeping the main one at the end
      


      


      

      











  /**
   * Show detailed relic information in a popup similar to shop style
   * @deprecated This method is unused - UI functionality moved to UIManager
   */
  // @ts-ignore - method unused but kept for reference
  private showRelicDetails(relic: any): void {
    // Prevent multiple detail windows from opening
    if ((this as any).relicDetailsOpen) {
      console.log('🚫 Relic details already open, ignoring click');
      return;
    }
    
    (this as any).relicDetailsOpen = true;
    console.log('📖 Opening relic details for:', relic.name);
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(2000);
    
    // Create relic details panel
    const panelWidth = 480;
    const panelHeight = 450;
    const panelX = this.cameras.main.width / 2;
    const panelY = this.cameras.main.height / 2;
    
    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);
    
    // Panel shadow for depth
    const panelShadow = this.add.graphics();
    panelShadow.fillStyle(0x000000, 0.4);
    panelShadow.fillRoundedRect(-panelWidth/2 + 8, -panelHeight/2 + 8, panelWidth, panelHeight, 20);
    
    // Main panel background with dark blue theme (matching overworld)
    const panelBg = this.add.graphics();
    panelBg.fillGradientStyle(0x1a1a2e, 0x0f1419, 0x1a1a2e, 0x0a0a0f, 0.98);
    panelBg.lineStyle(3, 0x00d4ff, 0.9);
    panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    
    // Inner highlight for modern look
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0x00ffff, 0.3);
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 3, -panelHeight/2 + 3, panelWidth - 6, panelHeight - 6, 17);
    
    // Header section with emoji and name
    const headerBg = this.add.graphics();
    headerBg.fillGradientStyle(0x2a2a4e, 0x1a1a2e, 0x1f2439, 0x2a2a4e, 0.9);
    headerBg.fillRoundedRect(-panelWidth/2 + 10, -panelHeight/2 + 10, panelWidth - 20, 80, 15);
    
    const emojiContainer = this.add.graphics();
    emojiContainer.fillStyle(0x00d4ff, 0.2);
    emojiContainer.lineStyle(2, 0x00ffff, 0.6);
    emojiContainer.fillRoundedRect(-panelWidth/2 + 25, -panelHeight/2 + 25, 60, 60, 12);
    emojiContainer.strokeRoundedRect(-panelWidth/2 + 25, -panelHeight/2 + 25, 60, 60, 12);
    
    const emoji = this.add.text(-panelWidth/2 + 55, -panelHeight/2 + 55, relic.emoji, {
      fontSize: 36,
    }).setOrigin(0.5, 0.5);
    emoji.setShadow(2, 2, '#0a0a0f', 4, false, true);
    
    // Relic name
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, relic.name.toUpperCase(), {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#00d4ff",
    }).setOrigin(0, 0);
    name.setShadow(2, 2, '#0a0a0f', 4, false, true);
    
    // "EQUIPPED" badge
    const equippedBadge = this.add.graphics();
    equippedBadge.fillStyle(0x00ff00, 0.9);
    equippedBadge.fillRoundedRect(panelWidth/2 - 120, -panelHeight/2 + 30, 90, 25, 12);
    
    const equippedText = this.add.text(panelWidth/2 - 75, -panelHeight/2 + 42, "EQUIPPED", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 12,
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    // Content sections
    const contentStartY = -panelHeight/2 + 140;
    
    // Description section
    const descSection = this.add.graphics();
    descSection.fillStyle(0x1a1a2e, 0.3);
    descSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    
    const descTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 15, "DESCRIPTION", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#00d4ff",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const description = this.add.text(0, contentStartY + 45, relic.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Lore section
    const loreSection = this.add.graphics();
    loreSection.fillStyle(0x1a1a2e, 0.2);
    loreSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    
    const loreTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 135, "LORE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#34d399",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const lore = this.getRelicLore(relic);
    const loreText = this.add.text(0, contentStartY + 165, lore, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#cccccc",
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Close button
    const closeBtn = this.add.container(panelWidth/2 - 40, -panelHeight/2 + 40);
    const closeBg = this.add.graphics();
    closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
    closeBg.lineStyle(2, 0xfca5a5, 0.8);
    closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
    closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    
    const closeText = this.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff",
    }).setOrigin(0.5, 0.5);
    closeText.setShadow(1, 1, '#000000', 2, false, true);
    
    closeBtn.add([closeBg, closeText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on("pointerdown", () => {
      // Smooth exit animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          (this as any).relicDetailsOpen = false;
          overlay.destroy();
          panel.destroy();
        }
      });
    });
    
    // Close button hover effects
    closeBtn.on("pointerover", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1.1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xf87171, 0xef4444, 0xdc2626, 0xb91c1c, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 1);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    closeBtn.on("pointerout", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 0.8);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    // Assemble the panel
    panel.add([panelShadow, panelBg, innerHighlight, headerBg, emojiContainer, emoji, name, 
              equippedBadge, equippedText, descSection, descTitle, description, 
              loreSection, loreTitle, loreText, closeBtn]);
              
    // Entrance animation
    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Make overlay interactive to close when clicked
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          (this as any).relicDetailsOpen = false;
          overlay.destroy();
          panel.destroy();
        }
      });
    });
  }

  /**
   * Get lore text for a relic
   */
  private getRelicLore(relic: any): string {
    // Return lore based on relic ID or name
    switch(relic.id) {
      case "earthwardens_plate":
        return "Forged by the ancient Earthwardens who protected the first settlements from natural disasters. This mystical armor channels the strength of the mountains themselves, providing unwavering protection to those who wear it.";
      case "swift_wind_agimat":
        return "An enchanted talisman blessed by the spirits of the wind. It enhances the agility of its bearer, allowing them to move with the swiftness of the breeze and react faster than the eye can see.";
      case "ember_fetish":
        return "A relic imbued with the essence of volcanic fire. When the bearer's defenses are low, the fetish awakens and grants the fury of the forge, empowering them with the strength of molten rock.";
      case "babaylans_talisman":
        return "Once worn by the most revered Babaylan of the ancient tribes. This sacred talisman enhances the spiritual connection of its bearer, allowing them to channel greater power through their rituals and incantations.";
      case "echo_of_ancestors":
        return "A mystical artifact that resonates with the wisdom of those who came before. It breaks the natural limitations of the physical world, allowing for impossible feats that should not exist.";
      case "seafarers_compass":
        return "A navigational tool blessed by Lakapati, goddess of fertility and navigation. It guides the bearer through the most treacherous waters and helps them find their way even in the darkest storms.";
      default:
        return "An ancient artifact of great power, its origins lost to time but its effects undeniable. Those who wield it are forever changed by its mystical properties.";
    }
  }
  
  /**
   * Create enemy info tooltip system
   */
  private createEnemyTooltip(): void {
    console.log("Creating enemy tooltip system...");
    
    // Create tooltip container (initially hidden) - FIXED TO CAMERA
    this.tooltipContainer = this.add.container(0, 0).setVisible(false).setDepth(2000).setScrollFactor(0);
    
    // Tooltip background with shadow effect
    const shadowOffset = 3;
    const tooltipShadow = this.add.rectangle(shadowOffset, shadowOffset, 400, 240, 0x000000)
      .setAlpha(0.4)
      .setOrigin(0);
    
    // Main tooltip background (will be resized dynamically)
    this.tooltipBackground = this.add.rectangle(0, 0, 400, 240, 0x1d151a)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0);
      
    // Header background for enemy name/type
    const headerBackground = this.add.rectangle(0, 0, 400, 60, 0x2a1f24)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0);
      
    // Enemy name
    this.tooltipNameText = this.add.text(15, 12, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#e8eced",
      fontStyle: "bold"
    }).setOrigin(0);
    
    // Enemy type
    this.tooltipTypeText = this.add.text(15, 30, "", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0);
    
    // Enemy sprite (will be created dynamically)
    this.tooltipSpriteContainer = this.add.container(320, 30);
    this.tooltipSpriteContainer.setSize(60, 60); // Set a larger size for the sprite area
    
    // Stats section separator
    const statsSeparator = this.add.rectangle(10, 70, 380, 1, 0x4a3a40).setOrigin(0);
    
    // Enemy stats
    this.tooltipStatsText = this.add.text(15, 80, "", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#c9a74a",
      wordWrap: { width: 360 },
      lineSpacing: 2,
      fontStyle: "bold"
    }).setOrigin(0);
    
    // Description section separator  
    const descSeparator = this.add.rectangle(10, 130, 380, 1, 0x4a3a40).setOrigin(0);
    
    // Enemy description
    this.tooltipDescriptionText = this.add.text(15, 140, "", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#8a9a9f",
      wordWrap: { width: 360 },
      lineSpacing: 3,
      fontStyle: "italic"
    }).setOrigin(0);
    
    // Store references to dynamic elements for resizing
    this.tooltipContainer.setData({
      shadow: tooltipShadow,
      header: headerBackground,
      statsSeparator: statsSeparator,
      descSeparator: descSeparator
    });
    
    // Add all elements to tooltip container
    this.tooltipContainer.add([
      tooltipShadow,
      this.tooltipBackground,
      headerBackground,
      this.tooltipNameText,
      this.tooltipTypeText,
      this.tooltipSpriteContainer,
      statsSeparator,
      this.tooltipStatsText,
      descSeparator,
      this.tooltipDescriptionText
    ]);
    
    console.log("Enemy tooltip system created successfully - FIXED TO CAMERA");
  }
  
  /**
   * Show enemy tooltip with information - immediate version without timing issues
   */
  private showEnemyTooltipImmediate(nodeType: string, nodeId: string, mouseX?: number, mouseY?: number): void {
    // Validate inputs and state
    if (!nodeType || !this.tooltipContainer) {
      console.warn("Cannot show tooltip: missing nodeType or tooltip not initialized");
      return;
    }
    
    const enemyInfo = this.getEnemyInfoForNodeType(nodeType, nodeId);
    if (!enemyInfo) {
      console.warn("Cannot show tooltip: no enemy info for type", nodeType);
      return;
    }
    
    // Validate all tooltip elements exist
    if (!this.tooltipNameText || !this.tooltipTypeText || !this.tooltipSpriteContainer || 
        !this.tooltipStatsText || !this.tooltipDescriptionText || !this.tooltipBackground) {
      console.warn("Cannot show tooltip: tooltip elements not properly initialized");
      return;
    }
    
    // Reset colors to default enemy colors
    this.tooltipNameText.setColor("#e8eced");    // Default white
    this.tooltipTypeText.setColor("#77888C");    // Default gray
    this.tooltipStatsText.setColor("#c9a74a");   // Default yellow
    this.tooltipDescriptionText.setColor("#b8a082"); // Default beige
    
    // Update tooltip content
    this.tooltipNameText.setText(enemyInfo.name);
    this.tooltipTypeText.setText(enemyInfo.type.toUpperCase());
    
    // Clear previous sprite and add new one
    this.tooltipSpriteContainer.removeAll(true);
    if (enemyInfo.spriteKey) {
      const sprite = this.add.sprite(0, 0, enemyInfo.spriteKey);
      sprite.setOrigin(0.5, 0.5);
      
      // Scale to fit the larger container nicely
      const targetSize = 48; // Increased from 32 to 48 for better visibility
      const scale = targetSize / Math.max(sprite.width, sprite.height);
      sprite.setScale(scale);
      
      // If it's an animated sprite, play the idle animation
      if (enemyInfo.animationKey && this.anims.exists(enemyInfo.animationKey)) {
        sprite.play(enemyInfo.animationKey);
      }
      
      this.tooltipSpriteContainer.add(sprite);
    }
    
    this.tooltipStatsText.setText(`Health: ${enemyInfo.health}\nDamage: ${enemyInfo.damage}\nAbilities: ${enemyInfo.abilities.join(", ")}`);
    this.tooltipDescriptionText.setText(enemyInfo.description);
    
    // Update size and position immediately - no delayed call
    this.updateTooltipSizeAndPositionImmediate(mouseX, mouseY);
    
    // Show tooltip
    this.tooltipContainer.setVisible(true);
    this.isTooltipVisible = true;
  }
  
  /**
   * Update tooltip size and position - immediate version
   */
  private updateTooltipSizeAndPositionImmediate(mouseX?: number, mouseY?: number): void {
    if (!this.tooltipContainer || !this.tooltipBackground) {
      return;
    }
    
    // Calculate dynamic tooltip size based on content
    const padding = 20;
    const headerHeight = 60;
    const minWidth = 420;
    const maxWidth = 550;
    
    // Get actual text bounds (these should be available immediately after setText)
    const statsHeight = this.tooltipStatsText?.height || 70;
    const descHeight = this.tooltipDescriptionText?.height || 90;
    
    // Calculate required height with proper spacing
    const separatorSpacing = 15;
    const totalHeight = headerHeight + separatorSpacing + statsHeight + separatorSpacing + descHeight + padding * 2;
    
    // Calculate required width (ensure all content fits including sprite)
    const nameWidth = this.tooltipNameText?.width || 100;
    const statsWidth = this.tooltipStatsText?.width || 100;
    const descWidth = this.tooltipDescriptionText?.width || 100;
    const spriteAreaWidth = 80; // Account for sprite area
    const maxContentWidth = Math.max(nameWidth + spriteAreaWidth, statsWidth, descWidth);
    const tooltipWidth = Math.max(minWidth, Math.min(maxWidth, maxContentWidth + padding * 2));
    const tooltipHeight = Math.max(260, totalHeight); // Increased minimum height
    
    // Get dynamic elements from container data
    const shadow = this.tooltipContainer.getData('shadow') as Phaser.GameObjects.Rectangle;
    const header = this.tooltipContainer.getData('header') as Phaser.GameObjects.Rectangle;
    const statsSeparator = this.tooltipContainer.getData('statsSeparator') as Phaser.GameObjects.Rectangle;
    const descSeparator = this.tooltipContainer.getData('descSeparator') as Phaser.GameObjects.Rectangle;
    
    // Update background sizes (with null checks)
    this.tooltipBackground.setSize(tooltipWidth, tooltipHeight);
    shadow?.setSize(tooltipWidth, tooltipHeight);
    header?.setSize(tooltipWidth, headerHeight);
    
    // Update separator widths and positions (with null checks)
    statsSeparator?.setSize(tooltipWidth - 20, 1);
    statsSeparator?.setPosition(10, headerHeight + 10);
    
    // Reposition sprite container based on new width (more room for larger sprite)
    this.tooltipSpriteContainer?.setPosition(tooltipWidth - 50, 30);
    
    // Update text wrapping for the new width (account for sprite area)
    const textWidth = tooltipWidth - 100; // More space for sprite
    this.tooltipStatsText?.setWordWrapWidth(textWidth);
    this.tooltipDescriptionText?.setWordWrapWidth(textWidth);
    
    // Reposition stats and description elements
    const statsY = headerHeight + 20;
    this.tooltipStatsText?.setPosition(15, statsY);
    
    const descSeparatorY = statsY + statsHeight + 10;
    descSeparator?.setSize(tooltipWidth - 20, 1);
    descSeparator?.setPosition(10, descSeparatorY);
    
    const descY = descSeparatorY + 15;
    this.tooltipDescriptionText?.setPosition(15, descY);
    
    // Position tooltip dynamically based on mouse position or fallback to center
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    let tooltipX: number;
    let tooltipY: number;
    
    if (mouseX !== undefined && mouseY !== undefined) {
      // Position tooltip near mouse cursor
      const offset = 20; // Offset from cursor to avoid overlap
      tooltipX = mouseX + offset;
      tooltipY = mouseY - tooltipHeight / 2; // Center vertically on cursor
      
      // Ensure tooltip doesn't go off-screen (right edge)
      if (tooltipX + tooltipWidth > screenWidth - 20) {
        tooltipX = mouseX - tooltipWidth - offset; // Position to the left of cursor
      }
      
      // Ensure tooltip doesn't go off-screen (vertical bounds)
      tooltipY = Math.max(20, Math.min(tooltipY, screenHeight - tooltipHeight - 20));
      
    } else {
      // Fallback to status panel positioning if no mouse coordinates
      const statusPanelWidth = 320;
      const statusPanelX = 20;
      const marginBetween = 20;
      
      tooltipX = statusPanelX + statusPanelWidth + marginBetween;
      tooltipY = Math.max(20, (screenHeight - tooltipHeight) / 2);
      
      // Ensure fallback doesn't go off-screen
      const maxTooltipX = screenWidth - tooltipWidth - 20;
      tooltipX = Math.min(tooltipX, maxTooltipX);
    }
    
    // Position tooltip
    this.tooltipContainer.setPosition(tooltipX, tooltipY);
  }
  
  /**
   * Hide enemy tooltip with improved state management
   */
  private hideEnemyTooltip(): void {
    this.hideNodeTooltip();
  }

  /**
   * Hide node tooltip with improved state management
   */
  private hideNodeTooltip(): void {
    // Cancel any pending tooltip operations
    if (this.currentTooltipTimer) {
      this.currentTooltipTimer.destroy();
      this.currentTooltipTimer = undefined;
    }
    
    // Hide tooltip safely
    if (this.tooltipContainer) {
      this.tooltipContainer.setVisible(false);
    }
    
    this.isTooltipVisible = false;
    this.lastHoveredNodeId = undefined;
  }
  
  /**
   * Show node tooltip for non-enemy nodes
   */
  private showNodeTooltipImmediate(nodeType: string, _nodeId: string, mouseX: number, mouseY: number): void {
    if (!this.tooltipContainer) {
      console.warn("Tooltip container not available");
      return;
    }
    
    const nodeInfo = this.getNodeInfoForType(nodeType);
    if (!nodeInfo) {
      console.warn(`No info available for node type: ${nodeType}`);
      return;
    }
    
    // Get color scheme for this node type
    const colors = this.getNodeColorScheme(nodeType);
    
    // Update tooltip content with node-specific colors
    this.tooltipNameText?.setText(nodeInfo.name);
    this.tooltipNameText?.setColor(colors.name);
    
    this.tooltipTypeText?.setText(nodeInfo.type.toUpperCase());
    this.tooltipTypeText?.setColor(colors.type);
    
    // Clear previous sprite and add new one
    this.tooltipSpriteContainer?.removeAll(true);
    if (nodeInfo.spriteKey) {
      const sprite = this.add.sprite(0, 0, nodeInfo.spriteKey);
      sprite.setOrigin(0.5, 0.5);
      
      // Scale to fit the larger container nicely
      const targetSize = 48;
      const scale = targetSize / Math.max(sprite.width, sprite.height);
      sprite.setScale(scale);
      
      // If it's an animated sprite, play the idle animation
      if (nodeInfo.animationKey && this.anims.exists(nodeInfo.animationKey)) {
        sprite.play(nodeInfo.animationKey);
      }
      
      this.tooltipSpriteContainer?.add(sprite);
    }
    
    this.tooltipStatsText?.setText(nodeInfo.stats || "");
    this.tooltipStatsText?.setColor(colors.stats);
    
    this.tooltipDescriptionText?.setText(nodeInfo.description);
    this.tooltipDescriptionText?.setColor(colors.description);
    
    // Update size and position immediately
    this.updateTooltipSizeAndPositionImmediate(mouseX, mouseY);
    
    // Show tooltip
    this.tooltipContainer.setVisible(true);
    this.isTooltipVisible = true;
  }

  /**
   * Get color scheme for different node types
   */
  private getNodeColorScheme(nodeType: string): { name: string, type: string, stats: string, description: string } {
    const colorSchemes = {
      shop: {
        name: "#ffd700",        // Gold - for merchant/commerce
        type: "#ffcc00",        // Bright gold
        stats: "#e6b800",       // Golden yellow
        description: "#f0e68c"  // Light golden
      },
      event: {
        name: "#da70d6",        // Orchid - for mystery/magic
        type: "#ba55d3",        // Medium orchid
        stats: "#9370db",       // Medium slate blue
        description: "#dda0dd"  // Plum
      },
      campfire: {
        name: "#ff6347",        // Tomato red - for fire/warmth
        type: "#ff4500",        // Orange red
        stats: "#ff8c00",       // Dark orange
        description: "#ffa07a"  // Light salmon
      },
      treasure: {
        name: "#00ced1",        // Dark turquoise - for precious items
        type: "#20b2aa",        // Light sea green
        stats: "#48d1cc",       // Medium turquoise
        description: "#afeeee"  // Pale turquoise
      }
    };

    return colorSchemes[nodeType as keyof typeof colorSchemes] || {
      name: "#e8eced",    // Default white
      type: "#77888C",    // Default gray
      stats: "#c9a74a",   // Default yellow
      description: "#b8a082" // Default beige
    };
  }

  /**
   * Get node information for different node types
   */
  private getNodeInfoForType(nodeType: string): any {
    const nodeData = {
      shop: {
        name: "Merchant's Shop",
        type: "shop",
        spriteKey: "necromancer_f0",
        animationKey: "necromancer_idle",
        stats: "Services: Buy/Sell Items\nCurrency: Gold Coins\nSpecialty: Rare Relics & Potions",
        description: "A mystical merchant offers powerful relics and potions to aid your journey. Browse their wares and strengthen your deck with ancient artifacts and magical brews."
      },
      event: {
        name: "Mysterious Event",
        type: "event", 
        spriteKey: "doc_f0",
        animationKey: "doc_idle",
        stats: "Outcome: Variable\nRisk: Medium\nReward: Unique Benefits",
        description: "Strange occurrences and mysterious encounters await. These events may offer unique opportunities, challenging choices, or unexpected rewards for the brave."
      },
      campfire: {
        name: "Sacred Campfire",
        type: "campfire",
        spriteKey: "angel_f0", 
        animationKey: "angel_idle",
        stats: "Healing: Full Health\nOptions: Rest or Upgrade\nSafety: Complete Protection",
        description: "A blessed sanctuary where weary travelers can rest and recover. Choose to restore your health completely or upgrade one of your cards to become more powerful."
      },
      treasure: {
        name: "Ancient Treasure",
        type: "treasure",
        spriteKey: "chest_f0",
        animationKey: "chest_open", 
        stats: "Contents: Random Rewards\nRarity: Varies\nValue: High",
        description: "A forgotten chest containing valuable treasures from ages past. May hold gold, rare relics, powerful cards, or other precious artifacts to aid your quest."
      }
    };

    return nodeData[nodeType as keyof typeof nodeData] || null;
  }

  /**
   * Get enemy information for a given node type
   */
  private getEnemyInfoForNodeType(nodeType: string, nodeId?: string): any {
    // Create a simple hash from nodeId for consistent enemy selection
    const getNodeHash = (id: string): number => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    switch (nodeType) {
      case "combat":
        // Randomly select a common enemy
        const commonEnemies = [
          {
            name: TIKBALANG.name,
            type: "Combat",
            spriteKey: "tikbalang",
            animationKey: "tikbalang_idle",
            health: TIKBALANG.maxHealth,
            damage: TIKBALANG.damage,
            abilities: ["Forest Navigation", "Illusion Casting"],
            description: TIKBALANG_LORE.description
          },
          {
            name: DWENDE.name,
            type: "Combat", 
            spriteKey: "chort_f0", // Using overworld sprite since no dwende combat sprite
            animationKey: null,
            health: DWENDE.maxHealth,
            damage: DWENDE.damage,
            abilities: ["Invisibility", "Mischief"],
            description: DWENDE_LORE.description
          },
          {
            name: KAPRE.name,
            type: "Combat",
            spriteKey: "chort_f0", // Using overworld sprite since no kapre combat sprite
            animationKey: null,
            health: KAPRE.maxHealth,
            damage: KAPRE.damage,
            abilities: ["Smoke Manipulation", "Tree Dwelling"],
            description: KAPRE_LORE.description
          },
          {
            name: SIGBIN.name,
            type: "Combat",
            spriteKey: "sigbin",
            animationKey: "sigbin_idle",
            health: SIGBIN.maxHealth, 
            damage: SIGBIN.damage,
            abilities: ["Invisibility", "Shadow Draining"],
            description: SIGBIN_LORE.description
          },
          {
            name: TIYANAK.name,
            type: "Combat",
            spriteKey: "chort_f0", // Using overworld sprite since no tiyanak combat sprite
            animationKey: null,
            health: TIYANAK.maxHealth,
            damage: TIYANAK.damage, 
            abilities: ["Shapeshifting", "Deception"],
            description: TIYANAK_LORE.description
          }
        ];
        
        // Use node ID to consistently select the same enemy for this node
        const combatIndex = nodeId ? getNodeHash(nodeId) % commonEnemies.length : 0;
        return commonEnemies[combatIndex];
        
      case "elite":
        // Randomly select an elite enemy
        const eliteEnemies = [
          {
            name: MANANANGGAL.name,
            type: "Elite",
            spriteKey: "big_demon_f0", // Using overworld elite sprite since no manananggal combat sprite
            animationKey: null,
            health: MANANANGGAL.maxHealth,
            damage: MANANANGGAL.damage,
            abilities: ["Flight", "Body Segmentation", "Blood Draining"],
            description: MANANANGGAL_LORE.description
          },
          {
            name: ASWANG.name,
            type: "Elite", 
            spriteKey: "big_demon_f0", // Using overworld elite sprite since no aswang combat sprite
            animationKey: null,
            health: ASWANG.maxHealth,
            damage: ASWANG.damage,
            abilities: ["Shapeshifting", "Cannibalism", "Night Vision"],
            description: ASWANG_LORE.description
          },
          {
            name: DUWENDE_CHIEF.name,
            type: "Elite",
            spriteKey: "big_demon_f0", // Using overworld elite sprite since no duwende_chief combat sprite
            animationKey: null,
            health: DUWENDE_CHIEF.maxHealth,
            damage: DUWENDE_CHIEF.damage,
            abilities: ["Command", "Magic", "Earth Control"],
            description: DUWENDE_CHIEF_LORE.description
          }
        ];
        
        // Use node ID to consistently select the same elite enemy for this node
        const eliteIndex = nodeId ? getNodeHash(nodeId) % eliteEnemies.length : 0;
        return eliteEnemies[eliteIndex];
        
      case "boss":
        return {
          name: BAKUNAWA.name,
          type: "Boss",
          spriteKey: "balete", // Using balete sprite for boss since no bakunawa sprite available
          animationKey: "balete_idle",
          health: BAKUNAWA.maxHealth,
          damage: BAKUNAWA.damage,
          abilities: ["Eclipse Creation", "Massive Size", "Elemental Control"],
          description: BAKUNAWA_LORE.description
        };
        
      default:
        return null;
    }
  }
}
import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import { Player } from "../../core/types/CombatTypes";
import { Potion } from "../../data/potions/Act1Potions";
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
  private isMoving: boolean = false;
  private uiManager!: OverworldUIManager;
  private movementManager!: OverworldMovementManager;
  private gameStateManager!: OverworldGameStateManager;
  
  // Overworld UI elements
  private uiContainer!: Phaser.GameObjects.Container;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private relicsContainer!: Phaser.GameObjects.Container;
  private potionsContainer!: Phaser.GameObjects.Container;
  private currencyText!: Phaser.GameObjects.Text;
  private diamanteText!: Phaser.GameObjects.Text;
  private landasText!: Phaser.GameObjects.Text;
  private landasMeterIndicator!: Phaser.GameObjects.Graphics;
  private deckInfoText!: Phaser.GameObjects.Text;
  private discardText!: Phaser.GameObjects.Text;
  private relicInventoryButton!: Phaser.GameObjects.Container;
  private potionInventoryButton!: Phaser.GameObjects.Container;
  
  // Enemy Info Tooltip
  private tooltipContainer!: Phaser.GameObjects.Container;
  private tooltipBackground!: Phaser.GameObjects.Rectangle;
  private tooltipNameText!: Phaser.GameObjects.Text;
  private tooltipTypeText!: Phaser.GameObjects.Text;
  private tooltipSpriteContainer!: Phaser.GameObjects.Container;
  private tooltipStatsText!: Phaser.GameObjects.Text;
  private tooltipDescriptionText!: Phaser.GameObjects.Text;
  private isTooltipVisible: boolean = false;
  private currentTooltipTimer?: Phaser.Time.TimerEvent;
  private lastHoveredNodeId?: string;

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
      this.createOverworldUI();
    });
    
    // Render initial chunks around player with a slight delay to ensure camera is ready
    this.time.delayedCall(20, this.updateVisibleChunks, [], this);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  updateUI(): void {
    this.uiManager?.updateUI();

    if (this.uiContainer) {
      this.updateOverworldUI();
    }
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
    this.updateOverworldUI();
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
    this.isMoving = moving;
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
    this.isMoving = true;
    
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
    this.isMoving = true;
    
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
      this.isMoving = false;
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

  // Legacy method for backward compatibility
  private startCombatOld(nodeType: string): void {
    // Prevent player from moving during combat transition
    this.isMoving = true;
    this.gameStateManager.setIsTransitioningToCombat(true);
    
    // Save player position before transitioning
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(this.player.x, this.player.y);
    
    // Disable input during transition
    if (this.input && this.input.keyboard) {
      this.input.keyboard.enabled = false;
    }
    
    // Check if this is a boss fight for special animation
    if (nodeType === "boss") {
      this.startBossCombat();
      return;
    }
    
    // Get camera dimensions
    const camera = this.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create a full-screen overlay that follows the camera
    const overlay = this.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Different transition effects based on enemy type (Pokemon-like wild encounters with consistent red/black theme)
    if (nodeType === "elite") {
      // Elite enemy transition - Pokemon-like wild encounter with red/black theme
      // Flash screen with red tint
      const flashOverlay = this.add.rectangle(
        cameraWidth / 2,
        cameraHeight / 2,
        cameraWidth,
        cameraHeight,
        0xff0000
      ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
      
      // Animate flash
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0.7,
        duration: 200,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Shake player sprite
      const originalPlayerX = this.player.x;
      const originalPlayerY = this.player.y;
      
      // More intense shaking for elite enemies
      this.tweens.add({
        targets: this.player,
        x: originalPlayerX + Phaser.Math.Between(-5, 5),
        y: originalPlayerY + Phaser.Math.Between(-5, 5),
        duration: 100,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          this.player.setX(originalPlayerX);
          this.player.setY(originalPlayerY);
        }
      });
      
      // Create elite enemy encounter effect
      this.time.delayedCall(500, () => {
        // Create expanding circles with red color
        for (let i = 0; i < 3; i++) {
          const circle = this.add.circle(
            cameraWidth / 2,
            cameraHeight / 2,
            10,
            0xff0000, // Red color for elite enemies
            0.3
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate circle expansion
          this.tweens.add({
            targets: circle,
            radius: cameraWidth / 3,
            alpha: 0,
            duration: 1000,
            delay: i * 100,
            ease: 'Power2',
            onComplete: () => {
              circle.destroy();
            }
          });
        }
        
        // Create red sparkle effects
        for (let i = 0; i < 20; i++) {
          const sparkle = this.add.rectangle(
            Phaser.Math.Between(cameraWidth/2 - 100, cameraWidth/2 + 100),
            Phaser.Math.Between(cameraHeight/2 - 100, cameraHeight/2 + 100),
            Phaser.Math.Between(2, 5),
            Phaser.Math.Between(2, 5),
            0xff0000,
            1
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate sparkles
          this.tweens.add({
            targets: sparkle,
            alpha: 0,
            duration: 800,
            delay: Phaser.Math.Between(0, 500),
            onComplete: () => {
              sparkle.destroy();
            }
          });
        }
      });
      
      // Fade to black and transition
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and start combat scene
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: nodeType,
              transitionOverlay: overlay // Pass overlay to combat scene
            });
          }
        });
      });
    } else {
      // Common enemy transition - Pokemon-like wild encounter with red/black theme
      // Flash screen red
      const flashOverlay = this.add.rectangle(
        cameraWidth / 2,
        cameraHeight / 2,
        cameraWidth,
        cameraHeight,
        0xff0000
      ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
      
      // Animate flash
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0.8,
        duration: 150,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Shake player sprite slightly
      const originalPlayerX = this.player.x;
      const originalPlayerY = this.player.y;
      
      this.tweens.add({
        targets: this.player,
        x: originalPlayerX + Phaser.Math.Between(-3, 3),
        y: originalPlayerY + Phaser.Math.Between(-3, 3),
        duration: 100,
        repeat: 3,
        yoyo: true,
        onComplete: () => {
          this.player.setX(originalPlayerX);
          this.player.setY(originalPlayerY);
        }
      });
      
      // Create common enemy encounter effect
      this.time.delayedCall(400, () => {
        // Create simple expanding circle in red
        const circle = this.add.circle(
          cameraWidth / 2,
          cameraHeight / 2,
          10,
          0xff0000, // Red color for common enemies
          0.2
        ).setScrollFactor(0).setDepth(2001);
        
        // Animate circle expansion
        this.tweens.add({
          targets: circle,
          radius: cameraWidth / 4,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            circle.destroy();
          }
        });
        
        // Create small red sparkle effects
        for (let i = 0; i < 10; i++) {
          const sparkle = this.add.rectangle(
            Phaser.Math.Between(cameraWidth/2 - 50, cameraWidth/2 + 50),
            Phaser.Math.Between(cameraHeight/2 - 50, cameraHeight/2 + 50),
            2,
            2,
            0xff0000,
            1
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate sparkles
          this.tweens.add({
            targets: sparkle,
            alpha: 0,
            duration: 600,
            delay: Phaser.Math.Between(0, 300),
            onComplete: () => {
              sparkle.destroy();
            }
          });
        }
      });
      
      // Fade to black and transition
      this.time.delayedCall(1200, () => {
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and start combat scene
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: nodeType,
              transitionOverlay: overlay // Pass overlay to combat scene
            });
          }
        });
      });
    }
  }



  /**
   * Handle scene resize
   */
  private handleResize(): void {
    this.uiManager?.handleResize();

    if (this.uiContainer) {
      this.updateOverworldUI();
    }
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
  private createOverworldUI(): void {
    const screenHeight = this.cameras.main.height;
    
    // Create main UI container positioned at top-left
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setScrollFactor(0).setDepth(1500);
    
    // Create compact left panel for all UI elements
    this.createCompactLeftPanel(screenHeight);
    
    // Update all UI elements
    this.updateOverworldUI();
  }

  /**
   * Create modern styled left panel with improved visual design
   */
  private createCompactLeftPanel(screenHeight: number): void {
    const panelWidth = 320;
    const panelHeight = Math.min(screenHeight - 40, 720);
    const panelX = 20;
    const panelY = screenHeight / 2 - panelHeight / 2;
    
    // Modern glass-morphism style background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0a0a, 0.85);
    panelBg.lineStyle(1, 0x404040, 0.6);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Subtle inner border for depth
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(1, 0x606060, 0.3);
    innerBorder.strokeRoundedRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, 18);
    
    // Accent line on the left
    const accentLine = this.add.graphics();
    accentLine.lineStyle(3, 0x00bcd4, 0.8);
    accentLine.beginPath();
    accentLine.moveTo(panelX + 8, panelY + 20);
    accentLine.lineTo(panelX + 8, panelY + panelHeight - 20);
    accentLine.strokePath();
    
    this.uiContainer.add([panelBg, innerBorder, accentLine]);
    
    // Modern header without heavy box
    const headerText = this.add.text(panelX + 25, panelY + 25, "STATUS", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    headerText.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(headerText);
    
    // Calculate organized spacing for sections with more breathing room
    const contentStartY = panelY + 80; // More space from header
    const sectionSpacing = 25; // Increased space between sections
    
    // Organized section heights for better proportions
    const healthSectionHeight = 155; // Increased to accommodate diamante spacing
    const relicsSectionHeight = 170;
    
    let currentY = contentStartY;
    
    // Health section with organized spacing
    this.createModernHealthSection(panelX + 20, currentY, panelWidth - 40);
    currentY += healthSectionHeight + sectionSpacing;
    
    // Add section separator with more prominent styling
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
    
    // Relics section with organized spacing
    this.createModernRelicsSection(panelX + 20, currentY, panelWidth - 40);
    currentY += relicsSectionHeight + sectionSpacing;
    
    // Add section separator with more prominent styling
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
    
    // Potions section with organized spacing
    this.createModernPotionsSection(panelX + 20, currentY, panelWidth - 40);
    currentY += 120 + sectionSpacing; // Height for potions section
    
    // Final separator for bottom closure
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
  }

  /**
   * Creates an enhanced section separator with visual flair
   */
  private createSectionSeparator(x: number, y: number, width: number): void {
    // Create a container for the separator elements
    const separatorContainer = this.add.container(0, 0);
    
    // Background glow effect
    const glow = this.add.graphics();
    glow.fillStyle(0x4A90E2, 0.15);
    glow.fillRect(x + width * 0.2, y - 1, width * 0.6, 3);
    separatorContainer.add(glow);
    
    // Main separator line
    const separator = this.add.graphics();
    separator.lineStyle(1, 0x4A90E2, 0.6);
    separator.beginPath();
    separator.moveTo(x + width * 0.1, y);
    separator.lineTo(x + width * 0.9, y);
    separator.strokePath();
    separatorContainer.add(separator);
    
    // Accent dots for visual interest
    const leftDot = this.add.graphics();
    leftDot.fillStyle(0x4A90E2, 0.8);
    leftDot.fillCircle(x + width * 0.1, y, 2);
    separatorContainer.add(leftDot);
    
    const rightDot = this.add.graphics();
    rightDot.fillStyle(0x4A90E2, 0.8);
    rightDot.fillCircle(x + width * 0.9, y, 2);
    separatorContainer.add(rightDot);
    
    this.uiContainer.add(separatorContainer);
  }

  /**
   * Create modern health section with sleek design
   */
  private createModernHealthSection(x: number, y: number, width: number): void {
    // Section container with subtle background - shortened to fit only currency section
    const sectionBg = this.add.graphics();
    sectionBg.fillStyle(0x1a1a1a, 0.4);
    sectionBg.lineStyle(1, 0x333333, 0.5);
    sectionBg.fillRoundedRect(x - 5, y - 5, width + 10, 115, 12);
    sectionBg.strokeRoundedRect(x - 5, y - 5, width + 10, 115, 12);
    this.uiContainer.add(sectionBg);
    
    // Health header with properly aligned elements
    const healthIcon = this.add.text(x, y + 8, "♥", {
      fontSize: "18px",
      color: "#e74c3c",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    healthIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const healthLabel = this.add.text(x + 25, y + 8, "HEALTH", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    healthLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Health value center-aligned
    const playerData = this.getPlayerData();
    this.healthText = this.add.text(x + width/2 + 30, y + 8, `${playerData.currentHealth}/${playerData.maxHealth}`, {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5, 0.5);
    this.healthText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Modern health bar container with organized spacing
    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x2c2c2c, 0.8);
    healthBarBg.fillRoundedRect(x, y + 40, width - 10, 12, 6);
    this.uiContainer.add(healthBarBg);
    
    // Health bar fill
    this.healthBar = this.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    // Currency section with properly aligned elements
    const gintoIcon = this.add.text(x, y + 70, "💰", {
      fontSize: "16px"
    }).setOrigin(0, 0.5);
    gintoIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const gintoLabel = this.add.text(x + 25, y + 70, "GINTO", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    gintoLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Left-aligned GINTO value - moved further right
    this.currencyText = this.add.text(x + 120, y + 70, `${playerData.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "left"
    }).setOrigin(0, 0.5);
    this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Diamante currency display with properly aligned elements
    const diamanteIcon = this.add.text(x, y + 95, "💎", {
      fontSize: "16px"
    }).setOrigin(0, 0.5);
    diamanteIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const diamanteLabel = this.add.text(x + 25, y + 95, "DIAMANTE", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    diamanteLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Left-aligned DIAMANTE value - moved further right
    this.diamanteText = this.add.text(x + 120, y + 95, `${playerData.diamante}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "left"
    }).setOrigin(0, 0.5);
    this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Landás meter with more spacing from currency section
    this.createLandasMeter(x, y + 140, width - 10, 18);
    
    this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel, this.healthText, this.currencyText, this.diamanteText]);
  }

  /**
   * Create modern relics section with grid layout
   */
  private createModernRelicsSection(x: number, y: number, width: number): void {
    // Section header with organized spacing
    const relicsLabel = this.add.text(x, y + 8, "RELICS", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    relicsLabel.setShadow(2, 2, '#000000', 2, false, true);
    this.uiContainer.add(relicsLabel);
    
    // Grid container with organized spacing
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x1a1a1a, 0.4);
    gridBg.lineStyle(1, 0x333333, 0.5);
    gridBg.fillRoundedRect(x - 5, y + 25, width + 10, 130, 12);
    gridBg.strokeRoundedRect(x - 5, y + 25, width + 10, 130, 12);
    this.uiContainer.add(gridBg);
    
    // Create 4x2 grid of relic slots with organized spacing
    const slotSize = 45;
    const slotSpacing = 12;
    const slotsPerRow = 4;
    const rows = 2;
    const gridStartX = x + 15;
    const gridStartY = y + 40;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = gridStartX + col * (slotSize + slotSpacing);
        const slotY = gridStartY + row * (slotSize + slotSpacing);
        
        const slot = this.add.graphics();
        slot.fillStyle(0x2c2c2c, 0.6);
        slot.lineStyle(1, 0x404040, 0.8);
        slot.fillRoundedRect(slotX, slotY, slotSize, slotSize, 8);
        slot.strokeRoundedRect(slotX, slotY, slotSize, slotSize, 8);
        slot.setDepth(-10); // Set slots behind relics
        this.uiContainer.add(slot);
      }
    }
    
    // Create relics container for items
    this.relicsContainer = this.add.container(gridStartX, gridStartY);
    this.relicsContainer.setDepth(10); // Ensure relics appear above slots
    this.uiContainer.add(this.relicsContainer);
    
    console.log('🎯 Created relicsContainer at:', { x: gridStartX, y: gridStartY, depth: this.relicsContainer.depth });
  }

  /**
   * Create modern potions section
   */
  private createModernPotionsSection(x: number, y: number, width: number): void {
    // Section header with organized spacing
    const potionsLabel = this.add.text(x, y + 8, "POTIONS", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    potionsLabel.setShadow(2, 2, '#000000', 2, false, true);
    this.uiContainer.add(potionsLabel);
    
    // Potions container with organized spacing
    const potionsBg = this.add.graphics();
    potionsBg.fillStyle(0x1a1a1a, 0.4);
    potionsBg.lineStyle(1, 0x333333, 0.5);
    potionsBg.fillRoundedRect(x - 5, y + 25, width + 10, 65, 12);
    potionsBg.strokeRoundedRect(x - 5, y + 25, width + 10, 65, 12);
    this.uiContainer.add(potionsBg);
    
    // Create 3 potion slots with organized spacing
    const slotSize = 40;
    const slotSpacing = 18;
    const potionStartX = x + 20;
    const potionStartY = y + 38;
    
    for (let i = 0; i < 3; i++) {
      const slotX = potionStartX + i * (slotSize + slotSpacing);
      
      const slot = this.add.graphics();
      slot.fillStyle(0x2c2c2c, 0.6);
      slot.lineStyle(1, 0x404040, 0.8);
      slot.fillRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
      slot.strokeRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
      this.uiContainer.add(slot);
    }
    
    // Create potions container for items
    this.potionsContainer = this.add.container(potionStartX, potionStartY);
    this.uiContainer.add(this.potionsContainer);
  }

  /**
   * Create top stats section with health bar and key stats
   */
  private createTopStatsSection(x: number, y: number): void {
    // Enhanced health section with gradient background
    const healthSectionBg = this.add.graphics();
    healthSectionBg.fillGradientStyle(0x1a0000, 0x1a0000, 0x000000, 0x000000, 0.95);
    healthSectionBg.lineStyle(3, 0xff0000, 0.8);
    healthSectionBg.fillRoundedRect(x - 10, y - 10, 270, 240, 12);
    healthSectionBg.strokeRoundedRect(x - 10, y - 10, 270, 240, 12);
    
    // Add subtle inner glow
    const healthGlow = this.add.graphics();
    healthGlow.lineStyle(1, 0xff0000, 0.3);
    healthGlow.strokeRoundedRect(x - 7, y - 7, 264, 234, 9);
    
    this.uiContainer.add([healthSectionBg, healthGlow]);
    
    // Enhanced health header with glow effect
    const healthIcon = this.add.text(x, y, "❤️", {
      fontSize: "24px",
      fontStyle: "bold"
    });
    healthIcon.setShadow(1, 1, '#ff0000', 3, false, true);
    
    const healthLabel = this.add.text(x + 35, y + 2, "HEALTH", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    healthLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Enhanced health value with larger font
    this.healthText = this.add.text(x + 35, y + 26, "80/80", {
      fontFamily: "dungeon-mode",
      fontSize: "18px",
      color: "#ff3333",
      fontStyle: "bold"
    });
    this.healthText.setShadow(2, 2, '#000000', 3, false, true);
    
    // Enhanced health bar with better styling
    const healthBarContainer = this.add.graphics();
    healthBarContainer.fillStyle(0x1a1a1a, 0.9);
    healthBarContainer.lineStyle(2, 0x666666, 1);
    healthBarContainer.fillRoundedRect(x, y + 55, 250, 24, 12);
    healthBarContainer.strokeRoundedRect(x, y + 55, 250, 24, 12);
    this.uiContainer.add(healthBarContainer);
    
    this.healthBar = this.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    // Enhanced separator with gradient effect
    const healthSeparator = this.add.graphics();
    healthSeparator.lineStyle(2, 0x666666, 0.6);
    healthSeparator.beginPath();
    healthSeparator.moveTo(x - 5, y + 88);
    healthSeparator.lineTo(x + 255, y + 88);
    healthSeparator.closePath();
    healthSeparator.strokePath();
    this.uiContainer.add(healthSeparator);
    
    // Enhanced currency display with wider container to prevent overlap
    const currencyBg = this.add.graphics();
    currencyBg.fillGradientStyle(0x1a1a00, 0x1a1a00, 0x000000, 0x000000, 0.95);
    currencyBg.lineStyle(2, 0xffd700, 0.9);
    currencyBg.fillRoundedRect(x, y + 98, 250, 45, 8);
    currencyBg.strokeRoundedRect(x, y + 98, 250, 45, 8);
    
    // Add currency inner glow
    const currencyGlow = this.add.graphics();
    currencyGlow.lineStyle(1, 0xffd700, 0.3);
    currencyGlow.strokeRoundedRect(x + 2, y + 100, 246, 41, 6);
    
    this.uiContainer.add([currencyBg, currencyGlow]);
    
    const gintoIcon = this.add.text(x + 10, y + 108, "💰", {
      fontSize: "20px"
    });
    gintoIcon.setShadow(1, 1, '#ffd700', 2, false, true);
    
    const gintoLabel = this.add.text(x + 38, y + 103, "GINTO", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "12px",
      color: "#ffd700",
      fontStyle: "bold"
    });
    gintoLabel.setShadow(1, 1, '#000000', 2, false, true);
    
    this.currencyText = this.add.text(x + 38, y + 120, "100", {
      fontFamily: "dungeon-mode",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Diamante currency display - positioned further right to prevent overlap
    const diamanteIcon = this.add.text(x + 125, y + 108, "💎", {
      fontSize: "20px"
    });
    diamanteIcon.setShadow(1, 1, '#00ffff', 2, false, true);
    
    const diamanteLabel = this.add.text(x + 153, y + 103, "DIAMANTE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "12px",
      color: "#00ffff",
      fontStyle: "bold"
    });
    diamanteLabel.setShadow(1, 1, '#000000', 2, false, true);
    
    this.diamanteText = this.add.text(x + 153, y + 120, "0", {
      fontFamily: "dungeon-mode",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Enhanced separator
    const currencySeparator = this.add.graphics();
    currencySeparator.lineStyle(2, 0x666666, 0.6);
    currencySeparator.beginPath();
    currencySeparator.moveTo(x - 5, y + 152);
    currencySeparator.lineTo(x + 255, y + 152);
    currencySeparator.closePath();
    currencySeparator.strokePath();
    this.uiContainer.add(currencySeparator);
    
    // Enhanced Landás meter
    this.createLandasMeter(x, y + 162, 250, 28);
    
    this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel]);
  }

  /**
   * Create grid-based inventory section (4x2 grid like reference image)
   */
  private createGridInventorySection(x: number, y: number): void {
    const slotSize = 50;
    const slotSpacing = 8; // Reduced back to reasonable spacing
    const slotsPerRow = 4;
    const rows = 2;
    
    // Create inventory grid background with proper size calculation
    const gridPadding = 10;
    const gridWidth = slotsPerRow * slotSize + (slotsPerRow - 1) * slotSpacing + (gridPadding * 2);
    const gridHeight = rows * slotSize + (rows - 1) * slotSpacing + (gridPadding * 2);
    
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x000000, 0.9);
    gridBg.lineStyle(2, 0x444444, 1);
    gridBg.fillRoundedRect(x - gridPadding, y - gridPadding, gridWidth, gridHeight, 10);
    gridBg.strokeRoundedRect(x - gridPadding, y - gridPadding, gridWidth, gridHeight, 10);
    this.uiContainer.add(gridBg);
    
    // Create section header positioned properly above the grid
    const relicsHeaderBg = this.add.graphics();
    relicsHeaderBg.fillStyle(0x000000, 0.9);
    relicsHeaderBg.fillRoundedRect(x - 5, y - 35, 100, 25, 6);
    this.uiContainer.add(relicsHeaderBg);
    
    const relicsTitle = this.add.text(x, y - 22, "RELICS", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    this.uiContainer.add(relicsTitle);
    this.uiContainer.add(gridBg);
    
    // Create inventory slots with proper spacing
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = x + col * (slotSize + slotSpacing);
        const slotY = y + row * (slotSize + slotSpacing);
        
        // Create slot background
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x222222, 0.9);
        slotBg.lineStyle(1, 0x555555, 1);
        slotBg.fillRoundedRect(slotX, slotY, slotSize, slotSize, 6);
        slotBg.strokeRoundedRect(slotX, slotY, slotSize, slotSize, 6);
        this.uiContainer.add(slotBg);
      }
    }
    
    // Create relics container for the grid
    this.relicsContainer = this.add.container(x, y);
    this.uiContainer.add(this.relicsContainer);
  }

  /**
   * Create bottom actions section for potions and controls
   */
  private createBottomActionsSection(x: number, y: number): void {
    // Create potions section title with much more spacing above
    const potionsTitle = this.add.text(x - 5, y - 50, "POTIONS", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.uiContainer.add(potionsTitle);
    
    // Create Persona-style potions section background - adjusted size
    const potionsBg = this.add.graphics();
    potionsBg.fillStyle(0x000000, 0.85); // Black background
    potionsBg.lineStyle(2, 0xff0000, 1); // Red border
    potionsBg.fillRoundedRect(x - 10, y - 10, 140, 60, 8); // Width calculated for 3 slots properly
    potionsBg.strokeRoundedRect(x - 10, y - 10, 140, 60, 8);
    this.uiContainer.add(potionsBg);
    
    // Potions section with 3 slots - calculate spacing to fit properly
    const potionSlotSize = 38; // Slightly smaller slots
    const totalSlotsWidth = 3 * potionSlotSize; // 114px
    const availableWidth = 120; // Background width (140) minus padding (20)
    const totalSpacingWidth = availableWidth - totalSlotsWidth; // 6px total
    const potionSpacing = totalSpacingWidth / 2; // 3px between slots
    
    // Create Persona-style potion slots with proper spacing
    for (let i = 0; i < 3; i++) {
      const slotX = x + i * (potionSlotSize + potionSpacing);
      const slotY = y;
      
      // Create Persona-style slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x1a1a1a, 0.9); // Dark gray background
      slotBg.lineStyle(1, 0xff0000, 1); // Red border
      slotBg.fillRoundedRect(slotX, slotY, potionSlotSize, potionSlotSize, 6);
      slotBg.strokeRoundedRect(slotX, slotY, potionSlotSize, potionSlotSize, 6);
      this.uiContainer.add(slotBg);
    }
    
    // Create potions container
    this.potionsContainer = this.add.container(x, y);
    this.uiContainer.add(this.potionsContainer);
  }

  /**
   * Create a Persona-style Landás meter display
   */
  private createLandasMeter(x: number, y: number, width: number, height: number): void {
    // Enhanced "LANDAS" label positioned above the meter
    const landasLabel = this.add.text(x + width / 2, y - 5, "LANDAS", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 1);
    landasLabel.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(landasLabel);
    
    // Enhanced meter background with gradient
    const meterBg = this.add.graphics();
    meterBg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x000000, 0x000000, 0.95);
    meterBg.lineStyle(2, 0x666666, 0.8);
    meterBg.fillRoundedRect(x, y, width, height, 6);
    meterBg.strokeRoundedRect(x, y, width, height, 6);
    
    // Add inner border for depth
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(1, 0x444444, 0.5);
    innerBorder.strokeRoundedRect(x + 1, y + 1, width - 2, height - 2, 5);
    
    this.uiContainer.add([meterBg, innerBorder]);
    
    // Enhanced gradient meter fill with smoother transition
    const gradientFill = this.add.graphics();
    // Conquest side with enhanced red gradient
    gradientFill.fillGradientStyle(0xff0000, 0xdc143c, 0xb71c1c, 0x8b0000, 0.7);
    gradientFill.fillRoundedRect(x + 2, y + 2, (width - 4) / 2, height - 4, 4);
    
    // Mercy side with enhanced blue gradient
    gradientFill.fillGradientStyle(0x0080ff, 0x1e90ff, 0x4169e1, 0x0047ab, 0.7);
    gradientFill.fillRoundedRect(x + 2 + (width - 4) / 2, y + 2, (width - 4) / 2, height - 4, 4);
    
    this.uiContainer.add(gradientFill);
    
    // Enhanced indicator line with glow effect
    this.landasMeterIndicator = this.add.graphics();
    this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
    this.landasMeterIndicator.beginPath();
    this.landasMeterIndicator.moveTo(x + width / 2, y);
    this.landasMeterIndicator.lineTo(x + width / 2, y + height);
    this.landasMeterIndicator.closePath();
    this.landasMeterIndicator.strokePath();
    
    // Add glow effect to indicator
    const indicatorGlow = this.add.graphics();
    indicatorGlow.lineStyle(1, 0xffffff, 0.4);
    indicatorGlow.beginPath();
    indicatorGlow.moveTo(x + width / 2, y);
    indicatorGlow.lineTo(x + width / 2, y + height);
    indicatorGlow.closePath();
    indicatorGlow.strokePath();
    
    this.uiContainer.add([this.landasMeterIndicator, indicatorGlow]);
    
    // Enhanced labels with better positioning and smaller font
    const conquestLabel = this.add.text(x + 8, y + height / 2, "CONQUEST", {
      fontFamily: "dungeon-mode",
      fontSize: "8px",
      color: "#ff6b6b",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    conquestLabel.setShadow(1, 1, '#000000', 1, false, true);
    
    const mercyLabel = this.add.text(x + width - 8, y + height / 2, "MERCY", {
      fontFamily: "dungeon-mode",
      fontSize: "8px",
      color: "#74c0fc",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);
    mercyLabel.setShadow(1, 1, '#000000', 1, false, true);
    
    this.uiContainer.add([conquestLabel, mercyLabel]);
    
    // Enhanced value text - positioned in center
    this.landasText = this.add.text(x + width / 2, y + height / 2, "0", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    this.landasText.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(this.landasText);
  }

  /**
   * Create a small button (He Is Coming style) for UI actions
   */
  private createSmallButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const padding = 8;
    const buttonWidth = 70;
    const buttonHeight = 20;
    
    const background = this.add.graphics();
    background.fillStyle(0x333333, 0.9);
    background.lineStyle(1, 0x555555, 1);
    background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
    background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      background.clear();
      background.fillStyle(0x555555, 0.9);
      background.lineStyle(1, 0x777777, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      buttonText.setColor('#ffff00');
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(0x333333, 0.9);
      background.lineStyle(1, 0x555555, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      buttonText.setColor('#ffffff');
    });
    
    return button;
  }

  /**
   * Create a small button for potion actions with consistent square design
   */
  private createSmallPotionButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const buttonSize = 12;
    const background = this.add.graphics();
    background.fillStyle(color, 0.8);
    background.lineStyle(1, 0xffffff, 0.6);
    background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
    background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '7px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      background.clear();
      background.fillStyle(color, 0.95);
      background.lineStyle(1, 0xffffff, 0.8);
      background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      buttonText.setColor('#ffff00');
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(color, 0.8);
      background.lineStyle(1, 0xffffff, 0.6);
      background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      buttonText.setColor('#ffffff');
    });
    
    return button;
  }

  /**
   * Create tooltip for items (relics, potions) in refined game-like style
   */
  private createItemTooltip(targetObject: Phaser.GameObjects.Text, title: string, description: string): void {
    const tooltip = this.add.container(0, 0).setVisible(false).setDepth(2000);
    const tooltipBg = this.add.graphics();
    tooltipBg.fillStyle(0x000000, 0.85);
    tooltipBg.lineStyle(0.5, 0x555555);
    
    const tooltipText = this.add.text(0, 0, `${title}\n${description}`, {
      fontFamily: "dungeon-mode",
      fontSize: "9px",
      color: "#ffffff",
      wordWrap: { width: 160 },
      align: "center"
    }).setOrigin(0.5);
    
    const bounds = tooltipText.getBounds();
    tooltipBg.fillRoundedRect(-bounds.width/2 - 6, -bounds.height/2 - 3, bounds.width + 12, bounds.height + 6, 3);
    tooltipBg.strokeRoundedRect(-bounds.width/2 - 6, -bounds.height/2 - 3, bounds.width + 12, bounds.height + 6, 3);
    
    tooltip.add([tooltipBg, tooltipText]);
    this.uiContainer.add(tooltip);
    
    targetObject.on('pointerover', () => {
      const globalPos = targetObject.getWorldTransformMatrix();
      tooltip.setPosition(globalPos.tx + 20, globalPos.ty - 20);
      tooltip.setVisible(true);
    });
    
    targetObject.on('pointerout', () => {
      tooltip.setVisible(false);
    });
  }

  /**
   * Use a potion
   */
  private usePotion(index: number): void {
    const playerData = this.getPlayerData();
    if (index >= 0 && index < playerData.potions.length) {
      const potion = playerData.potions[index];
      console.log(`Using potion: ${potion.name}`);
      
      // Apply potion effects here
      switch (potion.effect) {
        case "draw_3_cards":
          console.log("Would draw 3 cards");
          break;
        case "gain_15_block":
          console.log("Would gain 15 block");
          break;
        default:
          console.log(`Unknown potion effect: ${potion.effect}`);
      }
      
      // Remove potion after use
      playerData.potions.splice(index, 1);
      this.updateOverworldUI();
    }
  }

  /**
   * Discard a potion
   */
  private discardPotion(index: number): void {
    const playerData = this.getPlayerData();
    if (index >= 0 && index < playerData.potions.length) {
      const potion = playerData.potions[index];
      console.log(`Discarding potion: ${potion.name}`);
      
      // Remove potion
      playerData.potions.splice(index, 1);
      this.updateOverworldUI();
    }
  }

  /**
   * Create discard charges display
   */
  private createDiscardChargesUI(): void {
    // Removed discard charges display as requested
  }

  /**
   * Create relics display
   */
  private createRelicsUI(): void {
    const relicsY = 70;
    
    // Relics label
    const relicsLabel = this.add.text(15, relicsY, "Relics:", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    this.uiContainer.add(relicsLabel);
    
    // Create relics container with proper positioning to avoid overlap
    this.relicsContainer = this.add.container(75, relicsY + 40);
    this.uiContainer.add(this.relicsContainer);
    
    // Create relic inventory button
    this.relicInventoryButton = this.createInventoryButton(250, relicsY, "Relics", () => {
      this.showRelicInventory();
    });
    this.uiContainer.add(this.relicInventoryButton);
  }

  /**
   * Create a button to open inventory with consistent square design
   */
  private createInventoryButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff'
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 10;
    const buttonWidth = Math.max(60, textWidth + padding); // Minimum width of 60px
    const buttonHeight = Math.max(20, textHeight + 5); // Minimum height of 20px
    
    // Create button background with consistent square design
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x333333, 0.9);
    buttonBg.lineStyle(1, 0xffffff, 1);
    buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([buttonBg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      // Highlight button on hover
      buttonBg.clear();
      buttonBg.fillStyle(0x555555, 0.9);
      buttonBg.lineStyle(1, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    });
    button.on('pointerout', () => {
      // Reset button style
      buttonBg.clear();
      buttonBg.fillStyle(0x333333, 0.9);
      buttonBg.lineStyle(1, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    });
    
    return button;
  }

  /**
   * Update all overworld UI elements
   */
  private updateOverworldUI(): void {
    this.updateHealthBar();
    this.updateCurrencyDisplay();
    this.updateLandasDisplay();
    this.updateRelicsDisplay();
    this.updatePotionsDisplay();
  }

  /**
   * Update health bar display with heart-shaped elements and consistent square design
   */
  private updateHealthBar(): void {
    const playerData = this.getPlayerData();
    const healthPercent = playerData.currentHealth / playerData.maxHealth;
    
    this.healthBar.clear();
    
    // Modern health bar position calculation - updated to match new layout
    const panelX = 20;
    const panelWidth = 320;
    const screenHeight = this.cameras.main.height;
    const panelHeight = Math.min(screenHeight - 40, 720);
    const panelY = screenHeight / 2 - panelHeight / 2;
    
    const healthSectionY = panelY + 70; // After header with organized spacing
    const barX = panelX + 20; // Health section x position
    const barY = healthSectionY + 40; // Health bar y position within section (adjusted from 50 to 40)
    const barWidth = panelWidth - 50; // Available width for health bar
    const barHeight = 12; // Modern thin health bar
    
    // Modern health color progression
    let healthColor = 0x2ecc71; // Modern green
    
    if (healthPercent < 0.75) {
      healthColor = 0x27ae60; // Darker green
    }
    if (healthPercent < 0.5) {
      healthColor = 0xf39c12; // Orange
    }
    if (healthPercent < 0.25) {
      healthColor = 0xe74c3c; // Modern red
    }
    
    // Draw modern health bar fill with rounded corners
    const fillWidth = barWidth * healthPercent;
    if (fillWidth > 4) {
      this.healthBar.fillStyle(healthColor, 1.0);
      this.healthBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 6);
      
      // Add subtle glow effect for low health
      if (healthPercent < 0.25) {
        this.healthBar.fillStyle(healthColor, 0.3);
        this.healthBar.fillRoundedRect(barX - 2, barY - 1, fillWidth + 4, barHeight + 2, 7);
      }
    }
    
    // Update health text - maintain center alignment
    this.healthText.setText(`${playerData.currentHealth}/${playerData.maxHealth}`);
    
    // Modern low health effects
    if (healthPercent < 0.25) {
      this.healthText.setShadow(1, 1, '#e74c3c', 2, false, true);
    } else {
      this.healthText.setShadow(2, 2, '#000000', 2, false, true);
      this.tweens.killTweensOf(this.healthText);
      this.healthText.setScale(1, 1);
    }
  }

  /**
   * Update currency display
   */
  private updateCurrencyDisplay(): void {
    const playerData = this.getPlayerData();
    this.currencyText.setText(`${playerData.ginto}`);
    this.diamanteText.setText(`${playerData.diamante}`);
  }

  /**
   * Update Landás score display
   */
  private updateLandasDisplay(): void {
    const playerData = this.getPlayerData();
    const score = playerData.landasScore;
    let color = "#9370db";
    
    if (score >= 5) {
      color = "#87ceeb";
    } else if (score <= -5) {
      color = "#ff6347";
    }
    
    // Update the meter indicator position based on score
    // Score ranges from -10 to +10, map to 0-250 (meter width)
    const meterWidth = 250;
    // Calculate dynamic coordinates matching the layout
    const screenHeight = this.cameras.main.height;
    const panelHeight = 700;
    const panelY = screenHeight / 2 - panelHeight / 2;
    const meterX = 45; // panelX + 20 + 5 = 20 + 20 + 5 = 45
    const meterY = panelY + 60 + 148 + 10; // panelY + health section offset + landas meter offset + padding
    const normalizedScore = (score + 10) / 20; // Normalize to 0-1
    const indicatorX = meterX + (normalizedScore * meterWidth);
    
    // Update indicator position
    if (this.landasMeterIndicator) {
      this.landasMeterIndicator.clear();
      this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
      this.landasMeterIndicator.beginPath();
      this.landasMeterIndicator.moveTo(indicatorX, meterY);
      this.landasMeterIndicator.lineTo(indicatorX, meterY + 20);
      this.landasMeterIndicator.closePath();
      this.landasMeterIndicator.strokePath();
    }
    
    // Update text display
    this.landasText.setText(`${score >= 0 ? '+' : ''}${score}`);
    this.landasText.setColor(color);
  }

  /**
   * Update relics display with modern Persona-style design
   */
  private updateRelicsDisplay(): void {
    const playerData = this.getPlayerData();
    console.log('🎯 updateRelicsDisplay called with', playerData.relics.length, 'relics');
    console.log('🎯 Player relics:', playerData.relics.map((r: any) => r.name || r.id));
    this.relicsContainer.removeAll(true);
    
    const slotSize = 45; // Match the slot size from createModernRelicsSection
    const slotSpacing = 12; // Slightly reduced spacing to better fit
    const slotsPerRow = 4;
    const maxRelics = 8; // 4x2 grid
    
    // Calculate total grid dimensions for reference
    const totalGridWidth = (slotsPerRow * slotSize) + ((slotsPerRow - 1) * slotSpacing); // 213px total for 45px slots
    const totalGridHeight = (2 * slotSize) + (1 * slotSpacing); // 102px total for 45px slots
    
    // Position relics relative to the container (which is already at gridStartX, gridStartY)
    // No offset needed since container is positioned correctly
    
    for (let i = 0; i < Math.min(playerData.relics.length, maxRelics); i++) {
      const relic = playerData.relics[i];
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;
      
      // Position relative to container origin - matches slot positioning exactly
      const relicX = col * (slotSize + slotSpacing);
      const relicY = row * (slotSize + slotSpacing);
      
      // Create modern Persona-style relic container
      const relicContainer = this.add.container(relicX, relicY);
      // Don't set depth here - let it inherit from parent uiContainer
      
      // Relic background with modern gradient (no border)
      const relicBg = this.add.graphics();
      relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
      relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
      
      // Inner glow effect (subtle, no blue)
      const innerGlow = this.add.graphics();
      innerGlow.lineStyle(1, 0x333344, 0.4);
      innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      
      // Relic icon with size adjusted for 45px slots
      const relicIcon = this.add.text(slotSize/2, slotSize/2, relic.emoji, {
        fontSize: "24px", // Reduced to fit better in 45px slots
        align: "center"
      }).setOrigin(0.5);
      relicIcon.setShadow(1, 1, '#000000', 2, false, true);
      
      relicContainer.add([relicBg, innerGlow, relicIcon]);
      
      // Create hover tooltip container (initially hidden)
      const tooltipContainer = this.add.container(slotSize/2, -50);
      
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x0a0a0a, 0.95);
      tooltipBg.lineStyle(2, 0x00d4ff, 1);
      
      const tooltipText = this.add.text(0, 0, relic.name, {
        fontFamily: "dungeon-mode",
        fontSize: "12px", // Better readable size
        color: "#00d4ff",
        fontStyle: "bold",
        align: "center"
      }).setOrigin(0.5);
      tooltipText.setShadow(1, 1, '#000000', 2, false, true);
      
      // Dynamically size tooltip based on text
      const textBounds = tooltipText.getBounds();
      const tooltipWidth = Math.max(textBounds.width + 16, 80);
      const tooltipHeight = textBounds.height + 12;
      
      tooltipBg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
      tooltipBg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
      
      tooltipContainer.add([tooltipBg, tooltipText]);
      tooltipContainer.setVisible(false);
      tooltipContainer.setAlpha(0);
      
      relicContainer.add(tooltipContainer);
      
      // Make the entire container interactive with proper hit area
      relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      
      // Debug: Log interactive setup
      console.log('🎯 Setting up interactive for:', relic.name, {
        position: { x: relicX, y: relicY },
        hitArea: { width: slotSize, height: slotSize },
        inputEnabled: relicContainer.input?.enabled,
        depth: relicContainer.depth
      });
      
      // Enable input events
      relicContainer.input!.enabled = true;
      
      // Set proper interactivity for the relic container
      relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      relicContainer.setScrollFactor(0); // Ensure container stays screen-fixed
      relicContainer.setDepth(15); // Higher than slots but lower than tooltips
      
      console.log(`🎯 Making relic container interactive at (${relicX}, ${relicY}) with size ${slotSize}x${slotSize}`);
      relicContainer.on('pointerover', () => {
        console.log('🔥 Relic hover START:', relic.name);
        
        // Enhanced background on hover
        relicBg.clear();
        relicBg.fillGradientStyle(0x2a2a4e, 0x2a2a4e, 0x1f2439, 0x1f2439, 1);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Scale animation
        this.tweens.add({
          targets: relicContainer,
          scale: 1.1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Show tooltip
        const tooltipY = -60;
        tooltipContainer.setPosition(slotSize/2, tooltipY);
        tooltipContainer.setVisible(true);
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        this.input.setDefaultCursor('pointer');
      });
      
      relicContainer.on('pointerout', () => {
        console.log('❄️ Relic hover END:', relic.name);
        
        // Restore original background
        relicBg.clear();
        relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Scale back to normal
        this.tweens.add({
          targets: relicContainer,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        // Hide tooltip
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
        
        this.input.setDefaultCursor('default');
      });
      
      relicContainer.on('pointerdown', () => {
        console.log('�️ Relic CLICKED:', relic.name);
        this.showRelicDetails(relic);
      });
      
      // Modern hover effects
      relicContainer.on('pointerover', () => {
        console.log('🔥 Relic hover START:', relic.name, 'at position:', relicX, relicY); // Enhanced debug log
        
        // Enhanced background on hover (no blue border)
        relicBg.clear();
        relicBg.fillGradientStyle(0x2a2a4e, 0x2a2a4e, 0x1f2439, 0x1f2439, 1);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Enhanced glow (subtle highlight)
        innerGlow.clear();
        innerGlow.lineStyle(2, 0x555566, 0.8);
        innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale animation
        this.tweens.add({
          targets: relicContainer,
          scale: 1.1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Position tooltip above the relic
        tooltipContainer.y = -tooltipHeight - 10;
        
        // Show tooltip with fade in and slide up animation
        tooltipContainer.setVisible(true);
        tooltipContainer.y += 10; // Start slightly below the final position
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          y: -tooltipHeight - 10,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Change cursor
        this.input.setDefaultCursor('pointer');
      });
      
      relicContainer.on('pointerout', () => {
        console.log('❄️ Relic hover END:', relic.name); // Enhanced debug log
        
        // Restore original background (no blue border)
        relicBg.clear();
        relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Restore glow (subtle)
        innerGlow.clear();
        innerGlow.lineStyle(1, 0x333344, 0.4);
        innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale back to normal
        this.tweens.add({
          targets: relicContainer,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        // Hide tooltip with fade out and slide down animation
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          y: -tooltipHeight,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
        
        // Reset cursor
        this.input.setDefaultCursor('default');
      });
      
      
      // Removed duplicate click handler - keeping the main one at the end
      
      // Debug: Add visual indicator that container is interactive
      relicContainer.on('pointerup', () => {
        console.log('✋ Relic pointer UP:', relic.name);
      });
      
      // Add simple test event to verify input works at all
      relicContainer.on('pointermove', () => {
        console.log('🚀 BASIC MOVE EVENT for:', relic.name);
      });
      
      // Add subtle debug border to show interactive area (can be removed later)
      const debugBorder = this.add.graphics();
      debugBorder.lineStyle(1, 0x00ff00, 0.3);
      debugBorder.strokeRoundedRect(0, 0, slotSize, slotSize, 8);
      relicContainer.add(debugBorder);
      
      // Calculate world position for debugging
      const worldPos = relicContainer.parentContainer ? 
        relicContainer.parentContainer.getWorldTransformMatrix().transformPoint(relicX, relicY) :
        { x: relicX, y: relicY };
      
      console.log('✅ Created interactive relic:', relic.name, {
        localPos: { x: relicX, y: relicY },
        worldPos: worldPos,
        containerDepth: relicContainer.depth,
        parentDepth: this.relicsContainer.depth,
        uiContainerDepth: this.uiContainer.depth,
        inputEnabled: relicContainer.input?.enabled
      });
      
      this.relicsContainer.add(relicContainer);
    }
  }

  /**
   * Update potions display in bottom action slots
   */
  private updatePotionsDisplay(): void {
    this.potionsContainer.removeAll(true);
    
    // Match the calculations from createModernPotionsSection
    const slotSize = 40;
    const slotSpacing = 18;
    const maxPotions = 3;
    
    const playerData = this.getPlayerData();
    for (let i = 0; i < Math.min(playerData.potions.length, maxPotions); i++) {
      const potion = playerData.potions[i];
      const potionX = i * (slotSize + slotSpacing);
      const potionY = 0;
      
      // Create potion container
      const potionContainer = this.add.container(potionX, potionY);
      
      // Potion background (slightly smaller than slot to create padding effect)
      const potionBg = this.add.graphics();
      potionBg.fillStyle(0x000000, 0.6);
      potionBg.lineStyle(1, 0x555555, 0.8);
      potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      
      // Potion icon - centered in the slot
      const potionIcon = this.add.text(slotSize/2, slotSize/2, "🧪", {
        fontSize: "20px",
        align: "center"
      }).setOrigin(0.5);
      
      potionContainer.add([potionBg, potionIcon]);
      
      // Make interactive for tooltip and actions
      potionContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      this.createItemTooltip(potionIcon, potion.name, potion.description);
      
      // Add hover effects
      potionContainer.on('pointerover', () => {
        potionBg.clear();
        potionBg.fillStyle(0x333333, 0.8);
        potionBg.lineStyle(2, 0x44aa44, 1);
        potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale up on hover
        this.tweens.add({
          targets: potionContainer,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      potionContainer.on('pointerout', () => {
        potionBg.clear();
        potionBg.fillStyle(0x000000, 0.6);
        potionBg.lineStyle(1, 0x555555, 0.8);
        potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale back to normal
        this.tweens.add({
          targets: potionContainer,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      // Add use/discard buttons
      const useButton = this.createSmallPotionButton(
        potionX + slotSize - 8,
        potionY + 8,
        "U",
        0x00aa00,
        () => this.usePotion(i)
      );
      
      const discardButton = this.createSmallPotionButton(
        potionX + slotSize - 8,
        potionY + 24,
        "D",
        0xaa0000,
        () => this.discardPotion(i)
      );
      
      this.potionsContainer.add([potionContainer, useButton, discardButton]);
    }
    
    // Update discard charges display
    if (this.discardText) {
      const playerData = this.getPlayerData();
      this.discardText.setText(`${playerData.discardCharges || 1}/${playerData.maxDiscardCharges || 1}`);
    }
  }

  /**
   * Update deck info display
   */
  private updateDeckInfoDisplay(): void {
    const playerData = this.getPlayerData();
    const totalCards = playerData.deck.length;
    const handSize = playerData.hand.length;
    const discardSize = playerData.discardPile.length;

    const deckInfo = `Total Cards: ${totalCards}\nHand: ${handSize}\nDiscard: ${discardSize}\nDiscard Charges: ${playerData.discardCharges}/${playerData.maxDiscardCharges}`;    this.deckInfoText.setText(deckInfo);
  }

  /**
   * Create potions display with use/discard functionality
   */
  private createPotionsUI(): void {
    const potionsY = 100;
    
    // Potions label
    const potionsLabel = this.add.text(15, potionsY, "Potions:", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    this.uiContainer.add(potionsLabel);
    
    // Create potions container
    this.potionsContainer = this.add.container(85, potionsY);
    this.uiContainer.add(this.potionsContainer);
    
    // Create potion inventory button
    this.potionInventoryButton = this.createInventoryButton(250, potionsY, "Potions", () => {
      this.showPotionInventory();
    });
    this.uiContainer.add(this.potionInventoryButton);
  }

  /**
   * Show relic inventory in a modal window
   */
  private showRelicInventory(): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(3000);
    
    // Create inventory window
    const windowWidth = 600;
    const windowHeight = 400;
    const inventoryWindow = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(3001);
    
    // Create window background
    const windowBg = this.add.graphics();
    windowBg.fillStyle(0x1a1a1a, 0.95);
    windowBg.lineStyle(3, 0x4a4a4a);
    windowBg.fillRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    windowBg.strokeRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    
    // Create title
    const title = this.add.text(0, -windowHeight/2 + 30, "Relic Inventory", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Create relic grid
    const relicGrid = this.add.container(0, 0);
    const relicSize = 60;
    const relicsPerRow = 6;
    const padding = 20;
    
    const playerData = this.getPlayerData();
    playerData.relics.forEach((relic: any, index: number) => {
      const row = Math.floor(index / relicsPerRow);
      const col = index % relicsPerRow;
      
      const x = col * (relicSize + padding) - (relicsPerRow - 1) * (relicSize + padding) / 2;
      const y = row * (relicSize + padding) - 20;
      
      // Create relic square with improved styling
      const relicSquare = this.add.container(x, y);
      const squareBg = this.add.graphics();
      squareBg.fillStyle(0x333333);
      squareBg.lineStyle(2, 0x555555);
      squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
      squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
      
      // Create relic icon
      const relicIcon = this.add.text(0, 0, relic.emoji, {
        fontSize: "32px"
      }).setOrigin(0.5);
      
      // Create tooltip
      const tooltip = this.add.container(0, -70).setVisible(false);
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x000000, 0.9);
      tooltipBg.lineStyle(2, 0x4a4a4a);
      
      const tooltipText = this.add.text(0, 0, `${relic.name}
${relic.description}`, {
        fontFamily: "dungeon-mode",
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: 200 },
        align: "center"
      }).setOrigin(0.5);
      
      const bounds = tooltipText.getBounds();
      tooltipBg.fillRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      tooltipBg.strokeRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      
      tooltip.add([tooltipBg, tooltipText]);
      
      relicSquare.add([squareBg, relicIcon, tooltip]);
      
      // Add hover events
      relicSquare.setInteractive(new Phaser.Geom.Rectangle(-relicSize/2, -relicSize/2, relicSize, relicSize), Phaser.Geom.Rectangle.Contains);
      relicSquare.on('pointerover', () => {
        squareBg.clear();
        squareBg.fillStyle(0x555555);
        squareBg.lineStyle(2, 0x777777);
        squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        tooltip.setVisible(true);
      });
      
      relicSquare.on('pointerout', () => {
        squareBg.clear();
        squareBg.fillStyle(0x333333);
        squareBg.lineStyle(2, 0x555555);
        squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        tooltip.setVisible(false);
      });
      
      relicGrid.add(relicSquare);
    });
    
    // Create close button
    const closeBtn = this.add.container(windowWidth/2 - 30, -windowHeight/2 + 30);
    const closeBtnBg = this.add.graphics();
    closeBtnBg.fillStyle(0xaa0000, 0.8);
    closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    const closeBtnText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff"
    }).setOrigin(0.5);
    closeBtn.add([closeBtnBg, closeBtnText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      inventoryWindow.destroy();
    });
    closeBtn.on('pointerover', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xff0000, 0.9);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    closeBtn.on('pointerout', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xaa0000, 0.8);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    
    inventoryWindow.add([windowBg, title, relicGrid, closeBtn]);
  }

  /**
   * Show potion inventory in a modal window
   */
  private showPotionInventory(): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(3000);
    
    // Create inventory window
    const windowWidth = 600;
    const windowHeight = 400;
    const inventoryWindow = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(3001);
    
    // Create window background
    const windowBg = this.add.graphics();
    windowBg.fillStyle(0x1a1a1a, 0.95);
    windowBg.lineStyle(3, 0x4a4a4a);
    windowBg.fillRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    windowBg.strokeRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    
    // Create title
    const title = this.add.text(0, -windowHeight/2 + 30, "Potion Inventory", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Create potion grid
    const potionGrid = this.add.container(0, 0);
    const potionSize = 80;
    const potionsPerRow = 4;
    const padding = 30;
    
    const playerData = this.getPlayerData();
    playerData.potions.forEach((potion: any, index: number) => {
      const row = Math.floor(index / potionsPerRow);
      const col = index % potionsPerRow;
      
      const x = col * (potionSize + padding) - (potionsPerRow - 1) * (potionSize + padding) / 2;
      const y = row * (potionSize + padding) - 20;
      
      // Create potion square with improved styling
      const potionSquare = this.add.container(x, y);
      const squareBg = this.add.graphics();
      squareBg.fillStyle(0x333333);
      squareBg.lineStyle(2, 0x555555);
      squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
      squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
      
      // Create potion icon
      const potionIcon = this.add.text(0, -10, potion.emoji, {
        fontSize: "36px"
      }).setOrigin(0.5);
      
      // Create potion name
      const potionName = this.add.text(0, 25, potion.name, {
        fontFamily: "dungeon-mode",
        fontSize: "12px",
        color: "#ffffff"
      }).setOrigin(0.5);
      
      // Create tooltip
      const tooltip = this.add.container(0, -90).setVisible(false);
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x000000, 0.9);
      tooltipBg.lineStyle(2, 0x4a4a4a);
      
      const tooltipText = this.add.text(0, 0, `${potion.name}
${potion.description}`, {
        fontFamily: "dungeon-mode",
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: 200 },
        align: "center"
      }).setOrigin(0.5);
      
      const bounds = tooltipText.getBounds();
      tooltipBg.fillRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      tooltipBg.strokeRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      
      tooltip.add([tooltipBg, tooltipText]);
      
      potionSquare.add([squareBg, potionIcon, potionName, tooltip]);
      
      // Add hover events
      potionSquare.setInteractive(new Phaser.Geom.Rectangle(-potionSize/2, -potionSize/2, potionSize, potionSize), Phaser.Geom.Rectangle.Contains);
      potionSquare.on('pointerover', () => {
        squareBg.clear();
        squareBg.fillStyle(0x555555);
        squareBg.lineStyle(2, 0x777777);
        squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        tooltip.setVisible(true);
      });
      
      potionSquare.on('pointerout', () => {
        squareBg.clear();
        squareBg.fillStyle(0x333333);
        squareBg.lineStyle(2, 0x555555);
        squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        tooltip.setVisible(false);
      });
      
      potionGrid.add(potionSquare);
    });
    
    // Create close button
    const closeBtn = this.add.container(windowWidth/2 - 30, -windowHeight/2 + 30);
    const closeBtnBg = this.add.graphics();
    closeBtnBg.fillStyle(0xaa0000, 0.8);
    closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    const closeBtnText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff"
    }).setOrigin(0.5);
    closeBtn.add([closeBtnBg, closeBtnText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      inventoryWindow.destroy();
    });
    closeBtn.on('pointerover', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xff0000, 0.9);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    closeBtn.on('pointerout', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xaa0000, 0.8);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    
    inventoryWindow.add([windowBg, title, potionGrid, closeBtn]);
  }

  /**
   * Show detailed relic information in a popup similar to shop style
   */
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
  private showNodeTooltipImmediate(nodeType: string, nodeId: string, mouseX: number, mouseY: number): void {
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
    this.tooltipNameText.setText(nodeInfo.name);
    this.tooltipNameText.setColor(colors.name);
    
    this.tooltipTypeText.setText(nodeInfo.type.toUpperCase());
    this.tooltipTypeText.setColor(colors.type);
    
    // Clear previous sprite and add new one
    this.tooltipSpriteContainer.removeAll(true);
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
      
      this.tooltipSpriteContainer.add(sprite);
    }
    
    this.tooltipStatsText.setText(nodeInfo.stats || "");
    this.tooltipStatsText.setColor(colors.stats);
    
    this.tooltipDescriptionText.setText(nodeInfo.description);
    this.tooltipDescriptionText.setColor(colors.description);
    
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

/**
 * OVERWORLD SCENE - Main Scene Coordinator
 * =====================================
 * 
 * The Overworld scene serves as the primary hub of Bathala, managing the player's
 * journey through a procedurally generated world filled with encounters, shops,
 * treasures, and mysteries. This scene acts as a coordinator, delegating specific
 * responsibilities to specialized manager classes for clean architecture.
 * 
 * ARCHITECTURE PATTERN:
 * This scene implements a manager-based delegation pattern where all major
 * functionality is handled by specialized managers:
 * 
 * • OverworldUIManager - All user interface elements, tooltips, and visual feedback
 * • OverworldMovementManager - Player movement, input handling, and enemy AI movement
 * • OverworldGameStateManager - Game state persistence, scene transitions, and data management
 * • OverworldMazeGeneration - Procedural world generation, chunk management, and node placement
 * • OverworldGameMechanicManager - Core gameplay mechanics, node interactions, and game rules
 * 
 * CORE RESPONSIBILITIES:
 * • Scene lifecycle management (create, resume, update)
 * • Manager coordination and initialization
 * • Public API for cross-scene communication
 * • Event handling and delegation to appropriate managers
 * 
 * GAMEPLAY FEATURES:
 * • Procedural maze-based world exploration
 * • Day/night cycle affecting enemy behavior
 * • Various node types: combat, elite, boss, shop, campfire, treasure, events
 * • Dynamic tooltip system for interactive elements
 * • Persistent player progression and state management
 * • Boss encounter triggers after set action thresholds
 * 
 * This scene maintains zero business logic and focuses purely on coordination,
 * ensuring clean separation of concerns and maintainable code architecture.
 */

import { Scene } from "phaser";
import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import { Player } from "../../core/types/CombatTypes";
import { OverworldUIManager } from "./Overworld_UIManager";
import { OverworldMovementManager } from "./Overworld_MovementManager";
import { OverworldGameStateManager } from "./Overworld_GameStateManager";
import { OverworldMazeGeneration } from "./Overworld_MazeGeneration";
import { OverworldGameMechanicManager } from "./Overworld_GameMechanicManager";

export class Overworld extends Scene {
  private player!: Phaser.GameObjects.Sprite;
  public uiManager!: OverworldUIManager;
  private movementManager!: OverworldMovementManager;
  private gameStateManager!: OverworldGameStateManager;
  public mazeGeneration!: OverworldMazeGeneration;
  private gameMechanicManager!: OverworldGameMechanicManager;
  


  constructor() {
    super({ key: "Overworld" });
    
    // Initialize game state manager
    this.gameStateManager = new OverworldGameStateManager(this);
  }

  create(): void {
    // Initialize maze generation manager
    this.mazeGeneration = new OverworldMazeGeneration(this);
    
    // Initialize game mechanic manager
    this.gameMechanicManager = new OverworldGameMechanicManager(this);
    
    // Check if we're returning from another scene
    const gameState = GameState.getInstance();
    const savedPosition = gameState.getPlayerPosition();
    
    if (savedPosition) {
      // Restore player at saved position
      this.player = this.add.sprite(savedPosition.x, savedPosition.y, "overworld_player");
      // Clear the saved position so it's not used again
      gameState.clearPlayerPosition();
    } else {
      // Initialize new game through maze generation manager
      const startPosition = this.mazeGeneration.initializeNewGame();
      this.player = this.add.sprite(startPosition.x, startPosition.y, "overworld_player");
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
    
    // Initialize UI manager and create UI after camera is ready
    this.uiManager = new OverworldUIManager(this);
    this.time.delayedCall(10, () => {
      this.uiManager.createUI();
      // UI creation is now handled by UIManager
    });
    
    // Render initial chunks around player with a slight delay to ensure camera is ready
    this.time.delayedCall(20, () => this.mazeGeneration.updateVisibleChunks(), [], this);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  updateUI(): void {
    this.uiManager?.updateUI();
  }

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
    this.mazeGeneration.updateVisibleChunks();
    
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
    return this.mazeGeneration.getNodes();
  }

  public getNodeSprites(): Map<string, Phaser.GameObjects.Sprite> {
    return this.mazeGeneration.getNodeSprites();
  }

  public getIsTransitioningToCombat(): boolean {
    return this.gameStateManager.getIsTransitioningToCombat();
  }

  public setIsMoving(moving: boolean): void {
    this.movementManager?.setIsMoving(moving);
  }

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
    this.uiManager.hideTooltip();
    
    // Create dramatic effect for boss appearance
    this.uiManager.createBossAppearanceEffect();
    
    // Delay the actual combat transition for dramatic effect
    this.time.delayedCall(3000, () => {
      this.startBossEncounter();
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

  // Enemy movement methods now handled by OverworldMovementManager

  // Position validation now handled by OverworldMazeGeneration
  public isValidPosition(x: number, y: number): boolean {
    return this.mazeGeneration.isValidPosition(x, y);
  }

  // Maze chunk updates now handled by OverworldMazeGeneration
  public updateVisibleChunks(): void {
    this.mazeGeneration.updateVisibleChunks();
  }

  checkNodeInteraction(): void {
    // Delegate to game mechanic manager
    this.gameMechanicManager.checkNodeInteraction();
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
    return this.gameMechanicManager.getRelicLore(relic);
  }
  
  /**
   * Get color scheme for different node types
   */
  public getNodeColorScheme(nodeType: string): { name: string, type: string, stats: string, description: string } {
    return this.gameMechanicManager.getNodeColorScheme(nodeType);
  }

  /**
   * Get node information for different node types
   */
  public getNodeInfoForType(nodeType: string): any {
    return this.gameMechanicManager.getNodeInfoForType(nodeType);
  }

  /**
   * Get enemy information for a given node type
   */
  public getEnemyInfoForNodeType(nodeType: string, nodeId?: string): any {
    return this.gameMechanicManager.getEnemyInfoForNodeType(nodeType, nodeId);
  }
}
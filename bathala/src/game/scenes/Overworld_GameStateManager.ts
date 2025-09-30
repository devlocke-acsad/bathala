/**
 * OVERWORLD GAME STATE MANAGER
 * ============================
 * 
 * Manages all game state persistence, scene transitions, and player data
 * for the Overworld scene. This manager ensures seamless state management
 * across scene transitions and maintains data integrity throughout gameplay.
 * 
 * CORE RESPONSIBILITIES:
 * • Player data initialization and persistence
 * • Game state synchronization between scenes
 * • Combat encounter setup and enemy selection
 * • Scene transition management and data passing
 * • Boss encounter triggering and special effects
 * • Player position saving and restoration
 * • Cross-scene data integrity maintenance
 * 
 * PLAYER DATA MANAGEMENT:
 * • Default player stats initialization
 * • Saved state restoration from previous sessions
 * • Real-time player data updates and synchronization
 * • Health, currency, relics, and potions tracking
 * • Landás morality score management
 * • Deck state and card collection persistence
 * 
 * SCENE TRANSITION SYSTEM:
 * • Combat scene launching with proper enemy data
 * • Shop, campfire, and treasure scene coordination
 * • Player position preservation across transitions
 * • Scene pause/resume state management
 * • Data payload preparation for target scenes
 * • Transition animation coordination
 * 
 * COMBAT ENCOUNTER MANAGEMENT:
 * • Enemy selection based on node types and player progress
 * • Boss encounter detection and triggering
 * • Combat difficulty scaling and enemy rotation
 * • Special encounter effects and transitions
 * • Dramatic boss appearance animations
 * 
 * BOSS ENCOUNTER SYSTEM:
 * • Action threshold tracking for boss appearance
 * • Epic boss transition effects with camera manipulation
 * • Multi-stage dramatic reveal animations
 * • Boss combat data preparation and launch
 * 
 * STATE PERSISTENCE:
 * • Position saving before scene transitions
 * • Player data backup and restoration
 * • Scene resume handling with state validation
 * • Cross-scene communication protocols
 * 
 * This manager ensures smooth gameplay flow and maintains consistent
 * player progression throughout the entire game experience.
 */

import type { Overworld } from "./Overworld";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import type { Player } from "../../core/types/CombatTypes";
import { 
  TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK,
  MANANANGGAL, ASWANG, DUWENDE_CHIEF, BAKUNAWA
} from "../../data/enemies/Act1Enemies";

export class OverworldGameStateManager {
  private gameState: OverworldGameState;
  private isTransitioningToCombat: boolean = false;
  private playerData: Player;

  constructor(private readonly scene: Overworld) {
    this.gameState = OverworldGameState.getInstance();
    this.playerData = this.initializePlayerData();
  }

  /**
   * Initialize player data from saved state or defaults
   */
  private initializePlayerData(): Player {
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();
    
    if (savedPlayerData) {
      return {
        id: savedPlayerData.id || "player",
        name: savedPlayerData.name || "Hero",
        maxHealth: savedPlayerData.maxHealth || 80,
        currentHealth: savedPlayerData.currentHealth !== undefined ? savedPlayerData.currentHealth : 80,
        block: savedPlayerData.block || 0,
        statusEffects: savedPlayerData.statusEffects || [],
        hand: savedPlayerData.hand || [],
        deck: savedPlayerData.deck || [],
        discardPile: savedPlayerData.discardPile || [],
        drawPile: savedPlayerData.drawPile || [],
        playedHand: savedPlayerData.playedHand || [],
        landasScore: savedPlayerData.landasScore || 0,
        ginto: savedPlayerData.ginto !== undefined ? savedPlayerData.ginto : 100,
        diamante: savedPlayerData.diamante !== undefined ? savedPlayerData.diamante : 0,
        relics: savedPlayerData.relics || [],
        potions: savedPlayerData.potions || [],
        discardCharges: savedPlayerData.discardCharges !== undefined ? savedPlayerData.discardCharges : 1,
        maxDiscardCharges: savedPlayerData.maxDiscardCharges || 1
      };
    } else {
      // Initialize player data with default values
      return {
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
        ginto: 9999,
        diamante: 20,
        relics: [], // No test relics - will be empty until player finds them
        potions: [
          {
            id: "clarity_potion",
            name: "Potion of Clarity",
            description: "Draw 3 cards.",
            effect: "draw_3_cards",
            emoji: "🧠",
            rarity: "common" as const
          },
          {
            id: "fortitude_potion",
            name: "Elixir of Fortitude", 
            description: "Gain 15 Block.",
            effect: "gain_15_block",
            emoji: "🛡️",
            rarity: "common" as const
          },
          {
            id: "elements_potion",
            name: "Phial of Elements",
            description: "Choose your dominant element for this combat.",
            effect: "choose_element",
            emoji: "🌟",
            rarity: "uncommon" as const
          }
        ],
        discardCharges: 1,
        maxDiscardCharges: 1
      };
    }
  }

  /**
   * Get the current player data
   */
  public getPlayerData(): Player {
    return this.playerData;
  }

  /**
   * Update player data and sync with global game state
   */
  public updatePlayerData(newPlayerData: Partial<Player>): void {
    this.playerData = { ...this.playerData, ...newPlayerData };
    // Note: GameState will be updated when scenes transition
  }

  /**
   * Get the overworld game state instance
   */
  public getGameState(): OverworldGameState {
    return this.gameState;
  }

  /**
   * Get combat transition state
   */
  public getIsTransitioningToCombat(): boolean {
    return this.isTransitioningToCombat;
  }

  /**
   * Set combat transition state
   */
  public setIsTransitioningToCombat(transitioning: boolean): void {
    this.isTransitioningToCombat = transitioning;
  }

  /**
   * Save player position to game state
   */
  public savePlayerPosition(x: number, y: number): void {
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(x, y);
  }

  /**
   * Restore player position from game state
   */
  public restorePlayerPosition(): { x: number, y: number } | null {
    const gameState = GameState.getInstance();
    return gameState.getPlayerPosition();
  }

  /**
   * Clear saved player position
   */
  public clearPlayerPosition(): void {
    const gameState = GameState.getInstance();
    gameState.clearPlayerPosition();
  }

  /**
   * Handle scene resume - restore player data and position
   */
  public handleSceneResume(): void {
    console.log("GameStateManager: Handling scene resume");
    
    // Reset combat transition flag
    this.isTransitioningToCombat = false;
    
    // Restore player position if saved
    const savedPosition = this.restorePlayerPosition();
    if (savedPosition) {
      console.log("Restoring player position to:", savedPosition);
      const playerSprite = this.scene.getPlayerSprite();
      playerSprite.setPosition(savedPosition.x, savedPosition.y);
      // Center camera on player
      this.scene.cameras.main.startFollow(playerSprite);
      // Clear the saved position
      this.clearPlayerPosition();
    } else {
      console.log("No saved position found, keeping current position");
    }

    // Update player data from GameState
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();
    if (savedPlayerData) {
      this.playerData = {
        id: savedPlayerData.id || this.playerData.id,
        name: savedPlayerData.name || this.playerData.name,
        maxHealth: savedPlayerData.maxHealth !== undefined ? savedPlayerData.maxHealth : this.playerData.maxHealth,
        currentHealth: savedPlayerData.currentHealth !== undefined ? savedPlayerData.currentHealth : this.playerData.currentHealth,
        block: savedPlayerData.block !== undefined ? savedPlayerData.block : this.playerData.block,
        statusEffects: savedPlayerData.statusEffects || this.playerData.statusEffects,
        hand: savedPlayerData.hand || this.playerData.hand,
        deck: savedPlayerData.deck || this.playerData.deck,
        discardPile: savedPlayerData.discardPile || this.playerData.discardPile,
        drawPile: savedPlayerData.drawPile || this.playerData.drawPile,
        playedHand: savedPlayerData.playedHand || this.playerData.playedHand,
        landasScore: savedPlayerData.landasScore !== undefined ? savedPlayerData.landasScore : this.playerData.landasScore,
        ginto: savedPlayerData.ginto !== undefined ? savedPlayerData.ginto : this.playerData.ginto,
        diamante: savedPlayerData.diamante !== undefined ? savedPlayerData.diamante : this.playerData.diamante,
        relics: savedPlayerData.relics || this.playerData.relics,
        potions: savedPlayerData.potions || this.playerData.potions,
        discardCharges: savedPlayerData.discardCharges !== undefined ? savedPlayerData.discardCharges : this.playerData.discardCharges,
        maxDiscardCharges: savedPlayerData.maxDiscardCharges !== undefined ? savedPlayerData.maxDiscardCharges : this.playerData.maxDiscardCharges
      };
    }
  }

  /**
   * Check if boss should appear and trigger encounter
   */
  public checkBossEncounter(): void {
    if (this.gameState.shouldBossAppear()) {
      this.triggerBossEncounter();
    }
  }

  /**
   * Trigger boss encounter
   */
  public triggerBossEncounter(): void {
    console.log("🐉 Boss encounter triggered!");
    
    if (this.isTransitioningToCombat) {
      console.log("Already transitioning to combat, ignoring boss trigger");
      return;
    }
    
    this.isTransitioningToCombat = true;
    this.showBossAppearance();
  }

  /**
   * Show boss appearance animation and transition
   */
  private showBossAppearance(): void {
    const scene = this.scene;
    
    // Disable player movement during boss appearance
    scene.setIsMoving(true);
    
    // Create overlay
    const overlay = scene.add.rectangle(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(3000);
    
    // Fade in overlay
    scene.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create boss appearance text
    const bossText = scene.add.text(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      "THE FINAL BOSS AWAKENS!",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: "#ff0000",
        align: "center"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setScale(0.1);
    
    // Animate text scaling
    scene.tweens.add({
      targets: bossText,
      scale: 1,
      duration: 1500,
      ease: 'Elastic.easeOut'
    });
    
    // Shake camera for dramatic effect
    scene.cameras.main.shake(2000, 0.02);
    
    // Wait for animation to complete, then start boss combat
    scene.time.delayedCall(3000, () => {
      overlay.destroy();
      bossText.destroy();
      this.startBossCombat();
    });
  }

  /**
   * Start regular combat encounter
   */
  public startCombat(nodeType: string): void {
    // Prevent player from moving during combat transition
    this.scene.setIsMoving(true);
    this.isTransitioningToCombat = true;
    
    // Save player position before transitioning
    const playerSprite = this.scene.getPlayerSprite();
    this.savePlayerPosition(playerSprite.x, playerSprite.y);
    
    // Disable input during transition
    if (this.scene.input && this.scene.input.keyboard) {
      this.scene.input.keyboard.enabled = false;
    }
    
    // Check if this is a boss fight for special animation
    if (nodeType === "boss") {
      this.startBossCombat();
      return;
    }
    
    // Get camera dimensions
    const camera = this.scene.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create a full-screen overlay that follows the camera
    const overlay = this.scene.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Different transition effects based on enemy type
    if (nodeType === "elite") {
      // Elite enemy transition - flash with red tint
      const flashOverlay = this.scene.add.rectangle(
        cameraWidth / 2,
        cameraHeight / 2,
        cameraWidth,
        cameraHeight,
        0xff0000
      ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
      
      // Animate flash
      this.scene.tweens.add({
        targets: flashOverlay,
        alpha: 0.7,
        duration: 200,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Fade to black
      this.scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 800,
        delay: 400,
        ease: 'Power2',
        onComplete: () => {
          this.launchCombatScene(nodeType, overlay);
        }
      });
    } else {
      // Regular enemy transition - simple fade to black
      this.scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          this.launchCombatScene(nodeType, overlay);
        }
      });
    }
  }

  /**
   * Start boss combat with special effects
   */
  public startBossCombat(): void {
    const scene = this.scene;
    console.log("🐉 Starting boss combat!");
    
    // Save player position
    const playerSprite = scene.getPlayerSprite();
    this.savePlayerPosition(playerSprite.x, playerSprite.y);
    
    // Get camera dimensions
    const camera = scene.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create dramatic boss transition
    const overlay = scene.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Create red flash overlay for dramatic effect
    const redFlash = scene.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x8b0000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
    
    // Sequence of dramatic effects
    scene.tweens.add({
      targets: redFlash,
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        redFlash.destroy();
      }
    });
    
    // Shake camera intensely
    camera.shake(1500, 0.03);
    
    // Fade to black after effects
    scene.time.delayedCall(1000, () => {
      scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
          this.launchCombatScene("boss", overlay);
        }
      });
    });
  }

  /**
   * Launch the combat scene with proper data
   */
  private launchCombatScene(nodeType: string, overlay?: Phaser.GameObjects.Rectangle): void {
    const scene = this.scene;
    
    // Create combat data
    const combatData = {
      player: this.playerData,
      enemy: this.getEnemyForNodeType(nodeType),
      isBossFight: nodeType === "boss"
    };
    
    console.log("Launching combat with data:", combatData);
    
    // Pause overworld and launch combat
    scene.scene.pause();
    scene.scene.launch("Combat", combatData);
    
    // Clean up overlay after a brief delay
    if (overlay) {
      scene.time.delayedCall(100, () => {
        overlay.destroy();
      });
    }
  }

  /**
   * Get enemy data for node type
   */
  private getEnemyForNodeType(nodeType: string): any {
    switch (nodeType) {
      case "combat":
        // Random common enemy
        const commonEnemies = [TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK];
        return commonEnemies[Math.floor(Math.random() * commonEnemies.length)];
      
      case "elite":
        // Random elite enemy
        const eliteEnemies = [MANANANGGAL, ASWANG, DUWENDE_CHIEF];
        return eliteEnemies[Math.floor(Math.random() * eliteEnemies.length)];
      
      case "boss":
        return BAKUNAWA;
      
      default:
        return TIYANAK; // Fallback
    }
  }

  /**
   * Launch a scene (shop, campfire, treasure, etc.)
   */
  public launchScene(sceneName: string): void {
    // Save player position before transitioning
    const playerSprite = this.scene.getPlayerSprite();
    this.savePlayerPosition(playerSprite.x, playerSprite.y);
    
    // Pause overworld and launch the requested scene
    this.scene.scene.pause();
    this.scene.scene.launch(sceneName, { 
      player: this.playerData
    });
  }
}
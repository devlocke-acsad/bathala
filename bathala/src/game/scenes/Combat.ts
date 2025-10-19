import { Scene } from "phaser";
import {
  CombatState,
  Player,
  Enemy,
  PlayingCard,
  Suit,
  CreatureDialogue,
  PostCombatReward,
  Landas,
  HandType,
  StatusEffect,
} from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { HandEvaluator } from "../../utils/HandEvaluator";
import { GameState } from "../../core/managers/GameState";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import {
  getRandomCommonEnemy,
  getRandomEliteEnemy,
  getBossEnemy,
  getEnemyByName,
} from "../../data/enemies/Act1Enemies";
import { POKER_HAND_LIST, PokerHandInfo } from "../../data/poker/PokerHandReference";
import { RelicManager } from "../../core/managers/RelicManager";
import { RELIC_EFFECTS, hasRelicEffect, getRelicById } from "../../data/relics/Act1Relics";
import { commonRelics, eliteRelics, bossRelics } from "../../data/relics/Act1Relics";
import { EnemyDialogueManager } from "../managers/EnemyDialogueManager";
import { EnemyLoreUI } from "../managers/EnemyLoreUI";
import { CombatUI } from "./combat/CombatUI";
import { CombatDialogue } from "./combat/CombatDialogue";
import { CombatAnimations } from "./combat/CombatAnimations";
import { CombatDDA } from "./combat/CombatDDA";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { DifficultyAdjustment } from "../../core/dda/DDATypes";
import { commonPotions } from "../../data/potions/Act1Potions";
import { MusicManager } from "../../core/managers/MusicManager";

/**
 * Combat Scene - Main card-based combat with Slay the Spire style UI
 * Player on left, enemy on right, cards at bottom
 */
export class Combat extends Scene {
  public ui!: CombatUI;
  public dialogue!: CombatDialogue;
  public animations!: CombatAnimations;
  private enemyDialogueManager!: EnemyDialogueManager;
  private enemyLoreUI!: EnemyLoreUI;
  private combatState!: CombatState;
  private playerHealthText!: Phaser.GameObjects.Text;
  private playerBlockText!: Phaser.GameObjects.Text;
  private enemyHealthText!: Phaser.GameObjects.Text;
  private enemyBlockText!: Phaser.GameObjects.Text;
  private enemyIntentText!: Phaser.GameObjects.Text;
  private handContainer!: Phaser.GameObjects.Container;
  private playedHandContainer!: Phaser.GameObjects.Container;
  // cardSprites and playedCardSprites are now managed by CombatUI
  // Access via this.ui.cardSprites and this.ui.playedCardSprites
  private selectedCards: PlayingCard[] = [];
  private actionButtons!: Phaser.GameObjects.Container;
  private turnText!: Phaser.GameObjects.Text;
  private discardsUsedThisTurn: number = 0;
  private maxDiscardsPerTurn: number = 3;  // Increased from 1 to 3
  private specialUsedThisCombat: boolean = false;  // Track if Special has been used
  private actionsText!: Phaser.GameObjects.Text;  // Shows Discard and Special counters on one line
  private relicsContainer!: Phaser.GameObjects.Container;
  private playerStatusContainer!: Phaser.GameObjects.Container;
  private enemyStatusContainer!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private deckSprite!: Phaser.GameObjects.Sprite;
  private discardPileSprite!: Phaser.GameObjects.Sprite;
  private landasChoiceContainer!: Phaser.GameObjects.Container;
  private rewardsContainer!: Phaser.GameObjects.Container;
  private gameOverContainer!: Phaser.GameObjects.Container;
  private deckViewContainer!: Phaser.GameObjects.Container;
  private discardViewContainer!: Phaser.GameObjects.Container;
  private actionResultText!: Phaser.GameObjects.Text;
  private enemyAttackPreviewText!: Phaser.GameObjects.Text;
  private damagePreviewText!: Phaser.GameObjects.Text;
  private selectionCounterText!: Phaser.GameObjects.Text; // New selection counter
  private isDrawingCards: boolean = false;
  private isActionProcessing: boolean = false;
  private combatEnded: boolean = false;
  private turnCount: number = 0;
  private kapresCigarUsed: boolean = false; // Track if Kapre's Cigar minion summon has been used this combat
  private deckPosition!: { x: number; y: number };
  private discardPilePosition!: { x: number; y: number };
  private shopKey!: Phaser.Input.Keyboard.Key;
  private bestHandAchieved: HandType = "high_card";
  private battleStartDialogueContainer!: Phaser.GameObjects.Container | null;
  
  // Performance optimization flags
  private uiUpdatePending: boolean = false;
  private lastUIUpdateTime: number = 0;
  private readonly UI_UPDATE_THROTTLE_MS: number = 16; // ~60fps
  
  // DDA tracking
  public dda!: CombatDDA;
  private preCombatDifficultyAdjustment!: DifficultyAdjustment; // Snapshot before combat results processed
  
  // UI properties
  private playerShadow!: Phaser.GameObjects.Graphics;
  private enemyShadow!: Phaser.GameObjects.Graphics;
  private handEvaluationText!: Phaser.GameObjects.Text;
  private relicInventory!: Phaser.GameObjects.Container;
  private currentRelicTooltip!: Phaser.GameObjects.Container | null;
  private pokerHandInfoButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Combat" });
  }

  // Public getter methods for CombatUI
  public getCombatState(): CombatState {
    return this.combatState;
  }

  public getSelectedCards(): PlayingCard[] {
    return this.selectedCards;
  }

  public getDiscardsUsedThisTurn(): number {
    return this.discardsUsedThisTurn;
  }

  public getMaxDiscardsPerTurn(): number {
    return this.maxDiscardsPerTurn;
  }

  public getCombatEnded(): boolean {
    return this.combatEnded;
  }

  /**
   * Throttled UI update method to prevent excessive updates
   */
  private scheduleUIUpdate(): void {
    if (this.uiUpdatePending) return;
    
    const now = this.time.now;
    const timeSinceLastUpdate = now - this.lastUIUpdateTime;
    
    if (timeSinceLastUpdate >= this.UI_UPDATE_THROTTLE_MS) {
      // Update immediately if enough time has passed
      this.performUIUpdate();
    } else {
      // Schedule update for next frame
      this.uiUpdatePending = true;
      this.time.delayedCall(this.UI_UPDATE_THROTTLE_MS - timeSinceLastUpdate, () => {
        this.performUIUpdate();
      });
    }
  }

  /**
   * Perform batched UI updates
   */
  private performUIUpdate(): void {
    if (this.combatEnded || !this.ui) return;
    
    this.uiUpdatePending = false;
    this.lastUIUpdateTime = this.time.now;
    
    // Batch all UI updates together
    this.ui.updatePlayerUI();
    this.ui.updateEnemyUI();
    this.updateTurnUI();
    this.ui.updateSelectionCounter();
  }

  public getIsDrawingCards(): boolean {
    return this.isDrawingCards;
  }

  public getIsActionProcessing(): boolean {
    return this.isActionProcessing;
  }

  // Getter/setter methods for CombatAnimations
  public getCardSprites(): Phaser.GameObjects.Container[] {
    return this.ui.cardSprites;
  }

  public setCardSprites(sprites: Phaser.GameObjects.Container[]): void {
    this.ui.cardSprites = sprites;
  }

  public getPlayerSprite(): Phaser.GameObjects.Sprite {
    return this.playerSprite;
  }

  public getEnemySprite(): Phaser.GameObjects.Sprite {
    return this.enemySprite;
  }

  public getDeckSprite(): Phaser.GameObjects.Sprite {
    return this.deckSprite;
  }

  public getHandContainer(): Phaser.GameObjects.Container {
    return this.handContainer;
  }

  public getTurnCount(): number {
    return this.turnCount;
  }

  public getBestHandAchieved(): HandType {
    return this.bestHandAchieved;
  }

  create(data: { nodeType: string, enemyId?: string, transitionOverlay?: any }): void {
    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }
    
    // Add forest background
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "forest_bg");
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Add 50% opacity overlay with #150E10 to dim the background (Prologue style)
    const overlay = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.50);

    // Initialize CombatDDA first (needed by initializeCombat)
    this.dda = new CombatDDA(this);

    // Initialize combat state
    this.initializeCombat(data.nodeType, data.enemyId);
    
    // Initialize MusicManager and play scene music automatically
    MusicManager.getInstance().setScene(this);
    MusicManager.getInstance().playSceneMusic();

    // Initialize managers
    this.enemyDialogueManager = new EnemyDialogueManager(this);
    this.enemyLoreUI = new EnemyLoreUI(this);

    // Initialize CombatUI
    this.ui = new CombatUI(this);
    this.ui.initialize();

    // Initialize CombatDialogue
    this.dialogue = new CombatDialogue(this);

    // Initialize CombatAnimations
    this.animations = new CombatAnimations(this);

    // UI is now fully initialized by CombatUI
    // No need to call createCombatUI() separately
    
    // IMPORTANT: Call handleResize() immediately after UI initialization
    // to ensure containers are properly positioned BEFORE drawing cards
    this.scale.on('resize', this.handleResize, this);
    this.handleResize();
    
    // Relic inventory is now created by CombatUI.initialize()
    // (no longer needed here - removed to prevent duplicate UI)
    
    // Create deck sprite
    this.createDeckSprite();
    
    // Discard pile is created in CombatUI.ts with proper stacking effect
    // this.createDiscardSprite();

    // Create deck and discard views
    this.createDeckView();
    this.createDiscardView();
    
    // Create DDA debug overlay
    this.dda.createDDADebugOverlay();

    // Draw initial hand
    this.drawInitialHand();
    
    // Force update relic inventory to ensure relics are visible
    // (scheduleRelicInventoryUpdate in createRelicInventory might be too early)
    this.time.delayedCall(100, () => {
      this.ui.forceRelicInventoryUpdate();
    });

    // Handle transition overlay for fade-in effect
    if (data.transitionOverlay) {
      // Create a fade-in effect by fading out the overlay passed from Overworld
      this.tweens.add({
        targets: data.transitionOverlay,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => {
          data.transitionOverlay.destroy();
          // Start player turn after fade-in completes
          this.startPlayerTurn();
          // Show start of battle dialogue after fade-in
          this.time.delayedCall(100, () => {
            this.dialogue.showBattleStartDialogue();
          });
        }
      });
    } else {
      // No transition overlay, start player turn immediately
      this.startPlayerTurn();
      // Show start of battle dialogue
      this.time.delayedCall(100, () => {
        this.dialogue.showBattleStartDialogue();
      });
    }
  }

  /**
   * Initialize combat state with player and enemy
   */
  private initializeCombat(nodeType: string, enemyId?: string): void {
    // Get existing player data from GameState or create new player if none exists
    const gameState = GameState.getInstance();
    const existingPlayerData = gameState.getPlayerData();
    
    // Get and apply next combat buffs from events
    const overworldState = OverworldGameState.getInstance();
    const nextCombatBuffs = overworldState.consumeNextCombatBuffs();
    
    let player: Player;
    
    if (existingPlayerData && Object.keys(existingPlayerData).length > 0) {
      // Use existing player data and ensure all required fields are present
      
      // Ensure relics have all properties (especially emoji) by looking them up from registry
      const relicsWithEmoji = (existingPlayerData.relics || []).map(relic => {
        // If relic already has emoji, use it
        if (relic.emoji) return relic;
        
        // Otherwise, look it up from the registry to get the full relic data
        try {
          const fullRelic = getRelicById(relic.id);
          return fullRelic;
        } catch (e) {
          // If relic not found in registry, return as-is with fallback emoji
          console.warn(`Relic ${relic.id} not found in registry, using fallback`);
          return { ...relic, emoji: relic.emoji || "⚙️" };
        }
      });
      
      player = {
        id: existingPlayerData.id || "player",
        name: existingPlayerData.name || "Hero",
        maxHealth: existingPlayerData.maxHealth || 120,      // Increased for rebalanced damage
        currentHealth: existingPlayerData.currentHealth || 120,
        block: nextCombatBuffs.block, // Apply event-granted block
        statusEffects: [], // Always reset status effects at start of combat
        hand: [], // Will be populated below
        deck: existingPlayerData.deck || DeckManager.createFullDeck(),
        discardPile: existingPlayerData.discardPile || [],
        drawPile: existingPlayerData.drawPile || [],
        playedHand: [],
        landasScore: existingPlayerData.landasScore || 0,
        ginto: existingPlayerData.ginto || 100,
        diamante: existingPlayerData.diamante || 0,
        relics: relicsWithEmoji,
        potions: existingPlayerData.potions || [],
        discardCharges: existingPlayerData.discardCharges || 3,  // Changed from 1 to 3
        maxDiscardCharges: existingPlayerData.maxDiscardCharges || 3,  // Changed from 1 to 3
      };
      
      // Apply event-granted health bonus (healing)
      if (nextCombatBuffs.health > 0) {
        player.currentHealth = Math.min(player.maxHealth, player.currentHealth + nextCombatBuffs.health);
      }
      
      // Always start each combat with a fresh shuffled deck from player.deck
      // This ensures randomization every combat and respects purify/attune changes
      player.drawPile = DeckManager.shuffleDeck([...player.deck]);
      player.discardPile = [];
      player.hand = [];
    } else {
      // Create new player for first combat
      const deck = DeckManager.createFullDeck();
      player = {
        id: "player",
        name: "Hero",
        maxHealth: 120,      // Increased for rebalanced damage
        currentHealth: 120,
        block: nextCombatBuffs.block, // Apply event-granted block
        statusEffects: [],
        hand: [],
        deck: deck,
        discardPile: [],
        drawPile: DeckManager.shuffleDeck([...deck]),
        playedHand: [],
        landasScore: 0,
        ginto: 100,
        diamante: 0,
        relics: [
          commonRelics[0], // Earthwarden's Plate
          commonRelics[1], // Agimat of the Swift Wind
          eliteRelics[0],  // Babaylan's Talisman
          bossRelics[0],   // Echo of the Ancestors
        ],
        potions: [
          // Add some test potions to showcase the new inventory UI
          commonPotions[0], // Potion of Clarity
          commonPotions[1], // Elixir of Fortitude
          commonPotions[2], // Draught of Swiftness
        ],
        discardCharges: 3,  // Changed from 1 to 3
        maxDiscardCharges: 3,  // Changed from 1 to 3
      };
      
      // Apply event-granted health bonus (healing) for new player too
      if (nextCombatBuffs.health > 0) {
        player.currentHealth = Math.min(player.maxHealth, player.currentHealth + nextCombatBuffs.health);
      }
    }

    // Draw initial hand (8 cards + relic bonuses)
    // RelicManager.calculateInitialHandSize handles Swift Wind Agimat's +1 card draw bonus
    const baseHandSize = 8;
    const modifiedHandSize = RelicManager.calculateInitialHandSize(baseHandSize, player);
    const { drawnCards, remainingDeck } = DeckManager.drawCards(player.drawPile, modifiedHandSize);
    player.hand = drawnCards;
    player.drawPile = remainingDeck;

    // Get enemy based on specific enemyId if provided, otherwise use node type
    const enemyData = enemyId 
      ? this.getSpecificEnemyById(enemyId) 
      : this.getEnemyForNodeType(nodeType);
    const enemy: Enemy = {
      ...enemyData,
      id: this.generateEnemyId(enemyData.name),
    };

    this.combatState = {
      phase: "player_turn",
      turn: 1,
      player,
      enemy,
      selectedCards: [],
      lastAction: null,
    };
    
    // Reset combat tracking variables
    this.combatEnded = false;
    this.turnCount = 0;
    this.bestHandAchieved = "high_card";
    this.isActionProcessing = false;
    
    // Initialize DDA tracking and apply adjustments
    this.dda.initializeDDA();
    
    // Capture pre-combat difficulty for fair reward scaling (before combat results update DDA)
    this.preCombatDifficultyAdjustment = RuleBasedDDA.getInstance().getCurrentDifficultyAdjustment();
    
    // Apply start-of-combat relic effects
    RelicManager.applyStartOfCombatEffects(this.combatState.player);
    
    // Try to summon minion with Kapre's Cigar
    RelicManager.tryKapresCigarSummon(this, this.combatState.player);
  }

  /**
   * Get enemy based on node type
   */
  private getEnemyForNodeType(nodeType: string): Omit<Enemy, "id"> {
    switch (nodeType) {
      case "elite":
        return getRandomEliteEnemy();
      case "boss":
        return getBossEnemy();
      case "common":
      case "combat":
      default:
        return getRandomCommonEnemy();
    }
  }

  /**
   * Get specific enemy by ID (e.g., from overworld direct selection)
   */
  private getSpecificEnemyById(enemyId: string): Omit<Enemy, "id"> {
    const enemy = getEnemyByName(enemyId);
    if (!enemy) {
      console.warn(`Enemy with id "${enemyId}" not found, falling back to random common enemy`);
      return getRandomCommonEnemy();
    }
    return enemy;
  }

  /**
   * Generate unique enemy ID
   */
  private generateEnemyId(enemyName: string): string {
    return enemyName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  }



  /**
   * Create played hand UI container
   */
  private createPlayedHandUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    // Position played hand container much higher to avoid overlap with hand
    this.playedHandContainer = this.add.container(screenWidth/2, screenHeight - 450);
    
    // Initialize hand evaluation text
    this.handEvaluationText = this.add
      .text(0, -80, "", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#ffd93d",
        align: "center",
      })
      .setOrigin(0.5)
      .setVisible(false);
  }



  /**
   * Create turn UI
   */
  private createTurnUI(): void {
    const screenWidth = this.cameras.main.width;
    this.turnText = this.add.text(screenWidth - 200, 50, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
    });

    this.actionsText = this.add.text(screenWidth - 200, 80, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ffd93d",
    });

    // Info button for poker hand reference is created by CombatUI.initialize()

    this.updateTurnUI();
  }


  /**
   * Add a sample card to the visual representation container
   */
  private addSampleCard(
    container: Phaser.GameObjects.Container,
    rank: string,
    suit: string,
    x: number,
    y: number,
    scale: number = 1
  ): void {
    // Convert card rank to sprite rank (1-13)
    const rankMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
      "Mandirigma": "11", "Babaylan": "12", "Datu": "13", "King": "13" // Added King as placeholder for 5 of a kind
    };
    const spriteRank = rankMap[rank] || "1";
    
    // Convert suit to lowercase for sprite naming following the actual file naming convention
    const suitMap: Record<string, string> = {
      "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
    };
    const spriteSuit = suitMap[suit] || "apoy";
    
    // The actual file names follow the pattern <rank><suit>.png (e.g., 1apoy.png)
    const textureKey = `${spriteRank}${spriteSuit}`;
    
    let cardSprite;
    
    // Check if texture exists, fallback to generated card if not
    if (this.textures.exists(textureKey)) {
      cardSprite = this.add.image(x, y, textureKey);
      cardSprite.setDisplaySize(80 * scale, 112 * scale);
      cardSprite.setDepth(6060); // Ensure card is visible
      container.add(cardSprite);
    } else {
      // Always create a generated card with border and visual indicators
      cardSprite = this.add.rectangle(x, y, 80 * scale, 112 * scale, 0xffffff);
      cardSprite.setStrokeStyle(3 * scale, 0x444444); // Add border for visibility
      cardSprite.setDepth(6060); // Ensure card is visible
      
      // Add rank text at top-left
      const rankText = this.add.text(x - 30 * scale, y - 40 * scale, rank, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scale),
        color: "#000000",
      }).setOrigin(0, 0).setDepth(6061);
      container.add(rankText);
      
      // Add suit symbol next to rank
      const suitSymbolMap: Record<string, string> = {
        "Apoy": "🔥", "Tubig": "💧", "Lupa": "🌿", "Hangin": "💨"
      };
      const suitSymbol = suitSymbolMap[suit] || "🔥";
      
      const suitText = this.add.text(x + 25 * scale, y - 40 * scale, suitSymbol, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scale),
        color: "#000000",
      }).setOrigin(1, 0).setDepth(6061);
      container.add(suitText);
      
      // Add rank text at bottom-right (rotated 180)
      const bottomRankText = this.add.text(x + 25 * scale, y + 40 * scale, rank, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scale),
        color: "#000000",
      }).setOrigin(1, 1).setRotation(Math.PI).setDepth(6061); // Rotate 180 degrees
      container.add(bottomRankText);
      
      // Add suit symbol at bottom-right (rotated 180)
      const bottomSuitText = this.add.text(x - 30 * scale, y + 40 * scale, suitSymbol, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scale),
        color: "#000000",
      }).setOrigin(0, 1).setRotation(Math.PI).setDepth(6061); // Rotate 180 degrees
      container.add(bottomSuitText);
      
      container.add(cardSprite);
    }
  }

  /**
   * Create relics UI container
   */
  private createRelicsUI(): void {
    const screenWidth = this.cameras.main.width;
    this.relicsContainer = this.add.container(screenWidth - 100, 50);
    // Hide the relics container as requested
    this.relicsContainer.setVisible(false);
    this.updateRelicsUI();
  }

  /**
   * Update relics UI display
   */
  private updateRelicsUI(): void {
    this.relicsContainer.removeAll(true);

    const relics = this.combatState.player.relics;
    const screenWidth = this.cameras.main.width;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const baseSpacing = 30;
    const spacing = baseSpacing * scaleFactor;
    let x = 0;

    relics.forEach((relic) => {
      const relicText = this.add
        .text(x, 0, relic.emoji, {
          fontSize: Math.floor(24 * scaleFactor),
        })
        .setInteractive();

      // Create Prologue-style tooltip container
      const tooltipContainer = this.add.container(x, spacing);
      const tooltipText = `${relic.name}\n${relic.description}`;
      const tooltipWidth = Math.min(tooltipText.length * 6 + 20, 200);
      const tooltipHeight = 60;
      
      // Prologue-style double border design
      const outerBorder = this.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const innerBorder = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const bg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
      
      const tooltip = this.add.text(0, 0, tooltipText, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center",
        wordWrap: { width: tooltipWidth - 10 }
      }).setOrigin(0.5);
      
      tooltipContainer.add([outerBorder, innerBorder, bg, tooltip]);
      tooltipContainer.setVisible(false).setAlpha(0);

      relicText.on("pointerover", () => {
        // Prologue-style fade in
        tooltipContainer.setVisible(true);
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });

      relicText.on("pointerout", () => {
        // Prologue-style fade out
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2.easeOut',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
      });

      this.relicsContainer.add([relicText, tooltipContainer]);
      x += spacing;
    });
  }

  // Old relic inventory methods removed - now handled by CombatUI.ts

  /**
   * Create a button with text and callback using Balatro/Prologue styling
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const screenWidth = this.cameras.main.width;
    const baseButtonWidth = 140; // Slightly wider for Balatro style
    const baseButtonHeight = 45; // Taller for better visibility
    
    // Scale button size based on screen width
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(18 * scaleFactor), // Slightly larger font
      color: "#77888C",
      align: "center"
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding (Balatro style - more padding)
    const padding = 30; // More padding for Balatro style
    const buttonWidth = Math.max(baseButtonWidth, textWidth + padding);
    const buttonHeight = Math.max(baseButtonHeight, textHeight + 16);

    const button = this.add.container(x, y);

    // Prologue-style double border design (maintained for consistency)
    const outerBorder = this.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0)
      .setStrokeStyle(3, 0x77888C); // Slightly thicker border
    const innerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scaleFactor), // Larger font for better readability
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5);

    button.add([outerBorder, innerBorder, bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Balatro-style interactions with Prologue colors
    button.on("pointerdown", () => {
      // Check if action processing is active
      if (this.isActionProcessing) {
        console.log("Action processing, ignoring button click");
        return;
      }
      // Visual feedback - more pronounced for Balatro style
      this.tweens.add({
        targets: button,
        scale: 0.92,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 80,
            ease: 'Power2'
          });
        }
      });
      callback();
    });
    
    // Balatro-style hover effects with Prologue colors
    button.on("pointerover", () => {
      bg.setFillStyle(0x1f1410); // Prologue hover color
      buttonText.setColor("#e8eced"); // Brighter text on hover
      this.tweens.add({
        targets: button,
        scale: 1.08, // More pronounced hover effect
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on("pointerout", () => {
      bg.setFillStyle(0x150E10); // Prologue normal color
      buttonText.setColor("#77888C"); // Normal text color
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    return button;
  }

  /**
   * Draw initial hand of cards with animation
   */
  private drawInitialHand(): void {
    // Clear any existing hand display
    this.ui.cardSprites.forEach((sprite) => sprite.destroy());
    this.ui.cardSprites = [];
    
    // Animate drawing cards from deck one by one
    this.animations.animateDrawCardsFromDeck(this.combatState.player.hand.length);
  }



  /**
   * Update the visual appearance of a card without recreating it
   */
  private updateCardVisuals(card: PlayingCard): void {
    const cardIndex = this.combatState.player.hand.findIndex(c => c.id === card.id);
    const cardSprites = this.ui.cardSprites;
    if (cardIndex !== -1 && cardSprites[cardIndex]) {
      const cardSprite = cardSprites[cardIndex];
      
      // Update border visibility only
      const border = cardSprite.getByName('cardBorder') as Phaser.GameObjects.Rectangle;
      if (border) {
        border.setVisible(card.selected);
      }
    }
  }

  /**
   * Select/deselect a card with popup animation (Balatro style - keeps position stable)
   */
  public selectCard(card: PlayingCard): void {
    // If trying to select a new card when already 5 are selected, ignore
    if (!card.selected && this.selectedCards.length >= 5) {
      this.showActionResult("Cannot select more than 5 cards!");
      return;
    }

    // Toggle selection state
    card.selected = !card.selected;
    
    // Manage selectedCards array
    const selIndex = this.selectedCards.findIndex(c => c.id === card.id);
    if (card.selected && selIndex === -1 && this.selectedCards.length < 5) {
      this.selectedCards.push(card);
    } else if (!card.selected && selIndex > -1) {
      this.selectedCards.splice(selIndex, 1);
    }

    // Find the card sprite and its index
    const cardIndex = this.combatState.player.hand.findIndex(c => c.id === card.id);
    const cardSprites = this.ui.cardSprites;
    if (cardIndex === -1 || !cardSprites[cardIndex]) {
      console.warn("Card sprite not found for selection animation");
      return;
    }
    
    const cardSprite = cardSprites[cardIndex];
    
    // CRITICAL: Kill any existing tweens on this sprite to prevent conflicts
    this.tweens.killTweensOf(cardSprite);
    
    // Get the base Y position that was stored when the card was created
    const storedBaseY = (card as any).baseY;
    
    if (storedBaseY === undefined) {
      console.warn("Card baseY not found, cannot animate properly");
      return;
    }
    
    // Balatro-style selection animation
    if (card.selected) {
      // SELECT: Move card UP
      this.tweens.add({
        targets: cardSprite,
        y: storedBaseY - 40,
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // Yellow tint for selected cards
      const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
      if (cardImage && 'setTint' in cardImage) {
        cardImage.setTint(0xffdd44);
      }
      
      // Bring to front
      cardSprite.setDepth(500 + cardIndex);
      
    } else {
      // DESELECT: Return to EXACT base position
      this.tweens.add({
        targets: cardSprite,
        y: storedBaseY, // Use the stored base Y position
        duration: 200,
        ease: 'Back.easeOut'
      });
      
      // Remove tint
      const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
      if (cardImage && 'clearTint' in cardImage) {
        cardImage.clearTint();
      }
      
      // Return to normal depth
      cardSprite.setDepth(100 + cardIndex);
    }

    // Update UI
    this.updateSelectionCounter();
    this.updateCardVisuals(card);
    this.ui.updateHandIndicator();
    this.updateDamagePreview(this.combatState.phase === "action_selection");
  }

  /**
   * Unplay a card from the played hand back to the regular hand
   */
  private unplayCard(card: PlayingCard): void {
    // Check if the card is actually in the played hand
    const playedIndex = this.combatState.player.playedHand.findIndex(c => c.id === card.id);
    if (playedIndex === -1) {
      console.warn("Trying to unplay a card that's not in the played hand");
      return;
    }

    // Remove card from played hand
    this.combatState.player.playedHand.splice(playedIndex, 1);
    
    // Add card back to regular hand
    this.combatState.player.hand.push(card);
    
    // Reset card selection state
    card.selected = false;
    
    // Remove from selected cards if it was there
    this.selectedCards = this.selectedCards.filter(c => c.id !== card.id);
    this.combatState.selectedCards = this.combatState.selectedCards.filter(c => c.id !== card.id);
    
    // If no cards left in played hand, return to card selection phase
    if (this.combatState.player.playedHand.length === 0) {
      this.combatState.phase = "player_turn";
      this.ui.updateActionButtons();
    }
    
    // Batch UI updates for better performance
    this.ui.updateHandDisplay();
    this.ui.updatePlayedHandDisplay();
    this.scheduleUIUpdate(); // Use batched update instead of individual calls
    
    // Update damage preview based on current phase
    this.updateDamagePreview(this.combatState.phase === "action_selection");
    
    // Show feedback
    this.showActionResult(`Unplayed ${card.rank} of ${card.suit}`);
  }

  /**
   * Play selected cards (Balatro style - one hand per turn)
   */
  public playSelectedCards(): void {
    if (this.selectedCards.length === 0) return;
    if (this.selectedCards.length > 5) {
      this.showActionResult("Cannot play more than 5 cards in a hand!");
      return;
    }

    // Move selected cards to played hand
    this.combatState.player.playedHand = [...this.selectedCards];

    // Remove played cards from hand
    this.combatState.player.hand = this.combatState.player.hand.filter(
      (card) => !this.selectedCards.includes(card)
    );

    // Clear selection
    this.selectedCards = [];
    this.combatState.selectedCards = [];

    // Enter action selection phase
    this.combatState.phase = "action_selection";

    // Update displays with batched updates
    this.ui.updateHandDisplay();
    this.ui.updatePlayedHandDisplay();
    this.ui.updateActionButtons();
    
    // Update damage preview for the new hand
    this.updateDamagePreview(true);
    
    // Schedule UI update instead of immediate individual updates
    this.scheduleUIUpdate();
  }

  /**
   * Sort hand by rank or suit
   */
  public sortHand(sortBy: "rank" | "suit"): void {
    // Create shuffling animation before sorting
    this.animations.animateCardShuffle(sortBy, () => {
      // Animation handles the sorting internally
    });
  }

  /**
   * Discard selected cards
   */
  public discardSelectedCards(): void {
    if (this.selectedCards.length === 0) return;

    // Check if we can still discard (max 3 discards per turn)
    if (this.discardsUsedThisTurn >= this.maxDiscardsPerTurn) {
      this.showActionResult(
        `Cannot discard more than ${this.maxDiscardsPerTurn} times per turn!`
      );
      return;
    }

    // Check if trying to discard too many cards at once
    if (this.selectedCards.length > 5) {
      this.showActionResult("Cannot discard more than 5 cards at once!");
      return;
    }

    const discardCount = this.selectedCards.length;

    // Move selected cards to discard pile
    this.combatState.player.discardPile.push(...this.selectedCards);

    // Remove from hand
    this.combatState.player.hand = this.combatState.player.hand.filter(
      (card) => !this.selectedCards.includes(card)
    );

    // Draw the same number of cards as discarded
    this.drawCards(discardCount);

    // Increment discard counter
    this.discardsUsedThisTurn++;
    this.dda.trackDiscard(); // Track total for DDA

    // Clear selection
    this.selectedCards = [];

    // Batch UI updates instead of individual calls
    this.ui.updateHandDisplay();
    this.updateDiscardDisplay(); // Update discard pile display
    this.scheduleUIUpdate(); // Batched update for turn UI, selection counter, etc.
  }

  /**
   * End player turn
   */
  private endPlayerTurn(): void {
    // Apply end-of-turn relic effects
    RelicManager.applyEndOfTurnEffects(this.combatState.player);
    
    this.combatState.phase = "enemy_turn";
    this.selectedCards = [];

    // Hide damage preview during enemy turn
    this.updateDamagePreview(false);
    
    // Enemy's turn
    this.executeEnemyTurn();
  }

  /**
   * Execute enemy turn
   */
  private executeEnemyTurn(): void {
    // Check if enemy is already defeated - if so, don't execute turn
    if (this.combatState.enemy.currentHealth <= 0 || this.combatEnded) {
      console.log("Enemy is defeated or combat ended, skipping enemy turn");
      return;
    }

    this.applyStatusEffects(this.combatState.enemy);

    const enemy = this.combatState.enemy;

    // Double-check enemy health after status effects
    if (enemy.currentHealth <= 0 || this.combatEnded) {
      console.log("Enemy defeated after status effects, skipping attack");
      return;
    }

    // Check if enemy is stunned - if so, skip their turn
    const isStunned = enemy.statusEffects.some((e) => e.name === "Stunned");
    if (isStunned) {
      console.log("Enemy is stunned, skipping their turn");
      this.showActionResult("Enemy is Stunned - Turn Skipped!");
      
      // Update enemy intent for next turn
      this.updateEnemyIntent();
      
      // Start new player turn
      this.time.delayedCall(1500, () => {
        this.startPlayerTurn();
      });
      return;
    }

    // Apply enemy action based on intent
    if (enemy.intent.type === "attack") {
      let damage = enemy.intent.value;
      if (enemy.statusEffects.some((e) => e.name === "Weak")) {
        damage *= 0.5;
      }
      this.animations.animateEnemyAttack(); // Add animation when enemy attacks
      this.damagePlayer(damage);
    }

    // Update enemy intent for next turn
    this.updateEnemyIntent();

    // Start new player turn
    this.time.delayedCall(1500, () => {
      this.startPlayerTurn();
    });
  }

  /**
   * Start player turn (Balatro style)
   */
  private startPlayerTurn(): void {
    // Don't start player turn if combat has ended
    if (this.combatEnded) {
      console.log("Combat has ended, not starting player turn");
      return;
    }

    this.applyStatusEffects(this.combatState.player);

    this.combatState.phase = "player_turn";
    
    // Only increment turn after the first turn (turn starts at 1)
    if (this.turnCount > 0) {
      this.combatState.turn++;
    }
    this.turnCount++; // Track total turns for DDA
    
    // Update DDA debug overlay with current turn count
    this.dda.updateDDADebugOverlay();

    // Reset discard counter (only 3 discards per turn)
    this.discardsUsedThisTurn = 0;

    // Clear any selected cards from previous turn and reset their selected state
    this.selectedCards.forEach(card => {
      card.selected = false;
    });
    this.selectedCards = [];
    
    // Also ensure all cards in hand have selected flag cleared
    this.combatState.player.hand.forEach(card => {
      card.selected = false;
    });

    // Clear played hand from previous turn and move cards to discard pile
    if (this.combatState.player.playedHand.length > 0) {
      this.combatState.player.discardPile.push(...this.combatState.player.playedHand);
      this.combatState.player.playedHand = [];
      this.updateDiscardDisplay(); // Update discard pile display
    }

    // Draw cards to ensure player has 8 cards at start of turn
    let targetHandSize = 8;
    
    // Apply "Wind Veil" effect: Additional cards drawn based on Hangin cards played in last action
    // (this would apply if in a continuous combat system where Hangin cards from last turn matter)
    
    const cardsNeeded = targetHandSize - this.combatState.player.hand.length;
    if (cardsNeeded > 0) {
      this.drawCards(cardsNeeded);
    }

    // Batch all UI updates together for better performance
    this.ui.updateHandDisplay();
    this.ui.updatePlayedHandDisplay(); // Clear the played hand display
    this.ui.updateActionButtons(); // Reset to card selection buttons
    this.scheduleUIUpdate(); // Batched update for turn UI and other elements
    
    // Apply start-of-turn relic effects (handles ALL relics with START_OF_TURN effects)
    RelicManager.applyStartOfTurnEffects(this.combatState.player);
    
    // Ensure action processing is reset
    this.isActionProcessing = false;
    this.setActionButtonsEnabled(true);
    
    // Update damage preview visibility based on phase
    this.updateDamagePreview(this.combatState.phase === "action_selection");
  }

  /**
   * Draw cards from deck with animation
   */
  private drawCards(count: number): void {
    const { drawnCards, remainingDeck } = DeckManager.drawCards(
      this.combatState.player.drawPile,
      count
    );

    const previousHandSize = this.combatState.player.hand.length;
    this.combatState.player.hand.push(...drawnCards);
    this.combatState.player.drawPile = remainingDeck;

    // If deck is empty, shuffle discard pile back into deck
    if (
      this.combatState.player.drawPile.length === 0 &&
      this.combatState.player.discardPile.length > 0
    ) {
      // Show shuffle animation
      this.animations.animateShuffleDeck(() => {
        this.combatState.player.drawPile = DeckManager.shuffleDeck(
          this.combatState.player.discardPile
        );
        this.combatState.player.discardPile = [];
      });
    }
    
    // Animate only the newly drawn cards
    this.animations.animateNewCards(drawnCards, previousHandSize);
    this.updateDeckDisplay();
    this.updateDiscardDisplay(); // Also update discard in case of shuffle
  }

  /**
   * Apply damage to enemy
   */
  private damageEnemy(damage: number): void {
    console.log(`Applying ${damage} damage to enemy`);
    let finalDamage = damage;
    let vulnerableBonus = 0;
    let bakunawaBonus = 0;
    
    // Normal damage calculations
    if (this.combatState.enemy.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
      vulnerableBonus = finalDamage - damage;
      console.log(`Vulnerable effect applied, damage increased to ${finalDamage}`);
    }
    
    // Apply "Bakunawa Fang" effect: +5 additional damage when using any relic
    const bakunawaFang = this.combatState.player.relics.find(r => r.id === "bakunawa_fang");
    if (bakunawaFang) {
      finalDamage += 5;
      bakunawaBonus = 5;
    }
    
    const actualDamage = Math.max(0, finalDamage - this.combatState.enemy.block);
    console.log(`Enemy has ${this.combatState.enemy.block} block, taking ${actualDamage} actual damage`);
    
    this.combatState.enemy.currentHealth -= actualDamage;
    this.combatState.enemy.block = Math.max(
      0,
      this.combatState.enemy.block - finalDamage
    );
    
    console.log(`Enemy health: ${this.combatState.enemy.currentHealth}/${this.combatState.enemy.maxHealth}`);

    // Add visual feedback for enemy taking damage
    this.animations.animateSpriteDamage(this.enemySprite);
    this.ui.updateEnemyUI();

    // Show detailed damage calculation if there are special bonuses
    if (vulnerableBonus > 0 || bakunawaBonus > 0) {
      let message = `Damage: ${damage}`;
      if (vulnerableBonus > 0) message += ` + ${vulnerableBonus} (Vulnerable)`;
      if (bakunawaBonus > 0) message += ` + ${bakunawaBonus} (Bakunawa Fang)`;
      message += ` = ${finalDamage}`;
      
      this.showEnhancedActionResult(message, "#ff6b6b");
    }



    // Check if enemy is defeated
    if (this.combatState.enemy.currentHealth <= 0) {
      this.combatState.enemy.currentHealth = 0;
      console.log("Enemy defeated!");
      
      // Batch UI update instead of immediate call
      this.scheduleUIUpdate();
      
      // Play death animation
      this.animations.animateEnemyDeath();
      
      // Use shorter delay for better responsiveness
      this.time.delayedCall(300, () => {
        this.endCombat(true);
      });
    }
  }

  /**
   * Apply damage to player
   */
  private damagePlayer(damage: number): void {
    console.log(`Applying ${damage} damage to player`);
    
    // Check for dodge chance from "Tikbalang's Hoof"
    const dodgeChance = RelicManager.calculateDodgeChance(this.combatState.player);
    if (Math.random() < dodgeChance) {
      console.log("Player dodged the attack!");
      this.showActionResult("Tikbalang's Dodge!");
      return; // Player dodged, take no damage
    }
    
    let finalDamage = damage;
    if (this.combatState.player.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
      console.log(`Vulnerable effect applied, damage increased to ${finalDamage}`);
    }
    
    // Apply damage reduction from relics (Bakunawa Scale, etc.)
    const originalDamage = finalDamage;
    finalDamage = RelicManager.calculateDamageReduction(finalDamage, this.combatState.player);
    if (finalDamage < originalDamage) {
      console.log(`Damage reduced from ${originalDamage} to ${finalDamage} by relic effects`);
      this.showActionResult(`Scale Protection!`);
    }
    
    const actualDamage = Math.max(0, finalDamage - this.combatState.player.block);
    console.log(`Player has ${this.combatState.player.block} block, taking ${actualDamage} actual damage`);
    
    // Apply damage and clamp health to valid range
    this.combatState.player.currentHealth = Math.max(0, Math.floor(this.combatState.player.currentHealth - actualDamage));
    this.combatState.player.block = Math.max(
      0,
      this.combatState.player.block - finalDamage
    );
    
    console.log(`Player health: ${this.combatState.player.currentHealth}/${this.combatState.player.maxHealth}`);

    // Add visual feedback for player taking damage
    this.animations.animateSpriteDamage(this.playerSprite);
    
    // Batch UI update instead of immediate call
    this.scheduleUIUpdate();

    // Check if player is defeated
    if (this.combatState.player.currentHealth <= 0) {
      this.combatState.player.currentHealth = 0;
      console.log("Player defeated!");
      // Use shorter delay and batch UI update
      this.time.delayedCall(300, () => {
        this.endCombat(false);
      });
    }
  }

  /**
   * Update enemy intent
   */
  private updateEnemyIntent(): void {
    const enemy = this.combatState.enemy;
    enemy.currentPatternIndex =
      (enemy.currentPatternIndex + 1) % enemy.attackPattern.length;

    const nextAction = enemy.attackPattern[enemy.currentPatternIndex];

    if (nextAction === "attack") {
      enemy.intent = {
        type: "attack",
        value: enemy.damage,
        description: `Attacks for ${enemy.damage} damage`,
        icon: "†",
      };
    } else if (nextAction === "defend") {
      enemy.intent = {
        type: "defend",
        value: 5,
        description: "Gains 5 block",
        icon: "⛨",
      };
      enemy.block += 5;
    }

    this.ui.updateEnemyUI();
  }



  /**
   * Update turn UI elements - optimized version with caching
   */
  private updateTurnUI(): void {
    // Don't update UI if combat has ended
    if (this.combatEnded) {
      return;
    }
    
    try {
      // Cache text values to avoid unnecessary setText calls
      const turnText = `Turn: ${this.combatState.turn}`;
      const specialStatus = this.specialUsedThisCombat ? "USED" : "READY";
      const actionsText = `Discards: ${this.discardsUsedThisTurn}/${this.maxDiscardsPerTurn} | Special: ${specialStatus}`;
      
      // Only update if text has actually changed
      if (this.turnText.text !== turnText) {
        this.turnText.setText(turnText);
      }
      
      if (this.actionsText.text !== actionsText) {
        this.actionsText.setText(actionsText);
        
        // Color code the special status within the text - only when text changes
        const newColor = this.specialUsedThisCombat ? "#cccccc" : "#ffd93d";
        if (this.actionsText.style.color !== newColor) {
          this.actionsText.setColor(newColor);
        }
      }
      
      // Only update hand indicator if needed (this can be expensive)
      if (this.ui && this.ui.updateHandIndicator) {
        this.ui.updateHandIndicator();
      }
    } catch (error) {
      console.error("Error updating turn UI:", error);
    }
  }


  /**
   * Update selection counter above the cards (Balatro style)
   */
  private updateSelectionCounter(): void {
    if (!this.selectionCounterText) return;
    
    const count = this.selectedCards.length;
    
    // Show hand type if we have selected cards
    if (count > 0) {
      const evaluation = HandEvaluator.evaluateHand(this.selectedCards, "attack");
      const handTypeText = this.getHandTypeDisplayText(evaluation.type);
      this.selectionCounterText.setText(`${count}/5 - ${handTypeText}`);
      this.selectionCounterText.setColor("#ffdd44"); // Yellow when cards selected
    } else {
      this.selectionCounterText.setText("Selected: 0/5");
      this.selectionCounterText.setColor("#77888C"); // Gray when no selection
    }
  }

  /**
   * Get display text for hand types
   */
  private getHandTypeDisplayText(handType: HandType): string {
    const handNames: Record<HandType, string> = {
      high_card: "High Card",
      pair: "Pair",
      two_pair: "Two Pair",
      three_of_a_kind: "Three of a Kind",
      straight: "Straight",
      flush: "Flush",
      full_house: "Full House",
      four_of_a_kind: "Four of a Kind",
      straight_flush: "Straight Flush",
      royal_flush: "Royal Flush",
      five_of_a_kind: "Five of a Kind",
    };
    return handNames[handType];
  }

  /**
   * End combat with result
   */
  private endCombat(victory: boolean): void {
    // Prevent multiple end combat calls
    if (this.combatEnded) {
      console.log("Combat already ended, preventing duplicate call");
      return;
    }
    
    
    
    this.combatEnded = true;
    this.combatState.phase = "post_combat";
    
    const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
    const screenHeight = this.cameras.main?.height || this.scale.height || 768;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    console.log(`Combat ended with victory: ${victory}`);
    
    // Submit combat metrics to DDA system
    this.dda.submitCombatResults(victory, this.turnCount, this.maxDiscardsPerTurn, this.bestHandAchieved);
    
    if (victory) {
      const gameState = GameState.getInstance();
      const currentNode = gameState.getCurrentNode();
      if (currentNode?.type === "elite") {
        this.combatState.player.relics.push({
          id: "elite_relic",
          name: "Elite Relic",
          description: "You defeated an elite enemy!",
          emoji: "🏆",
        });
        this.updateRelicsUI();
        this.ui.forceRelicInventoryUpdate(); // Force update after adding relic
      }
      
      // Victory - show post-combat dialogue with delay to prevent double calls
      this.time.delayedCall(100, () => {
        this.showPostCombatDialogue();
      });
    } else {
      // Player defeated - show game over
      const resultText = "Defeat!";
      const color = "#ff4757";

      this.add
        .text(screenWidth/2, screenHeight/2, resultText, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(48 * scaleFactor),
          color: color,
          align: "center",
        })
        .setOrigin(0.5);

      // Transition to Game Over scene after 2 seconds
      this.time.delayedCall(2000, () => {
        // Reset cursor before transitioning
        this.input.setDefaultCursor('default');
        
        // Stop the Overworld scene if it's running (paused from combat launch)
        if (this.scene.isActive('Overworld') || this.scene.isPaused('Overworld')) {
          this.scene.stop('Overworld');
        }
        
        // Pass defeat data to GameOver scene and stop this scene
        this.scene.start("GameOver", {
          defeatedBy: this.combatState.enemy.name,
          enemySpriteKey: this.combatState.enemy.spriteKey,
          finalHealth: this.combatState.player.currentHealth,
          turnsPlayed: this.turnCount || 0
        });
      });
    }
  }

  /**
   * Show post-combat dialogue with honor choices
   */
  private showPostCombatDialogue(): void {
    // Clear combat UI
    this.clearCombatUI();

    // Get screen dimensions safely
    const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
    const screenHeight = this.cameras.main?.height || this.scale.height || 768;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));

    // Convert enemy name to dialogue key
    const enemyKey = this.combatState.enemy.name
      .toLowerCase()
      .replace(/\s+/g, "_");
    const creatureDialogues = this.dialogue.getCreatureDialogues();
    const dialogue =
      creatureDialogues[enemyKey] || creatureDialogues.tikbalang_scout;

    // Background overlay (Prologue style - semi-transparent)
    const overlay = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth, screenHeight, 0x000000, 0.7);

    // Create dialogue container positioned at center (Prologue style)
    const dialogueContainer = this.add.container(screenWidth / 2, screenHeight / 2);
    
    // Calculate dialogue box size
    const dialogueBoxWidth = Math.min(600, screenWidth * 0.8);
    const dialogueBoxHeight = Math.min(350, screenHeight * 0.6);

    // Double border design with Prologue colors
    const outerBorder = this.add.rectangle(0, 0, dialogueBoxWidth + 8, dialogueBoxHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, dialogueBoxWidth, dialogueBoxHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, dialogueBoxWidth, dialogueBoxHeight, 0x150E10);

    // Enemy portrait using combat sprite
    const enemySpriteKey = this.dialogue.getEnemySpriteKey(this.combatState.enemy.name);
    let enemyPortrait: Phaser.GameObjects.Sprite | null = null;
    
    if (this.textures.exists(enemySpriteKey)) {
      enemyPortrait = this.add.sprite(0, -80, enemySpriteKey);
      enemyPortrait.setScale(2.0 * scaleFactor);
    }

    // Enemy name with Prologue styling
    const enemyNameText = this.add.text(0, -130, dialogue.name, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(24 * scaleFactor),
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);

    // Main dialogue text with Prologue styling
    const mainText = this.add.text(0, -20, "You have defeated this creature. What do you choose?", {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(18 * scaleFactor),
      color: "#77888C",
      align: "center",
      wordWrap: { width: dialogueBoxWidth * 0.8 },
    }).setOrigin(0.5);

    // Add elements to dialogue container
    const containerChildren = [
      outerBorder,
      innerBorder,
      bg,
      enemyPortrait,
      enemyNameText,
      mainText
    ].filter(child => child !== null);

    dialogueContainer.add(containerChildren);
    dialogueContainer.setDepth(5001);

    // Prologue-style fade in animation
    dialogueContainer.setAlpha(0);
    this.tweens.add({ 
      targets: dialogueContainer, 
      alpha: 1, 
      duration: 400, 
      ease: 'Power2' 
    });

    // Landas choice buttons (positioned outside the container for easier positioning)
    this.createDialogueButton(screenWidth/2 - 120, screenHeight/2 + 80, "Spare", "#2ed573", () =>
      this.makeLandasChoice("spare", dialogue)
    );

    this.createDialogueButton(screenWidth/2 + 120, screenHeight/2 + 80, "Slay", "#ff4757", () =>
      this.makeLandasChoice("kill", dialogue)
    );

    // Current landas display with Prologue styling
    const landasTier = this.getLandasTier(this.combatState.player.landasScore);
    const landasColor = this.getLandasColor(landasTier);

    this.add.text(
      screenWidth/2,
      screenHeight/2 + 150,
      `Current Landas: ${this.combatState.player.landasScore} (${landasTier.toUpperCase()})`,
      {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: landasColor,
        align: "center",
      }
    ).setOrigin(0.5).setDepth(5002);
  }

  /**
   * Create Prologue-style dialogue button
   */
  private createDialogueButton(
    x: number,
    y: number,
    text: string,
    color: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    // Create text first to measure size (Prologue style)
    const buttonText = this.add.text(0, 0, text, { 
      fontFamily: "dungeon-mode", 
      fontSize: 24, 
      color: "#77888C", 
      align: "center" 
    }).setOrigin(0.5);
    
    // Calculate dynamic size based on text with increased padding for better clickability
    const paddingX = 60;
    const paddingY = 30;
    const buttonWidth = Math.max(buttonText.width + paddingX, 200);
    const buttonHeight = Math.max(buttonText.height + paddingY, 50);
    
    // Double border design (Prologue style)
    const outerBorder = this.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
    
    // Make background the interactive element instead of container (Prologue style)
    bg.setInteractive({ useHandCursor: true });
    
    button.add([outerBorder, innerBorder, bg, buttonText]);
    
    // Set container size and depth - make sure buttons are above dialogue container
    button.setSize(buttonWidth, buttonHeight);
    button.setDepth(5010); // Higher than dialogue container (5001)
    
    let isHovering = false;
    
    // Prologue-style button interactions
    bg.on('pointerdown', () => {
      if (!button.active) return;
      
      // Visual feedback (Prologue style)
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 100,
        ease: 'Power1',
        onComplete: () => {
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 100,
            ease: 'Power1',
            onComplete: () => {
              if (button.active) {
                // Disable the button to prevent multiple clicks
                button.disableInteractive();
                
                // Remove all button events to prevent further interaction
                button.removeAllListeners();
                
                // Add a small delay before executing callback to ensure UI updates
                this.time.delayedCall(50, () => {
                  callback();
                });
              }
            }
          });
        }
      });
      this.cameras.main.shake(30, 0.01);
    });
    
    bg.on('pointerover', () => {
      if (!button.active) return;
      isHovering = true;
      this.input.setDefaultCursor('pointer');
      this.tweens.add({ targets: button, scale: 1.05, duration: 200, ease: 'Power2' });
      bg.setFillStyle(0x1f1410); // Prologue hover color
    });
    
    bg.on('pointerout', () => {
      if (!button.active) return;
      isHovering = false;
      this.input.setDefaultCursor('default');
      this.tweens.add({ targets: button, scale: 1, duration: 200, ease: 'Power2' });
      bg.setFillStyle(0x150E10); // Prologue normal color
    });
    
    // Store original disable method
    const originalDisable = button.disableInteractive.bind(button);
    button.disableInteractive = () => {
      bg.disableInteractive();
      if (isHovering) {
        this.input.setDefaultCursor('default');
      }
      return button;
    };

    return button;
  }

  /**
   * Make honor choice and show rewards
   */
  private makeLandasChoice(
    choice: "spare" | "kill",
    dialogue: CreatureDialogue
  ): void {
    try {
      console.log(`Making landas choice: ${choice}`);
      
      const isSpare = choice === "spare";
      const landasChange = isSpare ? 1 : -1;
      const reward = isSpare ? dialogue.spareReward : dialogue.killReward;
      const choiceDialogue = isSpare
        ? dialogue.spareDialogue
        : dialogue.killDialogue;

      console.log(`Landas change: ${landasChange}, Reward:`, reward);

      // Update landas score
      this.combatState.player.landasScore += landasChange;

      // Apply DDA gold multiplier using PRE-COMBAT difficulty (fair reward scaling)
      // Rewards are based on the tier active DURING combat, not the tier AFTER combat results are processed
      const scaledGold = Math.round(reward.ginto * this.preCombatDifficultyAdjustment.goldRewardMultiplier);
      
      // Apply scaled rewards
      this.combatState.player.ginto += scaledGold;
      this.combatState.player.diamante += reward.diamante;
      
      // Log for thesis data collection
      if (scaledGold !== reward.ginto) {
        console.log(`💰 DDA Gold Reward Scaling (Pre-Combat Tier): ${reward.ginto} → ${scaledGold} (tier: ${this.preCombatDifficultyAdjustment.tier}, multiplier: ${this.preCombatDifficultyAdjustment.goldRewardMultiplier})`);
      }

      if (reward.healthHealing > 0) {
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + reward.healthHealing
        );
      }

      // Handle relic drops with drop chance
      if (reward.relics && reward.relics.length > 0 && reward.relicDropChance) {
        const dropRoll = Math.random();
        console.log(`Relic drop roll: ${dropRoll.toFixed(2)} vs ${reward.relicDropChance.toFixed(2)}`);
        
        if (dropRoll <= reward.relicDropChance) {
          // Successful drop - add first relic from the reward
          const droppedRelic = reward.relics[0];
          console.log(`✅ Relic dropped: ${droppedRelic.name} (${droppedRelic.emoji})`);
          
          // Add to player's relics (max 6)
          if (!this.combatState.player.relics) {
            this.combatState.player.relics = [];
          }
          
          if (this.combatState.player.relics.length < 6) {
            this.combatState.player.relics.push(droppedRelic);
            console.log(`Added relic to inventory. Total relics: ${this.combatState.player.relics.length}/6`);
          } else {
            console.log(`⚠️ Relic inventory full (6/6). Relic not added.`);
          }
        } else {
          console.log(`❌ Relic drop failed (rolled ${dropRoll.toFixed(2)}, needed ≤${reward.relicDropChance.toFixed(2)})`);
        }
      }

      console.log("Clearing dialogue and showing results...");

      // Simply clear all children - the rewards screen will create new UI
      if (this.children.list) {
        const childrenToRemove = this.children.list.filter(child => {
          // Keep background elements and camera-related objects
          return !(child instanceof Phaser.GameObjects.Image && child.texture?.key === 'bg');
        });
        
        childrenToRemove.forEach(child => {
          if (child && child.destroy) {
            child.destroy();
          }
        });
      }
      
      // Safety check for camera
      if (this.cameras.main) {
        this.cameras.main.setBackgroundColor(0x0e1112);
      }

      // Add small delay before showing rewards screen
      this.time.delayedCall(200, () => {
        try {
          this.showRewardsScreen(choice, choiceDialogue, reward, landasChange, scaledGold);
        } catch (error) {
          console.error("Error showing rewards screen:", error);
          // Fallback - return to overworld immediately
          this.returnToOverworld();
        }
      });
      
    } catch (error) {
      console.error("Error in makeLandasChoice:", error);
      // Fallback - return to overworld if something goes wrong
      this.returnToOverworld();
    }
  }

  /**
   * Show rewards screen
   */
  private showRewardsScreen(
    choice: "spare" | "kill",
    dialogue: string,
    reward: PostCombatReward,
    landasChange: number,
    scaledGold: number
  ): void {
    const choiceColor = choice === "spare" ? "#2ed573" : "#ff4757";
    const landasChangeText =
      landasChange > 0 ? `+${landasChange}` : `${landasChange}`;

      // Get screen dimensions
      const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
      const screenHeight = this.cameras.main?.height || this.scale.height || 768;
      const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));    // Title
    this.add
      .text(
        screenWidth/2,
        100,
        choice === "spare" ? "Mercy Shown" : "Victory Through Force",
        {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(32 * scaleFactor),
          color: choiceColor,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Dialogue
    this.add
      .text(screenWidth/2, 200, dialogue, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: "#e8eced",
        align: "center",
        wordWrap: { width: screenWidth * 0.7 },
      })
      .setOrigin(0.5);

    // Rewards box
    const rewardsBoxWidth = Math.min(600, screenWidth * 0.6);
    const rewardsBoxHeight = Math.min(250, screenHeight * 0.4);
    const rewardsBox = this.add.rectangle(screenWidth/2, 400, rewardsBoxWidth, rewardsBoxHeight, 0x2f3542);
    rewardsBox.setStrokeStyle(2, 0x57606f);

    this.add
      .text(screenWidth/2, 320, "Rewards", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(24 * scaleFactor),
        color: "#ffd93d",
        align: "center",
      })
      .setOrigin(0.5);

    let rewardY = 360;

    // Ginto reward - display the DDA-scaled amount
    if (scaledGold > 0) {
      this.add
        .text(screenWidth/2, rewardY, `💰 ${scaledGold} Ginto`, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(16 * scaleFactor),
          color: "#e8eced",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25 * scaleFactor;
    }

    // Diamante reward (check if property exists)
    if (reward && typeof reward === 'object' && 'diamante' in reward && (reward as any).diamante > 0) {
      this.add
        .text(screenWidth/2, rewardY, `💎 ${(reward as any).diamante} Diamante`, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(16 * scaleFactor),
          color: "#4ecdc4",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25 * scaleFactor;
    }

    // Health healing
    if (reward.healthHealing > 0) {
      this.add
        .text(screenWidth/2, rewardY, `♥ Healed ${reward.healthHealing} HP`, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(16 * scaleFactor),
          color: "#ff6b6b",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25 * scaleFactor;
    }

    // Landas change
    this.add
      .text(screenWidth/2, rewardY, `✨ Landas ${landasChangeText}`, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: landasChange > 0 ? "#2ed573" : "#ff4757",
        align: "center",
      })
      .setOrigin(0.5);
    rewardY += 25 * scaleFactor;

    // Bonus effect
    if (reward.bonusEffect) {
      this.add
        .text(screenWidth/2, rewardY, `✨ ${reward.bonusEffect}`, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(14 * scaleFactor),
          color: "#ffd93d",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25 * scaleFactor;
    }

    // Relic drop display
    if (reward.relics && reward.relics.length > 0) {
      // Check if relic was actually dropped (based on the logic in makeLandasChoice)
      const droppedRelic = this.combatState.player.relics[this.combatState.player.relics.length - 1];
      const rewardRelic = reward.relics[0];
      
      // If the last relic in player's inventory matches the reward relic, it was dropped
      if (droppedRelic && droppedRelic.id === rewardRelic.id) {
        this.add
          .text(screenWidth/2, rewardY, `${rewardRelic.emoji} Relic: ${rewardRelic.name}`, {
            fontFamily: "dungeon-mode",
            fontSize: Math.floor(16 * scaleFactor),
            color: "#a29bfe",
            align: "center",
          })
          .setOrigin(0.5);
        rewardY += 25 * scaleFactor;
        
        // Show relic description
        this.add
          .text(screenWidth/2, rewardY, rewardRelic.description, {
            fontFamily: "dungeon-mode",
            fontSize: Math.floor(12 * scaleFactor),
            color: "#95a5a6",
            align: "center",
            wordWrap: { width: screenWidth * 0.7 }
          })
          .setOrigin(0.5);
        rewardY += 40 * scaleFactor;
      } else {
        // Relic drop failed
        this.add
          .text(screenWidth/2, rewardY, `❌ No relic dropped`, {
            fontFamily: "dungeon-mode",
            fontSize: Math.floor(14 * scaleFactor),
            color: "#7f8c8d",
            align: "center",
          })
          .setOrigin(0.5);
        rewardY += 25 * scaleFactor;
      }
    }

    // Current landas status
    const landasTier = this.getLandasTier(this.combatState.player.landasScore);
    const landasColor = this.getLandasColor(landasTier);

    this.add
      .text(
        screenWidth/2,
        520,
        `Landas: ${
          this.combatState.player.landasScore
        } (${landasTier.toUpperCase()})`,
        {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(18 * scaleFactor),
          color: landasColor,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Continue button
    this.createDialogueButton(screenWidth/2, 600, "Continue", "#4ecdc4", () => {
      // Save player state and return to overworld
      this.returnToOverworld();
    });

    // Auto-continue after 8 seconds
    this.time.delayedCall(8000, () => {
      this.returnToOverworld();
    });
  }

  /**
   * Return to overworld with updated player state
   */
  private returnToOverworld(): void {
    try {
      console.log("Returning to overworld...");
      
      // Save player state to GameState manager
      const gameState = GameState.getInstance();
      
      // Ensure health values are properly rounded and clamped before saving
      const currentHealth = Math.max(0, Math.floor(this.combatState.player.currentHealth));
      const maxHealth = Math.max(1, Math.floor(this.combatState.player.maxHealth));
      
      console.log(`Saving player health: ${currentHealth}/${maxHealth}`);
      
      // Update player data in GameState with complete state
      gameState.updatePlayerData({
        currentHealth: currentHealth,
        maxHealth: maxHealth,
        landasScore: this.combatState.player.landasScore,
        ginto: this.combatState.player.ginto,
        diamante: this.combatState.player.diamante,
        relics: this.combatState.player.relics,
        potions: this.combatState.player.potions,
        discardCharges: this.combatState.player.discardCharges,
        maxDiscardCharges: this.combatState.player.maxDiscardCharges,
        // Save deck state (combine all cards back into deck)
        deck: [
          ...this.combatState.player.hand,
          ...this.combatState.player.drawPile,
          ...this.combatState.player.discardPile,
          ...this.combatState.player.playedHand
        ],
        // Reset these for next combat
        hand: [],
        drawPile: [],
        discardPile: [],
        playedHand: []
      });

      console.log("Player data saved to GameState, stopping combat scene...");

      // Mark the current node as completed
      gameState.completeCurrentNode(true);

      // Clean shutdown of combat scene
      this.input.removeAllListeners();
      this.time.removeAllEvents();
      
      // Stop this scene first
      this.scene.stop();
      
      // Small delay before resuming overworld to ensure clean transition
      setTimeout(() => {
        try {
          console.log("Attempting to resume Overworld scene...");
          
          // Get the scene manager
          const sceneManager = this.scene.manager;
          
          // Check if Overworld scene exists and is not active
          const overworldScene = sceneManager.getScene("Overworld");
          if (overworldScene) {
            console.log("Overworld scene found, resuming...");
            
            // Resume the overworld scene
            sceneManager.resume("Overworld");
            
            // Explicitly call resume method on overworld if it exists
            if (typeof (overworldScene as any).resume === 'function') {
              (overworldScene as any).resume();
            }
          } else {
            console.warn("Overworld scene not found, starting new instance");
            sceneManager.start("Overworld");
          }
        } catch (resumeError) {
          console.error("Error resuming Overworld:", resumeError);
          // Last resort - start overworld fresh
          this.scene.manager.start("Overworld");
        }
      }, 100);
      
    } catch (error) {
      console.error("Error in returnToOverworld:", error);
      // Emergency fallback
      try {
        this.scene.stop();
        setTimeout(() => {
          this.scene.manager.start("Overworld");
        }, 100);
      } catch (fallbackError) {
        console.error("Emergency fallback also failed:", fallbackError);
        // Absolute last resort - restart the game
        this.scene.start("MainMenu");
      }
    }
  }

  /**
   * Clear combat UI elements
   */
  private clearCombatUI(): void {
    try {
      if (this.handContainer) {
        this.handContainer.destroy();
      }
      if (this.playedHandContainer) {
        this.playedHandContainer.destroy();
      }
      if (this.actionButtons) {
        this.actionButtons.destroy();
      }
      if (this.relicsContainer) {
        this.relicsContainer.destroy();
      }
      if (this.playerStatusContainer) {
        this.playerStatusContainer.destroy();
      }
      if (this.enemyStatusContainer) {
        this.enemyStatusContainer.destroy();
      }
      if (this.actionResultText) {
        this.actionResultText.destroy();
      }
      if (this.handEvaluationText) {
        this.handEvaluationText.destroy();
      }
      if (this.turnText) {
        this.turnText.destroy();
      }
      if (this.actionsText) {
        this.actionsText.destroy();
      }
      // Clean up battle start dialogue if it exists
      if (this.battleStartDialogueContainer) {
        this.battleStartDialogueContainer.destroy();
        this.battleStartDialogueContainer = null;
      }
    } catch (error) {
      console.error("Error clearing combat UI:", error);
    }
  }

  /**
   * Get honor range from honor value
   */
  private getLandasTier(landasScore: number): Landas {
    if (landasScore <= -5) return "Conquest";
    if (landasScore >= 5) return "Mercy";
    return "Balance";
  }

  /**
   * Get color for landas tier
   */
  private getLandasColor(tier: Landas): string {
    switch (tier) {
      case "Conquest":
        return "#ff4757";
      case "Mercy":
        return "#2ed573";
      case "Balance":
        return "#ffd93d";
    }
  }


  /**
   * Get dominant suit from played hand
   */
  public getDominantSuit(cards: PlayingCard[]): Suit {
    if (cards.length === 0) return "Apoy";

    const suitCounts = cards.reduce((counts, card) => {
      counts[card.suit] = (counts[card.suit] || 0) + 1;
      return counts;
    }, {} as Record<Suit, number>);

    return Object.entries(suitCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0] as Suit;
  }

  public getSpecialActionName(suit: Suit): string {
    const specialActions: Record<Suit, string> = {
      Apoy: "Burn (10 dmg/turn)",
      Tubig: "Heal (30 HP)",
      Lupa: "Stun (1 turn)",
      Hangin: "Weak (half dmg, 3 turns)",
    };
    return specialActions[suit];
  }

  public executeAction(actionType: "attack" | "defend" | "special"): void {
    // Prevent action spamming
    if (this.isActionProcessing) {
      console.log("Action already processing, ignoring input");
      return;
    }
    
    // Check if Special has already been used this combat
    if (actionType === "special" && this.specialUsedThisCombat) {
      console.log("Special attack already used this combat!");
      this.showActionResult("Special already used!");
      return;
    }
    
    // Set processing flag
    this.isActionProcessing = true;
    
    // Visually disable action buttons
    this.setActionButtonsEnabled(false);
    
    console.log(`Executing action: ${actionType}`);
    
    const evaluation = HandEvaluator.evaluateHand(
      this.combatState.player.playedHand,
      actionType,
      this.combatState.player
    );
    console.log(`Hand evaluation:`, evaluation);
    
    // Display the hand type with visual flair
    this.displayHandType(evaluation.type);
    
    // Track best hand for DDA
    if (this.isHandBetterThan(evaluation.type, this.bestHandAchieved)) {
      this.bestHandAchieved = evaluation.type;
    }
    
    // Apply relic effects after playing a hand (handles ALL relics with AFTER_HAND_PLAYED effects)
    RelicManager.applyAfterHandPlayedEffects(this.combatState.player, this.combatState.player.playedHand, evaluation);
    
    const dominantSuit = this.getDominantSuit(
      this.combatState.player.playedHand
    );
    console.log(`Dominant suit: ${dominantSuit}`);

    let damage = 0;
    let block = 0;

    // New damage calculation is already done in evaluation
    // evaluation.totalValue now contains the final calculated damage
    
    // Track relic bonuses for detailed display
    const relicBonuses: {name: string, amount: number}[] = [];
    
    switch (actionType) {
      case "attack":
        damage = evaluation.totalValue;
        
        // Apply "Sigbin Heart" effect: +5 damage on burst (when low health)
        // This is added as a flat bonus AFTER the main calculation
        const sigbinHeartDamage = RelicManager.calculateSigbinHeartDamage(this.combatState.player);
        if (sigbinHeartDamage > 0) {
          damage += sigbinHeartDamage;
          relicBonuses.push({name: "Sigbin Heart", amount: sigbinHeartDamage});
        }
        console.log(`Total attack damage: ${damage}`);
        
        // Show detailed damage calculation with breakdown
        if (evaluation.breakdown) {
          console.log('Damage breakdown:', evaluation.breakdown.join(' → '));
        }
        // Removed showDamageCalculation - duplicate display
        break;
      case "defend":
        block = evaluation.totalValue;
        
        // Apply "Balete Root" effect: +2 block per Lupa card
        // This is added as a flat bonus AFTER the main calculation
        const baleteRootBonus = RelicManager.calculateBaleteRootBlock(this.combatState.player, this.combatState.player.playedHand);
        if (baleteRootBonus > 0) {
          block += baleteRootBonus;
          relicBonuses.push({name: "Balete Root", amount: baleteRootBonus});
        }
        console.log(`Total block gained: ${block}`);
        
        // Show detailed block calculation with breakdown
        if (evaluation.breakdown) {
          console.log('Block breakdown:', evaluation.breakdown.join(' → '));
        }
        // Removed showBlockCalculation - duplicate display
        break;
      case "special":
        // Mark special as used
        this.specialUsedThisCombat = true;
        this.updateTurnUI();
        
        // Start cinematic special action animation
        this.animations.animateSpecialAction(dominantSuit);
        
        // Execute special action after animation
        this.time.delayedCall(1500, () => {
          this.showActionResult(this.getSpecialActionName(dominantSuit));
          console.log(`Special action executed: ${this.getSpecialActionName(dominantSuit)}`);
          // Special actions have unique effects based on suit
          this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);
          
          // Process enemy turn after animation completes
          this.time.delayedCall(1000, () => {
            this.processEnemyTurn();
          });
        });
        
        // Return here since special action has delayed processing
        return;
    }

    // Apply elemental effects for attack/defend
    this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);

    if (damage > 0) {
      console.log(`Animating player attack and dealing ${damage} damage`);
      this.animations.animatePlayerAttack(); // Add animation when attacking
      this.showFloatingDamage(damage); // Show floating damage counter like Prologue
      this.damageEnemy(damage);
      // Result already shown above with detailed calculation
    }

    if (block > 0) {
      this.combatState.player.block += block;
      this.ui.updatePlayerUI();
      // Result already shown above with detailed calculation
    }
    
    // Process enemy turn after a short delay to allow player to see results
    this.time.delayedCall(1000, () => {
      this.processEnemyTurn();
    });
  }
  
  /** Process enemy turn - extracted for reuse */
  private processEnemyTurn(): void {
    console.log("Processing enemy turn");
    // Check if combat has ended or enemy is defeated before processing turn
    if (this.combatEnded || this.combatState.enemy.currentHealth <= 0) {
      console.log("Combat ended or enemy defeated, skipping delayed enemy turn");
      this.isActionProcessing = false;
      this.setActionButtonsEnabled(true);
      // Hide damage preview during enemy turn
      this.updateDamagePreview(false);
      return;
    }
    // Process enemy action - the enemy turn will handle resetting the processing flag
    this.executeEnemyTurn();
  }
  
  /** Add cinematic effect for special poker hands */


  private applyElementalEffects(
    actionType: "attack" | "defend" | "special",
    suit: Suit,
    value: number
  ): void {
    // Elemental effects ONLY apply to Special actions
    if (actionType !== "special") {
      return;
    }
    
    switch (suit) {
      case "Apoy": // Fire - Burn (10 damage per turn)
        // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
        const apoyAdditionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
        if (apoyAdditionalDamage > 0) {
          this.damageEnemy(apoyAdditionalDamage);
        }
        
        // Apply Burn: 10 damage per turn
        this.addStatusEffect(this.combatState.enemy, {
          id: "burn",
          name: "Burn",
          type: "debuff",
          duration: 3,
          value: 10,
          description: "Takes 10 damage at the start of each turn.",
          emoji: "🔥",
        });
        this.showActionResult("Applied Burn (10 damage/turn)!");
        break;
        
      case "Tubig": // Water - Heal (30 HP)
        // Heal player by 30 HP
        const healAmount = 30;
        const oldHealth = this.combatState.player.currentHealth;
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + healAmount
        );
        const actualHealed = this.combatState.player.currentHealth - oldHealth;
        
        // Cleanse all debuffs from player
        this.combatState.player.statusEffects = this.combatState.player.statusEffects.filter(
          effect => effect.type !== "debuff"
        );
        
        this.ui.updatePlayerUI();
        this.showActionResult(`Healed ${actualHealed} HP and cleansed debuffs!`);
        break;
        
      case "Lupa": // Earth - Stun (1 turn)
        // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
        const lupaAdditionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
        if (lupaAdditionalDamage > 0) {
          this.damageEnemy(lupaAdditionalDamage);
        }
        
        // Apply Stun: Enemy skips next turn
        this.addStatusEffect(this.combatState.enemy, {
          id: "stun",
          name: "Stunned",
          type: "debuff",
          duration: 1,
          value: 1,
          description: "Cannot act for 1 turn.",
          emoji: "💫",
        });
        this.showActionResult("Enemy is Stunned for 1 turn!");
        break;
        
      case "Hangin": // Air - Weak (enemy deals half damage for 3 turns)
        // Apply "Wind Veil" effect: Additional cards drawn based on Hangin cards played
        let cardsToDraw = 2;
        cardsToDraw += RelicManager.calculateWindVeilCardDraw(this.combatState.player.playedHand, this.combatState.player);
        this.drawCards(cardsToDraw);
        
        // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
        const hanginAdditionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
        if (hanginAdditionalDamage > 0) {
          this.damageEnemy(hanginAdditionalDamage);
        }
        
        // Apply Weak: Enemy deals half damage for 3 turns
        this.addStatusEffect(this.combatState.enemy, {
          id: "weak",
          name: "Weak",
          type: "debuff",
          duration: 3,
          value: 0.5,
          description: "Deals only 50% damage for 3 turns.",
          emoji: "⚠️",
        });
        this.showActionResult(`Drew ${cardsToDraw} cards and applied Weak!`);
        break;
    }
  }

  /**
   * Create action result display
   */
  private createActionResultUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    this.actionResultText = this.add
      .text(screenWidth/2, screenHeight * 0.75, "", { // Position lower to avoid overlap with calculation displays
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(20 * scaleFactor),
        color: "#2ed573",
        align: "center",
        stroke: "#000000",
        strokeThickness: 1
      })
      .setOrigin(0.5)
      .setVisible(false);
  }

  /**
   * Create deck sprite representation for animations
   */
  private createDeckSprite(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Position deck on the right side, below the enemy area
    this.deckPosition = {
      x: screenWidth * 0.85,
      y: screenHeight * 0.75
    };
    
    this.deckSprite = this.add.container(this.deckPosition.x, this.deckPosition.y);
    
    // Calculate card dimensions based on screen size (same as hand cards)
    const baseCardWidth = 80;
    const baseCardHeight = 112;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const cardWidth = baseCardWidth * scaleFactor;
    const cardHeight = baseCardHeight * scaleFactor;
    
    // Create deck pile visual (stack of cards)
    const deckCardCount = Math.min(5, this.combatState.player.drawPile.length); // Show max 5 cards in stack
    
    for (let i = 0; i < deckCardCount; i++) {
      if (i === deckCardCount - 1) {
        // Top card uses backart.png sprite with black border
        let frontCard;
        if (this.textures.exists('backart')) {
          frontCard = this.add.image(
            i * 3, // Slight offset for stack effect
            -i * 3,
            'backart'
          );
          frontCard.setDisplaySize(cardWidth, cardHeight);
        } else {
          // Fallback to white rectangle for front card
          frontCard = this.add.rectangle(
            i * 3,
            -i * 3,
            cardWidth,
            cardHeight,
            0xffffff // White color
          );
          frontCard.setStrokeStyle(2, 0x000000); // Black border
        }
        this.deckSprite.add(frontCard);
      } else {
        // Back cards use white rectangle with black border
        const cardBack = this.add.rectangle(
          i * 3, // Slight offset for stack effect
          -i * 3,
          cardWidth,
          cardHeight,
          0xffffff // White color
        );
        cardBack.setStrokeStyle(2, 0x000000); // Black border
        this.deckSprite.add(cardBack);
      }
    }
    
    // Add deck label positioned below the deck cards
    const labelY = (cardHeight / 2) + 20; // Position below the cards
    const deckLabel = this.add.text(0, labelY, `Deck: ${this.combatState.player.drawPile.length}`, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);
    
    this.deckSprite.add(deckLabel);
    this.deckSprite.setInteractive(new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight), Phaser.Geom.Rectangle.Contains);
    this.deckSprite.on("pointerdown", () => {
      this.showDeckView();
    });
  }

  /**
   * Create discard pile sprite representation
   */
  private createDiscardSprite(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.discardPilePosition = { x: screenWidth - 100, y: screenHeight - 200 };

    this.discardPileSprite = this.add.sprite(
      this.discardPilePosition.x,
      this.discardPilePosition.y,
      "card_back"
    );
    this.discardPileSprite.setInteractive();
    this.discardPileSprite.on("pointerdown", () => {
      this.showDiscardPileView();
    });
  }

  private createDeckView(): void {
    // Delegated to CombatUI - this is just a compatibility wrapper
    // The actual container is created in CombatUI.createDeckView()
  }


  private createDiscardView(): void {
    // Delegated to CombatUI - this is just a compatibility wrapper
    // The actual container is created in CombatUI.createDiscardView()
  }


  private showDeckView(): void {
    // Delegate to CombatUI for the new improved deck view
    this.ui.showDeckView();
  }

  private showDiscardPileView(): void {
    // Delegate to CombatUI for the new improved discard view
    this.ui.showDiscardView();
  }

  /**
   * Update deck display (card count and visual)
   */
  private updateDeckDisplay(): void {
    // Delegate to CombatUI
    this.ui.updateDeckDisplay();
  }
  
  /**
   * Update discard pile display (card count)
   */
  private updateDiscardDisplay(): void {
    // Delegate to CombatUI
    this.ui.updateDiscardDisplay();
  }
  
  /**
   * Update hand display without animations (for existing cards)
   */
  /**
   * Update hand display quietly (no animation) - delegates to CombatUI
   * This is used by animations
   */
  private updateHandDisplayQuiet(): void {
    this.ui.updateHandDisplayQuiet();
  }
  
  /**
   * Show action result message
   */
  private showActionResult(message: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Update position to center of screen
    this.actionResultText.setPosition(screenWidth/2, screenHeight/2);
    this.actionResultText.setText(message);
    this.actionResultText.setVisible(true);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: this.actionResultText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        this.actionResultText.setVisible(false);
        this.actionResultText.setAlpha(1); // Reset alpha for next use
      },
    });
  }
  
  /**
   * Display the hand type with visual flair
   */
  private displayHandType(handType: HandType): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Get hand type display text and color
    const handTypeText = this.getHandTypeDisplayText(handType);
    const handColor = this.getHandTypeColor(handType);
    
    // Create the hand type display text
    const handDisplay = this.add.text(
      screenWidth / 2,
      screenHeight * 0.15, // Position at top of screen
      handTypeText.toUpperCase(),
      {
        fontFamily: "dungeon-mode",
        fontSize: 36,
        color: handColor,
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.8).setDepth(1000);
    
    // Animate the text in with a bounce effect
    this.tweens.add({
      targets: handDisplay,
      alpha: 1,
      scale: 1.1,
      duration: 300,
      ease: 'Back.Out',
      onComplete: () => {
        // Hold for a moment then fade out
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: handDisplay,
            alpha: 0,
            scale: 0.9,
            duration: 400,
            ease: 'Cubic.In',
            onComplete: () => {
              handDisplay.destroy();
            }
          });
        });
      }
    });
    
    // Add a subtle glow effect for high-tier hands
    const specialHands: HandType[] = ["straight", "flush", "full_house", "four_of_a_kind", "straight_flush", "royal_flush", "five_of_a_kind"];
    if (specialHands.includes(handType)) {
      // Create a subtle glow background
      const glow = this.add.rectangle(
        screenWidth / 2,
        screenHeight * 0.15,
        handDisplay.width + 40,
        handDisplay.height + 20,
        0xffffff
      ).setOrigin(0.5).setAlpha(0).setDepth(999);
      
      this.tweens.add({
        targets: glow,
        alpha: [0, 0.15, 0],
        duration: 600,
        ease: 'Sine.InOut',
        onComplete: () => {
          glow.destroy();
        }
      });
    }
  }
  
  /**
   * Get appropriate color for hand type
   */
  private getHandTypeColor(handType: HandType): string {
    switch(handType) {
      case "high_card": return "#9ca3af";      // Gray
      case "pair": return "#10b981";           // Green
      case "two_pair": return "#3b82f6";       // Blue
      case "three_of_a_kind": return "#8b5cf6"; // Purple
      case "straight": return "#06b6d4";       // Cyan
      case "flush": return "#0ea5e9";          // Sky blue
      case "full_house": return "#f59e0b";     // Amber
      case "four_of_a_kind": return "#ef4444"; // Red
      case "straight_flush": return "#f97316"; // Orange
      case "royal_flush": return "#fbbf24";    // Gold
      case "five_of_a_kind": return "#d946ef"; // Magenta
      default: return "#ffffff";               // White
    }
  }

  /**
   * Enhanced action result display with relic effect indicators
   */
  private showEnhancedActionResult(message: string, color: string = "#2ed573"): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Update position to lower area to avoid overlap with calculation displays
    this.actionResultText.setPosition(screenWidth/2, screenHeight * 0.75);
    this.actionResultText.setText(message);
    this.actionResultText.setColor(color);
    this.actionResultText.setVisible(true);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: this.actionResultText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        this.actionResultText.setVisible(false);
        this.actionResultText.setAlpha(1); // Reset alpha for next use
      },
    });
  }
  
  /** Show floating damage counter similar to Prologue's attack animation */
  private showFloatingDamage(damage: number): void {
    if (!this.enemySprite) return;
    
    // Create damage text at enemy position
    const damageText = this.add.text(
      this.enemySprite.x, 
      this.enemySprite.y, 
      damage.toString(), 
      { 
        fontFamily: 'dungeon-mode', 
        fontSize: 48, 
        color: '#ff6b6b'
      }
    ).setOrigin(0.5);
    
    // Animate damage text upward and fade out
    this.tweens.add({ 
      targets: damageText, 
      y: this.enemySprite.y - 100, 
      alpha: 0, 
      duration: 1000, 
      ease: 'Power1',
      onComplete: () => {
        damageText.destroy();
      }
    });
    
    // Flash enemy red like in Prologue
    this.enemySprite.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      if (this.enemySprite) {
        this.enemySprite.clearTint();
      }
    });
    
    // Camera shake like in Prologue
    this.cameras.main.shake(100, 0.01);
  }
  
  /** Update damage preview with calculated damage - kept for style reference */
  private updateDamagePreview(isActionSelectionPhase: boolean): void {
    // This method is kept for its calculation logic and styling approach
    // but no longer displays UI since the preview container was removed
    if (!isActionSelectionPhase) {
      if (this.damagePreviewText) {
        this.damagePreviewText.setVisible(false);
      }
      return;
    }

    // Calculate the potential damage based on the played hand
    const evaluation = HandEvaluator.evaluateHand(
      this.combatState.player.playedHand,
      "attack",
      this.combatState.player
    );

    let damage = evaluation.totalValue;

    // Apply "Sigbin Heart" effect: +5 damage on burst (when low health)
    const sigbinBonus = RelicManager.calculateSigbinHeartDamage(this.combatState.player);
    damage += sigbinBonus;

    // Apply vulnerable effect if enemy has it
    let vulnerableBonus = 0;
    if (this.combatState.enemy.statusEffects.some((e) => e.name === "Vulnerable")) {
      const originalDamage = damage;
      damage *= 1.5;
      vulnerableBonus = damage - originalDamage;
    }

    // Apply "Bakunawa Fang" effect: +5 additional damage when using any relic
    const bakunawaFang = this.combatState.player.relics.find(r => r.id === "bakunawa_fang");
    let bakunawaBonus = 0;
    if (bakunawaFang) {
      damage += 5;
      bakunawaBonus = 5;
    }

    // Format the damage display with new calculation system
    let damageText = `DMG: ${evaluation.baseValue} (cards)`;
    if (evaluation.handBonus > 0) {
      damageText += ` +${evaluation.handBonus}`;
    }
    if (evaluation.elementalBonus > 0) {
      damageText += ` +${evaluation.elementalBonus} (elem)`;
    }
    if (evaluation.handMultiplier > 1) {
      damageText += ` ×${evaluation.handMultiplier}`;
    }
    if (sigbinBonus > 0) {
      damageText += ` +${sigbinBonus} (Sigbin)`;
    }
    if (vulnerableBonus > 0) {
      damageText += ` +${Math.floor(vulnerableBonus)} (Vuln)`;
    }
    if (bakunawaBonus > 0) {
      damageText += ` +${bakunawaBonus} (Bakunawa)`;
    }
    damageText += ` = ${Math.floor(damage)}`;

    // Display the damage preview
    if (this.damagePreviewText) {
      this.damagePreviewText.setText(damageText);
      this.damagePreviewText.setVisible(true);
    }
  }

  /**
   * Flip player sprite horizontally
   */
  private flipPlayerSprite(flip: boolean): void {
    this.playerSprite.setFlipX(flip);
  }

  /**
   * Flip enemy sprite horizontally
   */
  private flipEnemySprite(flip: boolean): void {
    this.enemySprite.setFlipX(flip);
  }

  private addStatusEffect(entity: Player | Enemy, effect: StatusEffect): void {
    // Check for relic effects that might prevent or modify status effects
    
    // For player entity, check relic effects
    if (entity.id === "player") {
      // "Duwende Charm" effect: +10% avoid Weak
      if (effect.name === "Weak" && !RelicManager.shouldApplyWeakStatus(entity as Player)) {
        this.showActionResult("Duwende Charm prevented Weak status!");
        return; // Don't apply the status effect
      }
      
      // "Tiyanak Tear" effect: Ignore 1 Fear
      if (effect.name === "Fear" && !RelicManager.shouldApplyFearStatus(entity as Player)) {
        this.showActionResult("Tiyanak Tear prevented Fear status!");
        return; // Don't apply the status effect
      }
      
      // "Mangangaway Wand" effect: Ignore curses
      if (effect.name === "Curse" && RelicManager.shouldIgnoreCurse(entity as Player)) {
        this.showActionResult("Mangangaway Wand prevented curse!");
        return; // Don't apply the status effect
      }
    }
    
    entity.statusEffects.push(effect);
    this.updateStatusEffectUI(entity);
  }

  private removeStatusEffect(entity: Player | Enemy, effectId: string): void {
    entity.statusEffects = entity.statusEffects.filter(
      (effect) => effect.id !== effectId
    );
    this.updateStatusEffectUI(entity);
  }

  private applyStatusEffects(entity: Player | Enemy): void {
    entity.statusEffects.forEach((effect) => {
      switch (effect.name) {
        case "Burn":
          this.damage(entity, effect.value);
          effect.duration--;
          break;
        case "Regeneration":
          this.heal(entity, effect.value);
          effect.duration--;
          break;
      }
    });

    entity.statusEffects = entity.statusEffects.filter(
      (effect) => effect.duration > 0
    );

    this.updateStatusEffectUI(entity);
  }

  private updateStatusEffectUI(entity: Player | Enemy): void {
    // Check if containers are initialized
    if (!this.playerStatusContainer || !this.enemyStatusContainer) {
      console.warn("Status containers not initialized");
      return;
    }
    
    const statusContainer = entity.id === "player" ? this.playerStatusContainer : this.enemyStatusContainer;
    
    // Check if container exists before trying to access it
    if (!statusContainer) {
      console.warn("Status container not found for entity:", entity.id);
      return;
    }
    
    try {
      statusContainer.removeAll(true);
    } catch (error) {
      console.warn("Error removing status container contents:", error);
      return;
    }

    const screenWidth = this.cameras.main.width;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const baseSpacing = 30;
    const spacing = baseSpacing * scaleFactor;
    let x = 0;
    
    entity.statusEffects.forEach((effect) => {
      const effectText = this.add.text(x, 0, `${effect.emoji}${effect.duration}`, {
        fontSize: Math.floor(16 * scaleFactor),
      }).setInteractive();

      // Create Prologue-style tooltip container
      const tooltipContainer = this.add.container(x, spacing + 20);
      
      // Calculate tooltip dimensions
      const textWidth = effect.description.length * 8;
      const tooltipWidth = Math.min(textWidth + 20, 200);
      const tooltipHeight = 40;
      
      // Prologue-style double border design
      const outerBorder = this.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const innerBorder = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const bg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
      
      const tooltipText = this.add.text(0, 0, effect.description, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(12 * scaleFactor),
        color: "#77888C",
        align: "center",
        wordWrap: { width: tooltipWidth - 10 }
      }).setOrigin(0.5);
      
      tooltipContainer.add([outerBorder, innerBorder, bg, tooltipText]);
      tooltipContainer.setVisible(false).setAlpha(0);

      effectText.on("pointerover", () => {
        // Prologue-style fade in
        tooltipContainer.setVisible(true);
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });

      effectText.on("pointerout", () => {
        // Prologue-style fade out
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2.easeOut',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
      });

      statusContainer.add([effectText, tooltipContainer]);
      x += spacing;
    });
  }

  private damage(entity: Player | Enemy, amount: number): void {
    if (entity.id === "player") {
      this.damagePlayer(amount);
    } else {
      this.damageEnemy(amount);
    }
  }

  /**
   * Enable or disable action buttons
   */
  private setActionButtonsEnabled(enabled: boolean): void {
    if (this.actionButtons) {
      this.actionButtons.getAll().forEach((child) => {
        if (child instanceof Phaser.GameObjects.Container) {
          // Check if this container has input (it's an interactive button)
          if (child.input) {
            child.input.enabled = enabled;
            // Visually indicate disabled state
            const bg = child.getAt(0) as Phaser.GameObjects.Rectangle;
            if (bg) {
              bg.setFillStyle(enabled ? 0x2f3542 : 0x1a1d26);
            }
          }
          // For grouped containers (like sort buttons), recursively enable/disable children
          else {
            child.getAll().forEach((subChild) => {
              if (subChild instanceof Phaser.GameObjects.Container && (subChild as any).input) {
                (subChild as any).input.enabled = enabled;
                // Update visual state for Prologue-style buttons
                const bg = subChild.getAt(2) as Phaser.GameObjects.Rectangle; // Index 2 is the background
                if (bg) {
                  bg.setFillStyle(enabled ? 0x150E10 : 0x0a0806);
                }
              }
            });
          }
        }
      });
    }
  }

  private heal(entity: Player | Enemy, amount: number): void {
    entity.currentHealth = Math.min(entity.maxHealth, entity.currentHealth + amount);
    if (entity.id === "player") {
      this.ui.updatePlayerUI();
    } else {
      this.ui.updateEnemyUI();
    }
  }
  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Safety check: Don't update if scene is being destroyed or doesn't exist
    if (!this.sys || !this.sys.isActive() || this.combatEnded) {
      return;
    }

    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }
    
    // Reposition UI elements on resize
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Update containers if they exist
    if (this.handContainer) {
      this.handContainer.setPosition(screenWidth/2, screenHeight - 280);
    }
    
    if (this.playedHandContainer) {
      this.playedHandContainer.setPosition(screenWidth/2, screenHeight - 450);
    }
    
    if (this.actionButtons) {
      this.actionButtons.setPosition(screenWidth/2, screenHeight - 60);
    }
    
    if (this.relicInventory) {
      this.relicInventory.setPosition(screenWidth / 2, 80);
    }
    
    // Update text positions
    if (this.turnText) {
      this.turnText.setPosition(screenWidth - 200, 50);
    }
    
    if (this.actionsText) {
      this.actionsText.setPosition(screenWidth - 200, 80);
    }
    
    if (this.actionResultText) {
      this.actionResultText.setPosition(screenWidth/2, screenHeight/2);
    }
    
    // Update poker hand info button position
    if (this.pokerHandInfoButton) {
      this.pokerHandInfoButton.setPosition(screenWidth - 50, 50);
    }
    
    // Update player and enemy positions
    if (this.playerSprite) {
      this.playerSprite.setPosition(screenWidth * 0.25, screenHeight * 0.4);
    }
    
    if (this.enemySprite) {
      this.enemySprite.setPosition(screenWidth * 0.75, screenHeight * 0.4);
    }
    
    // Redraw UI elements
    this.ui.updateHandDisplay();
    this.ui.updatePlayedHandDisplay();
    this.ui.updateActionButtons();
    this.updateRelicsUI();
    this.ui.scheduleRelicInventoryUpdate(); // Schedule instead of immediate update
    this.updateTurnUI();
  }

  /**\n   * Update method for animation effects\n   */
  update(_time: number, _delta: number): void {
    // Reserved for future animations
  }
  
  /**
   * Helper method to determine if one hand type is better than another for DDA tracking
   */
  private isHandBetterThan(newHand: HandType, currentBest: HandType): boolean {
    const handRanking: Record<HandType, number> = {
      "high_card": 1,
      "pair": 2,
      "two_pair": 3,
      "three_of_a_kind": 4,
      "straight": 5,
      "flush": 6,
      "full_house": 7,
      "four_of_a_kind": 8,
      "five_of_a_kind": 9,
      "straight_flush": 10,
      "royal_flush": 11,
    };
    
    return handRanking[newHand] > handRanking[currentBest];
  }
  
  /**
   * Convert hand type to quality score for DDA analysis
   */
  private getHandQualityScore(handType: HandType): number {
    const handRanking: Record<HandType, number> = {
      "high_card": 1,
      "pair": 2,
      "two_pair": 3,
      "three_of_a_kind": 4,
      "straight": 5,
      "flush": 6,
      "full_house": 7,
      "four_of_a_kind": 8,
      "five_of_a_kind": 9,
      "straight_flush": 10,
      "royal_flush": 11,
    };
    
    return handRanking[handType] / 11; // Normalize to 0-1 scale
  }
  /**
   * Show Prologue-style relic tooltip
   */
  private showRelicTooltip(name: string, x: number, y: number): void {
    // Clean up any existing tooltip
    this.hideRelicTooltip();
    
    const tooltip = this.add.container(x, y);
    tooltip.name = 'relicTooltip';
    
    // Calculate text width for dynamic sizing
    const textWidth = name.length * 7;
    const paddingX = 16;
    const paddingY = 12;
    const tooltipWidth = textWidth + paddingX;
    const tooltipHeight = 24 + paddingY;
    
    // Prologue-style double border design
    const outerBorder = this.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
    
    // Prologue-style text
    const text = this.add.text(0, 0, name, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    tooltip.add([outerBorder, innerBorder, bg, text]);
    
    // Prologue-style entrance animation
    tooltip.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: tooltip,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });
    
    this.currentRelicTooltip = tooltip;
  }
  
  /**
   * Hide the current relic tooltip
   */
  private hideRelicTooltip(): void {
    if (this.currentRelicTooltip && this.currentRelicTooltip.active) {
      this.tweens.killTweensOf(this.currentRelicTooltip);
      this.currentRelicTooltip.destroy();
      this.currentRelicTooltip = null;
    }
  }
  
  /**
   * Show detailed relic description modal on click
   */
  private showRelicDetailModal(relic: { id: string; name: string; description: string; emoji: string }): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create modal overlay
    const overlay = this.add.container(screenWidth / 2, screenHeight / 2);
    overlay.name = 'relicDetailModal';
    
    // Dark background overlay
    const darkBg = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7);
    darkBg.setInteractive();
    
    // Modal panel with Prologue styling
    const modalWidth = Math.min(400, screenWidth - 40);
    const modalHeight = Math.min(250, screenHeight - 40);
    
    // Prologue-style double border design
    const outerBorder = this.add.rectangle(0, 0, modalWidth + 8, modalHeight + 8, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, modalWidth, modalHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const modalBg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x150E10);
    
    // Relic emoji/icon at the top
    const relicIcon = this.add.text(0, -modalHeight/2 + 40, relic.emoji, {
      fontSize: 32,
      align: "center"
    }).setOrigin(0.5);
    
    // Relic name
    const nameText = this.add.text(0, -modalHeight/2 + 80, relic.name, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    // Relic description with word wrap
    const descText = this.add.text(0, -modalHeight/2 + 120, relic.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C",
      align: "center",
      wordWrap: { width: modalWidth - 40 }
    }).setOrigin(0.5);
    
    // Close button with Prologue styling
    const closeButton = this.add.container(0, modalHeight/2 - 30);
    const closeButtonWidth = 100;
    const closeButtonHeight = 35;
    
    const closeOuterBorder = this.add.rectangle(0, 0, closeButtonWidth + 8, closeButtonHeight + 8, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const closeInnerBorder = this.add.rectangle(0, 0, closeButtonWidth, closeButtonHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const closeBg = this.add.rectangle(0, 0, closeButtonWidth, closeButtonHeight, 0x150E10);
    const closeText = this.add.text(0, 0, "Close", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C"
    }).setOrigin(0.5);
    
    closeButton.add([closeOuterBorder, closeInnerBorder, closeBg, closeText]);
    closeButton.setInteractive(new Phaser.Geom.Rectangle(-closeButtonWidth/2, -closeButtonHeight/2, closeButtonWidth, closeButtonHeight), Phaser.Geom.Rectangle.Contains);
    
    // Prologue-style hover effects for close button
    closeButton.on('pointerover', () => {
      closeBg.setFillStyle(0x1f1410); // Prologue hover color
      this.tweens.add({
        targets: closeButton,
        scale: 1.05,
        duration: 200,
        ease: 'Power2.easeOut'
      });
    });
    
    closeButton.on('pointerout', () => {
      closeBg.setFillStyle(0x150E10); // Prologue normal color
      this.tweens.add({
        targets: closeButton,
        scale: 1,
        duration: 200,
        ease: 'Power2.easeOut'
      });
    });
    
    // Add all elements to overlay
    overlay.add([darkBg, outerBorder, innerBorder, modalBg, relicIcon, nameText, descText, closeButton]);
    
    // Prologue-style entrance animation
    overlay.setAlpha(0);
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 400,
      ease: 'Power2.easeOut'
    });
    
    // Close handlers
    const closeModal = () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: 200,
        ease: 'Power2.easeOut',
        onComplete: () => {
          overlay.destroy();
        }
      });
    };
    
    darkBg.on('pointerdown', closeModal);
    closeButton.on('pointerdown', closeModal);
  }

  /**
  /**
   * Hide all UI elements during special attack for cinematic effect
   */
  private hideUIForSpecialAttack(): void {
    // Hide card-related UI
    if (this.handContainer) this.handContainer.setVisible(false);
    if (this.playedHandContainer) this.playedHandContainer.setVisible(false);
    if (this.actionButtons) this.actionButtons.setVisible(false);
    
    // Hide deck and discard piles
    if (this.deckSprite) this.deckSprite.setVisible(false);
    if (this.discardPileSprite) this.discardPileSprite.setVisible(false);
    
    // Hide status containers
    if (this.playerStatusContainer) this.playerStatusContainer.setVisible(false);
    if (this.enemyStatusContainer) this.enemyStatusContainer.setVisible(false);
    
    // Hide relics and other UI elements
    if (this.relicsContainer) this.relicsContainer.setVisible(false);
    if (this.pokerHandInfoButton) this.pokerHandInfoButton.setVisible(false);
    
    // Hide text elements
    if (this.turnText) this.turnText.setVisible(false);
    if (this.actionsText) this.actionsText.setVisible(false);
    if (this.handEvaluationText) this.handEvaluationText.setVisible(false);
    if (this.enemyIntentText) this.enemyIntentText.setVisible(false);
    if (this.actionResultText) this.actionResultText.setVisible(false);
    if (this.enemyAttackPreviewText) this.enemyAttackPreviewText.setVisible(false);
  }

  /**
   * Restore all UI elements after special attack sequence
   */
  private restoreUIAfterSpecialAttack(): void {
    // Restore card-related UI
    if (this.handContainer) this.handContainer.setVisible(true);
    if (this.playedHandContainer) this.playedHandContainer.setVisible(true);
    if (this.actionButtons) this.actionButtons.setVisible(true);
    
    // Restore deck and discard piles
    if (this.deckSprite) this.deckSprite.setVisible(true);
    if (this.discardPileSprite) this.discardPileSprite.setVisible(true);
    
    // Restore status containers
    if (this.playerStatusContainer) this.playerStatusContainer.setVisible(true);
    if (this.enemyStatusContainer) this.enemyStatusContainer.setVisible(true);
    
    // Restore relics and other UI elements
    if (this.relicsContainer) this.relicsContainer.setVisible(true);
    if (this.pokerHandInfoButton) this.pokerHandInfoButton.setVisible(true);
    
    // Restore text elements
    if (this.turnText) this.turnText.setVisible(true);
    if (this.actionsText) this.actionsText.setVisible(true);
    if (this.handEvaluationText) this.handEvaluationText.setVisible(true);
    if (this.enemyIntentText) this.enemyIntentText.setVisible(true);
    if (this.actionResultText) this.actionResultText.setVisible(true);
    if (this.enemyAttackPreviewText) this.enemyAttackPreviewText.setVisible(true);
  }

  /**
   * Resume method called when scene is resumed (e.g., after returning from Shop)
   */
  public resume(): void {
    console.log("Combat scene resumed - refreshing UI");
    
    // Refresh relic inventory to show any new items purchased
    if (this.ui && this.ui.forceRelicInventoryUpdate) {
      this.ui.forceRelicInventoryUpdate();
    }
    
    // Update all UI elements
    this.updateTurnUI();
    this.ui?.updatePlayerUI();
    this.ui?.updateEnemyUI();
    this.ui?.updateActionButtons();
  }
}

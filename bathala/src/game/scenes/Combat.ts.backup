import { Scene } from "phaser";
import {
  CombatState,
  Player,
  Enemy,
  PlayingCard,
  Suit,
  HonorRange,
  CreatureDialogue,
  PostCombatReward,
  Landas,
  HandType,
  StatusEffect,
} from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { HandEvaluator } from "../../utils/HandEvaluator";
import { GameState } from "../../core/managers/GameState";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { CombatMetrics } from "../../core/dda/DDATypes";
import {
  getRandomCommonEnemy,
  getRandomEliteEnemy,
  getBossEnemy,
} from "../../data/enemies/Act1Enemies";
import { ENEMY_LORE_DATA, EnemyLore } from "../../data/lore/EnemyLore";
import { POKER_HAND_LIST, PokerHandInfo } from "../../data/poker/PokerHandReference";
import { RelicManager } from "../../core/managers/RelicManager";
import { CombatUI } from "./combat/CombatUI";

/**
 * Combat Scene - Main card-based combat with Slay the Spire style UI
 * Player on left, enemy on right, cards at bottom
 */
export class Combat extends Scene {
  public ui!: CombatUI;
  private combatState!: CombatState;
  private playerHealthText!: Phaser.GameObjects.Text;
  private playerBlockText!: Phaser.GameObjects.Text;
  private enemyHealthText!: Phaser.GameObjects.Text;
  private enemyBlockText!: Phaser.GameObjects.Text;
  private enemyIntentText!: Phaser.GameObjects.Text;
  private handContainer!: Phaser.GameObjects.Container;
  private playedHandContainer!: Phaser.GameObjects.Container;
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private playedCardSprites: Phaser.GameObjects.Container[] = [];
  private selectedCards: PlayingCard[] = [];
  private actionButtons!: Phaser.GameObjects.Container;
  private turnText!: Phaser.GameObjects.Text;
  private discardsUsedThisTurn: number = 0;
  private maxDiscardsPerTurn: number = 1;
  private actionsText!: Phaser.GameObjects.Text;
  private handIndicatorText!: Phaser.GameObjects.Text;
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
  
  // DDA tracking properties
  private dda!: RuleBasedDDA;
  private combatStartTime!: number;
  private initialPlayerHealth!: number;
  private totalDiscardsUsed: number = 0;
  
  // UI properties
  private playerShadow!: Phaser.GameObjects.Graphics;
  private enemyShadow!: Phaser.GameObjects.Graphics;
  private handEvaluationText!: Phaser.GameObjects.Text;
  private relicInventory!: Phaser.GameObjects.Container;
  private currentRelicTooltip!: Phaser.GameObjects.Container | null;
  private pokerHandInfoButton!: Phaser.GameObjects.Container;

  // DDA Debug UI
  private ddaDebugContainer!: Phaser.GameObjects.Container | null;
  private ddaDebugVisible: boolean = false;

  // Post-combat dialogue system
  private creatureDialogues: Record<string, CreatureDialogue> = {
    tikbalang_scout: {
      name: "Tikbalang Scout",
      spareDialogue: "Hah! You show mercy to a forest guardian turned to shadow? Once I guided lost souls to safety, but now... now I lead them astray. Still, your compassion awakens something deep in me. Take this blessing of sure footing.",
      killDialogue: "My essence... it feeds the darkness you call shadow. You've only made the forest more treacherous, traveler!",
      spareReward: { ginto: 45, diamante: 0, healthHealing: 8, bonusEffect: "Sure footing" },
      killReward: { ginto: 70, diamante: 1, healthHealing: 0, bonusEffect: "Deceptive paths" },
    },
    balete_wraith: {
      name: "Balete Wraith",
      spareDialogue: "These roots once held sacred conversations between anito and Bathala, but the engkanto's lies... they poisoned our very essence. Spare me, and I'll grant you the wisdom of the sacred grove.",
      killDialogue: "My spirit feeds the impostor's power! The forest remembers your violence, traveler!",
      spareReward: { ginto: 45, diamante: 0, healthHealing: 8, bonusEffect: "Sacred grove wisdom" },
      killReward: { ginto: 70, diamante: 1, healthHealing: 0, bonusEffect: "Cursed bark" },
    },
    sigbin_charger: {
      name: "Sigbin Charger",
      spareDialogue: "We once served Bathala faithfully, our hearts pure and our purpose noble. But the false god's whispers... they corrupted us. If you spare me, I'll share the secret of the night paths.",
      killDialogue: "Take my power, but beware—darkness flows to the one who commands shadows!",
      spareReward: { ginto: 55, diamante: 0, healthHealing: 7, bonusEffect: "Night path secrets" },
      killReward: { ginto: 80, diamante: 1, healthHealing: 0, bonusEffect: "Heart of shadow" },
    },
    duwende_trickster: {
      name: "Duwende Trickster",
      spareDialogue: "You have the eyes of one who sees beyond surface, mortal. We are indeed spirits of great power, though the engkanto's web has twisted our nature. Accept this gift of hidden sight.",
      killDialogue: "My tricks scatter to the wind, but the forest remembers! Your ruthlessness feeds the impostor's growing strength!",
      spareReward: { ginto: 40, diamante: 0, healthHealing: 5, bonusEffect: "Hidden sight" },
      killReward: { ginto: 60, diamante: 1, healthHealing: 0, bonusEffect: "Mischievous whispers" },
    },
    tiyanak_ambusher: {
      name: "Tiyanak Ambusher",
      spareDialogue: "Innocent? Yes, once I was just a babe lost between realms... but the false god's corruption runs deep. Your mercy stirs something in my cursed heart. Take this blessing of true sight.",
      killDialogue: "You strike at innocence, but know this—your violence feeds the shadow that corrupts all!",
      spareReward: { ginto: 35, diamante: 0, healthHealing: 15, bonusEffect: "True sight" },
      killReward: { ginto: 55, diamante: 1, healthHealing: 0, bonusEffect: "Crying echo" },
    },
    amomongo: {
      name: "Amomongo",
      spareDialogue: "My claws once only defended the mountain folk from true threats. The engkanto's poison has changed my purpose. Your mercy awakens old memories. Take this strength.",
      killDialogue: "My bones may break, but the shadow grows stronger with each soul you destroy!",
      spareReward: { ginto: 45, diamante: 0, healthHealing: 8, bonusEffect: "Primal strength" },
      killReward: { ginto: 70, diamante: 1, healthHealing: 0, bonusEffect: "Bleeding claws" },
    },
    bungisngis: {
      name: "Bungisngis",
      spareDialogue: "Ha ha ha! You have the spirit of a true mountain dweller! Once we laughed with joy, not malice. Take this gift of hearty laughter to protect you.",
      killDialogue: "My laughter dies, but the echo haunts... and the shadow grows stronger!",
      spareReward: { ginto: 45, diamante: 0, healthHealing: 8, bonusEffect: "Joyful resilience" },
      killReward: { ginto: 70, diamante: 1, healthHealing: 0, bonusEffect: "Maddening laughter" },
    },
    kapre_shade: {
      name: "Kapre Shade",
      spareDialogue: "In my tree, I once smoked in peace, guardian of the forest paths. The false god's corruption has made me a shadow of my former self. Your mercy stirs the old honor. Take this blessing of forest protection.",
      killDialogue: "Burn me down, but the smoke carries the impostor's whispers! Your violence only feeds the growing shadow!",
      spareReward: { ginto: 80, diamante: 1, healthHealing: 20, bonusEffect: "Forest protection" },
      killReward: { ginto: 120, diamante: 2, healthHealing: 0, bonusEffect: "Smoke whispers" },
    },
    tawong_lipod: {
      name: "Tawong Lipod",
      spareDialogue: "Ah... you move with the wind's understanding. We once brought harmony to the Bikol lands, before the false god's lies. Accept this gift of swift movement and hidden sight.",
      killDialogue: "You cannot scatter what has no form! The wind remembers your violence, and it feeds the impostor's power!",
      spareReward: { ginto: 80, diamante: 1, healthHealing: 20, bonusEffect: "Wind's grace" },
      killReward: { ginto: 120, diamante: 2, healthHealing: 0, bonusEffect: "Air superiority" },
    },
    mangangaway: {
      name: "Mangangaway",
      spareDialogue: "Wise traveler... you see through my curses to the spirit beneath. I was once a healer, a protector of the people. Take this gift of protection against the false god's influence.",
      killDialogue: "My curses may end, but the shadow you serve grows stronger! Your power feeds the impostor's corruption!",
      spareReward: { ginto: 150, diamante: 3, healthHealing: 30, bonusEffect: "Hex protection" },
      killReward: { ginto: 200, diamante: 5, healthHealing: 0, bonusEffect: "Curse mastery" },
    },
  };

  constructor() {
    super({ key: "Combat" });
    this.battleStartDialogueContainer = null;
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

  public getIsDrawingCards(): boolean {
    return this.isDrawingCards;
  }

  public getIsActionProcessing(): boolean {
    return this.isActionProcessing;
  }

  create(data: { nodeType: string, transitionOverlay?: any }): void {
    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }
    
    // Add forest background
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "forest_bg");
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Add 50% opacity overlay with #150E10 to dim the background (Prologue style)
    const overlay = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 0x150E10).setAlpha(0.50);

    // Initialize combat state
    this.initializeCombat(data.nodeType);

    // Initialize CombatUI
    this.ui = new CombatUI(this);
    this.ui.initialize();

    // Create UI elements
    this.createCombatUI();
    
    // Create relic inventory
    this.createRelicInventory();
    
    // Create deck sprite
    this.createDeckSprite();
    
    // Create discard pile sprite
    this.createDiscardSprite();

    // Create deck and discard views
    this.createDeckView();
    this.createDiscardView();
    
    // Create DDA debug overlay
    this.createDDADebugOverlay();

    // Draw initial hand
    this.drawInitialHand();

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
            this.showBattleStartDialogue();
          });
        }
      });
    } else {
      // No transition overlay, start player turn immediately
      this.startPlayerTurn();
      // Show start of battle dialogue
      this.time.delayedCall(100, () => {
        this.showBattleStartDialogue();
      });
    }

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  /**
   * Show Prologue-style dialogue at start of battle
   */
  private showBattleStartDialogue(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(5000);
    
    // Create dialogue container positioned at center like Prologue
    const dialogueContainer = this.add.container(screenWidth / 2, screenHeight / 2);
    
    // Double border design with Prologue colors
    const outerBorder = this.add.rectangle(0, 0, screenWidth * 0.8 + 8, 128, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, screenWidth * 0.8, 120, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, screenWidth * 0.8, 120, 0x150E10).setInteractive();
    
    // Create dialogue text with Prologue styling
    const dialogueText = this.add.text(
      0,
      0,
      `A wild ${this.combatState.enemy.name} appears!`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 22,
        color: "#77888C",
        align: "center",
        wordWrap: { width: screenWidth * 0.75 }
      }
    ).setOrigin(0.5);
    
    // Create continue indicator with Prologue styling
    const continueIndicator = this.add.text(
      (screenWidth * 0.8)/2 - 40,
      (120)/2 - 20,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#77888C"
      }
    ).setOrigin(0.5).setVisible(true);
    
    dialogueContainer.add([outerBorder, innerBorder, bg, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(5001);
    
    // Create main container for all dialogue elements
    this.battleStartDialogueContainer = this.add.container(0, 0, [
      overlay,
      dialogueContainer
    ]).setScrollFactor(0).setDepth(5000);
    
    // Prologue-style fade in animation
    dialogueContainer.setAlpha(0);
    this.tweens.add({ 
      targets: dialogueContainer, 
      alpha: 1, 
      duration: 400, 
      ease: 'Power2' 
    });
    
    // Add blinking animation to the continue indicator (Prologue style)
    this.tweens.add({ 
      targets: continueIndicator, 
      y: '+=8', 
      duration: 600, 
      yoyo: true, 
      repeat: -1, 
      ease: 'Sine.easeInOut' 
    });
    
    // Add click handler with Prologue-style transition
    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: dialogueContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (this.battleStartDialogueContainer) {
            this.battleStartDialogueContainer.destroy();
            this.battleStartDialogueContainer = null;
            
            // Show enemy dialogue after player dialogue is removed
            this.time.delayedCall(100, () => {
              this.showEnemyDialogue();
            });
          }
        }
      });
    });
  }

  /**
   * Show Prologue-style enemy dialogue at top of screen
   */
  private showEnemyDialogue(): void {
    const screenWidth = this.cameras.main.width;
    
    // Create dialogue container positioned at top like a speech bubble
    const dialogueContainer = this.add.container(screenWidth / 2, 120);
    
    const enemyName = this.combatState.enemy.name;
    const enemySpriteKey = this.getEnemySpriteKey(enemyName);
    
    // Double border design with Prologue colors (smaller for enemy dialogue)
    const outerBorder = this.add.rectangle(0, 0, screenWidth * 0.8 + 8, 108, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, screenWidth * 0.8, 100, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, screenWidth * 0.8, 100, 0x150E10).setInteractive();
    
    // Create enemy icon with combat sprite if available
    let enemyIcon: Phaser.GameObjects.Sprite | null = null;
    if (this.textures.exists(enemySpriteKey)) {
      enemyIcon = this.add.sprite(
        -(screenWidth * 0.8 / 2) + 35,
        0,
        enemySpriteKey
      ).setScale(0.8).setDepth(5002);
    }
    
    // Create enemy name text with Prologue styling
    const enemyNameText = this.add.text(
      -(screenWidth * 0.8 / 2) + 70,
      -30,
      this.combatState.enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "left"
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Create enemy dialogue text with Prologue styling
    const enemyDialogueText = this.add.text(
      -(screenWidth * 0.8 / 2) + 70,
      -5,
      this.getBattleStartDialogue ? this.getBattleStartDialogue() : this.getEnemyDialogue(),
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
        align: "left",
        wordWrap: { width: screenWidth * 0.8 - 90 }
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Create continue indicator with Prologue styling
    const continueIndicator = this.add.text(
      (screenWidth * 0.8)/2 - 40,
      (100)/2 - 20,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C"
      }
    ).setOrigin(0.5).setDepth(5002);
    
    const containerChildren = [
      outerBorder,
      innerBorder,
      bg,
      enemyIcon,
      enemyNameText,
      enemyDialogueText,
      continueIndicator
    ].filter(child => child !== null);

    dialogueContainer.add(containerChildren);
    dialogueContainer.setScrollFactor(0).setDepth(5000);
    
    // Prologue-style fade in animation
    dialogueContainer.setAlpha(0);
    this.tweens.add({ 
      targets: dialogueContainer, 
      alpha: 1, 
      duration: 400, 
      ease: 'Power2' 
    });
    
    // Add Prologue-style blinking animation to the continue indicator
    this.tweens.add({ 
      targets: continueIndicator, 
      y: '+=8', 
      duration: 600, 
      yoyo: true, 
      repeat: -1, 
      ease: 'Sine.easeInOut' 
    });
    
    // Add click handler with Prologue-style transition
    bg.on('pointerdown', () => {
      this.tweens.add({
        targets: dialogueContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          dialogueContainer.destroy();
        }
      });
    });
  }

  /**
   * Get enemy dialogue based on enemy type
   */
  private getEnemyDialogue(): string {
    const enemyName = this.combatState.enemy.name.toLowerCase();
    
    if (enemyName.includes("tikbalang")) return "Lost in my paths, seer? False one’s whispers guide!";
    if (enemyName.includes("balete")) return "Roots entwine your fate!";
    if (enemyName.includes("sigbin")) return "Charge for shadow throne!";
    if (enemyName.includes("duwende")) return "Tricks abound in mounds!";
    if (enemyName.includes("tiyanak")) return "Wails lure to doom!";
    if (enemyName.includes("amomongo")) return "Nails rend unworthy!";
    if (enemyName.includes("bungisngis")) return "Laughter masks rage!";
    if (enemyName.includes("kapre")) return "Smoke veils my wrath!";
    if (enemyName.includes("tawong lipod")) return "Winds conceal—feel fury!";
    if (enemyName.includes("mangangaway")) return "Fates reverse at my command!";
    
    // Default dialogue
    return "You have encountered a fearsome creature! Prepare for battle!";
  }



  /**
   * Initialize combat state with player and enemy
   */
  private initializeCombat(nodeType: string): void {
    // Get existing player data from GameState or create new player if none exists
    const gameState = GameState.getInstance();
    const existingPlayerData = gameState.getPlayerData();
    
    let player: Player;
    
    if (existingPlayerData && Object.keys(existingPlayerData).length > 0) {
      // Use existing player data and ensure all required fields are present
      player = {
        id: existingPlayerData.id || "player",
        name: existingPlayerData.name || "Hero",
        maxHealth: existingPlayerData.maxHealth || 80,
        currentHealth: existingPlayerData.currentHealth || 80,
        block: 0, // Always reset block at start of combat
        statusEffects: [], // Always reset status effects at start of combat
        hand: [], // Will be populated below
        deck: existingPlayerData.deck || DeckManager.createFullDeck(),
        discardPile: existingPlayerData.discardPile || [],
        drawPile: existingPlayerData.drawPile || [],
        playedHand: [],
        landasScore: existingPlayerData.landasScore || 0,
        ginto: existingPlayerData.ginto || 100,
        diamante: existingPlayerData.diamante || 0,
        relics: existingPlayerData.relics || [
          {
            id: "placeholder_relic",
            name: "Placeholder Relic",
            description: "This is a placeholder relic.",
            emoji: "",
          },
        ],
        potions: existingPlayerData.potions || [],
        discardCharges: existingPlayerData.discardCharges || 1,
        maxDiscardCharges: existingPlayerData.maxDiscardCharges || 1,
      };
      
      // If the deck is in discard pile, shuffle it back to draw pile
      if (player.drawPile.length === 0 && player.discardPile.length > 0) {
        player.drawPile = DeckManager.shuffleDeck([...player.discardPile]);
        player.discardPile = [];
      }
      
      // If we still don't have enough cards, create a new deck
      if (player.drawPile.length === 0) {
        const newDeck = DeckManager.createFullDeck();
        player.drawPile = DeckManager.shuffleDeck(newDeck);
        player.discardPile = [];
      }
    } else {
      // Create new player for first combat
      const deck = DeckManager.createFullDeck();
      player = {
        id: "player",
        name: "Hero",
        maxHealth: 80,
        currentHealth: 80,
        block: 0,
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
          {
            id: "placeholder_relic",
            name: "Placeholder Relic",
            description: "This is a placeholder relic.",
            emoji: "",
          },
        ],
        potions: [],
        discardCharges: 1,
        maxDiscardCharges: 1,
      };
    }

    // Draw initial hand (8 cards)
    const { drawnCards, remainingDeck } = DeckManager.drawCards(player.drawPile, 8);
    player.hand = drawnCards;
    player.drawPile = remainingDeck;

    // Get enemy based on node type from the data passed to the scene
    const enemyData = this.getEnemyForNodeType(nodeType);
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
    
    // Initialize DDA tracking if available
    try {
      this.dda = RuleBasedDDA.getInstance();
      this.combatStartTime = Date.now();
      this.initialPlayerHealth = player.currentHealth;
      this.totalDiscardsUsed = 0;
      
      // Apply current DDA difficulty adjustments to enemy
      const adjustment = this.dda.getCurrentDifficultyAdjustment();
      console.log("DDA Adjustment:", {
        tier: adjustment.tier,
        healthMultiplier: adjustment.enemyHealthMultiplier,
        damageMultiplier: adjustment.enemyDamageMultiplier,
        originalDamage: this.combatState.enemy.damage,
        originalHealth: this.combatState.enemy.maxHealth
      });
      
      this.combatState.enemy.maxHealth = Math.round(this.combatState.enemy.maxHealth * adjustment.enemyHealthMultiplier);
      this.combatState.enemy.currentHealth = this.combatState.enemy.maxHealth;
      this.combatState.enemy.damage = Math.round(this.combatState.enemy.damage * adjustment.enemyDamageMultiplier);
      
      console.log("DDA Applied:", {
        newDamage: this.combatState.enemy.damage,
        newHealth: this.combatState.enemy.maxHealth
      });
      
      // Update initial intent to reflect DDA-modified damage
      if (this.combatState.enemy.intent.type === "attack") {
        this.combatState.enemy.intent.value = this.combatState.enemy.damage;
        this.combatState.enemy.intent.description = `Attacks for ${this.combatState.enemy.damage} damage`;
      }
    } catch (error) {
      console.warn("DDA not available, skipping DDA initialization:", error);
    }
    
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
   * Generate unique enemy ID
   */
  private generateEnemyId(enemyName: string): string {
    return enemyName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  }

  private getEnemySpriteKey(enemyName: string): string {
    const lowerCaseName = enemyName.toLowerCase();
    
    // Map enemy names to combat sprite keys
    if (lowerCaseName.includes("tikbalang")) return "tikbalang_combat";
    if (lowerCaseName.includes("balete")) return "balete_combat";
    if (lowerCaseName.includes("sigbin")) return "sigbin_combat";
    if (lowerCaseName.includes("duwende")) return "duwende_combat";
    if (lowerCaseName.includes("tiyanak")) return "tiyanak_combat";
    if (lowerCaseName.includes("amomongo")) return "amomongo_combat";
    if (lowerCaseName.includes("bungisngis")) return "bungisngis_combat";
    if (lowerCaseName.includes("kapre")) return "kapre_combat";
    if (lowerCaseName.includes("tawong lipod") || lowerCaseName.includes("tawonglipod")) return "tawonglipod_combat";
    if (lowerCaseName.includes("mangangaway")) return "mangangaway_combat";
    
    // Fallback for any other case - use available combat sprites
    const spriteOptions = ["balete_combat", "sigbin_combat", "tikbalang_combat", "duwende_combat"];
    const randomIndex = Math.floor(Math.random() * spriteOptions.length);
    return spriteOptions[randomIndex];
  }

  /**
   * Create the combat UI layout
   */
  private createCombatUI(): void {
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Title
    this.add
      .text(screenWidth/2, 30, "Combat - Forest Encounter", {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Player section (left side)
    this.createPlayerUI();

    // Enemy section (right side)
    this.createEnemyUI();

    // Card hand area (bottom)
    this.createHandUI();

    // Played hand area (center)
    this.createPlayedHandUI();

    // Action buttons
    this.createActionButtons();

    // Damage preview
    this.createDamagePreview();

    // Turn display
    this.createTurnUI();

    // Relics display
    this.createRelicsUI();

    // Action result display
    this.createActionResultUI();
  }

  /**
   * Create player UI elements
   */
  private createPlayerUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const playerX = screenWidth * 0.25; // 25% from left
    const playerY = screenHeight * 0.4; // 40% from top

    // Create player shadow circle
    this.playerShadow = this.add.graphics();
    this.playerShadow.fillStyle(0x000000, 0.3); // Black with 30% opacity
    this.playerShadow.fillEllipse(playerX, playerY + 60, 80, 20); // Oval shadow below player

    // Player sprite with idle animation
    this.playerSprite = this.add.sprite(playerX, playerY, "combat_player");
    this.playerSprite.setScale(2); // Scale up from 32x64 to 64x128
    this.playerSprite.setFlipX(true); // Flip to face right (toward enemy)

    // Try to play animation, fallback if it fails
    try {
      this.playerSprite.play("player_idle");
    } catch (error) {
      console.warn("Player idle animation not found, using static sprite");
    }

    // Player name with Prologue styling
    this.add
      .text(playerX, playerY - 120, this.combatState.player.name, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C", // Use Prologue's text color
        align: "center",
        stroke: "#150E10",
        strokeThickness: 1
      })
      .setOrigin(0.5);

    // Health display with better spacing
    this.playerHealthText = this.add
      .text(playerX, playerY + 85, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ff6b6b",
        align: "center",
        stroke: "#000000",
        strokeThickness: 1
      })
      .setOrigin(0.5);

    // Block display with improved spacing
    this.playerBlockText = this.add
      .text(playerX, playerY + 110, "", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#4ecdc4",
        align: "center",
        stroke: "#000000",
        strokeThickness: 1
      })
      .setOrigin(0.5);

    this.playerStatusContainer = this.add.container(playerX, playerY + 140);

    this.updatePlayerUI();
  }

  /**
   * Create enemy UI elements
   */
  private createEnemyUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const enemyX = screenWidth * 0.75; // 75% from left
    const enemyY = screenHeight * 0.4; // 40% from top
    
    // Create enemy shadow circle
    this.enemyShadow = this.add.graphics();
    this.enemyShadow.fillStyle(0x000000, 0.3); // Black with 30% opacity
    this.enemyShadow.fillEllipse(enemyX, enemyY + 90, 120, 30); // Larger oval shadow below enemy

    const enemyName = this.combatState.enemy.name;
    const enemySpriteKey = this.getEnemySpriteKey(enemyName);
    const enemyAnimationKey = `${enemySpriteKey}_idle`;

    // Enemy sprite with idle animation
    this.enemySprite = this.add.sprite(enemyX, enemyY, enemySpriteKey);

    // Scale the sprite to fit within a 250x250 box while maintaining aspect ratio
    const sprite = this.enemySprite;
    const targetWidth = 250;
    const targetHeight = 250;
    const scale = Math.min(targetWidth / sprite.width, targetHeight / sprite.height);
    sprite.setScale(scale);



    // Enemy name with Prologue styling and better spacing
    this.add
      .text(enemyX, enemyY - 180, this.combatState.enemy.name, {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C", // Use Prologue's text color
        align: "center",
        stroke: "#150E10",
        strokeThickness: 2
      })
      .setOrigin(0.5);

    // Health display with improved spacing and stroke
    this.enemyHealthText = this.add
      .text(enemyX, enemyY - 150, "", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#ff6b6b",
        align: "center",
        stroke: "#000000",
        strokeThickness: 2
      })
      .setOrigin(0.5);

    // Block display with improved spacing and stroke
    this.enemyBlockText = this.add
      .text(enemyX, enemyY - 120, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#4ecdc4",
        align: "center",
        stroke: "#000000",
        strokeThickness: 1
      })
      .setOrigin(0.5);

    // Intent display with better spacing
    this.enemyIntentText = this.add
      .text(enemyX, enemyY + 180, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#feca57",
        align: "center",
        wordWrap: { width: 200 },
        stroke: "#000000",
        strokeThickness: 1
      })
      .setOrigin(0.5);

    // Status effects container with improved spacing
    this.enemyStatusContainer = this.add.container(enemyX, enemyY + 210);

    // Information button for enemy lore
    this.createEnemyInfoButton(enemyX, enemyY - 200);

    // Update the health and block text
    this.updateEnemyUI();
  }

  /**
   * Create hand UI container
   */
  private createHandUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    // Position hand container higher to avoid overlap with buttons
    this.handContainer = this.add.container(screenWidth/2, screenHeight - 240);
    
    // Create selection counter text well above the cards (Balatro style)
    // Position at -140 so it's above even when cards are elevated by 40px when selected
    this.selectionCounterText = this.add.text(0, -140, "Selected: 0/5", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#ffdd44",
      align: "center"
    }).setOrigin(0.5);
    
    this.handContainer.add(this.selectionCounterText);
    this.updateHandDisplay();
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
   * Create action buttons
   */
  private createActionButtons(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    // Position buttons below the cards
    this.actionButtons = this.add.container(screenWidth/2, screenHeight - 100);
    this.updateActionButtons();
  }

  /**
   * Update action buttons based on current phase
   */
  private updateActionButtons(): void {
    // Safety check: Don't update if scene is being destroyed or doesn't exist
    if (!this.sys || !this.sys.isActive() || this.combatEnded) {
      return;
    }

    // Clear existing buttons
    this.actionButtons.removeAll(true);

    const screenWidth = this.cameras.main.width;
    const baseSpacing = 240; // Increased from 190 for better button separation
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const adjustedSpacing = baseSpacing * scaleFactor;

    if (this.combatState.phase === "player_turn") {
      // Card selection phase - Balatro-style layout with grouped sort buttons
      
      // Play Hand button on the left
      const playButton = this.createButton(-adjustedSpacing * 1.2, 0, "Play Hand", () => {
        this.playSelectedCards();
      });

      // Sort Hand grouped container (center) - Balatro style
      const sortContainer = this.add.container(0, 0);
      
      // Create the grouped sort button background (double border style)
      const sortGroupWidth = 320 * scaleFactor; // Increased width for more padding
      const sortGroupHeight = 60; // Taller for more vertical padding
      
      const sortOuterBorder = this.add.rectangle(0, 0, sortGroupWidth + 8, sortGroupHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x77888C);
      const sortInnerBorder = this.add.rectangle(0, 0, sortGroupWidth, sortGroupHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const sortBg = this.add.rectangle(0, 0, sortGroupWidth, sortGroupHeight, 0x150E10);
      
      // Sort Hand label at top
      const sortLabel = this.add.text(0, -sortGroupHeight/2 - 24, "SORT", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      // Create individual sort buttons inside the group (Prologue double border style)
      const buttonWidth = 100 * scaleFactor; // Button width
      const buttonHeight = 32; // Button height
      const buttonGap = 20 * scaleFactor; // Gap between buttons
      const buttonSpacing = buttonWidth/2 + buttonGap/2;
      
      // Rank button (Prologue style - double border)
      const rankButtonContainer = this.add.container(-buttonSpacing, 0);
      const rankOuterBorder = this.add.rectangle(0, 0, buttonWidth + 6, buttonHeight + 6, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const rankInnerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const rankButtonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
      const rankButtonText = this.add.text(0, 0, "Rank", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      rankButtonContainer.add([rankOuterBorder, rankInnerBorder, rankButtonBg, rankButtonText]);
      rankButtonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Suit button (Prologue style - double border)
      const suitButtonContainer = this.add.container(buttonSpacing, 0);
      const suitOuterBorder = this.add.rectangle(0, 0, buttonWidth + 6, buttonHeight + 6, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const suitInnerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const suitButtonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
      const suitButtonText = this.add.text(0, 0, "Suit", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      suitButtonContainer.add([suitOuterBorder, suitInnerBorder, suitButtonBg, suitButtonText]);
      suitButtonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Add hover effects to rank button
      rankButtonContainer.on("pointerover", () => {
        rankButtonBg.setFillStyle(0x1f1410);
        rankButtonText.setColor("#e8eced");
      });
      rankButtonContainer.on("pointerout", () => {
        rankButtonBg.setFillStyle(0x150E10);
        rankButtonText.setColor("#77888C");
      });
      rankButtonContainer.on("pointerdown", () => {
        this.sortHand("rank");
      });
      
      // Add hover effects to suit button
      suitButtonContainer.on("pointerover", () => {
        suitButtonBg.setFillStyle(0x1f1410);
        suitButtonText.setColor("#e8eced");
      });
      suitButtonContainer.on("pointerout", () => {
        suitButtonBg.setFillStyle(0x150E10);
        suitButtonText.setColor("#77888C");
      });
      suitButtonContainer.on("pointerdown", () => {
        this.sortHand("suit");
      });
      
      sortContainer.add([
        sortOuterBorder, 
        sortInnerBorder, 
        sortBg, 
        sortLabel,
        rankButtonContainer,
        suitButtonContainer
      ]);

      // Discard button on the right
      const discardButton = this.createButton(adjustedSpacing * 1.2, 0, "Discard", () => {
        this.discardSelectedCards();
      });

      this.actionButtons.add([
        playButton,
        sortContainer,
        discardButton,
      ]);
    } else if (this.combatState.phase === "action_selection") {
      // Action selection phase - Attack/Defend/Special based on dominant suit
      const dominantSuit = this.getDominantSuit(
        this.combatState.player.playedHand
      );

      const buttonSpacing = adjustedSpacing; // Use full adjusted spacing for better separation
      const attackButton = this.createButton(-buttonSpacing, 0, "Attack", () => {
        this.executeAction("attack");
      });

      const defendButton = this.createButton(0, 0, "Defend", () => {
        this.executeAction("defend");
      });

      const specialButton = this.createButton(buttonSpacing, 0, "Special", () => {
        this.executeAction("special");
      });

      // Create Prologue-style special action tooltip
      const specialTooltipContainer = this.add.container(buttonSpacing, 30);
      const tooltipText = this.getSpecialActionName(dominantSuit);
      const tooltipWidth = Math.min(tooltipText.length * 8 + 20, 200);
      const tooltipHeight = 40;
      
      // Prologue-style double border design
      const outerBorder = this.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const innerBorder = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const bg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
      
      const specialTooltip = this.add.text(0, 0, tooltipText, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center",
        wordWrap: { width: tooltipWidth - 10 }
      }).setOrigin(0.5);
      
      specialTooltipContainer.add([outerBorder, innerBorder, bg, specialTooltip]);
      specialTooltipContainer.setVisible(false).setAlpha(0);

      specialButton.on("pointerover", () => {
        // Prologue-style fade in
        specialTooltipContainer.setVisible(true);
        this.tweens.add({
          targets: specialTooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });

      specialButton.on("pointerout", () => {
        // Prologue-style fade out
        this.tweens.add({
          targets: specialTooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2.easeOut',
          onComplete: () => {
            specialTooltipContainer.setVisible(false);
          }
        });
      });

      this.actionButtons.add([attackButton, defendButton, specialButton, specialTooltip]);
    }
    
    // Update damage preview based on current phase
    this.updateDamagePreview(this.combatState.phase === "action_selection");
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

    // Hand indicator text - shows current selected hand type
    this.handIndicatorText = this.add.text(screenWidth - 200, 110, "", {
      fontFamily: "dungeon-mode",
      color: "#4ecdc4",
    });

    // Create info button for poker hand reference
    this.createPokerHandInfoButton();

    this.updateTurnUI();
  }

  /**
   * Create poker hand info button
   */
  private createPokerHandInfoButton(): void {
    const screenWidth = this.cameras.main.width;
    
    // Create a circular button with an "i" for information
    this.pokerHandInfoButton = this.add.container(screenWidth - 50, 50);
    
    const infoButton = this.add.circle(0, 0, 20, 0x2f3542);
    infoButton.setStrokeStyle(2, 0x57606f);
    
    // Add the "i" text
    const infoText = this.add.text(0, 0, "i", {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Make the button interactive
    infoButton.setInteractive();
    
    // Add hover effects
    infoButton.on("pointerover", () => {
      infoButton.setFillStyle(0x3d4454);
    });
    
    infoButton.on("pointerout", () => {
      infoButton.setFillStyle(0x2f3542);
    });
    
    // Add click event to navigate to poker hand reference scene
    infoButton.on("pointerdown", () => {
      this.scene.launch("PokerHandReference");
    });
    
    // Also make the text interactive and link it to the same event
    infoText.setInteractive();
    infoText.on("pointerdown", () => {
      this.scene.launch("PokerHandReference");
    });
    
    this.pokerHandInfoButton.add([infoButton, infoText]);
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

  /**
   * Create relic inventory in top left corner with vignette design
   */
  private createRelicInventory(): void {
    // Create container for the inventory - positioned at top center for better accessibility
    const screenWidth = this.cameras.main.width;
    this.relicInventory = this.add.container(screenWidth / 2, 80);
    
    // Make the relic inventory visible by default
    this.relicInventory.setVisible(true);
    
    // Initialize tooltip reference
    this.currentRelicTooltip = null;
    
    // Create the main background rectangle with vignette effect
    const inventoryWidth = 400; // Optimized width for top placement
    const inventoryHeight = 80;
    
    // Main background with elegant dark theme
    const mainBg = this.add.rectangle(0, 0, inventoryWidth, inventoryHeight, 0x1a1a1a, 0.95);
    mainBg.setStrokeStyle(2, 0x8b4513, 0.8); // Bronze-like border
    
    // Inner highlight for depth
    const innerBg = this.add.rectangle(0, 0, inventoryWidth - 6, inventoryHeight - 6, 0x2a2a2a, 0.6);
    innerBg.setStrokeStyle(1, 0xcd853f, 0.5); // Light bronze highlight
    
    // Title text positioned at top left of the box
    const titleText = this.add.text(-inventoryWidth/2 + 15, -inventoryHeight/2 + 15, "RELICS", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#ffffff",
      align: "left"
    }).setOrigin(0, 0.5);
    
    // Create toggle button for showing/hiding relic inventory
    const toggleButton = this.createRelicInventoryToggle(inventoryWidth/2 - 30, -inventoryHeight/2 + 15);
    
    // Create relic slots grid (6x1 = 6 slots for horizontal layout)
    const slotSize = 30;
    const slotsPerRow = 6;
    const rows = 1;
    const slotSpacing = 45;
    
    const startX = -(slotsPerRow - 1) * slotSpacing / 2;
    const startY = 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = startX + col * slotSpacing;
        const slotY = startY + row * slotSpacing;
        
        // Create elegant slot background
        const slot = this.add.rectangle(slotX, slotY, slotSize, slotSize, 0x0f0f0f, 0.9);
        slot.setStrokeStyle(2, 0x8b4513, 0.6); // Bronze border for slots
        
        this.relicInventory.add(slot);
      }
    }
    
    // Add all elements to container
    this.relicInventory.add([mainBg, innerBg, titleText, toggleButton]);
    
    // Update with current relics
    this.updateRelicInventory();
  }

  /**
   * Create toggle button for relic inventory
   */
  private createRelicInventoryToggle(x: number, y: number): Phaser.GameObjects.Container {
    const toggleButton = this.add.container(x, y);
    
    // Button background
    const bg = this.add.rectangle(0, 0, 20, 20, 0x4a4a4a, 0.9);
    bg.setStrokeStyle(1, 0x6a6a6a);
    
    // Toggle text (eye icon)
    const toggleText = this.add.text(0, 0, "👁", {
      fontSize: 12,
      color: "#ffffff"
    }).setOrigin(0.5);
    
    toggleButton.add([bg, toggleText]);
    
    // Make button interactive
    toggleButton.setInteractive(new Phaser.Geom.Rectangle(-10, -10, 20, 20), Phaser.Geom.Rectangle.Contains);
    
    // Toggle visibility when clicked
    toggleButton.on("pointerdown", () => {
      const isVisible = this.relicInventory.visible;
      this.relicInventory.setVisible(!isVisible);
      toggleText.setText(isVisible ? "✕" : "👁");
    });
    
    // Hover effects
    toggleButton.on("pointerover", () => {
      bg.setFillStyle(0x5a5a5a, 0.9);
    });
    
    toggleButton.on("pointerout", () => {
      bg.setFillStyle(0x4a4a4a, 0.9);
    });
    
    return toggleButton;
  }

  /**
   * Update relic inventory with current relics
   */
  private updateRelicInventory(): void {
    if (!this.relicInventory) return;
    
    const relics = this.combatState.player.relics;
    const slotSize = 25;
    const slotsPerRow = 4; // Updated to match new grid
    const slotSpacing = 35;
    const startX = -(slotsPerRow - 1) * slotSpacing / 2;
    const startY = -10;
    
    // Remove existing relic displays (keep slots and background)
    this.relicInventory.list.forEach(child => {
      if ((child as any).isRelicDisplay || (child as any).isTooltip) {
        child.destroy();
      }
    });
    
    // Add current relics to slots
    relics.forEach((relic, index) => {
      if (index < 8) { // Max 8 slots now (4x2)
        const row = Math.floor(index / slotsPerRow);
        const col = index % slotsPerRow;
        const slotX = startX + col * slotSpacing;
        const slotY = startY + row * slotSpacing;
        
        // Create relic emoji/icon
        const relicIcon = this.add.text(slotX, slotY, relic.emoji || "?", {
          fontSize: 18,
          align: "center"
        }).setOrigin(0.5);
        
        // Mark as relic display for cleanup
        (relicIcon as any).isRelicDisplay = true;
        
        // Add modern hover and click interactions
        relicIcon.setInteractive();
        
        // Store reference for hover effects
        let hoverGlow: Phaser.GameObjects.Graphics | null = null;
        
        relicIcon.on("pointerover", () => {
          // Create elegant glow effect
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          hoverGlow = this.add.graphics();
          hoverGlow.lineStyle(3, 0x7c3aed, 0.8);
          hoverGlow.strokeCircle(slotX, slotY, 18);
          this.relicInventory.add(hoverGlow);
          
          // Scale up the icon slightly
          this.tweens.add({
            targets: relicIcon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          // Show elegant tooltip with relic name only
          this.showRelicTooltip(relic.name, slotX, slotY - 40);
        });
        
        relicIcon.on("pointerout", () => {
          // Remove glow effect
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          // Scale back to normal
          this.tweens.add({
            targets: relicIcon,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          // Hide tooltip
          this.hideRelicTooltip();
        });
        
        relicIcon.on("pointerdown", () => {
          // Show detailed description in a modal-style overlay
          this.showRelicDetailModal(relic);
        });
        
        this.relicInventory.add(relicIcon);
      }
    });
  }

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
    this.cardSprites.forEach((sprite) => sprite.destroy());
    this.cardSprites = [];
    
    // Animate drawing cards from deck one by one
    this.animateDrawCardsFromDeck(this.combatState.player.hand.length);
  }

  /**
   * Update hand display with a curved fanned-out arrangement (Balatro style)
   */
  private updateHandDisplay(): void {
    // Safety check: Don't update if scene is being destroyed or doesn't exist
    if (!this.sys || !this.sys.isActive() || this.combatEnded) {
      return;
    }

    // Don't update if cards are currently being drawn
    if (this.isDrawingCards) {
      return;
    }
    
    // Clear existing card sprites
    this.cardSprites.forEach((sprite) => sprite.destroy());
    this.cardSprites = [];

    const hand = this.combatState.player.hand;
    const screenWidth = this.cameras.main.width;
    
    // Balatro-style spacing - more spread out
    const cardWidth = 80; // Original size
    const cardSpacing = cardWidth * 1.2; // 120% for nice spread (more space between cards)
    const totalWidth = (hand.length - 1) * cardSpacing;
    const maxWidth = screenWidth * 0.8; // Use 80% of screen width
    
    // Scale down if needed to fit screen
    const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
    const actualSpacing = cardSpacing * scale;
    const actualTotalWidth = (hand.length - 1) * actualSpacing;
    const startX = -actualTotalWidth / 2;

    // Balatro-style arc - more pronounced curve
    const arcHeight = 30; // More noticeable arc height
    const maxRotation = 8; // Slight rotation for cards at edges (degrees)
    
    hand.forEach((card, index) => {
      // Calculate position along arc (Balatro style)
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0; // -0.5 to 0.5
      
      // X position spreads cards out evenly
      const x = startX + index * actualSpacing;
      
      // Y position creates an arc (parabola peaks in middle) - same for all cards
      const baseY = -Math.abs(normalizedPos) * arcHeight * 2; // Negative to curve upward
      
      // Rotation for cards at edges (Balatro style)
      const rotation = normalizedPos * maxRotation;
      
      // Store base position in card data
      (card as any).baseX = x;
      (card as any).baseY = baseY;
      (card as any).baseRotation = rotation;
      
      // Calculate actual Y position (elevated if selected, but keeps arc position)
      const y = card.selected ? baseY - 40 : baseY;
      
      const cardSprite = this.createCardSprite(
        card,
        x,
        y
      );
      
      // Ensure sprite position is synchronized with calculated positions
      cardSprite.setPosition(x, y);
      cardSprite.setAngle(rotation);
      
      // Set depth so cards layer properly (left to right)
      cardSprite.setDepth(card.selected ? 500 + index : 100 + index);
      
      // Apply selected state styling
      if (card.selected) {
        const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
        if (cardImage && 'setTint' in cardImage) {
          cardImage.setTint(0xffdd44); // Yellow highlight when selected
        }
      }
      
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
    });
  }

  /**
   * Create a card sprite (original size, Balatro-style interactions)
   */
  private createCardSprite(
    card: PlayingCard,
    x: number,
    y: number,
    interactive: boolean = true
  ): Phaser.GameObjects.Container {
    const cardContainer = this.add.container(0, 0);

    // Original card dimensions
    const screenWidth = this.cameras.main.width;
    const baseCardWidth = 80;  // Original size
    const baseCardHeight = 112; // Original size
    
    // Scale card size based on screen width
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const cardWidth = baseCardWidth * scaleFactor;
    const cardHeight = baseCardHeight * scaleFactor;

    // Convert card rank to sprite rank (1-13)
    const rankMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
      "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
    };
    const spriteRank = rankMap[card.rank] || "1";
    
    // Convert suit to lowercase for sprite naming
    const suitMap: Record<string, string> = {
      "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
    };
    const spriteSuit = suitMap[card.suit] || "apoy";
    
    // Create card sprite using the loaded image
    const textureKey = `card_${spriteRank}_${spriteSuit}`;
    console.log(`Trying to load card texture: ${textureKey} for card ${card.rank} of ${card.suit}`);
    let cardSprite;
    
    // Check if texture exists, fallback to generated card if not
    if (this.textures.exists(textureKey)) {
      console.log(`Card texture found: ${textureKey}`);
      cardSprite = this.add.image(0, 0, textureKey);
    } else {
      console.warn(`Card texture ${textureKey} not found, using fallback`);
      // Fallback to generated card
      cardSprite = this.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff);
      
      // Add rank text
      const rankText = this.add.text(-cardWidth/2 + 5, -cardHeight/2 + 5, card.rank, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(10 * scaleFactor),
        color: "#000000",
      }).setOrigin(0, 0);
      cardContainer.add(rankText);
      
      // Add suit symbol
      const display = DeckManager.getCardDisplay(card);
      const suitText = this.add.text(cardWidth/2 - 5, -cardHeight/2 + 5, display.symbol, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(10 * scaleFactor),
        color: display.color,
      }).setOrigin(1, 0);
      cardContainer.add(suitText);
    }
    
    cardSprite.setDisplaySize(cardWidth, cardHeight);
    
    // Add a Prologue-style border that changes when selected
    const border = this.add.rectangle(
      0,
      0,
      cardWidth + 4,
      cardHeight + 4,
      0x000000,
      0  // No fill
    );
    border.setStrokeStyle(2, 0x77888C); // Prologue border color
    border.setName('cardBorder'); // Set name for later reference
    // Only show border when card is selected
    border.setVisible(card.selected);

    cardContainer.add([cardSprite, border]);

    // Position the container
    cardContainer.setPosition(x, y);

    // Make interactive only for hand cards
    if (interactive) {
      cardContainer.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Card selection - Prologue style (simple click, no hover effects)
      cardContainer.on("pointerdown", () => this.selectCard(card));
    }

    // Store reference to card for later updates
    (cardContainer as any).cardRef = card;

    return cardContainer;
  }

  /**
   * Update the visual appearance of a card without recreating it
   */
  private updateCardVisuals(card: PlayingCard): void {
    const cardIndex = this.combatState.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1 && this.cardSprites[cardIndex]) {
      const cardSprite = this.cardSprites[cardIndex];
      
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

    card.selected = !card.selected;
    
    // Manage selectedCards array
    const selIndex = this.selectedCards.findIndex(c => c.id === card.id);
    if (card.selected && selIndex === -1 && this.selectedCards.length < 5) {
      this.selectedCards.push(card);
    } else if (selIndex > -1) {
      card.selected = false;
      this.selectedCards.splice(selIndex, 1);
    }

    // Find the card sprite to animate
    const cardIndex = this.combatState.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1 && this.cardSprites[cardIndex]) {
      const cardSprite = this.cardSprites[cardIndex];
      
      // Get the stored base position from card data (this ensures cards return to exact position)
      const baseY = (card as any).baseY || 0;
      
      // Balatro-style selection animation - only Y changes, X stays the same
      if (card.selected) {
        // Animate selection with smooth bounce
        this.tweens.add({
          targets: cardSprite,
          y: baseY - 40, // Elevate when selected
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Yellow tint for selected cards (Balatro style)
        const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
        if (cardImage && 'setTint' in cardImage) {
          cardImage.setTint(0xffdd44); // Bright yellow highlight
        }
        cardSprite.setDepth(500 + cardIndex); // Bring to front
      } else {
        // Animate deselection - return to exact base position
        this.tweens.add({
          targets: cardSprite,
          y: baseY, // Return to exact arc position
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Remove highlight
        const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
        if (cardImage && 'clearTint' in cardImage) {
          cardImage.clearTint();
        }
        cardSprite.setDepth(100 + cardIndex); // Return to normal depth
      }
    }

    // Update selection counter
    this.updateSelectionCounter();
    
    // Update card visuals without recreating all cards
    this.updateCardVisuals(card);
    this.updateHandIndicator(); // Update hand indicator when selection changes
    
    // Update damage preview if in player turn (for potential attack calculations)
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
      this.updateActionButtons();
    }
    
    // Update displays
    this.updateHandDisplay();
    this.updatePlayedHandDisplay();
    this.updateHandIndicator();
    
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

    // Update displays
    this.updateHandDisplay();
    this.updatePlayedHandDisplay();
    this.updateActionButtons();
    
    // Update damage preview for the new hand
    this.updateDamagePreview(true);
    
    // Update selection counter (should show 0/5)
    this.updateSelectionCounter();
  }

  /**
   * Sort hand by rank or suit
   */
  public sortHand(sortBy: "rank" | "suit"): void {
    // Create shuffling animation before sorting
    this.animateCardShuffle(sortBy, () => {
      // Animation handles the sorting internally
    });
  }

  /**
   * Animate card shuffling effect (Individual card tracking)
   */
  private animateCardShuffle(sortType: "rank" | "suit", onComplete: () => void): void {
    // Store the original card order to track which card goes where
    const originalCards = [...this.combatState.player.hand];
    
    // Sort the hand data to get the new order
    const sortedCards = DeckManager.sortCards([...this.combatState.player.hand], sortType);
    
    // Calculate what the positions SHOULD be after sorting (using same logic as updateHandDisplay)
    const hand = sortedCards;
    const screenWidth = this.cameras.main.width;
    const cardWidth = 80;
    const cardSpacing = cardWidth * 1.2; // 120% spacing to match updateHandDisplay
    const totalWidth = (hand.length - 1) * cardSpacing;
    const maxWidth = screenWidth * 0.8;
    const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
    const actualSpacing = cardSpacing * scale;
    const actualTotalWidth = (hand.length - 1) * actualSpacing;
    const startX = -actualTotalWidth / 2;
    const arcHeight = 30;
    const maxRotation = 8;
    
    // Calculate target positions for sorted cards
    const targetPositions = sortedCards.map((card, index) => {
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      const x = startX + index * actualSpacing;
      const baseY = -Math.abs(normalizedPos) * arcHeight * 2;
      const rotation = normalizedPos * maxRotation;
      
      return { x, y: baseY, rotation };
    });
    
    // Create a mapping of where each card should end up
    const cardMappings = this.cardSprites.map((cardSprite, originalIndex) => {
      const originalCard = originalCards[originalIndex];
      const newIndex = sortedCards.findIndex(card => 
        card.suit === originalCard.suit && card.rank === originalCard.rank
      );
      return {
        sprite: cardSprite,
        originalIndex,
        newIndex,
        targetPosition: targetPositions[newIndex] // Use calculated target positions
      };
    });
    
    // Phase 1: Cards lift up and move to their sorted positions individually
    const movePromises = cardMappings.map((mapping, index) => {
      return new Promise<void>((resolve) => {
        // First lift up slightly
        this.tweens.add({
          targets: mapping.sprite,
          y: mapping.sprite.y - 20,
          rotation: (Math.random() - 0.5) * 0.3,
          duration: 100,
          delay: index * 8,
          ease: 'Power2.easeOut',
          onComplete: () => {
            // Then move to the target position
            this.tweens.add({
              targets: mapping.sprite,
              x: mapping.targetPosition.x,
              y: mapping.targetPosition.y,
              rotation: mapping.targetPosition.rotation,
              duration: 200,
              ease: 'Power2.easeInOut',
              onComplete: () => resolve()
            });
          }
        });
      });
    });
    
    // Wait for all cards to reach their positions, then update the hand data
    Promise.all(movePromises).then(() => {
      // Update the hand data to match the sorted order
      this.combatState.player.hand = sortedCards;
      
      // Reorder the cardSprites array to match the sorted order
      const newCardSprites: Phaser.GameObjects.Container[] = [];
      sortedCards.forEach((sortedCard) => {
        const spriteIndex = originalCards.findIndex(card => 
          card.suit === sortedCard.suit && card.rank === sortedCard.rank
        );
        if (spriteIndex !== -1) {
          newCardSprites.push(this.cardSprites[spriteIndex]);
        }
      });
      this.cardSprites = newCardSprites;
      
      // Update the base positions stored in each card to match their new positions
      // AND ensure sprite positions are synchronized
      sortedCards.forEach((card, index) => {
        const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
        const x = startX + index * actualSpacing;
        const baseY = -Math.abs(normalizedPos) * arcHeight * 2;
        const rotation = normalizedPos * maxRotation;
        
        // Store base positions in the card data
        (card as any).baseX = x;
        (card as any).baseY = baseY;
        (card as any).baseRotation = rotation;
        
        // Ensure the sprite position matches (accounting for selection state)
        const cardSprite = this.cardSprites[index];
        if (cardSprite) {
          const targetY = card.selected ? baseY - 40 : baseY;
          cardSprite.setPosition(x, targetY);
          cardSprite.setAngle(rotation);
          cardSprite.setDepth(card.selected ? 500 + index : 100 + index);
        }
      });
      
      onComplete();
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
    this.totalDiscardsUsed++; // Track total for DDA

    // Clear selection
    this.selectedCards = [];

    this.updateHandDisplay();
    this.updateTurnUI();
    this.updateHandIndicator(); // Update hand indicator after discarding
    this.updateSelectionCounter(); // Update selection counter after discarding
    this.updateDiscardDisplay(); // Update discard pile display
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

    // Apply enemy action based on intent
    if (enemy.intent.type === "attack") {
      let damage = enemy.intent.value;
      if (enemy.statusEffects.some((e) => e.name === "Weak")) {
        damage *= 0.5;
      }
      this.animateEnemyAttack(); // Add animation when enemy attacks
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
    this.combatState.turn++;
    this.turnCount++; // Track total turns for DDA
    
    // Update DDA debug overlay with current turn count
    this.updateDDADebugOverlay();

    // Reset discard counter (only 3 discards per turn)
    this.discardsUsedThisTurn = 0;

    // Clear any selected cards from previous turn
    this.selectedCards = [];

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

    this.updateTurnUI();
    this.updateHandDisplay();
    this.updatePlayedHandDisplay(); // Clear the played hand display
    this.updateActionButtons(); // Reset to card selection buttons
    
    // Apply start-of-turn relic effects
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
      this.animateShuffleDeck(() => {
        this.combatState.player.drawPile = DeckManager.shuffleDeck(
          this.combatState.player.discardPile
        );
        this.combatState.player.discardPile = [];
      });
    }
    
    // Animate only the newly drawn cards
    this.animateNewCards(drawnCards, previousHandSize);
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
    
    if (this.combatState.enemy.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
      vulnerableBonus = finalDamage - damage;
      console.log(`Vulnerable effect applied, damage increased to ${finalDamage}`);
    }
    
    // Apply "Bakunawa Fang" effect: +5 additional damage when using any relic
    const bakunawaFang = this.combatState.player.relics.find(r => r.id === "bakunawa_fang");
    let bakunawaBonus = 0;
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
    this.animateSpriteDamage(this.enemySprite);
    this.updateEnemyUI();

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
      this.updateEnemyUI();
      console.log("Enemy defeated!");
      
      // Play death animation
      this.animateEnemyDeath();
      
      this.time.delayedCall(500, () => {
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
    
    // Apply "Bakunawa Scale" effect: reduces all incoming damage by 1
    const bakunawaScale = this.combatState.player.relics.find(r => r.id === "bakunawa_scale");
    if (bakunawaScale) {
      const reducedDamage = Math.max(0, finalDamage - 1);
      console.log(`Bakunawa Scale reduced damage from ${finalDamage} to ${reducedDamage}`);
      finalDamage = reducedDamage;
      if (finalDamage < damage) {
        this.showActionResult(`Bakunawa Scale reduced damage!`);
      }
    }
    
    const actualDamage = Math.max(0, finalDamage - this.combatState.player.block);
    console.log(`Player has ${this.combatState.player.block} block, taking ${actualDamage} actual damage`);
    
    this.combatState.player.currentHealth -= actualDamage;
    this.combatState.player.block = Math.max(
      0,
      this.combatState.player.block - finalDamage
    );
    
    console.log(`Player health: ${this.combatState.player.currentHealth}/${this.combatState.player.maxHealth}`);

    // Add visual feedback for player taking damage
    this.animateSpriteDamage(this.playerSprite);
    this.updatePlayerUI();

    // Check if player is defeated
    if (this.combatState.player.currentHealth <= 0) {
      this.combatState.player.currentHealth = 0;
      this.updatePlayerUI();
      console.log("Player defeated!");
      this.time.delayedCall(500, () => {
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

    this.updateEnemyUI();
  }

  /**
   * Update player UI elements
   */
  private updatePlayerUI(): void {
    const player = this.combatState.player;
    this.playerHealthText.setText(
      `♥ ${player.currentHealth}/${player.maxHealth}`
    );
    this.playerBlockText.setText(player.block > 0 ? `⛨ ${player.block}` : "");
  }

  /**
   * Update enemy UI elements
   */
  private updateEnemyUI(): void {
    const enemy = this.combatState.enemy;
    this.enemyHealthText.setText(
      `♥ ${enemy.currentHealth}/${enemy.maxHealth}`
    );
    this.enemyBlockText.setText(enemy.block > 0 ? `⛨ ${enemy.block}` : "");
    this.enemyIntentText.setText(
      `${enemy.intent.icon} ${enemy.intent.description}`
    );
  }

  /**
   * Update turn UI elements
   */
  private updateTurnUI(): void {
    // Don't update UI if combat has ended
    if (this.combatEnded) {
      return;
    }
    
    try {
      this.turnText.setText(`Turn: ${this.combatState.turn}`);
      this.actionsText.setText(
        `Discards: ${this.discardsUsedThisTurn}/${this.maxDiscardsPerTurn} | Hand: ${this.combatState.player.hand.length}/8`
      );
      this.updateHandIndicator();
    } catch (error) {
      console.error("Error updating turn UI:", error);
    }
  }

  /**
   * Update hand indicator to show current selected hand type
   */
  private updateHandIndicator(): void {
    if (this.selectedCards.length === 0) {
      this.handIndicatorText.setText("");
      return;
    }

    // Evaluate the currently selected cards
    const evaluation = HandEvaluator.evaluateHand(this.selectedCards, "attack");
    const handTypeText = this.getHandTypeDisplayText(evaluation.type);
    const valueText =
      evaluation.totalValue > 0 ? ` (${evaluation.totalValue} value)` : "";

    this.handIndicatorText.setText(`Selected: ${handTypeText}${valueText}`);
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
    
    // Calculate DDA metrics and send to system
    // NOTE: For roguelikes, healthPercentage should be based on maxHealth, not starting health
    // This properly reflects the player's resource state for upcoming fights
    const combatMetrics: CombatMetrics = {
      combatId: `combat_${Date.now()}`,
      timestamp: Date.now(),
      
      // Pre-combat state
      startHealth: this.initialPlayerHealth,
      startMaxHealth: this.combatState.player.maxHealth,
      startGold: this.combatState.player.ginto,
      
      // Combat performance  
      endHealth: this.combatState.player.currentHealth,
      healthPercentage: this.combatState.player.currentHealth / this.combatState.player.maxHealth, // Fixed: Use maxHealth for roguelike HP retention
      turnCount: this.turnCount,
      damageDealt: Math.max(0, this.combatState.enemy.maxHealth - this.combatState.enemy.currentHealth),
      damageReceived: Math.max(0, this.initialPlayerHealth - this.combatState.player.currentHealth),
      discardsUsed: this.totalDiscardsUsed,
      maxDiscardsAvailable: this.turnCount * this.maxDiscardsPerTurn,
      
      // Hand quality metrics
      handsPlayed: [this.bestHandAchieved], // Simplified for now
      bestHandAchieved: this.bestHandAchieved,
      averageHandQuality: this.getHandQualityScore(this.bestHandAchieved),
      
      // Outcome
      victory: victory,
      combatDuration: Date.now() - this.combatStartTime,
      
      // Enemy information
      enemyType: "common" as const, // Simplified for now
      enemyName: this.combatState.enemy.name,
      enemyStartHealth: this.combatState.enemy.maxHealth,
    };
    
    // Update DDA system with combat results
    const updatedPPS = this.dda.processCombatResults(combatMetrics);
    console.log("DDA Updated:", {
      previousPPS: updatedPPS.previousPPS,
      currentPPS: updatedPPS.currentPPS,
      tier: updatedPPS.tier,
      healthPercentage: combatMetrics.healthPercentage,
      turnCount: combatMetrics.turnCount,
      victory: victory
    });
    
    // Update DDA debug overlay if visible
    this.updateDDADebugOverlay();
    
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
        this.updateRelicInventory();
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

      // Return to overworld after 3 seconds
      this.time.delayedCall(3000, () => {
        this.scene.start("Overworld");
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
    const dialogue =
      this.creatureDialogues[enemyKey] || this.creatureDialogues.goblin;

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
    const enemySpriteKey = this.getEnemySpriteKey(this.combatState.enemy.name);
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

      // Apply rewards
      this.combatState.player.ginto += reward.ginto;
      this.combatState.player.diamante += reward.diamante;

      if (reward.healthHealing > 0) {
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + reward.healthHealing
        );
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
          this.showRewardsScreen(choice, choiceDialogue, reward, landasChange);
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
    landasChange: number
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

    // Ginto reward
    if (reward.ginto > 0) {
      this.add
        .text(screenWidth/2, rewardY, `💰 ${reward.ginto} Ginto`, {
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
      
      // Update player data in GameState with complete state
      gameState.updatePlayerData({
        currentHealth: this.combatState.player.currentHealth,
        maxHealth: this.combatState.player.maxHealth,
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
      if (this.handIndicatorText) {
        this.handIndicatorText.destroy();
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
   * Update played hand display
   */
  private updatePlayedHandDisplay(): void {
    // Safety check: Don't update if scene is being destroyed or doesn't exist
    if (!this.sys || !this.sys.isActive() || this.combatEnded) {
      return;
    }

    // Clear existing played card sprites
    this.playedCardSprites.forEach((sprite) => sprite.destroy());
    this.playedCardSprites = [];

    const playedHand = this.combatState.player.playedHand;
    if (playedHand.length === 0) {
      // Hide hand evaluation text when no cards are played
      if (this.handEvaluationText) {
        this.handEvaluationText.setVisible(false);
      }
      return;
    }

    const cardWidth = 70;
    const totalWidth = playedHand.length * cardWidth;
    const screenWidth = this.cameras.main.width;
    
    // Limit the total width to 80% of screen width to prevent overflow
    const maxWidth = screenWidth * 0.8;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / playedHand.length) : cardWidth;
    const actualTotalWidth = playedHand.length * actualCardWidth;
    const startX = -actualTotalWidth / 2 + actualCardWidth / 2;

    playedHand.forEach((card, index) => {
      const cardSprite = this.createCardSprite(
        card,
        startX + index * actualCardWidth,
        0,
        true // Make interactive so players can unplay cards
      );
      
      // Override the default card interaction to unplay instead of select
      cardSprite.removeAllListeners('pointerdown');
      cardSprite.on("pointerdown", () => {
        this.unplayCard(card);
      });
      
      // Add visual feedback for played cards when hovering
      cardSprite.on("pointerover", () => {
        cardSprite.setScale(1.15);
        // Add golden tint to indicate it's clickable to unplay
        cardSprite.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Image) {
            child.setTint(0xffd93d);
          }
        });
        this.tweens.add({
          targets: cardSprite,
          y: cardSprite.y - 15,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      cardSprite.on("pointerout", () => {
        cardSprite.setScale(1);
        // Remove tint
        cardSprite.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Image) {
            child.clearTint();
          }
        });
        this.tweens.add({
          targets: cardSprite,
          y: cardSprite.y + 15,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      this.playedHandContainer.add(cardSprite);
      this.playedCardSprites.push(cardSprite);
    });

    // Show hand evaluation
    const evaluation = HandEvaluator.evaluateHand(playedHand, "attack");
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    this.handEvaluationText.setFontSize(Math.floor(18 * scaleFactor));
    this.handEvaluationText.setText(
      `${evaluation.description} - Value: ${evaluation.totalValue}`
    );
    this.handEvaluationText.setVisible(true);

    // Store eval text to destroy later
    this.playedHandContainer.add(this.handEvaluationText);
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
      Apoy: "AoE + Burn",
      Tubig: "Heal + Cleanse",
      Lupa: "Apply Vulnerable",
      Hangin: "Draw + Weak",
    };
    return specialActions[suit];
  }

  public executeAction(actionType: "attack" | "defend" | "special"): void {
    // Prevent action spamming
    if (this.isActionProcessing) {
      console.log("Action already processing, ignoring input");
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
    
    // Apply relic effects after playing a hand
    RelicManager.applyAfterHandPlayedEffects(this.combatState.player, this.combatState.player.playedHand, evaluation);
    
    const dominantSuit = this.getDominantSuit(
      this.combatState.player.playedHand
    );
    console.log(`Dominant suit: ${dominantSuit}`);

    let damage = 0;
    let block = 0;

    // Apply hand bonus
    let originalDamage = evaluation.totalValue;
    let originalBlock = evaluation.totalValue;
    
    // Track relic bonuses for detailed display
    const relicBonuses: {name: string, amount: number}[] = [];
    
    switch (actionType) {
      case "attack":
        damage += evaluation.totalValue;
        const strength = this.combatState.player.statusEffects.find((e) => e.name === "Strength");
        if (strength) {
          damage += strength.value;
          console.log(`Strength bonus applied: +${strength.value} damage`);
        }
        // Apply "Sigbin Heart" effect: +5 damage on burst (when low health)
        const sigbinHeartDamage = RelicManager.calculateSigbinHeartDamage(this.combatState.player);
        if (sigbinHeartDamage > 0) {
          damage += sigbinHeartDamage;
          relicBonuses.push({name: "Sigbin Heart", amount: sigbinHeartDamage});
        }
        console.log(`Total attack damage: ${damage}`);
        
        // Show detailed damage calculation
        this.showDamageCalculation(originalDamage, strength?.value || 0, relicBonuses);
        break;
      case "defend":
        block += evaluation.totalValue;
        const dexterity = this.combatState.player.statusEffects.find((e) => e.name === "Dexterity");
        if (dexterity) {
          block += dexterity.value;
          console.log(`Dexterity bonus applied: +${dexterity.value} block`);
        }
        // Apply "Balete Root" effect: +2 block per Lupa card
        const baleteRootBonus = RelicManager.calculateBaleteRootBlock(this.combatState.player, this.combatState.player.playedHand);
        if (baleteRootBonus > 0) {
          block += baleteRootBonus;
          relicBonuses.push({name: "Balete Root", amount: baleteRootBonus});
        }
        console.log(`Total block gained: ${block}`);
        
        // Show detailed block calculation
        this.showBlockCalculation(originalBlock, dexterity?.value || 0, relicBonuses);
        break;
      case "special":
        // Start cinematic special action animation
        this.animateSpecialAction(dominantSuit);
        
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
      this.animatePlayerAttack(); // Add animation when attacking
      this.showFloatingDamage(damage); // Show floating damage counter like Prologue
      this.damageEnemy(damage);
      // Result already shown above with detailed calculation
    }

    if (block > 0) {
      this.combatState.player.block += block;
      this.updatePlayerUI();
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
  
  /** Animate special action with cinematic effects */
  private animateSpecialAction(suit: Suit): void {
    // Create cinematic effect for special action sequence
    this.createCinematicBars();
    
    // First announce the attack, then perform it
    this.announceSpecialAttack(suit);
  }

  /**
   * Announce the special attack with dramatic text and effects, then perform the attack
   */
  private announceSpecialAttack(suit: Suit): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Get suit-specific attack names
    const attackNames: Record<Suit, string> = {
      "Apoy": "INFERNO STRIKE!",
      "Tubig": "TIDAL SLASH!",
      "Lupa": "EARTH CRUSHER!",
      "Hangin": "WIND CUTTER!"
    };
    
    const attackName = attackNames[suit];
    
    // Create dramatic announcement text
    const announcementText = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 50,
      attackName,
      {
        fontFamily: "dungeon-mode",
        fontSize: 72,
        color: '#ffffff',
        align: "center",
        stroke: "#000000",
        strokeThickness: 8
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.3).setDepth(1003);
    
    // Get suit color for effects
    const suitColors: Record<Suit, number> = {
      "Apoy": 0xff4500,    // Fire red/orange
      "Tubig": 0x1e90ff,   // Water blue
      "Lupa": 0x32cd32,    // Earth green
      "Hangin": 0x87ceeb    // Wind light blue
    };
    
    const color = suitColors[suit];
    
    // Animate announcement text in
    this.tweens.add({
      targets: announcementText,
      alpha: 1,
      scale: 1.2,
      duration: 600,
      ease: 'Back.Out',
      onComplete: () => {
        // Change text color to suit color after initial appearance
        announcementText.setColor(`#${color.toString(16).padStart(6, '0')}`);
        
        // Hold for dramatic effect, then start the actual attack
        this.time.delayedCall(800, () => {
          // Fade out announcement
          this.tweens.add({
            targets: announcementText,
            alpha: 0,
            scale: 0.8,
            duration: 400,
            ease: 'Cubic.In',
            onComplete: () => {
              announcementText.destroy();
              // Now perform the actual attack
              this.performSpecialAttack(suit);
            }
          });
        });
      }
    });
  }

  /**
   * Perform the actual special attack animation after announcement
   */
  private performSpecialAttack(suit: Suit): void {
    // Character slash animation
    this.animateCharacterSlash(suit);
    
    // Add impact effects during the attack
    this.time.delayedCall(300, () => {
      // Screen shake for impact
      this.cameras.main.shake(150, 0.01);
      
      // Create impact flash
      const impactFlash = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0xffffff
      ).setAlpha(0).setDepth(1004);
      
      this.tweens.add({
        targets: impactFlash,
        alpha: [0, 0.3, 0],
        duration: 200,
        ease: 'Cubic.Out',
        onComplete: () => {
          impactFlash.destroy();
        }
      });
    });
  }
  
  /** Create immersive cinematic effect for special action sequence (Final Fantasy horizontal focus style) */
  private createCinematicBars(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Focus effect only - no top/bottom bars
    
    // No zooming in this version - just horizontal focus on hero and enemy
    // Focus camera horizontally between hero and enemy without zooming
    const combatCenterX = (this.playerSprite.x + this.enemySprite.x) / 2;
    const combatCenterY = (this.playerSprite.y + this.enemySprite.y) / 2;
    
    // Calculate focus area around hero and enemy - span entire screen width
    const focusWidth = screenWidth; // Use full screen width for maximum span
    const focusHeight = screenHeight * 0.4; // Use 40% of screen height
    const focusX = screenWidth / 2; // Center horizontally across entire screen
    const focusY = combatCenterY;
    
    // Hide all UI elements during special attack
    this.hideUIForSpecialAttack();
    
    // Create focus effect using multiple rectangles instead of mask
    // Top overlay (above focus area)
    const topOverlay = this.add.rectangle(
      screenWidth / 2,
      (focusY - focusHeight / 2) / 2,
      screenWidth,
      focusY - focusHeight / 2,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Bottom overlay (below focus area)
    const bottomOverlay = this.add.rectangle(
      screenWidth / 2,
      focusY + focusHeight / 2 + (screenHeight - (focusY + focusHeight / 2)) / 2,
      screenWidth,
      screenHeight - (focusY + focusHeight / 2),
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Left overlay (left of focus area)
    const leftOverlay = this.add.rectangle(
      (focusX - focusWidth / 2) / 2,
      focusY,
      focusX - focusWidth / 2,
      focusHeight,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Right overlay (right of focus area)
    const rightOverlay = this.add.rectangle(
      focusX + focusWidth / 2 + (screenWidth - (focusX + focusWidth / 2)) / 2,
      focusY,
      screenWidth - (focusX + focusWidth / 2),
      focusHeight,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Animate all overlays to create focus effect
    const allOverlays = [topOverlay, bottomOverlay, leftOverlay, rightOverlay];
    this.tweens.add({
      targets: allOverlays,
      alpha: 0.8,
      duration: 500,
      ease: 'Cubic.Out'
    });
    
    // Instead of zooming, we'll move the camera slightly to center the action
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: combatCenterX - (screenWidth / 2),
      duration: 500,
      ease: 'Cubic.Out',
      hold: 1000, // Hold the horizontal focus during the special move
      completeDelay: 300, // Wait before returning to normal view
      onComplete: () => {
        // Return to original camera position
        this.tweens.add({
          targets: this.cameras.main,
          scrollX: 0,
          duration: 300,
          ease: 'Cubic.In'
        });
      }
    });
    
    // No flash effect - just focus overlay
    
    // Create a "Special Move" text display like in Final Fantasy
    const specialMoveText = this.add.text(
      screenWidth / 2,
      screenHeight / 3,
      "SPECIAL ATTACK!",
      {
        fontFamily: "dungeon-mode",
        fontSize: 64,
        color: '#ffd700', // Gold color like in Final Fantasy
        align: "center",
        stroke: "#000000",
        strokeThickness: 6
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(1001);
    
    // Animate the special move text
    this.tweens.add({
      targets: specialMoveText,
      alpha: 1,
      scale: 1.1,
      duration: 300,
      ease: 'Back.Out',
      yoyo: true,
      repeat: 0
    });
    
    // Animate the bars out after the special move
    this.time.delayedCall(1800, () => {
      // Animate special move text out
      this.tweens.add({
        targets: specialMoveText,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        ease: 'Cubic.In',
        onComplete: () => {
          specialMoveText.destroy();
        }
      });
      
      // Animate the focus overlay out
      this.tweens.add({
        targets: allOverlays,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.In',
        onComplete: () => {
          allOverlays.forEach(overlay => overlay.destroy());
          // Restore UI after special attack
          this.restoreUIAfterSpecialAttack();
        }
      });
    });
    
    // Create camera shake effect for impact
    this.cameras.main.shake(200, 0.008);
  }
  
  /** Animate character slash animation */
  private animateCharacterSlash(suit: Suit): void {
    const originalX = this.playerSprite.x;
    const originalScale = this.playerSprite.scaleX;
    
    // Get the appropriate color based on suit
    const suitColors: Record<Suit, number> = {
      "Apoy": 0xff4500,    // Fire red/orange
      "Tubig": 0x1e90ff,   // Water blue
      "Lupa": 0x32cd32,    // Earth green
      "Hangin": 0x87ceeb    // Wind light blue
    };
    
    const color = suitColors[suit];
    
    // More dramatic movement for cinematic effect
    const dashDistance = this.enemySprite.x - 80; // Get closer to enemy
    
    // Dash forward with dramatic scale and slash effect
    this.tweens.add({
      targets: this.playerSprite,
      x: dashDistance,
      scaleX: originalScale * 1.2, // Make player slightly larger during attack
      scaleY: originalScale * 1.2,
      duration: 150,
      ease: 'Power3.Out',
      onStart: () => {
        // Add multiple slash visual effects for more impact
        this.createDramaticSlashEffect(this.playerSprite.x, this.playerSprite.y, color);
      },
      onComplete: () => {
        // Brief pause at target, then return
        this.time.delayedCall(100, () => {
          this.tweens.add({
            targets: this.playerSprite,
            x: originalX,
            scaleX: originalScale,
            scaleY: originalScale,
            duration: 300,
            ease: 'Back.Out'
          });
        });
      }
    });
  }
  
  /** Create dramatic slash effect visualization for cinematic special attacks */
  private createDramaticSlashEffect(x: number, y: number, color: number): void {
    // Create multiple slash lines for more dramatic effect
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 50, () => {
        // Create a slash line effect
        const slashLine = this.add.line(0, 0, 0, 0, 120, 0, color);
        slashLine.setLineWidth(6 + i * 2); // Varying thickness
        slashLine.setPosition(x, y);
        slashLine.setDepth(1002); // Above overlay
        
        // Different angles for each slash
        const angles = [-45, -30, -60];
        slashLine.setAngle(angles[i]);
        
        // Animate the slash
        slashLine.setAlpha(0);
        this.tweens.add({
          targets: slashLine,
          alpha: [0, 1, 0],
          scaleX: [0.5, 1.5, 0.8],
          scaleY: [0.5, 1.5, 0.8],
          duration: 200,
          ease: 'Power2.Out',
          onComplete: () => {
            slashLine.destroy();
          }
        });
      });
    }
    
    // Add impact flash at slash point
    const impactFlash = this.add.circle(x, y, 30, color);
    impactFlash.setAlpha(0).setDepth(1001);
    
    this.tweens.add({
      targets: impactFlash,
      alpha: [0, 0.8, 0],
      scale: [0.5, 2, 0.5],
      duration: 300,
      ease: 'Power2.Out',
      onComplete: () => {
        impactFlash.destroy();
      }
    });
  }

  /** Add cinematic effect for special poker hands */


  private applyElementalEffects(
    actionType: "attack" | "defend" | "special",
    suit: Suit,
    value: number
  ): void {
    switch (suit) {
      case "Apoy": // Fire
        if (actionType === "attack") {
          this.damageEnemy(2); // +2 damage
          this.addStatusEffect(this.combatState.enemy, {
            id: "burn",
            name: "Burn",
            type: "debuff",
            duration: 2,
            value: 2,
            description: "Takes 2 damage at the start of the turn.",
            emoji: "🔥",
          });
        } else if (actionType === "defend") {
          this.addStatusEffect(this.combatState.player, {
            id: "strength",
            name: "Strength",
            type: "buff",
            duration: 999,
            value: 1,
            description: "Deal +1 additional damage per stack with Attack actions.",
            emoji: "†",
          });
        } else {
          // AoE Damage + Burn
          // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
          const additionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
          this.damageEnemy(Math.floor(value * 0.5) + additionalDamage);
          this.addStatusEffect(this.combatState.enemy, {
            id: "burn",
            name: "Burn",
            type: "debuff",
            duration: 2,
            value: 2,
            description: "Takes 2 damage at the start of the turn.",
            emoji: "🔥",
          });
        }
        break;
      case "Tubig": // Water
        if (actionType === "attack") {
          // Ignores 50% of enemy block
          const enemy = this.combatState.enemy;
          const damage = value;
          const damageToBlock = Math.min(enemy.block, damage);
          const damageThroughBlock = damage - damageToBlock;
          const damageToHealth = damageThroughBlock + damageToBlock * 0.5;
          this.damageEnemy(damageToHealth);
        } else if (actionType === "defend") {
          this.combatState.player.currentHealth = Math.min(
            this.combatState.player.maxHealth,
            this.combatState.player.currentHealth + 2
          );
          this.updatePlayerUI();
        } else {
          // Heal + Cleanse Debuff
          this.combatState.player.currentHealth = Math.min(
            this.combatState.player.maxHealth,
            this.combatState.player.currentHealth + Math.floor(value * 0.5)
          );
          // TODO: Cleanse Debuff
          this.updatePlayerUI();
        }
        break;
      case "Lupa": // Earth
        if (actionType === "attack") {
          const lupaCards = this.combatState.player.playedHand.filter(
            (card) => card.suit === "Lupa"
          ).length;
          this.damageEnemy(lupaCards);
        } else if (actionType === "defend") {
          // 50% of unspent block carries over
          // This needs to be handled at the end of the turn
        } else {
          // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
          const additionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
          if (additionalDamage > 0) {
            this.damageEnemy(additionalDamage);
          }
          
          this.addStatusEffect(this.combatState.enemy, {
            id: "vulnerable",
            name: "Vulnerable",
            type: "debuff",
            duration: 2,
            value: 1.5,
            description: "Take +50% damage from all incoming attacks.",
            emoji: "†",
          });
        }
        break;
      case "Hangin": // Air
        if (actionType === "attack") {
          // Hits all enemies for 75% damage
          this.damageEnemy(Math.floor(value * 0.75));
        } else if (actionType === "defend") {
          this.addStatusEffect(this.combatState.player, {
            id: "dexterity",
            name: "Dexterity",
            type: "buff",
            duration: 999,
            value: 1,
            description: "Gain +1 additional block per stack with Defend actions.",
            emoji: "⛨",
          });
        } else {
          // Draw cards + Apply Weak
          // Apply "Wind Veil" effect: Additional cards drawn based on Hangin cards played
          let cardsToDraw = 2;
          cardsToDraw += RelicManager.calculateWindVeilCardDraw(this.combatState.player.playedHand, this.combatState.player);
          
          this.drawCards(cardsToDraw);
          
          // Apply "Bungisngis Grin" effect: +5 damage when applying debuffs
          const additionalDamage = RelicManager.calculateBungisngisGrinDamage(this.combatState.player);
          if (additionalDamage > 0) {
            this.damageEnemy(additionalDamage);
          }
          
          this.addStatusEffect(this.combatState.enemy, {
            id: "weak",
            name: "Weak",
            type: "debuff",
            duration: 2,
            value: 0.5,
            description: "Deal -50% damage with Attack actions.",
            emoji: "†",
          });
        }
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
        // Top card uses 13apoy sprite (front face) with black border
        let frontCard;
        if (this.textures.exists('card_13_apoy')) {
          frontCard = this.add.image(
            i * 3, // Slight offset for stack effect
            -i * 3,
            'card_13_apoy'
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
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.deckViewContainer = this.add.container(screenWidth / 2, screenHeight / 2).setVisible(false).setDepth(6000);

    const bg = this.add.rectangle(0, 0, screenWidth * 0.7, screenHeight * 0.7, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(2, 0x8b4513, 0.8);

    const title = this.add.text(0, -screenHeight * 0.3, "Draw Pile", {
      fontFamily: "dungeon-mode",
      fontSize: 28,
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    const closeButton = this.add.text(screenWidth * 0.3, -screenHeight * 0.3, "[X]", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#ff6b6b",
      align: "center",
    }).setOrigin(0.5).setInteractive();

    closeButton.on("pointerdown", () => {
      this.deckViewContainer.setVisible(false);
    });

    this.deckViewContainer.add([bg, title, closeButton]);
  }


  private createDiscardView(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.discardViewContainer = this.add.container(screenWidth / 2, screenHeight / 2).setVisible(false).setDepth(6000);

    const bg = this.add.rectangle(0, 0, screenWidth * 0.7, screenHeight * 0.7, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(2, 0x8b4513, 0.8);

    const title = this.add.text(0, -screenHeight * 0.3, "Discard Pile", {
      fontFamily: "dungeon-mode",
      fontSize: 28,
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    const closeButton = this.add.text(screenWidth * 0.3, -screenHeight * 0.3, "[X]", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#ff6b6b",
      align: "center",
    }).setOrigin(0.5).setInteractive();

    closeButton.on("pointerdown", () => {
      this.discardViewContainer.setVisible(false);
    });

    this.discardViewContainer.add([bg, title, closeButton]);
  }


  private showDeckView(): void {
    this.deckViewContainer.list.filter(item => item.type === 'Container').forEach(item => item.destroy());

    const cards = this.combatState.player.drawPile;
    const containerWidth = this.cameras.main.width * 0.8;
    const containerHeight = this.cameras.main.height * 0.8;
    const columns = 6;
    const padding = 15;
    const cardWidth = 100;
    const cardHeight = 140;

    const totalGridWidth = columns * (cardWidth + padding) - padding;
    const startX = -totalGridWidth / 2 + cardWidth / 2;
    const startY = -containerHeight / 2 + cardHeight / 2 + padding;

    const cardsContainer = this.add.container(0, 0);
    this.deckViewContainer.add(cardsContainer);
    cardsContainer.setDepth(1);

    cards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      const cardSprite = this.createCardSprite(card, x, y, false);
      cardSprite.setDepth(2);
      cardsContainer.add(cardSprite);
    });

    const maskHeight = containerHeight - padding * 2;
    const mask = this.make.graphics({});
    mask.fillStyle(0xffffff);
    mask.beginPath();
    mask.fillRect(this.deckViewContainer.x - containerWidth / 2, this.deckViewContainer.y - containerHeight / 2, containerWidth, containerHeight);
    cardsContainer.setMask(mask.createGeometryMask());

    let scrollY = 0;
    this.input.on("wheel", (pointer: any, gameObjects: any, deltaX: any, deltaY: any) => {
      if (this.deckViewContainer.visible) {
        scrollY -= deltaY * 0.5;
        const maxScroll = 0;
        const minScroll = -cardsContainer.getBounds().height + maskHeight;
        scrollY = Phaser.Math.Clamp(scrollY, minScroll, maxScroll);
        cardsContainer.y = scrollY;
      }
    });

    this.deckViewContainer.setVisible(true);
  }








  private showDiscardPileView(): void {
    this.discardViewContainer.list.filter(item => item.type === 'Container').forEach(item => item.destroy());

    const cards = this.combatState.player.discardPile;
    const containerWidth = this.cameras.main.width * 0.8;
    const containerHeight = this.cameras.main.height * 0.8;
    const columns = 6;
    const padding = 15;
    const cardWidth = (containerWidth - (padding * (columns + 1))) / columns;
    const cardHeight = cardWidth * 1.4;

    const startX = -containerWidth / 2 + cardWidth / 2 + padding;
    const startY = -containerHeight / 2 + cardHeight / 2 + padding;

    const cardsContainer = this.add.container(0, 0);
    this.discardViewContainer.add(cardsContainer);
    cardsContainer.setDepth(1);

    cards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);
      const cardSprite = this.createCardSprite(card, x, y, false);
      cardSprite.setDepth(2);
      cardsContainer.add(cardSprite);
    });

    const maskHeight = containerHeight - padding * 2;
    const mask = this.make.graphics({});
    mask.fillStyle(0xffffff);
    mask.beginPath();
    mask.fillRect(this.discardViewContainer.x - containerWidth / 2, this.discardViewContainer.y - containerHeight / 2, containerWidth, containerHeight);
    cardsContainer.setMask(mask.createGeometryMask());

    let scrollY = 0;
    this.input.on("wheel", (pointer: any, gameObjects: any, deltaX: any, deltaY: any) => {
      if (this.discardViewContainer.visible) {
        scrollY -= deltaY * 0.5;
        const maxScroll = 0;
        const minScroll = -cardsContainer.getBounds().height + maskHeight;
        scrollY = Phaser.Math.Clamp(scrollY, minScroll, maxScroll);
        cardsContainer.y = scrollY;
      }
    });

    this.discardViewContainer.setVisible(true);
  }











  /**
   * Animate drawing cards from deck to hand positions (Balatro style)
   */
  private animateDrawCardsFromDeck(cardCount: number): void {
    if (this.isDrawingCards) return; // Prevent multiple simultaneous draws
    
    this.isDrawingCards = true;
    const hand = this.combatState.player.hand;
    
    // Use the SAME spacing calculations as updateHandDisplay for consistency
    const screenWidth = this.cameras.main.width;
    const cardWidth = 80; // Match updateHandDisplay
    const cardSpacing = cardWidth * 1.2; // Match updateHandDisplay - 120% spacing
    const totalWidth = (hand.length - 1) * cardSpacing;
    const maxWidth = screenWidth * 0.8;
    const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
    const actualSpacing = cardSpacing * scale;
    const actualTotalWidth = (hand.length - 1) * actualSpacing;
    const startX = -actualTotalWidth / 2; // Center the cards
    
    // Arc parameters - match updateHandDisplay exactly
    const arcHeight = 30;
    const maxRotation = 8;
    
    // Create cards at deck position first
    hand.forEach((card, index) => {
      // Calculate final position using the SAME logic as updateHandDisplay
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      const finalX = startX + index * actualSpacing;
      const baseY = -Math.abs(normalizedPos) * arcHeight * 2;
      const rotation = normalizedPos * maxRotation;
      
      // Store base positions in card data immediately
      (card as any).baseX = finalX;
      (card as any).baseY = baseY;
      (card as any).baseRotation = rotation;
      
      // Create card sprite at deck position - make it interactive from the start
      const cardSprite = this.createCardSprite(card, 0, 0, true);
      
      // Position at deck location initially
      cardSprite.setPosition(this.deckPosition.x - screenWidth / 2, this.deckPosition.y - this.cameras.main.height + 240);
      cardSprite.setScale(0.8); // Start smaller
      cardSprite.setAlpha(0.9);
      
      // Add to hand container
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
      
      // Animate card flying to hand position
      this.tweens.add({
        targets: cardSprite,
        x: finalX,
        y: baseY,
        angle: rotation,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 300 + index * 50, // Stagger animations
        delay: index * 100, // Delay each card
        ease: 'Power2',
        onComplete: () => {
          // Ensure final position is exact
          cardSprite.setPosition(finalX, baseY);
          cardSprite.setAngle(rotation);
          cardSprite.setDepth(100 + index);
          
          // If this is the last card, mark drawing as complete
          if (index === hand.length - 1) {
            this.isDrawingCards = false;
            this.updateDeckDisplay();
          }
        }
      });
      
      // Add a slight bounce effect
      this.tweens.add({
        targets: cardSprite,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        delay: 300 + index * 100,
        ease: 'Power2',
        yoyo: true
      });
    });
  }
  
  /**
   * Update deck display (card count and visual)
   */
  private updateDeckDisplay(): void {
    if (!this.deckSprite) return;
    
    // Find and update the deck label
    const deckLabel = this.deckSprite.list.find(child => 
      child instanceof Phaser.GameObjects.Text
    ) as Phaser.GameObjects.Text;
    
    if (deckLabel) {
      deckLabel.setText(`Deck: ${this.combatState.player.drawPile.length}`);
    }
    
    // If deck count is significantly different, rebuild the visual
    const currentCardCount = this.deckSprite.list.filter(child => 
      child instanceof Phaser.GameObjects.Rectangle || child instanceof Phaser.GameObjects.Image
    ).length;
    const expectedCardCount = Math.min(5, this.combatState.player.drawPile.length);
    
    if (currentCardCount !== expectedCardCount) {
      // Remove old cards but keep the label
      this.deckSprite.list.forEach(child => {
        if (child instanceof Phaser.GameObjects.Rectangle || child instanceof Phaser.GameObjects.Image) {
          child.destroy();
        }
      });
      
      // Rebuild deck visual with white cards and black borders
      const screenWidth = this.cameras.main.width;
      const baseCardWidth = 80;
      const baseCardHeight = 112;
      const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
      const cardWidth = baseCardWidth * scaleFactor;
      const cardHeight = baseCardHeight * scaleFactor;
      
      for (let i = 0; i < expectedCardCount; i++) {
        if (i === expectedCardCount - 1) {
          // Top card uses 13apoy sprite (front face)
          let frontCard;
          if (this.textures.exists('card_13_apoy')) {
            frontCard = this.add.image(
              i * 3,
              -i * 3,
              'card_13_apoy'
            );
            frontCard.setDisplaySize(cardWidth, cardHeight);
          } else {
            // Fallback to white rectangle
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
          // Back cards with white background and black border
          const cardBack = this.add.rectangle(
            i * 3,
            -i * 3,
            cardWidth,
            cardHeight,
            0xffffff // White color
          );
          cardBack.setStrokeStyle(2, 0x000000); // Black border
          this.deckSprite.add(cardBack);
        }
      }
    }
  }
  
  /**
   * Update discard pile display (card count)
   */
  private updateDiscardDisplay(): void {
    if (this.discardSprite && this.discardSprite.list.length > 0) {
      // Find and update the discard label
      const discardLabel = this.discardSprite.list.find(child => 
        child instanceof Phaser.GameObjects.Text
      ) as Phaser.GameObjects.Text;
      
      if (discardLabel) {
        discardLabel.setText(`Discard: ${this.combatState.player.discardPile.length}`);
      }
    }
  }
  
  /**
   * Animate only newly drawn cards from deck to hand
   */
  private animateNewCards(newCards: PlayingCard[], startingIndex: number): void {
    if (this.isDrawingCards) return;
    
    this.isDrawingCards = true;
    
    // First, update the entire hand display without animation for existing cards
    this.updateHandDisplayQuiet();
    
    // Then animate only the new cards
    const hand = this.combatState.player.hand;
    const screenWidth = this.cameras.main.width;
    const cardWidth = 60;
    const totalWidth = hand.length * cardWidth;
    const maxWidth = screenWidth * 0.8;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / hand.length) : cardWidth;
    const actualTotalWidth = hand.length * actualCardWidth;
    const startX = screenWidth / 2 - actualTotalWidth / 2 + actualCardWidth / 2;
    const handY = this.cameras.main.height - 240; // Match the hand container position
    
    newCards.forEach((card, relativeIndex) => {
      const absoluteIndex = startingIndex + relativeIndex;
      
      if (absoluteIndex < this.cardSprites.length) {
        const cardSprite = this.cardSprites[absoluteIndex];
        
        // Start from deck position
        cardSprite.setPosition(this.deckPosition.x - screenWidth / 2, this.deckPosition.y - handY + 240);
        cardSprite.setScale(0.8);
        cardSprite.setAlpha(0.9);
        
        // Calculate final position
        const finalX = startX + absoluteIndex * actualCardWidth - screenWidth / 2;
        const finalY = handY - this.cameras.main.height + 240; // Match the hand container position
        
        // Add curve effect
        const curveHeight = 5;
        const positionRatio = hand.length > 1 ? absoluteIndex / (hand.length - 1) : 0.5;
        const curveY = finalY - Math.sin(positionRatio * Math.PI) * curveHeight;
        
        // Animate to final position
        this.tweens.add({
          targets: cardSprite,
          x: finalX,
          y: curveY,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 300,
          delay: relativeIndex * 100,
          ease: 'Power2',
          onComplete: () => {
            if (relativeIndex === newCards.length - 1) {
              this.isDrawingCards = false;
            }
          }
        });
      }
    });
  }
  
  /**
   * Update hand display without animations (for existing cards)
   */
  private updateHandDisplayQuiet(): void {
    // Clear existing sprites
    this.cardSprites.forEach((sprite) => sprite.destroy());
    this.cardSprites = [];

    const hand = this.combatState.player.hand;
    const cardWidth = 60;
    const totalWidth = hand.length * cardWidth;
    const screenWidth = this.cameras.main.width;
    
    const maxWidth = screenWidth * 0.8;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / hand.length) : cardWidth;
    const actualTotalWidth = hand.length * actualCardWidth;
    const startX = -actualTotalWidth / 2 + actualCardWidth / 2;

    const curveHeight = 5;
    
    hand.forEach((card, index) => {
      const positionRatio = hand.length > 1 ? index / (hand.length - 1) : 0.5;
      const x = startX + index * actualCardWidth;
      const y = -Math.sin(positionRatio * Math.PI) * curveHeight;
      
      const cardSprite = this.createCardSprite(card, x, y);
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
    });
  }
  
  /**
   * Animate deck shuffle when discard pile is shuffled back
   */
  private animateShuffleDeck(onComplete: () => void): void {
    if (!this.deckSprite) {
      onComplete();
      return;
    }
    
    // Create shuffle effect
    this.tweens.add({
      targets: this.deckSprite,
      angle: 360,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        onComplete();
        this.updateDeckDisplay();
      }
    });
    
    // Add some particle-like effect for shuffle
    for (let i = 0; i < 8; i++) {
      const particle = this.add.rectangle(
        this.deckPosition.x + (Math.random() - 0.5) * 40,
        this.deckPosition.y + (Math.random() - 0.5) * 40,
        4,
        4,
        0xffd700
      );
      
      this.tweens.add({
        targets: particle,
        alpha: 0,
        y: particle.y - 30,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
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
        align: "center",
        stroke: "#000000",
        strokeThickness: 4
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
        color: '#ff6b6b', // Use Prologue's damage color scheme
        stroke: '#000000',
        strokeThickness: 2
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
  
  /** Show detailed damage calculation including relic bonuses */
  private showDamageCalculation(baseDamage: number, strengthBonus: number, relicBonuses: {name: string, amount: number}[]): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create container for damage calculation with Prologue styling
    const calculationContainer = this.add.container(screenWidth / 2, screenHeight * 0.25);
    
    // Double border design like Prologue
    const containerWidth = 400;
    const containerHeight = 120;
    
    const outerBorder = this.add.rectangle(0, 0, containerWidth + 8, containerHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, containerWidth, containerHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, containerWidth, containerHeight, 0x150E10);
    
    let yOffset = -30;
    
    // Main damage line
    let damageText = `Base Damage: ${baseDamage}`;
    const baseDamageDisplay = this.add.text(0, yOffset, damageText, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    yOffset += 20;
    
    // Bonuses
    if (strengthBonus > 0) {
      const strengthDisplay = this.add.text(0, yOffset, `+ ${strengthBonus} (Strength)`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#4ecdc4",
        align: "center"
      }).setOrigin(0.5);
      calculationContainer.add(strengthDisplay);
      yOffset += 18;
    }
    
    for (const relicBonus of relicBonuses) {
      if (relicBonus.amount > 0) {
        const relicDisplay = this.add.text(0, yOffset, `+ ${relicBonus.amount} (${relicBonus.name})`, {
          fontFamily: "dungeon-mode",
          fontSize: 16,
          color: "#ff6b6b",
          align: "center"
        }).setOrigin(0.5);
        calculationContainer.add(relicDisplay);
        yOffset += 18;
      }
    }
    
    // Total
    const totalDamage = baseDamage + strengthBonus + relicBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalDisplay = this.add.text(0, yOffset, `Total: ${totalDamage}`, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center"
    }).setOrigin(0.5);
    
    calculationContainer.add([outerBorder, innerBorder, bg, baseDamageDisplay, totalDisplay]);
    
    // Fade in animation
    calculationContainer.setAlpha(0);
    this.tweens.add({
      targets: calculationContainer,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        // Auto-hide after 2 seconds
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: calculationContainer,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              calculationContainer.destroy();
            }
          });
        });
      }
    });
  }
  
  /** Show detailed block calculation including relic bonuses */
  private showBlockCalculation(baseBlock: number, dexterityBonus: number, relicBonuses: {name: string, amount: number}[]): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create container for block calculation with Prologue styling
    const calculationContainer = this.add.container(screenWidth / 2, screenHeight * 0.25);
    
    // Double border design like Prologue
    const containerWidth = 400;
    const containerHeight = 120;
    
    const outerBorder = this.add.rectangle(0, 0, containerWidth + 8, containerHeight + 8, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, containerWidth, containerHeight, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, containerWidth, containerHeight, 0x150E10);
    
    let yOffset = -30;
    
    // Main block line
    let blockText = `Base Block: ${baseBlock}`;
    const baseBlockDisplay = this.add.text(0, yOffset, blockText, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    yOffset += 20;
    
    // Bonuses
    if (dexterityBonus > 0) {
      const dexterityDisplay = this.add.text(0, yOffset, `+ ${dexterityBonus} (Dexterity)`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#4ecdc4",
        align: "center"
      }).setOrigin(0.5);
      calculationContainer.add(dexterityDisplay);
      yOffset += 18;
    }
    
    for (const relicBonus of relicBonuses) {
      if (relicBonus.amount > 0) {
        const relicDisplay = this.add.text(0, yOffset, `+ ${relicBonus.amount} (${relicBonus.name})`, {
          fontFamily: "dungeon-mode",
          fontSize: 16,
          color: "#4ecdc4",
          align: "center"
        }).setOrigin(0.5);
        calculationContainer.add(relicDisplay);
        yOffset += 18;
      }
    }
    
    // Total
    const totalBlock = baseBlock + dexterityBonus + relicBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalDisplay = this.add.text(0, yOffset, `Total: ${totalBlock}`, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center"
    }).setOrigin(0.5);
    
    calculationContainer.add([outerBorder, innerBorder, bg, baseBlockDisplay, totalDisplay]);
    
    // Fade in animation
    calculationContainer.setAlpha(0);
    this.tweens.add({
      targets: calculationContainer,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        // Auto-hide after 2 seconds
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: calculationContainer,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              calculationContainer.destroy();
            }
          });
        });
      }
    });
  }
  
  /** Create simple damage preview display */
  private createDamagePreview(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create damage preview text positioned near action buttons
    this.damagePreviewText = this.add.text(screenWidth/2, screenHeight - 150, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ff6b6b",
      align: "center",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setVisible(false);
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
    const strength = this.combatState.player.statusEffects.find((e) => e.name === "Strength");
    if (strength) {
      damage += strength.value;
    }

    // Apply "Sigbin Heart" effect: +5 damage on burst (when low health)
    damage += RelicManager.calculateSigbinHeartDamage(this.combatState.player);

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

    // Format the damage display with relic bonuses
    let damageText = `DMG: ${evaluation.totalValue}`;
    if (strength && strength.value > 0) {
      damageText += ` + ${strength.value} (Str)`;
    }
    if (RelicManager.calculateSigbinHeartDamage(this.combatState.player) > 0) {
      damageText += ` + ${RelicManager.calculateSigbinHeartDamage(this.combatState.player)} (Sigbin)`;
    }
    if (vulnerableBonus > 0) {
      damageText += ` + ${vulnerableBonus} (Vuln)`;
    }
    if (bakunawaBonus > 0) {
      damageText += ` + ${bakunawaBonus} (Bakunawa)`;
    }
    damageText += ` = ${Math.floor(damage)}`;

    // Display the damage preview
    if (this.damagePreviewText) {
      this.damagePreviewText.setText(damageText);
      this.damagePreviewText.setVisible(true);
    }
  }  /**
   * Animate sprite taking damage (flash red and shake)
   */
  private animateSpriteDamage(sprite: Phaser.GameObjects.Sprite): void {
    // Flash red
    this.tweens.add({
      targets: sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        sprite.clearTint();
      },
    });

    // Shake effect
    const originalX = sprite.x;
    this.tweens.add({
      targets: sprite,
      x: originalX + 5,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        sprite.setX(originalX);
      },
    });
  }

  /**
   * Animate enemy attack (move forward and back)
   */
  private animateEnemyAttack(): void {
    const originalX = this.enemySprite.x;
    this.tweens.add({
      targets: this.enemySprite,
      x: originalX - 50,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.enemySprite.setX(originalX);
      },
    });
  }

  /**
   * Animate player attack (move forward and back)
   */
  private animatePlayerAttack(): void {
    const originalX = this.playerSprite.x;
    this.tweens.add({
      targets: this.playerSprite,
      x: originalX + 50,
      duration: 200,
      yoyo: true,
      ease: "Power2",
      onComplete: () => {
        this.playerSprite.setX(originalX);
      },
    });
  }

  /**
   * Animate enemy death (fade out, scale down, and fall)
   */
  private animateEnemyDeath(): void {
    if (!this.enemySprite) return;

    const originalX = this.enemySprite.x;
    const originalY = this.enemySprite.y;
    const originalScale = this.enemySprite.scaleX;

    // Create a dramatic death sequence
    this.tweens.add({
      targets: this.enemySprite,
      // Fade out
      alpha: 0,
      // Scale down
      scaleX: originalScale * 0.3,
      scaleY: originalScale * 0.3,
      // Fall down
      y: originalY + 100,
      // Slight rotation for dramatic effect
      rotation: Math.PI * 0.5,
      duration: 800,
      ease: "Power2",
      // Don't reset properties - keep enemy in death state
    });

    // Add a brief red flash before fading
    this.tweens.add({
      targets: this.enemySprite,
      tint: 0xff0000,
      duration: 150,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.enemySprite.clearTint();
      },
    });

    // Add a subtle shake effect during death
    this.tweens.add({
      targets: this.enemySprite,
      x: originalX + 3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      ease: "Power2",
    });
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
      this.updatePlayerUI();
    } else {
      this.updateEnemyUI();
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
      this.handContainer.setPosition(screenWidth/2, screenHeight - 100);
    }
    
    if (this.playedHandContainer) {
      this.playedHandContainer.setPosition(screenWidth/2, screenHeight - 300);
    }
    
    if (this.actionButtons) {
      this.actionButtons.setPosition(screenWidth/2, screenHeight - 180);
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
    
    if (this.handIndicatorText) {
      this.handIndicatorText.setPosition(screenWidth - 200, 110);
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
    this.updateHandDisplay();
    this.updatePlayedHandDisplay();
    this.updateActionButtons();
    this.updateRelicsUI();
    this.updateRelicInventory();
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
   * Create information button for enemy lore
   */
  private createEnemyInfoButton(x: number, y: number): void {
    // Create a circular button with an "i" for information
    const infoButton = this.add.circle(x + 100, y, 20, 0x2f3542);
    infoButton.setStrokeStyle(2, 0x57606f);
    
    // Add the "i" text
    const infoText = this.add.text(x + 100, y, "i", {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Make the button interactive
    infoButton.setInteractive();
    
    // Add hover effects
    infoButton.on("pointerover", () => {
      infoButton.setFillStyle(0x3d4454);
    });
    
    infoButton.on("pointerout", () => {
      infoButton.setFillStyle(0x2f3542);
    });
    
    // Add click event to show enemy lore
    infoButton.on("pointerdown", () => {
      this.showEnemyLore();
    });
    
    // Also make the text interactive and link it to the same event
    infoText.setInteractive();
    infoText.on("pointerdown", () => {
      this.showEnemyLore();
    });
  }
  
  /**
   * Show enemy lore information
   */
  private showEnemyLore(): void {
    // Get the enemy name and convert to lowercase for lookup
    const enemyName = this.combatState.enemy.name.toLowerCase();
    
    // Try to find the matching lore data
    let loreKey = "";
    
    // Check for specific enemy names
    if (enemyName.includes("tikbalang")) {
      loreKey = "tikbalang";
    } else if (enemyName.includes("dwende")) {
      loreKey = enemyName.includes("chief") ? "duwende_chief" : "dwende";
    } else if (enemyName.includes("kapre")) {
      loreKey = "kapre";
    } else if (enemyName.includes("sigbin")) {
      loreKey = "sigbin";
    } else if (enemyName.includes("tiyanak")) {
      loreKey = "tiyanak";
    } else if (enemyName.includes("manananggal")) {
      loreKey = "manananggal";
    } else if (enemyName.includes("aswang")) {
      loreKey = "aswang";
    } else if (enemyName.includes("bakunawa")) {
      loreKey = "bakunawa";
    }
    
    // Get lore data
    const enemyLore = ENEMY_LORE_DATA[loreKey];
    
    if (!enemyLore) {
      console.warn(`No lore found for enemy: ${enemyName}`);
      return;
    }
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create semi-transparent overlay
    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(6000);
    
    // Create lore box
    const loreBoxWidth = Math.min(800, screenWidth * 0.8);
    const loreBoxHeight = Math.min(600, screenHeight * 0.8);
    const loreBox = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      loreBoxWidth,
      loreBoxHeight,
      0x2f3542
    ).setStrokeStyle(2, 0x57606f).setScrollFactor(0).setDepth(6001);
    
    // Create title
    const title = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - loreBoxHeight / 2 + 30,
      enemyLore.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(6002);
    
    // Create close button
    const closeButton = this.add.circle(
      screenWidth / 2 + loreBoxWidth / 2 - 25,
      screenHeight / 2 - loreBoxHeight / 2 + 25,
      15,
      0xff4757
    ).setScrollFactor(0).setDepth(6002);
    
    const closeText = this.add.text(
      screenWidth / 2 + loreBoxWidth / 2 - 25,
      screenHeight / 2 - loreBoxHeight / 2 + 25,
      "X",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#ffffff",
        align: "center",
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(6003);
    
    // Create lore content
    const contentY = screenHeight / 2 - loreBoxHeight / 2 + 70;
    
    // Description
    const descriptionTitle = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY,
      "Description:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const descriptionText = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 30,
      enemyLore.description,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#e8eced",
        wordWrap: { width: loreBoxWidth - 40 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Mythology
    const mythologyTitle = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 100,
      "Mythology:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const mythologyText = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 130,
      enemyLore.mythology,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#e8eced",
        wordWrap: { width: loreBoxWidth - 40 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Abilities
    const abilitiesTitle = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 230,
      "Abilities:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const abilityTexts: Phaser.GameObjects.Text[] = [];
    enemyLore.abilities.forEach((ability, index) => {
      const abilityText = this.add.text(
        screenWidth / 2 - loreBoxWidth / 2 + 30,
        contentY + 260 + (index * 25),
        `- ${ability}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 16,
          color: "#4ecdc4",
          wordWrap: { width: loreBoxWidth - 60 },
        }
      ).setScrollFactor(0).setDepth(6002);
      abilityTexts.push(abilityText);
    });
    
    // Weakness
    const weaknessTitle = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 260 + (enemyLore.abilities.length * 25) + 30,
      "Weakness:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const weaknessText = this.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 30,
      contentY + 260 + (enemyLore.abilities.length * 25) + 60,
      enemyLore.weakness,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#ff6b6b",
        wordWrap: { width: loreBoxWidth - 60 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Collect all elements to destroy when closing
    const allElements = [
      overlay, 
      loreBox, 
      title, 
      closeButton, 
      closeText, 
      descriptionTitle,
      descriptionText,
      mythologyTitle,
      mythologyText,
      abilitiesTitle,
      weaknessTitle,
      weaknessText,
      ...abilityTexts
    ];
    
    // Make close button interactive
    closeButton.setInteractive();
    closeButton.on("pointerdown", () => {
      this.hideEnemyLore(...allElements);
    });
    
    closeText.setInteractive();
    closeText.on("pointerdown", () => {
      this.hideEnemyLore(...allElements);
    });
  }
  
  /**
   * Hide enemy lore information
   */
  private hideEnemyLore(...elements: Phaser.GameObjects.GameObject[]): void {
    elements.forEach(element => {
      if (element) {
        element.destroy();
      }
    });
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
   * Create DDA debug overlay for testing
   */
  private createDDADebugOverlay(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create container for debug UI
    this.ddaDebugContainer = this.add.container(screenWidth - 250, 10);
    this.ddaDebugContainer.setDepth(1000);
    this.ddaDebugContainer.setVisible(false);
    
    // Background panel
    const panelWidth = 240;
    const panelHeight = 200;
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.8);
    bg.setOrigin(0, 0);
    this.ddaDebugContainer.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 10, "DDA Debug", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#4ecdc4",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(title);
    
    // Note
    const note = this.add.text(panelWidth / 2, 25, "(Current combat settings)", {
      fontFamily: "dungeon-mode",
      fontSize: 9,
      color: "#888888",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(note);
    
    // Get current DDA state
    const pps = this.dda.getPlayerPPS();
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    
    let yPos = 40;
    const leftMargin = 10;
    
    // PPS Info
    const ppsText = this.add.text(leftMargin, yPos, `PPS: ${pps.currentPPS.toFixed(2)}`, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#ffffff"
    });
    this.ddaDebugContainer.add(ppsText);
    yPos += 18;
    
    // Tier Info
    const tierColor = this.getTierColor(pps.tier);
    const tierText = this.add.text(leftMargin, yPos, `Tier: ${pps.tier}`, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: tierColor
    });
    this.ddaDebugContainer.add(tierText);
    yPos += 18;
    
    // Combat count
    const combatText = this.add.text(leftMargin, yPos, `Combats: ${pps.totalCombatsCompleted}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#aaaaaa"
    });
    this.ddaDebugContainer.add(combatText);
    yPos += 18;
    
    // Calibration status
    const calibrationText = this.add.text(leftMargin, yPos, `Calibrating: ${pps.isCalibrating ? 'Yes' : 'No'}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: pps.isCalibrating ? "#ffa502" : "#666666"
    });
    this.ddaDebugContainer.add(calibrationText);
    yPos += 15;
    
    // Current combat info
    const combatInfoText = this.add.text(leftMargin, yPos, `This Combat: Turn ${this.turnCount || 0}`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#aaaaaa"
    });
    this.ddaDebugContainer.add(combatInfoText);
    yPos += 20;
    
    // Modifiers section
    const modifiersTitle = this.add.text(panelWidth / 2, yPos, "─ Active Modifiers ─", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#888888",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(modifiersTitle);
    yPos += 16;
    
    // Enemy modifiers
    const enemyText = this.add.text(leftMargin, yPos, `Enemy HP: ${(adjustment.enemyHealthMultiplier * 100).toFixed(0)}%`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ff6b6b"
    });
    this.ddaDebugContainer.add(enemyText);
    yPos += 14;
    
    const damageText = this.add.text(leftMargin, yPos, `Enemy DMG: ${(adjustment.enemyDamageMultiplier * 100).toFixed(0)}%`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ff6b6b"
    });
    this.ddaDebugContainer.add(damageText);
    yPos += 14;
    
    // Economic modifiers
    const goldText = this.add.text(leftMargin, yPos, `Gold: ${(adjustment.goldRewardMultiplier * 100).toFixed(0)}%`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ffd93d"
    });
    this.ddaDebugContainer.add(goldText);
    
    // Toggle button
    const toggleButton = this.add.text(screenWidth - 270, screenHeight - 30, "[D] DDA Info", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#4ecdc4",
      backgroundColor: "#000000",
      padding: { x: 8, y: 4 }
    }).setOrigin(0, 1);
    toggleButton.setInteractive({ useHandCursor: true });
    toggleButton.on('pointerdown', () => this.toggleDDADebug());
    
    // Keyboard shortcut
    this.input.keyboard?.on('keydown-D', () => {
      this.toggleDDADebug();
    });
  }
  
  /**
   * Toggle DDA debug overlay visibility
   */
  private toggleDDADebug(): void {
    this.ddaDebugVisible = !this.ddaDebugVisible;
    if (this.ddaDebugContainer) {
      this.ddaDebugContainer.setVisible(this.ddaDebugVisible);
      
      // Update values when showing
      if (this.ddaDebugVisible) {
        this.updateDDADebugOverlay();
      }
    }
  }
  
  /**
   * Update DDA debug overlay with current values
   */
  private updateDDADebugOverlay(): void {
    if (!this.ddaDebugContainer || !this.ddaDebugVisible) return;
    
    // Get current DDA state
    const pps = this.dda.getPlayerPPS();
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    
    // Update all text elements
    const children = this.ddaDebugContainer.list;
    
    // PPS (index 3 - after bg, title, note)
    (children[3] as Phaser.GameObjects.Text).setText(`PPS: ${pps.currentPPS.toFixed(2)}`);
    
    // Tier (index 4)
    const tierColor = this.getTierColor(pps.tier);
    (children[4] as Phaser.GameObjects.Text).setText(`Tier: ${pps.tier}`);
    (children[4] as Phaser.GameObjects.Text).setColor(tierColor);
    
    // Combat count (index 5)
    (children[5] as Phaser.GameObjects.Text).setText(`Combats: ${pps.totalCombatsCompleted}`);
    
    // Calibration (index 6)
    (children[6] as Phaser.GameObjects.Text).setText(`Calibrating: ${pps.isCalibrating ? 'Yes' : 'No'}`);
    (children[6] as Phaser.GameObjects.Text).setColor(pps.isCalibrating ? "#ffa502" : "#666666");
    
    // Current combat info (index 7)
    (children[7] as Phaser.GameObjects.Text).setText(`This Combat: Turn ${this.turnCount || 0}`);
    
    // Enemy HP (index 9 - after modifiers title)
    (children[9] as Phaser.GameObjects.Text).setText(`Enemy HP: ${(adjustment.enemyHealthMultiplier * 100).toFixed(0)}%`);
    
    // Enemy DMG (index 10)
    (children[10] as Phaser.GameObjects.Text).setText(`Enemy DMG: ${(adjustment.enemyDamageMultiplier * 100).toFixed(0)}%`);
    
    // Gold (index 11)
    (children[11] as Phaser.GameObjects.Text).setText(`Gold: ${(adjustment.goldRewardMultiplier * 100).toFixed(0)}%`);
  }
  
  /**
   * Get color for difficulty tier
   */
  private getTierColor(tier: string): string {
    switch (tier) {
      case "struggling": return "#ff4757";
      case "learning": return "#ffa502";
      case "thriving": return "#2ed573";
      case "mastering": return "#4ecdc4";
      default: return "#ffffff";
    }
  }
  
  /**
   * Get battle start dialogue for the enemy
   */
  private getBattleStartDialogue(): string {
    const enemyName = this.combatState.enemy.name.toLowerCase();
    
    if (enemyName.includes("tikbalang")) return "Hah! You dare enter my maze of paths? The false god's whispers have made me your obstacle, traveler. But your soul still seeks the light?";
    if (enemyName.includes("balete")) return "Sacred roots that once blessed Bathala's children now bind your fate! The engkanto's corruption runs deep through my bark!";
    if (enemyName.includes("sigbin")) return "I charge for the shadow throne! Once I served the divine, but now I serve the false god's dark purposes!";
    if (enemyName.includes("duwende")) return "Tricks? Oh yes, tricks abound in mounds where the old magic sleeps! But which are blessing and which are curse?";
    if (enemyName.includes("tiyanak")) return "My innocent wail lures you to doom! Once I was a babe, now I am a warning to the living!";
    if (enemyName.includes("amomongo")) return "My claws rend the unworthy! The mountain remembers when I only defended its people from true threats!";
    if (enemyName.includes("bungisngis")) return "Laughter masks the rage within! We were once merry giants, but the false god's corruption changed our song to a cackle of malice!";
    if (enemyName.includes("kapre")) return "Smoke veils my wrath! From my sacred tree I once watched over the forest paths with honor, not malice!";
    if (enemyName.includes("tawong lipod")) return "Winds conceal—feel fury! The invisible currents are my domain, and I bring the storm of retribution!";
    if (enemyName.includes("mangangaway")) return "Fates reverse at my command! I was once a healer of the people, now I am their curse-bearer!";
    
    // Default dialogue
    return "You have encountered a fearsome creature! Prepare for battle!";
  }

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
    if (this.handIndicatorText) this.handIndicatorText.setVisible(false);
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
    if (this.handIndicatorText) this.handIndicatorText.setVisible(true);
    if (this.handEvaluationText) this.handEvaluationText.setVisible(true);
    if (this.enemyIntentText) this.enemyIntentText.setVisible(true);
    if (this.actionResultText) this.actionResultText.setVisible(true);
    if (this.enemyAttackPreviewText) this.enemyAttackPreviewText.setVisible(true);
  }
}

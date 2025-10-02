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

/**
 * Combat Scene - Main card-based combat with Slay the Spire style UI
 * Player on left, enemy on right, cards at bottom
 */
export class Combat extends Scene {
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
  private isDrawingCards: boolean = false;
  private isActionProcessing: boolean = false;
  private combatEnded: boolean = false;
  private turnCount: number = 0;
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

  // Post-combat dialogue system
  private creatureDialogues: Record<string, CreatureDialogue> = {
    // Default fallback
    goblin: {
      name: "Forest Goblin",
      spareDialogue:
        "The goblin bows gratefully. 'You show mercy, warrior. The forest spirits will remember your kindness.'",
      killDialogue:
        "The goblin's eyes dim as it whispers, 'The darkness... grows stronger...' Its essence fades into shadow.",
      spareReward: {
        ginto: 50,
        diamante: 0,
        healthHealing: 10,
        bonusEffect: "Forest spirits may aid you later",
      },
      killReward: {
        ginto: 75,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Gained dark essence",
      },
    },
    // Act 1 Common Enemies
    tikbalang: {
      name: "Tikbalang",
      spareDialogue:
        "The Tikbalang nods with ancient wisdom. 'You understand the old ways, traveler. I shall lead others astray from your path.'",
      killDialogue:
        "The Tikbalang's wild laughter echoes as it fades. 'Even in death, I shall mislead your enemies...'",
      spareReward: {
        ginto: 45,
        baubles: 0,
        healthHealing: 8,
        bonusEffect: "Tikbalang's protection",
      },
      killReward: {
        ginto: 70,
        baubles: 1,
        healthHealing: 0,
        bonusEffect: "Confusion immunity",
      },
    },
    dwende: {
      name: "Dwende",
      spareDialogue:
        "The tiny Dwende grins mischievously. 'Kind human! I will hide treasures for you to find!'",
      killDialogue:
        "The Dwende's last prank turns serious. 'You... you have no joy in your heart...'",
      spareReward: {
        ginto: 40,
        baubles: 0,
        healthHealing: 5,
        bonusEffect: "Hidden treasures await",
      },
      killReward: {
        ginto: 60,
        baubles: 1,
        healthHealing: 0,
        bonusEffect: "Mischief mastery",
      },
    },
    kapre: {
      name: "Kapre",
      spareDialogue:
        "The Kapre blows a ring of smoke that forms into a blessing. 'Respect the forest, and it respects you.'",
      killDialogue:
        "The Kapre's pipe falls silent forever. 'The trees... will remember this...'",
      spareReward: {
        ginto: 50,
        baubles: 0,
        healthHealing: 12,
        bonusEffect: "Forest harmony",
      },
      killReward: {
        ginto: 75,
        baubles: 1,
        healthHealing: 0,
        bonusEffect: "Smoke mastery",
      },
    },
    sigbin: {
      name: "Sigbin",
      spareDialogue:
        "The Sigbin becomes visible and bows. 'You see past illusions to truth. This is rare wisdom.'",
      killDialogue:
        "The Sigbin flickers between visible and invisible as it dies. 'Even shadows... have hearts...'",
      spareReward: {
        ginto: 55,
        baubles: 0,
        healthHealing: 7,
        bonusEffect: "Shadow sight",
      },
      killReward: {
        ginto: 80,
        baubles: 1,
        healthHealing: 0,
        bonusEffect: "Invisibility tactics",
      },
    },
    tiyanak: {
      name: "Tiyanak",
      spareDialogue:
        "The Tiyanak's false innocent form melts away, revealing gratitude. 'You showed mercy to a deceiver. Your honor shines bright.'",
      killDialogue:
        "The Tiyanak's cries turn real at the end. 'I was... once... innocent too...'",
      spareReward: {
        ginto: 35,
        baubles: 0,
        healthHealing: 15,
        bonusEffect: "Pure heart blessing",
      },
      killReward: {
        ginto: 55,
        baubles: 1,
        healthHealing: 0,
        bonusEffect: "Deception mastery",
      },
    },
    // Act 1 Elite Enemies
    manananggal: {
      name: "Manananggal",
      spareDialogue:
        "The Manananggal's severed body reunites. 'You could have ended my curse, yet chose mercy. I am... grateful.'",
      killDialogue:
        "The Manananggal's halves scatter to the wind. 'Finally... no more hunger... no more... pain...'",
      spareReward: {
        ginto: 80,
        baubles: 1,
        healthHealing: 20,
        bonusEffect: "Flight blessing",
      },
      killReward: {
        ginto: 120,
        baubles: 2,
        healthHealing: 0,
        bonusEffect: "Vampiric strength",
      },
    },
    aswang: {
      name: "Aswang",
      spareDialogue:
        "The Aswang shifts to its true form. 'You see all my shapes, yet still show kindness. Perhaps there is hope for creatures like me.'",
      killDialogue:
        "The Aswang's many forms flicker rapidly before going still. 'I never... found my true self...'",
      spareReward: {
        ginto: 90,
        baubles: 1,
        healthHealing: 18,
        bonusEffect: "Shapeshifter's wisdom",
      },
      killReward: {
        ginto: 130,
        baubles: 2,
        healthHealing: 0,
        bonusEffect: "Form mastery",
      },
    },
    duwende_chief: {
      name: "Duwende Chief",
      spareDialogue:
        "The Duwende Chief raises his tiny staff in salute. 'Honor to you, great warrior! My people shall sing of your mercy!'",
      killDialogue:
        "The Duwende Chief's final command echoes sadly. 'Tell my people... to remember... the old ways...'",
      spareReward: {
        ginto: 85,
        baubles: 1,
        healthHealing: 16,
        bonusEffect: "Duwende alliance",
      },
      killReward: {
        ginto: 125,
        baubles: 2,
        healthHealing: 0,
        bonusEffect: "Command authority",
      },
    },
    // Act 1 Boss
    bakunawa: {
      name: "Bakunawa",
      spareDialogue:
        "The great dragon's eyes soften. 'You spare the devourer of moons? Your compassion illuminates even the darkest void. I shall remember this light.'",
      killDialogue:
        "Bakunawa's roar shakes the heavens as darkness spreads. 'The eclipse comes... eternal night... awaits...'",
      spareReward: {
        ginto: 150,
        baubles: 3,
        healthHealing: 30,
        bonusEffect: "Dragon's blessing - Moonlight protection",
      },
      killReward: {
        ginto: 200,
        baubles: 5,
        healthHealing: 0,
        bonusEffect: "Eclipse power - Darkness control",
      },
    },
  };

  constructor() {
    super({ key: "Combat" });
    this.battleStartDialogueContainer = null;
  }

  create(data: { nodeType: string, transitionOverlay?: any }): void {
    // Add forest background
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "forest_bg");
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Initialize combat state
    this.initializeCombat(data.nodeType);

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
   * Show Celeste-style dialogue at start of battle
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
    
    // Create dialogue box
    const dialogueBox = this.add.rectangle(
      screenWidth / 2,
      screenHeight - 100,
      screenWidth * 0.8,
      120,
      0xffffff
    ).setScrollFactor(0).setDepth(5001);
    
    // Create dialogue text
    const dialogueText = this.add.text(
      screenWidth / 2,
      screenHeight - 100,
      `A wild ${this.combatState.enemy.name} appears!`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#000000",
        align: "center",
        wordWrap: { width: screenWidth * 0.7 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
    
    // Create continue indicator
    const continueIndicator = this.add.text(
      screenWidth / 2 + dialogueText.width / 2 - 20,
      screenHeight - 60,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#000000"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
    
    // Create container for all dialogue elements
    this.battleStartDialogueContainer = this.add.container(0, 0, [
      overlay,
      dialogueBox,
      dialogueText,
      continueIndicator
    ]).setScrollFactor(0).setDepth(5000);
    
    // Make the dialogue box interactive so it can be clicked to continue
    this.battleStartDialogueContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, screenWidth, screenHeight), Phaser.Geom.Rectangle.Contains);
    
    // Add click handler to remove the dialogue and show enemy dialogue
    this.battleStartDialogueContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: this.battleStartDialogueContainer,
        alpha: 0,
        duration: 300,
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
    
    // Add blinking animation to the continue indicator
    this.time.addEvent({
      delay: 500,
      callback: () => {
        continueIndicator.setVisible(!continueIndicator.visible);
      },
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Show Celeste-style enemy dialogue at top of screen
   */
  private showEnemyDialogue(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create dialogue box at top
    const dialogueBox = this.add.rectangle(
      screenWidth / 2,
      80,
      screenWidth * 0.8,
      100,
      0xffffff
    ).setScrollFactor(0).setDepth(5001);
    
    // Determine which enemy sprite to use based on enemy type
    let enemySpriteKey = "balete"; // default
    
    // Check enemy name to determine sprite
    const enemyName = this.combatState.enemy.name.toLowerCase();
    if (enemyName.includes("balete")) {
      enemySpriteKey = "balete";
    } else if (enemyName.includes("sigbin")) {
      enemySpriteKey = "sigbin";
    } else if (enemyName.includes("tikbalang")) {
      enemySpriteKey = "tikbalang";
    } else {
      // Alternate between the three sprites for other enemies
      const spriteOptions = ["balete", "sigbin", "tikbalang"];
      const randomIndex = Math.floor(Math.random() * spriteOptions.length);
      enemySpriteKey = spriteOptions[randomIndex];
    }
    
    // Create enemy icon
    let enemyIcon: Phaser.GameObjects.Sprite | null = null;
    if (this.textures.exists(enemySpriteKey)) {
      enemyIcon = this.add.sprite(
        (screenWidth / 2) - (screenWidth * 0.8 / 2) + 40,
        80,
        enemySpriteKey
      ).setScale(1.5).setScrollFactor(0).setDepth(5002);
    }
    
    // Create enemy name text
    const enemyNameText = this.add.text(
      (screenWidth / 2) - (screenWidth * 0.8 / 2) + 80,
      60,
      this.combatState.enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#000000",
        align: "left"
      }
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(5002);
    
    // Create enemy dialogue text
    const enemyDialogueText = this.add.text(
      (screenWidth / 2) - (screenWidth * 0.8 / 2) + 80,
      90,
      this.getEnemyDialogue(),
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#000000",
        align: "left",
        wordWrap: { width: screenWidth * 0.8 - 100 }
      }
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(5002);
    
    // Create continue indicator
    const continueIndicator = this.add.text(
      screenWidth / 2 + (screenWidth * 0.8 / 2) - 20,
      110,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#000000"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
    
    // Create container for all enemy dialogue elements
    const enemyDialogueContainer = this.add.container(0, 0, [
      dialogueBox,
      enemyIcon,
      enemyNameText,
      enemyDialogueText,
      continueIndicator
    ]).setScrollFactor(0).setDepth(5000);
    
    // Make the dialogue box interactive so it can be clicked to continue
    enemyDialogueContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, screenWidth, 160), Phaser.Geom.Rectangle.Contains);
    
    // Add click handler to remove the dialogue
    enemyDialogueContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: enemyDialogueContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          enemyDialogueContainer.destroy();
        }
      });
    });
    
    // Add blinking animation to the continue indicator
    this.time.addEvent({
      delay: 500,
      callback: () => {
        continueIndicator.setVisible(!continueIndicator.visible);
      },
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Get enemy dialogue based on enemy type
   */
  private getEnemyDialogue(): string {
    const enemyName = this.combatState.enemy.name.toLowerCase();
    
    // Specific dialogues for known enemies
    if (enemyName.includes("balete")) {
      return "The ancient tree spirit awakens! You dare disturb my slumber?";
    } else if (enemyName.includes("sigbin")) {
      return "You cannot escape my grasp, mortal! Prepare to be drained!";
    } else if (enemyName.includes("tikbalang")) {
      return "Lost, are you? Let me lead you to your doom!";
    } else if (enemyName.includes("goblin")) {
      return "You're no match for the forest goblins! Get them!";
    } else if (enemyName.includes("manananggal")) {
      return "My hunger knows no bounds! I will feast on your soul!";
    } else if (enemyName.includes("aswang")) {
      return "Fear my curse! Your flesh will be my sustenance!";
    } else if (enemyName.includes("duwende")) {
      return "Intruder! You shall not pass the chief's domain!";
    } else if (enemyName.includes("kapre")) {
      return "You dare enter my tree? Face my wrath!";
    } else if (enemyName.includes("tiyanak")) {
      return "Cry, baby, cry! Your tears will be my delight!";
    } else if (enemyName.includes("bakunawa")) {
      return "The eclipse approaches! Your world will be consumed!";
    }
    
    // Default dialogue
    return "You have encountered a fearsome creature! Prepare for battle!";
  }

  /**
   * Show Celeste-style dialogue when enemy reaches 50% health
   */
  private showHalfHealthDialogue(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create dialogue box at top
    const dialogueBox = this.add.rectangle(
      screenWidth / 2,
      80,
      screenWidth * 0.8,
      100,
      0xffffff
    ).setScrollFactor(0).setDepth(5001);
    
    // Determine which enemy sprite to use based on enemy type
    let enemySpriteKey = "balete"; // default
    
    // Check enemy name to determine sprite
    const enemyName = this.combatState.enemy.name.toLowerCase();
    if (enemyName.includes("balete")) {
      enemySpriteKey = "balete";
    } else if (enemyName.includes("sigbin")) {
      enemySpriteKey = "sigbin";
    } else if (enemyName.includes("tikbalang")) {
      enemySpriteKey = "tikbalang";
    } else {
      // Alternate between the three sprites for other enemies
      const spriteOptions = ["balete", "sigbin", "tikbalang"];
      const randomIndex = Math.floor(Math.random() * spriteOptions.length);
      enemySpriteKey = spriteOptions[randomIndex];
    }
    
    // Create enemy icon
    let enemyIcon: Phaser.GameObjects.Sprite | null = null;
    if (this.textures.exists(enemySpriteKey)) {
      enemyIcon = this.add.sprite(
        (screenWidth / 2) - (screenWidth * 0.8 / 2) + 40,
        80,
        enemySpriteKey
      ).setScale(1.5).setScrollFactor(0).setDepth(5002);
    }
    
    // Create enemy name text
    const enemyNameText = this.add.text(
      (screenWidth / 2) - (screenWidth * 0.8 / 2) + 80,
      60,
      this.combatState.enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#000000",
        align: "left"
      }
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(5002);
    
    // Create enemy dialogue text
    const enemyDialogueText = this.add.text(
      (screenWidth / 2) - (screenWidth * 0.8 / 2) + 80,
      90,
      this.getHalfHealthDialogue(),
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#000000",
        align: "left",
        wordWrap: { width: screenWidth * 0.8 - 100 }
      }
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(5002);
    
    // Create continue indicator
    const continueIndicator = this.add.text(
      screenWidth / 2 + (screenWidth * 0.8 / 2) - 20,
      110,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#000000"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
    
    // Create container for all enemy dialogue elements
    const halfHealthDialogueContainer = this.add.container(0, 0, [
      dialogueBox,
      enemyIcon,
      enemyNameText,
      enemyDialogueText,
      continueIndicator
    ]).setScrollFactor(0).setDepth(5000);
    
    // Make the dialogue box interactive so it can be clicked to continue
    halfHealthDialogueContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, screenWidth, 160), Phaser.Geom.Rectangle.Contains);
    
    // Add click handler to remove the dialogue
    halfHealthDialogueContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: halfHealthDialogueContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          halfHealthDialogueContainer.destroy();
        }
      });
    });
    
    // Add blinking animation to the continue indicator
    this.time.addEvent({
      delay: 500,
      callback: () => {
        continueIndicator.setVisible(!continueIndicator.visible);
      },
      callbackScope: this,
      loop: true
    });
  }

  /**
   * Get enemy dialogue for when they reach 50% health
   */
  private getHalfHealthDialogue(): string {
    const enemyName = this.combatState.enemy.name.toLowerCase();
    
    // Specific dialogues for known enemies at 50% health
    if (enemyName.includes("balete")) {
      return "The roots of my power run deep! You cannot fell me so easily!";
    } else if (enemyName.includes("sigbin")) {
      return "My strength is not yet spent! I will drain you dry!";
    } else if (enemyName.includes("tikbalang")) {
      return "Foolish mortal! I have many tricks yet to show you!";
    } else if (enemyName.includes("goblin")) {
      return "We're just getting started! Feel our true power!";
    } else if (enemyName.includes("manananggal")) {
      return "You think you've won? My hunger only grows stronger!";
    } else if (enemyName.includes("aswang")) {
      return "You cannot escape my curse! I will consume your very soul!";
    } else if (enemyName.includes("duwende")) {
      return "The chief's power is not so easily diminished!";
    } else if (enemyName.includes("kapre")) {
      return "My tree grants me endless strength! You cannot prevail!";
    } else if (enemyName.includes("tiyanak")) {
      return "My tears of blood will be your downfall!";
    } else if (enemyName.includes("bakunawa")) {
      return "The eclipse strengthens me! You cannot stop the coming darkness!";
    }
    
    // Default dialogue
    return "You think you've won? I'm just getting started!";
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
        baubles: existingPlayerData.baubles || 0,
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
        baubles: 0,
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

    // Player name
    this.add
      .text(playerX, playerY - 120, this.combatState.player.name, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display
    this.playerHealthText = this.add
      .text(playerX, playerY + 80, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display
    this.playerBlockText = this.add
      .text(playerX, playerY + 105, "", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#4ecdc4",
        align: "center",
      })
      .setOrigin(0.5);

    this.playerStatusContainer = this.add.container(playerX, playerY + 130);

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

    // Determine which enemy sprite to use based on enemy type
    let enemySpriteKey = "balete"; // default
    let enemyAnimationKey = "balete_idle"; // default
    
    // Check enemy name to determine sprite
    const enemyName = this.combatState.enemy.name.toLowerCase();
    if (enemyName.includes("balete")) {
      enemySpriteKey = "balete";
      enemyAnimationKey = "balete_idle";
    } else if (enemyName.includes("sigbin")) {
      enemySpriteKey = "sigbin";
      enemyAnimationKey = "sigbin_idle";
    } else if (enemyName.includes("tikbalang")) {
      enemySpriteKey = "tikbalang";
      enemyAnimationKey = "tikbalang_idle";
    } else {
      // Alternate between the three sprites for other enemies
      const spriteOptions = [
        { key: "balete", anim: "balete_idle" },
        { key: "sigbin", anim: "sigbin_idle" },
        { key: "tikbalang", anim: "tikbalang_idle" }
      ];
      const randomIndex = Math.floor(Math.random() * spriteOptions.length);
      enemySpriteKey = spriteOptions[randomIndex].key;
      enemyAnimationKey = spriteOptions[randomIndex].anim;
    }

    // Enemy sprite with idle animation
    this.enemySprite = this.add.sprite(enemyX, enemyY, enemySpriteKey);
    this.enemySprite.setScale(2.5); // Scale up from 75x100 to 187x250 (bigger than player)

    // Try to play animation, fallback if it fails
    try {
      this.enemySprite.play(enemyAnimationKey);
    } catch (error) {
      console.warn(`Enemy idle animation ${enemyAnimationKey} not found, using static sprite`);
    }

    // Enemy name (positioned further from enemy due to larger sprite)
    this.add
      .text(enemyX, enemyY - 170, this.combatState.enemy.name, {
        fontFamily: "dungeon-mode",
        fontSize: 28, // Larger font size
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display (positioned further from enemy due to larger sprite)
    this.enemyHealthText = this.add
      .text(enemyX, enemyY - 140, "", {
        fontFamily: "dungeon-mode",
        fontSize: 24, // Larger font size
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display (positioned further from enemy due to larger sprite)
    this.enemyBlockText = this.add
      .text(enemyX, enemyY - 110, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#4ecdc4",
        align: "center",
      })
      .setOrigin(0.5);

    // Intent display (positioned further from enemy due to larger sprite)
    this.enemyIntentText = this.add
      .text(enemyX, enemyY + 170, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#feca57",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);

    // Status effects container
    this.enemyStatusContainer = this.add.container(enemyX, enemyY + 200);

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
    // Clear existing buttons
    this.actionButtons.removeAll(true);

    const screenWidth = this.cameras.main.width;
    const baseSpacing = 240; // Increased from 190 for better button separation
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const adjustedSpacing = baseSpacing * scaleFactor;

    if (this.combatState.phase === "player_turn") {
      // Card selection phase
      const playButton = this.createButton(-adjustedSpacing, 0, "Play Hand", () => {
        this.playSelectedCards();
      });

      const sortRankButton = this.createButton(-adjustedSpacing/3, 0, "Sort: Rank", () => {
        this.sortHand("rank");
      });

      const sortSuitButton = this.createButton(adjustedSpacing/3, 0, "Sort: Suit", () => {
        this.sortHand("suit");
      });

      const discardButton = this.createButton(adjustedSpacing, 0, "Discard", () => {
        this.discardSelectedCards();
      });

      this.actionButtons.add([
        playButton,
        sortRankButton,
        sortSuitButton,
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

      const specialTooltip = this.add
        .text(buttonSpacing, 30, this.getSpecialActionName(dominantSuit), {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(14 * scaleFactor),
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 5, y: 5 },
        })
        .setOrigin(0.5)
        .setVisible(false);

      specialButton.on("pointerover", () => {
        specialTooltip.setVisible(true);
      });

      specialButton.on("pointerout", () => {
        specialTooltip.setVisible(false);
      });

      this.actionButtons.add([attackButton, defendButton, specialButton, specialTooltip]);
    }
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
      this.scene.start("PokerHandReference");
    });
    
    // Also make the text interactive and link it to the same event
    infoText.setInteractive();
    infoText.on("pointerdown", () => {
      this.scene.start("PokerHandReference");
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

      const tooltip = this.add
        .text(x, spacing, relic.name + "\n" + relic.description, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(14 * scaleFactor),
          backgroundColor: "#000",
          padding: { x: 5, y: 5 },
        })
        .setVisible(false);

      relicText.on("pointerover", () => {
        tooltip.setVisible(true);
      });

      relicText.on("pointerout", () => {
        tooltip.setVisible(false);
      });

      this.relicsContainer.add([relicText, tooltip]);
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
   * Create a button with text and callback
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const screenWidth = this.cameras.main.width;
    const baseButtonWidth = 120;
    const baseButtonHeight = 35;
    
    // Scale button size based on screen width
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(16 * scaleFactor),
      color: "#e8eced",
      align: "center"
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 20;
    const buttonWidth = Math.max(baseButtonWidth, textWidth + padding); // Minimum width of baseButtonWidth
    const buttonHeight = Math.max(baseButtonHeight, textHeight + 10); // Minimum height of baseButtonHeight

    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scaleFactor),
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    button.on("pointerdown", () => {
      // Check if action processing is active
      if (this.isActionProcessing) {
        console.log("Action processing, ignoring button click");
        return;
      }
      callback();
    });
    button.on("pointerover", () => bg.setFillStyle(0x3d4454));
    button.on("pointerout", () => bg.setFillStyle(0x2f3542));

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
   * Update hand display with a curved fanned-out arrangement
   */
  private updateHandDisplay(): void {
    // Don't update if cards are currently being drawn
    if (this.isDrawingCards) {
      return;
    }
    
    // Clear existing card sprites
    this.cardSprites.forEach((sprite) => sprite.destroy());
    this.cardSprites = [];

    const hand = this.combatState.player.hand;
    const cardWidth = 60;
    const totalWidth = hand.length * cardWidth;
    const screenWidth = this.cameras.main.width;
    
    // Limit the total width to 80% of screen width to prevent overflow
    const maxWidth = screenWidth * 0.8;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / hand.length) : cardWidth;
    const actualTotalWidth = hand.length * actualCardWidth;
    const startX = -actualTotalWidth / 2 + actualCardWidth / 2;

    // Create a very gentle curved arrangement for the cards (like Balatro)
    const curveHeight = 5; // Much smaller curve height for a flatter arch
    
    hand.forEach((card, index) => {
      // Calculate position along a very gentle curve
      const positionRatio = hand.length > 1 ? index / (hand.length - 1) : 0.5;
      
      // Calculate x and y positions with a very gentle arch curve
      const x = startX + index * actualCardWidth;
      // Create a very subtle arch that peaks in the middle
      const y = -Math.sin(positionRatio * Math.PI) * curveHeight;
      
      const cardSprite = this.createCardSprite(
        card,
        x,
        y
      );
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
    });
  }

  /**
   * Create a card sprite
   */
  private createCardSprite(
    card: PlayingCard,
    x: number,
    y: number,
    interactive: boolean = true
  ): Phaser.GameObjects.Container {
    const cardContainer = this.add.container(0, 0);

    // Calculate card dimensions based on screen size
    const screenWidth = this.cameras.main.width;
    const baseCardWidth = 80;  // Increased from 50
    const baseCardHeight = 112; // Increased from 70
    
    // Scale card size based on screen width, but keep minimum size
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
    
    // Add a border that changes when selected
    const border = this.add.rectangle(
      0,
      0,
      cardWidth + 4,
      cardHeight + 4,
      0x000000,
      0  // No fill
    );
    border.setStrokeStyle(2, 0x2ed573);
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
      
      // Card selection
      cardContainer.on("pointerdown", () => this.selectCard(card));
      
      // Hover effects
      cardContainer.on("pointerover", () => {
        // Lift card up and slightly scale it
        this.tweens.add({
          targets: cardContainer,
          y: y - 15, // Lift up by 15 pixels
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2.easeOut'
        });
        
        // Add subtle glow effect by adjusting tint
        const cardSprite = cardContainer.list[0] as Phaser.GameObjects.Sprite;
        cardSprite.setTint(0xffffff); // Brighten the card
      });
      
      cardContainer.on("pointerout", () => {
        // Return to original position and scale
        this.tweens.add({
          targets: cardContainer,
          y: y, // Return to original position
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2.easeOut'
        });
        
        // Remove glow effect
        const cardSprite = cardContainer.list[0] as Phaser.GameObjects.Sprite;
        cardSprite.clearTint();
      });
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
   * Select/deselect a card with popup animation
   */
  private selectCard(card: PlayingCard): void {
    // If trying to select a new card when already 5 are selected, ignore
    if (!card.selected && this.selectedCards.length >= 5) {
      this.showActionResult("Cannot select more than 5 cards!");
      return;
    }

    card.selected = !card.selected;

    if (card.selected) {
      this.selectedCards.push(card);
    } else {
      this.selectedCards = this.selectedCards.filter((c) => c.id !== card.id);
    }

    // Find the card sprite to animate
    const cardIndex = this.combatState.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1 && this.cardSprites[cardIndex]) {
      const cardSprite = this.cardSprites[cardIndex];
      
      // Get the base Y position from the card arrangement
      const hand = this.combatState.player.hand;
      const cardWidth = 60;
      const totalWidth = hand.length * cardWidth;
      const screenWidth = this.cameras.main.width;
      const maxWidth = screenWidth * 0.8;
      const actualCardWidth = totalWidth > maxWidth ? (maxWidth / hand.length) : cardWidth;
      const actualTotalWidth = hand.length * actualCardWidth;
      const startX = -actualTotalWidth / 2 + actualCardWidth / 2;
      const curveHeight = 5;
      const positionRatio = hand.length > 1 ? cardIndex / (hand.length - 1) : 0.5;
      const baseY = -Math.sin(positionRatio * Math.PI) * curveHeight;
      const baseX = startX + cardIndex * actualCardWidth;
      
      // Animate the card with a bounce effect and pop up
      if (card.selected) {
        // Pop up animation - move card up slightly and scale slightly
        this.tweens.add({
          targets: cardSprite,
          x: baseX,
          y: baseY - 20, // Reduced popup height
          scale: 1.05,
          duration: 200,
          ease: 'Power2'
        });
      } else {
        // Return to original position
        this.tweens.add({
          targets: cardSprite,
          x: baseX,
          y: baseY,
          scale: 1.0,
          duration: 200,
          ease: 'Power2'
        });
      }
    }

    // Update card visuals without recreating all cards
    this.updateCardVisuals(card);
    this.updateHandIndicator(); // Update hand indicator when selection changes
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
    
    // Show feedback
    this.showActionResult(`Unplayed ${card.rank} of ${card.suit}`);
  }

  /**
   * Play selected cards (Balatro style - one hand per turn)
   */
  private playSelectedCards(): void {
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
  }

  /**
   * Sort hand by rank or suit
   */
  private sortHand(sortBy: "rank" | "suit"): void {
    // Create shuffling animation before sorting
    this.animateCardShuffle(sortBy, () => {
      // Animation handles the sorting internally
    });
  }

  /**
   * Animate card shuffling effect (Individual card tracking)
   */
  private animateCardShuffle(sortType: "rank" | "suit", onComplete: () => void): void {
    // Store original positions and card data before sorting
    const originalPositions = this.cardSprites.map(cardSprite => ({
      x: cardSprite.x,
      y: cardSprite.y,
      rotation: cardSprite.rotation
    }));
    
    // Store the original card order to track which card goes where
    const originalCards = [...this.combatState.player.hand];
    
    // Sort the hand data to get the new order
    const sortedCards = DeckManager.sortCards([...this.combatState.player.hand], sortType);
    
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
        targetPosition: originalPositions[newIndex] // Where this card should end up
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
              rotation: 0,
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
      this.updateHandDisplay();
      onComplete();
    });
  }

  /**
   * Discard selected cards
   */
  private discardSelectedCards(): void {
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
    this.updateDiscardDisplay(); // Update discard pile display
  }

  /**
   * End player turn
   */
  private endPlayerTurn(): void {
    this.combatState.phase = "enemy_turn";
    this.selectedCards = [];

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
    const targetHandSize = 8;
    const cardsNeeded = targetHandSize - this.combatState.player.hand.length;
    if (cardsNeeded > 0) {
      this.drawCards(cardsNeeded);
    }

    this.updateTurnUI();
    this.updateHandDisplay();
    this.updatePlayedHandDisplay(); // Clear the played hand display
    this.updateActionButtons(); // Reset to card selection buttons
    
    // Ensure action processing is reset
    this.isActionProcessing = false;
    this.setActionButtonsEnabled(true);
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
    if (this.combatState.enemy.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
      console.log(`Vulnerable effect applied, damage increased to ${finalDamage}`);
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

    // Check for 50% health trigger
    const healthPercentage = this.combatState.enemy.currentHealth / this.combatState.enemy.maxHealth;
    if (healthPercentage <= 0.5 && !this.combatState.enemy.halfHealthTriggered) {
      this.combatState.enemy.halfHealthTriggered = true;
      this.showHalfHealthDialogue();
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
    let finalDamage = damage;
    if (this.combatState.player.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
      console.log(`Vulnerable effect applied, damage increased to ${finalDamage}`);
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
    const combatMetrics: CombatMetrics = {
      combatId: `combat_${Date.now()}`,
      timestamp: Date.now(),
      
      // Pre-combat state
      startHealth: this.initialPlayerHealth,
      startMaxHealth: this.combatState.player.maxHealth,
      startGold: this.combatState.player.ginto,
      
      // Combat performance  
      endHealth: this.combatState.player.currentHealth,
      healthPercentage: this.combatState.player.currentHealth / this.initialPlayerHealth,
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

    // Background overlay
    this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth, screenHeight, 0x000000, 0.8);

    // Dialogue box
    const dialogueBoxWidth = Math.min(800, screenWidth * 0.8);
    const dialogueBoxHeight = Math.min(400, screenHeight * 0.6);
    const dialogueBox = this.add.rectangle(screenWidth/2, screenHeight/2, dialogueBoxWidth, dialogueBoxHeight, 0x2f3542);
    dialogueBox.setStrokeStyle(Math.floor(3 * scaleFactor), 0x57606f);

    // Enemy portrait (sprite instead of emoji)
    // Determine which enemy sprite to use based on enemy type
    let enemySpriteKey = "balete"; // default
    
    // Check enemy name to determine sprite
    const enemyName = this.combatState.enemy.name.toLowerCase();
    if (enemyName.includes("balete")) {
      enemySpriteKey = "balete";
    } else if (enemyName.includes("sigbin")) {
      enemySpriteKey = "sigbin";
    } else if (enemyName.includes("tikbalang")) {
      enemySpriteKey = "tikbalang";
    } else {
      // Alternate between the three sprites for other enemies
      const spriteOptions = ["balete", "sigbin", "tikbalang"];
      const randomIndex = Math.floor(Math.random() * spriteOptions.length);
      enemySpriteKey = spriteOptions[randomIndex];
    }
    
    // Create enemy portrait with error handling
    let enemyPortrait: Phaser.GameObjects.Sprite | null = null;
    try {
      // Check if the sprite texture exists before creating
      if (this.textures.exists(enemySpriteKey)) {
        enemyPortrait = this.add.sprite(screenWidth/2, screenHeight/2 - 100, enemySpriteKey);
        enemyPortrait.setScale(3 * scaleFactor);

        // Try to play animation, fallback if it fails
        try {
          enemyPortrait.play("enemy_idle");
        } catch (error) {
          console.warn("Enemy portrait animation not found, using static sprite");
        }
      } else {
        console.warn(`Sprite texture ${enemySpriteKey} not found, skipping portrait`);
      }
    } catch (error) {
      console.error("Error creating enemy portrait:", error);
    }

    // Enemy name (larger font and positioned further from portrait due to larger sprite)
    this.add
      .text(screenWidth/2, screenHeight/2 - 200, dialogue.name, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(28 * scaleFactor), // Larger font size
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Main dialogue text (positioned further down due to larger portrait)
    this.add
      .text(screenWidth/2, screenHeight/2, "You have defeated this creature. What do you choose?", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scaleFactor),
        color: "#e8eced",
        align: "center",
        wordWrap: { width: dialogueBoxWidth * 0.9 }, // Wider word wrap for better readability
      })
      .setOrigin(0.5);

    // Landas choice buttons
    this.createDialogueButton(screenWidth/2 - 150, screenHeight/2 + 100, "Spare", "#2ed573", () =>
      this.makeLandasChoice("spare", dialogue)
    );

    this.createDialogueButton(screenWidth/2 + 150, screenHeight/2 + 100, "Slay", "#ff4757", () =>
      this.makeLandasChoice("kill", dialogue)
    );

    // Current landas display
    const landasTier = this.getLandasTier(this.combatState.player.landasScore);
    const landasColor = this.getLandasColor(landasTier);

    this.add
      .text(
        screenWidth/2,
        screenHeight/2 + 170,
        `Current Landas: ${
          this.combatState.player.landasScore
        } (${landasTier.toUpperCase()})`,
        {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(16 * scaleFactor),
          color: landasColor,
          align: "center",
        }
      )
      .setOrigin(0.5);
  }

  /**
   * Create dialogue button
   */
  private createDialogueButton(
    x: number,
    y: number,
    text: string,
    color: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const buttonWidth = 200 * scaleFactor;
    const buttonHeight = 40 * scaleFactor;

    const button = this.add.container(x, y);

    // Convert hex color to number for Phaser
    const colorNumber = parseInt(color.replace('#', ''), 16);
    
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2f3542);
    bg.setStrokeStyle(Math.floor(2 * scaleFactor), colorNumber);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: color,
        align: "center",
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Fix button events to prevent freezing
    button.on("pointerdown", () => {
      try {
        console.log(`Button clicked: ${text}`);
        // Disable the button to prevent multiple clicks
        button.disableInteractive();
        
        // Remove all button events to prevent further interaction
        button.removeAllListeners();
        
        // Add a small delay before executing callback to ensure UI updates
        this.time.delayedCall(50, () => {
          callback();
        });
      } catch (error) {
        console.error("Error in button click:", error);
      }
    });
    
    button.on("pointerover", () => {
      try {
        bg.setFillStyle(colorNumber);
        buttonText.setColor("#000000");
      } catch (error) {
        console.error("Error in button hover:", error);
      }
    });
    
    button.on("pointerout", () => {
      try {
        bg.setFillStyle(0x2f3542);
        buttonText.setColor(color);
      } catch (error) {
        console.error("Error in button out:", error);
      }
    });

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
      this.combatState.player.baubles += reward.baubles;

      if (reward.healthHealing > 0) {
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + reward.healthHealing
        );
      }

      console.log("Clearing dialogue and showing results...");

      // Clear dialogue and show results
      this.children.removeAll();
      this.cameras.main.setBackgroundColor(0x0e1112);

      // Add small delay before showing rewards screen
      this.time.delayedCall(100, () => {
        this.showRewardsScreen(choice, choiceDialogue, reward, landasChange);
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

    // Baubles reward
    if (reward.baubles > 0) {
      this.add
        .text(screenWidth/2, rewardY, `💎 ${reward.baubles} Bathala Baubles`, {
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
        baubles: this.combatState.player.baubles,
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

      console.log("Player data saved to GameState");

      // Mark the current node as completed
      gameState.completeCurrentNode(true);

      console.log("Node marked as completed, resuming Overworld scene...");

      // Use a more explicit approach to ensure the overworld resumes properly
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        console.log("Overworld scene found, manually calling resume");
        // Manually call the resume method to ensure it's called
        (overworldScene as any).resume();
      }

      // Stop this scene and resume overworld
      this.scene.stop();
      this.scene.resume("Overworld");
      
    } catch (error) {
      console.error("Error in returnToOverworld:", error);
      // Even if there's an error, try to return to overworld
      try {
        this.scene.stop();
        this.scene.resume("Overworld");
      } catch (fallbackError) {
        console.error("Fallback scene resume also failed:", fallbackError);
        // Last resort - restart the game
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
    // Clear existing played card sprites
    this.playedCardSprites.forEach((sprite) => sprite.destroy());
    this.playedCardSprites = [];

    const playedHand = this.combatState.player.playedHand;
    if (playedHand.length === 0) {
      // Hide hand evaluation text when no cards are played
      this.handEvaluationText.setVisible(false);
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
  private getDominantSuit(cards: PlayingCard[]): Suit {
    if (cards.length === 0) return "Apoy";

    const suitCounts = cards.reduce((counts, card) => {
      counts[card.suit] = (counts[card.suit] || 0) + 1;
      return counts;
    }, {} as Record<Suit, number>);

    return Object.entries(suitCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0] as Suit;
  }

  private getSpecialActionName(suit: Suit): string {
    const specialActions: Record<Suit, string> = {
      Apoy: "AoE + Burn",
      Tubig: "Heal + Cleanse",
      Lupa: "Apply Vulnerable",
      Hangin: "Draw + Weak",
    };
    return specialActions[suit];
  }

  private executeAction(actionType: "attack" | "defend" | "special"): void {
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
      actionType
    );
    console.log(`Hand evaluation:`, evaluation);
    
    // Track best hand for DDA
    if (this.isHandBetterThan(evaluation.type, this.bestHandAchieved)) {
      this.bestHandAchieved = evaluation.type;
    }
    
    const dominantSuit = this.getDominantSuit(
      this.combatState.player.playedHand
    );
    console.log(`Dominant suit: ${dominantSuit}`);

    let damage = 0;
    let block = 0;

    // Apply hand bonus
    switch (actionType) {
      case "attack":
        damage += evaluation.totalValue;
        const strength = this.combatState.player.statusEffects.find((e) => e.name === "Strength");
        if (strength) {
          damage += strength.value;
          console.log(`Strength bonus applied: +${strength.value} damage`);
        }
        console.log(`Total attack damage: ${damage}`);
        break;
      case "defend":
        block += evaluation.totalValue;
        const dexterity = this.combatState.player.statusEffects.find((e) => e.name === "Dexterity");
        if (dexterity) {
          block += dexterity.value;
          console.log(`Dexterity bonus applied: +${dexterity.value} block`);
        }
        console.log(`Total block gained: ${block}`);
        break;
      case "special":
        this.showActionResult(this.getSpecialActionName(dominantSuit));
        console.log(`Special action executed: ${this.getSpecialActionName(dominantSuit)}`);
        // Special actions have unique effects based on suit
        break;
    }

    // Apply elemental effects
    this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);

    if (damage > 0) {
      console.log(`Animating player attack and dealing ${damage} damage`);
      this.animatePlayerAttack(); // Add animation when attacking
      this.damageEnemy(damage);
      this.showActionResult(`Attacked for ${damage} damage!`);
    }

    if (block > 0) {
      this.combatState.player.block += block;
      this.updatePlayerUI();
      this.showActionResult(`Gained ${block} block!`);
    }
    
    // Process enemy turn after a short delay to allow player to see results
    this.time.delayedCall(1000, () => {
      console.log("Processing enemy turn");
      // Check if combat has ended or enemy is defeated before processing turn
      if (this.combatEnded || this.combatState.enemy.currentHealth <= 0) {
        console.log("Combat ended or enemy defeated, skipping delayed enemy turn");
        this.isActionProcessing = false;
        this.setActionButtonsEnabled(true);
        return;
      }
      // Process enemy action - the enemy turn will handle resetting the processing flag
      this.executeEnemyTurn();
    });
  }

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
          this.damageEnemy(Math.floor(value * 0.5));
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
          this.drawCards(2);
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
      .text(screenWidth/2, screenHeight/2, "", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(20 * scaleFactor),
        color: "#2ed573",
        align: "center",
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
    
    // Calculate final hand positions
    const screenWidth = this.cameras.main.width;
    const cardWidth = 60;
    const totalWidth = hand.length * cardWidth;
    const maxWidth = screenWidth * 0.8;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / hand.length) : cardWidth;
    const actualTotalWidth = hand.length * actualCardWidth;
    const startX = screenWidth / 2 - actualTotalWidth / 2 + actualCardWidth / 2;
    const handY = this.cameras.main.height - 240; // Match the hand container position
    
    // Create cards at deck position first
    hand.forEach((card, index) => {
      // Create card sprite at deck position - make it interactive from the start
      const cardSprite = this.createCardSprite(card, 0, 0, true);
      
      // Position at deck location initially
      cardSprite.setPosition(this.deckPosition.x, this.deckPosition.y);
      cardSprite.setScale(0.8); // Start smaller
      cardSprite.setAlpha(0.9);
      
      // Add to hand container but position at deck
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
      
      // Calculate final position
      const finalX = startX + index * actualCardWidth - screenWidth / 2;
      const finalY = handY - this.cameras.main.height + 240; // Match the hand container position
      
      // Add slight curve effect
      const curveHeight = 5;
      const positionRatio = hand.length > 1 ? index / (hand.length - 1) : 0.5;
      const curveY = finalY - Math.sin(positionRatio * Math.PI) * curveHeight;
      
      // Animate card flying to hand position
      this.tweens.add({
        targets: cardSprite,
        x: finalX,
        y: curveY,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 300 + index * 50, // Stagger animations
        delay: index * 100, // Delay each card
        ease: 'Power2',
        onComplete: () => {
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

      const tooltip = this.add
        .text(x, spacing, effect.description, {
          fontFamily: "dungeon-mode",
          fontSize: Math.floor(14 * scaleFactor),
          backgroundColor: "#000",
          padding: { x: 5, y: 5 },
        })
        .setVisible(false);

      effectText.on("pointerover", () => {
        tooltip.setVisible(true);
      });

      effectText.on("pointerout", () => {
        tooltip.setVisible(false);
      });

      statusContainer.add([effectText, tooltip]);
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
          child.input.enabled = enabled;
          // Visually indicate disabled state
          const bg = child.getAt(0) as Phaser.GameObjects.Rectangle;
          if (bg) {
            bg.setFillStyle(enabled ? 0x2f3542 : 0x1a1d26);
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


  

  


  /**\n   * Handle scene resize\n   */
  private handleResize(): void {
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
   * Show elegant relic tooltip (just the name on hover)
   */
  private showRelicTooltip(name: string, x: number, y: number): void {
    // Clean up any existing tooltip
    this.hideRelicTooltip();
    
    const tooltip = this.add.container(x, y);
    tooltip.name = 'relicTooltip';
    
    // Shadow for depth
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-name.length * 3.5 - 12, -18, name.length * 7 + 24, 36, 6);
    
    // Main background with gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2a1f3d, 0x2a1f3d, 0x1e1528, 0x1e1528, 1);
    bg.fillRoundedRect(-name.length * 3.5 - 10, -16, name.length * 7 + 20, 32, 6);
    bg.lineStyle(2, 0x7c3aed, 0.8);
    bg.strokeRoundedRect(-name.length * 3.5 - 10, -16, name.length * 7 + 20, 32, 6);
    
    // Text with elegant styling
    const text = this.add.text(0, 0, name, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#e9d5ff",
      align: "center"
    }).setOrigin(0.5);
    text.setShadow(1, 1, '#1a1625', 2, false, true);
    
    tooltip.add([shadow, bg, text]);
    
    // Smooth entrance animation
    tooltip.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: tooltip,
      scale: 1,
      alpha: 1,
      duration: 150,
      ease: 'Back.easeOut'
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
    
    // Modal panel
    const modalWidth = Math.min(400, screenWidth - 40);
    const modalHeight = Math.min(250, screenHeight - 40);
    
    // Shadow for modal
    const modalShadow = this.add.graphics();
    modalShadow.fillStyle(0x000000, 0.5);
    modalShadow.fillRoundedRect(-modalWidth/2 + 5, -modalHeight/2 + 5, modalWidth, modalHeight, 12);
    
    // Main modal background
    const modalBg = this.add.graphics();
    modalBg.fillGradientStyle(0x2a1f3d, 0x2a1f3d, 0x1e1528, 0x1e1528, 1);
    modalBg.fillRoundedRect(-modalWidth/2, -modalHeight/2, modalWidth, modalHeight, 12);
    modalBg.lineStyle(3, 0x7c3aed, 0.9);
    modalBg.strokeRoundedRect(-modalWidth/2, -modalHeight/2, modalWidth, modalHeight, 12);
    
    // Relic emoji/icon at the top
    const relicIcon = this.add.text(0, -modalHeight/2 + 40, relic.emoji, {
      fontSize: 32,
      align: "center"
    }).setOrigin(0.5);
    
    // Relic name
    const nameText = this.add.text(0, -modalHeight/2 + 80, relic.name, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffd93d",
      align: "center"
    }).setOrigin(0.5);
    nameText.setShadow(2, 2, '#1a1625', 2, false, true);
    
    // Relic description with word wrap
    const descText = this.add.text(0, -modalHeight/2 + 120, relic.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e9d5ff",
      align: "center",
      wordWrap: { width: modalWidth - 40 }
    }).setOrigin(0.5);
    descText.setShadow(1, 1, '#1a1625', 2, false, true);
    
    // Close button
    const closeButton = this.add.container(0, modalHeight/2 - 30);
    const closeBg = this.add.rectangle(0, 0, 80, 30, 0x4a4a4a, 0.9);
    closeBg.setStrokeStyle(2, 0x7c3aed);
    const closeText = this.add.text(0, 0, "Close", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e9d5ff"
    }).setOrigin(0.5);
    
    closeButton.add([closeBg, closeText]);
    closeButton.setInteractive(new Phaser.Geom.Rectangle(-40, -15, 80, 30), Phaser.Geom.Rectangle.Contains);
    
    // Add all elements to overlay
    overlay.add([darkBg, modalShadow, modalBg, relicIcon, nameText, descText, closeButton]);
    
    // Entrance animation
    overlay.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: overlay,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // Close handlers
    const closeModal = () => {
      this.tweens.add({
        targets: overlay,
        scale: 0.8,
        alpha: 0,
        duration: 150,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
        }
      });
    };
    
    darkBg.on('pointerdown', closeModal);
    closeButton.on('pointerdown', closeModal);
    
    // Hover effect for close button
    closeButton.on('pointerover', () => {
      closeBg.setFillStyle(0x5a5a5a, 0.9);
    });
    
    closeButton.on('pointerout', () => {
      closeBg.setFillStyle(0x4a4a4a, 0.9);
    });
  }
}

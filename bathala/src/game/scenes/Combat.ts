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
  HandType,
  StatusEffect,
} from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { HandEvaluator } from "../../utils/HandEvaluator";
import {
  getRandomCommonEnemy,
  getRandomEliteEnemy,
  getBossEnemy,
} from "../../data/enemies/Act1Enemies";
import { GameState } from "../../core/managers/GameState";

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

  // Sprite references for animations
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;

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
        baubles: 0,
        healthHealing: 10,
        bonusEffect: "Forest spirits may aid you later",
      },
      killReward: {
        ginto: 75,
        baubles: 1,
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
  }

  create(data: { nodeType: string }): void {
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Initialize combat state
    this.initializeCombat(data.nodeType);

    // Create UI elements
    this.createCombatUI();

    // Draw initial hand
    this.drawInitialHand();

    // Start player turn
    this.startPlayerTurn();
  }

  /**
   * Initialize combat state with player and enemy
   */
  private initializeCombat(nodeType: string): void {
    const deck = DeckManager.createFullDeck();
    const { drawnCards, remainingDeck } = DeckManager.drawCards(deck, 8); // Draw 8 cards

    const player: Player = {
      id: "player",
      name: "Hero",
      maxHealth: 80,
      currentHealth: 80,
      block: 0,
      statusEffects: [],
      hand: drawnCards,
      deck: remainingDeck,
      discardPile: [],
      drawPile: remainingDeck,
      playedHand: [],
      landasScore: 0, // Start with neutral landas
      ginto: 100, // Starting currency
      baubles: 0, // Premium currency
      relics: [
        {
          id: "placeholder_relic",
          name: "Placeholder Relic",
          description: "This is a placeholder relic.",
          emoji: "⚙️",
        },
      ],
    };

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
    // Title
    this.add
      .text(512, 30, "Combat - Forest Encounter", {
        fontFamily: "Chivo",
        fontSize: 24,
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
  }

  /**
   * Create player UI elements
   */
  private createPlayerUI(): void {
    const playerX = 200;
    const playerY = 300;

    // Player sprite with idle animation
    this.playerSprite = this.add.sprite(playerX, playerY, "combat_player");
    this.playerSprite.setScale(2); // Scale up from 32x64 to 64x128
    this.playerSprite.setFlipX(true); // Flip to face right (toward enemy)

    // Try to play animation, fallback if it fails
    try {
      this.playerSprite.play("player_idle");
    } catch (error) {
      console.warn("Player idle animation not found, using static sprite");
    } // Player name
    this.add
      .text(playerX, playerY - 120, this.combatState.player.name, {
        fontFamily: "Chivo",
        fontSize: 20,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display
    this.playerHealthText = this.add
      .text(playerX, playerY + 80, "", {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display
    this.playerBlockText = this.add
      .text(playerX, playerY + 105, "", {
        fontFamily: "Chivo",
        fontSize: 16,
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
    const enemyX = 824;
    const enemyY = 300;

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
        fontFamily: "Chivo",
        fontSize: 24, // Larger font size
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display (positioned further from enemy due to larger sprite)
    this.enemyHealthText = this.add
      .text(enemyX, enemyY - 140, "", {
        fontFamily: "Chivo",
        fontSize: 20, // Larger font size
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display (positioned further from enemy due to larger sprite)
    this.enemyBlockText = this.add
      .text(enemyX, enemyY - 110, "", {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#4ecdc4",
        align: "center",
      })
      .setOrigin(0.5);

    // Intent display (positioned further from enemy due to larger sprite)
    this.enemyIntentText = this.add
      .text(enemyX, enemyY + 170, "", {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#feca57",
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);

    // Update the health and block text
    this.updateEnemyUI();
  }

  /**
   * Create hand UI container
   */
  private createHandUI(): void {
    this.handContainer = this.add.container(512, 600);
    this.updateHandDisplay();
  }

  /**
   * Create played hand UI container
   */
  private createPlayedHandUI(): void {
    this.playedHandContainer = this.add.container(512, 400);
  }

  /**
   * Create action buttons
   */
  private createActionButtons(): void {
    this.actionButtons = this.add.container(512, 520);
    this.updateActionButtons();
  }

  /**
   * Update action buttons based on current phase
   */
  private updateActionButtons(): void {
    // Clear existing buttons
    this.actionButtons.removeAll(true);

    if (this.combatState.phase === "player_turn") {
      // Card selection phase
      const playButton = this.createButton(-80, 0, "Play Hand", () => {
        this.playSelectedCards();
      });

      const sortRankButton = this.createButton(80, 0, "Sort: Rank", () => {
        this.sortHand("rank");
      });

      const sortSuitButton = this.createButton(-80, 30, "Sort: Suit", () => {
        this.sortHand("suit");
      });

      const discardButton = this.createButton(80, 30, "Discard", () => {
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

      const attackButton = this.createButton(-80, 0, "Attack", () => {
        this.executeAction("attack");
      });

      const defendButton = this.createButton(0, 0, "Defend", () => {
        this.executeAction("defend");
      });

      const specialButton = this.createButton(
        80,
        0,
        "Special",
        () => {
          this.executeAction("special");
        }
      );

      const specialTooltip = this.add
        .text(80, 30, this.getSpecialActionName(dominantSuit), {
          fontFamily: "Chivo",
          fontSize: 12,
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
    this.turnText = this.add.text(50, 100, "", {
      fontFamily: "Chivo",
      fontSize: 16,
      color: "#e8eced",
    });

    this.actionsText = this.add.text(50, 130, "", {
      fontFamily: "Chivo",
      fontSize: 14,
      color: "#ffd93d",
    });

    // Hand indicator text - shows current selected hand type
    this.handIndicatorText = this.add.text(50, 160, "", {
      fontFamily: "Chivo",
      fontSize: 14,
      color: "#4ecdc4",
    });

    this.updateTurnUI();
  }

  /**
   * Create relics UI container
   */
  private createRelicsUI(): void {
    this.relicsContainer = this.add.container(100, 50);
    this.updateRelicsUI();
  }

  /**
   * Update relics UI display
   */
  private updateRelicsUI(): void {
    this.relicsContainer.removeAll(true);

    const relics = this.combatState.player.relics;
    let x = 0;

    relics.forEach((relic) => {
      const relicText = this.add
        .text(x, 0, relic.emoji, {
          fontSize: 24,
        })
        .setInteractive();

      const tooltip = this.add
        .text(x, 30, relic.name + "\n" + relic.description, {
          fontSize: 12,
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
      x += 30;
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
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 100, 25, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "Chivo",
        fontSize: 12,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-50, -12.5, 100, 25),
      Phaser.Geom.Rectangle.Contains
    );
    button.on("pointerdown", callback);
    button.on("pointerover", () => bg.setFillStyle(0x3d4454));
    button.on("pointerout", () => bg.setFillStyle(0x2f3542));

    return button;
  }

  /**
   * Draw initial hand of cards
   */
  private drawInitialHand(): void {
    // Hand is already drawn in initializeCombat
    this.updateHandDisplay();
  }

  /**
   * Update hand display
   */
  private updateHandDisplay(): void {
    // Clear existing card sprites
    this.cardSprites.forEach((sprite) => sprite.destroy());
    this.cardSprites = [];

    const hand = this.combatState.player.hand;
    const cardWidth = 60;
    const startX = -(hand.length * cardWidth) / 2 + cardWidth / 2;

    hand.forEach((card, index) => {
      const cardSprite = this.createCardSprite(
        card,
        startX + index * cardWidth,
        0
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
    const cardContainer = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(
      0,
      0,
      50,
      70,
      card.selected ? 0x4ecdc4 : 0xffffff
    );
    bg.setStrokeStyle(2, card.selected ? 0x2ed573 : 0x2f3542);

    // Card rank
    const rankText = this.add
      .text(-15, -20, card.rank, {
        fontSize: 12,
        color: "#000000",
      })
      .setOrigin(0.5);

    // Card suit
    const display = DeckManager.getCardDisplay(card);
    const suitText = this.add
      .text(15, -20, display.symbol, {
        fontSize: 12,
        color: display.color,
      })
      .setOrigin(0.5);

    // Element symbol
    const elementText = this.add
      .text(0, 10, display.elementSymbol, {
        fontSize: 16,
      })
      .setOrigin(0.5);

    cardContainer.add([bg, rankText, suitText, elementText]);

    // Make interactive only for hand cards
    if (interactive) {
      cardContainer.setInteractive(
        new Phaser.Geom.Rectangle(-25, -35, 50, 70),
        Phaser.Geom.Rectangle.Contains
      );
      cardContainer.on("pointerdown", () => this.selectCard(card));
    }

    return cardContainer;
  }

  /**
   * Select/deselect a card
   */
  private selectCard(card: PlayingCard): void {
    card.selected = !card.selected;

    if (card.selected) {
      this.selectedCards.push(card);
    } else {
      this.selectedCards = this.selectedCards.filter((c) => c.id !== card.id);
    }

    this.updateHandDisplay();
    this.updateHandIndicator(); // Update hand indicator when selection changes
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
    this.combatState.player.hand = DeckManager.sortCards(
      this.combatState.player.hand,
      sortBy
    );
    this.updateHandDisplay();
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

    // Clear selection
    this.selectedCards = [];

    this.updateHandDisplay();
    this.updateTurnUI();
    this.updateHandIndicator(); // Update hand indicator after discarding
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
    this.applyStatusEffects(this.combatState.enemy);

    const enemy = this.combatState.enemy;

    // Apply enemy action based on intent
    if (enemy.intent.type === "attack") {
      let damage = enemy.intent.value;
      if (enemy.statusEffects.some((e) => e.name === "Weak")) {
        damage *= 0.5;
      }
      this.damagePlayer(damage);
    }

    // Update enemy intent for next turn
    this.updateEnemyIntent();

    // Start new player turn
    setTimeout(() => {
      this.startPlayerTurn();
    }, 1500);
  }

  /**
   * Start player turn (Balatro style)
   */
  private startPlayerTurn(): void {
    this.applyStatusEffects(this.combatState.player);

    this.combatState.phase = "player_turn";
    this.combatState.turn++;

    // Reset discard counter (only 3 discards per turn)
    this.discardsUsedThisTurn = 0;

    // Clear any selected cards from previous turn
    this.selectedCards = [];

    // Draw cards to ensure player has 8 cards at start of turn
    const targetHandSize = 8;
    const cardsNeeded = targetHandSize - this.combatState.player.hand.length;
    if (cardsNeeded > 0) {
      this.drawCards(cardsNeeded);
    }

    this.updateTurnUI();
    this.updateHandDisplay();
    this.updateActionButtons(); // Reset to card selection buttons
  }

  /**
   * Draw cards from deck
   */
  private drawCards(count: number): void {
    const { drawnCards, remainingDeck } = DeckManager.drawCards(
      this.combatState.player.drawPile,
      count
    );

    this.combatState.player.hand.push(...drawnCards);
    this.combatState.player.drawPile = remainingDeck;

    // If deck is empty, shuffle discard pile back into deck
    if (
      this.combatState.player.drawPile.length === 0 &&
      this.combatState.player.discardPile.length > 0
    ) {
      this.combatState.player.drawPile = DeckManager.shuffleDeck(
        this.combatState.player.discardPile
      );
      this.combatState.player.discardPile = [];
    }
  }

  /**
   * Apply damage to enemy
   */
  private damageEnemy(damage: number): void {
    let finalDamage = damage;
    if (this.combatState.enemy.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
    }
    const actualDamage = Math.max(0, finalDamage - this.combatState.enemy.block);
    this.combatState.enemy.currentHealth -= actualDamage;
    this.combatState.enemy.block = Math.max(
      0,
      this.combatState.enemy.block - finalDamage
    );

    // Add visual feedback for enemy taking damage
    this.animateSpriteDamage(this.enemySprite);

    if (this.combatState.enemy.currentHealth <= 0) {
      this.endCombat(true);
    }
  }

  /**
   * Apply damage to player
   */
  private damagePlayer(damage: number): void {
    let finalDamage = damage;
    if (this.combatState.player.statusEffects.some((e) => e.name === "Vulnerable")) {
      finalDamage *= 1.5;
    }
    const actualDamage = Math.max(0, finalDamage - this.combatState.player.block);
    this.combatState.player.currentHealth -= actualDamage;
    this.combatState.player.block = Math.max(
      0,
      this.combatState.player.block - finalDamage
    );

    // Add visual feedback for player taking damage
    this.animateSpriteDamage(this.playerSprite);

    this.updatePlayerUI();

    if (this.combatState.player.currentHealth <= 0) {
      this.endCombat(false);
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
        icon: "⚔️",
      };
    } else if (nextAction === "defend") {
      enemy.intent = {
        type: "defend",
        value: 5,
        description: "Gains 5 block",
        icon: "🛡️",
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
      `❤️ ${player.currentHealth}/${player.maxHealth}`
    );
    this.playerBlockText.setText(player.block > 0 ? `🛡️ ${player.block}` : "");
  }

  /**
   * Update enemy UI elements
   */
  private updateEnemyUI(): void {
    const enemy = this.combatState.enemy;
    this.enemyHealthText.setText(
      `❤️ ${enemy.currentHealth}/${enemy.maxHealth}`
    );
    this.enemyBlockText.setText(enemy.block > 0 ? `🛡️ ${enemy.block}` : "");
    this.enemyIntentText.setText(
      `${enemy.intent.icon} ${enemy.intent.description}`
    );
  }

  /**
   * Update turn UI elements
   */
  private updateTurnUI(): void {
    this.turnText.setText(`Turn: ${this.combatState.turn}`);
    this.actionsText.setText(
      `Discards: ${this.discardsUsedThisTurn}/${this.maxDiscardsPerTurn} | Hand: ${this.combatState.player.hand.length}/8`
    );
    this.updateHandIndicator();
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
      }
    }

    if (!victory) {
      // Player defeated - show game over
      const resultText = "Defeat!";
      const color = "#ff4757";

      this.add
        .text(512, 384, resultText, {
          fontFamily: "Chivo",
          fontSize: 48,
          color: color,
          align: "center",
        })
        .setOrigin(0.5);

      // Return to overworld after 3 seconds
      setTimeout(() => {
        // Update game state before returning
        const gameState = GameState.getInstance();
        gameState.completeCurrentNode(false); // Mark as completed (defeat)
        this.scene.start("Overworld");
      }, 3000);
      return;
    }

    // Victory - show post-combat dialogue
    this.combatState.phase = "post_combat";
    this.showPostCombatDialogue();
  }

  /**
   * Show post-combat dialogue with honor choices
   */
  private showPostCombatDialogue(): void {
    // Clear combat UI
    this.clearCombatUI();

    // Convert enemy name to dialogue key
    const enemyKey = this.combatState.enemy.name
      .toLowerCase()
      .replace(/\s+/g, "_");
    const dialogue =
      this.creatureDialogues[enemyKey] || this.creatureDialogues.goblin;

    // Background overlay
    this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.8);

    // Dialogue box
    const dialogueBox = this.add.rectangle(512, 400, 800, 400, 0x2f3542);
    dialogueBox.setStrokeStyle(3, 0x57606f);

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
    
    const enemyPortrait = this.add.sprite(512, 250, enemySpriteKey);
    enemyPortrait.setScale(3);

    // Try to play animation, fallback if it fails
    try {
      enemyPortrait.play("enemy_idle");
    } catch (error) {
      console.warn("Enemy portrait animation not found, using static sprite");
    }

    // Enemy name
    this.add
      .text(512, 200, dialogue.name, {
        fontFamily: "Chivo",
        fontSize: 24,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Main dialogue text
    this.add
      .text(512, 320, "You have defeated this creature. What do you choose?", {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    // Landas choice buttons
    this.createDialogueButton(350, 480, "Spare", "#2ed573", () =>
      this.makeLandasChoice("spare", dialogue)
    );

    this.createDialogueButton(674, 480, "Slay", "#ff4757", () =>
      this.makeLandasChoice("kill", dialogue)
    );

    // Current landas display
    const landasTier = this.getLandasTier(this.combatState.player.landasScore);
    const landasColor = this.getLandasColor(landasTier);

    this.add
      .text(
        512,
        550,
        `Current Landas: ${
          this.combatState.player.landasScore
        } (${landasTier.toUpperCase()})`,
        {
          fontFamily: "Chivo",
          fontSize: 16,
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
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 200, 40, 0x2f3542);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color);

    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: "Chivo",
        fontSize: 14,
        color: color,
        align: "center",
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-100, -20, 200, 40),
      Phaser.Geom.Rectangle.Contains
    );
    button.on("pointerdown", callback);
    button.on("pointerover", () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color);
      buttonText.setColor("#000000");
    });
    button.on("pointerout", () => {
      bg.setFillStyle(0x2f3542);
      buttonText.setColor(color);
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
    const isSpare = choice === "spare";
    const landasChange = isSpare ? 1 : -1;
    const reward = isSpare ? dialogue.spareReward : dialogue.killReward;
    const choiceDialogue = isSpare
      ? dialogue.spareDialogue
      : dialogue.killDialogue;

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

    // Clear dialogue and show results
    this.children.removeAll();
    this.cameras.main.setBackgroundColor(0x0e1112);

    this.showRewardsScreen(choice, choiceDialogue, reward, landasChange);
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

    // Title
    this.add
      .text(
        512,
        100,
        choice === "spare" ? "Mercy Shown" : "Victory Through Force",
        {
          fontFamily: "Chivo",
          fontSize: 32,
          color: choiceColor,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Dialogue
    this.add
      .text(512, 200, dialogue, {
        fontFamily: "Chivo",
        fontSize: 16,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    // Rewards box
    const rewardsBox = this.add.rectangle(512, 400, 600, 250, 0x2f3542);
    rewardsBox.setStrokeStyle(2, 0x57606f);

    this.add
      .text(512, 320, "Rewards", {
        fontFamily: "Chivo",
        fontSize: 24,
        color: "#ffd93d",
        align: "center",
      })
      .setOrigin(0.5);

    let rewardY = 360;

    // Ginto reward
    if (reward.ginto > 0) {
      this.add
        .text(512, rewardY, `💰 ${reward.ginto} Ginto`, {
          fontFamily: "Chivo",
          fontSize: 16,
          color: "#e8eced",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25;
    }

    // Baubles reward
    if (reward.baubles > 0) {
      this.add
        .text(512, rewardY, `💎 ${reward.baubles} Bathala Baubles`, {
          fontFamily: "Chivo",
          fontSize: 16,
          color: "#4ecdc4",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25;
    }

    // Health healing
    if (reward.healthHealing > 0) {
      this.add
        .text(512, rewardY, `❤️ Healed ${reward.healthHealing} HP`, {
          fontFamily: "Chivo",
          fontSize: 16,
          color: "#ff6b6b",
          align: "center",
        })
        .setOrigin(0.5);
      rewardY += 25;
    }

    // Landas change
    this.add
      .text(512, rewardY, `✨ Landas ${landasChangeText}`, {
        fontFamily: "Chivo",
        fontSize: 16,
        color: landasChange > 0 ? "#2ed573" : "#ff4757",
        align: "center",
      })
      .setOrigin(0.5);
    rewardY += 25;

    // Bonus effect
    if (reward.bonusEffect) {
      this.add
        .text(512, rewardY, `✨ ${reward.bonusEffect}`, {
          fontFamily: "Chivo",
          fontSize: 14,
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
        512,
        520,
        `Landas: ${
          this.combatState.player.landasScore
        } (${landasTier.toUpperCase()})`,
        {
          fontFamily: "Chivo",
          fontSize: 18,
          color: landasColor,
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Continue button
    this.createDialogueButton(512, 600, "Continue", "#4ecdc4", () => {
      this.scene.start("Overworld");
    });

    // Auto-continue after 8 seconds
    setTimeout(() => {
      this.scene.start("Overworld");
    }, 8000);
  }

  /**
   * Clear combat UI elements
   */
  private clearCombatUI(): void {
    this.handContainer.destroy();
    this.playedHandContainer.destroy();
    this.actionButtons.destroy();
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
    if (playedHand.length === 0) return;

    const cardWidth = 70;
    const startX = -(playedHand.length * cardWidth) / 2 + cardWidth / 2;

    playedHand.forEach((card, index) => {
      const cardSprite = this.createCardSprite(
        card,
        startX + index * cardWidth,
        0,
        false
      );
      this.playedHandContainer.add(cardSprite);
      this.playedCardSprites.push(cardSprite);
    });

    // Show hand evaluation
    const evaluation = HandEvaluator.evaluateHand(playedHand, "attack");
    const evalText = this.add
      .text(
        512,
        450,
        `${evaluation.description} - Value: ${evaluation.totalValue}`,
        {
          fontFamily: "Chivo",
          fontSize: 16,
          color: "#ffd93d",
          align: "center",
        }
      )
      .setOrigin(0.5);

    // Store eval text to destroy later
    this.playedHandContainer.add(evalText);
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
      Apoy: "AoE Damage + Burn",
      Tubig: "Heal + Cleanse",
      Lupa: "Apply Vulnerable",
      Hangin: "Draw Cards + Weak",
    };
    return specialActions[suit];
  }

  /**
   * Get special action name based on dominant suit
   */
  private executeAction(actionType: "attack" | "defend" | "special"): void {
    const evaluation = HandEvaluator.evaluateHand(
      this.combatState.player.playedHand,
      actionType
    );
    const dominantSuit = this.getDominantSuit(
      this.combatState.player.playedHand
    );

    let damage = 0;
    let block = 0;

    // Apply hand bonus
    switch (actionType) {
      case "attack":
        damage += evaluation.totalValue;
        const strength = this.combatState.player.statusEffects.find((e) => e.name === "Strength");
        if (strength) {
          damage += strength.value;
        }
        break;
      case "defend":
        block += evaluation.totalValue;
        const dexterity = this.combatState.player.statusEffects.find((e) => e.name === "Dexterity");
        if (dexterity) {
          block += dexterity.value;
        }
        break;
      case "special":
        this.showActionResult(this.getSpecialActionName(dominantSuit));
        // Special actions have unique effects based on suit
        break;
    }

    // Apply elemental effects
    this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);

    if (damage > 0) {
      this.damageEnemy(damage);
      this.showActionResult(`Attacked for ${damage} damage!`);
    }

    if (block > 0) {
      this.combatState.player.block += block;
      this.updatePlayerUI();
      this.showActionResult(`Gained ${block} block!`);
    }

    // Move played cards to discard pile
    this.combatState.player.discardPile.push(
      ...this.combatState.player.playedHand
    );
    this.combatState.player.playedHand = [];

    // Clear selected cards
    this.selectedCards = [];

    // Update displays
    this.updatePlayedHandDisplay();

    // Check if enemy is defeated
    if (this.combatState.enemy.currentHealth <= 0) {
      this.endCombat(true);
      return;
    }

    // In Balatro style, turn ends immediately after playing one hand
    setTimeout(() => {
      this.endPlayerTurn();
    }, 1500);
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
            emoji: "💪",
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
            emoji: "💥",
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
            emoji: "🤸",
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
            emoji: "😞",
          });
        }
        break;
    }
  }

  /**
   * Show action result message
   */
  private showActionResult(message: string): void {
    const resultText = this.add
      .text(512, 350, message, {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#2ed573",
        align: "center",
      })
      .setOrigin(0.5);

    // Fade out after 2 seconds
    this.tweens.add({
      targets: resultText,
      alpha: 0,
      duration: 2000,
      onComplete: () => resultText.destroy(),
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
    const statusContainer = entity.id === "player" ? this.playerStatusContainer : this.enemyStatusContainer;
    statusContainer.removeAll(true);

    let x = 0;
    entity.statusEffects.forEach((effect) => {
      const effectText = this.add.text(x, 0, `${effect.emoji}${effect.duration}`, {
        fontSize: 16,
      }).setInteractive();

      const tooltip = this.add
        .text(x, 20, effect.description, {
          fontSize: 12,
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
      x += 30;
    });
  }

  private damage(entity: Player | Enemy, amount: number): void {
    if (entity.id === "player") {
      this.damagePlayer(amount);
    } else {
      this.damageEnemy(amount);
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
}

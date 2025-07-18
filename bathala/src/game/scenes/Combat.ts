import { Scene } from "phaser";
import {
  CombatState,
  Player,
  Enemy,
  PlayingCard,
  Suit,
} from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { HandEvaluator } from "../../utils/HandEvaluator";

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
  private maxDiscardsPerTurn: number = 3;
  private actionsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "Combat" });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Initialize combat state
    this.initializeCombat();

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
  private initializeCombat(): void {
    const deck = DeckManager.createStarterDeck();
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
    };

    const enemy: Enemy = {
      id: "goblin",
      name: "Forest Goblin",
      maxHealth: 40,
      currentHealth: 40,
      block: 0,
      statusEffects: [],
      intent: {
        type: "attack",
        value: 8,
        description: "Attacks for 8 damage",
        icon: "⚔️",
      },
      damage: 8,
      attackPattern: ["attack", "defend", "attack"],
      currentPatternIndex: 0,
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
   * Create the combat UI layout
   */
  private createCombatUI(): void {
    // Title
    this.add
      .text(512, 30, "Combat - Forest Encounter", {
        fontFamily: "Centrion",
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
  }

  /**
   * Create player UI elements
   */
  private createPlayerUI(): void {
    const playerX = 200;
    const playerY = 300;

    // Player avatar (emoji placeholder)
    this.add
      .text(playerX, playerY, "🧙‍♂️", {
        fontSize: 80,
      })
      .setOrigin(0.5);

    // Player name
    this.add
      .text(playerX, playerY - 120, this.combatState.player.name, {
        fontFamily: "Centrion",
        fontSize: 20,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display
    this.playerHealthText = this.add
      .text(playerX, playerY + 80, "", {
        fontFamily: "Centrion",
        fontSize: 18,
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display
    this.playerBlockText = this.add
      .text(playerX, playerY + 105, "", {
        fontFamily: "Centrion",
        fontSize: 16,
        color: "#4ecdc4",
        align: "center",
      })
      .setOrigin(0.5);

    this.updatePlayerUI();
  }

  /**
   * Create enemy UI elements
   */
  private createEnemyUI(): void {
    const enemyX = 824;
    const enemyY = 300;

    // Enemy avatar (emoji placeholder)
    this.add
      .text(enemyX, enemyY, "👹", {
        fontSize: 80,
      })
      .setOrigin(0.5);

    // Enemy name
    this.add
      .text(enemyX, enemyY - 120, this.combatState.enemy.name, {
        fontFamily: "Centrion",
        fontSize: 20,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Health display
    this.enemyHealthText = this.add
      .text(enemyX, enemyY + 80, "", {
        fontFamily: "Centrion",
        fontSize: 18,
        color: "#ff6b6b",
        align: "center",
      })
      .setOrigin(0.5);

    // Block display
    this.enemyBlockText = this.add
      .text(enemyX, enemyY + 105, "", {
        fontFamily: "Centrion",
        fontSize: 16,
        color: "#4ecdc4",
        align: "center",
      })
      .setOrigin(0.5);

    // Intent display
    this.enemyIntentText = this.add
      .text(enemyX, enemyY - 80, "", {
        fontFamily: "Centrion",
        fontSize: 16,
        color: "#ffd93d",
        align: "center",
      })
      .setOrigin(0.5);

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
        this.getSpecialActionName(dominantSuit),
        () => {
          this.executeAction("special");
        }
      );

      this.actionButtons.add([attackButton, defendButton, specialButton]);
    }
  }

  /**
   * Create turn UI
   */
  private createTurnUI(): void {
    this.turnText = this.add.text(50, 100, "", {
      fontFamily: "Centrion",
      fontSize: 16,
      color: "#e8eced",
    });

    this.actionsText = this.add.text(50, 130, "", {
      fontFamily: "Centrion",
      fontSize: 14,
      color: "#ffd93d",
    });

    this.updateTurnUI();
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
        fontFamily: "Centrion",
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
    const enemy = this.combatState.enemy;

    // Apply enemy action based on intent
    if (enemy.intent.type === "attack") {
      this.damagePlayer(enemy.intent.value);
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
    const actualDamage = Math.max(0, damage - this.combatState.enemy.block);
    this.combatState.enemy.currentHealth -= actualDamage;
    this.combatState.enemy.block = Math.max(
      0,
      this.combatState.enemy.block - damage
    );

    if (this.combatState.enemy.currentHealth <= 0) {
      this.endCombat(true);
    }
  }

  /**
   * Apply damage to player
   */
  private damagePlayer(damage: number): void {
    const actualDamage = Math.max(0, damage - this.combatState.player.block);
    this.combatState.player.currentHealth -= actualDamage;
    this.combatState.player.block = Math.max(
      0,
      this.combatState.player.block - damage
    );

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
  }

  /**
   * End combat with result
   */
  private endCombat(victory: boolean): void {
    const resultText = victory ? "Victory!" : "Defeat!";
    const color = victory ? "#2ed573" : "#ff4757";

    this.add
      .text(512, 384, resultText, {
        fontFamily: "Centrion",
        fontSize: 48,
        color: color,
        align: "center",
      })
      .setOrigin(0.5);

    // Return to map after 3 seconds
    setTimeout(() => {
      this.scene.start("Map");
    }, 3000);
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
    const evaluation = HandEvaluator.evaluateHand(playedHand);
    const evalText = this.add
      .text(
        512,
        450,
        `${evaluation.description} - Value: ${evaluation.totalValue}`,
        {
          fontFamily: "Centrion",
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
    if (cards.length === 0) return "hearts";

    const suitCounts = cards.reduce((counts, card) => {
      counts[card.suit] = (counts[card.suit] || 0) + 1;
      return counts;
    }, {} as Record<Suit, number>);

    return Object.entries(suitCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0] as Suit;
  }

  /**
   * Get special action name based on dominant suit
   */
  private getSpecialActionName(suit: Suit): string {
    const specialActions: Record<Suit, string> = {
      hearts: "Heal", // Fire element
      diamonds: "Shield", // Earth element
      clubs: "Drain", // Water element
      spades: "Swift", // Air element
    };
    return specialActions[suit];
  }

  /**
   * Execute chosen action
   */
  private executeAction(actionType: "attack" | "defend" | "special"): void {
    const evaluation = HandEvaluator.evaluateHand(
      this.combatState.player.playedHand
    );
    const dominantSuit = this.getDominantSuit(
      this.combatState.player.playedHand
    );

    switch (actionType) {
      case "attack":
        // Deal damage to enemy
        this.damageEnemy(evaluation.totalValue);
        this.showActionResult(`Attacked for ${evaluation.totalValue} damage!`);
        break;

      case "defend":
        // Gain block
        const blockAmount = Math.floor(evaluation.totalValue * 0.8);
        this.combatState.player.block += blockAmount;
        this.updatePlayerUI();
        this.showActionResult(`Gained ${blockAmount} block!`);
        break;

      case "special":
        this.executeSpecialAction(dominantSuit, evaluation.totalValue);
        break;
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

  /**
   * Execute special action based on dominant suit
   */
  private executeSpecialAction(suit: Suit, value: number): void {
    switch (suit) {
      case "hearts": // Fire - Heal
        const healAmount = Math.floor(value * 0.3);
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + healAmount
        );
        this.updatePlayerUI();
        this.showActionResult(`Healed for ${healAmount} health!`);
        break;

      case "diamonds": // Earth - Shield
        const shieldAmount = Math.floor(value * 1.2);
        this.combatState.player.block += shieldAmount;
        this.updatePlayerUI();
        this.showActionResult(`Gained ${shieldAmount} block!`);
        break;

      case "clubs": // Water - Drain
        const drainAmount = Math.floor(value * 0.6);
        this.damageEnemy(drainAmount);
        this.combatState.player.currentHealth = Math.min(
          this.combatState.player.maxHealth,
          this.combatState.player.currentHealth + Math.floor(drainAmount * 0.5)
        );
        this.updatePlayerUI();
        this.showActionResult(`Drained ${drainAmount} damage and healed!`);
        break;

      case "spades": // Air - Swift
        this.damageEnemy(value);
        // Draw an extra card
        this.drawCards(1);
        this.updateHandDisplay();
        this.showActionResult(`Swift attack for ${value} damage! Drew a card!`);
        break;
    }
  }

  /**
   * Show action result message
   */
  private showActionResult(message: string): void {
    const resultText = this.add
      .text(512, 350, message, {
        fontFamily: "Centrion",
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
}

import { Scene } from "phaser";
import {
  CombatState,
  Player,
  Enemy,
  PlayingCard,
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
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private selectedCards: PlayingCard[] = [];
  private actionButtons!: Phaser.GameObjects.Container;
  private turnText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;

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
    const { drawnCards, remainingDeck } = DeckManager.drawCards(deck, 7); // Draw 7 cards

    const player: Player = {
      id: "player",
      name: "Hero",
      maxHealth: 80,
      currentHealth: 80,
      block: 0,
      statusEffects: [],
      energy: 3,
      maxEnergy: 3,
      hand: drawnCards,
      deck: remainingDeck,
      discardPile: [],
      drawPile: remainingDeck,
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

    // Action buttons
    this.createActionButtons();

    // Turn and energy display
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
   * Create action buttons
   */
  private createActionButtons(): void {
    this.actionButtons = this.add.container(512, 520);

    // Play Hand button
    const playButton = this.createButton(-120, 0, "Play Hand", () => {
      this.playSelectedCards();
    });

    // Sort by Rank button
    const sortRankButton = this.createButton(0, 0, "Sort: Rank", () => {
      this.sortHand("rank");
    });

    // Sort by Suit button
    const sortSuitButton = this.createButton(120, 0, "Sort: Suit", () => {
      this.sortHand("suit");
    });

    // Discard button
    const discardButton = this.createButton(-60, 30, "Discard", () => {
      this.discardSelectedCards();
    });

    // End Turn button
    const endTurnButton = this.createButton(60, 30, "End Turn", () => {
      this.endPlayerTurn();
    });

    this.actionButtons.add([
      playButton,
      sortRankButton,
      sortSuitButton,
      discardButton,
      endTurnButton,
    ]);
  }

  /**
   * Create turn and energy UI
   */
  private createTurnUI(): void {
    this.turnText = this.add.text(50, 100, "", {
      fontFamily: "Centrion",
      fontSize: 16,
      color: "#e8eced",
    });

    this.energyText = this.add.text(50, 130, "", {
      fontFamily: "Centrion",
      fontSize: 16,
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
    y: number
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

    // Make interactive
    cardContainer.setInteractive(
      new Phaser.Geom.Rectangle(-25, -35, 50, 70),
      Phaser.Geom.Rectangle.Contains
    );
    cardContainer.on("pointerdown", () => this.selectCard(card));

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
   * Play selected cards
   */
  private playSelectedCards(): void {
    if (this.selectedCards.length === 0) return;

    const evaluation = HandEvaluator.evaluateHand(this.selectedCards);

    // Apply damage to enemy
    this.damageEnemy(evaluation.totalValue);

    // Remove played cards from hand
    this.combatState.player.hand = this.combatState.player.hand.filter(
      (card) => !this.selectedCards.includes(card)
    );

    // Add to discard pile
    this.combatState.player.discardPile.push(...this.selectedCards);

    // Clear selection
    this.selectedCards = [];
    this.combatState.selectedCards = [];

    // Show combat result
    this.showCombatResult(evaluation);

    // Update displays
    this.updateHandDisplay();
    this.updateEnemyUI();
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

    // Move selected cards to discard pile
    this.combatState.player.discardPile.push(...this.selectedCards);

    // Remove from hand
    this.combatState.player.hand = this.combatState.player.hand.filter(
      (card) => !this.selectedCards.includes(card)
    );

    // Clear selection
    this.selectedCards = [];

    this.updateHandDisplay();
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
   * Start player turn
   */
  private startPlayerTurn(): void {
    this.combatState.phase = "player_turn";
    this.combatState.turn++;

    // Reset energy
    this.combatState.player.energy = this.combatState.player.maxEnergy;

    // Draw cards if hand is small
    if (this.combatState.player.hand.length < 5) {
      this.drawCards(2);
    }

    this.updateTurnUI();
    this.updateHandDisplay();
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
   * Show combat result
   */
  private showCombatResult(evaluation: any): void {
    const resultText = this.add
      .text(
        512,
        300,
        `${evaluation.description}\nDamage: ${evaluation.totalValue}`,
        {
          fontFamily: "Centrion",
          fontSize: 18,
          color: "#ffd93d",
          align: "center",
        }
      )
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
    this.energyText.setText(
      `⚡ Energy: ${this.combatState.player.energy}/${this.combatState.player.maxEnergy}`
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
}

import { Scene } from "phaser";
import {
  CombatState,
  Player,
  Enemy,
  PlayingCard,
  Suit,
  HandType,
} from "../../../core/types/CombatTypes";
import { DeckManager } from "../../../utils/DeckManager";
import { HandEvaluator } from "../../../utils/HandEvaluator";
import { Combat } from "../Combat";

/**
 * CombatUI - Handles all UI creation, updates, and management for Combat scene
 * 
 * This class manages:
 * - UI element creation (player, enemy, cards, buttons, etc.)
 * - UI updates (health, block, status effects, etc.)
 * - UI interactions (button clicks, card displays, etc.)
 * - Visual feedback (tooltips, previews, indicators, etc.)
 */
export class CombatUI {
  private scene: Combat;
  
  // Player UI Elements
  public playerHealthText!: Phaser.GameObjects.Text;
  public playerBlockText!: Phaser.GameObjects.Text;
  public playerStatusContainer!: Phaser.GameObjects.Container;
  public playerSprite!: Phaser.GameObjects.Sprite;
  public playerShadow!: Phaser.GameObjects.Graphics;
  
  // Enemy UI Elements
  public enemyHealthText!: Phaser.GameObjects.Text;
  public enemyBlockText!: Phaser.GameObjects.Text;
  public enemyIntentText!: Phaser.GameObjects.Text;
  public enemyStatusContainer!: Phaser.GameObjects.Container;
  public enemySprite!: Phaser.GameObjects.Sprite;
  public enemyShadow!: Phaser.GameObjects.Graphics;
  
  // Card UI Elements
  public handContainer!: Phaser.GameObjects.Container;
  public playedHandContainer!: Phaser.GameObjects.Container;
  public cardSprites: Phaser.GameObjects.Container[] = [];
  public playedCardSprites: Phaser.GameObjects.Container[] = [];
  public deckSprite!: Phaser.GameObjects.Sprite;
  public discardPileSprite!: Phaser.GameObjects.Sprite;
  public deckPosition!: { x: number; y: number };
  public discardPilePosition!: { x: number; y: number };
  
  // Button UI Elements
  public actionButtons!: Phaser.GameObjects.Container;
  
  // Info Display Elements
  public turnText!: Phaser.GameObjects.Text;
  public actionsText!: Phaser.GameObjects.Text;
  public handIndicatorText!: Phaser.GameObjects.Text;
  public handEvaluationText!: Phaser.GameObjects.Text;
  public selectionCounterText!: Phaser.GameObjects.Text;
  public actionResultText!: Phaser.GameObjects.Text;
  public enemyAttackPreviewText!: Phaser.GameObjects.Text;
  public damagePreviewText!: Phaser.GameObjects.Text;
  
  // Relic UI Elements
  public relicsContainer!: Phaser.GameObjects.Container;
  public relicInventory!: Phaser.GameObjects.Container;
  public currentRelicTooltip!: Phaser.GameObjects.Container | null;
  
  // Modal/Overlay Elements
  public landasChoiceContainer!: Phaser.GameObjects.Container;
  public rewardsContainer!: Phaser.GameObjects.Container;
  public gameOverContainer!: Phaser.GameObjects.Container;
  public deckViewContainer!: Phaser.GameObjects.Container;
  public discardViewContainer!: Phaser.GameObjects.Container;
  public battleStartDialogueContainer!: Phaser.GameObjects.Container | null;
  public ddaDebugContainer!: Phaser.GameObjects.Container | null;
  
  // Info Buttons
  public pokerHandInfoButton!: Phaser.GameObjects.Container;
  
  // State
  public ddaDebugVisible: boolean = false;
  
  constructor(scene: Combat) {
    this.scene = scene;
    this.battleStartDialogueContainer = null;
    this.currentRelicTooltip = null;
    this.ddaDebugContainer = null;
  }
  
  /**
   * Initialize all UI elements
   */
  public initialize(): void {
    this.createCombatUI();
    this.createRelicInventory();
    this.createDeckSprite();
    this.createDiscardSprite();
    this.createDeckView();
    this.createDiscardView();
    this.createDDADebugOverlay();
    
    // TEMPORARY: Assign UI elements back to Combat scene for compatibility
    // This allows existing Combat code to work without modification
    // TODO: Remove this once all Combat code is updated to use this.ui.*
    this.assignToScene();
  }
  
  /**
   * TEMPORARY: Assign UI element references back to Combat scene
   * This maintains compatibility with existing Combat.ts code
   */
  private assignToScene(): void {
    // @ts-ignore - Assigning to Combat scene properties for compatibility
    this.scene.playerHealthText = this.playerHealthText;
    // @ts-ignore
    this.scene.playerBlockText = this.playerBlockText;
    // @ts-ignore
    this.scene.playerStatusContainer = this.playerStatusContainer;
    // @ts-ignore
    this.scene.playerSprite = this.playerSprite;
    // @ts-ignore
    this.scene.enemyHealthText = this.enemyHealthText;
    // @ts-ignore
    this.scene.enemyBlockText = this.enemyBlockText;
    // @ts-ignore
    this.scene.enemyIntentText = this.enemyIntentText;
    // @ts-ignore
    this.scene.enemyStatusContainer = this.enemyStatusContainer;
    // @ts-ignore
    this.scene.enemySprite = this.enemySprite;
    // @ts-ignore
    this.scene.handContainer = this.handContainer;
    // @ts-ignore
    this.scene.playedHandContainer = this.playedHandContainer;
    // @ts-ignore
    this.scene.cardSprites = this.cardSprites;
    // @ts-ignore
    this.scene.playedCardSprites = this.playedCardSprites;
    // @ts-ignore
    this.scene.actionButtons = this.actionButtons;
    // @ts-ignore
    this.scene.turnText = this.turnText;
    // @ts-ignore
    this.scene.actionsText = this.actionsText;
    // @ts-ignore
    this.scene.handIndicatorText = this.handIndicatorText;
    // @ts-ignore
    this.scene.handEvaluationText = this.handEvaluationText;
    // @ts-ignore
    this.scene.selectionCounterText = this.selectionCounterText;
    // @ts-ignore
    this.scene.actionResultText = this.actionResultText;
    // @ts-ignore
    this.scene.enemyAttackPreviewText = this.enemyAttackPreviewText;
    // @ts-ignore
    this.scene.damagePreviewText = this.damagePreviewText;
    // @ts-ignore
    this.scene.relicsContainer = this.relicsContainer;
    // @ts-ignore
    this.scene.relicInventory = this.relicInventory;
    // @ts-ignore
    this.scene.deckViewContainer = this.deckViewContainer;
    // @ts-ignore
    this.scene.discardViewContainer = this.discardViewContainer;
    // @ts-ignore
    this.scene.deckPosition = this.deckPosition;
    // @ts-ignore
    this.scene.discardPilePosition = this.discardPilePosition;
  }
  
  /**
   * Create the main combat UI layout
   */
  private createCombatUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Title
    this.scene.add
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

    // Relics display (legacy)
    this.createRelicsUI();

    // Action result display
    this.createActionResultUI();
  }
  
  /**
   * Create player UI elements
   */
  private createPlayerUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    const playerX = screenWidth * 0.25;
    const playerY = screenHeight * 0.4;

    // Create player shadow circle
    this.playerShadow = this.scene.add.graphics();
    this.playerShadow.fillStyle(0x000000, 0.3);
    this.playerShadow.fillEllipse(playerX, playerY + 60, 80, 20);

    // Player sprite with idle animation
    this.playerSprite = this.scene.add.sprite(playerX, playerY, "combat_player");
    this.playerSprite.setScale(2);
    this.playerSprite.setFlipX(true);

    // Try to play animation, fallback if it fails
    try {
      this.playerSprite.play("player_idle");
    } catch (error) {
      console.warn("Player idle animation not found, using static sprite");
    }

    // Player name
    this.scene.add
      .text(playerX, playerY - 120, this.scene.getCombatState().player.name, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "center"
      })
      .setOrigin(0.5);

    // Health display
    this.playerHealthText = this.scene.add
      .text(playerX, playerY + 85, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ff6b6b",
        align: "center"
      })
      .setOrigin(0.5);

    // Block display
    this.playerBlockText = this.scene.add
      .text(playerX, playerY + 110, "", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#4ecdc4",
        align: "center"
      })
      .setOrigin(0.5);

    this.playerStatusContainer = this.scene.add.container(playerX, playerY + 140);

    this.updatePlayerUI();
  }
  
  /**
   * Create enemy UI elements
   */
  private createEnemyUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    const enemyX = screenWidth * 0.75;
    const enemyY = screenHeight * 0.4;
    
    // Create enemy shadow circle
    this.enemyShadow = this.scene.add.graphics();
    this.enemyShadow.fillStyle(0x000000, 0.3);
    this.enemyShadow.fillEllipse(enemyX, enemyY + 90, 120, 30);

    const combatState = this.scene.getCombatState();
    const enemyName = combatState.enemy.name;
    const enemySpriteKey = this.getEnemySpriteKey(enemyName);

    // Enemy sprite
    this.enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);

    // Scale the sprite to fit within a 250x250 box
    const sprite = this.enemySprite;
    const targetWidth = 250;
    const targetHeight = 250;
    const scale = Math.min(targetWidth / sprite.width, targetHeight / sprite.height);
    sprite.setScale(scale);

    // Enemy name
    this.scene.add
      .text(enemyX, enemyY - 180, combatState.enemy.name, {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center"
      })
      .setOrigin(0.5);

    // Health display
    this.enemyHealthText = this.scene.add
      .text(enemyX, enemyY - 150, "", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#ff6b6b",
        align: "center"
      })
      .setOrigin(0.5);

    // Block display
    this.enemyBlockText = this.scene.add
      .text(enemyX, enemyY - 120, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#4ecdc4",
        align: "center"
      })
      .setOrigin(0.5);

    // Intent display
    this.enemyIntentText = this.scene.add
      .text(enemyX, enemyY + 180, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#feca57",
        align: "center",
        wordWrap: { width: 200 }
      })
      .setOrigin(0.5);

    // Status effects container
    this.enemyStatusContainer = this.scene.add.container(enemyX, enemyY + 210);

    // Information button for enemy lore
    this.createEnemyInfoButton(enemyX, enemyY - 200);

    this.updateEnemyUI();
  }
  
  /**
   * Get enemy sprite key based on enemy name
   */
  private getEnemySpriteKey(enemyName: string): string {
    const lowerCaseName = enemyName.toLowerCase();
    
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
    
    // Fallback
    const spriteOptions = ["balete_combat", "sigbin_combat", "tikbalang_combat", "duwende_combat"];
    const randomIndex = Math.floor(Math.random() * spriteOptions.length);
    return spriteOptions[randomIndex];
  }
  
  /**
   * Create hand UI container
   */
  private createHandUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Position hand container higher up to avoid overlap with buttons
    this.handContainer = this.scene.add.container(screenWidth/2, screenHeight - 280);
    
    // Create selection counter text (Balatro style) - positioned above the cards
    this.selectionCounterText = this.scene.add.text(0, -100, "Selected: 0/5", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#ffdd44",
      align: "center"
    }).setOrigin(0.5);
    
    this.handContainer.add(this.selectionCounterText);
  }
  
  /**
   * Create played hand UI container
   */
  private createPlayedHandUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Position it higher up since it will be the main focus during action phase
    this.playedHandContainer = this.scene.add.container(screenWidth/2, screenHeight - 450);
    
    // Initialize hand evaluation text - positioned above the played cards
    this.handEvaluationText = this.scene.add
      .text(0, -100, "", {
        fontFamily: "dungeon-mode",
        fontSize: 22,
        color: "#ffd93d",
        align: "center"
      })
      .setOrigin(0.5)
      .setVisible(false);
      
    this.playedHandContainer.add(this.handEvaluationText);
  }
  
  /**
   * Create action buttons container
   */
  private createActionButtons(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Position buttons lower to avoid overlap with cards
    this.actionButtons = this.scene.add.container(screenWidth/2, screenHeight - 60);
  }
  
  /**
   * Create turn UI elements
   */
  private createTurnUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    
    this.turnText = this.scene.add.text(screenWidth - 200, 50, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
    });

    this.actionsText = this.scene.add.text(screenWidth - 200, 80, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ffd93d",
    });

    this.handIndicatorText = this.scene.add.text(screenWidth - 200, 110, "", {
      fontFamily: "dungeon-mode",
      color: "#4ecdc4",
    });

    this.createPokerHandInfoButton();
    this.updateTurnUI();
  }
  
  /**
   * Create poker hand info button
   */
  private createPokerHandInfoButton(): void {
    const screenWidth = this.scene.cameras.main.width;
    
    this.pokerHandInfoButton = this.scene.add.container(screenWidth - 50, 50);
    
    const infoButton = this.scene.add.circle(0, 0, 20, 0x2f3542);
    infoButton.setStrokeStyle(2, 0x57606f);
    
    const infoText = this.scene.add.text(0, 0, "i", {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    infoButton.setInteractive();
    
    infoButton.on("pointerover", () => {
      infoButton.setFillStyle(0x3d4454);
    });
    
    infoButton.on("pointerout", () => {
      infoButton.setFillStyle(0x2f3542);
    });
    
    infoButton.on("pointerdown", () => {
      this.scene.scene.launch("PokerHandReference");
    });
    
    infoText.setInteractive();
    infoText.on("pointerdown", () => {
      this.scene.scene.launch("PokerHandReference");
    });
    
    this.pokerHandInfoButton.add([infoButton, infoText]);
  }
  
  /**
   * Create relics UI container (legacy)
   */
  private createRelicsUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    this.relicsContainer = this.scene.add.container(screenWidth - 100, 50);
    this.relicsContainer.setVisible(false);
  }
  
  /**
   * Create relic inventory in top center
   */
  public createRelicInventory(): void {
    const screenWidth = this.scene.cameras.main.width;
    this.relicInventory = this.scene.add.container(screenWidth / 2, 80);
    this.relicInventory.setVisible(true);
    this.currentRelicTooltip = null;
    
    const inventoryWidth = 400;
    const inventoryHeight = 80;
    
    // Main background
    const mainBg = this.scene.add.rectangle(0, 0, inventoryWidth, inventoryHeight, 0x1a1a1a, 0.95);
    mainBg.setStrokeStyle(2, 0x8b4513, 0.8);
    
    // Inner highlight
    const innerBg = this.scene.add.rectangle(0, 0, inventoryWidth - 6, inventoryHeight - 6, 0x2a2a2a, 0.6);
    innerBg.setStrokeStyle(1, 0xcd853f, 0.5);
    
    // Title text
    const titleText = this.scene.add.text(-inventoryWidth/2 + 15, -inventoryHeight/2 + 15, "RELICS", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#ffffff",
      align: "left"
    }).setOrigin(0, 0.5);
    
    // Toggle button
    const toggleButton = this.createRelicInventoryToggle(inventoryWidth/2 - 30, -inventoryHeight/2 + 15);
    
    // Create relic slots
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
        
        const slot = this.scene.add.rectangle(slotX, slotY, slotSize, slotSize, 0x0f0f0f, 0.9);
        slot.setStrokeStyle(2, 0x8b4513, 0.6);
        
        this.relicInventory.add(slot);
      }
    }
    
    this.relicInventory.add([mainBg, innerBg, titleText, toggleButton]);
    this.updateRelicInventory();
  }
  
  /**
   * Create toggle button for relic inventory
   */
  private createRelicInventoryToggle(x: number, y: number): Phaser.GameObjects.Container {
    const toggleButton = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 20, 20, 0x4a4a4a, 0.9);
    bg.setStrokeStyle(1, 0x6a6a6a);
    
    const toggleText = this.scene.add.text(0, 0, "👁", {
      fontSize: 12,
      color: "#ffffff"
    }).setOrigin(0.5);
    
    toggleButton.add([bg, toggleText]);
    toggleButton.setInteractive(new Phaser.Geom.Rectangle(-10, -10, 20, 20), Phaser.Geom.Rectangle.Contains);
    
    toggleButton.on("pointerdown", () => {
      const isVisible = this.relicInventory.visible;
      this.relicInventory.setVisible(!isVisible);
      toggleText.setText(isVisible ? "✕" : "👁");
    });
    
    toggleButton.on("pointerover", () => {
      bg.setFillStyle(0x5a5a5a, 0.9);
    });
    
    toggleButton.on("pointerout", () => {
      bg.setFillStyle(0x4a4a4a, 0.9);
    });
    
    return toggleButton;
  }
  
  /**
   * Create deck sprite (simple sprite in bottom right)
   */
  public createDeckSprite(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    this.deckPosition = { x: screenWidth - 100, y: screenHeight - 120 };
    
    // Use backart.png for deck sprite (with fallback to card_back)
    const deckTexture = this.scene.textures.exists('backart') ? 'backart' : 'card_back';
    
    this.deckSprite = this.scene.add.sprite(
      this.deckPosition.x,
      this.deckPosition.y,
      deckTexture
    );
    this.deckSprite.setDisplaySize(80, 112);
    this.deckSprite.setInteractive();
    
    // Add hover effect
    this.deckSprite.on("pointerover", () => {
      this.deckSprite.setScale(1.1);
    });
    
    this.deckSprite.on("pointerout", () => {
      this.deckSprite.setScale(1.0);
    });
    
    // Click to view deck
    this.deckSprite.on("pointerdown", () => {
      this.showDeckView();
    });
    
    this.updateDeckDisplay();
  }
  
  /**
   * Create discard pile sprite (horizontal stack in bottom left, matching deck pile design)
   */
  public createDiscardSprite(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Position in BOTTOM LEFT corner, same Y as deck pile for aligned row
    // Match the deck pile Y position from Combat.ts (screenHeight * 0.75)
    this.discardPilePosition = { x: screenWidth * 0.15, y: screenHeight * 0.75 };
    
    // Create a container for the discard pile
    const discardContainer = this.scene.add.container(this.discardPilePosition.x, this.discardPilePosition.y);
    
    // Match deck pile dimensions exactly
    const cardWidth = 80;
    const cardHeight = 112;
    const horizontalOffset = 3; // Cards spread horizontally (to the right)
    const numStackedCards = 5; // Same as deck pile - show max 5 cards in stack
    
    // Create horizontally stacked cards (spreading to the right like deck spreads down)
    // Use white rectangles with black borders just like the deck pile
    for (let i = 0; i < numStackedCards - 1; i++) {
      // Back cards use white rectangle with black border (matching deck pile exactly)
      const cardBack = this.scene.add.rectangle(
        i * horizontalOffset, // Move right instead of down
        0,                    // Keep same Y (horizontal spread)
        cardWidth,
        cardHeight,
        0xffffff // White color (matching deck pile)
      );
      cardBack.setStrokeStyle(2, 0x000000); // Black border (matching deck pile)
      discardContainer.add(cardBack);
    }
    
    // Top discard card - ALWAYS show backart.png (flipped horizontally)
    // Check if backart texture exists, otherwise fallback to card_back
    const topCardTexture = this.scene.textures.exists('backart') ? 'backart' : 'card_back';
    
    this.discardPileSprite = this.scene.add.sprite(
      (numStackedCards - 1) * horizontalOffset,
      0,
      topCardTexture
    );
    this.discardPileSprite.setDisplaySize(cardWidth, cardHeight);
    this.discardPileSprite.setFlipX(true); // Flip horizontally to differentiate from deck
    discardContainer.add(this.discardPileSprite);
    
    // Discard count text (below the cards, centered on the stack)
    const discardCountText = this.scene.add.text(
      ((numStackedCards - 1) * horizontalOffset) / 2,
      cardHeight/2 + 15,
      "Discard: 0",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#e8eced",
        align: "center"
      }
    ).setOrigin(0.5);
    discardContainer.add(discardCountText);
    (discardContainer as any).discardCountText = discardCountText;
    
    // Make entire container interactive
    const totalWidth = cardWidth + ((numStackedCards - 1) * horizontalOffset);
    discardContainer.setSize(totalWidth, cardHeight);
    discardContainer.setInteractive(
      new Phaser.Geom.Rectangle(
        -10, 
        -10, 
        totalWidth + 20, 
        cardHeight + 40
      ),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Hover effect - match deck pile behavior (1.0 → 1.1 scale)
    discardContainer.on("pointerover", () => {
      discardContainer.setScale(1.1);
    });
    
    discardContainer.on("pointerout", () => {
      discardContainer.setScale(1.0);
    });
    
    // Click to view discard pile
    discardContainer.on("pointerdown", () => {
      this.showDiscardView();
    });
    
    // Store reference to container
    (this.discardPileSprite as any).discardContainer = discardContainer;
    
    this.updateDiscardDisplay();
  }
  
  /**
   * Create deck view modal
   */
  public createDeckView(): void {
    this.deckViewContainer = this.scene.add.container(0, 0);
    this.deckViewContainer.setVisible(false);
    this.deckViewContainer.setDepth(6000);
  }
  
  /**
   * Create discard view modal
   */
  public createDiscardView(): void {
    this.discardViewContainer = this.scene.add.container(0, 0);
    this.discardViewContainer.setVisible(false);
    this.discardViewContainer.setDepth(6000);
  }
  
  /**
   * Create DDA debug overlay
   */
  public createDDADebugOverlay(): void {
    // Implementation will be added when needed
    this.ddaDebugContainer = null;
  }
  
  /**
   * Create damage preview UI
   */
  private createDamagePreview(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Placeholder for damage preview
    this.damagePreviewText = this.scene.add.text(
      screenWidth / 2,
      screenHeight / 2 - 100,
      "",
      {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#ff6b6b",
        align: "center"
      }
    ).setOrigin(0.5).setVisible(false);
  }
  
  /**
   * Create action result UI
   */
  private createActionResultUI(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    this.actionResultText = this.scene.add.text(
      screenWidth / 2,
      screenHeight / 2,
      "",
      {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#ffd93d",
        align: "center"
      }
    ).setOrigin(0.5).setVisible(false).setDepth(1000);
  }
  
  /**
   * Create enemy info button
   */
  private createEnemyInfoButton(_x: number, _y: number): void {
    // Placeholder for enemy info button
    // Implementation can be added when needed
  }
  
  // ==================== UPDATE METHODS ====================
  
  /**
   * Update player UI elements
   */
  public updatePlayerUI(): void {
    const combatState = this.scene.getCombatState();
    const player = combatState.player;
    this.playerHealthText.setText(`♥ ${player.currentHealth}/${player.maxHealth}`);
    this.playerBlockText.setText(player.block > 0 ? `⛨ ${player.block}` : "");
  }
  
  /**
   * Update enemy UI elements
   */
  public updateEnemyUI(): void {
    const combatState = this.scene.getCombatState();
    const enemy = combatState.enemy;
    this.enemyHealthText.setText(`♥ ${enemy.currentHealth}/${enemy.maxHealth}`);
    this.enemyBlockText.setText(enemy.block > 0 ? `⛨ ${enemy.block}` : "");
    this.enemyIntentText.setText(`${enemy.intent.icon} ${enemy.intent.description}`);
  }
  
  /**
   * Update turn UI elements
   */
  public updateTurnUI(): void {
    const combatState = this.scene.getCombatState();
    
    if (this.scene.getCombatEnded()) {
      return;
    }
    
    try {
      this.turnText.setText(`Turn: ${combatState.turn}`);
      this.actionsText.setText(
        `Discards: ${this.scene.getDiscardsUsedThisTurn()}/${this.scene.getMaxDiscardsPerTurn()} | Hand: ${combatState.player.hand.length}/8`
      );
      this.updateHandIndicator();
    } catch (error) {
      console.error("Error updating turn UI:", error);
    }
  }
  
  /**
   * Update hand indicator to show current selected hand type
   */
  public updateHandIndicator(): void {
    const selectedCards = this.scene.getSelectedCards();
    
    if (selectedCards.length === 0) {
      this.handIndicatorText.setText("");
      return;
    }

    const evaluation = HandEvaluator.evaluateHand(selectedCards, "attack");
    const handTypeText = this.getHandTypeDisplayText(evaluation.type);
    const valueText = evaluation.totalValue > 0 ? ` (${evaluation.totalValue} value)` : "";

    this.handIndicatorText.setText(`Selected: ${handTypeText}${valueText}`);
  }
  
  /**
   * Update selection counter above the cards (Balatro style)
   */
  public updateSelectionCounter(): void {
    if (!this.selectionCounterText) return;
    
    const selectedCards = this.scene.getSelectedCards();
    const count = selectedCards.length;
    
    if (count > 0) {
      const evaluation = HandEvaluator.evaluateHand(selectedCards, "attack");
      const handTypeText = this.getHandTypeDisplayText(evaluation.type);
      this.selectionCounterText.setText(`${count}/5 - ${handTypeText}`);
      this.selectionCounterText.setColor("#ffdd44");
    } else {
      this.selectionCounterText.setText("Selected: 0/5");
      this.selectionCounterText.setColor("#77888C");
    }
  }
  
  /**
   * Update relic inventory with current relics
   */
  public updateRelicInventory(): void {
    if (!this.relicInventory) return;
    
    const combatState = this.scene.getCombatState();
    const relics = combatState.player.relics;
    const slotsPerRow = 6;
    const slotSpacing = 45;
    const startX = -(slotsPerRow - 1) * slotSpacing / 2;
    const startY = 10;
    
    // Remove existing relic displays
    this.relicInventory.list.forEach(child => {
      if ((child as any).isRelicDisplay || (child as any).isTooltip) {
        child.destroy();
      }
    });
    
    // Add current relics to slots
    relics.forEach((relic, index) => {
      if (index < 6) {
        const slotX = startX + index * slotSpacing;
        const slotY = startY;
        
        const relicIcon = this.scene.add.text(slotX, slotY, relic.emoji || "?", {
          fontSize: 18,
          align: "center"
        }).setOrigin(0.5);
        
        (relicIcon as any).isRelicDisplay = true;
        relicIcon.setInteractive();
        
        let hoverGlow: Phaser.GameObjects.Graphics | null = null;
        
        relicIcon.on("pointerover", () => {
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          hoverGlow = this.scene.add.graphics();
          hoverGlow.lineStyle(3, 0x7c3aed, 0.8);
          hoverGlow.strokeCircle(slotX, slotY, 18);
          this.relicInventory.add(hoverGlow);
          
          this.scene.tweens.add({
            targets: relicIcon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          this.showRelicTooltip(relic.name, slotX, slotY - 40);
        });
        
        relicIcon.on("pointerout", () => {
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          this.scene.tweens.add({
            targets: relicIcon,
            scaleX: 1,
            scaleY: 1,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          this.hideRelicTooltip();
        });
        
        relicIcon.on("pointerdown", () => {
          this.showRelicDetailModal(relic);
        });
        
        this.relicInventory.add(relicIcon);
      }
    });
  }
  
  /**
   * Update relics UI (legacy)
   */
  public updateRelicsUI(): void {
    // Legacy method - kept for compatibility
  }
  
  /**
   * Update action buttons based on current phase
   */
  public updateActionButtons(): void {
    const combatState = this.scene.getCombatState();
    
    if (!this.scene.sys || !this.scene.sys.isActive() || this.scene.getCombatEnded()) {
      return;
    }

    this.actionButtons.removeAll(true);

    const screenWidth = this.scene.cameras.main.width;
    const baseSpacing = 280; // Increased spacing to prevent overlap
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    const adjustedSpacing = baseSpacing * scaleFactor;

    if (combatState.phase === "player_turn") {
      // Card selection phase - Balatro-style layout with better spacing
      
      // Show hand container and hide played hand
      this.handContainer.setVisible(true);
      this.playedHandContainer.setVisible(false);
      this.selectionCounterText.setVisible(true);
      this.handEvaluationText.setVisible(false);
      
      const playButton = this.createButton(-adjustedSpacing * 1.2, 0, "Play Hand", () => {
        this.scene.playSelectedCards();
      });

      // Sort Hand grouped container - positioned in the center
      const sortContainer = this.scene.add.container(0, 0);
      
      const sortGroupWidth = 280 * scaleFactor; // Reduced width to fit better
      const sortGroupHeight = 60;
      
      const sortOuterBorder = this.scene.add.rectangle(0, 0, sortGroupWidth + 8, sortGroupHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x77888C);
      const sortInnerBorder = this.scene.add.rectangle(0, 0, sortGroupWidth, sortGroupHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const sortBg = this.scene.add.rectangle(0, 0, sortGroupWidth, sortGroupHeight, 0x150E10);
      
      const sortLabel = this.scene.add.text(0, -sortGroupHeight/2 - 20, "SORT", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(12 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      const buttonWidth = 90 * scaleFactor; // Reduced button width
      const buttonHeight = 32;
      const buttonGap = 15 * scaleFactor; // Reduced gap
      const buttonSpacing = buttonWidth/2 + buttonGap/2;
      
      // Rank button
      const rankButtonContainer = this.scene.add.container(-buttonSpacing, 0);
      const rankOuterBorder = this.scene.add.rectangle(0, 0, buttonWidth + 6, buttonHeight + 6, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const rankInnerBorder = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const rankButtonBg = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
      const rankButtonText = this.scene.add.text(0, 0, "Rank", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      rankButtonContainer.add([rankOuterBorder, rankInnerBorder, rankButtonBg, rankButtonText]);
      rankButtonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Suit button
      const suitButtonContainer = this.scene.add.container(buttonSpacing, 0);
      const suitOuterBorder = this.scene.add.rectangle(0, 0, buttonWidth + 6, buttonHeight + 6, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const suitInnerBorder = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const suitButtonBg = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
      const suitButtonText = this.scene.add.text(0, 0, "Suit", {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center"
      }).setOrigin(0.5);
      
      suitButtonContainer.add([suitOuterBorder, suitInnerBorder, suitButtonBg, suitButtonText]);
      suitButtonContainer.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Hover effects
      rankButtonContainer.on("pointerover", () => {
        rankButtonBg.setFillStyle(0x1f1410);
        rankButtonText.setColor("#e8eced");
      });
      rankButtonContainer.on("pointerout", () => {
        rankButtonBg.setFillStyle(0x150E10);
        rankButtonText.setColor("#77888C");
      });
      rankButtonContainer.on("pointerdown", () => {
        this.scene.sortHand("rank");
      });
      
      suitButtonContainer.on("pointerover", () => {
        suitButtonBg.setFillStyle(0x1f1410);
        suitButtonText.setColor("#e8eced");
      });
      suitButtonContainer.on("pointerout", () => {
        suitButtonBg.setFillStyle(0x150E10);
        suitButtonText.setColor("#77888C");
      });
      suitButtonContainer.on("pointerdown", () => {
        this.scene.sortHand("suit");
      });
      
      sortContainer.add([
        sortOuterBorder, 
        sortInnerBorder, 
        sortBg, 
        sortLabel,
        rankButtonContainer,
        suitButtonContainer
      ]);

      const discardButton = this.createButton(adjustedSpacing * 1.2, 0, "Discard", () => {
        this.scene.discardSelectedCards();
      });

      this.actionButtons.add([playButton, sortContainer, discardButton]);
      
    } else if (combatState.phase === "action_selection") {
      // Action selection phase - hide hand, show only played cards
      this.handContainer.setVisible(false);
      this.playedHandContainer.setVisible(true);
      this.selectionCounterText.setVisible(false);
      
      const dominantSuit = this.scene.getDominantSuit(combatState.player.playedHand);

      // Reduce spacing to bring buttons closer together
      const buttonSpacing = adjustedSpacing * 0.6; // Make buttons closer
      const attackButton = this.createButton(-buttonSpacing, 0, "Attack", () => {
        this.scene.executeAction("attack");
      });

      const defendButton = this.createButton(0, 0, "Defend", () => {
        this.scene.executeAction("defend");
      });

      const specialButton = this.createButton(buttonSpacing, 0, "Special", () => {
        this.scene.executeAction("special");
      });

      // Special action tooltip
      const specialTooltipContainer = this.scene.add.container(buttonSpacing, 30);
      const tooltipText = this.scene.getSpecialActionName(dominantSuit);
      const tooltipWidth = Math.min(tooltipText.length * 8 + 20, 200);
      const tooltipHeight = 40;
      
      const outerBorder = this.scene.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const innerBorder = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0)
        .setStrokeStyle(2, 0x77888C);
      const bg = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
      
      const specialTooltip = this.scene.add.text(0, 0, tooltipText, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(14 * scaleFactor),
        color: "#77888C",
        align: "center",
        wordWrap: { width: tooltipWidth - 10 }
      }).setOrigin(0.5);
      
      specialTooltipContainer.add([outerBorder, innerBorder, bg, specialTooltip]);
      specialTooltipContainer.setVisible(false).setAlpha(0);

      specialButton.on("pointerover", () => {
        specialTooltipContainer.setVisible(true);
        this.scene.tweens.add({
          targets: specialTooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Power2.easeOut'
        });
      });

      specialButton.on("pointerout", () => {
        this.scene.tweens.add({
          targets: specialTooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2.easeOut',
          onComplete: () => {
            specialTooltipContainer.setVisible(false);
          }
        });
      });

      this.actionButtons.add([attackButton, defendButton, specialButton, specialTooltipContainer]);
    }
    
    this.updateDamagePreview(combatState.phase === "action_selection");
  }
  
  /**
   * Create button with Balatro/Prologue styling
   */
  public createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const screenWidth = this.scene.cameras.main.width;
    const baseButtonWidth = 140;
    const baseButtonHeight = 45;
    
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    const tempText = this.scene.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(18 * scaleFactor),
      color: "#77888C",
      align: "center"
    });
    
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();
    
    const padding = 30;
    const buttonWidth = Math.max(baseButtonWidth, textWidth + padding);
    const buttonHeight = Math.max(baseButtonHeight, textHeight + 16);

    const button = this.scene.add.container(x, y);

    const outerBorder = this.scene.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0)
      .setStrokeStyle(3, 0x77888C);
    const innerBorder = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const bg = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);

    const buttonText = this.scene.add.text(0, 0, text, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scaleFactor),
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5);

    button.add([outerBorder, innerBorder, bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on("pointerdown", () => {
      if (this.scene.getIsActionProcessing()) {
        return;
      }
      
      this.scene.tweens.add({
        targets: button,
        scale: 0.92,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          this.scene.tweens.add({
            targets: button,
            scale: 1,
            duration: 80,
            ease: 'Power2'
          });
        }
      });
      callback();
    });
    
    button.on("pointerover", () => {
      bg.setFillStyle(0x1f1410);
      buttonText.setColor("#e8eced");
      this.scene.tweens.add({
        targets: button,
        scale: 1.08,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      buttonText.setColor("#77888C");
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    return button;
  }
  
  /**
   * Update deck display with current card count
   */
  public updateDeckDisplay(): void {
    if (!this.deckSprite) return;
    
    const combatState = this.scene.getCombatState();
    const deckCount = combatState.player.drawPile.length;
    
    // Simple visibility toggle
    this.deckSprite.setVisible(deckCount > 0);
  }
  
  /**
   * Update discard pile display with current card count and top card
   */
  public updateDiscardDisplay(): void {
    if (!this.discardPileSprite) return;
    
    const combatState = this.scene.getCombatState();
    const discardPile = combatState.player.discardPile;
    const discardCount = discardPile.length;
    
    // Update discard count text
    const discardContainer = (this.discardPileSprite as any).discardContainer;
    if (discardContainer) {
      const discardCountText = (discardContainer as any).discardCountText;
      if (discardCountText) {
        discardCountText.setText(`Discard: ${discardCount}`);
      }
      
      // ALWAYS show the discard pile (even when empty)
      discardContainer.setVisible(true);
      
      // Update the top card sprite to show the actual top card
      if (discardCount > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const rankMap: Record<string, string> = {
          "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
          "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
          "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
        };
        const spriteRank = rankMap[topCard.rank] || "1";
        
        const suitMap: Record<string, string> = {
          "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
        };
        const spriteSuit = suitMap[topCard.suit] || "apoy";
        
        const textureKey = `card_${spriteRank}_${spriteSuit}`;
        
        // Update sprite if texture exists, showing the actual card (not flipped)
        if (this.scene.textures.exists(textureKey)) {
          this.discardPileSprite.setTexture(textureKey);
          this.discardPileSprite.setDisplaySize(80, 112); // Ensure size is maintained
          this.discardPileSprite.setFlipX(false); // Don't flip when showing actual cards
        }
      } else {
        // ALWAYS show backart.png when empty (flipped horizontally)
        const backTexture = this.scene.textures.exists('backart') ? 'backart' : 'card_back';
        this.discardPileSprite.setTexture(backTexture);
        this.discardPileSprite.setDisplaySize(80, 112);
        this.discardPileSprite.setFlipX(true); // Flip horizontally to differentiate from deck
      }
    }
  }
  
  /**
   * Update damage preview
   */
  public updateDamagePreview(show: boolean): void {
    if (!show) {
      this.damagePreviewText.setVisible(false);
      return;
    }
    
    // Implementation will be added for damage calculation display
  }
  
  /**
   * Update hand display with Balatro-style curved arc
   */
  public updateHandDisplay(): void {
    const combatState = this.scene.getCombatState();
    
    if (this.scene.getCombatEnded()) {
      return;
    }

    if (this.scene.getIsDrawingCards()) {
      return;
    }
    
    // Hide hand during action selection phase
    if (combatState.phase === "action_selection") {
      this.handContainer.setVisible(false);
      return;
    } else {
      this.handContainer.setVisible(true);
    }
    
    // Clear existing card sprites and kill any active tweens
    this.cardSprites.forEach((sprite) => {
      this.scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    this.cardSprites = [];
    
    // CRITICAL: Also clear all children from handContainer to prevent orphaned sprites
    // Keep only the selectionCounterText
    const childrenToKeep = [this.selectionCounterText];
    this.handContainer.list.forEach((child: any) => {
      if (!childrenToKeep.includes(child)) {
        child.destroy();
      }
    });

    const hand = combatState.player.hand;
    
    // FIXED SPACING - Cards always use the same spacing regardless of hand size
    // This ensures 8 cards on turn 1 have the same spacing as 8 cards on turn 2+
    const CARD_SPACING = 96; // Fixed: never changes
    const CARD_ARC_HEIGHT = 30; // Fixed: never changes
    const CARD_MAX_ROTATION = 8; // Fixed: never changes
    
    // Calculate positions for this specific hand size
    const totalSpread = (hand.length - 1) * CARD_SPACING;
    const startX = -totalSpread / 2;
    
    hand.forEach((card, index) => {
      // Normalized position from -0.5 to 0.5
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      
      // Calculate fixed positions
      const x = startX + (index * CARD_SPACING);
      const baseY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
      const rotation = normalizedPos * CARD_MAX_ROTATION;
      
      // Store base positions on the card object itself
      (card as any).baseX = x;
      (card as any).baseY = baseY;
      (card as any).baseRotation = rotation;
      
      // Cards should NEVER be selected when hand is redrawn
      // (selected state is cleared in startPlayerTurn)
      const y = baseY;
      
      // BUGFIX: createCardSprite now creates container at correct position
      const cardSprite = this.createCardSprite(card, x, y);
      cardSprite.setAngle(rotation);
      cardSprite.setDepth(100 + index);
      
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
    });
    
    // BUGFIX: Force container to update its bounds and child transforms
    // This ensures cards are positioned correctly after being added
    this.handContainer.setPosition(this.handContainer.x, this.handContainer.y);
  }
  
  /**
   * Update hand display without animation (used during card drawing animation)
   * This is called by CombatAnimations when new cards are being drawn
   */
  public updateHandDisplayQuiet(): void {
    const combatState = this.scene.getCombatState();
    
    // Clear existing card sprites and kill any active tweens
    this.cardSprites.forEach((sprite) => {
      this.scene.tweens.killTweensOf(sprite);
      sprite.destroy();
    });
    this.cardSprites = [];
    
    // CRITICAL: Also clear all children from handContainer to prevent orphaned sprites
    // Keep only the selectionCounterText
    const childrenToKeep = [this.selectionCounterText];
    this.handContainer.list.forEach((child: any) => {
      if (!childrenToKeep.includes(child)) {
        child.destroy();
      }
    });

    const hand = combatState.player.hand;
    
    // FIXED SPACING - Cards always use the same spacing regardless of hand size
    const CARD_SPACING = 96;
    const CARD_ARC_HEIGHT = 30;
    const CARD_MAX_ROTATION = 8;
    
    const totalSpread = (hand.length - 1) * CARD_SPACING;
    const startX = -totalSpread / 2;
    
    hand.forEach((card, index) => {
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      
      const x = startX + (index * CARD_SPACING);
      const baseY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
      const rotation = normalizedPos * CARD_MAX_ROTATION;
      
      // Store base positions
      (card as any).baseX = x;
      (card as any).baseY = baseY;
      (card as any).baseRotation = rotation;
      
      // BUGFIX: createCardSprite now creates container at correct position
      const cardSprite = this.createCardSprite(card, x, baseY);
      cardSprite.setAngle(rotation);
      cardSprite.setDepth(100 + index);
      
      this.handContainer.add(cardSprite);
      this.cardSprites.push(cardSprite);
    });
    
    // BUGFIX: Force container to update its bounds and child transforms
    this.handContainer.setPosition(this.handContainer.x, this.handContainer.y);
  }
  
  /**
   * Create card sprite with Balatro-style interactions
   */
  public createCardSprite(
    card: PlayingCard,
    x: number,
    y: number,
    interactive: boolean = true
  ): Phaser.GameObjects.Container {
    // BUGFIX: Create container at the target position immediately
    const cardContainer = this.scene.add.container(x, y);

    // Use fixed card dimensions for consistency
    const cardWidth = 80;
    const cardHeight = 112;

    const rankMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
      "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
    };
    const spriteRank = rankMap[card.rank] || "1";
    
    const suitMap: Record<string, string> = {
      "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
    };
    const spriteSuit = suitMap[card.suit] || "apoy";
    
    const textureKey = `card_${spriteRank}_${spriteSuit}`;
    let cardSprite;
    
    if (this.scene.textures.exists(textureKey)) {
      cardSprite = this.scene.add.image(0, 0, textureKey);
    } else {
      cardSprite = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff);
      
      const rankText = this.scene.add.text(-cardWidth/2 + 5, -cardHeight/2 + 5, card.rank, {
        fontFamily: "dungeon-mode",
        fontSize: 10,
        color: "#000000",
      }).setOrigin(0, 0);
      cardContainer.add(rankText);
      
      const display = DeckManager.getCardDisplay(card);
      const suitText = this.scene.add.text(cardWidth/2 - 5, -cardHeight/2 + 5, display.symbol, {
        fontFamily: "dungeon-mode",
        fontSize: 10,
        color: display.color,
      }).setOrigin(1, 0);
      cardContainer.add(suitText);
    }
    
    cardSprite.setDisplaySize(cardWidth, cardHeight);
    
    const border = this.scene.add.rectangle(0, 0, cardWidth + 4, cardHeight + 4, 0x000000, 0);
    border.setStrokeStyle(2, 0x77888C);
    border.setName('cardBorder');
    border.setVisible(card.selected);

    cardContainer.add([cardSprite, border]);
    cardContainer.setPosition(x, y);

    if (interactive) {
      cardContainer.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      cardContainer.on("pointerdown", () => this.scene.selectCard(card));
    }

    (cardContainer as any).cardRef = card;
    return cardContainer;
  }
  
  /**
   * Update card visuals without recreating
   */
  public updateCardVisuals(card: PlayingCard): void {
    const combatState = this.scene.getCombatState();
    const cardIndex = combatState.player.hand.findIndex(c => c.id === card.id);
    if (cardIndex !== -1 && this.cardSprites[cardIndex]) {
      const cardSprite = this.cardSprites[cardIndex];
      
      const border = cardSprite.getByName('cardBorder') as Phaser.GameObjects.Rectangle;
      if (border) {
        border.setVisible(card.selected);
      }
    }
  }
  
  /**
   * Update played hand display
   */
  public updatePlayedHandDisplay(): void {
    const combatState = this.scene.getCombatState();
    
    // Clear existing played card sprites (but not the hand evaluation text)
    this.playedCardSprites.forEach((sprite) => sprite.destroy());
    this.playedCardSprites = [];

    const playedHand = combatState.player.playedHand;
    if (playedHand.length === 0) {
      this.handEvaluationText.setVisible(false);
      this.playedHandContainer.setVisible(false);
      return;
    }

    // Make played cards closer together
    const cardSpacing = 90; // Reduced from 100 to bring cards closer
    const totalWidth = (playedHand.length - 1) * cardSpacing;
    const startX = -totalWidth / 2;

    playedHand.forEach((card, index) => {
      const x = startX + index * cardSpacing;
      const cardSprite = this.createCardSprite(card, x, 0, false);
      
      this.playedHandContainer.add(cardSprite);
      this.playedCardSprites.push(cardSprite);
    });

    // Show hand evaluation
    const evaluation = HandEvaluator.evaluateHand(playedHand, "attack");
    const handTypeText = this.getHandTypeDisplayText(evaluation.type);
    this.handEvaluationText.setText(`${handTypeText} (+${evaluation.totalValue})`);
    this.handEvaluationText.setVisible(true);
    
    // Ensure played hand container is visible during action phase
    if (combatState.phase === "action_selection") {
      this.playedHandContainer.setVisible(true);
    }
  }
  
  /**
   * Update DDA debug overlay
   */
  public updateDDADebugOverlay(): void {
    // Implementation will be added when needed
  }
  
  // ==================== HELPER METHODS ====================
  
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
   * Show action result message
   */
  public showActionResult(message: string, color: string = "#ffd93d"): void {
    this.actionResultText.setText(message);
    this.actionResultText.setColor(color);
    this.actionResultText.setVisible(true);
    
    this.scene.tweens.add({
      targets: this.actionResultText,
      alpha: 0,
      y: this.actionResultText.y - 50,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.actionResultText.setVisible(false);
        this.actionResultText.setAlpha(1);
        this.actionResultText.y += 50;
      }
    });
  }
  
  /**
   * Show relic tooltip
   */
  private showRelicTooltip(name: string, x: number, y: number): void {
    this.hideRelicTooltip();
    
    const tooltipContainer = this.scene.add.container(x, y);
    const tooltipWidth = Math.min(name.length * 8 + 20, 200);
    const tooltipHeight = 30;
    
    const bg = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(2, 0x8b4513);
    
    const text = this.scene.add.text(0, 0, name, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#ffffff",
      align: "center"
    }).setOrigin(0.5);
    
    tooltipContainer.add([bg, text]);
    tooltipContainer.setDepth(6000);
    
    this.currentRelicTooltip = tooltipContainer;
    this.relicInventory.add(tooltipContainer);
  }
  
  /**
   * Hide relic tooltip
   */
  private hideRelicTooltip(): void {
    if (this.currentRelicTooltip) {
      this.currentRelicTooltip.destroy();
      this.currentRelicTooltip = null;
    }
  }
  
  /**
   * Show relic detail modal
   */
  private showRelicDetailModal(relic: any): void {
    // Placeholder for relic detail modal
    console.log("Show relic detail:", relic);
  }
  
  /**
   * Show deck view
   */
  private showDeckView(): void {
    // Placeholder
    console.log("Show deck view");
  }
  
  /**
   * Show discard view
   */
  private showDiscardView(): void {
    // Placeholder
    console.log("Show discard view");
  }
  
  /**
   * Clear combat UI
   */
  public clearCombatUI(): void {
    // Clear all UI elements for post-combat
    this.actionButtons.setVisible(false);
    this.handContainer.setVisible(false);
    this.playedHandContainer.setVisible(false);
  }
}

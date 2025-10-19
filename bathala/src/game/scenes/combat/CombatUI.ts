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
import { createButton } from "../../ui/Button";

/**
 * Helper function to get the sprite key for a relic based on its ID
 */
function getRelicSpriteKey(relicId: string): string {
  // Map relic IDs to sprite keys
  const spriteMap: Record<string, string> = {
    'swift_wind_agimat': 'relic_swift_wind_agimat',
    'amomongo_claw': 'relic_amomongo_claw',
    'ancestral_blade': 'relic_ancestral_blade',
    'balete_root': 'relic_balete_root',
    'babaylans_talisman': 'relic_babaylans_talisman',
    'bungisngis_grin': 'relic_bungisngis_grin',
    'diwatas_crown': 'relic_diwatas_crown',
    'duwende_charm': 'relic_duwende_charm',
    'earthwardens_plate': 'relic_earthwardens_plate',
    'ember_fetish': 'relic_ember_fetish',
    'kapres_cigar': 'relic_kapres_cigar',
    'lucky_charm': 'relic_lucky_charm',
    'mangangaway_wand': 'relic_mangangaway_wand',
    'sarimanok_feather': 'relic_sarimanok_feather',
    'sigbin_heart': 'relic_sigbin_heart',
    'stone_golem_heart': 'relic_stone_golem_heart',
    'tidal_amulet': 'relic_tidal_amulet',
    'tikbalangs_hoof': 'relic_tikbalangs_hoof',
    'tiyanak_tear': 'relic_tiyanak_tear',
    'umalagad_spirit': 'relic_umalagad_spirit'
  };
  
  return spriteMap[relicId] || '';
}

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
  private relicUpdatePending: boolean = false;
  private lastRelicCount: number = 0;
  
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
    this.relicUpdatePending = false;
    this.lastRelicCount = 0;
  }
  
  /**
   * Initialize all UI elements
   */
  public initialize(): void {
    this.createCombatUI();
    this.createRelicInventory();
    // Deck sprite is created in Combat.ts, not here
    // this.createDeckSprite();
    // Discard pile created here with proper stacking effect
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
    // Title removed - inventory UI now at top center

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

    // Player sprite (static image - mc_combat.png)
    this.playerSprite = this.scene.add.sprite(playerX, playerY, "combat_player");
    this.playerSprite.setScale(2);
    
    // Disable texture smoothing for pixel-perfect rendering
    this.playerSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // No animation needed - using static sprite

    // Calculate dynamic Y offset based on player sprite's scaled height
    const playerScale = 2;
    const playerSpriteScaledHeight = this.playerSprite.height * playerScale;
    const playerNameYOffset = playerY - (playerSpriteScaledHeight / 2) - 20; // 20px padding above sprite
    const playerHealthYOffset = playerY + (playerSpriteScaledHeight / 2) + 20; // 20px padding below sprite
    const playerBlockYOffset = playerHealthYOffset + 25;
    const playerStatusYOffset = playerBlockYOffset + 30;

    // Player name - dynamically positioned above sprite
    this.scene.add
      .text(playerX, playerNameYOffset, this.scene.getCombatState().player.name, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "center"
      })
      .setOrigin(0.5);

    // Health display - dynamically positioned below sprite
    this.playerHealthText = this.scene.add
      .text(playerX, playerHealthYOffset, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ff6b6b",
        align: "center"
      })
      .setOrigin(0.5);

    // Block display
    this.playerBlockText = this.scene.add
      .text(playerX, playerBlockYOffset, "", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#4ecdc4",
        align: "center"
      })
      .setOrigin(0.5);

    this.playerStatusContainer = this.scene.add.container(playerX, playerStatusYOffset);

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
    
    const combatState = this.scene.getCombatState();
    const enemyName = combatState.enemy.name;
    const enemySpriteKey = this.getEnemySpriteKey(enemyName);

    // Enemy sprite
    this.enemySprite = this.scene.add.sprite(enemyX, enemyY, enemySpriteKey);
    
    // Disable texture smoothing for pixel-perfect rendering
    this.enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Scale the sprite - adjust for smaller enemies (Tiyanak and Duwende)
    const sprite = this.enemySprite;
    const lowerCaseName = enemyName.toLowerCase();
    let targetWidth = 250;
    let targetHeight = 250;
    
    // Smaller enemies should be scaled down to emphasize size difference
    if (lowerCaseName.includes("tiyanak") || lowerCaseName.includes("duwende")) {
      targetWidth = 150;  // Smaller target for baby-sized enemies
      targetHeight = 150;
    }
    
    const scale = Math.min(targetWidth / sprite.width, targetHeight / sprite.height);
    sprite.setScale(scale);

    // Calculate dynamic Y offset based on sprite's scaled height
    const spriteScaledHeight = sprite.height * scale;
    const nameYOffset = enemyY - (spriteScaledHeight / 2) - 20; // 20px padding above sprite
    const healthYOffset = enemyY + (spriteScaledHeight / 2) + 20; // 20px padding below sprite
    const blockYOffset = healthYOffset + 25;
    const statusYOffset = blockYOffset + 30;

    // Enemy name - dynamically positioned above sprite
    this.scene.add
      .text(enemyX, nameYOffset, combatState.enemy.name, {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center"
      })
      .setOrigin(0.5);

    // Health display - dynamically positioned below sprite based on actual size
    this.enemyHealthText = this.scene.add
      .text(enemyX, healthYOffset, "", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#ff6b6b",
        align: "center"
      })
      .setOrigin(0.5);

    // Block display
    this.enemyBlockText = this.scene.add
      .text(enemyX, blockYOffset, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#4ecdc4",
        align: "center"
      })
      .setOrigin(0.5);

    // Intent display - hidden for now
    this.enemyIntentText = this.scene.add
      .text(enemyX, statusYOffset + 30, "", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#feca57",
        align: "center",
        wordWrap: { width: 200 }
      })
      .setOrigin(0.5)
      .setVisible(false); // Hidden

    // Status effects container - positioned dynamically
    this.enemyStatusContainer = this.scene.add.container(enemyX, statusYOffset);

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
    
    // Create selection counter text (Balatro style) - positioned well above the cards
    this.selectionCounterText = this.scene.add.text(0, -150, "Selected: 0/5", {
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
    const screenHeight = this.scene.cameras.main.height;
    
    // Move turn text to center below inventory (inventory is at y=60, height=90)
    this.turnText = this.scene.add.text(screenWidth / 2, 165, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center"
    }).setOrigin(0.5);

    // Move discard counter higher above action buttons to avoid overlap with sort buttons
    this.actionsText = this.scene.add.text(screenWidth / 2, screenHeight - 140, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ffd93d",
      align: "center"
    }).setOrigin(0.5);

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
   * Create relic inventory in top center (grid layout like Overworld - 6 relics per row)
   */
  public createRelicInventory(): void {
    const screenWidth = this.scene.cameras.main.width;
    this.relicInventory = this.scene.add.container(screenWidth / 2, 80);
    this.relicInventory.setVisible(true);
    this.currentRelicTooltip = null;
    
    console.log("Creating relic inventory container at:", screenWidth / 2, 80);
    
    const inventoryWidth = 600;
    const inventoryHeight = 140;
    
    // Enhanced Prologue-style double border design
    const outerBorder = this.scene.add.rectangle(0, 0, inventoryWidth + 8, inventoryHeight + 8, undefined, 0);
    outerBorder.setStrokeStyle(3, 0x77888C, 0.9);
    
    const innerBorder = this.scene.add.rectangle(0, 0, inventoryWidth, inventoryHeight, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    
    const mainBg = this.scene.add.rectangle(0, 0, inventoryWidth, inventoryHeight, 0x120C0E);
    
    // Title text
    const relicsTitle = this.scene.add.text(-inventoryWidth/2 + 15, -inventoryHeight/2 + 15, "RELICS", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C",
      align: "left"
    }).setOrigin(0, 0.5);
    
    // Grid layout parameters (like Overworld)
    const relicSlotSize = 50;
    const relicsPerRow = 6;
    const padding = 15;
    const gridStartX = -(relicsPerRow - 1) * (relicSlotSize + padding) / 2;
    const gridStartY = 10;
    
    // Create 6 relic slots in a single row
    for (let i = 0; i < relicsPerRow; i++) {
      const col = i;
      const slotX = gridStartX + col * (relicSlotSize + padding);
      const slotY = gridStartY;
      
      // Create slot container
      const slotContainer = this.scene.add.container(slotX, slotY);
      
      // Outer border (matching Overworld style)
      const outerBorder = this.scene.add.rectangle(0, 0, relicSlotSize + 4, relicSlotSize + 4, undefined, 0);
      outerBorder.setStrokeStyle(2, 0x555555, 1.0);
      
      // Inner background
      const bg = this.scene.add.rectangle(0, 0, relicSlotSize, relicSlotSize, 0x333333);
      
      slotContainer.add([bg, outerBorder]);
      (slotContainer as any).isRelicSlot = true;
      (slotContainer as any).slotIndex = i;
      
      this.relicInventory.add(slotContainer);
    }
    
    // Add all elements to container
    this.relicInventory.add([mainBg, innerBorder, outerBorder, relicsTitle]);
    this.relicInventory.sendToBack(mainBg);
    this.relicInventory.sendToBack(innerBorder);
    this.relicInventory.sendToBack(outerBorder);
  }
  

  
  /**
   * Create deck sprite (Balatro-style stacked cards with depth)
   */
  public createDeckSprite(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Position in BOTTOM RIGHT corner, matching Balatro's layout
    this.deckPosition = { x: screenWidth - 100, y: screenHeight * 0.75 };
    
    // Create a container for the deck pile
    const deckContainer = this.scene.add.container(this.deckPosition.x, this.deckPosition.y);
    
    // Card dimensions matching hand cards
    const cardWidth = 80;
    const cardHeight = 112;
    const verticalOffset = 3; // Cards spread downward
    const numStackedCards = 5; // Show max 5 cards in stack for depth effect
    
    // Create stacked cards going downward (Balatro style)
    // Back cards use white rectangles with black borders
    for (let i = 0; i < numStackedCards - 1; i++) {
      const cardBack = this.scene.add.rectangle(
        0,
        i * verticalOffset,
        cardWidth,
        cardHeight,
        0xffffff // White color for card backs
      );
      cardBack.setStrokeStyle(2, 0x000000); // Black border
      deckContainer.add(cardBack);
    }
    
    // Top deck card - use backart.png texture
    const deckTexture = this.scene.textures.exists('backart') ? 'backart' : 'card_back';
    
    this.deckSprite = this.scene.add.sprite(
      0,
      (numStackedCards - 1) * verticalOffset,
      deckTexture
    );
    this.deckSprite.setDisplaySize(cardWidth, cardHeight);
    deckContainer.add(this.deckSprite);
    
    // Deck count text (below the cards, centered on the stack)
    const deckCountText = this.scene.add.text(
      0,
      cardHeight/2 + 15,
      "Draw: 0",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#e8eced",
        align: "center"
      }
    ).setOrigin(0.5);
    deckContainer.add(deckCountText);
    (deckContainer as any).deckCountText = deckCountText;
    
    // Make entire container interactive (larger hit area for better UX)
    const totalHeight = cardHeight + ((numStackedCards - 1) * verticalOffset);
    deckContainer.setSize(cardWidth, totalHeight);
    deckContainer.setInteractive(
      new Phaser.Geom.Rectangle(
        -10, 
        -10, 
        cardWidth + 20, 
        totalHeight + 40
      ),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Hover effect - smooth scale up
    deckContainer.on("pointerover", () => {
      deckContainer.setScale(1.1);
    });
    
    deckContainer.on("pointerout", () => {
      deckContainer.setScale(1.0);
    });
    
    // Click to view deck
    deckContainer.on("pointerdown", () => {
      this.showDeckView();
    });
    
    // Store reference to container
    (this.deckSprite as any).deckContainer = deckContainer;
    
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
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    this.deckViewContainer = this.scene.add.container(screenWidth / 2, screenHeight / 2);
    this.deckViewContainer.setVisible(false);
    this.deckViewContainer.setDepth(6000);
  }
  
  /**
   * Create discard view modal
   */
  public createDiscardView(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    this.discardViewContainer = this.scene.add.container(screenWidth / 2, screenHeight / 2);
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
    
    // Ensure health values are properly rounded and clamped
    const currentHealth = Math.max(0, Math.floor(player.currentHealth));
    const maxHealth = Math.max(1, Math.floor(player.maxHealth));
    
    this.playerHealthText.setText(`♥ ${currentHealth}/${maxHealth}`);
    this.playerBlockText.setText(player.block > 0 ? `⛨ ${player.block}` : "");
    
    // Schedule relic inventory update instead of immediate update
    this.scheduleRelicInventoryUpdate();
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
        `Discards: ${this.scene.getDiscardsUsedThisTurn()}/${this.scene.getMaxDiscardsPerTurn()}`
      );
      // Hand indicator removed - now using selection counter above cards
    } catch (error) {
      console.error("Error updating turn UI:", error);
    }
  }
  
  /**
   * Update hand indicator to show current selected hand type (DEPRECATED - using selection counter instead)
   */
  public updateHandIndicator(): void {
    // No longer used - hand info now shown in selection counter above cards
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
   * Update relic inventory with current relics (grid layout)
   */
  public updateRelicInventory(): void {
    if (!this.relicInventory) return;
    
    const combatState = this.scene.getCombatState();
    const relics = combatState.player.relics;
    
    // Skip update if counts haven't changed (optimization)
    if (relics.length === this.lastRelicCount && !this.relicUpdatePending) {
      return;
    }
    
    this.lastRelicCount = relics.length;
    this.relicUpdatePending = false;
    
    console.log("Updating relic inventory. Relics:", relics.length);
    console.log("Relic data:", relics);
    
    // Grid configuration (matching createRelicInventory)
    const relicSlotSize = 50;
    const relicsPerRow = 6;
    const padding = 15;
    const gridStartX = -(relicsPerRow - 1) * (relicSlotSize + padding) / 2;
    const gridStartY = 10;
    
    // Remove only the relic icons (keep the permanent slot frames)
    this.relicInventory.list.forEach(child => {
      if ((child as any).isRelicIcon) {
        child.destroy();
      }
    });
    
    // Get references to existing slot containers
    const relicSlots = this.relicInventory.list.filter(child => (child as any).isRelicSlot) as Phaser.GameObjects.Container[];
    
    // Add relic icons to existing slots
    relics.forEach((relic, index) => {
      if (index < relicsPerRow && relicSlots[index]) {
        const slot = relicSlots[index];
        
        console.log(`Adding relic ${index}:`, relic.name, "ID:", relic.id);
        
        // Calculate absolute position for the icon (using grid layout)
        const col = index;
        const iconX = gridStartX + col * (relicSlotSize + padding);
        const iconY = gridStartY;
        
        // Get sprite key for this relic
        const spriteKey = getRelicSpriteKey(relic.id);
        
        // Add relic icon DIRECTLY to relicInventory (not to slot)
        let relicIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
        
        if (spriteKey && this.scene.textures.exists(spriteKey)) {
          // Use sprite if available
          relicIcon = this.scene.add.image(iconX, iconY, spriteKey)
            .setOrigin(0.5)
            .setDisplaySize(44, 44) // Fit within 50px slot
            .setDepth(100);
          console.log(`Using sprite for relic: ${spriteKey}`);
        } else {
          // Fallback to emoji if sprite not found
          relicIcon = this.scene.add.text(iconX, iconY, relic.emoji || "⚙️", {
            fontSize: 36,
            color: "#ffffff",
            align: "center"
          }).setOrigin(0.5).setDepth(100);
          console.warn(`Sprite not found for relic ${relic.id}, using emoji`);
        }
        
        (relicIcon as any).isRelicIcon = true;
        this.relicInventory.add(relicIcon);
        
        // Make slot interactive with hover effects (matching Overworld style)
        slot.setSize(relicSlotSize + 4, relicSlotSize + 4);
        slot.setInteractive(
          new Phaser.Geom.Rectangle(-(relicSlotSize + 4)/2, -(relicSlotSize + 4)/2, relicSlotSize + 4, relicSlotSize + 4),
          Phaser.Geom.Rectangle.Contains
        );
        
        // Clear any existing event listeners to prevent memory leaks
        slot.removeAllListeners();
        
        // Get border and bg references from slot (matching createRelicInventory structure)
        const slotChildren = slot.list as Phaser.GameObjects.Rectangle[];
        const bg = slotChildren[0]; // Background
        const outerBorder = slotChildren[1]; // Border
        
        slot.on("pointerover", () => {
          bg.setFillStyle(0x555555); // Brighten background
          outerBorder.setStrokeStyle(2, 0x777777); // Brighten border
          
          // Kill any existing tweens on this icon to prevent conflicts
          this.scene.tweens.killTweensOf(relicIcon);
          
          this.scene.tweens.add({
            targets: relicIcon,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          this.showRelicTooltip(relic.name, iconX, iconY - 50);
        });
        
        slot.on("pointerout", () => {
          bg.setFillStyle(0x333333); // Reset background
          outerBorder.setStrokeStyle(2, 0x555555); // Reset border
          
          // Kill any existing tweens on this icon to prevent conflicts
          this.scene.tweens.killTweensOf(relicIcon);
          
          this.scene.tweens.add({
            targets: relicIcon,
            scaleX: 0.1,
            scaleY: 0.1,
            duration: 150,
            ease: 'Back.easeOut'
          });
          
          this.hideRelicTooltip();
        });
        
        slot.on("pointerdown", () => {
          this.showRelicDetailModal(relic);
        });
      }
    });
  }
  
  /**
   * Schedule a relic inventory update to be executed on the next frame (optimized for batching)
   */
  public scheduleRelicInventoryUpdate(): void {
    if (this.relicUpdatePending) return; // Already scheduled
    
    this.relicUpdatePending = true;
    this.scene.time.delayedCall(1, () => {
      if (this.relicUpdatePending) { // Check if still needed
        this.updateRelicInventory();
      }
    });
  }
  
  /**
   * Force relic inventory update (for use after major changes like shop purchases)
   */
  public forceRelicInventoryUpdate(): void {
    this.relicUpdatePending = true;
    this.updateRelicInventory();
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
      
      const playButton = createButton(this.scene, -adjustedSpacing * 1.2, 0, "Play Hand", () => {
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

      const discardButton = createButton(this.scene, adjustedSpacing * 1.2, 0, "Discard", () => {
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
      const attackButton = createButton(this.scene, -buttonSpacing, 0, "Attack", () => {
        this.scene.executeAction("attack");
      });

      const defendButton = createButton(this.scene, 0, 0, "Defend", () => {
        this.scene.executeAction("defend");
      });

      const specialButton = createButton(this.scene, buttonSpacing, 0, "Special", () => {
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

  
  /**
   * Update deck display with current card count
   */
  public updateDeckDisplay(): void {
    if (!this.deckSprite) return;
    
    const combatState = this.scene.getCombatState();
    const deckCount = combatState.player.drawPile.length;
    
    // Update deck count text
    const deckContainer = (this.deckSprite as any).deckContainer;
    if (deckContainer) {
      const deckCountText = (deckContainer as any).deckCountText;
      if (deckCountText) {
        deckCountText.setText(`Draw: ${deckCount}`);
      }
      
      // ALWAYS show the deck pile (even when empty)
      deckContainer.setVisible(true);
      
      // Optional: Adjust visual stack depth based on card count
      // When deck is low, show fewer stacked cards for visual feedback
      const stackedCards = deckContainer.list.filter((child: any) => 
        child instanceof Phaser.GameObjects.Rectangle || child instanceof Phaser.GameObjects.Sprite
      );
      
      if (deckCount === 0) {
        // Show empty/low stack when no cards remain
        stackedCards.forEach((card: any, index: number) => {
          if (index < stackedCards.length - 1) {
            card.setAlpha(0.3); // Dim the back cards
          }
        });
      } else {
        // Full opacity when cards remain
        stackedCards.forEach((card: any) => {
          card.setAlpha(1.0);
        });
      }
    }
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
   * Show relic tooltip (Prologue style) with proper text wrapping
   */
  private showRelicTooltip(name: string, x: number, y: number): void {
    this.hideRelicTooltip();
    
    const tooltipContainer = this.scene.add.container(x, y);
    const maxTooltipWidth = 220; // Maximum width for tooltip
    const tooltipPadding = 12;
    
    // Create text first to measure it
    const text = this.scene.add.text(0, 0, name, {
      fontFamily: "dungeon-mode",
      fontSize: 13,
      color: "#77888C",
      align: "center",
      wordWrap: { width: maxTooltipWidth - tooltipPadding * 2 }
    }).setOrigin(0.5);
    
    // Calculate tooltip dimensions based on text size
    const textBounds = text.getBounds();
    const tooltipWidth = Math.min(textBounds.width + tooltipPadding * 2, maxTooltipWidth);
    const tooltipHeight = textBounds.height + tooltipPadding;
    
    // Prologue-style double border
    const outerBorder = this.scene.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x77888C);
    
    const innerBorder = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const bg = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
    
    tooltipContainer.add([outerBorder, innerBorder, bg, text]);
    tooltipContainer.setDepth(6000);
    (tooltipContainer as any).isTooltip = true;
    
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
   * Show potion tooltip (Prologue style with cyan accent) with proper text wrapping
   */
  private showPotionTooltip(name: string, x: number, y: number): void {
    this.hideRelicTooltip(); // Reuse the same tooltip system
    
    const tooltipContainer = this.scene.add.container(x, y);
    const maxTooltipWidth = 220; // Maximum width for tooltip
    const tooltipPadding = 12;
    
    // Create text first to measure it
    const text = this.scene.add.text(0, 0, name, {
      fontFamily: "dungeon-mode",
      fontSize: 13,
      color: "#4ecdc4",
      align: "center",
      wordWrap: { width: maxTooltipWidth - tooltipPadding * 2 }
    }).setOrigin(0.5);
    
    // Calculate tooltip dimensions based on text size
    const textBounds = text.getBounds();
    const tooltipWidth = Math.min(textBounds.width + tooltipPadding * 2, maxTooltipWidth);
    const tooltipHeight = textBounds.height + tooltipPadding;
    
    // Prologue-style double border with cyan accent for potions
    const outerBorder = this.scene.add.rectangle(0, 0, tooltipWidth + 8, tooltipHeight + 8, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x4ecdc4); // Cyan for potions
    
    const innerBorder = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x4ecdc4); // Cyan for potions
    
    const bg = this.scene.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x150E10);
    
    tooltipContainer.add([outerBorder, innerBorder, bg, text]);
    tooltipContainer.setDepth(6000);
    (tooltipContainer as any).isTooltip = true;
    
    this.currentRelicTooltip = tooltipContainer; // Reuse the same reference
    this.relicInventory.add(tooltipContainer);
  }
  
  /**
   * Hide potion tooltip
   */
  private hidePotionTooltip(): void {
    this.hideRelicTooltip(); // Same as hiding relic tooltip
  }
  
  /**
   * Use potion in combat
   */
  private usePotionInCombat(potion: any, index: number): void {
    console.log(`Using potion: ${potion.name}`);
    // TODO: Implement potion effects based on potion.effect
    // For now, just show a message and remove the potion
    this.showActionResult(`Used ${potion.name}!`);
    
    // Remove potion from player inventory
    const combatState = this.scene.getCombatState();
    if (combatState.player.potions) {
      combatState.player.potions.splice(index, 1);
      this.forceRelicInventoryUpdate(); // Force update after potion use
    }
  }
  
  /**
   * Show relic detail modal with comprehensive information
   */
  private showRelicDetailModal(relic: any): void {
    console.log("Showing relic detail modal for:", relic.name);
    
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Create modal container
    const modalContainer = this.scene.add.container(screenWidth / 2, screenHeight / 2);
    modalContainer.setDepth(3000);
    
    // Semi-transparent overlay background
    const overlay = this.scene.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7);
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      modalContainer.destroy();
    });
    
    // Modal window dimensions
    const modalWidth = 450;
    const modalHeight = 300;
    
    // Main modal background with Prologue styling
    const modalBg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x0f0a0b);
    const outerBorder = this.scene.add.rectangle(0, 0, modalWidth + 6, modalHeight + 6, undefined, 0);
    outerBorder.setStrokeStyle(3, 0x77888C, 1.0);
    const innerBorder = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    
    // Title section with relic icon
    const titleY = -modalHeight/2 + 40;
    const relicIcon = this.scene.add.text(-modalWidth/2 + 40, titleY, relic.emoji || "⚙️", {
      fontSize: 32,
      align: "center"
    }).setOrigin(0.5);
    
    const relicName = this.scene.add.text(-modalWidth/2 + 80, titleY, relic.name, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffd93d",
      align: "left",
      wordWrap: { width: modalWidth - 180 }
    }).setOrigin(0, 0.5);
    
    // Rarity indicator (if available)
    let rarityColor = "#77888C";
    let rarityText = "COMMON";
    if (relic.rarity) {
      switch (relic.rarity.toLowerCase()) {
        case "uncommon": rarityColor = "#4ecdc4"; rarityText = "UNCOMMON"; break;
        case "rare": rarityColor = "#ffd93d"; rarityText = "RARE"; break;
        case "legendary": rarityColor = "#ff6b6b"; rarityText = "LEGENDARY"; break;
      }
    }
    
    const rarityLabel = this.scene.add.text(modalWidth/2 - 20, titleY, rarityText, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: rarityColor,
      align: "right"
    }).setOrigin(1, 0.5);
    
    // Description section
    const descriptionY = titleY + 60;
    const description = this.scene.add.text(0, descriptionY, relic.description || "A mysterious relic with unknown powers.", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e8eced",
      align: "center",
      wordWrap: { width: modalWidth - 40 }
    }).setOrigin(0.5, 0);
    
    // Effect section (if available)
    let effectText = "";
    if (relic.effect) {
      effectText = this.getRelicEffectDescription(relic);
    }
    
    const effectLabel = this.scene.add.text(0, descriptionY + 80, "EFFECT:", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);
    
    const effectDescription = this.scene.add.text(0, descriptionY + 100, effectText, {
      fontFamily: "dungeon-mode",
      fontSize: 13,
      color: "#4ecdc4",
      align: "center",
      wordWrap: { width: modalWidth - 40 }
    }).setOrigin(0.5, 0);
    
    // Close button
    const closeButton = this.createCloseButton(modalWidth/2 - 30, -modalHeight/2 + 30);
    closeButton.on('pointerdown', () => {
      modalContainer.destroy();
    });
    
    // Add all elements to modal
    modalContainer.add([
      overlay,
      outerBorder,
      innerBorder,
      modalBg,
      relicIcon,
      relicName,
      rarityLabel,
      description,
      effectLabel,
      effectDescription,
      closeButton
    ]);
    
    // Add entrance animation
    modalContainer.setScale(0.8);
    modalContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: modalContainer,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.Out'
    });
  }
  
  /**
   * Get detailed effect description for relic
   */
  private getRelicEffectDescription(relic: any): string {
    // Map common relic effects to user-friendly descriptions
    const effectDescriptions: { [key: string]: string } = {
      "hand_tier_increase": "Your poker hands are evaluated as one tier higher.",
      "extra_discard": "Gain +1 discard charge per combat.",
      "persistent_block": "Start each combat with 5 block.",
      "lupa_block_bonus": "Gain +2 block when playing Lupa (Earth) cards.",
      "apoy_damage_bonus": "Deal +3 damage when playing Apoy (Fire) cards.",
      "tubig_healing": "Heal 2 HP when playing Tubig (Water) cards.",
      "hangin_draw": "Draw +1 card when playing Hangin (Air) cards.",
      "five_of_a_kind_unlock": "Enables Five of a Kind poker hands.",
      "start_with_strength": "Start each combat with 2 Strength.",
      "burn_immunity": "Immune to Burn status effects."
    };
    
    if (relic.effect && effectDescriptions[relic.effect]) {
      return effectDescriptions[relic.effect];
    }
    
    // Fallback to generic description
    return relic.effect || "This relic provides a powerful passive benefit during combat.";
  }
  
  /**
   * Show deck view with next/previous navigation (Balatro-style)
   */
  public showDeckView(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Clear existing content (keep bg, title, close button)
    this.deckViewContainer.list
      .filter(item => (item as any).isDeckContent)
      .forEach(item => item.destroy());
    
    const cards = this.scene.getCombatState().player.drawPile;
    
    // Check if deck is empty
    if (cards.length === 0) {
      // Show empty state message
      const emptyMessage = this.scene.add.text(0, 0, "Draw pile is empty", {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center",
      }).setOrigin(0.5);
      (emptyMessage as any).isDeckContent = true;
      (emptyMessage as any).isEmptyMessage = true;
      this.deckViewContainer.add(emptyMessage);
      
      // Update card count
      const cardCountText = this.deckViewContainer.list.find(
        item => (item as any).isDeckContent && item.type === 'Text' && !(item as any).isEmptyMessage
      ) as Phaser.GameObjects.Text;
      if (cardCountText) {
        cardCountText.setText(`0 cards`);
      }
      
      // Hide navigation buttons when empty
      const prevButton = this.deckViewContainer.list.find(item => (item as any).isPrevButton);
      const nextButton = this.deckViewContainer.list.find(item => (item as any).isNextButton);
      const pageCounter = this.deckViewContainer.list.find(item => (item as any).isPageCounter);
      
      if (prevButton) (prevButton as any).setVisible(false);
      if (nextButton) (nextButton as any).setVisible(false);
      if (pageCounter) (pageCounter as any).setVisible(false);
      
      this.deckViewContainer.setVisible(true);
      return;
    }
    
    // Show navigation buttons if hidden
    const prevButton = this.deckViewContainer.list.find(item => (item as any).isPrevButton);
    const nextButton = this.deckViewContainer.list.find(item => (item as any).isNextButton);
    const pageCounter = this.deckViewContainer.list.find(item => (item as any).isPageCounter);
    
    if (prevButton) (prevButton as any).setVisible(true);
    if (nextButton) (nextButton as any).setVisible(true);
    if (pageCounter) (pageCounter as any).setVisible(true);
    
    // Categorize cards by suit and sort by value (2 to Ace)
    const suitOrder = ["Apoy", "Tubig", "Lupa", "Hangin"];
    const cardsBySuit: { [key: string]: any[] } = {
      "Apoy": [],
      "Tubig": [],
      "Lupa": [],
      "Hangin": []
    };
    
    // Group cards by suit
    cards.forEach(card => {
      if (cardsBySuit[card.suit]) {
        cardsBySuit[card.suit].push(card);
      }
    });
    
    // Convert rank to numeric value for sorting
    const getRankValue = (rank: string): number => {
      if (rank === "1") return 14; // Ace is highest
      if (rank === "Mandirigma") return 11; // Jack
      if (rank === "Babaylan") return 12; // Queen
      if (rank === "Datu") return 13; // King
      return parseInt(rank); // 2-10
    };
    
    // Sort each suit: 2-10, then Mandirigma (11), Babaylan (12), Datu (13), 1 (Ace=14)
    const sortByValue = (a: any, b: any) => {
      const valueA = getRankValue(a.rank);
      const valueB = getRankValue(b.rank);
      return valueA - valueB;
    };
    
    Object.keys(cardsBySuit).forEach(suit => {
      cardsBySuit[suit].sort(sortByValue);
    });
    
    // 4 pages - one for each suit
    const totalPages = 4;
    let currentPage = 0;
    
    // Store current page in container
    (this.deckViewContainer as any).currentPage = currentPage;
    (this.deckViewContainer as any).totalPages = totalPages;
    
    const renderPage = (page: number) => {
      // Clear previous page cards and suit label
      this.deckViewContainer.list
        .filter(item => (item as any).isPageCard || (item as any).isSuitLabel)
        .forEach(item => item.destroy());
      
      const suit = suitOrder[page];
      const pageCards = cardsBySuit[suit];
      
      // Suit label with color and icon
      const suitColors: { [key: string]: string } = {
        "Apoy": "#FF6B6B",
        "Tubig": "#54A0FF",
        "Lupa": "#00D2D3",
        "Hangin": "#A29BFE"
      };
      
      const suitIcons: { [key: string]: string } = {
        "Apoy": "🔥",
        "Tubig": "💧",
        "Lupa": "🌿",
        "Hangin": "💨"
      };
      
      const suitLabel = this.scene.add.text(0, -screenHeight * 0.28, `${suitIcons[suit]} ${suit.toUpperCase()} (${pageCards.length} cards)`, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: suitColors[suit],
        align: "center",
      }).setOrigin(0.5);
      (suitLabel as any).isSuitLabel = true;
      (suitLabel as any).isDeckContent = true;
      this.deckViewContainer.add(suitLabel);
      
      // Grid layout - 2 rows of 6 cards (Balatro-style)
      const columns = 6;
      const rows = 2;
      const cardWidth = 100;
      const cardHeight = 140;
      const horizontalSpacing = 20;
      const verticalSpacing = 30;
      
      // Center the grid
      const totalGridWidth = (columns * cardWidth) + ((columns - 1) * horizontalSpacing);
      const totalGridHeight = (rows * cardHeight) + ((rows - 1) * verticalSpacing);
      const startX = -totalGridWidth / 2 + cardWidth / 2;
      const startY = -totalGridHeight / 2 + cardHeight / 2 - 20; // Offset up slightly
      
      pageCards.forEach((card, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + col * (cardWidth + horizontalSpacing);
        const y = startY + row * (cardHeight + verticalSpacing);
        
        const cardSprite = this.scene.ui.createCardSprite(card, x, y, false);
        (cardSprite as any).isPageCard = true;
        (cardSprite as any).isDeckContent = true;
        cardSprite.setScale(1.25); // Slightly larger for better visibility
        
        this.deckViewContainer.add(cardSprite);
      });
      
      // Update page counter with suit name
      const pageCounter = this.deckViewContainer.list.find(item => (item as any).isPageCounter) as Phaser.GameObjects.Text;
      if (pageCounter) {
        pageCounter.setText(`${suit} - Page ${page + 1} / ${totalPages}`);
      }
      
      // Update button states
      const prevButton = this.deckViewContainer.list.find(item => (item as any).isPrevButton);
      const nextButton = this.deckViewContainer.list.find(item => (item as any).isNextButton);
      
      if (prevButton) {
        (prevButton as any).setAlpha(page > 0 ? 1 : 0.3);
      }
      if (nextButton) {
        (nextButton as any).setAlpha(page < totalPages - 1 ? 1 : 0.3);
      }
    };
    
    // Create navigation UI (only if not already created)
    if (!this.deckViewContainer.list.find(item => (item as any).isNavigation)) {
      // Background - Double border design (Balatro style)
      const modalWidth = screenWidth * 0.8;
      const modalHeight = screenHeight * 0.8;
      
      const outerBorder = this.scene.add.rectangle(0, 0, modalWidth + 8, modalHeight + 8, undefined, 0);
      outerBorder.setStrokeStyle(3, 0x77888C);
      (outerBorder as any).isNavigation = true;
      
      const innerBorder = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, undefined, 0);
      innerBorder.setStrokeStyle(2, 0x77888C);
      (innerBorder as any).isNavigation = true;
      
      const bg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x150E10, 0.98);
      (bg as any).isNavigation = true;
      
      this.deckViewContainer.add([outerBorder, innerBorder, bg]);
      
      // Title
      const title = this.scene.add.text(0, -screenHeight * 0.35, "Draw Pile", {
        fontFamily: "dungeon-mode",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
      (title as any).isNavigation = true;
      this.deckViewContainer.add(title);
      
      // Card count
      const cardCount = this.scene.add.text(0, -screenHeight * 0.35 + 40, `${cards.length} cards`, {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "center",
      }).setOrigin(0.5);
      (cardCount as any).isNavigation = true;
      (cardCount as any).isDeckContent = true;
      this.deckViewContainer.add(cardCount);
      
      // Close button
      const closeButton = this.createCloseButton(screenWidth * 0.35, -screenHeight * 0.35);
      (closeButton as any).isNavigation = true;
      this.deckViewContainer.add(closeButton);
      
      // Previous button (left arrow)
      const prevButton = this.createNavigationButton(
        -screenWidth * 0.25,
        screenHeight * 0.3,
        "◄",
        () => {
          if (currentPage > 0) {
            currentPage--;
            (this.deckViewContainer as any).currentPage = currentPage;
            renderPage(currentPage);
          }
        }
      );
      (prevButton as any).isNavigation = true;
      (prevButton as any).isPrevButton = true;
      this.deckViewContainer.add(prevButton);
      
      // Next button (right arrow)
      const nextButton = this.createNavigationButton(
        screenWidth * 0.25,
        screenHeight * 0.3,
        "►",
        () => {
          if (currentPage < totalPages - 1) {
            currentPage++;
            (this.deckViewContainer as any).currentPage = currentPage;
            renderPage(currentPage);
          }
        }
      );
      (nextButton as any).isNavigation = true;
      (nextButton as any).isNextButton = true;
      this.deckViewContainer.add(nextButton);
      
      // Page counter
      const pageCounter = this.scene.add.text(0, screenHeight * 0.3, `Page 1 / ${totalPages}`, {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
      (pageCounter as any).isNavigation = true;
      (pageCounter as any).isPageCounter = true;
      this.deckViewContainer.add(pageCounter);
    } else {
      // Update card count if UI already exists
      const cardCountText = this.deckViewContainer.list.find(item => (item as any).isDeckContent && item.type === 'Text' && !(item as any).isSuitLabel) as Phaser.GameObjects.Text;
      if (cardCountText) {
        cardCountText.setText(`${cards.length} cards`);
      }
      
      // Update button callbacks with new closure references
      const prevButton = this.deckViewContainer.list.find(item => (item as any).isPrevButton) as Phaser.GameObjects.Container;
      const nextButton = this.deckViewContainer.list.find(item => (item as any).isNextButton) as Phaser.GameObjects.Container;
      
      if (prevButton) {
        // Remove old listeners
        const prevBg = prevButton.list[0] as Phaser.GameObjects.Rectangle;
        prevBg.removeAllListeners('pointerdown');
        
        // Add new listener with updated closure
        prevBg.on("pointerdown", () => {
          // Get current page from container storage
          const storedPage = (this.deckViewContainer as any).currentPage || 0;
          if (prevButton.alpha === 1 && storedPage > 0) {
            const newPage = storedPage - 1;
            (this.deckViewContainer as any).currentPage = newPage;
            renderPage(newPage);
          }
        });
      }
      
      if (nextButton) {
        // Remove old listeners
        const nextBg = nextButton.list[0] as Phaser.GameObjects.Rectangle;
        nextBg.removeAllListeners('pointerdown');
        
        // Add new listener with updated closure
        nextBg.on("pointerdown", () => {
          // Get current page from container storage
          const storedPage = (this.deckViewContainer as any).currentPage || 0;
          if (nextButton.alpha === 1 && storedPage < totalPages - 1) {
            const newPage = storedPage + 1;
            (this.deckViewContainer as any).currentPage = newPage;
            renderPage(newPage);
          }
        });
      }
    }
    
    // Render current page (or first page if starting fresh)
    const pageToRender = (this.deckViewContainer as any).currentPage || 0;
    renderPage(pageToRender);
    
    // Show container
    this.deckViewContainer.setVisible(true);
  }
  
  /**
   * Create close button for modal dialogs
   */
  private createCloseButton(x: number, y: number): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);
    
    const bg = this.scene.add.circle(0, 0, 24, 0x1a1a1a);
    bg.setStrokeStyle(2, 0xff6b6b);
    
    const text = this.scene.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode",
      fontSize: 28,
      color: "#ff6b6b",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, text]);
    
    // Fix: Use the bg circle directly for interaction
    bg.setInteractive({ useHandCursor: true });
    
    bg.on("pointerover", () => {
      bg.setFillStyle(0xff6b6b, 0.3);
      bg.setScale(1.1);
      this.scene.tweens.add({
        targets: button,
        scale: 1.15,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(0x1a1a1a);
      bg.setScale(1);
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: button,
        scale: 0.9,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          this.deckViewContainer.setVisible(false);
        }
      });
    });
    
    return button;
  }
  
  /**
   * Create navigation button (previous/next)
   */
  private createNavigationButton(
    x: number,
    y: number,
    symbol: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 70, 70, 0x150E10);
    bg.setStrokeStyle(3, 0x77888C);
    
    const innerBorder = this.scene.add.rectangle(0, 0, 64, 64, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const text = this.scene.add.text(0, 0, symbol, {
      fontFamily: "dungeon-mode",
      fontSize: 36,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, innerBorder, text]);
    
    // Fix: Use the bg rectangle directly for interaction instead of creating a separate hit area
    // This ensures the interactive area perfectly matches the visual button
    bg.setInteractive({ useHandCursor: true });
    
    // Transfer events from bg to button container for proper behavior
    bg.on("pointerover", () => {
      if (button.alpha === 1) { // Only animate if button is active
        bg.setFillStyle(0x1f1410);
        text.setColor("#e8eced");
        this.scene.tweens.add({
          targets: button,
          scale: 1.15,
          duration: 150,
          ease: 'Back.easeOut'
        });
      }
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      text.setColor("#77888C");
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      if (button.alpha === 1) { // Only trigger if button is active
        this.scene.tweens.add({
          targets: button,
          scale: 0.95,
          duration: 80,
          ease: 'Power2',
          onComplete: () => {
            this.scene.tweens.add({
              targets: button,
              scale: 1.15,
              duration: 80,
              ease: 'Power2',
              onComplete: () => {
                callback();
              }
            });
          }
        });
      }
    });
    
    return button;
  }
  
  /**
   * Show discard view with next/previous navigation (Balatro-style)
   */
  public showDiscardView(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Clear existing content (keep bg, title, close button)
    this.discardViewContainer.list
      .filter(item => (item as any).isDiscardContent)
      .forEach(item => item.destroy());
    
    const cards = this.scene.getCombatState().player.discardPile;
    
    // Show navigation buttons if hidden
    const prevButton = this.discardViewContainer.list.find(item => (item as any).isPrevButton);
    const nextButton = this.discardViewContainer.list.find(item => (item as any).isNextButton);
    const pageCounter = this.discardViewContainer.list.find(item => (item as any).isPageCounter);
    
    if (prevButton) (prevButton as any).setVisible(true);
    if (nextButton) (nextButton as any).setVisible(true);
    if (pageCounter) (pageCounter as any).setVisible(true);
    
    // Pagination settings
    const cardsPerPage = 12; // 2 rows of 6 cards
    const totalPages = Math.ceil(cards.length / cardsPerPage);
    let currentPage = 0;
    
    // Store current page in container
    (this.discardViewContainer as any).currentPage = currentPage;
    (this.discardViewContainer as any).totalPages = totalPages;
    
    const renderPage = (page: number) => {
      // Clear previous page cards
      this.discardViewContainer.list
        .filter(item => (item as any).isPageCard)
        .forEach(item => item.destroy());
      
      const startIndex = page * cardsPerPage;
      const endIndex = Math.min(startIndex + cardsPerPage, cards.length);
      const pageCards = cards.slice(startIndex, endIndex);
      
      // Grid layout - 2 rows of 6 cards (Balatro-style)
      const columns = 6;
      const rows = 2;
      const cardWidth = 100;
      const cardHeight = 140;
      const horizontalSpacing = 20;
      const verticalSpacing = 30;
      
      // Center the grid
      const totalGridWidth = (columns * cardWidth) + ((columns - 1) * horizontalSpacing);
      const totalGridHeight = (rows * cardHeight) + ((rows - 1) * verticalSpacing);
      const startX = -totalGridWidth / 2 + cardWidth / 2;
      const startY = -totalGridHeight / 2 + cardHeight / 2 - 20; // Offset up slightly
      
      pageCards.forEach((card, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + col * (cardWidth + horizontalSpacing);
        const y = startY + row * (cardHeight + verticalSpacing);
        
        const cardSprite = this.scene.ui.createCardSprite(card, x, y, false);
        (cardSprite as any).isPageCard = true;
        (cardSprite as any).isDiscardContent = true;
        cardSprite.setScale(1.25); // Slightly larger for better visibility
        
        this.discardViewContainer.add(cardSprite);
      });
      
      // Update page counter
      const pageCounter = this.discardViewContainer.list.find(item => (item as any).isPageCounter) as Phaser.GameObjects.Text;
      if (pageCounter) {
        pageCounter.setText(`Page ${page + 1} / ${totalPages}`);
      }
      
      // Update button states
      const prevButton = this.discardViewContainer.list.find(item => (item as any).isPrevButton);
      const nextButton = this.discardViewContainer.list.find(item => (item as any).isNextButton);
      
      if (prevButton) {
        (prevButton as any).setAlpha(page > 0 ? 1 : 0.3);
      }
      if (nextButton) {
        (nextButton as any).setAlpha(page < totalPages - 1 ? 1 : 0.3);
      }
    };
    
    // Create navigation UI (only if not already created)
    if (!this.discardViewContainer.list.find(item => (item as any).isNavigation)) {
      // Background - Double border design (Balatro style)
      const modalWidth = screenWidth * 0.8;
      const modalHeight = screenHeight * 0.8;
      
      const outerBorder = this.scene.add.rectangle(0, 0, modalWidth + 8, modalHeight + 8, undefined, 0);
      outerBorder.setStrokeStyle(3, 0x77888C);
      (outerBorder as any).isNavigation = true;
      
      const innerBorder = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, undefined, 0);
      innerBorder.setStrokeStyle(2, 0x77888C);
      (innerBorder as any).isNavigation = true;
      
      const bg = this.scene.add.rectangle(0, 0, modalWidth, modalHeight, 0x150E10, 0.98);
      (bg as any).isNavigation = true;
      
      this.discardViewContainer.add([outerBorder, innerBorder, bg]);
      
      // Title
      const title = this.scene.add.text(0, -screenHeight * 0.35, "Discard Pile", {
        fontFamily: "dungeon-mode",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
      (title as any).isNavigation = true;
      this.discardViewContainer.add(title);
      
      // Card count
      const cardCount = this.scene.add.text(0, -screenHeight * 0.35 + 40, `${cards.length} cards`, {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "center",
      }).setOrigin(0.5);
      (cardCount as any).isNavigation = true;
      (cardCount as any).isDiscardContent = true;
      this.discardViewContainer.add(cardCount);
      
      // Close button
      const closeButton = this.createDiscardCloseButton(screenWidth * 0.35, -screenHeight * 0.35);
      (closeButton as any).isNavigation = true;
      this.discardViewContainer.add(closeButton);
      
      // Previous button (left arrow)
      const prevButton = this.createDiscardNavigationButton(
        -screenWidth * 0.25,
        screenHeight * 0.3,
        "◄",
        () => {
          if (currentPage > 0) {
            currentPage--;
            (this.discardViewContainer as any).currentPage = currentPage;
            renderPage(currentPage);
          }
        }
      );
      (prevButton as any).isNavigation = true;
      (prevButton as any).isPrevButton = true;
      this.discardViewContainer.add(prevButton);
      
      // Next button (right arrow)
      const nextButton = this.createDiscardNavigationButton(
        screenWidth * 0.25,
        screenHeight * 0.3,
        "►",
        () => {
          if (currentPage < totalPages - 1) {
            currentPage++;
            (this.discardViewContainer as any).currentPage = currentPage;
            renderPage(currentPage);
          }
        }
      );
      (nextButton as any).isNavigation = true;
      (nextButton as any).isNextButton = true;
      this.discardViewContainer.add(nextButton);
      
      // Page counter
      const pageCounter = this.scene.add.text(0, screenHeight * 0.3, `Page 1 / ${totalPages}`, {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffffff",
        align: "center",
      }).setOrigin(0.5);
      (pageCounter as any).isNavigation = true;
      (pageCounter as any).isPageCounter = true;
      this.discardViewContainer.add(pageCounter);
    } else {
      // Update card count if UI already exists
      const cardCountText = this.discardViewContainer.list.find(
        item => (item as any).isDiscardContent && item.type === 'Text' && !(item as any).isEmptyMessage
      ) as Phaser.GameObjects.Text;
      if (cardCountText) {
        cardCountText.setText(`${cards.length} cards`);
      }
    }
    
    // Handle empty discard pile - show message and hide navigation
    if (cards.length === 0) {
      // Show empty state message
      const emptyMessage = this.scene.add.text(0, 0, "Discard pile is empty", {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center",
      }).setOrigin(0.5);
      (emptyMessage as any).isDiscardContent = true;
      (emptyMessage as any).isEmptyMessage = true;
      this.discardViewContainer.add(emptyMessage);
      
      // Hide navigation buttons when empty
      const navPrevButton = this.discardViewContainer.list.find(item => (item as any).isPrevButton);
      const navNextButton = this.discardViewContainer.list.find(item => (item as any).isNextButton);
      const navPageCounter = this.discardViewContainer.list.find(item => (item as any).isPageCounter);
      
      if (navPrevButton) (navPrevButton as any).setVisible(false);
      if (navNextButton) (navNextButton as any).setVisible(false);
      if (navPageCounter) (navPageCounter as any).setVisible(false);
      
      this.discardViewContainer.setVisible(true);
      return;
    }
    
    // Show navigation buttons when not empty
    const showPrevButton = this.discardViewContainer.list.find(item => (item as any).isPrevButton);
    const showNextButton = this.discardViewContainer.list.find(item => (item as any).isNextButton);
    const showPageCounter = this.discardViewContainer.list.find(item => (item as any).isPageCounter);
    
    if (showPrevButton) (showPrevButton as any).setVisible(true);
    if (showNextButton) (showNextButton as any).setVisible(true);
    if (showPageCounter) (showPageCounter as any).setVisible(true);
    
    // Render first page
    renderPage(currentPage);
    
    // Show container
    this.discardViewContainer.setVisible(true);
  }
  
  /**
   * Create close button for discard modal
   */
  private createDiscardCloseButton(x: number, y: number): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);
    
    const bg = this.scene.add.circle(0, 0, 24, 0x1a1a1a);
    bg.setStrokeStyle(2, 0xff6b6b);
    
    const text = this.scene.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode",
      fontSize: 28,
      color: "#ff6b6b",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, text]);
    
    // Fix: Use the bg circle directly for interaction
    bg.setInteractive({ useHandCursor: true });
    
    bg.on("pointerover", () => {
      bg.setFillStyle(0xff6b6b, 0.3);
      bg.setScale(1.1);
      this.scene.tweens.add({
        targets: button,
        scale: 1.15,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(0x1a1a1a);
      bg.setScale(1);
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: button,
        scale: 0.9,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          this.discardViewContainer.setVisible(false);
        }
      });
    });
    
    return button;
  }
  
  /**
   * Create navigation button for discard pile (previous/next)
   */
  private createDiscardNavigationButton(
    x: number,
    y: number,
    symbol: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 70, 70, 0x150E10);
    bg.setStrokeStyle(3, 0x77888C);
    
    const innerBorder = this.scene.add.rectangle(0, 0, 64, 64, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const text = this.scene.add.text(0, 0, symbol, {
      fontFamily: "dungeon-mode",
      fontSize: 36,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, innerBorder, text]);
    
    // Fix: Use the bg rectangle directly for interaction instead of creating a separate hit area
    // This ensures the interactive area perfectly matches the visual button
    bg.setInteractive({ useHandCursor: true });
    
    // Transfer events from bg to button container for proper behavior
    bg.on("pointerover", () => {
      if (button.alpha === 1) { // Only animate if button is active
        bg.setFillStyle(0x1f1410);
        text.setColor("#e8eced");
        this.scene.tweens.add({
          targets: button,
          scale: 1.15,
          duration: 150,
          ease: 'Back.easeOut'
        });
      }
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      text.setColor("#77888C");
      this.scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      if (button.alpha === 1) { // Only trigger if button is active
        this.scene.tweens.add({
          targets: button,
          scale: 0.95,
          duration: 80,
          ease: 'Power2',
          onComplete: () => {
            this.scene.tweens.add({
              targets: button,
              scale: 1.15,
              duration: 80,
              ease: 'Power2',
              onComplete: () => {
                callback();
              }
            });
          }
        });
      }
    });
    
    return button;
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

import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { Player, PlayingCard } from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { RelicManager } from "../../core/managers/RelicManager";
import { MusicLifecycleSystem } from "../../systems/shared/MusicLifecycleSystem";

export class Campfire extends Scene {
  private player!: Player;
  private campfire!: Phaser.GameObjects.Sprite;
  private restButton!: Phaser.GameObjects.Container;
  private purifyButton!: Phaser.GameObjects.Container;
  private upgradeButton!: Phaser.GameObjects.Container;
  private viewDeckButton!: Phaser.GameObjects.Container;
  private actionText!: Phaser.GameObjects.Text;
  private cardSprites: Phaser.GameObjects.GameObject[] = [];
  private tooltipBox!: Phaser.GameObjects.Container;
  private musicLifecycle!: MusicLifecycleSystem;

  // Pagination for deck view - improved UI with fewer cards per page
  private currentPage: number = 0;
  private cardsPerPage: number = 6; // Reduced for better UI
  private displayedCards: PlayingCard[] = [];
  private prevButton!: Phaser.GameObjects.Container;
  private nextButton!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Campfire" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create(): void {
    if (!this.cameras.main) return;
    this.cameras.main.setBackgroundColor(0x150E10);

    // Start campfire music via MusicLifecycleSystem
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();
    
    // Add forest background image
    const forestBg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "forest_bg"
    );
    // Scale to cover the entire screen
    const scaleX = this.cameras.main.width / forestBg.width;
    const scaleY = this.cameras.main.height / forestBg.height;
    const scale = Math.max(scaleX, scaleY);
    forestBg.setScale(scale);
    forestBg.setDepth(0); // Behind everything
    
    // Dim only the background image (not the whole screen) - lighter for cozy campfire atmosphere
    forestBg.setAlpha(0.5); // 50% visible = softer dimming for campfire

    // Create responsive layout
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add global pointer listener to hide tooltips when moving over non-interactive areas
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Check if pointer is over any interactive object
      const objectsUnderPointer = this.input.hitTestPointer(pointer);
      if (objectsUnderPointer.length === 0) {
        // No interactive objects under pointer, hide tooltip
        this.hideTooltip();
      }
    });
    
    // Add subtle atmospheric tint to unify with menu/shop style
    this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight, 0x150E10, 0.45).setDepth(1);
    
    // Add subtle particles for atmosphere
    this.createAtmosphericParticles();
    
    // Create bonfire animation with glow effect
    this.createBonfireWithGlow(screenWidth / 2, screenHeight * 0.4);
    
    // Show the player as part of the scene composition
    this.createPlayerShowcase(screenWidth, screenHeight);
    
    // Create responsive title with proper scaling
    this.add.text(
      screenWidth / 2,
      Math.max(60, screenHeight * 0.08),
      "REST AT BONFIRE",
      {
        fontFamily: "dungeon-mode",
        fontSize: Math.min(34, screenWidth * 0.029),
        color: "#e8eced",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    // Create responsive description with word wrapping
    this.add.text(
      screenWidth / 2,
      Math.max(110, screenHeight * 0.15),
      "The bonfire's warmth restores your spirit",
      {
        fontFamily: "dungeon-mode",
        fontSize: Math.min(18, screenWidth * 0.015),
        color: "#77888C",
        align: "center",
        wordWrap: { width: screenWidth * 0.8 }
      }
    ).setOrigin(0.5);

    // Create player health display
    this.createPlayerHealthDisplay();

    // Create action buttons with responsive design
    this.createResponsiveActionButtons();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button with responsive positioning
    this.createResponsiveBackButton();
    
    // Ensure tooltips are cleaned up when scene shuts down
    this.events.on('shutdown', () => {
      this.hideTooltip();
    });
  }

  private createAtmosphericParticles(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create floating embers
    for (let i = 0; i < 30; i++) {
      const ember = this.add.rectangle(
        Phaser.Math.Between(0, screenWidth),
        Phaser.Math.Between(0, screenHeight),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xff4500
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
      
      // Animate embers floating upward
      this.tweens.add({
        targets: ember,
        y: -50,
        alpha: 0,
        duration: Phaser.Math.Between(3000, 8000),
        ease: 'Power1',
        repeat: -1,
        yoyo: false,
        onComplete: () => {
          ember.setPosition(
            Phaser.Math.Between(0, screenWidth),
            screenHeight + 50
          );
          ember.setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
        }
      });
    }
  }

  private createBonfireWithGlow(x: number, y: number): void {
    // Create glow effect behind bonfire
    const glow = this.add.pointlight(x, y, 0xff4500, 200, 0.5, 0.5);
    
    // Create bonfire animation using new campfire sprite
    this.campfire = this.add.sprite(x, y, "campfire_overworld");
    this.campfire.setScale(3);
    
    // Try to play animation, fallback if it fails
    try {
      this.campfire.play("campfire_burn");
    } catch (error) {
      console.warn("Campfire animation not found, using static sprite");
    }
    
    // Add flickering effect to glow
    this.time.addEvent({
      delay: 200,
      callback: () => {
        glow.intensity = Phaser.Math.FloatBetween(0.4, 0.7);
        glow.radius = Phaser.Math.Between(180, 220);
      },
      callbackScope: this,
      loop: true
    });
  }

  private createPlayerHealthDisplay(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Clear existing health display elements
    this.children.list.forEach(child => {
      if (child.name && (child.name.startsWith('healthBar') || child.name.startsWith('healthText'))) {
        child.destroy();
      }
    });
    
    const panelX = screenWidth * 0.22;
    const panelY = screenHeight * 0.58;
    const panelW = 320;
    const panelH = 92;

    const healthPanelBg = this.add.rectangle(panelX, panelY, panelW, panelH, 0x150E10, 0.96);
    const healthPanelOuter = this.add.rectangle(panelX, panelY, panelW + 6, panelH + 6, undefined, 0);
    healthPanelOuter.setStrokeStyle(3, 0x77888C, 0.9);
    const healthPanelInner = this.add.rectangle(panelX, panelY, panelW + 2, panelH + 2, undefined, 0);
    healthPanelInner.setStrokeStyle(2, 0x556065, 0.75);
    healthPanelBg.setName('healthBarPanelBg');
    healthPanelOuter.setName('healthBarPanelOuter');
    healthPanelInner.setName('healthBarPanelInner');

    // Create health bar background
    const healthBarBg = this.add.rectangle(panelX, panelY + 16, 260, 22, 0x1b2327);
    healthBarBg.setStrokeStyle(1, 0x77888C, 0.65);
    healthBarBg.setName('healthBarBg');
    
    // Create health bar fill
    const healthPercent = this.player.currentHealth / this.player.maxHealth;
    const healthBarFill = this.add.rectangle(
      panelX - (260 * (1 - healthPercent)) / 2,
      panelY + 16,
      260 * healthPercent,
      18,
      healthPercent > 0.5 ? 0x2ed573 : healthPercent > 0.25 ? 0xff9f43 : 0xff4757
    );
    healthBarFill.setName('healthBarFill');
    
    // Create health text
    const healthText = this.add.text(
      panelX,
      panelY - 16,
      `HP ${this.player.currentHealth}/${this.player.maxHealth}`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5);
    healthText.setName('healthText');
  }

  private createPlayerShowcase(screenWidth: number, screenHeight: number): void {
    const panelX = screenWidth * 0.22;
    const panelY = screenHeight * 0.36;
    const panelW = 320;
    const panelH = 260;

    const panelBg = this.add.rectangle(panelX, panelY, panelW, panelH, 0x150E10, 0.95);
    const panelOuter = this.add.rectangle(panelX, panelY, panelW + 6, panelH + 6, undefined, 0);
    panelOuter.setStrokeStyle(3, 0x77888C, 0.9);
    const panelInner = this.add.rectangle(panelX, panelY, panelW + 2, panelH + 2, undefined, 0);
    panelInner.setStrokeStyle(2, 0x556065, 0.75);

    const headerBg = this.add.rectangle(panelX, panelY - panelH / 2 + 24, panelW - 22, 38, 0x1b2327, 0.72);
    headerBg.setStrokeStyle(1, 0x77888C, 0.5);
    const headerText = this.add.text(panelX, panelY - panelH / 2 + 24, "HERO", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5);

    // Always use the same player asset as combat.
    const playerKey = this.textures.exists("combat_player") ? "combat_player" : "";

    if (playerKey) {
      const spriteBackdrop = this.add.rectangle(panelX, panelY + 10, 180, 170, 0x1b2327, 0.35)
        .setOrigin(0.5)
        .setDepth(41);
      spriteBackdrop.setStrokeStyle(1, 0x556065, 0.55);

      const playerSprite = this.add.image(panelX, panelY + 10, playerKey).setOrigin(0.5);
      const maxW = 170;
      const maxH = 165;
      const scale = Math.min(maxW / playerSprite.width, maxH / playerSprite.height);
      playerSprite.setScale(scale).setDepth(42).setAlpha(1);
      this.tweens.add({
        targets: playerSprite,
        y: panelY + 6,
        duration: 1800,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1
      });
    } else {
      this.add.text(panelX, panelY + 10, "🧙", { fontSize: 64 }).setOrigin(0.5).setDepth(42);
    }

    this.add.text(panelX, panelY + panelH / 2 - 24, "Rest. Reflect. Prepare.", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5).setDepth(41);

    [panelBg, panelOuter, panelInner, headerBg, headerText].forEach(obj => obj.setDepth(40));
  }

  private createResponsiveActionButtons(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Calculate responsive positioning and sizing for improved UI
    const buttonWidth = Math.min(240, screenWidth * 0.2);
    const buttonHeight = Math.min(76, screenHeight * 0.09);
    const fontSize = Math.min(16, screenWidth * 0.014);
    
    // Create action buttons with improved layout (2x2 grid for better UI)
    const actions = [
      { 
        text: "HEAL", 
        description: "Rest at the bonfire\nRestore health to full",
        action: "rest",
        color: 0x228B22, // Forest green
        textColor: "#90EE90"
      },
      { 
        text: "PURIFY", 
        description: "Remove a card from deck\nPermanently eliminate weakness",
        action: "purify",
        color: 0x8B0000, // Dark red
        textColor: "#FFB6C1"
      },
      { 
        text: "ATTUNE", 
        description: "Upgrade a card\nIncrease its power",
        action: "upgrade",
        color: 0x4169E1, // Royal blue
        textColor: "#87CEEB"
      },
      { 
        text: "VIEW DECK", 
        description: "Examine your cards\nSee current deck composition",
        action: "view_deck",
        color: 0x6A5ACD, // Slate blue
        textColor: "#DDA0DD"
      }
    ];

    // Position buttons in a 2x2 grid for better visual balance
    const gridCols = 2;
    const gridRows = 2;
    const spacingX = buttonWidth + 34;
    const spacingY = buttonHeight + 24;
    
    const startX = screenWidth * 0.62;
    const startY = screenHeight * 0.58;

    actions.forEach((data, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const button = this.add.container(x, y);
      
      // Main menu/tutorial style button body
      const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10, 0.95);
      background.setStrokeStyle(3, 0x77888C, 0.9);
      
      const innerGlow = this.add.rectangle(0, 0, buttonWidth - 6, buttonHeight - 6, 0x1b2327, 0.65);
      innerGlow.setStrokeStyle(1, 0x556065, 0.7);
      
      const actionAccent = this.add.rectangle(-buttonWidth / 2 + 7, 0, 8, buttonHeight - 10, data.color, 0.85);
      
      const text = this.add.text(0, 0, data.text, {
        fontFamily: "dungeon-mode",
        fontSize: fontSize,
        color: "#77888C",
        align: "center",
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5);
      
      button.add([background, innerGlow, actionAccent, text]);
      button.setDepth(100);
      
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => {
        // Hide any tooltips when changing modes
        this.hideTooltip();
        
        switch(data.action) {
          case "rest": this.rest(); break;
          case "purify": this.showPurifyCards(); break;
          case "upgrade": this.showUpgradeCards(); break;
          case "view_deck": this.showDeck(); break;
        }
      });
      
      button.on("pointerover", () => {
        background.setFillStyle(0x1f1410, 1);
        innerGlow.setAlpha(0.9);
        text.setColor("#e8eced");
        actionAccent.setAlpha(1);
        
        // Enhanced tooltip positioning
        const tooltipX = x;
        const tooltipY = y - buttonHeight/2 - 10;
        this.showResponsiveTooltip(data.description, tooltipX, tooltipY);
      });
      
      button.on("pointerout", () => {
        background.setFillStyle(0x150E10, 0.95);
        innerGlow.setAlpha(0.65);
        text.setColor("#77888C");
        actionAccent.setAlpha(0.85);
        this.hideTooltip();
      });
      
      // Store references
      switch(data.action) {
        case "rest": this.restButton = button; break;
        case "purify": this.purifyButton = button; break;
        case "upgrade": this.upgradeButton = button; break;
        case "view_deck": this.viewDeckButton = button; break;
      }
    });
  }

  private createResponsiveBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Calculate responsive positioning and sizing
    const buttonWidth = Math.min(220, screenWidth * 0.2);
    const buttonHeight = Math.min(60, screenHeight * 0.08);
    const fontSize = Math.min(20, screenWidth * 0.017);
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - Math.max(60, screenHeight * 0.1));
    
    // Create responsive button with shared UI style
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10, 0.95);
    background.setStrokeStyle(3, 0x77888C, 0.9);
    const innerBorder = this.add.rectangle(0, 0, buttonWidth - 6, buttonHeight - 6, 0x1b2327, 0.65);
    innerBorder.setStrokeStyle(1, 0x556065, 0.7);
    
    const text = this.add.text(0, 0, "LEAVE BONFIRE", {
      fontFamily: "dungeon-mode",
      fontSize: fontSize,
      color: "#77888C",
      wordWrap: { width: buttonWidth - 20 }
    }).setOrigin(0.5);
    
    backButton.add([background, innerBorder, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Complete the campfire node and return to overworld
      const gameState = GameState.getInstance();
      gameState.updatePlayerData(this.player);
      gameState.completeCurrentNode(true);
      
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop();
      this.scene.resume("Overworld");
    });
    
    backButton.on("pointerover", () => {
      background.setFillStyle(0x1f1410);
      text.setColor("#e8eced");
      this.showResponsiveTooltip("Return to your journey", screenWidth / 2, screenHeight - Math.max(120, screenHeight * 0.15));
    });
    
    backButton.on("pointerout", () => {
      background.setFillStyle(0x150E10, 0.95);
      text.setColor("#77888C");
      this.hideTooltip();
    });
  }

  private showResponsiveTooltip(text: string, x: number, y: number): void {
    const screenWidth = this.cameras.main.width;
    
    // Calculate responsive tooltip dimensions
    const maxWidth = screenWidth * 0.3;
    const fontSize = Math.min(16, screenWidth * 0.012);
    
    const tooltip = this.add.container(x, y);
    
    // Create responsive background
    const textObj = this.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: fontSize,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: maxWidth }
    }).setOrigin(0.5);
    
    const padding = 15;
    const bgWidth = Math.min(textObj.width + padding * 2, maxWidth + padding * 2);
    const bgHeight = textObj.height + padding * 2;
    
    const background = this.add.rectangle(0, 0, bgWidth, bgHeight, 0x000000, 0.9);
    background.setStrokeStyle(2, 0x666666);
    
    tooltip.add([background, textObj]);
    tooltip.setDepth(2000);
    
    // Store reference for cleanup
    this.tooltipBox = tooltip;
  }

  private createTooltipBox(): void {
    // Initialize tooltip as null - will be created when needed
    this.tooltipBox = null as any;
  }

  private showActionTooltip(action: string, x: number, y: number): void {
    // Hide any existing tooltip first
    this.hideTooltip();
    
    let description = "";
    
    switch(action) {
      case "HEAL":
        description = "Heal 30% of your maximum HP";
        break;
      case "PURIFY":
        description = "Remove a card from your deck permanently";
        break;
      case "ATTUNE":
        description = "Upgrade a card to a higher rank";
        break;
      case "VIEW DECK":
        description = "View all the cards in your deck";
        break;
      default:
        description = "Perform this action";
    }
    
    // Create new tooltip container
    this.tooltipBox = this.add.container(x, y);
    this.tooltipBox.setDepth(2000);
    
    // Create tooltip background
    const tooltipBg = this.add.rectangle(0, 0, 250, 80, 0x000000);
    tooltipBg.setAlpha(0.9);
    tooltipBg.setStrokeStyle(2, 0x57606f);
    
    // Action description
    const descText = this.add.text(-115, -30, description, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced",
      align: "left",
      wordWrap: { width: 230 }
    }).setOrigin(0, 0);
    
    this.tooltipBox.add([tooltipBg, descText]);
  }

  private showCardTooltip(card: PlayingCard, x: number, y: number): void {
    // Hide any existing tooltip first
    this.hideTooltip();
    
    // Create new tooltip container
    this.tooltipBox = this.add.container(x, y);
    this.tooltipBox.setDepth(2000);
    
    // Create tooltip background
    const tooltipBg = this.add.rectangle(0, 0, 200, 100, 0x000000);
    tooltipBg.setAlpha(0.9);
    tooltipBg.setStrokeStyle(2, 0x57606f);
    
    // Card info
    const display = DeckManager.getCardDisplay(card);
    const cardInfo = this.add.text(-90, -40, `${card.rank} of ${card.suit}`, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: display.color,
      align: "left",
    }).setOrigin(0, 0);
    
    const elementInfo = this.add.text(-90, -10, `Element: ${display.elementSymbol}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#a8a8a8",
      align: "left",
    }).setOrigin(0, 0);
    
    const instruction = this.add.text(-90, 20, "Click to select", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#2ed573",
      align: "left",
    }).setOrigin(0, 0);
    
    this.tooltipBox.add([tooltipBg, cardInfo, elementInfo, instruction]);
  }

  private hideTooltip(): void {
    if (this.tooltipBox) {
      this.tooltipBox.destroy();
      this.tooltipBox = null as any;
    }
  }

  private rest(): void {
    const healAmount = Math.floor(this.player.maxHealth * 0.3);
    this.player.currentHealth = Math.min(
      this.player.maxHealth,
      this.player.currentHealth + healAmount
    );
    
    // Persist healed HP to global GameState so it carries back to Overworld
    const gameState = GameState.getInstance();
    gameState.updatePlayerData({
      currentHealth: this.player.currentHealth,
      maxHealth: this.player.maxHealth
    });
    
    // Update health display
    this.createPlayerHealthDisplay();
    
    // Show healing effect
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const healText = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 160,
      `+${healAmount} HP`,
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 28,
        color: "#2ed573",
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Animate healing text
    this.tweens.add({
      targets: healText,
      y: screenHeight / 2 - 200,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        healText.destroy();
      }
    });
    
    // Disable rest button after use
    const background = this.restButton.getAt(0) as Phaser.GameObjects.Rectangle;
    if (background) {
      background.setFillStyle(0x1a1d26);
    }
    this.restButton.disableInteractive();
    this.restButton.setActive(false);
    
    // Hide tooltip
    this.hideTooltip();
  }

  private reEnableActionButtons(): void {
    if (this.restButton.active) this.restButton.setInteractive();
    if (this.purifyButton.active) this.purifyButton.setInteractive();
    if (this.upgradeButton.active) this.upgradeButton.setInteractive();
    this.viewDeckButton.setInteractive(); // Always re-enable view deck
  }

  private createCloseButton(x: number, y: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.circle(0, 0, 24, 0x1a1a1a);
    bg.setStrokeStyle(2, 0xff6b6b);
    
    const text = this.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode",
      fontSize: 28,
      color: "#ff6b6b",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, text]);
    button.setDepth(1001);
    
    bg.setInteractive({ useHandCursor: true });
    
    bg.on("pointerover", () => {
      bg.setFillStyle(0xff6b6b, 0.3);
      bg.setScale(1.1);
      this.tweens.add({
        targets: button,
        scale: 1.15,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(0x1a1a1a);
      bg.setScale(1);
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scale: 0.9,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          callback();
        }
      });
    });
    
    return button;
  }

  private createNavigationButton(
    x: number,
    y: number,
    symbol: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 70, 70, 0x150E10);
    bg.setStrokeStyle(3, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, 64, 64, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const text = this.add.text(0, 0, symbol, {
      fontFamily: "dungeon-mode",
      fontSize: 36,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, innerBorder, text]);
    button.setDepth(1001);
    
    bg.setInteractive({ useHandCursor: true });
    
    bg.on("pointerover", () => {
      if (button.alpha === 1) {
        bg.setFillStyle(0x1f1410);
        text.setColor("#e8eced");
        this.tweens.add({
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
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    bg.on("pointerdown", () => {
      if (button.alpha === 1) {
        this.tweens.add({
          targets: button,
          scale: 0.95,
          duration: 80,
          ease: 'Power2',
          onComplete: () => {
            this.tweens.add({
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

  private createCardViewBackButton(onBack: () => void): Phaser.GameObjects.Container {
    const screenWidth = this.cameras.main.width;
    const backButton = this.add.container(screenWidth / 2, this.cameras.main.height - 150);
    backButton.setDepth(1002);
    
    const background = this.add.rectangle(0, 0, 150, 50, 0x222222).setStrokeStyle(2, 0xcccccc);
    const text = this.add.text(0, 0, "BACK", { fontFamily: "dungeon-mode", fontSize: 20, color: "#cccccc" }).setOrigin(0.5);
    
    backButton.add([background, text]);
    backButton.setInteractive(new Phaser.Geom.Rectangle(-75, -25, 150, 50), Phaser.Geom.Rectangle.Contains);

    backButton.on("pointerdown", onBack);
    backButton.on("pointerover", () => background.setFillStyle(0x333333));
    backButton.on("pointerout", () => background.setFillStyle(0x222222));

    return backButton;
  }

  private createCardViewHeader(title: string, subtitle: string): Phaser.GameObjects.GameObject[] {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Calculate responsive positioning and sizing
    const titleFontSize = Math.min(28, screenWidth * 0.025);
    const subtitleFontSize = Math.min(16, screenWidth * 0.014);
    const titleY = Math.max(100, screenHeight * 0.12);
    const subtitleY = Math.max(140, screenHeight * 0.18);
    
    const titleText = this.add.text(screenWidth / 2, titleY, title, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: titleFontSize,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: screenWidth * 0.8 }
    }).setOrigin(0.5).setDepth(1001);

    const subtitleText = this.add.text(screenWidth / 2, subtitleY, subtitle, {
      fontFamily: "dungeon-mode",
      fontSize: subtitleFontSize,
      color: "#cccccc",
      align: "center",
      wordWrap: { width: screenWidth * 0.7 }
    }).setOrigin(0.5).setDepth(1001);

    return [titleText, subtitleText];
  }

  private generateDeckStatistics(cards: PlayingCard[]): string {
    // Count cards by suit
    const suitCounts = {
      'Apoy': cards.filter(card => card.suit === 'Apoy').length,
      'Tubig': cards.filter(card => card.suit === 'Tubig').length,
      'Lupa': cards.filter(card => card.suit === 'Lupa').length,
      'Hangin': cards.filter(card => card.suit === 'Hangin').length
    };

    // Convert rank to numeric value for comparison
    const getRankValue = (rank: string): number => {
      if (rank === 'Mandirigma') return 11;
      if (rank === 'Babaylan') return 12;
      if (rank === 'Datu') return 13;
      return parseInt(rank) || 0;
    };

    // Find highest value card
    const highestValue = Math.max(...cards.map(card => getRankValue(card.rank)));
    
    // Count face cards (Mandirigma, Babaylan, Datu)
    const faceCards = cards.filter(card => ['Mandirigma', 'Babaylan', 'Datu'].includes(card.rank)).length;

    return `🔥${suitCounts.Apoy} 💧${suitCounts.Tubig} 🌱${suitCounts.Lupa} 💨${suitCounts.Hangin} | Highest: ${highestValue} | Face Cards: ${faceCards}`;
  }

  private isSpecialCard(card: PlayingCard): boolean {
    return ['Mandirigma', 'Babaylan', 'Datu'].includes(card.rank);
  }

  private getRankValue(rank: string): number {
    if (rank === 'Mandirigma') return 11;
    if (rank === 'Babaylan') return 12;
    if (rank === 'Datu') return 13;
    return parseInt(rank) || 0;
  }

  private createEnhancedCardViewBackButton(onBack: () => void, buttonText: string = "⬅ CLOSE DECK"): Phaser.GameObjects.Container {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const buttonWidth = Math.min(200, screenWidth * 0.15);
    const buttonHeight = Math.min(70, screenHeight * 0.08);
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - Math.max(80, screenHeight * 0.1));
    backButton.setDepth(1002);
    
    // Match Combat's dark theme with gray borders
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);
    background.setStrokeStyle(3, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, buttonWidth - 6, buttonHeight - 6, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const text = this.add.text(0, 0, buttonText, { 
      fontFamily: "dungeon-mode", 
      fontSize: Math.min(16, screenWidth * 0.013), 
      color: "#77888C",
      align: "center",
      wordWrap: { width: buttonWidth - 20 }
    }).setOrigin(0.5);
    
    backButton.add([background, innerBorder, text]);
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), 
      Phaser.Geom.Rectangle.Contains
    );

    backButton.on("pointerdown", () => {
      this.tweens.add({
        targets: backButton,
        scale: 0.95,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: backButton,
            scale: 1,
            duration: 80,
            ease: 'Power2',
            onComplete: onBack
          });
        }
      });
    });
    
    backButton.on("pointerover", () => {
      background.setFillStyle(0x1f1410);
      text.setColor("#e8eced");
      this.tweens.add({
        targets: backButton,
        scale: 1.05,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    backButton.on("pointerout", () => {
      background.setFillStyle(0x150E10);
      text.setColor("#77888C");
      this.tweens.add({
        targets: backButton,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    return backButton;
  }

  private drawEnhancedCardPage(title: string, subtitle: string, onSelect?: (card: PlayingCard) => void, isViewMode: boolean = false): void {
    this.clearCardDisplay();

    // Match Combat's draw pile modal EXACTLY - 80% screen size
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const modalWidth = screenWidth * 0.8;
    const modalHeight = screenHeight * 0.8;
    
    // Double border design (exactly like Combat)
    const outerBorder = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      modalWidth + 8,
      modalHeight + 8,
      undefined,
      0
    );
    outerBorder.setStrokeStyle(3, 0x77888C);
    outerBorder.setDepth(1000);
    this.cardSprites.push(outerBorder);

    const innerBorder = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      modalWidth,
      modalHeight,
      undefined,
      0
    );
    innerBorder.setStrokeStyle(2, 0x77888C);
    innerBorder.setDepth(1000);
    this.cardSprites.push(innerBorder);

    const bg = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      modalWidth,
      modalHeight,
      0x150E10,
      0.98
    );
    bg.setDepth(1000);
    this.cardSprites.push(bg);

    // Title (matching Combat's position)
    const titleText = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - screenHeight * 0.35,
      title,
      {
        fontFamily: "dungeon-mode",
        fontSize: 32,
        color: "#ffffff",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(titleText);

    // Card count / subtitle (matching Combat's position)
    const cardCount = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - screenHeight * 0.35 + 40,
      subtitle,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(cardCount);

    // Suit-based pagination (matching Combat EXACTLY - 4 pages, one per suit)
    const suitOrder = ["Apoy", "Tubig", "Lupa", "Hangin"];
    const cardsBySuit: { [key: string]: PlayingCard[] } = {
      "Apoy": [],
      "Tubig": [],
      "Lupa": [],
      "Hangin": []
    };
    
    // Group cards by suit
    this.displayedCards.forEach(card => {
      if (cardsBySuit[card.suit]) {
        cardsBySuit[card.suit].push(card);
      }
    });
    
    // Convert rank to numeric value for sorting (matching Combat)
    const getRankValue = (rank: string): number => {
      if (rank === "1") return 14; // Ace is highest
      if (rank === "Mandirigma") return 11; // Jack
      if (rank === "Babaylan") return 12; // Queen
      if (rank === "Datu") return 13; // King
      return parseInt(rank); // 2-10
    };
    
    // Sort each suit: 2-10, then Mandirigma (11), Babaylan (12), Datu (13), 1 (Ace=14)
    const sortByValue = (a: PlayingCard, b: PlayingCard) => {
      const valueA = getRankValue(a.rank);
      const valueB = getRankValue(b.rank);
      return valueA - valueB;
    };
    
    Object.keys(cardsBySuit).forEach(suit => {
      cardsBySuit[suit].sort(sortByValue);
    });
    
    // Get current suit page
    const suit = suitOrder[this.currentPage];
    const pageCards = cardsBySuit[suit];
    
    // Suit label with color and icon (matching Combat)
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
    
    const suitLabel = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - screenHeight * 0.28,
      `${suitIcons[suit]} ${suit.toUpperCase()} (${pageCards.length} cards)`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: suitColors[suit],
        align: "center",
      }
    ).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(suitLabel);

    // Grid layout - 2 rows × 6 columns (matching Combat exactly)
    const columns = 6;
    const rows = 2;
    const cardWidth = 100;
    const cardHeight = 140;
    const horizontalSpacing = 20;
    const verticalSpacing = 30;
    
    // Center the grid (matching Combat's layout)
    const totalGridWidth = (columns * cardWidth) + ((columns - 1) * horizontalSpacing);
    const totalGridHeight = (rows * cardHeight) + ((rows - 1) * verticalSpacing);
    const startX = screenWidth / 2 - totalGridWidth / 2 + cardWidth / 2;
    const startY = screenHeight / 2 - totalGridHeight / 2 + cardHeight / 2 - 20;

    pageCards.forEach((card, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + horizontalSpacing);
      const y = startY + row * (cardHeight + verticalSpacing);

      const cardContainer = this.createCardSprite(card, x, y, onSelect ? true : false);
      cardContainer.setScale(1.25); // Match Combat's scale
      cardContainer.setDepth(1001);
      
      // Add click interaction for purify/attune
      if (onSelect) {
        cardContainer.setInteractive();
        cardContainer.on("pointerdown", () => {
          onSelect(card);
          this.clearCardDisplay();
          this.hideTooltip();
        });
      }
      
      this.cardSprites.push(cardContainer);
    });

    this.createEnhancedPaginationButtons(title, subtitle, onSelect, isViewMode);
  }

  private getCardGlowColor(card: PlayingCard): number {
    // Return glow color based on card properties
    if (this.isSpecialCard(card)) return 0xffd700; // Gold for face cards
    
    switch (card.suit) {
      case 'Apoy': return 0xff4500; // Orange-red
      case 'Tubig': return 0x4169e1; // Royal blue
      case 'Lupa': return 0x228b22; // Forest green
      case 'Hangin': return 0x9370db; // Medium purple
      default: return 0xffffff; // White default
    }
  }

  private createEnhancedCardViewHeader(title: string, subtitle: string): Phaser.GameObjects.GameObject[] {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Calculate responsive positioning and sizing
    const titleFontSize = Math.min(32, screenWidth * 0.028);
    const subtitleFontSize = Math.min(14, screenWidth * 0.012);
    const titleY = Math.max(90, screenHeight * 0.11);
    const subtitleY = Math.max(125, screenHeight * 0.16);
    
    // Title matching Combat's design (white text, no gold)
    const titleText = this.add.text(screenWidth / 2, titleY, title, {
      fontFamily: "dungeon-mode",
      fontSize: titleFontSize,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: screenWidth * 0.8 }
    }).setOrigin(0.5).setDepth(1001);

    const subtitleText = this.add.text(screenWidth / 2, subtitleY, subtitle, {
      fontFamily: "dungeon-mode",
      fontSize: subtitleFontSize,
      color: "#77888C",
      align: "center",
      wordWrap: { width: screenWidth * 0.85 }
    }).setOrigin(0.5).setDepth(1001);

    return [titleText, subtitleText];
  }

  private showEnhancedCardTooltip(card: PlayingCard, x: number, y: number, isViewMode: boolean): void {
    this.hideTooltip();
    
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Enhanced tooltip content for deck viewing
    let tooltipText = `${card.suit} ${card.rank}`;
    if (this.isSpecialCard(card)) {
      tooltipText += ` (Face Card)`;
    }
    
    if (isViewMode) {
      // Add additional information for deck viewing
      const rankValue = this.getRankValue(card.rank);
      tooltipText += `\nSuit: ${card.suit}\nRank: ${card.rank}\nPower Level: ${rankValue}`;
      if (this.isSpecialCard(card)) {
        tooltipText += `\n✨ Special Card ✨`;
      }
    }
    
    const tooltipWidth = Math.min(250, screenWidth * 0.2);
    const tooltipHeight = Math.min(120, screenHeight * 0.12);
    
    // Adjust position to stay on screen
    let tooltipX = x;
    let tooltipY = y;
    
    if (tooltipX + tooltipWidth/2 > screenWidth - 20) {
      tooltipX = screenWidth - tooltipWidth/2 - 20;
    }
    if (tooltipX - tooltipWidth/2 < 20) {
      tooltipX = tooltipWidth/2 + 20;
    }
    if (tooltipY - tooltipHeight < 20) {
      tooltipY = y + 80;
    }
    
    this.tooltipBox = this.add.container(tooltipX, tooltipY);
    this.tooltipBox.setDepth(2000);
    
    // Enhanced tooltip background
    const tooltipBg = this.add.rectangle(0, 0, tooltipWidth, tooltipHeight, 0x1a1a1a, 0.95);
    tooltipBg.setStrokeStyle(2, 0xd4af37);
    
    const tooltipTextObj = this.add.text(0, 0, tooltipText, {
      fontFamily: "dungeon-mode",
      fontSize: Math.min(14, screenWidth * 0.012),
      color: "#ffffff",
      align: "center",
      wordWrap: { width: tooltipWidth - 20 }
    }).setOrigin(0.5);
    
    this.tooltipBox.add([tooltipBg, tooltipTextObj]);
  }

  private createEnhancedPaginationButtons(title: string, subtitle: string, onSelect?: (card: PlayingCard) => void, isViewMode: boolean = false): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // 4 pages - one for each suit (matching Combat)
    const totalPages = 4;
    const pageText = this.add.text(
      screenWidth / 2, 
      screenHeight / 2 + screenHeight * 0.3,
      `Page ${this.currentPage + 1} / ${totalPages}`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffffff",
        align: "center"
      }
    ).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(pageText);

    // Previous button (matching Combat exactly)
    if (this.currentPage > 0) {
      this.prevButton = this.createNavigationButton(
        screenWidth / 2 - screenWidth * 0.25,
        screenHeight / 2 + screenHeight * 0.3,
        "◄",
        () => {
          this.currentPage--;
          this.drawEnhancedCardPage(title, subtitle, onSelect, isViewMode);
        }
      );
      this.prevButton.setDepth(1002);
    }

    // Next button (matching Combat exactly - 4 pages total)
    if (this.currentPage < 3) {
      this.nextButton = this.createNavigationButton(
        screenWidth / 2 + screenWidth * 0.25,
        screenHeight / 2 + screenHeight * 0.3,
        "►",
        () => {
          this.currentPage++;
          this.drawEnhancedCardPage(title, subtitle, onSelect, isViewMode);
        }
      );
      this.nextButton.setDepth(1002);
    }
  }

  private showDeck(): void {
    // Disable action buttons to prevent interaction while viewing deck
    this.restButton.disableInteractive();
    this.purifyButton.disableInteractive();
    this.upgradeButton.disableInteractive();
    this.viewDeckButton.disableInteractive();

    // Combine all cards in player's possession
    const allCards = [
      ...this.player.deck,
      ...this.player.drawPile,
      ...this.player.discardPile,
      ...this.player.hand
    ];
    
    // Remove duplicates
    this.displayedCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );

    // Clear any existing display
    this.clearCardDisplay();

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Categorize cards by suit (matching Combat's system)
    const suitOrder = ["Apoy", "Tubig", "Lupa", "Hangin"];
    const cardsBySuit: { [key: string]: PlayingCard[] } = {
      "Apoy": [],
      "Tubig": [],
      "Lupa": [],
      "Hangin": []
    };

    // Group cards by suit
    this.displayedCards.forEach(card => {
      if (cardsBySuit[card.suit]) {
        cardsBySuit[card.suit].push(card);
      }
    });

    // Convert rank to numeric value for sorting
    const getRankValue = (rank: string): number => {
      if (rank === "1") return 14; // Ace is highest
      if (rank === "Mandirigma") return 11;
      if (rank === "Babaylan") return 12;
      if (rank === "Datu") return 13;
      return parseInt(rank);
    };

    // Sort each suit
    Object.keys(cardsBySuit).forEach(suit => {
      cardsBySuit[suit].sort((a, b) => getRankValue(a.rank) - getRankValue(b.rank));
    });

    // 4 pages - one for each suit (matching Combat)
    const totalPages = 4;
    let currentPage = 0;

    const renderPage = (page: number) => {
      // Clear previous page cards and suit label
      this.cardSprites
        .filter((item: any) => item.isPageCard || item.isSuitLabel)
        .forEach(item => item.destroy());
      this.cardSprites = this.cardSprites.filter((item: any) => !item.isPageCard && !item.isSuitLabel);

      const suit = suitOrder[page];
      const pageCards = cardsBySuit[suit];

      // Suit label with color and icon (matching Combat exactly)
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

      const suitLabel = this.add.text(
        screenWidth / 2,
        screenHeight / 2 - screenHeight * 0.28,
        `${suitIcons[suit]} ${suit.toUpperCase()} (${pageCards.length} cards)`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 24,
          color: suitColors[suit],
          align: "center",
        }
      ).setOrigin(0.5).setDepth(1001);
      (suitLabel as any).isSuitLabel = true;
      this.cardSprites.push(suitLabel);

      // Grid layout - 2 rows of 6 cards (Balatro-style, matching Combat)
      const columns = 6;
      const rows = 2;
      const cardWidth = 100;
      const cardHeight = 140;
      const horizontalSpacing = 20;
      const verticalSpacing = 30;

      // Center the grid (relative to screen center)
      const totalGridWidth = (columns * cardWidth) + ((columns - 1) * horizontalSpacing);
      const totalGridHeight = (rows * cardHeight) + ((rows - 1) * verticalSpacing);
      const startX = screenWidth / 2 - totalGridWidth / 2 + cardWidth / 2;
      const startY = screenHeight / 2 - totalGridHeight / 2 + cardHeight / 2 - 20;

      pageCards.forEach((card, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = startX + col * (cardWidth + horizontalSpacing);
        const y = startY + row * (cardHeight + verticalSpacing);

        const cardSprite = this.createCardSprite(card, x, y, false);
        (cardSprite as any).isPageCard = true;
        cardSprite.setScale(1.25);
        cardSprite.setDepth(1001);

        this.cardSprites.push(cardSprite);
      });

      // Update page counter with suit name (matching Combat)
      const pageCounter = this.cardSprites.find((item: any) => item.isPageCounter) as Phaser.GameObjects.Text;
      if (pageCounter) {
        pageCounter.setText(`${suit} - Page ${page + 1} / ${totalPages}`);
      }

      // Update button states
      const prevButton = this.cardSprites.find((item: any) => item.isPrevButton) as Phaser.GameObjects.Text;
      const nextButton = this.cardSprites.find((item: any) => item.isNextButton) as Phaser.GameObjects.Text;

      if (prevButton) {
        prevButton.setAlpha(page > 0 ? 1 : 0.3);
      }
      if (nextButton) {
        nextButton.setAlpha(page < totalPages - 1 ? 1 : 0.3);
      }
    };

    // Background - Double border design (Balatro style, matching Combat exactly)
    const modalWidth = screenWidth * 0.8;
    const modalHeight = screenHeight * 0.8;

    const outerBorder = this.add.rectangle(screenWidth / 2, screenHeight / 2, modalWidth + 8, modalHeight + 8, undefined, 0);
    outerBorder.setStrokeStyle(3, 0x77888C);
    outerBorder.setDepth(1000);
    this.cardSprites.push(outerBorder);

    const innerBorder = this.add.rectangle(screenWidth / 2, screenHeight / 2, modalWidth, modalHeight, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    innerBorder.setDepth(1000);
    this.cardSprites.push(innerBorder);

    const bg = this.add.rectangle(screenWidth / 2, screenHeight / 2, modalWidth, modalHeight, 0x150E10, 0.98);
    bg.setDepth(1000);
    this.cardSprites.push(bg);

    // Title (matching Combat exactly - positioned at top)
    const title = this.add.text(screenWidth / 2, screenHeight / 2 - screenHeight * 0.35, "Your Deck", {
      fontFamily: "dungeon-mode",
      fontSize: 32,
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(title);

    // Card count (matching Combat exactly)
    const cardCount = this.add.text(screenWidth / 2, screenHeight / 2 - screenHeight * 0.35 + 40, `${this.displayedCards.length} cards`, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5).setDepth(1001);
    this.cardSprites.push(cardCount);

    // Close button (matching Combat exactly)
    const closeButton = this.createCloseButton(
      screenWidth / 2 + modalWidth * 0.4, 
      screenHeight / 2 - screenHeight * 0.35,
      () => {
        this.clearCardDisplay();
        this.reEnableActionButtons();
      }
    );
    this.cardSprites.push(closeButton);

    // Previous button (left arrow, matching Combat exactly)
    const prevButton = this.createNavigationButton(
      screenWidth / 2 - screenWidth * 0.25, 
      screenHeight / 2 + screenHeight * 0.3,
      "◄",
      () => {
        if (currentPage > 0) {
          currentPage--;
          renderPage(currentPage);
        }
      }
    );
    (prevButton as any).isPrevButton = true;
    this.cardSprites.push(prevButton);

    // Next button (right arrow, matching Combat exactly)
    const nextButton = this.createNavigationButton(
      screenWidth / 2 + screenWidth * 0.25, 
      screenHeight / 2 + screenHeight * 0.3,
      "►",
      () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          renderPage(currentPage);
        }
      }
    );
    (nextButton as any).isNextButton = true;
    this.cardSprites.push(nextButton);

    // Page counter (matching Combat exactly)
    const pageCounter = this.add.text(screenWidth / 2, screenHeight / 2 + screenHeight * 0.3, `Page 1 / ${totalPages}`, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5).setDepth(1001);
    (pageCounter as any).isPageCounter = true;
    this.cardSprites.push(pageCounter);

    // Render first page
    renderPage(currentPage);
  }

  private showPurifyCards(): void {
    this.restButton.disableInteractive();
    this.purifyButton.disableInteractive();
    this.upgradeButton.disableInteractive();
    this.viewDeckButton.disableInteractive();

    const allCards = [
      ...this.player.deck,
      ...this.player.drawPile,
      ...this.player.discardPile,
      ...this.player.hand
    ];
    this.displayedCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );
    this.currentPage = 0;

    const backButton = this.createEnhancedCardViewBackButton(() => {
        this.clearCardDisplay();
        this.reEnableActionButtons();
        backButton.destroy();
    }, "⬅ CANCEL PURIFY");
    
    this.drawEnhancedCardPage(
      "🔥 PURIFY A CARD 🔥", 
      "Choose a card to permanently remove from your deck",
      (selectedCard) => {
        this.purifyCard(selectedCard);
        backButton.destroy();
        this.reEnableActionButtons();
      },
      false
    );
  }

  private showUpgradeCards(): void {
    this.restButton.disableInteractive();
    this.purifyButton.disableInteractive();
    this.upgradeButton.disableInteractive();
    this.viewDeckButton.disableInteractive();

    const allCards = [
      ...this.player.deck,
      ...this.player.drawPile,
      ...this.player.discardPile,
      ...this.player.hand
    ];
    this.displayedCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );
    this.currentPage = 0;
    
    const backButton = this.createEnhancedCardViewBackButton(() => {
        this.clearCardDisplay();
        this.reEnableActionButtons();
        backButton.destroy();
    }, "⬅ CANCEL ATTUNE");

    this.drawEnhancedCardPage(
      "⚡ ATTUNE A CARD ⚡", 
      "Choose a card to upgrade to its next rank",
      (selectedCard) => {
        this.upgradeCard(selectedCard);
        backButton.destroy();
        this.reEnableActionButtons();
      },
      false
    );
  }

  private clearCardDisplay(): void {
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    if (this.prevButton) this.prevButton.destroy();
    if (this.nextButton) this.nextButton.destroy();
    
    // Ensure tooltip is hidden when clearing card display
    this.hideTooltip();
  }

  private drawCardPage(title: string, subtitle: string, onSelect?: (card: PlayingCard) => void): void {
    this.clearCardDisplay();

    // Create enhanced responsive background with border styling - smaller container
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const backgroundWidth = Math.min(screenWidth * 0.75, 950);  // Reduced from 0.9 and 1100
    const backgroundHeight = Math.min(screenHeight * 0.65, 550); // Reduced from 0.8 and 700
    
    const background = this.add.rectangle(
      screenWidth / 2, 
      screenHeight / 2, 
      backgroundWidth, 
      backgroundHeight, 
      0x1a1a1a, 
      0.95
    );
    background.setStrokeStyle(4, 0xd4af37);
    background.setDepth(1000);
    this.cardSprites.push(background);

    // Add inner glow effect
    const innerGlow = this.add.rectangle(
      screenWidth / 2, 
      screenHeight / 2, 
      backgroundWidth - 8, 
      backgroundHeight - 8, 
      0x2a2a2a, 
      0.3
    );
    innerGlow.setDepth(1000);
    this.cardSprites.push(innerGlow);

    // Add responsive header
    const header = this.createCardViewHeader(title, subtitle);
    this.cardSprites.push(...header);

    const startIndex = this.currentPage * this.cardsPerPage;
    const endIndex = startIndex + this.cardsPerPage;
    const pageCards = this.displayedCards.slice(startIndex, endIndex);

    // Enhanced card layout - 6 cards max in 2 rows of 3 for better visibility
    const maxCols = 3; // Fixed to 3 columns for better card visibility
    const cols = Math.min(maxCols, pageCards.length);
    
    // Much larger cards for better visibility in all modes - adjusted for smaller container
    const cardWidth = Math.min(150, screenWidth / 6.8);  // Reduced to fit smaller container
    const cardHeight = cardWidth * 1.4;
    const paddingX = Math.max(25, screenWidth * 0.025);  // Reduced padding for smaller container
    const paddingY = Math.max(35, screenHeight * 0.035);
    
    // Center the grid
    const gridWidth = cols * cardWidth + (cols - 1) * paddingX;
    const startX = (screenWidth - gridWidth) / 2 + cardWidth / 2;
    const startY = screenHeight * 0.4;

    pageCards.forEach((card, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = startX + col * (cardWidth + paddingX);
      const y = startY + row * (cardHeight + paddingY);

      // Create enhanced card sprite with glow effect
      const cardContainer = this.add.container(x, y);
      cardContainer.setDepth(1001);
      
      // Add card glow effect
      const cardGlow = this.add.rectangle(0, 0, cardWidth + 8, cardHeight + 8, 0xffffff, 0.1);
      cardGlow.setStrokeStyle(2, 0xd4af37, 0.3);
      cardContainer.add(cardGlow);
      
      const cardSprite = this.createCardSprite(card, 0, 0, true);
      cardContainer.add(cardSprite);

      if (onSelect) {
        cardContainer.setInteractive(
          new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
          Phaser.Geom.Rectangle.Contains
        );
        cardContainer.on("pointerdown", () => {
          onSelect(card);
          this.clearCardDisplay();
          this.hideTooltip();
        });
      }

      cardContainer.on("pointerover", () => {
        cardGlow.setAlpha(0.3);
        cardGlow.setStrokeStyle(3, 0xd4af37, 0.7);
        
        // Only show tooltip when cards are interactive (onSelect exists)
        if (onSelect) {
          this.showCardTooltip(card, x, y - cardHeight/2 - 10);
        }
      });
      
      cardContainer.on("pointerout", () => {
        cardGlow.setAlpha(0.1);
        cardGlow.setStrokeStyle(2, 0xd4af37, 0.3);
        this.hideTooltip();
      });
      
      this.cardSprites.push(cardContainer);
    });

    this.createResponsivePaginationButtons(title, subtitle, onSelect);
  }

  private createResponsivePaginationButtons(title: string, subtitle: string, onSelect?: (card: PlayingCard) => void): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const buttonWidth = Math.min(140, screenWidth * 0.12);
    const buttonHeight = Math.min(60, screenHeight * 0.07);
    const fontSize = Math.min(18, screenWidth * 0.015);
    const y = screenHeight * 0.82;

    // Enhanced page indicator
    const totalPages = Math.ceil(this.displayedCards.length / this.cardsPerPage);
    if (totalPages > 1) {
      const pageText = this.add.text(
        screenWidth / 2, 
        y - 40, 
        `Page ${this.currentPage + 1} of ${totalPages}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: Math.min(16, screenWidth * 0.013),
          color: "#d4af37",
          align: "center"
        }
      ).setOrigin(0.5).setDepth(1002);
      this.cardSprites.push(pageText);
    }

    // Previous button with enhanced styling
    if (this.currentPage > 0) {
      this.prevButton = this.add.container(screenWidth / 2 - buttonWidth - 30, y);
      const prevBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2a2a2a);
      prevBg.setStrokeStyle(3, 0xd4af37);
      
      const prevGlow = this.add.rectangle(0, 0, buttonWidth - 4, buttonHeight - 4, 0x3a3a3a, 0.3);
      
      const prevText = this.add.text(0, 0, "◄ PREV", { 
        fontFamily: "dungeon-mode-inverted", 
        fontSize: fontSize, 
        color: "#d4af37",
        align: "center"
      }).setOrigin(0.5);
      
      this.prevButton.add([prevBg, prevGlow, prevText]);
      this.prevButton.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), 
        Phaser.Geom.Rectangle.Contains
      );
      this.prevButton.setDepth(1002);
      
      this.prevButton.on('pointerdown', () => {
        this.currentPage--;
        this.drawCardPage(title, subtitle, onSelect);
      });
      this.prevButton.on('pointerover', () => {
        prevBg.setFillStyle(0x3a3a3a);
        prevGlow.setAlpha(0.6);
      });
      this.prevButton.on('pointerout', () => {
        prevBg.setFillStyle(0x2a2a2a);
        prevGlow.setAlpha(0.3);
      });
    }

    // Next button with enhanced styling
    if ((this.currentPage + 1) * this.cardsPerPage < this.displayedCards.length) {
      this.nextButton = this.add.container(screenWidth / 2 + buttonWidth + 30, y);
      const nextBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2a2a2a);
      nextBg.setStrokeStyle(3, 0xd4af37);
      
      const nextGlow = this.add.rectangle(0, 0, buttonWidth - 4, buttonHeight - 4, 0x3a3a3a, 0.3);
      
      const nextText = this.add.text(0, 0, "NEXT ►", { 
        fontFamily: "dungeon-mode-inverted", 
        fontSize: fontSize, 
        color: "#d4af37",
        align: "center"
      }).setOrigin(0.5);
      
      this.nextButton.add([nextBg, nextGlow, nextText]);
      this.nextButton.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), 
        Phaser.Geom.Rectangle.Contains
      );
      this.nextButton.setDepth(1002);
      
      this.nextButton.on('pointerdown', () => {
        this.currentPage++;
        this.drawCardPage(title, subtitle, onSelect);
      });
      this.nextButton.on('pointerover', () => {
        nextBg.setFillStyle(0x3a3a3a);
        nextGlow.setAlpha(0.6);
      });
      this.nextButton.on('pointerout', () => {
        nextBg.setFillStyle(0x2a2a2a);
        nextGlow.setAlpha(0.3);
      });
    }
  }

  private createCardSprite(
    card: PlayingCard,
    x: number,
    y: number,
    interactive: boolean = false
  ): Phaser.GameObjects.Container {
    const cardContainer = this.add.container(x, y);
    
    // Calculate card dimensions based on screen size
    const screenWidth = this.cameras.main.width;
    const baseCardWidth = 50;
    const baseCardHeight = 70;
    
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
        fontSize: Math.floor(10 * scaleFactor),
        color: "#000000",
      }).setOrigin(0, 0);
      cardContainer.add(rankText);
      
      // Add suit symbol
      const display = DeckManager.getCardDisplay(card);
      const suitText = this.add.text(cardWidth/2 - 5, -cardHeight/2 + 5, display.symbol, {
        fontSize: Math.floor(10 * scaleFactor),
        color: display.color,
      }).setOrigin(1, 0);
      cardContainer.add(suitText);
    }
    
    cardSprite.setDisplaySize(cardWidth, cardHeight);
    
    cardContainer.add(cardSprite);
    
    // Make interactive only if requested
    if (interactive) {
      cardContainer.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      cardContainer.on("pointerover", () => {
        cardContainer.y -= 20;
      });
      cardContainer.on("pointerout", () => {
        cardContainer.y += 20;
      });
    }
    
    return cardContainer;
  }

  private purifyCard(card: PlayingCard): void {
    // Remove card from all collections
    this.player.deck = this.player.deck.filter(c => c.id !== card.id);
    this.player.drawPile = this.player.drawPile.filter(c => c.id !== card.id);
    this.player.discardPile = this.player.discardPile.filter(c => c.id !== card.id);
    this.player.hand = this.player.hand.filter(c => c.id !== card.id);
    
    // Update GameState
    const gameState = GameState.getInstance();
    gameState.updatePlayerData({
      deck: this.player.deck,
      drawPile: this.player.drawPile,
      discardPile: this.player.discardPile,
      hand: this.player.hand
    });
    
    // Show purification effect
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const purifyText = this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 160,
      `Purified ${card.rank} of ${card.suit}`,
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 24,
        color: "#ff6b6b",
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Animate purification text
    this.tweens.add({
      targets: purifyText,
      y: screenHeight / 2 - 200,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        purifyText.destroy();
      }
    });
    
    // Disable purify button after use
    const background = this.purifyButton.getAt(0) as Phaser.GameObjects.Rectangle;
    if (background) {
      background.setFillStyle(0x1a1d26);
    }
    this.purifyButton.disableInteractive();
    this.purifyButton.setActive(false);
    
    // Hide tooltip
    this.hideTooltip();
  }

  private upgradeCard(card: PlayingCard): void {
    // Upgrade card rank if possible
    const ranks: any[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Mandirigma", "Babaylan", "Datu"];
    const currentIndex = ranks.indexOf(card.rank);
    
    if (currentIndex < ranks.length - 1) {
      const newRank = ranks[currentIndex + 1];
      
      // Update card in all collections
      const updateCardRank = (cards: PlayingCard[]) => {
        return cards.map(c => {
          if (c.id === card.id) {
            return { ...c, rank: newRank };
          }
          return c;
        });
      };
      
      this.player.deck = updateCardRank(this.player.deck);
      this.player.drawPile = updateCardRank(this.player.drawPile);
      this.player.discardPile = updateCardRank(this.player.discardPile);
      this.player.hand = updateCardRank(this.player.hand);
      
      // Update GameState
      const gameState = GameState.getInstance();
      gameState.updatePlayerData({
        deck: this.player.deck,
        drawPile: this.player.drawPile,
        discardPile: this.player.discardPile,
        hand: this.player.hand
      });
      
      // Show upgrade effect
      const screenWidth = this.cameras.main.width;
      const screenHeight = this.cameras.main.height;
      
      const upgradeText = this.add.text(
        screenWidth / 2,
        screenHeight / 2 - 160,
        `Attuned ${card.rank} of ${card.suit} to ${newRank}`,
        {
          fontFamily: "dungeon-mode-inverted",
          fontSize: 24,
          color: "#4ecdc4",
          align: "center",
        }
      ).setOrigin(0.5);
      
      // Animate upgrade text
      this.tweens.add({
        targets: upgradeText,
        y: screenHeight / 2 - 200,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          upgradeText.destroy();
        }
      });
    } else {
      // Show max rank message
      const screenWidth = this.cameras.main.width;
      const screenHeight = this.cameras.main.height;
      
      const maxRankText = this.add.text(
        screenWidth / 2,
        screenHeight / 2 - 160,
        "This card is already at maximum rank!",
        {
          fontFamily: "dungeon-mode-inverted",
          fontSize: 24,
          color: "#ff9f43",
          align: "center",
        }
      ).setOrigin(0.5);
      
      // Animate max rank text
      this.tweens.add({
        targets: maxRankText,
        y: screenHeight / 2 - 200,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          maxRankText.destroy();
        }
      });
    }
    
    // Disable upgrade button after use
    const background = this.upgradeButton.getAt(0) as Phaser.GameObjects.Rectangle;
    if (background) {
      background.setFillStyle(0x1a1d26);
    }
    this.upgradeButton.disableInteractive();
    this.upgradeButton.setActive(false);
    
    // Hide tooltip
    this.hideTooltip();
  }

  /**
   * Shutdown method - called when scene is stopped
   * Music cleanup is handled automatically by MusicLifecycleSystem
   */
  shutdown(): void {
    // Music cleanup handled by MusicLifecycleSystem
  }
}

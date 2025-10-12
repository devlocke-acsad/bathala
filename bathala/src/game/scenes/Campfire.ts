import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { Player, PlayingCard } from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";

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
    this.cameras.main.setBackgroundColor(0x0a0a0a);

    // Create responsive layout
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add dark gradient background
    const gradient = this.add.graphics();
    gradient.fillStyle(0x0a0a0a, 1);
    gradient.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add subtle particles for atmosphere
    this.createAtmosphericParticles();
    
    // Create bonfire animation with glow effect
    this.createBonfireWithGlow(screenWidth / 2, screenHeight * 0.4);
    
    // Create responsive title with proper scaling
    this.add.text(
      screenWidth / 2,
      Math.max(60, screenHeight * 0.08),
      "REST AT BONFIRE",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: Math.min(36, screenWidth * 0.03),
        color: "#d4af37",
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
        color: "#cccccc",
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

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
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
    
    // Create bonfire animation
    this.campfire = this.add.sprite(x, y, "campfire");
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
    
    // Create health bar background
    const healthBarBg = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2 - 100,
      300,
      20,
      0x333333
    );
    healthBarBg.setStrokeStyle(2, 0x555555);
    
    // Create health bar fill
    const healthPercent = this.player.currentHealth / this.player.maxHealth;
    const healthBarFill = this.add.rectangle(
      screenWidth / 2 - (300 * (1 - healthPercent)) / 2,
      screenHeight / 2 - 100,
      300 * healthPercent,
      20,
      healthPercent > 0.5 ? 0x2ed573 : healthPercent > 0.25 ? 0xff9f43 : 0xff4757
    );
    
    // Create health text
    this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 130,
      `Health: ${this.player.currentHealth}/${this.player.maxHealth}`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffffff",
        align: "center",
      }
    ).setOrigin(0.5);
  }

  private createResponsiveActionButtons(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Calculate responsive positioning and sizing for improved UI
    const buttonWidth = Math.min(200, screenWidth * 0.18);
    const buttonHeight = Math.min(80, screenHeight * 0.1);
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
    const spacingX = buttonWidth + 40;
    const spacingY = buttonHeight + 30;
    
    const startX = screenWidth / 2 - (spacingX * (gridCols - 1)) / 2;
    const startY = screenHeight * 0.65;

    actions.forEach((data, index) => {
      const row = Math.floor(index / gridCols);
      const col = index % gridCols;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const button = this.add.container(x, y);
      
      // Enhanced button background with gradient-like effect
      const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, data.color);
      background.setStrokeStyle(3, 0xd4af37);
      background.setAlpha(0.8);
      
      // Add inner glow effect
      const innerGlow = this.add.rectangle(0, 0, buttonWidth - 6, buttonHeight - 6, data.color);
      innerGlow.setAlpha(0.3);
      
      const text = this.add.text(0, 0, data.text, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: fontSize,
        color: data.textColor,
        align: "center",
        wordWrap: { width: buttonWidth - 20 }
      }).setOrigin(0.5);
      
      button.add([background, innerGlow, text]);
      button.setDepth(100);
      
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => {
        switch(data.action) {
          case "rest": this.rest(); break;
          case "purify": this.showPurifyCards(); break;
          case "upgrade": this.showUpgradeCards(); break;
          case "view_deck": this.showDeck(); break;
        }
      });
      
      button.on("pointerover", () => {
        background.setFillStyle(data.color);
        background.setAlpha(1.0);
        innerGlow.setAlpha(0.6);
        
        // Enhanced tooltip positioning
        const tooltipX = x;
        const tooltipY = y - buttonHeight/2 - 10;
        this.showResponsiveTooltip(data.description, tooltipX, tooltipY);
      });
      
      button.on("pointerout", () => {
        background.setFillStyle(data.color);
        background.setAlpha(0.8);
        innerGlow.setAlpha(0.3);
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
    
    // Create responsive button with bonfire styling
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x332222);
    background.setStrokeStyle(3, 0xd4af37);
    
    const text = this.add.text(0, 0, "LEAVE BONFIRE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: fontSize,
      color: "#d4af37",
      wordWrap: { width: buttonWidth - 20 }
    }).setOrigin(0.5);
    
    backButton.add([background, text]);
    
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
      background.setFillStyle(0x443333);
      text.setColor("#ffd700");
      this.showResponsiveTooltip("Return to your journey", screenWidth / 2, screenHeight - Math.max(120, screenHeight * 0.15));
    });
    
    backButton.on("pointerout", () => {
      background.setFillStyle(0x332222);
      text.setColor("#d4af37");
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
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
    this.tooltipBox.setDepth(2000);
  }

  private showActionTooltip(action: string, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);
    
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
    this.tooltipBox.setPosition(x, y);
    this.tooltipBox.setVisible(true);
  }

  private showCardTooltip(card: PlayingCard, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);
    
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
    this.tooltipBox.setPosition(x, y);
    this.tooltipBox.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipBox.setVisible(false);
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
    
    // Remove duplicates and set up for pagination
    this.displayedCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );
    this.currentPage = 0;

    // Draw the first page of cards
    this.drawCardPage("Your Deck", "This is your current collection of cards.");

    // Create a back button to close the deck view
    const backButton = this.createCardViewBackButton(() => {
      this.clearCardDisplay();
      this.reEnableActionButtons();
      backButton.destroy();
    });
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

    const backButton = this.createCardViewBackButton(() => {
        this.clearCardDisplay();
        this.reEnableActionButtons();
        backButton.destroy();
    });
    
    this.drawCardPage("Purify a Card", "Permanently remove a card from your deck.", (selectedCard) => {
      this.purifyCard(selectedCard);
      backButton.destroy();
      this.reEnableActionButtons();
    });
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
    
    const backButton = this.createCardViewBackButton(() => {
        this.clearCardDisplay();
        this.reEnableActionButtons();
        backButton.destroy();
    });

    this.drawCardPage("Attune a Card", "Upgrade a card to its next rank.", (selectedCard) => {
      this.upgradeCard(selectedCard);
      backButton.destroy();
      this.reEnableActionButtons();
    });
  }

  private clearCardDisplay(): void {
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    if (this.prevButton) this.prevButton.destroy();
    if (this.nextButton) this.nextButton.destroy();
  }

  private drawCardPage(title: string, subtitle: string, onSelect?: (card: PlayingCard) => void): void {
    this.clearCardDisplay();

    // Create enhanced responsive background with border styling
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const backgroundWidth = Math.min(screenWidth * 0.9, 1100);
    const backgroundHeight = Math.min(screenHeight * 0.8, 700);
    
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
    const rows = Math.ceil(pageCards.length / cols);
    
    // Larger cards for better visibility
    const cardWidth = Math.min(120, screenWidth / 8);
    const cardHeight = cardWidth * 1.4;
    const paddingX = Math.max(30, screenWidth * 0.03);
    const paddingY = Math.max(40, screenHeight * 0.04);
    
    // Center the grid
    const gridWidth = cols * cardWidth + (cols - 1) * paddingX;
    const gridHeight = rows * cardHeight + (rows - 1) * paddingY;
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
        this.showCardTooltip(card, x, y - cardHeight/2 - 10);
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
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    
    // Recreate all elements with responsive sizing
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Responsive title
    const titleFontSize = Math.min(36, screenWidth * 0.035);
    this.add.text(
      screenWidth / 2,
      screenHeight * 0.08,
      "REST AT BONFIRE",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: titleFontSize,
        color: "#d4af37",
        align: "center",
        stroke: "#000000",
        strokeThickness: Math.max(2, titleFontSize / 18),
        wordWrap: { width: screenWidth * 0.8 }
      }
    ).setOrigin(0.5);
    
    // Responsive subtitle
    const subtitleFontSize = Math.min(18, screenWidth * 0.018);
    this.add.text(
      screenWidth / 2,
      screenHeight * 0.13,
      "The bonfire's warmth restores your spirit",
      {
        fontFamily: "dungeon-mode",
        fontSize: subtitleFontSize,
        color: "#cccccc",
        align: "center",
        wordWrap: { width: screenWidth * 0.9 }
      }
    ).setOrigin(0.5);
    
    this.createBonfireWithGlow(screenWidth / 2, screenHeight / 2);
    this.createPlayerHealthDisplay();
    this.createResponsiveActionButtons();
    this.createTooltipBox();
    this.createResponsiveBackButton();
    this.createAtmosphericParticles();
  }
}
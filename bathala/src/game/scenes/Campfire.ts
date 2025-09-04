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
  private actionText!: Phaser.GameObjects.Text;
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private tooltipBox!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Campfire" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a0a);

    // Create atmospheric background
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add dark gradient background
    const gradient = this.add.graphics();
    gradient.fillStyle(0x0a0a0a, 1);
    gradient.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add subtle particles for atmosphere
    this.createAtmosphericParticles();
    
    // Create bonfire animation with glow effect
    this.createBonfireWithGlow(screenWidth / 2, screenHeight / 2);
    
    // Create Dark Souls-style title
    this.add.text(
      screenWidth / 2,
      80,
      "REST AT BONFIRE",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 36,
        color: "#d4af37", // Gold color like Dark Souls
        align: "center",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Create bonfire description
    this.add.text(
      screenWidth / 2,
      130,
      "The bonfire's warmth restores your spirit",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#cccccc",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create player health display
    this.createPlayerHealthDisplay();

    // Create action buttons with Dark Souls styling
    this.createDarkSoulsActionButtons();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button with bonfire styling
    this.createBonfireBackButton();

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

  private createDarkSoulsActionButtons(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create action buttons with Dark Souls styling
    const buttonData = [
      { x: screenWidth / 2 - 200, y: screenHeight / 2 + 50, text: "HEAL", color: "#2ed573", action: "rest" },
      { x: screenWidth / 2, y: screenHeight / 2 + 50, text: "PURIFY", color: "#ff6b6b", action: "purify" },
      { x: screenWidth / 2 + 200, y: screenHeight / 2 + 50, text: "ATTUNE", color: "#4ecdc4", action: "upgrade" }
    ];
    
    buttonData.forEach(data => {
      const button = this.add.container(data.x, data.y);
      
      // Create button background with dark souls styling
      const background = this.add.rectangle(0, 0, 150, 60, 0x222222);
      background.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(data.color).color);
      
      // Create button text
      const buttonText = this.add.text(0, 0, data.text, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 22,
        color: data.color,
        align: "center",
      }).setOrigin(0.5);
      
      button.add([background, buttonText]);
      
      // Set interactivity
      button.setInteractive(
        new Phaser.Geom.Rectangle(-75, -30, 150, 60),
        Phaser.Geom.Rectangle.Contains
      );
      
      // Add event listeners
      button.on("pointerdown", () => {
        switch(data.action) {
          case "rest": this.rest(); break;
          case "purify": this.showPurifyCards(); break;
          case "upgrade": this.showUpgradeCards(); break;
        }
      });
      
      button.on("pointerover", () => {
        background.setFillStyle(0x333333);
        this.showActionTooltip(data.text, data.x, data.y - 50);
      });
      
      button.on("pointerout", () => {
        background.setFillStyle(0x222222);
        this.hideTooltip();
      });
      
      // Store references
      switch(data.action) {
        case "rest": this.restButton = button; break;
        case "purify": this.purifyButton = button; break;
        case "upgrade": this.upgradeButton = button; break;
      }
    });
  }

  private createBonfireBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - 80);
    
    // Create button with bonfire styling
    const background = this.add.rectangle(0, 0, 200, 60, 0x332222);
    background.setStrokeStyle(3, 0xd4af37); // Gold border like Dark Souls
    
    const text = this.add.text(0, 0, "LEAVE BONFIRE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 22,
      color: "#d4af37", // Gold text
    }).setOrigin(0.5);
    
    backButton.add([background, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-100, -30, 200, 60),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Add bonfire sound effect placeholder
      console.log("Bonfire - Leaving...");
      
      // Complete the campfire node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      this.scene.stop();
      this.scene.resume("Overworld");
    });
    
    backButton.on("pointerover", () => {
      background.setFillStyle(0x443333);
      text.setColor("#ffd700"); // Brighter gold on hover
    });
    
    backButton.on("pointerout", () => {
      background.setFillStyle(0x332222);
      text.setColor("#d4af37");
    });
  }

  private createTooltipBox(): void {
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
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

  private showPurifyCards(): void {
    // Clear any existing card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
    // Combine all cards in player's possession
    const allCards = [
      ...this.player.deck,
      ...this.player.drawPile,
      ...this.player.discardPile,
      ...this.player.hand
    ];
    
    // Remove duplicates (cards that appear in multiple locations)
    const uniqueCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );
    
    // Display cards
    this.displayCardsForSelection(uniqueCards, (selectedCard) => {
      this.purifyCard(selectedCard);
    });
  }

  private showUpgradeCards(): void {
    // Clear any existing card sprites
    this.cardSprites.forEach(sprite => sprite.destroy());
    this.cardSprites = [];
    
    // Combine all cards in player's possession
    const allCards = [
      ...this.player.deck,
      ...this.player.drawPile,
      ...this.player.discardPile,
      ...this.player.hand
    ];
    
    // Remove duplicates (cards that appear in multiple locations)
    const uniqueCards = allCards.filter(
      (card, index, self) => index === self.findIndex(c => c.id === card.id)
    );
    
    // Display cards
    this.displayCardsForSelection(uniqueCards, (selectedCard) => {
      this.upgradeCard(selectedCard);
    });
  }

  private displayCardsForSelection(
    cards: PlayingCard[],
    onSelect: (card: PlayingCard) => void
  ): void {
    const screenWidth = this.cameras.main.width;
    const cardWidth = 60;
    const totalWidth = cards.length * cardWidth;
    const maxWidth = screenWidth - 200;
    const actualCardWidth = totalWidth > maxWidth ? (maxWidth / cards.length) : cardWidth;
    const actualTotalWidth = cards.length * actualCardWidth;
    const startX = (screenWidth - actualTotalWidth) / 2 + actualCardWidth / 2;
    const y = this.cameras.main.height / 2 + 150;
    
    cards.forEach((card, index) => {
      const x = startX + index * actualCardWidth;
      const cardSprite = this.createCardSprite(card, x, y, true);
      cardSprite.setInteractive();
      cardSprite.on("pointerdown", () => {
        onSelect(card);
        // Clear card display after selection
        this.cardSprites.forEach(sprite => sprite.destroy());
        this.cardSprites = [];
        this.hideTooltip();
      });
      cardSprite.on("pointerover", () => {
        this.showCardTooltip(card, x + 40, y);
      });
      cardSprite.on("pointerout", () => {
        this.hideTooltip();
      });
      this.cardSprites.push(cardSprite);
    });
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
    
    // Recreate all elements
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.add.text(
      screenWidth / 2,
      80,
      "REST AT BONFIRE",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 36,
        color: "#d4af37",
        align: "center",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth / 2,
      130,
      "The bonfire's warmth restores your spirit",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#cccccc",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.createBonfireWithGlow(screenWidth / 2, screenHeight / 2);
    this.createPlayerHealthDisplay();
    this.createDarkSoulsActionButtons();
    this.createTooltipBox();
    this.createBonfireBackButton();
    this.createAtmosphericParticles();
  }
}
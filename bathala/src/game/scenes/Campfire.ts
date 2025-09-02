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
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Create title
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.add.text(
      screenWidth / 2,
      30,
      "Campfire",
      {
        fontFamily: "Centrion",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create campfire animation
    this.campfire = this.add.sprite(screenWidth / 2, screenHeight / 2 - 50, "campfire");
    // Try to play animation, fallback if it fails
    try {
      this.campfire.play("campfire_burn");
    } catch (error) {
      console.warn("Campfire animation not found, using static sprite");
    }
    this.campfire.setScale(2);

    // Create action text
    this.actionText = this.add.text(
      screenWidth / 2,
      screenHeight / 2 + 50,
      "Choose an action",
      {
        fontFamily: "Centrion",
        fontSize: 20,
        color: "#ffd93d",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create action buttons
    this.createActionButtons();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  private createActionButtons(): void {
    const screenWidth = this.cameras.main.width;
    const buttonY = 100;
    
    // Rest button (heal 30% of max HP)
    this.restButton = this.createActionButton(
      100,
      buttonY,
      "Rest",
      "#2ed573",
      () => this.rest()
    );
    
    // Purify button (remove a card)
    this.purifyButton = this.createActionButton(
      250,
      buttonY,
      "Purify",
      "#ff6b6b",
      () => this.showPurifyCards()
    );
    
    // Upgrade button (upgrade a card)
    this.upgradeButton = this.createActionButton(
      400,
      buttonY,
      "Attune",
      "#4ecdc4",
      () => this.showUpgradeCards()
    );
  }

  private createActionButton(
    x: number,
    y: number,
    text: string,
    color: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const background = this.add.rectangle(0, 0, 120, 50, 0x2f3542);
    background.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: "Centrion",
      fontSize: 20,
      color: color,
      align: "center",
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    
    button.setInteractive(
      new Phaser.Geom.Rectangle(-60, -25, 120, 50),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on("pointerdown", callback);
    button.on("pointerover", () => {
      background.setFillStyle(0x3d4454);
      this.showActionTooltip(text, x + 70, y);
    });
    button.on("pointerout", () => {
      background.setFillStyle(0x2f3542);
      this.hideTooltip();
    });
    
    return button;
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
      case "Rest":
        description = "Heal 30% of your maximum HP";
        break;
      case "Purify":
        description = "Remove a card from your deck permanently";
        break;
      case "Attune":
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
      fontFamily: "Centrion",
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
      fontFamily: "Centrion",
      fontSize: 18,
      color: display.color,
      align: "left",
    }).setOrigin(0, 0);
    
    const elementInfo = this.add.text(-90, -10, `Element: ${display.elementSymbol}`, {
      fontFamily: "Centrion",
      fontSize: 16,
      color: "#a8a8a8",
      align: "left",
    }).setOrigin(0, 0);
    
    const instruction = this.add.text(-90, 20, "Click to select", {
      fontFamily: "Centrion",
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

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - 50);
    
    const background = this.add.rectangle(0, 0, 150, 50, 0xff4757);
    background.setStrokeStyle(2, 0xffffff);
    
    const text = this.add.text(0, 0, "Leave Campfire", {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    backButton.add([background, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-75, -25, 150, 50),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Complete the campfire node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      this.scene.start("Overworld");
    });
    
    backButton.on("pointerover", () => background.setFillStyle(0xff6b81));
    backButton.on("pointerout", () => background.setFillStyle(0xff4757));
  }

  private rest(): void {
    const healAmount = Math.floor(this.player.maxHealth * 0.3);
    this.player.currentHealth = Math.min(
      this.player.maxHealth,
      this.player.currentHealth + healAmount
    );
    
    this.actionText.setText(`You rest by the campfire and heal ${healAmount} HP`);
    this.actionText.setColor("#2ed573");
    
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
    this.actionText.setText("Select a card to remove from your deck");
    this.actionText.setColor("#ff6b6b");
    
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
    this.actionText.setText("Select a card to upgrade");
    this.actionText.setColor("#4ecdc4");
    
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
    const y = this.cameras.main.height / 2 + 100;
    
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
    
    this.actionText.setText(`Removed ${card.rank} of ${card.suit} from your deck`);
    this.actionText.setColor("#2ed573");
    
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
      
      this.actionText.setText(`Upgraded ${card.rank} of ${card.suit} to ${newRank}`);
      this.actionText.setColor("#2ed573");
    } else {
      this.actionText.setText("This card is already at maximum rank!");
      this.actionText.setColor("#ff9f43");
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
      30,
      "Campfire",
      {
        fontFamily: "Centrion",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.campfire.setPosition(screenWidth / 2, screenHeight / 2 - 50);
    this.actionText.setPosition(screenWidth / 2, screenHeight / 2 + 50);
    
    this.createActionButtons();
    this.createTooltipBox();
    this.createBackButton();
  }
}
import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { Player, Relic } from "../../core/types/CombatTypes";
import { allShopItems, ShopItem } from "../../data/relics/ShopItems";

export class Shop extends Scene {
  private player!: Player;
  private shopItems: ShopItem[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private gintoText!: Phaser.GameObjects.Text;
  private baublesText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;
  private selectedItem: ShopItem | null = null;

  constructor() {
    super({ key: "Shop" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    // Filter out relics the player already has
    this.shopItems = allShopItems.filter(
      item => !this.player.relics.some(relic => relic.id === item.item.id)
    );
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Create title
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.add.text(
      screenWidth / 2,
      30,
      "Mysterious Merchant",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create currency display
    this.createCurrencyDisplay();

    // Create inventory-style UI
    this.createInventoryUI();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  private createCurrencyDisplay(): void {
    const screenWidth = this.cameras.main.width;
    
    this.gintoText = this.add.text(
      screenWidth - 200,
      80,
      `Ginto: ${this.player.ginto} 💰`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    );

    this.baublesText = this.add.text(
      screenWidth - 200,
      110,
      `Baubles: ${this.player.baubles} 💎`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#4ecdc4",
      }
    );
  }

  private createInventoryUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const itemWidth = 80;
    const itemHeight = 80;
    const itemsPerRow = 8;
    const spacing = 20;
    const startX = (screenWidth - (itemsPerRow * (itemWidth + spacing) - spacing)) / 2;
    const startY = 150;

    this.relicButtons = [];

    this.shopItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = startX + col * (itemWidth + spacing);
      const y = startY + row * (itemHeight + spacing);

      const button = this.add.container(x, y);
      
      // Background
      const background = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x2f3542);
      background.setStrokeStyle(2, 0x57606f);
      
      // Item emoji
      const emoji = this.add.text(0, 0, item.emoji, {
        fontSize: 32,
      }).setOrigin(0.5);
      
      button.add([background, emoji]);
      
      // Make interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(-itemWidth/2, -itemHeight/2, itemWidth, itemHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => this.buyItem(item));
      button.on("pointerover", () => {
        background.setFillStyle(0x3d4454);
        this.showTooltip(item, x + itemWidth/2 + 10, y);
      });
      button.on("pointerout", () => {
        background.setFillStyle(0x2f3542);
        this.hideTooltip();
      });
      
      this.relicButtons.push(button);
    });
  }

  private createTooltipBox(): void {
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
  }

  private showTooltip(item: ShopItem, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);
    
    // Create tooltip background
    const tooltipBg = this.add.rectangle(0, 0, 300, 150, 0x000000);
    tooltipBg.setAlpha(0.9);
    tooltipBg.setStrokeStyle(2, 0x57606f);
    
    // Item name
    const name = this.add.text(-140, -60, item.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#e8eced",
      align: "left",
    }).setOrigin(0, 0);
    
    // Item description
    const description = this.add.text(-140, -30, item.description, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#a8a8a8",
      align: "left",
      wordWrap: { width: 280 }
    }).setOrigin(0, 0);
    
    // Price
    const priceColor = item.currency === "ginto" ? "#ffd93d" : "#4ecdc4";
    const priceEmoji = item.currency === "ginto" ? "💰" : "💎";
    const price = this.add.text(-140, 30, `Price: ${item.price} ${priceEmoji}`, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: priceColor,
    }).setOrigin(0, 0);
    
    // Owned status
    const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
    const ownedText = this.add.text(-140, 60, isOwned ? "Owned" : "Click to buy", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: isOwned ? "#ff9f43" : "#2ed573",
    }).setOrigin(0, 0);
    
    this.tooltipBox.add([tooltipBg, name, description, price, ownedText]);
    this.tooltipBox.setPosition(x, y);
    this.tooltipBox.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipBox.setVisible(false);
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const buttonText = "Leave Shop";
    const baseWidth = 150;
    const textWidth = buttonText.length * 10; // Approximate width per character
    const buttonWidth = Math.max(baseWidth, textWidth + 20); // Add padding
    const buttonHeight = 50;
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - 50);
    
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xff4757);
    background.setStrokeStyle(2, 0xffffff);
    
    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    backButton.add([background, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Complete the shop node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      this.scene.stop();
      this.scene.resume("Overworld");
    });
    
    backButton.on("pointerover", () => background.setFillStyle(0xff6b81));
    backButton.on("pointerout", () => background.setFillStyle(0xff4757));
  }

  private buyItem(item: ShopItem): void {
    // Check if player already has this relic
    if (this.player.relics.some(relic => relic.id === item.item.id)) {
      this.showMessage("You already have this relic!", "#ff9f43");
      return;
    }
    
    // Check if player can afford the item
    if (item.currency === "ginto" && this.player.ginto < item.price) {
      this.showMessage("Not enough Ginto!", "#ff4757");
      return;
    }
    
    if (item.currency === "baubles" && this.player.baubles < item.price) {
      this.showMessage("Not enough Baubles!", "#ff4757");
      return;
    }
    
    // Deduct currency
    if (item.currency === "ginto") {
      this.player.ginto -= item.price;
    } else {
      this.player.baubles -= item.price;
    }
    
    // Add relic to player
    if (item.type === "relic") {
      this.player.relics.push(item.item as Relic);
    }
    
    // Update UI
    this.gintoText.setText(`Ginto: ${this.player.ginto} 💰`);
    this.baublesText.setText(`Baubles: ${this.player.baubles} 💎`);
    
    // Show success message
    this.showMessage(`Purchased ${item.name}!`, "#2ed573");
    
    // Hide tooltip
    this.hideTooltip();
    
    // Update the purchased item button
    const itemIndex = this.shopItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      const button = this.relicButtons[itemIndex];
      if (button) {
        // Dim the button and remove interactivity
        const background = button.getAt(0) as Phaser.GameObjects.Rectangle;
        if (background) {
          background.setFillStyle(0x1a1d26);
        }
        button.disableInteractive();
        button.setActive(false);
        
        // Add a visual indicator that the item is owned
        const ownedIndicator = this.add.text(0, 0, "OWNED", {
          fontFamily: "dungeon-mode",
          fontSize: 12,
          color: "#666666",
        }).setOrigin(0.5);
        button.add(ownedIndicator);
      }
    }
  }

  private showMessage(message: string, color: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Remove any existing message
    this.children.getArray().forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.y === screenHeight - 100) {
        child.destroy();
      }
    });
    
    const messageText = this.add.text(
      screenWidth / 2,
      screenHeight - 100,
      message,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: color,
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Auto-remove after 2 seconds
    this.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createCurrencyDisplay();
    this.createInventoryUI();
    this.createTooltipBox();
    this.createBackButton();
  }
}
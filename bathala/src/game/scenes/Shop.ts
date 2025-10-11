import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { Player, Relic } from "../../core/types/CombatTypes";
import { allShopItems, ShopItem } from "../../data/relics/ShopItems";

export class Shop extends Scene {
  private player!: Player;
  private shopItems: ShopItem[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private gintoText!: Phaser.GameObjects.Text;
  private diamanteText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;
  private scrollContainer: Phaser.GameObjects.Container | null = null;
  private currentTooltip: Phaser.GameObjects.Container | null = null;

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
    if (!this.cameras.main) return;
    this.cameras.main.setBackgroundColor(0x150E10); // Match combat background

    // Create animated background elements
    this.createBackgroundElements();

    // Create modern title section
    const screenWidth = this.cameras.main.width;
    
    // Title background panel with prologue/combat theme - made much wider
    const titlePanel = this.add.graphics();
    titlePanel.fillStyle(0x150E10, 0.9);
    titlePanel.fillRoundedRect(screenWidth/2 - 300, 10, 600, 60, 12); // Increased from 400px to 600px
    titlePanel.lineStyle(2, 0x77888C, 0.8);
    titlePanel.strokeRoundedRect(screenWidth/2 - 300, 10, 600, 60, 12); // Increased from 400px to 600px
    titlePanel.setDepth(2000); // Ensure title stays on top and doesn't scroll
    
    // Add the animated merchant sprite next to the title
    const merchant = this.add.sprite(screenWidth / 2 - 270, 40, 'merchant_f01');
    merchant.setScale(1.5);
    merchant.setDepth(2001); // Ensure merchant appears above background but below text
    
    // Start the merchant animation
    merchant.play('merchant_idle');
    
    // Main title with prologue/combat styling
    const title = this.add.text(
      screenWidth / 2,
      40,
      "MYSTERIOUS MERCHANT",
      {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(2002); // Ensure title text stays on top of merchant
    
    // Subtitle
    const subtitle = this.add.text(
      screenWidth / 2,
      65,
      "• Rare Relics & Mystical Artifacts •",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(2002); // Ensure subtitle text stays on top of merchant
    
    // Title animation
    title.setScale(0.8).setAlpha(0);
    subtitle.setScale(0.8).setAlpha(0);
    
    this.tweens.add({
      targets: [title, subtitle],
      scale: 1,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
      delay: 200
    });
    
    // Animate the merchant as well
    this.tweens.add({
      targets: merchant,
      y: 35,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Create currency display
    this.createCurrencyDisplay();

    // Create inventory-style UI with categories
    this.createCategorizedInventoryUI();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);

    // Listen for scene shutdown to clean up tooltips
    this.events.on('shutdown', this.cleanup, this);
  }

  private cleanup(): void {
    // Clean up any remaining tooltips
    this.hideItemTooltip();
    
    // Remove event listeners
    this.scale.off('resize', this.handleResize, this);
    this.events.off('shutdown', this.cleanup, this);
  }

  private createBackgroundElements(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create a sophisticated background matching prologue/combat theme
    const bgOverlay = this.add.graphics();
    bgOverlay.fillStyle(0x150E10, 1);
    bgOverlay.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add subtle geometric pattern with prologue/combat colors
    for (let i = 0; i < 12; i++) {
      const size = Phaser.Math.Between(15, 45);
      const x = Phaser.Math.Between(0, screenWidth);
      const y = Phaser.Math.Between(0, screenHeight);
      
      const shape = this.add.graphics();
      shape.lineStyle(1, 0x77888C, 0.15);
      shape.beginPath();
      shape.moveTo(x, y);
      shape.lineTo(x + size, y);
      shape.lineTo(x + size/2, y - size * 0.866);
      shape.closePath();
      shape.strokePath();
      
      // Subtle rotation animation
      this.tweens.add({
        targets: shape,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(20000, 30000),
        repeat: -1,
        ease: 'Linear'
      });
    }
    
    // Create mystical floating particles with prologue/combat colors
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, screenWidth),
        Phaser.Math.Between(0, screenHeight),
        Phaser.Math.Between(1, 2),
        0x77888C,
        0.3
      );
      
      // Smooth floating animation
      this.tweens.add({
        targets: particle,
        x: '+=' + Phaser.Math.Between(-120, 120),
        y: '+=' + Phaser.Math.Between(-120, 120),
        alpha: 0.6,
        duration: Phaser.Math.Between(5000, 9000),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Add corner decorative elements with prologue/combat theme
    const cornerSize = 40;
    
    // Top-left corner
    const topLeft = this.add.graphics();
    topLeft.lineStyle(3, 0x77888C, 0.8);
    topLeft.beginPath();
    topLeft.moveTo(20, cornerSize + 20);
    topLeft.lineTo(20, 20);
    topLeft.lineTo(cornerSize + 20, 20);
    topLeft.strokePath();
    
    // Top-right corner
    const topRight = this.add.graphics();
    topRight.lineStyle(3, 0x77888C, 0.8);
    topRight.beginPath();
    topRight.moveTo(screenWidth - cornerSize - 20, 20);
    topRight.lineTo(screenWidth - 20, 20);
    topRight.lineTo(screenWidth - 20, cornerSize + 20);
    topRight.strokePath();
    
    // Bottom-left corner
    const bottomLeft = this.add.graphics();
    bottomLeft.lineStyle(3, 0x77888C, 0.8);
    bottomLeft.beginPath();
    bottomLeft.moveTo(20, screenHeight - cornerSize - 20);
    bottomLeft.lineTo(20, screenHeight - 20);
    bottomLeft.lineTo(cornerSize + 20, screenHeight - 20);
    bottomLeft.strokePath();
    
    // Bottom-right corner
    const bottomRight = this.add.graphics();
    bottomRight.lineStyle(3, 0x77888C, 0.8);
    bottomRight.beginPath();
    bottomRight.moveTo(screenWidth - cornerSize - 20, screenHeight - 20);
    bottomRight.lineTo(screenWidth - 20, screenHeight - 20);
    bottomRight.lineTo(screenWidth - 20, screenHeight - cornerSize - 20);
    bottomRight.strokePath();
    
    // Add a subtle pulsing effect to corners
    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    corners.forEach(corner => {
      this.tweens.add({
        targets: corner,
        alpha: 0.4,
        duration: 2500,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createCurrencyDisplay(): void {
    const screenWidth = this.cameras.main.width;
    
    // Create currency panel with prologue/combat theme double borders
    const currencyPanel = this.add.graphics();
    
    // Outer border
    currencyPanel.lineStyle(2, 0x77888C);
    currencyPanel.strokeRoundedRect(screenWidth - 288, 81, 268, 88, 10);
    
    // Inner border
    currencyPanel.lineStyle(2, 0x77888C);
    currencyPanel.strokeRoundedRect(screenWidth - 284, 85, 260, 80, 10);
    
    // Background
    currencyPanel.fillStyle(0x150E10, 0.9);
    currencyPanel.fillRoundedRect(screenWidth - 284, 85, 260, 80, 10);
    
    // Health display with prologue/combat styling
    this.healthText = this.add.text(
      screenWidth - 154,
      105,
      `Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
      }
    ).setOrigin(0.5, 0.5);
    
    // Currency section with proper centering
    const currencyY = 135;
    
    // Ginto section - left aligned within currency area
    const gintoX = screenWidth - 210;
    const gintoIcon = this.add.text(gintoX - 15, currencyY, "💰", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.gintoText = this.add.text(gintoX + 15, currencyY, `${this.player.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Diamante section - right aligned within currency area
    const diamanteX = screenWidth - 110;
    const diamanteIcon = this.add.text(diamanteX - 15, currencyY, "💎", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.diamanteText = this.add.text(diamanteX + 15, currencyY, `${this.player.diamante}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Add subtle pulse animation to currency
    const currencyElements = [this.gintoText, gintoIcon, this.diamanteText, diamanteIcon];
    currencyElements.forEach((element, index) => {
      this.tweens.add({
        targets: element,
        scale: 1.05,
        duration: 1800,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: index * 250
      });
    });
  }

  private createCategorizedInventoryUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create scrollable container
    const scrollContainer = this.add.container(0, 0);
    scrollContainer.setDepth(1000);
    
    // Separate items by currency
    const gintoItems = this.shopItems.filter(item => item.currency === "ginto");
    const diamanteItems = this.shopItems.filter(item => item.currency === "diamante");
    
    // Create category sections with even better spacing
    // Start position for first section (gold items) - account for title space above
    const goldSectionY = 320; // Even higher starting position for better title clearance
    this.createCategorySection("Gold Items 💰", gintoItems, screenWidth, goldSectionY, scrollContainer);
    
    // Calculate position for diamante section with generous spacing
    const gintoRows = Math.ceil(gintoItems.length / 5);
    const diamanteSectionY = goldSectionY + (gintoRows * 190) + 200; // Extra generous space for clean separation
    
    this.createCategorySection("Diamante Items 💎", diamanteItems, screenWidth, diamanteSectionY, scrollContainer);
    
    // Add scroll functionality
    this.setupScrolling(scrollContainer, screenHeight);
    
    // Store container reference for resizing
    this.scrollContainer = scrollContainer;
  }

  private setupScrolling(container: Phaser.GameObjects.Container, screenHeight: number): void {
    let scrollY = 0;
    const maxScroll = Math.max(0, 1200 - screenHeight + 200); // Calculate based on content height
    const scrollSpeed = 30;
    
    // Mouse wheel scrolling
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      if (deltaY > 0) {
        // Scroll down
        scrollY = Math.min(scrollY + scrollSpeed, maxScroll);
      } else {
        // Scroll up
        scrollY = Math.max(scrollY - scrollSpeed, 0);
      }
      
      container.y = -scrollY;
    });
    
    // Keyboard scrolling (arrow keys)
    this.input.keyboard?.on('keydown-UP', () => {
      scrollY = Math.max(scrollY - scrollSpeed, 0);
      container.y = -scrollY;
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      scrollY = Math.min(scrollY + scrollSpeed, maxScroll);
      container.y = -scrollY;
    });
  }

  private createCategorySection(title: string, items: ShopItem[], screenWidth: number, startY: number, scrollContainer: Phaser.GameObjects.Container): void {
    // Create category title WELL ABOVE the items section
    const titleY = startY - 140; // Move title even higher above the item grid
    
    const categoryTitle = this.add.text(screenWidth / 2, titleY, title, {
      fontFamily: "dungeon-mode",
      fontSize: 24, // Slightly larger font
      color: "#77888C",
      align: "center",
      fontStyle: "bold"
    }).setOrigin(0.5);
    
    // Add double border background for title - made much wider
    const titleBg = this.add.graphics();
    const titleWidth = 450; // Even wider for better visual impact
    const titleHeight = 55; // Slightly taller
    
    // Outer border
    titleBg.lineStyle(2, 0x77888C);
    titleBg.strokeRoundedRect(screenWidth / 2 - titleWidth / 2 - 4, titleY - titleHeight / 2 - 4, titleWidth + 8, titleHeight + 8, 8);
    
    // Inner border  
    titleBg.lineStyle(2, 0x77888C);
    titleBg.strokeRoundedRect(screenWidth / 2 - titleWidth / 2, titleY - titleHeight / 2, titleWidth, titleHeight, 8);
    
    // Background
    titleBg.fillStyle(0x150E10, 0.9);
    titleBg.fillRoundedRect(screenWidth / 2 - titleWidth / 2, titleY - titleHeight / 2, titleWidth, titleHeight, 8);
    
    // Set depth order - titles should be above items
    titleBg.setDepth(1100);
    categoryTitle.setDepth(1101);
    
    // Add to scroll container
    scrollContainer.add([titleBg, categoryTitle]);
    
    // Create items grid with proper spacing - items start at startY
    const cardWidth = 120;
    const cardHeight = 140;
    const itemsPerRow = 5;
    const spacingX = 40;
    const spacingY = 50;
    const gridStartX = (screenWidth - (itemsPerRow * (cardWidth + spacingX) - spacingX)) / 2;
    const gridStartY = startY; // Items start at the designated startY position

    items.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = gridStartX + col * (cardWidth + spacingX);
      const y = gridStartY + row * (cardHeight + spacingY);

      const button = this.add.container(x, y);
      
      // Check if player already owns this relic
      const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
      
      // Create shadow effect
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-cardWidth/2 + 4, -cardHeight/2 + 4, cardWidth, cardHeight, 12);
      
      // Main card background with prologue/combat theme
      const cardBg = this.add.graphics();
      if (isOwned) {
        // Owned state with muted colors
        cardBg.fillStyle(0x2a2a2a, 0.8);
        cardBg.lineStyle(2, 0x444444, 0.6);
      } else {
        // Available items with prologue/combat styling
        cardBg.fillStyle(0x150E10, 0.95);
        cardBg.lineStyle(3, 0x77888C, 0.8);
      }
      cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      
      // Inner highlight for depth (only for available items)
      const innerHighlight = this.add.graphics();
      if (!isOwned) {
        innerHighlight.lineStyle(1, 0x77888C, 0.4);
        innerHighlight.strokeRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight - 4, 10);
      }
      
      // Icon area background
      const iconArea = this.add.graphics();
      if (isOwned) {
        iconArea.fillStyle(0x374151, 0.6);
      } else {
        iconArea.fillStyle(0x77888C, 0.2);
      }
      iconArea.fillRoundedRect(-cardWidth/2 + 8, -cardHeight/2 + 8, cardWidth - 16, 70, 8);
      
      // Item emoji with enhanced styling
      const emoji = this.add.text(0, -cardHeight/2 + 43, item.emoji, {
        fontSize: 42,
      }).setOrigin(0.5, 0.5);
      if (isOwned) {
        emoji.setAlpha(0.6);
      }
      
      // Currency badge
      let currencyColor;
      let currencyEmoji;
      if (item.currency === "ginto") {
        currencyColor = 0xfbbf24;
        currencyEmoji = "💰";
      } else {
        currencyColor = 0x06b6d4;
        currencyEmoji = "💎";
      }
      
      const currencyBadge = this.add.graphics();
      currencyBadge.fillStyle(currencyColor, isOwned ? 0.4 : 0.9);
      currencyBadge.fillRoundedRect(cardWidth/2 - 25, -cardHeight/2 + 5, 20, 20, 10);
      
      const currencyIcon = this.add.text(cardWidth/2 - 15, -cardHeight/2 + 15, currencyEmoji, {
        fontSize: 12,
      }).setOrigin(0.5, 0.5);
      
      // Price section
      const priceArea = this.add.graphics();
      priceArea.fillStyle(0x1f2937, isOwned ? 0.5 : 0.8);
      priceArea.fillRoundedRect(-cardWidth/2 + 8, cardHeight/2 - 35, cardWidth - 16, 27, 6);
      
      const priceText = this.add.text(0, cardHeight/2 - 21, `${item.price}`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: isOwned ? "#9ca3af" : "#77888C",
        fontStyle: "bold"
      }).setOrigin(0.5, 0.5);
      
      // Owned overlay
      let ownedOverlay = null;
      let ownedText = null;
      let checkMark = null;
      if (isOwned) {
        ownedOverlay = this.add.graphics();
        ownedOverlay.fillStyle(0x000000, 0.6);
        ownedOverlay.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
        
        ownedText = this.add.text(0, 0, "OWNED", {
          fontFamily: "dungeon-mode",
          fontSize: 18,
          color: "#10b981",
          fontStyle: "bold"
        }).setOrigin(0.5);
        
        checkMark = this.add.text(0, -25, "✓", {
          fontSize: 32,
          color: "#10b981",
        }).setOrigin(0.5);
      }
      
      // Assemble the button
      const components = [shadow, cardBg, innerHighlight, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText];
      if (ownedOverlay) {
        components.push(ownedOverlay);
        if (ownedText) components.push(ownedText);
        if (checkMark) components.push(checkMark);
      }
      button.add(components);
      
      // Enhanced interactivity for available items
      if (!isOwned) {
        button.setInteractive(
          new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
          Phaser.Geom.Rectangle.Contains
        );
        
        // Store references for hover effects
        let hoverGlow: Phaser.GameObjects.Graphics | null = null;
        
        button.on("pointerdown", () => this.showItemDetails(item));
        
        button.on("pointerover", () => {
          // Dim the item card
          this.tweens.add({
            targets: [cardBg, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText],
            alpha: 0.6, // Dim all components
            duration: 150,
            ease: 'Power2.easeOut'
          });
          
          // Slight scale effect
          this.tweens.add({
            targets: button,
            scale: 1.02,
            duration: 150,
            ease: 'Power2.easeOut'
          });
          
          // Remove any existing glow first
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          // Add subtle glow effect
          hoverGlow = this.add.graphics();
          hoverGlow.lineStyle(3, 0x77888C, 0.6);
          hoverGlow.strokeRoundedRect(-cardWidth/2 - 1, -cardHeight/2 - 1, cardWidth + 2, cardHeight + 2, 12);
          button.addAt(hoverGlow, 1); // Add after shadow but before card
          
          // Show tooltip ABOVE the slot with item name
          this.showItemTooltip(item.item.name, button.x, button.y - cardHeight/2 - 40);
        });
        
        button.on("pointerout", () => {
          // Restore item card opacity
          this.tweens.add({
            targets: [cardBg, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText],
            alpha: 1, // Restore full opacity
            duration: 150,
            ease: 'Power2.easeOut'
          });
          
          // Return to normal scale
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 150,
            ease: 'Power2.easeOut'
          });
          
          // Remove glow effect properly
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          // Hide tooltip
          this.hideItemTooltip();
        });
      }
      
      // Add button to scroll container with proper depth order
      button.setDepth(1050); // Items should be below titles (titles are at 1100+)
      scrollContainer.add(button);
      this.relicButtons.push(button);
    });
  }

  private createTooltipBox(): void {
    // Modern tooltip will be created dynamically
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
    this.tooltipBox.setDepth(3000); // Ensure it's above everything
  }

  private showItemTooltip(itemName: string, x: number, y: number): void {
    // Remove any existing tooltip
    this.hideItemTooltip();
    
    // Create tooltip container positioned above the item slot
    // Position it relative to the item's position within the scroll container
    const tooltip = this.add.container(x, y);
    tooltip.setDepth(3000);
    tooltip.setName('itemTooltip');
    
    // Add tooltip to scroll container so it moves with the content
    if (this.scrollContainer) {
      this.scrollContainer.add(tooltip);
    }
    
    // Measure text to size tooltip appropriately
    const tempText = this.add.text(0, 0, itemName, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffffff"
    });
    const textBounds = tempText.getBounds();
    const tooltipWidth = Math.max(textBounds.width + 24, 120); // Minimum width
    const tooltipHeight = 40;
    tempText.destroy();
    
    // Tooltip shadow for depth
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.6);
    shadow.fillRoundedRect(-tooltipWidth/2 + 3, -tooltipHeight/2 + 3, tooltipWidth, tooltipHeight, 10);
    
    // Tooltip background with enhanced styling
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 0.95);
    bg.lineStyle(2, 0x77888C, 1);
    bg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);
    bg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);
    
    // Inner glow for modern look
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(1, 0x77888C, 0.5);
    innerGlow.strokeRoundedRect(-tooltipWidth/2 + 2, -tooltipHeight/2 + 2, tooltipWidth - 4, tooltipHeight - 4, 8);
    
    // Tooltip text with enhanced styling
    const text = this.add.text(0, 0, itemName, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    // Add pointer/arrow pointing down to the item
    const arrow = this.add.graphics();
    arrow.fillStyle(0x1a1a1a, 0.95);
    arrow.lineStyle(2, 0x77888C, 1);
    arrow.fillTriangle(0, tooltipHeight/2, -8, tooltipHeight/2 + 10, 8, tooltipHeight/2 + 10);
    arrow.strokeTriangle(0, tooltipHeight/2, -8, tooltipHeight/2 + 10, 8, tooltipHeight/2 + 10);
    
    tooltip.add([shadow, bg, innerGlow, text, arrow]);
    
    // Smooth fade-in animation
    tooltip.setAlpha(0);
    this.tweens.add({
      targets: tooltip,
      alpha: 1,
      duration: 200,
      ease: 'Power2.easeOut'
    });
    
    // Store reference for cleanup
    this.currentTooltip = tooltip;
  }

  private hideItemTooltip(): void {
    if (this.currentTooltip) {
      this.tweens.add({
        targets: this.currentTooltip,
        alpha: 0,
        duration: 150,
        ease: 'Power2.easeOut',
        onComplete: () => {
          if (this.currentTooltip) {
            this.currentTooltip.destroy();
            this.currentTooltip = null;
          }
        }
      });
    }
  }

  private createBackButton(): void {
    const screenHeight = this.cameras.main.height;
    
    const buttonText = "Leave Shop";
    const baseWidth = 200; // Increased from 150
    const textWidth = buttonText.length * 12; // Increased per character width
    const buttonWidth = Math.max(baseWidth, textWidth + 40); // Increased padding
    const buttonHeight = 50;
    
    const backButton = this.add.container(50 + buttonWidth/2, screenHeight - 50);
    
    // Create shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-buttonWidth/2 + 3, -buttonHeight/2 + 3, buttonWidth, buttonHeight, 12);
    
    // Create button background with prologue/combat double border design
    const outerBorder = this.add.graphics();
    outerBorder.lineStyle(2, 0x77888C);
    outerBorder.strokeRoundedRect(-buttonWidth/2 - 4, -buttonHeight/2 - 4, buttonWidth + 8, buttonHeight + 8, 12);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x150E10, 0.9);
    bg.lineStyle(2, 0x77888C, 0.8);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
    
    // Inner highlight
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(1, 0x77888C, 0.3);
    innerGlow.strokeRoundedRect(-buttonWidth/2 + 2, -buttonHeight/2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
    
    // Button text with prologue/combat styling
    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    backButton.add([shadow, outerBorder, bg, innerGlow, text]);
    
    // Set depth
    backButton.setDepth(2000);
    
    // Make interactive
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Enhanced hover effects with prologue/combat theme
    backButton.on("pointerover", () => {
      this.tweens.add({
        targets: backButton,
        scale: 1.05,
        duration: 200,
        ease: 'Power2.easeOut'
      });
      
      // Enhanced styling on hover
      bg.clear();
      bg.fillStyle(0x150E10, 1);
      bg.lineStyle(2, 0x77888C, 1);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      
      text.setColor("#ffffff");
    });
    
    backButton.on("pointerout", () => {
      this.tweens.add({
        targets: backButton,
        scale: 1,
        duration: 200,
        ease: 'Power2.easeOut'
      });
      
      // Reset styling
      bg.clear();
      bg.fillStyle(0x150E10, 0.9);
      bg.lineStyle(2, 0x77888C, 0.8);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      
      text.setColor("#77888C");
    });
    
    backButton.on("pointerdown", () => {
      // Clean up any remaining tooltips
      this.hideItemTooltip();
      
      // Save player data back to GameState before leaving
      const gameState = GameState.getInstance();
      gameState.updatePlayerData(this.player);
      gameState.completeCurrentNode(true);
      
      // Manually call the Overworld resume method to reset movement flags
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop();
      this.scene.resume("Overworld");
    });
  }

  private showItemDetails(item: ShopItem): void {
    // Clean up any tooltips first
    this.hideItemTooltip();
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(2000);
    
    // Create item details panel with modern Persona styling
    const panelWidth = 520;
    const panelHeight = 580;
    const panelX = this.cameras.main.width / 2;
    const panelY = this.cameras.main.height / 2;
    
    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);
    
    // Panel shadow for depth
    const panelShadow = this.add.graphics();
    panelShadow.fillStyle(0x000000, 0.4);
    panelShadow.fillRoundedRect(-panelWidth/2 + 8, -panelHeight/2 + 8, panelWidth, panelHeight, 20);
    
    // Main panel background with shop theme (matching #77888C color scheme)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x150E10, 0.95); // Match shop background
    panelBg.lineStyle(3, 0x77888C, 0.9); // Match shop border color
    panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    
    // Inner highlight for premium feel
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0x77888C, 0.4); // Match shop accent color
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 4, -panelHeight/2 + 4, panelWidth - 8, panelHeight - 8, 16);
    
    // Header section with shop theme
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x77888C, 0.2); // Subtle shop color background
    headerBg.lineStyle(1, 0x77888C, 0.6);
    headerBg.fillRoundedRect(-panelWidth/2 + 12, -panelHeight/2 + 12, panelWidth - 24, 80, 12);
    headerBg.strokeRoundedRect(-panelWidth/2 + 12, -panelHeight/2 + 12, panelWidth - 24, 80, 12);
    
    // Item emoji with enhanced styling and proper container
    const emojiContainer = this.add.graphics();
    emojiContainer.fillStyle(0x150E10, 0.8); // Match shop background
    emojiContainer.fillRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    emojiContainer.lineStyle(2, 0x77888C, 0.8); // Shop border color
    emojiContainer.strokeRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    
    const emoji = this.add.text(-panelWidth/2 + 60, -panelHeight/2 + 60, item.emoji, {
      fontSize: 40,
    }).setOrigin(0.5, 0.5);
    emoji.setShadow(2, 2, '#1a1625', 4, false, true);
    
    // Item name with proper alignment and shop theme colors
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, item.name.toUpperCase(), {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#77888C", // Match shop accent color
      fontStyle: "bold"
    }).setOrigin(0, 0);
    name.setShadow(2, 2, '#000000', 4, false, true);
    
    // Price display with shop theme
    const priceBg = this.add.graphics();
    priceBg.fillStyle(0x150E10, 0.9); // Match shop background
    priceBg.lineStyle(2, 0x77888C, 0.8); // Match shop border
    priceBg.fillRoundedRect(-80, -panelHeight/2 + 110, 160, 45, 12);
    priceBg.strokeRoundedRect(-80, -panelHeight/2 + 110, 160, 45, 12);
    
    let priceEmoji;
    if (item.currency === "ginto") {
      priceEmoji = "💰";
    } else {
      priceEmoji = "💎";
    }
    
    const priceLabel = this.add.text(0, -panelHeight/2 + 125, "PRICE", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C", // Match shop accent color
    }).setOrigin(0.5, 0.5);
    
    const price = this.add.text(0, -panelHeight/2 + 140, `${item.price} ${priceEmoji}`, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#ffffff", // White for better contrast
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    price.setShadow(1, 1, '#000000', 2, false, true);
    
    // Content sections with shop theme
    const contentStartY = -panelHeight/2 + 200;
    
    // Description section with shop styling
    const descSection = this.add.graphics();
    descSection.fillStyle(0x77888C, 0.15); // Subtle shop color background
    descSection.lineStyle(1, 0x77888C, 0.3);
    descSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    descSection.strokeRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    
    const descTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 15, "DESCRIPTION", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const description = this.add.text(0, contentStartY + 45, item.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#cccccc", // Light gray for readability
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Lore section with shop styling
    const loreSection = this.add.graphics();
    loreSection.fillStyle(0x77888C, 0.1); // Even more subtle
    loreSection.lineStyle(1, 0x77888C, 0.2);
    loreSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    loreSection.strokeRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    
    const loreTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 135, "LORE", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const lore = this.getItemLore(item);
    const loreText = this.add.text(0, contentStartY + 165, lore, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#aaaaaa", // Light gray for lore text
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Persona 5 style close button - inside panel, top-right corner
    const closeBtn = this.add.container(panelWidth/2 - 40, -panelHeight/2 + 40);
    const closeBg = this.add.graphics();
    closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
    closeBg.lineStyle(2, 0xfca5a5, 0.8);
    closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
    closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    
    const closeText = this.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff",
    }).setOrigin(0.5, 0.5);
    closeText.setShadow(1, 1, '#000000', 2, false, true);
    
    closeBtn.add([closeBg, closeText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on("pointerdown", () => {
      // Smooth exit animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
        }
      });
    });
    closeBtn.on("pointerover", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1.1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xf87171, 0xef4444, 0xdc2626, 0xb91c1c, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 1);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    closeBtn.on("pointerout", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 0.8);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    // Modern buy button with shop theme - positioned at bottom
    const buyBtn = this.add.container(0, panelHeight/2 - 80);
    const buyBg = this.add.graphics();
    buyBg.fillStyle(0x150E10, 0.9); // Match shop background
    buyBg.lineStyle(3, 0x77888C, 0.8); // Match shop border
    buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
    buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
    
    const buyInnerGlow = this.add.graphics();
    buyInnerGlow.lineStyle(1, 0x77888C, 0.3); // Shop accent
    buyInnerGlow.strokeRoundedRect(-118, -23, 236, 46, 10);
    
    const buyText = this.add.text(0, 0, "PURCHASE ITEM", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    buyText.setShadow(2, 2, '#000000', 3, false, true);
    
    buyBtn.add([buyBg, buyInnerGlow, buyText]);
    buyBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -25, 240, 50), Phaser.Geom.Rectangle.Contains);
    buyBtn.on("pointerdown", () => {
      // Clean up panel with animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          // Proceed with purchase
          this.buyItem(item);
        }
      });
    });
    buyBtn.on("pointerover", () => {
      this.tweens.add({
        targets: buyBtn,
        scale: 1.05,
        duration: 150,
        ease: 'Power2'
      });
      buyBg.clear();
      buyBg.fillStyle(0x150E10, 1); // Slightly brighter on hover
      buyBg.lineStyle(3, 0x77888C, 1); // Full opacity border on hover
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
      buyText.setColor("#ffffff"); // White text on hover
    });
    buyBtn.on("pointerout", () => {
      this.tweens.add({
        targets: buyBtn,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
      buyBg.clear();
      buyBg.fillStyle(0x150E10, 0.9); // Return to normal
      buyBg.lineStyle(3, 0x77888C, 0.8); // Return to normal border
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
      buyText.setColor("#77888C"); // Return to shop accent color
    });
    
    // Assemble the modern panel
    panel.add([panelShadow, panelBg, innerHighlight, headerBg, emojiContainer, emoji, name, 
              priceBg, priceLabel, price, descSection, descTitle, description, 
              loreSection, loreTitle, loreText, closeBtn, buyBtn]);
              
    // Entrance animation
    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  private getItemLore(item: ShopItem): string {
    // Return lore based on item name
    switch(item.item.id) {
      case "earthwardens_plate":
        return "Forged by the ancient Earthwardens who protected the first settlements from natural disasters. This mystical armor channels the strength of the mountains themselves, providing unwavering protection to those who wear it.";
      case "swift_wind_agimat":
        return "An enchanted talisman blessed by the spirits of the wind. It enhances the agility of its bearer, allowing them to move with the swiftness of the breeze and react faster than the eye can see.";
      case "ember_fetish":
        return "A relic imbued with the essence of volcanic fire. When the bearer's defenses are low, the fetish awakens and grants the fury of the forge, empowering them with the strength of molten rock.";
      case "merchants_scale":
        return "A mystical scale once used by the legendary Merchant Kings of the ancient trade routes. It bends the laws of commerce in favor of its owner, making all transactions more favorable.";
      case "babaylans_talisman":
        return "A sacred artifact of the Babaylan, the mystical shamans of old. This talisman connects the wearer to ancestral wisdom, allowing them to see the hidden patterns in all things.";
      case "ancestral_blade":
        return "A weapon passed down through generations of warrior families. When wielded with skill, it channels the spirits of ancestors who guide each strike with supernatural precision.";
      case "tidal_amulet":
        return "Born from the heart of the ocean, this amulet pulses with the rhythm of the tides. It grants the wearer the restorative power of the sea, healing their wounds with each passing moment.";
      case "bargain_talisman":
        return "A mysterious artifact that embodies the concept of fortune. Once per act, it can manifest incredible luck, allowing its bearer to acquire powerful items without cost.";
      case "lucky_charm":
        return "A small token blessed by fate itself. Those who carry it seem to attract good fortune, finding coins and opportunities where others see only obstacles.";
      case "echo_ancestors":
        return "A divine relic that channels the power of the ancestral spirits. It allows the bearer to achieve the impossible - forming a Five of a Kind, the rarest of all poker hands.";
      case "diwatas_crown":
        return "A magnificent crown worn by the Diwata, the celestial beings who watch over the mortal realm. It grants divine protection and enhances the natural abilities of its wearer.";
      case "stone_golem_heart":
        return "The crystallized heart of an ancient stone golem. It grants the endurance of the mountains themselves, increasing the life force of those who possess it.";
      default:
        return "This mystical artifact holds ancient power. Its origins are shrouded in mystery, but its effects are undeniable.";
    }
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
    
    if (item.currency === "diamante" && this.player.diamante < item.price) {
      this.showMessage("Not enough Diamante!", "#ff4757");
      return;
    }
    
    // Show confirmation dialog before purchase
    this.showPurchaseConfirmation(item);
  }
  
  private showPurchaseConfirmation(item: ShopItem): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(1000);
    
    // Create confirmation dialog
    const dialogWidth = 400;
    const dialogHeight = 200;
    const dialog = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(1001);
    
    // Dialog background with enhanced styling
    const dialogBg = this.add.graphics();
    dialogBg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.95);
    dialogBg.lineStyle(3, 0x57606f, 1);
    dialogBg.fillRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    dialogBg.strokeRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    
    // Dialog title
    const title = this.add.text(0, -dialogHeight/2 + 30, "Confirm Purchase", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#e8eced",
    }).setOrigin(0.5);
    title.setShadow(2, 2, '#000000', 3, false, true);
    
    // Item name
    const itemName = this.add.text(0, -20, item.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffd93d",
    }).setOrigin(0.5);
    
    // Price
    let priceColor;
    let priceEmoji;
    if (item.currency === "ginto") {
      priceColor = "#ffd93d";
      priceEmoji = "💰";
    } else if (item.currency === "diamante") {
      priceColor = "#00ffff";
      priceEmoji = "💎";
    } else {
      priceColor = "#4ecdc4";
      priceEmoji = "💎";
    }
    const price = this.add.text(0, 10, `Price: ${item.price} ${priceEmoji}`, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: priceColor,
    }).setOrigin(0.5);
    
    // Confirm button
    const confirmBtn = this.add.container(-100, dialogHeight/2 - 40);
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x2ed573, 0.9);
    confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const confirmText = this.add.text(0, 0, "Buy", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    confirmBtn.add([confirmBg, confirmText]);
    confirmBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    confirmBtn.on("pointerdown", () => {
      // Clean up dialog
      overlay.destroy();
      dialog.destroy();
      
      // Proceed with purchase
      this.proceedWithPurchase(item);
    });
    confirmBtn.on("pointerover", () => {
      confirmBg.clear();
      confirmBg.fillStyle(0x3ed583, 0.9);
      confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    confirmBtn.on("pointerout", () => {
      confirmBg.clear();
      confirmBg.fillStyle(0x2ed573, 0.9);
      confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    
    // Cancel button
    const cancelBtn = this.add.container(100, dialogHeight/2 - 40);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0xff4757, 0.9);
    cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const cancelText = this.add.text(0, 0, "Cancel", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    cancelBtn.add([cancelBg, cancelText]);
    cancelBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    cancelBtn.on("pointerdown", () => {
      // Clean up dialog
      overlay.destroy();
      dialog.destroy();
    });
    cancelBtn.on("pointerover", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff6b81, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    cancelBtn.on("pointerout", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff4757, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    
    dialog.add([dialogBg, title, itemName, price, confirmBtn, cancelBtn]);
  }
  
  private proceedWithPurchase(item: ShopItem): void {
    // Deduct currency
    if (item.currency === "ginto") {
      this.player.ginto -= item.price;
    } else if (item.currency === "diamante") {
      this.player.diamante -= item.price;
    }
    
    // Add relic to player
    if (item.type === "relic") {
      this.player.relics.push(item.item as Relic);
    }
    
    // Update UI with new currency format
    this.healthText.setText(`Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`);
    this.gintoText.setText(`${this.player.ginto}`);
    this.diamanteText.setText(`${this.player.diamante}`);
    
    // Show success message with animation
    this.showMessage(`Purchased ${item.name}!`, "#2ed573");
    
    // Update the purchased item button with better visual feedback
    const itemIndex = this.shopItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      const button = this.relicButtons[itemIndex];
      if (button) {
        // Animate the button
        this.tweens.add({
          targets: button,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Dim the button and remove interactivity
            const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics;
            if (slotBg) {
              slotBg.clear();
              slotBg.fillGradientStyle(0x1a1d26, 0x1a1d26, 0x0a0d16, 0x0a0d16, 0.7);
              slotBg.lineStyle(2, 0x3a3d3f, 1);
              slotBg.fillRoundedRect(-45, -45, 90, 90, 8);
              slotBg.strokeRoundedRect(-45, -45, 90, 90, 8);
            }
            button.disableInteractive();
            button.setActive(false);
            
            // Add a visual indicator that the item is owned with better styling
            const ownedIndicator = this.add.text(0, 0, "✓ OWNED", {
              fontFamily: "dungeon-mode-inverted",
              fontSize: 14,
              color: "#2ed573",
              fontStyle: "bold"
            }).setOrigin(0.5);
            ownedIndicator.setShadow(1, 1, '#000000', 2, false, true);
            button.add(ownedIndicator);
          }
        });
      }
    }
  }

  private showMessage(message: string, color: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Remove any existing message
    this.children.list.forEach((child: any) => {
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
    
    // Add shadow for better visibility
    messageText.setShadow(2, 2, '#000000', 3, false, true);
    
    // Add entrance animation
    messageText.setScale(0.1);
    this.tweens.add({
      targets: messageText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Auto-remove after 2 seconds with exit animation
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: messageText,
        scale: 0.1,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          messageText.destroy();
        }
      });
    });
  }

  /**\n   * Handle scene resize\n   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createBackgroundElements();
    this.createCurrencyDisplay();
    this.createCategorizedInventoryUI();
    this.createTooltipBox();
    this.createBackButton();
  }

}
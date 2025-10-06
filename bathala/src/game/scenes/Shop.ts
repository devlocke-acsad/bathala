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
    this.cameras.main.setBackgroundColor(0x0a0a0f);

    // Persona-style fast transition effect
    this.createPersonaTransition();

    // Create animated background elements
    this.createBackgroundElements();

    // Create modern title section
    const screenWidth = this.cameras.main.width;
    
    // Title background panel with dark violet theme
    const titlePanel = this.add.graphics();
    titlePanel.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.9);
    titlePanel.fillRoundedRect(screenWidth/2 - 200, 10, 400, 60, 12);
    titlePanel.lineStyle(2, 0x7c3aed, 0.8);
    titlePanel.strokeRoundedRect(screenWidth/2 - 200, 10, 400, 60, 12);
    
    // Main title with enhanced styling
    const title = this.add.text(
      screenWidth / 2,
      40,
      "MYSTERIOUS MERCHANT",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 28,
        color: "#e9d5ff",
        align: "center",
      }
    ).setOrigin(0.5);
    title.setShadow(3, 3, '#1a1625', 6, false, true);
    
    // Subtitle
    const subtitle = this.add.text(
      screenWidth / 2,
      65,
      "• Rare Relics & Mystical Artifacts •",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#a78bfa",
        align: "center",
      }
    ).setOrigin(0.5);
    
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

    // Listen for scene shutdown to clean up tooltips
    this.events.on('shutdown', this.cleanup, this);
  }

  private cleanup(): void {
    // Clean up any remaining tooltips
    this.hideModernTooltip();
    
    // Remove event listeners
    this.scale.off('resize', this.handleResize, this);
    this.events.off('shutdown', this.cleanup, this);
  }

  private createBackgroundElements(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create a sophisticated dark violet gradient background
    const bgOverlay = this.add.graphics();
    bgOverlay.fillGradientStyle(0x0a0a0f, 0x1a1625, 0x2d1b69, 0x1e1b4b, 1);
    bgOverlay.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add mystical geometric pattern
    for (let i = 0; i < 12; i++) {
      const size = Phaser.Math.Between(15, 45);
      const x = Phaser.Math.Between(0, screenWidth);
      const y = Phaser.Math.Between(0, screenHeight);
      
      const shape = this.add.graphics();
      shape.lineStyle(1, 0x7c3aed, 0.15);
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
    
    // Create mystical floating particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, screenWidth),
        Phaser.Math.Between(0, screenHeight),
        Phaser.Math.Between(1, 2),
        0x7c3aed,
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
    
    // Add corner decorative elements with violet theme
    const cornerSize = 40;
    
    // Top-left corner
    const topLeft = this.add.graphics();
    topLeft.lineStyle(3, 0x7c3aed, 0.8);
    topLeft.beginPath();
    topLeft.moveTo(20, cornerSize + 20);
    topLeft.lineTo(20, 20);
    topLeft.lineTo(cornerSize + 20, 20);
    topLeft.strokePath();
    
    // Top-right corner
    const topRight = this.add.graphics();
    topRight.lineStyle(3, 0x7c3aed, 0.8);
    topRight.beginPath();
    topRight.moveTo(screenWidth - cornerSize - 20, 20);
    topRight.lineTo(screenWidth - 20, 20);
    topRight.lineTo(screenWidth - 20, cornerSize + 20);
    topRight.strokePath();
    
    // Bottom-left corner
    const bottomLeft = this.add.graphics();
    bottomLeft.lineStyle(3, 0x7c3aed, 0.8);
    bottomLeft.beginPath();
    bottomLeft.moveTo(20, screenHeight - cornerSize - 20);
    bottomLeft.lineTo(20, screenHeight - 20);
    bottomLeft.lineTo(cornerSize + 20, screenHeight - 20);
    bottomLeft.strokePath();
    
    // Bottom-right corner
    const bottomRight = this.add.graphics();
    bottomRight.lineStyle(3, 0x7c3aed, 0.8);
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
    
    // Create modern currency panel with dark violet theme
    const currencyPanel = this.add.graphics();
    currencyPanel.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.9);
    currencyPanel.lineStyle(2, 0x7c3aed, 0.7);
    currencyPanel.fillRoundedRect(screenWidth - 280, 85, 260, 80, 10);
    currencyPanel.strokeRoundedRect(screenWidth - 280, 85, 260, 80, 10);
    
    // Health display with proper alignment
    this.healthText = this.add.text(
      screenWidth - 150,
      105,
      `Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`,
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 16,
        color: "#f87171",
      }
    ).setOrigin(0.5, 0.5);
    this.healthText.setShadow(1, 1, '#7f1d1d', 2, false, true);
    
    // Currency section with proper centering
    const currencyY = 135;
    
    // Ginto section - left aligned within currency area
    const gintoX = screenWidth - 200;
    const gintoIcon = this.add.text(gintoX - 15, currencyY, "💰", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.gintoText = this.add.text(gintoX + 15, currencyY, `${this.player.ginto}`, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#fbbf24",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    this.gintoText.setShadow(1, 1, '#92400e', 2, false, true);
    
    // Diamante section - right aligned within currency area
    const diamanteX = screenWidth - 100;
    const diamanteIcon = this.add.text(diamanteX - 15, currencyY, "�", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.diamanteText = this.add.text(diamanteX + 15, currencyY, `${this.player.diamante}`, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#06b6d4",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    this.diamanteText.setShadow(1, 1, '#164e63', 2, false, true);
    
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

  private createInventoryUI(): void {
    const screenWidth = this.cameras.main.width;
    
    // Modern Persona-style dimensions with better spacing
    const cardWidth = 120;
    const cardHeight = 140;
    const itemsPerRow = 5; // Reduced for better visual spacing
    const spacingX = 40;
    const spacingY = 50;
    const startX = (screenWidth - (itemsPerRow * (cardWidth + spacingX) - spacingX)) / 2;
    const startY = 180; // Adjusted for new layout

    this.relicButtons = [];

    this.shopItems.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      const button = this.add.container(x, y);
      
      // Check if player already owns this relic
      const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
      
      // Create shadow effect
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-cardWidth/2 + 4, -cardHeight/2 + 4, cardWidth, cardHeight, 12);
      
      // Main card background with dark violet gradient
      const cardBg = this.add.graphics();
      if (isOwned) {
        // Sophisticated owned state with muted violet
        cardBg.fillGradientStyle(0x2a2a2a, 0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0.8);
        cardBg.lineStyle(2, 0x444444, 0.6);
      } else {
        // Dark violet theme for available items
        cardBg.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.95);
        cardBg.lineStyle(3, 0x7c3aed, 0.8);
      }
      cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      
      // Inner highlight for depth
      const innerHighlight = this.add.graphics();
      if (!isOwned) {
        innerHighlight.lineStyle(1, 0xa78bfa, 0.4);
        innerHighlight.strokeRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight - 4, 10);
      }
      
      // Icon area background
      const iconArea = this.add.graphics();
      if (isOwned) {
        iconArea.fillStyle(0x374151, 0.6);
      } else {
        iconArea.fillGradientStyle(0x4c1d95, 0x3730a3, 0x2d1b69, 0x1e1b4b, 0.4);
      }
      iconArea.fillRoundedRect(-cardWidth/2 + 8, -cardHeight/2 + 8, cardWidth - 16, 70, 8);
      
      // Item emoji with enhanced styling and proper centering
      const emoji = this.add.text(0, -cardHeight/2 + 43, item.emoji, {
        fontSize: 42,
      }).setOrigin(0.5, 0.5);
      if (!isOwned) {
        emoji.setShadow(2, 2, '#1a1625', 4, false, true);
      } else {
        emoji.setShadow(1, 1, '#000000', 2, false, true);
        emoji.setAlpha(0.6);
      }
      
      // Currency badge with proper positioning
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
      
      // Price section with proper alignment
      const priceArea = this.add.graphics();
      priceArea.fillStyle(0x1f2937, isOwned ? 0.5 : 0.8);
      priceArea.fillRoundedRect(-cardWidth/2 + 8, cardHeight/2 - 35, cardWidth - 16, 27, 6);
      
      const priceText = this.add.text(0, cardHeight/2 - 21, `${item.price}`, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 16,
        color: isOwned ? "#9ca3af" : "#f9fafb",
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
          fontFamily: "dungeon-mode-inverted",
          fontSize: 18,
          color: "#10b981",
          fontStyle: "bold"
        }).setOrigin(0.5);
        ownedText.setShadow(2, 2, '#000000', 3, false, true);
        
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
          // Smooth hover animation with glow effect
          this.tweens.add({
            targets: button,
            scale: 1.08,
            duration: 200,
            ease: 'Power2.easeOut'
          });
          
          // Remove any existing glow first
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          // Add new glow effect with violet theme
          hoverGlow = this.add.graphics();
          hoverGlow.lineStyle(4, 0x7c3aed, 0.8);
          hoverGlow.strokeRoundedRect(-cardWidth/2 - 2, -cardHeight/2 - 2, cardWidth + 4, cardHeight + 4, 14);
          button.addAt(hoverGlow, 1); // Add after shadow but before card
          
          // Enhanced card styling on hover with violet theme
          cardBg.clear();
          cardBg.fillGradientStyle(0x4c1d95, 0x3730a3, 0x2d1b69, 0x1e1b4b, 1);
          cardBg.lineStyle(3, 0xa78bfa, 1);
          cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
          cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
          
          // Show elegant tooltip with item name
          this.showModernTooltip(item.name, button.x, button.y - cardHeight/2 - 30);
        });
        
        button.on("pointerout", () => {
          // Smooth return animation
          this.tweens.add({
            targets: button,
            scale: 1,
            duration: 200,
            ease: 'Power2.easeOut'
          });
          
          // Remove glow effect properly
          if (hoverGlow) {
            hoverGlow.destroy();
            hoverGlow = null;
          }
          
          // Reset card styling to violet theme
          cardBg.clear();
          cardBg.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.95);
          cardBg.lineStyle(3, 0x7c3aed, 0.8);
          cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
          cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
          
          // Hide tooltip
          this.hideModernTooltip();
        });
      }
      
      this.relicButtons.push(button);
    });
  }

  private createTooltipBox(): void {
    // Modern tooltip will be created dynamically
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
    this.tooltipBox.setDepth(3000); // Ensure it's above everything
  }

  private showModernTooltip(itemName: string, x: number, y: number): void {
    // Always remove existing tooltip immediately
    this.hideModernTooltip();
    
    // Create modern Persona-style tooltip
    const tooltip = this.add.container(x, y);
    tooltip.setDepth(3000);
    tooltip.setName('shopTooltip'); // Add name for easier identification
    
    // Measure text to size tooltip appropriately
    const tempText = this.add.text(0, 0, itemName, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff"
    });
    const textBounds = tempText.getBounds();
    const tooltipWidth = textBounds.width + 20;
    const tooltipHeight = 35;
    tempText.destroy();
    
    // Tooltip shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.5);
    shadow.fillRoundedRect(-tooltipWidth/2 + 2, -tooltipHeight/2 + 2, tooltipWidth, tooltipHeight, 8);
    
    // Tooltip background with dark violet gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.95);
    bg.lineStyle(2, 0x7c3aed, 0.8);
    bg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 8);
    bg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 8);
    
    // Inner glow with violet theme
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(1, 0xa78bfa, 0.3);
    innerGlow.strokeRoundedRect(-tooltipWidth/2 + 2, -tooltipHeight/2 + 2, tooltipWidth - 4, tooltipHeight - 4, 6);
    
    // Tooltip text with proper styling
    const text = this.add.text(0, 0, itemName, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#e9d5ff"
    }).setOrigin(0.5, 0.5);
    text.setShadow(1, 1, '#1a1625', 2, false, true);
    
    tooltip.add([shadow, bg, innerGlow, text]);
    
    // Smooth entrance animation
    tooltip.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: tooltip,
      scale: 1,
      alpha: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });
    
    // Store reference for cleanup
    (this as any).currentTooltip = tooltip;
  }

  private hideModernTooltip(): void {
    // Stop any existing tweens on the current tooltip
    const currentTooltip = (this as any).currentTooltip;
    if (currentTooltip && currentTooltip.active) {
      this.tweens.killTweensOf(currentTooltip);
      currentTooltip.destroy();
      (this as any).currentTooltip = null;
    }
    
    // Also clean up any orphaned tooltips by name
    const orphanedTooltips = this.children.list.filter((child: any) => 
      child.name === 'shopTooltip' && child !== currentTooltip
    );
    orphanedTooltips.forEach((tooltip: any) => {
      this.tweens.killTweensOf(tooltip);
      tooltip.destroy();
    });
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
    
    // Create button background with improved styling
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0xff4757, 0.9);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
    buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
    
    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    backButton.add([buttonBg, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Clean up any remaining tooltips
      this.hideModernTooltip();
      
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
    
    backButton.on("pointerover", () => {
      // Highlight button on hover
      buttonBg.clear();
      buttonBg.fillStyle(0xff6b81, 0.9);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
    });
    backButton.on("pointerout", () => {
      // Reset button style
      buttonBg.clear();
      buttonBg.fillStyle(0xff4757, 0.9);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 8);
    });
  }

  private showItemDetails(item: ShopItem): void {
    // Clean up any tooltips first
    this.hideModernTooltip();
    
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
    
    // Main panel background with dark violet gradient
    const panelBg = this.add.graphics();
    panelBg.fillGradientStyle(0x2d1b69, 0x1e1b4b, 0x1a1625, 0x0f0f23, 0.98);
    panelBg.lineStyle(3, 0x7c3aed, 0.9);
    panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    
    // Inner highlight for premium feel
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0xa78bfa, 0.4);
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 4, -panelHeight/2 + 4, panelWidth - 8, panelHeight - 8, 16);
    
    // Header section with violet theme
    const headerBg = this.add.graphics();
    headerBg.fillGradientStyle(0x4c1d95, 0x3730a3, 0x2d1b69, 0x1e1b4b, 0.4);
    headerBg.fillRoundedRect(-panelWidth/2 + 12, -panelHeight/2 + 12, panelWidth - 24, 80, 12);
    
    // Item emoji with enhanced styling and proper container
    const emojiContainer = this.add.graphics();
    emojiContainer.fillStyle(0x2d1b69, 0.8);
    emojiContainer.fillRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    emojiContainer.lineStyle(2, 0x7c3aed, 0.8);
    emojiContainer.strokeRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    
    const emoji = this.add.text(-panelWidth/2 + 60, -panelHeight/2 + 60, item.emoji, {
      fontSize: 40,
    }).setOrigin(0.5, 0.5);
    emoji.setShadow(2, 2, '#1a1625', 4, false, true);
    
    // Item name with proper alignment
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, item.name.toUpperCase(), {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#e9d5ff",
    }).setOrigin(0, 0);
    name.setShadow(2, 2, '#1a1625', 4, false, true);
    
    // Price display with proper centering and dark violet theme
    const priceBg = this.add.graphics();
    priceBg.fillGradientStyle(0x1a1625, 0x2d1b69, 0x0f0f23, 0x1a1625, 0.9);
    priceBg.lineStyle(2, 0x7c3aed, 0.8);
    priceBg.fillRoundedRect(-80, -panelHeight/2 + 110, 160, 45, 12);
    priceBg.strokeRoundedRect(-80, -panelHeight/2 + 110, 160, 45, 12);
    
    let priceEmoji;
    if (item.currency === "ginto") {
      priceEmoji = "💰";
    } else {
      priceEmoji = "💎";
    }
    
    const priceLabel = this.add.text(0, -panelHeight/2 + 125, "PRICE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 12,
      color: "#a78bfa",
    }).setOrigin(0.5, 0.5);
    
    const price = this.add.text(0, -panelHeight/2 + 140, `${item.price} ${priceEmoji}`, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#e9d5ff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    price.setShadow(1, 1, '#1a1625', 2, false, true);
    
    // Content sections with better spacing and violet theme
    const contentStartY = -panelHeight/2 + 200;
    
    // Description section with proper alignment and sizing
    const descSection = this.add.graphics();
    descSection.fillStyle(0x2d1b69, 0.3);
    descSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    
    const descTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 15, "DESCRIPTION", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#7c3aed",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const description = this.add.text(0, contentStartY + 45, item.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#d8b4fe",
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Lore section with proper alignment and sizing
    const loreSection = this.add.graphics();
    loreSection.fillStyle(0x2d1b69, 0.2);
    loreSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    
    const loreTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 135, "LORE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#34d399",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const lore = this.getItemLore(item);
    const loreText = this.add.text(0, contentStartY + 165, lore, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#c4b5fd",
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
    
    // Modern buy button with dark violet theme - positioned at bottom
    const buyBtn = this.add.container(0, panelHeight/2 - 80);
    const buyBg = this.add.graphics();
    buyBg.fillGradientStyle(0x7c3aed, 0x5b21b6, 0x4c1d95, 0x6d28d9, 0.95);
    buyBg.lineStyle(3, 0xa78bfa, 0.8);
    buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
    buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
    
    const buyInnerGlow = this.add.graphics();
    buyInnerGlow.lineStyle(1, 0xddd6fe, 0.3);
    buyInnerGlow.strokeRoundedRect(-118, -23, 236, 46, 10);
    
    const buyText = this.add.text(0, 0, "PURCHASE ITEM", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#f3e8ff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    buyText.setShadow(2, 2, '#1a1625', 3, false, true);
    
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
      buyBg.fillGradientStyle(0x8b5cf6, 0x7c3aed, 0x5b21b6, 0x4c1d95, 0.95);
      buyBg.lineStyle(3, 0xa78bfa, 1);
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
    });
    buyBtn.on("pointerout", () => {
      this.tweens.add({
        targets: buyBtn,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
      buyBg.clear();
      buyBg.fillGradientStyle(0x7c3aed, 0x5b21b6, 0x4c1d95, 0x6d28d9, 0.95);
      buyBg.lineStyle(3, 0xa78bfa, 0.8);
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
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
    this.createInventoryUI();
    this.createTooltipBox();
    this.createBackButton();
  }

  /**
   * Create Persona-style fast transition effect when entering the shop
   */
  private createPersonaTransition(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create multiple transition elements for layered effect
    
    // Flash overlay - quick white flash
    const flashOverlay = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth, screenHeight, 0xffffff)
      .setAlpha(0.9)
      .setDepth(9999);

    // Diagonal wipe elements - classic Persona style
    const wipeCount = 8;
    const wipeElements: Phaser.GameObjects.Graphics[] = [];
    
    for (let i = 0; i < wipeCount; i++) {
      const wipe = this.add.graphics();
      wipe.fillStyle(0x000000, 1);
      
      // Create diagonal stripe
      const stripeWidth = screenWidth / wipeCount;
      const x = i * stripeWidth;
      
      wipe.beginPath();
      wipe.moveTo(x, -100);
      wipe.lineTo(x + stripeWidth + 100, -100);
      wipe.lineTo(x + stripeWidth + 200, screenHeight + 100);
      wipe.lineTo(x + 100, screenHeight + 100);
      wipe.closePath();
      wipe.fillPath();
      
      wipe.setDepth(9998);
      wipeElements.push(wipe);
    }

    // Particle burst effect (if texture exists)
    let particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    try {
      particles = this.add.particles(screenWidth/2, screenHeight/2, 'whitePixel', {
        speed: { min: 200, max: 400 },
        scale: { start: 0.1, end: 0 },
        lifespan: 300,
        quantity: 15,
        alpha: { start: 0.8, end: 0 },
        tint: [0x7c3aed, 0xa78bfa, 0xe9d5ff]
      }).setDepth(9997);
    } catch (error) {
      // Create simple circle particles if whitePixel texture doesn't exist
      for (let i = 0; i < 15; i++) {
        const particle = this.add.graphics();
        particle.fillStyle(0x7c3aed, 0.8);
        particle.fillCircle(0, 0, 2);
        particle.setPosition(screenWidth/2, screenHeight/2);
        particle.setDepth(9997);
        
        const angle = (i / 15) * Math.PI * 2;
        const speed = 200 + Math.random() * 200;
        
        this.tweens.add({
          targets: particle,
          x: screenWidth/2 + Math.cos(angle) * speed,
          y: screenHeight/2 + Math.sin(angle) * speed,
          alpha: 0,
          scale: 0,
          duration: 300,
          onComplete: () => particle.destroy()
        });
      }
    }

    // Sound effect (if you have audio)
    // this.sound.play('personaTransition', { volume: 0.3 });

    // Animation sequence
    this.tweens.add({
      targets: flashOverlay,
      alpha: 0,
      duration: 150,
      ease: 'Power2.easeOut',
      onComplete: () => {
        flashOverlay.destroy();
      }
    });

    // Staggered wipe animation
    wipeElements.forEach((wipe, index) => {
      wipe.x = -screenWidth;
      this.tweens.add({
        targets: wipe,
        x: screenWidth + 200,
        duration: 600,
        delay: index * 50,
        ease: 'Power3.easeOut',
        onComplete: () => {
          if (index === wipeElements.length - 1) {
            // Clean up all wipe elements when the last one finishes
            wipeElements.forEach(w => w.destroy());
            if (particles) {
              particles.destroy();
            }
          }
        }
      });
    });

    // Camera shake for impact
    this.cameras.main.shake(200, 0.01);

    // Add encounter text overlay
    this.time.delayedCall(400, () => {
      const encounterText = this.add.text(screenWidth/2, screenHeight/2 - 100, "MYSTERIOUS MERCHANT", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 36,
        color: "#e9d5ff",
        stroke: "#1a1625",
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(9996).setAlpha(0);

      this.tweens.add({
        targets: encounterText,
        alpha: 1,
        scale: 1.1,
        duration: 300,
        ease: 'Back.easeOut',
        yoyo: true,
        onComplete: () => {
          this.tweens.add({
            targets: encounterText,
            alpha: 0,
            duration: 500,
            delay: 800,
            onComplete: () => {
              encounterText.destroy();
            }
          });
        }
      });
    });
  }
}
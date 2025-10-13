import { Scene } from "phaser";
import { POKER_HAND_LIST } from "../../data/poker/PokerHandReference";

type Tab = 'poker' | 'elements';

export class PokerHandReference extends Scene {
  private pokerHandsContainer!: Phaser.GameObjects.Container;
  private elementalEffectsContainer!: Phaser.GameObjects.Container;
  private activeTab: Tab = 'poker';
  private pokerTabButton!: Phaser.GameObjects.Container;
  private elementsTabButton!: Phaser.GameObjects.Container;
  private currentPokerPage: number = 0;
  private totalPokerPages: number = 0;

  constructor() {
    super({ key: "PokerHandReference" });
  }

  create() {
    // Dark overlay background - much darker for better contrast
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.96).setDepth(0);

    // Main content background panel with clean double border
    const panelWidth = this.cameras.main.width * 0.92;
    const panelHeight = this.cameras.main.height * 0.88;
    
    const outerBorder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 + 30, panelWidth + 6, panelHeight + 6, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    outerBorder.setDepth(1);
    
    const panelBg = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 + 30, panelWidth, panelHeight, 0x0a0a0a, 0.95);
    panelBg.setDepth(1);

    // Title - clean, no stroke, positioned higher
    this.add.text(this.cameras.main.width / 2, 60, "GAME REFERENCE", { 
      fontFamily: "dungeon-mode", 
      fontSize: 32, 
      color: "#FFD700", 
      align: "center"
    }).setOrigin(0.5).setDepth(25);

    this.createBackButton();
    this.createTabs();
    this.createPokerHandContent();
    this.createElementalEffectsContent();
    this.showTab('poker');
  }

  private createTabs(): void {
    const tabY = 135; // Moved down to be inside container
    this.pokerTabButton = this.createTabButton("Poker Hands", this.cameras.main.width / 2 - 120, tabY, () => this.showTab('poker'));
    this.elementsTabButton = this.createTabButton("Elements", this.cameras.main.width / 2 + 120, tabY, () => this.showTab('elements'));
  }

  private createTabButton(text: string, x: number, y: number, onClick: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y).setDepth(21);
    
    // Double border design matching game style
    const outerBorder = this.add.rectangle(0, 0, 214, 46, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    
    const bg = this.add.rectangle(0, 0, 210, 42, 0x150E10);
    bg.setStrokeStyle(2, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, 202, 34, undefined, 0);
    innerBorder.setStrokeStyle(1, 0x77888C, 0.6);
    
    const buttonText = this.add.text(0, 0, text, { 
      fontFamily: "dungeon-mode", 
      fontSize: 15, 
      color: "#77888C", 
      align: "center" 
    }).setOrigin(0.5);

    button.add([outerBorder, bg, innerBorder, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-107, -23, 214, 46), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", onClick);
    button.on("pointerover", () => {
      bg.setFillStyle(0x2a1a1f);
      buttonText.setColor("#E8ECED");
    });
    button.on("pointerout", () => {
        if (this.activeTab !== (text === "Poker Hands" ? 'poker' : 'elements')) {
            bg.setFillStyle(0x150E10);
            buttonText.setColor("#77888C");
        }
    });

    return button;
  }

  private showTab(tab: Tab): void {
    this.activeTab = tab;

    this.pokerHandsContainer.setVisible(tab === 'poker');
    this.elementalEffectsContainer.setVisible(tab === 'elements');

    if (tab === 'poker') {
        this.tweens.add({ targets: this.pokerHandsContainer, alpha: 1, duration: 300, ease: 'Power2' });
        this.elementalEffectsContainer.setAlpha(0);
    } else {
        this.tweens.add({ targets: this.elementalEffectsContainer, alpha: 1, duration: 300, ease: 'Power2' });
        this.pokerHandsContainer.setAlpha(0);
    }

    // Update button styles for active state
    const pokerBg = this.pokerTabButton.list[1] as Phaser.GameObjects.Rectangle;
    const elementsBg = this.elementsTabButton.list[1] as Phaser.GameObjects.Rectangle;
    const pokerText = this.pokerTabButton.list[3] as Phaser.GameObjects.Text;
    const elementsText = this.elementsTabButton.list[3] as Phaser.GameObjects.Text;

    if (tab === 'poker') {
      pokerBg.setFillStyle(0x2a1a1f);
      pokerText.setColor("#FFD700");
      elementsBg.setFillStyle(0x150E10);
      elementsText.setColor("#77888C");
    } else {
      elementsBg.setFillStyle(0x2a1a1f);
      elementsText.setColor("#FFD700");
      pokerBg.setFillStyle(0x150E10);
      pokerText.setColor("#77888C");
    }
  }

  private createPokerHandContent(): void {
    this.pokerHandsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 60);
    this.pokerHandsContainer.setDepth(10);
    
    // Pagination: 2 hands per page to prevent overflow
    const handsPerPage = 2;
    this.totalPokerPages = Math.ceil(POKER_HAND_LIST.length / handsPerPage);
    this.currentPokerPage = 0;
    
    // Create navigation arrows and page counter
    this.createPokerNavigation();
    
    // Render first page
    this.renderPokerPage(0);
  }
  
  private createPokerNavigation(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Previous button (left arrow) - positioned inside the panel
    const prevButton = this.createNavigationButton(
      -screenWidth * 0.35,
      screenHeight * 0.28,
      "◄",
      () => {
        if (this.currentPokerPage > 0) {
          this.currentPokerPage--;
          this.renderPokerPage(this.currentPokerPage);
          this.updateNavigationButtons();
        }
      }
    );
    (prevButton as any).isPrevButton = true;
    this.pokerHandsContainer.add(prevButton);
    
    // Next button (right arrow) - positioned inside the panel
    const nextButton = this.createNavigationButton(
      screenWidth * 0.35,
      screenHeight * 0.28,
      "►",
      () => {
        if (this.currentPokerPage < this.totalPokerPages - 1) {
          this.currentPokerPage++;
          this.renderPokerPage(this.currentPokerPage);
          this.updateNavigationButtons();
        }
      }
    );
    (nextButton as any).isNextButton = true;
    this.pokerHandsContainer.add(nextButton);
    
    // Page counter - positioned at bottom, centered
    const pageCounter = this.add.text(0, screenHeight * 0.28, `Page 1 / ${this.totalPokerPages}`, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);
    (pageCounter as any).isPageCounter = true;
    this.pokerHandsContainer.add(pageCounter);
  }
  
  private renderPokerPage(page: number): void {
    // Clear previous page content
    this.pokerHandsContainer.list
      .filter(item => (item as any).isPageContent)
      .forEach(item => item.destroy());
    
    const handsPerPage = 2;
    const startIndex = page * handsPerPage;
    const endIndex = Math.min(startIndex + handsPerPage, POKER_HAND_LIST.length);
    const pageHands = POKER_HAND_LIST.slice(startIndex, endIndex);
    
    const cardScale = 0.7; // Slightly smaller to prevent overflow
    const entryHeight = 260; // Increased spacing between entries for better separation
    const startY = -(pageHands.length - 1) * entryHeight / 2 - 70; // Adjusted for new tab position
    
    pageHands.forEach((handInfo, index) => {
      const currentY = startY + index * entryHeight;
      
      // Elegant single-layer background with gradient effect - TALLER with proper padding
      const gradientBg = this.add.rectangle(0, currentY, 820, 252, 0x1a1a1a, 0.92);
      gradientBg.setStrokeStyle(2, 0x8b4513, 0.7);
      (gradientBg as any).isPageContent = true;
      
      const innerAccent = this.add.rectangle(0, currentY, 810, 242, undefined, 0);
      innerAccent.setStrokeStyle(1, 0xcd853f, 0.4);
      (innerAccent as any).isPageContent = true;
      
      // Hand name - clean, bold, no stroke
      const handName = this.add.text(0, currentY - 95, handInfo.name.toUpperCase(), { 
        fontFamily: "dungeon-mode", 
        fontSize: 24, 
        color: "#FFD700", 
        align: "center"
      }).setOrigin(0.5);
      (handName as any).isPageContent = true;
      
      // Stats badges - cleaner, more spaced out with better spacing from title
      const statsY = currentY - 55;
      const statSpacing = 125;
      const startX = -statSpacing * 1.5;
      
      // Bonus badge (was "VALUE")
      const bonusBadge = this.createCleanStatBadge(startX, statsY, "BONUS", handInfo.bonus.toString(), "#FF6B6B");
      (bonusBadge as any).isPageContent = true;
      
      // Multiplier badge (was "ATTACK")
      const multiplierBadge = this.createCleanStatBadge(startX + statSpacing, statsY, "MULT", `${handInfo.multiplier}x`, "#FF9F43");
      (multiplierBadge as any).isPageContent = true;
      
      // Defense badge
      const defenseBadge = this.createCleanStatBadge(startX + statSpacing * 2, statsY, "DEFENSE", handInfo.defenseValue.toString(), "#54A0FF");
      (defenseBadge as any).isPageContent = true;
      
      // Special badge
      const specialBadge = this.createCleanStatBadge(startX + statSpacing * 3, statsY, "SPECIAL", handInfo.specialValue.toString(), "#A29BFE");
      (specialBadge as any).isPageContent = true;
      
      // Card visuals - properly sized and spaced
      const visualContainer = this.add.container(0, currentY + 20);
      this.addSampleCards(visualContainer, handInfo.handType, 0, cardScale);
      (visualContainer as any).isPageContent = true;

      // Description - clean, readable, well-spaced
      const howToMake = this.add.text(0, currentY + 86, handInfo.howToMake, { 
        fontFamily: "dungeon-mode", 
        fontSize: 13, 
        color: "#E8ECED", 
        wordWrap: { width: 780 }, 
        align: "center",
        lineSpacing: 2
      }).setOrigin(0.5);
      (howToMake as any).isPageContent = true;

      this.pokerHandsContainer.add([
        gradientBg, innerAccent,
        handName, bonusBadge, multiplierBadge, defenseBadge, specialBadge,
        visualContainer, howToMake
      ]);
    });
    
    this.updateNavigationButtons();
  }
  
  private createCleanStatBadge(x: number, y: number, label: string, value: string, color: string): Phaser.GameObjects.Container {
    const badge = this.add.container(x, y);
    
    // Clean background with subtle border
    const bg = this.add.rectangle(0, 0, 105, 36, 0x0a0a0a, 0.9);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(color).color, 0.6);
    
    const innerBg = this.add.rectangle(0, 0, 101, 32, 0x1a1a1a, 0.8);
    
    // Label text - smaller, uppercase, subtle
    const labelText = this.add.text(0, -9, label, {
      fontFamily: "dungeon-mode",
      fontSize: 8,
      color: "#888888",
      align: "center"
    }).setOrigin(0.5);
    
    // Value text - larger, colored, no stroke
    const valueText = this.add.text(0, 7, value, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: color,
      align: "center"
    }).setOrigin(0.5);
    
    badge.add([bg, innerBg, labelText, valueText]);
    return badge;
  }
  
  private updateNavigationButtons(): void {
    const prevButton = this.pokerHandsContainer.list.find(item => (item as any).isPrevButton);
    const nextButton = this.pokerHandsContainer.list.find(item => (item as any).isNextButton);
    const pageCounter = this.pokerHandsContainer.list.find(item => (item as any).isPageCounter) as Phaser.GameObjects.Text;
    
    if (prevButton) {
      (prevButton as any).setAlpha(this.currentPokerPage > 0 ? 1 : 0.3);
    }
    if (nextButton) {
      (nextButton as any).setAlpha(this.currentPokerPage < this.totalPokerPages - 1 ? 1 : 0.3);
    }
    if (pageCounter) {
      pageCounter.setText(`Page ${this.currentPokerPage + 1} / ${this.totalPokerPages}`);
    }
  }
  
  private createNavigationButton(
    x: number,
    y: number,
    symbol: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const bg = this.add.rectangle(0, 0, 60, 60, 0x150E10);
    bg.setStrokeStyle(3, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, 54, 54, undefined, 0);
    innerBorder.setStrokeStyle(2, 0x77888C);
    
    const text = this.add.text(0, 0, symbol, {
      fontFamily: "dungeon-mode",
      fontSize: 32,
      color: "#77888C",
      align: "center",
    }).setOrigin(0.5);
    
    button.add([bg, innerBorder, text]);
    button.setSize(80, 80);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-40, -40, 80, 80),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on("pointerover", () => {
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
    
    button.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      text.setColor("#77888C");
      this.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on("pointerdown", () => {
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

  private addSampleCards(container: Phaser.GameObjects.Container, handType: string, _cardWidth: number, cardScale: number) {
    const handInfo = POKER_HAND_LIST.find(h => h.handType === handType);
    if (!handInfo) return;

    let cards: {rank: string, suit: string}[] = [];
    switch (handType) {
        case 'high_card': cards = [{rank: '1', suit: 'Apoy'}]; break;
        case 'pair': cards = [{rank: '7', suit: 'Lupa'}, {rank: '7', suit: 'Lupa'}]; break;
        case 'two_pair': cards = [{rank: '5', suit: 'Hangin'}, {rank: '5', suit: 'Hangin'}, {rank: '11', suit: 'Tubig'}, {rank: '11', suit: 'Tubig'}]; break;
        case 'three_of_a_kind': cards = [{rank: '8', suit: 'Apoy'}, {rank: '8', suit: 'Apoy'}, {rank: '8', suit: 'Apoy'}]; break;
        case 'straight': cards = [{rank: '4', suit: 'Lupa'}, {rank: '5', suit: 'Lupa'}, {rank: '6', suit: 'Lupa'}, {rank: '7', suit: 'Lupa'}, {rank: '8', suit: 'Lupa'}]; break;
        case 'flush': cards = [{rank: '2', suit: 'Tubig'}, {rank: '5', suit: 'Tubig'}, {rank: '9', suit: 'Tubig'}, {rank: '11', suit: 'Tubig'}, {rank: '13', suit: 'Tubig'}]; break;
        case 'full_house': cards = [{rank: '3', suit: 'Apoy'}, {rank: '3', suit: 'Apoy'}, {rank: '3', suit: 'Apoy'}, {rank: '12', suit: 'Lupa'}, {rank: '12', suit: 'Lupa'}]; break;
        case 'four_of_a_kind': cards = [{rank: '10', suit: 'Hangin'}, {rank: '10', suit: 'Hangin'}, {rank: '10', suit: 'Hangin'}, {rank: '10', suit: 'Hangin'}]; break;
        case 'straight_flush': cards = [{rank: '6', suit: 'Apoy'}, {rank: '7', suit: 'Apoy'}, {rank: '8', suit: 'Apoy'}, {rank: '9', suit: 'Apoy'}, {rank: '10', suit: 'Apoy'}]; break;
        case 'royal_flush': cards = [{rank: '1', suit: 'Apoy'}, {rank: '11', suit: 'Apoy'}, {rank: '12', suit: 'Apoy'}, {rank: '13', suit: 'Apoy'}, {rank: '10', suit: 'Apoy'}]; break;
        case 'five_of_a_kind': cards = [{rank: '13', suit: 'Lupa'}, {rank: '13', suit: 'Lupa'}, {rank: '13', suit: 'Lupa'}, {rank: '13', suit: 'Lupa'}, {rank: '13', suit: 'Lupa'}]; break;
    }

    const cardWidth = 80 * cardScale;
    const cardSpacing = 10; // Proper spacing between cards
    const totalWidth = cards.length * cardWidth + (cards.length - 1) * cardSpacing;
    let startX = -totalWidth / 2 + cardWidth / 2;

    cards.forEach((card, index) => {
        this.addSampleCard(container, card.rank, card.suit, startX + index * (cardWidth + cardSpacing), 0, cardScale);
    });
  }

  private createElementalEffectsContent(): void {
    this.elementalEffectsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 20).setDepth(10).setVisible(false);
    const elementalInfo = [
      { suit: "Apoy", icon: "🔥", name: "Fire", description: "Deals 50% of hand value as AoE damage and applies 2 Burn to all enemies.", color: "#FF6B6B" },
      { suit: "Tubig", icon: "💧", name: "Water", description: "Heals for 80% of hand value and cleanses 1 debuff from the player.", color: "#54A0FF" },
      { suit: "Lupa", icon: "🌿", name: "Earth", description: "Gains 120% of hand value as Block and grants 1 Strength.", color: "#00D2D3" },
      { suit: "Hangin", icon: "💨", name: "Air", description: "Draws 2 cards and grants 2 Dexterity.", color: "#A29BFE" }
    ];

    let yPos = -220;
    const entrySpacing = 130;
    
    elementalInfo.forEach(info => {
      // Clean single-layer background
      const bg = this.add.rectangle(0, yPos, 880, 110, 0x1a1a1a, 0.92);
      bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(info.color).color, 0.6);
      
      const innerAccent = this.add.rectangle(0, yPos, 870, 100, undefined, 0);
      innerAccent.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(info.color).color, 0.3);
      
      // Icon with subtle background
      const iconBg = this.add.circle(-390, yPos, 32, 0x0a0a0a, 0.9);
      iconBg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(info.color).color, 0.5);
      
      const icon = this.add.text(-390, yPos, info.icon, { 
        fontSize: 44 
      }).setOrigin(0.5);
      
      // Element name - clean, no stroke
      const name = this.add.text(-320, yPos - 30, info.suit.toUpperCase(), { 
        fontFamily: "dungeon-mode", 
        fontSize: 22, 
        color: info.color
      }).setOrigin(0, 0.5);
      
      const subName = this.add.text(-320, yPos - 8, info.name, { 
        fontFamily: "dungeon-mode", 
        fontSize: 13, 
        color: "#888888"
      }).setOrigin(0, 0.5);
      
      // Description - clean, well-spaced
      const description = this.add.text(-320, yPos + 20, info.description, { 
        fontFamily: "dungeon-mode", 
        fontSize: 14, 
        color: "#E8ECED", 
        wordWrap: { width: 650 },
        lineSpacing: 3
      }).setOrigin(0, 0.5);
      
      this.elementalEffectsContainer.add([bg, innerAccent, iconBg, icon, name, subName, description]);
      yPos += entrySpacing;
    });

    // Bottom note with clean styling
    const noteBg = this.add.rectangle(0, yPos + 40, 750, 70, 0x1a1a1a, 0.92);
    noteBg.setStrokeStyle(2, 0xFFD700, 0.7);
    
    const noteAccent = this.add.rectangle(0, yPos + 40, 740, 60, undefined, 0);
    noteAccent.setStrokeStyle(1, 0xFFD700, 0.4);
    
    const note = this.add.text(0, yPos + 40, 
      "Playing 3+ cards of the same element triggers its special effect!", 
      { 
        fontFamily: "dungeon-mode", 
        fontSize: 16, 
        color: "#FFD700", 
        wordWrap: { width: 700 }, 
        align: "center",
        lineSpacing: 2
      }).setOrigin(0.5);
    this.elementalEffectsContainer.add([noteBg, noteAccent, note]);
  }

  private createBackButton(): void {
    const button = this.add.container(70, 40).setDepth(21);
    
    // Double border design matching game style
    const outerBorder = this.add.rectangle(0, 0, 104, 39, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    
    const bg = this.add.rectangle(0, 0, 100, 35, 0x150E10);
    bg.setStrokeStyle(2, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, 92, 27, undefined, 0);
    innerBorder.setStrokeStyle(1, 0x77888C, 0.6);
    
    const buttonText = this.add.text(0, 0, "← Back", { 
      fontFamily: "dungeon-mode", 
      fontSize: 14, 
      color: "#77888C", 
      align: "center" 
    }).setOrigin(0.5);

    button.add([outerBorder, bg, innerBorder, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-52, -19.5, 104, 39), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", () => this.scene.stop());
    button.on("pointerover", () => {
      bg.setFillStyle(0x2a1a1f);
      buttonText.setColor("#FFD700");
    });
    button.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      buttonText.setColor("#77888C");
    });
  }

  private addSampleCard(container: Phaser.GameObjects.Container, rank: string, suit: string, x: number, y: number, scale: number): void {
    const rankMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
      "11": "11", "12": "12", "13": "13"
    };
    const spriteRank = rankMap[rank] || "1";

    const suitMap: Record<string, string> = {
      "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
    };
    const spriteSuit = suitMap[suit] || "apoy";

    const textureKey = `card_${spriteRank}_${spriteSuit}`;

    if (this.textures.exists(textureKey)) {
      const cardSprite = this.add.image(x, y, textureKey);
      cardSprite.setDisplaySize(80 * scale, 112 * scale);
      container.add(cardSprite);
    } else {
      const cardSprite = this.add.rectangle(x, y, 80 * scale, 112 * scale, 0xffffff);
      cardSprite.setStrokeStyle(3 * scale, 0x333333);
      container.add(cardSprite);

      const rankText = this.add.text(x - 30 * scale, y - 40 * scale, rank, { fontFamily: "dungeon-mode", fontSize: Math.floor(16 * scale), color: "#000000" }).setOrigin(0, 0);
      container.add(rankText);

      const suitSymbolMap: Record<string, string> = { "Apoy": "🔥", "Tubig": "💧", "Lupa": "🌿", "Hangin": "💨" };
      const suitSymbol = suitSymbolMap[suit] || "🔥";

      const suitText = this.add.text(x + 25 * scale, y - 40 * scale, suitSymbol, { fontFamily: "dungeon-mode", fontSize: Math.floor(18 * scale), color: "#000000" }).setOrigin(1, 0);
      container.add(suitText);
    }
  }
}
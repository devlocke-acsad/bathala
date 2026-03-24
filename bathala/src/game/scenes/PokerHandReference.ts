import { Scene } from "phaser";
import { POKER_HAND_LIST } from "../../data/poker/PokerHandReference";

type Tab = 'poker' | 'elements' | 'status' | 'affinities';

export class PokerHandReference extends Scene {
  private pokerHandsContainer!: Phaser.GameObjects.Container;
  private elementalEffectsContainer!: Phaser.GameObjects.Container;
  private statusEffectsContainer!: Phaser.GameObjects.Container;
  private affinitiesContainer!: Phaser.GameObjects.Container;
  private activeTab: Tab = 'poker';
  private pokerTabButton!: Phaser.GameObjects.Container;
  private elementsTabButton!: Phaser.GameObjects.Container;
  private statusTabButton!: Phaser.GameObjects.Container;
  private affinitiesTabButton!: Phaser.GameObjects.Container;
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
    this.createStatusEffectsContent();
    this.createAffinitiesContent();
    this.showTab('poker');
  }

  private createTabs(): void {
    const tabY = 135; // Moved down to be inside container
    const tabSpacing = 180;
    const startX = this.cameras.main.width / 2 - (tabSpacing * 1.5);
    this.pokerTabButton = this.createTabButton("Poker Hands", startX, tabY, () => this.showTab('poker'), 'poker');
    this.elementsTabButton = this.createTabButton("Elements", startX + tabSpacing, tabY, () => this.showTab('elements'), 'elements');
    this.statusTabButton = this.createTabButton("Status Effects", startX + tabSpacing * 2, tabY, () => this.showTab('status'), 'status');
    this.affinitiesTabButton = this.createTabButton("Affinities", startX + tabSpacing * 3, tabY, () => this.showTab('affinities'), 'affinities');
  }

  private createTabButton(text: string, x: number, y: number, onClick: () => void, tabId: Tab): Phaser.GameObjects.Container {
    const button = this.add.container(x, y).setDepth(21);
    
    // Double border design matching game style
    const outerBorder = this.add.rectangle(0, 0, 168, 42, undefined, 0);
    outerBorder.setStrokeStyle(2, 0x77888C, 0.8);
    
    const bg = this.add.rectangle(0, 0, 164, 38, 0x150E10);
    bg.setStrokeStyle(2, 0x77888C);
    
    const innerBorder = this.add.rectangle(0, 0, 156, 30, undefined, 0);
    innerBorder.setStrokeStyle(1, 0x77888C, 0.6);
    
    const buttonText = this.add.text(0, 0, text, { 
      fontFamily: "dungeon-mode", 
      fontSize: 13, 
      color: "#77888C", 
      align: "center" 
    }).setOrigin(0.5);

    button.add([outerBorder, bg, innerBorder, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-84, -21, 168, 42), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", onClick);
    button.on("pointerover", () => {
      bg.setFillStyle(0x2a1a1f);
      buttonText.setColor("#E8ECED");
    });
    button.on("pointerout", () => {
        if (this.activeTab !== tabId) {
            bg.setFillStyle(0x150E10);
            buttonText.setColor("#77888C");
        }
    });

    return button;
  }

  private showTab(tab: Tab): void {
    this.activeTab = tab;

    // Hide all containers
    const containers = [
      { container: this.pokerHandsContainer, id: 'poker' as Tab },
      { container: this.elementalEffectsContainer, id: 'elements' as Tab },
      { container: this.statusEffectsContainer, id: 'status' as Tab },
      { container: this.affinitiesContainer, id: 'affinities' as Tab },
    ];

    containers.forEach(({ container, id }) => {
      if (id === tab) {
        container.setVisible(true);
        this.tweens.add({ targets: container, alpha: 1, duration: 300, ease: 'Power2' });
      } else {
        container.setAlpha(0);
        container.setVisible(false);
      }
    });

    // Update all tab button styles
    const buttons: { button: Phaser.GameObjects.Container; id: Tab }[] = [
      { button: this.pokerTabButton, id: 'poker' },
      { button: this.elementsTabButton, id: 'elements' },
      { button: this.statusTabButton, id: 'status' },
      { button: this.affinitiesTabButton, id: 'affinities' },
    ];

    buttons.forEach(({ button, id }) => {
      const bg = button.list[1] as Phaser.GameObjects.Rectangle;
      const text = button.list[3] as Phaser.GameObjects.Text;
      if (id === tab) {
        bg.setFillStyle(0x2a1a1f);
        text.setColor("#FFD700");
      } else {
        bg.setFillStyle(0x150E10);
        text.setColor("#77888C");
      }
    });
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
    
    // Fix: Use the bg rectangle directly for interaction instead of creating a separate hit area
    // This ensures the interactive area perfectly matches the visual button
    bg.setInteractive({ useHandCursor: true });
    
    // Transfer events from bg to button container for proper behavior
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
    // Anchor near top of visible area so content isn't compressed
    // Container centered in the content area (below tab bar, inside panel)
    const cY = this.cameras.main.height / 2 + 30;
    this.elementalEffectsContainer = this.add.container(this.cameras.main.width / 2, cY).setDepth(10).setVisible(false);

    const elementalInfo = [
      { suit: "Apoy",   iconKey: "icon_element_fire",  name: "Fire",  effectDesc: "Applies 3 stacks of Burn (6 damage/turn)",       description: "Offensive element. Fire Special inflicts Burn, dealing damage over time.",   color: "#FF6B6B" },
      { suit: "Tubig",  iconKey: "icon_element_water", name: "Water", effectDesc: "Applies 2 stacks of Frail (50% block reduction)", description: "Defensive disruption. Water Special weakens enemy defenses with Frail.",     color: "#54A0FF" },
      { suit: "Lupa",   iconKey: "icon_element_earth", name: "Earth", effectDesc: "Applies 1 stack of Vulnerable (+50% damage)",     description: "Damage amplifier. Earth Special makes enemies Vulnerable to all attacks.",  color: "#00D2D3" },
      { suit: "Hangin", iconKey: "icon_element_air",   name: "Air",   effectDesc: "Applies 2 stacks of Weak (−50% attack power)",   description: "Survivability element. Air Special reduces enemy attack power with Weak.",  color: "#A29BFE" },
    ];

    const cardW = 380;
    const cardH = 140;
    const colGap = 24;
    const rowGap = 20;
    const noteH = 56;
    const noteGap = 20;

    // Total height: 2 rows of cards + note
    const totalH = 2 * (cardH + rowGap) - rowGap + noteGap + noteH;
    const startY = -totalH / 2 + cardH / 2;

    const leftX  = -(cardW / 2 + colGap / 2);
    const rightX =  (cardW / 2 + colGap / 2);

    elementalInfo.forEach((info, i) => {
      const cx = i % 2 === 0 ? leftX : rightX;
      const cy = startY + Math.floor(i / 2) * (cardH + rowGap);
      const col = Phaser.Display.Color.HexStringToColor(info.color).color;

      const bg = this.add.rectangle(cx, cy, cardW, cardH, 0x0e0e0e, 1);
      bg.setStrokeStyle(1.5, col, 0.5);

      // Large icon on the left side of the card
      const iconBg = this.add.circle(cx - cardW / 2 + 44, cy, 28, 0x060606, 1);
      iconBg.setStrokeStyle(1.5, col, 0.7);
      const iconImg = this.add.image(cx - cardW / 2 + 44, cy, info.iconKey)
        .setDisplaySize(28, 28).setTint(col).setOrigin(0.5);

      // Text starting after the icon
      const tx = cx - cardW / 2 + 88;
      const suitName = this.add.text(tx, cy - 38, info.suit.toUpperCase(), {
        fontFamily: "dungeon-mode", fontSize: 18, color: info.color,
      }).setOrigin(0, 0.5);

      const subName = this.add.text(tx, cy - 16, info.name, {
        fontFamily: "dungeon-mode", fontSize: 11, color: "#555555",
      }).setOrigin(0, 0.5);

      const effectText = this.add.text(tx, cy + 10, `Special: ${info.effectDesc}`, {
        fontFamily: "dungeon-mode", fontSize: 11, color: "#FFD700",
        wordWrap: { width: cardW - 100 }, lineSpacing: 2,
      }).setOrigin(0, 0.5);

      const descText = this.add.text(tx, cy + 42, info.description, {
        fontFamily: "dungeon-mode", fontSize: 10, color: "#6e8a90",
        wordWrap: { width: cardW - 100 }, lineSpacing: 2,
      }).setOrigin(0, 0.5);

      this.elementalEffectsContainer.add([bg, iconBg, iconImg, suitName, subName, effectText, descText]);
    });

    // Note centred below the 2-row grid
    const noteY = startY + 2 * (cardH + rowGap) - rowGap + noteGap + noteH / 2;
    const noteBg = this.add.rectangle(0, noteY, cardW * 2 + colGap, noteH, 0x0e0e0e, 1);
    noteBg.setStrokeStyle(1.5, 0xFFD700, 0.5);
    const note = this.add.text(0, noteY,
      "Special actions apply status effects based on your dominant element.  Each element's Special can only be used once per combat!",
      { fontFamily: "dungeon-mode", fontSize: 12, color: "#c8a830", wordWrap: { width: cardW * 2 + colGap - 32 }, align: "center", lineSpacing: 3 }
    ).setOrigin(0.5);
    this.elementalEffectsContainer.add([noteBg, note]);
  }

  private createStatusEffectsContent(): void {
    this.statusEffectsContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 30).setDepth(10).setVisible(false);

    const buffs = [
      { iconKey: "icon_strength",    name: "Strength",     desc: "+3 attack per stack. Persistent.",             color: "#f0c040" },
      { iconKey: "icon_plated_armor",name: "Plated Armor", desc: "Gain block each turn (×3), then −1 stack.",    color: "#54A0FF" },
      { iconKey: "icon_regeneration",name: "Regeneration", desc: "Heal each turn (×2 HP), then −1 stack.",      color: "#2ed573" },
      { iconKey: "icon_ritual",      name: "Ritual",       desc: "Gain +1 Strength at end of turn.",            color: "#A29BFE" },
    ];

    const debuffs = [
      { iconKey: "icon_burn",       name: "Burn",       desc: "Damage each turn (×2), then −1 stack.",  color: "#e05030" },
      { iconKey: "icon_poison",     name: "Poison",     desc: "Damage each turn (×2), then −1 stack.",  color: "#7ddb8a" },
      { iconKey: "icon_weak",       name: "Weak",       desc: "−25% attack damage per stack. Max 3.",   color: "#FF9F43" },
      { iconKey: "icon_vulnerable", name: "Vulnerable", desc: "+50% damage taken. Non-stackable.",      color: "#E74C3C" },
      { iconKey: "icon_frail",      name: "Frail",      desc: "−25% block per stack. Max 3.",           color: "#c060f0" },
    ];

    const colW   = 375;
    const cardH  = 72;
    const gap    = 10;
    const hdrH   = 38;
    const noteH  = 50;
    const leftX  = -(colW / 2 + 12);
    const rightX =  (colW / 2 + 12);

    // Total height: header + tallest column rows + gap + note
    const maxRows = Math.max(buffs.length, debuffs.length);
    const colContentH = hdrH + gap + maxRows * (cardH + gap) - gap;
    const totalH = colContentH + gap + noteH;
    const startY = -totalH / 2;

    const makeColumn = (
      items: typeof buffs,
      cx: number,
      headerLabel: string,
      headerColor: string,
      borderCol: number
    ) => {
      // Column header
      const hdrBg = this.add.rectangle(cx, startY + hdrH / 2, colW, hdrH, 0x060606, 1);
      hdrBg.setStrokeStyle(1, borderCol, 0.5);
      const hdrText = this.add.text(cx, startY + hdrH / 2, headerLabel, {
        fontFamily: "dungeon-mode", fontSize: 16, color: headerColor, align: "center",
      }).setOrigin(0.5);
      this.statusEffectsContainer.add([hdrBg, hdrText]);

      let rowY = startY + hdrH + gap + cardH / 2;
      items.forEach(info => {
        const col = Phaser.Display.Color.HexStringToColor(info.color).color;
        const bg = this.add.rectangle(cx, rowY, colW, cardH, 0x0e0e0e, 1);
        bg.setStrokeStyle(1, borderCol, 0.25);

        const iconBg = this.add.circle(cx - colW / 2 + 30, rowY, 20, 0x060606, 1);
        iconBg.setStrokeStyle(1.5, col, 0.65);
        const iconImg = this.add.image(cx - colW / 2 + 30, rowY, info.iconKey)
          .setDisplaySize(18, 18).setTint(col).setOrigin(0.5);

        const tx = cx - colW / 2 + 60;
        const name = this.add.text(tx, rowY - 14, info.name, {
          fontFamily: "dungeon-mode", fontSize: 14, color: info.color,
        }).setOrigin(0, 0.5);
        const desc = this.add.text(tx, rowY + 12, info.desc, {
          fontFamily: "dungeon-mode", fontSize: 10, color: "#6e8a90",
          wordWrap: { width: colW - 72 }, lineSpacing: 2,
        }).setOrigin(0, 0.5);

        this.statusEffectsContainer.add([bg, iconBg, iconImg, name, desc]);
        rowY += cardH + gap;
      });
    };

    makeColumn(buffs,   leftX,  "BUFFS",   "#2ed573", 0x2ed573);
    makeColumn(debuffs, rightX, "DEBUFFS", "#ff4757",  0xff4757);

    // Bottom note — anchored relative to startY so content is centred
    const noteY = startY + colContentH + gap + noteH / 2;
    const noteBg = this.add.rectangle(0, noteY, colW * 2 + 24, noteH, 0x0e0e0e, 1);
    noteBg.setStrokeStyle(1.5, 0xFFD700, 0.5);
    const note = this.add.text(0, noteY,
      "Start-of-turn effects → Actions → End-of-turn effects.  Effects at 0 stacks are removed.",
      { fontFamily: "dungeon-mode", fontSize: 11, color: "#c8a830", wordWrap: { width: colW * 2 }, align: "center", lineSpacing: 3 }
    ).setOrigin(0.5);
    this.statusEffectsContainer.add([noteBg, note]);
  }

  private createAffinitiesContent(): void {
    this.affinitiesContainer = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2 + 30).setDepth(10).setVisible(false);

    // ── Layout constants ───────────────────────────────────────────────────
    const pillW      = 370;
    const pillH      = 72;
    const pillGap    = 16;   // gap between pills and table header label
    const hdrLabelH  = 24;   // "AFFINITY PATTERNS" text
    const hdrLabelGap = 14;
    const colHdrH    = 20;   // column labels row
    const rowH       = 68;
    const rowGap     = 8;
    const tipH       = 48;
    const tipGap     = 16;
    const numRows    = 4;    // affinityPatterns.length

    const tableW = pillW * 2 + 24;

    // Total height of all content
    const totalH =
      pillH +
      pillGap + hdrLabelH +
      hdrLabelGap + colHdrH +
      numRows * (rowH + rowGap) - rowGap +
      tipGap + tipH;

    // startY: top of first element, centred around container origin
    const startY = -totalH / 2;

    // ── Top explanation pills ──────────────────────────────────────────────
    const pillCY = startY + pillH / 2;

    // Each pill spans half the table width minus a small centre gap
    const halfTableW = tableW / 2 - 6;

    const makeExplainPill = (cx: number, iconKey: string, tintCol: number, title: string, titleColor: string, body: string) => {
      const pw = halfTableW;
      const textAreaW = pw - 68; // space after icon
      const bg = this.add.rectangle(cx, pillCY, pw, pillH, 0x0e0e0e, 1);
      bg.setStrokeStyle(1.5, tintCol, 0.55);
      const iconBg = this.add.circle(cx - pw / 2 + 30, pillCY, 22, 0x060606, 1).setStrokeStyle(1.5, tintCol, 0.7);
      const icon   = this.add.image(cx - pw / 2 + 30, pillCY, iconKey).setDisplaySize(20, 20).setTint(tintCol).setOrigin(0.5);
      const t1 = this.add.text(cx - pw / 2 + 62, pillCY - 13, title, { fontFamily: "dungeon-mode", fontSize: 13, color: titleColor, wordWrap: { width: textAreaW } }).setOrigin(0, 0.5);
      const t2 = this.add.text(cx - pw / 2 + 62, pillCY + 13, body,  { fontFamily: "dungeon-mode", fontSize: 11, color: "#6e8a90",   wordWrap: { width: textAreaW } }).setOrigin(0, 0.5);
      this.affinitiesContainer.add([bg, iconBg, icon, t1, t2]);
    };

    const pillHalfGap = tableW / 4 + 3; // cx for left and right pills
    makeExplainPill(-pillHalfGap, "icon_strength",     0xff6b6b, "WEAKNESS  (1.5× Damage)",   "#ff9d9d", "Deal 50% MORE damage with this element.");
    makeExplainPill( pillHalfGap, "icon_plated_armor", 0x54A0FF, "RESISTANCE  (0.75× Damage)", "#98c8f0", "Deal 25% LESS damage with this element.");

    // ── "AFFINITY PATTERNS" section label ─────────────────────────────────
    const hdrLabelY = startY + pillH + pillGap + hdrLabelH / 2;
    const tableHeader = this.add.text(0, hdrLabelY, "AFFINITY PATTERNS", {
      fontFamily: "dungeon-mode", fontSize: 15, color: "#FFD700", align: "center",
    }).setOrigin(0.5);
    this.affinitiesContainer.add(tableHeader);

    // ── Column header labels ───────────────────────────────────────────────
    const colHdrY = hdrLabelY + hdrLabelH / 2 + hdrLabelGap + colHdrH / 2;

    const affinityPatterns = [
      { iconKey: "icon_element_fire",  name: "Fire",  weakIconKey: "icon_element_water", weakLabel: "Water",  resistIconKey: "icon_element_earth", resistLabel: "Earth", color: "#FF6B6B" },
      { iconKey: "icon_element_water", name: "Water", weakIconKey: "icon_element_earth", weakLabel: "Earth",  resistIconKey: "icon_element_fire",  resistLabel: "Fire",  color: "#54A0FF" },
      { iconKey: "icon_element_earth", name: "Earth", weakIconKey: "icon_element_air",   weakLabel: "Air",    resistIconKey: "icon_element_water", resistLabel: "Water", color: "#00D2D3" },
      { iconKey: "icon_element_air",   name: "Air",   weakIconKey: "icon_element_fire",  weakLabel: "Fire",   resistIconKey: "icon_element_air",   resistLabel: "Air",   color: "#A29BFE" },
    ];

    // Column positions relative to container center
    const colCreatureX = -tableW / 2 + 100;
    const colWeakX     = -tableW / 2 + 310;
    const colResistX   = -tableW / 2 + 530;

    this.affinitiesContainer.add([
      this.add.text(colCreatureX, colHdrY, "CREATURE", { fontFamily: "dungeon-mode", fontSize: 10, color: "#444444" }).setOrigin(0.5),
      this.add.text(colWeakX,     colHdrY, "WEAK TO",  { fontFamily: "dungeon-mode", fontSize: 10, color: "#ff6b6b" }).setOrigin(0.5),
      this.add.text(colResistX,   colHdrY, "RESISTS",  { fontFamily: "dungeon-mode", fontSize: 10, color: "#54A0FF" }).setOrigin(0.5),
    ]);

    // ── Affinity rows ──────────────────────────────────────────────────────
    let rowY = colHdrY + colHdrH / 2 + rowH / 2;
    affinityPatterns.forEach(info => {
      const col = Phaser.Display.Color.HexStringToColor(info.color).color;

      const bg = this.add.rectangle(0, rowY, tableW, rowH, 0x0e0e0e, 1);
      bg.setStrokeStyle(1, col, 0.2);

      // Creature cell
      const cIconBg = this.add.circle(colCreatureX - 34, rowY, 22, 0x060606, 1).setStrokeStyle(1.5, col, 0.6);
      const cIcon   = this.add.image(colCreatureX - 34, rowY, info.iconKey).setDisplaySize(20, 20).setTint(col).setOrigin(0.5);
      const cName   = this.add.text(colCreatureX + 2, rowY, info.name, { fontFamily: "dungeon-mode", fontSize: 15, color: info.color }).setOrigin(0, 0.5);

      // Weak to cell
      const wIconBg = this.add.circle(colWeakX - 34, rowY, 22, 0x060606, 1).setStrokeStyle(1.5, 0xff6b6b, 0.5);
      const wIcon   = this.add.image(colWeakX - 34, rowY, info.weakIconKey).setDisplaySize(18, 18).setTint(0xff9d9d).setOrigin(0.5);
      const wName   = this.add.text(colWeakX + 2, rowY, info.weakLabel, { fontFamily: "dungeon-mode", fontSize: 15, color: "#ff9d9d" }).setOrigin(0, 0.5);

      // Resists cell
      const rIconBg = this.add.circle(colResistX - 34, rowY, 22, 0x060606, 1).setStrokeStyle(1.5, 0x54A0FF, 0.5);
      const rIcon   = this.add.image(colResistX - 34, rowY, info.resistIconKey).setDisplaySize(18, 18).setTint(0x98f0ea).setOrigin(0.5);
      const rName   = this.add.text(colResistX + 2, rowY, info.resistLabel, { fontFamily: "dungeon-mode", fontSize: 15, color: "#98f0ea" }).setOrigin(0, 0.5);

      this.affinitiesContainer.add([bg, cIconBg, cIcon, cName, wIconBg, wIcon, wName, rIconBg, rIcon, rName]);
      rowY += rowH + rowGap;
    });

    // ── Bottom tip ─────────────────────────────────────────────────────────
    const tipY = rowY - rowH / 2 + tipGap + tipH / 2;
    const tipBg = this.add.rectangle(0, tipY, tableW, tipH, 0x0e0e0e, 1);
    tipBg.setStrokeStyle(1.5, 0xFFD700, 0.5);
    const tip = this.add.text(0, tipY,
      "Look for element icons above enemy health bars.  Exploit weaknesses — avoid resistances!",
      { fontFamily: "dungeon-mode", fontSize: 12, color: "#c8a830", wordWrap: { width: tableW - 32 }, align: "center", lineSpacing: 3 }
    ).setOrigin(0.5);
    this.affinitiesContainer.add([tipBg, tip]);
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
import { Scene } from "phaser";
import { POKER_HAND_LIST } from "../../data/poker/PokerHandReference";

type Tab = 'poker' | 'elements';

export class PokerHandReference extends Scene {
  private pokerHandsContainer!: Phaser.GameObjects.Container;
  private elementalEffectsContainer!: Phaser.GameObjects.Container;
  private activeTab: Tab = 'poker';
  private pokerTabButton!: Phaser.GameObjects.Container;
  private elementsTabButton!: Phaser.GameObjects.Container;
  private scrollContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "PokerHandReference" });
  }

  create() {
    // Dark overlay background
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.85).setDepth(0);

    // Title with smaller, cleaner font
    this.add.text(this.cameras.main.width / 2, 40, "GAME REFERENCE", { 
      fontFamily: "dungeon-mode", 
      fontSize: 28, 
      color: "#ffd700", 
      align: "center" 
    }).setOrigin(0.5).setDepth(5);

    this.createBackButton();
    this.createTabs();
    this.createPokerHandContent();
    this.createElementalEffectsContent();
    this.showTab('poker');
  }

  private createTabs(): void {
    const tabY = 85;
    this.pokerTabButton = this.createTabButton("Poker Hands", this.cameras.main.width / 2 - 110, tabY, () => this.showTab('poker'));
    this.elementsTabButton = this.createTabButton("Elemental Effects", this.cameras.main.width / 2 + 110, tabY, () => this.showTab('elements'));
  }

  private createTabButton(text: string, x: number, y: number, onClick: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y).setDepth(21);
    const bg = this.add.rectangle(0, 0, 200, 40, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);
    const buttonText = this.add.text(0, 0, text, { 
      fontFamily: "dungeon-mode", 
      fontSize: 14, 
      color: "#e8eced", 
      align: "center" 
    }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", onClick);
    button.on("pointerover", () => bg.setFillStyle(0x3d4454));
    button.on("pointerout", () => {
        if (this.activeTab !== (text === "Poker Hands" ? 'poker' : 'elements')) {
            bg.setFillStyle(0x2f3542);
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

    const pokerBg = this.pokerTabButton.first as Phaser.GameObjects.Rectangle;
    const elementsBg = this.elementsTabButton.first as Phaser.GameObjects.Rectangle;

    pokerBg.setFillStyle(tab === 'poker' ? 0x4a4a4a : 0x2f3542);
    elementsBg.setFillStyle(tab === 'elements' ? 0x4a4a4a : 0x2f3542);
  }

  private createPokerHandContent(): void {
    const contentY = 140;
    const ySpacing = 140;
    const totalContentHeight = POKER_HAND_LIST.length * ySpacing + 50;

    this.pokerHandsContainer = this.add.container(0, 0);
    this.scrollContainer = this.add.container(this.cameras.main.width / 2, contentY);
    this.pokerHandsContainer.add(this.scrollContainer);

    const cardScale = 0.35;
    const cardWidth = 80 * cardScale;

    POKER_HAND_LIST.forEach((handInfo, index) => {
      const currentY = index * ySpacing;
      
      // Background card for each entry
      const entryBg = this.add.rectangle(0, currentY + 60, 750, 125, 0x2a2d3a, 0.8);
      entryBg.setStrokeStyle(1, 0x4a5060);
      
      // Hand name - smaller and cleaner
      const handName = this.add.text(0, currentY + 15, handInfo.name.toUpperCase(), { 
        fontFamily: "dungeon-mode", 
        fontSize: 16, 
        color: "#ffd700", 
        align: "center" 
      }).setOrigin(0.5, 0);
      
      // Stats in a more compact format
      const valueAndActions = this.add.text(0, currentY + 38, 
        `Value: ${handInfo.value}  |  Attack: ${handInfo.attackValue}  |  Defense: ${handInfo.defenseValue}  |  Special: ${handInfo.specialValue}`, 
        { 
          fontFamily: "dungeon-mode", 
          fontSize: 11, 
          color: "#a0c4ff", 
          align: "center" 
        }).setOrigin(0.5, 0);
      
      // Card visuals
      const visualContainer = this.add.container(0, currentY + 75);
      this.addSampleCards(visualContainer, handInfo.handType, cardWidth, cardScale);

      // Description with better formatting
      const howToMake = this.add.text(0, currentY + 110, handInfo.howToMake, { 
        fontFamily: "dungeon-mode", 
        fontSize: 10, 
        color: "#c8d1da", 
        wordWrap: { width: 700 }, 
        align: "center" 
      }).setOrigin(0.5, 0);

      this.scrollContainer.add([entryBg, handName, valueAndActions, visualContainer, howToMake]);
    });

    // Add scroll instruction at the bottom
    const scrollHint = this.add.text(0, POKER_HAND_LIST.length * ySpacing + 20, 
      "Scroll for more", 
      { 
        fontFamily: "dungeon-mode", 
        fontSize: 12, 
        color: "#666", 
        align: "center" 
      }).setOrigin(0.5, 0);
    this.scrollContainer.add(scrollHint);

    const scrollArea = this.add.zone(0, contentY - 20, this.cameras.main.width, this.cameras.main.height - contentY + 20).setOrigin(0).setInteractive();

    scrollArea.on('wheel', (_pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
        if (this.activeTab === 'poker') {
            const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - contentY + 20));
            const newY = Phaser.Math.Clamp(this.scrollContainer.y - dy, contentY - maxScroll, contentY);
            this.scrollContainer.y = newY;
        }
    });
  }

  private addSampleCards(container: Phaser.GameObjects.Container, handType: string, cardWidth: number, cardScale: number) {
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

    const totalWidth = cards.length * (cardWidth + 5);
    let startX = -totalWidth / 2 + cardWidth / 2;

    cards.forEach((card, index) => {
        this.addSampleCard(container, card.rank, card.suit, startX + index * (cardWidth + 5), 0, cardScale);
    });
  }

  private createElementalEffectsContent(): void {
    this.elementalEffectsContainer = this.add.container(this.cameras.main.width / 2, 170).setDepth(10).setVisible(false);
    const elementalInfo = [
      { suit: "Apoy", icon: "🔥", name: "Fire", description: "Deals 50% of hand value as AoE damage and applies 2 Burn to all enemies.", color: "#ff6b6b" },
      { suit: "Tubig", icon: "💧", name: "Water", description: "Heals for 80% of hand value and cleanses 1 debuff from the player.", color: "#4ecdc4" },
      { suit: "Lupa", icon: "🌿", name: "Earth", description: "Gains 120% of hand value as Block and grants 1 Strength.", color: "#95e1d3" },
      { suit: "Hangin", icon: "💨", name: "Air", description: "Draws 2 cards and grants 2 Dexterity.", color: "#a8dadc" }
    ];

    let yPos = 0;
    elementalInfo.forEach(info => {
      // Background box with cleaner design
      const bg = this.add.rectangle(0, yPos, 700, 90, 0x2a2d3a, 0.8).setStrokeStyle(1, 0x4a5060);
      
      // Icon with better sizing
      const icon = this.add.text(-330, yPos, info.icon, { fontSize: 36 }).setOrigin(0.5);
      
      // Element name with color coding
      const name = this.add.text(-280, yPos - 20, `${info.suit} (${info.name})`, { 
        fontFamily: "dungeon-mode", 
        fontSize: 16, 
        color: info.color 
      }).setOrigin(0, 0.5);
      
      // Description with better readability
      const description = this.add.text(-280, yPos + 10, info.description, { 
        fontFamily: "dungeon-mode", 
        fontSize: 11, 
        color: "#c8d1da", 
        wordWrap: { width: 550 } 
      }).setOrigin(0, 0.5);
      
      this.elementalEffectsContainer.add([bg, icon, name, description]);
      yPos += 105;
    });

    // Add helpful note at the bottom
    const note = this.add.text(0, yPos + 20, 
      "Playing 3+ cards of the same element triggers its special effect!", 
      { 
        fontFamily: "dungeon-mode", 
        fontSize: 12, 
        color: "#ffd700", 
        wordWrap: { width: 650 }, 
        align: "center" 
      }).setOrigin(0.5, 0);
    this.elementalEffectsContainer.add(note);
  }

  private createBackButton(): void {
    const button = this.add.container(70, 40).setDepth(21);
    const bg = this.add.rectangle(0, 0, 100, 35, 0x2f3542).setStrokeStyle(2, 0x57606f);
    const buttonText = this.add.text(0, 0, "← Back", { 
      fontFamily: "dungeon-mode", 
      fontSize: 14, 
      color: "#e8eced", 
      align: "center" 
    }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-50, -17.5, 100, 35), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", () => this.scene.stop());
    button.on("pointerover", () => {
      bg.setFillStyle(0x3d4454);
      buttonText.setColor("#ffd700");
    });
    button.on("pointerout", () => {
      bg.setFillStyle(0x2f3542);
      buttonText.setColor("#e8eced");
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
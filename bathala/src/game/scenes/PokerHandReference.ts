import { Scene } from "phaser";
import { POKER_HAND_LIST, PokerHandInfo } from "../../data/poker/PokerHandReference";
import { Suit } from "../../core/types/CombatTypes";

type Tab = 'poker' | 'elements';

export class PokerHandReference extends Scene {
  private pokerHandsContainer!: Phaser.GameObjects.Container;
  private elementalEffectsContainer!: Phaser.GameObjects.Container;
  private backButton!: Phaser.GameObjects.Container;
  private activeTab: Tab = 'poker';
  private pokerTabButton!: Phaser.GameObjects.Container;
  private elementsTabButton!: Phaser.GameObjects.Container;
  private scrollContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "PokerHandReference" });
  }

  create() {
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x1a1a2a, 1).setDepth(0);

    this.add.text(this.cameras.main.width / 2, 50, "REFERENCE", { fontFamily: "dungeon-mode", fontSize: 40, color: "#ffd700", align: "center", fontStyle: "bold" }).setOrigin(0.5).setDepth(5);

    this.createBackButton();
    this.createTabs();
    this.createPokerHandContent();
    this.createElementalEffectsContent();
    this.showTab('poker');
  }

  private createTabs(): void {
    const tabY = 120;
    this.pokerTabButton = this.createTabButton("Poker Hands", this.cameras.main.width / 2 - 100, tabY, () => this.showTab('poker'));
    this.elementsTabButton = this.createTabButton("Elemental Effects", this.cameras.main.width / 2 + 100, tabY, () => this.showTab('elements'));
  }

  private createTabButton(text: string, x: number, y: number, onClick: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y).setDepth(21);
    const bg = this.add.rectangle(0, 0, 180, 50, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);
    const buttonText = this.add.text(0, 0, text, { fontFamily: "dungeon-mode", fontSize: 18, color: "#e8eced", align: "center" }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-90, -25, 180, 50), Phaser.Geom.Rectangle.Contains);
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
    const contentY = 180;
    const ySpacing = 180;
    const totalContentHeight = POKER_HAND_LIST.length * ySpacing;

    this.pokerHandsContainer = this.add.container(0, 0);
    this.scrollContainer = this.add.container(this.cameras.main.width / 2, contentY);
    this.pokerHandsContainer.add(this.scrollContainer);

    const cardScale = 0.4;
    const cardWidth = 80 * cardScale;

    POKER_HAND_LIST.forEach((handInfo, index) => {
      const currentY = index * ySpacing;
      
      const handName = this.add.text(0, currentY, `${handInfo.name}`, { fontFamily: "dungeon-mode", fontSize: 20, color: "#ffd700", align: "center" }).setOrigin(0.5, 0);
      const valueAndActions = this.add.text(0, currentY + 30, `VALUE: ${handInfo.value} | ATK: ${handInfo.attackValue} | DEF: ${handInfo.defenseValue} | SPC: ${handInfo.specialValue}`, { fontFamily: "dungeon-mode", fontSize: 12, color: "#a0a0ff", align: "center" }).setOrigin(0.5, 0);
      
      const visualContainer = this.add.container(0, currentY + 70);
      this.addSampleCards(visualContainer, handInfo.handType, cardWidth, cardScale);

      const howToMake = this.add.text(0, currentY + 130, `• ${handInfo.howToMake}`, { fontFamily: "dungeon-mode", fontSize: 12, color: "#e8eced", wordWrap: { width: 700 }, align: "center" }).setOrigin(0.5, 0);

      this.scrollContainer.add([handName, valueAndActions, visualContainer, howToMake]);
    });

    const scrollArea = this.add.zone(0, contentY, this.cameras.main.width, this.cameras.main.height - contentY).setOrigin(0).setInteractive();

    scrollArea.on('wheel', (pointer: Phaser.Input.Pointer, dx: number, dy: number) => {
        if (this.activeTab === 'poker') {
            const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - contentY));
            this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y - dy, -maxScroll, 0);
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
    this.elementalEffectsContainer = this.add.container(this.cameras.main.width / 2, 250).setDepth(10).setVisible(false);
    const elementalInfo = [
      { suit: "Apoy", icon: "🔥", name: "Fire", description: "Deals 50% of hand value as AoE damage and applies 2 Burn to all enemies." },
      { suit: "Tubig", icon: "💧", name: "Water", description: "Heals for 80% of hand value and cleanses 1 debuff from the player." },
      { suit: "Lupa", icon: "🌿", name: "Earth", description: "Gains 120% of hand value as Block and grants 1 Strength." },
      { suit: "Hangin", icon: "💨", name: "Air", description: "Draws 2 cards and grants 2 Dexterity." }
    ];

    let yPos = 0;
    elementalInfo.forEach(info => {
      const bg = this.add.rectangle(0, yPos, 700, 100, 0x2f3542, 0.5).setStrokeStyle(2, 0x57606f);
      const icon = this.add.text(-300, yPos, info.icon, { fontSize: 48 }).setOrigin(0.5);
      const name = this.add.text(-250, yPos - 15, `${info.suit} (${info.name})`, { fontFamily: "dungeon-mode", fontSize: 20, color: "#ffd700" }).setOrigin(0, 0.5);
      const description = this.add.text(-250, yPos + 25, info.description, { fontFamily: "dungeon-mode", fontSize: 14, color: "#e8eced", wordWrap: { width: 500 } }).setOrigin(0, 0.5);
      this.elementalEffectsContainer.add([bg, icon, name, description]);
      yPos += 120;
    });
  }

  private createBackButton(): void {
    const button = this.add.container(80, 50).setDepth(21);
    const bg = this.add.rectangle(0, 0, 120, 40, 0x2f3542).setStrokeStyle(2, 0x57606f);
    const buttonText = this.add.text(0, 0, "Back", { fontFamily: "dungeon-mode", fontSize: 18, color: "#e8eced", align: "center" }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    button.on("pointerdown", () => this.scene.start("Combat"));
    button.on("pointerover", () => bg.setFillStyle(0x3d4454));
    button.on("pointerout", () => bg.setFillStyle(0x2f3542));
    this.backButton = button;
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
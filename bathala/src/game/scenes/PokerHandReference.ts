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
    // Create a proper background that doesn't cover elements
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x1a1a2a,  // Dark blue background
      1           // Fully opaque
    ).setDepth(0); // Lowest depth

    // Create title
    this.add.text(
      this.cameras.main.width / 2,
      50,
      "REFERENCE",
      {
        fontFamily: "dungeon-mode",
        fontSize: 40,
        color: "#ffd700",
        align: "center",
        fontStyle: "bold"
      }
    ).setOrigin(0.5).setDepth(5);

    this.createBackButton();
    this.createTabs();
    this.createPokerHandContent();
    this.createElementalEffectsContent();
    this.showTab('poker');
  }

  private createTabs(): void {
    const tabY = 120;
    this.pokerTabButton = this.createTabButton("Poker Hands", -100, tabY, () => this.showTab('poker'));
    this.elementsTabButton = this.createTabButton("Elemental Effects", 100, tabY, () => this.showTab('elements'));
  }

  private createTabButton(text: string, x: number, y: number, onClick: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(this.cameras.main.width / 2 + x, y).setDepth(21);
    const bg = this.add.rectangle(0, 0, 180, 50, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);

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

    // Instantly set visibility to avoid graphical glitches
    this.pokerHandsContainer.setVisible(tab === 'poker');
    this.elementalEffectsContainer.setVisible(tab === 'elements');

    // Then fade in the correct container
    if (tab === 'poker') {
        this.tweens.add({
            targets: this.pokerHandsContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        this.elementalEffectsContainer.setAlpha(0);
    } else {
        this.tweens.add({
            targets: this.elementalEffectsContainer,
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        this.pokerHandsContainer.setAlpha(0);
    }

    const pokerBg = this.pokerTabButton.first as Phaser.GameObjects.Rectangle;
    const elementsBg = this.elementsTabButton.first as Phaser.GameObjects.Rectangle;

    pokerBg.setFillStyle(tab === 'poker' ? 0x4a4a4a : 0x2f3542);
    elementsBg.setFillStyle(tab === 'elements' ? 0x4a4a4a : 0x2f3542);
}

  private createPokerHandContent(): void {
    const contentY = 180;
    const ySpacing = 200;
    const totalContentHeight = POKER_HAND_LIST.length * ySpacing;

    this.pokerHandsContainer = this.add.container(0, 0);
    this.scrollContainer = this.add.container(this.cameras.main.width / 2, contentY);
    this.pokerHandsContainer.add(this.scrollContainer);

    const cardScale = 0.5;
    const cardWidth = 80 * cardScale;

    POKER_HAND_LIST.forEach((handInfo, index) => {
      const currentY = index * ySpacing;
      const visualContainer = this.add.container(-this.cameras.main.width/2 + 50, currentY + 30).setDepth(11);

      // Add sample cards based on hand type for visual representation
      switch (handInfo.handType) {
        case 'high_card':
          this.addSampleCard(visualContainer, '1', 'Apoy', 0, 0, cardScale); // Ace of Fire
          break;
        case 'pair':
          this.addSampleCard(visualContainer, '7', 'Lupa', 0, 0, cardScale); // Two 7s of Earth
          this.addSampleCard(visualContainer, '7', 'Lupa', cardWidth + 15, 0, cardScale);
          break;
        case 'two_pair':
          this.addSampleCard(visualContainer, '5', 'Hangin', 0, 0, cardScale); // Two 5s of Air
          this.addSampleCard(visualContainer, '5', 'Hangin', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, 'Mandirigma', 'Tubig', (cardWidth + 15) * 2, 0, cardScale); // Two Mandirigmas of Water
          this.addSampleCard(visualContainer, 'Mandirigma', 'Tubig', (cardWidth + 15) * 3, 0, cardScale);
          break;
        case 'three_of_a_kind':
          this.addSampleCard(visualContainer, '8', 'Apoy', 0, 0, cardScale); // Three 8s of Fire
          this.addSampleCard(visualContainer, '8', 'Apoy', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '8', 'Apoy', (cardWidth + 15) * 2, 0, cardScale);
          break;
        case 'straight':
          this.addSampleCard(visualContainer, '4', 'Lupa', 0, 0, cardScale); // Straight 4,5,6,7,8 of Earth
          this.addSampleCard(visualContainer, '5', 'Lupa', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '6', 'Lupa', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, '7', 'Lupa', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, '8', 'Lupa', (cardWidth + 15) * 4, 0, cardScale);
          break;
        case 'flush':
          this.addSampleCard(visualContainer, '2', 'Tubig', 0, 0, cardScale); // All Tubig (Water)
          this.addSampleCard(visualContainer, '5', 'Tubig', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '9', 'Tubig', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, 'Mandirigma', 'Tubig', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, 'Datu', 'Tubig', (cardWidth + 15) * 4, 0, cardScale);
          break;
        case 'full_house':
          this.addSampleCard(visualContainer, '3', 'Apoy', 0, 0, cardScale); // Three 3s and two Babaylans
          this.addSampleCard(visualContainer, '3', 'Apoy', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '3', 'Apoy', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, 'Babaylan', 'Lupa', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, 'Babaylan', 'Lupa', (cardWidth + 15) * 4, 0, cardScale);
          break;
        case 'four_of_a_kind':
          this.addSampleCard(visualContainer, '10', 'Hangin', 0, 0, cardScale); // Four 10s of Air
          this.addSampleCard(visualContainer, '10', 'Hangin', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '10', 'Hangin', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, '10', 'Hangin', (cardWidth + 15) * 3, 0, cardScale);
          break;
        case 'straight_flush':
          this.addSampleCard(visualContainer, '6', 'Apoy', 0, 0, cardScale); // Straight of Apoy (Fire)
          this.addSampleCard(visualContainer, '7', 'Apoy', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, '8', 'Apoy', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, '9', 'Apoy', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, '10', 'Apoy', (cardWidth + 15) * 4, 0, cardScale);
          break;
        case 'royal_flush':
          this.addSampleCard(visualContainer, '1', 'Apoy', 0, 0, cardScale); // Royal flush of Apoy (Fire)
          this.addSampleCard(visualContainer, 'Mandirigma', 'Apoy', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, 'Babaylan', 'Apoy', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, 'Datu', 'Apoy', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, '10', 'Apoy', (cardWidth + 15) * 4, 0, cardScale);
          break;
        case 'five_of_a_kind':
          this.addSampleCard(visualContainer, 'King', 'Lupa', 0, 0, cardScale); // Five Kings of Earth (using King as placeholder)
          this.addSampleCard(visualContainer, 'King', 'Lupa', cardWidth + 15, 0, cardScale);
          this.addSampleCard(visualContainer, 'King', 'Lupa', (cardWidth + 15) * 2, 0, cardScale);
          this.addSampleCard(visualContainer, 'King', 'Lupa', (cardWidth + 15) * 3, 0, cardScale);
          this.addSampleCard(visualContainer, 'King', 'Lupa', (cardWidth + 15) * 4, 0, cardScale);
          break;
      }

      const handName = this.add.text(-this.cameras.main.width/2 + 50 + (cardWidth * 6) + 20, currentY + 10, `${handInfo.name}`, { fontFamily: "dungeon-mode", fontSize: 22, color: "#ffd700", align: "left" }).setDepth(12);
      const valueAndActions = this.add.text(-this.cameras.main.width/2 + 50 + (cardWidth * 6) + 20, currentY + 45, `VALUE: ${handInfo.value} | ATK: ${handInfo.attackValue} | DEF: ${handInfo.defenseValue} | SPC: ${handInfo.specialValue}`, { fontFamily: "dungeon-mode", fontSize: 14, color: "#a0a0ff", align: "left" }).setDepth(12);
      const howToMake = this.add.text(-this.cameras.main.width/2 + 50, currentY + 100, `• ${handInfo.howToMake}`, { fontFamily: "dungeon-mode", fontSize: 14, color: "#e8eced", wordWrap: { width: this.cameras.main.width - 100 }, align: "left" }).setDepth(12);

      this.scrollContainer.add([visualContainer, handName, valueAndActions, howToMake]);
    });

    const scrollArea = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.01).setOrigin(0.5).setDepth(20).setInteractive();

    scrollArea.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
        if (this.activeTab === 'poker') {
            const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - contentY));
            const newY = this.scrollContainer.y - (deltaY * 3);
            this.scrollContainer.y = Phaser.Math.Clamp(newY, -maxScroll, 0);
        }
    });

    let isDragging = false;
    let startY = 0;

    scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        isDragging = true;
        startY = pointer.y;
    });

    scrollArea.on('pointerup', () => {
        isDragging = false;
    });

    scrollArea.on('pointerout', () => {
        isDragging = false;
    });

    scrollArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (isDragging && this.activeTab === 'poker') {
            const newY = this.scrollContainer.y + (pointer.y - startY);
            const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - contentY));
            this.scrollContainer.y = Phaser.Math.Clamp(newY, -maxScroll, 0);
            startY = pointer.y;
        }
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
      const container = this.add.container(0, yPos);
      const bg = this.add.rectangle(0, 0, 600, 100, 0x2f3542, 0.5).setStrokeStyle(2, 0x57606f);
      const icon = this.add.text(-250, 0, info.icon, { fontSize: 48 }).setOrigin(0.5);
      const name = this.add.text(-200, -15, `${info.suit} (${info.name})`, { fontFamily: "dungeon-mode", fontSize: 24, color: "#ffd700" }).setOrigin(0, 0.5);
      const description = this.add.text(-200, 25, info.description, { fontFamily: "dungeon-mode", fontSize: 16, color: "#e8eced", wordWrap: { width: 450 } }).setOrigin(0, 0);
      container.add([bg, icon, name, description]);
      this.elementalEffectsContainer.add(container);
      yPos += 120;
    });
  }

  private createBackButton(): void {
    const buttonX = 80;
    const buttonY = 50;

    this.backButton = this.add.container(buttonX, buttonY).setDepth(21);

    const bg = this.add.rectangle(0, 0, 120, 40, 0x2f3542);
    bg.setStrokeStyle(2, 0x57606f);

    const buttonText = this.add.text(0, 0, "Back", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);

    this.backButton.add([bg, buttonText]);
    this.backButton.setInteractive(
      new Phaser.Geom.Rectangle(-60, -20, 120, 40),
      Phaser.Geom.Rectangle.Contains
    );
    this.backButton.on("pointerdown", () => {
      this.scene.start("Combat");
    });
    this.backButton.on("pointerover", () => bg.setFillStyle(0x3d4454));
    this.backButton.on("pointerout", () => bg.setFillStyle(0x2f3542));
  }

  private addSampleCard(
    container: Phaser.GameObjects.Container,
    rank: string,
    suit: string,
    x: number,
    y: number,
    scale: number = 1
  ): void {
    // Convert card rank to sprite rank (1-13)
    const rankMap: Record<string, string> = {
      "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
      "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
      "Mandirigma": "11", "Babaylan": "12", "Datu": "13", "King": "13" // Added King as placeholder for 5 of a kind
    };
    const spriteRank = rankMap[rank] || "1";

    // Convert suit to lowercase for sprite naming following the actual file naming convention
    const suitMap: Record<string, string> = {
      "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
    };
    const spriteSuit = suitMap[suit] || "apoy";

    // The actual file names follow the pattern card_<rank>_<suit> (e.g., card_1_apoy)
    const textureKey = `card_${spriteRank}_${spriteSuit}`;

    let cardSprite;

    // Check if texture exists, fallback to generated card if not
    if (this.textures.exists(textureKey)) {
      cardSprite = this.add.image(x, y, textureKey);
      cardSprite.setDisplaySize(80 * scale, 112 * scale);
      cardSprite.setDepth(5); // Higher depth to make sure it's visible
      container.add(cardSprite);
    } else {
      // Always create a generated card with border and visual indicators
      cardSprite = this.add.rectangle(x, y, 80 * scale, 112 * scale, 0xffffff);
      cardSprite.setStrokeStyle(3 * scale, 0x333333); // Add border for visibility (darker gray)
      cardSprite.setDepth(5); // Higher depth to make sure it's visible

      // Add rank text at top-left
      const rankText = this.add.text(x - 30 * scale, y - 40 * scale, rank, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scale),
        color: "#000000",
      }).setOrigin(0, 0).setDepth(6);
      container.add(rankText);

      // Add suit symbol next to rank
      const suitSymbolMap: Record<string, string> = {
        "Apoy": "🔥", "Tubig": "💧", "Lupa": "🌿", "Hangin": "💨"
      };
      const suitSymbol = suitSymbolMap[suit] || "🔥";

      const suitText = this.add.text(x + 25 * scale, y - 40 * scale, suitSymbol, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scale),
        color: "#000000",
      }).setOrigin(1, 0).setDepth(6);
      container.add(suitText);

      // Add rank text at bottom-right (rotated 180)
      const bottomRankText = this.add.text(x + 25 * scale, y + 40 * scale, rank, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(16 * scale),
        color: "#000000",
      }).setOrigin(1, 1).setRotation(Math.PI).setDepth(6); // Rotate 180 degrees
      container.add(bottomRankText);

      // Add suit symbol at bottom-right (rotated 180)
      const bottomSuitText = this.add.text(x - 30 * scale, y + 40 * scale, suitSymbol, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scale),
        color: "#000000",
      }).setOrigin(0, 1).setRotation(Math.PI).setDepth(6); // Rotate 180 degrees
      container.add(bottomSuitText);

      container.add(cardSprite);
    }
  }
}
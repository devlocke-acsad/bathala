import { Scene } from "phaser";
import { POKER_HAND_LIST, PokerHandInfo } from "../../data/poker/PokerHandReference";

export class PokerHandReference extends Scene {
  private scrollContainer!: Phaser.GameObjects.Container;
  private backButton!: Phaser.GameObjects.Container;
  private lastPointerY: number = 0;

  constructor() {
    super({ key: "PokerHandReference" });
  }

  init() {
    // Initialize any variables if needed
  }

  create() {
    // Create title
    this.add.text(
      this.cameras.main.width / 2,
      50,
      "POKER HAND REFERENCE",
      {
        fontFamily: "dungeon-mode",
        fontSize: 40,
        color: "#ffd700", // Gold color like in the previous design
        align: "center",
        fontStyle: "bold"
      }
    ).setOrigin(0.5).setDepth(5); // Set depth to ensure visibility

    // Create scrollable content area - full screen with margins
    const contentY = 120; // Increased top margin to avoid blocking back button
    const ySpacing = 200; // More space between entries for cleaner look
    const totalContentHeight = POKER_HAND_LIST.length * ySpacing;

    // Create a container for all hand info that can be scrolled
    this.scrollContainer = this.add.container(
      this.cameras.main.width / 2,
      contentY
    ).setDepth(10); // Set depth higher than background but below scroll area

    // Scale factor for card display
    const cardScale = 0.5; // Slightly larger for better visibility
    const cardWidth = 80 * cardScale;
    const cardHeight = 112 * cardScale;

    // Draw each poker hand info
    POKER_HAND_LIST.forEach((handInfo, index) => {
      const currentY = index * ySpacing;

      // Visual representation for each hand type (sample cards)
      const visualContainer = this.add.container(
        -this.cameras.main.width/2 + 50, // Start from left margin
        currentY + 30
      ).setDepth(11);

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

      // Hand name with better styling
      const handName = this.add.text(
        -this.cameras.main.width/2 + 50 + (cardWidth * 6) + 20, // Positioned to the right of cards with extra space
        currentY + 10,
        `${handInfo.name}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 22,
          color: "#ffd700", // Gold color for better visibility
          align: "left",
        }
      ).setDepth(12);

      // Value and action-specific values on the same line
      const valueAndActions = this.add.text(
        -this.cameras.main.width/2 + 50 + (cardWidth * 6) + 20,
        currentY + 45,
        `VALUE: ${handInfo.value} | ATK: ${handInfo.attackValue} | DEF: ${handInfo.defenseValue} | SPC: ${handInfo.specialValue}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 14,
          color: "#a0a0ff",
          align: "left",
        }
      ).setDepth(12);

      // How to make text - more concise
      const howToMake = this.add.text(
        -this.cameras.main.width/2 + 50,
        currentY + 100,
        `• ${handInfo.howToMake}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 14,
          color: "#e8eced",
          wordWrap: { width: this.cameras.main.width - 100 }, // Use full width minus margins
          align: "left",
        }
      ).setDepth(12);

      this.scrollContainer.add([visualContainer, handName, valueAndActions, howToMake]);
    });

    // Create a proper background that doesn't cover elements
    const backgroundRect = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x1a1a2a,  // Dark blue background
      1           // Fully opaque
    ).setDepth(0); // Lowest depth

    // Create scroll area that captures pointer events - full screen, higher depth to ensure interaction
    const scrollArea = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.01 // Very slight transparency to make it interactive but not visually visible
    ).setOrigin(0.5).setDepth(20); // High depth to ensure it receives events

    scrollArea.setInteractive();

    // Mouse wheel and drag scrolling
    scrollArea.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
      if (Math.abs(deltaY) > 0) { // Only scroll vertically
        const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - 120)); // Adjusted for title and margin
        const newY = Math.max(-(maxScroll), Math.min(0, this.scrollContainer.y - (deltaY * 3))); // Increased sensitivity
        this.scrollContainer.y = newY;
        
        // Prevent default scrolling behavior
        if (pointer.event && pointer.event.preventDefault) {
          pointer.event.preventDefault();
        }
      }
    });

    let isDragging = false;
    let startY = 0;
    let initialY = contentY; // Use contentY as initial position

    scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      startY = pointer.y;
      initialY = this.scrollContainer.y;
    });

    scrollArea.on('pointerup', () => {
      isDragging = false;
    });

    scrollArea.on('pointerout', () => {
      isDragging = false;
    });

    scrollArea.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging && pointer.isDown) {
        const deltaY = pointer.y - startY;
        const newY = initialY + (deltaY * 2); // Multiply for smoother scrolling

        // Calculate max scroll distance (how much we can scroll down)
        const maxScroll = Math.max(0, totalContentHeight - (this.cameras.main.height - 120));

        // Apply bounds: prevent scrolling beyond the content
        this.scrollContainer.y = Math.max(-(maxScroll), Math.min(0, newY));
      }
    });

    // Create back button in top-left corner
    this.createBackButton();
  }

  private createBackButton(): void {
    const buttonX = 80;
    const buttonY = 50;

    this.backButton = this.add.container(buttonX, buttonY).setDepth(15); // Higher depth to ensure visibility

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

  /**
   * Add a sample card to the visual representation container
   */
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
    
    // Log all available textures for debugging
    console.log("Available textures:", this.textures.getTextureKeys());
    console.log(`Looking for texture: ${textureKey}`);

    let cardSprite;

    // Check if texture exists, fallback to generated card if not
    if (this.textures.exists(textureKey)) {
      console.log(`Loading texture: ${textureKey}`); // Debug: check if texture is found
      cardSprite = this.add.image(x, y, textureKey);
      cardSprite.setDisplaySize(80 * scale, 112 * scale);
      cardSprite.setDepth(5); // Higher depth to make sure it's visible
      container.add(cardSprite);
    } else {
      console.log(`Texture not found: ${textureKey}, using fallback. Available textures:`, this.textures.getTextureKeys()); // Debug: texture not found
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

  update(time: number, delta: number): void {
    // Update logic if needed
  }
}
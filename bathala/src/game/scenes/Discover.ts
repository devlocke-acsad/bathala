import { Scene, GameObjects } from "phaser";
import { 
  TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK,
  MANANANGGAL, ASWANG, DUWENDE_CHIEF,
  BAKUNAWA
} from "../../data/enemies/Act1Enemies";

export class Discover extends Scene {
  private title: GameObjects.Text;
  private backButton: GameObjects.Text;
  private scanlines: GameObjects.TileSprite;
  private scanlineTimer: number = 0;
  private cardsContainer: GameObjects.Container;
  private cards: GameObjects.Container[] = [];
  private scrollMask: GameObjects.Graphics;
  // Scrolling variables
  private scrollY: number = 0;
  private targetScrollY: number = 0;
  private maxScroll: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private scrollStartY: number = 0;
  private scrollVelocity: number = 0;
  private lastDragY: number = 0;
  private lastDragTime: number = 0;
  
  // Compendium data
  private compendiumEntries: any[] = [];
  
  // Detailed view elements
  private detailViewContainer: GameObjects.Container;
  private isDetailViewOpen: boolean = false;
  
  constructor() {
    super({ key: "Discover" });
  }

  create() {
    // Set camera background color to match the dark fantasy aesthetic
    this.cameras.main.setBackgroundColor(0x150E10);

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    this.createUI();

    // Load compendium data
    this.loadCompendiumData();

    // Create character cards
    this.createCharacterCards();

    // Create detail view (hidden by default)
    this.createDetailView();

    // Create scroll mask
    this.createScrollMask();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
    
    // Add input listeners for scrolling
    this.input.on('pointerdown', this.startDrag, this);
    this.input.on('pointermove', this.drag, this);
    this.input.on('pointerup', this.endDrag, this);
    this.input.on('wheel', this.handleWheel, this);
    
    // Add keyboard listener for back navigation
    this.input.keyboard.on('keydown-ESC', this.handleBackNavigation, this);
  }

  /**
   * Create prominent CRT scanline effect and background elements
   */
  private createBackgroundEffects(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create dark background with subtle texture
    const backgroundGraphics = this.make.graphics({});
    backgroundGraphics.fillStyle(0x150E10, 1);
    backgroundGraphics.fillRect(0, 0, width, height);
    
    // Add subtle noise texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const alpha = Math.random() * 0.1;
      backgroundGraphics.fillStyle(0x2a1f24, alpha);
      backgroundGraphics.fillRect(x, y, 1, 1);
    }
    
    const backgroundTexture = backgroundGraphics.generateTexture('discoverBackground', width, height);
    const background = this.add.image(0, 0, 'discoverBackground')
      .setOrigin(0)
      .setDepth(-20);
    
    // Create prominent scanlines using a tile sprite
    this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.15)
      .setTint(0x77888C);
      
    // Create a more pronounced scanline pattern
    const graphics = this.make.graphics({});
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 2);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 2, 4, 2);
    
    const texture = graphics.generateTexture('scanline', 4, 4);
    this.scanlines.setTexture('scanline');
    
    // Add decorative border elements
    this.createDecorativeBorders(width, height);
    
    // Move background to the back
    this.scanlines.setDepth(-10);
  }
  
  /**
   * Create decorative border elements for retro fantasy aesthetic
   */
  private createDecorativeBorders(width: number, height: number): void {
    // Corner decorations
    const cornerSize = 40;
    
    // Top-left corner
    const topLeft = this.add.graphics();
    topLeft.lineStyle(2, 0x77888C, 1);
    topLeft.beginPath();
    topLeft.moveTo(20, 0);
    topLeft.lineTo(0, 0);
    topLeft.lineTo(0, 20);
    topLeft.moveTo(0, cornerSize);
    topLeft.lineTo(0, cornerSize + 10);
    topLeft.moveTo(cornerSize, 0);
    topLeft.lineTo(cornerSize + 10, 0);
    topLeft.strokePath();
    
    // Top-right corner
    const topRight = this.add.graphics();
    topRight.lineStyle(2, 0x77888C, 1);
    topRight.beginPath();
    topRight.moveTo(width - 20, 0);
    topRight.lineTo(width, 0);
    topRight.lineTo(width, 20);
    topRight.moveTo(width, cornerSize);
    topRight.lineTo(width, cornerSize + 10);
    topRight.moveTo(width - cornerSize, 0);
    topRight.lineTo(width - cornerSize - 10, 0);
    topRight.strokePath();
    
    // Bottom-left corner
    const bottomLeft = this.add.graphics();
    bottomLeft.lineStyle(2, 0x77888C, 1);
    bottomLeft.beginPath();
    bottomLeft.moveTo(20, height);
    bottomLeft.lineTo(0, height);
    bottomLeft.lineTo(0, height - 20);
    bottomLeft.moveTo(0, height - cornerSize);
    bottomLeft.lineTo(0, height - cornerSize - 10);
    bottomLeft.moveTo(cornerSize, height);
    bottomLeft.lineTo(cornerSize + 10, height);
    bottomLeft.strokePath();
    
    // Bottom-right corner
    const bottomRight = this.add.graphics();
    bottomRight.lineStyle(2, 0x77888C, 1);
    bottomRight.beginPath();
    bottomRight.moveTo(width - 20, height);
    bottomRight.lineTo(width, height);
    bottomRight.lineTo(width, height - 20);
    bottomRight.moveTo(width, height - cornerSize);
    bottomRight.lineTo(width, height - cornerSize - 10);
    bottomRight.moveTo(width - cornerSize, height);
    bottomRight.lineTo(width - cornerSize - 10, height);
    bottomRight.strokePath();
    
    // Set depth to ensure they're behind content but in front of background
    [topLeft, topRight, bottomLeft, bottomRight].forEach(element => {
      element.setDepth(-5);
    });
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title with decorative elements
    this.title = this.add
      .text(screenWidth/2, 50, "Mythical Compendium", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 36,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);
      
    // Add decorative underline to title
    const titleWidth = this.title.width;
    const underline = this.add.graphics();
    underline.lineStyle(3, 0x77888C, 0.8);
    underline.beginPath();
    underline.moveTo(screenWidth/2 - titleWidth/2, 90);
    underline.lineTo(screenWidth/2 + titleWidth/2, 90);
    underline.strokePath();
      
    // Add back button with enhanced styling
    this.backButton = this.add
      .text(40, 40, "← Back", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "left",
      })
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.backButton.setColor("#e8eced");
      })
      .on("pointerout", () => {
        this.backButton.setColor("#77888C");
      })
      .on("pointerdown", () => {
        this.scene.start("MainMenu");
      });
  }
  
  /**
   * Load compendium data from existing enemy definitions
   */
  private loadCompendiumData(): void {
    // Using the imported enemy data and adding more detailed lore information
    this.compendiumEntries = [
      {
        id: "tikbalang",
        name: TIKBALANG.name,
        description: "A creature with the head and torso of a human and the lower body of a horse. Known to lead travelers astray in the forests and mountains.",
        type: "Common",
        health: TIKBALANG.maxHealth,
        attack: TIKBALANG.damage,
        abilities: ["Confuse", "Mischief"],
        lore: "Tikbalangs are benevolent creatures when treated with respect but can be mischievous to those who show them disrespect. They are protectors of the forest and punish those who harm nature. These beings are often seen as guardians of sacred groves and are known for their incredible strength and speed. In some tales, they challenge humans to riddles or races, rewarding those who show wit and respect."
      },
      {
        id: "dwende",
        name: DWENDE.name,
        description: "Tiny people who live in houses, trees, and mounds. They are often seen as protectors of nature.",
        type: "Common",
        health: DWENDE.maxHealth,
        attack: DWENDE.damage,
        abilities: ["Mischief", "Deceive"],
        lore: "Dwendes are household spirits that can be either helpful or harmful depending on how they are treated. They are known to play tricks on people but can also be kind to those who show them respect. These tiny beings are often associated with specific locations, such as anthills, termite mounds, or large trees. They are believed to have the power to influence luck, both good and bad, in the lives of those around them."
      },
      {
        id: "kapre",
        name: KAPRE.name,
        description: "A giant tree-dwelling creature that smokes enormous cigars. They are known to be mostly harmless unless provoked.",
        type: "Common",
        health: KAPRE.maxHealth,
        attack: KAPRE.damage,
        abilities: ["Smoke", "Hide"],
        lore: "Kapres are gentle giants that live in large trees, particularly bamboo groves and old mango trees. They are known for their love of tobacco and are often heard laughing in the woods at night. Despite their intimidating size, kapres are generally peaceful and can even be helpful to humans who treat them kindly. They are said to possess great strength and can move trees and rocks with ease."
      },
      {
        id: "sigbin",
        name: SIGBIN.name,
        description: "A dog-like creature with a taste for human blood and filth. They can become invisible and travel backwards.",
        type: "Common",
        health: SIGBIN.maxHealth,
        attack: SIGBIN.damage,
        abilities: ["Invisibility", "Backwards Movement"],
        lore: "Sigbins are evil creatures that feed on human blood and waste. They are known for their ability to become invisible and travel backwards, making them difficult to track. They are often associated with witches and dark magic. In some stories, sigbins are said to be the familiars of witches, doing their bidding in exchange for offerings of blood or other dark substances."
      },
      {
        id: "tiyanak",
        name: TIYANAK.name,
        description: "A baby vampire that appears as a crying infant to lure victims into caring for it, then attacks.",
        type: "Common",
        health: TIYANAK.maxHealth,
        attack: TIYANAK.damage,
        abilities: ["Deceive", "Lure"],
        lore: "Tiyanak appears as a lost, crying baby to take advantage of people's compassion. Once picked up, it reveals its true form and attacks. It is considered a punishment for those who abandon their children. This creature represents the consequences of neglecting one's responsibilities, particularly those towards the vulnerable. In some tales, tiyanaks are said to be the spirits of stillborn children who were not given proper burial rites."
      },
      {
        id: "manananggal",
        name: MANANANGGAL.name,
        description: "A vampire-like creature that can sever its upper torso from its lower body to fly around.",
        type: "Elite",
        health: MANANANGGAL.maxHealth,
        attack: MANANANGGAL.damage,
        abilities: ["Flight", "Split"],
        lore: "Manananggals are among the most feared creatures in Filipino mythology. They appear as beautiful women during the day but transform into winged vampires at night. They use their long tongue to suck blood from sleeping victims. These creatures are said to be created when a woman's intense hatred or desire for revenge becomes so powerful that it physically transforms her. They are particularly dangerous during pregnancy, as they are believed to target unborn children."
      },
      {
        id: "aswang",
        name: ASWANG.name,
        description: "A shapeshifting monster that can take the form of humans or animals to hunt for prey.",
        type: "Elite",
        health: ASWANG.maxHealth,
        attack: ASWANG.damage,
        abilities: ["Shapeshift", "Hunt"],
        lore: "Aswangs are perhaps the most versatile and dangerous creatures in Filipino folklore. They can take many forms and specialize in eating fetuses and internal organs. They are known for their ability to stretch their necks unnaturally long. These creatures represent the darker aspects of human nature, particularly greed and the desire to consume at the expense of others. In some stories, aswangs are said to be created through dark rituals or curses."
      },
      {
        id: "duwende-chief",
        name: DUWENDE_CHIEF.name,
        description: "A powerful leader of the dwende community with enhanced abilities and commanding presence.",
        type: "Elite",
        health: DUWENDE_CHIEF.maxHealth,
        attack: DUWENDE_CHIEF.damage,
        abilities: ["Command", "Leadership"],
        lore: "The Duwende Chief rules over the dwende community and has powers beyond ordinary dwendes. They are both feared and respected by other mythical beings. They protect their territories fiercely and can command other nature spirits. Unlike regular dwendes, the chief is often depicted as being more humanoid in appearance, though still small in stature. They are known for their wisdom and are sometimes sought out by humans for advice, though gaining their favor requires great respect and proper offerings."
      },
      {
        id: "bakunawa",
        name: BAKUNAWA.name,
        description: "A giant sea serpent that causes eclipses by attempting to devour the sun or moon.",
        type: "Boss",
        health: BAKUNAWA.maxHealth,
        attack: BAKUNAWA.damage,
        abilities: ["Eclipse", "Devour"],
        lore: "Bakunawa is a massive serpent that circles the earth, occasionally trying to eat the sun or moon, causing eclipses. It is said to be so large that it can swallow the moon whole. Ancient Filipinos would make loud noises during eclipses to scare the beast away. This creature represents the eternal struggle between light and darkness, order and chaos. In some myths, Bakunawa was once a beautiful woman transformed into a serpent as punishment for her vanity or defiance of the gods."
      }
    ];
  }
  
  /**
   * Create character cards for display
   */
  private createCharacterCards(): void {
    const screenWidth = this.cameras.main.width;
    
    // Create container for cards
    this.cardsContainer = this.add.container(0, 0);
    
    // Clear existing cards
    this.cards = [];
    
    // Calculate grid positions
    const cardWidth = 200;
    const cardHeight = 250;
    const cardSpacing = 30;
    const cardsPerRow = Math.floor((screenWidth - 100) / (cardWidth + cardSpacing));
    const startX = (screenWidth - (cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing)) / 2;
    const startY = 150;
    
    // Create a card for each entry
    this.compendiumEntries.forEach((entry, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const x = startX + col * (cardWidth + cardSpacing);
      const y = startY + row * (cardHeight + cardSpacing);
      
      const card = this.createCharacterCard(entry, x, y, cardWidth, cardHeight);
      this.cardsContainer.add(card);
      this.cards.push(card);
    });
    
    // Calculate max scroll based on the last card position
    const lastRow = Math.floor((this.compendiumEntries.length - 1) / cardsPerRow);
    const contentHeight = startY + lastRow * (cardHeight + cardSpacing) + cardHeight;
    const screenHeight = this.cameras.main.height;
    this.maxScroll = Math.max(0, contentHeight - screenHeight + 100);
  }
  
  /**
   * Create a single character card with image representation
   */
  private createCharacterCard(entry: any, x: number, y: number, width: number, height: number): GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background with enhanced styling
    const background = this.add.rectangle(0, 0, width, height, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0);
      
    // Card header with decorative elements
    const headerBar = this.add.rectangle(0, 0, width, 40, 0x1d151a)
      .setOrigin(0);
      
    // Card header with name and type
    const nameText = this.add.text(width/2, 20, entry.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    const typeText = this.add.text(width - 10, 10, entry.type, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0"
    }).setOrigin(1, 0);
    
    // Character representation (symbolic image)
    const symbol = this.getCharacterSymbol(entry.id);
    const symbolText = this.add.text(width/2, 70, symbol, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 60,
      color: entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0"
    }).setOrigin(0.5);
    
    // Description preview
    const descriptionText = this.add.text(10, 130, this.truncateText(entry.description, 60), {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#a9b4b8",
      wordWrap: { width: width - 20 },
      lineSpacing: 2
    }).setOrigin(0);
    
    // Lore preview
    const lorePreview = this.add.text(10, height - 40, this.truncateText(entry.lore, 40) + "...", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#8a9a9f",
      fontStyle: "italic",
      wordWrap: { width: width - 20 }
    }).setOrigin(0);
    
    // Click to view details text
    const clickText = this.add.text(width/2, height - 15, "Click for details", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#77888C"
    }).setOrigin(0.5);
    
    // Make card interactive with hover effects
    background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => {
        this.showCharacterDetails(entry);
      })
      .on('pointerover', () => {
        // Hover effect
        background.setFillStyle(0x3a2a32);
        container.setScale(1.05);
      })
      .on('pointerout', () => {
        // Reset effect
        background.setFillStyle(0x2a1f24);
        container.setScale(1);
      });
    
    container.add([background, headerBar, nameText, typeText, symbolText, descriptionText, lorePreview, clickText]);
    return container;
  }
  
  /**
   * Get symbolic representation for a character
   */
  private getCharacterSymbol(id: string): string {
    switch (id) {
      case "tikbalang": return "🐴";
      case "dwende": return "👤";
      case "kapre": return "🚬";
      case "sigbin": return "🐕";
      case "tiyanak": return "👶";
      case "manananggal": return "🦇";
      case "aswang": return "🧟";
      case "duwende-chief": return "👑";
      case "bakunawa": return "🐍";
      default: return "👹";
    }
  }
  
  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  }
  
  /**
   * Create detailed view for character information
   */
  private createDetailView(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create container for detailed view
    this.detailViewContainer = this.add.container(0, 0);
    this.detailViewContainer.setVisible(false);
    
    // Background overlay
    const overlay = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(0.8);
      
    // Detailed view background
    const detailBackground = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth - 100, screenHeight - 100, 0x2a1f24)
      .setStrokeStyle(2, 0x77888C)
      .setOrigin(0.5);
      
    // Close button
    const closeButton = this.add.text(screenWidth - 80, 80, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#ff6b6b"
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.handleBackNavigation();
      });
      
    // Character name
    const nameText = this.add.text(screenWidth/2, 120, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 32,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    // Character type
    const typeText = this.add.text(screenWidth/2, 160, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C"
    }).setOrigin(0.5);
    
    // Character symbol
    const symbolText = this.add.text(screenWidth/2, 220, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 80,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    // Stats
    const statsText = this.add.text(screenWidth/2 - 150, 300, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C"
    }).setOrigin(0);
    
    // Abilities
    const abilitiesText = this.add.text(screenWidth/2 + 50, 300, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#c9a74a"
    }).setOrigin(0);
    
    // Description
    const descriptionTitle = this.add.text(screenWidth/2, 350, "Description", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    const descriptionText = this.add.text(screenWidth/2, 380, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#a9b4b8",
      wordWrap: { width: screenWidth - 200 },
      lineSpacing: 3
    }).setOrigin(0.5, 0);
    
    // Lore
    const loreTitle = this.add.text(screenWidth/2, 480, "Mythology & Lore", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    const loreText = this.add.text(screenWidth/2, 510, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#8a9a9f",
      fontStyle: "italic",
      wordWrap: { width: screenWidth - 200 },
      lineSpacing: 3
    }).setOrigin(0.5, 0);
    
    this.detailViewContainer.add([
      overlay, detailBackground, closeButton, nameText, typeText, symbolText,
      statsText, abilitiesText, descriptionTitle, descriptionText, loreTitle, loreText
    ]);
  }
  
  /**
   * Show detailed view of a character
   */
  private showCharacterDetails(entry: any): void {
    this.isDetailViewOpen = true;
    
    // Update detail view content
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Get text elements from container
    const nameText = this.detailViewContainer.getAt(3) as GameObjects.Text;
    const typeText = this.detailViewContainer.getAt(4) as GameObjects.Text;
    const symbolText = this.detailViewContainer.getAt(5) as GameObjects.Text;
    const statsText = this.detailViewContainer.getAt(6) as GameObjects.Text;
    const abilitiesText = this.detailViewContainer.getAt(7) as GameObjects.Text;
    const descriptionText = this.detailViewContainer.getAt(9) as GameObjects.Text;
    const loreText = this.detailViewContainer.getAt(11) as GameObjects.Text;
    
    // Update content
    nameText.setText(entry.name);
    typeText.setText(entry.type);
    typeText.setColor(entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0");
    symbolText.setText(this.getCharacterSymbol(entry.id));
    symbolText.setColor(entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0");
    statsText.setText("Health: " + entry.health + "\nAttack: " + entry.attack);
    abilitiesText.setText("Abilities:\n" + (entry.abilities ? entry.abilities.join("\n") : "None"));
    descriptionText.setText(entry.description);
    loreText.setText(entry.lore);
    
    // Show detail view
    this.detailViewContainer.setVisible(true);
    
    // Hide main content
    this.title.setVisible(false);
    this.cardsContainer.setVisible(false);
  }
  
  /**
   * Handle back navigation (ESC key or back button)
   */
  private handleBackNavigation(): void {
    if (this.isDetailViewOpen) {
      this.hideCharacterDetails();
    } else {
      this.scene.start("MainMenu");
    }
  }
  
  /**
   * Create scroll mask for the cards container
   */
  private createScrollMask(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create mask
    this.scrollMask = this.make.graphics({});
    this.scrollMask.fillStyle(0xffffff);
    this.scrollMask.beginPath();
    this.scrollMask.fillRect(0, 120, screenWidth, screenHeight - 140);
    this.scrollMask.fillPath();
    
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.beginPath();
    maskShape.fillRect(0, 120, screenWidth, screenHeight - 140);
    maskShape.fillPath();
    
    const mask = maskShape.createGeometryMask();
    this.cardsContainer.setMask(mask);
  }
  
  /**
   * Handle mouse wheel scrolling
   */
  private handleWheel(_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number, _deltaZ: number): void {
    if (this.isDetailViewOpen) return;
    
    this.targetScrollY += deltaY * 0.5;
    this.targetScrollY = Phaser.Math.Clamp(this.targetScrollY, -this.maxScroll, 0);
  }
  
  /**
   * Start drag for scrolling
   */
  private startDrag(pointer: Phaser.Input.Pointer): void {
    if (this.isDetailViewOpen) return;
    
    this.isDragging = true;
    this.dragStartY = pointer.y;
    this.scrollStartY = this.scrollY;
    this.scrollVelocity = 0;
    this.lastDragY = pointer.y;
    this.lastDragTime = performance.now();
  }
  
  /**
   * Handle drag for scrolling
   */
  private drag(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || this.isDetailViewOpen) return;
    
    const now = performance.now();
    const deltaTime = now - this.lastDragTime;
    
    if (deltaTime > 0) {
      this.scrollVelocity = (pointer.y - this.lastDragY) / deltaTime;
      this.lastDragY = pointer.y;
      this.lastDragTime = now;
    }
    
    const dragDelta = pointer.y - this.dragStartY;
    this.targetScrollY = Phaser.Math.Clamp(this.scrollStartY + dragDelta, -this.maxScroll, 0);
  }
  
  /**
   * End drag for scrolling
   */
  private endDrag(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Apply momentum scrolling
    if (Math.abs(this.scrollVelocity) > 0.1) {
      // Continue scrolling with velocity
      this.applyMomentumScroll();
    }
  }
  
  /**
   * Apply momentum scrolling
   */
  private applyMomentumScroll(): void {
    if (this.isDetailViewOpen || this.isDragging) return;
    
    // Reduce velocity over time
    this.scrollVelocity *= 0.95;
    
    // Apply velocity to scroll
    this.targetScrollY += this.scrollVelocity * 10;
    this.targetScrollY = Phaser.Math.Clamp(this.targetScrollY, -this.maxScroll, 0);
    
    // Continue momentum if velocity is still significant
    if (Math.abs(this.scrollVelocity) > 0.01) {
      this.time.delayedCall(16, this.applyMomentumScroll, [], this);
    } else {
      this.scrollVelocity = 0;
    }
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createBackgroundEffects();
    this.createUI();
    this.createCharacterCards();
    this.createDetailView();
    this.createScrollMask();
  }

  /**
   * Hide detailed view and return to main view
   */
  private hideCharacterDetails(): void {
    this.isDetailViewOpen = false;
    
    // Hide detail view
    this.detailViewContainer.setVisible(false);
    
    // Show main content
    this.title.setVisible(true);
    this.cardsContainer.setVisible(true);
  }
  
  /**
   * Update method for animation effects and smooth scrolling
   */
  update(): void {
    // Animate the scanlines
    if (this.scanlines) {
      this.scanlineTimer += 16; // Use fixed delta for consistency
      // Move scanlines vertically to simulate CRT effect at a faster pace
      this.scanlines.tilePositionY = this.scanlineTimer * 0.1;
    }
    
    // Smooth scrolling
    if (!this.isDragging) {
      // Ease towards target scroll position
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.1;
      
      // Snap to target when close enough
      if (Math.abs(this.targetScrollY - this.scrollY) < 0.1) {
        this.scrollY = this.targetScrollY;
      }
    } else {
      // Direct scrolling when dragging
      this.scrollY = this.targetScrollY;
    }
    
    // Apply scroll position to container
    if (this.cardsContainer) {
      this.cardsContainer.y = this.scrollY;
    }
  }
}
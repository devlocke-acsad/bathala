import { Scene, GameObjects } from "phaser";
import { 
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  KAPRE_SHADE,
  TAWONG_LIPOD,
  MANGNANGAWAY
} from "../../data/enemies/Act1Enemies";

export class Discover extends Scene {
  private title: GameObjects.Text;
  private backButton: GameObjects.Text;
  private scanlines: GameObjects.TileSprite;
  private scanlineTimer: number = 0;
  private cardsContainer: GameObjects.Container;
  private cards: GameObjects.Container[] = [];
  private scrollMask: GameObjects.Graphics;
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
  
  // Text elements for detail view
  private detailNameText: GameObjects.Text;
  private detailTypeText: GameObjects.Text;
  private detailSymbolText: GameObjects.Text;
  private detailSpriteImage: GameObjects.Image | null = null; // Add sprite support
  private detailStatsText: GameObjects.Text;
  private detailAbilitiesText: GameObjects.Text;
  private detailDescriptionText: GameObjects.Text;
  private detailLoreText: GameObjects.Text;
  
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
   * Create subtle background effects
   */
  private createBackgroundEffects(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create dark background
    this.add.rectangle(0, 0, width, height, 0x150E10).setOrigin(0);
    
    // Create subtle scanlines using a tile sprite
    this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.08)
      .setTint(0x4a3a40);
      
    // Create a subtle scanline pattern
    const graphics = this.make.graphics({});
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 2, 1);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 1, 2, 1);
    
    const texture = graphics.generateTexture('scanline', 2, 2);
    this.scanlines.setTexture('scanline');
    
    // Move background to the back
    this.scanlines.setDepth(-10);
  }

  /**
   * Create UI elements with improved typography
   */
  private createUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title with improved styling
    this.title = this.add
      .text(screenWidth/2, 60, "Mythical Compendium", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);
      
    // Add subtle underline to title
    const titleWidth = this.title.width;
    const underline = this.add.graphics();
    underline.lineStyle(2, 0x4a3a40, 0.6);
    underline.beginPath();
    underline.moveTo(screenWidth/2 - titleWidth/2, 100);
    underline.lineTo(screenWidth/2 + titleWidth/2, 100);
    underline.strokePath();
      
    // Add back button with cleaner styling
    this.backButton = this.add
      .text(50, 50, "← Back", {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#77888C",
        align: "left",
      })
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        this.tweens.add({
          targets: this.backButton,
          color: 0xe8eced,
          duration: 200
        });
      })
      .on("pointerout", () => {
        this.tweens.add({
          targets: this.backButton,
          color: 0x77888C,
          duration: 200
        });
      })
      .on("pointerdown", () => {
        // Add press effect
        this.tweens.add({
          targets: this.backButton,
          scale: 0.9,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.handleBackNavigation();
          }
        });
      });
  }
  
  /**
   * Load compendium data from existing enemy definitions
   */
  private loadCompendiumData(): void {
    this.compendiumEntries = [
      {
        id: "tikbalang_scout",
        name: TIKBALANG_SCOUT.name,
        description: "A creature with the head of a horse that misleads travelers.",
        type: "Common",
        health: TIKBALANG_SCOUT.maxHealth,
        attack: TIKBALANG_SCOUT.damage,
        abilities: ["Confuse"],
        lore: "Tikbalang were forest protectors, now they mislead with backward hooves."
      },
      {
        id: "balete_wraith",
        name: BALETE_WRAITH.name,
        description: "A spirit inhabiting a Balete tree, a portal to the spirit world.",
        type: "Common",
        health: BALETE_WRAITH.maxHealth,
        attack: BALETE_WRAITH.damage,
        abilities: ["Strengthen"],
        lore: "Balete trees are anito portals, haunted by engkanto-twisted spirits."
      },
      {
        id: "sigbin_charger",
        name: SIGBIN_CHARGER.name,
        description: "A creature that steals hearts for its amulets.",
        type: "Common",
        health: SIGBIN_CHARGER.maxHealth,
        attack: SIGBIN_CHARGER.damage,
        abilities: ["Charge"],
        lore: "Sigbin steal hearts for amulets, once loyal to Bathala."
      },
      {
        id: "duwende_trickster",
        name: DUWENDE_TRICKSTER.name,
        description: "A goblin-like creature that can grant boons or curses.",
        type: "Common",
        health: DUWENDE_TRICKSTER.maxHealth,
        attack: DUWENDE_TRICKSTER.damage,
        abilities: ["Steal Block", "Disrupt Draw"],
        lore: "Duwende grant boons/curses, warped by engkanto lies."
      },
      {
        id: "tiyanak_ambusher",
        name: TIYANAK_AMBUSHER.name,
        description: "A lost infant spirit that mimics a baby's cry to lure its victims.",
        type: "Common",
        health: TIYANAK_AMBUSHER.maxHealth,
        attack: TIYANAK_AMBUSHER.damage,
        abilities: ["Fear", "Critical Attack"],
        lore: "Tiyanak, lost infant spirits mimicking babies to attack."
      },
      {
        id: "amomongo",
        name: AMOMONGO.name,
        description: "An ape-like creature with long nails that attacks livestock.",
        type: "Common",
        health: AMOMONGO.maxHealth,
        attack: AMOMONGO.damage,
        abilities: ["Bleed"],
        lore: "Amomongo, ape-like with long nails, attacking livestock."
      },
      {
        id: "bungisngis",
        name: BUNGISNGIS.name,
        description: "A one-eyed laughing giant.",
        type: "Common",
        health: BUNGISNGIS.maxHealth,
        attack: BUNGISNGIS.damage,
        abilities: ["Laugh Debuff"],
        lore: "Bungisngis, one-eyed laughing giants, once jovial."
      },
      {
        id: "kapre_shade",
        name: KAPRE_SHADE.name,
        description: "A tree giant that smokes a large cigar.",
        type: "Elite",
        health: KAPRE_SHADE.maxHealth,
        attack: KAPRE_SHADE.damage,
        abilities: ["AoE Burn", "Summon Minions"],
        lore: "Kapre, tree giants smoking cigars, loyal to Bathala."
      },
      {
        id: "tawong_lipod",
        name: TAWONG_LIPOD.name,
        description: "An invisible wind being.",
        type: "Elite",
        health: TAWONG_LIPOD.maxHealth,
        attack: TAWONG_LIPOD.damage,
        abilities: ["Invisible", "Stun"],
        lore: "Tawong Lipod, invisible Bikol wind beings, once harmonious."
      },
      {
        id: "mangangaway",
        name: MANGNANGAWAY.name,
        description: "A sorcerer who casts evil spells.",
        type: "Boss",
        health: MANGNANGAWAY.maxHealth,
        attack: MANGNANGAWAY.damage,
        abilities: ["Mimic Elements", "Curse Cards"],
        lore: "Mangangaway, sorcerers casting evil spells."
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
    const cardWidth = 180;
    const cardHeight = 160;
    const cardSpacing = 25;
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
   * Create a single character card with clean, minimalist design
   */
  private createCharacterCard(entry: any, x: number, y: number, width: number, height: number): GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card background with subtle styling
    const background = this.add.rectangle(0, 0, width, height, 0x1d151a)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0);
      
    // Get sprite key for this character
    const spriteKey = this.getCharacterSpriteKey(entry.id);
    
    // Character sprite (instead of emoji)
    let characterSprite: Phaser.GameObjects.Image;
    if (this.textures.exists(spriteKey)) {
      characterSprite = this.add.image(width/2, 45, spriteKey)
        .setOrigin(0.5)
        .setDisplaySize(70, 70); // Fit sprite in card
    } else {
      // Fallback to emoji if sprite not found
      const symbol = this.getCharacterSymbol(entry.id);
      characterSprite = this.add.text(width/2, 45, symbol, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#77888C"
      }).setOrigin(0.5) as any;
    }
    
    // Character name (cleaner styling)
    const nameText = this.add.text(width/2, 95, entry.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#e8eced",
      wordWrap: { width: width - 20 },
      align: "center"
    }).setOrigin(0.5);
    
    // Character type badge
    const typeColorHex = entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0";
    const typeColor = entry.type === "Boss" ? 0xff6b6b : entry.type === "Elite" ? 0xffd93d : 0x06d6a0;
    const typeBadge = this.add.rectangle(width/2, 125, 80, 20, 0x2a1f24)
      .setStrokeStyle(1, typeColor)
      .setOrigin(0.5);
      
    const typeText = this.add.text(width/2, 125, entry.type, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: typeColorHex
    }).setOrigin(0.5);
    
    // Subtle hover effect
    background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => {
        // Add a press effect
        this.tweens.add({
          targets: container,
          scale: 0.95,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.showCharacterDetails(entry);
          }
        });
      })
      .on('pointerover', () => {
        // Subtle hover effect
        background.setFillStyle(0x2a1f24);
        this.tweens.add({
          targets: container,
          scale: 1.05,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        // Reset effect
        background.setFillStyle(0x1d151a);
        this.tweens.add({
          targets: container,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
      });
    
    container.add([background, characterSprite, nameText, typeBadge, typeText]);
    return container;
  }
  
  /**
   * Get sprite key for a character
   */
  private getCharacterSpriteKey(id: string): string {
    const spriteMap: Record<string, string> = {
      "tikbalang_scout": "tikbalang_combat",
      "balete_wraith": "balete_combat",
      "sigbin_charger": "sigbin_combat",
      "duwende_trickster": "duwende_combat",
      "tiyanak_ambusher": "tiyanak_combat",
      "amomongo": "amomongo_combat",
      "bungisngis": "bungisngis_combat",
      "kapre_shade": "kapre_combat",
      "tawong_lipod": "tawonglipod_combat",
      "mangangaway": "mangangaway_combat"
    };
    return spriteMap[id] || "tikbalang_combat";
  }
  
  /**
   * Get symbolic representation for a character
   */
  private getCharacterSymbol(id: string): string {
    switch (id) {
      case "tikbalang_scout": return "🐴";
      case "balete_wraith": return "🌳";
      case "sigbin_charger": return "🐕";
      case "duwende_trickster": return "👤";
      case "tiyanak_ambusher": return "👶";
      case "amomongo": return "🦍";
      case "bungisngis": return "😄";
      case "kapre_shade": return "🚬";
      case "tawong_lipod": return "💨";
      case "mangangaway": return "🧙";
      default: return "👹";
    }
  }
  
  /**
   * Create detailed view for character information with improved styling
   */
  private createDetailView(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create container for detailed view
    this.detailViewContainer = this.add.container(0, 0);
    this.detailViewContainer.setVisible(false);
    
    // Background overlay with subtle transparency
    const overlay = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(0.7);
      
    // Detailed view background with consistent styling
    const detailBackground = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth - 120, screenHeight - 120, 0x1d151a)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5);
      
    // Close button
    const closeButton = this.add.text(screenWidth - 90, 90, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ff6b6b"
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.handleBackNavigation();
      });
      
    // Character name with improved styling
    this.detailNameText = this.add.text(screenWidth/2, 130, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 28,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    // Character type with consistent badge styling
    const typeBadge = this.add.rectangle(screenWidth/2, 170, 100, 25, 0x2a1f24)
      .setStrokeStyle(1, 0x77888C)
      .setOrigin(0.5);
    
    this.detailTypeText = this.add.text(screenWidth/2, 170, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C"
    }).setOrigin(0.5);
    
    // Character symbol
    this.detailSymbolText = this.add.text(screenWidth/2, 230, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 70,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    // Stats section title
    const statsTitle = this.add.text(screenWidth/2 - 150, 300, "STATS", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C"
    }).setOrigin(0);
    
    // Stats container
    const statsContainer = this.add.rectangle(screenWidth/2 - 150, 330, 140, 60, 0x2a1f24)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0);
    
    // Stats text
    this.detailStatsText = this.add.text(screenWidth/2 - 140, 340, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#a9b4b8",
      wordWrap: { width: 120 }
    }).setOrigin(0);
    
    // Abilities section title
    const abilitiesTitle = this.add.text(screenWidth/2 + 50, 300, "ABILITIES", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C"
    }).setOrigin(0);
    
    // Abilities container
    const abilitiesContainer = this.add.rectangle(screenWidth/2 + 50, 330, 200, 60, 0x2a1f24)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0);
    
    // Abilities text
    this.detailAbilitiesText = this.add.text(screenWidth/2 + 60, 340, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#c9a74a",
      wordWrap: { width: 180 }
    }).setOrigin(0);
    
    // Description section
    const descriptionTitle = this.add.text(screenWidth/2, 420, "DESCRIPTION", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    const descriptionContainer = this.add.rectangle(screenWidth/2, 460, screenWidth - 200, 80, 0x2a1f24)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5, 0);
    
    this.detailDescriptionText = this.add.text(screenWidth/2, 470, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#a9b4b8",
      wordWrap: { width: screenWidth - 220 },
      lineSpacing: 2
    }).setOrigin(0.5, 0);
    
    // Lore section
    const loreTitle = this.add.text(screenWidth/2, 560, "MYTHOLOGY & LORE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    const loreContainer = this.add.rectangle(screenWidth/2, 600, screenWidth - 200, 120, 0x2a1f24)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5, 0);
    
    this.detailLoreText = this.add.text(screenWidth/2, 610, "", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#8a9a9f",
      fontStyle: "italic",
      wordWrap: { width: screenWidth - 220 },
      lineSpacing: 2
    }).setOrigin(0.5, 0);
    
    this.detailViewContainer.add([
      overlay, detailBackground, closeButton, this.detailNameText, typeBadge, this.detailTypeText, this.detailSymbolText,
      statsTitle, statsContainer, this.detailStatsText, abilitiesTitle, abilitiesContainer, this.detailAbilitiesText,
      descriptionTitle, descriptionContainer, this.detailDescriptionText, loreTitle, loreContainer, this.detailLoreText
    ]);
  }
  
  /**
   * Show detailed view of a character with animation
   */
  private showCharacterDetails(entry: any): void {
    this.isDetailViewOpen = true;
    
    // Update content with consistent styling
    this.detailNameText.setText(entry.name);
    
    this.detailTypeText.setText(entry.type);
    const typeColorHex = entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0";
    const typeColor = entry.type === "Boss" ? 0xff6b6b : entry.type === "Elite" ? 0xffd93d : 0x06d6a0;
    this.detailTypeText.setColor(typeColorHex);
    
    // Try to use sprite first, fallback to emoji
    const spriteKey = this.getCharacterSpriteKey(entry.id);
    const screenWidth = this.cameras.main.width;
    
    if (this.textures.exists(spriteKey)) {
      // Remove old sprite if exists
      if (this.detailSpriteImage) {
        this.detailSpriteImage.destroy();
      }
      
      // Hide emoji text
      this.detailSymbolText.setVisible(false);
      
      // Create new sprite
      this.detailSpriteImage = this.add.image(screenWidth/2, 230, spriteKey)
        .setOrigin(0.5)
        .setDisplaySize(120, 120);
      
      // Add to detail view container (move to front)
      this.detailViewContainer.add(this.detailSpriteImage);
      this.detailViewContainer.bringToTop(this.detailSpriteImage);
    } else {
      // Remove sprite if exists
      if (this.detailSpriteImage) {
        this.detailSpriteImage.destroy();
        this.detailSpriteImage = null;
      }
      
      // Show and update emoji text as fallback
      this.detailSymbolText.setVisible(true);
      this.detailSymbolText.setText(this.getCharacterSymbol(entry.id));
      this.detailSymbolText.setColor(typeColorHex);
    }
    
    this.detailStatsText.setText("Health: " + entry.health + "\nAttack: " + entry.attack);
    this.detailAbilitiesText.setText(entry.abilities ? entry.abilities.join("\n") : "None");
    this.detailDescriptionText.setText(entry.description);
    this.detailLoreText.setText(entry.lore);
    
    // Hide main content
    this.title.setVisible(false);
    this.cardsContainer.setVisible(false);
    
    // Animate detail view entrance
    this.detailViewContainer.setAlpha(0);
    this.detailViewContainer.setVisible(true);
    
    this.tweens.add({
      targets: this.detailViewContainer,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }
  
  /**
   * Hide detailed view and return to main view with animation
   */
  private hideCharacterDetails(): void {
    this.isDetailViewOpen = false;
    
    // Animate detail view exit
    this.tweens.add({
      targets: this.detailViewContainer,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Clean up sprite if exists
        if (this.detailSpriteImage) {
          this.detailSpriteImage.destroy();
          this.detailSpriteImage = null;
        }
        
        // Hide detail view
        this.detailViewContainer.setVisible(false);
        
        // Show main content
        this.title.setVisible(true);
        this.cardsContainer.setVisible(true);
      }
    });
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
    this.scrollMask.fillRect(0, 120, screenWidth, screenHeight - 140);
    
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, 120, screenWidth, screenHeight - 140);
    
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
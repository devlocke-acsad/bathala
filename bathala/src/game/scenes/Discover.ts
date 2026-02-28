import { Scene, GameObjects } from "phaser";
import { EnemyRegistry } from "../../core/registries/EnemyRegistry";
import { bootstrapEnemies } from "../../data/enemies/EnemyBootstrap";

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
  private detailContentContainer: GameObjects.Container; // Scrollable content
  private detailScrollY: number = 0;
  private detailMaxScroll: number = 0;
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
  
  // Design elements for dynamic coloring
  private detailTopAccent: GameObjects.Rectangle;
  private detailTypeBadge: GameObjects.Rectangle;
  private detailOuterGlow: GameObjects.Rectangle;
  
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
    bootstrapEnemies();
    const getEnemyConfig = (id: string) => EnemyRegistry.getConfigOrThrow(id);
    const tikbalangScout = getEnemyConfig('tikbalang_scout');
    const baleteWraith = getEnemyConfig('balete_wraith');
    const sigbinCharger = getEnemyConfig('sigbin_charger');
    const duwendeTrickster = getEnemyConfig('duwende_trickster');
    const tiyanakAmbusher = getEnemyConfig('tiyanak_ambusher');
    const amomongo = getEnemyConfig('amomongo');
    const bungisngis = getEnemyConfig('bungisngis');
    const kapreShade = getEnemyConfig('kapre_shade');
    const tawongLipod = getEnemyConfig('tawong_lipod');
    const mangangaway = getEnemyConfig('mangangaway');

    this.compendiumEntries = [
      {
        id: "tikbalang_scout",
        name: tikbalangScout.name,
        description: "Horse-headed trickster spirits that guard mountain passes and mislead travelers with backward hoof prints. Their chaotic nature confuses targeting and disorients those who dare trespass their domain.",
        type: "Common",
        health: tikbalangScout.maxHealth,
        attack: tikbalangScout.damage,
        abilities: ["Confuse", "Misdirection"],
        lore: "Tagalog mountain spirits with horse heads and human bodies, Tikbalang once protected sacred forests for Bathala. Their backward footprints lead travelers in circles—tradition says wearing your shirt inside-out breaks their spell. Now corrupted by engkanto lies, these former guardians serve only deception."
      },
      {
        id: "balete_wraith",
        name: baleteWraith.name,
        description: "Tormented spirits bound to ancient Balete trees—sacred portals between the mortal realm and the spirit world. They gain strength when wounded, feeding on the pain of intrusion.",
        type: "Common",
        health: baleteWraith.maxHealth,
        attack: baleteWraith.damage,
        abilities: ["Strengthen When Hurt", "Vulnerable"],
        lore: "Balete strangler figs are revered as dwelling places of anito spirits, their aerial roots forming curtains between worlds. To cut a Balete without permission invites misfortune. Once benevolent guardians of these sacred portals, engkanto corruption has twisted them into wraiths that ensnare intruders in spectral roots."
      },
      {
        id: "sigbin_charger",
        name: sigbinCharger.name,
        description: "Goat-like nocturnal creatures that walk backward and emit a foul stench. They steal hearts to forge dark amulets, charging with devastating burst attacks every third turn.",
        type: "Common",
        health: sigbinCharger.maxHealth,
        attack: sigbinCharger.damage,
        abilities: ["Burst Attack (Every 3 Turns)", "Heart Steal"],
        lore: "Visayan cryptids resembling hornless goats with large ears, Sigbin walk backward with heads lowered between hind legs. Legend says capturing one yields a heart that grants invisibility. Once loyal servants of Bathala, corruption turned them into vicious hunters harvesting hearts for the false god's rise."
      },
      {
        id: "duwende_trickster",
        name: duwendeTrickster.name,
        description: "Mischievous goblin-folk dwelling in anthills and ancient mounds. Their unpredictable magic can grant fortune or misfortune, now twisted to steal your defenses and disrupt your strategy.",
        type: "Common",
        health: duwendeTrickster.maxHealth,
        attack: duwendeTrickster.damage,
        abilities: ["Steal Block", "Disrupt Draw", "Fortune Reversal"],
        lore: "Known as 'Nuno sa Punso' (old man of the mound), Duwende inhabit anthills and tree stumps. Tradition demands 'Tabi-tabi po' (Excuse me) when passing their homes—offending them brings illness and bad luck. Once neutral judges of kapwa (reciprocal respect), engkanto lies corrupted them into petty tricksters."
      },
      {
        id: "tiyanak_ambusher",
        name: tiyanakAmbusher.name,
        description: "Demonic spirits of unbaptized or aborted children that mimic infant cries to lure victims into the forest. Their ambush strikes inspire terror and deal devastating critical damage.",
        type: "Common",
        health: tiyanakAmbusher.maxHealth,
        attack: tiyanakAmbusher.damage,
        abilities: ["Fear", "Critical First Strike", "Mimic Cry"],
        lore: "Appearing as crying babies in the wilderness, Tiyanak are vampiric spirits of children who died before baptism. When picked up, they transform into fanged creatures with sharp claws. Once innocent souls awaiting Bathala's judgment, they've been corrupted into instruments of the false god's malice."
      },
      {
        id: "amomongo",
        name: amomongo.name,
        description: "Ape-like cryptids from the Visayan islands with razor-sharp claws that cause grievous bleeding wounds. These cave-dwelling beasts once protected mountain sanctuaries but now hunt with primal fury.",
        type: "Common",
        health: amomongo.maxHealth,
        attack: amomongo.damage,
        abilities: ["Bleed", "Fast Attacks", "Rending Claws"],
        lore: "Reported in Negros Occidental, Amomongo are large ape-like creatures with razor-sharp claws that attack livestock and leave deep claw marks. Legends connect them to guardian spirits of mountain sanctuaries and mineral veins. Engkanto influence drove these reclusive protectors into blood-rage, transforming them into frenzied predators."
      },
      {
        id: "bungisngis",
        name: bungisngis.name,
        description: "Enormous one-eyed giants whose perpetual laughter masks their devastating strength. Their unsettling mirth weakens the resolve of all who hear it, while they wield massive clubs with crushing force.",
        type: "Common",
        health: bungisngis.maxHealth,
        attack: bungisngis.damage,
        abilities: ["Laugh Debuff", "High Swing", "Intimidating Presence"],
        lore: "Tagalog and Cebuano cyclops giants known for constant booming laughter, Bungisngis were portrayed as strong but foolish forest dwellers, easily tricked despite tremendous strength. Engkanto corruption twisted their jovial nature into a maddening weapon—their laughter now saps the will of all who hear it."
      },
      {
        id: "kapre_shade",
        name: kapreShade.name,
        description: "Towering tree giants perpetually smoking enormous cigars, their presence marked by the scent of tobacco and burnt leaves. They command flames and summon lesser spirits, defending their sacred trees with primal fury.",
        type: "Boss",
        health: kapreShade.maxHealth,
        attack: kapreShade.damage,
        abilities: ["AoE Burn", "Summon Fire Minions", "Cigar Smoke Veil", "Strengthen"],
        lore: "Dark-skinned giants (7-9 feet tall) dwelling in large trees, Kapre are nocturnal beings visible only as glowing red eyes, perpetually smoking enormous cigars. Territorial but generally peaceful, they disorient disrespectful travelers. Once Bathala's appointed guardians of sacred groves, engkanto whispers ignited their ancient rage into infernos."
      },
      {
        id: "tawong_lipod",
        name: tawongLipod.name,
        description: "Invisible wind spirits from Bicolano mythology that exist only as whispers on the breeze. Their unseen presence makes them impossible to target consistently, striking with sudden stuns from the air itself.",
        type: "Elite",
        health: tawongLipod.maxHealth,
        attack: tawongLipod.damage,
        abilities: ["Invisibility", "Wind Stun", "Air Affinity Bonus"],
        lore: "Bikol's 'hidden people' are wind spirits existing beyond human perception, sometimes revealing themselves through inexplicable sounds or sudden breezes. Traditionally neutral or benevolent, they helped lost travelers and warned of danger. Engkanto corruption transformed these peaceful wind-folk into vindictive tormentors striking from nowhere."
      },
      {
        id: "mangangaway",
        name: mangangaway.name,
        description: "Dark sorcerers who wield forbidden hexes and curses, capable of mimicking any elemental force turned against them. They wear necklaces of skulls and channel the spirits of the damned to reverse fate itself.",
        type: "Elite",
        health: mangangaway.maxHealth,
        attack: mangangaway.damage,
        abilities: ["Mimic Elements", "Curse Cards", "Hex of Reversal"],
        lore: "Dark practitioners of kulam (curse magic) and barang (hex casting), Mangangaway are the opposite of healing Babaylan—they bring illness and death through cursed objects and malevolent spirits. Wearing skull necklaces, their power grows with each life taken. Ancient outcasts who broke kapwa's sacred laws, they now serve the false god as hex-wielding enforcers."
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
    
    // Calculate grid positions - centered layout with consistent card sizing
    const cardWidth = 260;
    const cardHeight = 420;
    const cardSpacing = 50; // Increased for better breathing room
    const cardsPerRow = Math.floor((screenWidth - 200) / (cardWidth + cardSpacing));
    const totalGridWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing;
    const startX = (screenWidth - totalGridWidth) / 2;
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
    
    // Type-based colors
    const typeColorHex = entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0";
    const typeColor = entry.type === "Boss" ? 0xff6b6b : entry.type === "Elite" ? 0xffd93d : 0x06d6a0;
    
    // Layered card background for depth
    const outerGlow = this.add.rectangle(0, 0, width, height, typeColor, 0.12)
      .setStrokeStyle(2, typeColor, 0.5)
      .setOrigin(0);
      
    const background = this.add.rectangle(4, 4, width - 8, height - 8, 0x1d151a)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0);
    
    // Top decorative accent bar
    const topBar = this.add.rectangle(8, 8, width - 16, 6, typeColor, 0.7)
      .setOrigin(0);
    
    // Character type badge at top
    const typeBadge = this.add.rectangle(width/2, 35, 110, 28, 0x2a1f24)
      .setStrokeStyle(2, typeColor)
      .setOrigin(0.5);
      
    const typeText = this.add.text(width/2, 35, entry.type.toUpperCase(), {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: typeColorHex,
      fontStyle: "bold"
    }).setOrigin(0.5);
    
    // Sprite container frame with subtle shadow - NO HEIGHT LIMIT
    const spriteFrame = this.add.rectangle(width/2, 200, 240, 240, 0x0f0a0d)
      .setStrokeStyle(1, typeColor, 0.4)
      .setOrigin(0.5);
    
    // Get sprite key for this character
    const spriteKey = this.getCharacterSpriteKey(entry.id);
    
    // Character sprite - CONSISTENT SIZING for all almanac images
    let characterVisual: Phaser.GameObjects.GameObject;
    if (this.textures.exists(spriteKey)) {
      const sprite = this.add.image(width/2, 200, spriteKey).setOrigin(0.5);
      
      // Consistent sizing: fit all sprites to the same dimensions
      const targetWidth = 220;
      const targetHeight = 220;
      
      // Calculate scale to fit within target dimensions while maintaining aspect ratio
      const scaleX = targetWidth / sprite.width;
      const scaleY = targetHeight / sprite.height;
      const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure fit
      
      sprite.setScale(scale);
      
      characterVisual = sprite;
    } else {
      // Fallback to emoji if sprite not found
      const symbol = this.getCharacterSymbol(entry.id);
      characterVisual = this.add.text(width/2, 200, symbol, {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 100,
        color: typeColorHex
      }).setOrigin(0.5);
    }
    
    // Character name with better visibility - MOVED DOWN MORE
    const nameText = this.add.text(width/2, 330, entry.name, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      wordWrap: { width: width - 30 },
      align: "center"
    }).setOrigin(0.5);
    
    // Stats display panel at bottom - MOVED DOWN MORE
    const statsPanel = this.add.rectangle(width/2, 370, width - 16, 35, 0x0f0a0d)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5);
    
    // HP stat - ADJUSTED POSITION
    const hpLabel = this.add.text(width/4, 360, "HP", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C"
    }).setOrigin(0.5);
    
    const hpValue = this.add.text(width/4, 378, entry.health.toString(), {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ff6b6b"
    }).setOrigin(0.5);
    
    // ATK stat - ADJUSTED POSITION
    const atkLabel = this.add.text((width * 3) / 4, 360, "ATK", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C"
    }).setOrigin(0.5);
    
    const atkValue = this.add.text((width * 3) / 4, 378, entry.attack.toString(), {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ffd93d"
    }).setOrigin(0.5);
    
    // Add all elements to container in proper z-order
    container.add([outerGlow, background, topBar, typeBadge, typeText, spriteFrame, 
                   characterVisual, nameText, statsPanel, hpLabel, hpValue, atkLabel, atkValue]);
    
    // Enhanced hover effects
    background.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => {
        // Press effect
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
        // Enhanced hover with glow
        outerGlow.setStrokeStyle(3, typeColor, 0.9);
        background.setStrokeStyle(2, typeColor, 0.8);
        this.tweens.add({
          targets: container,
          y: y - 10,
          scale: 1.03,
          duration: 200,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        // Reset hover
        outerGlow.setStrokeStyle(2, typeColor, 0.5);
        background.setStrokeStyle(1, 0x4a3a40);
        this.tweens.add({
          targets: container,
          y: y,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
      });
    
    return container;
  }
  
  /**
   * Get sprite key for a character - uses Mythical Compendium (almanac) sprites
   */
  private getCharacterSpriteKey(id: string): string {
    const spriteMap: Record<string, string> = {
      "tikbalang_scout": "tikbalang_almanac",
      "balete_wraith": "balete_almanac",
      "sigbin_charger": "sigbin_almanac",
      "duwende_trickster": "duwende_almanac",
      "tiyanak_ambusher": "tiyanak_almanac",
      "amomongo": "amomongo_almanac",
      "bungisngis": "bungisngis_almanac",
      "kapre_shade": "kapre_almanac",
      "tawong_lipod": "tawonglipod_almanac",
      "mangangaway": "mangangaway_almanac"
    };
    return spriteMap[id] || "tikbalang_almanac";
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
   * Create detailed view for character information - SCROLLABLE REDESIGN
   */
  private createDetailView(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create main container for detailed view
    this.detailViewContainer = this.add.container(0, 0);
    this.detailViewContainer.setVisible(false);
    
    // Background overlay with deeper shadow
    const overlay = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(0.85);
      
    // Main card background with premium layered design
    this.detailOuterGlow = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth - 100, screenHeight - 100, 0x4a3a40)
      .setOrigin(0.5)
      .setAlpha(0.3);
      
    const detailBackground = this.add.rectangle(screenWidth/2, screenHeight/2, screenWidth - 110, screenHeight - 110, 0x1d151a)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5);
      
    // Top accent bar (will be colored based on enemy type)
    this.detailTopAccent = this.add.rectangle(screenWidth/2, 62, screenWidth - 110, 8, 0x4a3a40)
      .setOrigin(0.5)
      .setAlpha(0.7);
      
    // Close button with better styling (stays fixed)
    const closeButton = this.add.text(screenWidth - 80, 80, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#ff6b6b"
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.handleBackNavigation();
      })
      .on("pointerover", () => {
        closeButton.setScale(1.2);
        closeButton.setColor("#ff4444");
      })
      .on("pointerout", () => {
        closeButton.setScale(1);
        closeButton.setColor("#ff6b6b");
      });
    
    // Add fixed elements to main container
    this.detailViewContainer.add([overlay, this.detailOuterGlow, detailBackground, this.detailTopAccent, closeButton]);
    
    // Create scrollable content container
    this.detailContentContainer = this.add.container(0, 100);
    
    // Character name with enhanced styling
    this.detailNameText = this.add.text(screenWidth/2, 0, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 36,
      color: "#e8eced",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // Character type badge with enhanced design
    const typeBadgeGlow = this.add.rectangle(screenWidth/2, 55, 140, 36, 0x4a3a40)
      .setOrigin(0.5)
      .setAlpha(0.4);
      
    this.detailTypeBadge = this.add.rectangle(screenWidth/2, 55, 136, 32, 0x2a1f24)
      .setStrokeStyle(2, 0x77888C)
      .setOrigin(0.5);
    
    this.detailTypeText = this.add.text(screenWidth/2, 55, "", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C"
    }).setOrigin(0.5);
    
    // Sprite frame with premium border
    const spriteFrameGlow = this.add.rectangle(screenWidth/2, 180, 224, 224, 0x0f0a0d)
      .setOrigin(0.5)
      .setAlpha(0.5);
      
    const spriteFrame = this.add.rectangle(screenWidth/2, 180, 220, 220, 0x0f0a0d)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5);
    
    // Character symbol placeholder
    this.detailSymbolText = this.add.text(screenWidth/2, 180, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 90,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    // Stats section with enhanced design
    const statsTitle = this.add.text(screenWidth/2 - 200, 310, "COMBAT STATS", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0);
    
    const statsGlow = this.add.rectangle(screenWidth/2 - 200, 345, 168, 78, 0x4a3a40)
      .setOrigin(0)
      .setAlpha(0.3);
      
    const statsContainer = this.add.rectangle(screenWidth/2 - 200, 345, 164, 74, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0);
    
    this.detailStatsText = this.add.text(screenWidth/2 - 185, 362, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#a9b4b8",
      wordWrap: { width: 130 },
      lineSpacing: 4
    }).setOrigin(0);
    
    // Abilities section with enhanced design
    const abilitiesTitle = this.add.text(screenWidth/2 + 40, 310, "SPECIAL ABILITIES", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0);
    
    const abilitiesGlow = this.add.rectangle(screenWidth/2 + 40, 345, 228, 78, 0x4a3a40)
      .setOrigin(0)
      .setAlpha(0.3);
      
    const abilitiesContainer = this.add.rectangle(screenWidth/2 + 40, 345, 224, 74, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0);
    
    this.detailAbilitiesText = this.add.text(screenWidth/2 + 55, 362, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#c9a74a",
      wordWrap: { width: 190 },
      lineSpacing: 4
    }).setOrigin(0);
    
    // Description section with premium design
    const descriptionTitle = this.add.text(screenWidth/2, 450, "━━━ TACTICAL OVERVIEW ━━━", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 22,
      color: "#e8eced",
      stroke: "#4a3a40",
      strokeThickness: 1
    }).setOrigin(0.5);
    
    const descriptionGlow = this.add.rectangle(screenWidth/2, 500, screenWidth - 180, 108, 0x4a3a40)
      .setOrigin(0.5, 0)
      .setAlpha(0.3);
      
    const descriptionContainer = this.add.rectangle(screenWidth/2, 500, screenWidth - 186, 104, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5, 0);
      
    // Decorative corner accents for description
    const descCornerTL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 500, 12, 12, 0x06d6a0)
      .setOrigin(0.5)
      .setAlpha(0.6);
    const descCornerTR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 500, 12, 12, 0x06d6a0)
      .setOrigin(0.5)
      .setAlpha(0.6);
    
    this.detailDescriptionText = this.add.text(screenWidth/2, 518, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#c4d1d6",
      wordWrap: { width: screenWidth - 210 },
      lineSpacing: 5,
      align: "center"
    }).setOrigin(0.5, 0);
    
    // Lore section with premium mythological design
    const loreTitle = this.add.text(screenWidth/2, 630, "━━━ MYTHOLOGY & ANCIENT LORE ━━━", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 22,
      color: "#ffd93d",
      stroke: "#4a3a40",
      strokeThickness: 1
    }).setOrigin(0.5);
    
    const loreGlow = this.add.rectangle(screenWidth/2, 680, screenWidth - 180, 148, 0x4a3a40)
      .setOrigin(0.5, 0)
      .setAlpha(0.3);
      
    const loreContainer = this.add.rectangle(screenWidth/2, 680, screenWidth - 186, 144, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5, 0);
      
    // Decorative corner accents for lore (golden theme)
    const loreCornerTL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 680, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    const loreCornerTR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 680, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    const loreCornerBL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 824, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    const loreCornerBR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 824, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    
    this.detailLoreText = this.add.text(screenWidth/2, 698, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#d4b878",
      fontStyle: "italic",
      wordWrap: { width: screenWidth - 210 },
      lineSpacing: 5,
      align: "center"
    }).setOrigin(0.5, 0);
    
    // Add all scrollable elements to content container
    this.detailContentContainer.add([
      this.detailNameText, typeBadgeGlow, this.detailTypeBadge, this.detailTypeText, 
      spriteFrameGlow, spriteFrame, this.detailSymbolText,
      statsTitle, statsGlow, statsContainer, this.detailStatsText, 
      abilitiesTitle, abilitiesGlow, abilitiesContainer, this.detailAbilitiesText,
      descriptionTitle, descriptionGlow, descriptionContainer, descCornerTL, descCornerTR, this.detailDescriptionText, 
      loreTitle, loreGlow, loreContainer, loreCornerTL, loreCornerTR, loreCornerBL, loreCornerBR, this.detailLoreText
    ]);
    
    // Add content container to main container
    this.detailViewContainer.add(this.detailContentContainer);
    
    // Set up scroll zone for detail view
    const scrollZone = this.add.zone(screenWidth/2, screenHeight/2, screenWidth - 100, screenHeight - 100)
      .setOrigin(0.5)
      .setInteractive();
    
    scrollZone.on('wheel', (pointer: any, deltaX: number, deltaY: number) => {
      if (this.isDetailViewOpen) {
        this.detailScrollY += deltaY * 0.5;
        this.detailScrollY = Phaser.Math.Clamp(this.detailScrollY, 0, this.detailMaxScroll);
        this.detailContentContainer.y = 100 - this.detailScrollY;
      }
    });
    
    this.detailViewContainer.add(scrollZone);
  }
  
  /**
   * Show detailed view of a character with premium styling and animation
   */
  private showCharacterDetails(entry: any): void {
    this.isDetailViewOpen = true;
    this.detailScrollY = 0; // Reset scroll position
    
    // Determine type-based colors
    const typeColorHex = entry.type === "Boss" ? "#ff6b6b" : entry.type === "Elite" ? "#ffd93d" : "#06d6a0";
    const typeColor = entry.type === "Boss" ? 0xff6b6b : entry.type === "Elite" ? 0xffd93d : 0x06d6a0;
    
    // Update character name
    this.detailNameText.setText(entry.name);
    
    // Update type badge and apply dynamic coloring
    this.detailTypeText.setText(entry.type);
    this.detailTypeText.setColor(typeColorHex);
    this.detailTypeBadge.setStrokeStyle(2, typeColor);
    
    // Apply type color to top accent bar and outer glow
    this.detailTopAccent.setFillStyle(typeColor);
    this.detailOuterGlow.setFillStyle(typeColor);
    
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
      
      // Create new sprite - CONSISTENT SIZING for detail view
      this.detailSpriteImage = this.add.image(screenWidth/2, 180, spriteKey)
        .setOrigin(0.5);
      
      // Consistent sizing for detail view
      const targetWidth = 200;
      const targetHeight = 200;
      
      // Calculate scale to fit within target dimensions while maintaining aspect ratio
      const scaleX = targetWidth / this.detailSpriteImage.width;
      const scaleY = targetHeight / this.detailSpriteImage.height;
      const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure fit
      
      this.detailSpriteImage.setScale(scale);
      
      // Add to scrollable content container
      this.detailContentContainer.add(this.detailSpriteImage);
      this.detailContentContainer.bringToTop(this.detailSpriteImage);
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
    
    // Calculate max scroll based on content height
    const contentHeight = 850; // Approximate total content height
    const viewportHeight = this.cameras.main.height - 200; // Visible area minus padding
    this.detailMaxScroll = Math.max(0, contentHeight - viewportHeight);
    
    // Reset content position
    this.detailContentContainer.y = 100;
    
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
    this.detailScrollY = 0; // Reset scroll
    
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
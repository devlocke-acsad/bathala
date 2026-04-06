import { Scene, GameObjects } from "phaser";
import { EnemyRegistry } from "../../core/registries/EnemyRegistry";
import { bootstrapEnemies } from "../../data/enemies/EnemyBootstrap";
import { MusicLifecycleSystem } from "../../systems/audio/MusicLifecycleSystem";

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
  
  // Chapter selection
  private currentChapter: number = 1;
  private chapterButtons: GameObjects.Text[] = [];
  
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

  // Detail view dynamic sections (for auto-sizing)
  private detailStatsTitle!: GameObjects.Text;
  private detailStatsGlow!: GameObjects.Rectangle;
  private detailStatsContainer!: GameObjects.Rectangle;

  private detailAbilitiesTitle!: GameObjects.Text;
  private detailAbilitiesGlow!: GameObjects.Rectangle;
  private detailAbilitiesContainer!: GameObjects.Rectangle;

  private detailDescriptionTitle!: GameObjects.Text;
  private detailDescriptionGlow!: GameObjects.Rectangle;
  private detailDescriptionContainer!: GameObjects.Rectangle;
  private detailDescCornerTL!: GameObjects.Rectangle;
  private detailDescCornerTR!: GameObjects.Rectangle;

  private detailLoreTitle!: GameObjects.Text;
  private detailLoreGlow!: GameObjects.Rectangle;
  private detailLoreContainer!: GameObjects.Rectangle;
  private detailLoreCornerTL!: GameObjects.Rectangle;
  private detailLoreCornerTR!: GameObjects.Rectangle;
  private detailLoreCornerBL!: GameObjects.Rectangle;
  private detailLoreCornerBR!: GameObjects.Rectangle;
  
  constructor() {
    super({ key: "Discover" });
  }

  create() {
    this.chapterButtons = [];
    this.cards = [];
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.scrollVelocity = 0;
    this.isDragging = false;
    this.isDetailViewOpen = false;
    this.input.off('pointerdown', this.startDrag, this);
    this.input.off('pointermove', this.drag, this);
    this.input.off('pointerup', this.endDrag, this);
    this.input.off('wheel', this.handleWheel, this);
    this.input.keyboard?.off('keydown-ESC', this.handleBackNavigation, this);

    new MusicLifecycleSystem(this).start();

    // Set camera background color to match the dark fantasy aesthetic
    this.cameras.main.setBackgroundColor(0x150E10);

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    this.createUI();

    // Load compendium data
    this.loadCompendiumData();

    // Create character cards
    this.refreshCharacterCards();

    // Create detail view (hidden by default)
    this.createDetailView();

    // Add input listeners for scrolling
    this.input.on('pointerdown', this.startDrag, this);
    this.input.on('pointermove', this.drag, this);
    this.input.on('pointerup', this.endDrag, this);
    this.input.on('wheel', this.handleWheel, this);
    
    // Add keyboard listener for back navigation
    this.input.keyboard?.on('keydown-ESC', this.handleBackNavigation, this);
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
    const scanlineKey = "discover_scanline";
    if (!this.textures.exists(scanlineKey)) {
      const graphics = this.make.graphics({});
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(0, 0, 2, 1);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 1, 2, 1);
      graphics.generateTexture(scanlineKey, 2, 2);
      graphics.destroy();
    }
    this.scanlines.setTexture(scanlineKey);
    
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
        fontFamily: "dungeon-mode",
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
    
    // Add chapter selection buttons
    this.createChapterButtons(screenWidth);
  }
  
  /**
   * Create chapter selection buttons
   */
  private createChapterButtons(screenWidth: number): void {
    const chapterY = 115;
    const chapterLabels = ["Chapter 1", "Chapter 2", "Chapter 3"];
    const buttonGapX = 280; // Much larger gap between buttons
    
    // Calculate total width needed and center it
    const totalWidth = (chapterLabels.length - 1) * buttonGapX;
    const startX = (screenWidth - totalWidth) / 2;
    
    for (let i = 0; i < chapterLabels.length; i++) {
      const x = startX + i * buttonGapX;
      const chapterNum = i + 1;
      const chapterText = this.add
        .text(x, chapterY, chapterLabels[i], {
          fontFamily: "dungeon-mode",
          fontSize: 13,
          color: this.currentChapter === chapterNum ? "#06d6a0" : "#77888C",
          align: "center",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.switchChapter(chapterNum);
        })
        .on("pointerover", () => {
          this.tweens.add({
            targets: chapterText,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 150
          });
        })
        .on("pointerout", () => {
          this.tweens.add({
            targets: chapterText,
            scaleX: 1,
            scaleY: 1,
            duration: 150
          });
        });
      
      this.chapterButtons.push(chapterText);
    }
  }
  
  /**
   * Switch to a different chapter and refresh cards
   */
  private switchChapter(chapter: number): void {
    this.currentChapter = chapter;
    
    // Update button colors
    this.chapterButtons.forEach((button, index) => {
      const btnChapter = index + 1;
      // Use setColor with hex strings (Phaser Text color is a string).
      // Tweening numeric colors here was unreliable, causing only Chapter 1 to appear selected.
      button.setColor(btnChapter === chapter ? "#06d6a0" : "#77888C");
    });

    this.refreshCharacterCards();
  }

  private refreshCharacterCards(): void {
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.scrollVelocity = 0;

    if (this.cardsContainer) {
      this.cardsContainer.destroy();
    }

    this.createCharacterCards();
    this.createScrollMask();
  }
  
  /**
   * Load compendium data from existing enemy definitions
   */
  private loadCompendiumData(): void {
    bootstrapEnemies();
    const getEnemyConfig = (id: string) => EnemyRegistry.getConfigOrThrow(id);
    
    // Chapter 1 enemies
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
    
    // Chapter 2 enemies
    const sirenaillusionist = getEnemyConfig('sirena_illusionist');
    const siyokoyRaider = getEnemyConfig('siyokoy_raider');
    const santelmoFlicker = getEnemyConfig('santelmo_flicker');
    const berberokeLurker = getEnemyConfig('berberoka_lurker');
    const magindara = getEnemyConfig('magindara_swarm');
    const kataw = getEnemyConfig('kataw');
    const berbalang = getEnemyConfig('berbalang');
    const sunkenBangkilan = getEnemyConfig('sunken_bangkilan');
    const apoyTubigFury = getEnemyConfig('apoy_tubig_fury');
    const bakunawa = getEnemyConfig('bakunawa');
    
    // Chapter 3 enemies
    const tigmamanukan = getEnemyConfig('tigmamanukan_watcher');
    const diwataSentinel = getEnemyConfig('diwata_sentinel');
    const sarimanok = getEnemyConfig('sarimanok_keeper');
    const bulalakaw = getEnemyConfig('bulalakaw_flamewings');
    const minokawa = getEnemyConfig('minokawa_harbinger');
    const alan = getEnemyConfig('alan');
    const ekek = getEnemyConfig('ekek');
    const ribungLinti = getEnemyConfig('ribung_linti_duo');
    const apolaki = getEnemyConfig('apolaki_godling');
    const falseBathala = getEnemyConfig('false_bathala');

    this.compendiumEntries = [
      {
        id: "tikbalang_scout",
        name: tikbalangScout.name,
        description: "Horse-headed trickster spirits that guard mountain passes and mislead travelers with backward hoof prints. Their chaotic nature confuses targeting and disorients those who dare trespass their domain.",
        type: "Common",
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
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
        chapter: 1,
        health: mangangaway.maxHealth,
        attack: mangangaway.damage,
        abilities: ["Mimic Elements", "Curse Cards", "Hex of Reversal"],
        lore: "Dark practitioners of kulam (curse magic) and barang (hex casting), Mangangaway are the opposite of healing Babaylan—they bring illness and death through cursed objects and malevolent spirits. Wearing skull necklaces, their power grows with each life taken. Ancient outcasts who broke kapwa's sacred laws, they now serve the false god as hex-wielding enforcers."
      },
      // ===== Chapter 2: The Submerged Barangays =====
      {
        id: "sirena_illusionist",
        name: sirenaillusionist.name,
        description: "Enchanting mermaids whose haunting songs lure victims into the depths. They heal their allies and charm enemies, making them miss critical strikes.",
        type: "Common",
        chapter: 2,
        health: sirenaillusionist.maxHealth,
        attack: sirenaillusionist.damage,
        abilities: ["Heal Allies", "Charm", "Mesmerizing Song"],
        lore: "Benevolent mermaids of Visayan waters, Sirena once sang to protect sailors and guide lost travelers. Their melodious voices commanded respect and kindness. Corrupted by engkanto lies, these guardians now use their songs to entrap souls in endless tides of despair."
      },
      {
        id: "siyokoy_raider",
        name: siyokoyRaider.name,
        description: "Malevolent mermen with strong scales that absorb damage. They drag victims underwater with violent splash attacks that affect multiple targets.",
        type: "Common",
        chapter: 2,
        health: siyokoyRaider.maxHealth,
        attack: siyokoyRaider.damage,
        abilities: ["Armor", "Splash Attack", "Drag Victims"],
        lore: "Aggressive mermen who once balanced the waters with Sirena, Siyokoy have always guarded territorial boundaries. Their scaled bodies are nearly impenetrable. False promises of power transformed them into ravenous predators dragging the innocent to watery graves."
      },
      {
        id: "santelmo_flicker",
        name: santelmoFlicker.name,
        description: "Mystical soul fires appearing as floating lights above water. They evade attacks with uncanny grace and ignite their enemies with supernatural flames.",
        type: "Common",
        chapter: 2,
        health: santelmoFlicker.maxHealth,
        attack: santelmoFlicker.damage,
        abilities: ["Dodge", "Burn", "St. Elmo's Fire"],
        lore: "Spiritual fires aiding gods and righteous travelers, Santelmo lights appeared above masts during storms to warn of danger. Sacred and wise, they chose sides carefully. Now twisted by engkanto corruption into agents of chaos, their flames consume without discrimination."
      },
      {
        id: "berberoka_lurker",
        name: berberokeLurker.name,
        description: "Massive water giants that dwell in swamps, capable of swelling to enormous size. They devour cards from your hand, disrupting your strategy.",
        type: "Common",
        chapter: 2,
        health: berberokeLurker.maxHealth,
        attack: berberokeLurker.damage,
        abilities: ["Banish Cards", "Size Change", "Swamp Master"],
        lore: "Apa­yao protectors of swamplands, Berberoka were once guardians preventing wasteful drowning. Giants capable of changing size at will, they judged trespassers fairly. Engkanto manipulation turned their protective instinct into ravenous hunger, now indiscriminately consuming trespassers."
      },
      {
        id: "magindara_swarm",
        name: magindara.name,
        description: "Vicious mermaids appearing in coordinated groups. They adapt to threats, regenerate when damaged, and coordinate devastating attacks.",
        type: "Common",
        chapter: 2,
        health: magindara.maxHealth,
        attack: magindara.damage,
        abilities: ["Adaptive", "Regenerate", "Coordinated Attacks"],
        lore: "Bicolano fish-eating mermaids with beautiful faces and seductive songs hiding savage hunger. Once protective of their waters without aggression toward surface dwellers, their nature was perverted into that of apex predators of the deep."
      },
      {
        id: "kataw",
        name: kataw.name,
        description: "Regal sea monarchs commanding the waters themselves. They summon minions and strengthen their forces through mystic rule over the oceans.",
        type: "Common",
        chapter: 2,
        health: kataw.maxHealth,
        attack: kataw.damage,
        abilities: ["Summon Minions", "Heal", "Command Seas"],
        lore: "Bisayan sea kings crowned with coral and command authority over oceans. Fair rulers maintaining balance between water realms, Kataw were respected by all sea dwellers. Whispers of forbidden power corrupted their noble governance into tyranny."
      },
      {
        id: "berbalang",
        name: berbalang.name,
        description: "Astral ghouls that feed on the drowned dead. They detach spiritually from the material realm and weaken the deck with spectral hunger.",
        type: "Common",
        chapter: 2,
        health: berbalang.maxHealth,
        attack: berbalang.damage,
        abilities: ["Astral Detach", "Weaken Deck", "Corpse Feeding"],
        lore: "Sulu Islamic folk creatures—ghouls of the dead dwelling between worlds, Berbalang feast on corpses nobody claimed. Neither truly alive nor dead, they hunger eternally. Engkanto lies convinced them their hunger was righteous justice."
      },
      {
        id: "sunken_bangkilan",
        name: sunkenBangkilan.name,
        description: "Shape-shifting sorceresses dwelling in sunken ruins. They disrupt hand formation and bend reality, turning player strategies against them.",
        type: "Elite",
        chapter: 2,
        health: sunkenBangkilan.maxHealth,
        attack: sunkenBangkilan.damage,
        abilities: ["Shape-Shift", "Disrupt Hands", "Reality Warping"],
        lore: "Mangkukulam-descended water witches mastering transformation magic. Bangkilan shape-shift to counter threats, their forms reflecting opponent vulnerabilities. Bound to engkanto service through dark pacts, they now use their gifts to trap and torment."
      },
      {
        id: "apoy_tubig_fury",
        name: apoyTubigFury.name,
        description: "Warring elemental spirits embodying the conflict between fire and water. They cycle between devastating burn attacks and healing surges.",
        type: "Elite",
        chapter: 2,
        health: apoyTubigFury.maxHealth,
        attack: apoyTubigFury.damage,
        abilities: ["Burn AoE", "Healing Surge", "Element Clash"],
        lore: "Visayan creation tales speak of siblings born from Bathala's conflict—fire and water eternally opposed yet interdependent. These elementals embody that struggle. Engkanto deception weaponized their rivalry, turning balance into chaos."
      },
      {
        id: "bakunawa",
        name: bakunawa.name,
        description: "The legendary moon-devouring serpent whose hunger devours relics and warps your hands. Capable of devouring entire hands and consuming resources.",
        type: "Boss",
        chapter: 2,
        health: bakunawa.maxHealth,
        attack: bakunawa.damage,
        abilities: ["Lunar Eclipse", "Devour Relics", "Warp Hands", "Flood"],
        lore: "Bicolano and Visayan cosmic serpent causing eclipses by swallowing the moon. Ancient, intelligent, and driven by infinite hunger, Bakunawa was imprisoned by Bathala to maintain celestial order. The engkanto's lies convinced it that rage was freedom—now it devours everything."
      },
      // ===== Chapter 3: The Skyward Citadel =====
      {
        id: "tigmamanukan_watcher",
        name: tigmamanukan.name,
        description: "Prophetic birds of Bathala that grow stronger as battles progress. Their omens foretell fate, making them increasingly dangerous foes.",
        type: "Common",
        chapter: 3,
        health: tigmamanukan.maxHealth,
        attack: tigmamanukan.damage,
        abilities: ["Prophecy", "Grow Stronger", "Omen Sight"],
        lore: "Tagalog divination birds with three calls—one for each fate. They served Bathala as messengers of omens, guiding people toward righteous paths. Now twisted to speak only lies, their once-true vision sees only engkanto deceptions."
      },
      {
        id: "diwata_sentinel",
        name: diwataSentinel.name,
        description: "Divine guardians of nature and sacred places. They counter opposite forces and punish those who disrespect the natural order.",
        type: "Common",
        chapter: 3,
        health: diwataSentinel.maxHealth,
        attack: diwataSentinel.damage,
        abilities: ["Counter Opposite", "Nature Guard", "Sacred Protection"],
        lore: "Visayan nature guardians owning herds of white deer and schools of white fish. Protectors of forests and waters, they punished disrespect with disease or loss. Engkanto whispers broke their trust, convincing them all intruders are enemies."
      },
      {
        id: "sarimanok_keeper",
        name: sarimanok.name,
        description: "Ornate fortune birds of Maranao origin. They nullify special abilities and enhance their own power through mystical buffs.",
        type: "Common",
        chapter: 3,
        health: sarimanok.maxHealth,
        attack: sarimanok.damage,
        abilities: ["Nullify Specials", "Buff Self", "Fortune"],
        lore: "Maranao two-headed birds symbolizing harmony and prosperity. With rooster heads and fish tails, Sarimanok brought luck and protected homes. Their connection to multiple realms let them see threats others missed. False visions now poison their protective foresight."
      },
      {
        id: "bulalakaw_flamewings",
        name: bulalakaw.name,
        description: "Comet-like omen birds streaking across skies trailing fire. They burn and blur vision, striking with meteoric force.",
        type: "Common",
        chapter: 3,
        health: bulalakaw.maxHealth,
        attack: bulalakaw.damage,
        abilities: ["Meteor Burn", "Blur Vision", "Omen of Illness"],
        lore: "General folklore beings appearing as comets overhead, Bulalakaw are omen birds whose sightings predicted illness. Once seen as natural warnings, respected while feared. Engkanto lies turned their prophecies into curses of sickness."
      },
      {
        id: "minokawa_harbinger",
        name: minokawa.name,
        description: "Eclipse birds that steal potions and evade with air affinity. These cosmic devourers steal resources while remaining hidden.",
        type: "Common",
        chapter: 3,
        health: minokawa.maxHealth,
        attack: minokawa.damage,
        abilities: ["Steal Potions", "Air Evasion", "Eclipse Devourer"],
        lore: "Bagobo cosmic creatures causing eclipses by devouring sun and moon. Enormous, intelligent, and driven by hunger beyond eating—they consume light itself. Imprisoned in sky realms by Bathala, engkanto promises freed them to rampage."
      },
      {
        id: "alan",
        name: alan.name,
        description: "Half-bird, half-human aerial creatures from Bikol. They dive with sharp talons and summon flocks of smaller birds to aid them.",
        type: "Common",
        chapter: 3,
        health: alan.maxHealth,
        attack: alan.damage,
        abilities: ["Winged Dive", "Summon Birds", "Talon Strike"],
        lore: "Bikol bird-people adopting lost children, Alan were benevolent despite their danger. With upper human bodies and lower bird forms, they flew between realms. Engkanto lies told them lost children were theirs to consume, transforming caretakers into hunters."
      },
      {
        id: "ekek",
        name: ekek.name,
        description: "Nocturnal bird vampires that drain life essence and evade detection. They suck sustenance from sleeping victims under cover of darkness.",
        type: "Common",
        chapter: 3,
        health: ekek.maxHealth,
        attack: ekek.damage,
        abilities: ["Vampiric Drain", "Night Evasion", "Tongue Sucker"],
        lore: "General folklore nocturnal creatures appearing as birds by day and vampires by night, Ekek suck tongues or blood from sleeping victims. Uncontrollable hunger drives their attacks. Even before engkanto corruption they were feared—now they are merciless."
      },
      {
        id: "ribung_linti_duo",
        name: ribungLinti.name,
        description: "Ilocano lightning spirits operating in dangerous tandem. They share damage between them and alternate devastating thunder strikes.",
        type: "Elite",
        chapter: 3,
        health: ribungLinti.maxHealth,
        attack: ribungLinti.damage,
        abilities: ["Shared Damage", "Lightning Strike", "Storm Tandem"],
        lore: "Ilocano storm beings embodying thunder's raw power. Twin spirits, they were seen as harbingers of seasonal rains necessary for crops. Sacred lightning brought renewal. Engkanto corruption weaponized their storms into instruments of destruction."
      },
      {
        id: "apolaki_godling",
        name: apolaki.name,
        description: "War and sun deity rivaling Mayari in Tagalog mythology. This divine being changes poker rules to suit itself, bending fate.",
        type: "Elite",
        chapter: 3,
        health: apolaki.maxHealth,
        attack: apolaki.damage,
        abilities: ["Change Rules", "Divine Wrath", "Sun's Power"],
        lore: "Tagalog Bathala's son embodying sun and war, Apolaki once balanced his sister Mayari's lunar authority. Their eternal rivalry maintained celestial harmony. False god's influence twisted Apolaki's pride into absolute dominion, breaking sibling balance forever."
      },
      {
        id: "false_bathala",
        name: falseBathala.name,
        description: "The impostor god born from forbidden merger of grave-bound serpent and winged spirit. It steals relics, nullifies bonuses, and shifts elements.",
        type: "Boss",
        chapter: 3,
        health: falseBathala.maxHealth,
        attack: falseBathala.damage,
        abilities: ["Steal Relics", "Nullify Bonuses", "Shift Elements", "Divine Judgment"],
        lore: "The engkanto's ultimate deception—a fusion of Ulilang Kaluluwa (the slain serpent buried deep) and Galang Kaluluwa (the winged friend entombed beside it), corrupted from the grave. They twisted the coconut tree's sacred gift of life into perversion. An abomination claiming godhood, promising false restoration while dragging all toward darkness."
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
    
    // Filter entries by current chapter
    const filteredEntries = this.compendiumEntries.filter(entry => (entry.chapter || 1) === this.currentChapter);
    
    // Calculate grid positions - centered layout with consistent card sizing
    const cardWidth = 260;
    const cardHeight = 420;
    const cardSpacing = 50; // Increased for better breathing room
    const cardsPerRow = Math.floor((screenWidth - 200) / (cardWidth + cardSpacing));
    const totalGridWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacing;
    const startX = (screenWidth - totalGridWidth) / 2;
    const startY = 220; // Increased to account for chapter buttons
    
    // Create a card for each entry in current chapter
    filteredEntries.forEach((entry, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      let x = startX + col * (cardWidth + cardSpacing);
      const y = startY + row * (cardHeight + cardSpacing);
      
      // Center boss cards in their row if they're alone
      if (entry.type === "Boss") {
        const itemsInThisRow = Math.min(cardsPerRow, filteredEntries.length - row * cardsPerRow);
        if (itemsInThisRow === 1) {
          // Boss is alone in its row - center it
          x = screenWidth / 2 - cardWidth / 2;
        }
      }
      
      const card = this.createCharacterCard(entry, x, y, cardWidth, cardHeight);
      this.cardsContainer.add(card);
      this.cards.push(card);
    });
    
    // Calculate max scroll based on the last card position
    const lastRow = Math.floor((filteredEntries.length - 1) / cardsPerRow);
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
      // Keep the card layout stable while portraits are loading.
      characterVisual = this.add.rectangle(width / 2, 200, 220, 220, 0x000000, 0);
    }
    
    // --- Dynamic bottom layout (prevents name overflow into stats) ---
    const spriteCenterY = 200;
    const spriteFrameH = 240;
    const nameTopY = spriteCenterY + spriteFrameH / 2 + 10; // start name below sprite frame
    const bottomPadding = 16;
    const statsPanelH = 35;
    const statsTopGap = 10;

    // Creature name (top-aligned so height measurements are stable)
    const nameText = this.add.text(width / 2, nameTopY, entry.name, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      wordWrap: { width: width - 30 },
      align: "center",
    }).setOrigin(0.5, 0);

    const fitNameToSpace = () => {
      const maxStatsCenterY = height - bottomPadding - statsPanelH / 2;
      const maxNameBottomY = maxStatsCenterY - statsTopGap;
      const maxNameH = Math.max(28, Math.floor(maxNameBottomY - nameTopY));

      // Shrink font size until name fits, down to a safe minimum
      let fontSize = 18;
      while (nameText.getBounds().height > maxNameH && fontSize > 12) {
        fontSize -= 1;
        nameText.setFontSize(fontSize);
      }

      // If still too tall (very long names), truncate to two lines.
      // Phaser doesn't support ellipsis natively with wordWrap, so we do a simple clamp.
      const hardMaxH = maxNameH;
      if (nameText.getBounds().height > hardMaxH) {
        const original = entry.name as string;
        let lo = 0;
        let hi = original.length;
        let best = original;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          const candidate = original.slice(0, Math.max(0, mid)).trimEnd() + "…";
          nameText.setText(candidate);
          if (nameText.getBounds().height <= hardMaxH) {
            best = candidate;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        nameText.setText(best);
      }

      // Position stats directly below name (but pinned to bottom if needed)
      const computedStatsCenterY = Math.min(
        nameTopY + nameText.getBounds().height + statsTopGap + statsPanelH / 2,
        maxStatsCenterY
      );
      return computedStatsCenterY;
    };

    const statsCenterY = fitNameToSpace();

    // Stats display panel at bottom (follows name)
    const statsPanel = this.add.rectangle(width / 2, statsCenterY, width - 16, statsPanelH, 0x0f0a0d)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5);

    // HP / ATK labels and values inside the panel
    const labelY = statsCenterY - 9;
    const valueY = statsCenterY + 9;

    const hpLabel = this.add.text(width / 4, labelY, "HP", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C",
    }).setOrigin(0.5);

    const hpValue = this.add.text(width / 4, valueY, entry.health.toString(), {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ff6b6b",
    }).setOrigin(0.5);

    const atkLabel = this.add.text((width * 3) / 4, labelY, "ATK", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C",
    }).setOrigin(0.5);

    const atkValue = this.add.text((width * 3) / 4, valueY, entry.attack.toString(), {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#ffd93d",
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
      // Chapter 1
      "tikbalang_scout": "tikbalang_almanac",
      "balete_wraith": "balete_almanac",
      "sigbin_charger": "sigbin_almanac",
      "duwende_trickster": "duwende_almanac",
      "tiyanak_ambusher": "tiyanak_almanac",
      "amomongo": "amomongo_almanac",
      "bungisngis": "bungisngis_almanac",
      "kapre_shade": "kapre_almanac",
      "tawong_lipod": "tawonglipod_almanac",
      "mangangaway": "mangangaway_almanac",
      // Chapter 2
      "sirena_illusionist": "sirena_almanac",
      "siyokoy_raider": "siyokoy_almanac",
      "santelmo_flicker": "santelmo_almanac",
      "berberoka_lurker": "berberoka_almanac",
      "magindara_swarm": "magindara_almanac",
      "kataw": "kataw_almanac",
      "berbalang": "berbalang_almanac",
      "sunken_bangkilan": "bangkilan_almanac",
      "apoy_tubig_fury": "apoy_tubig_fury_almanac",
      "bakunawa": "bakunawa_almanac",
      // Chapter 3
      "tigmamanukan_watcher": "tigmamanukan_almanac",
      "diwata_sentinel": "diwata_almanac",
      "sarimanok_keeper": "sarimanok_almanac",
      "bulalakaw_flamewings": "bulalakaw_almanac",
      "minokawa_harbinger": "minokawa_almanac",
      "alan": "alan_almanac",
      "ekek": "ekek_almanac",
      "ribung_linti_duo": "ribung_linti_almanac",
      "apolaki_godling": "apolaki_almanac",
      "false_bathala": "false_bathala_almanac"
    };
    return spriteMap[id] || "tikbalang_almanac";
  }
  
  /**
   * Get symbolic representation for a character
   */
  private getCharacterSymbol(id: string): string {
    switch (id) {
      // Chapter 1
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
      // Chapter 2
      case "sirena_illusionist": return "🧜‍♀️";
      case "siyokoy_raider": return "🧜‍♂️";
      case "santelmo_flicker": return "🔥";
      case "berberoka_lurker": return "💧";
      case "magindara_swarm": return "🐠";
      case "kataw": return "👑";
      case "berbalang": return "👻";
      case "sunken_bangkilan": return "🪄";
      case "apoy_tubig_fury": return "⚡";
      case "bakunawa": return "🐍";
      // Chapter 3
      case "tigmamanukan_watcher": return "🦅";
      case "diwata_sentinel": return "✨";
      case "sarimanok_keeper": return "🦚";
      case "bulalakaw_flamewings": return "☄️";
      case "minokawa_harbinger": return "🌙";
      case "alan": return "🪶";
      case "ekek": return "🦇";
      case "ribung_linti_duo": return "⚡";
      case "apolaki_godling": return "☀️";
      case "false_bathala": return "😈";
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
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#ff6b6b"
    }).setOrigin(0.5)
      .setDepth(9999)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        pointer.event.stopPropagation();
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
      fontFamily: "dungeon-mode",
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
      fontFamily: "dungeon-mode",
      fontSize: 90,
      color: "#e8eced"
    }).setOrigin(0.5).setVisible(false);
    
    // Stats section with enhanced design
    this.detailStatsTitle = this.add.text(screenWidth/2 - 200, 310, "COMBAT STATS", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0);
    
    this.detailStatsGlow = this.add.rectangle(screenWidth/2 - 200, 345, 168, 78, 0x4a3a40)
      .setOrigin(0)
      .setAlpha(0.3);
      
    this.detailStatsContainer = this.add.rectangle(screenWidth/2 - 200, 345, 164, 74, 0x2a1f24)
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
    this.detailAbilitiesTitle = this.add.text(screenWidth/2 + 40, 310, "SPECIAL ABILITIES", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0);
    
    this.detailAbilitiesGlow = this.add.rectangle(screenWidth/2 + 40, 345, 228, 78, 0x4a3a40)
      .setOrigin(0)
      .setAlpha(0.3);
      
    this.detailAbilitiesContainer = this.add.rectangle(screenWidth/2 + 40, 345, 224, 74, 0x2a1f24)
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
    this.detailDescriptionTitle = this.add.text(screenWidth/2, 450, "━━━ TACTICAL OVERVIEW ━━━", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#e8eced",
      stroke: "#4a3a40",
      strokeThickness: 1
    }).setOrigin(0.5);
    
    this.detailDescriptionGlow = this.add.rectangle(screenWidth/2, 500, screenWidth - 180, 108, 0x4a3a40)
      .setOrigin(0.5, 0)
      .setAlpha(0.3);
      
    this.detailDescriptionContainer = this.add.rectangle(screenWidth/2, 500, screenWidth - 186, 104, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5, 0);
      
    // Decorative corner accents for description
    this.detailDescCornerTL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 500, 12, 12, 0x06d6a0)
      .setOrigin(0.5)
      .setAlpha(0.6);
    this.detailDescCornerTR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 500, 12, 12, 0x06d6a0)
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
    this.detailLoreTitle = this.add.text(screenWidth/2, 630, "━━━ MYTHOLOGY & ANCIENT LORE ━━━", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#ffd93d",
      stroke: "#4a3a40",
      strokeThickness: 1
    }).setOrigin(0.5);
    
    this.detailLoreGlow = this.add.rectangle(screenWidth/2, 680, screenWidth - 180, 148, 0x4a3a40)
      .setOrigin(0.5, 0)
      .setAlpha(0.3);
      
    this.detailLoreContainer = this.add.rectangle(screenWidth/2, 680, screenWidth - 186, 144, 0x2a1f24)
      .setStrokeStyle(2, 0x4a3a40)
      .setOrigin(0.5, 0);
      
    // Decorative corner accents for lore (golden theme)
    this.detailLoreCornerTL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 680, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    this.detailLoreCornerTR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 680, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    this.detailLoreCornerBL = this.add.rectangle(screenWidth/2 - (screenWidth - 186)/2, 824, 12, 12, 0xffd93d)
      .setOrigin(0.5)
      .setAlpha(0.6);
    this.detailLoreCornerBR = this.add.rectangle(screenWidth/2 + (screenWidth - 186)/2, 824, 12, 12, 0xffd93d)
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
      this.detailStatsTitle, this.detailStatsGlow, this.detailStatsContainer, this.detailStatsText, 
      this.detailAbilitiesTitle, this.detailAbilitiesGlow, this.detailAbilitiesContainer, this.detailAbilitiesText,
      this.detailDescriptionTitle, this.detailDescriptionGlow, this.detailDescriptionContainer, this.detailDescCornerTL, this.detailDescCornerTR, this.detailDescriptionText, 
      this.detailLoreTitle, this.detailLoreGlow, this.detailLoreContainer, this.detailLoreCornerTL, this.detailLoreCornerTR, this.detailLoreCornerBL, this.detailLoreCornerBR, this.detailLoreText
    ]);
    
    // Add content container to main container
    this.detailViewContainer.add(this.detailContentContainer);
    
    // Set up scroll zone for detail view.
    // IMPORTANT: exclude the top header area so the close button is always clickable.
    const scrollZone = this.add.zone(
      screenWidth / 2,
      (screenHeight + 120) / 2,
      screenWidth - 120,
      screenHeight - 220
    ).setOrigin(0.5).setInteractive();
    
    scrollZone.on('wheel', (_pointer: any, _deltaX: number, deltaY: number) => {
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
    
    // Try to use sprite first. If it is still loading, leave the portrait area empty.
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

      // Hide the text fallback so there is no emoji flash before portrait load completes.
      this.detailSymbolText.setVisible(false);
      this.detailSymbolText.setText("");
    }
    
    this.detailStatsText.setText("Health: " + entry.health + "\nAttack: " + entry.attack);
    this.detailAbilitiesText.setText(entry.abilities ? entry.abilities.join("\n") : "None");
    this.detailDescriptionText.setText(entry.description);
    this.detailLoreText.setText(entry.lore);

    // Resize description/lore sections to hug text (prevents overflow)
    this.updateDetailTextLayout();
    
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
   * Make the description/lore containers hug their text content.
   * This prevents overflow for long entries and ensures scroll height is accurate.
   */
  private updateDetailTextLayout(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // --- Combat stats + abilities panels (hug text) ---
    // Anchors match the original layout (top-left corners).
    const statsX = screenWidth / 2 - 200;
    const statsTopY = 345;
    const statsWGlow = 168;
    const statsW = 164;
    const statsPadY = 14;
    const statsTextH = this.detailStatsText.getBounds().height;
    const statsH = Math.max(74, Math.ceil(statsPadY + statsTextH + statsPadY));
    this.detailStatsGlow.setPosition(statsX, statsTopY).setSize(statsWGlow, statsH + 4);
    this.detailStatsContainer.setPosition(statsX, statsTopY).setSize(statsW, statsH);
    this.detailStatsText.setPosition(screenWidth / 2 - 185, statsTopY + statsPadY);

    const abilitiesX = screenWidth / 2 + 40;
    const abilitiesTopY = 345;
    const abilitiesWGlow = 228;
    const abilitiesW = 224;
    const abilitiesPadY = 14;
    const abilitiesTextH = this.detailAbilitiesText.getBounds().height;
    const abilitiesH = Math.max(74, Math.ceil(abilitiesPadY + abilitiesTextH + abilitiesPadY));
    this.detailAbilitiesGlow.setPosition(abilitiesX, abilitiesTopY).setSize(abilitiesWGlow, abilitiesH + 4);
    this.detailAbilitiesContainer.setPosition(abilitiesX, abilitiesTopY).setSize(abilitiesW, abilitiesH);
    this.detailAbilitiesText.setPosition(screenWidth / 2 + 55, abilitiesTopY + abilitiesPadY);

    // The next section should start after the taller of the two panels.
    const panelsBottomY = abilitiesTopY + Math.max(statsH, abilitiesH);
    const sectionGapAfterPanels = 60;
    const descTitleY = panelsBottomY + sectionGapAfterPanels;
    this.detailDescriptionTitle.setY(descTitleY);

    // --- Description panel ---
    const descTopY = descTitleY + 50;
    const descTextTopPadding = 18;
    const descBottomPadding = 18;
    const descTextH = this.detailDescriptionText.getBounds().height;
    const descPanelH = Math.max(84, Math.ceil(descTextTopPadding + descTextH + descBottomPadding));

    this.detailDescriptionGlow.setY(descTopY).setSize(screenWidth - 180, descPanelH + 4);
    this.detailDescriptionContainer.setY(descTopY).setSize(screenWidth - 186, descPanelH);
    this.detailDescCornerTL.setY(descTopY);
    this.detailDescCornerTR.setY(descTopY);
    this.detailDescriptionText.setY(descTopY + descTextTopPadding);

    const afterDescY = descTopY + descPanelH + 40;

    // --- Lore panel (positioned after description) ---
    this.detailLoreTitle.setY(afterDescY);
    const loreTopY = afterDescY + 50;
    const loreTextTopPadding = 18;
    const loreBottomPadding = 20;
    const loreTextH = this.detailLoreText.getBounds().height;
    const lorePanelH = Math.max(120, Math.ceil(loreTextTopPadding + loreTextH + loreBottomPadding));

    this.detailLoreGlow.setY(loreTopY).setSize(screenWidth - 180, lorePanelH + 4);
    this.detailLoreContainer.setY(loreTopY).setSize(screenWidth - 186, lorePanelH);
    this.detailLoreCornerTL.setY(loreTopY);
    this.detailLoreCornerTR.setY(loreTopY);
    this.detailLoreCornerBL.setY(loreTopY + lorePanelH);
    this.detailLoreCornerBR.setY(loreTopY + lorePanelH);
    this.detailLoreText.setY(loreTopY + loreTextTopPadding);

    // Update scroll bounds based on actual bottom-most content.
    const contentBottom = loreTopY + lorePanelH + 30;
    const viewportHeight = screenHeight - 200; // Visible area minus padding
    this.detailMaxScroll = Math.max(0, contentBottom - viewportHeight);

    // Clamp scroll if currently out of bounds.
    this.detailScrollY = Phaser.Math.Clamp(this.detailScrollY, 0, this.detailMaxScroll);
    this.detailContentContainer.y = 100 - this.detailScrollY;
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
    
    // Create mask with proper spacing to avoid UI overlap
    // Starts below chapter buttons (at y ~170) and extends to bottom
    this.scrollMask = this.make.graphics({});
    this.scrollMask.fillStyle(0xffffff);
    this.scrollMask.fillRect(0, 170, screenWidth, screenHeight - 170);
    
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(0, 170, screenWidth, screenHeight - 170);
    
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

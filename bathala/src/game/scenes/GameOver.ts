import { Scene } from 'phaser';
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
} from '../../data/enemies/Act1Enemies';

interface GameOverData {
    defeatedBy?: string;
    enemySpriteKey?: string;
    finalHealth?: number;
    turnsPlayed?: number;
    totalDamageDealt?: number;
    bestHand?: string;
    relicsObtained?: number;
}

interface CompendiumEntry {
    id: string;
    name: string;
    description: string;
    type: string;
    health: number;
    attack: number;
    abilities: string[];
    lore: string;
}

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;
    private defeatData: GameOverData = {};
    private uiContainer!: Phaser.GameObjects.Container;
    private enemySpriteContainer!: Phaser.GameObjects.Container; // Separate container for enemy sprite
    private statsContainer!: Phaser.GameObjects.Container; // Separate container for run statistics
    private compendiumEntries: CompendiumEntry[] = [];

    constructor ()
    {
        super('GameOver');
    }

    init(data: GameOverData) {
        // Store defeat data passed from Combat scene
        this.defeatData = data || {};
    }

    create ()
    {
        this.camera = this.cameras.main;
        // Dark red-tinted background for death atmosphere
        this.camera.setBackgroundColor(0x2d0f0f);

        // Load compendium data
        this.loadCompendiumData();

        // Create UI elements
        this.createUI();

        // Listen for resize events
        this.scale.on('resize', this.handleResize, this);

        // Allow click to return to main menu (with visual feedback)
        this.input.once('pointerdown', () => {
            // Fade out effect
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });
    }

    /**
     * Create UI elements
     */
    private createUI(): void {
        // Get screen dimensions safely
        const screenWidth = this.cameras.main?.width || this.scale.width || 1024;
        const screenHeight = this.cameras.main?.height || this.scale.height || 768;
        const scaleFactor = Math.min(screenWidth / 1024, screenHeight / 768);
        
        // Create container for all UI elements
        this.uiContainer = this.add.container(0, 0);

        // Dark background with vignette effect
        this.background = this.add.image(screenWidth/2, screenHeight/2, 'background');
        this.background.setAlpha(0.3);
        this.background.setTint(0x330000); // Red tint
        this.uiContainer.add(this.background);

        // Add dark overlay for better text contrast
        const overlay = this.add.rectangle(
            screenWidth/2, 
            screenHeight/2, 
            screenWidth, 
            screenHeight, 
            0x000000, 
            0.6
        );
        this.uiContainer.add(overlay);

        // Main "DEFEATED" text with dramatic styling
        this.gameover_text = this.add.text(screenWidth/2, screenHeight * 0.15, 'DEFEATED', {
            fontFamily: 'dungeon-mode-inverted', 
            fontSize: Math.floor(80 * scaleFactor), 
            color: '#ff4444',
            stroke: '#000000', 
            strokeThickness: 10,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);
        this.uiContainer.add(this.gameover_text);

        // Subtitle text
        const subtitleY = screenHeight * 0.22;
        const subtitle = this.add.text(
            screenWidth/2, 
            subtitleY, 
            'Your journey has ended...', 
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(24 * scaleFactor),
                color: '#cccccc',
                align: 'center'
            }
        );
        subtitle.setOrigin(0.5);
        this.uiContainer.add(subtitle);

        // Create enemy sprite display on the left side (separate container)
        this.createEnemySpriteDisplay(screenWidth, screenHeight, scaleFactor);

        // Create middle container for enemy description
        this.createEnemyDescriptionPanel(screenWidth, screenHeight, scaleFactor);

        // Create right container for run statistics
        this.createRunStatisticsPanel(screenWidth, screenHeight, scaleFactor);

        // Footer instruction
        const footerY = screenHeight * 0.92;
        const clickText = this.add.text(
            screenWidth/2,
            footerY,
            'Click anywhere to return to Main Menu',
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(20 * scaleFactor),
                color: '#888888'
            }
        );
        clickText.setOrigin(0.5);
        this.uiContainer.add(clickText);

        // Animate click text (pulsing effect)
        this.tweens.add({
            targets: clickText,
            alpha: { from: 0.5, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Fade in effect
        this.uiContainer.setAlpha(0);
        this.tweens.add({
            targets: this.uiContainer,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });
    }

    /**
     * Load compendium data from existing enemy definitions (same as Discover scene)
     */
    private loadCompendiumData(): void {
        this.compendiumEntries = [
            {
                id: "tikbalang_scout",
                name: TIKBALANG_SCOUT.name,
                description: "Horse-headed trickster spirits that guard mountain passes and mislead travelers with backward hoof prints. Their chaotic nature confuses targeting and disorients those who dare trespass their domain.",
                type: "Common",
                health: TIKBALANG_SCOUT.maxHealth,
                attack: TIKBALANG_SCOUT.damage,
                abilities: ["Confuse", "Misdirection"],
                lore: "Tagalog mountain spirits with horse heads and human bodies, Tikbalang once protected sacred forests for Bathala. Their backward footprints lead travelers in circles—tradition says wearing your shirt inside-out breaks their spell. Now corrupted by engkanto lies, these former guardians serve only deception."
            },
            {
                id: "balete_wraith",
                name: BALETE_WRAITH.name,
                description: "Tormented spirits bound to ancient Balete trees—sacred portals between the mortal realm and the spirit world. They gain strength when wounded, feeding on the pain of intrusion.",
                type: "Common",
                health: BALETE_WRAITH.maxHealth,
                attack: BALETE_WRAITH.damage,
                abilities: ["Strengthen When Hurt", "Vulnerable"],
                lore: "Balete strangler figs are revered as dwelling places of anito spirits, their aerial roots forming curtains between worlds. To cut a Balete without permission invites misfortune. Once benevolent guardians of these sacred portals, engkanto corruption has twisted them into wraiths that ensnare intruders in spectral roots."
            },
            {
                id: "sigbin_charger",
                name: SIGBIN_CHARGER.name,
                description: "Goat-like nocturnal creatures that walk backward and emit a foul stench. They steal hearts to forge dark amulets, charging with devastating burst attacks every third turn.",
                type: "Common",
                health: SIGBIN_CHARGER.maxHealth,
                attack: SIGBIN_CHARGER.damage,
                abilities: ["Burst Attack (Every 3 Turns)", "Heart Steal"],
                lore: "Visayan cryptids resembling hornless goats with large ears, Sigbin walk backward with heads lowered between hind legs. Legend says capturing one yields a heart that grants invisibility. Once loyal servants of Bathala, corruption turned them into vicious hunters harvesting hearts for the false god's rise."
            },
            {
                id: "duwende_trickster",
                name: DUWENDE_TRICKSTER.name,
                description: "Mischievous goblin-folk dwelling in anthills and ancient mounds. Their unpredictable magic can grant fortune or misfortune, now twisted to steal your defenses and disrupt your strategy.",
                type: "Common",
                health: DUWENDE_TRICKSTER.maxHealth,
                attack: DUWENDE_TRICKSTER.damage,
                abilities: ["Steal Block", "Disrupt Draw", "Fortune Reversal"],
                lore: "Known as 'Nuno sa Punso' (old man of the mound), Duwende inhabit anthills and tree stumps. Tradition demands 'Tabi-tabi po' (Excuse me) when passing their homes—offending them brings illness and bad luck. Once neutral judges of kapwa (reciprocal respect), engkanto lies corrupted them into petty tricksters."
            },
            {
                id: "tiyanak_ambusher",
                name: TIYANAK_AMBUSHER.name,
                description: "Demonic spirits of unbaptized or aborted children that mimic infant cries to lure victims into the forest. Their ambush strikes inspire terror and deal devastating critical damage.",
                type: "Common",
                health: TIYANAK_AMBUSHER.maxHealth,
                attack: TIYANAK_AMBUSHER.damage,
                abilities: ["Fear", "Critical First Strike", "Mimic Cry"],
                lore: "Appearing as crying babies in the wilderness, Tiyanak are vampiric spirits of children who died before baptism. When picked up, they transform into fanged creatures with sharp claws. Once innocent souls awaiting Bathala's judgment, they've been corrupted into instruments of the false god's malice."
            },
            {
                id: "amomongo",
                name: AMOMONGO.name,
                description: "Ape-like cryptids from the Visayan islands with razor-sharp claws that cause grievous bleeding wounds. These cave-dwelling beasts once protected mountain sanctuaries but now hunt with primal fury.",
                type: "Common",
                health: AMOMONGO.maxHealth,
                attack: AMOMONGO.damage,
                abilities: ["Bleed", "Fast Attacks", "Rending Claws"],
                lore: "Reported in Negros Occidental, Amomongo are large ape-like creatures with razor-sharp claws that attack livestock and leave deep claw marks. Legends connect them to guardian spirits of mountain sanctuaries and mineral veins. Engkanto influence drove these reclusive protectors into blood-rage, transforming them into frenzied predators."
            },
            {
                id: "bungisngis",
                name: BUNGISNGIS.name,
                description: "Enormous one-eyed giants whose perpetual laughter masks their devastating strength. Their unsettling mirth weakens the resolve of all who hear it, while they wield massive clubs with crushing force.",
                type: "Common",
                health: BUNGISNGIS.maxHealth,
                attack: BUNGISNGIS.damage,
                abilities: ["Laugh Debuff", "High Swing", "Intimidating Presence"],
                lore: "Tagalog and Cebuano cyclops giants known for constant booming laughter, Bungisngis were portrayed as strong but foolish forest dwellers, easily tricked despite tremendous strength. Engkanto corruption twisted their jovial nature into a maddening weapon—their laughter now saps the will of all who hear it."
            },
            {
                id: "kapre_shade",
                name: KAPRE_SHADE.name,
                description: "Towering tree giants perpetually smoking enormous cigars, their presence marked by the scent of tobacco and burnt leaves. They command flames and summon lesser spirits, defending their sacred trees with primal fury.",
                type: "Elite",
                health: KAPRE_SHADE.maxHealth,
                attack: KAPRE_SHADE.damage,
                abilities: ["AoE Burn", "Summon Fire Minions", "Cigar Smoke Veil"],
                lore: "Dark-skinned giants (7-9 feet tall) dwelling in large trees, Kapre are nocturnal beings visible only as glowing red eyes, perpetually smoking enormous cigars. Territorial but generally peaceful, they disorient disrespectful travelers. Once Bathala's appointed guardians of sacred groves, engkanto whispers ignited their ancient rage into infernos."
            },
            {
                id: "tawong_lipod",
                name: TAWONG_LIPOD.name,
                description: "Invisible wind spirits from Bicolano mythology that exist only as whispers on the breeze. Their unseen presence makes them impossible to target consistently, striking with sudden stuns from the air itself.",
                type: "Elite",
                health: TAWONG_LIPOD.maxHealth,
                attack: TAWONG_LIPOD.damage,
                abilities: ["Invisibility", "Wind Stun", "Air Affinity Bonus"],
                lore: "Bikol's 'hidden people' are wind spirits existing beyond human perception, sometimes revealing themselves through inexplicable sounds or sudden breezes. Traditionally neutral or benevolent, they helped lost travelers and warned of danger. Engkanto corruption transformed these peaceful wind-folk into vindictive tormentors striking from nowhere."
            },
            {
                id: "mangangaway",
                name: MANGNANGAWAY.name,
                description: "Dark sorcerers who wield forbidden hexes and curses, capable of mimicking any elemental force turned against them. They wear necklaces of skulls and channel the spirits of the damned to reverse fate itself.",
                type: "Boss",
                health: MANGNANGAWAY.maxHealth,
                attack: MANGNANGAWAY.damage,
                abilities: ["Mimic Elements", "Curse Cards", "Hex of Reversal"],
                lore: "Dark practitioners of kulam (curse magic) and barang (hex casting), Mangangaway are the opposite of healing Babaylan—they bring illness and death through cursed objects and malevolent spirits. Wearing skull necklaces, their power grows with each life taken. Ancient outcasts who broke kapwa's sacred laws, they now serve the false god as hex-wielding enforcers."
            }
        ];
    }

    /**
     * Get enemy compendium data by name
     */
    private getEnemyData(enemyName: string): CompendiumEntry | null {
        // Convert enemy name to match compendium entry names
        const entry = this.compendiumEntries.find(e => 
            e.name.toLowerCase() === enemyName.toLowerCase()
        );
        return entry || null;
    }

    /**
     * Create middle container displaying enemy description from compendium
     */
    private createEnemyDescriptionPanel(screenWidth: number, screenHeight: number, scaleFactor: number): void {
        const centerX = screenWidth / 2;
        const centerY = screenHeight * 0.58; // Moved down to avoid blocking subtitle
        const panelWidth = Math.min(450 * scaleFactor, screenWidth * 0.4); // Increased width
        const panelHeight = 480 * scaleFactor; // Adjusted height

        // Get enemy data from compendium
        const enemyData = this.defeatData.defeatedBy ? this.getEnemyData(this.defeatData.defeatedBy) : null;

        // Panel background with border
        const panelBg = this.add.rectangle(
            centerX,
            centerY,
            panelWidth,
            panelHeight,
            0x1a0a0a
        );
        panelBg.setStrokeStyle(3, 0x663333);
        this.uiContainer.add(panelBg);

        let contentY = centerY - (panelHeight * 0.42);

        // Defeated by text
        if (this.defeatData.defeatedBy) {
            const defeatedByText = this.add.text(
                centerX,
                contentY,
                'Defeated By:',
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(18 * scaleFactor),
                    color: '#999999'
                }
            );
            defeatedByText.setOrigin(0.5);
            this.uiContainer.add(defeatedByText);

            contentY += 32 * scaleFactor;

            const enemyName = this.add.text(
                centerX,
                contentY,
                this.defeatData.defeatedBy,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(28 * scaleFactor),
                    color: '#ff6666'
                }
            );
            enemyName.setOrigin(0.5);
            this.uiContainer.add(enemyName);

            contentY += 45 * scaleFactor;
        }

        // Divider line
        const divider1 = this.add.rectangle(
            centerX,
            contentY,
            panelWidth * 0.8,
            2,
            0x663333
        );
        this.uiContainer.add(divider1);
        contentY += 25 * scaleFactor;

        // Description section
        const descTitle = this.add.text(
            centerX,
            contentY,
            '━━━ TACTICAL OVERVIEW ━━━',
            {
                fontFamily: 'dungeon-mode-inverted',
                fontSize: Math.floor(18 * scaleFactor),
                color: '#06d6a0',
                align: 'center'
            }
        );
        descTitle.setOrigin(0.5);
        this.uiContainer.add(descTitle);
        contentY += 28 * scaleFactor;

        // Enemy description from compendium
        let descriptionText = 'A fearsome creature of Filipino mythology...';
        if (enemyData) {
            descriptionText = enemyData.description;
        }

        const description = this.add.text(
            centerX,
            contentY,
            descriptionText,
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(13 * scaleFactor),
                color: '#c4d1d6',
                align: 'center',
                wordWrap: { width: panelWidth * 0.85 }
            }
        );
        description.setOrigin(0.5, 0);
        this.uiContainer.add(description);

        // Calculate spacing after description
        const descHeight = description.height;
        contentY += descHeight + 25 * scaleFactor;

        // Divider line before lore
        const divider2 = this.add.rectangle(
            centerX,
            contentY,
            panelWidth * 0.8,
            2,
            0x663333
        );
        this.uiContainer.add(divider2);
        contentY += 25 * scaleFactor;

        // Lore/Mythology section
        const loreTitle = this.add.text(
            centerX,
            contentY,
            '━━━ MYTHOLOGY ━━━',
            {
                fontFamily: 'dungeon-mode-inverted',
                fontSize: Math.floor(18 * scaleFactor),
                color: '#ffd93d',
                align: 'center'
            }
        );
        loreTitle.setOrigin(0.5);
        this.uiContainer.add(loreTitle);
        contentY += 28 * scaleFactor;

        // Enemy lore from compendium
        let loreText = 'Ancient tales speak of this creature...';
        if (enemyData) {
            loreText = enemyData.lore;
        }

        const lore = this.add.text(
            centerX,
            contentY,
            loreText,
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(13 * scaleFactor),
                color: '#d4b878',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: panelWidth * 0.85 }
            }
        );
        lore.setOrigin(0.5, 0);
        this.uiContainer.add(lore);
    }

    /**
     * Create right container displaying run statistics
     */
    private createRunStatisticsPanel(screenWidth: number, screenHeight: number, scaleFactor: number): void {
        this.statsContainer = this.add.container(0, 0);

        // Position on right side
        const statsX = screenWidth * 0.8;
        const statsY = screenHeight * 0.58; // Match middle panel position
        const panelWidth = Math.min(320 * scaleFactor, screenWidth * 0.28); // Increased width
        const panelHeight = 420 * scaleFactor; // Increased height

        // Panel background with border
        const statsBg = this.add.rectangle(
            statsX,
            statsY,
            panelWidth,
            panelHeight,
            0x1a0a0a
        );
        statsBg.setStrokeStyle(3, 0x663333);
        this.statsContainer.add(statsBg);

        let contentY = statsY - (panelHeight * 0.40);

        // Title with enhanced styling
        const statsTitle = this.add.text(
            statsX,
            contentY,
            '━━━ RUN STATS ━━━',
            {
                fontFamily: 'dungeon-mode-inverted',
                fontSize: Math.floor(22 * scaleFactor),
                color: '#e8eced',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        statsTitle.setOrigin(0.5);
        this.statsContainer.add(statsTitle);
        contentY += 55 * scaleFactor;

        // Format best hand for display
        const bestHandDisplay = this.formatHandType(this.defeatData.bestHand || 'High Card');

        // Stats display - enhanced layout with separate label and value
        const statsConfig = [
            { label: 'Turns Survived', value: this.defeatData.turnsPlayed ?? 0, color: '#e8eced', labelColor: '#999999' },
            { label: 'Total Damage', value: this.defeatData.totalDamageDealt ?? 0, color: '#e8eced', labelColor: '#999999' },
            { label: 'Best Hand', value: bestHandDisplay, color: '#e8eced', labelColor: '#999999' },
            { label: 'Relics Obtained', value: this.defeatData.relicsObtained ?? 0, color: '#e8eced', labelColor: '#999999' }
        ];

        statsConfig.forEach((stat, index) => {
            const statY = contentY + index * (75 * scaleFactor);

            // Stat container background
            const statBg = this.add.rectangle(
                statsX,
                statY + 10 * scaleFactor,
                panelWidth * 0.85,
                60 * scaleFactor,
                0x1a0a0a,
                1
            );
            statBg.setStrokeStyle(2, 0x663333);
            this.statsContainer.add(statBg);

            // Label (smaller, gray)
            const labelText = this.add.text(
                statsX,
                statY,
                stat.label,
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(12 * scaleFactor),
                    color: stat.labelColor,
                    align: 'center',
                    wordWrap: { width: panelWidth * 0.8 }
                }
            );
            labelText.setOrigin(0.5);
            this.statsContainer.add(labelText);

            // Value (larger, colored)
            const valueText = this.add.text(
                statsX,
                statY + 22 * scaleFactor,
                stat.value.toString(),
                {
                    fontFamily: 'dungeon-mode',
                    fontSize: Math.floor(16 * scaleFactor),
                    color: stat.color,
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            );
            valueText.setOrigin(0.5);
            this.statsContainer.add(valueText);
        });

        // Fade in stats container separately
        this.statsContainer.setAlpha(0);
        this.tweens.add({
            targets: this.statsContainer,
            alpha: 1,
            duration: 1200,
            delay: 400,
            ease: 'Power2'
        });
    }

    /**
     * Handle scene resize
     */
    private handleResize(): void {
        // Only resize if scene is active and cameras are ready
        if (!this.scene.isActive() || !this.cameras.main) {
            return;
        }
        
        // Clear and recreate UI
        if (this.uiContainer) {
            this.uiContainer.destroy();
        }
        if (this.enemySpriteContainer) {
            this.enemySpriteContainer.destroy();
        }
        if (this.statsContainer) {
            this.statsContainer.destroy();
        }
        this.createUI();
    }

    /**
     * Create enemy sprite display (separate container on left side)
     */
    private createEnemySpriteDisplay(screenWidth: number, screenHeight: number, scaleFactor: number): void {
        this.enemySpriteContainer = this.add.container(0, 0);

        // Position on left side
        const spriteX = screenWidth * 0.2;
        const spriteY = screenHeight * 0.58; // Match middle panel position

        // Background panel for sprite
        const spriteBg = this.add.rectangle(
            spriteX,
            spriteY,
            200 * scaleFactor,
            280 * scaleFactor,
            0x1a0a0a
        );
        spriteBg.setStrokeStyle(3, 0x663333);
        this.enemySpriteContainer.add(spriteBg);

        // Debug log
        console.log(`[GameOver] Enemy sprite key: ${this.defeatData.enemySpriteKey}`);
        console.log(`[GameOver] Texture exists: ${this.defeatData.enemySpriteKey ? this.textures.exists(this.defeatData.enemySpriteKey) : false}`);

        // Try to display enemy sprite if available
        if (this.defeatData.enemySpriteKey && this.textures.exists(this.defeatData.enemySpriteKey)) {
            const enemySprite = this.add.sprite(
                spriteX,
                spriteY - 20 * scaleFactor,
                this.defeatData.enemySpriteKey
            );
            
            // Scale sprite to fit panel
            const maxWidth = 150 * scaleFactor;
            const maxHeight = 180 * scaleFactor;
            const spriteScale = Math.min(
                maxWidth / enemySprite.width,
                maxHeight / enemySprite.height
            );
            enemySprite.setScale(spriteScale);
            
            console.log(`[GameOver] Enemy sprite created with scale: ${spriteScale}`);
            
            this.enemySpriteContainer.add(enemySprite);

            // Add subtle glow effect behind sprite
            const glow = this.add.rectangle(
                spriteX,
                spriteY - 20 * scaleFactor,
                enemySprite.width * spriteScale + 20,
                enemySprite.height * spriteScale + 20,
                0xff4444,
                0.2
            );
            this.enemySpriteContainer.add(glow);
            this.enemySpriteContainer.sendToBack(glow);
            this.enemySpriteContainer.sendToBack(spriteBg); // Ensure background is at back
        } else {
            console.warn(`[GameOver] Enemy sprite not found or not loaded: ${this.defeatData.enemySpriteKey}`);
            
            // Show placeholder icon if sprite unavailable
            const placeholderText = this.add.text(
                spriteX,
                spriteY - 20 * scaleFactor,
                '👹',
                {
                    fontSize: Math.floor(80 * scaleFactor),
                    align: 'center'
                }
            );
            placeholderText.setOrigin(0.5);
            this.enemySpriteContainer.add(placeholderText);
        }

        // Label below sprite
        const spriteLabel = this.add.text(
            spriteX,
            spriteY + 110 * scaleFactor,
            'Your Nemesis',
            {
                fontFamily: 'dungeon-mode',
                fontSize: Math.floor(16 * scaleFactor),
                color: '#999999',
                align: 'center'
            }
        );
        spriteLabel.setOrigin(0.5);
        this.enemySpriteContainer.add(spriteLabel);

        // Fade in sprite container separately
        this.enemySpriteContainer.setAlpha(0);
        this.tweens.add({
            targets: this.enemySpriteContainer,
            alpha: 1,
            duration: 1200,
            delay: 300,
            ease: 'Power2'
        });
    }

    /**
     * Format hand type for display (convert snake_case to Title Case)
     */
    private formatHandType(handType: string): string {
        // Map of hand types to display names
        const handTypeMap: { [key: string]: string } = {
            'high_card': 'High Card',
            'pair': 'Pair',
            'two_pair': 'Two Pair',
            'three_of_a_kind': 'Three of a Kind',
            'straight': 'Straight',
            'flush': 'Flush',
            'full_house': 'Full House',
            'four_of_a_kind': 'Four of a Kind',
            'straight_flush': 'Straight Flush',
            'five_of_a_kind': 'Five of a Kind'
        };

        const lowerHandType = handType.toLowerCase();
        return handTypeMap[lowerHandType] || handType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    shutdown() {
        // Clean up event listeners
        this.scale.off('resize', this.handleResize, this);
    }
}

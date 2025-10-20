import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { Player, Relic } from "../../core/types/CombatTypes";
import { allShopItems, ShopItem } from "../../data/relics/ShopItems";
import { getRelicById } from "../../data/relics/Act1Relics";
import { MusicManager } from "../../core/managers/MusicManager";

/**
 * Helper function to get the sprite key for a relic based on its ID
 */
function getRelicSpriteKey(relicId: string): string {
  const spriteMap: Record<string, string> = {
    'swift_wind_agimat': 'relic_swift_wind_agimat',
    'amomongo_claw': 'relic_amomongo_claw',
    'ancestral_blade': 'relic_ancestral_blade',
    'balete_root': 'relic_balete_root',
    'babaylans_talisman': 'relic_babaylans_talisman',
    'bungisngis_grin': 'relic_bungisngis_grin',
    'diwatas_crown': 'relic_diwatas_crown',
    'duwende_charm': 'relic_duwende_charm',
    'earthwardens_plate': 'relic_earthwardens_plate',
    'ember_fetish': 'relic_ember_fetish',
    'kapres_cigar': 'relic_kapres_cigar',
    'lucky_charm': 'relic_lucky_charm',
    'mangangaway_wand': 'relic_mangangaway_wand',
    'sarimanok_feather': 'relic_sarimanok_feather',
    'sigbin_heart': 'relic_sigbin_heart',
    'stone_golem_heart': 'relic_stone_golem_heart',
    'tidal_amulet': 'relic_tidal_amulet',
    'tikbalangs_hoof': 'relic_tikbalangs_hoof',
    'tiyanak_tear': 'relic_tiyanak_tear',
    'umalagad_spirit': 'relic_umalagad_spirit'
  };
  
  return spriteMap[relicId] || '';
}

export class Shop extends Scene {
  private player!: Player;
  private shopItems: ShopItem[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private gintoText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;
  private scrollContainer: Phaser.GameObjects.Container | null = null;
  private currentTooltip: Phaser.GameObjects.Container | null = null;
  private merchantCharacter!: Phaser.GameObjects.Container;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private autoDialogueTimer: Phaser.Time.TimerEvent | null = null;

  // Merchant dialogue for different relics - now using centralized relic system
  private getRelicDialogue(relicId: string): string[] {
    const relic = getRelicById(relicId);
    
    // Return specific dialogues for known relics, or use the relic's description as base
    const specificDialogues: { [key: string]: string[] } = {
      "earthwardens_plate": [
        "Ah, the Earthwarden's Plate! Forged from sacred linga stones in the deepest caves where the earth spirits dwell.",
        "This armor was blessed by the mountain anitos themselves. It will shield you from harm.",
        "I found this piece in the ruins of an ancient temple. The earth still whispers its secrets."
      ],
      "swift_wind_agimat": [
        "The Agimat of Swift Wind carries the essence of the Tikbalang's legendary speed!",
        "This talisman was crafted during the new moon. It grants swiftness to those pure of heart.",
        "A wind spirit blessed this amulet. It will make your hands faster than the eye can see."
      ],
      "babaylans_talisman": [
        "The Babaylan's Talisman... a powerful artifact from the ancient healers and mystics.",
        "This belonged to a great babaylan who could speak with the anitos. It enhances one's spiritual power.",
        "I traded three years of my life to an engkanto for this. It makes your hands blessed by the spirits."
      ],
      "echo_ancestors": [
        "The Echo of Ancestors resonates with the voices of those who came before us.",
        "This relic holds the wisdom of generations. It can unlock possibilities beyond imagination.",
        "The ancestral spirits whisper through this stone. It grants power over the mystical numbers."
      ],
      "ember_fetish": [
        "This Ember Fetish was carved from the heart of a banana tree at midnight, during Apolaki's sacred hour.",
        "Feel the warmth of the sun god's blessing! It ignites your inner fire when you're most vulnerable.",
        "The flames of courage burn within this fetish. Use it wisely, young warrior."
      ],
      "umalagad_spirit": [
        "Umalagad's Spirit... the essence of the great sea serpent that guides lost sailors home.",
        "This spirit will protect you as it protected the ancient fishermen of Panay.",
        "The serpent's wisdom flows through this relic. It will sharpen your reflexes in battle."
      ],
      "ancestral_blade": [
        "The Ancestral Blade... a kampilan that has tasted victory in a thousand battles.",
        "Your ancestors' spirits dwell within this steel. They will guide your strikes true.",
        "This blade grows stronger when your heart beats in harmony with your heritage."
      ],
      "tidal_amulet": [
        "The Tidal Amulet pulses with the eternal rhythm of the sea. Can you feel its healing power?",
        "This coral fragment came from the deepest trenches where the diwata dwell.",
        "The ocean's mercy flows through this charm. It will mend what battle has broken."
      ],
      "sarimanok_feather": [
        "Behold! A feather from the legendary Sarimanok! It brings prosperity to those worthy of its gifts.",
        "This radiant plume fell from the sky during a solar eclipse. It's worth more than gold itself.",
        "The Sarimanok's blessing is upon this feather. Success will follow in your wake."
      ]
    };

    // Return specific dialogue if available, otherwise generate from relic description
    if (specificDialogues[relicId]) {
      return specificDialogues[relicId];
    }

    // Generate dialogue from relic description
    return [
      `${relic.name}... ${relic.description}`,
      "This artifact holds ancient power from the mystical realms...",
      "The spirits themselves guided this item to my shop. Perhaps they meant it for you."
    ];
  }

  constructor() {
    super({ key: "Shop" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    // Filter out relics the player already has and exclude merchants_scale (moved to treasure)
    this.shopItems = allShopItems.filter(
      item => item.item.id !== 'merchants_scale' && !this.player.relics.some(relic => relic.id === item.item.id)
    );
  }

  /**
   * Calculate the actual price for an item after applying DDA and relic discounts
   */
  private getActualPrice(item: ShopItem): number {
    const basePrice = item.price;
    
    // Apply DDA price multiplier FIRST
    const dda = RuleBasedDDA.getInstance();
    const adjustment = dda.getCurrentDifficultyAdjustment();
    const ddaAdjustedPrice = Math.round(basePrice * adjustment.shopPriceMultiplier);
    
    // Then apply relic-based discounts (Merchant's Scale)
    const finalPrice = RelicManager.calculateShopPriceReduction(ddaAdjustedPrice, this.player);
    
    // Log for thesis data collection
    if (ddaAdjustedPrice !== basePrice || finalPrice !== ddaAdjustedPrice) {
      console.log(`💰 DDA Shop Pricing [${item.name}]: ${basePrice} → ${ddaAdjustedPrice} (DDA ${adjustment.tier}) → ${finalPrice} (relics)`);
    }
    
    return finalPrice;
  }

  create(): void {
    if (!this.cameras.main) return;
    this.cameras.main.setBackgroundColor(0x150E10); // Match combat background

    // Initialize MusicManager and play scene music automatically
    MusicManager.getInstance().setScene(this);
    MusicManager.getInstance().playSceneMusic();

    // Create animated background elements
    this.createBackgroundElements();

    // Create mysterious merchant character on the left
    this.createMerchantCharacter();

    // Create modern title section
    const screenWidth = this.cameras.main.width;
    
    // Title background panel with prologue/combat theme - made much wider
    const titlePanel = this.add.graphics();
    titlePanel.fillStyle(0x150E10, 0.9);
    titlePanel.fillRoundedRect(screenWidth/2 - 300, 10, 600, 60, 12); // Increased from 400px to 600px
    titlePanel.lineStyle(2, 0x77888C, 0.8);
    titlePanel.strokeRoundedRect(screenWidth/2 - 300, 10, 600, 60, 12); // Increased from 400px to 600px
    titlePanel.setDepth(2000); // Ensure title stays on top and doesn't scroll
    
    // Main title with prologue/combat styling
    const title = this.add.text(
      screenWidth / 2,
      40,
      "MYSTERIOUS MERCHANT",
      {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(2001); // Ensure title text stays on top
    
    // Subtitle
    const subtitle = this.add.text(
      screenWidth / 2,
      65,
      "• Rare Relics & Mystical Artifactssss •",
      {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(2001); // Ensure subtitle text stays on top
    
    // Title animation
    title.setScale(0.8).setAlpha(0);
    subtitle.setScale(0.8).setAlpha(0);
    
    this.tweens.add({
      targets: [title, subtitle],
      scale: 1,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
      delay: 200
    });

    // Create currency display
    this.createCurrencyDisplay();

    // Create inventory-style UI with categories
    this.createCategorizedInventoryUI();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);

    // Listen for scene shutdown to clean up tooltips
    this.events.on('shutdown', this.cleanup, this);
  }

  private cleanup(): void {
    // Clean up typewriter timer
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }
    
    // Clean up auto dialogue timer
    if (this.autoDialogueTimer) {
      this.autoDialogueTimer.destroy();
      this.autoDialogueTimer = null;
    }
    
    // Clean up dialogue container
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
      this.dialogueContainer = undefined;
    }
    
    // Clean up any remaining tooltips
    this.hideItemTooltip();
    
    // Remove event listeners
    this.scale.off('resize', this.handleResize, this);
    this.events.off('shutdown', this.cleanup, this);
  }

  private createBackgroundElements(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create a sophisticated background matching prologue/combat theme
    const bgOverlay = this.add.graphics();
    bgOverlay.fillStyle(0x150E10, 1);
    bgOverlay.fillRect(0, 0, screenWidth, screenHeight);
    
    // Add subtle geometric pattern with prologue/combat colors - reduced for performance
    for (let i = 0; i < 6; i++) { // Reduced from 12 to 6
      const size = Phaser.Math.Between(15, 45);
      const x = Phaser.Math.Between(0, screenWidth);
      const y = Phaser.Math.Between(0, screenHeight);
      
      const shape = this.add.graphics();
      shape.lineStyle(1, 0x77888C, 0.1); // Reduced opacity
      shape.beginPath();
      shape.moveTo(x, y);
      shape.lineTo(x + size, y);
      shape.lineTo(x + size/2, y - size * 0.866);
      shape.closePath();
      shape.strokePath();
      
      // Slower rotation animation for better performance
      this.tweens.add({
        targets: shape,
        rotation: Math.PI * 2,
        duration: Phaser.Math.Between(30000, 45000), // Slower rotation
        repeat: -1,
        ease: 'Linear'
      });
    }
    
    // Reduce particle count for better performance
    for (let i = 0; i < 8; i++) { // Reduced from 20 to 8
      const particle = this.add.circle(
        Phaser.Math.Between(0, screenWidth),
        Phaser.Math.Between(0, screenHeight),
        Phaser.Math.Between(1, 2),
        0x77888C,
        0.2 // Reduced opacity
      );
      
      // Simpler floating animation
      this.tweens.add({
        targets: particle,
        x: '+=' + Phaser.Math.Between(-60, 60), // Reduced movement range
        y: '+=' + Phaser.Math.Between(-60, 60),
        alpha: 0.4,
        duration: Phaser.Math.Between(8000, 12000), // Slower animation
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
    
    // Add corner decorative elements with prologue/combat theme
    const cornerSize = 40;
    
    // Top-left corner
    const topLeft = this.add.graphics();
    topLeft.lineStyle(3, 0x77888C, 0.8);
    topLeft.beginPath();
    topLeft.moveTo(20, cornerSize + 20);
    topLeft.lineTo(20, 20);
    topLeft.lineTo(cornerSize + 20, 20);
    topLeft.strokePath();
    
    // Top-right corner
    const topRight = this.add.graphics();
    topRight.lineStyle(3, 0x77888C, 0.8);
    topRight.beginPath();
    topRight.moveTo(screenWidth - cornerSize - 20, 20);
    topRight.lineTo(screenWidth - 20, 20);
    topRight.lineTo(screenWidth - 20, cornerSize + 20);
    topRight.strokePath();
    
    // Bottom-left corner
    const bottomLeft = this.add.graphics();
    bottomLeft.lineStyle(3, 0x77888C, 0.8);
    bottomLeft.beginPath();
    bottomLeft.moveTo(20, screenHeight - cornerSize - 20);
    bottomLeft.lineTo(20, screenHeight - 20);
    bottomLeft.lineTo(cornerSize + 20, screenHeight - 20);
    bottomLeft.strokePath();
    
    // Bottom-right corner
    const bottomRight = this.add.graphics();
    bottomRight.lineStyle(3, 0x77888C, 0.8);
    bottomRight.beginPath();
    bottomRight.moveTo(screenWidth - cornerSize - 20, screenHeight - 20);
    bottomRight.lineTo(screenWidth - 20, screenHeight - 20);
    bottomRight.lineTo(screenWidth - 20, screenHeight - cornerSize - 20);
    bottomRight.strokePath();
    
    // Add a subtle pulsing effect to corners - optimized
    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    corners.forEach((corner, index) => {
      this.tweens.add({
        targets: corner,
        alpha: 0.4,
        duration: 3000, // Slower pulse for better performance
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: index * 500 // Stagger the animations
      });
    });
  }

  private createMerchantCharacter(): void {
    const screenHeight = this.cameras.main.height;
    
    // Position merchant on the left side - matching card layout
    const merchantX = 180;
    const merchantY = screenHeight * 0.5;
    
    // Create container for merchant
    this.merchantCharacter = this.add.container(merchantX, merchantY);
    this.merchantCharacter.setDepth(500);
    
    // Match the premium card design with layered approach
    const panelWidth = 280;
    const panelHeight = 400;
    
    // LAYER 1: Outer glow (matching card outerGlow)
    const outerGlow = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xfbbf24, 0.12)
      .setStrokeStyle(2, 0xfbbf24, 0.5);
    
    // LAYER 2: Main background (matching card background)
    const background = this.add.rectangle(0, 0, panelWidth - 8, panelHeight - 8, 0x1d151a)
      .setStrokeStyle(1, 0x4a3a40);
    
    // LAYER 3: Top decorative accent bar (matching card topBar)
    const topBar = this.add.rectangle(0, -panelHeight/2 + 9, panelWidth - 16, 6, 0xfbbf24, 0.7);
    
    // Title text with gold theme (matching shop gold color)
    const merchantTitle = this.add.text(0, -panelHeight/2 + 35, 'MYSTERIOUS', {
      fontFamily: 'dungeon-mode',
      fontSize: 16,
      color: '#fbbf24',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantSubtitle = this.add.text(0, -panelHeight/2 + 52, 'MERCHANT', {
      fontFamily: 'dungeon-mode',
      fontSize: 20,
      color: '#fbbf24',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Sprite frame area (matching card spriteFrame style)
    const spriteFrameWidth = 220;
    const spriteFrameHeight = 260;
    const spriteFrame = this.add.rectangle(0, 20, spriteFrameWidth, spriteFrameHeight, 0x000000, 0)
      .setStrokeStyle(2, 0xffffff, 0.3);
    
    // Create the static merchant sprite - no animation
    const merchantSprite = this.add.sprite(0, 20, 'merchant_main');
    merchantSprite.setScale(0.8); // Keep the same size
    
    // Make merchant sprite interactive for dialogue
    merchantSprite.setInteractive();
    merchantSprite.on('pointerdown', () => this.showMerchantDialogue());
    merchantSprite.on('pointerover', () => {
      merchantSprite.setTint(0xdddddd); // Slight tint on hover
      this.input.setDefaultCursor('pointer');
    });
    merchantSprite.on('pointerout', () => {
      merchantSprite.clearTint();
      this.input.setDefaultCursor('default');
    });

    // Add subtle mystical glow effect (gold theme)
    const magicGlow = this.add.graphics();
    magicGlow.fillStyle(0xfbbf24, 0.15);
    magicGlow.fillCircle(0, 20, 100);
    
    // Create dialogue system
    this.createMerchantDialogueSystem();
    
    // Bottom description area (matching card style)
    const descArea = this.add.rectangle(0, panelHeight/2 - 50, panelWidth - 30, 60, 0xfbbf24, 0.1)
      .setStrokeStyle(1, 0xfbbf24, 0.3);
    
    // Description text with gold theme
    const descText = this.add.text(0, panelHeight/2 - 50, 'Dealer of rare relics\nand mystical artifacts', {
      fontFamily: 'dungeon-mode',
      fontSize: 12,
      color: '#fbbf24',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add all elements to container (layered approach matching cards)
    this.merchantCharacter.add([
      outerGlow,
      background,
      topBar,
      merchantTitle,
      merchantSubtitle,
      spriteFrame,
      magicGlow,
      merchantSprite,
      descArea,
      descText
    ]);
    
    // Add simple floating animation for the merchant panel
    this.tweens.add({
      targets: this.merchantCharacter,
      y: merchantY - 8,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private merchantDialogues = [
    "Welcome, traveler... I've been expecting you.",
    "These relics hold power beyond mortal comprehension.",
    "Each artifact tells a story of forgotten gods...",
    "Choose wisely - the spirits judge your decisions.",
    "My wares are not for the weak of heart.",
    "The ancestors whisper of your journey...",
    "Balance is key - take only what you need.",
    "These treasures have waited eons for the right bearer."
  ];
  private currentDialogueIndex = 0;
  private dialogueContainer?: Phaser.GameObjects.Container;

  private createMerchantDialogueSystem(): void {
    // Auto-dialogue every 8-12 seconds
    this.autoDialogueTimer = this.time.addEvent({
      delay: Phaser.Math.Between(8000, 12000),
      callback: () => this.showMerchantDialogue(true),
      loop: true
    });
  }

  private showMerchantDialogue(isAuto: boolean = false): void {
    // Safety check: don't run if scene is shutting down
    if (!this.sys || !this.sys.isActive()) {
      return;
    }
    
    // Don't show auto dialogue if manual dialogue is active
    if (isAuto && this.dialogueContainer && this.dialogueContainer.visible) {
      return;
    }

    // Hide existing dialogue and clean up timer
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
    }
    
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Get current dialogue
    const dialogue = this.merchantDialogues[this.currentDialogueIndex];
    this.currentDialogueIndex = (this.currentDialogueIndex + 1) % this.merchantDialogues.length;

    // Create dialogue container
    this.dialogueContainer = this.add.container(screenWidth / 2, screenHeight - 120);
    this.dialogueContainer.setDepth(3000); // High depth to be above everything

    // Dialogue box background - matching game style
    const boxWidth = Math.min(screenWidth - 100, 800);
    const boxHeight = 100;

    // Main dialogue background
    const dialogueBg = this.add.graphics();
    dialogueBg.fillStyle(0x0a0a0a, 0.95);
    dialogueBg.fillRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);

    // Outer border - matching shop style
    dialogueBg.lineStyle(3, 0x77888C, 1.0);
    dialogueBg.strokeRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);

    // Inner accent border
    dialogueBg.lineStyle(1, 0x9BA3A7, 0.8);
    dialogueBg.strokeRoundedRect(-boxWidth/2 + 6, -boxHeight/2 + 6, boxWidth - 12, boxHeight - 12, 8);

    // Character name plate
    const namePlate = this.add.graphics();
    namePlate.fillStyle(0x77888C, 0.9);
    namePlate.fillRoundedRect(-boxWidth/2 + 20, -boxHeight/2 - 15, 160, 30, 8);
    namePlate.lineStyle(2, 0x9BA3A7, 0.8);
    namePlate.strokeRoundedRect(-boxWidth/2 + 20, -boxHeight/2 - 15, 160, 30, 8);

    // Character name
    const characterName = this.add.text(-boxWidth/2 + 100, -boxHeight/2, 'MYSTERIOUS MERCHANT', {
      fontFamily: 'dungeon-mode',
      fontSize: 12,
      color: '#E8E8E8',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Dialogue text with typewriter effect
    const dialogueText = this.add.text(0, -10, '', {
      fontFamily: 'dungeon-mode',
      fontSize: 16,
      color: '#E8E8E8',
      align: 'center',
      wordWrap: { width: boxWidth - 40 }
    }).setOrigin(0.5);

    // Continue indicator
    const continueText = this.add.text(boxWidth/2 - 30, boxHeight/2 - 15, '▼', {
      fontFamily: 'dungeon-mode',
      fontSize: 14,
      color: '#77888C'
    }).setOrigin(0.5);
    continueText.setVisible(false);

    // Add elements to container
    this.dialogueContainer.add([dialogueBg, namePlate, characterName, dialogueText, continueText]);

    // Clean up existing typewriter timer before creating a new one
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
      this.typewriterTimer = null;
    }

    // Fast typewriter effect with safety checks
    let currentChar = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 15, // Faster typing (was 50ms, now 15ms)
      callback: () => {
        // Safety check: ensure dialogue container and text still exist
        if (!this.dialogueContainer || !dialogueText || !dialogueText.active) {
          const timer = this.typewriterTimer;
          if (timer) {
            timer.destroy();
            this.typewriterTimer = null;
          }
          return;
        }
        
        if (currentChar < dialogue.length) {
          try {
            dialogueText.text = dialogue.substring(0, currentChar + 1);
            currentChar++;
          } catch (error) {
            console.warn("Error updating dialogue text:", error);
            const timer = this.typewriterTimer;
            if (timer) {
              timer.destroy();
              this.typewriterTimer = null;
            }
          }
        } else {
          const timer = this.typewriterTimer;
          if (timer) {
            timer.destroy();
            this.typewriterTimer = null;
          }
          
          if (continueText && continueText.active) {
            continueText.setVisible(true);
            
            // Pulse animation for continue indicator
            this.tweens.add({
              targets: continueText,
              alpha: 0.3,
              duration: 800,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
          }
          
          // Auto-close dialogue after 2 seconds
          this.time.delayedCall(2000, () => {
            if (this.dialogueContainer && this.dialogueContainer.active) {
              this.closeDialogueSmooth();
            }
          });
        }
      },
      repeat: dialogue.length - 1
    });

    // Click to close (after typing is done)
    this.dialogueContainer.setInteractive(
      new Phaser.Geom.Rectangle(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight), 
      Phaser.Geom.Rectangle.Contains
    );
    
    this.dialogueContainer.on('pointerdown', () => {
      if (currentChar >= dialogue.length) {
        // Smooth exit animation
        this.tweens.add({
          targets: this.dialogueContainer,
          alpha: 0,
          y: screenHeight - 80,
          duration: 300,
          ease: 'Power2.easeIn',
          onComplete: () => {
            if (this.dialogueContainer) {
              this.dialogueContainer.destroy();
              this.dialogueContainer = undefined;
            }
          }
        });
      }
    });

    // Auto-hide after 5 seconds if it's an auto dialogue
    if (isAuto) {
      this.time.delayedCall(5000, () => {
        if (this.dialogueContainer && this.dialogueContainer.visible) {
          this.tweens.add({
            targets: this.dialogueContainer,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              if (this.dialogueContainer) {
                this.dialogueContainer.destroy();
                this.dialogueContainer = undefined;
              }
            }
          });
        }
      });
    }

    // Entrance animation
    this.dialogueContainer.setAlpha(0).setY(screenHeight - 80);
    this.tweens.add({
      targets: this.dialogueContainer,
      alpha: 1,
      y: screenHeight - 120,
      duration: 400,
      ease: 'Back.easeOut'
    });
  }

  private createCurrencyDisplay(): void {
    const screenWidth = this.cameras.main.width;
    
    // Create currency panel with prologue/combat theme double borders
    const currencyPanel = this.add.graphics();
    
    // Outer border
    currencyPanel.lineStyle(2, 0x77888C);
    currencyPanel.strokeRoundedRect(screenWidth - 288, 81, 268, 88, 10);
    
    // Inner border
    currencyPanel.lineStyle(2, 0x77888C);
    currencyPanel.strokeRoundedRect(screenWidth - 284, 85, 260, 80, 10);
    
    // Background
    currencyPanel.fillStyle(0x150E10, 0.9);
    currencyPanel.fillRoundedRect(screenWidth - 284, 85, 260, 80, 10);
    
    // Health display with prologue/combat styling
    this.healthText = this.add.text(
      screenWidth - 154,
      105,
      `Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
      }
    ).setOrigin(0.5, 0.5);
    
    // Currency section with proper centering
    const currencyY = 135;
    
    // Gold section - centered within currency area
    const gintoX = screenWidth - 154; // Center the gold display
    const gintoIcon = this.add.text(gintoX - 20, currencyY, "�", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.gintoText = this.add.text(gintoX + 10, currencyY, `${this.player.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Add subtle pulse animation to currency
    const currencyElements = [this.gintoText, gintoIcon];
    currencyElements.forEach((element, index) => {
      this.tweens.add({
        targets: element,
        scale: 1.05,
        duration: 1800,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: index * 250
      });
    });
  }

  private createCategorizedInventoryUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Create non-scrollable container positioned to the right of merchant
    const shopContainer = this.add.container(0, 0);
    shopContainer.setDepth(1000);
    
    // All items now use gold currency
    const allItems = this.shopItems;
    
    // Position cards with more top margin - NO TITLE
    const sectionY = 300; // Reduced since no title (was 280)
    this.createDiscoverStyleSection(allItems, screenWidth, sectionY, shopContainer);
    
    // Store container reference for resizing (no scrolling)
    this.scrollContainer = shopContainer;
  }

  private setupScrolling(container: Phaser.GameObjects.Container, screenHeight: number): void {
    const maxScroll = Math.max(0, 1200 - screenHeight + 200);
    const scrollSpeed = 35; // Optimal speed for smooth scrolling
    
    // Smooth interpolation for buttery scrolling
    let targetScrollY = 0;
    let currentScrollY = 0;
    const lerpFactor = 0.2; // Smooth lerp factor (0.1-0.3 recommended)
    
    // Scroll update loop using Phaser's update cycle
    const smoothScrollUpdate = () => {
      if (Math.abs(targetScrollY - currentScrollY) > 0.1) {
        // Smoothly interpolate to target position
        currentScrollY += (targetScrollY - currentScrollY) * lerpFactor;
        container.y = -currentScrollY;
      } else {
        currentScrollY = targetScrollY;
        container.y = -currentScrollY;
      }
    };
    
    // Add to scene update - no tweens needed
    this.events.on('update', smoothScrollUpdate);
    
    // Clean up on scene shutdown
    this.events.once('shutdown', () => {
      this.events.off('update', smoothScrollUpdate);
    });
    
    // Mouse wheel scrolling - instant response
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      if (deltaY > 0) {
        targetScrollY = Math.min(targetScrollY + scrollSpeed, maxScroll);
      } else {
        targetScrollY = Math.max(targetScrollY - scrollSpeed, 0);
      }
    });
    
    // Keyboard scrolling (arrow keys)
    this.input.keyboard?.on('keydown-UP', () => {
      targetScrollY = Math.max(targetScrollY - scrollSpeed, 0);
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      targetScrollY = Math.min(targetScrollY + scrollSpeed, maxScroll);
    });
    
    // Optional: Touch/drag scrolling for mobile-like experience
    let isDragging = false;
    let dragStartY = 0;
    let dragStartScrollY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      dragStartY = pointer.y;
      dragStartScrollY = targetScrollY;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        const dragDelta = dragStartY - pointer.y;
        targetScrollY = Phaser.Math.Clamp(dragStartScrollY + dragDelta, 0, maxScroll);
      }
    });
    
    this.input.on('pointerup', () => {
      isDragging = false;
    });
  }

  /**
   * Create Discover-style premium card section for shop items - 6x6 grid with proper margins
   */
  private createDiscoverStyleSection(items: ShopItem[], screenWidth: number, startY: number, scrollContainer: Phaser.GameObjects.Container): void {
    // 6-column grid configuration with proper left and right margins
    const leftMargin = 380; // Left margin to clear merchant
    const rightMargin = 100; // Right margin for balance
    const cardWidth = 200;  // Restored to original size (was 180)
    const cardHeight = 260; // Restored to original size (was 240)
    const cardSpacing = 30; // Spacing between cards
    const cardsPerRow = 6; // Fixed 6-column grid
    
    // Calculate grid starting position with left margin
    const gridStartX = leftMargin + cardWidth / 2;
    const gridStartY = startY;

    items.forEach((item, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = gridStartX + col * (cardWidth + cardSpacing);
      const y = gridStartY + row * (cardHeight + cardSpacing);

      const card = this.createDiscoverStyleCard(item, x, y, cardWidth, cardHeight);
      scrollContainer.add(card);
      this.relicButtons.push(card);
    });
  }

  /**
   * Create a single Discover-style premium card for shop item
   */
  private createDiscoverStyleCard(item: ShopItem, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Check if player already owns this relic
    const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
    
    // Determine rarity/type color (gold for shop items)
    const typeColorHex = "#fbbf24"; // Gold color for shop items
    const typeColor = 0xfbbf24;
    
    // Layered card background for depth (matching Discover)
    const outerGlow = this.add.rectangle(0, 0, width, height, typeColor, isOwned ? 0.06 : 0.12)
      .setStrokeStyle(2, typeColor, isOwned ? 0.25 : 0.5)
      .setOrigin(0.5);
      
    const background = this.add.rectangle(0, 0, width - 8, height - 8, 0x1d151a)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5);
    
    // Top decorative accent bar
    const topBar = this.add.rectangle(0, -height/2 + 12, width - 16, 6, typeColor, isOwned ? 0.35 : 0.7)
      .setOrigin(0.5);
    
    // Price badge at top (replacing type badge)
    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;
    const priceBadge = this.add.rectangle(0, -height/2 + 39, 110, 28, 0x2a1f24)
      .setStrokeStyle(2, typeColor)
      .setOrigin(0.5);
      
    const priceText = this.add.text(0, -height/2 + 39, `💰 ${actualPrice}`, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: isOwned ? "#9ca3af" : (hasDiscount ? "#2ed573" : typeColorHex),
      fontStyle: "bold"
    }).setOrigin(0.5);
    
    // Sprite container frame with subtle shadow
    const spriteFrame = this.add.rectangle(0, -height/2 + 160, 200, 200, 0x0f0a0d)
      .setStrokeStyle(1, typeColor, isOwned ? 0.2 : 0.4)
      .setOrigin(0.5);
    
    // Get sprite key for this relic
    const spriteKey = getRelicSpriteKey(item.item.id);
    
    // Character sprite - NATURAL ASPECT RATIO with max width constraint
    let itemVisual: Phaser.GameObjects.GameObject;
    if (this.textures.exists(spriteKey)) {
      const sprite = this.add.image(0, -height/2 + 160, spriteKey).setOrigin(0.5);
      const texture = this.textures.get(spriteKey);
      const frame = texture.get();
      const aspectRatio = frame.width / frame.height;
      const maxWidth = 190;
      const maxHeight = 190;
      
      let displayWidth, displayHeight;
      if (aspectRatio > 1) {
        displayWidth = Math.min(maxWidth, frame.width);
        displayHeight = displayWidth / aspectRatio;
      } else {
        displayHeight = Math.min(maxHeight, frame.height);
        displayWidth = displayHeight * aspectRatio;
      }
      
      sprite.setDisplaySize(displayWidth, displayHeight);
      if (isOwned) sprite.setAlpha(0.6);
      itemVisual = sprite;
    } else {
      const symbolText = this.add.text(0, -height/2 + 160, item.emoji, {
        fontSize: 80,
        color: "#e8eced"
      }).setOrigin(0.5);
      if (isOwned) symbolText.setAlpha(0.6);
      itemVisual = symbolText;
    }
    
    // Item name with better visibility
    const nameText = this.add.text(0, height/2 - 66, item.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: isOwned ? "#9ca3af" : "#e8eced",
      wordWrap: { width: width - 30 },
      align: "center"
    }).setOrigin(0.5);
    
    // Price display panel at bottom
    const pricePanel = this.add.rectangle(0, height/2 - 22, width - 16, 35, 0x0f0a0d)
      .setStrokeStyle(1, 0x4a3a40)
      .setOrigin(0.5);
    
    // Original price with strikethrough if discounted
    let discountText = null;
    if (hasDiscount && !isOwned) {
      discountText = this.add.text(-30, height/2 - 22, `${item.price}`, {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#9ca3af"
      }).setOrigin(0.5);
      discountText.setStroke("#666666", 1);
    }
    
    const finalPriceLabel = this.add.text(hasDiscount && !isOwned ? 20 : 0, height/2 - 32, hasDiscount && !isOwned ? "SALE" : "PRICE", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: hasDiscount && !isOwned ? "#2ed573" : "#77888C"
    }).setOrigin(0.5);
    
    const finalPriceValue = this.add.text(hasDiscount && !isOwned ? 20 : 0, height/2 - 14, `${actualPrice} 💰`, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: isOwned ? "#666666" : (hasDiscount ? "#2ed573" : "#fbbf24")
    }).setOrigin(0.5);
    
    // Add all elements to container in proper z-order
    const components = [outerGlow, background, topBar, priceBadge, priceText, spriteFrame, 
                       itemVisual, nameText, pricePanel, finalPriceLabel, finalPriceValue];
    if (discountText) components.push(discountText);
    
    // Owned overlay (matching Discover style)
    if (isOwned) {
      const ownedOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.65)
        .setOrigin(0.5);
      
      const ownedText = this.add.text(0, 0, "OWNED", {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 20,
        color: "#10b981",
        fontStyle: "bold"
      }).setOrigin(0.5);
      
      const checkMark = this.add.text(0, -30, "✓", {
        fontSize: 36,
        color: "#10b981",
      }).setOrigin(0.5);
      
      components.push(ownedOverlay, checkMark, ownedText);
    }
    
    container.add(components);
    
    // Store original Y position on the container for reliable hover reset
    (container as any).originalY = y;
    
    // Enhanced hover effects (matching Discover)
    if (!isOwned) {
      background.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', () => {
          // 40% chance to trigger merchant dialogue
          if (Math.random() < 0.4) {
            this.showRandomRelicDialogue(item);
          }
          this.showItemDetails(item);
        })
        .on('pointerover', () => {
          // Kill any existing tweens on these targets to prevent conflicts
          this.tweens.killTweensOf([outerGlow, topBar, container]);
          
          // Store current Y if not already stored (in case container moved)
          const originalY = (container as any).originalY;
          
          // Glow effect
          this.tweens.add({
            targets: outerGlow,
            alpha: 0.25,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 200,
            ease: 'Power2'
          });
          
          // Accent brightness
          this.tweens.add({
            targets: topBar,
            alpha: 1,
            duration: 200
          });
          
          // Subtle lift - use stored original Y
          this.tweens.add({
            targets: container,
            y: originalY - 5,
            duration: 200,
            ease: 'Power2'
          });
        })
        .on('pointerout', () => {
          // Kill any existing tweens on these targets to prevent conflicts
          this.tweens.killTweensOf([outerGlow, topBar, container]);
          
          // Get stored original Y position
          const originalY = (container as any).originalY;
          
          // Reset glow
          this.tweens.add({
            targets: outerGlow,
            alpha: 0.12,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
          });
          
          // Reset accent
          this.tweens.add({
            targets: topBar,
            alpha: 0.7,
            duration: 200
          });
          
          // Reset position to original Y
          this.tweens.add({
            targets: container,
            y: originalY,
            duration: 200,
            ease: 'Power2'
          });
        });
    }
    
    return container;
  }

  private createTooltipBox(): void {
    // Modern tooltip will be created dynamically
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
    this.tooltipBox.setDepth(3000); // Ensure it's above everything
  }

  private showItemTooltip(itemName: string, x: number, y: number): void {
    // Remove any existing tooltip
    this.hideItemTooltip();
    
    // Create tooltip container positioned above the item slot
    const tooltip = this.add.container(x, y);
    tooltip.setDepth(3000);
    tooltip.setName('itemTooltip');
    
    // Add tooltip to scroll container so it moves with the content
    if (this.scrollContainer) {
      this.scrollContainer.add(tooltip);
    }
    
    // Simplified tooltip with better performance
    const tooltipWidth = Math.max(itemName.length * 12 + 24, 120); // Simple calculation
    const tooltipHeight = 40;
    
    // Single background with shadow (no separate shadow graphics)
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3); // Shadow
    bg.fillRoundedRect(-tooltipWidth/2 + 2, -tooltipHeight/2 + 2, tooltipWidth, tooltipHeight, 10);
    bg.fillStyle(0x1a1a1a, 0.95); // Main background
    bg.lineStyle(2, 0x77888C, 0.8);
    bg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);
    bg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);
    
    // Tooltip text
    const text = this.add.text(0, 0, itemName, {
      fontFamily: "dungeon-mode",
      fontSize: 16, // Slightly smaller for better performance
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    // Simple arrow (no separate graphics)
    const arrow = this.add.polygon(0, tooltipHeight/2 + 5, [0, 0, -6, 8, 6, 8], 0x1a1a1a, 0.95);
    arrow.setStrokeStyle(2, 0x77888C, 0.8);
    
    tooltip.add([bg, text, arrow]);
    
    // Quick fade-in
    tooltip.setAlpha(0);
    this.tweens.add({
      targets: tooltip,
      alpha: 1,
      duration: 150, // Faster animation
      ease: 'Power1.easeOut'
    });
    
    // Store reference for cleanup
    this.currentTooltip = tooltip;
  }

  private hideItemTooltip(): void {
    if (this.currentTooltip) {
      this.tweens.add({
        targets: this.currentTooltip,
        alpha: 0,
        duration: 150,
        ease: 'Power2.easeOut',
        onComplete: () => {
          if (this.currentTooltip) {
            this.currentTooltip.destroy();
            this.currentTooltip = null;
          }
        }
      });
    }
  }

  private createBackButton(): void {
    const screenHeight = this.cameras.main.height;
    
    const buttonText = "Leave Shop";
    const baseWidth = 200; // Increased from 150
    const textWidth = buttonText.length * 12; // Increased per character width
    const buttonWidth = Math.max(baseWidth, textWidth + 40); // Increased padding
    const buttonHeight = 50;
    
    const backButton = this.add.container(50 + buttonWidth/2, screenHeight - 50);
    
    // Create shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-buttonWidth/2 + 3, -buttonHeight/2 + 3, buttonWidth, buttonHeight, 12);
    
    // Create button background with prologue/combat double border design
    const outerBorder = this.add.graphics();
    outerBorder.lineStyle(2, 0x77888C);
    outerBorder.strokeRoundedRect(-buttonWidth/2 - 4, -buttonHeight/2 - 4, buttonWidth + 8, buttonHeight + 8, 12);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x150E10, 0.9);
    bg.lineStyle(2, 0x77888C, 0.8);
    bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
    bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
    
    // Inner highlight
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(1, 0x77888C, 0.3);
    innerGlow.strokeRoundedRect(-buttonWidth/2 + 2, -buttonHeight/2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
    
    // Button text with prologue/combat styling
    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    backButton.add([shadow, outerBorder, bg, innerGlow, text]);
    
    // Set depth
    backButton.setDepth(2000);
    
    // Make interactive
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    // Enhanced hover effects with prologue/combat theme
    backButton.on("pointerover", () => {
      this.tweens.add({
        targets: backButton,
        scale: 1.05,
        duration: 200,
        ease: 'Power2.easeOut'
      });
      
      // Enhanced styling on hover
      bg.clear();
      bg.fillStyle(0x150E10, 1);
      bg.lineStyle(2, 0x77888C, 1);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      
      text.setColor("#ffffff");
    });
    
    backButton.on("pointerout", () => {
      this.tweens.add({
        targets: backButton,
        scale: 1,
        duration: 200,
        ease: 'Power2.easeOut'
      });
      
      // Reset styling
      bg.clear();
      bg.fillStyle(0x150E10, 0.9);
      bg.lineStyle(2, 0x77888C, 0.8);
      bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      bg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 12);
      
      text.setColor("#77888C");
    });
    
    backButton.on("pointerdown", () => {
      // Clean up any remaining tooltips
      this.hideItemTooltip();
      
      // Save player data back to GameState before leaving
      const gameState = GameState.getInstance();
      gameState.updatePlayerData(this.player);
      gameState.completeCurrentNode(true);
      
      // Manually call the Overworld resume method to reset movement flags
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop();
      this.scene.resume("Overworld");
    });
  }

  private showItemDetails(item: ShopItem): void {
    // Clean up any tooltips first
    this.hideItemTooltip();
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(2000);
    
    // Create item details panel with modern Persona styling
    const panelWidth = 520;
    const panelHeight = 580;
    const panelX = this.cameras.main.width / 2;
    const panelY = this.cameras.main.height / 2;
    
    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);
    
    // Panel shadow for depth
    const panelShadow = this.add.graphics();
    panelShadow.fillStyle(0x000000, 0.4);
    panelShadow.fillRoundedRect(-panelWidth/2 + 8, -panelHeight/2 + 8, panelWidth, panelHeight, 20);
    
    // Main panel background with shop theme (matching #77888C color scheme)
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x150E10, 0.95); // Match shop background
    panelBg.lineStyle(3, 0x77888C, 0.9); // Match shop border color
    panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    
    // Inner highlight for premium feel
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0x77888C, 0.4); // Match shop accent color
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 4, -panelHeight/2 + 4, panelWidth - 8, panelHeight - 8, 16);
    
    // Header section with shop theme
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x77888C, 0.2); // Subtle shop color background
    headerBg.lineStyle(1, 0x77888C, 0.6);
    headerBg.fillRoundedRect(-panelWidth/2 + 12, -panelHeight/2 + 12, panelWidth - 24, 80, 12);
    headerBg.strokeRoundedRect(-panelWidth/2 + 12, -panelHeight/2 + 12, panelWidth - 24, 80, 12);
    
    // Item icon with enhanced styling and proper container
    const iconContainer = this.add.graphics();
    iconContainer.fillStyle(0x150E10, 0.8); // Match shop background
    iconContainer.fillRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    iconContainer.lineStyle(2, 0x77888C, 0.8); // Shop border color
    iconContainer.strokeRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    
    // Get sprite key for this relic
    const spriteKey = getRelicSpriteKey(item.item.id);
    
    // Create item icon - use sprite if available, fallback to emoji
    let itemIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    
    if (spriteKey && this.textures.exists(spriteKey)) {
      // Use sprite if available
      itemIcon = this.add.image(-panelWidth/2 + 60, -panelHeight/2 + 60, spriteKey)
        .setOrigin(0.5)
        .setDisplaySize(56, 56); // Larger sprite for better visibility in detail modal
    } else {
      // Fallback to emoji if sprite not found
      itemIcon = this.add.text(-panelWidth/2 + 60, -panelHeight/2 + 60, item.emoji, {
        fontSize: 48,
      }).setOrigin(0.5, 0.5);
      (itemIcon as Phaser.GameObjects.Text).setShadow(2, 2, '#1a1625', 4, false, true);
    }
    
    // Item name with proper alignment, shop theme colors, and word wrap
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 40, item.name.toUpperCase(), {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#77888C",
      fontStyle: "bold",
      wordWrap: { width: panelWidth - 180 }
    }).setOrigin(0, 0);
    name.setShadow(2, 2, '#000000', 4, false, true);
    
    // Price display with shop theme
    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;
    
    const priceBg = this.add.graphics();
    priceBg.fillStyle(0x150E10, 0.9); // Match shop background
    priceBg.lineStyle(2, 0x77888C, 0.8); // Match shop border
    priceBg.fillRoundedRect(-80, -panelHeight/2 + 110, 160, hasDiscount ? 70 : 45, 12);
    priceBg.strokeRoundedRect(-80, -panelHeight/2 + 110, 160, hasDiscount ? 70 : 45, 12);
    
    let priceEmoji;
    if (item.currency === "ginto") {
      priceEmoji = "💰";
    } else {
      priceEmoji = "💎";
    }
    
    const priceLabel = this.add.text(0, -panelHeight/2 + 125, hasDiscount ? "DISCOUNTED" : "PRICE", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: hasDiscount ? "#2ed573" : "#77888C", // Green if discounted
    }).setOrigin(0.5, 0.5);
    
    let tooltipPriceElements: Phaser.GameObjects.GameObject[] = [priceLabel];
    
    if (hasDiscount) {
      const originalPrice = this.add.text(0, -panelHeight/2 + 145, `${item.price} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#888888",
      }).setOrigin(0.5, 0.5);
      originalPrice.setStroke("#666666", 2);
      
      const price = this.add.text(0, -panelHeight/2 + 165, `${actualPrice} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#2ed573",
        fontStyle: "bold"
      }).setOrigin(0.5, 0.5);
      
      tooltipPriceElements.push(originalPrice, price);
    } else {
      const price = this.add.text(0, -panelHeight/2 + 140, `${actualPrice} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5, 0.5);
      
      tooltipPriceElements.push(price);
    }
    
    // Add shadow to all price elements
    tooltipPriceElements.forEach(el => {
      if (el instanceof Phaser.GameObjects.Text) {
        el.setShadow(1, 1, '#000000', 2, false, true);
      }
    });
    
    // Content sections with shop theme
    const contentStartY = -panelHeight/2 + 200;
    
    // Description section with shop styling
    const descSection = this.add.graphics();
    descSection.fillStyle(0x77888C, 0.15); // Subtle shop color background
    descSection.lineStyle(1, 0x77888C, 0.3);
    descSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    descSection.strokeRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    
    const descTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 15, "DESCRIPTION", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const description = this.add.text(0, contentStartY + 45, item.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#cccccc", // Light gray for readability
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Lore section with shop styling
    const loreSection = this.add.graphics();
    loreSection.fillStyle(0x77888C, 0.1); // Even more subtle
    loreSection.lineStyle(1, 0x77888C, 0.2);
    loreSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    loreSection.strokeRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    
    const loreTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 135, "LORE", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const lore = this.getItemLore(item);
    const loreText = this.add.text(0, contentStartY + 165, lore, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#aaaaaa", // Light gray for lore text
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Persona 5 style close button - inside panel, top-right corner
    const closeBtn = this.add.container(panelWidth/2 - 40, -panelHeight/2 + 40);
    const closeBg = this.add.graphics();
    closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
    closeBg.lineStyle(2, 0xfca5a5, 0.8);
    closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
    closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    
    const closeText = this.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff",
    }).setOrigin(0.5, 0.5);
    closeText.setShadow(1, 1, '#000000', 2, false, true);
    
    closeBtn.add([closeBg, closeText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on("pointerdown", () => {
      // Smooth exit animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
        }
      });
    });
    closeBtn.on("pointerover", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1.1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xf87171, 0xef4444, 0xdc2626, 0xb91c1c, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 1);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    closeBtn.on("pointerout", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 0.8);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    // Modern buy button with shop theme - positioned at bottom
    const buyBtn = this.add.container(0, panelHeight/2 - 80);
    const buyBg = this.add.graphics();
    buyBg.fillStyle(0x150E10, 0.9); // Match shop background
    buyBg.lineStyle(3, 0x77888C, 0.8); // Match shop border
    buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
    buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
    
    const buyInnerGlow = this.add.graphics();
    buyInnerGlow.lineStyle(1, 0x77888C, 0.3); // Shop accent
    buyInnerGlow.strokeRoundedRect(-118, -23, 236, 46, 10);
    
    const buyText = this.add.text(0, 0, "PURCHASE ITEM", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C", // Shop accent color
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    buyText.setShadow(2, 2, '#000000', 3, false, true);
    
    buyBtn.add([buyBg, buyInnerGlow, buyText]);
    buyBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -25, 240, 50), Phaser.Geom.Rectangle.Contains);
    buyBtn.on("pointerdown", () => {
      // Clean up panel with animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          // Proceed with purchase
          this.buyItem(item);
        }
      });
    });
    buyBtn.on("pointerover", () => {
      this.tweens.add({
        targets: buyBtn,
        scale: 1.05,
        duration: 150,
        ease: 'Power2'
      });
      buyBg.clear();
      buyBg.fillStyle(0x150E10, 1); // Slightly brighter on hover
      buyBg.lineStyle(3, 0x77888C, 1); // Full opacity border on hover
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
      buyText.setColor("#ffffff"); // White text on hover
    });
    buyBtn.on("pointerout", () => {
      this.tweens.add({
        targets: buyBtn,
        scale: 1,
        duration: 150,
        ease: 'Power2'
      });
      buyBg.clear();
      buyBg.fillStyle(0x150E10, 0.9); // Return to normal
      buyBg.lineStyle(3, 0x77888C, 0.8); // Return to normal border
      buyBg.fillRoundedRect(-120, -25, 240, 50, 12);
      buyBg.strokeRoundedRect(-120, -25, 240, 50, 12);
      buyText.setColor("#77888C"); // Return to shop accent color
    });
    
    // Assemble the modern panel
    panel.add([panelShadow, panelBg, innerHighlight, headerBg, iconContainer, itemIcon, name, 
              priceBg, ...tooltipPriceElements, descSection, descTitle, description, 
              loreSection, loreTitle, loreText, closeBtn, buyBtn]);
              
    // Entrance animation
    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  private getItemLore(item: ShopItem): string {
    // Return concise lore based on item name - matching Discover scene style (200-300 chars)
    switch(item.item.id) {
      case "earthwardens_plate":
        return "Sacred linga stone armor forged by mountain anito. Channels Lupa's enduring strength to shield bearers from harm with unwavering defense rooted in kapwa's protective spirit.";
      case "swift_wind_agimat":
        return "Blessed talisman woven with Tikbalang mane hairs. Captures Hangin's swiftness, letting bearers move like breeze through bamboo groves with hands faster than sight itself.";
      case "ember_fetish":
        return "Banana tree heart carved at midnight, blessed by Apolaki's flame. Adapts to danger—dormant flames awaken when vulnerable, transforming weakness into blazing determination.";
      case "babaylans_talisman":
        return "Sacred artifact of ancient mystical healers bridging mortal and spirit realms. Reveals hidden patterns in fate's weave, elevating ordinary skills to blessed supernatural precision.";
      case "ancestral_blade":
        return "Legendary kampilan passed through warrior lineages. Ancestors guide every strike when blade and heart beat in harmony, rewarding mastery with devastating critical precision.";
      case "tidal_amulet":
        return "Coral fragment from deepest trenches where diwata dwell. Channels Tubig's healing essence with each tide's gentle embrace, restoring what violence tears asunder.";
      case "lucky_charm":
        return "Token blessed by fortune spirits in anthills and sacred mounds. Duwende magic attracts good fortune's gaze, manifesting kapwa's reciprocal blessings as golden rewards.";
      case "diwatas_crown":
        return "Magnificent circlet worn by celestial beings watching over mortal realm. Divine essence radiates from golden bands, channeling diwata guardianship to shield worthy bearers.";
      case "stone_golem_heart":
        return "Crystallized heart from ancient stone sentinel guarding mountain passes. Earth's immortal strength flows through mortal veins, expanding life force beyond natural limits.";
      case "sarimanok_feather":
        return "Radiant plume from legendary Maranao bird bringing prosperity. Fortune bird's blessing manifests as increased rewards, as if celestial approval multiplies achievements.";
      case "umalagad_spirit":
        return "Ancient sea serpent essence guiding lost sailors home. Sharpens reflexes in battle, granting serpent's wisdom and lightning-quick responses from ocean's guardian.";
      case "tikbalangs_hoof":
        return "Backward hoof from horse-headed trickster spirit. Once Bathala's guardians, their chaotic nature now grants evasive agility like leading travelers through mist-shrouded trails.";
      case "kapres_cigar":
        return "Enormous cigar from towering tree giants (7-9 feet tall). Bathala's appointed guardians whose tobacco smoke summons lesser fire spirits once per battle with devastating damage.";
      case "mangangaway_wand":
        return "Cursed implement of dark sorcerers practicing kulam and barang hex magic. Channels forbidden power to ignore debilitating curses with counter-hex wards from malevolent spirits.";
      case "sigbin_heart":
        return "Preserved heart from nocturnal goat-like cryptid walking backward. Visayan legends claim captured hearts grant invisibility—channels power into devastating burst attacks.";
      case "balete_root":
        return "Aerial root from ancient strangler fig serving as spirit realm portal. Blessed root strengthens earth-based defenses, each Lupa card reinforcing barriers like sacred roots.";
      case "duwende_charm":
        return "Enchanted token from goblin-folk in anthills. 'Nuno sa Punso' demand respect—this charm carries benevolent judgment, weakening debilitating effects with duwende magic.";
      case "tiyanak_tear":
        return "Crystallized tear from vampiric spirit mimicking infant cries. Though corrupted, this tear holds original purity, granting resistance to terror's grip before darkness twisted innocence.";
      case "amomongo_claw":
        return "Razor-sharp talon from ape-like cryptid in Negros Occidental. Once guardian spirits turned blood-frenzied, their rending claws intensify bleeding with savage persistence.";
      case "bungisngis_grin":
        return "Tusks from one-eyed Cyclops giants known for booming laughter. Engkanto twisted jovial mirth into weapon—amplifies damage against weakened enemies as maddening glee crushes will.";
      default:
        return "Mystical artifact holding ancient power from spirit realms. Origins shrouded in mystery, but effects undeniable. Anito may have guided this creation beyond mortal understanding.";
    }
  }
  
  private buyItem(item: ShopItem): void {
    // Check if player already has this relic
    if (this.player.relics.some(relic => relic.id === item.item.id)) {
      this.showMessage("You already have this relic!", "#ff9f43");
      return;
    }
    
    // Calculate actual price with relic discounts
    const actualPrice = this.getActualPrice(item);
    
    // Check if player can afford the item
    if (item.currency === "ginto" && this.player.ginto < actualPrice) {
      this.showMessage("Not enough Ginto!", "#ff4757");
      return;
    }
    
    // Check if player has enough gold
    if (this.player.ginto < actualPrice) {
      this.showMessage("Not enough Gold!", "#ff4757");
      return;
    }
    
    // Show confirmation dialog before purchase
    this.showPurchaseConfirmation(item);
  }
  
  private showPurchaseConfirmation(item: ShopItem): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(1000);
    
    // Create confirmation dialog
    const dialogWidth = 400;
    const dialogHeight = 200;
    const dialog = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(1001);
    
    // Dialog background with enhanced styling
    const dialogBg = this.add.graphics();
    dialogBg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.95);
    dialogBg.lineStyle(3, 0x57606f, 1);
    dialogBg.fillRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    dialogBg.strokeRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    
    // Dialog title
    const title = this.add.text(0, -dialogHeight/2 + 30, "Confirm Purchase", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#e8eced",
    }).setOrigin(0.5);
    title.setShadow(2, 2, '#000000', 3, false, true);
    
    // Item name
    const itemName = this.add.text(0, -20, item.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffd93d",
    }).setOrigin(0.5);
    
    // Calculate actual price with discounts
    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;
    
    // All items use gold now
    const priceColor = "#ffd93d";
    const priceEmoji = "�";
    
    // Show original price with strikethrough if discounted
    const priceY = hasDiscount ? 0 : 10;
    let priceElements: Phaser.GameObjects.GameObject[] = [];
    
    if (hasDiscount) {
      const originalPrice = this.add.text(0, priceY, `${item.price} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#888888",
      }).setOrigin(0.5);
      originalPrice.setStroke("#666666", 2);
      
      const discountedPrice = this.add.text(0, priceY + 25, `${actualPrice} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#2ed573",
      }).setOrigin(0.5);
      
      const discountLabel = this.add.text(0, priceY + 45, `(Merchant's Scale!)`, {
        fontFamily: "dungeon-mode",
        fontSize: 12,
        color: "#2ed573",
      }).setOrigin(0.5);
      
      priceElements.push(originalPrice, discountedPrice, discountLabel);
    } else {
      const price = this.add.text(0, priceY, `Price: ${actualPrice} ${priceEmoji}`, {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: priceColor,
      }).setOrigin(0.5);
      
      priceElements.push(price);
    }
    
    // Confirm button
    const confirmBtn = this.add.container(-100, dialogHeight/2 - 40);
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x2ed573, 0.9);
    confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const confirmText = this.add.text(0, 0, "Buy", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    confirmBtn.add([confirmBg, confirmText]);
    confirmBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    confirmBtn.on("pointerdown", () => {
      // Clean up dialog
      overlay.destroy();
      dialog.destroy();
      
      // Proceed with purchase
      this.proceedWithPurchase(item);
    });
    confirmBtn.on("pointerover", () => {
      confirmBg.clear();
      confirmBg.fillStyle(0x3ed583, 0.9);
      confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    confirmBtn.on("pointerout", () => {
      confirmBg.clear();
      confirmBg.fillStyle(0x2ed573, 0.9);
      confirmBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    
    // Cancel button
    const cancelBtn = this.add.container(100, dialogHeight/2 - 40);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0xff4757, 0.9);
    cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const cancelText = this.add.text(0, 0, "Cancel", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    cancelBtn.add([cancelBg, cancelText]);
    cancelBtn.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    cancelBtn.on("pointerdown", () => {
      // Clean up dialog
      overlay.destroy();
      dialog.destroy();
    });
    cancelBtn.on("pointerover", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff6b81, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    cancelBtn.on("pointerout", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff4757, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    
    dialog.add([dialogBg, title, itemName, ...priceElements, confirmBtn, cancelBtn]);
  }
  
  private proceedWithPurchase(item: ShopItem): void {
    // Calculate actual price with discounts
    const actualPrice = this.getActualPrice(item);
    
    // Deduct gold
    this.player.ginto -= actualPrice;
    
    // Add relic to player
    if (item.type === "relic") {
      this.player.relics.push(item.item as Relic);
      
      // Apply any immediate relic acquisition effects
      RelicManager.applyRelicAcquisitionEffect(item.item.id, this.player);
    }
    
    // Update UI with new currency format
    this.healthText.setText(`Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`);
    this.gintoText.setText(`${this.player.ginto}`);
    
    // Show success message with animation
    this.showMessage(`Purchased ${item.name}!`, "#2ed573");
    
    // Update the purchased item button with better visual feedback
    const itemIndex = this.shopItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      const button = this.relicButtons[itemIndex];
      if (button) {
        // Animate the button
        this.tweens.add({
          targets: button,
          scale: 1.1,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Dim all card components and add owned overlay
            // Find all relevant card components
            const outerGlow = button.list[0] as Phaser.GameObjects.Rectangle;
            const background = button.list[1] as Phaser.GameObjects.Rectangle;
            const topBar = button.list[2] as Phaser.GameObjects.Rectangle;
            
            // Disable interactivity on background
            if (background && background.input) {
              background.disableInteractive();
            }
            
            // Dim the entire card
            this.tweens.add({
              targets: [outerGlow, background, topBar],
              alpha: 0.4,
              duration: 300
            });
            
            // Dim all other elements
            button.list.forEach((child, index) => {
              if (index > 2 && child instanceof Phaser.GameObjects.GameObject) {
                this.tweens.add({
                  targets: child,
                  alpha: 0.5,
                  duration: 300
                });
              }
            });
            
            // Add owned overlay (matching Discover style)
            const ownedOverlay = this.add.rectangle(0, 0, 200, 260, 0x000000, 0.65)
              .setOrigin(0.5);
            
            const checkMark = this.add.text(0, -30, "✓", {
              fontSize: 42,
              color: "#10b981",
            }).setOrigin(0.5);
            
            const ownedText = this.add.text(0, 10, "OWNED", {
              fontFamily: "dungeon-mode-inverted",
              fontSize: 20,
              color: "#10b981",
              fontStyle: "bold"
            }).setOrigin(0.5);
            
            button.add([ownedOverlay, checkMark, ownedText]);
            button.setActive(false);
          }
        });
      }
    }
  }

  private showMessage(message: string, color: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Remove any existing message
    this.children.list.forEach((child: any) => {
      if (child instanceof Phaser.GameObjects.Text && child.y === screenHeight - 100) {
        child.destroy();
      }
    });
    
    const messageText = this.add.text(
      screenWidth / 2,
      screenHeight - 100,
      message,
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: color,
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Add shadow for better visibility
    messageText.setShadow(2, 2, '#000000', 3, false, true);
    
    // Add entrance animation
    messageText.setScale(0.1);
    this.tweens.add({
      targets: messageText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Auto-remove after 2 seconds with exit animation
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: messageText,
        scale: 0.1,
        alpha: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          messageText.destroy();
        }
      });
    });
  }

  private showRandomRelicDialogue(item: ShopItem): void {
    // Get the appropriate dialogue array for this relic using centralized system
    const relicId = item.item.id;
    const dialogues = this.getRelicDialogue(relicId);
    
    // Pick a random dialogue
    const randomDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    // Show custom merchant dialogue
    this.showCustomMerchantDialogue(randomDialogue);
  }

  private showCustomMerchantDialogue(customText: string): void {
    // Hide existing dialogue
    if (this.dialogueContainer) {
      this.dialogueContainer.destroy();
    }

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create dialogue container
    this.dialogueContainer = this.add.container(screenWidth / 2, screenHeight - 120);
    this.dialogueContainer.setDepth(3000); // High depth to be above everything

    // Dialogue box background - matching game style
    const boxWidth = Math.min(screenWidth - 100, 800);
    const boxHeight = 100;

    // Main dialogue background
    const dialogueBg = this.add.graphics();
    dialogueBg.fillStyle(0x0a0a0a, 0.95);
    dialogueBg.fillRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);

    // Outer border - matching shop style
    dialogueBg.lineStyle(3, 0x77888C, 1.0);
    dialogueBg.strokeRoundedRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 12);

    // Inner accent border
    dialogueBg.lineStyle(1, 0x9BA3A7, 0.6);
    dialogueBg.strokeRoundedRect(-boxWidth/2 + 3, -boxHeight/2 + 3, boxWidth - 6, boxHeight - 6, 9);

    // Third inner border for extra depth
    dialogueBg.lineStyle(1, 0x77888C, 0.3);
    dialogueBg.strokeRoundedRect(-boxWidth/2 + 6, -boxHeight/2 + 6, boxWidth - 12, boxHeight - 12, 6);

    // Merchant icon
    const merchantIcon = this.add.text(-boxWidth/2 + 25, 0, "🧙‍♂️", {
      fontSize: 24
    }).setOrigin(0.5);

    // Dialogue text
    const dialogueText = this.add.text(-boxWidth/2 + 60, 0, customText, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced",
      wordWrap: { width: boxWidth - 100 },
      align: "left"
    }).setOrigin(0, 0.5);

    // Add components to container
    this.dialogueContainer.add([dialogueBg, merchantIcon, dialogueText]);

    // Entrance animation
    this.dialogueContainer.setAlpha(0).setScale(0.9);
    this.tweens.add({
      targets: this.dialogueContainer,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Auto-hide after 2 seconds
    this.time.delayedCall(2000, () => {
      if (this.dialogueContainer && this.dialogueContainer.active) {
        this.closeDialogueSmooth();
      }
    });

    // Click to close
    this.dialogueContainer.setInteractive(
      new Phaser.Geom.Rectangle(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight),
      Phaser.Geom.Rectangle.Contains
    );
    this.dialogueContainer.on('pointerdown', () => {
      this.closeDialogueSmooth();
    });
  }

  private closeDialogueSmooth(): void {
    if (this.dialogueContainer) {
      this.tweens.add({
        targets: this.dialogueContainer,
        alpha: 0,
        scale: 0.9,
        duration: 200,
        ease: 'Power2.easeIn',
        onComplete: () => {
          if (this.dialogueContainer) {
            this.dialogueContainer.destroy();
          }
        }
      });
    }
  }

  /**\n   * Handle scene resize\n   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    this.createBackgroundElements();
    this.createMerchantCharacter(); // Add this missing call!
    this.createCurrencyDisplay();
    this.createCategorizedInventoryUI();
    this.createTooltipBox();
    this.createBackButton();
  }

}
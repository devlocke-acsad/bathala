import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { Player, Relic } from "../../core/types/CombatTypes";
import { allShopItems, ShopItem } from "../../data/relics/ShopItems";
import { getRelicById } from "../../data/relics/Act1Relics";

export class Shop extends Scene {
  private player!: Player;
  private shopItems: ShopItem[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private gintoText!: Phaser.GameObjects.Text;
  private diamanteText!: Phaser.GameObjects.Text;
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
   * Calculate the actual price for an item after applying relic discounts
   */
  private getActualPrice(item: ShopItem): number {
    return RelicManager.calculateShopPriceReduction(item.price, this.player);
  }

  create(): void {
    if (!this.cameras.main) return;
    this.cameras.main.setBackgroundColor(0x150E10); // Match combat background

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
    
    // Position merchant on the left side - matching UI layout style
    const merchantX = 180;
    const merchantY = screenHeight * 0.5;
    
    // Create container for merchant
    this.merchantCharacter = this.add.container(merchantX, merchantY);
    this.merchantCharacter.setDepth(500);
    
    // Create main merchant background panel - matching the shop UI style
    const panelWidth = 280;
    const panelHeight = 400;
    
    // Main dark background panel
    const merchantPanel = this.add.graphics();
    merchantPanel.fillStyle(0x0a0a0a, 0.95);
    merchantPanel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 12);
    
    // Outer glowing border - matching the shop item style
    merchantPanel.lineStyle(3, 0x77888C, 1.0);
    merchantPanel.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 12);
    
    // Inner accent border
    merchantPanel.lineStyle(1.5, 0x9BA3A7, 0.8);
    merchantPanel.strokeRoundedRect(-panelWidth/2 + 8, -panelHeight/2 + 8, panelWidth - 16, panelHeight - 16, 8);
    
    // Create title banner at top
    const titleBanner = this.add.graphics();
    titleBanner.fillStyle(0x77888C, 0.3);
    titleBanner.fillRoundedRect(-panelWidth/2 + 10, -panelHeight/2 + 10, panelWidth - 20, 50, 8);
    titleBanner.lineStyle(1, 0x9BA3A7, 0.6);
    titleBanner.strokeRoundedRect(-panelWidth/2 + 10, -panelHeight/2 + 10, panelWidth - 20, 50, 8);
    
    // Merchant title text
    const merchantTitle = this.add.text(0, -panelHeight/2 + 35, 'MYSTERIOUS', {
      fontFamily: 'dungeon-mode',
      fontSize: 16,
      color: '#E8E8E8',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantSubtitle = this.add.text(0, -panelHeight/2 + 52, 'MERCHANT', {
      fontFamily: 'dungeon-mode',
      fontSize: 20,
      color: '#77888C',
      align: 'center'
    }).setOrigin(0.5);
    
    // Create sprite area with border - positioned on the left side of panel
    const spriteAreaX = -panelWidth/4; // Position sprite on left side of panel
    const spriteAreaY = -20; // Slightly above center
    const spriteArea = this.add.graphics();
    spriteArea.fillStyle(0x1a1a1a, 0.8);
    spriteArea.fillRoundedRect(spriteAreaX - 60, spriteAreaY - 80, 120, 160, 8);
    spriteArea.lineStyle(2, 0x77888C, 0.6);
    spriteArea.strokeRoundedRect(spriteAreaX - 60, spriteAreaY - 80, 120, 160, 8);
    
    // Create the animation from individual frames - slower animation every 3 seconds
    if (!this.anims.exists('merchant-idle')) {
      this.anims.create({
        key: 'merchant-idle',
        frames: [
          { key: 'merchant_f01' },
          { key: 'merchant_f02' },
          { key: 'merchant_f03' },
          { key: 'merchant_f04' },
          { key: 'merchant_f05' },
          { key: 'merchant_f06' },
          { key: 'merchant_f07' }
        ],
        frameRate: 2, // Much slower - 2 frames per second
        repeat: -1,
        repeatDelay: 3000 // 3 second delay between animation cycles
      });
    }
    
    // Create the animated sprite - positioned on the left side
    const merchantSprite = this.add.sprite(spriteAreaX, spriteAreaY, 'merchant_f01');
    merchantSprite.setScale(6.0); // Appropriate size for the panel
    merchantSprite.play('merchant-idle');
    
    // Make merchant sprite interactive for dialogue
    merchantSprite.setInteractive();
    merchantSprite.on('pointerdown', () => this.showMerchantDialogue());
    merchantSprite.on('pointerover', () => {
      merchantSprite.setTint(0xcccccc); // Slight tint on hover
      this.input.setDefaultCursor('pointer');
    });
    merchantSprite.on('pointerout', () => {
      merchantSprite.clearTint();
      this.input.setDefaultCursor('default');
    });

    // Add subtle mystical effects around the sprite
    const magicGlow = this.add.graphics();
    magicGlow.fillStyle(0x77888C, 0.1);
    magicGlow.fillCircle(spriteAreaX, spriteAreaY, 80);
    
    // Create dialogue system
    this.createMerchantDialogueSystem();
    
    // Add merchant info panel on the right side
    const infoAreaX = panelWidth/4;
    const infoAreaY = -20;
    
    // Info background
    const infoArea = this.add.graphics();
    infoArea.fillStyle(0x77888C, 0.1);
    infoArea.fillRoundedRect(infoAreaX - 50, infoAreaY - 80, 100, 160, 8);
    infoArea.lineStyle(1, 0x9BA3A7, 0.5);
    infoArea.strokeRoundedRect(infoAreaX - 50, infoAreaY - 80, 100, 160, 8);
    
    // Merchant stats/info text
    const merchantLevel = this.add.text(infoAreaX, infoAreaY - 50, 'LEVEL 99', {
      fontFamily: 'dungeon-mode',
      fontSize: 10,
      color: '#9BA3A7',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantRep = this.add.text(infoAreaX, infoAreaY - 30, 'REPUTATION', {
      fontFamily: 'dungeon-mode',
      fontSize: 8,
      color: '#77888C',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantStars = this.add.text(infoAreaX, infoAreaY - 15, '★★★★★', {
      fontFamily: 'dungeon-mode',
      fontSize: 12,
      color: '#FFD700',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantSpecialty = this.add.text(infoAreaX, infoAreaY + 10, 'SPECIALTY:', {
      fontFamily: 'dungeon-mode',
      fontSize: 8,
      color: '#77888C',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantType = this.add.text(infoAreaX, infoAreaY + 25, 'RARE RELICS', {
      fontFamily: 'dungeon-mode',
      fontSize: 9,
      color: '#9BA3A7',
      align: 'center'
    }).setOrigin(0.5);
    
    const merchantStatus = this.add.text(infoAreaX, infoAreaY + 50, 'OPEN', {
      fontFamily: 'dungeon-mode',
      fontSize: 10,
      color: '#00FF88',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add description area at bottom
    const descArea = this.add.graphics();
    descArea.fillStyle(0x77888C, 0.15);
    descArea.fillRoundedRect(-panelWidth/2 + 15, panelHeight/2 - 80, panelWidth - 30, 60, 6);
    descArea.lineStyle(1, 0x9BA3A7, 0.4);
    descArea.strokeRoundedRect(-panelWidth/2 + 15, panelHeight/2 - 80, panelWidth - 30, 60, 6);
    
    // Description text
    const descText = this.add.text(0, panelHeight/2 - 50, 'Dealer of rare relics\nand mystical artifacts', {
      fontFamily: 'dungeon-mode',
      fontSize: 12,
      color: '#9BA3A7',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add all elements to container
    this.merchantCharacter.add([
      magicGlow,
      merchantPanel,
      titleBanner,
      merchantTitle,
      merchantSubtitle,
      spriteArea,
      merchantSprite,
      infoArea,
      merchantLevel,
      merchantRep,
      merchantStars,
      merchantSpecialty,
      merchantType,
      merchantStatus,
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

    // Typewriter effect with safety checks
    let currentChar = 0;
    this.typewriterTimer = this.time.addEvent({
      delay: 50, // Speed of typing
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
    
    // Ginto section - left aligned within currency area
    const gintoX = screenWidth - 210;
    const gintoIcon = this.add.text(gintoX - 15, currencyY, "💰", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.gintoText = this.add.text(gintoX + 15, currencyY, `${this.player.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Diamante section - right aligned within currency area
    const diamanteX = screenWidth - 110;
    const diamanteIcon = this.add.text(diamanteX - 15, currencyY, "💎", {
      fontSize: 18,
    }).setOrigin(0.5, 0.5);
    
    this.diamanteText = this.add.text(diamanteX + 15, currencyY, `${this.player.diamante}`, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    
    // Add subtle pulse animation to currency
    const currencyElements = [this.gintoText, gintoIcon, this.diamanteText, diamanteIcon];
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
    
    // Create scrollable container
    const scrollContainer = this.add.container(0, 0);
    scrollContainer.setDepth(1000);
    
    // Separate items by currency
    const gintoItems = this.shopItems.filter(item => item.currency === "ginto");
    const diamanteItems = this.shopItems.filter(item => item.currency === "diamante");
    
    // Create category sections with even better spacing
    // Start position for first section (gold items) - account for title space above
    const goldSectionY = 320; // Even higher starting position for better title clearance
    this.createCategorySection("Gold Items 💰", gintoItems, screenWidth, goldSectionY, scrollContainer);
    
    // Calculate position for diamante section with generous spacing
    const gintoRows = Math.ceil(gintoItems.length / 5);
    const diamanteSectionY = goldSectionY + (gintoRows * 190) + 200; // Extra generous space for clean separation
    
    this.createCategorySection("Diamante Items 💎", diamanteItems, screenWidth, diamanteSectionY, scrollContainer);
    
    // Add scroll functionality
    this.setupScrolling(scrollContainer, screenHeight);
    
    // Store container reference for resizing
    this.scrollContainer = scrollContainer;
  }

  private setupScrolling(container: Phaser.GameObjects.Container, screenHeight: number): void {
    let scrollY = 0;
    const maxScroll = Math.max(0, 1200 - screenHeight + 200); // Calculate based on content height
    const scrollSpeed = 80; // Increased from 30 to 80 for faster scrolling
    let isScrolling = false;
    
    // Optimized scroll function with throttling
    const performScroll = (newScrollY: number) => {
      if (isScrolling) return;
      
      isScrolling = true;
      scrollY = newScrollY;
      
      // Use tween for smooth scrolling instead of direct position update
      this.tweens.add({
        targets: container,
        y: -scrollY,
        duration: 80, // Reduced from 120 to 80 for faster response
        ease: 'Power2.easeOut',
        onComplete: () => {
          isScrolling = false;
        }
      });
    };
    
    // Mouse wheel scrolling with throttling
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      if (isScrolling) return;
      
      let newScrollY;
      if (deltaY > 0) {
        // Scroll down
        newScrollY = Math.min(scrollY + scrollSpeed, maxScroll);
      } else {
        // Scroll up
        newScrollY = Math.max(scrollY - scrollSpeed, 0);
      }
      
      performScroll(newScrollY);
    });
    
    // Keyboard scrolling (arrow keys) with throttling
    this.input.keyboard?.on('keydown-UP', () => {
      if (isScrolling) return;
      const newScrollY = Math.max(scrollY - scrollSpeed, 0);
      performScroll(newScrollY);
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (isScrolling) return;
      const newScrollY = Math.min(scrollY + scrollSpeed, maxScroll);
      performScroll(newScrollY);
    });
  }

  private createCategorySection(title: string, items: ShopItem[], screenWidth: number, startY: number, scrollContainer: Phaser.GameObjects.Container): void {
    // Create category title WELL ABOVE the items section
    const titleY = startY - 140; // Move title even higher above the item grid
    
    const categoryTitle = this.add.text(screenWidth / 2, titleY, title, {
      fontFamily: "dungeon-mode",
      fontSize: 24, // Slightly larger font
      color: "#77888C",
      align: "center",
      fontStyle: "bold"
    }).setOrigin(0.5);
    
    // Add double border background for title - made much wider
    const titleBg = this.add.graphics();
    const titleWidth = 450; // Even wider for better visual impact
    const titleHeight = 55; // Slightly taller
    
    // Outer border
    titleBg.lineStyle(2, 0x77888C);
    titleBg.strokeRoundedRect(screenWidth / 2 - titleWidth / 2 - 4, titleY - titleHeight / 2 - 4, titleWidth + 8, titleHeight + 8, 8);
    
    // Inner border  
    titleBg.lineStyle(2, 0x77888C);
    titleBg.strokeRoundedRect(screenWidth / 2 - titleWidth / 2, titleY - titleHeight / 2, titleWidth, titleHeight, 8);
    
    // Background
    titleBg.fillStyle(0x150E10, 0.9);
    titleBg.fillRoundedRect(screenWidth / 2 - titleWidth / 2, titleY - titleHeight / 2, titleWidth, titleHeight, 8);
    
    // Set depth order - titles should be above items
    titleBg.setDepth(1100);
    categoryTitle.setDepth(1101);
    
    // Add to scroll container
    scrollContainer.add([titleBg, categoryTitle]);
    
    // Create items grid with proper spacing - items start at startY
    const cardWidth = 120;
    const cardHeight = 140;
    const itemsPerRow = 5;
    const spacingX = 40;
    const spacingY = 50;
    const gridStartX = (screenWidth - (itemsPerRow * (cardWidth + spacingX) - spacingX)) / 2;
    const gridStartY = startY; // Items start at the designated startY position

    items.forEach((item, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      const x = gridStartX + col * (cardWidth + spacingX);
      const y = gridStartY + row * (cardHeight + spacingY);

      const button = this.add.container(x, y);
      
      // Check if player already owns this relic
      const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
      
      // Create shadow effect
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-cardWidth/2 + 4, -cardHeight/2 + 4, cardWidth, cardHeight, 12);
      
      // Main card background with prologue/combat theme
      const cardBg = this.add.graphics();
      if (isOwned) {
        // Owned state with muted colors
        cardBg.fillStyle(0x2a2a2a, 0.8);
        cardBg.lineStyle(2, 0x444444, 0.6);
      } else {
        // Available items with prologue/combat styling
        cardBg.fillStyle(0x150E10, 0.95);
        cardBg.lineStyle(3, 0x77888C, 0.8);
      }
      cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
      
      // Inner highlight for depth (only for available items)
      const innerHighlight = this.add.graphics();
      if (!isOwned) {
        innerHighlight.lineStyle(1, 0x77888C, 0.4);
        innerHighlight.strokeRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight - 4, 10);
      }
      
      // Icon area background
      const iconArea = this.add.graphics();
      if (isOwned) {
        iconArea.fillStyle(0x374151, 0.6);
      } else {
        iconArea.fillStyle(0x77888C, 0.2);
      }
      iconArea.fillRoundedRect(-cardWidth/2 + 8, -cardHeight/2 + 8, cardWidth - 16, 70, 8);
      
      // Item emoji with enhanced styling
      const emoji = this.add.text(0, -cardHeight/2 + 43, item.emoji, {
        fontSize: 42,
      }).setOrigin(0.5, 0.5);
      if (isOwned) {
        emoji.setAlpha(0.6);
      }
      
      // Currency badge
      let currencyColor;
      let currencyEmoji;
      if (item.currency === "ginto") {
        currencyColor = 0xfbbf24;
        currencyEmoji = "💰";
      } else {
        currencyColor = 0x06b6d4;
        currencyEmoji = "💎";
      }
      
      const currencyBadge = this.add.graphics();
      currencyBadge.fillStyle(currencyColor, isOwned ? 0.4 : 0.9);
      currencyBadge.fillRoundedRect(cardWidth/2 - 25, -cardHeight/2 + 5, 20, 20, 10);
      
      const currencyIcon = this.add.text(cardWidth/2 - 15, -cardHeight/2 + 15, currencyEmoji, {
        fontSize: 12,
      }).setOrigin(0.5, 0.5);
      
      // Price section
      const actualPrice = this.getActualPrice(item);
      const hasDiscount = actualPrice < item.price;
      
      const priceArea = this.add.graphics();
      priceArea.fillStyle(0x1f2937, isOwned ? 0.5 : 0.8);
      priceArea.fillRoundedRect(-cardWidth/2 + 8, cardHeight/2 - 35, cardWidth - 16, 27, 6);
      
      const priceText = this.add.text(0, cardHeight/2 - 21, `${actualPrice}`, {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: isOwned ? "#9ca3af" : (hasDiscount ? "#2ed573" : "#77888C"),
        fontStyle: "bold"
      }).setOrigin(0.5, 0.5);
      
      // Add original price with strikethrough if discounted
      let originalPriceText = null;
      if (hasDiscount && !isOwned) {
        originalPriceText = this.add.text(-30, cardHeight/2 - 21, `${item.price}`, {
          fontFamily: "dungeon-mode",
          fontSize: 12,
          color: "#9ca3af",
        }).setOrigin(0.5, 0.5);
        originalPriceText.setStroke("#666666", 1);
      }
      
      // Owned overlay
      let ownedOverlay = null;
      let ownedText = null;
      let checkMark = null;
      if (isOwned) {
        ownedOverlay = this.add.graphics();
        ownedOverlay.fillStyle(0x000000, 0.6);
        ownedOverlay.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 12);
        
        ownedText = this.add.text(0, 0, "OWNED", {
          fontFamily: "dungeon-mode",
          fontSize: 18,
          color: "#10b981",
          fontStyle: "bold"
        }).setOrigin(0.5);
        
        checkMark = this.add.text(0, -25, "✓", {
          fontSize: 32,
          color: "#10b981",
        }).setOrigin(0.5);
      }
      
      // Assemble the button
      const components = [shadow, cardBg, innerHighlight, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText];
      if (originalPriceText) components.push(originalPriceText);
      if (ownedOverlay) {
        components.push(ownedOverlay);
        if (ownedText) components.push(ownedText);
        if (checkMark) components.push(checkMark);
      }
      button.add(components);
      
      // Enhanced interactivity for available items
      if (!isOwned) {
        button.setInteractive(
          new Phaser.Geom.Rectangle(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight),
          Phaser.Geom.Rectangle.Contains
        );
        
        // Store references for hover effects - create once, reuse
        let hoverGlow: Phaser.GameObjects.Graphics | null = null;
        let isHovering = false;
        let hoverTween: Phaser.Tweens.Tween | null = null;
        let scaleTween: Phaser.Tweens.Tween | null = null;
        
        button.on("pointerdown", () => {
          // 40% chance to trigger merchant dialogue when clicking on a relic
          if (Math.random() < 0.4) {
            this.showRandomRelicDialogue(item);
          }
          this.showItemDetails(item);
        });
        
        button.on("pointerover", () => {
          if (isHovering) return; // Prevent multiple hover events
          isHovering = true;
          
          // Stop any existing tweens
          if (hoverTween) hoverTween.stop();
          if (scaleTween) scaleTween.stop();
          
          // Optimized hover effect - single tween for all components
          const componentsToTween = [cardBg, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText];
          hoverTween = this.tweens.add({
            targets: componentsToTween,
            alpha: 0.7, // Less dramatic change for better performance
            duration: 100, // Faster transition
            ease: 'Power1.easeOut'
          });
          
          // Subtle scale effect
          scaleTween = this.tweens.add({
            targets: button,
            scale: 1.02,
            duration: 100,
            ease: 'Power1.easeOut'
          });
          
          // Create glow effect only once
          if (!hoverGlow) {
            hoverGlow = this.add.graphics();
            hoverGlow.lineStyle(2, 0x77888C, 0.5); // Thinner line for better performance
            hoverGlow.strokeRoundedRect(-cardWidth/2 - 1, -cardHeight/2 - 1, cardWidth + 2, cardHeight + 2, 12);
            button.addAt(hoverGlow, 1); // Add after shadow but before card
          }
          hoverGlow.setAlpha(1);
          
          // Show tooltip with throttling
          this.time.delayedCall(50, () => {
            if (isHovering) {
              this.showItemTooltip(item.item.name, button.x, button.y - cardHeight/2 - 40);
            }
          });
        });
        
        button.on("pointerout", () => {
          if (!isHovering) return; // Prevent multiple out events
          isHovering = false;
          
          // Stop any existing tweens
          if (hoverTween) hoverTween.stop();
          if (scaleTween) scaleTween.stop();
          
          // Restore opacity
          const componentsToTween = [cardBg, iconArea, emoji, currencyBadge, currencyIcon, priceArea, priceText];
          hoverTween = this.tweens.add({
            targets: componentsToTween,
            alpha: 1,
            duration: 100,
            ease: 'Power1.easeOut'
          });
          
          // Return to normal scale
          scaleTween = this.tweens.add({
            targets: button,
            scale: 1,
            duration: 100,
            ease: 'Power1.easeOut'
          });
          
          // Hide glow effect instead of destroying
          if (hoverGlow) {
            hoverGlow.setAlpha(0);
          }
          
          // Hide tooltip immediately
          this.hideItemTooltip();
        });
      }
      
      // Add button to scroll container with proper depth order
      button.setDepth(1050); // Items should be below titles (titles are at 1100+)
      scrollContainer.add(button);
      this.relicButtons.push(button);
    });
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
    
    // Item emoji with enhanced styling and proper container
    const emojiContainer = this.add.graphics();
    emojiContainer.fillStyle(0x150E10, 0.8); // Match shop background
    emojiContainer.fillRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    emojiContainer.lineStyle(2, 0x77888C, 0.8); // Shop border color
    emojiContainer.strokeRoundedRect(-panelWidth/2 + 30, -panelHeight/2 + 30, 60, 60, 10);
    
    const emoji = this.add.text(-panelWidth/2 + 60, -panelHeight/2 + 60, item.emoji, {
      fontSize: 40,
    }).setOrigin(0.5, 0.5);
    emoji.setShadow(2, 2, '#1a1625', 4, false, true);
    
    // Item name with proper alignment and shop theme colors
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, item.name.toUpperCase(), {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#77888C", // Match shop accent color
      fontStyle: "bold"
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
    panel.add([panelShadow, panelBg, innerHighlight, headerBg, emojiContainer, emoji, name, 
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
    // Return lore based on item name
    switch(item.item.id) {
      case "earthwardens_plate":
        return "Forged by the ancient Earthwardens who protected the first settlements from natural disasters. This mystical armor channels the strength of the mountains themselves, providing unwavering protection to those who wear it.";
      case "swift_wind_agimat":
        return "An enchanted talisman blessed by the spirits of the wind. It enhances the agility of its bearer, allowing them to move with the swiftness of the breeze and react faster than the eye can see.";
      case "ember_fetish":
        return "A relic imbued with the essence of volcanic fire. When the bearer's defenses are low, the fetish awakens and grants the fury of the forge, empowering them with the strength of molten rock.";
      case "babaylans_talisman":
        return "A sacred artifact of the Babaylan, the mystical shamans of old. This talisman connects the wearer to ancestral wisdom, allowing them to see the hidden patterns in all things.";
      case "ancestral_blade":
        return "A weapon passed down through generations of warrior families. When wielded with skill, it channels the spirits of ancestors who guide each strike with supernatural precision.";
      case "tidal_amulet":
        return "Born from the heart of the ocean, this amulet pulses with the rhythm of the tides. It grants the wearer the restorative power of the sea, healing their wounds with each passing moment.";
      case "bargain_talisman":
        return "A mysterious artifact that embodies the concept of fortune. Once per act, it can manifest incredible luck, allowing its bearer to acquire powerful items without cost.";
      case "lucky_charm":
        return "A small token blessed by fate itself. Those who carry it seem to attract good fortune, finding coins and opportunities where others see only obstacles.";
      case "echo_ancestors":
        return "A divine relic that channels the power of the ancestral spirits. It allows the bearer to achieve the impossible - forming a Five of a Kind, the rarest of all poker hands.";
      case "diwatas_crown":
        return "A magnificent crown worn by the Diwata, the celestial beings who watch over the mortal realm. It grants divine protection and enhances the natural abilities of its wearer.";
      case "stone_golem_heart":
        return "The crystallized heart of an ancient stone golem. It grants the endurance of the mountains themselves, increasing the life force of those who possess it.";
      default:
        return "This mystical artifact holds ancient power. Its origins are shrouded in mystery, but its effects are undeniable.";
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
    
    if (item.currency === "diamante" && this.player.diamante < actualPrice) {
      this.showMessage("Not enough Diamante!", "#ff4757");
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
    
    // Price
    let priceColor;
    let priceEmoji;
    if (item.currency === "ginto") {
      priceColor = "#ffd93d";
      priceEmoji = "💰";
    } else if (item.currency === "diamante") {
      priceColor = "#00ffff";
      priceEmoji = "💎";
    } else {
      priceColor = "#4ecdc4";
      priceEmoji = "💎";
    }
    
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
    
    // Deduct currency
    if (item.currency === "ginto") {
      this.player.ginto -= actualPrice;
    } else if (item.currency === "diamante") {
      this.player.diamante -= actualPrice;
    }
    
    // Add relic to player
    if (item.type === "relic") {
      this.player.relics.push(item.item as Relic);
      
      // Apply any immediate relic acquisition effects
      RelicManager.applyRelicAcquisitionEffect(item.item.id, this.player);
    }
    
    // Update UI with new currency format
    this.healthText.setText(`Health: ${this.player.currentHealth}/${this.player.maxHealth} ♥`);
    this.gintoText.setText(`${this.player.ginto}`);
    this.diamanteText.setText(`${this.player.diamante}`);
    
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
          scale: 1.2,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            // Dim the button and remove interactivity
            const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics;
            if (slotBg) {
              slotBg.clear();
              slotBg.fillGradientStyle(0x1a1d26, 0x1a1d26, 0x0a0d16, 0x0a0d16, 0.7);
              slotBg.lineStyle(2, 0x3a3d3f, 1);
              slotBg.fillRoundedRect(-45, -45, 90, 90, 8);
              slotBg.strokeRoundedRect(-45, -45, 90, 90, 8);
            }
            button.disableInteractive();
            button.setActive(false);
            
            // Add a visual indicator that the item is owned with better styling
            const ownedIndicator = this.add.text(0, 0, "✓ OWNED", {
              fontFamily: "dungeon-mode-inverted",
              fontSize: 14,
              color: "#2ed573",
              fontStyle: "bold"
            }).setOrigin(0.5);
            ownedIndicator.setShadow(1, 1, '#000000', 2, false, true);
            button.add(ownedIndicator);
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

    // Auto-hide after 4 seconds
    this.time.delayedCall(4000, () => {
      this.closeDialogueSmooth();
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
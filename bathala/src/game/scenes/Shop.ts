import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { Player, Relic } from "../../core/types/CombatTypes";
import { allShopItems, ShopItem, getChapterShopItems } from "../../data/relics/ShopItems";
import { getRelicById } from "../../data/relics";
import { MusicLifecycleSystem } from "../../systems/audio/MusicLifecycleSystem";
import { getRelicSpriteKey } from "../../utils/RelicSpriteUtils";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

/**
 * Shop scene for purchasing relics and items
 */

export class Shop extends Scene {
  private player!: Player;
  private shopItems: ShopItem[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private gintoText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;
  private musicLifecycle!: MusicLifecycleSystem;
  private scrollContainer: Phaser.GameObjects.Container | null = null;
  private currentTooltip: Phaser.GameObjects.Container | null = null;
  private merchantCharacter!: Phaser.GameObjects.Container;
  private typewriterTimer: Phaser.Time.TimerEvent | null = null;
  private autoDialogueTimer: Phaser.Time.TimerEvent | null = null;
  private inputLockCount: number = 0;

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

  private lockInput(): void {
    this.inputLockCount++;
  }

  private unlockInput(): void {
    this.inputLockCount = Math.max(0, this.inputLockCount - 1);
  }

  private isInputLocked(): boolean {
    return this.inputLockCount > 0;
  }

  constructor() {
    super({ key: "Shop" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    
    // Get current chapter to determine which shop items to show
    const gameState = GameState.getInstance();
    const currentChapter = gameState.getCurrentChapter();
    const chapterShopItems = getChapterShopItems(currentChapter);
    
    // Filter out relics the player already has and exclude merchants_scale (moved to treasure)
    this.shopItems = chapterShopItems.filter(
      item => item.item.id !== 'merchants_scale' && !this.player.relics.some(relic => relic.id === item.item.id)
    );

    // Reset relic buttons so stale destroyed containers from previous chapters don't persist
    this.relicButtons = [];
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
      console.log(`♦ DDA Shop Pricing [${item.name}]: ${basePrice} → ${ddaAdjustedPrice} (DDA ${adjustment.tier}) → ${finalPrice} (relics)`);
    }
    
    return finalPrice;
  }

  create(): void {
    if (!this.cameras.main) return;
    this.cameras.main.setBackgroundColor(0x150E10); // Match combat background

    // Start shop music via MusicLifecycleSystem
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();

    // Build atmospheric background first (forest/vignette/particles)
    this.createAtmosphericBackground();

    // P3R-style diagonal slash entrance transition
    this.playEntranceTransition();

    // Create mysterious merchant character on the left
    this.createMerchantCharacter();

    // ── Cinematic title — no boxy panel, plain text on atmospheric background ──
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const titleY = Math.max(55, screenHeight * 0.07);

    const title = this.add.text(
      screenWidth / 2,
      titleY,
      "MYSTERIOUS MERCHANT",
      {
        fontFamily: "dungeon-mode",
        fontSize: 38,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(5);

    // Accent line beneath title
    const accentLineY = titleY + 32;
    const lineGfx = this.add.graphics().setDepth(5);
    lineGfx.lineStyle(3, 0x9b59b6, 0.8);
    lineGfx.beginPath();
    lineGfx.moveTo(screenWidth / 2 - 100, accentLineY);
    lineGfx.lineTo(screenWidth / 2 + 100, accentLineY);
    lineGfx.strokePath();

    // Subtitle
    this.add.text(
      screenWidth / 2,
      accentLineY + 18,
      "RARE RELICS & MYSTICAL ARTIFACTS",
      {
        fontFamily: "dungeon-mode",
        fontSize: 13,
        color: "#9b59b6",
        align: "center",
        letterSpacing: 4,
      }
    ).setOrigin(0.5).setAlpha(0.75).setDepth(5);

    // Create currency display
    this.createCurrencyDisplay();

    // Create inventory-style UI with categories
    this.createCategorizedInventoryUI();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

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
    this.events.off('shutdown', this.cleanup, this);
  }

  // ─────────────────────────────────────────────
  //  ATMOSPHERIC BACKGROUND  (Campfire-style)
  // ─────────────────────────────────────────────

  private createAtmosphericBackground(): void {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    const bgLayer = this.add.container(0, 0).setDepth(0);

    // Forest backdrop
    if (this.textures.exists('forest_bg')) {
      const forestBg = this.add.image(W / 2, H / 2, 'forest_bg');
      const scaleX = W / forestBg.width;
      const scaleY = H / forestBg.height;
      forestBg.setScale(Math.max(scaleX, scaleY)).setAlpha(0.45);
      bgLayer.add(forestBg);
    }

    // Semi-transparent dark base overlay
    const base = this.add.rectangle(W / 2, H / 2, W, H, 0x0d0a12, 0.6);
    bgLayer.add(base);

    // Circular vignette via canvas radial gradient
    const vigKey = 'shop_vignette';
    if (this.textures.exists(vigKey)) { this.textures.remove(vigKey); }
    const vigCanvas = this.textures.createCanvas(vigKey, W, H) as Phaser.Textures.CanvasTexture;
    const vigCtx = vigCanvas.getContext();
    const cx = W / 2, cy = H / 2;
    const innerR = Math.min(W, H) * 0.3;
    const outerR = Math.sqrt(W * W + H * H) / 2;
    const radGrad = vigCtx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
    radGrad.addColorStop(0,   'rgba(0,0,0,0)');
    radGrad.addColorStop(0.5, 'rgba(0,0,0,0.35)');
    radGrad.addColorStop(1,   'rgba(0,0,0,0.88)');
    vigCtx.fillStyle = radGrad;
    vigCtx.fillRect(0, 0, W, H);
    vigCanvas.refresh();
    const vignette = this.add.image(W / 2, H / 2, vigKey);
    bgLayer.add(vignette);

    // Warm purple-tinted wash
    const wash = this.add.rectangle(W / 2, H / 2, W, H, 0x1a0f2e, 0.3);
    bgLayer.add(wash);

    // Night-time overlay
    if (!OverworldGameState.getInstance().isDay) {
      const nightOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000033, 0.25);
      bgLayer.add(nightOverlay);
    }

    // Scanline texture overlay
    const scanGfx = this.make.graphics({});
    scanGfx.fillStyle(0x000000, 1);
    scanGfx.fillRect(0, 0, 4, 2);
    scanGfx.fillStyle(0xffffff, 1);
    scanGfx.fillRect(0, 2, 4, 2);
    scanGfx.generateTexture('shop_scanline', 4, 4);
    scanGfx.destroy();

    if (this.textures.exists('shop_scanline')) {
      const scanlines = this.add.tileSprite(0, 0, W, H, 'shop_scanline')
        .setOrigin(0).setAlpha(0.04).setTint(0x3a2a40);
      bgLayer.add(scanlines);
    }

    // Floating purple/gold particles
    this.createShopFloatingParticles(bgLayer, W, H);
  }

  private createShopFloatingParticles(bgLayer: Phaser.GameObjects.Container, W: number, H: number): void {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const radius = Phaser.Math.FloatBetween(1.5, 4);
      const alpha  = Phaser.Math.FloatBetween(0.08, 0.3);
      const color  = Phaser.Math.RND.pick([0x9b59b6, 0xc5a56a, 0x8a6fdf, 0xd4a747]);

      const dot = this.add.circle(x, y, radius, color, alpha).setDepth(1);
      bgLayer.add(dot);

      const duration = Phaser.Math.Between(4000, 8000);
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(80, 200),
        alpha: 0,
        duration,
        ease: 'Sine.easeInOut',
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          dot.setPosition(Phaser.Math.Between(0, W), H + 20);
          dot.setAlpha(alpha);
        }
      });
    }
  }

  // ─────────────────────────────────────────────
  //  ENTRANCE TRANSITION  (P3R diagonal slash)
  // ─────────────────────────────────────────────

  private playEntranceTransition(): void {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Full-screen cover
    const cover = this.add.rectangle(W / 2, H / 2, W, H, 0x050305)
      .setOrigin(0.5).setAlpha(1).setDepth(9999);

    // Diagonal slash wipes (P3R-style geometric cuts)
    const slashCount = 6;
    const slashes: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < slashCount; i++) {
      const slashH = (H / slashCount) + 10;
      const y = slashH * i + slashH / 2;
      const fromLeft = i % 2 === 0;
      const slash = this.add.rectangle(
        fromLeft ? -W : W * 2,
        y,
        W + 200,
        slashH,
        Phaser.Math.RND.pick([0x0c0507, 0x0f0810, 0x080510])
      ).setOrigin(0.5).setAlpha(0.95).setDepth(9998);

      slash.setRotation(fromLeft ? -0.02 : 0.02);
      slashes.push(slash);

      this.tweens.add({
        targets: slash,
        x: W / 2,
        duration: 350,
        ease: 'Power3',
        delay: i * 60,
      });
    }

    // After slashes cover, fade them out with the main cover
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: cover,
        alpha: 0,
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => cover.destroy()
      });

      slashes.forEach((slash, i) => {
        this.tweens.add({
          targets: slash,
          alpha: 0,
          x: (i % 2 === 0) ? W * 2 : -W,
          duration: 400,
          ease: 'Power2',
          delay: i * 40,
          onComplete: () => slash.destroy()
        });
      });
    });
  }

  private createMerchantCharacter(): void {
    const screenHeight = this.cameras.main.height;

    // Position merchant on the left side
    const merchantX = 150;
    const merchantY = screenHeight * 0.52;

    // Atmospheric glow behind portrait (no frame boxes)
    const outerGlow = this.add.circle(merchantX, merchantY, 110, 0x9b59b6, 0.06).setDepth(49);
    this.tweens.add({
      targets: outerGlow,
      scaleX: 1.1, scaleY: 1.1,
      alpha: 0.03,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    this.add.circle(merchantX, merchantY, 70, 0xc5a56a, 0.07).setDepth(49);

    // Create container for merchant
    this.merchantCharacter = this.add.container(merchantX, merchantY);
    this.merchantCharacter.setDepth(500);

    const portraitSize = 160;

    // Single subtle backing — very thin gold border only
    const portraitBg = this.add.rectangle(0, 0, portraitSize + 10, portraitSize + 10, 0x0d0a12, 0.6)
      .setStrokeStyle(1, 0xc5a56a, 0.4);

    const merchantSprite = this.add.sprite(0, 0, 'merchant_faceset');
    merchantSprite.setDisplaySize(portraitSize, portraitSize);

    // "MERCHANT" label below
    const merchantLabel = this.add.text(0, portraitSize / 2 + 18, 'MERCHANT', {
      fontFamily: 'dungeon-mode',
      fontSize: 11,
      color: '#c5a56a',
      letterSpacing: 3,
    }).setOrigin(0.5).setAlpha(0.7);

    // Create dialogue system
    this.createMerchantDialogueSystem();

    this.merchantCharacter.add([portraitBg, merchantSprite, merchantLabel]);

    // Make interactive for dialogue
    this.merchantCharacter.setSize(portraitSize + 10, portraitSize + 10);
    this.merchantCharacter.setInteractive()
      .on('pointerdown', () => {
        if (this.isInputLocked()) return;
        this.showMerchantDialogue();
      })
      .on('pointerover', () => {
        merchantSprite.setTint(0xdddddd);
        this.input.setDefaultCursor('pointer');
      })
      .on('pointerout', () => {
        merchantSprite.clearTint();
        this.input.setDefaultCursor('default');
      });

    // Floating animation
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
    // Safety check: don't run if scene is shutting down or input is locked by another modal
    if (!this.sys || !this.sys.isActive()) {
      return;
    }
    if (this.isInputLocked()) {
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
    const boxHeight = 110;

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

    // Character name plate - made wider to fit "MYSTERIOUS MERCHANT"
    const namePlateWidth = 220; // Increased from 160 to 220
    const namePlate = this.add.graphics();
    namePlate.fillStyle(0x77888C, 0.9);
    namePlate.fillRoundedRect(-boxWidth/2 + 20, -boxHeight/2 - 15, namePlateWidth, 30, 8);
    namePlate.lineStyle(2, 0x9BA3A7, 0.8);
    namePlate.strokeRoundedRect(-boxWidth/2 + 20, -boxHeight/2 - 15, namePlateWidth, 30, 8);

    // Character name - centered within the wider plate
    const characterName = this.add.text(-boxWidth/2 + 20 + namePlateWidth/2, -boxHeight/2, 'MYSTERIOUS MERCHANT', {
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
      wordWrap: { width: boxWidth - 60 }
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
    if (this.typewriterTimer !== null) {
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
          if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
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
            if (this.typewriterTimer) {
              this.typewriterTimer.destroy();
              this.typewriterTimer = null;
            }
          }
        } else {
          if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
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

    // Click to close (after typing is done) - make the entire dialogue container clickable
    this.dialogueContainer.setSize(boxWidth, boxHeight);
    this.dialogueContainer.setInteractive()
      .on('pointerdown', () => {
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
        } else {
          // Skip typewriter effect and show full dialogue
          if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
            this.typewriterTimer = null;
          }
          currentChar = dialogue.length;
          dialogueText.text = dialogue;
          
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

    // Stats display top-right — minimal, no boxy panel, just text on atmospheric bg
    const panelWidth = 200;
    const panelHeight = 64;
    const panelX = screenWidth - panelWidth / 2 - 16;
    const panelY = Math.max(44, 44);

    // Single thin-border panel matching the atmospheric style
    const statsBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x0a0710, 0.82)
      .setStrokeStyle(1, 0x4a3a5e, 0.7)
      .setOrigin(0.5)
      .setDepth(2000);

    const topRightX = screenWidth - 20;
    const healthY = panelY - 11;
    const goldY = panelY + 11;

    const healthIcon = this.add.text(topRightX - 25, healthY, "♥", {
      fontSize: 18,
      color: "#ff6b6b",
    }).setOrigin(1, 0.5).setDepth(2001);

    this.healthText = this.add.text(
      topRightX - 32,
      healthY,
      `${this.player.currentHealth}/${this.player.maxHealth}`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 15,
        color: "#e8eced",
      }
    ).setOrigin(1, 0.5).setDepth(2001);

    const gintoIcon = this.add.text(topRightX - 25, goldY, "♦", {
      fontSize: 16,
      color: "#fbbf24",
    }).setOrigin(1, 0.5).setDepth(2001);

    this.gintoText = this.add.text(topRightX - 32, goldY, `${this.player.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: 15,
      color: "#fbbf24",
    }).setOrigin(1, 0.5).setDepth(2001);
    
    // Add subtle pulse animation to currency
    const currencyElements = [this.gintoText, gintoIcon, healthIcon];
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
    
    // Create container for shop cards (can scroll if content exceeds viewport)
    const shopContainer = this.add.container(0, 0);
    shopContainer.setDepth(1000);
    
    // All items now use gold currency
    const allItems = this.shopItems;
    
    // Position cards with top margin below title/merchant area
    const sectionY = 300;
    const layout = this.createDiscoverStyleSection(allItems, screenWidth, sectionY, shopContainer);
    this.setupScrolling(shopContainer, screenHeight, layout.contentBottom);
    
    // Store container reference for tooltips and interactions
    this.scrollContainer = shopContainer;
  }

  private setupScrolling(
    container: Phaser.GameObjects.Container,
    screenHeight: number,
    contentBottom: number
  ): void {
    // Keep title/stats area visible while allowing card rows to scroll.
    const viewportTop = 120;
    const viewportBottom = screenHeight - 40;
    const maxScroll = Math.max(0, contentBottom - viewportBottom);
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
      if (this.isInputLocked()) return;
      if (deltaY > 0) {
        targetScrollY = Math.min(targetScrollY + scrollSpeed, maxScroll);
      } else {
        targetScrollY = Math.max(targetScrollY - scrollSpeed, 0);
      }
    });
    
    // Keyboard scrolling (arrow keys)
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.isInputLocked()) return;
      targetScrollY = Math.max(targetScrollY - scrollSpeed, 0);
    });
    
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.isInputLocked()) return;
      targetScrollY = Math.min(targetScrollY + scrollSpeed, maxScroll);
    });
    
    // Optional: Touch/drag scrolling for mobile-like experience
    let isDragging = false;
    let dragStartY = 0;
    let dragStartScrollY = 0;
    
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isInputLocked()) return;
      // Only start drag scroll in the card viewport area.
      if (pointer.y < viewportTop || pointer.y > viewportBottom) return;
      isDragging = true;
      dragStartY = pointer.y;
      dragStartScrollY = targetScrollY;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        if (this.isInputLocked()) return;
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
  private createDiscoverStyleSection(
    items: ShopItem[],
    screenWidth: number,
    startY: number,
    scrollContainer: Phaser.GameObjects.Container
  ): { contentBottom: number } {
    // Responsive grid so cards never overlap and any number of items can fit via rows + scrolling.
    const leftMargin = 300; // Keep clear of merchant area (matches panel strip width)
    const rightMargin = 70;
    const availableWidth = Math.max(220, screenWidth - leftMargin - rightMargin);

    const cardWidth = 200;
    const cardHeight = 260;
    const horizontalSpacing = 36; // extra spacing avoids border/glow overlap
    const verticalSpacing = 42;

    const cardsPerRow = Math.max(
      1,
      Math.min(items.length || 1, Math.floor((availableWidth + horizontalSpacing) / (cardWidth + horizontalSpacing)))
    );

    const gridWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * horizontalSpacing;
    const gridStartX = leftMargin + (availableWidth - gridWidth) / 2 + cardWidth / 2;
    const gridStartY = startY;

    items.forEach((item, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = gridStartX + col * (cardWidth + horizontalSpacing);
      const y = gridStartY + row * (cardHeight + verticalSpacing);

      const card = this.createDiscoverStyleCard(item, x, y, cardWidth, cardHeight);
      scrollContainer.add(card);
      this.relicButtons.push(card);
    });

    const totalRows = Math.max(1, Math.ceil(items.length / cardsPerRow));
    const contentBottom = gridStartY + (totalRows - 1) * (cardHeight + verticalSpacing) + cardHeight / 2 + 24;
    return { contentBottom };
  }

  /**
   * Clean atmospheric card for a shop item — no boxy frames, floating item feel
   */
  private createDiscoverStyleCard(item: ShopItem, x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;

    // Single subtle card background — dark purple tint, thin border
    const cardBg = this.add.rectangle(0, 0, width, height, 0x0a0710, 0.88)
      .setStrokeStyle(1, isOwned ? 0x333344 : 0x4a3a5e, isOwned ? 0.4 : 0.7)
      .setOrigin(0.5);

    // Get sprite and display it large, centered slightly above middle
    const spriteKey = getRelicSpriteKey(item.item.id);
    const spriteY = -30;
    const maxSpriteSize = 140;

    let itemVisual: Phaser.GameObjects.GameObject;
    if (this.textures.exists(spriteKey)) {
      const sprite = this.add.image(0, spriteY, spriteKey).setOrigin(0.5);
      const tex = this.textures.get(spriteKey);
      const frame = tex.get();
      const aspect = frame.width / frame.height;
      const displayW = aspect >= 1 ? maxSpriteSize : maxSpriteSize * aspect;
      const displayH = aspect >= 1 ? maxSpriteSize / aspect : maxSpriteSize;
      sprite.setDisplaySize(displayW, displayH);
      if (isOwned) sprite.setAlpha(0.5);
      itemVisual = sprite;
    } else {
      const sym = this.add.text(0, spriteY, item.emoji, { fontSize: 72 }).setOrigin(0.5);
      if (isOwned) sym.setAlpha(0.5);
      itemVisual = sym;
    }

    // Item name — gold, no badge rectangle
    const nameText = this.add.text(0, height / 2 - 58, item.name, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: isOwned ? "#556070" : "#c5a56a",
      fontStyle: "bold",
      wordWrap: { width: width - 20 },
      align: "center",
    }).setOrigin(0.5);

    // Thin separator line
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x4a3a5e, 0.5);
    sep.beginPath();
    sep.moveTo(-40, height / 2 - 40);
    sep.lineTo(40, height / 2 - 40);
    sep.strokePath();

    // Price display
    const components: Phaser.GameObjects.GameObject[] = [cardBg, itemVisual, nameText, sep];

    if (hasDiscount && !isOwned) {
      const oldPrice = this.add.text(0, height / 2 - 26, `${item.price}`, {
        fontFamily: "dungeon-mode",
        fontSize: 12,
        color: "#556070",
      }).setOrigin(0.5);
      oldPrice.setStroke("#333", 1);

      const newPrice = this.add.text(0, height / 2 - 10, `${actualPrice} ♦  SALE`, {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#2ed573",
      }).setOrigin(0.5);
      components.push(oldPrice, newPrice);
    } else {
      const priceLabel = this.add.text(0, height / 2 - 26, "PRICE", {
        fontFamily: "dungeon-mode",
        fontSize: 10,
        color: "#556070",
      }).setOrigin(0.5);

      const priceValue = this.add.text(0, height / 2 - 10, `${actualPrice} ♦`, {
        fontFamily: "dungeon-mode",
        fontSize: 15,
        color: isOwned ? "#444455" : "#fbbf24",
      }).setOrigin(0.5);
      components.push(priceLabel, priceValue);
    }

    // Owned overlay
    if (isOwned) {
      const ownedOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0.5);
      const checkMark = this.add.text(0, -18, "✓", { fontSize: 32, color: "#10b981" }).setOrigin(0.5);
      const ownedText = this.add.text(0, 14, "OWNED", {
        fontFamily: "dungeon-mode", fontSize: 16, color: "#10b981", fontStyle: "bold"
      }).setOrigin(0.5);
      components.push(ownedOverlay, checkMark, ownedText);
    }

    container.add(components);
    (container as any).originalY = y;

    if (!isOwned) {
      const hitArea = this.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0.5);
      container.add(hitArea);

      container.setSize(width, height);
      container.setInteractive()
        .on('pointerdown', () => {
          if (this.isInputLocked()) return;
          if (Math.random() < 0.4) this.showRandomRelicDialogue(item);
          this.showItemDetails(item);
        })
        .on('pointerover', () => {
          if (this.isInputLocked()) return;
          this.input.setDefaultCursor('pointer');
          this.tweens.killTweensOf(container);
          const originalY = (container as any).originalY;
          // Highlight border
          cardBg.setStrokeStyle(1, 0x9b59b6, 1);
          cardBg.setFillStyle(0x150f22, 0.95);
          this.tweens.add({ targets: container, y: originalY - 5, duration: 180, ease: 'Power2' });
        })
        .on('pointerout', () => {
          if (this.isInputLocked()) return;
          this.input.setDefaultCursor('default');
          this.tweens.killTweensOf(container);
          const originalY = (container as any).originalY;
          cardBg.setStrokeStyle(1, 0x4a3a5e, 0.7);
          cardBg.setFillStyle(0x0a0710, 0.88);
          this.tweens.add({ targets: container, y: originalY, duration: 180, ease: 'Power2' });
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
    const buttonWidth = 200;
    const buttonHeight = 52;

    const backButton = this.add.container(40 + buttonWidth / 2, screenHeight - 44);
    backButton.setDepth(2000);

    const bg = this.add.graphics();
    bg.fillStyle(0x0d0a12, 0.88);
    bg.lineStyle(2, 0x77888C, 0.6);
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
    bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);

    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#a0aab0",
    }).setOrigin(0.5, 0.5);

    backButton.add([bg, text]);
    backButton.setSize(buttonWidth, buttonHeight);
    backButton.setInteractive();

    backButton.on("pointerover", () => {
      if (this.isInputLocked()) return;
      this.input.setDefaultCursor('pointer');
      bg.clear();
      bg.fillStyle(0x0d0a12, 0.95);
      bg.lineStyle(2, 0xc5a56a, 0.9);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      text.setColor("#c5a56a");
    });

    backButton.on("pointerout", () => {
      if (this.isInputLocked()) return;
      this.input.setDefaultCursor('default');
      bg.clear();
      bg.fillStyle(0x0d0a12, 0.88);
      bg.lineStyle(2, 0x77888C, 0.6);
      bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);
      text.setColor("#a0aab0");
    });

    backButton.on("pointerdown", () => {
      if (this.isInputLocked()) return;
      this.hideItemTooltip();

      const gameState = GameState.getInstance();
      gameState.updatePlayerData(this.player);
      gameState.completeCurrentNode(true);

      // Return to DevHub if it launched us
      if (this.scene.isActive('DevHubScene')) {
        this.scene.stop();
        const hub = this.scene.get('DevHubScene') as any;
        if (hub?.show) hub.show();
        return;
      }

      this.playExitTransition(() => {
        const overworldScene = this.scene.get("Overworld");
        if (overworldScene) {
          (overworldScene as any).resume();
        }
        this.scene.stop();
        this.scene.resume("Overworld");
      });
    });
  }

  private showItemDetails(item: ShopItem): void {
    // Clean up any tooltips first
    this.hideItemTooltip();
    this.lockInput();
    
    const screenW = this.cameras.main.width;
    const screenH = this.cameras.main.height;
    const panelX = screenW / 2;
    const panelY = screenH / 2;

    const descriptionText = item.description || "A mysterious artifact of unknown purpose.";
    const loreText = this.getItemLore(item);
    const nameTextValue = item.name.toUpperCase();

    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;
    const priceEmoji = item.currency === "ginto" ? "♦" : "💎";

    // Measure wrapped text to size panel dynamically so it hugs content.
    const minContentWidth = 300;
    const maxContentWidth = 560;
    const measureWrappedText = (
      text: string,
      style: Phaser.Types.GameObjects.Text.TextStyle
    ): Phaser.Types.Math.Vector2Like => {
      const temp = this.add.text(-9999, -9999, text, style);
      const bounds = temp.getBounds();
      temp.destroy();
      return { x: Math.ceil(bounds.width), y: Math.ceil(bounds.height) };
    };

    const nameMeasure = measureWrappedText(nameTextValue, {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#e8eced",
      wordWrap: { width: maxContentWidth }
    });
    const descMeasure = measureWrappedText(descriptionText, {
      fontFamily: "dungeon-mode",
      fontSize: 15,
      color: "#e8eced",
      wordWrap: { width: maxContentWidth }
    });
    const loreMeasure = measureWrappedText(loreText, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e8eced",
      wordWrap: { width: maxContentWidth }
    });

    const contentWidth = Math.max(
      minContentWidth,
      Math.min(
        maxContentWidth,
        Math.max(descMeasure.x, loreMeasure.x, nameMeasure.x + 170)
      )
    );

    const panelWidth = contentWidth + 72;
    const headerH = 76;
    const priceH = hasDiscount ? 80 : 58;
    const sectionLabelH = 18;
    const bodyGap = 16;
    const buyButtonArea = 80;
    const panelHeight =
      28 +
      headerH +
      14 +
      priceH +
      bodyGap +
      sectionLabelH + descMeasure.y + 10 +
      bodyGap +
      sectionLabelH + loreMeasure.y + 16 +
      buyButtonArea;

    // Create overlay that blocks all interactions beneath it
    const overlay = this.add.rectangle(
      panelX,
      panelY,
      screenW,
      screenH,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(2000);
    
    // Make overlay interactive to block clicks on cards beneath
    overlay.setInteractive();

    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);
    
    // Function to close the panel
    const closePanel = () => {
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          this.unlockInput();
        }
      });
    };
    
    // Click overlay (outside panel) to close
    overlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Check if click is outside the panel bounds
      const panelBounds = {
        left: panelX - panelWidth / 2,
        right: panelX + panelWidth / 2,
        top: panelY - panelHeight / 2,
        bottom: panelY + panelHeight / 2
      };
      
      if (pointer.x < panelBounds.left || pointer.x > panelBounds.right ||
          pointer.y < panelBounds.top || pointer.y > panelBounds.bottom) {
        closePanel();
      }
    });

    // Main panel: match MainMenu/Tutorial style (dark bg + gray double border)
    const panelShadow = this.add.rectangle(4, 4, panelWidth, panelHeight, 0x000000, 0.45).setOrigin(0.5);
    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x150E10, 0.98).setOrigin(0.5);
    const outerBorder = this.add.rectangle(0, 0, panelWidth + 6, panelHeight + 6, undefined, 0).setOrigin(0.5);
    outerBorder.setStrokeStyle(3, 0x77888C, 0.9);
    const innerBorder = this.add.rectangle(0, 0, panelWidth + 2, panelHeight + 2, undefined, 0).setOrigin(0.5);
    innerBorder.setStrokeStyle(2, 0x556065, 0.75);

    const headerY = -panelHeight / 2 + 14;
    const headerBg = this.add.rectangle(0, headerY + headerH / 2, panelWidth - 22, headerH, 0x1b2327, 0.72).setOrigin(0.5);
    const headerBorder = this.add.rectangle(0, headerY + headerH / 2, panelWidth - 22, headerH, undefined, 0).setOrigin(0.5);
    headerBorder.setStrokeStyle(1, 0x77888C, 0.5);

    const iconX = -panelWidth / 2 + 40;
    const iconY = headerY + headerH / 2;
    const iconBg = this.add.rectangle(iconX, iconY, 48, 48, 0x150E10, 0.95).setOrigin(0.5);
    iconBg.setStrokeStyle(2, 0x77888C, 0.85);
    const iconInner = this.add.rectangle(iconX, iconY, 44, 44, undefined, 0).setOrigin(0.5);
    iconInner.setStrokeStyle(1, 0x556065, 0.75);

    // Get sprite key for this relic
    const spriteKey = getRelicSpriteKey(item.item.id);
    
    // Create item icon - use sprite if available, fallback to emoji
    let itemIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    
    if (spriteKey && this.textures.exists(spriteKey)) {
      // Use sprite if available
      itemIcon = this.add.image(iconX, iconY, spriteKey)
        .setOrigin(0.5)
        .setDisplaySize(34, 34);
    } else {
      // Fallback to emoji if sprite not found
      itemIcon = this.add.text(iconX, iconY, item.emoji, { fontSize: 24 }).setOrigin(0.5);
    }
    
    const name = this.add.text(iconX + 34, iconY - 5, nameTextValue, {
      fontFamily: "dungeon-mode",
        fontSize: 20,
      color: "#e8eced",
      wordWrap: { width: panelWidth - 180 }
    }).setOrigin(0, 0.5);
    const statusText = this.add.text(iconX + 34, iconY + 16, hasDiscount ? "DISCOUNTED ITEM" : "SHOP ITEM", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: hasDiscount ? "#2ed573" : "#77888C"
    }).setOrigin(0, 0.5);

    const closeBtn = this.add.container(panelWidth / 2 - 22, -panelHeight / 2 + 22);
    const closeBg = this.add.rectangle(0, 0, 24, 24, 0x150E10, 1).setOrigin(0.5);
    closeBg.setStrokeStyle(2, 0x77888C, 0.95);
    const closeText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e8eced"
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(24, 24);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", closePanel);
    closeBtn.on("pointerover", () => {
      this.input.setDefaultCursor('pointer');
      closeBg.setFillStyle(0x2a343a, 1);
      closeBtn.setScale(1.08);
    });
    closeBtn.on("pointerout", () => {
      this.input.setDefaultCursor('default');
      closeBg.setFillStyle(0x150E10, 1);
      closeBtn.setScale(1);
    });

    let currentY = -panelHeight / 2 + 14 + headerH + 14;
    const priceBg = this.add.rectangle(0, currentY + priceH / 2, panelWidth - 44, priceH, 0x1b2327, 0.6).setOrigin(0.5);
    priceBg.setStrokeStyle(1, 0x77888C, 0.45);

    const priceLabel = this.add.text(0, currentY + 12, hasDiscount ? "PRICE (DISCOUNTED)" : "PRICE", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: hasDiscount ? "#2ed573" : "#77888C",
      align: "center"
    }).setOrigin(0.5, 0.5);

    const priceMainText = hasDiscount
      ? `${actualPrice} ${priceEmoji}   (was ${item.price} ${priceEmoji})`
      : `${actualPrice} ${priceEmoji}`;
    const priceValue = this.add.text(0, currentY + (hasDiscount ? 44 : 36), priceMainText, {
      fontFamily: "dungeon-mode",
      fontSize: hasDiscount ? 17 : 20,
      color: hasDiscount ? "#2ed573" : "#e8eced",
      align: "center"
    }).setOrigin(0.5, 0.5);

    currentY += priceH + bodyGap;
    const sep1 = this.add.rectangle(0, currentY, panelWidth - 30, 1, 0x556065, 0.8).setOrigin(0.5);
    currentY += 10;

    const leftX = -panelWidth / 2 + 26;
    const descTitle = this.add.text(leftX, currentY, "DESCRIPTION", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C"
    }).setOrigin(0, 0);
    currentY += sectionLabelH;

    const description = this.add.text(0, currentY, descriptionText, {
      fontFamily: "dungeon-mode",
      fontSize: 15,
      color: "#d0dce4",
      align: "center",
      wordWrap: { width: contentWidth },
      lineSpacing: 4
    }).setOrigin(0.5, 0);
    currentY += description.getBounds().height + 12;

    const sep2 = this.add.rectangle(0, currentY, panelWidth - 30, 1, 0x556065, 0.8).setOrigin(0.5);
    currentY += 10;

    const loreTitle = this.add.text(leftX, currentY, "LORE", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C"
    }).setOrigin(0, 0);
    currentY += sectionLabelH;

    const loreBody = this.add.text(0, currentY, loreText, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#9eb1b8",
      align: "center",
      wordWrap: { width: contentWidth },
      lineSpacing: 4
    }).setOrigin(0.5, 0);

    const isOwned = this.player.relics.some(relic => relic.id === item.item.id);
    const isInventoryFull = this.player.relics.length >= 6;

    const buyBtn = this.add.container(0, panelHeight / 2 - 44);
    const buyBg = this.add.graphics();

    if (isOwned) {
      // Owned state - green tinted, non-interactive
      buyBg.fillStyle(0x0a1f0a, 0.9);
      buyBg.lineStyle(3, 0x10b981, 0.6);
      buyBg.fillRoundedRect(-120, -24, 240, 48, 10);
      buyBg.strokeRoundedRect(-120, -24, 240, 48, 10);

      const buyInnerGlow = this.add.graphics();
      buyInnerGlow.lineStyle(1, 0x10b981, 0.3);
      buyInnerGlow.strokeRoundedRect(-118, -22, 236, 44, 9);

      const buyText = this.add.text(0, 0, "✓ ALREADY OWNED", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#10b981"
      }).setOrigin(0.5, 0.5);

      buyBtn.add([buyBg, buyInnerGlow, buyText]);
    } else if (isInventoryFull) {
      // Inventory full state - orange tinted, non-interactive
      buyBg.fillStyle(0x1f150a, 0.9);
      buyBg.lineStyle(3, 0xff9f43, 0.6);
      buyBg.fillRoundedRect(-120, -24, 240, 48, 10);
      buyBg.strokeRoundedRect(-120, -24, 240, 48, 10);

      const buyInnerGlow = this.add.graphics();
      buyInnerGlow.lineStyle(1, 0xff9f43, 0.3);
      buyInnerGlow.strokeRoundedRect(-118, -22, 236, 44, 9);

      const buyText = this.add.text(0, 0, "INVENTORY FULL", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#ff9f43"
      }).setOrigin(0.5, 0.5);

      buyBtn.add([buyBg, buyInnerGlow, buyText]);
      buyBtn.setSize(240, 48);
      buyBtn.setInteractive({ useHandCursor: true });
      buyBtn.on("pointerdown", () => {
        // Close panel and open discard dialog
        this.tweens.add({
          targets: panel,
          scale: 0.8,
          alpha: 0,
          duration: 200,
          ease: 'Back.easeIn',
          onComplete: () => {
            overlay.destroy();
            panel.destroy();
            this.unlockInput();
            this.buyItem(item);
          }
        });
      });
      buyBtn.on("pointerover", () => {
        this.input.setDefaultCursor('pointer');
        buyBtn.setScale(1.05);
      });
      buyBtn.on("pointerout", () => {
        this.input.setDefaultCursor('default');
        buyBtn.setScale(1);
      });
    } else {
      // Normal purchasable state
      buyBg.fillStyle(0x150E10, 0.9);
      buyBg.lineStyle(3, 0x77888C, 0.8);
      buyBg.fillRoundedRect(-120, -24, 240, 48, 10);
      buyBg.strokeRoundedRect(-120, -24, 240, 48, 10);

      const buyInnerGlow = this.add.graphics();
      buyInnerGlow.lineStyle(1, 0x556065, 0.7);
      buyInnerGlow.strokeRoundedRect(-118, -22, 236, 44, 9);

      const buyText = this.add.text(0, 0, "PURCHASE ITEM", {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C"
      }).setOrigin(0.5, 0.5);

      buyBtn.add([buyBg, buyInnerGlow, buyText]);
      buyBtn.setSize(240, 48);
      buyBtn.setInteractive({ useHandCursor: true });
      buyBtn.on("pointerdown", () => {
        // Clean up panel with animation and then proceed with purchase
        this.tweens.add({
          targets: panel,
          scale: 0.8,
          alpha: 0,
          duration: 200,
          ease: 'Back.easeIn',
          onComplete: () => {
            overlay.destroy();
            panel.destroy();
            this.unlockInput();
            // Proceed with purchase (which may open another locked modal)
            this.buyItem(item);
          }
        });
      });
      buyBtn.on("pointerover", () => {
        this.input.setDefaultCursor('pointer');
        buyBtn.setScale(1.05);
        buyBg.clear();
        buyBg.fillStyle(0x150E10, 1);
        buyBg.lineStyle(3, 0x77888C, 1);
        buyBg.fillRoundedRect(-120, -24, 240, 48, 10);
        buyBg.strokeRoundedRect(-120, -24, 240, 48, 10);
        buyText.setColor("#ffffff");
      });
      buyBtn.on("pointerout", () => {
        this.input.setDefaultCursor('default');
        buyBtn.setScale(1);
        buyBg.clear();
        buyBg.fillStyle(0x150E10, 0.9);
        buyBg.lineStyle(3, 0x77888C, 0.8);
        buyBg.fillRoundedRect(-120, -24, 240, 48, 10);
        buyBg.strokeRoundedRect(-120, -24, 240, 48, 10);
        buyText.setColor("#77888C");
      });
    }
    
    panel.add([
      panelShadow,
      outerBorder,
      innerBorder,
      panelBg,
      headerBg,
      headerBorder,
      iconBg,
      iconInner,
      itemIcon,
      name,
      statusText,
      closeBtn,
      priceBg,
      priceLabel,
      priceValue,
      sep1,
      descTitle,
      description,
      sep2,
      loreTitle,
      loreBody,
      buyBtn
    ]);
              
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
    
    // Check if player has 6 relics - show alert and offer discard
    if (this.player.relics.length >= 6) {
      this.showMessage("Inventory full! Discard a relic to make room.", "#ff9f43");
      this.showRelicDiscardDialog(item);
      return;
    }
    
    // Show confirmation dialog before purchase
    this.showPurchaseConfirmation(item);
  }
  
  private showPurchaseConfirmation(item: ShopItem): void {
    const screenW = this.cameras.main.width;
    const screenH = this.cameras.main.height;
    const panelX = screenW / 2;
    const panelY = screenH / 2;

    const actualPrice = this.getActualPrice(item);
    const hasDiscount = actualPrice < item.price;
    const priceEmoji = item.currency === "ginto" ? "♦" : "💎";
    const nameValue = item.name.toUpperCase();
    const confirmValue = "CONFIRM PURCHASE?";
    const priceValue = hasDiscount
      ? `${actualPrice} ${priceEmoji}   (was ${item.price} ${priceEmoji})`
      : `${actualPrice} ${priceEmoji}`;
    const goldValue = `Your Gold: ${this.player.ginto} ♦`;

    // Measure text so modal hugs content.
    const measureWrappedText = (
      text: string,
      style: Phaser.Types.GameObjects.Text.TextStyle
    ): Phaser.Types.Math.Vector2Like => {
      const temp = this.add.text(-9999, -9999, text, style);
      const bounds = temp.getBounds();
      temp.destroy();
      return { x: Math.ceil(bounds.width), y: Math.ceil(bounds.height) };
    };
    const nameMeasure = measureWrappedText(nameValue, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      wordWrap: { width: 460 }
    });
    const priceMeasure = measureWrappedText(priceValue, {
      fontFamily: "dungeon-mode",
      fontSize: hasDiscount ? 17 : 22,
      color: "#e8eced"
    });
    const goldMeasure = measureWrappedText(goldValue, {
      fontFamily: "dungeon-mode",
      fontSize: 15,
      color: "#fbbf24"
    });

    const panelWidth = Math.max(420, Math.min(640, Math.max(nameMeasure.x + 180, priceMeasure.x + 120, goldMeasure.x + 120)));
    const headerH = 76;
    const priceH = hasDiscount ? 72 : 54;
    const panelHeight = 28 + headerH + 14 + 38 + 12 + priceH + 12 + 26 + 20 + 56 + 26;

    this.lockInput();

    const overlay = this.add.rectangle(panelX, panelY, screenW, screenH, 0x000000)
      .setAlpha(0.8)
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive();

    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);

    const closePanel = () => {
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: "Back.easeIn",
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          this.unlockInput();
        }
      });
    };

    overlay.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const bounds = {
        left: panelX - panelWidth / 2,
        right: panelX + panelWidth / 2,
        top: panelY - panelHeight / 2,
        bottom: panelY + panelHeight / 2
      };
      if (pointer.x < bounds.left || pointer.x > bounds.right || pointer.y < bounds.top || pointer.y > bounds.bottom) {
        closePanel();
      }
    });

    const panelShadow = this.add.rectangle(4, 4, panelWidth, panelHeight, 0x000000, 0.45).setOrigin(0.5);
    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x150E10, 0.98).setOrigin(0.5);
    const outerBorder = this.add.rectangle(0, 0, panelWidth + 6, panelHeight + 6, undefined, 0).setOrigin(0.5);
    outerBorder.setStrokeStyle(3, 0x77888C, 0.9);
    const innerBorder = this.add.rectangle(0, 0, panelWidth + 2, panelHeight + 2, undefined, 0).setOrigin(0.5);
    innerBorder.setStrokeStyle(2, 0x556065, 0.75);

    const headerY = -panelHeight / 2 + 14;
    const headerBg = this.add.rectangle(0, headerY + headerH / 2, panelWidth - 22, headerH, 0x1b2327, 0.72).setOrigin(0.5);
    const headerBorder = this.add.rectangle(0, headerY + headerH / 2, panelWidth - 22, headerH, undefined, 0).setOrigin(0.5);
    headerBorder.setStrokeStyle(1, 0x77888C, 0.5);

    const iconX = -panelWidth / 2 + 40;
    const iconY = headerY + headerH / 2;
    const iconBg = this.add.rectangle(iconX, iconY, 48, 48, 0x150E10, 0.95).setOrigin(0.5);
    iconBg.setStrokeStyle(2, 0x77888C, 0.85);
    const iconInner = this.add.rectangle(iconX, iconY, 44, 44, undefined, 0).setOrigin(0.5);
    iconInner.setStrokeStyle(1, 0x556065, 0.75);

    const spriteKey = getRelicSpriteKey(item.item.id);
    let itemIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    if (spriteKey && this.textures.exists(spriteKey)) {
      itemIcon = this.add.image(iconX, iconY, spriteKey).setOrigin(0.5).setDisplaySize(34, 34);
    } else {
      itemIcon = this.add.text(iconX, iconY, item.emoji, { fontSize: 24 }).setOrigin(0.5);
    }

    const nameText = this.add.text(iconX + 34, iconY - 5, nameValue, {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      wordWrap: { width: panelWidth - 180 }
    }).setOrigin(0, 0.5);
    const subText = this.add.text(iconX + 34, iconY + 16, "PURCHASE CHECK", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C"
    }).setOrigin(0, 0.5);

    const closeBtn = this.add.container(panelWidth / 2 - 22, -panelHeight / 2 + 22);
    const closeBg = this.add.rectangle(0, 0, 24, 24, 0x150E10, 1).setOrigin(0.5);
    closeBg.setStrokeStyle(2, 0x77888C, 0.95);
    const closeText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e8eced"
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeText]);
    closeBtn.setSize(24, 24).setInteractive({ useHandCursor: true });
    closeBtn.on("pointerdown", closePanel);
    closeBtn.on("pointerover", () => { closeBg.setFillStyle(0x2a343a, 1); closeBtn.setScale(1.08); });
    closeBtn.on("pointerout", () => { closeBg.setFillStyle(0x150E10, 1); closeBtn.setScale(1); });

    let currentY = -panelHeight / 2 + 14 + headerH + 18;
    const confirmLabel = this.add.text(0, currentY, confirmValue, {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#77888C",
      align: "center"
    }).setOrigin(0.5, 0);
    currentY += 36;

    const priceBg = this.add.rectangle(0, currentY + priceH / 2, panelWidth - 60, priceH, 0x1b2327, 0.72).setOrigin(0.5);
    priceBg.setStrokeStyle(1, 0x77888C, 0.5);
    const priceLabel = this.add.text(0, currentY + 12, hasDiscount ? "PRICE (DISCOUNTED)" : "PRICE", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: hasDiscount ? "#2ed573" : "#77888C"
    }).setOrigin(0.5, 0.5);
    const priceText = this.add.text(0, currentY + (hasDiscount ? 43 : 35), priceValue, {
      fontFamily: "dungeon-mode",
      fontSize: hasDiscount ? 17 : 22,
      color: hasDiscount ? "#2ed573" : "#e8eced",
      align: "center"
    }).setOrigin(0.5, 0.5);
    currentY += priceH + 16;

    const goldInfo = this.add.text(0, currentY, goldValue, {
      fontFamily: "dungeon-mode",
      fontSize: 15,
      color: "#fbbf24"
    }).setOrigin(0.5, 0);
    currentY += 30;

    const btnY = panelHeight / 2 - 44;
    const btnWidth = 160;
    const btnHeight = 48;
    const btnGap = 20;

    const confirmBtn = this.add.container(-btnWidth / 2 - btnGap / 2, btnY);
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x150E10, 0.9);
    confirmBg.lineStyle(3, 0x77888C, 0.8);
    confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
    confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
    const confirmInnerGlow = this.add.graphics();
    confirmInnerGlow.lineStyle(1, 0x556065, 0.7);
    confirmInnerGlow.strokeRoundedRect(-btnWidth / 2 + 2, -btnHeight / 2 + 2, btnWidth - 4, btnHeight - 4, 8);
    const confirmText = this.add.text(0, 0, "CONFIRM", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C"
    }).setOrigin(0.5);
    confirmBtn.add([confirmBg, confirmInnerGlow, confirmText]);
    confirmBtn.setSize(btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    confirmBtn.on("pointerdown", () => {
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: "Back.easeIn",
        onComplete: () => {
          overlay.destroy();
          panel.destroy();
          this.unlockInput();
          this.proceedWithPurchase(item);
        }
      });
    });
    confirmBtn.on("pointerover", () => {
      confirmBtn.setScale(1.05);
      confirmBg.clear();
      confirmBg.fillStyle(0x150E10, 1);
      confirmBg.lineStyle(3, 0x77888C, 1);
      confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      confirmText.setColor("#ffffff");
    });
    confirmBtn.on("pointerout", () => {
      confirmBtn.setScale(1);
      confirmBg.clear();
      confirmBg.fillStyle(0x150E10, 0.9);
      confirmBg.lineStyle(3, 0x77888C, 0.8);
      confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      confirmText.setColor("#77888C");
    });

    const cancelBtn = this.add.container(btnWidth / 2 + btnGap / 2, btnY);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0x150E10, 0.9);
    cancelBg.lineStyle(3, 0x77888C, 0.8);
    cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
    cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
    const cancelInnerGlow = this.add.graphics();
    cancelInnerGlow.lineStyle(1, 0x556065, 0.7);
    cancelInnerGlow.strokeRoundedRect(-btnWidth / 2 + 2, -btnHeight / 2 + 2, btnWidth - 4, btnHeight - 4, 8);
    const cancelText = this.add.text(0, 0, "CANCEL", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C"
    }).setOrigin(0.5);
    cancelBtn.add([cancelBg, cancelInnerGlow, cancelText]);
    cancelBtn.setSize(btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    cancelBtn.on("pointerdown", closePanel);
    cancelBtn.on("pointerover", () => {
      cancelBtn.setScale(1.05);
      cancelBg.clear();
      cancelBg.fillStyle(0x150E10, 1);
      cancelBg.lineStyle(3, 0x77888C, 1);
      cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      cancelText.setColor("#ffffff");
    });
    cancelBtn.on("pointerout", () => {
      cancelBtn.setScale(1);
      cancelBg.clear();
      cancelBg.fillStyle(0x150E10, 0.9);
      cancelBg.lineStyle(3, 0x77888C, 0.8);
      cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      cancelText.setColor("#77888C");
    });

    panel.add([
      panelShadow,
      outerBorder,
      innerBorder,
      panelBg,
      headerBg,
      headerBorder,
      iconBg,
      iconInner,
      itemIcon,
      nameText,
      subText,
      closeBtn,
      confirmLabel,
      priceBg,
      priceLabel,
      priceText,
      goldInfo,
      confirmBtn,
      cancelBtn
    ]);

    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 280,
      ease: "Back.easeOut"
    });
  }
  
  /**
   * Show relic discard dialog when player has 6 relics
   */
  private showRelicDiscardDialog(item: ShopItem): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Treat discard selection as a modal to prevent other shop interactions
    // (and to ensure input lock state is always restored after closing).
    this.lockInput();

    // Create overlay that blocks all interactions beneath it
    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(10000);
    overlay.setInteractive();
    
    // Create dialog container
    const dialogWidth = 700;
    const dialogHeight = 500;
    const dialog = this.add.container(
      screenWidth / 2,
      screenHeight / 2
    ).setScrollFactor(0).setDepth(10001);
    
    // Dialog background
    const dialogBg = this.add.graphics();
    dialogBg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.98);
    dialogBg.lineStyle(3, 0xff9f43, 1);
    dialogBg.fillRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    dialogBg.strokeRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    
    // Title
    const title = this.add.text(0, -dialogHeight/2 + 30, "RELIC INVENTORY FULL!", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#ff9f43",
    }).setOrigin(0.5);
    title.setShadow(2, 2, '#000000', 3, false, true);
    
    // Instructions
    const instructions = this.add.text(0, -dialogHeight/2 + 65, "Choose a relic to discard:", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced",
    }).setOrigin(0.5);
    
    dialog.add([dialogBg, title, instructions]);
    
    // Create relic selection grid (2 rows of 3) - with properly scaled sprites
    const relicCardWidth = 200;
    const relicCardHeight = 100;
    const spacing = 15;
    const startX = -((relicCardWidth + spacing) * 3 - spacing) / 2 + relicCardWidth / 2;
    const startY = -100;
    
    const cleanupDialog = () => {
      overlay.destroy();
      dialog.destroy();
      this.unlockInput();
    };

    this.player.relics.forEach((relic, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (relicCardWidth + spacing);
      const y = startY + row * (relicCardHeight + spacing);
      
      // Create relic card container
      const relicCard = this.add.container(x, y);
      
      // Card background with gradient
      const cardBg = this.add.rectangle(0, 0, relicCardWidth, relicCardHeight, 0x2a1f2a)
        .setStrokeStyle(2, 0x77888C);
      
      relicCard.add([cardBg]);
      
      // Relic sprite - scaled to fit card properly
      const spriteKey = getRelicSpriteKey(relic.id);
      if (spriteKey && this.textures.exists(spriteKey)) {
        const sprite = this.add.sprite(0, -10, spriteKey);
        
        // Calculate scale to fit within card bounds (leave room for text)
        const maxSpriteWidth = relicCardWidth - 40;
        const maxSpriteHeight = relicCardHeight - 45; // Leave space for name
        const spriteScale = Math.min(
          maxSpriteWidth / sprite.width,
          maxSpriteHeight / sprite.height,
          0.25 // Maximum scale cap to prevent too large sprites
        );
        
        sprite.setScale(spriteScale);
        relicCard.add(sprite);
      } else {
        // Fallback to emoji if sprite doesn't exist
        const emoji = this.add.text(0, -10, relic.emoji || "✦", {
          fontSize: 28,
          color: "#fbbf24",
          align: "center"
        }).setOrigin(0.5);
        relicCard.add(emoji);
      }
      
      // Relic name (wrapped text, positioned at bottom)
      const nameText = this.add.text(0, 35, relic.name, {
        fontFamily: "dungeon-mode",
        fontSize: 11,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: relicCardWidth - 20 }
      }).setOrigin(0.5);
      
      relicCard.add(nameText);
      
      // Make interactive
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on("pointerover", () => {
        cardBg.setStrokeStyle(3, 0xff9f43);
        this.tweens.add({
          targets: relicCard,
          scale: 1.05,
          duration: 150
        });
      });
      cardBg.on("pointerout", () => {
        cardBg.setStrokeStyle(2, 0x77888C);
        this.tweens.add({
          targets: relicCard,
          scale: 1,
          duration: 150
        });
      });
      cardBg.on("pointerdown", () => {
        // Show confirmation before discarding
        this.showDiscardConfirmation(relic, index, item, cleanupDialog);
      });
      
      dialog.add(relicCard);
    });
    
    // Cancel button
    const cancelBtn = this.add.container(0, dialogHeight/2 - 40);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0xff4757, 0.9);
    cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const cancelText = this.add.text(0, 0, "CANCEL", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    cancelBtn.add([cancelBg, cancelText]);
    cancelBtn.setSize(120, 40);
    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.on("pointerdown", () => {
      cleanupDialog();
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
    
    dialog.add(cancelBtn);
  }

  /**
   * Show confirmation modal before discarding a relic.
   */
  private showDiscardConfirmation(
    relic: { id: string; name: string; emoji: string; spriteKey?: string },
    relicIndex: number,
    shopItem: ShopItem,
    cleanupDiscardDialog: () => void
  ): void {
    const screenW = this.cameras.main.width;
    const screenH = this.cameras.main.height;
    const panelX = screenW / 2;
    const panelY = screenH / 2;

    const panelWidth = 440;
    const panelHeight = 240;

    const overlay = this.add.rectangle(panelX, panelY, screenW, screenH, 0x000000)
      .setAlpha(0.7).setScrollFactor(0).setDepth(10010).setInteractive();

    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(10011);

    const closeConfirm = () => {
      overlay.destroy();
      panel.destroy();
    };

    overlay.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const bounds = {
        left: panelX - panelWidth / 2,
        right: panelX + panelWidth / 2,
        top: panelY - panelHeight / 2,
        bottom: panelY + panelHeight / 2
      };
      if (pointer.x < bounds.left || pointer.x > bounds.right || pointer.y < bounds.top || pointer.y > bounds.bottom) {
        closeConfirm();
      }
    });

    // Background
    const panelShadow = this.add.rectangle(4, 4, panelWidth, panelHeight, 0x000000, 0.45).setOrigin(0.5);
    const panelBg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x150E10, 0.98).setOrigin(0.5);
    const outerBorder = this.add.rectangle(0, 0, panelWidth + 6, panelHeight + 6, undefined, 0).setOrigin(0.5);
    outerBorder.setStrokeStyle(3, 0xff9f43, 0.9);
    const innerBorder = this.add.rectangle(0, 0, panelWidth + 2, panelHeight + 2, undefined, 0).setOrigin(0.5);
    innerBorder.setStrokeStyle(2, 0x556065, 0.75);

    // Title
    const title = this.add.text(0, -panelHeight / 2 + 30, "DISCARD RELIC?", {
      fontFamily: "dungeon-mode",
      fontSize: 22,
      color: "#ff9f43"
    }).setOrigin(0.5);

    // Relic icon + name
    const spriteKey = relic.spriteKey;
    let relicIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    if (spriteKey && this.textures.exists(spriteKey)) {
      relicIcon = this.add.image(0, -10, spriteKey).setOrigin(0.5).setDisplaySize(40, 40);
    } else {
      relicIcon = this.add.text(0, -10, relic.emoji || "✦", { fontSize: 32 }).setOrigin(0.5);
    }

    const relicName = this.add.text(0, 25, relic.name, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced"
    }).setOrigin(0.5);

    const warningText = this.add.text(0, 50, "This action cannot be undone.", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C"
    }).setOrigin(0.5);

    // Buttons
    const btnWidth = 150;
    const btnHeight = 44;
    const btnGap = 20;
    const btnY = panelHeight / 2 - 38;

    // Confirm discard button
    const confirmBtn = this.add.container(-btnWidth / 2 - btnGap / 2, btnY);
    const confirmBg = this.add.graphics();
    confirmBg.fillStyle(0x1f0a0a, 0.9);
    confirmBg.lineStyle(3, 0xff4757, 0.8);
    confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    const confirmText = this.add.text(0, 0, "DISCARD", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ff4757"
    }).setOrigin(0.5);
    confirmBtn.add([confirmBg, confirmText]);
    confirmBtn.setSize(btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    confirmBtn.on("pointerdown", () => {
      // Perform the discard
      this.player.relics.splice(relicIndex, 1);
      this.restoreDiscardedRelicCard(relic.id);

      // Close both the confirmation and the discard dialog
      closeConfirm();
      cleanupDiscardDialog();

      // Show purchase confirmation for the new item
      this.showPurchaseConfirmation(shopItem);
      this.showMessage(`Discarded ${relic.name}`, "#ff9f43");
    });
    confirmBtn.on("pointerover", () => {
      confirmBtn.setScale(1.05);
      confirmBg.clear();
      confirmBg.fillStyle(0x2a0a0a, 1);
      confirmBg.lineStyle(3, 0xff4757, 1);
      confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      confirmText.setColor("#ff6b81");
    });
    confirmBtn.on("pointerout", () => {
      confirmBtn.setScale(1);
      confirmBg.clear();
      confirmBg.fillStyle(0x1f0a0a, 0.9);
      confirmBg.lineStyle(3, 0xff4757, 0.8);
      confirmBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      confirmBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      confirmText.setColor("#ff4757");
    });

    // Cancel button (go back)
    const cancelBtn = this.add.container(btnWidth / 2 + btnGap / 2, btnY);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0x150E10, 0.9);
    cancelBg.lineStyle(3, 0x77888C, 0.8);
    cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    const cancelText = this.add.text(0, 0, "GO BACK", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#77888C"
    }).setOrigin(0.5);
    cancelBtn.add([cancelBg, cancelText]);
    cancelBtn.setSize(btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    cancelBtn.on("pointerdown", () => {
      closeConfirm();
    });
    cancelBtn.on("pointerover", () => {
      cancelBtn.setScale(1.05);
      cancelBg.clear();
      cancelBg.fillStyle(0x150E10, 1);
      cancelBg.lineStyle(3, 0x77888C, 1);
      cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      cancelText.setColor("#ffffff");
    });
    cancelBtn.on("pointerout", () => {
      cancelBtn.setScale(1);
      cancelBg.clear();
      cancelBg.fillStyle(0x150E10, 0.9);
      cancelBg.lineStyle(3, 0x77888C, 0.8);
      cancelBg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      cancelBg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      cancelText.setColor("#77888C");
    });

    panel.add([panelShadow, outerBorder, innerBorder, panelBg, title, relicIcon, relicName, warningText, confirmBtn, cancelBtn]);

    // Entrance animation
    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 250,
      ease: "Back.easeOut"
    });
  }

  /**
   * After discarding a relic, restore its shop card if the relic is sold in this shop.
   */
  private restoreDiscardedRelicCard(relicId: string): void {
    const shopIndex = this.shopItems.findIndex(si => si.item.id === relicId);
    if (shopIndex === -1) return;

    const oldCard = this.relicButtons[shopIndex];
    if (!oldCard) return;

    // Rebuild the card at the same position/size
    const x = oldCard.x;
    const y = (oldCard as any).originalY ?? oldCard.y;
    const parent = oldCard.parentContainer;
    oldCard.destroy();

    const newCard = this.createDiscoverStyleCard(this.shopItems[shopIndex], x, y, 200, 260);
    if (parent) parent.add(newCard);
    this.relicButtons[shopIndex] = newCard;
  }

  private proceedWithPurchase(item: ShopItem): void {
    // Calculate actual price with discounts
    const actualPrice = this.getActualPrice(item);

    // Add relic to player (validate before deducting gold)
    if (item.type === "relic") {
      // Add relic to player (no duplicates) + apply acquisition effect
      const gain = RelicManager.tryGainRelic(this.player, item.item as Relic, { applyAcquisitionEffect: true });
      if (!gain.added) {
        this.showMessage(
          gain.reason === 'duplicate' ? "You already have this relic!" : "Relic inventory full!",
          "#ff9f43"
        );
        return;
      }
    }

    // Deduct gold only after relic was successfully added
    this.player.ginto -= actualPrice;
    
    // Update UI with new currency format (match compact header: value + separate icons)
    this.healthText.setText(`${this.player.currentHealth}/${this.player.maxHealth}`);
    this.gintoText.setText(`${this.player.ginto}`);
    
    // Show success message with animation
    this.showMessage(`Purchased ${item.name}!`, "#2ed573");
    
    // Update the purchased item button with better visual feedback
    const itemIndex = this.shopItems.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      const button = this.relicButtons[itemIndex];
      if (button) {
        // Disable interactivity immediately to prevent hover from killing the animation
        button.disableInteractive();

        // Dim all card elements
        button.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.GameObject) {
            this.tweens.add({ targets: child, alpha: 0.45, duration: 300 });
          }
        });

        // Add owned overlay
        const ownedOverlay = this.add.rectangle(0, 0, 200, 260, 0x000000, 0.5).setOrigin(0.5);
        const checkMark = this.add.text(0, -18, "✓", { fontSize: 32, color: "#10b981" }).setOrigin(0.5);
        const ownedText = this.add.text(0, 14, "OWNED", {
          fontFamily: "dungeon-mode", fontSize: 16, color: "#10b981", fontStyle: "bold"
        }).setOrigin(0.5);

        button.add([ownedOverlay, checkMark, ownedText]);
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
    const boxHeight = 110;

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

  /**
   * Persona 5-ish exit transition — purple vertical curtain strips close inward.
   */
  private playExitTransition(onComplete: () => void): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x0d0015)
      .setOrigin(0.5).setAlpha(0).setDepth(9000);
    this.tweens.add({ targets: overlay, alpha: 0.5, duration: 300, ease: 'Power2' });

    const stripCount = 8;
    const stripW = (w / stripCount) + 4;
    for (let i = 0; i < stripCount; i++) {
      const fromLeft = i < stripCount / 2;
      const targetX = stripW * i + stripW / 2;
      const strip = this.add.rectangle(
        fromLeft ? -stripW : w + stripW, h / 2, stripW, h,
        Phaser.Math.RND.pick([0x0d0015, 0x0a0010, 0x120020])
      ).setOrigin(0.5).setAlpha(0.9).setDepth(9001);

      const distFromEdge = fromLeft ? i : (stripCount - 1 - i);
      this.tweens.add({
        targets: strip, x: targetX,
        duration: 350, ease: 'Power2',
        delay: distFromEdge * 35
      });
    }

    this.time.delayedCall(500, () => {
      const black = this.add.rectangle(w / 2, h / 2, w, h, 0x000000)
        .setOrigin(0.5).setAlpha(0).setDepth(9002);
      this.tweens.add({
        targets: black, alpha: 1, duration: 200, ease: 'Power2',
        onComplete
      });
    });
  }

  /**
   * Shutdown method - called when scene is stopped
   * Music cleanup is handled automatically by MusicLifecycleSystem
   */
  shutdown(): void {
    // Music cleanup handled by MusicLifecycleSystem
  }

}

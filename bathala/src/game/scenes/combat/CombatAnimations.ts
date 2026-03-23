import { Combat } from "../Combat";
import { Suit, PlayingCard } from "../../../core/types/CombatTypes";
import { DeckManager } from "../../../utils/DeckManager";

/**
 * CombatAnimations - Handles all animation logic for combat
 * Separates animation code from core Combat scene
 * 
 * Contains:
 * - Card animations (shuffle, draw, deal)
 * - Combat animations (attack, damage, death)
 * - Special ability animations
 * - Character slash animations
 */
export class CombatAnimations {
  /**
   * Play the Apoy (Inferno Strike) special animation using PNG sequence
   * @param x X position for animation (usually enemy position)
   * @param y Y position for animation (usually enemy position)
   * @param scale Optional scale factor (default 1.2)
   */
  public apoySpecialAnimation(x: number, y: number, scale: number = 8): void {
    // fire.png: 200x30, frameWidth=25 → 8 frames
    if (!this.scene.anims.exists("apoy_special_anim")) {
      this.scene.anims.create({
        key: "apoy_special_anim",
        frames: this.scene.anims.generateFrameNumbers("action_fire", { start: 0, end: 7 }),
        frameRate: 10,
        repeat: 0
      });
    }
    const anim = this.scene.add.sprite(x, y, "action_fire", 0)
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth(1002);
    anim.play("apoy_special_anim");
    anim.on("animationcomplete", () => anim.destroy());
  }
  /**
   * Play the Tubig (Tidal Slash) special animation using the tubig_special spritesheet
   * @param x X position for animation (usually enemy position)
   * @param y Y position for animation (usually enemy position)
   * @param scale Optional scale factor (default 1.2)
   */
  public tubigSpecialAnimation(x: number, y: number, scale: number = 8): void {
    if (!this.scene.anims.exists("tubig_special_anim")) {
      // water.png: 270x41, frameWidth=30 → 9 frames exactly
      this.scene.anims.create({
        key: "tubig_special_anim",
        frames: this.scene.anims.generateFrameNumbers("action_water", { start: 0, end: 8 }),
        frameRate: 10,
        repeat: 0
      });
    }

    const anim = this.scene.add.sprite(x, y, "action_water", 0)
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth(1002);
    anim.play("tubig_special_anim");
    anim.on("animationcomplete", () => anim.destroy());
  }
  /**
   * Play the Lupa (Earth Crusher) special animation using the lupa_special spritesheet
   * @param x X position for animation (usually enemy position)
   * @param y Y position for animation (usually enemy position)
   * @param scale Optional scale factor (default 1.2)
   */
  public lupaSpecialAnimation(x: number, y: number, scale: number = 8): void {
    if (!this.scene.anims.exists("lupa_special_anim")) {
      // earth.png: 540x48, frameWidth=54 → 10 frames exactly
      this.scene.anims.create({
        key: "lupa_special_anim",
        frames: this.scene.anims.generateFrameNumbers("action_earth", { start: 0, end: 9 }),
        frameRate: 10,
        repeat: 0
      });
    }

    const anim = this.scene.add.sprite(x, y, "action_earth", 0)
      .setOrigin(0.5, 1)
      .setScale(scale)
      .setDepth(1002);
    anim.play("lupa_special_anim");
    anim.on("animationcomplete", () => anim.destroy());
  }
  private scene: Combat;

  constructor(scene: Combat) {
    this.scene = scene;
  }

  /**
   * Fallback: Get special attack damage for animation display
   * Replace with actual game logic as needed
   */
  private getSpecialAttackDamage(suit: Suit): number {
    // TODO: Replace with real damage calculation from Combat scene
    if (suit === "Lupa") return 42;
    if (suit === "Tubig") return 36;
    return 20;
  }

  /**
   * Show damage number above enemy sprite
   */
  private showDamageNumber(x: number, y: number, damage: number): void {
    const dmgText = this.scene.add.text(x, y - 50, `-${damage}`,
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ff2222',
        stroke: '#000',
        strokeThickness: 4,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setDepth(1005)
      .setAlpha(1);
    this.scene.tweens.add({
      targets: dmgText,
      y: y - 80,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.Out',
      onComplete: () => dmgText.destroy()
    });
  }

  /**
   * Animate card shuffling effect (Individual card tracking)
   */
  public animateCardShuffle(sortType: "rank" | "suit", onComplete: () => void): void {
    // Store the original card order to track which card goes where
    const originalCards = [...this.scene.getCombatState().player.hand];
    
    // Sort the hand data to get the new order
    const sortedCards = DeckManager.sortCards([...this.scene.getCombatState().player.hand], sortType);
    
    // Calculate what the positions SHOULD be after sorting (using same logic as updateHandDisplay)
    const hand = sortedCards;
    const screenWidth = this.scene.cameras.main.width;
    const cardWidth = 80;
    const cardSpacing = cardWidth * 1.2; // 120% spacing to match updateHandDisplay
    const totalWidth = (hand.length - 1) * cardSpacing;
    const maxWidth = screenWidth * 0.8;
    const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
    const actualSpacing = cardSpacing * scale;
    const actualTotalWidth = (hand.length - 1) * actualSpacing;
    const startX = -actualTotalWidth / 2;
    const arcHeight = 30;
    const maxRotation = 8;
    
    // Calculate target positions for sorted cards
    const targetPositions = sortedCards.map((_card, index) => {
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      const x = startX + index * actualSpacing;
      const baseY = -Math.abs(normalizedPos) * arcHeight * 2;
      const rotation = normalizedPos * maxRotation;
      
      return { x, y: baseY, rotation };
    });
    
    // Create a mapping of where each card should end up (access through UI)
    const ui = (this.scene as any).ui;
    const cardMappings = ui.cardSprites.map((cardSprite: any, originalIndex: number) => {
      const originalCard = originalCards[originalIndex];
      const newIndex = sortedCards.findIndex(card => 
        card.suit === originalCard.suit && card.rank === originalCard.rank
      );
      return {
        sprite: cardSprite,
        originalIndex,
        newIndex,
        targetPosition: targetPositions[newIndex] // Use calculated target positions
      };
    });
    
    // Phase 1: Cards lift up and move to their sorted positions individually
    const movePromises = cardMappings.map((mapping: any, index: number) => {
      return new Promise<void>((resolve) => {
        // First lift up slightly
        this.scene.tweens.add({
          targets: mapping.sprite,
          y: mapping.sprite.y - 20,
          rotation: (Math.random() - 0.5) * 0.3,
          duration: 100,
          delay: index * 8,
          ease: 'Power2.easeOut',
          onComplete: () => {
            // Then move to the target position
            this.scene.tweens.add({
              targets: mapping.sprite,
              x: mapping.targetPosition.x,
              y: mapping.targetPosition.y,
              rotation: mapping.targetPosition.rotation,
              duration: 200,
              ease: 'Power2.easeInOut',
              onComplete: () => resolve()
            });
          }
        });
      });
    });
    
    // Wait for all cards to reach their positions, then update the hand data
    Promise.all(movePromises).then(() => {
      // Update the hand data to match the sorted order
      this.scene.getCombatState().player.hand = sortedCards;
      
      // Reorder the cardSprites array to match the sorted order (through UI)
      const newCardSprites: Phaser.GameObjects.Container[] = [];
      sortedCards.forEach((sortedCard) => {
        const spriteIndex = originalCards.findIndex(card => 
          card.suit === sortedCard.suit && card.rank === sortedCard.rank
        );
        if (spriteIndex !== -1) {
          newCardSprites.push(ui.cardSprites[spriteIndex]);
        }
      });
      ui.cardSprites = newCardSprites;
      
      // Update the base positions stored in each card to match their new positions
      // AND ensure sprite positions are synchronized
      sortedCards.forEach((card, index) => {
        const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
        const x = startX + index * actualSpacing;
        const baseY = -Math.abs(normalizedPos) * arcHeight * 2;
        const rotation = normalizedPos * maxRotation;
        
        // Store base positions in the card data
        (card as any).baseX = x;
        (card as any).baseY = baseY;
        (card as any).baseRotation = rotation;
        
        // Ensure the sprite position matches (accounting for selection state)
        const cardSprite = ui.cardSprites[index];
        if (cardSprite) {
          const targetY = card.selected ? baseY - 40 : baseY;
          cardSprite.setPosition(x, targetY);
          cardSprite.setAngle(rotation);
          cardSprite.setDepth(card.selected ? 500 + index : 100 + index);
        }
      });
      
      onComplete();
    });
  }

  /** Animate special action with cinematic effects */
  public animateSpecialAction(suit: Suit): void {
    this.createCinematicBars(suit);
  }

  /**
   * Full-screen impact frame with suit-themed letterbox, color flash, and sliding attack name.
   * Triggers performSpecialAttack once the reveal finishes.
   */
  private createCinematicBars(suit: Suit): void {
    const W = this.scene.cameras.main.width;
    const H = this.scene.cameras.main.height;

    (this.scene as any).hideUIForSpecialAttack();

    // --- Per-suit theming ---
    const suitConfig: Record<Suit, { color: number; hex: string; dim: number; dimHex: string; name: string; subtitle: string }> = {
      "Apoy":  { color: 0xff6a00, hex: "#ff6a00", dim: 0x7a2000, dimHex: "#7a2000", name: "INFERNO STRIKE!", subtitle: "· APOY ·"  },
      "Tubig": { color: 0x38b6ff, hex: "#38b6ff", dim: 0x0a3a6e, dimHex: "#0a3a6e", name: "TIDAL SLASH!",    subtitle: "· TUBIG ·" },
      "Lupa":  { color: 0x7ed957, hex: "#7ed957", dim: 0x1e4a10, dimHex: "#1e4a10", name: "EARTH CRUSHER!",  subtitle: "· LUPA ·"  },
      "Hangin":{ color: 0xb8f0ff, hex: "#b8f0ff", dim: 0x1a4a5a, dimHex: "#1a4a5a", name: "WIND CUTTER!",    subtitle: "· HANGIN ·"},
    };
    const { color, hex, dim, name, subtitle } = suitConfig[suit];
    const BAR_H = H * 0.20;
    const DEPTH = 1000;

    // --- 1. Full vignette behind everything (stays the whole time) ---
    const vignette = this.scene.add.rectangle(W / 2, H / 2, W, H, 0x000000)
      .setAlpha(0).setDepth(DEPTH);
    this.scene.tweens.add({
      targets: vignette,
      alpha: 0.65,
      duration: 180,
      ease: 'Cubic.Out'
    });

    // --- 2. Letterbox bars — solid black with a colored inner edge line ---
    const topBar = this.scene.add.rectangle(W / 2, -BAR_H / 2, W, BAR_H, 0x000000)
      .setDepth(DEPTH + 1).setAlpha(1);
    const bottomBar = this.scene.add.rectangle(W / 2, H + BAR_H / 2, W, BAR_H, 0x000000)
      .setDepth(DEPTH + 1).setAlpha(1);
    // Inner edge glow lines (sit just inside each bar, revealed as bars slam in)
    const topEdge = this.scene.add.rectangle(W / 2, -2, W, 2, color)
      .setDepth(DEPTH + 2).setAlpha(0.9);
    const bottomEdge = this.scene.add.rectangle(W / 2, H + 2, W, 2, color)
      .setDepth(DEPTH + 2).setAlpha(0.9);

    this.scene.tweens.add({
      targets: topBar,
      y: BAR_H / 2,
      duration: 180,
      ease: 'Expo.Out'
    });
    this.scene.tweens.add({
      targets: bottomBar,
      y: H - BAR_H / 2,
      duration: 180,
      ease: 'Expo.Out'
    });
    this.scene.tweens.add({
      targets: topEdge,
      y: BAR_H,
      duration: 180,
      ease: 'Expo.Out'
    });
    this.scene.tweens.add({
      targets: bottomEdge,
      y: H - BAR_H,
      duration: 180,
      ease: 'Expo.Out'
    });

    // --- 3. Impact flash — hard white then suit color ---
    const flashWhite = this.scene.add.rectangle(W / 2, H / 2, W, H, 0xffffff)
      .setAlpha(0).setDepth(DEPTH + 3);
    this.scene.tweens.add({
      targets: flashWhite,
      alpha: { from: 0.6, to: 0 },
      duration: 120,
      ease: 'Expo.Out',
      delay: 140,
      onComplete: () => flashWhite.destroy()
    });
    const flashColor = this.scene.add.rectangle(W / 2, H / 2, W, H, color)
      .setAlpha(0).setDepth(DEPTH + 3);
    this.scene.tweens.add({
      targets: flashColor,
      alpha: { from: 0.35, to: 0 },
      duration: 400,
      ease: 'Cubic.Out',
      delay: 200,
      onComplete: () => flashColor.destroy()
    });

    // --- 4. Speed lines — 5 horizontal streaks shooting left to right ---
    for (let i = 0; i < 5; i++) {
      const lineY = BAR_H + (H - BAR_H * 2) * (0.15 + i * 0.18);
      const lineH = i === 2 ? 3 : 1;
      const streak = this.scene.add.rectangle(
        -W * 0.3, lineY, W * (0.4 + Math.random() * 0.5), lineH, color
      ).setOrigin(0, 0.5).setAlpha(0.7).setDepth(DEPTH + 2);
      this.scene.tweens.add({
        targets: streak,
        x: W * 1.4,
        alpha: 0,
        duration: 220 + i * 30,
        ease: 'Cubic.Out',
        delay: 150 + i * 20,
        onComplete: () => streak.destroy()
      });
    }

    // --- 5. Dim suit-colored panel spanning full width ---
    const panel = this.scene.add.rectangle(W / 2, H / 2, W, H - BAR_H * 2, dim)
      .setOrigin(0.5, 0.5).setAlpha(0).setDepth(DEPTH + 1);
    this.scene.tweens.add({
      targets: panel,
      alpha: 0.55,
      duration: 200,
      ease: 'Cubic.Out',
      delay: 180
    });

    // --- 6. Attack name — suit color, no outline ---
    const attackText = this.scene.add.text(
      W * 0.06, H / 2 - 18,
      name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 72,
        color: hex,
      }
    ).setOrigin(0, 0.5).setAlpha(0).setDepth(DEPTH + 4).setScale(1.4);

    this.scene.tweens.add({
      targets: attackText,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Expo.Out',
      delay: 220,
    });

    // --- 7. Subtitle — white, wide tracking, smaller ---
    const subtitleText = this.scene.add.text(
      W * 0.06, H / 2 + 32,
      subtitle,
      {
        fontFamily: "dungeon-mode",
        fontSize: 22,
        color: "#ffffff",
        letterSpacing: 10,
      }
    ).setOrigin(0, 0.5).setAlpha(0).setDepth(DEPTH + 4);

    this.scene.tweens.add({
      targets: subtitleText,
      alpha: 1,
      duration: 200,
      ease: 'Cubic.Out',
      delay: 360,
    });

    // --- 8. Second camera shake punch after text lands ---
    this.scene.time.delayedCall(140, () => {
      this.scene.cameras.main.shake(120, 0.012);
    });
    this.scene.time.delayedCall(280, () => {
      this.scene.cameras.main.shake(80, 0.006);
    });

    // --- 9. Exit: fire attack, slam everything out ---
    this.scene.time.delayedCall(1050, () => {
      this.performSpecialAttack(suit);

      // Text fades out quickly
      this.scene.tweens.add({
        targets: [attackText, subtitleText, panel],
        alpha: 0,
        duration: 200,
        ease: 'Cubic.In',
      });

      // Bars slam back out
      this.scene.tweens.add({
        targets: topBar,
        y: -BAR_H / 2,
        duration: 200,
        ease: 'Expo.In',
        onComplete: () => topBar.destroy()
      });
      this.scene.tweens.add({
        targets: bottomBar,
        y: H + BAR_H / 2,
        duration: 200,
        ease: 'Expo.In',
        onComplete: () => bottomBar.destroy()
      });
      this.scene.tweens.add({
        targets: topEdge,
        y: -2,
        duration: 200,
        ease: 'Expo.In',
        onComplete: () => topEdge.destroy()
      });
      this.scene.tweens.add({
        targets: bottomEdge,
        y: H + 2,
        duration: 200,
        ease: 'Expo.In',
        onComplete: () => bottomEdge.destroy()
      });
      this.scene.tweens.add({
        targets: vignette,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.In',
        delay: 100,
        onComplete: () => {
          vignette.destroy();
          attackText.destroy();
          subtitleText.destroy();
          panel.destroy();
          (this.scene as any).restoreUIAfterSpecialAttack();
        }
      });
    });
  }

  /**
   * Perform the actual special attack animation after announcement
   */
  private performSpecialAttack(suit: Suit): void {
    const enemySprite = this.scene.getEnemySprite();
    const spawnX = enemySprite.x;
    const spawnY = enemySprite.y + enemySprite.displayHeight / 2;
    if (suit === "Lupa") {
      this.lupaSpecialAnimation(spawnX, spawnY);
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        this.animateSpriteDamage(enemySprite);
        this.showDamageNumber(enemySprite.x, enemySprite.y, this.getSpecialAttackDamage(suit));
      });
    } else if (suit === "Tubig") {
      this.tubigSpecialAnimation(spawnX, spawnY);
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        this.animateSpriteDamage(enemySprite);
        this.showDamageNumber(enemySprite.x, enemySprite.y, this.getSpecialAttackDamage(suit));
      });
    } else if (suit === "Apoy") {
      this.apoySpecialAnimation(spawnX, spawnY);
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        this.animateSpriteDamage(enemySprite);
        this.showDamageNumber(enemySprite.x, enemySprite.y, this.getSpecialAttackDamage(suit));
      });
    } else {
      // Hangin uses air slash animation
      this.animateCharacterSlash(suit);
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
      });
    }
  }
  

  /** Animate character slash animation (Hangin special — uses air spritesheet) */
  public animateCharacterSlash(_suit: Suit): void {
    const enemySprite = this.scene.getEnemySprite();
    const spawnX = enemySprite.x;
    const spawnY = enemySprite.y + enemySprite.displayHeight / 2;

    if (!this.scene.anims.exists("air_special_anim")) {
      // air.png: 360x40, frameWidth=40 → 9 frames exactly
      this.scene.anims.create({
        key: "air_special_anim",
        frames: this.scene.anims.generateFrameNumbers("action_air", { start: 0, end: 8 }),
        frameRate: 10,
        repeat: 0
      });
    }
    const slashAnim = this.scene.add.sprite(spawnX, spawnY, "action_air", 0)
      .setOrigin(0.5, 1)
      .setScale(8)
      .setDepth(1002);
    slashAnim.play("air_special_anim");
    slashAnim.on("animationcomplete", () => slashAnim.destroy());
  }
  
  /** Create dramatic slash effect visualization for cinematic special attacks */
  private createDramaticSlashEffect(x: number, y: number, color: number): void {
    // Create multiple slash lines for more dramatic effect
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        // Create a slash line effect
        const slashLine = this.scene.add.line(0, 0, 0, 0, 120, 0, color);
        slashLine.setLineWidth(6 + i * 2); // Varying thickness
        slashLine.setPosition(x, y);
        slashLine.setDepth(1002); // Above overlay
        
        // Different angles for each slash
        const angles = [-45, -30, -60];
        slashLine.setAngle(angles[i]);
        
        // Animate the slash
        slashLine.setAlpha(0);
        this.scene.tweens.add({
          targets: slashLine,
          alpha: [0, 1, 0],
          scaleX: [0.5, 1.5, 0.8],
          scaleY: [0.5, 1.5, 0.8],
          duration: 200,
          ease: 'Power2.Out',
          onComplete: () => {
            slashLine.destroy();
          }
        });
      });
    }
    
    // Add impact flash at slash point
    const impactFlash = this.scene.add.circle(x, y, 30, color);
    impactFlash.setAlpha(0).setDepth(1001);
    
    this.scene.tweens.add({
      targets: impactFlash,
      alpha: [0, 0.8, 0],
      scale: [0.5, 2, 0.5],
      duration: 300,
      ease: 'Power2.Out',
      onComplete: () => {
        impactFlash.destroy();
      }
    });
  }

  /**
   * Animate drawing cards from deck to hand positions (Balatro style)
   * ALL card creation and management delegated to CombatUI
   */
  public animateDrawCardsFromDeck(cardCount: number): void {
    if ((this.scene as any).isDrawingCards) return; // Prevent multiple simultaneous draws
    
    (this.scene as any).isDrawingCards = true;
    const hand = this.scene.getCombatState().player.hand;
    const ui = (this.scene as any).ui;
    
    // FIXED SPACING - Must match CombatUI constants
    const CARD_SPACING = 96;
    const CARD_ARC_HEIGHT = 30;
    const CARD_MAX_ROTATION = 8;
    
    const deckPosition = (this.scene as any).deckPosition;
    const handContainer = this.scene.getHandContainer();
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Calculate positions using FIXED spacing
    const totalSpread = (hand.length - 1) * CARD_SPACING;
    const startX = -totalSpread / 2;
    
    // Get hand container position for calculating relative start position
    const handContainerY = screenHeight - 280;
    
    // Create cards through CombatUI at deck position first
    hand.forEach((card, index) => {
      // Calculate final position using FIXED spacing (relative to hand container)
      const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;
      const finalX = startX + index * CARD_SPACING;
      const finalY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
      const rotation = normalizedPos * CARD_MAX_ROTATION;
      
      // Store base positions in card data immediately
      (card as any).baseX = finalX;
      (card as any).baseY = finalY;
      (card as any).baseRotation = rotation;
      
      // BUGFIX: Create card at final position (CombatUI now handles this correctly)
      const cardSprite = ui.createCardSprite(card, finalX, finalY, true);
      
      // Calculate start position relative to hand container
      const startX_relative = deckPosition.x - screenWidth / 2;
      const startY_relative = deckPosition.y - handContainerY;
      
      // Position at deck location initially (relative to container)
      cardSprite.setPosition(startX_relative, startY_relative);
      cardSprite.setScale(0.8); // Start smaller
      cardSprite.setAlpha(0.9);
      cardSprite.setAngle(0);
      
      // Add to hand container AND ui.cardSprites (single source of truth)
      handContainer.add(cardSprite);
      ui.cardSprites.push(cardSprite);
      
      // Animate card flying to hand position
      this.scene.tweens.add({
        targets: cardSprite,
        x: finalX,
        y: finalY,
        angle: rotation,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 300 + index * 50, // Stagger animations
        delay: index * 100, // Delay each card
        ease: 'Power2',
        onComplete: () => {
          // Ensure final position is exact
          cardSprite.setPosition(finalX, finalY);
          cardSprite.setAngle(rotation);
          cardSprite.setDepth(100 + index);
          
          // If this is the last card, mark drawing as complete
          if (index === hand.length - 1) {
            (this.scene as any).isDrawingCards = false;
            // Update deck display via UI
            const ui = (this.scene as any).ui;
            if (ui && ui.updateDeckDisplay) {
              ui.updateDeckDisplay();
            }
          }
        }
      });
      
      // Add a slight bounce effect
      this.scene.tweens.add({
        targets: cardSprite,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 150,
        delay: 300 + index * 100,
        ease: 'Power2',
        yoyo: true
      });
    });
  }

  /**
   * Animate only newly drawn cards from deck to hand
   */
  public animateNewCards(newCards: PlayingCard[], startingIndex: number): void {
    if ((this.scene as any).isDrawingCards) return;
    
    (this.scene as any).isDrawingCards = true;
    
    // Update the hand display without animation using CombatUI
    const ui = (this.scene as any).ui;
    if (ui && ui.updateHandDisplayQuiet) {
      ui.updateHandDisplayQuiet();
    }
    
    // Then animate only the new cards using FIXED SPACING
    const hand = this.scene.getCombatState().player.hand;
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    const handContainerY = screenHeight - 280; // Hand container Y position
    const deckPosition = (this.scene as any).deckPosition;
    
    // FIXED SPACING - Must match card layout
    const CARD_SPACING = 96;
    const CARD_ARC_HEIGHT = 30;
    const CARD_MAX_ROTATION = 8;
    
    const totalSpread = (hand.length - 1) * CARD_SPACING;
    const startX = -totalSpread / 2;
    
    newCards.forEach((_card, relativeIndex) => {
      const absoluteIndex = startingIndex + relativeIndex;
      
      if (absoluteIndex < ui.cardSprites.length) {
        const cardSprite = ui.cardSprites[absoluteIndex];
        
        // Calculate final position using FIXED spacing (relative to hand container)
        const normalizedPos = hand.length > 1 ? (absoluteIndex / (hand.length - 1)) - 0.5 : 0;
        const finalX = startX + (absoluteIndex * CARD_SPACING);
        const finalY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
        const rotation = normalizedPos * CARD_MAX_ROTATION;
        
        // Start from deck position (relative to hand container)
        const startX_relative = deckPosition.x - screenWidth / 2;
        const startY_relative = deckPosition.y - handContainerY;
        
        cardSprite.setPosition(startX_relative, startY_relative);
        cardSprite.setScale(0.8);
        cardSprite.setAlpha(0.9);
        cardSprite.setAngle(0);
        
        // Animate to final position
        this.scene.tweens.add({
          targets: cardSprite,
          x: finalX,
          y: finalY,
          angle: rotation,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 300,
          delay: relativeIndex * 100,
          ease: 'Power2',
          onComplete: () => {
            // Ensure final position is exact
            cardSprite.setPosition(finalX, finalY);
            cardSprite.setAngle(rotation);
            
            if (relativeIndex === newCards.length - 1) {
              (this.scene as any).isDrawingCards = false;
            }
          }
        });
      }
    });
  }

  /**
   * Animate deck shuffle when discard pile is shuffled back
   */
  public animateShuffleDeck(onComplete: () => void): void {
    const deckSprite = this.scene.getDeckSprite();
    if (!deckSprite) {
      onComplete();
      return;
    }
    
    const deckPosition = (this.scene as any).deckPosition;
    
    // Create shuffle effect
    this.scene.tweens.add({
      targets: deckSprite,
      angle: 360,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        onComplete();
        (this.scene as any).updateDeckDisplay();
      }
    });
    
    // Add some particle-like effect for shuffle
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.rectangle(
        deckPosition.x + (Math.random() - 0.5) * 40,
        deckPosition.y + (Math.random() - 0.5) * 40,
        4,
        4,
        0xffd700
      );
      
      this.scene.tweens.add({
        targets: particle,
        alpha: 0,
        y: particle.y - 30,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  /** Animate sprite taking damage */
  public animateSpriteDamage(sprite: Phaser.GameObjects.Sprite): void {
    if (!sprite) return;
    
    // Flash red
    sprite.setTint(0xff0000);
    
    // Shake sprite
    this.scene.tweens.add({
      targets: sprite,
      x: sprite.x + 5,
      y: sprite.y + 2,
      yoyo: true,
      repeat: 2,
      duration: 50,
      ease: 'Power2',
      onComplete: () => {
        sprite.clearTint();
        sprite.setPosition(sprite.x, sprite.y);
      }
    });
  }

  /** Animate enemy attack movement */
  public animateEnemyAttack(): void {
    const enemySprite = this.scene.getEnemySprite();
    if (!enemySprite) return;
    
    const originalX = enemySprite.x;
    
    // Move forward
    this.scene.tweens.add({
      targets: enemySprite,
      x: originalX - 50,
      duration: 200,
      ease: 'Power2',
      yoyo: true
    });
  }

  /** Animate player attack — picks slash variant based on damage, spawns at bottom of enemy */
  public animatePlayerAttack(damage: number = 0): void {
    const playerSprite = this.scene.getPlayerSprite();
    const enemySprite = this.scene.getEnemySprite();
    if (!enemySprite || !playerSprite) return;

    // Player dash toward enemy
    const originalX = playerSprite.x;
    this.scene.tweens.add({
      targets: playerSprite,
      x: originalX + 50,
      duration: 200,
      ease: 'Power2',
      yoyo: true
    });

    const spawnX = enemySprite.x;
    const spawnY = enemySprite.y + enemySprite.displayHeight / 2;

    // Remove any previous slash animation
    const prevSlash = this.scene.children.getByName("slash_effect");
    if (prevSlash) prevSlash.destroy();

    // Pick variant based on damage: <10 slash, <20 slash_curved, <35 slash_double, >=35 slash_double_curved
    let textureKey: string;
    let animKey: string;
    if (damage >= 35) {
      textureKey = "action_slash_double_curved";
      animKey = "slash_double_curved_anim";
    } else if (damage >= 20) {
      textureKey = "action_slash_double";
      animKey = "slash_double_anim";
    } else if (damage >= 10) {
      textureKey = "action_slash_curved";
      animKey = "slash_curved_anim";
    } else {
      textureKey = "action_slash";
      animKey = "slash_anim";
    }

    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(textureKey, { start: 0, end: -1 }),
        frameRate: 24,
        repeat: 0
      });
    }

    const slashAnim = this.scene.add.sprite(spawnX, spawnY, textureKey, 0)
      .setOrigin(0.5, 1)
      .setScale(8)
      .setName("slash_effect")
      .setDepth(100);
    slashAnim.play(animKey);
    slashAnim.on("animationcomplete", () => slashAnim.destroy());
  }

  /** Animate player defend — plays the defend spritesheet on the player hero */
  public animatePlayerDefend(): void {
    const playerSprite = this.scene.getPlayerSprite();
    if (!playerSprite) return;

    if (!this.scene.anims.exists("defend_anim")) {
      this.scene.anims.create({
        key: "defend_anim",
        frames: this.scene.anims.generateFrameNumbers("action_defend", { start: 0, end: -1 }),
        frameRate: 18,
        repeat: 0
      });
    }

    const spawnX = playerSprite.x;
    const spawnY = playerSprite.y + playerSprite.displayHeight / 2;
    const defendAnim = this.scene.add.sprite(spawnX, spawnY, "action_defend", 0)
      .setOrigin(0.5, 1)
      .setScale(8)
      .setDepth(playerSprite.depth + 1);
    defendAnim.play("defend_anim");
    defendAnim.on("animationcomplete", () => defendAnim.destroy());
  }

  public animateEnemySlash(): void {
    // Deprecated: replaced by GIF slash effect
    // If you want to use the GIF, call animatePlayerAttack instead
    return;
  }

  /** Animate enemy death */
  public animateEnemyDeath(): void {
    const enemySprite = this.scene.getEnemySprite();
    if (!enemySprite) return;
    
    // Fade out and fall
    this.scene.tweens.add({
      targets: enemySprite,
      alpha: 0,
      y: enemySprite.y + 50,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        enemySprite.destroy();
      }
    });
  }
}

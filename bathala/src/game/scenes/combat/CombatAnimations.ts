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
   * Play the Tubig (Tidal Slash) special animation using the tubig_special spritesheet
   * @param x X position for animation (usually enemy position)
   * @param y Y position for animation (usually enemy position)
   * @param scale Optional scale factor (default 1.2)
   */
  public tubigSpecialAnimation(x: number, y: number, scale: number = 1.2): void {
    // Check all frame keys exist before creating animation
    const missingFrames: string[] = [];
    for (let i = 0; i < 42; i++) {
      const frameKey = `water${(90000 + i).toString()}`;
      if (!this.scene.textures.exists(frameKey)) {
        missingFrames.push(frameKey);
      }
    }
    if (missingFrames.length > 0) {
      console.error("Missing Tubig special animation frames:", missingFrames);
      // Optionally, show a fallback or skip animation
      return;
    }
    // Create the animation if it doesn't exist
    if (!this.scene.anims.exists("tubig_special_anim")) {
      this.scene.anims.create({
        key: "tubig_special_anim",
        frames: Array.from({ length: 42 }, (_, i) => ({ key: `water${(90000 + i).toString()}` })),
        frameRate: 40,
        repeat: 0
      });
    }
    // Add the sprite and play the animation
    const enemySpriteScale = 0.4; // Use the same scale as enemy sprites for consistency
    const tubigAnim = this.scene.add.sprite(x, y, `water90000`)
      .setOrigin(0.5)
      .setScale(enemySpriteScale)
      .setDepth(1002)
      .setAlpha(1);
    tubigAnim.play("tubig_special_anim");
    tubigAnim.on("animationcomplete", () => {
      tubigAnim.destroy();
    });
  }
  /**
   * Play the Lupa (Earth Crusher) special animation using the lupa_special spritesheet
   * @param x X position for animation (usually enemy position)
   * @param y Y position for animation (usually enemy position)
   * @param scale Optional scale factor (default 1.2)
   */
  public lupaSpecialAnimation(x: number, y: number, scale: number = 1.2): void {
    // Create the animation if it doesn't exist
    if (!this.scene.anims.exists("lupa_special_anim")) {
      this.scene.anims.create({
        key: "lupa_special_anim",
        frames: this.scene.anims.generateFrameNumbers("lupa_special", { start: 0, end: 99 }),
        frameRate: 40,
        repeat: 0
      });
    }
    // Add the sprite and play the animation
    const lupaAnim = this.scene.add.sprite(x, y, "lupa_special", 0)
      .setOrigin(0.5)
      .setScale(scale)
      .setDepth(1002)
      .setAlpha(1);
    lupaAnim.play("lupa_special_anim");
    lupaAnim.on("animationcomplete", () => {
      lupaAnim.destroy();
    });
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
    // Create cinematic effect for special action sequence
    this.createCinematicBars();
    
    // First announce the attack, then perform it
    this.announceSpecialAttack(suit);
  }

  /**
   * Announce the special attack with dramatic text and effects, then perform the attack
   */
  private announceSpecialAttack(suit: Suit): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Get suit-specific attack names
    const attackNames: Record<Suit, string> = {
      "Apoy": "INFERNO STRIKE!",
      "Tubig": "TIDAL SLASH!",
      "Lupa": "EARTH CRUSHER!",
      "Hangin": "WIND CUTTER!"
    };
    
    const attackName = attackNames[suit];
    
    // Create dramatic announcement text
    const announcementText = this.scene.add.text(
      screenWidth / 2,
      screenHeight / 2 - 50,
      attackName,
      {
        fontFamily: "dungeon-mode",
        fontSize: 72,
        color: '#ffffff',
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.3).setDepth(1003);
    
    // Get suit color for effects
    const suitColors: Record<Suit, number> = {
      "Apoy": 0xff4500,    // Fire red/orange
      "Tubig": 0x1e90ff,   // Water blue
      "Lupa": 0x32cd32,    // Earth green
      "Hangin": 0x87ceeb    // Wind light blue
    };
    
    const color = suitColors[suit];
    
    // Animate announcement text in
    this.scene.tweens.add({
      targets: announcementText,
      alpha: 1,
      scale: 1.2,
      duration: 600,
      ease: 'Back.Out',
      onComplete: () => {
        // Change text color to suit color after initial appearance
        announcementText.setColor(`#${color.toString(16).padStart(6, '0')}`);
        
        // Hold for dramatic effect, then start the actual attack
        this.scene.time.delayedCall(800, () => {
          // Fade out announcement
          this.scene.tweens.add({
            targets: announcementText,
            alpha: 0,
            scale: 0.8,
            duration: 400,
            ease: 'Cubic.In',
            onComplete: () => {
              announcementText.destroy();
              // Now perform the actual attack
              this.performSpecialAttack(suit);
            }
          });
        });
      }
    });
  }

  /**
   * Perform the actual special attack animation after announcement
   */
  private performSpecialAttack(suit: Suit): void {
    const enemySprite = this.scene.getEnemySprite();
    if (suit === "Lupa") {
      this.lupaSpecialAnimation(enemySprite.x, enemySprite.y, 1.2);
      // Add impact effects and damage feedback during the animation
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        const impactFlash = this.scene.add.rectangle(
          enemySprite.x,
          enemySprite.y,
          120,
          120,
          0x32cd32 // Earth green
        ).setAlpha(0).setDepth(1004);
        this.scene.tweens.add({
          targets: impactFlash,
          alpha: [0, 0.3, 0],
          duration: 200,
          ease: 'Cubic.Out',
          onComplete: () => {
            impactFlash.destroy();
          }
        });
        // Damage feedback: flash red and show damage number
        this.animateSpriteDamage(enemySprite);
        this.showDamageNumber(enemySprite.x, enemySprite.y, this.getSpecialAttackDamage(suit));
      });
    } else if (suit === "Tubig") {
      this.tubigSpecialAnimation(enemySprite.x, enemySprite.y);
      // Add impact effects and damage feedback during the animation
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        const impactFlash = this.scene.add.rectangle(
          enemySprite.x,
          enemySprite.y,
          120,
          120,
          0x1e90ff // Water blue
        ).setAlpha(0).setDepth(1004);
        this.scene.tweens.add({
          targets: impactFlash,
          alpha: [0, 0.3, 0],
          duration: 200,
          ease: 'Cubic.Out',
          onComplete: () => {
            impactFlash.destroy();
          }
        });
        // Damage feedback: flash red and show damage number
        this.animateSpriteDamage(enemySprite);
        this.showDamageNumber(enemySprite.x, enemySprite.y, this.getSpecialAttackDamage(suit));
      });
    } else {
      // Other suits use slash animation
      this.animateCharacterSlash(suit);
      this.scene.time.delayedCall(300, () => {
        this.scene.cameras.main.shake(150, 0.01);
        const impactFlash = this.scene.add.rectangle(
          this.scene.cameras.main.width / 2,
          this.scene.cameras.main.height / 2,
          this.scene.cameras.main.width,
          this.scene.cameras.main.height,
          0xffffff
        ).setAlpha(0).setDepth(1004);
        this.scene.tweens.add({
          targets: impactFlash,
          alpha: [0, 0.3, 0],
          duration: 200,
          ease: 'Cubic.Out',
          onComplete: () => {
            impactFlash.destroy();
          }
        });
      });
    }
  }
  
  /** Create immersive cinematic effect for special action sequence (Final Fantasy horizontal focus style) */
  private createCinematicBars(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    const playerSprite = this.scene.getPlayerSprite();
    const enemySprite = this.scene.getEnemySprite();
    
    // Focus effect only - no top/bottom bars
    
    // No zooming in this version - just horizontal focus on hero and enemy
    // Focus camera horizontally between hero and enemy without zooming
    const combatCenterX = (playerSprite.x + enemySprite.x) / 2;
    const combatCenterY = (playerSprite.y + enemySprite.y) / 2;
    
    // Calculate focus area around hero and enemy - span entire screen width
    const focusWidth = screenWidth; // Use full screen width for maximum span
    const focusHeight = screenHeight * 0.4; // Use 40% of screen height
    const focusX = screenWidth / 2; // Center horizontally across entire screen
    const focusY = combatCenterY;
    
    // Hide all UI elements during special attack
    (this.scene as any).hideUIForSpecialAttack();
    
    // Create focus effect using multiple rectangles instead of mask
    // Top overlay (above focus area)
    const topOverlay = this.scene.add.rectangle(
      screenWidth / 2,
      (focusY - focusHeight / 2) / 2,
      screenWidth,
      focusY - focusHeight / 2,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Bottom overlay (below focus area)
    const bottomOverlay = this.scene.add.rectangle(
      screenWidth / 2,
      focusY + focusHeight / 2 + (screenHeight - (focusY + focusHeight / 2)) / 2,
      screenWidth,
      screenHeight - (focusY + focusHeight / 2),
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Left overlay (left of focus area)
    const leftOverlay = this.scene.add.rectangle(
      (focusX - focusWidth / 2) / 2,
      focusY,
      focusX - focusWidth / 2,
      focusHeight,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Right overlay (right of focus area)
    const rightOverlay = this.scene.add.rectangle(
      focusX + focusWidth / 2 + (screenWidth - (focusX + focusWidth / 2)) / 2,
      focusY,
      screenWidth - (focusX + focusWidth / 2),
      focusHeight,
      0x000000
    ).setAlpha(0).setDepth(1000);
    
    // Animate all overlays to create focus effect
    const allOverlays = [topOverlay, bottomOverlay, leftOverlay, rightOverlay];
    this.scene.tweens.add({
      targets: allOverlays,
      alpha: 0.8,
      duration: 500,
      ease: 'Cubic.Out'
    });
    
    // Instead of zooming, we'll move the camera slightly to center the action
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      scrollX: combatCenterX - (screenWidth / 2),
      duration: 500,
      ease: 'Cubic.Out',
      hold: 1000, // Hold the horizontal focus during the special move
      completeDelay: 300, // Wait before returning to normal view
      onComplete: () => {
        // Return to original camera position
        this.scene.tweens.add({
          targets: this.scene.cameras.main,
          scrollX: 0,
          duration: 300,
          ease: 'Cubic.In'
        });
      }
    });
    
    // No flash effect - just focus overlay
    
    // Create a "Special Move" text display like in Final Fantasy
    const specialMoveText = this.scene.add.text(
      screenWidth / 2,
      screenHeight / 3,
      "SPECIAL ATTACK!",
      {
        fontFamily: "dungeon-mode",
        fontSize: 64,
        color: '#ffd700', // Gold color like in Final Fantasy
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(1001);
    
    // Animate the special move text
    this.scene.tweens.add({
      targets: specialMoveText,
      alpha: 1,
      scale: 1.1,
      duration: 300,
      ease: 'Back.Out',
      yoyo: true,
      repeat: 0
    });
    
    // Animate the bars out after the special move
    this.scene.time.delayedCall(1800, () => {
      // Animate special move text out
      this.scene.tweens.add({
        targets: specialMoveText,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        ease: 'Cubic.In',
        onComplete: () => {
          specialMoveText.destroy();
        }
      });
      
      // Animate the focus overlay out
      this.scene.tweens.add({
        targets: allOverlays,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.In',
        onComplete: () => {
          allOverlays.forEach(overlay => overlay.destroy());
          // Restore UI after special attack
          (this.scene as any).restoreUIAfterSpecialAttack();
        }
      });
    });
    
    // Create camera shake effect for impact
    this.scene.cameras.main.shake(200, 0.008);
  }

  /** Animate character slash animation */
  public animateCharacterSlash(suit: Suit): void {
    const playerSprite = this.scene.getPlayerSprite();
    const originalX = playerSprite.x;
    const originalScale = playerSprite.scaleX;
    const enemySprite = this.scene.getEnemySprite();
    const slashX = enemySprite.x - 40;
    const slashY = enemySprite.y;

    // Create slash attack animation from PNG sequence
    if (!this.scene.anims.exists("slash_attack_anim")) {
      this.scene.anims.create({
        key: "slash_attack_anim",
        frames: [
          { key: "slash_00001" },
          { key: "slash_00002" },
          { key: "slash_00003" },
          { key: "slash_00004" },
          { key: "slash_00005" },
          { key: "slash_00006" },
          { key: "slash_00007" },
          { key: "slash_00008" },
          { key: "slash_00009" },
          { key: "slash_00010" },
          { key: "slash_00011" },
          { key: "slash_00012" }
        ],
        frameRate: 24,
        repeat: 0
      });
    }
    const slashAnim = this.scene.add.sprite(slashX, slashY, "slash_00001")
      .setOrigin(0.5)
      .setScale(1.2)
      .setDepth(1002)
      .setAlpha(1);
    slashAnim.play("slash_attack_anim");
    slashAnim.on("animationcomplete", () => {
      slashAnim.destroy();
    });

    // Animate player dash
    this.scene.tweens.add({
      targets: playerSprite,
      x: slashX - 40,
      scaleX: playerSprite.scaleX * 1.2,
      scaleY: playerSprite.scaleY * 1.2,
      duration: 150,
      ease: 'Power3.Out',
      onComplete: () => {
        // Return player to original position
        this.scene.tweens.add({
          targets: playerSprite,
          x: originalX,
          scaleX: originalScale,
          scaleY: originalScale,
          duration: 120,
          ease: 'Power3.In'
        });
      }
    });
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

  /** Animate player attack movement */
  public animatePlayerAttack(): void {
    const playerSprite = this.scene.getPlayerSprite();
    if (!playerSprite) return;

    const originalX = playerSprite.x;

    // Move player forward
    this.scene.tweens.add({
      targets: playerSprite,
      x: originalX + 50,
      duration: 200,
      ease: 'Power2',
      yoyo: true
    });

    // Show slash attack animation at enemy position
    const enemySprite = this.scene.getEnemySprite();
        if (!playerSprite) return;
  const slashX = enemySprite.x - 60; // Move animation further left
  const slashY = enemySprite.y;
    // Remove any previous slash animation
    const prevSlash = this.scene.children.getByName("slash_effect");
    if (prevSlash) {
      prevSlash.destroy();
    }

    // Create animation if not exists
    if (!this.scene.anims.exists("slash_attack_anim")) {
      this.scene.anims.create({
        key: "slash_attack_anim",
        frames: [
          { key: "slash_00001" },
          { key: "slash_00002" },
          { key: "slash_00003" },
          { key: "slash_00004" },
          { key: "slash_00005" },
          { key: "slash_00006" },
          { key: "slash_00007" },
          { key: "slash_00008" },
          { key: "slash_00009" },
          { key: "slash_00010" },
          { key: "slash_00011" },
          { key: "slash_00012" }
        ],
        frameRate: 24,
        repeat: 0
      });
    }

    // Add animated sprite using first frame
    const slashAnim = this.scene.add.sprite(slashX, slashY, "slash_00001")
      .setOrigin(0.5, 0.5)
      .setScale(2.2)
      .setName("slash_effect")
      .setDepth(100);
    slashAnim.play("slash_attack_anim");
    slashAnim.on("animationcomplete", () => {
      slashAnim.destroy();
    });
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

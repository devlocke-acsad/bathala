/**
 * HandView - Renders the player's card hand and played-hand areas
 *
 * Owns:
 *  - handContainer (the 8-card fan at bottom)
 *  - playedHandContainer (the 5-card committed area)
 *  - Card sprite creation, layout, selection highlight, sort animation
 *
 * Does NOT own:
 *  - Card selection logic (that's CardSelectionSystem / scene)
 *  - Damage calculation (CombatResolver)
 *
 * @module game/scenes/combat/views/HandView
 */

import Phaser from 'phaser';
import type { PlayingCard, Suit } from '../../../../core/types/CombatTypes';

// =============================================================================
// ELEMENT COLOUR MAP
// =============================================================================

const SUIT_COLORS: Record<Suit, number> = {
  Apoy: 0xff4444,
  Tubig: 0x4488ff,
  Lupa: 0x44bb44,
  Hangin: 0xcccccc,
};

const SUIT_ICONS: Record<Suit, string> = {
  Apoy: '🔥',
  Tubig: '💧',
  Lupa: '🌿',
  Hangin: '💨',
};

// =============================================================================
// HAND VIEW
// =============================================================================

export class HandView {
  private scene: Phaser.Scene;
  private handContainer: Phaser.GameObjects.Container;
  private playedHandContainer: Phaser.GameObjects.Container;
  private cardSprites: Phaser.GameObjects.Container[] = [];
  private playedCardSprites: Phaser.GameObjects.Container[] = [];

  /** Callback fired when a card in the hand is clicked */
  onCardClicked?: (card: PlayingCard) => void;

  /** Callback fired when a played card is clicked (to unplay it) */
  onPlayedCardClicked?: (card: PlayingCard) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.handContainer = scene.add.container(0, 0).setDepth(50);
    this.playedHandContainer = scene.add.container(0, 0).setDepth(60);
  }

  // ---- Layout helpers --------------------------------------------------------

  /** Position the containers based on screen dimensions */
  layout(screenWidth: number, screenHeight: number): void {
    this.handContainer.setPosition(screenWidth / 2, screenHeight * 0.85);
    this.playedHandContainer.setPosition(screenWidth / 2, screenHeight * 0.62);
  }

  // ---- Hand display ----------------------------------------------------------

  /**
   * Rebuild the hand display from the given cards.
   * Destroys old sprites and creates new ones.
   */
  updateHand(cards: PlayingCard[]): void {
    // Destroy old sprites
    this.cardSprites.forEach(s => s.destroy());
    this.cardSprites = [];
    this.handContainer.removeAll();

    if (cards.length === 0) return;

    const screenWidth = this.scene.cameras.main.width;
    const scaleFactor = Math.max(0.7, Math.min(1.1, screenWidth / 1024));
    const cardWidth = Math.floor(80 * scaleFactor);
    const cardHeight = Math.floor(120 * scaleFactor);
    const overlap = Math.floor(cardWidth * 0.35);
    const totalWidth = cards.length * (cardWidth - overlap) + overlap;
    let startX = -totalWidth / 2;

    cards.forEach((card, i) => {
      const x = startX + i * (cardWidth - overlap);
      const sprite = this.createCardSprite(card, x, 0, cardWidth, cardHeight, scaleFactor);
      sprite.setDepth(100 + i);

      // Store baseY for selection animation
      (card as any).baseY = this.handContainer.y;

      // Make interactive
      sprite.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      sprite.on('pointerdown', () => this.onCardClicked?.(card));

      this.handContainer.add(sprite);
      this.cardSprites.push(sprite);
    });
  }

  /** Update the played-hand display */
  updatePlayedHand(cards: PlayingCard[]): void {
    this.playedCardSprites.forEach(s => s.destroy());
    this.playedCardSprites = [];
    this.playedHandContainer.removeAll();

    if (cards.length === 0) return;

    const screenWidth = this.scene.cameras.main.width;
    const scaleFactor = Math.max(0.7, Math.min(1.1, screenWidth / 1024));
    const cardWidth = Math.floor(80 * scaleFactor);
    const cardHeight = Math.floor(120 * scaleFactor);
    const spacing = Math.floor(cardWidth * 0.75);
    const totalWidth = cards.length * spacing;
    let startX = -totalWidth / 2;

    cards.forEach((card, i) => {
      const x = startX + i * spacing;
      const sprite = this.createCardSprite(card, x, 0, cardWidth, cardHeight, scaleFactor);
      sprite.setDepth(200 + i);

      sprite.setInteractive(
        new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
        Phaser.Geom.Rectangle.Contains
      );
      sprite.on('pointerdown', () => this.onPlayedCardClicked?.(card));

      this.playedHandContainer.add(sprite);
      this.playedCardSprites.push(sprite);
    });
  }

  // ---- Card sprite creation --------------------------------------------------

  private createCardSprite(
    card: PlayingCard,
    x: number,
    y: number,
    w: number,
    h: number,
    scale: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const suitColor = SUIT_COLORS[card.suit] ?? 0xffffff;

    // Background
    const bg = this.scene.add.rectangle(0, 0, w, h, 0x150E10).setStrokeStyle(2, 0x77888C);
    container.add(bg);

    // Suit icon
    const icon = this.scene.add
      .text(0, -h * 0.25, SUIT_ICONS[card.suit] ?? '?', { fontSize: Math.floor(22 * scale) })
      .setOrigin(0.5);
    container.add(icon);

    // Rank text
    const rankText = this.scene.add
      .text(0, h * 0.1, String(card.rank), {
        fontFamily: 'dungeon-mode',
        fontSize: Math.floor(20 * scale),
        color: '#e8eced',
      })
      .setOrigin(0.5);
    container.add(rankText);

    // Element label
    const elemText = this.scene.add
      .text(0, h * 0.35, card.suit, {
        fontFamily: 'dungeon-mode',
        fontSize: Math.floor(10 * scale),
        color: `#${suitColor.toString(16).padStart(6, '0')}`,
      })
      .setOrigin(0.5);
    container.add(elemText);

    // Selection border (hidden by default)
    const border = this.scene.add
      .rectangle(0, 0, w + 4, h + 4)
      .setStrokeStyle(3, 0xffdd44)
      .setFillStyle(undefined as any, 0)
      .setVisible(card.selected ?? false);
    border.setName('cardBorder');
    container.add(border);

    return container;
  }

  // ---- Accessors -------------------------------------------------------------

  getCardSprites(): Phaser.GameObjects.Container[] {
    return this.cardSprites;
  }

  getPlayedCardSprites(): Phaser.GameObjects.Container[] {
    return this.playedCardSprites;
  }

  getHandContainer(): Phaser.GameObjects.Container {
    return this.handContainer;
  }

  getPlayedHandContainer(): Phaser.GameObjects.Container {
    return this.playedHandContainer;
  }

  // ---- Cleanup ---------------------------------------------------------------

  destroy(): void {
    this.cardSprites.forEach(s => s.destroy());
    this.playedCardSprites.forEach(s => s.destroy());
    this.handContainer.destroy();
    this.playedHandContainer.destroy();
  }
}

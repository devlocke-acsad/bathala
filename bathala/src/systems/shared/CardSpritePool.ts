/**
 * CardSpritePool - Reusable pool of card Phaser.Containers.
 *
 * Combat draws 8 cards every turn, and each card is a Container with
 * image/rect + several Text children.  Creating & destroying these every turn
 * generates noticeable GC spikes on mobile. This pool keeps a free-list of
 * pre-built containers that are recycled.
 *
 * @module systems/shared/CardSpritePool
 */

import Phaser from 'phaser';

/** Suit → display emoji lookup. */
const SUIT_EMOJI: Record<string, string> = {
  Apoy: '🔥', Tubig: '💧', Lupa: '🌿', Hangin: '💨',
};

/** Rank → sprite-sheet index (matches `<rank><suit>.png` naming). */
const RANK_TO_SPRITE: Record<string, string> = {
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
  Mandirigma: '11', Babaylan: '12', Datu: '13', King: '13',
};

const CARD_W = 80;
const CARD_H = 112;
const DEFAULT_POOL_SIZE = 16;

/**
 * Lightweight wrapper around a container that remembers its child refs
 * so we can reconfigure without destroying children.
 */
export interface PooledCard {
  container: Phaser.GameObjects.Container;
  /** Set to true when the card is currently in use. */
  inUse: boolean;
}

export class CardSpritePool {
  private scene: Phaser.Scene;
  private pool: PooledCard[] = [];

  constructor(scene: Phaser.Scene, initialSize: number = DEFAULT_POOL_SIZE) {
    this.scene = scene;
    this.warmUp(initialSize);
  }

  // ── public API ───────────────────────────────────────────────────────

  /**
   * Get a card container configured for the given rank/suit.
   * Recycled from pool if available, otherwise newly created.
   */
  acquire(
    rank: string,
    suit: string,
    x: number,
    y: number,
    scale: number = 1
  ): PooledCard {
    let entry = this.pool.find(p => !p.inUse);
    if (!entry) {
      entry = this.createEntry();
      this.pool.push(entry);
    }
    entry.inUse = true;
    this.configure(entry, rank, suit, x, y, scale);
    return entry;
  }

  /** Return a card to the pool for reuse. */
  release(card: PooledCard): void {
    card.inUse = false;
    card.container.setVisible(false).setActive(false);
  }

  /** Release ALL cards back to pool. */
  releaseAll(): void {
    for (const card of this.pool) {
      if (card.inUse) this.release(card);
    }
  }

  /** Destroy all pool objects (call on scene shutdown). */
  destroy(): void {
    for (const card of this.pool) {
      card.container.destroy();
    }
    this.pool = [];
  }

  /** How many cards are idle / active. */
  get stats(): { total: number; idle: number; active: number } {
    const active = this.pool.filter(c => c.inUse).length;
    return { total: this.pool.length, idle: this.pool.length - active, active };
  }

  // ── internal ─────────────────────────────────────────────────────────

  private warmUp(count: number): void {
    for (let i = 0; i < count; i++) {
      const entry = this.createEntry();
      this.pool.push(entry);
    }
  }

  private createEntry(): PooledCard {
    const container = this.scene.add.container(0, 0);
    container.setVisible(false).setActive(false);
    container.setSize(CARD_W, CARD_H);
    return { container, inUse: false };
  }

  /**
   * (Re)configure an existing pooled container to display a specific card.
   * Removes previous children and builds fresh — still cheaper than
   * full container creation because the Container object itself is reused.
   */
  private configure(
    entry: PooledCard,
    rank: string,
    suit: string,
    x: number,
    y: number,
    scale: number
  ): void {
    const c = entry.container;
    c.removeAll(true);

    const spriteRank = RANK_TO_SPRITE[rank] ?? '1';
    const spriteSuit = suit.toLowerCase();
    const textureKey = `${spriteRank}${spriteSuit}`;

    if (this.scene.textures.exists(textureKey)) {
      const img = this.scene.add.image(0, 0, textureKey);
      img.setDisplaySize(CARD_W * scale, CARD_H * scale);
      c.add(img);
    } else {
      // Fallback: generated card
      const bg = this.scene.add.rectangle(0, 0, CARD_W * scale, CARD_H * scale, 0xffffff);
      bg.setStrokeStyle(3 * scale, 0x444444);
      c.add(bg);

      const emoji = SUIT_EMOJI[suit] ?? '🔥';
      const fs = Math.floor(16 * scale);
      const efs = Math.floor(18 * scale);

      // Top-left rank + suit
      const topRank = this.scene.add.text(-30 * scale, -40 * scale, rank, {
        fontFamily: 'dungeon-mode', fontSize: `${fs}px`, color: '#000000',
      }).setOrigin(0, 0);
      const topSuit = this.scene.add.text(25 * scale, -40 * scale, emoji, {
        fontFamily: 'dungeon-mode', fontSize: `${efs}px`, color: '#000000',
      }).setOrigin(1, 0);

      // Bottom-right rank + suit (rotated 180°)
      const btmRank = this.scene.add.text(25 * scale, 40 * scale, rank, {
        fontFamily: 'dungeon-mode', fontSize: `${fs}px`, color: '#000000',
      }).setOrigin(1, 1).setRotation(Math.PI);
      const btmSuit = this.scene.add.text(-30 * scale, 40 * scale, emoji, {
        fontFamily: 'dungeon-mode', fontSize: `${efs}px`, color: '#000000',
      }).setOrigin(0, 1).setRotation(Math.PI);

      c.add([topRank, topSuit, btmRank, btmSuit]);
    }

    c.setPosition(x, y);
    c.setScale(1); // Scale is baked into child sizes
    c.setVisible(true).setActive(true).setAlpha(1);
  }
}

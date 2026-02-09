/**
 * FloatingTextPool - Reusable pool of Phaser.Text objects for floating combat
 * feedback (damage numbers, heal amounts, status text, etc.).
 *
 * Uses an internal free-list instead of destroying / re-creating Text objects
 * every frame, reducing GC pressure in the combat scene.
 *
 * @module systems/shared/FloatingTextPool
 */

import Phaser from 'phaser';

/** Options for spawning a floating text instance. */
export interface FloatingTextOptions {
  x: number;
  y: number;
  text: string;
  style?: Phaser.Types.GameObjects.Text.TextStyle;
  /** Rise distance in px (default 60). */
  rise?: number;
  /** Duration in ms (default 800). */
  duration?: number;
  /** Depth (default 9000). */
  depth?: number;
  /** Easing (default 'Cubic.easeOut'). */
  ease?: string;
  /** Optional random X scatter range ±px (default 0). */
  scatterX?: number;
}

const DEFAULT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'dungeon-mode',
  fontSize: '24px',
  color: '#ffffff',
  stroke: '#000000',
  strokeThickness: 4,
};

const DEFAULT_POOL_SIZE = 12;

export class FloatingTextPool {
  private scene: Phaser.Scene;
  private pool: Phaser.GameObjects.Text[] = [];
  private active: Set<Phaser.GameObjects.Text> = new Set();

  constructor(scene: Phaser.Scene, initialSize: number = DEFAULT_POOL_SIZE) {
    this.scene = scene;
    this.warmUp(initialSize);
  }

  // ── public API ───────────────────────────────────────────────────────

  /**
   * Spawn a floating text that rises and fades out, then returns to pool.
   */
  spawn(opts: FloatingTextOptions): Phaser.GameObjects.Text {
    const text = this.acquire();
    const rise = opts.rise ?? 60;
    const duration = opts.duration ?? 800;
    const scatter = opts.scatterX ? Phaser.Math.Between(-opts.scatterX, opts.scatterX) : 0;

    text
      .setPosition(opts.x + scatter, opts.y)
      .setText(opts.text)
      .setStyle({ ...DEFAULT_STYLE, ...opts.style })
      .setAlpha(1)
      .setScale(1)
      .setDepth(opts.depth ?? 9000)
      .setVisible(true)
      .setActive(true);

    this.scene.tweens.add({
      targets: text,
      y: opts.y - rise,
      alpha: 0,
      duration,
      ease: opts.ease ?? 'Cubic.easeOut',
      onComplete: () => this.release(text),
    });

    return text;
  }

  /** Shorthand: red damage number. */
  spawnDamage(x: number, y: number, amount: number): void {
    this.spawn({
      x, y,
      text: `-${amount}`,
      style: { color: '#ff4444', fontSize: '28px', fontStyle: 'bold' },
      rise: 70,
      scatterX: 12,
    });
  }

  /** Shorthand: green heal number. */
  spawnHeal(x: number, y: number, amount: number): void {
    this.spawn({
      x, y,
      text: `+${amount}`,
      style: { color: '#44ff44', fontSize: '24px' },
      rise: 50,
    });
  }

  /** Shorthand: blue block number. */
  spawnBlock(x: number, y: number, amount: number): void {
    this.spawn({
      x, y,
      text: `🛡${amount}`,
      style: { color: '#4488ff', fontSize: '22px' },
      rise: 40,
    });
  }

  /** Shorthand: status effect text (orange). */
  spawnStatus(x: number, y: number, label: string): void {
    this.spawn({
      x, y,
      text: label,
      style: { color: '#ffaa22', fontSize: '20px' },
      rise: 45,
      duration: 1000,
    });
  }

  /** Return pool stats (useful for debugging). */
  get stats(): { pooled: number; active: number } {
    return { pooled: this.pool.length, active: this.active.size };
  }

  /** Destroy all objects (call on scene shutdown). */
  destroy(): void {
    this.active.forEach(t => t.destroy());
    this.pool.forEach(t => t.destroy());
    this.active.clear();
    this.pool = [];
  }

  // ── internal ─────────────────────────────────────────────────────────

  private warmUp(count: number): void {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createText());
    }
  }

  private createText(): Phaser.GameObjects.Text {
    const t = this.scene.add.text(0, 0, '', DEFAULT_STYLE);
    t.setVisible(false).setActive(false);
    return t;
  }

  private acquire(): Phaser.GameObjects.Text {
    const text = this.pool.pop() ?? this.createText();
    this.active.add(text);
    return text;
  }

  private release(text: Phaser.GameObjects.Text): void {
    text.setVisible(false).setActive(false);
    this.active.delete(text);
    this.pool.push(text);
  }
}

/**
 * CursorManager - Centralised cursor-state helper.
 *
 * Every scene currently sprinkles `this.input.setDefaultCursor(…)` on hover-in
 * / hover-out.  CursorManager provides a tiny stack-like API so nested UI
 * elements don't fight each other.
 *
 * @module systems/shared/CursorManager
 */

import Phaser from 'phaser';

export type CursorStyle = 'default' | 'pointer' | 'grab' | 'grabbing' | 'not-allowed' | 'wait';

/**
 * Tracks cursor overrides with a stack so the most recent request wins,
 * and removing it restores the previous style instead of a hard 'default'.
 */
export class CursorManager {
  private scene: Phaser.Scene;
  private stack: CursorStyle[] = ['default'];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.apply();
  }

  /** Push a cursor style onto the stack (sets it immediately). */
  push(style: CursorStyle): void {
    this.stack.push(style);
    this.apply();
  }

  /** Pop the most recent override and restore previous style. */
  pop(): void {
    if (this.stack.length > 1) {
      this.stack.pop();
    }
    this.apply();
  }

  /** Force back to default (clears the full stack). */
  reset(): void {
    this.stack = ['default'];
    this.apply();
  }

  /** Current active cursor style. */
  get current(): CursorStyle {
    return this.stack[this.stack.length - 1];
  }

  // ── helpers ──────────────────────────────────────────────────────────

  /**
   * Convenience: attach hover handlers to a game-object so it shows `pointer`
   * on hover and reverts on out.
   */
  addHoverCursor(
    target: Phaser.GameObjects.GameObject,
    style: CursorStyle = 'pointer'
  ): void {
    target.on('pointerover', () => this.push(style));
    target.on('pointerout', () => this.pop());
  }

  /** Teardown. */
  destroy(): void {
    this.reset();
  }

  // ── private ──────────────────────────────────────────────────────────

  private apply(): void {
    if (this.scene?.input) {
      this.scene.input.setDefaultCursor(this.current);
    }
  }
}

/**
 * GameScene — Abstract base class for all Bathala game scenes.
 * Extends Phaser.Scene and provides shared initialisation hooks,
 * manager references, and scene-lifecycle helpers.
 *
 * Concrete subclasses: CombatScene, OverworldScene, ShopScene, etc.
 *
 * NOTE: Phaser is loaded at runtime via the global `Phaser` object.
 * During unit-tests Phaser may not be available; the test harness
 * provides a minimal mock.
 */

/**
 * Minimal abstract scene that all game scenes extend.
 * When Phaser is available, concrete subclasses should extend
 * `Phaser.Scene` directly and mix in the helpers from here.
 *
 * For the OOP-refactor milestone we define the *interface contract*
 * rather than a concrete Phaser subclass, so that the class hierarchy
 * is testable without a Phaser runtime.
 */
export abstract class GameScene {
  /** Unique scene key used by the Phaser SceneManager. */
  public readonly sceneKey: string;

  protected constructor(sceneKey: string) {
    this.sceneKey = sceneKey;
  }

  // ── Lifecycle hooks ──────────────────────────────────

  /** Called once when the scene is first created. */
  abstract init(data?: Record<string, unknown>): void;

  /** Load assets needed by the scene. */
  abstract preload(): void;

  /** Build the scene's display objects and wire up input. */
  abstract create(data?: Record<string, unknown>): void;

  /** Per-frame update loop. */
  abstract update(time: number, delta: number): void;

  /** Cleanup before the scene is destroyed. */
  shutdown(): void {
    /* override in subclass */
  }
}

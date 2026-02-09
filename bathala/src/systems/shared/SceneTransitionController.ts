/**
 * SceneTransitionController - Manages fade-in/fade-out transitions
 *
 * Centralises the overlay-based transition pattern used by Overworld → Combat,
 * Overworld → Shop, etc. Provides promises for sequencing.
 *
 * @module systems/shared/SceneTransitionController
 */

import Phaser from 'phaser';

const DEFAULT_DURATION = 600;
const OVERLAY_COLOR = 0x150E10;

export class SceneTransitionController {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Fade out the current scene with a full-screen overlay.
   * Returns the overlay object so it can be passed to the target scene.
   */
  fadeOut(duration: number = DEFAULT_DURATION): Promise<Phaser.GameObjects.Rectangle> {
    return new Promise(resolve => {
      const { width, height } = this.scene.cameras.main;
      const overlay = this.scene.add
        .rectangle(width / 2, height / 2, width, height, OVERLAY_COLOR)
        .setDepth(9999)
        .setAlpha(0);

      this.scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration,
        ease: 'Power2',
        onComplete: () => resolve(overlay),
      });
    });
  }

  /**
   * Fade in from a given overlay (passed from the originating scene).
   * Destroys the overlay when done.
   */
  fadeIn(overlay: Phaser.GameObjects.Rectangle, duration: number = DEFAULT_DURATION): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: overlay,
        alpha: 0,
        duration,
        ease: 'Power2',
        onComplete: () => {
          overlay.destroy();
          resolve();
        },
      });
    });
  }

  /**
   * Convenience: fade out, switch scene, let target scene fade in.
   * Passes the overlay rectangle in the scene data under `transitionOverlay`.
   */
  async transitionTo(
    targetScene: string,
    data: Record<string, unknown> = {},
    duration: number = DEFAULT_DURATION
  ): Promise<void> {
    const overlay = await this.fadeOut(duration);
    this.scene.scene.start(targetScene, { ...data, transitionOverlay: overlay });
  }

  /**
   * Convenience: pause this scene, launch target as overlay scene.
   */
  async launchOverlay(
    targetScene: string,
    data: Record<string, unknown> = {},
    duration: number = DEFAULT_DURATION
  ): Promise<void> {
    const overlay = await this.fadeOut(duration);
    this.scene.scene.pause();
    this.scene.scene.launch(targetScene, { ...data, transitionOverlay: overlay });
  }
}

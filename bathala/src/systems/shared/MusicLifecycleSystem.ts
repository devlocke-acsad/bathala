/**
 * MusicLifecycleSystem - Centralized music lifecycle management for Phaser scenes
 * 
 * Eliminates the ~50 lines of duplicated startMusic / setupMusicLifecycle / stopMusic
 * boilerplate that every scene (Combat, Shop, Campfire, Event, Overworld) repeats.
 * 
 * Usage:
 * ```typescript
 * // In scene create():
 * this.musicLifecycle = new MusicLifecycleSystem(this);
 * this.musicLifecycle.start();
 * 
 * // Cleanup is automatic via Phaser scene events
 * ```
 * 
 * @module systems/shared/MusicLifecycleSystem
 */

import { Scene } from 'phaser';
import { MusicManager } from '../../core/managers/MusicManager';

/**
 * Manages music playback lifecycle for a Phaser scene.
 * Automatically handles start, pause, resume, and shutdown.
 */
export class MusicLifecycleSystem {
  private scene: Scene;
  private music?: Phaser.Sound.BaseSound;
  private isSetup: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Start playing the scene's configured music track
   * and wire up lifecycle events (pause/resume/shutdown).
   */
  start(): void {
    this.startMusic();
    if (!this.isSetup) {
      this.setupLifecycle();
      this.isSetup = true;
    }
  }

  /**
   * Stop the current music track and clean up
   */
  stop(): void {
    this.stopMusic();
  }

  /**
   * Get the current music instance (if any)
   */
  getMusic(): Phaser.Sound.BaseSound | undefined {
    return this.music;
  }

  // ===========================================================================
  // INTERNAL
  // ===========================================================================

  private startMusic(): void {
    const musicManager = MusicManager.getInstance();
    const musicConfig = musicManager.getMusicKeyForScene(this.scene.scene.key);

    if (!musicConfig) {
      return;
    }

    // Don't restart if already playing the same track
    if (this.music && this.music.isPlaying) {
      return;
    }

    const effectiveVolume = musicManager.getEffectiveMusicVolume();
    const configVolume = musicConfig.volume ?? 1;
    const finalVolume = effectiveVolume * configVolume;

    try {
      this.music = this.scene.sound.add(musicConfig.musicKey, {
        volume: finalVolume,
        loop: true,
      });
      this.music.play();
    } catch (error) {
      console.warn(`MusicLifecycle: Failed to play music for ${this.scene.scene.key}:`, error);
    }
  }

  private stopMusic(): void {
    if (this.music) {
      try {
        this.music.stop();
        this.music.destroy();
      } catch {
        // Ignore errors during cleanup
      }
      this.music = undefined;
    }
  }

  private setupLifecycle(): void {
    // Stop on scene shutdown
    this.scene.events.on('shutdown', () => {
      this.stopMusic();
    });

    // Stop on scene pause (overlay opened)
    this.scene.events.on('pause', () => {
      this.stopMusic();
    });

    // Restart on scene resume (overlay closed)
    this.scene.events.on('resume', () => {
      this.startMusic();
    });

    // Stop on scene destroy
    this.scene.events.on('destroy', () => {
      this.stopMusic();
    });
  }
}

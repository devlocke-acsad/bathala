/**
 * MusicLifecycleSystem - Centralized music lifecycle management for Phaser scenes.
 */

import { Scene } from "phaser";
import { MusicSystem } from "./MusicSystem";

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
   * Start playing the scene's configured music track and wire lifecycle events.
   */
  start(): void {
    this.startMusic();
    if (!this.isSetup) {
      this.setupLifecycle();
      this.isSetup = true;
    }
  }

  /**
   * Stop current music track and clean up.
   */
  stop(): void {
    this.stopMusic();
  }

  /**
   * Get the current music instance (if any).
   */
  getMusic(): Phaser.Sound.BaseSound | undefined {
    return this.music;
  }

  private startMusic(): void {
    const musicSystem = MusicSystem.getInstance();
    const musicConfig = musicSystem.getMusicKeyForScene(this.scene.scene.key);

    if (!musicConfig) {
      return;
    }

    const effectiveVolume = musicSystem.getEffectiveMusicVolume();
    const configVolume = musicConfig.volume ?? 1;
    const finalVolume = effectiveVolume * configVolume;

    if (this.music && this.music.isPlaying) {
      try {
        const soundWithVolume = this.music as Phaser.Sound.BaseSound & {
          setVolume?: (value: number) => void;
        };
        soundWithVolume.setVolume?.(finalVolume);
      } catch {
        // ignore volume update errors
      }
      return;
    }

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
        // ignore errors during cleanup
      }
      this.music = undefined;
    }
  }

  private setupLifecycle(): void {
    this.scene.events.on("shutdown", () => {
      this.stopMusic();
    });

    this.scene.events.on("pause", () => {
      this.stopMusic();
    });

    this.scene.events.on("resume", () => {
      this.startMusic();
    });

    this.scene.events.on("destroy", () => {
      this.stopMusic();
    });
  }
}

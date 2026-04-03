/**
 * MusicLifecycleSystem - Centralized music lifecycle management for Phaser scenes.
 */

import { Scene } from "phaser";
import { MusicSystem } from "./MusicSystem";
import { GameState } from "../../core/managers/GameState";

/**
 * Manages music playback lifecycle for a Phaser scene.
 * Automatically handles start, pause, resume, and shutdown.
 */
export class MusicLifecycleSystem {
  private static persistentMusic?: Phaser.Sound.BaseSound;
  private static persistentMusicKey?: string;
  private static persistentAmbientLoops: Map<string, Phaser.Sound.BaseSound> = new Map();

  private scene: Scene;
  private music?: Phaser.Sound.BaseSound;
  private isSetup: boolean = false;
  private hasEntered: boolean = false;
  private readonly forcedActId?: number;

  constructor(scene: Scene, options?: { actId?: number }) {
    this.scene = scene;
    this.forcedActId = options?.actId;
  }

  /**
   * Start playing the scene's configured music track and wire lifecycle events.
   */
  start(): void {
    const musicSystem = MusicSystem.getInstance();

    if (!this.hasEntered) {
      musicSystem.triggerSceneEvent(this.scene, "enter");
      this.hasEntered = true;
    }

    this.startMusic();
    this.startAmbientLoops();
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
    this.stopAmbientLoops();
  }

  /**
   * Get the current music instance (if any).
   */
  getMusic(): Phaser.Sound.BaseSound | undefined {
    return this.music;
  }

  private startMusic(): void {
    const musicSystem = MusicSystem.getInstance();
    const currentChapter = this.getCurrentChapter();
    const musicConfig = musicSystem.getMusicKeyForScene(this.scene.scene.key, currentChapter);

    if (!musicConfig) {
      return;
    }

    const effectiveVolume = musicSystem.getEffectiveMusicVolume();
    const configVolume = musicConfig.volume ?? 1;
    const finalVolume = effectiveVolume * configVolume;

    if (MusicLifecycleSystem.persistentMusic && MusicLifecycleSystem.persistentMusicKey === musicConfig.musicKey) {
      this.music = MusicLifecycleSystem.persistentMusic;
      try {
        const soundWithVolume = this.music as Phaser.Sound.BaseSound & {
          setVolume?: (value: number) => void;
        };
        soundWithVolume.setVolume?.(finalVolume);
      } catch {
        // ignore volume update errors
      }

      if (!this.music.isPlaying) {
        try {
          this.music.play();
        } catch {
          // ignore replay errors
        }
      }
      return;
    }

    this.stopMusic();

    try {
      this.music = this.scene.sound.add(musicConfig.musicKey, {
        volume: finalVolume,
        loop: true,
      });
      this.music.play();
      MusicLifecycleSystem.persistentMusic = this.music;
      MusicLifecycleSystem.persistentMusicKey = musicConfig.musicKey;
    } catch (error) {
      console.warn(`MusicLifecycle: Failed to play music for ${this.scene.scene.key}:`, error);
    }
  }

  private stopMusic(): void {
    if (MusicLifecycleSystem.persistentMusic) {
      try {
        MusicLifecycleSystem.persistentMusic.stop();
        MusicLifecycleSystem.persistentMusic.destroy();
      } catch {
        // ignore errors during cleanup
      }
      MusicLifecycleSystem.persistentMusic = undefined;
      MusicLifecycleSystem.persistentMusicKey = undefined;
    }
    this.music = undefined;
  }

  private startAmbientLoops(): void {
    const musicSystem = MusicSystem.getInstance();
    const currentChapter = this.getCurrentChapter();
    const ambientKeys = musicSystem.getAmbientLoopKeysForScene(this.scene.scene.key, currentChapter);

    const desired = new Set<string>(ambientKeys);

    for (const key of desired) {
      const existing = MusicLifecycleSystem.persistentAmbientLoops.get(key);
      if (existing) {
        if (!existing.isPlaying) {
          try {
            existing.play();
          } catch {
            // ignore replay errors
          }
        }
        continue;
      }

      const sound = musicSystem.playSFX(this.scene, key, { loop: true });
      if (sound) {
        MusicLifecycleSystem.persistentAmbientLoops.set(key, sound);
      }
    }

    for (const [key, sound] of MusicLifecycleSystem.persistentAmbientLoops.entries()) {
      if (desired.has(key)) {
        continue;
      }
      try {
        sound.stop();
        sound.destroy();
      } catch {
        // ignore cleanup errors
      }
      MusicLifecycleSystem.persistentAmbientLoops.delete(key);
    }
  }

  private stopAmbientLoops(): void {
    for (const sound of MusicLifecycleSystem.persistentAmbientLoops.values()) {
      try {
        sound.stop();
        sound.destroy();
      } catch {
        // ignore errors during cleanup
      }
    }
    MusicLifecycleSystem.persistentAmbientLoops.clear();
  }

  private getCurrentChapter(): number | undefined {
    if (typeof this.forcedActId === "number") {
      return this.forcedActId;
    }

    try {
      return GameState.getInstance().getCurrentChapter();
    } catch {
      return undefined;
    }
  }

  private setupLifecycle(): void {
    this.scene.events.on("shutdown", () => {
      MusicSystem.getInstance().triggerSceneEvent(this.scene, "exit");
    });

    this.scene.events.on("pause", () => {
      MusicSystem.getInstance().triggerSceneEvent(this.scene, "pause");
    });

    this.scene.events.on("resume", () => {
      MusicSystem.getInstance().triggerSceneEvent(this.scene, "resume");
      this.startMusic();
      this.startAmbientLoops();
    });

    this.scene.events.on("destroy", () => {
      MusicSystem.getInstance().triggerSceneEvent(this.scene, "exit");
    });
  }
}

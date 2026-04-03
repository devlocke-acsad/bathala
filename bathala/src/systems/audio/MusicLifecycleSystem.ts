/**
 * MusicLifecycleSystem - Centralized music lifecycle management for Phaser scenes.
 */

import { Scene } from "phaser";
import { MusicSystem } from "./MusicSystem";
import { GameState } from "../../core/managers/GameState";

const AMBIENT_BASE_CROSSFADE_MS = 5000;
const AMBIENT_MIN_CROSSFADE_MS = 800;
const AMBIENT_MIN_PREP_MS = 1000;
const AMBIENT_TRACK_OFFSET_MS = 2200;
const AMBIENT_OFFSET_JITTER_MS = 600;
const AMBIENT_INITIAL_FADE_IN_MS = 2000;

interface AmbientSoundState {
  sound: Phaser.Sound.BaseSound;
  localVolume: number;
}

interface AmbientLayerState {
  key: string;
  scene: Scene;
  active?: AmbientSoundState;
  standby?: AmbientSoundState;
  crossfadeTimer?: Phaser.Time.TimerEvent;
  isCrossfading: boolean;
}

interface MusicLayerState {
  sound: Phaser.Sound.BaseSound;
  inputVolume: number;
}

/**
 * Manages music playback lifecycle for a Phaser scene.
 * Automatically handles start, pause, resume, and shutdown.
 */
export class MusicLifecycleSystem {
  private static persistentMusicLayers: Map<string, MusicLayerState> = new Map();
  private static persistentAmbientLoops: Map<string, AmbientLayerState> = new Map();

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
    const musicLayers = musicSystem.getMusicLayersForScene(this.scene.scene.key, currentChapter);

    if (musicLayers.length === 0) {
      this.music = undefined;
      return;
    }

    const desiredKeys = new Set<string>(musicLayers.map((layer) => layer.musicKey));

    for (const layer of musicLayers) {
      const inputVolume = layer.volume ?? 1;
      const existing = MusicLifecycleSystem.persistentMusicLayers.get(layer.musicKey);
      if (existing) {
        existing.inputVolume = inputVolume;
        this.setSoundVolume(existing.sound, musicSystem.getEffectiveVolumeForKey(layer.musicKey, inputVolume));
        if (!existing.sound.isPlaying) {
          try {
            existing.sound.play();
          } catch {
            // ignore replay errors
          }
        }
        continue;
      }

      try {
        const sound = this.scene.sound.add(layer.musicKey, {
          volume: musicSystem.getEffectiveVolumeForKey(layer.musicKey, inputVolume),
          loop: true,
        });
        sound.play();
        MusicLifecycleSystem.persistentMusicLayers.set(layer.musicKey, {
          sound,
          inputVolume,
        });
      } catch (error) {
        console.warn(`MusicLifecycle: Failed to play music layer '${layer.musicKey}' for ${this.scene.scene.key}:`, error);
      }
    }

    for (const [key, state] of MusicLifecycleSystem.persistentMusicLayers.entries()) {
      if (desiredKeys.has(key)) {
        continue;
      }
      this.destroySound(state.sound);
      MusicLifecycleSystem.persistentMusicLayers.delete(key);
    }

    const primaryLayer = musicLayers[0];
    this.music = primaryLayer
      ? MusicLifecycleSystem.persistentMusicLayers.get(primaryLayer.musicKey)?.sound
      : undefined;
  }

  private stopMusic(): void {
    for (const state of MusicLifecycleSystem.persistentMusicLayers.values()) {
      this.destroySound(state.sound);
    }
    MusicLifecycleSystem.persistentMusicLayers.clear();
    this.music = undefined;
  }

  private setSoundVolume(sound: Phaser.Sound.BaseSound, value: number): void {
    const volumeAware = sound as Phaser.Sound.BaseSound & {
      setVolume?: (input: number) => void;
    };
    volumeAware.setVolume?.(value);
  }

  private destroySound(sound: Phaser.Sound.BaseSound): void {
    try {
      sound.stop();
      sound.destroy();
    } catch {
      // ignore cleanup errors
    }
  }

  private startAmbientLoops(): void {
    const musicSystem = MusicSystem.getInstance();
    const currentChapter = this.getCurrentChapter();
    const ambientKeys = musicSystem.getAmbientLoopKeysForScene(this.scene.scene.key, currentChapter);

    const desired = new Set<string>(ambientKeys);
    let desiredIndex = 0;

    for (const key of desired) {
      const existingLayer = MusicLifecycleSystem.persistentAmbientLoops.get(key);
      if (existingLayer) {
        this.rebindAmbientLayerScene(existingLayer, this.scene);
        this.ensureAmbientLayerRunning(existingLayer, desiredIndex);
        desiredIndex += 1;
        continue;
      }

      const layer = this.createAmbientLayer(key, this.scene);
      MusicLifecycleSystem.persistentAmbientLoops.set(key, layer);
      this.startAmbientLayer(layer, this.getAmbientStartDelayMs(desiredIndex), true);
      desiredIndex += 1;
    }

    for (const [key, layer] of MusicLifecycleSystem.persistentAmbientLoops.entries()) {
      if (desired.has(key)) {
        continue;
      }
      this.destroyAmbientLayer(layer);
      MusicLifecycleSystem.persistentAmbientLoops.delete(key);
    }
  }

  private stopAmbientLoops(): void {
    for (const layer of MusicLifecycleSystem.persistentAmbientLoops.values()) {
      this.destroyAmbientLayer(layer);
    }
    MusicLifecycleSystem.persistentAmbientLoops.clear();
  }

  private createAmbientLayer(key: string, scene: Scene): AmbientLayerState {
    return {
      key,
      scene,
      isCrossfading: false,
    };
  }

  private ensureAmbientLayerRunning(layer: AmbientLayerState, orderIndex: number): void {
    if (layer.active?.sound.isPlaying) {
      this.applyAmbientVolume(layer, layer.active);
      if (layer.standby?.sound.isPlaying) {
        this.applyAmbientVolume(layer, layer.standby);
      }
      if (!layer.crossfadeTimer && !layer.isCrossfading) {
        this.scheduleNextAmbientCrossfade(layer);
      }
      return;
    }

    if (layer.standby?.sound.isPlaying) {
      layer.active = layer.standby;
      layer.standby = undefined;
      this.applyAmbientVolume(layer, layer.active);
      if (!layer.crossfadeTimer && !layer.isCrossfading) {
        this.scheduleNextAmbientCrossfade(layer);
      }
      return;
    }

    this.destroyAmbientSound(layer.active);
    this.destroyAmbientSound(layer.standby);
    layer.active = undefined;
    layer.standby = undefined;

    this.startAmbientLayer(layer, this.getAmbientStartDelayMs(orderIndex), true);
  }

  private startAmbientLayer(layer: AmbientLayerState, delayMs: number, introFade: boolean): void {
    this.clearAmbientTimer(layer);

    if (delayMs > 0) {
      layer.crossfadeTimer = layer.scene.time.delayedCall(delayMs, () => {
        layer.crossfadeTimer = undefined;
        this.beginAmbientPlayback(layer, introFade);
      });
      return;
    }

    this.beginAmbientPlayback(layer, introFade);
  }

  private beginAmbientPlayback(layer: AmbientLayerState, introFade: boolean): void {
    const sound = this.createAmbientSound(layer, introFade ? 0 : 1);
    if (!sound) {
      return;
    }

    layer.active = sound;
    layer.standby = undefined;

    if (introFade) {
      const fadeInDuration = Math.min(
        AMBIENT_INITIAL_FADE_IN_MS,
        this.getSafeCrossfadeDurationMs(sound.sound),
      );
      this.tweenAmbientVolume(layer, sound, 1, fadeInDuration);
    }

    this.scheduleNextAmbientCrossfade(layer);
  }

  private createAmbientSound(layer: AmbientLayerState, localVolume: number): AmbientSoundState | null {
    try {
      const sound = layer.scene.sound.add(layer.key, {
        volume: 0,
        loop: false,
      });
      sound.play();

      const state: AmbientSoundState = {
        sound,
        localVolume,
      };
      this.applyAmbientVolume(layer, state);
      return state;
    } catch (error) {
      console.warn(`MusicLifecycle: Failed to start ambient loop '${layer.key}':`, error);
      return null;
    }
  }

  private scheduleNextAmbientCrossfade(layer: AmbientLayerState): void {
    if (!layer.active?.sound.isPlaying) {
      return;
    }

    this.clearAmbientTimer(layer);

    const sound = layer.active.sound;
    const crossfadeMs = this.getSafeCrossfadeDurationMs(sound);
    const durationMs = this.getSoundDurationMs(sound);
    const seekMs = this.getSoundSeekMs(sound);
    const remainingMs = Math.max(AMBIENT_MIN_PREP_MS, durationMs - seekMs);

    let delayMs = remainingMs - crossfadeMs;
    if (!Number.isFinite(delayMs) || delayMs < AMBIENT_MIN_PREP_MS) {
      delayMs = Math.max(AMBIENT_MIN_PREP_MS, durationMs - crossfadeMs);
    }

    layer.crossfadeTimer = layer.scene.time.delayedCall(delayMs, () => {
      layer.crossfadeTimer = undefined;
      this.crossfadeAmbientLayer(layer);
    });
  }

  private crossfadeAmbientLayer(layer: AmbientLayerState): void {
    if (!layer.active || layer.isCrossfading) {
      return;
    }

    const incoming = this.createAmbientSound(layer, 0);
    if (!incoming) {
      this.scheduleNextAmbientCrossfade(layer);
      return;
    }

    const outgoing = layer.active;
    layer.standby = incoming;
    layer.isCrossfading = true;

    const crossfadeMs = this.getSafeCrossfadeDurationMs(outgoing.sound);

    this.tweenAmbientVolume(layer, incoming, 1, crossfadeMs);
    this.tweenAmbientVolume(layer, outgoing, 0, crossfadeMs, () => {
      this.destroyAmbientSound(outgoing);

      if (layer.active === outgoing) {
        layer.active = incoming;
        layer.standby = undefined;
      }

      layer.isCrossfading = false;
      this.scheduleNextAmbientCrossfade(layer);
    });
  }

  private tweenAmbientVolume(
    layer: AmbientLayerState,
    state: AmbientSoundState,
    target: number,
    durationMs: number,
    onComplete?: () => void,
  ): void {
    if (!state.sound.isPlaying || durationMs <= 0) {
      state.localVolume = target;
      this.applyAmbientVolume(layer, state);
      onComplete?.();
      return;
    }

    try {
      layer.scene.tweens.add({
        targets: state,
        localVolume: target,
        duration: durationMs,
        ease: "Sine.easeInOut",
        onUpdate: () => {
          this.applyAmbientVolume(layer, state);
        },
        onComplete: () => {
          state.localVolume = target;
          this.applyAmbientVolume(layer, state);
          onComplete?.();
        },
      });
    } catch {
      state.localVolume = target;
      this.applyAmbientVolume(layer, state);
      onComplete?.();
    }
  }

  private applyAmbientVolume(layer: AmbientLayerState, state: AmbientSoundState): void {
    const effective = MusicSystem.getInstance().getEffectiveVolumeForKey(layer.key, state.localVolume);
    const volumeAware = state.sound as Phaser.Sound.BaseSound & {
      setVolume?: (value: number) => void;
    };
    volumeAware.setVolume?.(effective);
  }

  private rebindAmbientLayerScene(layer: AmbientLayerState, nextScene: Scene): void {
    if (layer.scene === nextScene) {
      return;
    }

    const previousScene = layer.scene;
    this.clearAmbientTweens(layer, previousScene);
    this.clearAmbientTimer(layer);

    layer.scene = nextScene;

    if (layer.standby) {
      this.destroyAmbientSound(layer.standby);
      layer.standby = undefined;
    }

    layer.isCrossfading = false;

    if (layer.active?.sound.isPlaying) {
      layer.active.localVolume = 1;
      this.applyAmbientVolume(layer, layer.active);
      this.scheduleNextAmbientCrossfade(layer);
      return;
    }

    this.destroyAmbientSound(layer.active);
    layer.active = undefined;
  }

  private destroyAmbientLayer(layer: AmbientLayerState): void {
    this.clearAmbientTweens(layer, layer.scene);
    this.clearAmbientTimer(layer);
    this.destroyAmbientSound(layer.active);
    this.destroyAmbientSound(layer.standby);
    layer.active = undefined;
    layer.standby = undefined;
    layer.isCrossfading = false;
  }

  private destroyAmbientSound(state?: AmbientSoundState): void {
    if (!state) {
      return;
    }
    try {
      state.sound.stop();
      state.sound.destroy();
    } catch {
      // ignore cleanup errors
    }
  }

  private clearAmbientTimer(layer: AmbientLayerState): void {
    if (!layer.crossfadeTimer) {
      return;
    }
    try {
      layer.crossfadeTimer.remove(false);
    } catch {
      // ignore timer cleanup errors
    }
    layer.crossfadeTimer = undefined;
  }

  private clearAmbientTweens(layer: AmbientLayerState, scene: Scene): void {
    try {
      if (layer.active) {
        scene.tweens.killTweensOf(layer.active);
      }
      if (layer.standby) {
        scene.tweens.killTweensOf(layer.standby);
      }
    } catch {
      // ignore tween cleanup errors
    }
  }

  private getSoundDurationMs(sound: Phaser.Sound.BaseSound): number {
    const rawDuration = Number.isFinite(sound.duration) && sound.duration > 0
      ? sound.duration
      : Number.isFinite(sound.totalDuration) && sound.totalDuration > 0
        ? sound.totalDuration
        : 30;

    return Math.max(3000, Math.floor(rawDuration * 1000));
  }

  private getSoundSeekMs(sound: Phaser.Sound.BaseSound): number {
    const seekAware = sound as Phaser.Sound.BaseSound & {
      seek?: number;
    };
    const seekSeconds = typeof seekAware.seek === "number" && Number.isFinite(seekAware.seek)
      ? seekAware.seek
      : 0;
    return Math.max(0, Math.floor(seekSeconds * 1000));
  }

  private getSafeCrossfadeDurationMs(sound: Phaser.Sound.BaseSound): number {
    const durationMs = this.getSoundDurationMs(sound);
    const maxCrossfade = Math.floor(durationMs * 0.45);
    return Math.max(AMBIENT_MIN_CROSSFADE_MS, Math.min(AMBIENT_BASE_CROSSFADE_MS, maxCrossfade));
  }

  private getAmbientStartDelayMs(orderIndex: number): number {
    if (orderIndex <= 0) {
      return 0;
    }
    const jitter = Math.floor(Math.random() * (AMBIENT_OFFSET_JITTER_MS + 1));
    return orderIndex * AMBIENT_TRACK_OFFSET_MS + jitter;
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

  static refreshPersistentMix(): void {
    const audioSystem = MusicSystem.getInstance();

    for (const [key, state] of MusicLifecycleSystem.persistentMusicLayers.entries()) {
      try {
        const volumeAware = state.sound as Phaser.Sound.BaseSound & {
          setVolume?: (value: number) => void;
        };
        volumeAware.setVolume?.(audioSystem.getEffectiveVolumeForKey(key, state.inputVolume));
      } catch {
        // ignore runtime volume update errors
      }
    }

    for (const layer of MusicLifecycleSystem.persistentAmbientLoops.values()) {
      if (layer.active) {
        try {
          const volumeAware = layer.active.sound as Phaser.Sound.BaseSound & {
            setVolume?: (value: number) => void;
          };
          volumeAware.setVolume?.(audioSystem.getEffectiveVolumeForKey(layer.key, layer.active.localVolume));
        } catch {
          // ignore runtime volume update errors
        }
      }

      if (layer.standby) {
        try {
          const volumeAware = layer.standby.sound as Phaser.Sound.BaseSound & {
            setVolume?: (value: number) => void;
          };
          volumeAware.setVolume?.(audioSystem.getEffectiveVolumeForKey(layer.key, layer.standby.localVolume));
        } catch {
          // ignore runtime volume update errors
        }
      }
    }
  }
}

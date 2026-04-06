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
const AMBIENT_LAYER_FADE_IN_MS = 900;
const AMBIENT_LAYER_FADE_OUT_MS = 700;
const MUSIC_LAYER_FADE_IN_MS = 800;
const MUSIC_LAYER_FADE_OUT_MS = 650;

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
  parked: boolean;
}

interface MusicLayerState {
  sound: Phaser.Sound.BaseSound;
  inputVolume: number;
  appliedVolume: number;
  parked: boolean;
}

/**
 * Manages music playback lifecycle for a Phaser scene.
 * Automatically handles start, pause, resume, and shutdown.
 */
export class MusicLifecycleSystem {
  private static persistentMusicLayers: Map<string, MusicLayerState> = new Map();
  private static persistentAmbientLoops: Map<string, AmbientLayerState> = new Map();
  private static lastStartedSceneKey?: string;

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
    const shouldResumeFromLastPosition = this.shouldResumeFromLastPosition();

    if (!this.hasEntered) {
      musicSystem.triggerSceneEvent(this.scene, "enter");
      this.hasEntered = true;
    }

    this.startMusic(shouldResumeFromLastPosition);
    this.startAmbientLoops(shouldResumeFromLastPosition);
    MusicLifecycleSystem.lastStartedSceneKey = this.scene.scene.key;
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

  private startMusic(allowResumeFromLastPosition: boolean): void {
    const musicSystem = MusicSystem.getInstance();
    const currentChapter = this.getCurrentChapter();
    const musicLayers = musicSystem.getMusicLayersForScene(this.scene.scene.key, currentChapter);

    if (musicLayers.length === 0) {
      for (const [key, state] of MusicLifecycleSystem.persistentMusicLayers.entries()) {
        if (allowResumeFromLastPosition) {
          this.parkMusicLayer(state);
        } else {
          this.destroySound(state.sound);
          MusicLifecycleSystem.persistentMusicLayers.delete(key);
        }
      }
      this.music = undefined;
      return;
    }

    const desiredKeys = new Set<string>(musicLayers.map((layer) => layer.musicKey));

    for (const layer of musicLayers) {
      const inputVolume = layer.volume ?? 1;
      const targetVolume = musicSystem.getEffectiveVolumeForKey(layer.musicKey, inputVolume);
      const existing = MusicLifecycleSystem.persistentMusicLayers.get(layer.musicKey);

      if (existing) {
        existing.inputVolume = inputVolume;
        if (!allowResumeFromLastPosition) {
          this.destroySound(existing.sound);
          MusicLifecycleSystem.persistentMusicLayers.delete(layer.musicKey);
        } else {
          existing.parked = false;

          if (this.isSoundPaused(existing.sound)) {
            this.resumeSound(existing.sound);
          } else if (!existing.sound.isPlaying) {
            this.playSound(existing.sound);
          }

          this.tweenMusicLayerVolume(existing, targetVolume, MUSIC_LAYER_FADE_IN_MS);
          continue;
        }
      }

      try {
        const sound = this.scene.sound.add(layer.musicKey, {
          volume: 0,
          loop: true,
        });
        sound.play();
        const state: MusicLayerState = {
          sound,
          inputVolume,
          appliedVolume: 0,
          parked: false,
        };
        MusicLifecycleSystem.persistentMusicLayers.set(layer.musicKey, state);
        this.tweenMusicLayerVolume(state, targetVolume, MUSIC_LAYER_FADE_IN_MS);
      } catch (error) {
        console.warn(`MusicLifecycle: Failed to play music layer '${layer.musicKey}' for ${this.scene.scene.key}:`, error);
        continue;
      }
    }

    for (const [key, state] of MusicLifecycleSystem.persistentMusicLayers.entries()) {
      if (desiredKeys.has(key)) {
        continue;
      }

      if (allowResumeFromLastPosition) {
        this.parkMusicLayer(state);
      } else {
        this.destroySound(state.sound);
        MusicLifecycleSystem.persistentMusicLayers.delete(key);
      }
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

  private playSound(sound: Phaser.Sound.BaseSound): void {
    try {
      sound.play();
    } catch {
      // ignore play errors
    }
  }

  private resumeSound(sound: Phaser.Sound.BaseSound): void {
    const pauseAware = sound as Phaser.Sound.BaseSound & {
      resume?: () => void;
    };
    try {
      pauseAware.resume?.();
    } catch {
      // ignore resume errors
    }
  }

  private pauseSound(sound: Phaser.Sound.BaseSound): void {
    const pauseAware = sound as Phaser.Sound.BaseSound & {
      pause?: () => void;
    };
    try {
      pauseAware.pause?.();
    } catch {
      // ignore pause errors
    }
  }

  private isSoundPaused(sound: Phaser.Sound.BaseSound): boolean {
    const pauseAware = sound as Phaser.Sound.BaseSound & {
      isPaused?: boolean;
    };
    return pauseAware.isPaused === true;
  }

  private tweenMusicLayerVolume(
    state: MusicLayerState,
    targetVolume: number,
    durationMs: number,
    onComplete?: () => void,
  ): void {
    if (durationMs <= 0) {
      state.appliedVolume = targetVolume;
      this.setSoundVolume(state.sound, targetVolume);
      onComplete?.();
      return;
    }

    try {
      this.scene.tweens.killTweensOf(state);
      this.scene.tweens.add({
        targets: state,
        appliedVolume: targetVolume,
        duration: durationMs,
        ease: "Sine.easeInOut",
        onUpdate: () => {
          this.setSoundVolume(state.sound, state.appliedVolume);
        },
        onComplete: () => {
          this.setSoundVolume(state.sound, state.appliedVolume);
          onComplete?.();
        },
      });
    } catch {
      state.appliedVolume = targetVolume;
      this.setSoundVolume(state.sound, targetVolume);
      onComplete?.();
    }
  }

  private parkMusicLayer(state: MusicLayerState): void {
    if (state.parked) {
      return;
    }

    state.parked = true;
    const resumeVolume = state.appliedVolume;

    this.tweenMusicLayerVolume(state, 0, MUSIC_LAYER_FADE_OUT_MS, () => {
      this.pauseSound(state.sound);
      state.appliedVolume = resumeVolume;
    });

    // Safety net: if tween completion is skipped during rapid scene transitions,
    // force the parked layer to pause so it cannot bleed into the next scene.
    this.scene.time.delayedCall(MUSIC_LAYER_FADE_OUT_MS + 25, () => {
      if (!state.parked) {
        return;
      }
      this.setSoundVolume(state.sound, 0);
      this.pauseSound(state.sound);
      state.appliedVolume = resumeVolume;
    });
  }

  private destroySound(sound: Phaser.Sound.BaseSound): void {
    try {
      sound.stop();
      sound.destroy();
    } catch {
      // ignore cleanup errors
    }
  }

  private startAmbientLoops(allowResumeFromLastPosition: boolean): void {
    const musicSystem = MusicSystem.getInstance();
    const currentChapter = this.getCurrentChapter();
    const ambientKeys = musicSystem.getAmbientLoopKeysForScene(this.scene.scene.key, currentChapter);

    const desired = new Set<string>(ambientKeys);
    let desiredIndex = 0;

    for (const key of desired) {
      const existingLayer = MusicLifecycleSystem.persistentAmbientLoops.get(key);
      if (existingLayer) {
        if (!allowResumeFromLastPosition) {
          this.destroyAmbientLayer(existingLayer);
          MusicLifecycleSystem.persistentAmbientLoops.delete(key);
        } else {
          this.rebindAmbientLayerScene(existingLayer, this.scene);
          if (existingLayer.parked) {
            this.unparkAmbientLayer(existingLayer, desiredIndex);
            desiredIndex += 1;
            continue;
          }
          this.ensureAmbientLayerRunning(existingLayer, desiredIndex);
          desiredIndex += 1;
          continue;
        }
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

      if (allowResumeFromLastPosition) {
        this.rebindAmbientLayerScene(layer, this.scene);
        this.parkAmbientLayer(layer);
      } else {
        this.destroyAmbientLayer(layer);
        MusicLifecycleSystem.persistentAmbientLoops.delete(key);
      }
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
      parked: false,
    };
  }

  private ensureAmbientLayerRunning(layer: AmbientLayerState, orderIndex: number): void {
    if (layer.parked) {
      this.unparkAmbientLayer(layer, orderIndex);
      return;
    }

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
    layer.parked = false;

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
    if (layer.parked || !layer.active?.sound.isPlaying) {
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
    if (!layer.active || layer.isCrossfading || layer.parked) {
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

    if (layer.active?.sound && (layer.active.sound.isPlaying || this.isSoundPaused(layer.active.sound))) {
      if (!layer.parked) {
        layer.active.localVolume = 1;
        this.applyAmbientVolume(layer, layer.active);
        this.scheduleNextAmbientCrossfade(layer);
      }
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
    layer.parked = false;
  }

  private parkAmbientLayer(layer: AmbientLayerState): void {
    if (layer.parked) {
      return;
    }

    this.clearAmbientTweens(layer, layer.scene);
    this.clearAmbientTimer(layer);
    layer.parked = true;

    if (layer.standby) {
      this.destroyAmbientSound(layer.standby);
      layer.standby = undefined;
    }

    if (!layer.active || !layer.active.sound.isPlaying) {
      return;
    }

    const resumeVolume = Math.max(layer.active.localVolume, 0.05);
    this.tweenAmbientVolume(layer, layer.active, 0, AMBIENT_LAYER_FADE_OUT_MS, () => {
      layer.active!.localVolume = resumeVolume;
      this.pauseSound(layer.active!.sound);
    });

    // Safety net: guarantee parked ambient is muted+paused even if tween completion is skipped.
    layer.scene.time.delayedCall(AMBIENT_LAYER_FADE_OUT_MS + 25, () => {
      if (!layer.parked || !layer.active) {
        return;
      }
      layer.active.localVolume = resumeVolume;
      this.setSoundVolume(layer.active.sound, 0);
      this.pauseSound(layer.active.sound);
    });
  }

  private unparkAmbientLayer(layer: AmbientLayerState, orderIndex: number): void {
    layer.parked = false;

    if (!layer.active) {
      this.startAmbientLayer(layer, this.getAmbientStartDelayMs(orderIndex), true);
      return;
    }

    const target = Math.max(layer.active.localVolume, 0.05);
    layer.active.localVolume = 0;
    this.applyAmbientVolume(layer, layer.active);

    if (this.isSoundPaused(layer.active.sound)) {
      this.resumeSound(layer.active.sound);
    } else if (!layer.active.sound.isPlaying) {
      this.playSound(layer.active.sound);
    }

    this.tweenAmbientVolume(layer, layer.active, target, AMBIENT_LAYER_FADE_IN_MS, () => {
      this.scheduleNextAmbientCrossfade(layer);
    });
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
      const shouldResumeFromLastPosition = this.shouldResumeFromLastPosition();
      this.startMusic(shouldResumeFromLastPosition);
      this.startAmbientLoops(shouldResumeFromLastPosition);
    });

    this.scene.events.on("destroy", () => {
      MusicSystem.getInstance().triggerSceneEvent(this.scene, "exit");
    });
  }

  static refreshPersistentMix(): void {
    const audioSystem = MusicSystem.getInstance();

    for (const [key, state] of MusicLifecycleSystem.persistentMusicLayers.entries()) {
      if (state.parked) {
        continue;
      }
      try {
        const volumeAware = state.sound as Phaser.Sound.BaseSound & {
          setVolume?: (value: number) => void;
        };
        const effective = audioSystem.getEffectiveVolumeForKey(key, state.inputVolume);
        state.appliedVolume = effective;
        volumeAware.setVolume?.(effective);
      } catch {
        // ignore runtime volume update errors
      }
    }

    for (const layer of MusicLifecycleSystem.persistentAmbientLoops.values()) {
      if (layer.parked) {
        continue;
      }
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

  private shouldResumeFromLastPosition(): boolean {
    const profile = MusicSystem.getInstance().getSceneAudioProfile(this.scene.scene.key);

    const previousSceneKey = MusicLifecycleSystem.lastStartedSceneKey;
    if (profile?.restartMusicWhenEnteredFromScenes && previousSceneKey) {
      if (profile.restartMusicWhenEnteredFromScenes.includes(previousSceneKey)) {
        return false;
      }
    }

    if (typeof profile?.resumeFromLastPosition === "boolean") {
      return profile.resumeFromLastPosition;
    }
    return true;
  }
}

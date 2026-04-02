import { Scene } from "phaser";
import {
  AUDIO_CATALOG,
  ACTION_AUDIO_PROFILE,
  ACT_AUDIO_PROFILES,
  EVENT_AUDIO_PROFILE,
  SCENE_AUDIO_PROFILES,
  UI_AUDIO_PROFILE,
  type AudioCatalogAsset,
  type AudioChannel,
  type ActAudioProfile,
  type ActionAudioProfile,
  type EventAudioProfile,
  type SceneAudioProfile,
  type UIAudioProfile,
  validateAudioProfiles,
} from "./AudioProfiles";

/**
 * Audio asset definition for loading.
 */
export interface AudioAsset {
  key: string;
  path: string;
  type: "music" | "sfx";
}

/**
 * Scene-to-Music mapping configuration.
 */
export interface SceneMusicConfig {
  musicKey: string;
  volume: number;
  fadeIn: boolean;
}

/**
 * Sound effect configuration.
 */
export interface SoundConfig {
  volume?: number;
  rate?: number;
  loop?: boolean;
}

/**
 * AudioSystem - central audio configuration and playback helpers.
 */
export class AudioSystem {
  private static instance: AudioSystem;

  // Volume controls
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private masterVolume: number = 1.0;

  // Mute states
  private isMusicMuted: boolean = false;
  private isSFXMuted: boolean = false;
  private isMasterMuted: boolean = false;
  private readonly channelVolumes: Record<AudioChannel, number>;
  private readonly channelMuted: Record<AudioChannel, boolean>;

  private constructor() {
    this.channelVolumes = {
      ...AUDIO_CATALOG.defaultChannelVolumes,
    };
    this.channelMuted = {
      master: false,
      music: false,
      ambient: false,
      sfx: false,
      ui: false,
      voice: false,
    };
  }

  static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  // ============================================================================
  // Audio loading and assignment
  // ============================================================================

  loadAudioAssets(scene: Scene): void {
    console.log("AudioSystem: Loading audio assets...");

    for (const asset of AUDIO_CATALOG.assets) {
      console.log(`AudioSystem: Loading ${asset.type} - \"${asset.key}\" from ${asset.path}`);

      try {
        scene.load.audio(asset.key, asset.path);
      } catch (error) {
        console.error(`AudioSystem: Failed to queue audio - ${asset.key}:`, error);
      }
    }

    scene.load.on("filecomplete-audio", (key: string) => {
      console.log(`AudioSystem: Loaded audio - ${key}`);
    });

    scene.load.on("loaderror", (file: any) => {
      console.error(`AudioSystem: Failed to load audio - ${file.key} from ${file.url}`);
      console.warn("AudioSystem: Game will continue without this audio file.");
    });

    console.log(`AudioSystem: Registered ${AUDIO_CATALOG.assets.length} audio assets for loading`);
  }

  getAudioAssets(): AudioAsset[] {
    return AUDIO_CATALOG.assets.map((asset) => ({
      key: asset.key,
      path: asset.path,
      type: asset.type,
    }));
  }

  registerAudioAsset(key: string, path: string, type: "music" | "sfx"): void {
    const exists = AUDIO_CATALOG.assets.some((asset) => asset.key === key);
    if (exists) {
      console.warn(`AudioSystem: Audio key \"${key}\" already registered. Skipping.`);
      return;
    }

    AUDIO_CATALOG.assets.push({
      key,
      path,
      type,
      channel: type === "music" ? "music" : "sfx",
      baseVolume: 1,
      loop: type === "music",
      tags: [],
    });
    console.log(`AudioSystem: Registered ${type} - \"${key}\" at ${path}.`);
  }

  getMusicKeyForScene(sceneKey: string): SceneMusicConfig | null {
    const profile = SCENE_AUDIO_PROFILES[sceneKey];
    if (!profile) {
      return null;
    }

    return {
      musicKey: profile.bgmKey,
      volume: profile.bgmVolume,
      fadeIn: profile.fadeIn,
    };
  }

  getSceneMusicMap(): Record<string, SceneMusicConfig> {
    const map: Record<string, SceneMusicConfig> = {};
    for (const [sceneKey, profile] of Object.entries(SCENE_AUDIO_PROFILES)) {
      map[sceneKey] = {
        musicKey: profile.bgmKey,
        volume: profile.bgmVolume,
        fadeIn: profile.fadeIn,
      };
    }
    return map;
  }

  // ============================================================================
  // Data-driven binding scaffold
  // ============================================================================

  getSceneAudioProfile(sceneKey: string): SceneAudioProfile | null {
    return SCENE_AUDIO_PROFILES[sceneKey] ?? null;
  }

  getActAudioProfile(actId: number): ActAudioProfile | null {
    return ACT_AUDIO_PROFILES[actId] ?? null;
  }

  getUIAudioProfile(): UIAudioProfile {
    return { ...UI_AUDIO_PROFILE };
  }

  getActionAudioProfile(): ActionAudioProfile {
    return { ...ACTION_AUDIO_PROFILE };
  }

  getEventAudioProfile(): EventAudioProfile {
    return { ...EVENT_AUDIO_PROFILE };
  }

  triggerEvent(scene: Scene, eventName: string, config: SoundConfig = {}): Phaser.Sound.BaseSound | null {
    const key = EVENT_AUDIO_PROFILE[eventName];
    if (!key) {
      return null;
    }
    return this.playSFX(scene, key, config);
  }

  validateProfiles(log: boolean = true): string[] {
    const issues = validateAudioProfiles();
    if (log && issues.length > 0) {
      for (const issue of issues) {
        console.warn(`AudioSystem validation: ${issue}`);
      }
    }
    return issues;
  }

  playSFX(scene: Scene, key: string, config: SoundConfig = {}): Phaser.Sound.BaseSound | null {
    if (!scene.cache.audio.exists(key)) {
      return null;
    }

    try {
      const asset = this.getCatalogAsset(key);
      const sound = scene.sound.add(key, {
        volume: this.computeEffectiveVolume(asset, config),
        rate: config.rate,
        loop: config.loop ?? asset?.loop ?? false,
      });
      sound.play();
      return sound;
    } catch {
      return null;
    }
  }

  playUI(scene: Scene, action: keyof UIAudioProfile, config: SoundConfig = {}): Phaser.Sound.BaseSound | null {
    const key = UI_AUDIO_PROFILE[action];
    if (!key) {
      return null;
    }
    return this.playSFX(scene, key, config);
  }

  playAction(scene: Scene, action: keyof ActionAudioProfile, config: SoundConfig = {}): Phaser.Sound.BaseSound | null {
    const key = ACTION_AUDIO_PROFILE[action];
    if (!key) {
      return null;
    }
    return this.playSFX(scene, key, config);
  }

  // ============================================================================
  // Volume controls
  // ============================================================================

  setChannelVolume(channel: AudioChannel, volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.channelVolumes[channel] = clamped;
  }

  getChannelVolume(channel: AudioChannel): number {
    return this.channelVolumes[channel];
  }

  muteChannel(channel: AudioChannel): void {
    this.channelMuted[channel] = true;
  }

  unmuteChannel(channel: AudioChannel): void {
    this.channelMuted[channel] = false;
  }

  setMusicVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.musicVolume = volume;
    console.log(`AudioSystem: Music volume set to ${volume}`);
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  setSFXVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.sfxVolume = volume;
    console.log(`AudioSystem: SFX volume set to ${volume}`);
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  setMasterVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.masterVolume = volume;
    console.log(`AudioSystem: Master volume set to ${volume}`);
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getEffectiveMusicVolume(): number {
    if (this.isMusicMuted || this.isMasterMuted || this.channelMuted.master || this.channelMuted.music) {
      return 0;
    }
    return this.musicVolume * this.masterVolume * this.channelVolumes.master * this.channelVolumes.music;
  }

  getEffectiveSFXVolume(): number {
    if (this.isSFXMuted || this.isMasterMuted || this.channelMuted.master || this.channelMuted.sfx) {
      return 0;
    }
    return this.sfxVolume * this.masterVolume * this.channelVolumes.master * this.channelVolumes.sfx;
  }

  // ============================================================================
  // Mute controls
  // ============================================================================

  muteMusic(): void {
    this.isMusicMuted = true;
    console.log("AudioSystem: Music muted");
  }

  unmuteMusic(): void {
    this.isMusicMuted = false;
    console.log("AudioSystem: Music unmuted");
  }

  toggleMusicMute(): void {
    if (this.isMusicMuted) {
      this.unmuteMusic();
    } else {
      this.muteMusic();
    }
  }

  isMusicMutedState(): boolean {
    return this.isMusicMuted;
  }

  muteSFX(): void {
    this.isSFXMuted = true;
    console.log("AudioSystem: SFX muted");
  }

  unmuteSFX(): void {
    this.isSFXMuted = false;
    console.log("AudioSystem: SFX unmuted");
  }

  toggleSFXMute(): void {
    if (this.isSFXMuted) {
      this.unmuteSFX();
    } else {
      this.muteSFX();
    }
  }

  isSFXMutedState(): boolean {
    return this.isSFXMuted;
  }

  muteAll(): void {
    this.isMasterMuted = true;
    console.log("AudioSystem: All audio muted");
  }

  unmuteAll(): void {
    this.isMasterMuted = false;
    console.log("AudioSystem: All audio unmuted");
  }

  toggleMasterMute(): void {
    if (this.isMasterMuted) {
      this.unmuteAll();
    } else {
      this.muteAll();
    }
  }

  isMasterMutedState(): boolean {
    return this.isMasterMuted;
  }

  getMuteStates(): { music: boolean; sfx: boolean; master: boolean } {
    return {
      music: this.isMusicMuted,
      sfx: this.isSFXMuted,
      master: this.isMasterMuted,
    };
  }

  private getCatalogAsset(key: string): AudioCatalogAsset | undefined {
    return AUDIO_CATALOG.assets.find((asset) => asset.key === key);
  }

  private computeEffectiveVolume(asset: AudioCatalogAsset | undefined, config: SoundConfig): number {
    const channel: AudioChannel = asset?.channel ?? "sfx";

    if (this.isMasterMuted || this.channelMuted.master || this.channelMuted[channel]) {
      return 0;
    }

    const type: "music" | "sfx" = asset?.type ?? "sfx";
    if (type === "music" && this.isMusicMuted) {
      return 0;
    }
    if (type === "sfx" && this.isSFXMuted) {
      return 0;
    }

    const typeVolume = type === "music" ? this.musicVolume : this.sfxVolume;
    const channelVolume = this.channelVolumes[channel] ?? 1;
    const baseVolume = asset?.baseVolume ?? 1;
    const inputVolume = config.volume ?? 1;

    return (
      this.masterVolume *
      this.channelVolumes.master *
      typeVolume *
      channelVolume *
      baseVolume *
      inputVolume
    );
  }
}

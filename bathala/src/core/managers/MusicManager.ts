import { Scene } from "phaser";

/**
 * Audio asset definition for loading
 */
export interface AudioAsset {
  key: string;
  path: string;
  type: 'music' | 'sfx';
}

/**
 * Scene-to-Music mapping configuration
 * Defines which music track plays for each scene
 */
export interface SceneMusicConfig {
  musicKey: string;
  volume: number;
  fadeIn: boolean;
}

/**
 * Sound effect configuration
 * Exported for use by game code when playing sounds with specific settings
 */
export interface SoundConfig {
  volume?: number;
  rate?: number;
  loop?: boolean;
}

/**
 * MusicManager - Centralized audio asset management and volume control
 * 
 * Responsibilities:
 * - Audio asset registration and loading
 * - Scene-to-music mapping
 * - Volume and mute state management
 * 
 * This manager does NOT handle playback - scenes control their own audio playback.
 * 
 * Usage:
 * 1. In Preloader: Call MusicManager.getInstance().loadAudioAssets(scene) to load all audio
 * 2. In any scene: Query MusicManager.getInstance().getMusicKeyForScene(sceneKey) to get music key
 * 3. Scenes use Phaser's sound API directly: this.sound.play(musicKey, { volume, loop })
 * 
 * Scene Lifecycle for Music:
 * - create(): Call startMusic() to begin playback
 * - BEFORE scene.start(): Explicitly stop and destroy music to prevent overlap
 * - shutdown(): Also stop and destroy music as a safety net
 * - Each scene manages its own music track independently
 * 
 * CRITICAL: Always stop music BEFORE calling this.scene.start()!
 * Example:
 *   if (this.music) {
 *     this.music.stop();
 *     this.music.destroy();
 *     this.music = undefined;
 *   }
 *   this.scene.start('NextScene');
 * 
 * SFX Support:
 * - SFX can play simultaneously with music (no conflict)
 * - Use this.sound.play(sfxKey, { volume: MusicManager.getInstance().getEffectiveSFXVolume() })
 * - SFX are one-shot sounds that don't need cleanup in shutdown()
 */
export class MusicManager {
  private static instance: MusicManager;
  
  // Volume controls
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;
  private masterVolume: number = 1.0;
  
  // Mute states
  private isMusicMuted: boolean = false;
  private isSFXMuted: boolean = false;
  private isMasterMuted: boolean = false;

  /**
   * Audio Asset Registry
   * All audio files to be loaded into the game
   * Add new audio files here to make them available throughout the game
   */
  private readonly audioAssets: AudioAsset[] = [
    // === MUSIC TRACKS ===
    { 
      key: "placeholder_music", 
      path: "music/bathalaMusicPLHDR.mp3",
      type: "music"
    },
    { 
      key: "disclaimer_music", 
      path: "music/bathalaMusicPLHDR.mp3",
      type: "music"
    },
    { 
      key: "main_menu_music", 
      path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3",
      type: "music"
    },
    
    // === SOUND EFFECTS ===
    // Add SFX here as they are created
    // Example:
    // { key: "button_click", path: "sfx/ui/button_click.mp3", type: "sfx" },
    // { key: "card_draw", path: "sfx/combat/card_draw.mp3", type: "sfx" },
    // { key: "attack_slash", path: "sfx/combat/attack_slash.mp3", type: "sfx" },
  ];

  /**
   * Scene-to-Music mapping
   * Defines which music track plays for each scene
   */
  private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
    // Startup Scenes
    "Boot": { musicKey: "placeholder_music", volume: 0.4, fadeIn: false },
    "Disclaimer": { musicKey: "placeholder_music", volume: 0.4, fadeIn: false },
    
    // Main Scenes
    "MainMenu": { musicKey: "main_menu_music", volume: 0.5, fadeIn: true },
    "Overworld": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
    
    // Combat Scenes
    "Combat": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true },
    
    // Activity Scenes
    "Shop": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
    "Campfire": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
    "EventScene": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
    "Treasure": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
    
    // UI Scenes
    "GameOver": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true },
    "Credits": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true },
    "Settings": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true },
    "Discover": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true },
    
    // Tutorial
    "Prologue": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true },
  };

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance of MusicManager
   */
  static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  // ============================================================================
  // AUDIO LOADING & ASSIGNMENT
  // ============================================================================

  /**
   * Load all audio assets registered in the audioAssets array
   * This should be called from Preloader.preload()
   * 
   * @param scene - The Preloader scene instance
   */
  loadAudioAssets(scene: Scene): void {
    console.log("MusicManager: Loading audio assets...");
    
    // Load each audio asset
    // Note: Preloader sets base path to "assets" via this.load.setPath("assets")
    // so we just use the path directly (e.g., "music/file.mp3")
    for (const asset of this.audioAssets) {
      console.log(`MusicManager: Loading ${asset.type} - "${asset.key}" from ${asset.path}`);
      
      try {
        scene.load.audio(asset.key, asset.path);
      } catch (error) {
        console.error(`MusicManager: ❌ Failed to queue audio - ${asset.key}:`, error);
      }
    }
    
    // Debug: Log when audio assets are loaded
    scene.load.on('filecomplete-audio', (key: string) => {
      console.log(`MusicManager: ✅ Loaded audio - ${key}`);
    });
    
    scene.load.on('loaderror', (file: any) => {
      console.error(`MusicManager: ❌ Failed to load audio - ${file.key} from ${file.url}`);
      console.warn(`MusicManager: Game will continue without this audio file.`);
    });
    
    console.log(`MusicManager: Registered ${this.audioAssets.length} audio assets for loading`);
  }

  /**
   * Get all registered audio assets
   * Useful for debugging or UI displays
   */
  getAudioAssets(): AudioAsset[] {
    return [...this.audioAssets];
  }

  /**
   * Register a new audio asset at runtime
   * Note: This must be called before the Preloader loads assets
   * 
   * @param key - Unique identifier for the audio
   * @param path - Path to the audio file (relative to assets folder)
   * @param type - Type of audio (music or sfx)
   */
  registerAudioAsset(key: string, path: string, type: 'music' | 'sfx'): void {
    // Check if key already exists
    const exists = this.audioAssets.some(asset => asset.key === key);
    if (exists) {
      console.warn(`MusicManager: Audio key "${key}" already registered. Skipping.`);
      return;
    }
    
    this.audioAssets.push({ key, path, type });
    console.log(`MusicManager: Registered ${type} - "${key}" at ${path}`);
  }

  /**
   * Get the music key for a specific scene
   * Scenes can use this to know which music to play
   * 
   * @param sceneKey - The scene key to get music for
   * @returns The music configuration for the scene, or null if not found
   */
  getMusicKeyForScene(sceneKey: string): SceneMusicConfig | null {
    return this.sceneMusicMap[sceneKey] || null;
  }

  /**
   * Get all scene-to-music mappings
   * Useful for debugging or UI displays
   */
  getSceneMusicMap(): Record<string, SceneMusicConfig> {
    return { ...this.sceneMusicMap };
  }

  // ============================================================================
  // VOLUME CONTROLS
  // ============================================================================

  /**
   * Set the music volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setMusicVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
    this.musicVolume = volume;
    console.log(`MusicManager: Music volume set to ${volume}`);
  }

  /**
   * Get the current music volume
   */
  getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Set the SFX volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setSFXVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.sfxVolume = volume;
    console.log(`MusicManager: SFX volume set to ${volume}`);
  }

  /**
   * Get the current SFX volume
   */
  getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Set the master volume (affects all audio)
   * @param volume - Volume level (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    this.masterVolume = volume;
    console.log(`MusicManager: Master volume set to ${volume}`);
  }

  /**
   * Get the current master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Get the effective music volume (music * master)
   * Use this when playing music in scenes
   */
  getEffectiveMusicVolume(): number {
    if (this.isMusicMuted || this.isMasterMuted) {
      return 0;
    }
    return this.musicVolume * this.masterVolume;
  }

  /**
   * Get the effective SFX volume (sfx * master)
   * Use this when playing SFX in scenes
   */
  getEffectiveSFXVolume(): number {
    if (this.isSFXMuted || this.isMasterMuted) {
      return 0;
    }
    return this.sfxVolume * this.masterVolume;
  }

  // ============================================================================
  // MUTE CONTROLS
  // ============================================================================

  /**
   * Mute music only
   */
  muteMusic(): void {
    this.isMusicMuted = true;
    console.log("MusicManager: Music muted");
  }

  /**
   * Unmute music only
   */
  unmuteMusic(): void {
    this.isMusicMuted = false;
    console.log("MusicManager: Music unmuted");
  }

  /**
   * Toggle music mute state
   */
  toggleMusicMute(): void {
    if (this.isMusicMuted) {
      this.unmuteMusic();
    } else {
      this.muteMusic();
    }
  }

  /**
   * Check if music is muted
   */
  isMusicMutedState(): boolean {
    return this.isMusicMuted;
  }

  /**
   * Mute all sound effects
   */
  muteSFX(): void {
    this.isSFXMuted = true;
    console.log("MusicManager: SFX muted");
  }

  /**
   * Unmute all sound effects
   */
  unmuteSFX(): void {
    this.isSFXMuted = false;
    console.log("MusicManager: SFX unmuted");
  }

  /**
   * Toggle SFX mute state
   */
  toggleSFXMute(): void {
    if (this.isSFXMuted) {
      this.unmuteSFX();
    } else {
      this.muteSFX();
    }
  }

  /**
   * Check if SFX is muted
   */
  isSFXMutedState(): boolean {
    return this.isSFXMuted;
  }

  /**
   * Mute all audio
   */
  muteAll(): void {
    this.isMasterMuted = true;
    console.log("MusicManager: All audio muted");
  }

  /**
   * Unmute all audio
   */
  unmuteAll(): void {
    this.isMasterMuted = false;
    console.log("MusicManager: All audio unmuted");
  }

  /**
   * Toggle master mute state
   */
  toggleMasterMute(): void {
    if (this.isMasterMuted) {
      this.unmuteAll();
    } else {
      this.muteAll();
    }
  }

  /**
   * Check if master is muted
   */
  isMasterMutedState(): boolean {
    return this.isMasterMuted;
  }

  /**
   * Get all mute states
   */
  getMuteStates(): { music: boolean; sfx: boolean; master: boolean } {
    return {
      music: this.isMusicMuted,
      sfx: this.isSFXMuted,
      master: this.isMasterMuted,
    };
  }
}

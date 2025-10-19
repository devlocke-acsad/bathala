import { Scene } from "phaser";

/**
 * Scene-to-Music mapping configuration
 * Defines which music track plays for each scene
 */
interface SceneMusicConfig {
  musicKey: string;
  volume: number;
  fadeIn: boolean;
}

/**
 * MusicManager - Singleton class to manage all background music in the game
 * Automatically assigns and plays appropriate music for each scene
 * Scenes only need to call playSceneMusic() and stopMusic()
 */
export class MusicManager {
  private static instance: MusicManager;
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private currentMusicKey: string | null = null;
  private scene: Scene | null = null;
  private defaultVolume: number = 0.5;
  private isMuted: boolean = false;
  private fadeOutDuration: number = 500; // ms
  private fadeInDuration: number = 1000; // ms

  /**
   * Scene-to-Music mapping
   * All scenes use placeholder music that loops continuously
   */
  private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
    // Main Scenes
    "MainMenu": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true },
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

  /**
   * Set the current scene context for playing audio
   */
  setScene(scene: Scene): void {
    this.scene = scene;
  }

  /**
   * Play music automatically based on the current scene
   * This is the main method scenes should call
   * @param sceneKey - Optional scene key override (uses current scene if not provided)
   * @param musicKeyOverride - Optional music key override (for special cases like boss music)
   */
  playSceneMusic(sceneKey?: string, musicKeyOverride?: string): void {
    if (!this.scene) {
      console.warn("MusicManager: No scene set. Call setScene() first.");
      return;
    }

    // Determine which scene key to use
    const targetSceneKey = sceneKey || this.scene.scene.key;
    
    // If music key override is provided, use it directly
    if (musicKeyOverride) {
      const config = this.sceneMusicMap[targetSceneKey] || { volume: 0.5, fadeIn: true };
      this.play(musicKeyOverride, config.volume, config.fadeIn, true);
      return;
    }

    // Get music configuration for this scene
    const config = this.sceneMusicMap[targetSceneKey];
    
    if (!config) {
      console.warn(`MusicManager: No music configured for scene "${targetSceneKey}". Add it to sceneMusicMap.`);
      return;
    }

    // Play the configured music
    this.play(config.musicKey, config.volume, config.fadeIn, true);
  }

  /**
   * Stop the current music (scenes should call this before transitioning)
   * @param fadeOut - Whether to fade out before stopping (default: true)
   */
  stopMusic(fadeOut: boolean = true): void {
    this.stop(fadeOut);
  }

  /**
   * Play background music with optional fade-in
   * @param key - The audio key loaded in Preloader
   * @param volume - Volume level (0.0 to 1.0)
   * @param fadeIn - Whether to fade in the music
   * @param loop - Whether to loop the music (default: true)
   */
  private play(key: string, volume: number = this.defaultVolume, fadeIn: boolean = true, loop: boolean = true): void {
    if (!this.scene) {
      console.warn("MusicManager: No scene set. Call setScene() first.");
      return;
    }

    // If the same music is already playing, don't restart it
    if (this.currentMusicKey === key && this.currentMusic && this.currentMusic.isPlaying) {
      console.log(`MusicManager: Music "${key}" is already playing.`);
      return;
    }

    // Stop current music with fade out
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.stop(true);
    }

    // Check if the audio key exists
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`MusicManager: Audio key "${key}" not found. Make sure it's loaded in Preloader.`);
      return;
    }

    // Create and play new music
    this.currentMusic = this.scene.sound.add(key, {
      loop: loop,
      volume: this.isMuted ? 0 : (fadeIn ? 0 : volume),
    });

    this.currentMusicKey = key;
    this.currentMusic.play();

    // Fade in if requested
    if (fadeIn && !this.isMuted) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: volume,
        duration: this.fadeInDuration,
        ease: "Linear",
      });
    }

    console.log(`MusicManager: Playing "${key}" (volume: ${volume}, fadeIn: ${fadeIn}, loop: ${loop})`);
  }

  /**
   * Stop the current music with optional fade-out
   * @param fadeOut - Whether to fade out before stopping
   */
  stop(fadeOut: boolean = true): void {
    if (!this.currentMusic || !this.scene) {
      return;
    }

    if (fadeOut) {
      // Fade out then stop
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: this.fadeOutDuration,
        ease: "Linear",
        onComplete: () => {
          if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic.destroy();
            this.currentMusic = null;
            this.currentMusicKey = null;
          }
        },
      });
    } else {
      // Stop immediately
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentMusicKey = null;
    }

    console.log("MusicManager: Music stopped");
  }

  /**
   * Pause the current music
   */
  pause(): void {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
      console.log("MusicManager: Music paused");
    }
  }

  /**
   * Resume the paused music
   */
  resume(): void {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
      console.log("MusicManager: Music resumed");
    }
  }

  /**
   * Set the volume of the current music
   * @param volume - Volume level (0.0 to 1.0)
   * @param smooth - Whether to smoothly transition to the new volume
   */
  setVolume(volume: number, smooth: boolean = true): void {
    if (!this.currentMusic || this.isMuted) {
      return;
    }

    volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

    if (smooth && this.scene) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: volume,
        duration: 300,
        ease: "Linear",
      });
    } else if (this.currentMusic) {
      (this.currentMusic as any).volume = volume;
    }

    this.defaultVolume = volume;
    console.log(`MusicManager: Volume set to ${volume}`);
  }

  /**
   * Mute all music
   */
  mute(): void {
    this.isMuted = true;
    if (this.currentMusic) {
      (this.currentMusic as any).volume = 0;
    }
    console.log("MusicManager: Music muted");
  }

  /**
   * Unmute all music
   */
  unmute(): void {
    this.isMuted = false;
    if (this.currentMusic) {
      (this.currentMusic as any).volume = this.defaultVolume;
    }
    console.log("MusicManager: Music unmuted");
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if music is currently playing
   */
  isPlaying(): boolean {
    return this.currentMusic !== null && this.currentMusic.isPlaying;
  }

  /**
   * Get the current music key
   */
  getCurrentMusicKey(): string | null {
    return this.currentMusicKey;
  }

  /**
   * Get the current volume
   */
  getVolume(): number {
    return this.defaultVolume;
  }

  /**
   * Check if music is muted
   */
  isMusicMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Set fade durations
   */
  setFadeDurations(fadeOut: number, fadeIn: number): void {
    this.fadeOutDuration = fadeOut;
    this.fadeInDuration = fadeIn;
  }

  /**
   * Crossfade from current music to new music
   * @param key - The new audio key to play
   * @param volume - Volume level for the new music
   */
  crossfade(key: string, volume: number = this.defaultVolume): void {
    if (!this.scene) {
      console.warn("MusicManager: No scene set for crossfade.");
      return;
    }

    // If same music, don't crossfade
    if (this.currentMusicKey === key) {
      return;
    }

    const oldMusic = this.currentMusic;
    
    // Start new music at 0 volume
    this.currentMusic = null; // Temporarily clear to allow play() to work
    this.currentMusicKey = null;
    this.play(key, volume, true, true);

    // Fade out old music
    if (oldMusic && this.scene) {
      this.scene.tweens.add({
        targets: oldMusic,
        volume: 0,
        duration: this.fadeOutDuration,
        ease: "Linear",
        onComplete: () => {
          oldMusic.stop();
          oldMusic.destroy();
        },
      });
    }

    console.log(`MusicManager: Crossfading to "${key}"`);
  }

  /**
   * Stop all sounds in the scene (including music and SFX)
   */
  stopAll(): void {
    if (this.scene) {
      this.scene.sound.stopAll();
      this.currentMusic = null;
      this.currentMusicKey = null;
      console.log("MusicManager: All sounds stopped");
    }
  }

  /**
   * Reset the music manager (useful for scene cleanup)
   */
  reset(): void {
    this.stop(false);
    this.scene = null;
    this.isMuted = false;
    this.defaultVolume = 0.5;
    console.log("MusicManager: Reset complete");
  }
}

import { MusicManager } from './MusicManager';

export type Toggle = boolean;

export interface GameSettings {
  // Audio
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  sfxVolume: number;    // 0..1
  muteMaster: Toggle;
  muteMusic: Toggle;
  muteSfx: Toggle;

  // Video
  fullscreen: Toggle;

  // Accessibility / UX
  showScanlines: Toggle;
  reducedMotion: Toggle;
}

const STORAGE_KEY = 'bathala_settings_v1';

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 1.0,
  musicVolume: 0.5,
  sfxVolume: 0.7,
  muteMaster: false,
  muteMusic: false,
  muteSfx: false,
  fullscreen: false,
  showScanlines: true,
  reducedMotion: false,
};

function clamp01(n: number): number {
  if (typeof n !== 'number' || Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private constructor() {
    // singleton
    this.load();
  }

  get(): GameSettings {
    return { ...this.settings };
  }

  set(partial: Partial<GameSettings>): GameSettings {
    const next: GameSettings = {
      ...this.settings,
      ...partial,
    };

    next.masterVolume = clamp01(next.masterVolume);
    next.musicVolume = clamp01(next.musicVolume);
    next.sfxVolume = clamp01(next.sfxVolume);

    this.settings = next;
    this.save();
    return this.get();
  }

  resetToDefaults(): GameSettings {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    return this.get();
  }

  load(): GameSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.get();
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      // Validate + merge
      this.settings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        masterVolume: clamp01(parsed.masterVolume ?? DEFAULT_SETTINGS.masterVolume),
        musicVolume: clamp01(parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume),
        sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
      };
      return this.get();
    } catch {
      // Ignore storage/parse errors; keep defaults
      this.settings = { ...DEFAULT_SETTINGS };
      return this.get();
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage quota/permissions issues
    }
  }

  /**
   * Apply current settings to global managers.
   * Music volume is applied via MusicLifecycleSystem (effective volume).
   */
  applyToAudio(): void {
    const mm = MusicManager.getInstance();
    mm.setMasterVolume(this.settings.masterVolume);
    mm.setMusicVolume(this.settings.musicVolume);
    mm.setSFXVolume(this.settings.sfxVolume);

    // Mutes
    if (this.settings.muteMaster) mm.muteAll();
    else mm.unmuteAll();

    if (this.settings.muteMusic) mm.muteMusic();
    else mm.unmuteMusic();

    if (this.settings.muteSfx) mm.muteSFX();
    else mm.unmuteSFX();
  }
}


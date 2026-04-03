import { AudioSystem } from '../../systems/audio/AudioSystem';
import { MusicLifecycleSystem } from '../../systems/audio/MusicLifecycleSystem';

export type Toggle = boolean;

export interface GameSettings {
  // Audio
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  ambientVolume: number; // 0..1
  sfxVolume: number;    // 0..1
  uiVolume: number;     // 0..1
  voiceVolume: number;  // 0..1
  muteMaster: Toggle;
  muteMusic: Toggle;
  muteAmbient: Toggle;
  muteSfx: Toggle;
  muteUi: Toggle;
  muteVoice: Toggle;

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
  ambientVolume: 0.8,
  sfxVolume: 0.7,
  uiVolume: 1.0,
  voiceVolume: 1.0,
  muteMaster: false,
  muteMusic: false,
  muteAmbient: false,
  muteSfx: false,
  muteUi: false,
  muteVoice: false,
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
    next.ambientVolume = clamp01(next.ambientVolume);
    next.sfxVolume = clamp01(next.sfxVolume);
    next.uiVolume = clamp01(next.uiVolume);
    next.voiceVolume = clamp01(next.voiceVolume);

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
        ambientVolume: clamp01(parsed.ambientVolume ?? DEFAULT_SETTINGS.ambientVolume),
        sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
        uiVolume: clamp01(parsed.uiVolume ?? DEFAULT_SETTINGS.uiVolume),
        voiceVolume: clamp01(parsed.voiceVolume ?? DEFAULT_SETTINGS.voiceVolume),
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
   * Any active persistent music/ambient loops are refreshed after changes.
   */
  applyToAudio(): void {
    const audioSystem = AudioSystem.getInstance();
    audioSystem.setMasterVolume(this.settings.masterVolume);
    audioSystem.setMusicVolume(this.settings.musicVolume);
    audioSystem.setSFXVolume(this.settings.sfxVolume);
    audioSystem.setChannelVolume('ambient', this.settings.ambientVolume);
    audioSystem.setChannelVolume('ui', this.settings.uiVolume);
    audioSystem.setChannelVolume('voice', this.settings.voiceVolume);

    // Mutes
    if (this.settings.muteMaster) audioSystem.muteAll();
    else audioSystem.unmuteAll();

    if (this.settings.muteMusic) audioSystem.muteMusic();
    else audioSystem.unmuteMusic();

    if (this.settings.muteSfx) audioSystem.muteSFX();
    else audioSystem.unmuteSFX();

    if (this.settings.muteAmbient) audioSystem.muteChannel('ambient');
    else audioSystem.unmuteChannel('ambient');

    if (this.settings.muteUi) audioSystem.muteChannel('ui');
    else audioSystem.unmuteChannel('ui');

    if (this.settings.muteVoice) audioSystem.muteChannel('voice');
    else audioSystem.unmuteChannel('voice');

    MusicLifecycleSystem.refreshPersistentMix();
  }
}


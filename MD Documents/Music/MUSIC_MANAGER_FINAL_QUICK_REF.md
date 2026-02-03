# MusicManager Quick Reference

## 🎯 Core Responsibilities
- ✅ **Audio Asset Registration** - Define all audio files centrally
- ✅ **Scene-to-Music Mapping** - Map scenes to their audio tracks
- ✅ **Loading Audio** - Load audio assets via Preloader
- ✅ **Volume Control** - Manage music/SFX/master volume
- ✅ **Mute State Storage** - Store and retrieve mute states
- ❌ **NO Playback Control** - Scenes handle play/stop/pause/mute application

---

## 📦 Interfaces

```typescript
interface AudioAsset {
  key: string;        // Unique audio key
  path: string;       // Path to audio file
  type: 'music' | 'sfx';
}

interface SceneMusicConfig {
  musicKey: string;   // Key from audioAssets
  volume: number;     // 0.0 - 1.0 (informational only)
  fadeIn: boolean;    // Should fade in on start (informational only)
}

interface SoundConfig {
  volume?: number;    // 0.0 - 1.0
  rate?: number;      // Playback speed
  loop?: boolean;     // Loop the sound
}
```

---

## 🔑 Key Methods

### Loading & Registration
```typescript
// In Preloader.ts
MusicManager.getInstance().loadAudioAssets(this);
```

### Scene Queries
```typescript
// Get music key for current scene
const musicKey = MusicManager.getInstance().getMusicKeyForScene("Combat");

// Get all scene mappings (for debugging)
const allMappings = MusicManager.getInstance().getSceneMusicMap();
```

### Volume Control
```typescript
// Set volumes (0.0 - 1.0)
manager.setMusicVolume(0.8);
manager.setSFXVolume(0.6);
manager.setMasterVolume(1.0);

// Get volumes
const musicVol = manager.getMusicVolume();
const sfxVol = manager.getSFXVolume();
const masterVol = manager.getMasterVolume();

// Get effective volumes (with mute states applied)
const effectiveMusicVol = manager.getEffectiveMusicVolume();
const effectiveSFXVol = manager.getEffectiveSFXVolume();
```

### Mute State Storage
```typescript
// Set mute states (does NOT affect playback - scenes must check states)
manager.muteMusic();
manager.unmuteMusic();
manager.muteSFX();
manager.unmuteSFX();
manager.muteAll();
manager.unmuteAll();

// Toggle states
manager.toggleMusicMute();
manager.toggleSFXMute();
manager.toggleMasterMute();

// Check individual states
const isMusicMuted = manager.isMusicMutedState();
const isSFXMuted = manager.isSFXMutedState();
const isMasterMuted = manager.isMasterMutedState();

// Get all states at once
const states = manager.getMuteStates(); // { music, sfx, master }
```

---

## 🎮 Scene Usage Pattern

### Simplified (Using Effective Volume)
```typescript
// In any scene's create() method
const manager = MusicManager.getInstance();

// Get the music key for this scene
const musicKey = manager.getMusicKeyForScene(this.scene.key);

if (musicKey) {
  // Use getEffectiveMusicVolume() - it handles mute states automatically
  this.music = this.sound.add(musicKey, { 
    volume: manager.getEffectiveMusicVolume(),
    loop: true 
  });
  this.music.play();
}

// For SFX
playSoundEffect(key: string) {
  const manager = MusicManager.getInstance();
  this.sound.play(key, { 
    volume: manager.getEffectiveSFXVolume()
  });
}
```

### Manual (Checking Mute States Yourself)
```typescript
// If you need custom logic
const manager = MusicManager.getInstance();
const musicKey = manager.getMusicKeyForScene(this.scene.key);

if (musicKey) {
  const states = manager.getMuteStates();
  const volume = states.music || states.master 
    ? 0 
    : manager.getMusicVolume() * manager.getMasterVolume();
  
  this.music = this.sound.add(musicKey, { volume, loop: true });
  this.music.play();
}
```

### Responding to Volume/Mute Changes
```typescript
// When user changes settings, update playing sounds
updateMusicVolume() {
  if (this.music) {
    this.music.setVolume(MusicManager.getInstance().getEffectiveMusicVolume());
  }
}

// Call this from your settings UI
```

---

## 🏗️ Adding New Audio

### 1. Add to audioAssets array in MusicManager.ts:
```typescript
private audioAssets: AudioAsset[] = [
  { key: "newMusic", path: "assets/audio/music/new.mp3", type: "music" },
  { key: "newSFX", path: "assets/audio/sfx/new.mp3", type: "sfx" },
];
```

### 2. Map to scene (if music) in sceneMusicMap:
```typescript
private sceneMusicMap: Map<string, SceneMusicConfig> = new Map([
  ["NewScene", { musicKey: "newMusic", volume: 0.7, fadeIn: true }],
]);
```

**Note**: `volume` and `fadeIn` in SceneMusicConfig are informational - scenes must implement fade logic themselves.

---

## ⚠️ What MusicManager Does NOT Do
- ❌ Play audio
- ❌ Stop audio
- ❌ Pause/resume audio
- ❌ Crossfade audio
- ❌ Track active sounds
- ❌ Apply mute states to sounds (stores state only)
- ❌ Update volume on playing sounds
- ❌ Handle scene reference

**Scenes are fully responsible for playback, volume changes, and mute application using Phaser's `this.sound` API.**

---

## 📋 Complete Scene Template

```typescript
export default class MyScene extends Phaser.Scene {
  private music?: Phaser.Sound.BaseSound;
  private manager: MusicManager;

  create() {
    this.manager = MusicManager.getInstance();
    this.startMusic();
  }

  startMusic() {
    const musicKey = this.manager.getMusicKeyForScene(this.scene.key);
    if (!musicKey) return;

    this.music = this.sound.add(musicKey, {
      volume: this.manager.getEffectiveMusicVolume(),
      loop: true
    });
    this.music.play();
  }

  // Called when user changes volume in settings
  onVolumeChanged() {
    if (this.music) {
      this.music.setVolume(this.manager.getEffectiveMusicVolume());
    }
  }

  // Called when user toggles mute in settings
  onMuteToggled() {
    if (this.music) {
      this.music.setVolume(this.manager.getEffectiveMusicVolume());
    }
  }

  playSFX(key: string) {
    this.sound.play(key, {
      volume: this.manager.getEffectiveSFXVolume()
    });
  }

  shutdown() {
    if (this.music) {
      this.music.stop();
      this.music = undefined;
    }
  }
}
```

---

## 🔄 Comparison: Before vs After

### Before (Old MusicManager)
```typescript
// Scene had to do nothing
create() {
  MusicManager.getInstance().setScene(this);
  MusicManager.getInstance().playSceneMusic();
}
```

### After (New MusicManager)
```typescript
// Scene controls playback
create() {
  const manager = MusicManager.getInstance();
  const musicKey = manager.getMusicKeyForScene(this.scene.key);
  
  if (musicKey) {
    this.music = this.sound.add(musicKey, {
      volume: manager.getEffectiveMusicVolume(),
      loop: true
    });
    this.music.play();
  }
}

shutdown() {
  if (this.music) {
    this.music.stop();
    this.music = undefined;
  }
}
```

---

## 📊 API Surface

### Total Methods: 20
- **Loading**: 1 method (`loadAudioAssets`)
- **Queries**: 2 methods (`getMusicKeyForScene`, `getSceneMusicMap`)
- **Volume**: 8 methods (set/get for music/sfx/master + 2 effective volume getters)
- **Mute States**: 9 methods (mute/unmute/toggle for music/sfx/master + state getters)

### Total Properties: 5
- `musicVolume`, `sfxVolume`, `masterVolume`
- `isMusicMuted`, `isSFXMuted`, `isMasterMuted`

### Total Lines: ~408 (down from ~1,061)

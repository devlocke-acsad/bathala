# MusicManager Quick Reference (Simplified)

## Setup (One Time)

### In Preloader.ts
```typescript
import { MusicManager } from "../../core/managers/MusicManager";

preload() {
  // Load all audio assets
  MusicManager.getInstance().loadAudioAssets(this);
}
```

## Usage (Every Scene)

### Basic Scene Setup
```typescript
import { MusicManager } from "../../core/managers/MusicManager";

create() {
  // 1. Set scene context
  MusicManager.getInstance().setScene(this);
  
  // 2. Play scene music
  MusicManager.getInstance().playSceneMusic();
}
```

## Common Tasks

### Play Sound Effect
```typescript
// Simple
MusicManager.getInstance().playSFX("button_click");

// With options
MusicManager.getInstance().playSFX("sword_slash", {
  volume: 0.8,
  rate: 1.2,
  loop: false
});
```

### Play Music Override
```typescript
// Boss music
MusicManager.getInstance().playSceneMusic(undefined, "boss_music");

// Return to normal
MusicManager.getInstance().playSceneMusic();
```

### Volume Control
```typescript
// Set music volume
MusicManager.getInstance().setMusicVolume(0.7, true);

// Set SFX volume
MusicManager.getInstance().setSFXVolume(0.8);

// Set master volume
MusicManager.getInstance().setMasterVolume(0.9);
```

### Mute Control
```typescript
// Toggle music mute
MusicManager.getInstance().toggleMusicMute();

// Toggle SFX mute
MusicManager.getInstance().toggleSFXMute();

// Toggle all audio
MusicManager.getInstance().toggleMasterMute();
```

## Adding New Audio

### Step 1: Register in MusicManager.ts
```typescript
private readonly audioAssets: AudioAsset[] = [
  // Add here
  { 
    key: "new_music", 
    path: "music/new_music.mp3",
    type: "music"
  },
  { 
    key: "new_sfx", 
    path: "sfx/new_sfx.mp3",
    type: "sfx"
  },
];
```

### Step 2: (Optional) Map to Scene
```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  // Add here
  "NewScene": { 
    musicKey: "new_music", 
    volume: 0.5, 
    fadeIn: true 
  },
};
```

### Step 3: Use It
```typescript
// If mapped to scene
MusicManager.getInstance().playSceneMusic();

// Or play directly
MusicManager.getInstance().playSFX("new_sfx");
```

## Essential API Cheat Sheet

| Task | Code |
|------|------|
| **Load audio** | `MusicManager.getInstance().loadAudioAssets(this)` |
| **Set scene** | `MusicManager.getInstance().setScene(this)` |
| **Play scene music** | `MusicManager.getInstance().playSceneMusic()` |
| **Play music override** | `MusicManager.getInstance().playSceneMusic(undefined, "key")` |
| **Play SFX** | `MusicManager.getInstance().playSFX("key")` |
| **Stop music** | `MusicManager.getInstance().stopMusic(true)` |
| **Pause music** | `MusicManager.getInstance().pauseMusic()` |
| **Resume music** | `MusicManager.getInstance().resumeMusic()` |
| **Set music volume** | `MusicManager.getInstance().setMusicVolume(0.7, true)` |
| **Set SFX volume** | `MusicManager.getInstance().setSFXVolume(0.8)` |
| **Set master volume** | `MusicManager.getInstance().setMasterVolume(0.9)` |
| **Toggle music mute** | `MusicManager.getInstance().toggleMusicMute()` |
| **Toggle SFX mute** | `MusicManager.getInstance().toggleSFXMute()` |
| **Toggle all mute** | `MusicManager.getInstance().toggleMasterMute()` |
| **Stop all audio** | `MusicManager.getInstance().stopAll()` |
| **Get mute states** | `MusicManager.getInstance().getMuteStates()` |

## SoundConfig Options

```typescript
interface SoundConfig {
  volume?: number;  // 0.0 to 1.0
  rate?: number;    // Playback speed (1.0 = normal)
  loop?: boolean;   // Loop the sound
}
```

## File Locations

- **MusicManager:** `src/core/managers/MusicManager.ts`
- **Audio Assets:** `bathala/public/assets/music/` or `bathala/public/assets/sfx/`
- **Preloader:** `src/game/scenes/Preloader.ts`

## Common Errors

| Error | Solution |
|-------|----------|
| "No scene set" | Call `setScene(this)` before playing audio |
| "Audio key not found" | Register audio in `audioAssets[]` in MusicManager |
| "Music not playing" | Check mute status, volume, and browser autoplay policy |
| "Wrong music playing" | Check `sceneMusicMap` for scene mapping |

## What's Different (Simplified Version)

**Removed Features:**
- ❌ Spatial/positional audio
- ❌ Audio sprites
- ❌ Sound pooling
- ❌ Advanced controls (detune, global rate, etc.)

**Kept Features:**
- ✅ Audio loading & registration
- ✅ Scene-based music assignment
- ✅ Music & SFX playback
- ✅ Volume & mute controls
- ✅ Crossfading

---

**Full Documentation:** See `MUSIC_MANAGER_REFACTOR.md` and `MUSIC_MANAGER_SIMPLIFICATION.md`

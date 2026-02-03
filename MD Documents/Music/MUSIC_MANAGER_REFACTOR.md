# MusicManager Refactor - Complete Guide

## Overview
The `MusicManager` has been completely refactored to be the **single source of truth** for all audio in the game. It now handles:
- ✅ **Audio asset registration and loading**
- ✅ **Scene-based music assignment**
- ✅ **Audio playback management**
- ✅ **Volume and mute controls**
- ✅ **Sound effect pooling**
- ✅ **Spatial audio support**

## Architecture

### Previous System (❌ Deprecated)
```
Preloader.ts
  ↓ Manually loads audio with this.load.audio()
  ↓ Hardcoded paths and keys
  ↓ Scene doesn't know what audio exists
```

### New System (✅ Current)
```
MusicManager (Centralized)
  ↓ Defines all audio assets in audioAssets[]
  ↓ Provides loadAudioAssets() method
  ↓ 
Preloader.ts
  ↓ Calls MusicManager.getInstance().loadAudioAssets(this)
  ↓ Audio loaded and ready
  ↓
Any Scene
  ↓ Calls MusicManager.getInstance().playSceneMusic()
  ↓ Music plays automatically based on scene
```

## Key Changes

### 1. **Centralized Audio Asset Registry**
All audio files are now registered in `MusicManager.ts`:

```typescript
private readonly audioAssets: AudioAsset[] = [
  // === MUSIC TRACKS ===
  { 
    key: "placeholder_music", 
    path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3",
    type: "music"
  },
  { 
    key: "disclaimer_music", 
    path: "music/bathala_disclaimer.mp3",
    type: "music"
  },
  
  // === SOUND EFFECTS ===
  // Add SFX here as they are created
  // { key: "button_click", path: "sfx/ui/button_click.mp3", type: "sfx" },
];
```

**Benefits:**
- Single source of truth for all audio
- Easy to see all audio assets at a glance
- Type-safe audio references
- Prevents duplicate keys
- Makes adding new audio trivial

### 2. **Automatic Loading in Preloader**
Preloader now delegates audio loading to MusicManager:

```typescript
// OLD (Preloader.ts) ❌
this.load.audio("placeholder_music", "music/Bathala_Soundtrack/Bathala_MainMenu.mp3");
this.load.audio("disclaimer_music", "music/bathala_disclaimer.mp3");

// NEW (Preloader.ts) ✅
MusicManager.getInstance().loadAudioAssets(this);
```

**Benefits:**
- No more manual load.audio() calls in Preloader
- MusicManager handles all asset paths
- Automatic logging of loaded assets
- Cleaner Preloader code

### 3. **Scene-Based Music Assignment**
Music is automatically assigned to scenes via `sceneMusicMap`:

```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  "Boot": { musicKey: "disclaimer_music", volume: 0.4, fadeIn: false },
  "Disclaimer": { musicKey: "disclaimer_music", volume: 0.4, fadeIn: false },
  "MainMenu": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true },
  "Overworld": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true },
  "Combat": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true },
  // ... more scenes
};
```

**Usage in any scene:**
```typescript
create() {
  // Set scene context
  MusicManager.getInstance().setScene(this);
  
  // Play appropriate music automatically
  MusicManager.getInstance().playSceneMusic();
}
```

**Benefits:**
- No more hardcoding music keys in scenes
- Centralized music configuration
- Easy to change music for any scene
- Automatic volume and fade settings

### 4. **Audio Playback API**
MusicManager provides a comprehensive API for audio playback:

```typescript
// Play scene-appropriate music
MusicManager.getInstance().playSceneMusic();

// Play specific music (override)
MusicManager.getInstance().playSceneMusic("Combat", "boss_music");

// Play sound effects
MusicManager.getInstance().playSFX("button_click", { volume: 0.8 });

// Play from sound pool (optimized for frequent effects)
MusicManager.getInstance().playSFXFromPool("card_draw");

// Volume controls
MusicManager.getInstance().setVolume(0.7, true); // Music volume
MusicManager.getInstance().setSFXVolume(0.8, true); // SFX volume
MusicManager.getInstance().setMasterVolume(0.9, true); // Master volume

// Mute controls
MusicManager.getInstance().toggleMute(); // Toggle music mute
MusicManager.getInstance().toggleSFXMute(); // Toggle SFX mute
MusicManager.getInstance().toggleMasterMute(); // Toggle all audio
```

## Migration Guide

### For Developers: Adding New Audio

#### **Step 1: Register the Audio Asset**
Add your audio file to `audioAssets[]` in `MusicManager.ts`:

```typescript
private readonly audioAssets: AudioAsset[] = [
  // ... existing assets
  
  // Your new audio
  { 
    key: "combat_music", 
    path: "music/combat/combat_theme.mp3",
    type: "music"
  },
  { 
    key: "sword_slash", 
    path: "sfx/combat/sword_slash.mp3",
    type: "sfx"
  },
];
```

#### **Step 2: (Optional) Assign to Scene**
If it's music for a specific scene, add it to `sceneMusicMap`:

```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  // ... existing mappings
  
  "BossEncounter": { 
    musicKey: "combat_music", 
    volume: 0.6, 
    fadeIn: true 
  },
};
```

#### **Step 3: Use It**
```typescript
// In your scene
create() {
  MusicManager.getInstance().setScene(this);
  
  // For music (if mapped to scene)
  MusicManager.getInstance().playSceneMusic();
  
  // For SFX
  MusicManager.getInstance().playSFX("sword_slash");
}
```

### For Scenes: Playing Audio

#### **Music Playback**
```typescript
// Standard usage - plays music based on scene
create() {
  MusicManager.getInstance().setScene(this);
  MusicManager.getInstance().playSceneMusic();
}

// Override for special cases (e.g., boss music)
enterBossPhase() {
  MusicManager.getInstance().playSceneMusic(undefined, "boss_music");
}
```

#### **Sound Effect Playback**
```typescript
// Simple SFX
onButtonClick() {
  MusicManager.getInstance().playSFX("button_click");
}

// SFX with config
onAttack() {
  MusicManager.getInstance().playSFX("sword_slash", {
    volume: 0.9,
    rate: 1.2 // Play faster
  });
}

// Pooled SFX (for frequently played sounds)
onCardDraw() {
  MusicManager.getInstance().playSFXFromPool("card_draw");
}
```

#### **Spatial Audio**
```typescript
// Play sound at a position
onExplosion(x: number, y: number) {
  MusicManager.getInstance().playSFX("explosion", {
    source: {
      x: x,
      y: y,
      refDistance: 100,
      maxDistance: 500,
      rolloffFactor: 1
    }
  });
}

// Follow a game object
onMonsterRoar(monster: Phaser.GameObjects.Sprite) {
  MusicManager.getInstance().playSFX("roar", {
    source: {
      follow: monster
    }
  });
}
```

## API Reference

### Core Methods

#### `loadAudioAssets(scene: Scene): void`
Load all registered audio assets. **Call this from Preloader.preload()**.

```typescript
// Preloader.ts
preload() {
  // ... other assets
  MusicManager.getInstance().loadAudioAssets(this);
}
```

#### `setScene(scene: Scene): void`
Set the current scene context. **Call this in every scene's create()**.

```typescript
create() {
  MusicManager.getInstance().setScene(this);
}
```

#### `playSceneMusic(sceneKey?: string, musicKeyOverride?: string): void`
Play music appropriate for the scene.

```typescript
// Use current scene
MusicManager.getInstance().playSceneMusic();

// Specify scene
MusicManager.getInstance().playSceneMusic("Combat");

// Override music
MusicManager.getInstance().playSceneMusic("Combat", "boss_music");
```

#### `playSFX(key: string, config?: SoundConfig): void`
Play a sound effect.

```typescript
MusicManager.getInstance().playSFX("button_click", {
  volume: 0.8,
  rate: 1.0,
  loop: false
});
```

#### `playSFXFromPool(key: string, config?: SoundConfig): void`
Play a sound effect from a pre-allocated pool (better performance).

```typescript
MusicManager.getInstance().playSFXFromPool("card_draw");
```

### Volume & Mute Methods

#### `setVolume(volume: number, updateCurrent: boolean): void`
Set music volume (0.0 to 1.0).

#### `setSFXVolume(volume: number, updateActive: boolean): void`
Set SFX volume (0.0 to 1.0).

#### `setMasterVolume(volume: number, updateAll: boolean): void`
Set master volume (0.0 to 1.0).

#### `toggleMute(): void`
Toggle music mute.

#### `toggleSFXMute(): void`
Toggle SFX mute.

#### `toggleMasterMute(): void`
Toggle all audio mute.

### Utility Methods

#### `registerAudioAsset(key: string, path: string, type: 'music' | 'sfx'): void`
Register audio at runtime (must be called before Preloader loads).

```typescript
MusicManager.getInstance().registerAudioAsset(
  "custom_music",
  "music/custom/track.mp3",
  "music"
);
```

#### `getAudioAssets(): AudioAsset[]`
Get all registered audio assets.

#### `isAudioLocked(): boolean`
Check if audio is locked by browser autoplay policy.

## Best Practices

### ✅ DO
- Register all audio in `audioAssets[]` in MusicManager
- Call `setScene()` in every scene's `create()` method
- Use `playSceneMusic()` for automatic music management
- Use `playSFXFromPool()` for frequently played sounds
- Add scene-music mappings to `sceneMusicMap`

### ❌ DON'T
- Load audio directly in Preloader with `this.load.audio()`
- Hardcode music keys in scene code
- Create your own `this.sound.add()` instances for music
- Forget to call `setScene()` before playing audio

## Examples

### Example 1: Simple Scene with Music
```typescript
import { Scene } from "phaser";
import { MusicManager } from "../../core/managers/MusicManager";

export class MyScene extends Scene {
  constructor() {
    super("MyScene");
  }

  create() {
    // Set MusicManager context
    MusicManager.getInstance().setScene(this);
    
    // Play scene music automatically
    MusicManager.getInstance().playSceneMusic();
    
    // Your scene code...
  }
}
```

### Example 2: Button with Click Sound
```typescript
const button = this.add.text(100, 100, "Click Me", { fontSize: "24px" })
  .setInteractive()
  .on("pointerdown", () => {
    // Play button click sound
    MusicManager.getInstance().playSFX("button_click", { volume: 0.7 });
    
    // Button action...
  });
```

### Example 3: Dynamic Music Change
```typescript
// Normal gameplay music
create() {
  MusicManager.getInstance().setScene(this);
  MusicManager.getInstance().playSceneMusic();
}

// Boss enters - change to boss music
onBossAppear() {
  MusicManager.getInstance().playSceneMusic(undefined, "boss_music");
}

// Boss defeated - return to normal music
onBossDefeated() {
  MusicManager.getInstance().playSceneMusic(); // Returns to scene default
}
```

## Troubleshooting

### Q: Audio not playing?
**A:** Make sure you:
1. Registered the audio in `audioAssets[]`
2. Called `MusicManager.getInstance().loadAudioAssets(this)` in Preloader
3. Called `setScene(this)` before playing audio
4. Audio is not muted
5. Browser autoplay policy isn't blocking audio (first user interaction required)

### Q: Music not changing between scenes?
**A:** Check that:
1. Each scene calls `setScene(this)` in `create()`
2. Each scene calls `playSceneMusic()`
3. Scene is mapped in `sceneMusicMap`
4. Music keys exist in `audioAssets[]`

### Q: How do I add new audio?
**A:** 
1. Add file to `bathala/public/assets/music/` or `bathala/public/assets/sfx/`
2. Register in `MusicManager.audioAssets[]`
3. Use the key anywhere with `playSFX()` or map to scene with `sceneMusicMap`

### Q: Can I play custom music not in sceneMusicMap?
**A:** Yes! Use:
```typescript
MusicManager.getInstance().playSceneMusic(undefined, "your_custom_key");
```

## Summary

The refactored MusicManager provides:
- ✅ **Centralized audio management**
- ✅ **Automatic scene-based music**
- ✅ **Easy audio registration**
- ✅ **Comprehensive playback API**
- ✅ **Volume and mute controls**
- ✅ **Sound pooling for performance**
- ✅ **Spatial audio support**
- ✅ **Browser autoplay handling**

All audio in Bathala now flows through MusicManager. Simply register your audio assets, map them to scenes if needed, and use the provided API for playback.

---

**Related Files:**
- `src/core/managers/MusicManager.ts` - Main manager class
- `src/game/scenes/Preloader.ts` - Loads audio via MusicManager
- `src/game/scenes/Shop.ts` - Example usage
- `src/game/scenes/Settings.ts` - Volume control example

**Reference:**
- [Phaser Audio Documentation](https://docs.phaser.io/phaser/concepts/audio)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

# MusicManager Architecture

**Version**: 2.0  
**Date**: October 20, 2025  
**Branch**: revise/music-selection

---

## Overview

The **MusicManager** is a singleton that owns ALL music assignment and playback logic. Scenes only make simple calls to play/stop music - they never specify which track, volume, fade, or loop settings.

---

## Architecture Principles

### ✅ MusicManager Owns:
1. **Music Assignment** - Which track plays in which scene
2. **Playback Settings** - Volume, fade in/out, loop behavior
3. **Music State** - Currently playing track, mute state, volume
4. **Scene-to-Music Mapping** - Single source of truth (sceneMusicMap)

### ✅ Scenes Only:
1. **Call playSceneMusic()** - That's it! No parameters needed
2. **Call stopMusic()** - Before transitioning to another scene
3. **Set scene context** - `setScene(this)` in create()

---

## Usage in Scenes

### Standard Pattern (95% of cases):

```typescript
export class YourScene extends Scene {
  create() {
    // 1. Set scene context
    const musicManager = MusicManager.getInstance();
    musicManager.setScene(this);
    
    // 2. Play music (MusicManager decides everything)
    musicManager.playSceneMusic();
    
    // ... rest of scene setup
  }

  shutdown() {
    // 3. Stop music before leaving
    MusicManager.getInstance().stopMusic();
  }
}
```

### Special Case (Boss Music Override):

```typescript
// For temporary overrides (e.g., boss fights)
const musicManager = MusicManager.getInstance();
musicManager.playMusic("boss_music", 0.6, true, true);
// Still specify settings, but scene controls timing
```

---

## Music Assignment (MusicManager.ts)

All music assignments are in **ONE PLACE**: `sceneMusicMap` in MusicManager.ts

```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  "Boot": { 
    musicKey: "disclaimer_music", 
    volume: 0.4, 
    fadeIn: true, 
    loop: true 
  },
  "MainMenu": { 
    musicKey: "placeholder_music", 
    volume: 0.5, 
    fadeIn: true, 
    loop: true 
  },
  "Combat": { 
    musicKey: "placeholder_music", 
    volume: 0.5, 
    fadeIn: true, 
    loop: true 
  },
  // ... etc
};
```

### To Add New Music:
1. Load track in **Preloader.ts** (music loading section)
2. Assign to scene in **MusicManager.ts** (sceneMusicMap)
3. Scene automatically plays it via `playSceneMusic()`

---

## Key Features

### 1. Automatic Scene Detection
```typescript
// MusicManager knows which scene is calling
musicManager.playSceneMusic(); // Uses current scene key
```

### 2. Smart Restart Prevention
```typescript
// Won't restart if same music already playing
musicManager.playSceneMusic(); // Safe to call multiple times
```

### 3. Smooth Transitions
```typescript
// Automatic fade out/in between tracks
musicManager.stopMusic(); // Fades out by default
musicManager.playSceneMusic(); // Fades in if configured
```

### 4. Centralized Control
```typescript
// Global volume, mute, pause - all in one place
musicManager.setVolume(0.7);
musicManager.mute();
musicManager.pause();
```

---

## API Reference

### Scene API (What scenes call):

| Method | Parameters | Description |
|--------|-----------|-------------|
| `setScene(scene)` | `scene: Scene` | Set scene context (call in `create()`) |
| `playSceneMusic()` | None | Play music for current scene |
| `stopMusic(fadeOut?)` | `fadeOut: boolean = true` | Stop current music |

### Advanced API (Special cases only):

| Method | Parameters | Description |
|--------|-----------|-------------|
| `playMusic(key, vol?, fade?, loop?)` | Various | Manual music override (boss fights, etc.) |
| `crossfade(key, vol?)` | Various | Smooth transition to new track |
| `setVolume(vol, smooth?)` | Various | Adjust volume globally |
| `mute() / unmute()` | None | Toggle mute state |
| `pause() / resume()` | None | Pause/resume playback |

---

## Configuration Files

### MusicManager.ts
- **Location**: `src/core/managers/MusicManager.ts`
- **Contains**: sceneMusicMap (music assignment logic)
- **Edit When**: Adding new scenes or changing music assignments

### Preloader.ts
- **Location**: `src/game/scenes/Preloader.ts`
- **Contains**: Music file loading (audio assets)
- **Edit When**: Adding new music tracks to the game

---

## Benefits of This Architecture

✅ **Single Source of Truth** - All music logic in MusicManager  
✅ **Simple Scene Code** - Just call playSceneMusic()  
✅ **Easy to Change** - Update sceneMusicMap, scenes auto-update  
✅ **Consistent Behavior** - Same fade/volume patterns everywhere  
✅ **No Scene Coupling** - Scenes don't know about music files  
✅ **Centralized Control** - Global mute, volume, etc. in one place

---

## Migration from Old Pattern

### Old Pattern (❌ Don't use):
```typescript
// Scene specified everything
this.sound.play("some_music", { loop: true, volume: 0.5 });
```

### New Pattern (✅ Use this):
```typescript
// MusicManager handles everything
const musicManager = MusicManager.getInstance();
musicManager.setScene(this);
musicManager.playSceneMusic();
```

---

## Troubleshooting

### Music Not Playing?
1. Check if track is loaded in Preloader.ts
2. Check if scene is mapped in MusicManager.ts sceneMusicMap
3. Verify `setScene(this)` is called before `playSceneMusic()`

### Wrong Music Playing?
- Update sceneMusicMap in MusicManager.ts (single source of truth)

### Music Restarts Unnecessarily?
- MusicManager prevents this automatically - check if you're calling stopMusic() too often

---

## Future Enhancements

Planned features:
- [ ] Music queue system for dynamic playlists
- [ ] Context-aware music (day/night variants)
- [ ] Smooth volume ducking for SFX
- [ ] Music layers (background + intensity)
- [ ] Adaptive music based on game state (health, combat intensity)

---

**End of Document**

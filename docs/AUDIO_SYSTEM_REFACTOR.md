# Audio System Refactor - MusicManager Centralized Loading

## Overview
The audio system has been refactored so that **MusicManager** is now the single source of truth for all audio asset registration, naming, and loading. This provides better organization and makes it easier to manage audio throughout the game.

---

## Architecture

### Before (Old System)
```
Preloader.ts → Manually loads audio with this.load.audio()
    ↓
Scenes → Request audio via MusicManager
```

### After (New System)
```
MusicManager → Defines all audio assets in audioAssets[]
    ↓
Preloader.ts → Calls MusicManager.loadAudioAssets()
    ↓
Scenes → Request audio via MusicManager methods
```

---

## How It Works

### 1. Audio Asset Registry (in MusicManager)

All audio files are registered in `MusicManager.ts` in the `audioAssets` array:

```typescript
private readonly audioAssets: AudioAsset[] = [
  // Background Music
  { 
    key: "placeholder_music", 
    path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3", 
    type: 'music' 
  },
  { 
    key: "disclaimer_music", 
    path: "music/bathala_disclaimer.mp3", 
    type: 'music' 
  },
  
  // Sound Effects (example)
  // { key: "button_click", path: "sfx/button_click.mp3", type: 'sfx' },
];
```

### 2. Loading in Preloader

The Preloader now simply delegates to MusicManager:

```typescript
preload() {
  // ... other asset loading ...
  
  // Load all audio assets through MusicManager
  MusicManager.getInstance().loadAudioAssets(this);
}
```

### 3. Using Audio in Scenes

Scenes can request audio in several ways:

#### **For Background Music (Automatic)**
```typescript
// In any scene's create() method
MusicManager.getInstance().setScene(this);
MusicManager.getInstance().playSceneMusic();
```

#### **For Sound Effects**
```typescript
// Play a sound effect
MusicManager.getInstance().playSFX("button_click", { volume: 0.7 });
```

#### **For Any Audio (Generic)**
```typescript
// Play any registered audio (auto-detects type)
MusicManager.getInstance().playAudio("some_audio_key");
```

---

## Adding New Audio

### Step 1: Add to MusicManager Registry

Open `src/core/managers/MusicManager.ts` and add your audio to the `audioAssets` array:

```typescript
private readonly audioAssets: AudioAsset[] = [
  // Existing assets...
  
  // Your new audio
  { 
    key: "victory_fanfare", 
    path: "music/victory.mp3", 
    type: 'music' 
  },
  { 
    key: "sword_slash", 
    path: "sfx/sword_slash.wav", 
    type: 'sfx' 
  },
];
```

### Step 2: (Optional) Configure Scene Music Mapping

If you want a specific scene to play your music automatically:

```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  // Existing mappings...
  
  "VictoryScene": { 
    musicKey: "victory_fanfare", 
    volume: 0.6, 
    fadeIn: true 
  },
};
```

### Step 3: Use in Your Scene

```typescript
// For background music
MusicManager.getInstance().playSceneMusic();

// For sound effects
MusicManager.getInstance().playSFX("sword_slash");
```

---

## API Reference

### MusicManager Methods

#### **loadAudioAssets(scene: Scene)**
Loads all registered audio assets. Called automatically by Preloader.

```typescript
MusicManager.getInstance().loadAudioAssets(this);
```

#### **playSceneMusic(sceneKey?: string, musicKeyOverride?: string)**
Plays background music for the current scene (or specified scene).

```typescript
// Auto-detect scene
MusicManager.getInstance().playSceneMusic();

// Override with specific music
MusicManager.getInstance().playSceneMusic(undefined, "boss_music");
```

#### **playSFX(key: string, config?: SoundConfig)**
Plays a sound effect.

```typescript
MusicManager.getInstance().playSFX("button_click", {
  volume: 0.8,
  rate: 1.2,    // Playback speed
  detune: 100,  // Pitch shift
});
```

#### **playAudio(key: string, config?: SoundConfig)**
Generic method that auto-detects audio type and plays it.

```typescript
MusicManager.getInstance().playAudio("some_sound");
```

#### **getAudioAssets(): AudioAsset[]**
Returns all registered audio assets (for debugging).

```typescript
const assets = MusicManager.getInstance().getAudioAssets();
console.log("Available audio:", assets);
```

#### **hasAudioAsset(key: string): boolean**
Check if an audio key exists in the registry.

```typescript
if (MusicManager.getInstance().hasAudioAsset("victory_fanfare")) {
  // Audio is registered
}
```

---

## Benefits of This Approach

1. **Single Source of Truth**: All audio assets defined in one place
2. **Type Safety**: TypeScript interfaces ensure correct usage
3. **Easy Management**: Add/remove audio by editing one array
4. **Automatic Loading**: Preloader handles loading via one method call
5. **Error Prevention**: Built-in validation and helpful error messages
6. **Debugging**: Easy to see all available audio assets
7. **Consistency**: Standardized naming and organization

---

## Migration Notes

### Old Code
```typescript
// In Preloader.ts
this.load.audio("placeholder_music", "music/Bathala_Soundtrack/Bathala_MainMenu.mp3");
this.load.audio("disclaimer_music", "music/bathala_disclaimer.mp3");
```

### New Code
```typescript
// In Preloader.ts
MusicManager.getInstance().loadAudioAssets(this);

// All audio definitions are now in MusicManager.ts audioAssets array
```

---

## Troubleshooting

### "Audio key not found in registry"
**Solution**: Add the audio to the `audioAssets` array in MusicManager.ts

### "Audio registered but not loaded yet"
**Solution**: Ensure `loadAudioAssets()` was called in Preloader and assets finished loading

### "No scene set"
**Solution**: Call `MusicManager.getInstance().setScene(this)` in your scene's `create()` method

### Audio not playing
**Possible causes**:
1. Browser autoplay policy (interact with page first)
2. Audio file path incorrect
3. Audio not added to registry
4. Volume/mute settings

---

## Example: Complete Button Click Sound

### 1. Add to MusicManager
```typescript
private readonly audioAssets: AudioAsset[] = [
  // ... other assets ...
  { key: "button_click", path: "sfx/ui/button_click.mp3", type: 'sfx' },
];
```

### 2. Use in Button Code
```typescript
// In any scene with a button
this.myButton.on('pointerdown', () => {
  MusicManager.getInstance().playSFX("button_click", { volume: 0.5 });
  // ... rest of button logic
});
```

---

## Future Enhancements

Potential additions to the system:
- Audio categories/groups for batch control
- Audio presets (e.g., "ui_sounds", "combat_sounds")
- Dynamic audio path generation
- Audio compression/format detection
- Lazy loading for large audio files
- Audio state persistence

---

## References

- [Phaser 3 Audio Documentation](https://docs.phaser.io/phaser/concepts/audio)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- `src/core/managers/MusicManager.ts` - Main implementation
- `src/game/scenes/Preloader.ts` - Loading integration

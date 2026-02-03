# Audio System Quick Reference

## 🎵 How to Add New Audio

### 1. Register in MusicManager (`src/core/managers/MusicManager.ts`)
```typescript
private readonly audioAssets: AudioAsset[] = [
  { key: "your_audio_key", path: "path/to/audio.mp3", type: 'music' | 'sfx' },
];
```

### 2. Use in Your Scene
```typescript
// Background music (auto-plays based on scene)
MusicManager.getInstance().setScene(this);
MusicManager.getInstance().playSceneMusic();

// Sound effects
MusicManager.getInstance().playSFX("your_audio_key");

// Any audio (generic)
MusicManager.getInstance().playAudio("your_audio_key");
```

---

## 🔧 Common Patterns

### Play Button Click Sound
```typescript
button.on('pointerdown', () => {
  MusicManager.getInstance().playSFX("button_click", { volume: 0.5 });
});
```

### Play Scene-Specific Music
```typescript
// In MusicManager.ts sceneMusicMap
"YourScene": { musicKey: "your_music", volume: 0.5, fadeIn: true }

// In your scene's create()
MusicManager.getInstance().playSceneMusic();
```

### Play With Advanced Config
```typescript
MusicManager.getInstance().playSFX("sword_slash", {
  volume: 0.8,
  rate: 1.2,      // Playback speed
  detune: -100,   // Pitch shift (cents)
  delay: 500,     // Delay before playing (ms)
});
```

---

## 📋 Available Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `loadAudioAssets(scene)` | Load all audio (Preloader only) | `MusicManager.getInstance().loadAudioAssets(this)` |
| `playSceneMusic()` | Play scene background music | `MusicManager.getInstance().playSceneMusic()` |
| `playSFX(key, config?)` | Play sound effect | `playSFX("button_click", {volume: 0.5})` |
| `playAudio(key, config?)` | Play any audio | `playAudio("some_sound")` |
| `stopMusic(fadeOut?)` | Stop current music | `stopMusic(true)` |
| `setMusicVolume(volume)` | Set music volume (0-1) | `setMusicVolume(0.5)` |
| `setSFXVolume(volume)` | Set SFX volume (0-1) | `setSFXVolume(0.7)` |
| `muteMusic(mute)` | Mute/unmute music | `muteMusic(true)` |
| `muteSFX(mute)` | Mute/unmute SFX | `muteSFX(true)` |

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| "Audio key not found in registry" | Add to `audioAssets` array in MusicManager |
| "No scene set" | Call `setScene(this)` in scene's `create()` |
| Audio not playing | Check browser autoplay policy (user must interact first) |
| Wrong volume | Check master/music/sfx volume levels |

---

## 📁 File Structure

```
src/core/managers/
  └── MusicManager.ts         ← All audio registration here

src/game/scenes/
  └── Preloader.ts            ← Calls loadAudioAssets()
  └── YourScene.ts            ← Uses playSceneMusic() / playSFX()

public/assets/
  ├── music/                  ← Background music files
  └── sfx/                    ← Sound effect files
```

---

## 🎯 Cheat Sheet

```typescript
// In MusicManager.ts - Add audio
{ key: "my_sound", path: "sfx/my_sound.mp3", type: 'sfx' }

// In any scene - Use audio
MusicManager.getInstance().setScene(this);
MusicManager.getInstance().playSFX("my_sound");
```

That's it! 🎉

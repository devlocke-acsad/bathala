# AudioManager - Comprehensive Audio System Guide

## Overview

The **AudioManager** is a comprehensive singleton class that manages all audio in Bathala, including background music, sound effects, spatial audio, audio sprites, and more. It's built on top of Phaser's powerful audio system with support for both Web Audio API and HTML5 Audio.

## Features

✅ **Background Music Management** - Scene-based music with crossfading  
✅ **Sound Effects (SFX)** - One-shot and pooled sounds for performance  
✅ **Spatial/Positional Audio** - 3D audio with distance-based attenuation  
✅ **Audio Sprites** - Efficient audio atlases for multiple sound effects  
✅ **Volume Controls** - Separate music, SFX, and master volume  
✅ **Mute Controls** - Individual and master mute states  
✅ **Audio Pooling** - Reusable sound instances for frequently played effects  
✅ **Fade Transitions** - Smooth fade-in/fade-out for music  
✅ **Browser Autoplay Handling** - Automatic unlocking on user interaction  
✅ **Global Audio Controls** - Detune, playback rate, and more  

---

## Quick Start

### Basic Setup

```typescript
import { AudioManager } from "./core/managers/MusicManager";

// In your scene's create() method
const audioManager = AudioManager.getInstance();
audioManager.setScene(this);

// Play scene music automatically
audioManager.playSceneMusic();

// Play a sound effect
audioManager.playSFX("sword_hit", { volume: 0.8 });
```

---

## Music Management

### Playing Scene Music

The AudioManager automatically maps scenes to music tracks:

```typescript
// Plays the configured music for the current scene
audioManager.playSceneMusic();

// Override with a specific scene's music
audioManager.playSceneMusic("Combat");

// Override with a custom music key (e.g., boss music)
audioManager.playSceneMusic(undefined, "boss_music");
```

### Manual Music Control

```typescript
// Stop current music
audioManager.stopMusic(true); // with fade-out
audioManager.stopMusic(false); // instant stop

// Pause/Resume
audioManager.pauseMusic();
audioManager.resumeMusic();

// Crossfade to new music
audioManager.crossfadeMusic("new_music_key", 0.6);
```

### Music Volume

```typescript
// Set music volume (0.0 to 1.0)
audioManager.setMusicVolume(0.5, true); // smooth transition
audioManager.setMusicVolume(0.5, false); // instant

// Get current music volume
const volume = audioManager.getMusicVolume();

// Mute/Unmute
audioManager.muteMusic();
audioManager.unmuteMusic();
audioManager.toggleMusicMute();
```

---

## Sound Effects (SFX)

### Playing Sound Effects

```typescript
// Simple one-shot sound
audioManager.playSFX("button_click");

// With configuration
audioManager.playSFX("explosion", {
  volume: 0.9,
  rate: 1.2, // playback speed
  detune: 100, // pitch shift in cents
  loop: false,
});

// Returns sound instance for further control
const sound = audioManager.playSFX("footstep");
if (sound) {
  sound.on("complete", () => {
    console.log("Sound finished playing");
  });
}
```

### Sound Pooling (Performance Optimization)

For frequently played sounds (e.g., footsteps, gunshots), use sound pooling:

```typescript
// Create a pool of 10 instances
audioManager.createSoundPool("laser_shot", 10);

// Play from pool (much faster than creating new instances)
audioManager.playPooledSFX("laser_shot", { volume: 0.7 });
audioManager.playPooledSFX("laser_shot"); // plays next available instance
```

### SFX Volume Control

```typescript
// Set SFX volume
audioManager.setSFXVolume(0.7);

// Get current SFX volume
const sfxVol = audioManager.getSFXVolume();

// Mute/Unmute all SFX
audioManager.muteSFX();
audioManager.unmuteSFX();
audioManager.toggleSFXMute();
```

### Stopping Sounds

```typescript
// Stop all instances of a specific sound
audioManager.stopSFXByKey("ambience_loop");

// Stop all active sound effects
audioManager.stopAllSFX();
```

---

## Spatial/Positional Audio

### Setup Spatial Audio

```typescript
// Set listener position (typically the player's position)
audioManager.setListenerPosition(player.x, player.y);

// Update in your scene's update() method
update() {
  audioManager.setListenerPosition(this.player.x, this.player.y);
}
```

### Play Spatial Sounds

```typescript
// Play a sound at a specific world position
audioManager.playSpatialSFX("enemy_growl", enemy.x, enemy.y);

// With advanced spatial configuration
audioManager.playSpatialSFX("waterfall", 500, 300, {
  volume: 1.0,
  source: {
    panningModel: "HRTF", // High-quality 3D audio
    distanceModel: "inverse",
    refDistance: 50, // Distance at which volume starts to decrease
    maxDistance: 500, // Maximum effective distance
    rolloffFactor: 2, // How quickly volume decreases with distance
  },
});
```

### Following Objects

```typescript
// Make a sound follow a game object
const sound = audioManager.playSFX("engine_loop", {
  loop: true,
  source: {
    follow: this.car, // Any object with x/y properties
  },
});
```

---

## Audio Sprites

Audio sprites allow you to pack multiple sound effects into a single audio file, improving loading performance.

### Loading Audio Sprites

```typescript
// In your Preloader scene
this.load.audioSprite(
  "sfx_sprite",
  ["assets/audio/sfx_sprite.mp3", "assets/audio/sfx_sprite.ogg"],
  "assets/audio/sfx_sprite.json"
);
```

### Playing Audio Sprite Markers

```typescript
// Play a specific marker from the sprite
audioManager.playAudioSprite("sfx_sprite", "button_click");
audioManager.playAudioSprite("sfx_sprite", "coin_collect", { volume: 0.8 });

// Create an audio sprite instance for manual control
const sprite = audioManager.createAudioSprite("sfx_sprite");
if (sprite) {
  sprite.play("button_click");
  sprite.play("coin_collect");
}
```

---

## Master Controls

### Master Volume

Controls all audio (music + SFX):

```typescript
// Set master volume
audioManager.setMasterVolume(0.8);

// Get master volume
const masterVol = audioManager.getMasterVolume();

// Mute/Unmute everything
audioManager.muteAll();
audioManager.unmuteAll();
audioManager.toggleMasterMute();
```

### Global Audio Effects

```typescript
// Set global detune for all sounds (in cents: -1200 to 1200)
audioManager.setGlobalDetune(50); // slight pitch up

// Set global playback rate for all sounds
audioManager.setGlobalRate(1.5); // 1.5x speed
audioManager.setGlobalRate(0.75); // slow motion effect
```

---

## Advanced Features

### Checking Mute States

```typescript
const states = audioManager.getMuteStates();
console.log(states); 
// { music: false, sfx: false, master: false }
```

### Audio Statistics

```typescript
const stats = audioManager.getAudioStats();
console.log(stats);
/*
{
  isLocked: false,
  musicPlaying: true,
  currentMusicKey: "overworld_music",
  activeSoundCount: 3,
  soundPoolCount: 2,
  volumes: { music: 0.5, sfx: 0.7, master: 1.0 },
  muteStates: { music: false, sfx: false, master: false }
}
*/
```

### Getting Sound Instances

```typescript
// Get first sound instance by key
const sound = audioManager.getSound("ambience");

// Get all sounds with a specific key
const sounds = audioManager.getAllSounds("footstep");

// Get all currently playing sounds
const playing = audioManager.getAllPlayingSounds();
```

### Pause/Resume All Audio

```typescript
// Pause everything (music + SFX)
audioManager.pauseAll();

// Resume everything
audioManager.resumeAll();

// Stop everything
audioManager.stopAll();
```

### Browser Autoplay Policy

Modern browsers block autoplay until user interaction:

```typescript
// Check if audio is locked
if (audioManager.isAudioLocked()) {
  console.log("Audio will unlock on first user interaction");
}

// Manually unlock (usually automatic)
audioManager.unlockAudio();
```

### Cleanup and Reset

```typescript
// Clean up when changing scenes
audioManager.stopMusic();
audioManager.stopAllSFX();

// Full reset (use carefully)
audioManager.reset();
```

---

## Configuration

### Customizing Fade Durations

```typescript
// Set custom fade durations (in milliseconds)
audioManager.setFadeDurations(800, 1500);
// fadeOut: 800ms, fadeIn: 1500ms
```

### Scene-to-Music Mapping

The AudioManager has a built-in scene-to-music map. To customize:

```typescript
// In MusicManager.ts, modify the sceneMusicMap:
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  "YourScene": { musicKey: "your_music", volume: 0.6, fadeIn: true },
  // ...
};
```

---

## Best Practices

### 1. **Initialize in Each Scene**

```typescript
create() {
  const audioManager = AudioManager.getInstance();
  audioManager.setScene(this);
  audioManager.playSceneMusic();
}
```

### 2. **Clean Up on Scene Shutdown**

```typescript
shutdown() {
  const audioManager = AudioManager.getInstance();
  audioManager.stopMusic();
  audioManager.stopAllSFX();
}
```

### 3. **Use Sound Pooling for Frequent Sounds**

```typescript
// Create pools in Preloader or scene create()
audioManager.createSoundPool("footstep", 8);
audioManager.createSoundPool("bullet_shot", 20);

// Then use playPooledSFX instead of playSFX
audioManager.playPooledSFX("footstep");
```

### 4. **Update Spatial Listener Position**

```typescript
update() {
  if (this.player) {
    AudioManager.getInstance().setListenerPosition(
      this.player.x,
      this.player.y
    );
  }
}
```

### 5. **Separate Music and SFX Volumes**

```typescript
// Allow players to control music and SFX separately
audioManager.setMusicVolume(0.4); // quieter music
audioManager.setSFXVolume(0.8);   // louder effects
```

---

## Common Use Cases

### Menu UI Sounds

```typescript
// Button hover
this.add.text(100, 100, "Start Game")
  .setInteractive()
  .on("pointerover", () => {
    AudioManager.getInstance().playSFX("ui_hover");
  })
  .on("pointerdown", () => {
    AudioManager.getInstance().playSFX("ui_click");
  });
```

### Combat Sounds

```typescript
// Player attack
playerAttack() {
  AudioManager.getInstance().playPooledSFX("sword_swing");
  
  // If hit enemy
  if (hit) {
    AudioManager.getInstance().playSpatialSFX(
      "enemy_hurt",
      enemy.x,
      enemy.y
    );
  }
}
```

### Ambient Loops

```typescript
// Play looping ambience
const ambience = AudioManager.getInstance().playSFX("forest_ambience", {
  loop: true,
  volume: 0.3,
});

// Stop when leaving area
ambience?.stop();
```

### Boss Music

```typescript
// Switch to boss music during boss fight
AudioManager.getInstance().crossfadeMusic("boss_theme", 0.7);

// Return to normal music after victory
AudioManager.getInstance().crossfadeMusic("overworld_music", 0.5);
```

---

## TypeScript Types

The AudioManager exports useful TypeScript interfaces:

```typescript
import { 
  AudioManager, 
  SoundConfig, 
  AudioMarker, 
  SceneMusicConfig 
} from "./core/managers/MusicManager";

// Use SoundConfig for type-safe sound configuration
const config: SoundConfig = {
  volume: 0.8,
  rate: 1.2,
  loop: false,
};

audioManager.playSFX("sound_key", config);
```

---

## Performance Tips

1. **Use Sound Pooling** - For sounds played frequently (> 10 times/second)
2. **Use Audio Sprites** - Pack multiple SFX into one file
3. **Limit Active Sounds** - Stop sounds when no longer needed
4. **Optimize Spatial Audio** - Use simple distance models for many sources
5. **Preload Audio** - Load all audio in Preloader scene

---

## Troubleshooting

### Audio Not Playing

1. Check if audio is locked: `audioManager.isAudioLocked()`
2. Verify audio key is loaded: `this.cache.audio.exists("key")`
3. Check volume levels and mute states
4. Check browser console for warnings

### Audio Cutting Out

- Increase sound pool size for frequently played sounds
- Check if you're hitting browser's audio limit (~32 concurrent sounds)

### Spatial Audio Not Working

- Ensure you're using Web Audio (not HTML5 Audio)
- Update listener position in `update()` method
- Check `refDistance` and `maxDistance` settings

---

## Migration from Old MusicManager

The AudioManager is backward compatible:

```typescript
// Old way (still works)
audioManager.playSceneMusic();
audioManager.stopMusic();

// New features
audioManager.playSFX("sound");
audioManager.setSFXVolume(0.7);
audioManager.setMasterVolume(0.8);
```

---

## References

- [Phaser Audio Documentation](https://docs.phaser.io/phaser/concepts/audio)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Browser Autoplay Policies](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide)

---

**Version**: 2.0.0  
**Last Updated**: October 2025  
**Compatibility**: Phaser 3.x

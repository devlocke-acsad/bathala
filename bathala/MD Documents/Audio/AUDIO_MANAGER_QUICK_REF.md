# AudioManager Quick Reference

## Setup
```typescript
const audio = AudioManager.getInstance();
audio.setScene(this);
```

## Music
```typescript
// Auto-play scene music
audio.playSceneMusic();
audio.playSceneMusic("SceneName");
audio.playSceneMusic(undefined, "boss_music");

// Manual control
audio.stopMusic(true);
audio.pauseMusic();
audio.resumeMusic();
audio.crossfadeMusic("new_track");

// Volume
audio.setMusicVolume(0.5);
audio.getMusicVolume();
audio.muteMusic();
audio.unmuteMusic();
```

## Sound Effects
```typescript
// Play SFX
audio.playSFX("sound_key");
audio.playSFX("sound_key", { volume: 0.8, rate: 1.2 });

// Pooling (performance)
audio.createSoundPool("frequent_sound", 10);
audio.playPooledSFX("frequent_sound");

// Volume
audio.setSFXVolume(0.7);
audio.muteSFX();

// Stop
audio.stopSFXByKey("key");
audio.stopAllSFX();
```

## Spatial Audio
```typescript
// Set listener (usually in update())
audio.setListenerPosition(player.x, player.y);

// Play at position
audio.playSpatialSFX("sound", x, y);
audio.playSpatialSFX("sound", x, y, {
  source: { 
    panningModel: "HRTF",
    refDistance: 50,
    maxDistance: 500,
  }
});
```

## Audio Sprites
```typescript
audio.playAudioSprite("sprite_key", "marker_name");
const sprite = audio.createAudioSprite("sprite_key");
sprite.play("marker_name");
```

## Master Controls
```typescript
audio.setMasterVolume(0.8);
audio.muteAll();
audio.unmuteAll();
audio.setGlobalDetune(50);
audio.setGlobalRate(1.5);
```

## Utility
```typescript
// Pause/Resume all
audio.pauseAll();
audio.resumeAll();

// Stop everything
audio.stopAll();

// Get stats
const stats = audio.getAudioStats();

// Check lock
audio.isAudioLocked();

// Cleanup
audio.reset();
```

## Volume Hierarchy
```
Final Volume = baseVolume × categoryVolume × masterVolume
```
- Music: `musicVolume × masterVolume`
- SFX: `sfxVolume × masterVolume`

## Mute Priority
- `muteAll()` overrides individual mutes
- `muteMusic()` only affects music
- `muteSFX()` only affects SFX

## Best Practices
1. Initialize in `create()`: `audio.setScene(this)`
2. Clean up in `shutdown()`: `audio.stopMusic()`
3. Use pools for frequent sounds
4. Update listener in `update()` for spatial audio
5. Use audio sprites for many small sounds

# Background Music System Guide

## Overview
The Bathala game now has a centralized music management system using the `MusicManager` singleton class. This system handles all background music playback, transitions, volume control, and cross-fading across all game scenes.

## Architecture

### MusicManager (`src/core/managers/MusicManager.ts`)
A singleton class that manages all background music in the game with the following features:

- **Singleton Pattern**: Only one instance exists throughout the game
- **Scene Context Management**: Automatically handles scene references for audio playback
- **Fade Transitions**: Smooth fade-in/fade-out effects when starting/stopping music
- **Crossfade Support**: Seamless transitions between different music tracks
- **Volume Control**: Global volume management with mute/unmute functionality
- **Smart Playback**: Prevents restarting the same track if already playing

## Audio Files Setup

### Required Audio Files
Place your music files in: `bathala/public/assets/audio/`

The following audio tracks are configured:
- `main_menu.mp3` - Main menu background music
- `overworld.mp3` - Overworld exploration music
- `combat.mp3` - Regular combat music
- `boss.mp3` - Boss battle music
- `shop.mp3` - Shop scene music
- `campfire.mp3` - Campfire/rest area music
- `event.mp3` - Event scene music
- `victory.mp3` - Victory celebration music (optional)
- `defeat.mp3` - Game over music (optional)

**Supported Formats**: `.mp3`, `.ogg`, `.wav`

### Audio Loading
All audio files are loaded in `Preloader.ts` (lines 253-264):
```typescript
this.load.audio("main_menu_music", "audio/main_menu.mp3");
this.load.audio("overworld_music", "audio/overworld.mp3");
// ... etc
```

## Scene Integration

### Scenes with Music Integration

#### 1. MainMenu Scene
- **Music**: `main_menu_music`
- **Volume**: 0.5
- **Fade In**: Yes
- **Stops Music**: When transitioning to other scenes

#### 2. Overworld Scene
- **Music**: `overworld_music`
- **Volume**: 0.4
- **Fade In**: Yes
- **Context**: Exploration and map navigation

#### 3. Combat Scene
- **Music**: `combat_music` or `boss_music` (based on enemy type)
- **Volume**: 0.5
- **Fade In**: Yes
- **Dynamic**: Switches to boss music for boss encounters

#### 4. Shop Scene
- **Music**: `shop_music`
- **Volume**: 0.4
- **Fade In**: Yes

#### 5. Campfire Scene
- **Music**: `campfire_music`
- **Volume**: 0.4
- **Fade In**: Yes

#### 6. Event Scene
- **Music**: `event_music`
- **Volume**: 0.4
- **Fade In**: Yes

## Usage Examples

### Basic Usage in a Scene

```typescript
import { MusicManager } from "../../core/managers/MusicManager";

export class YourScene extends Scene {
  create() {
    // Initialize MusicManager with current scene
    MusicManager.getInstance().setScene(this);
    
    // Play music with fade-in
    MusicManager.getInstance().play("your_music_key", 0.5, true);
  }
}
```

### Stopping Music Before Scene Transition

```typescript
// Stop with fade-out
MusicManager.getInstance().stop(true);
this.scene.start("NextScene");
```

### Crossfading Between Tracks

```typescript
// Smoothly transition from current music to new music
MusicManager.getInstance().crossfade("new_music_key", 0.5);
```

### Volume Control

```typescript
// Set volume (0.0 to 1.0)
MusicManager.getInstance().setVolume(0.7, true); // smooth transition

// Mute/Unmute
MusicManager.getInstance().mute();
MusicManager.getInstance().unmute();
MusicManager.getInstance().toggleMute();
```

### Checking Music State

```typescript
// Check if music is playing
if (MusicManager.getInstance().isPlaying()) {
  console.log("Music is playing");
}

// Get current track
const currentTrack = MusicManager.getInstance().getCurrentMusicKey();
console.log(`Currently playing: ${currentTrack}`);
```

## MusicManager API Reference

### Core Methods

#### `setScene(scene: Scene): void`
Set the current Phaser scene context for audio playback.

#### `play(key: string, volume?: number, fadeIn?: boolean, loop?: boolean): void`
Play background music.
- `key`: Audio key loaded in Preloader
- `volume`: Volume level (0.0 to 1.0), default: 0.5
- `fadeIn`: Whether to fade in, default: true
- `loop`: Whether to loop, default: true

#### `stop(fadeOut?: boolean): void`
Stop the current music.
- `fadeOut`: Whether to fade out before stopping, default: true

#### `pause(): void`
Pause the current music.

#### `resume(): void`
Resume paused music.

#### `crossfade(key: string, volume?: number): void`
Crossfade from current music to new music.

### Volume Control Methods

#### `setVolume(volume: number, smooth?: boolean): void`
Set music volume.
- `volume`: Volume level (0.0 to 1.0)
- `smooth`: Smooth transition, default: true

#### `mute(): void`
Mute all music.

#### `unmute(): void`
Unmute all music.

#### `toggleMute(): void`
Toggle mute state.

### Query Methods

#### `isPlaying(): boolean`
Check if music is currently playing.

#### `getCurrentMusicKey(): string | null`
Get the current music track key.

#### `getVolume(): number`
Get the current volume level.

#### `isMusicMuted(): boolean`
Check if music is muted.

### Configuration Methods

#### `setFadeDurations(fadeOut: number, fadeIn: number): void`
Set fade durations in milliseconds.
- `fadeOut`: Fade out duration (default: 500ms)
- `fadeIn`: Fade in duration (default: 1000ms)

#### `stopAll(): void`
Stop all sounds in the scene (including music and SFX).

#### `reset(): void`
Reset the music manager (useful for cleanup).

## Best Practices

### 1. Always Set Scene Context
```typescript
MusicManager.getInstance().setScene(this);
```
Call this in the `create()` method of every scene that uses music.

### 2. Use Fade Transitions
```typescript
// Good: Smooth fade-in
MusicManager.getInstance().play("music_key", 0.5, true);

// Avoid: Abrupt start (unless intentional)
MusicManager.getInstance().play("music_key", 0.5, false);
```

### 3. Stop Music Before Scene Transitions
```typescript
MusicManager.getInstance().stop(true);
this.scene.start("NextScene");
```

### 4. Prevent Duplicate Playback
The MusicManager automatically prevents restarting the same track if it's already playing.

### 5. Volume Levels
Recommended volume levels:
- **Main Menu**: 0.5 (moderate)
- **Overworld**: 0.4 (ambient)
- **Combat**: 0.5 (energetic)
- **Shop/Campfire/Event**: 0.4 (calm)

## Adding New Music Tracks

### Step 1: Add Audio File
Place your audio file in `bathala/public/assets/audio/`

### Step 2: Load in Preloader
Edit `Preloader.ts`:
```typescript
this.load.audio("new_music_key", "audio/new_music.mp3");
```

### Step 3: Use in Scene
```typescript
MusicManager.getInstance().setScene(this);
MusicManager.getInstance().play("new_music_key", 0.5, true);
```

## Troubleshooting

### Music Not Playing
1. Check if audio file exists in `public/assets/audio/`
2. Verify audio key is loaded in `Preloader.ts`
3. Ensure `setScene()` is called before `play()`
4. Check browser console for errors

### Music Cuts Off Abruptly
Use fade-out when stopping:
```typescript
MusicManager.getInstance().stop(true); // true = fade out
```

### Volume Too Loud/Quiet
Adjust volume parameter:
```typescript
MusicManager.getInstance().play("music_key", 0.3, true); // Quieter
```

### Music Continues After Scene Change
Stop music before transitioning:
```typescript
MusicManager.getInstance().stop(true);
this.scene.start("NextScene");
```

## Future Enhancements

Potential improvements for the music system:
- **Playlist Support**: Queue multiple tracks
- **Adaptive Music**: Change music based on game state
- **Music Layers**: Add/remove layers dynamically
- **Save Music Preferences**: Persist volume settings
- **Music Visualizer**: Visual feedback for music
- **Ducking**: Lower music volume during dialogue

## Notes

- The MusicManager is a singleton, so all scenes share the same instance
- Music state persists across scene transitions unless explicitly stopped
- Fade durations can be customized globally using `setFadeDurations()`
- The system automatically handles cleanup when scenes are destroyed
- All scenes reference MusicManager, but only call `play()` and `stop()`
- MusicManager handles all music logic internally

# MusicManager Architecture

## ✅ Current Implementation Status

The `MusicManager` **completely owns all music logic**! 🎉

## Architecture Overview

### 🎵 MusicManager Owns EVERYTHING

The `MusicManager` is the **single source of truth** for:
1. **Music file paths** - Which .mp3 files exist and where
2. **Scene assignments** - Which music plays in which scene
3. **Playback settings** - Volume levels, fade behavior, loop settings
4. **Music loading** - Tells Preloader what to load

### 🏗️ Complete Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│                     MusicManager                        │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Music Track Definitions (musicTracks)             │ │
│  │ - Which .mp3 files exist                          │ │
│  │ - File paths for each track                       │ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Scene Music Assignments (sceneMusicMap)           │ │
│  │ - Which track plays in which scene                │ │
│  │ - Volume, fade, loop for each scene               │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
              ▲                              ▲
              │                              │
     ┌────────┴────────┐          ┌────────┴────────┐
     │   Preloader     │          │     Scenes      │
     │  Gets tracks    │          │  Just call      │
     │  Loads files    │          │  playSceneMusic()│
     └─────────────────┘          └─────────────────┘
```

## 📋 Music Track Definitions

All music files are defined in `MusicManager.ts`:

```typescript
private readonly musicTracks: MusicTrackDefinition[] = [
  { key: "disclaimer_music", path: "music/bathala_disclaimer.mp3" },
  { key: "placeholder_music", path: "music/bathalaMusicPLHDR.mp3" },
  { key: "main_menu_music", path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3" },
  // Add more music tracks here
];
```

**Preloader reads this** to know what to load:
```typescript
const musicManager = MusicManager.getInstance();
const musicTracks = musicManager.getMusicTracks();

for (const track of musicTracks) {
  this.load.audio(track.key, track.path);
}
```

## 📋 Scene-to-Music Mapping

All music assignments are defined in `sceneMusicMap` inside `MusicManager.ts`:

```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  // Boot & Disclaimer
  "Boot": { musicKey: "disclaimer_music", volume: 0.4, fadeIn: true, loop: true },
  "Disclaimer": { musicKey: "disclaimer_music", volume: 0.4, fadeIn: false, loop: true },
  
  // Main Scenes
  "MainMenu": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true, loop: true },
  "Overworld": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true, loop: true },
  
  // Combat Scenes
  "Combat": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true, loop: true },
  
  // Activity Scenes
  "Shop": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true, loop: true },
  "Campfire": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true, loop: true },
  "EventScene": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true, loop: true },
  "Treasure": { musicKey: "placeholder_music", volume: 0.4, fadeIn: true, loop: true },
  
  // UI Scenes
  "GameOver": { musicKey: "placeholder_music", volume: 0.5, fadeIn: true, loop: true },
  "Credits": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true, loop: true },
  "Settings": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true, loop: true },
  "Discover": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true, loop: true },
  
  // Tutorial
  "Prologue": { musicKey: "placeholder_music", volume: 0.3, fadeIn: true, loop: true },
};
```

### 🎮 How Scenes Use It (Simple!)

Scenes **never specify which music to play**. They just call:

```typescript
create() {
  // Step 1: Tell MusicManager which scene this is
  const musicManager = MusicManager.getInstance();
  musicManager.setScene(this);
  
  // Step 2: Let MusicManager handle everything
  musicManager.playSceneMusic(); // That's it!
}

shutdown() {
  // Stop music when leaving scene
  MusicManager.getInstance().stopMusic();
}
```

### 🔄 What MusicManager Does Automatically

When a scene calls `playSceneMusic()`:

1. **Looks up the scene** in `sceneMusicMap`
2. **Reads the configuration**:
   - Which music track (`musicKey`)
   - Volume level (`volume`)
   - Fade in behavior (`fadeIn`)
   - Loop setting (`loop`)
3. **Plays the music** with all those settings
4. **Prevents redundant restarts** if the same music is already playing

### 🎯 Example Flow

```typescript
// In MainMenu.ts
create() {
  MusicManager.getInstance().setScene(this);
  MusicManager.getInstance().playSceneMusic();
  // ↓
  // MusicManager sees: "Oh, this is MainMenu scene"
  // MusicManager looks up: "MainMenu needs placeholder_music at 0.5 volume, fade in, loop"
  // MusicManager plays: "placeholder_music" with those exact settings
}
```

## 🎼 Adding New Music - Complete Guide

### Step 1: Add the music file

Place your `.mp3` file in `public/assets/music/`:
```
public/assets/music/
  ├── bathalaMusicPLHDR.mp3
  ├── bathala_disclaimer.mp3
  └── your_new_track.mp3  ← Add here
```

### Step 2: Define the track in MusicManager

Open `MusicManager.ts` and add to `musicTracks`:
```typescript
private readonly musicTracks: MusicTrackDefinition[] = [
  { key: "disclaimer_music", path: "music/bathala_disclaimer.mp3" },
  { key: "placeholder_music", path: "music/bathalaMusicPLHDR.mp3" },
  { key: "your_new_track", path: "music/your_new_track.mp3" },  // ← Add this
];
```

### Step 3: Assign to scenes

In the same file, update `sceneMusicMap`:
```typescript
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  "Combat": { 
    musicKey: "your_new_track",  // ← Use the key from Step 2
    volume: 0.6,
    fadeIn: true,
    loop: true
  },
  // ... other scenes
};
```

### Step 4: Done! 🎉

- **Preloader** automatically loads the new track
- **Combat scene** automatically plays it
- **No changes needed** in scene files!

## 🏗️ Why This Architecture Works

### ✅ Complete Centralization
- **One place** to define all music files
- **One place** to assign music to scenes
- **Zero duplication** across the codebase

### ✅ No Scene Knowledge
- Scenes never know about `.mp3` files
- Scenes never know about file paths
- Scenes just call `playSceneMusic()`

### ✅ Easy Maintenance
- Change a music track? Edit one line in MusicManager
- Add new music? Edit MusicManager, Preloader auto-updates
- Rename a file? Edit one path in MusicManager

### ✅ Type Safety
- TypeScript ensures all configurations are valid
- Compile-time errors if music keys don't match

## 🔧 Special Cases

### Boss Music Override

If you need to temporarily override scene music (e.g., boss fight):

```typescript
// In Combat.ts, when boss appears:
MusicManager.getInstance().playMusic("boss_music", 0.7, true, true);

// When boss defeated, return to normal:
MusicManager.getInstance().playSceneMusic(); // Back to "Combat" scene's default
```

## 📊 Benefits of This Architecture

✅ **Centralized Control**: All music assignments in one place  
✅ **No Scene Duplication**: Scenes never know about music files  
✅ **Easy Updates**: Change music in one place, affects all scenes  
✅ **Type Safety**: TypeScript ensures valid configurations  
✅ **Smart Playback**: Prevents redundant restarts of same music  

## 🎵 Current Music Assignments

| Scene | Music Track | Volume | Fade In | Loop |
|-------|-------------|--------|---------|------|
| Boot | `disclaimer_music` | 0.4 | ✅ | ✅ |
| Disclaimer | `disclaimer_music` | 0.4 | ❌ | ✅ |
| MainMenu | `placeholder_music` | 0.5 | ✅ | ✅ |
| Overworld | `placeholder_music` | 0.4 | ✅ | ✅ |
| Combat | `placeholder_music` | 0.5 | ✅ | ✅ |
| Shop | `placeholder_music` | 0.4 | ✅ | ✅ |
| Campfire | `placeholder_music` | 0.4 | ✅ | ✅ |
| EventScene | `placeholder_music` | 0.4 | ✅ | ✅ |
| Treasure | `placeholder_music` | 0.4 | ✅ | ✅ |
| GameOver | `placeholder_music` | 0.5 | ✅ | ✅ |
| Credits | `placeholder_music` | 0.3 | ✅ | ✅ |
| Settings | `placeholder_music` | 0.3 | ✅ | ✅ |
| Discover | `placeholder_music` | 0.3 | ✅ | ✅ |
| Prologue | `placeholder_music` | 0.3 | ✅ | ✅ |

## 🚀 Next Steps

Replace `placeholder_music` with actual music tracks:

1. Add music files to your assets folder
2. Load them in `Preloader.ts`
3. Update `sceneMusicMap` in `MusicManager.ts`

**That's it!** The architecture is already perfect. 🎉

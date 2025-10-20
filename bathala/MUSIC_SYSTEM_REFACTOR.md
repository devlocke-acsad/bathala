# Music System Refactor - Complete Ownership by MusicManager

## 🎯 What Changed

The `MusicManager` now **owns EVERYTHING** related to music:

### Before ❌
- **Preloader** defined music file paths (`"bathalaMusicPLHDR.mp3"`)
- **MusicManager** only knew about keys (`"placeholder_music"`)
- **Scenes** called `playSceneMusic()` (this part was already good!)

### After ✅
- **MusicManager** defines music file paths AND keys
- **Preloader** asks MusicManager what to load
- **Scenes** still just call `playSceneMusic()` (no changes!)

## 📁 Files Changed

### 1. `MusicManager.ts` - Added Music Track Definitions

```typescript
// NEW: Music file definitions
interface MusicTrackDefinition {
  key: string;         // Unique identifier
  path: string;        // File path relative to assets folder
}

// NEW: Complete music library
private readonly musicTracks: MusicTrackDefinition[] = [
  { key: "disclaimer_music", path: "music/bathala_disclaimer.mp3" },
  { key: "placeholder_music", path: "music/bathalaMusicPLHDR.mp3" },
  { key: "main_menu_music", path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3" },
];

// NEW: Public method for Preloader
getMusicTracks(): MusicTrackDefinition[] {
  return this.musicTracks;
}
```

### 2. `Preloader.ts` - Now Reads from MusicManager

**Before:**
```typescript
// ❌ Preloader knew about file paths
this.load.audio("placeholder_music", "music/bathalaMusicPLHDR.mp3");
this.load.audio("disclaimer_music", "music/bathala_disclaimer.mp3");
```

**After:**
```typescript
// ✅ Preloader asks MusicManager what to load
const musicManager = MusicManager.getInstance();
const musicTracks = musicManager.getMusicTracks();

for (const track of musicTracks) {
  console.log(`Loading music: ${track.key} from ${track.path}`);
  this.load.audio(track.key, track.path);
}
```

### 3. Scene Files - NO CHANGES! 🎉

Scenes still just do:
```typescript
create() {
  MusicManager.getInstance().setScene(this);
  MusicManager.getInstance().playSceneMusic();
}
```

## 🎵 Current Music Library

| Key | File Path | Used By |
|-----|-----------|---------|
| `disclaimer_music` | `music/bathala_disclaimer.mp3` | Boot, Disclaimer |
| `placeholder_music` | `music/bathalaMusicPLHDR.mp3` | Most scenes |
| `main_menu_music` | `music/Bathala_Soundtrack/Bathala_MainMenu.mp3` | Ready to use |

## 🚀 How to Add New Music

### 1. Add the file
Place your `.mp3` in `public/assets/music/`

### 2. Edit ONE file: `MusicManager.ts`

```typescript
// Add to musicTracks array:
private readonly musicTracks: MusicTrackDefinition[] = [
  // ... existing tracks
  { key: "combat_music", path: "music/combat_theme.mp3" },  // Add this
];

// Assign to scenes:
private readonly sceneMusicMap: Record<string, SceneMusicConfig> = {
  "Combat": { 
    musicKey: "combat_music",  // Use new key here
    volume: 0.6,
    fadeIn: true,
    loop: true
  },
  // ... other scenes
};
```

### 3. Done!
- Preloader automatically loads it
- Combat scene automatically plays it
- No other files need changes

## 📊 Benefits

### ✅ Single Source of Truth
All music configuration is in `MusicManager.ts`:
- File paths
- Scene assignments
- Playback settings

### ✅ Zero Duplication
No more defining the same file path in multiple places.

### ✅ Easy Refactoring
- Rename a music file? Change one path.
- Swap tracks between scenes? Change one key.
- Add new music? Add one entry.

### ✅ Type Safety
TypeScript ensures:
- All music keys exist
- All paths are strings
- All configurations are valid

## 🎯 Architecture Diagram

```
┌──────────────────────────────────────────────┐
│           MusicManager.ts                    │
│  ┌────────────────────────────────────────┐ │
│  │ musicTracks: [                         │ │
│  │   { key, path },  ← Defines files      │ │
│  │   { key, path }                        │ │
│  │ ]                                      │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ sceneMusicMap: {                       │ │
│  │   Scene: { key, volume, fade, loop }  │ │  
│  │   ← Assigns to scenes                  │ │
│  │ }                                      │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
              ▲                    ▲
              │                    │
    ┌─────────┴────────┐  ┌───────┴────────┐
    │   Preloader.ts   │  │   Scenes       │
    │ getMusicTracks() │  │ playSceneMusic()│
    │ Loads everything │  │ That's it!     │
    └──────────────────┘  └────────────────┘
```

## ✅ Testing Checklist

- [ ] Music plays in Boot scene
- [ ] Music plays in Disclaimer scene
- [ ] Music plays in MainMenu
- [ ] Music plays in Overworld
- [ ] Music plays in Combat
- [ ] Music transitions smoothly between scenes
- [ ] No errors in console about missing audio keys

## 📝 Notes

- The `main_menu_music` track is loaded but not yet assigned to MainMenu
- To use it, change `MainMenu` entry in `sceneMusicMap` to use `"main_menu_music"` instead of `"placeholder_music"`
- All music files must be in `public/assets/music/` folder
- Supported formats: `.mp3`, `.ogg`, `.wav`

## 🎉 Result

**MusicManager is now the SOLE owner of all music logic!**

- Scenes: Just call `playSceneMusic()` ✅
- Preloader: Just asks MusicManager what to load ✅
- MusicManager: Controls everything ✅

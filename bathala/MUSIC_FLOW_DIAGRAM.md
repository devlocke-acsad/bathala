# Music System - Complete Flow Diagram

## 🎵 How Music Works in Bathala (After Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│                     MusicManager.ts                             │
│                 (SINGLE SOURCE OF TRUTH)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: Define Music Files                                    │
│  ──────────────────────────────────────────                    │
│  private readonly musicTracks = [                              │
│    { key: "disclaimer_music",                                  │
│      path: "music/bathala_disclaimer.mp3" },                   │
│    { key: "placeholder_music",                                 │
│      path: "music/bathalaMusicPLHDR.mp3" },                    │
│    { key: "main_menu_music",                                   │
│      path: "music/Bathala_Soundtrack/Bathala_MainMenu.mp3" }  │
│  ]                                                             │
│                                                                 │
│  Step 2: Assign to Scenes                                      │
│  ────────────────────────────────                              │
│  private readonly sceneMusicMap = {                            │
│    "Boot": {                                                   │
│      musicKey: "disclaimer_music",                             │
│      volume: 0.4, fadeIn: true, loop: true                     │
│    },                                                          │
│    "MainMenu": {                                               │
│      musicKey: "placeholder_music",                            │
│      volume: 0.5, fadeIn: true, loop: true                     │
│    },                                                          │
│    "Combat": {                                                 │
│      musicKey: "placeholder_music",                            │
│      volume: 0.5, fadeIn: true, loop: true                     │
│    }                                                           │
│    // ... all other scenes                                     │
│  }                                                             │
│                                                                 │
│  Step 3: Public API                                            │
│  ──────────────────                                            │
│  getMusicTracks() → Returns all music files to load           │
│  playSceneMusic() → Plays music for current scene             │
│  stopMusic()      → Stops current music                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                                          │
         │ getMusicTracks()                         │ playSceneMusic()
         │                                          │
         ▼                                          ▼
┌──────────────────────┐                  ┌──────────────────────┐
│   Preloader.ts       │                  │   Any Scene.ts       │
│   (At Startup)       │                  │   (Runtime)          │
├──────────────────────┤                  ├──────────────────────┤
│                      │                  │                      │
│ preload() {          │                  │ create() {           │
│   const tracks =     │                  │   const mgr =        │
│     MusicManager     │                  │     MusicManager     │
│     .getInstance()   │                  │     .getInstance();  │
│     .getMusicTracks()│                  │                      │
│                      │                  │   mgr.setScene(this);│
│   // Loads:          │                  │   mgr.playSceneMusic│
│   // disclaimer_music│                  │       ();            │
│   // placeholder_music│                  │ }                    │
│   // main_menu_music │                  │                      │
│   for (track) {      │                  │ // MusicManager:     │
│     load.audio(...)  │                  │ // 1. Sees scene key │
│   }                  │                  │ // 2. Looks up map   │
│ }                    │                  │ // 3. Gets settings  │
│                      │                  │ // 4. Plays music!   │
└──────────────────────┘                  └──────────────────────┘
```

## 🔄 Example: Combat Scene Flow

```
User clicks "Start New Run"
         │
         ▼
┌────────────────────┐
│  Combat Scene      │
│  create() called   │
└────────────────────┘
         │
         │ MusicManager.getInstance().setScene(this)
         │ MusicManager.getInstance().playSceneMusic()
         ▼
┌────────────────────────────────────────────────┐
│  MusicManager                                  │
│  ─────────────                                 │
│  1. Current scene key: "Combat"                │
│  2. Look up sceneMusicMap["Combat"]            │
│  3. Found: {                                   │
│       musicKey: "placeholder_music",           │
│       volume: 0.5,                             │
│       fadeIn: true,                            │
│       loop: true                               │
│     }                                          │
│  4. Check: Is "placeholder_music" loaded?      │
│     ✅ Yes (Preloader loaded it)               │
│  5. Check: Is it already playing?              │
│     ❌ No                                       │
│  6. Play "placeholder_music":                  │
│     - Start at volume 0                        │
│     - Fade in to 0.5 over 1 second             │
│     - Loop continuously                        │
└────────────────────────────────────────────────┘
         │
         ▼
    🎵 Music plays! 🎵
```

## 📝 Adding New Music - Step by Step

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Add File                                       │
│  ────────────────                                       │
│  public/assets/music/                                   │
│    └── boss_battle.mp3  ← Add your file here           │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: Edit MusicManager.ts ONLY                     │
│  ──────────────────────────────────                     │
│                                                         │
│  A) Add to musicTracks:                                │
│     private readonly musicTracks = [                   │
│       // ... existing                                  │
│       { key: "boss_music",                             │
│         path: "music/boss_battle.mp3" }  ← Add this   │
│     ]                                                  │
│                                                         │
│  B) Assign to scene(s):                                │
│     private readonly sceneMusicMap = {                 │
│       "Combat": {                                      │
│         musicKey: "boss_music",  ← Change this        │
│         volume: 0.7,                                   │
│         fadeIn: true,                                  │
│         loop: true                                     │
│       }                                                │
│     }                                                  │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: Automatic!                                     │
│  ──────────────                                         │
│  ✅ Preloader loads "boss_music" automatically          │
│  ✅ Combat scene plays it automatically                 │
│  ✅ No changes needed anywhere else!                    │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Key Principles

### 1. MusicManager Owns Everything
```
MusicManager knows:
├── Which .mp3 files exist
├── Where they are located
├── Which scenes use which tracks
├── Volume, fade, loop for each scene
└── How to play/stop/crossfade
```

### 2. Preloader is a Servant
```
Preloader:
├── Asks MusicManager: "What should I load?"
├── Gets list of music tracks
└── Loads them all
```

### 3. Scenes are Oblivious
```
Scenes:
├── Don't know about .mp3 files
├── Don't know about file paths
├── Don't know about volume/fade/loop
└── Just call: playSceneMusic()
```

## 🚀 Result

**ONE file to rule them all: `MusicManager.ts`**

Want to:
- Add new music? → Edit `MusicManager.ts`
- Change scene music? → Edit `MusicManager.ts`
- Adjust volume? → Edit `MusicManager.ts`
- Rename a file? → Edit `MusicManager.ts`

**Everything else updates automatically!** 🎉

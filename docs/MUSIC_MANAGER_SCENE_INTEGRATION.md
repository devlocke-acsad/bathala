# MusicManager Scene Integration - Testing Update

## ✅ Changes Made

### MusicManager Configuration
Updated `sceneMusicMap` in `MusicManager.ts`:
- **Disclaimer/Boot/Prologue**: Uses `placeholder_music` (bathalaMusicPLHD.mp3)
- **MainMenu**: Uses `main_menu_music` (Bathala_MainMenu.mp3)

### Scenes Updated

#### 1. Disclaimer.ts ✅
- Added `private music?: Phaser.Sound.BaseSound` property
- Added `startMusic()` method that uses `MusicManager.getInstance().getMusicKeyForScene()`
- Added `shutdown()` method to stop music when leaving scene
- Music starts automatically in `create()`

#### 2. MainMenu.ts ✅
- Added `private music?: Phaser.Sound.BaseSound` property
- Added `startMusic()` method
- Added `shutdown()` method
- Removed all `MusicManager.getInstance().stopMusic()` calls from menu buttons
- Music stops automatically via `shutdown()` when transitioning scenes

#### 3. Preloader.ts ✅
- Removed `MusicManager.getInstance().setScene(this)`
- Removed `MusicManager.getInstance().playSceneMusic()`
- Fixed `add: false` parameter issue with graphics
- Scenes now handle their own music playback

## 🎵 How It Works Now

### Scene Lifecycle
1. **Scene starts** → `create()` calls `startMusic()`
2. **startMusic()** → Queries MusicManager for the music key
3. **Plays music** → Uses Phaser's `this.sound.add()` and `play()`
4. **Scene ends** → `shutdown()` stops and cleans up music

### Example Pattern (Used in Both Scenes)
```typescript
private music?: Phaser.Sound.BaseSound;

create() {
  this.startMusic();
  // ... rest of create logic
}

private startMusic(): void {
  const manager = MusicManager.getInstance();
  const musicConfig = manager.getMusicKeyForScene(this.scene.key);
  
  if (musicConfig) {
    this.music = this.sound.add(musicConfig.musicKey, {
      volume: manager.getEffectiveMusicVolume(),
      loop: true
    });
    this.music.play();
  }
}

shutdown(): void {
  if (this.music) {
    this.music.stop();
    this.music = undefined;
  }
}
```

## 🧪 Testing Instructions

1. **Start the game** → Should hear placeholder music during disclaimer
2. **Wait for main menu** → Music should transition to main menu track
3. **Click any menu option** → Music stops automatically, new scene handles its own music
4. **Navigate back to menu** → Main menu music starts fresh

## 📊 Current Scene Music Map

| Scene | Music Track | File |
|-------|-------------|------|
| Boot | placeholder_music | bathalaMusicPLHD.mp3 |
| Disclaimer | placeholder_music | bathalaMusicPLHD.mp3 |
| **MainMenu** | **main_menu_music** | **Bathala_MainMenu.mp3** |
| Prologue | placeholder_music | bathalaMusicPLHD.mp3 |
| Overworld | placeholder_music | bathalaMusicPLHD.mp3 |
| Combat | placeholder_music | bathalaMusicPLHD.mp3 |
| Shop | placeholder_music | bathalaMusicPLHD.mp3 |
| All Others | placeholder_music | bathalaMusicPLHD.mp3 |

## 🎯 Next Steps

To add music to other scenes, follow the same pattern:
1. Add `private music?: Phaser.Sound.BaseSound` property
2. Copy the `startMusic()` and `shutdown()` methods
3. Call `this.startMusic()` in the scene's `create()` method
4. Update `sceneMusicMap` in MusicManager.ts if you want a different track

## ⚠️ Minor Warnings (Non-Breaking)

These are just TypeScript unused variable warnings:
- `MainMenu.ts` line 285: `time` and `delta` parameters in `update()` (not used)
- `Preloader.ts` line 63: `texture` variable (stored but not used after generation)
- `Preloader.ts` line 686: `time` parameter in `update()` (not used)

These don't affect functionality.

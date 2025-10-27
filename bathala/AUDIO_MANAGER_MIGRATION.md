# AudioManager Migration Examples

## Example 1: Combat Scene

### Before (MusicManager only)
```typescript
import { MusicManager } from "../core/managers/MusicManager";

export class Combat extends Phaser.Scene {
  private musicManager: MusicManager;

  create() {
    this.musicManager = MusicManager.getInstance();
    this.musicManager.setScene(this);
    this.musicManager.playSceneMusic();

    // No sound effects management
    // Had to manually manage sounds:
    this.attackSound = this.sound.add("sword_hit");
    this.hurtSound = this.sound.add("enemy_hurt");
  }

  playerAttack() {
    this.attackSound.play();
  }

  enemyHit() {
    this.hurtSound.play();
  }

  shutdown() {
    this.musicManager.stopMusic();
    // Had to manually stop sounds:
    this.attackSound.stop();
    this.hurtSound.stop();
  }
}
```

### After (AudioManager)
```typescript
import { AudioManager } from "../core/managers/MusicManager";

export class Combat extends Phaser.Scene {
  private audioManager: AudioManager;

  create() {
    this.audioManager = AudioManager.getInstance();
    this.audioManager.setScene(this);
    this.audioManager.playSceneMusic();

    // Create sound pools for frequently used sounds
    this.audioManager.createSoundPool("sword_hit", 10);
    this.audioManager.createSoundPool("enemy_hurt", 8);
  }

  playerAttack(enemy: Enemy) {
    // Use pooled sound for performance
    this.audioManager.playPooledSFX("sword_hit");
    
    // Spatial sound at enemy position
    if (this.hitEnemy(enemy)) {
      this.audioManager.playSpatialSFX("enemy_hurt", enemy.x, enemy.y);
    }
  }

  update() {
    // Update spatial audio listener to follow player
    this.audioManager.setListenerPosition(this.player.x, this.player.y);
  }

  shutdown() {
    this.audioManager.stopMusic();
    this.audioManager.stopAllSFX();
    // No need to manually track sounds!
  }
}
```

---

## Example 2: Settings Menu

### Before (MusicManager only)
```typescript
export class Settings extends Phaser.Scene {
  create() {
    const musicManager = MusicManager.getInstance();
    
    // Only music volume control
    this.musicSlider = this.add.slider({
      min: 0,
      max: 1,
      onChange: (value) => {
        musicManager.setVolume(value);
      }
    });

    // Mute button (only music)
    this.muteButton.on("pointerdown", () => {
      musicManager.toggleMute();
    });
  }
}
```

### After (AudioManager)
```typescript
export class Settings extends Phaser.Scene {
  create() {
    const audio = AudioManager.getInstance();
    
    // Separate volume controls
    this.musicSlider = this.add.slider({
      min: 0,
      max: 1,
      value: audio.getMusicVolume(),
      onChange: (value) => {
        audio.setMusicVolume(value);
      }
    });

    this.sfxSlider = this.add.slider({
      min: 0,
      max: 1,
      value: audio.getSFXVolume(),
      onChange: (value) => {
        audio.setSFXVolume(value);
        // Preview SFX volume
        audio.playSFX("ui_click");
      }
    });

    this.masterSlider = this.add.slider({
      min: 0,
      max: 1,
      value: audio.getMasterVolume(),
      onChange: (value) => {
        audio.setMasterVolume(value);
      }
    });

    // Individual mute buttons
    this.musicMuteBtn.on("pointerdown", () => {
      audio.toggleMusicMute();
      this.updateMuteIcons();
    });

    this.sfxMuteBtn.on("pointerdown", () => {
      audio.toggleSFXMute();
      this.updateMuteIcons();
    });

    this.masterMuteBtn.on("pointerdown", () => {
      audio.toggleMasterMute();
      this.updateMuteIcons();
    });
  }

  updateMuteIcons() {
    const states = AudioManager.getInstance().getMuteStates();
    this.musicMuteIcon.setTexture(states.music ? "mute" : "unmute");
    this.sfxMuteIcon.setTexture(states.sfx ? "mute" : "unmute");
    this.masterMuteIcon.setTexture(states.master ? "mute" : "unmute");
  }
}
```

---

## Example 3: Overworld Scene

### Before (MusicManager only)
```typescript
export class Overworld extends Phaser.Scene {
  create() {
    MusicManager.getInstance().setScene(this);
    MusicManager.getInstance().playSceneMusic();

    // Manual ambient sound management
    this.windSound = this.sound.add("wind", { loop: true, volume: 0.2 });
    this.windSound.play();

    this.waterSound = this.sound.add("water", { loop: true, volume: 0.3 });
    this.waterSound.play();
  }

  shutdown() {
    MusicManager.getInstance().stopMusic();
    this.windSound.stop();
    this.waterSound.stop();
  }
}
```

### After (AudioManager)
```typescript
export class Overworld extends Phaser.Scene {
  create() {
    const audio = AudioManager.getInstance();
    audio.setScene(this);
    audio.playSceneMusic();

    // Play ambient loops with automatic management
    audio.playSFX("wind_ambience", { loop: true, volume: 0.2 });
    
    // Spatial waterfall sound
    audio.playSpatialSFX("waterfall", 500, 300, {
      loop: true,
      volume: 0.5,
      source: {
        panningModel: "HRTF",
        refDistance: 100,
        maxDistance: 1000,
      }
    });
  }

  update() {
    // Update spatial audio listener
    const audio = AudioManager.getInstance();
    audio.setListenerPosition(this.player.x, this.player.y);
  }

  shutdown() {
    const audio = AudioManager.getInstance();
    audio.stopMusic();
    audio.stopAllSFX(); // Automatically stops all SFX including loops
  }
}
```

---

## Example 4: UI Button Sounds

### Before (Manual management)
```typescript
export class MainMenu extends Phaser.Scene {
  create() {
    // Manually create and track sounds
    this.hoverSound = this.sound.add("ui_hover");
    this.clickSound = this.sound.add("ui_click");

    const button = this.add.text(100, 100, "Start Game")
      .setInteractive()
      .on("pointerover", () => {
        this.hoverSound.play();
      })
      .on("pointerdown", () => {
        this.clickSound.play();
        this.startGame();
      });
  }
}
```

### After (AudioManager)
```typescript
export class MainMenu extends Phaser.Scene {
  create() {
    const audio = AudioManager.getInstance();
    
    // Create sound pools for UI (many buttons)
    audio.createSoundPool("ui_hover", 5);
    audio.createSoundPool("ui_click", 5);

    const button = this.add.text(100, 100, "Start Game")
      .setInteractive()
      .on("pointerover", () => {
        audio.playPooledSFX("ui_hover", { volume: 0.5 });
      })
      .on("pointerdown", () => {
        audio.playPooledSFX("ui_click", { volume: 0.7 });
        this.startGame();
      });
  }
}
```

---

## Example 5: Boss Fight

### Before (No dynamic music switching)
```typescript
export class BossFight extends Phaser.Scene {
  create() {
    MusicManager.getInstance().setScene(this);
    MusicManager.getInstance().playSceneMusic(); // Normal combat music
  }

  onBossPhase2() {
    // Can't dynamically change music
  }

  onBossDefeated() {
    MusicManager.getInstance().stopMusic();
    // Play victory music in next scene
  }
}
```

### After (Dynamic music with crossfading)
```typescript
export class BossFight extends Phaser.Scene {
  create() {
    const audio = AudioManager.getInstance();
    audio.setScene(this);
    
    // Start with boss intro music
    audio.playSceneMusic(undefined, "boss_intro");
    
    this.time.delayedCall(5000, () => {
      // Crossfade to boss battle theme
      audio.crossfadeMusic("boss_battle", 0.7);
    });
  }

  onBossPhase2() {
    // Intensify music for phase 2
    const audio = AudioManager.getInstance();
    audio.crossfadeMusic("boss_phase2", 0.8);
    
    // Play phase transition sound
    audio.playSFX("boss_roar", { volume: 1.0 });
  }

  onBossDefeated() {
    const audio = AudioManager.getInstance();
    
    // Stop battle music
    audio.stopMusic(true);
    
    // Play victory fanfare
    audio.playSFX("victory_fanfare", {
      volume: 0.9,
      onComplete: () => {
        this.scene.start("Victory");
      }
    });
  }
}
```

---

## Example 6: Audio Sprite for UI Sounds

### Before (Multiple audio files)
```typescript
// Preloader
this.load.audio("ui_hover", "assets/audio/ui_hover.mp3");
this.load.audio("ui_click", "assets/audio/ui_click.mp3");
this.load.audio("ui_back", "assets/audio/ui_back.mp3");
this.load.audio("ui_confirm", "assets/audio/ui_confirm.mp3");
// ... many more files

// Usage
this.sound.play("ui_hover");
this.sound.play("ui_click");
```

### After (Single audio sprite)
```typescript
// Preloader
this.load.audioSprite(
  "ui_sounds",
  ["assets/audio/ui_sounds.mp3", "assets/audio/ui_sounds.ogg"],
  "assets/audio/ui_sounds.json"
);

// Usage
const audio = AudioManager.getInstance();
audio.playAudioSprite("ui_sounds", "hover");
audio.playAudioSprite("ui_sounds", "click");
audio.playAudioSprite("ui_sounds", "back");
audio.playAudioSprite("ui_sounds", "confirm");
```

---

## Key Improvements Summary

1. **Automatic Cleanup** - No need to track and stop individual sounds
2. **Sound Pooling** - Better performance for frequent sounds
3. **Spatial Audio** - Positional 3D sound support
4. **Separate Volumes** - Music, SFX, and Master controls
5. **Audio Sprites** - Efficient audio atlases
6. **Crossfading** - Smooth music transitions
7. **Type Safety** - Full TypeScript support with interfaces
8. **Backward Compatible** - All old code still works

---

## Migration Checklist

- [ ] Replace `MusicManager` imports with `AudioManager`
- [ ] Update manual sound management to use `playSFX()` or `playPooledSFX()`
- [ ] Create sound pools for frequently played sounds
- [ ] Implement spatial audio for positional sounds
- [ ] Add separate volume controls in settings
- [ ] Convert multiple audio files to audio sprites where appropriate
- [ ] Update music transitions to use `crossfadeMusic()`
- [ ] Remove manual sound tracking and cleanup code
- [ ] Test all audio in-game
- [ ] Update documentation

---

## Performance Tips

### Before
```typescript
// Creating new sound instance every time (slow)
playerAttack() {
  this.sound.play("sword_hit");
}
```

### After (Option 1: Pooling)
```typescript
// Using sound pool (fast)
create() {
  AudioManager.getInstance().createSoundPool("sword_hit", 10);
}

playerAttack() {
  AudioManager.getInstance().playPooledSFX("sword_hit");
}
```

### After (Option 2: Audio Sprite)
```typescript
// Using audio sprite (very fast, fewer HTTP requests)
create() {
  // Loaded in Preloader
}

playerAttack() {
  AudioManager.getInstance().playAudioSprite("combat_sfx", "sword_hit");
}
```

---

**Migration Status**: ✅ Backward Compatible  
**Recommended Approach**: Gradual migration (old API works, add new features incrementally)

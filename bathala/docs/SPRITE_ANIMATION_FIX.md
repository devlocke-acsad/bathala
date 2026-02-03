# Sprite & Animation Fixes

## Date: October 20, 2025

## Issues Fixed

### 1. Player Animation Not Working When Holding Buttons
**Problem:** Animations weren't playing correctly because each direction used a different sprite sheet, but the player sprite was only created with one texture key. Phaser sprites can't play animations from different textures without switching the texture first.

**Solution:** 
- Renamed sprite sheets to simpler keys (`player_down`, `player_up`, `player_left`, `player_right`)
- Added texture switching in `movePlayer()` method before playing animations
- Now when the player moves in a direction, the sprite texture is switched to match that direction's sprite sheet

### 2. Shop Merchant Sprite Replacement
**Problem:** Shop nodes were using the necromancer sprite with 4-frame animation

**Solution:**
- Replaced with `merchant_overworld.png` static sprite
- Removed necromancer animation frames and animation creation
- Updated all references to use the new merchant sprite

---

## Changes Made

### Preloader.ts

#### Sprite Loading (Lines ~101-128)
**Changed texture keys from:**
- `overworld_player_down` → `player_down`
- `overworld_player_up` → `player_up`
- `overworld_player_left` → `player_left`
- `overworld_player_right` → `player_right`

**Replaced:**
```typescript
// OLD - Necromancer (4 frames)
this.load.image("necromancer_f0", "sprites/overworld/shop/necromancer_anim_f0.png");
this.load.image("necromancer_f1", "sprites/overworld/shop/necromancer_anim_f1.png");
this.load.image("necromancer_f2", "sprites/overworld/shop/necromancer_anim_f2.png");
this.load.image("necromancer_f3", "sprites/overworld/shop/necromancer_anim_f3.png");
```

**With:**
```typescript
// NEW - Merchant (static)
this.load.image("merchant_overworld", "sprites/overworld/shop/merchant_overworld.png");
```

#### Animation Creation (Lines ~405-470)
Updated all player animation references to use new texture keys:
- `avatar_idle_down` → uses `player_down` frame 1
- `avatar_walk_down` → uses `player_down` frames 0-2
- `avatar_idle_up` → uses `player_up` frame 1
- `avatar_walk_up` → uses `player_up` frames 0-2
- `avatar_idle_left` → uses `player_left` frame 0
- `avatar_walk_left` → uses `player_left` frames 0-1
- `avatar_idle_right` → uses `player_right` frame 0
- `avatar_walk_right` → uses `player_right` frames 0-1

**Removed necromancer animation:**
```typescript
// REMOVED
this.anims.create({
  key: "necromancer_idle",
  frames: [
    { key: "necromancer_f0" },
    { key: "necromancer_f1" },
    { key: "necromancer_f2" },
    { key: "necromancer_f3" }
  ],
  frameRate: 4,
  repeat: -1,
});
```

#### Texture Filtering (Lines ~304-320)
Updated to apply NEAREST filter to new texture keys.

---

### Overworld.ts

#### Player Sprite Creation (Lines ~253-268)
**Changed:**
```typescript
// OLD
this.player = this.add.sprite(x, y, "overworld_player_down");

// NEW
this.player = this.add.sprite(x, y, "player_down");
```

#### Movement Function (Lines ~1043-1082)
**Added texture switching logic:**

```typescript
movePlayer(targetX: number, targetY: number, direction: string): void {
  // ... existing code ...
  
  let walkAnimation = "avatar_walk_down";
  let idleAnimation = "avatar_idle_down";
  let textureKey = "player_down"; // NEW!
  
  switch (direction) {
    case "up":
      walkAnimation = "avatar_walk_up";
      idleAnimation = "avatar_idle_up";
      textureKey = "player_up"; // NEW!
      break;
    case "down":
      walkAnimation = "avatar_walk_down";
      idleAnimation = "avatar_idle_down";
      textureKey = "player_down"; // NEW!
      break;
    case "left":
      walkAnimation = "avatar_walk_left";
      idleAnimation = "avatar_idle_left";
      textureKey = "player_left"; // NEW!
      break;
    case "right":
      walkAnimation = "avatar_walk_right";
      idleAnimation = "avatar_idle_right";
      textureKey = "player_right"; // NEW!
      break;
  }
  
  // Switch texture to match the direction - CRITICAL FIX!
  this.player.setTexture(textureKey);
  
  // Now play the animation
  this.player.play(walkAnimation, true);
  
  // ... rest of movement code ...
}
```

**Why This Works:**
- Before: Sprite created with `player_down`, tried to play `avatar_walk_up` animation → ERROR (different texture)
- After: Sprite texture switched to `player_up` THEN plays `avatar_walk_up` animation → SUCCESS

---

### Overworld_MazeGenManager.ts (Lines ~673-674)
**Changed:**
```typescript
// OLD
spriteKey = "necromancer_f0";
animKey = "necromancer_idle";

// NEW
spriteKey = "merchant_overworld";
animKey = null; // Static sprite, no animation
```

---

### Overworld_TooltipManager.ts (Lines ~461-462)
**Changed:**
```typescript
// OLD
spriteKey: "necromancer_f0",
animationKey: "necromancer_idle",

// NEW
spriteKey: "merchant_overworld",
animationKey: null, // Static sprite, no animation
```

---

## Technical Explanation: Why Animations Weren't Working

### The Core Issue
In Phaser 3, when you create a sprite with a specific texture:
```typescript
this.player = this.add.sprite(x, y, "player_down");
```

That sprite is "bound" to the `player_down` texture atlas. When you try to play an animation that references a DIFFERENT texture:
```typescript
// This animation uses "player_up" frames
this.player.play("avatar_walk_up");
```

**Phaser can't find the frames** because it's looking for them in the `player_down` atlas, not `player_up`.

### The Solution
Before playing any animation, we must switch the sprite's texture to match:
```typescript
this.player.setTexture("player_up");  // Switch to correct atlas
this.player.play("avatar_walk_up");   // Now it can find the frames!
```

### Why It Matters for Held Buttons
When you hold a directional button:
1. First frame: Movement starts → calls `movePlayer()` → texture switches → animation plays ✓
2. Subsequent frames: Movement continues → calls `movePlayer()` again → texture already correct → animation continues ✓

Without the texture switching:
1. First frame: Movement starts → tries to play wrong texture animation → fails ✗
2. Subsequent frames: Same failure ✗

---

## Animation Frame Structure

### Down & Up Directions (3 frames each)
```
Frame 0: Left foot forward
Frame 1: Standing (IDLE pose - middle frame)
Frame 2: Right foot forward
```

### Left & Right Directions (2 frames each)
```
Frame 0: Standing (IDLE pose)
Frame 1: Walking pose
```

---

## Files Changed
1. `src/game/scenes/Preloader.ts` - Sprite loading, animation creation, texture filtering
2. `src/game/scenes/Overworld.ts` - Player sprite creation, movement with texture switching
3. `src/game/scenes/Overworld_MazeGenManager.ts` - Shop node sprite reference
4. `src/game/scenes/Overworld_TooltipManager.ts` - Shop tooltip sprite reference

---

## Testing Checklist
- [x] Player sprite displays correctly on spawn
- [x] Walking animations play when moving in all 4 directions
- [x] Walking animations continue smoothly when holding buttons
- [x] Idle animations display when stopped
- [x] Shop nodes display merchant sprite instead of necromancer
- [x] No animation errors in console
- [x] Texture switching doesn't cause flickering
- [x] Pixel art remains crisp with NEAREST filtering

---

## Asset Files Used
- `public/assets/sprites/overworld/player/mc_down.png` (48x16 - 3 frames)
- `public/assets/sprites/overworld/player/mc_up.png` (48x16 - 3 frames)
- `public/assets/sprites/overworld/player/mc_left.png` (32x16 - 2 frames)
- `public/assets/sprites/overworld/player/mc_right.png` (32x16 - 2 frames)
- `public/assets/sprites/overworld/shop/merchant_overworld.png` (static sprite)

---

## Notes
- All player animations run at 6 FPS for consistent pixel art look
- Player sprite scales 2x (from 16x16 to 32x32) in game
- Default facing direction is DOWN when spawning
- Merchant sprite is static (no animation frames needed)
- The `animKey` null check in MazeGenManager handles static sprites properly

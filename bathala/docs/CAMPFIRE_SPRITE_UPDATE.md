# Campfire Sprite Update

## Date: October 20, 2025

## Changes Made

### Campfire Sprite Replacement
**Replaced:** Angel sprite (4 frames) with animated campfire sprite (6 frames)

**New Sprite Specifications:**
- File: `campfire_overworld.png`
- Frame size: 32x48 pixels
- Frame count: 6 frames
- Layout: Horizontal sprite sheet (192x48 total)

---

## Implementation Details

### 1. Preloader.ts Changes

#### Sprite Loading (Lines ~208-218)
**Before:**
```typescript
// Campfire node sprites (angel)
this.load.image("angel_f0", "sprites/overworld/campfire/angel_idle_anim_f0.png");
this.load.image("angel_f1", "sprites/overworld/campfire/angel_idle_anim_f1.png");
this.load.image("angel_f2", "sprites/overworld/campfire/angel_idle_anim_f2.png");
this.load.image("angel_f3", "sprites/overworld/campfire/angel_idle_anim_f3.png");

// Add campfire spritesheet for animated campfire
this.load.spritesheet("campfire", "sprites/overworld/campfire/angel_idle_anim_f0.png", {
  frameWidth: 16,
  frameHeight: 16,
});
```

**After:**
```typescript
// Campfire node sprite (6-frame animation, 32x48 per frame)
this.load.spritesheet("campfire_overworld", "sprites/overworld/campfire/campfire_overworld.png", {
  frameWidth: 32,
  frameHeight: 48,
});
```

#### Animation Creation (Lines ~560-585)
**Before:**
```typescript
this.anims.create({
  key: "angel_idle",
  frames: [
    { key: "angel_f0" },
    { key: "angel_f1" },
    { key: "angel_f2" },
    { key: "angel_f3" }
  ],
  frameRate: 4,
  repeat: -1,
});

this.anims.create({
  key: "campfire_burn",
  frames: [
    { key: "angel_f0" },
    { key: "angel_f1" },
    { key: "angel_f2" },
    { key: "angel_f3" }
  ],
  frameRate: 4,
  repeat: -1,
});
```

**After:**
```typescript
// Campfire animation (6 frames from spritesheet)
this.anims.create({
  key: "campfire_burn",
  frames: this.anims.generateFrameNumbers("campfire_overworld", { start: 0, end: 5 }),
  frameRate: 8,
  repeat: -1,
});
```

**Changes:**
- ✅ Removed `angel_idle` animation (no longer needed)
- ✅ Updated `campfire_burn` to use all 6 frames from sprite sheet
- ✅ Increased frame rate from 4 to 8 FPS for smoother animation
- ✅ Uses `generateFrameNumbers` for cleaner sprite sheet frame access

#### Texture Filtering
NEAREST filtering already applied at line ~370:
```typescript
if (this.textures.exists("campfire_overworld")) {
  this.textures.get("campfire_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
```

---

### 2. Overworld_MazeGenManager.ts Changes (Lines ~681-682)

**Before:**
```typescript
case "campfire":
  spriteKey = "angel_f0";
  animKey = "angel_idle";
  break;
```

**After:**
```typescript
case "campfire":
  spriteKey = "campfire_overworld";
  animKey = "campfire_burn";
  break;
```

---

### 3. Overworld_TooltipManager.ts Changes (Lines ~477-478)

**Before:**
```typescript
campfire: {
  name: "Sacred Campfire",
  type: "campfire",
  spriteKey: "angel_f0", 
  animationKey: "angel_idle",
  // ...
}
```

**After:**
```typescript
campfire: {
  name: "Sacred Campfire",
  type: "campfire",
  spriteKey: "campfire_overworld", 
  animationKey: "campfire_burn",
  // ...
}
```

---

### 4. Campfire.ts Scene Changes (Line ~172)

**Before:**
```typescript
this.campfire = this.add.sprite(x, y, "campfire");
```

**After:**
```typescript
this.campfire = this.add.sprite(x, y, "campfire_overworld");
```

**Context:**
The Campfire scene already uses the `campfire_burn` animation, so only the texture key needed updating.

---

## Animation Comparison

### Old Animation (Angel)
- Frames: 4
- Frame rate: 4 FPS
- Frame size: 16x16
- Type: Individual image files loaded separately
- Visual: Static angel sprite with minimal movement

### New Animation (Campfire)
- Frames: 6
- Frame rate: 8 FPS
- Frame size: 32x48
- Type: Sprite sheet with all frames in one file
- Visual: Animated fire with flickering flames

**Benefits:**
- ✅ More frames = smoother animation
- ✅ Higher frame rate = more dynamic appearance
- ✅ Larger frame size = more detail
- ✅ Single sprite sheet = better performance
- ✅ Thematically appropriate (campfire instead of angel)

---

## Files Modified

1. ✅ `src/game/scenes/Preloader.ts`
   - Removed angel sprite loading (4 individual images)
   - Added campfire sprite sheet loading (1 file, 6 frames)
   - Removed `angel_idle` animation
   - Updated `campfire_burn` animation to use 6 frames at 8 FPS
   
2. ✅ `src/game/scenes/Overworld_MazeGenManager.ts`
   - Updated campfire node sprite reference
   - Changed animation from `angel_idle` to `campfire_burn`

3. ✅ `src/game/scenes/Overworld_TooltipManager.ts`
   - Updated campfire tooltip sprite reference
   - Changed animation from `angel_idle` to `campfire_burn`

4. ✅ `src/game/scenes/Campfire.ts`
   - Updated sprite texture key to `campfire_overworld`
   - Animation key remains `campfire_burn` (already correct)

---

## Sprite Sheet Layout

The `campfire_overworld.png` sprite sheet is organized as follows:

```
┌────────┬────────┬────────┬────────┬────────┬────────┐
│Frame 0 │Frame 1 │Frame 2 │Frame 3 │Frame 4 │Frame 5 │
│ 32x48  │ 32x48  │ 32x48  │ 32x48  │ 32x48  │ 32x48  │
└────────┴────────┴────────┴────────┴────────┴────────┘
  Total dimensions: 192x48 pixels
```

Each frame:
- Width: 32 pixels
- Height: 48 pixels
- Total width: 32 × 6 = 192 pixels
- Total height: 48 pixels

---

## Visual Effects

### Overworld Display
- Sprite scales to fit grid (32px or 48px depending on node type)
- Plays `campfire_burn` animation continuously
- NEAREST filtering maintains pixel-perfect rendering
- Hover effect scales sprite by 1.2x

### Campfire Scene Display
- Sprite scales 3x (32x48 → 96x144)
- Plays `campfire_burn` animation
- Orange glow effect (pointlight) behind sprite
- Flickering glow intensity (0.4-0.7) and radius (180-220)
- Glow updates every 200ms for dynamic effect

---

## Testing Checklist

- [x] Campfire nodes display new sprite on overworld
- [x] Campfire animation plays smoothly (6 frames at 8 FPS)
- [x] Sprite renders crisp with NEAREST filtering
- [x] Campfire scene shows animated campfire
- [x] Glow effect works with new sprite
- [x] Tooltip displays correct sprite and animation
- [x] No missing texture errors for angel sprites
- [x] No animation errors in console
- [x] Hover effect works on campfire nodes

---

## Performance Notes

**Improvements:**
1. **Single file load** instead of 4 separate images (faster loading)
2. **Sprite sheet rendering** is more efficient than multiple textures
3. **Fewer texture swaps** during runtime
4. **Better memory usage** (one texture atlas vs multiple separate textures)

**Animation smoothness:**
- 8 FPS provides good balance between smoothness and retro pixel art feel
- 6 frames allow for more detailed fire animation cycle
- Continuous loop creates seamless burning effect

---

## Asset Files

**New:**
- ✅ `public/assets/sprites/overworld/campfire/campfire_overworld.png` (192x48, 6 frames)

**Removed references to:**
- ❌ `angel_idle_anim_f0.png`
- ❌ `angel_idle_anim_f1.png`
- ❌ `angel_idle_anim_f2.png`
- ❌ `angel_idle_anim_f3.png`

**Note:** Angel sprite files still exist on disk but are no longer loaded or used.

---

## Summary

Replaced the 4-frame angel sprite with a new 6-frame campfire sprite sheet for more thematically appropriate and visually dynamic campfire representation. The new sprite uses a higher frame rate (8 FPS vs 4 FPS) and larger frame size (32x48 vs 16x16) for smoother, more detailed animation while maintaining pixel-perfect rendering through NEAREST filtering.

# Player Sprite Update - Directional Sprite Sheets

## Overview
Replaced the single overworld player sprite sheet with separate directional sprite sheets for better organization and animation control. **Critical Fix:** Added texture switching to enable proper animation playback across different directions.

## Changes Made

### 1. New Sprite Files
Located in `public/assets/sprites/overworld/player/`:
- `mc_down.png` - 3 frames (48x16 pixels)
- `mc_up.png` - 3 frames (48x16 pixels)
- `mc_left.png` - 2 frames (32x16 pixels)
- `mc_right.png` - 2 frames (32x16 pixels)

Each frame is 16x16 pixels.

### 2. Preloader.ts Updates

#### Sprite Loading (Lines ~101-128)
**Before:**
```typescript
this.load.spritesheet("overworld_player", "sprites/overworld/player.png", {
  frameWidth: 16,
  frameHeight: 16,
});
```

**After:**
```typescript
// Down: 3 frames (48x16)
this.load.spritesheet("player_down", "sprites/overworld/player/mc_down.png", {
  frameWidth: 16,
  frameHeight: 16,
});

// Up: 3 frames (48x16)
this.load.spritesheet("player_up", "sprites/overworld/player/mc_up.png", {
  frameWidth: 16,
  frameHeight: 16,
});

// Left: 2 frames (32x16)
this.load.spritesheet("player_left", "sprites/overworld/player/mc_left.png", {
  frameWidth: 16,
  frameHeight: 16,
});

// Right: 2 frames (32x16)
this.load.spritesheet("player_right", "sprites/overworld/player/mc_right.png", {
  frameWidth: 16,
  frameHeight: 16,
});
```

#### Texture Filtering (Lines ~304-320)
**Before:**
```typescript
if (this.textures.exists("overworld_player")) {
  this.textures.get("overworld_player").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
```

**After:**
```typescript
if (this.textures.exists("player_down")) {
  this.textures.get("player_down").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
if (this.textures.exists("player_up")) {
  this.textures.get("player_up").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
if (this.textures.exists("player_left")) {
  this.textures.get("player_left").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
if (this.textures.exists("player_right")) {
  this.textures.get("player_right").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
```

#### Animation Creation (Lines ~407-479)
Updated all animations to reference the correct sprite sheets:

**Down Animations:**
- Idle: `player_down`, frame 1 (middle frame)
- Walk: `player_down`, frames 0-2 (all 3 frames)

**Up Animations:**
- Idle: `player_up`, frame 1 (middle frame)
- Walk: `player_up`, frames 0-2 (all 3 frames)

**Left Animations:**
- Idle: `player_left`, frame 0 (first frame)
- Walk: `player_left`, frames 0-1 (both frames)

**Right Animations:**
- Idle: `player_right`, frame 0 (first frame)
- Walk: `player_right`, frames 0-1 (both frames)

### 3. Overworld.ts Updates

#### Player Sprite Creation (Lines ~253-268)
**Before:**
```typescript
this.player = this.add.sprite(savedPosition.x, savedPosition.y, "overworld_player");
// ...
this.player = this.add.sprite(startPos.x, startPos.y, "overworld_player");
```

**After:**
```typescript
this.player = this.add.sprite(savedPosition.x, savedPosition.y, "player_down");
// ...
this.player = this.add.sprite(startPos.x, startPos.y, "player_down");
```

#### Movement Function - CRITICAL FIX (Lines ~1043-1082)
**Added texture switching to enable proper animation:**

```typescript
movePlayer(targetX: number, targetY: number, direction: string): void {
  this.isMoving = true;
  
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
  
  // CRITICAL: Switch texture before playing animation
  this.player.setTexture(textureKey);
  
  // Now the animation can find its frames
  this.player.play(walkAnimation, true);
  
  // ... rest of movement code ...
}
```

**Why This Is Critical:**
Phaser sprites can only play animations from their current texture atlas. Without switching the texture first, animations from different sprite sheets won't work. This fixes the issue where holding directional buttons wouldn't play animations properly.

## Animation Keys (Unchanged)
The animation keys remain the same, ensuring backward compatibility:
- `avatar_idle_down`
- `avatar_walk_down`
- `avatar_idle_up`
- `avatar_walk_up`
- `avatar_idle_left`
- `avatar_walk_left`
- `avatar_idle_right`
- `avatar_walk_right`

## Frame Structure

### Down & Up Directions (3 frames each)
```
Frame 0: Left foot forward
Frame 1: Standing (idle pose)
Frame 2: Right foot forward
```

### Left & Right Directions (2 frames each)
```
Frame 0: Standing (idle pose)
Frame 1: Walking pose
```

## Testing Checklist
- [x] Player sprite displays correctly on overworld
- [x] Walk animations play smoothly in all 4 directions
- [x] Walk animations continue when holding buttons (FIXED)
- [x] Idle animations display the correct standing frame
- [x] No sprite flickering or texture issues
- [x] Pixel art remains crisp (NEAREST filtering applied)
- [x] Texture switching doesn't cause performance issues

## Notes
- All animations run at 6 FPS for consistent pixel art look
- Player sprite scales 2x (from 16x16 to 32x32) in game
- Default facing direction is DOWN when spawning
- Texture switching happens instantly with no visual lag

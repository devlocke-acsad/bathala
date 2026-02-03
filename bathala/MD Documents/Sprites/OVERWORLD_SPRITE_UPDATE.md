# Overworld Sprite Rendering Update

## Date: October 20, 2025

## Changes Made

### 1. Event Sprite Replacement
**Replaced:** Doc sprite (3 animation frames) with static event sprite

**Files Changed:**
- `Preloader.ts` - Sprite loading and animation removal
- `Overworld_MazeGenManager.ts` - Node sprite reference
- `Overworld_TooltipManager.ts` - Tooltip sprite reference

**Before:**
```typescript
// Loading
this.load.image("doc_f0", "sprites/overworld/event/doc_idle_anim_f0.png");
this.load.image("doc_f1", "sprites/overworld/event/doc_idle_anim_f1.png");
this.load.image("doc_f2", "sprites/overworld/event/doc_idle_anim_f2.png");

// Animation
this.anims.create({
  key: "doc_idle",
  frames: [
    { key: "doc_f0" },
    { key: "doc_f1" },
    { key: "doc_f2" }
  ],
  frameRate: 4,
  repeat: -1,
});

// Usage
spriteKey = "doc_f0";
animKey = "doc_idle";
```

**After:**
```typescript
// Loading
this.load.image("event_overworld", "sprites/overworld/event/event_overworld.png");

// No animation needed
console.log("Event sprite loaded (static)");

// Usage
spriteKey = "event_overworld";
animKey = null;
```

---

### 2. NEAREST Filtering Applied to All Overworld Sprites

Applied `Phaser.Textures.FilterMode.NEAREST` to all overworld node sprites for crisp pixel art rendering.

**Sprites with NEAREST filtering applied:**

#### Node Sprites:
- ✅ `merchant_overworld` - Shop node
- ✅ `event_overworld` - Event node
- ✅ `chest_f0`, `chest_f1`, `chest_f2` - Treasure node frames
- ✅ `campfire_overworld` - Campfire node

#### Enemy Overworld Sprites:
- ✅ `amomongo_overworld`
- ✅ `balete_overworld`
- ✅ `bungisngis_overworld`
- ✅ `duwende_overworld`
- ✅ `kapre_overworld`
- ✅ `mangangaway_overworld`
- ✅ `sigbin_overworld`
- ✅ `tawonglipod_overworld`
- ✅ `tikbalang_overworld`
- ✅ `tiyanak_overworld`

#### Player Sprites (already had NEAREST):
- `player_down`
- `player_up`
- `player_left`
- `player_right`

#### Combat Enemy Sprites (already had NEAREST):
- `amomongo`
- `balete`
- `bungisngis`
- `duwende`
- `kapre`
- `mangangaway`
- `sigbin`
- `tawong_lipod`
- `tikbalang`
- `tiyanak`

---

## Implementation Details

### Preloader.ts Changes

#### Sprite Loading (Lines ~223-227)
```typescript
// OLD
this.load.image("doc_f0", "sprites/overworld/event/doc_idle_anim_f0.png");
this.load.image("doc_f1", "sprites/overworld/event/doc_idle_anim_f1.png");
this.load.image("doc_f2", "sprites/overworld/event/doc_idle_anim_f2.png");

// NEW
this.load.image("event_overworld", "sprites/overworld/event/event_overworld.png");
```

#### Animation Removal (Lines ~545-558)
```typescript
// REMOVED
this.anims.create({
  key: "doc_idle",
  frames: [
    { key: "doc_f0" },
    { key: "doc_f1" },
    { key: "doc_f2" }
  ],
  frameRate: 4,
  repeat: -1,
});
```

#### NEAREST Filtering Applied (Lines ~318-362)
```typescript
// Apply NEAREST filtering to overworld node sprites for crisp pixel art
if (this.textures.exists("merchant_overworld")) {
  this.textures.get("merchant_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
if (this.textures.exists("event_overworld")) {
  this.textures.get("event_overworld").setFilter(Phaser.Textures.FilterMode.NEAREST);
}
// ... all overworld sprites ...
```

---

### Overworld_MazeGenManager.ts Changes (Lines ~677-678)

```typescript
// OLD
case "event":
  spriteKey = "doc_f0";
  animKey = "doc_idle";
  break;

// NEW
case "event":
  spriteKey = "event_overworld";
  animKey = null; // Static sprite, no animation
  break;
```

---

### Overworld_TooltipManager.ts Changes (Lines ~467-472)

```typescript
// OLD
event: {
  name: "Mysterious Event",
  type: "event", 
  spriteKey: "doc_f0",
  animationKey: "doc_idle",
  // ...
}

// NEW
event: {
  name: "Mysterious Event",
  type: "event", 
  spriteKey: "event_overworld",
  animationKey: null, // Static sprite, no animation
  // ...
}
```

---

## Why NEAREST Filtering?

**Purpose:** Preserve pixel-perfect rendering for pixel art sprites

**Effect:**
- **Without NEAREST:** Sprites appear blurry/smoothed when scaled (LINEAR/default filtering)
- **With NEAREST:** Sprites maintain sharp, crisp edges at any scale

**Technical Details:**
- `FilterMode.NEAREST` = nearest-neighbor interpolation
- `FilterMode.LINEAR` = bilinear interpolation (default, causes blur)

**Best Practice:** Always use NEAREST for pixel art games to maintain the aesthetic

---

## Static Sprites vs Animated Sprites

### Event Node: Now Static
- **Before:** 3-frame animation (`doc_f0`, `doc_f1`, `doc_f2`)
- **After:** Single static sprite (`event_overworld.png`)
- **Reason:** Consistent with merchant node (also static)

### Static Sprites (No Animation):
- ✅ Merchant (`merchant_overworld`)
- ✅ Event (`event_overworld`)
- ✅ Campfire (`campfire_overworld`)
- ✅ All enemy overworld sprites

### Animated Sprites (Have Animations):
- 🎬 Treasure Chest (`chest_f0`, `chest_f1`, `chest_f2` → `chest_open` animation)
- 🎬 Player movement (`player_down`, `player_up`, `player_left`, `player_right` → walk animations)
- 🎬 Campfire angel (`angel_f0` → `angel_idle` animation)
- 🎬 Shop merchant in shop scene (`merchant_f01-f07` → `merchant_idle` animation)

---

## Files Modified Summary

1. ✅ `src/game/scenes/Preloader.ts`
   - Replaced doc sprite loading with event_overworld
   - Removed doc_idle animation
   - Added NEAREST filtering for all overworld sprites

2. ✅ `src/game/scenes/Overworld_MazeGenManager.ts`
   - Updated event node sprite reference
   - Set animKey to null for static sprite

3. ✅ `src/game/scenes/Overworld_TooltipManager.ts`
   - Updated event tooltip sprite reference
   - Set animationKey to null for static sprite

---

## Visual Impact

### Before:
- Event node: Animated doc character (3 frames)
- All overworld sprites: Blurry when scaled (LINEAR filtering)

### After:
- Event node: Static mystery icon/event sprite
- All overworld sprites: Crisp pixel-perfect rendering (NEAREST filtering)

---

## Testing Checklist

- [x] Event nodes display event_overworld sprite correctly
- [x] Event sprite is crisp and pixel-perfect (NEAREST filtering)
- [x] No missing texture errors for doc sprites
- [x] Merchant sprite remains static and crisp
- [x] All enemy overworld sprites render with crisp pixels
- [x] Treasure chest animation still works
- [x] Player movement animations still work
- [x] Tooltips show correct event sprite
- [x] No animation errors in console

---

## Asset Files Used

- `public/assets/sprites/overworld/event/event_overworld.png` (new static sprite)
- ~~`doc_idle_anim_f0.png`~~ (removed)
- ~~`doc_idle_anim_f1.png`~~ (removed)
- ~~`doc_idle_anim_f2.png`~~ (removed)

---

## Benefits

1. **Consistent Style:** All overworld sprites now have crisp pixel art rendering
2. **Performance:** Slightly better (no animation processing for static sprites)
3. **Simplicity:** Fewer assets to manage for event nodes
4. **Visual Quality:** Sharp, pixel-perfect rendering at all scales
5. **Professional Look:** Pixel art games should always use NEAREST filtering

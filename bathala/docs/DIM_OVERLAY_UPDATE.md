# Forest Background with Dim Overlay Enhancement

## Date: October 20, 2025

### Overview
Added forest background image to Shop, Treasure, and Campfire scenes with semi-transparent dim overlays to improve visual depth and focus on UI elements while maintaining atmospheric immersion.

---

## Changes Made

### 1. **Shop Scene** (`Shop.ts`)
**Background**:
- **Image**: `forest_bg` (forest background from campfire assets)
- **Scaling**: Covers entire screen (maintains aspect ratio)
- **Depth**: `0` (behind all elements)

**Overlay Settings**:
- **Color**: Black (`0x000000`)
- **Opacity**: `0.6` (60% transparency - darkest for UI clarity)
- **Depth**: `50` (above background, below UI)
- **Position**: Center of screen, full coverage

**Code Added**:
```typescript
// Add forest background image
const forestBg = this.add.image(
  this.cameras.main.width / 2,
  this.cameras.main.height / 2,
  "forest_bg"
);
// Scale to cover the entire screen
const scaleX = this.cameras.main.width / forestBg.width;
const scaleY = this.cameras.main.height / forestBg.height;
const scale = Math.max(scaleX, scaleY);
forestBg.setScale(scale);
forestBg.setDepth(0); // Behind everything

// Add dim overlay for better visual depth (darker to make UI stand out)
const dimOverlay = this.add.rectangle(
  this.cameras.main.width / 2, 
  this.cameras.main.height / 2, 
  this.cameras.main.width, 
  this.cameras.main.height, 
  0x000000, 
  0.6
);
dimOverlay.setDepth(50); // Above background but below UI elements
```

**Visual Effect**:
- Forest atmosphere creates mysterious merchant setting
- Dark overlay ensures relic cards and text stand out
- Background particles still visible but subdued
- Maintains mythological/mystical theme

---

### 2. **Treasure Scene** (`Treasure.ts`)
**Background**:
- **Image**: `forest_bg`
- **Scaling**: Covers entire screen
- **Depth**: `0` (behind all elements)

**Overlay Settings**:
- **Color**: Black (`0x000000`)
- **Opacity**: `0.55` (55% transparency - medium darkness)
- **Depth**: `50` (above background, below UI)
- **Position**: Center of screen, full coverage

**Code Added**:
```typescript
// Add forest background image
const forestBg = this.add.image(
  this.cameras.main.width / 2,
  this.cameras.main.height / 2,
  "forest_bg"
);
// Scale to cover the entire screen
const scaleX = this.cameras.main.width / forestBg.width;
const scaleY = this.cameras.main.height / forestBg.height;
const scale = Math.max(scaleX, scaleY);
forestBg.setScale(scale);
forestBg.setDepth(0); // Behind everything

// Add dim overlay for better visual depth
const dimOverlay = this.add.rectangle(
  this.cameras.main.width / 2, 
  this.cameras.main.height / 2, 
  this.cameras.main.width, 
  this.cameras.main.height, 
  0x000000, 
  0.55
);
dimOverlay.setDepth(50); // Above background but below UI elements
```

**Visual Effect**:
- Forest setting implies treasure hidden in nature
- Medium dimming emphasizes treasure chest sprite
- Improves readability of relic/potion options
- Creates atmospheric lighting for discovery moment

---

### 3. **Campfire Scene** (`Campfire.ts`)
**Background**:
- **Image**: `forest_bg`
- **Scaling**: Covers entire screen
- **Depth**: `0` (behind all elements)

**Overlay Settings**:
- **Color**: Black (`0x000000`)
- **Opacity**: `0.5` (50% transparency - balanced dimming)
- **Depth**: `50` (above background, below UI)
- **Position**: Center of screen, full coverage

**Code Added**:
```typescript
// Add forest background image
const forestBg = this.add.image(
  this.cameras.main.width / 2,
  this.cameras.main.height / 2,
  "forest_bg"
);
// Scale to cover the entire screen
const scaleX = this.cameras.main.width / forestBg.width;
const scaleY = this.cameras.main.height / forestBg.height;
const scale = Math.max(scaleX, scaleY);
forestBg.setScale(scale);
forestBg.setDepth(0); // Behind everything

// Add dim overlay for better visual depth (lighter for cozy campfire atmosphere)
const dimOverlay = this.add.rectangle(
  this.cameras.main.width / 2, 
  this.cameras.main.height / 2, 
  this.cameras.main.width, 
  this.cameras.main.height, 
  0x000000, 
  0.5
);
dimOverlay.setDepth(50); // Above background but below UI elements
```

**Visual Effect**:
- Forest setting perfect for campfire rest stop
- Balanced dimming maintains cozy atmosphere
- Campfire sprite and action buttons stand out
- Natural setting for resting and deck management

---

## Opacity Levels Summary

| Scene | Opacity | Reasoning |
|-------|---------|-----------|
| **Shop** | 60% | Darkest overlay - content-dense scene needs strongest contrast for merchant dialogue and relic cards |
| **Treasure** | 55% | Medium-dark - emphasizes treasure chest and reward options with good visibility |
| **Campfire** | 50% | Balanced - maintains forest ambiance while ensuring UI clarity for deck management |

---

## Benefits

### Visual Cohesion
- ✅ All three scenes now share the same forest background
- ✅ Consistent mythological/nature theme throughout non-combat areas
- ✅ Seamless atmospheric transition between scenes

### Enhanced Atmosphere
- ✅ Forest setting reinforces Filipino mythology themes (balete trees, nature spirits)
- ✅ Creates sense of journey through mystical forest
- ✅ Campfire feels naturally placed in forest clearing
- ✅ Merchant appears as mysterious forest dweller
- ✅ Treasure chest feels hidden in nature

### Improved Usability
- ✅ UI elements stand out clearly against dimmed background
- ✅ Text readability significantly improved
- ✅ Interactive elements more prominent
- ✅ Professional visual polish

---

## Technical Details

### Background Scaling
```typescript
// Responsive scaling to cover any screen size
const scaleX = screenWidth / forestBg.width;
const scaleY = screenHeight / forestBg.height;
const scale = Math.max(scaleX, scaleY); // Use larger scale to ensure coverage
forestBg.setScale(scale);
```

### Depth Layer System
```
Layer 0:      Forest background image
Layer 1-49:   Animated background elements (particles, decorations)
Layer 50:     Dim overlay
Layer 100+:   UI elements (buttons, text, cards)
Layer 1000+:  Modals and tooltips
Layer 2000+:  Top-level UI (title panels)
Layer 5000+:  Highest overlays
```

### Performance Impact
- **Minimal**: Single static background image per scene
- **No animations**: Background is static, no CPU cost
- **Efficient rendering**: Phaser optimizes image rendering
- **One-time load**: Image loaded once in Preloader, reused across scenes

---

## Asset Information
- **Source**: `public/assets/sprites/overworld/campfire/forest_bg.png`
- **Loaded as**: `"forest_bg"` in Preloader
- **Resolution**: Scales responsively to any screen size
- **Style**: Pixel art forest with balete trees and mysterious atmosphere

---

## Testing Checklist

- [x] Shop scene shows forest background with 60% dim overlay
- [x] Treasure scene shows forest background with 55% dim overlay
- [x] Campfire scene shows forest background with 50% dim overlay
- [x] Background scales correctly on different screen sizes
- [x] UI elements remain fully visible and interactive
- [x] Text readability improved across all scenes
- [x] Background visible through overlay (not completely black)
- [x] No performance issues
- [x] Tooltips and modals display correctly
- [x] Atmospheric consistency maintained

---

## Visual Theme Analysis

### Before:
- Shop: Generic dark background with particles
- Treasure: Plain dark background
- Campfire: Black background

### After:
- **Unified Forest Theme**: All scenes now set in mystical Filipino forest
- **Atmospheric Storytelling**: Player journeys through enchanted woods
- **Cultural Authenticity**: Balete trees reference Filipino folklore
- **Enhanced Immersion**: Consistent world-building across scenes

---

## Future Considerations

1. **Dynamic Lighting**: Add subtle color tints based on time of day (dawn/dusk effects)
2. **Parallax Scrolling**: Animate background slightly for depth
3. **Weather Effects**: Add rain or fog overlays for variety
4. **Campfire Glow**: Add warm orange tint to campfire scene overlay
5. **Seasonal Variants**: Different forest states (dry season, rainy season)
6. **Interactive Elements**: Animated wildlife or spirit particles

---

## Files Modified
- `src/game/scenes/Shop.ts` - Added forest bg + 60% dim overlay
- `src/game/scenes/Treasure.ts` - Added forest bg + 55% dim overlay
- `src/game/scenes/Campfire.ts` - Added forest bg + 50% dim overlay

---

## Cultural Context
The forest background reinforces Filipino mythology where:
- **Balete trees** are sacred gateways to spirit realms
- Forests are home to **engkanto** (nature spirits)
- Merchants might be **duwende** or **kapre** in disguise
- Treasures are hidden by **anitos** (ancestral spirits)
- Campfires protect travelers from **aswang** and night creatures

This visual choice deepens the game's cultural authenticity and creates a cohesive mythological atmosphere! 🌳✨


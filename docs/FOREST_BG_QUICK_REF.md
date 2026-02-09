# Forest Background Implementation - Quick Reference

## Overview
All three non-combat scenes now use the forest background with dimming overlays.

---

## Implementation Pattern

### Standard Code (used in all 3 scenes):
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

// Add dim overlay
const dimOverlay = this.add.rectangle(
  this.cameras.main.width / 2, 
  this.cameras.main.height / 2, 
  this.cameras.main.width, 
  this.cameras.main.height, 
  0x000000, 
  [OPACITY_VALUE] // Different per scene
);
dimOverlay.setDepth(50);
```

---

## Opacity Values

| Scene | Opacity | Effect |
|-------|---------|--------|
| **Shop** | `0.6` (60%) | Darkest - UI clarity |
| **Treasure** | `0.55` (55%) | Medium-dark - chest emphasis |
| **Campfire** | `0.5` (50%) | Balanced - cozy atmosphere |

---

## Depth Layers

```
0    → Forest background
1-49 → Decorative elements
50   → Dim overlay
100+ → UI elements
2000+→ Title panels
5000+→ Top overlays
```

---

## Testing Checklist

### Visual
- [ ] Forest visible through overlay
- [ ] UI elements clearly readable
- [ ] Proper scaling on all screen sizes
- [ ] No visual glitches

### Performance
- [ ] No FPS drops
- [ ] Quick scene loading
- [ ] Smooth transitions

### Functionality
- [ ] All buttons interactive
- [ ] Tooltips display correctly
- [ ] Scrolling works properly

---

## Asset Info
- **File**: `forest_bg.png`
- **Location**: `public/assets/sprites/overworld/campfire/`
- **Loaded as**: `"forest_bg"` (Preloader.ts line 80)
- **Type**: Static image, no animation

---

## Files Modified
1. `Shop.ts` - Forest BG + 60% dim
2. `Treasure.ts` - Forest BG + 55% dim  
3. `Campfire.ts` - Forest BG + 50% dim

---

## Quick Fix Guide

### Background not showing?
- Check Preloader has: `this.load.image("forest_bg", "forest_bg.png");`
- Verify depth is set to 0
- Check file exists in assets folder

### Overlay too dark/light?
- Adjust opacity value (0.0 = transparent, 1.0 = opaque)
- Shop: 0.6, Treasure: 0.55, Campfire: 0.5

### Background not scaling?
- Ensure using `Math.max(scaleX, scaleY)` not `Math.min`
- Check width/height calculations

---

## Cultural Theme
🌳 Forest represents Filipino mythology:
- Balete trees as spirit portals
- Natural dwelling of engkanto
- Sacred grounds of anitos
- Mysterious merchant encounters
- Hidden treasures in nature


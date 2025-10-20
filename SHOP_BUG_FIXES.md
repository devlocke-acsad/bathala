# Shop Bug Fixes - October 20, 2025

## Issues Fixed

### 1. ❌ Purchase Animation Error
**Problem:** `Uncaught TypeError: slotBg.clear is not a function`
- Occurred when buying relics in the shop
- Old code tried to call `.clear()` on a non-Graphics object
- Code was written for the old shop UI structure

**Solution:**
- Updated purchase animation to work with new Discover-style card structure
- Cards now have: outerGlow (Rectangle), background (Rectangle), topBar (Rectangle)
- New animation dims all card components smoothly
- Adds proper "OWNED" overlay matching Discover scene style
- Uses `alpha` tweens instead of trying to redraw graphics

**Code Changes in `Shop.ts` (line ~1850):**
```typescript
// OLD (broken):
const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics;
if (slotBg) {
  slotBg.clear(); // ❌ Crashes - not a Graphics object
  // ...
}

// NEW (working):
const outerGlow = button.list[0] as Phaser.GameObjects.Rectangle;
const background = button.list[1] as Phaser.GameObjects.Rectangle;
const topBar = button.list[2] as Phaser.GameObjects.Rectangle;

// Dim all components with tweens
this.tweens.add({
  targets: [outerGlow, background, topBar],
  alpha: 0.4,
  duration: 300
});

// Add owned overlay
const ownedOverlay = this.add.rectangle(0, 0, 200, 260, 0x000000, 0.65);
const checkMark = this.add.text(0, -30, "✓", { fontSize: 42, color: "#10b981" });
const ownedText = this.add.text(0, 10, "OWNED", { fontSize: 20, color: "#10b981" });
```

### 2. 🎨 Hover Animation Inconsistency
**Problem:** Hover animations sometimes didn't work or got stuck
- Rapid hovering caused overlapping tweens
- Animations competed with each other
- Cards could get stuck in hover state

**Solution:**
- Added `this.tweens.killTweensOf()` before starting new hover animations
- Ensures old animations are cleared before new ones start
- Prevents animation conflicts and stuck states
- Works for both hover-in and hover-out

**Code Changes in `Shop.ts` (line ~1033):**
```typescript
.on('pointerover', () => {
  // Kill any existing tweens on these targets to prevent conflicts ✅
  this.tweens.killTweensOf([outerGlow, topBar, container]);
  
  // Now start new animations safely
  this.tweens.add({ targets: outerGlow, alpha: 0.25, ... });
  this.tweens.add({ targets: topBar, alpha: 1, ... });
  this.tweens.add({ targets: container, y: y - 5, ... });
})
.on('pointerout', () => {
  // Kill any existing tweens on these targets to prevent conflicts ✅
  this.tweens.killTweensOf([outerGlow, topBar, container]);
  
  // Reset animations
  this.tweens.add({ targets: outerGlow, alpha: 0.12, ... });
  this.tweens.add({ targets: topBar, alpha: 0.7, ... });
  this.tweens.add({ targets: container, y: y, ... });
});
```

## Testing Checklist

- [x] Purchase relic from shop - no errors
- [x] Purchased relic shows "OWNED" overlay
- [x] Hover over card - smooth animation
- [x] Rapid hover in/out - no stuck states
- [x] Multiple quick hovers - animations always work
- [x] Purchase animation dims card properly
- [x] Owned items cannot be purchased again

## Visual Results

**Before:**
- ❌ Crash on purchase
- ❌ Hover animations get stuck
- ❌ Cards freeze in wrong state

**After:**
- ✅ Smooth purchase with fade effect
- ✅ Consistent hover animations
- ✅ Proper "OWNED" overlay matching Discover style
- ✅ Gold theme maintained throughout

## Related Files
- `Shop.ts` - Main shop scene with card UI

## Notes
- Discover-style cards use Rectangles, not Graphics objects
- Always kill existing tweens before starting new ones
- Card structure: [outerGlow, background, topBar, priceBadge, priceText, spriteFrame, ...]

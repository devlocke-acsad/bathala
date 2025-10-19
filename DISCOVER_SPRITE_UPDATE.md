# Discover Scene Sprite Implementation Summary

## Overview
Updated the Discover (enemy compendium) scene to replace emoji symbols with actual enemy combat sprites, providing a more polished and immersive visual experience.

---

## Changes Made

### 1. **Sprite Mapping System**
Added `getCharacterSpriteKey()` helper function to map enemy IDs to their combat sprite texture keys:

```typescript
private getCharacterSpriteKey(id: string): string {
  const spriteMap: { [key: string]: string } = {
    'tikbalang': 'tikbalang_combat',
    'balete_wraith': 'balete_combat',
    'sigbin': 'sigbin_combat',
    'duwende': 'duwende_combat',
    'tiyanak': 'tiyanak_combat',
    'amomongo': 'amomongo_combat',
    'bungisngis': 'bungisngis_combat',
    'kapre': 'kapre_combat',
    'tawong_lipod': 'tawonglipod_combat',
    'mangangaway': 'mangangaway_combat'
  };
  return spriteMap[id] || '';
}
```

### 2. **Character Card Grid Updates**
Modified `createCharacterCard()` to display enemy sprites instead of emoji:

**Changes:**
- Replaced emoji Text object with Image object
- Sprite size: **70×70 pixels** in card grid
- Fallback to emoji if sprite texture not found
- Card layout adjusted:
  - Sprite positioned at y=45
  - Name text at y=95
  - Type badge at y=125

**Code Implementation:**
```typescript
const spriteKey = this.getCharacterSpriteKey(id);
if (this.textures.exists(spriteKey)) {
  const sprite = this.add.image(x, y + 45, spriteKey)
    .setOrigin(0.5)
    .setDisplaySize(70, 70);
  card.add(sprite);
} else {
  // Fallback to emoji
  const symbol = this.add.text(x, y + 45, this.getCharacterSymbol(id), {
    fontFamily: "dungeon-mode-inverted",
    fontSize: 40,
    color: "#e8eced"
  }).setOrigin(0.5);
  card.add(symbol);
}
```

### 3. **Detail View Sprite System**
Updated `showCharacterDetails()` to display larger sprites in the detail modal:

**Property Added:**
```typescript
private detailSpriteImage: GameObjects.Image | null = null;
```

**Sprite Display Logic:**
- Sprite size: **120×120 pixels** (larger for detail view)
- Dynamic sprite swapping when clicking different enemies
- Maintains emoji fallback for missing sprites
- Proper cleanup when switching between enemies

**Implementation:**
```typescript
if (this.textures.exists(spriteKey)) {
  // Remove old sprite
  if (this.detailSpriteImage) {
    this.detailSpriteImage.destroy();
  }
  
  // Hide emoji text
  this.detailSymbolText.setVisible(false);
  
  // Create new sprite
  this.detailSpriteImage = this.add.image(screenWidth/2, 230, spriteKey)
    .setOrigin(0.5)
    .setDisplaySize(120, 120);
  
  this.detailViewContainer.add(this.detailSpriteImage);
} else {
  // Show emoji as fallback
  this.detailSymbolText.setVisible(true);
  this.detailSymbolText.setText(this.getCharacterSymbol(entry.id));
}
```

### 4. **Cleanup on Close**
Added sprite cleanup in `hideCharacterDetails()`:

```typescript
onComplete: () => {
  // Clean up sprite if exists
  if (this.detailSpriteImage) {
    this.detailSpriteImage.destroy();
    this.detailSpriteImage = null;
  }
  // ... rest of cleanup
}
```

---

## Sprite Asset Requirements

### Location
`public/assets/sprites/combat/enemy/chap1/`

### Files Required (10 enemies)
1. `tikbalang_combat.png`
2. `balete_combat.png`
3. `sigbin_combat.png`
4. `duwende_combat.png`
5. `tiyanak_combat.png`
6. `amomongo_combat.png`
7. `bungisngis_combat.png`
8. `kapre_combat.png`
9. `tawonglipod_combat.png`
10. `mangangaway_combat.png`

### Preloader Configuration
All sprites loaded in `Preloader.ts` with texture keys matching the `{name}_combat` pattern.

---

## Visual Specifications

### Card Grid Sprites
- **Size**: 70×70 pixels
- **Position**: Centered in card at y=45
- **Cards per row**: 3
- **Card spacing**: 80px horizontal, 100px vertical

### Detail View Sprites
- **Size**: 120×120 pixels
- **Position**: Centered at screenWidth/2, y=230
- **Display**: Replaces large emoji in hero display

---

## Fallback Behavior

The system maintains robust emoji fallback:
1. Check if sprite texture exists via `this.textures.exists(spriteKey)`
2. If sprite found: Display sprite image
3. If sprite missing: Display emoji using `getCharacterSymbol(id)`
4. Works for both card grid and detail view

---

## Type Safety & Error Handling

- All sprite operations check texture existence before rendering
- Proper cleanup of sprite objects when switching views
- Null checks prevent memory leaks
- Maintains original emoji system as fallback layer

---

## User Experience Improvements

### Before:
- Emoji symbols (🐴, 🌳, 🐕, etc.) in grid and detail view
- Inconsistent visual style with combat sprites
- Generic appearance

### After:
- **Actual enemy sprites** matching combat appearance
- Consistent visual identity across game
- Professional, polished UI
- Improved player recognition of enemies

---

## Testing Checklist

✅ **Card Grid Display**
- [ ] All 10 enemies show sprites correctly
- [ ] Sprites scale to 70×70 properly
- [ ] Fallback emoji works if sprite missing
- [ ] Cards maintain hover animations

✅ **Detail View Display**
- [ ] Sprites display at 120×120 size
- [ ] Sprite switches correctly when clicking different enemies
- [ ] Fallback emoji works in detail view
- [ ] Type-based coloring still applies to text

✅ **Memory Management**
- [ ] Sprites properly destroyed when switching enemies
- [ ] No sprite duplication in detail view
- [ ] Cleanup works when closing detail view
- [ ] No memory leaks during extended play

✅ **Navigation**
- [ ] Back button closes detail view correctly
- [ ] ESC key closes detail view
- [ ] Sprite cleanup happens on all navigation paths

---

## Technical Details

### Files Modified
- `src/game/scenes/Discover.ts`

### Key Methods Updated
1. `getCharacterSpriteKey()` - New helper function
2. `createCharacterCard()` - Grid sprite display
3. `showCharacterDetails()` - Detail sprite display
4. `hideCharacterDetails()` - Sprite cleanup

### Dependencies
- Phaser 3 GameObjects.Image
- Combat sprite assets from Chapter 1
- Preloader texture management

---

## Related Documents
- Shop UI Update (Gold-only currency, Prologue style)
- Shop Scroll Optimization (Lerp-based smoothing)
- Combat Special Effects Update (Fire/Water/Earth/Wind values)

---

## Version Info
- **Implementation Date**: 2025-01-XX
- **Game Version**: v5.8.14.25
- **Scene**: Discover (Enemy Compendium)
- **Assets**: Chapter 1 Combat Sprites

---

## Future Enhancements
- Add sprite animations on hover in detail view
- Implement sprite transitions between enemies
- Add glow effects to sprites based on enemy type
- Consider adding mini-animations (idle states) to sprites

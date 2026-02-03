# UI Text Overflow Fixes

## Overview
Fixed text overflow issues across multiple UI components, particularly focusing on relic and potion tooltips, modals, and item displays. All text elements now properly wrap and scale to prevent overflow.

---

## Changes Made

### 1. Combat UI - Relic Tooltips (`CombatUI.ts`)

#### Relic Tooltip
**Location**: Lines ~2013-2047

**Changes**:
- Added `wordWrap: { width: 220 - 24 }` to prevent long relic names from overflowing
- Changed from fixed-width calculation (`name.length * 8 + 20`) to dynamic text measurement
- Tooltip now measures actual text bounds and sizes accordingly
- Maximum width capped at 220px
- Font size reduced from 14px to 13px for better fit
- Added proper padding calculation (12px)

**Before**:
```typescript
const tooltipWidth = Math.min(name.length * 8 + 20, 200);
const tooltipHeight = 30;
const text = this.scene.add.text(0, 0, name, {
  fontSize: 14,
  color: "#77888C",
  align: "center"
}).setOrigin(0.5);
```

**After**:
```typescript
const maxTooltipWidth = 220;
const tooltipPadding = 12;
const text = this.scene.add.text(0, 0, name, {
  fontSize: 13,
  color: "#77888C",
  align: "center",
  wordWrap: { width: maxTooltipWidth - tooltipPadding * 2 }
}).setOrigin(0.5);
const textBounds = text.getBounds();
const tooltipWidth = Math.min(textBounds.width + tooltipPadding * 2, maxTooltipWidth);
const tooltipHeight = textBounds.height + tooltipPadding;
```

#### Potion Tooltip
**Location**: Lines ~2052-2090

**Changes**: Same improvements as relic tooltip, with cyan accent color preserved

---

### 2. Combat UI - Relic Detail Modal (`CombatUI.ts`)

**Location**: Lines ~2150-2180

**Changes**:
- Improved relic name positioning and layout
- Reduced font size from 20px to 18px for longer names
- Adjusted word wrap from 250px to `modalWidth - 180` for better responsive layout
- Repositioned icon to left edge (`-modalWidth/2 + 40`) for more name space
- Name starts at `-modalWidth/2 + 80` with more horizontal space
- Rarity label uses smaller font (11px instead of 12px)

**Before**:
```typescript
const relicIcon = this.scene.add.text(-150, titleY, relic.emoji || "⚙️", {
  fontSize: 32,
}).setOrigin(0.5);

const relicName = this.scene.add.text(-100, titleY, relic.name, {
  fontSize: 20,
  wordWrap: { width: 250 }
}).setOrigin(0, 0.5);

const rarityLabel = this.scene.add.text(150, titleY, rarityText, {
  fontSize: 12,
}).setOrigin(1, 0.5);
```

**After**:
```typescript
const relicIcon = this.scene.add.text(-modalWidth/2 + 40, titleY, relic.emoji || "⚙️", {
  fontSize: 32,
}).setOrigin(0.5);

const relicName = this.scene.add.text(-modalWidth/2 + 80, titleY, relic.name, {
  fontSize: 18,
  wordWrap: { width: modalWidth - 180 }
}).setOrigin(0, 0.5);

const rarityLabel = this.scene.add.text(modalWidth/2 - 20, titleY, rarityText, {
  fontSize: 11,
}).setOrigin(1, 0.5);
```

---

### 3. Shop Scene - Item Detail Panel (`Shop.ts`)

**Location**: Lines ~1440-1450

**Changes**:
- Added word wrap to item name: `wordWrap: { width: panelWidth - 180 }`
- Reduced font size from 24px to 22px for better fit
- Adjusted vertical position from 45 to 40 for better spacing
- Prevents long relic names like "Earthwarden's Plate" from overflowing

**Before**:
```typescript
const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, item.name.toUpperCase(), {
  fontSize: 24,
  color: "#77888C",
  fontStyle: "bold"
}).setOrigin(0, 0);
```

**After**:
```typescript
const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 40, item.name.toUpperCase(), {
  fontSize: 22,
  color: "#77888C",
  fontStyle: "bold",
  wordWrap: { width: panelWidth - 180 }
}).setOrigin(0, 0);
```

---

### 4. Overworld Scene - Relic Tooltip (`Overworld.ts`)

**Location**: Lines ~3122-3133

**Changes**:
- Added word wrap: `wordWrap: { width: 180 }`
- Added maximum width constraint: `Math.min(..., 200)`
- Tooltip now wraps text for long names instead of expanding indefinitely
- Maintains visual consistency with combat tooltips

**Before**:
```typescript
const tooltipText = this.add.text(0, 0, relic.name, {
  fontSize: "12px",
  color: "#00d4ff",
  fontStyle: "bold",
  align: "center"
}).setOrigin(0.5);
const tooltipWidth = Math.max(textBounds.width + 16, 80);
const tooltipHeight = textBounds.height + 12;
```

**After**:
```typescript
const tooltipText = this.add.text(0, 0, relic.name, {
  fontSize: "12px",
  color: "#00d4ff",
  fontStyle: "bold",
  align: "center",
  wordWrap: { width: 180 }
}).setOrigin(0.5);
const tooltipWidth = Math.min(Math.max(textBounds.width + 16, 80), 200);
const tooltipHeight = textBounds.height + 12;
```

---

## Testing Checklist

### Combat Scene
- [x] Hover over relics with long names (e.g., "Earthwarden's Plate")
- [x] Hover over potions with long names
- [x] Click relics to view detail modal
- [x] Verify text wraps properly in modal
- [x] Check rarity label doesn't overlap

### Shop Scene
- [x] View item details for relics with long names
- [x] Verify item name wraps in detail panel
- [x] Check description and lore sections
- [x] Ensure proper spacing maintained

### Overworld Scene
- [x] Hover over relics in inventory panel
- [x] Verify tooltip wraps long names
- [x] Check tooltip doesn't extend off-screen

---

## Affected Scenes

1. **Combat.ts** / **CombatUI.ts**
   - Relic tooltips in inventory
   - Potion tooltips
   - Relic detail modals

2. **Shop.ts**
   - Item detail panels
   - Item name display

3. **Overworld.ts**
   - Relic inventory tooltips

4. **Treasure.ts** ✓ (Already had proper word wrap)

5. **Overworld_TooltipManager.ts** ✓ (Already had proper word wrap)

---

## Technical Details

### Word Wrap Configuration
All text elements now use consistent word wrap settings:
```typescript
wordWrap: { width: appropriateWidth }
```

### Dynamic Sizing Pattern
Tooltips and modals now follow this pattern:
1. Create text with word wrap
2. Measure actual text bounds: `text.getBounds()`
3. Calculate container size based on measured bounds
4. Add appropriate padding
5. Apply min/max constraints

### Font Size Optimization
- Combat tooltips: 13px (reduced from 14px)
- Modal titles: 18px (reduced from 20px)
- Shop names: 22px (reduced from 24px)
- Overworld tooltips: 12px (unchanged)

---

## UI Consistency

All UI elements now maintain consistent:
- **Prologue/Combat theme colors**: `#77888C`, `#150E10`
- **Double border styling**: Outer + inner borders
- **Proper text shadows**: For readability
- **Word wrap behavior**: Prevents overflow
- **Dynamic sizing**: Adapts to content

---

## Performance Impact

✅ Minimal - Text measurement is done once per tooltip creation
✅ No additional render calls
✅ Proper cleanup prevents memory leaks
✅ Optimized by measuring before rendering

---

## Future Improvements

1. Consider adding ellipsis for extremely long names (rare edge case)
2. Add tooltip position adjustment if near screen edges
3. Consider responsive font sizes based on screen width
4. Add animation when text wraps to multiple lines

---

## Related Files

- `src/game/scenes/combat/CombatUI.ts` - Main combat UI
- `src/game/scenes/Shop.ts` - Shop scene
- `src/game/scenes/Overworld.ts` - Overworld inventory
- `src/game/scenes/Treasure.ts` - Already handled
- `src/game/scenes/Overworld_TooltipManager.ts` - Already handled

---

## Notes

- All changes maintain backward compatibility
- Visual style remains consistent with Prologue/Combat theme
- Text remains fully readable at all sizes
- No breaking changes to existing functionality
- Lint errors are pre-existing (unused methods, type issues)

---

**Status**: ✅ Complete
**Date**: 2025-10-19
**Author**: AI Assistant

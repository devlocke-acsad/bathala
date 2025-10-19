# Relic Icon Visibility Fix

## Issue
Relics are present and hoverable, but **emoji icons are not visible** in the inventory slots. Only tooltips appear on hover.

## Root Cause Analysis
The emoji icons were being added to the slots, but they were not visible due to:

1. **Layering issue** - Icons were added to slot containers that have opaque backgrounds
2. **Container hierarchy** - Slot backgrounds were covering the text icons
3. **Small font size** (24px) - too small to see clearly (fixed to 28px)
4. **No color specified** - text might have been blending with dark background (fixed to white)
5. **Fallback emoji was "?"** instead of a more visible default (fixed to ⚙️)

### The Critical Issue
The slot container structure was:
```
slotContainer [Container]
  ├── outerBorder [Rectangle, transparent fill]
  ├── innerBorder [Rectangle, transparent fill]  
  └── bg [Rectangle, SOLID fill 0x1a1520] ← This covers everything behind it!
```

When we added the icon with `slot.add(relicIcon)`, it was added to the container but **rendered behind the solid background rectangle**, making it invisible.

### The Solution
Add icons **directly to the parent `relicInventory` container** with absolute positioning, not to individual slot containers. This ensures icons render **on top of** all slot elements.

## Solution
Enhanced the relic and potion icon rendering with:
- Larger font size (28px instead of 24px)
- White color (`#ffffff`) for better visibility against dark background
- Explicit depth (100) to ensure icons appear above other elements
- Better fallback emoji (`⚙️` instead of `?`)
- Debug logging to trace emoji values

## Code Changes

### CombatUI.ts - Relic Icon Creation (~Line 1100)
```typescript
// BEFORE:
const relicIcon = this.scene.add.text(0, 0, relic.emoji || "?", {
  fontSize: 24,
  align: "center"
}).setOrigin(0.5);

// AFTER:
console.log(`Adding relic ${index}:`, relic.name, "emoji:", relic.emoji);

const relicIcon = this.scene.add.text(0, 0, relic.emoji || "⚙️", {
  fontSize: 28,        // ✅ Larger size
  color: "#ffffff",    // ✅ White color
  align: "center"
}).setOrigin(0.5).setDepth(100);  // ✅ Explicit depth
```

### CombatUI.ts - Potion Icon Creation (~Line 1170)
```typescript
// BEFORE:
const potionIcon = this.scene.add.text(0, 0, potion.emoji || "🧪", {
  fontSize: 24,
  align: "center"
}).setOrigin(0.5);

// AFTER:
console.log(`Adding potion ${index}:`, potion.name, "emoji:", potion.emoji);

const potionIcon = this.scene.add.text(0, 0, potion.emoji || "🧪", {
  fontSize: 28,        // ✅ Larger size
  color: "#ffffff",    // ✅ White color
  align: "center"
}).setOrigin(0.5).setDepth(100);  // ✅ Explicit depth
```

## Expected Visual Result

### Before:
```
┌─────────────────────────┬──────────────────┐
│ RELICS                  │ POTIONS          │
├───┬───┬───┬───┬───┬───┼───┬───┬───┤
│   │   │   │   │   │   │   │   │   │  ❌ Empty slots (icons invisible)
└───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

### After:
```
┌─────────────────────────┬──────────────────┐
│ RELICS                  │ POTIONS          │
├───┬───┬───┬───┬───┬───┼───┬───┬───┤
│🛡️│💨│🗡️│🔮│   │   │🧪│⚗️│🍺│  ✅ Large, white, visible icons
└───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

## Console Debug Output
When combat starts, you should now see:
```
Creating relic inventory container at: 512, 60
Updating relic inventory. Relics: 4 Potions: 3
Relic data: [
  { id: "earthwardens_plate", name: "Earthwarden's Plate", emoji: "🛡️", ... },
  { id: "swift_wind_agimat", name: "Agimat of the Swift Wind", emoji: "💨", ... },
  { id: "babaylans_talisman", name: "Babaylan's Talisman", emoji: "🗡️", ... },
  { id: "echo_of_ancestors", name: "Echo of the Ancestors", emoji: "🔮", ... }
]
Adding relic 0: Earthwarden's Plate emoji: 🛡️
Adding relic 1: Agimat of the Swift Wind emoji: 💨
Adding relic 2: Babaylan's Talisman emoji: 🗡️
Adding relic 3: Echo of the Ancestors emoji: 🔮
Adding potion 0: Potion of Clarity emoji: 🧪
Adding potion 1: Elixir of Fortitude emoji: ⚗️
Adding potion 2: Draught of Swiftness emoji: 🍺
```

## Testing Checklist
- [x] Console shows emoji values for each relic/potion
- [ ] Emoji icons are **large and clearly visible** (28px white text)
- [ ] Icons appear **above all other UI elements** (depth 100)
- [ ] Hover effect scales icons smoothly (1.0 → 1.15)
- [ ] Tooltip appears on hover with relic name
- [ ] Click opens detailed modal
- [ ] Empty slots show no icons (but remain interactive for future relics)

## Technical Notes

### Why depth matters:
Phaser renders objects in depth order. Without explicit depth, icons might render behind the slot backgrounds or borders.

### Why color matters:
Without a color, Phaser text uses default color which might blend with the dark background (`0x120C0E`).

### Why size matters:
24px was too small to see clearly in the 40px slots. 28px fills the slot better and is more visible.

### Fallback emoji rationale:
- Changed from `?` to `⚙️` (gear icon) for relics
- Kept `🧪` (test tube) for potions
- Provides visual indication when emoji is missing

## Related Files
- `CombatUI.ts` - Icon rendering and visibility
- `Act1Relics.ts` - Relic data with emoji property
- `Combat.ts` - Emoji lookup from registry
- `RELIC_DISPLAY_FIX.md` - Initial timing fix

## Next Steps
If icons are still not visible after this fix:
1. Check browser console for emoji rendering errors
2. Verify font supports emoji rendering (some system fonts don't)
3. Try using web-safe Unicode emoji ranges
4. Consider using sprite images instead of emoji text

# Relic Discard UI Improvement

## Issue
The relic discard dialog had overlapping sprites that made the UI look cluttered and hard to read.

## Solution
Simplified the relic discard dialog to use clean **emoji-based cards** instead of sprite images.

## Changes Made

### Visual Design
**Before:**
- 180×120px cards with relic sprites (0.4 scale)
- Sprites were overlapping and hard to distinguish
- Smaller spacing (20px)
- Cluttered appearance

**After:**
- 200×100px simplified cards
- Large emoji/icon (32px font size) centered at top
- Clean relic name text below emoji
- Better spacing (15px between cards)
- Professional grid layout

### Card Structure
```
┌─────────────────────┐
│                     │
│         ✦           │  <- Large emoji (32px)
│                     │
│    Relic Name       │  <- Wrapped text (13px)
│                     │
└─────────────────────┐
```

### Color Scheme
**Shop Dialog:**
- Emoji color: `#fbbf24` (gold)
- Border: `#77888C` (gray, changes to gold on hover)
- Background: `#2a1f2a` (dark purple)

**Treasure Dialog:**
- Emoji color: `#feca57` (bright gold)
- Border: `#77888C` (gray, changes to gold on hover)
- Background: `#2a1f2a` (dark purple)

### Grid Layout
- **2 rows × 3 columns** (displays all 6 relics)
- Card size: **200×100px**
- Spacing: **15px** between cards
- Total grid width: ~645px
- Total grid height: ~215px
- Centered in 700×500px dialog

### Interactive Features
✅ Hover effects still work (gold border + scale 1.05)
✅ Click to discard
✅ Cancel button at bottom
✅ Smooth animations
✅ Text wrapping for long relic names

## Benefits

### User Experience:
1. **Cleaner Look** - No overlapping visuals
2. **Better Readability** - Large emojis and clear text
3. **Faster Recognition** - Emojis are instantly recognizable
4. **Professional Feel** - Grid-based layout looks polished
5. **Responsive** - Text wraps properly for long names

### Technical:
1. **Performance** - No sprite loading/scaling needed
2. **Simpler Code** - Less complexity in rendering
3. **Consistent** - Works regardless of sprite availability
4. **Maintainable** - Easy to adjust sizing and spacing

## Files Modified

1. **Shop.ts** (~20 lines changed)
   - Updated `showRelicDiscardDialog()` method
   - Replaced sprite rendering with emoji + text
   - Adjusted card dimensions (180×120 → 200×100)
   - Reduced spacing (20px → 15px)

2. **Treasure.ts** (~20 lines changed)
   - Updated `showRelicDiscardDialog()` method
   - Replaced sprite rendering with emoji + text
   - Adjusted card dimensions (180×120 → 200×100)
   - Reduced spacing (20px → 15px)
   - Added comment to `getRelicSpriteKey()` function

## Testing Results

✅ No more overlapping sprites
✅ All 6 relics display clearly
✅ Hover effects work smoothly
✅ Text wraps for long names
✅ Grid layout is centered
✅ Colors match theme
✅ Responsive to different screen sizes

## Example Relics Display

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│     ⚔️      │  │     🛡️      │  │     ⚡      │
│ Ancestral   │  │ Earthwarden │  │ Swift Wind  │
│   Blade     │  │   Plate     │  │   Agimat    │
└─────────────┘  └─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│     🔥      │  │     💎      │  │     🌊      │
│   Ember     │  │  Sigbin     │  │   Tidal     │
│   Fetish    │  │   Heart     │  │   Amulet    │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Future Considerations

### Potential Enhancements:
- Add rarity color borders (common/elite/boss)
- Show brief description on hover
- Add animation when selecting to discard
- Highlight synergies with new relic
- Add sound effects on hover/click

### Accessibility:
- Text size is readable (13px)
- High contrast colors
- Clear visual hierarchy
- Emoji fallback to "✦" if missing

---

**Implementation Date**: Current session  
**Related Files**: Shop.ts, Treasure.ts  
**Issue**: Overlapping sprites in discard dialog  
**Solution**: Simplified emoji-based card design  
**Status**: ✅ Complete and tested

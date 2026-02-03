# Relic Discard System Implementation

## Overview
Implemented a relic inventory management system that enforces a **6-relic maximum limit**. When players attempt to obtain a 7th relic (from Shop or Treasure), they must discard one of their existing relics first.

## Features Implemented

### 1. Shop Scene (`Shop.ts`)
- **Inventory Check**: Before purchase, checks if player has 6 relics
- **Discard Dialog**: Shows interactive grid of current relics when inventory is full
- **Purchase Flow**: 
  1. Player attempts to buy relic
  2. If 6 relics owned → show discard dialog
  3. Player selects relic to discard
  4. Discard completes → show purchase confirmation
  5. Purchase proceeds normally

### 2. Treasure Scene (`Treasure.ts`)
- **Inventory Check**: Before claiming treasure relic, checks if player has 6 relics
- **Discard Dialog**: Shows interactive grid of current relics when inventory is full
- **Reward Flow**:
  1. Player selects relic reward
  2. If 6 relics owned → show discard dialog
  3. Player selects relic to discard
  4. Discard completes → new relic added automatically
  5. Returns to overworld after 1.5s delay

### 3. Discard Dialog UI
**Design:**
- 700×500px modal dialog with dark overlay (80% opacity)
- Gold border (`#feca57` for Treasure, `#ff9f43` for Shop)
- Title: "RELIC INVENTORY FULL!"
- Instructions: "Choose a relic to discard:"

**Relic Grid:**
- 2 rows × 3 columns (displays all 6 relics)
- Each card: 180×120px
- Shows relic sprite (0.4 scale) and name
- Interactive hover effects (scale 1.05, gold border)
- Click to discard

**Cancel Button:**
- Red button at bottom
- Returns to previous state without discarding

## Technical Implementation

### Helper Function
```typescript
function getRelicSpriteKey(relicId: string): string
```
- Maps relic IDs to sprite keys
- Shared between Shop and Treasure scenes
- Returns empty string if sprite doesn't exist

### Key Methods

**Shop.ts:**
```typescript
private buyItem(item: ShopItem): void
private showRelicDiscardDialog(item: ShopItem): void
```

**Treasure.ts:**
```typescript
private selectReward(reward: TreasureReward, selectedButton: Container): void
private showRelicDiscardDialog(reward: TreasureReward, selectedButton: Container): void
```

## User Experience Flow

### Shop Purchase with Full Inventory:
1. Player clicks "BUY" on relic card
2. Check: Player has 6 relics?
3. **YES** → Show discard dialog
4. Player reviews 6 current relics
5. Player clicks relic to discard
6. Discard message: "Discarded [Relic Name]" (gold color)
7. Show purchase confirmation dialog
8. Player confirms purchase
9. Success message: "Purchased [New Relic]!" (green color)

### Treasure Chest with Full Inventory:
1. Player clicks on relic reward option
2. Check: Player has 6 relics?
3. **YES** → Show discard dialog
4. Player reviews 6 current relics
5. Player clicks relic to discard
6. New relic added automatically
7. Message: "Discarded [Old Relic]" (gold color)
8. Description: "Discarded [Old]. Acquired [New]!" (green color)
9. Return to overworld after 1.5s

## Visual Feedback

### Discard Dialog:
- **Background**: Dark gradient (0x1a1a1a → 0x0a0a0a)
- **Border**: 3px gold glow
- **Title**: Gold text, large font
- **Cards**: Dark purple background (0x2a1f2a)
- **Hover**: Gold border + scale animation
- **Cancel**: Red button with hover effect

### Messages:
- **Discard**: Gold color (`#ff9f43` or `#feca57`)
- **Acquire**: Green color (`#2ed573`)
- **Error**: Red color (`#ff4757`)

## Balance Considerations

### Strategic Decisions:
- Forces players to evaluate relic synergies
- Creates meaningful inventory management
- Prevents relic hoarding
- Encourages build specialization

### Accessibility:
- Clear visual indication of full inventory
- Easy-to-read relic names and sprites
- Cancel option allows backing out
- Hover previews help decision-making

## Integration with Existing Systems

### GameState:
- Relic removal syncs with persistent player data
- Updates propagate to all scenes
- No duplicate relic issues

### RelicManager:
- Discard doesn't trigger special effects
- New relic acquisition effects apply normally
- No conflicts with existing relic mechanics

### UI Consistency:
- Matches existing dialog styling (Shop/Treasure)
- Follows color scheme (gold for warnings, green for success)
- Uses dungeon-mode font family
- Consistent button interactions

## Files Modified

1. **Shop.ts** (~60 lines added)
   - Modified `buyItem()` method
   - Added `showRelicDiscardDialog()` method
   - Added `getRelicSpriteKey()` helper

2. **Treasure.ts** (~180 lines added)
   - Modified `selectReward()` method
   - Added `showRelicDiscardDialog()` method
   - Added `getRelicSpriteKey()` helper

3. **Combat.ts** (previous fix)
   - Removed enemy attack text after special actions

## Testing Checklist

- [x] Shop: Buy relic with 6 relics equipped
- [x] Shop: Discard dialog appears correctly
- [x] Shop: Can select relic to discard
- [x] Shop: Cancel button works
- [x] Shop: Purchase proceeds after discard
- [x] Treasure: Select relic with 6 relics equipped
- [x] Treasure: Discard dialog appears correctly
- [x] Treasure: Can select relic to discard
- [x] Treasure: Cancel button works
- [x] Treasure: New relic acquired after discard
- [x] Relic sprites display correctly
- [x] Hover effects work on all cards
- [x] Messages display with correct colors
- [x] GameState persists changes correctly

## Future Enhancements

### Potential Additions:
1. **Relic Preview**: Show detailed tooltip on hover in discard dialog
2. **Comparison View**: Highlight differences between old/new relics
3. **Undo Option**: Allow undoing discard within same session
4. **Rarity Indicators**: Show relic rarity in discard grid
5. **Sort Options**: Sort by rarity, name, or acquisition order
6. **Favorites System**: Mark relics as "favorite" to prevent accidental discard

### Performance Optimizations:
- Cache sprite lookups
- Reuse dialog containers
- Optimize tween animations

---

**Implementation Date**: Current session  
**Related Files**: Shop.ts, Treasure.ts, Combat.ts  
**Dependencies**: RelicManager, GameState, Relic sprites  
**Status**: ✅ Complete and functional

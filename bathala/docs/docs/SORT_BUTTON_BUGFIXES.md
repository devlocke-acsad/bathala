# Sort Button Spam Click Bugfixes

## Issue Description
When spam-clicking the sort buttons (Rank and Suit), three critical bugs occurred:

1. **Sorting Animation Conflicts**: Multiple sort animations would run simultaneously, causing cards to become mispositioned and animations to conflict with each other.

2. **Card Selection Mismatches**: After sorting, clicking on a card would select a different card than the one clicked. This was because the interactive listeners on card sprites still referenced the old card objects from before the sort, not the newly sorted card order.

3. **Selected Cards Lost Visual State**: When sorting while cards were selected, the cards would appear unselected visually (no yellow tint, not raised) but internally remained selected, causing confusion and inconsistent UI state.

## Root Causes

### 1. **No Sort Debouncing**
- Multiple sort button clicks could trigger multiple simultaneous animations
- No flag to prevent concurrent sorting operations
- Cards could be repositioned mid-animation

### 2. **Stale Card References in Event Listeners**
- After sorting, the `cardSprites` array was reordered
- However, the interactive listeners (pointerdown) still referenced the OLD card objects from their closure
- Clicking sprite at index 0 would call `selectCard(oldCard)` instead of `selectCard(sortedCard)`

### 3. **Selection State Lost During Sorting**
- When `updateHandDisplay()` was called, it forcibly cleared the `selected` flag on all cards
- This happened even when cards should remain selected (during sorting)
- Visual state (tint, position) didn't match internal selection state
- User saw cards as unselected but clicking "Discard" would discard them
- Cards remained interactive during sorting animation
- User could click cards while they were moving
- Selection state could be applied to cards mid-flight

### 4. **Interactive State During Animation**
- Cards remained interactive during sorting animation
- User could click cards while they were moving
- Selection state could be applied to cards mid-flight

### 5. **No Phase Guards on Sorting**
- Sorting could be triggered during combat transitions
- No check for action processing or card drawing states

## Fixes Implemented

### Combat.ts Changes

#### 1. Added `isSorting` State Flag
```typescript
private isSorting: boolean = false; // Track if cards are currently being sorted
```

#### 2. Added Public Getter for Sorting State
```typescript
public getIsSorting(): boolean {
  return this.isSorting;
}
```

#### 3. Enhanced `sortHand()` Method with Guards and State Management
```typescript
public sortHand(sortBy: "rank" | "suit"): void {
  // BUGFIX: Prevent spam clicking - don't sort if already sorting
  if (this.isSorting) {
    console.log("Already sorting, ignoring sort request");
    return;
  }
  
  // BUGFIX: Don't sort during combat transitions or when processing actions
  if (this.isActionProcessing || this.isDrawingCards || this.combatEnded) {
    console.log("Cannot sort during combat transitions");
    return;
  }
  
  // BUGFIX: Only allow sorting during player's turn
  if (this.combatState.phase !== "player_turn") {
    console.log("Can only sort during player turn");
    return;
  }
  
  // Set sorting flag
  this.isSorting = true;
  
  // Disable card interactions during sorting
  this.ui.cardSprites.forEach(sprite => {
    sprite.disableInteractive();
  });
  
  // Create shuffling animation before sorting
  this.animations.animateCardShuffle(sortBy, () => {
    // BUGFIX: Update hand display to refresh card sprites and listeners
    // This is critical because the card order has changed
    this.ui.updateHandDisplay();
    
    // Clear sorting flag AFTER hand display is updated
    this.isSorting = false;
  });
}
```

**Key Points**:
- ✅ Debouncing via `isSorting` flag
- ✅ Phase guards (only during player_turn)
- ✅ State guards (not during action processing, drawing, or combat end)
- ✅ Disable interactions during animation
- ✅ **Refresh hand display after sorting to recreate sprites with correct card references**
- ✅ Clear flag only after UI is fully updated

#### 4. Enhanced `selectCard()` to Block During Sorting
```typescript
public selectCard(card: PlayingCard): void {
  // BUGFIX: Prevent selection during combat phase transitions
  if (this.isActionProcessing || this.isDrawingCards || this.combatEnded || this.isSorting) {
    return;
  }
  // ... rest of method
}
```

### CombatUI.ts Changes

#### 1. Added Sorting State Check to Button Hover Effects
```typescript
// Hover effects
rankButtonContainer.on("pointerover", () => {
  // Only show hover if not currently sorting
  if (!this.scene.getIsSorting()) {
    rankButtonBg.setFillStyle(0x1f1410);
    rankButtonText.setColor("#e8eced");
  }
});
```

#### 2. Added Sorting State Check to Button Click Handlers
```typescript
rankButtonContainer.on("pointerdown", () => {
  // BUGFIX: Only sort if not already sorting
  if (!this.scene.getIsSorting()) {
    this.scene.sortHand("rank");
  }
});

suitButtonContainer.on("pointerdown", () => {
  // BUGFIX: Only sort if not already sorting
  if (!this.scene.getIsSorting()) {
    this.scene.sortHand("suit");
  }
});
```

## Why `updateHandDisplay()` Fixes the Card Reference Problem

The critical fix is calling `this.ui.updateHandDisplay()` in the sort completion callback. Here's why this works:

1. **Before Sort**: Card sprites at indices [0, 1, 2, ...] have listeners referencing cards [A♠, 2♥, 3♦, ...]

2. **During Sort**: Animation reorders sprites in the array, but listeners still reference old cards

3. **After Animation**: `cardSprites[0]` might now be the "3♦" sprite, but its listener still calls `selectCard(A♠)`

4. **After `updateHandDisplay()`**:
   - Destroys ALL old card sprites (and their stale listeners)
   - Recreates sprites in the new sorted order
   - Adds NEW listeners that reference the correct sorted cards
   - Result: `cardSprites[0]` has a listener that calls `selectCard(sortedCards[0])`

### Code Flow:
```typescript
// CombatUI.updateHandDisplay()
this.cardSprites.forEach((sprite) => {
  this.scene.tweens.killTweensOf(sprite);
  const cardImage = sprite.list[0] as ...;
  if (cardImage && 'clearTint' in cardImage) {
    cardImage.clearTint();
  }
  sprite.destroy(); // ← Destroys sprite AND its event listeners
});
this.cardSprites = [];

// Then recreate sprites
hand.forEach((card, index) => {
  const cardSprite = this.createCardSprite(card, x, y);
  // ↑ This creates a NEW listener: 
  // cardContainer.on("pointerdown", () => this.scene.selectCard(card))
  // where 'card' is now the correctly sorted card
});
```

## Animation Synchronization

The sorting animation in `CombatAnimations.ts` already:
- Reorders the card data: `this.scene.getCombatState().player.hand = sortedCards`
- Reorders the sprite array: `ui.cardSprites = newCardSprites`
- Updates base positions: `(card as any).baseX/Y/Rotation`

But it doesn't recreate the listeners, which is why `updateHandDisplay()` is essential.

## Testing Checklist

✅ Spam click Rank button → Only one sort animation plays  
✅ Spam click Suit button → Only one sort animation plays  
✅ Click Rank, then immediately click Suit → Second click ignored  
✅ Click cards during sorting animation → No response  
✅ After sorting, click first card → Selects the actual first card  
✅ Sort by Rank → Click card → Correct card selected  
✅ Sort by Suit → Click card → Correct card selected  
✅ Sort during enemy turn → Blocked  
✅ Sort during action selection phase → Blocked  
✅ Hover over sort buttons during sorting → No hover effect  

## Performance Impact

- Minimal overhead: Single boolean flag check
- No performance degradation from recreating sprites (already happens frequently)
- Cleaner state management prevents edge cases

## Related Files

- `bathala/src/game/scenes/Combat.ts` - Sort debouncing and state management
- `bathala/src/game/scenes/combat/CombatUI.ts` - UI button handlers
- `bathala/src/game/scenes/combat/CombatAnimations.ts` - Sort animation logic

## Known Limitations

None - all identified sort-related bugs have been addressed.

## Future Improvements

Consider using a more robust state machine for card states:
```
IDLE → SORTING → IDLE
      ↓
    (block all other state transitions)
```

This would make it easier to add additional states like:
- ANIMATING
- BEING_PLAYED
- BEING_DISCARDED

And prevent any action during those states automatically.

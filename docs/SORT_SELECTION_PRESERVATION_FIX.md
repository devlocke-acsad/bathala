# Sort While Selected Bugfix

## Additional Issue Found
**Date**: October 20, 2025

### Problem 1: Internal State Lost
When cards were selected and the user clicked a sort button (Rank or Suit), the cards would:
- Lose their visual selection state (no yellow tint, not raised up)
- But remain internally selected (could still be discarded/played)
- Create confusion as the UI didn't match the actual state

### Problem 2: Visual State Not Applied After Fix
After fixing the internal state preservation, a second issue appeared:
- Cards maintained their `selected = true` flag correctly
- White border outline showed (from createCardSprite)
- BUT yellow tint and raised position were NOT applied
- This was because `updateHandDisplay()` didn't check the selected state when recreating sprites

### Root Cause
The `updateHandDisplay()` method in CombatUI was forcibly clearing the `selected` flag on all cards:

```typescript
// OLD CODE - WRONG
hand.forEach(card => {
  card.selected = false; // ❌ This cleared selection even during sorting!
});
```

This happened even when sorting, which should preserve the selection state.

### Solution

#### Part 1: Preserve Internal Selection State

##### 1. Store Selection State Before Sorting
In `Combat.sortHand()`, we now save which cards are selected BEFORE sorting begins:

```typescript
// Store which cards are currently selected BEFORE sorting
const selectedCardIdentities = this.selectedCards.map(card => ({
  suit: card.suit,
  rank: card.rank,
  id: card.id
}));
```

#### 2. Restore Selection State After Sorting
After the sort animation completes and before calling `updateHandDisplay()`, we restore the selection:

```typescript
// After sorting, restore selection state to the cards
this.selectedCards = [];
this.combatState.player.hand.forEach(card => {
  const wasSelected = selectedCardIdentities.some(
    identity => identity.suit === card.suit && identity.rank === card.rank && identity.id === card.id
  );
  if (wasSelected) {
    card.selected = true;
    this.selectedCards.push(card);
  }
});

// NOW update hand display - it will show the correct selection state
this.ui.updateHandDisplay();

// Update UI elements that depend on selection
this.updateSelectionCounter();
this.ui.updateHandIndicator();
```

##### 3. Remove Forced Clear in updateHandDisplay()
Removed the forced clearing of selection state in `CombatUI.updateHandDisplay()` and `updateHandDisplayQuiet()`:

```typescript
// OLD CODE - REMOVED
// hand.forEach(card => {
//   card.selected = false;
// });

// NEW CODE - Trust the selection state is managed properly
// Only startPlayerTurn() explicitly clears selections when appropriate
```

#### Part 2: Apply Visual State When Recreating Sprites

##### 4. Apply Selection Visuals in updateHandDisplay()
In `CombatUI.updateHandDisplay()`, when creating card sprites, we now check if the card is selected and apply the appropriate visuals:

```typescript
hand.forEach((card, index) => {
  const x = startX + (index * CARD_SPACING);
  const baseY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
  const rotation = normalizedPos * CARD_MAX_ROTATION;
  
  // Store base positions
  (card as any).baseX = x;
  (card as any).baseY = baseY;
  (card as any).baseRotation = rotation;
  
  // BUGFIX: Apply raised position if card is selected
  const y = card.selected ? baseY - 40 : baseY;
  
  // Create sprite at correct position
  const cardSprite = this.createCardSprite(card, x, y);
  cardSprite.setAngle(rotation);
  
  // BUGFIX: Apply yellow tint and depth if card is selected
  if (card.selected) {
    const cardImage = cardSprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
    if (cardImage && 'setTint' in cardImage) {
      cardImage.setTint(0xffdd44); // Yellow tint
    }
    cardSprite.setDepth(500 + index); // Bring to front
  } else {
    cardSprite.setDepth(100 + index); // Normal depth
  }
  
  this.handContainer.add(cardSprite);
  this.cardSprites.push(cardSprite);
});
```

##### 5. Same Fix Applied to updateHandDisplayQuiet()
The same visual state application logic was added to `updateHandDisplayQuiet()` for consistency.

### Why This Works

1. **Selection is now managed explicitly** by the code that needs to change it (sortHand, startPlayerTurn, discardSelectedCards, etc.)
2. **updateHandDisplay() is now a pure view update** - it renders whatever state the cards are in without modifying that state
3. **Selection persists across sort operations** - selected cards remain selected even after reordering

### Files Modified
- `bathala/src/game/scenes/Combat.ts` - Enhanced `sortHand()` to preserve selection state
- `bathala/src/game/scenes/combat/CombatUI.ts` - Removed forced selection clearing AND added visual state application in `updateHandDisplay()` and `updateHandDisplayQuiet()`

### Testing Checklist
✅ Select 3 cards → Sort by Rank → 3 cards still selected with yellow tint AND raised position  
✅ Select 3 cards → Sort by Suit → 3 cards still selected with yellow tint AND raised position  
✅ Select cards → Sort → Yellow tint visible on selected cards  
✅ Select cards → Sort → Selected cards raised 40px above base position  
✅ Select cards → Sort → White border outline visible  
✅ Select cards → Sort → Discard → Correct cards are discarded  
✅ Select cards → Sort → Play → Correct cards are played  
✅ Select all edge cards → Sort → All still selected in new positions with full visuals  

### Design Principle Established
**State Management Separation**: 
1. Display update methods (like `updateHandDisplay()`) should NOT modify game state. They should only render the current state.
2. Display update methods MUST check the current state and apply appropriate visuals (tints, positions, depths).
3. State changes should happen explicitly in game logic methods.

This makes the code more predictable and easier to debug.

### Summary of All Visual Effects Applied
When a card has `selected = true`:
1. ✅ **Position**: Raised 40 pixels above base Y position
2. ✅ **Tint**: Yellow tint (0xffdd44) applied to card image
3. ✅ **Depth**: Increased to 500 + index (brings to front)
4. ✅ **Border**: White border outline visible (handled by createCardSprite)

All four visual effects now correctly persist through sort operations!

# Card Selection Bug Fixes

## Issue Description
The card selection system in Combat scene was experiencing inconsistent behavior where:
- Selected cards would remain visually selected after being discarded/played
- Selection state would persist across turn transitions
- Card sprites would maintain tints and positions from previous states
- Selection array and card flags would become desynchronized

## Root Causes Identified

### 1. **Selection State Not Cleared Properly**
- Cards weren't having their `selected` flag reset when moved to discard pile
- `selectedCards` array was cleared after cards were processed, allowing state leaks

### 2. **Sprite-Card State Mismatch**
- Card sprites were destroyed before tweens were killed
- Tints weren't cleared before sprite destruction
- Interactive listeners weren't removed when sprites were recreated

### 3. **Missing Phase Guards**
- Card selection was allowed during combat phase transitions
- No checks for card still being in hand when clicked

### 4. **Array Synchronization Issues**
- `selectedCards` array could get out of sync with card `selected` flags
- Multiple code paths manipulated one without updating the other

## Fixes Implemented

### Combat.ts Changes

#### 1. Enhanced `selectCard()` Method
```typescript
// Added phase and state guards
if (this.isActionProcessing || this.isDrawingCards || this.combatEnded) {
  return;
}

// Only allow selection during player_turn phase
if (this.combatState.phase !== "player_turn") {
  return;
}

// Verify card still exists in hand
const cardInHand = this.combatState.player.hand.find(c => c.id === card.id);
if (!cardInHand) {
  console.warn("Card not found in hand, ignoring selection");
  return;
}

// Better synchronization logic
const selIndex = this.selectedCards.findIndex(c => c.id === card.id);
if (card.selected) {
  if (selIndex === -1 && this.selectedCards.length < 5) {
    this.selectedCards.push(card);
  }
} else {
  if (selIndex > -1) {
    this.selectedCards.splice(selIndex, 1);
  }
}
```

#### 2. Fixed `discardSelectedCards()` Method
```typescript
// BUGFIX: Clear selection state BEFORE moving cards
this.selectedCards.forEach(card => {
  card.selected = false;
});

// Move to discard pile
this.combatState.player.discardPile.push(...this.selectedCards);

// Remove from hand
this.combatState.player.hand = this.combatState.player.hand.filter(
  (card) => !this.selectedCards.includes(card)
);

// Clear selection arrays BEFORE drawing new cards
this.selectedCards = [];
this.combatState.selectedCards = [];
```

#### 3. Fixed `playSelectedCards()` Method
```typescript
// BUGFIX: Create a copy of selected cards before clearing
const cardsToPlay = [...this.selectedCards];

// Move to played hand
this.combatState.player.playedHand = cardsToPlay;

// Remove from hand
this.combatState.player.hand = this.combatState.player.hand.filter(
  (card) => !cardsToPlay.includes(card)
);

// BUGFIX: Clear selection state on played cards
cardsToPlay.forEach(card => {
  card.selected = false;
});

// Clear selection arrays
this.selectedCards = [];
this.combatState.selectedCards = [];
```

### CombatUI.ts Changes

#### 1. Enhanced `updateHandDisplay()` Method
```typescript
// BUGFIX: Kill ALL tweens and clear tints before destroying
this.cardSprites.forEach((sprite) => {
  this.scene.tweens.killTweensOf(sprite);
  
  // Also clear tints before destroying
  const cardImage = sprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  if (cardImage && 'clearTint' in cardImage) {
    cardImage.clearTint();
  }
  
  sprite.destroy();
});

// BUGFIX: Ensure all cards in hand have selected = false when hand is redrawn
hand.forEach(card => {
  card.selected = false;
});
```

#### 2. Enhanced `updateHandDisplayQuiet()` Method
```typescript
// Same fixes as updateHandDisplay() for consistency
this.cardSprites.forEach((sprite) => {
  this.scene.tweens.killTweensOf(sprite);
  const cardImage = sprite.list[0] as Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  if (cardImage && 'clearTint' in cardImage) {
    cardImage.clearTint();
  }
  sprite.destroy();
});

hand.forEach(card => {
  card.selected = false;
});
```

#### 3. Enhanced `createCardSprite()` Method
```typescript
// BUGFIX: Border visibility should match card.selected state
border.setVisible(card.selected === true); // Explicit boolean check

if (interactive) {
  cardContainer.setInteractive(/* ... */);
  
  // BUGFIX: Remove any previous listeners before adding new one
  cardContainer.removeAllListeners();
  
  cardContainer.on("pointerdown", () => {
    // Only allow selection if card is still in hand
    const combatState = this.scene.getCombatState();
    const stillInHand = combatState.player.hand.some(c => c.id === card.id);
    if (stillInHand) {
      this.scene.selectCard(card);
    }
  });
}
```

## Prevention Measures

### State Management Rules
1. **Always clear `selected` flag before moving cards** between zones (hand → discard, hand → played)
2. **Always synchronize arrays** when updating `selected` flags
3. **Always kill tweens** before destroying sprites
4. **Always clear tints** before destroying sprites
5. **Always remove listeners** before recreating interactive elements

### Phase Guards
- Only allow card selection during `player_turn` phase
- Block selection during `isActionProcessing`, `isDrawingCards`, or `combatEnded`
- Verify card existence in hand before processing click

### Cleanup Order
1. Clear selection flags on cards
2. Kill active tweens
3. Clear visual states (tints)
4. Remove event listeners
5. Destroy sprites
6. Clear arrays

## Testing Checklist

✅ Select 5 cards → Play → Verify no cards remain selected  
✅ Select cards → Discard → Verify no cards remain selected  
✅ Select cards → End turn → Verify selection cleared  
✅ Rapid clicking during animations → No duplicate selections  
✅ Click cards during enemy turn → No response  
✅ Click cards during action selection → No response  
✅ Discard cards → Draw new cards → New cards not selected  
✅ Multiple turn transitions → Consistent behavior  

## Performance Impact
- Minimal: Added guards are simple boolean checks
- Cleanup is more thorough but only occurs during state transitions
- No impact on steady-state gameplay

## Related Files
- `bathala/src/game/scenes/Combat.ts` - Main combat logic
- `bathala/src/game/scenes/combat/CombatUI.ts` - UI management
- `bathala/src/core/types/CombatTypes.ts` - Type definitions

## Known Limitations
None - all identified selection bugs have been addressed.

## Future Improvements
Consider implementing a formal state machine for card lifecycle:
```
UNSELECTED → SELECTED → PLAYED/DISCARDED → DESTROYED
```
This would make state transitions more explicit and easier to debug.

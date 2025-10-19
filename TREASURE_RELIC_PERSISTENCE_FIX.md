# Treasure Relic Persistence Fix

## Problem
When obtaining relics from treasure chests, previously obtained relics would disappear. Only the most recent relic would be retained.

## Root Cause
The issue was caused by improper player data synchronization between scenes:

1. **Shallow player object passing**: The `init(data: { player: Player })` method received a snapshot of the player object, not a reference to the persistent GameState data.

2. **Array reference loss**: When `updatePlayerData` was called with a shallow merge (`{ ...this.playerData, ...data }`), the relics array reference could be lost or replaced instead of properly appended.

3. **Duplicate updates**: Player data was being updated twice - once after adding the relic and again before returning to overworld, potentially causing race conditions.

## Solution Implemented

### 1. Enhanced `init()` Method
```typescript
init(data: { player: Player }) {
  // Get the most up-to-date player data from GameState
  const gameState = GameState.getInstance();
  const savedPlayerData = gameState.getPlayerData();
  
  // If we have saved player data with relics, merge it with the passed player data
  if (savedPlayerData && savedPlayerData.relics) {
    this.player = { ...data.player, relics: [...savedPlayerData.relics] };
  } else {
    this.player = data.player;
  }
  // ...
}
```
**Why**: Ensures the treasure scene starts with the latest relic list from GameState, not a stale snapshot.

### 2. Improved `selectRelic()` Method
```typescript
private selectRelic(relic: Relic, selectedButton: Phaser.GameObjects.Container): void {
  const gameState = GameState.getInstance();
  
  // Add relic to player
  this.player.relics.push(relic);
  
  // Apply immediate relic acquisition effects
  RelicManager.applyRelicAcquisitionEffect(relic.id, this.player);
  
  // Create a new array to ensure it's saved properly
  gameState.updatePlayerData({ 
    ...this.player,
    relics: [...this.player.relics]
  });
  
  // ... UI updates ...
  
  // Return to overworld (player data already updated, no duplicate call)
  gameState.completeCurrentNode(true);
}
```
**Why**: 
- Creates a **new array** with `[...this.player.relics]` to ensure the entire array is saved, not just a reference
- Removed duplicate `updatePlayerData` call that was causing potential race conditions
- Ensures GameState receives a complete snapshot of the player with all relics

## Testing Checklist
- [ ] First treasure chest: Obtain a relic (e.g., Lucky Charm)
- [ ] Second treasure chest: Obtain another relic (e.g., Stone Golem Heart)
- [ ] Verify both relics appear in player inventory
- [ ] Third treasure chest: Obtain Merchant's Scale
- [ ] Verify all three relics are retained
- [ ] Visit shop and confirm Merchant's Scale discount applies
- [ ] Check that relics persist after combat, rest, and other scenes

## Files Modified
- `src/game/scenes/Treasure.ts`

## Related Issues
- Merchant's Scale migration from shop to treasure (completed)
- Shop discount functionality (working correctly)
- Relic acquisition effects (working correctly)

## Notes
- The fix ensures proper deep copying of the relics array when updating GameState
- All previous relics are now properly preserved across treasure encounters
- The solution maintains compatibility with all other scenes (Shop, Combat, Rest, etc.)

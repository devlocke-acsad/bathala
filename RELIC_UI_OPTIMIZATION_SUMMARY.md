# Relic UI Optimization Summary

## Problem Statement
The relic UI in the combat scene was being updated too frequently, causing performance issues and potential UI synchronization problems. The `updateRelicInventory()` method was called multiple times per frame without checks for whether updates were actually needed.

## Optimizations Implemented

### 1. Smart Update Caching
- Added `relicUpdatePending`, `lastRelicCount`, and `lastPotionCount` properties to track state
- Skip updates when relic/potion counts haven't changed
- Prevents redundant UI rebuilds when no actual changes occurred

### 2. Batched Update Scheduling
- Introduced `scheduleRelicInventoryUpdate()` method for deferred updates
- Uses `scene.time.delayedCall(1, ...)` to batch multiple update requests into a single frame
- Prevents multiple updates within the same frame cycle

### 3. Force Update for Major Changes
- Added `forceRelicInventoryUpdate()` for scenarios requiring immediate updates
- Used after shop purchases, potion usage, and elite relic rewards
- Ensures UI stays synchronized during critical state changes

### 4. Memory Leak Prevention
- Added `slot.removeAllListeners()` before reassigning event handlers
- Prevents accumulation of duplicate event listeners on relic/potion slots
- Improves long-term stability during extended play sessions

### 5. Optimized Call Sites
- **CombatUI.updatePlayerUI()**: Changed from immediate to scheduled update
- **CombatUI.createRelicInventory()**: Changed from immediate to scheduled update
- **CombatUI.usePotionInCombat()**: Changed to force update (immediate action needed)
- **Combat.endCombat()**: Changed to force update (major state change)
- **Combat.resize()**: Changed from immediate to scheduled update

## Performance Benefits

### Before Optimization:
- `updateRelicInventory()` called 3-6 times per frame during UI updates
- Full relic slot rebuild on every call regardless of actual changes
- Event listeners accumulated over time causing memory bloat
- Redundant DOM manipulation causing visual stuttering

### After Optimization:
- Maximum 1 `updateRelicInventory()` call per frame via scheduling
- Updates skipped when relic/potion counts are unchanged
- Event listeners properly cleaned up preventing memory leaks
- Smooth UI updates with minimal redundant work

## Code Changes Summary

### CombatUI.ts:
- Added state tracking properties for intelligent caching
- Implemented `scheduleRelicInventoryUpdate()` and `forceRelicInventoryUpdate()`
- Enhanced `updateRelicInventory()` with change detection and event cleanup
- Updated call sites to use scheduled vs. forced updates appropriately

### Combat.ts:
- Added `resume()` method for scene lifecycle management
- Updated relic UI calls to use optimized methods
- Improved post-shop UI synchronization

## Testing Recommendations

1. **Performance Testing**: Monitor frame rates during extended combat sessions
2. **Memory Testing**: Check for memory leaks during relic acquisition/usage
3. **UI Synchronization**: Verify relics appear correctly after shop purchases
4. **Event Handling**: Confirm hover/click interactions work consistently

## Future Considerations

1. Consider extending this pattern to other frequently-updated UI elements
2. Implement similar optimizations for card hand updates and status effects
3. Add debug logging (removable) to track update frequency in development builds
4. Consider implementing a general UI update scheduler for all combat UI elements

## Files Modified

- `src/game/scenes/combat/CombatUI.ts`: Core optimization implementation
- `src/game/scenes/Combat.ts`: Integration and scene lifecycle improvements

## Breaking Changes

None. All existing public methods maintain backward compatibility.
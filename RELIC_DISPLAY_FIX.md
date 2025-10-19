# Relic Display Fix - Combat UI

## Issue
Relics were not showing in the combat UI inventory at the top center of the screen.

## Root Cause
The `scheduleRelicInventoryUpdate()` method was being called too early in the initialization sequence:

1. `Combat.ts` → `create()` → `initializeCombat()` (sets up combat state with player relics)
2. `Combat.ts` → `create()` → `ui.initialize()` (creates UI elements)
3. `CombatUI.ts` → `initialize()` → `createRelicInventory()` (creates inventory container)
4. `CombatUI.ts` → `createRelicInventory()` → `scheduleRelicInventoryUpdate()` (scheduled with 1ms delay)

The 1ms delay was **not sufficient** for the scene to be fully ready, causing the update to fail silently or use incomplete data.

## Solution
Added a forced relic inventory update after the initial hand is drawn, with a 100ms delay to ensure the scene is fully initialized:

```typescript
// In Combat.ts, after drawInitialHand()
this.time.delayedCall(100, () => {
  this.ui.forceRelicInventoryUpdate();
});
```

## Changes Made

### 1. Combat.ts (Line ~266)
**Added:** Force update call with proper timing after `drawInitialHand()`

```typescript
// Draw initial hand
this.drawInitialHand();

// Force update relic inventory to ensure relics are visible
// (scheduleRelicInventoryUpdate in createRelicInventory might be too early)
this.time.delayedCall(100, () => {
  this.ui.forceRelicInventoryUpdate();
});

// Handle transition overlay for fade-in effect
```

### 2. CombatUI.ts (Line ~1067)
**Added:** Debug logging to trace relic data

```typescript
console.log("Updating relic inventory. Relics:", relics.length, "Potions:", potions.length);
console.log("Relic data:", relics);
```

### 3. CombatUI.ts (Line ~1100)
**Enhanced:** Relic icon rendering with better visibility

```typescript
// Add relic icon to the slot
console.log(`Adding relic ${index}:`, relic.name, "emoji:", relic.emoji);

const relicIcon = this.scene.add.text(0, 0, relic.emoji || "⚙️", {
  fontSize: 28,        // Increased from 24
  color: "#ffffff",    // Added white color
  align: "center"
}).setOrigin(0.5).setDepth(100);  // Added depth for layering
```

### 4. CombatUI.ts (Line ~1170)
**Enhanced:** Potion icon rendering with better visibility

```typescript
// Add potion icon to the slot
console.log(`Adding potion ${index}:`, potion.name, "emoji:", potion.emoji);

const potionIcon = this.scene.add.text(0, 0, potion.emoji || "🧪", {
  fontSize: 28,        // Increased from 24
  color: "#ffffff",    // Added white color
  align: "center"
}).setOrigin(0.5).setDepth(100);  // Added depth for layering
```

## Testing
To verify the fix works:

1. Start a new combat encounter
2. Check the console for logs:
   - `"Creating relic inventory container at: X, Y"`
   - `"Updating relic inventory. Relics: N Potions: M"`
   - `"Relic data: [...]"` (should show array of relics with emoji property)
   - `"Adding relic 0: Earthwarden's Plate emoji: 🛡️"`
   - `"Adding relic 1: Agimat of the Swift Wind emoji: 💨"`
   - `"Adding potion 0: Potion of Clarity emoji: 🔮"`
3. Verify relics appear in top-center inventory with **large, white emoji icons**:
   - Relics section (left): 6 slots with emoji icons (28px, white color)
   - Potions section (right): 3 slots with emoji icons (28px, white color)
4. Hover over relics to see:
   - Emoji icon scales up (1.15x) with smooth animation
   - Border turns white
   - Tooltip shows relic name
5. Click relics to see detailed modal

## Expected Behavior
- ✅ All relics from player inventory display with their emoji icons
- ✅ All potions from player inventory display with their emoji icons
- ✅ Tooltips show on hover
- ✅ Detailed modal shows on click
- ✅ Empty slots remain visible but empty

## Alternative Solutions Considered

### Option A: Increase scheduleRelicInventoryUpdate delay
```typescript
// In CombatUI.ts createRelicInventory()
this.scene.time.delayedCall(100, () => {
  this.updateRelicInventory();
});
```
**Rejected:** Would still rely on timing, less explicit

### Option B: Call updateRelicInventory directly in createRelicInventory
```typescript
// In CombatUI.ts createRelicInventory()
this.updateRelicInventory();
```
**Rejected:** Combat state might not be ready yet

### Option C: Force update after drawInitialHand (CHOSEN)
**Advantages:**
- Explicit timing after scene is fully initialized
- Combat state guaranteed to be ready
- Card drawing animation completes first
- Relics are visible when player starts their turn

## Future Improvements
1. Add error handling in `updateRelicInventory()` if combat state is null
2. Consider creating a `CombatUI.onSceneReady()` hook for better initialization flow
3. Add unit tests for relic inventory updates with different timing scenarios

## Related Files
- `bathala/src/game/scenes/Combat.ts` - Combat scene initialization
- `bathala/src/game/scenes/combat/CombatUI.ts` - Relic inventory UI
- `bathala/src/core/managers/RelicManager.ts` - Relic effect management
- `bathala/src/data/relics/Act1Relics.ts` - Relic data with emoji property

## References
- Previous fix: Emoji lookup from registry (Combat.ts line ~310)
- Relic system refactor: `RELIC_SYSTEM_REFACTOR.md`
- Relic effects documentation: `RELIC_EFFECTS_UPDATED.md`

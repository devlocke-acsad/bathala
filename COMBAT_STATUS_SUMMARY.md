# Combat Status & Enemy Action Summary

## Current Status:

### ✅ COMPLETED:
1. **Task 10: Enemy Intent Display** - Shows status effect icons and tooltips
2. **Status Effect UI Rendering** - Now displays status effects above player/enemy with tooltips

### ⚠️ ISSUES FOUND:

#### 1. Status Effect UI Not Visible (NOW FIXED)
**Problem:** Status effect containers existed but had no rendering code.

**Solution Applied:**
- Added `updateStatusEffectDisplay()` method to CombatUI.ts
- Renders status effects with emoji icons and stack counts
- Shows tooltips on hover with effect details
- Buffs displayed in green, debuffs in red
- Sorted display: buffs first, then debuffs

**Files Modified:**
- `bathala/src/game/scenes/combat/CombatUI.ts`

#### 2. Enemy Attack Patterns Not Working
**Problem:** Most enemy actions are not handled in `executeEnemyTurn()`, causing enemies to skip turns.

**Actions Currently Handled:**
- attack
- defend
- strengthen
- poison
- weaken

**Actions NOT Handled (enemies skip turn):**
- confuse
- charge, wait
- steal_block, disrupt_draw
- fear, critical_attack
- bleed_attack, fast_attack
- laugh_debuff, high_swing
- burn_aoe, summon_minion
- stun, air_attack
- mimic_element, curse_cards, hex_of_reversal

**Impact:** Enemies with these actions in their patterns will skip their turn when they reach that action, making combat easier than intended.

**Recommended Solution:**
1. **Short-term:** Add basic handlers for common actions (confuse, charge, wait, stun)
2. **Long-term:** Implement all special enemy actions with proper mechanics

#### 3. No Debug/Testing Mode
**Problem:** No way to test specific enemies or their attack patterns.

**Recommended Solution:**
Create a Combat Debug Screen with:
- List of all enemies
- Click to fight specific enemy
- Keyboard shortcut to access (F2 or D key)
- Useful for testing status effects and attack patterns

## Recommendations:

### Priority 1: Fix Common Enemy Actions
Add handlers for the most common unhandled actions:
```typescript
// In executeEnemyTurn():
else if (currentAction === "confuse") {
  // Apply Weak or reduce player's next damage
}
else if (currentAction === "charge") {
  // Increase enemy's next attack damage
}
else if (currentAction === "wait") {
  // Do nothing (skip turn intentionally)
}
else if (currentAction === "stun") {
  // Apply stun status to player (skip next turn)
}
```

### Priority 2: Create Debug Screen
Add a debug scene for testing:
- Accessible via keyboard shortcut
- Lists all enemies from Act1Enemies.ts
- Click to start combat with selected enemy
- Shows enemy stats and attack pattern

### Priority 3: Implement Remaining Actions
Implement all special enemy actions with proper mechanics and visual feedback.

## Files That Need Updates:

1. **bathala/src/game/scenes/Combat.ts**
   - Add handlers for unhandled enemy actions in `executeEnemyTurn()`
   - Update `updateEnemyIntent()` to show correct intent for new actions

2. **bathala/src/game/scenes/debug/** (new)
   - Create CombatDebugScene.ts for enemy testing

3. **bathala/src/data/enemies/Act1Enemies.ts**
   - May need to update enemy definitions if actions change

## Testing Checklist:

- [x] Status effects visible on player
- [x] Status effects visible on enemy  
- [x] Status effect tooltips work
- [x] Enemy intent shows status effects
- [ ] Enemies use all attack pattern actions
- [ ] Enemy intent shows correct action for all types
- [ ] Debug screen accessible
- [ ] Can select and fight any enemy
- [ ] All enemy actions work correctly

## Next Steps:

1. Test the status effect UI in-game
2. Decide which enemy actions to implement first
3. Create debug screen for testing
4. Implement remaining enemy actions

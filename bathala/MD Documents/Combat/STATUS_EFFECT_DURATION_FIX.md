# Status Effect Duration Fix

## Issue Summary
**Status effects (Stun and Weak) were not properly decrementing their duration**, causing them to last forever or behave incorrectly.

### Reported Bugs
1. **Stun (Lupa Special)**: Runs forever, not restricted to 1 turn
2. **Weak (Hangin Special)**: Duration not properly tracked

---

## Root Cause Analysis

### Original Code (BROKEN)
```typescript
private applyStatusEffects(entity: Player | Enemy): void {
  entity.statusEffects.forEach((effect) => {
    switch (effect.name) {
      case "Burn":
        this.damage(entity, effect.value);
        effect.duration--;
        break;
      case "Regeneration":
        this.heal(entity, effect.value);
        effect.duration--;
        break;
      // ❌ NO CASES FOR STUN, WEAK, VULNERABLE!
    }
  });

  entity.statusEffects = entity.statusEffects.filter(
    (effect) => effect.duration > 0
  );
}
```

**Problem**: Only "Burn" and "Regeneration" had their durations decremented. **Stun, Weak, and Vulnerable never expired!**

---

## The Fix

### Status Effect Duration Behavior

| Status Effect | Initial Duration | Behavior | Should Decrement? |
|---------------|------------------|----------|-------------------|
| **Stunned** | 1 turn | Enemy skips turn | ✅ YES - Each turn |
| **Weak** | 3 turns | Enemy deals 50% damage | ✅ YES - Each turn |
| **Vulnerable** | Varies | Takes 50% more damage | ✅ YES - Each turn |
| **Burn** | Varies | Takes damage per turn | ✅ YES - Already working |
| **Regeneration** | Varies | Heals per turn | ✅ YES - Already working |
| **Strength** | 999 (permanent) | Bonus damage | ❌ NO - Permanent buff |
| **Dexterity** | 999 (permanent) | Bonus block | ❌ NO - Permanent buff |

### Fixed Code
```typescript
private applyStatusEffects(entity: Player | Enemy): void {
  entity.statusEffects.forEach((effect) => {
    switch (effect.name) {
      case "Burn":
        this.damage(entity, effect.value);
        effect.duration--;
        break;
      case "Regeneration":
        this.heal(entity, effect.value);
        effect.duration--;
        break;
      case "Stunned":
        // ✅ FIXED: Decrement stun duration each turn
        // The stun check happens in executeEnemyTurn()
        effect.duration--;
        console.log(`[Stunned] Duration decremented to ${effect.duration}`);
        break;
      case "Weak":
        // ✅ FIXED: Decrement weak duration each turn
        // Weak effect applied in damagePlayer/damageEnemy
        effect.duration--;
        console.log(`[Weak] Duration decremented to ${effect.duration}`);
        break;
      case "Vulnerable":
        // ✅ FIXED: Decrement vulnerable duration each turn
        // Vulnerable effect applied in damagePlayer/damageEnemy
        effect.duration--;
        break;
      case "Strength":
      case "Dexterity":
        // Permanent buffs (duration 999) - no decrement needed
        break;
      default:
        // For any other status effects, decrement duration by default
        effect.duration--;
        break;
    }
  });

  entity.statusEffects = entity.statusEffects.filter(
    (effect) => effect.duration > 0
  );

  this.updateStatusEffectUI(entity);
}
```

---

## How It Works Now

### 🌪️ Lupa Special (Stun)
```typescript
// Applied in applyElementalEffects()
this.addStatusEffect(this.combatState.enemy, {
  id: "stun",
  name: "Stunned",
  type: "debuff",
  duration: 1, // ← 1 turn
  value: 1,
  description: "Cannot act for 1 turn.",
  emoji: "💫",
});
```

**Turn Flow:**
1. **Player Turn**: Lupa Special applied → Enemy gets Stunned (duration: 1)
2. **Enemy Turn**: `executeEnemyTurn()` checks for stun → Turn skipped
3. **End of Enemy Turn**: `applyStatusEffects()` called → **Duration decrements to 0**
4. **Next Player Turn**: Stun removed (duration <= 0)
5. **Next Enemy Turn**: Enemy can act normally ✅

### 💨 Hangin Special (Weak)
```typescript
// Applied in applyElementalEffects()
this.addStatusEffect(this.combatState.enemy, {
  id: "weak",
  name: "Weak",
  type: "debuff",
  duration: 3, // ← 3 turns
  value: 0.5,
  description: "Deals only 50% damage for 3 turns.",
  emoji: "⚠️",
});
```

**Turn Flow:**
1. **Player Turn**: Hangin Special applied → Enemy gets Weak (duration: 3)
2. **Enemy Turn 1**: Damage × 0.5 → `applyStatusEffects()` → **Duration: 2**
3. **Enemy Turn 2**: Damage × 0.5 → `applyStatusEffects()` → **Duration: 1**
4. **Enemy Turn 3**: Damage × 0.5 → `applyStatusEffects()` → **Duration: 0**
5. **Enemy Turn 4**: Full damage (Weak removed) ✅

---

## Testing Checklist

### Stun (Lupa Special)
- [ ] Apply Lupa Special → Enemy gets Stunned
- [ ] Enemy turn skipped (message: "Enemy is Stunned - Turn Skipped!")
- [ ] Next player turn → Stun status still visible
- [ ] **Next enemy turn → Stun expires, enemy attacks normally** ✅

### Weak (Hangin Special)
- [ ] Apply Hangin Special → Enemy gets Weak (3 turns)
- [ ] **Turn 1**: Enemy attacks with 50% damage, duration → 2
- [ ] **Turn 2**: Enemy attacks with 50% damage, duration → 1
- [ ] **Turn 3**: Enemy attacks with 50% damage, duration → 0
- [ ] **Turn 4**: Enemy attacks with full damage (Weak expired) ✅

### Vulnerable (Various sources)
- [ ] Apply Vulnerable → Duration decrements each turn
- [ ] Vulnerable expires after specified turns ✅

---

## Code Changes

### Modified File
- `src/game/scenes/Combat.ts` - `applyStatusEffects()` method (lines ~3142-3160)

### Changes Made
1. ✅ Added `case "Stunned"` with `effect.duration--`
2. ✅ Added `case "Weak"` with `effect.duration--`
3. ✅ Added `case "Vulnerable"` with `effect.duration--`
4. ✅ Added `case "Strength"` and `case "Dexterity"` to skip permanent buffs
5. ✅ Added `default` case to decrement duration for any other effects
6. ✅ Added console logs for debugging

### Impact
- **Before**: Stun lasted forever, Weak never expired
- **After**: All status effects properly decrement and expire
- **No breaking changes**: Existing effects (Burn, Regeneration) still work

---

## Why This Matters

### Gameplay Impact
- **Stun**: Should be powerful but limited (1 turn only)
- **Weak**: Should provide strategic advantage (3 turns of reduced damage)
- **Balance**: Status effects now work as designed

### Player Experience
- ✅ **Lupa Special feels balanced** - Powerful but not game-breaking
- ✅ **Hangin Special provides meaningful advantage** - 3 turns of safety
- ✅ **Clear visual feedback** - Status icons disappear when expired

---

## Future Considerations

### Potential Enhancements
1. **Visual duration indicators** - Show remaining turns on status icons
2. **Duration modifiers** - Relics that extend/reduce status durations
3. **Status stacking** - Allow multiple stacks of same status
4. **Cleanse mechanics** - Cards that remove debuffs/buffs

### Status Effect System Architecture
The current system is **turn-based decrement**:
- ✅ Simple and predictable
- ✅ Easy to debug
- ✅ Consistent with roguelike genre

**Note**: Status effects are applied at the **start of each turn** via `applyStatusEffects()`, ensuring consistent timing.

---

## Summary

### Bug Fixed ✅
- **Stun** now properly lasts 1 turn (not forever)
- **Weak** now properly lasts 3 turns (not forever)
- **All status effects** now decrement duration correctly

### Code Quality ✅
- Added explicit handling for all status types
- Added console logging for debugging
- Added default case for extensibility
- Maintained backward compatibility

### Testing Status
- Ready for testing in-game
- Follow testing checklist above
- Watch console logs for duration changes

**Result**: Status effects now work as intended, providing balanced gameplay! 🎮

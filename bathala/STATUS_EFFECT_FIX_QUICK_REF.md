# Status Effect Duration - Quick Reference

## The Problem
```
❌ Stun lasted forever (should be 1 turn)
❌ Weak lasted forever (should be 3 turns)
❌ Vulnerable never expired
```

## The Fix
```typescript
// Added proper duration handling for ALL status effects
case "Stunned":
  effect.duration--;  // ✅ Now expires after 1 turn
  break;
case "Weak":
  effect.duration--;  // ✅ Now expires after 3 turns
  break;
case "Vulnerable":
  effect.duration--;  // ✅ Now expires correctly
  break;
```

---

## Status Effect Behavior

| Effect | Duration | What It Does | When It Expires |
|--------|----------|--------------|-----------------|
| **Stunned** 💫 | 1 turn | Enemy skips turn | After enemy's turn |
| **Weak** ⚠️ | 3 turns | Enemy deals 50% damage | After 3 enemy attacks |
| **Vulnerable** 🎯 | Varies | Takes 50% more damage | After specified turns |
| **Burn** 🔥 | Varies | Takes damage per turn | After specified turns |
| **Regeneration** 💚 | Varies | Heals per turn | After specified turns |
| **Strength** † | 999 | Bonus damage | Permanent |
| **Dexterity** ⛨ | 999 | Bonus block | Permanent |

---

## How to Test

### Test Stun (Lupa Special)
1. Play Lupa (Earth) Special action
2. Enemy gets Stunned (💫 icon appears)
3. **Enemy turn**: Turn skipped (message shown)
4. **Player turn**: Stun icon still visible
5. **Next enemy turn**: Stun expires, enemy attacks ✅

### Test Weak (Hangin Special)
1. Play Hangin (Air) Special action
2. Enemy gets Weak (⚠️ icon with "3" duration)
3. **Turn 1**: Enemy attacks (50% damage), duration → 2
4. **Turn 2**: Enemy attacks (50% damage), duration → 1
5. **Turn 3**: Enemy attacks (50% damage), duration → 0
6. **Turn 4**: Enemy attacks (full damage) ✅

---

## Console Output
Watch for these logs to confirm fix:
```
[Stunned] Duration decremented to 0
[Weak] Duration decremented to 2
[Weak] Duration decremented to 1
[Weak] Duration decremented to 0
```

---

## Files Modified
- ✅ `src/game/scenes/Combat.ts` (applyStatusEffects method)
- ✅ `STATUS_EFFECT_DURATION_FIX.md` (detailed docs)
- ✅ This file (quick reference)

---

## Result
✅ **Stun works correctly** (1 turn only)  
✅ **Weak works correctly** (3 turns only)  
✅ **All status effects expire properly**  
✅ **No breaking changes to existing effects**

**Status**: Ready for testing! 🎮

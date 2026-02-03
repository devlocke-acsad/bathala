# Combat Fixes - Quick Reference

## Enemy Attack Fix
**File**: `Combat.ts` (lines ~1220-1230)

**What Changed**: Enemies now ALWAYS attack (no more defend/idle)

**Code**:
```typescript
// Simplified: Enemy always attacks
let damage = enemy.damage || enemy.intent.value || 12;
if (enemy.statusEffects.some((e) => e.name === "Weak")) {
  damage = Math.floor(damage * 0.5);
}
this.animations.animateEnemyAttack();
this.damagePlayer(damage);
```

**Result**: Combat flows properly, enemies attack every turn ✅

---

## Potion Inventory Redesign
**File**: `CombatUI.ts`

### Position
- **Old**: `screenWidth - 120, screenHeight / 2` (center-right)
- **New**: `screenWidth - 80, 200` (top-right)

### Size
- **Container**: `120w × 310h`
- **Slots**: `70px × 70px` (matching relics)
- **Padding**: `12px`

### Style
- Double border (outer + inner)
- Border: `0x77888C`
- Background: `0x120C0E`
- Slot BG: `0x1a1a1a`
- Slot border: `0x444444`

### Layout
```
┌──────────────┐
│   POTIONS    │
├──────────────┤
│   [Slot 1]   │  ← 70px
├──────────────┤
│   [Slot 2]   │  ← 70px
├──────────────┤
│   [Slot 3]   │  ← 70px
└──────────────┘
```

**Result**: Matches relic inventory design perfectly ✅

---

## Testing

### Enemy Attack
1. Start combat
2. End turn
3. **Expected**: Enemy attacks immediately
4. **Check**: Player HP decreases

### Potion Inventory
1. Open combat with potions
2. **Expected**: 3 vertical slots, top-right
3. **Expected**: 70px slots matching relics
4. Hover over potion
5. **Expected**: Slot brightens, icon scales up
6. **Expected**: Tooltip appears to the left

---

## Key Files Modified
- `src/game/scenes/Combat.ts` - Enemy attack logic
- `src/game/scenes/combat/CombatUI.ts` - Potion inventory


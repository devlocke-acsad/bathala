# Relic Integration Hooks Implementation

## Overview

This document describes the implementation of callback hooks that allow relics to modify status effects and elemental damage calculations. This system enables future relics to interact with the combat status and elemental systems in a flexible, extensible way.

## Implementation Summary

### 1. StatusEffectManager Callback Hooks

**Added Features:**
- `StatusEffectModifierCallback` type for relic modifications
- `registerModifier()` method to register callbacks
- `clearModifiers()` method to reset callbacks
- Modifier callbacks are applied when status effects are applied to targets

**How It Works:**
```typescript
// Register a modifier that adds bonus stacks
StatusEffectManager.registerModifier((effectId, stacks, target) => {
  if (effectId === 'poison' && hasRelicThatBoostsPoison) {
    return stacks + 1; // Add 1 extra stack
  }
  return stacks;
});
```

### 2. ElementalAffinitySystem Callback Hooks

**Added Features:**
- `ElementalDamageModifierCallback` type for elemental damage modifications
- `registerModifier()` method to register callbacks
- `clearModifiers()` method to reset callbacks
- Modifier callbacks are applied during elemental multiplier calculation

**How It Works:**
```typescript
// Register a modifier that boosts fire damage
ElementalAffinitySystem.registerModifier((element, multiplier, affinity) => {
  if (element === 'fire' && hasRelicThatBoostsFire) {
    return multiplier + 0.25; // Add 0.25× to fire damage
  }
  return multiplier;
});
```

### 3. RelicManager Integration

**Added Methods:**
- `registerRelicModifiers(player)` - Registers all relic-based modifiers at combat start
- `getStatusEffectStackBonus(effectId, player)` - Helper to calculate status effect bonuses
- `getElementalDamageBonus(element, player)` - Helper to calculate elemental damage bonuses

**Integration Points:**
- Called at the start of combat via `applyStartOfCombatEffects()`
- Automatically clears old modifiers and registers new ones
- Supports additive stacking for multiple relics

### 4. Additive Stacking

The system implements **additive stacking** for multiple relics affecting the same thing:

**Status Effects:**
- If Relic A adds +1 Poison and Relic B adds +2 Poison, total bonus is +3 Poison
- Multiple modifiers are applied sequentially, each adding to the result

**Elemental Damage:**
- If Relic A adds +0.25× Fire and Relic B adds +0.15× Fire, total bonus is +0.40× Fire
- Multipliers stack additively, not multiplicatively

### 5. Updated Relic Descriptions

Updated relic descriptions to mention status effect/elemental interactions:
- **Ember Fetish**: "[Interacts with Strength status effect]"
- **Tiyanak Tear**: "[Interacts with Strength status effect]"
- **Amomongo Claw**: "[Applies Vulnerable status effect]"
- **Bungisngis Grin**: "[Synergizes with debuff status effects]"
- **Mangangaway Wand**: "[Enhances elemental Special actions]"

## Property-Based Tests

### Property 10: Relic status effect modification
**Validates:** Requirements 7.1, 7.3

Tests that:
- Relic modifications are applied when status effects are applied
- Modifications happen at the appropriate time (during application)
- Multiple test runs with random status effects, stacks, and bonuses

### Property 11: Relic effect stacking
**Validates:** Requirements 7.5

Tests that:
- Multiple relics affecting status effects stack additively
- Multiple relics affecting elemental damage stack additively
- Different relics affecting different effects work independently
- Multiple test runs with random combinations of relics and bonuses

## Usage Example

```typescript
// At combat start
StatusEffectManager.initialize();
RelicManager.registerRelicModifiers(player);

// When applying a status effect
StatusEffectManager.applyStatusEffect(enemy, 'poison', 3);
// If player has relics that boost poison, the actual stacks will be higher

// When calculating elemental damage
const multiplier = ElementalAffinitySystem.calculateElementalMultiplier('fire', enemy.elementalAffinity);
// If player has relics that boost fire damage, the multiplier will be higher
```

## Future Extensibility

To add a new relic that modifies status effects or elemental damage:

1. **Define the relic** in `Act1Relics.ts` with appropriate description
2. **Update `getStatusEffectStackBonus()`** or **`getElementalDamageBonus()`** in RelicManager
3. **Add the bonus logic** based on the relic ID

Example:
```typescript
static getStatusEffectStackBonus(effectId: string, player: Player): number {
  let bonus = 0;
  
  // New relic that adds +2 to all Poison applications
  if (effectId === 'poison' && player.relics.some(r => r.id === 'poison_amplifier')) {
    bonus += 2;
  }
  
  return bonus;
}
```

## Testing

All tests pass:
- ✅ StatusEffectManager.test.ts (19 tests)
- ✅ ElementalAffinitySystem.test.ts (32 tests)
- ✅ RelicManager.integration.test.ts (6 property-based tests, 100 runs each)

## Requirements Satisfied

- ✅ 7.1: Relics can modify status effects when applied
- ✅ 7.2: Relics can modify elemental damage after weakness/resistance calculations
- ✅ 7.3: Relics trigger at appropriate times (during application/calculation)
- ✅ 7.4: Relic descriptions clearly indicate interactions
- ✅ 7.5: Multiple relics stack additively

## Files Modified

1. `bathala/src/core/managers/StatusEffectManager.ts` - Added callback hooks
2. `bathala/src/core/managers/ElementalAffinitySystem.ts` - Added callback hooks
3. `bathala/src/core/managers/RelicManager.ts` - Added registration and helper methods
4. `bathala/src/data/relics/Act1Relics.ts` - Updated relic descriptions
5. `bathala/src/core/managers/RelicManager.integration.test.ts` - New property-based tests

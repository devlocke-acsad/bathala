# Combat System Architecture

Technical documentation for developers working on Bathala's combat system.

## Table of Contents

1. [Overview](#overview)
2. [Core Systems](#core-systems)
3. [Data Flow](#data-flow)
4. [Integration Points](#integration-points)
5. [Testing Strategy](#testing-strategy)
6. [Performance Considerations](#performance-considerations)

---

## Overview

Bathala's combat system is built on three interconnected subsystems:

1. **Poker-Based Combat**: Card selection and hand evaluation
2. **Status Effect System**: Stackable buffs and debuffs
3. **Elemental Affinity System**: Weakness and resistance mechanics

These systems integrate with the existing DDA (Dynamic Difficulty Adjustment) and Relic systems to create a cohesive combat experience.

### Design Principles

- **Separation of Concerns**: Each system is self-contained and communicable through well-defined interfaces
- **Extensibility**: New status effects, elements, and relics can be added without modifying core logic
- **Clarity**: All calculations are transparent and debuggable
- **Performance**: Batch processing and caching minimize overhead

---

## Core Systems

### StatusEffectManager

**Location**: `src/core/managers/StatusEffectManager.ts`

**Purpose**: Centralized management of all status effects in the game.

#### Key Components

```typescript
// Status effect definition
interface StatusEffectDefinition {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: 'buff' | 'debuff';      // Classification
  emoji: string;                 // Icon for UI
  description: string;           // Tooltip text
  triggerTiming: StatusEffectTriggerTiming;  // When it triggers
  stackable: boolean;            // Can it stack?
  maxStacks?: number;            // Stack limit (optional)
  onTrigger?: (target, stacks) => StatusEffectTriggerResult | null;
  onApply?: (target, stacks) => void;
  onExpire?: (target) => void;
}
```

#### API Methods

```typescript
// Initialize the manager (call once at game start)
StatusEffectManager.initialize(): void

// Apply a status effect to a target
StatusEffectManager.applyStatusEffect(
  target: CombatEntity,
  effectId: string,
  stacks: number
): void

// Process effects at turn boundaries
StatusEffectManager.processStatusEffects(
  target: CombatEntity,
  timing: 'start_of_turn' | 'end_of_turn'
): StatusEffectTriggerResult[]

// Batch process multiple targets (more efficient)
StatusEffectManager.batchProcessStatusEffects(
  targets: CombatEntity[],
  timing: 'start_of_turn' | 'end_of_turn'
): StatusEffectTriggerResult[]

// Remove expired effects (0 stacks)
StatusEffectManager.cleanupExpiredEffects(target: CombatEntity): void

// Batch cleanup (more efficient)
StatusEffectManager.batchCleanupExpiredEffects(targets: CombatEntity[]): void

// Register relic modifiers
StatusEffectManager.registerModifier(
  callback: StatusEffectModifierCallback
): void

// Get definition for UI
StatusEffectManager.getDefinition(effectId: string): StatusEffectDefinition
```

#### Status Effect Lifecycle

1. **Application**: `applyStatusEffect()` adds or stacks the effect
2. **Trigger**: `processStatusEffects()` executes effect logic at turn boundaries
3. **Cleanup**: `cleanupExpiredEffects()` removes effects with 0 stacks

#### Adding New Status Effects

To add a new status effect:

1. Add definition to the `definitions` array in `StatusEffectManager.initialize()`
2. Implement `onTrigger`, `onApply`, or `onExpire` callbacks as needed
3. Update UI to display the new effect icon
4. Add tests for the new effect

Example:

```typescript
{
  id: 'burn',
  name: 'Burn',
  type: 'debuff',
  emoji: '🔥',
  description: 'Takes damage at end of turn, does not reduce',
  triggerTiming: 'end_of_turn',
  stackable: true,
  onTrigger: (target: CombatEntity, stacks: number) => {
    const damage = stacks * 1;
    target.currentHealth -= damage;
    return {
      effectName: 'Burn',
      targetName: target.name,
      value: damage,
      message: `${target.name} takes ${damage} burn damage`
    };
  }
}
```

### ElementalAffinitySystem

**Location**: `src/core/managers/ElementalAffinitySystem.ts`

**Purpose**: Manages elemental weakness and resistance calculations.

#### Key Components

```typescript
// Elemental affinity profile
interface ElementalAffinity {
  weakness: Element | null;    // Takes 1.5× damage
  resistance: Element | null;  // Takes 0.75× damage
}

// Element types
type Element = 'fire' | 'water' | 'earth' | 'air' | 'neutral';
```

#### API Methods

```typescript
// Calculate damage multiplier
ElementalAffinitySystem.calculateElementalMultiplier(
  element: Element | null,
  affinity: ElementalAffinity
): number  // Returns 0.75, 1.0, or 1.5

// Get dominant element from hand
ElementalAffinitySystem.getDominantElement(
  cards: PlayingCard[]
): Element | null

// Get UI display data
ElementalAffinitySystem.getAffinityDisplayData(
  affinity: ElementalAffinity
): {
  weaknessIcon: string;
  weaknessText: string;
  resistanceIcon: string;
  resistanceText: string;
}

// Register relic modifiers
ElementalAffinitySystem.registerModifier(
  callback: ElementalDamageModifierCallback
): void

// Utility methods
ElementalAffinitySystem.validateAffinity(affinity: ElementalAffinity): boolean
ElementalAffinitySystem.createDefaultAffinity(): ElementalAffinity
ElementalAffinitySystem.getElementName(element: Element): string
ElementalAffinitySystem.getElementIcon(element: Element): string
ElementalAffinitySystem.clearDominantElementCache(): void
```

#### Dominant Element Calculation

The system determines the dominant element by:

1. Counting cards of each suit in the hand
2. Mapping suits to elements (Apoy→Fire, Tubig→Water, etc.)
3. Returning the element with the most cards
4. Returning `null` if there's a tie or no clear dominant element

**Caching**: Results are cached for 1 second to avoid recalculation.

#### Adding New Elements

To add a new element:

1. Add to the `Element` type in `CombatTypes.ts`
2. Add suit-to-element mapping in `getDominantElement()`
3. Add element icon and name in utility methods
4. Define Special action effect in Combat scene
5. Update enemy definitions with new element affinities

### DamageCalculator

**Location**: `src/utils/DamageCalculator.ts`

**Purpose**: Calculates damage and block values with all modifiers.

#### Calculation Order

The damage calculation follows this strict order:

1. **Base Value**: Sum of card values
2. **Hand Bonus**: Bonus from poker hand type
3. **Elemental Bonus**: Bonus from pure element hands (Special only)
4. **Status Bonus**: Strength (+3 per stack for Attack)
5. **Relic Bonuses**: Additional bonuses from relics
6. **Subtotal**: Sum of all bonuses
7. **Hand Multiplier**: Multiply by poker hand multiplier
8. **Action Modifier**: ×0.8 for Defend, ×0.6 for Special
9. **Weak Debuff**: Reduces Attack damage by 25% per stack
10. **Elemental Multiplier**: ×1.5 for weakness, ×0.75 for resistance
11. **Vulnerable**: Target takes 50% more damage

**Key Insight**: Elemental multipliers apply AFTER all other calculations, making them very powerful.

#### API Methods

```typescript
// Main calculation method
DamageCalculator.calculate(
  cards: PlayingCard[],
  handType: HandType,
  actionType: "attack" | "defend" | "special",
  player?: Player,
  enemy?: Enemy,
  relicBonuses?: { name: string; amount: number }[]
): DamageCalculation

// Apply Vulnerable multiplier
DamageCalculator.applyVulnerableMultiplier(
  damage: number,
  target: CombatEntity
): number

// Utility methods
DamageCalculator.getCardValue(rank: Rank): number
DamageCalculator.getHandBonusData(handType: HandType): { bonus: number; multiplier: number }
```

#### DamageCalculation Interface

```typescript
interface DamageCalculation {
  baseValue: number;          // Sum of card values
  handBonus: number;          // Bonus from hand type
  handMultiplier: number;     // Multiplier from hand type
  elementalBonus: number;     // Bonus from dominant element
  elementalMultiplier: number; // Multiplier from weakness/resistance
  statusBonus: number;        // Bonus from status effects
  relicBonuses: { name: string; amount: number }[];
  subtotal: number;           // Before multipliers
  finalValue: number;         // Final damage/block value
  breakdown: string[];        // Human-readable breakdown
}
```

---

## Data Flow

### Turn Start Flow

```
Player Turn Start
    ↓
StatusEffectManager.processStatusEffects(player, 'start_of_turn')
    ↓
Trigger: Poison, Regeneration, Plated Armor
    ↓
Display floating text for each trigger
    ↓
StatusEffectManager.cleanupExpiredEffects(player)
    ↓
Player can select cards and action
```

### Action Execution Flow

```
Player selects cards and action type
    ↓
HandEvaluator.evaluateHand(cards)
    ↓
DamageCalculator.calculate(cards, handType, actionType, player, enemy)
    ├─ Calculate base damage
    ├─ Apply hand bonuses
    ├─ Apply status bonuses (Strength/Weak)
    ├─ Apply relic bonuses
    ├─ Apply elemental multiplier (if enemy has affinity)
    └─ Return DamageCalculation
    ↓
Apply damage/block to target
    ↓
If Special action:
    ├─ ElementalAffinitySystem.getDominantElement(cards)
    └─ StatusEffectManager.applyStatusEffect(target, effectId, stacks)
    ↓
Display animations and floating text
    ↓
Update UI
```

### Turn End Flow

```
Player Turn End
    ↓
StatusEffectManager.processStatusEffects(player, 'end_of_turn')
    ↓
Trigger: Ritual
    ↓
StatusEffectManager.cleanupExpiredEffects(player)
    ↓
Enemy Turn Start
    ↓
StatusEffectManager.processStatusEffects(enemy, 'start_of_turn')
    ↓
Enemy executes action
    ↓
StatusEffectManager.processStatusEffects(enemy, 'end_of_turn')
    ↓
StatusEffectManager.cleanupExpiredEffects(enemy)
    ↓
Next Player Turn
```

---

## Integration Points

### Combat Scene Integration

**File**: `src/game/scenes/Combat.ts`

#### Initialization

```typescript
create() {
  // Initialize status effect system
  StatusEffectManager.initialize();
  
  // Clear elemental cache for new combat
  ElementalAffinitySystem.clearDominantElementCache();
  
  // Register relic modifiers
  RelicManager.registerStatusEffectModifiers();
  RelicManager.registerElementalModifiers();
}
```

#### Turn Processing

```typescript
startPlayerTurn() {
  // Process start-of-turn effects
  const results = StatusEffectManager.processStatusEffects(
    this.combatState.player,
    'start_of_turn'
  );
  
  // Display floating text for each result
  results.forEach(result => {
    this.animations.showFloatingText(result.message, ...);
  });
  
  // Cleanup expired effects
  StatusEffectManager.cleanupExpiredEffects(this.combatState.player);
  
  // Update UI
  this.ui.updateStatusEffects();
}
```

#### Action Execution

```typescript
performAction(actionType: 'attack' | 'defend' | 'special') {
  // Calculate damage/block
  const calculation = DamageCalculator.calculate(
    this.selectedCards,
    handType,
    actionType,
    this.combatState.player,
    this.combatState.enemy,
    relicBonuses
  );
  
  // Apply damage/block
  if (actionType === 'attack') {
    this.dealDamageToEnemy(calculation.finalValue);
  } else if (actionType === 'defend') {
    this.combatState.player.block += calculation.finalValue;
  }
  
  // Apply Special action status effects
  if (actionType === 'special') {
    const element = ElementalAffinitySystem.getDominantElement(this.selectedCards);
    this.applySpecialActionEffect(element);
  }
}
```

### DDA Integration

**File**: `src/game/scenes/combat/CombatDDA.ts`

The DDA system adjusts enemy stats but preserves elemental affinities:

```typescript
applyDDAToEnemy(enemy: Enemy, adjustment: DifficultyAdjustment): Enemy {
  // Apply stat adjustments
  enemy.maxHealth = Math.floor(enemy.maxHealth * adjustment.healthMultiplier);
  enemy.attack = Math.floor(enemy.attack * adjustment.attackMultiplier);
  
  // Preserve elemental affinity (DO NOT MODIFY)
  // enemy.elementalAffinity remains unchanged
  
  return enemy;
}
```

### Relic Integration

**File**: `src/core/managers/RelicManager.ts`

Relics can modify status effects and elemental damage through callbacks:

```typescript
// Example: Relic that increases Poison stacks
StatusEffectManager.registerModifier((effectId, stacks, target) => {
  if (effectId === 'poison' && hasRelicEffect('poison_boost')) {
    return stacks + 1;  // Add 1 extra stack
  }
  return stacks;
});

// Example: Relic that increases Fire damage
ElementalAffinitySystem.registerModifier((element, multiplier, affinity) => {
  if (element === 'fire' && hasRelicEffect('fire_boost')) {
    return multiplier * 1.2;  // 20% more Fire damage
  }
  return multiplier;
});
```

---

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

**StatusEffectManager Tests** (`StatusEffectManager.test.ts`):
- Status effect application and stacking
- Trigger timing and execution
- Stack limits and overflow protection
- Cleanup of expired effects

**ElementalAffinitySystem Tests** (`ElementalAffinitySystem.test.ts`):
- Multiplier calculation (1.5×, 1.0×, 0.75×)
- Dominant element detection
- Tie handling
- Cache behavior

**DamageCalculator Tests** (`DamageCalculator.test.ts`):
- Calculation order verification
- Elemental multiplier integration
- Status effect modifiers
- Edge cases (0 damage, max damage)

### Property-Based Tests

Property-based tests verify universal properties across many inputs using **fast-check**:

**Example Property Test**:
```typescript
// Property: Elemental multiplier is always 0.75, 1.0, or 1.5
fc.assert(
  fc.property(
    fc.record({
      element: fc.constantFrom('fire', 'water', 'earth', 'air', null),
      weakness: fc.constantFrom('fire', 'water', 'earth', 'air', null),
      resistance: fc.constantFrom('fire', 'water', 'earth', 'air', null)
    }),
    ({ element, weakness, resistance }) => {
      const affinity = { weakness, resistance };
      const multiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        element,
        affinity
      );
      return [0.75, 1.0, 1.5].includes(multiplier);
    }
  ),
  { numRuns: 100 }
);
```

### Integration Tests

Integration tests verify system interactions:

**Combat Flow Tests** (`EnemyIntentIntegration.test.ts`):
- Full turn cycle with status effects
- Multiple status effects interacting
- DDA + elemental system integration
- Relic modifiers affecting calculations

---

## Performance Considerations

### Batch Processing

Use batch methods when processing multiple entities:

```typescript
// ❌ Inefficient
targets.forEach(target => {
  StatusEffectManager.processStatusEffects(target, 'start_of_turn');
  StatusEffectManager.cleanupExpiredEffects(target);
});

// ✅ Efficient
StatusEffectManager.batchProcessStatusEffects(targets, 'start_of_turn');
StatusEffectManager.batchCleanupExpiredEffects(targets);
```

### Caching

The ElementalAffinitySystem caches dominant element calculations:

```typescript
// Cache is automatically managed
const element1 = ElementalAffinitySystem.getDominantElement(cards);
const element2 = ElementalAffinitySystem.getDominantElement(cards); // Uses cache

// Clear cache when starting new combat
ElementalAffinitySystem.clearDominantElementCache();
```

### UI Updates

Throttle UI updates to avoid excessive re-renders:

```typescript
// Use a flag to batch UI updates
private uiUpdatePending: boolean = false;

scheduleUIUpdate() {
  if (!this.uiUpdatePending) {
    this.uiUpdatePending = true;
    this.time.delayedCall(16, () => {  // ~60 FPS
      this.updateUI();
      this.uiUpdatePending = false;
    });
  }
}
```

### Memory Management

- Clear caches when combat ends
- Remove event listeners in `shutdown()`
- Destroy unused sprites and containers

---

## Error Handling

All systems include comprehensive error handling:

### Validation

```typescript
// Validate inputs
if (!target || !target.statusEffects) {
  console.error('Invalid target');
  return;
}

// Validate numeric values
if (isNaN(stacks) || !isFinite(stacks)) {
  console.warn('Invalid stacks value, defaulting to 0');
  stacks = 0;
}
```

### Fallbacks

```typescript
// Missing affinity fallback
if (!enemy.elementalAffinity) {
  console.log('Enemy missing affinity, using default');
  enemy.elementalAffinity = ElementalAffinitySystem.createDefaultAffinity();
}

// Invalid element fallback
if (!validElements.includes(element)) {
  console.warn('Invalid element, treating as neutral');
  element = null;
}
```

### Safety Caps

```typescript
// Cap damage at maximum
if (finalValue > 9999) {
  console.warn('Damage exceeds maximum, capping at 9999');
  finalValue = 9999;
}

// Cap stacks at maximum
if (stacks > 999) {
  console.warn('Stacks exceed maximum, capping at 999');
  stacks = 999;
}
```

---

## Best Practices

### Adding New Features

1. **Define the interface first**: Create clear type definitions
2. **Write tests**: Unit tests for logic, property tests for invariants
3. **Document the API**: Add JSDoc comments to public methods
4. **Handle errors**: Validate inputs and provide fallbacks
5. **Optimize**: Use batch processing and caching where appropriate

### Modifying Existing Systems

1. **Check tests**: Ensure existing tests still pass
2. **Update documentation**: Keep docs in sync with code
3. **Preserve compatibility**: Don't break existing integrations
4. **Test edge cases**: Verify error handling still works

### Debugging

1. **Enable logging**: Check console for warnings and errors
2. **Use breakdown**: DamageCalculation includes step-by-step breakdown
3. **Inspect state**: Check entity.statusEffects array
4. **Verify order**: Ensure calculations happen in correct order

---

## Future Enhancements

### Planned Features

1. **More Status Effects**: Thorns, Intangible, Buffer, etc.
2. **Elemental Combos**: Bonus effects for using multiple elements
3. **Status Effect Synergies**: Effects that interact with each other
4. **Advanced Relics**: More complex relic effects and interactions

### Extensibility Points

The system is designed to support:

- Custom status effect triggers (on_damage_taken, on_card_played, etc.)
- Dynamic elemental affinities (change during combat)
- Status effect mutations (transform one effect into another)
- Conditional effects (trigger only if certain conditions met)

---

## Conclusion

Bathala's combat system is built on three well-defined, extensible subsystems that work together to create strategic depth. By following the patterns and best practices outlined in this document, developers can add new features while maintaining system integrity and performance.

For questions or clarifications, refer to the inline code documentation or the test files for examples of proper usage.

# Design Document: Combat Status & Elemental System

## Overview

This design enhances Bathala's poker-based combat system with two interconnected mechanics: an expanded status effect system and an elemental weakness/resistance system. The design follows Slay the Spire's clarity principles while maintaining Bathala's unique poker hand mechanics.

### Design Goals

1. **Strategic Depth**: Make elemental choice meaningful beyond damage bonuses
2. **Clarity**: Keep status effects simple and immediately understandable
3. **Balance**: Integrate seamlessly with existing DDA and damage calculation systems
4. **Extensibility**: Enable future additions without major refactoring

### Key Design Principles

- **Simplicity First**: Limit to 8 status effect types maximum
- **Slay the Spire Inspiration**: Use proven, clear status effect patterns
- **Predefined Affinities**: All enemy elemental weaknesses/resistances are hardcoded in enemy definitions
- **Consistent Resolution**: All effects process in a predictable order

## Architecture

### High-Level Component Structure

```
StatusEffectManager (new)
├── Manages all status effect definitions
├── Processes status effect triggers
└── Handles status effect stacking and expiration

ElementalAffinitySystem (new)
├── Stores enemy elemental profiles
├── Calculates elemental damage multipliers
└── Provides UI data for weakness/resistance display

DamageCalculator (modified)
├── Integrates elemental multipliers
└── Applies status effect modifiers (Weak, Strength)

Combat Scene (modified)
├── Calls StatusEffectManager at turn boundaries
├── Displays status effect UI
└── Applies elemental Special action effects

Enemy Data (modified)
└── Includes weakness and resistance properties
```

### Integration Points

1. **DamageCalculator**: Add elemental multiplier step after base damage calculation
2. **Combat.ts**: Add status effect processing at turn start/end
3. **CombatUI.ts**: Add status effect display containers
4. **Act1Enemies.ts**: Add elemental affinity properties to each enemy
5. **RelicManager.ts**: Add hooks for status effect and elemental modifiers

## Components and Interfaces

### StatusEffectManager

Central manager for all status effect logic.

```typescript
// StatusEffectManager.ts
export interface StatusEffectDefinition {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  emoji: string;
  description: string;
  triggerTiming: 'start_of_turn' | 'end_of_turn' | 'on_apply' | 'persistent';
  stackable: boolean;
  maxStacks?: number;
  onTrigger?: (target: CombatEntity, stacks: number) => void;
  onApply?: (target: CombatEntity, stacks: number) => void;
  onExpire?: (target: CombatEntity) => void;
}

export class StatusEffectManager {
  private static definitions: Map<string, StatusEffectDefinition> = new Map();
  
  // Register all status effect definitions
  static initialize(): void;
  
  // Apply a status effect to a target
  static applyStatusEffect(
    target: CombatEntity, 
    effectId: string, 
    stacks: number
  ): void;
  
  // Process all status effects for a target at a specific timing
  static processStatusEffects(
    target: CombatEntity, 
    timing: 'start_of_turn' | 'end_of_turn'
  ): StatusEffectTriggerResult[];
  
  // Remove expired status effects
  static cleanupExpiredEffects(target: CombatEntity): void;
  
  // Get definition for UI display
  static getDefinition(effectId: string): StatusEffectDefinition;
}
```

### ElementalAffinitySystem

Manages elemental weakness and resistance calculations.

```typescript
// ElementalAffinitySystem.ts
export interface ElementalAffinity {
  weakness: Element | null;  // Takes 1.5× damage from this element
  resistance: Element | null; // Takes 0.75× damage from this element
}

export class ElementalAffinitySystem {
  // Calculate damage multiplier based on element and enemy affinity
  static calculateElementalMultiplier(
    element: Element,
    affinity: ElementalAffinity
  ): number {
    if (affinity.weakness === element) return 1.5;
    if (affinity.resistance === element) return 0.75;
    return 1.0;
  }
  
  // Get dominant element from a hand of cards
  static getDominantElement(cards: PlayingCard[]): Element | null {
    // Returns the element with the most cards, or null if tied/none
  }
  
  // Get UI display data for an enemy's affinities
  static getAffinityDisplayData(affinity: ElementalAffinity): {
    weaknessIcon: string;
    resistanceIcon: string;
  };
}
```

### Modified DamageCalculator

Enhanced to include elemental multipliers.

```typescript
// DamageCalculator.ts (additions)
export interface DamageCalculation {
  // ... existing fields ...
  elementalMultiplier: number;  // NEW: 0.75, 1.0, or 1.5
  elementalBonus: number;       // EXISTING: bonus from pure element hands
  // ... rest of fields ...
}

export class DamageCalculator {
  static calculate(
    cards: PlayingCard[],
    handType: HandType,
    actionType: "attack" | "defend" | "special",
    player?: Player,
    enemy?: Enemy,  // NEW: needed for elemental affinity
    relicBonuses: { name: string; amount: number }[] = []
  ): DamageCalculation {
    // ... existing calculation steps ...
    
    // NEW STEP: Apply elemental weakness/resistance multiplier
    const dominantElement = ElementalAffinitySystem.getDominantElement(cards);
    let elementalMultiplier = 1.0;
    
    if (enemy && dominantElement) {
      elementalMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
        dominantElement,
        enemy.elementalAffinity
      );
    }
    
    // Apply multiplier after all other calculations
    finalValue = Math.floor(finalValue * elementalMultiplier);
    
    // ... rest of calculation ...
  }
}
```

## Data Models

### Status Effect Definitions

The system supports 8 core status effects:

```typescript
// Status effect definitions
const STATUS_EFFECTS: StatusEffectDefinition[] = [
  {
    id: 'poison',
    name: 'Poison',
    type: 'debuff',
    emoji: '☠️',
    description: 'Takes damage at start of turn, then reduces by 1',
    triggerTiming: 'start_of_turn',
    stackable: true,
    onTrigger: (target, stacks) => {
      // Deal stacks × 2 damage
      target.currentHealth -= stacks * 2;
      // Reduce stacks by 1
      const effect = target.statusEffects.find(e => e.id === 'poison');
      if (effect) effect.value -= 1;
    }
  },
  {
    id: 'weak',
    name: 'Weak',
    type: 'debuff',
    emoji: '⚠️',
    description: 'Attack actions deal 25% less damage per stack',
    triggerTiming: 'persistent',
    stackable: true,
    maxStacks: 3,  // Cap at 3 stacks (75% reduction max)
    onApply: (target, stacks) => {
      // Applied in DamageCalculator during attack calculation
    }
  },
  {
    id: 'plated_armor',
    name: 'Plated Armor',
    type: 'buff',
    emoji: '🛡️',
    description: 'Gain block at start of turn, then reduces by 1',
    triggerTiming: 'start_of_turn',
    stackable: true,
    onTrigger: (target, stacks) => {
      // Grant stacks × 3 block
      target.block += stacks * 3;
      // Reduce stacks by 1
      const effect = target.statusEffects.find(e => e.id === 'plated_armor');
      if (effect) effect.value -= 1;
    }
  },
  {
    id: 'regeneration',
    name: 'Regeneration',
    type: 'buff',
    emoji: '💚',
    description: 'Heal HP at start of turn, then reduces by 1',
    triggerTiming: 'start_of_turn',
    stackable: true,
    onTrigger: (target, stacks) => {
      // Heal stacks × 2 HP
      target.currentHealth = Math.min(
        target.maxHealth, 
        target.currentHealth + stacks * 2
      );
      // Reduce stacks by 1
      const effect = target.statusEffects.find(e => e.id === 'regeneration');
      if (effect) effect.value -= 1;
    }
  },
  {
    id: 'strength',
    name: 'Strength',
    type: 'buff',
    emoji: '💪',
    description: 'Attack actions deal +3 damage per stack',
    triggerTiming: 'persistent',
    stackable: true,
    onApply: (target, stacks) => {
      // Applied in DamageCalculator during attack calculation
    }
  },
  {
    id: 'vulnerable',
    name: 'Vulnerable',
    type: 'debuff',
    emoji: '🛡️💔',
    description: 'Takes 50% more damage from all sources',
    triggerTiming: 'persistent',
    stackable: false,  // Binary: either vulnerable or not
    onApply: (target, stacks) => {
      // Applied in damage calculation when target takes damage
    }
  },
  {
    id: 'frail',
    name: 'Frail',
    type: 'debuff',
    emoji: '🔻',
    description: 'Defend actions grant 25% less block per stack',
    triggerTiming: 'persistent',
    stackable: true,
    maxStacks: 3,
    onApply: (target, stacks) => {
      // Applied in DamageCalculator during defend calculation
    }
  },
  {
    id: 'ritual',
    name: 'Ritual',
    type: 'buff',
    emoji: '✨',
    description: 'Gain +1 Strength at end of turn',
    triggerTiming: 'end_of_turn',
    stackable: true,
    onTrigger: (target, stacks) => {
      // Apply Strength equal to Ritual stacks
      StatusEffectManager.applyStatusEffect(target, 'strength', stacks);
    }
  }
];
```

### Enemy Elemental Affinity Data

Each enemy in Act1Enemies.ts gets an `elementalAffinity` property:

```typescript
// Example enemy definitions with affinities
export const TIKBALANG_SCOUT: Omit<Enemy, "id"> = {
  name: "Tikbalang Scout",
  // ... existing properties ...
  elementalAffinity: {
    weakness: "fire",      // Takes 1.5× from Fire
    resistance: "water"    // Takes 0.75× from Water
  }
};

export const BALETE_WRAITH: Omit<Enemy, "id"> = {
  name: "Balete Wraith",
  // ... existing properties ...
  elementalAffinity: {
    weakness: "air",       // Takes 1.5× from Air
    resistance: "earth"    // Takes 0.75× from Earth
  }
};

// Thematic affinity assignments:
// - Fire creatures: weak to Water, resist Earth
// - Water creatures: weak to Earth, resist Fire
// - Earth creatures: weak to Air, resist Water
// - Air creatures: weak to Fire, resist Air
```

### Modified CombatTypes

```typescript
// CombatTypes.ts additions
export interface Enemy extends CombatEntity {
  // ... existing properties ...
  elementalAffinity: ElementalAffinity;  // NEW
}

export interface StatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff";
  value: number;  // Stack count
  emoji: string;
  description: string;
}

export interface StatusEffectTriggerResult {
  effectName: string;
  targetName: string;
  value: number;
  message: string;  // For floating text display
}
```

## Corre
ctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Elemental damage multiplier correctness

*For any* damage calculation with an element and enemy affinity, the elemental multiplier should be exactly 1.5× for weakness, 0.75× for resistance, and 1.0× for neutral elements.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Status effect data integrity

*For any* status effect application, the resulting status effect object must contain name, stacks (value), type (buff/debuff), and emoji properties.

**Validates: Requirements 2.1**

### Property 3: Status effect lifecycle correctness

*For any* creature with status effects, processing a turn should: (1) trigger start-of-turn effects before actions, (2) reduce temporary effect stacks by 1 at turn end, and (3) remove effects that reach 0 stacks.

**Validates: Requirements 2.2, 2.3, 2.4**

### Property 4: Elemental Special action effects

*For any* elemental Special action, the correct status effect should be applied: Fire → 3 Poison, Water → 8 HP heal, Earth → 3 Plated Armor, Air → 2 Weak.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 5: Status effect processing order

*For any* combination of status effects and actions, they should always process in the same order: start-of-turn effects, then action effects, then end-of-turn cleanup.

**Validates: Requirements 3.5, 8.4**

### Property 6: Enemy status effect actions

*For any* enemy action that applies a status effect (strengthen, poison, weaken), the correct status effect should be applied with the correct stack count (strengthen → 2 Strength on self, poison → 2 Poison on player, weaken → 1 Weak on player).

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 7: Status effect UI display completeness

*For any* creature with active status effects, the UI display should show all effects with their stack counts, in consistent order (buffs first, then debuffs), with tooltips containing name, description, and stack count.

**Validates: Requirements 2.5, 5.2, 5.4**

### Property 8: DDA and elemental affinity independence

*For any* enemy with DDA adjustments, the elemental affinity (weakness and resistance) should remain unchanged regardless of difficulty tier.

**Validates: Requirements 6.1, 6.3**

### Property 9: Damage calculation order

*For any* damage calculation involving DDA, elemental multipliers, and relics, they should be applied in order: base damage → DDA adjustments → elemental multipliers → relic modifiers.

**Validates: Requirements 6.2, 7.2**

### Property 10: Relic status effect modification

*For any* relic that modifies status effects or elemental damage, the modification should be applied at the appropriate time (status effects when applied, elemental damage after weakness/resistance calculation).

**Validates: Requirements 7.1, 7.3**

### Property 11: Relic effect stacking

*For any* multiple relics affecting the same status effect or element, their effects should stack additively.

**Validates: Requirements 7.5**

### Property 12: Status effect type limit

*For any* state of the system, the total number of different status effect types should never exceed 8.

**Validates: Requirements 8.1**

### Property 13: Enemy elemental affinity completeness

*For any* enemy definition, it must have an elementalAffinity object with both weakness and resistance properties defined (can be null, but must exist).

**Validates: Requirements 1.1**

### Property 14: StatusEffectManager extensibility

*For any* new status effect definition, the StatusEffectManager should accept a configuration object specifying type, stacking behavior, and trigger timing, and process it correctly.

**Validates: Requirements 9.1, 9.5**

## Error Handling

### Status Effect Errors

1. **Invalid Status Effect ID**: If an unknown status effect ID is referenced, log a warning and skip application
2. **Stack Overflow**: If a status effect exceeds maxStacks, cap at maxStacks rather than throwing error
3. **Negative Stacks**: If stacks would go negative, set to 0 and remove the effect
4. **Missing Target**: If status effect target is null/undefined, log error and skip

### Elemental Affinity Errors

1. **Missing Affinity**: If enemy lacks elementalAffinity property, default to no weakness/resistance (1.0× multiplier)
2. **Invalid Element**: If element is not one of the four valid types, treat as neutral (1.0× multiplier)
3. **Circular Affinity**: Prevent weakness and resistance being the same element (validation at enemy definition)

### Calculation Errors

1. **Division by Zero**: In damage calculations, ensure multipliers never result in division by zero
2. **Integer Overflow**: Cap damage values at reasonable maximums (9999)
3. **NaN Results**: If calculation produces NaN, log error and use fallback value (0 for damage, 1.0 for multipliers)

### UI Errors

1. **Missing Icons**: If status effect emoji is missing, use default "?" icon
2. **Tooltip Overflow**: Truncate long descriptions with "..." if they exceed container width
3. **Animation Failures**: If animation fails to play, still apply the effect (visual feedback is optional)

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples and edge cases:

1. **Status Effect Application**
   - Test applying each status effect type individually
   - Test applying status effects to player and enemy
   - Test stack limits and overflow behavior
   - Test status effect removal at 0 stacks

2. **Elemental Multiplier Calculation**
   - Test weakness multiplier (1.5×) with known damage values
   - Test resistance multiplier (0.75×) with known damage values
   - Test neutral multiplier (1.0×) with known damage values
   - Test edge cases (0 damage, max damage)

3. **Status Effect Triggers**
   - Test Poison dealing damage at start of turn
   - Test Regeneration healing at start of turn
   - Test Plated Armor granting block at start of turn
   - Test Weak reducing attack damage
   - Test Ritual granting Strength at end of turn

4. **Integration Points**
   - Test DamageCalculator with elemental multipliers
   - Test Combat scene calling StatusEffectManager
   - Test UI displaying status effects correctly
   - Test enemy definitions with elemental affinities

### Property-Based Testing

Property-based tests will verify universal properties across many inputs using **fast-check** (TypeScript PBT library):

1. **Property 1: Elemental damage multiplier correctness**
   - Generate: random damage values (1-1000), random elements, random enemy affinities
   - Test: multiplier is always exactly 1.5×, 0.75×, or 1.0× based on affinity
   - Iterations: 100

2. **Property 2: Status effect data integrity**
   - Generate: random status effect IDs, random stack counts (1-10), random targets
   - Test: applied status effect has all required properties (name, value, type, emoji)
   - Iterations: 100

3. **Property 3: Status effect lifecycle correctness**
   - Generate: random creatures with random status effects
   - Test: turn processing follows correct order and reduces stacks properly
   - Iterations: 100

4. **Property 4: Elemental Special action effects**
   - Generate: random hands with dominant elements
   - Test: Special action applies correct status effect for that element
   - Iterations: 100

5. **Property 5: Status effect processing order**
   - Generate: random combinations of status effects
   - Test: effects always process in same order regardless of application order
   - Iterations: 100

6. **Property 6: Enemy status effect actions**
   - Generate: random enemies with status effect actions
   - Test: executing action applies correct status effect with correct stacks
   - Iterations: 100

7. **Property 7: Status effect UI display completeness**
   - Generate: random creatures with random status effects
   - Test: UI display includes all effects with correct data
   - Iterations: 100

8. **Property 8: DDA and elemental affinity independence**
   - Generate: random enemies with random DDA tiers
   - Test: elemental affinity unchanged after DDA adjustments
   - Iterations: 100

9. **Property 9: Damage calculation order**
   - Generate: random damage scenarios with DDA, elements, and relics
   - Test: calculations applied in correct order (verify intermediate values)
   - Iterations: 100

10. **Property 10: Relic status effect modification**
    - Generate: random relics affecting status effects/elements
    - Test: modifications applied at correct time in calculation
    - Iterations: 100

11. **Property 11: Relic effect stacking**
    - Generate: random combinations of relics affecting same thing
    - Test: effects stack additively
    - Iterations: 100

12. **Property 12: Status effect type limit**
    - Generate: attempts to register more than 8 status effect types
    - Test: system enforces 8-type limit
    - Iterations: 100

13. **Property 13: Enemy elemental affinity completeness**
    - Generate: random enemy definitions
    - Test: all have elementalAffinity with weakness and resistance properties
    - Iterations: 100

14. **Property 14: StatusEffectManager extensibility**
    - Generate: random status effect configurations
    - Test: manager accepts and processes them correctly
    - Iterations: 100

### Testing Configuration

- **PBT Library**: fast-check (TypeScript property-based testing library)
- **Minimum Iterations**: 100 per property test
- **Test Tagging**: Each property test must include a comment with format:
  ```typescript
  // **Feature: combat-status-elemental-system, Property 1: Elemental damage multiplier correctness**
  ```

## Implementation Notes

### Performance Considerations

1. **Status Effect Processing**: Process effects in batches at turn boundaries rather than individually
2. **UI Updates**: Throttle status effect UI updates to avoid excessive re-renders
3. **Elemental Calculations**: Cache dominant element calculation for a hand to avoid recalculating
4. **Effect Lookup**: Use Map for status effect definitions rather than array iteration

### Backward Compatibility

1. **Existing Enemies**: All existing enemies need elementalAffinity added (can use migration script)
2. **Existing Status Effects**: Strength and Vulnerable already exist - ensure compatibility
3. **Save Data**: Existing save files need migration to include new status effect format
4. **DDA Integration**: Ensure DDA calculations still work with new elemental multipliers

### Future Extensibility

1. **New Status Effects**: Add to STATUS_EFFECTS array and StatusEffectManager will handle automatically
2. **New Elements**: Add to Element type and define Special action effect in mapping
3. **New Relics**: Use callback hooks in StatusEffectManager and ElementalAffinitySystem
4. **Complex Interactions**: StatusEffectManager supports custom onTrigger callbacks for unique effects

### UI/UX Considerations

1. **Status Effect Icons**: Use clear, distinct emojis for each effect
2. **Elemental Indicators**: Use element symbols (🔥💧🌿💨) for weakness/resistance
3. **Floating Text**: Show damage/healing numbers when effects trigger
4. **Tooltips**: Provide detailed information on hover without cluttering main UI
5. **Animation Timing**: Keep animations short (200-300ms) to maintain combat pace
6. **Color Coding**: Buffs in green/blue, debuffs in red/orange for quick recognition

### Balance Considerations

1. **Elemental Multipliers**: 1.5× and 0.75× provide meaningful but not overwhelming advantage
2. **Status Effect Values**: Poison (2 damage/stack), Plated Armor (3 block/stack), Regeneration (2 heal/stack) balanced for 8-card hands
3. **Stack Limits**: Weak and Frail capped at 3 stacks to prevent complete nullification
4. **Special Action Costs**: Special actions deal reduced damage (0.6× modifier) to balance status effect application
5. **Enemy Affinities**: Distributed to ensure no element is universally superior


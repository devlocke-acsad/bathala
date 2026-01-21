# Design Document: Acts 2 & 3 Implementation

## Overview

This design extends the existing Bathala game with two additional acts (chapters), building upon the established combat system, enemy patterns, and progression mechanics. Act 2 focuses on water-themed content (Tubig/Apoy elements), while Act 3 introduces celestial multi-element gameplay. The implementation will reuse existing assets with visual overlays to distinguish chapters, maintain simplified enemy attack patterns, and integrate seamlessly with the current game state management.

## Architecture

### High-Level Structure

```
bathala/src/
├── data/
│   ├── enemies/
│   │   ├── Act1Enemies.ts (existing)
│   │   ├── Act2Enemies.ts (new)
│   │   └── Act3Enemies.ts (new)
│   ├── relics/
│   │   ├── Act1Relics.ts (existing)
│   │   ├── Act2Relics.ts (new)
│   │   └── Act3Relics.ts (new)
│   └── potions/
│       ├── Act1Potions.ts (existing)
│       ├── Act2Potions.ts (new)
│       └── Act3Potions.ts (new)
├── core/
│   ├── managers/
│   │   ├── GameState.ts (modify - add chapter tracking)
│   │   └── VisualThemeManager.ts (new)
│   └── types/
│       └── CombatTypes.ts (modify - add chapter types)
└── game/
    └── scenes/
        └── debug/
            └── CombatDebugScene.ts (modify - add chapter navigation)
```

### Chapter Progression System

The game will track chapter progression through the existing GameState manager:

```typescript
interface ChapterState {
  currentChapter: 1 | 2 | 3;
  unlockedChapters: Set<number>;
  chapterCompletions: Map<number, boolean>;
}
```

## Components and Interfaces

### 1. Enemy Data Structure (Acts 2 & 3)

Following the Act 1 pattern, each enemy will have:

```typescript
interface ChapterEnemy extends Omit<Enemy, "id"> {
  name: string;
  maxHealth: number;
  attackPattern: string[]; // Simplified to 2-4 actions
  elementalAffinity: ElementalAffinity;
  dialogue: {
    introduction: string;
    defeat: string;
    spare: string;
    slay: string;
  };
  loreSource: string; // Citation for mythology reference
}
```

**Act 2 Enemy Scaling:**
- Common: 15-40 HP (multiplied by 8× from base)
- Elite: 68-85 HP (multiplied by 6× from base)
- Boss (Bakunawa): 150 HP

**Act 3 Enemy Scaling:**
- Common: 22-38 HP (multiplied by 8× from base)
- Elite: 45-85 HP (multiplied by 6× from base)
- Boss (False Bathala): 200 HP

### 2. Simplified Attack Patterns

Each enemy will have 2-4 distinct actions in their pattern array:

**Pattern Types:**
- `"attack"` - Deal damage
- `"defend"` - Gain block
- `"weaken"` - Apply Weak debuff
- `"strengthen"` - Apply Strength buff
- `"poison"` - Apply Burn/Poison debuff
- `"stun"` - Apply Frail debuff
- `"heal"` - Restore HP (Act 2 specific)
- `"charm"` - Apply miss chance (Act 2 specific)
- `"nullify"` - Remove buffs (Act 3 specific)

**Example Patterns:**
```typescript
// Simple aggressive
attackPattern: ["attack", "attack", "defend"]

// Defensive support
attackPattern: ["defend", "heal", "attack"]

// Debuff focused
attackPattern: ["weaken", "attack", "strengthen"]
```

### 3. Visual Theme System

A new `VisualThemeManager` will handle chapter-specific visual overlays:

```typescript
interface ChapterTheme {
  overlayColor: number; // Hex color for tint
  overlayAlpha: number; // Transparency (0-1)
  particleEffect?: string; // Optional particle system
  ambientSound?: string; // Optional ambient audio
}

const CHAPTER_THEMES: Record<number, ChapterTheme> = {
  1: {
    overlayColor: 0x8B7355, // Brown/earth tones
    overlayAlpha: 0.15,
  },
  2: {
    overlayColor: 0x4A90E2, // Blue/teal for water
    overlayAlpha: 0.20,
  },
  3: {
    overlayColor: 0xFFD700, // Gold/purple for celestial
    overlayAlpha: 0.18,
  },
};
```

### 4. Relic and Potion Data

Following Act 1's structure, each chapter will have 10 relics and 10 potions:

```typescript
interface ChapterRelic extends Relic {
  chapter: 1 | 2 | 3;
  category: 'common' | 'elite' | 'boss' | 'treasure';
  loreInspiration: string;
}

interface ChapterPotion extends Potion {
  chapter: 1 | 2 | 3;
  loreInspiration: string;
}
```

## Data Models

### Act 2 Enemies (The Submerged Barangays)

**Common Enemies (7):**
1. **Sirena Illusionist** - HP: 30, Pattern: `["heal", "charm", "attack"]`
2. **Siyokoy Raider** - HP: 40, Pattern: `["defend", "attack", "attack"]`
3. **Santelmo Flicker** - HP: 20, Pattern: `["attack", "defend", "attack"]`
4. **Berberoka Lurker** - HP: 32, Pattern: `["weaken", "attack", "defend"]`
5. **Magindara Swarm** - HP: 15 each (3 units), Pattern: `["attack", "heal"]`
6. **Kataw** - HP: 28, Pattern: `["heal", "attack", "strengthen"]`
7. **Berbalang** - HP: 26, Pattern: `["weaken", "attack", "attack"]`

**Elite Enemies (2):**
1. **Sunken Bangkilan** - HP: 70, Pattern: `["weaken", "attack", "heal", "strengthen"]`
2. **Apoy-Tubig Fury** - HP: 68, Pattern: `["poison", "attack", "heal", "attack"]`

**Boss:**
- **Bakunawa** - HP: 150, Pattern: `["weaken", "attack", "strengthen", "attack", "poison"]`

### Act 3 Enemies (The Skyward Citadel)

**Common Enemies (7):**
1. **Tigmamanukan Watcher** - HP: 26, Pattern: `["strengthen", "attack", "attack"]`
2. **Diwata Sentinel** - HP: 38, Pattern: `["defend", "attack", "defend"]`
3. **Sarimanok Keeper** - HP: 30, Pattern: `["nullify", "strengthen", "attack"]`
4. **Bulalakaw Flamewings** - HP: 33, Pattern: `["poison", "attack", "defend"]`
5. **Minokawa Harbinger** - HP: 28, Pattern: `["weaken", "attack", "defend"]`
6. **Alan** - HP: 24, Pattern: `["attack", "attack", "strengthen"]`
7. **Ekek** - HP: 22, Pattern: `["attack", "weaken", "attack"]`

**Elite Enemies (2):**
1. **Ribung Linti Duo** - HP: 45 each (2 units), Pattern: `["attack", "strengthen", "attack", "defend"]`
2. **Apolaki Godling** - HP: 85, Pattern: `["strengthen", "attack", "nullify", "attack", "poison"]`

**Boss:**
- **False Bathala** - HP: 200, Pattern: `["nullify", "weaken", "strengthen", "attack", "poison", "attack"]`

### Act 2 Relics (10)

1. **Sirena's Scale** - +2 heal per Tubig card played
2. **Siyokoy Fin** - +3 block on splash damage
3. **Santelmo Ember** - Burn damage +2 per stack
4. **Berberoka Tide** - +10 block when playing Tubig cards
5. **Magindara Song** - +1 card draw when healing
6. **Kataw Crown** - +5 damage when enemy has minions
7. **Berbalang Spirit** - Ignore first Weak debuff each turn
8. **Bangkilan Veil** - +10% dodge chance when cursed
9. **Elemental Core** - +3 damage on Apoy/Tubig cards
10. **Bakunawa Fang** - +5 damage when using relics

### Act 3 Relics (10)

1. **Tigmamanukan Feather** - +1 card draw for high-tier hands
2. **Diwata Veil** - +10% dodge chance
3. **Sarimanok Plumage** - +1 Special action charge
4. **Bulalakaw Spark** - +3 Burn on multi-element hands
5. **Minokawa Claw** - Ignore first steal attempt
6. **Alan Wing** - +5 damage when summoning
7. **Ekek Fang** - +3 damage during night phase
8. **Linti Bolt** - +5 damage on multi-element combos
9. **Apolaki's Spear** - +5 damage on multi-element hands
10. **Coconut Diwa** - Ignore first nullify effect

### Act 2 Potions (10)

1. **Sirena Melody** - Heal 15 HP
2. **Siyokoy Scale** - Gain 15 Block
3. **Santelmo Spark** - Apply 10 Burn to all enemies
4. **Berberoka Flood** - Deal 20 damage to one enemy
5. **Magindara Venom** - Remove 1 debuff
6. **Kataw Wave** - Draw 2 additional cards
7. **Berbalang Essence** - Gain 10 Block when Weakened
8. **Bangkilan Curse** - Heal 20 HP and remove curse
9. **Elemental Surge** - Deal 15 damage (Apoy/Tubig bonus)
10. **Bakunawa Eclipse** - Deal 25 damage to one enemy

### Act 3 Potions (10)

1. **Tigmamanukan Omen** - Draw 3 additional cards
2. **Diwata Grace** - Heal 20 HP
3. **Sarimanok Shine** - Gain 10 Block
4. **Bulalakaw Flame** - Apply 10 Burn to all enemies
5. **Minokawa Shadow** - Remove 1 debuff
6. **Alan Breeze** - Draw 2 additional cards
7. **Ekek Blood** - Deal 15 damage to one enemy
8. **Linti Surge** - Deal 20 damage (multi-element bonus)
9. **Apolaki Sun** - Heal 25 HP
10. **Coconut Sap** - Heal 20 HP and remove debuff

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chapter progression is monotonic

*For any* game state, the current chapter number should never decrease unless explicitly reset by the player, and unlocked chapters should remain unlocked throughout the session.

**Validates: Requirements 1.1, 2.1**

### Property 2: Enemy data integrity

*For any* enemy loaded from Act 2 or Act 3 data files, all required properties (name, maxHealth, attackPattern, elementalAffinity, dialogue) must be present and valid.

**Validates: Requirements 6.2, 6.4**

### Property 3: Attack pattern simplicity

*For any* enemy in Acts 2 or 3, the attackPattern array length should be between 2 and 6 actions inclusive, ensuring patterns remain understandable.

**Validates: Requirements 3.1, 3.2**

### Property 4: Visual theme application

*For any* chapter transition, the visual overlay should be applied with the correct color and alpha values corresponding to the target chapter.

**Validates: Requirements 1.2, 2.2, 7.2, 7.3**

### Property 5: Relic and potion chapter association

*For any* relic or potion obtained in a specific chapter, its chapter property should match the current game chapter, ensuring proper thematic consistency.

**Validates: Requirements 4.1, 4.2, 4.4**

### Property 6: HP scaling consistency

*For any* enemy of a given type (common/elite/boss) in a specific chapter, its HP should fall within the defined range for that chapter and enemy type.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6**

### Property 7: Dev mode chapter navigation

*For any* chapter selection in dev mode, the game state should transition to that chapter with all appropriate variables initialized, regardless of current progression.

**Validates: Requirements 5.2, 5.3**

### Property 8: Dialogue completeness

*For any* enemy encounter, all four dialogue types (introduction, defeat, spare, slay) must be defined and non-empty strings.

**Validates: Requirements 1.3, 2.3**

### Property 9: Elemental affinity validity

*For any* enemy with elemental affinity, the weakness and resistance elements should be distinct (not the same element) or one should be null.

**Validates: Requirements 2.5, 6.2**

### Property 10: Relic effect application

*For any* chapter-specific relic in the player's inventory, its effects should be applied correctly during combat according to its trigger conditions.

**Validates: Requirements 4.5**

## Error Handling

### Enemy Data Loading Errors

- **Missing enemy data**: Fall back to a default enemy template with warning log
- **Invalid attack pattern**: Use simplified default pattern `["attack", "defend", "attack"]`
- **Missing dialogue**: Use generic placeholder dialogue with creature name

### Chapter Transition Errors

- **Invalid chapter number**: Clamp to valid range (1-3) and log warning
- **Locked chapter access**: Redirect to highest unlocked chapter
- **Theme loading failure**: Fall back to Chapter 1 theme

### Visual Theme Errors

- **Invalid overlay color**: Use default neutral overlay (0xFFFFFF, alpha 0.1)
- **Missing theme data**: Fall back to Chapter 1 theme configuration

### Relic/Potion Loading Errors

- **Missing relic data**: Skip relic and log warning, continue with available relics
- **Invalid potion effect**: Disable potion and show error message to player

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Enemy data structure validation for all Act 2 and Act 3 enemies
- Attack pattern length constraints (2-6 actions)
- HP values within specified ranges for each enemy type
- Dialogue completeness for all enemies
- Relic and potion data structure validation
- Chapter theme configuration validity
- Dev mode chapter navigation state transitions

### Property-Based Testing

Property-based tests will use **fast-check** (JavaScript/TypeScript PBT library) with a minimum of 100 iterations per test:

- **Property 1 Test**: Generate random sequences of chapter transitions and verify monotonic progression
- **Property 2 Test**: Generate random enemy selections and verify all required fields are present
- **Property 3 Test**: Generate all enemy definitions and verify attack pattern lengths
- **Property 4 Test**: Generate random chapter numbers and verify correct theme application
- **Property 5 Test**: Generate random relic/potion acquisitions and verify chapter association
- **Property 6 Test**: Generate all enemies and verify HP within defined ranges
- **Property 7 Test**: Generate random dev mode chapter selections and verify state initialization
- **Property 8 Test**: Generate all enemies and verify dialogue completeness
- **Property 9 Test**: Generate all enemies and verify elemental affinity validity
- **Property 10 Test**: Generate random relic collections and verify effect application

### Integration Testing

Integration tests will verify:
- Complete combat flow with Act 2 enemies
- Complete combat flow with Act 3 enemies
- Chapter progression from Act 1 → Act 2 → Act 3
- Visual theme transitions between chapters
- Relic effects working correctly in chapter-specific contexts
- Dev mode navigation between all chapters

### Manual Testing

Manual playtesting will verify:
- Visual distinction is clear and aesthetically pleasing
- Enemy attack patterns feel balanced and understandable
- Relic and potion effects provide meaningful gameplay choices
- Chapter progression feels natural and rewarding
- Dev mode controls are intuitive and functional

## Implementation Notes

### Code Organization

- Follow existing Act 1 patterns for consistency
- Use TypeScript strict mode for type safety
- Include lore source citations as comments in enemy data
- Maintain separation between data (enemies, relics, potions) and logic (combat, state management)

### Asset Reuse Strategy

- Use existing enemy sprites with color tints for chapter distinction
- Apply overlay filters to existing backgrounds
- Reuse existing UI elements with chapter-themed colors
- Placeholder sprites can use colored rectangles with emoji icons

### Performance Considerations

- Lazy-load chapter-specific data only when needed
- Cache theme configurations to avoid repeated calculations
- Minimize overlay rendering overhead by using efficient blend modes
- Reuse existing combat system without modifications where possible

### Extensibility

- Design data structures to easily accommodate future acts (4, 5, etc.)
- Keep chapter-specific logic isolated for easy maintenance
- Use configuration-driven approach for themes and scaling
- Document all mythology sources for future content creation

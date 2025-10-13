# Combat Damage Calculation System

**Version**: 1.0  
**Last Updated**: January 2025  
**System**: Balatro-Inspired Damage Calculation

---

## Overview

Bathala's combat system uses a **Balatro-inspired damage calculation** that makes individual card values matter alongside poker hand types. This creates deeper strategic decisions where both the quality of your cards and the hands you form contribute to your power.

### Key Principle
**Final Damage = (Base Value + Hand Bonus + Status Bonus) × Hand Multiplier**

This formula ensures that:
- ✅ High Card no longer deals 0 damage (was a bug)
- ✅ Card quality matters (pair of Datus > pair of 2s)
- ✅ Hand types remain important through bonuses and multipliers
- ✅ Strategic depth increases without complexity bloat

---

## Damage Calculation Formula

### Core Components

1. **Base Value**: Sum of all card ranks in the played hand
2. **Hand Bonus**: Flat bonus from the poker hand type
3. **Hand Multiplier**: Multiplier applied based on hand type
4. **Status Bonus**: Additional value from Strength/Dexterity buffs
5. **Relic Bonuses**: Flat bonuses added before multiplication
6. **Action Modifier**: Final modifier based on Attack/Defend/Special

### Complete Formula

```
Subtotal = Base Value + Hand Bonus + Status Bonus + Relic Bonuses
Final Value = Subtotal × Hand Multiplier × Action Modifier
```

---

## Card Values (Base Value)

Each card contributes to the base damage:

| Rank | Value | Notes |
|------|-------|-------|
| 1 (Ace) | 11 | Highest single card value |
| 2 | 2 | |
| 3 | 3 | |
| 4 | 4 | |
| 5 | 5 | |
| 6 | 6 | |
| 7 | 7 | |
| 8 | 8 | |
| 9 | 9 | |
| 10 | 10 | |
| Mandirigma (Jack) | 10 | |
| Babaylan (Queen) | 10 | |
| Datu (King) | 10 | |

**Example**: Playing 7, 7, Datu, Babaylan, Ace = 7 + 7 + 10 + 10 + 11 = **45 base value**

---

## Hand Type Bonuses & Multipliers

| Hand Type | Hand Bonus | Multiplier | Notes |
|-----------|-----------|------------|-------|
| High Card | +5 | ×1 | Minimum viable hand |
| Pair | +10 | ×2 | Two matching ranks |
| Two Pair | +20 | ×2 | Two different pairs |
| Three of a Kind | +30 | ×3 | Three matching ranks |
| Straight | +30 | ×4 | Five consecutive ranks |
| Flush | +35 | ×4 | Five same-suit cards |
| Full House | +40 | ×4 | Three of a kind + pair |
| Four of a Kind | +60 | ×7 | Four matching ranks |
| Straight Flush | +100 | ×8 | Straight + Flush |
| Royal Flush | +100 | ×8 | A-K-Q-J-10 suited |
| Five of a Kind* | +120 | ×12 | Requires Echo of Ancestors relic |

*Five of a Kind is only possible with the "Echo of the Ancestors" relic

---

## Status Effect Bonuses

Status effects add to the base value **before** multiplication:

### Attack Actions
- **Strength**: +5 base value per stack
  - Example: 2 stacks of Strength = +10 base value

### Defend Actions
- **Dexterity**: +5 base value per stack
  - Example: 3 stacks of Dexterity = +15 base value

### Debuffs
- **Weak**: Reduces final damage by 25% (applied after calculation)
- **Vulnerable**: Target takes 50% more damage (applied to receiver)

---

## Action Type Modifiers

Different actions have different efficiency:

| Action Type | Modifier | Purpose |
|-------------|----------|---------|
| **Attack** | ×1.0 (100%) | Full damage to enemy |
| **Defend** | ×0.8 (80%) | Converted to block value |
| **Special** | ×0.6 (60%) | Lower damage but unique elemental effects |

---

## Calculation Examples

### Example 1: Basic High Card
**Cards**: Single Datu (King)

```
Base Value: 10 (Datu)
Hand Bonus: +5 (High Card)
Subtotal: 10 + 5 = 15
Hand Multiplier: ×1 (High Card)
Final Damage: 15 × 1 = 15 damage
```

### Example 2: Pair with High Cards
**Cards**: Datu, Datu (pair of Kings)

```
Base Value: 10 + 10 = 20
Hand Bonus: +10 (Pair)
Subtotal: 20 + 10 = 30
Hand Multiplier: ×2 (Pair)
Final Damage: 30 × 2 = 60 damage
```

### Example 3: Three of a Kind with Strength
**Cards**: 7, 7, 7 (three 7s)  
**Status**: 2 stacks of Strength

```
Base Value: 7 + 7 + 7 = 21
Hand Bonus: +30 (Three of a Kind)
Status Bonus: +10 (2 × Strength)
Subtotal: 21 + 30 + 10 = 61
Hand Multiplier: ×3 (Three of a Kind)
Final Damage: 61 × 3 = 183 damage
```

### Example 4: Flush (High Power Hand)
**Cards**: 5, 7, 9, Babaylan, Datu (all Apoy/Fire suit)

```
Base Value: 5 + 7 + 9 + 10 + 10 = 41
Hand Bonus: +35 (Flush)
Subtotal: 41 + 35 = 76
Hand Multiplier: ×4 (Flush)
Final Damage: 76 × 4 = 304 damage
```

### Example 5: Straight Flush (Maximum Power)
**Cards**: 6, 7, 8, 9, 10 (all Tubig/Water suit)

```
Base Value: 6 + 7 + 8 + 9 + 10 = 40
Hand Bonus: +100 (Straight Flush)
Subtotal: 40 + 100 = 140
Hand Multiplier: ×8 (Straight Flush)
Final Damage: 140 × 8 = 1,120 damage
```

### Example 6: Defend Action
**Cards**: Pair of 8s  
**Status**: 1 stack of Dexterity

```
Base Value: 8 + 8 = 16
Hand Bonus: +10 (Pair)
Status Bonus: +5 (1 × Dexterity)
Subtotal: 16 + 10 + 5 = 31
Hand Multiplier: ×2 (Pair)
Pre-modifier: 31 × 2 = 62
Defense Modifier: ×0.8
Final Block: 62 × 0.8 = 49 block
```

---

## Balance Changes Summary

To accommodate the new damage system, all combat stats were scaled:

### Player Stats
- **Max Health**: 80 → **160** (×2)
- Starting health scales with progression

### Enemy Stats (Common)
- **Health**: ×5 multiplier
  - Example: Tikbalang Scout 28 → **140 HP**
  - Example: Sigbin Charger 35 → **175 HP**
- **Damage**: ×3 multiplier
  - Example: Tikbalang 7 → **21 damage**
  - Example: Sigbin 10 → **30 damage**

### Enemy Stats (Elite/Boss)
- **Health**: ×4 multiplier
  - Example: Kapre Shade 65 → **260 HP**
  - Example: Mangangaway (Boss) 120 → **480 HP**
- **Damage**: ×3 multiplier
  - Example: Kapre 12 → **36 damage**
  - Example: Mangangaway 15 → **45 damage**

---

## Strategic Implications

### Card Selection Matters
- **Before**: Pair of 2s = Pair of Datus (both dealt 2 damage)
- **After**: Pair of 2s = 24 damage vs Pair of Datus = 60 damage

### High Cards Gain Value
- Aces, face cards, and 10s are now premium cards
- Deck-sculpting to remove low cards becomes more valuable

### Hand Quality vs Quantity
- Playing fewer high-value cards can beat more low-value cards
- Three Datus (3-of-a-kind) = 120 damage
- Five low cards (straight 2-6) = 100 damage

### Status Effects Amplified
- Strength/Dexterity bonuses get multiplied by hand multipliers
- Building status stacks is more rewarding than before

---

## Implementation Architecture

### Modular Design (Separation of Concerns)

The system follows clean architecture principles:

```
DamageCalculator (utils/)
├── Handles all calculation logic
├── Pure functions, no side effects
└── Returns detailed breakdown for UI

HandEvaluator (utils/)
├── Determines poker hand type
├── Calls DamageCalculator for values
└── Applies relic effects (Babaylan's Talisman)

Combat Scene (game/scenes/)
├── Orchestrates combat flow
├── Applies relic bonuses (Sigbin Heart, etc.)
└── Displays results using calculation breakdown
```

### Key Classes

**DamageCalculator** (`src/utils/DamageCalculator.ts`)
- `calculate()`: Main calculation method
- `calculateBaseValue()`: Sum card values
- `getCardValue()`: Get individual card value
- `getHandBonusData()`: Get hand bonus/multiplier

**HandEvaluator** (`src/utils/HandEvaluator.ts`)
- `evaluateHand()`: Returns complete hand evaluation
- `determineHandType()`: Identifies poker hand
- `applyBabaylansTalismanEffect()`: Upgrades hand tier

**Combat** (`src/game/scenes/Combat.ts`)
- `executeAction()`: Processes player actions
- `updateDamagePreview()`: Shows calculation preview
- Applies final relic bonuses

---

## UI Display

### Damage Preview Format
```
DMG: 45 (cards) +35 ×4 = 304
     ^^          ^^  ^^    ^^^
     Base        Bonus Mult Final
```

### Calculation Breakdown (Console)
```
Cards: 41
Hand Bonus: +35
Subtotal: 76
Multiplier: ×4
Final: 304
```

---

## Testing Guidelines

### Common Enemy (140 HP)
- Should be defeated in 3-5 turns with average hands
- Pair/Two Pair: 2-3 attacks needed
- Three of a Kind: 1-2 attacks needed

### Elite Enemy (240-260 HP)
- Should take 5-8 turns
- Requires mix of offense and defense
- Status effect buildup becomes important

### Boss (480 HP)
- Should take 8-12 turns
- Multiple high-tier hands needed
- Deck optimization crucial

### Balance Checks
- ✅ High Card deals meaningful damage (15-25)
- ✅ Straights/Flushes feel powerful (200-400)
- ✅ Straight Flush is rare but game-changing (800-1200)
- ✅ Card quality matters for all hand types
- ✅ Status effects provide noticeable advantage

---

## Future Considerations

### Potential Expansions
- **Relic Interactions**: Relics that modify multipliers
- **Elemental Scaling**: Elements affect base values
- **Hand Tier Upgrades**: More relics like Babaylan's Talisman
- **Negative Multipliers**: Boss abilities that reduce multipliers

### Monitoring Points
- Average turns to kill per enemy type
- Win rate per chapter
- Player feedback on damage scaling
- Relic power level relative to new system

---

## Technical Notes

### Type Definitions
```typescript
interface DamageCalculation {
  baseValue: number;
  handBonus: number;
  handMultiplier: number;
  statusBonus: number;
  relicBonuses: { name: string; amount: number }[];
  subtotal: number;
  finalValue: number;
  breakdown: string[];
}
```

### Performance
- All calculations are O(n) where n = cards in hand (max 5)
- No performance impact from new system
- Breakdown generation is optional for debugging

---

## Credits

**Inspiration**: Balatro's chip + mult system  
**Design**: Adapted for Filipino mythology theme and poker mechanics  
**Implementation**: Modular architecture with separation of concerns

---

**Document Version**: 1.0  
**System Version**: Post-Balatro Update  
**Compatibility**: Bathala v5.8.14.25+

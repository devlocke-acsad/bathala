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
4. **Elemental Bonus**: Bonus from having multiple cards of the same element
5. **Status Bonus**: Additional value from Strength/Dexterity buffs
6. **Relic Bonuses**: Flat bonuses added before multiplication
7. **Action Modifier**: Final modifier based on Attack/Defend/Special

### Complete Formula

```
Subtotal = Base Value + Hand Bonus + Elemental Bonus + Status Bonus + Relic Bonuses
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

## Elemental Bonuses

**IMPORTANT: Elemental bonuses ONLY apply to Special attacks** for game balance. Attack and Defend actions do not receive elemental damage bonuses, though they still trigger elemental effects.

Elemental synergy rewards playing multiple cards of the same suit (element) **when using Special actions**. The bonus is based on the **count of the dominant element** in your hand:

| Element Count | Bonus | Description |
|---------------|-------|-------------|
| 0 cards | +0 | No dominant element |
| 1 card | +2 | Weak elemental presence |
| 2 cards | +5 | Moderate elemental synergy |
| 3 cards | +10 | Strong elemental focus |
| 4 cards | +18 | Very strong elemental build |
| 5 cards | +30 | Pure elemental hand (mono-element) |

### Elements (Suits)
- **Apoy** (Fire) - Red cards
- **Tubig** (Water) - Blue cards  
- **Lupa** (Earth) - Green cards
- **Hangin** (Air) - Yellow/White cards

### Elemental Effects Beyond Damage

In addition to providing damage bonuses, the **dominant element** in your hand triggers special effects:

#### Apoy (Fire)
- **Attack**: +2 extra damage, applies Burn (2 damage/turn for 2 turns)
- **Defend**: Gain 1 Strength (permanent damage buff)
- **Special**: AoE damage + Burn effect

#### Tubig (Water)
- **Attack**: Ignores 50% of enemy block
- **Defend**: Heal 2 HP
- **Special**: Heal based on damage + cleanse debuffs

#### Lupa (Earth)
- **Attack**: +1 damage per Lupa card in hand
- **Defend**: 50% of unspent block carries to next turn
- **Special**: Apply Vulnerable to enemy (take +50% damage)

#### Hangin (Air)
- **Attack**: Hit all enemies for 75% damage (AoE)
- **Defend**: Gain 1 Dexterity (permanent block buff)
- **Special**: Draw 2 cards + apply Weak to enemy

**Note**: Elemental effects are based on the dominant element (most common suit) in your played hand, separate from the elemental damage bonus calculation.

### Elemental Synergy Examples

**Example 1**: 3 Apoy cards + 2 Tubig cards (Attack action)
- Dominant element: Apoy (3 cards)
- Elemental Bonus: **+0** (doesn't apply to Attack)
- Triggers Apoy elemental effects only

**Example 2**: 5 Lupa cards (Special action)
- Dominant element: Lupa (5 cards)
- Elemental Bonus: **+30** (maximum! Only for Special)
- Triggers Lupa elemental effects

**Example 3**: Flush (5 cards, same suit) with Special action
- Dominant element: Automatic 5 cards
- Elemental Bonus: **+30** (in addition to Flush hand bonus!)
- Triggers that element's strongest effects

### Strategic Note
**Attack & Defend**: Get elemental effects (Burn, Heal, Strength, etc.) but NO damage bonuses.
**Special**: Gets BOTH elemental effects AND damage bonuses, making it the most element-focused action!

Building mono-element decks is especially rewarding for Special-focused strategies.

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

### Example 1: Basic High Card (Attack)
**Cards**: Single Datu (King)

```
Base Value: 10 (Datu)
Hand Bonus: +5 (High Card)
Elemental Bonus: +0 (doesn't apply to Attack)
Subtotal: 10 + 5 = 15
Hand Multiplier: ×1 (High Card)
Final Damage: 15 × 1 = 15 damage
```

### Example 2: Pair with High Cards (Attack)
**Cards**: Datu, Datu (pair of Kings, both same element)

```
Base Value: 10 + 10 = 20
Hand Bonus: +10 (Pair)
Elemental Bonus: +0 (doesn't apply to Attack)
Subtotal: 20 + 10 = 30
Hand Multiplier: ×2 (Pair)
Final Damage: 30 × 2 = 60 damage
```

### Example 3: Three of a Kind with Strength (Attack)
**Cards**: 7, 7, 7 (three 7s, all Apoy/Fire)  
**Status**: 2 stacks of Strength

```
Base Value: 7 + 7 + 7 = 21
Hand Bonus: +30 (Three of a Kind)
Elemental Bonus: +0 (doesn't apply to Attack)
Status Bonus: +10 (2 × Strength)
Subtotal: 21 + 30 + 10 = 61
Hand Multiplier: ×3 (Three of a Kind)
Final Damage: 61 × 3 = 183 damage
```

### Example 4: Flush with Special Action (High Power)
**Cards**: 5, 7, 9, Babaylan, Datu (all Apoy/Fire suit)  
**Action**: SPECIAL

```
Base Value: 5 + 7 + 9 + 10 + 10 = 41
Hand Bonus: +35 (Flush)
Elemental Bonus: +30 (5 cards same element - ONLY for Special!)
Subtotal: 41 + 35 + 30 = 106
Hand Multiplier: ×4 (Flush)
Pre-modifier: 106 × 4 = 424
Special Modifier: ×0.6
Final Damage: 424 × 0.6 = 254 damage (+ elemental effects!)
```
*Note: Special action gets elemental bonus AND triggers Apoy special effects!*

### Example 5: Flush with Attack Action (Comparison)
**Cards**: 5, 7, 9, Babaylan, Datu (all Apoy/Fire suit)  
**Action**: ATTACK

```
Base Value: 5 + 7 + 9 + 10 + 10 = 41
Hand Bonus: +35 (Flush)
Elemental Bonus: +0 (doesn't apply to Attack)
Subtotal: 41 + 35 = 76
Hand Multiplier: ×4 (Flush)
Final Damage: 76 × 4 = 304 damage (+ Apoy attack effects)
```
*Note: Attack is stronger for pure damage, Special gets unique effects!*

### Example 6: Straight Flush with Special (Maximum Power)
**Cards**: 6, 7, 8, 9, 10 (all Tubig/Water suit)  
**Action**: SPECIAL

```
Base Value: 6 + 7 + 8 + 9 + 10 = 40
Hand Bonus: +100 (Straight Flush)
Elemental Bonus: +30 (5 cards same element)
Subtotal: 40 + 100 + 30 = 170
Hand Multiplier: ×8 (Straight Flush)
Pre-modifier: 170 × 8 = 1,360
Special Modifier: ×0.6
Final Damage: 1,360 × 0.6 = 816 damage (+ Tubig healing!)
```
*Note: Straight Flush Special is devastating with element bonus + healing!*

### Example 7: Defend Action with Elemental Synergy
**Cards**: Pair of 8s (both Lupa/Earth)  
**Status**: 1 stack of Dexterity

```
Base Value: 8 + 8 = 16
Hand Bonus: +10 (Pair)
Elemental Bonus: +0 (doesn't apply to Defend)
Status Bonus: +5 (1 × Dexterity)
Subtotal: 16 + 10 + 5 = 31
Hand Multiplier: ×2 (Pair)
Pre-modifier: 31 × 2 = 62
Defense Modifier: ×0.8
Final Block: 62 × 0.8 = 49 block (+ Lupa effects)
```

---

## Balance Changes Summary

To accommodate the new damage system, all combat stats were scaled:

### Player Stats
- **Max Health**: 80 → **160** (×2)
- Starting health scales with progression

### Enemy Stats (Common) - v2 Balance
- **Health**: ×8 multiplier (increased from ×5)
  - Example: Tikbalang Scout 28 → **224 HP** (was 140)
  - Example: Sigbin Charger 35 → **280 HP** (was 175)
  - Example: Bungisngis 30 → **240 HP** (was 150)
- **Damage**: ×3 multiplier
  - Example: Tikbalang 7 → **21 damage**
  - Example: Sigbin 10 → **30 damage**

### Enemy Stats (Elite/Boss) - v2 Balance
- **Health**: ×6 multiplier (increased from ×4)
  - Example: Kapre Shade 65 → **390 HP** (was 260)
  - Example: Tawong Lipod 60 → **360 HP** (was 240)
  - Example: Mangangaway (Boss) 120 → **720 HP** (was 480)
- **Damage**: ×3 multiplier
  - Example: Kapre 12 → **36 damage**
  - Example: Mangangaway 15 → **45 damage**

### Balance Philosophy
- Elemental bonuses restricted to Special actions only
- Attack actions provide consistent, reliable damage
- Special actions trade raw damage for elemental synergy + unique effects
- Combat should take 5-8 turns for common enemies, 10-15 for bosses

---

## Strategic Implications

### Attack vs Special Trade-off
- **Attack**: No elemental bonus, but full damage (×1.0 modifier)
- **Special**: Elemental bonus included, but reduced damage (×0.6 modifier)
- **Elemental builds**: Special actions become more valuable with mono-element decks
- **Rainbow decks**: Attack actions are more consistent

### Card Selection Matters More Than Ever
- **Before**: Pair of 2s = Pair of Datus (both dealt 2 damage)
- **After**: Pair of 2s = 38 damage vs Pair of Datus = 60 damage
- Card quality significantly impacts all hands

### Special Actions for Elemental Decks
- Pure element Special (5 cards same suit) gets +30 bonus before multiplier
- Flush Special: Extremely powerful with element synergy
- Makes Special viable as primary damage source for certain builds

### High Cards Gain Even More Value
- Aces, face cards, and 10s are premium cards
- High cards in Attack hands = reliable damage
- High cards in Special hands = massive burst with element bonus

### Hand Quality vs Quantity Trade-offs
- Three Datus (3-of-a-kind, Attack) = 120 damage
- Five low cards (straight 2-6, Attack) = 92 damage
- Same cards with Special would be weaker without element focus

### Action Type Strategies
- **Attack-Heavy**: Consistent damage, works with any deck composition
- **Defend-Heavy**: Tank strategy, block carries over with Lupa
- **Special-Heavy**: Elemental focus required, massive burst potential with synergy

### Pure Element vs Rainbow Builds
- **Mono-Fire (Apoy)**: Special-focused offense with Burn synergy
- **Mono-Water (Tubig)**: Special healing + defense hybrid  
- **Mono-Earth (Lupa)**: Attack/Defend focus with block persistence
- **Mono-Air (Hangin)**: Special for card draw + Weak application
- **Rainbow**: Flexible Attack-focused, less reliant on Special

### Status Effects Remain Strong
- Strength/Dexterity bonuses multiply with hand multipliers
- Building stacks is still very rewarding
- Not affected by elemental restrictions

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

### Common Enemy (224 HP average)
- Should be defeated in 5-8 turns with average hands
- Pair/Two Pair (Attack): 4-6 attacks needed
- Three of a Kind (Attack): 2-3 attacks needed
- Special actions viable with element focus

### Elite Enemy (360-390 HP)
- Should take 8-12 turns
- Requires mix of offense and defense
- Status effect buildup becomes important
- Special actions can speed up with element synergy

### Boss (720 HP)
- Should take 12-18 turns
- Multiple high-tier hands needed
- Deck optimization crucial
- Special strategies with pure elements can reduce time

### Balance Checks
- ✅ High Card deals meaningful damage (15-20)
- ✅ Attack actions provide consistent damage (60-200)
- ✅ Special actions with elements feel powerful (150-500+)
- ✅ Straight Flush Special is game-changing (800+)
- ✅ Card quality matters for all hand types
- ✅ Elemental synergy exclusive to Special creates strategic choice
- ✅ Pure element builds are viable but require Special focus
- ✅ Rainbow/Attack builds are consistent and reliable
- ✅ Status effects provide noticeable advantage

---

## Future Considerations

### Potential Expansions
- **Relic Interactions**: Relics that modify elemental bonuses or multipliers
- **Elemental Scaling**: Elements affect base values differently
- **Dual-Element Cards**: Special cards that count for two elements
- **Hand Tier Upgrades**: More relics like Babaylan's Talisman
- **Negative Multipliers**: Boss abilities that reduce multipliers
- **Element-Specific Bonuses**: Different elements grant different bonus types

### Monitoring Points
- Average turns to kill per enemy type
- Win rate per chapter
- Player feedback on damage scaling and elemental system
- Relic power level relative to new system
- Viability of mono-element vs rainbow strategies

---

## Technical Notes

### Type Definitions
```typescript
interface DamageCalculation {
  baseValue: number;
  handBonus: number;
  handMultiplier: number;
  elementalBonus: number;
  statusBonus: number;
  relicBonuses: { name: string; amount: number }[];
  subtotal: number;
  finalValue: number;
  breakdown: string[];
}
```

### Elemental Bonus Calculation
```typescript
// Count cards per suit
const suitCounts = { Apoy: 0, Tubig: 0, Lupa: 0, Hangin: 0 };
cards.forEach(card => suitCounts[card.suit]++);

// Get dominant suit count
const maxCount = Math.max(...Object.values(suitCounts));

// Apply bonus based on count
const ELEMENTAL_BONUSES = {
  0: 0, 1: 2, 2: 5, 3: 10, 4: 18, 5: 30
};
const elementalBonus = ELEMENTAL_BONUSES[maxCount];
```

### Performance
- All calculations are O(n) where n = cards in hand (max 5)
- Elemental bonus calculation adds minimal overhead
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

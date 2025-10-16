# Combat Damage Calculation System

**Version**: 2.0  
**Last Updated**: January 2025  
**System**: Balatro-Inspired Damage Calculation (Rebalanced)

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
| 1 (Ace) | 6 | High single card value (reduced v2.0) |
| 2 | 2 | |
| 3 | 2 | |
| 4 | 3 | |
| 5 | 3 | |
| 6 | 4 | |
| 7 | 4 | |
| 8 | 5 | |
| 9 | 5 | |
| 10 | 6 | |
| Mandirigma (Jack) | 6 | |
| Babaylan (Queen) | 7 | |
| Datu (King) | 7 | |

**Example**: Playing 7, 7, Datu, Babaylan, Ace = 4 + 4 + 7 + 7 + 6 = **28 base value**

**v2.0 Change**: Card values reduced by ~40-45% to balance gameplay and prevent 2-3 turn enemy kills.

---

## Elemental Bonuses

**IMPORTANT: Elemental bonuses ONLY apply to Special attacks** for game balance. Attack and Defend actions do NOT receive elemental damage bonuses or elemental effects.

Elemental synergy rewards playing multiple cards of the same suit (element) **when using Special actions**. The bonus is based on the **count of the dominant element** in your hand:

| Element Count | Bonus | Description |
|---------------|-------|-------------|
| 0 cards | +0 | No dominant element |
| 1 card | +1 | Weak elemental presence (reduced v2.0) |
| 2 cards | +3 | Moderate elemental synergy (reduced v2.0) |
| 3 cards | +6 | Strong elemental focus (reduced v2.0) |
| 4 cards | +10 | Very strong elemental build (reduced v2.0) |
| 5 cards | +15 | Pure elemental hand / mono-element (reduced v2.0) |

**v2.0 Change**: Elemental bonuses reduced by ~50% and now ONLY apply to Special actions.

### Elements (Suits)
- **Apoy** (Fire) - Red cards
- **Tubig** (Water) - Blue cards  
- **Lupa** (Earth) - Green cards
- **Hangin** (Air) - Yellow/White cards

### Elemental Effects Beyond Damage

**v2.0 CRITICAL CHANGE**: Elemental effects now ONLY trigger when using **Special actions**. Attack and Defend actions no longer gain any elemental bonuses, effects, or status applications.

In addition to providing damage bonuses, the **dominant element** in your hand triggers special effects **ONLY when using Special actions**:

#### Apoy (Fire) - Special Action Only
- **Special**: AoE damage (50% of calculated value) + Burn effect (2 damage/turn for 2 turns)

#### Tubig (Water) - Special Action Only
- **Special**: Heal player for 50% of calculated value + cleanse debuffs (planned)

#### Lupa (Earth) - Special Action Only
- **Special**: Apply Vulnerable to enemy (take +50% damage for 2 turns)

#### Hangin (Air) - Special Action Only
- **Special**: Draw 2 cards + apply Weak to enemy (deal -50% damage for 2 turns)

**Note**: The dominant element (most common suit) in your played hand determines which effect triggers, but ONLY during Special actions. Attack and Defend actions are now pure damage/block respectively.

### Elemental Synergy Examples

**Example 1**: 3 Apoy cards + 2 Tubig cards (Attack action)
- Dominant element: Apoy (3 cards)
- Elemental Bonus: **+0** (doesn't apply to Attack)
- Elemental Effects: **NONE** (only Special triggers effects in v2.0)

**Example 2**: 5 Lupa cards (Special action)
- Dominant element: Lupa (5 cards)
- Elemental Bonus: **+15** (maximum! Only for Special, reduced from +30)
- Triggers Lupa elemental effects (Vulnerable debuff)

**Example 3**: Flush (5 cards, same suit) with Special action
- Dominant element: Automatic 5 cards
- Elemental Bonus: **+15** (in addition to Flush hand bonus!)
- Triggers that element's strongest effects

### Strategic Note
**v2.0 Balance Philosophy**:
- **Attack**: Pure damage, no elemental bonuses or effects. Consistent and reliable.
- **Defend**: Pure block, no elemental bonuses or effects. Straightforward defense.
- **Special**: Gets BOTH elemental damage bonuses AND unique elemental effects. Makes Special the ONLY element-focused action!

Building mono-element decks is ONLY rewarding for Special-focused strategies. Attack/Defend builds benefit from raw card values and hand types, not elements.

---

## Hand Type Bonuses & Multipliers

**v2.0 Changes**: Multipliers reduced to prevent excessive damage. Bonuses slightly adjusted for better scaling.

| Hand Type | Hand Bonus | Multiplier | Notes |
|-----------|-----------|------------|-------|
| High Card | +0 | ×1 | Minimum viable hand |
| Pair | +3 | ×1.2 | Two matching ranks (reduced mult) |
| Two Pair | +6 | ×1.3 | Two different pairs (reduced mult) |
| Three of a Kind | +10 | ×1.5 | Three matching ranks (reduced mult) |
| Straight | +12 | ×1.6 | Five consecutive ranks (reduced mult) |
| Flush | +15 | ×1.7 | Five same-suit cards (reduced mult) |
| Full House | +20 | ×2.0 | Three of a kind + pair (reduced mult) |
| Four of a Kind | +25 | ×2.2 | Four matching ranks (reduced mult) |
| Straight Flush | +35 | ×2.5 | Straight + Flush (reduced mult) |
| Royal Flush | +40 | ×2.8 | A-K-Q-J-10 suited (reduced mult) |
| Five of a Kind* | +38 | ×2.6 | Requires Echo of Ancestors relic (reduced mult) |

*Five of a Kind is only possible with the "Echo of the Ancestors" relic

**v2.0 Philosophy**: Maximum multiplier reduced from ×12 to ×2.8 to create longer, more strategic combats.

---

## Status Effect Bonuses

Status effects add to the base value **before** multiplication:

### Attack Actions
- **Strength**: +3 base value per stack (reduced from +5 in v2.0)
  - Example: 2 stacks of Strength = +6 base value

### Defend Actions
- **Dexterity**: +3 base value per stack (reduced from +5 in v2.0)
  - Example: 3 stacks of Dexterity = +9 base value

### Debuffs
- **Weak**: Reduces final damage by 50% (applied after calculation)
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

## Calculation Examples (v2.0)

### Example 1: Basic High Card (Attack)
**Cards**: Single Datu (King)

```
Base Value: 7 (Datu)
Hand Bonus: +0 (High Card)
Elemental Bonus: +0 (doesn't apply to Attack)
Subtotal: 7 + 0 = 7
Hand Multiplier: ×1 (High Card)
Final Damage: 7 × 1 = 7 damage
```

### Example 2: Pair with High Cards (Attack)
**Cards**: Datu, Datu (pair of Kings)

```
Base Value: 7 + 7 = 14
Hand Bonus: +3 (Pair)
Elemental Bonus: +0 (doesn't apply to Attack, v2.0)
Elemental Effects: NONE (v2.0: only Special triggers)
Subtotal: 14 + 3 = 17
Hand Multiplier: ×1.2 (Pair)
Final Damage: 17 × 1.2 = 20 damage
```

### Example 3: Three of a Kind with Strength (Attack)
**Cards**: 7, 7, 7 (three 7s)  
**Status**: 2 stacks of Strength

```
Base Value: 4 + 4 + 4 = 12
Hand Bonus: +10 (Three of a Kind)
Elemental Bonus: +0 (doesn't apply to Attack)
Status Bonus: +6 (2 × 3 Strength, v2.0)
Subtotal: 12 + 10 + 6 = 28
Hand Multiplier: ×1.5 (Three of a Kind)
Final Damage: 28 × 1.5 = 42 damage
```

### Example 4: Flush with Special Action (High Power)
**Cards**: 5, 7, 9, Babaylan, Datu (all Apoy/Fire suit)  
**Action**: SPECIAL

```
Base Value: 3 + 4 + 5 + 7 + 7 = 26
Hand Bonus: +15 (Flush, v2.0)
Elemental Bonus: +15 (5 cards same element - ONLY for Special! v2.0)
Subtotal: 26 + 15 + 15 = 56
Hand Multiplier: ×1.7 (Flush, v2.0)
Pre-modifier: 56 × 1.7 = 95
Special Modifier: ×0.6
Final Damage: 95 × 0.6 = 57 damage (+ Apoy special effects!)
```
*Note: Special action gets elemental bonus AND triggers Apoy effects (Burn)!*

### Example 5: Flush with Attack Action (Comparison)
**Cards**: 5, 7, 9, Babaylan, Datu (all Apoy/Fire suit)  
**Action**: ATTACK

```
Base Value: 3 + 4 + 5 + 7 + 7 = 26
Hand Bonus: +15 (Flush, v2.0)
Elemental Bonus: +0 (doesn't apply to Attack, v2.0)
Elemental Effects: NONE (v2.0: only Special triggers)
Subtotal: 26 + 15 = 41
Hand Multiplier: ×1.7 (Flush, v2.0)
Final Damage: 41 × 1.7 = 70 damage (NO elemental effects, v2.0)
```
*Note: In v2.0, Attack is better for pure damage, Special gets unique effects + bonuses!*

### Example 6: Straight Flush with Special (Maximum Power, v2.0)
**Cards**: 6, 7, 8, 9, 10 (all Tubig/Water suit)  
**Action**: SPECIAL

```
Base Value: 4 + 4 + 5 + 5 + 6 = 24
Hand Bonus: +35 (Straight Flush, v2.0)
Elemental Bonus: +15 (5 cards same element, v2.0)
Subtotal: 24 + 35 + 15 = 74
Hand Multiplier: ×2.5 (Straight Flush, v2.0)
Pre-modifier: 74 × 2.5 = 185
Special Modifier: ×0.6
Final Damage: 185 × 0.6 = 111 damage (+ Tubig healing!)
```
*Note: Straight Flush Special is the best combination with element bonus + healing!*

### Example 7: Defend Action (v2.0)
**Cards**: Pair of 8s  
**Status**: 1 stack of Dexterity

```
Base Value: 5 + 5 = 10
Hand Bonus: +3 (Pair, v2.0)
Elemental Bonus: +0 (doesn't apply to Defend, v2.0)
Elemental Effects: NONE (v2.0: only Special triggers)
Status Bonus: +3 (1 × 3 Dexterity, v2.0)
Subtotal: 10 + 3 + 3 = 16
Hand Multiplier: ×1.2 (Pair, v2.0)
Pre-modifier: 16 × 1.2 = 19
Defense Modifier: ×0.8
Final Block: 19 × 0.8 = 15 block (NO Lupa effects in v2.0)
```
*Note: In v2.0, Defend actions no longer trigger elemental effects.*

---

## Balance Changes Summary

### Version 2.0 - Combat Rebalance (January 2025)

**Problem Identified**: 
- Players were defeating common enemies in 2-3 turns
- Elemental effects on Attack/Defend actions provided too much free damage and buffs
- Multipliers too high (max ×12), leading to one-shot potential

**Solutions Implemented**:

#### 1. Card Values Reduced (~40-45%)
- Ace: 11 → 6
- Face cards: 10 → 6-7
- Number cards: Proportionally reduced
- **Impact**: Base damage significantly lower

#### 2. Hand Multipliers Nerfed
- Maximum multiplier: ×12 → ×2.8 (Royal Flush)
- All multipliers reduced by 50-75%
- **Impact**: Prevents excessive burst damage

#### 3. Elemental System Restricted
- **Before**: All actions had elemental effects
- **After**: Only Special actions trigger elemental effects
- Attack/Defend: Pure damage/block, no bonuses
- **Impact**: Special action becomes truly special

#### 4. Status Bonuses Reduced
- Strength/Dexterity: +5 per stack → +3 per stack
- **Impact**: Still valuable but less dominant

#### 5. Enemy Health Increased

To accommodate the new damage system, all combat stats were scaled:

### Player Stats
- **Max Health**: 80 → **120 HP** (+50%)
- More survivability for longer combats

### Enemy Stats (Common) - v2.0 Balance (Reduced 25% from initial v2.0)
- **Health**: Final values after reduction
  - Tikbalang Scout: 224 → 350 → **260 HP**
  - Balete Wraith: 176 → 280 → **210 HP**
  - Sigbin Charger: 280 → 420 → **320 HP**
  - Duwende Trickster: 144 → 240 → **180 HP**
  - Tiyanak Ambusher: 200 → 320 → **240 HP**
  - Amomongo: 192 → 310 → **230 HP**
  - Bungisngis: 240 → 380 → **290 HP**
- **Damage**: ×3 multiplier (unchanged)
  - Example: Tikbalang 7 → **21 damage**

### Enemy Stats (Elite) - v2.0 Balance (Reduced 25% from initial v2.0)
- **Health**: Final values after reduction
  - Kapre Shade: 390 → 600 → **450 HP**
  - Tawong Lipod: 360 → 560 → **420 HP**
- **Damage**: ×3 multiplier (unchanged)
  - Example: Kapre 12 → **36 damage**

### Enemy Stats (Boss) - v2.0 Balance (Reduced 25% from initial v2.0)
- **Health**: Final values after reduction
  - Mangangaway: 720 → 1200 → **900 HP**
- **Damage**: ×3 multiplier (unchanged)
  - Example: Mangangaway 15 → **45 damage**

### Balance Philosophy v2.0
- Elemental bonuses and effects ONLY on Special actions
- Attack actions: Consistent, reliable damage
- Defend actions: Straightforward blocking
- Special actions: High-risk, high-reward with elemental synergy
- Combat duration: Common 4-6 turns, Elite 7-10 turns, Boss 15-20 turns
- Strategy and deck building become critical
- Hand quality matters more than ever

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

### Common Enemy (180-320 HP average, v2.0)
- Should be defeated in 4-5 turns with average hands
- Pair/Two Pair (Attack): 5-7 attacks needed
- Three of a Kind (Attack): 3-4 attacks needed
- Special action viable with element focus (once per combat)

### Elite Enemy (420-450 HP, v2.0)
- Should take 6-8 turns
- Requires mix of offense and defense
- Status effect buildup becomes important
- Special action can provide crucial advantage

### Boss (900 HP, v2.0)
- Should take 12-16 turns
- Multiple high-tier hands needed
- Deck optimization crucial
- Strategic Special use can turn the tide

### Balance Checks (v2.0)
- ✅ High Card deals meaningful damage (8-12)
- ✅ Attack actions provide consistent damage (20-80)
- ✅ Special actions with elements feel powerful (40-120 + effects)
- ✅ Straight Flush Special is game-changing (150-250)
- ✅ Card quality matters for all hand types
- ✅ Elemental synergy exclusive to Special creates clear strategic choice
- ✅ Pure element builds are viable but require Special-focused play
- ✅ Rainbow/Attack builds are consistent and don't depend on elements
- ✅ Status effects provide noticeable but not overwhelming advantage
- ✅ Combat duration feels strategic, not grindy
- ✅ No more 2-3 turn kills on common enemies

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

**Document Version**: 2.0  
**System Version**: Post-Balatro Update + v2.0 Combat Rebalance  
**Compatibility**: Bathala v5.8.14.25+

---

## Version History

### v2.0 (January 2025) - Combat Rebalance
- **Card values reduced by ~40-45%** to prevent 2-3 turn enemy kills
- **Hand multipliers reduced** from max ×12 to max ×2.8
- **Elemental effects restricted to Special actions only**
- **Status bonuses reduced** from +5 to +3 per stack
- **Enemy health increased** by 50-75%, then reduced by 25% (net: ~12-30% increase)
- **Player health increased** from 80 to 120 HP
- **Combat duration targets**: Common 4-5 turns, Elite 6-8 turns, Boss 12-16 turns

### v1.0 (January 2025) - Balatro-Inspired System
- Introduced base card values with damage calculation
- Added hand bonuses and multipliers
- Implemented elemental bonus system
- Scaled enemy and player stats ×8 and ×2 respectively

# Enemy Attack Pattern Simplification Proposal

## Problem:
Current enemy attack patterns use many unimplemented actions that would require significant development time and add complexity that may not enhance gameplay.

## Recommendation: **Simplify to Core Actions**

### Core Actions (Already Implemented):
- `attack` - Deal damage
- `defend` - Gain block
- `strengthen` - Gain Strength (+damage)
- `poison` - Apply Poison to player
- `weaken` - Apply Weak to player
- `charge` - Prepare (gain block)
- `stun` - Apply Frail to player

### Simplified Enemy Patterns:

#### Common Enemies:
1. **Tikbalang Scout** (Confusing, evasive)
   - Current: `["attack", "confuse", "attack"]`
   - **Simplified: `["attack", "weaken", "attack"]`**
   - Theme: Confuses = weakens your attacks

2. **Balete Wraith** (Strengthening tree spirit)
   - Current: `["attack", "strengthen", "attack"]`
   - **Keep as is** ✅ - Already simple and works

3. **Sigbin Charger** (Charges up for big attack)
   - Current: `["charge", "attack", "wait"]`
   - **Simplified: `["defend", "attack", "defend"]`**
   - Theme: Defensive then aggressive

4. **Duwende Trickster** (Tricky, disruptive)
   - Current: `["steal_block", "disrupt_draw", "attack"]`
   - **Simplified: `["weaken", "attack", "weaken"]`**
   - Theme: Disrupts = weakens you repeatedly

5. **Tiyanak Ambusher** (Scary, intimidating)
   - Current: `["fear", "critical_attack", "attack"]`
   - **Simplified: `["weaken", "attack", "attack"]`**
   - Theme: Fear = weaken, then double attack

6. **Amomongo** (Fast, aggressive ape)
   - Current: `["bleed_attack", "fast_attack", "attack"]`
   - **Simplified: `["attack", "attack", "defend"]`**
   - Theme: Fast = attacks twice, then defends

7. **Bungisngis** (Laughing giant, debuffs)
   - Current: `["laugh_debuff", "high_swing", "attack"]`
   - **Simplified: `["weaken", "attack", "strengthen"]`**
   - Theme: Weakens you, attacks, then gets stronger

#### Elite Enemies:
8. **Kapre Shade** (Fire/smoke spirit)
   - Current: `["burn_aoe", "summon_minion", "attack"]`
   - **Simplified: `["poison", "strengthen", "attack"]`**
   - Theme: Burns (poison) you, gets stronger, attacks

9. **Tawong Lipod** (Invisible wind spirit)
   - Current: `["stun", "air_attack", "attack"]`
   - **Simplified: `["stun", "attack", "defend"]`**
   - Theme: Stuns (frail), attacks, then evades (defend)

#### Boss:
10. **Mangangaway** (Witch/sorcerer)
    - Current: `["mimic_element", "curse_cards", "hex_of_reversal", "attack"]`
    - **Simplified: `["weaken", "poison", "strengthen", "attack"]`**
    - Theme: Uses all debuffs/buffs, then attacks

## Benefits of Simplification:

### ✅ Immediate Benefits:
1. **All patterns work NOW** - No unimplemented actions
2. **Easy to test** - Use debug screen (F3) to verify
3. **Clear mechanics** - Players understand what enemies do
4. **Balanced** - Can tune damage/health without complex interactions

### ✅ Gameplay Benefits:
1. **Strategic variety** - Each enemy still feels different
2. **Thematic consistency** - Actions match enemy lore
3. **Progressive difficulty** - Common → Elite → Boss complexity
4. **Status effect showcase** - Players see all status effects in action

### ✅ Development Benefits:
1. **No new systems needed** - Everything already implemented
2. **Easy to balance** - Adjust numbers, not mechanics
3. **Maintainable** - Simple patterns = fewer bugs
4. **Extensible** - Can add complexity later if needed

## Implementation:

Just update the `attackPattern` arrays in `Act1Enemies.ts`:

```typescript
// Example:
export const TIKBALANG_SCOUT: Omit<Enemy, "id"> = {
  // ... other properties ...
  attackPattern: ["attack", "weaken", "attack"], // Changed from confuse
  // ... rest ...
};
```

## Future Expansion (Optional):

If you want more complexity later, you can add:
- **Phase 2**: Special actions (bleed, burn as separate effects)
- **Phase 3**: Minion summoning
- **Phase 4**: Card manipulation (curse, transform)

But start simple and add complexity only if gameplay needs it!

## Recommendation:

**Simplify now, expand later if needed.**

The current status effect system (Poison, Weak, Frail, Vulnerable, Strength) provides enough variety for interesting combat without overwhelming complexity.

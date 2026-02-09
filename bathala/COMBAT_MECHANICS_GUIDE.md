# Bathala Combat Mechanics Guide

A comprehensive visual guide to status effects, elemental affinities, and combat strategies in Bathala.

## Table of Contents

1. [Status Effects](#status-effects)
2. [Elemental System](#elemental-system)
3. [Combat Flow](#combat-flow)
4. [Strategic Tips](#strategic-tips)

---

## Status Effects

Status effects are stackable buffs and debuffs that modify combat behavior. Most effects reduce by 1 stack at the end of each turn.

### Buffs (Positive Effects)

#### 💪 Strength
- **Effect**: Attack actions deal +3 damage per stack
- **Duration**: Permanent (doesn't reduce)
- **Stackable**: Yes (no limit)
- **How to Get**: 
  - Enemy "strengthen" actions
  - Ritual status effect (grants +1 Strength at end of turn)
  - Certain relics
- **Strategy**: Build Strength early for sustained damage throughout combat

#### 🛡️ Plated Armor
- **Effect**: Gain block at start of turn (3 block per stack), then reduces by 1 stack
- **Duration**: Temporary (reduces each turn)
- **Stackable**: Yes (no limit)
- **How to Get**:
  - Earth (Lupa) Special actions
  - Certain relics
- **Strategy**: Great for surviving multi-turn enemy attacks

#### 💚 Regeneration
- **Effect**: Heal HP at start of turn (2 HP per stack), then reduces by 1 stack
- **Duration**: Temporary (reduces each turn)
- **Stackable**: Yes (no limit)
- **How to Get**:
  - Certain relics
  - Future enemy abilities
- **Strategy**: Provides sustained healing over multiple turns

#### ✨ Ritual
- **Effect**: Gain +1 Strength at end of turn per stack
- **Duration**: Permanent (doesn't reduce)
- **Stackable**: Yes (no limit)
- **How to Get**:
  - Certain relics
  - Future enemy abilities
- **Strategy**: Exponentially scales your damage over long fights

### Debuffs (Negative Effects)

#### 🔥 Burn / ☠️ Poison

**Note**: Burn and Poison function identically (deal damage at start of turn, reduce by 1 stack), but have different names based on who inflicts them:
- **Burn (🔥)**: Applied BY PLAYER to ENEMIES via Fire (Apoy) Special actions
- **Poison (☠️)**: Applied BY ENEMIES to PLAYER via enemy poison actions

- **Effect**: Takes damage at start of turn (2 damage per stack), then reduces by 1 stack
- **Duration**: Temporary (reduces each turn)
- **Stackable**: Yes (no limit)
- **How to Get**:
  - **Burn**: Fire (Apoy) Special actions (player inflicts on enemies)
  - **Poison**: Enemy "poison" actions (enemies inflict on player)
- **Strategy**: Excellent for dealing damage over time without using actions

#### ⚠️ Weak
- **Effect**: Attack actions deal 25% less damage per stack
- **Duration**: Temporary (reduces each turn)
- **Stackable**: Yes (max 3 stacks = 75% reduction)
- **How to Get**:
  - Air (Hangin) Special actions (applies to enemies)
  - Enemy "weaken" actions (applies to player)
- **Strategy**: Reduces enemy damage output significantly

#### 🛡️💔 Vulnerable
- **Effect**: Takes 50% more damage from all sources
- **Duration**: Temporary (reduces each turn)
- **Stackable**: No (binary: either vulnerable or not)
- **How to Get**:
  - Certain relics
  - Future enemy abilities
- **Strategy**: Amplifies all damage dealt to the target

#### 🔻 Frail
- **Effect**: Defend actions grant 25% less block per stack
- **Duration**: Temporary (reduces each turn)
- **Stackable**: Yes (max 3 stacks = 75% reduction)
- **How to Get**:
  - Certain relics
  - Future enemy abilities
- **Strategy**: Makes defending less effective

---

## Elemental System

Each enemy has predefined elemental weaknesses and resistances. The dominant element in your hand determines which multiplier applies.

### The Four Elements

#### 🔥 Apoy (Fire)
- **Special Action Effect**: Apply 3 stacks of Burn to enemy
- **Thematic Enemies**: Fire creatures, volcanic beings
- **Typical Weakness**: Water (Tubig)
- **Typical Resistance**: Earth (Lupa)

#### 💧 Tubig (Water)
- **Special Action Effect**: Heal 8 HP
- **Thematic Enemies**: Water creatures, river spirits
- **Typical Weakness**: Earth (Lupa)
- **Typical Resistance**: Fire (Apoy)

#### 🌿 Lupa (Earth)
- **Special Action Effect**: Grant 3 stacks of Plated Armor
- **Thematic Enemies**: Earth creatures, stone golems
- **Typical Weakness**: Air (Hangin)
- **Typical Resistance**: Water (Tubig)

#### 💨 Hangin (Air)
- **Special Action Effect**: Apply 2 stacks of Weak to enemy
- **Thematic Enemies**: Air creatures, wind spirits
- **Typical Weakness**: Fire (Apoy)
- **Typical Resistance**: Air (Hangin)

### Elemental Multipliers

When you attack an enemy, the game checks the dominant element in your hand:

- **Weakness (1.5×)**: Enemy takes 50% more damage
- **Neutral (1.0×)**: Normal damage
- **Resistance (0.75×)**: Enemy takes 25% less damage

**Example:**
- You play 3 Fire cards and 2 Water cards
- Fire is the dominant element
- If the enemy is weak to Fire: your damage is multiplied by 1.5×
- If the enemy resists Fire: your damage is multiplied by 0.75×

### Dominant Element Calculation

The dominant element is determined by counting cards of each suit in your hand:

1. Count cards per element (Fire, Water, Earth, Air)
2. The element with the most cards is dominant
3. If there's a tie, no elemental multiplier applies (1.0×)
4. If all cards are different elements, no multiplier applies

**Tips:**
- Pure element hands (all 5 cards same suit) guarantee elemental multiplier
- Mixed hands may not trigger elemental effects
- Check enemy weaknesses before deciding which cards to play

---

## Combat Flow

Understanding the order of operations helps you plan your strategy.

### Turn Structure

#### Player Turn
1. **Start of Turn**
   - Process player's start-of-turn status effects (Poison, Regeneration, Plated Armor)
   - Effects trigger in order: buffs first, then debuffs
   
2. **Player Action Phase**
   - Select cards from hand
   - Choose action type (Attack, Defend, or Special)
   - Damage/block is calculated
   - Elemental multipliers apply (if applicable)
   - Status effects from Special actions apply
   
3. **End of Turn**
   - Process player's end-of-turn status effects (Ritual)
   - Reduce temporary status effect stacks by 1
   - Remove effects that reach 0 stacks
   - Enemy takes their turn

#### Enemy Turn
1. **Start of Turn**
   - Process enemy's start-of-turn status effects
   
2. **Enemy Action Phase**
   - Enemy executes their intended action
   - May apply status effects to player
   
3. **End of Turn**
   - Process enemy's end-of-turn status effects
   - Reduce temporary status effect stacks by 1
   - Remove effects that reach 0 stacks
   - Player's turn begins

### Damage Calculation Order

Understanding this order helps you maximize damage:

1. **Base Damage**: Sum of all card values
2. **Hand Bonus**: Bonus from poker hand type (e.g., +20 for Full House)
3. **Elemental Bonus**: Bonus from pure element hands (Special actions only)
4. **Status Bonus**: Strength adds +3 per stack (Attack actions only)
5. **Relic Bonuses**: Additional bonuses from equipped relics
6. **Subtotal**: Sum of all bonuses
7. **Hand Multiplier**: Multiply by poker hand multiplier (e.g., ×2.0 for Full House)
8. **Action Modifier**: ×0.8 for Defend, ×0.6 for Special
9. **Weak Debuff**: Reduces Attack damage by 25% per stack (if player has Weak)
10. **Elemental Multiplier**: ×1.5 for weakness, ×0.75 for resistance
11. **Vulnerable**: Target takes 50% more damage (if target has Vulnerable)

**Key Insight**: Elemental multipliers apply AFTER all other calculations, making them very powerful for exploiting weaknesses.

---

## Strategic Tips

### Status Effect Strategies

#### Offensive Strategies
1. **Burn Stacking**: Use Fire Special actions to apply Burn to enemies, then defend while it ticks
2. **Strength Scaling**: Build Strength early with Ritual for exponential damage growth
3. **Weakness Exploitation**: Apply Weak to enemies before they attack to reduce incoming damage
4. **Vulnerable Burst**: Apply Vulnerable then unleash your strongest attack for massive damage

#### Defensive Strategies
1. **Plated Armor Layering**: Stack Plated Armor before big enemy attacks
2. **Regeneration Sustain**: Use Regeneration to heal through chip damage
3. **Weak Application**: Apply Weak to enemies to reduce their attack damage by up to 75%

### Elemental Strategies

#### Scouting Phase
1. **Check Enemy Affinities**: Look for weakness/resistance icons above enemy health bar
2. **Plan Your Hand**: Decide which element to focus on based on enemy weakness
3. **Avoid Resistances**: Don't use elements the enemy resists unless necessary

#### Hand Building
1. **Pure Element Hands**: Try to build hands with all cards of the same suit
2. **Weakness Exploitation**: Prioritize cards of the enemy's weak element
3. **Special Action Timing**: Use Special actions when you have a pure element hand

#### Advanced Tactics
1. **Elemental Switching**: Change elements between enemies in multi-enemy fights
2. **Resistance Mitigation**: Use neutral hands against resistant enemies
3. **Weakness Chains**: Exploit weaknesses to end fights quickly before enemies scale

### Synergy Examples

#### Fire + Burn Build
- Use Fire Special actions to stack Burn on enemies
- Defend while Burn deals damage over time
- Finish with strong Attack when enemy is low

#### Earth + Plated Armor Build
- Use Earth Special actions to stack Plated Armor
- Tank enemy attacks with high block
- Counter-attack when safe

#### Air + Weak Build
- Use Air Special actions to apply Weak
- Reduce enemy damage output significantly
- Take fewer hits while dealing consistent damage

#### Strength Scaling Build
- Get Ritual status effect from relics
- Build Strength over multiple turns
- Unleash devastating attacks in late game

---

## Enemy Affinity Reference

### Common Enemies (Act 1)

| Enemy | Weakness | Resistance | Strategy |
|-------|----------|------------|----------|
| Tikbalang Scout | 🔥 Fire | 💧 Water | Use Fire attacks, avoid Water |
| Balete Wraith | 💨 Air | 🌿 Earth | Use Air attacks, avoid Earth |
| Sigbin Stalker | 💧 Water | 🔥 Fire | Use Water attacks, avoid Fire |
| Tiyanak Imp | 🌿 Earth | 💨 Air | Use Earth attacks, avoid Air |
| Kapre Brute | 💧 Water | 🔥 Fire | Use Water attacks, avoid Fire |
| Duwende Trickster | 🔥 Fire | 💧 Water | Use Fire attacks, avoid Water |
| Manananggal | 💨 Air | 🌿 Earth | Use Air attacks, avoid Earth |

### Elite Enemies (Act 1)

| Enemy | Weakness | Resistance | Strategy |
|-------|----------|------------|----------|
| Tikbalang Warrior | 🔥 Fire | 💧 Water | High HP, exploit Fire weakness |
| Stone Golem | 💨 Air | 🔥 Fire | Very tanky, use Air attacks |

### Boss (Act 1)

| Enemy | Weakness | Resistance | Strategy |
|-------|----------|------------|----------|
| Mangangaway | 💧 Water | 🌿 Earth | Multi-phase fight, use Water |

---

## Quick Reference

### Status Effect Cheat Sheet

| Icon | Name | Type | Effect | Duration |
|------|------|------|--------|----------|
| 💪 | Strength | Buff | +3 damage per stack | Permanent |
| 🛡️ | Plated Armor | Buff | +3 block per stack at turn start | Temporary |
| 💚 | Regeneration | Buff | +2 HP per stack at turn start | Temporary |
| ✨ | Ritual | Buff | +1 Strength at turn end | Permanent |
| 🔥 | Burn | Debuff | 2 damage per stack at turn start (player → enemy) | Temporary |
| ☠️ | Poison | Debuff | 2 damage per stack at turn start (enemy → player) | Temporary |
| ⚠️ | Weak | Debuff | -25% attack damage per stack | Temporary |
| 🛡️💔 | Vulnerable | Debuff | +50% damage taken | Temporary |
| 🔻 | Frail | Debuff | -25% block per stack | Temporary |

### Elemental Cheat Sheet

| Element | Icon | Special Effect | Typical Weakness | Typical Resistance |
|---------|------|----------------|------------------|-------------------|
| Fire | 🔥 | 3 Burn (to enemies) | Water | Earth |
| Water | 💧 | 8 HP heal | Earth | Fire |
| Earth | 🌿 | 3 Plated Armor | Air | Water |
| Air | 💨 | 2 Weak | Fire | Air |

### Multiplier Quick Reference

- **Weakness**: 1.5× damage (50% more)
- **Neutral**: 1.0× damage (normal)
- **Resistance**: 0.75× damage (25% less)
- **Vulnerable**: 1.5× damage taken (50% more)
- **Weak**: 0.75× damage dealt per stack (25% less per stack, max 3)
- **Frail**: 0.75× block gained per stack (25% less per stack, max 3)

---

## Conclusion

Mastering Bathala's combat system requires understanding the interplay between poker hands, status effects, and elemental affinities. Experiment with different strategies, exploit enemy weaknesses, and build synergies between status effects to overcome increasingly difficult challenges.

Remember: The key to success is not just forming strong poker hands, but also managing status effects and exploiting elemental weaknesses at the right time!

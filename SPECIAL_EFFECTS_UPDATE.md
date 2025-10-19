# Special Action Elemental Effects

## Overview
Special actions in Bathala are powerful abilities tied to the dominant element (suit) in your played hand. Each element provides a unique strategic advantage.

---

## 🔥 Apoy (Fire) - Burn

**Primary Effect:** Apply Burn status to enemy

**Mechanics:**
- **Damage:** 10 damage per turn
- **Duration:** 3 turns
- **Total Damage:** 30 damage over time
- **Status Description:** "Takes 10 damage at the start of each turn"
- **Status Icon:** 🔥

**Strategic Use:**
- Best for sustained damage output
- Effective against high-HP enemies
- Damage bypasses block when applied
- Stacks with other damage sources

**Relic Synergy:**
- **Bungisngis Grin:** +5 bonus damage when applying debuffs

---

## 💧 Tubig (Water) - Heal

**Primary Effect:** Heal player and cleanse debuffs

**Mechanics:**
- **Healing:** 30 HP instantly
- **Bonus Effect:** Removes ALL debuffs from player
- **Caps at:** Max HP (no overheal)
- **Feedback Message:** "Healed X HP and cleansed debuffs!"

**Strategic Use:**
- Emergency healing when low on health
- Cleanse dangerous debuffs (Burn, Weak, Vulnerable)
- Best used reactively after taking damage
- No offensive component

**Notes:**
- Only Special action with pure defensive utility
- Cleanse effect removes Burn, Weak, Vulnerable, and any other debuffs

---

## 🪨 Lupa (Earth) - Stun

**Primary Effect:** Stun enemy for 1 turn

**Mechanics:**
- **Duration:** 1 turn (enemy skips next turn completely)
- **Status Description:** "Cannot act for 1 turn"
- **Status Icon:** 💫
- **Enemy Turn Skip:** Enemy cannot attack or defend
- **Feedback Message:** "Enemy is Stunned for 1 turn!"

**Strategic Use:**
- **VERY POWERFUL** - Denies enemy turn entirely
- Use before enemy's high-damage attack turn
- Tempo control and turn denial
- Provides free setup turn for player

**Relic Synergy:**
- **Bungisngis Grin:** +5 bonus damage when applying debuffs

**Notes:**
- Most powerful defensive Special
- Enemy intent updates but doesn't execute
- Status effects still tick during stunned turn

---

## 💨 Hangin (Wind) - Weak

**Primary Effect:** Apply Weak status + draw cards

**Mechanics:**
- **Damage Reduction:** Enemy deals 50% damage (half)
- **Duration:** 3 turns
- **Status Description:** "Deals only 50% damage for 3 turns"
- **Status Icon:** ⚠️
- **Bonus:** Draw 2+ cards
- **Feedback Message:** "Drew X cards and applied Weak!"

**Strategic Use:**
- Damage mitigation for extended fights
- Resource generation (card draw)
- Best against aggressive enemies
- Combines offense (cards) and defense (weak)

**Relic Synergies:**
- **Wind Veil:** Additional cards drawn based on Hangin cards played
- **Bungisngis Grin:** +5 bonus damage when applying debuffs

**Calculation:**
- Base: 2 cards drawn
- Wind Veil: +1 card per Hangin card in played hand (if relic owned)

---

## Comparative Analysis

| Element | Type | Immediate Effect | Duration | Strategic Role |
|---------|------|------------------|----------|----------------|
| 🔥 Apoy | Offensive | 10 dmg/turn | 3 turns | Sustained DPS |
| 💧 Tubig | Defensive | 30 HP heal + cleanse | Instant | Emergency Recovery |
| 🪨 Lupa | Control | Skip enemy turn | 1 turn | Tempo/Denial |
| 💨 Hangin | Hybrid | -50% enemy dmg + draw | 3 turns | Resource + Mitigation |

---

## Status Effect Interactions

### Burn (Fire)
- Applies at **start of enemy turn** (before their action)
- Can defeat enemy before they attack
- Not affected by block or armor
- Visible as status icon above enemy

### Stun (Earth)
- Enemy turn is **completely skipped**
- Status effects still tick (Burn still damages stunned enemy)
- Intent updates but doesn't execute
- Only lasts 1 turn (very powerful but brief)

### Weak (Wind)
- Applied to **enemy's attack damage**
- Reduces damage to 50% (multiplies by 0.5)
- Lasts 3 turns (longer than Stun)
- Does not affect status effect damage (Burn still deals full damage)

### Cleanse (Water)
- Removes **all debuff-type** status effects from player
- Examples: Burn, Weak, Vulnerable, Stun (if player could be stunned)
- Does not remove buff-type effects
- Instant effect, no lingering status

---

## Design Philosophy

### Elemental Balance
- **Fire:** Damage over time (patient strategy)
- **Water:** Healing and recovery (survival)
- **Earth:** Turn denial (control/tempo)
- **Wind:** Resource generation + mitigation (combo-focused)

### Special Action Strategy
- Only **ONE Special per combat** (use wisely!)
- Based on **dominant suit** in played hand
- Requires strong hand (straight or better recommended)
- Each element fills different strategic niche

### Relic Integration
All Special actions synergize with existing relics:
- **Bungisngis Grin** works with Fire, Earth, Wind (debuff applications)
- **Wind Veil** amplifies Wind special (card draw scaling)
- Future relics can modify Special effects further

---

## Version History

**v5.8.14.25** (Current)
- Fire: Burn damage increased to 10/turn (from 2)
- Water: Healing fixed at 30 HP (from 50% of value)
- Earth: Changed from Vulnerable to **Stun (1 turn)**
- Wind: Weak duration increased to 3 turns (from 2)
- Wind: Card draw retained as bonus effect

**Previous Version**
- Fire: Burn 2 damage/turn for 2 turns
- Water: Heal based on hand value
- Earth: Applied Vulnerable (1.5x damage taken)
- Wind: Applied Weak (0.5x damage dealt) for 2 turns

---

## Implementation Notes

### Code Changes
- `applyElementalEffects()` method updated with new values
- `executeEnemyTurn()` now checks for Stun status
- `getSpecialActionName()` updated with concise descriptions
- Visual feedback messages added for each effect

### Testing Checklist
- [x] Burn applies 10 damage per turn for 3 turns
- [x] Water heals exactly 30 HP
- [x] Water cleanses all player debuffs
- [x] Stun causes enemy to skip 1 turn
- [x] Stun shows "Turn Skipped" message
- [x] Weak reduces enemy damage by 50%
- [x] Weak lasts 3 turns
- [x] Wind still draws 2+ cards

---

## Player Feedback

**Action Result Messages:**
- Fire: "Applied Burn (10 damage/turn)!"
- Water: "Healed X HP and cleansed debuffs!"
- Earth: "Enemy is Stunned for 1 turn!"
- Wind: "Drew X cards and applied Weak!"

**Button Labels:**
- Fire: "Burn (10 dmg/turn)"
- Water: "Heal (30 HP)"
- Earth: "Stun (1 turn)"
- Wind: "Weak (half dmg, 3 turns)"

---

*Last Updated: October 20, 2025*  
*Game Version: v5.8.14.25*  
*Document: SPECIAL_EFFECTS_UPDATE.md*

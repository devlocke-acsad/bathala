# Elemental Special Actions - Corrected

## ✅ Updated Special Action Effects

The Special actions have been corrected to match your specifications:

### Fire (Apoy) 🔥
- **Effect:** Burn (3 stacks)
- **Mechanics:** Applies Poison status effect (deals 6 damage per turn)
- **Display:** Shows as "Burn" for thematic flavor
- **Use Case:** Damage over time against high-HP enemies

### Water (Tubig) 💧
- **Effect:** Frail (2 stacks)
- **Mechanics:** Reduces enemy block from Defend actions by 50%
- **Use Case:** Counter enemies that defend frequently

### Earth (Lupa) 🌿
- **Effect:** Vulnerable
- **Mechanics:** Enemy takes 50% more damage from all sources
- **Use Case:** Amplify your damage output

### Air (Hangin) 💨
- **Effect:** Weak (2 stacks)
- **Mechanics:** Reduces enemy attack damage by 50%
- **Use Case:** Defensive play against hard-hitting enemies

## Changes Made:

1. **Swapped Water and Air effects:**
   - Water now applies Frail (was Weak)
   - Air now applies Weak (was Frail)

2. **Renamed Fire effect for flavor:**
   - Still uses Poison status effect mechanically
   - Displayed as "Burn" in UI for thematic consistency

3. **Updated all related code:**
   - `getSpecialActionName()` method
   - Special action execution in `applyElementalEffects()`
   - UI notifications

## Testing:

Press **F3** in-game to open Combat Debug, then:
1. Select any enemy
2. Build a hand with 5 cards of the same element
3. Use Special action
4. Watch the status effect appear above the enemy
5. Hover over the status effect icon for details

## Status Effect Summary:

| Element | Effect | Stacks | What It Does |
|---------|--------|--------|--------------|
| 🔥 Fire | Burn | 3 | 6 damage/turn |
| 💧 Water | Frail | 2 | 50% less block |
| 🌿 Earth | Vulnerable | 1 | Takes 50% more damage |
| 💨 Air | Weak | 2 | Deals 50% less damage |

All effects are debuffs applied to the enemy!

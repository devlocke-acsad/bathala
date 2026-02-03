# Tutorial Revamp Plan v1.0

## Overview
**Goal**: Create a comprehensive, well-structured tutorial that introduces ALL core mechanics while remaining skippable for experienced players. The tutorial should simulate real combat conditions and provide clear, sectioned explanations.

**Philosophy**: 
- ✅ Comprehensive coverage of all mechanics
- ✅ Skippable at any time (persistent Skip button)
- ✅ Simulate real combat (not just illusions)
- ✅ Clear UI with visual separation between sections
- ✅ Interactive learning with immediate feedback
- ✅ Progressive difficulty that mirrors actual gameplay

---

## Current State Analysis

### ✅ What Works Currently
- Story intro with typewriter effect
- Basic hand formation (Pair, Straight, Flush, Full House, High Card)
- Attack/Defend actions
- Moral choice (Slay/Spare)
- Clean UI with double-border design
- Skip functionality

### ❌ What's Missing
1. **Card System Fundamentals**
   - No explanation of the 4 elements (Apoy, Tubig, Lupa, Hangin)
   - No explanation of card values (1-13, Mandirigma, Babaylan, Datu)
   - No explanation of what each element does

2. **Enemy Mechanics**
   - No introduction to enemy intents (what enemies plan to do)
   - No explanation of enemy HP/damage
   - No real enemy behaviors shown

3. **Status Effects**
   - Buffs (Strength, Dexterity, Block) not explained
   - Debuffs (Weak, Vulnerable, Burn, Stun, Seal) not explained
   - No demonstration of how they affect combat

4. **Special Abilities**
   - Flush unlocks Special but elemental differences not shown
   - No explanation of different elemental Specials

5. **Items**
   - Relics (passive effects) not introduced
   - Potions (active effects) not introduced
   - No explanation of how to use them

6. **Combat Flow**
   - Discard mechanic not properly explained
   - Turn order not clear
   - Hand evaluation bonus system (+2, +10, etc.) not explained

7. **Other Mechanics**
   - DDA system impact (not necessary but could hint at it)
   - Deck-sculpting (Purify, Attune, Infuse) not mentioned

---

## Proposed Tutorial Structure

### **Phase 1: Welcome & Skip Option** *(30 seconds)*
```
"Welcome, traveler. This tutorial will teach you everything you need to survive.

You may skip at any time using the button in the corner, 
but knowledge is your greatest weapon."

[Continue] [Skip Tutorial]
```

---

### **Phase 2: Understanding Cards** *(2-3 minutes)*

#### **Section 2.1: The Four Elements**
```
"Your deck contains 52 cards across four sacred elements:

🔥 APOY (Fire) - 13 cards
   Effect: Inflicts BURN damage over time

💧 TUBIG (Water) - 13 cards
   Effect: Provides HEALING

🌍 LUPA (Earth) - 13 cards
   Effect: Grants STRENGTH (increased damage)

💨 HANGIN (Wind) - 13 cards
   Effect: Grants DEXTERITY (increased block)
"

[Show 4 sample cards visually, one of each element]
```

#### **Section 2.2: Card Values**
```
"Each card has a rank from 1 to 13:

Numbers: 1-10 (straightforward values)
Mandirigma (Warrior): 11
Babaylan (Shaman): 12
Datu (Chief): 13

Higher-ranked cards create stronger hands."

[Show cards arranged by rank]
```

#### **Section 2.3: Interactive Card Selection**
```
"Let's practice. Select any 5 cards from your hand.
Notice how cards lift when selected."

[Player selects 5 cards]
[Display what hand they formed with bonus]

"You formed: [Hand Type] (+[Bonus])"
```

---

### **Phase 3: Hand Types & Bonuses** *(3-4 minutes)*

#### **Section 3.1: Hand Type Hierarchy**
```
"Hands determine your action's power. Here's the hierarchy:

High Card: +0 (no pattern)
Pair: +2 (two matching ranks)
Two Pair: +4 (two pairs)
Three of a Kind: +7 (three matching)
Straight: +10 (5 in sequence)
Flush: +14 (5 same element) - UNLOCKS SPECIAL
Full House: +18 (three + pair)
Four of a Kind: +22 (four matching)
Straight Flush: +35 (straight + flush)
Five of a Kind: +30 (requires special relic)"

[Show visual reference chart]
```

#### **Section 3.2: Practice Each Hand**
```
For each hand type (Pair, Two Pair, Three of a Kind, Straight, Flush):
  1. "Form a [Hand Type]"
  2. Player selects 5 cards
  3. System validates
  4. "Well done! This grants +[X] to your action."
```

---

### **Phase 4: Combat Actions** *(3-4 minutes)*

#### **Section 4.1: The Three Actions**
```
"Three actions determine combat:

⚔️ ATTACK: Deal damage to enemies
   Base damage = 10 + Hand Bonus + Buffs

🛡️ DEFEND: Gain Block to absorb damage
   Base block = 5 + Hand Bonus + Buffs

✨ SPECIAL: Elemental ability (requires Flush or better)
   Effect varies by dominant element
"
```

#### **Section 4.2: Attack Practice**
**Real Enemy**: Tikbalang Scout (HP: 28, Intent: Attack 7)
```
"A Tikbalang Scout appears! Its intent shows it will attack for 7 damage.

Form a strong hand and ATTACK to defeat it."

[Player forms hand and attacks]
[Show damage calculation: 10 base + hand bonus]
[Enemy HP bar updates]

If enemy survives:
  [Enemy attacks player, show damage]
  "Continue attacking until it falls!"
```

#### **Section 4.3: Defend Practice**
**Real Enemy**: Balete Wraith (HP: 22, Intent: Attack 12)
```
"This wraith strikes hard! Sometimes survival requires defense.

Form a hand and use DEFEND to block its attack."

[Player defends, gains block]
[Enemy attacks, block absorbs damage]

"Block absorbs damage before your HP takes the hit!"
```

#### **Section 4.4: Special Practice**
**Real Enemy**: Sigbin Charger (HP: 35, Intent: Charge)
```
"Face a Sigbin! Use SPECIAL to unleash elemental power.

Form a FLUSH (5 cards of same element) to unlock Special."

[Player forms Flush]

"Your dominant element determines the Special effect:
- 🔥 Apoy: Heavy damage + Burn
- 💧 Tubig: Moderate damage + Heal
- 🌍 Lupa: Damage + Strength buff
- 💨 Hangin: Damage + Dexterity buff"

[Player uses Special, sees effect]
```

---

### **Phase 5: Discard Mechanic** *(1-2 minutes)*

```
"Sometimes your hand lacks good combinations.

DISCARD lets you redraw up to 5 cards once per combat.
Use it wisely - you start with 1 discard charge.

Try it now:"

[Player has weak hand]
[Discard button glows]
[Player discards, gets new cards]

"Much better! Discard charges are precious - relics can increase them."
```

---

### **Phase 6: Status Effects** *(3-4 minutes)*

#### **Section 6.1: Buffs (Positive)**
**Enemy**: Duwende Trickster (HP: 18)
```
"Status effects shape battles. First, BUFFS:

💪 STRENGTH: +[X] damage per stack
✨ DEXTERITY: +[X] block per stack
🛡️ BLOCK: Absorbs damage this turn (resets next turn)

Use a Lupa (Earth) Special to gain Strength."

[Player uses Lupa Special]
[Shows Strength icon with +3]
[Player attacks with increased damage]

"Notice your damage increased! Strength adds to every attack."
```

#### **Section 6.2: Debuffs (Negative)**
**Enemy**: Tiyanak Ambusher (HP: 25, inflicts Vulnerable)
```
"Now DEBUFFS - enemies inflict these:

⚠️ WEAK: -25% damage dealt
💔 VULNERABLE: +50% damage taken
🔥 BURN: [X] damage at turn end
😵 STUN: Skip your next turn
🚫 SEAL: Can't use Special abilities

The Tiyanak's attack inflicts Vulnerable!"

[Enemy attacks, player gains Vulnerable debuff]
[Shows Vulnerable icon]
[Player takes increased damage on next enemy hit]

"See the difference? Debuffs hurt - cleanse them with Tubig (Water) effects!"
```

#### **Section 6.3: Cleansing Debuffs**
```
"Use a Tubig (Water) Special to heal AND cleanse debuffs."

[Player uses Tubig Special]
[Vulnerable removed]
[HP restored]

"Water is your salvation in dire moments."
```

---

### **Phase 7: Items** *(2-3 minutes)*

#### **Section 7.1: Relics (Passive)**
```
"Relics provide permanent passive bonuses:

Examples:
- Babaylan's Talisman: Treat hands as one tier higher
- Agimat of Swift Wind: +1 discard charge
- Earthwarden's Plate: Start combat with 5 Block

You can hold up to 6 relics. They activate automatically.

Here, take this starter relic:"

[Player receives: "Tutorial Amulet" - Gain 3 Block at combat start]
[Shows relic in UI slot]
```

#### **Section 7.2: Potions (Active)**
**Enemy**: Amomongo (HP: 24)
```
"Potions are single-use combat items:

Examples:
- Potion of Clarity: Draw 3 cards
- Elixir of Fortitude: Gain 15 Block
- Phial of Elements: Choose dominant element

You can hold up to 3 potions. Use them strategically!

Here's a potion:"

[Player receives: Elixir of Fortitude]
[Shows potion in UI slot]

"Try using it now by clicking the potion."

[Player uses potion, gains 15 Block]
[Potion consumed]

"Potions can turn the tide - but use them wisely!"
```

---

### **Phase 8: Enemy Intents** *(2 minutes)*

**Enemy**: Bungisngis (HP: 30, rotating intents)
```
"Enemies telegraph their next move - their INTENT:

⚔️ Attack [X]: Will deal X damage
🛡️ Defend: Will gain Block
💪 Buff: Will gain beneficial status
🔮 Special: Will use unique ability
❓ Unknown: Unpredictable

This Bungisngis shows its intent each turn. Adapt your strategy!"

[Turn 1: Enemy shows "Attack 8"]
[Player responds]
[Turn 2: Enemy shows "Buff"]
[Player responds]

"Reading intents is key to survival!"
```

---

### **Phase 9: Moral Choice (Slay/Spare)** *(2 minutes)*

**Enemy**: Defeated Kapre Shade (HP: 0)
```
"Victory! But now, a choice defines you:

SLAY: +Gold, +Power, move toward CONQUEST path
       More gold, more aggressive enemies

SPARE: +Spirit Fragments, +Lore, move toward MERCY path
       More fragments for meta-progression, calmer enemies

BALANCE: Equal mix of both choices
         Standard experience

Your choice shapes rewards - NOT difficulty.
Make your choice:"

[Slay] [Spare]

[Player chooses]

"Your path begins. The realm remembers your judgment."
```

---

### **Phase 10: Advanced Concepts** *(1-2 minutes)*

```
"A few final lessons:

DECK-SCULPTING:
- PURIFY (Shop): Remove cards from deck
- ATTUNE (Rest): Upgrade card values
- INFUSE (Elite/Boss): Add powerful cards

DAY/NIGHT CYCLE:
- Day: Neutral enemies
- Night: Aggressive enemies, better rewards
- Boss spawns after 5 cycles (~500 actions)

THE JOURNEY:
- Navigate the overworld
- Choose your path
- Grow stronger
- Face chapter bosses
- Restore balance
"
```

---

### **Phase 11: Final Trial** *(3-5 minutes)*

**Elite Enemy**: Tawong Lipod (HP: 50, uses multiple mechanics)
```
"Your final trial: A true battle using everything you've learned.

The Tawong Lipod is a cunning invisible wind spirit:
- Alternates between Attack (10 damage), Defend, and Buff
- Has permanent Dexterity buff (+2 block when defending)
- Uses varied intents to test your adaptability
- Combines all mechanics you've learned

Defeat it to complete your training!"

[Full combat simulation:]
- Enemy: Tawong Lipod (50 HP)
- Turn 1: Attack (10 damage)
- Turn 2: Defend (gains 10 + 2 Dexterity = 12 Block)
- Turn 3: Buff (gains +2 Strength)
- Turn 4+: Repeats pattern
- Player has access to all actions, discard, items
- Real combat flow and turn order
- Victory condition: Reduce enemy to 0 HP

[Upon victory:]

"Excellent! You have mastered the fundamentals.
The corrupted realms await your judgment.
Go forth and restore balance!"

[Transition to Overworld]
```

---

## UI/UX Improvements

### **Visual Sectioning**
1. **Section Headers**: Large, clear titles for each phase
   ```
   ═══════════════════════════════════
        PHASE 2: UNDERSTANDING CARDS
   ═══════════════════════════════════
   ```

2. **Progress Indicator**: Show tutorial progress
   ```
   [●●●●●○○○○○○] Phase 5/11
   ```

3. **Visual Highlights**: 
   - Highlight relevant UI elements during explanations
   - Dim unrelated elements
   - Glowing indicators for interactive elements

4. **Info Boxes**: Clear, bordered info panels
   ```
   ┌─────────────────────────────┐
   │  💡 TIP: Higher hands mean  │
   │     more powerful actions!  │
   └─────────────────────────────┘
   ```

### **Persistent Elements**
- **Skip Button**: Always visible, top-right corner
- **Progress Bar**: Bottom of screen
- **Current Objective**: Top of screen

---

## Technical Implementation Plan

### **Phase 1: Refactor Current Tutorial**
1. Break `Prologue.ts` into modular sections
2. Create `TutorialPhase` class for each phase
3. Implement phase progression system
4. Add phase skip functionality

### **Phase 2: Add Missing Content**
1. **Card explanation phase** with visual demonstrations
2. **Status effect simulator** with real-time feedback
3. **Item introduction** with interactive usage
4. **Enemy intent system** in tutorial context

### **Phase 3: Create Real Combat Simulation**
1. Mini combat system for tutorial
2. Real enemy instances with simplified AI
3. Damage calculation integration
4. Turn order and intent display

### **Phase 4: UI Enhancements**
1. Section headers and separators
2. Progress indicator
3. Highlight system for UI elements
4. Info boxes and tooltips

### **Phase 5: Testing & Balancing**
1. Playtest entire tutorial flow
2. Adjust pacing and difficulty
3. Ensure all mechanics are clear
4. Validate skip functionality at each phase

---


---

## Success Metrics

### **Player Understanding** (Post-Tutorial Survey)
- ✅ Can identify all 4 elements and their effects
- ✅ Can explain hand bonuses
- ✅ Understands Attack/Defend/Special
- ✅ Recognizes status effects
- ✅ Knows how to use items
- ✅ Can read enemy intents
- ✅ Understands moral choice impact

### **Completion Rate**
- Target: 70%+ of players complete tutorial
- Target: 30%+ skip tutorial (experienced players)

### **Time to Complete**
- Target: 10-15 minutes for thorough playthrough
- Target: Instant skip for experienced players

---

## Open Questions for Adviser Review

1. **Depth vs. Brevity**: Is 10-15 minutes too long? Should we compress?
2. **Final Trial Difficulty**: Should the Tawong Lipod have 50 HP or be reduced to 35-40 HP for a quicker fight?
3. **Hand Type Practice**: Should we require forming ALL hand types, or just key ones (Pair, Straight, Flush, Full House)?
4. **Status Effect Coverage**: Should we demonstrate ALL status effects, or just the most common?
5. **Meta-Progression Hint**: Should we mention Ancestral Memories (permanent unlocks) in the tutorial?

---

## Next Steps

1. **Review this plan** with adviser and team
2. **Gather feedback** and adjust scope
3. **Begin implementation** following the phased approach
4. **Create tutorial asset list** (new sprites, UI elements, etc.)
5. **Set milestone deadlines** for each phase

---

**Document Version**: 1.0  
**Date**: October 19, 2025  
**Status**: Awaiting Review  
**Author**: [Your Name]  
**Project**: Bathala - Tutorial Revamp  

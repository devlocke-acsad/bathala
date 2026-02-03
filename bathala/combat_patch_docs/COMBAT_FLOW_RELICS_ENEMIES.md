# Combat Flow, Relics & Enemy Simplification

**Date**: February 3, 2026  
**Purpose**: Complete reference for combat mechanics, relic effects, and enemy ability simplification. Documents combat flow fixes and standardized mechanics.

---

## 📋 Table of Contents
1. [Combat Flow Issues](#combat-flow-issues)
2. [Enemy Abilities to Remove/Simplify](#enemy-abilities-to-removesimplify)
3. [Enemy Ability Patterns - Current vs. Simplified](#enemy-ability-patterns---current-vs-simplified)
4. [Implementation Checklist](#implementation-checklist)

---

## 🔄 Combat Flow Issues

### Current Combat Flow
```
1. Player Turn Start
   ├─ Process start-of-turn status effects (Poison, Regen, etc.)
   ├─ Draw cards to hand size (8 cards)
   ├─ Player selects 5 cards
   ├─ Player chooses action (Attack/Defend/Special)
   ├─ Hand evaluated & damage/block calculated
   ├─ Elemental effects applied (if Special)
   ├─ Process end-of-turn status effects
   └─ Transition to Enemy Turn

2. Enemy Turn
   ├─ Check if enemy defeated/stunned
   ├─ Process start-of-turn status effects
   ├─ Execute enemy action (based on attack pattern)
   ├─ Process end-of-turn status effects
   ├─ Update enemy intent for next turn
   └─ Return to Player Turn
```

### ❌ Issues to Fix

#### 1. **Turn Flow Timing Issues**
- **Problem**: Enemy turn starts immediately after player action without proper delay
- **Location**: `Combat.ts` - `executeAction()` → `processEnemyTurn()`
- **Fix**: Add consistent 1.5s delay before enemy turn to show player action results
- **Code Location**: Lines 3028-3039

#### 2. **Status Effect Processing Inconsistencies**
- **Problem**: Status effects sometimes process before/after the wrong actions
- **Current Order**:
  - Player turn: START effects → Action → END effects
  - Enemy turn: START effects → Action → END effects
- **Fix**: Ensure consistent timing: START → Check health → Execute action → END
- **Code Location**: Lines 1358-1470, 1477-1542

#### 3. **Action Processing Flag Reset**
- **Problem**: `isActionProcessing` flag doesn't reset properly if combat ends mid-turn
- **Location**: `Combat.ts` - `executeAction()`, `processEnemyTurn()`
- **Fix**: Always reset flag in `endCombat()` and add safety checks
- **Code Location**: Lines 2930-3056

#### 4. **Combat End Checks**
- **Problem**: Multiple combat end checks scattered throughout code (not centralized)
- **Locations**: 
  - `executeEnemyTurn()` - Line 1360
  - `startPlayerTurn()` - Line 1478
  - `damageEnemy()` - Line 1681
  - `damagePlayer()` - Line 1747
- **Fix**: Create centralized `checkCombatEnd()` method called after any health change

#### 5. **Intent Update Timing**
- **Problem**: Enemy intent updates AFTER they execute their action (confusing for player)
- **Current**: Execute action → Update intent for NEXT turn
- **Issue**: Intent shown doesn't match current action
- **Fix**: Intent should be set BEFORE the action executes (already correct), but UI needs clearer messaging
- **Code Location**: Lines 1709-1806

#### 6. **Damage Preview System**
- **Problem**: Damage preview doesn't hide consistently during enemy turn
- **Location**: Multiple locations
- **Fix**: Ensure `updateDamagePreview(false)` is called at start of enemy turn
- **Code Location**: Lines 1336, 3049

#### 7. **Relic Effect Timing & Order**
- **Problem**: Relic effects may trigger at inconsistent times relative to status effects
- **Current Relic Trigger Points**:
  - Start of combat: `applyStartOfCombatEffects()` (Line 520)
  - Start of turn: `applyStartOfTurnEffects()` (Line 1542)
  - After hand played: `applyAfterHandPlayedEffects()` (Line 2912)
  - End of turn: `applyEndOfTurnEffects()` (Line 1340)
  - Passive: Dodge (Line 1665), Damage reduction (Line 1680)
- **Issue**: Order between relic effects and status effects unclear
- **Fix**: Define clear execution order:
  1. Start of turn → Relic effects FIRST → Status effects SECOND
  2. After action → Hand evaluation → Relic effects → Elemental effects
  3. End of turn → Status effects FIRST → Relic effects SECOND
- **Code Locations**: Lines 1477-1542 (startPlayerTurn), 1335-1352 (endPlayerTurn)

#### 8. **Relic UI Update Timing**
- **Problem**: Relic inventory doesn't update immediately when relics are added/removed
- **Location**: Post-combat rewards screen
- **Fix**: Call `ui.forceRelicInventoryUpdate()` after any relic changes
- **Code Location**: Line 2104 (already has force update, verify it's working)

#### 9. **Relic Effect Conflicts**
- **Problem**: Some relic effects might conflict or double-trigger
- **Examples**:
  - Kapre's Cigar (double damage on first attack) - needs "once per combat" flag
  - Amomongo Claw (apply vulnerable after attack) - timing with damage calculation
  - Balete Root (block bonus) - should add AFTER base calculation
- **Fix**: Ensure relic effects have proper flags and don't double-apply
- **Code Locations**: Lines 2947 (Kapre), 2954 (Amomongo), 2972 (Balete Root)

---

## 🗡️ Enemy Abilities to Remove/Simplify

### ❌ Mechanics to REMOVE (Too Complex)

#### 1. **AoE (Area of Effect) Attacks**
**Why Remove**: 
- Only one target (player) in combat
- AoE concept doesn't make sense with single-target combat
- Confusing terminology

**Current Enemies with AoE**:
- None explicitly in code, but mentioned in attack patterns as "splash" or "burn_all"

**Fix**: Remove all AoE references, convert to single-target debuffs

---

#### 2. **Minion Summoning**
**Why Remove**:
- Too complex for turn-based poker combat
- Requires tracking multiple enemies
- UI not designed for multi-enemy combat
- Breaks combat flow

**Current Enemies with Summoning**:
- **Kapre Shade** (Act 1 Elite) - Pattern: `["poison", "strengthen", "attack"]` ✅ NO SUMMON (SAFE)
- **Kataw** (Act 2 Common) - Pattern: `["heal", "attack", "strengthen"]` ✅ NO SUMMON (SAFE)
- **Sirena Illusionist** (Act 2 Common) - Pattern: `["heal", "charm", "attack"]` ✅ NO SUMMON (SAFE)

**Status**: ✅ **NO SUMMONING ABILITIES FOUND IN CURRENT ENEMY DATA**

---

#### 3. **Crowd Control Simplification**
**Design Rule**: All crowd control effects = **Stun** (stops turn for 1 turn)
- "Charm" → Stun
- "Confuse" → Stun
- "Fear" → Stun
- "Disrupt" → Stun

**Why Simplify**:
- Single, clear CC mechanic instead of multiple similar effects
- Player easily understands: "This enemy will skip 1 turn"
- No vague mechanics like "disrupts hand" or "confuses targeting"

**Current Enemies**:
- **Berberoka Lurker** (Act 2) - Pattern: `["weaken", "attack", "defend"]` ✅ SIMPLIFIED (SAFE)
- All "confuse", "disrupt_draw", "fear" actions → Convert to "stun" ✅

**Status**: ⚠️ **NEEDS SIMPLIFICATION TO STUN**

---

#### 4. **DoT (Damage Over Time) Simplification**
**Design Rule**: All DoT effects deal damage for **2 turns**
- "Burn" → 2 turns of damage
- "Bleed" → 2 turns of damage  
- "Poison" → 2 turns of damage

**Why Simplify**:
- Consistent DoT duration across all types
- Easy to track and predict
- Elemental flavor maintained (fire burns, weapons bleed, poison lingers)
- No stack tracking complexity - just 2 turns of damage

**Implementation**:
- When DoT applied: Set duration = 2
- Each turn: Deal damage, reduce duration by 1
- Duration 0: Effect removed

---

#### 5. **Complex Special Mechanics to Remove**
**Why Remove/Simplify**:
- "Nullify" effects - unclear what this does
- "Hex of Reversal" - too complex

**Current Enemies**:
- **Sarimanok Keeper** (Act 3) - Pattern: `["nullify", "strengthen", "attack"]` ⚠️ NEEDS REVIEW
- **Apolaki Godling** (Act 3 Elite) - Pattern: `["strengthen", "attack", "nullify", "attack", "poison"]` ⚠️ NEEDS REVIEW
- **False Bathala** (Act 3 Boss) - Pattern: `["nullify", "weaken", "strengthen", "attack", "poison", "attack"]` ⚠️ NEEDS REVIEW

**Fix Needed**: Replace "nullify" with "weaken" (standard debuff)

---

### ✅ Mechanics to KEEP (Simple & Clear)

#### Standard Actions (Keep All)
1. **attack** - Deal damage
2. **defend** - Gain block
3. **strengthen** - Gain Strength buff (increases damage)
4. **weaken** - Apply Weak debuff (reduces damage)
5. **poison/burn/bleed** - Apply DoT debuff (damage for 2 turns)
6. **stun** - Skip next turn (all CC effects use this)
7. **heal** - Enemy heals health

#### Simplified Mechanics Rules
- **All Crowd Control = Stun**: Charm, confuse, fear, disrupt → All become "stun" (skip 1 turn)
- **All DoT = 2 Turns**: Poison, burn, bleed → All deal damage for exactly 2 turns
- **No Complexity**: No stacking, no scaling, no multi-target effects

#### Special Action - Elemental Effects
- **Tubig (Water) Special**: Has a chance to cleanse debuffs from player
  - When player uses Special action with Tubig as dominant suit
  - Removes debuffs (Weak, Poison, Stun, etc.) from player
  - Adds defensive utility to Water element

---

## 📊 Enemy Ability Patterns - Current vs. Simplified

### Act 1 Enemies

| Enemy | Current Pattern | Issues | Simplified Pattern |
|-------|----------------|--------|-------------------|
| **Tikbalang Scout** | `["attack", "weaken", "attack"]` | ✅ Simple | No change needed |
| **Balete Wraith** | `["attack", "strengthen", "attack"]` | ✅ Simple | No change needed |
| **Sigbin Charger** | `["defend", "attack", "defend"]` | ✅ Simple | No change needed |
| **Duwende Trickster** | `["weaken", "attack", "weaken"]` | ✅ Simple | No change needed |
| **Tiyanak Ambusher** | `["weaken", "attack", "attack"]` | ✅ Simple | No change needed |
| **Amomongo** | `["attack", "attack", "defend"]` | ✅ Simple | No change needed |
| **Bungisngis** | `["weaken", "attack", "strengthen"]` | ✅ Simple | No change needed |
| **Kapre Shade** (Elite) | `["poison", "strengthen", "attack"]` | ✅ Simple | No change needed |
| **Tawong Lipod** (Elite) | `["stun", "attack", "defend"]` | ✅ Simple | No change needed |
| **Mangangaway** (Boss) | `["weaken", "poison", "strengthen", "attack"]` | ✅ Simple | No change needed |

**Act 1 Status**: ✅ **ALL ENEMIES ALREADY SIMPLIFIED**

---

### Act 2 Enemies

| Enemy | Current Pattern | Issues | Simplified Pattern |
|-------|----------------|--------|-------------------|
| **Sirena Illusionist** | `["heal", "charm", "attack"]` | ⚠️ "charm" → "stun" | `["heal", "stun", "attack"]` |
| **Siyokoy Raider** | `["defend", "attack", "attack"]` | ✅ Simple | No change needed |
| **Santelmo Flicker** | `["attack", "defend", "attack"]` | ✅ Simple | No change needed |
| **Berberoka Lurker** | `["weaken", "attack", "defend"]` | ✅ Simple | No change needed |
| **Magindara Swarm** | `["attack", "heal"]` | ✅ Simple | No change needed |
| **Kataw** | `["heal", "attack", "strengthen"]` | ✅ Simple | No change needed |
| **Berbalang** | `["weaken", "attack", "attack"]` | ✅ Simple | No change needed |
| **Sunken Bangkilan** (Elite) | `["weaken", "attack", "heal", "strengthen"]` | ✅ Simple | No change needed |
| **Apoy-Tubig Fury** (Elite) | `["poison", "attack", "heal", "attack"]` | ✅ Simple | No change needed |
| **Bakunawa** (Boss) | `["weaken", "attack", "strengthen", "attack", "poison"]` | ✅ Simple | No change needed |

**Act 2 Status**: ⚠️ **1 ENEMY NEEDS SIMPLIFICATION** (Sirena - "charm" → "stun")

---

### Act 3 Enemies

| Enemy | Current Pattern | Issues | Simplified Pattern |
|-------|----------------|--------|-------------------|
| **Tigmamanukan Watcher** | `["strengthen", "attack", "attack"]` | ✅ Simple | No change needed |
| **Diwata Sentinel** | `["defend", "attack", "defend"]` | ✅ Simple | No change needed |
| **Sarimanok Keeper** | `["nullify", "strengthen", "attack"]` | ⚠️ "nullify" unclear | `["weaken", "strengthen", "attack"]` |
| **Bulalakaw Flamewings** | `["poison", "attack", "defend"]` | ✅ Simple | No change needed |
| **Minokawa Harbinger** | `["weaken", "attack", "defend"]` | ✅ Simple | No change needed |
| **Alan** | `["attack", "attack", "strengthen"]` | ✅ Simple | No change needed |
| **Ekek** | `["attack", "weaken", "attack"]` | ✅ Simple | No change needed |
| **Ribung Linti Duo** (Elite) | `["attack", "strengthen", "attack", "defend"]` | ✅ Simple | No change needed |
| **Apolaki Godling** (Elite) | `["strengthen", "attack", "nullify", "attack", "poison"]` | ⚠️ "nullify" unclear | `["strengthen", "attack", "weaken", "attack", "poison"]` |
| **False Bathala** (Boss) | `["nullify", "weaken", "strengthen", "attack", "poison", "attack"]` | ⚠️ "nullify" unclear | `["weaken", "weaken", "strengthen", "attack", "poison", "attack"]` |

**Act 3 Status**: ⚠️ **3 ENEMIES NEED SIMPLIFICATION** (Replace "nullify" with "weaken")

---

## 📝 Implementation Checklist

### Phase 1: Combat Flow Fixes

- [ ] **Fix 1**: Add consistent 1.5s delay before enemy turn
  - Location: `Combat.ts` lines 3028-3039
  - Update `executeAction()` method
  
- [ ] **Fix 2**: Centralize combat end checks
  - Create `checkCombatEnd(): boolean` method
  - Call after `damageEnemy()` and `damagePlayer()`
  - Remove scattered checks
  
- [ ] **Fix 3**: Fix status effect processing order
  - Verify START → Action → END order in both turns
  - Add debug logging for status effect timing
  
- [ ] **Fix 4**: Fix action processing flag
  - Add `finally` block to always reset `isActionProcessing`
  - Add safety checks in `endCombat()`
  
- [ ] **Fix 5**: Improve intent UI clarity
  - Add "Next Turn:" prefix to intent text
  - Make intent icon larger/more visible
  
- [ ] **Fix 6**: Fix damage preview hiding
  - Call `updateDamagePreview(false)` at start of `executeEnemyTurn()`
  - Call `updateDamagePreview(true)` at start of `startPlayerTurn()`

- [ ] **Fix 7**: Define relic effect execution order
  - Document execution order in code comments
  - Start of turn: Relics BEFORE status effects
  - End of turn: Status effects BEFORE relics
  - Verify order is consistent throughout combat
  
- [ ] **Fix 8**: Fix relic UI updates
  - Verify `forceRelicInventoryUpdate()` works correctly
  - Call after any relic add/remove in combat
  - Test relic display during and after combat
  
- [ ] **Fix 9**: Fix relic effect conflicts
  - Verify Kapre's Cigar only triggers once per combat
  - Verify Amomongo Claw doesn't double-apply
  - Verify Balete Root adds to final block (not base)
  - Add "once per combat" tracking for special relics

---

### Phase 2: Enemy Ability Simplification

#### Act 2 - Sirena Illusionist
- [ ] Update `Act2Enemies.ts` line ~35
- [ ] Change pattern from `["heal", "charm", "attack"]` to `["heal", "stun", "attack"]`
- [ ] Update intent description to "Heals and stuns (player skips turn)"

#### Act 3 - Sarimanok Keeper
- [ ] Update `Act3Enemies.ts` line ~75
- [ ] Change pattern from `["nullify", "strengthen", "attack"]` to `["weaken", "strengthen", "attack"]`
- [ ] Update intent description to "Weakens, strengthens, attacks"

#### Act 3 - Apolaki Godling
- [ ] Update `Act3Enemies.ts` line ~195
- [ ] Change pattern from `["strengthen", "attack", "nullify", "attack", "poison"]` to `["strengthen", "attack", "weaken", "attack", "poison"]`
- [ ] Update intent description accordingly

#### Act 3 - False Bathala
- [ ] Update `Act3Enemies.ts` line ~235
- [ ] Change pattern from `["nullify", "weaken", "strengthen", "attack", "poison", "attack"]` to `["weaken", "weaken", "strengthen", "attack", "poison", "attack"]`
- [ ] Update intent description to "Double weakens, strengthens, attacks, burns, attacks"

---

### Phase 3: Implement Simplified CC and DoT Mechanics

#### Crowd Control (All → Stun)
- [ ] Convert "charm" to "stun" action
  - Location: `executeEnemyTurn()` in `Combat.ts`
  - Effect: Apply Stunned status (player/enemy skips next turn)
  
- [ ] Verify "stun" mechanic works correctly
  - Should skip entire turn (no action, no status processing)
  - Currently uses Frail - change to Stunned status effect
  
- [ ] Convert all CC effects to use "stun"
  - "confuse" → "stun" ✅ (already converts to weak, change to stun)
  - "disrupt_draw" → "stun" ✅ (already converts to weak, change to stun)
  - "fear" → "stun" ✅ (already converts to weak, change to stun)

#### DoT (All → 2 Turns)
- [ ] Update Poison status effect
  - Set initial duration = 2 turns
  - Deal damage each turn, reduce duration by 1
  
- [ ] Update Burn status effect (if different from poison)
  - Set initial duration = 2 turns
  - Same mechanics as poison (just different name for flavor)
  
- [ ] Update Bleed status effect (if exists)
  - Set initial duration = 2 turns
  - Same mechanics as poison/burn

#### Tubig Special - Cleanse Mechanic
- [ ] Implement Tubig cleanse effect
  - Location: `applyElementalEffects()` in `Combat.ts`
  - When actionType === "special" && dominantSuit === "Tubig"
  - Add chance to remove debuffs from player (e.g., 50% chance)
  - Remove all debuff status effects (Weak, Poison, Stun, Frail, etc.)
  - Show feedback: "Water cleanses your ailments!"
  
- [ ] Balance cleanse chance
  - Start with 50% chance
  - Adjust based on playtesting
  - Consider making it 100% but with fewer debuffs removed

#### Remove Unused Actions
- [ ] Remove handling for "nullify" action
  - Location: `executeEnemyTurn()` lines 1420-1470
  - Replace with "weaken" in enemy patterns
  
- [ ] Clean up commented/unused action types
  - Search for "charge", "wait" - already simplified ✅

---

### Phase 4: Update Intent Display

- [ ] Update `updateEnemyIntent()` method in `Combat.ts` (lines 1709-1806)
- [ ] Remove intent cases for "charm" and "nullify"
- [ ] Verify all intent displays match simplified patterns

---

### Phase 5: Testing

#### Combat Flow Testing
- [ ] Test all Act 1 enemies (already simple, should work)
- [ ] Test Sirena Illusionist (Act 2) - verify "stun" instead of "charm"
- [ ] Test Sarimanok Keeper (Act 3) - verify "weaken" instead of "nullify"
- [ ] Test Apolaki Godling (Act 3) - verify "weaken" instead of "nullify"
- [ ] Test False Bathala (Act 3) - verify double "weaken" instead of "nullify"
- [ ] Verify combat flow timing (1.5s delays)
- [ ] Verify status effects process in correct order
- [ ] Verify no combat end bugs
- [ ] Verify intent displays correctly for all enemies

#### Relic Testing
- [ ] **Test relic timing**
  - Start of combat relics trigger correctly
  - Start of turn relics trigger BEFORE status effects
  - End of turn relics trigger AFTER status effects
  - After hand played relics trigger correctly
  
- [ ] **Test specific relics**
  - Kapre's Cigar: First attack deals double damage (once per combat)
  - Amomongo Claw: Applies 2 Vulnerable after attack (not during)
  - Balete Root: Adds block bonus after base calculation
  - Sigbin Heart: Adds damage to all attacks
  - Bungisngis Grin: Adds damage when enemy has debuffs
  - Tikbalang's Hoof: Dodge chance works correctly
  - Earthwarden's Plate: Persistent block at combat start
  - Swift Wind Agimat: Extra card draw at combat start
  - Babaylan's Talisman: Hand tier bonus works
  - Echo of Ancestors: Five of a Kind enabled
  
- [ ] **Test relic UI**
  - Relics display correctly in combat
  - Relic inventory updates when adding relics
  - Relic tooltips show correct info
  - Relic sprites load correctly

#### Tubig Special Testing
- [ ] Test Tubig cleanse chance (50%)
- [ ] Verify it removes all debuff types
- [ ] Verify feedback message displays
- [ ] Test with multiple debuffs active
- [ ] Balance cleanse probability if needed

---

## 🎯 Summary

### Current State
- **✅ Act 1 (10 enemies)**: All enemies already simplified
- **⚠️ Act 2 (10 enemies)**: 1 enemy needs simplification (Sirena)
- **⚠️ Act 3 (10 enemies)**: 3 enemies need simplification (Sarimanok, Apolaki, False Bathala)

### Changes Required
1. **Simplify CC**: Replace "charm" with "stun" (1 enemy)
2. **Simplify Special**: Replace "nullify" with "weaken" (3 enemies)
3. **Unify DoT**: All poison/burn/bleed → 2 turn duration
4. **Fix Combat Flow**: 9 combat flow issues (including 3 relic-related)
5. **Add Tubig Cleanse**: Special action with Water removes debuffs
6. **Clean up**: Remove unused action handlers

### Benefits
- ✅ **Unified CC Mechanic**: All crowd control = stun (skip 1 turn)
- ✅ **Unified DoT Mechanic**: All damage over time = 2 turns
- ✅ **Tubig Cleanse Utility**: Water special removes debuffs from player
- ✅ **Relic Timing Fixed**: Clear execution order for relic effects
- ✅ **No Relic Conflicts**: Proper flags prevent double-triggering
- ✅ **Simpler combat mechanics**: No confusing similar effects
- ✅ **Easier to understand**: Clear, predictable enemy patterns
- ✅ **Better turn flow**: Consistent status effect timing
- ✅ **No complexity**: No multi-target/summoning/complex mechanics
- ✅ **Poker focus**: Strategy on hand formation, not ability tracking

---

## 🏺 Complete Relic List & Effects

### Act 1 Relics (Lupa/Hangin Focus)

#### Combat Start
- **Earthwarden's Plate**: Start with 5 Block, +1 Block per turn
- **Agimat of the Swift Wind**: +1 discard charge (adds to base 3 = 4 total)
- **Stone Golem's Heart**: +8 Max HP, +2 Block at combat start
- **Diwata's Crown**: Start with 5 Block, +3 Block on Defend, Enables Five of a Kind

#### Per Turn Effects
- **Ember Fetish**: +10 damage if no block, +5 damage if block (start of turn)
- **Tiyanak Tear**: +10 damage per turn (start of turn)
- **Tidal Amulet**: Heal 2 HP per card in hand (end of turn)

#### Hand Tier Bonus
- **Babaylan's Talisman**: Hand tier +1 (Pair → Two Pair, Flush → Full House, etc.)

#### After Hand Played
- **Ancestral Blade**: +10 damage on Flush
- **Sarimanok Feather**: +1 Ginto on Straight or better
- **Lucky Charm**: +1 Ginto on Straight or better

#### Passive Defense
- **Tikbalang's Hoof**: 10% dodge chance
- **Balete Root**: +2 Block per Lupa (Earth) card in played hand
- **Duwende Charm**: +3 Block on Defend actions
- **Umalagad's Spirit**: +4 Block on Defend, +2 Block per card played

#### Passive Offense
- **Sigbin Heart**: +3 damage on Attack actions
- **Bungisngis Grin**: +4 damage on Attack when enemy has any debuff
- **Kapre's Cigar**: First Attack deals double damage (once per combat)
- **Mangangaway Wand**: +5 damage on Special actions

#### Debuff Application
- **Amomongo Claw**: 30% chance to apply 1 Vulnerable on Attack (enemy takes 1.5× damage)

---

### Act 2 Relics (Tubig/Apoy Focus)

#### Elemental Synergy
- **Sirena's Scale**: Heal 2 HP per Tubig (Water) card in played hand
- **Berberoka Tide**: +10 Block when playing all-Tubig hand
- **Elemental Core**: +40 damage per unique element in hand (2 elements = +40, 3 = +80, 4 = +120)
- **Santelmo Ember**: Burn damage deals +2 per stack

#### Passive Defense
- **Siyokoy Fin**: +3 Block on splash damage to multiple enemies
- **Bangkilan Veil**: +10% dodge when you have any debuff active

#### Debuff Resistance
- **Berbalang Spirit**: Immune to Weak debuff from enemies

#### Utility
- **Magindara Song**: Draw 1 card whenever you heal HP
- **Kataw Crown**: +5 damage vs enemies with minions/summons
- **Bakunawa Fang**: +5 damage whenever any relic effect triggers

---

### Act 3 Relics (Multi-Element Focus)

#### Combat Start
- **Sarimanok Plumage**: +1 Special charge (adds to base 1 = 2 total)
- **Apolaki's Spear**: +10 damage at combat start, +40 damage per unique element in hand

#### Card Draw
- **Tigmamanukan Feather**: Draw 1 card on Straight or better

#### Passive Defense
- **Diwata Veil**: +10% dodge chance

#### Multi-Element Synergy
- **Bulalakaw Spark**: Apply 3 Burn on hands with 2+ different elements
- **Linti Bolt**: +40 damage per unique element in hand (3 elements = +80, 4 = +120)
- **Apolaki's Spear**: +40 damage per unique element in hand

#### Situational Damage
- **Alan Wing**: +5 damage when fighting enemies with minions/allies
- **Ekek Fang**: +3 damage after turn 5

#### Debuff Resistance
- **Minokawa Claw**: Immune to card steal/discard effects from enemies
- **Coconut Diwa**: Immune to nullify/buff removal effects from enemies

---

## 📊 Relic Mechanics Reference

### Core Mechanics Explained

#### Vulnerable Mechanic
- **Amomongo Claw**: 30% chance to apply 1 Vulnerable on Attack
- **Effect**: Enemy with Vulnerable takes 1.5× damage (50% more)
- **Example**: 100 damage → 150 damage to vulnerable enemy

#### Strength/Damage Boost Mechanic
- **Base Damage Bonus**: +10 damage per tier/stack
- **Ember Fetish**: +10 damage if no block, +5 if block
- **Tiyanak Tear**: +10 damage per turn
- **Ancestral Blade**: +10 damage on Flush
- **Apolaki's Spear**: +10 damage at combat start

#### Multi-Element Damage Boost
- **Formula**: +40 damage per unique element in hand
- **Elemental Core**: 2 elements = +40, 3 = +80, 4 = +120
- **Linti Bolt**: Same formula (3+ elements)
- **Apolaki's Spear**: Same formula (multi-element bonus)
- **Example**: Playing [Apoy, Tubig, Lupa] = 3 elements = +80 damage

#### Resource Charges
- **Agimat of the Swift Wind**: +1 discard charge (adds to base of 3 = 4 total)
- **Sarimanok Plumage**: +1 Special charge (adds to base of 1 = 2 total)
- **Note**: Multiple charge relics stack (2 Agimat relics = base 3 + 2 = 5 total)

#### Debuff Immunity
- **Berbalang Spirit**: Immune to Weak from enemies
- **Minokawa Claw**: Immune to steal/discard from enemies
- **Coconut Diwa**: Immune to nullify/buff removal from enemies
- **Effect**: Completely blocks specified debuff type

---

### Relics by Trigger Type

#### Combat Start (One-time)
- Earthwarden's Plate (+5 Block)
- Stone Golem's Heart (+2 Block, +8 Max HP)
- Diwata's Crown (+5 Block)
- Agimat of the Swift Wind (+1 discard charge, adds to base)
- Sarimanok Plumage (+1 Special charge, adds to base)
- Apolaki's Spear (+10 damage)

#### Start of Turn (Every turn)
- Earthwarden's Plate (+1 Block)
- Ember Fetish (+5-10 damage based on block)
- Tiyanak Tear (+10 damage)

#### End of Turn (Every turn)
- Tidal Amulet (Heal 2 HP per card in hand)

#### After Hand Played (Conditional)
- Ancestral Blade (+10 damage on Flush)
- Sarimanok Feather, Lucky Charm (+1 Ginto on Straight+)
- Tigmamanukan Feather (Draw 1 on Straight+)
- Bulalakaw Spark (3 Burn on multi-element)
- Elemental Core, Linti Bolt, Apolaki's Spear (+40 per element)

#### Passive (Always Active)
- Tikbalang's Hoof, Diwata Veil, Bangkilan Veil (+10% dodge)
- Balete Root (+2 Block per Lupa card)
- Sigbin Heart (+3 damage on Attack)
- Bungisngis Grin (+4 damage vs debuffed enemies)
- Mangangaway Wand (+5 damage on Special)
- Amomongo Claw (30% Vulnerable on Attack)
- Kapre's Cigar (First Attack ×2 damage)

#### Healing Triggers
- Sirena's Scale (Heal 2 per Tubig card)
- Tidal Amulet (Heal 2 per card in hand)
- Magindara Song (Draw 1 when healing)

#### Debuff Immunity (Passive)
- Berbalang Spirit (Weak immunity)
- Minokawa Claw (Steal/discard immunity)
- Coconut Diwa (Nullify immunity)

#### Special Mechanics
- Babaylan's Talisman (Hand tier +1)
- Diwata's Crown (Enables Five of a Kind)
- Santelmo Ember (Burn +2 per stack)
- Bakunawa Fang (+5 on any relic trigger)

---

**End of Document**

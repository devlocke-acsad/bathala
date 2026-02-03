# Combat System Playtest Guide

## Purpose

This guide helps you manually playtest the Combat Status & Elemental System to verify that the balance feels good in actual gameplay.

## How to Start a Combat

1. Run the game: `npm run dev`
2. Navigate to the combat scene
3. Use the debug scene if available for controlled testing

## Test Scenarios

### Scenario 1: Basic Elemental Weakness

**Goal:** Verify that exploiting weakness feels rewarding

**Steps:**
1. Start combat with Tikbalang Scout (weak to Fire)
2. Play a Fire-heavy hand for Attack action
3. Observe damage numbers
4. Compare to playing a non-Fire hand

**Expected:**
- Fire attacks should deal ~50% more damage
- Damage difference should be noticeable
- UI should clearly show weakness indicator

**Questions:**
- Does the extra damage feel significant?
- Is the weakness indicator clear?
- Do you naturally want to use Fire cards?

---

### Scenario 2: Elemental Resistance

**Goal:** Verify that resistance is noticeable but not frustrating

**Steps:**
1. Start combat with Tikbalang Scout (resists Air)
2. Play an Air-heavy hand for Attack action
3. Observe damage numbers
4. Compare to playing a non-Air hand

**Expected:**
- Air attacks should deal ~25% less damage
- Damage reduction should be noticeable
- UI should clearly show resistance indicator

**Questions:**
- Does the resistance feel fair?
- Is it clear why damage is reduced?
- Do you want to switch elements?

---

### Scenario 3: Fire Special (Poison)

**Goal:** Verify Fire Special action is balanced

**Steps:**
1. Start combat with any enemy
2. Play a Fire-heavy hand for Special action
3. Observe immediate damage (should be ~60% of normal)
4. Watch Poison trigger over next 3 turns

**Expected:**
- Immediate damage: ~12 (if normal would be 20)
- Poison applies: 3 stacks
- Poison deals: 6 damage total over 3 turns
- Total value: 18 damage

**Questions:**
- Does the delayed damage feel worth it?
- Is Poison clear and understandable?
- Would you use this strategically?

---

### Scenario 4: Water Special (Heal)

**Goal:** Verify Water Special action is balanced

**Steps:**
1. Start combat with any enemy
2. Take some damage first
3. Play a Water-heavy hand for Special action
4. Observe healing (should be 8 HP)

**Expected:**
- Immediate damage: ~12 (if normal would be 20)
- Healing: 8 HP
- Net value: Compensates for damage loss

**Questions:**
- Does the healing feel meaningful?
- Would you use this when low on HP?
- Is the trade-off clear?

---

### Scenario 5: Earth Special (Plated Armor)

**Goal:** Verify Earth Special action is balanced

**Steps:**
1. Start combat with any enemy
2. Play an Earth-heavy hand for Special action
3. Observe Plated Armor application (3 stacks)
4. Watch block granted over next 3 turns

**Expected:**
- Immediate damage: ~12 (if normal would be 20)
- Plated Armor: 3 stacks
- Block granted: 9 total over 3 turns

**Questions:**
- Does the block feel valuable?
- Would you use this defensively?
- Is the status effect clear?

---

### Scenario 6: Air Special (Weak)

**Goal:** Verify Air Special action is balanced

**Steps:**
1. Start combat with any enemy
2. Play an Air-heavy hand for Special action
3. Observe Weak application (2 stacks)
4. Watch enemy damage reduction on their turns

**Expected:**
- Immediate damage: ~12 (if normal would be 20)
- Weak: 2 stacks on enemy
- Enemy damage reduced by ~44%

**Questions:**
- Does the damage reduction feel significant?
- Would you use this against hard-hitting enemies?
- Is the effect clear?

---

### Scenario 7: Status Effect Stacking

**Goal:** Verify multiple status effects work together

**Steps:**
1. Start combat with any enemy
2. Apply Poison (Fire Special)
3. Apply Weak (Air Special)
4. Apply Strength to yourself (via enemy or relic)
5. Observe all effects working together

**Expected:**
- All status effects should display clearly
- Effects should trigger at appropriate times
- No conflicts or bugs

**Questions:**
- Are multiple status effects manageable?
- Is the UI cluttered or clear?
- Do effects feel powerful when stacked?

---

### Scenario 8: Full Combat Flow

**Goal:** Verify complete combat feels balanced

**Steps:**
1. Start combat with a common enemy (e.g., Balete Wraith)
2. Play naturally, using strategy
3. Try to win efficiently
4. Note how many turns it takes

**Expected:**
- Combat should last 3-5 turns
- Player should end with 70-90% HP
- Victory should feel earned

**Questions:**
- Does combat feel too easy or too hard?
- Are decisions meaningful?
- Is the pacing good?

---

### Scenario 9: Elite Enemy

**Goal:** Verify elite enemies are appropriately challenging

**Steps:**
1. Start combat with Kapre Shade or Tawong Lipod
2. Play strategically
3. Use status effects and weaknesses
4. Note difficulty and duration

**Expected:**
- Combat should last 5-8 turns
- Player should end with 50-70% HP
- Should require more strategy than common enemies

**Questions:**
- Does the elite feel harder than common?
- Are status effects necessary?
- Is the challenge fair?

---

### Scenario 10: Boss Fight

**Goal:** Verify boss is climactic but fair

**Steps:**
1. Start combat with Mangangaway
2. Play strategically
3. Use all available tools
4. Note difficulty and duration

**Expected:**
- Combat should last 8-12 turns
- Player should end with 30-50% HP
- Should feel like a significant challenge

**Questions:**
- Does the boss feel epic?
- Is the difficulty appropriate?
- Would you want to fight this boss?

---

## Data to Collect

For each playtest session, record:

1. **Combat Duration**
   - Number of turns to victory
   - Total time spent in combat

2. **Player Health**
   - Starting HP
   - Ending HP
   - Lowest HP reached

3. **Damage Dealt**
   - Average damage per turn
   - Highest damage dealt
   - Elemental bonus usage

4. **Status Effects**
   - Which effects were used
   - How often they were used
   - Perceived value

5. **Player Feedback**
   - What felt good?
   - What felt bad?
   - What was confusing?
   - What would you change?

## Success Criteria

### Combat Should Feel:
- ✓ Strategic (decisions matter)
- ✓ Clear (mechanics are understandable)
- ✓ Balanced (not too easy or hard)
- ✓ Rewarding (victory feels earned)
- ✓ Varied (different enemies require different strategies)

### Red Flags:
- ✗ Combat is too fast (1-2 turns)
- ✗ Combat is too slow (10+ turns for common)
- ✗ Player never uses status effects
- ✗ Player never considers elements
- ✗ Player is confused by UI
- ✗ Player feels frustrated

## Quick Balance Check

After 5-10 playtests, check:

1. **Win Rate:** Should be 80-90% for common enemies
2. **Average Turns:** 3-5 for common, 5-8 for elite, 8-12 for boss
3. **HP Remaining:** 70-90% for common, 50-70% for elite, 30-50% for boss
4. **Status Effect Usage:** Players should use Special actions 30-50% of the time
5. **Elemental Strategy:** Players should consider weaknesses 70%+ of the time

## Reporting Issues

If you find balance issues, report:

1. **What happened:** Describe the issue
2. **Expected:** What should have happened
3. **Actual:** What actually happened
4. **Severity:** How bad is it? (Minor/Major/Critical)
5. **Frequency:** How often does it occur?
6. **Suggestion:** What would fix it?

## Next Steps

After playtesting:

1. Review collected data
2. Identify patterns in feedback
3. Prioritize balance adjustments
4. Update balance parameters
5. Re-test with changes
6. Iterate until balanced

---

**Happy Playtesting!** 🎮

Remember: The goal is to make combat feel strategic, clear, and fun. Trust your instincts and provide honest feedback!

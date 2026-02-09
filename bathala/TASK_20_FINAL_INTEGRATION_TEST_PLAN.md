# Task 20: Final Integration Test Plan

## Overview
This document outlines the comprehensive testing plan for Task 20 - Final Integration Test of Phase6_StatusEffects in the tutorial.

## Test Objectives
- Complete full tutorial playthrough from Phase1 to Phase10
- Verify Phase6 fits naturally in the flow
- Verify no performance issues or lag
- Verify tutorial completion message still works
- Verify transition to Overworld scene works
- Test "Skip Tutorial" button still works with Phase6 included

## Prerequisites
- Development server is running (`npm run dev`)
- Game is accessible in browser
- All previous tasks (1-19) have been completed

---

## Test Scenarios

### Scenario 1: Full Tutorial Playthrough (Phase 1 → Phase 10)

**Objective**: Complete the entire tutorial from start to finish, verifying Phase6 integration.

**Steps**:
1. Start the game and navigate to the Prologue scene
2. Skip or complete the story intro
3. **Phase 1 - Welcome**
   - [ ] Verify progress indicator shows "Phase 1 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 2
4. **Phase 2 - Understanding Cards**
   - [ ] Verify progress indicator shows "Phase 2 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 3
5. **Phase 3 - Hand Types & Bonuses**
   - [ ] Verify progress indicator shows "Phase 3 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 4
6. **Phase 4 - Combat Actions**
   - [ ] Verify progress indicator shows "Phase 4 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 5
7. **Phase 5 - Discard Mechanic**
   - [ ] Verify progress indicator shows "Phase 5 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 6
8. **Phase 6 - Status Effects & Elements** ⭐ (NEW PHASE)
   - [ ] Verify progress indicator shows "Phase 6 of 9"
   - [ ] **Section 1: Buffs Introduction**
     - [ ] Verify dialogue displays correctly
     - [ ] Verify status effect descriptions are accurate (Strength, Plated Armor, Regeneration, Ritual)
     - [ ] Verify emoji icons display correctly (💪 🛡️ 💚 ✨)
     - [ ] Verify tip about Earth Special appears
   - [ ] **Section 2: Debuffs Introduction**
     - [ ] Verify dialogue displays correctly
     - [ ] Verify Burn vs Poison distinction is clear
     - [ ] Verify debuff descriptions are accurate (Burn, Poison, Weak, Vulnerable, Frail)
     - [ ] Verify emoji icons display correctly (🔥 ☠️ ⚠️ 🛡️💔 🔻)
     - [ ] Verify info about Fire Special appears
   - [ ] **Section 3: Elemental Affinities**
     - [ ] Verify dialogue explains weakness (1.5×) and resistance (0.75×)
     - [ ] Verify element symbols display correctly (🔥💧🌿💨)
     - [ ] Verify visual example shows Tikbalang with weakness/resistance indicators
     - [ ] Verify color coding: weakness in red/orange, resistance in blue
   - [ ] **Section 4: Interactive Practice**
     - [ ] Verify combat simulation starts correctly
     - [ ] Verify player and enemy sprites display
     - [ ] Verify instruction text appears: "Step 1: Select 5 cards..."
     - [ ] Select 5 Fire cards
     - [ ] Verify "Play Hand" button enables
     - [ ] Click "Play Hand"
     - [ ] Verify instruction changes: "Step 2: Click 'Special'..."
     - [ ] Click "Special" button
     - [ ] Verify Fire Special animation plays
     - [ ] Verify Burn status effect appears on enemy (🔥 with stack count)
     - [ ] Verify damage calculation shows elemental weakness multiplier (1.5×)
     - [ ] Verify enemy HP decreases
     - [ ] Verify enemy turn simulation starts
     - [ ] Verify Burn triggers at start of enemy turn
     - [ ] Verify Burn damage displays
     - [ ] Verify Burn stack count reduces by 1
     - [ ] Verify success message appears
   - [ ] Verify smooth transition to Phase 7
9. **Phase 7 - Items (Relics & Potions)**
   - [ ] Verify progress indicator shows "Phase 7 of 9"
   - [ ] Complete the phase
   - [ ] Verify smooth transition to Phase 9
10. **Phase 9 - Moral Choice (Landás)**
    - [ ] Verify progress indicator shows "Phase 8 of 9"
    - [ ] Complete the phase
    - [ ] Verify smooth transition to Phase 10
11. **Phase 10 - Advanced Concepts**
    - [ ] Verify progress indicator shows "Phase 9 of 9"
    - [ ] Complete the phase
    - [ ] Verify tutorial completion message appears
12. **Tutorial Completion**
    - [ ] Verify completion message: "Tutorial Complete!"
    - [ ] Verify message text displays correctly
    - [ ] Verify "Click anywhere to begin your journey..." appears
    - [ ] Click to continue
    - [ ] Verify smooth transition to Overworld scene
    - [ ] Verify Overworld scene loads correctly

**Expected Results**:
- All phases complete without errors
- Phase6 fits naturally between Phase5 and Phase7
- All progress indicators show correct "X of 9" format
- No console errors or warnings
- No visual glitches or artifacts
- Smooth transitions between all phases
- Tutorial completion and Overworld transition work correctly

---

### Scenario 2: Skip Tutorial Button Test

**Objective**: Verify "Skip Tutorial" button works correctly with Phase6 included.

**Steps**:
1. Start the game and navigate to the Prologue scene
2. Skip or complete the story intro
3. At any phase (test at Phase 1, Phase 6, and Phase 9):
   - [ ] Click "Skip Tutorial" button (bottom right)
   - [ ] Verify confirmation dialog appears: "Skip Tutorial?"
   - [ ] Click "Yes, Skip"
   - [ ] Verify smooth transition to Overworld scene
   - [ ] Verify Overworld scene loads correctly
   - [ ] Verify no errors in console

**Expected Results**:
- Skip Tutorial button works from any phase
- Confirmation dialog displays correctly
- Smooth transition to Overworld
- No memory leaks or lingering event listeners
- No console errors

---

### Scenario 3: Skip Phase Button Test (Phase 6)

**Objective**: Verify "Skip Phase" button works correctly for Phase6.

**Steps**:
1. Start the game and navigate to the Prologue scene
2. Skip or complete the story intro
3. Progress through phases until Phase 6
4. At Phase 6:
   - [ ] Click "Skip Phase" button (bottom right, above Skip Tutorial)
   - [ ] Verify notification appears: "Phase Skipped"
   - [ ] Verify smooth transition to Phase 7
   - [ ] Verify Phase 7 loads correctly
   - [ ] Verify no errors in console
   - [ ] Verify no visual artifacts remain from Phase 6

**Expected Results**:
- Skip Phase button works correctly
- Notification displays and fades
- Clean transition to Phase 7
- No memory leaks or lingering event listeners
- No console errors

---

### Scenario 4: Phase Navigation Test

**Objective**: Verify Phase Navigation menu includes Phase6 and works correctly.

**Steps**:
1. Start the game and navigate to the Prologue scene
2. Skip or complete the story intro
3. At any phase:
   - [ ] Click "ℹ" (info) button (top right)
   - [ ] Verify Phase Navigation menu appears
   - [ ] Verify menu shows all 9 phases:
     1. Welcome
     2. Understanding Cards
     3. Hand Types & Bonuses
     4. Combat Actions
     5. Discard Mechanic
     6. **Status Effects & Elements** ⭐
     7. Items (Relics & Potions)
     8. Moral Choice (Landás)
     9. Advanced Concepts
   - [ ] Verify current phase is highlighted
   - [ ] Click on "6. Status Effects & Elements"
   - [ ] Verify notification: "Jumping to Phase 6"
   - [ ] Verify Phase 6 loads correctly
   - [ ] Verify Phase 6 displays all 4 sections
   - [ ] Complete Phase 6 or skip to verify transition to Phase 7

**Expected Results**:
- Phase Navigation menu displays correctly
- All 9 phases are listed
- Phase 6 appears in correct position
- Jumping to Phase 6 works correctly
- Phase 6 initializes properly when jumped to
- No console errors

---

### Scenario 5: Performance and Visual Consistency Test

**Objective**: Verify no performance issues, lag, or visual inconsistencies.

**Steps**:
1. Complete full tutorial playthrough (Scenario 1)
2. During playthrough, monitor:
   - [ ] **Frame Rate**: No significant drops or stuttering
   - [ ] **Transitions**: All fade in/out animations are smooth (300-700ms)
   - [ ] **Text Rendering**: All text is readable and properly formatted
   - [ ] **Emoji Rendering**: All emoji icons display correctly (💪 🛡️ 💚 ✨ 🔥 ☠️ ⚠️ 🛡️💔 🔻 🔥💧🌿💨)
   - [ ] **Color Coding**: 
     - Buffs: Green/Blue tones
     - Debuffs: Red/Orange tones
     - Weakness: Red/Orange (#ff6b6b)
     - Resistance: Blue (#5BA3D0)
   - [ ] **Progress Indicators**: All show correct "X of 9" format
   - [ ] **Headers**: All match style of other phases
   - [ ] **Dialogue Boxes**: Consistent formatting across all phases
   - [ ] **Button Styles**: All buttons match existing style
   - [ ] **Spacing and Layout**: Consistent with other phases
3. Check browser console:
   - [ ] No errors
   - [ ] No warnings (except expected Phaser warnings)
   - [ ] No memory leak warnings

**Expected Results**:
- Smooth performance throughout tutorial
- No lag or stuttering
- All visual elements render correctly
- Consistent styling across all phases
- No console errors or warnings

---

### Scenario 6: Edge Cases and Error Handling

**Objective**: Test edge cases and error handling in Phase6.

**Steps**:
1. **Rapid Clicking During Transitions**:
   - [ ] During Phase 5 → Phase 6 transition, click rapidly
   - [ ] Verify no double-execution or errors
   - [ ] Verify Phase 6 loads correctly
2. **Skipping During Combat Simulation**:
   - [ ] Start Phase 6 Section 4 (Interactive Practice)
   - [ ] During combat simulation, click "Skip Phase"
   - [ ] Verify proper cleanup (no lingering sprites or event listeners)
   - [ ] Verify smooth transition to Phase 7
3. **Phase Navigation During Phase 6**:
   - [ ] Start Phase 6
   - [ ] Open Phase Navigation menu
   - [ ] Jump to a different phase (e.g., Phase 3)
   - [ ] Verify Phase 6 cleanup is proper
   - [ ] Jump back to Phase 6
   - [ ] Verify Phase 6 reinitializes correctly
4. **Card Selection Edge Cases**:
   - [ ] In Phase 6 Section 4, try selecting more than 5 cards
   - [ ] Verify selection is limited to 5 cards
   - [ ] Try deselecting cards
   - [ ] Verify selection counter updates correctly
   - [ ] Verify "Play Hand" button enables/disables correctly

**Expected Results**:
- No errors from rapid clicking
- Proper cleanup when skipping during combat
- Phase navigation works correctly with Phase 6
- Card selection limits work correctly
- No console errors in any edge case

---

## Performance Benchmarks

Monitor these metrics during testing:

- **Frame Rate**: Should maintain 60 FPS throughout tutorial
- **Memory Usage**: Should not increase significantly during Phase 6
- **Transition Times**:
  - Fade in: 500-700ms
  - Fade out: 300-400ms
  - Section transitions: 300ms fade out + 400ms fade in
- **Animation Times**:
  - Status effect application: 400ms
  - Damage numbers: 1000ms float and fade
  - Dialogue display: 700ms delay before showing

---

## Console Checks

During testing, monitor the browser console for:

- ❌ **No Errors**: Should be zero errors
- ⚠️ **Warnings**: Only expected Phaser warnings (texture loading, etc.)
- 📝 **Logs**: Check for any Phase6-specific logs
- 🧹 **Cleanup**: Verify no "memory leak" or "listener not removed" warnings

---

## Success Criteria

✅ All test scenarios pass without errors
✅ Phase6 integrates seamlessly into tutorial flow
✅ All visual elements render correctly
✅ No performance issues or lag
✅ Tutorial completion and Overworld transition work
✅ Skip Tutorial and Skip Phase buttons work correctly
✅ Phase Navigation includes Phase6 and works correctly
✅ No console errors or warnings
✅ All edge cases handled properly

---

## Test Results

### Date: _____________
### Tester: _____________

**Overall Result**: [ ] PASS / [ ] FAIL

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Issues Found**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Screenshots/Videos**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Automated Test Coverage

While this is a manual integration test, the following automated tests have been completed:

- ✅ Task 13: Phase6 integration tests
- ✅ Task 14: Skip Phase functionality tests
- ✅ Task 15: Phase Navigation functionality tests
- ✅ Task 16: Visual consistency tests
- ✅ Task 17: Animation timing tests
- ✅ Task 18: Game systems integration tests
- ✅ Task 19: Edge cases and error handling tests

---

## Next Steps After Testing

If all tests pass:
1. Mark Task 20 as complete
2. Proceed to Task 21 (Documentation and polish)

If issues are found:
1. Document all issues in detail
2. Create bug reports with reproduction steps
3. Fix issues before marking task complete
4. Re-run affected test scenarios

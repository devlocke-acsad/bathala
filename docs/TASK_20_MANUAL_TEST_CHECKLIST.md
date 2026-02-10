# Task 20: Manual Integration Test - Quick Checklist

## 🎮 How to Test

1. **Open the game in your browser** (development server should be running at http://localhost:5173 or similar)
2. **Start a new game** and proceed through the tutorial
3. **Follow the checklist below** as you play

---

## ✅ Quick Test Checklist

### Full Playthrough Test (Primary Goal)

- [ ] **Phase 1-5**: Complete normally, verify progress shows "X of 9"
- [ ] **Phase 6 - Status Effects & Elements** (NEW):
  - [ ] Section 1 (Buffs): Displays correctly with accurate info
  - [ ] Section 2 (Debuffs): Shows Burn vs Poison distinction clearly
  - [ ] Section 3 (Elemental Affinities): Visual example with Tikbalang appears
  - [ ] Section 4 (Interactive Practice): Combat simulation works
    - [ ] Select 5 Fire cards
    - [ ] Click "Play Hand" → Click "Special"
    - [ ] Burn status effect appears on enemy (🔥 with stack count)
    - [ ] Elemental weakness multiplier shows (1.5×)
    - [ ] Enemy turn simulation: Burn triggers and reduces by 1
  - [ ] Smooth transition to Phase 7
- [ ] **Phase 7-10**: Complete normally, verify progress shows "X of 9"
- [ ] **Tutorial Completion**: 
  - [ ] "Tutorial Complete!" message appears
  - [ ] Click to continue → Overworld scene loads correctly

### Skip Tutorial Test

- [ ] Click "Skip Tutorial" button at any phase
- [ ] Confirm skip → Overworld scene loads correctly
- [ ] No errors in browser console (F12)

### Skip Phase Test

- [ ] At Phase 6, click "Skip Phase" button
- [ ] "Phase Skipped" notification appears
- [ ] Smooth transition to Phase 7
- [ ] No visual artifacts or errors

### Phase Navigation Test

- [ ] Click "ℹ" button (top right)
- [ ] Verify menu shows all 9 phases with "6. Status Effects & Elements"
- [ ] Click on Phase 6 → Jumps to Phase 6 correctly
- [ ] Complete or skip Phase 6 → Transitions to Phase 7

### Performance Check

- [ ] No lag or stuttering during Phase 6
- [ ] All animations are smooth (fade in/out, status effects)
- [ ] No console errors (check browser console with F12)

---

## 🐛 If You Find Issues

1. **Take a screenshot** of the issue
2. **Note the exact step** where it occurred
3. **Check browser console** (F12) for errors
4. **Report back** with details

---

## ✨ Expected Results

- ✅ Phase 6 appears between Phase 5 and Phase 7
- ✅ All progress indicators show "X of 9"
- ✅ Phase 6 content is accurate and clear
- ✅ Interactive practice works smoothly
- ✅ Tutorial completion and Overworld transition work
- ✅ Skip buttons work correctly
- ✅ No console errors or visual glitches

---

## 📝 Quick Test (5 minutes)

If you're short on time, do this minimal test:

1. Start tutorial → Skip to Phase 6 using Phase Navigation (ℹ button)
2. Play through all 4 sections of Phase 6
3. Verify transition to Phase 7
4. Skip to end and verify Overworld loads

---

## 🎯 Success Criteria

**PASS** if:
- Phase 6 integrates seamlessly
- All 4 sections display correctly
- Interactive practice works
- No errors or glitches

**FAIL** if:
- Phase 6 doesn't appear or crashes
- Content is incorrect or missing
- Interactive practice doesn't work
- Console shows errors
- Visual glitches or artifacts

---

## 📊 Test Status

**Date**: _______________
**Tester**: _______________
**Result**: [ ] PASS / [ ] FAIL

**Notes**:
_______________________________________________________________________________
_______________________________________________________________________________


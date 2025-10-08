# DDA Testing & Validation Guide

## The Problem: Why Your Current Tests Are Inconsistent

The issue you identified is **critical**: the DDA Debug Scene was producing inconsistent results because it was using **circular testing**. Here's what was wrong:

### Circular Testing (BAD ❌)
```typescript
// This is what was happening:
function calculateExpectedPPS() {
  // Duplicates the actual DDA logic
  return healthBonus + handBonus + efficiency;
}

function testDDA() {
  actualResult = dda.process(metrics);
  expectedResult = calculateExpectedPPS(); // Same logic!
  
  // This will ALWAYS match (100% accuracy)
  // But proves NOTHING about correctness
}
```

**Why this fails:**
- You're comparing the DDA against itself
- 100% accuracy means nothing
- Can't detect bugs in the logic
- Results vary because there's no true baseline

## The Solution: Ground Truth Testing

### Ground Truth Testing (GOOD ✅)
```typescript
// Manually calculate the expected value from the GDD spec
const EXPECTED_PPS = 2.75; // Calculated BY HAND from documentation

function testDDA() {
  actualResult = dda.process(metrics);
  
  // Compare against the manually calculated truth
  expect(actualResult).toBeCloseTo(EXPECTED_PPS, 2);
}
```

**Why this works:**
- Fixed, known-correct expected values
- Validates implementation matches specification
- Deterministic and repeatable
- Can calculate actual % accuracy

---

## How to Properly Test the DDA

### Step 1: Run Unit Tests (Deterministic)

```bash
cd bathala

# Install testing dependencies
npm install

# Run all DDA tests
npm run test:dda

# Watch mode (re-runs on file changes)
npm run test:watch
```

These tests:
- ✅ Use fixed inputs with known outputs
- ✅ Test each performance factor in isolation
- ✅ Validate tier transitions
- ✅ Check boundary conditions
- ✅ Are deterministic (same results every time)

### Step 2: Verify Test Results

The unit tests will output:
```
PASS src/core/dda/RuleBasedDDA.test.ts
  ✓ Health Retention Performance (5 tests)
  ✓ Skill Expression (2 tests)
  ✓ Combat Efficiency (2 tests)
  ✓ Damage Efficiency (1 test)
  ✓ Clutch Performance (1 test)
  ✓ Tier Transitions (2 tests)
  ✓ Calibration Period (1 test)
  ✓ PPS Bounds (2 tests)

Tests: 16 passed, 16 total
```

### Step 3: Calculate Efficiency Percentage

**Efficiency = (Tests Passed / Total Tests) × 100%**

Example:
- 16/16 tests passing = **100% efficiency** ✅
- 14/16 tests passing = **87.5% efficiency** ⚠️
- 10/16 tests passing = **62.5% efficiency** ❌

---

## Understanding the Test Structure

### Example: Health Retention Test

```typescript
it('should grant Excellent Health Bonus (≥90% HP retained)', () => {
  // ARRANGE: Set up known initial state
  dda.initializePlayerPPS(2.5); // Start at 2.5 PPS (Learning tier)
  
  const metrics: CombatMetrics = {
    healthPercentage: 0.95,  // 95% HP retained
    turnCount: 5,
    bestHandAchieved: 'pair',
    // ... other fixed values
  };
  
  // ACT: Run the DDA algorithm
  dda.processCombatResult(metrics);
  
  // ASSERT: Check against manually calculated expected value
  // Manual calculation from GDD:
  // - Excellent Health Bonus: +0.25
  // - Learning tier multiplier: ×1.0
  // - Total change: +0.25
  // - Final PPS: 2.5 + 0.25 = 2.75
  
  const newPPS = dda.getPlayerPPS().currentPPS;
  expect(newPPS).toBeCloseTo(2.75, 2); // Within 0.01
});
```

### Key Principles:

1. **Fixed Inputs**: Every test uses the same metrics every time
2. **Manual Calculation**: Expected values are calculated BY HAND from the GDD
3. **Documented Reasoning**: Comments explain the expected calculation
4. **Tolerance**: `toBeCloseTo(2.75, 2)` means "within 0.01 of 2.75"
5. **Isolation**: Each test starts fresh (no state carryover)

---

## What Each Test Category Validates

### Health Retention Performance
- ✅ Excellent Health Bonus (≥90% HP)
- ✅ Good Health Bonus (70-90% HP)
- ✅ Moderate Penalty (50-70% HP)
- ✅ Poor Penalty (<30% HP)
- ✅ Perfect Combat Bonus (no damage)

### Skill Expression - Hand Quality
- ✅ Excellent hands (Four of a Kind, Straight Flush, etc.)
- ✅ Good hands (Straight, Flush, Full House)
- ✅ No bonus for weak hands

### Combat Efficiency
- ✅ Fast combat rewards (tier-appropriate)
- ✅ Slow combat penalties (tier-appropriate)
- ✅ Turn thresholds match tier expectations

### Damage Efficiency
- ✅ High damage/turn ratio rewards
- ✅ Low damage/turn ratio penalties
- ✅ Proper calculation of efficiency ratio

### Clutch Performance
- ✅ Bonus when starting combat below 50% HP
- ✅ Bonus scales with disadvantage level
- ✅ Only applies when victory achieved

### Tier Transitions
- ✅ Correct thresholds (Struggling: 0-1.0, Learning: 1.1-2.5, etc.)
- ✅ Tier changes at correct PPS values
- ✅ Tier-based scaling applies correctly

### Calibration Period
- ✅ Player stays in Learning tier during calibration
- ✅ Calibration lasts correct number of combats
- ✅ Tier transitions unlock after calibration

### Boundary Conditions
- ✅ PPS clamped to [0.0, 5.0] range
- ✅ No negative PPS
- ✅ No PPS above maximum

---

## How to Add New Tests

When you add new DDA features or change the algorithm:

1. **Calculate Expected Value Manually**
   ```
   Example: New "Relic Synergy" bonus
   - Baseline PPS: 2.5
   - Relic bonus: +0.3
   - Tier multiplier (Learning): ×1.0
   - Expected PPS: 2.5 + (0.3 × 1.0) = 2.8
   ```

2. **Create Test Case**
   ```typescript
   it('should grant Relic Synergy bonus', () => {
     dda.initializePlayerPPS(2.5);
     const metrics = { /* fixed metrics */ };
     
     dda.processCombatResult(metrics);
     
     expect(dda.getPlayerPPS().currentPPS).toBeCloseTo(2.8, 2);
   });
   ```

3. **Document Calculation**
   - Add comments explaining the math
   - Reference GDD section if applicable
   - Note any special conditions

4. **Run Tests**
   ```bash
   npm run test:dda
   ```

---

## Why the DDA Debug Scene Should NOT Be Used for Validation

The DDA Debug Scene (`DDADebugScene.ts`) is useful for:
- ✅ Visual inspection during gameplay
- ✅ Debugging specific scenarios
- ✅ Understanding DDA behavior in real-time
- ✅ Generating analytics data

But it **cannot** prove correctness because:
- ❌ No fixed expected values (ground truth)
- ❌ Interactive nature introduces variability
- ❌ UI-based testing is slow and manual
- ❌ Can't run hundreds of tests quickly
- ❌ Results depend on button order pressed

**Use the Debug Scene for exploration, use Unit Tests for validation.**

---

## Interpreting Test Results

### All Tests Pass (100%)
```
Tests: 16 passed, 16 total
Time: 0.5s
```
✅ **DDA is working correctly** - Implementation matches specification

### Some Tests Fail (< 100%)
```
Tests: 14 passed, 2 failed, 16 total

FAIL src/core/dda/RuleBasedDDA.test.ts
  ✓ Health Retention Performance
  ✗ Skill Expression - Hand Quality
    Expected: 2.85
    Received: 2.75
```
⚠️ **DDA has bugs** - Either implementation is wrong OR expected values need updating

#### Action Steps:
1. Check if GDD specification changed
2. Verify manual calculation in test
3. Debug actual DDA logic
4. Update test OR fix implementation

### Tests Error/Crash
```
TypeError: Cannot read property 'currentPPS' of undefined
```
❌ **Critical bug** - DDA is broken, fix immediately

---

## Performance Benchmarking

To measure DDA performance:

```bash
# Run tests with coverage
npm run test -- --coverage

# Output shows:
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
RuleBasedDDA.ts     |   92.5  |   87.3   |  100.0  |  91.8
```

**Code Coverage Targets:**
- Statements: ≥90%
- Branches: ≥85%
- Functions: 100%
- Lines: ≥90%

---

## Common Testing Mistakes to Avoid

### ❌ DON'T: Copy DDA logic into tests
```typescript
// BAD - This is circular testing
function calculateExpected(metrics) {
  let adjustment = 0;
  if (metrics.healthPercentage >= 0.9) {
    adjustment += 0.25; // Same as DDA code!
  }
  return adjustment;
}
```

### ✅ DO: Calculate expected values independently
```typescript
// GOOD - Manual calculation with documentation
// From GDD Section 8.2.1: Excellent Health Bonus = +0.25
// Starting PPS: 2.5
// Change: +0.25
// Expected: 2.75
expect(result).toBeCloseTo(2.75, 2);
```

### ❌ DON'T: Use random or variable inputs
```typescript
// BAD - Results will vary
const randomHP = Math.random();
```

### ✅ DO: Use fixed, deterministic inputs
```typescript
// GOOD - Same result every time
const healthPercentage = 0.85;
```

### ❌ DON'T: Test multiple things at once
```typescript
// BAD - Can't tell which factor failed
it('tests everything', () => {
  // Health + Hand + Efficiency + Damage...
});
```

### ✅ DO: Test one factor per test
```typescript
// GOOD - Clear what's being tested
it('should grant Excellent Health Bonus', () => {
  // Only tests health bonus
});
```

---

## FAQ

### Q: Why do my manual calculations not match the actual PPS?

**A:** Most likely due to:
1. **Tier Scaling**: Bonuses/penalties are multiplied by tier scales
   - Learning: bonus ×1.0, penalty ×1.0
   - Thriving: bonus ×1.1, penalty ×1.2
   - Mastering: bonus ×1.2, penalty ×1.5

2. **Multiple Factors**: PPS change is the sum of ALL factors:
   - Health retention
   - Hand quality
   - Combat efficiency
   - Damage efficiency
   - Resource management
   - Clutch performance
   - Comeback momentum

3. **Rounding**: Use `toBeCloseTo(expected, 2)` for 0.01 precision

### Q: How often should I run these tests?

**A:**
- **Every time you change DDA code**: Regression testing
- **Before committing**: Pre-commit hook
- **In CI/CD**: Automated testing on push
- **After changing GDD**: Update expected values

### Q: What if the GDD specification changes?

**A:** Update the expected values in tests to match the new spec:
1. Recalculate expected PPS changes manually
2. Update test expectations
3. Run tests to verify implementation matches
4. Document why the change was made

### Q: Can I automate this?

**A:** Yes! Add to your workflow:

```json
// package.json
{
  "scripts": {
    "precommit": "npm run test:dda",
    "ci": "npm test -- --coverage --ci"
  }
}
```

---

## Summary

### The Right Way to Test DDA:

1. ✅ **Write unit tests** with fixed inputs and manually calculated expected outputs
2. ✅ **Run tests automatically** (`npm run test:dda`)
3. ✅ **Measure efficiency** as (tests passed / total tests) × 100%
4. ✅ **Validate each factor** independently
5. ✅ **Document calculations** in test comments

### Efficiency Proof:

**You can prove your DDA works at X% efficiency by:**
- Running the unit test suite
- Counting passed vs total tests
- `16 passed / 16 total = 100% efficiency ✅`

**This is deterministic and repeatable** - same results every time with the same code.

---

## Next Steps

1. **Install dependencies**: `npm install` (in bathala folder)
2. **Run tests**: `npm run test:dda`
3. **Fix any failures**: Update implementation or expected values
4. **Add new tests**: For any new DDA features
5. **Automate**: Add tests to CI/CD pipeline

The unit tests are the **source of truth** for DDA correctness. The Debug Scene is for visual debugging only.

# Error Handling Quick Reference

## Task 14: Add error handling and validation ✅ COMPLETE

### Summary
Comprehensive error handling added to StatusEffectManager, ElementalAffinitySystem, and DamageCalculator with 31 passing tests.

### Key Features

#### StatusEffectManager
- ✅ Invalid effect IDs → warn and skip
- ✅ Stack overflow → cap at maxStacks (and 999 safety limit)
- ✅ Negative stacks → reject and remove
- ✅ Null targets → error and skip
- ✅ NaN values → validate and reject

#### ElementalAffinitySystem
- ✅ Missing affinity → default to 1.0× multiplier
- ✅ Invalid elements → treat as neutral
- ✅ Invalid cards → skip and continue
- ✅ Bad modifiers → clamp to 0.1-10.0 range

#### DamageCalculator
- ✅ Invalid inputs → use safe defaults
- ✅ NaN/Infinity → validate all calculations
- ✅ Overflow → cap at 9999
- ✅ Missing affinity → default to 1.0×
- ✅ Negative damage → ensure ≥ 0

### Test Results
```
Test Suites: 4 passed
Tests:       89 passed
Time:        ~1s
```

### Files Modified
- `StatusEffectManager.ts` - validation in apply/process/cleanup
- `ElementalAffinitySystem.ts` - validation in calculate/getDominant
- `DamageCalculator.ts` - validation in all calculation methods
- `StatusEffectManager.test.ts` - updated error message
- `ErrorHandling.test.ts` - NEW comprehensive test suite

### Error Message Format
```
{ClassName}.{methodName}: {description}, {action}
```

### Logging Levels
- **error**: Critical failures (null targets, NaN)
- **warn**: Recoverable issues (invalid IDs, capping)
- **log**: Info (missing affinity)

### All Requirements Met ✅
1. Invalid status effect IDs validation
2. Stack overflow protection
3. Negative stack protection
4. Missing affinity fallback
5. Invalid element handling
6. NaN/overflow protection

### No Breaking Changes
All error handling is backward compatible with graceful degradation.

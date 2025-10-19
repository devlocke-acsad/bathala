# Relic System Refactoring - Centralized Effect Management

**Date**: October 19, 2025  
**Branch**: feat/relics_effect  
**Objective**: Make all relic effects work automatically through `RelicManager` without manual calls in Combat.ts

---

## 🎯 Problem Statement

Previously, buffed common relics required **individual method calls** in Combat.ts:
- `calculateEarthwardenTurnBonus()` - manual call in `startPlayerTurn()`
- `calculateUmalagadCardPlayBonus()` - manual call in `executeAction()`
- `calculateSwiftWindDrawBonus()` - manual call in `initializeCombat()`

**Issue**: Not scalable, hard to maintain, requires editing Combat.ts for every new relic.

---

## ✅ Solution: Centralized Effect System

All relic effects now work through **existing RelicManager methods** that are already called in Combat.ts:

### 1. **Start of Turn Effects** → `applyStartOfTurnEffects()`
**Location**: Called once per turn in `startPlayerTurn()`

**Relics Handled**:
- ✅ **Ember Fetish**: +4 Attack if no Block, +2 Attack if Block
- ✅ **Earthwarden's Plate**: +2 Block per turn (NEW)

**Implementation** (RelicManager.ts):
```typescript
case "earthwardens_plate":
  player.block += 2;
  console.log(`[Earthwarden's Plate] +2 Block at start of turn`);
  break;
```

---

### 2. **After Hand Played Effects** → `applyAfterHandPlayedEffects()`
**Location**: Called every time player plays a hand in `executeAction()`

**Relics Handled**:
- ✅ **Ancestral Blade**: +3 Attack on Flush
- ✅ **Sarimanok Feather**: +2 Ginto on Straight+
- ✅ **Lucky Charm**: +2 Ginto on Straight+
- ✅ **Umalagad's Spirit**: +3 Block per card played (NEW)
- ✅ **Wind Veil**: +1 draw per Hangin card

**Implementation** (RelicManager.ts):
```typescript
case "umalagad_spirit":
  const cardsPlayed = hand.length;
  if (cardsPlayed > 0) {
    const blockBonus = cardsPlayed * 3;
    player.block += blockBonus;
    console.log(`[Umalagad's Spirit] +${blockBonus} Block from playing ${cardsPlayed} cards`);
  }
  break;
```

---

### 3. **Initial Hand Size** → `calculateInitialHandSize()`
**Location**: Called at combat start in `initializeCombat()`

**Relics Handled**:
- ✅ **Tigmamanukan's Eye**: +2 cards (10 total)
- ✅ **Swift Wind Agimat**: +1 card (9 total) (NEW)

**Implementation** (RelicManager.ts):
```typescript
static calculateInitialHandSize(baseHandSize: number, player: Player): number {
  let handSize = baseHandSize;
  
  // Tigmamanukan's Eye: +2 additional cards
  if (player.relics.find(r => r.id === "tigmamanukan_eye")) {
    handSize += 2;
  }
  
  // Swift Wind Agimat: +1 additional card
  if (player.relics.find(r => r.id === "swift_wind_agimat")) {
    handSize += 1;
    console.log(`[Swift Wind Agimat] +1 additional card drawn at combat start`);
  }
  
  return handSize;
}
```

---

## 📋 Updated RELIC_EFFECTS Registry (Act1Relics.ts)

### START_OF_TURN
```typescript
START_OF_TURN: [
  'ember_fetish',        // +4 Attack if no block, +2 Attack if block
  'earthwardens_plate'   // +2 Block per turn (ADDED)
],
```

### AFTER_HAND_PLAYED
```typescript
AFTER_HAND_PLAYED: [
  'ancestral_blade',     // +3 Attack on flush
  'sarimanok_feather',   // +2 ginto on straight+
  'lucky_charm',         // +2 ginto on straight+
  'umalagad_spirit',     // +3 Block per card played (ADDED)
  'wind_veil'            // +1 draw per hangin card
],
```

### START_OF_COMBAT
```typescript
START_OF_COMBAT: [
  'earthwardens_plate',  // +12 Block at start
  'swift_wind_agimat',   // +2 discard charges, +1 card draw (UPDATED)
  'umalagad_spirit',     // +8 Block on all Defend actions
  'diwatas_crown',       // +15 Block, +6 Block on all Defend actions
  'stone_golem_heart',   // +15 max HP, +3 Block
  'bakunawa_scale',      // +10 max HP, -2 damage reduction
  'tigmamanukan_eye'     // +2 card draw
],
```

---

## 🚀 Combat.ts Changes (Simplified)

### Before (Manual Calls)
```typescript
// startPlayerTurn()
RelicManager.applyStartOfTurnEffects(this.combatState.player);
const earthwardenBonus = RelicManager.calculateEarthwardenTurnBonus(...);
if (earthwardenBonus > 0) { ... }

// executeAction()
RelicManager.applyAfterHandPlayedEffects(...);
const umalagadBonus = RelicManager.calculateUmalagadCardPlayBonus(...);
if (umalagadBonus > 0) { ... }

// initializeCombat()
const swiftWindDrawBonus = RelicManager.calculateSwiftWindDrawBonus(player);
const modifiedHandSize = RelicManager.calculateInitialHandSize(...) + swiftWindDrawBonus;
```

### After (Automatic)
```typescript
// startPlayerTurn()
RelicManager.applyStartOfTurnEffects(this.combatState.player); // Handles ALL relics

// executeAction()
RelicManager.applyAfterHandPlayedEffects(...); // Handles ALL relics

// initializeCombat()
const modifiedHandSize = RelicManager.calculateInitialHandSize(baseHandSize, player); // Handles ALL relics
```

---

## 🎮 How It Works Now

### 1. **Adding a New Relic with Effects**
To add a new relic with automatic effects:

1. **Define the relic** in `Act1Relics.ts`:
```typescript
{
  id: "new_relic",
  name: "New Relic",
  description: "Does something cool at start of turn.",
  emoji: "✨"
}
```

2. **Add to RELIC_EFFECTS registry**:
```typescript
START_OF_TURN: [
  'ember_fetish',
  'earthwardens_plate',
  'new_relic'  // Add here
],
```

3. **Implement effect in RelicManager.ts**:
```typescript
static applyStartOfTurnEffects(player: Player): void {
  RELIC_EFFECTS.START_OF_TURN.forEach(relicId => {
    const relic = player.relics.find(r => r.id === relicId);
    if (!relic) return;

    switch (relicId) {
      case "new_relic":
        // Your effect logic here
        player.statusEffects.push({ id: "cool_effect", duration: 1 });
        break;
    }
  });
}
```

4. **Done!** No need to touch Combat.ts.

---

## 📊 Testing Checklist

Test each buffed common relic in combat:

### Earthwarden's Plate
- [x] Grants 12 Block at combat start
- [x] Grants +2 Block at start of each turn
- [x] Console logs: `[Earthwarden's Plate] +2 Block at start of turn`

### Swift Wind Agimat
- [x] Grants +2 discard charges (5 total instead of 3)
- [x] Draws 9 cards instead of 8 at combat start
- [x] Console logs: `[Swift Wind Agimat] +1 additional card drawn at combat start`

### Ember Fetish
- [x] Grants +4 Attack when Block = 0
- [x] Grants +2 Attack when Block > 0
- [x] Triggers at start of each turn

### Umalagad's Spirit
- [x] Grants +8 Block on all Defend actions
- [x] Grants +3 Block per card played (ANY action: Attack/Defend/Special)
- [x] Console logs: `[Umalagad's Spirit] +15 Block from playing 5 cards` (if 5 cards played)

---

## 🏗️ Architecture Benefits

### Scalability
- ✅ Add new relics without modifying Combat.ts
- ✅ All effects centralized in RelicManager
- ✅ Easy to test and debug

### Maintainability
- ✅ Single source of truth (RELIC_EFFECTS registry)
- ✅ Clear separation of concerns
- ✅ Consistent effect timing

### Extensibility
- ✅ Easy to add new effect types (e.g., ON_DAMAGE_TAKEN, BEFORE_ENEMY_TURN)
- ✅ Can layer multiple effects cleanly
- ✅ No spaghetti code in Combat.ts

---

## 📝 Files Modified

1. **RelicManager.ts**
   - Updated `applyStartOfTurnEffects()` - added Earthwarden's Plate
   - Updated `applyAfterHandPlayedEffects()` - added Umalagad's Spirit
   - Updated `calculateInitialHandSize()` - added Swift Wind Agimat

2. **Act1Relics.ts**
   - Added `earthwardens_plate` to START_OF_TURN
   - Added `umalagad_spirit` to AFTER_HAND_PLAYED
   - Updated START_OF_COMBAT comments with correct values

3. **Combat.ts**
   - Removed manual `calculateEarthwardenTurnBonus()` call
   - Removed manual `calculateUmalagadCardPlayBonus()` call
   - Removed manual `calculateSwiftWindDrawBonus()` call
   - Added clarifying comments

---

## 🎯 Next Steps

1. ✅ Test all buffed common relics in actual combat
2. ⏳ Apply same pattern to Elite and Boss relics
3. ⏳ Add more effect types (e.g., ON_CARD_DRAWN, BEFORE_DISCARD)
4. ⏳ Create visual feedback for relic triggers (particle effects, UI notifications)

---

**Result**: All common relic effects now work automatically through the centralized RelicManager system! 🎉

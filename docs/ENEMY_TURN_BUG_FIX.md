# Enemy Turn Bug Fix

## Issue
Enemies (common, elite, and boss) were sometimes not attacking or performing any action during their turn. The enemy would just skip their turn entirely.

## Root Cause
The `executeEnemyTurn()` method only handled the "attack" intent but did not handle the "defend" intent. When an enemy's attack pattern included "defend", the code would:
1. Skip the defend action entirely (no block gain)
2. Update the intent for next turn
3. Start the player's turn again

This made it appear as if the enemy was "doing nothing" during their turn.

Additionally, there was a **double block gain bug** in `updateEnemyIntent()` where block was being added immediately when setting the defend intent, which would cause the enemy to gain block at the wrong time (when preparing the intent, not when executing it).

## Files Modified
- `src/game/scenes/Combat.ts`

## Changes Made

### 1. Added Defend Intent Handling in `executeEnemyTurn()`
**Location**: Line ~1223 in `executeEnemyTurn()` method

**Before**:
```typescript
// Apply enemy action based on intent
if (enemy.intent.type === "attack") {
  let damage = enemy.intent.value;
  if (enemy.statusEffects.some((e) => e.name === "Weak")) {
    damage *= 0.5;
  }
  this.animations.animateEnemyAttack();
  this.damagePlayer(damage);
}

// Update enemy intent for next turn
this.updateEnemyIntent();
```

**After**:
```typescript
// Apply enemy action based on intent
if (enemy.intent.type === "attack") {
  let damage = enemy.intent.value;
  if (enemy.statusEffects.some((e) => e.name === "Weak")) {
    damage *= 0.5;
  }
  this.animations.animateEnemyAttack();
  this.damagePlayer(damage);
} else if (enemy.intent.type === "defend") {
  // Enemy gains block (show visual feedback)
  const blockGain = enemy.intent.value;
  enemy.block = (enemy.block || 0) + blockGain;
  this.showActionResult(`Enemy gains ${blockGain} Block!`);
  this.ui.updateEnemyUI();
}

// Update enemy intent for next turn
this.updateEnemyIntent();
```

### 2. Removed Double Block Gain in `updateEnemyIntent()`
**Location**: Line ~1491 in `updateEnemyIntent()` method

**Before**:
```typescript
} else if (nextAction === "defend") {
  enemy.intent = {
    type: "defend",
    value: 5,
    description: "Gains 5 block",
    icon: "⛨",
  };
  enemy.block += 5; // ❌ This causes double block gain!
}
```

**After**:
```typescript
} else if (nextAction === "defend") {
  enemy.intent = {
    type: "defend",
    value: 5,
    description: "Gains 5 block",
    icon: "⛨",
  };
  // Block is gained in executeEnemyTurn(), not here (intent only shows what will happen)
}
```

## How It Works Now

### Enemy Turn Flow:
1. **Check if enemy is defeated or stunned** → Skip turn if true
2. **Apply status effects** (Burn damage, etc.)
3. **Execute enemy action based on intent**:
   - **Attack**: Deal damage to player with animation
   - **Defend**: Gain block and show feedback message
4. **Update enemy intent** for next turn (prepares what enemy will do)
5. **Start player turn** after 1.5s delay

### Intent System:
- `updateEnemyIntent()` only **prepares** the intent (shows what the enemy WILL do next turn)
- `executeEnemyTurn()` **executes** the current intent (does the actual action)
- This separation prevents actions from happening at the wrong time

## Testing Checklist
- ✅ Enemies with "attack" patterns still attack normally
- ✅ Enemies with "defend" patterns gain block during their turn
- ✅ Enemies with mixed patterns (attack, defend, attack) execute all actions properly
- ✅ Block gain is displayed with feedback message
- ✅ Enemy UI updates to show new block amount
- ✅ Turn sequence continues properly after defend action
- ✅ No double block gain bug

## Affected Enemy Types
This fix affects ALL enemies that have "defend" in their attack patterns:
- Common enemies with defensive patterns
- Elite enemies with mixed patterns
- Bosses with defensive phases

## Visual Feedback
When an enemy defends:
- Message appears: "Enemy gains 5 Block!" (or appropriate amount)
- Enemy block counter updates
- Turn sequence continues normally
- Player turn starts after 1.5s delay

## Future Enhancements
Consider adding:
1. **Animation for defend action** (similar to attack animation)
2. **Particle effects** when enemy gains block
3. **Sound effects** for defensive actions
4. **Variable block amounts** based on enemy type or difficulty

---

**Status**: ✅ **FIXED**
**Tested**: All enemy types now execute defend actions properly
**Side Effects**: None - pure bug fix with no breaking changes

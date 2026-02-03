# Combat Flow Implementation Guide

**Date**: February 3, 2026  
**Purpose**: Step-by-step implementation guide for fixing combat flow issues  
**Priority**: Ordered from critical to nice-to-have

---

## 🎯 Priority Order Overview

### **CRITICAL (Fix First)** - Breaks Combat
1. Combat End Checks - Prevents game-breaking bugs
2. Action Processing Flag - Prevents action spam/soft-locks
3. Turn Flow Timing - Makes combat playable

### **HIGH (Fix Second)** - Major Issues
4. Status Effect Processing Order - Core mechanic consistency
5. Relic Effect Timing - Ensures relics work correctly
6. Intent Update System - Player needs to know enemy actions

### **MEDIUM (Fix Third)** - Polish & UX
7. Damage Preview System - Better player feedback
8. Relic UI Updates - Visual consistency
9. Relic Effect Conflicts - Edge case handling

---

## 🔥 CRITICAL FIXES (Must Do First)

### ✅ Priority 1: Centralize Combat End Checks
**Why First**: Prevents game-breaking bugs where combat doesn't end properly

**Problem**: 
- Combat end checks scattered across multiple methods
- Can cause double-end, no-end, or soft-lock situations
- Health changes don't consistently trigger combat end

**Files to Edit**:
- `src/game/scenes/Combat.ts`

**Implementation Steps**:

#### Step 1: Create Central Check Method
```typescript
/**
 * Check if combat should end based on health values
 * Call this after ANY health change (player or enemy)
 */
private checkCombatEnd(): boolean {
  // Prevent multiple calls
  if (this.combatEnded) {
    return true;
  }
  
  // Check enemy defeated
  if (this.combatState.enemy.currentHealth <= 0) {
    this.combatState.enemy.currentHealth = 0;
    console.log("Enemy defeated - ending combat with victory");
    this.endCombat(true);
    return true;
  }
  
  // Check player defeated
  if (this.combatState.player.currentHealth <= 0) {
    this.combatState.player.currentHealth = 0;
    console.log("Player defeated - ending combat with defeat");
    this.endCombat(false);
    return true;
  }
  
  return false;
}
```

#### Step 2: Replace All Scattered Checks
**Locations to update** (search for these patterns):
- Line 1681: `damageEnemy()` - Replace inline check with `this.checkCombatEnd()`
- Line 1747: `damagePlayer()` - Replace inline check with `this.checkCombatEnd()`
- Line 1360: `executeEnemyTurn()` - Keep pre-check, add post-status check
- Line 1478: `startPlayerTurn()` - Keep pre-check, add post-status check

**Find and Replace Pattern**:
```typescript
// OLD (scattered throughout):
if (this.combatState.enemy.currentHealth <= 0) {
  this.combatState.enemy.currentHealth = 0;
  console.log("Enemy defeated!");
  // ... various implementations
  this.endCombat(true);
}

// NEW (everywhere):
if (this.checkCombatEnd()) {
  return; // Exit current method
}
```

#### Step 3: Add Safety to endCombat()
```typescript
private endCombat(victory: boolean): void {
  // CRITICAL: Prevent multiple calls
  if (this.combatEnded) {
    console.log("Combat already ended, preventing duplicate call");
    return;
  }
  
  this.combatEnded = true;
  
  // Reset processing flag (safety)
  this.isActionProcessing = false;
  
  // ... rest of existing code
}
```

**Testing**:
- [ ] Enemy dies from attack - combat ends
- [ ] Player dies from attack - combat ends
- [ ] Enemy dies from poison (status effect) - combat ends
- [ ] Player dies from poison - combat ends
- [ ] Combat doesn't double-end
- [ ] No soft-locks after combat end

---

### ✅ Priority 2: Fix Action Processing Flag
**Why Second**: Prevents action spam and soft-locks

**Problem**:
- `isActionProcessing` flag doesn't reset if combat ends mid-action
- Players can spam actions during enemy turn
- Flag gets stuck, preventing all future actions

**Files to Edit**:
- `src/game/scenes/Combat.ts`

**Implementation Steps**:

#### Step 1: Add try-finally to executeAction()
```typescript
public executeAction(actionType: "attack" | "defend" | "special"): void {
  // Prevent action spamming
  if (this.isActionProcessing) {
    console.log("Action already processing, ignoring input");
    return;
  }
  
  try {
    // Set processing flag
    this.isActionProcessing = true;
    
    // Visually disable action buttons
    this.setActionButtonsEnabled(false);
    
    // ... existing action logic ...
    
  } finally {
    // ALWAYS reset flag, even if error occurs
    // (enemy turn will handle its own timing)
    if (actionType !== "special") {
      // Attack/Defend reset after delay
      this.time.delayedCall(1000, () => {
        if (!this.combatEnded) {
          this.isActionProcessing = false;
          this.setActionButtonsEnabled(true);
        }
      });
    }
    // Special has its own timing in delayed callback
  }
}
```

#### Step 2: Reset Flag in startPlayerTurn()
```typescript
private startPlayerTurn(): void {
  // Don't start player turn if combat has ended
  if (this.combatEnded) {
    console.log("Combat has ended, not starting player turn");
    return;
  }
  
  // ... existing code ...
  
  // ALWAYS reset action processing flag at start of turn
  this.isActionProcessing = false;
  this.setActionButtonsEnabled(true);
  
  // ... rest of existing code ...
}
```

#### Step 3: Add Safety to endCombat() (already in Priority 1)
```typescript
private endCombat(victory: boolean): void {
  if (this.combatEnded) return;
  
  this.combatEnded = true;
  
  // CRITICAL: Reset action flag
  this.isActionProcessing = false;
  this.setActionButtonsEnabled(false); // Disable all buttons
  
  // ... rest of existing code ...
}
```

**Testing**:
- [ ] Can't spam action buttons
- [ ] Flag resets after each action
- [ ] Flag resets at start of each turn
- [ ] Flag resets when combat ends
- [ ] No soft-locks (buttons work after each turn)

---

### ✅ Priority 3: Fix Turn Flow Timing
**Why Third**: Makes combat feel responsive and clear

**Problem**:
- Enemy turn starts too quickly (player can't see results)
- Inconsistent delays between actions
- Special action has different timing than Attack/Defend

**Files to Edit**:
- `src/game/scenes/Combat.ts`

**Implementation Steps**:

#### Step 1: Standardize Delays (Constants)
```typescript
// Add to top of Combat class
private readonly DELAY_AFTER_ACTION = 1500;        // 1.5s after player action
private readonly DELAY_ENEMY_TURN = 1500;          // 1.5s for enemy turn
private readonly DELAY_SHOW_RESULTS = 1000;        // 1s to show action results
private readonly DELAY_COMBAT_END = 300;           // 0.3s before combat end
```

#### Step 2: Update executeAction() Timing
```typescript
public executeAction(actionType: "attack" | "defend" | "special"): void {
  // ... existing code ...
  
  if (actionType === "special") {
    // Special has animation
    this.animations.animateSpecialAction(dominantSuit);
    
    this.time.delayedCall(this.DELAY_AFTER_ACTION, () => {
      this.showActionResult(this.getSpecialActionName(dominantSuit));
      this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);
      
      // Process enemy turn after showing results
      this.time.delayedCall(this.DELAY_SHOW_RESULTS, () => {
        this.processEnemyTurn();
      });
    });
    return;
  }
  
  // Attack/Defend - show results first
  if (damage > 0) {
    this.animations.animatePlayerAttack();
    this.showFloatingDamage(damage);
    this.damageEnemy(damage);
  }
  
  if (block > 0) {
    this.combatState.player.block += block;
    this.ui.updatePlayerUI();
  }
  
  // Wait before enemy turn
  this.time.delayedCall(this.DELAY_SHOW_RESULTS, () => {
    this.processEnemyTurn();
  });
}
```

#### Step 3: Update executeEnemyTurn() Timing
```typescript
private executeEnemyTurn(): void {
  // ... existing status effect processing ...
  
  // ... execute enemy action ...
  
  // Process end-of-turn status effects
  this.applyStatusEffects(enemy, 'end_of_turn');
  
  // Update intent for next turn
  this.updateEnemyIntent();
  
  // Wait before starting player turn
  this.time.delayedCall(this.DELAY_ENEMY_TURN, () => {
    this.startPlayerTurn();
  });
}
```

**Testing**:
- [ ] Can see damage numbers clearly
- [ ] Can see enemy action before turn switches
- [ ] Timing feels responsive (not too fast/slow)
- [ ] Special action timing matches Attack/Defend
- [ ] No confusion about whose turn it is

---

## 🔶 HIGH PRIORITY FIXES (Do Second)

### ✅ Priority 4: Status Effect Processing Order
**Why Important**: Core combat mechanic must be consistent

**Problem**:
- Unclear when status effects trigger vs relics
- Order inconsistent between player/enemy turns
- Status effects sometimes skip or double-trigger

**Files to Edit**:
- `src/game/scenes/Combat.ts`

**Defined Order**:
```
PLAYER TURN START:
1. Relic effects (START_OF_TURN)
2. Status effects (START_OF_TURN) - Poison damage, buffs
3. Check combat end (if died from poison)
4. Draw cards
5. Enable actions

PLAYER TURN END:
1. Status effects (END_OF_TURN) - Reduce stacks, triggers
2. Relic effects (END_OF_TURN)
3. Transition to enemy turn

ENEMY TURN START:
1. Check if stunned (skip if true)
2. Status effects (START_OF_TURN) - Poison damage, buffs
3. Check combat end (if died from status)
4. Execute enemy action

ENEMY TURN END:
1. Status effects (END_OF_TURN) - Reduce stacks
2. Update intent for next turn
3. Transition to player turn
```

**Implementation Steps**:

#### Step 1: Update startPlayerTurn()
```typescript
private startPlayerTurn(): void {
  if (this.combatEnded) return;
  
  this.combatState.phase = "player_turn";
  
  // Increment turn counter
  if (this.turnCount > 0) {
    this.combatState.turn++;
  }
  this.turnCount++;
  
  // ORDER 1: Relic effects FIRST
  RelicManager.applyStartOfTurnEffects(this.combatState.player);
  
  // ORDER 2: Status effects SECOND
  this.applyStatusEffects(this.combatState.player, 'start_of_turn');
  
  // ORDER 3: Check if player died from status effects
  if (this.checkCombatEnd()) {
    return;
  }
  
  // ORDER 4: Draw cards and enable actions
  const cardsNeeded = 8 - this.combatState.player.hand.length;
  if (cardsNeeded > 0) {
    this.drawCards(cardsNeeded);
  }
  
  // ORDER 5: Update UI and enable actions
  this.ui.updateHandDisplay();
  this.isActionProcessing = false;
  this.setActionButtonsEnabled(true);
}
```

#### Step 2: Update endPlayerTurn()
```typescript
private endPlayerTurn(): void {
  // ORDER 1: Status effects FIRST
  this.applyStatusEffects(this.combatState.player, 'end_of_turn');
  
  // ORDER 2: Relic effects SECOND
  RelicManager.applyEndOfTurnEffects(this.combatState.player);
  
  this.combatState.phase = "enemy_turn";
  this.selectedCards = [];
  
  // Hide damage preview during enemy turn
  this.updateDamagePreview(false);
  
  // Transition to enemy turn
  this.executeEnemyTurn();
}
```

#### Step 3: Update executeEnemyTurn()
```typescript
private executeEnemyTurn(): void {
  // Check if enemy is already defeated
  if (this.checkCombatEnd()) {
    return;
  }
  
  const enemy = this.combatState.enemy;
  
  // ORDER 1: Check if stunned (skip turn if true)
  const isStunned = enemy.statusEffects.some((e) => e.name === "Stunned");
  if (isStunned) {
    console.log("Enemy is stunned, skipping their turn");
    this.showActionResult("Enemy is Stunned - Turn Skipped!");
    
    // Still process end-of-turn and move to next turn
    this.applyStatusEffects(enemy, 'end_of_turn');
    this.updateEnemyIntent();
    
    this.time.delayedCall(this.DELAY_ENEMY_TURN, () => {
      this.startPlayerTurn();
    });
    return;
  }
  
  // ORDER 2: Status effects FIRST
  this.applyStatusEffects(enemy, 'start_of_turn');
  
  // ORDER 3: Check if enemy died from status effects
  if (this.checkCombatEnd()) {
    return;
  }
  
  // ORDER 4: Execute enemy action
  const currentAction = enemy.attackPattern[enemy.currentPatternIndex];
  
  // ... execute action based on pattern ...
  
  // ORDER 5: End of turn status effects
  this.applyStatusEffects(enemy, 'end_of_turn');
  
  // ORDER 6: Update intent for next turn
  this.updateEnemyIntent();
  
  // ORDER 7: Transition to player turn
  this.time.delayedCall(this.DELAY_ENEMY_TURN, () => {
    this.startPlayerTurn();
  });
}
```

**Documentation to Add**:
```typescript
/**
 * CRITICAL: Status Effect and Relic Execution Order
 * 
 * PLAYER TURN START:
 * 1. Relics (START_OF_TURN) - Earthwarden's Plate, Ember Fetish, etc.
 * 2. Status Effects (START_OF_TURN) - Poison damage, Regeneration
 * 3. Combat End Check - Player may die from Poison
 * 4. Draw cards to hand
 * 5. Enable player actions
 * 
 * PLAYER TURN END:
 * 1. Status Effects (END_OF_TURN) - Ritual, reduce stacks
 * 2. Relics (END_OF_TURN) - Tidal Amulet
 * 
 * ENEMY TURN START:
 * 1. Check Stunned status - Skip turn if stunned
 * 2. Status Effects (START_OF_TURN) - Poison damage
 * 3. Combat End Check - Enemy may die from Poison
 * 4. Execute enemy action
 * 
 * ENEMY TURN END:
 * 1. Status Effects (END_OF_TURN) - Reduce stacks
 * 2. Update enemy intent
 */
```

**Testing**:
- [ ] Poison damages at start of turn (before actions)
- [ ] Can die from poison before taking action
- [ ] Relic effects trigger before status effects (start of turn)
- [ ] Status effects reduce stacks at end of turn
- [ ] Order is same for player and enemy
- [ ] Stun skips entire turn (including status effects)

---

### ✅ Priority 5: Relic Effect Timing & Order
**Why Important**: Relics must work consistently

**Problem**:
- Relics trigger at inconsistent times
- Some relics may conflict with each other
- Relic damage bonuses apply at wrong time

**Files to Edit**:
- `src/game/scenes/Combat.ts`
- `src/core/managers/RelicManager.ts`

**Implementation Steps**:

#### Step 1: Document Relic Trigger Points (in Combat.ts)
```typescript
/**
 * RELIC TRIGGER POINTS (in order of execution):
 * 
 * 1. START_OF_COMBAT (initializeCombat):
 *    - Earthwarden's Plate: +5 Block
 *    - Swift Wind Agimat: +1 discard charge
 *    - Sarimanok Plumage: +1 Special charge
 *    - Stone Golem's Heart: +8 Max HP, +2 Block
 * 
 * 2. START_OF_TURN (startPlayerTurn - BEFORE status effects):
 *    - Earthwarden's Plate: +1 Block
 *    - Ember Fetish: +10 damage (no block) or +5 (with block)
 *    - Tiyanak Tear: +10 damage
 * 
 * 3. AFTER_HAND_PLAYED (executeAction - AFTER evaluation):
 *    - Ancestral Blade: +10 damage on Flush
 *    - Babaylan's Talisman: Hand tier +1 (during evaluation)
 *    - Balete Root: +2 Block per Lupa card
 *    - Sigbin Heart: +3 damage (flat bonus)
 * 
 * 4. ON_DAMAGE (damageEnemy - passive):
 *    - Amomongo Claw: 30% Vulnerable
 *    - Bungisngis Grin: +4 damage if enemy debuffed
 *    - Kapre's Cigar: First attack x2 (once per combat)
 * 
 * 5. ON_DEFEND (executeAction - when blocking):
 *    - Umalagad's Spirit: +4 Block on Defend
 *    - Duwende Charm: +3 Block on Defend
 * 
 * 6. END_OF_TURN (endPlayerTurn - AFTER status effects):
 *    - Tidal Amulet: Heal 2 HP per card in hand
 */
```

#### Step 2: Add Execution Order Comments
```typescript
public executeAction(actionType: "attack" | "defend" | "special"): void {
  // ... prevent spamming ...
  
  // STEP 1: Evaluate hand
  const evaluation = HandEvaluator.evaluateHand(
    this.combatState.player.playedHand,
    actionType,
    this.combatState.player
  );
  
  // STEP 2: Apply relic effects AFTER hand evaluation
  RelicManager.applyAfterHandPlayedEffects(
    this.combatState.player,
    this.combatState.player.playedHand,
    evaluation
  );
  
  // STEP 3: Calculate base damage/block from evaluation
  let damage = 0;
  let block = 0;
  
  switch (actionType) {
    case "attack":
      damage = evaluation.totalValue;
      
      // STEP 4: Apply passive relic damage bonuses
      const sigbinHeartDamage = RelicManager.calculateSigbinHeartDamage(this.combatState.player);
      damage += sigbinHeartDamage;
      
      const bungisngisGrinDamage = RelicManager.calculateBungisngisGrinDamage(
        this.combatState.player,
        this.combatState.enemy
      );
      damage += bungisngisGrinDamage;
      
      // STEP 5: Apply Kapre's Cigar (first attack only)
      if (RelicManager.shouldApplyKapresCigarDouble(this.combatState.player, this)) {
        damage = damage * 2;
        this.showActionResult("Kapre's Cigar empowered your strike!");
      }
      break;
      
    case "defend":
      block = evaluation.totalValue;
      
      // STEP 4: Apply Balete Root (after base calculation)
      const baleteRootBonus = RelicManager.calculateBaleteRootBlock(
        this.combatState.player,
        this.combatState.player.playedHand
      );
      block += baleteRootBonus;
      break;
  }
  
  // STEP 6: Apply elemental effects (if Special)
  this.applyElementalEffects(actionType, dominantSuit, evaluation.totalValue);
  
  // STEP 7: Execute damage/block
  if (damage > 0) {
    this.damageEnemy(damage);
    
    // STEP 8: Apply Amomongo Claw AFTER damage
    if (actionType === "attack" && RelicManager.shouldApplyAmomongoVulnerable(this.combatState.player)) {
      const vulnerableStacks = RelicManager.getAmomongoVulnerableStacks(this.combatState.player);
      StatusEffectManager.applyStatusEffect(this.combatState.enemy, 'vulnerable', vulnerableStacks);
    }
  }
  
  // ... rest of code ...
}
```

**Testing**:
- [ ] Kapre's Cigar triggers only on first attack
- [ ] Amomongo Claw applies AFTER damage dealt
- [ ] Balete Root adds to final block (not base)
- [ ] Sigbin Heart adds to all attacks
- [ ] Bungisngis Grin checks debuffs correctly
- [ ] Relic timing documented in code comments

---

### ✅ Priority 6: Intent Display & Update
**Why Important**: Player needs to know what enemy will do

**Problem**:
- Intent updates AFTER enemy acts (confusing)
- Intent doesn't always match actual action
- No clear indication of what's happening now vs next

**Files to Edit**:
- `src/game/scenes/Combat.ts`
- `src/game/scenes/combat/CombatUI.ts`

**Implementation Steps**:

#### Step 1: Add "Next Turn" Label to Intent
```typescript
// In CombatUI.ts - updateEnemyUI()
private updateEnemyIntent(): void {
  const enemy = this.combatState.enemy;
  
  // ... existing intent logic ...
  
  // UPDATE: Add "Next Turn:" prefix for clarity
  const intentDescription = `Next Turn: ${enemy.intent.description}`;
  
  this.enemyIntentText.setText(intentDescription);
  this.enemyIntentText.setColor(this.getIntentColor(enemy.intent.type));
}
```

#### Step 2: Show Current Action During Enemy Turn
```typescript
// In Combat.ts - executeEnemyTurn()
private executeEnemyTurn(): void {
  // ... existing code ...
  
  const currentAction = enemy.attackPattern[enemy.currentPatternIndex];
  
  // SHOW what enemy is doing NOW
  this.showCurrentEnemyAction(currentAction);
  
  // Execute the action
  if (currentAction === "attack") {
    // ... execute attack ...
  }
  
  // ... rest of code ...
  
  // THEN update intent for NEXT turn
  this.updateEnemyIntent();
}

private showCurrentEnemyAction(action: string): void {
  let actionText = "";
  
  switch (action) {
    case "attack":
      actionText = `${this.combatState.enemy.name} attacks!`;
      break;
    case "defend":
      actionText = `${this.combatState.enemy.name} defends!`;
      break;
    case "strengthen":
      actionText = `${this.combatState.enemy.name} grows stronger!`;
      break;
    case "poison":
      actionText = `${this.combatState.enemy.name} poisons you!`;
      break;
    case "weaken":
      actionText = `${this.combatState.enemy.name} weakens you!`;
      break;
    case "stun":
      actionText = `${this.combatState.enemy.name} stuns you!`;
      break;
    case "heal":
      actionText = `${this.combatState.enemy.name} heals!`;
      break;
  }
  
  this.showActionResult(actionText);
}
```

#### Step 3: Verify Intent Accuracy
```typescript
private updateEnemyIntent(): void {
  const enemy = this.combatState.enemy;
  
  // Move to next action in pattern
  enemy.currentPatternIndex = (enemy.currentPatternIndex + 1) % enemy.attackPattern.length;
  
  const nextAction = enemy.attackPattern[enemy.currentPatternIndex];
  
  // Set intent based on NEXT action (not current)
  switch (nextAction) {
    case "attack":
      enemy.intent = {
        type: "attack",
        value: enemy.damage,
        description: `Attacks for ${enemy.damage} damage`,
        icon: "†",
      };
      break;
    
    case "defend":
      enemy.intent = {
        type: "defend",
        value: 5,
        description: "Gains 5 block",
        icon: "⛨",
      };
      break;
    
    // ... rest of intent cases ...
  }
  
  this.ui.updateEnemyUI();
}
```

**Testing**:
- [ ] Intent shows "Next Turn: ..."
- [ ] Current action displays during enemy turn
- [ ] Intent always matches what enemy actually does
- [ ] Intent updates AFTER action completes
- [ ] Intent value matches actual damage/block

---

## 🔷 MEDIUM PRIORITY FIXES (Do Third)

### ✅ Priority 7: Damage Preview System
**Quick Fix** - Already mostly working

**Files**: `Combat.ts`

**Changes**:
```typescript
// At start of executeEnemyTurn()
private executeEnemyTurn(): void {
  // Hide damage preview during enemy turn
  this.updateDamagePreview(false);
  
  // ... rest of code ...
}

// At start of startPlayerTurn()
private startPlayerTurn(): void {
  // ... existing code ...
  
  // Show damage preview for player turn
  this.updateDamagePreview(true);
}
```

---

### ✅ Priority 8: Relic UI Updates
**Quick Fix** - Force update after relic changes

**Files**: `Combat.ts`

**Changes**:
```typescript
// After adding relic in post-combat rewards
if (droppedRelic && droppedRelic.id === rewardRelic.id) {
  // Relic was added
  this.updateRelicsUI();
  this.ui.forceRelicInventoryUpdate(); // ENSURE this works
}
```

---

### ✅ Priority 9: Relic Effect Conflicts
**Edge Cases** - Verify no double-triggers

**Testing**:
- [ ] Kapre's Cigar only triggers once per combat
- [ ] Amomongo Claw doesn't apply multiple times
- [ ] Balete Root doesn't double-count cards
- [ ] Multiple same relics stack correctly

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (DO FIRST)
- [ ] **Priority 1**: Centralize combat end checks
  - [ ] Create `checkCombatEnd()` method
  - [ ] Replace all scattered checks
  - [ ] Add safety to `endCombat()`
  - [ ] Test all combat end scenarios
  
- [ ] **Priority 2**: Fix action processing flag
  - [ ] Add try-finally to `executeAction()`
  - [ ] Reset flag in `startPlayerTurn()`
  - [ ] Reset flag in `endCombat()`
  - [ ] Test action spam prevention
  
- [ ] **Priority 3**: Fix turn flow timing
  - [ ] Add delay constants
  - [ ] Update `executeAction()` timing
  - [ ] Update `executeEnemyTurn()` timing
  - [ ] Test turn flow feels good

### Phase 2: High Priority Fixes (DO SECOND)
- [ ] **Priority 4**: Status effect processing order
  - [ ] Update `startPlayerTurn()` order
  - [ ] Update `endPlayerTurn()` order
  - [ ] Update `executeEnemyTurn()` order
  - [ ] Add documentation comments
  - [ ] Test poison/status timing
  
- [ ] **Priority 5**: Relic effect timing
  - [ ] Document all trigger points
  - [ ] Add execution order comments
  - [ ] Verify relic timing in code
  - [ ] Test all 10 relics from checklist
  
- [ ] **Priority 6**: Intent display
  - [ ] Add "Next Turn:" prefix
  - [ ] Show current action during enemy turn
  - [ ] Verify intent accuracy
  - [ ] Test intent always matches action

### Phase 3: Polish (DO THIRD)
- [ ] **Priority 7**: Damage preview hiding
- [ ] **Priority 8**: Relic UI updates
- [ ] **Priority 9**: Relic conflict testing

---

## 🎯 Quick Start: What to Do Right Now

1. **Start Here**: Priority 1 (Combat End Checks)
   - Open `Combat.ts`
   - Create `checkCombatEnd()` method
   - Replace all health checks with this method
   - Test combat endings

2. **Then Do**: Priority 2 (Action Processing)
   - Add try-finally to `executeAction()`
   - Add resets to `startPlayerTurn()` and `endCombat()`
   - Test action buttons work correctly

3. **Then Do**: Priority 3 (Timing)
   - Add delay constants
   - Update all delayed calls to use constants
   - Test timing feels responsive

4. **After Critical Fixes Work**: Move to High Priority
   - Document status effect order
   - Document relic trigger points
   - Fix intent display

---

**End of Guide**

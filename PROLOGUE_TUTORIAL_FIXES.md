# Prologue Tutorial Fixes

## Issues Fixed

### 1. Play Hand Button Not Working
**Problem**: The "Play Hand" button was not clickable even when 5 cards were selected.

**Root Cause**: The button enable/disable logic was trying to manipulate individual child elements (Rectangle objects) instead of the container itself. This broke the button's interactive state.

**Solution**:
- Changed button enable/disable to use the container's `setInteractive()` and `disableInteractive()` methods
- Added an `isEnabled` flag to track button state
- Modified the callback to check `isEnabled` before executing
- Removed the complex child manipulation code that was breaking interactivity

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts` (lines 373-437)

### 2. Cards Not Appearing Sometimes
**Problem**: Cards would sometimes not display when entering a combat practice section.

**Root Causes**:
1. Hand container visibility wasn't being explicitly set
2. Duplicate code in `TutorialUI.ts` causing syntax errors
3. Played hand container not being properly re-initialized between sections

**Solutions**:
1. **Explicit Visibility Control**: Added explicit `setVisible(true)`, `setAlpha(1)`, and `setDepth(1500)` calls to ensure hand container is always visible when drawing cards
2. **Fixed TutorialUI Syntax Error**: Removed duplicate code block in `updateHandDisplay()` method
3. **Container Re-initialization**: Added check in `continueSection()` to ensure played hand container is properly reset when destroyed
4. **Added Debug Logging**: Added console.log statements to track card drawing and display updates

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts`:
  - Lines 356-368: Added explicit visibility controls and debug logging
  - Lines 78-90: Added played hand container re-initialization check
  - Lines 441-461: Added double-click prevention
- `bathala/src/game/scenes/Prologue/ui/TutorialUI.ts`:
  - Lines 108-111: Added explicit visibility setting after card display
  - Removed duplicate code block (lines 113-120)

### 3. Stuck on "Executing action..."
**Problem**: After clicking an action button (Attack/Defend/Special), the game would get stuck showing "Executing action..." and never progress.

**Root Cause**: The Attack action only had a completion callback when the enemy HP reached 0. In practice scenarios where the enemy survives, there was no code path to continue to the next section.

**Solution**:
- Removed the conditional `if (this.enemyHP <= 0)` check
- Made the completion callback always execute after a delay, regardless of enemy defeat
- Added dynamic success message that shows "Victory!" if enemy is defeated, or "Great attack!" if enemy survives
- Ensured all action types (Attack, Defend, Special) always complete and transition to the next section

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts` (lines 558-625)

**Code Change**:
```typescript
// Before: Only continued if enemy died
if (this.enemyHP <= 0) {
    // success message and transition
}
// No else clause - got stuck!

// After: Always continues
const successMessage = this.enemyHP <= 0 
    ? '🎉 Victory! You defeated the enemy!'
    : `⚔️ Great attack! You dealt ${damage} damage!`;
// Always transitions after delay
```

### 4. Special Ability Incorrectly Required Flush
**Problem**: The Special action required a Flush or better hand type to execute, which was inconsistent with the actual game mechanics.

**Root Cause**: Leftover requirement from an earlier design iteration that was checking for flush/straight flush before allowing Special execution.

**Solution**:
- Removed the flush/straight flush requirement check
- Special ability now works with any hand type
- Removed the forced flush cards that were being dealt for Special practice
- All practice sections now deal 8 random cards consistently

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts`:
  - Lines 651-671: Removed flush requirement check
  - Lines 361-365: Simplified card dealing (8 cards for all actions)

### 5. Played Hand Display Used Rectangles Instead of Card Sprites
**Problem**: When cards were played (moved to center), they were displayed as simple colored rectangles with text instead of actual card sprite images.

**Root Cause**: The `displayPlayedCards()` method was using basic geometric shapes instead of loading the card textures.

**Solution**:
- Created new `createCardSpriteForPlayed()` method that mirrors the card sprite creation in `TutorialUI`
- Uses same texture key mapping (`card_{rank}_{suit}`)
- Falls back to styled rectangles if texture doesn't exist
- Maintains consistent visual appearance between hand and played cards
- Increased card spacing from 70 to 90 pixels for better visibility

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts` (lines 509-575)

**Code Change**:
```typescript
// Before: Rectangle-based display
const cardBg = this.scene.add.rectangle(cardX, 0, 60, 85, 0x2c3e50, 0.9);
const rankText = this.scene.add.text(cardX, -20, card.rank, {...});
const suitEmoji = this.scene.add.text(cardX, 10, suitEmoji, {...});

// After: Sprite-based display
const textureKey = `card_${spriteRank}_${spriteSuit}`;
const cardSprite = this.scene.add.image(0, 0, textureKey);
cardSprite.setDisplaySize(cardWidth, cardHeight);
```

### 6. Tutorial Displayed Intent, Buffs, and Debuffs Prematurely
**Problem**: Phase 4 Combat showed enemy intent and mentioned buffs/debuffs in the action descriptions before those mechanics were introduced.

**Root Cause**: UI elements and descriptions from later tutorial phases were included in Phase 4.

**Solution**:
- Removed enemy intent display from combat scene (was showing "⚔️ Intent: Attack 15")
- Removed "+ Buffs" reference from Attack and Defend action descriptions
- Removed "(requires Flush or better)" from Special ability description (already fixed in issue #4)
- Simplified combat display to focus only on core mechanics: HP, Block, and basic actions

**Files Modified**:
- `bathala/src/game/scenes/Prologue/phases/Phase4_CombatActions.ts`:
  - Lines 312-318: Removed enemy intent text display
  - Line 117: Simplified action descriptions to remove buff references

**Before**:
```typescript
const enemyIntent = this.scene.add.text(enemyX, enemyHealthY + 25, 
    `⚔️ Intent: Attack ${enemyData.damage || 15}`, {...});

"⚔️ ATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus + Buffs"
```

**After**:
```typescript
// Enemy intent removed - will be taught in Phase 8

"⚔️ ATTACK: Deal damage to enemies\n   Base damage = 10 + Hand Bonus"
```

### 7. Phase 6 (Status Effects) and Phase 8 (Enemy Intents) Removed from Tutorial
**Problem**: The tutorial included phases teaching status effects (buffs/debuffs) and enemy intents before the core mechanics were fully established.

**Root Cause**: Tutorial progression was too aggressive, introducing advanced concepts too early in the learning curve.

**Solution**:
- **Removed Phase 6 (Status Effects)**: Deferred teaching of buffs, debuffs, Strength, Vulnerable, Weak, Burn, etc.
- **Removed Phase 8 (Enemy Intents)**: Deferred teaching of enemy intent system and turn prediction
- Updated phase numbering throughout all remaining phases
- Updated all progress indicators from "X of 11" to "X of 9"
- Tutorial now focuses on core mechanics: cards, hands, actions, discard, items, moral choices, and advanced concepts

**New Phase Order** (9 phases total):
1. Welcome
2. Understanding Cards
3. Hand Types and Bonuses
4. Combat Actions
5. Discard Mechanic
6. Items (was Phase 7)
7. Moral Choice (was Phase 9)
8. Advanced Concepts (was Phase 10)
9. Final Trial (was Phase 11)

**Files Modified**:
- `bathala/src/game/scenes/Prologue/TutorialManager.ts`:
  - Lines 1-14: Commented out Phase 6 and Phase 8 imports
  - Lines 155-167: Removed Phase 6 and Phase 8 from phases array with explanatory comments
- All remaining phase files: Updated progress indicators to reflect 9 total phases
  - `Phase1_Welcome.ts`: 1 of 9
  - `Phase2_UnderstandingCards.ts`: 2 of 9
  - `Phase3_HandTypesAndBonuses.ts`: 3 of 9
  - `Phase4_CombatActions.ts`: 4 of 9
  - `Phase5_DiscardMechanic.ts`: 5 of 9
  - `Phase7_Items.ts`: 6 of 9 (renumbered from 7)
  - `Phase9_MoralChoice.ts`: 7 of 9 (renumbered from 9)
  - `Phase10_AdvancedConcepts.ts`: 8 of 9 (renumbered from 10)
  - `Phase11_FinalTrial.ts`: 9 of 9 (renumbered from 11)

**Impact**:
- Cleaner tutorial progression focusing on essential mechanics
- Status effects and enemy intents can be introduced later (in-game or future tutorial expansion)
- Reduced tutorial length from 11 phases to 9 phases
- Progress indicator UI now accurately reflects current position in shortened tutorial

## Technical Details

### Button State Management
The button now uses a simple flag-based approach:
```typescript
// Enable button
this.playHandButton.setAlpha(1);
this.playHandButton.setInteractive();
(this.playHandButton as any).isEnabled = true;

// Disable button
this.playHandButton.setAlpha(0.5);
this.playHandButton.disableInteractive();
(this.playHandButton as any).isEnabled = false;

// Check in callback
if ((this.playHandButton as any).isEnabled) {
    this.playHand(...);
}
```

### Card Display Flow
1. Hand container is explicitly made visible
2. Cards are drawn (8 cards for Attack/Defend, 3+5 flush for Special)
3. `updateHandDisplay()` is called
4. Debug logs confirm card count
5. Hand container visibility is re-confirmed in `updateHandDisplay()`

### Phase Transitions
- Phase 1 (Card Selection) → Phase 2 (Action Selection) transition now includes double-click prevention
- Container cleanup between sections ensures no stale references

## Testing Recommendations

1. **Play Hand Button**: 
   - Verify button is disabled until 5 cards selected
   - Verify button becomes clickable with 5 cards
   - Verify button cannot be clicked multiple times

2. **Card Display**:
   - Check cards appear immediately on entering combat practice
   - Check cards appear for all three actions (Attack, Defend, Special)
   - Check flush cards appear correctly for Special practice

3. **Phase Transitions**:
   - Verify smooth transition from card selection to action selection
   - Verify cards are properly hidden/shown during transitions
   - Verify played hand displays correctly in center

4. **Action Execution** (NEW):
   - Verify Attack action completes and transitions to next section
   - Verify Defend action completes and transitions to next section
   - Verify Special action completes and transitions to next section
   - Verify appropriate success messages appear for each action
   - Verify no hanging on "Executing action..." message

## Build Status
✅ Build successful with no errors or warnings

## Summary
All seven issues in the Prologue Tutorial have been fixed:
1. ✅ Play Hand button now works correctly
2. ✅ Cards display reliably 
3. ✅ Action execution completes properly and transitions to next section
4. ✅ Special ability works with any hand (no flush requirement)
5. ✅ Played hand displays with actual card sprites instead of rectangles
6. ✅ Tutorial focuses on core mechanics without premature intent/buff/debuff displays
7. ✅ Phase 6 (Status Effects) and Phase 8 (Enemy Intents) removed; tutorial streamlined to 9 phases with updated progress indicators

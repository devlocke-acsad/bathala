# Implementation Plan: Tutorial Update for Status Effects & Elemental System

## Overview

This implementation plan integrates Phase6_StatusEffects into the tutorial to teach status effects and elemental affinities. The approach is to **add and enhance**, not replace existing code.

---

## Tasks

- [x] 1. Update TutorialManager to include Phase6_StatusEffects
  - Uncomment Phase6_StatusEffects import statement
  - Add Phase6_StatusEffects instantiation to phases array (between Phase5 and Phase7)
  - Update phaseNames array in showPhaseNavigation() to include "Status Effects & Elements"
  - Verify phase count is now 9 instead of 8
  - _Requirements: 5.1, 5.5, 9.3_

- [x] 2. Update progress indicators across all phases
  - Update Phase1_Welcome: change createProgressIndicator(scene, 1, 8) to (scene, 1, 9)
  - Update Phase2_UnderstandingCards: change to (scene, 2, 9)
  - Update Phase3_HandTypesAndBonuses: change to (scene, 3, 9)
  - Update Phase4_CombatActions: change to (scene, 4, 9)
  - Update Phase5_DiscardMechanic: change to (scene, 5, 9)
  - Update Phase7_Items: change from (scene, 6, 8) to (scene, 7, 9)
  - Update Phase9_MoralChoice: change from (scene, 7, 8) to (scene, 8, 9)
  - Update Phase10_AdvancedConcepts: change from (scene, 8, 8) to (scene, 9, 9)
  - _Requirements: 5.3_

- [x] 3. Update Phase6_StatusEffects Section 1 (Buffs Introduction)
  - Update progress indicator to createProgressIndicator(scene, 6, 9)
  - Update dialogue text to include accurate status effect descriptions:
    - 💪 Strength: +3 damage per stack
    - 🛡️ Plated Armor: Grants block at start of turn, reduces by 1
    - 💚 Regeneration: Heals HP at start of turn, reduces by 1
    - ✨ Ritual: Grants +1 Strength at end of turn
  - Update tip text to mention Earth Special granting Plated Armor
  - Remove references to non-existent status effects (Dexterity, generic Block)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Update Phase6_StatusEffects Section 2 (Debuffs Introduction)
  - Update progress indicator to createProgressIndicator(scene, 6, 9)
  - Update dialogue text with Burn vs Poison distinction:
    - 🔥 Burn: Player inflicts on enemies with Fire Special
    - ☠️ Poison: Enemies inflict on player
    - ⚠️ Weak: Reduces attack damage by 25% per stack
    - 🛡️💔 Vulnerable: Take 50% more damage from all sources
    - 🔻 Frail: Defend actions grant 25% less block per stack
  - Add clarification that Burn and Poison function identically
  - Remove non-existent status effects (STUN, SEAL)
  - Update info box to mention Fire Special applying Burn
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2_

- [x] 5. Add Phase6_StatusEffects Section 3 (Elemental Affinities)
  - Add showElementalAffinities() method to Phase6_StatusEffects class
  - Create progress indicator: createProgressIndicator(scene, 6, 9)
  - Create phase header: "Elemental Affinities" / "Exploit weaknesses, avoid resistances"
  - Add dialogue explaining:
    - Weakness: 1.5× damage
    - Resistance: 0.75× damage
    - Element symbols: 🔥💧🌿💨
  - Implement createAffinityExample() method to show visual example:
    - Display Tikbalang sprite
    - Show weakness indicator (🔥 Weak) in red
    - Show resistance indicator (💧 Resist) in blue
    - Add info text explaining the multipliers
  - Add 3500ms delay before transitioning to next section
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 6. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Setup
  - Add showInteractivePractice() method to Phase6_StatusEffects class
  - Create progress indicator: createProgressIndicator(scene, 6, 9)
  - Create phase header: "Practice: Status Effects" / "Apply Burn and exploit elemental weakness"
  - Add dialogue explaining the goal:
    - Face Tikbalang Scout
    - Use Fire Special to apply Burn
    - Tikbalang is weak to Fire (1.5× damage)
    - Select 5 Fire (Apoy) cards for maximum effect
  - Add transition to startBurnPractice() after 1500ms delay
  - _Requirements: 2.1, 2.2, 4.1_

- [ ] 7. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Combat Simulation
  - Implement startBurnPractice() method
  - Create enemy data from TIKBALANG_SCOUT with id 'tutorial_tikbalang_burn'
  - Implement createStatusEffectPracticeScene() method (similar to Phase4's createCombatScene):
    - Create player sprite (left side, 25% width)
    - Create enemy sprite (right side, 75% width)
    - Display player HP and block
    - Display enemy HP with elemental affinity indicators
    - Create played hand container (center, hidden initially)
    - Add instruction text: "Step 1: Select 5 cards, then click 'Play Hand'"
    - Add selection counter: "Selected: 0/5"
  - Set up card selection phase (combatPhase = 'card_selection')
  - Draw 8 cards using tutorialUI.drawHand(8)
  - _Requirements: 2.1, 4.1, 6.1_

- [ ] 8. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Card Selection
  - Implement card selection event listener (selectCard event)
  - Allow selecting up to 5 cards
  - Update selection counter as cards are selected/deselected
  - Create "Play Hand" button (disabled until 5 cards selected)
  - Enable button when 5 cards selected (set alpha to 1, make interactive)
  - Implement playHand() method to transition from card selection to action selection
  - Hide hand container, show played hand container with selected cards
  - Update instruction: "Step 2: Click 'Special' to execute your action"
  - _Requirements: 2.1, 6.1_

- [ ] 9. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Special Action Execution
  - Create action buttons container with only "Special" button
  - Implement performSpecialAction() method
  - Evaluate hand using HandEvaluator.evaluateHand(playedCards, 'special')
  - Calculate damage with elemental multiplier:
    - Get dominant element from cards
    - Apply 1.5× multiplier if Fire (Tikbalang weakness)
    - Show damage calculation breakdown
  - Apply Burn status effect to enemy (3 stacks)
  - Display Burn icon above enemy with stack count
  - Animate Fire Special effect (🔥 BURN text, scale and fade)
  - Show damage number floating up from enemy
  - Update enemy HP display
  - _Requirements: 2.2, 3.1, 4.1, 6.2, 6.3_

- [ ] 10. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Burn Trigger Simulation
  - After Special action completes, simulate enemy turn start
  - Display message: "Enemy's turn begins..."
  - Trigger Burn status effect:
    - Calculate damage (stacks × 2)
    - Show Burn icon pulsing/glowing
    - Display damage number from Burn
    - Update enemy HP
    - Reduce Burn stacks by 1
    - Update stack count display
  - Show success message explaining what happened
  - Add 2500ms delay before cleanup
  - _Requirements: 2.2, 4.2, 7.1, 7.2, 7.3_

- [ ] 11. Add Phase6_StatusEffects Section 4 (Interactive Practice) - Cleanup and Transition
  - Remove selectCard event listener
  - Fade out all combat elements (400ms)
  - Clean up containers and sprites
  - Call onComplete() to transition to Phase7_Items
  - Implement shutdown() method for proper cleanup:
    - Remove all event listeners
    - Kill all tweens
    - Destroy containers
  - _Requirements: 5.4, 9.5_

- [ ] 12. Add helper methods to Phase6_StatusEffects
  - Implement displayPlayedCards() method (reuse from Phase4)
  - Implement createCardSpriteForPlayed() method (reuse from Phase4)
  - Implement getEnemySpriteKey() method (reuse from Phase4)
  - Add proper TypeScript types for all methods
  - Add JSDoc comments for public methods
  - _Requirements: 8.1, 8.2_

- [ ] 13. Test Phase6 integration
  - Test Phase5 → Phase6 transition (smooth fade)
  - Test Phase6 → Phase7 transition (smooth fade)
  - Test all 4 sections display correctly in sequence
  - Test Burn vs Poison terminology is correct throughout
  - Test elemental affinity visual example displays correctly
  - Test interactive practice combat simulation works
  - Test card selection and Special action execution
  - Test Burn status effect application and trigger
  - Test elemental weakness multiplier calculation (1.5×)
  - Verify no console errors or warnings
  - _Requirements: All_

- [ ] 14. Test Skip Phase functionality
  - Test "Skip Phase" button works in Phase6
  - Test skipping Phase6 transitions correctly to Phase7
  - Test no memory leaks when skipping
  - Test no lingering event listeners after skip
  - Test no visual artifacts after skip
  - _Requirements: 9.1, 9.2_

- [ ] 15. Test Phase Navigation functionality
  - Test Phase Navigation menu shows Phase6 as "Status Effects & Elements"
  - Test jumping to Phase6 from navigation works correctly
  - Test Phase6 appears in correct position (between Phase5 and Phase7)
  - Test current phase highlighting works for Phase6
  - _Requirements: 9.3, 9.4_

- [ ] 16. Test visual consistency
  - Verify progress indicators show "6 of 9" in Phase6
  - Verify all other phases show correct "X of 9" format
  - Verify headers match style of other phases
  - Verify dialogue boxes use consistent formatting
  - Verify status effect icons display correctly (emojis render properly)
  - Verify elemental symbols display correctly (🔥💧🌿💨)
  - Verify color coding: buffs (green/blue), debuffs (red/orange)
  - _Requirements: 5.3, 6.1, 6.4, 6.5_

- [ ] 17. Test animation timing
  - Verify fade in timing matches other phases (500-700ms delay, 600ms fade)
  - Verify dialogue display timing (700ms delay)
  - Verify info box display time (1500-2000ms)
  - Verify section transitions (300ms fade out, 400ms fade in)
  - Verify status effect application animation (400ms)
  - Verify damage number float animation (1000ms)
  - _Requirements: 5.2, 6.2_

- [ ] 18. Test with actual game systems
  - Verify StatusEffectManager is used for status effect definitions
  - Verify ElementalAffinitySystem is used for multiplier calculations
  - Verify DamageCalculator is used for damage calculations (if applicable)
  - Verify actual enemy data from Act1Enemies.ts is used
  - Verify actual card textures are used (not placeholders)
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 19. Test edge cases and error handling
  - Test if StatusEffectManager not initialized (fallback to hardcoded descriptions)
  - Test if enemy sprite texture missing (fallback to placeholder)
  - Test if card textures missing (fallback to rectangles)
  - Test rapid clicking during transitions (prevent double-execution)
  - Test skipping during combat simulation (proper cleanup)
  - _Requirements: All (error handling)_

- [ ] 20. Final integration test
  - Complete full tutorial playthrough from Phase1 to Phase10
  - Verify Phase6 fits naturally in the flow
  - Verify no performance issues or lag
  - Verify tutorial completion message still works
  - Verify transition to Overworld scene works
  - Test "Skip Tutorial" button still works with Phase6 included
  - _Requirements: 5.1, 5.2, 5.4, 9.5_

- [ ] 21. Documentation and polish
  - Add code comments explaining Burn vs Poison distinction
  - Add JSDoc comments for all new methods
  - Update any relevant README or documentation files
  - Ensure console.log statements are removed or use proper logging
  - Verify no TODO or FIXME comments remain
  - _Requirements: All (documentation)_

---

## Notes

### Task Dependencies

- Task 1 must be completed before testing any Phase6 functionality
- Task 2 should be completed early to avoid confusion during testing
- Tasks 3-4 can be done in parallel (updating existing sections)
- Tasks 5-11 must be done sequentially (building Section 3 and 4)
- Task 12 can be done in parallel with tasks 5-11
- Tasks 13-20 are testing tasks that should be done after implementation
- Task 21 is final polish and can be done last

### Code Reuse

- Reuse combat simulation structure from Phase4_CombatActions
- Reuse card display methods from Phase4_CombatActions
- Reuse UI components (createPhaseHeader, createProgressIndicator, createInfoBox, showDialogue)
- Reuse enemy sprite handling from Phase4_CombatActions

### Critical Points

- **Burn vs Poison**: Always use correct terminology (Burn = player inflicts, Poison = enemy inflicts)
- **Progress Indicators**: Must update ALL phases to show "X of 9"
- **Cleanup**: Must properly remove event listeners and kill tweens
- **Visual Consistency**: Must match existing phase styling exactly
- **Integration Only**: Do NOT modify existing phases except for progress indicators

### Testing Priority

1. **High Priority**: Phase transitions, Burn vs Poison terminology, combat simulation
2. **Medium Priority**: Visual consistency, animation timing, skip functionality
3. **Low Priority**: Edge cases, error handling, documentation

### Success Criteria

- Phase6 appears between Phase5 and Phase7
- All 4 sections display correctly with accurate information
- Burn vs Poison distinction is clear and correct
- Interactive practice demonstrates status effects and elemental weakness
- No errors or visual glitches
- Smooth transitions to/from Phase6
- Tutorial completion still works correctly

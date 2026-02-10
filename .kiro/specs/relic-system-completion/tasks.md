# Implementation Plan: Relic System Completion

## Overview

This implementation plan ensures all relics function correctly across Acts 1-3 with proper effects, trigger conditions, and visual feedback. The approach is to **verify and enhance** existing RelicManager.ts implementation.

---

## Tasks

### Phase 1: Verification and Testing (Tasks 1-5)

- [x] 1. Audit RelicManager.ts implementation
  - Review all 20 Act 1 relic implementations in RelicManager.ts
  - Verify each relic has correct trigger point in RELIC_EFFECTS
  - Verify each relic has implementation in appropriate apply method
  - Check for any TODO or placeholder comments
  - Document any missing or incomplete implementations
  - _Requirements: 2.1-2.20_

- [x] 2. Verify Combat.ts integration points
  - Check if startCombat() calls RelicManager.applyStartOfCombatEffects()
  - Check if startPlayerTurn() calls RelicManager.applyStartOfTurnEffects()
  - Check if afterHandPlayed() calls RelicManager.applyAfterHandPlayedEffects()
  - Check if endPlayerTurn() calls RelicManager.applyEndOfTurnEffects()
  - Check if calculateAttackDamage() uses RelicManager damage calculators
  - Check if calculateDefendBlock() uses RelicManager block calculators
  - Check if calculateSpecialDamage() uses RelicManager special calculators
  - Document any missing integration points
  - _Requirements: 5.1-5.5_

- [x] 3. Create unit tests for all relics
  - Create test file: `bathala/src/core/managers/RelicManager.test.ts`
  - Write tests for START_OF_COMBAT relics (Earthwarden's Plate, Swift Wind Agimat, Diwata's Crown, Stone Golem Heart)
  - Write tests for START_OF_TURN relics (Ember Fetish, Earthwarden's Plate, Tiyanak Tear)
  - Write tests for AFTER_HAND_PLAYED relics (Ancestral Blade, Sarimanok Feather, Lucky Charm, Umalagad's Spirit, Balete Root)
  - Write tests for END_OF_TURN relics (Tidal Amulet)
  - Write tests for action-specific relics (Sigbin Heart, Duwende Charm, Mangangaway Wand, Amomongo Claw, Bungisngis Grin, Kapre's Cigar)
  - Write tests for passive relics (Tikbalang's Hoof, Babaylan's Talisman)
  - Write tests for multiple relic stacking
  - Run tests and verify all pass
  - _Requirements: 9.1-9.5_

- [x] 4. Create integration tests for combat scenarios
  - Create test file: `bathala/src/game/scenes/Combat.relic.test.ts`
  - Test start-of-combat relic triggers in actual combat
  - Test start-of-turn relic triggers across multiple turns
  - Test after-hand-played relics with different hand types
  - Test action-specific relics (Attack, Defend, Special)
  - Test relic combinations (multiple relics triggering together)
  - Test edge cases (no relics, all relics, duplicate relics)
  - Run tests and verify all pass
  - _Requirements: 9.1-9.5_

- [x] 5. Document test results and gaps
  - Create document: `bathala/RELIC_SYSTEM_TEST_RESULTS.md`
  - List all relics with test status (✅ Pass, ⚠️ Partial, ❌ Fail)
  - Document any bugs or issues found
  - Document any missing functionality
  - Create prioritized fix list
  - _Requirements: 9.1-9.5_

### Phase 2: Combat Integration (Tasks 6-10)

- [x] 6. Add missing Combat.ts integration points
  - In startCombat(): Add RelicManager.registerRelicModifiers(this.player)
  - In startCombat(): Add RelicManager.applyStartOfCombatEffects(this.player)
  - In startPlayerTurn(): Add RelicManager.applyStartOfTurnEffects(this.player) after status effects
  - In afterHandPlayed(): Add RelicManager.applyAfterHandPlayedEffects(this.player, hand, evaluation)
  - In endPlayerTurn(): Add RelicManager.applyEndOfTurnEffects(this.player)
  - Verify integration points are called in correct order
  - Test in actual combat to verify relics trigger
  - _Requirements: 1.1-1.5, 5.1-5.5_

- [~] 7. Integrate relic damage calculators
  - In calculateAttackDamage(): Add RelicManager.calculateSigbinHeartDamage(this.player)
  - In calculateAttackDamage(): Add RelicManager.calculateBungisngisGrinDamage(this.player, enemy)
  - In calculateAttackDamage(): Check RelicManager.shouldApplyKapresCigarDouble() for first attack
  - In calculateDefendBlock(): Add RelicManager.calculateDefendBlockBonus(this.player)
  - In calculateSpecialDamage(): Add RelicManager.calculateMangangawayWandDamage(this.player)
  - In applyAttackToEnemy(): Check RelicManager.shouldApplyAmomongoVulnerable() and apply
  - Test damage calculations with relics in combat
  - _Requirements: 2.13, 2.16, 2.17, 2.18, 2.19_

- [~] 8. Integrate relic block calculators
  - In calculateDefendBlock(): Ensure RelicManager.calculateDefendBlockBonus() is called
  - Verify Umalagad's Spirit (+4 Block on Defend) works
  - Verify Diwata's Crown (+3 Block on Defend) works
  - Verify Duwende Charm (+3 Block on Defend) works
  - Verify multiple Defend relics stack correctly
  - Test in combat with various Defend relic combinations
  - _Requirements: 2.4, 2.9, 2.14_

- [~] 9. Integrate special mechanics
  - Verify Babaylan's Talisman hand tier upgrade in HandEvaluator
  - Verify Diwata's Crown enables Five of a Kind in HandEvaluator
  - Verify Tikbalang's Hoof dodge chance in enemy attack resolution
  - Verify Kapre's Cigar first-attack-only logic (set combatScene.kapresCigarUsed flag)
  - Test each special mechanic in combat
  - _Requirements: 2.5, 2.9, 2.11, 2.18_

- [~] 10. Test all relics in actual combat
  - Create test combat scenario with each relic
  - Verify each relic triggers at correct time
  - Verify each relic applies correct effect
  - Verify visual feedback appears (if implemented)
  - Document any issues found
  - Fix any bugs discovered
  - _Requirements: All 2.x requirements_

### Phase 3: Visual Feedback (Tasks 11-15)

- [~] 11. Create relic trigger notification system
  - In CombatUI.ts: Add showRelicTrigger(relicName: string, effectText: string) method
  - Create notification container with relic name and effect
  - Add fade-in animation (300ms, Back.easeOut)
  - Hold notification for 1500ms
  - Add fade-out animation (400ms, move up 30px)
  - Style notification with gold border and dark background
  - Test notification appearance and timing
  - _Requirements: 5.1-5.5_

- [~] 12. Add relic trigger calls in Combat.ts
  - Create showRelicTriggers(triggerPoint: string) method in Combat.ts
  - Call showRelicTriggers("START_OF_COMBAT") after applyStartOfCombatEffects()
  - Call showRelicTriggers("START_OF_TURN") after applyStartOfTurnEffects()
  - Call showRelicTriggers("AFTER_HAND_PLAYED") after applyAfterHandPlayedEffects()
  - Call showRelicTriggers("END_OF_TURN") after applyEndOfTurnEffects()
  - Create getRelicEffectText(relic: Relic) helper method
  - Test notifications appear for all trigger points
  - _Requirements: 5.1-5.5_

- [~] 13. Add action-specific relic feedback
  - When Sigbin Heart triggers: Show "Sigbin Heart: +3 Damage"
  - When Mangangaway Wand triggers: Show "Mangangaway Wand: +5 Damage"
  - When Bungisngis Grin triggers: Show "Bungisngis Grin: +4 Damage"
  - When Kapre's Cigar triggers: Show "Kapre's Cigar: Double Damage!"
  - When Amomongo Claw triggers: Show "Amomongo Claw: Applied Vulnerable"
  - When Defend relics trigger: Show combined bonus (e.g., "+10 Block from Relics")
  - Test all action-specific notifications
  - _Requirements: 5.1-5.5_

- [~] 14. Enhance damage breakdown display
  - In CombatUI.ts: Update showDamageBreakdown() to include relic contribution
  - Add "Relics: +X" line to damage breakdown
  - Show which relics contributed to damage
  - Test damage breakdown with multiple damage relics
  - Verify breakdown is accurate
  - _Requirements: 5.5_

- [~] 15. Add floating text for stat changes
  - When Block increases from relic: Show "+X Block" floating text in blue
  - When Strength is gained from relic: Show "+X Strength" floating text in red
  - When HP is healed from relic: Show "+X HP" floating text in green
  - When Ginto is gained from relic: Show "+X Ginto" floating text in gold
  - Test floating text for all stat-changing relics
  - _Requirements: 5.2-5.4_

### Phase 4: Status Effect & Elemental Modifiers (Tasks 16-18)

- [~] 16. Implement status effect stack modifiers
  - In RelicManager.getStatusEffectStackBonus(): Add logic for relics that modify status stacks
  - Example: If a relic adds +1 to Poison applications, implement here
  - Verify StatusEffectManager.registerModifier() is called in registerRelicModifiers()
  - Test status effect stack modifications in combat
  - Verify modified stacks display correctly
  - _Requirements: 3.1-3.5_

- [~] 17. Implement elemental damage modifiers
  - In RelicManager.getElementalDamageBonus(): Add logic for relics that modify elemental damage
  - Example: If a relic adds +0.25× to Fire damage, implement here
  - Verify ElementalAffinitySystem.registerModifier() is called in registerRelicModifiers()
  - Test elemental damage modifications in combat
  - Verify modified multipliers display correctly
  - _Requirements: 4.1-4.5_

- [~] 18. Test modifier stacking
  - Test multiple relics affecting same status effect
  - Test multiple relics affecting same element
  - Verify bonuses stack additively (not multiplicatively)
  - Verify modifiers don't reduce values below 0
  - Document modifier stacking behavior
  - _Requirements: 3.2-3.3, 4.2-4.3_

### Phase 5: Relic Acquisition (Tasks 19-21)

- [~] 19. Verify relic acquisition effects
  - Test Stone Golem Heart: Verify +8 Max HP and +8 Current HP on acquisition
  - Test acquisition in Shop scene
  - Test acquisition in Treasure scene
  - Test acquisition in Event scene
  - Verify acquisition effects apply immediately
  - Verify visual feedback appears (if any)
  - _Requirements: 7.1-7.5_

- [~] 20. Add acquisition feedback
  - When Stone Golem Heart acquired: Show "+8 Max HP" notification
  - When combat-only relic acquired: Show "Active in Combat" message
  - Add relic acquisition animation (glow, scale up)
  - Test acquisition feedback in all scenes
  - _Requirements: 7.2_

- [~] 21. Test relic stacking on acquisition
  - Acquire same relic multiple times
  - Verify effects stack correctly
  - Verify tooltips show total effect
  - Test with Stone Golem Heart (should grant +8 HP each time)
  - Document stacking behavior
  - _Requirements: 8.1-8.5_

### Phase 6: Performance & Optimization (Tasks 22-24)

- [~] 22. Implement relic lookup caching
  - Add relicCache Map to RelicManager
  - Implement caching in getPlayerRelicsWithEffect()
  - Add clearCache() method
  - Call clearCache() at start of each combat
  - Measure performance improvement
  - _Requirements: 10.1-10.5_

- [~] 23. Optimize relic trigger execution
  - Ensure relics process in deterministic order
  - Measure execution time for each trigger point
  - Verify no trigger point takes >100ms
  - Optimize any slow relic effects
  - Document performance metrics
  - _Requirements: 10.2-10.3_

- [~] 24. Test performance with many relics
  - Test combat with 0 relics (baseline)
  - Test combat with 5 relics
  - Test combat with 10 relics
  - Test combat with 20 relics (all Act 1 relics)
  - Measure frame rate and lag
  - Verify no performance degradation
  - _Requirements: 10.1-10.5_

### Phase 7: Act 2-3 Preparation (Tasks 25-27)

- [~] 25. Design Act 2 relic system
  - Review Act 2 theme (Water/Fire)
  - Design 10 Act 2 relics with effects
  - Add Act 2 relics to RELIC_EFFECTS categorization
  - Document Act 2 relic mechanics
  - Ensure compatibility with existing system
  - _Requirements: 6.1-6.5_

- [~] 26. Design Act 3 relic system
  - Review Act 3 theme (Celestial)
  - Design 10 Act 3 relics with effects
  - Add Act 3 relics to RELIC_EFFECTS categorization
  - Document Act 3 relic mechanics
  - Ensure compatibility with existing system
  - _Requirements: 6.1-6.5_

- [~] 27. Test cross-act relic compatibility
  - Test Act 1 + Act 2 relic combinations
  - Test Act 1 + Act 3 relic combinations
  - Test Act 2 + Act 3 relic combinations
  - Test all three acts' relics together
  - Verify no conflicts or errors
  - Document any compatibility issues
  - _Requirements: 6.4-6.5_

### Phase 8: Documentation & Polish (Tasks 28-30)

- [~] 28. Create relic reference guide
  - Create document: `bathala/RELIC_REFERENCE_GUIDE.md`
  - List all Act 1 relics with full descriptions
  - Include trigger points and exact values
  - Add tips for relic synergies
  - Include screenshots of relic effects
  - _Requirements: All_

- [~] 29. Update code documentation
  - Add JSDoc comments to all RelicManager methods
  - Document trigger point system
  - Document modifier system
  - Add examples for common relic patterns
  - Ensure all public methods have documentation
  - _Requirements: All_

- [~] 30. Final integration test
  - Complete full game run with various relic combinations
  - Test all 20 Act 1 relics in actual gameplay
  - Verify no bugs or issues
  - Verify visual feedback is clear
  - Verify performance is acceptable
  - Document final test results
  - _Requirements: All_

---

## Task Dependencies

### Critical Path
1. Task 1 (Audit) → Task 2 (Verify Integration) → Task 6 (Add Integration)
2. Task 3 (Unit Tests) → Task 4 (Integration Tests) → Task 5 (Document Results)
3. Task 6 (Integration) → Task 7-9 (Specific Integrations) → Task 10 (Test All)
4. Task 10 (Test All) → Task 11-15 (Visual Feedback)
5. Task 15 (Visual) → Task 28-30 (Documentation)

### Parallel Work
- Tasks 3-4 can be done in parallel with Task 2
- Tasks 11-15 can be done in parallel with Tasks 16-18
- Tasks 25-26 can be done in parallel
- Tasks 28-29 can be done in parallel

---

## Testing Priority

### High Priority (Must Work)
1. Start of Combat relics (Earthwarden's Plate, Swift Wind Agimat, Diwata's Crown)
2. Damage relics (Sigbin Heart, Mangangaway Wand, Bungisngis Grin)
3. Block relics (Umalagad's Spirit, Duwende Charm, Diwata's Crown)
4. Strength relics (Ember Fetish, Tiyanak Tear, Ancestral Blade)

### Medium Priority (Important)
5. End of Turn relics (Tidal Amulet)
6. Special mechanics (Babaylan's Talisman, Tikbalang's Hoof, Kapre's Cigar)
7. Status effect relics (Amomongo Claw)
8. Resource relics (Sarimanok Feather, Lucky Charm)

### Low Priority (Nice to Have)
9. Acquisition effects (Stone Golem Heart)
10. Visual feedback polish
11. Performance optimization

---

## Success Criteria

- ✅ All 20 Act 1 relics trigger correctly in combat
- ✅ All relic effects apply correct values
- ✅ Visual feedback appears for all relic triggers
- ✅ Unit test coverage reaches 90%+
- ✅ Integration tests pass for all relics
- ✅ No performance issues with multiple relics
- ✅ System supports Act 2-3 relics without refactoring
- ✅ Documentation is complete and accurate

---

## Notes

### Implementation Strategy
- **Verify First**: Check existing implementation before adding new code
- **Test Early**: Write tests before fixing bugs
- **Integrate Carefully**: Add integration points one at a time
- **Visual Last**: Add visual feedback after functionality works

### Common Pitfalls
- Forgetting to call RelicManager methods in Combat.ts
- Not clearing relic cache between combats
- Applying relic effects in wrong order
- Not handling multiple copies of same relic
- Missing visual feedback for relic triggers

### Quick Wins
- Task 1-2: Audit and verify (2-3 hours, high value)
- Task 6: Add missing integration points (1-2 hours, critical)
- Task 10: Test all relics in combat (2-3 hours, validates everything)

---

**Estimated Total Effort:** 40-60 hours  
**Critical Path:** 20-30 hours  
**Parallel Work:** 20-30 hours

**Priority Order:**
1. Phase 1 (Verification) - Week 1
2. Phase 2 (Integration) - Week 2
3. Phase 3 (Visual Feedback) - Week 3
4. Phase 4-6 (Modifiers, Acquisition, Performance) - Week 4
5. Phase 7-8 (Act 2-3, Documentation) - Week 5

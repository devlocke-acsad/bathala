# Implementation Plan

- [x] 1. Create core status effect and elemental systems





  - Create StatusEffectManager class with status effect definitions and processing logic
  - Create ElementalAffinitySystem class with multiplier calculation methods
  - Define all 8 status effect types with their behaviors (Poison, Weak, Plated Armor, Regeneration, Strength, Vulnerable, Frail, Ritual)
  - Implement status effect stacking, expiration, and trigger timing logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 9.1, 9.5_

- [ ]* 1.1 Write property test for status effect data integrity
  - **Property 2: Status effect data integrity**
  - **Validates: Requirements 2.1**

- [ ]* 1.2 Write property test for status effect lifecycle
  - **Property 3: Status effect lifecycle correctness**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ]* 1.3 Write property test for status effect type limit
  - **Property 12: Status effect type limit**
  - **Validates: Requirements 8.1**

- [ ]* 1.4 Write property test for StatusEffectManager extensibility
  - **Property 14: StatusEffectManager extensibility**
  - **Validates: Requirements 9.1, 9.5**

- [x] 2. Update CombatTypes and data models





  - Add ElementalAffinity interface to CombatTypes.ts
  - Update Enemy interface to include elementalAffinity property
  - Update StatusEffect interface to match new format (stacks as value, remove duration)
  - Add StatusEffectTriggerResult interface for UI feedback
  - _Requirements: 1.1, 2.1_

- [ ]* 2.1 Write property test for enemy elemental affinity completeness
  - **Property 13: Enemy elemental affinity completeness**
  - **Validates: Requirements 1.1**

- [x] 3. Integrate elemental system into DamageCalculator





  - Add enemy parameter to DamageCalculator.calculate() method
  - Implement getDominantElement() method to find most common element in hand
  - Add elemental multiplier calculation step after DDA adjustments
  - Update DamageCalculation interface to include elementalMultiplier field
  - Add breakdown text for elemental multipliers
  - _Requirements: 1.2, 1.3, 1.4, 6.2, 7.2_

- [ ]* 3.1 Write property test for elemental damage multiplier correctness
  - **Property 1: Elemental damage multiplier correctness**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ]* 3.2 Write property test for damage calculation order
  - **Property 9: Damage calculation order**
  - **Validates: Requirements 6.2, 7.2**

- [x] 4. Update enemy definitions with elemental affinities





  - Add elementalAffinity property to all Act 1 common enemies (7 enemies)
  - Add elementalAffinity property to all Act 1 elite enemies (2 enemies)
  - Add elementalAffinity property to Act 1 boss (Mangangaway)
  - Use thematic assignments: Fire weak to Water/resist Earth, Water weak to Earth/resist Fire, Earth weak to Air/resist Water, Air weak to Fire/resist Air
  - _Requirements: 1.1, 1.5_

- [x] 5. Integrate status effects into Combat scene





  - Add StatusEffectManager.initialize() call in Combat.create()
  - Add status effect processing at start of player turn (call StatusEffectManager.processStatusEffects)
  - Add status effect processing at start of enemy turn
  - Add status effect cleanup at end of turn (reduce stacks, remove expired)
  - Update enemy attack pattern execution to apply status effects (strengthen, poison, weaken actions)
  - _Requirements: 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write property test for status effect processing order
  - **Property 5: Status effect processing order**
  - **Validates: Requirements 3.5, 8.4**

- [ ]* 5.2 Write property test for enemy status effect actions
  - **Property 6: Enemy status effect actions**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ] 6. Implement elemental Special action effects
  - Update Combat.performSpecialAction() to detect dominant element
  - Apply Poison (3 stacks) for Fire Special actions
  - Apply healing (8 HP) for Water Special actions
  - Apply Plated Armor (3 stacks) for Earth Special actions
  - Apply Weak (2 stacks) for Air Special actions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 6.1 Write property test for elemental Special action effects
  - **Property 4: Elemental Special action effects**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 7. Create status effect UI components
  - Create status effect container for player (above player sprite)
  - Create status effect container for enemy (above enemy sprite)
  - Implement status effect icon rendering with emoji and stack count
  - Implement status effect tooltip on hover (name, description, stacks)
  - Display status effects in consistent order (buffs first, then debuffs)
  - _Requirements: 2.5, 5.2, 5.4, 8.2_

- [ ]* 7.1 Write property test for status effect UI display completeness
  - **Property 7: Status effect UI display completeness**
  - **Validates: Requirements 2.5, 5.2, 5.4**

- [ ] 8. Add status effect visual feedback
  - Create floating text animation for status effect triggers (damage, healing, block)
  - Create visual animation for status effect application (fade in with icon)
  - Create visual indication for status effect expiration (fade out)
  - Add color coding: green/blue for buffs, red/orange for debuffs
  - _Requirements: 5.1, 5.3, 5.5_

- [ ] 9. Add elemental affinity UI indicators
  - Display enemy weakness icon using element symbol (🔥💧🌿💨)
  - Display enemy resistance icon using element symbol
  - Add tooltip on hover showing "Weak to [Element]" and "Resists [Element]"
  - Position indicators near enemy health bar
  - _Requirements: 1.5, 8.3_

- [ ] 10. Update enemy intent display for status effects
  - Modify enemy intent UI to show status effect icons
  - Display status effect name and stack count in intent tooltip
  - Update intent text to include status effect information
  - _Requirements: 4.5_

- [ ]* 11. Integrate with DDA system
  - Verify DDA stat adjustments preserve elemental affinities
  - Ensure elemental multipliers apply after DDA adjustments
  - Test that exploiting weaknesses doesn't trigger negative DDA
  - Update DDA display to show base and adjusted stats separately
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 11.1 Write property test for DDA and elemental affinity independence
  - **Property 8: DDA and elemental affinity independence**
  - **Validates: Requirements 6.1, 6.3**

- [ ]* 12. Add relic integration hooks
  - Add callback hooks in StatusEffectManager for relic modifications
  - Add callback hooks in ElementalAffinitySystem for relic modifications
  - Update RelicManager to support status effect and elemental damage modifiers
  - Implement additive stacking for multiple relics affecting same thing
  - Update relic descriptions to mention status effect/elemental interactions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 12.1 Write property test for relic status effect modification
  - **Property 10: Relic status effect modification**
  - **Validates: Requirements 7.1, 7.3**

- [ ]* 12.2 Write property test for relic effect stacking
  - **Property 11: Relic effect stacking**
  - **Validates: Requirements 7.5**

- [ ]* 13. Update existing status effects (Strength, Vulnerable)
  - Migrate existing Strength implementation to use StatusEffectManager
  - Migrate existing Vulnerable implementation to use StatusEffectManager
  - Ensure backward compatibility with existing relics and enemy abilities
  - Update DamageCalculator to use StatusEffectManager for Strength/Vulnerable
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 14. Add error handling and validation
  - Add validation for invalid status effect IDs (log warning, skip)
  - Add stack overflow protection (cap at maxStacks)
  - Add negative stack protection (set to 0, remove effect)
  - Add missing affinity fallback (default to 1.0× multiplier)
  - Add invalid element handling (treat as neutral)
  - Add NaN/overflow protection in damage calculations
  - _Requirements: All (error handling)_

- [ ]* 15. Performance optimization
  - Implement batch processing for status effects at turn boundaries
  - Add throttling for status effect UI updates
  - Cache dominant element calculation for hands
  - Use Map for status effect definition lookups
  - _Requirements: All (performance)_

- [ ]* 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 17. Update game balance
  - Test elemental multipliers (1.5×, 0.75×) for balance
  - Verify status effect values (Poison 2/stack, Plated Armor 3/stack, etc.)
  - Ensure Special action 0.6× modifier balances status effect application
  - Test enemy affinity distribution for fairness
  - Playtest several combats to verify difficulty feels appropriate
  - _Requirements: All (balance)_

- [ ]* 18. Documentation and polish
  - Update code comments for new systems
  - Add JSDoc documentation for public APIs
  - Update README with new combat mechanics
  - Create visual guide for status effects and elemental affinities
  - _Requirements: All (documentation)_

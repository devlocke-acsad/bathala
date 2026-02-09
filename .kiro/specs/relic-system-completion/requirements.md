# Requirements Document: Relic System Completion

## Introduction

This feature ensures all relics in Bathala function correctly across Acts 1-3 with proper effects, trigger conditions, and combat integration. Currently, RelicManager.ts has many relics defined but some effects may not be fully implemented or tested in actual combat scenarios.

## Glossary

- **Relic**: Permanent passive item that modifies combat mechanics
- **Trigger Point**: When a relic effect activates (start of combat, start of turn, after hand played, etc.)
- **Effect Type**: Category of relic effect (damage bonus, block bonus, status effect, etc.)
- **Stack Modifier**: Additive bonus to status effect applications
- **Elemental Modifier**: Additive bonus to elemental damage multipliers
- **Act-Specific Relic**: Relic only available in specific chapters

## Requirements

### Requirement 1: Core Relic Trigger System

**User Story:** As a player, I want all relics to trigger their effects at the correct times during combat, so that I can rely on their mechanics for strategic planning.

#### Acceptance Criteria

1. WHEN combat starts THEN all "START_OF_COMBAT" relics SHALL apply their effects before the first turn
2. WHEN a player's turn starts THEN all "START_OF_TURN" relics SHALL apply their effects before card selection
3. WHEN a player plays a hand THEN all "AFTER_HAND_PLAYED" relics SHALL apply their effects after hand evaluation
4. WHEN a player's turn ends THEN all "END_OF_TURN" relics SHALL apply their effects after all actions
5. WHEN a relic is acquired THEN its acquisition effect SHALL apply immediately

### Requirement 2: Act 1 Relic Functionality

**User Story:** As a player in Act 1, I want all Act 1 relics to work correctly with visible effects, so that I understand what each relic does.

#### Acceptance Criteria

1. WHEN I have Earthwarden's Plate THEN I SHALL start combat with +5 Block AND gain +1 Block at start of each turn
2. WHEN I have Swift Wind Agimat THEN I SHALL have +1 discard charge (4 total instead of 3)
3. WHEN I have Ember Fetish THEN I SHALL gain +2 Strength at start of turn if Block = 0, OR +1 Strength otherwise
4. WHEN I have Umalagad's Spirit THEN I SHALL gain +2 Block per card played AND Defend actions gain +4 Block
5. WHEN I have Babaylan's Talisman THEN my hand types SHALL be upgraded by one tier
6. WHEN I have Ancestral Blade AND play a Flush THEN I SHALL gain +2 Strength
7. WHEN I have Tidal Amulet THEN I SHALL heal +1 HP per card remaining in hand at end of turn
8. WHEN I have Sarimanok Feather AND play Straight or better THEN I SHALL gain +1 Ginto
9. WHEN I have Diwata's Crown THEN I SHALL start with +5 Block AND Defend actions gain +3 Block AND Five of a Kind is enabled
10. WHEN I have Lucky Charm AND play Straight or better THEN I SHALL gain +1 Ginto
11. WHEN I have Tikbalang's Hoof THEN I SHALL have 10% chance to dodge enemy attacks
12. WHEN I have Balete Root AND play Lupa cards THEN I SHALL gain +2 Block per Lupa card
13. WHEN I have Sigbin Heart THEN all Attack actions SHALL deal +3 damage
14. WHEN I have Duwende Charm THEN all Defend actions SHALL gain +3 Block
15. WHEN I have Tiyanak Tear THEN I SHALL gain +1 Strength at start of each turn
16. WHEN I have Amomongo Claw AND use Attack action THEN I SHALL apply 1 stack of Vulnerable to enemy
17. WHEN I have Bungisngis Grin AND enemy has any debuff THEN Attack actions SHALL deal +4 damage
18. WHEN I have Kapre's Cigar THEN my first Attack in combat SHALL deal double damage
19. WHEN I have Mangangaway Wand THEN all Special actions SHALL deal +5 damage
20. WHEN I have Stone Golem Heart THEN I SHALL have +8 Max HP permanently

### Requirement 3: Status Effect Stack Modifiers

**User Story:** As a player, I want relics that modify status effect stacks to work correctly, so that I can build synergistic strategies.

#### Acceptance Criteria

1. WHEN StatusEffectManager applies a status effect THEN it SHALL check for relic stack modifiers
2. WHEN a relic provides status effect stack bonus THEN the bonus SHALL be additive across multiple relics
3. WHEN multiple relics affect the same status effect THEN their bonuses SHALL stack correctly
4. WHEN a status effect is applied with relic modifiers THEN the modified stack count SHALL be displayed
5. WHEN a relic modifier would reduce stacks below 0 THEN stacks SHALL be capped at 0

### Requirement 4: Elemental Damage Modifiers

**User Story:** As a player, I want relics that modify elemental damage to work correctly, so that I can specialize in specific elements.

#### Acceptance Criteria

1. WHEN ElementalAffinitySystem calculates damage THEN it SHALL check for relic elemental modifiers
2. WHEN a relic provides elemental damage bonus THEN the bonus SHALL be additive to the base multiplier
3. WHEN multiple relics affect the same element THEN their bonuses SHALL stack correctly
4. WHEN elemental damage is calculated with relic modifiers THEN the modified multiplier SHALL be displayed
5. WHEN a relic modifier would reduce multiplier below 0 THEN multiplier SHALL be capped at 0

### Requirement 5: Combat Integration

**User Story:** As a player, I want to see clear visual feedback when relics trigger, so that I understand what's happening in combat.

#### Acceptance Criteria

1. WHEN a relic triggers THEN a visual indicator SHALL appear showing the relic name and effect
2. WHEN a relic grants Block THEN the Block value SHALL update with animation
3. WHEN a relic grants Strength THEN the Strength status effect SHALL appear with animation
4. WHEN a relic grants Ginto THEN the currency display SHALL update with animation
5. WHEN a relic modifies damage THEN the damage calculation breakdown SHALL show the relic contribution

### Requirement 6: Act 2-3 Relic Preparation

**User Story:** As a developer, I want the relic system to support Act 2-3 relics, so that new relics can be added without refactoring.

#### Acceptance Criteria

1. WHEN Act 2 relics are defined THEN they SHALL use the same trigger system as Act 1 relics
2. WHEN Act 3 relics are defined THEN they SHALL use the same trigger system as Act 1 relics
3. WHEN a new relic is added THEN it SHALL only require adding to RELIC_EFFECTS and implementing its switch case
4. WHEN relics from different acts are combined THEN they SHALL not conflict or cause errors
5. WHEN testing relics THEN the system SHALL support testing relics from any act

### Requirement 7: Relic Acquisition Effects

**User Story:** As a player, I want to see immediate effects when I acquire a relic, so that I know what changed.

#### Acceptance Criteria

1. WHEN I acquire Stone Golem Heart THEN my Max HP SHALL increase by 8 AND current HP SHALL increase by 8
2. WHEN I acquire a combat-only relic THEN I SHALL see a message explaining it will activate in combat
3. WHEN I acquire a relic in the Shop THEN the acquisition effect SHALL apply before leaving the shop
4. WHEN I acquire a relic from an Event THEN the acquisition effect SHALL apply immediately
5. WHEN I acquire a relic from a Treasure THEN the acquisition effect SHALL apply immediately

### Requirement 8: Relic Stacking and Limits

**User Story:** As a player, I want to understand how multiple copies of the same relic work, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN I have multiple copies of a relic THEN their effects SHALL stack additively
2. WHEN a relic has a unique effect (like Kapre's Cigar) THEN multiple copies SHALL not break the mechanic
3. WHEN a relic grants a status effect THEN multiple copies SHALL grant multiple stacks
4. WHEN a relic provides a percentage bonus THEN multiple copies SHALL add percentages (not multiply)
5. WHEN displaying relic effects THEN the tooltip SHALL show the total effect from all copies

### Requirement 9: Relic Testing and Validation

**User Story:** As a developer, I want comprehensive tests for all relics, so that I can ensure they work correctly.

#### Acceptance Criteria

1. WHEN running relic tests THEN each relic SHALL have at least one test case
2. WHEN testing a relic THEN the test SHALL verify the effect triggers at the correct time
3. WHEN testing a relic THEN the test SHALL verify the effect applies the correct values
4. WHEN testing relic combinations THEN the test SHALL verify effects stack correctly
5. WHEN a relic test fails THEN the error message SHALL clearly indicate which relic and condition failed

### Requirement 10: Performance and Optimization

**User Story:** As a player, I want relics to not cause lag or performance issues, so that combat remains smooth.

#### Acceptance Criteria

1. WHEN checking for relic effects THEN the system SHALL use efficient lookups (not iterate all relics every time)
2. WHEN multiple relics trigger simultaneously THEN they SHALL process in a deterministic order
3. WHEN a relic effect is complex THEN it SHALL complete within 100ms
4. WHEN displaying relic tooltips THEN they SHALL render without frame drops
5. WHEN saving game state THEN relic data SHALL serialize efficiently

## Technical Constraints

- Must maintain compatibility with existing RelicManager.ts structure
- Must use centralized RELIC_EFFECTS system for trigger categorization
- Must integrate with StatusEffectManager for status effect modifiers
- Must integrate with ElementalAffinitySystem for elemental modifiers
- Must integrate with DamageCalculator for damage calculations
- Must work across all three acts without code duplication
- Must support testing in isolation (unit tests) and integration (combat tests)

## Success Metrics

- All 20 Act 1 relics have verified functionality
- All relic trigger points execute correctly in combat
- Visual feedback appears for all relic effects
- No relic-related bugs in combat
- Relic system supports easy addition of Act 2-3 relics
- Test coverage for relics reaches 90%+

## Out of Scope

- Creating new relics beyond those already defined
- Relic sprite artwork (use existing or emoji fallbacks)
- Relic acquisition UI redesign (use existing systems)
- Relic synergy recommendations or AI suggestions

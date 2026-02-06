# Requirements Document: Tutorial Update for Status Effects & Elemental System

## Introduction

This feature updates the Bathala tutorial (Prologue scene) to teach players about the newly implemented status effect and elemental weakness/resistance systems. The tutorial currently has Phase6_StatusEffects commented out and needs to be reactivated with updated content that reflects the actual implemented mechanics from the combat-status-elemental-system spec.

**Important:** This is an **integration/addition** to the existing tutorial, not a complete revamp. We are reactivating and updating Phase6_StatusEffects to fit between Phase5_DiscardMechanic and Phase7_Items, while keeping all other phases intact.

## Glossary

- **Tutorial Phase**: A discrete section of the tutorial that teaches a specific concept
- **Phase6_StatusEffects**: The tutorial phase dedicated to teaching status effects (currently disabled, needs reactivation)
- **Status Effect**: A stackable buff or debuff that modifies combat behavior
- **Burn**: A debuff applied BY PLAYER to ENEMIES (via Fire Special) that deals damage at start of turn
- **Poison**: A debuff applied BY ENEMIES to PLAYER (via enemy poison actions) that deals damage at start of turn
- **Core Status Effects**: The 8 status effects - Poison/Burn, Weak, Plated Armor, Regeneration, Strength, Vulnerable, Frail, Ritual
- **Elemental Affinity**: Enemy-specific weakness (1.5× damage) and resistance (0.75× damage) to specific elements
- **Element**: One of four suits - Apoy (Fire), Tubig (Water), Lupa (Earth), Hangin (Air)
- **Special Action**: Combat action that applies elemental-specific status effects
- **TutorialManager**: The main class that orchestrates tutorial phases
- **TutorialPhase**: Base class for individual tutorial sections
- **Combat Simulation**: Interactive practice scenarios within the tutorial

## Requirements

### Requirement 1

**User Story:** As a new player, I want to learn about status effects during the tutorial, so that I understand how buffs and debuffs work before encountering them in real combat.

#### Acceptance Criteria

1. WHEN the tutorial reaches Phase 6 THEN the system SHALL display an introduction to status effects with clear explanations
2. WHEN explaining status effects THEN the system SHALL categorize them into buffs (beneficial) and debuffs (harmful)
3. WHEN showing a status effect THEN the system SHALL display its emoji icon, name, and a brief description of its behavior
4. WHEN teaching about status effects THEN the system SHALL explain the 8 core status effects: Burn (player inflicts on enemies), Poison (enemies inflict on player), Weak, Plated Armor, Regeneration, Strength, Vulnerable, Frail, and Ritual
5. WHEN explaining Burn vs Poison THEN the system SHALL clarify that Burn is what players inflict on enemies and Poison is what enemies inflict on players, but both deal damage at start of turn and reduce by 1 stack

### Requirement 2

**User Story:** As a new player, I want to practice using status effects in a safe tutorial environment, so that I can see how they work before facing real enemies.

#### Acceptance Criteria

1. WHEN the status effects phase begins THEN the system SHALL provide an interactive combat simulation where players can apply status effects
2. WHEN demonstrating Burn THEN the system SHALL show how Fire Special actions apply 3 stacks of Burn to ENEMIES that deal damage at enemy's turn start
3. WHEN demonstrating Plated Armor THEN the system SHALL show how Earth Special actions grant 3 stacks that provide block at turn start
4. WHEN demonstrating Weak THEN the system SHALL show how Air Special actions apply 2 stacks that reduce enemy attack damage
5. WHEN demonstrating Water healing THEN the system SHALL show how Water Special actions heal 8 HP immediately (direct healing, not a status effect)

### Requirement 3

**User Story:** As a new player, I want to learn about elemental weaknesses and resistances, so that I can make strategic decisions about which elements to use against different enemies.

#### Acceptance Criteria

1. WHEN the tutorial introduces elemental affinities THEN the system SHALL explain that each enemy has one weakness (1.5× damage) and one resistance (0.75× damage)
2. WHEN showing enemy information THEN the system SHALL display visual indicators (element symbols: 🔥💧🌿💨) for weakness and resistance
3. WHEN explaining elemental strategy THEN the system SHALL demonstrate how exploiting weaknesses deals significantly more damage
4. WHEN teaching about elements THEN the system SHALL clarify that elemental multipliers apply after all other damage calculations
5. WHEN displaying elemental affinities THEN the system SHALL use tooltips or info boxes to explain what each symbol means

### Requirement 4

**User Story:** As a new player, I want to see how status effects and elemental affinities work together, so that I understand the full strategic depth of the combat system.

#### Acceptance Criteria

1. WHEN teaching advanced mechanics THEN the system SHALL demonstrate using elemental Special actions to apply status effects while exploiting weaknesses
2. WHEN showing enemy turns THEN the system SHALL demonstrate how enemies can apply Poison to the player (not Burn - Burn is what players inflict on enemies)
3. WHEN explaining turn order THEN the system SHALL clarify that status effects trigger at start of turn before actions, then reduce at end of turn
4. WHEN demonstrating status effect interactions THEN the system SHALL show how multiple status effects can be active simultaneously
5. WHEN teaching strategy THEN the system SHALL provide tips on when to prioritize applying status effects versus dealing direct damage

### Requirement 5

**User Story:** As a new player, I want the tutorial to integrate seamlessly with existing phases, so that the learning experience feels cohesive and well-paced.

#### Acceptance Criteria

1. WHEN Phase6_StatusEffects is reactivated THEN the system SHALL insert it between Phase5_DiscardMechanic and Phase7_Items WITHOUT modifying other phases
2. WHEN transitioning between phases THEN the system SHALL use consistent visual transitions (fade in/out) matching other phases
3. WHEN displaying Phase 6 THEN the system SHALL show "Phase 6 of 9" in the progress indicator (adjusting total from 8 to 9)
4. WHEN Phase 6 completes THEN the system SHALL cleanly transition to Phase7_Items without errors
5. WHEN updating TutorialManager THEN the system SHALL only uncomment and update Phase6_StatusEffects import/instantiation, leaving all other phases unchanged

### Requirement 6

**User Story:** As a new player, I want clear visual feedback during status effect demonstrations, so that I can easily understand what's happening.

#### Acceptance Criteria

1. WHEN a status effect is applied THEN the system SHALL display a visual animation showing the effect icon appearing
2. WHEN a status effect triggers THEN the system SHALL show floating text with the effect's impact (damage dealt, block gained, etc.)
3. WHEN demonstrating elemental weaknesses THEN the system SHALL highlight the damage multiplier with distinct visual feedback (color, size, animation)
4. WHEN showing enemy affinities THEN the system SHALL use color-coded indicators (weakness in red/orange, resistance in blue/green)
5. WHEN multiple status effects are active THEN the system SHALL display them in a clear, organized layout (buffs first, then debuffs)

### Requirement 7

**User Story:** As a new player, I want the tutorial to explain status effect timing clearly, so that I understand when effects trigger and expire.

#### Acceptance Criteria

1. WHEN explaining status effect timing THEN the system SHALL distinguish between start-of-turn effects (Burn/Poison, Regeneration, Plated Armor, Ritual) and persistent effects (Strength, Weak, Vulnerable, Frail)
2. WHEN demonstrating turn flow THEN the system SHALL show the sequence: start-of-turn effects trigger → player action → end-of-turn cleanup (reduce stacks)
3. WHEN a status effect reaches 0 stacks THEN the system SHALL show it being removed with visual feedback
4. WHEN explaining Ritual THEN the system SHALL clarify it grants Strength at end of turn, creating a stacking buff over time
5. WHEN teaching about Burn vs Poison THEN the system SHALL emphasize they function identically (damage at start of turn, reduce by 1) but Burn is inflicted by players on enemies while Poison is inflicted by enemies on players

### Requirement 8

**User Story:** As a developer, I want the tutorial update to use the actual implemented status effect and elemental systems, so that the tutorial accurately reflects the real game mechanics.

#### Acceptance Criteria

1. WHEN demonstrating status effects THEN the system SHALL use the actual StatusEffectManager class and definitions
2. WHEN showing elemental affinities THEN the system SHALL use the actual ElementalAffinitySystem calculations
3. WHEN simulating combat THEN the system SHALL use the actual DamageCalculator with elemental multipliers
4. WHEN displaying enemy information THEN the system SHALL use actual enemy definitions from Act1Enemies.ts with their real elemental affinities
5. WHEN the tutorial completes THEN the system SHALL ensure players have seen all mechanics they will encounter in Act 1

### Requirement 9

**User Story:** As a new player, I want the option to skip the status effects phase if I'm already familiar with these mechanics, so that I can progress through the tutorial at my own pace.

#### Acceptance Criteria

1. WHEN Phase 6 is active THEN the system SHALL display the "Skip Phase" button (consistent with other phases)
2. WHEN the player clicks "Skip Phase" THEN the system SHALL cleanly transition to Phase 7 without errors
3. WHEN the player uses "Phase Navigation" THEN the system SHALL include Phase 6 in the phase list with the name "Status Effects & Elements"
4. WHEN jumping to Phase 6 from navigation THEN the system SHALL properly initialize the phase and display all content
5. WHEN the player skips the entire tutorial THEN the system SHALL still transition to the game correctly regardless of Phase 6's inclusion

## Technical Constraints

- Must maintain compatibility with existing TutorialPhase base class
- Must use existing UI components (createPhaseHeader, createProgressIndicator, createInfoBox, showDialogue)
- Must follow the same visual style and animation patterns as other phases
- **Must NOT modify existing phases** - only reactivate and update Phase6_StatusEffects
- **Must integrate cleanly** - only uncomment Phase6 import and add to phases array in TutorialManager
- Must use actual game systems (StatusEffectManager, ElementalAffinitySystem, DamageCalculator) rather than mock implementations
- Must handle cleanup properly to avoid memory leaks or lingering event listeners
- Must work with the existing TutorialUI class for card display and hand management
- Must correctly distinguish between Burn (player inflicts on enemies) and Poison (enemies inflict on player) in all text and demonstrations
- Must update progress indicators to show "X of 9" instead of "X of 8" where Phase 6 appears

## Success Metrics

- Players complete Phase 6 without confusion or errors
- Tutorial completion rate remains stable or improves after adding Phase 6
- Players demonstrate understanding of status effects in early Act 1 combats (measured by appropriate use of Special actions)
- No increase in tutorial-related bug reports after Phase 6 reactivation
- Phase transitions remain smooth with no visual glitches or performance issues

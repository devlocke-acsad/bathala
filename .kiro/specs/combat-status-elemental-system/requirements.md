# Requirements Document

## Introduction

This feature enhances the Bathala combat system by expanding status effects and introducing an elemental weakness system. The goal is to create deeper strategic gameplay where element choices matter beyond just damage bonuses, and where status effects create meaningful tactical decisions. This builds upon the existing poker-hand combat system while maintaining the game's balance and flow.

## Glossary

- **Combat System**: The turn-based card battle system where players form poker hands to execute actions
- **Status Effect**: A stackable buff or debuff that modifies combat behavior, similar to Slay the Spire
- **Poison**: A debuff that deals damage at the start of the affected creature's turn, then reduces by 1 stack
- **Weak**: A debuff that reduces Attack action damage by 25% per stack
- **Plated Armor**: A buff that provides block at the start of turn, then reduces by 1 stack
- **Regeneration**: A buff that heals HP at the start of turn, then reduces by 1 stack
- **Elemental Weakness**: A predefined vulnerability that an enemy has to one specific element (1.5× damage)
- **Elemental Resistance**: A predefined resistance that an enemy has to one specific element (0.75× damage)
- **Element**: One of four suits in the deck - Apoy (Fire), Tubig (Water), Lupa (Earth), Hangin (Air)
- **Action Type**: One of three combat actions - Attack, Defend, or Special
- **Enemy**: An opponent creature in combat with health, attack patterns, and predefined elemental affinities
- **Player**: The babaylan character controlled by the user with a deck of cards and status effects
- **DDA System**: Dynamic Difficulty Adjustment system that scales enemy stats based on player performance

## Requirements

### Requirement 1

**User Story:** As a player, I want enemies to have elemental weaknesses and resistances, so that my choice of which element to use in combat has strategic depth beyond just damage bonuses.

#### Acceptance Criteria

1. WHEN an enemy type is defined THEN the system SHALL include a predefined elemental affinity profile with one weakness and one resistance
2. WHEN a player deals damage with an element matching an enemy's weakness THEN the system SHALL apply a damage multiplier of 1.5× to that damage
3. WHEN a player deals damage with an element matching an enemy's resistance THEN the system SHALL apply a damage multiplier of 0.75× to that damage
4. WHEN a player deals damage with a neutral element for that enemy THEN the system SHALL apply no damage multiplier (1.0×)
5. WHEN displaying enemy information THEN the system SHALL show clear visual indicators for the enemy's elemental weakness and resistance using element symbols

### Requirement 2

**User Story:** As a player, I want to see clear and impactful status effects in combat similar to Slay the Spire, so that I understand their effects immediately and can make tactical decisions.

#### Acceptance Criteria

1. WHEN a status effect is applied to a creature THEN the system SHALL track the effect's name, stacks, and whether it is a buff or debuff
2. WHEN a creature's turn begins THEN the system SHALL process start-of-turn status effects (Poison, Regeneration) before any actions
3. WHEN a creature's turn ends THEN the system SHALL reduce temporary status effect stacks by one
4. WHEN a status effect reaches zero stacks THEN the system SHALL remove that status effect from the creature
5. WHEN displaying a creature's status THEN the system SHALL show all active status effects with their current stack count using clear icons

### Requirement 3

**User Story:** As a player, I want elemental Special actions to apply simple and clear status effects, so that I can build straightforward elemental strategies without confusion.

#### Acceptance Criteria

1. WHEN a player uses an Apoy (Fire) Special action THEN the system SHALL apply 3 stacks of Poison to the target enemy
2. WHEN a player uses a Tubig (Water) Special action THEN the system SHALL heal the player for 8 HP
3. WHEN a player uses a Lupa (Earth) Special action THEN the system SHALL grant the player 3 stacks of Plated Armor
4. WHEN a player uses a Hangin (Air) Special action THEN the system SHALL apply 2 stacks of Weak to the target enemy
5. WHEN processing status effects THEN the system SHALL apply them in a consistent order (start-of-turn effects, then action effects, then end-of-turn cleanup)

### Requirement 4

**User Story:** As a player, I want enemies to use status effects that match their thematic identity, so that different enemies require different tactical approaches and feel distinct.

#### Acceptance Criteria

1. WHEN an enemy's attack pattern includes a status effect action THEN the system SHALL apply the appropriate status effect based on the enemy's theme
2. WHEN an enemy uses a "strengthen" action THEN the system SHALL apply 2 stacks of Strength to that enemy
3. WHEN an enemy uses a "poison" action THEN the system SHALL apply 2 stacks of Poison to the player
4. WHEN an enemy uses a "weaken" action THEN the system SHALL apply 1 stack of Weak to the player
5. WHEN displaying enemy intent THEN the system SHALL show what status effects the enemy will apply on their next turn using clear icons

### Requirement 5

**User Story:** As a player, I want status effects to be clearly communicated through UI, so that I can make informed tactical decisions about which effects to prioritize.

#### Acceptance Criteria

1. WHEN a status effect is applied THEN the system SHALL display a visual animation showing the effect being applied
2. WHEN hovering over a status effect icon THEN the system SHALL display a tooltip with the effect's name, description, duration, and stack count
3. WHEN a status effect triggers THEN the system SHALL display floating text showing the effect's impact (damage dealt, healing applied, etc.)
4. WHEN multiple status effects are active THEN the system SHALL display them in a consistent order (buffs first, then debuffs)
5. WHEN a status effect expires THEN the system SHALL display a visual indication that the effect has ended

### Requirement 6

**User Story:** As a player, I want the elemental weakness system to integrate with the existing DDA system, so that difficulty adjustments remain fair and balanced.

#### Acceptance Criteria

1. WHEN the DDA system adjusts enemy stats THEN the system SHALL preserve the enemy's elemental affinity profile
2. WHEN calculating damage with elemental modifiers THEN the system SHALL apply elemental multipliers after DDA stat adjustments
3. WHEN an enemy is in a higher difficulty tier THEN the system SHALL not modify their elemental weaknesses or resistances
4. WHEN displaying enemy information THEN the system SHALL show both base stats and DDA-adjusted stats separately
5. WHEN the player exploits an elemental weakness consistently THEN the system SHALL not penalize this through DDA adjustments

### Requirement 7

**User Story:** As a player, I want relics to interact with the new status effect and elemental systems, so that I can build synergistic strategies around these mechanics.

#### Acceptance Criteria

1. WHEN a player has a relic that modifies status effects THEN the system SHALL apply the relic's modification when relevant status effects are applied
2. WHEN a player has a relic that modifies elemental damage THEN the system SHALL apply the relic's modification after elemental weakness/resistance calculations
3. WHEN a player has a relic that triggers on status effect application THEN the system SHALL trigger the relic effect at the appropriate time
4. WHEN displaying relic effects THEN the system SHALL clearly indicate how the relic interacts with status effects or elemental damage
5. WHEN multiple relics affect the same status effect or element THEN the system SHALL stack their effects additively

### Requirement 8

**User Story:** As a player, I want the combat system to remain simple and understandable despite new mechanics, so that I can focus on poker hand strategy without being overwhelmed.

#### Acceptance Criteria

1. WHEN viewing status effects THEN the system SHALL limit the total number of different status effect types to no more than 8
2. WHEN a status effect is displayed THEN the system SHALL use a single clear icon and number showing stacks
3. WHEN elemental affinities are shown THEN the system SHALL use simple symbols (one for weakness, one for resistance) without complex explanations
4. WHEN multiple mechanics interact THEN the system SHALL resolve them in a predictable, consistent order
5. WHEN introducing new status effects THEN the system SHALL ensure each effect has a single, clear purpose that is immediately understandable

### Requirement 9

**User Story:** As a developer, I want the status effect and elemental systems to be extensible, so that new effects and mechanics can be added easily in future updates.

#### Acceptance Criteria

1. WHEN defining a new status effect THEN the system SHALL support specifying the effect's type, stacking behavior, and trigger timing through a configuration object
2. WHEN defining a new enemy THEN the system SHALL support specifying elemental affinities through a simple weakness and resistance property
3. WHEN adding a new element THEN the system SHALL support defining that element's Special action status effect
4. WHEN creating a new relic THEN the system SHALL support hooking into status effect and elemental damage calculations through a callback system
5. WHEN the system processes status effects THEN the system SHALL use a centralized StatusEffectManager that can be extended with new effect types

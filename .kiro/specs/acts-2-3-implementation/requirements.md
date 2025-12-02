# Requirements Document

## Introduction

This document outlines the requirements for implementing Acts 2 and 3 (Chapters 2 and 3) in the Bathala game. Building upon the existing Act 1 foundation, these new acts will introduce water-focused and celestial-themed content with distinct visual identities, new enemies with simplified attack patterns, and expanded progression systems.

## Glossary

- **Act/Chapter**: A major story segment with unique enemies, relics, potions, and thematic elements
- **Enemy Data**: Configuration defining enemy stats, behaviors, attack patterns, and dialogue
- **Attack Pattern**: The sequence and logic determining enemy actions during combat
- **Relic**: Permanent passive items that modify gameplay mechanics
- **Potion**: Consumable items providing temporary benefits
- **Visual Distinction**: Color overlays or filters that differentiate chapter aesthetics
- **Dev Mode**: Debug interface for testing and navigation
- **Elemental Focus**: The primary elemental types emphasized in a chapter (Tubig/Apoy for Ch2, Multi-element for Ch3)
- **Combat System**: The existing turn-based poker-hand combat mechanics
- **Game State**: The persistent data tracking player progress, inventory, and chapter position

## Requirements

### Requirement 1

**User Story:** As a player, I want to progress through Chapter 2 (The Submerged Barangays), so that I can experience water-themed content and face new challenges.

#### Acceptance Criteria

1. WHEN the player completes Chapter 1 THEN the system SHALL unlock Chapter 2 progression
2. WHEN the player enters Chapter 2 THEN the system SHALL apply a visual distinction using color overlays or filters to differentiate it from Chapter 1
3. WHEN the player encounters Chapter 2 enemies THEN the system SHALL display appropriate lore-based dialogue for introduction, defeat, spare, and slay outcomes
4. WHEN the player defeats the Chapter 2 boss (Bakunawa) THEN the system SHALL unlock Chapter 3 progression
5. WHEN the player collects Chapter 2 relics or potions THEN the system SHALL persist these items in the player inventory

### Requirement 2

**User Story:** As a player, I want to progress through Chapter 3 (The Skyward Citadel), so that I can experience celestial-themed content and complete the game's story.

#### Acceptance Criteria

1. WHEN the player completes Chapter 2 THEN the system SHALL unlock Chapter 3 progression
2. WHEN the player enters Chapter 3 THEN the system SHALL apply a distinct visual overlay different from Chapters 1 and 2
3. WHEN the player encounters Chapter 3 enemies THEN the system SHALL display appropriate lore-based dialogue for all combat outcomes
4. WHEN the player defeats the Chapter 3 boss (False Bathala) THEN the system SHALL trigger the epilogue sequence
5. WHEN the player uses multi-element combos in Chapter 3 THEN the system SHALL apply appropriate damage calculations and synergies

### Requirement 3

**User Story:** As a player, I want to face enemies with clear and understandable attack patterns, so that I can strategize effectively without confusion.

#### Acceptance Criteria

1. WHEN an enemy takes a turn THEN the system SHALL execute one attack pattern from a simplified set of 2-4 possible actions
2. WHEN displaying enemy intent THEN the system SHALL show clear indicators of the upcoming action type and magnitude
3. WHEN an enemy uses a special ability THEN the system SHALL apply effects consistent with the enemy's thematic design
4. WHEN multiple enemies are present THEN the system SHALL execute their patterns in a predictable turn order
5. WHEN an elite or boss enemy acts THEN the system SHALL use more complex patterns while maintaining clarity

### Requirement 4

**User Story:** As a player, I want to collect chapter-specific relics and potions, so that I can build synergies with the chapter's elemental focus.

#### Acceptance Criteria

1. WHEN the player obtains a Chapter 2 relic THEN the system SHALL add it to the player's relic collection with appropriate Tubig/Apoy synergies
2. WHEN the player obtains a Chapter 3 relic THEN the system SHALL add it to the player's relic collection with multi-element synergies
3. WHEN the player uses a chapter-specific potion THEN the system SHALL apply the potion's effects according to its definition
4. WHEN displaying relic or potion information THEN the system SHALL show lore-inspired descriptions and mechanical effects
5. WHEN the player has multiple relics THEN the system SHALL correctly stack and apply all active relic effects

### Requirement 5

**User Story:** As a developer, I want debug controls to jump between chapters, so that I can efficiently test chapter-specific content.

#### Acceptance Criteria

1. WHEN dev mode is enabled THEN the system SHALL display navigation buttons for Chapters 1, 2, and 3
2. WHEN the developer clicks a chapter navigation button THEN the system SHALL transition the game state to that chapter
3. WHEN transitioning via dev mode THEN the system SHALL initialize appropriate chapter-specific variables and settings
4. WHEN in dev mode THEN the system SHALL preserve existing debug functionality for combat and DDA testing
5. WHEN dev mode is disabled THEN the system SHALL hide all debug navigation controls

### Requirement 6

**User Story:** As a developer, I want enemy data organized by chapter, so that I can maintain and extend content efficiently.

#### Acceptance Criteria

1. WHEN creating enemy definitions THEN the system SHALL organize them in chapter-specific data files
2. WHEN an enemy is loaded THEN the system SHALL retrieve all required properties including HP, attack patterns, dialogue, and elemental affinities
3. WHEN adding new enemies THEN the system SHALL follow the established data structure pattern from Act 1
4. WHEN enemies reference lore sources THEN the system SHALL include citation comments in the data definitions
5. WHEN the combat system requests enemy data THEN the system SHALL provide all necessary information for rendering and behavior

### Requirement 7

**User Story:** As a player, I want visual feedback that clearly indicates which chapter I'm in, so that I can track my story progression.

#### Acceptance Criteria

1. WHEN the player is in Chapter 1 THEN the system SHALL display the forest/earth color palette
2. WHEN the player is in Chapter 2 THEN the system SHALL apply a blue/teal overlay or filter suggesting underwater environments
3. WHEN the player is in Chapter 3 THEN the system SHALL apply a gold/purple overlay or filter suggesting celestial environments
4. WHEN transitioning between chapters THEN the system SHALL smoothly update the visual theme
5. WHEN displaying UI elements THEN the system SHALL maintain readability across all chapter color schemes

### Requirement 8

**User Story:** As a player, I want enemy encounters to scale appropriately across chapters, so that difficulty progression feels natural.

#### Acceptance Criteria

1. WHEN encountering Chapter 2 common enemies THEN the system SHALL initialize them with HP values between 15-40
2. WHEN encountering Chapter 2 elite enemies THEN the system SHALL initialize them with HP values between 68-85
3. WHEN encountering the Chapter 2 boss THEN the system SHALL initialize it with 150 HP
4. WHEN encountering Chapter 3 common enemies THEN the system SHALL initialize them with HP values between 22-38
5. WHEN encountering Chapter 3 elite enemies THEN the system SHALL initialize them with HP values between 45-85
6. WHEN encountering the Chapter 3 boss THEN the system SHALL initialize it with 200 HP

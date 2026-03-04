# Requirements Document

## Introduction

This feature enhances the visual presentation of the existing event system in Bathala by integrating creature "Discover" splash art (almanac art) for creature-based events. The enhancement aims to strengthen the game's visual identity and provide a more polished, immersive experience by replacing placeholder graphics with high-quality artwork that already exists in the game.

The current event system (Act1Events.ts) contains 10 events with rich narrative content but uses placeholder graphics. Meanwhile, the game has 30 high-quality "Discover" almanac splash art assets across three chapters that are currently only used in creature discovery contexts. This feature bridges that gap by displaying the appropriate creature artwork when events reference those creatures (e.g., Balete Root event should display the Balete almanac art).

## Glossary

- **Event_System**: The game system that presents narrative encounters to players during overworld exploration
- **Discover_Art**: High-quality splash art assets (almanac images) used to showcase creatures, stored in `/public/assets/sprites/discover/chapter[1-3]/`
- **Creature_Event**: An event that features or references a specific creature from the game's creature database
- **Event_Scene**: The Phaser scene class (EventScene) responsible for rendering and managing event interactions
- **Creature_Database**: The collection of creature configurations stored in `/src/data/enemies/creatures/`
- **Asset_Loader**: The system responsible for preloading and managing game assets in Phaser

## Requirements

### Requirement 1: Creature-to-Discover Art Mapping

**User Story:** As a player, I want to see beautiful creature artwork during events, so that I feel more immersed in the world and can visually connect events to the creatures I encounter.

#### Acceptance Criteria

1. WHEN an event references a creature from the Creature_Database, THE Event_System SHALL display that creature's Discover_Art as the event illustration
2. THE Event_System SHALL maintain a mapping between creature IDs and their corresponding Discover_Art asset paths
3. WHEN a creature has multiple variants (e.g., common vs elite), THE Event_System SHALL use the base creature's Discover_Art
4. THE Event_System SHALL support all 30 existing creatures with Discover_Art across chapters 1, 2, and 3
5. WHEN a Discover_Art asset fails to load, THE Event_System SHALL display a fallback placeholder without crashing

### Requirement 2: Event-Creature Association

**User Story:** As a developer, I want to easily associate events with creatures, so that the correct artwork is automatically displayed without manual asset management.

#### Acceptance Criteria

1. THE GameEvent interface SHALL include a creatureId field that references creatures in the Creature_Database
2. WHEN an event's creatureId is set, THE Event_Scene SHALL automatically resolve and display the corresponding Discover_Art
3. THE Event_System SHALL validate that creatureId values match existing creatures in the Creature_Database
4. WHEN an invalid creatureId is provided, THE Event_System SHALL log a warning and use fallback artwork
5. THE Event_System SHALL support events that reference multiple creatures by accepting an array of creatureId values

### Requirement 3: Asset Loading and Preloading

**User Story:** As a player, I want events to load smoothly without delays, so that my gameplay experience is not interrupted by loading screens.

#### Acceptance Criteria

1. THE Asset_Loader SHALL preload all Discover_Art assets during the initial game load or act transition
2. WHEN entering an Event_Scene, THE Event_System SHALL use already-loaded Discover_Art assets without additional loading time
3. THE Asset_Loader SHALL organize Discover_Art assets by chapter for efficient memory management
4. WHEN transitioning between acts, THE Asset_Loader SHALL unload unused chapter assets and load new chapter assets
5. THE Asset_Loader SHALL provide loading progress feedback for Discover_Art assets during preload phases

### Requirement 4: Updating Existing Events with Creature Art

**User Story:** As a player, I want existing events to feel more polished and visually engaging, so that I enjoy the game's narrative encounters.

#### Acceptance Criteria

1. THE Event_System SHALL identify which existing Act 1 events reference creatures in their narratives
2. WHEN an existing event is updated with a creatureId, THE Event_System SHALL display the appropriate Discover_Art
3. THE Event_System SHALL maintain backward compatibility with events that do not have creatureId associations
4. THE Event_System SHALL update existing Act 1 events that explicitly mention creature names (tikbalang, diwata, kapre, tiyanak, balete, etc.)
5. FOR ALL updated events, the creature artwork SHALL match the creature referenced in the event narrative

### Requirement 5: Event Scene UI Improvements

**User Story:** As a player, I want event artwork to be displayed properly and attractively, so that the visual presentation enhances my experience.

#### Acceptance Criteria

1. WHEN displaying Discover_Art in an event, THE Event_Scene SHALL scale and position the artwork appropriately
2. THE Event_Scene SHALL add visual styling (borders, frames, shadows) to make artwork presentation polished
3. WHEN Discover_Art is displayed, THE Event_Scene SHALL ensure text remains readable and well-positioned
4. THE Event_Scene SHALL maintain consistent visual layout between events with and without creature artwork
5. THE Event_Scene SHALL ensure artwork does not obscure important UI elements (choices, text, buttons)

### Requirement 6: Discover Art Integration Architecture

**User Story:** As a developer, I want the Discover art integration to be maintainable and extensible, so that adding new creatures and events is straightforward.

#### Acceptance Criteria

1. THE Event_System SHALL use a centralized mapping function to resolve creature IDs to Discover_Art paths
2. WHEN a new creature is added to the Creature_Database, THE Event_System SHALL automatically support using its Discover_Art in events
3. THE Discover_Art path resolution SHALL follow the existing naming convention: `{creature_name}_almanac.png`
4. THE Event_System SHALL support Discover_Art from all three chapters without hardcoding paths
5. THE Event_System SHALL provide helper functions for developers to easily create creature-associated events

### Requirement 7: Testing and Validation

**User Story:** As a developer, I want to ensure the event system works correctly, so that players have a bug-free experience.

#### Acceptance Criteria

1. THE Event_System SHALL validate all creatureId references against the Creature_Database at initialization
2. WHEN an event is loaded, THE Event_System SHALL verify that required assets (Discover_Art or imageKey) are available
3. THE Event_System SHALL log warnings for events with missing or invalid asset references
4. THE Event_System SHALL handle edge cases gracefully (missing assets, invalid IDs, null references) without crashing
5. FOR ALL existing events, backward compatibility SHALL be maintained and verified through testing


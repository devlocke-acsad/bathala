# Requirements Document

## Introduction

This document specifies the requirements for refactoring the Bathala game from a data-driven architecture to an Object-Oriented Programming (OOP) class-based architecture. The current system uses plain objects, interfaces, utility functions, and ContentPool-based data management. Recent architectural improvements (February 2026) established single-source-of-truth patterns for relics and enemies through data-driven composition and ContentPools. The refactored system will build upon these improvements by introducing proper class hierarchies with inheritance, abstraction, and encapsulation, while preserving the benefits of the existing pool-based architecture.

**Current Architecture Context:**
- 40 relics defined as plain objects with enriched metadata (lore, spriteKey)
- 30 enemies (10 per act) defined as EnemyConfig objects
- ContentPool<T> system for managing relics and enemies by category
- Data-driven sprite resolution and lore management
- Combat/Overworld scenes are large monolithic files (Combat.ts, Overworld.ts)
- Utility functions for damage calculation, hand evaluation, and deck management

## Glossary

- **Entity**: Any game object that participates in gameplay (NPCs, Enemies, Players, Items, Relics, Scenes)
- **Class_Hierarchy**: A tree structure of classes where child classes inherit from parent classes
- **Single_Source_Of_Truth**: A design pattern where each piece of data has exactly one authoritative definition
- **Encapsulation**: Bundling data and methods that operate on that data within a single class
- **Inheritance**: Mechanism where a child class derives properties and methods from a parent class
- **Data_Pool**: Current system's ContentPool<T> for managing collections of entities by category
- **Combat_Entity**: Any entity that participates in combat (Player, Enemy)
- **Game_Scene**: A distinct phase or screen in the game (Combat, Overworld, Shop, etc.)
- **Relic**: A permanent item that modifies gameplay mechanics (currently plain objects with metadata)
- **Status_Effect**: A temporary buff or debuff applied to combat entities
- **Elemental_Affinity**: An entity's weakness and resistance to elemental damage types
- **ContentPool**: Generic pool system for managing categorized content (relics, enemies)
- **Factory_Method**: A method that creates and returns instances of classes
- **Phaser_Scene**: Base class from Phaser game framework that all game scenes extend

## Requirements

## Class Focus: Meaning, Impact, Actions

### What “Classes” Mean Here

Classes are the authoritative definitions for gameplay entities. A class owns the data and the behavior of that entity and is the single source of truth for runtime instances. This refactor replaces plain objects and loose utility functions with class hierarchies that expose clear APIs and encapsulate state changes.

### What Is Affected

- **Enemy data and selection**: EnemyConfig + ActXEnemies arrays transition to Enemy subclasses and class registries/factories.
- **Sprite resolution and tooltips**: All sprite/lore lookup moves to class-backed registries to remove name parsing.
- **Overworld → Combat handoff**: Node enemy identifiers transition to config IDs, requiring class-based lookup by ID.
- **Relics and potions**: Plain object relics/potions become class instances; effect logic migrates into class methods.
- **Managers and pools**: Managers must accept/return class instances; ContentPool stores class instances or templates.
- **Scenes and systems**: Monolithic scenes delegate to class-based systems for combat logic, selection, and UI lookup.
- **Save data**: Serialization/deserialization must store class IDs and support legacy name migration.

### What To Do (Implementation Focus)

1. **Define base classes**: Create abstract `NPC`, `CombatEntity`, `Item`, and `GameScene` classes with shared properties and abstract hooks.
2. **Implement concrete classes**: Create `Enemy`, `Player`, `Relic`, and `Potion` classes with typed fields and behavior methods.
3. **Create registries and factories**: Build `EnemyRegistry/EnemyFactory` and `ItemFactory` to create instances and centralize lookups.
4. **Replace data sources**: Move enemy/relic/potion data into class definitions; retire duplicate plain-object configs.
5. **Update selection systems**: Rewire enemy selection to use class registries and ID-based lookups.
6. **Migrate sprite/lore lookups**: Centralize in registries; remove name-based parsing from UI/world systems.
7. **Update pools**: Register class instances or templates in ContentPools; preserve pool API and clone behavior.
8. **Adjust serialization**: Store class IDs in save data; add migration for legacy display-name identifiers.
9. **Validate assets**: Ensure sprite keys declared by classes are preloaded and validated at startup.

### Requirement 1: NPC and Enemy Class Hierarchy

**User Story:** As a game developer, I want a proper class hierarchy for NPCs and enemies, so that common behavior is inherited and entity definitions serve as the single source of truth.

#### Acceptance Criteria

1. THE System SHALL define an abstract NPC base class with common properties (id, name, health, position)
2. THE System SHALL define an Enemy class that extends NPC with combat-specific properties (damage, attackPattern, elementalAffinity)
3. WHEN an enemy subclass is defined (e.g., TikbalangScout extends Enemy), THE System SHALL inherit all parent properties and methods
4. WHEN a property is changed in an enemy class definition, THE System SHALL reflect that change throughout the entire game automatically
5. THE System SHALL replace the current EnemyConfig interface and data pool pattern with class instances
6. THE System SHALL maintain all 30 existing enemies (10 per act) as class definitions
7. THE System SHALL preserve existing enemy behavior (attack patterns, status effects, elemental affinities)
8. THE System SHALL include explicit combat and overworld sprite keys in enemy class definitions
9. THE System SHALL preserve the existing enemy dialogue fields (intro, defeat, spare, slay) in class definitions
10. THE System SHALL preserve existing enemy lore fields (description, origin, reference) in class definitions
11. THE System SHALL provide an ID-based lookup for enemies that does not depend on display name parsing
12. THE System SHALL support cross-chapter enemy lookup for narrative or debug scenarios

### Requirement 2: Player Class Implementation

**User Story:** As a game developer, I want a Player class that encapsulates player state and behavior, so that player-related logic is centralized and maintainable.

#### Acceptance Criteria

1. THE System SHALL define a Player class that extends CombatEntity
2. THE System SHALL encapsulate player-specific properties (deck, hand, discardPile, relics, potions, ginto, diamante)
3. THE System SHALL encapsulate player-specific methods (drawCard, playCard, gainRelic, usePotion)
4. WHEN player state changes (e.g., health, relics), THE System SHALL update all UI elements automatically
5. THE System SHALL maintain a single Player instance throughout a game session
6. THE System SHALL preserve existing player mechanics (card management, resource tracking, educational progress)

### Requirement 3: Item and Relic Class Hierarchy

**User Story:** As a game developer, I want classes for items and relics, so that item definitions serve as the single source of truth and item behavior is encapsulated.

#### Acceptance Criteria

1. THE System SHALL define an abstract Item base class with common properties (id, name, description, emoji, lore, spriteKey)
2. THE System SHALL define a Relic class that extends Item with relic-specific properties (effectType, triggerCondition)
3. THE System SHALL define a Potion class that extends Item with potion-specific properties (uses, effect)
4. WHEN a relic's name or description is changed in its class definition, THE System SHALL reflect that change in all UI displays automatically
5. THE System SHALL preserve the existing ContentPool<Relic> architecture for relic management
6. THE System SHALL maintain all 40 existing relics as class instances (not plain objects)
7. THE System SHALL encapsulate relic effect logic within the Relic class (e.g., onCombatStart, onTurnStart, onHandPlayed methods)
8. THE System SHALL preserve existing relic metadata (lore, spriteKey) established in the February 2026 refactor
9. THE System SHALL preserve all potion metadata (lore, spriteKey) established in the February 2026 refactor
10. THE System SHALL provide a shared item display interface for UI panels (name, description, lore, spriteKey)

### Requirement 4: Scene Class Architecture

**User Story:** As a game developer, I want a proper class hierarchy for game scenes, so that scene behavior is organized and common functionality is inherited.

#### Acceptance Criteria

1. THE System SHALL define an abstract GameScene base class that extends Phaser.Scene
2. THE System SHALL define scene subclasses (CombatScene, OverworldScene, ShopScene) that extend GameScene
3. THE System SHALL encapsulate scene-specific logic within each scene class
4. THE System SHALL break down monolithic scene files into smaller, focused classes
5. WHEN a scene is instantiated, THE System SHALL initialize all required entities and managers
6. THE System SHALL preserve existing scene functionality (combat flow, overworld navigation, shop interactions)
7. THE System SHALL preserve the existing overworld-combat handoff data (node selection, enemy selection, rewards)
8. THE System SHALL keep sprite resolution outside of scene classes, delegated to centralized lookup utilities or managers

### Requirement 5: Encapsulation of Behavior

**User Story:** As a game developer, I want entity behavior encapsulated within classes, so that related logic is co-located and easier to maintain.

#### Acceptance Criteria

1. WHEN an Enemy class is defined, THE System SHALL include methods for combat behavior (attack, defend, applyStatusEffect)
2. WHEN a Relic class is defined, THE System SHALL include methods for effect application (activate, deactivate, trigger)
3. WHEN a Player class is defined, THE System SHALL include methods for player actions (playHand, usePotion, rest)
4. THE System SHALL move utility functions into appropriate class methods (e.g., DamageCalculator methods into CombatEntity)
5. THE System SHALL eliminate standalone utility functions where behavior belongs to a specific entity type
6. THE System SHALL centralize enemy selection logic in a dedicated system class (chapter-aware selection)
7. THE System SHALL eliminate enemy name parsing for sprite resolution in combat and overworld

### Requirement 6: Single Source of Truth

**User Story:** As a game developer, I want class definitions to be the single source of truth, so that changes propagate automatically without manual updates.

#### Acceptance Criteria

1. WHEN an enemy's maxHealth is changed in its class definition, THE System SHALL use that value in all combat encounters automatically
2. WHEN a relic's description is changed in its class definition, THE System SHALL display the updated text in all UI contexts automatically
3. WHEN a status effect's value is changed in its class definition, THE System SHALL apply the updated value in combat automatically
4. THE System SHALL eliminate duplicate definitions of the same entity across multiple files
5. THE System SHALL use class constructors or factory methods to create entity instances
6. THE System SHALL reference class definitions directly rather than copying data into plain objects
7. THE System SHALL store and use enemy IDs (not display names) as the canonical identifier in overworld node data
8. THE System SHALL provide backward-compatible lookups for legacy display-name identifiers
9. THE System SHALL keep sprite keys defined only in enemy class definitions

### Requirement 7: Backward Compatibility

**User Story:** As a game developer, I want the refactored system to maintain existing gameplay, so that no features are lost during the transition.

#### Acceptance Criteria

1. THE System SHALL preserve all existing combat mechanics (poker hands, damage calculation, status effects)
2. THE System SHALL preserve all existing enemy behaviors (attack patterns, elemental affinities, dialogue)
3. THE System SHALL preserve all existing relic effects (40 relics with correct behavior)
4. THE System SHALL preserve all existing scene functionality (combat, overworld, shop, events)
5. THE System SHALL maintain compatibility with existing save data structures
6. THE System SHALL pass all existing unit tests and integration tests
7. THE System SHALL provide a migration path for save data that stores enemy display names
8. THE System SHALL preserve existing sprite asset keys and loading behavior

### Requirement 8: Manager Integration

**User Story:** As a game developer, I want managers to work with class instances, so that the OOP architecture is consistent throughout the system.

#### Acceptance Criteria

1. WHEN RelicManager manages relics, THE System SHALL work with Relic class instances
2. WHEN StatusEffectManager manages status effects, THE System SHALL work with StatusEffect class instances
3. WHEN GameState tracks the player, THE System SHALL work with the Player class instance
4. THE System SHALL update manager interfaces to accept and return class instances
5. THE System SHALL preserve existing manager functionality (relic effects, status effect processing, game state persistence)
6. THE System SHALL provide a centralized enemy manager or registry for ID-based lookups
7. THE System SHALL expose sprite lookup methods from the centralized enemy manager/registry

### Requirement 9: Factory Pattern for Entity Creation

**User Story:** As a game developer, I want factory methods for creating entities, so that entity instantiation is centralized and consistent.

#### Acceptance Criteria

1. THE System SHALL define factory methods for creating enemy instances (e.g., EnemyFactory.createTikbalangScout())
2. THE System SHALL define factory methods for creating relic instances (e.g., RelicFactory.createEarthwardensPlate())
3. THE System SHALL define factory methods for creating potion instances (e.g., PotionFactory.createHealthPotion())
4. WHEN a factory method is called, THE System SHALL return a properly initialized class instance
5. THE System SHALL integrate factories with existing ContentPool architecture
6. THE System SHALL maintain act-specific factories (Act1EnemyFactory, Act2EnemyFactory, Act3EnemyFactory)
7. THE System SHALL preserve the existing pool registration pattern (pool.register('category', items))
8. THE System SHALL consolidate any duplicate or legacy EnemyFactory implementations

### Requirement 10: Type Safety and Abstraction

**User Story:** As a game developer, I want proper abstraction and type safety, so that the codebase is robust and maintainable.

#### Acceptance Criteria

1. THE System SHALL use abstract classes for base types (NPC, Item, GameScene)
2. THE System SHALL use abstract methods for behavior that must be implemented by subclasses
3. THE System SHALL use TypeScript access modifiers (public, protected, private) appropriately
4. THE System SHALL use interfaces for contracts that multiple unrelated classes implement
5. THE System SHALL maintain strong typing throughout the class hierarchy
6. THE System SHALL eliminate use of 'any' type where specific types can be defined


### Requirement 11: ContentPool Integration

**User Story:** As a game developer, I want the OOP architecture to integrate seamlessly with the existing ContentPool system, so that the benefits of both patterns are preserved.

#### Acceptance Criteria

1. THE System SHALL maintain the existing ContentPool<T> generic class for managing entity collections
2. WHEN class instances are created, THE System SHALL register them in appropriate ContentPools
3. THE System SHALL preserve the existing pool API (register, random, get, category, all)
4. THE System SHALL support both per-act pools (Act1Relics, Act2Relics) and master pools (AllRelics)
5. THE System SHALL maintain the existing pool dictionary pattern (RelicPoolsByAct, EnemyPoolsByAct)
6. THE System SHALL ensure ContentPool.random() returns class instances (not plain objects)
7. THE System SHALL preserve the shallow clone pattern ({ ...item }) for pool items
8. THE System SHALL provide pools for enemies per act using class definitions as the source of truth

### Requirement 12: Utility Function Migration

**User Story:** As a game developer, I want utility functions migrated to appropriate class methods, so that behavior is co-located with data.

#### Acceptance Criteria

1. THE System SHALL migrate DamageCalculator utility functions to CombatEntity class methods
2. THE System SHALL migrate HandEvaluator utility functions to Player class methods
3. THE System SHALL migrate DeckManager utility functions to Player class methods
4. WHEN utility functions are migrated, THE System SHALL preserve existing function signatures for backward compatibility
5. THE System SHALL maintain standalone utility functions only for pure functions without entity context
6. THE System SHALL update all call sites to use class methods instead of utility functions

### Requirement 13: Enemy Sprite and Tooltip Consistency

**User Story:** As a game developer, I want enemy sprites and tooltip data to be resolved from class definitions, so that overworld and combat displays are always consistent and name changes do not break rendering.

#### Acceptance Criteria

1. THE System SHALL derive combat and overworld sprite keys from enemy class definitions
2. THE System SHALL provide centralized lookup methods for combat and overworld sprite keys
3. THE System SHALL remove enemy name parsing for sprite resolution in UI and world systems
4. THE System SHALL support sprite resolution for all three acts
5. THE System SHALL preserve the existing fallback behavior when an unknown enemy ID is provided
6. THE System SHALL surface a warning when an unknown enemy ID is requested

### Requirement 14: Enemy Identifier Migration

**User Story:** As a game developer, I want overworld nodes to store enemy config IDs instead of display names, so that renaming enemies does not break save data or lookups.

#### Acceptance Criteria

1. THE System SHALL store enemy config IDs in overworld node data
2. THE System SHALL update all consumers (combat launch, tooltip, sprite rendering) to use ID-based lookups
3. THE System SHALL provide a migration layer to resolve legacy display-name IDs
4. THE System SHALL maintain backward compatibility with existing saved runs
5. THE System SHALL update any serialization/deserialization code to use enemy IDs

### Requirement 15: Act 2 and Act 3 Enemy Class Coverage

**User Story:** As a game developer, I want all Act 2 and Act 3 enemies to be represented as class definitions, so that the single-source-of-truth pattern is consistent across the game.

#### Acceptance Criteria

1. THE System SHALL implement class definitions for all Act 2 enemies (10)
2. THE System SHALL implement class definitions for all Act 3 enemies (10)
3. THE System SHALL register Act 2 and Act 3 enemy classes in the centralized enemy registry
4. THE System SHALL update Act 2 and Act 3 enemy pools to use class instances
5. THE System SHALL preserve existing Act 2 and Act 3 combat behavior and stats

### Requirement 16: Prologue and Tutorial Consistency

**User Story:** As a game developer, I want the prologue/tutorial phases to use centralized enemy lookup and sprite resolution, so that early-game scenes stay consistent with the new architecture.

#### Acceptance Criteria

1. THE System SHALL update prologue phases to use centralized enemy sprite lookup methods
2. THE System SHALL update prologue phases to use enemy ID-based lookups
3. THE System SHALL preserve the existing tutorial flow and scripted encounters

### Requirement 17: Asset Loading Validation

**User Story:** As a game developer, I want enemy sprite assets to be validated against class definitions, so that missing textures are detected early.

#### Acceptance Criteria

1. THE System SHALL validate that all combat and overworld sprite keys referenced by enemy classes are preloaded
2. THE System SHALL report missing sprite keys with clear error messages
3. THE System SHALL preserve existing asset naming conventions

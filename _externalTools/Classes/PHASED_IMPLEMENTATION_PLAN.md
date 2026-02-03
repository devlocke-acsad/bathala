# Bathala Scene Refactoring - Phased Implementation Plan

> **Created**: January 21, 2026  
> **Last Updated**: February 3, 2026 (Phase 0-1 Complete)  
> **Reference**: [Phaser Scenes Documentation](https://docs.phaser.io/phaser/concepts/scenes)  
> **Approach**: Incremental phases with minimal breaking changes

---

## 📊 Feasibility Assessment Summary (Feb 3, 2026)

### ✅ Already Implemented
| Item | Status | Location |
|------|--------|----------|
| `ChapterTransition.ts` | **EXISTS** | `src/game/scenes/ChapterTransition.ts` (278 lines) |
| Chapter-aware Combat | **DONE** | Combat.ts imports Act 1/2/3 enemies, selects by chapter |
| Chapter-aware Shop | **DONE** | Uses `getChapterShopItems(currentChapter)` |
| Chapter-aware Treasure | **DONE** | Has act1/2/3 relic pools |
| GameState chapter methods | **EXISTS** | `unlockChapter()`, `setCurrentChapter()`, `resetForNewChapter()` |
| **Phase 0: Dead Code Removal** | ✅ **DONE** | Deleted `Game.ts`, `Map.ts`, backup files |
| **Phase 1: RelicSpriteUtils** | ✅ **DONE** | `src/utils/RelicSpriteUtils.ts` - 4 duplicates removed |

### ❌ Still Needs Implementation
| Item | Files to Create | Duplications to Remove |
|------|-----------------|------------------------|
| `ActManager.ts` | 1 new file | N/A |
| `EnemyManager.ts` | 1 new file | N/A |
| `src/systems/` folder | 4+ files to move/rename | N/A |
| Phase 2: Types & Interfaces | 3 new files | N/A |
| Phase 3: System Relocation | 4 file moves | N/A |

### ⚠️ Key Risks
1. **God Class Complexity**: Overworld (4,350 lines), Combat (4,294 lines), CombatUI (4,270 lines)
2. **No Unit Tests**: Manual testing required after each phase
3. **Hidden Dependencies**: Tight coupling in god classes may surface during extraction

---

## 📚 Phaser Scene Concepts Applied

### Key Phaser Principles We Must Follow

| Concept | Phaser Best Practice | Our Application |
|---------|---------------------|-----------------|
| **Scene Lifecycle** | `init()` → `preload()` → `create()` → `update()` | Reset state in `init()`, not constructor |
| **Scene States** | RUNNING, PAUSED, SLEEPING, SHUTDOWN | Use `pause()/resume()` for overlays, `sleep()/wake()` for revisitable scenes |
| **Registry** | Global data store across scenes | Use for cross-scene data instead of singletons |
| **Events** | `scene.events.on('shutdown', ...)` | Clean up resources on shutdown |
| **Scene Manager** | `launch()` for overlays, `start()` for replacement | Overlays (Shop, Combat) use `launch()`, full transitions use `start()` |

### Scene Operations (From Phaser Docs)

```
┌─────────────────────────────────────────────────────────────────┐
│  start() = stops calling scene + starts target                  │
│  launch() = keeps calling scene + starts target                 │
│  switch() = sleeps calling scene + starts/wakes target          │
│  pause()/resume() = render but no update                        │
│  sleep()/wake() = no update, no render                          │
│  stop() = shutdown (can restart later)                          │
│  remove() = destroy (cannot use again)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Systems vs Managers Distinction

> **Critical Architecture Decision**: These serve DIFFERENT purposes!

### Systems (`src/systems/`)
**Purpose**: Direct game implementation - the actual game logic.

| System | What It Does |
|--------|-------------|
| `TurnSystem` | Manages combat turn flow (player → enemy → player) |
| `FogOfWarSystem` | Calculates visibility, reveals/hides tiles |
| `CardSelectionSystem` | Handles hand selection, card validation |
| `MazeGenSystem` | Procedural maze generation logic |
| `InputSystem` | Cross-scene input handling |

**Who uses them**: Developers only. Changes require code knowledge.

### Managers (`src/core/managers/`)
**Purpose**: Interfaces for non-developers to add/change content easily.

| Manager | Who Uses It | How They Use It |
|---------|------------|-----------------|
| `MusicManager` | Musicians/Audio | Edit `MusicConfig.ts` to add tracks, set volumes |
| `EnemyManager` | Writers/Artists | Edit `Act1Enemies.ts` to add/modify enemies |
| `RelicManager` | Writers | Edit relic JSON/TS files to add/change relics |
| `DialogueManager` | Writers | Edit dialogue JSON files, manager loads them |
| `ActManager` | Content Designers | Edit `ActConfig.ts` to define new acts |

**Who uses them**: Content creators via config files (JSON/TS). No game code knowledge needed.

### Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GAME ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────┐       ┌─────────────────────────┐         │
│  │      MANAGERS           │       │       SYSTEMS           │         │
│  │  (Content Creator       │       │   (Game Logic)          │         │
│  │     Interfaces)         │       │                         │         │
│  ├─────────────────────────┤       ├─────────────────────────┤         │
│  │                         │       │                         │         │
│  │  MusicManager ──────────┼───────►  AudioSystem            │         │
│  │    ↑ Musicians          │       │                         │         │
│  │                         │       │                         │         │
│  │  EnemyManager ──────────┼───────►  NPCSystem              │         │
│  │    ↑ Writers/Artists    │       │  CombatSystem           │         │
│  │                         │       │                         │         │
│  │  RelicManager ──────────┼───────►  RewardSystem           │         │
│  │    ↑ Writers            │       │                         │         │
│  │                         │       │                         │         │
│  │  ActManager ────────────┼───────►  WorldSystem            │         │
│  │    ↑ Content Design     │       │  MazeGenSystem          │         │
│  │                         │       │                         │         │
│  └─────────────────────────┘       └─────────────────────────┘         │
│           ▲                                                             │
│           │ Edit config files                                           │
│  ┌────────┴────────────────────────────────────────────────────┐       │
│  │              CONFIG FILES (JSON/TS)                         │       │
│  │  Act1Enemies.ts, MusicConfig.ts, Dialogues.json, etc.       │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Proposed Directory Structure

> This is the TARGET structure after all phases are complete.

```
src/
├── game/
│   ├── main.ts                          # Phaser config & scene registration
│   │
│   ├── scenes/                          # ONLY Phaser Scene classes (thin orchestrators)
│   │   ├── boot/
│   │   │   ├── Boot.ts                  # ~100 lines - minimal asset load
│   │   │   └── Preloader.ts             # ~300 lines - full asset load
│   │   │
│   │   ├── menu/
│   │   │   ├── MainMenu.ts              # ~200 lines
│   │   │   ├── Settings.ts              # ~300 lines
│   │   │   ├── Credits.ts               # ~200 lines
│   │   │   └── Disclaimer.ts            # ~200 lines
│   │   │
│   │   ├── narrative/
│   │   │   ├── Prologue.ts              # ~200 lines
│   │   │   ├── ActTransition.ts         # NEW (Phase 8): Between-act cinematics
│   │   │   └── Epilogue.ts              # FUTURE: Ending scene
│   │   │
│   │   ├── world/
│   │   │   └── World.ts                 # ~300 lines (renamed from Overworld)
│   │   │
│   │   ├── overlays/
│   │   │   ├── BaseOverlay.ts           # NEW (Phase 7): Abstract base class
│   │   │   ├── Combat.ts                # ~300 lines (slimmed in Phase 6)
│   │   │   ├── Shop.ts                  # ~300 lines
│   │   │   ├── Campfire.ts              # ~300 lines
│   │   │   ├── Treasure.ts              # ~300 lines
│   │   │   ├── EventScene.ts            # ~200 lines
│   │   │   └── PokerHandReference.ts    # ~200 lines
│   │   │
│   │   ├── gameover/
│   │   │   └── GameOver.ts              # ~300 lines
│   │   │
│   │   └── debug/                       # Development only
│   │       ├── DDADebugScene.ts
│   │       └── CombatDebugScene.ts
│   │
│   └── ui/                              # UI Components (rendering only)
│       ├── components/
│       │   ├── Button.ts
│       │   ├── Tooltip.ts
│       │   ├── HealthBar.ts
│       │   └── StatusIcon.ts
│       │
│       ├── combat/
│       │   ├── CardDisplay.ts
│       │   ├── HandContainer.ts
│       │   ├── EnemyDisplay.ts
│       │   └── IntentDisplay.ts
│       │
│       └── world/
│           ├── PlayerHUD.ts
│           ├── Minimap.ts
│           └── DayNightIndicator.ts
│
├── systems/                             # Game Systems (business logic) - Phase 3+
│   │
│   ├── world/                           # World/Overworld systems
│   │   ├── WorldSystem.ts               # Coordinates all world logic
│   │   ├── FogOfWarSystem.ts            # Moved from scenes/ (Phase 3)
│   │   ├── TooltipSystem.ts             # Moved from scenes/ (Phase 3)
│   │   ├── DayNightSystem.ts            # Day/night cycle
│   │   └── NPCSystem.ts                 # Enemy spawning/movement
│   │
│   ├── combat/                          # Combat systems - Phase 6
│   │   ├── TurnSystem.ts                # Turn management (Phase 6A)
│   │   ├── CardSelectionSystem.ts       # Hand/card logic (Phase 6B)
│   │   ├── RewardSystem.ts              # Post-combat rewards (Phase 6C)
│   │   └── ActionSystem.ts              # Attack/Defend/Special
│   │
│   ├── generation/                      # Map generation strategies - Phase 3
│   │   ├── MazeGenSystem.ts             # Moved from scenes/ (Phase 3)
│   │   ├── ArchipelagoGenerator.ts      # FUTURE: Act 2 islands
│   │   └── SkyIslandsGenerator.ts       # FUTURE: Act 3 floating
│   │
│   └── shared/
│       ├── InputSystem.ts               # Moved from scenes/ (Phase 3)
│       └── AudioSystem.ts               # Core audio playback
│
├── acts/                                # Act-specific configurations - Phase 4
│   ├── index.ts                         # Exports all act configs
│   │
│   ├── act1/
│   │   ├── Act1Config.ts                # Act 1 configuration
│   │   └── Act1Enemies.ts               # Enemy pool for Act 1
│   │
│   ├── act2/                            # FUTURE
│   │   ├── Act2Config.ts
│   │   └── Act2Enemies.ts
│   │
│   └── act3/                            # FUTURE
│       ├── Act3Config.ts
│       └── Act3Enemies.ts
│
├── core/
│   ├── managers/                        # Content-creator interfaces (singletons)
│   │   ├── GameState.ts                 # Global game state (existing)
│   │   ├── ActManager.ts                # NEW (Phase 4): Act transitions
│   │   ├── EnemyManager.ts              # NEW (Phase 4): Enemy registry
│   │   ├── MusicManager.ts              # Existing
│   │   ├── RelicManager.ts              # Existing
│   │   └── StatusEffectManager.ts       # Existing
│   │
│   ├── entities/                        # Entity classes - Phase 2 (placeholder)
│   │   ├── index.ts                     # Empty placeholder for NPC refactor
│   │   ├── NPC.ts                       # FUTURE: Abstract base class
│   │   ├── Enemy.ts                     # FUTURE: Enemy class
│   │   └── Boss.ts                      # FUTURE: Boss extends Enemy
│   │
│   ├── ai/                              # AI behaviors - Phase 9 (Future)
│   │   ├── index.ts
│   │   ├── pathing/
│   │   │   └── IPathingBehavior.ts      # Pathing interface
│   │   └── combat/
│   │       └── ICombatBehavior.ts       # Combat AI interface
│   │
│   ├── dda/                             # DDA system (existing)
│   │   └── RuleBasedDDA.ts
│   │
│   └── types/                           # Type definitions
│       ├── index.ts                     # Exports all types
│       ├── ActTypes.ts                  # NEW (Phase 2): Act config types
│       ├── EnemyTypes.ts                # NEW (Phase 2): Enemy/NPC types
│       ├── IWorldGenerator.ts           # NEW (Phase 2): Generator interface
│       ├── CombatTypes.ts               # Existing
│       └── MapTypes.ts                  # Existing
│
├── data/                                # Game data (existing location)
│   ├── enemies/                         # Enemy data files
│   ├── relics/                          # Relic definitions
│   ├── potions/                         # Potion definitions
│   ├── events/                          # Event definitions
│   └── dialogue/                        # Dialogue files (for Writers)
│
└── utils/                               # Pure utility functions
    ├── RelicSpriteUtils.ts              # NEW (Phase 1): Centralized relic sprites
    ├── DamageCalculator.ts              # Existing
    ├── HandEvaluator.ts                 # Existing
    └── DeckManager.ts                   # Existing
```

### Directory Creation by Phase

| Phase | New Directories Created |
|-------|------------------------|
| 0 | None (deletions only) |
| 1 | None (file additions) |
| 2 | `src/core/entities/` |
| 3 | `src/systems/`, `src/systems/world/`, `src/systems/generation/`, `src/systems/shared/` |
| 4 | `src/acts/`, `src/acts/act1/` |
| 5 | None (modifications) |
| 6 | `src/systems/combat/` |
| 7 | `src/game/scenes/overlays/` (reorganization) |
| 8 | `src/game/scenes/narrative/` |
| 9 | `src/core/ai/`, `src/core/ai/pathing/`, `src/core/ai/combat/` |

---

## 🎯 Phased Refactoring Plan

### Overview

```
Phase 0: Cleanup (No functionality change)
    ↓
Phase 1: Utility Extraction (No scene changes)
    ↓
Phase 2: Interface Definitions (Foundation for future)
    ↓
Phase 3: Manager Relocation (Organize, don't rewrite)
    ↓
Phase 4: Act System Core (Enable multi-act)
    ↓
Phase 5: World Scene Abstraction (Rename + inject config)
    ↓
Phase 6: Combat System Extraction (Split god class)
    ↓
Phase 7: Overlay Scene Cleanup (Standardize patterns)
    ↓
Phase 8: Act Transitions (Complete the loop)
```

---

## Phase 0: Dead Code Removal

**Duration**: 1 hour  
**Risk**: ⬜ None  
**Breaking Changes**: None  
**Status**: ✅ COMPLETE (Feb 3, 2026)

### Objective
Remove unused scenes that cause confusion and clutter.

### Tasks

#### 0.1 Delete `Game.ts`
```
DELETE: src/game/scenes/Game.ts (65 lines)
```
**Reason**: Never reached in game flow. Placeholder that just redirects to Overworld.

#### 0.2 Delete `Map.ts`
```
DELETE: src/game/scenes/Map.ts (438 lines)
```
**Reason**: Slay the Spire-style map that was replaced by procedural Overworld. Never used.

#### 0.3 Update Scene Registration
```typescript
// src/game/main.ts
// REMOVE from scene array:
// - MainGame (alias for Game.ts)
// - (Map is not registered anyway)

const config: Phaser.Types.Core.GameConfig = {
  scene: [
    Boot, Preloader, Disclaimer, MainMenu, Prologue, Settings, 
    Overworld, Combat, Shop, Campfire, Treasure, Discover, 
    Credits, DDADebugScene, CombatDebugScene, GameOver, 
    PokerHandReference, EventScene
    // REMOVED: MainGame
  ],
};
```

#### 0.4 Delete Backup Files
```
DELETE: src/utils/MazeOverworldGenerator copy.ts
```
**Reason**: Backup file, not used.

### Verification
- [x] Game still boots to MainMenu
- [x] Prologue → Overworld transition works
- [x] No import errors in console

---

## Phase 1: Utility Extraction

**Duration**: 2 hours  
**Risk**: ⬜ Low  
**Breaking Changes**: None (additive only)  
**Status**: ✅ COMPLETE (Feb 3, 2026)  
**Priority**: ⭐ HIGH (Immediate value, removes 4 code duplications)

### Objective
Extract duplicated functions into centralized utilities. This follows OOP's **DRY principle**.

### Tasks

#### 1.1 Create `RelicSpriteUtils.ts`

```typescript
// NEW FILE: src/utils/RelicSpriteUtils.ts

/**
 * Centralized relic sprite key mapping
 * Single source of truth - previously duplicated in 5+ files
 */
const RELIC_SPRITE_MAP: Readonly<Record<string, string>> = {
  'swift_wind_agimat': 'relic_swift_wind_agimat',
  'amomongo_claw': 'relic_amomongo_claw',
  'ancestral_blade': 'relic_ancestral_blade',
  'balete_root': 'relic_balete_root',
  'babaylans_talisman': 'relic_babaylans_talisman',
  'bungisngis_grin': 'relic_bungisngis_grin',
  'diwatas_crown': 'relic_diwatas_crown',
  'duwende_charm': 'relic_duwende_charm',
  'earthwardens_plate': 'relic_earthwardens_plate',
  'ember_fetish': 'relic_ember_fetish',
  'kapres_cigar': 'relic_kapres_cigar',
  'lucky_charm': 'relic_lucky_charm',
  'mangangaway_wand': 'relic_mangangaway_wand',
  'sarimanok_feather': 'relic_sarimanok_feather',
  'sigbin_heart': 'relic_sigbin_heart',
  'stone_golem_heart': 'relic_stone_golem_heart',
  'tidal_amulet': 'relic_tidal_amulet',
  'tikbalangs_hoof': 'relic_tikbalangs_hoof',
  'tiyanak_tear': 'relic_tiyanak_tear',
  'umalagad_spirit': 'relic_umalagad_spirit',
  // Future relics can be added here
} as const;

export function getRelicSpriteKey(relicId: string): string {
  return RELIC_SPRITE_MAP[relicId] ?? '';
}

export function hasRelicSprite(relicId: string): boolean {
  return relicId in RELIC_SPRITE_MAP;
}

export function getAllRelicIds(): string[] {
  return Object.keys(RELIC_SPRITE_MAP);
}
```

#### 1.2 Update Imports in Existing Files

Replace local `getRelicSpriteKey` functions with imports:

```typescript
// In each file (Overworld.ts, Shop.ts, Campfire.ts, Treasure.ts, CombatUI.ts):
import { getRelicSpriteKey } from '../../utils/RelicSpriteUtils';

// DELETE the local function definition (20-30 lines each)
```

**Files updated**:
- ✅ `src/game/scenes/Overworld.ts` - Uses centralized utility
- ✅ `src/game/scenes/Shop.ts` - Uses centralized utility
- ⏭️ `src/game/scenes/Campfire.ts` - No relic sprites used (skipped)
- ✅ `src/game/scenes/Treasure.ts` - Uses centralized utility (local duplicate removed)
- ✅ `src/game/scenes/combat/CombatUI.ts` - Uses centralized utility

### Verification
- [x] All relic sprites display correctly
- [x] No TypeScript errors
- [x] Build succeeds

---

## Phase 2: Interface & Type Definitions

**Duration**: 4-5 hours  
**Risk**: ⬜ None  
**Breaking Changes**: None (types only)  
**Status**: ⏳ Not Started

### Objective
Define ALL foundation interfaces and types that enable future extensibility. This includes:
- Act configuration types
- World generator interface
- NPC/Entity types (for future Enemy class refactoring)

Follows OOP's **Interface Segregation** and **Dependency Inversion** principles.

### Tasks

#### 2.1 Create `ActTypes.ts`

```typescript
// NEW FILE: src/core/types/ActTypes.ts

import { EnemyConfig } from './EnemyTypes';
import { GameEvent } from '../../data/events/EventTypes';
import { Relic } from './CombatTypes';
import { Suit } from './CombatTypes';

/**
 * Generator types - extensible for future generation methods
 */
export enum GeneratorType {
  MAZE = 'maze',               // Act 1: Forest maze
  ARCHIPELAGO = 'archipelago', // Act 2: Islands (future)
  SKY_ISLANDS = 'sky_islands', // Act 3: Floating (future)
  LINEAR = 'linear',           // Tutorial/special
}

/**
 * Act theme configuration
 */
export interface ActTheme {
  readonly primaryElements: readonly Suit[];
  readonly colorPalette: {
    readonly primary: number;
    readonly secondary: number;
    readonly accent: number;
  };
}

/**
 * Configuration for a game Act/Chapter
 * Immutable to prevent accidental modification
 */
export interface ActConfig {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly theme: ActTheme;
  
  // Generation
  readonly generatorType: GeneratorType;
  readonly generatorConfig: Record<string, unknown>;
  
  // Content (references to data, not copies)
  readonly commonEnemyIds: readonly string[];
  readonly eliteEnemyIds: readonly string[];
  readonly bossId: string;
  readonly eventIds: readonly string[];
  readonly relicIds: readonly string[];
  
  // Assets
  readonly backgroundKey: string;
  readonly musicKey: string;
  
  // Progression
  readonly requiredCyclesToBoss: number;
  readonly actionsPerCycle: number;
}
```

#### 2.2 Create `IWorldGenerator.ts`

```typescript
// NEW FILE: src/core/types/IWorldGenerator.ts

import { MapNode } from './MapTypes';

/**
 * Chunk data returned by generators
 */
export interface ChunkData {
  readonly tiles: readonly (readonly number[])[];
  readonly walkable: readonly (readonly boolean[])[];
  readonly nodes: readonly MapNode[];
}

/**
 * World generator interface
 * Allows different generation strategies per Act
 * 
 * Follows Strategy Pattern - generators are interchangeable
 */
export interface IWorldGenerator {
  /**
   * Initialize with act-specific configuration
   */
  initialize(config: Record<string, unknown>): void;
  
  /**
   * Generate a chunk at given coordinates
   */
  generateChunk(chunkX: number, chunkY: number): ChunkData;
  
  /**
   * Get valid player spawn position
   */
  getPlayerSpawnPosition(): { x: number; y: number };
  
  /**
   * Check if position is walkable
   */
  isWalkable(worldX: number, worldY: number): boolean;
  
  /**
   * Get nodes (NPCs, interactables) in range
   */
  getNodesInRange(x: number, y: number, range: number): MapNode[];
  
  /**
   * Clear cached data (on act change)
   */
  clearCache(): void;
  
  /**
   * Cleanup resources
   */
  dispose(): void;
}
```

#### 2.3 Create `EnemyTypes.ts` (NPC Foundation)

```typescript
// NEW FILE: src/core/types/EnemyTypes.ts

import { StatusEffect } from './CombatTypes';

/**
 * Enemy tier - determines rewards and difficulty
 */
export type EnemyTier = 'common' | 'elite' | 'boss';

/**
 * Control type for combat entities (scalable for future multi-entity)
 */
export type ControlType = 'human' | 'ai_ally' | 'ai_enemy';

/**
 * Team affiliation for combat targeting
 */
export type Team = 'player' | 'enemy';

/**
 * Configuration for an enemy type (used by EnemyManager)
 * Content creators edit these to add/modify enemies
 */
export interface EnemyConfig {
  readonly id: string;
  readonly name: string;
  readonly tier: EnemyTier;
  readonly chapter: number;  // Which act this enemy appears in
  
  // Stats
  readonly baseHealth: number;
  readonly baseDamage: number;
  
  // Combat behavior
  readonly attackPatternId: string;
  readonly abilities?: readonly string[];  // Ability IDs
  
  // Overworld behavior
  readonly pathingType: PathingType;
  readonly detectionRange: number;
  readonly activeAtNight: boolean;
  readonly activeAtDay: boolean;
  
  // Visuals (for Artists)
  readonly spriteKey: string;  // Convention: chap{N}/{enemyId}
  
  // Dialogue (for Writers)
  readonly dialogueIntro?: string;
  readonly dialogueDefeat?: string;
  readonly dialogueSpare?: string;
  readonly dialogueSlay?: string;
}

/**
 * Pathing behavior types
 */
export type PathingType = 
  | 'chase'     // Direct pursuit
  | 'ambush'    // Wait then burst
  | 'wander'    // Random movement
  | 'patrol'    // Fixed route
  | 'stationary'; // Don't move

/**
 * Boss-specific configuration (extends EnemyConfig)
 */
export interface BossConfig extends EnemyConfig {
  readonly tier: 'boss';  // Always boss
  readonly phases: readonly BossPhase[];
}

/**
 * Boss phase configuration
 */
export interface BossPhase {
  readonly id: number;
  readonly healthThreshold: number;  // Percentage to trigger (e.g., 0.5 = 50%)
  readonly attackPatternId: string;
  readonly abilities: readonly string[];
  readonly dialogue?: string;
}
```

#### 2.4 Create `core/entities/` Folder Structure

```
CREATE FOLDERS:
src/core/entities/
```

```typescript
// NEW FILE: src/core/entities/index.ts
// Placeholder - classes will be added in NPC refactoring project

// Future exports:
// export { NPC } from './NPC';
// export { Enemy } from './Enemy';
// export { Boss } from './Boss';

export {}; // Empty export for now
```

#### 2.5 Create Index Exports

```typescript
// UPDATE FILE: src/core/types/index.ts (create if doesn't exist)

export * from './CombatTypes';
export * from './MapTypes';
export * from './ActTypes';
export * from './EnemyTypes';
export * from './IWorldGenerator';
```

### Verification
- [ ] TypeScript compilation succeeds
- [ ] No runtime errors (types are compile-time only)
- [ ] `src/core/entities/` folder exists (empty placeholder)

---

## Phase 3: System Relocation

**Duration**: 3-4 hours  
**Risk**: 🟨 Low-Medium  
**Breaking Changes**: Import paths change  
**Status**: ⏳ Not Started

> **⚠️ Estimate Adjusted**: Original 2-3h increased to account for import path updates across codebase.

### Objective
Move misplaced system files from `scenes/` to proper locations. These are **Systems** (game logic), not Managers (content-creator interfaces).

> **Note**: Despite their current names (`*Manager`), these are actually **Systems** - they implement game logic directly, not content-creator interfaces.

### Tasks

#### 3.1 Create Systems Folder Structure

```
CREATE FOLDERS:
src/systems/
src/systems/world/
src/systems/generation/
src/systems/shared/
```

#### 3.2 Move and Rename Overworld Systems

| From | To | Reason for Rename |
|------|-----|-------------------|
| `scenes/Overworld_MazeGenManager.ts` | `systems/generation/MazeGenSystem.ts` | It's generation logic, not a content interface |
| `scenes/Overworld_KeyInputManager.ts` | `systems/shared/InputSystem.ts` | It's input handling logic |
| `scenes/Overworld_TooltipManager.ts` | `systems/world/TooltipSystem.ts` | It's tooltip display logic |
| `scenes/Overworld_FogOfWarManager.ts` | `systems/world/FogOfWarSystem.ts` | It's visibility calculation logic |

#### 3.3 Update Imports in Overworld.ts

```typescript
// BEFORE:
import { Overworld_KeyInputManager } from "./Overworld_KeyInputManager";
import { Overworld_MazeGenManager } from "./Overworld_MazeGenManager";
import { Overworld_TooltipManager } from "./Overworld_TooltipManager";
import { Overworld_FogOfWarManager } from "./Overworld_FogOfWarManager";

// AFTER:
import { InputSystem } from "../../systems/shared/InputSystem";
import { MazeGenSystem } from "../../systems/generation/MazeGenSystem";
import { TooltipSystem } from "../../systems/world/TooltipSystem";
import { FogOfWarSystem } from "../../systems/world/FogOfWarSystem";
```

#### 3.4 Rename Classes (Remove Overworld_ prefix, use System suffix)

```typescript
// In each moved file, rename the class:
// BEFORE: export class Overworld_MazeGenManager
// AFTER:  export class MazeGenSystem

// BEFORE: export class Overworld_FogOfWarManager  
// AFTER:  export class FogOfWarSystem

// etc.
```

### Verification
- [ ] Overworld scene still works
- [ ] No import errors
- [ ] Maze generation works
- [ ] Fog of war works
- [ ] Tooltips work
- [ ] Input handling works

---

## Phase 4: Manager System Core

**Duration**: 5-6 hours  
**Risk**: 🟨 Medium  
**Breaking Changes**: New dependencies (ActManager, EnemyManager)  
**Status**: ⏳ Not Started

> **ℹ️ Note**: GameState.ts already has `unlockChapter()`, `setCurrentChapter()`, `resetForNewChapter()` methods that can be leveraged.

### Objective
Create the **Manager** layer - content-creator interfaces for Acts and Enemies.

These managers enable:
- **Content Designers**: Define new acts via config files
- **Writers/Artists**: Add enemies via config files

### Tasks

#### 4.1 Create Acts Folder Structure

```
CREATE FOLDERS:
src/acts/
src/acts/act1/
```

#### 4.2 Create Act1 Configuration

```typescript
// NEW FILE: src/acts/act1/Act1Config.ts

import { ActConfig, GeneratorType } from '../../core/types/ActTypes';

export const ACT1_CONFIG: ActConfig = {
  id: 1,
  name: "Chapter 1",
  subtitle: "The Corrupted Ancestral Forests",
  theme: {
    primaryElements: ['lupa', 'hangin'],
    colorPalette: {
      primary: 0x2d4a3e,
      secondary: 0x1a2f26,
      accent: 0x77888C
    }
  },
  
  generatorType: GeneratorType.MAZE,
  generatorConfig: {
    chunkSize: 32,
    pathWidth: 1,
    roomChance: 0.15
  },
  
  // Reference IDs, not objects (lazy loading)
  commonEnemyIds: [
    'tikbalang_scout', 'balete_wraith', 'sigbin_charger',
    'duwende_trickster', 'tiyanak_ambusher', 'amomongo', 'bungisngis'
  ],
  eliteEnemyIds: ['kapre_shade', 'tawong_lipod'],
  bossId: 'mangangaway',
  eventIds: ['anito_shrine', 'balete_vision', 'diwata_whisper'],
  relicIds: ['tikbalangs_hoof', 'balete_root', 'sigbin_heart'],
  
  backgroundKey: 'forest_bg',
  musicKey: 'overworld_ambient',
  
  requiredCyclesToBoss: 5,
  actionsPerCycle: 100
};
```

#### 4.3 Create ActManager

```typescript
// NEW FILE: src/core/managers/ActManager.ts

import { ActConfig, GeneratorType } from '../types/ActTypes';
import { ACT1_CONFIG } from '../../acts/act1/Act1Config';

/**
 * ActManager - Singleton that manages act configurations and transitions
 * 
 * Responsibilities:
 * - Store act configurations
 * - Track current act
 * - Provide act-specific data to World scene
 * - Handle act transitions
 */
export class ActManager {
  private static instance: ActManager;
  
  private currentActId: number = 1;
  private actConfigs: Map<number, ActConfig> = new Map();
  
  private constructor() {
    // Register Act 1 (others can be added later)
    this.registerAct(ACT1_CONFIG);
  }
  
  static getInstance(): ActManager {
    if (!ActManager.instance) {
      ActManager.instance = new ActManager();
    }
    return ActManager.instance;
  }
  
  /**
   * Register an act configuration
   */
  registerAct(config: ActConfig): void {
    this.actConfigs.set(config.id, config);
  }
  
  /**
   * Get current act configuration
   */
  getCurrentActConfig(): ActConfig {
    const config = this.actConfigs.get(this.currentActId);
    if (!config) {
      throw new Error(`Act ${this.currentActId} not registered`);
    }
    return config;
  }
  
  /**
   * Get specific act configuration
   */
  getActConfig(actId: number): ActConfig | undefined {
    return this.actConfigs.get(actId);
  }
  
  /**
   * Get current act ID
   */
  getCurrentActId(): number {
    return this.currentActId;
  }
  
  /**
   * Advance to next act
   * @returns true if advanced, false if no more acts
   */
  advanceToNextAct(): boolean {
    const nextId = this.currentActId + 1;
    if (this.actConfigs.has(nextId)) {
      this.currentActId = nextId;
      return true;
    }
    return false;
  }
  
  /**
   * Reset to specific act (for new game or debug)
   */
  setCurrentAct(actId: number): void {
    if (!this.actConfigs.has(actId)) {
      throw new Error(`Act ${actId} not registered`);
    }
    this.currentActId = actId;
  }
  
  /**
   * Check if current act is the final act
   */
  isLastAct(): boolean {
    return !this.actConfigs.has(this.currentActId + 1);
  }
  
  /**
   * Get total number of registered acts
   */
  getTotalActs(): number {
    return this.actConfigs.size;
  }
  
  /**
   * Reset for new game
   */
  reset(): void {
    this.currentActId = 1;
  }
}
```

#### 4.4 Create Acts Index

```typescript
// NEW FILE: src/acts/index.ts

export { ACT1_CONFIG } from './act1/Act1Config';
// Future: export { ACT2_CONFIG } from './act2/Act2Config';
// Future: export { ACT3_CONFIG } from './act3/Act3Config';
```

#### 4.5 Create EnemyManager

```typescript
// NEW FILE: src/core/managers/EnemyManager.ts

import { EnemyConfig, BossConfig, EnemyTier } from '../types/EnemyTypes';
import { ActManager } from './ActManager';

/**
 * EnemyManager - Content-creator interface for enemies
 * 
 * Who uses this:
 * - Writers: Add dialogue, names, descriptions
 * - Artists: Reference sprite keys
 * - Content Designers: Balance stats, add new enemies
 * 
 * How to add a new enemy:
 * 1. Add config to src/acts/act{N}/Act{N}Enemies.ts
 * 2. Add sprite to assets/sprites/combat/enemy/chap{N}/
 * 3. (Optional) Add dialogue to assets/dialogue/chap{N}/
 */
export class EnemyManager {
  private static instance: EnemyManager;
  
  // All registered enemy configs
  private enemyConfigs: Map<string, EnemyConfig> = new Map();
  private bossConfigs: Map<string, BossConfig> = new Map();
  
  private constructor() {}
  
  static getInstance(): EnemyManager {
    if (!EnemyManager.instance) {
      EnemyManager.instance = new EnemyManager();
    }
    return EnemyManager.instance;
  }
  
  /**
   * Register enemy config (called by Act config files)
   */
  registerEnemy(config: EnemyConfig): void {
    this.enemyConfigs.set(config.id, config);
  }
  
  /**
   * Register boss config
   */
  registerBoss(config: BossConfig): void {
    this.bossConfigs.set(config.id, config);
  }
  
  /**
   * Get enemy config by ID
   */
  getEnemyConfig(enemyId: string): EnemyConfig | undefined {
    return this.enemyConfigs.get(enemyId) ?? this.bossConfigs.get(enemyId);
  }
  
  /**
   * Get boss config by ID
   */
  getBossConfig(bossId: string): BossConfig | undefined {
    return this.bossConfigs.get(bossId);
  }
  
  /**
   * Get all enemies for current act by tier
   */
  getEnemiesForCurrentAct(tier?: EnemyTier): EnemyConfig[] {
    const actManager = ActManager.getInstance();
    const currentAct = actManager.getCurrentActId();
    
    const enemies = Array.from(this.enemyConfigs.values())
      .filter(e => e.chapter === currentAct);
    
    if (tier) {
      return enemies.filter(e => e.tier === tier);
    }
    return enemies;
  }
  
  /**
   * Get random enemy for current act
   */
  getRandomEnemy(tier: EnemyTier = 'common'): EnemyConfig | undefined {
    const enemies = this.getEnemiesForCurrentAct(tier);
    if (enemies.length === 0) return undefined;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
  
  /**
   * Get sprite key using convention
   * Convention: chap{N}/{enemyId}
   */
  getSpriteKey(enemyId: string): string {
    const config = this.getEnemyConfig(enemyId);
    if (!config) return '';
    return config.spriteKey || `chap${config.chapter}/${enemyId}`;
  }
  
  /**
   * Clear all registrations (for testing)
   */
  reset(): void {
    this.enemyConfigs.clear();
    this.bossConfigs.clear();
  }
}
```

#### 4.6 Create Act1 Enemy Configs (Example)

```typescript
// NEW FILE: src/acts/act1/Act1Enemies.ts

import { EnemyConfig, BossConfig } from '../../core/types/EnemyTypes';
import { EnemyManager } from '../../core/managers/EnemyManager';

/**
 * Act 1 Enemy Definitions
 * 
 * FOR WRITERS: Edit dialogue fields (dialogueIntro, dialogueDefeat, etc.)
 * FOR ARTISTS: Sprites go in assets/sprites/combat/enemy/chap1/{enemyId}.png
 * FOR BALANCE: Edit baseHealth, baseDamage, detectionRange
 */

export const TIKBALANG_SCOUT: EnemyConfig = {
  id: 'tikbalang_scout',
  name: 'Tikbalang Scout',
  tier: 'common',
  chapter: 1,
  
  baseHealth: 28,
  baseDamage: 8,
  
  attackPatternId: 'basic_attacker',
  
  pathingType: 'chase',
  detectionRange: 4,
  activeAtNight: true,
  activeAtDay: false,
  
  spriteKey: 'chap1/tikbalang_scout',
  
  // FOR WRITERS - edit these!
  dialogueIntro: "Lost in my paths, seer? False one's whispers guide!",
  dialogueDefeat: "My tricks... unravel...",
  dialogueSpare: "Spare me: Tikbalang were forest protectors, now misleading with backward hooves.",
  dialogueSlay: "End me—my essence feeds shadow!"
};

// ... more enemy configs ...

export const MANGANGAWAY_BOSS: BossConfig = {
  id: 'mangangaway',
  name: 'Mangangaway',
  tier: 'boss',
  chapter: 1,
  
  baseHealth: 120,
  baseDamage: 15,
  
  attackPatternId: 'mangangaway_phase1',
  
  pathingType: 'stationary',
  detectionRange: 0,
  activeAtNight: true,
  activeAtDay: true,
  
  spriteKey: 'chap1/boss_mangangaway',
  
  dialogueIntro: "Fates reverse at my command!",
  dialogueDefeat: "My hexes... unravel...",
  dialogueSpare: "Grace spares: Mangangaway, sorcerers casting evil spells.",
  dialogueSlay: "End my curses—fuel for false god!",
  
  phases: [
    {
      id: 1,
      healthThreshold: 1.0,
      attackPatternId: 'mangangaway_phase1',
      abilities: ['hex_of_reversal', 'curse_cards']
    },
    {
      id: 2,
      healthThreshold: 0.5,
      attackPatternId: 'mangangaway_phase2',
      abilities: ['hex_of_reversal', 'curse_cards', 'mimic_element'],
      dialogue: "You think you can defeat me? I am the weaver of fates!"
    }
  ]
};

// Register all Act 1 enemies
export function registerAct1Enemies(): void {
  const manager = EnemyManager.getInstance();
  manager.registerEnemy(TIKBALANG_SCOUT);
  // ... register other enemies ...
  manager.registerBoss(MANGANGAWAY_BOSS);
}
```

### Verification
- [ ] ActManager.getInstance() works
- [ ] EnemyManager.getInstance() works
- [ ] getCurrentActConfig() returns Act1 config
- [ ] getEnemiesForCurrentAct() returns Act1 enemies
- [ ] TypeScript compiles without errors

---

## Phase 5: World Scene Integration

**Duration**: 5-6 hours  
**Risk**: 🟧 Medium-High  
**Breaking Changes**: Overworld uses ActManager  
**Status**: ⏳ Not Started

> **⚠️ Estimate Adjusted**: Original 3-4h increased due to Overworld.ts being 4,350 lines. Recommend splitting into sub-phases (5A, 5B, 5C).

### Objective
Modify Overworld to use ActManager for configuration instead of hardcoded values.

### Tasks

#### 5.1 Add ActManager to Overworld

```typescript
// MODIFY: src/game/scenes/Overworld.ts

import { ActManager } from "../../core/managers/ActManager";
import { ActConfig } from "../../core/types/ActTypes";

export class Overworld extends Scene {
  // ... existing properties ...
  
  private actManager: ActManager;
  private currentActConfig: ActConfig;
  
  constructor() {
    super({ key: "Overworld" });
    this.actManager = ActManager.getInstance();
    // ... existing constructor code ...
  }
  
  init(data?: { actId?: number }): void {
    // Use init() for state reset (Phaser best practice)
    if (data?.actId) {
      this.actManager.setCurrentAct(data.actId);
    }
    this.currentActConfig = this.actManager.getCurrentActConfig();
    
    // Reset movement flags (prevents restart bugs)
    this.isMoving = false;
    this.isTransitioningToCombat = false;
  }
  
  create(): void {
    // Use act config for background
    const bg = this.currentActConfig.backgroundKey;
    // ... rest of create using this.currentActConfig ...
  }
}
```

#### 5.2 Use Act Config for Music

```typescript
// In Overworld's startMusic():
private startMusic(): void {
  const musicKey = this.currentActConfig.musicKey;
  // ... use musicKey instead of hardcoded value ...
}
```

#### 5.3 Pass Act Context to Overlays

```typescript
// When launching Combat:
this.scene.launch("Combat", { 
  nodeType: "enemy",
  enemyId: selectedEnemy,
  actId: this.currentActConfig.id  // Pass act context
});
```

### Verification
- [ ] Game starts with Act 1 config
- [ ] Background matches Act 1 theme
- [ ] Music plays correctly
- [ ] Combat receives act context

---

## Phase 6: Combat System Extraction (Multi-Part)

**Duration**: 12-16 hours (split into sub-phases)  
**Risk**: 🟧 Medium-High  
**Breaking Changes**: Combat internal structure changes  
**Status**: ⏳ Not Started

> **⚠️ Estimate Adjusted**: Original 8-12h increased. Combat.ts (4,294 lines) + CombatUI.ts (4,270 lines) = 8,500+ lines of tightly coupled code. Recommend TurnSystem extraction as proof-of-concept before full commitment.

### Objective
Extract business logic from Combat.ts (4,214 lines) into focused systems.

---

### Phase 6A: Turn System Extraction

**Duration**: 2-3 hours

#### 6A.1 Create TurnSystem

```typescript
// NEW FILE: src/systems/combat/TurnSystem.ts

import { EventEmitter } from 'phaser';

export enum TurnPhase {
  PLAYER_START = 'player_start',
  PLAYER_ACTION = 'player_action',
  PLAYER_END = 'player_end',
  ENEMY_START = 'enemy_start',
  ENEMY_ACTION = 'enemy_action',
  ENEMY_END = 'enemy_end',
}

/**
 * Manages combat turn flow
 * Emits events for each phase transition
 */
export class TurnSystem {
  private events: EventEmitter;
  private currentPhase: TurnPhase = TurnPhase.PLAYER_START;
  private turnCount: number = 0;
  
  constructor() {
    this.events = new EventEmitter();
  }
  
  getCurrentPhase(): TurnPhase {
    return this.currentPhase;
  }
  
  getTurnCount(): number {
    return this.turnCount;
  }
  
  startCombat(): void {
    this.turnCount = 0;
    this.startPlayerTurn();
  }
  
  startPlayerTurn(): void {
    this.turnCount++;
    this.setPhase(TurnPhase.PLAYER_START);
    this.events.emit('turn:player:start', this.turnCount);
  }
  
  endPlayerTurn(): void {
    this.setPhase(TurnPhase.PLAYER_END);
    this.events.emit('turn:player:end', this.turnCount);
    this.startEnemyTurn();
  }
  
  startEnemyTurn(): void {
    this.setPhase(TurnPhase.ENEMY_START);
    this.events.emit('turn:enemy:start', this.turnCount);
  }
  
  endEnemyTurn(): void {
    this.setPhase(TurnPhase.ENEMY_END);
    this.events.emit('turn:enemy:end', this.turnCount);
    this.startPlayerTurn();
  }
  
  private setPhase(phase: TurnPhase): void {
    this.currentPhase = phase;
    this.events.emit('phase:change', phase);
  }
  
  on(event: string, callback: (...args: any[]) => void): void {
    this.events.on(event, callback);
  }
  
  off(event: string, callback: (...args: any[]) => void): void {
    this.events.off(event, callback);
  }
  
  reset(): void {
    this.turnCount = 0;
    this.currentPhase = TurnPhase.PLAYER_START;
  }
}
```

#### 6A.2 Integrate TurnSystem into Combat

```typescript
// In Combat.ts:
import { TurnSystem } from "../../systems/combat/TurnSystem";

export class Combat extends Scene {
  private turnSystem: TurnSystem;
  
  create(): void {
    // ... existing code ...
    
    this.turnSystem = new TurnSystem();
    this.turnSystem.on('turn:player:start', this.onPlayerTurnStart.bind(this));
    this.turnSystem.on('turn:enemy:start', this.onEnemyTurnStart.bind(this));
    
    this.turnSystem.startCombat();
  }
  
  // Existing methods now delegate to TurnSystem
  private onPlayerTurnStart(turnCount: number): void {
    // Move existing player turn start logic here
  }
}
```

---

### Phase 6B: Card Selection System

**Duration**: 2-3 hours

#### 6B.1 Create CardSelectionSystem

```typescript
// NEW FILE: src/systems/combat/CardSelectionSystem.ts

import { PlayingCard } from '../../core/types/CombatTypes';

export interface CardSelectionState {
  hand: PlayingCard[];
  selected: PlayingCard[];
  maxSelection: number;
}

export class CardSelectionSystem {
  private state: CardSelectionState = {
    hand: [],
    selected: [],
    maxSelection: 5
  };
  
  setHand(cards: PlayingCard[]): void {
    this.state.hand = [...cards];
    this.state.selected = [];
  }
  
  selectCard(card: PlayingCard): boolean {
    if (this.state.selected.length >= this.state.maxSelection) {
      return false;
    }
    if (this.state.selected.includes(card)) {
      return false;
    }
    this.state.selected.push(card);
    return true;
  }
  
  deselectCard(card: PlayingCard): boolean {
    const index = this.state.selected.indexOf(card);
    if (index === -1) return false;
    this.state.selected.splice(index, 1);
    return true;
  }
  
  toggleCard(card: PlayingCard): boolean {
    if (this.state.selected.includes(card)) {
      return this.deselectCard(card);
    }
    return this.selectCard(card);
  }
  
  getSelected(): PlayingCard[] {
    return [...this.state.selected];
  }
  
  getSelectionCount(): number {
    return this.state.selected.length;
  }
  
  isComplete(): boolean {
    return this.state.selected.length === this.state.maxSelection;
  }
  
  clear(): void {
    this.state.selected = [];
  }
  
  reset(): void {
    this.state = { hand: [], selected: [], maxSelection: 5 };
  }
}
```

---

### Phase 6C: Reward System

**Duration**: 2 hours

```typescript
// NEW FILE: src/systems/combat/RewardSystem.ts

import { Relic, Potion } from '../../core/types/CombatTypes';
import { ActManager } from '../../core/managers/ActManager';
import { RuleBasedDDA } from '../../core/dda/RuleBasedDDA';

export interface CombatReward {
  ginto: number;
  relics: Relic[];
  potions: Potion[];
  spiritFragments: number;
}

export class RewardSystem {
  private actManager: ActManager;
  private dda: RuleBasedDDA;
  
  constructor() {
    this.actManager = ActManager.getInstance();
    this.dda = RuleBasedDDA.getInstance();
  }
  
  calculateRewards(enemyType: 'common' | 'elite' | 'boss', landasScore: number): CombatReward {
    const actConfig = this.actManager.getCurrentActConfig();
    const ddaAdjustment = this.dda.getCurrentDifficultyAdjustment();
    
    // Base rewards vary by enemy type
    const baseGinto = this.getBaseGinto(enemyType);
    
    // Apply DDA multiplier
    const adjustedGinto = Math.round(baseGinto * ddaAdjustment.goldMultiplier);
    
    return {
      ginto: adjustedGinto,
      relics: this.getRelicReward(enemyType),
      potions: this.getPotionReward(enemyType),
      spiritFragments: this.getFragmentReward(landasScore)
    };
  }
  
  private getBaseGinto(type: 'common' | 'elite' | 'boss'): number {
    switch (type) {
      case 'common': return 15;
      case 'elite': return 35;
      case 'boss': return 100;
    }
  }
  
  // ... additional methods ...
}
```

---

## Phase 7: Overlay Scene Standardization

**Duration**: 5-6 hours  
**Risk**: 🟨 Medium  
**Breaking Changes**: Consistent overlay patterns  
**Status**: ⏳ Not Started

### Objective
Ensure all overlay scenes (Shop, Campfire, Treasure, Event) follow same patterns.

### Tasks

#### 7.1 Create Base Overlay Class

```typescript
// NEW FILE: src/game/scenes/overlays/BaseOverlay.ts

import { Scene } from 'phaser';
import { Player } from '../../../core/types/CombatTypes';
import { MusicManager } from '../../../core/managers/MusicManager';

/**
 * Base class for overlay scenes
 * Standardizes common patterns:
 * - Music lifecycle
 * - Player data handling
 * - Return to parent scene
 */
export abstract class BaseOverlay extends Scene {
  protected player!: Player;
  protected music?: Phaser.Sound.BaseSound;
  protected parentSceneKey: string = 'Overworld';
  
  init(data: { player: Player; parentScene?: string }): void {
    this.player = data.player;
    if (data.parentScene) {
      this.parentSceneKey = data.parentScene;
    }
  }
  
  create(): void {
    this.setupMusicLifecycle();
    this.startMusic();
    this.createBackground();
    this.createUI();
  }
  
  protected abstract createUI(): void;
  
  protected createBackground(): void {
    // Common forest background pattern
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, 'forest_bg');
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale).setAlpha(0.4);
  }
  
  protected startMusic(): void {
    const musicManager = MusicManager.getInstance();
    const config = musicManager.getMusicKeyForScene(this.scene.key);
    if (config) {
      this.music = this.sound.add(config.musicKey, {
        volume: config.volume ?? musicManager.getEffectiveMusicVolume(),
        loop: true
      });
      this.music.play();
    }
  }
  
  protected setupMusicLifecycle(): void {
    this.events.on('pause', () => this.stopMusic());
    this.events.on('resume', () => this.startMusic());
    this.events.on('shutdown', () => this.stopMusic());
  }
  
  protected stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
  }
  
  protected returnToParent(): void {
    this.scene.stop();
    this.scene.resume(this.parentSceneKey);
  }
}
```

#### 7.2 Migrate Shop to BaseOverlay

```typescript
// MODIFY: src/game/scenes/Shop.ts

import { BaseOverlay } from './overlays/BaseOverlay';

export class Shop extends BaseOverlay {
  constructor() {
    super({ key: 'Shop' });
  }
  
  protected createUI(): void {
    // Move existing UI creation here
    // Remove duplicated music/background code
  }
}
```

---

## Phase 8: Act Transition Enhancement

**Duration**: 2 hours  
**Risk**: 🟨 Medium  
**Breaking Changes**: Enhanced boss victory flow  
**Status**: ⏳ Not Started

> **✅ PARTIAL IMPLEMENTATION EXISTS**: `ChapterTransition.ts` (278 lines) already exists at `src/game/scenes/ChapterTransition.ts`. This phase should **enhance** the existing scene to integrate with ActManager rather than create a new one.

### Objective
~~Create the ActTransition scene and~~ **Enhance existing ChapterTransition** to integrate with ActManager and wire up boss victory flow.

### Tasks

#### 8.1 Create ActTransition Scene

```typescript
// NEW FILE: src/game/scenes/narrative/ActTransition.ts

import { Scene } from 'phaser';
import { ActManager } from '../../../core/managers/ActManager';
import { GameState } from '../../../core/managers/GameState';

export class ActTransition extends Scene {
  private fromActId: number = 1;
  private toActId: number = 2;
  
  constructor() {
    super({ key: 'ActTransition' });
  }
  
  init(data: { fromActId: number; victory: boolean }): void {
    this.fromActId = data.fromActId;
    this.toActId = data.fromActId + 1;
  }
  
  create(): void {
    const { width, height } = this.cameras.main;
    const actManager = ActManager.getInstance();
    
    // Show act completion
    const completedAct = actManager.getActConfig(this.fromActId);
    
    this.add.text(width / 2, height / 3, `${completedAct?.name} Complete`, {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: 48,
      color: '#d4af37'
    }).setOrigin(0.5);
    
    // Check if there's a next act
    const nextAct = actManager.getActConfig(this.toActId);
    
    if (nextAct) {
      this.add.text(width / 2, height / 2, `Next: ${nextAct.name}`, {
        fontFamily: 'dungeon-mode',
        fontSize: 32,
        color: '#77888C'
      }).setOrigin(0.5);
      
      this.add.text(width / 2, height * 0.7, 'Click to continue...', {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#555'
      }).setOrigin(0.5);
      
      this.input.once('pointerdown', () => {
        actManager.advanceToNextAct();
        this.scene.start('Overworld', { actId: this.toActId });
      });
    } else {
      // Final act complete - go to epilogue
      this.add.text(width / 2, height / 2, 'Your journey is complete.', {
        fontFamily: 'dungeon-mode',
        fontSize: 32,
        color: '#d4af37'
      }).setOrigin(0.5);
      
      this.input.once('pointerdown', () => {
        this.scene.start('Credits'); // Or Epilogue when created
      });
    }
  }
}
```

#### 8.2 Register ActTransition Scene

```typescript
// MODIFY: src/game/main.ts
import { ActTransition } from './scenes/narrative/ActTransition';

const config = {
  scene: [
    // ... existing scenes ...
    ActTransition,  // Add new scene
  ]
};
```

#### 8.3 Wire Boss Victory to ActTransition

```typescript
// MODIFY: src/game/scenes/Combat.ts

// In the boss victory handler:
private handleBossVictory(): void {
  const actManager = ActManager.getInstance();
  const currentActId = actManager.getCurrentActId();
  
  // Stop combat scene and transition
  this.scene.stop();
  this.scene.stop('Overworld'); // Stop parent too
  
  this.scene.start('ActTransition', {
    fromActId: currentActId,
    victory: true
  });
}
```

---

## 📊 Phase Summary

| Phase | Duration | Risk | Key Deliverable | Status |
|-------|----------|------|------------------|--------|
| 0 | 1h | ⬜ None | Remove dead code (Game.ts, Map.ts) | ⏳ Not Started |
| 1 | 2h | ⬜ Low | Centralized utilities (RelicSpriteUtils) | ⏳ Not Started |
| 2 | 4-5h | ⬜ None | Foundation types (ActTypes, EnemyTypes, IWorldGenerator) | ⏳ Not Started |
| 3 | 3-4h | 🟨 Low-Med | Relocate systems (rename *Manager → *System) | ⏳ Not Started |
| 4 | 5-6h | 🟨 Medium | Manager layer (ActManager + EnemyManager) | ⏳ Not Started |
| 5 | 5-6h | 🟧 Med-High | Act-aware Overworld | ⏳ Not Started |
| 6A-C | 12-16h | 🟧 Med-High | Combat system extraction (TurnSystem, etc.) | ⏳ Not Started |
| 7 | 5-6h | 🟨 Medium | Standardized overlays (BaseOverlay) | ⏳ Not Started |
| 8 | 2h | 🟨 Medium | Enhance ChapterTransition with ActManager | ⏳ Not Started |
| 9 | Future | 🟨 Medium | AI System foundation (for NPC refactor) | 📅 Planned |

**Total Estimated Time**: 40-50 hours (Phases 0-8)

> **Note**: Original estimate was 32-46h. Adjusted based on February 3, 2026 feasibility assessment accounting for god class complexity (Overworld 4,350 lines, Combat+CombatUI 8,500+ lines).

---

## Phase 9: AI System Foundation (Future)

> **Status**: ⏳ Planned - To be done alongside NPC Class Refactoring project  
> **Reference**: See [PROPOSED_AI_CHANGES.md](../../AI/PROPOSED_AI_CHANGES.md) for full NPC design

**Duration**: 4-6 hours  
**Risk**: 🟨 Medium  
**Dependencies**: Phase 2 complete (EnemyTypes defined)

### Objective
Create the AI system folder structure that will support NPC pathing and combat behaviors.

### Tasks

#### 9.1 Create AI Folder Structure

```
CREATE FOLDERS:
src/core/ai/
src/core/ai/pathing/
src/core/ai/combat/
```

#### 9.2 Create Pathing Behavior Interface

```typescript
// NEW FILE: src/core/ai/pathing/IPathingBehavior.ts

import { PathingType } from '../../types/EnemyTypes';

export interface PathingContext {
  enemyPosition: { x: number; y: number };
  playerPosition: { x: number; y: number };
  isNight: boolean;
  detectionRange: number;
}

export interface PathingResult {
  targetPosition: { x: number; y: number } | null;
  shouldMove: boolean;
}

/**
 * Interface for pathing behaviors
 * Implementations: ChaseBehavior, AmbushBehavior, WanderBehavior, etc.
 */
export interface IPathingBehavior {
  readonly type: PathingType;
  
  /**
   * Calculate next move for enemy
   */
  calculateMove(context: PathingContext): PathingResult;
  
  /**
   * Called when enemy is spawned
   */
  initialize(config: Record<string, unknown>): void;
  
  /**
   * Called when day/night changes
   */
  onPhaseChange(isNight: boolean): void;
}
```

#### 9.3 Create Combat Behavior Interface

```typescript
// NEW FILE: src/core/ai/combat/ICombatBehavior.ts

import { CombatEntity, StatusEffect } from '../../types/CombatTypes';

export interface CombatAIContext {
  self: CombatEntity;
  targets: CombatEntity[];
  turnNumber: number;
  abilitiesUsed: string[];
}

export interface CombatAction {
  type: 'attack' | 'ability' | 'defend' | 'special';
  abilityId?: string;
  targetId?: string;
}

/**
 * Interface for combat AI behaviors
 * Implementations: BasicAttackerAI, DefensiveAI, BossAI, etc.
 */
export interface ICombatBehavior {
  /**
   * Decide next action in combat
   */
  decideAction(context: CombatAIContext): CombatAction;
  
  /**
   * Called at start of enemy turn
   */
  onTurnStart(context: CombatAIContext): void;
  
  /**
   * Called when enemy takes damage
   */
  onDamageTaken(amount: number, source: string): void;
  
  /**
   * Called when boss enters new phase (boss only)
   */
  onPhaseChange?(phaseId: number): void;
}
```

#### 9.4 Create Index

```typescript
// NEW FILE: src/core/ai/index.ts

export * from './pathing/IPathingBehavior';
export * from './combat/ICombatBehavior';

// Future behavior implementations:
// export * from './pathing/ChaseBehavior';
// export * from './pathing/AmbushBehavior';
// export * from './combat/BasicAttackerAI';
// export * from './combat/BossAI';
```

### Verification
- [ ] TypeScript compilation succeeds
- [ ] AI interfaces align with EnemyTypes from Phase 2
- [ ] Ready for NPC Class Refactoring to implement these interfaces

---

## ✅ Success Criteria

### After Phase 0-3:
- [ ] No dead code
- [ ] No duplicated utilities
- [ ] Proper folder structure (`systems/` for logic, `core/managers/` for content interfaces)
- [ ] Systems renamed appropriately (*System suffix)
- [ ] All existing functionality works

### After Phase 4:
- [ ] ActManager provides act configuration
- [ ] EnemyManager provides enemy lookup
- [ ] Content creators can add enemies via `Act1Enemies.ts`
- [ ] `src/core/entities/` folder exists (placeholder for NPC refactor)

### After Phase 5:
- [ ] Overworld uses act config (not hardcoded)
- [ ] Game still plays identically

### After Phase 6:
- [ ] Combat.ts under 1000 lines
- [ ] Turn flow in TurnSystem
- [ ] Card selection in CardSelectionSystem
- [ ] Rewards in RewardSystem

### After Phase 7-8:
- [ ] All overlays use BaseOverlay
- [ ] Boss victory triggers ChapterTransition with ActManager
- [ ] Act 2 can be added by creating Act2Config.ts + Act2Enemies.ts

### After Phase 9 (Future):
- [ ] AI interfaces defined for NPC refactoring project
- [ ] Pathing behaviors can be implemented
- [ ] Combat AI behaviors can be implemented
- [ ] Ready for NPC → Enemy class migration

---

## 📅 Recommended Execution Order (Feb 2026)

Based on feasibility assessment, here's the recommended weekly schedule:

```
Week 1: Low-Risk Foundation (7h)
├── Phase 0: Delete Game.ts, Map.ts (1h)
├── Phase 1: Create RelicSpriteUtils.ts, remove 4 duplicates (2h)
└── Phase 2: Create types (ActTypes, EnemyTypes, IWorldGenerator) (4h)

Week 2: System Infrastructure (10h)
├── Phase 3: Move Overworld_*Manager.ts → systems/ (4h)
└── Phase 4: Create ActManager, EnemyManager (6h)

Week 3: Integration (8h)
├── Phase 5A: Add ActManager import to Overworld (2h)
├── Phase 5B: Replace hardcoded values with ActConfig lookups (2h)
├── Phase 5C: Update node generation to use act config (2h)
└── Phase 8: Enhance ChapterTransition with ActManager (2h)

Week 4-5: Combat Extraction - HIGH RISK (16h)
├── Phase 6A: TurnSystem extraction - PROOF OF CONCEPT (4h)
│   └── If successful, proceed with 6B-6C
├── Phase 6B: CardSelectionSystem extraction (4h)
├── Phase 6C: RewardSystem extraction (3h)
└── Testing & stabilization (5h)

Week 6: Polish (6h)
├── Phase 7: BaseOverlay standardization (5h)
└── Final testing & documentation (1h)
```

### Quick Wins (Do First)
1. **Phase 0**: Delete unused files (immediate cleanup)
2. **Phase 1**: RelicSpriteUtils (removes 4 duplications, low risk)
3. **Phase 8**: Enhance ChapterTransition (already exists, just add ActManager)

### High-Risk Phases (Needs Careful Planning)
1. **Phase 5**: Overworld is 4,350 lines - recommend sub-phases
2. **Phase 6**: Combat+CombatUI is 8,500+ lines - do TurnSystem as proof-of-concept first

---

## 🚨 Rollback Strategy

Each phase should be committed separately. If issues arise:

1. `git revert` the problematic phase
2. Fix issues in isolation
3. Re-apply with fixes

**Recommended Git Workflow**:
```bash
git checkout -b refactor/phase-0-cleanup
# Complete phase 0
git commit -m "Phase 0: Remove unused scenes (Game.ts, Map.ts)"
git checkout main
git merge refactor/phase-0-cleanup

git checkout -b refactor/phase-1-utilities
# Complete phase 1
# ... repeat for each phase
```

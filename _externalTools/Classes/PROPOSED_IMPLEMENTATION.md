# Bathala Scene Architecture - Proposed Implementation

> **Analysis Date**: January 21, 2026  
> **Version**: Target for GDD v5.9+  
> **Purpose**: Scalable architecture supporting multiple Acts/Levels with different generation methods

---

## 🎯 Design Goals

1. **Scalability**: Easily add Act 2, Act 3, and beyond
2. **Modularity**: Each Act can have unique generation, enemies, and mechanics
3. **Maintainability**: Scenes under 500 lines, clear separation of concerns
4. **Testability**: Business logic decoupled from Phaser rendering
5. **Future-Proofing**: Plugin architecture for new Acts without touching core

---

## 🏗️ Proposed Architecture

### High-Level Scene Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BOOT SEQUENCE                                  │
│   Boot → Preloader → Disclaimer → MainMenu                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────────┐
                    ▼               ▼                   ▼
              ┌──────────┐   ┌───────────┐       ┌───────────┐
              │ Settings │   │  Discover │       │  Credits  │
              └──────────┘   │ (Bestiary)│       └───────────┘
                             └───────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │       PROLOGUE        │
                        │    (Story + Tutorial) │
                        └───────────┬───────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORLD SCENE (Generic)                             │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    ACT CONFIGURATION                                │   │
│   │                                                                     │   │
│   │  Act 1: Corrupted Ancestral Forests                                 │   │
│   │    - Generator: MazeOverworldGenerator                              │   │
│   │    - Enemies: Chapter 1 pool (Tikbalang, Kapre, etc.)              │   │
│   │    - Boss: Mangangaway                                              │   │
│   │    - Theme: Lupa/Hangin focus                                       │   │
│   │                                                                     │   │
│   │  Act 2: SAMPLE Submerged Barangays                                         │   │
│   │    - Generator: IslandArchipelagoGenerator (new)                    │   │
│   │    - Enemies: Chapter 2 pool (Sirena, Bakunawa, etc.)              │   │
│   │    - Boss: Bakunawa                                                 │   │
│   │    - Theme: Tubig/Apoy focus                                        │   │
│   │                                                                     │   │
│   │  Act 3: SAMPLE Skyward Citadel                                             │   │
│   │    - Generator: FloatingIslandsGenerator (new)                      │   │
│   │    - Enemies: Chapter 3 pool (Sarimanok, Apolaki, etc.)            │   │
│   │    - Boss: False Bathala                                            │   │
│   │    - Theme: Multi-element focus                                     │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    OVERLAY SCENES (Reusable)                        │   │
│   │                                                                     │   │
│   │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐    │   │
│   │  │  Shop   │ │Campfire │ │ Treasure │ │  Event  │ │  Combat   │    │   │
│   │  │         │ │         │ │          │ │         │ │           │    │   │
│   │  │ (Items  │ │ (Rest/  │ │ (Loot    │ │(Random  │ │ (Card     │    │   │
│   │  │  vary   │ │  Upgrade)│ │  rewards)│ │ events) │ │  battles) │    │   │
│   │  │  by Act)│ │         │ │          │ │         │ │           │    │   │
│   │  └─────────┘ └─────────┘ └──────────┘ └─────────┘ └───────────┘    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Boss Victory → ActTransition Scene → Next Act's World                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Final Boss Victory)
                        ┌───────────────────────┐
                        │       EPILOGUE        │
                        │  (Ending based on     │
                        │   Landás alignment)   │
                        └───────────────────────┘
```

---

## 📁 Proposed File Structure

```
src/
├── game/
│   ├── main.ts
│   │
│   ├── scenes/                          # ONLY Phaser Scene classes (thin orchestrators)
│   │   ├── boot/
│   │   │   ├── Boot.ts                  # ~100 lines
│   │   │   └── Preloader.ts             # ~300 lines (asset loading)
│   │   │
│   │   ├── menu/
│   │   │   ├── MainMenu.ts              # ~200 lines
│   │   │   ├── Settings.ts              # ~300 lines
│   │   │   ├── Credits.ts               # ~200 lines
│   │   │   └── Disclaimer.ts            # ~200 lines
│   │   │
│   │   ├── narrative/
│   │   │   ├── Prologue.ts              # ~200 lines
│   │   │   ├── ActTransition.ts         # NEW: Between-act cinematics
│   │   │   └── Epilogue.ts              # NEW: Ending scene
│   │   │
│   │   ├── world/                       # RENAMED from Overworld
│   │   │   └── World.ts                 # ~300 lines (generic world scene)
│   │   │
│   │   ├── overlays/                    # Scenes that launch over World
│   │   │   ├── Combat.ts                # ~300 lines (orchestrates combat)
│   │   │   ├── Shop.ts                  # ~300 lines
│   │   │   ├── Campfire.ts              # ~300 lines
│   │   │   ├── Treasure.ts              # ~300 lines
│   │   │   ├── Event.ts                 # ~200 lines
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
├── systems/                             # NEW: Game Systems (business logic)
│   │
│   ├── world/                           # World/Overworld systems
│   │   ├── WorldSystem.ts               # Coordinates all world logic
│   │   ├── MovementSystem.ts            # Player movement
│   │   ├── NodeInteractionSystem.ts     # Interact with map nodes
│   │   ├── DayNightSystem.ts            # Day/night cycle
│   │   ├── FogOfWarSystem.ts            # Visibility
│   │   └── NPCSystem.ts                 # Enemy spawning/AI
│   │
│   ├── combat/                          # Combat systems
│   │   ├── CombatSystem.ts              # Core combat state machine
│   │   ├── TurnSystem.ts                # Turn management
│   │   ├── CardSelectionSystem.ts       # Hand/card logic
│   │   ├── ActionSystem.ts              # Attack/Defend/Special
│   │   └── RewardSystem.ts              # Post-combat rewards
│   │
│   ├── generation/                      # Map generation strategies
│   │   ├── IWorldGenerator.ts           # Interface for generators
│   │   ├── MazeGenerator.ts             # Act 1: Forest maze
│   │   ├── ArchipelagoGenerator.ts      # Act 2: Island chains
│   │   └── SkyIslandsGenerator.ts       # Act 3: Floating platforms
│   │
│   └── shared/
│       ├── InputSystem.ts               # Cross-scene input handling
│       └── AudioSystem.ts               # Music/SFX management
│
├── acts/                                # NEW: Act-specific configurations
│   ├── ActConfig.ts                     # Interface for act configuration
│   ├── ActRegistry.ts                   # Registry of all acts
│   │
│   ├── act1/
│   │   ├── Act1Config.ts                # Act 1 configuration
│   │   ├── Act1Enemies.ts               # Enemy pool for Act 1
│   │   ├── Act1Events.ts                # Events for Act 1
│   │   └── Act1Relics.ts                # Relics specific to Act 1
│   │
│   ├── act2/
│   │   ├── Act2Config.ts
│   │   ├── Act2Enemies.ts
│   │   ├── Act2Events.ts
│   │   └── Act2Relics.ts
│   │
│   └── act3/
│       ├── Act3Config.ts
│       ├── Act3Enemies.ts
│       ├── Act3Events.ts
│       └── Act3Relics.ts
│
├── core/
│   ├── managers/                        # Cross-cutting singletons
│   │   ├── GameState.ts                 # Global game state
│   │   ├── ActManager.ts                # NEW: Manages act transitions
│   │   ├── ProgressManager.ts           # NEW: Save/load progress
│   │   ├── MusicManager.ts
│   │   ├── RelicManager.ts
│   │   └── StatusEffectManager.ts
│   │
│   ├── dda/                             # DDA system
│   │   └── RuleBasedDDA.ts
│   │
│   └── types/                           # Type definitions
│       ├── ActTypes.ts                  # NEW: Act-related types
│       ├── CombatTypes.ts
│       └── MapTypes.ts
│
└── utils/                               # Pure utility functions
    ├── RelicSpriteUtils.ts              # NEW: Centralized relic sprite lookup
    ├── DamageCalculator.ts
    ├── HandEvaluator.ts
    └── DeckManager.ts
```

---

## 🔧 Key Architectural Changes

### 1. Generic World Scene with Act Plugin System

**Current** (`Overworld.ts` - Act 1 hardcoded):
```typescript
export class Overworld extends Scene {
    constructor() {
        super({ key: "Overworld" });
    }
    
    create(): void {
        // Hardcoded maze generation
        this.mazeGenManager = new Overworld_MazeGenManager(this, 32, this.testButtonsVisible);
        // Hardcoded Act 1 enemies
        // Hardcoded Act 1 events
    }
}
```

**Proposed** (`World.ts` - Act-agnostic):
```typescript
import { ActManager } from '../../core/managers/ActManager';
import { IWorldGenerator } from '../../systems/generation/IWorldGenerator';
import { WorldSystem } from '../../systems/world/WorldSystem';

export class World extends Scene {
    private actManager: ActManager;
    private worldSystem: WorldSystem;
    private generator: IWorldGenerator;
    
    constructor() {
        super({ key: "World" });
    }
    
    init(data: { actId?: number }): void {
        this.actManager = ActManager.getInstance();
        
        // Load act config (defaults to current act if not specified)
        const actConfig = this.actManager.getActConfig(data.actId);
        
        // Get the appropriate generator for this act
        this.generator = this.actManager.getGenerator(actConfig.generatorType);
    }
    
    create(): void {
        const actConfig = this.actManager.getCurrentActConfig();
        
        // Initialize world system with act-specific config
        this.worldSystem = new WorldSystem(this, {
            generator: this.generator,
            enemyPool: actConfig.enemies,
            eventPool: actConfig.events,
            theme: actConfig.theme,
            boss: actConfig.boss
        });
        
        // Delegate all logic to the system
        this.worldSystem.initialize();
    }
    
    update(time: number, delta: number): void {
        this.worldSystem.update(time, delta);
    }
}
```

---

### 2. Act Configuration System

**New File**: `src/acts/ActConfig.ts`
```typescript
import { IWorldGenerator } from '../systems/generation/IWorldGenerator';
import { EnemyConfig } from '../core/entities/EnemyTypes';
import { GameEvent } from '../data/events/EventTypes';
import { Relic } from '../core/types/CombatTypes';

export interface ActConfig {
    id: number;
    name: string;
    subtitle: string;               // e.g., "The Corrupted Ancestral Forests"
    theme: ActTheme;
    
    // Generation
    generatorType: GeneratorType;
    generatorConfig: GeneratorConfig;
    
    // Content pools
    commonEnemies: EnemyConfig[];
    eliteEnemies: EnemyConfig[];
    boss: EnemyConfig;
    
    events: GameEvent[];
    relics: Relic[];
    shopItems: ShopItem[];
    
    // Visual/Audio
    backgroundKey: string;
    musicKey: string;
    ambientSounds: string[];
    
    // Progression
    requiredCyclesToBoss: number;   // Default 5
    actionsPerCycle: number;        // Default 100 (50 day + 50 night)
}

export enum GeneratorType {
    MAZE = 'maze',                  // Act 1: Forest maze
    ARCHIPELAGO = 'archipelago',    // Act 2: Islands connected by bridges
    SKY_ISLANDS = 'sky_islands',    // Act 3: Floating platforms
    LINEAR = 'linear',              // Tutorial/Prologue
}

export interface ActTheme {
    primaryElements: Suit[];        // e.g., [Lupa, Hangin] for Act 1
    colorPalette: {
        primary: number;
        secondary: number;
        accent: number;
    };
}
```

**Example**: `src/acts/act1/Act1Config.ts`
```typescript
import { ActConfig, GeneratorType } from '../ActConfig';
import { ALL_ACT1_COMMON_ENEMIES, ALL_ACT1_ELITE_ENEMIES } from '../../data/enemies/act1';
import { MANGANGAWAY_CONFIG } from '../../data/enemies/boss/Mangangaway';
import { Act1Events } from '../../data/events/Act1Events';
import { act1CommonRelics, act1EliteRelics } from '../../data/relics';

export const ACT1_CONFIG: ActConfig = {
    id: 1,
    name: "Chapter 1",
    subtitle: "The Corrupted Ancestral Forests",
    theme: {
        primaryElements: ['lupa', 'hangin'],
        colorPalette: {
            primary: 0x2d4a3e,    // Forest green
            secondary: 0x1a2f26,  // Dark forest
            accent: 0x77888C      // Mist grey
        }
    },
    
    generatorType: GeneratorType.MAZE,
    generatorConfig: {
        chunkSize: 32,
        pathWidth: 1,
        roomChance: 0.15
    },
    
    commonEnemies: ALL_ACT1_COMMON_ENEMIES,
    eliteEnemies: ALL_ACT1_ELITE_ENEMIES,
    boss: MANGANGAWAY_CONFIG,
    
    events: Act1Events,
    relics: [...act1CommonRelics, ...act1EliteRelics],
    
    backgroundKey: 'forest_bg',
    musicKey: 'overworld_ambient',
    ambientSounds: ['wind_rustle', 'birds_distant'],
    
    requiredCyclesToBoss: 5,
    actionsPerCycle: 100
};
```

---

### 3. Act Manager

**New File**: `src/core/managers/ActManager.ts`
```typescript
import { ActConfig, GeneratorType } from '../../acts/ActConfig';
import { ACT1_CONFIG } from '../../acts/act1/Act1Config';
import { ACT2_CONFIG } from '../../acts/act2/Act2Config';
import { ACT3_CONFIG } from '../../acts/act3/Act3Config';
import { IWorldGenerator } from '../../systems/generation/IWorldGenerator';
import { MazeGenerator } from '../../systems/generation/MazeGenerator';
import { ArchipelagoGenerator } from '../../systems/generation/ArchipelagoGenerator';
import { SkyIslandsGenerator } from '../../systems/generation/SkyIslandsGenerator';

export class ActManager {
    private static instance: ActManager;
    private currentActId: number = 1;
    private actConfigs: Map<number, ActConfig> = new Map();
    private generators: Map<GeneratorType, () => IWorldGenerator> = new Map();
    
    private constructor() {
        // Register all acts
        this.registerAct(ACT1_CONFIG);
        this.registerAct(ACT2_CONFIG);
        this.registerAct(ACT3_CONFIG);
        
        // Register generators
        this.generators.set(GeneratorType.MAZE, () => new MazeGenerator());
        this.generators.set(GeneratorType.ARCHIPELAGO, () => new ArchipelagoGenerator());
        this.generators.set(GeneratorType.SKY_ISLANDS, () => new SkyIslandsGenerator());
    }
    
    static getInstance(): ActManager {
        if (!ActManager.instance) {
            ActManager.instance = new ActManager();
        }
        return ActManager.instance;
    }
    
    registerAct(config: ActConfig): void {
        this.actConfigs.set(config.id, config);
    }
    
    getCurrentActConfig(): ActConfig {
        return this.actConfigs.get(this.currentActId)!;
    }
    
    getActConfig(actId?: number): ActConfig {
        return this.actConfigs.get(actId ?? this.currentActId)!;
    }
    
    getGenerator(type: GeneratorType): IWorldGenerator {
        const factory = this.generators.get(type);
        if (!factory) {
            throw new Error(`Unknown generator type: ${type}`);
        }
        return factory();
    }
    
    advanceToNextAct(): boolean {
        const nextActId = this.currentActId + 1;
        if (this.actConfigs.has(nextActId)) {
            this.currentActId = nextActId;
            return true;
        }
        return false; // No more acts (game complete)
    }
    
    resetToAct(actId: number): void {
        if (this.actConfigs.has(actId)) {
            this.currentActId = actId;
        }
    }
    
    isLastAct(): boolean {
        return !this.actConfigs.has(this.currentActId + 1);
    }
}
```

---

### 4. World Generator Interface

**New File**: `src/systems/generation/IWorldGenerator.ts`
```typescript
import { MapNode } from '../../core/types/MapTypes';

export interface GeneratorConfig {
    seed?: number;
    chunkSize?: number;
    [key: string]: any;  // Act-specific config options
}

export interface IWorldGenerator {
    /**
     * Initialize the generator with configuration
     */
    initialize(config: GeneratorConfig): void;
    
    /**
     * Generate a chunk of the world at the given coordinates
     */
    generateChunk(chunkX: number, chunkY: number): ChunkData;
    
    /**
     * Get valid spawn position for player
     */
    getPlayerSpawnPosition(): { x: number; y: number };
    
    /**
     * Check if a world position is walkable
     */
    isWalkable(worldX: number, worldY: number): boolean;
    
    /**
     * Get nodes (NPCs, interactables) in a chunk
     */
    getNodesInChunk(chunkX: number, chunkY: number): MapNode[];
    
    /**
     * Clean up resources
     */
    dispose(): void;
}

export interface ChunkData {
    tiles: number[][];           // Tile type grid
    walkable: boolean[][];       // Collision grid
    nodes: MapNode[];            // Interactive nodes
    decorations: Decoration[];   // Visual decorations
}
```

---

### 5. Act Transition Scene

**New File**: `src/game/scenes/narrative/ActTransition.ts`
```typescript
import { Scene } from 'phaser';
import { ActManager } from '../../../core/managers/ActManager';
import { ProgressManager } from '../../../core/managers/ProgressManager';

export class ActTransition extends Scene {
    private fromActId: number;
    private toActId: number;
    
    constructor() {
        super({ key: 'ActTransition' });
    }
    
    init(data: { fromActId: number; toActId: number }): void {
        this.fromActId = data.fromActId;
        this.toActId = data.toActId;
    }
    
    create(): void {
        const actManager = ActManager.getInstance();
        const progressManager = ProgressManager.getInstance();
        
        // Save progress at act completion
        progressManager.saveActCompletion(this.fromActId);
        
        // Get act info for display
        const completedAct = actManager.getActConfig(this.fromActId);
        const nextAct = actManager.getActConfig(this.toActId);
        
        // Display act completion screen
        this.showActComplete(completedAct);
        
        // After animation, show next act intro
        this.time.delayedCall(3000, () => {
            this.showNextActIntro(nextAct);
        });
        
        // Continue to next act
        this.input.once('pointerdown', () => {
            actManager.advanceToNextAct();
            this.scene.start('World', { actId: this.toActId });
        });
    }
    
    private showActComplete(act: ActConfig): void {
        const { width, height } = this.cameras.main;
        
        this.add.text(width / 2, height / 3, `${act.name} Complete`, {
            fontFamily: 'dungeon-mode-inverted',
            fontSize: 48,
            color: '#d4af37'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 3 + 60, act.subtitle, {
            fontFamily: 'dungeon-mode',
            fontSize: 24,
            color: '#77888C'
        }).setOrigin(0.5);
    }
    
    private showNextActIntro(act: ActConfig): void {
        // Fade in next act preview
        const { width, height } = this.cameras.main;
        
        const nextActText = this.add.text(width / 2, height * 2/3, 
            `Next: ${act.name}\n${act.subtitle}`, {
            fontFamily: 'dungeon-mode',
            fontSize: 28,
            color: '#77888C',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);
        
        this.tweens.add({
            targets: nextActText,
            alpha: 1,
            duration: 1000
        });
    }
}
```

---

### 6. Remove Unused Scenes

**DELETE these files**:
- `src/game/scenes/Game.ts` - Unused placeholder
- `src/game/scenes/Map.ts` - Unused Slay the Spire style map

**MOVE these to proper locations**:
- `Overworld_MazeGenManager.ts` → `src/systems/generation/MazeGenerator.ts`
- `Overworld_KeyInputManager.ts` → `src/systems/shared/InputSystem.ts`
- `Overworld_TooltipManager.ts` → `src/game/ui/world/TooltipManager.ts`
- `Overworld_FogOfWarManager.ts` → `src/systems/world/FogOfWarSystem.ts`

---

### 7. Centralized Utility Functions

**New File**: `src/utils/RelicSpriteUtils.ts`
```typescript
/**
 * Centralized relic sprite key lookup
 * Previously duplicated in 5+ files
 */
const RELIC_SPRITE_MAP: Record<string, string> = {
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
    'umalagad_spirit': 'relic_umalagad_spirit'
};

export function getRelicSpriteKey(relicId: string): string {
    return RELIC_SPRITE_MAP[relicId] || '';
}

export function hasRelicSprite(relicId: string): boolean {
    return relicId in RELIC_SPRITE_MAP;
}
```

---

## 📋 Scene Inventory (Proposed)

| Scene | Location | Lines | Purpose |
|-------|----------|-------|---------|
| `Boot` | boot/Boot.ts | ~100 | Minimal asset load |
| `Preloader` | boot/Preloader.ts | ~300 | Full asset load |
| `Disclaimer` | menu/Disclaimer.ts | ~200 | Legal info |
| `MainMenu` | menu/MainMenu.ts | ~200 | Main navigation |
| `Settings` | menu/Settings.ts | ~300 | Game settings |
| `Credits` | menu/Credits.ts | ~200 | Rolling credits |
| `Prologue` | narrative/Prologue.ts | ~200 | Story + tutorial |
| `ActTransition` | narrative/ActTransition.ts | ~200 | **NEW**: Between acts |
| `Epilogue` | narrative/Epilogue.ts | ~200 | **NEW**: Game ending |
| `World` | world/World.ts | ~300 | **RENAMED**: Generic overworld |
| `Combat` | overlays/Combat.ts | ~300 | Card battles |
| `Shop` | overlays/Shop.ts | ~300 | Purchase items |
| `Campfire` | overlays/Campfire.ts | ~300 | Rest/upgrade |
| `Treasure` | overlays/Treasure.ts | ~300 | Loot rewards |
| `Event` | overlays/Event.ts | ~200 | Random events |
| `PokerHandReference` | overlays/PokerHandReference.ts | ~200 | Hand guide popup |
| `GameOver` | gameover/GameOver.ts | ~300 | Death screen |
| `Discover` | menu/Discover.ts | ~400 | Bestiary |
| `DDADebugScene` | debug/ | - | Debug only |
| `CombatDebugScene` | debug/ | - | Debug only |

**Total: 18 scenes** (down from 22, with 2 new narrative scenes added)

---

## 🔄 Migration Roadmap

### Phase 1: Foundation (Week 1-2)
1. [ ] Create `src/utils/RelicSpriteUtils.ts` and remove duplicates
2. [ ] Create `src/acts/` folder structure
3. [ ] Define `ActConfig` interface and `ActManager`
4. [ ] Create `ACT1_CONFIG` from existing hardcoded values

### Phase 2: World Refactor (Week 3-4)
1. [ ] Rename `Overworld.ts` → `World.ts`
2. [ ] Create `IWorldGenerator` interface
3. [ ] Move `Overworld_MazeGenManager` → `MazeGenerator` implementing interface
4. [ ] Create `WorldSystem` to coordinate world logic
5. [ ] Update `World.ts` to use `ActManager` and `WorldSystem`

### Phase 3: Combat Refactor (Week 5-6)
1. [ ] Create `CombatSystem`, `TurnSystem`, `CardSelectionSystem`
2. [ ] Slim down `Combat.ts` to ~300 lines
3. [ ] Slim down `CombatUI.ts` into smaller components

### Phase 4: Multi-Act Support (Week 7-8)
1. [ ] Create `ActTransition` scene
2. [ ] Implement boss victory → act transition flow
3. [ ] Create placeholder `ACT2_CONFIG` and `ACT3_CONFIG`
4. [ ] Implement `ArchipelagoGenerator` for Act 2

### Phase 5: Cleanup (Week 9)
1. [ ] Delete `Game.ts` and `Map.ts`
2. [ ] Move remaining managers to proper locations
3. [ ] Update all imports
4. [ ] Update scene registration in `main.ts`

---

## 📊 Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Largest scene | 4,350 lines | <500 lines |
| Average scene | 1,148 lines | <300 lines |
| Unused scenes | 2 | 0 |
| Code duplication | 5+ copies | 0 (centralized) |
| Acts supported | 1 | 3 |
| Generator types | 1 | 3+ |
| Time to add new Act | Days | Hours |

---

## 🎯 Benefits of Proposed Architecture

1. **Easy Act Addition**: Add `act4/Act4Config.ts` with a new generator → instant new content
2. **Testable**: Systems are decoupled from Phaser, can unit test business logic
3. **Maintainable**: Each file has single responsibility, easy to understand
4. **Flexible**: Swap generators per act, mix and match content pools
5. **Scalable**: Add new generator types (cave, dungeon, city) without touching scenes
6. **Future-Proof**: Clear extension points for DLC, mods, or community content

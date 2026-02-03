# Bathala Scene Architecture - Current Implementation Analysis

> **Analysis Date**: February 3, 2026  
> **Version**: Based on GDD v5.8.14.25  
> **Purpose**: Document current scene structure, identify issues, and establish baseline for refactoring

---

## 📊 Scene Inventory

### Complete Scene List (22 Total)

| Scene Key | File | Lines | Purpose | Status |
|-----------|------|-------|---------|--------|
| `Boot` | Boot.ts | 105 | Load minimal assets, show splash | ✅ Proper |
| `Preloader` | Preloader.ts | 693 | Load all game assets | ✅ Proper |
| `Disclaimer` | Disclaimer.ts | 417 | Legal disclaimers, thesis info | ✅ Proper |
| `MainMenu` | MainMenu.ts | 421 | Main menu navigation | ✅ Proper |
| `Prologue` | Prologue/Prologue.ts | 216 | Story intro + tutorial | ✅ Proper |
| `Settings` | Settings.ts | 708 | Game settings | ✅ Proper |
| `Overworld` | Overworld.ts | **4,627** | Maze exploration (Act 1 baseline) | 🔴 **GOD CLASS** |
| `Combat` | Combat.ts | **4,294** | Card combat system (Act 1-3 aware) | 🔴 **GOD CLASS** |
| `Shop` | Shop.ts | **2,419** | Purchase relics | 🟠 Bloated |
| `Campfire` | Campfire.ts | **2,135** | Rest/upgrade cards | 🟠 Bloated |
| `Treasure` | Treasure.ts | 1,023 | Loot rewards | 🟡 Acceptable |
| `EventScene` | Event.ts | 543 | Random events | ✅ Proper |
| `GameOver` | GameOver.ts | 727 | Death screen | ✅ Proper |
| `Credits` | Credits.ts | 292 | Rolling credits | ✅ Proper |
| `Discover` | Discover.ts | 1,046 | Bestiary/compendium | 🟡 Large |
| `Map` | Map.ts | 437 | Slay the Spire style map | ⚠️ **UNUSED** |
| `Game` | Game.ts | 64 | Placeholder welcome screen | ⚠️ **UNUSED** |
| `PokerHandReference` | PokerHandReference.ts | 563 | Poker hand guide popup | ✅ Overlay |
| `DDADebugScene` | debug/DDADebugScene.ts | 2,597 | DDA testing/analytics | 🟠 Debug only |
| `CombatDebugScene` | debug/CombatDebugScene.ts | 486 | Combat testing | ✅ Debug only |
| `DDASimulatorScene` | DDASimulatorScene.ts | 594 | DDA simulation | ✅ Debug only |

---

## 🔄 Scene Flow Diagram

```
                                    ┌─────────────────────────────────────┐
                                    │              BOOT                   │
                                    │         (Asset Loading)             │
                                    └─────────────┬───────────────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────────────────┐
                                    │            PRELOADER                │
                                    │      (Full Asset Loading)           │
                                    └─────────────┬───────────────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────────────────┐
                                    │           DISCLAIMER                │
                                    │     (Legal + Thesis Info)           │
                                    └─────────────┬───────────────────────┘
                                                  │
                                                  ▼
                        ┌─────────┬───────────────────────────┬──────────┐
                        │         │         MAIN MENU         │          │
                        │         │                           │          │
                        ▼         ▼                           ▼          ▼
                   ┌─────────┐ ┌─────────┐             ┌──────────┐ ┌─────────┐
                   │SETTINGS │ │DISCOVER │             │ CREDITS  │ │PROLOGUE │
                   │         │ │(Bestiary)│             │          │ │(Tutorial)│
                   └────┬────┘ └────┬────┘             └────┬─────┘ └────┬────┘
                        │          │                        │            │
                        └──────────┴────────────────────────┘            │
                                   │                                     │
                                   ▼                                     ▼
                        ┌──────────────────────────────────────────────────────┐
                        │                     OVERWORLD                        │
                        │              (Maze Exploration - Act 1)              │
                        │                                                      │
                        │  ┌────────────────────────────────────────────────┐  │
                        │  │              LAUNCHED OVERLAYS                 │  │
                        │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐         │  │
                        │  │  │  SHOP   │ │CAMPFIRE │ │ TREASURE │         │  │
                        │  │  │(overlay)│ │(overlay)│ │ (overlay)│         │  │
                        │  │  └─────────┘ └─────────┘ └──────────┘         │  │
                        │  │  ┌─────────┐ ┌──────────────────────┐         │  │
                        │  │  │  EVENT  │ │ POKER HAND REFERENCE │         │  │
                        │  │  │(overlay)│ │      (overlay)       │         │  │
                        │  │  └─────────┘ └──────────────────────┘         │  │
                        │  └────────────────────────────────────────────────┘  │
                        │                                                      │
                        │  ┌────────────────────────────────────────────────┐  │
                        │  │             COMBAT (launched)                  │  │
                        │  │  ┌─────────────────────────────────────────┐   │  │
                        │  │  │ Player Victory → Resume Overworld       │   │  │
                        │  │  │ Player Death   → GameOver Scene         │   │  │
                        │  │  │ Boss Victory   → Chapter progression    │   │  │
                        │  │  └─────────────────────────────────────────┘   │  │
                        │  └────────────────────────────────────────────────┘  │
                        └──────────────────────────────────────────────────────┘
                                               │
                                               ▼ (Death)
                                    ┌─────────────────────────────────────┐
                                    │            GAME OVER                │
                                    │      → Returns to MainMenu          │
                                    └─────────────────────────────────────┘
```

---

## ⚠️ Critical Issues Identified

### 1. **UNUSED SCENES**

#### `Game.ts` (65 lines) - **DEAD CODE**
```typescript
// Current implementation - just a welcome message that goes to Overworld
this.input.once("pointerdown", () => {
    this.scene.start("Overworld");
});
```
**Problem**: This scene exists but is NEVER reached in the normal flow. The `Map.ts` scene references it, but `Map.ts` itself is unused.

**Evidence**: 
- Not in the main flow (Boot → Preloader → Disclaimer → MainMenu → Prologue → Overworld)
- Only Map.ts calls `scene.start("Game")` but Map.ts is unreachable

#### `Map.ts` (438 lines) - **DEAD CODE**
```typescript
// Slay the Spire style map - NEVER USED
export class Map extends Scene {
    constructor() {
        super({ key: "Map" });
    }
}
```
**Problem**: This is a traditional Slay the Spire-style node map, but the game uses `Overworld.ts` with procedural maze generation instead.

**Evidence**:
- No scene ever calls `scene.start("Map")`
- Overworld handles all exploration

---

### 2. **GOD CLASS SCENES**

#### `Overworld.ts` (4,627 lines) - **CRITICAL**

Contains responsibilities that should be separated:
- Maze generation and rendering (1,170+ lines already extracted to `Overworld_MazeGenManager.ts`)
- Player movement and animation
- Day/Night cycle system
- NPC/Enemy spawning and AI
- Node interaction (Shop, Campfire, Combat triggers)
- UI rendering (health, relics, potions, currency, deck info)
- Boss encounter logic
- Fog of war system (542+ lines extracted to `Overworld_FogOfWarManager.ts`)
- Input handling (242 lines extracted to `Overworld_KeyInputManager.ts`)
- Tooltips (624 lines extracted to `Overworld_TooltipManager.ts`)

**Partially Extracted but Still Coupled**:
- `Overworld_MazeGenManager.ts` - 1,170 lines
- `Overworld_KeyInputManager.ts` - 242 lines
- `Overworld_TooltipManager.ts` - 624 lines
- `Overworld_FogOfWarManager.ts` - 542 lines

**Remaining in Scene**: ~1,772 lines (still 3.5x too large)

#### `Combat.ts` (4,294 lines) - **CRITICAL**

Contains responsibilities that should be separated:
- Combat state machine
- Card selection and hand evaluation
- Damage/block calculation
- Status effect processing
- Enemy AI and intent
- Relic effect triggers
- DDA integration
- Reward generation
- UI rendering (cards, health bars, status icons)
- Animations (attacks, damage, death)
- Music lifecycle
- Landás (morality) choices

**Already Extracted**:
- `CombatUI.ts` - 4,270 lines (but THIS is also a god class!)
- `CombatDDA.ts` - DDA integration
- `CombatAnimations.ts` - Attack/effect animations
- `CombatDialogue.ts` - Enemy dialogue

---

### 3. **HARDCODED / PARTIAL ACT REFERENCES**

The current implementation still has "Act 1" hardcoded in exploration and events, while combat/rewards have partial Act 2/3 support:

```typescript
// In Map.ts (unused)
this.add.text(screenWidth/2, 50, "Forest of Whispers - Act 1", {...});

// In Event.ts (runtime)
import { CombinedAct1Events } from '../../data/events';
const availableEvents = CombinedAct1Events;

// In maze node generation (runtime)
import { ACT1_COMMON_ENEMIES, ACT1_ELITE_ENEMIES } from "../../data/enemies/Act1Enemies";
```

**Current State**:
- **Act 2/3 aware**: Combat enemy selection + boss progression, Shop + Treasure pools (chapter-based), debug tools for enemies/events.
- **Act 1 locked**: Overworld node generation, tooltip enemy lists, and runtime event pools remain Act 1 only.
- **Result**: New levels exist in data/combat, but overworld exploration and events do not yet scale with chapter.

---

### 4. **INCONSISTENT SCENE COMMUNICATION**

#### Mixed Patterns Used:

1. **Data Passing via `init()`** (Correct):
```typescript
// Campfire.ts
init(data: { player: Player }) {
    this.player = data.player;
}
```

2. **Global Singleton Access** (Inconsistent):
```typescript
// Sometimes uses GameState singleton
const gameState = GameState.getInstance();
const savedPlayerData = gameState.getPlayerData();

// Sometimes expects data passed via init()
this.player = data.player;
```

3. **Registry** (Underutilized):
```typescript
// Phaser's built-in registry is rarely used
this.registry.set('playerData', playerData);  // Not used
```

---

### 5. **DUPLICATED CODE**

The `getRelicSpriteKey()` function is still duplicated in multiple files (partially centralized):
- `Shop.ts` (lines 12-40)
- `Campfire.ts` (somewhere)
- `Treasure.ts` (lines 22-51)
- `CombatUI.ts` (lines 19-46)
> Note: `Overworld.ts` now imports the shared utility, but other scenes still use local copies.

```typescript
// Same function duplicated everywhere
function getRelicSpriteKey(relicId: string): string {
  const spriteMap: Record<string, string> = {
    'swift_wind_agimat': 'relic_swift_wind_agimat',
    // ... 20+ entries
  };
  return spriteMap[relicId] || '';
}
```

---

## 🎮 Scene Lifecycle Usage

### Correct Usage ✅

| Pattern | Example | When |
|---------|---------|------|
| `scene.start()` | `MainMenu → Prologue` | Full scene replacement |
| `scene.launch() + pause()` | `Overworld → Shop` | Overlay that returns |
| `scene.stop() + resume()` | `Shop → Overworld` | Close overlay |
| `scene.launch()` | `Combat → PokerHandReference` | Non-blocking overlay |

### Current Flow Issues

1. **Combat exits inconsistently**:
  - Victory → Just resumes Overworld (correct)
  - Death → `scene.start("GameOver")` (destroys Overworld - may lose state)
  - Boss Victory → Chapter progression is triggered in `Combat`, but no Act-complete screen or chapter-themed overworld setup

2. **Partial Act Transition Logic**:
  - Chapter unlock/reset now occurs after boss defeat in `Combat`.
  - Missing: Act-complete screen, chapter-themed overworld generation, chapter-themed events/tooltip content.

---

## 📁 File Organization Issues

### Current Structure (Problematic):
```
src/game/scenes/
├── Boot.ts
├── Campfire.ts
├── Combat.ts                    # 4,294 lines - GOD CLASS
├── Credits.ts
├── DDASimulatorScene.ts
├── Disclaimer.ts
├── Discover.ts
├── Event.ts
├── Game.ts                      # UNUSED
├── GameOver.ts
├── MainMenu.ts
├── Map.ts                       # UNUSED
├── Overworld.ts                 # 4,627 lines - GOD CLASS
├── Overworld_FogOfWarManager.ts # Wrong location (not a scene)
├── Overworld_KeyInputManager.ts # Wrong location (not a scene)
├── Overworld_MazeGenManager.ts  # Wrong location (not a scene)
├── Overworld_TooltipManager.ts  # Wrong location (not a scene)
├── PokerHandReference.ts
├── Preloader.ts
├── Settings.ts
├── Shop.ts                      # 2,419 lines - Bloated
├── Treasure.ts
├── combat/                      # Good start on extraction
│   ├── CombatAnimations.ts
│   ├── CombatDDA.ts
│   ├── CombatDialogue.ts
│   └── CombatUI.ts              # 4,270 lines - GOD CLASS
├── debug/
│   ├── CombatDebugScene.ts
│   └── DDADebugScene.ts
└── Prologue/
    ├── Prologue.ts
    ├── TutorialManager.ts
    └── ...
```

**Problem**: Managers are mixed with scenes, making it unclear what's a Phaser Scene vs. a helper class.

---

## 🎯 Summary of Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| `Overworld.ts` is 4,627 lines | 🔴 Critical | Unmaintainable, hard to extend |
| `Combat.ts` is 4,294 lines | 🔴 Critical | Unmaintainable, hard to test |
| `Map.ts` unused | 🟠 Medium | Dead code, confusing |
| `Game.ts` unused | 🟠 Medium | Dead code |
| Act 2/3 only partially wired | 🔴 Critical | New levels not reflected in overworld/events |
| Hardcoded Act 1 in overworld/events/tooltips | 🔴 Critical | No scaling in exploration loop |
| Duplicated `getRelicSpriteKey` | 🟡 Low | Maintenance burden |
| Managers in scenes/ folder | 🟡 Low | Confusing structure |
| Inconsistent state management | 🟠 Medium | Potential bugs |

---

## 📈 Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Average scene size | 1,148 lines | <500 lines |
| Largest scene | 4,627 lines | <500 lines |
| Unused scenes | 2 | 0 |
| Duplicated functions | 3+ copies | 1 source |
| Act support | Partial (Combat/Shop/Treasure) | Acts 1-3 end-to-end |

---

## Next Steps

See `PROPOSED_IMPLEMENTATION.md` for the recommended architecture that addresses all these issues.

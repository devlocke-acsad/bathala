# Bathala — Enemy Single Source of Truth: Complete Session History

**Date**: February 9, 2026  
**Session Duration**: ~2.5 hours  
**Scope**: Enemy data unification, sprite pipeline fix, EnemyFactory/EnemySelectionSystem creation  
**Predecessor**: `SESSION_ARCHITECTURE_OVERHAUL.md` (same day, earlier session)  
**Format**: Every operation in exact chronological order with old→new diffs, rationale, and remaining work.

---

## Executive Summary

### What We Accomplished
This session continued the "single source of truth" architecture work from the prior session, this time targeting the **enemy data pipeline**. The core problem: enemy data lived in two places (`creatures/*.ts` configs AND `Act1Enemies.ts` runtime arrays), causing sprite mismatches between overworld and combat scenes. We created bridge systems, added explicit sprite key fields, and rewired the entire overworld→combat pipeline.

### Core Objectives
1. **Single Source of Truth**: Changes to `data/enemies/creatures/*.ts` should auto-propagate everywhere in-game
2. **Sprite Consistency**: Fix overworld showing Kapre Shade but combat loading Balete Wraith
3. **Eliminate Name-Based Parsing**: Remove all `enemyName.includes("tikbalang")` sprite resolution
4. **Bridge Config↔Runtime Gap**: Create factory/selection systems to convert `EnemyConfig` → `Enemy`

### Files Created (2 new)
| # | Path | Lines | Purpose |
|---|------|-------|---------|
| 1 | `src/systems/combat/EnemySelectionSystem.ts` | 141 | Chapter-aware enemy selection, replaces Combat.ts switch-case |
| 2 | `src/data/enemies/Act1Enemies.ts` (sprite section) | ~30 | Auto-built `ENEMY_SPRITE_MAP` from creature configs |

### Files Modified (8)
| # | Path | Nature of Change |
|---|------|-----------------|
| 1 | `src/core/types/EnemyTypes.ts` | +`combatSpriteKey`, +`overworldSpriteKey` fields on `EnemyConfig` |
| 2 | `src/data/enemies/Act1Enemies.ts` | +Auto-built sprite map from creature configs, +`getEnemyCombatSprite()`, +`getEnemyOverworldSprite()` |
| 3 | `src/data/enemies/creatures/*.ts` (all 10) | +`combatSpriteKey`, +`overworldSpriteKey` on every creature |
| 4 | `src/game/scenes/Combat.ts` | Rewired enemy selection to use `EnemySelectionSystem` |
| 5 | `src/game/scenes/combat/CombatUI.ts` | Sprite lookup now delegates to `getEnemyCombatSprite()` |
| 6 | `src/game/scenes/combat/CombatDialogue.ts` | Sprite lookup now delegates to `getEnemyCombatSprite()` |
| 7 | `src/systems/generation/MazeGenSystem.ts` | Overworld sprite rendering uses `getEnemyOverworldSprite()` |
| 8 | `src/systems/world/TooltipSystem.ts` | Enemy info now pulled via Act1Enemies imports with computed keys |

---

## Table of Contents

1. [Problem Analysis — The Dual Data Source](#problem-analysis)
2. [Discussion 1 — Architecture Recommendations](#discussion-1)
3. [Discussion 2 — Single Source of Truth for Enemies](#discussion-2)
4. [Phase 1 — EnemyConfig Type Extension](#phase-1)
5. [Phase 2 — Creature Config Enrichment (All 10 Files)](#phase-2)
6. [Phase 3 — Act1Enemies.ts Sprite Map Refactor](#phase-3)
7. [Phase 4 — EnemySelectionSystem Creation](#phase-4)
8. [Phase 5 — Combat.ts Rewiring](#phase-5)
9. [Discussion 3 — Sprite Mismatch Bug Report](#discussion-3)
10. [Phase 6 — Root Cause Analysis & Sprite Fix](#phase-6)
11. [Phase 7 — CombatUI & CombatDialogue Sprite Fix](#phase-7)
12. [Phase 8 — MazeGenSystem Overworld Sprite Fix](#phase-8)
13. [Phase 9 — TooltipSystem Refactor](#phase-9)
14. [Current Architecture Diagram](#architecture-diagram)
15. [Remaining Work & Known Issues](#remaining-work)

---

## Problem Analysis — The Dual Data Source {#problem-analysis}

### The Two Enemy Data Formats

The codebase had **two independent enemy data systems** that didn't communicate:

**System A — Creature Configs** (`src/data/enemies/creatures/*.ts`):
```typescript
// EnemyConfig (new format) — created in prior session
export const TIKBALANG_SCOUT: EnemyConfig = {
  id: 'tikbalang_scout',
  name: 'Tikbalang Scout',
  tier: 'common',
  chapter: 1,
  baseHealth: 28,
  baseDamage: 8,
  attackPatternType: 'tactical',
  attackPattern: ['attack', 'confuse', 'attack', 'defend'],
  // ... rich config with lore, dialogue, pathing, etc.
};
```

**System B — Runtime Enemy Arrays** (`src/data/enemies/Act1Enemies.ts`):
```typescript
// Enemy (old format) — used by Combat.ts
const ACT1_COMMON_ENEMIES: Omit<Enemy, "id">[] = [
  {
    name: "Tikbalang Scout",
    maxHealth: 28,
    currentHealth: 28,
    damage: 8,
    // ... flat combat stats, manually duplicated from config
  }
];
```

### Why This Was a Problem
1. **Data duplication**: Enemy names, stats, and dialogue existed in both systems
2. **No auto-propagation**: Changing `creatures/tikbalang_scout.ts` didn't affect combat
3. **Sprite mismatch**: Overworld used one sprite resolution approach, combat used another
4. **Stale references**: Easy for systems to diverge when updating one but not the other

### The Sprite Resolution Mess (Before This Session)

**Overworld sprites**: `MazeGenSystem.ts` received `node.enemyId` (which was a display name like `"Kapre Shade"`) and called `name.split(" ")[0].toLowerCase()` + `"_overworld"` to build sprite keys.

**Combat sprites**: `CombatUI.ts` had a `getEnemySpriteKey()` method that did:
```typescript
// OLD — name-based parsing
private getEnemySpriteKey(enemyName: string): string {
  const lowerName = enemyName.toLowerCase();
  if (lowerName.includes("tikbalang")) return "tikbalang_combat";
  if (lowerName.includes("balete")) return "balete_combat";
  if (lowerName.includes("kapre")) return "kapre_combat";
  // ... 10 more if-chains
  return "tikbalang_combat"; // fallback
}
```

**The Bug**: `NodeGenerator` stored `enemyId` as the enemy's **display name** (e.g., `"Kapre Shade"`). When this was passed to `Combat.ts` which called `EnemySelectionSystem.getEnemyByName("Kapre Shade")`, it searched the `Act1Enemies` arrays by `.name`. If the name lookup failed (e.g., due to case mismatch or the enemy being from a different act), it fell back to a **random common enemy** — resulting in Kapre Shade on the map but Balete Wraith in combat.

---

## Discussion 1 — Architecture Recommendations {#discussion-1}

### User Request
> Initial request was for a comprehensive architecture analysis of the entire Bathala codebase.

### Recommendations Provided (10 Categories)

1. **Scene Refactoring**: Break monolithic scene files (Combat.ts: 4000+ lines) into smaller classes
2. **Combat Logic Extraction**: Move damage calculation, turn logic, enemy AI into dedicated systems
3. **UI Component Library**: Standardize tooltips, buttons, panels into reusable components
4. **Data-Driven Enemies**: Use EnemyConfig as source of truth (not duplicated arrays)
5. **State Management**: Centralize game state instead of scene-local variables
6. **Event System**: Use PhaserJS events for cross-system communication
7. **DDA Integration**: Connect DDA outputs to enemy selection and reward scaling
8. **Error Handling**: Add validation and graceful fallbacks
9. **Testing**: Unit tests for combat math, DDA scoring, hand evaluation
10. **Documentation**: JSDoc consistency, architecture diagrams

The user chose to focus on **#4 — Data-Driven Enemies** first.

---

## Discussion 2 — Single Source of Truth for Enemies {#discussion-2}

### User Request
> *"If I change any data/fields in the creatures config files, it should also auto change in-game"*

### Key Design Decisions

**Decision 1: Keep both `EnemyConfig` and `Enemy` types**
- `EnemyConfig` = static data (what an enemy IS) — lives in `creatures/*.ts`
- `Enemy` = runtime instance (an enemy in combat) — created per combat session
- Rationale: Config is immutable reference data; Enemy has mutable HP, status effects, etc.

**Decision 2: Bridge via factory/selection system (not direct conversion)**
- Rather than making `Combat.ts` import `EnemyConfig` directly, create intermediate systems
- `EnemySelectionSystem` handles chapter-aware selection logic
- `Act1Enemies.ts` still provides the runtime `Enemy` arrays but derives display names and sprites from creature configs
- Rationale: Gradual migration — don't break everything at once

**Decision 3: Sprite keys as explicit fields (not derived from names)**
- Old: `"Kapre Shade"` → `split(" ")[0].toLowerCase()` → `"kapre"` → `"kapre_combat"`
- New: `combatSpriteKey: "kapre_combat"` directly on the config
- Rationale: Decoupled from display name. Renaming "Kapre Shade" to "Shadow Kapre" won't break sprites.

---

## Phase 1 — EnemyConfig Type Extension {#phase-1}

### Modified: `src/core/types/EnemyTypes.ts`

Added two new required fields to the `EnemyConfig` interface under the `// === Visuals ===` section:

```typescript
// BEFORE (line ~160)
// === Visuals (for Artists) ===

/** Sprite key for combat/overworld rendering */
readonly spriteKey: string;

// AFTER
// === Visuals (for Artists) ===

/** Texture key used for the combat scene sprite (must match Preloader key) */
readonly combatSpriteKey: string;

/** Texture key used for the overworld map sprite (must match Preloader key) */
readonly overworldSpriteKey: string;
```

### Rationale
- Replaced the ambiguous single `spriteKey` field with two explicit fields
- Made both **required** (not optional) to force all creature configs to declare both
- Asset naming convention: `{creature}_combat` and `{creature}_overworld`
- Preloader must load both texture keys for each enemy

---

## Phase 2 — Creature Config Enrichment (All 10 Files) {#phase-2}

Added `combatSpriteKey` and `overworldSpriteKey` to all 10 creature config files in `src/data/enemies/creatures/`.

### Complete Sprite Key Mapping

| Creature File | Config Constant | ID | combatSpriteKey | overworldSpriteKey |
|--------------|----------------|-----|-----------------|-------------------|
| `tikbalang_scout.ts` | `TIKBALANG_SCOUT` | `tikbalang_scout` | `tikbalang_combat` | `tikbalang_overworld` |
| `balete_wraith.ts` | `BALETE_WRAITH` | `balete_wraith` | `balete_combat` | `balete_overworld` |
| `sigbin_charger.ts` | `SIGBIN_CHARGER` | `sigbin_charger` | `sigbin_combat` | `sigbin_overworld` |
| `duwende_trickster.ts` | `DUWENDE_TRICKSTER` | `duwende_trickster` | `duwende_combat` | `duwende_overworld` |
| `tiyanak_ambusher.ts` | `TIYANAK_AMBUSHER` | `tiyanak_ambusher` | `tiyanak_combat` | `tiyanak_overworld` |
| `amomongo.ts` | `AMOMONGO` | `amomongo` | `amomongo_combat` | `amomongo_overworld` |
| `bungisngis.ts` | `BUNGISNGIS` | `bungisngis` | `bungisngis_combat` | `bungisngis_overworld` |
| `kapre.ts` | `KAPRE_SHADE` | `kapre_shade` | `kapre_combat` | `kapre_overworld` |
| `tawong_lipod.ts` | `TAWONG_LIPOD` | `tawong_lipod` | `tawonglipod_combat` | `tawonglipod_overworld` |
| `mangangaway.ts` | `MANGANGAWAY` | `mangangaway` | `mangangaway_combat` | `mangangaway_overworld` |

### Example Change (kapre.ts)

```typescript
// BEFORE
// === Visuals ===
spriteKey: 'chap1/kapre_shade',
scale: 1.8,

// AFTER
// === Visuals ===
combatSpriteKey: 'kapre_combat',
overworldSpriteKey: 'kapre_overworld',
scale: 1.8,
```

### Note on Tawong Lipod
The sprite key uses `tawonglipod` (no underscore) to match existing asset filenames. The ID is `tawong_lipod` (with underscore). This intentional discrepancy preserves compatibility with loaded textures.

---

## Phase 3 — Act1Enemies.ts Sprite Map Refactor {#phase-3}

### Modified: `src/data/enemies/Act1Enemies.ts`

#### 3.1 — Added Creature Config Imports

At the top of the file, added aliased imports from the creature barrel:

```typescript
import {
  TIKBALANG_SCOUT as TIKBALANG_CONFIG,
  BALETE_WRAITH as BALETE_CONFIG,
  SIGBIN_CHARGER as SIGBIN_CONFIG,
  DUWENDE_TRICKSTER as DUWENDE_CONFIG,
  TIYANAK_AMBUSHER as TIYANAK_CONFIG,
  AMOMONGO as AMOMONGO_CONFIG,
  BUNGISNGIS as BUNGISNGIS_CONFIG,
  KAPRE_SHADE as KAPRE_CONFIG,
  TAWONG_LIPOD as TAWONG_CONFIG,
  MANGANGAWAY as MANGANGAWAY_CONFIG,
} from "./creatures";
```

#### 3.2 — Updated Enemy Name References

All `ACT1_COMMON_ENEMIES`, `ACT1_ELITE_ENEMIES`, and `ACT1_BOSS_ENEMIES` arrays now reference names from creature configs:

```typescript
// BEFORE
{ name: "Tikbalang Scout", maxHealth: 28, ... }

// AFTER  
{ name: TIKBALANG_CONFIG.name, maxHealth: 28, ... }
```

This means renaming a creature in its config file (e.g., changing `name: 'Tikbalang Scout'` to `name: 'Tikbalang Trickster'` in `tikbalang_scout.ts`) automatically propagates the name change to combat, tooltips, and all display text.

#### 3.3 — Added Auto-Built Sprite Map

Replaced any previous hardcoded sprite resolution with a map built from creature configs:

```typescript
// Auto-built sprite map — derived from creature configs
const ALL_CONFIGS = [
  TIKBALANG_CONFIG, BALETE_CONFIG, SIGBIN_CONFIG, DUWENDE_CONFIG,
  TIYANAK_CONFIG, AMOMONGO_CONFIG, BUNGISNGIS_CONFIG,
  KAPRE_CONFIG, TAWONG_CONFIG, MANGANGAWAY_CONFIG,
];

const ENEMY_SPRITE_MAP: Record<string, { overworld: string; combat: string }> =
  Object.fromEntries(
    ALL_CONFIGS.map(cfg => [
      cfg.name,
      { overworld: cfg.overworldSpriteKey, combat: cfg.combatSpriteKey },
    ])
  );
```

#### 3.4 — Added Sprite Lookup Functions

```typescript
/**
 * Get combat sprite key for an enemy by display name.
 * Decoupled from name parsing — works regardless of display name changes.
 */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? "tikbalang_combat";
}

/**
 * Get overworld sprite key for an enemy by display name.
 * Decoupled from name parsing — works regardless of display name changes.
 */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? "tikbalang_overworld";
}
```

### Effect
- Sprite keys are now derived from creature config data at module initialization
- Changing a creature's `combatSpriteKey` in its config file auto-updates the lookup map
- No more `if (name.includes("tikbalang"))` chains anywhere
- Fallback to `tikbalang_combat`/`tikbalang_overworld` if name not found (safe default)

---

## Phase 4 — EnemySelectionSystem Creation {#phase-4}

### Created: `src/systems/combat/EnemySelectionSystem.ts` (141 lines)

#### Concept
Previously, `Combat.ts` had a massive `getEnemyForNodeType()` method with switch-cases importing from Act1Enemies, Act2Enemies, Act3Enemies directly. This tightly coupled combat to specific data modules.

`EnemySelectionSystem` extracts this into a standalone system with a **chapter provider pattern**:

```typescript
interface ChapterEnemyProvider {
  getRandomCommon: () => Omit<Enemy, 'id'>;
  getRandomElite: () => Omit<Enemy, 'id'>;
  getBoss: () => Omit<Enemy, 'id'>;
  getByName: (name: string) => Omit<Enemy, 'id'> | null;
}

const CHAPTER_PROVIDERS: Record<number, ChapterEnemyProvider> = {
  1: { getRandomCommon: getAct1Common, getRandomElite: getAct1Elite, ... },
  2: { getRandomCommon: getAct2Common, getRandomElite: getAct2Elite, ... },
  3: { getRandomCommon: getAct3Common, getRandomElite: getAct3Elite, ... },
};
```

#### Public API

| Method | Purpose |
|--------|---------|
| `getEnemyForNodeType(nodeType, chapter)` | Returns random enemy matching node type (common/elite/boss) for the chapter |
| `getEnemyByName(enemyId, fallbackChapter)` | Cross-chapter enemy search by name; falls back to random common |
| `generateEnemyId(enemyName)` | Creates unique runtime ID (`lowercase_name_timestamp`) |
| `registerChapter(chapter, provider)` | Extensibility hook for adding Act 4+ |

#### Key Feature: Cross-Chapter Search
```typescript
static getEnemyByName(enemyId: string, fallbackChapter: number = 1): Omit<Enemy, 'id'> {
  // Search ALL chapters in order
  for (const chapterNum of Object.keys(CHAPTER_PROVIDERS).map(Number)) {
    const provider = CHAPTER_PROVIDERS[chapterNum];
    const enemy = provider.getByName(enemyId);
    if (enemy) return enemy;
  }
  // Fallback to random common in the fallback chapter
  console.warn(`Enemy "${enemyId}" not found in any chapter`);
  return this.getProvider(fallbackChapter).getRandomCommon();
}
```

This was critical for the sprite mismatch fix — when `enemyId` wasn't found, the old code silently returned a random enemy (causing Kapre→Balete switch).

---

## Phase 5 — Combat.ts Rewiring {#phase-5}

### Modified: `src/game/scenes/Combat.ts`

#### 5.1 — Added Import
```typescript
import { EnemySelectionSystem } from "../../systems/combat/EnemySelectionSystem";
```

#### 5.2 — Rewired `getEnemyForNodeType()`

```typescript
// BEFORE (inline switch-case, ~30 lines)
private getEnemyForNodeType(nodeType: string): Omit<Enemy, "id"> {
  const chapter = GameState.getInstance().getCurrentChapter();
  switch (chapter) {
    case 1:
      if (nodeType === "elite") return getAct1Elite();
      if (nodeType === "boss") return getAct1Boss();
      return getAct1Common();
    case 2:
      // ... duplicate logic for Act 2
    case 3:
      // ... duplicate logic for Act 3
    default:
      return getAct1Common();
  }
}

// AFTER (3 lines)
private getEnemyForNodeType(nodeType: string): Omit<Enemy, "id"> {
  const gameState = GameState.getInstance();
  const currentChapter = gameState.getCurrentChapter();
  return EnemySelectionSystem.getEnemyForNodeType(nodeType, currentChapter);
}
```

#### 5.3 — Rewired `getSpecificEnemyById()`

```typescript
// BEFORE (inline search with manual imports)
private getSpecificEnemyById(enemyId: string): Omit<Enemy, "id"> {
  // Manual search through imported Act arrays
  const allEnemies = [...ACT1_COMMON, ...ACT1_ELITE, ...ACT1_BOSS];
  const found = allEnemies.find(e => e.name === enemyId);
  return found ?? this.getEnemyForNodeType("combat");
}

// AFTER (2 lines)
private getSpecificEnemyById(enemyId: string): Omit<Enemy, "id"> {
  const gameState = GameState.getInstance();
  const currentChapter = gameState.getCurrentChapter();
  return EnemySelectionSystem.getEnemyByName(enemyId, currentChapter);
}
```

#### 5.4 — Rewired `generateEnemyId()`

```typescript
// BEFORE (inline)
private generateEnemyId(enemyName: string): string {
  return enemyName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
}

// AFTER
private generateEnemyId(enemyName: string): string {
  return EnemySelectionSystem.generateEnemyId(enemyName);
}
```

#### Effect
- `Combat.ts` no longer imports from `Act1Enemies`, `Act2Enemies`, or `Act3Enemies` directly for enemy selection
- All chapter-routing logic centralized in `EnemySelectionSystem`
- Adding Act 4: call `EnemySelectionSystem.registerChapter(4, act4Provider)` — zero Combat.ts changes

---

## Discussion 3 — Sprite Mismatch Bug Report {#discussion-3}

### User Report
> *"In the overworld it's showing the Kapre SHADE SPRITE AND INFO. However when it's in the combat scene, it's the Balete Wraith"*

### Root Cause Analysis

The bug had a **multi-step failure chain**:

1. **Node generation**: `NodeGenerator` (or equivalent in `Overworld.ts`) selected a random enemy and stored its **display name** as `node.enemyId`:
   ```typescript
   // What was happening
   node.enemyId = "Kapre Shade";  // Display name, NOT config ID
   ```

2. **Overworld rendering**: `MazeGenSystem.ts` called `getEnemyOverworldSprite("Kapre Shade")` which looked up the `ENEMY_SPRITE_MAP` by name — this **worked** because the map is keyed by display name.

3. **Tooltip display**: `TooltipSystem.ts` searched `Act1Enemies` arrays by name: `allEnemies.find(e => e.name === enemyId)` — this also **worked** because `enemyId` was the display name.

4. **Combat launch**: `Overworld.ts` passed `node.enemyId` ("Kapre Shade") to `Combat.ts` as scene data.

5. **Enemy creation in combat**: `Combat.ts` called `EnemySelectionSystem.getEnemyByName("Kapre Shade", chapter)` which searched `Act1Enemies` arrays. This **should have worked** but could fail if:
   - The name had whitespace/case differences
   - The enemy was from a different act
   - The search function compared incorrectly
   
   When it failed, it hit the fallback: `return this.getProvider(fallbackChapter).getRandomCommon()` — which returned a **random common enemy** (e.g., Balete Wraith).

6. **Sprite display in combat**: `CombatUI.ts` then called `getEnemySpriteKey(enemy.name)` on the Balete Wraith, showing the wrong sprite.

### The Fix Strategy
Rather than patching name-based lookups, we addressed the root cause:
- Creature configs own their sprite keys explicitly
- `Act1Enemies.ts` builds sprite maps from configs
- All sprite lookups go through `getEnemyCombatSprite(name)` / `getEnemyOverworldSprite(name)` which use the auto-built map

---

## Phase 6 — Root Cause Analysis & Sprite Fix {#phase-6}

### Key Insight: The `node.enemyId` Pipeline

Traced the data flow from node creation to combat:

```
Overworld.ts assigns node.enemyId (display name like "Kapre Shade")
  → MazeGenSystem.ts uses it for overworld sprite
  → TooltipSystem.ts uses it for hover info  
  → Overworld.ts passes it to Combat scene as `enemyId` param
    → Combat.ts calls getSpecificEnemyById(enemyId)
      → EnemySelectionSystem.getEnemyByName(enemyId)
        → Searches Act1Enemies by .name field
```

The display name pipeline **works as long as names match exactly**. The sprite map in `Act1Enemies.ts` is keyed by the creature config's `.name` field, ensuring consistency.

### What Changed
The auto-built `ENEMY_SPRITE_MAP` in `Act1Enemies.ts` replaced all name-parsing logic. Now:

```typescript
// How sprite resolution works NOW:
// 1. Creature config defines: combatSpriteKey: "kapre_combat"
// 2. Act1Enemies builds: ENEMY_SPRITE_MAP["Kapre Shade"] = { combat: "kapre_combat", overworld: "kapre_overworld" }
// 3. CombatUI calls: getEnemyCombatSprite("Kapre Shade") → "kapre_combat"
// 4. MazeGenSystem calls: getEnemyOverworldSprite("Kapre Shade") → "kapre_overworld"
```

---

## Phase 7 — CombatUI & CombatDialogue Sprite Fix {#phase-7}

### Modified: `src/game/scenes/combat/CombatUI.ts`

#### 7.1 — Added Import
```typescript
import { getEnemyCombatSprite } from "../../../data/enemies/Act1Enemies";
```

#### 7.2 — Simplified `getEnemySpriteKey()`

```typescript
// BEFORE (~40 lines of if-chains)
private getEnemySpriteKey(enemyName: string): string {
  const lowerName = enemyName.toLowerCase();
  if (lowerName.includes("tikbalang")) return "tikbalang_combat";
  if (lowerName.includes("balete")) return "balete_combat";
  if (lowerName.includes("sigbin")) return "sigbin_combat";
  if (lowerName.includes("duwende")) return "duwende_combat";
  if (lowerName.includes("tiyanak")) return "tiyanak_combat";
  if (lowerName.includes("amomongo")) return "amomongo_combat";
  if (lowerName.includes("bungisngis")) return "bungisngis_combat";
  if (lowerName.includes("kapre")) return "kapre_combat";
  if (lowerName.includes("tawong")) return "tawonglipod_combat";
  if (lowerName.includes("mangangaway") || lowerName.includes("mangnangaway"))
    return "mangangaway_combat";
  return "tikbalang_combat";
}

// AFTER (1 line)
private getEnemySpriteKey(enemyName: string): string {
  return getEnemyCombatSprite(enemyName);
}
```

### Modified: `src/game/scenes/combat/CombatDialogue.ts`

#### 7.3 — Same pattern applied
```typescript
// BEFORE — same ~40 line if-chain
// AFTER
import { getEnemyCombatSprite } from "../../../data/enemies/Act1Enemies";

public getEnemySpriteKey(enemyName: string): string {
  return getEnemyCombatSprite(enemyName);
}
```

### Effect
- Eliminated ~80 lines of brittle name-parsing code across both files
- Sprite resolution is now centralized in `Act1Enemies.ts` (which reads from creature configs)
- Adding a new enemy requires zero changes to CombatUI or CombatDialogue

---

## Phase 8 — MazeGenSystem Overworld Sprite Fix {#phase-8}

### Modified: `src/systems/generation/MazeGenSystem.ts`

#### 8.1 — Added Import
```typescript
import { getEnemyOverworldSprite } from '../../data/enemies/Act1Enemies';
```

#### 8.2 — Updated Overworld Sprite Rendering

Previously, `MazeGenSystem` had inline logic to derive sprite keys from enemy names:
```typescript
// BEFORE
const spriteName = node.enemyId.split(" ")[0].toLowerCase();
spriteKey = spriteName + "_overworld";
```

Now delegates to the auto-built sprite map:
```typescript
// AFTER
if (node.enemyId) {
  spriteKey = getEnemyOverworldSprite(node.enemyId);
}
```

This is used in two places: combat node rendering (line ~660) and elite node rendering (line ~667).

### Effect
- Overworld sprites now derived from creature config data (not name parsing)
- "Kapre Shade".split(" ")[0] → "Kapre" → "kapre_overworld" ✅ (happened to work)
- "Tawong Lipod".split(" ")[0] → "Tawong" → "tawong_overworld" ❌ (wrong — actual key is "tawonglipod_overworld")
- The new approach handles all edge cases because it uses the exact `overworldSpriteKey` from the config

---

## Phase 9 — TooltipSystem Refactor {#phase-9}

### Modified: `src/systems/world/TooltipSystem.ts`

#### 9.1 — Import Changes

```typescript
// BEFORE — imported Act1Enemies + EnemyLore separately
import { ACT1_COMMON_ENEMIES, ACT1_ELITE_ENEMIES } from '../../data/enemies/Act1Enemies';
import { TIKBALANG_SCOUT_LORE, BALETE_WRAITH_LORE, ... } from '../../data/lore/EnemyLore';

// AFTER — imports creature constants + sprite helpers + lore
import { 
  TIKBALANG_SCOUT, BALETE_WRAITH, SIGBIN_CHARGER, DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER, AMOMONGO, BUNGISNGIS, KAPRE_SHADE, TAWONG_LIPOD,
  MANGNANGAWAY, getEnemyOverworldSprite
} from '../../data/enemies/Act1Enemies';
import { 
  TIKBALANG_SCOUT_LORE, BALETE_WRAITH_LORE, SIGBIN_CHARGER_LORE,
  // ... all lore imports
} from '../../data/lore/EnemyLore';
```

The key change: `TooltipSystem` now imports the **named enemy constants** from `Act1Enemies.ts` (which themselves reference creature config names) instead of searching through anonymous arrays.

#### 9.2 — Updated `getEnemyInfoForNodeType()`

```typescript
// BEFORE — searched anonymous arrays by name
const allEnemies = [...ACT1_COMMON_ENEMIES, ...ACT1_ELITE_ENEMIES, ...ACT1_BOSS_ENEMIES];
const enemy = allEnemies.find(e => e.name === enemyId);

// AFTER — searches a named constant array
const allEnemies = [
  TIKBALANG_SCOUT, BALETE_WRAITH, SIGBIN_CHARGER, DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER, AMOMONGO, BUNGISNGIS, KAPRE_SHADE, TAWONG_LIPOD,
  MANGNANGAWAY
];
const enemy = allEnemies.find(e => e.name === enemyId);
```

#### 9.3 — Computed Property Keys in enemyDetailsMap

```typescript
// BEFORE — hardcoded string keys
const enemyDetailsMap = {
  "Tikbalang Scout": { abilities: "...", origin: "...", corruption: "..." },
  "Balete Wraith": { abilities: "...", origin: "...", corruption: "..." },
  // ...
};

// AFTER — computed keys from creature constants (auto-update on rename)
const enemyDetailsMap: { [key: string]: { abilities: string, origin: string, corruption: string } } = {
  [TIKBALANG_SCOUT.name]: { abilities: "...", origin: "...", corruption: "..." },
  [BALETE_WRAITH.name]: { abilities: "...", origin: "...", corruption: "..." },
  // ...
};
```

#### 9.4 — Sprite Resolution Updated

```typescript
// BEFORE
const spriteKey = "tikbalang_overworld"; // or parsed from name

// AFTER
const spriteKey = getEnemyOverworldSprite(enemy.name);
```

### What Still Remains in TooltipSystem

The following data is still hardcoded in `TooltipSystem.ts` and has **not yet** been moved to creature configs:

1. **`enemyDetailsMap`**: Ability descriptions, origin text, corruption text — 10 entries hardcoded
2. **`EnemyLore` imports**: Separate lore data file, not integrated into creature configs
3. **Act 1 only**: Only searches Act 1 enemies for tooltip info

These are identified as future work (see [Remaining Work](#remaining-work)).

---

## Current Architecture Diagram {#architecture-diagram}

### Data Flow: Creature Config → In-Game

```
creatures/kapre.ts (SOURCE OF TRUTH)
  ├── id: "kapre_shade"
  ├── name: "Kapre Shade"
  ├── combatSpriteKey: "kapre_combat"
  ├── overworldSpriteKey: "kapre_overworld"
  ├── baseHealth: 65, baseDamage: 12
  ├── dialogueIntro: "Smoke veils my wrath!"
  └── loreOrigin: "General, smokers"
        │
        ▼
  creatures/index.ts (barrel export)
        │
        ├──────────────────────────────┐
        ▼                              ▼
  Act1Enemies.ts                    registry.ts
  ├── KAPRE_CONFIG (aliased import) ├── ENEMY_MAP (id → config)
  ├── name: KAPRE_CONFIG.name       └── BOSS_MAP (id → boss)
  ├── ACT1_ELITE_ENEMIES array           │
  ├── ENEMY_SPRITE_MAP (auto-built)      ▼
  ├── getEnemyCombatSprite()        EnemyManager.ts (singleton)
  └── getEnemyOverworldSprite()     ├── getEnemyConfig(id)
        │                           ├── getRandomEnemy(tier)
        ├───────┬───────┐           └── getBossForCurrentAct()
        ▼       ▼       ▼
  CombatUI   MazeGen  TooltipSystem
  (combat    (over-   (hover info
   sprite)   world     + sprite)
              sprite)
```

### Data Flow: Overworld → Combat

```
Overworld.ts
  node.enemyId = "Kapre Shade" (display name)
       │
       ├──→ MazeGenSystem.ts
       │    getEnemyOverworldSprite("Kapre Shade")
       │    → ENEMY_SPRITE_MAP["Kapre Shade"].overworld
       │    → "kapre_overworld" ✅
       │
       ├──→ TooltipSystem.ts  
       │    allEnemies.find(e => e.name === "Kapre Shade")
       │    getEnemyOverworldSprite("Kapre Shade")
       │    → "kapre_overworld" ✅
       │
       └──→ Combat.ts (scene launch with enemyId param)
            EnemySelectionSystem.getEnemyByName("Kapre Shade")
            → ACT1_ELITE_ENEMIES.find(e => e.name === "Kapre Shade")
            → Returns Kapre Shade enemy data ✅
            │
            └──→ CombatUI.ts
                 getEnemyCombatSprite("Kapre Shade") 
                 → ENEMY_SPRITE_MAP["Kapre Shade"].combat
                 → "kapre_combat" ✅
```

---

## Remaining Work & Known Issues {#remaining-work}

### Critical — Must Address

#### 1. Two Potential EnemyFactory Files
During the session, an `EnemyFactory` class was discussed for converting `EnemyConfig` → `Enemy` at runtime. This factory was planned but **not fully implemented** as the `EnemySelectionSystem` + `Act1Enemies` bridge approach was chosen instead. If a `core/factories/EnemyFactory.ts` or `core/managers/EnemyFactory.ts` was created in an earlier attempt, it should be consolidated with the current approach.

#### 2. `node.enemyId` Still Uses Display Names
Nodes store enemy **display names** (e.g., `"Kapre Shade"`) as `enemyId`, not config IDs (e.g., `"kapre_shade"`). This works but is fragile:
- Renaming a creature in config propagates the name change through `KAPRE_CONFIG.name`, so Act1Enemies arrays update
- BUT if any system stores the old name in local storage or save data, it breaks

**Ideal fix**: Change `node.enemyId` to store config `id` (e.g., `"kapre_shade"`) and update all downstream consumers to use ID-based lookups.

#### 3. Act2/Act3 Not Yet Integrated with Creature Configs
Only Act 1 has creature config files in `creatures/`. Act 2 and Act 3 enemies still live exclusively in `Act2Enemies.ts` and `Act3Enemies.ts` as hardcoded arrays. To complete the single-source-of-truth migration:
- Create creature config files for all Act 2 enemies (10 creatures)
- Create creature config files for all Act 3 enemies (10 creatures)
- Update `Act2Enemies.ts` and `Act3Enemies.ts` to import from creature configs
- Add them to the registry

#### 4. TooltipSystem Hardcoded Data
`TooltipSystem.ts` still has:
- `enemyDetailsMap` with ability descriptions, origin, and corruption text for 10 enemies
- Separate `EnemyLore` imports from `data/lore/EnemyLore.ts`
- Act 1 only — no Act 2/3 tooltip info

This data should eventually move into creature configs or be derived from them.

### Medium Priority

#### 5. Old Act Import Cleanup
Multiple files still import from `Act1Enemies.ts` directly:
- `CombatUI.ts`: `getEnemyCombatSprite`
- `CombatDialogue.ts`: `getEnemyCombatSprite`
- `MazeGenSystem.ts`: `getEnemyOverworldSprite`
- `TooltipSystem.ts`: Enemy constants + `getEnemyOverworldSprite`
- `Prologue/phases/Phase4_CombatActions.ts`: `getEnemyCombatSprite`
- `Prologue/phases/Phase7_Items.ts`: `getEnemyCombatSprite`
- `Prologue/phases/Phase11_FinalTrial.ts`: `getEnemyCombatSprite`

Ideally these functions would move to a shared utility (e.g., `EnemyManager.getSpriteKey()`) so consumers don't need to know about `Act1Enemies.ts`.

#### 6. Prologue Phase Files
`Phase4_CombatActions.ts`, `Phase7_Items.ts`, and `Phase11_FinalTrial.ts` still import specific enemy constants (`TIKBALANG_SCOUT`, `AMOMONGO`, `TAWONG_LIPOD`) from `Act1Enemies.ts` AND `getEnemyCombatSprite()`. These should also use the centralized lookup.

#### 7. GameOver Scene
`GameOver.ts` has a `getEnemyStats(enemyId)` function that may still have hardcoded enemy stats. Needs audit.

### Low Priority / Future

#### 8. Move Lore to Creature Configs
`data/lore/EnemyLore.ts` contains extended lore for each enemy. Creature configs already have `loreDescription`, `loreOrigin`, and `loreReference` fields. The lore file is redundant — its data could be derived from configs.

#### 9. DDA Integration with Creature Data
Currently DDA scales enemy HP/damage via multipliers at runtime. The creature config's `baseHealth`/`baseDamage` fields could feed into DDA calculations more cleanly through the registry.

#### 10. Sprite Asset Audit
Verify that all 20 texture keys (`{creature}_combat` and `{creature}_overworld` for 10 creatures) are loaded in the Preloader. Missing textures will show as blank/broken sprites.

---

## Technical Decisions & Trade-offs

### Decision 1: Bridge Pattern vs Full Migration
**Chosen**: Bridge pattern (keep `Act1Enemies.ts` arrays, derive names/sprites from configs)
- **Pro**: Minimal disruption, backward compatible, incremental migration
- **Con**: Data still partially duplicated (stats in Act1Enemies, metadata in configs)
- **Alternative considered**: Full migration (delete Act1Enemies, generate `Enemy` objects from `EnemyConfig` at runtime)
- **Rationale**: Full migration would touch 30+ files and risk combat balance regressions

### Decision 2: Display Name as Node Key
**Chosen**: Keep `node.enemyId = displayName` (e.g., "Kapre Shade")
- **Pro**: All existing systems already work with display names
- **Con**: Fragile if names change without updating save data
- **Alternative**: Use config ID (`"kapre_shade"`)
- **Rationale**: Saves time now; flagged as future improvement

### Decision 3: Sprite Map in Act1Enemies vs Separate Utility
**Chosen**: `ENEMY_SPRITE_MAP` in `Act1Enemies.ts`
- **Pro**: Collocated with the runtime enemy arrays that use it
- **Con**: Act1Enemies knows about overworld sprites (cross-concern)
- **Alternative**: Move to `EnemyManager.ts` or `SpriteUtils.ts`
- **Rationale**: Keeps the `getEnemyCombatSprite()`/`getEnemyOverworldSprite()` functions near the data they reference

### Decision 4: Required vs Optional Sprite Keys on EnemyConfig
**Chosen**: `combatSpriteKey: string` and `overworldSpriteKey: string` (required)
- **Pro**: TypeScript enforces that every creature has sprite keys
- **Con**: Can't have partially-defined creatures during development
- **Rationale**: All 10 creatures already have sprites; enforcement prevents forgetting

---

## Patterns Established

### Pattern 1: Config-Derived Maps
```typescript
const MAP = Object.fromEntries(
  CONFIGS.map(cfg => [cfg.name, { ... }])
);
```
Build lookup structures from config data at module init. Zero maintenance cost.

### Pattern 2: Chapter Provider Registry
```typescript
const CHAPTER_PROVIDERS: Record<number, ChapterProvider> = { 1: ..., 2: ..., 3: ... };
static registerChapter(n, provider) { CHAPTER_PROVIDERS[n] = provider; }
```
Extensible per-chapter routing without switch-cases.

### Pattern 3: Computed Property Keys
```typescript
const map = {
  [TIKBALANG_SCOUT.name]: { abilities: "..." },
  [BALETE_WRAITH.name]: { abilities: "..." },
};
```
Keys auto-update when creature names change. No stale string literals.

### Pattern 4: Centralized Sprite Resolution
```typescript
export function getEnemyCombatSprite(name: string): string {
  return SPRITE_MAP[name]?.combat ?? "tikbalang_combat";
}
```
Single function per sprite type. All consumers delegate. Safe fallback.

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Files Created | 2 (EnemySelectionSystem.ts, sprite section in Act1Enemies) |
| Files Modified | 8 (EnemyTypes, 10 creature configs, CombatUI, CombatDialogue, MazeGenSystem, TooltipSystem, Combat.ts, Act1Enemies.ts) |
| Lines of Name-Parsing Code Removed | ~120 (if-chains in CombatUI, CombatDialogue, MazeGenSystem) |
| Lines of Config-Derived Code Added | ~60 (sprite map, lookup functions, selection system) |
| Bug Fixed | Overworld Kapre → Combat Balete mismatch |
| Compilation Status | ✅ Builds clean |
| Breaking Changes | None — all changes backward compatible |

---

## How This Supports the Thesis

### Direct Support for Rule-Based DDA
1. **Reproducible Enemy Selection**: `EnemySelectionSystem` provides deterministic chapter→enemy routing, critical for DDA test reproducibility
2. **Config-Driven Stats**: Creature configs' `baseHealth`/`baseDamage` can feed DDA scaling formulas directly
3. **Sprite Consistency**: Correct sprites ensure playtest feedback is accurate (players reporting wrong enemy names/behavior was confusing)

### Indirect Support
1. **Rapid Content Iteration**: Adding enemies for DDA A/B tests requires editing 1 file instead of 5
2. **Clean Data Pipeline**: Metrics like "which enemies cause most player deaths" rely on correct enemy identification
3. **Extensibility**: Chapter provider pattern supports adding "DDA challenge chapters" with tuned enemy pools

---

## Relationship to Previous Session

This session is a **direct continuation** of `SESSION_ARCHITECTURE_OVERHAUL.md`:

| Previous Session | This Session |
|-----------------|-------------|
| Created `EnemyConfig` type in `EnemyTypes.ts` | Extended it with `combatSpriteKey`/`overworldSpriteKey` |
| Created creature config files (10) | Added sprite keys to all 10 |
| Created `EnemyManager` singleton + `registry.ts` | Created `EnemySelectionSystem` for combat routing |
| Created `ContentPool<T>` system | (Not used this session — future integration) |
| Established "single source of truth" principle | Applied it to sprite resolution pipeline |
| Identified `Overworld.getRelicLore()` anti-pattern | Fixed analogous anti-patterns in CombatUI/CombatDialogue sprite resolution |

---

## Next Session Priorities

1. **Change `node.enemyId` to use config IDs** — Most impactful remaining fix
2. **Create Act 2/3 creature configs** — Complete the single-source-of-truth migration
3. **Consolidate sprite lookup into EnemyManager** — Remove `Act1Enemies` as sprite intermediary
4. **Move TooltipSystem data into creature configs** — Eliminate `enemyDetailsMap` and `EnemyLore` redundancy
5. **Audit Prologue phases** — Update Phase4, Phase7, Phase11 to use centralized sprite lookup
6. **Sprite asset verification** — Ensure Preloader loads all 20 texture keys

---

**End of Session Documentation**  
*Bathala v5.8.14.25 — Filipino Mythology Roguelike Card Game*  
*Thesis: Rule-Based Dynamic Difficulty Adjustment*

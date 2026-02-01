# Bathala - Master Task List (MoSCoW Prioritization)

**Document Version:** 1.0  
**Created:** February 1, 2026  
**GDD Reference:** v5.8.14.25  
**Overall System Completion:** ~72%

---

## Quick Reference

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 **MUST HAVE** | 12 | Critical for thesis/release - game unplayable without these |
| 🟡 **SHOULD HAVE** | 10 | Important for quality - game works but feels incomplete |
| 🟢 **COULD HAVE** | 8 | Nice-to-have polish - improves experience |
| ⚪ **WON'T HAVE** | 4 | Out of scope for current release |

---

# 🔴 MUST HAVE (Critical Path)

These items **MUST** be completed for thesis validation and game release. The game is unplayable or thesis-invalid without them.

---

## M1. Enemy Action Handlers (Combat Blocking)

**Status:** ⚠️ 28% Complete (5/18 actions handled)  
**Effort:** 3-5 hours  
**Location:** `bathala/src/game/scenes/Combat.ts` → `executeEnemyTurn()`

### Problem
Most enemy actions are not handled, causing enemies to skip turns. This makes combat trivially easy and breaks game balance.

### Actions Currently Handled ✅
- `attack` - Basic damage
- `defend` - Gain block
- `strengthen` - Apply Strength buff
- `poison` - Apply Poison debuff
- `weaken` - Apply Weak debuff

### Actions NOT Handled ❌ (Enemies Skip Turn)
| Action | Effect Needed | Priority |
|--------|--------------|----------|
| `confuse` | Apply Weak or reduce accuracy | High |
| `charge` | Store power for next attack | High |
| `wait` | Skip turn intentionally | High |
| `stun` | Apply Stun (skip player turn) | High |
| `steal_block` | Remove player block, gain it | Medium |
| `disrupt_draw` | Reduce player draw next turn | Medium |
| `fear` | Apply Fear debuff | Medium |
| `critical_attack` | 1.5x damage attack | Medium |
| `bleed_attack` | Damage + Bleed over time | Medium |
| `fast_attack` | Multiple small hits | Medium |
| `laugh_debuff` | AoE debuff (Bungisngis) | Low |
| `high_swing` | High damage single hit | Low |
| `burn_aoe` | AoE Burn damage | Low |
| `summon_minion` | Spawn additional enemy | Future |
| `mimic_element` | Copy player's last element | Future |
| `curse_cards` | Add curse cards to deck | Future |
| `hex_of_reversal` | Reverse buffs/debuffs | Future |

### Implementation Steps
```typescript
// In executeEnemyTurn() after existing handlers:
case "confuse":
  this.applyStatusEffectToPlayer("weak", 2);
  this.showEnemyActionText("Confuses you!");
  break;

case "charge":
  this.applyStatusEffectToEnemy("strength", 2);
  this.showEnemyActionText("Charges power!");
  break;

case "wait":
  this.showEnemyActionText("Waits...");
  break;

case "stun":
  this.applyStatusEffectToPlayer("stunned", 1);
  this.showEnemyActionText("Stuns you!");
  break;
```

### Validation
- [ ] Tikbalang uses confuse correctly
- [ ] Sigbin uses charge correctly
- [ ] All enemies execute their full patterns
- [ ] No enemies skip turns unexpectedly

---

## M2. Post-Boss Resolution Scenes (Narrative Blocking)

**Status:** ❌ 0% Complete  
**Effort:** 5-8 hours  
**Location:** `bathala/src/game/scenes/Combat.ts` → after `showBattleOutcome()`

### Problem
After defeating chapter bosses, players return immediately to overworld with no narrative closure. Per GDD: "Post-Boss Resolution: Linear, 2-3 min."

### Required Scenes

#### Act 1: Mangangaway Defeated
```
Narrative: "Mangangaway falls: 'Hexes lift; earth stirs.' 
Lupa Diwa Shard purifies. Floods call with betrayals."

Sequence:
1. Boss defeat dialogue (exists)
2. Fade to black
3. Diwa Shard acquisition animation
4. Narrative text crawl
5. Preview of next chapter
6. Transition to Act 2 overworld
```

#### Act 2: Bakunawa Defeated
```
Narrative: "Bakunawa yields: 'Hunger fades; skies thunder.' 
Tubig Diwa Shard calms waters."

Sequence:
1. Boss defeat dialogue (exists)
2. Moon restoration visual
3. Diwa Shard acquisition
4. Narrative about False Bathala
5. Transition to Act 3 overworld
```

#### Act 3: False Bathala Defeated
```
Narrative: "False Bathala unmasks: 'Shadows fade; order returns.' 
Final Diwa Shard restores skies."

Sequence:
1. Boss defeat dialogue (exists)
2. Reveal true nature (engkanto fusion)
3. Final Diwa Shard acquisition
4. Transition to Epilogue
```

### Implementation Pattern
```typescript
private showPostBossResolution(bossName: string): void {
  const resolutions = {
    "Mangangaway": {
      lines: [
        "The hexes lift...",
        "Earth stirs beneath your feet.",
        "The Lupa Diwa Shard materializes before you."
      ],
      nextChapter: 2
    },
    // ... Act 2, Act 3
  };
  
  // Create overlay scene with fade-typed text
  this.scene.launch("PostBossScene", resolutions[bossName]);
}
```

---

## M3. Epilogue Scene ("The Mended Bamboo")

**Status:** ❌ 0% Complete  
**Effort:** 3-5 hours  
**Location:** New scene: `bathala/src/game/scenes/Epilogue.ts`

### Problem
After defeating False Bathala, `triggerEpilogue()` is called but the scene doesn't exist. Game jumps directly to Credits with no conclusion.

### GDD Specification
```
Epilogue: The Mended Bamboo
Delivery: Linear (~10-15 min)

Narrative (Landás-based):
- Mercy (+5 to +10): Anito harmony, lore unlocks
- Balance (–4 to +4): Cyclical order, educational
- Conquest (–10 to –5): Ruthless restoration, darker myths

Bathala: "Bamboo mends; myths endure."
Montage of PCG lore, Chronicle unlocks.
```

### Implementation Steps
1. Create `Epilogue.ts` scene
2. Check player's Landás score from GameState
3. Display appropriate ending variant
4. Show acquired Diwa Shards
5. Display Chronicle entries unlocked
6. Transition to Credits

---

## M4. Act 2-3 Mystery Events (Content Blocking)

**Status:** ❌ 0% Complete (0/20 events)  
**Effort:** 4-6 hours  
**Location:** Create `bathala/src/data/events/Act2Events.ts` and `Act3Events.ts`

### Problem
Only Act1Events.ts exists. Players see the same 10 events throughout the entire game regardless of chapter.

### GDD Requirements (10 events per chapter)

#### Act 2 Events (Water/Fire Theme)
| Event | Time | Core Mechanic |
|-------|------|---------------|
| Sunken Shrine | Day | Heal or gain block |
| Drowned Echo | Night | Upgrade Tubig card |
| Sirena's Song | Day | Random potion |
| Coral Altar | Day | Remove card |
| Santelmo Light | Night | Burn damage/reward |
| Berberoka Pool | Night | Risk/reward choice |
| Magindara Warning | Day | Combat or reward |
| Kataw's Crown | Day | Gain Fragments |
| Bakunawa Shadow | Night | Forced combat or flee |
| Tidal Offering | Day | Sacrifice HP for relic |

#### Act 3 Events (Celestial Theme)
| Event | Time | Core Mechanic |
|-------|------|---------------|
| Celestial Anito | Day | Gain relic |
| Storm Omen | Night | Gain potion |
| Divine Sibling | Day | Deck sculpt |
| Sarimanok Flight | Day | Gain Fragments |
| Comet Trail | Night | Upgrade card |
| Thunder Shrine | Day | Gain relic |
| Sky Anito | Day | Gain potion |
| Starfall Vision | Day | Deck sculpt |
| Diwata Court | Day | Gain Fragments |
| Eclipse Harbinger | Night | Risk/reward |

### Template (Copy from Act1Events.ts)
```typescript
export const Act2Events: GameEvent[] = [
  {
    id: "sunken_shrine",
    name: "Sunken Shrine",
    description: [
      "Waters part to reveal an ancient shrine...",
      "The spirits of the deep watch your approach.",
      "What offering will you make?"
    ],
    choices: [
      {
        text: "Pray for healing (+15 HP)",
        outcome: (context) => {
          context.player.currentHp = Math.min(
            context.player.currentHp + 15,
            context.player.maxHp
          );
          return "The waters embrace you with warmth.";
        }
      },
      // ... more choices
    ],
    dayEvent: true
  },
  // ... 9 more events
];
```

---

## M5. Forced Combat Event Fix (Tiyanak Wail)

**Status:** ❌ Placeholder with TODO  
**Effort:** 30 minutes  
**Location:** `bathala/src/data/events/Act1Events.ts` line ~225

### Problem
Tiyanak Wail event has a TODO placeholder. The "Approach cautiously" option should trigger combat but doesn't.

### Current Code
```typescript
{
  text: "Approach cautiously",
  outcome: () => {
    // TODO: Implement forced combat trigger system
    return "You approach cautiously... it is a trap!";
  }
}
```

### Fix
```typescript
{
  text: "Approach cautiously",
  outcome: (context) => {
    // Trigger forced combat with Tiyanak Ambusher
    context.gameState.startForcedCombat("tiyanak_ambusher");
    return "The wails were a trap! A Tiyanak attacks!";
  }
}
```

---

## M6. Act 2-3 Enemy Sprites (Visual Blocking)

**Status:** ❌ 0% Complete  
**Effort:** 10-20 hours (art creation)  
**Location:** `bathala/public/assets/sprites/combat/enemy/chap2/` and `chap3/`

### Problem
Only Act 1 enemy sprites exist. Act 2-3 enemies have data definitions but no visual assets.

### Required Sprites (Per GDD)

#### Act 2 Enemies (Water Theme)
| Enemy | Type | Sprite Needed |
|-------|------|--------------|
| Sirena Illusionist | Common | `sirena_combat.png` |
| Siyokoy Raider | Common | `siyokoy_combat.png` |
| Santelmo Flicker | Common | `santelmo_combat.png` |
| Berberoka Lurker | Common | `berberoka_combat.png` |
| Magindara (x3) | Common | `magindara_combat.png` |
| Kataw | Common | `kataw_combat.png` |
| Berbalang | Common | `berbalang_combat.png` |
| Sunken Bangkilan | Elite | `bangkilan_combat.png` |
| Apoy-Tubig Fury | Elite | `apoytubig_combat.png` |
| Bakunawa | Boss | `bakunawa_combat.png` |

#### Act 3 Enemies (Celestial Theme)
| Enemy | Type | Sprite Needed |
|-------|------|--------------|
| Tigmamanukan Watcher | Common | `tigmamanukan_combat.png` |
| Diwata Sentinel | Common | `diwata_combat.png` |
| Sarimanok Keeper | Common | `sarimanok_combat.png` |
| Bulalakaw Flamewings | Common | `bulalakaw_combat.png` |
| Minokawa Harbinger | Common | `minokawa_combat.png` |
| Alan | Common | `alan_combat.png` |
| Ekek | Common | `ekek_combat.png` |
| Ribung Linti (x2) | Elite | `ribunglinti_combat.png` |
| Apolaki Godling | Elite | `apolaki_combat.png` |
| False Bathala | Boss | `falsebathala_combat.png` |

### Temporary Workaround
Until sprites are created, add fallback in Preloader:
```typescript
// Load placeholder for missing Act 2-3 sprites
this.load.on('loaderror', (file) => {
  if (file.key.includes('_combat')) {
    console.warn(`Missing sprite: ${file.key}, using placeholder`);
    // Use a generic placeholder sprite
  }
});
```

---

## M7. Sound Effects (Audio Blocking)

**Status:** ❌ 0% Complete (0 SFX files)  
**Effort:** 20-40 hours (audio creation)  
**Location:** `bathala/public/assets/sfx/`

### Problem
Game is completely silent except for background music. No UI feedback, no combat sounds.

### Required SFX (Minimum Viable)

#### UI Sounds (Critical)
| Sound | Trigger | Priority |
|-------|---------|----------|
| `button_click.mp3` | Any button press | High |
| `button_hover.mp3` | Button hover | Medium |
| `card_draw.mp3` | Drawing cards | High |
| `card_select.mp3` | Selecting card | High |
| `card_play.mp3` | Playing hand | High |

#### Combat Sounds (Critical)
| Sound | Trigger | Priority |
|-------|---------|----------|
| `attack_slash.mp3` | Player attack | High |
| `attack_hit.mp3` | Damage dealt | High |
| `defend_block.mp3` | Block gained | High |
| `special_fire.mp3` | Apoy special | Medium |
| `special_water.mp3` | Tubig special | Medium |
| `special_earth.mp3` | Lupa special | Medium |
| `special_wind.mp3` | Hangin special | Medium |
| `enemy_attack.mp3` | Enemy attacks | High |
| `player_hurt.mp3` | Player takes damage | High |
| `enemy_death.mp3` | Enemy defeated | Medium |

#### Feedback Sounds (Important)
| Sound | Trigger | Priority |
|-------|---------|----------|
| `victory.mp3` | Combat won | Medium |
| `level_up.mp3` | Stat increase | Low |
| `item_pickup.mp3` | Relic/potion gained | Medium |
| `gold_gain.mp3` | Currency received | Low |
| `heal.mp3` | HP restored | Medium |

### MusicManager Integration
```typescript
// In audioAssets array:
{ key: "button_click", path: "sfx/ui/button_click.mp3", type: "sfx" },
{ key: "card_draw", path: "sfx/combat/card_draw.mp3", type: "sfx" },
// ...

// Usage:
MusicManager.getInstance().playSFX("button_click", { volume: 0.7 });
```

---

## M8. Act 2-3 Relic Graphics

**Status:** ❌ 0% Complete  
**Effort:** 5-10 hours (art creation)  
**Location:** `bathala/public/assets/relics/act2relics/` and `act3relics/`

### Problem
Act 2-3 relic data exists in code, but no sprite assets. Shop/rewards will show emoji fallback.

### Required (Per GDD - 10 per act)

#### Act 2 Relics
| Relic | Sprite Name |
|-------|-------------|
| Sirena's Scale | `sirenas_scale.png` |
| Siyokoy Fin | `siyokoy_fin.png` |
| Santelmo Ember | `santelmo_ember.png` |
| Berberoka Tide | `berberoka_tide.png` |
| Magindara Song | `magindara_song.png` |
| Kataw Crown | `kataw_crown.png` |
| Berbalang Spirit | `berbalang_spirit.png` |
| Bangkilan Veil | `bangkilan_veil.png` |
| Elemental Core | `elemental_core.png` |
| Bakunawa Fang | `bakunawa_fang.png` |

#### Act 3 Relics
| Relic | Sprite Name |
|-------|-------------|
| Tigmamanukan Feather | `tigmamanukan_feather.png` |
| Diwata Veil | `diwata_veil.png` |
| Sarimanok Plumage | `sarimanok_plumage.png` |
| Bulalakaw Spark | `bulalakaw_spark.png` |
| Minokawa Claw | `minokawa_claw.png` |
| Alan Wing | `alan_wing.png` |
| Ekek Fang | `ekek_fang.png` |
| Linti Bolt | `linti_bolt.png` |
| Apolaki's Spear | `apolakis_spear.png` |
| Coconut Diwa | `coconut_diwa.png` |

---

## M9. DDA Map Generation Bias

**Status:** ⚠️ 80% Complete (documented as pending)  
**Effort:** 2-3 hours  
**Location:** `bathala/src/core/dda/RuleBasedDDA.ts` + `Overworld_MazeGenManager.ts`

### Problem
DDA adjusts combat difficulty but doesn't influence map generation. Struggling players should see more Rest nodes.

### GDD Specification
> "Struggling (Tier 0): increased Rest node weighting"

### Implementation
```typescript
// In MazeGenManager
getNodeTypeWeights(): NodeWeights {
  const dda = RuleBasedDDA.getInstance();
  const tier = dda.getCurrentTier();
  
  const baseWeights = {
    combat: 0.4,
    elite: 0.15,
    shop: 0.15,
    rest: 0.15,
    event: 0.1,
    treasure: 0.05
  };
  
  if (tier === 0) { // Struggling
    baseWeights.rest += 0.1;
    baseWeights.combat -= 0.05;
    baseWeights.elite -= 0.05;
  } else if (tier >= 4) { // Mastering
    baseWeights.rest -= 0.05;
    baseWeights.elite += 0.05;
  }
  
  return baseWeights;
}
```

---

## M10. Integration Testing

**Status:** ⚠️ Partial  
**Effort:** 3-4 hours  
**Location:** `bathala/src/game/scenes/combat/*.test.ts`

### Required Tests
- [ ] Act 1 → Act 2 chapter transition
- [ ] Act 2 → Act 3 chapter transition
- [ ] Boss defeat triggers correct resolution
- [ ] DDA tier affects enemy stats correctly
- [ ] All enemy actions execute without errors
- [ ] Event choices apply correct rewards
- [ ] Relic effects trigger at correct times

---

## M11. Chapter Visual Theme Updates

**Status:** ⚠️ 80% Complete  
**Effort:** 2 hours  
**Location:** `bathala/src/game/scenes/Overworld.ts`

### Problem
Chapter backgrounds may not update when transitioning between acts.

### Verification
- [ ] Act 1: Forest theme (green)
- [ ] Act 2: Water theme (blue)
- [ ] Act 3: Sky theme (purple/gold)
- [ ] Boss arena uses chapter-appropriate background

---

## M12. Chronicle/Lore Unlock System

**Status:** ⚠️ 50% Complete  
**Effort:** 3-4 hours  
**Location:** `bathala/src/core/managers/ChronicleManager.ts`

### Problem
Lore entries are defined but unlock conditions may not trigger correctly.

### Required
- [ ] Enemy spare unlocks creature lore
- [ ] Event completion unlocks mythology entries
- [ ] Boss defeat unlocks chapter summary
- [ ] Epilogue reveals all remaining lore

---

# 🟡 SHOULD HAVE (Quality Features)

These items significantly improve the game experience but aren't blocking release.

---

## S1. Chapter Introduction Cinematics

**Status:** ❌ 0% Complete  
**Effort:** 4-6 hours  
**Location:** New scenes

### GDD Requirement
> "Chapter Introduction: Linear, 1-2 min."

Each chapter needs an opening cinematic:
- Act 1: "In balete groves—portals to anito realms..."
- Act 2: "In sunken barangays—where Bathala's tears wove seas..."
- Act 3: "Atop ethereal citadel—Bathala's dream-realm..."

---

## S2. DDA Narrative Framing

**Status:** ❌ 0% (infrastructure exists, unused)  
**Effort:** 2-3 hours  
**Location:** `bathala/src/core/dda/RuleBasedDDA.ts` → `getNarrativeContext()`

### Problem
Narrative context messages exist but aren't displayed:
- Struggling: "The spirits temper their challenge..."
- Thriving: "Your skill draws fiercer opponents..."

### Implementation
Display in post-combat or event outcomes for immersion.

---

## S3. Landás-Based Event Variants

**Status:** ❌ 0% Complete  
**Effort:** 4-5 hours  
**Location:** `bathala/src/data/events/*.ts`

### Enhancement
Events should have different text/outcomes based on player's moral alignment.

```typescript
outcome: (context) => {
  if (context.player.landasScore > 5) { // Mercy
    return "The spirits recognize your compassion...";
  } else if (context.player.landasScore < -5) { // Conquest
    return "You dominate the encounter...";
  }
  return "You proceed cautiously..."; // Balance
}
```

---

## S4. Advanced Enemy AI Patterns

**Status:** ❌ 0% Complete  
**Effort:** 5-8 hours  
**Location:** `bathala/src/game/scenes/Combat.ts`

### Enhancement
Implement complex boss mechanics:
- Mangangaway: Mimic player's last element
- Bakunawa: Devour relics temporarily
- False Bathala: Steal and use player's relics

---

## S5. Potion Effect Variety

**Status:** ⚠️ 20% Complete  
**Effort:** 2-3 hours  
**Location:** `bathala/src/game/scenes/Combat.ts`

### Problem
Only `heal_20_hp` is implemented. Other effects are placeholders.

### Required Effects
| Potion | Effect | Status |
|--------|--------|--------|
| Healing Potion | +20 HP | ✅ Done |
| Potion of Clarity | Draw 3 cards | ❌ TODO |
| Elixir of Fortitude | +15 Block | ❌ TODO |
| Phial of Elements | Choose element | ❌ TODO |
| Balm of Resilience | Cleanse debuffs | ❌ TODO |

---

## S6. Act 2-3 Overworld Enemy Sprites

**Status:** ❌ 0% Complete  
**Effort:** 5-10 hours (art)  
**Location:** `bathala/public/assets/sprites/overworld/combat/chap2/` and `chap3/`

Smaller versions of combat sprites for overworld nodes.

---

## S7. Music for Missing Scenes

**Status:** ⚠️ 50% Complete  
**Effort:** 10-20 hours (composition)  
**Location:** `bathala/public/assets/music/`

### Required Tracks
| Scene | Status |
|-------|--------|
| Main Menu | ✅ Done |
| Battle | ✅ Done (1 track) |
| Overworld | ❌ Missing |
| Shop | ❌ Missing |
| Campfire | ❌ Missing |
| Event | ❌ Missing |
| Boss | ❌ Missing |
| Victory | ❌ Missing |
| Epilogue | ❌ Missing |

---

## S8. Relic Tooltip Improvements

**Status:** ⚠️ 70% Complete  
**Effort:** 1-2 hours  
**Location:** `bathala/src/game/scenes/combat/CombatUI.ts`

### Enhancement
- Show relic effects on hover
- Highlight active relics during combat
- Show trigger conditions

---

## S9. Card Upgrade Visual Feedback

**Status:** ⚠️ 60% Complete  
**Effort:** 1-2 hours  
**Location:** `bathala/src/game/scenes/Campfire.ts`

### Enhancement
- Show before/after comparison
- Particle effects on upgrade
- Sound feedback

---

## S10. Save/Load System Validation

**Status:** ⚠️ Unknown  
**Effort:** 2-3 hours  
**Location:** `bathala/src/core/managers/GameState.ts`

### Required
- [ ] Game state persists correctly
- [ ] Chapter progress saves
- [ ] Inventory saves
- [ ] Chronicle unlocks persist

---

# 🟢 COULD HAVE (Polish)

Nice-to-have features that improve player experience but aren't essential.

---

## C1. Animated Enemy Sprites

**Status:** ❌ Not Started  
**Effort:** 10-20 hours (art/animation)

Replace static sprites with idle animations (2-4 frames).

---

## C2. Screen Shake on Big Hits

**Status:** ❌ Not Started  
**Effort:** 1-2 hours

Add camera shake for critical hits and boss attacks.

---

## C3. Particle Effects

**Status:** ⚠️ 30% Complete  
**Effort:** 3-5 hours

- Elemental attack particles
- Healing particles
- Status effect particles
- Victory celebration

---

## C4. Accessibility Options

**Status:** ❌ Not Started  
**Effort:** 4-6 hours

- Color blind mode
- Text size options
- Reduced motion option
- Audio descriptions

---

## C5. Performance Optimization

**Status:** ⚠️ 80% Complete  
**Effort:** 2-3 hours

- Object pooling for cards
- Texture atlases
- Lazy loading for chapters

---

## C6. Achievement System

**Status:** ❌ Not Started  
**Effort:** 5-8 hours

Track and display player accomplishments.

---

## C7. Statistics Dashboard

**Status:** ❌ Not Started  
**Effort:** 3-4 hours

Show player stats across runs (win rate, favorite element, etc.)

---

## C8. Tutorial Replay Option

**Status:** ❌ Not Started  
**Effort:** 1-2 hours

Allow replaying Prologue from Settings.

---

# ⚪ WON'T HAVE (Out of Scope)

Explicitly excluded from current release per thesis constraints.

---

## W1. Machine Learning DDA

Per thesis requirements, DDA must be rule-based and transparent. No neural networks or black-box algorithms.

---

## W2. Multiplayer/Online Features

Single-player roguelike only. No co-op, PvP, or leaderboards.

---

## W3. Voice Acting

All dialogue is text-based. No voiced characters.

---

## W4. Mobile Port

Desktop browser only. Touch controls not in scope.

---

# Implementation Priority Order

## Sprint 1: Combat Blocking (Week 1)
1. **M1** - Enemy Action Handlers (3-5 hrs)
2. **M5** - Tiyanak Forced Combat Fix (30 min)
3. **M10** - Integration Testing (3-4 hrs)

## Sprint 2: Narrative Blocking (Week 2)
4. **M2** - Post-Boss Resolution Scenes (5-8 hrs)
5. **M3** - Epilogue Scene (3-5 hrs)
6. **M4** - Act 2-3 Mystery Events (4-6 hrs)

## Sprint 3: Asset Creation (Weeks 3-4)
7. **M6** - Act 2-3 Enemy Sprites (10-20 hrs)
8. **M7** - Sound Effects (20-40 hrs)
9. **M8** - Act 2-3 Relic Graphics (5-10 hrs)

## Sprint 4: System Polish (Week 5)
10. **M9** - DDA Map Generation Bias (2-3 hrs)
11. **M11** - Chapter Visual Themes (2 hrs)
12. **M12** - Chronicle Unlock System (3-4 hrs)

## Sprint 5: Quality Features (Weeks 6-7)
13. **S1** - Chapter Intro Cinematics
14. **S2** - DDA Narrative Framing
15. **S5** - Potion Effect Variety
16. **S7** - Additional Music Tracks

---

# Quick Reference: File Locations

| Task | Primary File(s) |
|------|----------------|
| Enemy Actions | `src/game/scenes/Combat.ts` |
| Post-Boss Scenes | `src/game/scenes/Combat.ts`, new scene |
| Epilogue | New `src/game/scenes/Epilogue.ts` |
| Act 2-3 Events | `src/data/events/Act2Events.ts`, `Act3Events.ts` |
| Forced Combat | `src/data/events/Act1Events.ts` line 225 |
| Enemy Sprites | `public/assets/sprites/combat/enemy/chap2/`, `chap3/` |
| Sound Effects | `public/assets/sfx/`, `src/core/managers/MusicManager.ts` |
| Relic Graphics | `public/assets/relics/act2relics/`, `act3relics/` |
| DDA Map Bias | `src/core/dda/RuleBasedDDA.ts`, `Overworld_MazeGenManager.ts` |
| Chronicle | `src/core/managers/ChronicleManager.ts` |

---

# Completion Tracking

| Category | Current | Target |
|----------|---------|--------|
| **MUST HAVE** | 28% | 100% |
| **SHOULD HAVE** | 40% | 80%+ |
| **COULD HAVE** | 25% | 50%+ |
| **Overall** | 72% | 95%+ |

---

**Document maintained by:** Development Team  
**Last updated:** February 1, 2026  
**Next review:** After Sprint 1 completion

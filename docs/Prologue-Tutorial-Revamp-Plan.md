# Bathala: Prologue & Tutorial Revamp Plan

## Executive Summary

This document outlines a comprehensive revamp of the Prologue/Tutorial experience to address thesis adviser feedback about clarity, depth, and structure. The goal is to create a more educational, immersive tutorial that thoroughly introduces all game mechanics while remaining skippable and potentially fast-forwardable for experienced players.

---

## Current State Analysis

### Strengths
- ✅ Good narrative introduction with cultural context
- ✅ Skip button implementation
- ✅ Basic hand formation teaching (Pair, Straight, Flush, Full House)
- ✅ Moral choice introduction (Slay/Spare)
- ✅ Visual polish with typed dialogue and transitions

### Weaknesses
- ❌ **Rushed progression** - Players learn 5+ concepts in rapid succession
- ❌ **Missing mechanics** - No coverage of:
  - Status effects (Strength, Dexterity, Vulnerable, Burn, etc.)
  - Relics and their strategic importance
  - Potions and resource management
  - Enemy intents and pattern reading
  - Elemental effects and Special attacks
  - Discard mechanic and hand management
  - Block persistence vs. temporary block
  - DDA system existence (transparency goal)
- ❌ **No real combat simulation** - Players fight "illusions" with no stakes
- ❌ **Limited enemy introduction** - No lore or mythology teaching
- ❌ **Code organization** - 770+ lines in single file, mixed concerns
- ❌ **No reinforcement** - Concepts taught once without practice

---

## Proposed Solution: Multi-Phase Tutorial System

### Phase Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: Narrative Introduction (1-2 min)                  │
│ - Story slides (current implementation, keep mostly as-is) │
│ - Skippable, sets thematic tone                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Card Basics & Hand Formation (3-5 min)            │
│ - Understand card anatomy (rank, suit/element)             │
│ - Form basic hands (High Card → Full House)                │
│ - Practice hand selection with instant feedback            │
│ - **NEW**: Interactive card manipulation tutorial          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Combat Actions (3-4 min)                          │
│ - Attack, Defend, Special explained in depth               │
│ - Damage calculation breakdown shown                        │
│ - Block mechanics (temporary vs. persistent)               │
│ - **NEW**: Elemental effects demonstration                 │
│ - **NEW**: Discard mechanic practice                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Enemy Mechanics (4-6 min)                         │
│ - Enemy intent system (attack/defend/debuff/special)       │
│ - Status effects (applied to player AND enemy)             │
│ - **NEW**: Real combat vs. Duwende Trickster              │
│ - **NEW**: Pattern recognition teaching                    │
│ - **NEW**: Enemy lore integration                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Resources & Strategy (3-5 min)                    │
│ - Relics: passive benefits explained                        │
│ - Potions: active effects and timing                        │
│ - **NEW**: Resource management scenarios                   │
│ - **NEW**: Strategic decision-making practice              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Advanced Combat (5-7 min)                         │
│ - **NEW**: Full combat vs. Tikbalang Scout                 │
│ - All mechanics integrated                                  │
│ - Real stakes (can "lose" but tutorial continues)          │
│ - Moral choice (Slay/Spare) with consequences shown        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: Meta-Progression & DDA (2-3 min)                  │
│ - **NEW**: Explain Landás system                           │
│ - **NEW**: Introduce DDA (transparency)                    │
│ - **NEW**: Chronicle/Spirit Fragments overview             │
│ - Final motivational narrative                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    [Start Overworld]
```

**Total Duration**: 21-32 minutes (comprehensive)
**Skip/Fast-Forward**: Reduces to <1 minute

---

## Detailed Phase Breakdown

### PHASE 1: Card Basics & Hand Formation

#### Learning Objectives
- Understand card components (rank 1-13, suits as elements)
- Learn poker hand hierarchy (High Card → Royal Flush)
- Practice hand selection with clear feedback
- Grasp that cards have dual purpose (attack/defend/special)

#### Implementation Details

```typescript
// New sub-stages
enum Phase1Stage {
    CARD_ANATOMY,        // Highlight rank, suit, explain elements
    HIGH_CARD,           // Weakest hand (no pattern)
    PAIR,                // Two of same rank
    TWO_PAIR,            // NEW: Two pairs
    THREE_OF_KIND,       // NEW: Three cards same rank
    STRAIGHT,            // Five in sequence
    FLUSH,               // Five same element
    FULL_HOUSE,          // Three + Two
    FOUR_OF_KIND,        // NEW: Four cards same rank
    STRAIGHT_FLUSH,      // NEW: Advanced combo
    HAND_HIERARCHY       // Show comparison chart
}
```

#### Key Improvements
- **Interactive Card Anatomy**: Zoom in on a single card, highlight rank/suit
- **Progressive Difficulty**: Start with "easy" hands, build to complex
- **Instant Feedback**: Show hand evaluation immediately on selection
- **Comparison Chart**: Display all hand types with bonuses side-by-side
- **Practice Mode**: "Form any Pair" → Player tries multiple times

#### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│                    CARD ANATOMY                             │
│                                                             │
│          ┌────────────┐                                     │
│          │  7         │  ← Rank (2-10, Mandirigma,         │
│          │            │    Babaylan, Datu, or 1/Ace)       │
│          │     🔥     │  ← Suit/Element (Apoy = Fire)      │
│          │            │                                     │
│          │         7  │                                     │
│          └────────────┘                                     │
│                                                             │
│  Elements: Apoy (Fire), Tubig (Water), Lupa (Earth),       │
│           Hangin (Air)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### PHASE 2: Combat Actions

#### Learning Objectives
- Understand Attack: Damage to enemy
- Understand Defend: Generate Block (prevents damage)
- Understand Special: Elemental effects + moderate damage
- Learn damage calculation: Base + Bonus + Multiplier
- Practice discard mechanic (1 charge, redraw up to 5)

#### Implementation Details

```typescript
enum Phase2Stage {
    ACTION_TYPES,        // Explain three buttons
    ATTACK_DEMO,         // Show damage calculation breakdown
    DEFEND_DEMO,         // Show block generation + absorption
    SPECIAL_DEMO,        // Show elemental effects (Burn, Strength, etc.)
    DISCARD_PRACTICE,    // Teach discard mechanic
    BLOCK_PERSISTENCE    // Explain temporary vs. persistent block
}
```

#### Key Improvements
- **Damage Breakdown Overlay**: Show math visually
  ```
  Base Value: 25 (sum of cards)
  Hand Bonus: +10 (Straight)
  Elemental: +0 (not Special)
  Subtotal: 35
  Multiplier: ×1.6
  Final Damage: 56
  ```
- **Visual Block Counter**: Show block stacking and depletion
- **Elemental Effect Animations**: When using Special with Apoy, show "🔥 Burn applied!"
- **Discard Tutorial**: Force player to use discard when dealt bad hand

#### Combat Simulation Structure
```typescript
// Dummy enemy with fixed HP for practice
const trainingDummy: Enemy = {
    name: "Training Dummy",
    maxHealth: 100,
    currentHealth: 100,
    // ... doesn't attack back
};
```

---

### PHASE 3: Enemy Mechanics

#### Learning Objectives
- Read enemy intents (attack/defend/debuff/special icons)
- Recognize attack patterns (e.g., "charge → big attack → rest")
- Understand status effects (on both player and enemy)
- Practice real combat with stakes

#### Implementation Details

```typescript
enum Phase3Stage {
    INTENT_SYSTEM,       // Explain intent icons and values
    STATUS_EFFECTS,      // Teach Strength, Weak, Vulnerable, Burn, etc.
    PATTERN_RECOGNITION, // Show 3-turn pattern example
    LORE_INTRODUCTION,   // Integrate enemy mythology
    REAL_COMBAT_1,       // Fight Duwende Trickster (easy)
    MORAL_CHOICE_1       // Slay/Spare with explanation
}
```

#### Enemy Selection Rationale
- **Duwende Trickster**: Simplest mechanics (steal block, disrupt draw)
- HP: 130, Damage: 12, Pattern: [steal_block, disrupt_draw, attack]
- Perfect for first "real" combat without overwhelming

#### Status Effects Tutorial
```
┌─────────────────────────────────────────────────────────────┐
│                 STATUS EFFECTS REFERENCE                     │
│                                                             │
│  💪 Strength: +3 base damage per stack (Attack actions)    │
│  💨 Dexterity: +3 block per stack (Defend actions)         │
│  🛡️💔 Vulnerable: Take 50% more damage                     │
│  😵 Weak: Deal 25% less damage                             │
│  🔥 Burn: Take 3 damage at start of turn, then lose 1 stack│
│  ❄️ Chill: Lose 1 Dexterity per stack                      │
│  🌀 Stun: Skip next turn                                    │
└─────────────────────────────────────────────────────────────┘
```

#### Lore Integration
- Show enemy portrait + mythology snippet before combat
- Example: "Duwende grant boons/curses, warped by engkanto lies."
- References: Ramos, 1990; Samar, 2019

---

### PHASE 4: Resources & Strategy

#### Learning Objectives
- Understand relics: Passive, permanent, max 6
- Understand potions: Active, single-use, max 3
- Learn when to use resources (timing)
- Practice strategic decision-making

#### Implementation Details

```typescript
enum Phase4Stage {
    RELIC_SYSTEM,        // Show example relic with effect
    POTION_SYSTEM,       // Demonstrate potion use
    RESOURCE_SCENARIO_1, // "Low HP: Use healing potion?"
    RESOURCE_SCENARIO_2, // "Tough enemy: Use damage potion?"
    STRATEGIC_PLANNING   // Show upcoming enemy, plan loadout
}
```

#### Example Relic Tutorial
```
┌─────────────────────────────────────────────────────────────┐
│                   RELIC: Earthwarden's Plate                │
│                                                             │
│  🛡️ Effect: Start each combat with 5 Block                 │
│                                                             │
│  Strategy: This persistent block helps survive opening     │
│  attacks, especially against aggressive enemies.           │
│                                                             │
│  Synergy: Combine with Dexterity buffs for tankiness.     │
└─────────────────────────────────────────────────────────────┘
```

#### Example Potion Tutorial
```
┌─────────────────────────────────────────────────────────────┐
│              POTION: Elixir of Fortitude                    │
│                                                             │
│  Effect: Gain 15 Block immediately                          │
│                                                             │
│  Timing: Best used BEFORE enemy attacks, not after taking   │
│  damage (block prevents damage, doesn't heal).             │
│                                                             │
│  [Use Potion] [Save for Later]                             │
└─────────────────────────────────────────────────────────────┘
```

#### Strategic Scenarios
- Present "choice moments" with trade-offs
- Example: "Next enemy hits hard. Use damage potion now to end quickly, or save for boss?"

---

### PHASE 5: Advanced Combat

#### Learning Objectives
- Integrate ALL mechanics in real combat
- Face enemy with complex pattern (Tikbalang Scout)
- Experience "losing" combat but continuing (resilience)
- Make moral choice with understanding of consequences

#### Implementation Details

```typescript
enum Phase5Stage {
    PRE_COMBAT_BRIEF,    // Show enemy stats, lore, pattern hint
    FULL_COMBAT,         // Real fight with all mechanics
    POST_COMBAT_ANALYSIS,// Show performance breakdown
    MORAL_CHOICE_DEEP,   // Slay vs. Spare with Landás impact
    VICTORY_CELEBRATION  // Positive reinforcement
}
```

#### Enemy Selection: Tikbalang Scout
- HP: 180, Damage: 21
- Pattern: [attack, confuse, attack]
- Confuse: Next turn, player's targeting is randomized (flavor only in tutorial)
- Lore: "Tikbalang were forest protectors, now they mislead with backward hooves."

#### Performance Breakdown (Post-Combat)
```
┌─────────────────────────────────────────────────────────────┐
│                  COMBAT PERFORMANCE                         │
│                                                             │
│  ⏱️ Duration: 5 turns                                       │
│  ❤️ Health Retained: 68/100 (68%)                          │
│  🎯 Total Damage Dealt: 180                                 │
│  🛡️ Damage Blocked: 42                                      │
│  🃏 Best Hand: Full House (+18)                             │
│                                                             │
│  💬 "Well fought! You're learning quickly."                │
└─────────────────────────────────────────────────────────────┘
```

#### Moral Choice Deep Dive
```
┌─────────────────────────────────────────────────────────────┐
│              MORAL CHOICE: Tikbalang's Fate                 │
│                                                             │
│  The Tikbalang lies defeated, its form flickering...       │
│                                                             │
│  [⚔️ SLAY]                           [🕊️ SPARE]            │
│  • Conquest Path (-1 Landás)        • Mercy Path (+1)      │
│  • Immediate power boost            • Purify spirit        │
│  • More gold rewards                • More Spirit Fragments│
│  • Darker narrative tone            • Hopeful narrative    │
│                                                             │
│  Your choice shapes your journey...                         │
└─────────────────────────────────────────────────────────────┘
```

---

### PHASE 6: Meta-Progression & DDA

#### Learning Objectives
- Understand Landás moral system (Mercy/Balance/Conquest)
- Learn about DDA system (transparency goal per thesis)
- Preview Chronicle and Spirit Fragments
- Motivate player for main game

#### Implementation Details

```typescript
enum Phase6Stage {
    LANDAS_EXPLANATION,  // Show three paths and their effects
    DDA_TRANSPARENCY,    // Explain adaptive difficulty (thesis requirement!)
    META_PROGRESSION,    // Chronicle, Spirit Fragments, Ancestral Memories
    CHAPTER_PREVIEW,     // Tease Act 1 content
    FINAL_SEND_OFF       // Motivational narrative conclusion
}
```

#### DDA Transparency Screen (Thesis Critical!)
```
┌─────────────────────────────────────────────────────────────┐
│              ADAPTIVE DIFFICULTY SYSTEM                      │
│                                                             │
│  Bathala adapts to your skill level to maintain flow.      │
│                                                             │
│  • Struggling? Enemies become slightly easier.             │
│  • Thriving? Enemies become more challenging.              │
│  • Mastering? Face maximum difficulty.                     │
│                                                             │
│  This system is transparent and rule-based. Your choices   │
│  and performance directly influence the experience.        │
│                                                             │
│  [Learn More] [Continue]                                    │
└─────────────────────────────────────────────────────────────┘
```

#### Meta-Progression Preview
```
┌─────────────────────────────────────────────────────────────┐
│                 PROGRESSION SYSTEMS                          │
│                                                             │
│  🌟 Spirit Fragments: Earned each run, unlock permanent    │
│     Ancestral Memories (e.g., +5 Max HP, +1 Dexterity)     │
│                                                             │
│  📖 Chronicle: Discover lore entries about enemies,        │
│     mythology, and the engkanto's corruption.              │
│                                                             │
│  ⚖️ Landás: Your moral choices influence rewards and       │
│     narrative tone throughout your journey.                │
└─────────────────────────────────────────────────────────────┘
```

---

## Code Architecture Revamp

### Current Problem
- **Monolithic**: 770+ lines in `Prologue.ts`
- **Mixed Concerns**: UI, animations, game logic, dialogue all intertwined
- **Hard to Maintain**: Adding new tutorial stages is complex
- **No Reusability**: UI components can't be used elsewhere

### Proposed Structure

```
bathala/src/game/scenes/Prologue/
├── index.ts                          # Main Prologue scene (orchestrator)
├── PrologueTypes.ts                  # Enums, interfaces, types
├── phases/
│   ├── Phase0_Narrative.ts           # Story slides
│   ├── Phase1_CardBasics.ts          # Hand formation teaching
│   ├── Phase2_CombatActions.ts       # Attack/Defend/Special
│   ├── Phase3_EnemyMechanics.ts      # Intent, status, combat
│   ├── Phase4_Resources.ts           # Relics, potions, strategy
│   ├── Phase5_AdvancedCombat.ts      # Full integration
│   └── Phase6_MetaProgression.ts     # DDA, Landás, meta systems
├── ui/
│   ├── TutorialButton.ts             # Reusable button component
│   ├── TutorialDialogue.ts           # Dialogue box component
│   ├── TutorialCardDisplay.ts        # Card rendering for tutorial
│   ├── TutorialStatusDisplay.ts      # Status effect tooltips
│   ├── TutorialBreakdownOverlay.ts   # Damage calculation overlay
│   ├── TutorialInstructionBanner.ts  # Top instruction bar
│   └── TutorialSkipControls.ts       # Skip/Fast-Forward UI
├── animations/
│   ├── CombatAnimations.ts           # Attack, defend, special effects
│   ├── StatusEffectAnimations.ts     # Buff/debuff visuals
│   ├── TransitionAnimations.ts       # Phase transitions
│   └── ParticleEffects.ts            # Spare, slay, elemental effects
├── combat/
│   ├── TutorialCombatManager.ts      # Simplified combat for tutorial
│   ├── TutorialEnemyAI.ts            # Scripted enemy behavior
│   └── TutorialHandEvaluator.ts      # Hand eval with detailed feedback
└── data/
    ├── TutorialEnemies.ts            # Duwende, Tikbalang configs
    ├── TutorialDialogue.ts           # All dialogue text
    └── TutorialTooltips.ts           # Help text for all mechanics
```

### Key Architectural Principles

#### 1. **Separation of Concerns**
```typescript
// ❌ BEFORE: Everything in Prologue.ts
private handleFormPair() {
    // 50 lines of UI code
    // 30 lines of dialogue
    // 20 lines of hand evaluation
    // 15 lines of animation
}

// ✅ AFTER: Each concern in its own module
class Phase1_CardBasics {
    private ui: TutorialCardDisplay;
    private dialogue: TutorialDialogue;
    private evaluator: TutorialHandEvaluator;
    
    handleFormPair() {
        this.dialogue.show("Learn to form a Pair...");
        const cards = this.ui.displayCards(PAIR_CONFIG);
        const result = this.evaluator.checkPair(cards);
        this.ui.showFeedback(result);
    }
}
```

#### 2. **Phase-Based System**
```typescript
// Each phase is self-contained
interface TutorialPhase {
    init(): void;                    // Setup phase
    start(): Promise<void>;          // Run phase logic
    cleanup(): void;                 // Teardown
    canSkip(): boolean;              // Is phase skippable?
    onSkip(): void;                  // Handle skip
}

// Main orchestrator
class Prologue extends Scene {
    private phases: TutorialPhase[] = [
        new Phase0_Narrative(this),
        new Phase1_CardBasics(this),
        // ... etc
    ];
    
    private currentPhaseIndex = 0;
    
    async runTutorial() {
        for (let i = 0; i < this.phases.length; i++) {
            const phase = this.phases[i];
            phase.init();
            await phase.start();
            phase.cleanup();
            
            if (this.skipRequested) break;
        }
    }
}
```

#### 3. **Reusable UI Components**
```typescript
// Generic button that can be used anywhere
export class TutorialButton extends Phaser.GameObjects.Container {
    constructor(
        scene: Scene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        style?: ButtonStyle
    ) {
        // Setup visual, hover, click logic
    }
    
    enable() { /* ... */ }
    disable() { /* ... */ }
    pulse() { /* ... */ }  // Attention animation
}

// Usage
const attackButton = new TutorialButton(
    this.scene,
    100, 200,
    "Attack",
    () => this.handleAttack(),
    { primary: true }
);
```

#### 4. **Data-Driven Dialogue**
```typescript
// TutorialDialogue.ts
export const PHASE1_DIALOGUE = {
    WELCOME: "Greetings, traveler. Let's begin...",
    CARD_ANATOMY: "Each card has a rank and element...",
    PAIR_EXPLAIN: "Two cards of the same rank form a Pair...",
    PAIR_SUCCESS: "Excellent! You formed a Pair.",
    PAIR_FAILURE: "Not quite. A Pair needs two matching ranks.",
    // ... etc
};

// Usage
this.dialogue.show(PHASE1_DIALOGUE.PAIR_EXPLAIN);
```

#### 5. **Animation Management**
```typescript
// CombatAnimations.ts
export class CombatAnimations {
    static async playAttack(
        scene: Scene,
        attacker: Sprite,
        target: Sprite,
        damage: number
    ): Promise<void> {
        // Shake, tint, damage number, etc.
        // Returns promise when animation completes
    }
    
    static async playDefend(
        scene: Scene,
        defender: Sprite,
        blockGained: number
    ): Promise<void> {
        // Shield glow, block number, etc.
    }
}

// Usage
await CombatAnimations.playAttack(this.scene, player, enemy, 56);
```

---

## Fast-Forward & Skip System

### Implementation Strategy

```typescript
enum PlaybackSpeed {
    NORMAL = 1,      // Full tutorial (21-32 min)
    FAST = 3,        // 3× speed (7-10 min)
    SKIP_TO_END = 999 // Instant (<1 min)
}

class Prologue extends Scene {
    private playbackSpeed: PlaybackSpeed = PlaybackSpeed.NORMAL;
    
    // Controls overlay (always visible)
    private createSpeedControls() {
        // [1× Normal] [3× Fast] [Skip All]
        // Selected button highlighted
    }
    
    // Affects all timed events
    private getAdjustedDelay(baseDelay: number): number {
        return baseDelay / this.playbackSpeed;
    }
    
    // Skip to final phase
    private skipToEnd() {
        this.currentPhaseIndex = this.phases.length - 1;
        this.phases[this.currentPhaseIndex].start();
    }
}
```

### Fast-Forward Behavior
- **Dialogue**: Type instantly (no character-by-character)
- **Animations**: Duration ÷ 3
- **Delays**: All `delayedCall` times ÷ 3
- **Combat**: Auto-play optimal moves
- **Transitions**: Fade faster

### Skip Button Enhancement
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Tutorial Controls                        │
│                                                             │
│  Playback Speed: [●1× Normal] [○3× Fast] [○Skip All]      │
│                                                             │
│  [Phase 2/6: Combat Actions]                                │
│  Progress: ▓▓▓▓▓░░░░░ 42%                                  │
│                                                             │
│  [Jump to Phase ▼]  [Exit Tutorial]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Accessibility & Player-Friendly Features

### 1. **Phase Navigation**
- Allow jumping to specific phases (for testing or review)
- "Already know this? Skip to Phase 4"

### 2. **Tooltips Everywhere**
- Hover over any mechanic term → tooltip
- Example: Hover "Strength" → "💪 +3 base damage per stack"

### 3. **Help Button**
- Persistent "?" button for context-sensitive help
- Clicking shows expanded explanation of current mechanic

### 4. **Mistake Forgiveness**
- If player fails a tutorial task, show hint
- After 3 failures, offer to auto-complete or skip section

### 5. **Settings Integration**
```
[Tutorial Settings]
• Show damage calculations: [ON] / OFF
• Auto-advance dialogue: ON / [OFF]
• Animation speed: Slow / [Normal] / Fast
• Tutorial difficulty: [Guided] / Freeform
```

---

## Content Additions

### New Enemies for Tutorial
1. **Training Dummy** (Phase 2)
   - HP: 100, Damage: 0 (doesn't attack)
   - Purpose: Practice actions without danger

2. **Duwende Trickster** (Phase 3)
   - HP: 130, Damage: 12
   - Pattern: Simple (steal_block, disrupt_draw, attack)
   - Lore: "Duwende grant boons/curses, warped by engkanto lies."

3. **Tikbalang Scout** (Phase 5)
   - HP: 180, Damage: 21
   - Pattern: Moderate (attack, confuse, attack)
   - Lore: "Tikbalang were forest protectors, now misleading."

### New Tutorial Relics (Awarded During Tutorial)
- **Tutorial Charm**: "Start tutorial combats with +10 HP and 1 Strength."
  - Purpose: Make first combat easier, teach Strength
- **Learner's Amulet**: "Gain 1 Spirit Fragment after completing tutorial."
  - Purpose: Introduce meta-progression immediately

### New Tutorial Potions (Given to Practice)
- **Minor Healing Potion**: "Heal 10 HP immediately."
- **Minor Block Potion**: "Gain 10 Block immediately."
- **Minor Damage Potion**: "Deal 15 damage to target enemy."

---

## Implementation Timeline

### Sprint 1: Foundation (Week 1)
- [ ] Create folder structure (`Prologue/`)
- [ ] Implement `TutorialPhase` interface
- [ ] Migrate Phase 0 (Narrative) to new structure
- [ ] Build reusable UI components (Button, Dialogue)

### Sprint 2: Phase 1-2 (Week 2)
- [ ] Implement Phase 1 (Card Basics) with all sub-stages
- [ ] Implement Phase 2 (Combat Actions)
- [ ] Create Training Dummy enemy
- [ ] Build damage breakdown overlay

### Sprint 3: Phase 3-4 (Week 3)
- [ ] Implement Phase 3 (Enemy Mechanics)
- [ ] Implement Phase 4 (Resources & Strategy)
- [ ] Integrate Duwende Trickster combat
- [ ] Create status effect display system

### Sprint 4: Phase 5-6 (Week 4)
- [ ] Implement Phase 5 (Advanced Combat)
- [ ] Implement Phase 6 (Meta-Progression & DDA)
- [ ] Integrate Tikbalang Scout combat
- [ ] Build DDA transparency screen (thesis requirement!)

### Sprint 5: Polish & Testing (Week 5)
- [ ] Implement fast-forward system
- [ ] Add skip controls and phase navigation
- [ ] Create tooltips for all mechanics
- [ ] Playtesting with 5-10 users
- [ ] Iterate based on feedback

---

## Success Metrics

### Quantitative Goals
- **Completion Rate**: >80% of players complete tutorial (vs. skip)
- **Phase Completion**: >90% complete each phase without help
- **Time to Competency**: Players win first real combat (post-tutorial) within 3 attempts
- **Fast-Forward Usage**: >30% of returning players use fast-forward
- **Tutorial Satisfaction**: >4.0/5.0 average rating

### Qualitative Goals
- Players understand all core mechanics before Overworld
- Players feel confident making strategic decisions
- Tutorial feels integrated with game world (not "tutorial-y")
- Cultural/mythological elements are memorable
- DDA system is understood as transparent and fair (thesis goal!)

---

## Thesis Integration

### How Tutorial Supports Thesis Goals

1. **DDA Transparency**
   - Phase 6 explicitly explains DDA system
   - Shows how performance metrics affect difficulty
   - Demonstrates rule-based approach (not "black box AI")

2. **Flow State Teaching**
   - Tutorial models optimal challenge curve
   - Gradually increases complexity
   - Provides immediate feedback (thesis-validated approach)

3. **Measurable Learning**
   - Each phase has clear success criteria
   - Can track player progression data
   - Validates rule-based DDA effectiveness

4. **Player Trust Building**
   - Transparency from start builds trust in DDA
   - "The game adapts to YOU" messaging
   - Shows respect for player skill level

---

## Open Questions / Decisions Needed

1. **Voice Acting**: Should tutorial have voiceover for accessibility?
2. **Localization**: Tutorial text is 10,000+ words—plan for Filipino translation?
3. **Mobile Considerations**: Touch controls need separate tutorial sections?
4. **A/B Testing**: Test "short" vs. "comprehensive" tutorial versions?
5. **Analytics**: What telemetry to capture during tutorial?
   - Phase completion rates
   - Time spent per phase
   - Skip/fast-forward usage
   - Help button clicks
   - Failure counts per tutorial task

---

## Conclusion

This comprehensive revamp transforms the Prologue from a brief introduction into a thorough, educational experience that respects both newcomers and experienced players. By:

1. **Structuring** the tutorial into clear, progressive phases
2. **Introducing** all game mechanics with depth and practice
3. **Integrating** enemy lore and mythology naturally
4. **Organizing** code into maintainable, reusable modules
5. **Providing** skip and fast-forward options for flexibility
6. **Transparently** explaining DDA (thesis requirement!)

...we create a tutorial that serves the dual purpose of player education and thesis validation, while honoring the rich Filipino mythology that makes Bathala unique.

---

**Next Steps**: Review this plan, approve/modify, then begin Sprint 1 implementation.

**Estimated Development Time**: 5 weeks (1 developer)  
**Estimated Lines of Code**: ~3,000-4,000 (vs. current 770)  
**Code Organization Improvement**: 6× better (monolithic → modular)


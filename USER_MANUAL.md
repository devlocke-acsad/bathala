# Bathala - Complete User Manual

**Version 5.8.14.25**  
**Last Updated: November 13, 2025**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Installation & Setup](#installation--setup)
3. [Game Overview](#game-overview)
4. [Getting Started](#getting-started)
5. [Core Gameplay Systems](#core-gameplay-systems)
6. [Combat Mechanics](#combat-mechanics)
7. [Deck-Sculpting System](#deck-sculpting-system)
8. [Overworld Navigation](#overworld-navigation)
9. [Items & Progression](#items--progression)
10. [The Landás System](#the-landás-system)
11. [Dynamic Difficulty Adjustment](#dynamic-difficulty-adjustment)
12. [Chapters & Bosses](#chapters--bosses)
13. [Advanced Strategies](#advanced-strategies)
14. [Development Guide](#development-guide)
15. [Troubleshooting](#troubleshooting)
16. [Technical Reference](#technical-reference)

---

## Introduction

### What is Bathala?

**Bathala** is a Filipino mythology-inspired roguelike card game that combines poker-based combat mechanics with strategic deck-sculpting and a unique rule-based Dynamic Difficulty Adjustment (DDA) system. Players take on the role of a **babaylan**—a spiritual seer communing with the divine—navigating through a procedurally generated spirit realm to restore cosmic order.

### Key Features

- **🃏 Poker-Inspired Combat**: Strategic 5-card hand formation from 8 drawn cards
- **🎨 Deck-Sculpting**: Start with 52 cards, sculpt through purification, attunement, and rare infusion
- **🌓 Day-Night Cycle**: Action-based progression (not real-time)
- **⏱️ Five-Cycle Countdown**: Boss awakens after 5 complete day-night cycles (~500 actions)
- **🎭 Landás System**: Morality choices (spare vs. slay) affect rewards and narrative
- **📊 Rule-Based DDA**: Transparent adaptive difficulty system based on performance metrics
- **🏺 Rich Itemization**: Relics (passive) and potions (active) with deep synergies
- **🌊 Filipino Mythology**: Authentic creatures, deities, and lore from Philippine folklore

### Target Audience

- **Roguelike enthusiasts** seeking strategic depth
- **Card game players** interested in unique poker mechanics
- **Players interested in Filipino culture** and mythology
- **Researchers** studying adaptive difficulty systems

---

## Installation & Setup

### System Requirements

**Minimum:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 2GB RAM
- JavaScript enabled
- 1280x720 display resolution

**Recommended:**
- Latest browser version
- 4GB+ RAM
- 1920x1080 display resolution
- Hardware acceleration enabled

### Installation for Players

#### Option 1: Web Version (Recommended)
1. Navigate to the hosted game URL
2. Wait for assets to load
3. Click "Start Game" to begin

#### Option 2: Local Build
1. Download the latest release from the repository
2. Extract the files to a directory
3. Open `index.html` in your web browser

### Installation for Developers

#### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **Code Editor**: VS Code recommended

#### Setup Steps

```powershell
# Clone the repository
git clone https://github.com/devlocke-acsad/bathala.git
cd bathala/bathala

# Install dependencies
npm install

# Start development server
npm run dev

# The game will be available at http://localhost:5173
```

#### Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev-nolog` | Start dev server without logging |
| `npm run build` | Build for production |
| `npm run build-nolog` | Build without logging |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:dda` | Run DDA-specific tests |

---

## Game Overview

### Story & Setting

In the world of Bathala, the creator god has fallen silent, and the spirit realm has been fractured. Corrupted engkanto (nature spirits) twist the forest guardians into deceivers, while divine betrayals spark feuds in the submerged barangays. As a babaylan, you must navigate these corrupted realms, facing corrupted anitos and false deities to restore cosmic order.

### Win Conditions

- **Chapter Victory**: Defeat the chapter boss after surviving 5 day-night cycles
- **Ultimate Goal**: Complete all 3 chapters and restore Bathala's order
- **Defeat**: Run out of HP during combat

### Progression Structure

1. **Chapter 1: The Corrupted Ancestral Forests** (Lupa/Hangin Focus)
2. **Chapter 2: The Submerged Barangays** (Tubig/Apoy Focus)
3. **Chapter 3: The Skyward Citadel** (Multi-Element Focus)
4. **Epilogue: The Mended Bamboo**

---

## Getting Started

### First Launch

1. **Tutorial**: The game begins with a prologue tutorial teaching core mechanics
2. **Character**: You play as a babaylan with starting HP of 100
3. **Starting Deck**: 52 cards (13 cards × 4 suits)
4. **Initial Resources**: Some starting gold and Spirit Fragments

### Main Menu Options

- **New Run**: Start a fresh playthrough
- **Continue**: Resume saved progress (auto-saves after each node)
- **Chronicle**: View unlocked lore entries
- **Ancestral Memories**: Spend Spirit Fragments on permanent upgrades
- **Settings**: Adjust audio, graphics, and gameplay options
- **Credits**: View development team and acknowledgments

### Interface Overview

#### Main Game Screen

```
┌─────────────────────────────────────────────────┐
│  HP Bar  │  Gold  │  Relics  │  Potions  │  Day │
├─────────────────────────────────────────────────┤
│                                                 │
│            OVERWORLD / COMBAT VIEW              │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│              Hand / Action Buttons              │
└─────────────────────────────────────────────────┘
```

#### HUD Elements

- **HP Bar**: Current/Max health with visual indicator
- **Gold Counter**: Currency for shops and purification
- **Relic Bar**: Shows active relics (max 6)
- **Potion Slots**: Active potions (max 3)
- **Day/Night Indicator**: Current phase and action count
- **Landás Indicator**: Current moral alignment

---

## Core Gameplay Systems

### The Five-Cycle Countdown

The game's primary pacing mechanism:

- **1 Cycle = 100 Actions** (50 day, 50 night)
- **5 Cycles = 500 Actions** total before boss
- **Actions Include**:
  - Moving on the overworld
  - Entering combat
  - Visiting nodes (shops, rest sites, events)
  - Any player interaction that advances time

#### Cycle Phases

**Day Phase (50 Actions)**
- Enemies are neutral and avoidable
- Better visibility on the map
- Shops offer standard prices
- Optimal time for preparation

**Night Phase (50 Actions)**
- Enemies become aggressive hunters
- Reduced visibility
- Higher risk encounters
- Increased rewards for bravery

### Action Economy

Every player action advances the cycle counter. Plan accordingly:

- **Early Cycles (1-2)**: Build deck foundation, gather basic relics
- **Mid Cycles (3-4)**: Refine deck, collect powerful relics
- **Late Cycle (5)**: Final preparations before boss

---

## Combat Mechanics

### Combat Flow

```
1. Draw 8 cards from deck
2. Select 5 cards to form poker hand
3. Choose action (Attack/Defend/Special)
4. Action resolves with hand bonus
5. Enemy takes turn
6. Repeat until victory or defeat
```

### Card Anatomy

Each card has:
- **Suit**: Apoy (Fire), Tubig (Water), Lupa (Earth), Hangin (Air)
- **Value**: 1-13 (10, 11-Mandirigma, 12-Babaylan, 13-Datu)
- **Element Effect**: Suit-specific status effect

### The Four Suits

#### Apoy (Fire) 🔥
- **Primary Effect**: Burn (damage over time)
- **Combat Style**: Aggressive, front-loaded damage
- **Synergies**: Damage amplification relics
- **Best For**: Offensive strategies, quick eliminations

#### Tubig (Water) 💧
- **Primary Effect**: Healing and regeneration
- **Combat Style**: Defensive, sustain-focused
- **Synergies**: Block and heal relics
- **Best For**: Long battles, survival strategies

#### Lupa (Earth) 🌍
- **Primary Effect**: Strength (increased damage)
- **Combat Style**: Balanced, power-building
- **Synergies**: Status duration relics
- **Best For**: Balanced decks, consistent damage

#### Hangin (Air) 💨
- **Primary Effect**: Dexterity (increased dodge/evasion)
- **Combat Style**: Tactical, control-oriented
- **Synergies**: Draw and discard relics
- **Best For**: Defensive strategies, combo setups

### Poker Hands & Bonuses

| Hand Type | Bonus | Requirements | Example |
|-----------|-------|--------------|---------|
| High Card | +0 | No matching cards | A♠ K♦ 8♣ 5♥ 2♠ |
| Pair | +2 | Two matching values | 7♥ 7♦ K♠ 5♣ 2♥ |
| Two Pair | +4 | Two different pairs | J♠ J♦ 4♥ 4♣ A♠ |
| Three of a Kind | +7 | Three matching values | 9♣ 9♥ 9♠ K♦ 3♣ |
| Straight | +10 | Five sequential values | 5♠ 6♥ 7♦ 8♣ 9♠ |
| Flush | +14 | Five same suit | 2♥ 5♥ 8♥ J♥ K♥ |
| Full House | +18 | Three + Pair | Q♠ Q♦ Q♥ 3♣ 3♠ |
| Four of a Kind | +22 | Four matching values | 8♣ 8♦ 8♥ 8♠ A♦ |
| Straight Flush | +35 | Sequential same suit | 3♣ 4♣ 5♣ 6♣ 7♣ |
| Five of a Kind | +30 | Five matching values* | 10♠ 10♦ 10♥ 10♣ 10♠ |

*Requires special relic: **Echo of the Ancestors**

### Combat Actions

#### Attack 🗡️
- **Base Damage**: Hand bonus
- **Modified By**: Strength stacks, enemy Vulnerable
- **Reduced By**: Enemy block, Weak debuff
- **Formula**: `(Base + Bonus + Strength) × Element × Vulnerable - Enemy Block`

#### Defend 🛡️
- **Base Block**: Hand bonus
- **Modified By**: Dexterity stacks
- **Carries Over**: Persistent block across turns (up to 50% of original)
- **Formula**: `Base + Bonus + Dexterity`

#### Special ⚡
- **Base Effect**: Hand bonus + elemental status application
- **Charges**: Limited uses per combat (shown as energy meter)
- **Element-Specific**:
  - **Apoy**: Apply Burn stacks
  - **Tubig**: Heal HP
  - **Lupa**: Gain Strength stacks
  - **Hangin**: Gain Dexterity stacks

### Status Effects

#### Offensive Buffs
- **Strength**: +Damage per stack
- **Burn**: Damage over time (3 turns)
- **Vulnerable**: +50% damage taken (3 turns)

#### Defensive Buffs
- **Dexterity**: +Evasion/Block per stack
- **Block**: Damage absorption (depletes before HP)

#### Debuffs
- **Weak**: -25% damage dealt (3 turns)
- **Stun**: Skip next turn
- **Seal**: Cannot use Special actions (3 turns)
- **Fear**: Random card discards (3 turns)

### Discard System

- **Starting Charges**: 1 per combat
- **Usage**: Spend to discard up to 5 cards and redraw
- **Relic Bonuses**: Some relics increase max charges
- **Strategic Use**: Save for critical moments or combo setups

### Element Dominance

When using multiple element types in a hand:
- **Dominant Element**: The suit with most cards determines effect
- **Mixed Hands**: Weaker status application but more flexible
- **Pure Hands**: Maximum element effect potency

---

## Deck-Sculpting System

Unlike traditional deck-builders where you constantly add cards, Bathala focuses on **refinement and reduction**.

### Sculpting Actions

#### 1. Purify (Remove) 💀
**Location**: Shops  
**Cost**: 50-100 gold (varies by card value)  
**Effect**: Permanently remove a card from your deck

**When to Purify**:
- Low-value cards (1-3) that dilute combos
- Off-element cards when specializing
- Cards that conflict with your relic synergies
- Excess cards when aiming for consistency

**Purification Priority**:
1. Remove 1-3 value cards first
2. Target off-element suits
3. Reduce to 30-40 cards for consistency
4. Keep 24-30 cards for advanced strategies

#### 2. Attune (Upgrade) ✨
**Location**: Rest Sites  
**Cost**: Free  
**Effect**: Transform a card into a higher-value card of the **same suit**

**Example Attunement Path**:
```
Apoy-3 → Apoy-7 → Apoy-10 → Apoy-13 (Datu)
```

**Attunement Strategy**:
- Focus on one or two suits for consistency
- Prioritize cards you frequently use
- Create more face cards (11-13) for better hands
- Balance across suits for flexibility

#### 3. Infuse (Add) ➕
**Location**: Elite/Boss Rewards (Rare)  
**Cost**: Free (reward only)  
**Effect**: Add a powerful new card to your deck

**Infusion Considerations**:
- **Use Sparingly**: Only add cards that significantly improve strategy
- **Synergy First**: Choose cards that combo with existing relics
- **Balance**: Don't bloat your deck unnecessarily
- **Quality Over Quantity**: One amazing card > three mediocre cards

### Deck Archetypes

#### Mono-Element (Specialist)
- **Strategy**: Focus on one suit, purify all others
- **Target Size**: 24-30 cards
- **Strength**: Maximum element effect consistency
- **Weakness**: Vulnerable to counters

#### Dual-Element (Hybrid)
- **Strategy**: Two complementary suits (e.g., Apoy + Lupa)
- **Target Size**: 32-40 cards
- **Strength**: Flexibility and backup options
- **Weakness**: Less consistent than mono-element

#### Balanced (Rainbow)
- **Strategy**: Maintain all four suits equally
- **Target Size**: 40-52 cards
- **Strength**: Adaptable to any situation
- **Weakness**: Less powerful individual effects

#### Face Card (High Roller)
- **Strategy**: Purify low cards, attune to faces (11-13)
- **Target Size**: 20-28 cards
- **Strength**: Consistently high hand bonuses
- **Weakness**: Difficult early game, expensive to build

---

## Overworld Navigation

### Map Generation

The overworld is procedurally generated with:
- **Grid-Based Layout**: Move one tile at a time
- **Branching Paths**: Multiple routes to the boss
- **Node Types**: Combat, Elite, Rest, Shop, Event, Boss
- **Visibility**: Day shows more nodes, night restricts vision

### Node Types

#### Combat Node ⚔️
- **Frequency**: Common
- **Enemies**: Random from chapter's enemy pool
- **Rewards**: Gold, card removal option
- **Risk**: Low-Medium

#### Elite Node 💀
- **Frequency**: Uncommon
- **Enemies**: Tougher, multi-phase encounters
- **Rewards**: Relic (60%), Rare card infusion, more gold
- **Risk**: High

#### Rest Site 🔥
- **Frequency**: Uncommon
- **Options**:
  - **Rest**: Heal 30% max HP
  - **Attune**: Upgrade a card
- **Cost**: Free
- **Risk**: None

#### Shop Node 🏪
- **Frequency**: Uncommon
- **Services**:
  - Buy relics (100-200g)
  - Buy potions (40-80g)
  - Purify cards (50-100g)
  - Sell unwanted items (50% value)
- **Prices**: Modified by DDA and Landás

#### Mysterious Event Node ❓
- **Frequency**: Rare
- **Nature**: Unconditional lore encounters
- **Options**: Story choices, free rewards, lore unlocks
- **Risk**: Varies (usually low)

#### Boss Node 👑
- **Frequency**: Once per chapter (after 5 cycles)
- **Enemies**: Chapter-specific boss with unique mechanics
- **Rewards**: Diwa Shard, major relic, chapter completion
- **Risk**: Very High

### Navigation Strategy

#### Path Planning
1. **Count Actions**: Always aware of cycle progress
2. **Prioritize Rest**: Before difficult encounters
3. **Shop Early**: Get key relics before mid-game
4. **Elite Timing**: Attempt when deck is ready

#### Day vs. Night Tactics

**Day Strategy**:
- Explore aggressively
- Visit multiple nodes
- Stock up on resources
- Take calculated risks

**Night Strategy**:
- Move efficiently toward goal
- Avoid unnecessary combat
- Use potions for safety
- Prepare for boss if cycle 5

---

## Items & Progression

### Relics (Passive Items)

**Capacity**: Maximum 6 relics per run

#### Relic Rarity

| Tier | Drop Rate | Power Level |
|------|-----------|-------------|
| Common | 50% | Basic bonuses |
| Uncommon | 30% | Moderate synergies |
| Rare | 15% | Strong effects |
| Legendary | 5% | Build-defining |

#### Notable Relics by Chapter

**Chapter 1: Corrupted Ancestral Forests**

| Relic | Effect |
|-------|--------|
| Tikbalang's Hoof | +10% dodge chance |
| Balete Root | +2 block per Lupa card played |
| Sigbin Heart | +5 damage on burst turns (every 3rd turn) |
| Duwende Charm | +10% chance to avoid Weak debuff |
| Kapre's Cigar | Summons a minion once per combat |

**Chapter 2: Submerged Barangays**

| Relic | Effect |
|-------|--------|
| Sirena's Scale | +2 heal per Tubig card played |
| Siyokoy Fin | +3 block on splash damage |
| Santelmo Ember | Burn damage +2 per stack |
| Bakunawa Fang | +5 damage when using relics |

**Chapter 3: Skyward Citadel**

| Relic | Effect |
|-------|--------|
| Tigmamanukan Feather | +1 draw for high-tier hands |
| Sarimanok Plumage | +1 Special charge per combat |
| Apolaki's Spear | +5 damage on multi-element hands |
| Coconut Diwa | Ignore 1 nullify effect per combat |

#### Universal Powerful Relics

| Relic | Effect | Strategy |
|-------|--------|----------|
| Babaylan's Talisman | Treat hand as one tier higher | Any build |
| Echo of the Ancestors | Enables Five of a Kind | Face card build |
| Earthwarden's Plate | Start combat with 5 block | Defensive build |
| Agimat of the Swift Wind | +1 discard charge | Combo build |

### Potions (Active Items)

**Capacity**: Maximum 3 potions per run

#### Potion Categories

**Offensive Potions**
- **Phial of Elements** (40g): Choose dominant element for turn
- **Vial of Flames** (60g): Apply 10 Burn to all enemies
- **Lightning in a Bottle** (80g): Deal 25 damage to one target

**Defensive Potions**
- **Elixir of Fortitude** (50g): Gain 15 block
- **Balm of Resilience** (70g): Cleanse all debuffs
- **Potion of Second Wind** (100g): Heal 30 HP

**Utility Potions**
- **Potion of Clarity** (40g): Draw 3 additional cards
- **Tonic of Focus** (60g): +2 discard charges this combat
- **Brew of Fortune** (80g): Upgrade one hand tier this combat

#### Potion Strategy
- **Save for Bosses**: Don't waste on common fights
- **Combo Synergies**: Pair with relics for amplified effects
- **Emergency Tools**: Keep healing/cleanse for dire situations
- **Pre-Combat Buffs**: Some potions can be used before battle

### Meta-Progression (Ancestral Memories)

**Currency**: Spirit Fragments (earned per run)

#### Unlock Categories

**Permanent Stat Boosts**
- +10 Max HP (Cost: 50 Fragments)
- +5% Dodge Chance (Cost: 75 Fragments)
- Start with +5 Strength (Cost: 100 Fragments)
- Start with +5 Dexterity (Cost: 100 Fragments)

**Deck Starting Bonuses**
- Begin with one card pre-attuned (Cost: 125 Fragments)
- Start with 5 fewer low-value cards (Cost: 150 Fragments)

**Economic Advantages**
- Start runs with +100 Gold (Cost: 75 Fragments)
- 10% discount at all shops (Cost: 100 Fragments)

**Relic Unlocks**
- Unlock specific relics for future runs (Cost: Varies)

---

## The Landás System

**Landás** (Tagalog for "path") represents your moral alignment through combat choices.

### How It Works

Every combat encounter offers a choice:
- **Slay** (–1 Landás): Execute the defeated enemy
- **Spare** (+1 Landás): Show mercy, allowing escape

**Important**: Landás affects **rewards and narrative only**, NOT difficulty (DDA is independent).

### Landás Alignments

#### Mercy (+5 to +10) 🕊️
**Theme**: Compassionate restoration

**Benefits**:
- +50% Spirit Fragment drops
- Unique mercy-based events
- Enemies may flee at low HP
- Lore unlocks focused on redemption

**Drawbacks**:
- -20% gold from combat
- Fewer aggressive relics offered

**Ideal For**: Players focused on lore, meta-progression

---

#### Balance (–4 to +4) ⚖️
**Theme**: Pragmatic neutrality

**Benefits**:
- Standard rewards
- Access to all event types
- Balanced relic pool
- Neutral narrative path

**Drawbacks**:
- No special bonuses

**Ideal For**: First-time players, competitive runs

---

#### Conquest (–10 to –5) ⚗️
**Theme**: Ruthless power

**Benefits**:
- +30% gold from combat
- More aggressive/offensive relics
- Shops offer rare items
- Combat-focused events

**Drawbacks**:
- -30% Spirit Fragment drops
- Enemies fight harder when cornered
- Darker narrative outcomes

**Ideal For**: Players optimizing single-run victory

### Landás Events

Certain mysterious events are gated by alignment:
- **Mercy events**: Peaceful resolutions, spirit communion
- **Balance events**: Neutral encounters, educational lore
- **Conquest events**: Combat trials, power acquisition

---

## Dynamic Difficulty Adjustment

### Overview

Bathala features a **transparent, rule-based DDA system** that adapts to player performance without hidden manipulation. This is a key thesis component.

### Player Performance Score (PPS)

**Range**: 0.5 to 5.0  
**Starting**: 2.5 (neutral baseline)  
**Update Frequency**: After every combat encounter

#### Calibration Phase

The first **3 combats** use a "learning" tier (1.0× multipliers) while tracking PPS to establish baseline without early difficulty spikes.

### Performance Inputs

Each combat evaluates:

#### 1. Health Retention (End-of-Combat HP %)
- **90-100%**: +0.35 PPS
- **70-89%**: +0.15 PPS
- **50-69%**: 0 PPS
- **30-49%**: -0.2 PPS
- **< 30%**: -0.4 PPS
- **Bonus**: Perfect combat (no damage) +0.25 additional

#### 2. Combat Efficiency (Turn Count vs. Expected)
- **Expected Turns**: Based on enemy tier
  - Common: 3-5 turns
  - Elite: 6-10 turns
  - Boss: 12-20 turns
- **Efficient** (under expected): +0.2 PPS
- **Inefficient** (over expected): -0.2 PPS

#### 3. Damage Efficiency (DPT vs. Expected)
- **DPT** = Total damage dealt ÷ turns taken
- **≥30% above expected**: +0.2 PPS
- **≤30% below expected**: -0.15 PPS

#### 4. Hand Quality
- **Straight or better**: +0.1 PPS
- **Four of a Kind or better**: +0.25 PPS

#### 5. Resource Management
- **Discard Usage ≤30%** of available: +0.15 PPS
- Shows good planning and efficiency

#### 6. Clutch Performance
- **Starting combat below 50% HP** and winning well: Up to +0.2 PPS
- Rewards risk-taking and skilled play

#### 7. Comeback Momentum
- **When PPS < 1.5** and trend is positive:
  - +0.3 base bonus
  - +0.15 per consecutive strong victory (cap +0.45)
- Helps players recover from losing streaks

### Tier Multipliers

Performance adjustments are modified by current tier:

| Tier | Player State | Bonus Multiplier | Penalty Multiplier |
|------|--------------|------------------|-------------------|
| 0 | Struggling | ×1.5 | ×0.5 |
| 1-2 | Learning | ×1.0 | ×1.0 |
| 3-4 | Thriving | ×0.8 | ×1.2 |
| 5 | Mastering | ×0.5 | ×1.5 |

**Effect**: Easier for struggling players to climb; harder for skilled players to stay at peak.

### Difficulty Bands & Responses

#### Tier 0: Struggling (PPS < 1.5)
**Player State**: Consistent losses, low HP, poor efficiency

**System Response**:
- **Enemy Stats**: -20% HP, -20% damage
- **Map Generation**: Increased Rest node frequency
- **Economy**: Standard shop prices
- **UI**: Subtle tutorial reminders
- **Narrative**: "The realm eases its trials..."

---

#### Tier 1-2: Learning (PPS 1.5-2.9)
**Player State**: Baseline competence, normal learning curve

**System Response**:
- **Enemy Stats**: Baseline (no modifier)
- **Map Generation**: Standard distribution
- **Economy**: Standard prices
- **UI**: Normal information display
- **Narrative**: Neutral descriptions

---

#### Tier 3-4: Thriving (PPS 3.0-4.4)
**Player State**: Consistent strong performance

**System Response**:
- **Enemy Stats**: +15% HP, +15% damage
- **Map Generation**: Fewer easy nodes
- **Economy**: Slightly higher shop prices
- **Enemy AI**: Access to advanced behaviors
- **Narrative**: "The spirits sense your strength..."

---

#### Tier 5: Mastering (PPS ≥ 4.5)
**Player State**: Near-perfect execution, expert-level play

**System Response**:
- **Enemy Stats**: +25% HP, +25% damage
- **Map Generation**: Maximum challenge density
- **Economy**: Premium prices
- **Enemy AI**: Complex patterns and scripting
- **Narrative**: "The realm tests you with its full might..."

### Adaptive Outputs

#### Economic Tuning
- **Shop Prices**: ±15% based on tier
- **Gold Drops**: Inversely scaled (more for struggling)
- **Purification Costs**: Slightly reduced when struggling

#### Procedural Node Bias
- **Rest Nodes**: +30% frequency when PPS < 2.0
- **Elite Nodes**: +20% frequency when PPS > 4.0
- **Shop Access**: Guaranteed within 10 nodes when low gold

### DDA Transparency

**Visual Indicators**:
- PPS shown in pause menu (optional)
- Difficulty tier displayed subtly
- Narrative cues for tier changes

**Analytics Logging**:
- Session history saved
- PPS progression tracked
- Win-rate target bands recorded
- All data available for thesis validation

### DDA Independence

**Important**: DDA operates **completely separately** from:
- Landás moral choices
- Meta-progression unlocks
- Story decisions
- Player preferences

---

## Chapters & Bosses

### Chapter 1: The Corrupted Ancestral Forests

**Theme**: Lupa (Earth) + Hangin (Air)  
**Setting**: Balete groves and twisted forests  
**Cycles**: 5 (500 actions to boss)

#### Common Enemies
- **Tikbalang Scout** (HP: 28): Confusion effects
- **Balete Wraith** (HP: 22): Vulnerable gains Strength
- **Sigbin Charger** (HP: 35): Burst damage every 3 turns
- **Duwende Trickster** (HP: 18): Disrupts draws, steals block
- **Tiyanak Ambusher** (HP: 25): Critical hits, Fear

#### Elite Enemies
- **Kapre Shade** (HP: 65): AoE Burn, summons minions
- **Tawong Lipod** (HP: 60): Invisibility, stuns, Air benefits

#### Boss: Mangangaway
**HP**: 120  
**Mechanics**:
- Mimics player's last element used
- Curses cards in hand (random Seal/Weak application)
- **Hex of Reversal**: Swaps player's highest/lowest cards

**Strategy**:
- Vary elements to prevent counter-building
- Purify cursed cards when possible
- Save high-value cards for burst turns
- Use potions to cleanse debuffs

---

### Chapter 2: The Submerged Barangays

**Theme**: Tubig (Water) + Apoy (Fire)  
**Setting**: Sunken villages and volcanic islands  
**Cycles**: 5 (500 actions to boss)

#### Common Enemies
- **Sirena Illusionist** (HP: 30): Heals allies, charm effects
- **Siyokoy Raider** (HP: 40): High armor, splash damage
- **Santelmo Flicker** (HP: 20): Dodge, Burn application
- **Berberoka Lurker** (HP: 32): Banishes cards from hand
- **Magindara Swarm** (HP: 15×3): Regenerating units

#### Elite Enemies
- **Sunken Bangkilan** (HP: 70): Hand disruption, potion theft
- **Apoy-Tubig Fury** (HP: 68): Alternates Burn AoE and healing

#### Boss: Bakunawa
**HP**: 150  
**Mechanics**:
- **Flood**: Reduces hand size by 1 each turn (min 3)
- **Lunar Eclipse**: Devours a relic temporarily
- **Tide Surge**: Nullifies next damage instance

**Strategy**:
- Build deck for smaller hands (focus on consistency)
- Don't rely on single relic synergies
- Save burst damage for non-nullify turns
- Tubig healing is valuable here

---

### Chapter 3: The Skyward Citadel

**Theme**: Multi-Element Focus  
**Setting**: Floating divine palace  
**Cycles**: 5 (500 actions to boss)

#### Common Enemies
- **Tigmamanukan Watcher** (HP: 26): Grows Strength over time
- **Diwata Sentinel** (HP: 38): Counters opposite elements
- **Sarimanok Keeper** (HP: 30): Nullifies Specials, buffs
- **Bulalakaw Flamewings** (HP: 33): Meteor Burn, high mobility
- **Alan** (HP: 24): Winged dive attacks, summons

#### Elite Enemies
- **Ribung Linti Duo** (HP: 45×2): Shared damage, alternating attacks
- **Apolaki Godling** (HP: 85): Changes poker hand rules mid-combat

#### Boss: False Bathala
**HP**: 200  
**Mechanics**:
- **Divine Fusion**: Combines serpent (Ulilang Kaluluwa) and wings (Galang Kaluluwa)
- **Relic Theft**: Steals one relic per phase
- **Elemental Shift**: Changes vulnerability each turn
- **Divine Judgment**: Forces moral choice mid-battle (Landás impact)

**Strategy**:
- Balanced deck with all elements crucial
- Don't over-rely on relics (they can be stolen)
- Adapt to shifting vulnerabilities
- Prepare powerful potions for emergency

---

## Advanced Strategies

### Deck Optimization

#### The 30-Card Rule
**Target**: 30 cards for optimal consistency

**Math**: 
- 30-card deck = 26.7% chance to draw specific card in 8-card hand
- 40-card deck = 20% chance
- 52-card deck = 15.4% chance

**How to Achieve**:
1. Purify all 1-3 value cards (12 cards)
2. Remove 4-5 cards from weakest suit (4-5 cards)
3. Purify 5-7 more tactical removals (5-7 cards)
4. Total removed: 21-24 cards → 28-31 remaining

#### Face Card Focus
**Strategy**: Attune to create 16-20 face cards (values 11-13)

**Benefits**:
- Higher base hand bonuses
- More Pairs/Three of a Kinds naturally
- Better Attack/Defend scaling

**Execution**:
1. Attune 7→11, 8→12, 9→13 at Rest Sites
2. Keep 10-value cards (already high)
3. Purify 1-6 value cards aggressively

#### Element Specialization Tiers

**Mono-Element** (Maximum Power)
- Keep 1 suit only (~13 cards after purification)
- Requires: 8-10 purifications + element-locked relics
- Risk: Countered by element-resistant enemies

**Dual-Element** (Balanced Power)
- Keep 2 complementary suits (~26 cards)
- Apoy + Lupa (Offense)
- Tubig + Hangin (Defense)
- Most flexible approach

**Tri-Element** (Utility Focus)
- Remove weakest suit completely
- Maintain 3 suits for adaptability
- Good for learning/exploration runs

### Combat Tactics

#### Opening Turn Optimization
**Goal**: Establish early advantage

1. **High HP (>70%)**: Aggressive Attack with best hand
2. **Medium HP (40-70%)**: Balanced approach, Defend if needed
3. **Low HP (<40%)**: Prioritize Defend, heal if possible

#### Mid-Combat Decision Tree
```
Turn Start
├─ Enemy has <30% HP → All-in Attack
├─ Enemy charging special → Prioritize Defend
├─ You have <50% HP → Consider potion/Special heal
└─ Standard turn → Form best available hand
```

#### Discard Timing
**When to Discard**:
- Opening hand is all low-value cards
- Need specific element for relic synergy
- Hunting for combo pieces
- Emergency: Need healing/block cards

**When to Save**:
- Hand is already strong
- Boss fight (save for critical moments)
- Low charges remaining

### Relic Synergy Combos

#### "The Immortal" (Tubig Focus)
- **Sirena's Scale** (+2 heal per Tubig)
- **Babaylan's Talisman** (Hand tier +1)
- **Earthwarden's Plate** (+5 starting block)
- Strategy: Heal and block, outlast everything

#### "The Inferno" (Apoy Aggression)
- **Santelmo Ember** (Burn +2 per stack)
- **Bulalakaw Spark** (+3 Burn on multi-element)
- **Kapre's Cigar** (Summon minion)
- Strategy: Stack Burn, let DoT win fights

#### "The Gambler" (Hand Manipulation)
- **Echo of the Ancestors** (Enable Five of a Kind)
- **Agimat of the Swift Wind** (+1 discard)
- **Tigmamanukan Feather** (+1 draw on high hands)
- Strategy: Cycle through deck for perfect hands

#### "The Tank" (Pure Defense)
- **Earthwarden's Plate** (+5 starting block)
- **Balete Root** (+2 block per Lupa)
- **Siyokoy Fin** (+3 block on splash)
- Strategy: Block everything, chip damage over time

### Boss-Specific Strategies

#### Mangangaway (Chapter 1)
- **Deck**: Balanced elements to counter mimicry
- **Relics**: Anti-curse relics valuable
- **Potions**: Balm of Resilience for curse cleanse
- **Key**: Don't over-commit to single element

#### Bakunawa (Chapter 2)
- **Deck**: Small (24-30 cards) for reduced hand size
- **Relics**: Non-essential relics okay to lose
- **Potions**: Potion of Clarity for extra draws
- **Key**: Consistency over power

#### False Bathala (Chapter 3)
- **Deck**: All 4 elements represented
- **Relics**: Core build shouldn't depend on one
- **Potions**: Save 2-3 powerful potions
- **Key**: Adaptability is survival

---

## Development Guide

### For Contributors

#### Getting Started

1. **Fork the Repository**
```powershell
git clone https://github.com/YOUR-USERNAME/bathala.git
cd bathala/bathala
git remote add upstream https://github.com/devlocke-acsad/bathala.git
```

2. **Create Feature Branch**
```powershell
git checkout -b feature/your-feature-name
```

3. **Make Changes & Test**
```powershell
npm test
npm run dev
```

4. **Submit Pull Request**
```powershell
git push origin feature/your-feature-name
# Open PR on GitHub
```

#### Code Standards

**TypeScript Requirements**:
- Strict mode enabled
- No `any` types (use `unknown` if necessary)
- JSDoc comments for all public methods
- Interfaces for complex objects

**Example**:
```typescript
/**
 * Calculates damage dealt by an attack action
 * @param baseDamage - Base damage before modifiers
 * @param handBonus - Bonus from poker hand
 * @param statusEffects - Active status effects
 * @returns Final calculated damage
 */
export function calculateDamage(
    baseDamage: number,
    handBonus: number,
    statusEffects: StatusEffect[]
): number {
    // Implementation
}
```

**Testing Requirements**:
- Unit tests for all game logic
- Integration tests for scene transitions
- DDA tests for performance calculations
- Minimum 80% code coverage

#### Project Structure Deep Dive

```
src/
├── core/
│   ├── dda/
│   │   ├── RuleBasedDDA.ts          # Main DDA system
│   │   ├── PPSCalculator.ts         # Performance scoring
│   │   └── DDAAnalytics.ts          # Logging & validation
│   ├── managers/
│   │   ├── CombatManager.ts         # Combat flow control
│   │   ├── DeckManager.ts           # Deck operations
│   │   ├── RelicManager.ts          # Relic system
│   │   ├── PotionManager.ts         # Potion system
│   │   ├── LandasManager.ts         # Morality tracking
│   │   └── ProgressionManager.ts    # Meta-progression
│   └── types/
│       ├── Cards.ts                 # Card interfaces
│       ├── Combat.ts                # Combat types
│       ├── Items.ts                 # Relic/Potion types
│       └── Overworld.ts             # Map node types
├── data/
│   ├── cards/
│   │   └── cardDefinitions.ts       # All 52 base cards
│   ├── enemies/
│   │   ├── chapter1Enemies.ts
│   │   ├── chapter2Enemies.ts
│   │   └── chapter3Enemies.ts
│   ├── relics/
│   │   └── relicDefinitions.ts      # All relic data
│   ├── potions/
│   │   └── potionDefinitions.ts     # All potion data
│   └── lore/
│       └── chronicleEntries.ts      # Lore text
├── game/
│   └── scenes/
│       ├── BootScene.ts             # Asset loading
│       ├── MenuScene.ts             # Main menu
│       ├── OverworldScene.ts        # Map navigation
│       ├── CombatScene.ts           # Battle system
│       ├── RewardScene.ts           # Post-combat
│       ├── ShopScene.ts             # Merchant
│       ├── RestScene.ts             # Rest site
│       └── BossScene.ts             # Boss battles
└── utils/
    ├── analytics/
    │   └── SessionLogger.ts         # Thesis data collection
    ├── dda/
    │   └── RulesEngine.ts          # DDA rule processing
    └── helpers/
        ├── mathUtils.ts            # Common calculations
        ├── randomUtils.ts          # RNG utilities
        └── formatUtils.ts          # Display formatting
```

#### Adding New Content

**New Relic**:
1. Define in `src/data/relics/relicDefinitions.ts`
2. Implement effect in `src/core/managers/RelicManager.ts`
3. Add sprite assets to `public/assets/relics/`
4. Create unit test in `tests/unit/relics/`

**New Enemy**:
1. Define in appropriate `src/data/enemies/chapterXEnemies.ts`
2. Implement AI in enemy behavior system
3. Add sprite/animation assets
4. Balance test with DDA system

**New Status Effect**:
1. Add to `src/core/types/Combat.ts`
2. Implement logic in `CombatManager.ts`
3. Create visual indicator
4. Document in user manual (this file)

### For Researchers

#### DDA Data Collection

The game logs extensive analytics for thesis validation:

**Session Data**:
- Timestamp of each action
- PPS history with annotations
- Difficulty tier transitions
- Combat performance breakdowns
- Win/loss outcomes

**Access Data**:
```typescript
// In console during gameplay
import { DDAAnalytics } from './core/dda/DDAAnalytics';

const analytics = DDAAnalytics.getInstance();
const session = analytics.getCurrentSession();

console.log('PPS History:', session.ppsHistory);
console.log('Tier Changes:', session.tierTransitions);
console.log('Win Rate:', session.winRate);
```

**Export Data**:
- Data saved to localStorage
- Export via pause menu → "Export Session Data"
- JSON format for analysis in external tools

#### Experiment Setup

**A/B Testing DDA Variants**:
1. Create branch for variant system
2. Implement alternate rules in `RulesEngine.ts`
3. Use feature flag for random assignment
4. Collect parallel analytics streams
5. Compare session outcomes

**Suggested Experiments**:
- Conservative vs. Aggressive PPS adjustments
- Different tier thresholds
- Alternative performance input weights
- Narrative vs. Silent difficulty changes

---

## Troubleshooting

### Common Issues

#### Game Won't Load
**Symptoms**: Black screen, no assets appear

**Solutions**:
1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Check console**: F12 → Console tab for errors
3. **Verify JavaScript enabled**: Browser settings
4. **Update browser**: Use latest version
5. **Try different browser**: Chrome recommended

---

#### Performance Issues
**Symptoms**: Lag, stuttering, frame drops

**Solutions**:
1. **Close other tabs**: Free up system resources
2. **Disable extensions**: Some interfere with Phaser
3. **Lower graphics settings**: In game options menu
4. **Hardware acceleration**: Enable in browser settings
5. **Update graphics drivers**: System-level fix

---

#### Save Data Lost
**Symptoms**: Progress reset, unlocks gone

**Solutions**:
1. **Check localStorage**: May be cleared by browser cleaning
2. **Export data regularly**: Use manual export feature
3. **Backup saves**: Copy from localStorage to file
4. **Browser privacy mode**: Doesn't save data

---

#### Cards Not Responding
**Symptoms**: Cannot select or play cards

**Solutions**:
1. **Refresh page**: F5 to reload
2. **Check hand size**: May be full (8 max)
3. **Verify turn phase**: Must be player turn
4. **Clear selection**: Click outside to deselect
5. **Report bug**: If persistent, file issue

---

#### DDA Seems Unfair
**Symptoms**: Sudden difficulty spikes or drops

**Understanding**:
- DDA responds to **performance**, not time
- Multiple poor combats → Easier
- Multiple strong combats → Harder
- Transparent in pause menu

**Solutions**:
1. **Check PPS**: Pause → View difficulty tier
2. **Review analytics**: See what triggered change
3. **Adjust strategy**: Adapt to current tier
4. **Meta-progression**: Permanent upgrades help

---

### Bug Reporting

When reporting issues:

**Include**:
1. Browser type and version
2. Operating system
3. Steps to reproduce
4. Screenshots/video if possible
5. Console error messages (F12)
6. Session export data (if relevant)

**Where to Report**:
- GitHub Issues: https://github.com/devlocke-acsad/bathala/issues
- Include tag: [Bug], [DDA], [Combat], etc.

---

## Technical Reference

### Card Value Encoding

Each card has a unique identifier:

**Format**: `[Suit]-[Value]`

**Suits**:
- `APOY` = Fire (🔥)
- `TUBIG` = Water (💧)
- `LUPA` = Earth (🌍)
- `HANGIN` = Air (💨)

**Values**: 1-13
- 1-10: Number cards
- 11: Mandirigma (Warrior)
- 12: Babaylan (Shaman)
- 13: Datu (Chieftain)

**Example**: `APOY-13` = Datu of Fire

### Status Effect Mechanics

#### Duration Tracking
- Decrements at **end of turn** (yours or enemy's)
- 0 duration = Effect expires
- Some relics extend durations

#### Stacking Rules
- **Strength/Dexterity**: Additive (+1, +2, +3, etc.)
- **Burn**: Additive stacks, applies damage separately
- **Weak/Vulnerable**: Duration refreshes, doesn't stack
- **Stun**: Binary (on/off), immediate expiration after skip

### Combat Formulas

#### Damage Calculation
```
Final Damage = (Base + HandBonus + Strength - Weak) × ElementMultiplier × Vulnerable - EnemyBlock

Where:
- Base: Action base damage
- HandBonus: Poker hand bonus
- Strength: Sum of Strength stacks
- Weak: -25% if debuff active
- ElementMultiplier: 1.0 to 1.5 based on matchup
- Vulnerable: ×1.5 if enemy has debuff
- EnemyBlock: Subtracted last, minimum 0
```

#### Block Calculation
```
Final Block = (Base + HandBonus + Dexterity) × RelicMultipliers

Persistent Block = CurrentBlock × 0.5 (at turn end, if not all consumed)
Maximum Persistent = 50% of original block value
```

#### Heal Calculation
```
Final Heal = (Base + HandBonus + TubigCount × SirenaScale) × RelicMultipliers

Maximum HP = Cannot exceed max HP value
Overheal = Not permitted (caps at max)
```

### RNG & Seeding

**Card Draws**: Fisher-Yates shuffle algorithm
**Procedural Generation**: Seeded random for reproducibility
**Enemy AI**: Weighted random decisions
**Loot Tables**: Rarity-based random selection

**Seed Access** (for bug reproduction):
```javascript
// In console
game.getCurrentSeed()
// Returns string like: "BATHALA-1699900800-ABC123"
```

### Performance Optimization

**Asset Loading**:
- Lazy loading for chapter-specific content
- Sprite sheets for animations
- Audio sprites for SFX

**Rendering**:
- Object pooling for frequently created items
- Canvas rendering for static UI
- WebGL for dynamic game elements

**Memory Management**:
- Scene cleanup on transition
- Asset unloading for unused content
- Event listener removal

---

## Glossary

### Game-Specific Terms

**Anito**: Nature spirits from Filipino mythology; enemies in the game  
**Attune**: Upgrade a card to higher value of same suit  
**Babaylan**: Spiritual seer; the player character  
**Barangay**: Filipino village; Chapter 2 setting  
**Bathala**: Supreme deity in Tagalog mythology  
**Cycle**: One complete day-night period (100 actions)  
**Datu**: Chieftain; highest card value (13)  
**Diwa Shard**: Spiritual essence; boss reward  
**DDA**: Dynamic Difficulty Adjustment  
**Engkanto**: Environmental spirits; antagonist forces  
**Infuse**: Add a new card to deck (rare)  
**Kapwa**: Shared identity; thematic element  
**Landás**: Path/morality system  
**Mandirigma**: Warrior; card value 11  
**PPS**: Player Performance Score  
**Purify**: Remove a card from deck permanently  
**Sculpting**: The act of refining your deck

### Poker Terms

**Flush**: Five cards of same suit  
**Four of a Kind**: Four cards of same value  
**Full House**: Three of a kind + pair  
**High Card**: No matching cards; weakest hand  
**Pair**: Two cards of matching value  
**Straight**: Five sequential card values  
**Straight Flush**: Sequential cards of same suit  
**Three of a Kind**: Three cards of same value  
**Two Pair**: Two different pairs

### Roguelike Terms

**Elite**: Stronger enemy encounter with better rewards  
**Meta-progression**: Permanent upgrades across runs  
**Permadeath**: Death ends the run (no continues)  
**Procedural generation**: Randomly created content  
**Roguelike**: Genre with permadeath and randomization  
**Run**: Single playthrough from start to victory/defeat  
**Seed**: Number that determines procedural generation

---

## Credits & Acknowledgments

### Development Team
- **Lead Designer**: [devlocke-acsad]
- **Programmer**: [Team]
- **Artist**: [Team]
- **Sound Designer**: [Team]

### Special Thanks
- Phaser.js community
- Filipino mythology researchers and cultural consultants
- Playtesters and beta participants
- Thesis advisors and academic support

### Cultural Sources
- **Eugenio, Damiana L.** (2001). Philippine Folk Literature Series
- **Jocano, F. Landa** (1969). Philippine Mythology
- **Ramos, Maximo D.** (1990). Creatures of Philippine Lower Mythology
- **Samar, Criselda Y.** (2019). Filipino Cultural Heritage
- **The Aswang Project**: Filipino folklore database
- **Treasury of Tagalog**: Creation myths and oral traditions

### Technology
- **Engine**: Phaser 3.90.0
- **Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Testing**: Jest 29.7.0

---

## Appendix

### Quick Reference Tables

#### Status Effect Summary
| Effect | Type | Duration | Description |
|--------|------|----------|-------------|
| Strength | Buff | Permanent* | +Damage per stack |
| Dexterity | Buff | Permanent* | +Block/Dodge per stack |
| Burn | DoT | 3 turns | Damage over time |
| Block | Defense | Until damaged | Damage absorption |
| Weak | Debuff | 3 turns | -25% damage dealt |
| Vulnerable | Debuff | 3 turns | +50% damage taken |
| Stun | Control | 1 turn | Skip next turn |
| Seal | Control | 3 turns | Cannot use Special |
| Fear | Control | 3 turns | Random discards |

*Permanent = Lasts until end of combat

#### Node Type Distribution
| Node | Day % | Night % | Always Available |
|------|-------|---------|------------------|
| Combat | 45% | 55% | Yes |
| Elite | 10% | 15% | After 100 actions |
| Rest | 15% | 10% | Yes |
| Shop | 15% | 10% | Yes |
| Event | 10% | 5% | Yes |
| Boss | 5% | 5% | After cycle 5 only |

#### Recommended Deck Sizes by Strategy
| Strategy | Ideal Size | Purifications Needed | Difficulty |
|----------|------------|---------------------|------------|
| Face Card | 20-24 | 28-32 | Expert |
| Mono-Element | 24-30 | 22-28 | Hard |
| Dual-Element | 30-36 | 16-22 | Medium |
| Balanced | 40-46 | 6-12 | Easy |

---

## Changelog

### Version 5.8.14.25 (Current)
- Initial user manual release
- Comprehensive coverage of all systems
- DDA documentation complete
- Chapter 1-3 content documented

### Future Updates
- Version 6.0: Chapter 4 content
- Additional relics and potions
- Balance adjustments based on analytics
- Community-requested features

---

## Contact & Support

### For Players
- **Discord**: [Community Server Link]
- **Twitter**: [@BathalaGame]
- **Email**: support@bathalagame.com

### For Developers
- **GitHub**: https://github.com/devlocke-acsad/bathala
- **Documentation**: See `/docs` folder
- **API Reference**: Auto-generated from JSDoc

### For Researchers
- **Thesis Inquiries**: research@bathalagame.com
- **Data Access**: Request via GitHub Issues
- **Citation**: [Academic citation format]

---

**End of User Manual**

*"May the anitos guide your path, babaylan. Restore what was lost, and let the realm remember harmony once more."*

---

*Last updated: November 13, 2025*  
*Document Version: 5.8.14.25*  
*Game Version: 1.4.0*

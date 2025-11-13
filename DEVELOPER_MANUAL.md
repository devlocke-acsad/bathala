# Bathala - Technical Manual for Developers & IT Experts

**Version 5.8.14.25**  
**Last Updated: November 13, 2025**

---

## Table of Contents

1. [Technical Overview](#technical-overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Project Structure](#project-structure)
5. [Core Systems](#core-systems)
6. [Dynamic Difficulty Adjustment](#dynamic-difficulty-adjustment)
7. [Development Workflow](#development-workflow)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Build & Deployment](#build--deployment)
10. [API Reference](#api-reference)
11. [Performance Optimization](#performance-optimization)
12. [Data Management](#data-management)
13. [Contributing Guidelines](#contributing-guidelines)
14. [Research & Analytics](#research--analytics)
15. [Troubleshooting](#troubleshooting)

---

## Technical Overview

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Game Engine** | Phaser | 3.90.0 |
| **Language** | TypeScript | 5.7.2 |
| **Build Tool** | Vite | 6.3.1 |
| **Testing** | Jest | 29.7.0 |
| **Type Checking** | ts-jest | 29.2.5 |
| **Minification** | Terser | 5.39.0 |

### System Requirements

#### Development Environment
- **Node.js**: v18.0.0+ (LTS recommended)
- **npm**: v9.0.0+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for node_modules
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

#### Target Runtime
- **Browser**: Chromium 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL**: 2.0 support required
- **LocalStorage**: 10MB minimum
- **Canvas API**: Full support required

### Game Constants

```typescript
/**
 * Core game balance constants
 */
export const GAME_CONSTANTS = {
    // Player starting values
    PLAYER_MAX_HP: 120,
    PLAYER_STARTING_HP: 120,
    PLAYER_STARTING_GOLD: 0,
    
    // Combat constants
    MAX_HAND_SIZE: 8,              // Cards drawn per turn
    CARDS_TO_PLAY: 5,              // Cards used in poker hand
    STARTING_DISCARD_CHARGES: 3,  // Discard charges per combat
    MAX_DISCARD_PER_USE: 5,        // Cards you can discard at once
    
    // Deck constants
    STARTING_DECK_SIZE: 52,        // Full poker deck
    SUITS: 4,                       // Apoy, Tubig, Lupa, Hangin
    CARDS_PER_SUIT: 13,            // 1-13
    
    // Status effect durations
    DEFAULT_STATUS_DURATION: 3,    // Turns for Weak, Vulnerable, etc.
    BURN_DURATION: 3,              // Turns
    
    // Block mechanics
    BLOCK_PERSISTENCE: 0.5,        // 50% carries to next turn
    
    // Action modifiers
    DEFEND_MODIFIER: 0.8,          // Defend is 80% as efficient
    SPECIAL_MODIFIER: 0.6,         // Special is 60% for balance
    WEAK_PENALTY: 0.5,             // Weak reduces attack by 50%
    VULNERABLE_BONUS: 1.5,         // Vulnerable increases damage by 50%
    
    // Status bonuses
    STRENGTH_PER_STACK: 3,         // Base value bonus
    DEXTERITY_PER_STACK: 3,        // Base value bonus
}

### Architecture Philosophy

**Bathala** follows these architectural principles:

1. **Separation of Concerns**: Game logic, presentation, and data are decoupled
2. **Testability**: Pure functions for all game mechanics
3. **Type Safety**: Strict TypeScript with no `any` types
4. **Modularity**: Manager pattern for major subsystems
5. **Transparency**: DDA system is rule-based and auditable (thesis requirement)
6. **Performance**: 60 FPS target on mid-range hardware

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Phaser Game Engine                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   Scenes     │  │  Managers    │             │
│  │              │  │              │             │
│  │ - Boot       │  │ - Combat     │             │
│  │ - Menu       │  │ - Deck       │             │
│  │ - Overworld  │  │ - Relic      │             │
│  │ - Combat     │  │ - Potion     │             │
│  │ - Shop       │  │ - Landas     │             │
│  │ - Rest       │  │ - DDA        │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   Data       │  │  Utils       │             │
│  │              │  │              │             │
│  │ - Cards      │  │ - Analytics  │             │
│  │ - Enemies    │  │ - Helpers    │             │
│  │ - Relics     │  │ - DDA Rules  │             │
│  │ - Potions    │  │ - Math       │             │
│  └──────────────┘  └──────────────┘             │
│                                                 │
├─────────────────────────────────────────────────┤
│          Browser APIs (Canvas, WebGL)           │
└─────────────────────────────────────────────────┘
```

### Manager Pattern

Each major subsystem is encapsulated in a Manager class:

```typescript
interface IManager {
    initialize(): void;
    update(delta: number): void;
    reset(): void;
    destroy(): void;
}
```

**Managers**:
- `CombatManager`: Combat flow, turn logic, damage calculation
- `DeckManager`: Card operations, shuffling, drawing
- `RelicManager`: Relic effects, activation hooks
- `PotionManager`: Potion inventory, usage
- `LandasManager`: Morality tracking, alignment state
- `ProgressionManager`: Meta-progression, Spirit Fragments
- `RuleBasedDDA`: Performance scoring, difficulty adjustment
- `DDAAnalyticsManager`: Session logging, research data

### Scene Flow

```
Boot Scene (Asset Loading)
    ↓
Menu Scene
    ↓
Overworld Scene ←──┐
    ↓               │
Combat Scene ───────┤
    ↓               │
Reward Scene ───────┤
    ↓               │
Shop Scene ─────────┤
    ↓               │
Rest Scene ─────────┤
    ↓               │
Event Scene ────────┤
    ↓               │
Boss Scene ─────────┘
```

---

## Installation & Setup

### Initial Setup

```powershell
# Clone repository
git clone https://github.com/devlocke-acsad/bathala.git
cd bathala/bathala

# Install dependencies
npm install

# Verify installation
npm run test

# Start development server
npm run dev
```

### Environment Configuration

Create `.env` file in project root:

```bash
# Development
VITE_ENV=development
VITE_DEBUG_MODE=true
VITE_DDA_LOGGING=true

# Production
# VITE_ENV=production
# VITE_DEBUG_MODE=false
# VITE_DDA_LOGGING=false
```

### Development Commands

```powershell
# Development server (with logging)
npm run dev

# Development server (clean)
npm run dev-nolog

# Production build (with logging)
npm run build

# Production build (clean)
npm run build-nolog

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run DDA-specific tests
npm run test:dda

# Type checking
npx tsc --noEmit
```

### IDE Setup (VS Code Recommended)

**Required Extensions**:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

**Recommended Extensions**:
- GitLens
- Phaser 3 Snippets
- Jest Runner

**Settings** (`.vscode/settings.json`):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true
  }
}
```

---

## Project Structure

### Directory Layout

```
bathala/
├── src/
│   ├── core/                    # Core game systems
│   │   ├── dda/                # DDA system
│   │   │   ├── RuleBasedDDA.ts
│   │   │   ├── PPSCalculator.ts
│   │   │   └── DDAAnalytics.ts
│   │   ├── managers/           # Game subsystem managers
│   │   │   ├── CombatManager.ts
│   │   │   ├── DeckManager.ts
│   │   │   ├── RelicManager.ts
│   │   │   ├── PotionManager.ts
│   │   │   ├── LandasManager.ts
│   │   │   └── ProgressionManager.ts
│   │   └── types/              # TypeScript interfaces
│   │       ├── Cards.ts
│   │       ├── Combat.ts
│   │       ├── Items.ts
│   │       ├── DDA.ts
│   │       └── Overworld.ts
│   │
│   ├── data/                    # Game content data
│   │   ├── cards/
│   │   │   └── cardDefinitions.ts
│   │   ├── enemies/
│   │   │   ├── chapter1Enemies.ts
│   │   │   ├── chapter2Enemies.ts
│   │   │   └── chapter3Enemies.ts
│   │   ├── relics/
│   │   │   └── relicDefinitions.ts
│   │   ├── potions/
│   │   │   └── potionDefinitions.ts
│   │   └── lore/
│   │       └── chronicleEntries.ts
│   │
│   ├── game/                    # Phaser-specific code
│   │   ├── main.ts             # Game initialization
│   │   ├── scenes/             # Phaser scenes
│   │   │   ├── BootScene.ts
│   │   │   ├── MenuScene.ts
│   │   │   ├── OverworldScene.ts
│   │   │   ├── CombatScene.ts
│   │   │   ├── RewardScene.ts
│   │   │   ├── ShopScene.ts
│   │   │   ├── RestScene.ts
│   │   │   ├── EventScene.ts
│   │   │   └── BossScene.ts
│   │   ├── ui/                 # UI components
│   │   │   ├── CardDisplay.ts
│   │   │   ├── HealthBar.ts
│   │   │   ├── RelicBar.ts
│   │   │   └── PotionSlots.ts
│   │   └── managers/           # Scene-specific managers
│   │
│   ├── utils/                   # Utility functions
│   │   ├── analytics/
│   │   │   └── SessionLogger.ts
│   │   ├── dda/
│   │   │   └── RulesEngine.ts
│   │   └── helpers/
│   │       ├── mathUtils.ts
│   │       ├── randomUtils.ts
│   │       └── formatUtils.ts
│   │
│   └── tests/                   # Test suites
│       ├── unit/
│       │   ├── combat/
│       │   ├── deck/
│       │   ├── dda/
│       │   └── relics/
│       └── integration/
│           ├── overworld-combat/
│           └── dda-combat/
│
├── public/                      # Static assets
│   └── assets/
│       ├── sprites/
│       ├── audio/
│       └── fonts/
│
├── docs/                        # Documentation
│   ├── Bathala Game Design Document V5.8.14.25.md
│   ├── DDA_IMPLEMENTATION_ANALYSIS.md
│   └── [other docs...]
│
├── vite/                        # Vite configuration
│   ├── config.dev.mjs
│   └── config.prod.mjs
│
├── .github/
│   └── copilot-instructions.md # AI development guidelines
│
├── index.html                   # Entry point
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

### File Naming Conventions

- **PascalCase**: Classes, interfaces, types (`CombatManager.ts`, `CardType.ts`)
- **camelCase**: Functions, variables, methods (`calculateDamage`, `cardValue`)
- **kebab-case**: File names for non-class files (`card-definitions.ts`)
- **SCREAMING_SNAKE_CASE**: Constants (`MAX_HAND_SIZE`, `DEFAULT_HP`)

---

## Core Systems

### Combat System

#### Damage Calculation

```typescript
/**
 * Card rank values for base damage calculation
 * Similar to Balatro's chip values
 */
private static readonly CARD_VALUES: Record<Rank, number> = {
    "1": 6,        // Ace = 6 (reduced from 11)
    "2": 2,
    "3": 2,
    "4": 3,
    "5": 3,
    "6": 4,
    "7": 4,
    "8": 5,
    "9": 5,
    "10": 6,
    "Mandirigma": 6,  // Jack equivalent
    "Babaylan": 7,    // Queen equivalent
    "Datu": 7,        // King equivalent
};

/**
 * Calculates complete damage for an action
 * Balatro-inspired calculation system
 * @param cards - Cards being played
 * @param handType - Evaluated poker hand type
 * @param actionType - Type of action (attack/defend/special)
 * @param player - Player entity (for status effects and relics)
 * @returns Final damage after all modifiers
 */
export function calculateDamage(
    cards: PlayingCard[],
    handType: HandType,
    actionType: "attack" | "defend" | "special",
    player?: Player
): DamageCalculation {
    // 1. Calculate base value from cards
    const baseValue = cards.reduce((sum, card) => 
        sum + CARD_VALUES[card.rank], 0
    );
    
    // 2. Get hand bonus and multiplier
    const handData = HAND_BONUSES[handType];
    const handBonus = handData.bonus;
    const handMultiplier = handData.multiplier;
    
    // 3. Calculate elemental bonus (only for Special actions)
    let elementalBonus = 0;
    if (actionType === "special") {
        const suitCounts = countSuits(cards);
        const maxCount = Math.max(...Object.values(suitCounts));
        elementalBonus = ELEMENTAL_BONUSES[maxCount] || 0;
    }
    
    // 4. Calculate status effect bonuses
    let statusBonus = 0;
    let hasWeakDebuff = false;
    
    if (player) {
        if (actionType === "attack") {
            const strength = player.statusEffects.find(e => e.name === "Strength");
            if (strength) {
                statusBonus += strength.value * 3; // Each stack adds 3
            }
            
            const weak = player.statusEffects.find(e => e.name === "Weak");
            if (weak) {
                hasWeakDebuff = true;
            }
        } else if (actionType === "defend") {
            const dexterity = player.statusEffects.find(e => e.name === "Dexterity");
            if (dexterity) {
                statusBonus += dexterity.value * 3; // Each stack adds 3
            }
        }
    }
    
    // 5. Calculate subtotal (before multiplier)
    let subtotal = baseValue + handBonus + elementalBonus + statusBonus;
    
    // 6. Apply multiplier
    let finalValue = Math.floor(subtotal * handMultiplier);
    
    // 7. Apply action type modifiers
    if (actionType === "defend") {
        finalValue = Math.floor(finalValue * 0.8); // Defense modifier
    } else if (actionType === "special") {
        finalValue = Math.floor(finalValue * 0.6); // Special modifier
    }
    
    // 8. Apply Weak debuff (reduces Attack damage by 50%)
    if (hasWeakDebuff && actionType === "attack") {
        finalValue = Math.floor(finalValue * 0.5);
    }
    
    return finalValue;
}
```

#### Block Calculation

```typescript
/**
 * Calculates block gained from defend action
 * Uses same calculation as damage but with 0.8 modifier
 * @param cards - Cards being played
 * @param handType - Evaluated poker hand type
 * @param player - Player entity (for Dexterity)
 * @returns Final block value
 */
export function calculateBlock(
    cards: PlayingCard[],
    handType: HandType,
    player?: Player
): number {
    // Same calculation as attack
    const baseValue = cards.reduce((sum, card) => 
        sum + CARD_VALUES[card.rank], 0
    );
    
    const handData = HAND_BONUSES[handType];
    const handBonus = handData.bonus;
    const handMultiplier = handData.multiplier;
    
    // Apply Dexterity stacks (for Defend actions)
    let statusBonus = 0;
    if (player) {
        const dexterity = player.statusEffects.find(e => e.name === "Dexterity");
        if (dexterity) {
            statusBonus += dexterity.value * 3;
        }
    }
    
    const subtotal = baseValue + handBonus + statusBonus;
    
    // Apply multiplier, then defense modifier
    let finalBlock = Math.floor(subtotal * handMultiplier * 0.8);
    
    return finalBlock;
}

/**
 * Applies persistent block decay at turn end
 * @param currentBlock - Current block value
 * @returns Decayed block value (50% of original)
 */
export function applyBlockPersistence(currentBlock: number): number {
    return Math.floor(currentBlock * 0.5);
}
```

### Poker Hand Evaluation

```typescript
/**
 * Poker hand types with bonus values and multipliers
 * Balatro-inspired calculation system
 */
export type HandType =
  | "high_card"
  | "pair"
  | "two_pair"
  | "three_of_a_kind"
  | "straight"
  | "flush"
  | "full_house"
  | "four_of_a_kind"
  | "straight_flush"
  | "royal_flush"
  | "five_of_a_kind";

/**
 * Hand bonuses and multipliers
 */
const HAND_BONUSES: Record<HandType, { bonus: number; multiplier: number }> = {
    high_card: { bonus: 0, multiplier: 1 },
    pair: { bonus: 3, multiplier: 1.2 },
    two_pair: { bonus: 6, multiplier: 1.3 },
    three_of_a_kind: { bonus: 10, multiplier: 1.5 },
    straight: { bonus: 12, multiplier: 1.6 },
    flush: { bonus: 15, multiplier: 1.7 },
    full_house: { bonus: 20, multiplier: 2.0 },
    four_of_a_kind: { bonus: 25, multiplier: 2.2 },
    straight_flush: { bonus: 35, multiplier: 2.5 },
    royal_flush: { bonus: 40, multiplier: 2.8 },
    five_of_a_kind: { bonus: 38, multiplier: 2.6 }
}

/**
 * Evaluates a 5-card hand and returns hand type + bonus
 * @param cards - Array of 5 cards
 * @returns Hand evaluation result
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
    if (cards.length !== 5) {
        throw new Error('Hand must contain exactly 5 cards');
    }
    
    const values = cards.map(c => c.value).sort((a, b) => a - b);
    const suits = cards.map(c => c.suit);
    
    // Check for flush
    const isFlush = suits.every(s => s === suits[0]);
    
    // Check for straight
    const isStraight = checkStraight(values);
    
    // Count value frequencies
    const valueCounts = countValues(values);
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    
    // Evaluate hand type
    if (isFlush && isStraight) {
        return { type: HandType.STRAIGHT_FLUSH, bonus: 35 };
    }
    
    if (counts[0] === 5) {
        return { type: HandType.FIVE_OF_A_KIND, bonus: 30 };
    }
    
    if (counts[0] === 4) {
        return { type: HandType.FOUR_OF_A_KIND, bonus: 22 };
    }
    
    if (counts[0] === 3 && counts[1] === 2) {
        return { type: HandType.FULL_HOUSE, bonus: 18 };
    }
    
    if (isFlush) {
        return { type: HandType.FLUSH, bonus: 14 };
    }
    
    if (isStraight) {
        return { type: HandType.STRAIGHT, bonus: 10 };
    }
    
    if (counts[0] === 3) {
        return { type: HandType.THREE_OF_A_KIND, bonus: 7 };
    }
    
    if (counts[0] === 2 && counts[1] === 2) {
        return { type: HandType.TWO_PAIR, bonus: 4 };
    }
    
    if (counts[0] === 2) {
        return { type: HandType.PAIR, bonus: 2 };
    }
    
    return { type: HandType.HIGH_CARD, bonus: 0 };
}
```

### Deck Management

```typescript
/**
 * Deck Manager handles all card operations
 */
export class DeckManager implements IManager {
    private deck: Card[] = [];
    private discardPile: Card[] = [];
    private hand: Card[] = [];
    
    /**
     * Initialize with standard 52-card deck
     */
    initialize(): void {
        this.deck = this.createStandardDeck();
        this.shuffle();
    }
    
    /**
     * Creates standard 52-card deck
     * 4 suits × 13 values
     */
    private createStandardDeck(): Card[] {
        const suits: Suit[] = ['APOY', 'TUBIG', 'LUPA', 'HANGIN'];
        const deck: Card[] = [];
        
        for (const suit of suits) {
            for (let value = 1; value <= 13; value++) {
                deck.push({
                    id: `${suit}-${value}`,
                    suit,
                    value,
                    name: this.getCardName(value),
                    element: this.getElement(suit)
                });
            }
        }
        
        return deck;
    }
    
    /**
     * Fisher-Yates shuffle algorithm
     */
    shuffle(): void {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    /**
     * Draw cards from deck
     * @param count - Number of cards to draw
     * @returns Array of drawn cards
     */
    draw(count: number): Card[] {
        const drawn: Card[] = [];
        
        for (let i = 0; i < count; i++) {
            if (this.deck.length === 0) {
                this.reshuffleDiscard();
            }
            
            if (this.deck.length > 0) {
                drawn.push(this.deck.pop()!);
            }
        }
        
        return drawn;
    }
    
    /**
     * Purify (remove) a card permanently
     * @param cardId - ID of card to remove
     */
    purifyCard(cardId: string): void {
        const index = this.deck.findIndex(c => c.id === cardId);
        if (index !== -1) {
            this.deck.splice(index, 1);
        }
    }
    
    /**
     * Attune (upgrade) a card to higher value
     * @param cardId - ID of card to upgrade
     * @param newValue - New value (must be same suit)
     */
    attuneCard(cardId: string, newValue: number): void {
        const card = this.deck.find(c => c.id === cardId);
        if (card && newValue > card.value && newValue <= 13) {
            card.value = newValue;
            card.id = `${card.suit}-${newValue}`;
            card.name = this.getCardName(newValue);
        }
    }
    
    /**
     * Infuse (add) a new card
     * @param card - Card to add
     */
    infuseCard(card: Card): void {
        this.deck.push(card);
    }
}
```

### Relic System

```typescript
/**
 * Relic effects are implemented as hooks
 */
export interface Relic {
    id: string;
    name: string;
    description: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
    hooks: RelicHooks;
}

export interface RelicHooks {
    onCombatStart?: (combat: CombatState) => void;
    onTurnStart?: (combat: CombatState) => void;
    onCardPlayed?: (card: Card, combat: CombatState) => void;
    onDamageDealt?: (damage: number, combat: CombatState) => number;
    onBlockGained?: (block: number, combat: CombatState) => number;
    onHandEvaluated?: (handType: HandType, combat: CombatState) => HandType;
    // ... more hooks
}

/**
 * Example relic implementation
 */
export const BABAYLAN_TALISMAN: Relic = {
    id: 'babaylans_talisman',
    name: "Babaylan's Talisman",
    description: "Your poker hand is treated as one tier higher",
    emoji: '📿',
    hooks: {
        onHandEvaluated: (handType: HandType, combat: CombatState): HandType => {
            // Upgrade hand by one tier
            const handRankings: Record<HandType, number> = {
                "high_card": 1,
                "pair": 2,
                "two_pair": 3,
                "three_of_a_kind": 4,
                "straight": 5,
                "flush": 6,
                "full_house": 7,
                "four_of_a_kind": 8,
                "straight_flush": 9,
                "royal_flush": 10,
                "five_of_a_kind": 11
            };
            
            const reverseRankings: Record<number, HandType> = {
                1: "high_card",
                2: "pair",
                3: "two_pair",
                4: "three_of_a_kind",
                5: "straight",
                6: "flush",
                7: "full_house",
                8: "four_of_a_kind",
                9: "straight_flush",
                10: "royal_flush",
                11: "five_of_a_kind"
            };
            
            const currentRank = handRankings[handType];
            const nextRank = Math.min(currentRank + 1, 11);
            return reverseRankings[nextRank] || handType;
        }
    }
};

/**
 * Example: Earthwarden's Plate
 */
export const EARTHWARDENS_PLATE: Relic = {
    id: 'earthwardens_plate',
    name: "Earthwarden's Plate",
    description: "Start each combat with 5 Block and gain +1 Block at the start of each turn",
    emoji: '🛡️',
    hooks: {
        onCombatStart: (combat: CombatState) => {
            combat.player.block += 5;
        },
        onTurnStart: (combat: CombatState) => {
            combat.player.block += 1;
        }
    }
};
```

---

## Dynamic Difficulty Adjustment

### DDA Architecture

The DDA system is **rule-based and transparent** for thesis validation.

```typescript
/**
 * Core DDA interface
 */
export interface IDDASystem {
    calculatePPS(combatResult: CombatResult): number;
    getCurrentTier(): DifficultyTier;
    getScalingMultipliers(): DifficultyScaling;
    logSession(): SessionData;
}

/**
 * Difficulty tiers
 */
export enum DifficultyTier {
    STRUGGLING = 0,      // PPS < 1.5
    LEARNING_LOW = 1,    // PPS 1.5-2.2
    LEARNING_HIGH = 2,   // PPS 2.3-2.9
    THRIVING_LOW = 3,    // PPS 3.0-3.7
    THRIVING_HIGH = 4,   // PPS 3.8-4.4
    MASTERING = 5        // PPS >= 4.5
}
```

### PPS Calculation Algorithm

```typescript
/**
 * Player Performance Score calculation
 */
export class PPSCalculator {
    private readonly CALIBRATION_COMBATS = 3;
    private combatCount = 0;
    
    /**
     * Calculate PPS from combat result
     * @param result - Combat outcome data
     * @param currentPPS - Current PPS value
     * @param currentTier - Current difficulty tier
     * @returns Updated PPS
     */
    calculatePPS(
        result: CombatResult,
        currentPPS: number,
        currentTier: DifficultyTier
    ): number {
        this.combatCount++;
        
        // During calibration, always use LEARNING tier multipliers
        const effectiveTier = this.combatCount <= this.CALIBRATION_COMBATS
            ? DifficultyTier.LEARNING_LOW
            : currentTier;
        
        let adjustment = 0;
        
        // 1. Health Retention
        adjustment += this.calculateHealthScore(result);
        
        // 2. Combat Efficiency
        adjustment += this.calculateEfficiencyScore(result);
        
        // 3. Damage Efficiency
        adjustment += this.calculateDamageScore(result);
        
        // 4. Hand Quality
        adjustment += this.calculateHandQualityScore(result);
        
        // 5. Resource Management
        adjustment += this.calculateResourceScore(result);
        
        // 6. Clutch Performance
        adjustment += this.calculateClutchScore(result);
        
        // 7. Comeback Momentum
        adjustment += this.calculateComebackScore(result, currentPPS);
        
        // Apply tier multipliers
        const multipliers = this.getTierMultipliers(effectiveTier);
        adjustment = adjustment >= 0
            ? adjustment * multipliers.bonusMultiplier
            : adjustment * multipliers.penaltyMultiplier;
        
        // Update PPS (clamped to 0.5-5.0)
        const newPPS = Math.max(0.5, Math.min(5.0, currentPPS + adjustment));
        
        return newPPS;
    }
    
    /**
     * Health retention scoring
     */
    private calculateHealthScore(result: CombatResult): number {
        const hpPercent = result.endHP / result.maxHP;
        
        let score = 0;
        
        if (hpPercent >= 0.9) score = 0.35;
        else if (hpPercent >= 0.7) score = 0.15;
        else if (hpPercent >= 0.5) score = 0;
        else if (hpPercent >= 0.3) score = -0.2;
        else score = -0.4;
        
        // Perfect combat bonus
        if (result.damageTaken === 0) {
            score += 0.25;
        }
        
        return score;
    }
    
    /**
     * Combat efficiency scoring (turn count)
     */
    private calculateEfficiencyScore(result: CombatResult): number {
        const expected = this.getExpectedTurns(result.enemyTier);
        const actual = result.turnCount;
        
        if (actual <= expected * 0.8) return 0.2;  // Very efficient
        if (actual > expected * 1.2) return -0.2;  // Inefficient
        return 0;
    }
    
    /**
     * Get expected turn count by enemy tier
     */
    private getExpectedTurns(tier: EnemyTier): number {
        const expectations = {
            [EnemyTier.COMMON]: 4,
            [EnemyTier.ELITE]: 8,
            [EnemyTier.BOSS]: 15
        };
        return expectations[tier] || 4;
    }
    
    /**
     * Damage efficiency scoring (DPT)
     */
    private calculateDamageScore(result: CombatResult): number {
        const dpt = result.totalDamageDealt / result.turnCount;
        const expected = this.getExpectedDPT(result.enemyTier);
        
        if (dpt >= expected * 1.3) return 0.2;   // High DPT
        if (dpt <= expected * 0.7) return -0.15; // Low DPT
        return 0;
    }
    
    /**
     * Hand quality scoring
     */
    private calculateHandQualityScore(result: CombatResult): number {
        let score = 0;
        
        // Bonus for high-quality hands
        if (result.bestHandType >= HandType.STRAIGHT) {
            score += 0.1;
        }
        
        if (result.bestHandType >= HandType.FOUR_OF_A_KIND) {
            score += 0.15; // Additional bonus
        }
        
        return score;
    }
    
    /**
     * Resource management scoring
     */
    private calculateResourceScore(result: CombatResult): number {
        const usagePercent = result.discardsUsed / result.discardsAvailable;
        
        // Efficient if using ≤30% of available discards
        if (usagePercent <= 0.3) {
            return 0.15;
        }
        
        return 0;
    }
    
    /**
     * Clutch performance scoring
     */
    private calculateClutchScore(result: CombatResult): number {
        // Started combat below 50% HP and won with good performance
        if (result.startHP / result.maxHP < 0.5) {
            const hpRetention = result.endHP / result.maxHP;
            if (hpRetention >= 0.3) {
                return 0.2; // Clutch victory
            }
        }
        
        return 0;
    }
    
    /**
     * Comeback momentum scoring
     */
    private calculateComebackScore(result: CombatResult, currentPPS: number): number {
        // Help struggling players recover
        if (currentPPS < 1.5 && result.victory) {
            let bonus = 0.3; // Base comeback bonus
            
            // Additional bonus for consecutive wins
            if (result.consecutiveWins > 0) {
                bonus += Math.min(0.45, result.consecutiveWins * 0.15);
            }
            
            return bonus;
        }
        
        return 0;
    }
    
    /**
     * Get tier multipliers
     */
    private getTierMultipliers(tier: DifficultyTier): TierMultipliers {
        const multipliers: Record<DifficultyTier, TierMultipliers> = {
            [DifficultyTier.STRUGGLING]: { bonusMultiplier: 1.5, penaltyMultiplier: 0.5 },
            [DifficultyTier.LEARNING_LOW]: { bonusMultiplier: 1.0, penaltyMultiplier: 1.0 },
            [DifficultyTier.LEARNING_HIGH]: { bonusMultiplier: 1.0, penaltyMultiplier: 1.0 },
            [DifficultyTier.THRIVING_LOW]: { bonusMultiplier: 0.8, penaltyMultiplier: 1.2 },
            [DifficultyTier.THRIVING_HIGH]: { bonusMultiplier: 0.8, penaltyMultiplier: 1.2 },
            [DifficultyTier.MASTERING]: { bonusMultiplier: 0.5, penaltyMultiplier: 1.5 }
        };
        
        return multipliers[tier];
    }
}
```

### Difficulty Scaling

```typescript
/**
 * Apply difficulty scaling to enemies
 */
export function scaleDifficulty(
    baseStats: EnemyStats,
    tier: DifficultyTier
): EnemyStats {
    const scalars = getScalingFactors(tier);
    
    return {
        hp: Math.floor(baseStats.hp * scalars.hpMultiplier),
        damage: Math.floor(baseStats.damage * scalars.damageMultiplier),
        // Other stats remain unchanged
        ...baseStats
    };
}

/**
 * Get scaling factors by tier
 */
function getScalingFactors(tier: DifficultyTier): ScalingFactors {
    const factors: Record<DifficultyTier, ScalingFactors> = {
        [DifficultyTier.STRUGGLING]: {
            hpMultiplier: 0.8,
            damageMultiplier: 0.8
        },
        [DifficultyTier.LEARNING_LOW]: {
            hpMultiplier: 1.0,
            damageMultiplier: 1.0
        },
        [DifficultyTier.LEARNING_HIGH]: {
            hpMultiplier: 1.0,
            damageMultiplier: 1.0
        },
        [DifficultyTier.THRIVING_LOW]: {
            hpMultiplier: 1.15,
            damageMultiplier: 1.15
        },
        [DifficultyTier.THRIVING_HIGH]: {
            hpMultiplier: 1.15,
            damageMultiplier: 1.15
        },
        [DifficultyTier.MASTERING]: {
            hpMultiplier: 1.25,
            damageMultiplier: 1.25
        }
    };
    
    return factors[tier];
}
```

### DDA Analytics

```typescript
/**
 * Session analytics for research
 */
export class DDAAnalyticsManager {
    private static instance: DDAAnalyticsManager;
    private sessionData: SessionData;
    
    /**
     * Log combat result
     */
    logCombat(result: CombatResult, pps: number, tier: DifficultyTier): void {
        this.sessionData.combats.push({
            timestamp: Date.now(),
            result,
            ppsAfter: pps,
            tierAfter: tier
        });
    }
    
    /**
     * Export session data for thesis analysis
     */
    exportSession(): string {
        return JSON.stringify(this.sessionData, null, 2);
    }
    
    /**
     * Get session statistics
     */
    getStatistics(): SessionStats {
        return {
            totalCombats: this.sessionData.combats.length,
            wins: this.sessionData.combats.filter(c => c.result.victory).length,
            averagePPS: this.calculateAveragePPS(),
            tierDistribution: this.calculateTierDistribution(),
            ppsHistory: this.sessionData.combats.map(c => c.ppsAfter)
        };
    }
}
```

---

## Development Workflow

### Git Workflow

```bash
# Feature branch workflow
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Make changes, commit regularly
git add .
git commit -m "feat: Add new relic system"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

Follow Conventional Commits:

```
feat: Add new enemy type
fix: Correct damage calculation bug
docs: Update API documentation
test: Add DDA unit tests
refactor: Simplify deck manager
perf: Optimize card rendering
chore: Update dependencies
```

### Code Review Checklist

- [ ] TypeScript strict mode compliant
- [ ] No `any` types
- [ ] JSDoc comments on public methods
- [ ] Unit tests for new logic
- [ ] No console.log (use proper logging)
- [ ] Performance impact assessed
- [ ] Accessibility considered

---

## Testing & Quality Assurance

### Testing Strategy

**Unit Tests**: Pure functions, business logic  
**Integration Tests**: Manager interactions, scene transitions  
**Manual Tests**: UI/UX, gameplay feel

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/tests/**'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

### Example Test Suite

```typescript
// RuleBasedDDA.test.ts
import { PPSCalculator, DifficultyTier } from '../core/dda/PPSCalculator';

describe('PPSCalculator', () => {
    let calculator: PPSCalculator;
    
    beforeEach(() => {
        calculator = new PPSCalculator();
    });
    
    describe('Health Retention Scoring', () => {
        it('should award bonus for high HP retention', () => {
            const result: CombatResult = {
                victory: true,
                startHP: 100,
                endHP: 95,
                maxHP: 100,
                damageTaken: 5,
                turnCount: 3,
                totalDamageDealt: 50,
                enemyTier: EnemyTier.COMMON,
                bestHandType: HandType.PAIR,
                discardsUsed: 0,
                discardsAvailable: 1,
                consecutiveWins: 1
            };
            
            const newPPS = calculator.calculatePPS(result, 2.5, DifficultyTier.LEARNING_LOW);
            
            expect(newPPS).toBeGreaterThan(2.5);
        });
        
        it('should penalize low HP retention', () => {
            const result: CombatResult = {
                victory: true,
                startHP: 100,
                endHP: 25,
                maxHP: 100,
                damageTaken: 75,
                turnCount: 3,
                totalDamageDealt: 50,
                enemyTier: EnemyTier.COMMON,
                bestHandType: HandType.HIGH_CARD,
                discardsUsed: 1,
                discardsAvailable: 1,
                consecutiveWins: 0
            };
            
            const newPPS = calculator.calculatePPS(result, 2.5, DifficultyTier.LEARNING_LOW);
            
            expect(newPPS).toBeLessThan(2.5);
        });
    });
    
    describe('Calibration Phase', () => {
        it('should use LEARNING tier during first 3 combats', () => {
            const result: CombatResult = createMockResult();
            
            // Combat 1
            calculator.calculatePPS(result, 2.5, DifficultyTier.MASTERING);
            
            // Should not apply MASTERING penalties yet
            // (Implementation-specific assertion)
        });
    });
});
```

---

## Build & Deployment

### Production Build

```powershell
# Build for production
npm run build

# Output in dist/ directory
```

### Build Configuration

```javascript
// vite/config.prod.mjs
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: resolve(__dirname, '../dist'),
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    base: './'
});
```

### Deployment Checklist

- [ ] Run production build
- [ ] Test build locally
- [ ] Verify asset loading
- [ ] Check console for errors
- [ ] Test on target browsers
- [ ] Verify localStorage functionality
- [ ] Performance profiling
- [ ] Deploy to hosting

---

## API Reference

### Core Interfaces

```typescript
/**
 * Card representation
 */
export interface Card {
    id: string;              // Unique identifier (e.g., "APOY-13")
    suit: Suit;              // APOY, TUBIG, LUPA, HANGIN
    value: number;           // 1-13
    name: string;            // Display name
    element: Element;        // Element enum
}

/**
 * Combat entity (player or enemy)
 */
export interface CombatEntity {
    id: string;
    name: string;
    hp: number;
    maxHP: number;
    currentBlock: number;
    statusEffects: StatusEffects;
    relics?: Relic[];
    dominantElement?: Element;
}

/**
 * Status effects
 */
export interface StatusEffects {
    strength: number;        // Stacks, persistent
    dexterity: number;       // Stacks, persistent
    weak: number;            // Duration in turns
    vulnerable: number;      // Duration in turns
    burn: number;            // Stacks, duration
    stun: number;            // Duration (0 or 1)
    seal: number;            // Duration in turns
    fear: number;            // Duration in turns
}

/**
 * Combat result for DDA
 */
export interface CombatResult {
    victory: boolean;
    startHP: number;
    endHP: number;
    maxHP: number;
    damageTaken: number;
    turnCount: number;
    totalDamageDealt: number;
    enemyTier: EnemyTier;
    bestHandType: HandType;
    discardsUsed: number;
    discardsAvailable: number;
    consecutiveWins: number;
}
```

### Event System

```typescript
/**
 * Game events for cross-system communication
 */
export enum GameEvent {
    COMBAT_START = 'combat:start',
    COMBAT_END = 'combat:end',
    CARD_PLAYED = 'card:played',
    DAMAGE_DEALT = 'damage:dealt',
    RELIC_ACTIVATED = 'relic:activated',
    POTION_USED = 'potion:used',
    DDA_TIER_CHANGED = 'dda:tier_changed'
}

/**
 * Event emitter usage
 */
class EventBus {
    emit(event: GameEvent, data: any): void;
    on(event: GameEvent, handler: (data: any) => void): void;
    off(event: GameEvent, handler: (data: any) => void): void;
}
```

---

## Performance Optimization

### Asset Management

```typescript
/**
 * Lazy loading for chapter-specific assets
 */
export class AssetLoader {
    async loadChapter(chapter: number): Promise<void> {
        const assets = getChapterAssets(chapter);
        
        for (const asset of assets) {
            await this.scene.load.image(asset.key, asset.path);
        }
        
        this.scene.load.start();
    }
    
    /**
     * Unload previous chapter assets
     */
    unloadChapter(chapter: number): void {
        const assets = getChapterAssets(chapter);
        
        for (const asset of assets) {
            this.scene.textures.remove(asset.key);
        }
    }
}
```

### Object Pooling

```typescript
/**
 * Card sprite pool for performance
 */
export class CardPool {
    private pool: Phaser.GameObjects.Sprite[] = [];
    private active: Set<Phaser.GameObjects.Sprite> = new Set();
    
    constructor(private scene: Phaser.Scene, size: number) {
        // Pre-create pool
        for (let i = 0; i < size; i++) {
            const sprite = scene.add.sprite(0, 0, 'card');
            sprite.setVisible(false);
            this.pool.push(sprite);
        }
    }
    
    /**
     * Get sprite from pool
     */
    acquire(): Phaser.GameObjects.Sprite {
        let sprite = this.pool.pop();
        
        if (!sprite) {
            sprite = this.scene.add.sprite(0, 0, 'card');
        }
        
        sprite.setVisible(true);
        this.active.add(sprite);
        return sprite;
    }
    
    /**
     * Return sprite to pool
     */
    release(sprite: Phaser.GameObjects.Sprite): void {
        sprite.setVisible(false);
        this.active.delete(sprite);
        this.pool.push(sprite);
    }
}
```

### Rendering Optimization

```typescript
/**
 * Batch rendering for cards
 */
export function renderCardBatch(
    scene: Phaser.Scene,
    cards: Card[],
    container: Phaser.GameObjects.Container
): void {
    // Use container for batch transforms
    cards.forEach((card, index) => {
        const sprite = scene.add.sprite(index * 100, 0, card.id);
        container.add(sprite);
    });
    
    // Single transform applies to all
    container.setPosition(100, 100);
}
```

---

## Data Management

### LocalStorage Schema

```typescript
/**
 * Save game data structure
 */
export interface SaveData {
    version: string;
    timestamp: number;
    player: PlayerState;
    run: RunState;
    progression: ProgressionState;
    settings: GameSettings;
}

/**
 * Save/Load manager
 */
export class SaveManager {
    private readonly SAVE_KEY = 'bathala_save';
    
    /**
     * Save current game state
     */
    save(data: SaveData): void {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.SAVE_KEY, json);
        } catch (error) {
            console.error('Save failed:', error);
        }
    }
    
    /**
     * Load saved game
     */
    load(): SaveData | null {
        try {
            const json = localStorage.getItem(this.SAVE_KEY);
            return json ? JSON.parse(json) : null;
        } catch (error) {
            console.error('Load failed:', error);
            return null;
        }
    }
    
    /**
     * Clear save data
     */
    clear(): void {
        localStorage.removeItem(this.SAVE_KEY);
    }
}
```

### Data Validation

```typescript
/**
 * Validate save data integrity
 */
export function validateSaveData(data: any): data is SaveData {
    return (
        typeof data === 'object' &&
        typeof data.version === 'string' &&
        typeof data.timestamp === 'number' &&
        validatePlayerState(data.player) &&
        validateRunState(data.run) &&
        validateProgressionState(data.progression)
    );
}
```

---

## Enemy Data Reference

### Act 1: Corrupted Ancestral Forests

```typescript
/**
 * Balance Update v2: Enemy stats scaled for Balatro-inspired damage system
 * - Health multiplied by 8× for common enemies
 * - Health multiplied by 6× for elites/boss
 * - Damage multiplied by 3× to maintain challenge
 */

// Common Enemies
export const TIKBALANG_SCOUT: Enemy = {
    name: "Tikbalang Scout",
    maxHealth: 180,
    currentHealth: 180,
    damage: 21,
    attackPattern: ["attack", "confuse", "attack"]
};

export const BALETE_WRAITH: Enemy = {
    name: "Balete Wraith",
    maxHealth: 150,        // Starts Vulnerable
    currentHealth: 150,
    damage: 15,
    attackPattern: ["attack", "strengthen", "attack"]
};

export const SIGBIN_CHARGER: Enemy = {
    name: "Sigbin Charger",
    maxHealth: 220,
    currentHealth: 220,
    damage: 30,            // Burst damage
    attackPattern: ["charge", "attack", "wait"]
};

export const DUWENDE_TRICKSTER: Enemy = {
    name: "Duwende Trickster",
    maxHealth: 130,
    currentHealth: 130,
    damage: 12,
    attackPattern: ["steal_block", "disrupt_draw", "attack"]
};

export const TIYANAK_AMBUSHER: Enemy = {
    name: "Tiyanak Ambusher",
    maxHealth: 170,
    currentHealth: 170,
    damage: 18,
    attackPattern: ["fear", "critical_attack", "attack"]
};

export const AMOMONGO: Enemy = {
    name: "Amomongo",
    maxHealth: 160,
    currentHealth: 160,
    damage: 15,
    attackPattern: ["bleed_attack", "fast_attack", "attack"]
};

export const BUNGISNGIS: Enemy = {
    name: "Bungisngis",
    maxHealth: 200,
    currentHealth: 200,
    damage: 36,            // High damage swings
    attackPattern: ["laugh_debuff", "high_swing", "attack"]
};

// Elite Enemies
export const KAPRE_SHADE: Enemy = {
    name: "Kapre Shade",
    maxHealth: 320,
    currentHealth: 320,
    damage: 36,
    attackPattern: ["burn_aoe", "summon_minion", "attack"]
};

export const TAWONG_LIPOD: Enemy = {
    name: "Tawong Lipod",
    maxHealth: 300,        // High Dexterity (2 stacks permanent)
    currentHealth: 300,
    damage: 30,
    attackPattern: ["stun", "air_attack", "attack"]
};

// Boss
export const MANGANGAWAY: Enemy = {
    name: "Mangangaway",
    maxHealth: 600,
    currentHealth: 600,
    damage: 45,
    attackPattern: ["mimic_element", "curse_cards", "hex_of_reversal", "attack"]
};
```

---

## Contributing Guidelines

### Code Standards

```typescript
/**
 * All public methods must have JSDoc
 * @param paramName - Description
 * @returns Description
 * @throws Description (if applicable)
 */
export function exampleFunction(paramName: string): number {
    // Implementation
    return 0;
}

/**
 * Use meaningful variable names
 */
const playerHealthPercentage = player.hp / player.maxHP; // Good
const php = player.hp / player.maxHP;                    // Bad

/**
 * Prefer const over let
 */
const MAX_HAND_SIZE = 8;  // Good
let MAX_HAND_SIZE = 8;    // Bad (for constants)
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No regressions found

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Commented complex code
- [ ] Documentation updated
- [ ] No console.log statements
```

---

## Research & Analytics

### Thesis Data Collection

```typescript
/**
 * Export DDA session for analysis
 */
export function exportDDASession(): ThesisData {
    const analytics = DDAAnalyticsManager.getInstance();
    
    return {
        sessionId: analytics.sessionId,
        timestamp: Date.now(),
        combatHistory: analytics.getCombatHistory(),
        ppsProgression: analytics.getPPSHistory(),
        tierTransitions: analytics.getTierTransitions(),
        playerActions: analytics.getActionLog(),
        outcomeMetrics: {
            winRate: analytics.getWinRate(),
            averageCombatLength: analytics.getAverageTurns(),
            averageHealthRetention: analytics.getAverageHPRetention()
        }
    };
}
```

### A/B Testing Framework

```typescript
/**
 * Feature flag system for experiments
 */
export class ExperimentManager {
    private variant: 'A' | 'B';
    
    constructor() {
        // Random assignment
        this.variant = Math.random() < 0.5 ? 'A' : 'B';
    }
    
    /**
     * Get DDA parameters based on variant
     */
    getDDAParameters(): DDAParameters {
        if (this.variant === 'A') {
            return CONSERVATIVE_DDA_PARAMS;
        } else {
            return AGGRESSIVE_DDA_PARAMS;
        }
    }
    
    /**
     * Log variant assignment
     */
    logAssignment(): void {
        console.log(`Player assigned to variant: ${this.variant}`);
    }
}
```

---

## Troubleshooting

### Common Development Issues

#### TypeScript Errors

**Problem**: `Property 'X' does not exist on type 'Y'`
```typescript
// Solution: Define proper interface
interface Y {
    X: string;
}
```

#### Build Failures

**Problem**: Vite build fails with memory error
```powershell
# Solution: Increase Node memory
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### Test Failures

**Problem**: Jest can't find modules
```javascript
// Solution: Update jest.config.js
moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
}
```

### Performance Debugging

```typescript
/**
 * Performance monitoring
 */
export class PerformanceMonitor {
    measureFrameTime(): void {
        const start = performance.now();
        
        // Game update logic
        
        const end = performance.now();
        const frameTime = end - start;
        
        if (frameTime > 16.67) { // 60 FPS threshold
            console.warn(`Slow frame: ${frameTime}ms`);
        }
    }
}
```

---

## Additional Resources

### Documentation Links

- **Phaser 3 API**: https://photonstorm.github.io/phaser3-docs/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Jest Documentation**: https://jestjs.io/docs/getting-started

### Internal Documentation

- `docs/Bathala Game Design Document V5.8.14.25.md` - Complete GDD
- `docs/DDA_IMPLEMENTATION_ANALYSIS.md` - DDA deep dive
- `.github/copilot-instructions.md` - AI development guidelines

### Community

- **GitHub Repository**: https://github.com/devlocke-acsad/bathala
- **Issue Tracker**: GitHub Issues
- **Discussions**: GitHub Discussions

---

## Contact

### For Developers
- **GitHub**: Submit issues and PRs
- **Email**: dev@bathalagame.com

### For Researchers
- **Research Inquiries**: research@bathalagame.com
- **Data Access**: Request via GitHub Issues with tag `[Research]`

---

**End of Technical Manual**

*For player-focused documentation, see PLAYER_MANUAL.md*

---

*Last updated: November 13, 2025*  
*Document Version: 5.8.14.25*  
*Game Version: 1.4.0*

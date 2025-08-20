# Bathala: A Filipino-Mythology Roguelike Card Game

[![Phaser](https://img.shields.io/badge/Phaser-3.90.0-blue)](https://phaser.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.1-blue)](https://vitejs.dev/)

**Bathala** is a Filipino mythology-inspired roguelike card game featuring poker-based combat, deck-sculpting mechanics, and a rule-based Dynamic Difficulty Adjustment (DDA) system. This project serves as a thesis focusing on the design and validation of a transparent, rule-based DDA system to maintain player "flow" through measurable performance metrics.

## 🎮 Game Overview

In Bathala, you guide a babaylan—a spiritual seer communing with the divine—through an infinite, procedurally generated spirit realm fractured by the silence of the gods. By sculpting a divine deck of elemental cards based on poker, you must survive five cycles of light and darkness before confronting the chapter's ascendant, false god.

### Core Features

- **Poker-Inspired Combat**: Actions are fueled by a hand-formation mechanic, requiring strategic construction of 5-card poker hands from a pool of 8 drawn cards
- **Deck-Sculpting Progression**: Unique take on deck-building where players begin with a full 52-card deck and must strategically **purify** (remove), **attune** (upgrade), and rarely **infuse** (add) cards
- **Action-Based Overworld**: A day-night cycle advanced by player actions, not real-time clock
- **The Five-Cycle Countdown**: Built-in pacing mechanism where the chapter boss awakens after five full day-night cycles
- **Deep Itemization**: Rich ecosystem of relics (passive buffs) and potions (active effects) that synergize with core mechanics
- **The Landás System (The Path System)**: Morality system where choices (spare vs. slay) influence rewards and narrative events without affecting difficulty
- **Dynamic Difficulty Adjustment (DDA)**: Measurable, rule-based adaptive system designed to maintain player "flow" by adjusting game parameters based on defined performance states

## 🧠 Thesis Focus

This project focuses on the design and validation of a **transparent, rule-based DDA system** to maintain player "flow" through measurable performance metrics. The DDA system operates independently of the Landás system and adapts to player performance using a Player Performance Score (PPS) that tracks:

- Health status at the end of combat
- Hand quality (poker combinations achieved)
- Combat duration

The system adjusts difficulty through:
- Enemy HP/Damage scaling (±25%)
- Shop prices and gold tuning
- Map generation bias (more Rest nodes if PPS is low)
- Narrative framing that reflects difficulty changes

## 🛠️ Technical Stack

- **Game Engine**: [Phaser 3.90.0](https://phaser.io)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Framework**: Web-based

## 📁 Project Structure

```
bathala/
├── src/
│   ├── core/
│   │   ├── game/            # Phaser scenes, UI
│   │   ├── mechanics/       # Combat, relics, potions, landas, overworld
│   │   ├── dda/             # RuleBasedDDA, PPS logic
│   │   └── types/
│   ├── data/
│   │   ├── cards/
│   │   ├── enemies/
│   │   ├── relics/
│   │   ├── potions/
│   │   └── lore/
│   ├── utils/
│   │   ├── analytics/       # PPS, session logging
│   │   ├── dda/             # Rules engine
│   │   └── helpers/
│   └── tests/
│       ├── unit/            # Combat, DDA, relics
│       └── integration/     # Overworld → combat → DDA
├── public/
└── docs/
```

## ▶️ Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 📚 Documentation

- [Game Design Document](docs/Bathala%20Game%20Design%20Document%20V5.8.14.25.md)
- [AI Development Guidelines](.github/copilot-instructions.md)

## 🎯 Core Gameplay Loop

1. **Overworld Phase**: Navigate the grid-based map one tile at a time, advancing the day-night cycle
2. **Combat Phase - Hand Formation**: Draw 8 cards and choose 5 to form a poker hand
3. **Combat Phase - Action**: Choose Attack, Defend, or Special actions powered by poker hand bonuses
4. **Progression**: Return to overworld and survive 5 full day-night cycles to trigger the boss battle

## 🃏 Combat & Deck Mechanics

- **Starting Deck**: 52 cards (4 suits: Apoy/Fire, Tubig/Water, Lupa/Earth, Hangin/Air; values 1–13)
- **Hand Bonuses**:
  - Pair (+2), Two Pair (+4), Three of a Kind (+7), Straight (+10), Flush (+14)
  - Full House (+18), Four of a Kind (+22), Straight Flush (+35), Five of a Kind (+30)
- **Elemental Effects**: Each suit modifies actions and applies status effects
- **Status Effects**: Strength, Dexterity, Weak, Vulnerable, Burn, Stun, Seal, etc.

## 🧭 Navigation & Progression Systems

- **Day/Night Cycle**: Advances by player actions (50 actions per phase)
  - **Day**: Neutral enemies
  - **Night**: Aggressive enemies
- **Five-Cycle Countdown**: Boss spawns after ~500 actions (5 full cycles)
- **Landás System (Morality)**:
  - **Slay** = –1, **Spare** = +1
  - **Alignments**: Mercy (+5 to +10), Balance (–4 to +4), Conquest (–10 to –5)

## 🏆 Item Systems

### Relics (Passive, max 6)
- Sources: Elite (60%), Boss (30%), Treasure/Event (10%)
- Examples: Babaylan's Talisman, Agimat of the Swift Wind, Earthwarden's Plate

### Potions (Active, max 3)
- Single-use combat effects
- Examples: Potion of Clarity, Elixir of Fortitude, Phial of Elements

## 🧪 Testing & Validation

The project includes unit and integration tests for core mechanics and the DDA system. Performance logging is implemented to validate the effectiveness of the DDA system in maintaining player flow.

## 📖 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Phaser](https://phaser.io)
- Inspired by Filipino mythology and culture
- Academic research on game difficulty adjustment systems
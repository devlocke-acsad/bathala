**Bathala AI Development Guidelines**  
*Concise Reference for AI Assistant – Based on GDD v5.8.14.25*

---

### **Project Overview**

**Game**: *Bathala* – A **Filipino mythology-inspired roguelike card game** with **poker-based combat**, **deck-sculpting**, and a **rule-based Dynamic Difficulty Adjustment (DDA)** system.  
**Thesis Focus**: Design and validation of a **transparent, rule-based DDA system** to maintain player "flow" through measurable performance metrics.  
**Tech Stack**: TypeScript + Phaser.js (Web)  
**Core Loop**: Overworld navigation → Combat (hand formation) → Progression via deck-sculpting → Survive 5 day-night cycles → Boss fight.

---

### **Core Mechanics**

#### **1. Combat & Deck System**
- **Starting Deck**: 52 cards (4 suits: Apoy, Tubig, Lupa, Hangin; values 1–13).
- **Hand Formation**: Draw 8, choose 5 to form a poker hand.
- **Actions**: Attack, Defend, Special — powered by hand bonuses.
- **Hand Bonuses**:
  - Pair (+2), Two Pair (+4), Three of a Kind (+7), Straight (+10), Flush (+14), Full House (+18), Four of a Kind (+22), Straight Flush (+35), Five of a Kind (+30).
- **Elemental Effects**: Each suit modifies actions and applies status effects (e.g., Apoy = Burn, Lupa = Strength).
- **Status Effects**: Strength, Dexterity, Weak, Vulnerable, Burn, Stun, Seal, etc.

#### **2. Deck-Sculpting**
| Action | Location | Effect |
|--------|--------|--------|
| Purify | Shop | Remove a card permanently |
| Attune | Rest Site | Upgrade a card’s value (same suit) |
| Infuse | Elite/Boss | Add a new card to deck |

#### **3. Discard System**
- 1 discard charge per combat (spend to redraw up to 5 cards).
- Max charges increased by relics.

---

### **Progression & Systems**

#### **Overworld**
- Grid-based, procedurally generated.
- **Day/Night Cycle**: Advances by player actions (50 actions per phase).
  - **Day**: Neutral enemies.
  - **Night**: Aggressive enemies.
- **Five-Cycle Countdown**: Boss spawns after ~500 actions (5 full cycles).

#### **Landás System (Morality)**
- **Slay** = –1, **Spare** = +1.
- **Alignments**:
  - **Mercy** (+5 to +10): More Spirit Fragments.
  - **Balance** (–4 to +4): Standard rewards.
  - **Conquest** (–10 to –5): More gold.
- **No impact on difficulty** — only narrative and rewards.

#### **Meta-Progression**
- **Currency**: Spirit Fragments (earned per run).
- **Ancestral Memories**: Permanent unlocks (e.g., +Max HP, extra Dexterity).
- **Chronicle**: Lore entries unlocked via gameplay conditions.

---

### **Item Systems**

#### **Relics (Passive, max 6)**
- **Sources**: Elite (60%), Boss (30%), Treasure/Event (10%).
- **Examples**:
  - *Babaylan's Talisman*: Hand is one tier higher.
  - *Agimat of the Swift Wind*: +1 discard charge.
  - *Earthwarden's Plate*: Start with 5 persistent block.
  - *Echo of the Ancestors*: Enables Five of a Kind.

#### **Potions (Active, max 3)**
- Single-use combat effects.
- **Examples**:
  - *Potion of Clarity*: Draw 3 cards.
  - *Elixir of Fortitude*: Gain 15 block.
  - *Phial of Elements*: Choose dominant element.
  - *Balm of Resilience*: Cleanse all debuffs.

---

### **Chapters & Bosses**

| Chapter | Theme | Key Mechanics |
|--------|------|---------------|
| **1: Shattered Grove** | Corrupted nature | Earth/Air focus; Mangangaway mimics player’s last element, then curses cards. |
| **2: Drowned Isles** | Flooded ruins | Water/Fire conflict; Bakunawa reduces hand size, devours relics, nullifies damage. |
| **3: Skyward Citadel** | Divine deception | Status cycling; False Bathala steals relics, nullifies bonuses, forces moral choices. |

---

### **Dynamic Difficulty Adjustment (DDA)**

#### **Design Goal**
Maintain player "flow" using a **rule-based system** that adapts to performance, **independent of Landás**.

#### **Player Performance Score (PPS)**
- Starts at 2.5.
- Updated post-combat:
  - `+0.3` if end with >90% HP
  - `–0.4` if <20% HP
  - `+0.2` for Four of a Kind or better
  - `–0.25` if combat >8 turns

#### **Difficulty Tiers**
| Tier | State | Game Response |
|------|------|----------------|
| 0 | Struggling | –20% enemy stats, more Rest nodes, subtle hints |
| 1–2 | Learning | Standard difficulty, minor adjustments |
| 3–4 | Thriving | +15% enemy stats, advanced AI patterns |
| 5 | Mastering | Max difficulty, complex mechanics, fewer safety nets |

#### **Adjustments**
- Enemy HP/DMG scaling (±25%)
- Shop prices and gold tuning
- Map generation bias (e.g., more Rest nodes if PPS low)
- **Narrative framing**: In-world events reflect difficulty changes.

---

### **Technical Implementation**

#### **File Structure**
```bash
src/
├── core/
│   ├── game/            # Phaser scenes, UI
│   ├── mechanics/       # Combat, relics, potions, landas, overworld
│   ├── dda/             # RuleBasedDDA, PPS logic
│   └── types/
├── data/
│   ├── cards/
│   ├── enemies/
│   ├── relics/
│   ├── potions/
│   └── lore/
├── utils/
│   ├── analytics/       # PPS, session logging
│   ├── dda/             # Rules engine
│   └── helpers/
└── tests/
    ├── unit/            # Combat, DDA, relics
    └── integration/     # Overworld → combat → DDA
```

#### **Code Standards**
- TypeScript strict mode
- JSDoc for all public methods
- Unit tests for core mechanics and DDA
- ESLint + Prettier

---

### **AI Assistant Guidelines**

When assisting:
- ✅ Use **TypeScript** with strict typing.
- ✅ Focus on **rule-based DDA**, not ML.
- ✅ Prioritize **transparency, testability, and reproducibility**.
- ✅ Align with **GDD v5.8.14.25**.
- ✅ Suggest **A/B testing** and **performance logging** for thesis validation.
- ❌ Do not suggest ML, neural networks, or blockchain features.

---

**Note**: This document is the single source of truth for AI assistance. All suggestions must support the **rule-based DDA thesis** and **core game mechanics** as defined.
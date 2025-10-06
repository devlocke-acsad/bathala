## **Bathala: Game Design Document**

**Title**: Development of Bathala: A Filipino-Mythology Roguelike Card Game Featuring a Rule-Based Dynamic Difficulty Adjustment and Procedural Generation

### **1\. High-Level Concept**

**Premise:**

You guide a babaylan—a spiritual seer communing with the divine—through an infinite, procedurally generated spirit realm fractured by the silence of the gods. By sculpting a divine deck of elemental cards based on poker, you must survive five cycles of light and darkness before confronting the chapter’s ascendant, false god. Your choices to spare or slay the spirits you defeat will define your Landás—your path of mercy, balance, or conquest—as you journey to find the lost creator god, Bathala, and restore cosmic order.

**Key Features**:

* **Poker-Inspired Combat**: A novel turn-based system where actions are fueled by a hand-formation mechanic, requiring players to strategically construct a 5-card poker hand from a larger pool of drawn cards.  
* **Deck-Sculpting Progression**: A unique take on deck-building where players begin with a full 52-card deck and must strategically **purify** (remove), **attune** (upgrade), and rarely **infuse** (add) cards to achieve consistency and power.  
* **Action-Based Overworld**: An overworld where the day-night cycle is advanced by player actions, not a real-time clock. Enemies are neutral by day but become aggressive hunters at night.  
* **The Five-Cycle Countdown**: A built-in pacing mechanism where the chapter boss awakens after five full day-night cycles are completed through overworld actions, creating a pressing need for efficient preparation.  
* **Deep Itemization**: A rich ecosystem of relics (passive buffs) and potions (active effects) that synergize with the core mechanics to enable diverse strategies.  
* **The Landás System (The Path System)**: A morality system where player choices in combat (spare vs. slay) directly influence rewards and narrative events, without affecting game difficulty.  
* **Dynamic Difficulty Adjustment (DDA)**: A measurable, rule-based adaptive system designed to maintain player "flow" by adjusting game parameters based on defined performance states.

### **2\. The Core Gameplay Loop**

1. **Overworld Phase**: The player navigates the grid-based map one tile at a time. Each move or interaction counts as an "action," contributing to the day-night cycle's progression.  
2. **Combat Phase \- Hand Formation**: When combat begins:  
   * **Draw**: Draw a hand of **8 cards** from your deck.  
   * **Selection**: From these 8 cards, the player must strategically **choose 5 cards** to form their active hand for the turn.  
3. **Combat Phase \- Action**:  
   * **Action Choice**: The player chooses one of three core actions: **Attack, Defend,** or **Special**.  
   * **Resolution**: The action's power is amplified by the poker hand the player constructed. The effect resolves, and the enemy takes its turn.  
4. **Progression**: After combat, the player returns to the overworld. They must survive for 5 full day-night cycles (a cumulative total of overworld actions) to trigger the chapter's boss battle.

### **3\. Combat & Deck Mechanics**

#### **3.1. The Divine Deck: A Sculpting System**

**Starting Deck**:

* **52 Cards**: A full deck from the beginning.  
* **4 Suits**: Apoy (Fire), Tubig (Water), Lupa (Earth), Hangin (Air).  
* **13 Values**: 1 through 10, then 11 (Mandirigma), 12 (Babaylan), and 13 (Datu).

**Deck-Sculpting Mechanics**:

| Action | Location Found | Effect |
| :---- | :---- | :---- |
| **Purify** | Shop | Pay gold to permanently remove a card from your deck for the current run. |
| **Attune** | Rest Site | Choose a card and transform it into a higher-value card of the *same suit*. |
| **Infuse** | Elite/Boss Reward | A rare reward that allows you to add a new, powerful card to your deck. |

#### **3.2. Action System & Hand Bonuses**

The power of an action is determined by its base value plus the bonus from the constructed poker hand.

| Hand Type | Attack Bonus | Defense Bonus | Special Bonus |
| :---- | :---- | :---- | :---- |
| High Card | \+0 | \+0 | \+0 |
| Pair | \+2 | \+2 | \+1 |
| Two Pair | \+4 | \+4 | \+2 |
| Three of a Kind | \+7 | \+7 | \+3 |
| Straight | \+10 | \+10 | \+4 |
| Flush | \+14 | \+14 | \+5 |
| Full House | \+18 | \+18 | \+6 |
| Four of a Kind | \+22 | \+22 | \+7 |
| Straight Flush | \+35 | \+35 | \+15 |
| Five of a Kind | \+30 | \+30 | \+12 |

#### **3.3. Discard System**

| Resource | Value |
| :---- | :---- |
| **Starting Charges** | 1 per combat |
| **Usage** | Spend 1 charge to redraw up to 5 cards |
| **Max Charges** | Can be increased via relics |

#### **3.4. Elemental & Status Effects**

**Elemental Effects**

| Action | Apoy (Fire) | Tubig (Water) | Lupa (Earth) | Hangin (Air) |
| :---- | :---- | :---- | :---- | :---- |
| **Attack** | \+2 damage & applies 1 **Burn** | Ignores 50% of enemy block | \+1 damage per Lupa card in hand | Hits all enemies for 75% damage |
| **Defend** | Gain 1 **Strength** when blocking | Heal 2 HP when gaining block | 50% of unspent block carries over | Gain 1 **Dexterity** when blocking |
| **Special** | AoE Damage \+ **Burn** | Heal \+ Cleanse Debuff | Apply **Vulnerable** | Draw cards \+ Apply **Weak** |

**Status Effects**

| Type | Name | Effect |
| :---- | :---- | :---- |
| **Buff** | **Strength** | Deal \+1 additional damage per stack with Attack actions. |
| **Buff** | **Dexterity** | Gain \+1 additional block per stack with Defend actions. |
| **Buff** | **Regeneration** | Heal 1 HP at the start of your turn. Stacks decrease each turn. |
| **Buff** | **Resolve** | Your poker hands grant \+1 to their action bonuses per stack. |
| **Debuff** | **Weak** | Deal \-1 damage per stack with Attack actions. |
| **Debuff** | **Vulnerable** | Take \+50% damage from all incoming attacks. |
| **Debuff** | **Burn** | Take 2 damage at the start of your turn. Stacks decrease each turn. |
| **Debuff** | **Stun** | Skip your next turn. |
| **Debuff** | **Blur** | 50% chance for your attacks to miss. |
| **Debuff** | **Seal** | Cannot use the **Special** action. |
| **Debuff** | **Wound** | All incoming healing is 50% less effective. |

### **4\. Overworld & Progression**

#### **4.1. The Living Overworld**

* **Structure**: The overworld is an infinite 2D grid, procedurally generated in chunks. Fog of war hides unexplored tiles.  
* **Cycle Trigger**: The transition between Day and Night is triggered by a cumulative number of overworld actions.  
  * **Default**: 50 Actions trigger the change from Day to Night. 50 Actions trigger the change from Night to Day.  
  * An "Action" is defined as moving one tile or interacting with a node.  
* **Day Phase**: Enemies are **Neutral**. The player can explore and prepare.  
* **Night Phase**: Enemies are **Aggressive**. The player must survive.  
* **The Five-Cycle Countdown**: After **5 full cycles** (\~500 overworld actions), the Chapter Boss awakens and is marked on the map.

#### **4.2. Meta-Progression Between Runs**

**TODO: ADD PROFILE SYSTEM / USER AUTHENTICATION** 

Currency: Spirit Fragments  
Earned from run completion, based on zones cleared, bosses defeated, and Landás alignment.

**Ancestral Memories (Permanent Unlocks)**

| Unlock Name | Effect | Cost (Fragments) |
| :---- | :---- | :---- |
| Path of the Healer | Start with \+1 Dexterity and 1 Potion of Clarity | 50 |
| Whisper of Apoy | 10% chance to start combat with \+1 Strength | 60 |
| Echo of the Ancestors | Guaranteed infusion event in Chapter 1 | 100 |
| Anito’s Guidance | Day/Night cycle extended by 10 actions | 80 |
| Babaylan’s Resolve | Gain 1 max HP per run (stacks up to \+5) | 70 |

**Chronicle of the Fallen God (Lore System)**

* Unlocks narrative entries after each run, revealing the backstory of the world.  
* Some entries are conditional (e.g., spare 5 enemies to unlock "The Mercy of the Babaylan"; defeat a boss with a specific element to unlock their weakness).

#### **4.3. Progression Architecture Summary**

| Layer | Type | Scope | Purpose |
| :---- | :---- | :---- | :---- |
| **In-Run Progression** | Procedural | Within a single run | Explore, survive, grow stronger temporarily. |
| **Chapter Advancement** | Linear | Game-wide | Progress the main narrative and face new challenges. |
| **Meta-Progression** | Persistent | Between all runs | Unlock permanent options, reveal lore, and provide a sense of long-term achievement. |

### **5\. Item Systems**

#### **5.1. Relics**

Passive items that provide powerful, run-altering effects. Players can carry up to **6 relics per run**. Total: **18 relics** (12 in-run, 6 meta-unlocks).

| Name | Source | Effect | Notes |
| :---- | :---- | :---- | :---- |
| Babaylan's Talisman | Elite / Boss | Hand is always one tier higher | Enables stronger hands early on. |
| Agimat of the Swift Wind | Elite / Boss | \+1 Discard Charge per combat | High skill expression; allows fishing for better hands. |
| Earthwarden's Plate | Elite / Boss | Start every combat with 5 persistent Block | Great for defensive builds. |
| Echo of the Ancestors | Boss / Mystery | Add a duplicate card (enables 5 of a Kind) | Run-defining; a high-priority find. |
| Anito's Lantern | Treasure | Reveals an extra 3-tile radius of the map | Exploration aid, reduces risk. |
| Kapre's Might | Elite | All Attack actions deal \+1 damage | Simple, effective boost. |
| Sirena's Grace | Rest Event | Heal 3 HP at start of combat | Sustain-focused. |
| Sigbin's Hoard | Shop (rare) | \+10% gold from all sources | Economy booster. |
| Tikbalang's Leap | Mystery | Gain 1 Dexterity if you have 0 Block at turn start | High risk/reward. |
| Balete's Roots | Rest | \+5 Max HP for the run | Stackable survivability. |
| Duwende's Trick | Mystery | 25% chance to apply Weak to an enemy at turn start | Unreliable but can be powerful. |
| Tiyanak's Fury | Elite | Deal \+2 damage with Attacks when HP \< 50% | A comeback mechanic. |
| Staff of Compassion | Meta (Mercy Path) | Sparing an enemy grants \+1 Spirit Fragment | Encourages Mercy path. |
| Blade of the Warrior | Meta (Conquest Path) | Slaying an enemy grants \+1 Gold | Rewards Conquest path. |
| Path of the Healer | Meta | Start with \+1 Dex and 1 Potion of Clarity | Early safety net. |
| Whisper of Apoy | Meta | 10% chance to start combat with \+1 Strength | Subtle but consistent boost. |
| Anito’s Guidance | Meta | Day/Night cycle extended by 10 actions | Eases time pressure. |
| Babaylan’s Resolve | Meta | Gain 1 Max HP per run (up to \+5) | Long-term investment. |

**Acquisition Rules:**

* 1 meta relic per run (chosen at start if unlocked).  
* In-run relics are primarily from Elite/Boss encounters (60%/30%), with a small chance from Treasure/Events (10%).  
* No random drops — all are intentional rewards for overcoming challenges.

#### **5.2. Potions (Consumables)**

Consumable items for a one-time, powerful effect in combat. Players can carry up to **3 potions per run**.

| Name | Effect | Source | Notes |
| :---- | :---- | :---- | :---- |
| Potion of Clarity | Draw 3 cards. Does not end your turn. | Shop, Treasure | The most versatile potion for hand-fixing. |
| Elixir of Fortitude | Gain 15 Block immediately. | Shop, Combat Reward | A defensive panic button. |
| Phial of Elements | Choose the dominant element for your hand this turn. | Mystery, Elite | Enables critical elemental synergies. |
| Tonic of Regeneration | Gain 3 Regeneration. | Rest, Treasure | Excellent for post-fight recovery. |
| Draught of Focus | Gain 2 Resolve for one turn. | Shop | Empowers all actions for a burst turn. |
| Elixir of Might | Gain 2 Strength for one turn. | Combat Reward | For a burst damage turn. |
| Potion of Evasion | Gain 2 Dexterity for one turn. | Treasure | Proactive defense. |
| Balm of Resilience | Cleanse all debuffs. | Rest, Mystery | Utility, crucial against certain enemies. |
| Phial of the Ancients | Your next hand is treated as one tier higher. | Elite, Boss | A one-time boost for a critical moment. |
| Tonic of the Deep | Heal 8 HP, but discard 2 random cards. | Mystery | High-risk, high-reward healing. |
| Draught of the Storm | Deal 10 damage to all enemies, take 5 damage. | Elite | High-risk AoE clear. |
| Elixir of the Grove | Gain 10 persistent Block. | Rest | Stronger than Fortitude, but rarer. |

**Rules:**

* Max 3 carried. Can be bought, found, or rewarded.  
* No stacking — each potion is a single-use item.

### **6\. Chapter & Boss Design**

#### **Chapter 1: The Shattered Grove**

* **Theme:** Corrupted nature spirits and earth-based challenges  
* **Elemental Focus:** Earth and Air dominance in enemy abilities  
* **Narrative Arc:** Investigate the source of corruption plaguing the sacred forest  
* **Common Enemies:**  
  * Tikbalang Scout (HP: 28): Confuses targeting, applies Weak  
  * Balete Wraith (HP: 22): Applies Vulnerable, gains Strength when hurt  
  * Sigbin Charger (HP: 35): High damage burst attack every 3 turns  
  * Duwende Trickster (HP: 18): Disrupts card draw, steals block  
  * Tiyanak Ambusher (HP: 25): First strike critical hits, applies Fear  
* **Elite Enemies:**  
  * Kapre Shade (HP: 65): AoE Burn damage, summons fire minions  
  * Wailing Wind Spirit (HP: 58): Stun attacks, benefits from Air cards played  
* **Boss: The Mangangaway (HP: 120\)**  
  * **Phase 1:** Mimics the player's last used elemental effect, turning their strategy against them.  
  * **Phase 2 (at 50% HP):** Stops mimicking and begins to curse random cards in the player's hand each turn, making them unplayable.  
  * **Signature Attack: "Hex of Reversal"** \- A powerful debuff that causes the player's next poker hand to apply negative bonuses.

#### **Chapter 2: The Drowned Isles**

* **Theme:** Flooded ruins and water-fire elemental conflicts  
* **Elemental Focus:** Water healing/cleansing vs. Fire damage/burn synergies  
* **Narrative Arc:** Uncover ancient betrayals and sunken divine conflicts  
* **Common Enemies:**  
  * Sirena Illusionist (HP: 30): Heals allies, charms player attacks to miss  
  * Drowned Warrior (HP: 40): Heavy armor, splash damage attacks  
  * Coral Swarm (HP: 15 each, 3 units): Adaptive damage types, regenerates  
  * Santelmo Flicker (HP: 20): High dodge, applies persistent Burn  
  * Kalansay Diver (HP: 32): Banishes cards temporarily, weakening the deck  
* **Elite Enemies:**  
  * Sunken Shaman (HP: 70): Disrupts poker hands, benefits from player potion use  
  * Fire-Water Elemental (HP: 68): Alternates between Burn AoE and party healing  
* **Boss: The Bakunawa (HP: 150\)**  
  * **Phase 1:** Creates a "Flood" effect, reducing the player's hand size by 1 each turn.  
  * **Phase 2 (at 66% HP):** Devours one of the player's relics, disabling its effect for the remainder of the fight.  
  * **Phase 3 (at 33% HP):** Warps reality, causing Pairs to count as High Cards, significantly reducing the player's damage potential.  
  * **Signature Attack: "Lunar Eclipse"** \- For 2 turns, all damage dealt to The Bakunawa heals it instead.

#### **Chapter 3: The Skyward Citadel**

* **Theme:** Divine deception and celestial trials  
* **Elemental Focus:** Complex multi-element combinations and status cycling  
* **Narrative Arc:** Ascend to confront the false deity and restore true divine order  
* **Common Enemies:**  
  * Tigmamanukan Watcher (HP: 26): Grows \+2 Strength each turn if ignored  
  * Diwata Sentinel (HP: 38): Counters with opposite element to player's dominant  
  * Sarimanok Keeper (HP: 30): Nullifies Special actions, buffs other enemies  
  * Bulalakaw Flamewings (HP: 33): Meteor attacks cause Burn and Blur  
  * Alicanto Phantom (HP: 28): Steals potions, high evasion against Air attacks  
* **Elite Enemies:**  
  * Twin Lightning Djinns (HP: 45 each): Shared damage pool, alternating attacks  
  * Oroban Godling (HP: 85): Changes poker hand rules mid-combat randomly  
* **Boss: The False Bathala (HP: 200\)**  
  * **Phase 1:** Steals player relics, uses their effects against them  
  * **Phase 2 (75% HP):** Nullifies poker bonuses, only base actions work  
  * **Phase 3 (50% HP):** Forces elemental shifts \- dominant element changes randomly  
  * **Phase 4 (25% HP):** "Divine Judgment" \- moral choices determine available actions  
  * **Victory Condition:** Defeat varies based on moral path taken throughout game

### **7\. The Landás System (The Path)**

The Landás system is the core moral and narrative framework of the game. After most combat encounters, the player is presented with a choice: **spare** or **slay** the defeated spirit. This decision is not merely cosmetic; it directly influences a hidden **Landás Score** that tracks the player's alignment throughout their journey.

* **Mechanics**:  
  * The Landás Score starts at 0\.  
  * Choosing to **Slay** an enemy decreases the score by 1\.  
  * Choosing to **Spare** an enemy increases the score by 1\.  
* **Alignment Tiers**:  
  * **Conquest** (Score \-10 to \-5): The player is seen as a ruthless conqueror.  
  * **Balance** (Score \-4 to \+4): The player walks the middle path, judging each spirit on its own.  
  * **Mercy** (Score \+5 to \+10): The player is a compassionate seer, seeking to heal the spirit world.  
* **Gameplay Effects**:  
  * **Rewards**: A Conquest path yields more gold from combat. A Mercy path yields more Spirit Fragments for meta-progression. A Balance path provides standard rewards.  
  * **Narrative**: The player's Landás alignment can unlock unique dialogue options in events and alter the narrative text, reflecting how the spirit world perceives them.  
  * **Endings**: The final ending of the game is determined by the player's final Landás alignment.  
* **Decoupling from DDA**: It is critical to note that the Landás system is entirely separate from the Dynamic Difficulty Adjustment system. A player's moral choices do not make the game mechanically harder or easier; only their demonstrated skill does. This ensures that players are free to follow the narrative path they desire without being punished with unfair difficulty.

### **8\. Dynamic Difficulty Adjustment (DDA) System**

#### **8.1. Research Goal & Thesis Contribution**

* **Primary Research Question:** "How can a rule-based adaptive difficulty system be designed to maintain a state of 'flow' for players of varying skill levels in a strategic roguelike game?"  
* **Thesis Contribution:** The design, implementation, and empirical validation of this rule-based DDA system using measurable performance metrics.

#### **8.2. DDA Model: Rule-Based Engine**

* **Player Performance Score (PPS)**: A continuous value updated after key events (like combat).  
* **Inputs**:  
  * **Combat Efficiency**: HP lost, turns taken, damage ratio.  
  * **Resource Management**: Gold spent, potions used, discard charges used.  
  * **Strategic Acumen**: Quality of poker hands played over time.  
* **Calibration Period**: To ensure fair difficulty adaptation and establish a baseline, the DDA system observes the **first 3 combats** without applying difficulty adjustments. During this calibration period:
  * Player Performance Score is still tracked and updated.
  * Difficulty tier remains locked at "Learning" tier (1.0x enemy stats).
  * Enemies have standard baseline stats to establish a consistent measurement point.
  * After the calibration period ends (post-combat #3), the system applies the calculated difficulty tier based on accumulated PPS.
  * This prevents premature difficulty spikes and allows players to understand baseline mechanics.
  * **Design Rationale**: Provides a "wind-up" phase for player skill assessment, improving perceived fairness and player experience.
* **Anti-Death-Spiral Design**: Initial playtesting revealed that struggling players could enter a "death spiral" where even winning combats resulted in negative PPS due to accumulated penalties (low HP, long combat duration). This prevented the DDA system from effectively helping struggling players recover. The following systems were implemented to address this:
  * **Victory/Defeat Mechanics**: Base victory bonus (+0.3 PPS) ensures winning is always rewarding. Defeat penalty (-0.5 PPS) is only applied on loss. This creates asymmetric rewards where victory always results in net positive or near-zero PPS.
  * **Comeback System**: When PPS drops below 1.5 (deep in "Struggling" tier), players receive an additional comeback bonus (+0.4 PPS) per victory. Consecutive wins grant stacking bonuses (+0.2 per win, max +0.6) to build positive momentum and enable recovery from difficult situations.
  * **Tier-Based Penalty Scaling**: Modifiers are scaled based on current difficulty tier. Struggling players receive reduced penalties (50% reduction) and increased bonuses (50% increase) to prevent further decline. Conversely, thriving/mastering players receive increased penalties to maintain challenge. This prevents the system from punishing players while they're down.
* **PPS Calculation (Updated Logic)**: The PPS starts at a baseline (2.5). After each combat, it is adjusted with the following modifiers, scaled by current tier:
  * **Base modifiers**: Victory +0.3, Defeat -0.5
  * **Health-based (Gradient System)**: Provides continuous feedback across all performance levels to prevent PPS inflation:
    * **90-100% HP**: +0.3 (full bonus) - Excellent performance
    * **70-89% HP**: +0.15 (half bonus) - Good performance
    * **50-69% HP**: 0 (neutral) - Moderate performance
    * **30-49% HP**: -0.15 (half penalty) - Poor performance
    * **<30% HP**: -0.3 (full penalty) - Very poor performance
  * **Hand quality**: Four of a Kind or better +0.2
  * **Combat efficiency (Tier-based turn thresholds)**: -0.15 penalty applied based on skill tier
    * **Mastering tier**: Penalty if >4 turns (expected 1-3 turns, high damage 10-22)
    * **Thriving tier**: Penalty if >5 turns (expected 2-4 turns, good damage 7-10)
    * **Learning tier**: Penalty if >7 turns (expected 3-6 turns, moderate damage 3-7)
    * **Struggling tier**: Penalty if >9 turns (expected 6-9 turns, low damage 0-3)
    * **Design Rationale**: Calibrated to actual damage output per tier. Common enemies have ~18 HP. Higher-skilled players deal significantly more damage per turn (Three of a Kind = 7, Four of a Kind = 22) and are expected to win much faster than struggling players (High Card = 0, Pair = 2).
  * **Perfect combat**: No damage taken +0.5
  * **Resource efficiency**: <80% discard usage +0.1
  * **Clutch victory bonus**: Up to +0.15 when entering combat with <50% HP and winning (scales with starting HP disadvantage)
    * **Design Rationale**: Rewards players who win despite being at a disadvantage from previous combats. Recognizes that winning with 20% starting HP is more impressive than winning with 100% starting HP. Prevents punishing players for resource management decisions across multiple combats.
  * **Comeback bonus**: +0.4 when PPS <1.5 and victory (plus +0.2 per consecutive win, max +0.6)
  * **Tier scaling**: Struggling (penalties ×0.5, bonuses ×1.5), Learning (×1.0), Thriving (penalties ×1.2, bonuses ×0.8), Mastering (penalties ×1.5, bonuses ×0.5)
  * **Design Rationale**: The gradient health system was implemented to address PPS inflation where players at moderate health (30-80%) received only victory bonuses, causing PPS to constantly increase regardless of performance quality. The 5-tier gradient ensures that all performance levels receive appropriate feedback.
* **Adaptive Modifiers**:  
  * **Enemy Stats**: HP and Damage scale based on PPS thresholds (-20% to +15%).  
  * **Economic Tuning**: Shop prices and gold rewards adjust slightly.  
  * **Map Generation**: If PPS is very low, the system can be weighted to generate a Rest node.  
  * **Narrative Framing**: The DDA is framed in-world. During calibration: "Observing your technique..." After calibration, context changes based on tier: "The spirits, sensing your power, send a greater challenge" (high PPS) or "An ancestor's spirit offers gentle guidance" (low PPS).


#### **8.3. DDA Difficulty Tiers**

| Tier | Player State | Game Response |
| :---- | :---- | :---- |
| **0** | **Struggling** | Enemy stats significantly reduced (-20% HP/DMG). Increased chance for healing events and Rest nodes. Subtle gameplay hints may appear. |
| **1-2** | **Learning** | Standard difficulty. The system makes minor, gentle adjustments to smooth out extreme difficulty spikes but largely remains hands-off. |
| **3-4** | **Thriving** | Enemies receive bonus stats (+15% HP/DMG) and are more likely to use their advanced abilities or more complex attack patterns. |
| **5** | **Mastering** | Maximum difficulty. Enemies have the highest stat bonuses, use their most complex AI, and fewer safety nets (like healing nodes) appear. |

**Note:** DDA is independent of Landás — it responds to skill, not morality.

#### **8.4. DDA Testing & Validation Tools**
* **DDA Debug Scene**: A comprehensive testing environment for validating DDA behavior:
  * **Individual Combat Tests**: Simulate Perfect Win, Average Fight, Difficult Win, and Poor Performance scenarios
  * **Calibration Testing**: Skip calibration period or test calibration behavior
  * **Realistic Run Simulation**: Test 11-combat progression with varying performance
  * **Regression Metrics**: MAE, RMSE, R² for PPS prediction accuracy
  * **Validation Tests**: Tier transitions, modifier application, edge cases
  * **Ground Truth Testing**: Compare expected vs actual PPS adjustments
  * **CSV Export**: Export all test data for statistical analysis
* **Design Rationale**: These tools enable empirical validation of the DDA system's effectiveness and provide data for thesis research on adaptive difficulty in roguelike games.  

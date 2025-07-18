# Bathala: Game Mechanics & Story Reference

_Complete gameplay systems and narrative elements_

## Table of Contents

1. [Core Combat System](#core-combat-system)
2. [Elemental Poker Hands](#elemental-poker-hands)
3. [Enhancement Cards](#enhancement-cards)
4. [Relic System](#relic-system)
5. [Honor System](#honor-system)
6. [Enemy Bestiary](#enemy-bestiary)
7. [Story Structure](#story-structure)
8. [Progression Systems](#progression-systems)

---

## Core Combat System

### Base Mechanics

- **Hand Size**: Draw 8 cards, play up to 5 to form poker hand
- **Actions per Turn**: 1 poker hand + 1 optional Enhancement Card action
- **Discards**: 2 discards per turn (can be increased by relics)
- **Deck Size**: Starts at 52 poker cards + \*5 basic Enhancement Cards

### Turn Structure

1. **Draw Phase**: Draw to hand size (7 cards)
2. **Play Phase**: Form poker hand (up to 5 cards)
3. **Action Phase**: Choose Attack/Defend/Special
4. **Enhancement Phase**: Trigger passive effects
5. **Discard Phase**: Discard remaining cards
6. **Enemy Phase**: Enemy attacks/acts

---

## Elemental Poker Hands

### Base Poker Hand Values

| Hand Type           | Base Attack | Base Defend | Base Special       | Rarity    |
| ------------------- | ----------- | ----------- | ------------------ | --------- |
| **High Card**       | 4           | 2           | Minor effect       | Common    |
| **Pair**            | 7           | 4           | Moderate effect    | Common    |
| **Two Pair**        | 12          | 6           | Moderate effect    | Common    |
| **Three of a Kind** | 16          | 5           | Strong effect      | Uncommon  |
| **Straight**        | 20          | 8           | Strong effect      | Uncommon  |
| **Flush**           | 18          | 12          | Strong effect      | Uncommon  |
| **Full House**      | 28          | 10          | Very strong effect | Rare      |
| **Four of a Kind**  | 35          | 8           | Very strong effect | Rare      |
| **Straight Flush**  | 45          | 15          | Extreme effect     | Very Rare |
| **Royal Flush**     | 60          | 20          | Legendary effect   | Legendary |

### Elemental Modifications

#### Fire (Apoy) - Aggressive Damage

| Hand Type           | Attack Bonus | Defend Bonus | Special Effect |
| ------------------- | ------------ | ------------ | -------------- |
| **High Card**       | +2           | +0           | Apply 1 Burn   |
| **Pair**            | +3           | +1           | Apply 1 Burn   |
| **Two Pair**        | +4           | +0           | Apply 2 Burn   |
| **Three of a Kind** | +5           | +1           | Apply 2 Burn   |
| **Straight**        | +6           | +2           | Apply 3 Burn   |
| **Flush**           | +4           | +2           | Apply 3 Burn   |
| **Full House**      | +8           | +2           | Apply 4 Burn   |
| **Four of a Kind**  | +10          | +2           | Apply 5 Burn   |
| **Straight Flush**  | +12          | +3           | Apply 6 Burn   |
| **Royal Flush**     | +15          | +5           | Apply 8 Burn   |

#### Water (Tubig) - Healing & Control

| Hand Type           | Attack Bonus | Defend Bonus | Special Effect |
| ------------------- | ------------ | ------------ | -------------- |
| **High Card**       | +0           | +2           | Heal 2 HP      |
| **Pair**            | +1           | +3           | Heal 3 HP      |
| **Two Pair**        | +2           | +4           | Heal 4 HP      |
| **Three of a Kind** | +2           | +5           | Heal 5 HP      |
| **Straight**        | +3           | +6           | Heal 6 HP      |
| **Flush**           | +3           | +6           | Heal 7 HP      |
| **Full House**      | +4           | +8           | Heal 8 HP      |
| **Four of a Kind**  | +5           | +10          | Heal 10 HP     |
| **Straight Flush**  | +6           | +12          | Heal 12 HP     |
| **Royal Flush**     | +8           | +15          | Heal 15 HP     |

#### Earth (Lupa) - Defensive & Debuffing

| Hand Type           | Attack Bonus | Defend Bonus | Special Effect     |
| ------------------- | ------------ | ------------ | ------------------ |
| **High Card**       | +1           | +3           | Apply 1 Vulnerable |
| **Pair**            | +2           | +4           | Apply 1 Vulnerable |
| **Two Pair**        | +3           | +5           | Apply 2 Vulnerable |
| **Three of a Kind** | +3           | +6           | Apply 2 Vulnerable |
| **Straight**        | +4           | +8           | Apply 3 Vulnerable |
| **Flush**           | +4           | +8           | Apply 3 Vulnerable |
| **Full House**      | +5           | +10          | Apply 4 Vulnerable |
| **Four of a Kind**  | +6           | +12          | Apply 5 Vulnerable |
| **Straight Flush**  | +8           | +15          | Apply 6 Vulnerable |
| **Royal Flush**     | +10          | +20          | Apply 8 Vulnerable |

#### Air (Hangin) - Speed & Card Draw

| Hand Type           | Attack Bonus | Defend Bonus | Special Effect |
| ------------------- | ------------ | ------------ | -------------- |
| **High Card**       | +1           | +1           | Draw 1 Card    |
| **Pair**            | +2           | +2           | Draw 1 Card    |
| **Two Pair**        | +3           | +3           | Draw 2 Cards   |
| **Three of a Kind** | +4           | +3           | Draw 2 Cards   |
| **Straight**        | +5           | +4           | Draw 3 Cards   |
| **Flush**           | +5           | +5           | Draw 3 Cards   |
| **Full House**      | +6           | +6           | Draw 4 Cards   |
| **Four of a Kind**  | +8           | +6           | Draw 5 Cards   |
| **Straight Flush**  | +10          | +8           | Draw 6 Cards   |
| **Royal Flush**     | +12          | +10          | Draw 8 Cards   |

### Mixed Element Hands

When playing cards of different elements, use the **majority element** for bonuses. In case of a tie, player chooses the dominant element.

---

## Enhancement Cards

### Common Enhancement Cards

#### Offensive Cards

| Card Name             | Type    | Effect                                            | Cost      |
| --------------------- | ------- | ------------------------------------------------- | --------- |
| **Lapu-Lapu's Blade** | Passive | When you play a Pair of Kings, deal +10 damage    | 150 Ginto |
| **Magat's Spear**     | Passive | When you play a Straight, deal +8 damage          | 120 Ginto |
| **Humabon's Rage**    | Active  | Deal 12 damage. If enemy has Burn, deal +6 damage | 100 Ginto |
| **Warrior's Cry**     | Active  | Next poker hand deals +15 damage                  | 80 Ginto  |
| **Flame Strike**      | Active  | Deal 8 damage. Apply 2 Burn                       | 90 Ginto  |

#### Defensive Cards

| Card Name                | Type    | Effect                                               | Cost      |
| ------------------------ | ------- | ---------------------------------------------------- | --------- |
| **Diwata's Blessing**    | Passive | When you play a Flush, gain 8 Block and draw 1 card  | 140 Ginto |
| **Bathala's Shield**     | Active  | Gain 15 Block. If you have high Honor, gain +5 Block | 110 Ginto |
| **Ancestral Protection** | Passive | When you play a Full House, gain 12 Block            | 160 Ginto |
| **Spirit Ward**          | Active  | Gain 10 Block. Remove 1 debuff                       | 95 Ginto  |
| **Earth's Embrace**      | Passive | When you play Earth cards, gain +3 Block             | 85 Ginto  |

#### Utility Cards

| Card Name                | Type    | Effect                                               | Cost      |
| ------------------------ | ------- | ---------------------------------------------------- | --------- |
| **Manananggal's Flight** | Active  | Draw 3 cards. Discard 1 card                         | 70 Ginto  |
| **Tikbalang's Mischief** | Active  | Shuffle 2 cards from discard into draw pile          | 60 Ginto  |
| **Aswang's Cunning**     | Active  | Look at enemy's next move. Draw 1 card               | 80 Ginto  |
| **Kapre's Smoke**        | Active  | Apply 2 Weak to all enemies                          | 100 Ginto |
| **Sarimanok's Grace**    | Passive | When you play a Royal Flush, gain 1 Energy next turn | 200 Ginto |

### Rare Enhancement Cards

#### Honor-Based Cards

| Card Name          | Type    | Effect                                                       | Cost        |
| ------------------ | ------- | ------------------------------------------------------------ | ----------- |
| **Righteous Fury** | Passive | High Honor: When you play a Straight, deal +20 damage        | 300 Baubles |
| **Dark Pact**      | Passive | Low Honor: When you defeat an enemy, gain 1 temporary Attack | 250 Baubles |
| **Balanced Soul**  | Passive | Neutral Honor: All poker hands gain +5 Attack and +5 Defend  | 280 Baubles |
| **Mercy's Reward** | Active  | High Honor only: Heal 20 HP. Draw 2 cards                    | 200 Baubles |
| **Vengeance**      | Active  | Low Honor only: Deal damage equal to HP lost this combat     | 220 Baubles |

#### Legendary Enhancement Cards

| Card Name             | Type    | Effect                                                     | Cost        |
| --------------------- | ------- | ---------------------------------------------------------- | ----------- |
| **Mayari's Moonbeam** | Passive | When you play a Flush, it counts as both Attack and Defend | 500 Baubles |
| **Amihan's Typhoon**  | Active  | Deal 30 damage. Apply 3 Vulnerable. Draw 2 cards           | 450 Baubles |
| **Bakunawa's Hunger** | Passive | When you play a Four of a Kind, devour 1 enemy buff        | 400 Baubles |

---

## Relic System

### Common Relics (150-250 Ginto)

| Relic Name          | Effect                           |
| ------------------- | -------------------------------- |
| **Bamboo Charm**    | +1 card draw per turn            |
| **Coconut Shell**   | +5 starting HP                   |
| **Banca Token**     | +1 discard per turn              |
| **Rice Offering**   | Heal 2 HP after non-boss combats |
| **Fisherman's Net** | Start each combat with 5 Block   |

### Uncommon Relics (100-200 Baubles)

| Relic Name             | Effect                                                |
| ---------------------- | ----------------------------------------------------- |
| **Tala's Starlight**   | The first Flush each combat deals +10 damage          |
| **Mayari's Pendant**   | Whenever you play a Straight, gain 1 temporary Energy |
| **Amihan's Feather**   | Air element hands draw +1 card                        |
| **Sidapa's Hourglass** | Start each combat with 1 temporary Attack             |
| **Laon's Wisdom**      | Shops have 1 additional option                        |

### Rare Relics (300-500 Baubles)

| Relic Name               | Effect                                     |
| ------------------------ | ------------------------------------------ |
| **Bathala's Crown**      | High Honor: All poker hands gain +8 Attack |
| **Apolaki's Spear**      | Fire element hands apply +2 Burn           |
| **Dumangan's Harvest**   | Heal 1 HP whenever you draw a card         |
| **Ikapati's Blessing**   | Gain 15 Ginto after each combat            |
| **Dumakulem's Strength** | Earth element hands gain +10 Block         |

### Legendary Relics (500+ Baubles or NFT)

| Relic Name                | Effect                                              |
| ------------------------- | --------------------------------------------------- |
| **Aman Sinaya's Trident** | Water element hands heal +5 HP                      |
| **Habagat's Storm**       | Playing a Royal Flush wins the combat instantly     |
| **Taal Volcano's Heart**  | Fire element hands spread Burn to all enemies       |
| **Makiling's Garden**     | Start each run with 3 random rare Enhancement Cards |

---

## Honor System

### Honor Ranges & Effects

#### High Honor (75-100)

**Gameplay Effects:**

- +20% rewards from combat
- Access to "Mercy" option against bosses
- Certain Enhancement Cards only available
- NPCs offer better shop prices (-15%)
- Unique dialogue options

**Story Effects:**

- Bathala acknowledges your righteousness
- Creatures may surrender instead of fighting
- Access to "Redemption" story paths

#### Neutral Honor (25-74)

**Gameplay Effects:**

- Standard gameplay experience
- Balanced risk/reward encounters
- All standard Enhancement Cards available

**Story Effects:**

- Most dialogue options available
- Standard creature interactions
- Multiple story path choices

#### Low Honor (0-24)

**Gameplay Effects:**

- +15% damage in combat
- Access to "Intimidate" option
- Dark Enhancement Cards available
- Some NPCs become hostile
- Unique "Fear" mechanics

**Story Effects:**

- Bathala expresses disappointment
- Creatures attack more aggressively
- Access to "Corruption" story paths

### Honor Modification Events

#### Major Honor Changes

| Event                   | Honor Change | Description                       |
| ----------------------- | ------------ | --------------------------------- |
| **Spare Act Boss**      | +20          | Choose mercy over victory         |
| **Protect Innocent**    | +15          | Defend NPCs from threats          |
| **Steal from Temple**   | -20          | Desecrate sacred places           |
| **Betray Ally**         | -25          | Turn against helpful NPCs         |
| **Corrupt Sacred Item** | -15          | Use holy relics for dark purposes |

#### Minor Honor Changes

| Event                | Honor Change | Description                       |
| -------------------- | ------------ | --------------------------------- |
| **Help Traveler**    | +5           | Assist NPCs in need               |
| **Share Resources**  | +3           | Give items to others              |
| **Lie to NPC**       | -3           | Deceive for personal gain         |
| **Ignore Suffering** | -5           | Walk past those in need           |
| **Cruel Combat**     | -2           | Use unnecessarily violent tactics |

---

## Enemy Bestiary

### Act 1 Enemies (Forest of Whispers)

#### Common Enemies

| Enemy         | HP  | Attack Pattern | Special Abilities                                   |
| ------------- | --- | -------------- | --------------------------------------------------- |
| **Tikbalang** | 25  | 6 damage       | Confuse: Force player to discard 1 card             |
| **Dwende**    | 15  | 4 damage       | Mischief: Shuffle 1 card from hand into deck        |
| **Kapre**     | 20  | 5 damage       | Smoke: Apply 1 Weak                                 |
| **Sigbin**    | 18  | 7 damage       | Invisibility: 50% chance to avoid damage            |
| **Tiyanak**   | 12  | 3 damage       | Deceive: Gains +2 Attack when player has high Honor |

#### Elite Enemies

| Enemy             | HP  | Attack Pattern | Special Abilities                                                   |
| ----------------- | --- | -------------- | ------------------------------------------------------------------- |
| **Manananggal**   | 45  | 8-12 damage    | Flight: Immune to Earth attacks. Split: Becomes 2 enemies at 50% HP |
| **Aswang**        | 50  | 10 damage      | Shapeshifter: Changes resistances each turn                         |
| **Duwende Chief** | 40  | 6 damage       | Command: Summons 2 Dwende allies                                    |

#### Act 1 Boss

| Enemy        | HP  | Attack Pattern | Special Abilities                                                                            |
| ------------ | --- | -------------- | -------------------------------------------------------------------------------------------- |
| **Bakunawa** | 100 | 15-20 damage   | Eclipse: Reduces all damage by 50% for 2 turns. Devour: Removes 1 Enhancement Card from deck |

### Act 2 Enemies (Mountain Realm)

#### Common Enemies

| Enemy          | HP  | Attack Pattern | Special Abilities                             |
| -------------- | --- | -------------- | --------------------------------------------- |
| **Pugot**      | 30  | 8 damage       | Headless: Immune to Special effects           |
| **Wakwak**     | 25  | 6 damage       | Screech: Apply 2 Vulnerable                   |
| **Bungisngis** | 35  | 10 damage      | Laughter: Heals 3 HP per turn                 |
| **Dalakitnon** | 28  | 7 damage       | Enchant: Steal 1 Enhancement Card for 3 turns |

#### Elite Enemies

| Enemy             | HP  | Attack Pattern | Special Abilities                                    |
| ----------------- | --- | -------------- | ---------------------------------------------------- |
| **Higante**       | 80  | 15 damage      | Stomp: Deals damage to all Enhancement Cards in hand |
| **Santelmo**      | 60  | 12 damage      | Fire Spirit: Immune to Fire attacks, spreads Burn    |
| **Nuno sa Punso** | 55  | 8 damage       | Curse: Permanently reduces max HP by 2               |

#### Act 2 Boss

| Enemy              | HP  | Attack Pattern | Special Abilities                                                              |
| ------------------ | --- | -------------- | ------------------------------------------------------------------------------ |
| **Maria Makiling** | 140 | 12-18 damage   | Nature's Wrath: Summons forest creatures. Healing Spring: Heals 10 HP per turn |

### Act 3 Enemies (Realm of Bathala)

#### Common Enemies

| Enemy               | HP  | Attack Pattern | Special Abilities                                 |
| ------------------- | --- | -------------- | ------------------------------------------------- |
| **Corrupted Anito** | 40  | 12 damage      | Fallen Grace: Gains power from player's low Honor |
| **Shadow Diwata**   | 35  | 10 damage      | Dark Blessing: Applies random debuff              |
| **Void Sarimanok**  | 45  | 14 damage      | Twisted Flight: Removes cards from deck           |

#### Elite Enemies

| Enemy              | HP  | Attack Pattern | Special Abilities                                        |
| ------------------ | --- | -------------- | -------------------------------------------------------- |
| **Fallen Bathala** | 120 | 20 damage      | Divine Corruption: Transforms player's Enhancement Cards |
| **Chaos Serpent**  | 100 | 18 damage      | Reality Tear: Shuffles all cards in play                 |

#### Final Boss

| Enemy        | HP  | Attack Pattern | Special Abilities                                                              |
| ------------ | --- | -------------- | ------------------------------------------------------------------------------ |
| **The Void** | 200 | 25-30 damage   | Consume: Removes random cards from deck. Multiply: Splits into multiple phases |

---

## Story Structure

### Act 1: The Forest of Whispers

**Setting**: Mystical forest where spirits dwell
**Themes**: Introduction to Filipino mythology, establishing Honor system
**Key Events**:

- Meet Bathala's messenger
- First encounter with Tikbalang
- Choice to help or exploit forest spirits
- Bakunawa boss fight with mercy option

### Act 2: The Mountain Realm

**Setting**: Sacred mountains where ancient beings reside
**Themes**: Power vs. wisdom, respect for nature
**Key Events**:

- Encounter with Maria Makiling
- Choice to preserve or exploit natural resources
- Meeting with various mountain spirits
- Revelation about the growing darkness

### Act 3: The Realm of Bathala

**Setting**: The divine realm corrupted by shadow
**Themes**: Ultimate good vs. evil, redemption
**Key Events**:

- Bathala's corruption revealed
- Player's Honor determines available paths
- Final confrontation with The Void
- Multiple endings based on Honor and choices

### Multiple Endings

#### High Honor Ending: "The Redeemer"

- Bathala is cleansed and restored
- All corrupted creatures are healed
- Player becomes a guardian spirit
- Unlock special cosmetic rewards

#### Neutral Honor Ending: "The Balanced"

- Bathala is freed but weakened
- Some corruption remains
- Player returns to mortal realm
- Standard completion rewards

#### Low Honor Ending: "The Conqueror"

- Player absorbs Bathala's power
- Becomes the new dark ruler
- Creatures serve through fear
- Unlock dark-themed cosmetics

---

## Progression Systems

### Experience & Levels

- **No traditional leveling**: Progression through card collection and relics
- **Mastery System**: Unlock new starting decks and Enhancement Cards
- **Achievement System**: Permanent unlocks for specific accomplishments

### Unlockable Content

#### Starting Decks

| Deck Name          | Unlock Condition               | Special Feature                          |
| ------------------ | ------------------------------ | ---------------------------------------- |
| **Balanced Path**  | Default                        | Standard 52-card deck                    |
| **Fire Walker**    | Win 5 runs with Fire majority  | Start with Fire Enhancement Cards        |
| **Water Sage**     | Win 5 runs with Water majority | Start with Water Enhancement Cards       |
| **Earth Guardian** | Win 5 runs with Earth majority | Start with Earth Enhancement Cards       |
| **Wind Dancer**    | Win 5 runs with Air majority   | Start with Air Enhancement Cards         |
| **Honor Bound**    | Complete High Honor ending     | Start with Honor-based Enhancement Cards |
| **Shadow Touched** | Complete Low Honor ending      | Start with Dark Enhancement Cards        |

#### Cosmetic Unlocks

| Item                 | Unlock Condition           | Type              |
| -------------------- | -------------------------- | ----------------- |
| **Golden Card Back** | Win 10 runs                | Cosmetic          |
| **Bathala's Halo**   | Complete High Honor ending | Avatar Frame      |
| **Void Corruption**  | Complete Low Honor ending  | UI Theme          |
| **Sarimanok Wings**  | Play 1000 Air cards        | Victory Animation |
| **Volcano Eruption** | Play 1000 Fire cards       | Victory Animation |

### Daily & Weekly Challenges

- **Daily Run**: Fixed seed with special modifiers
- **Weekly Boss**: Rotating superboss with exclusive rewards
- **Monthly Event**: Limited-time cosmetics and Enhancement Cards
- **Seasonal Festivals**: Philippine holiday-themed events

---

## Balance Notes

### Design Philosophy

- **Skill over Luck**: Player decisions matter more than RNG
- **Multiple Strategies**: All elements should be viable
- **Honor Integration**: Moral choices affect gameplay meaningfully
- **Blockchain Enhancement**: NFTs add variety, not power

### Balancing Targets

- **Average Run Length**: 45-60 minutes
- **Win Rate**: 15-25% for new players, 40-60% for experienced
- **Hand Frequency**: Royal Flush ~0.1%, Straight Flush ~0.5%
- **Currency Ratio**: 1000 Ginto = 1 Bathala Bauble

### Difficulty Scaling

- **Act 1**: Learning curve, forgiving mistakes
- **Act 2**: Requires strategy, punishes poor decisions
- **Act 3**: Mastery required, tight resource management

---

_This document serves as the definitive reference for all gameplay mechanics and story elements in Bathala. Values may be adjusted during playtesting and balancing phases._

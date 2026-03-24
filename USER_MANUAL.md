# USER MANUAL: BATHALA

**A Filipino Mythology-Inspired Roguelike Card Game**
**Version 1.4.0 (The Diwa Restoration Update)**

---

## TABLE OF CONTENTS

1.  **Introduction** ........................................................... 3
2.  **Game Overview & Story** .......................................... 4
3.  **Installation & System Requirements** .......................... 5
4.  **Getting Started: The First Run** .................................. 7
5.  **Controls & Interface (Desktop & Mobile)** ................... 9
6.  **Combat Mechanics: The Path of Cards** ..................... 12
7.  **The Three Chapters** ................................................. 15
8.  **The Mythical Bestiary (All Enemies)** ......................... 17
9.  **Items: Relics & Act-Specific Potions** ........................ 21
10. **The DDA System: Adaptive Flow** .............................. 24
11. **Landás: The Moral Compass** ................................... 26
12. **Strategies, Tips & Troubleshooting** ........................... 28
13. **Credits & Contact Information** ................................ 30

---

## 1. INTRODUCTION

Welcome to **Bathala**! You are about to embark on a spiritual journey through the ancient, corrupted realms of the Philippines. 

In an age where the *anito* (spirits) have been silenced and the *engkanto* (enchanted beings) have twisted the natural order, you step into the role of the **Tagapagligtas**—a chosen healer and warrior tasked with restoring cosmic balance (*Kapwa*). This manual serves as your sacred guide to navigating the corrupted forests, mastering the elemental poker combat, and unmasking the Great Impostor.

---

## 2. GAME OVERVIEW & STORY

**Bathala** is a roguelike deck-building adventure that fuses traditional poker hand formation with tactical elemental RPG combat.

### The Lore
The supreme deity, **Bathala**, has vanished. In his absence, a **False Bathala** has claimed the throne—an abomination born from the perverted remains of the serpent *Ulilang Kaluluwa* and the winged spirit *Galang Kaluluwa*. This impostor has corrupted the ancient guardians (the Kapre, Bakunawa, and others), turning them into vengeful shades.

### Your Mission
Navigate through three distinct mythological realms (Acts), reclaim the **three Diwa Shards**, and confront the False Bathala. Your journey is defined by **Landás**—your moral path. Will you show mercy to the corrupted, or will you conquer them with force?

---

## 3. INSTALLATION & SYSTEM REQUIREMENTS

**Bathala** is built on the Phaser 3 engine and is optimized for modern web browsers and mobile devices.

### Recommended System Requirements
*   **Browser:** Chrome, Firefox, Safari, or Edge (Latest versions).
*   **Processor:** Dual-core 2.4GHz or better.
*   **Memory:** 4 GB RAM.
*   **Storage:** 200 MB (Web cache).
*   **Mobile:** Android 11+ or iOS 15+ recommended.

### How to Launch
1.  **Web Version:** Simply open the official game URL.
2.  **Mobile Support:** The game automatically detects touch interfaces. For the best experience, use the **Fullscreen Button** located in the top-right corner.
3.  **Local Run (Developers):** Extract the game folder, run `npm install`, then `npm run dev`. Access the game at `http://localhost:5173`.

---

## 4. GETTING STARTED: THE FIRST RUN

### The Tutorial Prologue
Your adventure begins in the **Ancestral Plane**. A guided tutorial will walk you through the core loops:
*   **Selecting Cards:** Choose up to 5 cards to form a hand.
*   **Executing Actions:** Learn when to **Attack**, **Defend**, or use your **Special** elemental ability.
*   **Discarding:** Master the art of the redraw to find the perfect hand.

### The Five-Cycle Countdown
Time in Bathala is measured in **Cycles**. 
*   **1 Cycle = 100 Actions** (50 Day / 50 Night).
*   You have **5 Cycles** to prepare before the Chapter Boss spawns.
*   **Day:** Enemies are passive. Map visibility is high.
*   **Night:** Enemies hunt you. Visibility is low, but rewards are greater.

---

## 5. CONTROLS & INTERFACE

### Desktop Controls
*   **Mouse Click:** Select/Deselect cards, navigate nodes, and activate buttons.
*   **Hover:** View detailed tooltips for status effects, enemy intents, and relic powers.
*   **Esc:** Pause the game and access Settings.

### Mobile & Touch Controls
*   **Tap:** Equivalent to Mouse Click.
*   **Tap and Hold:** View tooltips for cards and items.
*   **Fullscreen Toggle:** A dedicated button in the HUD allows you to lock the game to your screen's aspect ratio.

### The Combat Interface
1.  **The Hand (Bottom):** 8 cards drawn from your 52-card deck.
2.  **The Action Bar:** Attack, Defend, Special, and Discard buttons.
3.  **Enemy Intent (Above Enemy):** Shows what the enemy will do next (Attack, Debuff, Buff, etc.).
4.  **Status Tray:** Shows buffs like **Strength** (🔥) and **Dexterity** (💨).

---

## 6. COMBAT MECHANICS: THE PATH OF CARDS

### Poker Hand Bonuses
Your effectiveness in combat is multiplied by the strength of your poker hand. Each rank provides a base chip value (Ace/10/Face = 6-7, others 2-5).
*   **High Card:** x1.0 (+0 Bonus)
*   **Pair:** x1.2 (+3 Bonus)
*   **Two Pair:** x1.3 (+6 Bonus)
*   **Three of a Kind:** x1.5 (+10 Bonus)
*   **Straight:** x1.6 (+12 Bonus)
*   **Flush:** x1.7 (+15 Bonus)
*   **Full House:** x2.0 (+20 Bonus)
*   **Four of a Kind:** x2.2 (+25 Bonus)
*   **Straight Flush:** x2.5 (+35 Bonus)
*   **Royal Flush:** x2.8 (+40 Bonus)

### Elemental Suits & Special Actions
Each suit corresponds to an element. While **Attack** and **Defend** use your raw hand power, the **Special** action (x0.6 damage) unleashes a signature elemental debuff on the enemy:

| Suit | Element | Special Action | Elemental Effect |
| :--- | :--- | :--- | :--- |
| **Apoy** | Fire 🔥 | **Apoy Fury** | Applies **Burn** (6 damage/turn for 3 turns) |
| **Tubig** | Water 💧 | **Tubig Cascade** | Applies **Frail** (Reduces enemy block by 50%) |
| **Lupa** | Earth 🌿 | **Lupa Quake** | Applies **Vulnerable** (Enemy takes +50% damage) |
| **Hangin** | Air 💨 | **Hangin Gale** | Applies **Weak** (Enemy deals -50% damage) |

### Elemental Affinities
Enemies often have an elemental soul that reacts to your cards:
*   **Weakness (1.5x):** If you attack with an element the enemy is weak to, you deal **50% more damage**.
*   **Resistance (0.75x):** If the enemy resists your element, your damage is reduced by **25%**.

### Status Effects Reference
| Effect | Icon | Description |
| :--- | :--- | :--- |
| **Strength** | 🔥/💪 | Each stack adds **+3 damage** to your **Attack** actions. |
| **Dexterity** | 💨 | Each stack adds **+3 block** to your **Defend** actions. |
| **Vulnerable** | ⚠️ | Target takes **50% more damage** from all sources. |
| **Weak** | 📉 | Target deals **25% less damage** per stack (max 50-75% reduction). |
| **Frail** | 🧱 | Reduces **Block** gained from Defend actions by **50%**. |
| **Burn** | 🌋 | Target loses **6 HP** per turn. Stacks increase duration. |
| **Fear** | 😨 | The terror of the forest causes you to **randomly discard cards**. |
| **Stun** | 💫 | The spirit's power is overwhelming—**skip your next turn**. |
| **Seal** | 🔒 | Divine chains prevent you from using **Special** actions. |

---

## 7. THE THREE CHAPTERS

### Chapter 1: The Enchanted Forest
*   **Theme:** Lupa (Earth) and Hangin (Air).
*   **Setting:** Ancient Balete groves corrupted by rot and shadows.
*   **Goal:** Hunt the **Kapre Shade** and reclaim the Lupa Diwa Shard.

### Chapter 2: The Submerged Barangays
*   **Theme:** Tubig (Water) and Apoy (Fire).
*   **Setting:** Sunken coastal villages and volcanic trenches.
*   **Goal:** Calm the **Bakunawa** and reclaim the Tubig Diwa Shard.

### Chapter 3: The Skyward Citadel
*   **Theme:** Multi-Elemental Mastery.
*   **Setting:** Floating divine palace in the celestial clouds.
*   **Goal:** Unmask the **False Bathala** and restore the Heavens.

---

## 8. THE MYTHICAL BESTIARY (COMPLETE ENEMY LIST)

### ACT 1: THE ENCHANTED FOREST (10 ENEMIES)
**Common Creatures:**
1.  **Tikbalang Scout:** Backward-hooved trickster; confuses targeting and weakens.
2.  **Balete Wraith:** Spirit of the haunted fig; grows stronger as it takes damage.
3.  **Sigbin Charger:** Nocturnal goat-like feeder; unleashes a burst attack every 3 turns.
4.  **Duwende Trickster:** Mound-dwelling goblin; steals your Block and disrupts your draw.
5.  **Tiyanak Ambusher:** Demon baby; uses wails to cause Fear and deals critical hits.
6.  **Amomongo:** Ape-like cave dweller; fast attacks that cause Bleed.
7.  **Bungisngis:** One-eyed laughing giant; applies a laugh debuff and deals high damage.

**Elite Guardians:**
8.  **Tawong Lipod:** Invisible wind beings; uses wind-veils to stun and evade.
9.  **Mangangaway:** The Wicked Sorceress; casts hexes, poison, and weakening spells.

**Chapter Boss:**
10. **Kapre Shade:** The giant of the balete; uses cigars to poison and strengthen his strikes.

### ACT 2: THE SUBMERGED BARANGAYS (10 ENEMIES)
**Common Creatures:**
11. **Sirena Illusionist:** Enchanting mermaid; heals allies and charms the player.
12. **Siyokoy Raider:** Webbed sea predator; possesses high armor and splash damage.
13. **Santelmo Flicker:** Ghostly fire spirit; dances with high dodge and applies Burn.
14. **Berberoka Lurker:** Swamp giant; banishes cards from your hand into the depths.
15. **Magindara Swarm:** Vicious sirens; adaptive hunters that attack in quick successions.
16. **Kataw:** Merman king; summons sea minions and heals his court.
17. **Berbalang:** Astral ghoul; detaches its spirit to weaken your deck.

**Elite Guardians:**
18. **Sunken Bangkilan:** Shape-shifting sea witch; disrupts hands and shifts elements.
19. **Apoy-Tubig Fury:** Elemental manifestation; creates a clash of fire and water damage.

**Chapter Boss:**
20. **Bakunawa:** The Great Moon-Eater; devours your relics and weakens your resolve.

### ACT 3: THE SKYWARD CITADEL (10 ENEMIES)
**Common Creatures:**
21. **Tigmamanukan Watcher:** Prophetic bird; grows in strength with every passing turn.
22. **Diwata Sentinel:** Nature goddess guardian; counters elemental moves with ease.
23. **Sarimanok Keeper:** Bird of fortune; nullifies special actions and buffs itself.
24. **Bulalakaw Flamewings:** Meteor spirit; rains down burning strikes and meteor blurs.
25. **Minokawa Harbinger:** Giant eclipse bird; steals your potions and evades in the air.
26. **Alan:** Winged forest spirit; dives from the sky to summon avian swarms.
27. **Ekek:** Nocturnal bird vampire; drains your health and evades attacks.

**Elite Guardians:**
28. **Ribung Linti Duo:** Twin lightning spirits; share damage and strike in tandem.
29. **Apolaki Godling:** Manifestation of the Sun God; challenges you with radiant fire.

**Chapter Boss:**
30. **False Bathala:** The Great Impostor; the ultimate fusion that nullifies all bonuses.

---

## 9. ITEMS: RELICS & ACT-SPECIFIC POTIONS

### Relics (Passives)
You can carry up to **6 Relics**. Examples include:
*   **Agimat of Swift Wind:** +1 Discard charge.
*   **Babaylan's Talisman:** Treats hands as one tier higher.
*   **Tikbalang's Hoof:** 10% Dodge chance.

### Act-Specific Potions (Actives)
Potions are now themed after the creatures of each act:
*   **Act 1:** *Healing Potion*, *Potion of Clarity* (Draw 3), *Elixir of Fortitude* (+15 Block).
*   **Act 2:** *Sirena Melody* (Heal), *Santelmo Spark* (Burn All), *Bakunawa Eclipse* (25 DMG).
*   **Act 3:** *Tigmamanukan Omen* (Draw 3), *Apolaki Sun* (Heal 25), *Coconut Sap* (Heal & Cleanse).

---

## 10. THE DDA SYSTEM: ADAPTIVE FLOW

Bathala uses a **Rule-Based Dynamic Difficulty Adjustment** system to ensure players remain in a state of "Flow."

*   **Calibration Phase:** The first 3 combats of a run are used to calculate your **PPS (Player Performance Score)**.
*   **Tiers:** The game shifts between **Struggling, Learning, Thriving, and Mastering**.
*   **Adjustments:**
    *   **Struggling:** Enemies have -20% HP/DMG. Shop prices are 20% cheaper.
    *   **Mastering:** Enemies have +15% HP/DMG and use more complex AI patterns.
*   **Transparency:** You can see the effects of DDA through in-game narrative cues and enemy behavior changes.

---

## 11. LANDÁS: THE MORAL COMPASS

Your choices after combat determine your **Landás Score**.
*   **Spare (Mercy):** Increases Spirit Fragment rewards (used for permanent meta-upgrades).
*   **Slay (Conquest):** Increases Gold (Ginto) rewards for the current run.
*   **Endings:** Your total score at the end of Chapter 3 determines the game's finale:
    *   **Daan ng Awa (Mercy):** Restoration of light.
    *   **Daan ng Panlulupig (Conquest):** A cold, empty throne.
    *   **Daan ng Timbang (Balance):** The eternal turning of the world.

---

## 12. STRATEGIES & TROUBLESHOOTING

### Pro-Tips
1.  **Thin Your Deck:** Use Rest Sites to **Purify** (remove) low-value cards (2s, 3s, 4s). A smaller deck means more consistent Aces and Kings.
2.  **Element Matching:** Align your Special actions with your relics. An "Apoy" focused deck with the *Ancestral Blade* relic is devastating.
3.  **Night Pacing:** Only take Elite fights at Night if you have a full health bar and a powerful potion.

### Troubleshooting
*   **Game won't load:** Hard refresh the page, then make sure JavaScript is enabled in your browser settings.
*   **Lag on mobile:** Close background apps, switch to a stable connection, and use Fullscreen mode for smoother performance.

---

## 13. CREDITS & CONTACT

**Developed by:** Devlocke
**Based on the Research of:** F.L. Jocano, D.L. Eugenio, and M.D. Ramos.
**Special Thanks:** 
*   **Nitten Nair** of **Mythlok** for mythological guidance.
*   **Aylmer** of **Y Realm Studios** for industry insights and support.
*   **The Aswang Project** for archival references.

**Official Website:** [bathala.quest](https://bathala.quest)
**Play the Game:** [play.bathala.quest](https://play.bathala.quest)
**Community:** Follow us on [Facebook](https://www.facebook.com/playbathala)

*Copyright © 2026 Devlocke. All rights reserved.*

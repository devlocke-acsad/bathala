# Bathala: Master Test Cases Document

This document contains the comprehensive test cases for all main features of **Bathala**, updated to reflect the latest mechanics including the revised DDA system, Relic Discarding, Mobile Support, Elemental Affinities, and Status Effects.

| Test Case ID | Test Case | Pre-Condition | Test Steps | Expected Result | Actual Result | Remarks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. OVERWORLD & NAVIGATION** | | | | | | |
| **NAV-001** | Verify adjacent node navigation | Player is on the Overworld map | 1. Click on an adjacent, connected node. | Player sprite moves to the node; corresponding event/combat triggers. | | |
| **NAV-002** | Verify blocked path prevention | Player is on the Overworld map | 1. Click on a node obscured by fog of war or not connected. | Movement is blocked; no tooltip is displayed for obscured nodes. | | |
| **NAV-003** | Verify Day to Night transition | Player is in Day phase | 1. Perform actions until the 50-action threshold is hit. | Visuals shift to Night; enemies become aggressive; transition text displays. | | |
| **NAV-004** | Verify Chapter Boss spawn | Player is in Chapter 1 | 1. Accumulate ~500 total actions (5 full day/night cycles). | The Chapter Boss node spawns; Boss preparation mechanics activate. | | |
| **NAV-005** | Verify Event uniqueness | Player on Overworld map | 1. Encounter a specific narrative Event. 2. Attempt to encounter it again. | The event is marked as encountered and does not replay in the same run. | | |
| **2. COMBAT & POKER MECHANICS** | | | | | | |
| **CBT-001** | Verify Poker Hand bonuses | Hand selection phase | 1. Select a valid hand (e.g., Flush, Pair). 2. Play hand. | System accurately calculates the hand tier and applies the correct base bonus. | | |
| **CBT-002** | Verify Discard charge consumption | Hand selection phase | 1. Select up to 5 cards. 2. Click Discard. | Selected cards are replaced; 1 Discard Charge is consumed. | | |
| **CBT-003** | Verify Elemental Weakness Multiplier | Combat against an enemy weak to Apoy (Fire) | 1. Play an Attack with Apoy dominant suit. | Attack damage is multiplied by 1.5x against the target. | | |
| **CBT-004** | Verify Elemental Resistance Multiplier | Combat against an enemy resistant to Lupa (Earth) | 1. Play an Attack with Lupa dominant suit. | Attack damage is multiplied by 0.75x against the target. | | |
| **CBT-005** | Verify Potion usage | In combat | 1. Click a valid Potion in the UI. | Potion effect applies immediately; item is consumed and removed from UI. | | |
| **3. COMBAT STATUS EFFECTS** | | | | | | |
| **STS-001** | Verify Burn & Poison | Target has Burn or Poison | 1. Start target's turn. | Target takes 2 damage per stack; effect loses 1 stack. | | |
| **STS-002** | Verify Regeneration | Target has Regeneration | 1. Start target's turn. | Target heals 2 HP per stack; effect loses 1 stack. | | |
| **STS-003** | Verify Plated Armor | Target has Plated Armor | 1. Start target's turn. | Target gains 3 Block per stack; effect loses 1 stack. | | |
| **STS-004** | Verify Weak | Target has Weak | 1. Target plays an Attack action. | Attack deals 25% less damage per stack. | | |
| **STS-005** | Verify Vulnerable | Target has Vulnerable | 1. Target receives an Attack. | Target takes 50% more damage from the attack. | | |
| **STS-006** | Verify Frail | Target has Frail | 1. Target plays a Defend action. | Defend action grants 25% less block per stack. | | |
| **STS-007** | Verify Strength | Target has Strength | 1. Target plays an Attack action. | Attack deals +3 additional damage per stack. | | |
| **STS-008** | Verify Ritual | Target has Ritual | 1. End target's turn. | Target gains Strength equal to its Ritual stacks. | | |
| **4. LANDÁS (MORALITY) SYSTEM** | | | | | | |
| **LND-001** | Verify Spare action | Combat Victory screen | 1. Select "Spare". | Player alignment gains +1 Mercy; specific drops (Fragments) are favoured. | | |
| **LND-002** | Verify Slay action | Combat Victory screen | 1. Select "Slay". | Player alignment gains -1 Conquest; specific drops (Gold) are favoured. | | |
| **LND-003** | Verify Choice UI Rendering | Combat Victory screen | 1. Defeat an enemy. | The Mercy/Conquest Choice UI displays without text overflow or layout issues. | | |
| **5. DYNAMIC DIFFICULTY ADJUSTMENT (DDA)** | | | | | | |
| **DDA-001** | Verify Calibration Period | New Run Started | 1. Complete the first 3 combats. | DDA tier remains locked at `learning` during calibration, but PPS tracks. | | |
| **DDA-002** | Verify PPS updates accurately | Post-Calibration Combat | 1. Win combat with >90% Health and no damage taken. | PPS significantly increases due to Health Retention and Perfect Combat bonuses. | | |
| **DDA-003** | Verify Resource & Clutch Bonus | Post-Calibration Combat | 1. Start combat with <50% HP. 2. Use <15% of max discards. 3. Win. | PPS receives Clutch bonus and Resource efficiency bonus. | | |
| **DDA-004** | Verify Tier 0 (Struggling) effects | PPS drops below 1.3 | 1. Enter a new combat. 2. Check Shop. | Enemy HP/DMG scales to 0.8x; AI complexity to 0.5x. Shop prices drop to 0.8x. | | |
| **DDA-005** | Verify Tier 5 (Mastering) effects | PPS rises above 4.2 | 1. Enter a new combat. 2. Check Shop. | Enemy HP/DMG scales to 1.15x; AI complexity to 1.5x. Shop prices rise to 1.2x. | | |
| **6. DECK-SCULPTING & PROGRESSION** | | | | | | |
| **DCK-001** | Verify Purify action | Shop node | 1. Select Purify. 2. Choose a card. 3. Confirm. | Gold is deducted; selected card is permanently removed from the deck. | | |
| **DCK-002** | Verify Attune action | Rest node | 1. Select Attune. 2. Choose a card. | Card value is permanently upgraded; Rest node is consumed. | | |
| **DCK-003** | Verify Infuse action | Post-Elite Reward | 1. Select Infuse. 2. Select a new card. | Selected card is permanently added to the player's deck. | | |
| **7. ITEMS (RELICS & POTIONS)** | | | | | | |
| **ITM-001** | Verify passive relic functionality | Player has a specific relic | 1. Enter combat. | Relic effect (e.g., +1 Discard charge, persistent block) automatically applies. | | |
| **ITM-002** | Verify Relic Discard for Gold/HP | Player has max (6) Relics | 1. Obtain a 7th Relic. 2. Choose to discard the new Relic. | Relic is discarded; Player receives Ginto (Gold) and recovers HP. | | |
| **ITM-003** | Verify Tooltip Display | Player in Overworld/Combat | 1. Hover over a Relic or Potion icon. | Description tooltip appears accurately positioned without text overflow. | | |
| **8. BOSS ENCOUNTERS** | | | | | | |
| **BOS-001** | Verify Chapter 1 Boss: Kapre | Combat vs Kapre | 1. Progress to end of Chapter 1. 2. Trigger Boss. | Kapre spawns and utilizes AoE Burn and minion summoning mechanics. | | |
| **BOS-002** | Verify Chapter 2 Boss: Bakunawa | Combat vs Bakunawa | 1. Progress to end of Chapter 2. 2. Trigger Boss. | Bakunawa executes Lunar Eclipse phase, devouring player relics temporarily. | | |
| **BOS-003** | Verify Chapter 3 Boss: False Bathala | Combat vs False Bathala | 1. Progress to end of Chapter 3. 2. Trigger Boss. | Boss utilizes Divine Judgment, nullifying hand bonuses and shifting alignments. | | |
| **9. META-PROGRESSION & DISCOVER** | | | | | | |
| **META-001** | Verify Spirit Fragment saving | Player finishes a run | 1. Return to Main Menu. | Earned Spirit Fragments are accurately credited to the meta-currency total. | | |
| **META-002** | Verify Mythical Compendium (Discover) | Main Menu | 1. Open Discover menu. 2. Browse Chapters. | Encountered enemies display correctly centered sprites and unlocked lore. | | |
| **META-003** | Verify Ancestral Memories unlock | Meta-Progression tree | 1. Purchase +Max HP memory. 2. Start a new run. | New run initializes with the upgraded Max HP limit active. | | |
| **10. SYSTEM & UI/UX** | | | | | | |
| **SYS-001** | Verify 16:9 Aspect Ratio Lock | Any Scene | 1. Resize browser window. | Game viewport maintains strictly constrained 16:9 aspect ratio scaling. | | |
| **SYS-002** | Verify Mobile Android Controls | Mobile Device / Emulator | 1. Load game. 2. Tap Fullscreen button. | Game enters fullscreen mode seamlessly; touch controls register accurately. | | |

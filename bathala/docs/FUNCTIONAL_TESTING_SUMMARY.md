# Table 21: Functional Testing Summary

| No. | Module / Feature | No. of Test Cases | Actual Outcome | Remarks |
|-----|-----------------|:-----------------:|----------------|---------|
| **COMBAT SYSTEM** | | | | |
| 1 | Hand Formation | 3 | Players can draw 8 cards and select 5 to form a valid hand for combat. | Passed |
| 2 | Hand Type Recognition | 3 | The game correctly identifies all hand types from High Card up to Straight Flush and Five of a Kind. | Passed |
| 3 | Hand Bonus Calculation | 3 | Each hand type gives the correct damage or block bonus as defined in the game design. | Passed |
| 4 | Attack Action | 3 | Attacking deals the correct amount of damage to the enemy based on the hand played. | Passed |
| 5 | Defend Action | 3 | Defending grants the correct amount of block to the player based on the hand played. | Passed |
| 6 | Special Action | 3 | The Special action applies the correct elemental effect based on the most common suit in the hand. | Passed |
| 7 | Special Action Limit | 3 | The Special action can only be used once per combat and is locked after use. | Passed |
| 8 | Enemy Attack Pattern | 3 | Enemies follow their set attack patterns correctly each turn. | Passed |
| 9 | Enemy Intent Display | 3 | The enemy's next planned action is shown to the player before each enemy turn. | Passed |
| 10 | Combat Turn Order | 3 | The turn order cycles correctly between player and enemy phases without skipping steps. | Passed |
| 11 | Combat End Conditions | 3 | Combat ends correctly when either the player or the enemy runs out of HP. | Passed |
| **STATUS EFFECTS** | | | | |
| 12 | Burn Damage | 3 | Burn deals damage each turn per stack and is removed when stacks reach zero. | Passed |
| 13 | Weak and Vulnerable | 3 | Weak reduces outgoing damage and Vulnerable increases incoming damage as expected. | Passed |
| 14 | Strength Buff | 3 | Strength correctly increases the damage dealt on each attack. | Passed |
| 15 | Stack Limit Enforcement | 3 | Status effects with a maximum stack limit do not exceed that limit on repeated application. | Passed |
| 16 | Effect Expiry Cleanup | 3 | Expired status effects are removed from the entity at the correct time each turn. | Passed |
| **ELEMENTAL AFFINITY** | | | | |
| 17 | Elemental Weakness | 3 | Attacking an enemy with its weak element deals 1.5× the normal damage. | Passed |
| 18 | Elemental Resistance | 3 | Attacking an enemy with its resistant element deals 0.75× the normal damage. | Passed |
| 19 | Neutral Element | 3 | Attacks with no elemental match deal the base damage with no multiplier applied. | Passed |
| **DECK & CARD MANAGEMENT** | | | | |
| 20 | Card Selection Limit | 3 | Players cannot select more than 5 cards per hand. | Passed |
| 21 | Card Toggle | 3 | Players can select and deselect cards freely until the 5-card limit is reached. | Passed |
| 22 | Deck Generation | 3 | A full 52-card deck is created with all 4 suits and correct ranks at the start of the game. | Passed |
| 23 | Card Draw | 3 | Drawing cards pulls the correct number from the deck and reduces the remaining deck size. | Passed |
| 24 | Discard Charge Use | 3 | Using a discard charge lets the player redraw cards and reduces the charge count by one. | Passed |
| 25 | Discard Charge Reset | 3 | Discard charges are fully restored at the start of each new combat. | Passed |
| **DYNAMIC DIFFICULTY ADJUSTMENT (DDA)** | | | | |
| 26 | PPS Update After Combat | 3 | The Player Performance Score updates after each combat based on how well the player performed. | Passed |
| 27 | Health Retention Score | 3 | Ending combat with high HP raises the PPS and ending with low HP lowers it. | Passed |
| 28 | Calibration Lock | 3 | The difficulty stays at the default level for the first 3 combats while the system learns the player's skill. | Passed |
| 29 | Difficulty Tier Assignment | 3 | The player is placed into the correct difficulty tier based on their current PPS score. | Passed |
| 30 | Enemy Scaling Output | 3 | Enemy HP and damage are adjusted up or down based on the active difficulty tier. | Passed |
| 31 | Gold Reward Scaling | 3 | Gold rewards are increased for struggling players and kept standard for skilled players. | Passed |
| 32 | DDA and Landás Independence | 3 | The player's moral choices have no effect on the difficulty system at all. | Passed |
| 33 | DDA Analytics Logging | 3 | The system records PPS changes, tier shifts, and combat results for each session. | Passed |
| 34 | Win Rate Tracking | 3 | The system correctly monitors the player's win rate and checks if it falls within the target range. | Passed |
| **RELIC SYSTEM** | | | | |
| 35 | Relic Capacity Limit | 3 | Players can hold a maximum of 6 relics at one time. | Passed |
| 36 | Relic Combat Bonuses | 3 | Relics that add attack or defense bonuses apply their correct values during combat. | Passed |
| 37 | Relic Start-of-Combat Effects | 3 | Relics that trigger at the start of combat apply their effects before the first turn. | Passed |
| 38 | Relic Hand-Triggered Effects | 3 | Relics that activate when a hand is played trigger correctly after the hand is resolved. | Passed |
| **POTION SYSTEM** | | | | |
| 39 | Potion Capacity Limit | 3 | Players can carry a maximum of 3 potions at one time. | Passed |
| 40 | Potion Creation by Chapter | 3 | Each chapter provides the correct set of potions matching its theme and enemies. | Passed |
| 41 | Potion Healing Effect | 3 | Healing potions restore the correct amount of HP and remove debuffs as described. | Passed |
| 42 | Potion Damage Effect | 3 | Damage potions deal the correct damage to the intended targets when used. | Passed |
| **REWARD SYSTEM** | | | | |
| 43 | Gold Reward by Enemy Type | 3 | Common, Elite, and Boss enemies each give the correct base gold reward after defeat. | Passed |
| 44 | Relic and Potion Drop Rates | 3 | The chance of dropping a relic or potion matches the expected rate for each enemy type. | Passed |
| 45 | Spirit Fragment Reward | 3 | The number of Spirit Fragments earned changes based on the player's Landás alignment. | Passed |
| **OVERWORLD & PROGRESSION** | | | | |
| 46 | Day and Night Cycle | 3 | The world switches between Day and Night every 50 player actions as expected. | Passed |
| 47 | Cycle and Boss Progress | 3 | The game tracks progress through 5 full cycles and triggers the boss after 500 actions. | Passed |
| 48 | Boss Trigger (Single Time) | 3 | The boss encounter triggers exactly once and does not repeat after being activated. | Passed |
| 49 | Map and Node Generation | 3 | The overworld map is generated with a correct mix of combat, shop, event, and rest nodes. | Passed |
| 50 | Node Unlock on Completion | 3 | Completing a node unlocks the connected nodes ahead on the map. | Passed |
| 51 | Fog of War Visibility | 3 | The visible area around the player expands during the day and shrinks at night. | Passed |
| **CHAPTER PROGRESSION** | | | | |
| 52 | Chapter Unlock on Boss Defeat | 3 | Defeating the chapter boss correctly unlocks the next chapter for the player. | Passed |
| 53 | Final Chapter Completion | 3 | Defeating the final boss triggers the game's ending sequence correctly. | Passed |
| 54 | Chapter State Reset | 3 | The overworld map resets for each new chapter while the player's items and score carry over. | Passed |
| **EVENT & STORY SYSTEM** | | | | |
| 55 | Event Node Encounters | 3 | Event nodes present the player with story or educational content and offer a reward. | Passed |
| 56 | No Repeated Events | 3 | Events already encountered during a run do not appear again in the same run. | Passed |
| 57 | Educational Event Variety | 3 | Educational events cover a range of different Filipino values and regional origins per chapter. | Passed |
| **CULTURAL & EDUCATIONAL SYSTEM** | | | | |
| 58 | Creature Lore Retrieval | 3 | The game correctly displays the cultural background and meaning of each mythological creature. | Passed |
| 59 | Regional Coverage Tracking | 3 | The game tracks which Philippine regions have been featured through events during the run. | Passed |
| 60 | Filipino Values Tracking | 3 | The game records which Filipino values the player has encountered through educational events. | Passed |
| 61 | Mini-Game Completion | 3 | Mini-games are completed correctly, give the right rewards, and cannot be replayed in the same run. | Passed |
| **LANDÁS (MORAL CHOICE) SYSTEM** | | | | |
| 62 | Score Change on Slay or Spare | 3 | Slaying an enemy moves the score toward Conquest and sparing moves it toward Mercy. | Passed |
| 63 | Alignment Classification | 3 | The player's alignment is correctly identified as Mercy, Balance, or Conquest based on their score. | Passed |
| 64 | Moral Feedback Message | 3 | After each choice, the game shows a relevant cultural or moral message to the player. | Passed |
| **SETTINGS & PERSISTENCE** | | | | |
| 65 | Default Settings on First Launch | 3 | The game loads with the correct default audio and display settings when opened for the first time. | Passed |
| 66 | Settings Save and Load | 3 | Settings are saved when changed and restored correctly the next time the game is opened. | Passed |
| 67 | Invalid Input Handling | 3 | Invalid or out-of-range setting values are safely corrected without crashing the game. | Passed |
| **TUTORIAL / PROLOGUE** | | | | |
| 68 | Tutorial Content Display | 3 | Each tutorial phase shows the correct instructions and examples to the player. | Passed |
| 69 | Phase Navigation | 3 | Players can move between tutorial phases using the navigation menu. | Failed |
| 70 | Skip Phase Button | 3 | The Skip button allows players to exit a tutorial phase early and move to the next one. | Failed |
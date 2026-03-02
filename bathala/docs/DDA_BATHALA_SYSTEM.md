# Bathala Dynamic Difficulty Adjustment (DDA)

This document explains how Bathala's DDA currently works in runtime, when it starts, what data it uses, and what systems it affects.

---

## 1) Purpose

Bathala's DDA adjusts challenge based on **recent combat performance** so players who struggle receive relief while strong players receive tighter challenge.

The core system is implemented in:

- `src/core/dda/RuleBasedDDA.ts`
- `src/core/dda/DDAConfig.ts`
- `src/core/dda/DDATypes.ts`

Runtime combat integration lives in:

- `src/game/scenes/combat/CombatDDA.ts`
- `src/game/scenes/Combat.ts`

---

## 2) When DDA starts and resets

### Session start

- DDA uses a singleton (`RuleBasedDDA.getInstance()`).
- New runs reset DDA in `MainMenu` when Play is pressed.

### Calibration period

Default config:

- `calibration.enabled = true`
- `calibration.combatCount = 3`
- `trackPPSDuringCalibration = true`

Behavior:

- First 3 combats are calibration.
- PPS is still tracked during calibration.
- Tier is forced to `learning` until calibration ends.

### Reset points

DDA session is reset at:

- New run start from main menu.
- Chapter transition reset flow.

---

## 3) Core model

## Player Performance Score (PPS)

- Range: `0.0` to `5.0`
- Starts at `2.5`
- Updated after each combat (`processCombatResults`).

### Tier thresholds (current default)

- `struggling`: `0.0 - 1.3`
- `learning`: `1.3 - 2.8`
- `thriving`: `2.8 - 4.2`
- `mastering`: `4.2 - 5.0`

Tier classification uses ordered upper-bound checks to avoid dead boundary gaps.

---

## 4) Combat signals used to update PPS

The DDA evaluates these factors per combat:

1. Health retention (primary)
2. Perfect combat bonus (no damage received)
3. Best hand quality reached
4. Turn efficiency (tier-aware expectations)
5. Damage efficiency ratio
6. Resource efficiency (discard usage)
7. Clutch bonus (good play from low starting HP)
8. Comeback momentum (low PPS recovery support)

Additional stabilizers:

- **Encounter weighting**:
  - common: `1.0`
  - elite: `1.1`
  - boss: `1.2`
- **Per-combat PPS clamp**:
  - struggling: `[-0.5, +0.8]`
  - learning: `[-0.5, +0.6]`
  - thriving: `[-0.5, +0.6]`
  - mastering: `[-0.6, +0.5]`

Resource efficiency trigger is strict:

- bonus only if discard efficiency is `>= 0.85`.

---

## 5) Mathematical formulas used

This section lists the formulas implemented in `RuleBasedDDA`.

### 5.0 Symbol table (global)

These symbols appear repeatedly across formulas:

- `PPS`: Player Performance Score in range `[0, 5]`.
- `delta_pps`: final per-combat PPS change after weighting and clamp.
- `bonusMultiplier`: tier-specific scaling for positive contributions.
- `penaltyMultiplier`: tier-specific scaling for negative contributions.
- `turnCount`: number of turns elapsed in the combat.
- `expectedTurns`: tier-dependent expected turn budget for the encounter.
- `healthPercentage`: end-combat health ratio (`endHealth / startMaxHealth` in current metric pipeline).
- `startHealth`, `startMaxHealth`: player HP values at combat start.
- `damageDealt`, `damageReceived`: total damage values recorded for the combat.
- `discardsUsed`, `maxDiscardsAvailable`: discard usage and discard budget in the combat.
- `enemyStartHealth`: enemy HP at combat start (post any pre-combat stat scaling).
- `victory`: boolean indicating combat win/loss.
- `W_encounter`: encounter type weight (`common`, `elite`, `boss`).
- `clamp(x, a, b)`: bound `x` to interval `[a, b]`.
- `round(x)`: nearest integer rounding used for applied gameplay values.

### 5.1 PPS state update

Description:

- Updates the player's performance score after each combat and keeps it bounded to a valid interval.

- Raw update:
  - `PPS_raw_next = PPS_current + delta_pps`
- Clamped update:
  - `PPS_next = clamp(PPS_raw_next, 0, 5)`
  - `clamp(x, a, b) = min(max(x, a), b)`

Variables:

- `PPS_current`: current player performance score before this combat update.
- `delta_pps`: final PPS delta computed from all performance components.
- `PPS_raw_next`: unconstrained PPS after adding delta.
- `PPS_next`: constrained PPS used by the system.
- `x`: value being clamped.
- `a`: lower clamp bound (`0`).
- `b`: upper clamp bound (`5`).

### 5.2 Tier classification

Description:

- Maps continuous PPS to one discrete difficulty tier.
- Uses ordered upper bounds so there are no unreachable PPS gaps between tiers.

Using ordered upper bounds:

- if `PPS <= 1.3` -> `struggling`
- else if `PPS <= 2.8` -> `learning`
- else if `PPS <= 4.2` -> `thriving`
- else -> `mastering`

Variables:

- `PPS`: clamped current performance score used for tier mapping.

### 5.3 Overall PPS delta construction

Description:

- Combines all combat-performance components into a base delta.
- Adjusts this delta by encounter tier (common/elite/boss).
- Applies a per-tier stability clamp to prevent extreme single-combat swings.

- Base total:
  - `delta_base = H + HQ + E + DE + R + C + M`
    - `H`: health-retention component
    - `HQ`: hand-quality component
    - `E`: turn-efficiency component
    - `DE`: damage-efficiency component
    - `R`: resource-efficiency component
    - `C`: clutch component
    - `M`: comeback component
- Encounter weighting:
  - `delta_weighted = delta_base * W_encounter`
  - `W_encounter = 1.0 (common), 1.1 (elite), 1.2 (boss)`
- Tier stability clamp:
  - `delta_pps = clamp(delta_weighted, tier_min_delta, tier_max_delta)`

Current per-tier delta clamps:

- struggling: `[-0.5, +0.8]`
- learning: `[-0.5, +0.6]`
- thriving: `[-0.5, +0.6]`
- mastering: `[-0.6, +0.5]`

Variables:

- `delta_base`: sum of all performance components before weighting.
- `H`: health-retention component.
- `HQ`: hand-quality component.
- `E`: turn-efficiency component.
- `DE`: damage-efficiency component.
- `R`: resource-efficiency component.
- `C`: clutch-performance component.
- `M`: comeback component.
- `delta_weighted`: base delta after encounter scaling.
- `W_encounter`: encounter weight based on enemy type.
- `tier_min_delta`: minimum allowed per-combat delta for current tier.
- `tier_max_delta`: maximum allowed per-combat delta for current tier.
- `delta_pps`: final delta applied to PPS.

### 5.4 Health retention component

Description:

- Rewards strong health preservation and penalizes low end-of-combat health.
- Adds a perfect-combat bonus when no damage is taken.
- Applies tier-dependent scaling (bonus or penalty multiplier).

Let `S_tier` be tier scaling:

- If component is a bonus: multiply by `bonusMultiplier`
- If component is a penalty: multiply by `penaltyMultiplier`

Health bracket contribution before scaling:

- if `healthPercentage >= 0.9`: `excellentHealthBonus`
- else if `>= 0.7`: `goodHealthBonus`
- else if `>= 0.5`: `0`
- else if `>= 0.3`: `moderateHealthPenalty`
- else: `poorHealthPenalty`

Perfect-combat add-on:

- if `damageReceived == 0`: add `perfectCombatBonus`

Final:

- `H = (health_bracket + perfect_bonus_if_any) * S_tier(sign)`

Variables:

- `H`: final health-retention contribution to PPS.
- `healthPercentage`: `endHealth / startMaxHealth` at end of combat (runtime metric field).
- `health_bracket`: bracket-based base value from HP thresholds.
- `perfect_bonus_if_any`: `perfectCombatBonus` if `damageReceived == 0`, else `0`.
- `S_tier(sign)`: tier scaling factor selected by sign:
  - use `bonusMultiplier` if subtotal is positive,
  - use `penaltyMultiplier` if subtotal is negative.
- `damageReceived`: total HP lost by player in this combat.

### 5.5 Hand quality component

Description:

- Rewards skill expression when player reaches high-quality poker hands.
- No penalty is applied here for weak hands; it is bonus-only.

Let `Q = HAND_QUALITY_SCORES[bestHandAchieved]`.

- if `Q >= score(four_of_a_kind)`: `HQ = excellentHandBonus * bonusMultiplier`
- else if `Q >= score(straight)`: `HQ = goodHandBonus * bonusMultiplier`
- else `HQ = 0`

Variables:

- `HQ`: hand-quality contribution to PPS.
- `Q`: numeric score for `bestHandAchieved`.
- `bestHandAchieved`: strongest hand type achieved in the combat.
- `score(four_of_a_kind)`: threshold score for excellent-hand bonus.
- `score(straight)`: threshold score for good-hand bonus.
- `bonusMultiplier`: current tier's positive-signal scaling factor.

### 5.6 Turn efficiency component

Description:

- Compares actual turn count against tier-specific expectations.
- Fast clears receive bonus; very slow clears receive penalty.

For each tier there are expected thresholds:

- `expectedTurns`, `efficientTurns`, `inefficientTurns`

Contribution:

- if `turnCount <= efficientTurns`:
  - `E = efficientCombatBonus * bonusMultiplier`
- else if `turnCount > inefficientTurns`:
  - `E = inefficientCombatPenalty * penaltyMultiplier`
- else `E = 0`

Variables:

- `E`: turn-efficiency contribution to PPS.
- `turnCount`: total turns spent in combat.
- `expectedTurns`: reference turn budget for current tier.
- `efficientTurns`: fast-clear threshold for bonus.
- `inefficientTurns`: slow-clear threshold for penalty.
- `efficientCombatBonus`: configured positive value for efficient wins.
- `inefficientCombatPenalty`: configured negative value for inefficient wins.
- `bonusMultiplier`: tier bonus scaling.
- `penaltyMultiplier`: tier penalty scaling.

### 5.7 Damage efficiency component

Description:

- Measures damage throughput relative to expected enemy HP-per-turn pace.
- High ratio is rewarded; low ratio is penalized.

- `damagePerTurn = damageDealt / max(1, turnCount)`
- `expectedEnemyHPPerTurn = enemyStartHealth / max(1, expectedTurns)`
- `damageEfficiencyRatio = damagePerTurn / expectedEnemyHPPerTurn`

Contribution:

- if `damageEfficiencyRatio >= 1.3`:
  - `DE = highDamageEfficiencyBonus * bonusMultiplier`
- else if `damageEfficiencyRatio <= 0.7`:
  - `DE = lowDamageEfficiencyPenalty * penaltyMultiplier`
- else `DE = 0`

Variables:

- `DE`: damage-efficiency contribution to PPS.
- `damageDealt`: total damage dealt to enemy during combat.
- `turnCount`: total turns in combat.
- `enemyStartHealth`: enemy HP at combat start (after any pre-combat scaling).
- `expectedTurns`: tier reference turns (same variable used in turn efficiency).
- `damagePerTurn`: realized average output per turn.
- `expectedEnemyHPPerTurn`: expected output needed per turn for tier pace.
- `damageEfficiencyRatio`: normalized throughput ratio.
- `highDamageEfficiencyBonus`: configured bonus constant.
- `lowDamageEfficiencyPenalty`: configured penalty constant.

### 5.8 Resource efficiency component

Description:

- Rewards conservative discard usage.
- Trigger is strict to avoid granting easy bonus in normal play.

- `discardEfficiency = 1 - (discardsUsed / max(1, maxDiscardsAvailable))`

Contribution:

- if `discardEfficiency >= 0.85`:
  - `R = resourceEfficiencyBonus * bonusMultiplier`
- else `R = 0`

Variables:

- `R`: resource-efficiency contribution to PPS.
- `discardsUsed`: total discards spent in combat.
- `maxDiscardsAvailable`: total possible discards for that combat context.
- `discardEfficiency`: normalized conservation score in `[0, 1]` (can be lower if overspent).
- `resourceEfficiencyBonus`: configured reward for efficient discard usage.
- `bonusMultiplier`: tier bonus scaling.

### 5.9 Clutch component (low-start HP context)

Description:

- Adds bonus when player performs well from a disadvantaged HP start.
- Helps recognize "good play under pressure" rather than only absolute outcomes.

- `startRatio = startHealth / startMaxHealth`
- active only if `startRatio < 0.5`
- `disadvantage = 1 - 2 * startRatio`

Contribution:

- if `healthPercentage >= startRatio`:
  - `C = 0.2 * disadvantage * bonusMultiplier`
- else if `victory == true`:
  - `C = 0.15 * disadvantage * bonusMultiplier`
- else `C = 0`

Variables:

- `C`: clutch-performance contribution to PPS.
- `startHealth`: player HP at combat start.
- `startMaxHealth`: player max HP at combat start.
- `startRatio`: start-health ratio.
- `disadvantage`: scaled low-HP disadvantage factor (`0` at 50%, `1` near 0%).
- `healthPercentage`: end-of-combat HP ratio metric.
- `victory`: boolean combat outcome.
- `bonusMultiplier`: tier bonus scaling.

### 5.10 Comeback component

Description:

- Provides controlled momentum assistance when player is in low PPS range.
- Applies only if current combat trend is already positive.

Active only if:

- `comebackBonus.enabled == true`
- `PPS_current < comebackBonus.ppsThreshold`
- `delta_so_far > 0`

Formula:

- `M_base = bonusPerVictory`
- `M_streak = min(consecutiveVictories * consecutiveWinBonus, maxConsecutiveBonus)`
- `M = M_base + M_streak`

Variables:

- `M`: comeback contribution to PPS.
- `comebackBonus.enabled`: config toggle for comeback system.
- `PPS_current`: PPS before applying this combat update.
- `comebackBonus.ppsThreshold`: max PPS where comeback is allowed.
- `delta_so_far`: subtotal delta before comeback is applied.
- `M_base`: base comeback reward per positive combat.
- `bonusPerVictory`: configured base comeback value.
- `consecutiveVictories`: tracked current win streak count.
- `consecutiveWinBonus`: configured per-streak increment.
- `maxConsecutiveBonus`: hard cap on streak-derived comeback bonus.
- `M_streak`: capped streak bonus term.

### 5.11 Runtime stat/economy scaling formulas

Description:

- Converts DDA multipliers into actual gameplay values at integration points.
- Uses rounding so displayed/applied values are integer-friendly in combat/economy UI.

At application points:

- Enemy HP:
  - `enemyMaxHP_applied = round(enemyMaxHP_base * enemyHealthMultiplier)`
- Enemy damage:
  - `enemyDamage_applied = round(enemyDamage_base * enemyDamageMultiplier)`
- Shop price:
  - `shopPrice_applied = round(basePrice * shopPriceMultiplier)`
- Gold reward:
  - `gold_applied = round(baseGold * goldRewardMultiplier)`

Variables:

- `enemyMaxHP_base`: enemy max HP before DDA application.
- `enemyHealthMultiplier`: DDA multiplier for enemy HP by tier.
- `enemyMaxHP_applied`: enemy max HP after DDA scaling.
- `enemyDamage_base`: enemy damage before DDA application.
- `enemyDamageMultiplier`: DDA multiplier for enemy damage by tier.
- `enemyDamage_applied`: enemy damage after DDA scaling.
- `basePrice`: original shop item price.
- `shopPriceMultiplier`: DDA economy multiplier for shop prices.
- `shopPrice_applied`: effective shop price after scaling.
- `baseGold`: original gold reward value.
- `goldRewardMultiplier`: DDA economy multiplier for rewards.
- `gold_applied`: effective gold reward after scaling.
- `round(x)`: nearest integer rounding used in runtime.

---

## 6) What DDA changes in gameplay

`getCurrentDifficultyAdjustment()` returns:

- tier
- enemy health multiplier
- enemy damage multiplier
- enemy AI complexity
- shop price multiplier
- gold reward multiplier
- rest node bias (currently informational only; not wired into map generation yet)

### Applied in runtime

- **Combat enemy scaling** (HP/DMG + AI complexity):
  - applied in `CombatDDA.initializeDDA()`.
- **Shop prices**:
  - applied in `Shop.getActualPrice()`.
- **Gold rewards**:
  - scaled from **pre-combat DDA snapshot** in `Combat`.

---

## 7) Default tier multipliers

### Enemy scaling

- struggling: HP `0.8`, DMG `0.8`, AI complexity `0.5`
- learning: HP `1.0`, DMG `1.0`, AI complexity `1.0`
- thriving: HP `1.10`, DMG `1.10`, AI complexity `1.3`
- mastering: HP `1.15`, DMG `1.15`, AI complexity `1.5`

### Economy scaling

- struggling: shop `0.8`, gold `1.2`
- learning: shop `1.0`, gold `1.0`
- thriving: shop `1.1`, gold `0.9`
- mastering: shop `1.2`, gold `0.8`

---

## 8) What is intentionally NOT DDA

### Enemy spawn rate

Enemy spawn distribution is handled by node generation, not DDA.

### Boss preparation pressure

Rush/avoid behavior before boss (few combats, no relics/potions) is handled by a **separate boss-preparation path**, not by DDA PPS.

This logic is handled in:

- `src/core/managers/OverworldGameState.ts`
- `src/game/scenes/Overworld.ts`
- `src/game/scenes/Combat.ts`

---

## 9) Debugging and validation

Useful runtime tools:

- `DDADebugScene` for interactive DDA checks.
- DDA logs in combat:
  - tier calculation
  - PPS breakdown
  - applied multipliers

Useful tests:

- `src/core/dda/DDA.integration.test.ts`
- `src/core/dda/RuleBasedDDA.comprehensive.test.ts`
- `src/core/dda/DDA.elementalAffinity.test.ts`

---

## 10) Quick flow summary

1. Combat starts -> DDA snapshot + enemy multipliers applied.
2. Combat ends -> metrics submitted -> PPS updated.
3. Tier recalculated (post-calibration).
4. Next encounters/shops/rewards use new adjustment.
5. Session resets on new run/chapter transition.


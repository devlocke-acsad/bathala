# Relic Drop Rates - Quick Reference

## Drop Chance by Enemy Type

```
┌─────────────────────────────────────────────────────────┐
│                   COMMON ENEMIES (35%)                  │
├─────────────────────────────────────────────────────────┤
│  🐴 Tikbalang Scout        ─────────────────────────────░░░░░░░ 35%
│  🌳 Balete Wraith          ─────────────────────────────░░░░░░░ 35%
│  🐐 Sigbin Charger         ─────────────────────────────░░░░░░░ 35%
│  🧚 Duwende Trickster      ─────────────────────────────░░░░░░░ 35%
│  💧 Tiyanak Ambusher       ─────────────────────────────░░░░░░░ 35%
│  🪲 Amomongo               ─────────────────────────────░░░░░░░ 35%
│  👹 Bungisngis             ─────────────────────────────░░░░░░░ 35%
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   ELITE ENEMIES (75%)                   │
├─────────────────────────────────────────────────────────┤
│  🚬 Kapre Shade            ────────────────────────────────────────────── 75%
│  💨 Tawong Lipod           ────────────────────────────────────────────── 75%
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   BOSS ENEMY (100%)                     │
├─────────────────────────────────────────────────────────┤
│  🔮 Mangangaway (BOSS)     ████████████████████████████████████████████ 100%
└─────────────────────────────────────────────────────────┘
```

---

## Expected Relics Per 100 Combats

| Enemy Type | Combats | Expected Drops | Variance |
|-----------|---------|----------------|----------|
| Common | 100 | ~35 relics | ±6-8 |
| Elite | 100 | ~75 relics | ±5-7 |
| Boss | 100 | 100 relics | 0 (guaranteed) |

---

## Relic Pool Distribution

### Common Relic Pool (35% drop chance):
```
Pool Size: 4 relics
Per-Relic Chance: 35% ÷ 4 = 8.75% per specific relic

🛡️ Earthwarden's Plate      ──────────── 8.75%
💨 Swift Wind Agimat         ──────────── 8.75%
🔥 Ember Fetish              ──────────── 8.75%
🐍 Umalagad's Spirit         ──────────── 8.75%
```

### Elite Relic Pool (75% drop chance):
```
Pool Size: 4 relics
Per-Relic Chance: 75% ÷ 4 = 18.75% per specific relic

📿 Babaylan's Talisman       ──────────────────────── 18.75%
⚔️ Ancestral Blade           ──────────────────────── 18.75%
🌊 Tidal Amulet              ──────────────────────── 18.75%
🦚 Sarimanok Feather         ──────────────────────── 18.75%
```

### Boss Relic Pool (100% drop chance):
```
Pool Size: 3 relics
Per-Relic Chance: 100% ÷ 3 = 33.33% per specific relic

🌟 Echo of the Ancestors     ────────────────────────────────────── 33.33%
👑 Diwata's Crown            ────────────────────────────────────── 33.33%
🌙 Bakunawa Scale            ────────────────────────────────────── 33.33%
```

---

## Probability Analysis

### Chance to Get at Least One Common Relic:

| Combats | Probability |
|---------|-------------|
| 1 fight | 35.0% |
| 2 fights | 57.75% |
| 3 fights | 72.54% |
| 5 fights | 88.41% |
| 10 fights | 98.62% |

### Chance to Get at Least One Elite Relic:

| Combats | Probability |
|---------|-------------|
| 1 fight | 75.0% |
| 2 fights | 93.75% |
| 3 fights | 98.44% |
| 5 fights | 99.90% |

### Chance to Get Specific Relic:

| Rarity | Pool Size | Drop Chance | Per-Relic Chance |
|--------|-----------|-------------|------------------|
| Common | 4 | 35% | 8.75% per fight |
| Elite | 4 | 75% | 18.75% per fight |
| Boss | 3 | 100% | 33.33% per fight |

---

## Drop Roll Examples

### Common Enemy (35% chance):
```
Roll: 0.00 - 0.35  ✅ SUCCESS (Drop relic)
Roll: 0.36 - 1.00  ❌ FAILURE (No drop)
```

### Elite Enemy (75% chance):
```
Roll: 0.00 - 0.75  ✅ SUCCESS (Drop relic)
Roll: 0.76 - 1.00  ❌ FAILURE (No drop)
```

### Boss Enemy (100% chance):
```
Roll: 0.00 - 1.00  ✅ SUCCESS (Always drops)
```

---

## Inventory Considerations

**Maximum Relics**: 6
**Overflow Behavior**: Dropped relics are LOST if inventory full

### Recommended Strategy:
1. Keep inventory slots open before boss fights (guaranteed drop)
2. Consider dropping weaker relics before elite encounters (75% chance)
3. Common enemy drops (35%) are "bonus" - don't rely on them

---

## Console Output Examples

### Successful Drop:
```
Relic drop roll: 0.23 vs 0.35
✅ Relic dropped: Earthwarden's Plate (🛡️)
Added relic to inventory. Total relics: 3/6
```

### Failed Drop:
```
Relic drop roll: 0.89 vs 0.35
❌ Relic drop failed (rolled 0.89, needed ≤0.35)
```

### Inventory Full:
```
Relic drop roll: 0.12 vs 0.35
✅ Relic dropped: Ember Fetish (🔥)
⚠️ Relic inventory full (6/6). Relic not added.
```

---

## Testing Commands

To test relic drops, fight enemies and check console:

```javascript
// Common enemies (35% drop):
- Tikbalang Scout, Balete Wraith, Sigbin Charger, etc.

// Elite enemies (75% drop):
- Kapre Shade, Tawong Lipod

// Boss enemy (100% drop):
- Mangangaway
```

Expected results over 10 common enemy fights: ~3-4 relic drops
Expected results over 10 elite enemy fights: ~7-8 relic drops
Expected results over 10 boss fights: 10 relic drops (guaranteed)

---

**Last Updated**: Implementation Complete ✅
**Drop System**: Fully Functional
**All Relics**: Effects Implemented in RelicManager.ts

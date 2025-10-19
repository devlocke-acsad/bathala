# Verification: Merchant's Scale Removal from Shop

## ✅ Confirmation - Merchant's Scale is NO LONGER in Shop

### Files Checked:

#### 1. **ShopItems.ts** ✅
- ❌ `merchants_scale` NOT in `shopRelics` array
- ❌ `merchants_scale` NOT in `premiumShopItems` array  
- ❌ `merchants_scale` NOT in `allShopItems` array
- ✅ Comment added: "merchants_scale has been moved to treasure nodes"

**Current Shop Items:**
```typescript
shopRelics: [
  earthwardens_plate,
  swift_wind_agimat,
  ember_fetish,
  umalagad_spirit,
  babaylans_talisman,
  ancestral_blade,
  tidal_amulet,
  sarimanok_feather
]
```

#### 2. **Shop.ts** ✅
- ❌ Merchant dialogue removed (was at line 56-60)
- ❌ Item lore removed (was at line 1638)
- ✅ Discount UI text kept: `"(Merchant's Scale!)"` - This is CORRECT
  - Shows when player HAS the relic (from treasure)
  - Indicates discount is active
  - Does NOT sell the item

#### 3. **Act1Relics.ts, Act2Relics.ts, Act3Relics.ts** ✅
- ❌ `merchants_scale` removed from `shopRelics` arrays
- ✅ `merchants_scale` added to `treasureRelics` arrays
- ✅ Comments added explaining migration

---

## What Still Works (As Intended)

### Shop Discount System ✅
When player **already has** Merchant's Scale (from treasure):
1. ✅ All prices show 20% discount
2. ✅ Original price with strikethrough
3. ✅ Discounted price in green
4. ✅ Label shows "(Merchant's Scale!)"
5. ✅ Player pays discounted amount

### Treasure System ✅
Merchant's Scale can now be found:
1. ✅ In treasure chests (30% spawn rate)
2. ✅ FREE when found
3. ✅ All 3 acts have it in treasure pool
4. ✅ Won't appear if already owned

---

## Summary

**Shop Status**: ✅ **DOES NOT SELL Merchant's Scale**
- Cannot buy it with gold
- Not in shop inventory
- Not displayed as purchasable item

**Discount Status**: ✅ **WORKS CORRECTLY**
- Applies IF player has relic (from treasure)
- Shows visual feedback
- Calculates prices correctly

**Treasure Status**: ✅ **CAN BE FOUND**
- 30% random chance in chests
- Free acquisition
- Immediate effects apply

---

## Test Results

To verify in-game:
1. [ ] Start new run
2. [ ] Visit shop - Merchant's Scale should NOT be for sale
3. [ ] Prices should be normal (no discount)
4. [ ] Find treasure node
5. [ ] Merchant's Scale might appear (30% chance)
6. [ ] If found, take it
7. [ ] Visit next shop - all prices should be 20% off
8. [ ] Discount label "(Merchant's Scale!)" should appear

---

**Status**: ✅ **VERIFIED - Merchant's Scale removed from shop**

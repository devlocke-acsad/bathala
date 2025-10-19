# UI Fixes Applied ✅

## What Changed

1. **Dialogue Box - WIDER** (fixes overflow)
   - Width: 70% → 80% (max 1100px)
   - WordWrap: 65% → 75%
   - Height: Max 75% (was 70%)
   - Padding: 120px (was 100px)

2. **Section Divider - REMOVED LINE** (no more stray lines)
   - Deleted visible line completely
   - Now just empty spacing container

3. **Background - REMOVED BLACK OVERLAY** (clean top section)
   - Deleted `overlay2` (0x000000 at top 30%)
   - Only single overlay remains (0x150E10)

4. **Skip Buttons - ALWAYS VISIBLE**
   - Set depth 3000 (on top of everything)
   - Glows at depth 2999

## Files Changed

- `Dialogue.ts` - Wider box
- `PhaseHeader.ts` - No line in divider
- `TutorialManager.ts` - No black overlay, button depths

## Result

✅ No text overflow  
✅ No stray lines  
✅ No black overlay at top  
✅ Buttons always visible

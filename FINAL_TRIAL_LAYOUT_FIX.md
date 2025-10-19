# Phase 11 Final Trial - Layout Restructure

## Issue
Phase 11 (Final Trial) was using a custom centered layout that didn't match the actual combat scene layout players would experience in the real game.

## Solution
Completely restructured Phase 11 to **exactly match** the Combat.ts layout:

### Combat.ts Standard Layout
```
┌──────────────────────────────────────────────────────┐
│  Progress    Turn Counter (center)                   │
│  (top-left)                                          │
│                                                       │
│      PLAYER (left)          ENEMY (right)            │
│      ├─ Sprite              ├─ Sprite                │
│      ├─ Name                ├─ Name                  │
│      ├─ HP: X/100           ├─ HP: X/X               │
│      ├─ Block: X            ├─ Block: X              │
│      └─ (Status)            └─ Intent: Attack X      │
│                                                       │
│                                                       │
│              [CARDS DISPLAYED HERE]                   │
│                                                       │
│          [⚔️Attack] [🛡️Defend] [✨Special]          │
└──────────────────────────────────────────────────────┘
```

### Key Changes Made

#### 1. Player Positioning (Left Side)
- **Position**: `screenWidth * 0.25, screenHeight * 0.4`
- **Elements**: Sprite → Name → HP → Block (vertically stacked)
- **Dynamic Y Offsets**: Based on sprite height (exact Combat.ts formula)

#### 2. Enemy Positioning (Right Side)
- **Position**: `screenWidth * 0.75, screenHeight * 0.4`
- **Elements**: Sprite → Name → HP → Block → Intent (vertically stacked)
- **Scaling**: 250x250 (smaller for Tiyanak/Duwende: 150x150)
- **Intent Display**: Shows next action below block

#### 3. UI Elements
- **Progress Indicator**: Small (0.8 scale), top-left corner
- **Turn Counter**: Top center (40px from top)
- **Cards**: Bottom center via `tutorialUI.handContainer`
- **Action Buttons**: Three buttons, horizontally centered, 200px spacing

#### 4. Dynamic Positioning
All text positions calculated from sprite heights:
```typescript
const spriteScaledHeight = sprite.height * scale;
const nameY = spriteY - (spriteScaledHeight / 2) - 20;
const healthY = spriteY + (spriteScaledHeight / 2) + 20;
const blockY = healthY + 25;
const intentY = blockY + 25;
```

### Code Changes

**Before**: Custom centered layout with enemy in middle
```typescript
const enemyX = screenWidth / 2;
const enemyY = 160;
// Player stats combined in one text
playerStats.setText(`Your HP: ${hp}/100 | Block: ${block}`);
```

**After**: Combat.ts standard layout
```typescript
const playerX = screenWidth * 0.25;
const playerY = screenHeight * 0.4;
const enemyX = screenWidth * 0.75;
const enemyY = screenHeight * 0.4;
// Separate text objects for each stat
playerHPText.setText(`HP: ${hp}/100`);
playerBlockText.setText(`Block: ${block}`);
```

## Files Modified
- `Phase11_FinalTrial.ts`: Lines 65-340
  - Complete `startTrial()` method rewrite
  - Updated `handlePlayerAction()` signature and implementation
  - Added separate text references for HP/Block updates

## Benefits
1. **Consistent Experience**: Players practice with exact real combat layout
2. **Better Preparation**: No confusion when entering actual combat
3. **Professional Polish**: Tutorial matches production quality
4. **Easier Maintenance**: Changes to Combat.ts layout can be mirrored easily

## Build Status
✅ Build successful with no errors or warnings

## Testing Checklist
- [ ] Phase 11 player sprite appears on left (25% x position)
- [ ] Phase 11 enemy sprite appears on right (75% x position)
- [ ] Player stats (name, HP, block) positioned below player sprite
- [ ] Enemy stats (name, HP, block, intent) positioned below enemy sprite
- [ ] Cards appear at bottom center
- [ ] Three action buttons horizontally centered at bottom
- [ ] Progress indicator small in top-left corner
- [ ] Turn counter at top center
- [ ] Layout matches actual Combat.ts exactly

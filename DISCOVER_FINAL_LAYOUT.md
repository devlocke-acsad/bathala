# Discover Scene Final Layout - Premium Card Design

## Overview
Complete redesign of the Discover (enemy compendium) scene with taller cards and full-size sprite display for maximum visual impact and professional presentation.

---

## Final Card Specifications

### Card Dimensions:
- **Width**: 260px
- **Height**: 320px (tall format for full sprite display)
- **Spacing**: 35px between cards
- **Aspect Ratio**: ~0.81:1 (portrait orientation)

### Sprite Display:
- **Frame Size**: 180×180px
- **Sprite Size**: 170×170px (fills 94% of frame)
- **Position**: y=150 (centered vertically in upper card)
- **Fallback Emoji**: 100px font size

### Card Layout Structure:
```
┌─────────────────────────────┐  ← 260×320px card
│ [Type-colored outer glow]   │
│ ────── Accent Bar ────────  │  ← y=8
│                             │
│      [COMMON/ELITE/BOSS]    │  ← y=35 (Type badge)
│                             │
│   ┌─────────────────────┐   │
│   │                     │   │
│   │      SPRITE         │   │  ← y=150 (170×170px)
│   │      170×170        │   │     FULL SIZE!
│   │                     │   │
│   └─────────────────────┘   │
│                             │
│      Enemy Name Text        │  ← y=255
│                             │
│   ┌─────────────────────┐   │
│   │  HP: 180   ATK: 21  │   │  ← y=290 (Stats panel)
│   └─────────────────────┘   │
└─────────────────────────────┘
```

---

## Vertical Layout Breakdown

### Y-Position Map:
```
y=0    : Card top edge
y=8    : Top accent bar
y=35   : Type badge (COMMON/ELITE/BOSS)
y=60   : Sprite frame begins
y=150  : Sprite center (170×170px display)
y=240  : Sprite frame ends
y=255  : Enemy name
y=280  : Stats labels (HP/ATK)
y=290  : Stats panel center
y=298  : Stats values
y=320  : Card bottom edge
```

### Element Spacing:
- **Badge to Sprite**: 115px (generous top space)
- **Sprite to Name**: 105px (breathing room)
- **Name to Stats**: 35px (compact info)
- **Total Height**: 320px (40px taller than before)

---

## Sprite Frame Details

### Frame Specifications:
- **Container**: 180×180px rectangle
- **Background**: Very dark (#0f0a0d)
- **Border**: 1px, type-colored (40% opacity)
- **Purpose**: Creates "display case" effect

### Sprite Display:
- **Size**: 170×170px (5px margin on all sides)
- **Coverage**: 94% of frame area
- **Aspect**: Maintains 1:1 square ratio
- **Rendering**: GPU-accelerated scaling

### Why 170×170px?
- **Maximum visibility** without touching frame edges
- **Prevents clipping** with 5px safety margin
- **Professional polish** with balanced spacing
- **Consistent sizing** across all enemy types

---

## Type-Based Color System

### Color Assignments:
| Type | Hex Color | RGB | Usage |
|------|-----------|-----|-------|
| **Boss** | #ff6b6b | Red | Maximum danger |
| **Elite** | #ffd93d | Gold | Special/valuable |
| **Common** | #06d6a0 | Teal | Standard enemy |

### Applied Elements:
1. Outer glow border (12% fill, 50% stroke)
2. Top accent bar (70% opacity)
3. Type badge border (2px solid)
4. Sprite frame hint (40% opacity)
5. Hover effects (up to 90% opacity)

---

## Stats Panel Layout

### Panel Specs:
- **Width**: 244px (card width - 16px)
- **Height**: 35px
- **Position**: y=290 (30px from bottom)
- **Background**: #0f0a0d (very dark)
- **Border**: 1px #4a3a40

### HP Display (Left):
```
Position: x = width / 4 (65px from left)
Label: "HP" (11px, gray #77888C) at y=280
Value: Red #ff6b6b (16px bold) at y=298
```

### ATK Display (Right):
```
Position: x = (width × 3) / 4 (195px from left)
Label: "ATK" (11px, gray #77888C) at y=280
Value: Gold #ffd93d (16px bold) at y=298
```

---

## Size Evolution Timeline

### Card Height Journey:
```
Original:  200px
Update 1:  200px → 200px (no change)
Update 2:  200px → 280px (+40%)
FINAL:     280px → 320px (+60% from original!)
```

### Sprite Size Journey:
```
Original:  70×70px   (4,900px²)
Update 1:  100×100px (10,000px²) +104%
Update 2:  140×140px (19,600px²) +300%
FINAL:     170×170px (28,900px²) +490%! 🎯
```

### Visual Impact:
| Metric | Original | Final | Improvement |
|--------|----------|-------|-------------|
| Card Area | 36,000px² | 83,200px² | **+131%** |
| Sprite Area | 4,900px² | 28,900px² | **+490%** |
| Sprite/Card Ratio | 13.6% | 34.7% | **+155%** |

---

## Responsive Grid Behavior

### Auto-Calculation:
```typescript
cardsPerRow = floor((screenWidth - 100) / (260 + 35))
```

### Screen Breakpoints:
| Screen Width | Cards Per Row | Total Width | Side Margins |
|--------------|---------------|-------------|--------------|
| 1920px | 6 | 1,770px | 75px each side |
| 1600px | 5 | 1,475px | 62.5px each side |
| 1280px | 4 | 1,180px | 50px each side |
| 1024px | 3 | 885px | 69.5px each side |
| 800px | 2 | 590px | 105px each side |

### Grid Properties:
- **Minimum Margin**: 50px each side (100px total)
- **Card Spacing**: 35px horizontal, vertical
- **Alignment**: Center-aligned on screen
- **Scroll**: Enabled when content exceeds viewport

---

## Enhanced Hover Effects

### Multi-Layer Animation:
```javascript
Default State:
├─ Outer glow: 2px stroke, 50% opacity
├─ Background: 1px border, gray
├─ Position: y = original
└─ Scale: 1.0

Hover State (200ms Power2 ease):
├─ Outer glow: 3px stroke, 90% opacity (brighter!)
├─ Background: 2px border, type-colored
├─ Position: y = original - 10px (lifts up)
└─ Scale: 1.03 (slightly enlarged)

Click State (100ms, yoyo):
├─ Scale: 0.95 (press down)
├─ Bounce back to 1.0
└─ Navigate to detail view
```

---

## Detail View Sprite Size

### Modal Display:
- **Sprite Size**: 180×180px
- **Position**: y=280 (centered in upper modal)
- **Purpose**: Hero showcase for enemy inspection
- **Size Relation**: Slightly larger than card (170→180)

### Card vs Detail Comparison:
```
Card Grid:   170×170px (quick recognition)
Detail View: 180×180px (hero inspection)
Difference:  +10px per dimension (+12%)
```

---

## Typography Hierarchy

### Font Sizes (Largest to Smallest):
1. **Enemy Name**: 18px (dungeon-mode-inverted, bright)
2. **Stats Values**: 16px (HP red, ATK gold)
3. **Type Badge**: 14px (bold uppercase)
4. **Stats Labels**: 11px (HP/ATK, gray)

### Font Families:
- **dungeon-mode-inverted**: Headings, names, values (bold, prominent)
- **dungeon-mode**: Labels, badges (regular weight)

---

## Performance Optimizations

### GPU Acceleration:
- All sprite scaling uses `setDisplaySize()` (GPU transform)
- No texture regeneration or canvas manipulation
- Hardware-accelerated hover animations
- Efficient container-based architecture

### Memory Management:
- Single texture per enemy (no duplication)
- Sprite instances pooled via container system
- Clean destroy on navigation
- Minimal texture memory footprint

### Rendering Efficiency:
- Layered rendering via single container add
- Z-order managed in array insertion
- No dynamic layer reordering
- Batch rendering of similar elements

---

## Design Philosophy

### Core Principles:
1. **Sprite is Supreme**: 170×170px dominates card (34.7% of area)
2. **Vertical Space**: Tall 320px format gives sprite room to breathe
3. **Clear Hierarchy**: Size progression guides eye naturally
4. **Professional Polish**: Generous spacing, layered depth, smooth animations
5. **Type Recognition**: Color-coding provides instant category identification

### Visual Language:
- **Portrait Format**: Tall cards feel premium and showcase-worthy
- **Large Sprites**: Enemy art is the star attraction
- **Minimal Text**: Only essential info (name, stats)
- **Color Coding**: Type determines accent colors
- **Smooth Motion**: Hover effects feel responsive and polished

---

## User Experience Impact

### Before Final Update:
⚠️ Sprites felt cramped in 140×140 frames  
⚠️ Cards seemed short and squished  
⚠️ Limited vertical space for sprite display  
⚠️ Aspect ratio didn't showcase art well  

### After Final Update:
✅ **170×170px sprites** - Full, glorious display  
✅ **320px tall cards** - Premium portrait format  
✅ **34.7% sprite coverage** - Art dominates design  
✅ **180×180px frames** - Generous display case  
✅ **Balanced layout** - Perfect vertical proportions  
✅ **Professional polish** - Trading card quality  

---

## Comparison Summary

### Quick Stats:
```
CARD DIMENSIONS
Original: 180×200px → Final: 260×320px (+131% area)

SPRITE SIZE
Original: 70×70px → Final: 170×170px (+490% area!)

SPRITE PROMINENCE
Original: 13.6% of card → Final: 34.7% of card (+155%)

VERTICAL SPACE
Original: 200px → Final: 320px (+60% height)
```

### Visual Quality Leap:
**From compact grid → Premium showcase gallery**

---

## Technical Implementation

### Files Modified:
- `src/game/scenes/Discover.ts`
  - Card dimensions: 260×320px
  - Sprite frame: 180×180px
  - Sprite display: 170×170px
  - All Y-positions adjusted for taller format

### Code Changes:
```typescript
// Card height increased
cardHeight: 280 → 320

// Sprite frame enlarged
spriteFrame: 150×150 → 180×180

// Sprite display maxed out
spriteSize: 140×140 → 170×170

// Positions adjusted
sprite Y: 135 → 150
name Y: 225 → 255
stats panel Y: 260 → 290
stats labels Y: 250 → 280
stats values Y: 268 → 298
```

---

## Testing Checklist

✅ **Visual Display**
- [ ] Sprites display at full 170×170px size
- [ ] No clipping or letterboxing visible
- [ ] Sprites centered in 180×180px frames
- [ ] 5px margin visible around sprites

✅ **Card Layout**
- [ ] Cards are 260×320px (tall format)
- [ ] 35px spacing between cards
- [ ] Grid centers on screen correctly
- [ ] No overlap or layout issues

✅ **Responsive Behavior**
- [ ] Grid adapts to different screen widths
- [ ] Scrolling works smoothly
- [ ] Cards maintain aspect ratio
- [ ] Hover effects work on all cards

✅ **Text Readability**
- [ ] Enemy names clearly visible at y=255
- [ ] HP/ATK stats readable at bottom
- [ ] Type badges stand out at top
- [ ] All fonts render correctly

✅ **Performance**
- [ ] Smooth 60 FPS scrolling
- [ ] Hover animations are fluid
- [ ] No lag when displaying 10 cards
- [ ] Memory usage remains stable

---

## Related Documents
- DISCOVER_SPRITE_UPDATE.md - Initial sprite implementation
- DISCOVER_SIZE_UPGRADE.md - Card size evolution
- SPECIAL_EFFECTS_UPDATE.md - Combat effects reference

---

**Version**: v5.8.14.25  
**Date**: 2025-01-XX  
**Scene**: Discover (Enemy Compendium)  
**Focus**: Tall card format with full-size sprite display  
**Result**: Premium showcase gallery for Filipino mythology enemies  
**Achievement**: 490% sprite size increase from original! 🎯

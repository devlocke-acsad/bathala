# Discover Scene - Premium Detail View Redesign

## Overview
Complete premium redesign of the Discover scene's detail modal with enhanced visual hierarchy, layered design elements, and mythological theming for lore presentation.

## Key Design Changes

### 1. **Layered Background System**
- **Outer Glow**: Dynamic type-colored glow (0.3 alpha) that changes based on enemy type
- **Main Background**: Dark premium background (0x1d151a) with 2px border
- **Top Accent Bar**: Type-colored accent bar at top (70% opacity)

### 2. **Enhanced Typography**
- **Character Name**: 36px with black stroke for depth
- **Section Titles**: Larger, more prominent titles
  - Combat Stats: 18px "COMBAT STATS"
  - Special Abilities: 18px "SPECIAL ABILITIES"
  - Tactical Overview: 22px with decorative borders "━━━ TACTICAL OVERVIEW ━━━"
  - Mythology & Lore: 22px golden text "━━━ MYTHOLOGY & ANCIENT LORE ━━━"

### 3. **Type Badge Enhancement**
- **Glow Layer**: Subtle background glow (4px larger, 0.4 alpha)
- **Main Badge**: 136×32px with 2px border
- **Dynamic Coloring**: Border color matches enemy type
  - Boss: #ff6b6b (red)
  - Elite: #ffd93d (gold)
  - Common: #06d6a0 (teal)

### 4. **Sprite Frame Premium Design**
- **Frame Glow**: 224×224px dark glow (0.5 alpha)
- **Main Frame**: 220×220px with 2px border
- **Natural Aspect Ratio**: Maintains sprite proportions
- **Individual Scaling**: Custom scale per enemy

### 5. **Information Sections with Glow Effects**

#### Stats Section
- **Title**: "COMBAT STATS" (18px inverted font)
- **Container Glow**: 168×78px @ 0.3 alpha
- **Main Container**: 164×74px with 2px border
- **Text**: 16px with 4px line spacing
- **Colors**: #a9b4b8 text on 0x2a1f24 background

#### Abilities Section
- **Title**: "SPECIAL ABILITIES" (18px inverted font)
- **Container Glow**: 228×78px @ 0.3 alpha
- **Main Container**: 224×74px with 2px border
- **Text**: 16px golden (#c9a74a) with 4px line spacing

### 6. **Description Section - Tactical Theme**
- **Title**: "━━━ TACTICAL OVERVIEW ━━━" (22px with stroke)
- **Container Glow**: Full width - 180px @ 0.3 alpha
- **Main Container**: 104px height with 2px border
- **Corner Accents**: Teal corner markers (12×12px @ 0.6 alpha)
- **Text Styling**:
  - Font: 16px dungeon-mode
  - Color: #c4d1d6 (bright blue-gray)
  - Line spacing: 5px
  - Center aligned

### 7. **Lore Section - Mythological Theme**
- **Title**: "━━━ MYTHOLOGY & ANCIENT LORE ━━━" (22px golden)
- **Container Glow**: Full width - 180px @ 0.3 alpha
- **Main Container**: 144px height with 2px border
- **Corner Accents**: 4 golden corner markers (12×12px @ 0.6 alpha)
  - Top-left, Top-right, Bottom-left, Bottom-right
- **Text Styling**:
  - Font: 16px dungeon-mode italic
  - Color: #d4b878 (golden tan)
  - Line spacing: 5px
  - Center aligned

### 8. **Interactive Elements**
- **Close Button**: 
  - Larger (24px) with hover effects
  - Scales to 1.2× on hover
  - Color darkens to #ff4444

## Dynamic Type-Based Coloring

The system applies enemy type colors to:
1. **Outer Glow** - Full card background glow
2. **Top Accent Bar** - 8px bar at top of card
3. **Type Badge Border** - 2px stroke around badge
4. **Type Text** - Color of the type label

Color Scheme:
- **Boss**: 0xff6b6b (vibrant red)
- **Elite**: 0xffd93d (golden yellow)
- **Common**: 0x06d6a0 (teal green)

## Layout Specifications

```
Y-Position Reference:
├─ 62px: Top accent bar
├─ 100px: Character name
├─ 155px: Type badge
├─ 280px: Sprite/symbol
├─ 410px: Stats & abilities titles
├─ 445px: Stats & abilities containers
├─ 550px: Description title
├─ 600px: Description container
├─ 730px: Lore title
└─ 780px: Lore container
```

## Container Dimensions

| Element | Width | Height | Border | Glow Offset |
|---------|-------|--------|--------|-------------|
| Outer Glow | screenWidth - 100 | screenHeight - 100 | N/A | N/A |
| Main Background | screenWidth - 110 | screenHeight - 110 | 2px | +10px |
| Top Accent | screenWidth - 110 | 8px | N/A | N/A |
| Type Badge | 136px | 32px | 2px | +4px |
| Sprite Frame | 220px | 220px | 2px | +4px |
| Stats | 164px | 74px | 2px | +4px |
| Abilities | 224px | 74px | 2px | +4px |
| Description | screenWidth - 186 | 104px | 2px | +6px |
| Lore | screenWidth - 186 | 144px | 2px | +6px |

## Visual Hierarchy

1. **Character Identity** (Top)
   - Name with stroke
   - Type badge with glow
   - Sprite in premium frame

2. **Combat Information** (Middle)
   - Stats and abilities side-by-side
   - Equal visual weight
   - Compact presentation

3. **Narrative Content** (Bottom)
   - Description: Tactical/gameplay focus
   - Lore: Mythological/cultural context
   - Enhanced visual prominence
   - Decorative corner accents

## Color Psychology

- **Teal Accents (Description)**: Strategic, tactical, analytical
- **Golden Accents (Lore)**: Precious, ancient, mythological
- **Type Colors**: Immediate threat recognition
- **Dark Backgrounds**: Premium, mysterious, focused

## Text Readability

All text sections optimized for readability:
- Increased font sizes (15px → 16px)
- Enhanced line spacing (3px → 5px)
- Center alignment for narrative sections
- High contrast color choices
- Word wrapping with generous margins

## Implementation Benefits

1. **Visual Consistency**: Matches premium card design from grid view
2. **Enhanced Readability**: Larger text, better spacing, center alignment
3. **Mythological Theming**: Golden accents for lore create cultural atmosphere
4. **Dynamic Adaptation**: Type colors create immediate visual recognition
5. **Professional Polish**: Layered glows, corner accents, enhanced typography

## Technical Notes

- All design elements use stored references for dynamic updates
- Type colors applied at runtime based on enemy data
- Corner accents positioned using calculated offsets
- Glow layers always slightly larger than main containers
- All rectangles use consistent origin points (0.5 or 0)

---

**Created**: October 20, 2025  
**Version**: Premium Detail View v1.0  
**Related Files**: 
- `src/game/scenes/Discover.ts`
- `DISCOVER_FINAL_LAYOUT.md`
- `DISCOVER_NATURAL_ASPECT_RATIO.md`

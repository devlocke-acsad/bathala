# Prologue UI Quick Reference

## Color Palette (Matching Intro)

### Background & Overlays
```typescript
Background Color: 0x150E10 (dark burgundy-brown)
Overlay Alpha: 0.85 - 0.95
```

### Text Colors
```typescript
Primary Text: '#77888C' (muted teal-grey) - THE signature color
Secondary Text: '#77888C' with 0.7-0.8 alpha for de-emphasis
Emphasis/Highlights: '#FFAA00' (gold)
```

### Border Colors
```typescript
Outer Border: 0x77888C (lighter teal-grey)
  - Stroke: 3px at 0.8 alpha
  
Inner Border: 0x556065 (darker grey)
  - Stroke: 2px at 0.6 alpha
```

---

## Double Border Pattern (Standard)

```typescript
// For dialogue boxes and info boxes
const outerBorder = scene.add.rectangle(0, 0, width + 8, height + 8, undefined, 0)
    .setStrokeStyle(3, 0x77888C, 0.8);

const innerBorder = scene.add.rectangle(0, 0, width + 2, height + 2, undefined, 0)
    .setStrokeStyle(2, 0x556065, 0.6);
```

---

## Typography Standards

### Dialogue Text
```typescript
{
    fontFamily: 'dungeon-mode',
    fontSize: 24,
    color: '#77888C',
    align: 'center',
    wordWrap: { width: screenWidth * 0.7 },
    lineSpacing: 12
}
```

### Headers (Phase Titles)
```typescript
{
    fontFamily: 'dungeon-mode',
    fontSize: 42,
    color: '#77888C',
    align: 'center'
}
```

### Subtitles
```typescript
{
    fontFamily: 'dungeon-mode',
    fontSize: 20,
    color: '#77888C',
    align: 'center'
}
.setAlpha(0.8)
```

### Info/Warning Text
```typescript
{
    fontFamily: 'dungeon-mode',
    fontSize: 20,
    color: '#77888C',
    align: 'center',
    wordWrap: { width: 600 },
    lineSpacing: 8
}
```

### Progress Indicator
```typescript
{
    fontFamily: 'dungeon-mode',
    fontSize: 18,
    color: '#77888C',
    align: 'center'
}
```

---

## UI Element Specifications

### Dialogue Box
- **Background**: `0x150E10` at 0.95 alpha
- **Width**: 75% of screen width
- **Height**: Text height + 80px padding
- **Borders**: Double border (outer 3px, inner 2px)
- **Text Color**: `#77888C`
- **Continue Indicator**: "Click to Continue" at 0.7 alpha

### Phase Header
- **Title Color**: `#77888C`
- **Subtitle Color**: `#77888C` at 0.8 alpha
- **Decorative Lines**: `0x77888C` with fade-out effect
- **Corner Ornaments**: `◆` symbol at 0.8 alpha

### Info Box Types
All types now share the same base styling:
- **Background**: `0x150E10` at 0.95 alpha
- **Borders**: Double border (3px outer, 2px inner)
- **Text Color**: `#77888C`
- **Icon Size**: 28px
- Only the icon changes per type:
  - Tip: 💡
  - Warning: ⚠️
  - Info: ℹ️
  - Success: ✓

### Tooltips
- **Background**: `0x150E10` at 0.95 alpha
- **Borders**: Double border (2px outer, 1px inner)
- **Text Color**: `#77888C`
- **Font Size**: 16px

---

## Animation Standards

### Fade In (Standard)
```typescript
scene.tweens.add({
    targets: element,
    alpha: 1,
    duration: 500-600,
    ease: 'Power2' or 'Back.easeOut'
});
```

### Entrance Animation (With Scale)
```typescript
element.setAlpha(0).setScale(0.95);
scene.tweens.add({
    targets: element,
    alpha: 1,
    scale: 1,
    duration: 500,
    ease: 'Back.easeOut'
});
```

### Pulse Effect (Continue Indicator)
```typescript
scene.tweens.add({
    targets: continueIndicator,
    alpha: 1,
    y: '+=10',
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
});
```

---

## Consistency Checklist

✅ All backgrounds use `0x150E10`  
✅ All primary text uses `#77888C`  
✅ All UI boxes use double-border design  
✅ Line spacing is 8-12 for readability  
✅ No excessive glows or effects  
✅ Consistent alpha values (0.6, 0.7, 0.8, 0.95)  
✅ Font family always `'dungeon-mode'`  

---

## Common Mistakes to Avoid

❌ Using `#E8E8E8` or `#FFFFFF` for text (too bright)  
❌ Using `#99A0A5` (inconsistent shade)  
❌ Single or triple borders instead of double  
❌ Background colors other than `0x150E10`  
❌ Adding multiple glow layers (causes artifacts)  
❌ Forgetting to set alpha on secondary elements  

---

## Quick Copy-Paste Snippets

### Standard Dialogue Box
```typescript
const bg = scene.add.rectangle(0, 0, width, height, 0x150E10, 0.95);
const outerBorder = scene.add.rectangle(0, 0, width + 8, height + 8, undefined, 0)
    .setStrokeStyle(3, 0x77888C, 0.8);
const innerBorder = scene.add.rectangle(0, 0, width + 2, height + 2, undefined, 0)
    .setStrokeStyle(2, 0x556065, 0.6);
```

### Standard Text
```typescript
const text = scene.add.text(x, y, content, {
    fontFamily: 'dungeon-mode',
    fontSize: 24,
    color: '#77888C',
    align: 'center',
    wordWrap: { width: 600 },
    lineSpacing: 12
}).setOrigin(0.5);
```

---

**Last Updated**: October 19, 2025  
**Version**: 1.0 - Initial consistency pass

# Prologue UI Components - Quick Reference

## Import Statements

```typescript
import { createProgressIndicator } from '../ui/ProgressIndicator';
import { createPhaseHeader, createSectionDivider } from '../ui/PhaseHeader';
import { createInfoBox, createHighlight } from '../ui/InfoBox';
import { showDialogue } from '../ui/Dialogue';
```

---

## Progress Indicator

```typescript
// Create
const progress = createProgressIndicator(this.scene, currentPhase, totalPhases);
this.container.add(progress);

// Example: Phase 3 of 11
const progress = createProgressIndicator(this.scene, 3, 11);

// Update (fades out old, creates new)
updateProgressIndicator(progress, 4, 11);
```

**Position:** Top center (x: width/2, y: 50)  
**Depth:** 1500

---

## Phase Header

```typescript
// With subtitle
const header = createPhaseHeader(
    this.scene,
    'Main Title',
    'Optional subtitle for context'
);

// Without subtitle
const header = createPhaseHeader(this.scene, 'Main Title');

this.container.add(header);
```

**Position:** Center-top (x: width/2, y: 140)  
**Depth:** 1400  
**Animation:** Slides down 20px over 800ms

---

## Section Divider

```typescript
const divider = createSectionDivider(this.scene, yPosition);
this.container.add(divider);

// Example: Divider at y=300
const divider = createSectionDivider(this.scene, 300);
```

**Default Y:** 300  
**Animation:** Fades in over 600ms

---

## Info Boxes

```typescript
// Tip (yellow/gold theme)
const tip = createInfoBox(
    this.scene,
    'Helpful hint message',
    'tip'
);

// Info (blue theme)
const info = createInfoBox(
    this.scene,
    'General information',
    'info'
);

// Success (green theme)
const success = createInfoBox(
    this.scene,
    'Achievement or completion message',
    'success'
);

// Warning (orange theme)
const warning = createInfoBox(
    this.scene,
    'Important caution',
    'warning'
);

// Custom position
const tip = createInfoBox(
    this.scene,
    'Message',
    'tip',
    x,  // default: width/2
    y   // default: height - 150
);

this.container.add(tip);
```

**Default Position:** Bottom center  
**Depth:** 1800  
**Animation:** Scale + fade up from below

---

## Highlights

```typescript
// Highlight a UI element
const highlight = createHighlight(
    this.scene,
    targetX,
    targetY,
    width,
    height,
    0xFFD700  // Optional: pulse color (default gold)
);

this.container.add(highlight);

// Example: Highlight a button at (500, 300) with size 200x50
const highlight = createHighlight(this.scene, 500, 300, 200, 50);
```

**Depth:** 1900  
**Animation:** Pulsing glow + corner markers

---

## Dialogue Box

```typescript
const dialogueBox = showDialogue(
    this.scene,
    'Your dialogue text here\n\nSupports line breaks',
    () => {
        // Callback when player clicks to continue
        console.log('Dialogue completed');
    }
);

// Optional: Position manually
dialogueBox.setPosition(x, y);

this.container.add(dialogueBox);
```

**Default Position:** Center screen  
**Depth:** 2000  
**Animation:** Scale + fade in, typing effect  
**Interaction:** Click to skip typing, click again to continue

---

## Timing Delays

```typescript
// Delay before showing next element
this.scene.time.delayedCall(600, () => {
    // Show next UI element
});

// Common delay timings:
// - 400ms: Quick succession
// - 600ms: Standard pace
// - 800ms: Dramatic pause
// - 1500ms+: Reading time
```

---

## Fade Out All Elements

```typescript
// Fade out entire container
this.scene.tweens.add({
    targets: this.container.getAll(),
    alpha: 0,
    duration: 400,
    ease: 'Power2',
    onComplete: () => {
        // Cleanup or transition
        this.onComplete();
    }
});
```

---

## Staggered Card Animations

```typescript
cards.forEach((cardData, index) => {
    const card = this.tutorialUI.createCardSprite(cardData, x, y, false);
    
    // Set initial state
    card.setAlpha(0).setY(y - 30).setScale(0.9);
    cardContainer.add(card);

    // Stagger animation
    this.scene.tweens.add({
        targets: card,
        alpha: 1,
        y: y,
        scale: 1,
        duration: 600,
        delay: index * 150,  // 150ms between each
        ease: 'Back.easeOut'
    });
});
```

---

## Hover Effects

```typescript
card.setInteractive();

card.on('pointerover', () => {
    this.scene.tweens.add({
        targets: card,
        y: card.y - 15,
        scale: 1.1,
        duration: 300,
        ease: 'Power2'
    });
});

card.on('pointerout', () => {
    this.scene.tweens.add({
        targets: card,
        y: originalY,
        scale: 1,
        duration: 300,
        ease: 'Power2'
    });
});
```

---

## Complete Phase Template

```typescript
export class PhaseX_Name extends TutorialPhase {
    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        // 1. Progress indicator
        const progress = createProgressIndicator(this.scene, X, 11);
        this.container.add(progress);

        // 2. Phase header
        const header = createPhaseHeader(
            this.scene,
            'Phase Title',
            'Subtitle description'
        );
        this.container.add(header);

        // 3. Delayed content
        this.scene.time.delayedCall(600, () => {
            // Main dialogue
            const dialogue = "Your phase content...";
            const dialogueBox = showDialogue(this.scene, dialogue, () => {
                // 4. Optional info box
                const tip = createInfoBox(
                    this.scene,
                    'Helpful tip!',
                    'tip'
                );
                this.container.add(tip);
                
                // 5. Transition out
                this.scene.time.delayedCall(2000, () => {
                    this.fadeOutAndComplete();
                });
            });
            this.container.add(dialogueBox);
        });
    }

    private fadeOutAndComplete(): void {
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => this.onComplete()
        });
    }
}
```

---

## Color Reference

```typescript
// Text colors
'#E8E8E8'  // Primary text (soft white)
'#99A0A5'  // Secondary text (blue-gray)
'#77888C'  // Tertiary text (muted)

// Background colors
0x1A1215   // Main background (dark burgundy)
0x150E10   // Alt background (deeper)
0x2A1E25   // Overlay background (lighter)

// Border colors
0x99A0A5   // Light border
0x77888C   // Medium border
0x556065   // Dark border

// Accent colors
0xFFD700   // Gold (tips, highlights)
0xFF6B35   // Orange (warnings)
0x5BA3D0   // Blue (info)
0x4CAF50   // Green (success)
```

---

## Animation Easing Guide

```typescript
'Power2'        // Smooth, standard transitions
'Power3'        // More dramatic movements
'Back.easeOut'  // Overshoot (playful entries)
'Sine.easeInOut' // Natural loops and pulses
'Linear'        // Constant speed (rotations)
```

---

## Common Depths

```
Background:     0-100
Game elements:  100-1000
Progress:       1500
Header:         1400
Info boxes:     1800
Highlights:     1900
Dialogue:       2000
Tooltips:       2500
Modals:         3000+
```

---

## Best Practices

✅ **DO:**
- Always add progress indicator
- Use phase headers for context
- Delay elements for visual flow (600ms typical)
- Provide feedback with info boxes
- Clean up animations on transitions
- Use staggered animations for multiple items

❌ **DON'T:**
- Show all elements at once
- Use instant transitions
- Forget to add containers to parent
- Skip easing functions
- Create memory leaks with timers
- Overlap too many animations

---

## Testing Checklist

- [ ] Progress indicator shows correct phase
- [ ] Header animates smoothly
- [ ] Dialogue appears after header
- [ ] Info boxes provide feedback
- [ ] All elements fade out properly
- [ ] No console errors
- [ ] Animations don't overlap awkwardly
- [ ] Text is readable
- [ ] Proper z-ordering (depth)
- [ ] Clean transition to next phase

---

**Last Updated:** October 19, 2025  
**Version:** 1.0

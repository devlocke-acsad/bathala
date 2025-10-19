# Skip Phase Button Implementation

## Changes Made

### 1. Updated TutorialPhase Base Class
Added `createSkipPhaseButton()` helper method to the base class that all tutorial phases inherit from.

**Location**: `bathala/src/game/scenes/Prologue/phases/TutorialPhase.ts`

**Features**:
- Creates button in bottom-right corner (88% x, 92% y)
- Adds subtle glow effect that pulses
- Consistent styling across all phases
- Simple callback pattern for easy integration

**Implementation**:
```typescript
protected createSkipPhaseButton(onSkip: () => void): void {
    const skipButtonX = screenWidth * 0.88;
    const skipButtonY = screenHeight * 0.92;
    
    this.skipPhaseButton = createButton(
        this.scene,
        skipButtonX,
        skipButtonY,
        'Skip Phase ➜',
        onSkip
    );
    
    // Add subtle animated glow
    const skipGlow = this.scene.add.circle(...);
    this.scene.tweens.add({ ... pulsing animation ... });
    
    this.container.add([skipGlow, this.skipPhaseButton]);
}
```

### 2. Added Skip Buttons to Phase 7 (Items)
Added skip button to all three sections of Phase 7:
- **showRelics()**: Skip through relic introduction
- **showPotions()**: Skip through potion introduction  
- **practicePotions()**: Skip potion practice

**Location**: `bathala/src/game/scenes/Prologue/phases/Phase7_Items.ts`

Each section now includes:
```typescript
this.createSkipPhaseButton(() => {
    this.scene.tweens.add({
        targets: this.container.getAll(),
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            this.container.removeAll(true);
            this.onComplete();
        }
    });
});
```

## Positioning

### Skip Button Layout
```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│                                            │
│         PHASE CONTENT                      │
│                                            │
│                                            │
│                                            │
│                              [Skip Phase ➜]│
└────────────────────────────────────────────┘
```

- **X Position**: 88% from left (12% margin from right edge)
- **Y Position**: 92% from top (8% margin from bottom)
- **Stays consistent** with TutorialManager's global skip buttons

## Phases That Can Be Skipped

### ✅ Currently Implemented
- Phase 7 (Items) - All 3 sections

### 📋 Recommended for Future Implementation
To add skip buttons to other phases, simply call in the `start()` method:

```typescript
public start(): void {
    // ... existing code ...
    
    // Add skip button
    this.createSkipPhaseButton(() => {
        // Fade out and call onComplete
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.container.removeAll(true);
                this.onComplete();
            }
        });
    });
    
    // ... rest of phase logic ...
}
```

**Phases to consider**:
- Phase 1 (Welcome)
- Phase 2 (Understanding Cards)
- Phase 3 (Hand Types)
- Phase 4 (Combat Actions)
- Phase 5 (Discard Mechanic)
- Phase 9 (Moral Choice)
- Phase 10 (Advanced Concepts)
- Phase 11 (Final Trial)

## User Experience

### Benefits
1. **Player Control**: Players can skip phases they already understand
2. **Replay Value**: Easier to test specific phases during development
3. **Accessibility**: Reduces friction for returning players
4. **Consistent UI**: Skip button in same location as TutorialManager's buttons

### Visual Feedback
- Button has pulsing glow effect (same as TutorialManager)
- Fades in with phase content
- Fades out smoothly when clicked
- Non-intrusive placement in bottom-right

## Build Status
✅ Build successful with no errors or warnings

## Testing Checklist
- [ ] Phase 7 shows skip button in all 3 sections
- [ ] Skip button positioned in bottom-right corner
- [ ] Skip button has pulsing glow effect
- [ ] Clicking skip button transitions to next phase
- [ ] Skip button fades out with phase content
- [ ] Button doesn't obstruct important content

## Future Enhancements
1. Add skip button to all phases for consistency
2. Consider adding keyboard shortcut (e.g., ESC key)
3. Track skip analytics to understand which phases players skip most
4. Add confirmation dialog for final trial skip

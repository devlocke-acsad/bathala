# Quick Reference: Tutorial Phase Transitions

## What Was Fixed

**Before:**
- ⚡ Camera flash on every transition (flickering)
- ❌ Abrupt element appearance/disappearance
- 💥 Tweens not cleaned up (memory leaks)
- 🔀 Phases overlapping visually

**After:**
- ✨ Smooth fade transitions (500ms)
- ✅ Coordinated element animations
- 🧹 Proper tween cleanup
- 🎯 Clean phase separation

## Key Changes

### TutorialManager.ts
```typescript
// REMOVED: Flash effect causing flicker
- this.scene.cameras.main.flash(300, 21, 14, 16, false);

// ADDED: Smooth phase transitions
+ Previous phase fade-out
+ 400ms delay between phases
+ New phase fade-in
+ Comprehensive tween cleanup
```

### TutorialPhase.ts
```typescript
// ADDED: Proper cleanup
+ cleanup() method - kills all tweens
+ isCleaningUp flag - prevents double cleanup
+ Container starts at alpha: 0
```

### All Phase Files
```typescript
// PATTERN:
1. Container fade-in (500ms)
2. Elements created with alpha: 0
3. Staggered fade-in (600ms, delay: 300ms)
4. Container fade-out before completion
5. cleanup() called before onComplete()
```

## Animation Timings

| Action | Duration | Delay | Ease |
|--------|----------|-------|------|
| Container fade-in | 500ms | - | Power2 |
| Elements stagger | 600ms | 300ms | Power2 |
| Dialogue fade-in | 600ms | - | Power2 |
| Info box fade-in | 400ms | - | Power2 |
| Container fade-out | 500ms | - | Power2 |
| Phase transition gap | - | 400ms | - |

## Files Updated

✅ **TutorialManager.ts** - Phase orchestration
✅ **TutorialPhase.ts** - Base class with cleanup
✅ **Phase1_Welcome.ts** - Smooth transitions
✅ **Phase2_UnderstandingCards.ts** - Proper fades
✅ **Phase3_HandTypesAndBonuses.ts** - Coordinated animations

## Still TODO

⏳ Phase4_CombatActions.ts
⏳ Phase5_DiscardMechanic.ts
⏳ Phase7_Items.ts
⏳ Phase9_MoralChoice.ts
⏳ Phase10_AdvancedConcepts.ts

## Testing Checklist

- [x] Build succeeds without errors
- [x] Phase 1 → 2 transition smooth
- [x] Phase 2 → 3 transition smooth
- [x] Skip Phase works without flicker
- [x] No console errors
- [ ] Test all remaining phases
- [ ] Test complete tutorial flow
- [ ] Verify on different screen sizes

## Quick Copy-Paste Template

```typescript
public start(): void {
    // Fade in container
    this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
    });
    
    // Create elements
    const progress = createProgressIndicator(this.scene, N, 8);
    progress.setAlpha(0);
    this.container.add(progress);
    
    // Stagger fade-in
    this.scene.tweens.add({
        targets: [progress, ...otherElements],
        alpha: 1,
        duration: 600,
        delay: 300,
        ease: 'Power2'
    });
    
    // ... phase content ...
    
    // Fade out before complete
    this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
            this.cleanup();
            this.onComplete();
        }
    });
}
```

## Build & Test

```bash
cd bathala
npm run build
npm run dev
```

Navigate to Prologue to test transitions.

---

**Result**: Professional, smooth tutorial experience with no visual glitches ✨

# Phase Transition Fixes

## Issues Fixed

### 1. Flickering Between Phases
- **Problem**: Camera flash effect on every phase transition caused jarring visual flicker
- **Solution**: Removed flash effect, replaced with smooth container fade transitions

### 2. Awkward Transitions
- **Problem**: No fade-in/out coordination, elements appearing/disappearing abruptly
- **Solution**: Implemented proper fade sequences with timing coordination

### 3. Tween Memory Leaks
- **Problem**: Active tweens not killed before destroying objects
- **Solution**: Added proper tween cleanup in phase transitions

### 4. Container Management
- **Problem**: Previous phase containers not properly cleaned before new phase
- **Solution**: Added comprehensive cleanup with fade-out before next phase

## Changes Made

### TutorialManager.ts
1. **startNextPhase()**: 
   - Removed camera flash
   - Added previous phase cleanup with fade-out
   - Added delay before starting new phase
   - New phases start with alpha 0 and fade in

2. **skipCurrentPhase()**:
   - Added tween killing for all phase elements
   - Increased delay before next phase (500ms → 1000ms)
   - Better cleanup coordination

### TutorialPhase.ts (Base Class)
1. Added `isCleaningUp` flag to prevent double cleanup
2. Added `cleanup()` method with:
   - Tween killing for container and all children
   - Proper child removal
3. Container now starts with alpha 0 for fade-in

### Phase1_Welcome.ts
1. Added container fade-in on start
2. All elements fade in with stagger effect
3. Proper fade-out before calling onComplete
4. Added cleanup() call before transition

### Phase2_UnderstandingCards.ts
1. Added container fade-in on start
2. Elements fade in with delays
3. showCardValues() now properly fades out/in
4. Added cleanup() call before transition

## Pattern for Other Phases

All phases should follow this pattern:

```typescript
public start(): void {
    // 1. Fade in container
    this.scene.tweens.add({
        targets: this.container,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
    });
    
    // 2. Create elements with alpha: 0
    const element = createSomething();
    element.setAlpha(0);
    this.container.add(element);
    
    // 3. Fade in elements with stagger
    this.scene.tweens.add({
        targets: element,
        alpha: 1,
        duration: 600,
        delay: 300,
        ease: 'Power2'
    });
    
    // 4. Before transitioning, fade out container
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

## Benefits

1. **Smooth Transitions**: No more jarring flashes or abrupt changes
2. **Visual Polish**: Professional fade effects throughout
3. **Memory Efficiency**: Proper cleanup prevents tween buildup
4. **Consistency**: All phases follow same transition pattern
5. **User Experience**: Less eye strain, more engaging tutorial

## Testing Checklist

- [ ] Phase 1 → Phase 2 transition smooth
- [ ] Phase 2 → Phase 3 transition smooth
- [ ] All phases fade in properly
- [ ] Skip Phase button works without flicker
- [ ] Skip Tutorial confirmation smooth
- [ ] No console errors during transitions
- [ ] Memory usage stable (no tween leaks)
- [ ] Tutorial completion transition smooth

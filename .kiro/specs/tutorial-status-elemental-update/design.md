# Design Document: Tutorial Update for Status Effects & Elemental System

## Overview

This design updates the existing Phase6_StatusEffects tutorial phase to teach players about the newly implemented status effect and elemental weakness/resistance systems. The approach is to **integrate and enhance** the existing phase structure, not replace it entirely.

### Design Goals

1. **Minimal Disruption**: Reactivate Phase6 without modifying other tutorial phases
2. **Accurate Mechanics**: Reflect the actual implemented combat systems (StatusEffectManager, ElementalAffinitySystem)
3. **Clear Distinction**: Properly explain Burn (player → enemy) vs Poison (enemy → player)
4. **Interactive Learning**: Provide hands-on demonstrations of status effects and elemental affinities
5. **Consistent Experience**: Match the visual style, pacing, and structure of existing phases

### Key Design Principles

- **Build on Existing Structure**: Phase6_StatusEffects already has a section-based flow - enhance it, don't rebuild it
- **Use Actual Systems**: Demonstrate real status effects using StatusEffectManager, not mock implementations
- **Progressive Disclosure**: Introduce concepts in order: buffs → debuffs → elemental affinities → integration
- **Visual Consistency**: Use the same UI components (createPhaseHeader, createInfoBox, showDialogue) as other phases

## Architecture

### High-Level Component Structure

```
TutorialManager (modified)
├── Uncomment Phase6_StatusEffects import
├── Add Phase6 to phases array (between Phase5 and Phase7)
└── Update phase navigation names array

Phase6_StatusEffects (enhanced)
├── Section 1: Buffs Introduction
├── Section 2: Debuffs Introduction  
├── Section 3: Elemental Affinities (NEW)
├── Section 4: Interactive Practice (NEW)
└── Cleanup and transition to Phase7

Progress Indicators (updated)
└── Show "Phase 6 of 9" instead of current phase numbers
```

### Integration Points

1. **TutorialManager.ts**: 
   - Uncomment `import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';`
   - Add Phase6 instantiation to phases array
   - Update phaseNames array in showPhaseNavigation()

2. **Phase6_StatusEffects.ts**:
   - Keep existing structure (currentSection, nextSection, showNextContent)
   - Update Section 1 (Buffs) with accurate status effect descriptions
   - Update Section 2 (Debuffs) with Burn vs Poison distinction
   - Add Section 3 (Elemental Affinities)
   - Add Section 4 (Interactive Practice)

3. **Progress Indicators**:
   - Update all createProgressIndicator calls to show correct total (9 instead of 8)

## Component Details

### Phase6_StatusEffects Structure

The phase will have 4 sections (up from the current 2):

```typescript
export class Phase6_StatusEffects extends TutorialPhase {
    private currentSection: number = 0;

    constructor(scene: Scene, tutorialUI: TutorialUI, private onComplete: () => void) {
        super(scene, tutorialUI);
    }

    public start(): void {
        this.nextSection();
    }

    private nextSection(): void {
        this.currentSection++;
        
        if (this.currentSection > 1) {
            // Fade out previous content
            this.scene.tweens.add({
                targets: this.container.getAll(),
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    this.container.removeAll(true);
                    this.showNextContent();
                }
            });
        } else {
            this.showNextContent();
        }
    }

    private showNextContent(): void {
        switch (this.currentSection) {
            case 1:
                this.showBuffsIntro();
                break;
            case 2:
                this.showDebuffsIntro();
                break;
            case 3:
                this.showElementalAffinities(); // NEW
                break;
            case 4:
                this.showInteractivePractice(); // NEW
                break;
            default:
                this.onComplete();
                break;
        }
    }

    // Section implementations...
}
```

### Section 1: Buffs Introduction (Enhanced)

**Purpose**: Teach beneficial status effects with accurate mechanics

**Content Updates**:
- Update dialogue to reflect actual implemented status effects
- Use correct emoji icons from StatusEffectManager
- Explain stacking behavior and trigger timing

```typescript
private showBuffsIntro(): void {
    const progress = createProgressIndicator(this.scene, 6, 9); // Updated total
    this.container.add(progress);

    const header = createPhaseHeader(
        this.scene,
        'Status Effects: Buffs',
        'Beneficial effects that enhance your power'
    );
    this.container.add(header);

    const dialogue = `Status effects shape battles. First, BUFFS:

💪 STRENGTH: +3 damage per stack
🛡️ PLATED ARMOR: Grants block at start of turn, reduces by 1
💚 REGENERATION: Heals HP at start of turn, reduces by 1
✨ RITUAL: Grants +1 Strength at end of turn

Buffs stack up! Use them strategically to overpower enemies.`;

    this.scene.time.delayedCall(700, () => {
        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            const tip = createInfoBox(
                this.scene,
                'Earth Special grants Plated Armor - perfect for defense!',
                'tip'
            );
            this.container.add(tip);

            this.scene.time.delayedCall(2000, () => {
                this.nextSection();
            });
        });
        this.container.add(dialogueBox);
    });
}
```

### Section 2: Debuffs Introduction (Enhanced)

**Purpose**: Teach harmful status effects with Burn vs Poison distinction

**Content Updates**:
- Clearly distinguish Burn (player inflicts) from Poison (enemy inflicts)
- Update dialogue to reflect actual implemented debuffs
- Remove non-existent status effects (STUN, SEAL were not in the spec)

```typescript
private showDebuffsIntro(): void {
    const progress = createProgressIndicator(this.scene, 6, 9);
    this.container.add(progress);

    const header = createPhaseHeader(
        this.scene,
        'Status Effects: Debuffs',
        'Harmful effects that weaken combatants'
    );
    this.container.add(header);

    const dialogue = `Now DEBUFFS - harmful effects:

🔥 BURN: You inflict this on enemies with Fire Special
   Deals damage at start of enemy's turn, reduces by 1

☠️ POISON: Enemies inflict this on you
   Deals damage at start of your turn, reduces by 1

⚠️ WEAK: Reduces attack damage by 25% per stack
🛡️💔 VULNERABLE: Take 50% more damage from all sources
🔻 FRAIL: Defend actions grant 25% less block per stack

Burn and Poison work the same way - just different names!`;

    this.scene.time.delayedCall(700, () => {
        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            const info = createInfoBox(
                this.scene,
                'Fire Special applies Burn to enemies - watch them suffer!',
                'info'
            );
            this.container.add(info);

            this.scene.time.delayedCall(2500, () => {
                this.nextSection();
            });
        });
        this.container.add(dialogueBox);
    });
}
```

### Section 3: Elemental Affinities (NEW)

**Purpose**: Introduce elemental weakness/resistance system

**Content**:
- Explain 1.5× weakness and 0.75× resistance multipliers
- Show visual indicators (element symbols: 🔥💧🌿💨)
- Demonstrate how to identify enemy affinities

```typescript
private showElementalAffinities(): void {
    const progress = createProgressIndicator(this.scene, 6, 9);
    this.container.add(progress);

    const header = createPhaseHeader(
        this.scene,
        'Elemental Affinities',
        'Exploit weaknesses, avoid resistances'
    );
    this.container.add(header);

    const dialogue = `Every enemy has elemental affinities:

WEAKNESS: Enemy takes 1.5× damage from this element
RESISTANCE: Enemy takes 0.75× damage from this element

🔥 Apoy (Fire)  💧 Tubig (Water)
🌿 Lupa (Earth)  💨 Hangin (Air)

Look for symbols above enemy health bars!
Match your cards to exploit weaknesses for massive damage.`;

    this.scene.time.delayedCall(700, () => {
        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            // Create a visual example showing enemy with weakness/resistance icons
            const exampleContainer = this.createAffinityExample();
            this.container.add(exampleContainer);

            this.scene.time.delayedCall(3500, () => {
                this.nextSection();
            });
        });
        this.container.add(dialogueBox);
    });
}

private createAffinityExample(): Phaser.GameObjects.Container {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    const container = this.scene.add.container(screenWidth / 2, screenHeight * 0.55);
    
    // Example enemy sprite
    const enemySprite = this.scene.add.sprite(0, 0, 'tikbalang_combat');
    enemySprite.setScale(1.5);
    if (enemySprite.texture) {
        enemySprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    container.add(enemySprite);
    
    // Weakness indicator (above enemy)
    const weaknessText = this.scene.add.text(-80, -120, '🔥 Weak', {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#ff6b6b',
        align: 'center'
    }).setOrigin(0.5);
    container.add(weaknessText);
    
    // Resistance indicator (above enemy)
    const resistanceText = this.scene.add.text(80, -120, '💧 Resist', {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#5BA3D0',
        align: 'center'
    }).setOrigin(0.5);
    container.add(resistanceText);
    
    // Info box below
    const infoText = this.scene.add.text(0, 100, 'Use Fire cards for 1.5× damage!\nAvoid Water cards (only 0.75× damage)', {
        fontFamily: 'dungeon-mode',
        fontSize: 18,
        color: '#FFD700',
        align: 'center'
    }).setOrigin(0.5);
    container.add(infoText);
    
    return container;
}
```

### Section 4: Interactive Practice (NEW)

**Purpose**: Let players practice applying status effects in a safe environment

**Content**:
- Mini combat simulation similar to Phase4_CombatActions
- Player uses Fire Special to apply Burn to enemy
- Show Burn triggering at start of enemy turn
- Demonstrate elemental weakness bonus

```typescript
private showInteractivePractice(): void {
    const progress = createProgressIndicator(this.scene, 6, 9);
    this.container.add(progress);

    const header = createPhaseHeader(
        this.scene,
        'Practice: Status Effects',
        'Apply Burn and exploit elemental weakness'
    );
    this.container.add(header);

    const dialogue = `Let's practice! You'll face a Tikbalang Scout.

GOAL: Use Fire Special to apply Burn
The Tikbalang is WEAK to Fire (1.5× damage)!

Select 5 cards with Fire (Apoy) suits for maximum effect.`;

    this.scene.time.delayedCall(700, () => {
        const dialogueBox = showDialogue(this.scene, dialogue, () => {
            this.scene.time.delayedCall(1500, () => {
                this.scene.tweens.add({
                    targets: [progress, header, dialogueBox],
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        this.container.removeAll(true);
                        this.startBurnPractice();
                    }
                });
            });
        });
        this.container.add(dialogueBox);
    });
}

private startBurnPractice(): void {
    // Similar structure to Phase4_CombatActions.createCombatScene()
    // But focused on demonstrating:
    // 1. Fire Special application
    // 2. Burn status effect appearing on enemy
    // 3. Elemental weakness multiplier (1.5×)
    // 4. Burn triggering at start of next turn
    
    const enemyData = { ...TIKBALANG_SCOUT, id: 'tutorial_tikbalang_burn' };
    
    // Create combat scene with Fire Special focus
    this.createStatusEffectPracticeScene(enemyData, () => {
        // Success! Move to next phase
        this.scene.tweens.add({
            targets: this.container.getAll(),
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => this.onComplete()
        });
    });
}

private createStatusEffectPracticeScene(enemyData: any, onSuccess: () => void): void {
    // Implementation similar to Phase4's createCombatScene
    // Key differences:
    // - Only allow Special action
    // - Show status effect icons appearing
    // - Demonstrate turn-based trigger (simulate enemy turn start)
    // - Highlight elemental weakness multiplier in damage calculation
    
    // [Detailed implementation would go here - similar to Phase4_CombatActions]
    // This would be ~200 lines of combat simulation code
}
```

## TutorialManager Integration

### Changes Required

```typescript
// 1. Uncomment import (line 7)
import { Phase6_StatusEffects } from './phases/Phase6_StatusEffects';

// 2. Add to phases array (line 154)
this.phases = [
    new Phase1_Welcome(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase2_UnderstandingCards(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase3_HandTypesAndBonuses(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase4_CombatActions(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase5_DiscardMechanic(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase6_StatusEffects(this.scene, tutorialUI, this.startNextPhase.bind(this)), // ADDED
    new Phase7_Items(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase9_MoralChoice(this.scene, tutorialUI, this.startNextPhase.bind(this)),
    new Phase10_AdvancedConcepts(this.scene, tutorialUI, this.completeTutorial.bind(this))
];

// 3. Update phase names in showPhaseNavigation() (line 340)
const phaseNames = [
    'Welcome',
    'Understanding Cards',
    'Hand Types & Bonuses',
    'Combat Actions',
    'Discard Mechanic',
    'Status Effects & Elements', // ADDED
    'Items (Relics & Potions)',
    'Moral Choice (Landás)',
    'Advanced Concepts'
];
```

## Progress Indicator Updates

All phases need their progress indicators updated to show the correct total:

- Phase 1: `createProgressIndicator(this.scene, 1, 9)` (was 1, 8)
- Phase 2: `createProgressIndicator(this.scene, 2, 9)` (was 2, 8)
- Phase 3: `createProgressIndicator(this.scene, 3, 9)` (was 3, 8)
- Phase 4: `createProgressIndicator(this.scene, 4, 9)` (was 4, 8)
- Phase 5: `createProgressIndicator(this.scene, 5, 9)` (was 5, 8)
- **Phase 6: `createProgressIndicator(this.scene, 6, 9)` (NEW)**
- Phase 7: `createProgressIndicator(this.scene, 7, 9)` (was 6, 8)
- Phase 9: `createProgressIndicator(this.scene, 8, 9)` (was 7, 8)
- Phase 10: `createProgressIndicator(this.scene, 9, 9)` (was 8, 8)

## Visual Design

### Status Effect Display

When demonstrating status effects, use consistent visual language:

```typescript
// Buff colors: Green/Blue
const buffColor = '#4CAF50'; // Green for positive effects

// Debuff colors: Red/Orange
const debuffColor = '#ff6b6b'; // Red for negative effects

// Status effect icon display
const statusIcon = this.scene.add.text(x, y, '🔥', {
    fontFamily: 'dungeon-mode',
    fontSize: 32
}).setOrigin(0.5);

const statusCount = this.scene.add.text(x + 20, y + 20, '3', {
    fontFamily: 'dungeon-mode',
    fontSize: 20,
    color: debuffColor
}).setOrigin(0.5);
```

### Elemental Affinity Indicators

```typescript
// Weakness indicator (red/orange)
const weaknessIcon = this.scene.add.text(x, y, '🔥 Weak', {
    fontFamily: 'dungeon-mode',
    fontSize: 18,
    color: '#ff6b6b'
}).setOrigin(0.5);

// Resistance indicator (blue)
const resistanceIcon = this.scene.add.text(x, y, '💧 Resist', {
    fontFamily: 'dungeon-mode',
    fontSize: 18,
    color: '#5BA3D0'
}).setOrigin(0.5);
```

### Damage Multiplier Feedback

When showing elemental weakness bonus:

```typescript
// Show base damage
const baseDamageText = this.scene.add.text(x, y, '20', {
    fontFamily: 'dungeon-mode',
    fontSize: 28,
    color: '#E8E8E8'
}).setOrigin(0.5);

// Show multiplier
const multiplierText = this.scene.add.text(x + 40, y, '× 1.5', {
    fontFamily: 'dungeon-mode',
    fontSize: 24,
    color: '#FFD700'
}).setOrigin(0.5);

// Show final damage
const finalDamageText = this.scene.add.text(x + 100, y, '= 30', {
    fontFamily: 'dungeon-mode',
    fontSize: 32,
    color: '#ff6b6b'
}).setOrigin(0.5);
```

## Animation Timing

Maintain consistent timing with other phases:

- **Fade in**: 500-700ms delay, then 600ms fade
- **Dialogue display**: 700ms delay before showing
- **Info boxes**: 1500-2000ms display time
- **Section transitions**: 300ms fade out, 400ms fade in
- **Status effect application**: 400ms animation
- **Damage numbers**: 1000ms float up and fade

## Error Handling

### Cleanup

```typescript
public shutdown(): void {
    // Remove event listeners
    this.scene.events.off('selectCard');
    
    // Kill all tweens
    if (this.container) {
        this.scene.tweens.killTweensOf(this.container);
        this.container.getAll().forEach((child: any) => {
            this.scene.tweens.killTweensOf(child);
        });
    }
    
    // Destroy container
    if (this.container && this.container.active) {
        this.container.destroy();
    }
}
```

### Fallback Handling

```typescript
// If StatusEffectManager not initialized
if (!StatusEffectManager.getDefinition('poison')) {
    console.warn('[Phase6] StatusEffectManager not initialized, using fallback descriptions');
    // Use hardcoded descriptions
}

// If enemy sprite missing
const enemySpriteKey = this.getEnemySpriteKey(enemyData.name);
if (!this.scene.textures.exists(enemySpriteKey)) {
    console.warn(`[Phase6] Enemy sprite ${enemySpriteKey} not found, using fallback`);
    // Use placeholder rectangle
}
```

## Testing Strategy

### Manual Testing Checklist

1. **Phase Transition**:
   - [ ] Phase 5 → Phase 6 transition is smooth
   - [ ] Phase 6 → Phase 7 transition is smooth
   - [ ] Skip Phase button works correctly
   - [ ] Phase Navigation shows Phase 6 correctly

2. **Content Display**:
   - [ ] Section 1 (Buffs) displays correctly
   - [ ] Section 2 (Debuffs) displays correctly with Burn vs Poison distinction
   - [ ] Section 3 (Elemental Affinities) shows visual examples
   - [ ] Section 4 (Interactive Practice) combat simulation works

3. **Visual Consistency**:
   - [ ] Progress indicators show "6 of 9"
   - [ ] Headers match other phases' style
   - [ ] Dialogue boxes use consistent formatting
   - [ ] Status effect icons display correctly

4. **Interactive Elements**:
   - [ ] Card selection works in practice section
   - [ ] Fire Special applies Burn status effect
   - [ ] Burn triggers at start of turn
   - [ ] Elemental weakness multiplier displays correctly

5. **Cleanup**:
   - [ ] No memory leaks when skipping phase
   - [ ] No lingering event listeners
   - [ ] No visual artifacts after phase completion

## Implementation Notes

### Reusing Phase4 Combat Code

The interactive practice section can reuse significant code from Phase4_CombatActions:

```typescript
// Reusable methods from Phase4:
- createCombatScene() structure
- displayPlayedCards()
- createCardSpriteForPlayed()
- getEnemySpriteKey()

// Modifications needed:
- Lock to Special action only
- Add status effect display
- Simulate enemy turn to show Burn trigger
- Highlight elemental multiplier in damage calculation
```

### StatusEffectManager Integration

```typescript
// Get actual status effect definitions
const poisonDef = StatusEffectManager.getDefinition('poison');
const strengthDef = StatusEffectManager.getDefinition('strength');

// Use real emoji icons
const poisonEmoji = poisonDef.emoji; // ☠️
const strengthEmoji = strengthDef.emoji; // 💪

// Use real descriptions
const poisonDesc = poisonDef.description;
```

### ElementalAffinitySystem Integration

```typescript
// Get actual enemy affinities
const tikbalangAffinity = TIKBALANG_SCOUT.elementalAffinity;
// { weakness: "fire", resistance: "water" }

// Calculate real multipliers
const weaknessMultiplier = ElementalAffinitySystem.calculateElementalMultiplier(
    "fire",
    tikbalangAffinity
); // Returns 1.5

// Display affinity icons
const affinityDisplay = ElementalAffinitySystem.getAffinityDisplayData(tikbalangAffinity);
```

## Performance Considerations

- **Sprite Reuse**: Reuse enemy sprites from Phase4 rather than creating new ones
- **Tween Cleanup**: Always kill tweens before destroying containers
- **Event Listener Cleanup**: Remove all event listeners in shutdown()
- **Container Management**: Destroy containers after fade-out completes
- **Texture Caching**: Use existing card textures, don't generate new ones

## Backward Compatibility

- **Save Files**: No impact - tutorial doesn't affect save data
- **Existing Players**: Players who completed tutorial before this update won't see Phase 6
- **Skip Tutorial**: Still works correctly with Phase 6 included
- **Phase Navigation**: Existing navigation UI adapts to 9 phases automatically

## Future Extensibility

This design allows for future enhancements:

1. **Additional Status Effects**: Easy to add new effects to Section 1 or 2
2. **More Practice Scenarios**: Can add more interactive sections
3. **Advanced Combos**: Could add Section 5 showing status effect + elemental combos
4. **Enemy Demonstrations**: Could show enemies applying Poison to player
5. **Relic Integration**: Could preview relics that modify status effects

## Summary

This design integrates Phase6_StatusEffects into the tutorial by:

1. **Reactivating** the existing phase file with enhanced content
2. **Adding** 2 new sections (Elemental Affinities, Interactive Practice)
3. **Updating** existing sections with accurate mechanics and Burn vs Poison distinction
4. **Integrating** seamlessly with TutorialManager and other phases
5. **Maintaining** visual consistency and code patterns from existing phases

The implementation focuses on **addition and enhancement** rather than complete replacement, minimizing risk and maintaining the tutorial's existing flow and feel.

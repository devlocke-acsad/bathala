# Combat Scene R## Current Status

**🟢 Phase 1 Complete - Fully Functional**
- ✅ CombatUI.ts created with all UI methods (1507 lines)
- ✅ Integrated into Combat.ts and fully working
- ✅ All tests passed - combat scene works perfectly
- ✅ Temporary bridge code (`assignToScene()`) maintains compatibility
- ⚠️ Combat.ts still contains duplicate UI code (marked but not removed)
- **Decision**: Keep duplicate code for now, mark clearly, remove in future cleanup pass

### What Was Accomplished:
1. **Separated concerns**: UI code is now in dedicated CombatUI class
2. **Maintained functionality**: All features work identically
3. **Improved maintainability**: Future UI changes only need CombatUI edits
4. **Clear architecture**: Combat.ts → game logic, CombatUI.ts → presentation

### Future Cleanup (Optional Phase 2):
- Remove ~2000 lines of duplicate UI methods from Combat.ts
- Remove `assignToScene()` bridge code
- Update all internal references to use `this.ui.*` pattern
- Estimated outcome: Combat.ts reduced to ~4200 lines

### Next Steps:
- ✅ **Phase 1 Complete - Ready for Production**
- **Future**: Phase 3 - Extract animations to CombatAnimations.tsan

**Date**: October 11, 2025  
**Branch**: feat/uiCombat  
**Current File Size**: 6382 lines  
**Goal**: Split into manageable, maintainable modules

---

## Overview

The `Combat.ts` file has grown too large and needs to be refactored into three main components:

1. **CombatUI.ts** - All UI creation, update, and management methods (~2000-2500 lines)
2. **CombatAnimations.ts** - All animation and visual effect methods ---

## Current Status

**� Phase 1 Complete - Integration Done, Cleanup Pending**
- CombatUI.ts created with all UI methods (1507 lines)
- Integrated into Combat.ts and working
- Temporary bridge code added (`assignToScene()`) for compatibility
- **Combat.ts still contains ~2000 lines of duplicate UI code** (marked but not removed)
- Ready for testing - if tests pass, proceed to Phase 2 cleanup

### Next Steps:
1. **Test thoroughly** - Verify all combat functionality works
2. **Phase 2**: Remove duplicate UI code from Combat.ts (~2000 line reduction)
3. **Phase 3**: Extract animations to CombatAnimations.ts
**Progress**: 
- ✅ Created CombatUI.ts with all UI methods
- ✅ Added complex methods: updateActionButtons, updateHandDisplay, createCardSprite
- ⏳ Next: Add accessor methods to Combat.ts for CombatUI integration
- ⏳ Then: Integrate CombatUI into Combat.ts and test

**Current Step**: Adding public accessor methods to Combat.ts
**Next Step**: Integrate CombatUI and remove duplicate code from Combat.ts-1000 lines)
3. **Combat.ts** - Core combat logic and game state management (~2500-3000 lines)

---

## Phase 1: Extract UI Code to CombatUI.ts

### File Location
`bathala/src/game/scenes/combat/CombatUI.ts`

### Methods to Extract

#### UI Creation Methods
- `createCombatUI()` - Main UI setup orchestrator
- `createPlayerUI()` - Player health, block, status display
- `createEnemyUI()` - Enemy health, block, intent, status
- `createHandUI()` - Card hand container
- `createPlayedHandUI()` - Played cards container
- `createActionButtons()` - Button creation
- `createTurnUI()` - Turn counter and actions display
- `createRelicsUI()` - Relic display (legacy)
- `createRelicInventory()` - Modern inventory panel
- `createRelicInventoryToggle()` - Toggle button for inventory
- `createButton()` - Generic button creator (Prologue/Balatro style)
- `createPokerHandInfoButton()` - Info button for poker hands
- `createDeckSprite()` - Deck pile visual
- `createDiscardSprite()` - Discard pile visual
- `createDeckView()` - Deck viewer modal
- `createDiscardView()` - Discard viewer modal
- `createDDADebugOverlay()` - Debug UI for DDA system
- `createDamagePreview()` - Damage preview UI
- `createActionResultUI()` - Action result display
- `createEnemyInfoButton()` - Enemy lore button

#### UI Update Methods
- `updateActionButtons()` - Button state management based on phase
- `updateRelicsUI()` - Legacy relic display updates
- `updateRelicInventory()` - Modern inventory updates
- `updatePlayerUI()` - Player stat updates
- `updateEnemyUI()` - Enemy stat updates
- `updateTurnUI()` - Turn display updates
- `updateHandDisplay()` - Hand visualization with Balatro-style arc
- `updateCardVisuals()` - Individual card appearance updates
- `updateDamagePreview()` - Preview calculation updates
- `updateSelectionCounter()` - Selection counter (0/5) update
- `updateHandIndicator()` - Hand type indicator update
- `updatePlayerStatusEffects()` - Player status icons
- `updateEnemyStatusEffects()` - Enemy status icons
- `updateDDADebugDisplay()` - DDA debug info updates

#### UI Helper Methods
- `createCardSprite()` - Card sprite factory with interactions
- `addSampleCard()` - Sample card for poker reference
- `showActionResult()` - Show result message with fade
- `showRelicTooltip()` - Tooltip display
- `hideRelicTooltip()` - Tooltip hiding
- `showRelicDetailModal()` - Relic detail modal
- `handleResize()` - UI resize handling

### UI Properties to Extract

#### Phaser GameObjects
```typescript
private playerHealthText: Phaser.GameObjects.Text;
private playerBlockText: Phaser.GameObjects.Text;
private enemyHealthText: Phaser.GameObjects.Text;
private enemyBlockText: Phaser.GameObjects.Text;
private enemyIntentText: Phaser.GameObjects.Text;
private handContainer: Phaser.GameObjects.Container;
private playedHandContainer: Phaser.GameObjects.Container;
private actionButtons: Phaser.GameObjects.Container;
private turnText: Phaser.GameObjects.Text;
private actionsText: Phaser.GameObjects.Text;
private handIndicatorText: Phaser.GameObjects.Text;
private relicsContainer: Phaser.GameObjects.Container;
private playerStatusContainer: Phaser.GameObjects.Container;
private enemyStatusContainer: Phaser.GameObjects.Container;
private playerSprite: Phaser.GameObjects.Sprite;
private enemySprite: Phaser.GameObjects.Sprite;
private deckSprite: Phaser.GameObjects.Sprite;
private discardPileSprite: Phaser.GameObjects.Sprite;
private landasChoiceContainer: Phaser.GameObjects.Container;
private rewardsContainer: Phaser.GameObjects.Container;
private gameOverContainer: Phaser.GameObjects.Container;
private deckViewContainer: Phaser.GameObjects.Container;
private discardViewContainer: Phaser.GameObjects.Container;
private actionResultText: Phaser.GameObjects.Text;
private enemyAttackPreviewText: Phaser.GameObjects.Text;
private damagePreviewText: Phaser.GameObjects.Text;
private selectionCounterText: Phaser.GameObjects.Text;
private playerShadow: Phaser.GameObjects.Graphics;
private enemyShadow: Phaser.GameObjects.Graphics;
private handEvaluationText: Phaser.GameObjects.Text;
private relicInventory: Phaser.GameObjects.Container;
private currentRelicTooltip: Phaser.GameObjects.Container | null;
private pokerHandInfoButton: Phaser.GameObjects.Container;
private ddaDebugContainer: Phaser.GameObjects.Container | null;
```

#### UI State Properties
```typescript
private cardSprites: Phaser.GameObjects.Container[];
private playedCardSprites: Phaser.GameObjects.Container[];
private deckPosition: { x: number; y: number };
private discardPilePosition: { x: number; y: number };
private battleStartDialogueContainer: Phaser.GameObjects.Container | null;
private ddaDebugVisible: boolean;
```

---

## Phase 2: Extract Animation Code to CombatAnimations.ts

### File Location
`bathala/src/game/scenes/combat/CombatAnimations.ts`

### Methods to Extract

#### Dialogue Animations
- `showBattleStartDialogue()` - Prologue-style battle intro
- `showEnemyDialogue()` - Enemy speech bubble with fade-in
- `getEnemyDialogue()` - Get dialogue text for enemy type
- `getBattleStartDialogue()` - Get battle start dialogue

#### Card Animations
- `animateDrawCardsFromDeck()` - Card draw from deck pile
- `animateCardShuffle()` - Shuffle animation with particles
- `animateCardToDiscard()` - Card discard animation
- `selectCard()` - Card selection with bounce and elevation
- `unplayCard()` - Card return to hand animation

#### Combat Animations
- `animateDamage()` - Damage numbers with shake
- `animateHeal()` - Healing numbers with glow
- `animateBlock()` - Block gain with shield effect
- `animateStatusEffect()` - Status effect application
- `animatePlayerAttack()` - Player attack animation
- `animateEnemyAttack()` - Enemy attack animation
- `shakeSprite()` - Sprite shake effect
- `flashSprite()` - Sprite flash effect

#### UI Animations
- `fadeInElement()` - Generic fade in
- `fadeOutElement()` - Generic fade out
- `pulseElement()` - Pulsing glow effect
- `slideInElement()` - Slide in from side
- `slideOutElement()` - Slide out

### Animation Properties
```typescript
private isDrawingCards: boolean;
private activeAnimations: Phaser.Tweens.Tween[];
```

---

## Phase 3: Refactor Combat.ts

### Keep in Combat.ts

#### Core Combat State
- `combatState: CombatState`
- `selectedCards: PlayingCard[]`
- `isActionProcessing: boolean`
- `combatEnded: boolean`
- `turnCount: number`
- `discardsUsedThisTurn: number`
- `maxDiscardsPerTurn: number`
- `bestHandAchieved: HandType`
- `kapresCigarUsed: boolean`

#### DDA Properties
- `dda: RuleBasedDDA`
- `combatStartTime: number`
- `initialPlayerHealth: number`
- `totalDiscardsUsed: number`

#### Core Combat Methods
- `create()` - Scene initialization
- `initializeCombat()` - Combat setup
- `getEnemyForNodeType()` - Enemy selection
- `generateEnemyId()` - Enemy ID generation
- `getEnemySpriteKey()` - Sprite key mapping
- `startPlayerTurn()` - Player turn start
- `endPlayerTurn()` - Player turn end
- `startEnemyTurn()` - Enemy turn start
- `executeAction()` - Action execution (attack/defend/special)
- `playSelectedCards()` - Play card logic
- `discardSelectedCards()` - Discard logic
- `drawCards()` - Draw card logic
- `sortHand()` - Hand sorting
- `getDominantSuit()` - Suit calculation
- `getSpecialActionName()` - Special action naming
- `calculateDamage()` - Damage calculation
- `calculateBlock()` - Block calculation
- `applyDamage()` - Damage application
- `applyBlock()` - Block application
- `applyStatusEffect()` - Status effect application
- `processStatusEffects()` - Status effect processing
- `checkCombatEnd()` - Combat end check
- `handleCombatVictory()` - Victory handling
- `handleCombatDefeat()` - Defeat handling
- `showPostCombatChoice()` - Landas choice
- `handleLandasChoice()` - Choice handling
- `showRewardsScreen()` - Rewards display
- `collectReward()` - Reward collection
- `returnToOverworld()` - Scene transition

#### Relic/DDA Integration
- `applyRelicEffects()` - Relic effect application
- `updateDDAMetrics()` - DDA tracking
- `recordCombatMetrics()` - Metrics recording

#### Data/Dialogue
- `creatureDialogues: Record<string, CreatureDialogue>`

---

## Implementation Strategy

### Step 1: Create Directory Structure
```
bathala/src/game/scenes/combat/
├── CombatUI.ts
├── CombatAnimations.ts
└── index.ts (for exports)
```

### Step 2: Create CombatUI Class

```typescript
import { Scene } from "phaser";
import { CombatState, PlayingCard } from "../../../core/types/CombatTypes";
import { Combat } from "../Combat";

/**
 * CombatUI - Handles all UI creation, updates, and management for Combat scene
 */
export class CombatUI {
  private scene: Combat;
  
  // All UI-related properties from Combat.ts
  public playerHealthText!: Phaser.GameObjects.Text;
  public playerBlockText!: Phaser.GameObjects.Text;
  // ... (all other UI properties)
  
  constructor(scene: Combat) {
    this.scene = scene;
  }
  
  /**
   * Initialize all UI elements
   */
  public initialize(): void {
    this.createCombatUI();
    this.createRelicInventory();
    this.createDeckSprite();
    this.createDiscardSprite();
    this.createDeckView();
    this.createDiscardView();
    this.createDDADebugOverlay();
  }
  
  // All UI creation methods...
  // All UI update methods...
  // All UI helper methods...
}
```

### Step 3: Create CombatAnimations Class

```typescript
import { Combat } from "../Combat";
import { CombatUI } from "./CombatUI";
import { PlayingCard } from "../../../core/types/CombatTypes";

/**
 * CombatAnimations - Handles all animations and visual effects for Combat scene
 */
export class CombatAnimations {
  private scene: Combat;
  private ui: CombatUI;
  private isDrawingCards: boolean = false;
  
  constructor(scene: Combat, ui: CombatUI) {
    this.scene = scene;
    this.ui = ui;
  }
  
  // All animation methods...
}
```

### Step 4: Modify Combat.ts

```typescript
import { Scene } from "phaser";
import { CombatUI } from "./combat/CombatUI";
import { CombatAnimations } from "./combat/CombatAnimations";

export class Combat extends Scene {
  // Core combat state
  private combatState!: CombatState;
  
  // UI and Animation handlers (public for access)
  public ui!: CombatUI;
  public animations!: CombatAnimations;
  
  // Core combat properties only
  private selectedCards: PlayingCard[] = [];
  private isActionProcessing: boolean = false;
  // ...
  
  create(data: { nodeType: string, transitionOverlay?: any }): void {
    // Initialize UI handler
    this.ui = new CombatUI(this);
    
    // Add background
    const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "forest_bg");
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    
    const overlay = this.add.rectangle(
      this.cameras.main.centerX, 
      this.cameras.main.centerY, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      0x150E10
    ).setAlpha(0.50);
    
    // Initialize combat
    this.initializeCombat(data.nodeType);
    
    // Initialize UI
    this.ui.initialize();
    
    // Initialize animations
    this.animations = new CombatAnimations(this, this.ui);
    
    // Draw initial hand
    this.animations.drawInitialHand();
    
    // Handle transition
    if (data.transitionOverlay) {
      // ... transition logic
    }
  }
  
  // Core combat methods only...
}
```

---

## Migration Checklist

### Phase 1: CombatUI.ts
- [ ] Create `bathala/src/game/scenes/combat/` directory
- [ ] Create `CombatUI.ts` file
- [ ] Copy UI property declarations
- [ ] Copy all `create*UI()` methods
- [ ] Copy all `update*()` UI methods
- [ ] Copy all UI helper methods
- [ ] Update method signatures to use `this.scene` instead of `this`
- [ ] Test compilation
- [ ] Test runtime functionality

### Phase 2: CombatAnimations.ts
- [ ] Create `CombatAnimations.ts` file
- [ ] Copy animation property declarations
- [ ] Copy all `show*()` dialogue methods
- [ ] Copy all `animate*()` methods
- [ ] Copy card interaction animations
- [ ] Update method signatures
- [ ] Test compilation
- [ ] Test runtime functionality

### Phase 3: Combat.ts Cleanup
- [ ] Remove extracted UI methods
- [ ] Remove extracted animation methods
- [ ] Remove extracted properties
- [ ] Update `create()` method to use new classes
- [ ] Update all method calls to use `this.ui.*` or `this.animations.*`
- [ ] Test compilation
- [ ] Test runtime functionality
- [ ] Verify all combat features work

### Phase 4: Testing
- [ ] Test player turn flow
- [ ] Test enemy turn flow
- [ ] Test card interactions
- [ ] Test animations
- [ ] Test UI updates
- [ ] Test combat victory
- [ ] Test combat defeat
- [ ] Test Landas choices
- [ ] Test rewards screen
- [ ] Test DDA integration
- [ ] Test relic effects

---

## Benefits

### ✅ Code Organization
- **Reduced file size**: ~2000 lines per file instead of 6382
- **Clear separation of concerns**: UI, animations, and logic separated
- **Better readability**: Easier to find and understand code

### ✅ Maintainability
- **Easier to modify**: Changes to UI don't affect combat logic
- **Easier to debug**: Smaller files, clearer scope
- **Easier to test**: Can test UI, animations, and logic independently

### ✅ Performance
- **Better code splitting**: Potential for lazy loading
- **Clearer dependencies**: Easier to optimize

### ✅ Development Experience
- **Faster file loading**: Smaller files load faster in IDE
- **Better IntelliSense**: More focused autocomplete
- **Easier collaboration**: Less merge conflicts

---

## Notes

### Access Patterns
- Combat.ts can access UI via `this.ui`
- Combat.ts can access animations via `this.animations`
- CombatUI can access scene via `this.scene`
- CombatAnimations can access scene via `this.scene` and UI via `this.ui`

### Public vs Private
- Make properties `public` if they need to be accessed from Combat.ts
- Keep methods `private` if only used within the class
- Use getters/setters for controlled access

### State Management
- Keep all game state in Combat.ts
- UI classes only manage visual representation
- Animation classes only handle visual effects

---

## Timeline

- **Phase 1 (CombatUI)**: 1-2 hours
- **Phase 2 (CombatAnimations)**: 1 hour
- **Phase 3 (Combat cleanup)**: 1 hour
- **Phase 4 (Testing)**: 1-2 hours

**Total Estimated Time**: 4-6 hours

---

**Status**: � In Progress - Phase 1: CombatUI.ts
**Current Step**: Created CombatUI.ts skeleton, now adding remaining UI methods
**Next Step**: Add all UI update methods and complete Combat.ts integration

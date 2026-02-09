# Design Document: Relic System Completion

## Overview

This design ensures all relics in Bathala function correctly with proper trigger points, effect calculations, and visual feedback. The system builds on the existing RelicManager.ts infrastructure while adding comprehensive testing and validation.

### Design Goals

1. **Complete Functionality**: Every relic works as described in its tooltip
2. **Clear Feedback**: Players see when and how relics trigger
3. **Extensibility**: Easy to add Act 2-3 relics without refactoring
4. **Performance**: Efficient relic checking without combat lag
5. **Testability**: Comprehensive test coverage for all relics

## Architecture

### High-Level Component Structure

```
RelicManager (existing, enhanced)
├── Trigger Registration
│   ├── registerRelicModifiers() - Called at combat start
│   ├── StatusEffectManager.registerModifier()
│   └── ElementalAffinitySystem.registerModifier()
├── Trigger Execution
│   ├── applyStartOfCombatEffects()
│   ├── applyStartOfTurnEffects()
│   ├── applyAfterHandPlayedEffects()
│   └── applyEndOfTurnEffects()
├── Effect Calculators
│   ├── calculateDefendBlockBonus()
│   ├── calculateSigbinHeartDamage()
│   ├── calculateMangangawayWandDamage()
│   ├── calculateBungisngisGrinDamage()
│   └── ... (one per relic type)
└── Utility Methods
    ├── getStatusEffectStackBonus()
    ├── getElementalDamageBonus()
    └── isHandTypeAtLeast()

Combat.ts (integration points)
├── startCombat() → RelicManager.applyStartOfCombatEffects()
├── startPlayerTurn() → RelicManager.applyStartOfTurnEffects()
├── afterHandPlayed() → RelicManager.applyAfterHandPlayedEffects()
├── endPlayerTurn() → RelicManager.applyEndOfTurnEffects()
├── calculateAttackDamage() → RelicManager.calculateSigbinHeartDamage()
├── calculateDefendBlock() → RelicManager.calculateDefendBlockBonus()
└── calculateSpecialDamage() → RelicManager.calculateMangangawayWandDamage()

CombatUI.ts (visual feedback)
├── showRelicTrigger(relicName, effect)
├── updateBlockDisplay()
├── updateStatusEffects()
└── showDamageBreakdown()
```

## Relic Implementation Matrix

### Act 1 Relics (20 total)

| Relic | Trigger Point | Effect | Implementation Status |
|-------|--------------|--------|---------------------|
| Earthwarden's Plate | START_OF_COMBAT, START_OF_TURN | +5 Block (combat), +1 Block (turn) | ✅ Implemented |
| Swift Wind Agimat | START_OF_COMBAT | +1 discard charge | ✅ Implemented |
| Ember Fetish | START_OF_TURN | +2 Strength (Block=0), +1 Strength (else) | ✅ Implemented |
| Umalagad's Spirit | AFTER_HAND_PLAYED, DEFEND | +2 Block/card, +4 Block on Defend | ✅ Implemented |
| Babaylan's Talisman | HAND_EVALUATION | Upgrade hand tier by 1 | ✅ Implemented |
| Ancestral Blade | AFTER_HAND_PLAYED | +2 Strength on Flush | ✅ Implemented |
| Tidal Amulet | END_OF_TURN | +1 HP per card in hand | ✅ Implemented |
| Sarimanok Feather | AFTER_HAND_PLAYED | +1 Ginto on Straight+ | ✅ Implemented |
| Diwata's Crown | START_OF_COMBAT, DEFEND | +5 Block, +3 Defend, Enable 5oaK | ✅ Implemented |
| Lucky Charm | AFTER_HAND_PLAYED | +1 Ginto on Straight+ | ✅ Implemented |
| Tikbalang's Hoof | ENEMY_ATTACK | 10% dodge chance | ✅ Implemented |
| Balete Root | AFTER_HAND_PLAYED | +2 Block per Lupa card | ✅ Implemented |
| Sigbin Heart | ATTACK_ACTION | +3 damage on Attack | ✅ Implemented |
| Duwende Charm | DEFEND_ACTION | +3 Block on Defend | ✅ Implemented |
| Tiyanak Tear | START_OF_TURN | +1 Strength | ✅ Implemented |
| Amomongo Claw | ATTACK_ACTION | Apply 1 Vulnerable | ✅ Implemented |
| Bungisngis Grin | ATTACK_ACTION | +4 damage if enemy has debuff | ✅ Implemented |
| Kapre's Cigar | FIRST_ATTACK | Double damage on first Attack | ✅ Implemented |
| Mangangaway Wand | SPECIAL_ACTION | +5 damage on Special | ✅ Implemented |
| Stone Golem Heart | ACQUISITION | +8 Max HP permanently | ✅ Implemented |

### Verification Needed

All relics are implemented in RelicManager.ts, but we need to verify:
1. Combat.ts calls all trigger points correctly
2. Visual feedback appears for all effects
3. Edge cases are handled (multiple copies, stacking, etc.)

## Detailed Relic Mechanics

### Start of Combat Relics

```typescript
// Called once at combat start
RelicManager.applyStartOfCombatEffects(player);

// Earthwarden's Plate
player.block += 5;

// Swift Wind Agimat
player.discardCharges += 1;
player.maxDiscardCharges += 1;

// Diwata's Crown
player.block += 5;

// Stone Golem Heart (if just acquired)
player.maxHealth += 8;
player.currentHealth += 8;
```

### Start of Turn Relics

```typescript
// Called at start of each player turn
RelicManager.applyStartOfTurnEffects(player);

// Ember Fetish
if (player.block === 0) {
  addStrengthEffect(player, "strength_ember", 2);
} else {
  addStrengthEffect(player, "strength_ember", 1);
}

// Earthwarden's Plate
player.block += 1;

// Tiyanak Tear
addStrengthEffect(player, "strength_tiyanak", 1);
```

### After Hand Played Relics

```typescript
// Called after hand evaluation
RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);

// Ancestral Blade
if (evaluation.type === "flush") {
  addStrengthEffect(player, "strength_ancestral", 2);
}

// Sarimanok Feather / Lucky Charm
if (isHandTypeAtLeast(evaluation.type, "straight")) {
  player.ginto += 1;
}

// Umalagad's Spirit
const cardsPlayed = hand.length;
player.block += cardsPlayed * 2;

// Balete Root
const lupaCards = hand.filter(c => c.suit === "Lupa").length;
player.block += lupaCards * 2;
```

### Action-Specific Relics

```typescript
// Attack Action
let damage = baseDamage;
damage += RelicManager.calculateSigbinHeartDamage(player); // +3
damage += RelicManager.calculateBungisngisGrinDamage(player, enemy); // +4 if debuffed

if (RelicManager.shouldApplyKapresCigarDouble(player, this)) {
  damage *= 2; // First attack only
}

if (RelicManager.shouldApplyAmomongoVulnerable(player)) {
  applyStatusEffect(enemy, "vulnerable", 1);
}

// Defend Action
let block = baseBlock;
block += RelicManager.calculateDefendBlockBonus(player); // +4 (Umalagad) +3 (Diwata) +3 (Duwende)

// Special Action
let damage = baseDamage;
damage += RelicManager.calculateMangangawayWandDamage(player); // +5
```

### End of Turn Relics

```typescript
// Called at end of player turn
RelicManager.applyEndOfTurnEffects(player);

// Tidal Amulet
const healAmount = player.hand.length * 1;
player.currentHealth = Math.min(player.maxHealth, player.currentHealth + healAmount);
```

## Combat Integration Points

### Combat.ts Modifications

```typescript
class Combat extends Phaser.Scene {
  
  startCombat(): void {
    // ... existing setup ...
    
    // Apply relic effects
    RelicManager.registerRelicModifiers(this.player);
    RelicManager.applyStartOfCombatEffects(this.player);
    
    // Show visual feedback
    this.showRelicTriggers("START_OF_COMBAT");
  }
  
  startPlayerTurn(): void {
    // Apply start-of-turn status effects first
    this.applyStartOfTurnStatusEffects();
    
    // Then apply relic effects
    RelicManager.applyStartOfTurnEffects(this.player);
    
    // Show visual feedback
    this.showRelicTriggers("START_OF_TURN");
    
    // Draw cards
    this.drawCards();
  }
  
  afterHandPlayed(hand: PlayingCard[], evaluation: any): void {
    // Apply relic effects
    RelicManager.applyAfterHandPlayedEffects(this.player, hand, evaluation);
    
    // Show visual feedback
    this.showRelicTriggers("AFTER_HAND_PLAYED");
  }
  
  endPlayerTurn(): void {
    // Apply relic effects
    RelicManager.applyEndOfTurnEffects(this.player);
    
    // Show visual feedback
    this.showRelicTriggers("END_OF_TURN");
    
    // ... existing cleanup ...
  }
  
  calculateAttackDamage(baseValue: number): number {
    let damage = baseValue;
    
    // Add relic bonuses
    damage += RelicManager.calculateSigbinHeartDamage(this.player);
    damage += RelicManager.calculateBungisngisGrinDamage(this.player, this.currentEnemy);
    
    // Check for Kapre's Cigar double damage
    if (RelicManager.shouldApplyKapresCigarDouble(this.player, this)) {
      damage *= 2;
      this.showRelicTrigger("Kapre's Cigar", "Double Damage!");
    }
    
    return damage;
  }
  
  calculateDefendBlock(baseValue: number): number {
    let block = baseValue;
    
    // Add relic bonuses
    block += RelicManager.calculateDefendBlockBonus(this.player);
    
    return block;
  }
  
  calculateSpecialDamage(baseValue: number): number {
    let damage = baseValue;
    
    // Add relic bonuses
    damage += RelicManager.calculateMangangawayWandDamage(this.player);
    
    return damage;
  }
  
  applyAttackToEnemy(damage: number): void {
    // Apply damage
    this.currentEnemy.currentHealth -= damage;
    
    // Check for Amomongo Claw
    if (RelicManager.shouldApplyAmomongoVulnerable(this.player)) {
      const stacks = RelicManager.getAmomongoVulnerableStacks(this.player);
      this.applyStatusEffect(this.currentEnemy, "vulnerable", stacks);
      this.showRelicTrigger("Amomongo Claw", `Applied ${stacks} Vulnerable`);
    }
  }
  
  private showRelicTriggers(triggerPoint: string): void {
    const relics = RelicManager.getPlayerRelicsWithEffect(this.player, triggerPoint);
    
    relics.forEach(relic => {
      this.combatUI.showRelicTrigger(relic.name, this.getRelicEffectText(relic));
    });
  }
  
  private getRelicEffectText(relic: Relic): string {
    // Return human-readable effect description
    switch (relic.id) {
      case "earthwardens_plate": return "+1 Block";
      case "ember_fetish": return this.player.block === 0 ? "+2 Strength" : "+1 Strength";
      case "tiyanak_tear": return "+1 Strength";
      // ... etc
      default: return "Effect triggered";
    }
  }
}
```

## Visual Feedback System

### CombatUI.ts Enhancements

```typescript
class CombatUI {
  
  showRelicTrigger(relicName: string, effectText: string): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Create relic trigger notification
    const notification = this.scene.add.container(screenWidth / 2, screenHeight * 0.15);
    
    // Background
    const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x2C3E50, 0.9);
    bg.setStrokeStyle(2, 0xF39C12);
    notification.add(bg);
    
    // Relic name
    const nameText = this.scene.add.text(0, -12, relicName, {
      fontFamily: 'dungeon-mode',
      fontSize: 18,
      color: '#F39C12'
    }).setOrigin(0.5);
    notification.add(nameText);
    
    // Effect text
    const effectTextObj = this.scene.add.text(0, 12, effectText, {
      fontFamily: 'dungeon-mode',
      fontSize: 16,
      color: '#ECF0F1'
    }).setOrigin(0.5);
    notification.add(effectTextObj);
    
    // Animate in
    notification.setAlpha(0);
    notification.setScale(0.8);
    
    this.scene.tweens.add({
      targets: notification,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold for 1.5 seconds
        this.scene.time.delayedCall(1500, () => {
          // Animate out
          this.scene.tweens.add({
            targets: notification,
            alpha: 0,
            y: notification.y - 30,
            duration: 400,
            ease: 'Power2',
            onComplete: () => notification.destroy()
          });
        });
      }
    });
  }
  
  updateBlockDisplay(oldBlock: number, newBlock: number, source: string): void {
    // Existing block update logic
    
    // If block increased from relic, show source
    if (newBlock > oldBlock && source.includes("Relic")) {
      const diff = newBlock - oldBlock;
      this.showFloatingText(`+${diff} Block`, this.blockDisplay.x, this.blockDisplay.y, '#5DADE2');
    }
  }
  
  showDamageBreakdown(breakdown: DamageBreakdown): void {
    // Show detailed damage calculation including relic contributions
    const lines = [
      `Base: ${breakdown.base}`,
      `Hand Bonus: +${breakdown.handBonus}`,
      `Elemental: +${breakdown.elemental}`,
      `Relics: +${breakdown.relics}`, // NEW
      `Status: +${breakdown.status}`,
      `─────────────`,
      `Total: ${breakdown.total}`
    ];
    
    // Display breakdown UI
    // ...
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('RelicManager', () => {
  describe('Start of Combat Effects', () => {
    it('should apply Earthwarden\'s Plate +5 Block', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('earthwardens_plate'));
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.block).toBe(5);
    });
    
    it('should apply Swift Wind Agimat +1 discard charge', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('swift_wind_agimat'));
      
      RelicManager.applyStartOfCombatEffects(player);
      
      expect(player.discardCharges).toBe(4); // 3 base + 1
      expect(player.maxDiscardCharges).toBe(4);
    });
  });
  
  describe('Start of Turn Effects', () => {
    it('should apply Ember Fetish +2 Strength when Block = 0', () => {
      const player = createMockPlayer();
      player.block = 0;
      player.relics.push(getRelicById('ember_fetish'));
      
      RelicManager.applyStartOfTurnEffects(player);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      expect(strengthEffect).toBeDefined();
      expect(strengthEffect.value).toBe(2);
    });
    
    it('should apply Ember Fetish +1 Strength when Block > 0', () => {
      const player = createMockPlayer();
      player.block = 10;
      player.relics.push(getRelicById('ember_fetish'));
      
      RelicManager.applyStartOfTurnEffects(player);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ember');
      expect(strengthEffect).toBeDefined();
      expect(strengthEffect.value).toBe(1);
    });
  });
  
  describe('After Hand Played Effects', () => {
    it('should apply Ancestral Blade +2 Strength on Flush', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('ancestral_blade'));
      
      const hand = createFlushHand();
      const evaluation = { type: 'flush' };
      
      RelicManager.applyAfterHandPlayedEffects(player, hand, evaluation);
      
      const strengthEffect = player.statusEffects.find(e => e.id === 'strength_ancestral');
      expect(strengthEffect).toBeDefined();
      expect(strengthEffect.value).toBe(2);
    });
  });
  
  describe('Damage Calculators', () => {
    it('should calculate Sigbin Heart +3 damage', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart'));
      
      const bonus = RelicManager.calculateSigbinHeartDamage(player);
      
      expect(bonus).toBe(3);
    });
    
    it('should calculate Bungisngis Grin +4 damage when enemy has debuff', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('bungisngis_grin'));
      
      const enemy = createMockEnemy();
      enemy.statusEffects.push({ name: 'Weak', type: 'debuff' });
      
      const bonus = RelicManager.calculateBungisngisGrinDamage(player, enemy);
      
      expect(bonus).toBe(4);
    });
  });
  
  describe('Multiple Relic Stacking', () => {
    it('should stack multiple Sigbin Hearts additively', () => {
      const player = createMockPlayer();
      player.relics.push(getRelicById('sigbin_heart'));
      player.relics.push(getRelicById('sigbin_heart'));
      
      const bonus = RelicManager.calculateSigbinHeartDamage(player);
      
      expect(bonus).toBe(6); // 3 + 3
    });
  });
});
```

### Integration Tests

```typescript
describe('Combat Relic Integration', () => {
  it('should apply all start-of-combat relics correctly', async () => {
    const combat = await setupCombatScene();
    const player = combat.player;
    
    player.relics.push(getRelicById('earthwardens_plate'));
    player.relics.push(getRelicById('diwatas_crown'));
    
    combat.startCombat();
    
    expect(player.block).toBe(10); // 5 + 5
  });
  
  it('should show visual feedback for relic triggers', async () => {
    const combat = await setupCombatScene();
    const player = combat.player;
    
    player.relics.push(getRelicById('tiyanak_tear'));
    
    const spy = jest.spyOn(combat.combatUI, 'showRelicTrigger');
    
    combat.startPlayerTurn();
    
    expect(spy).toHaveBeenCalledWith('Tiyanak Tear', '+1 Strength');
  });
});
```

## Performance Optimization

### Efficient Relic Lookup

```typescript
class RelicManager {
  // Cache relic lookups per combat
  private static relicCache: Map<string, Relic[]> = new Map();
  
  static getPlayerRelicsWithEffect(player: Player, effectType: string): Relic[] {
    const cacheKey = `${player.id}_${effectType}`;
    
    if (!this.relicCache.has(cacheKey)) {
      const relics = player.relics.filter(r => hasRelicEffect(r.id, effectType));
      this.relicCache.set(cacheKey, relics);
    }
    
    return this.relicCache.get(cacheKey)!;
  }
  
  static clearCache(): void {
    this.relicCache.clear();
  }
}

// Call clearCache() at start of each combat
```

## Summary

This design ensures:
1. ✅ All 20 Act 1 relics function correctly
2. ✅ Clear visual feedback for all relic triggers
3. ✅ Efficient performance with caching
4. ✅ Comprehensive test coverage
5. ✅ Easy extensibility for Act 2-3 relics
6. ✅ Integration with existing combat systems

The implementation focuses on verification and integration rather than rewriting, since RelicManager.ts already has most logic implemented.

# Enemy System Architecture Summary

## Overview

The enemy system has been restructured to provide an **independent, reusable pool** of enemies that can be used across any act, as either bosses or regular enemies.

## File Structure

```
src/
├── data/enemies/
│   ├── Act1Enemies.ts       # Runtime Enemy instances (combat state)
│   ├── Act2Enemies.ts       # Runtime Enemy instances
│   ├── Act3Enemies.ts       # Runtime Enemy instances  
│   ├── creatures/           # NEW: Independent EnemyConfig definitions
│   │   ├── index.ts         # Barrel export
│   │   ├── tikbalang_scout.ts
│   │   ├── balete_wraith.ts
│   │   ├── sigbin_charger.ts
│   │   ├── duwende_trickster.ts
│   │   ├── tiyanak_ambusher.ts
│   │   ├── amomongo.ts
│   │   ├── bungisngis.ts
│   │   ├── kapre.ts         # Elite (exports KAPRE_SHADE)
│   │   ├── tawong_lipod.ts  # Elite
│   │   └── mangangaway.ts   # Boss
│   └── registry.ts          # NEW: Central lookup & filtering
├── acts/
│   ├── index.ts             # Barrel export for act configs
│   └── act1/
│       └── Act1Config.ts    # References enemy IDs only
├── core/
│   ├── types/
│   │   └── EnemyTypes.ts    # EnemyConfig interface
│   └── managers/
│       ├── ActManager.ts    # Act configuration singleton
│       └── EnemyManager.ts  # Act-aware enemy access
```

## Two Enemy Systems

### 1. Runtime Enemies (src/data/enemies/Act*.ts)
- Type: `Enemy` from CombatTypes
- Purpose: Combat state management
- Contains: currentHealth, intent, statusEffects, attackPattern
- Used by: Combat scene, damage calculations

### 2. Design-Time EnemyConfig (src/data/enemies/creatures/*.ts)
- Type: `EnemyConfig` from EnemyTypes
- Purpose: Static design data, content authoring
- Contains: lore, dialogue, elements, chapter assignment
- Used by: ActManager, EnemyManager, content tools

## Key Interfaces

### EnemyConfig (design data)
```typescript
interface EnemyConfig {
  id: string;              // e.g., 'tikbalang_scout'
  name: string;
  tier: 'common' | 'elite' | 'boss';
  chapter: number;         // First appearance
  
  // Stats
  baseHealth: number;
  baseDamage: number;
  
  // Elements  
  primaryElement: Element;
  elementalWeakness?: Element;
  elementalResistance?: Element;
  
  // Behavior
  activeAtDay: boolean;
  activeAtNight: boolean;
  pathingType: 'wander' | 'patrol' | 'chase' | 'ambush' | 'stationary';
  
  // Lore
  lore?: EnemyLore;
  dialogue?: EnemyDialogue;
}
```

## Registry Functions

```typescript
import { 
  getEnemy,           // Get by ID
  getBoss,            // Get boss by ID
  getAllEnemies,      // All enemies
  getAllBosses,       // All bosses
  filterEnemies,      // Multi-criteria filter
  getRandomEnemy,     // Random with filters
  getRandomEnemies,   // Multiple random
  getEnemiesByTier,   // Filter by tier
  getEnemiesByChapter // Filter by chapter
} from '../data/enemies/registry';

// Example: Get common enemies active at night in chapter 1
const nightEnemies = filterEnemies({
  tier: 'common',
  chapter: 1,
  activeAtNight: true
});
```

## Manager Access

```typescript
const enemyManager = EnemyManager.getInstance();

// Get random enemy for current act
const enemy = enemyManager.getRandomEnemy('common');

// Get boss for current act
const boss = enemyManager.getBossForCurrentAct();

// Get specific enemy
const tikbalang = enemyManager.getEnemyConfig('tikbalang_scout');
```

## Adding New Enemies

1. Create file in `src/data/enemies/creatures/{enemy_id}.ts`
2. Define EnemyConfig with all required fields
3. Export from `creatures/index.ts`
4. Import and add to ALL_ENEMIES in `registry.ts`

## Act Configuration

Acts now reference enemy IDs only (strings), not configs:

```typescript
export const ACT1_CONFIG: ActConfig = {
  // ...
  commonEnemyIds: ['tikbalang_scout', 'balete_wraith', ...],
  eliteEnemyIds: ['kapre_shade', 'tawong_lipod'],
  bossId: 'mangangaway',
};
```

The EnemyManager resolves these IDs to configs via the registry.

## Benefits

1. **Reusability**: Any enemy can appear in any act
2. **Flexibility**: Same creature can be boss in one act, minion in another
3. **Content Authoring**: Rich lore/dialogue without runtime overhead
4. **Lazy Loading**: Configs loaded only when needed
5. **Type Safety**: Strong typing on all configs
6. **Filtering**: Multi-criteria queries for procedural generation

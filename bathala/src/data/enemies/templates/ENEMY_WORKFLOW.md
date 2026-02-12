# Enemy Workflow (Add / Edit / Remove)

This project uses **creature config files** as the source of truth.

## Architecture at a glance

- `src/data/enemies/creatures/*.ts`
  - One `EnemyConfig` per enemy.
  - This is the canonical data location.
- `src/data/enemies/creatures/index.ts`
  - Barrel export for all creature configs.
- `src/data/enemies/Act1Enemies.ts`, `Act2Enemies.ts`, `Act3Enemies.ts`
  - Act-tier grouping (`COMMON`, `ELITE`, `BOSS` arrays), re-exports, sprite helpers.
- `src/data/enemies/EnemyBootstrap.ts`
  - Registers all act config arrays into core `EnemyRegistry` at runtime.
- `src/data/enemies/registry.ts`
  - Data-level maps and lookup helpers.

---

## Add a new enemy (single act)

### 1) Create creature file
- Copy `src/data/enemies/templates/single-act.enemy.template.ts`
- Save as: `src/data/enemies/creatures/<enemy_name>.ts`
- Fill all fields.

### 2) Export from barrel
- Edit `src/data/enemies/creatures/index.ts`
- Add export line:

```ts
export { NEW_ENEMY_CONST } from './<enemy_name>';
```

### 3) Register in chapter file
- Edit one file only:
  - Act 1: `src/data/enemies/Act1Enemies.ts`
  - Act 2: `src/data/enemies/Act2Enemies.ts`
  - Act 3: `src/data/enemies/Act3Enemies.ts`
- Add import from `./creatures`
- Add to re-export block
- Add to one tier array:
  - `ACTX_COMMON_ENEMIES`
  - `ACTX_ELITE_ENEMIES`
  - `ACTX_BOSS_ENEMIES`

### 4) Validate
- Run targeted checks:

```powershell
npx jest --no-coverage src/tests/entities/IntegrationAndCoverage.test.ts
npx jest --no-coverage src/core/managers/GameBalance.test.ts
```

---

## Add the same mythic enemy to multiple acts

Use `src/data/enemies/templates/multi-act.enemy.template.ts`.

Rules:
- `id` must be globally unique (`new_enemy_act1`, `new_enemy_act2`)
- Prefer distinct `name` labels per act (`New Enemy (Act 1)`) to avoid ambiguity in name lookups
- Put each act variant in that act’s tier array (`Act1Enemies.ts`, `Act2Enemies.ts`, etc.)

---

## Edit an existing enemy

### If changing combat behavior/data
- Edit the enemy file in `creatures/` (HP, damage, pattern, affinity, dialogue, lore, sprites).
- No other file needed unless:
  - you rename the exported constant → update `creatures/index.ts` and act imports
  - you change chapter/tier intentionally → move between `ActXEnemies.ts` arrays accordingly

### If changing sprite keys
- Update `combatSpriteKey` / `overworldSpriteKey` in creature file.
- Ensure matching texture keys are loaded in `src/game/scenes/Preloader.ts`.

### If changing ID or display name
- Update creature file.
- Search for direct references in scenes/tests:

```powershell
# Example
Select-String -Path src\**\*.ts -Pattern "old_enemy_id|Old Enemy Name"
```

---

## Remove an enemy

### 1) Remove from chapter arrays
- Edit corresponding `ActXEnemies.ts`
- Remove from:
  - import list from `./creatures`
  - re-export block
  - tier array (`COMMON/ELITE/BOSS`)

### 2) Remove barrel export
- Edit `creatures/index.ts`
- Remove export line

### 3) Delete creature file
- Delete `src/data/enemies/creatures/<enemy_name>.ts`

### 4) Cleanup references
- Search by `id`, `name`, and constant name in `src/**/*.ts`
- Remove references in debug tools/tutorials/tests if needed

### 5) Validate
- Run entity + balance tests.

---

## Full sample (copy/paste)

```ts
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BANAHAN_SHADE: EnemyConfig = {
  id: 'banahan_shade',
  name: 'Banahan Shade',
  tier: 'elite',
  chapter: 1,

  maxHealth: 340,
  damage: 32,
  attackPattern: ['attack', 'weaken', 'strengthen', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  combatSpriteKey: 'banahan_combat',
  overworldSpriteKey: 'banahan_overworld',

  intent: {
    type: 'debuff',
    value: 1,
    description: 'Weakens then ramps damage',
    icon: '⚠️',
  },

  dialogue: {
    intro: 'The mountain remembers every oath.',
    defeat: 'My roots... loosen...',
    spare: 'Mercy returns me to the old pact.',
    slay: 'Then let stone witness your choice.',
  },

  lore: {
    description: 'A guardian shade bound to sacred slopes and forgotten vows.',
    origin: 'Luzon highland spirit traditions',
    reference: 'Internal design adaptation',
  },
};
```

Then wire it:

1. `creatures/index.ts`:
```ts
export { BANAHAN_SHADE } from './banahan_shade';
```
2. `Act1Enemies.ts` import + re-export + add to `ACT1_ELITE_ENEMIES`.

---

## Quick checklist

- [ ] Creature file created/updated in `creatures/`
- [ ] `creatures/index.ts` export updated
- [ ] Correct `ActXEnemies.ts` array updated
- [ ] IDs unique globally
- [ ] Sprite keys match preloaded assets
- [ ] Entity + balance tests pass

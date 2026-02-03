# Combat System Fixes Plan

## Issues Identified:

1. **Status Effect UI Not Visible** ✅ FIXED
   - Status effect containers exist but no rendering code
   - Added `updateStatusEffectDisplay()` method to CombatUI.ts
   - Now displays status effects with icons, stack counts, and tooltips

2. **Enemy Attack Patterns Not Working**
   - Enemies have actions like "confuse", "charge", "wait" that aren't handled
   - These unhandled actions cause enemies to skip their turn
   - Need to add handlers for all enemy actions

3. **No Debug/Dev Mode for Testing**
   - Need a way to select specific enemies to fight
   - Should integrate with existing dev mode if present

## Fixes Applied:

### 1. Status Effect UI Rendering ✅
- Added `updateStatusEffectDisplay()` method in CombatUI.ts
- Displays status effects above player and enemy sprites
- Shows emoji icons with stack counts
- Tooltips on hover with effect name and description
- Buffs shown in green, debuffs in red
- Sorted display: buffs first, then debuffs

### 2. Enemy Attack Pattern Handlers (TO DO)
Need to add handlers in `executeEnemyTurn()` for:
- `confuse`: Should apply confusion/disrupt player somehow
- `charge`: Should prepare for a big attack next turn
- `wait`: Should skip turn (do nothing)
- Any other unhandled actions in enemy patterns

### 3. Debug Combat Screen (TO DO)
Create a new scene or add to existing dev mode:
- List all enemies from Act1Enemies.ts
- Click to start combat with selected enemy
- Useful for testing status effects, attack patterns, etc.

## Implementation Steps:

### Step 1: Fix Enemy Attack Patterns
1. Read all enemy definitions to find all unique action types
2. Add handlers for each action type in `executeEnemyTurn()`
3. Update `updateEnemyIntent()` to show correct intent for each action
4. Test that enemies use all their actions

### Step 2: Create Debug Screen
1. Check if dev mode exists (look for DDADebugScene or similar)
2. Create new CombatDebugScene or add to existing debug UI
3. List all enemies with buttons to fight them
4. Add keyboard shortcut to access (e.g., F2 or D key)

## Testing Checklist:
- [ ] Status effects visible on player
- [ ] Status effects visible on enemy
- [ ] Status effect tooltips work
- [ ] Enemies use all attack pattern actions
- [ ] Enemy intent shows correct action
- [ ] Debug screen accessible
- [ ] Can select and fight any enemy
- [ ] All enemy actions work correctly

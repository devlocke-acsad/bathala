/**
 * Core Combat Systems - barrel export
 *
 * @module core/combat
 */

export { CombatStateMachine, CombatPhase } from './CombatStateMachine';
export type { PhaseTransition, PhaseListener } from './CombatStateMachine';

export { CombatResolver } from './CombatResolver';
export type { ActionResolution, RelicBonus, StatusApplication } from './CombatResolver';

export { EnemyAIController } from './EnemyAIController';

export { CombatLogger } from './CombatLogger';
export type { CombatEvent, CombatEventKind, CombatMetrics } from './CombatLogger';

export { CombatRulesEngine } from './CombatRulesEngine';
export type { HandRankData, ElementalData, StatusEffectRule } from './CombatRulesEngine';

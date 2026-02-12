/**
 * EnemyBootstrap — Registers all Act 1 / 2 / 3 EnemyConfig definitions
 * into the EnemyRegistry. Call once during game initialisation (e.g. in Boot scene).
 */
import { EnemyRegistry } from '../../core/registries/EnemyRegistry';
import { ACT1_ENEMY_CONFIGS } from './Act1Enemies';
import { ACT2_ENEMY_CONFIGS } from './Act2Enemies';
import { ACT3_ENEMY_CONFIGS } from './Act3Enemies';

let _bootstrapped = false;

/**
 * Register every enemy config in the centralised EnemyRegistry.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function bootstrapEnemies(): void {
  if (_bootstrapped) return;

  EnemyRegistry.registerAll(ACT1_ENEMY_CONFIGS);
  EnemyRegistry.registerAll(ACT2_ENEMY_CONFIGS);
  EnemyRegistry.registerAll(ACT3_ENEMY_CONFIGS);

  _bootstrapped = true;
}

/**
 * Reset bootstrap state (for test isolation).
 * @internal
 */
export function resetEnemyBootstrap(): void {
  EnemyRegistry.clear();
  _bootstrapped = false;
}

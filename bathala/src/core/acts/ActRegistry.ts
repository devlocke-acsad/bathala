/**
 * ActRegistry — singleton that maps act IDs → ActDefinition instances.
 * 
 * Replaces the config-level concerns of ActManager and bridges the new
 * class-based act system.  ActManager continues to handle navigation
 * state (current act ID, advance, etc.), but now delegates content
 * lookups here.
 * 
 * @module ActRegistry
 */

import { ActDefinition } from './ActDefinition';

export class ActRegistry {
  private static instance: ActRegistry;
  private acts = new Map<number, ActDefinition>();

  private constructor() {}

  /** Singleton accessor */
  static getInstance(): ActRegistry {
    if (!ActRegistry.instance) {
      ActRegistry.instance = new ActRegistry();
    }
    return ActRegistry.instance;
  }

  // =========================================================================
  // Registration
  // =========================================================================

  /**
   * Register an act definition.
   * Overwrites any previous registration with the same ID (warns in dev).
   */
  register(act: ActDefinition): void {
    if (this.acts.has(act.id)) {
      console.warn(`ActRegistry: overwriting existing definition for act ${act.id}`);
    }
    this.acts.set(act.id, act);
  }

  /** Register multiple acts at once */
  registerAll(...acts: ActDefinition[]): void {
    for (const act of acts) {
      this.register(act);
    }
  }

  // =========================================================================
  // Retrieval
  // =========================================================================

  /** Get a specific act by ID (throws if unregistered) */
  get(actId: number): ActDefinition {
    const act = this.acts.get(actId);
    if (!act) {
      throw new Error(`ActRegistry: act ${actId} is not registered`);
    }
    return act;
  }

  /** Get a specific act or undefined */
  tryGet(actId: number): ActDefinition | undefined {
    return this.acts.get(actId);
  }

  /** Check if an act is registered */
  has(actId: number): boolean {
    return this.acts.has(actId);
  }

  /** All registered act IDs, sorted ascending */
  getRegisteredIds(): number[] {
    return Array.from(this.acts.keys()).sort((a, b) => a - b);
  }

  /** All registered definitions, sorted by ID */
  getAll(): ActDefinition[] {
    return this.getRegisteredIds().map(id => this.acts.get(id)!);
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  /** Remove all registrations (for testing) */
  _clearForTesting(): void {
    this.acts.clear();
  }

  /** Reset singleton (for testing) */
  static _resetForTesting(): void {
    ActRegistry.instance = undefined as unknown as ActRegistry;
  }
}

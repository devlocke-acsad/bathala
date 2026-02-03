/**
 * ActManager - Singleton for managing act configurations and transitions
 * 
 * @module ActManager
 * @description Central manager for act/chapter system per GDD v5.8.14.25
 * 
 * Responsibilities:
 * - Store act configurations
 * - Track current act
 * - Provide act-specific data to World scene
 * - Handle act transitions
 * 
 * Usage:
 * ```typescript
 * const actManager = ActManager.getInstance();
 * const currentAct = actManager.getCurrentActConfig();
 * console.log(currentAct.name); // "Chapter 1"
 * ```
 * 
 * Integration with GameState:
 * - GameState.ts has unlockChapter(), setCurrentChapter(), resetForNewChapter()
 * - ActManager focuses on configuration, GameState on progression state
 */

import { ActConfig, ActInfo } from '../types/ActTypes';
import { ACT1_CONFIG } from '../../acts/act1/Act1Config';

/**
 * ActManager - Singleton that manages act configurations and transitions
 * 
 * @class
 * @example
 * // Get current act info
 * const actManager = ActManager.getInstance();
 * const config = actManager.getCurrentActConfig();
 * 
 * // Advance to next act after boss victory
 * if (actManager.advanceToNextAct()) {
 *   console.log('Advanced to next act');
 * }
 */
export class ActManager {
  private static instance: ActManager;
  
  /** Currently active act ID */
  private currentActId: number = 1;
  
  /** Registry of all act configurations */
  private actConfigs: Map<number, ActConfig> = new Map();
  
  /**
   * Private constructor - use getInstance() instead
   */
  private constructor() {
    // Register Act 1 by default (others added via registerAct)
    this.registerAct(ACT1_CONFIG);
  }
  
  /**
   * Get singleton instance
   * 
   * @returns The ActManager instance
   */
  static getInstance(): ActManager {
    if (!ActManager.instance) {
      ActManager.instance = new ActManager();
    }
    return ActManager.instance;
  }
  
  // ===========================================================================
  // ACT REGISTRATION
  // ===========================================================================
  
  /**
   * Register an act configuration
   * 
   * @param config - The act configuration to register
   * @throws Error if act with same ID already registered
   */
  registerAct(config: ActConfig): void {
    if (this.actConfigs.has(config.id)) {
      console.warn(`ActManager: Act ${config.id} already registered, overwriting`);
    }
    this.actConfigs.set(config.id, config);
  }
  
  /**
   * Check if an act is registered
   * 
   * @param actId - The act ID to check
   * @returns true if act is registered
   */
  isActRegistered(actId: number): boolean {
    return this.actConfigs.has(actId);
  }
  
  // ===========================================================================
  // ACT RETRIEVAL
  // ===========================================================================
  
  /**
   * Get current act configuration
   * 
   * @returns The current act's configuration
   * @throws Error if current act is not registered
   */
  getCurrentActConfig(): ActConfig {
    const config = this.actConfigs.get(this.currentActId);
    if (!config) {
      throw new Error(`ActManager: Act ${this.currentActId} not registered`);
    }
    return config;
  }
  
  /**
   * Get specific act configuration by ID
   * 
   * @param actId - The act ID to retrieve
   * @returns The act configuration or undefined if not found
   */
  getActConfig(actId: number): ActConfig | undefined {
    return this.actConfigs.get(actId);
  }
  
  /**
   * Get current act ID
   * 
   * @returns The current act ID
   */
  getCurrentActId(): number {
    return this.currentActId;
  }
  
  /**
   * Get all registered act IDs
   * 
   * @returns Array of registered act IDs
   */
  getRegisteredActIds(): number[] {
    return Array.from(this.actConfigs.keys()).sort((a, b) => a - b);
  }
  
  /**
   * Get minimal act info for all registered acts
   * Used for UI display without loading full configs
   * 
   * @param unlockedActs - Set of unlocked act IDs (from GameState)
   * @param completedActs - Set of completed act IDs (from GameState)
   * @returns Array of ActInfo objects
   */
  getActInfoList(
    unlockedActs: Set<number> = new Set([1]),
    completedActs: Set<number> = new Set()
  ): ActInfo[] {
    return this.getRegisteredActIds().map(id => {
      const config = this.actConfigs.get(id)!;
      return {
        id: config.id,
        name: config.name,
        subtitle: config.subtitle,
        unlocked: unlockedActs.has(id),
        completed: completedActs.has(id)
      };
    });
  }
  
  // ===========================================================================
  // ACT NAVIGATION
  // ===========================================================================
  
  /**
   * Advance to next act
   * 
   * @returns true if advanced, false if no more acts
   */
  advanceToNextAct(): boolean {
    const nextId = this.currentActId + 1;
    if (this.actConfigs.has(nextId)) {
      this.currentActId = nextId;
      return true;
    }
    return false;
  }
  
  /**
   * Set current act (for new game, save load, or debug)
   * 
   * @param actId - The act ID to set as current
   * @throws Error if act is not registered
   */
  setCurrentAct(actId: number): void {
    if (!this.actConfigs.has(actId)) {
      throw new Error(`ActManager: Act ${actId} not registered`);
    }
    this.currentActId = actId;
  }
  
  /**
   * Check if current act is the final act
   * 
   * @returns true if no more acts after current
   */
  isLastAct(): boolean {
    return !this.actConfigs.has(this.currentActId + 1);
  }
  
  /**
   * Check if there's a previous act
   * 
   * @returns true if there's an act before current
   */
  hasPreviousAct(): boolean {
    return this.actConfigs.has(this.currentActId - 1);
  }
  
  // ===========================================================================
  // CONTENT ACCESS HELPERS
  // ===========================================================================
  
  /**
   * Get enemy IDs for current act by tier
   * 
   * @param tier - 'common', 'elite', or 'boss'
   * @returns Array of enemy IDs
   */
  getEnemyIdsForCurrentAct(tier?: 'common' | 'elite' | 'boss'): string[] {
    const config = this.getCurrentActConfig();
    
    if (!tier) {
      return [
        ...config.commonEnemyIds,
        ...config.eliteEnemyIds,
        config.bossId
      ];
    }
    
    switch (tier) {
      case 'common':
        return [...config.commonEnemyIds];
      case 'elite':
        return [...config.eliteEnemyIds];
      case 'boss':
        return [config.bossId];
      default:
        return [];
    }
  }
  
  /**
   * Get event IDs for current act
   * 
   * @returns Array of event IDs
   */
  getEventIdsForCurrentAct(): string[] {
    return [...this.getCurrentActConfig().eventIds];
  }
  
  /**
   * Get relic IDs for current act
   * 
   * @returns Array of relic IDs
   */
  getRelicIdsForCurrentAct(): string[] {
    return [...this.getCurrentActConfig().relicIds];
  }
  
  // ===========================================================================
  // STATS & UTILITIES
  // ===========================================================================
  
  /**
   * Get total number of registered acts
   * 
   * @returns Count of registered acts
   */
  getTotalActs(): number {
    return this.actConfigs.size;
  }
  
  /**
   * Reset to first act (for new game)
   */
  reset(): void {
    this.currentActId = 1;
  }
  
  /**
   * Clear all registrations (for testing only)
   * 
   * @internal
   */
  _clearForTesting(): void {
    this.actConfigs.clear();
    this.currentActId = 1;
  }
  
  /**
   * Reset singleton instance (for testing only)
   * 
   * @internal
   */
  static _resetForTesting(): void {
    ActManager.instance = undefined as unknown as ActManager;
  }
}

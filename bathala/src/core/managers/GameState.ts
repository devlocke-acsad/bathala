import { GameMap, MapNode } from "../types/MapTypes";
import { Player, Chapter } from "../types/CombatTypes";

/**
 * GameState - Manages global game state across scenes
 * Handles map progression, player stats, and scene transitions
 */
export class GameState {
  private static instance: GameState;

  public currentMap: GameMap | null = null;
  public currentNodeId: string | null = null;
  public lastCompletedNodeId: string | null = null;
  public combatVictory: boolean = false;
  public playerData: Partial<Player> | null = null;
  public playerPosition: { x: number; y: number } | null = null;
  public overworldState: any = null;

  // Chapter progression tracking
  public currentChapter: Chapter = 1;
  public unlockedChapters: Set<Chapter> = new Set([1]);
  public chapterCompletions: Map<Chapter, boolean> = new Map();
  
  // Flag to indicate a new chapter transition is happening
  public isNewChapterTransition: boolean = false;

  private constructor() {}

  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * Set the current map
   */
  setCurrentMap(map: GameMap): void {
    this.currentMap = map;
  }

  /**
   * Set the current node being visited
   */
  setCurrentNode(nodeId: string): void {
    this.currentNodeId = nodeId;
  }

  /**
   * Complete the current node and unlock connected nodes
   */
  completeCurrentNode(victory: boolean = true): void {
    if (this.currentNodeId) {
      this.completeNode(this.currentNodeId, victory);
    }
  }

  /**
   * Mark a node as completed and unlock next layer
   */
  completeNode(nodeId: string, victory: boolean = true): void {
    if (!this.currentMap) return;

    const node = this.findNodeById(nodeId);
    if (!node) return;

    // Mark node as completed
    node.completed = true;
    node.visited = true;
    this.lastCompletedNodeId = nodeId;
    this.combatVictory = victory;

    // If victory, unlock connected nodes
    if (victory) {
      this.unlockConnectedNodes(node);
    }
  }

  /**
   * Unlock nodes connected to the completed node
   */
  private unlockConnectedNodes(completedNode: MapNode): void {
    if (!this.currentMap) return;

    completedNode.connections.forEach((connectionId) => {
      const connectedNode = this.findNodeById(connectionId);
      if (connectedNode) {
        connectedNode.available = true;
      }
    });
  }

  /**
   * Find a node by ID in the current map
   */
  private findNodeById(id: string): MapNode | null {
    if (!this.currentMap) return null;

    for (const layer of this.currentMap.layers) {
      const node = layer.nodes.find((n) => n.id === id);
      if (node) return node;
    }
    return null;
  }

  /**
   * Get the current node data
   */
  getCurrentNode(): MapNode | null {
    if (!this.currentNodeId) return null;
    return this.findNodeById(this.currentNodeId);
  }

  /**
   * Reset game state (for new runs)
   */
  reset(): void {
    this.currentMap = null;
    this.currentNodeId = null;
    this.lastCompletedNodeId = null;
    this.combatVictory = false;
    this.playerData = null;
    this.playerPosition = null;
    this.overworldState = null;
    
    // Reset chapter progression
    this.currentChapter = 1;
    this.unlockedChapters = new Set([1]);
    this.chapterCompletions = new Map();
  }

  /**
   * Save player position
   */
  savePlayerPosition(x: number, y: number): void {
    this.playerPosition = { x, y };
  }

  /**
   * Get saved player position
   */
  getPlayerPosition(): { x: number; y: number } | null {
    return this.playerPosition;
  }

  /**
   * Clear saved player position
   */
  clearPlayerPosition(): void {
    this.playerPosition = null;
  }

  /**
   * Save overworld state
   */
  saveOverworldState(state: any): void {
    this.overworldState = state;
  }

  /**
   * Get saved overworld state
   */
  getOverworldState(): any {
    return this.overworldState;
  }

  /**
   * Update player data
   */
  updatePlayerData(data: Partial<Player>): void {
    this.playerData = { ...this.playerData, ...data };
  }

  /**
   * Get current player data
   */
  getPlayerData(): Partial<Player> | null {
    return this.playerData;
  }

  /**
   * Check if we're returning from a completed combat
   */
  isReturningFromCombat(): boolean {
    return this.lastCompletedNodeId !== null;
  }

  /**
   * Clear the returning from combat flag
   */
  clearCombatReturn(): void {
    this.lastCompletedNodeId = null;
    this.combatVictory = false;
  }

  /**
   * Unlock a chapter for progression
   */
  unlockChapter(chapter: Chapter): void {
    this.unlockedChapters.add(chapter);
  }

  /**
   * Set the current chapter
   */
  setCurrentChapter(chapter: Chapter): void {
    // Validate that the chapter is unlocked or in dev mode
    if (this.unlockedChapters.has(chapter)) {
      this.currentChapter = chapter;
    } else {
      console.warn(`Attempted to set locked chapter ${chapter}. Unlocking it now.`);
      this.unlockChapter(chapter);
      this.currentChapter = chapter;
    }
  }

  /**
   * Get the current chapter
   */
  getCurrentChapter(): Chapter {
    return this.currentChapter;
  }

  /**
   * Check if a chapter is unlocked
   */
  isChapterUnlocked(chapter: Chapter): boolean {
    return this.unlockedChapters.has(chapter);
  }

  /**
   * Mark a chapter as completed
   */
  completeChapter(chapter: Chapter): void {
    this.chapterCompletions.set(chapter, true);
    
    // Unlock the next chapter if it exists
    const nextChapter = (chapter + 1) as Chapter;
    if (nextChapter <= 3) {
      this.unlockChapter(nextChapter);
    }
  }

  /**
   * Check if a chapter is completed
   */
  isChapterCompleted(chapter: Chapter): boolean {
    return this.chapterCompletions.get(chapter) || false;
  }

  /**
   * Get all unlocked chapters
   */
  getUnlockedChapters(): Chapter[] {
    return Array.from(this.unlockedChapters).sort();
  }

  /**
   * Reset map state for chapter transition
   * Clears the current map so a new one is generated for the new chapter
   */
  resetMapState(): void {
    this.currentMap = null;
    this.currentNodeId = null;
    this.lastCompletedNodeId = null;
    this.combatVictory = false;
    // Note: We keep playerData intact - only the map resets
    console.log("🗺️ Map state reset for chapter transition");
  }

  /**
   * Reset for new chapter transition
   * This is called when transitioning between chapters (after boss defeat)
   * Resets player progress but keeps chapter/unlock state
   */
  resetForNewChapter(): void {
    // Set flag so Overworld.create() knows to do a fresh start
    this.isNewChapterTransition = true;
    
    // Reset map
    this.currentMap = null;
    this.currentNodeId = null;
    this.lastCompletedNodeId = null;
    this.combatVictory = false;
    this.playerPosition = null;
    this.overworldState = null;
    
    // Reset player data to start fresh for new chapter
    // Player gets a clean slate: full health, no relics, no potions, fresh deck
    this.playerData = null;
    
    console.log("🎯 GameState reset for new chapter transition");
  }

  /**
   * Clear the new chapter transition flag (called after create() processes it)
   */
  clearNewChapterFlag(): void {
    this.isNewChapterTransition = false;
  }
}

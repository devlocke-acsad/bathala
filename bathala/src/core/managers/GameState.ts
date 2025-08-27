import { GameMap, MapNode } from "../types/MapTypes";
import { Player } from "../types/CombatTypes";

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
}

/**
 * NodeInteractionController - Handles player → node interactions
 *
 * Extracts the ~250-line checkNodeInteraction() switch-case from
 * Overworld.ts into a self-contained controller that:
 *  - Checks proximity to map nodes
 *  - Routes to the correct scene (Combat, Shop, Campfire, etc.)
 *  - Marks nodes as visited / removes consumed nodes
 *
 * @module systems/world/NodeInteractionController
 */

import Phaser from 'phaser';

// =============================================================================
// TYPES
// =============================================================================

export interface MapNode {
  type: string;
  x: number;
  y: number;
  sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container;
  visited?: boolean;
  enemyId?: string;
}

export type NodeType =
  | 'combat'
  | 'elite'
  | 'boss'
  | 'shop'
  | 'campfire'
  | 'treasure'
  | 'event';

export interface InteractionResult {
  /** Which node type was interacted with */
  nodeType: NodeType;
  /** The node object */
  node: MapNode;
  /** Whether the node should be consumed (removed from map) */
  consumed: boolean;
  /** Scene key to transition to */
  targetScene: string;
  /** Data to pass to the target scene */
  sceneData: Record<string, unknown>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const INTERACTION_RADIUS = 48;

/** Map of node type → scene key */
const SCENE_MAP: Record<string, string> = {
  combat: 'Combat',
  elite: 'Combat',
  boss: 'Combat',
  shop: 'Shop',
  campfire: 'Campfire',
  treasure: 'Treasure',
  event: 'EventScene',
};

/** Node types that are consumed (removed) on interaction */
const CONSUMED_NODE_TYPES = new Set(['combat', 'elite', 'boss', 'event']);

/** Node types that are marked as visited (dimmed) but not removed */
const VISITED_NODE_TYPES = new Set(['shop', 'campfire', 'treasure']);

// =============================================================================
// CONTROLLER
// =============================================================================

export class NodeInteractionController {
  private interactionRadius: number;

  constructor(radius: number = INTERACTION_RADIUS) {
    this.interactionRadius = radius;
  }

  /**
   * Check if the player is close enough to any node to interact.
   *
   * Returns null if no node is within range or the node has already
   * been visited (for non-consumable types).
   */
  checkInteraction(
    playerX: number,
    playerY: number,
    nodes: MapNode[]
  ): InteractionResult | null {
    // Find nearest node within range
    let nearest: MapNode | null = null;
    let nearestDist = Infinity;

    for (const node of nodes) {
      const dx = playerX - node.x;
      const dy = playerY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.interactionRadius && dist < nearestDist) {
        nearest = node;
        nearestDist = dist;
      }
    }

    if (!nearest) return null;

    const nodeType = nearest.type as NodeType;

    // Block re-interaction for visited nodes
    if (VISITED_NODE_TYPES.has(nodeType) && nearest.visited) {
      return null;
    }

    const consumed = CONSUMED_NODE_TYPES.has(nodeType);
    const targetScene = SCENE_MAP[nodeType] ?? 'Combat';

    // Build scene data payload
    const sceneData: Record<string, unknown> = {
      nodeType,
    };

    if (nodeType === 'combat' || nodeType === 'elite' || nodeType === 'boss') {
      sceneData.enemyId = nearest.enemyId;
    }

    return {
      nodeType,
      node: nearest,
      consumed,
      targetScene,
      sceneData,
    };
  }

  /**
   * Apply the result of an interaction:
   *  - Remove consumed nodes from the array
   *  - Mark visited nodes
   *  - Dim visited node sprites
   *
   * Returns the mutated nodes array.
   */
  applyInteraction(result: InteractionResult, nodes: MapNode[]): MapNode[] {
    if (result.consumed) {
      // Remove node and destroy its sprite
      if (result.node.sprite) {
        result.node.sprite.destroy();
        result.node.sprite = undefined;
      }
      return nodes.filter(n => n !== result.node);
    }

    // Mark as visited and dim
    result.node.visited = true;
    if (result.node.sprite && 'setAlpha' in result.node.sprite) {
      (result.node.sprite as Phaser.GameObjects.Sprite).setAlpha(0.6);
      if ('setTint' in result.node.sprite) {
        (result.node.sprite as Phaser.GameObjects.Sprite).setTint(0x888888);
      }
    }

    return nodes;
  }
}

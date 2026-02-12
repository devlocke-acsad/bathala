/**
 * Map Types for Bathala - Slay the Spire style navigation
 * Defines the structure for the map navigation system
 */

export type NodeType =
  | "combat"
  | "elite"
  | "boss"
  | "shop"
  | "event"
  | "campfire"
  | "treasure";

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  row: number;
  connections: string[]; // IDs of connected nodes
  visited: boolean;
  available: boolean;
  completed: boolean;
  /** Enemy config ID (preferred) or legacy display name for backward compatibility. */
  enemyId?: string;
}

export interface MapLayer {
  row: number;
  nodes: MapNode[];
}

export interface GameMap {
  layers: MapLayer[];
  currentNode: string | null;
  act: number;
  totalLayers: number;
}

export interface MapConfig {
  canvasWidth: number;
  canvasHeight: number;
  nodeSize: number;
  layerSpacing: number;
  nodeSpacing: number;
  colors: {
    combat: number;
    elite: number;
    boss: number;
    shop: number;
    event: number;
    campfire: number;
    treasure: number;
  };
}

import { GameMap, MapNode, MapLayer, NodeType } from "../core/types/MapTypes";

/**
 * MapGenerator - Creates procedural map layouts for Bathala
 * Following Slay the Spire's structure with branching paths
 */
export class MapGenerator {
  private static readonly NODES_PER_LAYER = [
    1, 3, 4, 3, 4, 3, 4, 2, 3, 2, 3, 2, 1,
  ]; // Typical StS pattern
  private static readonly LAYER_COUNT = 13;

  /**
   * Generates a complete map for an act
   */
  static generateMap(act: number): GameMap {
    const layers: MapLayer[] = [];

    for (let row = 0; row < this.LAYER_COUNT; row++) {
      const nodeCount = this.NODES_PER_LAYER[row] || 3;
      const nodes = this.generateNodesForLayer(row, nodeCount, act);
      layers.push({ row, nodes });
    }

    // Connect nodes between layers
    this.connectLayers(layers);

    return {
      layers,
      currentNode: null,
      act,
      totalLayers: this.LAYER_COUNT,
    };
  }

  /**
   * Generate nodes for a specific layer
   */
  private static generateNodesForLayer(
    row: number,
    nodeCount: number,
    act: number
  ): MapNode[] {
    const nodes: MapNode[] = [];
    const spacing = 800 / (nodeCount + 1); // Distribute across screen width

    for (let i = 0; i < nodeCount; i++) {
      const nodeType = this.determineNodeType(row, act);
      const node: MapNode = {
        id: `${row}-${i}`,
        type: nodeType,
        x: 200 + spacing * (i + 1), // Start at x=200, distribute evenly
        y: 100 + row * 60, // Vertical spacing
        row,
        connections: [],
        visited: false,
        available: row === 0, // Only first row is initially available
        completed: false,
      };
      nodes.push(node);
    }

    return nodes;
  }

  /**
   * Determine node type based on position and act
   */
  private static determineNodeType(row: number, _act: number): NodeType {
    // Boss is always the last row
    if (row === this.LAYER_COUNT - 1) {
      return "boss";
    }

    // First row is always combat
    if (row === 0) {
      return "combat";
    }

    // Elite encounters in specific rows
    if (row === 4 || row === 8) {
      return Math.random() < 0.7 ? "elite" : "combat";
    }

    // Shops and campfires in mid-game
    if (row === 6 || row === 10) {
      const rand = Math.random();
      if (rand < 0.3) return "shop";
      if (rand < 0.6) return "campfire";
      return "combat";
    }

    // Events scattered throughout
    if (Math.random() < 0.15) {
      return "event";
    }

    // Treasure rooms occasionally
    if (Math.random() < 0.05) {
      return "treasure";
    }

    // Default to combat
    return "combat";
  }

  /**
   * Connect nodes between adjacent layers
   */
  private static connectLayers(layers: MapLayer[]): void {
    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = layers[i];
      const nextLayer = layers[i + 1];

      currentLayer.nodes.forEach((currentNode: MapNode) => {
        // Each node connects to 1-3 nodes in the next layer
        const connectionCount = Math.min(
          nextLayer.nodes.length,
          Math.floor(Math.random() * 3) + 1
        );

        // Find closest nodes in next layer
        const sortedNextNodes = [...nextLayer.nodes].sort(
          (a, b) =>
            Math.abs(a.x - currentNode.x) - Math.abs(b.x - currentNode.x)
        );

        // Connect to the closest nodes
        for (let j = 0; j < connectionCount; j++) {
          const targetNode = sortedNextNodes[j];
          if (targetNode && !currentNode.connections.includes(targetNode.id)) {
            currentNode.connections.push(targetNode.id);
          }
        }
      });
    }
  }
}

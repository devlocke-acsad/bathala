import { GameMap, MapNode, MapLayer, NodeType } from "../core/types/MapTypes";

/**
 * MapGenerator - Creates procedural map layouts for Bathala
 * 7 layers with 3 columns for cleaner progression
 */
export class MapGenerator {
  private static readonly LAYER_COUNT = 7;
  private static readonly NODES_PER_LAYER = 3; // Always 3 columns

  /**
   * Generates a complete map for an act
   */
  static generateMap(act: number): GameMap {
    const layers: MapLayer[] = [];

    for (let row = 0; row < this.LAYER_COUNT; row++) {
      const nodes = this.generateNodesForLayer(row, act);
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
   * Generate nodes for a specific layer (always 3 columns)
   */
  private static generateNodesForLayer(row: number, _act: number): MapNode[] {
    const nodes: MapNode[] = [];
    const nodeTypes = this.determineLayerNodeTypes(row);

    // Calculate canvas dimensions
    const canvasWidth = 1024;
    const canvasHeight = 576; // 16:9 aspect ratio
    
    // Position nodes evenly across the canvas
    const marginX = canvasWidth * 0.15; // 15% margin on each side
    const marginY = canvasHeight * 0.15; // 15% margin on top/bottom
    const startX = marginX;
    const endX = canvasWidth - marginX;
    const startY = marginY;
    const endY = canvasHeight - marginY;
    
    // Calculate spacing
    const xSpacing = (endX - startX) / (this.NODES_PER_LAYER - 1);
    const yPosition = startY + (row * (endY - startY) / (this.LAYER_COUNT - 1));

    for (let col = 0; col < this.NODES_PER_LAYER; col++) {
      const node: MapNode = {
        id: `${row}-${col}`,
        type: nodeTypes[col],
        x: startX + col * xSpacing,
        y: yPosition,
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
   * Determine node types for each column in a layer
   * Ensures each column has required node types over the course of the map
   */
  private static determineLayerNodeTypes(row: number): NodeType[] {
    // Layer 7 (final): Boss only
    if (row === 6) {
      return ["boss", "boss", "boss"];
    }

    // Layer 1 (start): All combat
    if (row === 0) {
      return ["combat", "combat", "combat"];
    }

    // Layer 6 (pre-boss): Elite encounters
    if (row === 5) {
      return ["elite", "elite", "elite"];
    }

    // Other layers: Ensure each column gets required nodes
    const nodeTypes: NodeType[] = [];

    // Column distribution to ensure variety
    if (row === 1) {
      nodeTypes.push("combat", "event", "combat");
    } else if (row === 2) {
      nodeTypes.push("treasure", "combat", "campfire");
    } else if (row === 3) {
      nodeTypes.push("combat", "shop", "event");
    } else if (row === 4) {
      nodeTypes.push("campfire", "combat", "treasure");
    } else {
      // Default mix for other rows
      const types: NodeType[] = ["combat", "event", "campfire"];
      nodeTypes.push(...types);
    }

    return nodeTypes;
  }

  /**
   * Connect nodes between adjacent layers (3x3 grid connections)
   */
  private static connectLayers(layers: MapLayer[]): void {
    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = layers[i];
      const nextLayer = layers[i + 1];

      currentLayer.nodes.forEach((currentNode: MapNode, colIndex: number) => {
        // Each node can connect to adjacent columns in the next layer
        const possibleConnections = [];

        // Connect to same column
        possibleConnections.push(colIndex);

        // Connect to adjacent columns (with bounds checking)
        if (colIndex > 0) possibleConnections.push(colIndex - 1);
        if (colIndex < this.NODES_PER_LAYER - 1) possibleConnections.push(colIndex + 1);

        // Connect to all possible nodes in next layer
        possibleConnections.forEach((targetCol) => {
          if (targetCol >= 0 && targetCol < nextLayer.nodes.length) {
            const targetNodeId = nextLayer.nodes[targetCol].id;
            if (!currentNode.connections.includes(targetNodeId)) {
              currentNode.connections.push(targetNodeId);
            }
          }
        });
      });
    }
  }
}

import { Scene } from "phaser";
import { GameMap, MapNode, MapConfig } from "../../core/types/MapTypes";
import { MapGenerator } from "../../utils/MapGenerator";
import { GameState } from "../../core/managers/GameState";

/**
 * Map Scene - Slay the Spire style navigation
 * Allows players to choose their path through the act
 */
export class Map extends Scene {
  private gameMap!: GameMap;
  private mapConfig: MapConfig;
  private nodeSprites: { [key: string]: Phaser.GameObjects.Container } = {};
  private pathLines: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: "Map" });

    this.mapConfig = {
      canvasWidth: 1024,
      canvasHeight: 768,
      nodeSize: 40,
      layerSpacing: 60,
      nodeSpacing: 100,
      colors: {
        combat: 0xff6b6b, // Red for combat
        elite: 0xffd93d, // Gold for elite
        boss: 0x8b5cf6, // Purple for boss
        shop: 0x06d6a0, // Green for shop
        event: 0x4ecdc4, // Teal for events
        campfire: 0xff9f43, // Orange for campfire
        treasure: 0xfeca57, // Yellow for treasure
      },
    };
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0e1112);

    const gameState = GameState.getInstance();

    // Check if we're returning from combat
    if (gameState.isReturningFromCombat()) {
      // Restore the map from game state
      this.gameMap = gameState.currentMap!;
      gameState.clearCombatReturn();
    } else {
      // Generate new map for Act 1
      this.gameMap = MapGenerator.generateMap(1);
      gameState.setCurrentMap(this.gameMap);
    }

    // Create title
    this.add
      .text(512, 50, "Forest of Whispers - Act 1", {
        fontFamily: "Centrion",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      })
      .setOrigin(0.5);

    // Draw the map
    this.drawMap();

    // Add UI elements
    this.createUI();
  }

  /**
   * Draw the complete map with nodes and connections
   */
  private drawMap(): void {
    // First draw all connections (lines)
    this.drawConnections();

    // Then draw all nodes
    this.drawNodes();
  }

  /**
   * Draw connection lines between nodes
   */
  private drawConnections(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x555555, 0.8);

    this.gameMap.layers.forEach((layer) => {
      layer.nodes.forEach((node) => {
        node.connections.forEach((connectionId) => {
          const targetNode = this.findNodeById(connectionId);
          if (targetNode) {
            graphics.moveTo(node.x, node.y);
            graphics.lineTo(targetNode.x, targetNode.y);
          }
        });
      });
    });

    graphics.strokePath();
    this.pathLines.push(graphics);
  }

  /**
   * Draw all map nodes
   */
  private drawNodes(): void {
    this.gameMap.layers.forEach((layer) => {
      layer.nodes.forEach((node) => {
        this.createNodeSprite(node);
      });
    });
  }

  /**
   * Create a visual representation of a map node
   */
  private createNodeSprite(node: MapNode): void {
    const container = this.add.container(node.x, node.y);

    // Node circle
    const circle = this.add.circle(
      0,
      0,
      this.mapConfig.nodeSize / 2,
      this.mapConfig.colors[node.type]
    );
    circle.setStrokeStyle(3, node.available ? 0xffffff : 0x666666);

    // Node icon/text (simplified for prototype)
    const nodeText = this.getNodeDisplayText(node.type);
    const text = this.add
      .text(0, 0, nodeText, {
        fontFamily: "Centrion",
        fontSize: 16,
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Visual states
    if (node.visited) {
      circle.setAlpha(0.6);
      text.setAlpha(0.6);
    } else if (!node.available) {
      circle.setAlpha(0.3);
      text.setAlpha(0.3);
    }

    container.add([circle, text]);

    // Make available nodes interactive
    if (node.available && !node.visited) {
      container.setInteractive(
        new Phaser.Geom.Circle(0, 0, this.mapConfig.nodeSize / 2),
        Phaser.Geom.Circle.Contains
      );
      container.on("pointerdown", () => this.onNodeClick(node));
      container.on("pointerover", () => this.onNodeHover(node, container));
      container.on("pointerout", () => this.onNodeHoverExit(node, container));
    }

    this.nodeSprites[node.id] = container;
  }

  /**
   * Get display text for node type
   */
  private getNodeDisplayText(type: string): string {
    switch (type) {
      case "combat":
        return "⚔";
      case "elite":
        return "★";
      case "boss":
        return "👹";
      case "shop":
        return "$";
      case "event":
        return "?";
      case "campfire":
        return "🔥";
      case "treasure":
        return "💎";
      default:
        return "•";
    }
  }

  /**
   * Handle node click
   */
  private onNodeClick(node: MapNode): void {
    if (!node.available || node.visited) return;

    const gameState = GameState.getInstance();

    // Set current node but don't mark as visited yet
    this.gameMap.currentNode = node.id;
    gameState.setCurrentNode(node.id);

    // Navigate to appropriate scene based on node type
    this.navigateToNodeScene(node);
  }

  /**
   * Handle node hover
   */
  private onNodeHover(
    node: MapNode,
    container: Phaser.GameObjects.Container
  ): void {
    const circle = container.getAt(0) as Phaser.GameObjects.Arc;
    circle.setScale(1.2);

    // Show tooltip
    this.showNodeTooltip(node);
  }

  /**
   * Handle node hover exit
   */
  private onNodeHoverExit(
    _node: MapNode,
    container: Phaser.GameObjects.Container
  ): void {
    const circle = container.getAt(0) as Phaser.GameObjects.Arc;
    circle.setScale(1.0);

    // Hide tooltip
    this.hideNodeTooltip();
  }

  /**
   * Update which nodes are available after visiting a node
   */
  private updateNodeAvailability(visitedNode: MapNode): void {
    // Make connected nodes available
    visitedNode.connections.forEach((connectionId) => {
      const connectedNode = this.findNodeById(connectionId);
      if (connectedNode) {
        connectedNode.available = true;
      }
    });

    // Refresh visual representation
    this.refreshNodeVisuals();
  }

  /**
   * Refresh all node visuals
   */
  private refreshNodeVisuals(): void {
    Object.entries(this.nodeSprites).forEach(([nodeId, container]) => {
      const node = this.findNodeById(nodeId);
      if (!node) return;

      const circle = container.getAt(0) as Phaser.GameObjects.Arc;

      // Update stroke and interactivity
      if (node.visited) {
        circle.setAlpha(0.6);
        circle.setStrokeStyle(3, 0x00ff00); // Green for completed
        container.disableInteractive();
      } else if (node.available) {
        circle.setAlpha(1.0);
        circle.setStrokeStyle(3, 0xffffff); // White for available
        container.setInteractive(
          new Phaser.Geom.Circle(0, 0, this.mapConfig.nodeSize / 2),
          Phaser.Geom.Circle.Contains
        );
      } else {
        circle.setAlpha(0.3);
        circle.setStrokeStyle(3, 0x666666); // Gray for unavailable
      }
    });
  }

  /**
   * Navigate to the appropriate scene based on node type
   */
  private navigateToNodeScene(node: MapNode): void {
    switch (node.type) {
      case "combat":
      case "elite":
        // Navigate to Combat scene
        this.scene.start("Combat");
        break;
      case "boss":
        // Boss fight scene
        this.scene.start("Combat");
        break;
      case "shop":
        // Shop scene (to be implemented)
        this.scene.start("Game");
        break;
      case "event":
        // Event scene (to be implemented)
        this.scene.start("Game");
        break;
      case "campfire":
        // Rest scene (to be implemented)
        this.scene.start("Game");
        break;
      case "treasure":
        // Treasure scene (to be implemented)
        this.scene.start("Game");
        break;
      default:
        this.scene.start("Game");
    }
  }

  /**
   * Find a node by its ID
   */
  private findNodeById(id: string): MapNode | null {
    for (const layer of this.gameMap.layers) {
      const node = layer.nodes.find((n) => n.id === id);
      if (node) return node;
    }
    return null;
  }

  /**
   * Show tooltip for a node
   */
  private showNodeTooltip(node: MapNode): void {
    // Simple tooltip implementation
    const tooltipText = this.getNodeTypeDescription(node.type);
    // This would be expanded with a proper tooltip UI
    console.log(`${node.type}: ${tooltipText}`);
  }

  /**
   * Hide node tooltip
   */
  private hideNodeTooltip(): void {
    // Hide tooltip implementation
  }

  /**
   * Get description for node type
   */
  private getNodeTypeDescription(type: string): string {
    switch (type) {
      case "combat":
        return "Battle against common enemies";
      case "elite":
        return "Challenging elite encounter";
      case "boss":
        return "Act boss fight";
      case "shop":
        return "Purchase cards and relics";
      case "event":
        return "Random event encounter";
      case "campfire":
        return "Rest and upgrade cards";
      case "treasure":
        return "Discover valuable relics";
      default:
        return "Unknown encounter";
    }
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Back to menu button
    const backButton = this.add.text(50, 50, "← Back to Menu", {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#e8eced",
    });

    backButton.setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    // Progress indicator
    this.add
      .text(950, 50, "Act 1 Progress: 0/13", {
        fontFamily: "Centrion",
        fontSize: 16,
        color: "#e8eced",
      })
      .setOrigin(1, 0);
  }
}

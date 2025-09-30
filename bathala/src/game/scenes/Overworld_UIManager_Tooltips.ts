/**
 * OVERWORLD UI MANAGER - TOOLTIPS
 * ===============================
 * 
 * Manages all tooltip functionality for the Overworld UI system. This specialized
 * manager handles the complex tooltip system for enemies, nodes, and interactive
 * elements with dynamic positioning and rich content display.
 * 
 * CORE RESPONSIBILITIES:
 * • Tooltip container creation and management
 * • Enemy and node tooltip content generation
 * • Dynamic positioning to stay within screen bounds
 * • Show/hide animations with proper state management
 * • Mouse tracking for optimal tooltip placement
 * • Timer management for tooltip delays
 * 
 * TOOLTIP FEATURES:
 * • Context-aware tooltips for different node types
 * • Rich content display with stats, descriptions, and lore
 * • Smooth show/hide animations
 * • Dynamic sizing based on content
 * • Responsive positioning system
 * • State management for hover interactions
 * 
 * SUPPORTED TOOLTIP TYPES:
 * • Enemy tooltips - Combat encounters with stats and abilities
 * • Node tooltips - Interactive world elements with descriptions
 * • Rich formatting with multiple text elements and styling
 * • Visual feedback with background and shadow effects
 * 
 * This manager provides the tooltip system foundation for enhanced
 * user experience during world exploration and interaction.
 */

import type { Overworld } from "./Overworld";

export class OverworldUIManagerTooltips {
  // Tooltip system properties
  private isTooltipVisible: boolean = false;
  private currentTooltipTimer?: Phaser.Time.TimerEvent;
  private lastHoveredNodeId?: string;
  private tooltipContainer?: Phaser.GameObjects.Container;
  private tooltipBackground?: Phaser.GameObjects.Rectangle;
  private tooltipNameText?: Phaser.GameObjects.Text;
  private tooltipTypeText?: Phaser.GameObjects.Text;
  private tooltipSpriteContainer?: Phaser.GameObjects.Container;
  private tooltipStatsText?: Phaser.GameObjects.Text;
  private tooltipDescriptionText?: Phaser.GameObjects.Text;

  constructor(private readonly scene: Overworld) {}

  /**
   * Initialize the tooltip system
   */
  public initialize(): void {
    this.createEnemyTooltip();
  }

  /**
   * Clean up tooltip resources
   */
  public destroy(): void {
    this.hideTooltip();
    this.tooltipContainer?.destroy();
    this.tooltipContainer = undefined;
    this.currentTooltipTimer?.destroy();
    this.currentTooltipTimer = undefined;
  }

  /**
   * Create enemy info tooltip system
   */
  private createEnemyTooltip(): void {
    console.log("Creating enemy tooltip system...");
    
    // Create tooltip container (initially hidden) - FIXED TO CAMERA
    this.tooltipContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(2000).setScrollFactor(0);
    
    // Tooltip background with shadow effect
    const shadowOffset = 3;
    const tooltipShadow = this.scene.add.rectangle(shadowOffset, shadowOffset, 400, 240, 0x000000)
      .setAlpha(0.4)
      .setOrigin(0, 0);
    
    // Main tooltip background
    this.tooltipBackground = this.scene.add.rectangle(0, 0, 400, 240, 0x1a1a2e)
      .setStrokeStyle(2, 0x00d4ff, 0.8)
      .setOrigin(0, 0);
    
    // Header section background
    const headerBg = this.scene.add.rectangle(2, 2, 396, 50, 0x2a2a4e)
      .setOrigin(0, 0);
    
    // Enemy name text
    this.tooltipNameText = this.scene.add.text(15, 15, "", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#00d4ff",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    // Enemy type text  
    this.tooltipTypeText = this.scene.add.text(15, 35, "", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C"
    }).setOrigin(0, 0);
    
    // Sprite container for enemy image
    this.tooltipSpriteContainer = this.scene.add.container(320, 75);
    const spriteFrame = this.scene.add.rectangle(0, 0, 70, 70, 0x0f1419)
      .setStrokeStyle(1, 0x00d4ff, 0.5);
    this.tooltipSpriteContainer.add(spriteFrame);
    
    // Stats text
    this.tooltipStatsText = this.scene.add.text(15, 70, "", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#c9a74a",
      wordWrap: { width: 290 }
    }).setOrigin(0, 0);
    
    // Description text
    this.tooltipDescriptionText = this.scene.add.text(15, 140, "", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#b8a082",
      wordWrap: { width: 370 }
    }).setOrigin(0, 0);
    
    // Add all elements to container
    this.tooltipContainer.add([
      tooltipShadow,
      this.tooltipBackground,
      headerBg,
      this.tooltipNameText,
      this.tooltipTypeText,
      this.tooltipSpriteContainer,
      this.tooltipStatsText,
      this.tooltipDescriptionText
    ]);
    
    console.log("✅ Enemy tooltip system created successfully");
  }

  /**
   * Show enemy tooltip with information - immediate version without timing issues
   */
  public showEnemyTooltip(nodeType: string, nodeId: string, mouseX?: number, mouseY?: number): void {
    if (!this.tooltipContainer) {
      console.warn("Tooltip container not initialized");
      return;
    }

    // Get enemy info from game mechanic manager
    const enemyInfo = this.scene.getEnemyInfoForNodeType(nodeType, nodeId);
    if (!enemyInfo) {
      console.warn(`No enemy info found for node type: ${nodeType}`);
      return;
    }

    console.log(`🎯 Showing enemy tooltip for ${nodeType}:`, enemyInfo);

    // Get color scheme
    const colors = this.scene.getNodeColorScheme(nodeType);

    // Update tooltip content
    this.tooltipNameText!.setText(enemyInfo.name).setColor(colors.name);
    this.tooltipTypeText!.setText(enemyInfo.type).setColor(colors.type);
    this.tooltipStatsText!.setText(enemyInfo.stats).setColor(colors.stats);
    this.tooltipDescriptionText!.setText(enemyInfo.description).setColor(colors.description);

    // Clear and add enemy sprite if available
    this.tooltipSpriteContainer!.removeAll(true);
    const spriteFrame = this.scene.add.rectangle(0, 0, 70, 70, 0x0f1419)
      .setStrokeStyle(1, 0x00d4ff, 0.5);
    this.tooltipSpriteContainer!.add(spriteFrame);

    if (enemyInfo.spriteKey && this.scene.textures.exists(enemyInfo.spriteKey)) {
      const enemySprite = this.scene.add.sprite(0, 0, enemyInfo.spriteKey)
        .setScale(2)
        .setOrigin(0.5, 0.5);
      this.tooltipSpriteContainer!.add(enemySprite);
      
      if (enemyInfo.animationKey && this.scene.anims.exists(enemyInfo.animationKey)) {
        enemySprite.play(enemyInfo.animationKey);
      }
    }

    // Show tooltip and update position
    this.isTooltipVisible = true;
    this.tooltipContainer.setVisible(true);
    
    // Update size and position
    this.updateTooltipSizeAndPosition(mouseX, mouseY);
  }

  /**
   * Show node tooltip for non-enemy nodes
   */
  public showNodeTooltip(nodeType: string, _nodeId: string, mouseX: number, mouseY: number): void {
    if (!this.tooltipContainer) return;

    // Get node info from game mechanic manager
    const nodeInfo = this.scene.getNodeInfoForType(nodeType);
    if (!nodeInfo) return;

    console.log(`🎯 Showing node tooltip for ${nodeType}:`, nodeInfo);

    // Get color scheme
    const colors = this.scene.getNodeColorScheme(nodeType);

    // Update tooltip content
    this.tooltipNameText!.setText(nodeInfo.name).setColor(colors.name);
    this.tooltipTypeText!.setText(nodeInfo.type).setColor(colors.type);
    this.tooltipStatsText!.setText(nodeInfo.stats).setColor(colors.stats);
    this.tooltipDescriptionText!.setText(nodeInfo.description).setColor(colors.description);

    // Clear and add node sprite if available
    this.tooltipSpriteContainer!.removeAll(true);
    const spriteFrame = this.scene.add.rectangle(0, 0, 70, 70, 0x0f1419)
      .setStrokeStyle(1, 0x00d4ff, 0.5);
    this.tooltipSpriteContainer!.add(spriteFrame);

    if (nodeInfo.spriteKey && this.scene.textures.exists(nodeInfo.spriteKey)) {
      const nodeSprite = this.scene.add.sprite(0, 0, nodeInfo.spriteKey)
        .setScale(2)
        .setOrigin(0.5, 0.5);
      this.tooltipSpriteContainer!.add(nodeSprite);
      
      if (nodeInfo.animationKey && this.scene.anims.exists(nodeInfo.animationKey)) {
        nodeSprite.play(nodeInfo.animationKey);
      }
    }

    // Show tooltip
    this.isTooltipVisible = true;
    this.tooltipContainer.setVisible(true);
    
    // Update size and position
    this.updateTooltipSizeAndPosition(mouseX, mouseY);
  }

  /**
   * Update tooltip size and position - immediate version
   */
  public updateTooltipSizeAndPosition(mouseX?: number, mouseY?: number): void {
    if (!this.tooltipContainer || !this.isTooltipVisible) return;

    const camera = this.scene.cameras?.main;
    if (!camera) return;

    // Use provided mouse coordinates or get from input
    let targetX = mouseX ?? this.scene.input.activePointer.x;
    let targetY = mouseY ?? this.scene.input.activePointer.y;

    // Calculate tooltip dimensions based on content
    let tooltipWidth = 400;
    let tooltipHeight = 240;

    // Adjust dimensions based on description length
    if (this.tooltipDescriptionText && this.tooltipDescriptionText.text) {
      const descLines = Math.ceil(this.tooltipDescriptionText.text.length / 60);
      tooltipHeight = Math.max(240, 180 + (descLines * 12));
    }

    // Update background size
    if (this.tooltipBackground) {
      this.tooltipBackground.setSize(tooltipWidth, tooltipHeight);
    }

    // Position tooltip with smart boundary detection
    const padding = 20;
    const screenWidth = camera.width;
    const screenHeight = camera.height;

    // Calculate optimal position
    let tooltipX = targetX + 15; // Offset from cursor
    let tooltipY = targetY - tooltipHeight - 15; // Above cursor by default

    // Horizontal boundary check
    if (tooltipX + tooltipWidth > screenWidth - padding) {
      tooltipX = targetX - tooltipWidth - 15; // Show to left of cursor
    }
    if (tooltipX < padding) {
      tooltipX = padding; // Clamp to left edge
    }

    // Vertical boundary check  
    if (tooltipY < padding) {
      tooltipY = targetY + 15; // Show below cursor if no room above
    }
    if (tooltipY + tooltipHeight > screenHeight - padding) {
      tooltipY = screenHeight - tooltipHeight - padding; // Clamp to bottom
    }

    // Apply position
    this.tooltipContainer.setPosition(tooltipX, tooltipY);

    console.log(`📍 Tooltip positioned at (${tooltipX}, ${tooltipY}) with size ${tooltipWidth}x${tooltipHeight}`);
  }

  /**
   * Hide tooltip with improved state management
   */
  public hideTooltip(): void {
    if (this.tooltipContainer) {
      this.tooltipContainer.setVisible(false);
    }
    this.isTooltipVisible = false;
    this.lastHoveredNodeId = undefined;
    
    // Clear any pending timer
    if (this.currentTooltipTimer) {
      this.currentTooltipTimer.destroy();
      this.currentTooltipTimer = undefined;
    }
  }

  /**
   * Get tooltip visibility status
   */
  public getTooltipVisibility(): boolean {
    return this.isTooltipVisible;
  }

  /**
   * Get last hovered node ID
   */
  public getLastHoveredNodeId(): string | undefined {
    return this.lastHoveredNodeId;
  }

  /**
   * Set last hovered node ID
   */
  public setLastHoveredNodeId(nodeId: string | undefined): void {
    this.lastHoveredNodeId = nodeId;
  }

  /**
   * Set tooltip timer
   */
  public setTooltipTimer(timer: Phaser.Time.TimerEvent | undefined): void {
    this.currentTooltipTimer = timer;
  }

  /**
   * Get tooltip timer
   */
  public getTooltipTimer(): Phaser.Time.TimerEvent | undefined {
    return this.currentTooltipTimer;
  }
}
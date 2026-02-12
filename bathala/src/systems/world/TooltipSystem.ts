import { Scene } from 'phaser';
import { MapNode } from '../../core/types/MapTypes';
import { EnemyRegistry } from '../../core/registries/EnemyRegistry';
import { bootstrapEnemies } from '../../data/enemies/EnemyBootstrap';

/**
 * === DEPTH LAYER CONFIGURATION ===
 * Centralized depth values for easy editing
 * Night overlay is at 999, UI is at 1000-1999, so tooltip should be at 2500+
 */
const DEPTH = {
  TOOLTIP: 2500 // Above night overlay (999) and all UI elements
};

/**
 * Overworld_TooltipManager
 * 
 * Manages all tooltip display and content for overworld nodes.
 * Handles:
 * - Tooltip container creation and lifecycle
 * - Enemy tooltip content and display
 * - Non-combat node tooltip content (shop, event, campfire, treasure)
 * - Tooltip positioning and sizing
 * - Tooltip visibility state
 * 
 * Design: Centralizes tooltip logic to keep Overworld scene clean
 */
export class Overworld_TooltipManager {
  private scene: Scene;
  private enemyRegistryReady: boolean = false;
  
  // Tooltip UI elements
  private tooltipContainer!: Phaser.GameObjects.Container;
  private tooltipBackground!: Phaser.GameObjects.Rectangle;
  private tooltipNameText!: Phaser.GameObjects.Text;
  private tooltipTypeText!: Phaser.GameObjects.Text;
  private tooltipSpriteContainer!: Phaser.GameObjects.Container;
  private tooltipStatsText!: Phaser.GameObjects.Text;
  private tooltipDescriptionText!: Phaser.GameObjects.Text;
  
  // Tooltip state
  private isTooltipVisible: boolean = false;
  private currentTooltipTimer?: Phaser.Time.TimerEvent;
  private lastHoveredNodeId?: string;

  /**
   * Constructor
   * @param scene - The Overworld scene instance
   */
  constructor(scene: Scene) {
    this.scene = scene;
  }

  private ensureEnemyRegistryReady(): void {
    if (!this.enemyRegistryReady) {
      bootstrapEnemies();
      this.enemyRegistryReady = true;
    }
  }

  /**
   * Initialize the tooltip system
   * Creates all tooltip UI elements
   */
  initialize(): void {
    console.log("🖱️ TooltipManager: Initializing tooltip system...");
    
    // Create tooltip container (initially hidden) - FIXED TO CAMERA
    this.tooltipContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(DEPTH.TOOLTIP).setScrollFactor(0).setAlpha(0);
    
    // Prologue/Combat-style double border design
    const outerBorder = this.scene.add.rectangle(4, 4, 400 + 8, 240 + 8, undefined, 0)
      .setStrokeStyle(2, 0x77888C)
      .setOrigin(0);
    
    const innerBorder = this.scene.add.rectangle(8, 8, 400, 240, undefined, 0)
      .setStrokeStyle(2, 0x77888C)
      .setOrigin(0);
    
    // Main tooltip background (will be resized dynamically) - matching Prologue/Combat style
    this.tooltipBackground = this.scene.add.rectangle(8, 8, 400, 240, 0x150E10)
      .setOrigin(0);
      
    // Header section separator line (matching tutorial style)
    const headerSeparator = this.scene.add.rectangle(18, 68, 380, 2, 0x77888C)
      .setOrigin(0);
      
    // Enemy/Node name - matching Prologue/Combat style
    this.tooltipNameText = this.scene.add.text(18, 18, "", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#77888C",
      fontStyle: "bold"
    }).setOrigin(0);
    
    // Enemy/Node type - matching Prologue/Combat style
    this.tooltipTypeText = this.scene.add.text(18, 42, "", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C"
    }).setOrigin(0);
    
    // Sprite container (will be created dynamically)
    this.tooltipSpriteContainer = this.scene.add.container(330, 35);
    this.tooltipSpriteContainer.setSize(60, 60);
    
    // Stats section separator - matching Prologue/Combat style
    const statsSeparator = this.scene.add.rectangle(18, 130, 380, 2, 0x77888C).setOrigin(0);
    
    // Stats text - matching Prologue/Combat style
    this.tooltipStatsText = this.scene.add.text(18, 85, "", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#77888C",
      wordWrap: { width: 360 },
      lineSpacing: 4
    }).setOrigin(0);
    
    // Description section separator - matching Prologue/Combat style
    const descSeparator = this.scene.add.rectangle(18, 180, 380, 2, 0x77888C).setOrigin(0);
    
    // Description text - matching Prologue/Combat style
    this.tooltipDescriptionText = this.scene.add.text(18, 145, "", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#77888C",
      wordWrap: { width: 360 },
      lineSpacing: 4
    }).setOrigin(0);
    
    // Store references to dynamic elements for resizing
    this.tooltipContainer.setData({
      outerBorder: outerBorder,
      innerBorder: innerBorder,
      headerSeparator: headerSeparator,
      statsSeparator: statsSeparator,
      descSeparator: descSeparator
    });
    
    // Add all elements to tooltip container
    this.tooltipContainer.add([
      outerBorder,
      innerBorder,
      this.tooltipBackground,
      headerSeparator,
      this.tooltipNameText,
      this.tooltipTypeText,
      this.tooltipSpriteContainer,
      statsSeparator,
      this.tooltipStatsText,
      descSeparator,
      this.tooltipDescriptionText
    ]);
    
    console.log("✅ TooltipManager: Tooltip system initialized successfully");
  }

  /**
   * Show tooltip for an enemy node
   */
  showEnemyTooltip(node: MapNode, mouseX?: number, mouseY?: number): void {
    if (!node || !this.tooltipContainer) {
      console.warn("⚠️ TooltipManager: Cannot show tooltip - missing node or tooltip not initialized");
      return;
    }
    
    const enemyInfo = this.getEnemyInfoForNodeType(node.type, node.enemyId);
    if (!enemyInfo) {
      console.warn("⚠️ TooltipManager: Cannot show tooltip - no enemy info for type", node.type);
      return;
    }
    
    // Validate all tooltip elements exist
    if (!this.tooltipNameText || !this.tooltipTypeText || !this.tooltipSpriteContainer || 
        !this.tooltipStatsText || !this.tooltipDescriptionText || !this.tooltipBackground) {
      console.warn("⚠️ TooltipManager: Cannot show tooltip - tooltip elements not properly initialized");
      return;
    }
    
    // Set consistent Prologue/Combat-style colors
    this.tooltipNameText.setColor("#77888C");
    this.tooltipTypeText.setColor("#77888C");
    this.tooltipStatsText.setColor("#77888C");
    this.tooltipDescriptionText.setColor("#77888C");
    
    // Update tooltip content
    this.tooltipNameText.setText(enemyInfo.name);
    this.tooltipTypeText.setText(enemyInfo.type.toUpperCase());
    
    // Clear previous sprite and add new one
    this.tooltipSpriteContainer.removeAll(true);
    if (enemyInfo.spriteKey) {
      const sprite = this.scene.add.sprite(0, 0, enemyInfo.spriteKey);
      sprite.setOrigin(0.5, 0.5);
      
      // Scale to fit the container
      const targetSize = 48;
      const scale = targetSize / Math.max(sprite.width, sprite.height);
      sprite.setScale(scale);
      
      // If it's an animated sprite, play the idle animation
      if (enemyInfo.animationKey && this.scene.anims.exists(enemyInfo.animationKey)) {
        sprite.play(enemyInfo.animationKey);
      }
      
      this.tooltipSpriteContainer.add(sprite);
    }
    
    // Only show the description (removed HP, DMG, and Abilities)
    this.tooltipStatsText.setText("");
    this.tooltipDescriptionText.setText(enemyInfo.description);
    
    // Update size and position immediately
    this.updateTooltipSizeAndPosition(mouseX, mouseY);
    
    // Show tooltip with Prologue-style fade in
    this.tooltipContainer.setVisible(true);
    this.scene.tweens.add({
      targets: this.tooltipContainer,
      alpha: 1,
      duration: 200,
      ease: 'Power2.easeOut'
    });
    this.isTooltipVisible = true;
  }

  /**
   * Show tooltip for a non-combat node
   */
  showNodeTooltip(node: MapNode, mouseX: number, mouseY: number): void {
    if (!this.tooltipContainer) {
      console.warn("⚠️ TooltipManager: Tooltip container not available");
      return;
    }
    
    const nodeInfo = this.getNodeInfoForType(node.type);
    if (!nodeInfo) {
      console.warn(`⚠️ TooltipManager: No info available for node type: ${node.type}`);
      return;
    }
    
    // Use consistent Prologue/Combat-style colors for all nodes
    this.tooltipNameText.setText(nodeInfo.name);
    this.tooltipNameText.setColor("#77888C");
    
    this.tooltipTypeText.setText(nodeInfo.type.toUpperCase());
    this.tooltipTypeText.setColor("#77888C");
    
    // Clear previous sprite and add new one
    this.tooltipSpriteContainer.removeAll(true);
    if (nodeInfo.spriteKey) {
      const sprite = this.scene.add.sprite(0, 0, nodeInfo.spriteKey);
      sprite.setOrigin(0.5, 0.5);
      
      // Scale to fit the container
      const targetSize = 48;
      const scale = targetSize / Math.max(sprite.width, sprite.height);
      sprite.setScale(scale);
      
      // If it's an animated sprite, play the idle animation
      if (nodeInfo.animationKey && this.scene.anims.exists(nodeInfo.animationKey)) {
        sprite.play(nodeInfo.animationKey);
      }
      
      this.tooltipSpriteContainer.add(sprite);
    }
    
    // Only show the description (removed stats section for consistency)
    this.tooltipStatsText.setText("");
    this.tooltipStatsText.setColor("#77888C");
    
    this.tooltipDescriptionText.setText(nodeInfo.description);
    this.tooltipDescriptionText.setColor("#77888C");
    
    // Update size and position immediately
    this.updateTooltipSizeAndPosition(mouseX, mouseY);
    
    // Show tooltip with Prologue-style fade in
    this.tooltipContainer.setVisible(true);
    this.scene.tweens.add({
      targets: this.tooltipContainer,
      alpha: 1,
      duration: 200,
      ease: 'Power2.easeOut'
    });
    this.isTooltipVisible = true;
  }

  /**
   * Update tooltip position as mouse moves
   */
  updateTooltipPosition(mouseX: number, mouseY: number): void {
    if (this.isTooltipVisible) {
      this.updateTooltipSizeAndPosition(mouseX, mouseY);
    }
  }

  /**
   * Hide the tooltip with Prologue-style fade out
   */
  hideTooltip(): void {
    // Cancel any pending tooltip operations
    if (this.currentTooltipTimer) {
      this.currentTooltipTimer.destroy();
      this.currentTooltipTimer = undefined;
    }
    
    // Hide tooltip with fade out animation
    if (this.tooltipContainer && this.tooltipContainer.visible) {
      this.scene.tweens.add({
        targets: this.tooltipContainer,
        alpha: 0,
        duration: 150,
        ease: 'Power2.easeIn',
        onComplete: () => {
          if (this.tooltipContainer) {
            this.tooltipContainer.setVisible(false);
          }
        }
      });
    }
    
    this.isTooltipVisible = false;
    this.lastHoveredNodeId = undefined;
  }

  /**
   * Check if tooltip is currently visible
   */
  isVisible(): boolean {
    return this.isTooltipVisible;
  }

  /**
   * Get the last hovered node ID
   */
  getLastHoveredNodeId(): string | undefined {
    return this.lastHoveredNodeId;
  }

  /**
   * Set the last hovered node ID
   */
  setLastHoveredNodeId(nodeId: string | undefined): void {
    this.lastHoveredNodeId = nodeId;
  }

  /**
   * Update tooltip size and position based on content and mouse location
   */
  private updateTooltipSizeAndPosition(mouseX?: number, mouseY?: number): void {
    if (!this.tooltipContainer || !this.tooltipBackground) {
      return;
    }
    
    // Calculate dynamic tooltip size based on content - Prologue/Combat style
    const padding = 26; // Internal padding
    const headerHeight = 70;
    const minWidth = 420;
    const maxWidth = 550;
    
    // Get actual text bounds (only description now)
    const descHeight = this.tooltipDescriptionText?.height || 80;
    
    // Calculate required height with proper spacing
    const separatorSpacing = 15;
    const totalHeight = headerHeight + separatorSpacing + descHeight + padding;
    
    // Calculate required width
    const nameWidth = this.tooltipNameText?.width || 100;
    const descWidth = this.tooltipDescriptionText?.width || 100;
    const spriteAreaWidth = 80;
    const maxContentWidth = Math.max(nameWidth + spriteAreaWidth, descWidth);
    const tooltipWidth = Math.max(minWidth, Math.min(maxWidth, maxContentWidth + padding * 2));
    const tooltipHeight = Math.max(200, totalHeight);
    
    // Get dynamic elements from container data
    const outerBorder = this.tooltipContainer.getData('outerBorder') as Phaser.GameObjects.Rectangle;
    const innerBorder = this.tooltipContainer.getData('innerBorder') as Phaser.GameObjects.Rectangle;
    const headerSeparator = this.tooltipContainer.getData('headerSeparator') as Phaser.GameObjects.Rectangle;
    const statsSeparator = this.tooltipContainer.getData('statsSeparator') as Phaser.GameObjects.Rectangle;
    const descSeparator = this.tooltipContainer.getData('descSeparator') as Phaser.GameObjects.Rectangle;
    
    // Update border and background sizes - Prologue/Combat double border style
    outerBorder?.setSize(tooltipWidth + 8, tooltipHeight + 8);
    innerBorder?.setSize(tooltipWidth, tooltipHeight);
    this.tooltipBackground.setSize(tooltipWidth, tooltipHeight);
    
    // Update separator widths and positions
    headerSeparator?.setSize(tooltipWidth - 20, 2);
    headerSeparator?.setPosition(18, 68);
    
    // Hide the stats separator (no longer needed)
    statsSeparator?.setVisible(false);
    
    // Reposition sprite container
    this.tooltipSpriteContainer?.setPosition(tooltipWidth - 60, 35);
    
    // Update text wrapping (only description now)
    const textWidth = tooltipWidth - 40;
    this.tooltipDescriptionText?.setWordWrapWidth(textWidth);
    
    // Position description text directly after header
    const descY = headerHeight + 10;
    this.tooltipDescriptionText?.setPosition(18, descY);
    
    // Hide the description separator (cleaner look)
    descSeparator?.setVisible(false);
    
    // Position tooltip on the RIGHT side of the screen (fixed position)
    // Account for camera zoom to keep position stable during day/night transitions
    const camera = this.scene.cameras.main;
    const screenWidth = camera.width;
    const screenHeight = camera.height;
    const cameraZoom = camera.zoom;
    
    // Scale tooltip inversely to compensate for zoom (like other UI elements)
    const uiScale = 1 / cameraZoom;
    this.tooltipContainer.setScale(uiScale);
    
    // Calculate offset to compensate for zoom (same formula as FogOfWarManager)
    const offsetX = (screenWidth * (cameraZoom - 1)) / (2 * cameraZoom);
    const offsetY = (screenHeight * (cameraZoom - 1)) / (2 * cameraZoom);
    
    // Always position on the right side of the screen
    const rightMargin = 20;
    // Position from right edge, accounting for zoom offset
    const tooltipX = screenWidth - tooltipWidth - rightMargin - offsetX;
    
    // Vertically center the tooltip, accounting for zoom offset
    const tooltipY = (screenHeight - tooltipHeight) / 2 + offsetY;
    
    // Position tooltip (fixed to right side, doesn't follow mouse)
    this.tooltipContainer.setPosition(tooltipX, tooltipY);
  }

  /**
   * Get node information for different node types
   */
  private getNodeInfoForType(nodeType: string): any {
    const nodeData = {
      shop: {
        name: "Merchant's Shop",
        type: "shop",
        spriteKey: "merchant_overworld",
        animationKey: null, // Static sprite, no animation
        stats: "Services: Buy/Sell Items\nCurrency: Gold Coins\nSpecialty: Rare Relics & Potions",
        description: "A mystical merchant offers powerful relics and potions to aid your journey. Browse their wares and strengthen your deck with ancient artifacts and magical brews."
      },
      event: {
        name: "Mysterious Event",
        type: "event", 
        spriteKey: "event_overworld",
        animationKey: null, // Static sprite, no animation
        stats: "Outcome: Variable\nRisk: Medium\nReward: Unique Benefits",
        description: "Strange occurrences and mysterious encounters await. These events may offer unique opportunities, challenging choices, or unexpected rewards for the brave."
      },
      campfire: {
        name: "Sacred Campfire",
        type: "campfire",
        spriteKey: "campfire_overworld", 
        animationKey: "campfire_burn",
        stats: "Healing: Full Health\nOptions: Rest or Upgrade\nSafety: Complete Protection",
        description: "A blessed sanctuary where weary travelers can rest and recover. Choose to restore your health completely or upgrade one of your cards to become more powerful."
      },
      treasure: {
        name: "Ancient Treasure",
        type: "treasure",
        spriteKey: "chest_f0",
        animationKey: "chest_open", 
        stats: "Contents: Random Rewards\nRarity: Varies\nValue: High",
        description: "A forgotten chest containing valuable treasures from ages past. May hold gold, rare relics, powerful cards, or other precious artifacts to aid your quest."
      }
    };

    return nodeData[nodeType as keyof typeof nodeData] || null;
  }

  /**
   * Get enemy information for a given node type
   */
  private getEnemyInfoForNodeType(nodeType: string, enemyId?: string): any {
    if (!enemyId) {
      return null;
    }
    this.ensureEnemyRegistryReady();

    const enemy = EnemyRegistry.resolve(enemyId);
    if (!enemy) {
      return null;
    }

    const spriteKey = EnemyRegistry.getOverworldSprite(enemy.id);
    const abilities = enemy.intent.description || enemy.attackPattern.join(" • ");
    const origin = enemy.lore.origin;
    const description = `${enemy.lore.description}\n\n${enemy.dialogue.intro}`;

    return {
      name: enemy.name,
      type: nodeType === "elite" ? "Elite Enemy" : nodeType === "boss" ? "Boss" : "Enemy",
      spriteKey: spriteKey,
      animationKey: null,
      health: enemy.maxHealth,
      damage: enemy.damage,
      abilities,
      origin,
      description,
    };
  }

  /**
   * Clean up tooltip resources
   */
  destroy(): void {
    this.hideTooltip();
    
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
    }
  }

  /**
   * Get the tooltip container for external manipulation (e.g., zoom compensation)
   */
  getTooltipContainer(): Phaser.GameObjects.Container | undefined {
    return this.tooltipContainer;
  }
}

/** Alias for consumers that import by the system name. */
export { Overworld_TooltipManager as TooltipSystem };

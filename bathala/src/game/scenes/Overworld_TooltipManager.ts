import { Scene } from 'phaser';
import { MapNode } from '../../core/types/MapTypes';
import { 
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
  KAPRE_SHADE,
  TAWONG_LIPOD,
  MANGNANGAWAY
} from '../../data/enemies/Act1Enemies';
import { 
  TIKBALANG_SCOUT_LORE,
  BALETE_WRAITH_LORE,
  SIGBIN_CHARGER_LORE,
  DUWENDE_TRICKSTER_LORE,
  TIYANAK_AMBUSHER_LORE,
  AMOMONGO_LORE,
  BUNGISNGIS_LORE,
  KAPRE_SHADE_LORE,
  TAWONG_LIPOD_LORE,
  MANGNANGAWAY_LORE
} from '../../data/lore/EnemyLore';

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

  /**
   * Initialize the tooltip system
   * Creates all tooltip UI elements
   */
  initialize(): void {
    console.log("🖱️ TooltipManager: Initializing tooltip system...");
    
    // Create tooltip container (initially hidden) - FIXED TO CAMERA
    this.tooltipContainer = this.scene.add.container(0, 0).setVisible(false).setDepth(2000).setScrollFactor(0).setAlpha(0);
    
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
    
    // Position tooltip based on mouse position
    const camera = this.scene.cameras.main;
    const screenWidth = camera.width;
    const screenHeight = camera.height;
    
    let tooltipX: number;
    let tooltipY: number;
    
    if (mouseX !== undefined && mouseY !== undefined) {
      const offset = 20;
      tooltipX = mouseX + offset;
      tooltipY = mouseY - tooltipHeight / 2;
      
      // Ensure tooltip doesn't go off-screen (right edge)
      if (tooltipX + tooltipWidth > screenWidth - 20) {
        tooltipX = mouseX - tooltipWidth - offset;
      }
      
      // Ensure tooltip doesn't go off-screen (vertical bounds)
      tooltipY = Math.max(20, Math.min(tooltipY, screenHeight - tooltipHeight - 20));
    } else {
      // Fallback positioning
      tooltipX = (screenWidth - tooltipWidth) / 2;
      tooltipY = (screenHeight - tooltipHeight) / 2;
    }
    
    // Position tooltip
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
        spriteKey: "necromancer_f0",
        animationKey: "necromancer_idle",
        stats: "Services: Buy/Sell Items\nCurrency: Gold Coins\nSpecialty: Rare Relics & Potions",
        description: "A mystical merchant offers powerful relics and potions to aid your journey. Browse their wares and strengthen your deck with ancient artifacts and magical brews."
      },
      event: {
        name: "Mysterious Event",
        type: "event", 
        spriteKey: "doc_f0",
        animationKey: "doc_idle",
        stats: "Outcome: Variable\nRisk: Medium\nReward: Unique Benefits",
        description: "Strange occurrences and mysterious encounters await. These events may offer unique opportunities, challenging choices, or unexpected rewards for the brave."
      },
      campfire: {
        name: "Sacred Campfire",
        type: "campfire",
        spriteKey: "angel_f0", 
        animationKey: "angel_idle",
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

    // Manually list all Act 1 enemies
    const allEnemies = [
      TIKBALANG_SCOUT,
      BALETE_WRAITH,
      SIGBIN_CHARGER,
      DUWENDE_TRICKSTER,
      TIYANAK_AMBUSHER,
      AMOMONGO,
      BUNGISNGIS,
      KAPRE_SHADE,
      TAWONG_LIPOD,
      MANGNANGAWAY
    ];
    const enemy = allEnemies.find(e => e.name === enemyId);

    if (!enemy) return null;

    // Map enemy names to their detailed information from GDD
    const enemyDetailsMap: { [key: string]: { abilities: string, origin: string, corruption: string } } = {
      "Tikbalang Scout": {
        abilities: "Confuses Targeting • Applies Weak",
        origin: "Tagalog mountain trickster with backward hooves",
        corruption: "Once forest protectors, now twisted by engkanto lies to mislead travelers through false paths."
      },
      "Balete Wraith": {
        abilities: "Applies Vulnerable • Gains Strength When Hurt",
        origin: "Spirit guardian of sacred balete trees",
        corruption: "Haunting the ancient fig portals to anito realms, corrupted by engkanto deceit into hostile wraiths."
      },
      "Sigbin Charger": {
        abilities: "High Damage Burst • Strikes Every 3 Turns",
        origin: "Visayan goat-like creature stealing hearts",
        corruption: "Once loyal to Bathala, now charges with stolen heart power for the shadow throne."
      },
      "Duwende Trickster": {
        abilities: "Disrupts Card Draw • Steals Block",
        origin: "Magical goblin granting boons or curses",
        corruption: "Their fortunes twisted by engkanto whispers, now dealing only misfortune to travelers."
      },
      "Tiyanak Ambusher": {
        abilities: "First Strike Criticals • Applies Fear",
        origin: "Lost infant spirit mimicking baby cries",
        corruption: "Demon babies luring victims with wails in the corrupted forest depths."
      },
      "Amomongo": {
        abilities: "Bleeding Claws • Fast Attacks",
        origin: "Visayan ape-like terror with long nails",
        corruption: "Cave-dwelling beast driven to fury, its nails rending those deemed unworthy."
      },
      "Bungisngis": {
        abilities: "Laugh Debuff • Heavy Swings",
        origin: "One-eyed laughing giant of Tagalog/Cebuano lore",
        corruption: "Once jovial, now its laughter masks rage fueled by engkanto's twisted mirth."
      },
      "Kapre Shade": {
        abilities: "AoE Burn Damage • Summons Fire Minions",
        origin: "Tree giant smoking magical cigars",
        corruption: "Ancient guardian loyal to Bathala, corrupted into a burning shadow that veils wrath in cigar smoke."
      },
      "Tawong Lipod": {
        abilities: "Invisibility • Stuns • Benefits from Air",
        origin: "Bikol invisible wind fairy",
        corruption: "Once harmonious wind beings, now concealed tormentors wielding storms against intruders."
      },
      "Mangangaway": {
        abilities: "Mimics Elements • Curses Cards • Hex of Reversal",
        origin: "Tagalog sorcerer with skull necklace",
        corruption: "Powerful witch casting evil hexes, commanding fates to reverse at their twisted will."
      }
    };

    const details = enemyDetailsMap[enemy.name];
    const loreMap: { [key: string]: any } = {
      "Tikbalang Scout": TIKBALANG_SCOUT_LORE,
      "Balete Wraith": BALETE_WRAITH_LORE,
      "Sigbin Charger": SIGBIN_CHARGER_LORE,
      "Duwende Trickster": DUWENDE_TRICKSTER_LORE,
      "Tiyanak Ambusher": TIYANAK_AMBUSHER_LORE,
      "Amomongo": AMOMONGO_LORE,
      "Bungisngis": BUNGISNGIS_LORE,
      "Kapre Shade": KAPRE_SHADE_LORE,
      "Tawong Lipod": TAWONG_LIPOD_LORE,
      "Mangangaway": MANGNANGAWAY_LORE
    };
    
    const lore = loreMap[enemy.name];

    let spriteKeyBase = enemy.name.toLowerCase().split(" ")[0];
    if (spriteKeyBase === "tawong") {
        spriteKeyBase = "tawonglipod";
    }
    // Additional check in case the enemy name is stored differently
    if (enemy.name.toLowerCase().includes("tawong")) {
        spriteKeyBase = "tawonglipod";
    }
    const spriteKey = spriteKeyBase + "_overworld";

    return {
      name: enemy.name,
      type: nodeType === "elite" ? "Elite Enemy" : nodeType === "boss" ? "Boss" : "Enemy",
      spriteKey: spriteKey,
      animationKey: null,
      health: enemy.maxHealth,
      damage: enemy.damage,
      abilities: details?.abilities || "Unknown Abilities",
      origin: details?.origin || "",
      description: details ? `${details.origin}\n\n${details.corruption}` : (lore ? lore.description : "A corrupted spirit blocks your path.")
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
}

import type { Overworld } from "./Overworld";
import { MapNode } from "../../core/types/MapTypes";
import { GameState } from "../../core/managers/GameState";
import { 
  TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK,
  MANANANGGAL, ASWANG, DUWENDE_CHIEF, BAKUNAWA
} from "../../data/enemies/Act1Enemies";
import {
  TIKBALANG_LORE, DWENDE_LORE, KAPRE_LORE, SIGBIN_LORE, 
  TIYANAK_LORE, MANANANGGAL_LORE, ASWANG_LORE, DUWENDE_CHIEF_LORE,
  BAKUNAWA_LORE
} from "../../data/lore/EnemyLore";

/**
 * Manages core gameplay mechanics for the Overworld scene including:
 * - Node interactions and scene transitions
 * - Player progression and game flow
 * - Game data and metadata for UI systems
 * - Combat initiation and special encounters
 */
export class OverworldGameMechanicManager {
  constructor(private readonly scene: Overworld) {}

  /**
   * Check for node interactions when player moves
   * Core gameplay mechanic that handles all node type interactions
   */
  public checkNodeInteraction(): void {
    // Check if player is close to any node using maze generation manager
    const nearNode = this.scene.mazeGeneration.findNodeNear(
      this.scene.getPlayerSprite().x, 
      this.scene.getPlayerSprite().y
    );

    if (nearNode) {
      this.handleNodeInteraction(nearNode);
    }
  }

  /**
   * Handle interaction with a specific node
   * Manages game flow and scene transitions based on node type
   */
  private handleNodeInteraction(node: MapNode): void {
    switch (node.type) {
      case "combat":
      case "elite":
        this.handleCombatNode(node);
        break;
        
      case "boss":
        this.handleBossNode(node);
        break;
        
      case "shop":
        this.handleShopNode(node);
        break;
        
      case "campfire":
        this.handleCampfireNode(node);
        break;
        
      case "treasure":
        this.handleTreasureNode(node);
        break;
        
      case "event":
        this.handleEventNode(node);
        break;
    }
  }

  /**
   * Handle combat and elite node interactions
   * Initiates combat sequence and manages node cleanup
   */
  private handleCombatNode(node: MapNode): void {
    // Remove the node from the world
    this.scene.mazeGeneration.removeNode(node.id);
    
    // Hide tooltip if it's visible
    this.scene.uiManager.hideTooltip();
    
    // Start combat through game state manager
    this.scene.startCombat(node.type);
  }

  /**
   * Handle boss node interactions
   * Special boss encounter with dramatic effects
   */
  private handleBossNode(node: MapNode): void {
    // Remove the node from the world
    this.scene.mazeGeneration.removeNode(node.id);
    
    // Hide tooltip if it's visible
    this.scene.uiManager.hideTooltip();
    
    // Start boss combat with special effects
    this.scene.startCombat("boss");
  }

  /**
   * Handle shop node interactions
   * Saves player position and launches shop scene
   */
  private handleShopNode(_node: MapNode): void {
    this.savePlayerPositionAndLaunchScene("Shop", {
      player: this.scene.getPlayerData()
    });
  }

  /**
   * Handle campfire node interactions
   * Provides rest and upgrade opportunities
   */
  private handleCampfireNode(_node: MapNode): void {
    // Create placeholder player data for campfire scene
    const campfirePlayerData = this.createPlaceholderPlayerData();
    
    this.savePlayerPositionAndLaunchScene("Campfire", {
      player: campfirePlayerData
    });
  }

  /**
   * Handle treasure node interactions
   * Provides rewards and rare items
   */
  private handleTreasureNode(_node: MapNode): void {
    // Create placeholder player data for treasure scene
    const treasurePlayerData = this.createPlaceholderPlayerData();
    
    this.savePlayerPositionAndLaunchScene("Treasure", {
      player: treasurePlayerData
    });
  }

  /**
   * Handle event node interactions
   * Shows random events and mysteries
   */
  private handleEventNode(node: MapNode): void {
    // Show event dialog through UI manager
    this.scene.uiManager.showNodeEvent(
      "Mysterious Event", 
      "You encounter a mysterious figure who offers you a choice...", 
      0x0000ff
    );
    
    // Remove the node from the world
    this.scene.mazeGeneration.removeNode(node.id);
  }

  /**
   * Utility method to save player position and launch a scene
   * Ensures consistent behavior across all scene transitions
   */
  private savePlayerPositionAndLaunchScene(sceneName: string, sceneData: any): void {
    // Save player position before transitioning
    const gameState = GameState.getInstance();
    const playerSprite = this.scene.getPlayerSprite();
    gameState.savePlayerPosition(playerSprite.x, playerSprite.y);
    
    // Pause this scene and launch target scene
    this.scene.scene.pause();
    this.scene.scene.launch(sceneName, sceneData);
  }

  /**
   * Create placeholder player data for scenes that need it
   * This should eventually be replaced with actual player data management
   */
  private createPlaceholderPlayerData(): any {
    return {
      id: "player",
      name: "Hero",
      maxHealth: 80,
      currentHealth: 80,
      block: 0,
      statusEffects: [],
      hand: [],
      deck: [],
      discardPile: [],
      drawPile: [],
      playedHand: [],
      landasScore: 0,
      ginto: 100,
      diamante: 0,
      relics: [
        {
          id: "placeholder_relic",
          name: "Placeholder Relic",
          description: "This is a placeholder relic.",
          emoji: "⚙️",
        },
      ],
    };
  }

  // ========== Game Data & Metadata Methods ==========

  /**
   * Get color scheme for different node types
   * Used by UI systems for consistent theming
   */
  public getNodeColorScheme(nodeType: string): { name: string, type: string, stats: string, description: string } {
    const colorSchemes = {
      shop: {
        name: "#ffd700",        // Gold - for merchant/commerce
        type: "#ffcc00",        // Bright gold
        stats: "#e6b800",       // Golden yellow
        description: "#f0e68c"  // Light golden
      },
      event: {
        name: "#da70d6",        // Orchid - for mystery/magic
        type: "#ba55d3",        // Medium orchid
        stats: "#9370db",       // Medium slate blue
        description: "#dda0dd"  // Plum
      },
      campfire: {
        name: "#ff6347",        // Tomato red - for fire/warmth
        type: "#ff4500",        // Orange red
        stats: "#ff8c00",       // Dark orange
        description: "#ffa07a"  // Light salmon
      },
      treasure: {
        name: "#00ced1",        // Dark turquoise - for precious items
        type: "#20b2aa",        // Light sea green
        stats: "#48d1cc",       // Medium turquoise
        description: "#afeeee"  // Pale turquoise
      }
    };

    return colorSchemes[nodeType as keyof typeof colorSchemes] || {
      name: "#e8eced",    // Default white
      type: "#77888C",    // Default gray
      stats: "#c9a74a",   // Default yellow
      description: "#b8a082" // Default beige
    };
  }

  /**
   * Get comprehensive node information for different node types
   * Provides data for tooltips and UI display
   */
  public getNodeInfoForType(nodeType: string): any {
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
   * Get detailed enemy information for combat encounters
   * Provides stats, abilities, and lore for UI display
   */
  public getEnemyInfoForNodeType(nodeType: string, nodeId?: string): any {
    // Create a simple hash from nodeId for consistent enemy selection
    const getNodeHash = (id: string): number => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    switch (nodeType) {
      case "combat":
        return this.getCommonEnemyInfo(nodeId ? getNodeHash(nodeId) : 0);
        
      case "elite":
        return this.getEliteEnemyInfo(nodeId ? getNodeHash(nodeId) : 0);
        
      case "boss":
        return this.getBossEnemyInfo();
        
      default:
        return null;
    }
  }

  /**
   * Get information for common enemies
   * Used for regular combat encounters
   */
  private getCommonEnemyInfo(hashIndex: number): any {
    const commonEnemies = [
      {
        name: TIKBALANG.name,
        type: "Combat",
        spriteKey: "tikbalang",
        animationKey: "tikbalang_idle",
        health: TIKBALANG.maxHealth,
        damage: TIKBALANG.damage,
        abilities: ["Forest Navigation", "Illusion Casting"],
        description: TIKBALANG_LORE.description
      },
      {
        name: DWENDE.name,
        type: "Combat", 
        spriteKey: "chort_f0", // Using overworld sprite since no dwende combat sprite
        animationKey: null,
        health: DWENDE.maxHealth,
        damage: DWENDE.damage,
        abilities: ["Invisibility", "Mischief"],
        description: DWENDE_LORE.description
      },
      {
        name: KAPRE.name,
        type: "Combat",
        spriteKey: "chort_f0", // Using overworld sprite since no kapre combat sprite
        animationKey: null,
        health: KAPRE.maxHealth,
        damage: KAPRE.damage,
        abilities: ["Smoke Manipulation", "Tree Dwelling"],
        description: KAPRE_LORE.description
      },
      {
        name: SIGBIN.name,
        type: "Combat",
        spriteKey: "sigbin",
        animationKey: "sigbin_idle",
        health: SIGBIN.maxHealth, 
        damage: SIGBIN.damage,
        abilities: ["Invisibility", "Shadow Draining"],
        description: SIGBIN_LORE.description
      },
      {
        name: TIYANAK.name,
        type: "Combat",
        spriteKey: "chort_f0", // Using overworld sprite since no tiyanak combat sprite
        animationKey: null,
        health: TIYANAK.maxHealth,
        damage: TIYANAK.damage, 
        abilities: ["Shapeshifting", "Deception"],
        description: TIYANAK_LORE.description
      }
    ];
    
    const combatIndex = hashIndex % commonEnemies.length;
    return commonEnemies[combatIndex];
  }

  /**
   * Get information for elite enemies
   * Used for challenging encounters with better rewards
   */
  private getEliteEnemyInfo(hashIndex: number): any {
    const eliteEnemies = [
      {
        name: MANANANGGAL.name,
        type: "Elite",
        spriteKey: "big_demon_f0", // Using overworld elite sprite since no manananggal combat sprite
        animationKey: null,
        health: MANANANGGAL.maxHealth,
        damage: MANANANGGAL.damage,
        abilities: ["Flight", "Body Segmentation", "Blood Draining"],
        description: MANANANGGAL_LORE.description
      },
      {
        name: ASWANG.name,
        type: "Elite", 
        spriteKey: "big_demon_f0", // Using overworld elite sprite since no aswang combat sprite
        animationKey: null,
        health: ASWANG.maxHealth,
        damage: ASWANG.damage,
        abilities: ["Shapeshifting", "Cannibalism", "Night Vision"],
        description: ASWANG_LORE.description
      },
      {
        name: DUWENDE_CHIEF.name,
        type: "Elite",
        spriteKey: "big_demon_f0", // Using overworld elite sprite since no duwende_chief combat sprite
        animationKey: null,
        health: DUWENDE_CHIEF.maxHealth,
        damage: DUWENDE_CHIEF.damage,
        abilities: ["Command", "Magic", "Earth Control"],
        description: DUWENDE_CHIEF_LORE.description
      }
    ];
    
    const eliteIndex = hashIndex % eliteEnemies.length;
    return eliteEnemies[eliteIndex];
  }

  /**
   * Get information for boss enemies
   * Used for climactic encounters
   */
  private getBossEnemyInfo(): any {
    return {
      name: BAKUNAWA.name,
      type: "Boss",
      spriteKey: "balete", // Using balete sprite for boss since no bakunawa sprite available
      animationKey: "balete_idle",
      health: BAKUNAWA.maxHealth,
      damage: BAKUNAWA.damage,
      abilities: ["Eclipse Creation", "Massive Size", "Elemental Control"],
      description: BAKUNAWA_LORE.description
    };
  }

  /**
   * Get lore text for relics
   * Provides rich backstory for item tooltips and details
   */
  public getRelicLore(relic: any): string {
    // Return lore based on relic ID or name
    switch(relic.id) {
      case "earthwardens_plate":
        return "Forged by the ancient Earthwardens who protected the first settlements from natural disasters. This mystical armor channels the strength of the mountains themselves, providing unwavering protection to those who wear it.";
      case "swift_wind_agimat":
        return "An enchanted talisman blessed by the spirits of the wind. It enhances the agility of its bearer, allowing them to move with the swiftness of the breeze and react faster than the eye can see.";
      case "ember_fetish":
        return "A relic imbued with the essence of volcanic fire. When the bearer's defenses are low, the fetish awakens and grants the fury of the forge, empowering them with the strength of molten rock.";
      case "babaylans_talisman":
        return "Once worn by the most revered Babaylan of the ancient tribes. This sacred talisman enhances the spiritual connection of its bearer, allowing them to channel greater power through their rituals and incantations.";
      case "echo_of_ancestors":
        return "A mystical artifact that resonates with the wisdom of those who came before. It breaks the natural limitations of the physical world, allowing for impossible feats that should not exist.";
      case "seafarers_compass":
        return "A navigational tool blessed by Lakapati, goddess of fertility and navigation. It guides the bearer through the most treacherous waters and helps them find their way even in the darkest storms.";
      default:
        return "An ancient artifact of great power, its origins lost to time but its effects undeniable. Those who wield it are forever changed by its mystical properties.";
    }
  }

  // ========== Gameplay Flow Control ==========

  /**
   * Validate if player can interact with nodes
   * Prevents interactions during transitions or special states
   */
  public canInteractWithNodes(): boolean {
    return !this.scene.getIsTransitioningToCombat();
  }

  /**
   * Get interaction distance threshold for nodes
   * Defines how close player must be to trigger interactions
   */
  public getInteractionThreshold(): number {
    return 32; // One grid unit
  }
}
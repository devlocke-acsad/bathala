/**
 * EnemyLoreUI Manager
 * 
 * Handles the display of enemy lore information in a modal overlay.
 * Self-contained system that only depends on ENEMY_LORE_DATA.
 * 
 * @responsibility Display enemy lore, mythology, abilities, and weaknesses
 * @extracted_from Combat.ts - showEnemyLore(), hideEnemyLore(), createEnemyInfoButton()
 */

import { Scene } from "phaser";
import { ENEMY_LORE_DATA } from "../../data/lore/EnemyLore";
import { Enemy } from "../../core/types/CombatTypes";

export class EnemyLoreUI {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Create information button for enemy lore
   * @param x X position for the info button
   * @param y Y position for the info button
   * @param enemy The enemy to display lore for
   */
  public createInfoButton(x: number, y: number, enemy: Enemy): void {
    // Create a circular button with an "i" for information
    const infoButton = this.scene.add.circle(x + 100, y, 20, 0x2f3542);
    infoButton.setStrokeStyle(2, 0x57606f);
    
    // Add the "i" text
    const infoText = this.scene.add.text(x + 100, y, "i", {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Make the button interactive
    infoButton.setInteractive();
    
    // Add hover effects
    infoButton.on("pointerover", () => {
      infoButton.setFillStyle(0x3d4454);
    });
    
    infoButton.on("pointerout", () => {
      infoButton.setFillStyle(0x2f3542);
    });
    
    // Add click event to show enemy lore
    infoButton.on("pointerdown", () => {
      this.showLore(enemy);
    });
    
    // Also make the text interactive and link it to the same event
    infoText.setInteractive();
    infoText.on("pointerdown", () => {
      this.showLore(enemy);
    });
  }

  /**
   * Show enemy lore information in a modal overlay
   * @param enemy The enemy to display lore for
   */
  public showLore(enemy: Enemy): void {
    // Get the enemy name and convert to lowercase for lookup
    const enemyName = enemy.name.toLowerCase();
    
    // Try to find the matching lore data
    const loreKey = this.getLoreKeyFromEnemyName(enemyName);
    
    // Get lore data
    const enemyLore = ENEMY_LORE_DATA[loreKey];
    
    if (!enemyLore) {
      console.warn(`No lore found for enemy: ${enemyName}`);
      return;
    }
    
    // Get screen dimensions
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Create semi-transparent overlay
    const overlay = this.scene.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(6000);
    
    // Create lore box
    const loreBoxWidth = Math.min(800, screenWidth * 0.8);
    const loreBoxHeight = Math.min(600, screenHeight * 0.8);
    const loreBox = this.scene.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      loreBoxWidth,
      loreBoxHeight,
      0x2f3542
    ).setStrokeStyle(2, 0x57606f).setScrollFactor(0).setDepth(6001);
    
    // Create title
    const title = this.scene.add.text(
      screenWidth / 2,
      screenHeight / 2 - loreBoxHeight / 2 + 30,
      enemyLore.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 28,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(6002);
    
    // Create close button
    const closeButton = this.scene.add.circle(
      screenWidth / 2 + loreBoxWidth / 2 - 25,
      screenHeight / 2 - loreBoxHeight / 2 + 25,
      15,
      0xff4757
    ).setScrollFactor(0).setDepth(6002);
    
    const closeText = this.scene.add.text(
      screenWidth / 2 + loreBoxWidth / 2 - 25,
      screenHeight / 2 - loreBoxHeight / 2 + 25,
      "X",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#ffffff",
        align: "center",
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(6003);
    
    // Create lore content
    const contentY = screenHeight / 2 - loreBoxHeight / 2 + 70;
    
    // Description section
    const descriptionTitle = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY,
      "Description:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const descriptionText = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 30,
      enemyLore.description,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#e8eced",
        wordWrap: { width: loreBoxWidth - 40 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Mythology section
    const mythologyTitle = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 100,
      "Mythology:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const mythologyText = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 130,
      enemyLore.mythology,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#e8eced",
        wordWrap: { width: loreBoxWidth - 40 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Abilities section
    const abilitiesTitle = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 230,
      "Abilities:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const abilityTexts: Phaser.GameObjects.Text[] = [];
    enemyLore.abilities.forEach((ability, index) => {
      const abilityText = this.scene.add.text(
        screenWidth / 2 - loreBoxWidth / 2 + 30,
        contentY + 260 + (index * 25),
        `- ${ability}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 16,
          color: "#4ecdc4",
          wordWrap: { width: loreBoxWidth - 60 },
        }
      ).setScrollFactor(0).setDepth(6002);
      abilityTexts.push(abilityText);
    });
    
    // Weakness section
    const weaknessTitle = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 260 + (enemyLore.abilities.length * 25) + 30,
      "Weakness:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const weaknessText = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 30,
      contentY + 260 + (enemyLore.abilities.length * 25) + 60,
      enemyLore.weakness,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#ff6b6b",
        wordWrap: { width: loreBoxWidth - 60 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Collect all elements to destroy when closing
    const allElements = [
      overlay, 
      loreBox, 
      title, 
      closeButton, 
      closeText, 
      descriptionTitle,
      descriptionText,
      mythologyTitle,
      mythologyText,
      abilitiesTitle,
      weaknessTitle,
      weaknessText,
      ...abilityTexts
    ];
    
    // Make close button interactive
    closeButton.setInteractive();
    closeButton.on("pointerdown", () => {
      this.hideLore(...allElements);
    });
    
    closeText.setInteractive();
    closeText.on("pointerdown", () => {
      this.hideLore(...allElements);
    });
  }

  /**
   * Hide enemy lore information by destroying all UI elements
   * @param elements All game objects to destroy
   */
  private hideLore(...elements: Phaser.GameObjects.GameObject[]): void {
    elements.forEach(element => {
      if (element) {
        element.destroy();
      }
    });
  }

  /**
   * Get the lore key from enemy name
   * @param enemyName Lowercase enemy name
   * @returns The key to use for ENEMY_LORE_DATA lookup
   */
  private getLoreKeyFromEnemyName(enemyName: string): string {
    // Act 1 Chapter 1: The Corrupted Ancestral Forests
    // Common Enemies
    if (enemyName.includes("tikbalang")) {
      return "tikbalang_scout";
    } else if (enemyName.includes("balete")) {
      return "balete_wraith";
    } else if (enemyName.includes("sigbin")) {
      return "sigbin_charger";
    } else if (enemyName.includes("duwende") || enemyName.includes("dwende")) {
      return "duwende_trickster";
    } else if (enemyName.includes("tiyanak")) {
      return "tiyanak_ambusher";
    } else if (enemyName.includes("amomongo")) {
      return "amomongo";
    } else if (enemyName.includes("bungisngis")) {
      return "bungisngis";
    }
    // Elite Enemies
    else if (enemyName.includes("kapre")) {
      return "kapre_shade";
    } else if (enemyName.includes("tawong lipod") || enemyName.includes("tawonglipod")) {
      return "tawong_lipod";
    }
    // Boss
    else if (enemyName.includes("mangangaway") || enemyName.includes("mangnangaway")) {
      return "mangangaway";
    }
    
    return "";
  }

  /**
   * Cleanup method for destroying manager resources
   */
  public destroy(): void {
    // No persistent resources to clean up
    // All UI elements are destroyed via hideLore()
  }
}

/**
 * EnemyLoreUI Manager
 * 
 * Handles the display of enemy lore information in a modal overlay.
 * Reads all data from EnemyEntity's lore and combat config (SSOT).
 * 
 * @responsibility Display enemy lore, mythology, abilities, and weaknesses
 * @extracted_from Combat.ts - showEnemyLore(), hideEnemyLore(), createEnemyInfoButton()
 */

import { Scene } from "phaser";
import { EnemyEntity } from "../../core/entities/EnemyEntity";

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
  public createInfoButton(x: number, y: number, enemy: EnemyEntity): void {
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
   * Show enemy lore information in a modal overlay.
   * All data is read from the EnemyEntity's config (Single Source of Truth).
   * @param enemy The EnemyEntity to display lore for
   */
  public showLore(enemy: EnemyEntity): void {
    const lore = enemy.lore;
    if (!lore) {
      console.warn(`No lore found for enemy: ${enemy.name}`);
      return;
    }

    // Derive abilities from the attack pattern (unique actions)
    const uniqueActions = [...new Set(enemy.attackPattern)];
    const abilities = uniqueActions.map(action => this.formatAbilityName(action));

    // Derive weakness/resistance from elemental affinity
    const weaknessStr = enemy.elementalAffinity?.weakness
      ? `${this.formatElementName(enemy.elementalAffinity.weakness)}-aligned attacks`
      : 'No known elemental weakness';
    const resistanceStr = enemy.elementalAffinity?.resistance
      ? `Resists ${this.formatElementName(enemy.elementalAffinity.resistance)}-aligned attacks`
      : '';
    const weaknessDisplay = resistanceStr ? `${weaknessStr}\n${resistanceStr}` : weaknessStr;
    
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
      enemy.name,
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
      lore.description,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#e8eced",
        wordWrap: { width: loreBoxWidth - 40 },
      }
    ).setScrollFactor(0).setDepth(6002);
    
    // Mythology/Origin section
    const mythologyTitle = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 100,
      "Origin:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const mythologyText = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 20,
      contentY + 130,
      `${lore.origin}\n${lore.reference}`,
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
    abilities.forEach((ability, index) => {
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
      contentY + 260 + (abilities.length * 25) + 30,
      "Weakness:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#ffd93d",
      }
    ).setScrollFactor(0).setDepth(6002);
    
    const weaknessText = this.scene.add.text(
      screenWidth / 2 - loreBoxWidth / 2 + 30,
      contentY + 260 + (abilities.length * 25) + 60,
      weaknessDisplay,
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
   * Format a raw attack pattern action into a readable ability name.
   */
  private formatAbilityName(action: string): string {
    const actionMap: Record<string, string> = {
      attack: 'Physical Attack',
      defend: 'Defensive Stance',
      strengthen: 'Self-Strengthen',
      weaken: 'Weaken debuff',
      poison: 'Poison debuff',
      stun: 'Stun (Skip turn)',
      charm: 'Charm (Skip turn)',
      confuse: 'Confuse (Skip turn)',
      disrupt_draw: 'Disrupt Draw (Skip turn)',
      fear: 'Fear (Skip turn)',
      charge: 'Charge / Prepare',
      wait: 'Wait / Prepare',
    };
    return actionMap[action] || action;
  }

  /**
   * Format an element key into a readable name.
   */
  private formatElementName(element: string): string {
    const elementMap: Record<string, string> = {
      fire: 'Fire (Apoy)',
      water: 'Water (Tubig)',
      earth: 'Earth (Lupa)',
      air: 'Air (Hangin)',
    };
    return elementMap[element] || element;
  }

  /**
   * Cleanup method for destroying manager resources
   */
  public destroy(): void {
    // No persistent resources to clean up
    // All UI elements are destroyed via hideLore()
  }
}

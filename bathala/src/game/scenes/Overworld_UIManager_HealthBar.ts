/**
 * OVERWORLD UI MANAGER - HEALTH BAR
 * =================================
 * 
 * Manages all health bar and player status display functionality for the Overworld UI.
 * This specialized manager handles health visualization, currency display, and the
 * Landás morality meter with dynamic visual feedback and updates.
 * 
 * CORE RESPONSIBILITIES:
 * • Health bar creation and visual styling
 * • Real-time health bar updates with color progression
 * • Currency display (Ginto/Diamante) with formatting
 * • Landás morality meter visualization
 * • Player status text updates and positioning
 * • Visual effects for low health warnings
 * 
 * HEALTH BAR FEATURES:
 * • Modern rounded health bar with dynamic colors
 * • Smooth color transitions based on health percentage
 * • Glow effects for critical health levels
 * • Responsive sizing and positioning
 * • Real-time health value text updates
 * • Visual feedback for health changes
 * 
 * CURRENCY SYSTEM:
 * • Ginto (gold) display with proper formatting
 * • Diamante (premium currency) tracking
 * • Icon-based visual representation
 * • Real-time value updates
 * • Organized layout with proper spacing
 * 
 * LANDÁS METER:
 * • Morality alignment visualization
 * • Color-coded alignment indicators
 * • Dynamic meter progression
 * • Visual feedback for alignment changes
 * 
 * This manager ensures clear player status communication with
 * polished visual design and responsive updates.
 */

import type { Overworld } from "./Overworld";

export class OverworldUIManagerHealthBar {
  // Health bar UI elements
  private healthBar?: Phaser.GameObjects.Graphics;
  private healthText?: Phaser.GameObjects.Text;
  private currencyText?: Phaser.GameObjects.Text;
  private diamanteText?: Phaser.GameObjects.Text;
  private landasText?: Phaser.GameObjects.Text;
  private landasMeterIndicator?: Phaser.GameObjects.Graphics;

  constructor(private readonly scene: Overworld) {}

  /**
   * Create the modern health section with all player status elements
   */
  public createModernHealthSection(x: number, y: number, width: number, uiContainer: Phaser.GameObjects.Container): void {
    if (!uiContainer) return;
    
    // Section container with subtle background - shortened to fit only currency section
    const sectionBg = this.scene.add.graphics();
    sectionBg.fillStyle(0x1a1a1a, 0.4);
    sectionBg.lineStyle(1, 0x333333, 0.5);
    sectionBg.fillRoundedRect(x - 5, y - 5, width + 10, 115, 12);
    sectionBg.strokeRoundedRect(x - 5, y - 5, width + 10, 115, 12);
    uiContainer.add(sectionBg);
    
    // Health header with properly aligned elements
    const healthIcon = this.scene.add.text(x, y + 8, "♥", {
      fontSize: "18px",
      color: "#e74c3c",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    healthIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const healthLabel = this.scene.add.text(x + 25, y + 8, "HEALTH", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    healthLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Health value center-aligned
    const playerData = this.scene.getPlayerData();
    this.healthText = this.scene.add.text(x + width/2 + 30, y + 8, `${playerData.currentHealth}/${playerData.maxHealth}`, {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5, 0.5);
    this.healthText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Modern health bar container with organized spacing
    const healthBarBg = this.scene.add.graphics();
    healthBarBg.fillStyle(0x2c2c2c, 0.8);
    healthBarBg.fillRoundedRect(x, y + 40, width - 10, 12, 6);
    uiContainer.add(healthBarBg);
    
    // Health bar fill
    this.healthBar = this.scene.add.graphics();
    uiContainer.add(this.healthBar);
    
    // Currency section with properly aligned elements
    const gintoIcon = this.scene.add.text(x, y + 70, "💰", {
      fontSize: "16px"
    }).setOrigin(0, 0.5);
    gintoIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const gintoLabel = this.scene.add.text(x + 25, y + 70, "GINTO", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    gintoLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Left-aligned GINTO value - moved further right
    this.currencyText = this.scene.add.text(x + 120, y + 70, `${playerData.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "left"
    }).setOrigin(0, 0.5);
    this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Diamante currency display with properly aligned elements
    const diamanteIcon = this.scene.add.text(x, y + 95, "💎", {
      fontSize: "16px"
    }).setOrigin(0, 0.5);
    diamanteIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const diamanteLabel = this.scene.add.text(x + 25, y + 95, "DIAMANTE", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    diamanteLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Left-aligned DIAMANTE value - moved further right
    this.diamanteText = this.scene.add.text(x + 120, y + 95, `${playerData.diamante}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold",
      align: "left"
    }).setOrigin(0, 0.5);
    this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Landás meter with more spacing from currency section
    this.createLandasMeter(x, y + 140, width - 10, 18, uiContainer);
    
    uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel, this.healthText, this.currencyText, this.diamanteText]);
  }

  /**
   * Create the Landás morality meter
   */
  private createLandasMeter(x: number, y: number, width: number, height: number, uiContainer: Phaser.GameObjects.Container): void {
    if (!uiContainer) return;
    
    // Landás meter background
    const landasBg = this.scene.add.graphics();
    landasBg.fillStyle(0x2c2c2c, 0.8);
    landasBg.fillRoundedRect(x, y, width, height, height / 2);
    uiContainer.add(landasBg);
    
    // Landás meter fill
    this.landasMeterIndicator = this.scene.add.graphics();
    uiContainer.add(this.landasMeterIndicator);
    
    // Landás label
    this.landasText = this.scene.add.text(x + width / 2, y - 20, "LANDÁS: BALANCE", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#9370db",
      fontStyle: "bold",
      align: "center"
    }).setOrigin(0.5, 0.5);
    this.landasText.setShadow(2, 2, '#000000', 2, false, true);
    uiContainer.add(this.landasText);
  }

  /**
   * Update the health bar with current player data
   */
  public updateHealthBar(): void {
    if (!this.healthBar || !this.healthText) return;
    
    const playerData = this.scene.getPlayerData();
    const healthPercent = playerData.currentHealth / playerData.maxHealth;
    
    this.healthBar.clear();
    
    // Modern health bar position calculation - updated to match new layout
    const panelX = 20;
    const panelWidth = 320;
    const camera = this.scene.cameras?.main;
    if (!camera) return;
    
    const screenHeight = camera.height;
    const panelHeight = Math.min(screenHeight - 40, 720);
    const panelY = screenHeight / 2 - panelHeight / 2;
    
    const healthSectionY = panelY + 70; // After header with organized spacing
    const barX = panelX + 20; // Health section x position
    const barY = healthSectionY + 40; // Health bar y position within section (adjusted from 50 to 40)
    const barWidth = panelWidth - 50; // Available width for health bar
    const barHeight = 12; // Modern thin health bar
    
    // Modern health color progression
    let healthColor = 0x2ecc71; // Modern green
    
    if (healthPercent < 0.75) {
      healthColor = 0x27ae60; // Darker green
    }
    if (healthPercent < 0.5) {
      healthColor = 0xf39c12; // Orange
    }
    if (healthPercent < 0.25) {
      healthColor = 0xe74c3c; // Modern red
    }
    
    // Draw modern health bar fill with rounded corners
    const fillWidth = barWidth * healthPercent;
    if (fillWidth > 4) {
      this.healthBar.fillStyle(healthColor, 1.0);
      this.healthBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 6);
      
      // Add subtle glow effect for low health
      if (healthPercent < 0.25) {
        this.healthBar.fillStyle(healthColor, 0.3);
        this.healthBar.fillRoundedRect(barX - 2, barY - 1, fillWidth + 4, barHeight + 2, 7);
      }
    }
    
    // Update health text - maintain center alignment
    this.healthText.setText(`${playerData.currentHealth}/${playerData.maxHealth}`);
    
    // Modern low health effects
    if (healthPercent < 0.25) {
      this.healthText.setShadow(1, 1, '#e74c3c', 2, false, true);
    } else {
      this.healthText.setShadow(2, 2, '#000000', 2, false, true);
      this.scene.tweens.killTweensOf(this.healthText);
      this.healthText.setScale(1, 1);
    }
  }

  /**
   * Update currency displays
   */
  public updateCurrencyDisplay(): void {
    if (!this.currencyText || !this.diamanteText) return;
    
    const playerData = this.scene.getPlayerData();
    this.currencyText.setText(`${playerData.ginto}`);
    this.diamanteText.setText(`${playerData.diamante}`);
  }

  /**
   * Update Landás morality meter
   */
  public updateLandasDisplay(): void {
    if (!this.landasText || !this.landasMeterIndicator) return;
    
    const playerData = this.scene.getPlayerData();
    const score = playerData.landasScore;
    let color = "#9370db";
    let label = "BALANCE";
    
    if (score >= 5) {
      color = "#34d399"; // Green for Mercy
      label = "MERCY";
    } else if (score <= -5) {
      color = "#ef4444"; // Red for Conquest
      label = "CONQUEST";
    }
    
    this.landasText.setText(`LANDÁS: ${label}`).setColor(color);
    
    // Update meter fill
    this.landasMeterIndicator.clear();
    
    // Calculate meter position and fill
    const meterX = 40;
    const meterY = this.scene.cameras.main!.height / 2 - 220; // Adjust based on layout
    const meterWidth = 290;
    const meterHeight = 18;
    
    // Normalize score to meter position (-10 to +10 becomes 0 to 1)
    const normalizedScore = Math.max(-10, Math.min(10, score));
    const meterPosition = (normalizedScore + 10) / 20; // Convert to 0-1 range
    
    // Draw meter fill
    this.landasMeterIndicator.fillStyle(parseInt(color.replace('#', '0x')), 0.8);
    const indicatorX = meterX + (meterPosition * (meterWidth - 10));
    this.landasMeterIndicator.fillRoundedRect(indicatorX, meterY, 10, meterHeight, meterHeight / 2);
  }

  /**
   * Clean up health bar resources
   */
  public destroy(): void {
    this.healthBar?.destroy();
    this.healthBar = undefined;
    
    this.healthText?.destroy();
    this.healthText = undefined;
    
    this.currencyText?.destroy();
    this.currencyText = undefined;
    
    this.diamanteText?.destroy();
    this.diamanteText = undefined;
    
    this.landasText?.destroy();
    this.landasText = undefined;
    
    this.landasMeterIndicator?.destroy();
    this.landasMeterIndicator = undefined;
  }

  /**
   * Update relics display (placeholder - may move to separate relic manager later)
   */
  public updateRelicsDisplay(): void {
    // For now, delegate to the scene's main update method
    // This could be expanded to a separate relic manager later
    console.log('HealthBar manager updateRelicsDisplay called - delegating to scene');
    
    // This would be the place to implement relic-specific display updates
    // For now, we'll just log that it was called
  }
}
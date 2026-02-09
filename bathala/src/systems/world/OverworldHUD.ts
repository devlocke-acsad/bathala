/**
 * OverworldHUD - The left-side HUD panel for the overworld
 *
 * Renders health bar, relic grid, potion row, and currency display.
 * Receives data through update() calls — does NOT read from GameState directly.
 *
 * @module systems/world/OverworldHUD
 */

import Phaser from 'phaser';
import type { Relic } from '../../core/types/CombatTypes';

// =============================================================================
// TYPES
// =============================================================================

export interface OverworldHUDData {
  currentHealth: number;
  maxHealth: number;
  ginto: number;
  diamante: number;
  relics: Relic[];
  potions: { id: string; name: string; emoji: string }[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PANEL_WIDTH = 160;
const PANEL_BG = 0x150E10;
const PANEL_BORDER = 0x77888C;
const TEXT_COLOR = '#77888C';
const HIGHLIGHT = '#e8eced';

// =============================================================================
// HUD
// =============================================================================

export class OverworldHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private healthText!: Phaser.GameObjects.Text;
  private healthBar!: Phaser.GameObjects.Graphics;
  private gintoText!: Phaser.GameObjects.Text;
  private relicIcons: Phaser.GameObjects.Text[] = [];
  private potionIcons: Phaser.GameObjects.Text[] = [];
  private tooltip: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(800).setScrollFactor(0);
  }

  /** Build the HUD panel. Call once during create(). */
  create(x: number, y: number): void {
    this.container.setPosition(x, y);

    // Panel background
    const panelHeight = 280;
    const bg = this.scene.add.rectangle(
      PANEL_WIDTH / 2, panelHeight / 2,
      PANEL_WIDTH, panelHeight,
      PANEL_BG
    ).setStrokeStyle(2, PANEL_BORDER).setOrigin(0.5);
    this.container.add(bg);

    // Health section
    let yOff = 15;
    const healthLabel = this.scene.add.text(10, yOff, '❤️ Health', {
      fontFamily: 'dungeon-mode', fontSize: '11px', color: TEXT_COLOR,
    });
    this.container.add(healthLabel);
    yOff += 16;

    this.healthBar = this.scene.add.graphics();
    this.container.add(this.healthBar);

    this.healthText = this.scene.add.text(PANEL_WIDTH - 10, yOff, '120/120', {
      fontFamily: 'dungeon-mode', fontSize: '10px', color: HIGHLIGHT,
    }).setOrigin(1, 0);
    this.container.add(this.healthText);
    yOff += 26;

    // Relics section
    const relicLabel = this.scene.add.text(10, yOff, '✨ Relics', {
      fontFamily: 'dungeon-mode', fontSize: '11px', color: TEXT_COLOR,
    });
    this.container.add(relicLabel);
    yOff += 16;

    // Placeholder for relic icons
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const icon = this.scene.add.text(
        15 + col * 45, yOff + row * 28,
        '·', { fontSize: '18px', color: '#333' }
      ).setOrigin(0.5);
      this.relicIcons.push(icon);
      this.container.add(icon);
    }
    yOff += 65;

    // Potions section
    const potionLabel = this.scene.add.text(10, yOff, '🧪 Potions', {
      fontFamily: 'dungeon-mode', fontSize: '11px', color: TEXT_COLOR,
    });
    this.container.add(potionLabel);
    yOff += 16;

    for (let i = 0; i < 3; i++) {
      const icon = this.scene.add.text(15 + i * 45, yOff, '·', {
        fontSize: '18px', color: '#333',
      }).setOrigin(0.5);
      this.potionIcons.push(icon);
      this.container.add(icon);
    }
    yOff += 35;

    // Currency section
    this.gintoText = this.scene.add.text(10, yOff, '💰 0', {
      fontFamily: 'dungeon-mode', fontSize: '11px', color: '#FFD368',
    });
    this.container.add(this.gintoText);
  }

  /** Refresh all HUD elements with new data */
  update(data: OverworldHUDData): void {
    // Health
    this.healthText.setText(`${data.currentHealth}/${data.maxHealth}`);
    const hpPct = data.currentHealth / data.maxHealth;
    this.healthText.setColor(hpPct >= 0.5 ? HIGHLIGHT : hpPct >= 0.25 ? '#ffdd44' : '#ff4444');

    // Health bar fill
    this.healthBar.clear();
    const barWidth = PANEL_WIDTH - 20;
    const barHeight = 8;
    const barX = 10;
    const barY = 31;
    this.healthBar.fillStyle(0x333333);
    this.healthBar.fillRect(barX, barY, barWidth, barHeight);
    this.healthBar.fillStyle(hpPct >= 0.5 ? 0x44bb44 : hpPct >= 0.25 ? 0xffdd44 : 0xff4444);
    this.healthBar.fillRect(barX, barY, barWidth * hpPct, barHeight);

    // Relics
    data.relics.slice(0, 6).forEach((relic, i) => {
      if (this.relicIcons[i]) {
        this.relicIcons[i].setText(relic.emoji ?? '⚙️');
      }
    });
    // Clear remaining slots
    for (let i = data.relics.length; i < 6; i++) {
      if (this.relicIcons[i]) this.relicIcons[i].setText('·');
    }

    // Potions
    data.potions.slice(0, 3).forEach((potion, i) => {
      if (this.potionIcons[i]) {
        this.potionIcons[i].setText(potion.emoji ?? '🧪');
      }
    });
    for (let i = data.potions.length; i < 3; i++) {
      if (this.potionIcons[i]) this.potionIcons[i].setText('·');
    }

    // Currency
    this.gintoText.setText(`💰 ${data.ginto}`);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  destroy(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
    this.container.destroy();
  }
}

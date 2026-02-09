/**
 * IntentView - Displays the enemy's current intent icon + tooltip
 *
 * Shows an icon above the enemy that communicates what the enemy plans
 * to do on its next turn (attack, defend, buff, debuff, etc.).
 *
 * @module game/scenes/combat/views/IntentView
 */

import Phaser from 'phaser';
import type { EnemyIntent } from '../../../../core/types/CombatTypes';

// =============================================================================
// INTENT ICON MAP
// =============================================================================

const INTENT_ICONS: Record<string, string> = {
  attack: '⚔️',
  defend: '🛡️',
  buff: '💪',
  debuff: '😰',
  special: '✨',
  unknown: '❓',
};

const INTENT_COLORS: Record<string, string> = {
  attack: '#ff4444',
  defend: '#4488ff',
  buff: '#44bb44',
  debuff: '#ff8844',
  special: '#ffdd44',
  unknown: '#77888C',
};

// =============================================================================
// VIEW
// =============================================================================

export class IntentView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private iconText!: Phaser.GameObjects.Text;
  private valueText!: Phaser.GameObjects.Text;
  private tooltip: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number = 250) {
    this.scene = scene;
    this.container = scene.add.container(x, y).setDepth(depth);

    this.iconText = scene.add.text(0, 0, '', { fontSize: '24px' }).setOrigin(0.5);
    this.valueText = scene.add.text(0, 18, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '14px',
      color: '#e8eced',
    }).setOrigin(0.5);

    this.container.add([this.iconText, this.valueText]);

    // Tooltip interaction
    this.container.setInteractive(
      new Phaser.Geom.Rectangle(-20, -15, 40, 50),
      Phaser.Geom.Rectangle.Contains
    );
    this.container.on('pointerover', () => this.showTooltip());
    this.container.on('pointerout', () => this.hideTooltip());
  }

  /** Update the displayed intent */
  update(intent: EnemyIntent | undefined): void {
    if (!intent) {
      this.container.setVisible(false);
      return;
    }

    this.container.setVisible(true);

    const intentType = intent.type ?? 'unknown';
    const icon = INTENT_ICONS[intentType] ?? INTENT_ICONS.unknown;
    const color = INTENT_COLORS[intentType] ?? INTENT_COLORS.unknown;

    this.iconText.setText(icon);

    if (intent.value && intent.value > 0) {
      this.valueText.setText(String(intent.value)).setColor(color).setVisible(true);
    } else {
      this.valueText.setVisible(false);
    }

    // Store intent for tooltip
    this.container.setData('intent', intent);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  private showTooltip(): void {
    this.hideTooltip();
    const intent: EnemyIntent | undefined = this.container.getData('intent');
    if (!intent) return;

    let desc = '';
    switch (intent.type) {
      case 'attack': desc = `Intends to attack for ${intent.value ?? '?'} damage`; break;
      case 'defend': desc = 'Intends to gain block'; break;
      case 'buff': desc = 'Intends to strengthen itself'; break;
      case 'debuff': desc = 'Intends to apply a debuff'; break;
      case 'unknown': desc = 'Preparing a special action'; break;
      default: desc = 'Unknown intent';
    }

    this.tooltip = this.scene.add.container(0, -40);
    const w = 160;
    const h = 30;
    const bg = this.scene.add.rectangle(0, 0, w, h, 0x150E10).setStrokeStyle(1, 0x77888C);
    const text = this.scene.add.text(0, 0, desc, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#77888C',
      align: 'center',
    }).setOrigin(0.5);

    this.tooltip.add([bg, text]).setDepth(600);
    this.container.add(this.tooltip);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  destroy(): void {
    this.hideTooltip();
    this.container.destroy();
  }
}

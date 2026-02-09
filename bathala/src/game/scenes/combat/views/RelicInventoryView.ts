/**
 * RelicInventoryView - Displays equipped relics with tooltips
 *
 * Renders a row of relic icons (emoji or sprite) with hover tooltips.
 * Max 6 relics displayed.
 *
 * @module game/scenes/combat/views/RelicInventoryView
 */

import Phaser from 'phaser';
import type { Relic } from '../../../../core/types/CombatTypes';

const MAX_RELICS = 6;
const ICON_SIZE = 28;
const ICON_GAP = 8;
const TOOLTIP_BG = 0x150E10;
const TOOLTIP_BORDER = 0x77888C;

export class RelicInventoryView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Container[] = [];
  private tooltip: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number = 200) {
    this.scene = scene;
    this.container = scene.add.container(x, y).setDepth(depth);
  }

  /** Rebuild the relic display */
  update(relics: Relic[]): void {
    this.icons.forEach(i => i.destroy());
    this.icons = [];
    this.container.removeAll();
    this.hideTooltip();

    const displayed = relics.slice(0, MAX_RELICS);
    displayed.forEach((relic, i) => {
      const x = i * (ICON_SIZE + ICON_GAP);
      const icon = this.createRelicIcon(relic, x, 0);
      this.container.add(icon);
      this.icons.push(icon);
    });
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  private createRelicIcon(relic: Relic, x: number, y: number): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);

    const emojiText = this.scene.add
      .text(0, 0, relic.emoji ?? '⚙️', { fontSize: '20px' })
      .setOrigin(0.5);
    c.add(emojiText);

    c.setInteractive(new Phaser.Geom.Circle(0, 0, ICON_SIZE / 2), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => this.showTooltip(relic, x));
    c.on('pointerout', () => this.hideTooltip());

    return c;
  }

  private showTooltip(relic: Relic, x: number): void {
    this.hideTooltip();

    const label = `${relic.name}\n${relic.description}`;
    const w = Math.min(label.length * 5 + 30, 200);
    const h = 50;

    this.tooltip = this.scene.add.container(x, -(ICON_SIZE + 10));

    const bg = this.scene.add.rectangle(0, 0, w, h, TOOLTIP_BG).setStrokeStyle(2, TOOLTIP_BORDER);
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'dungeon-mode',
      fontSize: '11px',
      color: '#77888C',
      align: 'center',
      wordWrap: { width: w - 10 },
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
    this.icons.forEach(i => i.destroy());
    this.container.destroy();
  }
}

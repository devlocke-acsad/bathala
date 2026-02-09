/**
 * PotionInventoryView - Displays potions the player currently holds
 *
 * Renders a row of potion icons with hover tooltips and click-to-use.
 * Max 3 potions displayed.
 *
 * @module game/scenes/combat/views/PotionInventoryView
 */

import Phaser from 'phaser';

// Use a lightweight interface so this view doesn't depend on the full Potion type
export interface PotionDisplayData {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

const MAX_POTIONS = 3;
const ICON_SIZE = 30;
const ICON_GAP = 10;
const TOOLTIP_BG = 0x150E10;
const TOOLTIP_BORDER = 0x77888C;

export class PotionInventoryView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private icons: Phaser.GameObjects.Container[] = [];
  private tooltip: Phaser.GameObjects.Container | null = null;

  /** Callback fired when a potion icon is clicked */
  onPotionClicked?: (potionId: string) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number = 200) {
    this.scene = scene;
    this.container = scene.add.container(x, y).setDepth(depth);
  }

  /** Rebuild the potion display */
  update(potions: PotionDisplayData[]): void {
    this.icons.forEach(i => i.destroy());
    this.icons = [];
    this.container.removeAll();
    this.hideTooltip();

    const displayed = potions.slice(0, MAX_POTIONS);

    // Empty slots
    for (let i = 0; i < MAX_POTIONS; i++) {
      const x = i * (ICON_SIZE + ICON_GAP);
      if (i < displayed.length) {
        const icon = this.createPotionIcon(displayed[i], x, 0);
        this.container.add(icon);
        this.icons.push(icon);
      } else {
        const empty = this.createEmptySlot(x, 0);
        this.container.add(empty);
        this.icons.push(empty);
      }
    }
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  private createPotionIcon(potion: PotionDisplayData, x: number, y: number): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);

    // Background circle
    const bg = this.scene.add.circle(0, 0, ICON_SIZE / 2, 0x1f1410).setStrokeStyle(2, 0x44bb44);
    c.add(bg);

    const emoji = this.scene.add.text(0, -1, potion.emoji ?? '🧪', { fontSize: '16px' }).setOrigin(0.5);
    c.add(emoji);

    c.setInteractive(new Phaser.Geom.Circle(0, 0, ICON_SIZE / 2), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => {
      bg.setStrokeStyle(2, 0xffdd44);
      this.showTooltip(potion, x);
    });
    c.on('pointerout', () => {
      bg.setStrokeStyle(2, 0x44bb44);
      this.hideTooltip();
    });
    c.on('pointerdown', () => {
      this.onPotionClicked?.(potion.id);
    });

    return c;
  }

  private createEmptySlot(x: number, y: number): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);
    const bg = this.scene.add.circle(0, 0, ICON_SIZE / 2, 0x0a0808).setStrokeStyle(1, 0x333333);
    c.add(bg);
    return c;
  }

  private showTooltip(potion: PotionDisplayData, x: number): void {
    this.hideTooltip();

    const label = `${potion.name}\n${potion.description}`;
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

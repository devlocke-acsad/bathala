/**
 * StatusEffectView - Renders status effect icons above player / enemy
 *
 * Each entity gets its own StatusEffectView instance. The view reads
 * from the entity's statusEffects array and renders icons + stack counts.
 *
 * @module game/scenes/combat/views/StatusEffectView
 */

import Phaser from 'phaser';
import type { StatusEffect } from '../../../../core/types/CombatTypes';

// =============================================================================
// CONSTANTS
// =============================================================================

const ICON_SIZE = 28;
const ICON_GAP = 6;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_BG = 0x150E10;
const TOOLTIP_BORDER = 0x77888C;

const EFFECT_DESCRIPTIONS: Record<string, string> = {
  strength: 'Strength: +3 damage per stack to attacks',
  weak: 'Weak: -25% damage per stack',
  vulnerable: 'Vulnerable: take 50% more damage',
  frail: 'Frail: -25% block per stack',
  poison: 'Burn: 2 damage per stack at start of turn',
  regeneration: 'Regeneration: heal 2 HP per stack at start of turn',
  plated_armor: 'Plated Armor: gain block at end of turn',
  ritual: 'Ritual: gain Strength at end of turn',
};

// =============================================================================
// VIEW
// =============================================================================

export class StatusEffectView {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private tooltip: Phaser.GameObjects.Container | null = null;
  private iconSprites: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number = 300) {
    this.scene = scene;
    this.container = scene.add.container(x, y).setDepth(depth);
  }

  /** Rebuild icons from the given status effects */
  update(effects: StatusEffect[]): void {
    // Destroy old icons
    this.iconSprites.forEach(s => s.destroy());
    this.iconSprites = [];
    this.container.removeAll();
    this.hideTooltip();

    if (!effects || effects.length === 0) return;

    // Sort: buffs first, then debuffs
    const sorted = [...effects].sort((a, b) => {
      const aIsBuff = a.type === 'buff' ? 0 : 1;
      const bIsBuff = b.type === 'buff' ? 0 : 1;
      return aIsBuff - bIsBuff;
    });

    const totalWidth = sorted.length * (ICON_SIZE + ICON_GAP) - ICON_GAP;
    let startX = -totalWidth / 2;

    sorted.forEach((effect, i) => {
      const x = startX + i * (ICON_SIZE + ICON_GAP);
      const icon = this.createIcon(effect, x, 0);
      this.container.add(icon);
      this.iconSprites.push(icon);
    });
  }

  /** Reposition the view */
  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  // ---- Icon creation ---------------------------------------------------------

  private createIcon(effect: StatusEffect, x: number, y: number): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);

    // Background circle
    const bg = this.scene.add.circle(0, 0, ICON_SIZE / 2, 0x1f1410).setStrokeStyle(1, TOOLTIP_BORDER);
    c.add(bg);

    // Emoji icon
    const emoji = this.scene.add.text(0, -2, effect.emoji ?? '⚡', { fontSize: '14px' }).setOrigin(0.5);
    c.add(emoji);

    // Stack count
    if (effect.value && effect.value > 1) {
      const stackText = this.scene.add.text(ICON_SIZE / 3, ICON_SIZE / 4, String(effect.value), {
        fontFamily: 'dungeon-mode',
        fontSize: '10px',
        color: '#ffdd44',
      }).setOrigin(0.5);
      c.add(stackText);
    }

    // Interaction for tooltip
    c.setInteractive(new Phaser.Geom.Circle(0, 0, ICON_SIZE / 2), Phaser.Geom.Circle.Contains);
    c.on('pointerover', () => this.showTooltip(effect, x));
    c.on('pointerout', () => this.hideTooltip());

    return c;
  }

  // ---- Tooltip ---------------------------------------------------------------

  private showTooltip(effect: StatusEffect, x: number): void {
    this.hideTooltip();

    const desc = EFFECT_DESCRIPTIONS[effect.id] ?? `${effect.name}: ${effect.value} stacks`;
    const tooltipY = -ICON_SIZE - 10;

    this.tooltip = this.scene.add.container(x, tooltipY);

    const bg = this.scene.add.rectangle(0, 0, TOOLTIP_WIDTH, 40, TOOLTIP_BG).setStrokeStyle(2, TOOLTIP_BORDER);
    const text = this.scene.add.text(0, 0, desc, {
      fontFamily: 'dungeon-mode',
      fontSize: '11px',
      color: '#77888C',
      wordWrap: { width: TOOLTIP_WIDTH - 10 },
      align: 'center',
    }).setOrigin(0.5);

    this.tooltip.add([bg, text]);
    this.tooltip.setDepth(500);
    this.container.add(this.tooltip);
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  // ---- Feedback animations ---------------------------------------------------

  /** Flash an icon when a status is applied */
  showApplyFeedback(effectId: string): void {
    const icon = this.iconSprites.find(
      s => (s.getData?.('effectId') ?? '') === effectId
    );
    if (!icon) return;
    this.scene.tweens.add({
      targets: icon,
      scale: 1.4,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut',
    });
  }

  /** Shrink + fade when a status expires */
  showExpireFeedback(effectId: string): void {
    const icon = this.iconSprites.find(
      s => (s.getData?.('effectId') ?? '') === effectId
    );
    if (!icon) return;
    this.scene.tweens.add({
      targets: icon,
      alpha: 0,
      scale: 0.3,
      duration: 300,
      ease: 'Power2',
    });
  }

  // ---- Cleanup ---------------------------------------------------------------

  destroy(): void {
    this.hideTooltip();
    this.iconSprites.forEach(s => s.destroy());
    this.container.destroy();
  }
}

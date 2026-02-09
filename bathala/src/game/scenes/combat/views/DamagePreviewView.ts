/**
 * DamagePreviewView - Shows a live damage/block preview above the action buttons
 *
 * When the player has selected cards and a hand is formed, this view shows
 * the expected damage/block for each action type (Attack / Defend / Special).
 *
 * @module game/scenes/combat/views/DamagePreviewView
 */

import Phaser from 'phaser';
import type { PlayingCard, Player, Enemy } from '../../../../core/types/CombatTypes';
import { HandEvaluator } from '../../../../utils/HandEvaluator';

export class DamagePreviewView {
  private container: Phaser.GameObjects.Container;
  private attackText!: Phaser.GameObjects.Text;
  private defendText!: Phaser.GameObjects.Text;
  private specialText!: Phaser.GameObjects.Text;
  private handTypeText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number = 150) {
    this.container = scene.add.container(x, y).setDepth(depth);

    const scaleFactor = Math.max(0.8, Math.min(1.2, scene.cameras.main.width / 1024));

    // Hand type label
    this.handTypeText = scene.add.text(0, -20, '', {
      fontFamily: 'dungeon-mode',
      fontSize: Math.floor(14 * scaleFactor) + 'px',
      color: '#ffdd44',
      align: 'center',
    }).setOrigin(0.5);
    this.container.add(this.handTypeText);

    // Preview row
    const gap = 100;
    this.attackText = scene.add.text(-gap, 0, '', {
      fontFamily: 'dungeon-mode',
      fontSize: Math.floor(12 * scaleFactor) + 'px',
      color: '#ff4444',
      align: 'center',
    }).setOrigin(0.5);

    this.defendText = scene.add.text(0, 0, '', {
      fontFamily: 'dungeon-mode',
      fontSize: Math.floor(12 * scaleFactor) + 'px',
      color: '#4488ff',
      align: 'center',
    }).setOrigin(0.5);

    this.specialText = scene.add.text(gap, 0, '', {
      fontFamily: 'dungeon-mode',
      fontSize: Math.floor(12 * scaleFactor) + 'px',
      color: '#ffdd44',
      align: 'center',
    }).setOrigin(0.5);

    this.container.add([this.attackText, this.defendText, this.specialText]);
    this.container.setVisible(false);
  }

  /**
   * Recalculate and display the preview for the current played hand.
   * Pass `null` cards to hide.
   */
  update(
    playedCards: PlayingCard[] | null,
    player?: Player,
    _enemy?: Enemy
  ): void {
    if (!playedCards || playedCards.length === 0) {
      this.container.setVisible(false);
      return;
    }

    this.container.setVisible(true);

    // Evaluate hand once
    const evalAttack = HandEvaluator.evaluateHand(playedCards, 'attack', player ?? null);
    const evalDefend = HandEvaluator.evaluateHand(playedCards, 'defend', player ?? null);
    const evalSpecial = HandEvaluator.evaluateHand(playedCards, 'special', player ?? null);

    this.handTypeText.setText(evalAttack.type.replace(/_/g, ' ').toUpperCase());

    this.attackText.setText(`⚔️ ${evalAttack.totalValue}`);
    this.defendText.setText(`🛡️ ${evalDefend.totalValue}`);
    this.specialText.setText(`✨ ${evalSpecial.totalValue}`);
  }

  /** Show / hide the entire preview */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  destroy(): void {
    this.container.destroy();
  }
}

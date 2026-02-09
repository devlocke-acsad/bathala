/**
 * CombatOverlayView - Full-screen overlays for combat results
 *
 * Manages:
 *  - Victory / Defeat screens
 *  - Landás choice overlay (Spare / Slay)
 *  - Reward selection overlay
 *  - Floating damage numbers
 *  - Action result text (e.g. "22 Damage!")
 *
 * @module game/scenes/combat/views/CombatOverlayView
 */

import Phaser from 'phaser';

const OVERLAY_BG = 0x150E10;
const OVERLAY_ALPHA = 0.7;
const BORDER_COLOR = 0x77888C;
const HIGHLIGHT_COLOR = '#e8eced';
const MUTED_COLOR = '#77888C';

export class CombatOverlayView {
  private scene: Phaser.Scene;
  private overlayContainer: Phaser.GameObjects.Container | null = null;
  private floatingTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ===========================================================================
  // FLOATING DAMAGE NUMBERS
  // ===========================================================================

  /** Show a floating damage number above a position */
  showFloatingDamage(x: number, y: number, damage: number): void {
    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '28px',
      color: '#ff4444',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(900);

    this.floatingTexts.push(text);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      scale: 1.3,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        this.floatingTexts = this.floatingTexts.filter(t => t !== text);
      },
    });
  }

  /** Show a floating heal number */
  showFloatingHeal(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '24px',
      color: '#44bb44',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(900);

    this.floatingTexts.push(text);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        this.floatingTexts = this.floatingTexts.filter(t => t !== text);
      },
    });
  }

  /** Show a floating block number */
  showFloatingBlock(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y, `+${amount} 🛡️`, {
      fontFamily: 'dungeon-mode',
      fontSize: '22px',
      color: '#4488ff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(900);

    this.floatingTexts.push(text);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        text.destroy();
        this.floatingTexts = this.floatingTexts.filter(t => t !== text);
      },
    });
  }

  // ===========================================================================
  // ACTION RESULT TEXT
  // ===========================================================================

  /** Show a temporary action result message in the centre of screen */
  showActionResult(message: string, duration: number = 1500): void {
    const { width, height } = this.scene.cameras.main;
    const text = this.scene.add.text(width / 2, height * 0.55, message, {
      fontFamily: 'dungeon-mode',
      fontSize: '20px',
      color: '#2ed573',
      align: 'center',
    }).setOrigin(0.5).setDepth(800);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      y: height * 0.55 - 30,
      duration,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ===========================================================================
  // FULL-SCREEN OVERLAYS
  // ===========================================================================

  /** Show a generic full-screen overlay with title and optional body text */
  showOverlay(options: {
    title: string;
    body?: string;
    buttons?: { label: string; callback: () => void }[];
  }): void {
    this.hideOverlay();

    const { width, height } = this.scene.cameras.main;
    this.overlayContainer = this.scene.add.container(0, 0).setDepth(1000);

    // Dimmer
    const dimmer = this.scene.add
      .rectangle(width / 2, height / 2, width, height, OVERLAY_BG)
      .setAlpha(OVERLAY_ALPHA);
    this.overlayContainer.add(dimmer);

    // Title
    const titleText = this.scene.add.text(width / 2, height * 0.3, options.title, {
      fontFamily: 'dungeon-mode',
      fontSize: '32px',
      color: HIGHLIGHT_COLOR,
      align: 'center',
    }).setOrigin(0.5);
    this.overlayContainer.add(titleText);

    // Body
    if (options.body) {
      const bodyText = this.scene.add.text(width / 2, height * 0.45, options.body, {
        fontFamily: 'dungeon-mode',
        fontSize: '16px',
        color: MUTED_COLOR,
        align: 'center',
        wordWrap: { width: width * 0.6 },
      }).setOrigin(0.5);
      this.overlayContainer.add(bodyText);
    }

    // Buttons
    if (options.buttons) {
      const btnY = height * 0.65;
      const btnGap = 160;
      const startX = width / 2 - ((options.buttons.length - 1) * btnGap) / 2;

      options.buttons.forEach((btn, i) => {
        const bx = startX + i * btnGap;
        const btnContainer = this.createOverlayButton(bx, btnY, btn.label, btn.callback);
        this.overlayContainer!.add(btnContainer);
      });
    }

    // Fade in
    this.overlayContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.overlayContainer,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });
  }

  /** Hide the current overlay */
  hideOverlay(): void {
    if (this.overlayContainer) {
      this.overlayContainer.destroy();
      this.overlayContainer = null;
    }
  }

  /** Show a victory overlay */
  showVictory(onContinue: () => void): void {
    this.showOverlay({
      title: '✨ Victory! ✨',
      body: 'The creature has been defeated.',
      buttons: [{ label: 'Continue', callback: onContinue }],
    });
  }

  /** Show a defeat overlay */
  showDefeat(onRetry: () => void, onQuit: () => void): void {
    this.showOverlay({
      title: '💀 Defeated 💀',
      body: 'Your journey ends here... for now.',
      buttons: [
        { label: 'Retry', callback: onRetry },
        { label: 'Quit', callback: onQuit },
      ],
    });
  }

  // ---- Button helper ---------------------------------------------------------

  private createOverlayButton(
    x: number,
    y: number,
    label: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const c = this.scene.add.container(x, y);
    const w = 120;
    const h = 40;

    const bg = this.scene.add.rectangle(0, 0, w, h, 0x1f1410).setStrokeStyle(2, BORDER_COLOR);
    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: MUTED_COLOR,
    }).setOrigin(0.5);

    c.add([bg, text]);
    c.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);

    c.on('pointerover', () => {
      bg.setFillStyle(0x2a1a12);
      text.setColor(HIGHLIGHT_COLOR);
    });
    c.on('pointerout', () => {
      bg.setFillStyle(0x1f1410);
      text.setColor(MUTED_COLOR);
    });
    c.on('pointerdown', callback);

    return c;
  }

  // ---- Cleanup ---------------------------------------------------------------

  destroy(): void {
    this.hideOverlay();
    this.floatingTexts.forEach(t => t.destroy());
    this.floatingTexts = [];
  }
}

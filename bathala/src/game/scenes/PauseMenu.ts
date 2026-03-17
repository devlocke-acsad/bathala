import { Scene } from 'phaser';
import { createButton } from '../ui/Button';

type PauseMenuData = {
  returnSceneKey: string;
};

const SCENES_TO_STOP_ON_MAIN_MENU = [
  'Overworld',
  'Combat',
  'Shop',
  'EventScene',
  'Campfire',
  'Treasure',
  'PauseMenu',
  'PokerHandReference',
] as const;

export class PauseMenu extends Scene {
  private returnSceneKey: string = 'Overworld';
  private static readonly DEPTH_BASE = 1_000_000;

  constructor() {
    super({ key: 'PauseMenu' });
  }

  init(data: PauseMenuData): void {
    this.returnSceneKey = data?.returnSceneKey || 'Overworld';
  }

  create(): void {
    // Ensure this overlay scene is above everything else.
    this.scene.bringToTop();

    const { width: w, height: h } = this.cameras.main;

    // Dark overlay (UI-only)
    this.add
      .rectangle(w / 2, h / 2, w, h, 0x000000, 0.72)
      .setDepth(PauseMenu.DEPTH_BASE);

    // Panel
    const panelW = Math.min(720, w * 0.56);
    const panelH = Math.min(520, h * 0.62);
    const cx = w / 2;
    const cy = h / 2;

    const outer = this.add
      .rectangle(cx, cy, panelW + 10, panelH + 10, undefined, 0)
      .setDepth(PauseMenu.DEPTH_BASE + 1);
    outer.setStrokeStyle(2, 0x77888c, 0.85);

    const bg = this.add
      .rectangle(cx, cy, panelW, panelH, 0x150e10, 0.92)
      .setDepth(PauseMenu.DEPTH_BASE + 1);
    bg.setStrokeStyle(2, 0x556065, 0.6);

    this.add
      .text(cx, cy - panelH / 2 + 85, 'PAUSED', {
        fontFamily: 'dungeon-mode',
        fontSize: 44,
        color: '#e8eced',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(PauseMenu.DEPTH_BASE + 2);

    const subtitle = this.add
      .text(cx, cy - panelH / 2 + 125, `(${this.returnSceneKey})`, {
        fontFamily: 'dungeon-mode',
        fontSize: 14,
        color: '#77888C',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(PauseMenu.DEPTH_BASE + 2);
    subtitle.setAlpha(0.75);

    const buttonW = 260;
    const startY = cy - 20;
    const gap = 74;

    const resumeBtn = createButton(this, cx, startY, 'Resume', () => this.resume(), buttonW).setDepth(PauseMenu.DEPTH_BASE + 4);
    const helpBtn = createButton(this, cx, startY + gap, 'Help', () => this.openHelp(), buttonW).setDepth(PauseMenu.DEPTH_BASE + 4);
    const menuBtn = createButton(this, cx, startY + gap * 2, 'Main Menu', () => this.goToMainMenu(), buttonW).setDepth(PauseMenu.DEPTH_BASE + 4);

    // Allow clicking outside panel to resume (small UX win).
    const hit = this.add
      .rectangle(w / 2, h / 2, w, h, 0x000000, 0)
      .setDepth(PauseMenu.DEPTH_BASE + 3);
    hit.setInteractive();
    hit.on('pointerdown', (_p: Phaser.Input.Pointer, localX: number, localY: number) => {
      // Only resume when clicking outside the panel bounds.
      const left = cx - panelW / 2;
      const right = cx + panelW / 2;
      const top = cy - panelH / 2;
      const bottom = cy + panelH / 2;
      const isInsidePanel = localX >= left && localX <= right && localY >= top && localY <= bottom;
      if (!isInsidePanel) this.resume();
    });

    // ESC while paused should resume.
    const esc = this.input.keyboard?.addKey('ESC');
    esc?.on('down', () => this.resume());
  }

  private resume(): void {
    const key = this.returnSceneKey;
    this.scene.stop();
    if (this.scene.manager.getScene(key)) {
      this.scene.resume(key);
    }
  }

  private goToMainMenu(): void {
    // Stop any gameplay scenes that might be active/paused under the overlay.
    for (const key of SCENES_TO_STOP_ON_MAIN_MENU) {
      if (this.scene.manager.getScene(key)) {
        this.scene.stop(key);
      }
    }
    this.scene.start('MainMenu');
  }

  private openHelp(): void {
    if (this.scene.isActive('PokerHandReference')) return;

    // Disable interactions with the pause menu while the reference is open.
    this.input.enabled = false;
    this.scene.launch('PokerHandReference');
    this.scene.bringToTop('PokerHandReference');

    const ref = this.scene.get('PokerHandReference');
    ref.events.once('shutdown', () => {
      this.input.enabled = true;
      this.scene.bringToTop('PauseMenu');
    });
  }
}


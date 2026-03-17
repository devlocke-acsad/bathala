import { Scene } from 'phaser';

type PauseableSceneKey =
  | 'Overworld'
  | 'Combat'
  | 'Shop'
  | 'EventScene'
  | 'Campfire'
  | 'Treasure';

const PAUSEABLE_SCENES: ReadonlySet<string> = new Set<PauseableSceneKey>([
  'Overworld',
  'Combat',
  'Shop',
  'EventScene',
  'Campfire',
  'Treasure',
]);

/**
 * Always-on scene that listens for ESC and opens PauseMenu
 * for selected gameplay scenes only.
 */
export class PauseController extends Scene {
  private onWindowKeyDown?: (ev: KeyboardEvent) => void;

  constructor() {
    super({ key: 'PauseController' });
  }

  create(): void {
    const esc = this.input.keyboard?.addKey('ESC');
    esc?.on('down', () => this.tryOpenPauseMenu());

    // Fallback: some scenes disable Phaser keyboard input (global-ish),
    // which can prevent ESC from reaching this scene. Use a window listener
    // so the pause menu can still be opened.
    this.onWindowKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== 'Escape') return;
      this.tryOpenPauseMenu();
    };
    window.addEventListener('keydown', this.onWindowKeyDown);

    this.events.once('shutdown', () => {
      if (this.onWindowKeyDown) {
        window.removeEventListener('keydown', this.onWindowKeyDown);
        this.onWindowKeyDown = undefined;
      }
    });
  }

  private tryOpenPauseMenu(): void {
    // Don't open if PauseMenu already open or if the reference screen is open.
    if (this.scene.isActive('PauseMenu') || this.scene.isActive('PokerHandReference')) {
      return;
    }

    const target = this.getTopmostPauseableScene();
    if (!target) return;

    // Pause the gameplay scene and open the pause overlay.
    this.scene.pause(target.scene.key);
    this.scene.launch('PauseMenu', { returnSceneKey: target.scene.key });
    this.scene.bringToTop('PauseMenu');
  }

  private getTopmostPauseableScene(): Scene | null {
    const mgr = this.scene.manager as unknown as {
      getScenes: (active?: boolean) => Scene[];
    };

    const activeScenes = typeof mgr.getScenes === 'function' ? mgr.getScenes(true) : [];

    // We want the top-most active gameplay scene (e.g., Shop on top of paused Overworld).
    // Phaser returns scenes in display list order; the last one is usually the top-most.
    for (let i = activeScenes.length - 1; i >= 0; i--) {
      const s = activeScenes[i];
      const key = s.scene.key;
      if (!key) continue;
      if (key === 'PauseController' || key === 'PauseMenu') continue;
      if (PAUSEABLE_SCENES.has(key)) return s;
    }

    return null;
  }
}


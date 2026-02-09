/**
 * DayNightController - Manages the day/night cycle UI and state reading
 *
 * Reads from OverworldGameState (the source of truth for action counts
 * and phase) and renders the visual progress bar + night overlay.
 *
 * Does NOT own the game state — OverworldGameState singleton does.
 * This controller is purely a view + display layer.
 *
 * @module systems/world/DayNightController
 */

import Phaser from 'phaser';
import { OverworldGameState } from '../../core/managers/OverworldGameState';

// =============================================================================
// CONSTANTS
// =============================================================================

const BAR_HEIGHT = 14;
const SEGMENT_COUNT = 10;            // 5 day + 5 night segments
const DAY_COLOR = 0xFFD368;
const NIGHT_COLOR = 0x7144FF;
const INDICATOR_COLOR = 0xff4444;
const BG_COLOR = 0x150E10;
const BORDER_COLOR = 0x77888C;
const NIGHT_OVERLAY_COLOR = 0x000033;
const NIGHT_OVERLAY_ALPHA = 0.4;

// =============================================================================
// CONTROLLER
// =============================================================================

export class DayNightController {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private progressFill!: Phaser.GameObjects.Graphics;
  private indicator!: Phaser.GameObjects.Polygon;
  private nightOverlay: Phaser.GameObjects.Rectangle | null = null;
  private phaseLabel!: Phaser.GameObjects.Text;
  private bossProgressText!: Phaser.GameObjects.Text;
  private barX = 0;
  private barWidth = 0;

  /** Callback fired when boss threshold is reached */
  onBossThresholdReached?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setDepth(900);
  }

  // ---- Setup -----------------------------------------------------------------

  /** Build the progress bar + labels. Call once during create(). */
  create(screenWidth: number, _screenHeight: number): void {
    this.barWidth = screenWidth * 0.6;
    this.barX = (screenWidth - this.barWidth) / 2;
    const barY = 8;

    // Background bar
    const bgBar = this.scene.add.rectangle(
      screenWidth / 2, barY + BAR_HEIGHT / 2,
      this.barWidth + 4, BAR_HEIGHT + 4,
      BG_COLOR
    ).setStrokeStyle(1, BORDER_COLOR);
    this.container.add(bgBar);

    // Coloured segments
    const segWidth = this.barWidth / SEGMENT_COUNT;
    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const isDay = i % 2 === 0;
      const seg = this.scene.add.rectangle(
        this.barX + i * segWidth + segWidth / 2,
        barY + BAR_HEIGHT / 2,
        segWidth - 1,
        BAR_HEIGHT - 2,
        isDay ? DAY_COLOR : NIGHT_COLOR
      ).setAlpha(0.4);
      this.container.add(seg);
    }

    // Progress fill (will be redrawn each update)
    this.progressFill = this.scene.add.graphics().setDepth(901);
    this.container.add(this.progressFill);

    // Triangle indicator
    this.indicator = this.scene.add.polygon(
      this.barX, barY + BAR_HEIGHT + 6,
      [0, 0, 6, 8, -6, 8],
      INDICATOR_COLOR
    );
    this.container.add(this.indicator);

    // Phase label
    this.phaseLabel = this.scene.add.text(screenWidth / 2, barY + BAR_HEIGHT + 14, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#77888C',
    }).setOrigin(0.5);
    this.container.add(this.phaseLabel);

    // Boss progress text (for debug)
    this.bossProgressText = this.scene.add.text(screenWidth - 10, 4, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#77888C',
    }).setOrigin(1, 0);
    this.container.add(this.bossProgressText);
  }

  // ---- Update ----------------------------------------------------------------

  /** Call each frame or after each action to refresh the display */
  update(): void {
    const state = OverworldGameState.getInstance();
    const totalActions = state.actionsTaken;
    const maxActions = state.totalActionsUntilBoss;
    const isNight = !state.isDay;
    const progress = Math.min(1, totalActions / maxActions);

    // Move indicator
    const indicatorX = this.barX + progress * this.barWidth;
    this.indicator.setX(indicatorX);

    // Redraw fill
    const barY = 8;
    this.progressFill.clear();
    this.progressFill.fillStyle(0xffffff, 0.3);
    this.progressFill.fillRect(this.barX, barY + 1, progress * this.barWidth, BAR_HEIGHT - 2);

    // Phase label
    const phaseName = isNight ? '🌙 Night' : '☀️ Day';
    this.phaseLabel.setText(phaseName);

    // Night overlay
    this.updateNightOverlay(isNight);

    // Boss progress
    const pct = Math.floor(progress * 100);
    this.bossProgressText.setText(`Boss Progress: ${pct}%`);
    this.bossProgressText.setColor(pct > 80 ? '#ff4444' : '#77888C');

    // Boss threshold check
    if (progress >= 1.0) {
      this.onBossThresholdReached?.();
    }
  }

  // ---- Night overlay ---------------------------------------------------------

  private updateNightOverlay(isNight: boolean): void {
    const { width, height } = this.scene.cameras.main;

    if (isNight && !this.nightOverlay) {
      this.nightOverlay = this.scene.add
        .rectangle(width / 2, height / 2, width, height, NIGHT_OVERLAY_COLOR)
        .setAlpha(NIGHT_OVERLAY_ALPHA)
        .setDepth(50)
        .setScrollFactor(0);
    } else if (!isNight && this.nightOverlay) {
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
  }

  // ---- Cleanup ---------------------------------------------------------------

  destroy(): void {
    if (this.nightOverlay) {
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
    this.container.destroy();
  }
}

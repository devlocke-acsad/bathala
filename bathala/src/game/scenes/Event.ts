
import { Scene } from 'phaser';
import { GameState } from '../../core/managers/GameState';
import { Player } from '../../core/types/CombatTypes';
import { GameEvent, EventChoice, EventContext, EducationalEvent } from '../../data/events/EventTypes';
import { EventSelectionSystem } from '../../systems/world/EventSelectionSystem';
import { OverworldGameState } from '../../core/managers/OverworldGameState';
import { MusicLifecycleSystem } from '../../systems/shared/MusicLifecycleSystem';
import { EducationalEventManager } from '../../core/managers/EducationalEventManager';

/**
 * EventScene — Persona 3 Reload-Inspired Encounter UI
 *
 * Cinematic split-panel layout with atmospheric backgrounds,
 * floating particles, typewriter text with punctuation pauses,
 * stylized choice cards, and dramatic transitions.
 */
export class EventScene extends Scene {
  private player!: Player;
  private currentEvent!: GameEvent | EducationalEvent;
  private isDayCycle!: boolean;

  // Layout constants (1920×1080)
  private readonly W = 1920;
  private readonly H = 1080;

  // Day/Night colour theming
  private accentColor!: number;
  private accentHex!: string;

  // Containers & objects
  private bgLayer!: Phaser.GameObjects.Container;
  private illustrationContainer!: Phaser.GameObjects.Container;
  private dialogueContainer!: Phaser.GameObjects.Container;
  private dialogueBoxGfx!: Phaser.GameObjects.Graphics;
  private choiceContainer!: Phaser.GameObjects.Container;

  // Dialogue state
  private descriptionText!: Phaser.GameObjects.Text;
  private currentDescriptionIndex = 0;
  private typingTimer?: Phaser.Time.TimerEvent;
  private continueIndicator!: Phaser.GameObjects.Text;
  private isTyping = false;
  private pendingClickHandler?: () => void;

  // Particles
  private particles: Phaser.GameObjects.Arc[] = [];

  // Music
  private musicLifecycle!: MusicLifecycleSystem;

  // Choice buttons reference for cleanup
  private choiceButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'EventScene' });
  }

  init(data: { player: Player; event?: GameEvent | EducationalEvent }) {
    this.player = data.player;
    this.currentEvent = data.event ?? EventSelectionSystem.getRandomEvent();
    this.isDayCycle = OverworldGameState.getInstance().isDay;
    OverworldGameState.getInstance().markEventEncountered(this.currentEvent.id);
    this.currentDescriptionIndex = 0;
    this.choiceButtons = [];
    this.particles = [];
    this.isTyping = false;
    this.pendingClickHandler = undefined;
  }

  create() {
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();

    // Resolve theming based on day/night
    this.resolveTheme();

    // Build layers
    this.createAtmosphericBackground();
    this.playEntranceTransition();

    // Build UI (hidden initially, revealed by transition)
    this.buildIllustrationPanel();
    this.buildDialoguePanel();

    // Start event flow after entrance animation
    this.time.delayedCall(900, () => this.showNextDescription());
  }

  // ─────────────────────────────────────────────
  //  THEMING
  // ─────────────────────────────────────────────

  private resolveTheme(): void {
    if (this.isDayCycle) {
      // Day: warm teal / gold
      this.accentColor = 0x20b2aa;
      this.accentHex = '#20b2aa';
    } else {
      // Night: deep violet / blue
      this.accentColor = 0x8a6fdf;
      this.accentHex = '#8a6fdf';
    }
  }

  // ─────────────────────────────────────────────
  //  ATMOSPHERIC BACKGROUND
  // ─────────────────────────────────────────────

  private createAtmosphericBackground(): void {
    this.bgLayer = this.add.container(0, 0).setDepth(0);

    // Base dark fill
    const base = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x0a0608);
    this.bgLayer.add(base);

    // Radial vignette gradient overlay
    const vignetteGfx = this.add.graphics();
    vignetteGfx.fillStyle(0x000000, 0);
    vignetteGfx.fillRect(0, 0, this.W, this.H);

    // Edge vignette — 4 rectangles with gradient alpha
    const edgeAlpha = 0.6;
    const edgeLeft = this.add.rectangle(0, this.H / 2, 200, this.H, 0x000000, edgeAlpha).setOrigin(0, 0.5);
    const edgeRight = this.add.rectangle(this.W, this.H / 2, 200, this.H, 0x000000, edgeAlpha).setOrigin(1, 0.5);
    const edgeTop = this.add.rectangle(this.W / 2, 0, this.W, 120, 0x000000, edgeAlpha).setOrigin(0.5, 0);
    const edgeBottom = this.add.rectangle(this.W / 2, this.H, this.W, 120, 0x000000, edgeAlpha).setOrigin(0.5, 1);
    this.bgLayer.add([edgeLeft, edgeRight, edgeTop, edgeBottom]);

    // Subtle colour wash (day = warm, night = cool)
    const washColor = this.isDayCycle ? 0x1a2f2a : 0x1a1a2f;
    const wash = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, washColor, 0.35);
    this.bgLayer.add(wash);

    // Scanline texture overlay
    const scanGfx = this.make.graphics({});
    scanGfx.fillStyle(0x000000, 1);
    scanGfx.fillRect(0, 0, 4, 2);
    scanGfx.fillStyle(0xffffff, 1);
    scanGfx.fillRect(0, 2, 4, 2);
    scanGfx.generateTexture('event_scanline', 4, 4);
    scanGfx.destroy();

    if (this.textures.exists('event_scanline')) {
      const scanlines = this.add.tileSprite(0, 0, this.W, this.H, 'event_scanline')
        .setOrigin(0).setAlpha(0.04).setTint(0x4a3a40);
      this.bgLayer.add(scanlines);
    }

    // Floating ambient particles
    this.createFloatingParticles();

    // Divider line between left/right panels
    const dividerX = this.W * 0.38;
    const divLine = this.add.graphics();
    divLine.lineStyle(2, this.accentColor, 0.25);
    divLine.beginPath();
    divLine.moveTo(dividerX, 60);
    divLine.lineTo(dividerX, this.H - 60);
    divLine.strokePath();
    this.bgLayer.add(divLine);
  }

  private createFloatingParticles(): void {
    const count = 30;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, this.W);
      const y = Phaser.Math.Between(0, this.H);
      const radius = Phaser.Math.FloatBetween(1.5, 4);
      const alpha = Phaser.Math.FloatBetween(0.08, 0.3);

      const color = this.isDayCycle
        ? Phaser.Math.RND.pick([0xd4a747, 0xe8c96e, 0x20b2aa])
        : Phaser.Math.RND.pick([0x8a6fdf, 0x4a90d9, 0x6b5ce7]);

      const dot = this.add.circle(x, y, radius, color, alpha).setDepth(1);
      this.bgLayer.add(dot);
      this.particles.push(dot);

      // Gentle float + fade animation
      const duration = Phaser.Math.Between(4000, 8000);
      this.tweens.add({
        targets: dot,
        y: y - Phaser.Math.Between(80, 200),
        alpha: 0,
        duration,
        ease: 'Sine.easeInOut',
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          dot.setPosition(Phaser.Math.Between(0, this.W), this.H + 20);
          dot.setAlpha(alpha);
        }
      });
    }
  }

  // ─────────────────────────────────────────────
  //  ENTRANCE TRANSITION
  // ─────────────────────────────────────────────

  private playEntranceTransition(): void {
    // Full-screen cover
    const cover = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x050305)
      .setOrigin(0.5).setAlpha(1).setDepth(9999);

    // Diagonal slash wipes (P3R-style geometric cuts)
    const slashCount = 6;
    const slashes: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < slashCount; i++) {
      const slashH = (this.H / slashCount) + 10;
      const y = slashH * i + slashH / 2;
      const fromLeft = i % 2 === 0;
      const slash = this.add.rectangle(
        fromLeft ? -this.W : this.W * 2,
        y,
        this.W + 200,
        slashH,
        Phaser.Math.RND.pick([0x0a0608, 0x0d080b, 0x100c0e])
      ).setOrigin(0.5).setAlpha(0.95).setDepth(9998);

      // Slight rotation for diagonal feel
      slash.setRotation(fromLeft ? -0.02 : 0.02);
      slashes.push(slash);

      this.tweens.add({
        targets: slash,
        x: this.W / 2,
        duration: 350,
        ease: 'Power3',
        delay: i * 60,
      });
    }

    // After slashes cover, fade them out with the cover
    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: cover,
        alpha: 0,
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => cover.destroy()
      });

      slashes.forEach((slash, i) => {
        this.tweens.add({
          targets: slash,
          alpha: 0,
          x: (i % 2 === 0) ? this.W * 2 : -this.W,
          duration: 400,
          ease: 'Power2',
          delay: i * 40,
          onComplete: () => slash.destroy()
        });
      });
    });
  }

  // ─────────────────────────────────────────────
  //  ILLUSTRATION PANEL (LEFT ~38%)
  // ─────────────────────────────────────────────

  private buildIllustrationPanel(): void {
    const panelW = this.W * 0.36;
    const panelCenterX = panelW / 2 + 20;
    // Push glyph/ring higher to avoid overlapping the title at bottom
    const glyphCenterY = this.H * 0.38;

    this.illustrationContainer = this.add.container(0, 0).setDepth(5).setAlpha(0);

    // Check if we have splash art for this event
    const textureKey = this.getEventTextureKey();
    const hasArt = textureKey !== null && this.textures.exists(textureKey);

    if (hasArt) {
      // ── Show splash art image ──
      const artImage = this.add.image(panelCenterX, this.H / 2 - 30, textureKey!).setOrigin(0.5);

      // Scale to fill left panel area while maintaining aspect ratio
      const maxW = panelW - 40;
      const maxH = this.H - 300; // Leave room for badge + title
      const scaleX = maxW / artImage.width;
      const scaleY = maxH / artImage.height;
      const scale = Math.min(scaleX, scaleY);
      artImage.setScale(scale);

      this.illustrationContainer.add(artImage);

      // Subtle breathing animation on the art
      this.tweens.add({
        targets: artImage,
        scaleX: scale * 1.02,
        scaleY: scale * 1.02,
        duration: 4000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // Soft vignette overlay around the art
      const vigGfx = this.add.graphics();
      vigGfx.fillStyle(0x0a0608, 0.4);
      vigGfx.fillRect(0, 0, panelW + 40, 100); // Top fade
      vigGfx.fillRect(0, this.H - 260, panelW + 40, 260); // Bottom fade for title
      this.illustrationContainer.add(vigGfx);
    } else {
      // ── Fallback: decorative glyph ──
      // Atmospheric glow behind illustration
      const glowGfx = this.add.graphics();
      glowGfx.fillStyle(this.accentColor, 0.06);
      glowGfx.fillCircle(panelCenterX, glyphCenterY, 180);
      this.illustrationContainer.add(glowGfx);

      // Inner glow ring
      const glowRing = this.add.circle(panelCenterX, glyphCenterY, 160, this.accentColor, 0.03)
        .setStrokeStyle(1, this.accentColor, 0.15);
      this.illustrationContainer.add(glowRing);

      // Breathing animation on glow
      this.tweens.add({
        targets: glowRing,
        scaleX: 1.08,
        scaleY: 1.08,
        alpha: 0.06,
        duration: 3000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // Element glyph symbol
      const glyphSymbol = this.getEventGlyph();
      const glyph = this.add.text(panelCenterX, glyphCenterY, glyphSymbol, {
        fontFamily: 'dungeon-mode-inverted',
        fontSize: '140px',
        color: this.accentHex,
        align: 'center'
      }).setOrigin(0.5).setAlpha(0.12);
      this.illustrationContainer.add(glyph);

      // Subtle rotation on glyph
      this.tweens.add({
        targets: glyph,
        rotation: 0.05,
        duration: 6000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }

    // Day/Night badge
    const badgeY = 80;
    const isDay = this.isDayCycle;
    const badgeIcon = isDay ? '☀' : '☾';
    const badgeLabel = isDay ? 'DAY' : 'NIGHT';
    const badgeBg = this.add.rectangle(panelCenterX, badgeY, 120, 36, 0x000000, 0.5)
      .setStrokeStyle(1, this.accentColor, 0.5);
    const badgeText = this.add.text(panelCenterX, badgeY, `${badgeIcon} ${badgeLabel}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: this.accentHex,
      align: 'center'
    }).setOrigin(0.5);
    this.illustrationContainer.add([badgeBg, badgeText]);

    // Event name — large dramatic title
    const titleY = this.H - 200;
    const title = this.add.text(panelCenterX, titleY, this.currentEvent.name.toUpperCase(), {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '38px',
      color: '#e8eced',
      align: 'center',
      wordWrap: { width: panelW - 60 },
      lineSpacing: 6
    }).setOrigin(0.5);
    this.illustrationContainer.add(title);

    // Accent line under title
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(3, this.accentColor, 0.7);
    lineGfx.beginPath();
    lineGfx.moveTo(panelCenterX - 100, titleY + title.height / 2 + 12);
    lineGfx.lineTo(panelCenterX + 100, titleY + title.height / 2 + 12);
    lineGfx.strokePath();
    this.illustrationContainer.add(lineGfx);

    // Subtitle — event type hint
    const subtitleText = this.isEducationalEvent(this.currentEvent)
      ? 'WISDOM EVENT'
      : 'MYSTERIOUS ENCOUNTER';
    const subtitle = this.add.text(panelCenterX, titleY + title.height / 2 + 32, subtitleText, {
      fontFamily: 'dungeon-mode',
      fontSize: '14px',
      color: this.accentHex,
      align: 'center',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0.7);
    this.illustrationContainer.add(subtitle);

    // Fade-in the illustration panel
    this.tweens.add({
      targets: this.illustrationContainer,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
      delay: 600
    });
  }

  /**
   * Get the Phaser texture key for this event's splash art.
   * Returns null if no matching texture exists.
   */
  private getEventTextureKey(): string | null {
    const id = this.currentEvent.id;
    const key = `event_${id}`;
    return key;
  }

  private getEventGlyph(): string {
    const name = this.currentEvent.name.toLowerCase();
    // Element-themed glyphs based on event keywords
    if (name.includes('wind') || name.includes('omen') || name.includes('storm') || name.includes('sky') || name.includes('eclipse') || name.includes('comet') || name.includes('thunder'))
      return '☁';
    if (name.includes('water') || name.includes('sirena') || name.includes('flood') || name.includes('tidal') || name.includes('whirlpool') || name.includes('spring') || name.includes('sunken') || name.includes('coral'))
      return '◈';
    if (name.includes('fire') || name.includes('apoy') || name.includes('santelmo') || name.includes('volcanic'))
      return '◆';
    if (name.includes('shrine') || name.includes('altar') || name.includes('anito') || name.includes('ancestral') || name.includes('sacred') || name.includes('grove'))
      return '✦';
    if (name.includes('balete') || name.includes('kapre') || name.includes('tikbalang') || name.includes('diwata'))
      return '❖';
    if (name.includes('star') || name.includes('celestial') || name.includes('sarimanok') || name.includes('sibling'))
      return '✧';
    return '◎';
  }

  // ─────────────────────────────────────────────
  //  DIALOGUE PANEL (RIGHT ~62%)
  // ─────────────────────────────────────────────

  private buildDialoguePanel(): void {
    const panelLeft = this.W * 0.40;
    const panelW = this.W * 0.56;
    const panelCenterX = panelLeft + panelW / 2;

    this.dialogueContainer = this.add.container(0, 0).setDepth(10).setAlpha(0);

    // Dynamic dialogue box background (redrawn when text changes)
    this.dialogueBoxGfx = this.add.graphics();
    this.dialogueContainer.add(this.dialogueBoxGfx);

    // Description text — vertically centered in the upper portion
    const textTop = this.H * 0.15;
    this.descriptionText = this.add.text(panelCenterX + 10, textTop, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '24px',
      color: '#e8eced',
      wordWrap: { width: panelW - 120 },
      align: 'left',
      lineSpacing: 12
    }).setOrigin(0.5, 0);
    this.dialogueContainer.add(this.descriptionText);

    // Continue indicator (positioned dynamically after text)
    this.continueIndicator = this.add.text(panelLeft + panelW - 60, textTop + 40, '▼', {
      fontFamily: 'dungeon-mode',
      fontSize: '22px',
      color: this.accentHex
    }).setOrigin(0.5).setVisible(false);
    this.dialogueContainer.add(this.continueIndicator);

    this.tweens.add({
      targets: this.continueIndicator,
      y: '+=8',
      alpha: 0.3,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Choice container (populated later)
    this.choiceContainer = this.add.container(0, 0).setDepth(12);

    // Fade in dialogue panel
    this.tweens.add({
      targets: this.dialogueContainer,
      alpha: 1,
      duration: 700,
      ease: 'Power2',
      delay: 800
    });
  }

  /**
   * Redraw the dialogue box background to wrap snugly around the current text.
   */
  private updateDialogueBox(): void {
    const panelLeft = this.W * 0.40;
    const panelW = this.W * 0.56;

    this.dialogueBoxGfx.clear();

    // Measure actual text height
    const textH = this.descriptionText.height;
    if (textH <= 0) return;

    const padding = 35;
    const boxX = panelLeft + 20;
    const boxY = this.descriptionText.y - padding;
    const boxW = panelW - 40;
    const boxH = textH + padding * 2;

    // Box background
    this.dialogueBoxGfx.fillStyle(0x0a0608, 0.6);
    this.dialogueBoxGfx.fillRoundedRect(boxX, boxY, boxW, boxH, 8);
    // Left accent bar
    this.dialogueBoxGfx.fillStyle(this.accentColor, 0.7);
    this.dialogueBoxGfx.fillRect(boxX, boxY, 5, boxH);

    // Reposition continue indicator just below the box
    this.continueIndicator.setY(boxY + boxH + 20);
  }

  // ─────────────────────────────────────────────
  //  DESCRIPTION FLOW
  // ─────────────────────────────────────────────

  private showNextDescription(): void {
    this.continueIndicator.setVisible(false);

    // Clean up previous click handler
    if (this.pendingClickHandler) {
      this.input.off('pointerdown', this.pendingClickHandler);
      this.pendingClickHandler = undefined;
    }

    if (this.currentDescriptionIndex < this.currentEvent.description.length) {
      // Fade transition between descriptions
      if (this.currentDescriptionIndex > 0) {
        this.tweens.add({
          targets: this.descriptionText,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            this.typeDescription(this.currentEvent.description[this.currentDescriptionIndex]);
          }
        });
      } else {
        this.typeDescription(this.currentEvent.description[this.currentDescriptionIndex]);
      }
    } else {
      this.showChoices();
    }
  }

  /**
   * Cinematic typewriter with punctuation pauses
   */
  private typeDescription(text: string): void {
    this.descriptionText.setText('').setAlpha(1);
    let charIndex = 0;
    this.isTyping = true;

    // Pre-measure: set full text to get final height, draw box, then clear for typewriter
    this.descriptionText.setText(text);
    this.updateDialogueBox();
    this.descriptionText.setText('');

    const baseDelay = 28; // Fast base speed

    const typeNextChar = () => {
      if (charIndex >= text.length) {
        this.isTyping = false;
        this.onDescriptionComplete(text);
        return;
      }

      const char = text[charIndex];
      this.descriptionText.setText(this.descriptionText.text + char);
      charIndex++;

      // Punctuation pauses for cinematic feel
      let delay = baseDelay;
      if (char === '.' || char === '!' || char === '?') delay = 220;
      else if (char === ',') delay = 100;
      else if (char === '—' || char === '–') delay = 150;
      else if (char === ':') delay = 130;

      this.typingTimer = this.time.delayedCall(delay, typeNextChar);
    };

    typeNextChar();

    // Click to skip — complete instantly
    const skipHandler = () => {
      if (this.isTyping) {
        this.isTyping = false;
        if (this.typingTimer) {
          this.typingTimer.remove();
          this.typingTimer = undefined;
        }
        this.descriptionText.setText(text);
        this.updateDialogueBox();
        this.onDescriptionComplete(text);
      }
    };
    this.pendingClickHandler = skipHandler;
    this.input.once('pointerdown', skipHandler);
  }

  private onDescriptionComplete(_text: string): void {
    this.continueIndicator.setVisible(true);

    // Clean old handler first
    if (this.pendingClickHandler) {
      this.input.off('pointerdown', this.pendingClickHandler);
    }

    const advanceHandler = () => {
      this.currentDescriptionIndex++;
      this.showNextDescription();
    };
    this.pendingClickHandler = advanceHandler;
    this.input.once('pointerdown', advanceHandler);
  }

  // ─────────────────────────────────────────────
  //  STYLIZED CHOICE CARDS
  // ─────────────────────────────────────────────

  private showChoices(): void {
    this.continueIndicator.setVisible(false);

    // Clean up click handlers
    if (this.pendingClickHandler) {
      this.input.off('pointerdown', this.pendingClickHandler);
      this.pendingClickHandler = undefined;
    }

    // Fade out description text slightly
    this.tweens.add({
      targets: this.descriptionText,
      alpha: 0.4,
      duration: 300
    });

    const panelLeft = this.W * 0.40;
    const panelW = this.W * 0.56;
    const choices = this.currentEvent.choices;
    const choiceCount = choices.length;

    // Position choices dynamically below the dialogue box
    const textBottom = this.descriptionText.y + this.descriptionText.height + 35;
    const startY = Math.max(textBottom + 50, this.H * 0.55); // at least halfway down
    const cardW = panelW - 80;
    const cardH = choiceCount <= 2 ? 90 : 75;
    const cardGap = 16;

    choices.forEach((choice, index) => {
      const y = startY + index * (cardH + cardGap);
      const cardX = panelLeft + 40;

      const card = this.createChoiceCard(
        cardX, y, cardW, cardH,
        choice.text, index,
        () => this.handleChoice(choice)
      );

      this.choiceContainer.add(card);
      this.choiceButtons.push(card);

      // Staggered slide-in from right
      card.setAlpha(0);
      card.setX(cardX + 100);
      this.tweens.add({
        targets: card,
        x: cardX,
        alpha: 1,
        duration: 400,
        ease: 'Back.easeOut',
        delay: 200 + index * 120
      });
    });
  }

  private createChoiceCard(
    x: number, y: number, w: number, h: number,
    text: string, index: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x120e11, 0.85);
    bg.fillRoundedRect(0, 0, w, h, 6);
    // Left accent stripe
    bg.fillStyle(this.accentColor, 0.8);
    bg.fillRect(0, 0, 5, h);
    card.add(bg);

    // Hover highlight (hidden initially)
    const hoverBg = this.add.rectangle(w / 2, h / 2, w, h, this.accentColor, 0)
      .setOrigin(0.5);
    card.add(hoverBg);

    // Choice number badge
    const badge = this.add.rectangle(30, h / 2, 36, 36, 0x000000, 0.5)
      .setStrokeStyle(1, this.accentColor, 0.6);
    const badgeNum = this.add.text(30, h / 2, `${index + 1}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '18px',
      color: this.accentHex
    }).setOrigin(0.5);
    card.add([badge, badgeNum]);

    // Choice text
    const choiceText = this.add.text(60, h / 2, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '19px',
      color: '#c0c8cc',
      wordWrap: { width: w - 90 },
      align: 'left',
      lineSpacing: 4
    }).setOrigin(0, 0.5);
    card.add(choiceText);

    // Hit zone for interaction
    const hitZone = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    card.add(hitZone);

    // Hover effects
    hitZone.on('pointerover', () => {
      this.tweens.add({
        targets: hoverBg,
        fillAlpha: 0.08,
        duration: 200
      });
      this.tweens.add({
        targets: card,
        x: x + 12,
        duration: 200,
        ease: 'Power2'
      });
      choiceText.setColor('#ffffff');
      badgeNum.setColor('#ffffff');
    });

    hitZone.on('pointerout', () => {
      this.tweens.add({
        targets: hoverBg,
        fillAlpha: 0,
        duration: 200
      });
      this.tweens.add({
        targets: card,
        x: x,
        duration: 200,
        ease: 'Power2'
      });
      choiceText.setColor('#c0c8cc');
      badgeNum.setColor(this.accentHex);
    });

    hitZone.on('pointerdown', () => {
      // Press flash effect
      this.tweens.add({
        targets: hoverBg,
        fillAlpha: 0.2,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          // Disable all choice buttons
          this.choiceButtons.forEach(btn => {
            btn.setAlpha(0.3);
            btn.removeInteractive();
          });
          callback();
        }
      });
    });

    return card;
  }

  // ─────────────────────────────────────────────
  //  HANDLE CHOICE & OUTCOME
  // ─────────────────────────────────────────────

  private handleChoice(choice: EventChoice): void {
    const context: EventContext = {
      player: this.player,
      scene: this
    };

    const resultMessage = choice.outcome(context);

    // Track educational events
    if (this.isEducationalEvent(this.currentEvent)) {
      EducationalEventManager.getInstance().markEventEncountered(this.currentEvent);
    }

    OverworldGameState.getInstance().recordAction();
    GameState.getInstance().updatePlayerData(this.player);

    this.showResult(resultMessage || 'Event completed.');
  }

  // ─────────────────────────────────────────────
  //  OUTCOME SCREEN
  // ─────────────────────────────────────────────

  private showResult(outcome: string): void {
    // Fade out choices
    this.tweens.add({
      targets: this.choiceContainer,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.choiceButtons.forEach(b => b.destroy());
        this.choiceButtons = [];
        this.choiceContainer.removeAll(true);
      }
    });

    // Fade description text back up
    this.tweens.add({
      targets: this.descriptionText,
      alpha: 0,
      duration: 200,
    });

    // Build outcome overlay
    const overlay = this.add.container(this.W / 2, this.H / 2).setDepth(50).setAlpha(0);

    // Dimmed background
    const dimBg = this.add.rectangle(0, 0, this.W, this.H, 0x000000, 0.5);
    overlay.add(dimBg);

    // Result panel
    const panelW = this.W * 0.55;
    const panelH = 320;
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0d090c, 0.95);
    panelGfx.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    panelGfx.lineStyle(2, this.accentColor, 0.6);
    panelGfx.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    // Top accent bar
    panelGfx.fillStyle(this.accentColor, 0.7);
    panelGfx.fillRect(-panelW / 2, -panelH / 2, panelW, 4);
    overlay.add(panelGfx);

    // Outcome header
    const headerColor = '#2ed573';
    const header = this.add.text(0, -panelH / 2 + 35, 'EVENT OUTCOME', {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '22px',
      color: headerColor,
      letterSpacing: 3
    }).setOrigin(0.5);
    overlay.add(header);

    // Decorative line under header
    const headerLine = this.add.graphics();
    headerLine.lineStyle(1, 0x2ed573, 0.4);
    headerLine.beginPath();
    headerLine.moveTo(-80, -panelH / 2 + 55);
    headerLine.lineTo(80, -panelH / 2 + 55);
    headerLine.strokePath();
    overlay.add(headerLine);

    // Result text
    const resultText = this.add.text(0, 10, outcome, {
      fontFamily: 'dungeon-mode',
      fontSize: '20px',
      color: '#e8eced',
      wordWrap: { width: panelW - 80 },
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);
    overlay.add(resultText);

    // Click to continue prompt
    const continuePrompt = this.add.text(0, panelH / 2 - 30, '[ Click to Continue ]', {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: '#77888C'
    }).setOrigin(0.5).setAlpha(0);
    overlay.add(continuePrompt);

    // Animate in
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Show continue prompt after brief delay
        this.time.delayedCall(800, () => {
          this.tweens.add({
            targets: continuePrompt,
            alpha: 1,
            duration: 400
          });

          // Pulsing prompt
          this.tweens.add({
            targets: continuePrompt,
            alpha: 0.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: 400
          });

          this.input.once('pointerdown', () => {
            this.tweens.add({
              targets: overlay,
              alpha: 0,
              duration: 400,
              onComplete: () => {
                overlay.destroy();
                if (this.isEducationalEvent(this.currentEvent)) {
                  this.showEducationalContent();
                } else {
                  this.completeEvent();
                }
              }
            });
          });
        });
      }
    });
  }

  // ─────────────────────────────────────────────
  //  EDUCATIONAL CONTENT OVERLAY
  // ─────────────────────────────────────────────

  private showEducationalContent(): void {
    const educationalEvent = this.currentEvent as EducationalEvent;
    const overlay = this.add.container(this.W / 2, this.H / 2).setDepth(60).setAlpha(0);

    // Dimmed bg
    const dimBg = this.add.rectangle(0, 0, this.W, this.H, 0x000000, 0.6);
    overlay.add(dimBg);

    // Panel
    const panelW = this.W * 0.65;
    const panelH = 500;
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0d090c, 0.95);
    panelGfx.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    panelGfx.lineStyle(2, 0xffa726, 0.6);
    panelGfx.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    // Top accent
    panelGfx.fillStyle(0xffa726, 0.7);
    panelGfx.fillRect(-panelW / 2, -panelH / 2, panelW, 4);
    overlay.add(panelGfx);

    // WISDOM GAINED header
    const header = this.add.text(0, -panelH / 2 + 35, 'WISDOM GAINED', {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '24px',
      color: '#ffb74d',
      letterSpacing: 3
    }).setOrigin(0.5);
    overlay.add(header);

    // Decorative divider
    const divider = this.add.graphics();
    divider.lineStyle(1, 0xffa726, 0.4);
    divider.beginPath();
    divider.moveTo(-100, -panelH / 2 + 58);
    divider.lineTo(100, -panelH / 2 + 58);
    divider.strokePath();
    overlay.add(divider);

    const textOpts = {
      fontFamily: 'dungeon-mode',
      fontSize: '18px',
      color: '#e8eced',
      wordWrap: { width: panelW - 100 },
      align: 'center',
      lineSpacing: 6
    };

    let currentY = -panelH / 2 + 90;

    // Cultural Context section
    const ctxLabel = this.add.text(0, currentY, 'CULTURAL CONTEXT', {
      ...textOpts, fontSize: '15px', color: '#ffcc80', letterSpacing: 2
    }).setOrigin(0.5, 0).setAlpha(0);
    overlay.add(ctxLabel);
    currentY += 28;

    const ctxText = this.add.text(0, currentY, educationalEvent.culturalContext.culturalSignificance, {
      ...textOpts
    }).setOrigin(0.5, 0).setAlpha(0);
    overlay.add(ctxText);
    currentY += ctxText.height + 35;

    // Filipino Value divider
    const midDiv = this.add.graphics();
    midDiv.lineStyle(1, 0xffa726, 0.2);
    midDiv.beginPath();
    midDiv.moveTo(-60, currentY - 15);
    midDiv.lineTo(60, currentY - 15);
    midDiv.strokePath();
    overlay.add(midDiv);

    // Values Lesson section
    const valLabel = this.add.text(0, currentY, 'VALUES LESSON', {
      ...textOpts, fontSize: '15px', color: '#a5d6a7', letterSpacing: 2
    }).setOrigin(0.5, 0).setAlpha(0);
    overlay.add(valLabel);
    currentY += 28;

    const valText = this.add.text(0, currentY, educationalEvent.valuesLesson.culturalWisdom, {
      ...textOpts
    }).setOrigin(0.5, 0).setAlpha(0);
    overlay.add(valText);
    currentY += valText.height + 30;

    // Filipino value badge
    const valueName = educationalEvent.valuesLesson.primaryValue
      .replace(/_/g, ' ')
      .toUpperCase();
    const valueBadge = this.add.rectangle(0, currentY + 10, 200, 32, 0x000000, 0.5)
      .setStrokeStyle(1, 0xa5d6a7, 0.5).setAlpha(0);
    const valueText = this.add.text(0, currentY + 10, valueName, {
      fontFamily: 'dungeon-mode',
      fontSize: '14px',
      color: '#a5d6a7',
      letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0);
    overlay.add([valueBadge, valueText]);

    // Academic reference
    const ref = educationalEvent.academicReferences[0];
    const refStr = `Source: ${ref.author}, "${ref.title}" (${ref.publicationYear})`;
    const refText = this.add.text(0, panelH / 2 - 55, refStr, {
      fontFamily: 'dungeon-mode',
      fontSize: '13px',
      color: '#90a4ae',
      wordWrap: { width: panelW - 80 },
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    overlay.add(refText);

    // Continue prompt
    const continuePrompt = this.add.text(0, panelH / 2 - 25, '[ Click to Continue ]', {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0);
    overlay.add(continuePrompt);

    // Staggered reveal animation
    this.tweens.add({ targets: overlay, alpha: 1, duration: 500, ease: 'Power2' });

    const staggerElements = [ctxLabel, ctxText, valLabel, valText, valueBadge, valueText, refText, continuePrompt];
    staggerElements.forEach((el, i) => {
      this.tweens.add({
        targets: el,
        alpha: 1,
        y: (el as any).y,
        duration: 400,
        ease: 'Power2',
        delay: 300 + i * 150
      });
    });

    // Click to continue
    this.time.delayedCall(300 + staggerElements.length * 150 + 200, () => {
      this.tweens.add({
        targets: continuePrompt,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1
      });

      this.input.once('pointerdown', () => {
        this.tweens.add({
          targets: overlay,
          alpha: 0,
          duration: 400,
          onComplete: () => {
            overlay.destroy();
            this.completeEvent();
          }
        });
      });
    });
  }

  // ─────────────────────────────────────────────
  //  COMPLETE & EXIT
  // ─────────────────────────────────────────────

  private completeEvent(): void {
    this.time.delayedCall(600, () => {
      // Check if from debug
      if (this.currentEvent && (this.currentEvent as any)._debugSource) {
        this.scene.stop('EventScene');
        this.scene.wake('EducationalEventsDebugScene');
        const debugScene = this.scene.get('EducationalEventsDebugScene') as any;
        if (debugScene?.toggleVisibility) {
          debugScene.toggleVisibility();
        }
        return;
      }

      // Normal gameplay flow
      GameState.getInstance().completeCurrentNode(true);

      this.playExitTransition(() => {
        const overworldScene = this.scene.get('Overworld');
        if (overworldScene) {
          (overworldScene as any).resume();
        }
        this.scene.stop('EventScene');
        this.scene.resume('Overworld');
      });
    });
  }

  /**
   * Exit transition — diagonal bars sweep across
   */
  private playExitTransition(onComplete: () => void): void {
    const overlay = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x050305)
      .setOrigin(0.5).setAlpha(0).setDepth(9000);

    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 300,
      ease: 'Sine.easeIn'
    });

    const barCount = 5;
    const barH = (this.H / barCount) + 4;
    for (let i = 0; i < barCount; i++) {
      const fromTop = i < barCount / 2;
      const targetY = barH * i + barH / 2;
      const bar = this.add.rectangle(
        this.W / 2, fromTop ? -barH : this.H + barH, this.W, barH,
        Phaser.Math.RND.pick([0x0a0608, 0x0d080b, 0x050305])
      ).setOrigin(0.5).setAlpha(0.9).setDepth(9001);

      const distFromEdge = fromTop ? i : (barCount - 1 - i);
      this.tweens.add({
        targets: bar,
        y: targetY,
        duration: 400,
        ease: 'Sine.easeInOut',
        delay: distFromEdge * 50
      });
    }

    this.time.delayedCall(550, () => {
      const black = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000)
        .setOrigin(0.5).setAlpha(0).setDepth(9002);
      this.tweens.add({
        targets: black,
        alpha: 1,
        duration: 250,
        ease: 'Sine.easeInOut',
        onComplete
      });
    });
  }

  // ─────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────

  private isEducationalEvent(event: GameEvent | EducationalEvent): event is EducationalEvent {
    return 'culturalContext' in event && 'academicReferences' in event && 'valuesLesson' in event;
  }

  shutdown(): void {
    // Music cleanup handled by MusicLifecycleSystem
    if (this.pendingClickHandler) {
      this.input.off('pointerdown', this.pendingClickHandler);
      this.pendingClickHandler = undefined;
    }
  }
}

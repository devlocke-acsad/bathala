import { Scene, GameObjects } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";
import { MusicLifecycleSystem } from "../../systems/audio/MusicLifecycleSystem";
import { createButton } from "../ui/Button";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  menuButtons: GameObjects.Container[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;
  private musicLifecycle!: MusicLifecycleSystem;

  constructor() {
    super("MainMenu");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Start main menu music via MusicLifecycleSystem
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    this.createUI();
    
    // F2 / backtick — open Dev Hub (no loading indicator for keyboard path)
    const openDevHub = () => this.launchDevHub();
    this.input.keyboard?.on('keydown-F2',       openDevHub);
    this.input.keyboard?.on('keydown-BACKTICK', openDevHub);
  }

  private _devLoading = false;
  private _devLoadingTimer?: Phaser.Time.TimerEvent;

  private launchDevHub(
    bg?: Phaser.GameObjects.Rectangle,
    txt?: Phaser.GameObjects.Text
  ): void {
    if (this.scene.isActive('DevHubScene')) {
      const s = this.scene.get('DevHubScene') as any;
      if (s?.show) s.show();
      return;
    }

    if (bg && txt && !this._devLoading) {
      this._devLoading = true;
      bg.setStrokeStyle(1, 0x77888c);
      bg.setAlpha(0.9);
      let dots = 0;
      this._devLoadingTimer = this.time.addEvent({
        delay: 300,
        loop: true,
        callback: () => {
          dots = (dots + 1) % 4;
          txt.setText('[DEV' + '.'.repeat(dots) + ']');
        }
      });
    }

    this.scene.launch('DevHubScene');
    this.scene.get('DevHubScene').events.once('create', () => {
      this._devLoadingTimer?.remove(false);
      this._devLoadingTimer = undefined;
      this._devLoading = false;
      if (txt) { txt.setText('[DEV]'); txt.setColor('#ffd93d'); }
      if (bg)  { bg.setStrokeStyle(1, 0xffd93d); bg.setAlpha(0.7); }

      const s = this.scene.get('DevHubScene') as any;
      if (s?.show) s.show();
    });
  }

  /**
   * Blasphemous-inspired cinematic background
   */
  private createBackgroundEffects(): void {
    if (!this.cameras?.main) return;

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // Full-bleed hero artwork
    const bgImage = this.add.image(W / 2, H / 2, 'hero_bg');
    bgImage.setScale(Math.max(W / bgImage.width, H / bgImage.height)).setDepth(-100);

    // Dark overlay — keep artwork visible but moody (~50% like original)
    this.add.rectangle(W / 2, H / 2, W, H, 0x150E10, 0.52).setDepth(-90);

    // Radial vignette — edges darker
    const grad = this.add.graphics().setDepth(-88);
    for (let i = 0; i < 14; i++) {
      const r = Math.max(W, H) * (1.1 - i * 0.045);
      grad.fillStyle(0x080408, 0.06);
      grad.fillCircle(W / 2, H / 2, r);
    }


    // ── Blasphemous-style particles ─────────────────────────────────────────
    // Layer 1: large slow golden embers rising from the bottom
    this.add.particles(0, 0, '__WHITE', {
      x: { min: 0, max: W },
      y: { min: H * 0.6, max: H + 20 },
      lifespan: { min: 7000, max: 12000 },
      speedX: { min: -12, max: 12 },
      speedY: { min: -30, max: -10 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 0.45, end: 0 },
      blendMode: 'ADD',
      frequency: 320,
      tint: [ 0xc8882a, 0xe8a040, 0xb06818, 0xd4942e ],
      maxParticles: 40,
      rotate: { min: 0, max: 360 },
    }).setDepth(-70);

    // Layer 2: tiny fast sparks that drift and die quickly
    this.add.particles(0, 0, '__WHITE', {
      x: { min: W * 0.05, max: W * 0.95 },
      y: { min: H * 0.4, max: H },
      lifespan: { min: 2500, max: 5000 },
      speedX: { min: -20, max: 20 },
      speedY: { min: -55, max: -15 },
      scale: { start: 0.35, end: 0 },
      alpha: { start: 0.55, end: 0 },
      blendMode: 'ADD',
      frequency: 180,
      tint: [ 0xffd080, 0xffb840, 0xffe0a0 ],
      maxParticles: 60,
    }).setDepth(-69);

    // Layer 3: very slow large translucent motes — the haze / soul wisps
    this.add.particles(0, 0, '__WHITE', {
      x: { min: W * 0.15, max: W * 0.85 },
      y: { min: H * 0.3, max: H * 0.85 },
      lifespan: { min: 14000, max: 20000 },
      speedX: { min: -6, max: 6 },
      speedY: { min: -12, max: -3 },
      scale: { start: 3.5, end: 0 },
      alpha: { start: 0.06, end: 0 },
      blendMode: 'ADD',
      frequency: 600,
      tint: 0xa07840,
      maxParticles: 18,
    }).setDepth(-72);

    // Subtle scanlines
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x000000, 1); g.fillRect(0, 0, 2, 1);
    g.fillStyle(0x000000, 0); g.fillRect(0, 1, 2, 1);
    g.generateTexture('menu_scanline', 2, 2); g.destroy();
    this.add.tileSprite(0, 0, W, H, 'menu_scanline').setOrigin(0).setAlpha(0.06).setDepth(-68);
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    this.menuButtons = [];

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const centerY = screenHeight / 2;

    // Version — top-right
    this.versionText = this.add
      .text(screenWidth - 40, 40, "0.5.0", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "right",
      })
      .setOrigin(1, 0)
      .setAlpha(0);
    this.tweens.add({ targets: this.versionText, alpha: 1, duration: 600, delay: 200, ease: 'Power2' });

    // Footer — bottom-centre
    this.footerText = this.add
      .text(screenWidth / 2, screenHeight - 40, "Bathala. Developed by Devlocke. Copyright 2025.", {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setAlpha(0);
    this.tweens.add({ targets: this.footerText, alpha: 1, duration: 600, delay: 200, ease: 'Power2' });

    // Title — above centre
    this.createBathalaText(screenWidth / 2, centerY - 150);

    // Menu buttons — below centre
    const menuOptions = ["Play", "Discover", "Credits", "Settings"];
    const startY = centerY + 30;
    const spacing = 70;
    const fixedWidth = 220;

    menuOptions.forEach((option, i) => {
      const targetY = startY + i * spacing;

      const btn = createButton(
        this,
        screenWidth / 2,
        targetY + 20,
        option,
        () => {
          switch (option) {
            case "Play":
              console.log('Starting new game - resetting all game state...');
              GameState.getInstance().reset();
              OverworldGameState.getInstance().reset();
              RuleBasedDDA.getInstance().resetSession();
              this.scene.start("Prologue");
              break;
            case "Discover":  this.scene.start("Discover");  break;
            case "Credits":   this.scene.start("Credits");   break;
            case "Settings":  this.scene.start("Settings");  break;
          }
        },
        fixedWidth
      );

      btn.setAlpha(0);
      this.tweens.add({
        targets: btn,
        alpha: 1,
        y: targetY,
        duration: 600,
        delay: 500 + i * 150,
        ease: 'Power3.easeOut',
      });

      this.menuButtons.push(btn);
    });

    // [DEV] button — bottom-right
    const BW = 100, BH = 30;
    const devBtn = this.add.container(screenWidth - BW / 2 - 16, screenHeight - BH / 2 - 16);
    devBtn.setDepth(1000);
    const devBg = this.add.rectangle(0, 0, BW, BH, 0x14141f).setStrokeStyle(1, 0xffd93d).setAlpha(0.7);
    const devTxt = this.add.text(0, 0, "[DEV]", { fontFamily: "dungeon-mode", fontSize: 16, color: "#ffd93d" }).setOrigin(0.5);
    devBtn.add([devBg, devTxt]);
    devBtn.setInteractive(new Phaser.Geom.Rectangle(-BW / 2, -BH / 2, BW, BH), Phaser.Geom.Rectangle.Contains);
    devBtn.on("pointerdown", () => this.launchDevHub(devBg, devTxt));
    devBtn.on("pointerover", () => { if (!this._devLoading) { devBg.setAlpha(1); devTxt.setColor("#ffffff"); } });
    devBtn.on("pointerout",  () => { if (!this._devLoading) { devBg.setAlpha(0.7); devTxt.setColor("#ffd93d"); } });
  }

  /**
   * Create the "bathala" title text
   */
  private createBathalaText(x: number, y: number): void {
    const titleText = this.add
      .text(x, y, "bathala", {
        fontFamily: "Pixeled English Font",
        fontSize: 250,
        color: "#77888C",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(y - 20);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      y,
      duration: 800,
      ease: 'Power3.easeOut',
    });

    this.tweens.add({
      targets: titleText,
      alpha: 0.85,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 800,
    });

    this.time.delayedCall(50, () => titleText.setText("bathala"));
  }

  /**
   * Shutdown cleanup
   * Music cleanup is handled automatically by MusicLifecycleSystem
   */
  shutdown(): void {
    // No resize listener cleanup needed — Scale.FIT handles zoom uniformly
  }

  /**
   * Update method for animation effects
   */
  update(_time: number, _delta: number): void {
    // No animations to update
  }
}

import { Scene } from 'phaser';
import { bootstrapEnemies } from '../../../data/enemies/EnemyBootstrap';
import { EnemyRegistry } from '../../../core/registries/EnemyRegistry';

/**
 * NodeShowcaseScene
 * A full-screen visual gallery of every overworld node type,
 * grouped by category and browseable by chapter for enemies.
 *
 * Access from DevHubScene → Nodes tab.
 * Press F5 or ESC to close.
 */

const BG = 0x0a0a12;
const PANEL = 0x10101c;
const BORDER = 0x252535;
const ACCENT = 0xffd93d;
const MUTED  = 0x55556a;

interface ShowcaseEntry {
  name: string;
  sprite: string;
  anim?: string;
  color: string;
  desc: string;
  chapter?: number;
  tier?: 'common' | 'elite' | 'boss';
  enemyKey?: string;
}

export class NodeShowcaseScene extends Scene {
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;
  private activeSection: 'friendly' | 'enemies' = 'friendly';
  private activeChapter = 1;
  private enemyChapterContainer!: Phaser.GameObjects.Container;

  private readonly W = 1920;
  private readonly H = 1080;

  constructor() {
    super({ key: 'NodeShowcaseScene' });
  }

  create(): void {
    bootstrapEnemies();
    this.buildUI();
    this.setupKeys();
    this.container.setVisible(false);
    this.isVisible = false;
  }

  public show(): void {
    if (!this.container) return;
    this.isVisible = true;
    this.container.setVisible(true);
  }

  public hide(): void {
    if (!this.container) return;
    this.isVisible = false;
    this.container.setVisible(false);
    this.scene.stop();
  }

  private buildUI(): void {
    const W = this.W, H = this.H;
    this.container = this.add.container(0, 0).setDepth(60000);

    // Full-screen background
    this.container.add(this.add.rectangle(W / 2, H / 2, W, H, BG));

    // Header
    this.buildHeader();

    // Section toggle
    this.buildSectionToggle();

    // Friendly nodes section (static)
    this.buildFriendlySection();

    // Enemy section (chapter-tabbed)
    this.buildEnemySection();

    this.showSection('friendly');
  }

  private buildHeader(): void {
    const W = this.W;

    const headerBg = this.add.rectangle(W / 2, 36, W, 72, PANEL);
    headerBg.setStrokeStyle(1, BORDER);
    this.container.add(headerBg);

    this.container.add(this.add.text(40, 36, 'NODE SHOWCASE', {
      fontFamily: 'dungeon-mode', fontSize: 26, color: '#ffd93d',
    }).setOrigin(0, 0.5));

    this.container.add(this.add.text(W / 2, 36, 'All overworld node types at a glance', {
      fontFamily: 'dungeon-mode', fontSize: 16, color: '#' + MUTED.toString(16).padStart(6,'0'),
    }).setOrigin(0.5));

    const closeText = this.add.text(W - 40, 36, '[ESC / F5]  close', {
      fontFamily: 'dungeon-mode', fontSize: 16, color: '#' + MUTED.toString(16).padStart(6,'0'),
    }).setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', function(this: Phaser.GameObjects.Text) { this.setColor('#ffffff'); })
      .on('pointerout',  function(this: Phaser.GameObjects.Text) { this.setColor('#' + MUTED.toString(16).padStart(6,'0')); })
      .on('pointerdown', () => this.hide());
    this.container.add(closeText);
  }

  private buildSectionToggle(): void {
    const W = this.W;
    const sections: Array<{ key: 'friendly' | 'enemies'; label: string }> = [
      { key: 'friendly', label: 'FRIENDLY NODES' },
      { key: 'enemies',  label: 'ENEMY NODES'    },
    ];
    const btnW = 240, gap = 12;
    const totalW = sections.length * btnW + (sections.length - 1) * gap;
    let sx = W / 2 - totalW / 2;

    sections.forEach(s => {
      const btn = this.add.container(sx + btnW / 2, 92);
      const bg  = this.add.rectangle(0, 0, btnW, 36, PANEL);
      bg.setStrokeStyle(1, BORDER);
      const txt = this.add.text(0, 0, s.label, { fontFamily: 'dungeon-mode', fontSize: 15, color: '#77888c' }).setOrigin(0.5);
      btn.add([bg, txt]);
      this.container.add(btn);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.showSection(s.key));
      bg.on('pointerover', () => { if (this.activeSection !== s.key) bg.setFillStyle(0x181828); });
      bg.on('pointerout',  () => { if (this.activeSection !== s.key) bg.setFillStyle(PANEL); });

      (btn as any)._bg  = bg;
      (btn as any)._txt = txt;
      (btn as any)._key = s.key;

      sx += btnW + gap;
    });
  }

  private showSection(section: 'friendly' | 'enemies'): void {
    this.activeSection = section;

    // Update toggle buttons
    this.container.list.forEach((obj: any) => {
      if (obj._key !== undefined) {
        const isActive = obj._key === section;
        obj._bg.setFillStyle(isActive ? 0x1a1a2e : PANEL);
        obj._bg.setStrokeStyle(1, isActive ? ACCENT : BORDER);
        obj._txt.setColor(isActive ? '#ffd93d' : '#77888c');
      }
    });

    // Show/hide content containers
    this.container.list.forEach((obj: any) => {
      if (obj._sectionKey !== undefined) {
        obj.setVisible(obj._sectionKey === section);
      }
    });
  }

  // ─── FRIENDLY NODES ─────────────────────────────────────────────────────────

  private buildFriendlySection(): void {
    const cont = this.add.container(0, 118);
    (cont as any)._sectionKey = 'friendly';
    this.container.add(cont);

    const friendlyNodes: ShowcaseEntry[] = [
      {
        name: 'Campfire',
        sprite: 'campfire_overworld',
        anim: 'campfire_burn',
        color: '#ff6b35',
        desc: 'Rest to restore HP.\nUpgrade a card in your deck.',
      },
      {
        name: 'Treasure',
        sprite: 'chest_f0',
        anim: 'chest_open',
        color: '#ffd93d',
        desc: 'Discover a random relic.\nPassive boons for the rest of the run.',
      },
      {
        name: 'Event',
        sprite: 'event_overworld',
        anim: 'event_portal_loop',
        color: '#a855f7',
        desc: 'Educational narrative encounter.\nChoose wisely — outcomes vary.',
      },
      {
        name: 'Shop',
        sprite: 'merchant_overworld',
        color: '#2ed573',
        desc: 'Spend Ginto on cards,\npotions, and relics.',
      },
    ];

    const cardW = 320, cardH = 420, gap = 40;
    const totalW = friendlyNodes.length * cardW + (friendlyNodes.length - 1) * gap;
    const startX = this.W / 2 - totalW / 2;
    const centerY = (this.H - 118) / 2;

    friendlyNodes.forEach((n, i) => {
      const nx = startX + i * (cardW + gap) + cardW / 2;
      const card = this.makeNodeCard(nx, centerY, cardW, cardH, n);
      cont.add(card);
    });
  }

  // ─── ENEMY NODES ────────────────────────────────────────────────────────────

  private buildEnemySection(): void {
    const cont = this.add.container(0, 118);
    (cont as any)._sectionKey = 'enemies';
    this.container.add(cont);

    const W = this.W;

    // Chapter tabs
    const chaps = [
      { ch: 1, label: 'Ch 1 · Forest'    },
      { ch: 2, label: 'Ch 2 · Submerged' },
      { ch: 3, label: 'Ch 3 · Skyward'   },
    ];
    const tabW = 220, tabGap = 12;
    const totalTW = chaps.length * tabW + (chaps.length - 1) * tabGap;
    let tx = W / 2 - totalTW / 2;

    chaps.forEach(c => {
      const btn = this.add.container(tx + tabW / 2, 24);
      const bg  = this.add.rectangle(0, 0, tabW, 34, PANEL);
      bg.setStrokeStyle(1, BORDER);
      const txt = this.add.text(0, 0, c.label, { fontFamily: 'dungeon-mode', fontSize: 14, color: '#77888c' }).setOrigin(0.5);
      btn.add([bg, txt]);
      cont.add(btn);

      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.switchEnemyChapter(c.ch));
      bg.on('pointerover', () => { if (this.activeChapter !== c.ch) bg.setFillStyle(0x181828); });
      bg.on('pointerout',  () => { if (this.activeChapter !== c.ch) bg.setFillStyle(PANEL); });

      (btn as any)._bg  = bg;
      (btn as any)._txt = txt;
      (btn as any)._ch  = c.ch;
      (cont as any)[`_chBtn_${c.ch}`] = btn;

      tx += tabW + tabGap;
    });

    // Dynamic grid container
    this.enemyChapterContainer = this.add.container(0, 60);
    cont.add(this.enemyChapterContainer);
    (cont as any)._chTabCont = cont;

    this.container.list.forEach((obj: any) => {
      if (obj._sectionKey === 'enemies') {
        (obj as any)._enemyRoot = true;
      }
    });

    this.switchEnemyChapter(1);
  }

  private switchEnemyChapter(ch: number): void {
    this.activeChapter = ch;

    // Update chapter tab buttons
    this.container.list.forEach((obj: any) => {
      if (obj._sectionKey === 'enemies') {
        (obj as Phaser.GameObjects.Container).list.forEach((inner: any) => {
          if (inner._ch !== undefined) {
            const isActive = inner._ch === ch;
            inner._bg.setFillStyle(isActive ? 0x1a1a2e : PANEL);
            inner._bg.setStrokeStyle(1, isActive ? ACCENT : BORDER);
            inner._txt.setColor(isActive ? '#ffd93d' : '#77888c');
          }
        });
      }
    });

    this.enemyChapterContainer.removeAll(true);
    this.buildEnemyGrid(ch);
  }

  private buildEnemyGrid(chapter: number): void {
    const enemyData: Record<number, ShowcaseEntry[]> = {
      1: [
        { name: 'Tikbalang Scout',   sprite: 'tikbalang_overworld',  color: '#e8eced', tier: 'common', enemyKey: 'Tikbalang Scout',   desc: 'Common · Forest' },
        { name: 'Balete Wraith',     sprite: 'balete_overworld',     color: '#e8eced', tier: 'common', enemyKey: 'Balete Wraith',     desc: 'Common · Forest' },
        { name: 'Sigbin Charger',    sprite: 'sigbin_overworld',     color: '#e8eced', tier: 'common', enemyKey: 'Sigbin Charger',    desc: 'Common · Forest' },
        { name: 'Duwende Trickster', sprite: 'duwende_overworld',    color: '#e8eced', tier: 'common', enemyKey: 'Duwende Trickster', desc: 'Common · Forest' },
        { name: 'Tiyanak Ambusher',  sprite: 'tiyanak_overworld',    color: '#e8eced', tier: 'common', enemyKey: 'Tiyanak Ambusher',  desc: 'Common · Forest' },
        { name: 'Amomongo',          sprite: 'amomongo_overworld',   color: '#e8eced', tier: 'common', enemyKey: 'Amomongo',          desc: 'Common · Forest' },
        { name: 'Bungisngis',        sprite: 'bungisngis_overworld', color: '#e8eced', tier: 'common', enemyKey: 'Bungisngis',        desc: 'Common · Forest' },
        { name: 'Tawong Lipod',      sprite: 'tawonglipod_overworld',color: '#ffa500', tier: 'elite',  enemyKey: 'Tawong Lipod',      desc: 'Elite · Forest'  },
        { name: 'Mangangaway',       sprite: 'mangangaway_overworld',color: '#ffa500', tier: 'elite',  enemyKey: 'Mangangaway',       desc: 'Elite · Forest'  },
        { name: 'Kapre Shade',       sprite: 'kapre_overworld',      color: '#ff4757', tier: 'boss',   enemyKey: 'Kapre Shade',       desc: 'Boss · Forest'   },
      ],
      2: [
        { name: 'Sirena Illusionist', sprite: 'sirena_overworld',         color: '#e8eced', tier: 'common', enemyKey: 'Sirena Illusionist', desc: 'Common · Submerged' },
        { name: 'Siyokoy Raider',     sprite: 'siyokoy_overworld',        color: '#e8eced', tier: 'common', enemyKey: 'Siyokoy Raider',     desc: 'Common · Submerged' },
        { name: 'Santelmo Flicker',   sprite: 'santelmo_overworld',       color: '#e8eced', tier: 'common', enemyKey: 'Santelmo Flicker',   desc: 'Common · Submerged' },
        { name: 'Berberoka Lurker',   sprite: 'berberoka_overworld',      color: '#e8eced', tier: 'common', enemyKey: 'Berberoka Lurker',   desc: 'Common · Submerged' },
        { name: 'Magindara Swarm',    sprite: 'magindara_overworld',      color: '#e8eced', tier: 'common', enemyKey: 'Magindara Swarm',    desc: 'Common · Submerged' },
        { name: 'Kataw',              sprite: 'kataw_overworld',          color: '#e8eced', tier: 'common', enemyKey: 'Kataw',              desc: 'Common · Submerged' },
        { name: 'Berbalang',          sprite: 'berbalang_overworld',      color: '#e8eced', tier: 'common', enemyKey: 'Berbalang',          desc: 'Common · Submerged' },
        { name: 'Sunken Bangkilan',   sprite: 'sunkenbangkilan_overworld',color: '#ffa500', tier: 'elite',  enemyKey: 'Sunken Bangkilan',   desc: 'Elite · Submerged'  },
        { name: 'Apoy-Tubig Fury',    sprite: 'apoytubig_overworld',      color: '#ffa500', tier: 'elite',  enemyKey: 'Apoy-Tubig Fury',    desc: 'Elite · Submerged'  },
        { name: 'Bakunawa',           sprite: 'bakunawa_overworld',       color: '#ff4757', tier: 'boss',   enemyKey: 'Bakunawa',           desc: 'Boss · Submerged'   },
      ],
      3: [
        { name: 'Tigmamanukan Watcher', sprite: 'tigmamanukan_overworld', color: '#e8eced', tier: 'common', enemyKey: 'Tigmamanukan Watcher', desc: 'Common · Skyward' },
        { name: 'Diwata Sentinel',      sprite: 'diwata_overworld',       color: '#e8eced', tier: 'common', enemyKey: 'Diwata Sentinel',      desc: 'Common · Skyward' },
        { name: 'Sarimanok Keeper',     sprite: 'sarimanok_overworld',    color: '#e8eced', tier: 'common', enemyKey: 'Sarimanok Keeper',     desc: 'Common · Skyward' },
        { name: 'Bulalakaw Flamewings', sprite: 'bulalakaw_overworld',    color: '#e8eced', tier: 'common', enemyKey: 'Bulalakaw Flamewings', desc: 'Common · Skyward' },
        { name: 'Minokawa Harbinger',   sprite: 'minokawa_overworld',     color: '#e8eced', tier: 'common', enemyKey: 'Minokawa Harbinger',   desc: 'Common · Skyward' },
        { name: 'Alan',                 sprite: 'alan_overworld',         color: '#e8eced', tier: 'common', enemyKey: 'Alan',                 desc: 'Common · Skyward' },
        { name: 'Ekek',                 sprite: 'ekek_overworld',         color: '#e8eced', tier: 'common', enemyKey: 'Ekek',                 desc: 'Common · Skyward' },
        { name: 'Ribung Linti Duo',     sprite: 'ribunglinti_overworld',  color: '#ffa500', tier: 'elite',  enemyKey: 'Ribung Linti Duo',     desc: 'Elite · Skyward'  },
        { name: 'Apolaki Godling',      sprite: 'apolaki_overworld',      color: '#ffa500', tier: 'elite',  enemyKey: 'Apolaki Godling',      desc: 'Elite · Skyward'  },
        { name: 'False Bathala',        sprite: 'falsebathala_overworld', color: '#ff4757', tier: 'boss',   enemyKey: 'False Bathala',        desc: 'Boss · Skyward'   },
      ],
    };

    const entries = enemyData[chapter] ?? [];
    const cols = 5;
    const cardW = 260, cardH = 300, gapX = 20, gapY = 20;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = this.W / 2 - totalW / 2;
    const startY = 10;

    entries.forEach((e, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const nx = startX + col * (cardW + gapX) + cardW / 2;
      const ny = startY + row * (cardH + gapY) + cardH / 2;

      const card = this.makeNodeCard(nx, ny, cardW, cardH, e, true);
      this.enemyChapterContainer.add(card);
    });
  }

  // ─── Card builder ────────────────────────────────────────────────────────────

  private makeNodeCard(
    x: number, y: number, w: number, h: number,
    entry: ShowcaseEntry,
    compact = false
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    const tierBorderColor: Record<string, number> = {
      common: BORDER,
      elite:  0x8a4700,
      boss:   0x8a1500,
    };
    const borderColor = entry.tier ? tierBorderColor[entry.tier] : BORDER;

    const bg = this.add.rectangle(0, 0, w, h, PANEL);
    bg.setStrokeStyle(1, borderColor);
    card.add(bg);

    // Sprite preview area
    const spriteAreaH = compact ? h * 0.45 : h * 0.5;
    const spriteY = -h / 2 + spriteAreaH / 2 + 8;

    if (this.textures.exists(entry.sprite)) {
      const sprite = this.add.sprite(0, spriteY, entry.sprite);
      const targetSize = compact ? 60 : 90;
      const scale = targetSize / Math.max(sprite.width, sprite.height);
      sprite.setScale(scale);
      card.add(sprite);
      if (entry.anim && this.anims.exists(entry.anim)) {
        sprite.play(entry.anim);
      }
    } else {
      const ph = this.add.text(0, spriteY, '?', { fontFamily: 'dungeon-mode', fontSize: compact ? 28 : 40, color: '#333344' }).setOrigin(0.5);
      card.add(ph);
    }

    // Name
    const nameY = -h / 2 + spriteAreaH + 18;
    card.add(this.add.text(0, nameY, entry.name, {
      fontFamily: 'dungeon-mode', fontSize: compact ? 13 : 16, color: entry.color, align: 'center',
      wordWrap: { width: w - 16 },
    }).setOrigin(0.5, 0));

    // Tier badge
    if (entry.tier && !compact) {
      const tierLabel: Record<string, string> = { common: 'COMMON', elite: 'ELITE', boss: 'BOSS' };
      const tierColor: Record<string, string> = { common: '#555566', elite: '#8a5500', boss: '#8a1500' };
      card.add(this.add.text(0, nameY + 26, tierLabel[entry.tier], {
        fontFamily: 'dungeon-mode', fontSize: 11, color: tierColor[entry.tier],
      }).setOrigin(0.5, 0));
    }

    // Stats from registry
    if (entry.enemyKey) {
      const data = EnemyRegistry.resolve(entry.enemyKey) as any;
      if (data) {
        const statsY = compact ? h / 2 - 42 : h / 2 - 72;
        const statsText = compact
          ? `HP ${data.maxHealth}  DMG ${data.damage}`
          : `HP: ${data.maxHealth}   DMG: ${data.damage}\nWeak: ${data.elementalAffinity?.weakness || '—'}\nResists: ${data.elementalAffinity?.resistance || '—'}`;
        card.add(this.add.text(0, statsY, statsText, {
          fontFamily: 'dungeon-mode', fontSize: 12, color: '#77888c', align: 'center',
        }).setOrigin(0.5, 0));
      }
    } else if (entry.desc) {
      const descY = compact ? h / 2 - 30 : h / 2 - 54;
      card.add(this.add.text(0, descY, entry.desc, {
        fontFamily: 'dungeon-mode', fontSize: compact ? 11 : 13, color: '#77888c', align: 'center',
        wordWrap: { width: w - 20 },
      }).setOrigin(0.5, 0));
    }

    // Hover glow
    bg.setInteractive({ useHandCursor: false });
    bg.on('pointerover', () => {
      const hoverColor = Phaser.Display.Color.HexStringToColor(entry.color).color;
      bg.setStrokeStyle(1, hoverColor);
    });
    bg.on('pointerout', () => {
      bg.setStrokeStyle(1, borderColor);
    });

    return card;
  }

  private setupKeys(): void {
    this.input.keyboard?.on('keydown-ESC', () => { if (this.isVisible) this.hide(); });
    this.input.keyboard?.on('keydown-F5',  () => { if (this.isVisible) this.hide(); });
  }

  update(): void {}
}

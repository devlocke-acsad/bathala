import { Scene } from 'phaser';
import { GameState } from '../../../core/managers/GameState';
import { Chapter } from '../../../core/types/CombatTypes';
import { EnemyRegistry } from '../../../core/registries/EnemyRegistry';
import { bootstrapEnemies } from '../../../data/enemies/EnemyBootstrap';
import { OverworldGameState } from '../../../core/managers/OverworldGameState';
import { RuleBasedDDA } from '../../../core/dda/RuleBasedDDA';
import { EducationalEvent } from '../../../data/events/EventTypes';
import { Act1EducationalEvents } from '../../../data/events/Act1EducationalEvents';
import { Act2EducationalEvents } from '../../../data/events/Act2EducationalEvents';
import { Act3EducationalEvents } from '../../../data/events/Act3EducationalEvents';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:        0x0d0d14,
  panel:     0x14141f,
  border:    0x2a2a3d,
  accent:    0xffd93d,
  green:     0x2ed573,
  red:       0xff4757,
  orange:    0xff6b35,
  blue:      0x5cabf2,
  purple:    0xa855f7,
  muted:     0x77888c,
  white:     0xe8eced,
  tabActive: 0x1e1e2e,
  tabHover:  0x181828,
  rowHover:  0x1a1a2a,
};

type Tab = 'combat' | 'nodes' | 'chapters' | 'events';

interface EnemyEntry { name: string; key: string; tier: 'common' | 'elite' | 'boss'; }

/**
 * DevHubScene
 * A unified, tabbed developer panel available from MainMenu and Overworld.
 * Press F2 or click [DEV] to toggle.
 *
 * Tabs:
 *  1. COMBAT  – select enemy by chapter, start fight immediately
 *  2. NODES   – open NodeShowcaseScene
 *  3. CHAPTERS – chapter skip & game-state tools
 *  4. EVENTS  – browse & launch educational events
 */
export class DevHubScene extends Scene {
  private container!: Phaser.GameObjects.Container;
  private isVisible = false;

  // Tab state
  private activeTab: Tab = 'combat';
  private tabContainers: Record<Tab, Phaser.GameObjects.Container> = {} as any;
  private tabButtons:    Record<Tab, Phaser.GameObjects.Container> = {} as any;

  // Combat tab state
  private activeChapter: Chapter = 1;
  private enemyList: EnemyEntry[] = [];
  private selectedEnemyIndex = 0;
  private combatListContainer!: Phaser.GameObjects.Container;
  private enemyDetailContainer!: Phaser.GameObjects.Container;

  // Events tab state
  private eventsAct = 1;
  private eventsList: EducationalEvent[] = [];
  private selectedEventIndex = 0;
  private eventsListContainer!: Phaser.GameObjects.Container;
  private eventDetailContainer!: Phaser.GameObjects.Container;

  private gameState = GameState.getInstance();

  private readonly W = 1920;
  private readonly H = 1080;

  constructor() {
    super({ key: 'DevHubScene' });
  }

  create(): void {
    bootstrapEnemies();
    this.buildEnemyList(this.gameState.getCurrentChapter());
    this.buildEventList(1);

    this.buildUI();
    this.setupKeys();

    this.container.setVisible(false);
    this.isVisible = false;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  public show(): void {
    if (!this.container) return;
    this.isVisible = true;
    this.container.setVisible(true);
    if (this.activeTab === 'combat')   this.refreshCombatList();
    if (this.activeTab === 'events')   this.refreshEventsList();
    if (this.activeTab === 'chapters') this.refreshChaptersTab();
  }

  public hide(): void {
    if (!this.container) return;
    this.isVisible = false;
    this.container.setVisible(false);
  }

  public toggle(): void {
    this.isVisible ? this.hide() : this.show();
  }

  // ─── Data builders ──────────────────────────────────────────────────────────

  private buildEnemyList(chapter: Chapter): void {
    const lists: Record<Chapter, EnemyEntry[]> = {
      1: [
        { name: 'Tikbalang Scout',    key: 'Tikbalang Scout',    tier: 'common' },
        { name: 'Balete Wraith',      key: 'Balete Wraith',      tier: 'common' },
        { name: 'Sigbin Charger',     key: 'Sigbin Charger',     tier: 'common' },
        { name: 'Duwende Trickster',  key: 'Duwende Trickster',  tier: 'common' },
        { name: 'Tiyanak Ambusher',   key: 'Tiyanak Ambusher',   tier: 'common' },
        { name: 'Amomongo',           key: 'Amomongo',           tier: 'common' },
        { name: 'Bungisngis',         key: 'Bungisngis',         tier: 'common' },
        { name: 'Tawong Lipod',       key: 'Tawong Lipod',       tier: 'elite'  },
        { name: 'Mangangaway',        key: 'Mangangaway',        tier: 'elite'  },
        { name: 'Kapre Shade',        key: 'Kapre Shade',        tier: 'boss'   },
      ],
      2: [
        { name: 'Sirena Illusionist', key: 'Sirena Illusionist', tier: 'common' },
        { name: 'Siyokoy Raider',     key: 'Siyokoy Raider',     tier: 'common' },
        { name: 'Santelmo Flicker',   key: 'Santelmo Flicker',   tier: 'common' },
        { name: 'Berberoka Lurker',   key: 'Berberoka Lurker',   tier: 'common' },
        { name: 'Magindara Swarm',    key: 'Magindara Swarm',    tier: 'common' },
        { name: 'Kataw',              key: 'Kataw',              tier: 'common' },
        { name: 'Berbalang',          key: 'Berbalang',          tier: 'common' },
        { name: 'Sunken Bangkilan',   key: 'Sunken Bangkilan',   tier: 'elite'  },
        { name: 'Apoy-Tubig Fury',    key: 'Apoy-Tubig Fury',    tier: 'elite'  },
        { name: 'Bakunawa',           key: 'Bakunawa',           tier: 'boss'   },
      ],
      3: [
        { name: 'Tigmamanukan Watcher', key: 'Tigmamanukan Watcher', tier: 'common' },
        { name: 'Diwata Sentinel',      key: 'Diwata Sentinel',      tier: 'common' },
        { name: 'Sarimanok Keeper',     key: 'Sarimanok Keeper',     tier: 'common' },
        { name: 'Bulalakaw Flamewings', key: 'Bulalakaw Flamewings', tier: 'common' },
        { name: 'Minokawa Harbinger',   key: 'Minokawa Harbinger',   tier: 'common' },
        { name: 'Alan',                 key: 'Alan',                 tier: 'common' },
        { name: 'Ekek',                 key: 'Ekek',                 tier: 'common' },
        { name: 'Ribung Linti Duo',     key: 'Ribung Linti Duo',     tier: 'elite'  },
        { name: 'Apolaki Godling',      key: 'Apolaki Godling',      tier: 'elite'  },
        { name: 'False Bathala',        key: 'False Bathala',        tier: 'boss'   },
      ],
    };
    this.activeChapter = chapter;
    this.enemyList = lists[chapter] ?? lists[1];
    this.selectedEnemyIndex = 0;
  }

  private buildEventList(act: number): void {
    this.eventsAct = act;
    switch (act) {
      case 1: this.eventsList = Act1EducationalEvents; break;
      case 2: this.eventsList = Act2EducationalEvents; break;
      case 3: this.eventsList = Act3EducationalEvents; break;
      default: this.eventsList = [];
    }
    this.selectedEventIndex = 0;
  }

  // ─── UI Construction ────────────────────────────────────────────────────────

  private buildUI(): void {
    const W = this.W, H = this.H;

    this.container = this.add.container(0, 0).setDepth(50000);

    // Full-screen dim
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.82);
    this.container.add(dim);

    // Main panel (centered, 1600×900)
    const pw = 1600, ph = 860;
    const px = (W - pw) / 2, py = (H - ph) / 2;

    const panelBg = this.add.rectangle(W / 2, H / 2, pw, ph, C.panel);
    panelBg.setStrokeStyle(1, C.border);
    this.container.add(panelBg);

    // Header bar
    this.buildHeader(px, py, pw);

    // Tabs
    this.buildTabBar(px, py + 60, pw);

    // Tab content area
    const contentX = px + 20;
    const contentY = py + 120;
    const contentW = pw - 40;
    const contentH = ph - 160;

    this.buildCombatTab(contentX, contentY, contentW, contentH);
    this.buildNodesTab(contentX, contentY, contentW, contentH);
    this.buildChaptersTab(contentX, contentY, contentW, contentH);
    this.buildEventsTab(contentX, contentY, contentW, contentH);

    this.switchTab('combat');
  }

  private buildHeader(px: number, py: number, pw: number): void {
    // Title
    const title = this.add.text(px + 20, py + 18, 'DEV HUB', {
      fontFamily: 'dungeon-mode', fontSize: 28, color: '#ffd93d',
    }).setOrigin(0, 0.5);
    this.container.add(title);

    // Version badge
    const ver = this.add.text(px + pw - 20, py + 18, 'v0.5.0 — internal build', {
      fontFamily: 'dungeon-mode', fontSize: 14, color: '#' + C.muted.toString(16).padStart(6, '0'),
    }).setOrigin(1, 0.5);
    this.container.add(ver);

    // Close button
    const closeBtn = this.makeTextButton(px + pw - 20, py + 18 + 28, '[ESC / F2]', '#77888c', '#ffffff', () => this.hide());
    this.container.add(closeBtn);

    // Divider
    const div = this.add.rectangle(px + pw / 2, py + 54, pw, 1, C.border);
    this.container.add(div);
  }

  private buildTabBar(px: number, py: number, pw: number): void {
    const tabs: Array<{ key: Tab; label: string; color: string }> = [
      { key: 'combat',   label: '⚔  COMBAT',   color: '#ff6b35' },
      { key: 'nodes',    label: '⬡  NODE GALLERY', color: '#5cabf2' },
      { key: 'chapters', label: '↑  CHAPTER SKIP', color: '#2ed573' },
      { key: 'events',   label: '✦  EVENTS',    color: '#a855f7' },
    ];

    const tabW = Math.floor(pw / tabs.length);

    tabs.forEach((t, i) => {
      const tx = px + i * tabW;
      const tabCont = this.add.container(tx, py);
      this.container.add(tabCont);

      const bg = this.add.rectangle(tabW / 2, 28, tabW - 2, 54, C.tabActive);
      const label = this.add.text(tabW / 2, 28, t.label, {
        fontFamily: 'dungeon-mode', fontSize: 16, color: '#77888c', align: 'center',
      }).setOrigin(0.5);
      const indicator = this.add.rectangle(tabW / 2, 54, tabW - 2, 2, C.accent, 0);

      tabCont.add([bg, label, indicator]);
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => {
        if (this.activeTab !== t.key) { bg.setFillStyle(C.tabHover); label.setColor('#c0c0c0'); }
      });
      bg.on('pointerout', () => {
        if (this.activeTab !== t.key) { bg.setFillStyle(C.tabActive); label.setColor('#77888c'); }
      });
      bg.on('pointerdown', () => this.switchTab(t.key));

      this.tabButtons[t.key] = tabCont;
      // Store references for activation styling
      (tabCont as any)._label    = label;
      (tabCont as any)._bg       = bg;
      (tabCont as any)._indicator = indicator;
      (tabCont as any)._color    = t.color;
    });
  }

  private switchTab(tab: Tab): void {
    this.activeTab = tab;
    // Update tab button visuals
    (Object.keys(this.tabButtons) as Tab[]).forEach(k => {
      const tc = this.tabButtons[k];
      const isActive = k === tab;
      (tc as any)._bg.setFillStyle(isActive ? 0x1a1a2e : C.tabActive);
      (tc as any)._label.setColor(isActive ? (tc as any)._color : '#77888c');
      (tc as any)._indicator.setAlpha(isActive ? 1 : 0);
    });
    // Show/hide tab content containers
    (Object.keys(this.tabContainers) as Tab[]).forEach(k => {
      if (this.tabContainers[k]) this.tabContainers[k].setVisible(k === tab);
    });

    if (tab === 'combat')   this.refreshCombatList();
    if (tab === 'events')   this.refreshEventsList();
    if (tab === 'chapters') this.refreshChaptersTab();
  }

  // ─── COMBAT TAB ─────────────────────────────────────────────────────────────

  private buildCombatTab(cx: number, cy: number, cw: number, ch: number): void {
    const cont = this.add.container(cx, cy);
    this.container.add(cont);
    this.tabContainers['combat'] = cont;

    // Chapter buttons (top)
    const chapters: Array<{ ch: Chapter; name: string }> = [
      { ch: 1, name: 'Ch 1 · Forest'    },
      { ch: 2, name: 'Ch 2 · Submerged' },
      { ch: 3, name: 'Ch 3 · Skyward'   },
    ];
    const btnW = 240, btnH = 40, gap = 20;
    const totalW = chapters.length * btnW + (chapters.length - 1) * gap;
    let bx = (cw - totalW) / 2;

    chapters.forEach(c => {
      const btn = this.makeChapterButton(bx + btnW / 2, 24, btnW, btnH, c.name, c.ch);
      cont.add(btn);
      bx += btnW + gap;
    });

    // Two-column layout: enemy list left, detail panel right
    const listX = 0;
    const listW = Math.floor(cw * 0.45);
    const detailX = listW + 20;
    const detailW = cw - listW - 20;
    const bodyY = 72;
    const bodyH = ch - 72;

    // List panel bg
    const listBg = this.add.rectangle(listX + listW / 2, bodyY + bodyH / 2, listW, bodyH, C.bg, 0.6);
    listBg.setStrokeStyle(1, C.border);
    cont.add(listBg);

    // Detail panel bg
    const detailBg = this.add.rectangle(detailX + detailW / 2, bodyY + bodyH / 2, detailW, bodyH, C.bg, 0.6);
    detailBg.setStrokeStyle(1, C.border);
    cont.add(detailBg);

    // Section labels
    cont.add(this.add.text(listX + 12, bodyY + 12, 'ENEMIES', {
      fontFamily: 'dungeon-mode', fontSize: 13, color: '#' + C.muted.toString(16).padStart(6,'0'),
    }));
    cont.add(this.add.text(detailX + 12, bodyY + 12, 'STATS', {
      fontFamily: 'dungeon-mode', fontSize: 13, color: '#' + C.muted.toString(16).padStart(6,'0'),
    }));

    // Dynamic containers
    this.combatListContainer = this.add.container(listX + 8, bodyY + 36);
    cont.add(this.combatListContainer);

    this.enemyDetailContainer = this.add.container(detailX + 12, bodyY + 36);
    cont.add(this.enemyDetailContainer);

    // Store layout refs for refresh
    (cont as any)._cw        = cw;
    (cont as any)._listX     = listX;
    (cont as any)._listW     = listW;
    (cont as any)._detailX   = detailX;
    (cont as any)._detailW   = detailW;
    (cont as any)._bodyY     = bodyY;
    (cont as any)._bodyH     = bodyH;
  }

  private makeChapterButton(x: number, y: number, w: number, h: number, label: string, chapter: Chapter): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const isActive = this.activeChapter === chapter;
    const bg = this.add.rectangle(0, 0, w, h, isActive ? 0x1e3a2e : C.bg, 1);
    bg.setStrokeStyle(1, isActive ? C.green : C.border);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'dungeon-mode', fontSize: 15,
      color: isActive ? '#2ed573' : '#77888c',
    }).setOrigin(0.5);
    c.add([bg, txt]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { if (this.activeChapter !== chapter) { bg.setStrokeStyle(1, 0x445544); txt.setColor('#aaaaaa'); } });
    bg.on('pointerout',  () => { if (this.activeChapter !== chapter) { bg.setStrokeStyle(1, C.border); txt.setColor('#77888c'); } });
    bg.on('pointerdown', () => { this.buildEnemyList(chapter); this.refreshCombatTab(); });
    (c as any)._chapter = chapter;
    return c;
  }

  private refreshCombatTab(): void {
    const cont = this.tabContainers['combat'];
    if (!cont) return;
    // Rebuild chapter buttons
    const toRemove: Phaser.GameObjects.GameObject[] = [];
    cont.list.forEach(obj => {
      if ((obj as any)._chapter !== undefined) toRemove.push(obj);
    });
    toRemove.forEach(obj => { cont.remove(obj, true); });

    const chapters: Array<{ ch: Chapter; name: string }> = [
      { ch: 1, name: 'Ch 1 · Forest'    },
      { ch: 2, name: 'Ch 2 · Submerged' },
      { ch: 3, name: 'Ch 3 · Skyward'   },
    ];
    const cw: number = (cont as any)._cw ?? 1540;
    const btnW = 240, btnH = 40, gap = 20;
    const totalW = chapters.length * btnW + (chapters.length - 1) * gap;
    let bx = (cw - totalW) / 2;
    chapters.forEach(c => {
      const btn = this.makeChapterButton(bx + btnW / 2, 24, btnW, btnH, c.name, c.ch);
      cont.add(btn);
      bx += btnW + gap;
    });

    this.refreshCombatList();
  }

  private refreshCombatList(): void {
    this.combatListContainer.removeAll(true);
    this.enemyDetailContainer.removeAll(true);

    const tierColor: Record<string, string> = { common: '#e8eced', elite: '#ffa500', boss: '#ff4757' };
    const tierBadge: Record<string, string> = { common: '', elite: ' [ELITE]', boss: ' [BOSS]' };

    this.enemyList.forEach((enemy, i) => {
      const isSelected = i === this.selectedEnemyIndex;
      const rowH = 38;
      const y = i * rowH;

      const rowBg = this.add.rectangle(300, y + rowH / 2, 598, rowH - 4, isSelected ? 0x1a2e1a : C.rowHover, isSelected ? 1 : 0);
      rowBg.setStrokeStyle(isSelected ? 1 : 0, C.green);
      const name = this.add.text(16, y + rowH / 2, enemy.name + tierBadge[enemy.tier], {
        fontFamily: 'dungeon-mode', fontSize: 17,
        color: isSelected ? tierColor[enemy.tier] : '#77888c',
      }).setOrigin(0, 0.5);
      const arrow = this.add.text(0, y + rowH / 2, isSelected ? '▶' : ' ', {
        fontFamily: 'dungeon-mode', fontSize: 14, color: '#2ed573',
      }).setOrigin(0, 0.5);

      this.combatListContainer.add([rowBg, name, arrow]);

      rowBg.setInteractive({ useHandCursor: true });
      rowBg.on('pointerover', () => { rowBg.setFillStyle(C.rowHover, 1); rowBg.setAlpha(1); });
      rowBg.on('pointerout',  () => { if (!isSelected) { rowBg.setAlpha(0); } });
      rowBg.on('pointerdown', () => { this.selectedEnemyIndex = i; this.refreshCombatList(); });
      name.setInteractive({ useHandCursor: true });
      name.on('pointerdown', () => { this.selectedEnemyIndex = i; this.refreshCombatList(); });
    });

    this.refreshEnemyDetail();
  }

  private refreshEnemyDetail(): void {
    this.enemyDetailContainer.removeAll(true);
    const enemy = this.enemyList[this.selectedEnemyIndex];
    if (!enemy) return;

    const data = EnemyRegistry.resolve(enemy.key) as any;
    const tierColor: Record<string, string> = { common: '#e8eced', elite: '#ffa500', boss: '#ff4757' };
    const color = tierColor[enemy.tier];

    // Enemy name
    this.enemyDetailContainer.add(
      this.add.text(0, 0, enemy.name, { fontFamily: 'dungeon-mode', fontSize: 22, color }).setOrigin(0, 0)
    );

    const tierLabel: Record<string, string> = { common: 'COMMON', elite: 'ELITE', boss: 'BOSS' };
    this.enemyDetailContainer.add(
      this.add.text(0, 32, tierLabel[enemy.tier], { fontFamily: 'dungeon-mode', fontSize: 13, color: '#77888c' }).setOrigin(0, 0)
    );

    if (data) {
      const stats = [
        { label: 'HP',       value: String(data.maxHealth) },
        { label: 'Damage',   value: String(data.damage) },
        { label: 'Weak to',  value: data.elementalAffinity?.weakness  || 'None' },
        { label: 'Resists',  value: data.elementalAffinity?.resistance || 'None' },
      ];

      stats.forEach((s, i) => {
        const ry = 70 + i * 36;
        this.enemyDetailContainer.add(
          this.add.text(0, ry, s.label, { fontFamily: 'dungeon-mode', fontSize: 13, color: '#77888c' })
        );
        this.enemyDetailContainer.add(
          this.add.text(130, ry, s.value, { fontFamily: 'dungeon-mode', fontSize: 15, color: '#e8eced' })
        );
      });

      if (data.attackPattern?.length) {
        this.enemyDetailContainer.add(
          this.add.text(0, 220, 'Pattern', { fontFamily: 'dungeon-mode', fontSize: 13, color: '#77888c' })
        );
        this.enemyDetailContainer.add(
          this.add.text(0, 242, data.attackPattern.join(' → '), {
            fontFamily: 'dungeon-mode', fontSize: 13, color: '#5cabf2',
            wordWrap: { width: 460 },
          })
        );
      }
    }

    // Action buttons
    const btnY = 380;
    const fightBtn = this.makeSolidButton(0, btnY, 220, 44, 'FIGHT (ENTER)', '#ff6b35', 0x2a1a12, () => {
      this.startCombat(enemy.key, 'common');
    });
    const eliteBtn = this.makeSolidButton(240, btnY, 200, 44, 'AS ELITE', '#ffa500', 0x2a1e10, () => {
      this.startCombat(enemy.key, 'elite');
    });
    const bossBtn = this.makeSolidButton(460, btnY, 180, 44, 'AS BOSS', '#ff4757', 0x2a1018, () => {
      this.startCombat(enemy.key, 'boss');
    });
    this.enemyDetailContainer.add([fightBtn, eliteBtn, bossBtn]);
  }

  private startCombat(enemyKey: string, nodeType: string): void {
    this.hide();
    const main = this.scene.manager.getScene('MainMenu');
    const ow   = this.scene.manager.getScene('Overworld');
    const active = (main?.scene.isActive() ? main : ow?.scene.isActive() ? ow : null);
    if (active) active.scene.pause();
    this.scene.start('Combat', { nodeType, enemyId: enemyKey, returnToDevHub: true });
  }

  // ─── NODES TAB ──────────────────────────────────────────────────────────────

  private buildNodesTab(cx: number, cy: number, cw: number, _ch: number): void {
    const cont = this.add.container(cx, cy);
    this.container.add(cont);
    this.tabContainers['nodes'] = cont;

    cont.add(this.add.text(cw / 2, 40, 'Node Gallery', {
      fontFamily: 'dungeon-mode', fontSize: 26, color: '#5cabf2',
    }).setOrigin(0.5));
    cont.add(this.add.text(cw / 2, 80, 'Visual reference for all overworld node types and sprites', {
      fontFamily: 'dungeon-mode', fontSize: 16, color: '#77888c',
    }).setOrigin(0.5));

    // Node grid — 4 cols
    const nodes = [
      { type: 'campfire',  label: 'Campfire',  color: '#ff6b35', sprite: 'campfire_overworld', anim: 'campfire_burn',    desc: 'Rest & upgrade cards' },
      { type: 'treasure',  label: 'Treasure',  color: '#ffd93d', sprite: 'chest_f0',            anim: null,               desc: 'Gain relics' },
      { type: 'event',     label: 'Event',     color: '#a855f7', sprite: 'event_overworld',     anim: 'event_portal_loop', desc: 'Story & educational choices' },
      { type: 'shop',      label: 'Shop',      color: '#2ed573', sprite: 'merchant_overworld',  anim: null,               desc: 'Buy items & potions' },
      { type: 'combat',    label: 'Combat',    color: '#ff4757', sprite: 'tikbalang_overworld', anim: null,               desc: 'Ch1 common enemy sample' },
      { type: 'elite',     label: 'Elite',     color: '#ffa500', sprite: 'kapre_overworld',     anim: null,               desc: 'Ch1 elite enemy sample' },
      { type: 'boss',      label: 'Boss',      color: '#c0392b', sprite: 'kapre_overworld',     anim: null,               desc: 'Boss encounter' },
    ];

    const cols = 4;
    const cardW = Math.floor((cw - 60) / cols) - 10;
    const cardH = 220;
    const startX = 30;
    const startY = 120;

    nodes.forEach((n, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const nx = startX + col * (cardW + 10) + cardW / 2;
      const ny = startY + row * (cardH + 16);

      const card = this.add.container(nx, ny);

      const bg = this.add.rectangle(0, 0, cardW, cardH, C.bg);
      bg.setStrokeStyle(1, C.border);
      card.add(bg);

      // Node label
      const label = this.add.text(0, -cardH / 2 + 14, n.label.toUpperCase(), {
        fontFamily: 'dungeon-mode', fontSize: 14, color: n.color,
      }).setOrigin(0.5, 0);
      card.add(label);

      // Sprite preview
      if (this.textures.exists(n.sprite)) {
        const sprite = this.add.sprite(0, 0, n.sprite);
        const targetSize = 64;
        const scale = targetSize / Math.max(sprite.width, sprite.height);
        sprite.setScale(scale);
        card.add(sprite);

        if (n.anim && this.anims.exists(n.anim)) {
          sprite.play(n.anim);
        }
      } else {
        const ph = this.add.text(0, 0, '?', { fontFamily: 'dungeon-mode', fontSize: 32, color: '#444444' }).setOrigin(0.5);
        card.add(ph);
      }

      // Description
      const desc = this.add.text(0, cardH / 2 - 18, n.desc, {
        fontFamily: 'dungeon-mode', fontSize: 12, color: '#77888c', align: 'center',
        wordWrap: { width: cardW - 16 },
      }).setOrigin(0.5, 1);
      card.add(desc);

      // Hover effect
      bg.setInteractive({ useHandCursor: false });
      bg.on('pointerover', () => { bg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(n.color).color); });
      bg.on('pointerout',  () => { bg.setStrokeStyle(1, C.border); });

      cont.add(card);
    });

    // Chapter enemy showcase button
    const showcaseBtn = this.makeSolidButton(cw / 2, startY + 2 * (cardH + 16) + 50, 360, 48, 'OPEN FULL NODE SHOWCASE →', '#5cabf2', 0x0d1a2a, () => {
      this.hide();
      if (!this.scene.isActive('NodeShowcaseScene')) {
        this.scene.launch('NodeShowcaseScene');
      } else {
        (this.scene.get('NodeShowcaseScene') as any)?.show?.();
      }
    });
    cont.add(showcaseBtn);
  }

  // ─── CHAPTERS TAB ───────────────────────────────────────────────────────────

  private buildChaptersTab(cx: number, cy: number, cw: number, ch: number): void {
    const cont = this.add.container(cx, cy);
    this.container.add(cont);
    this.tabContainers['chapters'] = cont;

    cont.add(this.add.text(cw / 2, 24, 'Chapter & State Tools', {
      fontFamily: 'dungeon-mode', fontSize: 24, color: '#2ed573',
    }).setOrigin(0.5));

    // Stored as dynamic container so it can be refreshed
    const dynamicCont = this.add.container(0, 68);
    cont.add(dynamicCont);
    (cont as any)._dynamic = dynamicCont;
    (cont as any)._cw = cw;
    (cont as any)._ch = ch;

    this.refreshChaptersTab();
  }

  private refreshChaptersTab(): void {
    const cont = this.tabContainers['chapters'];
    if (!cont) return;
    const dynamicCont: Phaser.GameObjects.Container = (cont as any)._dynamic;
    const cw: number = (cont as any)._cw ?? 1540;
    dynamicCont.removeAll(true);

    const currentChapter = this.gameState.getCurrentChapter();

    // Chapter select cards
    const chapters: Array<{ ch: Chapter; name: string; desc: string; color: string }> = [
      { ch: 1, name: 'Chapter 1', desc: 'Forest — Tikbalang, Kapre',   color: '#2ed573' },
      { ch: 2, name: 'Chapter 2', desc: 'Submerged — Sirena, Bakunawa', color: '#5cabf2' },
      { ch: 3, name: 'Chapter 3', desc: 'Skyward — Diwata, False Bathala', color: '#a855f7' },
    ];

    const cardW = Math.floor((cw - 80) / 3) - 12;
    const cardH = 160;
    const startX = 40;

    chapters.forEach((c, i) => {
      const nx = startX + i * (cardW + 12) + cardW / 2;
      const isActive = c.ch === currentChapter;
      const card = this.add.container(nx, cardH / 2);

      const bg = this.add.rectangle(0, 0, cardW, cardH, isActive ? 0x0d2010 : C.bg);
      bg.setStrokeStyle(2, isActive ? Phaser.Display.Color.HexStringToColor(c.color).color : C.border);
      const title = this.add.text(0, -40, c.name, {
        fontFamily: 'dungeon-mode', fontSize: 20, color: isActive ? c.color : '#77888c',
      }).setOrigin(0.5);
      const desc = this.add.text(0, -10, c.desc, {
        fontFamily: 'dungeon-mode', fontSize: 13, color: '#77888c', align: 'center',
        wordWrap: { width: cardW - 24 },
      }).setOrigin(0.5);
      const badge = isActive ? this.add.text(0, 30, '● ACTIVE', { fontFamily: 'dungeon-mode', fontSize: 12, color: c.color }).setOrigin(0.5) : null;
      const jumpBtn = this.makeSolidButton(0, 52, 200, 36, isActive ? '● CURRENT' : '→ LAUNCH CHAPTER', isActive ? '#555555' : c.color, isActive ? 0x1a1a1a : C.bg, () => {
        if (!isActive) this.jumpToChapter(c.ch);
      });

      card.add([bg, title, desc, jumpBtn]);
      if (badge) card.add(badge);

      if (!isActive) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(C.rowHover));
        bg.on('pointerout',  () => bg.setFillStyle(C.bg));
        bg.on('pointerdown', () => this.jumpToChapter(c.ch));
      }

      dynamicCont.add(card);
    });

    // State tools section
    const toolY = cardH + 40;
    dynamicCont.add(this.add.text(40, toolY, 'STATE TOOLS', {
      fontFamily: 'dungeon-mode', fontSize: 14, color: '#77888c',
    }));

    const tools: Array<{ label: string; color: string; fn: () => void }> = [
      {
        label: 'Reset Game State',
        color: '#ff4757',
        fn: () => {
          GameState.getInstance().reset();
          OverworldGameState.getInstance().reset();
          RuleBasedDDA.getInstance().resetSession();
          this.refreshChaptersTab();
          console.log('[DevHub] Game state reset.');
        }
      },
      {
        label: 'Skip to Overworld',
        color: '#2ed573',
        fn: () => {
          this.hide();
          GameState.getInstance().reset();
          OverworldGameState.getInstance().reset();
          RuleBasedDDA.getInstance().resetSession();
          this.scene.start('Overworld');
        }
      },
      {
        label: 'Skip Prologue',
        color: '#5cabf2',
        fn: () => {
          this.hide();
          this.scene.start('Overworld');
        }
      },
      {
        label: 'Open DDA Debug',
        color: '#a855f7',
        fn: () => {
          this.hide();
          if (!this.scene.isActive('DDADebugScene')) this.scene.launch('DDADebugScene');
        }
      },
    ];

    const btnW = 260, btnH = 44, gap = 16;
    tools.forEach((t, i) => {
      const bx = 40 + i * (btnW + gap) + btnW / 2;
      const btn = this.makeSolidButton(bx, toolY + 44, btnW, btnH, t.label, t.color, C.bg, t.fn);
      dynamicCont.add(btn);
    });
  }

  private jumpToChapter(chapter: Chapter): void {
    // Set chapter in game state (unlocks if locked), then clear the map
    // so Overworld generates a fresh one for this chapter on boot.
    this.gameState.setCurrentChapter(chapter);
    this.gameState.resetMapState();

    // Update enemy list for the new chapter in the combat tab
    this.buildEnemyList(chapter);

    // Refresh both affected tabs
    this.refreshChaptersTab();
    if (this.activeTab === 'combat') {
      this.refreshCombatTab();
    }

    // Navigate to Overworld — it will regenerate the map for the active chapter
    this.hide();
    this.scene.start('Overworld');

    console.log(`[DevHub] Jumped to Chapter ${chapter} → restarting Overworld`);
  }

  // ─── EVENTS TAB ─────────────────────────────────────────────────────────────

  private buildEventsTab(cx: number, cy: number, cw: number, ch: number): void {
    const cont = this.add.container(cx, cy);
    this.container.add(cont);
    this.tabContainers['events'] = cont;

    cont.add(this.add.text(cw / 2, 24, 'Educational Events', {
      fontFamily: 'dungeon-mode', fontSize: 24, color: '#a855f7',
    }).setOrigin(0.5));

    // Act buttons
    const acts = ['Act 1', 'Act 2', 'Act 3'];
    const abtnW = 140, gap = 12;
    const totalW = acts.length * abtnW + (acts.length - 1) * gap;
    let ax = cw / 2 - totalW / 2;
    acts.forEach((label, i) => {
      const act = i + 1;
      const btn = this.add.container(ax + abtnW / 2, 60);
      const bg = this.add.rectangle(0, 0, abtnW, 34, C.bg);
      bg.setStrokeStyle(1, C.border);
      const txt = this.add.text(0, 0, label, { fontFamily: 'dungeon-mode', fontSize: 15, color: '#77888c' }).setOrigin(0.5);
      btn.add([bg, txt]);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => { this.buildEventList(act); this.refreshEventsList(); });
      bg.on('pointerover', () => { if (this.eventsAct !== act) bg.setFillStyle(C.rowHover); });
      bg.on('pointerout',  () => { if (this.eventsAct !== act) bg.setFillStyle(C.bg); });
      (btn as any)._act = act;
      (btn as any)._bg  = bg;
      (btn as any)._txt = txt;
      cont.add(btn);
      ax += abtnW + gap;
    });

    // Two-column layout
    const listW = Math.floor(cw * 0.38);
    const detailX = listW + 20;
    const detailW = cw - listW - 20;
    const bodyY = 92;
    const bodyH = ch - 92;

    const listBg = this.add.rectangle(listW / 2, bodyY + bodyH / 2, listW, bodyH, C.bg, 0.6);
    listBg.setStrokeStyle(1, C.border);
    cont.add(listBg);

    const detailBg = this.add.rectangle(detailX + detailW / 2, bodyY + bodyH / 2, detailW, bodyH, C.bg, 0.6);
    detailBg.setStrokeStyle(1, C.border);
    cont.add(detailBg);

    this.eventsListContainer   = this.add.container(8,           bodyY + 8);
    this.eventDetailContainer  = this.add.container(detailX + 12, bodyY + 8);
    cont.add(this.eventsListContainer);
    cont.add(this.eventDetailContainer);

    (cont as any)._listW    = listW;
    (cont as any)._detailX  = detailX;
    (cont as any)._detailW  = detailW;
    (cont as any)._bodyH    = bodyH;
  }

  private refreshEventsList(): void {
    // Update act button highlights
    const cont = this.tabContainers['events'];
    cont.list.forEach((obj: any) => {
      if (obj._act !== undefined) {
        const isActive = obj._act === this.eventsAct;
        obj._bg.setFillStyle(isActive ? 0x1a0d2e : C.bg);
        obj._bg.setStrokeStyle(1, isActive ? 0xa855f7 : C.border);
        obj._txt.setColor(isActive ? '#a855f7' : '#77888c');
      }
    });

    this.eventsListContainer.removeAll(true);
    this.eventDetailContainer.removeAll(true);

    const rowH = 36;
    this.eventsList.forEach((ev, i) => {
      const isSelected = i === this.selectedEventIndex;
      const y = i * rowH;

      const rowBg = this.add.rectangle(290, y + rowH / 2, 578, rowH - 4, isSelected ? 0x1a0d2e : 0, isSelected ? 1 : 0);
      rowBg.setStrokeStyle(isSelected ? 1 : 0, 0xa855f7);
      const txt = this.add.text(12, y + rowH / 2, ev.name, {
        fontFamily: 'dungeon-mode', fontSize: 15, color: isSelected ? '#a855f7' : '#77888c',
      }).setOrigin(0, 0.5);

      rowBg.setInteractive({ useHandCursor: true });
      rowBg.on('pointerover', () => { if (!isSelected) rowBg.setAlpha(0.3); });
      rowBg.on('pointerout',  () => { if (!isSelected) rowBg.setAlpha(0); });
      rowBg.on('pointerdown', () => { this.selectedEventIndex = i; this.refreshEventsList(); });
      txt.setInteractive({ useHandCursor: true });
      txt.on('pointerdown', () => { this.selectedEventIndex = i; this.refreshEventsList(); });

      this.eventsListContainer.add([rowBg, txt]);
    });

    this.refreshEventDetail();
  }

  private refreshEventDetail(): void {
    this.eventDetailContainer.removeAll(true);
    const ev = this.eventsList[this.selectedEventIndex];
    if (!ev) return;

    const detailW = (this.tabContainers['events'] as any)._detailW ?? 900;

    this.eventDetailContainer.add(
      this.add.text(0, 0, ev.name, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#a855f7' }).setOrigin(0, 0)
    );

    if (ev.description?.[0]) {
      this.eventDetailContainer.add(
        this.add.text(0, 36, ev.description[0], {
          fontFamily: 'dungeon-mode', fontSize: 13, color: '#77888c',
          wordWrap: { width: detailW - 24 },
        }).setOrigin(0, 0)
      );
    }

    // Choices
    if (ev.choices?.length) {
      let cy = 100;
      this.eventDetailContainer.add(
        this.add.text(0, cy, 'CHOICES', { fontFamily: 'dungeon-mode', fontSize: 13, color: '#555566' }).setOrigin(0)
      );
      cy += 22;
      ev.choices.forEach((choice: any, i: number) => {
        const choiceTxt = this.add.text(0, cy, `${i + 1}. ${choice.text}`, {
          fontFamily: 'dungeon-mode', fontSize: 14, color: '#e8eced',
          wordWrap: { width: detailW - 24 },
        }).setOrigin(0);
        this.eventDetailContainer.add(choiceTxt);
        cy += choiceTxt.height + 6;
      });
    }

    // Launch button
    const bodyH = (this.tabContainers['events'] as any)._bodyH ?? 700;
    const launchBtn = this.makeSolidButton(0, bodyH - 80, 260, 44, 'LAUNCH EVENT SCENE', '#a855f7', 0x1a0d2e, () => {
      this.hide();
      const playerData = GameState.getInstance().getPlayerData();
      this.scene.start('EventScene', {
        player: playerData || { name: 'Debugger', health: 100, ginto: 100 },
        event: ev,
        returnToDevHub: true,
      });
    });
    this.eventDetailContainer.add(launchBtn);
  }

  // ─── Shared UI Helpers ──────────────────────────────────────────────────────

  private makeSolidButton(
    x: number, y: number, w: number, h: number,
    label: string, textColor: string, bgColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, w, h, bgColor);
    const colorNum = Phaser.Display.Color.HexStringToColor(textColor).color;
    bg.setStrokeStyle(1, colorNum);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'dungeon-mode', fontSize: 15, color: textColor,
    }).setOrigin(0.5);
    c.add([bg, txt]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { bg.setFillStyle(colorNum, 0.18); });
    bg.on('pointerout',  () => { bg.setFillStyle(bgColor); });
    bg.on('pointerdown', onClick);
    return c;
  }

  private makeTextButton(
    x: number, y: number,
    label: string, normalColor: string, hoverColor: string,
    onClick: () => void
  ): Phaser.GameObjects.Text {
    return this.add.text(x, y, label, { fontFamily: 'dungeon-mode', fontSize: 14, color: normalColor })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover',  function(this: Phaser.GameObjects.Text) { this.setColor(hoverColor); })
      .on('pointerout',   function(this: Phaser.GameObjects.Text) { this.setColor(normalColor); })
      .on('pointerdown',  onClick);
  }

  // ─── Keyboard ───────────────────────────────────────────────────────────────

  private setupKeys(): void {
    this.input.keyboard?.on('keydown-F2', () => this.toggle());
    this.input.keyboard?.on('keydown-ESC', () => { if (this.isVisible) this.hide(); });

    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.isVisible) return;
      if (this.activeTab === 'combat') {
        this.selectedEnemyIndex = Math.max(0, this.selectedEnemyIndex - 1);
        this.refreshCombatList();
      } else if (this.activeTab === 'events') {
        this.selectedEventIndex = Math.max(0, this.selectedEventIndex - 1);
        this.refreshEventsList();
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (!this.isVisible) return;
      if (this.activeTab === 'combat') {
        this.selectedEnemyIndex = Math.min(this.enemyList.length - 1, this.selectedEnemyIndex + 1);
        this.refreshCombatList();
      } else if (this.activeTab === 'events') {
        this.selectedEventIndex = Math.min(this.eventsList.length - 1, this.selectedEventIndex + 1);
        this.refreshEventsList();
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (!this.isVisible) return;
      if (this.activeTab === 'combat') {
        const e = this.enemyList[this.selectedEnemyIndex];
        if (e) this.startCombat(e.key, 'common');
      } else if (this.activeTab === 'events') {
        const ev = this.eventsList[this.selectedEventIndex];
        if (ev) {
          this.hide();
          const playerData = GameState.getInstance().getPlayerData();
          this.scene.start('EventScene', {
            player: playerData || { name: 'Debugger', health: 100, ginto: 100 },
            event: ev,
            returnToDevHub: true,
          });
        }
      }
    });
  }

  update(): void {}
}

import { Combat } from "../Combat";
import { CreatureDialogue } from "../../../core/types/CombatTypes";
import { RELIC_REGISTRY } from "../../../data/relics/Act1Relics";
import { EnemyRegistry } from "../../../core/registries/EnemyRegistry";

/**
 * CombatDialogue - Handles all dialogue display and management for combat
 * Separates dialogue logic from core Combat scene
 */
export class CombatDialogue {
  private scene: Combat;
  private battleStartDialogueContainer: Phaser.GameObjects.Container | null = null;

  // Post-combat dialogue data
  private creatureDialogues: Record<string, CreatureDialogue> = {
    tikbalang_scout: {
      name: "Tikbalang Scout",
      spareDialogue: "Hah! You show mercy to a forest guardian turned to shadow? Once I guided lost souls to safety, but now... now I lead them astray. Still, your compassion awakens something deep in me. Take this blessing of sure footing.",
      killDialogue: "My essence... it feeds the darkness you call shadow. You've only made the forest more treacherous, traveler!",
      spareReward: {
        ginto: 45,
        diamante: 0,
        healthHealing: 8,
        bonusEffect: "Sure footing",
        relics: [RELIC_REGISTRY.getById("tikbalangs_hoof")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 70,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Deceptive paths",
        relics: [RELIC_REGISTRY.getById("tikbalangs_hoof")!],
        relicDropChance: 0.35
      },
    },
    balete_wraith: {
      name: "Balete Wraith",
      spareDialogue: "These roots once held sacred conversations between anito and Bathala, but the engkanto's lies... they poisoned our very essence. Spare me, and I'll grant you the wisdom of the sacred grove.",
      killDialogue: "My spirit feeds the impostor's power! The forest remembers your violence, traveler!",
      spareReward: {
        ginto: 45,
        diamante: 0,
        healthHealing: 8,
        bonusEffect: "Sacred grove wisdom",
        relics: [RELIC_REGISTRY.getById("balete_root")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 70,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Cursed bark",
        relics: [RELIC_REGISTRY.getById("balete_root")!],
        relicDropChance: 0.35
      },
    },
    sigbin_charger: {
      name: "Sigbin Charger",
      spareDialogue: "We once served Bathala faithfully, our hearts pure and our purpose noble. But the false god's whispers... they corrupted us. If you spare me, I'll share the secret of the night paths.",
      killDialogue: "Take my power, but beware—darkness flows to the one who commands shadows!",
      spareReward: {
        ginto: 55,
        diamante: 0,
        healthHealing: 7,
        bonusEffect: "Night path secrets",
        relics: [RELIC_REGISTRY.getById("sigbin_heart")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 80,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Heart of shadow",
        relics: [RELIC_REGISTRY.getById("sigbin_heart")!],
        relicDropChance: 0.35
      },
    },
    duwende_trickster: {
      name: "Duwende Trickster",
      spareDialogue: "You have the eyes of one who sees beyond surface, mortal. We are indeed spirits of great power, though the engkanto's web has twisted our nature. Accept this gift of hidden sight.",
      killDialogue: "My tricks scatter to the wind, but the forest remembers! Your ruthlessness feeds the impostor's growing strength!",
      spareReward: {
        ginto: 40,
        diamante: 0,
        healthHealing: 5,
        bonusEffect: "Hidden sight",
        relics: [RELIC_REGISTRY.getById("duwende_charm")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 60,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Mischievous whispers",
        relics: [RELIC_REGISTRY.getById("duwende_charm")!],
        relicDropChance: 0.35
      },
    },
    tiyanak_ambusher: {
      name: "Tiyanak Ambusher",
      spareDialogue: "Innocent? Yes, once I was just a babe lost between realms... but the false god's corruption runs deep. Your mercy stirs something in my cursed heart. Take this blessing of true sight.",
      killDialogue: "You strike at innocence, but know this—your violence feeds the shadow that corrupts all!",
      spareReward: {
        ginto: 35,
        diamante: 0,
        healthHealing: 15,
        bonusEffect: "True sight",
        relics: [RELIC_REGISTRY.getById("tiyanak_tear")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 55,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Crying echo",
        relics: [RELIC_REGISTRY.getById("tiyanak_tear")!],
        relicDropChance: 0.35
      },
    },
    amomongo: {
      name: "Amomongo",
      spareDialogue: "My claws once only defended the mountain folk from true threats. The engkanto's poison has changed my purpose. Your mercy awakens old memories. Take this strength.",
      killDialogue: "My bones may break, but the shadow grows stronger with each soul you destroy!",
      spareReward: {
        ginto: 45,
        diamante: 0,
        healthHealing: 8,
        bonusEffect: "Primal strength",
        relics: [RELIC_REGISTRY.getById("amomongo_claw")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 70,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Bleeding claws",
        relics: [RELIC_REGISTRY.getById("amomongo_claw")!],
        relicDropChance: 0.35
      },
    },
    bungisngis: {
      name: "Bungisngis",
      spareDialogue: "Ha ha ha! You have the spirit of a true mountain dweller! Once we laughed with joy, not malice. Take this gift of hearty laughter to protect you.",
      killDialogue: "My laughter dies, but the echo haunts... and the shadow grows stronger!",
      spareReward: {
        ginto: 45,
        diamante: 0,
        healthHealing: 8,
        bonusEffect: "Joyful resilience",
        relics: [RELIC_REGISTRY.getById("bungisngis_grin")!],
        relicDropChance: 0.35
      },
      killReward: {
        ginto: 70,
        diamante: 1,
        healthHealing: 0,
        bonusEffect: "Maddening laughter",
        relics: [RELIC_REGISTRY.getById("bungisngis_grin")!],
        relicDropChance: 0.35
      },
    },
    kapre_shade: {
      name: "Kapre Shade",
      spareDialogue: "In my tree, I once smoked in peace, guardian of the forest paths. The false god's corruption has made me a shadow of my former self. Your mercy stirs the old honor. Take this blessing of forest protection.",
      killDialogue: "Burn me down, but the smoke carries the impostor's whispers! Your violence only feeds the growing shadow!",
      spareReward: {
        ginto: 150,
        diamante: 3,
        healthHealing: 30,
        bonusEffect: "Forest protection",
        relics: [RELIC_REGISTRY.getById("kapres_cigar")!],
        relicDropChance: 1.0
      },
      killReward: {
        ginto: 200,
        diamante: 5,
        healthHealing: 0,
        bonusEffect: "Smoke whispers",
        relics: [RELIC_REGISTRY.getById("kapres_cigar")!],
        relicDropChance: 1.0
      },
    },
    tawong_lipod: {
      name: "Tawong Lipod",
      spareDialogue: "Ah... you move with the wind's understanding. We once brought harmony to the Bikol lands, before the false god's lies. Accept this gift of swift movement.",
      killDialogue: "You cannot scatter what has no form! The wind remembers your violence, and it feeds the impostor's power!",
      spareReward: {
        ginto: 80,
        diamante: 1,
        healthHealing: 20,
        bonusEffect: "Wind's grace",
        relics: [], // Removed wind_veil (no sprite)
        relicDropChance: 0
      },
      killReward: {
        ginto: 120,
        diamante: 2,
        healthHealing: 0,
        bonusEffect: "Air superiority",
        relics: [], // Removed wind_veil (no sprite)
        relicDropChance: 0
      },
    },
    mangangaway: {
      name: "Mangangaway",
      spareDialogue: "Wise traveler... you see through my curses to the spirit beneath. I was once a healer, a protector of the people. Take this gift of protection against the false god's influence.",
      killDialogue: "My curses may end, but the shadow you serve grows stronger! Your power feeds the impostor's corruption!",
      spareReward: {
        ginto: 80,
        diamante: 1,
        healthHealing: 20,
        bonusEffect: "Hex protection",
        relics: [RELIC_REGISTRY.getById("mangangaway_wand")!],
        relicDropChance: 0.75
      },
      killReward: {
        ginto: 120,
        diamante: 2,
        healthHealing: 0,
        bonusEffect: "Curse mastery",
        relics: [RELIC_REGISTRY.getById("mangangaway_wand")!],
        relicDropChance: 0.75
      },
    },
  };

  constructor(scene: Combat) {
    this.scene = scene;
  }

  /**
   * Get creature dialogues data
   */
  public getCreatureDialogues(): Record<string, CreatureDialogue> {
    return this.creatureDialogues;
  }

  /**
   * Show cinematic battle start dialogue — auto-fades in, typewriters, then
   * automatically transitions to enemy dialogue. No clicking required.
   */
  public showBattleStartDialogue(): void {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;
    const enemyName = this.scene.getCombatState().enemy.name;
    const isEliteOrBoss = this.scene.getCombatState().enemy.tier === 'elite' ||
      this.scene.getCombatState().enemy.tier === 'boss';
    const accentColor = isEliteOrBoss ? 0xff4757 : 0xffd93d;
    const accentHex = isEliteOrBoss ? '#ff4757' : '#ffd93d';

    // === SCREEN FLASH — sharp white impact ===
    this.scene.cameras.main.flash(200, 255, 255, 255, false);
    this.scene.cameras.main.shake(350, 0.018);

    // Master container for cleanup
    const master = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(5000);
    this.battleStartDialogueContainer = master;

    // === DARK OVERLAY — fast slam ===
    const overlay = this.scene.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000)
      .setAlpha(0).setDepth(5000);
    master.add(overlay);
    this.scene.tweens.add({ targets: overlay, alpha: 0.82, duration: 150, ease: 'Power3' });

    // === SHARP DIAGONAL SLASH LINES — Persona 5 style ===
    const slashGraphics = this.scene.add.graphics().setDepth(5001);
    master.add(slashGraphics);

    // Draw sharp diagonal lines sweeping across
    const slashCount = 6;
    const slashColor = accentColor;
    for (let i = 0; i < slashCount; i++) {
      const lineY = (sh / (slashCount + 1)) * (i + 1);
      const thickness = (i % 2 === 0) ? 3 : 1.5;
      const lineAlpha = (i % 2 === 0) ? 0.7 : 0.35;
      slashGraphics.lineStyle(thickness, slashColor, lineAlpha);
      slashGraphics.beginPath();
      slashGraphics.moveTo(-sw * 0.3, lineY - 40);
      slashGraphics.lineTo(sw * 1.3, lineY + 40);
      slashGraphics.strokePath();
    }

    // Animate slash lines: sweep from left with clip effect
    slashGraphics.setAlpha(0).setX(-sw * 0.5);
    this.scene.tweens.add({
      targets: slashGraphics, x: 0, alpha: 1,
      duration: 250, ease: 'Power4',
    });

    // === CENTRAL ENCOUNTER BANNER ===
    const bannerH = 130;
    const bannerContainer = this.scene.add.container(sw / 2, sh / 2).setDepth(5002);
    master.add(bannerContainer);

    // Angled black banner background
    const bannerBg = this.scene.add.rectangle(0, 0, sw * 1.2, bannerH, 0x0a0608, 0.95);
    bannerBg.setAngle(-2);

    // Sharp accent lines on top & bottom of banner
    const topLine = this.scene.add.rectangle(0, -bannerH / 2, sw * 1.2, 3, accentColor, 0.9)
      .setAngle(-2);
    const bottomLine = this.scene.add.rectangle(0, bannerH / 2, sw * 1.2, 3, accentColor, 0.9)
      .setAngle(-2);

    // Thin inner accent lines
    const innerTop = this.scene.add.rectangle(0, -bannerH / 2 + 8, sw * 1.2, 1, accentColor, 0.3)
      .setAngle(-2);
    const innerBot = this.scene.add.rectangle(0, bannerH / 2 - 8, sw * 1.2, 1, accentColor, 0.3)
      .setAngle(-2);

    // Enemy name — large, bold, centered
    const nameLabel = this.scene.add.text(0, -18, enemyName.toUpperCase(), {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(sw * 0.042) + 'px',
      color: accentHex,
      align: 'center',
    }).setOrigin(0.5).setAngle(-2).setAlpha(0);

    // Encounter subtitle
    const subtitleText = this.scene.add.text(0, 22, `A ${enemyName} blocks your path!`, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(sw * 0.018) + 'px',
      color: '#8a9ba8',
      align: 'center',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAngle(-2).setAlpha(0);

    // Left & right decorative slash marks
    const decoLeft = this.scene.add.text(-sw * 0.32, -2, '///', {
      fontFamily: "dungeon-mode", fontSize: '28px', color: accentHex,
    }).setOrigin(0.5).setAngle(-2).setAlpha(0);
    const decoRight = this.scene.add.text(sw * 0.32, -2, '\\\\\\', {
      fontFamily: "dungeon-mode", fontSize: '28px', color: accentHex,
    }).setOrigin(0.5).setAngle(-2).setAlpha(0);

    bannerContainer.add([bannerBg, topLine, bottomLine, innerTop, innerBot,
      nameLabel, subtitleText, decoLeft, decoRight]);

    // === ANIMATION SEQUENCE ===
    // Banner slides in from right with slight overshoot
    bannerContainer.setX(sw * 1.5).setAlpha(0);
    this.scene.tweens.add({
      targets: bannerContainer,
      x: sw / 2, alpha: 1,
      duration: 300, ease: 'Back.easeOut',
      delay: 100,
      onComplete: () => {
        // Name smashes in — scale pop
        nameLabel.setScale(1.8);
        this.scene.tweens.add({
          targets: nameLabel, alpha: 1, scale: 1,
          duration: 250, ease: 'Back.easeOut',
        });
        // Subtitle fades in
        this.scene.tweens.add({
          targets: subtitleText, alpha: 0.8,
          duration: 350, ease: 'Power2', delay: 150,
        });
        // Decorative slashes
        this.scene.tweens.add({
          targets: [decoLeft, decoRight], alpha: 0.5,
          duration: 200, delay: 100,
        });
      },
    });

    // === SCREEN EDGE FLASH BARS — sharp horizontal impacts ===
    const flashBarTop = this.scene.add.rectangle(sw / 2, 0, sw, 6, accentColor, 0.8)
      .setOrigin(0.5, 0).setDepth(5003).setAlpha(0);
    const flashBarBot = this.scene.add.rectangle(sw / 2, sh, sw, 6, accentColor, 0.8)
      .setOrigin(0.5, 1).setDepth(5003).setAlpha(0);
    master.add([flashBarTop, flashBarBot]);

    this.scene.tweens.add({
      targets: [flashBarTop, flashBarBot], alpha: 1,
      duration: 100, ease: 'Power4', delay: 100,
      onComplete: () => {
        this.scene.tweens.add({
          targets: [flashBarTop, flashBarBot], alpha: 0,
          duration: 400, ease: 'Power2',
        });
      },
    });

    // === AUTO-DISMISS — sweep out left, then show enemy dialogue ===
    this.scene.time.delayedCall(1600, () => {
      // Slash lines sweep out
      this.scene.tweens.add({
        targets: slashGraphics, x: sw * 0.5, alpha: 0,
        duration: 200, ease: 'Power3',
      });
      // Banner sweeps out left
      this.scene.tweens.add({
        targets: bannerContainer, x: -sw * 0.5, alpha: 0,
        duration: 280, ease: 'Power3',
      });
      // Overlay fades
      this.scene.tweens.add({
        targets: overlay, alpha: 0,
        duration: 300, ease: 'Power2', delay: 100,
        onComplete: () => {
          if (this.battleStartDialogueContainer) {
            this.battleStartDialogueContainer.destroy();
            this.battleStartDialogueContainer = null;
          }
          this.scene.time.delayedCall(80, () => {
            this.showEnemyDialogue();
          });
        },
      });
    });
  }

  /**
   * Show enemy intro dialogue at top of screen.
   * Auto-fades in, typewriters the enemy's intro line, auto-dismisses.
   */
  public showEnemyDialogue(): void {
    const screenWidth = this.scene.cameras.main.width;
    const combatState = this.scene.getCombatState();
    const enemyName = combatState.enemy.name;
    const introText = this.getEnemyDialogue();
    const isEliteOrBoss = combatState.enemy.tier === 'elite' || combatState.enemy.tier === 'boss';
    const borderColor = isEliteOrBoss ? 0xff4757 : 0x77888C;

    // Dialogue container at top of screen
    const dialogueContainer = this.scene.add.container(screenWidth / 2, 110);
    const boxW = screenWidth * 0.8;

    // Styled box
    const outerBorder = this.scene.add.rectangle(0, 0, boxW + 8, 108, undefined, 0)
      .setStrokeStyle(2, borderColor);
    const innerBorder = this.scene.add.rectangle(0, 0, boxW, 100, undefined, 0)
      .setStrokeStyle(2, borderColor);
    const bg = this.scene.add.rectangle(0, 0, boxW, 100, 0x150E10).setInteractive();

    // Enemy name — red for elite/boss, gold for common
    const nameColor = isEliteOrBoss ? '#ff4757' : '#ffd93d';
    const enemyNameText = this.scene.add.text(
      -(boxW / 2) + 20, -32, enemyName.toUpperCase(), {
        fontFamily: "dungeon-mode", fontSize: '16px', color: nameColor, align: 'left'
      }
    ).setOrigin(0, 0).setDepth(5002).setAlpha(0);

    // Dialogue text — pre-filled, will fade in
    const dialogueTextObj = this.scene.add.text(
      -(boxW / 2) + 20, -5, `"${introText}"`, {
        fontFamily: "dungeon-mode", fontSize: '14px', color: '#e8eced',
        fontStyle: 'italic', align: 'left',
        wordWrap: { width: boxW - 40 },
        lineSpacing: 3,
      }
    ).setOrigin(0, 0).setDepth(5002).setAlpha(0);

    dialogueContainer.add([outerBorder, innerBorder, bg, enemyNameText, dialogueTextObj]);
    dialogueContainer.setScrollFactor(0).setDepth(5000);

    // Animate in: slide down from above
    dialogueContainer.setAlpha(0).setY(60);

    this.scene.tweens.add({
      targets: dialogueContainer, alpha: 1, y: 110,
      duration: 280, ease: 'Back.easeOut',
      onComplete: () => {
        // Fade in name
        this.scene.tweens.add({
          targets: enemyNameText, alpha: 1, duration: 250, ease: 'Power2',
        });
        // Fade in dialogue text with slight delay
        this.scene.tweens.add({
          targets: dialogueTextObj, alpha: 1, duration: 450, ease: 'Power2', delay: 180,
        });
      }
    });

    // Track if dialogue has been dismissed
    let dismissed = false;

    // Calculate auto-dismiss time (min 2.5s, max 4s — gives time to read fade-in text)
    const readTime = Math.min(4000, Math.max(2500, introText.length * 18 + 1200));

    // Auto-fade after read time
    this.scene.time.delayedCall(readTime, () => {
      if (!dismissed) {
        dismissed = true;
        this.scene.tweens.add({
          targets: dialogueContainer, alpha: 0, y: 60,
          duration: 250, ease: 'Power2',
          onComplete: () => { dialogueContainer.destroy(); }
        });
      }
    });

    // Click to dismiss early
    bg.on('pointerdown', () => {
      if (!dismissed) {
        dismissed = true;
        this.scene.tweens.add({
          targets: dialogueContainer, alpha: 0, y: 60,
          duration: 200, ease: 'Power2',
          onComplete: () => { dialogueContainer.destroy(); }
        });
      }
    });
  }

  /**
   * Get enemy-specific intro dialogue from the EnemyEntity's config data.
   * Falls back to a generic line if no dialogue is defined.
   */
  private getEnemyDialogue(): string {
    const combatState = this.scene.getCombatState();
    const enemy = combatState.enemy;
    return enemy.dialogue?.intro || "Face me, challenger!";
  }


  /**
   * Show post-combat dialogue with Landás choice
   */
  public showPostCombatDialogue(): void {
    // This method would be called from Combat.ts when combat ends
    // Implementation would go here
    console.log("Post-combat dialogue would show here");
  }

  /**
   * Get enemy sprite key for dialogue display — delegates to centralized sprite map
   */
  public getEnemySpriteKey(enemyName: string): string {
    return EnemyRegistry.getCombatSprite(enemyName);
  }
}

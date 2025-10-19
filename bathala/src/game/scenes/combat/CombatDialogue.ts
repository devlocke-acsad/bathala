import { Combat } from "../Combat";
import { CreatureDialogue } from "../../../core/types/CombatTypes";
import { RELIC_REGISTRY } from "../../../data/relics/Act1Relics";

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
        ginto: 80, 
        diamante: 1, 
        healthHealing: 20, 
        bonusEffect: "Forest protection",
        relics: [RELIC_REGISTRY.getById("kapres_cigar")!],
        relicDropChance: 0.75
      },
      killReward: { 
        ginto: 120, 
        diamante: 2, 
        healthHealing: 0, 
        bonusEffect: "Smoke whispers",
        relics: [RELIC_REGISTRY.getById("kapres_cigar")!],
        relicDropChance: 0.75
      },
    },
    tawong_lipod: {
      name: "Tawong Lipod",
      spareDialogue: "Ah... you move with the wind's understanding. We once brought harmony to the Bikol lands, before the false god's lies. Accept this gift of swift movement and hidden sight.",
      killDialogue: "You cannot scatter what has no form! The wind remembers your violence, and it feeds the impostor's power!",
      spareReward: { 
        ginto: 80, 
        diamante: 1, 
        healthHealing: 20, 
        bonusEffect: "Wind's grace",
        relics: [RELIC_REGISTRY.getById("wind_veil")!],
        relicDropChance: 0.75
      },
      killReward: { 
        ginto: 120, 
        diamante: 2, 
        healthHealing: 0, 
        bonusEffect: "Air superiority",
        relics: [RELIC_REGISTRY.getById("wind_veil")!],
        relicDropChance: 0.75
      },
    },
    mangangaway: {
      name: "Mangangaway",
      spareDialogue: "Wise traveler... you see through my curses to the spirit beneath. I was once a healer, a protector of the people. Take this gift of protection against the false god's influence.",
      killDialogue: "My curses may end, but the shadow you serve grows stronger! Your power feeds the impostor's corruption!",
      spareReward: { 
        ginto: 150, 
        diamante: 3, 
        healthHealing: 30, 
        bonusEffect: "Hex protection",
        relics: [RELIC_REGISTRY.getById("mangangaway_wand")!],
        relicDropChance: 1.0
      },
      killReward: { 
        ginto: 200, 
        diamante: 5, 
        healthHealing: 0, 
        bonusEffect: "Curse mastery",
        relics: [RELIC_REGISTRY.getById("mangangaway_wand")!],
        relicDropChance: 1.0
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
   * Show Prologue-style dialogue at start of battle
   */
  public showBattleStartDialogue(): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Create semi-transparent overlay
    const overlay = this.scene.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(5000);
    
    // Create dialogue container positioned at center like Prologue
    const dialogueContainer = this.scene.add.container(screenWidth / 2, screenHeight / 2);
    
    // Double border design with Prologue colors
    const outerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8 + 8, 128, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 120, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 120, 0x150E10).setInteractive();
    
    // Create dialogue text with Prologue styling
    const dialogueText = this.scene.add.text(
      0,
      0,
      `A wild ${this.scene.getCombatState().enemy.name} appears!`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 22,
        color: "#77888C",
        align: "center",
        wordWrap: { width: screenWidth * 0.75 }
      }
    ).setOrigin(0.5);
    
    // Create continue indicator with Prologue styling
    const continueIndicator = this.scene.add.text(
      (screenWidth * 0.8)/2 - 40,
      (120)/2 - 20,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#77888C"
      }
    ).setOrigin(0.5).setVisible(true);
    
    dialogueContainer.add([outerBorder, innerBorder, bg, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(5001);
    
    // Create main container for all dialogue elements
    this.battleStartDialogueContainer = this.scene.add.container(0, 0, [
      overlay,
      dialogueContainer
    ]).setScrollFactor(0).setDepth(5000);
    
    // Prologue-style fade in animation
    dialogueContainer.setAlpha(0);
    this.scene.tweens.add({ 
      targets: dialogueContainer, 
      alpha: 1, 
      duration: 400, 
      ease: 'Power2' 
    });
    
    // Add blinking animation to the continue indicator (Prologue style)
    this.scene.tweens.add({ 
      targets: continueIndicator, 
      y: '+=8', 
      duration: 600, 
      yoyo: true, 
      repeat: -1, 
      ease: 'Sine.easeInOut' 
    });
    
    // Add click handler with Prologue-style transition
    bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: dialogueContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          if (this.battleStartDialogueContainer) {
            this.battleStartDialogueContainer.destroy();
            this.battleStartDialogueContainer = null;
            
            // Show enemy dialogue after player dialogue is removed
            this.scene.time.delayedCall(100, () => {
              this.showEnemyDialogue();
            });
          }
        }
      });
    });
  }

  /**
   * Show Prologue-style enemy dialogue at top of screen
   */
  public showEnemyDialogue(): void {
    const screenWidth = this.scene.cameras.main.width;
    
    // Create dialogue container positioned at top like a speech bubble
    const dialogueContainer = this.scene.add.container(screenWidth / 2, 120);
    
    const combatState = this.scene.getCombatState();
    const enemyName = combatState.enemy.name;
    const enemySpriteKey = this.getEnemySpriteKey(enemyName);
    
    // Double border design with Prologue colors (smaller for enemy dialogue)
    const outerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8 + 8, 108, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 100, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 100, 0x150E10).setInteractive();
    
    // Create enemy icon with combat sprite if available
    let enemyIcon: Phaser.GameObjects.Sprite | null = null;
    if (this.scene.textures.exists(enemySpriteKey)) {
      enemyIcon = this.scene.add.sprite(
        -(screenWidth * 0.8 / 2) + 35,
        0,
        enemySpriteKey
      ).setScale(0.8).setDepth(5002);
    }
    
    // Create enemy name text with Prologue styling
    const enemyNameText = this.scene.add.text(
      -(screenWidth * 0.8 / 2) + 70,
      -30,
      combatState.enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "left"
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Create enemy dialogue text with Prologue styling
    const enemyDialogueText = this.scene.add.text(
      -(screenWidth * 0.8 / 2) + 70,
      -5,
      this.getBattleStartDialogue(),
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
        align: "left",
        wordWrap: { width: screenWidth * 0.8 - 90 }
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Create continue indicator with Prologue styling
    const continueIndicator = this.scene.add.text(
      (screenWidth * 0.8)/2 - 40,
      (100)/2 - 20,
      "▼",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C"
      }
    ).setOrigin(0.5).setDepth(5002);
    
    const containerChildren = [
      outerBorder,
      innerBorder,
      bg,
      enemyIcon,
      enemyNameText,
      enemyDialogueText,
      continueIndicator
    ].filter(child => child !== null);

    dialogueContainer.add(containerChildren);
    dialogueContainer.setScrollFactor(0).setDepth(5000);
    
    // Prologue-style fade in animation
    dialogueContainer.setAlpha(0);
    this.scene.tweens.add({ 
      targets: dialogueContainer, 
      alpha: 1, 
      duration: 400, 
      ease: 'Power2' 
    });
    
    // Add Prologue-style blinking animation to the continue indicator
    this.scene.tweens.add({ 
      targets: continueIndicator, 
      y: '+=8', 
      duration: 600, 
      yoyo: true, 
      repeat: -1, 
      ease: 'Sine.easeInOut' 
    });
    
    // Add click handler with Prologue-style transition
    bg.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: dialogueContainer,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          dialogueContainer.destroy();
        }
      });
    });
  }

  /**
   * Get enemy-specific dialogue based on enemy type
   */
  private getEnemyDialogue(): string {
    const combatState = this.scene.getCombatState();
    const enemyKey = combatState.enemy.name.toLowerCase().replace(/\s+/g, '_');
    
    const dialogues: Record<string, string> = {
      tikbalang_scout: "Lost in my paths, seer? The false one's whispers guide you now!",
      balete_wraith: "These roots remember... before the corruption took hold...",
      sigbin_charger: "Your heart will feed the shadow throne!",
      duwende_trickster: "Tricks and trials await the unwary traveler!",
      tiyanak_ambusher: "Wails echo through these cursed woods... will you join them?",
      amomongo: "My claws hunger for those who threaten the mountain!",
      bungisngis: "Ha ha ha! Let's see if you can survive my mirth!",
      kapre_shade: "Smoke and shadows... the forest remembers its guardians!",
      tawong_lipod: "The winds carry whispers of your fate, mortal!",
      mangangaway: "My hexes shall twist your very essence!"
    };
    
    return dialogues[enemyKey] || "Face me, challenger!";
  }

  /**
   * Get battle start dialogue for specific enemies
   */
  private getBattleStartDialogue(): string {
    const combatState = this.scene.getCombatState();
    const enemyKey = combatState.enemy.name.toLowerCase().replace(/\s+/g, '_');
    
    const battleDialogues: Record<string, string> = {
      tikbalang_scout: "Beware, traveler! My hooves shall lead you astray, just as the false god's lies have twisted these sacred groves!",
      balete_wraith: "The roots... they whisper of a time before corruption. Now they only know the impostor's dark influence!",
      sigbin_charger: "Once we served Bathala with hearts of light! Now the shadow demands your essence!",
      duwende_trickster: "Fortunes change like the wind, mortal. The engkanto's web has caught even spirits like me!",
      tiyanak_ambusher: "Innocent cries mask twisted souls... the false god's corruption runs deep in these woods!",
      amomongo: "The mountains weep as their protectors fall to shadow! Will you free me, or join the darkness?",
      bungisngis: "My laughter once brought joy! Now it echoes with the impostor's malice!",
      kapre_shade: "In my tree I waited, guardian of paths true. Now only smoke and lies remain!",
      tawong_lipod: "We danced with the wind in harmony! The false god's whispers turned our grace to fury!",
      mangangaway: "My curses were once blessings... until the shadow twisted everything!"
    };
    
    return battleDialogues[enemyKey] || this.getEnemyDialogue();
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
   * Get enemy sprite key for dialogue display
   */
  public getEnemySpriteKey(enemyName: string): string {
    const lowerCaseName = enemyName.toLowerCase();
    
    // Map enemy names to combat sprite keys
    if (lowerCaseName.includes("tikbalang")) return "tikbalang_combat";
    if (lowerCaseName.includes("balete")) return "balete_combat";
    if (lowerCaseName.includes("sigbin")) return "sigbin_combat";
    if (lowerCaseName.includes("duwende")) return "duwende_combat";
    if (lowerCaseName.includes("tiyanak")) return "tiyanak_combat";
    if (lowerCaseName.includes("amomongo")) return "amomongo_combat";
    if (lowerCaseName.includes("bungisngis")) return "bungisngis_combat";
    if (lowerCaseName.includes("kapre")) return "kapre_combat";
    if (lowerCaseName.includes("tawong lipod") || lowerCaseName.includes("tawonglipod")) return "tawonglipod_combat";
    if (lowerCaseName.includes("mangangaway")) return "mangangaway_combat";
    
    // Fallback for any other case - use available combat sprites
    const spriteOptions = ["balete_combat", "sigbin_combat", "tikbalang_combat", "duwende_combat"];
    const randomIndex = Math.floor(Math.random() * spriteOptions.length);
    return spriteOptions[randomIndex];
  }
}

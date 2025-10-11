import { Scene } from "phaser";
import { Enemy } from "../../core/types/CombatTypes";

/**
 * EnemyDialogueManager
 * Handles all enemy dialogue presentations during combat
 * Displays Prologue-styled dialogue boxes with enemy information
 */
export class EnemyDialogueManager {
  private scene: Scene;
  private battleStartDialogueContainer: Phaser.GameObjects.Container | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Show initial battle start dialogue announcing the enemy
   * @param enemy - The enemy to display dialogue for
   * @param onComplete - Callback when dialogue is dismissed
   */
  public showBattleStartDialogue(enemy: Enemy, onComplete: () => void): void {
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
      `A wild ${enemy.name} appears!`,
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
            
            // Trigger completion callback
            onComplete();
          }
        }
      });
    });
  }

  /**
   * Show Prologue-style enemy dialogue at top of screen
   * @param enemy - The enemy to display dialogue for
   * @param enemySpriteKey - The sprite key for the enemy icon
   */
  public showEnemyDialogue(enemy: Enemy, enemySpriteKey: string): void {
    const screenWidth = this.scene.cameras.main.width;
    
    // Create dialogue container positioned at top like a speech bubble
    const dialogueContainer = this.scene.add.container(screenWidth / 2, 120);
    
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
      enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "left"
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Get the appropriate dialogue for this enemy
    const dialogueText = this.getBattleStartDialogue(enemy.name);
    
    // Create enemy dialogue text with Prologue styling
    const enemyDialogueText = this.scene.add.text(
      -(screenWidth * 0.8 / 2) + 70,
      -5,
      dialogueText,
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
   * Get short combat intro dialogue based on enemy type
   * @param enemyName - The name of the enemy
   * @returns The appropriate dialogue string
   */
  public getEnemyDialogue(enemyName: string): string {
    const name = enemyName.toLowerCase();
    
    if (name.includes("tikbalang")) return "Lost in my paths, seer? False one's whispers guide!";
    if (name.includes("balete")) return "Roots entwine your fate!";
    if (name.includes("sigbin")) return "Charge for shadow throne!";
    if (name.includes("duwende")) return "Tricks abound in mounds!";
    if (name.includes("tiyanak")) return "Wails lure to doom!";
    if (name.includes("amomongo")) return "Nails rend unworthy!";
    if (name.includes("bungisngis")) return "Laughter masks rage!";
    if (name.includes("kapre")) return "Smoke veils my wrath!";
    if (name.includes("tawong lipod")) return "Winds conceal—feel fury!";
    if (name.includes("mangangaway")) return "Fates reverse at my command!";
    
    // Default dialogue
    return "You have encountered a fearsome creature! Prepare for battle!";
  }

  /**
   * Get extended battle start dialogue for the enemy
   * @param enemyName - The name of the enemy
   * @returns The appropriate extended dialogue string
   */
  public getBattleStartDialogue(enemyName: string): string {
    const name = enemyName.toLowerCase();
    
    if (name.includes("tikbalang")) return "Hah! You dare enter my maze of paths? The false god's whispers have made me your obstacle, traveler. But your soul still seeks the light?";
    if (name.includes("balete")) return "Sacred roots that once blessed Bathala's children now bind your fate! The engkanto's corruption runs deep through my bark!";
    if (name.includes("sigbin")) return "I charge for the shadow throne! Once I served the divine, but now I serve the false god's dark purposes!";
    if (name.includes("duwende")) return "Tricks? Oh yes, tricks abound in mounds where the old magic sleeps! But which are blessing and which are curse?";
    if (name.includes("tiyanak")) return "My innocent wail lures you to doom! Once I was a babe, now I am a warning to the living!";
    if (name.includes("amomongo")) return "My claws rend the unworthy! The mountain remembers when I only defended its people from true threats!";
    if (name.includes("bungisngis")) return "Laughter masks the rage within! We were once merry giants, but the false god's corruption changed our song to a cackle of malice!";
    if (name.includes("kapre")) return "Smoke veils my wrath! From my sacred tree I once watched over the forest paths with honor, not malice!";
    if (name.includes("tawong lipod")) return "Winds conceal—feel fury! The invisible currents are my domain, and I bring the storm of retribution!";
    if (name.includes("mangangaway")) return "Fates reverse at my command! I was once a healer of the people, now I am their curse-bearer!";
    
    // Default dialogue
    return "You have encountered a fearsome creature! Prepare for battle!";
  }

  /**
   * Clean up dialogue manager resources
   */
  public destroy(): void {
    if (this.battleStartDialogueContainer) {
      this.battleStartDialogueContainer.destroy();
      this.battleStartDialogueContainer = null;
    }
  }
}

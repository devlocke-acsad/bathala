import { Scene } from "phaser";
import { EnemyEntity } from "../../core/entities/EnemyEntity";

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
  public showBattleStartDialogue(enemy: EnemyEntity, onComplete: () => void): void {
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
   */
  public showEnemyDialogue(enemy: EnemyEntity): void {
    const screenWidth = this.scene.cameras.main.width;
    
    // Create dialogue container positioned at top like a speech bubble
    const dialogueContainer = this.scene.add.container(screenWidth / 2, 120);
    
    // Double border design with Prologue colors (smaller for enemy dialogue)
    const outerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8 + 8, 108, undefined, 0).setStrokeStyle(2, 0x77888C);
    const innerBorder = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 100, undefined, 0).setStrokeStyle(2, 0x77888C);
    const bg = this.scene.add.rectangle(0, 0, screenWidth * 0.8, 100, 0x150E10).setInteractive();
    
    // Create enemy name text with Prologue styling
    const enemyNameText = this.scene.add.text(
      -(screenWidth * 0.8 / 2) + 20,
      -30,
      enemy.name,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#77888C",
        align: "left"
      }
    ).setOrigin(0, 0).setDepth(5002);
    
    // Get the appropriate dialogue from the enemy's config data
    const dialogueText = this.getBattleStartDialogue(enemy);
    
    // Create enemy dialogue text with Prologue styling
    const enemyDialogueText = this.scene.add.text(
      -(screenWidth * 0.8 / 2) + 20,
      -5,
      dialogueText,
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
        align: "left",
        wordWrap: { width: screenWidth * 0.8 - 40 }
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
      enemyNameText,
      enemyDialogueText,
      continueIndicator
    ];

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
    
    // Track if dialogue has been dismissed
    let dismissed = false;
    
    // Auto-fade after 3.5 seconds
    this.scene.time.delayedCall(3500, () => {
      if (!dismissed) {
        dismissed = true;
        this.scene.tweens.add({
          targets: dialogueContainer,
          alpha: 0,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            dialogueContainer.destroy();
          }
        });
      }
    });
    
    // Add click handler for manual dismissal
    bg.on('pointerdown', () => {
      if (!dismissed) {
        dismissed = true;
        this.scene.tweens.add({
          targets: dialogueContainer,
          alpha: 0,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
            dialogueContainer.destroy();
          }
        });
      }
    });
  }

  /**
   * Get short combat intro dialogue from the EnemyEntity's config.
   * Falls back to a generic line if no dialogue is defined.
   * @param enemy - The EnemyEntity instance
   * @returns The appropriate dialogue string
   */
  public getEnemyDialogue(enemy: EnemyEntity): string {
    return enemy.dialogue?.intro || "You have encountered a fearsome creature! Prepare for battle!";
  }

  /**
   * Get extended battle start dialogue from the EnemyEntity's config.
   * Uses the intro dialogue — for a longer variant, creature configs can
   * be extended with an `introExtended` field in the future.
   * @param enemy - The EnemyEntity instance
   * @returns The appropriate extended dialogue string
   */
  public getBattleStartDialogue(enemy: EnemyEntity): string {
    return enemy.dialogue?.intro || "You have encountered a fearsome creature! Prepare for battle!";
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

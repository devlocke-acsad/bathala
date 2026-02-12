import { Scene } from 'phaser';
import { GameState } from '../../../core/managers/GameState';
import { Chapter } from '../../../core/types/CombatTypes';
import { EnemyRegistry } from '../../../core/registries/EnemyRegistry';
import { bootstrapEnemies } from '../../../data/enemies/EnemyBootstrap';

/**
 * Combat Debug Scene
 * Allows testing combat with any enemy
 * Access with F3 key from MainMenu or Overworld
 */
export class CombatDebugScene extends Scene {
  private enemyList: Array<{ name: string; key: string }> = [];
  private selectedEnemyIndex: number = 0;
  private isVisible: boolean = false;
  private container!: Phaser.GameObjects.Container;
  private gameState: GameState;

  constructor() {
    super({ key: 'CombatDebugScene' });
    this.gameState = GameState.getInstance();
  }

  create(): void {
    bootstrapEnemies();

    // Build enemy list based on current chapter
    this.updateEnemyListForChapter(this.gameState.getCurrentChapter());

    this.createDebugUI();
    this.setupKeyboardShortcuts();
    
    // Start hidden
    this.container.setVisible(false);
    this.isVisible = false;
  }

  /**
   * Update enemy list based on the current chapter
   */
  private updateEnemyListForChapter(chapter: Chapter): void {
    switch (chapter) {
      case 1:
        this.enemyList = [
          { name: 'Tikbalang Scout', key: 'Tikbalang Scout' },
          { name: 'Balete Wraith', key: 'Balete Wraith' },
          { name: 'Sigbin Charger', key: 'Sigbin Charger' },
          { name: 'Duwende Trickster', key: 'Duwende Trickster' },
          { name: 'Tiyanak Ambusher', key: 'Tiyanak Ambusher' },
          { name: 'Amomongo', key: 'Amomongo' },
          { name: 'Bungisngis', key: 'Bungisngis' },
          { name: 'Kapre Shade (Elite)', key: 'Kapre Shade' },
          { name: 'Tawong Lipod (Elite)', key: 'Tawong Lipod' },
          { name: 'Mangangaway (Boss)', key: 'Mangangaway' },
        ];
        break;
      case 2:
        this.enemyList = [
          { name: 'Sirena Illusionist', key: 'Sirena Illusionist' },
          { name: 'Siyokoy Raider', key: 'Siyokoy Raider' },
          { name: 'Santelmo Flicker', key: 'Santelmo Flicker' },
          { name: 'Berberoka Lurker', key: 'Berberoka Lurker' },
          { name: 'Magindara Swarm', key: 'Magindara Swarm' },
          { name: 'Kataw', key: 'Kataw' },
          { name: 'Berbalang', key: 'Berbalang' },
          { name: 'Sunken Bangkilan (Elite)', key: 'Sunken Bangkilan' },
          { name: 'Apoy-Tubig Fury (Elite)', key: 'Apoy-Tubig Fury' },
          { name: 'Bakunawa (Boss)', key: 'Bakunawa' },
        ];
        break;
      case 3:
        this.enemyList = [
          { name: 'Tigmamanukan Watcher', key: 'Tigmamanukan Watcher' },
          { name: 'Diwata Sentinel', key: 'Diwata Sentinel' },
          { name: 'Sarimanok Keeper', key: 'Sarimanok Keeper' },
          { name: 'Bulalakaw Flamewings', key: 'Bulalakaw Flamewings' },
          { name: 'Minokawa Harbinger', key: 'Minokawa Harbinger' },
          { name: 'Alan', key: 'Alan' },
          { name: 'Ekek', key: 'Ekek' },
          { name: 'Ribung Linti Duo (Elite)', key: 'Ribung Linti Duo' },
          { name: 'Apolaki Godling (Elite)', key: 'Apolaki Godling' },
          { name: 'False Bathala (Boss)', key: 'False Bathala' },
        ];
        break;
    }
    this.selectedEnemyIndex = 0;
  }

  private createDebugUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create container for all debug UI
    this.container = this.add.container(0, 0);
    this.container.setDepth(10000); // Always on top

    // Semi-transparent background
    const bg = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000,
      0.85
    );
    this.container.add(bg);

    // Title
    const currentChapter = this.gameState.getCurrentChapter();
    const title = this.add.text(
      screenWidth / 2, 
      50, 
      `COMBAT DEBUG - Chapter ${currentChapter} - Select Enemy`, 
      {
        fontFamily: 'dungeon-mode',
        fontSize: 32,
        color: '#ffd93d',
        align: 'center',
      }
    ).setOrigin(0.5);
    this.container.add(title);

    // Instructions
    const instructions = this.add.text(
      screenWidth / 2,
      100,
      'F3: Toggle | ↑↓: Select | ENTER: Fight | ESC: Close',
      {
        fontFamily: 'dungeon-mode',
        fontSize: 16,
        color: '#77888C',
        align: 'center',
      }
    ).setOrigin(0.5);
    this.container.add(instructions);

    // Chapter navigation buttons
    this.createChapterNavigationButtons();

    // Enemy list
    this.updateEnemyList();
  }

  /**
   * Create chapter navigation buttons for dev mode
   */
  private createChapterNavigationButtons(): void {
    const screenWidth = this.cameras.main.width;
    const buttonY = 140;
    const buttonSpacing = 180;
    const startX = screenWidth / 2 - buttonSpacing;

    const chapters: Chapter[] = [1, 2, 3];
    const chapterNames = ['Forest', 'Submerged', 'Skyward'];
    const currentChapter = this.gameState.getCurrentChapter();

    chapters.forEach((chapter, index) => {
      const x = startX + index * buttonSpacing;
      const isCurrentChapter = chapter === currentChapter;

      // Button background
      const buttonBg = this.add.rectangle(
        x,
        buttonY,
        160,
        40,
        isCurrentChapter ? 0x2ed573 : 0x3d5a80,
        isCurrentChapter ? 0.5 : 0.3
      );
      buttonBg.setInteractive({ useHandCursor: true });
      this.container.add(buttonBg);

      // Button text
      const buttonText = this.add.text(
        x,
        buttonY,
        `Ch ${chapter}: ${chapterNames[index]}`,
        {
          fontFamily: 'dungeon-mode',
          fontSize: 16,
          color: isCurrentChapter ? '#2ed573' : '#e8eced',
          align: 'center',
        }
      ).setOrigin(0.5);
      this.container.add(buttonText);

      // Button interactions
      buttonBg.on('pointerdown', () => {
        this.jumpToChapter(chapter);
      });

      buttonBg.on('pointerover', () => {
        buttonBg.setFillStyle(isCurrentChapter ? 0x2ed573 : 0x5a7fa8, 0.6);
        buttonText.setColor('#ffffff');
      });

      buttonBg.on('pointerout', () => {
        buttonBg.setFillStyle(isCurrentChapter ? 0x2ed573 : 0x3d5a80, isCurrentChapter ? 0.5 : 0.3);
        buttonText.setColor(isCurrentChapter ? '#2ed573' : '#e8eced');
      });
    });
  }

  /**
   * Jump to a specific chapter (dev mode only)
   */
  private jumpToChapter(chapter: Chapter): void {
    console.log(`Jumping to Chapter ${chapter}`);
    
    // Update game state
    this.gameState.setCurrentChapter(chapter);
    
    // Update enemy list for the new chapter
    this.updateEnemyListForChapter(chapter);
    
    // Recreate the entire UI to reflect the new chapter
    this.recreateDebugUI();
  }

  /**
   * Recreate the debug UI (used when switching chapters)
   */
  private recreateDebugUI(): void {
    // Clear the container
    this.container.removeAll(true);
    
    // Recreate the UI
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Semi-transparent background
    const bg = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000,
      0.85
    );
    this.container.add(bg);

    // Title
    const currentChapter = this.gameState.getCurrentChapter();
    const title = this.add.text(
      screenWidth / 2, 
      50, 
      `COMBAT DEBUG - Chapter ${currentChapter} - Select Enemy`, 
      {
        fontFamily: 'dungeon-mode',
        fontSize: 32,
        color: '#ffd93d',
        align: 'center',
      }
    ).setOrigin(0.5);
    this.container.add(title);

    // Instructions
    const instructions = this.add.text(
      screenWidth / 2,
      100,
      'F3: Toggle | ↑↓: Select | ENTER: Fight | ESC: Close',
      {
        fontFamily: 'dungeon-mode',
        fontSize: 16,
        color: '#77888C',
        align: 'center',
      }
    ).setOrigin(0.5);
    this.container.add(instructions);

    // Chapter navigation buttons
    this.createChapterNavigationButtons();

    // Enemy list
    this.updateEnemyList();
  }

  private updateEnemyList(): void {
    const screenWidth = this.cameras.main.width;
    const startY = 200;
    const spacing = 50;

    // Remove old enemy list items (keep bg, title, instructions, and chapter buttons)
    // Chapter buttons are 3 buttons × 2 elements each (bg + text) = 6 elements
    // Plus bg (1) + title (1) + instructions (1) = 9 total to keep
    while (this.container.length > 9) {
      const item = this.container.list[9];
      this.container.remove(item, true);
    }

    // Add enemy list items
    this.enemyList.forEach((enemy, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedEnemyIndex;

      // Background for selected item
      if (isSelected) {
        const selectionBg = this.add.rectangle(
          screenWidth / 2,
          y,
          600,
          40,
          0x2ed573,
          0.3
        );
        this.container.add(selectionBg);
      }

      // Enemy name
      const text = this.add.text(
        screenWidth / 2,
        y,
        `${isSelected ? '► ' : '  '}${enemy.name}`,
        {
          fontFamily: 'dungeon-mode',
          fontSize: 20,
          color: isSelected ? '#2ed573' : '#e8eced',
          align: 'center',
        }
      ).setOrigin(0.5);
      this.container.add(text);

      // Make clickable
      text.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.selectedEnemyIndex = index;
        this.startCombatWithEnemy(enemy.key);
      });

      text.on('pointerover', () => {
        this.selectedEnemyIndex = index;
        this.updateEnemyList();
      });
    });

    // Show enemy details
    if (this.selectedEnemyIndex >= 0 && this.selectedEnemyIndex < this.enemyList.length) {
      const selectedEnemy = this.enemyList[this.selectedEnemyIndex];
      const enemyData = this.getEnemyData(selectedEnemy.key);
      
      if (enemyData) {
        const detailsY = startY + this.enemyList.length * spacing + 50;
        
        const details = this.add.text(
          screenWidth / 2,
          detailsY,
          `HP: ${enemyData.maxHealth} | DMG: ${enemyData.damage}\n` +
          `Pattern: ${enemyData.attackPattern.join(' → ')}\n` +
          `Weak to: ${enemyData.elementalAffinity.weakness || 'None'} | ` +
          `Resists: ${enemyData.elementalAffinity.resistance || 'None'}`,
          {
            fontFamily: 'dungeon-mode',
            fontSize: 14,
            color: '#77888C',
            align: 'center',
          }
        ).setOrigin(0.5);
        this.container.add(details);
      }
    }
  }

  private getEnemyData(enemyKey: string): any {
    return EnemyRegistry.resolve(enemyKey) ?? null;
  }

  private setupKeyboardShortcuts(): void {
    // F3 to toggle debug screen
    this.input.keyboard?.on('keydown-F3', () => {
      this.toggleVisibility();
    });

    // ESC to close
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.isVisible) {
        this.toggleVisibility();
      }
    });

    // Arrow keys to navigate
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.isVisible) {
        this.selectedEnemyIndex = Math.max(0, this.selectedEnemyIndex - 1);
        this.updateEnemyList();
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.isVisible) {
        this.selectedEnemyIndex = Math.min(
          this.enemyList.length - 1,
          this.selectedEnemyIndex + 1
        );
        this.updateEnemyList();
      }
    });

    // Enter to start combat
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.isVisible && this.selectedEnemyIndex >= 0) {
        const enemy = this.enemyList[this.selectedEnemyIndex];
        this.startCombatWithEnemy(enemy.key);
      }
    });
  }

  private toggleVisibility(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
    
    if (this.isVisible) {
      this.updateEnemyList();
    }
  }

  /**
   * Public method to show the debug scene
   */
  public show(): void {
    if (!this.container) {
      console.error('CombatDebugScene: Container not initialized yet');
      return;
    }
    this.isVisible = true;
    this.container.setVisible(true);
    this.updateEnemyList();
  }

  /**
   * Public method to hide the debug scene
   */
  public hide(): void {
    if (!this.container) return;
    this.isVisible = false;
    this.container.setVisible(false);
  }

  private startCombatWithEnemy(enemyKey: string): void {
    console.log(`Starting combat with: ${enemyKey}`);
    
    // Hide debug UI
    this.toggleVisibility();
    
    // Stop current scene if it's running
    const currentScene = this.scene.manager.getScene('MainMenu') || 
                        this.scene.manager.getScene('Overworld');
    
    if (currentScene && currentScene.scene.isActive()) {
      currentScene.scene.pause();
    }
    
    // Start combat scene with selected enemy
    this.scene.start('Combat', {
      nodeType: 'common',
      enemyId: enemyKey,
    });
  }

  update(): void {
    // Keep debug scene running in background
  }
}

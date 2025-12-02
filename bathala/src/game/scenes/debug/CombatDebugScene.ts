import { Scene } from 'phaser';
import * as Act1Enemies from '../../../data/enemies/Act1Enemies';

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

  constructor() {
    super({ key: 'CombatDebugScene' });
  }

  create(): void {
    // Build enemy list from Act1Enemies
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

    this.createDebugUI();
    this.setupKeyboardShortcuts();
    
    // Start hidden
    this.container.setVisible(false);
    this.isVisible = false;
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
    const title = this.add.text(screenWidth / 2, 50, 'COMBAT DEBUG - Select Enemy', {
      fontFamily: 'dungeon-mode',
      fontSize: 32,
      color: '#ffd93d',
      align: 'center',
    }).setOrigin(0.5);
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

    // Enemy list
    this.updateEnemyList();
  }

  private updateEnemyList(): void {
    const screenWidth = this.cameras.main.width;
    const startY = 180;
    const spacing = 50;

    // Remove old enemy list items (keep bg, title, instructions)
    while (this.container.length > 3) {
      const item = this.container.list[3];
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
    // Map enemy keys to Act1Enemies exports
    const enemyMap: Record<string, any> = {
      'Tikbalang Scout': Act1Enemies.TIKBALANG_SCOUT,
      'Balete Wraith': Act1Enemies.BALETE_WRAITH,
      'Sigbin Charger': Act1Enemies.SIGBIN_CHARGER,
      'Duwende Trickster': Act1Enemies.DUWENDE_TRICKSTER,
      'Tiyanak Ambusher': Act1Enemies.TIYANAK_AMBUSHER,
      'Amomongo': Act1Enemies.AMOMONGO,
      'Bungisngis': Act1Enemies.BUNGISNGIS,
      'Kapre Shade': Act1Enemies.KAPRE_SHADE,
      'Tawong Lipod': Act1Enemies.TAWONG_LIPOD,
      'Mangangaway': Act1Enemies.MANGNANGAWAY,
    };

    return enemyMap[enemyKey];
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

import { Scene } from 'phaser';
import { EducationalEvent } from '../../../data/events/EventTypes';
import { Act1EducationalEvents } from '../../../data/events/Act1EducationalEvents';
import { Act2EducationalEvents } from '../../../data/events/Act2EducationalEvents';
import { Act3EducationalEvents } from '../../../data/events/Act3EducationalEvents';
import { EducationalEventPresenter } from '../../../core/managers/EducationalEventPresenter';
import { GameState } from '../../../core/managers/GameState';

/**
 * Educational Events Debug Scene
 * Allows viewing and testing all educational events
 * Access with F4 key
 */
export class EducationalEventsDebugScene extends Scene {
  private eventList: EducationalEvent[] = [];
  private selectedEventIndex: number = 0;
  private isVisible: boolean = false;
  private container!: Phaser.GameObjects.Container;
  private currentAct: number = 1;

  constructor() {
    super({ key: 'EducationalEventsDebugScene' });
  }

  create(): void {
    this.updateEventListForAct(this.currentAct);
    this.createDebugUI();
    this.setupKeyboardShortcuts();
    
    // Start hidden
    this.container.setVisible(false);
    this.isVisible = false;
  }

  private updateEventListForAct(act: number): void {
    switch (act) {
      case 1: this.eventList = Act1EducationalEvents; break;
      case 2: this.eventList = Act2EducationalEvents; break;
      case 3: this.eventList = Act3EducationalEvents; break;
      default: this.eventList = []; break;
    }
    this.selectedEventIndex = 0;
  }

  private createDebugUI(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.container = this.add.container(0, 0);
    this.container.setDepth(10001); // Higher than combat debug

    // BG
    const bg = this.add.rectangle(
      screenWidth / 2, screenHeight / 2,
      screenWidth, screenHeight,
      0x000000, 0.90
    );
    this.container.add(bg);

    // Title
    const title = this.add.text(
      screenWidth / 2, 50, 
      `EDUCATIONAL EVENTS DEBUG - Act ${this.currentAct}`, 
      { fontFamily: 'dungeon-mode', fontSize: 32, color: '#ffd93d', align: 'center' }
    ).setOrigin(0.5);
    this.container.add(title);

    // Instructions
    this.addInstructionText(screenWidth, 100, 'F4: Toggle | 1-3: Acts | ↑↓: Select | ENTER: View Details');

    // Act Buttons (Simple visuals)
    this.createActButtons();

    // Event List
    this.updateEventListUI();
  }

  private addInstructionText(w: number, y: number, text: string): void {
    const t = this.add.text(w/2, y, text, {
        fontFamily: 'dungeon-mode', fontSize: 16, color: '#77888C', align: 'center'
    }).setOrigin(0.5);
    this.container.add(t);
  }

  private createActButtons(): void {
      const screenWidth = this.cameras.main.width;
      const buttonY = 50;
      const buttonSpacing = 80;
      const startX = screenWidth / 2 + 250; // Right of title

      [1, 2, 3].forEach(act => {
          const x = startX + (act - 1) * buttonSpacing;
          const bg = this.add.rectangle(x, buttonY, 60, 40, act === this.currentAct ? 0x2ed573 : 0x333333).setInteractive();
          const text = this.add.text(x, buttonY, `Act ${act}`, { fontSize: 16, color: '#ffffff' }).setOrigin(0.5);
          
          this.container.add([bg, text]);

          bg.on('pointerdown', () => this.switchAct(act));
      });
  }

  private launchEventScene(event: EducationalEvent): void {
      console.log(`Launching Event Scene for: ${event.name}`);
      
      // Close debug UI
      this.toggleVisibility();

      // Launch Scene
      const playerData = GameState.getInstance().getPlayerData();
      
      // Tag event source for return
      (event as any)._debugSource = true;

      this.scene.start('EventScene', { 
          player: playerData || { name: 'Debugger', health: 100, ginto: 100 },
          event: event
      });
  }

  private updateEventListUI(): void {
    // Clear old list items (simple approach: remove all non-static, but here we rebuild or refresh)
    // For simplicity, I'll remove items tagged as 'list-item' if I tracked them.
    // Instead, let's just clear the container subset or keep static refs.
    // I'll rebuild the dynamic part.
    
    // Hack: filter children by type? No.
    // Let's just redraw the whole container content list part.
    // Removing items from index 3 onwards (BG, Title, Instr).
    while (this.container.length > 3) {
        this.container.remove(this.container.list[3], true);
    }

    const startY = 150;
    const spacing = 35;
    const screenWidth = this.cameras.main.width;

    this.eventList.forEach((event, index) => {
        const y = startY + index * spacing;
        const isSelected = index === this.selectedEventIndex;

        const text = this.add.text(
            screenWidth / 2, y,
            `${isSelected ? '► ' : '  '}${event.name}`,
            {
                fontFamily: 'dungeon-mode',
                fontSize: 20,
                color: isSelected ? '#2ed573' : '#e8eced'
            }
        ).setOrigin(0.5);
        
        text.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.selectEvent(index));
            
        this.container.add(text);
    });

    // Preview
    this.showEventPreview();
  }

  private showEventPreview(): void {
      if (!this.eventList[this.selectedEventIndex]) return;

      const event = this.eventList[this.selectedEventIndex];
      const screenWidth = this.cameras.main.width;
      const screenHeight = this.cameras.main.height;
      
      const previewY = screenHeight * 0.6;
      
      // Divider
      this.container.add(this.add.rectangle(screenWidth/2, previewY - 20, screenWidth * 0.8, 2, 0x444444));

      // Use Presenter logic
      const contextDisplay = EducationalEventPresenter.getCulturalContextDisplay(event);
      let contextStr = contextDisplay.map(c => `${c.title}: ${c.content}`).join('\n');
      
      const valuesStr = EducationalEventPresenter.getValuesLessonDisplay(event);
      const refsStr = EducationalEventPresenter.formatReferences(event.academicReferences);

      const detailsText = this.add.text(
          screenWidth / 2, previewY,
          `SUMMARY\n${event.description[0]}...\n\nCONTEXT\n${contextStr}\n\nVALUES\n${valuesStr}\n\nREFS\n${refsStr}`,
          {
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#aaaaaa',
              align: 'left',
              wordWrap: { width: screenWidth * 0.8 }
          }
      ).setOrigin(0.5, 0);
      
      this.container.add(detailsText);

      // Play Button - Launches Real EventScene
      const playBtnX = screenWidth * 0.9;
      const playBtnY = previewY;
      const playBtnBg = this.add.rectangle(playBtnX, playBtnY, 120, 40, 0xffa726).setInteractive({ useHandCursor: true });
      const playBtnText = this.add.text(playBtnX, playBtnY, "PLAY SCENE", { 
          fontFamily: 'dungeon-mode', fontSize: 16, color: '#000000' 
      }).setOrigin(0.5);
      
      this.container.add([playBtnBg, playBtnText]);
      
      playBtnBg.on('pointerdown', () => this.launchEventScene(event));
      playBtnBg.on('pointerover', () => playBtnBg.setFillStyle(0xffd180));
      playBtnBg.on('pointerout', () => playBtnBg.setFillStyle(0xffa726));


      // Choices Simulation Area
      if (event.choices && event.choices.length > 0) {
          const choicesY = previewY + detailsText.height + 20;

          // Choice Label
          const choiceLabel = this.add.text(
              screenWidth * 0.1, choicesY,
              "CHOICES (Click to Simulate):",
              { fontFamily: 'monospace', fontSize: 14, color: '#ffd93d' }
          );
          this.container.add(choiceLabel);

          event.choices.forEach((choice, i) => {
              const choiceText = this.add.text(
                  screenWidth * 0.1, choicesY + 25 + (i * 30),
                  `[${i+1}] ${choice.text}`,
                  { fontFamily: 'monospace', fontSize: 12, color: '#2ed573', backgroundColor: '#333333' }
              )
              .setPadding(5)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => this.simulateChoice(choice, i))
              .on('pointerover', function() { (this as unknown as Phaser.GameObjects.Text).setStyle({ color: '#ffffff' }); })
              .on('pointerout', function() { (this as unknown as Phaser.GameObjects.Text).setStyle({ color: '#2ed573' }); });

              this.container.add(choiceText);
          });
      }
  }

  private simulateChoice(choice: any, index: number): void {
      console.log(`Simulating choice ${index}: ${choice.text}`);
      
      // Mock Context
      const playerData = GameState.getInstance().getPlayerData();
      const mockPlayer = playerData || { 
          // Minimal mock player if null
          id: 'debug', name: 'Debug Player', 
          educationalProgress: { valuesLearned: {}, regionsEncountered: {}, culturalKnowledgeScore: 0, achievements: [] },
          ginto: 0, health: 100
      };

      const mockContext = {
          player: mockPlayer,
          eventScene: undefined 
      };

      try {
          // Execute outcome
          const result = choice.outcome(mockContext);
          
          // Display result
          this.showSimulationResult(result);
      } catch (e) {
          console.error("Simulation Error:", e);
          this.showSimulationResult(`ERROR: ${(e as Error).message}`);
      }
  }

  private showSimulationResult(result: string | any): void {
      // Create a popup or text area for result
      const screenWidth = this.cameras.main.width;
      const screenHeight = this.cameras.main.height;
      
      // Remove old result if exists (simple way: tag it name='resultPopup' if Phaser allowed, 
      // but here we just push to container and maybe auto-fade or clear on next view)
      
      // Clean previous popups from container
      // (This is rudimentary, assumes we only add one set of popup elements or we track them.
      //  For speed, I'll just add a temporary overlapping box).
      
      const popupBg = this.add.rectangle(screenWidth/2, screenHeight/2, 600, 200, 0x000000, 0.95);
      popupBg.setStrokeStyle(2, 0x2ed573);
      
      const popupText = this.add.text(screenWidth/2, screenHeight/2, `OUTCOME:\n\n${result}`, {
          fontFamily: 'dungeon-mode',
          fontSize: 16,
          color: '#ffffff',
          align: 'center',
          wordWrap: { width: 550 }
      }).setOrigin(0.5);
      
      const closeCta = this.add.text(screenWidth/2, screenHeight/2 + 80, "[CLICK TO CLOSE]", {
          fontSize: 12, color: '#aaaaaa'
      }).setOrigin(0.5);

      const items = [popupBg, popupText, closeCta];
      items.forEach(i => {
           i.setDepth(20000); // Top
           this.container.add(i);
      });

      // Close on click
      popupBg.setInteractive();
      popupBg.on('pointerdown', () => {
          items.forEach(i => {
              this.container.remove(i);
              i.destroy();
          });
      });
  }

  private selectEvent(index: number): void {
      this.selectedEventIndex = index;
      this.updateEventListUI();
  }

  private setupKeyboardShortcuts(): void {
      this.input.keyboard?.on('keydown-F4', () => this.toggleVisibility());
      
      this.input.keyboard?.on('keydown-ONE', () => this.switchAct(1));
      this.input.keyboard?.on('keydown-TWO', () => this.switchAct(2));
      this.input.keyboard?.on('keydown-THREE', () => this.switchAct(3));

      this.input.keyboard?.on('keydown-UP', () => {
          if (this.isVisible) {
              this.selectedEventIndex = Math.max(0, this.selectedEventIndex - 1);
              this.updateEventListUI();
          }
      });
      this.input.keyboard?.on('keydown-DOWN', () => {
          if (this.isVisible) {
              this.selectedEventIndex = Math.min(this.eventList.length - 1, this.selectedEventIndex + 1);
              this.updateEventListUI();
          }
      });
  }

  private switchAct(act: number): void {
      if (!this.isVisible) return;
      this.currentAct = act;
      
      // Update Title
      const title = this.container.list[1] as Phaser.GameObjects.Text;
      if (title) title.setText(`EDUCATIONAL EVENTS DEBUG - Act ${this.currentAct}`);

      this.updateEventListForAct(act);
      this.updateEventListUI();
  }

  public toggleVisibility(): void {
      if (!this.container) return; // Prevent crash if called before create()
      this.isVisible = !this.isVisible;
      this.container.setVisible(this.isVisible);
      if (this.isVisible) {
          this.updateEventListUI();
      }
  }
}

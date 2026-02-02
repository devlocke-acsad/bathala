
import { Scene } from 'phaser';
import { GameState } from '../../core/managers/GameState';
import { Player } from '../../core/types/CombatTypes';
import { GameEvent, EventChoice, EventContext, EducationalEvent } from '../../data/events/EventTypes';
import { CombinedAct1Events } from '../../data/events';
import { OverworldGameState } from '../../core/managers/OverworldGameState';
import { MusicManager } from '../../core/managers/MusicManager';
import { EducationalEventManager } from '../../core/managers/EducationalEventManager';

export class EventScene extends Scene {
  private player!: Player;
  private currentEvent!: GameEvent | EducationalEvent;
  private descriptionText!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private eventBackground!: Phaser.GameObjects.Graphics;
  private descriptionContainer!: Phaser.GameObjects.Container;
  private resultText?: Phaser.GameObjects.Text;
  private continueButton?: Phaser.GameObjects.Container;
  private currentDescriptionIndex: number = 0;
  private typingTimer?: Phaser.Time.TimerEvent;
  private illustration!: Phaser.GameObjects.Graphics;
  private continueIndicator!: Phaser.GameObjects.Text;
  private music?: Phaser.Sound.BaseSound;


  constructor() {
    super({ key: 'EventScene' });
  }

  init(data: { player: Player, event?: GameEvent | EducationalEvent }) {
    this.player = data.player;
    if (data.event) {
        // Use injected event (Debug/Specific)
        this.currentEvent = data.event;
    } else {
        // Fallback to random Act 1 event (Normal Gameplay loop if not specified)
        const availableEvents = CombinedAct1Events;
        this.currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    }
  }

  create() {
    console.log("🎵 ========== EventScene create() START ==========");
    
    this.startMusic();
    this.setupMusicLifecycle();

    this.createBackground();
    this.createEventDisplay();
    this.createIllustration();
    this.createDescription();
    this.createContinueIndicator();
    this.startEvent();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    this.eventBackground = this.add.graphics();
    this.eventBackground.fillStyle(0x000000, 0.7);  // Match combat overlay opacity
    this.eventBackground.fillRect(0, 0, width, height);
  }

  /**
   * Start the scene's music track
   */
  private startMusic(): void {
    const musicManager = MusicManager.getInstance();
    const musicConfig = musicManager.getMusicKeyForScene(this.scene.key);
    
    if (!musicConfig) {
      console.warn(`🎵 EventScene: No music configured for scene "${this.scene.key}"`);
      return;
    }

    const effectiveVolume = musicManager.getEffectiveMusicVolume();
    const configVolume = musicConfig.volume;
    const finalVolume = effectiveVolume * configVolume;

    console.log(`🎵 EventScene: Starting music "${musicConfig.musicKey}" at volume ${finalVolume.toFixed(2)}`);

    this.music = this.sound.add(musicConfig.musicKey, {
      volume: finalVolume,
      loop: true
    });

    this.music.play();
  }

  /**
   * Setup automatic music lifecycle management
   * - Stops music when scene is paused (scene.launch)
   * - Restarts music when scene is resumed
   * - Stops music when scene is shut down (scene.start/stop)
   */
  private setupMusicLifecycle(): void {
    // Stop music when scene is paused (scene.launch from another scene)
    this.events.on('pause', () => {
      if (this.music) {
        console.log(`🎵 ========== SCENE PAUSE: EventScene → Stopping music ==========`);
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
    });

    // Restart music when scene is resumed (return from launched scene)
    this.events.on('resume', () => {
      console.log(`🎵 ========== SCENE RESUME: EventScene → Restarting music ==========`);
      this.startMusic();
    });

    // Stop music when scene is shut down (scene.start or scene.stop)
    this.events.on('shutdown', () => {
      if (this.music) {
        console.log(`🎵 ========== SCENE SHUTDOWN: EventScene → Stopping music ==========`);
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
    });
  }

  private createEventDisplay(): void {
    const { width, height } = this.cameras.main;

    const panelWidth = width * 0.8;
    const panelHeight = height * 0.8;
    const panelX = width / 2;
    const panelY = height / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x150E10, 0.95);  // Match combat/menu background color
    panel.lineStyle(3, 0x77888C, 1);  // Match combat/menu border color and thickness
    panel.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 15);
    panel.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 15);

    this.add.text(panelX, panelY - panelHeight / 2 + 40, this.currentEvent.name, {
      fontFamily: 'dungeon-mode',
      fontSize: '36px',
      color: '#77888C',  // Match combat/menu primary text color
      align: 'center'
    }).setOrigin(0.5);
  }

  private createIllustration(): void {
    const { width, height } = this.cameras.main;
    const panelHeight = height * 0.8;
    const illustrationWidth = 300;
    const illustrationHeight = 200;
    const panelX = width / 2;
    const panelY = height / 2;

    this.illustration = this.add.graphics();
    this.illustration.fillStyle(0x1f1410, 1);  // Match combat hover color for consistency
    this.illustration.lineStyle(2, 0x77888C, 0.8);  // Add border to match UI style
    this.illustration.fillRect(panelX - illustrationWidth / 2, panelY - panelHeight / 2 + 100, illustrationWidth, illustrationHeight);
    this.illustration.strokeRect(panelX - illustrationWidth / 2, panelY - panelHeight / 2 + 100, illustrationWidth, illustrationHeight);
  }


  private createDescription(): void {
    const { width, height } = this.cameras.main;
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.8;

    // Position description text better within the panel - below the illustration
    const descriptionY = height / 2 - panelHeight / 2 + 350; // Below illustration area

    this.descriptionContainer = this.add.container(width / 2, descriptionY);

    this.descriptionText = this.add.text(0, 0, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '22px',  // Slightly reduced for better fit
      color: '#e8eced',  // Match combat description text color
      wordWrap: { width: panelWidth - 120 },  // More padding for readability
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    this.descriptionContainer.add(this.descriptionText);
  }

  private createContinueIndicator(): void {
    const { width, height } = this.cameras.main;
    this.continueIndicator = this.add.text(width / 2, height - 100, '▼', {
        fontFamily: 'dungeon-mode',
        fontSize: '24px',
        color: '#77888C'  // Match primary text color
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
        targets: this.continueIndicator,
        alpha: 0,
        duration: 500,
        ease: 'Power1',
        yoyo: true,
        repeat: -1
    });
  }

  private startEvent(): void {
    this.showNextDescription();
  }

  private showNextDescription(): void {
    this.continueIndicator.setVisible(false);
    if (this.currentDescriptionIndex < this.currentEvent.description.length) {
      this.typeDescription(this.currentEvent.description[this.currentDescriptionIndex]);
    } else {
      this.showChoices();
    }
  }

  private typeDescription(text: string): void {
    this.descriptionText.setText('');
    let index = 0;

    this.typingTimer = this.time.addEvent({
      delay: 50, // Slower typing speed
      callback: () => {
        this.descriptionText.setText(this.descriptionText.text + text[index]);
        index++;
        if (index === text.length) {
          this.typingTimer?.remove();
          this.continueIndicator.setVisible(true);
          this.input.once('pointerdown', () => {
            this.currentDescriptionIndex++;
            this.showNextDescription();
          });
        }
      },
      repeat: text.length - 1
    });

    this.input.once('pointerdown', () => {
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.descriptionText.setText(text);
            this.continueIndicator.setVisible(true);
            this.input.once('pointerdown', () => {
                this.currentDescriptionIndex++;
                this.showNextDescription();
            });
        }
    });
  }

  private showChoices(): void {
    if (this.continueButton) {
      this.continueButton.destroy();
      this.continueButton = undefined;
    }

    const { width, height } = this.cameras.main;
    const panelHeight = height * 0.8;
    // Position buttons in the lower part of the panel
    const startY = height / 2 - panelHeight / 2 + 520; // Fixed position in panel

    this.currentEvent.choices.forEach((choice, index) => {
      const buttonY = startY + (index * 90);  // Increased from 70 to 90 for better spacing
      const button = this.createChoiceButton(
        width / 2,
        buttonY,
        choice.text,
        () => this.handleChoice(choice)
      );
      this.choiceButtons.push(button);
    });
  }

  private createChoiceButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const buttonWidth = 600;
    const buttonHeight = 70;

    // Create double border like in combat
    const outerBorder = this.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0)
      .setStrokeStyle(3, 0x77888C);
    const innerBorder = this.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
      .setStrokeStyle(2, 0x77888C);
    const bg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '20px',
      color: '#77888C',
      wordWrap: { width: buttonWidth - 40 },
      align: 'center'
    }).setOrigin(0.5);

    button.add([outerBorder, innerBorder, bg, buttonText]);
    
    // Make the background rectangle interactive instead of the container
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        bg.setFillStyle(0x1f1410);
        buttonText.setColor('#e8eced');
      })
      .on('pointerout', () => {
        bg.setFillStyle(0x150E10);
        buttonText.setColor('#77888C');
      })
      .on('pointerdown', callback);

    return button;
  }

  private handleChoice(choice: EventChoice): void {
    const context: EventContext = {
      player: this.player,
      scene: this
    };
    
    const resultMessage = choice.outcome(context);

    // If this is an educational event, track it with the educational event manager
    if (this.isEducationalEvent(this.currentEvent)) {
      const educationalEventManager = EducationalEventManager.getInstance();
      educationalEventManager.markEventEncountered(this.currentEvent);
    }

    const overworldState = OverworldGameState.getInstance();
    overworldState.recordAction();

    if (resultMessage) {
      this.showResult(resultMessage);
    } else {
      this.showResult("Event completed.");
    }

    const gameState = GameState.getInstance();
    gameState.updatePlayerData(this.player);
  }

  private isEducationalEvent(event: GameEvent | EducationalEvent): event is EducationalEvent {
    return 'culturalContext' in event && 'academicReferences' in event && 'valuesLesson' in event;
  }

  private showResult(outcome: string): void {
    const { width, height } = this.cameras.main;

    // Clean up previous result if any
    if (this.resultText) {
      this.resultText.destroy();
      this.resultText = undefined;
    }

    // Clear choice buttons
    this.choiceButtons.forEach(button => button.destroy());
    this.choiceButtons = [];

    // Container for Result UI
    const container = this.add.container(width / 2, height / 2);
    container.setAlpha(0);

    // Background Panel
    const panelWidth = width * 0.7; // Slightly smaller than educational panel
    const panelHeight = 250;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.lineStyle(2, 0x2ed573, 0.8); // Green border for Outcome
    bg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    bg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    container.add(bg);

    // Title
    const title = this.add.text(0, -panelHeight / 2 + 30, "EVENT OUTCOME", {
        fontFamily: 'dungeon-mode', fontSize: '24px', color: '#2ed573'
    }).setOrigin(0.5);
    container.add(title);
    
    // Result Text
    const textWidth = panelWidth - 80;
    const outcomeText = this.add.text(0, 0, outcome, {
        fontFamily: 'monospace', 
        fontSize: '18px', 
        color: '#ffffff', 
        align: 'center', 
        wordWrap: { width: textWidth } 
    }).setOrigin(0.5);
    container.add(outcomeText);
    
    // Store reference for eventual destruction if needed, though scenes clear containers
    // Store reference for eventual destruction if needed, though scenes clear containers
    // this.resultContainer = container;

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
         // Wait a bit before proceeding
         this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: container,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                   container.destroy();
                   // Proceed
                   if (this.isEducationalEvent(this.currentEvent)) {
                       this.showEducationalContent();
                   } else {
                       this.completeEvent();
                   }
                }
            });
         });
      }
    });
  }
  


  private showEducationalContent(): void {
    const { width, height } = this.cameras.main;
    const educationalEvent = this.currentEvent as EducationalEvent;

    // Create a container for the educational outcome
    const container = this.add.container(width / 2, height / 2);
    container.setAlpha(0);

    // Background Panel
    const panelWidth = width * 0.85;
    const panelHeight = 400;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.lineStyle(2, 0xffa726, 0.8); // Orange border for educational context
    bg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    bg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
    container.add(bg);

    // Title
    const title = this.add.text(0, -panelHeight / 2 + 30, "WISDOM GAINED", {
        fontFamily: 'dungeon-mode', fontSize: '24px', color: '#ffb74d'
    }).setOrigin(0.5);
    container.add(title);

    let currentY = -panelHeight / 2 + 80;
    const textWidth = panelWidth - 60;
    const style = { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff', align: 'center', wordWrap: { width: textWidth } };

    // Cultural Wisdom
    const culturalLabel = this.add.text(0, currentY, "CULTURAL CONTEXT", { ...style, fontSize: '16px', color: '#ffcc80' }).setOrigin(0.5, 0);
    container.add(culturalLabel);
    currentY += 25;
    
    const culturalText = this.add.text(0, currentY, educationalEvent.culturalContext.culturalSignificance, { ...style, color: '#e8eced' }).setOrigin(0.5, 0);
    container.add(culturalText);
    currentY += culturalText.height + 30;

    // Values Lesson
    const valuesLabel = this.add.text(0, currentY, "VALUES LESSON", { ...style, fontSize: '16px', color: '#a5d6a7' }).setOrigin(0.5, 0);
    container.add(valuesLabel);
    currentY += 25;

    const valuesText = this.add.text(0, currentY, educationalEvent.valuesLesson.culturalWisdom, { ...style, color: '#e8eced' }).setOrigin(0.5, 0);
    container.add(valuesText);
    currentY += valuesText.height + 30;

    // Source
    const reference = educationalEvent.academicReferences[0];
    const refStr = `Source: ${reference.author}, "${reference.title}" (${reference.publicationYear})`;
    const refText = this.add.text(0, panelHeight / 2 - 40, refStr, {
        fontFamily: 'monospace', fontSize: '14px', color: '#90a4ae', align: 'center'
    }).setOrigin(0.5);
    container.add(refText);

    // Click to continue
    const continueText = this.add.text(0, panelHeight / 2 + 20, "[ Click to Continue ]", {
        fontFamily: 'dungeon-mode', fontSize: '18px', color: '#ffffff'
    }).setOrigin(0.5);
    
    // Animate in
    this.tweens.add({
        targets: [container, continueText],
        alpha: 1,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
            // Wait for input to close
            this.input.once('pointerdown', () => {
                this.tweens.add({
                     targets: [container, continueText],
                     alpha: 0,
                     duration: 300,
                     onComplete: () => this.completeEvent()
                });
            });
        }
    });

    // Clean up on shutdown? Scenes handle display list cleanup automatically.
  }

  private completeEvent(): void {
    this.time.delayedCall(1500, () => {
      // Check if we came from Debug Mode
      if (this.currentEvent && (this.currentEvent as any)._debugSource) {
           console.log("Returning to Educational Debug Scene");
           this.scene.stop('EventScene');
           this.scene.wake('EducationalEventsDebugScene');
           // Re-enable input or visibility if needed (Wake does this mostly)
           const debugScene = this.scene.get('EducationalEventsDebugScene') as any;
           if (debugScene && debugScene.toggleVisibility) {
               debugScene.toggleVisibility(); // Ensure it shows up if it was hidden
           }
           return;
      }

      // Normal Gameplay Flow
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      
      // Manually call the Overworld resume method to reset movement flags
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop('EventScene');
      this.scene.resume('Overworld');
    });
  }

  /**
   * Shutdown cleanup - safety net to ensure music is stopped
   * (Already handled by shutdown event listener, but included as backup)
   */
  shutdown(): void {
    console.log("🎵 EventScene: shutdown() method called");
    
    if (this.music) {
      console.log("🎵 EventScene: Stopping music in shutdown()");
      this.music.stop();
      this.music.destroy();
      this.music = undefined;
    }
  }
}

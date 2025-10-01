import { Scene, GameObjects } from 'phaser';

interface PrologueSlide {
  text: string;
}

export class Prologue extends Scene {
  private slides: PrologueSlide[];
  private currentSlideIndex: number = 0;
  private displayedText: GameObjects.Text;
  private imagePlaceholder: GameObjects.Rectangle;
  private typingSpeed: number = 20; // Faster typing
  private isTyping: boolean = false;
  private continuePrompt: GameObjects.Text;
  private typingTimer: Phaser.Time.TimerEvent;

  constructor() {
    super('Prologue');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000); // Black background for a more cinematic feel

    this.slides = [
        { text: "Long ago, two gods, Bathala, the sky-father, and Amihan, the sea-mother, created the islands." },
        { text: "These islands were a paradise for the anito, spirits of nature, who lived in harmony." },
        { text: "But the engkanto, spirits of deceit, grew jealous. They wove lies and discord, turning the anito against each other." },
        { text: "A hero is needed to restore balance." },
        { text: "You must channel the power of the four elements - Apoy, Tubig, Lupa, and Hangin - through sacred cards." },
        { text: "Combine these cards to form powerful hands, and vanquish the corrupted spirits." },
        { text: "Your journey begins now." }
      ];

    // Image placeholder
    this.imagePlaceholder = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      this.cameras.main.width * 0.6,
      this.cameras.main.height * 0.4,
      0x222222 // Dark grey placeholder
    ).setAlpha(0);

    // Text display area
    this.displayedText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 150,
      '',
      {
        fontFamily: 'dungeon-mode',
        fontSize: 32,
        color: '#FFFFFF', // White text on black background
        align: 'center',
        wordWrap: { width: this.cameras.main.width - 100 }
      }
    ).setOrigin(0.5).setAlpha(0);

    // Continue prompt
    this.continuePrompt = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 50,
      'Click to continue...',
      {
        fontFamily: 'dungeon-mode',
        fontSize: 24,
        color: '#888888',
        align: 'center',
      }
    ).setOrigin(0.5).setVisible(false);

    this.showSlide(this.currentSlideIndex);

    this.input.on('pointerdown', () => {
      if (this.isTyping) {
        this.skipTyping();
      } else {
        this.nextSlide();
      }
    });
  }

  private showSlide(index: number) {
    if (index >= this.slides.length) {
      this.cameras.main.fadeOut(1000, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
          this.scene.start('Overworld');
        }
      });
      return;
    }

    const slide = this.slides[index];

    // Fade out old content
    this.tweens.add({
      targets: [this.imagePlaceholder, this.displayedText, this.continuePrompt],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.continuePrompt.setVisible(false);
        // Determine if placeholder should be shown
        const showImage = index < 6; // Show for all but the last slide
        this.imagePlaceholder.setVisible(showImage);

        this.startTyping(slide.text);
        
        const targets = showImage ? [this.imagePlaceholder, this.displayedText] : [this.displayedText];

        // Fade in new content
        this.tweens.add({
          targets: targets,
          alpha: 1,
          duration: 300
        });
      }
    });
  }

  private startTyping(textToType: string) {
    this.isTyping = true;
    this.displayedText.setText('');
    let charIndex = 0;

    if (this.typingTimer) {
        this.typingTimer.remove();
    }

    this.typingTimer = this.time.addEvent({
      delay: this.typingSpeed,
      callback: () => {
        this.displayedText.setText(this.displayedText.text + textToType[charIndex]);
        charIndex++;
        if (charIndex === textToType.length) {
          this.isTyping = false;
          this.continuePrompt.setAlpha(1).setVisible(true);
          this.typingTimer.remove();
        }
      },
      repeat: textToType.length - 1
    });
  }

  private skipTyping() {
    if (this.typingTimer) {
        this.typingTimer.remove();
    }
    this.isTyping = false;
    this.displayedText.setText(this.slides[this.currentSlideIndex].text);
    this.continuePrompt.setAlpha(1).setVisible(true);
  }

  private nextSlide() {
    this.currentSlideIndex++;
    this.showSlide(this.currentSlideIndex);
  }
}

import { Scene, GameObjects } from 'phaser';
import { HandEvaluator } from '../../utils/HandEvaluator';
import { PlayingCard, HandEvaluation, Suit, Rank } from '../../core/types/CombatTypes';

enum ProloguePhase {
  STORY,
  TUTORIAL_START,
  TUTORIAL_PAIR_STEP_1,
  TUTORIAL_PAIR_STEP_2,
  TUTORIAL_FLUSH_STEP_1,
  TUTORIAL_FLUSH_STEP_2,
  TUTORIAL_END,
}

interface PrologueSlide {
  text: string;
}

export class Prologue extends Scene {
  private phase: ProloguePhase = ProloguePhase.STORY;
  private slides: PrologueSlide[];
  private currentSlideIndex: number = 0;
  private displayedText: GameObjects.Text;
  private imagePlaceholder: GameObjects.Rectangle;
  private typingSpeed: number = 20;
  private isTyping: boolean = false;
  private continuePrompt: GameObjects.Text;
  private typingTimer: Phaser.Time.TimerEvent;

  // Tutorial objects
  private tutorialText: GameObjects.Text;
  private hand: PlayingCard[] = [];
  private handSprites: GameObjects.Sprite[] = [];
  private selectedCardSprites: GameObjects.Sprite[] = [];
  private tikbalang: GameObjects.Sprite;
  private formHandButton: GameObjects.Text;

  constructor() {
    super('Prologue');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);
    this.phase = ProloguePhase.STORY;

    this.slides = [
        { text: "Long ago, two gods, Bathala, the sky-father, and Amihan, the sea-mother, created the islands." },
        { text: "These islands were a paradise for the anito, spirits of nature, who lived in harmony." },
        { text: "But the engkanto, spirits of deceit, grew jealous. They wove lies and discord, turning the anito against each other." },
        { text: "A hero is needed to restore balance." },
        { text: "You must channel the power of the four elements - Apoy, Tubig, Lupa, and Hangin - through sacred cards." },
        { text: "Combine these cards to form powerful hands, and vanquish the corrupted spirits." },
    ];

    this.imagePlaceholder = this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, this.cameras.main.width * 0.6, this.cameras.main.height * 0.4, 0x222222).setAlpha(0);
    this.displayedText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 150, '', { fontFamily: 'dungeon-mode', fontSize: 32, color: '#FFFFFF', align: 'center', wordWrap: { width: this.cameras.main.width - 100 } }).setOrigin(0.5).setAlpha(0);
    this.continuePrompt = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Click to continue...', { fontFamily: 'dungeon-mode', fontSize: 24, color: '#888888', align: 'center' }).setOrigin(0.5).setVisible(false);

    this.showSlide(this.currentSlideIndex);

    this.input.on('pointerdown', () => {
        if (this.phase === ProloguePhase.STORY) {
            if (this.isTyping) {
                this.skipTyping();
            } else {
                this.nextSlide();
            }
        }
    });
  }

  private showSlide(index: number) {
    if (index >= this.slides.length) {
        this.startTutorial();
        return;
    }

    const slide = this.slides[index];
    this.tweens.add({
        targets: [this.imagePlaceholder, this.displayedText, this.continuePrompt],
        alpha: 0,
        duration: 300,
        onComplete: () => {
            this.continuePrompt.setVisible(false);
            const showImage = index < 6;
            this.imagePlaceholder.setVisible(showImage);
            this.startTyping(slide.text);
            const targets = showImage ? [this.imagePlaceholder, this.displayedText] : [this.displayedText];
            this.tweens.add({ targets, alpha: 1, duration: 300 });
        }
    });
  }

  private startTyping(textToType: string) {
    this.isTyping = true;
    this.displayedText.setText('');
    let charIndex = 0;
    if (this.typingTimer) this.typingTimer.remove();
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
    if (this.typingTimer) this.typingTimer.remove();
    this.isTyping = false;
    this.displayedText.setText(this.slides[this.currentSlideIndex].text);
    this.continuePrompt.setAlpha(1).setVisible(true);
  }

  private nextSlide() {
    this.currentSlideIndex++;
    this.showSlide(this.currentSlideIndex);
  }

  private startTutorial() {
    this.phase = ProloguePhase.TUTORIAL_START;
    this.tweens.add({
        targets: [this.imagePlaceholder, this.displayedText, this.continuePrompt],
        alpha: 0,
        duration: 500,
        onComplete: () => {
            this.imagePlaceholder.destroy();
            this.displayedText.destroy();
            this.continuePrompt.destroy();
            this.setupTutorialUI();
        }
    });
  }

  private setupTutorialUI() {
    this.tikbalang = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2 - 150, 'tikbalang').setAlpha(0).setScale(1.5);
    this.anims.play('tikbalang_idle', this.tikbalang);

    this.tutorialText = this.add.text(this.cameras.main.width / 2, 50, 'A wild Tikbalang scout appears!\nLet\'s teach you how to fight.', { fontFamily: 'dungeon-mode', fontSize: 28, color: '#FFFFFF', align: 'center' }).setOrigin(0.5).setAlpha(0);

    this.formHandButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Form Hand', { fontFamily: 'dungeon-mode', fontSize: 32, color: '#888888' }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: [this.tikbalang, this.tutorialText], alpha: 1, duration: 500, onComplete: () => this.dealTutorialHand(ProloguePhase.TUTORIAL_PAIR_STEP_1) });
  }

  private dealTutorialHand(step: ProloguePhase) {
    this.phase = step;
    this.hand = [];
    this.handSprites.forEach(s => s.destroy());
    this.handSprites = [];
    this.selectedCardSprites = [];

    let handConfig: {rank: Rank, suit: Suit}[] = [];
    let tutorialMessage = '';

    if (step === ProloguePhase.TUTORIAL_PAIR_STEP_1) {
        handConfig = [
            {rank: '5', suit: 'Apoy'}, {rank: '5', suit: 'Tubig'}, {rank: '2', suit: 'Lupa'}, {rank: '7', suit: 'Hangin'}, 
            {rank: '9', suit: 'Apoy'}, {rank: 'Datu', suit: 'Tubig'}, {rank: '3', suit: 'Lupa'}, {rank: '4', suit: 'Hangin'}
        ];
        tutorialMessage = 'You have 8 cards. Select 5 to form a hand.\nTry to find a PAIR.';
    } else if (step === ProloguePhase.TUTORIAL_FLUSH_STEP_1) {
        handConfig = [
            {rank: '2', suit: 'Apoy'}, {rank: '5', suit: 'Apoy'}, {rank: '7', suit: 'Apoy'}, {rank: '9', suit: 'Apoy'}, 
            {rank: 'Datu', suit: 'Apoy'}, {rank: '3', suit: 'Tubig'}, {rank: '8', suit: 'Lupa'}, {rank: '6', suit: 'Hangin'}
        ];
        tutorialMessage = 'Excellent! Now for a stronger hand.\nForm a FLUSH by selecting 5 cards of the same suit.';
    }

    this.tutorialText.setText(tutorialMessage);

    const rankMap: Record<string, string> = {
        "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
        "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
        "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
    };

    handConfig.forEach((cardDef, i) => {
        const card: PlayingCard = { id: `prologue_${i}`, rank: cardDef.rank, suit: cardDef.suit, element: 'neutral', selected: false, playable: true };
        this.hand.push(card);
        const spriteRank = rankMap[cardDef.rank] || "1";
        const spriteSuit = cardDef.suit.toLowerCase();
        const textureKey = `card_${spriteRank}_${spriteSuit}`;
        const cardSprite = this.add.sprite(0, 0, textureKey).setInteractive({ useHandCursor: true }).setScale(0.5);
        cardSprite.setData('card', card);
        this.handSprites.push(cardSprite);

        cardSprite.on('pointerdown', () => this.selectCard(cardSprite));
    });

    this.organizeHandSprites();
  }

  private organizeHandSprites() {
    const handWidth = this.handSprites.length * 80;
    this.handSprites.forEach((sprite, i) => {
        sprite.setPosition(this.cameras.main.width / 2 - handWidth / 2 + i * 80, this.cameras.main.height - 200);
    });
  }

  private selectCard(sprite: GameObjects.Sprite) {
    const card = sprite.getData('card') as PlayingCard;
    card.selected = !card.selected;

    if (card.selected) {
        if (this.selectedCardSprites.length < 5) {
            sprite.y -= 30;
            this.selectedCardSprites.push(sprite);
        }
    } else {
        sprite.y += 30;
        this.selectedCardSprites = this.selectedCardSprites.filter(s => s !== sprite);
    }

    if (this.selectedCardSprites.length === 5) {
        this.formHandButton.setColor('#FFFFFF').once('pointerdown', () => this.evaluateTutorialHand());
    } else {
        this.formHandButton.setColor('#888888').off('pointerdown');
    }
  }

  private evaluateTutorialHand() {
    const selectedCards = this.selectedCardSprites.map(s => s.getData('card') as PlayingCard);
    const evaluation = HandEvaluator.evaluateHand(selectedCards, 'attack');

    let nextStep = false;

    if (this.phase === ProloguePhase.TUTORIAL_PAIR_STEP_1 && evaluation.type === 'pair') {
        this.tutorialText.setText(`A PAIR! You dealt ${evaluation.totalValue} damage.`);
        nextStep = true;
        this.phase = ProloguePhase.TUTORIAL_FLUSH_STEP_1;
    } else if (this.phase === ProloguePhase.TUTORIAL_FLUSH_STEP_1 && evaluation.type === 'flush') {
        this.tutorialText.setText(`A FLUSH! A powerful blow! You dealt ${evaluation.totalValue} damage.`);
        nextStep = true;
        this.phase = ProloguePhase.TUTORIAL_END;
    } else {
        this.tutorialText.setText('That\'s not the hand we\'re looking for. Try again.');
    }

    this.tweens.add({ targets: this.tikbalang, alpha: this.phase === ProloguePhase.TUTORIAL_END ? 0 : 0.5, duration: 200, yoyo: true });

    if (nextStep) {
        this.time.delayedCall(2000, () => {
            if (this.phase === ProloguePhase.TUTORIAL_END) {
                this.endTutorial();
            } else {
                this.dealTutorialHand(this.phase);
            }
        });
    }
  }

  private endTutorial() {
    this.tutorialText.setText('You have learned the basics. Your real journey begins now.');
    this.tweens.add({ targets: [this.tikbalang, ...this.handSprites, this.formHandButton], alpha: 0, duration: 1000 });
    this.cameras.main.fadeOut(2000, 0, 0, 0, (camera, progress) => {
        if (progress === 1) {
            this.scene.start('Overworld');
        }
    });
  }
}

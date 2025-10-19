import { Scene, GameObjects } from 'phaser';
import { PlayingCard } from '../../../../core/types/CombatTypes';
import { DeckManager } from '../../../../utils/DeckManager';

export class TutorialUI {
    private scene: Scene;
    public cardSprites: Phaser.GameObjects.Container[] = [];
    public handContainer!: Phaser.GameObjects.Container;
    public relicsContainer!: Phaser.GameObjects.Container;
    public potionsContainer!: Phaser.GameObjects.Container;
    public selectedCards: PlayingCard[] = [];
    private deck: PlayingCard[] = [];
    private hand: PlayingCard[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
        this.handContainer = this.scene.add.container(this.scene.cameras.main.width / 2, this.scene.cameras.main.height - 350);
        this.handContainer.setDepth(1500); // Ensure hand is visible but below played cards
        this.relicsContainer = this.scene.add.container(100, 100);
        this.potionsContainer = this.scene.add.container(100, 200);
        this.deck = DeckManager.createFullDeck();
    }

    public updatePotionsDisplay(potions: any[]): void {
        this.potionsContainer.removeAll(true);
        potions.forEach((potion, index) => {
            const potionText = this.scene.add.text(0, index * 30, `${potion.emoji} ${potion.name}`, { fontFamily: 'dungeon-mode', fontSize: 24 });
            this.potionsContainer.add(potionText);
        });
    }

    public updateRelicsDisplay(relics: any[]): void {
        this.relicsContainer.removeAll(true);
        relics.forEach((relic, index) => {
            const relicText = this.scene.add.text(0, index * 30, `${relic.emoji} ${relic.name}`, { fontFamily: 'dungeon-mode', fontSize: 24 });
            this.relicsContainer.add(relicText);
        });
    }

    public drawHand(count: number) {
        const { drawnCards, remainingDeck } = DeckManager.drawCards(this.deck, count);
        this.hand = drawnCards;
        this.deck = remainingDeck;
        this.updateHandDisplay();
    }

    public addCardsToHand(cards: PlayingCard[]) {
        this.hand.push(...cards);
    }

    public discard(): PlayingCard[] {
        const discardedCards = this.selectedCards;
        this.hand = this.hand.filter(card => !this.selectedCards.find(selected => selected.id === card.id));
        this.selectedCards = [];
        return discardedCards;
    }

    public selectCard(card: PlayingCard) {
        const index = this.selectedCards.findIndex(c => c.id === card.id);
        if (index > -1) {
            this.selectedCards.splice(index, 1);
            card.selected = false;
        } else {
            if (this.selectedCards.length < 5) {
                this.selectedCards.push(card);
                card.selected = true;
            }
        }
        this.updateHandDisplay();
    }

    public updateHandDisplay(): void {
        this.cardSprites.forEach((sprite) => {
            this.scene.tweens.killTweensOf(sprite);
            sprite.destroy();
        });
        this.cardSprites = [];

        const hand = this.hand;

        const CARD_SPACING = 96;
        const CARD_ARC_HEIGHT = 30;
        const CARD_MAX_ROTATION = 8;

        const totalSpread = (hand.length - 1) * CARD_SPACING;
        const startX = -totalSpread / 2;

        hand.forEach((card, index) => {
            const normalizedPos = hand.length > 1 ? (index / (hand.length - 1)) - 0.5 : 0;

            const x = startX + (index * CARD_SPACING);
            const baseY = -Math.abs(normalizedPos) * CARD_ARC_HEIGHT * 2;
            const rotation = normalizedPos * CARD_MAX_ROTATION;

            (card as any).baseX = x;
            (card as any).baseY = baseY;
            (card as any).baseRotation = rotation;

            const y = baseY;

            const cardSprite = this.createCardSprite(card, x, y);
            cardSprite.setAngle(rotation);
            cardSprite.setDepth(100 + index);

            this.handContainer.add(cardSprite);
            this.cardSprites.push(cardSprite);
        });
        
        // Ensure hand container is visible
        this.handContainer.setVisible(true);
    }

    public createCardSprite(
        card: PlayingCard,
        x: number,
        y: number,
        interactive: boolean = true
    ): Phaser.GameObjects.Container {
        const cardContainer = this.scene.add.container(x, y);

        const cardWidth = 80;
        const cardHeight = 112;

        const rankMap: Record<string, string> = {
            "1": "1", "2": "2", "3": "3", "4": "4", "5": "5",
            "6": "6", "7": "7", "8": "8", "9": "9", "10": "10",
            "Mandirigma": "11", "Babaylan": "12", "Datu": "13"
        };
        const spriteRank = rankMap[card.rank] || "1";

        const suitMap: Record<string, string> = {
            "Apoy": "apoy", "Tubig": "tubig", "Lupa": "lupa", "Hangin": "hangin"
        };
        const spriteSuit = suitMap[card.suit] || "apoy";

        const textureKey = `card_${spriteRank}_${spriteSuit}`;
        let cardSprite;

        if (this.scene.textures.exists(textureKey)) {
            cardSprite = this.scene.add.image(0, 0, textureKey);
        } else {
            cardSprite = this.scene.add.rectangle(0, 0, cardWidth, cardHeight, 0xffffff);

            const rankText = this.scene.add.text(-cardWidth / 2 + 5, -cardHeight / 2 + 5, card.rank, {
                fontFamily: "dungeon-mode",
                fontSize: 10,
                color: "#000000",
            }).setOrigin(0, 0);
            cardContainer.add(rankText);

            const display = DeckManager.getCardDisplay(card);
            const suitText = this.scene.add.text(cardWidth / 2 - 5, -cardHeight / 2 + 5, display.symbol, {
                fontFamily: "dungeon-mode",
                fontSize: 10,
                color: display.color,
            }).setOrigin(1, 0);
            cardContainer.add(suitText);
        }

        cardSprite.setDisplaySize(cardWidth, cardHeight);

        const border = this.scene.add.rectangle(0, 0, cardWidth + 4, cardHeight + 4, 0x000000, 0);
        border.setStrokeStyle(2, 0x77888C);
        border.setName('cardBorder');
        border.setVisible(card.selected);

        cardContainer.add([cardSprite, border]);
        cardContainer.setPosition(x, y);

        if (interactive) {
            cardContainer.setInteractive(
                new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
                Phaser.Geom.Rectangle.Contains
            );

            cardContainer.on("pointerdown", () => this.scene.events.emit('selectCard', card));
        }

        (cardContainer as any).cardRef = card;
        return cardContainer;
    }
}

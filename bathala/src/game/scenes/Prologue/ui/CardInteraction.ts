import { Scene } from 'phaser';
import { PlayingCard, Suit, Rank } from '../../../../core/types/CombatTypes';

export function drawCards(scene: Scene, type: 'high_card' | 'pair' | 'straight' | 'flush' | 'full_house', onHandComplete: (selected: PlayingCard[]) => void): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    let handConfig: {r: Rank, s: Suit}[];
    switch(type) {
        case 'pair': handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}]; break;
        case 'straight': handConfig = [{r: '3', s: 'Apoy'}, {r: '4', s: 'Tubig'}, {r: '5', s: 'Lupa'}, {r: '6', s: 'Hangin'}, {r: '7', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '9', s: 'Hangin'}]; break;
        case 'flush': handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Apoy'}, {r: '7', s: 'Apoy'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
        case 'full_house': handConfig = [{r: '8', s: 'Apoy'}, {r: '8', s: 'Tubig'}, {r: '8', s: 'Lupa'}, {r: 'Datu', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
        default: handConfig = [{r: '2', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '7', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: 'Datu', s: 'Apoy'}, {r: '3', s: 'Tubig'}, {r: '4', s: 'Lupa'}, {r: '6', s: 'Hangin'}]; break;
    }
    
    const hand = handConfig.map((def, i) => ({ id: `p_${i}`, rank: def.r, suit: def.s, selected: false, playable: true, element: 'neutral' }));
    const selectedCards: PlayingCard[] = [];
    const handSprites: Phaser.GameObjects.Sprite[] = [];

    const rankMap: Record<string, string> = {"1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","Mandirigma":"11","Babaylan":"12","Datu":"13"};
    const cardWidth = 200 * 0.35;
    const cardSpacing = cardWidth * 1.43;
    const totalWidth = (hand.length - 1) * cardSpacing;
    const centerX = scene.cameras.main.width / 2;
    const baseY = scene.cameras.main.height * 0.64;
    
    const arcHeight = 40;
    const maxRotation = 10;

    const selectionIndicatorY = scene.cameras.main.height * 0.82;
    const playButtonY = scene.cameras.main.height * 0.90;
    
    const selectionIndicator = scene.add.text(centerX, selectionIndicatorY, 'Selected: 0/5', { 
        fontFamily: 'dungeon-mode', 
        fontSize: 20, 
        color: '#77888C' 
    }).setOrigin(0.5).setDepth(900);
    
    const cardElements: Phaser.GameObjects.GameObject[] = [selectionIndicator];

    const playHandCallback = () => {
        if (selectedCards.length !== 5) return;
        cardElements.forEach(el => el.destroy());
        handSprites.forEach(s => s.destroy());
        playHandButton.destroy();
        onHandComplete(selectedCards);
    };

    const playHandButton = scene.add.text(centerX, playButtonY, 'Play Hand', { fontFamily: 'dungeon-mode', fontSize: 24, color: '#77888C' }).setOrigin(0.5).setInteractive();
    playHandButton.on('pointerdown', playHandCallback);
    playHandButton.setVisible(false);
    cardElements.push(playHandButton);

    hand.forEach((card, i) => {
        const spriteRank = rankMap[card.rank] || "1";
        const spriteSuit = card.suit.toLowerCase();
        
        const normalizedPos = (i / (hand.length - 1)) - 0.5;
        const xPos = centerX + (normalizedPos * totalWidth);
        const yOffset = Math.abs(normalizedPos) * arcHeight;
        const yPos = baseY + yOffset;
        const rotation = normalizedPos * maxRotation;
        
        const cardSprite = scene.add.sprite(xPos, yPos, `card_${spriteRank}_${spriteSuit}`)
            .setInteractive()
            .setScale(0.35)
            .setAngle(rotation)
            .setDepth(100 + i);
        
        cardSprite.setData('card', card);
        cardSprite.setData('originalY', yPos);
        cardSprite.setData('originalRotation', rotation);
        handSprites.push(cardSprite);

        cardSprite.on('pointerdown', () => {
            card.selected = !card.selected;
            const selIndex = selectedCards.findIndex(c => c.id === card.id);
            if (card.selected && selIndex === -1 && selectedCards.length < 5) {
                cardSprite.y -= 40;
                cardSprite.setTint(0x4a90e2);
                cardSprite.setDepth(500 + i);
                selectedCards.push(card);
            } else if (selIndex > -1) {
                card.selected = false;
                cardSprite.y = cardSprite.getData('originalY');
                cardSprite.clearTint();
                cardSprite.setDepth(100 + i);
                selectedCards.splice(selIndex, 1);
            }

            selectionIndicator.setText(`Selected: ${selectedCards.length}/5`);
            playHandButton.setVisible(selectedCards.length === 5);
        });
    });

    container.add([...cardElements, ...handSprites]);
    return container;
}

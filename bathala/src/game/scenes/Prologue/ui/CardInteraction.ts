import { Scene } from 'phaser';
import { PlayingCard, Suit, Rank } from '../../../../core/types/CombatTypes';

export function drawCards(scene: Scene, type: 'high_card' | 'pair' | 'twoPair' | 'threeOfAKind' | 'straight' | 'flush' | 'full_house', onHandComplete: (selected: PlayingCard[]) => void): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);
    let handConfig: {r: Rank, s: Suit}[];
    switch(type) {
        case 'pair': handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '2', s: 'Lupa'}, {r: '7', s: 'Hangin'}, {r: '9', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '4', s: 'Hangin'}]; break;
        case 'twoPair': handConfig = [{r: '5', s: 'Apoy'}, {r: '5', s: 'Tubig'}, {r: '9', s: 'Lupa'}, {r: '9', s: 'Hangin'}, {r: '2', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '7', s: 'Hangin'}]; break;
        case 'threeOfAKind': handConfig = [{r: '8', s: 'Apoy'}, {r: '8', s: 'Tubig'}, {r: '8', s: 'Lupa'}, {r: '2', s: 'Hangin'}, {r: '5', s: 'Apoy'}, {r: 'Datu', s: 'Tubig'}, {r: '3', s: 'Lupa'}, {r: '9', s: 'Hangin'}]; break;
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
        playHandBg.destroy();
        playHandOuterBorder.destroy();
        playHandInnerBorder.destroy();
        playHandButton.destroy();
        onHandComplete(selectedCards);
    };

    // Play Hand button with double border design
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    const playHandBg = scene.add.rectangle(centerX, playButtonY, buttonWidth, buttonHeight, 0x150E10, 0.95)
        .setDepth(899);
    const playHandOuterBorder = scene.add.rectangle(centerX, playButtonY, buttonWidth + 6, buttonHeight + 6, undefined, 0)
        .setStrokeStyle(3, 0x77888C, 0.8)
        .setDepth(899);
    const playHandInnerBorder = scene.add.rectangle(centerX, playButtonY, buttonWidth + 2, buttonHeight + 2, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.6)
        .setDepth(899);
    const playHandButton = scene.add.text(centerX, playButtonY, 'Play Hand', { 
        fontFamily: 'dungeon-mode', 
        fontSize: 24, 
        color: '#77888C' 
    }).setOrigin(0.5).setDepth(900).setInteractive();
    
    playHandButton.on('pointerdown', playHandCallback);
    
    // Hover effects
    playHandButton.on('pointerover', () => {
        playHandBg.setFillStyle(0x1f1410);
        playHandButton.setColor('#e8eced');
    });
    playHandButton.on('pointerout', () => {
        playHandBg.setFillStyle(0x150E10);
        playHandButton.setColor('#77888C');
    });
    
    playHandBg.setVisible(false);
    playHandOuterBorder.setVisible(false);
    playHandInnerBorder.setVisible(false);
    playHandButton.setVisible(false);
    
    cardElements.push(playHandBg, playHandOuterBorder, playHandInnerBorder, playHandButton);

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
            const showButton = selectedCards.length === 5;
            playHandBg.setVisible(showButton);
            playHandOuterBorder.setVisible(showButton);
            playHandInnerBorder.setVisible(showButton);
            playHandButton.setVisible(showButton);
        });
    });

    container.add([...cardElements, ...handSprites]);
    return container;
}

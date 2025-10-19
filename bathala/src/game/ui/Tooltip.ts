import { Scene } from 'phaser';

export function createTooltip(scene: Scene, text: string): Phaser.GameObjects.Container {
    const tooltipContainer = scene.add.container(scene.cameras.main.width / 2, 30);
    
    const bg = scene.add.rectangle(0, 0, 400, 50, 0x000000, 0.8).setStrokeStyle(2, 0x77888C);
    const tooltipText = scene.add.text(0, 0, text, { fontFamily: 'dungeon-mode', fontSize: 20, color: '#ffffff', align: 'center' }).setOrigin(0.5);

    tooltipContainer.add([bg, tooltipText]);
    tooltipContainer.setDepth(3000);

    return tooltipContainer;
}

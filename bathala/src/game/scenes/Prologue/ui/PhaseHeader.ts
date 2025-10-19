import { Scene } from 'phaser';

/**
 * Creates a stylish phase header with decorative elements
 * @param scene - The Phaser scene
 * @param title - The phase title (e.g., "Understanding Cards")
 * @param subtitle - Optional subtitle for additional context
 * @returns A container with the phase header
 */
export function createPhaseHeader(
    scene: Scene,
    title: string,
    subtitle?: string
): Phaser.GameObjects.Container {
    const { width } = scene.cameras.main;
    const container = scene.add.container(width / 2, 140);

    // Main title - clean, no decorations
    const titleText = scene.add.text(0, 0, title, {
        fontFamily: 'dungeon-mode',
        fontSize: 42,
        color: '#77888C',
        align: 'center'
    }).setOrigin(0.5);

    container.add([titleText]);

    // Add subtitle if provided
    if (subtitle) {
        const subtitleText = scene.add.text(0, 40, subtitle, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#77888C',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5).setAlpha(0.8);
        container.add(subtitleText);
    }

    container.setDepth(1400);
    container.setAlpha(0).setY(container.y - 20);

    // Entrance animation
    scene.tweens.add({
        targets: container,
        alpha: 1,
        y: container.y + 20,
        duration: 800,
        ease: 'Power3.easeOut'
    });

    return container;
}

/**
 * Creates a simple section divider
 */
export function createSectionDivider(scene: Scene, y: number = 300): Phaser.GameObjects.Container {
    const { width } = scene.cameras.main;
    const container = scene.add.container(width / 2, y);

    // Empty container for spacing only - no visible divider
    container.setAlpha(1);

    return container;
}

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

    // Decorative lines on both sides
    const lineWidth = 120;
    const lineY = 0;
    
    // Left line with gradient effect (simulated)
    const leftLineOuter = scene.add.line(0, lineY, 0, 0, -lineWidth - 20, 0, 0x556065, 0.3).setOrigin(0.5);
    const leftLine = scene.add.line(0, lineY, 0, 0, -lineWidth, 0, 0x77888C).setOrigin(0.5).setLineWidth(2);
    
    // Right line
    const rightLineOuter = scene.add.line(0, lineY, lineWidth, 0, lineWidth + 20, 0, 0x556065, 0.3).setOrigin(0.5);
    const rightLine = scene.add.line(0, lineY, 0, 0, lineWidth, 0, 0x77888C).setOrigin(0.5).setLineWidth(2);

    // Decorative corner elements
    const leftCorner = scene.add.text(-lineWidth - 15, lineY, '◆', {
        fontFamily: 'dungeon-mode',
        fontSize: 16,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.8);

    const rightCorner = scene.add.text(lineWidth + 15, lineY, '◆', {
        fontFamily: 'dungeon-mode',
        fontSize: 16,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.8);

    // Main title with shadow effect
    const titleShadow = scene.add.text(2, 2, title, {
        fontFamily: 'dungeon-mode',
        fontSize: 42,
        color: '#000000',
        align: 'center'
    }).setOrigin(0.5).setAlpha(0.5);

    const titleText = scene.add.text(0, 0, title, {
        fontFamily: 'dungeon-mode',
        fontSize: 42,
        color: '#E8E8E8',
        align: 'center'
    }).setOrigin(0.5);

    // Title glow effect
    const titleGlow = scene.add.text(0, 0, title, {
        fontFamily: 'dungeon-mode',
        fontSize: 42,
        color: '#FFFFFF',
        align: 'center'
    }).setOrigin(0.5).setAlpha(0.2).setBlendMode(Phaser.BlendModes.ADD);

    container.add([
        leftLineOuter, leftLine, leftCorner,
        rightLineOuter, rightLine, rightCorner,
        titleShadow, titleGlow, titleText
    ]);

    // Add subtitle if provided
    if (subtitle) {
        const subtitleText = scene.add.text(0, 40, subtitle, {
            fontFamily: 'dungeon-mode',
            fontSize: 20,
            color: '#99A0A5',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0.9);
        container.add(subtitleText);
    }

    // Decorative underline
    const underlineY = subtitle ? 65 : 35;
    const underline = scene.add.line(0, underlineY, -60, 0, 60, 0, 0x556065, 0.6)
        .setOrigin(0.5)
        .setLineWidth(1);
    container.add(underline);

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

    // Animate decorative elements
    scene.tweens.add({
        targets: [leftLine, leftLineOuter, leftCorner],
        x: '-=20',
        duration: 800,
        ease: 'Power2.easeOut'
    });

    scene.tweens.add({
        targets: [rightLine, rightLineOuter, rightCorner],
        x: '+=20',
        duration: 800,
        ease: 'Power2.easeOut'
    });

    // Subtle pulsing glow on title
    scene.tweens.add({
        targets: titleGlow,
        alpha: 0.35,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // Subtle rotation on corner elements
    scene.tweens.add({
        targets: [leftCorner, rightCorner],
        angle: 360,
        duration: 8000,
        repeat: -1,
        ease: 'Linear'
    });

    return container;
}

/**
 * Creates a simple section divider
 */
export function createSectionDivider(scene: Scene, y: number = 300): Phaser.GameObjects.Container {
    const { width } = scene.cameras.main;
    const container = scene.add.container(width / 2, y);

    const lineLength = 400;
    
    // Center ornament
    const ornament = scene.add.text(0, 0, '◆', {
        fontFamily: 'dungeon-mode',
        fontSize: 14,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.7);

    // Lines on both sides
    const leftLine = scene.add.line(0, 0, -30, 0, -lineLength/2, 0, 0x556065, 0.5)
        .setOrigin(0.5)
        .setLineWidth(1);
    
    const rightLine = scene.add.line(0, 0, 30, 0, lineLength/2, 0, 0x556065, 0.5)
        .setOrigin(0.5)
        .setLineWidth(1);

    container.add([leftLine, ornament, rightLine]);
    container.setAlpha(0);

    // Fade in
    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 600,
        ease: 'Power2'
    });

    return container;
}

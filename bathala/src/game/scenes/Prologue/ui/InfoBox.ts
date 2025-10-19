import { Scene } from 'phaser';

export type InfoBoxType = 'tip' | 'warning' | 'info' | 'success';

/**
 * Creates a styled info box with icon and message
 * @param scene - The Phaser scene
 * @param message - The message to display
 * @param type - The type of info box (affects colors and icon)
 * @param x - X position
 * @param y - Y position
 * @returns A container with the info box
 */
export function createInfoBox(
    scene: Scene,
    message: string,
    type: InfoBoxType = 'info',
    x: number = scene.cameras.main.width / 2,
    y: number = scene.cameras.main.height - 150
): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // Type-specific styling
    const styles = {
        tip: { icon: '[TIP]', color: 0xFFD700, borderColor: 0x77888C, bgColor: 0x150E10 },
        warning: { icon: '[!]', color: 0xFF6B35, borderColor: 0x77888C, bgColor: 0x150E10 },
        info: { icon: '[i]', color: 0x5BA3D0, borderColor: 0x77888C, bgColor: 0x150E10 },
        success: { icon: '[OK]', color: 0x4CAF50, borderColor: 0x77888C, bgColor: 0x150E10 }
    };

    const style = styles[type];

    // Message text - centered, no icon
    const messageText = scene.add.text(0, 0, message, {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#77888C',
        align: 'center',
        wordWrap: { width: 600 },
        lineSpacing: 8
    }).setOrigin(0.5);

    const textBounds = messageText.getBounds();
    const boxWidth = Math.min(textBounds.width + 100, 700);
    const boxHeight = textBounds.height + 60;
    
    const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, style.bgColor, 0.95);
    
    // Double border matching intro design
    const outerBorder = scene.add.rectangle(0, 0, boxWidth + 6, boxHeight + 6, undefined, 0)
        .setStrokeStyle(3, style.borderColor, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, boxWidth + 2, boxHeight + 2, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.6);

    container.add([bg, outerBorder, innerBorder, messageText]);
    container.setDepth(1800);
    container.setAlpha(0).setY(y + 20);

    // Entrance animation
    scene.tweens.add({
        targets: container,
        alpha: 1,
        y: y,
        duration: 500,
        ease: 'Back.easeOut'
    });

    return container;
}

/**
 * Creates a highlighted UI element indicator
 * This draws attention to specific UI elements during tutorial
 */
export function createHighlight(
    scene: Scene,
    targetX: number,
    targetY: number,
    width: number,
    height: number,
    pulseColor: number = 0xFFD700
): Phaser.GameObjects.Container {
    const container = scene.add.container(targetX, targetY);

    // Pulsing glow layers
    const glow1 = scene.add.rectangle(0, 0, width + 20, height + 20, pulseColor, 0.2)
        .setBlendMode(Phaser.BlendModes.ADD);
    const glow2 = scene.add.rectangle(0, 0, width + 30, height + 30, pulseColor, 0.1)
        .setBlendMode(Phaser.BlendModes.ADD);
    const glow3 = scene.add.rectangle(0, 0, width + 40, height + 40, pulseColor, 0.05)
        .setBlendMode(Phaser.BlendModes.ADD);

    // Animated border
    const border = scene.add.rectangle(0, 0, width + 10, height + 10, undefined, 0)
        .setStrokeStyle(3, pulseColor, 0.8);

    // Corner markers
    const cornerSize = 15;
    const corners: Phaser.GameObjects.Rectangle[] = [];
    const positions = [
        { x: -width/2 - 5, y: -height/2 - 5 }, // top-left
        { x: width/2 + 5, y: -height/2 - 5 },  // top-right
        { x: -width/2 - 5, y: height/2 + 5 },  // bottom-left
        { x: width/2 + 5, y: height/2 + 5 }    // bottom-right
    ];

    positions.forEach((pos) => {
        const corner = scene.add.rectangle(pos.x, pos.y, cornerSize, cornerSize, pulseColor, 0.8);
        corners.push(corner);
        container.add(corner);
    });

    container.add([glow3, glow2, glow1, border]);
    container.setDepth(1900);
    container.setAlpha(0);

    // Fade in
    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 400,
        ease: 'Power2'
    });

    // Pulse animations
    scene.tweens.add({
        targets: [glow1, glow2, glow3],
        scaleX: 1.1,
        scaleY: 1.1,
        alpha: 0.4,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    scene.tweens.add({
        targets: border,
        alpha: 0.5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    scene.tweens.add({
        targets: corners,
        scale: 1.3,
        alpha: 0.4,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    return container;
}

/**
 * Creates a floating tooltip that follows the mouse
 */
export function createFloatingTooltip(
    scene: Scene,
    text: string,
    followPointer: boolean = true
): Phaser.GameObjects.Container {
    const container = scene.add.container(0, 0);

    const tooltipText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 16,
        color: '#77888C',
        align: 'center',
        padding: { x: 12, y: 8 }
    }).setOrigin(0.5);

    const bg = scene.add.rectangle(0, 0, tooltipText.width + 20, tooltipText.height + 10, 0x150E10, 0.95);
    
    // Double border design
    const outerBorder = scene.add.rectangle(0, 0, bg.width + 6, bg.height + 6, undefined, 0)
        .setStrokeStyle(2, 0x77888C, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, bg.width + 2, bg.height + 2, undefined, 0)
        .setStrokeStyle(1, 0x556065, 0.6);

    container.add([bg, outerBorder, innerBorder, tooltipText]);
    container.setDepth(2500);
    container.setAlpha(0);

    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 200,
        ease: 'Power2'
    });

    if (followPointer) {
        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            container.setPosition(pointer.x + 20, pointer.y - 30);
        });
    }

    return container;
}

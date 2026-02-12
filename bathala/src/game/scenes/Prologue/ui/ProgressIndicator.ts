import { Scene } from 'phaser';

/**
 * Creates an elegant progress indicator for the tutorial
 * @param scene - The Phaser scene
 * @param currentPhase - Current phase number (1-9)
 * @param totalPhases - Total number of phases (9)
 * @returns A container with the progress indicator
 */
export function createProgressIndicator(
    scene: Scene, 
    currentPhase: number, 
    totalPhases: number = 9
): Phaser.GameObjects.Container {
    const { width } = scene.cameras.main;
    const container = scene.add.container(width / 2, 50);

    // Background bar - transparent
    const barWidth = 400;
    const barHeight = 8;
    
    // Dots are placed edge-to-edge with (totalPhases - 1) intervals,
    // so the progress bar must use the same formula to stay aligned.
    const dotSpacing = barWidth / (totalPhases - 1);
    const startX = -barWidth / 2;

    const barBg = scene.add.rectangle(0, 0, barWidth, barHeight, 0x556065, 0.3);
    const barBgBorder = scene.add.rectangle(0, 0, barWidth + 4, barHeight + 4, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.5);
    
    // Progress fill — aligns with dot positions (currentPhase-1 intervals filled)
    const progressWidth = ((currentPhase - 1) / (totalPhases - 1)) * barWidth;
    const progressBar = scene.add.rectangle(startX, 0, 0, barHeight, 0x77888C)
        .setOrigin(0, 0.5);

    // Animate progress bar fill
    scene.tweens.add({
        targets: progressBar,
        width: progressWidth,
        duration: 800,
        ease: 'Power2.easeOut'
    });

    // Phase dots — positioned on the bar from left edge to right edge
    const dotContainer = scene.add.container(0, 0);

    for (let i = 0; i < totalPhases; i++) {
        const x = startX + (i * dotSpacing);
        const isComplete = i < currentPhase;
        const isCurrent = i === currentPhase - 1;
        
        // Dot fill - cleaner, no background circle
        const dotColor = isComplete || isCurrent ? 0x77888C : 0x556065;
        const dotSize = isCurrent ? 6 : 4;
        const dot = scene.add.circle(x, 0, dotSize, dotColor, isCurrent ? 1.0 : 0.5);
        
        dotContainer.add([dot]);
    }

    // Phase text
    const phaseText = scene.add.text(0, -25, `Phase ${currentPhase} of ${totalPhases}`, {
        fontFamily: 'dungeon-mode',
        fontSize: 18,
        color: '#77888C',
        align: 'center'
    }).setOrigin(0.5);

    container.add([barBgBorder, barBg, progressBar, dotContainer, phaseText]);
    container.setDepth(1500);
    container.setAlpha(0);

    // Fade in animation
    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 600,
        ease: 'Power2'
    });

    return container;
}

/**
 * Updates an existing progress indicator
 */
export function updateProgressIndicator(
    container: Phaser.GameObjects.Container,
    newPhase: number,
    totalPhases: number = 9
): void {
    if (!container || !container.active) return;

    const scene = container.scene;
    
    // Fade out and recreate
    scene.tweens.add({
        targets: container,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            const position = { x: container.x, y: container.y };
            container.destroy();
            const newIndicator = createProgressIndicator(scene, newPhase, totalPhases);
            newIndicator.setPosition(position.x, position.y);
        }
    });
}

import { Scene } from 'phaser';

export function showDialogue(scene: Scene, text: string, onComplete: () => void): Phaser.GameObjects.Container {
    const dialogueContainer = scene.add.container(scene.cameras.main.width / 2, scene.cameras.main.height / 2);

    // Define box size first
    const boxWidth = Math.min(scene.cameras.main.width * 0.90, 1400);
    const boxHeight = scene.cameras.main.height * 0.35; // Smaller height to clear phase title

    // Text should wrap INSIDE the box with padding
    const textWrapWidth = boxWidth - 100; // 50px padding on each side

    const dialogueText = scene.add.text(0, 0, text, {
        fontFamily: 'dungeon-mode',
        fontSize: 20,
        color: '#77888C',
        align: 'center',
        wordWrap: { width: textWrapWidth },
        lineSpacing: 8
    }).setOrigin(0.5);

    // Background - matching intro style
    const bg = scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x150E10, 0.95).setInteractive();

    // Double border design (matching intro style)
    const outerBorder = scene.add.rectangle(0, 0, boxWidth + 8, boxHeight + 8, undefined, 0)
        .setStrokeStyle(3, 0x77888C, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, boxWidth + 2, boxHeight + 2, undefined, 0)
        .setStrokeStyle(2, 0x556065, 0.6);

    dialogueText.setText(''); // Clear text for typing effect

    // Continue indicator - using arrow symbol
    const continueIndicator = scene.add.text(0, boxHeight / 2 - 35, '▼', {
        fontFamily: 'dungeon-mode',
        fontSize: 24,
        color: '#77888C'
    }).setOrigin(0.5).setAlpha(0.7).setVisible(false);

    dialogueContainer.add([bg, outerBorder, innerBorder, dialogueText, continueIndicator]);
    dialogueContainer.setDepth(2000);

    // Fade in with scale animation
    dialogueContainer.setAlpha(0).setScale(0.95);
    scene.tweens.add({
        targets: dialogueContainer,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut'
    });

    let typingComplete = false;
    let typingTimer: Phaser.Time.TimerEvent | null = null;

    const typeText = (textObject: Phaser.GameObjects.Text, text: string): Promise<void> => {
        if (typingTimer) {
            typingTimer.remove();
            typingTimer = null;
        }

        // Stop any tweens running on the text object itself
        scene.tweens.killTweensOf(textObject);

        return new Promise(resolve => {
            if (!textObject || !textObject.active) {
                resolve();
                return;
            }

            // Set the full text immediately
            textObject.setText(text);

            // Clean fade and slide-up animation
            textObject.setAlpha(0);
            textObject.setY(10); // start slightly lower (relative to container)

            scene.tweens.add({
                targets: textObject,
                alpha: 1,
                y: 0,
                duration: 800, // Slightly faster for tutorial
                ease: 'Power3.easeOut',
                onComplete: () => {
                    resolve();
                }
            });
        });
    };

    typeText(dialogueText, text).then(() => {
        typingComplete = true;
        continueIndicator.setVisible(true).setAlpha(0);
        scene.tweens.add({
            targets: continueIndicator,
            alpha: 1,
            y: '+=10',
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    });

    bg.on('pointerdown', () => {
        if (!typingComplete) {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            scene.tweens.killTweensOf(dialogueText);

            dialogueText.setAlpha(1);
            dialogueText.setY(0);
            dialogueText.setText(text);
            typingComplete = true;
            continueIndicator.setVisible(true).setAlpha(0);
            scene.tweens.add({
                targets: continueIndicator,
                alpha: 1,
                y: '+=10',
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            if (typingTimer) {
                typingTimer.remove();
                typingTimer = null;
            }
            scene.tweens.killTweensOf(continueIndicator);
            bg.removeAllListeners('pointerdown');
            scene.tweens.add({
                targets: dialogueContainer,
                alpha: 0,
                scale: 0.95,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    dialogueContainer.destroy();
                    onComplete();
                }
            });
        }
    });

    return dialogueContainer;
}

import { Scene, GameObjects } from 'phaser';

export function createButton(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    fixedWidth?: number // Optional fixed width parameter
): GameObjects.Container {
    const screenWidth = scene.cameras.main.width;
    const baseButtonWidth = 140;
    const baseButtonHeight = 45;
    
    const scaleFactor = Math.max(0.8, Math.min(1.2, screenWidth / 1024));
    
    const tempText = scene.add.text(0, 0, text, {
      fontFamily: "dungeon-mode",
      fontSize: Math.floor(18 * scaleFactor),
      color: "#77888C",
      align: "center"
    });
    
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();
    
    const paddingX = 40;
    const paddingY = 20;
    // Use fixed width if provided, otherwise auto-size
    const buttonWidth = fixedWidth || Math.max(baseButtonWidth, textWidth + paddingX);
    const buttonHeight = Math.max(baseButtonHeight, textHeight + paddingY);

    const button = scene.add.container(x, y);

    const outerBorder = scene.add.rectangle(0, 0, buttonWidth + 8, buttonHeight + 8, undefined, 0)
      .setStrokeStyle(2, 0x77888C, 0.8);
    const innerBorder = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, undefined, 0)
      .setStrokeStyle(1, 0x77888C, 0.6);
    const bg = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10);

    const buttonText = scene.add.text(0, 0, text, {
        fontFamily: "dungeon-mode",
        fontSize: Math.floor(18 * scaleFactor),
        color: "#77888C",
        align: "center",
        wordWrap: { width: buttonWidth - 20, useAdvancedWrap: true }
      })
      .setOrigin(0.5);

    button.add([outerBorder, innerBorder, bg, buttonText]);
    button.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    button.on("pointerdown", () => {
      if ((scene as any).getIsActionProcessing && (scene as any).getIsActionProcessing()) {
        return;
      }
      
      scene.tweens.add({
        targets: button,
        scale: 0.92,
        duration: 80,
        ease: 'Power2',
        onComplete: () => {
          scene.tweens.add({
            targets: button,
            scale: 1,
            duration: 80,
            ease: 'Power2'
          });
        }
      });
      callback();
    });
    
    button.on("pointerover", () => {
      bg.setFillStyle(0x1f1410);
      buttonText.setColor("#e8eced");
      scene.tweens.add({
        targets: button,
        scale: 1.08,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });
    
    button.on("pointerout", () => {
      bg.setFillStyle(0x150E10);
      buttonText.setColor("#77888C");
      scene.tweens.add({
        targets: button,
        scale: 1,
        duration: 150,
        ease: 'Back.easeOut'
      });
    });

    return button;
}

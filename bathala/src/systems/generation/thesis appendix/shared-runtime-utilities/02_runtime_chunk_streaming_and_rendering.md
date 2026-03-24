# Shared - Runtime Chunk Streaming and Rendering

Source: `src/systems/generation/MazeGenSystem.ts`

```ts
/**
 * Runtime streaming: unload far chunks, load new visible chunks, sync node sprites.
 */
updateVisibleChunks(camera: Phaser.Cameras.Scene2D.Camera): void {
    const chunkSizePixels = this.overworldGen.chunkSize * this.gridSize;

    const startX = Math.floor((camera.scrollX - chunkSizePixels) / chunkSizePixels);
    const endX = Math.ceil((camera.scrollX + camera.width + chunkSizePixels) / chunkSizePixels);
    const startY = Math.floor((camera.scrollY - chunkSizePixels) / chunkSizePixels);
    const endY = Math.ceil((camera.scrollY + camera.height + chunkSizePixels) / chunkSizePixels);

    // Remove non-visible chunks.
    for (const [key, chunk] of this.visibleChunks) {
        const [chunkX, chunkY] = key.split(',').map(Number);
        if (chunkX < startX || chunkX > endX || chunkY < startY || chunkY > endY) {
            chunk.graphics.destroy();
            this.visibleChunks.delete(key);
        }
    }

    // Add newly visible chunks.
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const key = `${x},${y}`;
            if (!this.visibleChunks.has(key)) {
                const chunk = this.overworldGen.getChunk(x, y, this.gridSize);
                const graphics = this.renderChunk(x, y, chunk.maze);
                this.visibleChunks.set(key, { maze: chunk.maze, graphics });

                chunk.nodes.forEach(node => {
                    const existingNodeIndex = this.nodes.findIndex(n => n.id === node.id);
                    if (existingNodeIndex === -1) this.nodes.push(node);
                });
            }
        }
    }
}
```

```ts
/**
 * Draws tilemap chunk at runtime.
 * PATH tiles get floor textures, non-PATH tiles get wall/feature textures.
 */
private renderChunk(chunkX: number, chunkY: number, maze: number[][]): Phaser.GameObjects.GameObject {
    const container = this.scene.add.container(0, 0);
    const chunkSize = this.overworldGen.chunkSize;
    const chunkSizePixels = chunkSize * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;

    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[0].length; x++) {
            const tileX = offsetX + x * this.gridSize;
            const tileY = offsetY + y * this.gridSize;
            const tileValue = maze[y][x];

            if (tileValue !== 0) {
                const textureKey = this.getWallTexture(tileValue, maze, chunkX, chunkY, x, y);
                const wallSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, textureKey);
                wallSprite.setDisplaySize(this.gridSize, this.gridSize);
                wallSprite.setOrigin(0.5);
                container.add(wallSprite);
            } else {
                const floorIndex = this.getDeterministicIndex(chunkX, chunkY, x, y, this.floorTextures.length);
                const floorSprite = this.scene.add.image(tileX + this.gridSize / 2, tileY + this.gridSize / 2, this.floorTextures[floorIndex]);
                floorSprite.setDisplaySize(this.gridSize, this.gridSize);
                floorSprite.setOrigin(0.5);
                container.add(floorSprite);
            }
        }
    }

    return container;
}
```

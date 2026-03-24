# Act 2 - Chunk Seams and Internal Connectivity

Source: `src/systems/generation/algorithms/submerged-village/SubmergedVillageChunkAdapter.ts`

```ts
/**
 * Chooses zone preset (dense / transition / forest), generates chunk,
 * then enforces seam portals + internal connectivity.
 */
generate(chunkX: number, chunkY: number, rng: SeededRandom): RawChunk {
    const { type, bias } = this.getChunkType(chunkX, chunkY);

    let params: VillageLayoutParams;
    switch (type) {
        case VillageChunkType.DENSE:
            params = densePreset(this.cfg);
            break;
        case VillageChunkType.TRANSITION:
            params = transitionPreset(this.cfg, bias ?? { x: 0, y: 0 });
            break;
        case VillageChunkType.FOREST:
        default:
            params = forestPreset(this.cfg);
            break;
    }

    const gen = new SubmergedVillageAlgorithm();
    gen.levelSize = [this.chunkSize, this.chunkSize];
    const intGrid = gen.generateLayout(() => rng.next(), params);

    const grid: number[][] = [];
    for (let y = 0; y < this.chunkSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < this.chunkSize; x++) {
            row.push(intGrid.getTile(x, y));
        }
        grid.push(row);
    }

    this.forceSeamConnectivity(grid, chunkX, chunkY);
    this.forceInternalConnectivity(grid);

    const borderConnections = findBorderConnections(grid, this.chunkSize);
    return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
}
```

```ts
/**
 * Guarantees portals on all chunk borders.
 * Each portal is connected to the nearest existing network path.
 */
private forceSeamConnectivity(grid: number[][], chunkX: number, chunkY: number): void {
    const size = this.chunkSize;

    const topXs = this.seamPortals(`V:${chunkX}:${chunkY - 1}`);
    const bottomXs = this.seamPortals(`V:${chunkX}:${chunkY}`);
    const leftYs = this.seamPortals(`H:${chunkX - 1}:${chunkY}`);
    const rightYs = this.seamPortals(`H:${chunkX}:${chunkY}`);

    for (const x of topXs) this.carvePortalAndConnect(grid, [x, 0], [x, 1]);
    for (const x of bottomXs) this.carvePortalAndConnect(grid, [x, size - 1], [x, size - 2]);
    for (const y of leftYs) this.carvePortalAndConnect(grid, [0, y], [1, y]);
    for (const y of rightYs) this.carvePortalAndConnect(grid, [size - 1, y], [size - 2, y]);
}
```

```ts
/**
 * If multiple path components remain, connect them by nearest-pair carving.
 */
private forceInternalConnectivity(grid: number[][]): void {
    const components = this.collectComponents(grid);
    if (components.length <= 1) return;

    components.sort((a, b) => b.length - a.length);
    let main = components[0];

    for (let index = 1; index < components.length; index++) {
        const other = components[index];
        const [a, b] = this.closestPair(main, other);
        const route = this.shortestCarvePath(grid, a, b);
        for (const [x, y] of route) {
            if (grid[y][x] !== 2) {
                grid[y][x] = 0;
            }
        }
        main = [...main, ...other];
    }
}
```

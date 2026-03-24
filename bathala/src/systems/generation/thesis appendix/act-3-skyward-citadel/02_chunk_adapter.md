# Act 3 - Chunk Adapter

Source: `src/systems/generation/algorithms/skyward-citadel/SkywardCitadelChunkAdapter.ts`

```ts
/**
 * Adapter from Skyward algorithm output -> RawChunk used by OverworldGenerator.
 */
generate(_chunkX: number, _chunkY: number, rng: SeededRandom): RawChunk {
    const gen = new SkywardCitadelGenerator();
    gen.levelSize = [this.chunkSize, this.chunkSize];
    gen.platformCount = Math.floor(this.chunkSize * this.platformCountMultiplier);
    gen.minPlatformDistance = this.minPlatformDistance;

    const intGrid = gen.generateLayout(() => rng.next());

    const grid: number[][] = [];
    for (let y = 0; y < this.chunkSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < this.chunkSize; x++) {
            row.push(intGrid.getTile(x, y));
        }
        grid.push(row);
    }

    const borderConnections = findBorderConnections(grid, this.chunkSize);
    return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
}
```

```ts
/**
 * Border scanning utility used by adapters to expose seam openings.
 */
export function findBorderConnections(
    grid: number[][],
    gridSize: number,
    config: BorderConnectionConfig = {},
): BorderConnection[] {
    const { pathTile, firstOnly } = { ...DEFAULTS, ...config };
    const connections: BorderConnection[] = [];

    const scanBorder = (
        iterate: () => Iterable<{ x: number; y: number }>,
        direction: BorderConnection['direction'],
    ) => {
        for (const { x, y } of iterate()) {
            if (grid[y]?.[x] === pathTile) {
                connections.push({ x, y, direction });
                if (firstOnly) return;
            }
        }
    };

    scanBorder(function* () { for (let x = 1; x < gridSize - 1; x++) yield { x, y: gridSize - 1 }; }, 'north');
    scanBorder(function* () { for (let x = 1; x < gridSize - 1; x++) yield { x, y: 0 }; }, 'south');
    scanBorder(function* () { for (let y = 1; y < gridSize - 1; y++) yield { x: gridSize - 1, y }; }, 'east');
    scanBorder(function* () { for (let y = 1; y < gridSize - 1; y++) yield { x: 0, y }; }, 'west');

    return connections;
}
```

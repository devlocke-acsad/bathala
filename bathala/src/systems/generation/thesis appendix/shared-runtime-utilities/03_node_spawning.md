# Shared - Node Spawning on Generated Terrain

Sources:
- `src/systems/generation/node-spawning/NodePopulator.ts`
- `src/systems/generation/node-spawning/NodePlacement.ts`

```ts
/**
 * Populates gameplay nodes after terrain generation.
 */
populate(
    grid: number[][],
    chunkX: number,
    chunkY: number,
    chunkSize: number,
    gridSize: number,
    rng: RNG,
): MapNode[] {
    const { edgeMargin, minOpenNeighbors, baseNodeCount, minDistanceFactor } = this.config;
    const nodes: MapNode[] = [];

    const validPositions = findValidPositions(
        grid, chunkSize, chunkSize,
        { edgeMargin, minOpenNeighbors, minDistanceFactor },
    );
    if (validPositions.length === 0) return nodes;

    const effectiveBase = Math.min(baseNodeCount, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + effectiveBase;

    const minNodeDistance = chunkSize / minDistanceFactor;
    const placed: GridPosition[] = [];
    const mutablePositions = [...validPositions];

    for (let i = 0; i < nodeCount && mutablePositions.length > 0; i++) {
        const pos = selectSpacedPosition(mutablePositions, placed, minNodeDistance, rng);
        if (!pos) continue;

        const type = this.rollNodeType(rng);
        const entityId = this.resolveEntity(type, rng);

        nodes.push({
            id: `${type}-${chunkX}-${chunkY}-${i}`,
            type,
            x: (chunkX * chunkSize + pos.x) * gridSize,
            y: (chunkY * chunkSize + pos.y) * gridSize,
            row: chunkY * chunkSize + pos.y,
            connections: [],
            visited: false,
            available: true,
            completed: false,
            enemyId: entityId,
        });

        placed.push(pos);
        const idx = mutablePositions.findIndex(p => p.x === pos.x && p.y === pos.y);
        if (idx >= 0) mutablePositions.splice(idx, 1);
    }

    return nodes;
}
```

```ts
/**
 * Finds valid spawn points on PATH tiles with openness constraints.
 */
export function findValidPositions(
    grid: number[][],
    gridWidth: number,
    gridHeight: number,
    config: PlacementConfig,
): GridPosition[] {
    const { edgeMargin, minOpenNeighbors } = config;
    const positions: GridPosition[] = [];

    for (let y = edgeMargin; y < gridHeight - edgeMargin; y++) {
        for (let x = edgeMargin; x < gridWidth - edgeMargin; x++) {
            if (grid[y][x] !== PATH) continue;

            let openNeighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (grid[y + dy]?.[x + dx] === PATH) openNeighbors++;
                }
            }

            if (openNeighbors >= minOpenNeighbors) {
                positions.push({ x, y });
            }
        }
    }

    return positions;
}
```

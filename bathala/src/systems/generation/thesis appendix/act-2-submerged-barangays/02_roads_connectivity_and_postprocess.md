# Act 2 - Roads, Connectivity, and Post-processing

Source: `src/systems/generation/algorithms/submerged-village/SubmergedVillageAlgorithm.ts`

```ts
/**
 * Carves roads between house doors, then ensures border access.
 */
private carveRoads(grid: IntGrid, houses: PlacedHouse[], params: VillageLayoutParams): void {
    this.carveDoorStubs(grid, houses, params.doorStubLength);

    if (houses.length > 0) {
        const edges = this.buildRoadGraph(houses, params.roadNeighborCount);
        edges.sort((a, b) => a.dist - b.dist);

        for (const edge of edges) {
            const start: [number, number] = [edge.doorA.x, edge.doorA.y];
            const end: [number, number] = [edge.doorB.x, edge.doorB.y];

            grid.setTile(start[0], start[1], TILE.PATH);
            grid.setTile(end[0], end[1], TILE.PATH);

            const path = this.findRoad(start, end, grid);
            if (path) {
                for (const [px, py] of path) {
                    if (grid.getTile(px, py) !== TILE.HOUSE) {
                        grid.setTile(px, py, TILE.PATH);
                    }
                }
            }
        }
    }

    this.ensureBorderAccess(grid, params);
}
```

```ts
/**
 * A* road routing.
 * - avoids HOUSE tiles
 * - prefers existing PATH tiles
 * - adds a small turn penalty
 */
private findRoad(start: [number, number], end: [number, number], grid: IntGrid): [number, number][] | null {
    const [w, h] = this.levelSize;
    const open: RoadNode[] = [];
    const closed = new Set<string>();
    const nodes = new Map<string, RoadNode>();

    const startNode = new RoadNode(start, null, 0, this.manhattan(start, end));
    open.push(startNode);
    nodes.set(startNode.key(), startNode);

    while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);
        const current = open.shift()!;

        if (current.pos[0] === end[0] && current.pos[1] === end[1]) {
            return this.reconstructRoad(current);
        }

        closed.add(current.key());

        for (const [nx, ny] of this.neighbors4(current.pos)) {
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const nk = `${nx},${ny}`;
            if (closed.has(nk)) continue;

            const tile = grid.getTile(nx, ny);
            if (tile === TILE.HOUSE) continue;

            let cost = this.BASE_TILE_COST;
            if (tile === TILE.PATH) cost = this.EXISTING_PATH_COST;
            else if (tile === TILE.FENCE) cost = this.BASE_TILE_COST * 1.5;

            if (current.parent) {
                const prevDx = current.pos[0] - current.parent.pos[0];
                const prevDy = current.pos[1] - current.parent.pos[1];
                const nextDx = nx - current.pos[0];
                const nextDy = ny - current.pos[1];
                if (prevDx !== nextDx || prevDy !== nextDy) {
                    cost += this.DIRECTION_CHANGE_PENALTY;
                }
            }

            const newG = current.g + cost;
            if (!nodes.has(nk)) {
                const node = new RoadNode([nx, ny], current, newG, this.manhattan([nx, ny], end));
                nodes.set(nk, node);
                open.push(node);
            } else {
                const existing = nodes.get(nk)!;
                if (newG < existing.g && !closed.has(nk)) {
                    existing.parent = current;
                    existing.g = newG;
                    existing.f = newG + existing.h;
                }
            }
        }
    }

    return null;
}
```

```ts
/**
 * Ensures a single connected PATH component by bridging islands.
 */
private ensureGlobalAccessibility(grid: IntGrid): void {
    let components = this.collectPathComponents(grid);
    if (components.length <= 1) return;

    components.sort((a, b) => b.length - a.length);
    let main = components[0];

    for (let index = 1; index < components.length; index++) {
        const island = components[index];
        const pair = this.findClosestPathPair(main, island);
        if (!pair) continue;

        const connector = this.findRoad(pair.a, pair.b, grid);
        if (!connector) continue;

        for (const [x, y] of connector) {
            if (grid.getTile(x, y) !== TILE.HOUSE) {
                grid.setTile(x, y, TILE.PATH);
            }
        }

        components = this.collectPathComponents(grid).sort((a, b) => b.length - a.length);
        main = components[0] ?? main;
    }
}
```

```ts
/**
 * Removes double-wide paths, then prunes/loops dead ends.
 */
private fixDoubleWidePaths(grid: IntGrid): void {
    const [w, h] = this.levelSize;
    let changed = true;
    let iter = 0;

    while (changed && iter < this.MAX_DOUBLE_WIDE_FIX_ITER) {
        changed = false;
        iter++;

        for (let x = 0; x < w - 1; x++) {
            for (let y = 0; y < h - 1; y++) {
                if (grid.getTile(x, y) === TILE.PATH &&
                    grid.getTile(x + 1, y) === TILE.PATH &&
                    grid.getTile(x, y + 1) === TILE.PATH &&
                    grid.getTile(x + 1, y + 1) === TILE.PATH) {

                    const block: [number, number][] = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]];
                    const scores = block.map(([bx, by]) => {
                        const external = this.neighbors4([bx, by])
                            .filter(([nx, ny]) => !block.some(([bx2, by2]) => bx2 === nx && by2 === ny))
                            .filter(([nx, ny]) => nx >= 0 && nx < w && ny >= 0 && ny < h && grid.getTile(nx, ny) === TILE.PATH)
                            .length;
                        return { pos: [bx, by] as [number, number], external };
                    });

                    scores.sort((a, b) => a.external - b.external);
                    const victim = scores[0];
                    grid.setTile(victim.pos[0], victim.pos[1], TILE.FOREST);
                    changed = true;
                }
            }
        }
    }
}
```

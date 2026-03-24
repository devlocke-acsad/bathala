# Act 2 - Village Pipeline and House Placement

Source: `src/systems/generation/algorithms/submerged-village/SubmergedVillageAlgorithm.ts`

```ts
/**
 * Main Act 2 pipeline: terrain + objects + post-processing.
 */
generateLayout(rng?: () => number, params?: Partial<VillageLayoutParams>): IntGrid {
    if (rng) this.rng = rng;
    const p: VillageLayoutParams = { ...DEFAULT_VILLAGE_PARAMS, ...params };

    const [w, h] = this.levelSize;
    const grid = new IntGrid(w, h);

    // 1) Fill forest base
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            grid.setTile(x, y, TILE.FOREST);
        }
    }

    // 2) Place houses and settlement ground
    const houses = this.placeHouses(grid, p);
    if (p.houseClearRadius > 0) this.clearAroundHouses(grid, houses, p.houseClearRadius);
    if (p.villageGroundGrowth > 0) this.growVillageGround(grid, houses, p.villageGroundGrowth);

    if (houses.length === 0) {
        grid.setTile(Math.floor(w / 2), Math.floor(h / 2), TILE.PATH);
    }

    // 3) Roads + connectivity + detours
    if (p.fenceChance > 0) this.placeFences(grid, houses, p.fenceChance);
    this.carveRoads(grid, houses, p);
    this.ensureGlobalAccessibility(grid);
    this.addDetourRoutes(grid, p);
    this.ensureGlobalAccessibility(grid);

    // 4) Optional decor + strict path cleanup
    if (p.rubbleChance > 0) this.scatterRubble(grid, p.rubbleChance);
    if (p.scatterTreeChance > 0) this.scatterDecorativeTrees(grid, p.scatterTreeChance);
    this.fixDoubleWidePaths(grid);
    this.resolveNearMissCorners(grid);
    this.reduceDeadEnds(grid, houses);

    // 5) Final terrain conversion and obstacle pass
    this.ensureGlobalAccessibility(grid);
    this.fixDoubleWidePaths(grid);
    this.reduceDeadEnds(grid, houses);
    this.ensureGlobalAccessibility(grid);
    this.applyBiomeTerrainFeatures(grid, p);
    this.repairPathGapsAfterBiome(grid);
    this.scatterObstacles(grid);

    return grid;
}
```

```ts
/**
 * Keeps all PATH tiles in one connected component.
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
 * Adds optional alternate routes between existing PATH tiles.
 */
private addDetourRoutes(grid: IntGrid, params: VillageLayoutParams): void {
    if (params.detourCount <= 0) return;

    const pathTiles = this.getPathTiles(grid);
    if (pathTiles.length < 2) return;

    const attempts = params.detourCount * 8;
    let carved = 0;

    for (let attempt = 0; attempt < attempts && carved < params.detourCount; attempt++) {
        const start = pathTiles[Math.floor(this.rng() * pathTiles.length)];
        const candidates = pathTiles.filter(tile => {
            const dist = this.manhattan(start, tile);
            return dist >= params.detourMinDistance && dist <= params.detourMaxDistance;
        });
        if (candidates.length === 0) continue;

        const end = candidates[Math.floor(this.rng() * candidates.length)];
        const route = this.findRoad(start, end, grid);
        if (!route || route.length < 3) continue;

        for (const [x, y] of route) {
            if (grid.getTile(x, y) !== TILE.HOUSE) {
                grid.setTile(x, y, TILE.PATH);
            }
        }
        carved++;
    }
}
```

```ts
/**
 * Removes 2x2 PATH blocks to keep routes one-tile wide.
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

```ts
/**
 * Removes long dead-end chains, while preserving doors and border exits.
 */
private reduceDeadEnds(grid: IntGrid, houses: PlacedHouse[]): void {
    const [w, h] = this.levelSize;
    const doorSet = new Set(houses.map(h => `${h.door.x},${h.door.y}`));
    const edgeSet = this.collectBorderPathSet(grid);
    const protectedSet = new Set<string>([...doorSet, ...edgeSet]);

    for (let pass = 0; pass < this.DEAD_END_PASSES; pass++) {
        let changed = false;

        for (let x = 1; x < w - 1; x++) {
            for (let y = 1; y < h - 1; y++) {
                if (grid.getTile(x, y) !== TILE.PATH) continue;

                const pathNeighbors = this.neighbors4([x, y]).filter(
                    ([nx, ny]) => grid.getTile(nx, ny) === TILE.PATH
                );
                if (pathNeighbors.length !== 1) continue;

                const key = `${x},${y}`;
                if (protectedSet.has(key)) continue;

                const chain = this.collectDeadEndChain([x, y], grid, protectedSet);
                if (chain.length === 0) continue;

                if (this.tryConvertDeadEndToLoop(chain, grid, protectedSet)) {
                    changed = true;
                    continue;
                }

                if (this.pruneDeadEndChain(chain, grid, protectedSet)) {
                    changed = true;
                }
            }
        }

        if (!changed) break;
    }
}
```

```ts
/**
 * Converts non-path terrain into biome feature families (water/cliffs/hills/patches),
 * then re-validates shape quality.
 */
private applyBiomeTerrainFeatures(grid: IntGrid, params: VillageLayoutParams): void {
    const [w, h] = this.levelSize;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (grid.getTile(x, y) !== TILE.PATH) {
                grid.setTile(x, y, TILE.FOREST);
            }
        }
    }

    this.paintSimpleWaterPonds(grid, params.waterPoolCount);

    const totalCliffGroups = Math.max(1, params.cliffBandCount);
    const irregularCliffCount = Math.max(2, Math.ceil(totalCliffGroups * 0.7));
    const simpleCliffCount = Math.max(1, totalCliffGroups - irregularCliffCount);
    this.paintIrregularCliffHillFormations(grid, irregularCliffCount);
    this.paintSimpleCliffHillFormations(grid, simpleCliffCount);

    const totalHillGroups = Math.max(1, params.hillClusterCount);
    this.paintSimpleHillFormations(grid, totalHillGroups);

    this.repairCliffGaps(grid);
    this.enforceCliffShellIntegrity(grid);
    this.removeCliffFragments(grid, 8);
    this.enforceStrictHillBundles(grid);

    const grassTotal = Math.max(1, params.grassPatchCount);
    this.paintGrassPatchesSequentially(grid, grassTotal);
    this.enforceGrassPatchMinThickness(grid);

    const sandTotal = Math.max(1, params.sandPatchCount);
    this.paintSimpleSandPatch2x2Formations(grid, sandTotal);

    this.enforceCliffObstacleClearance(grid, 1);
    this.removeCliffFragments(grid, 8);
    this.enforceStrictHillBundles(grid);
    this.enforceStrictSandPatchBundles(grid);
    this.enforceGrassPatchMinThickness(grid);
    this.enforceGrassPatchShapeQuality(grid);
}
```

```ts
/**
 * Repairs small path breaks caused by biome overlays.
 */
private repairPathGapsAfterBiome(grid: IntGrid): void {
    const [w, h] = this.levelSize;
    const toPath: Array<[number, number]> = [];

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const tile = grid.getTile(x, y);
            if (tile === TILE.PATH || tile === TILE.WATER || tile === TILE.CLIFF) continue;

            const north = grid.getTile(x, y - 1) === TILE.PATH;
            const south = grid.getTile(x, y + 1) === TILE.PATH;
            const east = grid.getTile(x + 1, y) === TILE.PATH;
            const west = grid.getTile(x - 1, y) === TILE.PATH;
            const pathNeighbors = Number(north) + Number(south) + Number(east) + Number(west);

            if ((north && south) || (east && west) || pathNeighbors >= 3) {
                toPath.push([x, y]);
            }
        }
    }

    for (const [x, y] of toPath) {
        grid.setTile(x, y, TILE.PATH);
    }
}
```

```ts
/**
 * Final object pass: convert remaining FOREST tiles into obstacles.
 */
private scatterObstacles(grid: IntGrid): void {
    const [w, h] = this.levelSize;
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            if (grid.getTile(x, y) === TILE.FOREST) {
                grid.setTile(x, y, TILE.OBSTACLE);
            }
        }
    }
}
```

```ts
/**
 * Places multi-tile houses in clustered neighborhoods.
 */
private placeHouses(grid: IntGrid, p: VillageLayoutParams): PlacedHouse[] {
    const [w, h] = this.levelSize;
    const margin = p.edgeMargin;
    const houses: PlacedHouse[] = [];
    const templates = getTemplates(p.houseSizePreference);

    const baseCx = w / 2 + (p.centerBias?.x ?? 0) * w * 0.25;
    const baseCy = h / 2 + (p.centerBias?.y ?? 0) * h * 0.25;

    const centers: Array<{ x: number; y: number }> = [];
    const minCenterDist = Math.min(w, h) * 0.35;
    for (let attempt = 0; attempt < 200 && centers.length < p.neighborhoodCount; attempt++) {
        const spread = Math.min(w, h) * 0.2;
        const cx = Math.floor(baseCx + (this.rng() - 0.5) * spread);
        const cy = Math.floor(baseCy + (this.rng() - 0.5) * spread);
        const clampedCx = Math.max(margin + 2, Math.min(w - margin - 2, cx));
        const clampedCy = Math.max(margin + 2, Math.min(h - margin - 2, cy));
        const tooClose = centers.some(c =>
            Math.abs(c.x - clampedCx) + Math.abs(c.y - clampedCy) < minCenterDist
        );
        if (!tooClose) centers.push({ x: clampedCx, y: clampedCy });
    }

    if (centers.length === 0) {
        centers.push({
            x: Math.max(margin + 2, Math.min(w - margin - 2, Math.floor(baseCx))),
            y: Math.max(margin + 2, Math.min(h - margin - 2, Math.floor(baseCy))),
        });
    }

    const housesPerCenter = Math.max(1, Math.ceil(p.houseCount / centers.length));
    for (const center of centers) {
        for (let i = 0; i < housesPerCenter && houses.length < p.houseCount; i++) {
            const placed = this.tryPlaceHouseNear(grid, center, houses, p, templates);
            if (placed) houses.push(placed);
        }
    }

    return houses;
}
```

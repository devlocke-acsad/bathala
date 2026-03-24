# Act 3 - Sky Platform Pipeline

Source: `src/systems/generation/algorithms/skyward-citadel/SkywardCitadelAlgorithm.ts`

```ts
/**
 * Main Act 3 generation:
 * - platform seeds
 * - triangulated bridge graph
 * - A* cloud bridges
 * - post-processing
 */
generateLayout(rng?: () => number): IntGrid {
    if (rng) this.rng = rng;
    this.edges = [];

    const platforms = this.generatePlatforms();
    if (platforms.length < 3) {
        throw new Error('Need at least 3 platforms for triangulation');
    }

    const edges = this.createSimpleTriangulation(platforms);

    const intGrid = new IntGrid(this.levelSize[0], this.levelSize[1]);
    for (let x = 0; x < this.levelSize[0]; x++) {
        for (let y = 0; y < this.levelSize[1]; y++) {
            intGrid.setTile(x, y, this.VOID_TILE);
        }
    }

    // Carve floating platforms.
    for (const platform of platforms) {
        this.carvePlatform(platform, intGrid);
    }

    // Carve cloud bridges.
    edges.sort((a, b) => this.edgeLength(a) - this.edgeLength(b));
    for (const edge of edges) {
        this.edges.push(edge);
        const point1: [number, number] = [Math.floor(edge.p.x), Math.floor(edge.p.y)];
        const point2: [number, number] = [Math.floor(edge.q.x), Math.floor(edge.q.y)];

        const path = this.findPath(point1, point2, intGrid);
        if (path) {
            for (const pathPoint of path) {
                intGrid.setTile(pathPoint[0], pathPoint[1], this.PATH_TILE);
            }
        }
    }

    this.fixDoubleWidePaths(intGrid);
    this.addPlatformEdges(intGrid);
    return intGrid;
}
```

```ts
/**
 * Creates circular cloud platforms from seed center + radius.
 */
private carvePlatform(platform: Point & { radius: number }, intGrid: IntGrid): void {
    const radiusSq = platform.radius ** 2;

    for (let dx = -platform.radius; dx <= platform.radius; dx++) {
        for (let dy = -platform.radius; dy <= platform.radius; dy++) {
            const distSq = dx * dx + dy * dy;
            if (distSq <= radiusSq) {
                const x = platform.x + dx;
                const y = platform.y + dy;
                if (x >= 0 && x < this.levelSize[0] && y >= 0 && y < this.levelSize[1]) {
                    intGrid.setTile(x, y, this.PATH_TILE);
                }
            }
        }
    }
}
```

```ts
/**
 * Adds visual edge tiles around PATH where adjacent VOID exists.
 */
private addPlatformEdges(intGrid: IntGrid): void {
    for (let x = 0; x < this.levelSize[0]; x++) {
        for (let y = 0; y < this.levelSize[1]; y++) {
            if (intGrid.getTile(x, y) === this.PATH_TILE) {
                const neighbors = this.getNeighbors([x, y]);
                const hasVoidNeighbor = neighbors.some(n =>
                    n[0] >= 0 && n[0] < this.levelSize[0] &&
                    n[1] >= 0 && n[1] < this.levelSize[1] &&
                    intGrid.getTile(n[0], n[1]) === this.VOID_TILE
                );

                if (hasVoidNeighbor && this.rng() < 0.2) {
                    intGrid.setTile(x, y, this.EDGE_TILE);
                }
            }
        }
    }
}
```

```ts
/**
 * Samples floating platform seeds with radius and spacing constraints.
 */
private generatePlatforms(): Array<Point & { radius: number }> {
    const platforms: Array<Point & { radius: number }> = [];
    let attempts = 0;

    while (platforms.length < this.platformCount && attempts < this.MAX_PLATFORM_ATTEMPTS) {
        attempts++;
        const x = Math.floor(this.rng() * this.levelSize[0]);
        const y = Math.floor(this.rng() * this.levelSize[1]);
        const radius = this.PLATFORM_RADIUS_MIN +
            Math.floor(this.rng() * (this.PLATFORM_RADIUS_MAX - this.PLATFORM_RADIUS_MIN + 1));

        const newPlatform = Object.assign(new Point(x, y), { radius });

        let tooClose = false;
        for (const existing of platforms) {
            const distanceSq = (newPlatform.x - existing.x) ** 2 + (newPlatform.y - existing.y) ** 2;
            const minDist = this.minPlatformDistance + newPlatform.radius + existing.radius;
            if (distanceSq < minDist ** 2) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            platforms.push(newPlatform);
        }
    }

    return platforms;
}
```

```ts
/**
 * A* bridge routing with path reuse preference and turn penalties.
 */
private findPathSegment(start: [number, number], end: [number, number], intGrid: IntGrid): [number, number][] | null {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();
    const pathNodes = new Map<string, PathNode>();

    const startNode = new PathNode(start, null, 0, this.getHeuristic(start, end));
    openSet.push(startNode);
    pathNodes.set(startNode.getKey(), startNode);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const currentNode = openSet.shift()!;

        if (currentNode.position[0] === end[0] && currentNode.position[1] === end[1]) {
            return this.reconstructPath(currentNode);
        }

        closedSet.add(currentNode.getKey());

        for (const neighborPos of this.getNeighbors(currentNode.position)) {
            if (neighborPos[0] < 0 || neighborPos[0] >= this.levelSize[0] ||
                neighborPos[1] < 0 || neighborPos[1] >= this.levelSize[1]) {
                continue;
            }

            const neighborKey = `${neighborPos[0]},${neighborPos[1]}`;
            if (closedSet.has(neighborKey)) continue;

            let tileCost = this.BASE_TILE_COST;
            if (intGrid.getTile(neighborPos[0], neighborPos[1]) === this.PATH_TILE) {
                tileCost = 1.0;
            }

            if (currentNode.parent) {
                tileCost += this.getDirectionChangeCost(
                    currentNode.parent.position,
                    currentNode.position,
                    neighborPos
                );
            }

            const newG = currentNode.g + tileCost;

            if (!pathNodes.has(neighborKey)) {
                const neighborNode = new PathNode(neighborPos, currentNode, newG, this.getHeuristic(neighborPos, end));
                pathNodes.set(neighborKey, neighborNode);
                openSet.push(neighborNode);
            } else {
                const neighborNode = pathNodes.get(neighborKey)!;
                if (newG < neighborNode.g && !closedSet.has(neighborKey)) {
                    neighborNode.parent = currentNode;
                    neighborNode.g = newG;
                    neighborNode.f = neighborNode.g + neighborNode.h;
                }
            }
        }
    }

    return null;
}
```

```ts
/**
 * Post-process: remove 2x2 PATH blocks.
 */
private fixDoubleWidePaths(intGrid: IntGrid): void {
    let changesMade = true;
    let iterations = 0;

    while (changesMade && iterations < this.MAX_DOUBLE_WIDE_FIX_ITER) {
        changesMade = false;
        iterations++;

        const blocks = this.findDoubleWideBlocks(intGrid);
        for (const block of blocks) {
            if (this.fixSingleDoubleWideBlock(block, intGrid)) {
                changesMade = true;
            }
        }
    }
}
```

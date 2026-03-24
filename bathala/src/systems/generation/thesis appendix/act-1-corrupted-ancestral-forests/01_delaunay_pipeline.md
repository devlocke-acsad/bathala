# Act 1 - Delaunay Terrain Pipeline

Source: `src/systems/generation/algorithms/delaunay-maze/DelaunayMazeAlgorithm.ts`

```ts
/**
 * Main terrain pipeline for Act 1.
 * 1) seed regions -> 2) triangulate -> 3) carve A* corridors ->
 * 4) remove 2x2 path blocks -> 5) reduce dead ends.
 */
generateLayout(rng?: () => number): IntGrid {
    if (rng) this.rng = rng;
    this.edges = [];

    const points = this.generateRegionPoints();
    if (points.length < 3) {
        throw new Error('Need at least 3 points for triangulation');
    }

    const edges = this.createSimpleTriangulation(points);
    const intGrid = new IntGrid(this.levelSize[0], this.levelSize[1]);

    // Fill all tiles as REGION first.
    for (let x = 0; x < this.levelSize[0]; x++) {
        for (let y = 0; y < this.levelSize[1]; y++) {
            intGrid.setTile(x, y, this.REGION_TILE);
        }
    }

    edges.sort((a, b) => this.edgeLength(a) - this.edgeLength(b));

    // Carve each corridor using waypoint + A* pathing.
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
    this.reduceDeadEnds(intGrid);
    return intGrid;
}
```

```ts
/**
 * A* segment pathfinder used by corridor carving.
 * - prefers straight movement with a small turn penalty
 * - returns null if no route is found
 */
private findPathSegment(start: [number, number], end: [number, number], _intGrid: IntGrid): [number, number][] | null {
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
            if (currentNode.parent) {
                const directionCost = this.getDirectionChangeCost(
                    currentNode.parent.position,
                    currentNode.position,
                    neighborPos
                );
                tileCost += directionCost;
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
 * Post-process to enforce single-tile corridors.
 * Removes one tile from every 2x2 PATH block.
 */
private fixDoubleWidePaths(intGrid: IntGrid): void {
    let changesMade = true;
    let iterations = 0;

    while (changesMade && iterations < this.MAX_DOUBLE_WIDE_FIX_ITER) {
        changesMade = false;
        iterations++;

        const doubleWideBlocks = this.findDoubleWideBlocks(intGrid);
        for (const block of doubleWideBlocks) {
            if (this.fixSingleDoubleWideBlock(block, intGrid)) {
                changesMade = true;
            }
        }
    }
}
```

```ts
/**
 * Samples region seed points with min-distance rejection.
 */
private generateRegionPoints(): Point[] {
    const points: Point[] = [];
    let attempts = 0;

    while (points.length < this.regionCount && attempts < this.MAX_REGION_POINT_ATTEMPTS) {
        attempts++;
        const centerX = Math.floor(this.rng() * this.levelSize[0]);
        const centerY = Math.floor(this.rng() * this.levelSize[1]);
        const newPoint = new Point(centerX, centerY);

        let tooClose = false;
        for (const existingPoint of points) {
            const distanceSq = (newPoint.x - existingPoint.x) ** 2 + (newPoint.y - existingPoint.y) ** 2;
            if (distanceSq < this.minRegionDistance ** 2) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            points.push(newPoint);
        }
    }

    return points;
}
```

```ts
/**
 * Builds a nearest-neighbor edge graph (triangulation approximation).
 */
private createSimpleTriangulation(points: Point[]): Edge[] {
    const edges: Edge[] = [];

    for (let i = 0; i < points.length; i++) {
        const point1 = points[i];
        const distances: { index: number; distance: number }[] = [];

        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const distance = Math.sqrt((point1.x - points[j].x) ** 2 + (point1.y - points[j].y) ** 2);
                distances.push({ index: j, distance });
            }
        }

        distances.sort((a, b) => a.distance - b.distance);

        for (let k = 0; k < Math.min(3, distances.length); k++) {
            const point2 = points[distances[k].index];
            const p1 = point1.x < point2.x || (point1.x === point2.x && point1.y < point2.y) ? point1 : point2;
            const p2 = point1.x < point2.x || (point1.x === point2.x && point1.y < point2.y) ? point2 : point1;

            const exists = edges.some(edge =>
                (edge.p.x === p1.x && edge.p.y === p1.y && edge.q.x === p2.x && edge.q.y === p2.y) ||
                (edge.p.x === p2.x && edge.p.y === p2.y && edge.q.x === p1.x && edge.q.y === p1.y)
            );

            if (!exists) {
                edges.push(new Edge(p1, p2));
            }
        }
    }

    return edges;
}
```

```ts
/**
 * Dead-end pass: find single-neighbor path tips and extend them.
 */
private reduceDeadEnds(intGrid: IntGrid): void {
    const pathTiles: [number, number][] = [];
    for (let x = 0; x < this.levelSize[0]; x++) {
        for (let y = 0; y < this.levelSize[1]; y++) {
            if (intGrid.getTile(x, y) === this.PATH_TILE) {
                pathTiles.push([x, y]);
            }
        }
    }

    const deadEnds: [number, number][] = [];
    for (const tile of pathTiles) {
        const neighbors = this.getNeighbors(tile);
        const pathNeighbors = neighbors.filter(n =>
            n[0] >= 0 && n[0] < this.levelSize[0] &&
            n[1] >= 0 && n[1] < this.levelSize[1] &&
            intGrid.getTile(n[0], n[1]) === this.PATH_TILE
        );

        if (pathNeighbors.length === 1) {
            deadEnds.push(tile);
        }
    }

    for (const deadEnd of deadEnds) {
        this.extendDeadEnd(deadEnd, intGrid);
    }
}
```

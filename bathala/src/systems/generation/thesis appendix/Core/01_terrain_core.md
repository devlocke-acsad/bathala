# 01 - Terrain Core

Sources:
- `src/systems/generation/algorithms/delaunay-maze/DelaunayMazeAlgorithm.ts`

```ts
/**
 * Randomly sample region seed points subject to a minimum pairwise distance.
 */
private generateRegionPoints(): Point[] {
    const points: Point[] = [];
    let attempts = 0;

    while (points.length < this.regionCount && attempts < this.MAX_REGION_POINT_ATTEMPTS) {
        attempts++;
        const centerX = Math.floor(this.rng() * this.levelSize[0]);
        const centerY = Math.floor(this.rng() * this.levelSize[1]);
        const newPoint = new Point(centerX, centerY);

        // Check minimum distance constraint
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
 * Core A* pathfinder between two points on a grid.
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
 * Remove 2x2 path blocks.
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

import { IntGrid } from '../../toolbox/IntGrid';

/**
 * SkywardCitadelAlgorithm — Pure terrain generation for floating cloud platforms.
 *
 * Theme: Sky islands connected by cloud bridges, emphasizing verticality and gaps.
 * 
 * Pipeline:
 *   1. Generate platform seeds (floating islands)
 *   2. Create simple triangulation for connectivity
 *   3. Carve cloud bridges between platforms using A*
 *   4. Add platform edges and decorative gaps
 *   5. Ensure no 2x2 path blocks
 *   6. Add sky gaps for vertical feel
 *
 * Tile types:
 *   0 = PATH (walkable cloud platform)
 *   1 = VOID (empty sky, unwalkable)
 *   2 = EDGE (cloud platform edge decoration)
 *
 * @module SkywardCitadelAlgorithm
 */

export class Point {
    constructor(public x: number, public y: number) { }
}

export class Edge {
    constructor(public p: Point, public q: Point) { }
}

export class PathNode {
    public f: number;

    constructor(
        public position: [number, number],
        public parent: PathNode | null,
        public g: number,
        public h: number
    ) {
        this.f = g + h;
    }

    equals(other: PathNode): boolean {
        return this.position[0] === other.position[0] && this.position[1] === other.position[1];
    }

    getKey(): string {
        return `${this.position[0]},${this.position[1]}`;
    }
}

export class SkywardCitadelGenerator {
    // =============================
    // Tunable Generation Constants
    // =============================

    // A* pathfinding costs
    private readonly BASE_TILE_COST = 1.2;
    private readonly DIRECTION_CHANGE_PENALTY = 0.1;

    // Platform generation
    private readonly PLATFORM_RADIUS_MIN = 2;
    private readonly PLATFORM_RADIUS_MAX = 4;
    private readonly MAX_PLATFORM_ATTEMPTS = 1000;

    // Bridge waypoints
    private readonly MIN_WAYPOINT_DISTANCE = 8;
    private readonly BRIDGE_STYLE_PROB = 0.5;

    // Post-processing
    private readonly MAX_DOUBLE_WIDE_FIX_ITER = 10;

    // Tile types
    public readonly PATH_TILE = 0;   // Walkable cloud
    public readonly VOID_TILE = 1;   // Empty sky
    public readonly EDGE_TILE = 2;   // Platform edge decoration

    // =============================
    // Configurable Parameters
    // =============================

    public levelSize: [number, number] = [50, 50];
    public platformCount: number = 12;
    public minPlatformDistance: number = 6;

    public edges: Edge[] = [];

    private rng: () => number = Math.random;

    /**
     * Main entry point: generate floating platform layout.
     */
    generateLayout(rng?: () => number): IntGrid {
        if (rng) this.rng = rng;
        this.edges = [];

        // 1) Generate platform seeds
        const platforms = this.generatePlatforms();

        if (platforms.length < 3) {
            throw new Error('Need at least 3 platforms for triangulation');
        }

        // 2) Create connectivity via triangulation
        const edges = this.createSimpleTriangulation(platforms);

        // 3) Initialize grid as VOID (empty sky)
        const intGrid = new IntGrid(this.levelSize[0], this.levelSize[1]);
        for (let x = 0; x < this.levelSize[0]; x++) {
            for (let y = 0; y < this.levelSize[1]; y++) {
                intGrid.setTile(x, y, this.VOID_TILE);
            }
        }

        // 4) Carve platforms as circular areas
        for (const platform of platforms) {
            this.carvePlatform(platform, intGrid);
        }

        // 5) Sort edges by length (shorter first)
        edges.sort((a, b) => this.edgeLength(a) - this.edgeLength(b));

        // 6) Carve cloud bridges between platforms
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

        // 7) Post-processing
        this.fixDoubleWidePaths(intGrid);
        this.addPlatformEdges(intGrid);

        return intGrid;
    }

    /**
     * Generate platform seeds with minimum spacing.
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

            // Check minimum distance
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

    /**
     * Carve a circular platform area.
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

    /**
     * Simple triangulation connecting nearest neighbors.
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

            // Connect to 3 nearest neighbors
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

    private edgeLength(edge: Edge): number {
        return Math.sqrt((edge.q.x - edge.p.x) ** 2 + (edge.q.y - edge.p.y) ** 2);
    }

    /**
     * Find path with optional waypoints for bridge variety.
     */
    private findPath(start: [number, number], end: [number, number], intGrid: IntGrid): [number, number][] | null {
        const waypoints = this.generateWaypoints(start, end);
        const fullPath: [number, number][] = [];
        let currentStart = start;

        for (const waypoint of [...waypoints, end]) {
            const segment = this.findPathSegment(currentStart, waypoint, intGrid);
            if (segment === null) {
                return this.findPathSegment(start, end, intGrid);
            }

            if (fullPath.length > 0 && segment.length > 0) {
                if (fullPath[fullPath.length - 1][0] === segment[0][0] && 
                    fullPath[fullPath.length - 1][1] === segment[0][1]) {
                    segment.shift();
                }
            }

            fullPath.push(...segment);
            currentStart = waypoint;
        }

        return fullPath.length > 0 ? fullPath : null;
    }

    /**
     * Generate waypoints for bridge styling.
     */
    private generateWaypoints(start: [number, number], end: [number, number]): [number, number][] {
        const waypoints: [number, number][] = [];
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const distance = Math.abs(dx) + Math.abs(dy);

        if (distance < this.MIN_WAYPOINT_DISTANCE) {
            return waypoints;
        }

        // Simple L-shape or direct
        if (this.rng() < this.BRIDGE_STYLE_PROB) {
            waypoints.push([end[0], start[1]]);
        } else {
            waypoints.push([start[0], end[1]]);
        }

        return waypoints;
    }

    /**
     * A* pathfinding for cloud bridges.
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
                if (closedSet.has(neighborKey)) {
                    continue;
                }

                let tileCost = this.BASE_TILE_COST;
                
                // Prefer existing paths
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

    private getDirectionChangeCost(prevPos: [number, number], currPos: [number, number], nextPos: [number, number]): number {
        const prevDir = [currPos[0] - prevPos[0], currPos[1] - prevPos[1]];
        const nextDir = [nextPos[0] - currPos[0], nextPos[1] - currPos[1]];
        return (prevDir[0] === nextDir[0] && prevDir[1] === nextDir[1]) ? 0.0 : this.DIRECTION_CHANGE_PENALTY;
    }

    private reconstructPath(endNode: PathNode): [number, number][] {
        const path: [number, number][] = [];
        let currentNode: PathNode | null = endNode;
        while (currentNode !== null) {
            path.unshift(currentNode.position);
            currentNode = currentNode.parent;
        }
        return path;
    }

    private getHeuristic(a: [number, number], b: [number, number]): number {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    private getNeighbors(pos: [number, number]): [number, number][] {
        const [x, y] = pos;
        return [[x, y + 1], [x + 1, y], [x, y - 1], [x - 1, y]];
    }

    /**
     * Remove 2x2 path blocks.
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

    private findDoubleWideBlocks(intGrid: IntGrid): [number, number][][] {
        const blocks: [number, number][][] = [];
        for (let x = 0; x < this.levelSize[0] - 1; x++) {
            for (let y = 0; y < this.levelSize[1] - 1; y++) {
                const blockPositions: [number, number][] = [
                    [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]
                ];
                if (blockPositions.every(pos => intGrid.getTile(pos[0], pos[1]) === this.PATH_TILE)) {
                    blocks.push(blockPositions);
                }
            }
        }
        return blocks;
    }

    private fixSingleDoubleWideBlock(block: [number, number][], intGrid: IntGrid): boolean {
        const connectionCounts: Array<{ pos: [number, number], connections: number }> = [];
        for (const pos of block) {
            const count = this.countPathConnections(pos, intGrid, new Set(block.map(p => `${p[0]},${p[1]}`)));
            connectionCounts.push({ pos, connections: count });
        }

        connectionCounts.sort((a, b) => a.connections - b.connections);

        for (const { pos } of connectionCounts) {
            if (!this.wouldDisconnectNetwork(pos, intGrid, block)) {
                intGrid.setTile(pos[0], pos[1], this.VOID_TILE);
                return true;
            }
        }

        if (connectionCounts.length > 0) {
            intGrid.setTile(connectionCounts[0].pos[0], connectionCounts[0].pos[1], this.VOID_TILE);
            return true;
        }

        return false;
    }

    private countPathConnections(pos: [number, number], intGrid: IntGrid, excludePositions: Set<string> = new Set()): number {
        let count = 0;
        for (const neighbor of this.getNeighbors(pos)) {
            const neighborKey = `${neighbor[0]},${neighbor[1]}`;
            if (!excludePositions.has(neighborKey)) {
                if (neighbor[0] >= 0 && neighbor[0] < this.levelSize[0] &&
                    neighbor[1] >= 0 && neighbor[1] < this.levelSize[1] &&
                    intGrid.getTile(neighbor[0], neighbor[1]) === this.PATH_TILE) {
                    count++;
                }
            }
        }
        return count;
    }

    private wouldDisconnectNetwork(pos: [number, number], intGrid: IntGrid, block: [number, number][]): boolean {
        const blockSet = new Set(block.map(p => `${p[0]},${p[1]}`));
        const externalConnections = this.countPathConnections(pos, intGrid, blockSet);
        return externalConnections >= 3;
    }

    /**
     * Add decorative edges around platforms.
     */
    private addPlatformEdges(intGrid: IntGrid): void {
        for (let x = 0; x < this.levelSize[0]; x++) {
            for (let y = 0; y < this.levelSize[1]; y++) {
                if (intGrid.getTile(x, y) === this.PATH_TILE) {
                    // Check if adjacent to void
                    const neighbors = this.getNeighbors([x, y]);
                    const hasVoidNeighbor = neighbors.some(n =>
                        n[0] >= 0 && n[0] < this.levelSize[0] &&
                        n[1] >= 0 && n[1] < this.levelSize[1] &&
                        intGrid.getTile(n[0], n[1]) === this.VOID_TILE
                    );

                    // Small chance to mark as edge for visual variety
                    if (hasVoidNeighbor && this.rng() < 0.2) {
                        intGrid.setTile(x, y, this.EDGE_TILE);
                    }
                }
            }
        }
    }
}

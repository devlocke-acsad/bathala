/** Immutable 2D point used for region seeds and triangulation. */
export class Point {
    constructor(public x: number, public y: number) {}
}

/** Undirected edge (p <-> q) produced from Delaunay triangulation. */
export class Edge {
    constructor(public p: Point, public q: Point) {}
}

/*
  PathNode (A* Node)
  ------------------
  Represents a single grid cell in an A* frontier or closed set.
    position : [x,y] coordinate.
    parent   : Pointer to previous node for path reconstruction.
    g        : Cost from start to this node (accumulated tile + turn costs).
    h        : Heuristic prediction to goal (Manhattan distance in this project).
    f        : Total estimated cost (g + h). Updated on construction or when g changes.
*/
export class PathNode {
    public f: number; // g + h

    constructor(
        public position: [number, number],
        public parent: PathNode | null,
        public g: number,
        public h: number
    ) {
        this.f = g + h;
    }

    /** Strict positional equality check. */
    equals(other: PathNode): boolean {
        return this.position[0] === other.position[0] && this.position[1] === other.position[1];
    }

    /** Unique key for maps / sets ("x,y"). */
    getKey(): string {
        return `${this.position[0]},${this.position[1]}`;
    }
}

/*
  IntGrid
  -------
  Lightweight 2D integer grid abstraction.
    - Stores tiles in column-major style: grid[x][y] for readability with (x,y) access.
    - Bounds checks in setTile/getTile silently ignore out-of-range sets and return 0 for reads.
    - display() prints a textual map (simple debugging helper).

  Tile legend (by convention in generator / GameScene):
    0 : Uninitialized / outside (treated as empty when read out-of-bounds).
    1 : PATH tile (corridor).
    2 : REGION tile (background / uncarved).
    3 : REGION_CENTER tile (optional marker; not always used).
*/
export class IntGrid {
    private grid: number[][];

    constructor(public width: number, public height: number) {
        // Allocate width columns each holding height entries
        this.grid = Array(width).fill(null).map(() => Array(height).fill(0));
    }

    /** Write tile value if coordinates are in bounds. */
    setTile(x: number, y: number, tileType: number): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[x][y] = tileType;
        }
    }

    /** Read tile value or 0 if out of bounds (safe default). */
    getTile(x: number, y: number): number {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[x][y];
        }
        return 0;
    }

    /** Console-friendly ASCII visualization for debugging layouts. */
    display(): void {
        console.log('Grid Display:');
        for (let y = this.height - 1; y >= 0; y--) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[x][y];
                if (tile === 1) {
                    row += '.';  // PATH
                } else if (tile === 2) {
                    row += '#';  // REGION
                } else if (tile === 3) {
                    row += 'O';  // REGION CENTER
                } else {
                    row += ' ';  // Empty / unspecified
                }
            }
            console.log(row);
        }
    }
}
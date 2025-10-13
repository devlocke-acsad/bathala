/**
 * IntGrid
 * -------
 * Lightweight 2D integer grid abstraction.
 *   - Stores tiles in column-major style: grid[x][y] for readability with (x,y) access.
 *   - Bounds checks in setTile/getTile silently ignore out-of-range sets and return 0 for reads.
 *   - display() prints a textual map (simple debugging helper).
 *
 * Tile legend (by convention in generator / GameScene):
 *   0 : PATH tile (walkable).
 *   1 : REGION tile (wall/unwalkable).
 */
export class IntGrid {
    private grid: number[][];

    constructor(public width: number, public height: number) {
        // Allocate width columns each holding height entries
        this.grid = Array(width).fill(null).map(() => Array(height).fill(1)); // Default to walls
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
        return 1; // Default to wall
    }

    /** Console-friendly ASCII visualization for debugging layouts. */
    display(): void {
        console.log('Grid Display:');
        for (let y = this.height - 1; y >= 0; y--) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                const tile = this.grid[x][y];
                if (tile === 0) {
                    row += '.';  // PATH (walkable)
                } else {
                    row += '#';  // REGION (wall)
                }
            }
            console.log(row);
        }
    }
}

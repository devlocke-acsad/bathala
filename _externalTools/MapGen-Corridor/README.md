# Corridor-MapTileGenerator: Procedural Level Generator - TypeScript + Phaser.js

## Features

- **Procedural Generation**: Creates random level layouts with interconnected regions
- **Delaunay Triangulation**: Uses mathematical triangulation to create natural connections
- **A* Pathfinding**: Implements intelligent pathfinding with waypoints for interesting path shapes
- **Interactive UI**: Real-time parameter adjustment and level regeneration
- **Zoom & Pan**: Mouse controls for exploring generated levels
- **Post-processing**: Removes double-wide paths for cleaner layouts
- **Outer Path Highlights**: Automatically marks border intersections and corners so you can spot outer loops at a glance

## Generation Pipeline

1. **Seed Placement (`level-generator.ts`)** – `generateRegionPoints()` samples region centers with a minimum-distance rule so rooms are evenly distributed across the `IntGrid`.
2. **Triangulation & Edge Ordering** – Delaunator builds a Delaunay mesh, `getDelaunayEdges()` extracts unique edges, and they are sorted shortest-first to favor local corridors before spanning ones.
3. **Corridor Carving (`findPath`)** – Each edge drives a multi-waypoint A* search that sculpts PATH tiles into the grid. Straightness, existing paths, and random waypoints influence the shapes.
4. **Structural Cleanup (`fixDoubleWidePaths`)** – Iteratively removes any 2×2 PATH blocks so corridors stay one tile wide.
5. **Dead-End Analysis (`deadend-analyzer.ts`)** – A staged pass extends promising branches, bridges corners, prunes lingering dead-ends, and reconnects isolated pockets. It reuses the generator’s pathfinder and double-wide guard.
6. **Rendering & Highlighting (`game-scene.ts`)** – After the grid stabilizes, `GameScene.drawGrid()` paints tiles and calls `OuterTileMarker.isOutsideIntersectionOrCorner()` to flag notable border corners/intersections. The UI simultaneously shows the implicit `width × height` region count when the Regions field is left at `0`.

## Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Use version 16 or higher

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

### Development Mode
```bash
npm run dev
```
Opens the application at `http://localhost:3000` with hot reloading.

### Production Build
```bash
npm run build
```
Creates optimized build in the `dist/` folder.

### Clean Build
```bash
npm run clean
```
Removes the `dist/` folder.

## Controls

### UI Controls
- **Width/Height**: Adjust the grid dimensions (10-100)
- **Regions**: Number of region centers to generate (3-30)
- **Min Distance**: Minimum distance between regions (1-10)
- **Viewport Culling**: Toggle performance optimization (recommended: ON)
- **Generate Level**: Create a new random layout

### Mouse Controls
- **Mouse Wheel**: Zoom in/out
- **Left Click + Drag**: Pan around the level
- **Reset View**: Refresh the page to reset camera position

## Technical Details

### Architecture
- **TypeScript**: Strongly typed JavaScript for better development experience
- **Phaser.js**: 2D game framework for rendering and interaction
- **Webpack**: Module bundler with development server
- **Delaunator**: Fast Delaunay triangulation library

### Algorithm Overview
1. **Point Generation**: Places region centers with minimum distance constraints
2. **Delaunay Triangulation**: Creates natural connections between regions
3. **Edge Processing**: Sorts edges by length for logical path creation
4. **Pathfinding**: Uses A* with waypoints for interesting path shapes
5. **Post-processing**: Removes double-wide paths while preserving intersections

### File Structure
```
src/
├── main.ts              # Entry point and game initialization
├── game-scene.ts        # Main Phaser scene with rendering logic
├── level-generator.ts   # Core level generation algorithm
├── data-structures.ts   # Point, Edge, PathNode, and IntGrid classes
├── index.html          # HTML template with UI controls
├── phaser.d.ts         # TypeScript declarations for Phaser
└── delaunator.d.ts     # TypeScript declarations for Delaunator
```

## Performance Optimizations

### Viewport Culling
The application implements intelligent viewport culling that only renders tiles visible on screen plus a small buffer. This provides:

- **Massive performance gains** for large grids (100x100+ tiles)
- **Smooth zooming and panning** even with complex layouts
- **Real-time performance metrics** showing tiles rendered vs total tiles
- **Toggle option** to compare performance with/without culling

### Smart Rendering
- **Throttled updates**: Limits redraw frequency during camera movement to ~60 FPS
- **Efficient bounds calculation**: Uses camera viewport to determine visible area
- **Buffer zone**: Renders slightly beyond viewport to prevent pop-in during movement
- **Performance tracking**: Real-time display of rendering efficiency

Example performance improvement:
- **Without culling**: 50x50 grid = 2,500 tiles rendered every frame
- **With culling**: 50x50 grid = ~200-400 tiles rendered (80-90% reduction!)

## Customization

### Tile Types
The generator uses different tile types:
- **PATH_TILE (1)**: Green paths connecting regions
- **REGION_TILE (2)**: Brown solid areas representing rooms/regions
- **REGION_CENTER_TILE (3)**: Red centers (currently unused in display)

### Visual Styling
Colors can be modified in `game-scene.ts`:
```typescript
if (tileType === this.generator.PATH_TILE) {
    color = 0x90EE90; // Light green
} else if (tileType === this.generator.REGION_TILE) {
    color = 0x8B4513; // Brown
}
```

### Generation Parameters
Modify default values in `level-generator.ts`:
```typescript
public levelSize: [number, number] = [50, 50];
public regionCount: number = 15;
public minRegionDistance: number = 4;
```

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` to ensure all dependencies are installed

2. **Blank screen**
   - Check browser console for errors
   - Ensure you're running `npm run dev` and accessing `http://localhost:3000`

3. **Generation fails**
   - Try different parameter values
   - Check that regions count isn't too high for the grid size

4. **Performance issues**
   - Reduce grid size for better performance
   - Lower region count for simpler layouts

## License

MIT License - Feel free to modify and distribute.

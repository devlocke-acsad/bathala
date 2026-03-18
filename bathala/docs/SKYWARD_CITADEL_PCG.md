# Skyward Citadel PCG Implementation

**Chapter 3: The Skyward Citadel** — Using Chapter 1's Delaunay Maze algorithm with cloud platform visuals.

## Status: ✅ Complete

The Skyward Citadel now uses Chapter 1's proven Delaunay Maze PCG algorithm with cloud-themed assets.

## Implementation Approach

Instead of creating a new algorithm, Chapter 3 reuses Chapter 1's Delaunay Maze generator (same PCG logic) but swaps the visual assets to cloud platforms. This provides:
- Proven, stable terrain generation
- Consistent gameplay feel across chapters
- Minimal code duplication
- Easy asset swapping

## What Was Built

### Asset Loading (Preloader.ts)
Added cloud tileset assets:
- Cloud edges: N1, N2, S1, S2, E1, E2, W1, W2 (directional variants)
- Cloud corners: NE, NW, SE, SW
- Cloud paths: cloud_path1-4 (4 variants for walkable platforms)
- Cloud walls: cloud_wall1-3 (3 variants for obstacles)
- Base: cloud_blank.png

### Rendering System (MazeGenSystem.ts)
- Added `skywardCitadelPathTextures` array with cloud_path1-4
- Added `isAct3Chapter()` method for chapter detection
- Updated floor texture selection to use cloud paths for Act 3
- Updated wall texture selection to use cloud walls for Act 3

### Act Definition (Act3Definition.ts)
- Uses `DelaunayMazeChunkAdapter` (same as Chapter 1)
- Set `tilesetKey: 'cloud_tileset'`
- Configuration: chunkSize 20, regionCountMultiplier 2, minRegionDistance 3

## Tile Mapping

### Walkable Tiles (tileValue === 0)
- Randomly selects from: cloud_path1, cloud_path2, cloud_path3, cloud_path4
- Deterministic selection based on chunk and tile coordinates

### Non-Walkable Tiles (tileValue !== 0)
- Randomly selects from: cloud_wall1, cloud_wall2, cloud_wall3
- Deterministic selection for consistent appearance

## Configuration

```typescript
{
  chunkSize: 20,
  regionCountMultiplier: 2,  // Same as Chapter 1
  minRegionDistance: 3,      // Same as Chapter 1
}
```

## Available Assets

Located in `public/assets/background/skywardcitadelAssets/`:

### Cloud Edges (for future edge detection)
- Directional: N1, N2, S1, S2, E1, E2, W1, W2
- Corners: NE, NW, SE, SW
- Base: cloud_blank.png

### Active Assets
- Paths: cloud_path1-4.png (currently used)
- Walls: cloud_wall1-3.png (currently used)

### Reference
- `cloudTilesetReference.PNG` — Visual guide for tile arrangement

## Testing

To test Chapter 3:
1. Start game and select Chapter 3
2. Verify cloud path tiles render on walkable areas
3. Verify cloud wall tiles render on obstacles
4. Confirm same maze structure as Chapter 1 (different visuals only)

## Future Enhancements

### Edge Detection
The cloud edge tiles (N1, N2, S1, S2, etc.) are loaded but not yet used. Future enhancement could add edge detection similar to Act 2's submerged village system to create seamless cloud platform edges.

### Potential Improvements
- Add cloud edge detection for platform boundaries
- Implement cloud_blank as background void
- Add parallax sky background
- Animate cloud drift/movement
- Add celestial decorations

## Technical Notes

- Reuses Chapter 1's Delaunay Maze algorithm (no new PCG code)
- Asset swapping handled via chapter detection in MazeGenSystem
- Deterministic texture selection ensures consistent appearance
- No changes to gameplay or pathfinding logic

## Known Limitations

- Currently uses placeholder background/music (forest assets)
- Cloud edge tiles loaded but not yet used (no edge detection system)
- Same maze structure as Chapter 1 (only visual difference)
- No vertical layering or floating island feel (flat maze layout)

These are acceptable for the baseline - the cloud visuals provide thematic differentiation while maintaining proven gameplay.

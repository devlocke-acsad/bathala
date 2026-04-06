# Skyward Citadel Algorithm

**Act 3: The Skyward Citadel** — Floating cloud platforms connected by ethereal bridges.

## Overview

The Skyward Citadel algorithm generates a sky-themed overworld with:
- Floating circular platforms (cloud islands)
- Cloud bridges connecting platforms
- Void spaces (empty sky) for vertical feel
- Decorative edge tiles for visual variety

### Terrain Constraints

- No cliff formations in Act 3 generation
- No lake/water pool generation in Act 3 generation

## Architecture

### Files
- `SkywardCitadelAlgorithm.ts` — Pure terrain generation logic
- `SkywardCitadelChunkAdapter.ts` — IChunkGenerator wrapper for integration

### Tile Types
- `0` = PATH (walkable cloud platform/bridge)
- `1` = VOID (empty sky, unwalkable)
- `2` = EDGE (decorative platform edge)

## Generation Pipeline

1. **Platform Generation**
   - Generate random platform seeds with minimum spacing
   - Each platform has a random radius (2-4 tiles)
   - Rejection sampling ensures platforms don't overlap

2. **Triangulation**
   - Connect platforms using simple nearest-neighbor triangulation
   - Each platform connects to its 3 nearest neighbors
   - Creates natural connectivity graph

3. **Platform Carving**
   - Carve circular areas for each platform
   - Initialize rest of grid as VOID (empty sky)

4. **Bridge Creation**
   - Sort edges by length (shorter first)
   - Use A* pathfinding to carve cloud bridges
   - Optional waypoints for bridge variety (L-shapes)
   - Prefer existing paths to create natural junctions

5. **Post-Processing**
   - Remove 2x2 path blocks (corridor feel)
   - Add decorative edge tiles at platform boundaries

## Configuration

```typescript
{
  chunkSize: 20,                    // Grid dimensions
  platformCountMultiplier: 0.6,     // Platforms = chunkSize * multiplier (~12)
  minPlatformDistance: 6,           // Minimum spacing between platforms
}
```

## Visual Theme

The algorithm creates a sense of verticality and openness:
- Large void spaces emphasize the sky setting
- Circular platforms feel organic and cloud-like
- Narrow bridges create risk/reward navigation
- Edge tiles add visual polish

## Assets

Uses cloud tileset from `public/assets/background/skywardcitadelAssets/`:
- Cloud edge tiles (N, S, E, W variants)
- Corner tiles (NE, NW, SE, SW)
- Path tiles (4 variants)
- Wall tiles (3 variants)

## Future Enhancements

- Multi-level platforms (vertical layering)
- Moving cloud platforms
- Wind currents affecting movement
- Celestial decorations (stars, auroras)
- Platform size variation based on importance

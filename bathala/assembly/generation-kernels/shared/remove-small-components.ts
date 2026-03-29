// @ts-nocheck
/**
 * removeSmallComponentsInPlace — flood-fill BFS to find connected components
 * of `tileType` and remove any component smaller than `minSize`.
 */

import { LABELS, QUEUE, getCell, setCell, inBounds, idx } from '../common/grid';

export function removeSmallComponentsInPlace(
  width: i32,
  height: i32,
  tileType: i32,
  fillTile: i32,
  minSize: i32,
): void {
  const cells: i32 = width * height;

  // Clear labels
  for (let i: i32 = 0; i < cells; i++) {
    unchecked((LABELS[i] = 0));
  }

  let labelId: i32 = 0;

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      if (getCell(x, y, width) != tileType) continue;
      const cellIdx: i32 = idx(x, y, width);
      if (unchecked(LABELS[cellIdx]) != 0) continue;

      // BFS flood-fill this component
      labelId++;
      let qHead: i32 = 0;
      let qTail: i32 = 0;
      let componentSize: i32 = 0;

      unchecked((QUEUE[qTail * 2] = x));
      unchecked((QUEUE[qTail * 2 + 1] = y));
      qTail++;
      unchecked((LABELS[cellIdx] = labelId));

      while (qHead < qTail) {
        const cx: i32 = unchecked(QUEUE[qHead * 2]);
        const cy: i32 = unchecked(QUEUE[qHead * 2 + 1]);
        qHead++;
        componentSize++;

        // 4-directional neighbors
        const dx4: StaticArray<i32> = [0, 0, -1, 1];
        const dy4: StaticArray<i32> = [-1, 1, 0, 0];
        for (let d: i32 = 0; d < 4; d++) {
          const nx: i32 = cx + unchecked(dx4[d]);
          const ny: i32 = cy + unchecked(dy4[d]);
          if (!inBounds(nx, ny, width, height)) continue;
          if (getCell(nx, ny, width) != tileType) continue;
          const nIdx: i32 = idx(nx, ny, width);
          if (unchecked(LABELS[nIdx]) != 0) continue;
          unchecked((LABELS[nIdx] = labelId));
          unchecked((QUEUE[qTail * 2] = nx));
          unchecked((QUEUE[qTail * 2 + 1] = ny));
          qTail++;
        }
      }

      // If component too small, fill it
      if (componentSize < minSize) {
        for (let i: i32 = 0; i < cells; i++) {
          if (unchecked(LABELS[i]) == labelId) {
            const fx: i32 = i % width;
            const fy: i32 = i / width;
            setCell(fx, fy, width, fillTile);
          }
        }
      }
    }
  }
}

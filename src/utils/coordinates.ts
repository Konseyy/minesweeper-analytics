export function coordsToIndex(row: number, col: number, width: number) {
  return row * width + col;
}

export function indexToCoords(index: number, width: number) {
  const row = Math.floor(index / width);
  const col = index % width;
  return { row, col };
}

// Returns coordinates of existing tiles around the given tile
export function getSurroundingCoords(
  row: number,
  col: number,
  width: number,
  height: number,
  options?: {
    length?: number;
    includeSelf?: boolean;
  }
) {
  const searchLength = options?.length ?? 1;
  const possibleRows = [row];
  for (let i = 1; i < searchLength + 1; i++) {
    possibleRows.push(row - i, row + i);
  }
  const existingRows = possibleRows.filter((r) => r >= 0 && r < height);
  const possibleCols = [col];
  for (let i = 1; i < searchLength + 1; i++) {
    possibleCols.push(col - i, col + i);
  }
  const existingCols = possibleCols.filter((c) => c >= 0 && c < width);
  const adjcentCoords: { row: number; col: number }[] = [];
  for (const r of existingRows) {
    for (const c of existingCols) {
      if (r === row && c === col && Boolean(options?.includeSelf) === false) continue; // Skip the given tile (itself
      adjcentCoords.push({ row: r, col: c });
    }
  }
  return adjcentCoords;
}

export type KeyboardNavigationMode = "cell" | "row";
export interface CellPosition { row: number; column: number }

export function getNextCellPosition(
  current: CellPosition,
  key: string,
  rowCount: number,
  columnCount: number,
  mode: KeyboardNavigationMode = "cell",
  shiftKey = false,
): CellPosition {
  if (!rowCount || !columnCount) return current;
  let { row, column } = current;
  if (key === "Tab") {
    const index = row * columnCount + column + (shiftKey ? -1 : 1);
    const bounded = Math.max(0, Math.min(rowCount * columnCount - 1, index));
    return { row: Math.floor(bounded / columnCount), column: bounded % columnCount };
  }
  if (key === "ArrowUp") row--;
  if (key === "ArrowDown") row++;
  if (mode === "cell" && key === "ArrowLeft") column--;
  if (mode === "cell" && key === "ArrowRight") column++;
  return {
    row: Math.max(0, Math.min(rowCount - 1, row)),
    column: Math.max(0, Math.min(columnCount - 1, column)),
  };
}

/** Rectangular cell range. Row indices use the current filtered, sorted row model. */
export interface CellRange {
  startRow: number;
  endRow: number;
  columns: string[];
}

export interface GridRangeSelectionConfig {
  enabled?: boolean;
  /** Allow cell selection to coexist with row selection. Defaults to true. */
  combineWithRowSelection?: boolean;
  onRangeSelectionChanged?: (ranges: CellRange[]) => void;
}

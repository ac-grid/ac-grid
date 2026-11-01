import type { CellRange } from "./range-selection";

export interface RangeChartColumn {
  id: string;
  values: unknown[];
}

/** Snapshot of selected columns in the grid's current row model. */
export interface RangeChartData {
  columns: RangeChartColumn[];
  rowCount: number;
}

export interface GridChartThemeOverrides {
  colors?: string[];
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export interface GridElement extends HTMLElement {
  enableCharts: boolean;
  chartThemeOverrides?: GridChartThemeOverrides;
  getCellRanges(): CellRange[];
  getRangeChartData(range?: CellRange): RangeChartData;
}

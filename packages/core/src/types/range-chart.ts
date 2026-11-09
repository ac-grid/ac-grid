import type { CellRange } from "./range-selection";
import type { GridState, GridStateKey, GridStatePatch } from "./grid-state";

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
  getState(): GridState;
  setState(state: GridStatePatch): void;
  resetState(keys?: GridStateKey[]): void;
}

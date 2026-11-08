import type { CellRange, GridChartThemeOverrides, GridElement } from "@ac-grid/core";

export type IntegratedChartType = "bar" | "line" | "pie";

export type ChartThemeOverrides = GridChartThemeOverrides;

export interface ChartSpec {
  type: IntegratedChartType;
  labels: unknown[];
  series: Array<{ id: string; label: string; values: unknown[] }>;
  themeOverrides?: ChartThemeOverrides;
}

export interface ChartInstance {
  destroy(): void;
}

export interface ChartAdapter {
  render(container: HTMLElement, spec: ChartSpec): ChartInstance;
}

export type GridChartHost = GridElement;

export interface CreateRangeChartParams {
  type: IntegratedChartType;
  range?: CellRange;
  categoryColumn?: string;
  seriesColumns?: string[];
}

export interface ChartRef {
  readonly type: IntegratedChartType;
  readonly element: HTMLElement;
  destroy(): void;
}

export interface IntegratedChartsOptions {
  adapter: ChartAdapter;
  chartThemeOverrides?: ChartThemeOverrides;
  container?: "dock" | "modal" | ((chart: ChartRef) => HTMLElement);
}

export interface IntegratedChartsApi {
  createRangeChart(params: CreateRangeChartParams): ChartRef;
  destroy(): void;
}

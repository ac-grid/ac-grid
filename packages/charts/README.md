# @ac-grid/charts

`@ac-grid/charts` creates charts from the current cell range. Install one chart engine and pass its adapter to `setupIntegratedCharts`. Select a range before calling `createRangeChart`.

```ts
import { Chart } from "chart.js/auto";
import { createChartJsAdapter, setupIntegratedCharts } from "@ac-grid/charts";
import { createGrid } from "@ac-grid/core";

const grid = createGrid({
  data,
  columns,
  rangeSelection: { enabled: true },
  enableCharts: true,
  chartThemeOverrides: { textColor: "#222", colors: ["#36c", "#c63"] },
});
document.body.appendChild(grid);

const charts = setupIntegratedCharts(grid, {
  adapter: createChartJsAdapter(Chart),
  container: "dock",
});
document.querySelector("#create-chart")?.addEventListener("click", () => {
  const range = grid.getCellRanges()[0];
  if (!range) return;
  charts.createRangeChart({ type: "bar", range });
});

```

Call `charts.destroy()` when the grid view unmounts.

Use `container: "modal"` to show charts in a dialog. Pass a function that accepts a `ChartRef` to mount a chart in a custom container. `createRangeChart` accepts `range`, `categoryColumn`, and `seriesColumns` when you need to override the current selection or its column mapping. Set `chartThemeOverrides` in `createGrid` or `setupIntegratedCharts` to choose chart colors, background, text color, or font.

The Chart.js and ECharts adapters accept the engine constructor or namespace. Import the engine in your application and pass it to `createChartJsAdapter` or `createEChartsAdapter`. The package does not bundle either engine.

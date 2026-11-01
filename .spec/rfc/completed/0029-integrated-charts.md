# RFC-0029: 集成图表 (Integrated Charts)

**Status:** Implemented
**版本**: 1.2.0
**作者**: Albert Li
**日期**: 2026-06-28
**相关 RFC**: [0022](0022-range-selection.md), [0010](0010-grouping-aggregation.md)

## Summary

从选区或分组数据一键生成图表，对标 AG Grid Enterprise Integrated Charts（非独立 AG Charts 产品）。

## 设计目标

- [x] 选区 → 图表数据转换
- [x] 可插拔图表引擎（Chart.js / ECharts adapter）
- [x] 图表类型：柱状、折线、饼图
- [x] 图表 DOM 可 dock 在 grid 下方或 modal

### 非目标

- ❌ 复刻 AG Charts 全功能
- ❌ 图表编辑/标注套件

## API 设计

```typescript
const grid = createGrid({
  data,
  columns,
  rangeSelection: { enabled: true },
  enableCharts: true,
  chartThemeOverrides: { textColor: "#222" },
});

const charts = setupIntegratedCharts(grid, {
  adapter: createChartJsAdapter(Chart),
  container: (chartRef) => createChartContainer(chartRef),
});

document.querySelector("#create-chart")?.addEventListener("click", () => {
  const range = grid.getCellRanges()[0];
  if (!range) return;
  charts.createRangeChart({ type: "bar", range });
});
```

Call `charts.destroy()` when the grid view unmounts.

## 实现细节

`@ac-grid/charts` 是可选包，`chart.js` 和 `echarts` 作为可选 peer dependency。`enableCharts` 在 `createGrid` 中显式启用图表。Grid 从当前 TanStack 行模型导出选区快照。Chart 包根据快照创建柱状图、折线图或饼图，并将图表放在 grid 下方、modal 或自定义容器中。自定义容器回调接收 `ChartRef`，主题覆盖使用引擎无关的颜色、背景色、文字颜色和字体名称。

## 参考资料

- [AG Grid Integrated Charts](https://www.ag-grid.com/javascript-data-grid/integrated-charts/)
- [PARITY_MATRIX](../../PARITY_MATRIX.md)

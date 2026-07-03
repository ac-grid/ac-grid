# RFC-0029: 集成图表 (Integrated Charts)

**状态**: 📝 草稿  
**版本**: 1.2.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0022](./0022-range-selection.md), [0010](./0010-grouping-aggregation.md)

## 概述

从选区或分组数据一键生成图表，对标 AG Grid Enterprise Integrated Charts（非独立 AG Charts 产品）。

## 设计目标

- [ ] 选区 → 图表数据转换
- [ ] 可插拔图表引擎（Chart.js / ECharts adapter）
- [ ] 图表类型：柱状、折线、饼图
- [ ] 图表 DOM 可 dock 在 grid 下方或 modal

### 非目标

- ❌ 复刻 AG Charts 全功能
- ❌ 图表编辑/标注套件

## API 设计

```typescript
interface GridOptions {
  enableCharts?: boolean;
  chartThemeOverrides?: ChartTheme;
  createChartContainer?: (chartRef: ChartRef) => HTMLElement;
}

gridApi.createRangeChart(params: CreateRangeChartParams): ChartRef;
```

## 实现细节

`@ac-grid/charts` 可选包，peer 依赖 `chart.js`。

## 参考资料

- [AG Grid Integrated Charts](https://www.ag-grid.com/javascript-data-grid/integrated-charts/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

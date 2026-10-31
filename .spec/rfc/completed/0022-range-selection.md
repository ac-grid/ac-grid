# RFC-0022: 范围选择 (Range Selection)

**状态**: ✔️ 已完成  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0007](./0007-row-selection.md), [0023](./0023-clipboard-operations.md)

## 概述

支持鼠标拖拽选择矩形单元格区域，对标 AG Grid Enterprise Range Selection。

## 设计目标

- [x] Shift+点击 / 拖拽扩展矩形选区
- [x] `onRangeSelectionChanged` 事件
- [x] 与行选择模式组合；可通过 `combineWithRowSelection: false` 禁用同行选择
- [x] `--ac-grid-range-selection-background` 和 `--ac-grid-range-selection-border` 高亮变量

### 非目标

- ❌ 公式引用选区（见 0030）

## API 设计

```typescript
interface CellRange {
  startRow: number;
  endRow: number;
  columns: string[];
}

interface GridOptions {
  rangeSelection?: {
    enabled?: boolean;
    combineWithRowSelection?: boolean;
    onRangeSelectionChanged?: (ranges: CellRange[]) => void;
  };
}
```

`createGrid` accepts this configuration as `rangeSelection`. The grid also exposes `getCellRanges()` and `clearCellRanges()`.

## 实现细节

Mouse down/enter events track a rectangular range in an independent cell range state; row selection state remains separate. Row indices refer to the current filtered and sorted row model, and `columns` contains visible column IDs. The first version keeps one active range. Range selection uses the current grid page and does not include group or full-width rows.

## 参考资料

- [AG Grid Range Selection](https://www.ag-grid.com/javascript-data-grid/range-selection/)
- [PARITY_MATRIX](../../PARITY_MATRIX.md)

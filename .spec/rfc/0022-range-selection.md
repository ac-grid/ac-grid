# RFC-0022: 范围选择 (Range Selection)

**状态**: 📝 草稿  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0007](./0007-row-selection.md), [0023](./0023-clipboard-operations.md)

## 概述

支持鼠标拖拽选择矩形单元格区域，对标 AG Grid Enterprise Range Selection。

## 设计目标

- [ ] Shift+点击 / 拖拽扩展选区
- [ ] `onRangeSelectionChanged` 事件
- [ ] 与行选择模式互斥或可组合（配置项）
- [ ] 选区高亮样式 token

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
  enableRangeSelection?: boolean;
  onRangeSelectionChanged?: (ranges: CellRange[]) => void;
}
```

## 实现细节

Pointer 事件 + `getCellAtPoint` 命中测试；选区存于独立 store，不污染 row selection state。

## 参考资料

- [AG Grid Range Selection](https://www.ag-grid.com/javascript-data-grid/range-selection/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

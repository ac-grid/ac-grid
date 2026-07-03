# RFC-0021: 主从表格 (Master/Detail)

**状态**: 📝 草稿  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0020](./0020-tree-data.md), [0005-virtual-scrolling](./completed/0005-virtual-scrolling.md)

## 概述

主行展开后嵌入详情面板或子表格，对标 AG Grid Enterprise Master/Detail。

## 设计目标

- [ ] `masterDetail: true` + `detailCellRenderer`
- [ ] 详情行计入行高/虚拟列表
- [ ] 仅单行或允许多行同时展开（可配置）

### 非目标

- ❌ 嵌套无限层级 Master/Detail（用 0020 树形）

## API 设计

```typescript
interface GridOptions {
  masterDetail?: boolean;
  detailCellRenderer?: ComponentType;
  detailRowHeight?: number | ((params) => number);
  isRowMaster?: (data: RowData) => boolean;
}
```

## 实现细节

主行与详情行作为 `FlatRow { type: 'master' | 'detail', masterId }` 进入 virtualizer。

## 参考资料

- [AG Grid Master Detail](https://www.ag-grid.com/javascript-data-grid/master-detail/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

# RFC-0019: 自定义组件（Header / Filter / Overlay）

**状态**: 📝 草稿  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0001](./0001-ac-grid-architecture.md), [0003](./0003-filtering-feature.md)

## 概述

扩展自定义渲染能力至列头、列过滤器、加载/空数据遮罩、全宽行，对标 AG Grid 的 `headerComponent`、`filterComponent`、`loadingOverlayComponent`、`fullWidthCellRenderer`。

## 动机

单元格自定义渲染已在 v0.0.1 实现；AG Grid Community 允许替换 header/filter UI，是企业表格定制的常见需求。

## 设计目标

- [ ] `headerComponent` / `headerComponentParams`
- [ ] `filterComponent` 注册表（与 0003 列过滤集成）
- [ ] `loadingOverlay` / `noRowsOverlay` 插槽
- [ ] `fullWidthRow` 条件渲染
- [ ] WC 与框架 adapter 统一的组件注册 API

### 非目标

- ❌ 浮动过滤器行（见 0028 高级过滤）

## API 设计

```typescript
interface ColumnDef {
  headerComponent?: ComponentType;
  filterComponent?: ComponentType;
  filterComponentParams?: Record<string, unknown>;
}

interface GridOptions {
  loadingOverlayComponent?: ComponentType;
  noRowsOverlayComponent?: ComponentType;
  isFullWidthRow?: (row: Row) => boolean;
  fullWidthRowComponent?: ComponentType;
}
```

## 实现细节

复用现有 cell renderer 注册机制，抽象 `ComponentPortal` 将 WSX/React 组件挂载到 Shadow DOM 槽位。

## 测试策略

- 各插槽渲染与卸载无泄漏
- filterComponent 与 tanstack `getFilteredRowModel` 联动

## 参考资料

- [AG Grid Component Framework](https://www.ag-grid.com/javascript-data-grid/components/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

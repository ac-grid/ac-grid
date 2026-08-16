# RFC-0019: 自定义组件（Header / Filter / Overlay）

**状态**: ✔️ 已完成  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**最后更新**: 2026-07-26  
**相关 RFC**: [0001](../0001-ac-grid-architecture.md), [0003](./0003-filtering-feature.md)

## 概述

扩展自定义渲染能力至列头、列过滤器、加载/空数据遮罩、全宽行，对标 AG Grid 的 `headerComponent`、`filterComponent`、`loadingOverlayComponent`、`fullWidthCellRenderer`。

## 设计目标

- [x] `headerComponent` / `headerComponentParams`
- [x] `filterComponent` 注册表（与 0003 列过滤集成）
- [x] `loadingOverlay` / `noRowsOverlay` 插槽
- [x] `fullWidthRow` 条件渲染
- [x] WC 与框架 adapter 统一的组件注册 API

## API 设计

```typescript
interface ColumnDef {
  headerComponent?: ComponentType;
  headerComponentParams?: Record<string, unknown>;
  filterComponent?: ComponentType;
  filterComponentParams?: Record<string, unknown>;
}

interface GridComponentsConfig {
  loadingOverlayComponent?: ComponentType;
  noRowsOverlayComponent?: ComponentType;
  isFullWidthRow?: (row: Row) => boolean;
  fullWidthRowComponent?: ComponentType;
  isLoading?: boolean;
}
```

## 实现细节

- `packages/core/src/types/components.ts`
- `packages/core/src/utils/component-registry.ts` — `registerComponent` / `registerComponents`
- `packages/core/src/utils/component-portal.ts` — `ComponentPortal`
- `packages/core/src/utils/render-component.ts` / `resolve-header-content.ts`
- `Grid.wsx` — `componentsConfig`、遮罩层、全宽行、自定义过滤器 portal
- `createGrid({ components })`

## 测试策略

- `packages/core/test/custom-components.test.ts`

## 参考资料

- [AG Grid Component Framework](https://www.ag-grid.com/javascript-data-grid/components/)
- [PARITY_MATRIX](../PARITY_MATRIX.md)

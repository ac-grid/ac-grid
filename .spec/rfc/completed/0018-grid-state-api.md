# RFC-0018: Grid 状态 API 与持久化

**Status:** Implemented
**版本**: 0.5.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0001](0001-ac-grid-architecture.md), [0004](0004-column-resizing.md)

## Summary

Provide a versioned state contract and imperative Grid API (`getState`/`setState`/`resetState`) with optional injectable storage persistence. The first version captures column sizing, sorting, filtering, pagination, and vertical scroll position.

## Problem

Users cannot export or restore the grid's current settings as one unit. State is held in separate component fields, and applications have no consistent persistence hook.

## 动机

用户需要保存列宽、排序、过滤、滚动位置并在会话间恢复。当前各功能分散在 tanstack table state，缺少统一导出/导入接口。

## Goals

- `GridState` type for column sizing, ordering, sorting, filters, pagination, and scroll.
- `gridApi.getState()` and `gridApi.setState(partial)` plus `resetState()`.
- Optional `persistState: { key, storage }` configuration.
- Versioned state schema with a `stateVersion` field.

### 非目标

- ❌ 服务端 state 同步（见 0031 SSRM）
- ❌ 多 tab 实时同步

## Design

```typescript
interface GridState {
  stateVersion: 1;
  columnSizing: Record<string, number>;
  columnOrder: string[];
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter?: string;
  pagination: PaginationState;
  scrollTop?: number;
}

interface GridApi {
  getState(): GridState;
  setState(state: Partial<GridState>): void;
  resetState(keys?: (keyof GridState)[]): void;
}
```

`stateVersion` is metadata emitted by `getState`; callers may omit it when passing a partial state. Unknown versions read from storage are ignored. Storage is injected through a minimal `getItem`/`setItem`/`removeItem` interface so applications and tests control the storage environment.

## Acceptance

- State can be read, partially applied, and reset while preserving omitted fields.
- JSON serialization round-trips supported state, and invalid or unknown-version data is ignored.
- Configured storage restores state at initialization and saves subsequent state changes.
- The public state types and persistence options are exported from `@ac-grid/core`.

## 实现细节

1. Expose the component's methods through the element returned by `createGrid`.
2. Keep state normalization and serialization in a pure utility module.
3. Inject storage; do not assume browser `localStorage` exists.

## 测试策略

- round-trip：set → get 等价
- 未知 `stateVersion` 降级/忽略
- 100% 覆盖 serializer

## 参考资料

- [AG Grid Column State](https://www.ag-grid.com/javascript-data-grid/column-state/)
- [PARITY_MATRIX](../../PARITY_MATRIX.md)

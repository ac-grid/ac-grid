# RFC-0018: Grid 状态 API 与持久化

**状态**: 📝 草稿  
**版本**: 0.5.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0001](./0001-ac-grid-architecture.md), [0004](./0004-column-resizing.md)

## 概述

提供统一的 imperative Grid API（`getState`/`setState`/`applyColumnState`）及可选 localStorage 持久化，对标 AG Grid 的 Column State、Filter Model、Sort Model API。

## 动机

用户需要保存列宽、排序、过滤、滚动位置并在会话间恢复。当前各功能分散在 tanstack table state，缺少统一导出/导入接口。

## 设计目标

- [ ] `GridState` 类型：columns, sorting, filtering, pagination, scroll
- [ ] `gridApi.getState()` / `gridApi.setState(partial)`
- [ ] `persistState: { key, storage }` 配置
- [ ] 版本化 state schema（`stateVersion` 字段）

### 非目标

- ❌ 服务端 state 同步（见 0031 SSRM）
- ❌ 多 tab 实时同步

## API 设计

```typescript
interface GridState {
  stateVersion: 1;
  columnSizing: Record<string, number>;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter?: string;
  scrollTop?: number;
}

interface GridApi {
  getState(): GridState;
  setState(state: Partial<GridState>): void;
  resetState(keys?: (keyof GridState)[]): void;
}
```

## 实现细节

1. 在 `create-grid.ts` 暴露 `gridApi` ref
2. `stateSerializer` 纯函数模块（可单测）
3. localStorage adapter 可注入（测试用 memory storage）

## 测试策略

- round-trip：set → get 等价
- 未知 `stateVersion` 降级/忽略
- 100% 覆盖 serializer

## 参考资料

- [AG Grid Column State](https://www.ag-grid.com/javascript-data-grid/column-state/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

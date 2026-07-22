# RFC-0006: 分页功能

**状态**: ✔️ 已完成  
**版本**: 0.2.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**最后更新**: 2026-07-03  
**相关 RFC**: [0001-ac-grid-architecture](../0001-ac-grid-architecture.md), [0005-virtual-scrolling](./0005-virtual-scrolling.md)

## 目录

- [概述](#概述)
- [实现概览](#实现概览)
- [配置与类型](#配置与类型)
- [数据流](#数据流)
- [公开 API](#公开-api)
- [与虚拟滚动并存](#与虚拟滚动并存)
- [已知限制](#已知限制)
- [测试与验证](#测试与验证)
- [非目标](#非目标)
- [参考资料](#参考资料)

## 概述

AC Grid 支持**客户端分页**与**服务端分页**，提供底部分页控件（`PaginationControls`）及编程式 API（`goToPage` / `setPageSize` / `getPaginationState`）。分页默认关闭，与排序、过滤通过 TanStack Table 行模型链集成。

## 实现概览

### 模块与文件

| 路径 | 职责 |
|------|------|
| `packages/core/src/types/pagination.ts` | `GridPaginationConfig`、`PaginationState`、`PaginationInfo`、`PaginatedData` |
| `packages/core/src/utils/pagination.ts` | `computeTotalPages`、`clampPageIndex`、`computePageRange` 等纯函数 |
| `packages/core/src/components/PaginationControls.wsx` | 分页 UI：页码、每页大小、区间信息 |
| `packages/core/src/components/Grid.wsx` | 集成 `getPaginationRowModel`（client）/ `manualPagination`（server）、公开 API |
| `packages/core/src/utils/create-grid.ts` | `createGrid({ pagination })` |
| `packages/core/src/index.ts` | 导出类型、组件与工具函数 |
| `apps/demo-wsx/src/components/DemoPaginationGrid.wsx` | WSX 演示 |
| `apps/demo-react/src/App.tsx` | React 演示（`paginationConfig`） |

## 配置与类型

```typescript
// packages/core/src/types/pagination.ts（摘录）

export interface GridPaginationConfig {
    enabled?: boolean;           // 默认 false
    mode?: 'client' | 'server'; // 默认 'client'
    pageSize?: number;           // 默认 10
    pageSizeOptions?: number[];  // 默认 [10, 20, 30, 40, 50]
    initialPageIndex?: number;   // 默认 0
    onPaginationChange?: (state: PaginationState) => void;
    serverTotalRows?: number;    // server 模式初始总行数
    onServerPagination?: (page: number, pageSize: number) => Promise<PaginatedData>;
}

export interface PaginationInfo extends PaginationState {
    totalRows: number;
    totalPages: number;
}
```

## 数据流

### 客户端分页

```
全量 data → getCoreRowModel → getSortedRowModel → getFilteredRowModel
    → getPaginationRowModel → getRowModel()（渲染当前页）
```

### 服务端分页

```
用户切换页码 → onServerPagination(page, pageSize) → 更新 gridData + serverTotalRows
    → manualPagination: true + pageCount → getRowModel()（当前页数据）
```

**关键修复**：渲染与虚拟化均使用 `table.getRowModel().rows`（最终行模型），而非 `getFilteredRowModel()`，确保分页切片生效。

## 公开 API

| 方法 | 说明 |
|------|------|
| `setPageIndex(page: number)` | 跳转到指定页（0-based） |
| `goToPage(page: number)` | `setPageIndex` 别名 |
| `setPageSize(size: number)` | 设置每页大小并重置到第 0 页 |
| `getPaginationState()` | 返回 `{ pageIndex, pageSize, totalRows, totalPages }` |

## 与虚拟滚动并存

可同时启用；虚拟化在**当前页行**上切片。Demo 默认仅展示分页或虚拟滚动其一，避免混淆产品语义（见 RFC-0005）。

## 已知限制

1. **服务端排序/过滤**：server 模式下排序/过滤变更不会自动重置页码或重新请求——由调用方在 `onServerPagination` 中处理。
2. **加载指示**：仅显示简单 “Loading…” 文案，无骨架屏。
3. **页码跳转输入框**：未实现直接输入页码（仅首/上/下/末页按钮）。

## 测试与验证

- `packages/core/test/pagination.test.ts` — 工具函数、客户端分页行数、`goToPage` / `setPageSize`、`onServerPagination`、`createGrid({ pagination })`。
- 手工验收：`apps/demo-wsx` Pagination 标签页；`apps/demo-react` 启用 `paginationConfig`。

## 非目标

- 无限滚动（使用虚拟滚动 RFC-0005）
- 分页切换动画

## 参考资料

- [ag-Grid 分页文档](https://www.ag-grid.com/javascript-data-grid/pagination/)
- [@tanstack/table-core 分页文档](https://tanstack.com/table/latest/docs/guide/pagination)

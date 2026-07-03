# RFC-0005: 虚拟滚动（行虚拟化）

**状态**: ✔️ 已完成  
**版本**: 0.2.0  
**作者**: Albert Li  
**日期**: 2026-03-29  
**最后更新**: 2026-06-28  
**相关 RFC**: [0001-ac-grid-architecture](../0001-ac-grid-architecture.md)

## 目录

- [概述](#概述)
- [动机](#动机)
- [实现概览](#实现概览)
- [配置与类型](#配置与类型)
- [算法与数据流](#算法与数据流)
- [渲染策略](#渲染策略)
- [公开 API](#公开-api)
- [与旧版 RFC / 常见误解的对照](#与旧版-rfc--常见误解的对照)
- [已知限制](#已知限制)
- [测试与验证](#测试与验证)
- [非目标](#非目标)
- [后续工作建议](#后续工作建议)
- [参考资料](#参考资料)

## 概述

本 RFC 描述 **AC Grid 已落地的行虚拟滚动**：在启用时，仅对 TanStack Table 的**过滤后行模型**做窗口切片，用 **上下 padding** 模拟总高度，卷动时在 `requestAnimationFrame` 中更新可见区间。  
实现以 **`Virtualizer` 类**为核心；**不**依赖 `IntersectionObserver`，**不**使用独立 `VirtualizedGrid` 包装组件。

## 动机

大数据集下全量挂载行节点会导致首屏慢、内存高、滚动掉帧。行虚拟化将 DOM 行数限制在「视口 + overscan」量级，与 ag-Grid 等表格的常见策略一致。

## 实现概览

### 模块与文件

| 路径 | 职责 |
|------|------|
| `packages/core/src/types/virtualization.ts` | `GridVirtualizationConfig`、`VirtualizerState` |
| `packages/core/src/utils/virtualizer.ts` | **`Virtualizer`**：`updateConfig` / `updateState` / `getVirtualState` |
| `packages/core/src/utils/virtual-scroll.ts` | 辅助函数（委托 `Virtualizer`）：`calculateVisibleRange`、`scrollToRow`、`getVisibleRowRange`、`createScrollHandler` |
| `packages/core/src/components/Grid.wsx` | `virtualizationConfig`、`virtualState`、`handleScroll`、`updateVirtualization`、渲染 `slice` + padding、`scrollToRow` / `getVisibleRowRange` |
| `packages/core/src/utils/create-grid.ts` | `createGrid({ virtualization })` 挂载 `virtualizationConfig` |
| `packages/core/src/index.ts` | 导出 `Virtualizer`、`GridVirtualizationConfig` 及 `virtual-scroll` 工具函数 |
| `apps/demo-react/src/App.tsx` | 示例配置（可与分页二选一演示） |

## 配置与类型

```typescript
// packages/core/src/types/virtualization.ts（摘录）

export interface GridVirtualizationConfig {
    /** 是否启用虚拟滚动，默认 false */
    enabled?: boolean;
    /** 固定行高（px），默认 35 */
    rowHeight?: number;
    /** 视口外多渲染的行数（两侧），默认 5 */
    overscan?: number;
}

export interface VirtualizerState {
    scrollTop: number;
    containerHeight: number;
    totalHeight: number;
    visibleRange: { start: number; end: number };
}
```

**`visibleRange.end` 语义**：对应当前实现中 `Array.prototype.slice(start, end)` 的 **第二个参数（不含 `end`）**，即 **左闭右开** `[start, end)`。

## 算法与数据流

### `Virtualizer.getVirtualState()`（`enabled === true` 且 `containerHeight > 0`）

记 `rowHeight = config.rowHeight ?? 35`，`overscan = config.overscan ?? 5`，行数为 `totalCount`：

1. `totalHeight = totalCount * rowHeight`
2. `startIndex = max(0, floor(scrollTop / rowHeight) - overscan)`
3. `visibleCount = ceil(containerHeight / rowHeight)`
4. `endIndex = min(totalCount, startIndex + visibleCount + 2 * overscan)`
5. 返回 `visibleRange: { start: startIndex, end: endIndex }`

### 未就绪时的回退

若 **`!enabled`** 或 **`containerHeight === 0`**：

- `totalHeight` 仍为 `totalCount * rowHeight`（当 `totalCount` 为 0 则为 0）
- `visibleRange` 为 **`{ start: 0, end: totalCount }`**，避免在尚未测量到容器高度时错误裁剪。

### 与表格数据的衔接

- 行数取自 **`getFilteredRowModel().rows.length`**（与渲染一致）。
- 卷动目标为 **`body` 可滚动容器的 `scrollTop` / `clientHeight`**；`handleScroll` 内使用 **`requestAnimationFrame`** 再调用 `virtualizer.updateState`。

## 渲染策略

在 `Grid.render()` 中：

1. `allRows` = 过滤后行模型的 `rows` 数组。
2. 当 **`virtualizationConfig.enabled`** 且 **`virtualState.totalHeight > 0`**：
   - `visibleRows = allRows.slice(start, end)`
   - `paddingTop = start * rowHeight`，`paddingBottom = max(0, (allRows.length - end) * rowHeight)`
3. 否则使用全部 `allRows`，无额外 padding。

**未实现**：列虚拟化、可变行高、`estimateRowHeight`。

## 公开 API

| 入口 | 用法 |
|------|------|
| `Grid` / `wsx-ac-grid` | `virtualizationConfig={{ enabled: true, rowHeight, overscan }}` |
| `createGrid` | `createGrid({ data, columns, virtualization: { enabled: true, ... } })` |
| `Grid.scrollToRow(index)` | 固定行高滚动到行（需 `enabled`） |
| `Grid.getVisibleRowRange()` | 返回 `{ start, end }`，half-open 区间 |
| `@ac-grid/core` 工具 | `Virtualizer`、`scrollToRow`、`getVisibleRowRange`、`calculateVisibleRange`、`createScrollHandler` |

## 与旧版 RFC / 常见误解的对照

| 旧描述或误解 | 实际代码 |
|--------------|----------|
| 以 `IntersectionObserver` 为主 | **未使用**；卷动 + 固定行高数学窗口 |
| 存在名为 `VirtualizedGrid` 的独立组件 | **无**；逻辑在 `Grid` + `Virtualizer` |
| `GridOptions.enableVirtualScrolling` | **无**；使用 **`virtualizationConfig.enabled`** |
| `createGrid({ enableVirtualScrolling })` | 使用 **`createGrid({ virtualization })`** |

## 已知限制

1. **固定行高**：行高变化、多行单元格会导致占位与真实高度不一致。  
2. **与分页并存**：虚拟滚动与客户端分页同时启用时，产品语义需由调用方明确（demo 默认仅展示分页）。  
3. **列虚拟化**：未实现；横向大量列需单独 RFC。  
4. **`virtual-scroll.ts`**：DOM 测量辅助（`calculateVisibleRange`）与 `Virtualizer` 并存，供无 Grid 实例场景使用。

## 测试与验证

- `packages/core/test/virtualizer.test.ts` — `Virtualizer.getVirtualState` 全路径（禁用、零高度、overscan、边界）。  
- `packages/core/test/virtual-scrolling.test.ts` — `virtual-scroll` 工具与 `createGrid({ virtualization })`。  
- 手工验收：`apps/demo-react` 取消注释 `virtualizationConfig` 并注释 `paginationConfig` 可验证 10K 行滚动。

## 非目标

- 服务端虚拟滚动、无限滚动加载（Infinite scroll）— 独立 RFC。  
- 列虚拟化 — 未实现。

## 后续工作建议

1. **动态行高**：累计高度表或测量缓存，调整 `totalHeight` / padding。  
2. **列虚拟化**：横向窗口 + 列宽测量。  
3. **性能基准**：10K / 50K / 100K 行自动化基准（PARITY_MATRIX「100K+ 行性能」）。  
4. **组件集成测试**：`happy-dom` 下验证 DOM 行数与 `visibleRange` 一致。

## 参考资料

- [TanStack Table — Row Models](https://tanstack.com/table/latest/docs/guide/row-models)  
- [ag-Grid DOM Layout / Virtualization](https://www.ag-grid.com/javascript-data-grid/dom-layout/)  

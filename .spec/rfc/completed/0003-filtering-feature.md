# RFC-0003: 过滤功能

**状态**: ✔️ 已完成  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**最后更新**: 2026-07-26  
**相关 RFC**: [0001-ac-grid-architecture](../0001-ac-grid-architecture.md), [0002-sorting-feature](./0002-sorting-feature.md)

### 实现状态（当前代码库）

| 目标                               | 状态 | 说明                                                                                         |
| ---------------------------------- | ---- | -------------------------------------------------------------------------------------------- |
| 目标 1: 列过滤（文本、数字、日期） | ✅   | `filter-functions.ts`：defaultTextFilter、numberFilter、dateFilter；列 def 支持 `filterType` |
| 目标 2: 全局搜索                   | ✅   | `GlobalSearch.wsx`、`globalFilter`、`setGlobalFilter()`、`globalFilterFn`                    |
| 目标 3: 自定义过滤函数             | ✅   | 列 def 支持 `filterFn`，可覆盖默认                                                           |
| 目标 4: 编程式 API                 | ✅   | `setGlobalFilter`、`setColumnFilter`、`clearFilters`、`getFilterState()`                     |
| 目标 5: 过滤状态可视化             | ✅   | `FilterIcon.wsx`、`FilterMenu.wsx`，表头过滤图标与弹出菜单                                   |
| 目标 6: 类型安全                   | ✅   | `FilterState`、`GridFilteringConfig`、`FilterFn`、`FilterCondition`（`types/filtering.ts`）  |
| 目标 7: 过滤操作符                 | ✅   | 支持 contains、equals、startsWith、endsWith、greaterThan、lessThan、blank、notBlank          |
| 目标 8: 浮动过滤器                 | ✅   | `FilterInput` 支持 `variant="floating"`                                                      |

- 启用方式：`filteringConfig={{ enabled: true }}` 或 `enableFiltering={true}`，或通过 `setGlobalFilter`/`setColumnFilter` 触发。
- 搜索框在 Grid 外：使用 `<wsx-ac-global-search>` + `grid.setGlobalFilter(value)`。

## AG Grid 功能对比

> **对比日期**: 2026-02-01  
> **AG Grid 版本**: Community Edition (Latest)

### 功能对比矩阵

| Feature                      | AG Grid (Community)                | AC Grid                          | Status                | Priority |
| ---------------------------- | ---------------------------------- | -------------------------------- | --------------------- | -------- |
| **列过滤**                   |                                    |                                  |                       |          |
| 启用/禁用列过滤              | `filter: true/false`               | `enableColumnFilter: true/false` | ✅ 已实现             | -        |
| 文本过滤                     | `agTextColumnFilter`               | `filterType: 'text'`             | ✅ 已实现             | -        |
| 数字过滤                     | `agNumberColumnFilter`             | `filterType: 'number'`           | ✅ 已实现             | -        |
| 日期过滤                     | `agDateColumnFilter`               | `filterType: 'date'`             | ✅ 已实现             | -        |
| Set Filter (多选)            | `agSetColumnFilter` (Enterprise)   | ❌                               | ⏳ Enterprise feature | P3       |
| Multi Filter                 | `agMultiColumnFilter` (Enterprise) | ❌                               | ⏳ Enterprise feature | P3       |
| **过滤选项**                 |                                    |                                  |                       |          |
| Contains/Not Contains        | ✅                                 | ✅                               | ✅ 已实现             | -        |
| Equals/Not Equals            | ✅                                 | ✅                               | ✅ 已实现             | -        |
| Starts With/Ends With        | ✅                                 | ✅                               | ✅ 已实现             | -        |
| 大于/小于                    | ✅                                 | ✅                               | ✅ 已实现             | -        |
| Blank/Not Blank              | ✅                                 | ✅                               | ✅ 已实现             | -        |
| 多条件 (AND/OR)              | ✅ `maxNumConditions`              | ❌                               | ❌ 缺失               | P2       |
| **过滤 UI**                  |                                    |                                  |                       |          |
| 过滤图标                     | ✅                                 | ✅                               | ✅ 已实现             | -        |
| 过滤菜单/弹出框              | ✅                                 | ✅                               | ✅ 已实现             | -        |
| 自定义下拉组件               | ✅ styled                          | ✅                               | ✅ 已实现             | -        |
| 浮动过滤器 (Floating Filter) | ✅                                 | ✅                               | ✅ 已实现             | -        |
| Apply/Clear/Reset 按钮       | ✅ `buttons`                       | ❌                               | ❌ 缺失               | P3       |
| **快速过滤**                 |                                    |                                  |                       |          |
| 全局快速过滤                 | ✅ `quickFilterText`               | ✅ `globalFilter`                | ✅ 已实现             | -        |
| 大小写敏感                   | ✅ `caseSensitive`                 | ❌ (always insensitive)          | ❌ 缺失               | P3       |
| 快速过滤缓存                 | ✅ `cacheQuickFilter`              | ❌                               | ❌ 缺失               | P3       |
| **自定义过滤**               |                                    |                                  |                       |          |
| 自定义过滤函数               | ✅ `filterValueGetter`             | ✅ `filterFn`                    | ✅ 已实现             | -        |
| 文本格式化器                 | ✅ `textFormatter`                 | ❌                               | ❌ 缺失               | P2       |
| **编程式 API**               |                                    |                                  |                       |          |
| 设置过滤                     | ✅ `setFilterModel`                | ✅ `setColumnFilter`             | ✅ 已实现             | -        |
| 获取过滤状态                 | ✅ `getFilterModel`                | ✅ `getFilterState`              | ✅ 已实现             | -        |
| 清除过滤                     | ✅ `setFilterModel(null)`          | ✅ `clearFilters`                | ✅ 已实现             | -        |
| 过滤变更事件                 | ✅ `onFilterChanged`               | ✅ `onFilterChange`              | ✅ 已实现             | -        |
| **性能**                     |                                    |                                  |                       |          |
| 防抖 (debounce)              | ✅ `debounceMs`                    | ⚠️ 待验证                        | ⚠️ 需测试             | -        |
| 过滤缓存                     | ✅                                 | ✅ (tanstack)                    | ✅ 已实现             | -        |

### 覆盖率估算

- **核心功能**: ~85% (文本/数字/日期过滤、全局搜索、自定义过滤、API、操作符)
- **高级选项**: ~40% (缺少多条件、Apply按钮等)
- **总体估算**: ~70%

### Phase 2 缺失功能 (优先级排序)

| Priority | Feature             | Effort | Description                        |
| -------- | ------------------- | ------ | ---------------------------------- |
| P2       | 多条件过滤 (AND/OR) | 2d     | 支持多个条件组合                   |
| P2       | 文本格式化器        | 0.5d   | 过滤前格式化文本（如去除重音符号） |
| P3       | `caseSensitive`     | 0.5d   | 大小写敏感过滤选项                 |
| P3       | Apply/Reset 按钮    | 1d     | 过滤菜单增加应用/重置按钮          |
| P3       | 过滤历史记录        | 2d     | 保存最近使用的过滤条件             |

**Phase 2 总估算**: ~6 天

## 目录

- [概述](#概述)
- [动机](#动机)
- [设计目标](#设计目标)
- [技术方案](#技术方案)
- [API 设计](#api-设计)
- [过滤操作符](#过滤操作符)
- [自定义过滤指南](#自定义过滤指南)
- [实现细节](#实现细节)
- [测试策略](#测试策略)
- [性能考虑](#性能考虑)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)
- [变更日志](#变更日志)

## 概述

为 AC Grid 添加数据过滤功能，支持列过滤、全局搜索和快速过滤，提供多种过滤模式（文本、数字、日期等），并支持自定义过滤函数和过滤操作符。

## 动机

### 问题陈述

当前 AC Grid 只能显示所有数据，用户无法过滤数据以快速找到所需信息。过滤是数据表格的核心功能，ag-Grid 社区版提供了完整的过滤支持。

### 用户场景

**场景 1：列过滤**

```typescript
// 用户在列头点击过滤图标
// 显示过滤菜单，选择操作符并输入过滤值
// 表格自动过滤显示匹配的行
grid.setColumnFilter("age", { value: "30", operator: "greaterThan" });
```

**场景 2：全局搜索**

```typescript
// 用户在搜索框输入关键词
// 所有列中匹配的行被显示
grid.setGlobalFilter("search term");
```

**场景 3：多列组合过滤**

```typescript
// 用户对多个列设置过滤条件
// 只显示同时满足所有条件的行
grid.setColumnFilter("department", {
  value: "Engineering",
  operator: "equals",
});
grid.setColumnFilter("age", { value: "25", operator: "greaterThan" });
```

**场景 4：空值过滤**

```typescript
// 过滤出所有姓名为空的行
grid.setColumnFilter("name", { value: "", operator: "blank" });
```

### 与 ag-Grid 的对比

ag-Grid 社区版提供：

- ✅ 列过滤（文本、数字、日期）
- ✅ 全局快速过滤
- ✅ 自定义过滤函数
- ✅ 过滤状态持久化
- ✅ 过滤操作符（contains, equals, greaterThan 等）

## 设计目标

- [x] **目标 1**: 支持列过滤（文本、数字、日期）
- [x] **目标 2**: 支持全局搜索
- [x] **目标 3**: 支持自定义过滤函数
- [x] **目标 4**: 提供编程式过滤 API
- [x] **目标 5**: 过滤状态可视化（过滤图标）
- [x] **目标 6**: 类型安全的 API
- [x] **目标 7**: 支持过滤操作符（contains, equals, greaterThan 等）
- [x] **目标 8**: 支持空值/非空值过滤（blank/notBlank）

### 非目标

- ❌ 服务端过滤（将在未来版本中考虑）
- ❌ 高级过滤（多条件 AND/OR，将在未来版本中考虑）
- ❌ 过滤历史记录

## 技术方案

### 方案概述

利用 `@tanstack/table-core` 的 `getFilteredRowModel` 和过滤状态管理能力，结合 wsxjs 的响应式状态管理，实现高性能的客户端过滤功能。

### 架构设计

```
用户输入过滤条件（FilterCondition 对象）
    ↓
FilterInput 组件 → onChange(FilterCondition)
    ↓
Grid 组件更新 columnFilters（Record<string, FilterCondition | string>）
    ↓
@tanstack/table-core 处理过滤逻辑（通过 filterFn）
    ↓
getFilteredRowModel() 返回过滤后的行
    ↓
Grid 组件重新渲染
```

### 核心组件

#### 组件 1: FilterInput

**职责**：列过滤输入组件，支持选择操作符和输入值

**接口**：

```typescript
interface FilterInputProps {
  column: Column<any, unknown>;
  value: FilterCondition | string;
  onChange: (condition: FilterCondition) => void;
  variant?: "default" | "floating";
}
```

#### 组件 2: GlobalSearch

**职责**：全局搜索组件

**接口**：

```typescript
interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### 数据流

```
用户输入 → FilterCondition 对象 → columnFilters → table.getFilteredRowModel() → 重新渲染
```

**重要**：使用 FilterCondition 对象直接传递，**不使用 JSON.stringify**。

### 依赖关系

- **新增依赖**: 无（使用 @tanstack/table-core 内置功能）
- **内部依赖**: Grid 组件、DraggableTableHeader 组件、FilterInput 组件

### 模块化设计决策

**问题**: 是否应该将过滤功能作为独立模块（类似 ag-Grid 的模块系统）？

**决策**: ❌ **不采用模块化设计**（当前阶段）

**理由**:

1. **过滤是核心功能**: 大多数用户都需要过滤功能，不是可选功能
2. **代码量小**: `@tanstack/table-core` 已内置过滤，我们只是配置和 UI 封装
3. **Tree-shaking 已足够**: 现代打包工具（Vite/Rollup）会自动移除未使用的代码
4. **避免过度设计**: 模块化会增加复杂性和维护成本

**未来考虑**:

- 如果包体积成为问题（> 500KB），可以考虑模块化
- 如果过滤 UI 组件变得很大，可以拆分为 `@ac-grid/filter-ui` 包
- 如果支持服务端过滤，可以创建 `@ac-grid/filter-server` 包

## API 设计

### 类型定义

```typescript
/**
 * 过滤条件对象
 * 包含过滤值和操作符
 */
export interface FilterCondition {
  /** 过滤值 */
  value: string;
  /** 过滤操作符 */
  operator: FilterOperator;
}

/**
 * 过滤操作符类型
 */
export type FilterOperator =
  // 文本操作符
  | "contains"
  | "notContains"
  | "equals"
  | "notEqual"
  | "startsWith"
  | "endsWith"
  | "blank"
  | "notBlank"
  // 数字操作符
  | "greaterThan"
  | "lessThan";

/**
 * 过滤状态
 */
export interface FilterState {
  globalFilter?: string;
  /**
   * 列过滤条件
   * - FilterCondition 对象：完整过滤条件（推荐）
   * - string：简单过滤值，默认操作符为 'contains'（向后兼容）
   */
  columnFilters: Record<string, FilterCondition | string>;
}

/**
 * 过滤函数类型
 */
export type FilterFn<TData> = (
  row: Row<TData>,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => boolean;

/**
 * 过滤类型（用于列定义）
 */
export type FilterType = "text" | "number" | "date" | "custom";

/**
 * 过滤配置
 */
export interface GridFilteringConfig {
  /** 是否启用过滤 */
  enabled?: boolean;
  /** 初始全局过滤值 */
  initialGlobalFilter?: string;
  /** 初始列过滤条件 */
  initialColumnFilters?: Record<string, FilterCondition | string>;
  /** 过滤变化回调 */
  onFilterChange?: (filterState: FilterState) => void;
  /** 是否启用浮动过滤器 */
  floatingFilter?: boolean;
}
```

### 方法

````typescript
class Grid {
  /**
   * 设置全局过滤条件
   * @param value - 过滤值（在所有列中搜索）
   */
  setGlobalFilter(value: string): void;

  /**
   * 设置列过滤条件
   * @param columnId - 列 ID
   * @param condition - FilterCondition 对象或简单字符串
   *
   * 示例：
   * ```typescript
   * // 方式 1：FilterCondition 对象（完整控制）
   * grid.setColumnFilter('name', {
   *     value: 'John',
   *     operator: 'equals'
   * });
   *
   * // 方式 2：简单字符串（向后兼容）
   * // 默认使用 'contains' 操作符
   * grid.setColumnFilter('name', 'John');
   *
   * // 方式 3：空值过滤
   * grid.setColumnFilter('name', { value: '', operator: 'blank' });
   *
   * // 方式 4：数字过滤
   * grid.setColumnFilter('age', { value: '30', operator: 'greaterThan' });
   * ```
   */
  setColumnFilter(columnId: string, condition: FilterCondition | string): void;

  /**
   * 清除所有过滤条件
   */
  clearFilters(): void;

  /**
   * 获取当前过滤状态
   * @returns FilterState 对象
   */
  getFilterState(): FilterState;
}
````

### 列定义增强

```typescript
interface ColumnDef<TData> {
  // 启用列过滤
  enableColumnFilter?: boolean;
  // 自定义过滤函数
  filterFn?: FilterFn<TData>;
  // 过滤类型（决定默认过滤函数和操作符选项）
  filterType?: FilterType;
}
```

### 使用示例

#### 基础用法

```typescript
import { Grid, type FilterCondition } from "@ac-grid/core";

const grid = createGrid({
  data,
  columns,
  enableFiltering: true,
});

// 使用 FilterCondition 对象
const condition: FilterCondition = { value: "John", operator: "equals" };
grid.setColumnFilter("name", condition);

// 使用简单字符串（向后兼容）
grid.setColumnFilter("name", "John"); // 默认 operator='contains'
```

#### 禁用某列过滤

```typescript
const columns = [
  {
    id: "actions",
    header: "Actions",
    enableColumnFilter: false, // 禁用此列的过滤
  },
];
```

## 过滤操作符

### 文本操作符

| 操作符        | 说明         | 示例                                                              |
| ------------- | ------------ | ----------------------------------------------------------------- |
| `contains`    | 包含（默认） | `{ value: 'John', operator: 'contains' }` 匹配 "John", "Johnson"  |
| `notContains` | 不包含       | `{ value: 'test', operator: 'notContains' }` 排除包含 "test" 的行 |
| `equals`      | 等于         | `{ value: 'John', operator: 'equals' }` 只匹配 "John"             |
| `notEqual`    | 不等于       | `{ value: 'John', operator: 'notEqual' }` 排除 "John"             |
| `startsWith`  | 开头匹配     | `{ value: 'Jo', operator: 'startsWith' }` 匹配 "John", "Joan"     |
| `endsWith`    | 结尾匹配     | `{ value: 'ohn', operator: 'endsWith' }` 匹配 "John", "Johnson"   |
| `blank`       | 空值         | `{ value: '', operator: 'blank' }` 匹配 null, undefined, ""       |
| `notBlank`    | 非空值       | `{ value: '', operator: 'notBlank' }` 排除 null, undefined, ""    |

### 数字操作符

| 操作符        | 说明         | 示例                                                |
| ------------- | ------------ | --------------------------------------------------- |
| `equals`      | 等于（默认） | `{ value: '30', operator: 'equals' }` 匹配 30       |
| `greaterThan` | 大于         | `{ value: '30', operator: 'greaterThan' }` 匹配 >30 |
| `lessThan`    | 小于         | `{ value: '30', operator: 'lessThan' }` 匹配 <30    |

### 使用示例

```typescript
// 文本过滤 - 开头匹配
grid.setColumnFilter("name", { value: "A", operator: "startsWith" });

// 文本过滤 - 空值
grid.setColumnFilter("email", { value: "", operator: "blank" });

// 数字过滤 - 大于
grid.setColumnFilter("age", { value: "25", operator: "greaterThan" });

// 向后兼容 - 简单字符串
grid.setColumnFilter("name", "John"); // 等同于 { value: 'John', operator: 'contains' }
```

## 自定义过滤指南

### 1. 自定义过滤函数 (filterFn)

```typescript
import type { ColumnDef, Row, FilterCondition } from "@ac-grid/core";

const columns: ColumnDef<Person>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    // 自定义过滤函数：接收 FilterCondition 对象
    filterFn: (
      row: Row<Person>,
      columnId: string,
      filterValue: FilterCondition | string,
    ) => {
      // 统一转换为 FilterCondition
      const condition: FilterCondition =
        typeof filterValue === "string"
          ? { value: filterValue, operator: "contains" }
          : filterValue;

      const value = row.getValue(columnId) as string;
      return value.toLowerCase().includes(condition.value.toLowerCase());
    },
  },
];
```

### 2. 编程式过滤控制

```typescript
// 获取 Grid 实例
const gridElement = document.querySelector("wsx-ac-grid") as any;

// 设置列过滤（FilterCondition 对象）
gridElement.setColumnFilter("name", { value: "John", operator: "equals" });

// 设置列过滤（简单字符串 - 向后兼容）
gridElement.setColumnFilter("name", "John");

// 获取当前过滤状态
const filterState = gridElement.getFilterState();

// 清除所有过滤
gridElement.clearFilters();
```

### 3. 过滤状态持久化

```typescript
import { createGrid, type FilterState } from "@ac-grid/core";

const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,
  filtering: {
    onFilterChange: (filterState: FilterState) => {
      localStorage.setItem("gridFilters", JSON.stringify(filterState));
    },
  },
});

// 恢复过滤状态
const savedFilters = localStorage.getItem("gridFilters");
if (savedFilters) {
  const filterState = JSON.parse(savedFilters) as FilterState;
  Object.entries(filterState.columnFilters).forEach(([columnId, value]) => {
    gridElement.setColumnFilter(columnId, value as FilterCondition | string);
  });
}
```

## 实现细节

### FilterCondition 对象设计

**设计原则**：

- 使用显式的 FilterCondition 对象，而非 JSON 字符串
- 支持操作符和值的组合
- 向后兼容简单字符串输入

**重要**：禁止在组件间传递 JSON 字符串。使用 FilterCondition 对象直接传递，提高类型安全性和性能。

**数据结构**：

```typescript
interface FilterCondition {
  value: string; // 过滤值
  operator: FilterOperator; // 操作符
}
```

**向后兼容处理**：

```typescript
// 所有过滤函数统一处理输入
const condition: FilterCondition =
  typeof filterValue === "string"
    ? { value: filterValue, operator: defaultOperator }
    : filterValue;
```

### 过滤函数实现

```typescript
export const defaultTextFilter = (
  row: any,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => {
  // 统一转换为 FilterCondition
  const condition: FilterCondition =
    typeof filterValue === "string"
      ? { value: filterValue, operator: "contains" }
      : (filterValue as FilterCondition);

  const rawValue = row.getValue(columnId);
  const rowValue = String(rawValue ?? "").toLowerCase();
  const searchTerm = (condition.value ?? "").toLowerCase();

  // 如果搜索词为空且操作符不是 blank/notBlank，不过滤
  if (
    searchTerm === "" &&
    condition.operator !== "blank" &&
    condition.operator !== "notBlank"
  ) {
    return true;
  }

  switch (condition.operator) {
    case "equals":
      return rowValue === searchTerm;
    case "startsWith":
      return rowValue.startsWith(searchTerm);
    case "endsWith":
      return rowValue.endsWith(searchTerm);
    case "contains":
      return rowValue.includes(searchTerm);
    case "notContains":
      return !rowValue.includes(searchTerm);
    case "notEqual":
      return rowValue !== searchTerm;
    case "blank":
      return rawValue == null || rawValue === "";
    case "notBlank":
      return rawValue != null && rawValue !== "";
    default:
      return rowValue.includes(searchTerm);
  }
};
```

## 测试策略

### 单元测试

- 测试文本过滤（所有操作符）
- 测试数字过滤（所有操作符）
- 测试日期过滤
- 测试空值过滤（blank/notBlank）
- 测试全局搜索
- 测试多列组合过滤
- 测试自定义过滤函数
- 测试 FilterCondition 对象处理
- 测试向后兼容（简单字符串）

### 测试覆盖率目标

- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标

- **过滤响应时间**: < 50ms (10K 行)
- **内存占用**: 最小化临时对象创建

### 性能优化策略

1. 使用防抖（debounce）优化输入响应
2. 使用 `getFilteredRowModel` 的缓存机制
3. 避免不必要的重新渲染
4. **避免 JSON 序列化/反序列化**（使用 FilterCondition 对象直接传递）

## 向后兼容性

### 破坏性变更

**无**。本次更新完全向后兼容：

- `setColumnFilter(columnId, 'value')` 继续工作（字符串自动转换为 FilterCondition）
- `columnFilters: Record<string, string>` 自动兼容 `Record<string, FilterCondition | string>`
- 所有现有代码无需修改

### 迁移指南

无需迁移，新功能向后兼容。推荐使用 FilterCondition 对象以获得更精确的控制：

```typescript
// 旧方式（仍然支持）
grid.setColumnFilter("name", "John");

// 新方式（推荐）
grid.setColumnFilter("name", { value: "John", operator: "equals" });
```

## 替代方案

### 方案 A: 服务端过滤

**优点**: 支持大数据集，减少客户端计算  
**缺点**: 需要服务端支持，增加网络请求

### 方案 B: 客户端过滤（当前方案）

**优点**: 无需服务端支持，响应速度快，离线可用，支持丰富的操作符  
**缺点**: 大数据集可能影响性能

**选择当前方案的理由**：客户端过滤更符合当前架构，且 @tanstack/table-core 提供了优秀的过滤支持。

## 开放问题

- [ ] **问题 1**: 是否需要过滤历史记录功能？
- [ ] **问题 2**: 是否需要保存过滤状态到 URL？

## 参考资料

- [ag-Grid 过滤文档](https://www.ag-grid.com/javascript-data-grid/filtering/)
- [@tanstack/table-core 过滤文档](https://tanstack.com/table/latest/docs/guide/filters)

---

## 变更日志

### 2026-02-01 (v0.1.1)

- **重大改进**: 移除 JSON.stringify，改为 FilterCondition 对象
- 新增 `FilterCondition` 和 `FilterOperator` 类型定义
- 新增 `blank`/`notBlank` 操作符（空值/非空值过滤）
- 新增 `startsWith`/`endsWith` 操作符（开头/结尾匹配）
- 更新 `columnFilters` 类型为 `Record<string, FilterCondition | string>`
- 更新 `FilterInput` 支持 `variant="floating"`（浮动过滤器）
- 完全向后兼容
- 提升性能（避免 JSON 序列化/反序列化开销）
- 提升类型安全性

### 2026-01-31 (v0.1.0)

- 初始 RFC 创建
- 实现基础过滤功能（文本、数字、日期）
- 实现操作符支持（contains, equals, greaterThan, lessThan）
- 使用 JSON.stringify 传递操作符和值（已弃用）

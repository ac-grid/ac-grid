# RFC-0002: 排序功能

**状态**: ✅ 已完成  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**最后更新**: 2026-01-31  
**相关 RFC**: [0001-ac-grid-architecture](0001-ac-grid-architecture.md)

## 目录

- [概述](#概述)
- [AG Grid 功能对比](#ag-grid-功能对比)
- [动机](#动机)
- [设计目标](#设计目标)
- [技术方案](#技术方案)
- [API 设计](#api-设计)
- [实现细节](#实现细节)
- [缺失功能 (Phase 2)](#缺失功能-phase-2)
- [测试策略](#测试策略)
- [性能考虑](#性能考虑)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)

## 概述

为 AC Grid 添加列排序功能，支持单列排序和多列排序，提供升序/降序/无序三种状态，并支持自定义排序函数。

## AG Grid 功能对比

> **对比日期**: 2026-01-31  
> **AG Grid 版本**: Community Edition (Latest)

### 功能对比矩阵

| Feature | AG Grid (Community) | AC Grid | Status | Priority |
|---------|---------------------|---------|--------|----------|
| **基础排序** |||||
| 启用/禁用列排序 | `sortable: true/false` | `enableSorting: true/false` | ✅ 已实现 | - |
| 点击列头排序 | ✅ | ✅ | ✅ 已实现 | - |
| 升序 → 降序 → 无 循环 | ✅ | ✅ | ✅ 已实现 | - |
| **多列排序** |||||
| Shift+Click 多列排序 | ✅ | ✅ | ✅ 已实现 | - |
| `multiSortKey` 配置 (ctrl/shift) | `multiSortKey='ctrl'` | ❌ | ❌ 缺失 | P2 |
| `suppressMultiSort` | ✅ | ❌ | ❌ 缺失 | P3 |
| `alwaysMultiSort` | ✅ | ❌ | ❌ 缺失 | P3 |
| 排序索引指示器 | ✅ | ✅ | ✅ 已实现 | - |
| **自定义排序** |||||
| 自定义比较器 | `comparator(valueA, valueB, nodeA, nodeB, isDesc)` | `sortingFn(rowA, rowB, columnId)` | ✅ 已实现 | - |
| 内置排序函数 | ✅ | ✅ (via TanStack) | ✅ 已实现 | - |
| `accentedSort` 本地化排序 | `accentedSort: true` | ❌ | ❌ 缺失 | P2 |
| **排序顺序配置** |||||
| `sortingOrder` 自定义循环 | `['asc', 'desc', null]` | ❌ | ❌ 缺失 | P1 |
| `sortDescFirst` | ✅ | ✅ (via TanStack) | ✅ 已实现 | - |
| `invertSorting` | ✅ | ✅ (via TanStack) | ✅ 已实现 | - |
| Absolute sorting (按绝对值) | `type: 'absolute'` | ❌ | ❌ 缺失 | P3 |
| **排序 API** |||||
| 获取排序状态 | Column State API | `getSorting()` | ✅ 已实现 | - |
| 设置排序状态 | Column State API | `setSorting(state)` | ✅ 已实现 | - |
| 重置排序 | ✅ | `resetSorting()` | ✅ 已实现 | - |
| **视觉效果** |||||
| 排序指示器图标 | ✅ | ✅ (SVG arrows) | ✅ 已实现 | - |
| 未排序列图标 | 可自定义 | ✅ (半透明双箭头) | ✅ 已实现 | - |
| 排序动画 | `animateRows` | ❌ | ❌ 缺失 | P3 |
| **事件** |||||
| 排序变化回调 | 事件系统 | `onSortingChange` | ✅ 已实现 | - |
| **高级功能** |||||
| `postSortRows` 后处理 | ✅ | ❌ | ❌ 缺失 | P2 |
| 服务端排序 | ✅ | ❌ | ❌ 未来版本 | P3 |

### 实现状态汇总

| 类别 | AG Grid 功能数 | AC Grid 已实现 | 覆盖率 |
|------|---------------|----------------|--------|
| 基础排序 | 3 | 3 | **100%** |
| 多列排序 | 4 | 2 | **50%** |
| 自定义排序 | 3 | 2 | **67%** |
| 排序顺序 | 4 | 2 | **50%** |
| 排序 API | 3 | 3 | **100%** |
| 视觉效果 | 3 | 2 | **67%** |
| 事件 | 1 | 1 | **100%** |
| 高级功能 | 2 | 0 | **0%** |
| **总计** | **23** | **15** | **~65%** |

### 优先级说明

- **P1 (高)**: 影响核心用户体验，应尽快实现
- **P2 (中)**: 常用功能，建议在 v0.2.0 实现
- **P3 (低)**: 高级功能，可延后实现

## 动机

### 问题陈述
当前 AC Grid 只能显示原始数据顺序，用户无法对数据进行排序，这在处理大量数据时严重影响用户体验。排序是数据表格的基础功能，ag-Grid 社区版也提供了完整的排序支持。

### 用户场景

**场景 1：单列排序**
```typescript
// 用户点击列头，按该列升序排序
// 再次点击，按该列降序排序
// 第三次点击，恢复原始顺序
```

**场景 2：多列排序**
```typescript
// 用户按住 Shift 键点击多个列头
// 数据按点击顺序依次排序
```

**场景 3：自定义排序**
```typescript
const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortingFn: (rowA, rowB, columnId) => {
      // 自定义排序逻辑（如中文拼音排序）
      return rowA.getValue(columnId).localeCompare(rowB.getValue(columnId), 'zh-CN');
    }
  }
];
```

## 设计目标

### Phase 1 (✅ 已完成)

- [x] **目标 1**: 支持单列排序（升序/降序/无序）
- [x] **目标 2**: 支持多列排序（Shift + 点击）
- [x] **目标 3**: 支持自定义排序函数
- [x] **目标 4**: 提供编程式排序 API
- [x] **目标 5**: 排序状态可视化（列头指示器）
- [x] **目标 6**: 类型安全的 API

### Phase 2 (📋 计划中)

- [ ] **目标 7**: 支持 `sortingOrder` 自定义排序循环
- [ ] **目标 8**: 支持 `multiSortKey` 配置 (ctrl/shift)
- [ ] **目标 9**: 支持 `accentedSort` 本地化排序
- [ ] **目标 10**: 支持 `postSortRows` 后处理回调
- [ ] **目标 11**: 支持 `suppressMultiSort` / `alwaysMultiSort`

### 非目标 (未来版本)
- ❌ 服务端排序（将在 v0.3.0+ 考虑）
- ❌ 排序动画（将在 v0.4.0+ 考虑）
- ❌ Absolute sorting（将在未来版本考虑）

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `getSortedRowModel` 和排序状态管理能力，结合 wsxjs 的响应式状态管理，实现高性能的客户端排序功能。

### 架构设计

```
用户点击列头
    ↓
Grid 组件捕获点击事件
    ↓
检测是否按住 Shift 键（多列排序）
    ↓
调用 column.toggleSorting()
    ↓
@tanstack/table-core 更新排序状态
    ↓
触发 onSortingChange 回调
    ↓
Grid 组件更新 @state sorting 状态
    ↓
getSortedRowModel 重新计算排序后的行
    ↓
wsxjs 自动重新渲染组件
    ↓
显示排序后的数据和排序指示器
```

### 核心组件

#### 组件 1: SortingIndicator（排序指示器）
**职责**：显示列的排序状态（升序/降序/无序）

**接口**：
```typescript
interface SortingIndicatorProps {
  /** 排序方向：'asc' | 'desc' | false */
  direction: 'asc' | 'desc' | false;
  /** 多列排序时的排序索引（可选） */
  index?: number;
}
```

**实现状态**: ✅ 已完成
- SVG 箭头图标
- 未排序状态显示半透明双箭头
- 多列排序显示索引数字

#### 组件 2: Grid 组件（排序集成）
**职责**：管理排序状态，配置排序模型

**实现状态**: ✅ 已完成
- `sorting` 状态管理
- `getSortedRowModel` 集成
- 编程式 API (`setSorting`, `getSorting`, `resetSorting`)

### 依赖关系
- **外部依赖**: `@tanstack/table-core` (已包含排序功能)
- **内部依赖**: 
  - Grid.wsx
  - SortingIndicator.wsx

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridSortingConfig {
  /** 是否启用排序（默认：true） */
  enabled?: boolean;
  /** 是否允许多列排序（默认：true） */
  multiColumn?: boolean;
  /** 初始排序状态 */
  initialState?: SortingState;
  /** 排序状态变化回调 */
  onSortingChange?: (sorting: SortingState) => void;
  
  // === Phase 2 新增 ===
  /** 多列排序触发键（默认：'shift'）*/
  // multiSortKey?: 'shift' | 'ctrl';
  /** 禁止多列排序 */
  // suppressMultiSort?: boolean;
  /** 始终多列排序（无需按键） */
  // alwaysMultiSort?: boolean;
  /** 排序后处理回调 */
  // postSortRows?: (params: PostSortRowsParams) => void;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // ... 现有属性
  
  /** 是否启用排序（默认：true） */
  enableSorting?: boolean;
  /** 自定义排序函数 */
  sortingFn?: SortingFn<TData>;
  /** 排序时的降序优先（默认：false，即升序优先） */
  sortDescFirst?: boolean;
  /** 是否反转排序顺序（默认：false） */
  invertSorting?: boolean;
  
  // === Phase 2 新增 ===
  /** 自定义排序顺序循环 */
  // sortingOrder?: ('asc' | 'desc' | null)[];
}
```

#### 排序状态类型
```typescript
/** 排序状态 */
type SortingState = Array<{
  /** 列 ID */
  id: string;
  /** 是否降序 */
  desc: boolean;
}>;

/** 排序函数类型 */
type SortingFn<TData> = (
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string
) => number;
```

#### 方法
```typescript
class Grid<TData> {
  /** 设置排序状态 */
  setSorting(sorting: SortingState): void;
  
  /** 获取当前排序状态 */
  getSorting(): SortingState;
  
  /** 重置排序状态 */
  resetSorting(): void;
}
```

#### 事件
```typescript
interface GridEvents<TData> {
  /** 排序状态变化事件 */
  onSortingChange?: (sorting: SortingState) => void;
}
```

### 使用示例

#### 基础用法
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { Grid } from '@ac-grid/core';

const columns = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'age', accessorKey: 'age', header: 'Age' },
  { id: 'email', accessorKey: 'email', header: 'Email' }
];

// 排序功能默认启用，用户直接点击列头即可排序
<Grid data={data} columns={columns} />
```

#### 禁用某列排序
```typescript
const columns = [
  { 
    id: 'actions', 
    header: 'Actions',
    enableSorting: false
  }
];
```

#### 自定义排序函数
```typescript
const columns = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    sortingFn: (rowA, rowB, columnId) => {
      // 中文拼音排序
      return rowA.getValue(columnId).localeCompare(
        rowB.getValue(columnId), 
        'zh-CN'
      );
    }
  }
];
```

#### 编程式排序
```typescript
const gridElement = document.querySelector('wsx-ac-grid') as any;

// 设置排序
gridElement.setSorting([
  { id: 'name', desc: false },
  { id: 'age', desc: true }
]);

// 获取排序状态
const sorting = gridElement.getSorting();

// 重置排序
gridElement.resetSorting();
```

## 缺失功能 (Phase 2)

以下功能 AG Grid 支持但 AC Grid 尚未实现，计划在后续版本中添加：

### P1: sortingOrder 自定义排序循环

**AG Grid 用法**:
```typescript
// AG Grid
columnDefs: [
  { 
    field: 'athlete',
    sortingOrder: ['asc', 'desc']  // 只有升序和降序，无 null
  },
  {
    field: 'age',
    sortingOrder: ['desc', 'asc', null]  // 降序优先
  }
]
```

**AC Grid 计划实现**:
```typescript
// AC Grid (计划)
columns: [
  {
    id: 'athlete',
    sortingOrder: ['asc', 'desc']
  }
]
```

**实现方案**:
- 在列定义中添加 `sortingOrder` 属性
- 修改 `toggleSorting` 逻辑，按自定义顺序循环
- 预计工作量: 1 天

### P2: multiSortKey 配置

**AG Grid 用法**:
```typescript
// AG Grid
gridOptions: {
  multiSortKey: 'ctrl'  // 使用 Ctrl 键而非 Shift 键
}
```

**AC Grid 计划实现**:
```typescript
// AC Grid (计划)
<Grid 
  sortingConfig={{
    multiSortKey: 'ctrl'
  }}
/>
```

**实现方案**:
- 在 `GridSortingConfig` 中添加 `multiSortKey` 属性
- 修改事件处理逻辑，检测对应按键
- 预计工作量: 0.5 天

### P2: accentedSort 本地化排序

**AG Grid 用法**:
```typescript
// AG Grid
gridOptions: {
  accentedSort: true
}
```

**AC Grid 计划实现**:
```typescript
// AC Grid (计划)
<Grid 
  sortingConfig={{
    accentedSort: true
  }}
/>
```

**实现方案**:
- 使用 `String.prototype.localeCompare()` with options
- 提供全局配置和列级配置
- 预计工作量: 0.5 天

### P2: postSortRows 后处理回调

**AG Grid 用法**:
```typescript
// AG Grid
gridOptions: {
  postSortRows: (params) => {
    // 将 Ireland 行置顶
    const irelandRows = params.nodes.filter(n => n.data.country === 'Ireland');
    const otherRows = params.nodes.filter(n => n.data.country !== 'Ireland');
    params.nodes.length = 0;
    params.nodes.push(...irelandRows, ...otherRows);
  }
}
```

**AC Grid 计划实现**:
```typescript
// AC Grid (计划)
<Grid 
  sortingConfig={{
    postSortRows: (rows) => {
      // 自定义后处理
      return rows.sort((a, b) => /* custom logic */);
    }
  }}
/>
```

**实现方案**:
- 在 `getSortedRowModel` 后应用回调
- 预计工作量: 1 天

### P3: suppressMultiSort / alwaysMultiSort

**AG Grid 用法**:
```typescript
// AG Grid
gridOptions: {
  suppressMultiSort: true,   // 禁止多列排序
  // 或
  alwaysMultiSort: true      // 始终多列排序
}
```

**AC Grid 计划实现**:
```typescript
// AC Grid (计划)
<Grid 
  sortingConfig={{
    suppressMultiSort: true,
    // 或
    alwaysMultiSort: true
  }}
/>
```

**实现方案**:
- 修改点击事件处理逻辑
- 预计工作量: 0.5 天

### P3: 排序动画

**AG Grid 用法**:
```typescript
// AG Grid
gridOptions: {
  animateRows: true  // 默认 true
}
```

**AC Grid 计划实现**:
- 使用 CSS transitions 或 FLIP 动画
- 预计工作量: 2 天

### Phase 2 总工作量估算

| 功能 | 优先级 | 工作量 |
|------|--------|--------|
| sortingOrder | P1 | 1 天 |
| multiSortKey | P2 | 0.5 天 |
| accentedSort | P2 | 0.5 天 |
| postSortRows | P2 | 1 天 |
| suppressMultiSort / alwaysMultiSort | P3 | 0.5 天 |
| 排序动画 | P3 | 2 天 |
| **总计** | - | **5.5 天** |

## 测试策略

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { createGrid } from '@ac-grid/core';

describe('Sorting Feature', () => {
  it('should sort data in ascending order', () => {
    const data = [
      { id: '1', name: 'Charlie', age: 30 },
      { id: '2', name: 'Alice', age: 25 },
      { id: '3', name: 'Bob', age: 35 }
    ];
    
    const columns = [
      { id: 'name', accessorKey: 'name', header: 'Name' }
    ];
    
    const gridElement = createGrid({ data, columns }) as any;
    gridElement.setSorting([{ id: 'name', desc: false }]);
    
    const sortedData = gridElement.getSortedData();
    expect(sortedData[0].name).toBe('Alice');
    expect(sortedData[1].name).toBe('Bob');
    expect(sortedData[2].name).toBe('Charlie');
  });
  
  it('should support multi-column sorting', () => {
    // 测试多列排序
  });
  
  it('should use custom sorting function', () => {
    // 测试自定义排序函数
  });
  
  it('should toggle sorting state correctly', () => {
    // 测试排序状态切换
  });
});
```

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **小数据集（< 1000 行）**: 排序时间 < 10ms
- **中数据集（1000-10000 行）**: 排序时间 < 50ms
- **大数据集（10000-50000 行）**: 排序时间 < 200ms

### 性能优化策略
1. 使用 @tanstack/table-core 的优化排序算法
2. 避免不必要的重新渲染
3. 结合虚拟滚动（v0.2.0）

## 向后兼容性

### 破坏性变更
**无破坏性变更**。排序功能是纯新增功能。

### 迁移指南
不需要迁移，现有代码可以无缝升级。

## 替代方案

### 为什么选择 @tanstack/table-core
1. **已有依赖**: 无需额外引入
2. **紧密集成**: 与表格状态管理无缝集成
3. **成熟稳定**: 经过大量项目验证
4. **类型安全**: 完整的 TypeScript 支持

## 开放问题

- [ ] **问题 1**: 是否需要支持服务端排序？
  - 建议在 v0.3.0 后根据用户反馈决定

- [ ] **问题 2**: 是否需要排序动画？
  - 可能影响性能，建议作为可选功能

- [ ] **问题 3**: sortingOrder 的默认值如何处理？
  - 建议默认为 `['asc', 'desc', null]`

## 参考资料

- [ag-Grid 排序文档](https://www.ag-grid.com/javascript-data-grid/row-sorting/)
- [@tanstack/table-core 排序文档](https://tanstack.com/table/latest/docs/guide/sorting)
- [MDN: Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [0001-ac-grid-architecture.md](0001-ac-grid-architecture.md)

---

## 变更日志

### 2026-01-31
- 添加 AG Grid 功能对比矩阵
- 添加 Phase 2 缺失功能文档
- 更新实现状态和优先级
- 添加工作量估算

### 2026-01-24
- 初始 RFC 创建
- Phase 1 实现完成

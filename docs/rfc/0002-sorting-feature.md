# RFC-0002: 排序功能

**状态**: 📝 草稿  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md)

## 目录

- [概述](#概述)
- [动机](#动机)
- [设计目标](#设计目标)
- [技术方案](#技术方案)
- [API 设计](#api-设计)
- [实现细节](#实现细节)
- [测试策略](#测试策略)
- [性能考虑](#性能考虑)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)

## 概述

为 AC Grid 添加列排序功能，支持单列排序和多列排序，提供升序/降序/无序三种状态，并支持自定义排序函数。

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

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 单列排序
- ✅ 多列排序
- ✅ 自定义排序函数
- ✅ 编程式排序 API
- ✅ 排序状态持久化

## 设计目标

- [x] **目标 1**: 支持单列排序（升序/降序/无序）
- [x] **目标 2**: 支持多列排序（Shift + 点击）
- [x] **目标 3**: 支持自定义排序函数
- [x] **目标 4**: 提供编程式排序 API
- [x] **目标 5**: 排序状态可视化（列头指示器）
- [x] **目标 6**: 类型安全的 API

### 非目标
- ❌ 服务端排序（将在未来版本中考虑）
- ❌ 排序动画（将在未来版本中考虑）
- ❌ 排序性能分析工具

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `getSortedRowModel` 和排序状态管理能力，结合 wsxjs 的响应式状态管理，实现高性能的客户端排序功能。

### 架构设计

```
用户点击列头
    ↓
DraggableTableHeader 组件捕获点击事件
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

#### 组件 2: 增强的 DraggableTableHeader
**职责**：处理列头点击事件，触发排序

**新增功能**：
- 监听点击事件
- 检测 Shift 键状态
- 调用排序 API
- 显示排序指示器

#### 组件 3: 增强的 Grid
**职责**：管理排序状态，配置排序模型

**新增功能**：
- 维护 `sorting` 状态
- 集成 `getSortedRowModel`
- 提供编程式排序 API

### 数据流

```
初始数据
    ↓
Grid 组件接收 data 和 columns
    ↓
配置 @tanstack/table-core（包含 getSortedRowModel）
    ↓
用户点击列头触发排序
    ↓
更新 sorting 状态 [{ id: 'columnId', desc: false }]
    ↓
getSortedRowModel 自动排序数据
    ↓
重新渲染 Grid（显示排序后的数据）
```

### 依赖关系
- **新增依赖**: 无（@tanstack/table-core 已包含排序功能）
- **内部依赖**: 
  - Grid.wsx
  - DraggableTableHeader.wsx
  - @tanstack/table-core 的 `getSortedRowModel`

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions<TData> {
  /** 数据源 */
  data: TData[];
  /** 列定义 */
  columns: ColumnDef<TData>[];
  /** 排序配置（可选） */
  sorting?: {
    /** 是否启用排序（默认：true） */
    enabled?: boolean;
    /** 是否允许多列排序（默认：true） */
    multiColumn?: boolean;
    /** 初始排序状态 */
    initialState?: SortingState;
    /** 排序状态变化回调 */
    onSortingChange?: (sorting: SortingState) => void;
  };
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
  /**
   * 设置排序状态
   * @param sorting - 排序状态数组
   */
  setSorting(sorting: SortingState): void;
  
  /**
   * 获取当前排序状态
   * @returns 当前排序状态
   */
  getSorting(): SortingState;
  
  /**
   * 重置排序状态
   */
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

### 类型定义
```typescript
// 从 @tanstack/table-core 导出
export type { SortingState, SortingFn } from '@tanstack/table-core';
```

### 使用示例

#### 基础用法（默认排序）
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { Grid } from '@systembug/ac-grid-core';

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
    enableSorting: false  // 禁用此列排序
  }
];
```

#### 自定义排序函数
```typescript
import { sortingFns } from '@tanstack/table-core';

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
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Date',
    sortingFn: 'datetime'  // 使用内置排序函数
  }
];
```

#### 编程式排序
```typescript
import { createGrid } from '@systembug/ac-grid-core';

const gridElement = createGrid({
  data,
  columns,
  sorting: {
    initialState: [
      { id: 'name', desc: false },  // 先按 name 升序
      { id: 'age', desc: true }     // 再按 age 降序
    ],
    onSortingChange: (sorting) => {
      console.log('Sorting changed:', sorting);
      // 可以持久化到 localStorage
      localStorage.setItem('gridSorting', JSON.stringify(sorting));
    }
  }
});

// 获取和设置排序状态
const currentSorting = (gridElement as any).getSorting();
(gridElement as any).setSorting([{ id: 'age', desc: false }]);
```

#### 在 wsxjs 组件中使用
```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, state, autoRegister } from '@wsxjs/wsx-core';
import type { SortingState } from '@systembug/ac-grid-core';

@autoRegister({ tagName: 'my-app' })
export class App extends LightComponent {
  @state private sorting: SortingState = [
    { id: 'name', desc: false }
  ];

  private handleSortingChange = (newSorting: SortingState) => {
    this.sorting = newSorting;
    console.log('Sorting updated:', newSorting);
  };

  render() {
    return (
      <wsx-ac-grid 
        data={this.data} 
        columns={this.columns}
        sorting={{
          initialState: this.sorting,
          onSortingChange: this.handleSortingChange
        }}
      />
    );
  }
}
```

## 实现细节

### 阶段 1: 核心排序功能（2-3 天）

**任务清单**：
- [ ] 在 Grid 组件中集成 `getSortedRowModel`
- [ ] 添加 `sorting` 状态管理（使用 @state 装饰器）
- [ ] 实现 `onSortingChange` 回调
- [ ] 添加排序相关的 property getters/setters

**关键代码示例**：
```typescript
// Grid.wsx
import { getSortedRowModel, type SortingState } from '@tanstack/table-core';

@autoRegister({ tagName: "wsx-ac-grid" })
export class Grid extends LightComponent {
  @state private sorting: SortingState = [];
  
  // Property for sorting configuration
  get sortingConfig(): GridSortingConfig | undefined {
    return this._sortingConfig;
  }
  set sortingConfig(value: GridSortingConfig | undefined) {
    if (value !== this._sortingConfig) {
      this._sortingConfig = value;
      if (value?.initialState) {
        this.sorting = value.initialState;
      }
      this.updateTable();
    }
  }
  @state private _sortingConfig: GridSortingConfig | undefined;
  
  private updateTable() {
    this.table = createTable({
      data: this.gridData,
      columns: this._columns,
      state: {
        sorting: this.sorting,
        // ... 其他状态
      },
      onSortingChange: (updater) => {
        const newSorting = 
          typeof updater === 'function' 
            ? updater(this.sorting) 
            : updater;
        this.sorting = newSorting;
        this._sortingConfig?.onSortingChange?.(newSorting);
        this.updateTable();
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),  // 新增
      // ...
    });
  }
  
  // 公共 API
  public setSorting(sorting: SortingState): void {
    this.sorting = sorting;
    this.updateTable();
  }
  
  public getSorting(): SortingState {
    return this.sorting;
  }
  
  public resetSorting(): void {
    this.sorting = [];
    this.updateTable();
  }
}
```

### 阶段 2: 排序指示器组件（1-2 天）

**任务清单**：
- [ ] 创建 `SortingIndicator.wsx` 组件
- [ ] 设计排序指示器样式（↑ ↓ 图标）
- [ ] 支持多列排序时显示排序索引

**关键代码示例**：
```typescript
// components/SortingIndicator.wsx
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, autoRegister } from '@wsxjs/wsx-core';

interface SortingIndicatorProps {
  direction: 'asc' | 'desc' | false;
  index?: number;
}

@autoRegister({ tagName: 'wsx-ac-sorting-indicator' })
export class SortingIndicator extends LightComponent {
  get direction(): 'asc' | 'desc' | false {
    return this._direction;
  }
  set direction(value: 'asc' | 'desc' | false) {
    this._direction = value;
  }
  private _direction: 'asc' | 'desc' | false = false;
  
  get index(): number | undefined {
    return this._index;
  }
  set index(value: number | undefined) {
    this._index = value;
  }
  private _index: number | undefined;
  
  render() {
    if (!this.direction) {
      return <span className="sort-indicator"></span>;
    }
    
    const icon = this.direction === 'asc' ? '↑' : '↓';
    const indexText = this.index !== undefined ? ` ${this.index + 1}` : '';
    
    return (
      <span className="sort-indicator active">
        {icon}{indexText}
      </span>
    );
  }
}
```

### 阶段 3: 增强列头组件（1-2 天）

**任务清单**：
- [ ] 在 `DraggableTableHeader` 中添加排序点击处理
- [ ] 集成 `SortingIndicator` 组件
- [ ] 处理单列和多列排序逻辑
- [ ] 添加排序相关的 CSS 类名

**关键代码示例**：
```typescript
// DraggableTableHeader.wsx（增强）
@autoRegister({ tagName: "wsx-ac-draggable-table-header" })
export class DraggableTableHeader extends LightComponent {
  // ... 现有代码
  
  private handleHeaderClick = (e: MouseEvent) => {
    const column = this._header.column;
    
    // 检查是否启用排序
    if (!column.getCanSort()) {
      return;
    }
    
    // 切换排序（Shift 键支持多列排序）
    column.toggleSorting(
      undefined,  // 循环：asc -> desc -> none
      e.shiftKey  // 是否多列排序
    );
  };
  
  render() {
    const column = this._header.column;
    const sortDirection = column.getIsSorted();  // 'asc' | 'desc' | false
    const sortIndex = column.getSortIndex();     // 多列排序时的索引
    
    return (
      <th
        onClick={this.handleHeaderClick}
        className={`
          ${column.getCanSort() ? 'cursor-pointer select-none' : ''}
          ${sortDirection ? 'sorting-active' : ''}
        `}
      >
        <div className="header-content">
          {flexRender(
            this._header.column.columnDef.header,
            this._header.getContext()
          )}
          {column.getCanSort() && (
            <wsx-ac-sorting-indicator 
              direction={sortDirection}
              index={sortIndex}
            />
          )}
        </div>
      </th>
    );
  }
}
```

### 阶段 4: 样式和 CSS（1 天）

**任务清单**：
- [ ] 添加排序指示器样式
- [ ] 添加可排序列头的悬停效果
- [ ] 添加排序激活状态样式
- [ ] 确保样式在 Shadow DOM 中正确工作

**关键代码示例**：
```css
/* Grid.css */
.draggable-header.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.draggable-header.sorting-active {
  background-color: rgba(0, 120, 212, 0.1);
}

.sort-indicator {
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
  color: #999;
  min-width: 16px;
}

.sort-indicator.active {
  color: #0078d4;
  font-weight: bold;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 阶段 5: 测试和文档（2 天）

**任务清单**：
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 创建 Storybook 示例
- [ ] 编写使用文档
- [ ] 性能测试

### 技术难点

1. **难点 1: 自定义排序函数的类型安全**
   - **问题**：TypeScript 泛型类型推导复杂
   - **解决方案**：使用 @tanstack/table-core 的类型定义，确保类型安全

2. **难点 2: 排序状态与拖拽重排序的冲突**
   - **问题**：列拖拽重排序后，排序状态的列 ID 需要更新
   - **解决方案**：在列顺序变化时，保持排序状态的 ID 引用不变，因为是基于列 ID 而非位置

3. **难点 3: Web Components 中的事件处理**
   - **问题**：在 Shadow DOM 中处理事件冒泡
   - **解决方案**：使用 wsxjs 的事件绑定机制，确保事件正确传递

## 测试策略

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';
import { createGrid } from '@systembug/ac-grid-core';

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
    
    // 设置排序
    gridElement.setSorting([{ id: 'name', desc: false }]);
    
    // 验证排序后的数据
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

### 集成测试
- 测试排序与其他功能（如拖拽）的集成
- 测试排序状态持久化
- 测试在不同浏览器中的表现

### E2E 测试
使用浏览器测试工具（如 Playwright）测试：
- 用户点击列头排序
- 多列排序（Shift + 点击）
- 排序指示器显示正确

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
- **内存占用增加**: < 5MB（相比无排序）

### 性能优化策略
1. **使用 @tanstack/table-core 的优化排序算法**
   - 内部使用高效的排序算法
   - 支持缓存和增量更新

2. **避免不必要的重新渲染**
   - 利用 wsxjs 的 @state 装饰器精确控制渲染
   - 只有排序状态变化时才重新渲染

3. **大数据集优化**
   - 结合虚拟滚动（后续版本）
   - 考虑 Web Worker 排序（可选）

### 性能测试方案
```typescript
import { performance } from 'perf_hooks';

describe('Sorting Performance', () => {
  it('should sort 10000 rows in less than 50ms', () => {
    const data = generateLargeDataset(10000);
    const gridElement = createGrid({ data, columns }) as any;
    
    const start = performance.now();
    gridElement.setSorting([{ id: 'name', desc: false }]);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(50);
  });
});
```

## 向后兼容性

### 破坏性变更
**无破坏性变更**。排序功能是纯新增功能，不影响现有 API。

### 迁移指南
不需要迁移，现有代码可以无缝升级。

### 默认行为
- 排序功能默认**启用**
- 如需禁用某列排序，设置 `enableSorting: false`
- 如需禁用全局排序，可在未来版本中添加全局配置

## 替代方案

### 方案 A: 自研排序算法
**描述**: 不使用 @tanstack/table-core 的排序，自己实现排序逻辑

**优点**:
- 完全控制排序逻辑
- 可以高度定制

**缺点**:
- 重复造轮子
- 需要处理大量边界情况
- 测试成本高
- 性能可能不如成熟库

### 方案 B: 使用第三方排序库（如 lodash）
**描述**: 使用 lodash 的 `orderBy` 等函数实现排序

**优点**:
- API 简单
- 成熟稳定

**缺点**:
- 增加额外依赖
- 需要自己管理排序状态
- 与 @tanstack/table-core 集成度低

### 为什么选择当前方案
1. **已有依赖**: @tanstack/table-core 已是项目依赖，无需额外引入
2. **紧密集成**: 与表格状态管理无缝集成
3. **成熟稳定**: 经过大量项目验证
4. **类型安全**: 完整的 TypeScript 支持
5. **功能完整**: 支持多列排序、自定义排序函数等高级功能

## 开放问题

- [ ] **问题 1**: 是否需要支持服务端排序？
  - 当前方案是客户端排序，对于超大数据集可能需要服务端排序
  - 建议在 v0.3.0 后根据用户反馈决定

- [ ] **问题 2**: 是否需要排序动画？
  - 排序时行的位置变化是否需要过渡动画
  - 可能影响性能，建议作为可选功能

- [ ] **问题 3**: 排序状态持久化的最佳实践？
  - 是否应该内置 localStorage 支持
  - 还是让用户通过 `onSortingChange` 自己处理

## 参考资料

- [ag-Grid 排序文档](https://www.ag-grid.com/javascript-data-grid/row-sorting/)
- [@tanstack/table-core 排序文档](https://tanstack.com/table/latest/docs/guide/sorting)
- [MDN: Array.prototype.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [0001-ac-grid-architecture.md](./0001-ac-grid-architecture.md)

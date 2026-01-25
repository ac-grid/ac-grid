# RFC-0003: 过滤功能

**状态**: 📝 草稿  
**版本**: 0.1.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0002-sorting-feature](./0002-sorting-feature.md)

## 目录

- [概述](#概述)
- [动机](#动机)
- [设计目标](#设计目标)
- [技术方案](#技术方案)
- [API 设计](#api-设计)
- [自定义过滤指南](#自定义过滤指南)
- [实现细节](#实现细节)
- [测试策略](#测试策略)
- [性能考虑](#性能考虑)
- [向后兼容性](#向后兼容性)
- [替代方案](#替代方案)
- [开放问题](#开放问题)
- [参考资料](#参考资料)

## 概述

为 AC Grid 添加数据过滤功能，支持列过滤、全局搜索和快速过滤，提供多种过滤模式（文本、数字、日期等），并支持自定义过滤函数。

## 动机

### 问题陈述
当前 AC Grid 只能显示所有数据，用户无法过滤数据以快速找到所需信息。过滤是数据表格的核心功能，ag-Grid 社区版提供了完整的过滤支持。

### 用户场景

**场景 1：列过滤**
```typescript
// 用户在列头点击过滤图标
// 显示过滤菜单，输入过滤条件
// 表格自动过滤显示匹配的行
```

**场景 2：全局搜索**
```typescript
// 用户在搜索框输入关键词
// 所有列中匹配的行被显示
```

**场景 3：多列组合过滤**
```typescript
// 用户对多个列设置过滤条件
// 只显示同时满足所有条件的行
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 列过滤（文本、数字、日期）
- ✅ 全局快速过滤
- ✅ 自定义过滤函数
- ✅ 过滤状态持久化

## 设计目标

- [ ] **目标 1**: 支持列过滤（文本、数字、日期）
- [ ] **目标 2**: 支持全局搜索
- [ ] **目标 3**: 支持自定义过滤函数
- [ ] **目标 4**: 提供编程式过滤 API
- [ ] **目标 5**: 过滤状态可视化（过滤图标）
- [ ] **目标 6**: 类型安全的 API

### 非目标
- ❌ 服务端过滤（将在未来版本中考虑）
- ❌ 高级过滤（范围、多选等，将在未来版本中考虑）
- ❌ 过滤历史记录

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `getFilteredRowModel` 和过滤状态管理能力，结合 wsxjs 的响应式状态管理，实现高性能的客户端过滤功能。

### 架构设计

```
用户输入过滤条件
    ↓
过滤组件更新过滤状态
    ↓
@tanstack/table-core 处理过滤逻辑
    ↓
getFilteredRowModel() 返回过滤后的行
    ↓
Grid 组件重新渲染
```

### 核心组件

#### 组件 1: FilterInput
**职责**：列过滤输入组件

**接口**：
```typescript
interface FilterInputProps {
  column: Column<any, unknown>;
  value: string;
  onChange: (value: string) => void;
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
用户输入 → 更新过滤状态 → table.getFilteredRowModel() → 重新渲染
```

### 依赖关系
- **新增依赖**: 无（使用 @tanstack/table-core 内置功能）
- **内部依赖**: Grid 组件、DraggableTableHeader 组件

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

**对比 ag-Grid**:
- ag-Grid 的模块系统适合企业版（功能多、体积大）
- AC Grid 当前是轻量级设计，不需要模块化

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用过滤
  enableFiltering?: boolean;
  // 全局搜索
  globalFilter?: string;
  // 列过滤配置
  columnFilters?: Record<string, string>;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // 启用过滤
  enableColumnFilter?: boolean;
  // 自定义过滤函数
  filterFn?: (row: Row<TData>, columnId: string, filterValue: any) => boolean;
  // 过滤类型
  filterType?: 'text' | 'number' | 'date' | 'custom';
}
```

#### 方法
```typescript
class Grid {
  /**
   * 设置全局过滤条件
   * @param value - 过滤值
   */
  setGlobalFilter(value: string): void;

  /**
   * 设置列过滤条件
   * @param columnId - 列 ID
   * @param value - 过滤值
   */
  setColumnFilter(columnId: string, value: string): void;

  /**
   * 清除所有过滤条件
   */
  clearFilters(): void;

  /**
   * 获取当前过滤状态
   */
  getFilterState(): FilterState;
}
```

#### 事件
```typescript
interface GridEvents {
  onFilterChange?: (filterState: FilterState) => void;
}
```

### 类型定义
```typescript
export interface FilterState {
  globalFilter?: string;
  columnFilters: Record<string, string>;
}

export type FilterFn<TData> = (
  row: Row<TData>,
  columnId: string,
  filterValue: any
) => boolean;
```

### 使用示例

#### 基础用法
```typescript
import { Grid } from '@ac-grid/core';

const grid = createGrid({
  data,
  columns,
  enableFiltering: true,
});
```

#### 自定义过滤函数
```typescript
const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterFn: (row, columnId, filterValue) => {
      return row.getValue(columnId).toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

## 自定义过滤指南

开发者可以通过多种方式自定义过滤功能，以满足不同的业务需求。

### 1. 自定义过滤函数 (filterFn)

最灵活的方式是提供自定义过滤函数，完全控制过滤逻辑。

#### 基础自定义过滤

```typescript
import type { ColumnDef, Row } from '@ac-grid/core';

interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
  department: string;
}

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    // 自定义过滤函数：不区分大小写的包含匹配
    filterFn: (row: Row<Person>, columnId: string, filterValue: string) => {
      const value = row.getValue(columnId) as string;
      return value.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

#### 高级自定义过滤示例

**示例 1: 中文拼音搜索**
```typescript
// 需要安装 pinyin 库: npm install pinyin
import pinyin from 'pinyin';

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterFn: (row, columnId, filterValue) => {
      const name = row.getValue(columnId) as string;
      // 转换为拼音进行搜索
      const namePinyin = pinyin(name, { style: pinyin.STYLE_NORMAL }).join('');
      const filterPinyin = pinyin(filterValue, { style: pinyin.STYLE_NORMAL }).join('');
      return namePinyin.includes(filterPinyin) || name.includes(filterValue);
    }
  }
];
```

**示例 2: 数字范围过滤**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterType: 'number',
    filterFn: (row, columnId, filterValue) => {
      const age = row.getValue(columnId) as number;
      // 支持范围过滤，如 "18-30" 或 ">50" 或 "<25"
      if (filterValue.includes('-')) {
        const [min, max] = filterValue.split('-').map(Number);
        return age >= min && age <= max;
      } else if (filterValue.startsWith('>')) {
        return age > Number(filterValue.slice(1));
      } else if (filterValue.startsWith('<')) {
        return age < Number(filterValue.slice(1));
      } else {
        return age === Number(filterValue);
      }
    }
  }
];
```

**示例 3: 日期范围过滤**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    filterType: 'date',
    filterFn: (row, columnId, filterValue) => {
      const date = new Date(row.getValue(columnId) as string);
      // 支持日期范围，如 "2024-01-01,2024-12-31"
      if (filterValue.includes(',')) {
        const [start, end] = filterValue.split(',').map(d => new Date(d));
        return date >= start && date <= end;
      } else {
        const filterDate = new Date(filterValue);
        return date.toDateString() === filterDate.toDateString();
      }
    }
  }
];
```

**示例 4: 多值过滤（逗号分隔）**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'department',
    header: 'Department',
    accessorKey: 'department',
    filterFn: (row, columnId, filterValue) => {
      const dept = row.getValue(columnId) as string;
      // 支持多个值，用逗号分隔，如 "Engineering,Marketing"
      const filterValues = filterValue.split(',').map(v => v.trim());
      return filterValues.some(value => dept.toLowerCase().includes(value.toLowerCase()));
    }
  }
];
```

**示例 5: 正则表达式过滤**
```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    filterFn: (row, columnId, filterValue) => {
      const email = row.getValue(columnId) as string;
      try {
        // 如果输入是正则表达式，使用正则匹配
        const regex = new RegExp(filterValue, 'i');
        return regex.test(email);
      } catch {
        // 如果不是有效的正则表达式，使用普通字符串匹配
        return email.toLowerCase().includes(filterValue.toLowerCase());
      }
    }
  }
];
```

**示例 6: 模糊匹配（Levenshtein 距离）**
```typescript
// 需要安装 fast-levenshtein: npm install fast-levenshtein
import levenshtein from 'fast-levenshtein';

const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterFn: (row, columnId, filterValue) => {
      const name = row.getValue(columnId) as string;
      // 允许最多 2 个字符的差异（拼写错误容错）
      const distance = levenshtein.get(name.toLowerCase(), filterValue.toLowerCase());
      return distance <= 2 || name.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

### 2. 使用内置过滤类型

AC Grid 提供内置的过滤类型，简化常见场景的配置。

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterType: 'text',  // 使用内置文本过滤
  },
  {
    id: 'age',
    header: 'Age',
    accessorKey: 'age',
    filterType: 'number',  // 使用内置数字过滤
  },
  {
    id: 'createdAt',
    header: 'Created At',
    accessorKey: 'createdAt',
    filterType: 'date',  // 使用内置日期过滤
  }
];
```

### 3. 禁用特定列的过滤

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'actions',
    header: 'Actions',
    enableColumnFilter: false,  // 禁用此列的过滤
    cell: ({ row }) => {
      return `<button>Edit</button>`;
    }
  }
];
```

### 4. 组合使用自定义过滤和内置类型

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    filterType: 'text',  // 指定类型，但可以覆盖默认行为
    filterFn: (row, columnId, filterValue) => {
      // 自定义逻辑：支持首字母搜索
      const name = row.getValue(columnId) as string;
      const initials = name.split(' ').map(n => n[0]).join('');
      return name.toLowerCase().includes(filterValue.toLowerCase()) ||
             initials.toLowerCase().includes(filterValue.toLowerCase());
    }
  }
];
```

### 5. 编程式过滤控制

```typescript
// 获取 Grid 实例
const gridElement = document.querySelector('wsx-ac-grid') as any;

// 设置全局过滤
gridElement.setGlobalFilter('search term');

// 设置列过滤
gridElement.setColumnFilter('name', 'John');

// 获取当前过滤状态
const filterState = gridElement.getFilterState();
console.log(filterState);
// {
//   globalFilter: 'search term',
//   columnFilters: { name: 'John' }
// }

// 清除所有过滤
gridElement.clearFilters();
```

### 6. 过滤状态持久化

```typescript
import { createGrid } from '@ac-grid/core';

const gridElement = createGrid({
  data,
  columns,
  enableFiltering: true,
  filtering: {
    onFilterChange: (filterState) => {
      // 保存到 localStorage
      localStorage.setItem('gridFilters', JSON.stringify(filterState));
    }
  }
});

// 页面加载时恢复过滤状态
const savedFilters = localStorage.getItem('gridFilters');
if (savedFilters) {
  const filterState = JSON.parse(savedFilters);
  if (filterState.globalFilter) {
    gridElement.setGlobalFilter(filterState.globalFilter);
  }
  Object.entries(filterState.columnFilters).forEach(([columnId, value]) => {
    gridElement.setColumnFilter(columnId, value as string);
  });
}
```

### 7. 在 wsxjs 组件中使用

```typescript
/** @jsxImportSource @wsxjs/wsx-core */
import { LightComponent, state, autoRegister } from '@wsxjs/wsx-core';
import type { FilterState } from '@ac-grid/core';

@autoRegister({ tagName: 'my-app' })
export class App extends LightComponent {
  @state private data = makeData(100);
  @state private filterState: FilterState = {
    columnFilters: {}
  };

  private handleFilterChange = (newFilterState: FilterState) => {
    this.filterState = newFilterState;
    console.log('Filter updated:', newFilterState);
  };

  render() {
    return (
      <wsx-ac-grid 
        data={this.data} 
        columns={this.columns}
        enableFiltering={true}
        filtering={{
          onFilterChange: this.handleFilterChange
        }}
      />
    );
  }
}
```

### 最佳实践

1. **性能优化**: 对于大数据集，在自定义过滤函数中使用早期返回（early return）
   ```typescript
   filterFn: (row, columnId, filterValue) => {
     if (!filterValue) return true;  // 空值不过滤
     const value = row.getValue(columnId);
     // ... 过滤逻辑
   }
   ```

2. **类型安全**: 始终使用 TypeScript 类型定义，确保类型安全
   ```typescript
   filterFn: (row: Row<Person>, columnId: string, filterValue: string) => {
     // TypeScript 会检查类型
   }
   ```

3. **错误处理**: 在自定义过滤函数中添加错误处理
   ```typescript
   filterFn: (row, columnId, filterValue) => {
     try {
       const value = row.getValue(columnId);
       // ... 过滤逻辑
     } catch (error) {
       console.error('Filter error:', error);
       return true;  // 出错时显示所有行
     }
   }
   ```

4. **可复用性**: 将常用的过滤函数提取为工具函数
   ```typescript
   // utils/filters.ts
   export const caseInsensitiveFilter = <TData>(
     row: Row<TData>,
     columnId: string,
     filterValue: string
   ): boolean => {
     const value = String(row.getValue(columnId)).toLowerCase();
     return value.includes(filterValue.toLowerCase());
   };

   // 使用
   const columns: ColumnDef<Person>[] = [
     {
       id: 'name',
       filterFn: caseInsensitiveFilter
     }
   ];
   ```

## 实现细节

### 阶段 1: 基础过滤架构
**预计时间**: 2 天

**任务清单**：
- [ ] 集成 `getFilteredRowModel` 到 Grid 组件
- [ ] 实现过滤状态管理
- [ ] 添加过滤类型定义

### 阶段 2: 列过滤 UI
**预计时间**: 3 天

**任务清单**：
- [ ] 创建 FilterInput 组件
- [ ] 在表头添加过滤图标
- [ ] 实现过滤菜单/弹出框
- [ ] 实现文本过滤逻辑

### 阶段 3: 全局搜索
**预计时间**: 2 天

**任务清单**：
- [ ] 创建 GlobalSearch 组件
- [ ] 实现全局搜索逻辑
- [ ] 集成到 Grid 组件

### 阶段 4: 高级过滤类型
**预计时间**: 2 天

**任务清单**：
- [ ] 实现数字过滤
- [ ] 实现日期过滤
- [ ] 支持自定义过滤函数

### 技术难点
1. **过滤性能**: 大数据集过滤可能影响性能，需要优化
2. **过滤状态同步**: 确保过滤状态与 UI 同步
3. **多列组合过滤**: 正确处理多个过滤条件的组合

## 测试策略

### 单元测试
- 测试文本过滤
- 测试数字过滤
- 测试日期过滤
- 测试全局搜索
- 测试多列组合过滤
- 测试自定义过滤函数

### 集成测试
- 测试过滤与排序的交互
- 测试过滤状态持久化

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

## 向后兼容性

### 破坏性变更
无。过滤功能是新增功能，不影响现有 API。

### 迁移指南
无需迁移，新功能向后兼容。

## 替代方案

### 方案 A: 服务端过滤
**描述**: 在服务端进行过滤

**优点**:
- 支持大数据集
- 减少客户端计算

**缺点**:
- 需要服务端支持
- 增加网络请求

### 方案 B: 客户端过滤（当前方案）
**描述**: 在客户端进行过滤

**优点**:
- 无需服务端支持
- 响应速度快
- 离线可用

**缺点**:
- 大数据集可能影响性能

### 为什么选择当前方案
客户端过滤更符合当前架构，且 @tanstack/table-core 提供了优秀的过滤支持。

## 开放问题

- [ ] **问题 1**: 是否需要过滤历史记录功能？
- [ ] **问题 2**: 是否需要保存过滤状态到 URL？

## 参考资料

- [ag-Grid 过滤文档](https://www.ag-grid.com/javascript-data-grid/filtering/)
- [@tanstack/table-core 过滤文档](https://tanstack.com/table/latest/docs/guide/filters)

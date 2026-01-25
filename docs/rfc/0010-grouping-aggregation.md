# RFC-0010: 分组和聚合

**状态**: 📝 草稿  
**版本**: 0.3.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0002-sorting-feature](./0002-sorting-feature.md)

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

为 AC Grid 添加行分组和数据聚合功能，支持按列分组显示数据，并提供聚合函数（求和、平均值、计数等）。

## 动机

### 问题陈述
用户需要按某个字段分组查看数据，并查看每组的统计信息（如总和、平均值）。分组和聚合是数据分析的重要功能。

### 用户场景

**场景 1：按部门分组**
```typescript
// 按部门分组显示员工
// 显示每个部门的员工数量和平均薪资
```

**场景 2：多级分组**
```typescript
// 先按部门分组，再按职位分组
// 显示多级统计信息
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 行分组
- ✅ 多级分组
- ✅ 数据聚合
- ✅ 分组展开/折叠

## 设计目标

- [ ] **目标 1**: 支持单列分组
- [ ] **目标 2**: 支持多列分组
- [ ] **目标 3**: 支持分组展开/折叠
- [ ] **目标 4**: 支持聚合函数（sum, avg, count 等）
- [ ] **目标 5**: 分组行样式

### 非目标
- ❌ 服务端分组
- ❌ 分组动画

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `getGroupedRowModel` 和 `getExpandedRowModel` 实现分组功能。

### 架构设计

```
设置分组列
    ↓
getGroupedRowModel() 分组数据
    ↓
getExpandedRowModel() 处理展开/折叠
    ↓
渲染分组行和数据行
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用分组
  enableGrouping?: boolean;
  // 分组列
  grouping?: string[];
  // 默认展开
  defaultExpanded?: boolean;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // 启用分组
  enableGrouping?: boolean;
  // 聚合函数
  aggregationFn?: 'sum' | 'avg' | 'count' | 'min' | 'max' | ((values: any[]) => any);
}
```

#### 方法
```typescript
class Grid {
  /**
   * 设置分组列
   * @param columnIds - 列 ID 数组
   */
  setGrouping(columnIds: string[]): void;

  /**
   * 展开/折叠分组
   * @param rowId - 分组行 ID
   * @param expanded - 是否展开
   */
  toggleGroup(rowId: string, expanded?: boolean): void;

  /**
   * 展开所有分组
   */
  expandAll(): void;

  /**
   * 折叠所有分组
   */
  collapseAll(): void;
}
```

## 实现细节

### 阶段 1: 基础分组
**预计时间**: 4 天

**任务清单**：
- [ ] 集成 `getGroupedRowModel`
- [ ] 实现分组行渲染
- [ ] 实现分组逻辑

### 阶段 2: 展开/折叠
**预计时间**: 2 天

**任务清单**：
- [ ] 集成 `getExpandedRowModel`
- [ ] 实现展开/折叠 UI
- [ ] 实现展开/折叠逻辑

### 阶段 3: 聚合
**预计时间**: 2 天

**任务清单**：
- [ ] 实现聚合函数
- [ ] 实现聚合值显示
- [ ] 支持自定义聚合

## 测试策略

### 单元测试
- 测试单列分组
- 测试多列分组
- 测试展开/折叠
- 测试聚合函数

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **分组计算**: < 100ms (10K 行)
- **展开/折叠**: < 16ms

## 向后兼容性

### 破坏性变更
无。分组是可选的。

## 参考资料

- [ag-Grid 分组文档](https://www.ag-grid.com/javascript-data-grid/grouping/)
- [@tanstack/table-core 分组文档](https://tanstack.com/table/latest/docs/guide/grouping)

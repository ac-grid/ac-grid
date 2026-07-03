# RFC-0006: 分页功能

**状态**: 📝 草稿  
**版本**: 0.2.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0005-virtual-scrolling](./completed/0005-virtual-scrolling.md)

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

为 AC Grid 添加分页功能，支持前端分页和服务端分页，提供分页控件和编程式分页 API。

## 动机

### 问题陈述
对于大数据集，一次性渲染所有数据会导致性能问题。分页可以将数据分成多个页面，每次只加载和渲染当前页的数据。

### 用户场景

**场景 1：前端分页**
```typescript
// 客户端数据分页
// 用户点击页码切换页面
// 只渲染当前页的数据
```

**场景 2：服务端分页**
```typescript
// 服务端数据分页
// 用户切换页面时请求新数据
// 支持排序和过滤
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 前端分页
- ✅ 服务端分页
- ✅ 分页控件
- ✅ 可配置每页大小

## 设计目标

- [ ] **目标 1**: 支持前端分页
- [ ] **目标 2**: 支持服务端分页
- [ ] **目标 3**: 提供分页控件 UI
- [ ] **目标 4**: 支持自定义每页大小
- [ ] **目标 5**: 与排序和过滤集成

### 非目标
- ❌ 无限滚动（使用虚拟滚动）
- ❌ 分页动画

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `getPaginationRowModel` 实现前端分页，通过回调函数支持服务端分页。

### 架构设计

```
分页状态变化
    ↓
前端分页: getPaginationRowModel() → 过滤行数据
服务端分页: 触发回调 → 请求新数据 → 更新数据
    ↓
重新渲染当前页
```

### 核心组件

#### 组件 1: PaginationControls
**职责**：分页控件 UI

**接口**：
```typescript
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用分页
  enablePagination?: boolean;
  // 分页模式
  paginationMode?: 'client' | 'server';
  // 每页大小
  pageSize?: number;
  // 每页大小选项
  pageSizeOptions?: number[];
  // 服务端分页回调
  onServerPagination?: (page: number, pageSize: number) => Promise<PaginatedData>;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 跳转到指定页
   * @param page - 页码（从 0 开始）
   */
  goToPage(page: number): void;

  /**
   * 设置每页大小
   * @param size - 每页大小
   */
  setPageSize(size: number): void;

  /**
   * 获取当前页信息
   */
  getPaginationState(): PaginationState;
}
```

### 类型定义
```typescript
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

## 实现细节

### 阶段 1: 前端分页
**预计时间**: 3 天

**任务清单**：
- [ ] 集成 `getPaginationRowModel`
- [ ] 实现分页状态管理
- [ ] 实现分页逻辑

### 阶段 2: 分页控件 UI
**预计时间**: 2 天

**任务清单**：
- [ ] 创建 PaginationControls 组件
- [ ] 实现页码显示
- [ ] 实现每页大小选择

### 阶段 3: 服务端分页
**预计时间**: 2 天

**任务清单**：
- [ ] 实现服务端分页回调
- [ ] 实现加载状态
- [ ] 集成排序和过滤

## 测试策略

### 单元测试
- 测试前端分页逻辑
- 测试服务端分页回调
- 测试分页状态管理
- 测试与排序/过滤的集成

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **分页切换**: < 50ms
- **服务端请求**: 异步处理

## 向后兼容性

### 破坏性变更
无。分页是可选的，默认禁用。

## 替代方案

### 方案 A: 仅前端分页
**描述**: 只支持客户端分页

**优点**:
- 实现简单

**缺点**:
- 不支持大数据集

### 方案 B: 前端 + 服务端分页（当前方案）
**描述**: 支持两种模式

**优点**:
- 灵活性高
- 支持各种场景

**缺点**:
- 实现复杂度较高

## 开放问题

- [ ] **问题 1**: 分页控件样式和位置？
- [ ] **问题 2**: 是否需要分页信息显示（如 "显示 1-10 条，共 100 条"）？

## 参考资料

- [ag-Grid 分页文档](https://www.ag-grid.com/javascript-data-grid/pagination/)
- [@tanstack/table-core 分页文档](https://tanstack.com/table/latest/docs/guide/pagination)

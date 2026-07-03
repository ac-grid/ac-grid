# RFC-0007: 行选择

**状态**: 📝 草稿  
**版本**: 0.2.0  
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

为 AC Grid 添加行选择功能，支持单选、多选和范围选择模式，提供选择状态可视化和编程式选择 API。

## 动机

### 问题陈述
用户需要选择表格中的行以进行批量操作（删除、编辑、导出等）。行选择是数据表格的常用功能。

### 用户场景

**场景 1：单选**
```typescript
// 用户点击行
// 该行被选中，其他行取消选中
```

**场景 2：多选**
```typescript
// 用户点击复选框
// 可以选中多行
// 支持全选/取消全选
```

**场景 3：范围选择**
```typescript
// 用户按住 Shift 点击
// 选中从上次选中行到当前行的所有行
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 单选模式
- ✅ 多选模式
- ✅ 范围选择
- ✅ 选择状态持久化

## 设计目标

- [ ] **目标 1**: 支持单选模式
- [ ] **目标 2**: 支持多选模式
- [ ] **目标 3**: 支持范围选择（Shift + 点击）
- [ ] **目标 4**: 提供选择列（复选框）
- [ ] **目标 5**: 提供编程式选择 API
- [ ] **目标 6**: 选择状态可视化

### 非目标
- ❌ 选择动画
- ❌ 选择历史记录

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `rowSelection` 状态管理，结合复选框组件，实现行选择功能。

### 架构设计

```
用户点击行/复选框
    ↓
更新 rowSelection 状态
    ↓
触发选择事件
    ↓
更新 UI（选中样式）
```

### 核心组件

#### 组件 1: SelectionCheckbox
**职责**：行选择复选框

**接口**：
```typescript
interface SelectionCheckboxProps {
  row: Row<any>;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用行选择
  enableRowSelection?: boolean;
  // 选择模式
  selectionMode?: 'single' | 'multiple';
  // 选择列配置
  selectionColumn?: {
    enabled: boolean;
    width?: number;
    header?: string | ReactNode;
  };
}
```

#### 方法
```typescript
class Grid {
  /**
   * 选择行
   * @param rowId - 行 ID
   */
  selectRow(rowId: string): void;

  /**
   * 取消选择行
   * @param rowId - 行 ID
   */
  deselectRow(rowId: string): void;

  /**
   * 切换行选择状态
   * @param rowId - 行 ID
   */
  toggleRowSelection(rowId: string): void;

  /**
   * 全选
   */
  selectAll(): void;

  /**
   * 取消全选
   */
  deselectAll(): void;

  /**
   * 获取选中的行
   */
  getSelectedRows(): Row<any>[];

  /**
   * 获取选中的行 ID
   */
  getSelectedRowIds(): string[];
}
```

#### 事件
```typescript
interface GridEvents {
  onRowSelectionChange?: (selectedRows: Row<any>[]) => void;
}
```

## 实现细节

### 阶段 1: 基础选择
**预计时间**: 2 天

**任务清单**：
- [ ] 集成 `rowSelection` 状态
- [ ] 实现单选逻辑
- [ ] 添加选中样式

### 阶段 2: 多选和复选框
**预计时间**: 2 天

**任务清单**：
- [ ] 创建 SelectionCheckbox 组件
- [ ] 实现多选逻辑
- [ ] 实现全选/取消全选

### 阶段 3: 范围选择
**预计时间**: 1 天

**任务清单**：
- [ ] 实现 Shift + 点击范围选择
- [ ] 处理边界情况

## 测试策略

### 单元测试
- 测试单选
- 测试多选
- 测试范围选择
- 测试全选/取消全选
- 测试选择状态管理

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **选择响应**: < 16ms
- **大数据集**: 支持 10K+ 行选择

### 性能优化策略
1. 使用 Set 存储选中行 ID（O(1) 查找）
2. 批量更新选择状态

## 向后兼容性

### 破坏性变更
无。行选择是可选的，默认禁用。

## 替代方案

### 方案 A: 仅单选
**描述**: 只支持单选模式

**优点**:
- 实现简单

**缺点**:
- 功能受限

### 方案 B: 单选 + 多选 + 范围（当前方案）
**描述**: 支持所有选择模式

**优点**:
- 功能完整
- 用户体验好

**缺点**:
- 实现复杂度较高

## 开放问题

- [ ] **问题 1**: 选择列的位置（左侧 vs 右侧）？
- [ ] **问题 2**: 是否需要选择状态持久化？

## 参考资料

- [ag-Grid 行选择文档](https://www.ag-grid.com/javascript-data-grid/row-selection/)
- [@tanstack/table-core 行选择文档](https://tanstack.com/table/latest/docs/guide/row-selection)

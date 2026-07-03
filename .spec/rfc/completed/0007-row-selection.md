# RFC-0007: 行选择

**状态**: ✔️ 已完成  
**版本**: 0.2.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**最后更新**: 2026-07-03  
**相关 RFC**: [0001-ac-grid-architecture](../0001-ac-grid-architecture.md)

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

- [x] **目标 1**: 支持单选模式
- [x] **目标 2**: 支持多选模式
- [x] **目标 3**: 支持范围选择（Shift + 点击）
- [x] **目标 4**: 提供选择列（复选框）
- [x] **目标 5**: 提供编程式选择 API
- [x] **目标 6**: 选择状态可视化

### 非目标
- ❌ 选择动画
- ❌ 选择历史记录

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `rowSelection` 状态管理，结合 `SelectionCheckbox` 组件，实现行选择功能。范围选择逻辑抽取至 `selection-utils.ts` 纯函数。

### 架构设计

```
用户点击行/复选框
    ↓
更新 rowSelection 状态
    ↓
触发 onRowSelectionChange
    ↓
更新 UI（data-selected + CSS 高亮）
```

### 核心组件

#### 组件 1: SelectionCheckbox
**职责**：行选择复选框（`wsx-ac-selection-checkbox`）

**接口**：
```typescript
interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridSelectionConfig {
  enabled?: boolean;
  mode?: 'single' | 'multiple';
  enableCheckbox?: boolean;
  initialRowSelection?: RowSelectionState;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
}
```

#### 方法
```typescript
class Grid {
  selectRow(rowId: string): void;
  deselectRow(rowId: string): void;
  toggleRowSelection(rowId: string): void;
  selectRowRange(anchorId: string, targetId: string): void;
  selectAll(): void;
  deselectAll(): void;
  getSelectedRows(): Row<any>[];
  getSelectedRowIds(): string[];
}
```

#### 事件
```typescript
selectionConfig.onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
```

## 实现细节

### 阶段 1: 基础选择 ✔️
- [x] 集成 `rowSelection` 状态
- [x] 实现单选逻辑（替换式选择）
- [x] 添加选中样式（`data-selected` + `--ac-grid-bg-selected`）

### 阶段 2: 多选和复选框 ✔️
- [x] 创建 SelectionCheckbox 组件
- [x] 实现多选逻辑
- [x] 实现全选/取消全选

### 阶段 3: 范围选择 ✔️
- [x] 实现 Shift + 点击范围选择
- [x] 锚点行追踪（`lastSelectedRowId`）

## 测试策略

### 单元测试
- `test/selection-utils.test.ts` — 纯函数（单选、范围、全选）
- `test/selection.test.ts` — Grid 集成（单选、多选、全选、范围、回调）

### 验证
```bash
pnpm --filter @ac-grid/core test run
```

## 性能考虑

### 性能目标
- **选择响应**: < 16ms（同步状态更新）
- **大数据集**: 与 TanStack rowSelection 一致，O(n) 全选

### 性能优化策略
1. `RowSelectionState` 对象键查找 O(1)
2. 范围选择单次遍历区间

## 向后兼容性

### 破坏性变更
无。行选择默认禁用，需显式设置 `selectionConfig.enabled: true`。

## 替代方案

### 方案 A: 仅单选 — 未采用
### 方案 B: 单选 + 多选 + 范围 — **已采用**

## 开放问题

- [x] **问题 1**: 选择列默认置于最左侧
- [ ] **问题 2**: 选择状态持久化 — 留待 [0018](../0018-grid-state-api.md)

## 参考资料

- [ag-Grid 行选择文档](https://www.ag-grid.com/javascript-data-grid/row-selection/)
- [@tanstack/table-core 行选择文档](https://tanstack.com/table/latest/docs/guide/row-selection)

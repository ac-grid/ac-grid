# RFC-0009: 单元格编辑

**状态**: 📝 草稿  
**版本**: 0.3.0  
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

为 AC Grid 添加单元格内联编辑功能，支持多种编辑器类型（文本、数字、日期、选择等），提供编辑验证和提交/取消机制。

## 动机

### 问题陈述
用户需要直接在表格中编辑数据，而不是打开单独的编辑表单。单元格编辑提供快速的数据编辑体验。

### 用户场景

**场景 1：文本编辑**
```typescript
// 用户双击单元格
// 显示输入框
// 编辑后按 Enter 保存，Esc 取消
```

**场景 2：数字编辑**
```typescript
// 用户编辑数字列
// 显示数字输入框
// 验证输入格式
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 单元格编辑
- ✅ 多种编辑器类型
- ✅ 编辑验证
- ✅ 编辑事件

## 设计目标

- [ ] **目标 1**: 支持文本编辑
- [ ] **目标 2**: 支持数字编辑
- [ ] **目标 3**: 支持日期编辑
- [ ] **目标 4**: 支持自定义编辑器
- [ ] **目标 5**: 编辑验证
- [ ] **目标 6**: 编辑事件（开始/结束/取消）

### 非目标
- ❌ 批量编辑
- ❌ 编辑历史记录

## 技术方案

### 方案概述
实现单元格编辑组件，支持多种编辑器类型，使用受控组件模式管理编辑状态。

### 架构设计

```
用户触发编辑（双击/Enter）
    ↓
显示编辑器组件
    ↓
用户输入
    ↓
验证输入
    ↓
提交或取消
    ↓
更新数据
```

### 核心组件

#### 组件 1: CellEditor
**职责**：单元格编辑器容器

**接口**：
```typescript
interface CellEditorProps {
  value: any;
  onChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  editorType?: 'text' | 'number' | 'date' | 'custom';
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用单元格编辑
  enableCellEditing?: boolean;
  // 编辑触发方式
  editTrigger?: 'doubleClick' | 'enter' | 'both';
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // 启用编辑
  enableEditing?: boolean;
  // 编辑器类型
  editor?: 'text' | 'number' | 'date' | ((props: EditorProps) => JSX.Element);
  // 编辑验证
  validateEdit?: (value: any, row: Row<TData>) => boolean | string;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 开始编辑单元格
   * @param rowId - 行 ID
   * @param columnId - 列 ID
   */
  startEdit(rowId: string, columnId: string): void;

  /**
   * 保存编辑
   */
  saveEdit(): void;

  /**
   * 取消编辑
   */
  cancelEdit(): void;
}
```

#### 事件
```typescript
interface GridEvents {
  onCellEditStart?: (rowId: string, columnId: string) => void;
  onCellEditEnd?: (rowId: string, columnId: string, newValue: any) => void;
  onCellEditCancel?: (rowId: string, columnId: string) => void;
}
```

## 实现细节

### 阶段 1: 基础编辑
**预计时间**: 3 天

**任务清单**：
- [ ] 创建 CellEditor 组件
- [ ] 实现文本编辑器
- [ ] 实现编辑状态管理

### 阶段 2: 编辑器类型
**预计时间**: 3 天

**任务清单**：
- [ ] 实现数字编辑器
- [ ] 实现日期编辑器
- [ ] 支持自定义编辑器

### 阶段 3: 验证和事件
**预计时间**: 2 天

**任务清单**：
- [ ] 实现编辑验证
- [ ] 实现编辑事件
- [ ] 处理键盘导航

## 测试策略

### 单元测试
- 测试文本编辑
- 测试数字编辑
- 测试日期编辑
- 测试编辑验证
- 测试编辑事件

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **编辑响应**: < 16ms
- **验证响应**: < 50ms

## 向后兼容性

### 破坏性变更
无。单元格编辑是可选的。

## 参考资料

- [ag-Grid 单元格编辑文档](https://www.ag-grid.com/javascript-data-grid/cell-editing/)
- [@tanstack/table-core 编辑文档](https://tanstack.com/table/latest/docs/guide/editing)

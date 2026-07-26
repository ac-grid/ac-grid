# RFC-0009: 单元格编辑

**状态**: ✔️ 已完成  
**版本**: 0.3.0  
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

为 AC Grid 添加单元格内联编辑功能，支持多种编辑器类型（文本、数字、日期、自定义），提供编辑验证和提交/取消机制。

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

- [x] **目标 1**: 支持文本编辑
- [x] **目标 2**: 支持数字编辑
- [x] **目标 3**: 支持日期编辑
- [x] **目标 4**: 支持自定义编辑器
- [x] **目标 5**: 编辑验证
- [x] **目标 6**: 编辑事件（开始/结束/取消）

### 非目标
- ❌ 批量编辑
- ❌ 编辑历史记录

## 技术方案

### 方案概述
`CellEditor` Web Component 负责内置编辑器渲染；`Grid.wsx` 管理编辑状态；验证与类型解析抽取至 `editing-utils.ts` 纯函数。

### 架构设计

```
用户触发编辑（双击/Enter）
    ↓
Grid.startEdit → editingState
    ↓
CellEditor 或 columnDef.editor 自定义渲染
    ↓
validateEditValue（可选）
    ↓
onEditSave / onEditCancel
```

### 核心组件

#### CellEditor (`packages/core/src/components/CellEditor.wsx`)
内置 text / number / date 输入，Enter 保存、Esc 取消、blur 自动保存，支持校验错误展示。

#### editing-utils (`packages/core/src/utils/editing-utils.ts`)
`resolveEditorType`、`validateEditValue`、`coerceEditorValue`、`isColumnEditable` 等纯函数。

## API 设计

### GridEditingConfig
```typescript
interface GridEditingConfig {
  enabled?: boolean;
  editTrigger?: 'doubleClick' | 'enter' | 'both';
  onEditStart?: (rowId: string, columnId: string) => void;
  onEditSave?: (rowId: string, columnId: string, value: unknown) => void;
  onEditCancel?: (rowId: string, columnId: string) => void;
}
```

### ColumnDef 增强
```typescript
interface ColumnDef<TData> {
  enableEditing?: boolean;
  editor?: 'text' | 'number' | 'date' | ((props: EditorProps<TData>) => unknown);
  validateEdit?: (value: unknown, row: Row<TData>) => boolean | string;
}
```

### Grid 方法
- `startEdit(rowId, columnId, initialValue?)`
- `saveEdit(newValue)`
- `cancelEdit()`

## 实现细节

### 阶段 1: 基础编辑 ✔️
- [x] 创建 CellEditor 组件
- [x] 实现文本编辑器
- [x] 实现编辑状态管理

### 阶段 2: 编辑器类型 ✔️
- [x] 实现数字编辑器
- [x] 实现日期编辑器
- [x] 支持自定义编辑器（flexRender）

### 阶段 3: 验证和事件 ✔️
- [x] 实现编辑验证
- [x] 实现编辑事件
- [x] editTrigger（doubleClick / enter / both）

## 测试策略

### 单元测试
- `test/editing-utils.test.ts` — 纯函数（类型解析、校验、coerce）
- `test/editing.test.ts` — Grid 集成（start/save/cancel、校验、列禁用）

### 验证
```bash
pnpm --filter @ac-grid/core test run
```

## 性能考虑

### 性能目标
- **编辑响应**: < 16ms（同步状态切换）
- **验证响应**: < 50ms（纯函数校验）

## 向后兼容性

### 破坏性变更
无。单元格编辑默认禁用，需显式设置 `editingConfig.enabled: true`。

## 替代方案

### 方案 A: 仅文本编辑 — 未采用
### 方案 B: 多类型 + 验证 + 自定义编辑器 — **已采用**

## 开放问题

- [x] **问题 1**: 数据更新由宿主通过 `onEditSave` 回调处理（Grid 不直接 mutate data）
- [ ] **问题 2**: 完整键盘导航与编辑联动 — 留待 [0012](../0012-keyboard-navigation.md)

## 参考资料

- [ag-Grid 单元格编辑文档](https://www.ag-grid.com/javascript-data-grid/cell-editing/)
- [@tanstack/table-core 编辑文档](https://tanstack.com/table/latest/docs/guide/editing)

# RFC-0004: 列调整大小

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

为 AC Grid 添加列宽度调整功能，支持拖拽调整列宽、自动列宽计算，以及列宽持久化。

## 动机

### 问题陈述
当前 AC Grid 的列宽是固定的（通过 `size` 属性设置），用户无法根据内容或偏好调整列宽。列调整大小是数据表格的常用功能，ag-Grid 社区版也提供了完整的支持。

### 用户场景

**场景 1：拖拽调整列宽**
```typescript
// 用户在列边界拖拽
// 实时显示新的列宽
// 释放后应用新的列宽
```

**场景 2：自动列宽**
```typescript
// 双击列边界
// 自动调整列宽以适配内容
```

**场景 3：列宽持久化**
```typescript
// 用户调整列宽后
// 自动保存到 localStorage
// 下次加载时恢复
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 拖拽调整列宽
- ✅ 自动列宽
- ✅ 最小/最大列宽限制
- ✅ 列宽持久化

## 设计目标

- [ ] **目标 1**: 支持拖拽调整列宽
- [ ] **目标 2**: 支持自动列宽（双击边界）
- [ ] **目标 3**: 支持最小/最大列宽限制
- [ ] **目标 4**: 提供编程式列宽 API
- [ ] **目标 5**: 列宽持久化（可选）

### 非目标
- ❌ 列宽动画
- ❌ 列宽同步（多表格）

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `columnSizing` 状态管理，结合鼠标事件处理，实现流畅的列宽调整功能。

### 架构设计

```
用户拖拽列边界
    ↓
ResizeHandle 组件捕获鼠标事件
    ↓
计算新的列宽
    ↓
更新 columnSizing 状态
    ↓
Grid 组件重新渲染
```

### 核心组件

#### 组件 1: ResizeHandle
**职责**：列宽调整手柄

**接口**：
```typescript
interface ResizeHandleProps {
  column: Column<any, unknown>;
  onResize: (width: number) => void;
}
```

### 数据流

```
鼠标事件 → 计算新宽度 → 更新 columnSizing → 重新渲染
```

### 依赖关系
- **新增依赖**: 无
- **内部依赖**: Grid 组件、DraggableTableHeader 组件

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用列调整大小
  enableColumnResizing?: boolean;
  // 默认列宽
  defaultColumnWidth?: number;
  // 最小列宽
  minColumnWidth?: number;
  // 最大列宽
  maxColumnWidth?: number;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // 启用调整大小
  enableResizing?: boolean;
  // 最小宽度
  minSize?: number;
  // 最大宽度
  maxSize?: number;
  // 初始宽度
  size?: number;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 设置列宽
   * @param columnId - 列 ID
   * @param width - 新宽度
   */
  setColumnWidth(columnId: string, width: number): void;

  /**
   * 自动调整列宽
   * @param columnId - 列 ID
   */
  autoSizeColumn(columnId: string): void;

  /**
   * 自动调整所有列宽
   */
  autoSizeAllColumns(): void;

  /**
   * 获取列宽
   * @param columnId - 列 ID
   */
  getColumnWidth(columnId: string): number;
}
```

#### 事件
```typescript
interface GridEvents {
  onColumnResize?: (columnId: string, width: number) => void;
}
```

### 使用示例

#### 基础用法
```typescript
const grid = createGrid({
  data,
  columns,
  enableColumnResizing: true,
  minColumnWidth: 50,
  maxColumnWidth: 500,
});
```

## 实现细节

### 阶段 1: 基础调整大小
**预计时间**: 2 天

**任务清单**：
- [ ] 创建 ResizeHandle 组件
- [ ] 实现鼠标拖拽逻辑
- [ ] 集成到表头组件

### 阶段 2: 自动列宽
**预计时间**: 2 天

**任务清单**：
- [ ] 实现内容宽度计算
- [ ] 实现双击自动调整
- [ ] 优化计算性能

### 阶段 3: 限制和持久化
**预计时间**: 1 天

**任务清单**：
- [ ] 实现最小/最大宽度限制
- [ ] 实现列宽持久化（可选）

## 测试策略

### 单元测试
- 测试拖拽调整列宽
- 测试自动列宽计算
- 测试最小/最大宽度限制
- 测试列宽持久化

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **调整响应**: < 16ms (60 FPS)
- **自动计算**: < 100ms (1000 行)

### 性能优化策略
1. 使用 `requestAnimationFrame` 优化拖拽性能
2. 缓存列宽计算结果
3. 防抖自动计算

## 向后兼容性

### 破坏性变更
无。列调整大小是新增功能。

## 替代方案

### 方案 A: CSS resize
**描述**: 使用 CSS `resize` 属性

**优点**:
- 简单实现

**缺点**:
- 浏览器兼容性问题
- 控制能力有限

### 方案 B: 鼠标事件处理（当前方案）
**描述**: 手动处理鼠标事件

**优点**:
- 完全控制
- 跨浏览器兼容
- 支持自定义逻辑

**缺点**:
- 实现复杂度较高

### 为什么选择当前方案
手动处理提供更好的控制和用户体验。

## 开放问题

- [ ] **问题 1**: 是否需要列宽动画？
- [ ] **问题 2**: 持久化策略（localStorage vs sessionStorage）？

## 参考资料

- [ag-Grid 列调整大小文档](https://www.ag-grid.com/javascript-data-grid/column-sizing/)
- [@tanstack/table-core 列大小文档](https://tanstack.com/table/latest/docs/guide/column-sizing)

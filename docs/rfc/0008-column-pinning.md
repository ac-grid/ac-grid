# RFC-0008: 列固定 (Pinning)

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

为 AC Grid 添加列固定（Pinning）功能，支持将列固定在左侧或右侧，在水平滚动时保持固定列可见。

## 动机

### 问题陈述
当表格列数较多需要水平滚动时，重要的列（如 ID、名称）会被滚动出视野。列固定功能可以将重要列固定在左侧或右侧，始终可见。

### 用户场景

**场景 1：固定左侧列**
```typescript
// 固定 ID 和名称列在左侧
// 水平滚动时这两列始终可见
```

**场景 2：固定右侧列**
```typescript
// 固定操作列在右侧
// 操作按钮始终可见
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 左侧列固定
- ✅ 右侧列固定
- ✅ 编程式固定 API

## 设计目标

- [ ] **目标 1**: 支持左侧列固定
- [ ] **目标 2**: 支持右侧列固定
- [ ] **目标 3**: 支持固定列拖拽重排序
- [ ] **目标 4**: 提供编程式固定 API
- [ ] **目标 5**: 固定列视觉区分

### 非目标
- ❌ 固定列动画
- ❌ 固定列配置持久化

## 技术方案

### 方案概述
利用 `@tanstack/table-core` 的 `columnPinning` 状态管理，结合 CSS `position: sticky` 实现列固定。

### 架构设计

```
用户固定列
    ↓
更新 columnPinning 状态
    ↓
重新计算列顺序
    ↓
应用 CSS sticky 定位
    ↓
固定列始终可见
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用列固定
  enableColumnPinning?: boolean;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // 固定位置
  pin?: 'left' | 'right' | false;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 固定列
   * @param columnId - 列 ID
   * @param position - 固定位置
   */
  pinColumn(columnId: string, position: 'left' | 'right'): void;

  /**
   * 取消固定列
   * @param columnId - 列 ID
   */
  unpinColumn(columnId: string): void;

  /**
   * 获取固定列
   */
  getPinnedColumns(): {
    left: string[];
    right: string[];
  };
}
```

## 实现细节

### 阶段 1: 基础固定
**预计时间**: 3 天

**任务清单**：
- [ ] 集成 `columnPinning` 状态
- [ ] 实现列顺序计算
- [ ] 应用 CSS sticky 定位

### 阶段 2: 视觉和交互
**预计时间**: 2 天

**任务清单**：
- [ ] 添加固定列视觉区分
- [ ] 实现固定列拖拽
- [ ] 处理固定列边界

## 测试策略

### 单元测试
- 测试左侧固定
- 测试右侧固定
- 测试固定列拖拽
- 测试滚动行为

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **固定切换**: < 50ms
- **滚动性能**: 60 FPS

## 向后兼容性

### 破坏性变更
无。列固定是可选的。

## 参考资料

- [ag-Grid 列固定文档](https://www.ag-grid.com/javascript-data-grid/column-pinning/)
- [@tanstack/table-core 列固定文档](https://tanstack.com/table/latest/docs/guide/column-pinning)

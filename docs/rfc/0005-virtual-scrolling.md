# RFC-0005: 虚拟滚动

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

为 AC Grid 添加虚拟滚动功能，支持大数据集（100K+ 行）的流畅渲染，仅渲染可见区域的行，大幅提升性能和用户体验。

## 动机

### 问题陈述
当前 AC Grid 渲染所有行，对于大数据集会导致：
- 初始渲染缓慢
- 内存占用高
- 滚动卡顿
- 用户体验差

### 用户场景

**场景 1：大数据集渲染**
```typescript
// 100K 行数据
// 只渲染可见的 20-30 行
// 滚动时动态加载新的行
```

**场景 2：流畅滚动**
```typescript
// 60 FPS 滚动体验
// 无卡顿
// 快速响应
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 行虚拟滚动
- ✅ 列虚拟滚动
- ✅ 支持 100K+ 行
- ✅ 流畅滚动性能

## 设计目标

- [ ] **目标 1**: 支持行虚拟滚动（100K+ 行）
- [ ] **目标 2**: 支持列虚拟滚动（可选）
- [ ] **目标 3**: 60 FPS 滚动性能
- [ ] **目标 4**: 动态行高支持
- [ ] **目标 5**: 保持现有 API 兼容性

### 非目标
- ❌ 服务端虚拟滚动
- ❌ 无限滚动加载

## 技术方案

### 方案概述
实现基于视口的虚拟滚动，只渲染可见区域的行，使用 `IntersectionObserver` 或手动计算可见范围。

### 架构设计

```
滚动事件
    ↓
计算可见行范围
    ↓
只渲染可见行
    ↓
使用占位符填充不可见区域
    ↓
保持滚动位置正确
```

### 核心组件

#### 组件 1: VirtualizedGrid
**职责**：虚拟滚动容器

**接口**：
```typescript
interface VirtualizedGridProps {
  rowHeight: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}
```

### 数据流

```
滚动 → 计算可见范围 → 过滤行数据 → 渲染可见行 → 更新占位符
```

### 依赖关系
- **新增依赖**: 无（或考虑轻量级虚拟滚动库）
- **内部依赖**: Grid 组件

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用虚拟滚动
  enableVirtualScrolling?: boolean;
  // 行高（固定高度模式）
  rowHeight?: number;
  // 预渲染行数（overscan）
  overscan?: number;
  // 动态行高
  estimateRowHeight?: (row: Row<any>) => number;
}
```

#### 方法
```typescript
class Grid {
  /**
   * 滚动到指定行
   * @param rowIndex - 行索引
   */
  scrollToRow(rowIndex: number): void;

  /**
   * 获取可见行范围
   */
  getVisibleRowRange(): { start: number; end: number };
}
```

## 实现细节

### 阶段 1: 基础虚拟滚动
**预计时间**: 5 天

**任务清单**：
- [ ] 实现可见范围计算
- [ ] 实现行渲染优化
- [ ] 实现占位符填充

### 阶段 2: 性能优化
**预计时间**: 3 天

**任务清单**：
- [ ] 优化滚动性能
- [ ] 实现 overscan
- [ ] 优化内存使用

### 阶段 3: 动态行高
**预计时间**: 2 天

**任务清单**：
- [ ] 实现动态行高计算
- [ ] 实现行高缓存

## 测试策略

### 单元测试
- 测试可见范围计算
- 测试滚动性能
- 测试大数据集渲染

### 性能测试
- 100K 行数据测试
- 滚动 FPS 测试
- 内存占用测试

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **初始渲染**: < 200ms (100K 行)
- **滚动 FPS**: 60 FPS
- **内存占用**: < 100MB (100K 行)

### 性能优化策略
1. 使用 `requestAnimationFrame` 优化滚动
2. 实现行高缓存
3. 使用 `IntersectionObserver` 优化可见性检测

## 向后兼容性

### 破坏性变更
无。虚拟滚动是可选的，默认禁用。

### 迁移指南
启用虚拟滚动只需添加配置：
```typescript
const grid = createGrid({
  data,
  columns,
  enableVirtualScrolling: true,
  rowHeight: 50,
});
```

## 替代方案

### 方案 A: 使用第三方库（如 react-window）
**描述**: 使用成熟的虚拟滚动库

**优点**:
- 成熟稳定
- 性能优化完善

**缺点**:
- 可能不兼容 Web Components
- 增加依赖

### 方案 B: 自研虚拟滚动（当前方案）
**描述**: 自己实现虚拟滚动

**优点**:
- 完全控制
- 无额外依赖
- 适配 Web Components

**缺点**:
- 实现复杂度高
- 需要充分测试

### 为什么选择当前方案
自研可以更好地适配 Web Components 架构。

## 开放问题

- [ ] **问题 1**: 是否需要列虚拟滚动？
- [ ] **问题 2**: 如何处理动态行高？

## 参考资料

- [ag-Grid 虚拟滚动文档](https://www.ag-grid.com/javascript-data-grid/dom-layout/)
- [react-window 文档](https://react-window.vercel.app/)

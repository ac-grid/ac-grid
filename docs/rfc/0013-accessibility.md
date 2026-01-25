# RFC-0013: 可访问性 (a11y)

**状态**: 📝 草稿  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0012-keyboard-navigation](./0012-keyboard-navigation.md)

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

为 AC Grid 添加完整的可访问性（a11y）支持，包括 ARIA 属性、屏幕阅读器支持、键盘导航和高对比度模式支持，确保所有用户都能使用表格。

## 动机

### 问题陈述
当前 AC Grid 缺乏可访问性支持，使用屏幕阅读器的用户无法有效使用表格。可访问性是 Web 应用的基本要求。

### 用户场景

**场景 1：屏幕阅读器用户**
```typescript
// 用户使用屏幕阅读器
// 需要正确的 ARIA 标签
// 需要语义化的 HTML 结构
```

**场景 2：键盘用户**
```typescript
// 用户只使用键盘
// 需要完整的键盘导航支持
// 需要清晰的焦点指示
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ ARIA 属性
- ✅ 键盘导航
- ✅ 屏幕阅读器支持

## 设计目标

- [ ] **目标 1**: 完整的 ARIA 属性支持
- [ ] **目标 2**: 语义化 HTML 结构
- [ ] **目标 3**: 键盘导航支持
- [ ] **目标 4**: 屏幕阅读器支持
- [ ] **目标 5**: 高对比度模式支持
- [ ] **目标 6**: 符合 WCAG 2.1 AA 标准

### 非目标
- ❌ 语音控制
- ❌ 手势导航

## 技术方案

### 方案概述
添加 ARIA 属性，确保语义化 HTML，实现键盘导航，提供屏幕阅读器友好的交互。

### ARIA 属性

```typescript
// Grid 容器
role="grid"
aria-label="Data table"
aria-rowcount={totalRows}
aria-colcount={totalColumns}

// 表头
role="columnheader"
aria-sort={sortDirection}
aria-label={columnName}

// 单元格
role="gridcell"
aria-rowindex={rowIndex}
aria-colindex={colIndex}
aria-selected={isSelected}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 可访问性标签
  ariaLabel?: string;
  // 可访问性描述
  ariaDescription?: string;
}
```

#### 列定义增强
```typescript
interface ColumnDef<TData> {
  // ARIA 标签
  ariaLabel?: string;
  // 可访问性描述
  ariaDescription?: string;
}
```

## 实现细节

### 阶段 1: ARIA 属性
**预计时间**: 3 天

**任务清单**：
- [ ] 添加 grid role
- [ ] 添加 columnheader role
- [ ] 添加 gridcell role
- [ ] 添加 aria 属性

### 阶段 2: 键盘导航
**预计时间**: 2 天

**任务清单**：
- [ ] 实现键盘导航（见 RFC-0012）
- [ ] 实现焦点管理
- [ ] 实现焦点指示

### 阶段 3: 屏幕阅读器优化
**预计时间**: 2 天

**任务清单**：
- [ ] 优化屏幕阅读器体验
- [ ] 添加实时区域（live regions）
- [ ] 测试屏幕阅读器兼容性

## 测试策略

### 单元测试
- 测试 ARIA 属性
- 测试键盘导航
- 测试焦点管理

### 可访问性测试
- 使用屏幕阅读器测试
- 使用键盘导航测试
- WCAG 2.1 AA 合规性测试

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **ARIA 更新**: 无性能影响
- **键盘响应**: < 16ms

## 向后兼容性

### 破坏性变更
无。可访问性功能是增强性的。

## 参考资料

- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Grid 模式](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)
- [ag-Grid 可访问性文档](https://www.ag-grid.com/javascript-data-grid/accessibility/)

# RFC-0012: 键盘导航

**状态**: 📝 草稿  
**版本**: 0.4.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0009-cell-editing](./0009-cell-editing.md)

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

为 AC Grid 添加完整的键盘导航支持，允许用户使用键盘在表格中导航、选择和编辑，提升可访问性和用户体验。

## 动机

### 问题陈述
当前 AC Grid 主要依赖鼠标操作，缺乏键盘导航支持。键盘导航对于可访问性和高效操作至关重要。

### 用户场景

**场景 1：单元格导航**
```typescript
// 用户使用方向键在单元格间导航
// Tab 键移动到下一行
// Enter 键进入编辑模式
```

**场景 2：快速操作**
```typescript
// Ctrl+A 全选
// Ctrl+C 复制
// Delete 删除选中行
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ 方向键导航
- ✅ Tab/Shift+Tab 导航
- ✅ Enter 编辑
- ✅ 快捷键支持

## 设计目标

- [ ] **目标 1**: 支持方向键导航
- [ ] **目标 2**: 支持 Tab/Shift+Tab 导航
- [ ] **目标 3**: 支持 Enter 编辑
- [ ] **目标 4**: 支持常用快捷键
- [ ] **目标 5**: 焦点管理
- [ ] **目标 6**: ARIA 属性支持

### 非目标
- ❌ 自定义快捷键配置
- ❌ 快捷键冲突检测

## 技术方案

### 方案概述
实现键盘事件处理系统，管理焦点状态，提供键盘导航逻辑。

### 架构设计

```
键盘事件
    ↓
键盘事件处理器
    ↓
更新焦点状态
    ↓
执行对应操作（导航/编辑/选择）
    ↓
更新 UI
```

### 核心组件

#### 组件 1: KeyboardNavigation
**职责**：键盘导航管理器

**接口**：
```typescript
interface KeyboardNavigationProps {
  grid: Grid;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}
```

## API 设计

### 公共 API

#### 配置选项
```typescript
interface GridOptions {
  // 启用键盘导航
  enableKeyboardNavigation?: boolean;
  // 键盘导航模式
  keyboardNavigationMode?: 'cell' | 'row';
}
```

#### 方法
```typescript
class Grid {
  /**
   * 设置焦点到指定单元格
   * @param rowId - 行 ID
   * @param columnId - 列 ID
   */
  focusCell(rowId: string, columnId: string): void;

  /**
   * 获取当前焦点单元格
   */
  getFocusedCell(): { rowId: string; columnId: string } | null;
}
```

### 快捷键列表

| 快捷键 | 功能 |
|--------|------|
| Arrow Keys | 导航到相邻单元格 |
| Tab | 移动到下一个单元格 |
| Shift+Tab | 移动到上一个单元格 |
| Enter | 进入编辑模式 / 移动到下一行 |
| Escape | 取消编辑 / 取消选择 |
| Ctrl+A | 全选 |
| Delete | 删除选中行（如果支持） |

## 实现细节

### 阶段 1: 基础导航
**预计时间**: 3 天

**任务清单**：
- [ ] 实现方向键导航
- [ ] 实现 Tab 导航
- [ ] 实现焦点管理

### 阶段 2: 编辑集成
**预计时间**: 2 天

**任务清单**：
- [ ] 集成 Enter 编辑
- [ ] 集成 Escape 取消
- [ ] 处理编辑中的导航

### 阶段 3: 快捷键
**预计时间**: 2 天

**任务清单**：
- [ ] 实现常用快捷键
- [ ] 实现快捷键冲突处理
- [ ] 添加 ARIA 属性

## 测试策略

### 单元测试
- 测试方向键导航
- 测试 Tab 导航
- 测试 Enter 编辑
- 测试快捷键
- 测试焦点管理

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **导航响应**: < 16ms
- **焦点切换**: < 16ms

## 向后兼容性

### 破坏性变更
无。键盘导航是可选的。

## 参考资料

- [ag-Grid 键盘导航文档](https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/)
- [WAI-ARIA 键盘导航指南](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

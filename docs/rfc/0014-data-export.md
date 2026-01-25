# RFC-0014: 数据导出

**状态**: 📝 草稿  
**版本**: 0.5.0  
**作者**: Albert Li  
**日期**: 2026-01-24  
**相关 RFC**: [0001-ac-grid-architecture](./0001-ac-grid-architecture.md), [0007-row-selection](./0007-row-selection.md)

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

为 AC Grid 添加数据导出功能，支持导出为 CSV 和 Excel 格式，支持导出所有数据或仅导出选中/可见的数据。

## 动机

### 问题陈述
用户需要将表格数据导出到文件以便进一步分析或分享。数据导出是数据表格的常用功能。

### 用户场景

**场景 1：导出所有数据**
```typescript
// 用户点击导出按钮
// 导出所有数据为 CSV
// 自动下载文件
```

**场景 2：导出选中数据**
```typescript
// 用户选择部分行
// 只导出选中的行
```

### 与 ag-Grid 的对比
ag-Grid 社区版提供：
- ✅ CSV 导出
- ✅ Excel 导出（需要企业版）
- ✅ 导出选中数据

## 设计目标

- [ ] **目标 1**: 支持 CSV 导出
- [ ] **目标 2**: 支持 Excel 导出（可选）
- [ ] **目标 3**: 支持导出所有数据
- [ ] **目标 4**: 支持导出选中数据
- [ ] **目标 5**: 支持自定义导出格式
- [ ] **目标 6**: 支持导出配置（包含表头、格式化等）

### 非目标
- ❌ PDF 导出
- ❌ 打印功能

## 技术方案

### 方案概述
实现数据导出工具函数，支持 CSV 和 Excel 格式，使用第三方库（如 `xlsx`）处理 Excel 导出。

### 架构设计

```
用户触发导出
    ↓
获取要导出的数据（全部/选中/可见）
    ↓
格式化数据
    ↓
生成文件（CSV/Excel）
    ↓
下载文件
```

### 依赖关系
- **新增依赖**: 
  - `xlsx` (Excel 导出，可选)
- **内部依赖**: Grid 组件

## API 设计

### 公共 API

#### 方法
```typescript
class Grid {
  /**
   * 导出为 CSV
   * @param options - 导出选项
   */
  exportToCSV(options?: ExportOptions): void;

  /**
   * 导出为 Excel
   * @param options - 导出选项
   */
  exportToExcel(options?: ExportOptions): void;
}
```

#### 类型定义
```typescript
export interface ExportOptions {
  // 文件名
  fileName?: string;
  // 导出范围
  exportMode?: 'all' | 'selected' | 'visible';
  // 包含表头
  includeHeaders?: boolean;
  // 列过滤
  columns?: string[];
  // 自定义格式化
  formatter?: (value: any, column: Column<any>, row: Row<any>) => string;
}
```

### 使用示例

#### 基础用法
```typescript
const grid = createGrid({ data, columns });

// 导出为 CSV
grid.exportToCSV({
  fileName: 'data.csv',
  exportMode: 'all',
});
```

## 实现细节

### 阶段 1: CSV 导出
**预计时间**: 2 天

**任务清单**：
- [ ] 实现 CSV 生成
- [ ] 实现文件下载
- [ ] 处理特殊字符

### 阶段 2: Excel 导出
**预计时间**: 2 天

**任务清单**：
- [ ] 集成 xlsx 库
- [ ] 实现 Excel 生成
- [ ] 实现样式格式化

### 阶段 3: 高级功能
**预计时间**: 1 天

**任务清单**：
- [ ] 实现导出选项
- [ ] 实现自定义格式化
- [ ] 实现导出范围选择

## 测试策略

### 单元测试
- 测试 CSV 导出
- 测试 Excel 导出
- 测试导出选项
- 测试大数据集导出

### 测试覆盖率目标
- **语句覆盖率**: 100%
- **分支覆盖率**: 100%
- **函数覆盖率**: 100%
- **行覆盖率**: 100%

## 性能考虑

### 性能目标
- **CSV 导出**: < 500ms (10K 行)
- **Excel 导出**: < 1s (10K 行)

### 性能优化策略
1. 流式处理大数据集
2. 使用 Web Worker（可选）

## 向后兼容性

### 破坏性变更
无。数据导出是新增功能。

## 替代方案

### 方案 A: 仅 CSV 导出
**描述**: 只支持 CSV 格式

**优点**:
- 实现简单
- 无额外依赖

**缺点**:
- 功能受限

### 方案 B: CSV + Excel 导出（当前方案）
**描述**: 支持两种格式

**优点**:
- 功能完整
- 满足不同需求

**缺点**:
- 需要额外依赖（Excel）

## 开放问题

- [ ] **问题 1**: Excel 导出是否作为可选功能？
- [ ] **问题 2**: 是否需要导出进度指示？

## 参考资料

- [ag-Grid 数据导出文档](https://www.ag-grid.com/javascript-data-grid/excel-export/)
- [SheetJS (xlsx) 文档](https://sheetjs.com/)

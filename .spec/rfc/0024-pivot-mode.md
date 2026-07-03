# RFC-0024: 透视模式 (Pivot Mode)

**状态**: 📝 草稿  
**版本**: 1.2.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0010](./0010-grouping-aggregation.md)

## 概述

将扁平数据透视为动态列（pivot columns）并聚合值，对标 AG Grid Enterprise Pivoting。

## 设计目标

- [ ] `pivotMode: true`
- [ ] `pivotKeys` / `valueCols` / `aggFunc` 配置
- [ ] 动态列生成与 0008 pinning 协同
- [ ] 导出透视结果（0014/0025）

### 非目标

- ❌ OLAP 多维立方体服务端

## API 设计

```typescript
interface ColumnDef {
  pivot?: boolean;
  enablePivot?: boolean;
  aggFunc?: 'sum' | 'avg' | 'count' | AggFunc;
}
```

## 实现细节

在 tanstack 之上增加 `pivotEngine` 纯函数模块，输入 row model 输出透视 columnDefs + rowData。

## 参考资料

- [AG Grid Pivoting](https://www.ag-grid.com/javascript-data-grid/pivoting/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

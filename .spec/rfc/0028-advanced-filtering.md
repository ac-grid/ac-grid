# RFC-0028: 高级过滤 (Set / Multi Filter)

**状态**: 📝 草稿  
**版本**: 1.2.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0003](./completed/0003-filtering-feature.md), [0019](./completed/0019-custom-components.md)

## 概述

Set Filter（复选框值列表）、Multi Filter（组合过滤器）、日期/数字范围过滤器，对标 AG Grid Enterprise Advanced Filter。

## 设计目标

- [ ] `filter: 'agSetColumnFilter'` 等价注册
- [ ] Multi Filter AND/OR 组合
- [ ] 与 0003 文本过滤共存
- [ ] 大数据集 Set Filter 虚拟列表

### 非目标

- ❌ 全文搜索引擎集成

## API 设计

```typescript
type FilterType = 'text' | 'set' | 'number' | 'date' | 'multi';

interface ColumnDef {
  filter?: FilterType | ComponentType;
  filterParams?: SetFilterParams | MultiFilterParams;
}
```

## 实现细节

`setFilterValues` 可从列数据 distinct 或异步 `values` 回调加载。

## 参考资料

- [AG Grid Set Filter](https://www.ag-grid.com/javascript-data-grid/filter-set/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

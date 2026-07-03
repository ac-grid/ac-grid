# RFC-0020: 树形数据 (Tree Data)

**状态**: 📝 草稿  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0005-virtual-scrolling](./completed/0005-virtual-scrolling.md), [0010](./0010-grouping-aggregation.md)

## 概述

支持层级树形行数据展示与展开/折叠，对标 AG Grid Enterprise Tree Data 模式。

## 动机

组织架构、文件目录、BOM 等场景需要嵌套行而非平铺分组。

## 设计目标

- [ ] `treeData: true` + `getDataPath` 或嵌套 `children` 字段
- [ ] 展开/折叠动画（可选）
- [ ] 与虚拟滚动兼容（扁平化可见行）
- [ ] 键盘展开/折叠（依赖 0012）

### 非目标

- ❌ 懒加载子节点（见 0031 SSRM）

## API 设计

```typescript
interface GridOptions {
  treeData?: boolean;
  getDataPath?: (data: RowData) => string[];
  autoGroupColumnDef?: ColumnDef;
}
```

## 实现细节

将树结构通过 `flattenTree(rows, expandedKeys)` 转为虚拟列表索引；缩进由 `depth` CSS 变量控制。

## 测试策略

- 3 层嵌套展开/折叠行数正确
- 10K 节点虚拟滚动性能

## 参考资料

- [AG Grid Tree Data](https://www.ag-grid.com/javascript-data-grid/tree-data/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

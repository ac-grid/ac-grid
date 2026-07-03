# RFC-0026: 右键菜单与列菜单

**状态**: 📝 草稿  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0019](./0019-custom-components.md), [0008](./0008-column-pinning.md)

## 概述

提供可定制的上下文菜单（行/单元格）和列头菜单（排序、固定、隐藏列），对标 AG Grid Enterprise Context Menu / Column Menu。

## 设计目标

- [ ] `getContextMenuItems` 回调
- [ ] 默认项：复制、导出、固定列
- [ ] 列菜单：排序方向、自动列宽、列选择器
- [ ] 键盘可访问（0013）

## API 设计

```typescript
type MenuItem = string | MenuItemDef;

interface GridOptions {
  getContextMenuItems?: (params: GetContextMenuItemsParams) => MenuItem[];
  getMainMenuItems?: (params: GetMainMenuItemsParams) => MenuItem[];
}
```

## 实现细节

独立 `<ac-grid-menu>` overlay 组件，portal 到 body 避免 Shadow DOM 裁剪。

## 参考资料

- [AG Grid Context Menu](https://www.ag-grid.com/javascript-data-grid/context-menu/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

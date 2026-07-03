# RFC-0027: 工具面板与状态栏

**状态**: 📝 草稿  
**版本**: 1.2.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0010](./0010-grouping-aggregation.md), [0024](./0024-pivot-mode.md)

## 概述

侧边工具面板（列选择、过滤器、聚合）和底部状态栏（行数、聚合摘要），对标 AG Grid Enterprise Tool Panels / Status Bar。

## 设计目标

- [ ] `sideBar: { toolPanels: [...] }`
- [ ] 内置 panels：`columns`, `filters`, `aggregation`
- [ ] `statusBar: { statusPanels: [...] }`
- [ ] 主题 token 一致（0016）

## API 设计

```typescript
interface SideBarDef {
  toolPanels: ToolPanelDef[];
  defaultToolPanel?: string;
  hiddenByDefault?: boolean;
}

interface GridOptions {
  sideBar?: SideBarDef | boolean;
  statusBar?: StatusBarDef;
}
```

## 实现细节

工具面板为 grid 外围 layout slot，不进入虚拟滚动区域。

## 参考资料

- [AG Grid Tool Panel](https://www.ag-grid.com/javascript-data-grid/tool-panel/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

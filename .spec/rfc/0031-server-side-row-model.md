# RFC-0031: 服务端行模型 (SSRM)

**状态**: 🔮 Stretch  
**版本**: 2.0.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0006](./completed/0006-pagination.md), [0005-virtual-scrolling](./completed/0005-virtual-scrolling.md)

## 概述

服务端分页、排序、过滤、懒加载与无限滚动，对标 AG Grid Enterprise Server-Side Row Model。

## 设计目标

- [ ] `rowModelType: 'serverSide'`
- [ ] `getRows(params)` 异步数据源接口
- [ ] 缓存块 (block) 与预取
- [ ] 与 0020 树形懒加载、0024 透视服务端模式

## API 设计

```typescript
interface IServerSideDatasource {
  getRows(params: IServerSideGetRowsParams): void;
}

interface GridOptions {
  rowModelType?: 'clientSide' | 'serverSide';
  serverSideDatasource?: IServerSideDatasource;
  cacheBlockSize?: number;
}
```

## 参考资料

- [AG Grid SSRM](https://www.ag-grid.com/javascript-data-grid/server-side-model/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

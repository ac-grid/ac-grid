# RFC-0025: Excel 高级导出

**状态**: 📝 草稿  
**版本**: 1.2.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0014](./0014-data-export.md)

## 概述

在 RFC-0014 CSV 基础上，支持带样式、合并单元格、多 Sheet 的 `.xlsx` 导出，对标 AG Grid Enterprise Excel Export。

## 设计目标

- [ ] `exportDataAsExcel()` API
- [ ] 列宽、字体、背景色映射
- [ ] 分组/透视结构导出
- [ ] 可选依赖 `exceljs` 或 `sheetjs`（tree-shake）

### 非目标

- ❌ Excel 导入
- ❌ 宏/VBA

## API 设计

```typescript
interface ExcelExportParams {
  fileName?: string;
  sheetName?: string;
  exportMode?: 'xlsx' | 'xml';
  columnStyles?: Record<string, ExcelStyle>;
}

gridApi.exportDataAsExcel(params?: ExcelExportParams): void;
```

## 实现细节

0014 负责 CSV/简单导出；本 RFC 新增 `@ac-grid/export-excel` 可选包，避免 core 体积膨胀。

## 参考资料

- [AG Grid Excel Export](https://www.ag-grid.com/javascript-data-grid/excel-export/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

# RFC-0023: 剪贴板操作 (Clipboard)

**状态**: 📝 草稿  
**版本**: 1.1.0  
**作者**: Albert Li  
**日期**: 2026-06-28  
**相关 RFC**: [0022](./0022-range-selection.md), [0014](./0014-data-export.md)

## 概述

支持 Ctrl+C/V 在选区与系统剪贴板间复制粘贴 TSV/CSV，对标 AG Grid Enterprise Clipboard。

## 设计目标

- [ ] 复制选区为 TSV（Excel 兼容）
- [ ] 从剪贴板粘贴更新可编辑单元格
- [ ] `suppressClipboardApi` 降级为自定义 handler
- [ ] 与 0022 范围选择、0009 单元格编辑集成

### 非目标

- ❌ 富文本/HTML 剪贴板

## API 设计

```typescript
interface GridOptions {
  enableClipboard?: boolean;
  processCellForClipboard?: (params: CellParams) => string;
  processCellFromClipboard?: (params: PasteParams) => unknown;
}
```

## 实现细节

使用 `navigator.clipboard` + `document.execCommand` fallback；粘贴解析用纯函数 `parseTsv`.

## 参考资料

- [AG Grid Clipboard](https://www.ag-grid.com/javascript-data-grid/clipboard/)
- [PARITY_MATRIX](./PARITY_MATRIX.md)

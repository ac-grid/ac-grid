# RFC-0023: 剪贴板操作 (Clipboard)

**Status:** Implemented
**版本**: 1.1.0
**作者**: Albert Li
**日期**: 2026-06-28
**相关 RFC**: [0022](../0022-range-selection.md), [0014](../0014-data-export.md)

## Summary

Provide Excel-compatible TSV copy and paste for grid cells. Copy uses selected rows or the active cell, and paste updates editable cells from the active position. Cell transforms and custom handlers support application-specific formats and restricted clipboard access.

## Problem

Grid users need to move tabular data between AC Grid and spreadsheet applications, and to fill editable grid cells from pasted tabular data. The grid had no clipboard integration for these workflows.

## 概述

支持 Ctrl+C/V 在选区与系统剪贴板间复制粘贴 TSV/CSV，对标 AG Grid Enterprise Clipboard。

## Goals

- Copy selected rows or the active cell to Excel-compatible TSV.
- Paste tabular clipboard content starting at the active cell, updating editable columns.
- Support cell transforms and custom clipboard handlers when native clipboard access is suppressed.
- Integrate with existing row selection and RFC-0009 cell editing. RFC-0022 cell ranges can expand the copy source when implemented.

## Non-goals

- ❌ 富文本/HTML 剪贴板

## API 设计

```typescript
interface GridOptions {
  clipboard?: {
    enabled?: boolean;
    suppressClipboardApi?: boolean;
    processCellForClipboard?: (params: ClipboardCellParams) => string;
    processCellFromClipboard?: (params: ClipboardPasteParams) => unknown;
    copyToClipboard?: (text: string) => void;
    readFromClipboard?: () => string | Promise<string>;
  };
}
```

## Design

使用 `navigator.clipboard` + `document.execCommand` fallback；粘贴解析用纯函数 `parseTsv`.

配置通过 `clipboardConfig`（或 `createGrid({ clipboard })`）提供。复制优先使用选中行及可见列；没有选中行时复制激活单元格。粘贴从激活单元格开始，仅更新可编辑且由 `accessorKey` 定义的单元格。`suppressClipboardApi` 启用 `copyToClipboard` / `readFromClipboard` 自定义处理器。

## Acceptance

- Copying selected rows or one active cell produces TSV compatible with spreadsheet paste.
- Pasting a TSV matrix starts at the active cell and skips cells that are not editable.
- Cell transforms and custom copy/read handlers are exposed through the grid clipboard config.
- `parseTsv` and `serializeTsv` are exported helpers.

## References

- [AG Grid Clipboard](https://www.ag-grid.com/javascript-data-grid/clipboard/)
- [PARITY_MATRIX](../PARITY_MATRIX.md)

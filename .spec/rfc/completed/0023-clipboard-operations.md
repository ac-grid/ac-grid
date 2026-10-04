# RFC-0023: 剪贴板操作 (Clipboard)

**状态**: ✔️ 已完成
**版本**: 1.1.0
**作者**: Albert Li
**日期**: 2026-06-28
**相关 RFC**: [0022](../0022-range-selection.md), [0014](../0014-data-export.md)

## 概述

支持 Ctrl+C/V 在选区与系统剪贴板间复制粘贴 TSV/CSV，对标 AG Grid Enterprise Clipboard。

## 设计目标

- [x] 复制选区为 TSV（Excel 兼容）
- [x] 从剪贴板粘贴更新可编辑单元格
- [x] `suppressClipboardApi` 降级为自定义 handler
- [x] 与现有行选择、0009 单元格编辑集成；使用激活单元格定位粘贴。RFC-0022 的单元格范围选区完成后可直接作为更大复制区域来源。

### 非目标

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

## 实现细节

使用 `navigator.clipboard` + `document.execCommand` fallback；粘贴解析用纯函数 `parseTsv`.

配置通过 `clipboardConfig`（或 `createGrid({ clipboard })`）提供。复制优先使用选中行及可见列；没有选中行时复制激活单元格。粘贴从激活单元格开始，仅更新可编辑且由 `accessorKey` 定义的单元格。`suppressClipboardApi` 启用 `copyToClipboard` / `readFromClipboard` 自定义处理器。

## 参考资料

- [AG Grid Clipboard](https://www.ag-grid.com/javascript-data-grid/clipboard/)
- [PARITY_MATRIX](../PARITY_MATRIX.md)

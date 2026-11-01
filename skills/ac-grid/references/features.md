# AC Grid features

Option keys for `createGrid`. Shapes come from `packages/core/src/utils/create-grid.ts` and the demo bench `demos/react/src/rfcValidationDemos.ts`.

## Implemented

| RFC | Feature | Option |
| --- | --- | --- |
| 0001 | AC Grid architecture | Web Components core, column/row data model, drag-and-drop reordering |
| 0002 | Sorting | `sorting: { enabled: true }`; Shift-click sorts by several columns |
| 0003 | Filtering | `filtering: { enabled: true }`; set `filterType: "text" \| "number"` per column; global search: `grid.setGlobalFilter(text)` |
| 0004 | Column resizing | `resizing: { enabled: true, defaultColumnWidth: 150, minColumnWidth: 60 }` |
| 0005 | Virtual scrolling | `virtualization: { enabled: true, rowHeight: 35, overscan: 5 }` |
| 0006 | Pagination | `pagination: { enabled: true, pageSize: 20, pageSizeOptions: [10, 20, 50] }` |
| 0007 | Row selection | `selection: { enabled: true, mode: "multiple", enableCheckbox: true }`; read with `grid.getSelectedRowIds()` |
| 0008 | Column pinning | `pinning: { enabled: true, initialState: { left: ["selection", "firstName"], right: ["progress"] } }` |
| 0009 | Cell editing | `grid.editingConfig = { enabled: true, mode: "doubleClick" }`; Enter saves, Escape cancels |
| 0010 | Grouping and aggregation | `grouping: { enabled: true, initialGrouping: ["status"], initialExpanded: true }`; column `aggregationFn`; `grid.expandAll()`, `grid.collapseAll()` |
| 0011 | Advanced themes | `theme: "light"`, `themeTransition: true`, `themeTransitionDuration: 150`; `grid.previewTheme(name)`, `grid.cancelPreview()`, `grid.applyTheme(name)` |
| 0012 | Keyboard navigation | `enableKeyboardNavigation: true`, `keyboardNavigationMode` |
| 0013 | Accessibility | `role="grid"`/`columnheader`/`gridcell` with `aria-rowindex`, `aria-colindex`, `aria-sort`, `aria-selected`; live `role="status"` announces sorting; options `ariaLabel`, `ariaDescription` |
| 0014 | Data export | `grid.exportToCSV({ fileName, exportMode: "all" \| "selected" \| "visible", includeHeaders, columns, formatter })` |
| 0015 | Internationalization | `i18n: { locale: "zh-CN", messages: zhCN.messages }` |
| 0016 | Theme system | CSS variables such as `--ac-grid-bg-header`; built-in themes `light`, `dark`, `ocean`, `forest`, `sunset`, `bamboo`, `violet` |
| 0019 | Custom components | `components: { noRowsOverlayComponent, fullWidthRowComponent, isFullWidthRow, isLoading }`; column `headerComponent` |
| 0022 | Range selection | `rangeSelection: { enabled: true }`; read with `grid.getCellRanges()` |
| 0023 | Clipboard | `clipboard: { enabled: true, suppressClipboardApi, copyToClipboard, readFromClipboard, processCellForClipboard, processCellFromClipboard }`; Ctrl/Cmd+C copies the clicked cell, Ctrl/Cmd+V pastes from it |
| 0030 | Formulas | `createFormulaEngineFromMatrix(matrix)` then `engine.getValue(row, col)`; cycles return `#CYCLE!` |
| 0047 | Sorting disable | `sorting: { enabled: false }` turns sorting off for every column: header clicks do not reorder rows and no sort indicator renders |

## Not implemented (draft or stretch)

0014 data export, 0017 framework bindings, 0018 state API, 0020 tree data, 0021 master-detail, 0024 pivot, 0025 advanced Excel export, 0026 context menu, 0027 tool panels, 0028 advanced filtering, 0029 charts, 0031 server-side row model, 0032 AI toolkit.

When one of these is implemented, add its row above and bump `version` in `skill-release.json`.

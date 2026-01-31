// 导出类型
export type {
    Table,
    Header,
    Row,
    Cell,
    SortingState,
    SortingFn,
} from "@tanstack/table-core";
export type { ColumnDef } from "./types/column";
// @ts-ignore - .wsx 文件在构建时会被处理
export type { GridSortingConfig } from "./components/Grid.wsx";
export type {
    FilterState,
    FilterFn,
    FilterType,
    GridFilteringConfig,
} from "./types/filtering";
export type { GridResizingConfig } from "./types/resizing";
export type { GridVirtualizationConfig } from "./types/virtualization";
export type { GridPaginationConfig } from "./types/pagination";
export type { GridSelectionConfig } from "./types/selection";
export type { GridPinningConfig } from "./types/pinning";
export type { GridEditingConfig } from "./types/editing";
export type { GridGroupingConfig } from "./types/grouping";

// 导出组件
// @ts-ignore - .wsx 文件在构建时会被处理
export { Grid } from "./components/Grid.wsx";
// @ts-ignore
export { DraggableHandler } from "./components/DraggableHandler.wsx";
// @ts-ignore
export { DraggableTableHeader } from "./components/DraggableTableHeader.wsx";
// @ts-ignore
export { DraggableTableRow } from "./components/DraggableTableRow.wsx";
// @ts-ignore
export { DraggableTableCell } from "./components/DraggableTableCell.wsx";
// @ts-ignore
export { SortingIndicator } from "./components/SortingIndicator.wsx";
// @ts-ignore
export { FilterIcon } from "./components/FilterIcon.wsx";
// @ts-ignore
export { FilterMenu } from "./components/FilterMenu.wsx";
// @ts-ignore
export { GlobalSearch } from "./components/GlobalSearch.wsx";
// @ts-ignore
export { PaginationControls } from "./components/PaginationControls.wsx";
// @ts-ignore
export { SelectionCheckbox } from "./components/SelectionCheckbox.wsx";
// @ts-ignore
export { CellEditor } from "./components/CellEditor.wsx";

// 导出工具函数
export { arrayMove } from "./utils/array-move";
export { createGrid } from "./utils/create-grid";
export type { CreateGridOptions } from "./utils/create-grid";
export {
    defaultTextFilter,
    numberFilter,
    dateFilter,
} from "./utils/filter-functions";

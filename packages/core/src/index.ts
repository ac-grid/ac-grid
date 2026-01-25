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

// 导入组件以触发注册（.wsx 文件在构建时会被处理）
// @ts-ignore - .wsx 文件在构建时会被处理
import "./components/Grid.wsx";
// @ts-ignore
import "./components/DraggableHandler.wsx";
// @ts-ignore
import "./components/DraggableTableHeader.wsx";
// @ts-ignore
import "./components/DraggableTableRow.wsx";
// @ts-ignore
import "./components/DraggableTableCell.wsx";
// @ts-ignore
import "./components/SortingIndicator.wsx";
// @ts-ignore
import "./components/FilterIcon.wsx";
// @ts-ignore
import "./components/FilterMenu.wsx";
// @ts-ignore
import "./components/GlobalSearch.wsx";

// 导出工具函数
export { arrayMove } from "./utils/array-move";
export { createGrid } from "./utils/create-grid";
export type { CreateGridOptions } from "./utils/create-grid";
export {
    defaultTextFilter,
    numberFilter,
    dateFilter,
} from "./utils/filter-functions";
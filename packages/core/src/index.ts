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
export type {
    GridPaginationConfig,
    PaginationState,
    PaginationInfo,
    PaginatedData,
} from "./types/pagination";
export type { GridSelectionConfig } from "./types/selection";
export type { GridPinningConfig } from "./types/pinning";
export type {
    GridEditingConfig,
    EditorProps,
    EditorType,
    EditTrigger,
} from "./types/editing";
export {
    AGGREGATION_FN_SUM,
    AGGREGATION_FN_AVG,
    AGGREGATION_FN_COUNT,
    AGGREGATION_FN_MIN,
    AGGREGATION_FN_MAX,
} from "./types/grouping";
export type {
    GridAggregationFn,
    GridAggregationName,
    GridGroupingConfig,
} from "./types/grouping";
export type {
    ComponentType,
    ComponentRenderFn,
    GridComponentsConfig,
    HeaderComponentParams,
    FilterComponentParams,
    OverlayComponentParams,
    FullWidthRowComponentParams,
} from "./types/components";
export type {
    A1Range,
    CellAddress,
    CellRawValue,
    CellRefToken,
    FormulaDataSource,
    FormulaError,
    FormulaErrorCode,
    FormulaParseResult,
    FormulaValue,
    GridFormulasConfig,
} from "./types/formulas";

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
// @ts-ignore - 自定义下拉组件
export { Dropdown } from "./components/Dropdown.wsx";
// @ts-ignore
export type { DropdownOption, DropdownProps } from "./components/Dropdown.wsx";

// 导出工具函数
export { arrayMove } from "./utils/array-move";
export { createGrid } from "./utils/create-grid";
export type { CreateGridOptions } from "./utils/create-grid";
export {
    defaultTextFilter,
    numberFilter,
    dateFilter,
} from "./utils/filter-functions";
export {
    calculateVisibleRange,
    scrollToRow,
    getVisibleRowRange,
    createScrollHandler,
} from "./utils/virtual-scroll";
export {
    clampColumnWidth,
    calculateColumnContentWidth,
    findColumnDefById,
    getColumnSizeBounds,
    measureTextWidth,
    resolveColumnId,
} from "./utils/column-sizing";
export {
    computeTotalPages,
    clampPageIndex,
    computePageRange,
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_SIZE_OPTIONS,
} from "./utils/pagination";
export { Virtualizer } from "./utils/virtualizer";
export {
    appendRowSelection,
    buildRangeSelection,
    buildSelectAllSelection,
    buildSingleSelection,
    getSelectedRowIdsFromState,
    removeRowSelection,
} from "./utils/selection-utils";
export type { RowIdentifier } from "./utils/selection-utils";
export {
    cellAddressToA1,
    cellKey,
    cellRefTokenToA1,
    columnIndexToLetters,
    expandRange,
    lettersToColumnIndex,
    parseA1Cell,
    parseA1Range,
    parseCellKey,
    rangeToA1,
} from "./utils/a1-notation";
export {
    evaluateFormula,
    evaluateParsedFormula,
    isFormula,
    isFormulaError,
    normalizeFormula,
    parseFormula,
    FORMULA_FN_AVG,
    FORMULA_FN_AVERAGE,
    FORMULA_FN_COUNT,
    FORMULA_FN_MAX,
    FORMULA_FN_MIN,
    FORMULA_FN_SUM,
} from "./utils/formula-parser";
export {
    buildDependentsIndex,
    clearDependencies,
    collectAffectedCells,
    setDependencies,
    topologicalSortAffected,
} from "./utils/formula-graph";
export type { DependencyMap, TopoResult } from "./utils/formula-graph";
export {
    FormulaEngine,
    InMemoryFormulaStore,
    createFormulaEngineFromMatrix,
} from "./utils/formula-engine";
export {
    applyColumnDefPins,
    buildColumnPinningFromDefs,
    pinColumnInState,
    reorderPinnedOnColumnDrag,
} from "./utils/pinning-utils";
export {
    coerceEditorValue,
    isColumnEditable,
    isCustomEditor,
    resolveEditorType,
    supportsDoubleClickTrigger,
    supportsEnterTrigger,
    validateEditValue,
} from "./utils/editing-utils";
export type { EditValidationResult } from "./utils/editing-utils";
export {
    registerComponent,
    registerComponents,
    getRegisteredComponent,
    unregisterComponent,
    clearComponentRegistry,
    resolveComponentRef,
} from "./utils/component-registry";
export { ComponentPortal } from "./utils/component-portal";
export { renderComponent } from "./utils/render-component";
export { resolveHeaderContent } from "./utils/resolve-header-content";

import type { ColumnDef } from "./column";
import type { SortingState } from "@tanstack/table-core";
import type { GridFilteringConfig } from "./filtering";
import type { GridResizingConfig } from "./resizing";
import type { GridVirtualizationConfig } from "./virtualization";
import type { GridPaginationConfig } from "./pagination";
import type { GridSelectionConfig } from "./selection";
import type { GridClipboardConfig } from "./clipboard";
import type { GridRangeSelectionConfig } from "./range-selection";
import type { GridPinningConfig } from "./pinning";
import type { GridEditingConfig } from "./editing";
import type { GridGroupingConfig } from "./grouping";
import type { GridI18nConfig } from "./i18n";
import type { GridStatePersistence } from "./grid-state";
import type { KeyboardNavigationMode } from "../utils/keyboard-navigation";

export interface GridConfiguration {
  sortingConfig?: {
    enabled?: boolean;
    multiColumn?: boolean;
    initialState?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
  };
  filteringConfig?: GridFilteringConfig;
  resizingConfig?: GridResizingConfig;
  virtualizationConfig?: GridVirtualizationConfig;
  paginationConfig?: GridPaginationConfig;
  selectionConfig?: GridSelectionConfig;
  clipboardConfig?: GridClipboardConfig;
  rangeSelectionConfig?: GridRangeSelectionConfig;
  pinningConfig?: GridPinningConfig;
  editingConfig?: GridEditingConfig;
  groupingConfig?: GridGroupingConfig;
  i18nConfig?: GridI18nConfig;
  statePersistence?: GridStatePersistence;
  className?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  enableKeyboardNavigation?: boolean;
  keyboardNavigationMode?: KeyboardNavigationMode;
}

export interface FrameworkGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  gridProps?: GridConfiguration;
}

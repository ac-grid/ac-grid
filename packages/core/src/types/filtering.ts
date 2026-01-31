import type { Row } from "@tanstack/table-core";

export interface FilterState {
    globalFilter?: string;
    columnFilters: Record<string, string>;
}

export type FilterFn<TData> = (
    row: Row<TData>,
    columnId: string,
    filterValue: unknown
) => boolean;

export type FilterType = "text" | "number" | "date" | "custom";

export interface GridFilteringConfig {
    enabled?: boolean;
    initialGlobalFilter?: string;
    initialColumnFilters?: Record<string, string>;
    onFilterChange?: (filterState: FilterState) => void;
}

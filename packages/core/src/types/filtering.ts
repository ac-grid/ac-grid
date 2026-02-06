import type { Row } from "@tanstack/table-core";

/**
 * 过滤操作符类型
 */
export type FilterOperator =
  // 文本操作符
  | "contains"
  | "notContains"
  | "equals"
  | "notEqual"
  | "startsWith"
  | "endsWith"
  | "blank"
  | "notBlank"
  // 数字操作符
  | "greaterThan"
  | "lessThan";

/**
 * 过滤条件对象
 * 包含过滤值和操作符
 */
export interface FilterCondition {
  /** 过滤值 */
  value: string;
  /** 过滤操作符 */
  operator: FilterOperator;
}

export interface FilterState {
  globalFilter?: string;
  /**
   * 列过滤条件
   * - FilterCondition 对象：完整过滤条件（推荐）
   * - string：简单过滤值，默认操作符为 'contains'（向后兼容）
   */
  columnFilters: Record<string, FilterCondition | string>;
}

export type FilterFn<TData> = (
  row: Row<TData>,
  columnId: string,
  filterValue: FilterCondition | string | unknown,
) => boolean;

export type FilterType = "text" | "number" | "date" | "custom";

export interface GridFilteringConfig {
  enabled?: boolean;
  initialGlobalFilter?: string;
  initialColumnFilters?: Record<string, FilterCondition | string>;
  onFilterChange?: (filterState: FilterState) => void;
  floatingFilter?: boolean;
}

import type { Row } from "@tanstack/table-core";

/**
 * 过滤状态接口
 */
export interface FilterState {
    /**
     * 全局过滤值（搜索所有列）
     */
    globalFilter?: string;
    /**
     * 列过滤值（按列 ID 索引）
     */
    columnFilters: Record<string, string>;
}

/**
 * 过滤函数类型
 * @param row - 行数据
 * @param columnId - 列 ID
 * @param filterValue - 过滤值
 * @returns 是否匹配（true 表示显示该行）
 */
export type FilterFn<TData> = (
    row: Row<TData>,
    columnId: string,
    filterValue: unknown
) => boolean;

/**
 * 过滤类型
 */
export type FilterType = "text" | "number" | "date" | "custom";

/**
 * 过滤配置接口
 */
export interface GridFilteringConfig {
    /**
     * 是否启用过滤（默认：false）
     */
    enabled?: boolean;
    /**
     * 初始全局过滤值
     */
    initialGlobalFilter?: string;
    /**
     * 初始列过滤状态
     */
    initialColumnFilters?: Record<string, string>;
    /**
     * 过滤状态变化回调
     */
    onFilterChange?: (filterState: FilterState) => void;
}

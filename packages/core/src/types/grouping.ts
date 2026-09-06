import type { ExpandedState, GroupingState } from "@tanstack/table-core";

export const AGGREGATION_FN_SUM = "sum";
export const AGGREGATION_FN_AVG = "avg";
export const AGGREGATION_FN_COUNT = "count";
export const AGGREGATION_FN_MIN = "min";
export const AGGREGATION_FN_MAX = "max";

export type GridAggregationName =
    | typeof AGGREGATION_FN_SUM
    | typeof AGGREGATION_FN_AVG
    | typeof AGGREGATION_FN_COUNT
    | typeof AGGREGATION_FN_MIN
    | typeof AGGREGATION_FN_MAX;

/**
 * Aggregates the leaf values for one column and group.
 */
export type GridAggregationFn<TValue = unknown, TResult = unknown> = (
    values: TValue[],
) => TResult;

export interface GridGroupingConfig {
    /**
     * 是否启用分组（默认：false）
     */
    enabled?: boolean;
    /**
     * 初始分组状态（列 ID 列表）
     */
    initialGrouping?: string[];
    /**
     * 初始展开状态
     */
    initialExpanded?: ExpandedState;
    /**
     * 分组状态变化回调
     */
    onGroupingChange?: (grouping: GroupingState) => void;
    /**
     * 展开状态变化回调
     */
    onExpandedChange?: (expanded: ExpandedState) => void;
}

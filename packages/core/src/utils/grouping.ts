import type {
    AggregationFn,
    ColumnDef as TanStackColumnDef,
    ExpandedState,
    Row,
} from "@tanstack/table-core";
import {
    AGGREGATION_FN_AVG,
    type GridAggregationFn,
    type GridAggregationName,
} from "../types/grouping";

const TANSTACK_AGGREGATION_FN_MEAN = "mean";
const TANSTACK_AGGREGATION_FN_MIN_ARGUMENTS = 2;

export type GroupingColumnDef<TData, TValue = unknown> = Omit<
    TanStackColumnDef<TData, TValue>,
    "aggregationFn"
> & {
    aggregationFn?:
        | GridAggregationName
        | GridAggregationFn<TValue>
        | AggregationFn<TData>;
};

/**
 * Adapts the public value-array callback to TanStack Table's row callback.
 */
export const createAggregationFn = <TData, TValue>(
    aggregateValues: GridAggregationFn<TValue>,
): AggregationFn<TData> => {
    return (columnId, leafRows) =>
        aggregateValues(leafRows.map((row) => row.getValue<TValue>(columnId)));
};

/**
 * Resolves AC Grid aggregation names and callbacks to TanStack column options.
 */
export const resolveGroupingColumn = <TData, TValue>(
    column: GroupingColumnDef<TData, TValue>,
): TanStackColumnDef<TData, TValue> => {
    if (column.aggregationFn === undefined) {
        return column as TanStackColumnDef<TData, TValue>;
    }

    const aggregationFn =
        column.aggregationFn === AGGREGATION_FN_AVG
            ? TANSTACK_AGGREGATION_FN_MEAN
            : typeof column.aggregationFn === "function"
              ? column.aggregationFn.length >=
                TANSTACK_AGGREGATION_FN_MIN_ARGUMENTS
                  ? column.aggregationFn
                  : createAggregationFn(
                        column.aggregationFn as GridAggregationFn<TValue>,
                    )
              : column.aggregationFn;

    return {
        ...column,
        aggregationFn,
    } as TanStackColumnDef<TData, TValue>;
};

/**
 * Converts the special expanded-all state into explicit group row entries.
 */
export const materializeExpandedState = <TData>(
    rows: Row<TData>[],
    expanded: ExpandedState,
): Record<string, boolean> => {
    if (expanded !== true) {
        return { ...expanded };
    }

    return Object.fromEntries(
        rows.filter((row) => row.getCanExpand()).map((row) => [row.id, true]),
    );
};

/**
 * Counts data leaves without including descendant group rows.
 */
export const getGroupLeafRowCount = <TData>(row: Row<TData>): number =>
    row.getLeafRows().filter((leafRow) => !leafRow.getIsGrouped()).length;

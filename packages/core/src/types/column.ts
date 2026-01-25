import type { ColumnDef as TanStackColumnDef } from "@tanstack/table-core";
import type { FilterFn, FilterType } from "./filtering";

/**
 * 扩展 TanStack ColumnDef 以支持 AC Grid 的功能
 */
export type ColumnDef<TData, TValue = unknown> = TanStackColumnDef<
    TData,
    TValue
> & {
    /**
     * 过滤类型
     */
    filterType?: FilterType;
    /**
     * 是否启用本列过滤
     */
    enableColumnFilter?: boolean;
    /**
     * 自定义过滤函数
     */
    filterFn?: FilterFn<TData>;
};

import type { ColumnDef as TanStackColumnDef, Row } from "@tanstack/table-core";
import type { FilterFn, FilterType } from "./filtering";
import type { EditorProps, EditorType } from "./editing";
import type { ComponentType } from "./components";
import type { GridAggregationFn, GridAggregationName } from "./grouping";

type Override<T, TOverride> = T extends unknown
    ? Omit<T, keyof TOverride> & TOverride
    : never;

/**
 * 扩展 TanStack ColumnDef 以支持 AC Grid 的功能
 */
export type ColumnDef<TData, TValue = unknown> = Override<
    TanStackColumnDef<TData, TValue>,
    {
        /**
         * Built-in aggregation name or custom leaf-value aggregator.
         */
        aggregationFn?: GridAggregationName | GridAggregationFn<TValue>;
    }
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
    /**
     * 是否允许本列输入 / 求值公式（RFC-0030）
     */
    allowFormula?: boolean;
    /**
     * 列固定位置（RFC-0008）
     */
    pin?: "left" | "right" | false;
    /**
     * 是否启用本列单元格编辑（默认：true，当 grid editing 启用时）
     */
    enableEditing?: boolean;
    /**
     * 编辑器类型或自定义编辑器渲染函数
     */
    editor?: EditorType | ((props: EditorProps<TData>) => unknown);
    /**
     * 编辑验证；返回 true 通过，false 或字符串为失败
     */
    validateEdit?: (value: unknown, row: Row<TData>) => boolean | string;
    /** 自定义表头组件（RFC-0019） */
    headerComponent?: ComponentType;
    headerComponentParams?: Record<string, unknown>;
    /** 自定义列过滤器 UI（RFC-0019） */
    filterComponent?: ComponentType;
    filterComponentParams?: Record<string, unknown>;
};

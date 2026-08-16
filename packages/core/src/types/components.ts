import type { HeaderContext, Row } from "@tanstack/table-core";

/** 自定义组件渲染函数 — 返回 DOM 节点或文本内容 */
export type ComponentRenderFn<TParams = Record<string, unknown>> = (
    params: TParams,
) => HTMLElement | string | number | null | undefined;

/** 组件类型：渲染函数或已注册组件名称 / 自定义元素标签名 */
export type ComponentType<TParams = Record<string, unknown>> =
    | string
    | ComponentRenderFn<TParams>;

/** 表头自定义组件参数 */
export interface HeaderComponentParams<TData = unknown, TValue = unknown> {
    displayName?: string;
    column: unknown;
    context: HeaderContext<TData, TValue>;
    [key: string]: unknown;
}

/** 过滤器自定义组件参数 */
export interface FilterComponentParams {
    column: unknown;
    value: unknown;
    onFilterChange: (value: unknown) => void;
    onClose?: () => void;
    [key: string]: unknown;
}

/** 遮罩层自定义组件参数 */
export interface OverlayComponentParams {
    [key: string]: unknown;
}

/** 全宽行自定义组件参数 */
export interface FullWidthRowComponentParams<TData = unknown> {
    row: Row<TData>;
    [key: string]: unknown;
}

/** Grid 级自定义组件配置（RFC-0019） */
export interface GridComponentsConfig<TData = unknown> {
    loadingOverlayComponent?: ComponentType<OverlayComponentParams>;
    noRowsOverlayComponent?: ComponentType<OverlayComponentParams>;
    isFullWidthRow?: (row: Row<TData>) => boolean;
    fullWidthRowComponent?: ComponentType<FullWidthRowComponentParams<TData>>;
    isLoading?: boolean;
}

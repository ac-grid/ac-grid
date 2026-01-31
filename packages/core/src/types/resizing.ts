import type { ColumnSizingState } from "@tanstack/table-core";

/**
 * 列调整大小配置接口
 */
export interface GridResizingConfig {
    /**
     * 是否启用列调整大小（默认：false）
     */
    enabled?: boolean;
    /**
     * 默认列宽（默认：150）
     */
    defaultColumnWidth?: number;
    /**
     * 最小列宽（默认：20）
     */
    minColumnWidth?: number;
    /**
     * 最大列宽（默认：Number.MAX_SAFE_INTEGER）
     */
    maxColumnWidth?: number;
    /**
     * 初始列宽状态
     */
    initialColumnSizing?: ColumnSizingState;
    /**
     * 列宽状态变化回调
     */
    onColumnSizingChange?: (columnSizing: ColumnSizingState) => void;
}

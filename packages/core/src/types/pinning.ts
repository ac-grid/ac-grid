import type { ColumnPinningState } from "@tanstack/table-core";

export interface GridPinningConfig {
    /**
     * 是否启用列固定（默认：false）
     */
    enabled?: boolean;
    /**
     * 初始固定状态
     */
    initialState?: ColumnPinningState;
    /**
     * 固定状态变化回调
     */
    onPinningChange?: (pinning: ColumnPinningState) => void;
}

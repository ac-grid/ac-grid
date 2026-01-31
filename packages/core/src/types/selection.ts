import type { RowSelectionState } from "@tanstack/table-core";

export interface GridSelectionConfig {
    /**
     * 是否启用行选择（默认：false）
     */
    enabled?: boolean;
    /**
     * 选择模式（默认：'single'）
     */
    mode?: 'single' | 'multiple';
    /**
     * 是否启用选择复选框列（默认：true，仅在 multiple 模式下有效）
     */
    enableCheckbox?: boolean;
    /**
     * 初始选中行 ID 集合
     */
    initialRowSelection?: RowSelectionState;
    /**
     * 选择状态变化回调
     */
    onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
}

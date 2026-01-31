import type { GroupingState } from "@tanstack/table-core";

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
    initialExpanded?: boolean | Record<string, boolean>;
    /**
     * 分组状态变化回调
     */
    onGroupingChange?: (grouping: GroupingState) => void;
    /**
     * 展开状态变化回调
     */
    onExpandedChange?: (expanded: Record<string, boolean>) => void;
}

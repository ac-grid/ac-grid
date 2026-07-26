import type { Row } from "@tanstack/table-core";

/** 内置编辑器类型 */
export type EditorType = "text" | "number" | "date";

/** 编辑触发方式 */
export type EditTrigger = "doubleClick" | "enter" | "both";

export interface EditorProps<TData = unknown> {
    value: unknown;
    onChange: (value: unknown) => void;
    onSave: (value: unknown) => void;
    onCancel: () => void;
    row: Row<TData>;
    columnId: string;
    error?: string;
}

export interface GridEditingConfig {
    /**
     * 是否启用单元格编辑（默认：false）
     */
    enabled?: boolean;
    /**
     * 编辑触发方式（默认：'doubleClick'）
     * @deprecated 使用 editTrigger；mode 保留以兼容旧配置
     */
    mode?: "doubleClick" | "click";
    /**
     * 编辑触发方式（默认：'doubleClick'）
     */
    editTrigger?: EditTrigger;
    /**
     * 编辑开始回调
     */
    onEditStart?: (rowId: string, columnId: string) => void;
    /**
     * 编辑结束回调（保存）
     */
    onEditSave?: (rowId: string, columnId: string, value: unknown) => void;
    /**
     * 编辑取消回调
     */
    onEditCancel?: (rowId: string, columnId: string) => void;
}

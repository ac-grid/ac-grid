import type { Row } from "@tanstack/table-core";

export interface EditorProps {
    value: unknown;
    onChange: (value: unknown) => void;
    onSave: () => void;
    onCancel: () => void;
    row: Row<any>;
    columnId: string;
}

export interface GridEditingConfig {
    /**
     * 是否启用单元格编辑（默认：false）
     */
    enabled?: boolean;
    /**
     * 编辑触发方式（默认：'doubleClick'）
     */
    mode?: 'doubleClick' | 'click';
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

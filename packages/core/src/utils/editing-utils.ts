import type { Row } from "@tanstack/table-core";
import type { ColumnDef } from "../types/column";
import type { EditorType, EditTrigger } from "../types/editing";

export interface EditValidationResult {
    valid: boolean;
    error?: string;
}

/** 判断列是否允许编辑 */
export function isColumnEditable(
    columnDef: ColumnDef<unknown> | undefined,
    editingEnabled: boolean,
): boolean {
    if (!editingEnabled || !columnDef) {
        return false;
    }
    return columnDef.enableEditing !== false;
}

/** 从列定义解析编辑器类型，回退到 filterType */
export function resolveEditorType(
    columnDef: ColumnDef<unknown> | undefined,
): EditorType {
    const editor = columnDef?.editor;
    if (editor === "text" || editor === "number" || editor === "date") {
        return editor;
    }
    if (columnDef?.filterType === "number") {
        return "number";
    }
    if (columnDef?.filterType === "date") {
        return "date";
    }
    return "text";
}

/** 判断列是否使用自定义编辑器函数 */
export function isCustomEditor(
    columnDef: ColumnDef<unknown> | undefined,
): columnDef is ColumnDef<unknown> & { editor: (props: unknown) => unknown } {
    return typeof columnDef?.editor === "function";
}

/** 校验编辑值；validateEdit 返回 false 或错误字符串时视为无效 */
export function validateEditValue<TData>(
    value: unknown,
    row: Row<TData> | undefined,
    validateEdit?: ColumnDef<TData>["validateEdit"],
): EditValidationResult {
    if (!validateEdit || !row) {
        return { valid: true };
    }

    const result = validateEdit(value, row);
    if (result === true) {
        return { valid: true };
    }
    if (result === false) {
        return { valid: false, error: "Invalid value" };
    }
    return { valid: false, error: result };
}

/** 按编辑器类型将字符串输入转为对应值 */
export function coerceEditorValue(value: unknown, editorType: EditorType): unknown {
    if (editorType === "number") {
        if (value === "" || value === null || value === undefined) {
            return null;
        }
        const parsed = Number(value);
        return Number.isNaN(parsed) ? value : parsed;
    }
    if (editorType === "date") {
        return value === "" ? null : String(value);
    }
    return value === null || value === undefined ? "" : String(value);
}

/** 判断 editTrigger 是否包含双击触发 */
export function supportsDoubleClickTrigger(trigger: EditTrigger | undefined): boolean {
    const mode = trigger ?? "doubleClick";
    return mode === "doubleClick" || mode === "both";
}

/** 判断 editTrigger 是否包含 Enter 触发 */
export function supportsEnterTrigger(trigger: EditTrigger | undefined): boolean {
    const mode = trigger ?? "doubleClick";
    return mode === "enter" || mode === "both";
}

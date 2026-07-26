import type { ColumnPinningState } from "@tanstack/table-core";
import { arrayMove } from "./array-move";
import { findColumnDefById, resolveColumnId } from "./column-sizing";
import type { ColumnDef } from "../types/column";

/** 从列定义中提取固定配置（保持列定义顺序） */
export function buildColumnPinningFromDefs(
    columns: ColumnDef<unknown, unknown>[],
): ColumnPinningState {
    const left: string[] = [];
    const right: string[] = [];

    for (const column of columns) {
        const pin = (column as ColumnDef<unknown, unknown> & { pin?: "left" | "right" | false }).pin;
        if (!pin) {
            continue;
        }
        const columnId = resolveColumnId(column);
        if (!columnId) {
            continue;
        }
        if (pin === "left") {
            left.push(columnId);
        } else if (pin === "right") {
            right.push(columnId);
        }
    }

    return { left, right };
}

/**
 * 合并列定义 pin 与当前/初始固定状态：
 * - 列定义上的 pin 优先
 * - 无 pin 定义的列保留当前手动固定
 */
export function applyColumnDefPins(
    columns: ColumnDef<unknown, unknown>[],
    current: ColumnPinningState,
): ColumnPinningState {
    const fromDefs = buildColumnPinningFromDefs(columns);
    const defPinnedIds = new Set([...(fromDefs.left ?? []), ...(fromDefs.right ?? [])]);

    const manualLeft = (current.left ?? []).filter((columnId) => {
        const columnDef = findColumnDefById(columns, columnId);
        const pin = (columnDef as { pin?: "left" | "right" | false } | undefined)?.pin;
        return !pin && !defPinnedIds.has(columnId);
    });

    const manualRight = (current.right ?? []).filter((columnId) => {
        const columnDef = findColumnDefById(columns, columnId);
        const pin = (columnDef as { pin?: "left" | "right" | false } | undefined)?.pin;
        return !pin && !defPinnedIds.has(columnId);
    });

    return {
        left: [...(fromDefs.left ?? []), ...manualLeft],
        right: [...(fromDefs.right ?? []), ...manualRight],
    };
}

/** 编程式固定/取消固定单列 */
export function pinColumnInState(
    state: ColumnPinningState,
    columnId: string,
    position: "left" | "right" | false,
): ColumnPinningState {
    const next: ColumnPinningState = {
        left: (state.left ?? []).filter((id) => id !== columnId),
        right: (state.right ?? []).filter((id) => id !== columnId),
    };

    if (position === "left") {
        next.left = [...(next.left ?? []), columnId];
    } else if (position === "right") {
        next.right = [...(next.right ?? []), columnId];
    }

    return next;
}

/** 固定列拖拽重排：仅在同侧固定区内调整顺序 */
export function reorderPinnedOnColumnDrag(
    state: ColumnPinningState,
    activeId: string,
    overId: string,
): ColumnPinningState {
    const left = state.left ?? [];
    const right = state.right ?? [];

    if (left.includes(activeId) && left.includes(overId)) {
        return {
            ...state,
            left: arrayMove(left, left.indexOf(activeId), left.indexOf(overId)),
        };
    }

    if (right.includes(activeId) && right.includes(overId)) {
        return {
            ...state,
            right: arrayMove(right, right.indexOf(activeId), right.indexOf(overId)),
        };
    }

    return state;
}

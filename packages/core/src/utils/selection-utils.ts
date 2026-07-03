import type { RowSelectionState } from "@tanstack/table-core";

export interface RowIdentifier {
    id: string;
}

/** 单选模式：仅保留目标行 */
export function buildSingleSelection(rowId: string): RowSelectionState {
    return { [rowId]: true };
}

/** 多选模式：在现有选择上追加一行 */
export function appendRowSelection(
    current: RowSelectionState,
    rowId: string,
): RowSelectionState {
    return { ...current, [rowId]: true };
}

/** 从选择状态中移除一行 */
export function removeRowSelection(
    current: RowSelectionState,
    rowId: string,
): RowSelectionState {
    const next = { ...current };
    delete next[rowId];
    return next;
}

/**
 * Shift + 点击范围选择：选中 anchor 与 target 之间（含两端）的所有行。
 * 若 anchor 或 target 不在 rows 中，则仅追加 target。
 */
export function buildRangeSelection(
    rows: RowIdentifier[],
    anchorId: string,
    targetId: string,
    existing: RowSelectionState = {},
): RowSelectionState {
    const anchorIndex = rows.findIndex((row) => row.id === anchorId);
    const targetIndex = rows.findIndex((row) => row.id === targetId);

    if (anchorIndex === -1 || targetIndex === -1) {
        return appendRowSelection(existing, targetId);
    }

    const start = Math.min(anchorIndex, targetIndex);
    const end = Math.max(anchorIndex, targetIndex);
    const next: RowSelectionState = { ...existing };

    for (let index = start; index <= end; index++) {
        next[rows[index].id] = true;
    }

    return next;
}

/** 全选当前行模型中的所有行 */
export function buildSelectAllSelection(rows: RowIdentifier[]): RowSelectionState {
    const next: RowSelectionState = {};
    for (const row of rows) {
        next[row.id] = true;
    }
    return next;
}

/** 从 RowSelectionState 提取已选行 ID */
export function getSelectedRowIdsFromState(state: RowSelectionState): string[] {
    return Object.keys(state).filter((id) => state[id]);
}

/**
 * A1 记法编解码（RFC-0030 / 与 0022 选区引用对齐）。
 * 列：0 → A, 25 → Z, 26 → AA；行：0-based 内部 ↔ 1-based A1。
 */

import type { A1Range, CellAddress, CellRefToken } from "../types/formulas";

const A1_CELL_RE =
    /^(\$?)([A-Za-z]+)(\$?)([1-9][0-9]*)$/;

const COLUMN_BASE = 26;
const CHAR_CODE_A = 65;

/** 0-based 列索引 → 列字母（A, B, …, Z, AA, …） */
export function columnIndexToLetters(col: number): string {
    if (col < 0 || !Number.isInteger(col)) {
        throw new RangeError(`Invalid column index: ${col}`);
    }
    let n = col + 1;
    let letters = "";
    while (n > 0) {
        const rem = (n - 1) % COLUMN_BASE;
        letters = String.fromCharCode(CHAR_CODE_A + rem) + letters;
        n = Math.floor((n - 1) / COLUMN_BASE);
    }
    return letters;
}

/** 列字母 → 0-based 列索引 */
export function lettersToColumnIndex(letters: string): number {
    const upper = letters.toUpperCase();
    if (!/^[A-Z]+$/.test(upper)) {
        throw new RangeError(`Invalid column letters: ${letters}`);
    }
    let col = 0;
    for (let i = 0; i < upper.length; i++) {
        col = col * COLUMN_BASE + (upper.charCodeAt(i) - CHAR_CODE_A + 1);
    }
    return col - 1;
}

/** CellAddress → A1 字符串（相对引用） */
export function cellAddressToA1(address: CellAddress): string {
    return `${columnIndexToLetters(address.col)}${address.row + 1}`;
}

/** CellRefToken → A1（含 $） */
export function cellRefTokenToA1(ref: CellRefToken): string {
    const colPart = `${ref.absCol ? "$" : ""}${columnIndexToLetters(ref.col)}`;
    const rowPart = `${ref.absRow ? "$" : ""}${ref.row + 1}`;
    return `${colPart}${rowPart}`;
}

/**
 * 解析单个 A1 引用。失败返回 null。
 */
export function parseA1Cell(input: string): CellRefToken | null {
    const trimmed = input.trim();
    const match = A1_CELL_RE.exec(trimmed);
    if (!match) {
        return null;
    }
    const [, absColMark, letters, absRowMark, rowText] = match;
    try {
        const col = lettersToColumnIndex(letters);
        const row = Number(rowText) - 1;
        if (row < 0) {
            return null;
        }
        return {
            col,
            row,
            absCol: absColMark === "$",
            absRow: absRowMark === "$",
        };
    } catch {
        return null;
    }
}

/**
 * 解析 `A1:B3` 或单个 `A1`。起止顺序不要求。
 */
export function parseA1Range(input: string): A1Range | null {
    const trimmed = input.trim();
    const parts = trimmed.split(":");
    if (parts.length === 1) {
        const cell = parseA1Cell(parts[0]);
        if (!cell) {
            return null;
        }
        return {
            start: { row: cell.row, col: cell.col },
            end: { row: cell.row, col: cell.col },
        };
    }
    if (parts.length !== 2) {
        return null;
    }
    const a = parseA1Cell(parts[0]);
    const b = parseA1Cell(parts[1]);
    if (!a || !b) {
        return null;
    }
    return {
        start: {
            row: Math.min(a.row, b.row),
            col: Math.min(a.col, b.col),
        },
        end: {
            row: Math.max(a.row, b.row),
            col: Math.max(a.col, b.col),
        },
    };
}

/** 将矩形选区展开为单元格列表（行优先） */
export function expandRange(range: A1Range): CellAddress[] {
    const cells: CellAddress[] = [];
    for (let row = range.start.row; row <= range.end.row; row++) {
        for (let col = range.start.col; col <= range.end.col; col++) {
            cells.push({ row, col });
        }
    }
    return cells;
}

/** RFC-0022 选区 → A1 范围字符串（如 `A1:C5`） */
export function rangeToA1(range: A1Range): string {
    const start = cellAddressToA1(range.start);
    const end = cellAddressToA1(range.end);
    return start === end ? start : `${start}:${end}`;
}

export function cellKey(address: CellAddress): string {
    return `${address.row}:${address.col}`;
}

export function parseCellKey(key: string): CellAddress {
    const [rowText, colText] = key.split(":");
    return { row: Number(rowText), col: Number(colText) };
}

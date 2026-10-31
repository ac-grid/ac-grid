/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import {
    isColumnEditable,
    resolveEditorType,
    isCustomEditor,
    validateEditValue,
    coerceEditorValue,
    supportsDoubleClickTrigger,
    supportsEnterTrigger,
} from "../src/utils/editing-utils";
import { getNextCellPosition } from "../src/utils/keyboard-navigation";
import { parseTsv, serializeTsv } from "../src/utils/clipboard";

describe("editing-utils", () => {
    it("isColumnEditable honours the global switch, missing def, and enableEditing=false", () => {
        expect(isColumnEditable({} as never, false)).toBe(false);
        expect(isColumnEditable(undefined, true)).toBe(false);
        expect(isColumnEditable({ enableEditing: false } as never, true)).toBe(false);
        expect(isColumnEditable({} as never, true)).toBe(true);
        expect(isColumnEditable({ enableEditing: true } as never, true)).toBe(true);
    });

    it("resolveEditorType prefers editor, then filterType, else text", () => {
        expect(resolveEditorType(undefined)).toBe("text");
        expect(resolveEditorType({ editor: "number" } as never)).toBe("number");
        expect(resolveEditorType({ editor: "date" } as never)).toBe("date");
        expect(resolveEditorType({ editor: "text", filterType: "number" } as never)).toBe("text");
        expect(resolveEditorType({ filterType: "number" } as never)).toBe("number");
        expect(resolveEditorType({ filterType: "date" } as never)).toBe("date");
        expect(resolveEditorType({ filterType: "text" } as never)).toBe("text");
        expect(resolveEditorType({ editor: () => null, filterType: "date" } as never)).toBe("date");
    });

    it("isCustomEditor detects function editors only", () => {
        expect(isCustomEditor({ editor: () => null } as never)).toBe(true);
        expect(isCustomEditor({ editor: "text" } as never)).toBe(false);
        expect(isCustomEditor(undefined)).toBe(false);
    });

    it("validateEditValue maps validator results", () => {
        const row = { id: "r" } as never;
        expect(validateEditValue("v", row)).toEqual({ valid: true });
        expect(validateEditValue("v", undefined, () => false)).toEqual({ valid: true });
        const ok = vi.fn(() => true);
        expect(validateEditValue("v", row, ok)).toEqual({ valid: true });
        expect(ok).toHaveBeenCalledWith("v", row);
        expect(validateEditValue("v", row, () => false)).toEqual({ valid: false, error: "Invalid value" });
        expect(validateEditValue("v", row, () => "too short")).toEqual({ valid: false, error: "too short" });
    });

    it("coerceEditorValue converts by editor type", () => {
        expect(coerceEditorValue("", "number")).toBeNull();
        expect(coerceEditorValue(null, "number")).toBeNull();
        expect(coerceEditorValue(undefined, "number")).toBeNull();
        expect(coerceEditorValue("42", "number")).toBe(42);
        expect(coerceEditorValue("abc", "number")).toBe("abc");
        expect(coerceEditorValue("", "date")).toBeNull();
        expect(coerceEditorValue("2024-01-01", "date")).toBe("2024-01-01");
        expect(coerceEditorValue(null, "text")).toBe("");
        expect(coerceEditorValue(undefined, "text")).toBe("");
        expect(coerceEditorValue(5, "text")).toBe("5");
    });

    it("edit trigger helpers default to doubleClick", () => {
        expect(supportsDoubleClickTrigger(undefined)).toBe(true);
        expect(supportsDoubleClickTrigger("doubleClick")).toBe(true);
        expect(supportsDoubleClickTrigger("both")).toBe(true);
        expect(supportsDoubleClickTrigger("enter")).toBe(false);
        expect(supportsEnterTrigger(undefined)).toBe(false);
        expect(supportsEnterTrigger("doubleClick")).toBe(false);
        expect(supportsEnterTrigger("enter")).toBe(true);
        expect(supportsEnterTrigger("both")).toBe(true);
    });
});

describe("getNextCellPosition", () => {
    const at = (row: number, column: number) => ({ row, column });
    it("returns the current position for an empty grid", () => {
        const cur = at(1, 1);
        expect(getNextCellPosition(cur, "ArrowDown", 0, 3)).toBe(cur);
        expect(getNextCellPosition(cur, "ArrowDown", 3, 0)).toBe(cur);
    });
    it("Tab wraps across rows and clamps at the ends; Shift+Tab reverses", () => {
        expect(getNextCellPosition(at(0, 2), "Tab", 3, 3)).toEqual(at(1, 0));
        expect(getNextCellPosition(at(2, 2), "Tab", 3, 3)).toEqual(at(2, 2));
        expect(getNextCellPosition(at(1, 0), "Tab", 3, 3, "cell", true)).toEqual(at(0, 2));
        expect(getNextCellPosition(at(0, 0), "Tab", 3, 3, "cell", true)).toEqual(at(0, 0));
    });
    it("arrows move in cell mode and clamp at edges", () => {
        expect(getNextCellPosition(at(1, 1), "ArrowUp", 3, 3)).toEqual(at(0, 1));
        expect(getNextCellPosition(at(1, 1), "ArrowDown", 3, 3)).toEqual(at(2, 1));
        expect(getNextCellPosition(at(1, 1), "ArrowLeft", 3, 3)).toEqual(at(1, 0));
        expect(getNextCellPosition(at(1, 1), "ArrowRight", 3, 3)).toEqual(at(1, 2));
        expect(getNextCellPosition(at(0, 0), "ArrowUp", 3, 3)).toEqual(at(0, 0));
        expect(getNextCellPosition(at(2, 2), "ArrowDown", 3, 3)).toEqual(at(2, 2));
        expect(getNextCellPosition(at(0, 0), "ArrowLeft", 3, 3)).toEqual(at(0, 0));
        expect(getNextCellPosition(at(2, 2), "ArrowRight", 3, 3)).toEqual(at(2, 2));
    });
    it("row mode ignores left/right; other keys do not move", () => {
        expect(getNextCellPosition(at(1, 1), "ArrowLeft", 3, 3, "row")).toEqual(at(1, 1));
        expect(getNextCellPosition(at(1, 1), "ArrowRight", 3, 3, "row")).toEqual(at(1, 1));
        expect(getNextCellPosition(at(1, 1), "ArrowDown", 3, 3, "row")).toEqual(at(2, 1));
        expect(getNextCellPosition(at(1, 1), "x", 3, 3)).toEqual(at(1, 1));
    });
});

describe("clipboard TSV", () => {
    it("parses tabs, rows and CRLF/CR/LF endings", () => {
        expect(parseTsv("a\tb\nc\td")).toEqual([["a", "b"], ["c", "d"]]);
        expect(parseTsv("a\r\nb")).toEqual([["a"], ["b"]]);
        expect(parseTsv("a\rb")).toEqual([["a"], ["b"]]);
    });
    it("handles quoted fields with embedded separators and escaped quotes", () => {
        expect(parseTsv('"a\tb"\t"c\nd"\t"say ""hi"""')).toEqual([["a\tb", "c\nd", 'say "hi"']]);
    });
    it("handles empty input, trailing newline and trailing blank row", () => {
        expect(parseTsv("")).toEqual([[""]]);
        expect(parseTsv("a\n")).toEqual([["a"]]);
        expect(parseTsv("a\n\n")).toEqual([["a"]]);
        expect(parseTsv("a\t")).toEqual([["a", ""]]);
        expect(parseTsv("\n")).toEqual([[""]]);
        expect(parseTsv("a\n\tb")).toEqual([["a"], ["", "b"]]);
    });
    it("serializes with quoting, CRLF row joins and null/undefined as empty", () => {
        expect(serializeTsv([["a", null, undefined, 1], ['x"y', "t\tt", "n\nn", "r\rr"]])).toBe(
            'a\t\t\t1\r\n"x""y"\t"t\tt"\t"n\nn"\t"r\rr"',
        );
        expect(serializeTsv([])).toBe("");
    });
    it("round-trips tricky values", () => {
        const rows = [["a\tb", 'q"q', "line1\nline2"], ["", "z", ""]];
        expect(parseTsv(serializeTsv(rows))).toEqual(rows);
    });
});

/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    coerceEditorValue,
    isColumnEditable,
    resolveEditorType,
    supportsDoubleClickTrigger,
    supportsEnterTrigger,
    validateEditValue,
} from "../src/utils/editing-utils";
import type { ColumnDef } from "../src/types/column";

describe("editing-utils", () => {
    describe("isColumnEditable", () => {
        it("returns false when editing is disabled", () => {
            expect(isColumnEditable({ accessorKey: "name" }, false)).toBe(false);
        });

        it("returns true by default when editing is enabled", () => {
            expect(isColumnEditable({ accessorKey: "name" }, true)).toBe(true);
        });

        it("returns false when enableEditing is false", () => {
            expect(
                isColumnEditable({ accessorKey: "name", enableEditing: false }, true),
            ).toBe(false);
        });
    });

    describe("resolveEditorType", () => {
        it("uses explicit editor type", () => {
            const col: ColumnDef<unknown> = { accessorKey: "x", editor: "date" };
            expect(resolveEditorType(col)).toBe("date");
        });

        it("falls back to filterType number", () => {
            const col: ColumnDef<unknown> = {
                accessorKey: "age",
                filterType: "number",
            };
            expect(resolveEditorType(col)).toBe("number");
        });

        it("defaults to text", () => {
            expect(resolveEditorType({ accessorKey: "name" })).toBe("text");
        });
    });

    describe("validateEditValue", () => {
        const mockRow = { id: "1" } as any;

        it("passes when no validator", () => {
            expect(validateEditValue("hello", mockRow)).toEqual({ valid: true });
        });

        it("passes when validator returns true", () => {
            const col: ColumnDef<{ age: number }> = {
                accessorKey: "age",
                validateEdit: (v) => Number(v) >= 0,
            };
            expect(
                validateEditValue(5, mockRow, col.validateEdit),
            ).toEqual({ valid: true });
        });

        it("fails when validator returns false", () => {
            const col: ColumnDef<{ age: number }> = {
                accessorKey: "age",
                validateEdit: (v) => Number(v) >= 0,
            };
            expect(validateEditValue(-1, mockRow, col.validateEdit)).toEqual({
                valid: false,
                error: "Invalid value",
            });
        });

        it("uses custom error string from validator", () => {
            const col: ColumnDef<{ name: string }> = {
                accessorKey: "name",
                validateEdit: (v) =>
                    String(v).length > 0 || "Name is required",
            };
            expect(validateEditValue("", mockRow, col.validateEdit)).toEqual({
                valid: false,
                error: "Name is required",
            });
        });
    });

    describe("coerceEditorValue", () => {
        it("coerces number strings", () => {
            expect(coerceEditorValue("42", "number")).toBe(42);
        });

        it("returns null for empty number", () => {
            expect(coerceEditorValue("", "number")).toBeNull();
        });

        it("preserves date as string", () => {
            expect(coerceEditorValue("2026-01-01", "date")).toBe("2026-01-01");
        });

        it("coerces text to string", () => {
            expect(coerceEditorValue(123, "text")).toBe("123");
        });
    });

    describe("edit triggers", () => {
        it("supports doubleClick by default", () => {
            expect(supportsDoubleClickTrigger(undefined)).toBe(true);
            expect(supportsEnterTrigger(undefined)).toBe(false);
        });

        it("supports both triggers in both mode", () => {
            expect(supportsDoubleClickTrigger("both")).toBe(true);
            expect(supportsEnterTrigger("both")).toBe(true);
        });

        it("supports enter only", () => {
            expect(supportsDoubleClickTrigger("enter")).toBe(false);
            expect(supportsEnterTrigger("enter")).toBe(true);
        });
    });
});

/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    cellAddressToA1,
    cellKey,
    cellRefTokenToA1,
    columnIndexToLetters,
    expandRange,
    lettersToColumnIndex,
    parseA1Cell,
    parseA1Range,
    parseCellKey,
    rangeToA1,
} from "../src/utils/a1-notation";

describe("a1-notation (coverage)", () => {
    it("encodes columns across the Z -> AA boundary", () => {
        expect(columnIndexToLetters(0)).toBe("A");
        expect(columnIndexToLetters(25)).toBe("Z");
        expect(columnIndexToLetters(26)).toBe("AA");
        expect(columnIndexToLetters(702)).toBe("AAA");
    });

    it("rejects negative and fractional column indexes", () => {
        expect(() => columnIndexToLetters(-1)).toThrow(RangeError);
        expect(() => columnIndexToLetters(1.5)).toThrow(RangeError);
    });

    it("decodes letters case-insensitively and rejects non-letters", () => {
        expect(lettersToColumnIndex("aa")).toBe(26);
        expect(() => lettersToColumnIndex("A1")).toThrow(RangeError);
        expect(() => lettersToColumnIndex("")).toThrow(RangeError);
    });

    it("formats addresses and tokens with and without $", () => {
        expect(cellAddressToA1({ row: 2, col: 1 })).toBe("B3");
        expect(cellRefTokenToA1({ row: 0, col: 0, absCol: false, absRow: false })).toBe("A1");
        expect(cellRefTokenToA1({ row: 0, col: 0, absCol: true, absRow: true })).toBe("$A$1");
        expect(cellRefTokenToA1({ row: 4, col: 2, absCol: true, absRow: false })).toBe("$C5");
        expect(cellRefTokenToA1({ row: 4, col: 2, absCol: false, absRow: true })).toBe("C$5");
    });

    it("parses a single cell, trimming and detecting absolute marks", () => {
        expect(parseA1Cell(" $b$3 ")).toEqual({ col: 1, row: 2, absCol: true, absRow: true });
        expect(parseA1Cell("B3")).toEqual({ col: 1, row: 2, absCol: false, absRow: false });
    });

    it("returns null for malformed cells", () => {
        expect(parseA1Cell("A0")).toBeNull();
        expect(parseA1Cell("1A")).toBeNull();
        expect(parseA1Cell("")).toBeNull();
    });

    it("parses ranges: single cell, reversed order, and invalid shapes", () => {
        expect(parseA1Range("B2")).toEqual({ start: { row: 1, col: 1 }, end: { row: 1, col: 1 } });
        expect(parseA1Range("C3:A1")).toEqual({ start: { row: 0, col: 0 }, end: { row: 2, col: 2 } });
        expect(parseA1Range("zz")).toBeNull();
        expect(parseA1Range("A1:B2:C3")).toBeNull();
        expect(parseA1Range("A1:zz")).toBeNull();
        expect(parseA1Range("zz:A1")).toBeNull();
    });

    it("expands ranges row-major and renders them back", () => {
        const range = { start: { row: 0, col: 0 }, end: { row: 1, col: 1 } };
        expect(expandRange(range)).toEqual([
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 1, col: 0 },
            { row: 1, col: 1 },
        ]);
        expect(rangeToA1(range)).toBe("A1:B2");
        expect(rangeToA1({ start: { row: 0, col: 0 }, end: { row: 0, col: 0 } })).toBe("A1");
    });

    it("round-trips cell keys", () => {
        expect(cellKey({ row: 3, col: 7 })).toBe("3:7");
        expect(parseCellKey("3:7")).toEqual({ row: 3, col: 7 });
    });
});

/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    cellAddressToA1,
    columnIndexToLetters,
    expandRange,
    lettersToColumnIndex,
    parseA1Cell,
    parseA1Range,
    rangeToA1,
} from "../src/utils/a1-notation";

describe("a1-notation", () => {
    it("maps column indices to letters", () => {
        expect(columnIndexToLetters(0)).toBe("A");
        expect(columnIndexToLetters(25)).toBe("Z");
        expect(columnIndexToLetters(26)).toBe("AA");
        expect(columnIndexToLetters(27)).toBe("AB");
    });

    it("maps letters to column indices", () => {
        expect(lettersToColumnIndex("A")).toBe(0);
        expect(lettersToColumnIndex("Z")).toBe(25);
        expect(lettersToColumnIndex("AA")).toBe(26);
        expect(lettersToColumnIndex("ab")).toBe(27);
    });

    it("round-trips cell addresses", () => {
        expect(cellAddressToA1({ row: 0, col: 0 })).toBe("A1");
        expect(cellAddressToA1({ row: 9, col: 2 })).toBe("C10");
        expect(parseA1Cell("B2")).toEqual({
            row: 1,
            col: 1,
            absCol: false,
            absRow: false,
        });
        expect(parseA1Cell("$A$1")).toEqual({
            row: 0,
            col: 0,
            absCol: true,
            absRow: true,
        });
    });

    it("parses and expands ranges for RFC-0022 selection refs", () => {
        const range = parseA1Range("B2:C3");
        expect(range).toEqual({
            start: { row: 1, col: 1 },
            end: { row: 2, col: 2 },
        });
        expect(expandRange(range!)).toEqual([
            { row: 1, col: 1 },
            { row: 1, col: 2 },
            { row: 2, col: 1 },
            { row: 2, col: 2 },
        ]);
        expect(rangeToA1(range!)).toBe("B2:C3");
    });

    it("normalizes reversed ranges", () => {
        expect(parseA1Range("C3:A1")).toEqual({
            start: { row: 0, col: 0 },
            end: { row: 2, col: 2 },
        });
    });
});

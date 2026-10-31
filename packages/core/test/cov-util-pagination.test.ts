/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    DEFAULT_PAGE_SIZE,
    DEFAULT_PAGE_SIZE_OPTIONS,
    computeTotalPages,
    clampPageIndex,
    computePageRange,
} from "../src/utils/pagination";

describe("pagination utils", () => {
    it("exposes defaults", () => {
        expect(DEFAULT_PAGE_SIZE).toBe(10);
        expect([...DEFAULT_PAGE_SIZE_OPTIONS]).toEqual([10, 20, 30, 40, 50]);
    });
    it("computes total pages", () => {
        expect(computeTotalPages(0, 10)).toBe(0);
        expect(computeTotalPages(-5, 10)).toBe(0);
        expect(computeTotalPages(5, 0)).toBe(1);
        expect(computeTotalPages(25, 10)).toBe(3);
        expect(computeTotalPages(20, 10)).toBe(2);
    });
    it("clamps page index into [0, totalPages-1]", () => {
        expect(clampPageIndex(3, 0)).toBe(0);
        expect(clampPageIndex(-2, 5)).toBe(0);
        expect(clampPageIndex(2, 5)).toBe(2);
        expect(clampPageIndex(9, 5)).toBe(4);
    });
    it("computes the 1-based visible range", () => {
        expect(computePageRange(0, 10, 0)).toEqual({ start: 0, end: 0 });
        expect(computePageRange(0, 10, 25)).toEqual({ start: 1, end: 10 });
        expect(computePageRange(2, 10, 25)).toEqual({ start: 21, end: 25 });
    });
});

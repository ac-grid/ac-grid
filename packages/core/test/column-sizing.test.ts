/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    clampColumnWidth,
    calculateColumnContentWidth,
    getColumnSizeBounds,
    measureTextWidth,
} from "../src/utils/column-sizing";
import type { ColumnDef } from "../src/types/column";

describe("column-sizing utils", () => {
    it("should clamp width using column min/max", () => {
        const column: ColumnDef<{ name: string }, string> = {
            accessorKey: "name",
            header: "Name",
            minSize: 100,
            maxSize: 200,
        };

        expect(clampColumnWidth(50, column, undefined)).toBe(100);
        expect(clampColumnWidth(150, column, undefined)).toBe(150);
        expect(clampColumnWidth(300, column, undefined)).toBe(200);
    });

    it("should clamp width using global resizing config", () => {
        expect(
            clampColumnWidth(10, undefined, { minColumnWidth: 50, maxColumnWidth: 500 }),
        ).toBe(50);
        expect(
            clampColumnWidth(600, undefined, { minColumnWidth: 50, maxColumnWidth: 500 }),
        ).toBe(500);
    });

    it("should prefer column bounds over global config", () => {
        const column: ColumnDef<{ name: string }, string> = {
            accessorKey: "name",
            header: "Name",
            minSize: 80,
            maxSize: 120,
        };

        const bounds = getColumnSizeBounds(column, {
            minColumnWidth: 50,
            maxColumnWidth: 500,
        });

        expect(bounds).toEqual({ min: 80, max: 120 });
    });

    it("should calculate auto width from header and cell content", () => {
        const columns: ColumnDef<{ name: string }, string>[] = [
            { accessorKey: "name", header: "Full Name" },
        ];
        const data = [{ name: "Very Long Username Example" }];

        const width = calculateColumnContentWidth("name", columns, data);
        expect(width).toBeGreaterThan(measureTextWidth("Full Name"));
        expect(width).toBeGreaterThan(measureTextWidth("Very Long Username Example"));
    });
});

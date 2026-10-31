/// <reference types="vitest" />
import { describe, it, expect, vi, afterEach } from "vitest";
import {
    measureTextWidth,
    resolveColumnId,
    findColumnDefById,
    getColumnSizeBounds,
    calculateColumnContentWidth,
    clampColumnWidth,
    COLUMN_CONTENT_PADDING,
} from "../src/utils/column-sizing";

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

const mockCanvas = () =>
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
        () =>
            ({
                font: "",
                measureText: (t: string) => ({ width: t.length * 10 }),
            }) as unknown as CanvasRenderingContext2D,
    );

describe("measureTextWidth", () => {
    it("uses the canvas context to measure text", () => {
        mockCanvas();
        expect(measureTextWidth("abcd")).toBe(40);
        expect(measureTextWidth("ab", "bold 10px serif")).toBe(20);
    });
    it("estimates 8px per char when no 2d context is available", () => {
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
        expect(measureTextWidth("abcd")).toBe(32);
    });
    it("estimates 8px per char when there is no document", () => {
        vi.stubGlobal("document", undefined);
        expect(measureTextWidth("abc")).toBe(24);
    });
});

describe("column id helpers", () => {
    it("prefers id over accessorKey", () => {
        expect(resolveColumnId({ id: "a", accessorKey: "b" } as never)).toBe("a");
        expect(resolveColumnId({ accessorKey: "b" } as never)).toBe("b");
        expect(resolveColumnId({} as never)).toBeUndefined();
    });
    it("finds a column by id or accessorKey", () => {
        const cols = [{ id: "a" }, { accessorKey: "b" }] as never[];
        expect(findColumnDefById(cols, "b")).toBe(cols[1]);
        expect(findColumnDefById(cols, "zz")).toBeUndefined();
    });
});

describe("getColumnSizeBounds", () => {
    it("falls back column -> global config -> defaults", () => {
        expect(getColumnSizeBounds({ minSize: 5, maxSize: 9 } as never, { minColumnWidth: 1, maxColumnWidth: 2 })).toEqual({ min: 5, max: 9 });
        expect(getColumnSizeBounds({} as never, { minColumnWidth: 1, maxColumnWidth: 2 })).toEqual({ min: 1, max: 2 });
        expect(getColumnSizeBounds(undefined, undefined)).toEqual({ min: 20, max: Number.MAX_SAFE_INTEGER });
    });
});

describe("clampColumnWidth", () => {
    it("limits width to the resolved bounds", () => {
        const cfg = { minColumnWidth: 50, maxColumnWidth: 100 };
        expect(clampColumnWidth(10, undefined, cfg)).toBe(50);
        expect(clampColumnWidth(75, undefined, cfg)).toBe(75);
        expect(clampColumnWidth(500, undefined, cfg)).toBe(100);
    });
});

describe("calculateColumnContentWidth", () => {
    it("returns 150 for an unknown column", () => {
        expect(calculateColumnContentWidth("nope", [], [])).toBe(150);
    });
    it("sizes by the widest of header and cell text plus padding", () => {
        mockCanvas();
        const cols = [{ accessorKey: "name", header: "Nm" }] as never[];
        const data = [{ name: "abcdef" }, { name: "x" }, { name: null }, { name: "" }, {}];
        expect(calculateColumnContentWidth("name", cols, data)).toBe(60 + COLUMN_CONTENT_PADDING);
    });
    it("keeps the header width when cells are narrower, and uses the id for non-string headers", () => {
        mockCanvas();
        const cols = [{ id: "identifier", header: () => "x", accessorKey: "k" }] as never[];
        expect(calculateColumnContentWidth("identifier", cols, [{ k: "a" }])).toBe(100 + COLUMN_CONTENT_PADDING);
    });
    it("reads cell text through accessorFn and ignores columns with no accessor", () => {
        mockCanvas();
        const withFn = [{ id: "c", header: "h", accessorFn: (r: { a: number }) => r.a * 2 }] as never[];
        expect(calculateColumnContentWidth("c", withFn, [{ a: 5000 }] as never)).toBe(50 + COLUMN_CONTENT_PADDING);
        const none = [{ id: "c", header: "h" }] as never[];
        expect(calculateColumnContentWidth("c", none, [{ a: 5000 }])).toBe(10 + COLUMN_CONTENT_PADDING);
    });
});

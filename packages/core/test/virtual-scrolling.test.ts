import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    calculateVisibleRange,
    scrollToRow,
    getVisibleRowRange,
    createScrollHandler,
} from "../src/utils/virtual-scroll";
import { createGrid } from "../src/utils/create-grid";

describe("virtual-scroll helpers", () => {
    describe("scrollToRow", () => {
        it("returns rowIndex * rowHeight", () => {
            expect(scrollToRow(10, 50)).toBe(500);
        });

        it("clamps negative rowIndex to 0 offset", () => {
            expect(scrollToRow(-3, 50)).toBe(0);
        });
    });

    describe("calculateVisibleRange", () => {
        it("uses fallback viewport when gridRef is null", () => {
            const result = calculateVisibleRange(0, 50, null, 5, 100);
            expect(result.startIndex).toBe(0);
            expect(result.endIndex).toBeGreaterThan(0);
            expect(result.visibleRowCount).toBeGreaterThan(0);
        });

        it("reads clientHeight from gridRef when provided", () => {
            const el = document.createElement("div");
            Object.defineProperty(el, "clientHeight", { value: 400, configurable: true });
            const result = calculateVisibleRange(100, 50, el, 5, 200);
            expect(result.startIndex).toBeGreaterThanOrEqual(0);
            expect(result.endIndex).toBeLessThanOrEqual(200);
        });

        it("resolves .ac-grid inside shadow root", () => {
            const host = document.createElement("div");
            const shadow = host.attachShadow({ mode: "open" });
            const gridEl = document.createElement("div");
            gridEl.className = "ac-grid";
            Object.defineProperty(gridEl, "clientHeight", { value: 300, configurable: true });
            shadow.appendChild(gridEl);
            const ref = document.createElement("div");
            ref.getRootNode = () => shadow;

            const result = calculateVisibleRange(0, 50, ref, 5, 50);
            expect(result.visibleRowCount).toBe(Math.ceil(300 / 50));
        });

        it("treats rowHeight <= 0 as 1 for visibleRowCount", () => {
            const el = document.createElement("div");
            Object.defineProperty(el, "clientHeight", { value: 10, configurable: true });
            const result = calculateVisibleRange(0, 0, el, 5, 10);
            expect(result.visibleRowCount).toBe(10);
        });
    });

    describe("getVisibleRowRange", () => {
        it("returns half-open slice bounds", () => {
            const range = getVisibleRowRange({
                scrollTop: 250,
                rowHeight: 50,
                gridRef: null,
                rowCount: 100,
                overscan: 5,
            });
            expect(range.start).toBeGreaterThanOrEqual(0);
            expect(range.end).toBeLessThanOrEqual(100);
            expect(range.visibleCount).toBeGreaterThan(0);
        });

        it("handles empty rowCount", () => {
            const range = getVisibleRowRange({
                scrollTop: 0,
                rowHeight: 50,
                gridRef: null,
                rowCount: 0,
            });
            expect(range.visibleCount).toBe(0);
            expect(range.end).toBe(0);
        });

        it("uses default overscan of 5", () => {
            const range = getVisibleRowRange({
                scrollTop: 0,
                rowHeight: 50,
                gridRef: null,
                rowCount: 100,
            });
            expect(range.end).toBeGreaterThan(0);
        });
    });

    describe("createScrollHandler", () => {
        beforeEach(() => {
            vi.stubGlobal(
                "requestAnimationFrame",
                (cb: FrameRequestCallback) => {
                    cb(0);
                    return 1;
                },
            );
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it("invokes onScroll with scrollTop via rAF", () => {
            const onScroll = vi.fn();
            const handler = createScrollHandler(onScroll, 50);
            const target = document.createElement("div");
            Object.defineProperty(target, "scrollTop", { value: 120, configurable: true });
            handler({ target } as unknown as Event);
            expect(onScroll).toHaveBeenCalledWith(120);
        });

        it("coalesces multiple events in the same frame", () => {
            let rafCb: FrameRequestCallback | null = null;
            vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
                rafCb = cb;
                return 99;
            });
            const onScroll = vi.fn();
            const handler = createScrollHandler(onScroll, 50);
            const target = document.createElement("div");
            Object.defineProperty(target, "scrollTop", { value: 10, configurable: true });
            handler({ target } as unknown as Event);
            handler({ target } as unknown as Event);
            expect(onScroll).not.toHaveBeenCalled();
            rafCb?.(0);
            expect(onScroll).toHaveBeenCalledTimes(1);
        });
    });
});

describe("createGrid virtualization", () => {
    it("sets virtualizationConfig when provided", () => {
        const grid = createGrid({
            data: Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Row ${i}` })),
            columns: [{ accessorKey: "name", header: "Name" }],
            virtualization: { enabled: true, rowHeight: 50, overscan: 3 },
        }) as HTMLElement & { virtualizationConfig: { enabled?: boolean; rowHeight?: number } };
        expect(grid.virtualizationConfig?.enabled).toBe(true);
        expect(grid.virtualizationConfig?.rowHeight).toBe(50);
    });

    it("omits virtualizationConfig when not provided", () => {
        const grid = createGrid({
            data: [{ id: 1, name: "A" }],
            columns: [{ accessorKey: "name", header: "Name" }],
        }) as HTMLElement & { virtualizationConfig?: unknown };
        expect(grid.virtualizationConfig).toBeUndefined();
    });
});

import { describe, it, expect, beforeEach } from "vitest";
import { Virtualizer } from "../src/utils/virtualizer";
import type { GridVirtualizationConfig } from "../src/types/virtualization";

describe("Virtualizer", () => {
    let virtualizer: Virtualizer;

    beforeEach(() => {
        virtualizer = new Virtualizer({ enabled: true, rowHeight: 50, overscan: 5 });
    });

    describe("getVirtualState when disabled", () => {
        it("returns full range when enabled is false", () => {
            virtualizer = new Virtualizer({ enabled: false, rowHeight: 50 });
            virtualizer.updateState(100, 400, 20);
            const state = virtualizer.getVirtualState();
            expect(state.visibleRange).toEqual({ start: 0, end: 20 });
            expect(state.totalHeight).toBe(20 * 50);
        });
    });

    describe("getVirtualState when containerHeight is 0", () => {
        it("returns full range before layout measurement", () => {
            virtualizer.updateState(0, 0, 100);
            const state = virtualizer.getVirtualState();
            expect(state.visibleRange).toEqual({ start: 0, end: 100 });
            expect(state.containerHeight).toBe(0);
        });
    });

    describe("getVirtualState when enabled with measured container", () => {
        it("computes range at scrollTop=0", () => {
            virtualizer.updateState(0, 500, 1000);
            const { visibleRange, totalHeight } = virtualizer.getVirtualState();
            expect(totalHeight).toBe(1000 * 50);
            expect(visibleRange.start).toBe(0);
            // visibleCount=ceil(500/50)=10, end = 0+10+2*5 = 20
            expect(visibleRange.end).toBe(20);
        });

        it("applies overscan when scrolled", () => {
            virtualizer.updateState(500, 500, 1000);
            const { visibleRange } = virtualizer.getVirtualState();
            // floor(500/50)=10, start = max(0, 10-5)=5
            expect(visibleRange.start).toBe(5);
        });

        it("clamps start when scrollTop exceeds shrunk row count", () => {
            // scrollTop implies row 280, but only 5 rows remain
            virtualizer.updateState(14000, 500, 5);
            const { visibleRange } = virtualizer.getVirtualState();
            expect(visibleRange.start).toBe(0);
            expect(visibleRange.end).toBe(5);
            expect(visibleRange.start).toBeLessThanOrEqual(visibleRange.end);
        });

        it("clamps endIndex to totalCount at last scroll position", () => {
            virtualizer.updateState(49950, 500, 1000);
            const { visibleRange } = virtualizer.getVirtualState();
            expect(visibleRange.end).toBe(1000);
        });

        it("handles zero rows", () => {
            virtualizer.updateState(0, 500, 0);
            const state = virtualizer.getVirtualState();
            expect(state.totalHeight).toBe(0);
            expect(state.visibleRange).toEqual({ start: 0, end: 0 });
        });
    });

    describe("defaults", () => {
        it("uses rowHeight 35 and overscan 5 when omitted", () => {
            virtualizer = new Virtualizer({ enabled: true });
            virtualizer.updateState(0, 350, 100);
            const state = virtualizer.getVirtualState();
            expect(state.totalHeight).toBe(100 * 35);
            // ceil(350/35)=10, end = 0+10+10=20
            expect(state.visibleRange.end).toBe(20);
        });
    });

    describe("updateConfig", () => {
        it("merges partial config and recalculates on next getVirtualState", () => {
            virtualizer.updateState(0, 500, 100);
            virtualizer.updateConfig({ rowHeight: 100 });
            const state = virtualizer.getVirtualState();
            expect(state.totalHeight).toBe(100 * 100);
        });
    });

    describe("state passthrough", () => {
        it("returns scrollTop and containerHeight from updateState", () => {
            virtualizer.updateState(250, 600, 50);
            const state = virtualizer.getVirtualState();
            expect(state.scrollTop).toBe(250);
            expect(state.containerHeight).toBe(600);
        });
    });
});

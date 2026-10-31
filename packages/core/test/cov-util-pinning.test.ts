/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    buildColumnPinningFromDefs,
    applyColumnDefPins,
    pinColumnInState,
    reorderPinnedOnColumnDrag,
} from "../src/utils/pinning-utils";

describe("buildColumnPinningFromDefs", () => {
    it("collects left/right pins in definition order, skipping unpinned, id-less and invalid pins", () => {
        const cols = [
            { id: "a", pin: "left" },
            { id: "b" },
            { id: "c", pin: "right" },
            { pin: "left" },
            { accessorKey: "d", pin: "left" },
            { id: "e", pin: "middle" },
            { id: "f", pin: false },
        ] as never[];
        expect(buildColumnPinningFromDefs(cols)).toEqual({ left: ["a", "d"], right: ["c"] });
    });
});

describe("applyColumnDefPins", () => {
    const cols = [{ id: "a", pin: "left" }, { id: "b" }, { id: "c", pin: "right" }, { id: "d" }] as never[];
    it("puts definition pins first and keeps manual pins on unpinned columns", () => {
        expect(applyColumnDefPins(cols, { left: ["d"], right: ["b"] })).toEqual({
            left: ["a", "d"],
            right: ["c", "b"],
        });
    });
    it("drops manual pins for columns that define a pin or are pinned by definition", () => {
        expect(applyColumnDefPins(cols, { left: ["a", "c"], right: ["a", "c"] })).toEqual({
            left: ["a"],
            right: ["c"],
        });
    });
    it("tolerates missing left/right and unknown column ids", () => {
        expect(applyColumnDefPins(cols, {})).toEqual({ left: ["a"], right: ["c"] });
        expect(applyColumnDefPins([], { left: ["x"], right: ["y"] })).toEqual({ left: ["x"], right: ["y"] });
    });
});

describe("pinColumnInState", () => {
    it("moves a column between sides or unpins it", () => {
        const s = { left: ["a", "b"], right: ["c"] };
        expect(pinColumnInState(s, "a", "right")).toEqual({ left: ["b"], right: ["c", "a"] });
        expect(pinColumnInState(s, "c", "left")).toEqual({ left: ["a", "b", "c"], right: [] });
        expect(pinColumnInState(s, "a", false)).toEqual({ left: ["b"], right: ["c"] });
        expect(s).toEqual({ left: ["a", "b"], right: ["c"] });
    });
    it("handles empty state", () => {
        expect(pinColumnInState({}, "a", "left")).toEqual({ left: ["a"], right: [] });
        expect(pinColumnInState({}, "a", "right")).toEqual({ left: [], right: ["a"] });
    });
});

describe("reorderPinnedOnColumnDrag", () => {
    const s = { left: ["a", "b", "c"], right: ["x", "y"] };
    it("reorders within the left or right pinned region", () => {
        expect(reorderPinnedOnColumnDrag(s, "a", "c")).toEqual({ left: ["b", "c", "a"], right: ["x", "y"] });
        expect(reorderPinnedOnColumnDrag(s, "y", "x")).toEqual({ left: ["a", "b", "c"], right: ["y", "x"] });
    });
    it("returns the same state for cross-region or unknown ids and missing sides", () => {
        expect(reorderPinnedOnColumnDrag(s, "a", "x")).toBe(s);
        expect(reorderPinnedOnColumnDrag(s, "q", "a")).toBe(s);
        const empty = {};
        expect(reorderPinnedOnColumnDrag(empty, "a", "b")).toBe(empty);
    });
});

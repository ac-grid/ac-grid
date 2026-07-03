/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    appendRowSelection,
    buildRangeSelection,
    buildSelectAllSelection,
    buildSingleSelection,
    getSelectedRowIdsFromState,
    removeRowSelection,
} from "../src/utils/selection-utils";

const ROWS = [
    { id: "row-0" },
    { id: "row-1" },
    { id: "row-2" },
    { id: "row-3" },
    { id: "row-4" },
];

describe("selection-utils", () => {
    it("buildSingleSelection keeps only one row", () => {
        expect(buildSingleSelection("row-2")).toEqual({ "row-2": true });
    });

    it("appendRowSelection adds without removing others", () => {
        expect(appendRowSelection({ "row-0": true }, "row-2")).toEqual({
            "row-0": true,
            "row-2": true,
        });
    });

    it("removeRowSelection removes one row", () => {
        expect(removeRowSelection({ "row-0": true, "row-2": true }, "row-0")).toEqual({
            "row-2": true,
        });
    });

    it("buildRangeSelection selects inclusive forward range", () => {
        expect(buildRangeSelection(ROWS, "row-1", "row-3", {})).toEqual({
            "row-1": true,
            "row-2": true,
            "row-3": true,
        });
    });

    it("buildRangeSelection selects inclusive backward range", () => {
        expect(buildRangeSelection(ROWS, "row-4", "row-2", { "row-0": true })).toEqual({
            "row-0": true,
            "row-2": true,
            "row-3": true,
            "row-4": true,
        });
    });

    it("buildRangeSelection falls back when anchor is missing", () => {
        expect(buildRangeSelection(ROWS, "missing", "row-2", {})).toEqual({
            "row-2": true,
        });
    });

    it("buildSelectAllSelection selects every row", () => {
        expect(buildSelectAllSelection(ROWS)).toEqual({
            "row-0": true,
            "row-1": true,
            "row-2": true,
            "row-3": true,
            "row-4": true,
        });
    });

    it("getSelectedRowIdsFromState returns active ids", () => {
        expect(getSelectedRowIdsFromState({ a: true, b: false, c: true })).toEqual([
            "a",
            "c",
        ]);
    });
});

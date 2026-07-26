/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    applyColumnDefPins,
    buildColumnPinningFromDefs,
    pinColumnInState,
    reorderPinnedOnColumnDrag,
} from "../src/utils/pinning-utils";

describe("pinning-utils", () => {
    it("buildColumnPinningFromDefs collects left and right pins in column order", () => {
        const columns = [
            { accessorKey: "id", pin: "left" as const },
            { accessorKey: "name" },
            { accessorKey: "actions", pin: "right" as const },
        ];

        expect(buildColumnPinningFromDefs(columns)).toEqual({
            left: ["id"],
            right: ["actions"],
        });
    });

    it("pinColumnInState moves a column between sides", () => {
        const initial = { left: ["id"], right: ["actions"] };

        expect(pinColumnInState(initial, "name", "left")).toEqual({
            left: ["id", "name"],
            right: ["actions"],
        });

        expect(pinColumnInState(initial, "id", "right")).toEqual({
            left: [],
            right: ["actions", "id"],
        });

        expect(pinColumnInState(initial, "id", false)).toEqual({
            left: [],
            right: ["actions"],
        });
    });

    it("applyColumnDefPins keeps manual pins for columns without def pin", () => {
        const columns = [
            { accessorKey: "id", pin: "left" as const },
            { accessorKey: "name" },
            { accessorKey: "actions" },
        ];

        const current = { left: ["name"], right: ["actions"] };
        expect(applyColumnDefPins(columns, current)).toEqual({
            left: ["id", "name"],
            right: ["actions"],
        });
    });

    it("reorderPinnedOnColumnDrag reorders within the same pinned side", () => {
        const state = { left: ["id", "name", "status"], right: [] };

        expect(reorderPinnedOnColumnDrag(state, "id", "status")).toEqual({
            left: ["name", "status", "id"],
            right: [],
        });
    });

    it("reorderPinnedOnColumnDrag ignores cross-side drags", () => {
        const state = { left: ["id"], right: ["actions"] };

        expect(reorderPinnedOnColumnDrag(state, "id", "actions")).toEqual(state);
    });
});

/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";

const TEST_ROWS = [
    { userId: "u1", name: "Alice" },
    { userId: "u2", name: "Bob" },
    { userId: "u3", name: "Charlie" },
    { userId: "u4", name: "Diana" },
];

const TEST_COLUMNS = [{ accessorKey: "name", header: "Name" }];

function createSelectionGrid(mode: "single" | "multiple" = "multiple") {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = TEST_ROWS;
    grid.columns = TEST_COLUMNS;
    grid.selectionConfig = {
        enabled: true,
        mode,
        enableCheckbox: mode === "multiple",
    };
    return grid;
}

describe("Grid Row Selection", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("does not render selection column when selection is disabled", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = TEST_ROWS;
        grid.columns = TEST_COLUMNS;
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-selection-checkbox")).toBeFalsy();
        });
    });

    it("renders selection checkboxes in multiple mode", async () => {
        const grid = createSelectionGrid("multiple");
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const checkboxes = root.querySelectorAll("wsx-ac-selection-checkbox");
            expect(checkboxes.length).toBeGreaterThan(0);
        });
    });

    it("selectRow replaces previous selection in single mode", async () => {
        const grid = createSelectionGrid("single");
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getSelectedRowIds().length).toBe(0);
        });

        grid.selectRow("u1");
        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual(["u1"]);
        });

        grid.selectRow("u3");
        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual(["u3"]);
        });
    });

    it("selectAll and deselectAll work in multiple mode", async () => {
        const grid = createSelectionGrid("multiple");
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual([]);
        });

        grid.selectAll();
        await waitFor(() => {
            expect(grid.getSelectedRowIds().sort()).toEqual(["u1", "u2", "u3", "u4"]);
        });

        grid.deselectAll();
        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual([]);
        });
    });

    it("selectRowRange selects inclusive rows", async () => {
        const grid = createSelectionGrid("multiple");
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual([]);
        });

        grid.selectRow("u1");
        grid.selectRowRange("u1", "u3");

        await waitFor(() => {
            expect(grid.getSelectedRowIds().sort()).toEqual(["u1", "u2", "u3"]);
        });
    });

    it("fires onRowSelectionChange when selection updates", async () => {
        const onRowSelectionChange = vi.fn();
        const grid = createSelectionGrid("single");
        grid.selectionConfig = {
            enabled: true,
            mode: "single",
            onRowSelectionChange,
        };
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual([]);
        });

        grid.selectRow("u2");
        await waitFor(() => {
            expect(onRowSelectionChange).toHaveBeenCalledWith({ u2: true });
        });
    });

    it("getSelectedRows returns table row model after programmatic select", async () => {
        const grid = createSelectionGrid("single");
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getSelectedRowIds()).toEqual([]);
        });

        grid.selectRow("u2");

        await waitFor(() => {
            const selected = grid.getSelectedRows();
            expect(selected.length).toBe(1);
            expect(selected[0].id).toBe("u2");
        });
    });
});

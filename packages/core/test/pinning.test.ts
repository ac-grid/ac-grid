/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";
import { createGrid } from "../src/utils/create-grid";

type PinningGrid = HTMLElement & {
    data: unknown[];
    columns: unknown[];
    pinningConfig: {
        enabled: boolean;
        initialState?: { left?: string[]; right?: string[] };
        onPinningChange?: (pinning: { left?: string[]; right?: string[] }) => void;
    };
    pinColumn: (columnId: string, position: "left" | "right" | false) => void;
    unpinColumn: (columnId: string) => void;
    getPinnedColumns: () => { left: string[]; right: string[] };
};

function mountPinningGrid(container: HTMLElement): PinningGrid {
    const grid = document.createElement("wsx-ac-grid") as PinningGrid;
    grid.data = [
        { userId: "1", name: "Alice", age: 30, status: "active" },
        { userId: "2", name: "Bob", age: 25, status: "inactive" },
    ];
    grid.columns = [
        { id: "name", accessorKey: "name", header: "Name", size: 150 },
        { id: "age", accessorKey: "age", header: "Age", size: 100 },
        { id: "status", accessorKey: "status", header: "Status", size: 120 },
    ];
    container.appendChild(grid);
    return grid;
}

describe("Grid Column Pinning (RFC-0008)", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("applies initial pinning state from pinningConfig", async () => {
        const grid = mountPinningGrid(container);
        grid.pinningConfig = {
            enabled: true,
            initialState: { left: ["name"], right: ["status"] },
        };

        await waitFor(() => {
            const pinned = grid.getPinnedColumns();
            expect(pinned.left).toEqual(["name"]);
            expect(pinned.right).toEqual(["status"]);
        });
    });

    it("pins and unpins columns via public API", async () => {
        const grid = mountPinningGrid(container);
        grid.pinningConfig = { enabled: true };

        await waitFor(() => expect(grid.getPinnedColumns).toBeDefined());

        grid.pinColumn("name", "left");
        grid.pinColumn("status", "right");

        await waitFor(() => {
            const pinned = grid.getPinnedColumns();
            expect(pinned.left).toContain("name");
            expect(pinned.right).toContain("status");
        });

        grid.unpinColumn("name");
        await waitFor(() => {
            expect(grid.getPinnedColumns().left).not.toContain("name");
        });
    });

    it("renders data-pinned on pinned header cells", async () => {
        const grid = mountPinningGrid(container);
        grid.pinningConfig = {
            enabled: true,
            initialState: { left: ["name"] },
        };

        await waitFor(() => {
            const root = grid.shadowRoot ?? grid;
            const pinnedHeader = root.querySelector(
                '.grid-header-cell[data-pinned="left"]',
            );
            expect(pinnedHeader).toBeTruthy();
            expect(pinnedHeader?.getAttribute("data-column-id")).toBe("name");
        });
    });

    it("notifies onPinningChange when pinning updates", async () => {
        const onPinningChange = vi.fn();
        const grid = mountPinningGrid(container);
        grid.pinningConfig = { enabled: true, onPinningChange };

        await waitFor(() => expect(grid.pinColumn).toBeDefined());
        grid.pinColumn("age", "left");

        await waitFor(() => {
            expect(onPinningChange).toHaveBeenCalled();
            const lastCall = onPinningChange.mock.calls.at(-1)?.[0];
            expect(lastCall.left).toContain("age");
        });
    });

    it("wires pinning through createGrid", async () => {
        const grid = createGrid({
            data: [{ userId: "1", name: "Test" }],
            columns: [{ id: "name", accessorKey: "name", header: "Name" }],
            pinning: {
                enabled: true,
                initialState: { left: ["name"] },
            },
            container,
        }) as PinningGrid;

        await waitFor(() => {
            expect(grid.getPinnedColumns().left).toEqual(["name"]);
        });
    });
});

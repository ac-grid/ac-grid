/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";
import { createGrid } from "../src/utils/create-grid";

const TEST_ROWS = [
    { userId: "u1", id: "1", name: "Alice", actions: "Edit" },
    { userId: "u2", id: "2", name: "Bob", actions: "Edit" },
];

const TEST_COLUMNS = [
    { accessorKey: "id", header: "ID", pin: "left" as const },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "actions", header: "Actions", pin: "right" as const },
];

function createPinningGrid() {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = TEST_ROWS;
    grid.columns = TEST_COLUMNS;
    grid.pinningConfig = {
        enabled: true,
        initialState: { left: ["id"], right: ["actions"] },
    };
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

    it("does not pin columns when pinning is disabled", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = TEST_ROWS;
        grid.columns = TEST_COLUMNS;
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelectorAll(".grid-header-cell").length).toBeGreaterThan(0);
        });

        const root = grid.shadowRoot || grid;
        expect(root.querySelector('[data-pinned="left"]')).toBeFalsy();
        expect(root.querySelector('[data-pinned="right"]')).toBeFalsy();
    });

    it("renders pinned header and body cells when enabled", async () => {
        const grid = createPinningGrid();
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector('[data-pinned="left"]')).toBeTruthy();
            expect(root.querySelector('[data-pinned="right"]')).toBeTruthy();
        });
    });

    it("exposes pinning API methods", async () => {
        const grid = createPinningGrid();
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getPinnedColumns()).toEqual({
                left: ["id"],
                right: ["actions"],
            });
        });

        expect(typeof grid.pinColumn).toBe("function");
        expect(typeof grid.unpinColumn).toBe("function");
        expect(typeof grid.getPinnedColumns).toBe("function");
    });

    it("pinColumn and unpinColumn update pinned state", async () => {
        const grid = createPinningGrid();
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getPinnedColumns().left).toContain("id");
        });

        grid.pinColumn("name", "left");
        await waitFor(() => {
            expect(grid.getPinnedColumns()).toEqual({
                left: ["id", "name"],
                right: ["actions"],
            });
        });

        grid.unpinColumn("actions");
        await waitFor(() => {
            expect(grid.getPinnedColumns()).toEqual({
                left: ["id", "name"],
                right: [],
            });
        });
    });

    it("applies column def pin when columns are set after pinning config", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = TEST_ROWS;
        grid.pinningConfig = { enabled: true };
        grid.columns = TEST_COLUMNS;
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getPinnedColumns()).toEqual({
                left: ["id"],
                right: ["actions"],
            });
        });
    });

    it("renders data-pinned on pinned header cells with column id", async () => {
        const grid = createPinningGrid();
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot ?? grid;
            const pinnedHeader = root.querySelector(
                '.grid-header-cell[data-pinned="left"]',
            );
            expect(pinnedHeader).toBeTruthy();
            expect(pinnedHeader?.getAttribute("data-column-id")).toBe("id");
        });
    });

    it("notifies onPinningChange when pinning updates", async () => {
        const onPinningChange = vi.fn();
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = TEST_ROWS;
        grid.columns = [
            { id: "name", accessorKey: "name", header: "Name" },
            { id: "actions", accessorKey: "actions", header: "Actions" },
        ];
        grid.pinningConfig = { enabled: true, onPinningChange };
        container.appendChild(grid);

        await waitFor(() => expect(grid.getPinnedColumns).toBeDefined());

        grid.pinColumn("name", "left");
        await waitFor(() => {
            expect(onPinningChange).toHaveBeenCalled();
            expect(onPinningChange.mock.calls.at(-1)?.[0]).toEqual({
                left: ["name"],
                right: [],
            });
        });
    });

    it("createGrid accepts pinning config (RFC-0008)", async () => {
        const grid = createGrid({
            data: TEST_ROWS,
            columns: [
                { id: "name", accessorKey: "name", header: "Name" },
                { id: "actions", accessorKey: "actions", header: "Actions" },
            ],
            pinning: {
                enabled: true,
                initialState: { left: ["name"], right: ["actions"] },
            },
            container,
        }) as any;

        await waitFor(() => {
            expect(grid.getPinnedColumns()).toEqual({
                left: ["name"],
                right: ["actions"],
            });
        });
    });
});

/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    computeTotalPages,
    clampPageIndex,
    computePageRange,
    DEFAULT_PAGE_SIZE,
} from "../src/utils/pagination";
import { createGrid } from "../src/utils/create-grid";
import "../src/components/Grid.wsx";
import "../src/components/PaginationControls.wsx";
import { waitFor } from "@testing-library/dom";

describe("pagination utils", () => {
    it("computeTotalPages returns 0 for empty dataset", () => {
        expect(computeTotalPages(0, 10)).toBe(0);
    });

    it("computeTotalPages rounds up partial pages", () => {
        expect(computeTotalPages(25, 10)).toBe(3);
        expect(computeTotalPages(20, 10)).toBe(2);
    });

    it("clampPageIndex keeps page within bounds", () => {
        expect(clampPageIndex(-1, 5)).toBe(0);
        expect(clampPageIndex(99, 5)).toBe(4);
        expect(clampPageIndex(2, 5)).toBe(2);
    });

    it("computePageRange returns inclusive 1-based range", () => {
        expect(computePageRange(0, 10, 25)).toEqual({ start: 1, end: 10 });
        expect(computePageRange(2, 10, 25)).toEqual({ start: 21, end: 25 });
        expect(computePageRange(0, 10, 0)).toEqual({ start: 0, end: 0 });
    });

    it("DEFAULT_PAGE_SIZE is 10", () => {
        expect(DEFAULT_PAGE_SIZE).toBe(10);
    });
});

describe("Grid client pagination", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    const sampleData = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Row ${i + 1}`,
    }));

    it("renders pagination controls when enabled", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = sampleData;
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = { enabled: true, pageSize: 10 };

        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-pagination-controls")).toBeTruthy();
        });
    });

    it("shows only current page rows", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = sampleData;
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = { enabled: true, pageSize: 10 };

        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const rows = root.querySelectorAll(".grid-row");
            expect(rows.length).toBe(10);
        });
    });

    it("getPaginationState reflects client totals", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = sampleData;
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = { enabled: true, pageSize: 10 };

        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getPaginationState().totalRows).toBe(25);
            expect(grid.getPaginationState().totalPages).toBe(3);
        });
    });

    it("goToPage navigates to requested page", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = sampleData;
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = { enabled: true, pageSize: 10 };

        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.getPaginationState().pageIndex).toBe(0);
        });

        grid.goToPage(2);

        await waitFor(() => {
            expect(grid.getPaginationState().pageIndex).toBe(2);
            const root = grid.shadowRoot || grid;
            const rows = root.querySelectorAll(".grid-row");
            expect(rows.length).toBe(5);
        });
    });

    it("setPageSize resets to first page", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = sampleData;
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = { enabled: true, pageSize: 10 };

        container.appendChild(grid);

        await waitFor(() => {
            grid.goToPage(2);
        });

        grid.setPageSize(5);

        await waitFor(() => {
            const state = grid.getPaginationState();
            expect(state.pageIndex).toBe(0);
            expect(state.pageSize).toBe(5);
            expect(state.totalPages).toBe(5);
        });
    });
});

describe("Grid server pagination", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("loads data via onServerPagination", async () => {
        const fetchPage = vi.fn(async (page: number, pageSize: number) => ({
            data: Array.from({ length: pageSize }, (_, i) => ({
                id: page * pageSize + i + 1,
                name: `Server ${page * pageSize + i + 1}`,
            })),
            total: 50,
            page,
            pageSize,
        }));

        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [];
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.paginationConfig = {
            enabled: true,
            mode: "server",
            pageSize: 10,
            serverTotalRows: 50,
            onServerPagination: fetchPage,
        };

        container.appendChild(grid);

        await waitFor(() => {
            expect(fetchPage).toHaveBeenCalledWith(0, 10);
            expect(grid.getPaginationState().totalRows).toBe(50);
            const root = grid.shadowRoot || grid;
            expect(root.querySelectorAll(".grid-row").length).toBe(10);
        });

        grid.goToPage(1);

        await waitFor(() => {
            expect(fetchPage).toHaveBeenCalledWith(1, 10);
            expect(grid.getPaginationState().pageIndex).toBe(1);
        });
    });
});

describe("createGrid pagination", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it("accepts pagination config", async () => {
        const data = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
        }));

        const grid = createGrid({
            data,
            columns: [{ accessorKey: "name", header: "Name" }],
            pagination: { enabled: true, pageSize: 5 },
            container,
        }) as any;

        await waitFor(() => {
            expect(grid.getPaginationState().totalPages).toBe(3);
        });
    });
});

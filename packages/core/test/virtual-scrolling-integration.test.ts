import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";

const ROW_HEIGHT = 50;
const ROW_COUNT = 200;
const VIEWPORT_HEIGHT = 400;

function makeRowData(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        userId: String(i),
        name: `Row ${i}`,
    }));
}

type VirtualizedGrid = HTMLElement & {
    data: unknown[];
    columns: unknown[];
    bodyScrollElement: HTMLElement | null;
    virtualizationConfig: { enabled: boolean; rowHeight: number; overscan: number };
    scrollToRow: (index: number) => void;
    getVisibleRowRange: () => { start: number; end: number };
};

function mountGrid(container: HTMLElement): VirtualizedGrid {
    const grid = document.createElement("wsx-ac-grid") as VirtualizedGrid;
    grid.style.display = "block";
    grid.style.height = "100%";
    grid.style.width = "100%";
    container.appendChild(grid);
    return grid;
}

function enableVirtualization(grid: VirtualizedGrid) {
    Object.defineProperty(grid.bodyScrollElement!, "clientHeight", {
        get: () => VIEWPORT_HEIGHT,
        configurable: true,
    });
    grid.virtualizationConfig = {
        enabled: true,
        rowHeight: ROW_HEIGHT,
        overscan: 5,
    };
}

describe("Grid Virtual Scrolling Integration", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        container.style.height = `${VIEWPORT_HEIGHT}px`;
        container.style.width = "600px";
        container.style.overflow = "hidden";
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("renders a window of rows instead of the full dataset", async () => {
        const grid = mountGrid(container);
        grid.data = makeRowData(ROW_COUNT);
        grid.columns = [{ accessorKey: "name", header: "Name" }];

        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        enableVirtualization(grid);

        await waitFor(() => {
            const range = grid.getVisibleRowRange();
            expect(range.start).toBe(0);
            expect(range.end).toBeGreaterThan(0);
            expect(range.end).toBeLessThan(ROW_COUNT);
        });
    });

    it("updates visible range after scrollToRow", async () => {
        const grid = mountGrid(container);
        grid.data = makeRowData(ROW_COUNT);
        grid.columns = [{ accessorKey: "name", header: "Name" }];

        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        enableVirtualization(grid);

        grid.scrollToRow(25);

        await waitFor(() => {
            const range = grid.getVisibleRowRange();
            expect(range.start).toBeLessThanOrEqual(25);
            expect(range.end).toBeGreaterThan(25);
        });
    });

    it("scrollToRow moves the viewport to the requested index", async () => {
        const grid = mountGrid(container);
        grid.data = makeRowData(ROW_COUNT);
        grid.columns = [{ accessorKey: "name", header: "Name" }];

        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        enableVirtualization(grid);
        grid.scrollToRow(40);

        const range = grid.getVisibleRowRange();
        expect(range.start).toBeLessThanOrEqual(40);
        expect(range.end).toBeGreaterThan(40);
    });

    it("clamps scrollToRow for out-of-bounds index", async () => {
        const grid = mountGrid(container);
        grid.data = makeRowData(ROW_COUNT);
        grid.columns = [{ accessorKey: "name", header: "Name" }];

        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        enableVirtualization(grid);
        grid.scrollToRow(9999);

        const range = grid.getVisibleRowRange();
        expect(range.end).toBeLessThanOrEqual(ROW_COUNT);
        expect(range.start).toBeLessThan(range.end);
        expect(grid.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
    });

    it("keeps rows visible after data shrinks while scrolled deep", async () => {
        const grid = mountGrid(container);
        grid.data = makeRowData(ROW_COUNT);
        grid.columns = [{ accessorKey: "name", header: "Name" }];

        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        enableVirtualization(grid);
        grid.scrollToRow(150);
        grid.data = makeRowData(5);

        await waitFor(() => {
            const range = grid.getVisibleRowRange();
            expect(range.end).toBeLessThanOrEqual(5);
            expect(range.start).toBeLessThan(range.end);
            expect(grid.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
        });
    });
});

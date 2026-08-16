import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/dom";

import "../src/components/Grid.wsx";
import { HEADER_SCROLL_HANDLER_KEY } from "../src/utils/scroll-sync";

const VIEWPORT_WIDTH = 300;
const VIEWPORT_HEIGHT = 400;
const WIDE_COLUMN_SIZE = 200;

type ScrollSyncGrid = HTMLElement & {
    data: Array<Record<string, string>>;
    columns: Array<{ id: string; accessorKey: string; header: string; size: number }>;
    sortingConfig?: { enabled: boolean };
    virtualizationConfig?: { enabled: boolean; rowHeight?: number; overscan?: number };
    bodyScrollElement: HTMLElement | null;
};

function makeWideColumns(count: number) {
    return Array.from({ length: count }, (_, index) => {
        const key = `col${index}`;
        return {
            id: key,
            accessorKey: key,
            header: `Column ${index}`,
            size: WIDE_COLUMN_SIZE,
        };
    });
}

function makeRow(columnKeys: string[]) {
    return Object.fromEntries(columnKeys.map((key) => [key, key.toUpperCase()]));
}

function mountScrollSyncGrid(
    container: HTMLElement,
    options?: { virtualization?: boolean },
): ScrollSyncGrid {
    const columnKeys = ["a", "b", "c", "d"];
    const grid = document.createElement("wsx-ac-grid") as ScrollSyncGrid;
    grid.data = [makeRow(columnKeys)];
    grid.columns = makeWideColumns(columnKeys.length);
    grid.sortingConfig = { enabled: false };

    if (options?.virtualization) {
        grid.virtualizationConfig = {
            enabled: true,
            rowHeight: 35,
            overscan: 3,
        };
    }

    container.appendChild(grid);
    return grid;
}

async function waitForScrollElements(grid: ScrollSyncGrid) {
    await waitFor(() => {
        expect(grid.querySelector(".grid-body")).toBeTruthy();
        expect(grid.querySelector(".grid-header")).toBeTruthy();
        expect(grid.bodyScrollElement).toBeTruthy();
    });
}

function dispatchBodyScroll(body: HTMLElement, scrollLeft: number) {
    body.scrollLeft = scrollLeft;
    body.dispatchEvent(new Event("scroll"));
}

function dispatchHeaderScroll(header: HTMLElement, scrollLeft: number) {
    header.scrollLeft = scrollLeft;
    header.dispatchEvent(new Event("scroll"));
}

describe("Grid horizontal scroll sync", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        container.style.width = `${VIEWPORT_WIDTH}px`;
        container.style.height = `${VIEWPORT_HEIGHT}px`;
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("syncs header scrollLeft when body scrolls horizontally without virtualization", async () => {
        const grid = mountScrollSyncGrid(container);
        await waitForScrollElements(grid);

        const body = grid.querySelector(".grid-body") as HTMLElement;
        const header = grid.querySelector(".grid-header") as HTMLElement;

        dispatchBodyScroll(body, 120);

        await waitFor(() => {
            expect(header.scrollLeft).toBe(120);
        });
    });

    it("syncs body scrollLeft when header scrolls horizontally without virtualization", async () => {
        const grid = mountScrollSyncGrid(container);
        await waitForScrollElements(grid);

        const body = grid.querySelector(".grid-body") as HTMLElement;
        const header = grid.querySelector(".grid-header") as HTMLElement;

        dispatchHeaderScroll(header, 80);

        await waitFor(() => {
            expect(body.scrollLeft).toBe(80);
        });
    });

    it("syncs header scrollLeft when body scrolls horizontally with virtualization enabled", async () => {
        const grid = mountScrollSyncGrid(container, { virtualization: true });
        await waitForScrollElements(grid);

        if (grid.bodyScrollElement) {
            Object.defineProperty(grid.bodyScrollElement, "clientHeight", {
                get: () => VIEWPORT_HEIGHT,
                configurable: true,
            });
        }

        const body = grid.querySelector(".grid-body") as HTMLElement;
        const header = grid.querySelector(".grid-header") as HTMLElement;

        dispatchBodyScroll(body, 150);

        await waitFor(() => {
            expect(header.scrollLeft).toBe(150);
        });
    });

    it("attaches body-to-header scroll listener after body mounts", async () => {
        const grid = mountScrollSyncGrid(container);
        await waitForScrollElements(grid);

        const body = grid.querySelector(".grid-body") as HTMLElement & {
            [HEADER_SCROLL_HANDLER_KEY]?: EventListener;
        };

        expect(body[HEADER_SCROLL_HANDLER_KEY]).toBeTruthy();
    });
});

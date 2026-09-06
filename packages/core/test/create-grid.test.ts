import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "../src/components/Grid.wsx";
import { createGrid } from "../src/utils/create-grid";

const NAME_COLUMN_ID = "name";

describe("createGrid", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("applies optional grid configuration and mounts into a container", () => {
        const grid = createGrid({
            data: [{ userId: "1", name: "Ada" }],
            columns: [{ accessorKey: NAME_COLUMN_ID, header: "Name" }],
            className: "demo-grid",
            sorting: { enabled: true },
            filtering: { enabled: true },
            resizing: { enabled: true },
            selection: { enabled: true },
            virtualization: { enabled: false },
            pagination: { enabled: true, pageSize: 10 },
            pinning: { enabled: true },
            components: { isLoading: true },
            grouping: {
                enabled: true,
                initialGrouping: [NAME_COLUMN_ID],
            },
            container,
        }) as HTMLElement & {
            className: string;
            sortingConfig: { enabled?: boolean };
            filteringConfig: { enabled?: boolean };
            resizingConfig: { enabled?: boolean };
            selectionConfig: { enabled?: boolean };
            virtualizationConfig: { enabled?: boolean };
            paginationConfig: { enabled?: boolean; pageSize?: number };
            pinningConfig: { enabled?: boolean };
            componentsConfig: { isLoading?: boolean };
            groupingConfig: { enabled?: boolean; initialGrouping?: string[] };
        };

        expect(container.contains(grid)).toBe(true);
        expect(grid.className).toBe("demo-grid");
        expect(grid.sortingConfig.enabled).toBe(true);
        expect(grid.filteringConfig.enabled).toBe(true);
        expect(grid.resizingConfig.enabled).toBe(true);
        expect(grid.selectionConfig.enabled).toBe(true);
        expect(grid.virtualizationConfig.enabled).toBe(false);
        expect(grid.paginationConfig.enabled).toBe(true);
        expect(grid.paginationConfig.pageSize).toBe(10);
        expect(grid.pinningConfig.enabled).toBe(true);
        expect(grid.componentsConfig.isLoading).toBe(true);
        expect(grid.groupingConfig.initialGrouping).toEqual([NAME_COLUMN_ID]);
    });
});

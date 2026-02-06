/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Grid } from "../src/components/Grid.wsx";
import "../src/components/Grid.wsx"; // Register component
import { waitFor } from "@testing-library/dom";

describe("Grid Filtering", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("should render filtering UI when enabled", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ id: 1, name: "Test" }];
        grid.columns = [
            { accessorKey: "name", header: "Name", enableColumnFilter: true }
        ];
        grid.filteringConfig = {
            enabled: true,
        };
        
        container.appendChild(grid);

        // Wait for render
        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const headerCell = root.querySelector(".grid-header-cell");
            expect(headerCell).toBeTruthy();
            const filterIcon = headerCell?.querySelector("wsx-ac-filter-icon");
            expect(filterIcon).toBeTruthy();
        });

        // Expect GlobalSearch to NOT be present by default (it's external)
        const root = grid.shadowRoot || grid;
        const globalSearch = root.querySelector("wsx-ac-global-search");
        expect(globalSearch).toBeFalsy();
    });

    it("should not render filtering UI when disabled", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ id: 1, name: "Test" }];
        grid.columns = [
            { accessorKey: "name", header: "Name" }
        ];
        // Default should be disabled or explicitly false
        
        container.appendChild(grid);
        await new Promise(r => setTimeout(r, 0));

        const root = grid.shadowRoot || grid;
        const globalSearch = root.querySelector("wsx-ac-global-search");
        expect(globalSearch).toBeFalsy();
        
        const headerCell = root.querySelector(".grid-header-cell");
        // Header cell might exist, but filter icon should not
        if (headerCell) {
            const filterIcon = headerCell.querySelector("wsx-ac-filter-icon");
            expect(filterIcon).toBeFalsy();
        }
    });
});

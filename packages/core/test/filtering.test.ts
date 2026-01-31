/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Grid } from "../src/components/Grid.wsx";
import "../src/components/Grid.wsx"; // Register component
// We will need these later
// import "../src/components/GlobalSearch.wsx";
// import "../src/components/FilterMenu.wsx";

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
        await new Promise(r => setTimeout(r, 0));

        // Expect GlobalSearch to be present
        const globalSearch = grid.shadowRoot?.querySelector("wsx-ac-global-search") || grid.querySelector("wsx-ac-global-search");
        expect(globalSearch).toBeTruthy();

        // Expect Filter Icon in header
        const headerCell = grid.shadowRoot?.querySelector(".grid-header-cell");
        // We'll need to check how Filter Icon is implemented in RFC
        // It might be wsx-ac-filter-icon
        const filterIcon = headerCell?.querySelector("wsx-ac-filter-icon");
        expect(filterIcon).toBeTruthy();
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

        const globalSearch = grid.shadowRoot?.querySelector("wsx-ac-global-search");
        expect(globalSearch).toBeFalsy();
    });
});

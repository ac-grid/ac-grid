/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { waitFor } from "@testing-library/dom";
import "../src/components/Grid.wsx";
import {
    registerComponent,
    clearComponentRegistry,
} from "../src/utils/component-registry";
import { ComponentPortal } from "../src/utils/component-portal";
import { renderComponent } from "../src/utils/render-component";
import { resolveHeaderContent } from "../src/utils/resolve-header-content";
import { createTable, getCoreRowModel } from "@tanstack/table-core";

describe("component-registry", () => {
    afterEach(() => {
        clearComponentRegistry();
    });

    it("registers and resolves components by name", () => {
        registerComponent("testHeader", () => {
            const el = document.createElement("span");
            el.textContent = "registered";
            return el;
        });
        const result = renderComponent("testHeader", {});
        expect(result).toBeInstanceOf(HTMLElement);
        expect((result as HTMLElement).textContent).toBe("registered");
    });
});

describe("ComponentPortal", () => {
    let host: HTMLElement;

    beforeEach(() => {
        host = document.createElement("div");
        document.body.appendChild(host);
    });

    afterEach(() => {
        document.body.removeChild(host);
    });

    it("mounts and unmounts without leaking DOM nodes", () => {
        const portal = new ComponentPortal();
        portal.mount(host, () => {
            const el = document.createElement("div");
            el.className = "portal-child";
            return el;
        });
        expect(host.querySelector(".portal-child")).toBeTruthy();
        portal.unmount();
        expect(host.childNodes.length).toBe(0);
    });
});

describe("Grid custom components (RFC-0019)", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        clearComponentRegistry();
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
        clearComponentRegistry();
        document.querySelectorAll(".ac-grid-filter-menu-portal").forEach((el) => el.remove());
    });

    it("renders custom headerComponent", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Alice" }];
        grid.columns = [
            {
                accessorKey: "name",
                header: "Name",
                headerComponent: () => {
                    const el = document.createElement("strong");
                    el.textContent = "Custom Header";
                    return el;
                },
            },
        ];
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const strong = root.querySelector("strong");
            expect(strong?.textContent).toBe("Custom Header");
        });
    });

    it("shows loading overlay when isLoading is true", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Alice" }];
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.componentsConfig = {
            isLoading: true,
            loadingOverlayComponent: () => {
                const el = document.createElement("div");
                el.className = "custom-loading";
                el.textContent = "Loading...";
                return el;
            },
        };
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const overlay = root.querySelector(".grid-overlay[data-overlay-type='loading']");
            expect(overlay).toBeTruthy();
            expect(overlay?.querySelector(".custom-loading")?.textContent).toBe("Loading...");
        });
    });

    it("shows noRows overlay when filtered data is empty", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Alice" }];
        grid.columns = [
            { accessorKey: "name", header: "Name", enableColumnFilter: true },
        ];
        grid.filteringConfig = { enabled: true };
        grid.componentsConfig = {
            noRowsOverlayComponent: () => {
                const el = document.createElement("div");
                el.className = "custom-no-rows";
                el.textContent = "No rows";
                return el;
            },
        };
        container.appendChild(grid);
        grid.setColumnFilter("name", "zzzz-not-found");

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const overlay = root.querySelector(".grid-overlay[data-overlay-type='no-rows']");
            expect(overlay).toBeTruthy();
            expect(overlay?.querySelector(".custom-no-rows")?.textContent).toBe("No rows");
        });
    });

    it("renders fullWidthRow when isFullWidthRow matches", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [
            { userId: "1", name: "Alice", type: "detail" },
            { userId: "2", name: "Bob", type: "normal" },
        ];
        grid.columns = [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "type", header: "Type" },
        ];
        grid.componentsConfig = {
            isFullWidthRow: (row: { original: { type: string } }) =>
                row.original.type === "detail",
            fullWidthRowComponent: ({ row }: { row: { original: { name: string } } }) => {
                const el = document.createElement("div");
                el.className = "full-width-detail";
                el.textContent = `Detail: ${row.original.name}`;
                return el;
            },
        };
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const fullWidth = root.querySelector(".grid-row-full-width .full-width-detail");
            expect(fullWidth?.textContent).toBe("Detail: Alice");
        });
    });

    it("uses registered filterComponent in filter menu portal", async () => {
        registerComponent("customFilter", ({ onFilterChange }: { onFilterChange: (v: string) => void }) => {
            const el = document.createElement("button");
            el.className = "custom-filter-btn";
            el.textContent = "Apply";
            el.addEventListener("click", () => onFilterChange("Bob"));
            return el;
        });

        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [
            { userId: "1", name: "Alice" },
            { userId: "2", name: "Bob" },
        ];
        grid.columns = [
            {
                accessorKey: "name",
                header: "Name",
                enableColumnFilter: true,
                filterComponent: "customFilter",
            },
        ];
        grid.filteringConfig = { enabled: true };
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-filter-icon")).toBeTruthy();
        });

        const root = grid.shadowRoot || grid;
        const clickTarget = root.querySelector("wsx-ac-filter-icon")?.parentElement as HTMLElement;
        clickTarget?.click();

        await waitFor(() => {
            const portal = document.querySelector(".ac-grid-filter-menu-portal");
            expect(portal?.querySelector(".custom-filter-btn")).toBeTruthy();
        });

        (document.querySelector(".custom-filter-btn") as HTMLButtonElement)?.click();

        await waitFor(() => {
            expect(grid.getFilterState().columnFilters.name).toBe("Bob");
        });
    });
});

describe("resolveHeaderContent", () => {
    it("falls back to flexRender when headerComponent is absent", () => {
        const table = createTable({
            data: [{ name: "A" }],
            columns: [{ accessorKey: "name", header: "Name" }],
            getCoreRowModel: getCoreRowModel(),
            state: { columnPinning: { left: [], right: [] } },
            onStateChange: () => {},
            renderFallbackValue: null,
        });
        const header = table.getHeaderGroups()[0].headers[0];
        expect(resolveHeaderContent(header)).toBe("Name");
    });
});

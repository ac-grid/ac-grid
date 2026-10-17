import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/dom";
import "../src/components/Grid.wsx";

describe("Grid accessibility semantics", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    it("exposes an accessible grid name, dimensions, headers, rows, and cells", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.ariaLabel = "People";
        grid.ariaDescription = "Employee directory";
        grid.data = [{ userId: "1", name: "Ada" }];
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const accessibleGrid = root.querySelector('[role="grid"]');
            expect(accessibleGrid?.getAttribute("aria-label")).toBe("People");
            expect(accessibleGrid?.getAttribute("aria-description")).toBe("Employee directory");
            expect(accessibleGrid?.getAttribute("aria-colcount")).toBe("1");
            expect(root.querySelector('[role="columnheader"]')?.getAttribute("aria-label")).toBe("Name");
            expect(root.querySelector('[role="row"][aria-rowindex="2"]')).toBeTruthy();
            expect(root.querySelector('[role="gridcell"][aria-colindex="1"]')?.textContent).toContain("Ada");
        });
    });

    it("provides a default grid name and reports selected rows", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Ada" }];
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.selectionConfig = { enabled: true, mode: "single" };
        container.appendChild(grid);

        await waitFor(() => expect(grid.getSelectedRowIds()).toEqual([]));
        grid.selectRow("1");

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector('[role="grid"]')?.getAttribute("aria-label")).toBe("Data grid");
            expect(root.querySelector('.grid-row[role="row"]')?.getAttribute("aria-selected")).toBe("true");
        });
    });
});

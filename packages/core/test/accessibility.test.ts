import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import "../src/components/Grid.wsx";
import "../src/components/CellEditor.wsx";

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
            expect(root.querySelector('[role="status"]')?.textContent).toContain("Row selected");
        });
    });

    it("announces a sort change to assistive technology", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Ada" }];
        grid.columns = [{ accessorKey: "name", header: "Name" }];
        grid.sortingConfig = { enabled: true };
        container.appendChild(grid);

        const root = grid.shadowRoot || grid;
        const header = await waitFor(() => {
            const element = root.querySelector('[role="columnheader"]') as HTMLElement | null;
            expect(element).toBeTruthy();
            return element!;
        });
        header.click();

        await waitFor(() => expect(root.querySelector('[role="status"]')?.textContent).toContain("Name sorting ascending"));
    });

    it("announces clearing sort after the complete sort cycle", async () => {
        for (const { initialSort, expectedSort, announcement } of [
            { initialSort: undefined, expectedSort: "ascending", announcement: "Name sorting ascending" },
            { initialSort: [{ id: "name", desc: false }], expectedSort: "descending", announcement: "Name sorting descending" },
            { initialSort: [{ id: "name", desc: true }], expectedSort: "none", announcement: "Name sorting cleared" },
        ]) {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = [{ userId: "1", name: "Ada" }];
            grid.columns = [{ accessorKey: "name", header: "Name" }];
            grid.sortingConfig = { enabled: true, initialState: initialSort };
            container.appendChild(grid);
            const root = grid.shadowRoot || grid;
            const header = await waitFor(() => {
                const element = root.querySelector('[role="columnheader"]') as HTMLElement | null;
                expect(element).toBeTruthy();
                return element!;
            });
            expect(header.getAttribute("aria-sort")).toBe(initialSort ? (initialSort[0].desc ? "descending" : "ascending") : "none");
            header.click();
            await waitFor(() => {
                expect(root.querySelector('[role="columnheader"]')?.getAttribute("aria-sort")).toBe(expectedSort);
                expect(root.querySelector('[role="status"]')?.textContent).toBe(announcement);
            });
        }
    });

    it("announces shift-range selection and select-all/select-none", async () => {
        const createGrid = () => {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = ["1", "2", "3"].map((userId) => ({ userId, name: `Person ${userId}` }));
            grid.columns = [{ accessorKey: "name", header: "Name" }];
            grid.selectionConfig = { enabled: true, mode: "multiple" };
            container.appendChild(grid);
            return { grid, root: grid.shadowRoot || grid };
        };

        const range = createGrid();
        await waitFor(() => expect(range.root.querySelector('[role="row"][data-row-id="1"]')).toBeTruthy());
        range.grid.selectRowRange("1", "2");
        await waitFor(() => {
            expect(range.root.querySelector('[role="status"]')?.textContent).toBe("Rows selected");
            expect(range.root.querySelector('[role="row"][data-row-id="1"]')?.getAttribute("aria-selected")).toBe("true");
            expect(range.root.querySelector('[role="row"][data-row-id="2"]')?.getAttribute("aria-selected")).toBe("true");
        });

        const all = createGrid();
        await waitFor(() => expect(all.root.querySelector('[role="row"][data-row-id="1"]')).toBeTruthy());
        all.grid.selectAll();
        await waitFor(() => {
            expect(all.root.querySelector('[role="status"]')?.textContent).toBe("All rows selected");
            for (const rowId of ["1", "2", "3"]) {
                expect(all.root.querySelector(`[role="row"][data-row-id="${rowId}"]`)?.getAttribute("aria-selected")).toBe("true");
            }
        });

        const none = createGrid();
        await waitFor(() => expect(none.root.querySelector('[role="row"][data-row-id="1"]')).toBeTruthy());
        none.grid.deselectAll();
        await waitFor(() => {
            expect(none.root.querySelector('[role="status"]')?.textContent).toBe("Selection cleared");
            for (const rowId of ["1", "2", "3"]) {
                expect(none.root.querySelector(`[role="row"][data-row-id="${rowId}"]`)?.getAttribute("aria-selected")).toBe("false");
            }
        });
    });

    it("notifies sorting config when a header is clicked", async () => {
        const onSortingChange = vi.fn();
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [{ userId: "1", name: "Ada" }];
        grid.columns = [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "city", header: "City" },
        ];
        grid.sortingConfig = {
            enabled: true,
            initialState: [
                { id: "name", desc: false },
                { id: "city", desc: false },
            ],
            onSortingChange,
        };
        container.appendChild(grid);
        const root = grid.shadowRoot || grid;
        const header = await waitFor(() => {
            const element = root.querySelector('[role="columnheader"]') as HTMLElement | null;
            expect(element).toBeTruthy();
            return element!;
        });

        header.click();

        await waitFor(() => expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", desc: true }]));
    });

    it("provides absolute row and column indexes in a virtualized window", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = Array.from({ length: 100 }, (_, index) => ({ userId: String(index), name: `Person ${index}`, city: `City ${index}` }));
        grid.columns = [
            { accessorKey: "name", header: "Name" },
            { accessorKey: "city", header: "City" },
        ];
        container.style.height = "200px";
        container.appendChild(grid);
        await waitFor(() => expect(grid.bodyScrollElement).toBeTruthy());
        Object.defineProperty(grid.bodyScrollElement, "clientHeight", { get: () => 100, configurable: true });
        grid.virtualizationConfig = { enabled: true, rowHeight: 20, overscan: 1 };
        grid.scrollToRow(50);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            const target = root.querySelector('[role="row"][aria-rowindex="52"]');
            expect(target).toBeTruthy();
            expect(target.querySelector('[role="gridcell"][aria-colindex="1"]')).toBeTruthy();
            expect(target.querySelector('[role="gridcell"][aria-colindex="2"]')).toBeTruthy();
        });
    });

    it("keeps grouped-row expanded state synchronized with expansion", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [
            { userId: "1", team: "A", name: "Ada" },
            { userId: "2", team: "A", name: "Alan" },
        ];
        grid.columns = [
            { accessorKey: "team", header: "Team" },
            { accessorKey: "name", header: "Name" },
        ];
        grid.groupingConfig = { enabled: true, initialGrouping: ["team"] };
        container.appendChild(grid);
        const root = grid.shadowRoot || grid;

        await waitFor(() => expect(root.querySelector('.grid-row-grouped[aria-expanded="false"]')).toBeTruthy());
        const group = grid.table.getGroupedRowModel().rows[0];
        grid.toggleGroup(group.id, true);
        await waitFor(() => expect(root.querySelector('.grid-row-grouped[aria-expanded="true"]')).toBeTruthy());
    });

    it("moves focus between cells with arrow keys and returns focus after canceling edit", async () => {
        const grid = document.createElement("wsx-ac-grid") as any;
        grid.data = [
            { userId: "1", name: "Ada", city: "London" },
            { userId: "2", name: "Alan", city: "Oxford" },
        ];
        grid.columns = [
            { accessorKey: "name", header: "Name", editor: "text" },
            { accessorKey: "city", header: "City" },
        ];
        grid.editingConfig = { enabled: true, editTrigger: "enter" };
        container.appendChild(grid);
        const root = grid.shadowRoot || grid;
        const getFocusedCell = () => {
            const activeElement = grid.shadowRoot ? grid.shadowRoot.activeElement : document.activeElement;
            return activeElement?.matches('[role="gridcell"]')
                ? `${(activeElement as HTMLElement).dataset.rowId}:${(activeElement as HTMLElement).dataset.columnId}`
                : null;
        };

        const firstCell = await waitFor(() => {
            const cell = root.querySelector('[role="gridcell"][data-row-id="1"][data-column-id="name"]') as HTMLElement | null;
            expect(cell).toBeTruthy();
            return cell!;
        });
        firstCell.focus();
        firstCell.firstElementChild?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        await waitFor(() => expect(getFocusedCell()).toBe("1:name"));
        firstCell.focus();
        firstCell.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
        await waitFor(() => expect(getFocusedCell()).toBe("1:city"));

        const focusedSecondCell = root.querySelector('[role="gridcell"][data-row-id="1"][data-column-id="city"]') as HTMLElement;
        focusedSecondCell.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        await waitFor(() => expect(getFocusedCell()).toBe("2:city"));
        const focusedEditCell = root.querySelector('[role="gridcell"][data-row-id="2"][data-column-id="name"]') as HTMLElement;
        focusedEditCell.focus();
        focusedEditCell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        await waitFor(() => expect(root.querySelector("wsx-ac-cell-editor")).toBeTruthy());
        grid.cancelEdit();
        await waitFor(() => expect(getFocusedCell()).toBe("2:name"));
    });
});

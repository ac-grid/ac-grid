/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../src/components/Grid.wsx";
import "../src/components/CellEditor.wsx";
import { waitFor } from "@testing-library/dom";

const TEST_ROWS = [
    { userId: "u1", name: "Alice", age: 30 },
    { userId: "u2", name: "Bob", age: 25 },
];

const TEST_COLUMNS = [
    { accessorKey: "name", header: "Name", id: "name" },
    {
        accessorKey: "age",
        header: "Age",
        id: "age",
        filterType: "number" as const,
        editor: "number" as const,
    },
];

function createEditingGrid(overrides: Record<string, unknown> = {}) {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = TEST_ROWS;
    grid.columns = TEST_COLUMNS;
    grid.getRowId = (row: { userId: string }) => row.userId;
    grid.editingConfig = {
        enabled: true,
        editTrigger: "doubleClick",
        ...overrides,
    };
    return grid;
}

describe("Grid Cell Editing", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        container.innerHTML = "";
    });

    it("does not show editor when editing is disabled", async () => {
        const grid = createEditingGrid({ enabled: false });
        container.appendChild(grid);

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-cell-editor")).toBeFalsy();
        });

        grid.startEdit("u1", "name", "Alice");
        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-cell-editor")).toBeFalsy();
        });
    });

    it("startEdit shows cell editor", async () => {
        const grid = createEditingGrid();
        container.appendChild(grid);

        await waitFor(() => {
            expect(grid.shadowRoot || grid).toBeTruthy();
        });

        grid.startEdit("u1", "name", "Alice");

        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-cell-editor")).toBeTruthy();
        });
    });

    it("saveEdit fires onEditSave and clears edit state", async () => {
        const onEditSave = vi.fn();
        const grid = createEditingGrid({ onEditSave });
        container.appendChild(grid);

        await waitFor(() => expect(grid.table).toBeTruthy());

        grid.startEdit("u1", "name", "Alice");
        grid.saveEdit("Alicia");

        expect(onEditSave).toHaveBeenCalledWith("u1", "name", "Alicia");
        expect(grid.startEdit).toBeDefined();
        grid.startEdit("u1", "name");
        await waitFor(() => {
            const root = grid.shadowRoot || grid;
            expect(root.querySelector("wsx-ac-cell-editor")).toBeTruthy();
        });
    });

    it("cancelEdit fires onEditCancel", async () => {
        const onEditCancel = vi.fn();
        const grid = createEditingGrid({ onEditCancel });
        container.appendChild(grid);

        grid.startEdit("u1", "name", "Alice");
        grid.cancelEdit();

        expect(onEditCancel).toHaveBeenCalledWith("u1", "name");
    });

    it("onEditStart fires when editing begins", async () => {
        const onEditStart = vi.fn();
        const grid = createEditingGrid({ onEditStart });
        container.appendChild(grid);

        grid.startEdit("u2", "age", 25);
        expect(onEditStart).toHaveBeenCalledWith("u2", "age");
    });

    it("coerces number values on save", async () => {
        const onEditSave = vi.fn();
        const grid = createEditingGrid({ onEditSave });
        container.appendChild(grid);

        grid.startEdit("u1", "age", 30);
        grid.saveEdit("35");

        expect(onEditSave).toHaveBeenCalledWith("u1", "age", 35);
    });

    it("rejects invalid values when validateEdit fails", async () => {
        const onEditSave = vi.fn();
        const grid = createEditingGrid({ onEditSave });
        grid.columns = [
            {
                accessorKey: "age",
                header: "Age",
                id: "age",
                editor: "number",
                validateEdit: (v: unknown) => Number(v) >= 18 || "Must be 18+",
            },
        ];
        container.appendChild(grid);

        grid.startEdit("u1", "age", 30);
        grid.saveEdit("10");

        expect(onEditSave).not.toHaveBeenCalled();
    });

    it("skips editing for columns with enableEditing false", async () => {
        const onEditStart = vi.fn();
        const grid = createEditingGrid({ onEditStart });
        grid.columns = [
            {
                accessorKey: "name",
                header: "Name",
                id: "name",
                enableEditing: false,
            },
        ];
        container.appendChild(grid);

        grid.startEdit("u1", "name", "Alice");
        expect(onEditStart).not.toHaveBeenCalled();
    });

    describe("Enter trigger independent of keyboard navigation (RFC-0049)", () => {
        async function pressEnterOnNameCell(grid: any) {
            container.appendChild(grid);
            const root = () => (grid.shadowRoot || grid) as ParentNode;
            const cellSelector = '[role="gridcell"][data-column-id="name"]';
            await waitFor(() => expect(root().querySelector(cellSelector)).toBeTruthy());
            root()
                .querySelector<HTMLElement>(cellSelector)!
                .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
            return root;
        }

        it("opens the editor on Enter when editTrigger is 'both' and keyboard navigation is off", async () => {
            const onEditStart = vi.fn();
            const grid = createEditingGrid({ editTrigger: "both", onEditStart });
            const root = await pressEnterOnNameCell(grid);

            await waitFor(() => expect(root().querySelector("wsx-ac-cell-editor")).toBeTruthy());
            const input = root().querySelector<HTMLInputElement>("wsx-ac-cell-editor input");
            await waitFor(() => {
                expect(input).toBeTruthy();
                expect(input!.value).toBe("Alice");
                expect(document.activeElement === input || (root() as any).activeElement === input).toBe(true);
            });
            expect(onEditStart).toHaveBeenCalledTimes(1);
            expect(onEditStart).toHaveBeenCalledWith("u1", "name");
        });

        it("does not open the editor on Enter when editTrigger is 'doubleClick'", async () => {
            const onEditStart = vi.fn();
            const grid = createEditingGrid({ editTrigger: "doubleClick", onEditStart });
            const root = await pressEnterOnNameCell(grid);

            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(root().querySelector("wsx-ac-cell-editor")).toBeFalsy();
            expect(onEditStart).not.toHaveBeenCalled();
        });

        it("starts editing exactly once when keyboard navigation is on", async () => {
            const onEditStart = vi.fn();
            const grid = createEditingGrid({ editTrigger: "both", onEditStart });
            grid.enableKeyboardNavigation = true;
            const root = await pressEnterOnNameCell(grid);

            await waitFor(() => expect(root().querySelector("wsx-ac-cell-editor")).toBeTruthy());
            await new Promise((resolve) => setTimeout(resolve, 100));
            const input = root().querySelector<HTMLInputElement>("wsx-ac-cell-editor input");
            expect(input?.value).toBe("Alice");
            expect(document.activeElement === input || (root() as any).activeElement === input).toBe(true);
            expect(onEditStart).toHaveBeenCalledTimes(1);
        });
    });

    it("Enter starts editing with the input focused and the original value shown (RFC-0048)", async () => {
        const grid = createEditingGrid({ editTrigger: "enter" });
        grid.enableKeyboardNavigation = true;
        container.appendChild(grid);

        const root = () => (grid.shadowRoot || grid) as ParentNode;
        await waitFor(() => {
            expect(root().querySelector('[role="gridcell"][data-column-id="name"]')).toBeTruthy();
        });

        const cell = root().querySelector<HTMLElement>('[role="gridcell"][data-column-id="name"]')!;
        cell.focus();
        cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        await waitFor(() => {
            const input = root().querySelector<HTMLInputElement>("wsx-ac-cell-editor input");
            expect(input).toBeTruthy();
            expect(input!.value).toBe("Alice");
            expect(document.activeElement === input || (root() as any).activeElement === input).toBe(true);
        });
    });

    it.each([
        { columnId: "name", editor: undefined, value: "Alice" },
        { columnId: "age", editor: "number", value: "30" },
        { columnId: "date", editor: "date", value: "2026-11-08" },
    ])("Enter preserves $columnId value and focuses editor input (RFC-0048)", async ({ columnId, editor, value }) => {
        const grid = createEditingGrid({ editTrigger: "enter" });
        grid.enableKeyboardNavigation = true;
        if (columnId === "date") {
            grid.data = [{ userId: "u1", date: value }];
            grid.columns = [{ id: "date", accessorKey: "date", header: "Date", editor }];
        }
        container.appendChild(grid);

        const root = () => (grid.shadowRoot || grid) as ParentNode;
        const cellSelector = `[role="gridcell"][data-column-id="${columnId}"]`;
        await waitFor(() => expect(root().querySelector(cellSelector)).toBeTruthy());
        const cell = root().querySelector<HTMLElement>(cellSelector)!;
        cell.focus();
        cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

        await waitFor(() => {
            const input = root().querySelector<HTMLInputElement>("wsx-ac-cell-editor input");
            expect(input).toBeTruthy();
            expect(input!.value).toBe(value);
            expect(input!.type).toBe(editor ?? "text");
            expect(document.activeElement === input || (root() as any).activeElement === input).toBe(true);
        });
    });

});

/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../src/components/Grid.wsx";
import "../src/components/SelectionCheckbox.wsx";
import { waitFor } from "@testing-library/dom";

// RFC-0056: selection checkbox / grid re-render defects found through the RFC-0007 E2E flake.

const ROWS = [
    { userId: "u1", name: "Alice" },
    { userId: "u2", name: "Bob" },
    { userId: "u3", name: "Charlie" },
];

function createGrid() {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = ROWS;
    grid.columns = [{ accessorKey: "name", header: "Name" }];
    grid.selectionConfig = { enabled: true, mode: "multiple", enableCheckbox: true };
    return grid;
}

const row = (grid: HTMLElement, id: string) => grid.querySelector<HTMLElement>(`.grid-row[data-row-id="${id}"]`);
const rowInput = (grid: HTMLElement, id: string) =>
    row(grid, id)!.querySelector<HTMLInputElement>("wsx-ac-selection-checkbox input")!;
const toggle = (input: HTMLInputElement, checked: boolean) => {
    input.checked = checked;
    input.dispatchEvent(new Event("change", { bubbles: true }));
};

describe("selection checkbox and grid re-render (RFC-0056)", () => {
    let container: HTMLElement;
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => {
        errors.push(event.message);
        event.preventDefault();
    };

    beforeEach(() => {
        errors.length = 0;
        window.addEventListener("error", onError);
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        window.removeEventListener("error", onError);
        container.remove();
    });

    it("a re-rendered row checkbox is checked when its row is selected", async () => {
        const grid = createGrid();
        container.appendChild(grid);
        await waitFor(() => expect(row(grid, "u1")).not.toBeNull());

        await waitFor(() => expect(rowInput(grid, "u1")).not.toBeNull());
        grid.selectRow("u1");

        await waitFor(() => expect(row(grid, "u1")!.dataset.selected).toBe("true"));
        await waitFor(() => expect(rowInput(grid, "u1").checked).toBe(true));
        expect(rowInput(grid, "u2").checked).toBe(false);
    });

    it("the grid re-renders at once for a selection made with the checkbox focused, and focus stays on that checkbox", async () => {
        const grid = createGrid();
        container.appendChild(grid);
        await waitFor(() => expect(rowInput(grid, "u2")).not.toBeNull());
        // Let the first render settle, so only the selection can trigger the next one.
        await new Promise((resolve) => setTimeout(resolve, 300));

        const input = rowInput(grid, "u2");
        input.focus();
        expect(document.activeElement).toBe(input);

        // wsx postpones a re-render while an input has focus. Advance fake frames instead of waiting on real
        // timers, so a postponed render stays unrendered rather than eventually being rendered by something else.
        vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "setTimeout", "clearTimeout"] });
        try {
            toggle(input, true);
            await vi.advanceTimersByTimeAsync(400);
        } finally {
            vi.useRealTimers();
        }

        expect(row(grid, "u2")!.dataset.selected).toBe("true");
        expect(document.activeElement).toBe(rowInput(grid, "u2"));
    });

    it("select-all selects and clears every row without throwing", async () => {
        const grid = createGrid();
        container.appendChild(grid);
        await waitFor(() => expect(row(grid, "u1")).not.toBeNull());

        const header = () =>
            (grid as HTMLElement).querySelector<HTMLInputElement>(".grid-header-row wsx-ac-selection-checkbox input")!;
        await waitFor(() => expect(header()).not.toBeNull());
        toggle(header(), true);
        await waitFor(() => expect(grid.getSelectedRowIds().sort()).toEqual(["u1", "u2", "u3"]));

        toggle(header(), false);
        await waitFor(() => expect(grid.getSelectedRowIds()).toEqual([]));
        expect(errors).toEqual([]);
    });
});

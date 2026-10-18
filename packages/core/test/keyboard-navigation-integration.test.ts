import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "../src/components/Grid.wsx";
import "../src/components/CellEditor.wsx";
import { waitFor } from "@testing-library/dom";

describe("Grid keyboard navigation", () => {
  let container: HTMLElement;
  beforeEach(() => { container = document.createElement("div"); document.body.appendChild(container); });
  afterEach(() => { container.remove(); });

  function makeGrid() {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.enableKeyboardNavigation = true;
    grid.keyboardNavigationMode = "cell";
    grid.data = [{ userId: "r1", name: "Ada", age: 30 }, { userId: "r2", name: "Lin", age: 25 }];
    grid.columns = [{ accessorKey: "name", id: "name", header: "Name" }, { accessorKey: "age", id: "age", header: "Age" }];
    return grid;
  }

  function root(grid: HTMLElement) { return grid.shadowRoot ?? grid; }

  it("exposes focusCell/getFocusedCell and renders grid ARIA roles", async () => {
    const grid = makeGrid(); container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector('[role="gridcell"]')).toBeTruthy());
    grid.focusCell("r1", "name");
    await waitFor(() => expect(document.activeElement?.getAttribute("data-column-id")).toBe("name"));
    expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
    expect(root(grid).querySelector('[role="grid"]')?.getAttribute("aria-colcount")).toBe("2");
  });

  it("keeps navigation opt-in while allowing programmatic focusCell", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ userId: "r1", name: "Ada" }];
    grid.columns = [{ accessorKey: "name", id: "name", header: "Name" }];
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector(".grid-cell[data-row-id]")).toBeTruthy());
    expect(grid.enableKeyboardNavigation).toBe(false);
    expect(root(grid).querySelector('[role="grid"]')).toBeTruthy();
    expect(root(grid).querySelector('[data-grid-cell]')).toBeNull();
    grid.focusCell("r1", "name");
    await waitFor(() => expect(document.activeElement?.getAttribute("data-column-id")).toBe("name"));
    expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
  });

  it("navigates cells with arrows and Tab without wrapping", async () => {
    const grid = makeGrid(); container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(4));
    grid.focusCell("r1", "name");
    root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await waitFor(() => expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "age" }));
    root(grid).querySelector('[data-row-id="r1"][data-column-id="age"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await waitFor(() => expect(grid.getFocusedCell()).toEqual({ rowId: "r2", columnId: "name" }));
  });

  it("does not hijack selection shortcuts inside unrelated inputs", async () => {
    const grid = makeGrid(); container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector(".grid-container")).toBeTruthy());
    const input = document.createElement("input");
    root(grid).querySelector(".grid-container").appendChild(input);
    const event = new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("uses Enter to start editing and Escape to clear the active edit", async () => {
    const grid = makeGrid();
    grid.editingConfig = { enabled: true };
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector("[data-grid-cell]")).toBeTruthy());
    grid.focusCell("r1", "name");
    root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    await waitFor(() => expect(root(grid).querySelector("wsx-ac-cell-editor")).toBeTruthy());
    root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    expect(grid.editingState.rowId).toBeNull();
  });

  it("selects all rows with Ctrl+A when row selection is enabled", async () => {
    const grid = makeGrid();
    grid.selectionConfig = { enabled: true, mode: "multiple" };
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector("[data-grid-cell]")).toBeTruthy());
    grid.focusCell("r1", "name");
    const event = new KeyboardEvent("keydown", { key: "a", ctrlKey: true, bubbles: true, cancelable: true });
    root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]').dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(grid.getSelectedRowIds()).toEqual(["r1", "r2"]);
  });

  it("saves the active edit and moves down on Enter", async () => {
    const grid = makeGrid();
    grid.editingConfig = { enabled: true };
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector("[data-grid-cell]")).toBeTruthy());
    grid.focusCell("r1", "name");
    grid.startEdit("r1", "name", "Ada");
    await waitFor(() => expect(root(grid).querySelector("wsx-ac-cell-editor input")).toBeTruthy());
    root(grid).querySelector("wsx-ac-cell-editor input").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true, cancelable: true }));
    await waitFor(() => expect(grid.getFocusedCell()).toEqual({ rowId: "r2", columnId: "name" }));
  });

  it("saves the active edit and follows Tab navigation", async () => {
    const grid = makeGrid();
    grid.editingConfig = { enabled: true };
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelector("[data-grid-cell]")).toBeTruthy());
    grid.focusCell("r1", "name");
    grid.startEdit("r1", "name", "Ada");
    await waitFor(() => expect(root(grid).querySelector("wsx-ac-cell-editor input")).toBeTruthy());
    root(grid).querySelector("wsx-ac-cell-editor input").dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true, composed: true, cancelable: true }));
    await waitFor(() => expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "age" }));
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    grid.editingConfig = { enabled: true, editTrigger: "both" };
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

  it("releases Tab at the last cell and Shift+Tab at the first cell without trapping focus", async () => {
    const grid = makeGrid();
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(4));

    grid.focusCell("r2", "age");
    await waitFor(() => {
      expect(grid.getFocusedCell()).toEqual({ rowId: "r2", columnId: "age" });
      expect(document.activeElement?.getAttribute("data-row-id")).toBe("r2");
      expect(document.activeElement?.getAttribute("data-column-id")).toBe("age");
    });
    const lastCell = root(grid).querySelector('[data-row-id="r2"][data-column-id="age"]') as HTMLElement;
    const forwardBoundaryEvent = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    lastCell.dispatchEvent(forwardBoundaryEvent);
    expect(forwardBoundaryEvent.defaultPrevented).toBe(false);
    expect(grid.getFocusedCell()).toEqual({ rowId: "r2", columnId: "age" });

    grid.focusCell("r1", "name");
    await waitFor(() => {
      expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
      expect(document.activeElement?.getAttribute("data-row-id")).toBe("r1");
      expect(document.activeElement?.getAttribute("data-column-id")).toBe("name");
    });
    const firstCell = root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]') as HTMLElement;
    const backwardBoundaryEvent = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    firstCell.dispatchEvent(backwardBoundaryEvent);
    expect(backwardBoundaryEvent.defaultPrevented).toBe(false);
    expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
  });

  it("releases both Tab and Shift+Tab on a single-cell grid", async () => {
    const grid = makeGrid();
    grid.data = [{ userId: "r1", name: "Ada" }];
    grid.columns = [{ accessorKey: "name", id: "name", header: "Name" }];
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(1));

    grid.focusCell("r1", "name");
    await waitFor(() => {
      expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
      expect(document.activeElement?.getAttribute("data-row-id")).toBe("r1");
      expect(document.activeElement?.getAttribute("data-column-id")).toBe("name");
    });

    const cell = root(grid).querySelector('[data-row-id="r1"][data-column-id="name"]') as HTMLElement;
    const tabEvent = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    cell.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);

    const shiftTabEvent = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    cell.dispatchEvent(shiftTabEvent);
    expect(shiftTabEvent.defaultPrevented).toBe(false);
    expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" });
  });

  it("navigates intermediate cells forward with Tab and backward with Shift+Tab", async () => {
    const grid = makeGrid();
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(4));

    const pressTab = async (
      from: { rowId: string; columnId: string },
      shiftKey: boolean,
      expected: { rowId: string; columnId: string },
    ) => {
      const cell = root(grid).querySelector(`[data-row-id="${from.rowId}"][data-column-id="${from.columnId}"]`) as HTMLElement;
      const event = new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true });
      cell.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await waitFor(() => expect(grid.getFocusedCell()).toEqual(expected));
    };

    grid.focusCell("r1", "name");
    await waitFor(() => expect(grid.getFocusedCell()).toEqual({ rowId: "r1", columnId: "name" }));

    await pressTab({ rowId: "r1", columnId: "name" }, false, { rowId: "r1", columnId: "age" });
    await pressTab({ rowId: "r1", columnId: "age" }, false, { rowId: "r2", columnId: "name" });
    await pressTab({ rowId: "r2", columnId: "name" }, false, { rowId: "r2", columnId: "age" });

    await pressTab({ rowId: "r2", columnId: "age" }, true, { rowId: "r2", columnId: "name" });
    await pressTab({ rowId: "r2", columnId: "name" }, true, { rowId: "r1", columnId: "age" });
    await pressTab({ rowId: "r1", columnId: "age" }, true, { rowId: "r1", columnId: "name" });
  });

  const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  async function expectBoundaryEditRelease(options: {
    rowId: string;
    columnId: string;
    initialValue: unknown;
    typedValue?: string;
    savedValue: unknown;
    shiftKey: boolean;
  }) {
    const onEditSave = vi.fn();
    const grid = makeGrid();
    grid.editingConfig = { enabled: true, onEditSave };
    const outsideButton = document.createElement("button");
    outsideButton.textContent = "Outside";
    container.appendChild(grid);
    container.appendChild(outsideButton);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(4));

    grid.focusCell(options.rowId, options.columnId);
    await waitFor(() => expect(document.activeElement?.getAttribute("data-column-id")).toBe(options.columnId));
    grid.startEdit(options.rowId, options.columnId, options.initialValue);

    const input = await waitFor(() => {
      const el = root(grid).querySelector("wsx-ac-cell-editor input") as HTMLInputElement | null;
      expect(el).toBeTruthy();
      expect(document.activeElement).toBe(el);
      return el!;
    });

    if (options.typedValue !== undefined) {
      input.value = options.typedValue;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: options.shiftKey,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(onEditSave).toHaveBeenCalledWith(options.rowId, options.columnId, options.savedValue);
    expect(grid.editingState.rowId).toBeNull();

    outsideButton.focus();
    await waitFor(() => expect(root(grid).querySelector("wsx-ac-cell-editor")).toBeNull());
    await nextFrame();
    await nextFrame();
    expect(document.activeElement).toBe(outsideButton);
  }

  it("saves and releases focus on Tab while editing the last cell", async () => {
    await expectBoundaryEditRelease({
      rowId: "r2",
      columnId: "age",
      initialValue: 25,
      typedValue: "28",
      savedValue: "28",
      shiftKey: false,
    });
  });

  it("saves and releases focus on Shift+Tab while editing the first cell", async () => {
    await expectBoundaryEditRelease({
      rowId: "r1",
      columnId: "name",
      initialValue: "Ada",
      typedValue: "Ada Lovelace",
      savedValue: "Ada Lovelace",
      shiftKey: true,
    });
  });

  async function expectInvalidBoundaryEditRetainsFocus(options: {
    rowId: string;
    columnId: string;
    initialValue: unknown;
    shiftKey: boolean;
    expectedError: string;
  }) {
    const onEditSave = vi.fn();
    const grid = makeGrid();
    grid.columns = [
      {
        accessorKey: "name",
        id: "name",
        header: "Name",
        validateEdit: options.columnId === "name" ? () => options.expectedError : undefined,
      },
      {
        accessorKey: "age",
        id: "age",
        header: "Age",
        validateEdit: options.columnId === "age" ? () => options.expectedError : undefined,
      },
    ];
    grid.editingConfig = { enabled: true, onEditSave };
    container.appendChild(grid);
    await waitFor(() => expect(root(grid).querySelectorAll("[data-grid-cell]").length).toBe(4));

    grid.focusCell(options.rowId, options.columnId);
    await waitFor(() => expect(document.activeElement?.getAttribute("data-column-id")).toBe(options.columnId));
    grid.startEdit(options.rowId, options.columnId, options.initialValue);

    const input = await waitFor(() => {
      const el = root(grid).querySelector("wsx-ac-cell-editor input") as HTMLInputElement | null;
      expect(el).toBeTruthy();
      expect(document.activeElement).toBe(el);
      return el!;
    });

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: options.shiftKey,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onEditSave).not.toHaveBeenCalled();
    expect(grid.editingState.rowId).toBe(options.rowId);
    expect(grid.editingState.columnId).toBe(options.columnId);
    expect(grid.editingState.error).toBe(options.expectedError);

    await waitFor(() => expect(grid._isRendering).not.toBe(true));
    await nextFrame();
    await nextFrame();

    expect(grid.editingState.rowId).toBe(options.rowId);
    expect(grid.editingState.columnId).toBe(options.columnId);
    expect(grid.editingState.error).toBe(options.expectedError);
    const currentInput = root(grid).querySelector("wsx-ac-cell-editor input") as HTMLInputElement | null;
    expect(currentInput).toBeTruthy();
    expect(document.activeElement).toBe(currentInput);
  }

  it("keeps focus in the editor after rerender on last-cell Tab when edit validation fails", async () => {
    await expectInvalidBoundaryEditRetainsFocus({
      rowId: "r2",
      columnId: "age",
      initialValue: 25,
      shiftKey: false,
      expectedError: "Invalid age",
    });
  });

  it("keeps focus in the editor after rerender on first-cell Shift+Tab when edit validation fails", async () => {
    await expectInvalidBoundaryEditRetainsFocus({
      rowId: "r1",
      columnId: "name",
      initialValue: "Ada",
      shiftKey: true,
      expectedError: "Invalid name",
    });
  });
});

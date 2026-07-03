/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Grid } from "../src/components/Grid.wsx";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";

describe("Grid Column Resizing", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container.innerHTML = "";
  });

  it("should render resize handles when enabled", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [
      { id: 1, name: "Test", age: 25, userId: "1" },
      { id: 2, name: "Another", age: 30, userId: "2" },
    ];
    grid.columns = [
      { accessorKey: "name", header: "Name", size: 150 },
      { accessorKey: "age", header: "Age", size: 100 },
    ];
    grid.resizingConfig = { enabled: true };

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      const resizers = root.querySelectorAll(".resizer");
      expect(resizers.length).toBeGreaterThan(0);
    });
  });

  it("should not render resize handles when disabled", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test", userId: "1" }];
    grid.columns = [{ accessorKey: "name", header: "Name", size: 150 }];

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      expect(root.querySelector(".grid-header-cell")).toBeTruthy();
    });

    const root = grid.shadowRoot || grid;
    expect(root.querySelectorAll(".resizer").length).toBe(0);
  });

  it("should expose resizing methods (RFC-0004)", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test", userId: "1" }];
    grid.columns = [{ accessorKey: "name", header: "Name", size: 150 }];
    grid.resizingConfig = { enabled: true };

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      expect(root.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
    });

    expect(typeof grid.setColumnWidth).toBe("function");
    expect(typeof grid.getColumnWidth).toBe("function");
    expect(typeof grid.autoSizeColumn).toBe("function");
    expect(typeof grid.autoSizeAllColumns).toBe("function");
  });

  it("should set and get column width (RFC-0004)", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test User", userId: "1" }];
    grid.columns = [
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
        minSize: 50,
        maxSize: 300,
      },
    ];
    grid.resizingConfig = { enabled: true };

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      expect(root.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
    });

    grid.setColumnWidth("name", 200);
    expect(grid.getColumnWidth("name")).toBe(200);
  });

  it("should clamp width to min/max constraints (RFC-0004)", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test", userId: "1" }];
    grid.columns = [
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
        minSize: 100,
        maxSize: 200,
      },
    ];
    grid.resizingConfig = { enabled: true };

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      expect(root.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
    });

    grid.setColumnWidth("name", 50);
    expect(grid.getColumnWidth("name")).toBe(100);

    grid.setColumnWidth("name", 300);
    expect(grid.getColumnWidth("name")).toBe(200);
  });

  it("should call onColumnSizingChange callback (RFC-0004)", async () => {
    const onSizingChange = vi.fn();
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test", userId: "1" }];
    grid.columns = [{ accessorKey: "name", header: "Name", size: 150 }];
    grid.resizingConfig = { enabled: true, onColumnSizingChange: onSizingChange };

    container.appendChild(grid);

    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      expect(root.querySelectorAll(".grid-row").length).toBeGreaterThan(0);
    });

    grid.setColumnWidth("name", 200);
    expect(onSizingChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: 200 }),
    );
  });
});

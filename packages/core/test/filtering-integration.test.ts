import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Grid } from "../src/components/Grid.wsx";
import "../src/components/Grid.wsx";
import { waitFor } from "@testing-library/dom";

describe("Grid Filtering Integration", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container.innerHTML = "";
  });

  it("should filter rows when setColumnFilter is called", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Charlie", age: 35 },
    ];
    grid.columns = [
      { accessorKey: "name", header: "Name", enableColumnFilter: true },
      {
        accessorKey: "age",
        header: "Age",
        enableColumnFilter: true,
        filterType: "number",
      },
    ];
    grid.filteringConfig = { enabled: true };

    container.appendChild(grid);

    // Wait for initial render
    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      const rows = root.querySelectorAll(".grid-row");
      expect(rows.length).toBe(3);
    });

    // Apply filter - should only show "Alice"
    grid.setColumnFilter("name", { value: "Ali", operator: "contains" });

    // Wait for filter to apply
    await waitFor(
      () => {
        const root = grid.shadowRoot || grid;
        const rows = root.querySelectorAll(".grid-row");
        console.log("Filtered rows count:", rows.length);
        rows.forEach((row: any, i: number) => {
          console.log(`Row ${i}:`, row.textContent);
        });
        expect(rows.length).toBe(1);
      },
      { timeout: 2000 },
    );
  });

  it("should filter rows with global filter", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [
      { id: 1, name: "Alice", age: 30 },
      { id: 2, name: "Bob", age: 25 },
      { id: 3, name: "Charlie", age: 35 },
    ];
    grid.columns = [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "age", header: "Age" },
    ];
    grid.filteringConfig = { enabled: true };

    container.appendChild(grid);

    // Wait for initial render
    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      const rows = root.querySelectorAll(".grid-row");
      expect(rows.length).toBe(3);
    });

    // Apply global filter
    grid.setGlobalFilter("Bob");

    // Wait for filter to apply
    await waitFor(
      () => {
        const root = grid.shadowRoot || grid;
        const rows = root.querySelectorAll(".grid-row");
        console.log("Global filtered rows count:", rows.length);
        rows.forEach((row: any, i: number) => {
          console.log(`Row ${i}:`, row.textContent);
        });
        expect(rows.length).toBe(1);
      },
      { timeout: 2000 },
    );
  });
});

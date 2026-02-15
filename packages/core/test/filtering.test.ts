/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Grid } from "../src/components/Grid.wsx";
import "../src/components/Grid.wsx"; // Register component
import { waitFor } from "@testing-library/dom";
import { defaultTextFilter } from "../src/utils/filter-functions";

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
      { accessorKey: "name", header: "Name", enableColumnFilter: true },
    ];
    grid.filteringConfig = {
      enabled: true,
    };

    container.appendChild(grid);

    // Wait for render
    await waitFor(() => {
      const root = grid.shadowRoot || grid;
      const headerCell = root.querySelector(".grid-header-cell");
      expect(headerCell).toBeTruthy();
      const filterIcon = headerCell?.querySelector("wsx-ac-filter-icon");
      expect(filterIcon).toBeTruthy();
    });

    // Expect GlobalSearch to NOT be present by default (it's external)
    const root = grid.shadowRoot || grid;
    const globalSearch = root.querySelector("wsx-ac-global-search");
    expect(globalSearch).toBeFalsy();
  });

  it("should not render filtering UI when disabled", async () => {
    const grid = document.createElement("wsx-ac-grid") as any;
    grid.data = [{ id: 1, name: "Test" }];
    grid.columns = [{ accessorKey: "name", header: "Name" }];
    // Default should be disabled or explicitly false

    container.appendChild(grid);
    await new Promise((r) => setTimeout(r, 0));

    const root = grid.shadowRoot || grid;
    const globalSearch = root.querySelector("wsx-ac-global-search");
    expect(globalSearch).toBeFalsy();

    const headerCell = root.querySelector(".grid-header-cell");
    // Header cell might exist, but filter icon should not
    if (headerCell) {
      const filterIcon = headerCell.querySelector("wsx-ac-filter-icon");
      expect(filterIcon).toBeFalsy();
    }
  });
});

describe("Filter Functions", () => {
  it("should filter rows correctly with contains operator", () => {
    const mockRow = {
      getValue: (key: string) => {
        if (key === "name") return "Alice";
        return null;
      },
    };

    // Test contains filter
    const result1 = defaultTextFilter(mockRow, "name", {
      value: "Ali",
      operator: "contains",
    });
    expect(result1).toBe(true);

    // Test not matching
    const result2 = defaultTextFilter(mockRow, "name", {
      value: "Bob",
      operator: "contains",
    });
    expect(result2).toBe(false);

    // Test empty filter - should return true (show all)
    const result3 = defaultTextFilter(mockRow, "name", {
      value: "",
      operator: "contains",
    });
    expect(result3).toBe(true);
  });

  it("should handle null/undefined values correctly", () => {
    const mockRow = {
      getValue: () => null,
    };

    const result = defaultTextFilter(mockRow, "name", {
      value: "test",
      operator: "contains",
    });
    expect(result).toBe(false);
  });
});

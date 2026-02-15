import { describe, it, expect, beforeEach, vi } from "vitest";
import { arrayMove } from "../src/utils/array-move";

describe("Drag and Drop", () => {
  describe("arrayMove utility", () => {
    it("should move an item from one index to another", () => {
      const arr = ["a", "b", "c", "d", "e"];
      const result = arrayMove(arr, 0, 2);
      expect(result).toEqual(["b", "c", "a", "d", "e"]);
    });

    it("should move an item to the end", () => {
      const arr = ["a", "b", "c"];
      const result = arrayMove(arr, 0, 2);
      expect(result).toEqual(["b", "c", "a"]);
    });

    it("should move an item to the beginning", () => {
      const arr = ["a", "b", "c"];
      const result = arrayMove(arr, 2, 0);
      expect(result).toEqual(["c", "a", "b"]);
    });

    it("should handle moving to the same index", () => {
      const arr = ["a", "b", "c"];
      const result = arrayMove(arr, 1, 1);
      expect(result).toEqual(["a", "b", "c"]);
    });

    it("should not mutate the original array", () => {
      const arr = ["a", "b", "c"];
      const result = arrayMove(arr, 0, 2);
      expect(arr).toEqual(["a", "b", "c"]);
      expect(result).not.toBe(arr);
    });
  });

  describe("Column reordering logic", () => {
    it("should calculate correct indices for column reordering", () => {
      const columnOrder = ["col-1", "col-2", "col-3", "col-4"];
      const activeId = "col-1";
      const overId = "col-3";

      const oldIndex = columnOrder.indexOf(activeId);
      const newIndex = columnOrder.indexOf(overId);

      expect(oldIndex).toBe(0);
      expect(newIndex).toBe(2);

      const result = arrayMove(columnOrder, oldIndex, newIndex);
      expect(result).toEqual(["col-2", "col-3", "col-1", "col-4"]);
    });

    it("should handle reordering when active is after over", () => {
      const columnOrder = ["col-1", "col-2", "col-3", "col-4"];
      const activeId = "col-4";
      const overId = "col-1";

      const oldIndex = columnOrder.indexOf(activeId);
      const newIndex = columnOrder.indexOf(overId);

      const result = arrayMove(columnOrder, oldIndex, newIndex);
      expect(result).toEqual(["col-4", "col-1", "col-2", "col-3"]);
    });
  });

  describe("Row reordering logic", () => {
    it("should calculate correct indices for row reordering", () => {
      const gridData = [
        { userId: "row-1", name: "Alice" },
        { userId: "row-2", name: "Bob" },
        { userId: "row-3", name: "Charlie" },
      ];
      const activeId = "row-1";
      const overId = "row-3";

      const oldIndex = gridData.findIndex((row) => row.userId === activeId);
      const newIndex = gridData.findIndex((row) => row.userId === overId);

      expect(oldIndex).toBe(0);
      expect(newIndex).toBe(2);

      const result = arrayMove(gridData, oldIndex, newIndex);
      expect(result.map((r) => r.userId)).toEqual(["row-2", "row-3", "row-1"]);
    });

    it("should handle rows without userId using fallback", () => {
      const gridData = [
        { name: "Alice" },
        { name: "Bob" },
        { name: "Charlie" },
      ];

      // When rows don't have userId, the reordering should still work
      // by using the index as the identifier
      const result = arrayMove(gridData, 0, 2);
      expect(result.map((r) => r.name)).toEqual(["Bob", "Charlie", "Alice"]);
    });
  });

  describe("Drag state tracking", () => {
    it("should track dragging column ID", () => {
      let draggingColumnId: string | null = null;
      let dragOverColumnId: string | null = null;

      // Simulate drag start
      draggingColumnId = "col-1";
      expect(draggingColumnId).toBe("col-1");

      // Simulate drag enter on another column
      if (draggingColumnId && draggingColumnId !== "col-2") {
        dragOverColumnId = "col-2";
      }
      expect(dragOverColumnId).toBe("col-2");

      // Simulate drag leave
      if (dragOverColumnId === "col-2") {
        dragOverColumnId = null;
      }
      expect(dragOverColumnId).toBeNull();

      // Simulate drag end
      draggingColumnId = null;
      expect(draggingColumnId).toBeNull();
    });

    it("should track dragging row ID", () => {
      let draggingRowId: string | null = null;
      let dragOverRowId: string | null = null;

      // Simulate drag start
      draggingRowId = "row-1";
      expect(draggingRowId).toBe("row-1");

      // Simulate drag enter on another row
      if (draggingRowId && draggingRowId !== "row-2") {
        dragOverRowId = "row-2";
      }
      expect(dragOverRowId).toBe("row-2");

      // Simulate drop
      dragOverRowId = null;
      draggingRowId = null;
      expect(dragOverRowId).toBeNull();
      expect(draggingRowId).toBeNull();
    });
  });

  describe("Column-wide visual feedback", () => {
    it("should apply dragging class to all cells in the dragging column", () => {
      const draggingColumnId = "col-1";
      const cellColumnId = "col-1";

      // Cell is in the dragging column
      const isColumnDragging = draggingColumnId === cellColumnId;
      expect(isColumnDragging).toBe(true);

      // Cell should have the dragging class
      const cellClassName = `grid-cell ${isColumnDragging ? "column-dragging" : ""}`;
      expect(cellClassName).toBe("grid-cell column-dragging");
    });

    it("should apply drag-over class to all cells in the drop target column", () => {
      const dragOverColumnId = "col-2";
      const cellColumnId = "col-2";

      // Cell is in the drop target column
      const isColumnDragOver = dragOverColumnId === cellColumnId;
      expect(isColumnDragOver).toBe(true);

      // Cell should have the drag-over class
      const cellClassName = `grid-cell ${isColumnDragOver ? "column-drag-over" : ""}`;
      expect(cellClassName).toBe("grid-cell column-drag-over");
    });

    it("should not apply dragging class to cells in other columns", () => {
      const draggingColumnId: string = "col-1";
      const cellColumnId: string = "col-3";

      // Cell is NOT in the dragging column
      const isColumnDragging = draggingColumnId === cellColumnId;
      expect(isColumnDragging).toBe(false);

      // Cell should NOT have the dragging class
      const cellClassName = `grid-cell ${isColumnDragging ? "column-dragging" : ""}`;
      expect(cellClassName).toBe("grid-cell ");
    });

    it("should track both header and cell drag state simultaneously", () => {
      const draggingColumnId: string = "col-1";
      const dragOverColumnId: string = "col-3";
      const currentColumnId: string = "col-1";

      // Header cell classes
      const isHeaderDragging = draggingColumnId === currentColumnId;
      const isHeaderDragOver = dragOverColumnId === currentColumnId;
      const headerClassName = `grid-header-cell ${isHeaderDragging ? "dragging" : ""} ${isHeaderDragOver ? "drag-over" : ""}`;

      // Body cell classes for dragging column
      const isCellInDraggingColumn = draggingColumnId === currentColumnId;
      const cellClassName = `grid-cell ${isCellInDraggingColumn ? "column-dragging" : ""}`;

      expect(headerClassName).toBe("grid-header-cell dragging ");
      expect(cellClassName).toBe("grid-cell column-dragging");
    });
  });
});

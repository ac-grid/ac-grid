import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { escapeCsvValue, rowsToCsv, exportToCsv } from "../src/utils/export";

describe("export utilities", () => {
  describe("escapeCsvValue", () => {
    it("returns empty string for null/undefined", () => {
      expect(escapeCsvValue(null)).toBe("");
      expect(escapeCsvValue(undefined)).toBe("");
    });

    it("returns plain string for simple values", () => {
      expect(escapeCsvValue("hello")).toBe("hello");
      expect(escapeCsvValue(42)).toBe("42");
    });

    it("wraps values with commas in quotes", () => {
      expect(escapeCsvValue("a,b")).toBe('"a,b"');
    });

    it("escapes quotes by doubling them", () => {
      expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
    });

    it("wraps values with newlines in quotes", () => {
      expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
    });
  });

  describe("rowsToCsv", () => {
    const columns = [
      { id: "name", header: "Name" },
      { id: "age", header: "Age" },
    ];

    it("generates CSV with headers", () => {
      const rows = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ];
      const csv = rowsToCsv(rows, columns);
      expect(csv).toBe("Name,Age\nAlice,30\nBob,25");
    });

    it("generates CSV without headers", () => {
      const rows = [{ name: "Alice", age: 30 }];
      const csv = rowsToCsv(rows, columns, { includeHeaders: false });
      expect(csv).toBe("Alice,30");
    });

    it("handles special characters", () => {
      const rows = [{ name: "O'Brien, Jr.", age: 30 }];
      const csv = rowsToCsv(rows, columns);
      expect(csv).toBe('Name,Age\n"O\'Brien, Jr.",30');
    });

    it("applies custom formatter", () => {
      const rows = [{ name: "Alice", age: 30 }];
      const csv = rowsToCsv(rows, columns, {
        formatter: (value, columnId) => {
          if (columnId === "age") return `${value} years`;
          return value;
        },
      });
      expect(csv).toBe("Name,Age\nAlice,30 years");
    });
  });

  describe("exportToCsv", () => {
    it("triggers download (mocked)", () => {
      // Mock document methods
      const mockLink = { href: "", download: "", click: vi.fn(), style: {} };
      const mockCreateElement = vi.fn(() => mockLink);
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockCreateObjectURL = vi.fn(() => "blob:url");
      const mockRevokeObjectURL = vi.fn();

      vi.spyOn(document, "createElement").mockImplementation(mockCreateElement as any);
      vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild as any);
      vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild as any);
      vi.spyOn(URL, "createObjectURL").mockImplementation(mockCreateObjectURL as any);
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(mockRevokeObjectURL as any);

      const rows = [{ name: "Alice", age: 30 }];
      const columns = [{ id: "name", header: "Name" }, { id: "age", header: "Age" }];

      exportToCsv(rows, columns, { fileName: "test.csv" });

      expect(mockLink.download).toBe("test.csv");
      expect(mockLink.click).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });
});

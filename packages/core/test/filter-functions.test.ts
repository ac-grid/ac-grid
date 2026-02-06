/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { toFilterCondition } from "../src/utils/filter-functions";
import type { FilterCondition } from "../src/types/filtering";

describe("filter-functions", () => {
  describe("toFilterCondition", () => {
    it("should handle FilterCondition object", () => {
      const input: FilterCondition = { value: "test", operator: "equals" };
      const result = toFilterCondition(input, "contains");
      expect(result).toEqual(input);
    });

    it("should handle simple string (backward compatibility)", () => {
      const input = "test";
      const result = toFilterCondition(input, "contains");
      expect(result).toEqual({ value: "test", operator: "contains" });
    });

    it("should handle JSON string (Web Components attribute serialization)", () => {
      const input = JSON.stringify({ value: "test", operator: "startsWith" });
      const result = toFilterCondition(input, "contains");
      expect(result).toEqual({ value: "test", operator: "startsWith" });
    });

    it("should fallback to string if JSON is invalid", () => {
      const input = "{invalid-json";
      const result = toFilterCondition(input, "contains");
      expect(result).toEqual({ value: "{invalid-json", operator: "contains" });
    });

    it("should fallback to string if JSON is not a FilterCondition", () => {
      const input = JSON.stringify({ foo: "bar" });
      // It lacks 'value' and 'operator', so it might be treated as a string or null?
      // implementation checks for value and operator
      const result = toFilterCondition(input, "contains");
      // Since it doesn't match the check, it falls back to treating the JSON string as the value
      expect(result).toEqual({ value: input, operator: "contains" });
    });

    it("should handle null/undefined", () => {
      expect(toFilterCondition(null, "contains")).toEqual({ value: "", operator: "contains" });
      expect(toFilterCondition(undefined, "contains")).toEqual({ value: "", operator: "contains" });
    });
  });
});

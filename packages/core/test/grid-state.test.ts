import { describe, expect, it } from "vitest";
import {
  deserializeGridState,
  mergeGridState,
  normalizeGridState,
  serializeGridState,
} from "../src/utils/grid-state";
import { DEFAULT_GRID_STATE } from "../src/utils/grid-state";

describe("grid state serialization", () => {
  it("round-trips a versioned state", () => {
    const state = { ...DEFAULT_GRID_STATE, sorting: [{ id: "name", desc: true }] };
    expect(deserializeGridState(serializeGridState(state))).toEqual(state);
  });

  it("rejects unknown versions and malformed JSON", () => {
    expect(normalizeGridState({ stateVersion: 2 })).toBeNull();
    expect(deserializeGridState("{" )).toBeNull();
  });

  it("merges partial state without replacing omitted values", () => {
    const current = { ...DEFAULT_GRID_STATE, globalFilter: "Ada" };
    expect(mergeGridState(current, { sorting: [{ id: "name", desc: false }] })).toEqual({
      ...current,
      sorting: [{ id: "name", desc: false }],
    });
  });

  it("ignores a stateVersion in a patch and keeps the current version", () => {
    const merged = mergeGridState(DEFAULT_GRID_STATE, { stateVersion: 99 as never, globalFilter: "x" });
    expect(merged.stateVersion).toBe(1);
    expect(merged.globalFilter).toBe("x");
  });
});

describe("grid state normalization", () => {
  it.each([null, undefined, "state", 42, true])("rejects non-object input %p", (value) => {
    expect(normalizeGridState(value)).toBeNull();
  });

  it("returns null when there is nothing stored", () => {
    expect(deserializeGridState(null)).toBeNull();
  });

  it("returns the defaults for a bare versioned object", () => {
    expect(normalizeGridState({ stateVersion: 1 })).toEqual(DEFAULT_GRID_STATE);
  });

  it("keeps valid values of every field", () => {
    const valid = {
      stateVersion: 1,
      columnSizing: { name: 120, age: 80 },
      columnOrder: ["age", "name"],
      sorting: [{ id: "age", desc: true }],
      columnFilters: { name: "Ada" },
      globalFilter: "ada",
      pagination: { pageIndex: 2, pageSize: 25 },
      scrollTop: 340,
    };
    expect(normalizeGridState(valid)).toEqual(valid);
  });

  it.each([
    ["not a record", "wide"],
    ["an array", [100]],
    ["a non-number width", { name: "100" }],
    ["a NaN width", { name: Number.NaN }],
    ["an infinite width", { name: Number.POSITIVE_INFINITY }],
    ["a zero width", { name: 0 }],
    ["a negative width", { name: -5 }],
  ])("drops columnSizing that is %s", (_label, columnSizing) => {
    expect(normalizeGridState({ stateVersion: 1, columnSizing })?.columnSizing).toEqual({});
  });

  it("keeps only string ids in columnOrder and drops a non-array", () => {
    expect(normalizeGridState({ stateVersion: 1, columnOrder: ["a", 1, null, "b"] })?.columnOrder).toEqual(["a", "b"]);
    expect(normalizeGridState({ stateVersion: 1, columnOrder: "a" })?.columnOrder).toEqual([]);
  });

  it("falls back for non-array sorting, non-record filters and non-string global filter", () => {
    const state = normalizeGridState({
      stateVersion: 1,
      sorting: "name",
      columnFilters: ["x"],
      globalFilter: 7,
    });
    expect(state?.sorting).toEqual([]);
    expect(state?.columnFilters).toEqual({});
    expect(state?.globalFilter).toBe("");
  });

  it.each([
    ["not a record", "page"],
    ["an array", [1, 10]],
    ["a fractional index", { pageIndex: 1.5, pageSize: 10 }],
    ["a fractional size", { pageIndex: 0, pageSize: 10.5 }],
    ["a missing index", { pageSize: 10 }],
    ["a missing size", { pageIndex: 0 }],
    ["a negative index", { pageIndex: -1, pageSize: 10 }],
    ["a zero size", { pageIndex: 0, pageSize: 0 }],
  ])("uses the default pagination when it is %s", (_label, pagination) => {
    expect(normalizeGridState({ stateVersion: 1, pagination })?.pagination).toEqual(DEFAULT_GRID_STATE.pagination);
  });

  it("accepts a zero page index", () => {
    expect(normalizeGridState({ stateVersion: 1, pagination: { pageIndex: 0, pageSize: 5 } })?.pagination).toEqual({
      pageIndex: 0,
      pageSize: 5,
    });
  });

  it.each([
    ["a negative number", -10, 0],
    ["a non-number", "10", 0],
    ["NaN", Number.NaN, 0],
    ["Infinity", Number.POSITIVE_INFINITY, 0],
    ["a valid number", 12.5, 12.5],
  ])("normalizes scrollTop when it is %s", (_label, scrollTop, expected) => {
    expect(normalizeGridState({ stateVersion: 1, scrollTop })?.scrollTop).toBe(expected);
  });
});

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
});

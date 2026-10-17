import { describe, expect, it } from "vitest";
import { getNextCellPosition } from "../src/utils/keyboard-navigation";

describe("keyboard navigation positions", () => {
  it("moves in each direction and clamps at grid boundaries", () => {
    expect(getNextCellPosition({ row: 1, column: 1 }, "ArrowUp", 3, 2, "cell")).toEqual({ row: 0, column: 1 });
    expect(getNextCellPosition({ row: 1, column: 1 }, "ArrowRight", 3, 2, "cell")).toEqual({ row: 1, column: 1 });
    expect(getNextCellPosition({ row: 0, column: 0 }, "ArrowLeft", 3, 2, "cell")).toEqual({ row: 0, column: 0 });
    expect(getNextCellPosition({ row: 2, column: 0 }, "ArrowDown", 3, 2, "cell")).toEqual({ row: 2, column: 0 });
  });

  it("moves tab in row major order without wrapping at boundaries", () => {
    expect(getNextCellPosition({ row: 0, column: 1 }, "Tab", 2, 2, "cell")).toEqual({ row: 1, column: 0 });
    expect(getNextCellPosition({ row: 1, column: 0 }, "Tab", 2, 2, "cell", true)).toEqual({ row: 0, column: 1 });
    expect(getNextCellPosition({ row: 1, column: 1 }, "Tab", 2, 2, "cell")).toEqual({ row: 1, column: 1 });
  });

  it("keeps the column fixed for vertical row mode navigation", () => {
    expect(getNextCellPosition({ row: 0, column: 1 }, "ArrowDown", 2, 2, "row")).toEqual({ row: 1, column: 1 });
    expect(getNextCellPosition({ row: 0, column: 1 }, "ArrowRight", 2, 2, "row")).toEqual({ row: 0, column: 1 });
  });
});

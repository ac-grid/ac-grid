/// <reference types="vitest" />
import { describe, it, expect, vi } from "vitest";
import {
    FormulaEngine,
    InMemoryFormulaStore,
    createFormulaEngineFromMatrix,
} from "../src/utils/formula-engine";
import {
    buildDependentsIndex,
    clearDependencies,
    collectAffectedCells,
    setDependencies,
    topologicalSortAffected,
} from "../src/utils/formula-graph";
import {
    evaluateFormula,
    evaluateParsedFormula,
    isFormula,
    isFormulaError,
    normalizeFormula,
    parseFormula,
} from "../src/utils/formula-parser";

const none = () => null;
const err = (code: string) => expect.objectContaining({ type: "error", code });

describe("formula-parser (coverage)", () => {
    it("detects and normalizes formulas", () => {
        expect(isFormula("  =1")).toBe(true);
        expect(isFormula("1")).toBe(false);
        expect(isFormula(1)).toBe(false);
        expect(normalizeFormula(" 1+1 ")).toBe("=1+1");
        expect(normalizeFormula(" =1+1 ")).toBe("=1+1");
    });

    it("isFormulaError discriminates", () => {
        expect(isFormulaError({ type: "error", code: "#ERROR!" })).toBe(true);
        expect(isFormulaError(null)).toBe(false);
        expect(isFormulaError(3)).toBe(false);
    });

    it("evaluates arithmetic, precedence, parens and unary", () => {
        expect(evaluateFormula("=1+2*3-4/2", none)).toBe(5);
        expect(evaluateFormula("=(1+2)*3", none)).toBe(9);
        expect(evaluateFormula("=-3", none)).toBe(-3);
        expect(evaluateFormula("=+3", none)).toBe(3);
        expect(evaluateFormula("=--3", none)).toBe(3);
        expect(evaluateFormula("=2 * 3", none)).toBe(6);
        expect(evaluateFormula("=1/0", none)).toEqual(err("#DIV/0!"));
    });

    it("evaluates string literals and ranges as scalars", () => {
        expect(evaluateFormula('="abc"', none)).toBe("abc");
        expect(evaluateFormula('="5"+1', none)).toBe(6);
        expect(evaluateFormula("=A1:A2", none)).toEqual(err("#VALUE!"));
    });

    it("evaluates all builtin functions over refs and ranges", () => {
        const get = (a: { row: number; col: number }) => [1, 2, 3][a.row] ?? null;
        expect(evaluateFormula("=SUM(A1:A3)", get)).toBe(6);
        expect(evaluateFormula("=sum(A1, A2, 10)", get)).toBe(13);
        expect(evaluateFormula("=AVG(A1:A3)", get)).toBe(2);
        expect(evaluateFormula("=AVERAGE(A1:A3)", get)).toBe(2);
        expect(evaluateFormula("=MIN(A1:A3)", get)).toBe(1);
        expect(evaluateFormula("=MAX(A1:A3)", get)).toBe(3);
        expect(evaluateFormula("=COUNT(A1:A3)", get)).toBe(3);
        expect(evaluateFormula("=SUM()", get)).toBe(0);
        expect(evaluateFormula("=AVG()", get)).toEqual(err("#DIV/0!"));
        expect(evaluateFormula("=MIN()", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=MAX()", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=COUNT()", get)).toBe(0);
    });

    it("coerces cell values to numbers", () => {
        const vals: Record<number, any> = {
            0: null,
            1: true,
            2: false,
            3: "  ",
            4: "7",
            5: "x",
            6: Infinity,
            7: { type: "error", code: "#REF!" },
            8: {} as any,
        };
        const get = (a: { row: number }) => vals[a.row];
        expect(evaluateFormula("=A1+0", get)).toBe(0);
        expect(evaluateFormula("=A2+0", get)).toBe(1);
        expect(evaluateFormula("=A3+0", get)).toBe(0);
        expect(evaluateFormula("=A4+0", get)).toBe(0);
        expect(evaluateFormula("=A5+0", get)).toBe(7);
        expect(evaluateFormula("=A6+0", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=A7+0", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=A8+0", get)).toEqual(err("#REF!"));
        expect(evaluateFormula("=0+A8", get)).toEqual(err("#REF!"));
        expect(evaluateFormula("=A9+0", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=-A6", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=-A8", get)).toEqual(err("#REF!"));
    });

    it("propagates errors and bad values through function args", () => {
        const get = (a: { row: number }) =>
            a.row === 0 ? { type: "error", code: "#REF!" } : a.row === 1 ? "bad" : 1;
        expect(evaluateFormula("=SUM(A1)", get)).toEqual(err("#REF!"));
        expect(evaluateFormula("=SUM(A1:A3)", get)).toEqual(err("#REF!"));
        expect(evaluateFormula("=SUM(A2)", get)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=SUM(A2:A3)", get)).toEqual(err("#VALUE!"));
    });

    it("rejects range operands in unary and binary ops", () => {
        expect(evaluateFormula("=-A1:A2", none)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=1+A1:A2", none)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=A1:A2+1", none)).toEqual(err("#VALUE!"));
    });

    it("reports parse errors with codes", () => {
        expect(evaluateFormula("=", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=1+", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=1 1", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=1 # 2", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=1.2.3", none)).toEqual(err("#VALUE!"));
        expect(evaluateFormula("=(1", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=)", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=FOO", none)).toEqual(err("#NAME?"));
        expect(evaluateFormula("=FOO(1)", none)).toEqual(err("#NAME?"));
        expect(evaluateFormula("=SUM(1", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=A1:", none)).toEqual(err("#ERROR!"));
        expect(evaluateFormula("=A1:5", none)).toEqual(err("#REF!"));
        expect(() => parseFormula("=1 # 2")).toThrow();
    });

    it("tolerates an unterminated string literal", () => {
        expect(evaluateFormula('="abc', none)).toBe("abc");
    });

    it("wraps non-formula throws from getCell as #ERROR!", () => {
        const result = evaluateFormula("=A1", () => {
            throw new Error("boom");
        });
        expect(result).toEqual(
            expect.objectContaining({ type: "error", code: "#ERROR!", message: expect.stringContaining("boom") }),
        );
    });

    it("collects deduplicated dependencies through every node kind", () => {
        const { dependencies } = parseFormula("=-A1 + SUM(A1:A2, B1) * (C1 / 2) + 3 + \"s\"");
        expect(dependencies).toEqual([
            { row: 0, col: 0 },
            { row: 1, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
        ]);
    });

    it("evaluates hand-built ASTs, including an unknown function and a range root", () => {
        expect(
            evaluateParsedFormula({ kind: "call", name: "NOPE", args: [{ kind: "number", value: 1 }] }, none),
        ).toEqual(err("#NAME?"));
        expect(
            evaluateParsedFormula({ kind: "range", cells: [{ row: 0, col: 0 }] }, none),
        ).toEqual(err("#VALUE!"));
    });
});

describe("formula-graph (coverage)", () => {
    it("sets, indexes and clears dependencies", () => {
        const g = new Map();
        setDependencies(g, { row: 0, col: 2 }, [{ row: 0, col: 0 }, { row: 0, col: 1 }]);
        setDependencies(g, { row: 1, col: 2 }, [{ row: 0, col: 0 }]);
        const idx = buildDependentsIndex(g);
        expect([...idx.get("0:0")!].sort()).toEqual(["0:2", "1:2"]);
        expect([...idx.get("0:1")!]).toEqual(["0:2"]);
        clearDependencies(g, { row: 1, col: 2 });
        expect(g.has("1:2")).toBe(false);
    });

    it("collects transitive dependents once, plus seeds that are formulas", () => {
        const g = new Map();
        setDependencies(g, { row: 0, col: 1 }, [{ row: 0, col: 0 }]);
        setDependencies(g, { row: 0, col: 2 }, [{ row: 0, col: 0 }, { row: 0, col: 1 }]);
        expect(collectAffectedCells(g, [{ row: 0, col: 0 }]).sort()).toEqual(["0:1", "0:2"]);
        expect(collectAffectedCells(g, [{ row: 5, col: 5 }])).toEqual([]);
        expect(collectAffectedCells(g, [{ row: 0, col: 2 }])).toEqual(["0:2"]);
    });

    it("sorts affected cells topologically and ignores outside deps", () => {
        const g = new Map();
        setDependencies(g, { row: 0, col: 1 }, [{ row: 0, col: 0 }]);
        setDependencies(g, { row: 0, col: 2 }, [{ row: 0, col: 1 }]);
        const res = topologicalSortAffected(g, ["0:2", "0:1", "9:9"]);
        expect(res.ok).toBe(true);
        const order = (res as any).order.map((c: any) => `${c.row}:${c.col}`);
        expect(order).toHaveLength(3);
        expect(order.indexOf("0:1")).toBeLessThan(order.indexOf("0:2"));
    });

    it("waits for all affected dependencies before emitting a cell", () => {
        const g = new Map();
        setDependencies(g, { row: 0, col: 1 }, [{ row: 0, col: 0 }]);
        setDependencies(g, { row: 0, col: 2 }, [{ row: 0, col: 0 }]);
        setDependencies(g, { row: 0, col: 3 }, [{ row: 0, col: 1 }, { row: 0, col: 2 }]);
        const res = topologicalSortAffected(g, collectAffectedCells(g, [{ row: 0, col: 0 }]));
        expect(res.ok).toBe(true);
        const order = (res as any).order.map((c: any) => c.col);
        expect(order[order.length - 1]).toBe(3);
        expect(order).toHaveLength(3);
    });

    it("reports cycles", () => {
        const g = new Map();
        setDependencies(g, { row: 0, col: 0 }, [{ row: 0, col: 1 }]);
        setDependencies(g, { row: 0, col: 1 }, [{ row: 0, col: 0 }]);
        setDependencies(g, { row: 0, col: 2 }, [{ row: 0, col: 3 }]);
        const res = topologicalSortAffected(g, ["0:0", "0:1", "0:2"]);
        expect(res.ok).toBe(false);
        expect((res as any).cycle.sort()).toEqual(["0:0", "0:1"]);
        // 0:2 depends only on an unaffected cell, so it is not part of the cycle
    });
});

describe("FormulaEngine (coverage)", () => {
    it("InMemoryFormulaStore tracks sizes and clears cells", () => {
        const s = new InMemoryFormulaStore();
        expect(s.getRowCount()).toBe(0);
        expect(s.getColumnCount()).toBe(0);
        s.setRawValue(2, 3, 5);
        expect(s.getRowCount()).toBe(3);
        expect(s.getColumnCount()).toBe(4);
        s.setRawValue(0, 0, 1);
        expect(s.getRowCount()).toBe(3);
        expect(s.getRawValue(2, 3)).toBe(5);
        s.clearCell(2, 3);
        expect(s.getRawValue(2, 3)).toBeUndefined();
        s.loadMatrix([[1, undefined as any], [2, 3, 4]]);
        expect(s.getRowCount()).toBe(2);
        expect(s.getColumnCount()).toBe(3);
        expect(s.getRawValue(0, 1)).toBeUndefined();
        expect(s.getRawValue(1, 2)).toBe(4);
    });

    it("exposes its store and caches values", () => {
        const e = createFormulaEngineFromMatrix([[1, "=A1+1"]]);
        expect(e.getStore().getRawValue(0, 0)).toBe(1);
        expect(e.getValue(0, 1)).toBe(2);
        expect(e.getValue(0, 1)).toBe(2);
        expect(e.getValue(5, 5)).toBeNull();
    });

    it("lazily evaluates uncached cells, including error literals", () => {
        const e = new FormulaEngine();
        e.loadMatrix([[{ type: "error", code: "#REF!" }, "=A1"]]);
        expect(e.getValue(0, 0)).toEqual(err("#REF!"));
        expect(e.getValue(0, 1)).toEqual(err("#REF!"));
    });

    it("detects cycles lazily and via recalculation", () => {
        const e = new FormulaEngine();
        e.loadMatrix([["=B1", "=A1"]]);
        expect(e.getValue(0, 0)).toEqual(err("#CYCLE!"));

        const changed = vi.fn();
        const e2 = new FormulaEngine({ onValuesChanged: changed });
        e2.setCell(0, 0, "=B1");
        const v = e2.setCell(0, 1, "=A1");
        expect(v).toEqual(err("#CYCLE!"));
        expect(e2.getValue(0, 0)).toEqual(err("#CYCLE!"));
        expect(changed).toHaveBeenLastCalledWith(expect.arrayContaining([{ row: 0, col: 0 }, { row: 0, col: 1 }]));
    });

    it("setCell recalculates dependents and notifies once per call", () => {
        const changed = vi.fn();
        const e = new FormulaEngine({ onValuesChanged: changed });
        e.setCell(0, 1, "=A1*2");
        expect(e.setCell(0, 0, 4)).toBe(8); // first recalculated cell is the dependent
        expect(e.getValue(0, 1)).toBe(8);
        // literal seed with a dependent: results are the dependents in topo order
        expect(changed).toHaveBeenLastCalledWith([{ row: 0, col: 1 }]);
        // standalone literal: seed itself is reported
        e.setCell(5, 5, 1);
        expect(changed).toHaveBeenLastCalledWith([{ row: 5, col: 5 }]);
    });

    it("returns the formula result when setting a formula cell", () => {
        const e = new FormulaEngine();
        e.setCell(0, 0, 3);
        expect(e.setCell(0, 1, "=A1+1")).toBe(4);
    });

    it("handles invalid formulas in setCell/loadMatrix", () => {
        const e = new FormulaEngine();
        expect(e.setCell(0, 0, "=1+")).toEqual(err("#ERROR!"));
        e.loadMatrix([["=1+", "=SUM("]]);
        expect(e.getValue(0, 1)).toEqual(err("#ERROR!"));
        e.setCell(0, 0, 7); // formula -> literal clears dependencies
        expect(e.getValue(0, 0)).toBe(7);
    });

    it("recalculateAll refreshes every formula", () => {
        const e = new FormulaEngine();
        e.loadMatrix([[1, "=A1+1", "=B1+1"]]);
        const res = e.recalculateAll();
        expect(res.map((r) => r.value).sort()).toEqual([2, 3]);
        expect(e.getValue(0, 2)).toBe(3);
    });

    it("disabled engine returns raw values and skips recalculation", () => {
        const e = new FormulaEngine({ enabled: false });
        e.loadMatrix([[1, "=A1"]]);
        expect(e.recalculateAll()).toEqual([]);
        expect(e.getValue(0, 1)).toBe("=A1");
        expect(e.setCell(0, 0, 9)).toBe(9);
        e.setEnabled(true);
        e.recalculateAll();
        expect(e.getValue(0, 1)).toBe(9);
    });

    it("prefers external data source values and falls back to the store", () => {
        const e = new FormulaEngine({
            dataSource: {
                getRowCount: () => 1,
                getColumnCount: () => 2,
                getRawValue: (r, c) => (c === 0 ? 10 : undefined),
            },
        });
        e.getStore().setRawValue(0, 1, "=A1+1");
        e.getStore().setRawValue(0, 0, 99);
        expect(e.getValue(0, 0)).toBe(10);
        expect(e.getValue(0, 1)).toBe(11);
    });

    it("wraps unexpected throws during evaluation as #ERROR!", () => {
        const e = new FormulaEngine({
            dataSource: {
                getRowCount: () => 1,
                getColumnCount: () => 2,
                getRawValue: (r, c) => {
                    if (c === 0) throw new Error("ds down");
                    return "=A1";
                },
            },
        });
        expect(e.getValue(0, 1)).toEqual(
            expect.objectContaining({ code: "#ERROR!", message: expect.stringContaining("ds down") }),
        );
    });
});

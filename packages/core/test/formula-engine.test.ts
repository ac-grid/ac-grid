/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    FormulaEngine,
    createFormulaEngineFromMatrix,
} from "../src/utils/formula-engine";
import { isFormulaError } from "../src/utils/formula-parser";

describe("FormulaEngine", () => {
    it("evaluates SUM/AVG formulas over a matrix", () => {
        const engine = createFormulaEngineFromMatrix([
            [1, 2, 3],
            [4, 5, 6],
            ["=SUM(A1:C1)", "=AVG(A1:A2)", "=A1+B1"],
        ]);

        expect(engine.getValue(2, 0)).toBe(6);
        expect(engine.getValue(2, 1)).toBe(2.5);
        expect(engine.getValue(2, 2)).toBe(3);
    });

    it("incrementally recalculates dependents when a seed changes", () => {
        const changed: string[] = [];
        const engine = new FormulaEngine({
            onValuesChanged: (cells) => {
                for (const cell of cells) {
                    changed.push(`${cell.row}:${cell.col}`);
                }
            },
        });
        engine.loadMatrix([
            [10, 20],
            ["=A1+B1", "=A2*2"],
        ]);
        engine.recalculateAll();
        expect(engine.getValue(1, 0)).toBe(30);
        expect(engine.getValue(1, 1)).toBe(60);

        changed.length = 0;
        engine.setCell(0, 0, 15);
        expect(engine.getValue(1, 0)).toBe(35);
        expect(engine.getValue(1, 1)).toBe(70);
        expect(changed).toEqual(expect.arrayContaining(["1:0", "1:1"]));
    });

    it("reports #CYCLE! for circular references", () => {
        const engine = createFormulaEngineFromMatrix([
            ["=B1", "=A1"],
        ]);
        expect(isFormulaError(engine.getValue(0, 0))).toBe(true);
        expect((engine.getValue(0, 0) as { code: string }).code).toBe("#CYCLE!");
    });

    it("keeps engine independent of render: getValue is sync and cached", () => {
        const engine = createFormulaEngineFromMatrix([[5, "=A1*3"]]);
        expect(engine.getValue(0, 1)).toBe(15);
        expect(engine.getValue(0, 1)).toBe(15);
    });
});

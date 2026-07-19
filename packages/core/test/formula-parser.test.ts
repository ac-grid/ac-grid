/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import type { CellAddress, FormulaValue } from "../src/types/formulas";
import {
    evaluateFormula,
    isFormula,
    isFormulaError,
    parseFormula,
} from "../src/utils/formula-parser";

const VALUES: Record<string, FormulaValue> = {
    "0:0": 10, // A1
    "0:1": 20, // B1
    "1:0": 30, // A2
    "1:1": 40, // B2
};

function getCell(address: CellAddress): FormulaValue {
    return VALUES[`${address.row}:${address.col}`] ?? null;
}

describe("formula-parser", () => {
    it("detects formula prefix", () => {
        expect(isFormula("=SUM(A1)")).toBe(true);
        expect(isFormula("  =1+2")).toBe(true);
        expect(isFormula("SUM(A1)")).toBe(false);
        expect(isFormula(12)).toBe(false);
    });

    it("parses arithmetic and collects deps", () => {
        const parsed = parseFormula("=A1+B1*2");
        expect(parsed.dependencies).toEqual(
            expect.arrayContaining([
                { row: 0, col: 0 },
                { row: 0, col: 1 },
            ]),
        );
        expect(evaluateFormula("=A1+B1*2", getCell)).toBe(50);
    });

    it("evaluates SUM and AVG over ranges", () => {
        expect(evaluateFormula("=SUM(A1:B2)", getCell)).toBe(100);
        expect(evaluateFormula("=AVG(A1:B1)", getCell)).toBe(15);
        expect(evaluateFormula("=AVERAGE(A1,B1)", getCell)).toBe(15);
    });

    it("supports parentheses and unary minus", () => {
        expect(evaluateFormula("=(A1+B1)/2", getCell)).toBe(15);
        expect(evaluateFormula("=-A1", getCell)).toBe(-10);
    });

    it("returns typed errors", () => {
        expect(isFormulaError(evaluateFormula("=A1/0", getCell))).toBe(true);
        expect((evaluateFormula("=A1/0", getCell) as { code: string }).code).toBe(
            "#DIV/0!",
        );
        expect((evaluateFormula("=FOO(A1)", getCell) as { code: string }).code).toBe(
            "#NAME?",
        );
    });
});

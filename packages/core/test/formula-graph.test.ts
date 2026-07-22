/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import {
    collectAffectedCells,
    setDependencies,
    topologicalSortAffected,
    type DependencyMap,
} from "../src/utils/formula-graph";

describe("formula-graph", () => {
    it("collects transitive dependents for incremental recalc", () => {
        const graph: DependencyMap = new Map();
        // C1 (=A1+B1) depends on A1,B1; D1 (=C1*2) depends on C1
        setDependencies(graph, { row: 0, col: 2 }, [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
        ]);
        setDependencies(graph, { row: 0, col: 3 }, [{ row: 0, col: 2 }]);

        const affected = collectAffectedCells(graph, [{ row: 0, col: 0 }]);
        expect(affected.sort()).toEqual(["0:2", "0:3"]);
    });

    it("topologically sorts affected formulas", () => {
        const graph: DependencyMap = new Map();
        setDependencies(graph, { row: 0, col: 2 }, [{ row: 0, col: 0 }]);
        setDependencies(graph, { row: 0, col: 3 }, [{ row: 0, col: 2 }]);

        const result = topologicalSortAffected(graph, ["0:2", "0:3"]);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.order).toEqual([
                { row: 0, col: 2 },
                { row: 0, col: 3 },
            ]);
        }
    });

    it("detects cycles", () => {
        const graph: DependencyMap = new Map();
        setDependencies(graph, { row: 0, col: 0 }, [{ row: 0, col: 1 }]);
        setDependencies(graph, { row: 0, col: 1 }, [{ row: 0, col: 0 }]);

        const result = topologicalSortAffected(graph, ["0:0", "0:1"]);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.cycle.sort()).toEqual(["0:0", "0:1"]);
        }
    });
});

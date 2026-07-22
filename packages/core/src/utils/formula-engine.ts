/**
 * FormulaEngine：独立于渲染循环的公式引擎（RFC-0030）。
 * 维护字面量 / 公式、依赖图，支持全量与增量重算。
 */

import type {
    CellAddress,
    CellRawValue,
    FormulaDataSource,
    FormulaValue,
    GridFormulasConfig,
} from "../types/formulas";
import { cellKey } from "./a1-notation";
import {
    collectAffectedCells,
    type DependencyMap,
    setDependencies,
    clearDependencies,
    topologicalSortAffected,
} from "./formula-graph";
import {
    evaluateParsedFormula,
    isFormula,
    isFormulaError,
    normalizeFormula,
    parseFormula,
} from "./formula-parser";

const ERROR_CYCLE: FormulaValue = {
    type: "error",
    code: "#CYCLE!",
};

function isErrorShaped(value: unknown): value is FormulaValue {
    return isFormulaError(value as FormulaValue);
}

/**
 * 内存型数据源：引擎默认使用。
 */
export class InMemoryFormulaStore implements FormulaDataSource {
    private readonly raw = new Map<string, CellRawValue>();
    private rowCount = 0;
    private columnCount = 0;

    getRowCount(): number {
        return this.rowCount;
    }

    getColumnCount(): number {
        return this.columnCount;
    }

    getRawValue(row: number, col: number): CellRawValue | undefined {
        return this.raw.get(cellKey({ row, col }));
    }

    setRawValue(row: number, col: number, value: CellRawValue): void {
        this.raw.set(cellKey({ row, col }), value);
        this.rowCount = Math.max(this.rowCount, row + 1);
        this.columnCount = Math.max(this.columnCount, col + 1);
    }

    clearCell(row: number, col: number): void {
        this.raw.delete(cellKey({ row, col }));
    }

    /** 从二维矩阵批量加载（便于测试 / 演示） */
    loadMatrix(matrix: CellRawValue[][]): void {
        this.raw.clear();
        this.rowCount = matrix.length;
        this.columnCount = matrix.reduce((max, row) => Math.max(max, row.length), 0);
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                const value = matrix[row][col];
                if (value !== undefined) {
                    this.raw.set(cellKey({ row, col }), value);
                }
            }
        }
    }
}

export class FormulaEngine {
    private readonly store: InMemoryFormulaStore;
    private readonly externalSource: FormulaDataSource | null;
    private readonly graph: DependencyMap = new Map();
    private readonly cache = new Map<string, FormulaValue>();
    private readonly onValuesChanged?: GridFormulasConfig["onValuesChanged"];
    private enabled: boolean;

    constructor(config: GridFormulasConfig = {}) {
        this.enabled = config.enabled !== false;
        this.onValuesChanged = config.onValuesChanged;
        this.store = new InMemoryFormulaStore();
        this.externalSource = config.dataSource ?? null;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    getStore(): InMemoryFormulaStore {
        return this.store;
    }

    /**
     * 从二维矩阵加载原始值并重建依赖图（不触发回调）。
     */
    loadMatrix(matrix: CellRawValue[][]): void {
        this.store.loadMatrix(matrix);
        this.cache.clear();
        this.graph.clear();
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                this.rebuildCellDependencies({ row, col }, matrix[row][col]);
            }
        }
    }

    /**
     * 设置单元格原始值（字面量或公式字符串），并增量重算。
     */
    setCell(row: number, col: number, value: CellRawValue): FormulaValue {
        this.store.setRawValue(row, col, value);
        const address = { row, col };
        this.invalidateCache(address);
        this.rebuildCellDependencies(address, value);
        return this.recalculate([address])[0]?.value ?? this.getValue(row, col);
    }

    /** 读取求值后的显示值 */
    getValue(row: number, col: number): FormulaValue {
        if (!this.enabled) {
            return this.readRaw(row, col) as FormulaValue;
        }
        const key = cellKey({ row, col });
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        return this.evaluateCell({ row, col }, new Set());
    }

    /** 全量重算所有公式格子 */
    recalculateAll(): { address: CellAddress; value: FormulaValue }[] {
        const seeds: CellAddress[] = [];
        for (const key of this.graph.keys()) {
            const [rowText, colText] = key.split(":");
            seeds.push({ row: Number(rowText), col: Number(colText) });
        }
        return this.recalculate(seeds);
    }

    /**
     * 增量重算：从变更种子出发，按拓扑序更新受影响公式。
     */
    recalculate(
        seeds: CellAddress[],
    ): { address: CellAddress; value: FormulaValue }[] {
        if (!this.enabled) {
            return [];
        }

        const affectedKeys = collectAffectedCells(this.graph, seeds);
        // 种子字面量也刷新缓存；受影响公式格子必须先失效再求值
        for (const seed of seeds) {
            this.invalidateCache(seed);
            const raw = this.readRaw(seed.row, seed.col);
            if (!isFormula(raw)) {
                const literal = this.coerceLiteral(raw);
                this.cache.set(cellKey(seed), literal);
            }
        }
        for (const key of affectedKeys) {
            this.cache.delete(key);
        }

        if (affectedKeys.length === 0) {
            const results = seeds.map((address) => ({
                address,
                value: this.getValue(address.row, address.col),
            }));
            this.onValuesChanged?.(seeds);
            return results;
        }

        const topo = topologicalSortAffected(this.graph, affectedKeys);
        const results: { address: CellAddress; value: FormulaValue }[] = [];

        if (!topo.ok) {
            for (const key of topo.cycle) {
                const [rowText, colText] = key.split(":");
                const address = { row: Number(rowText), col: Number(colText) };
                this.cache.set(key, ERROR_CYCLE);
                results.push({ address, value: ERROR_CYCLE });
            }
            this.onValuesChanged?.(results.map((r) => r.address));
            return results;
        }

        for (const address of topo.order) {
            const value = this.evaluateCell(address, new Set());
            results.push({ address, value });
        }

        this.onValuesChanged?.(results.map((r) => r.address));
        return results;
    }

    private rebuildCellDependencies(address: CellAddress, value: CellRawValue): void {
        if (isFormula(value)) {
            try {
                const parsed = parseFormula(normalizeFormula(value));
                setDependencies(this.graph, address, parsed.dependencies);
            } catch {
                clearDependencies(this.graph, address);
            }
        } else {
            clearDependencies(this.graph, address);
        }
    }

    private invalidateCache(address: CellAddress): void {
        this.cache.delete(cellKey(address));
    }

    private readRaw(row: number, col: number): CellRawValue | undefined {
        if (this.externalSource) {
            const external = this.externalSource.getRawValue(row, col);
            if (external !== undefined) {
                return external;
            }
        }
        return this.store.getRawValue(row, col);
    }

    private coerceLiteral(raw: CellRawValue | undefined): FormulaValue {
        if (raw === undefined) {
            return null;
        }
        if (isErrorShaped(raw)) {
            return raw;
        }
        return raw as FormulaValue;
    }

    private evaluateCell(
        address: CellAddress,
        visiting: Set<string>,
    ): FormulaValue {
        const key = cellKey(address);
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }
        if (visiting.has(key)) {
            this.cache.set(key, ERROR_CYCLE);
            return ERROR_CYCLE;
        }

        const raw = this.readRaw(address.row, address.col);
        if (!isFormula(raw)) {
            const literal = this.coerceLiteral(raw);
            this.cache.set(key, literal);
            return literal;
        }

        visiting.add(key);
        let value: FormulaValue;
        try {
            const { ast, dependencies } = parseFormula(normalizeFormula(raw));
            setDependencies(this.graph, address, dependencies);
            value = evaluateParsedFormula(ast, (ref) =>
                this.evaluateCell(ref, visiting),
            );
        } catch (err) {
            value = isErrorShaped(err) ? (err as FormulaValue) : {
                type: "error",
                code: "#ERROR!",
                message: String(err),
            };
        }
        visiting.delete(key);
        this.cache.set(key, value);
        return value;
    }
}

/**
 * 便捷工厂：从二维矩阵创建已重算的引擎。
 */
export function createFormulaEngineFromMatrix(
    matrix: CellRawValue[][],
    config: Omit<GridFormulasConfig, "dataSource"> = {},
): FormulaEngine {
    const engine = new FormulaEngine(config);
    engine.loadMatrix(matrix);
    engine.recalculateAll();
    return engine;
}

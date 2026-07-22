/**
 * 公式依赖图与增量重算排序（RFC-0030）。
 * 纯函数：输入依赖边，输出受影响的拓扑序或环检测结果。
 */

import type { CellAddress } from "../types/formulas";
import { cellKey, parseCellKey } from "./a1-notation";

export type DependencyMap = Map<string, Set<string>>;

/** 将依赖列表写入图：cell → 它依赖的 cells */
export function setDependencies(
    graph: DependencyMap,
    cell: CellAddress,
    dependencies: CellAddress[],
): void {
    const key = cellKey(cell);
    graph.set(key, new Set(dependencies.map(cellKey)));
}

export function clearDependencies(graph: DependencyMap, cell: CellAddress): void {
    graph.delete(cellKey(cell));
}

/** 构建反向邻接：dep → 依赖它的公式格子 */
export function buildDependentsIndex(graph: DependencyMap): Map<string, Set<string>> {
    const dependents = new Map<string, Set<string>>();
    for (const [cell, deps] of graph) {
        for (const dep of deps) {
            let set = dependents.get(dep);
            if (!set) {
                set = new Set();
                dependents.set(dep, set);
            }
            set.add(cell);
        }
    }
    return dependents;
}

/**
 * 从变更种子出发，收集所有需要重算的公式格子（含种子若其在图中）。
 */
export function collectAffectedCells(
    graph: DependencyMap,
    seeds: CellAddress[],
): string[] {
    const dependents = buildDependentsIndex(graph);
    const affected = new Set<string>();
    const queue = seeds.map(cellKey);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const next = dependents.get(current);
        if (!next) {
            continue;
        }
        for (const cell of next) {
            if (!affected.has(cell)) {
                affected.add(cell);
                queue.push(cell);
            }
        }
    }

    // 种子本身若是公式单元也需纳入
    for (const seed of seeds) {
        const key = cellKey(seed);
        if (graph.has(key)) {
            affected.add(key);
        }
    }

    return [...affected];
}

export type TopoResult =
    | { ok: true; order: CellAddress[] }
    | { ok: false; cycle: string[] };

/**
 * 对 affected 子图做 Kahn 拓扑排序。
 * 仅使用 graph 中 affected 内的边。
 */
export function topologicalSortAffected(
    graph: DependencyMap,
    affectedKeys: string[],
): TopoResult {
    const affected = new Set(affectedKeys);
    const indegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const key of affected) {
        indegree.set(key, 0);
        adj.set(key, []);
    }

    for (const key of affected) {
        const deps = graph.get(key);
        if (!deps) {
            continue;
        }
        for (const dep of deps) {
            if (!affected.has(dep)) {
                continue;
            }
            // dep → key（依赖必须先算）
            adj.get(dep)!.push(key);
            indegree.set(key, (indegree.get(key) ?? 0) + 1);
        }
    }

    const queue: string[] = [];
    for (const [key, deg] of indegree) {
        if (deg === 0) {
            queue.push(key);
        }
    }

    const order: string[] = [];
    while (queue.length > 0) {
        const current = queue.shift()!;
        order.push(current);
        for (const next of adj.get(current) ?? []) {
            const nextDeg = (indegree.get(next) ?? 0) - 1;
            indegree.set(next, nextDeg);
            if (nextDeg === 0) {
                queue.push(next);
            }
        }
    }

    if (order.length !== affected.size) {
        const leftover = [...affected].filter((k) => !order.includes(k));
        return { ok: false, cycle: leftover };
    }

    return { ok: true, order: order.map(parseCellKey) };
}

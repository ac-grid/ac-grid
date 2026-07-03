/**
 * 虚拟滚动辅助 API（与 {@link Virtualizer} 算法一致，便于单测与无 Grid 集成场景）。
 */

import type { GridVirtualizationConfig } from "../types/virtualization";
import { Virtualizer } from "./virtualizer";

/** DOM 未测量到高度时的回退视口高度（px） */
const DEFAULT_FALLBACK_VIEWPORT_PX = 600;

function resolveViewportHeight(gridRef: HTMLElement | null): number {
    const fromShadowOrDom =
        gridRef?.getRootNode?.() &&
        (gridRef.getRootNode() as Document | ShadowRoot).querySelector?.(
            ".ac-grid",
        );
    const gridElement = (fromShadowOrDom ?? gridRef) as HTMLElement | null;
    const h = gridElement?.clientHeight ?? 0;
    return h > 0 ? h : DEFAULT_FALLBACK_VIEWPORT_PX;
}

/**
 * 计算过滤后行模型下的可见索引区间（end 为 slice 上界，不含 end）。
 */
export function calculateVisibleRange(
    scrollTop: number,
    rowHeight: number,
    gridRef: HTMLElement | null,
    overscan: number,
    totalCount: number = Number.MAX_SAFE_INTEGER,
): { startIndex: number; visibleRowCount: number; endIndex: number } {
    const containerHeight = resolveViewportHeight(gridRef);
    const config: GridVirtualizationConfig = {
        enabled: true,
        rowHeight,
        overscan,
    };
    const virtualizer = new Virtualizer(config);
    virtualizer.updateState(scrollTop, containerHeight, totalCount);
    const state = virtualizer.getVirtualState();
    const rh = rowHeight > 0 ? rowHeight : 1;
    const visibleRowCount = Math.ceil(containerHeight / rh);
    return {
        startIndex: state.visibleRange.start,
        visibleRowCount,
        endIndex: state.visibleRange.end,
    };
}

/**
 * 将行索引转为纵向 scrollTop（固定行高）。
 */
export function scrollToRow(rowIndex: number, rowHeight: number): number {
    return Math.max(0, rowIndex * rowHeight);
}

/**
 * 返回与 `Array.prototype.slice(start, end)` 一致的 half-open 区间。
 */
export function getVisibleRowRange(options: {
    scrollTop: number;
    rowHeight: number;
    gridRef: HTMLElement | null;
    rowCount: number;
    overscan?: number;
}): { start: number; end: number; visibleCount: number } {
    const {
        scrollTop,
        rowHeight,
        gridRef,
        rowCount,
        overscan = 5,
    } = options;
    const containerHeight = resolveViewportHeight(gridRef);
    const virtualizer = new Virtualizer({
        enabled: true,
        rowHeight,
        overscan,
    });
    virtualizer.updateState(scrollTop, containerHeight, rowCount);
    const state = virtualizer.getVirtualState();
    const { start, end } = state.visibleRange;
    const rh = rowHeight > 0 ? rowHeight : 1;
    const maxVisible = Math.ceil(containerHeight / rh);
    const visibleCount = Math.min(maxVisible, Math.max(0, end - start));
    return { start, end, visibleCount };
}

/**
 * 使用 requestAnimationFrame 合并同一帧内多次 scroll（不再按行高阈值丢弃小幅滚动）。
 */
export function createScrollHandler(
    onScroll: (scrollTop: number) => void,
    _rowHeight: number,
): (e: Event) => void {
    let rafId: number | null = null;
    return (e: Event) => {
        const target = e.target as HTMLElement;
        const scrollTop = target.scrollTop;
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            onScroll(scrollTop);
        });
    };
}

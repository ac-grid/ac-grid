import type { GridOptions } from '../components/Grid.wsx';
import type { Row } from '@tanstack/table-core';

/**
 * 虚拟滚动工具函数
 * @module VirtualScroll
 */

// 默认配置
const DEFAULT_ROW_HEIGHT = 50;
const DEFAULT_OVERSCAN = 5; // 预渲染额外行数

/**
 * 计算可见行范围
 */
export function calculateVisibleRange(
  scrollTop: number,
  rowHeight: number,
  gridRef: { current?: HTMLDivElement },
  overscan: number = DEFAULT_OVERSCAN
) {
  if (!gridRef.current) return null;

  const { offsetTop } = gridRef.current;
  const viewHeight = gridRef.current.offsetHeight - offsetTop;
  
  // 计算可见起始行
  const startRowIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
  
  // 计算可见结束行
  const endRowIndex = Math.min(
    (scrollTop + viewHeight) / rowHeight,
    data?.getRowCount() - 1
  );

  return {
    startIndex: startRowIndex,
    endIndex: Math.floor(endRowIndex),
    visibleRowCount: endRowIndex - startRowIndex + 1
  };
}

/**
 * 计算滚动位置（从行索引到 scrollTop）
 */
export function scrollToRow(
  rowIndex: number,
  rowHeight: number,
  stickyHeaderHeight?: number
): number {
  // 调整头高度占位
  const scrollOffset = (stickyHeaderHeight || 0) + rowIndex * rowHeight;
  
  // 滚动到指定行
  window.scrollTo({
    top: scrollOffset,
    behavior: 'smooth',
  });

  return scrollOffset;
}

/**
 * 获取可见行范围（供组件使用）
 */
export function getVisibleRowRange(
  options: {
    scrollTop: number;
    rowHeight: number;
    gridRef?: HTMLDivElement | null;
    rowCount?: number;
  }
): { start: number; end: number; visibleCount: number } {
  const { scrollTop, rowHeight, gridRef, rowCount = 0 } = options;
  
  const viewHeight = gridRef?.clientHeight || 500; // 默认视口高度
  
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight));
  const endIndex = Math.min(
    Math.floor((scrollTop + viewHeight) / rowHeight),
    rowCount - 1
  );

  return {
    start: startIndex,
    end: endIndex,
    visibleCount: endIndex - startIndex + 1,
  };
}

/**
 * 优化滚动性能（使用 RAF）
 */
export function createScrollHandler(
  onScroll?: (scrollTop: number) => void,
  rowHeight: number = DEFAULT_ROW_HEIGHT,
  gridRef?: { current?: HTMLDivElement }
) {
  let rafId: number;
  
  return function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    
    // 清除之前的请求
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    // 使用 RAF 优化滚动性能
    rafId = requestAnimationFrame(() => {
      if (onScroll && gridRef.current) {
        onScroll(gridRef.current.scrollTop);
      }
      
      // 重新计算可见范围
      const range = calculateVisibleRange(
        gridRef.current?.scrollTop || 0,
        rowHeight,
        gridRef
      );

      if (range) {
        // 更新渲染的 DOM
        // TODO: 实现实际的行渲染优化
      }
    });
  };
}

/**
 * 计算行高（固定或动态）
 */
export function getRowHeight(
  options: GridOptions,
  row: Row<any>
): number {
  if (options.estimateRowHeight) {
    // 使用动态行高估计函数
    return options.estimateRowHeight(row);
  }

  return options.rowHeight || DEFAULT_ROW_HEIGHT;
}

/**
 * 配置虚拟滚动选项
 */
export function getVirtualScrollOptions(
  options: GridOptions & Pick<GridOptions, 'enableVirtualScrolling'> = {}
): {
  enabled: boolean;
  rowHeight: number;
  overscan: number;
  estimateRowHeight?: (row: Row<any>) => number;
} {
  return {
    enabled: options.enableVirtualScrolling === true,
    rowHeight: options.rowHeight || DEFAULT_ROW_HEIGHT,
    overscan: options.overscan || DEFAULT_OVERSCAN,
    estimateRowHeight: options.estimateRowHeight,
  };
}

/**
 * 检查是否需要虚拟滚动（大数据集）
 */
export function shouldUseVirtualScrolling(
  rowCount: number,
  threshold: number = 1000 // 超过 1000 行启用虚拟滚动
): boolean {
  return rowCount > threshold;
}

// 导出所有工具
export default {
  calculateVisibleRange,
  scrollToRow,
  getVisibleRowRange,
  createScrollHandler,
  getRowHeight,
  getVirtualScrollOptions,
  shouldUseVirtualScrolling,
};

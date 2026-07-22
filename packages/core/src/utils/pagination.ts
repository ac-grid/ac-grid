/**
 * RFC-0006: 分页纯函数工具
 */

/** 默认每页大小 */
export const DEFAULT_PAGE_SIZE = 10;

/** 默认每页大小选项 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

/**
 * 根据总行数与每页大小计算总页数（至少 1 页，0 行时为 0 页）
 */
export function computeTotalPages(totalRows: number, pageSize: number): number {
    if (totalRows <= 0) {
        return 0;
    }
    if (pageSize <= 0) {
        return 1;
    }
    return Math.ceil(totalRows / pageSize);
}

/**
 * 将页码限制在有效范围内 [0, totalPages - 1]
 */
export function clampPageIndex(pageIndex: number, totalPages: number): number {
    if (totalPages <= 0) {
        return 0;
    }
    return Math.max(0, Math.min(pageIndex, totalPages - 1));
}

/**
 * 计算当前页显示区间（1-based，含首尾）
 */
export function computePageRange(
    pageIndex: number,
    pageSize: number,
    totalRows: number,
): { start: number; end: number } {
    if (totalRows <= 0) {
        return { start: 0, end: 0 };
    }
    const start = pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, totalRows);
    return { start, end };
}

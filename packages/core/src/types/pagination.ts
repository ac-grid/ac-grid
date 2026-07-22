/** 分页状态（与 TanStack Table pagination state 对齐） */
export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

/** 对外 API 返回的完整分页信息 */
export interface PaginationInfo extends PaginationState {
    totalRows: number;
    totalPages: number;
}

/** 服务端分页回调返回的数据结构 */
export interface PaginatedData<T = unknown> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

export interface GridPaginationConfig {
    /**
     * 是否启用分页（默认：false）
     */
    enabled?: boolean;
    /**
     * 分页模式（默认：'client'）
     */
    mode?: "client" | "server";
    /**
     * 初始每页大小（默认：10）
     */
    pageSize?: number;
    /**
     * 每页大小选项（默认：[10, 20, 30, 40, 50]）
     */
    pageSizeOptions?: number[];
    /**
     * 初始页码（从 0 开始，默认：0）
     */
    initialPageIndex?: number;
    /**
     * 分页状态变化回调
     */
    onPaginationChange?: (state: PaginationState) => void;
    /**
     * 服务端分页总行数（server 模式；也可由 onServerPagination 响应更新）
     */
    serverTotalRows?: number;
    /**
     * 服务端分页数据加载回调（page 从 0 开始）
     */
    onServerPagination?: (
        page: number,
        pageSize: number,
    ) => Promise<PaginatedData>;
}

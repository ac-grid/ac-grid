export interface PaginationState {
    pageIndex: number;
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
    mode?: 'client' | 'server';
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
     * 服务端分页总行数（仅 server 模式需要）
     */
    serverTotalRows?: number;
}

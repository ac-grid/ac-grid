export interface GridVirtualizationConfig {
    /**
     * 是否启用虚拟滚动（默认：false）
     */
    enabled?: boolean;
    /**
     * 固定行高（像素，默认：35）
     */
    rowHeight?: number;
    /**
     * 预渲染行数（默认：5）
     */
    overscan?: number;
}

export interface VirtualizerState {
    scrollTop: number;
    containerHeight: number;
    totalHeight: number;
    visibleRange: {
        start: number;
        end: number;
    };
}

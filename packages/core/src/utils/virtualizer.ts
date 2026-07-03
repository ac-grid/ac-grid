import { type GridVirtualizationConfig, type VirtualizerState } from "../types/virtualization";

export class Virtualizer {
    private config: GridVirtualizationConfig;
    private scrollTop: number = 0;
    private containerHeight: number = 0;
    private totalCount: number = 0;

    constructor(config: GridVirtualizationConfig) {
        this.config = config;
    }

    updateConfig(config: GridVirtualizationConfig) {
        this.config = { ...this.config, ...config };
    }

    updateState(scrollTop: number, containerHeight: number, totalCount: number) {
        this.scrollTop = scrollTop;
        this.containerHeight = containerHeight;
        this.totalCount = totalCount;
    }

    getVirtualState(): VirtualizerState {
        const rowHeight = this.config.rowHeight ?? 35;
        const overscan = this.config.overscan ?? 5;
        const totalHeight = this.totalCount * rowHeight;

        // RFC-0005：未启用或容器高度未测量时，不裁剪行，但总高度仍为 totalCount * rowHeight
        if (!this.config.enabled || this.containerHeight === 0) {
            return {
                scrollTop: this.scrollTop,
                containerHeight: this.containerHeight,
                totalHeight,
                visibleRange: { start: 0, end: this.totalCount }
            };
        }

        const startIndex = Math.max(0, Math.floor(this.scrollTop / rowHeight) - overscan);
        const visibleCount = Math.ceil(this.containerHeight / rowHeight);
        let endIndex = Math.min(
            this.totalCount,
            startIndex + visibleCount + 2 * overscan,
        );

        // When scrollTop exceeds content (e.g. after filter shrink), clamp the window
        let clampedStart = startIndex;
        if (clampedStart >= this.totalCount && this.totalCount > 0) {
            clampedStart = Math.max(0, this.totalCount - visibleCount - 2 * overscan);
            endIndex = this.totalCount;
        }

        return {
            scrollTop: this.scrollTop,
            containerHeight: this.containerHeight,
            totalHeight,
            visibleRange: {
                start: clampedStart,
                end: Math.max(clampedStart, endIndex),
            },
        };
    }
}

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
        const rowHeight = this.config.rowHeight || 35;
        const overscan = this.config.overscan || 5;
        const totalHeight = this.totalCount * rowHeight;

        if (!this.config.enabled || this.containerHeight === 0) {
            return {
                scrollTop: 0,
                containerHeight: 0,
                totalHeight: 0,
                visibleRange: { start: 0, end: this.totalCount }
            };
        }

        const startIndex = Math.max(0, Math.floor(this.scrollTop / rowHeight) - overscan);
        const visibleCount = Math.ceil(this.containerHeight / rowHeight);
        const endIndex = Math.min(this.totalCount, startIndex + visibleCount + 2 * overscan);

        return {
            scrollTop: this.scrollTop,
            containerHeight: this.containerHeight,
            totalHeight,
            visibleRange: {
                start: startIndex,
                end: endIndex
            }
        };
    }
}

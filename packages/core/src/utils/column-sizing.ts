import type { ColumnDef } from "../types/column";
import type { GridResizingConfig } from "../types/resizing";

/** 表头文字测量字体（与 Grid.css 中 header 样式一致） */
export const HEADER_MEASURE_FONT =
    '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** 单元格文字测量字体 */
export const CELL_MEASURE_FONT =
    '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** 列内边距 + 拖拽手柄预留宽度 */
export const COLUMN_CONTENT_PADDING = 32;

const DEFAULT_MIN_COLUMN_WIDTH = 20;
const DEFAULT_MAX_COLUMN_WIDTH = Number.MAX_SAFE_INTEGER;
const DEFAULT_COLUMN_WIDTH = 150;

let measureCanvas: HTMLCanvasElement | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
    if (typeof document === "undefined") {
        return null;
    }
    if (!measureCanvas) {
        measureCanvas = document.createElement("canvas");
    }
    return measureCanvas.getContext("2d");
}

/**
 * 使用 canvas 测量文本宽度
 */
export function measureTextWidth(text: string, font = CELL_MEASURE_FONT): number {
    const ctx = getMeasureContext();
    if (!ctx) {
        return String(text).length * 8;
    }
    ctx.font = font;
    return ctx.measureText(String(text)).width;
}

/**
 * 解析列 ID
 */
export function resolveColumnId(column: ColumnDef<any, any>): string | undefined {
    return column.id ?? (column as { accessorKey?: string }).accessorKey;
}

/**
 * 按 columnId 查找列定义
 */
export function findColumnDefById(
    columns: ColumnDef<any, any>[],
    columnId: string,
): ColumnDef<any, any> | undefined {
    return columns.find((col) => resolveColumnId(col) === columnId);
}

/**
 * 获取列宽上下界（列级 minSize/maxSize 优先于全局配置）
 */
export function getColumnSizeBounds(
    columnDef: ColumnDef<any, any> | undefined,
    config: GridResizingConfig | undefined,
): { min: number; max: number } {
    const min =
        columnDef?.minSize ??
        config?.minColumnWidth ??
        DEFAULT_MIN_COLUMN_WIDTH;
    const max =
        columnDef?.maxSize ??
        config?.maxColumnWidth ??
        DEFAULT_MAX_COLUMN_WIDTH;
    return { min, max };
}

/**
 * 将宽度限制在 min/max 范围内
 */
export function clampColumnWidth(
    width: number,
    columnDef: ColumnDef<any, any> | undefined,
    config: GridResizingConfig | undefined,
): number {
    const { min, max } = getColumnSizeBounds(columnDef, config);
    return Math.max(min, Math.min(max, width));
}

/**
 * 读取单元格展示文本
 */
function getCellDisplayValue(
    row: Record<string, unknown>,
    column: ColumnDef<any, any>,
): string {
    const accessorKey = (column as { accessorKey?: string }).accessorKey;
    const accessorFn = (column as { accessorFn?: (row: unknown, index: number) => unknown }).accessorFn;

    let value: unknown;
    if (typeof accessorFn === "function") {
        value = accessorFn(row, 0);
    } else if (accessorKey) {
        value = row[accessorKey];
    }

    return value == null ? "" : String(value);
}

/**
 * 读取表头展示文本
 */
function getHeaderDisplayValue(
    column: ColumnDef<any, any>,
    columnId: string,
): string {
    const header = column.header;
    if (typeof header === "string") {
        return header;
    }
    return columnId;
}

/**
 * 根据列内容与表头文本估算自动列宽
 */
export function calculateColumnContentWidth(
    columnId: string,
    columns: ColumnDef<any, any>[],
    data: Record<string, unknown>[],
): number {
    const column = findColumnDefById(columns, columnId);
    if (!column) {
        return DEFAULT_COLUMN_WIDTH;
    }

    let maxWidth = measureTextWidth(
        getHeaderDisplayValue(column, columnId),
        HEADER_MEASURE_FONT,
    );

    for (const row of data) {
        const cellText = getCellDisplayValue(row, column);
        if (cellText) {
            maxWidth = Math.max(maxWidth, measureTextWidth(cellText));
        }
    }

    return Math.ceil(maxWidth + COLUMN_CONTENT_PADDING);
}

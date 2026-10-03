export interface ClipboardCellParams<TData = unknown> {
    value: unknown;
    row: TData;
    rowIndex: number;
    columnId: string;
}

export interface ClipboardPasteParams<TData = unknown>
    extends ClipboardCellParams<TData> {
    value: string;
}

export interface GridClipboardConfig<TData = unknown> {
    enabled?: boolean;
    /** Skip the browser Clipboard API and use the supplied custom handlers. */
    suppressClipboardApi?: boolean;
    processCellForClipboard?: (params: ClipboardCellParams<TData>) => string;
    processCellFromClipboard?: (params: ClipboardPasteParams<TData>) => unknown;
    copyToClipboard?: (text: string) => void;
    readFromClipboard?: () => string | Promise<string>;
}

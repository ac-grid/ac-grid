import type { Header } from "@tanstack/table-core";
import type { ColumnDef } from "../types/column";
import { flexRender } from "./flex-render";
import { renderComponent } from "./render-component";

/** 解析表头内容：优先 headerComponent，否则走 TanStack header + flexRender */
export function resolveHeaderContent<TData>(
    header: Header<TData, unknown>,
): HTMLElement | string | number | null {
    const colDef = header.column.columnDef as ColumnDef<TData, unknown>;
    const context = header.getContext();

    if (colDef.headerComponent) {
        return renderComponent(
            colDef.headerComponent,
            {
                displayName:
                    typeof colDef.header === "string"
                        ? colDef.header
                        : undefined,
                column: header.column,
                ...colDef.headerComponentParams,
            },
            context,
        );
    }

    return flexRender(colDef.header, context);
}

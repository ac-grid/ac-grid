// needed for table body level scope DnD setup
import { Header, flexRender } from "@tanstack/react-table";
import { CSSProperties } from "react";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function DraggableTableHeader<T>({
    header,
    onMouseEnter,
    onMouseLeave,
}: {
    header: Header<T, unknown>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) {
    const { attributes, isDragging, listeners, setNodeRef, transform } =
        useSortable({
            id: header.column.id,
        });

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: "relative",
        transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
        transition: "width transform 0.2s ease-in-out",
        whiteSpace: "nowrap",
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <th
            colSpan={header.colSpan}
            ref={setNodeRef}
            style={style}
            className="px-4 pr-2 py-4 font-medium text-left"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {header.isPlaceholder
                ? null
                : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                  )}
            <button {...attributes} {...listeners}>
                🟰
            </button>
        </th>
    );
}

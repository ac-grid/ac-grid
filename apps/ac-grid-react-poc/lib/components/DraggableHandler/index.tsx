import { useSortable } from "@dnd-kit/sortable";

// Cell Component
export function DraggableHandler({ rowId }: { rowId: string }) {
    const { attributes, listeners } = useSortable({
        id: rowId,
    });
    return (
        // Alternatively, you could set these attributes on the rows themselves
        <button {...attributes} {...listeners}>
            🟰
        </button>
    );
}

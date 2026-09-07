/**
 * RFC-0005 E2E fixture: virtual scrolling only (no pagination/pinning noise).
 * Loaded when URL contains `?e2e=virtual-scroll`.
 */
import { useEffect, useMemo, useRef } from "react";
import { createGrid } from "@ac-grid/core";
import type { ColumnDef } from "@tanstack/react-table";

const VIRTUAL_ROW_COUNT = 10_000;

type VirtualRow = {
    userId: string;
    firstName: string;
    lastName: string;
};

/** Lightweight row factory — avoids slow faker for 10K E2E rows */
function makeVirtualRows(count: number): VirtualRow[] {
    return Array.from({ length: count }, (_, i) => ({
        userId: String(i),
        firstName: `First${i}`,
        lastName: `Last${i}`,
    }));
}

export default function VirtualScrollingDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const data = useMemo(() => makeVirtualRows(VIRTUAL_ROW_COUNT), []);
    const virtualizationConfig = useMemo(
        () => ({
            enabled: true,
            rowHeight: 35,
            overscan: 5,
        }),
        [],
    );
    const columns = useMemo<ColumnDef<VirtualRow>[]>(
        () => [
            {
                id: "firstName",
                accessorKey: "firstName",
                header: "First Name",
            },
            {
                id: "lastName",
                accessorKey: "lastName",
                header: "Last Name",
            },
        ],
        [],
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        container.replaceChildren();
        const grid = createGrid({
            data,
            columns,
            virtualization: virtualizationConfig,
            className: "h-full w-full",
        });
        grid.style.display = "block";
        grid.style.height = "100%";
        grid.style.width = "100%";
        (window as unknown as { __acGridVirtual?: HTMLElement }).__acGridVirtual = grid;
        container.appendChild(grid);

        return () => {
            container.replaceChildren();
            delete (window as unknown as { __acGridVirtual?: HTMLElement }).__acGridVirtual;
        };
    }, [data, columns, virtualizationConfig]);

    return (
        <div
            data-testid="virtual-scroll-demo"
            className="flex flex-col h-screen p-4 gap-2"
        >
            <h1 data-testid="virtual-scroll-title">Virtual Scrolling E2E</h1>
            <p data-testid="virtual-scroll-meta">
                Rows: {VIRTUAL_ROW_COUNT} (virtualized)
            </p>
            <div
                ref={containerRef}
                data-testid="virtual-scroll-grid-host"
                className="flex-1 min-h-0 border rounded-lg overflow-hidden"
                style={{ height: "70vh", minHeight: 480 }}
            />
        </div>
    );
}

import { describe, it, expect, afterEach } from "vitest";
import { createTable, getCoreRowModel } from "@tanstack/table-core";
import "../src/components/DraggableTableCell.wsx";

const frame = () => new Promise((r) => setTimeout(r, 20));
const settle = async () => {
    await frame();
    for (let i = 0; i < 20; i++) {
        const busy = Array.from(document.querySelectorAll("wsx-ac-draggable-table-cell")).some((e: any) => e._isRendering);
        if (!busy) break;
        await frame();
    }
    await frame();
};

const mount = async (setup?: (el: any) => void) => {
    const el = document.createElement("wsx-ac-draggable-table-cell") as any;
    setup?.(el);
    document.body.appendChild(el);
    await settle();
    return el;
};

function realCell(columnDef: Record<string, unknown> = {}) {
    const table = createTable({
        data: [{ name: "Alice" }],
        columns: [{ accessorKey: "name", header: "Name", ...columnDef }],
        getCoreRowModel: getCoreRowModel(),
        state: { columnPinning: { left: [], right: [] } },
        onStateChange: () => {},
        renderFallbackValue: null,
    });
    return table.getRowModel().rows[0].getVisibleCells()[0];
}

/** Minimal cell whose column is fully scripted, for sizing fallbacks */
function fakeCell(getSize: () => number, size?: number, cell: unknown = () => "fake") {
    return {
        column: { getSize, columnDef: { size, cell } },
        getContext: () => ({}),
    } as any;
}

describe("DraggableTableCell coverage", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("shows a loading cell without a cell or without a column", async () => {
        const el = await mount();
        expect(el.querySelector("td")!.textContent).toBe("Loading...");
        el.cell = { column: undefined } as any;
        expect(el.render().textContent).toBe("Loading...");
    });

    // NOTE: wsx does not apply object-valued `style` props in jsdom, so widths are not observable in the
    // DOM; sizing fallbacks are asserted through the column calls they make and the content still rendering.
    it("renders the cell content", async () => {
        const el = await mount((e) => (e.cell = realCell({ cell: (ctx: any) => `v:${ctx.getValue()}`, size: 90 })));
        const td = el.querySelector("td") as HTMLElement;
        expect(td.textContent).toBe("v:Alice");
        expect(td.tagName).toBe("TD");
    });

    it("updates when the cell property changes and ignores the identical cell", async () => {
        const first = realCell({ cell: () => "one" });
        const el = await mount((e) => (e.cell = first));
        el.cell = first;
        expect(el.cell).toBe(first);
        el.cell = realCell({ cell: () => "two" });
        await settle();
        expect(el.querySelector("td")!.textContent).toBe("two");
    });

    it("consults getSize and still renders when it is falsy", async () => {
        const el = await mount();
        let calls = 0;
        el.cell = fakeCell(() => (calls++, 0), 80, () => "sized");
        expect(el.render().textContent).toBe("sized");
        el.cell = fakeCell(() => (calls++, 0), undefined, () => "default");
        expect(el.render().textContent).toBe("default");
        expect(calls).toBe(2);
    });

    it("still renders when getSize throws", async () => {
        const boom = () => {
            throw new Error("no size");
        };
        const el = await mount();
        el.cell = fakeCell(boom, 70, () => "sized");
        expect(el.render().textContent).toBe("sized");
        el.cell = fakeCell(boom, undefined, () => "default");
        expect(el.render().textContent).toBe("default");
    });

    it("renders empty content when the column has no cell renderer", async () => {
        const el = await mount();
        el.cell = fakeCell(() => 100, 100, null);
        expect(el.render().textContent).toBe("");
    });

    it("onConnected adopts an own cell property", async () => {
        const cell = realCell({ cell: () => "own" });
        const proto = customElements.get("wsx-ac-draggable-table-cell")!.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "cell")!.set!;
        const el = await mount((e) =>
            Object.defineProperty(e, "cell", { get: () => cell, set: (v) => setter.call(e, v), configurable: true })
        );
        expect(el._cell).toBe(cell);
        expect(el.querySelector("td")!.textContent).toBe("own");
    });

    it("onConnected leaves an existing cell alone", async () => {
        const mine = realCell({ cell: () => "mine" });
        const el = document.createElement("wsx-ac-draggable-table-cell") as any;
        el.cell = mine;
        document.body.appendChild(el);
        await settle();
        expect(el.cell).toBe(mine);
    });
});

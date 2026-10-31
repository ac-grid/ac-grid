import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { createTable, getCoreRowModel } from "@tanstack/table-core";
import "../src/components/DraggableTableRow.wsx";

const TAG = "wsx-ac-draggable-table-row";
const frame = (ms = 20) => new Promise((r) => setTimeout(r, ms));
const settle = async () => {
    await frame();
    for (let i = 0; i < 20; i++) {
        const busy = Array.from(document.querySelectorAll(TAG)).some((e: any) => e._isRendering);
        if (!busy) break;
        await frame();
    }
    await frame();
};

const VISIBLE = () => ({ width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20, x: 0, y: 0 }) as DOMRect;

function realRows() {
    const table = createTable({
        data: [
            { name: "A", age: 1 },
            { name: "B", age: 2 },
        ],
        columns: [
            { accessorKey: "name", header: "Name", cell: (c: any) => `n:${c.getValue()}` },
            { accessorKey: "age", header: "Age", cell: (c: any) => `a:${c.getValue()}` },
        ],
        getCoreRowModel: getCoreRowModel(),
        state: { columnPinning: { left: [], right: [] } },
        onStateChange: () => {},
        renderFallbackValue: null,
    });
    return table.getRowModel().rows;
}

function fakeRow(id: string) {
    return { id, getVisibleCells: () => [] } as any;
}

/** Build, optionally pre-configure, then connect a header element. */
async function mount(setup?: (el: any) => void, visible = true) {
    const el = document.createElement(TAG) as any;
    if (visible) el.getBoundingClientRect = VISIBLE;
    setup?.(el);
    document.body.appendChild(el);
    await settle();
    // setupDragAndDrop runs after two animation frames
    await frame(60);
    return el;
}

function dnd(type: string, dt: unknown) {
    const e: any = new Event(type, { bubbles: true, cancelable: true });
    e.dataTransfer = dt;
    e.clientX = 1;
    e.clientY = 1;
    return e;
}
const dt = () => ({ setDragImage() {}, setData() {}, getData: () => "", types: [], effectAllowed: "", dropEffect: "" });

async function dragOnto(from: HTMLElement, to: HTMLElement) {
    const t = dt();
    from.dispatchEvent(dnd("dragstart", t));
    await frame(50);
    to.dispatchEvent(dnd("dragenter", t));
    to.dispatchEvent(dnd("dragover", t));
    await frame(50);
    to.dispatchEvent(dnd("drop", t));
    await frame(50);
    from.dispatchEvent(dnd("dragend", t));
    await frame(50);
}

describe("DraggableTableRow coverage", () => {
    let warn: ReturnType<typeof vi.spyOn>;
    let error: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
        warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        error = vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => {
        document.body.innerHTML = "";
        vi.restoreAllMocks();
    });

    describe("render", () => {
        it("shows a loading row without a row", async () => {
            const el = await mount();
            expect(el.querySelector("tr td")!.textContent).toBe("Loading...");
        });

        it("renders one cell element per visible cell", async () => {
            const [first] = realRows();
            const el = await mount((e) => (e.row = first));
            await settle();
            const cells = el.querySelectorAll("wsx-ac-draggable-table-cell");
            expect(cells.length).toBe(2);
            expect(Array.from(cells).map((c: any) => c.textContent)).toEqual(["n:A", "a:1"]);
        });
    });

    describe("properties", () => {
        it("exposes row and onDragEnd; identical row is a no-op", async () => {
            const [first, second] = realRows();
            const fn = vi.fn();
            const el = await mount();
            el.onDragEnd = fn;
            el.row = first;
            el.row = first;
            expect(el.row).toBe(first);
            expect(el.onDragEnd).toBe(fn);
            el.row = second;
            await settle();
            expect(el.querySelectorAll("wsx-ac-draggable-table-cell")[0].textContent).toBe("n:B");
        });

        it("onConnected adopts own row/onDragEnd and keeps existing ones", async () => {
            const [first] = realRows();
            const fn = vi.fn();
            const proto = customElements.get(TAG)!.prototype;
            const rs = Object.getOwnPropertyDescriptor(proto, "row")!.set!;
            const ds = Object.getOwnPropertyDescriptor(proto, "onDragEnd")!.set!;
            const el = await mount((e) => {
                Object.defineProperty(e, "row", { get: () => first, set: (v) => rs.call(e, v), configurable: true });
                Object.defineProperty(e, "onDragEnd", { get: () => fn, set: (v) => ds.call(e, v), configurable: true });
            });
            expect(el._row).toBe(first);
            expect(el._onDragEnd).toBe(fn);

            const kept = await mount((e) => {
                e.row = first;
                e.onDragEnd = fn;
            });
            expect(kept._onDragEnd).toBe(fn);
            expect(kept.row).toBe(first);
        });

        it("setting a row after connect sets up drag and drop; null row does not", async () => {
            const [r1, r2] = realRows();
            const el = await mount();
            el.row = null;
            await frame(60);
            expect(warn).not.toHaveBeenCalled();
            const onDragEnd = vi.fn();
            el.onDragEnd = onDragEnd;
            el.row = r1;
            await frame(80);
            const other = await mount((e) => (e.row = r2));
            await dragOnto(other, el);
            expect(onDragEnd).toHaveBeenCalledWith("1", "0");
        });

        it("skips deferred setup when disconnected before the frames fire", async () => {
            const [r1] = realRows();
            const el = await mount();
            el.row = r1;
            el.remove();
            await frame(80);
            const el2 = document.createElement(TAG) as any;
            el2.row = r1;
            document.body.appendChild(el2);
            el2.remove();
            await frame(80);
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe("drag and drop", () => {
        it("reports drops between rows", async () => {
            const [r1, r2] = realRows();
            const onDragEnd = vi.fn();
            const a = await mount((e) => {
                e.row = r1;
                e.onDragEnd = onDragEnd;
            });
            const b = await mount((e) => (e.row = r2));
            await dragOnto(b, a);
            expect(onDragEnd).toHaveBeenCalledWith("1", "0");
        });

        it("renders again after a drag starts and ends", async () => {
            const [r1] = realRows();
            const a = await mount((e) => (e.row = r1));
            const t = dt();
            a.dispatchEvent(dnd("dragstart", t));
            await frame(50);
            await settle();
            expect(a.isDragging).toBe(true);
            a.dispatchEvent(dnd("dragend", t));
            await frame(50);
            await settle();
            expect(a.isDragging).toBe(false);
            expect(a.querySelectorAll("wsx-ac-draggable-table-cell").length).toBe(2);
        });

        it("ignores drops on itself, foreign draggables and a missing handler", async () => {
            const [r1, r2] = realRows();
            const onDragEnd = vi.fn();
            const a = await mount((e) => {
                e.row = r1;
                e.onDragEnd = onDragEnd;
            });
            await dragOnto(a, a);
            const { draggable } = await import("@atlaskit/pragmatic-drag-and-drop/element/adapter");
            const foreign = document.createElement("div");
            document.body.appendChild(foreign);
            const stop = draggable({ element: foreign, getInitialData: () => ({}) });
            await dragOnto(foreign, a);
            stop();
            const noHandler = await mount((e) => (e.row = r2));
            await dragOnto(a, noHandler);
            expect(onDragEnd).not.toHaveBeenCalled();
        });

        it("cleans up registrations on disconnect", async () => {
            const [r1, r2] = realRows();
            const onDragEnd = vi.fn();
            const target = await mount((e) => {
                e.row = r1;
                e.onDragEnd = onDragEnd;
            });
            const src = await mount((e) => (e.row = r2));
            await dragOnto(src, target);
            expect(onDragEnd).toHaveBeenCalledTimes(1);
            src.remove();
            await dragOnto(src, target);
            expect(onDragEnd).toHaveBeenCalledTimes(1);
        });

        it("disconnecting without any drag setup is safe", async () => {
            const el = await mount();
            expect(() => el.remove()).not.toThrow();
        });
    });

    describe("setupDragAndDrop guards", () => {
        it("does nothing without a row", async () => {
            const el = await mount();
            el.setupDragAndDrop();
            expect(warn).not.toHaveBeenCalled();
        });

        it("warns when not connected", async () => {
            const [r1] = realRows();
            const el = document.createElement(TAG) as any;
            el._row = r1;
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("not connected"));
        });

        it("warns when the element has no getBoundingClientRect", async () => {
            const [r1] = realRows();
            const el = await mount((e) => {
                e.row = r1;
                Object.defineProperty(e, "getBoundingClientRect", { value: undefined, configurable: true });
            });
            warn.mockClear();
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("Invalid element"));
        });

        it("warns when measuring throws or returns nothing", async () => {
            const [r1] = realRows();
            const el = await mount((e) => (e.row = r1));
            warn.mockClear();
            el.getBoundingClientRect = () => {
                throw new Error("layout");
            };
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("Error checking element bounds"), expect.any(Error));
            warn.mockClear();
            el.getBoundingClientRect = () => null;
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("not visible"));
        });

        it("retries while invisible and stops once disconnected", async () => {
            const [r1, r2] = realRows();
            const onDragEnd = vi.fn();
            const el = await mount((e) => {
                e.row = r1;
                e.onDragEnd = onDragEnd;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("not visible"));
            el.getBoundingClientRect = VISIBLE;
            await frame(150);
            const src = await mount((e) => (e.row = r2));
            await dragOnto(src, el);
            expect(onDragEnd).toHaveBeenCalledWith("1", "0");

            const gone = await mount((e) => {
                e.row = r1;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            gone.remove();
            warn.mockClear();
            await frame(150);
            expect(warn).not.toHaveBeenCalled();
        });

        it("retry timer is a no-op when the row was cleared", async () => {
            const [r1] = realRows();
            const el = await mount((e) => {
                e.row = r1;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            el._row = null;
            warn.mockClear();
            await frame(150);
            expect(warn).not.toHaveBeenCalled();
        });

        it("warns when the row has no id", async () => {
            await mount((e) => (e.row = fakeRow("")));
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("No row ID"));
        });

        it("logs an error when registering drag and drop fails", async () => {
            const [r1] = realRows();
            const el = await mount();
            el._row = r1;
            el.setAttribute = () => {
                throw new Error("boom");
            };
            el.setupDragAndDrop();
            expect(error).toHaveBeenCalledWith(expect.stringContaining("Error setting up"), expect.any(Error));
        });
    });
});

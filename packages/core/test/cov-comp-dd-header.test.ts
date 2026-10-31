import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { createTable, getCoreRowModel } from "@tanstack/table-core";
import "../src/components/DraggableTableHeader.wsx";

const TAG = "wsx-ac-draggable-table-header";
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

function realHeaders(headerDef: unknown = "Name") {
    const table = createTable({
        data: [{ name: "A", age: 1 }],
        columns: [
            { accessorKey: "name", header: headerDef as any },
            { accessorKey: "age", header: "Age", size: 60 },
        ],
        getCoreRowModel: getCoreRowModel(),
        state: { columnPinning: { left: [], right: [] } },
        onStateChange: () => {},
        renderFallbackValue: null,
    });
    return table.getHeaderGroups()[0].headers;
}

function fakeHeader(over: Record<string, unknown> = {}, col: Record<string, unknown> = {}) {
    return {
        id: "h",
        colSpan: 1,
        isPlaceholder: false,
        column: { id: "col", getSize: () => 100, columnDef: { header: "Fake", size: 100 }, ...col },
        getContext: () => ({}),
        ...over,
    } as any;
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

describe("DraggableTableHeader coverage", () => {
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
        it("shows Loading... without header or column", async () => {
            const el = await mount();
            expect(el.querySelector("th")!.textContent).toBe("Loading...");
            el.header = { column: undefined } as any;
            expect(el.render().textContent).toBe("Loading...");
        });

        it("renders nothing for placeholder headers", async () => {
            const el = await mount();
            el.header = fakeHeader({ isPlaceholder: true });
            expect(el.render()).toBeNull();
        });

        it("renders title, colSpan, drag handle button for a real header", async () => {
            const [name] = realHeaders();
            const el = await mount((e) => (e.header = name));
            const th = el.querySelector("th") as HTMLElement;
            expect(th.textContent).toContain("Name");
            expect(th.className).toBe("draggable-header");
            expect(th.getAttribute("colspan")).toBe("1");
            const button = th.querySelector("button.drag-handle-button")!;
            expect(button.getAttribute("aria-label")).toBe("Drag column to reorder");
            expect(th.hasAttribute("data-dragging")).toBe(false);
        });

        it("renders a function header and falls back to column id / empty text", async () => {
            const el = await mount();
            const span = document.createElement("b");
            span.textContent = "custom";
            el.header = fakeHeader({}, { columnDef: { header: () => span } });
            expect(el.render().querySelector("b")).toBe(span);
            el.header = fakeHeader({}, { id: "the-id", columnDef: { header: null } });
            expect(el.render().textContent).toBe("the-id");
            el.header = fakeHeader({}, { id: "", columnDef: { header: undefined } });
            expect(el.render().textContent).toBe("");
        });

        it("still renders when getSize is falsy or throws", async () => {
            const el = await mount();
            const boom = () => {
                throw new Error("x");
            };
            for (const [getSize, size] of [
                [() => 0, 40],
                [() => 0, undefined],
                [boom, 40],
                [boom, undefined],
            ] as const) {
                el.header = fakeHeader({}, { getSize, columnDef: { header: "T", size } });
                expect(el.render().textContent).toContain("T");
            }
        });
    });

    describe("header / onDragEnd properties", () => {
        it("exposes onDragEnd and header", async () => {
            const [name] = realHeaders();
            const fn = vi.fn();
            const el = await mount();
            el.onDragEnd = fn;
            el.header = name;
            expect(el.onDragEnd).toBe(fn);
            expect(el.header).toBe(name);
            el.header = name; // identical: no-op
            expect(el.header).toBe(name);
        });

        it("onConnected adopts own header/onDragEnd and keeps existing ones", async () => {
            const [name] = realHeaders();
            const fn = vi.fn();
            const proto = customElements.get(TAG)!.prototype;
            const hs = Object.getOwnPropertyDescriptor(proto, "header")!.set!;
            const ds = Object.getOwnPropertyDescriptor(proto, "onDragEnd")!.set!;
            const el = await mount((e) => {
                Object.defineProperty(e, "header", { get: () => name, set: (v) => hs.call(e, v), configurable: true });
                Object.defineProperty(e, "onDragEnd", { get: () => fn, set: (v) => ds.call(e, v), configurable: true });
            });
            expect(el.querySelector("th")!.textContent).toContain("Name");
            expect(el._onDragEnd).toBe(fn);

            const kept = await mount((e) => {
                e.header = name;
                e.onDragEnd = fn;
            });
            expect(kept._onDragEnd).toBe(fn);
            expect(kept.header).toBe(name);
        });

        it("setting a header after connect sets up drag and drop; null header does not", async () => {
            const [name, age] = realHeaders();
            const el = await mount();
            el.header = null;
            await frame(60);
            expect(warn).not.toHaveBeenCalled();
            const onDragEnd = vi.fn();
            el.onDragEnd = onDragEnd;
            el.header = name;
            await frame(80);
            const other = await mount((e) => (e.header = age));
            await dragOnto(el, other);
            expect(onDragEnd).not.toHaveBeenCalled(); // `other` has no handler, `el` is source
            await dragOnto(other, el);
            expect(onDragEnd).toHaveBeenCalledWith("age", "name");
        });

        it("skips deferred setup when disconnected before the frames fire", async () => {
            const [name] = realHeaders();
            const el = await mount();
            el.header = name;
            el.remove();
            await frame(80);
            expect(warn).not.toHaveBeenCalled();
            // same for the connectedCallback path
            const el2 = document.createElement(TAG) as any;
            el2.header = name;
            document.body.appendChild(el2);
            el2.remove();
            await frame(80);
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe("drag and drop", () => {
        it("marks the header as dragging while dragged and reports the drop", async () => {
            const [name, age] = realHeaders();
            const onDragEnd = vi.fn();
            const a = await mount((e) => {
                e.header = name;
                e.onDragEnd = onDragEnd;
            });
            const b = await mount((e) => (e.header = age));

            const t = dt();
            b.dispatchEvent(dnd("dragstart", t));
            await frame(50);
            await settle();
            expect(b.querySelector("th")!.hasAttribute("data-dragging")).toBe(true);
            a.dispatchEvent(dnd("dragenter", t));
            a.dispatchEvent(dnd("dragover", t));
            await frame(50);
            a.dispatchEvent(dnd("drop", t));
            await frame(50);
            b.dispatchEvent(dnd("dragend", t));
            await settle();
            expect(onDragEnd).toHaveBeenCalledWith("age", "name");
            expect(b.querySelector("th")!.hasAttribute("data-dragging")).toBe(false);
        });

        it("ignores drops on itself, drops from foreign draggables, and missing handler", async () => {
            const [name, age] = realHeaders();
            const onDragEnd = vi.fn();
            const a = await mount((e) => {
                e.header = name;
                e.onDragEnd = onDragEnd;
            });
            await dragOnto(a, a);
            expect(onDragEnd).not.toHaveBeenCalled();

            const { draggable } = await import("@atlaskit/pragmatic-drag-and-drop/element/adapter");
            const foreign = document.createElement("div");
            document.body.appendChild(foreign);
            const stop = draggable({ element: foreign, getInitialData: () => ({}) });
            await dragOnto(foreign, a);
            expect(onDragEnd).not.toHaveBeenCalled();
            stop();

            const noHandler = await mount((e) => (e.header = age));
            await dragOnto(a, noHandler); // _onDragEnd undefined on target
            expect(onDragEnd).not.toHaveBeenCalled();
        });

        it("cleans up draggable registration on disconnect", async () => {
            const [name, age] = realHeaders();
            const onDragEnd = vi.fn();
            const target = await mount((e) => {
                e.header = name;
                e.onDragEnd = onDragEnd;
            });
            const src = await mount((e) => (e.header = age));
            await dragOnto(src, target);
            expect(onDragEnd).toHaveBeenCalledTimes(1);
            src.remove();
            await dragOnto(src, target); // listeners must be gone once disconnected
            expect(onDragEnd).toHaveBeenCalledTimes(1);
        });

        it("disconnecting without any drag setup is safe", async () => {
            const el = await mount();
            expect(() => el.remove()).not.toThrow();
        });
    });

    describe("setupDragAndDrop guards", () => {
        it("does nothing without a header", async () => {
            const el = await mount();
            el.setupDragAndDrop();
            expect(warn).not.toHaveBeenCalled();
        });

        it("warns when not connected", async () => {
            const [name] = realHeaders();
            const el = document.createElement(TAG) as any;
            el._header = name;
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("not connected"));
        });

        it("warns when the element has no getBoundingClientRect", async () => {
            const [name] = realHeaders();
            const el = await mount((e) => {
                e.header = name;
                Object.defineProperty(e, "getBoundingClientRect", { value: undefined, configurable: true });
            });
            warn.mockClear();
            el.setupDragAndDrop();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("Invalid element"));
        });

        it("warns when measuring throws or returns nothing", async () => {
            const [name] = realHeaders();
            const el = await mount((e) => (e.header = name));
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

        it("retries while the element is invisible and stops once disconnected", async () => {
            const [name, age] = realHeaders();
            const onDragEnd = vi.fn();
            const el = await mount((e) => {
                e.header = name;
                e.onDragEnd = onDragEnd;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("not visible"));
            el.getBoundingClientRect = VISIBLE; // becomes visible; the 100ms retry now succeeds
            await frame(150);
            const src = await mount((e) => (e.header = age));
            await dragOnto(src, el);
            expect(onDragEnd).toHaveBeenCalledWith("age", "name");

            const gone = await mount((e) => {
                e.header = name;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            gone.remove();
            warn.mockClear();
            await frame(150);
            expect(warn).not.toHaveBeenCalled();
        });

        it("retry timer is a no-op when header was cleared", async () => {
            const [name] = realHeaders();
            const el = await mount((e) => {
                e.header = name;
                e.getBoundingClientRect = () => ({ width: 0, height: 0 }) as DOMRect;
            });
            el._header = null;
            warn.mockClear();
            await frame(150);
            expect(warn).not.toHaveBeenCalled();
        });

        it("warns when the column has no id", async () => {
            const el = await mount((e) => (e.header = fakeHeader({}, { id: "" })));
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("No column ID"));
            expect(el.isConnected).toBe(true);
        });

        it("logs an error when registering drag and drop fails", async () => {
            const [name] = realHeaders();
            const el = await mount(); // no header yet: nothing registered
            el._header = name;
            el.setAttribute = () => {
                throw new Error("boom");
            };
            el.setupDragAndDrop();
            expect(error).toHaveBeenCalledWith(expect.stringContaining("Error setting up"), expect.any(Error));
        });
    });
});

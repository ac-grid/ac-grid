import { describe, it, expect, afterEach, vi } from "vitest";
import "../src/components/DraggableHandler.wsx";

const frame = () => new Promise((r) => setTimeout(r, 20));
const settle = async () => {
    await frame();
    for (let i = 0; i < 20; i++) {
        const busy = Array.from(document.querySelectorAll("wsx-ac-draggable-handler")).some((e: any) => e._isRendering);
        if (!busy) break;
        await frame();
    }
    await frame();
};

const mount = async (setup?: (el: any) => void) => {
    const el = document.createElement("wsx-ac-draggable-handler") as any;
    setup?.(el);
    document.body.appendChild(el);
    await settle();
    return el;
};
const btn = (el: HTMLElement) => el.querySelector("button.drag-handle") as HTMLButtonElement;

function dragEvent(type: string, dataTransfer?: unknown) {
    // jsdom has no DragEvent
    const ev = new Event(type, { bubbles: true });
    Object.defineProperty(ev, "dataTransfer", { value: dataTransfer });
    return ev;
}

describe("DraggableHandler coverage", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("renders a draggable handle button", async () => {
        const el = await mount();
        expect(btn(el).getAttribute("draggable")).toBe("true");
        expect(btn(el).textContent!.trim()).not.toBe("");
    });

    it("rowId property setter updates value and ignores identical values", async () => {
        const el = await mount();
        el.rowId = "r1";
        expect(el.rowId).toBe("r1");
        el.rowId = "r1";
        expect(el.rowId).toBe("r1");
    });

    it("picks up row-id set as an attribute before connecting", async () => {
        const el = await mount((e) => e.setAttribute("row-id", "attr1"));
        expect(el.rowId).toBe("attr1");
    });

    it("attributeChangedCallback tracks row-id changes and ignores other attributes", async () => {
        // NOTE: real setAttribute() after connect is not delivered in jsdom (the registered class
        // does not observe row-id), so invoke the lifecycle callback directly.
        const el = await mount();
        el.attributeChangedCallback("row-id", null, "attr2");
        expect(el.rowId).toBe("attr2");
        el.attributeChangedCallback("row-id", "attr2", "attr2");
        expect(el.rowId).toBe("attr2");
        el.attributeChangedCallback("row-id", "attr2", null);
        expect(el.rowId).toBe("");
        el.attributeChangedCallback("other", null, "zzz");
        expect(el.rowId).toBe("");
    });

    it("onConnected falls back to an own rowId property", async () => {
        const proto = customElements.get("wsx-ac-draggable-handler")!.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, "rowId")!.set!;
        const el = await mount((e) =>
            Object.defineProperty(e, "rowId", { get: () => "own", set: (v) => setter.call(e, v), configurable: true })
        );
        expect(el._rowId).toBe("own");
    });

    it("onConnected keeps an already-set rowId over attribute and property", async () => {
        const el = document.createElement("wsx-ac-draggable-handler") as any;
        el.rowId = "keep";
        el.getAttribute = () => "other";
        document.body.appendChild(el);
        await settle();
        expect(el.rowId).toBe("keep");
    });

    it("dragstart sets dataTransfer and notifies onDragStart; dragend notifies onDragEnd", async () => {
        const onDragStart = vi.fn();
        const onDragEnd = vi.fn();
        const el = await mount((e) => {
            e.rowId = "row-7";
            e.onDragStart = onDragStart;
            e.onDragEnd = onDragEnd;
        });
        const dt = { effectAllowed: "", setData: vi.fn() };
        btn(el).dispatchEvent(dragEvent("dragstart", dt));
        expect(dt.effectAllowed).toBe("move");
        expect(dt.setData).toHaveBeenCalledWith("text/plain", "row-7");
        expect(onDragStart).toHaveBeenCalledWith("row-7");
        btn(el).dispatchEvent(dragEvent("dragend"));
        expect(onDragEnd).toHaveBeenCalledWith("row-7");
    });

    it("drag events work without dataTransfer or callbacks", async () => {
        const el = await mount((e) => (e.rowId = "r"));
        expect(() => {
            btn(el).dispatchEvent(dragEvent("dragstart", null));
            btn(el).dispatchEvent(dragEvent("dragend"));
        }).not.toThrow();
    });
});

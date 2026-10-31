import { describe, it, expect, afterEach, vi } from "vitest";
import "../src/components/CellEditor.wsx";

const frame = () => new Promise((r) => setTimeout(r, 20));
const settle = async () => {
    await frame();
    for (let i = 0; i < 20; i++) {
        const busy = Array.from(document.querySelectorAll("wsx-ac-cell-editor")).some((e: any) => e._isRendering);
        if (!busy) break;
        await frame();
    }
    await frame();
};

async function mount(props: Record<string, unknown> = {}) {
    const el = document.createElement("wsx-ac-cell-editor") as any;
    Object.assign(el, props);
    document.body.appendChild(el);
    await settle();
    return el;
}
const input = (el: HTMLElement) => el.querySelector("input") as HTMLInputElement;

describe("CellEditor coverage", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("exposes props through getters/setters", async () => {
        const el = await mount();
        const fns = { c: vi.fn(), s: vi.fn(), x: vi.fn() };
        el.type = "number";
        el.error = "bad";
        el.onChange = fns.c;
        el.onSave = fns.s;
        el.onCancel = fns.x;
        expect([el.type, el.error, el.onChange, el.onSave, el.onCancel]).toEqual(["number", "bad", fns.c, fns.s, fns.x]);
    });

    it("renders the value into the input and re-renders on value change", async () => {
        const el = await mount({ value: "hello" });
        expect(input(el).value).toBe("hello");
        el.value = "hello"; // unchanged: no-op
        input(el).blur(); // wsx defers re-render while an input has focus
        el.value = 42;
        await settle();
        expect(input(el).value).toBe("42");
        el.value = null;
        await settle();
        expect(input(el).value).toBe("");
    });

    it("renders type, error class, aria-invalid and alert text", async () => {
        const el = await mount({ type: "number", error: "Must be positive" });
        expect(input(el).type).toBe("number");
        expect(input(el).className).toContain("cell-editor-input--error");
        expect(input(el).getAttribute("aria-invalid")).toBe("true");
        expect(el.querySelector('[role="alert"]')!.textContent).toBe("Must be positive");
    });

    it("renders no error markup without an error", async () => {
        const el = await mount({ value: "x" });
        expect(input(el).className).not.toContain("--error");
        expect(input(el).hasAttribute("aria-invalid")).toBe(false);
        expect(el.querySelector('[role="alert"]')).toBeNull();
    });

    it("input event updates value and calls onChange; Enter saves; Escape cancels", async () => {
        const onChange = vi.fn(), onSave = vi.fn(), onCancel = vi.fn();
        const el = await mount({ value: "a", onChange, onSave, onCancel });
        input(el).value = "typed";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(onChange).toHaveBeenCalledWith("typed");

        const enter = new KeyboardEvent("keydown", { key: "Enter", cancelable: true, bubbles: true });
        input(el).dispatchEvent(enter);
        expect(onSave).toHaveBeenCalledWith("typed");
        expect(enter.defaultPrevented).toBe(true);

        const esc = new KeyboardEvent("keydown", { key: "Escape", cancelable: true, bubbles: true });
        input(el).dispatchEvent(esc);
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(esc.defaultPrevented).toBe(true);

        const other = new KeyboardEvent("keydown", { key: "a", cancelable: true, bubbles: true });
        input(el).dispatchEvent(other);
        expect(other.defaultPrevented).toBe(false);
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("blur saves the current value", async () => {
        const onSave = vi.fn();
        const el = await mount({ value: "keep", onSave });
        input(el).dispatchEvent(new Event("blur"));
        expect(onSave).toHaveBeenCalledWith("keep");
    });

    it("handlers are safe without callbacks", async () => {
        const el = await mount({ value: "z" });
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        input(el).dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        input(el).dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        input(el).dispatchEvent(new Event("blur"));
        expect(input(el).value).toBe("z");
    });

    it("focuses the input after connecting", async () => {
        const el = await mount({ value: "f" });
        expect(document.activeElement).toBe(input(el));
    });

    it("tolerates a missing input when focusing", async () => {
        const el = document.createElement("wsx-ac-cell-editor") as any;
        el.querySelector = () => null;
        document.body.appendChild(el);
        await settle();
        expect(el.isConnected).toBe(true);
    });

    it("onConnected skips falsy own props", async () => {
        const el = document.createElement("wsx-ac-cell-editor") as any;
        for (const k of ["value", "type", "error", "onChange", "onSave", "onCancel"]) {
            Object.defineProperty(el, k, { value: k === "value" ? undefined : "", configurable: true });
        }
        document.body.appendChild(el);
        await settle();
        expect(input(el).type).toBe("text");
    });
});

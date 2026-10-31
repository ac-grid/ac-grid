import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "../src/components/Dropdown.wsx";

// wsx renders over several animation frames; wait for every in-flight render to finish.
const frame = () => new Promise((r) => setTimeout(r, 20));
const tick = async () => {
    await frame();
    for (let i = 0; i < 20; i++) {
        const busy = Array.from(document.querySelectorAll("wsx-ac-dropdown")).some((e: any) => e._isRendering);
        if (!busy) break;
        await frame();
    }
    await frame();
};

// The installed @wsxjs/wsx-core LightComponent has no requestUpdate(); the Dropdown value
// setter calls it. Provide it on the instance so the setter's own logic can run.
function stubRequestUpdate(el: any) {
    el.requestUpdate = vi.fn(() => el.rerender());
    return el.requestUpdate as ReturnType<typeof vi.fn>;
}

async function mount(props: Record<string, unknown> = {}) {
    const el = document.createElement("wsx-ac-dropdown") as any;
    stubRequestUpdate(el);
    Object.assign(el, props);
    document.body.appendChild(el);
    await tick();
    return el;
}
const trigger = (el: HTMLElement) => el.querySelector(".ac-dropdown__trigger") as HTMLButtonElement;
const items = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>(".ac-dropdown__item"));
const key = (k: string) => {
    const ev = new KeyboardEvent("keydown", { key: k, cancelable: true, bubbles: true });
    document.dispatchEvent(ev);
    return ev;
};

describe("Dropdown coverage", () => {
    beforeEach(() => {
        // jsdom has no scrollIntoView
        (HTMLElement.prototype as any).scrollIntoView = vi.fn();
    });
    afterEach(() => {
        document.body.innerHTML = "";
        delete (HTMLElement.prototype as any).scrollIntoView;
    });

    it("normalizes props through setters and getters", async () => {
        const el = await mount();
        el.options = "nope" as any;
        expect(el.options).toEqual([]);
        el.options = ["a", "b"];
        expect(el.options).toEqual(["a", "b"]);
        el.value = null as any;
        expect(el.value).toBe("");
        el.value = 5 as any;
        expect(el.value).toBe("5");
        el.value = 5 as any; // unchanged: no-op
        expect(el.value).toBe("5");
        el.placeholder = undefined as any;
        expect(el.placeholder).toBe("");
        el.className = undefined as any;
        expect(el.className).toBe("");
        el.disabled = 1 as any;
        expect(el.disabled).toBe(true);
        const fn = vi.fn();
        el.onChange = fn;
        expect(el.onChange).toBe(fn);
    });

    it("renders placeholder, default text and selected label", async () => {
        const el = await mount({ options: ["a", { value: "b", label: "Bee" }], className: "extra" });
        expect(el.querySelector(".ac-dropdown__value")!.textContent!.trim()).toBe("Select...");
        expect(el.querySelector(".ac-dropdown__value--placeholder")).toBeTruthy();
        expect(el.querySelector(".ac-dropdown")!.classList.contains("extra")).toBe(true);
        el.placeholder = "Pick";
        el.value = "b";
        await tick();
        expect(el.querySelector(".ac-dropdown__value")!.textContent!.trim()).toBe("Bee");
        expect(el.querySelector(".ac-dropdown__value--placeholder")).toBeNull();
    });

    it("uses custom placeholder when nothing selected", async () => {
        const el = await mount({ options: ["a"], placeholder: "Pick" });
        expect(el.querySelector(".ac-dropdown__value")!.textContent!.trim()).toBe("Pick");
    });

    it("opens, highlights selected, selects on click and calls onChange", async () => {
        const onChange = vi.fn();
        const el = await mount({ options: ["a", "b", "c"], value: "b", onChange });
        trigger(el).click();
        await tick();
        expect(trigger(el).hasAttribute("aria-expanded")).toBe(true);
        expect(items(el).length).toBe(3);
        expect(items(el)[1].className).toContain("ac-dropdown__item--selected");
        expect(items(el)[1].className).toContain("ac-dropdown__item--highlighted");
        items(el)[2].dispatchEvent(new MouseEvent("mouseenter"));
        await tick();
        expect(items(el)[2].className).toContain("ac-dropdown__item--highlighted");
        items(el)[2].click();
        await tick();
        expect(onChange).toHaveBeenCalledWith("c");
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
    });

    it("selecting without onChange does not throw; unmatched value highlights first", async () => {
        const el = await mount({ options: ["a", "b"], value: "zzz" });
        trigger(el).click();
        await tick();
        expect(items(el)[0].className).toContain("ac-dropdown__item--highlighted");
        expect(() => items(el)[1].click()).not.toThrow();
        await tick();
        expect(el.value).toBe("zzz".length ? "b" : "");
    });

    it("toggles closed on second trigger click; disabled ignores click", async () => {
        const el = await mount({ options: ["a"] });
        trigger(el).click();
        await tick();
        trigger(el).click();
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
        const d = await mount({ options: ["a"], disabled: true });
        expect(d.querySelector(".ac-dropdown--disabled")).toBeTruthy();
        // bypass the native disabled guard by dispatching directly
        trigger(d).dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await tick();
        expect(d.querySelector(".ac-dropdown__list")).toBeNull();
    });

    it("ignores disabled option clicks", async () => {
        const onChange = vi.fn();
        const el = await mount({ options: [{ value: "a", label: "A", disabled: true }, "b"], onChange });
        trigger(el).click();
        await tick();
        items(el)[0].click();
        await tick();
        expect(onChange).not.toHaveBeenCalled();
        expect(items(el)[0].className).toContain("ac-dropdown__item--disabled");
    });

    it("closes on outside click but not on trigger/list click", async () => {
        const el = await mount({ options: ["a", "b"] });
        document.body.click(); // closed: early return
        trigger(el).click();
        await tick();
        el.querySelector(".ac-dropdown__list")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeTruthy();
        trigger(el).querySelector("span")!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
        trigger(el).click();
        await tick();
        document.body.click();
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
    });

    it("keyboard: arrows wrap and skip disabled, Enter selects, Escape/Tab close", async () => {
        const onChange = vi.fn();
        const el = await mount({
            options: ["a", { value: "b", label: "B", disabled: true }, "c"],
            value: "a",
            onChange,
        });
        key("ArrowDown"); // closed: ignored
        trigger(el).click();
        await tick();
        expect(key("ArrowDown").defaultPrevented).toBe(true); // a -> skips b -> c
        await tick();
        expect(items(el)[2].className).toContain("ac-dropdown__item--highlighted");
        key("ArrowDown"); // wraps to a
        await tick();
        expect(items(el)[0].className).toContain("ac-dropdown__item--highlighted");
        key("ArrowUp"); // wraps to c
        await tick();
        expect(items(el)[2].className).toContain("ac-dropdown__item--highlighted");
        key("ArrowUp"); // skips b -> a
        await tick();
        expect(items(el)[0].className).toContain("ac-dropdown__item--highlighted");
        key("Enter");
        await tick();
        expect(onChange).toHaveBeenCalledWith("a");
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();

        trigger(el).click();
        await tick();
        key("Escape");
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
        trigger(el).click();
        await tick();
        key("Tab");
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeNull();
        trigger(el).click();
        await tick();
        key("x"); // unknown key: no-op
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeTruthy();
    });

    it("Enter on a disabled highlighted item and with no highlight does nothing", async () => {
        const onChange = vi.fn();
        const el = await mount({
            options: [{ value: "a", label: "A", disabled: true }, "b"],
            onChange,
        });
        trigger(el).click();
        await tick();
        // highlight index 0 (disabled, from unmatched value)
        key("Enter");
        expect(onChange).not.toHaveBeenCalled();
        items(el)[1].dispatchEvent(new MouseEvent("mouseenter"));
        await tick();
        items(el)[1].dispatchEvent(new MouseEvent("mouseenter"));
        (el as any).highlightedIndex = -1;
        key("Enter");
        expect(onChange).not.toHaveBeenCalled();
    });

    it("keyboard ignored when no enabled options", async () => {
        const el = await mount({ options: [{ value: "a", label: "A", disabled: true }] });
        trigger(el).click();
        await tick();
        key("Escape");
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeTruthy();
    });

    it("moveHighlight with empty options is a no-op, scroll tolerates missing list/item", async () => {
        const el = await mount({ options: [] });
        el.moveHighlight(1, []);
        el.listRef = null;
        el.scrollToHighlighted();
        trigger(el).click();
        await tick();
        el.highlightedIndex = 99;
        el.scrollToHighlighted(); // no matching item
        expect((HTMLElement.prototype as any).scrollIntoView).not.toHaveBeenCalled();
    });

    it("scrolls highlighted item into view on arrow navigation", async () => {
        const el = await mount({ options: ["a", "b"] });
        trigger(el).click();
        await tick();
        key("ArrowDown");
        expect((HTMLElement.prototype as any).scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    });

    it("onConnected copies pre-upgrade own properties", async () => {
        const el = document.createElement("wsx-ac-dropdown") as any;
        stubRequestUpdate(el);
        el.options = ["x"];
        el.value = "x";
        el.onChange = vi.fn();
        el.placeholder = "p";
        el.disabled = false;
        el.className = "c";
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector(".ac-dropdown__value")!.textContent!.trim()).toBe("x");
    });

    it("removes document listeners on disconnect", async () => {
        const el = await mount({ options: ["a"] });
        trigger(el).click();
        await tick();
        el.remove();
        await tick();
        expect(() => { key("Escape"); document.body.click(); }).not.toThrow();
    });

    it("keeps the list open when a click inside the trigger reaches the document", async () => {
        const el = await mount({ options: ["a", "b"] });
        trigger(el).click();
        await tick();
        el.disabled = true; // trigger handler now bails out early
        const ev = new MouseEvent("click", { bubbles: true });
        ev.stopPropagation = () => {};
        trigger(el).querySelector("span")!.dispatchEvent(ev);
        await tick();
        expect(el.querySelector(".ac-dropdown__list")).toBeTruthy();
    });

    it("wraps while skipping disabled items in both directions", async () => {
        const down = await mount({ options: ["a", { value: "b", label: "B", disabled: true }], value: "a" });
        trigger(down).click();
        await tick();
        key("ArrowDown"); // b disabled -> wraps past the end back to a
        await tick();
        expect(items(down)[0].className).toContain("ac-dropdown__item--highlighted");
        down.remove();

        const up = await mount({ options: [{ value: "a", label: "A", disabled: true }, "b"], value: "b" });
        trigger(up).click();
        await tick();
        key("ArrowUp"); // a disabled -> wraps past the start back to b
        await tick();
        expect(items(up)[1].className).toContain("ac-dropdown__item--highlighted");
    });

    it("onConnected leaves defaults alone when the instance exposes no prop values", async () => {
        const el = document.createElement("wsx-ac-dropdown") as any;
        for (const k of ["options", "value", "placeholder", "disabled", "className"]) {
            Object.defineProperty(el, k, { value: undefined, configurable: true });
        }
        el._options = ["a"];
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector(".ac-dropdown__value")!.textContent!.trim()).toBe("Select...");
        expect(el.querySelector(".ac-dropdown")!.className).toBe("ac-dropdown");
    });
});

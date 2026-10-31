import { waitFor } from "@testing-library/dom";
import { describe, it, expect, afterEach } from "vitest";
import "../src/components/SortingIndicator.wsx";
import "../src/components/FilterIcon.wsx";
import "../src/components/SelectionCheckbox.wsx";

const tick = () => new Promise((r) => setTimeout(r, 60));
// Own accessor that forwards to the prototype setter, mimicking a property set before the element upgraded.
const preset = (el: any, props: Record<string, any>) => {
    const proto = Object.getPrototypeOf(el);
    for (const [k, v] of Object.entries(props)) {
        const set = Object.getOwnPropertyDescriptor(proto, k)!.set!;
        Object.defineProperty(el, k, { configurable: true, get: () => v, set: (x) => set.call(el, x) });
    }
};
const mount = async (tag: string, props: Record<string, any> = {}) => {
    const el = document.createElement(tag) as any;
    Object.assign(el, props);
    document.body.appendChild(el);
    await tick();
    return el;
};
afterEach(() => { document.body.innerHTML = ""; });

describe("SortingIndicator", () => {
    it("unsorted shows hint", async () => {
        const el = await mount("wsx-ac-sorting-indicator");
        const s = el.querySelector(".sort-indicator");
        expect(s.getAttribute("title")).toBe("Click to sort");
        expect(s.classList.contains("active")).toBe(false);
        expect(el.direction).toBe(false);
        expect(el.index).toBeUndefined();
    });
    it("asc with index", async () => {
        const el = await mount("wsx-ac-sorting-indicator", { direction: "asc", index: 1 });
        const s = el.querySelector(".sort-indicator.active");
        expect(s.getAttribute("aria-label")).toBe("Sorted ascending (priority 2)");
        expect(s.getAttribute("title")).toContain("Click to sort descending");
        expect(s.querySelector(".sort-index").textContent).toBe("2");
        expect(el.index).toBe(1);
    });
    it("desc without index", async () => {
        const el = await mount("wsx-ac-sorting-indicator", { direction: "desc" });
        const s = el.querySelector(".sort-indicator.active");
        expect(s.getAttribute("aria-label")).toBe("Sorted descending");
        expect(s.getAttribute("title")).toContain("Click to clear sort");
        expect(s.querySelector(".sort-index")).toBeNull();
    });
    it("setters update and ignore same/falsy", async () => {
        const el = await mount("wsx-ac-sorting-indicator", { direction: "asc" });
        el.direction = "asc";
        el.direction = "desc";
        el.index = 0; el.index = 0; el.index = undefined;
        expect(el.direction).toBe("desc");
        expect(el.index).toBeUndefined();
        const custom = { t: (_k: string, _p: any, d: string) => "X" + d };
        el.i18n = custom;
        el.i18n = null;
        expect(el.i18n).toBe(custom);
        el.rerender();
        await waitFor(() =>
            expect(el.querySelector(".sort-indicator").getAttribute("title")).toContain("XClick to clear sort"),
        );
    });
    it("connectedCallback picks up own-property values", async () => {
        const el = document.createElement("wsx-ac-sorting-indicator") as any;
        const custom = { t: (_k: string, _p: any, d: string) => "Y" + d };
        preset(el, { direction: "asc", index: 2, i18n: custom });
        document.body.appendChild(el);
        await tick();
        el.rerender();
        await waitFor(() =>
            expect(el.querySelector(".sort-indicator").getAttribute("aria-label")).toBe("Sorted Yascending (priority 3)"),
        );
    });
});

describe("SortingIndicator fallbacks", () => {
    it("connect with undefined host properties keeps defaults", async () => {
        const el = document.createElement("wsx-ac-sorting-indicator") as any;
        preset(el, { direction: undefined, index: undefined, i18n: undefined });
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector(".sort-indicator").getAttribute("title")).toBe("Click to sort");
    });
    it("falls back to the default i18n when none is set", async () => {
        const el = await mount("wsx-ac-sorting-indicator");
        el._i18n = undefined;
        el.rerender();
        await waitFor(() => expect(el.querySelector(".sort-indicator").getAttribute("title")).toBe("Click to sort"));
        el.direction = "asc";
        el.rerender();
        await waitFor(() => expect(el.querySelector(".sort-indicator.active")).not.toBeNull());
    });
});

describe("FilterIcon", () => {
    it("renders inactive by default", async () => {
        const el = await mount("wsx-ac-filter-icon");
        const s = el.querySelector(".filter-icon");
        expect(s).not.toBeNull();
        expect(s.classList.contains("active")).toBe(false);
        expect(el.active).toBe(false);
        expect(el.visible).toBe(true);
    });
    it("active toggles class", async () => {
        const el = await mount("wsx-ac-filter-icon");
        el.active = true;
        el.rerender();
        expect(el.active).toBe(true);
        await waitFor(() => expect(el.querySelector(".filter-icon.active")).not.toBeNull());
    });
    it("not visible renders nothing", async () => {
        const el = await mount("wsx-ac-filter-icon");
        el.visible = false;
        expect(el.visible).toBe(false);
        expect(el.render()).toBeNull();
    });
});

describe("FilterIcon / SelectionCheckbox with undefined host properties", () => {
    it("FilterIcon keeps defaults", async () => {
        const el = document.createElement("wsx-ac-filter-icon") as any;
        preset(el, { active: undefined, visible: undefined });
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector(".filter-icon")).not.toBeNull();
        expect(el.querySelector(".filter-icon.active")).toBeNull();
    });
    it("SelectionCheckbox keeps defaults", async () => {
        const el = document.createElement("wsx-ac-selection-checkbox") as any;
        preset(el, { checked: undefined, indeterminate: undefined });
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector("input").checked).toBe(false);
        expect(el.querySelector("input").indeterminate).toBe(false);
    });
});

describe("SelectionCheckbox", () => {
    it("reflects props", async () => {
        const el = await mount("wsx-ac-selection-checkbox", { checked: true, indeterminate: true, title: "T" });
        const i = el.querySelector("input");
        expect(i.title).toBe("T");
        expect(i.checked).toBe(true);
        expect(el.checked).toBe(true);
        expect(el.indeterminate).toBe(true);
        expect(el.title).toBe("T");
    });
    it("change calls onChange, updates state, stops propagation", async () => {
        const calls: boolean[] = [];
        const el = await mount("wsx-ac-selection-checkbox", { onChange: (v: boolean) => calls.push(v) });
        expect(el.onChange).toBeTypeOf("function");
        let bubbled = false;
        document.body.addEventListener("change", () => (bubbled = true));
        const i = el.querySelector("input");
        i.checked = true;
        i.dispatchEvent(new Event("change", { bubbles: true }));
        expect(calls).toEqual([true]);
        expect(el.checked).toBe(true);
        expect(bubbled).toBe(false);
    });
    it("change without onChange is safe; wrapper click stops propagation", async () => {
        const el = await mount("wsx-ac-selection-checkbox");
        const i = el.querySelector("input");
        i.checked = true;
        i.dispatchEvent(new Event("change", { bubbles: true }));
        expect(el.checked).toBe(true);
        let seen = false;
        document.body.addEventListener("click", () => (seen = true));
        el.querySelector(".selection-checkbox-wrapper").click();
        expect(seen).toBe(false);
    });
    it("own-property values at connect", async () => {
        const el = document.createElement("wsx-ac-selection-checkbox") as any;
        const fn = () => {};
        preset(el, { checked: true, indeterminate: true, onChange: fn, title: "Own" });
        document.body.appendChild(el);
        await tick();
        el.rerender();
        await waitFor(() => expect(el.querySelector("input").title).toBe("Own"));
        expect(el.querySelector("input").checked).toBe(true);
    });
});

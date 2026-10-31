import { describe, it, expect, afterEach } from "vitest";
import { waitFor } from "@testing-library/dom";
import "../src/components/FilterInput.wsx";
import "../src/components/FilterMenu.wsx";

const tick = () => new Promise((r) => setTimeout(r, 60));
const mount = async (tag: string, props: Record<string, any> = {}) => {
    const el = document.createElement(tag) as any;
    Object.assign(el, props);
    document.body.appendChild(el);
    await tick();
    return el;
};
const preset = (el: any, props: Record<string, any>) => {
    const proto = Object.getPrototypeOf(el);
    for (const [k, v] of Object.entries(props)) {
        const set = Object.getOwnPropertyDescriptor(proto, k)!.set!;
        Object.defineProperty(el, k, { configurable: true, get: () => v, set: (x) => set.call(el, x) });
    }
};
afterEach(() => {
    document.body.innerHTML = "";
});
const numCol = { columnDef: { filterType: "number" } } as any;
const txtCol = { columnDef: {} } as any;

// LightComponent in the installed @wsxjs/wsx-core has no requestUpdate(); stub it with rerender() on the instance.
const stubRequestUpdate = (el: any) => {
    el.requestUpdate = () => el.rerender();
    return el;
};
// FilterMenu keeps its callback in a @state slot, and the state setter treats a function value as an updater
// (it calls it with the previous value and stores the result). This callback records real conditions only
// and returns itself, so it survives being stored.
const makeCb = (got: any[]) => {
    const cb: any = (c: any) => {
        if (c && c.operator) got.push(c);
        return cb;
    };
    return cb;
};
const dropdownOf = (el: HTMLElement) => el.querySelector("wsx-ac-dropdown") as any;

describe("FilterInput", () => {
    const input = (el: HTMLElement) => el.querySelector<HTMLInputElement>("input.filter-input")!;

    it("text column: contains by default, blank placeholder, all text operators", async () => {
        const el = await mount("wsx-ac-filter-input", { column: txtCol });
        expect(input(el).type).toBe("text");
        expect(input(el).placeholder).toBe("Filter...");
        expect(input(el).disabled).toBe(false);
        expect(dropdownOf(el).options.map((o: any) => o.value)).toEqual([
            "contains", "notContains", "equals", "notEqual", "startsWith", "endsWith", "blank", "notBlank",
        ]);
        expect(dropdownOf(el).getAttribute("value")).toBe("contains");
        expect(dropdownOf(el).getAttribute("placeholder")).toBe("Select operator");
        expect(el.column).toBe(txtCol);
        expect(el.variant).toBe("default");
        expect(el.onChange).toBeUndefined();
        expect(el.i18n).toBeDefined();
    });

    it("renders as text when there is no column", async () => {
        const el = await mount("wsx-ac-filter-input");
        expect(input(el).type).toBe("text");
    });

    it("number column renders a number input with number operators", async () => {
        const el = await mount("wsx-ac-filter-input", { column: numCol });
        expect(input(el).type).toBe("number");
        expect(input(el).placeholder).toBe("Filter number...");
        expect(dropdownOf(el).options.map((o: any) => o.value)).toEqual(["equals", "greaterThan", "lessThan"]);
    });

    it("typing emits onChange and a bubbling filter-input-change event", async () => {
        const got: any[] = [];
        const events: any[] = [];
        const el = await mount("wsx-ac-filter-input", { column: txtCol, onChange: (c: any) => got.push(c) });
        document.body.addEventListener("filter-input-change", (e: any) => events.push(e.detail));
        input(el).value = "abc";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(got).toEqual([{ value: "abc", operator: "contains" }]);
        expect(events).toEqual([{ value: "abc", operator: "contains" }]);
    });

    it("typing without an onChange callback still dispatches the event", async () => {
        const events: any[] = [];
        const el = await mount("wsx-ac-filter-input", { column: txtCol });
        el.addEventListener("filter-input-change", (e: any) => events.push(e.detail));
        input(el).value = "q";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(events).toEqual([{ value: "q", operator: "contains" }]);
    });

    it("dropdown operator change updates the operator and emits", async () => {
        const got: any[] = [];
        const el = await mount("wsx-ac-filter-input", { column: txtCol, onChange: (c: any) => got.push(c) });
        el.handleDropdownChange("blank");
        expect(got).toEqual([{ value: "", operator: "blank" }]);
        el.rerender();
        await waitFor(() => expect(input(el).disabled).toBe(true));
        await tick();
        el.handleDropdownChange("notBlank");
        el.rerender();
        await waitFor(() => expect(dropdownOf(el).getAttribute("value")).toBe("notBlank"));
        expect(input(el).disabled).toBe(true);
        await tick();
        el.handleDropdownChange("equals");
        el.rerender();
        await waitFor(() => expect(input(el).disabled).toBe(false));
    });

    it("native operator select handler (not wired into render) updates the operator and emits", async () => {
        const got: any[] = [];
        const el = await mount("wsx-ac-filter-input", { column: txtCol, onChange: (c: any) => got.push(c) });
        el.handleOperatorChange({ target: { value: "endsWith" } });
        expect(got).toEqual([{ value: "", operator: "endsWith" }]);
    });

    it("number column dropdown change emits the new operator", async () => {
        const got: any[] = [];
        const el = await mount("wsx-ac-filter-input", { column: numCol, onChange: (c: any) => got.push(c) });
        el.handleDropdownChange("greaterThan");
        expect(got).toEqual([{ value: "", operator: "greaterThan" }]);
    });

    it("floating variant renders only the input", async () => {
        const el = await mount("wsx-ac-filter-input", { column: txtCol, variant: "floating" });
        el.rerender();
        await waitFor(() => expect(el.querySelector(".filter-input-container.floating")).not.toBeNull());
        expect(dropdownOf(el)).toBeNull();
        expect(input(el).classList.contains("floating")).toBe(true);
        expect(input(el).disabled).toBe(false);
        expect(el.variant).toBe("floating");
    });

    it("floating variant disables the input for blank operators", async () => {
        const el = await mount("wsx-ac-filter-input", {
            column: txtCol,
            variant: "floating",
            _value: { value: "", operator: "notBlank" },
        });
        el.rerender();
        await waitFor(() => expect(el.querySelector(".floating")).not.toBeNull());
        el._operator;
        const el2 = document.createElement("wsx-ac-filter-input") as any;
        stubRequestUpdate(el2);
        el2.column = txtCol;
        el2.variant = "floating";
        el2.value = { value: "", operator: "blank" };
        document.body.appendChild(el2);
        await tick();
        expect(el2.querySelector("input.filter-input.floating").disabled).toBe(true);
        el2.value = { value: "", operator: "notBlank" };
        await waitFor(() => expect(el2.querySelector("input.filter-input.floating").disabled).toBe(true));
    });

    it("string value is shown; number columns default to equals", async () => {
        const t = stubRequestUpdate(document.createElement("wsx-ac-filter-input")) as any;
        t.column = txtCol;
        t.value = "hello";
        document.body.appendChild(t);
        await tick();
        expect(input(t).value).toBe("hello");
        expect(dropdownOf(t).getAttribute("value")).toBe("contains");

        const n = stubRequestUpdate(document.createElement("wsx-ac-filter-input")) as any;
        n.column = numCol;
        n.value = "5";
        document.body.appendChild(n);
        await tick();
        expect(input(n).value).toBe("5");
        expect(dropdownOf(n).getAttribute("value")).toBe("equals");
    });

    it("condition object value sets text and operator; missing fields default", async () => {
        const a = stubRequestUpdate(document.createElement("wsx-ac-filter-input")) as any;
        a.column = txtCol;
        a.value = { value: "x", operator: "startsWith" };
        document.body.appendChild(a);
        await tick();
        expect(input(a).value).toBe("x");
        expect(dropdownOf(a).getAttribute("value")).toBe("startsWith");
        expect(a.value).toEqual({ value: "x", operator: "startsWith" });

        const b = stubRequestUpdate(document.createElement("wsx-ac-filter-input")) as any;
        b.column = txtCol;
        b.value = {};
        document.body.appendChild(b);
        await tick();
        expect(input(b).value).toBe("");
        expect(dropdownOf(b).getAttribute("value")).toBe("contains");
    });

    it("value setter ignores an identical value and refreshes the view on change", async () => {
        const el = stubRequestUpdate(await mount("wsx-ac-filter-input", { column: txtCol })) as any;
        el.value = "";
        expect(input(el).value).toBe("");
        el.value = "later";
        await waitFor(() => expect(input(el).value).toBe("later"));
    });

    it("empty string value clears the input", async () => {
        const el = stubRequestUpdate(await mount("wsx-ac-filter-input", { column: txtCol })) as any;
        el.value = "a";
        el.value = "";
        await waitFor(() => expect(input(el).value).toBe(""));
    });

    it("picks up properties set before connection", async () => {
        const got: any[] = [];
        const custom = { t: (_k: string, _p: any, d: string) => `~${d}` };
        const el = document.createElement("wsx-ac-filter-input") as any;
        preset(el, { column: txtCol, onChange: (c: any) => got.push(c), variant: "floating", i18n: custom });
        Object.defineProperty(el, "value", { configurable: true, get: () => "pre", set: () => {} });
        document.body.appendChild(el);
        await tick();
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("~Filter..."));
        expect(input(el).value).toBe("pre");
        expect(el.querySelector(".floating")).not.toBeNull();
        input(el).value = "z";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(got).toEqual([{ value: "z", operator: "contains" }]);
    });

    it("ignores falsy i18n and undefined host properties at connect", async () => {
        const el = document.createElement("wsx-ac-filter-input") as any;
        const dflt = el.i18n;
        el.i18n = null;
        expect(el.i18n).toBe(dflt);
        const el2 = document.createElement("wsx-ac-filter-input") as any;
        Object.defineProperty(el2, "i18n", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el2, "value", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el2, "variant", { configurable: true, get: () => undefined, set: () => {} });
        document.body.appendChild(el2);
        await tick();
        expect(el2.querySelector("input.filter-input").placeholder).toBe("Filter...");
    });

    it("falls back to the default i18n when none is set", async () => {
        const el = await mount("wsx-ac-filter-input", { column: txtCol });
        el.i18n = { t: (_k: string, _p: any, d: string) => `~${d}` };
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("~Filter..."));
        await tick();
        el._i18n = undefined;
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("Filter..."));
    });
});

describe("FilterMenu", () => {
    const innerInput = (el: HTMLElement) => el.querySelector("wsx-ac-filter-input") as any;

    it("renders a filter input bound to column, value and i18n", async () => {
        const el = await mount("wsx-ac-filter-menu", { column: txtCol });
        expect(el.querySelector(".filter-menu")).not.toBeNull();
        expect(innerInput(el).column).toBe(txtCol);
        expect(el.column).toBe(txtCol);
        expect(el.value).toBe("");
        expect(el.filterChange).toBeNull();
        expect(el.onClose).toBeUndefined();
        expect(el.i18n).toBeDefined();
    });

    it("forwards a condition to filterChange and dispatches filter-change", async () => {
        const got: any[] = [];
        const events: any[] = [];
        const el = await mount("wsx-ac-filter-menu", { column: txtCol, filterChange: makeCb(got) });
        el.addEventListener("filter-change", (e: any) => events.push(e.detail));
        const cond = { value: "a", operator: "equals" };
        el._handleFilterChange(cond);
        expect(got).toEqual([cond]);
        expect(events).toEqual([cond]);
    });

    it("dispatches filter-change even without a callback", async () => {
        const events: any[] = [];
        const el = await mount("wsx-ac-filter-menu", { column: txtCol });
        el.addEventListener("filter-change", (e: any) => events.push(e.detail));
        el._handleFilterChange({ value: "b", operator: "contains" });
        expect(events).toEqual([{ value: "b", operator: "contains" }]);
    });

    it("ignores null conditions", async () => {
        const got: any[] = [];
        const events: any[] = [];
        const el = await mount("wsx-ac-filter-menu", { column: txtCol, filterChange: makeCb(got) });
        el.addEventListener("filter-change", (e: any) => events.push(e));
        el._handleFilterChange(null);
        el._handleFilterChange(undefined);
        expect(got).toEqual([]);
        expect(events).toEqual([]);
    });

    it("value setter re-renders the inner input and ignores identical values", async () => {
        const el = stubRequestUpdate(await mount("wsx-ac-filter-menu", { column: txtCol })) as any;
        el.value = "";
        el.value = "v";
        await waitFor(() => expect(innerInput(el).getAttribute("value")).toBe("v"));
        expect(el.value).toBe("v");
    });

    it("custom i18n is passed through; falsy ignored", async () => {
        const custom = { t: (_k: string, _p: any, d: string) => `~${d}` };
        const el = await mount("wsx-ac-filter-menu", { column: txtCol });
        el.i18n = custom;
        el.i18n = null;
        expect(el.i18n).toBe(custom);
        el.rerender();
        await waitFor(() => expect(innerInput(el).i18n).toBe(custom));
    });

    it("onClose is stored", async () => {
        const fn = () => {};
        const el = await mount("wsx-ac-filter-menu", { onClose: fn });
        expect(el.onClose).toBe(fn);
    });

    it("picks up private slots set before connection (_value, _filterChangeCallback, _onClose)", async () => {
        const got: any[] = [];
        const close = () => {};
        const el = document.createElement("wsx-ac-filter-menu") as any;
        preset(el, { column: txtCol, i18n: { t: (_k: string, _p: any, d: string) => d } });
        el._value = "preset";
        el._filterChangeCallback = makeCb(got);
        el._onClose = close;
        document.body.appendChild(el);
        await tick();
        expect(el.value).toBe("preset");
        expect(el.onClose).toBe(close);
        el._handleFilterChange({ value: "k", operator: "contains" });
        expect(got).toEqual([{ value: "k", operator: "contains" }]);
    });

    it("falls back to public properties when private slots are unset", async () => {
        const got: any[] = [];
        const close = () => {};
        const el = document.createElement("wsx-ac-filter-menu") as any;
        stubRequestUpdate(el);
        Object.defineProperty(el, "_value", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el, "_filterChangeCallback", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el, "_onClose", { configurable: true, get: () => undefined, set: () => {} });
        preset(el, { value: "pub", filterChange: makeCb(got), onClose: close });
        document.body.appendChild(el);
        await tick();
        expect(el.value).toBe("pub");
        expect(el.onClose).toBe(close);
    });

    it("connect with nothing preset keeps defaults", async () => {
        const el = document.createElement("wsx-ac-filter-menu") as any;
        Object.defineProperty(el, "_value", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el, "value", { configurable: true, get: () => undefined, set: () => {} });
        Object.defineProperty(el, "i18n", { configurable: true, get: () => undefined, set: () => {} });
        document.body.appendChild(el);
        await tick();
        expect(el.querySelector(".filter-menu")).not.toBeNull();
    });
});

import { describe, it, expect, afterEach } from "vitest";
import { waitFor } from "@testing-library/dom";
import "../src/components/PaginationControls.wsx";
import "../src/components/GlobalSearch.wsx";

const tick = () => new Promise((r) => setTimeout(r, 60));
const mount = async (tag: string, props: Record<string, any> = {}) => {
    const el = document.createElement(tag) as any;
    Object.assign(el, props);
    document.body.appendChild(el);
    await tick();
    return el;
};
// Own accessor forwarding to the prototype setter: a property assigned before the element upgraded.
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

const buttons = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLButtonElement>(".pagination-btn"));
const info = (el: HTMLElement) => el.querySelector(".pagination-info")!.textContent!.replace(/\s+/g, " ").trim();

describe("PaginationControls", () => {
    it("renders range info, page info and select options", async () => {
        const el = await mount("wsx-ac-pagination-controls", {
            pageIndex: 1,
            pageSize: 10,
            totalRows: 25,
            totalPages: 3,
            pageSizeOptions: [10, 25],
        });
        el.rerender();
        await waitFor(() => expect(info(el)).toBe("Showing 11 to 20 of 25 results"));
        expect(el.querySelector(".pagination-page-info")!.textContent!.replace(/\s+/g, " ").trim()).toBe("Page 2 of 3");
        const opts = Array.from(el.querySelectorAll("option")) as HTMLOptionElement[];
        expect(opts.map((o) => o.textContent!.trim())).toEqual(["Show 10", "Show 25"]);
        expect(opts.map((o) => o.selected)).toEqual([true, false]);
        expect(buttons(el).map((b) => b.disabled)).toEqual([false, false, false, false]);
        expect(buttons(el).map((b) => b.title)).toEqual(["First Page", "Previous Page", "Next Page", "Last Page"]);
        expect(el.pageIndex).toBe(1);
        expect(el.pageSize).toBe(10);
        expect(el.totalRows).toBe(25);
        expect(el.totalPages).toBe(3);
        expect(el.pageSizeOptions).toEqual([10, 25]);
    });

    it("empty dataset shows zeros and disables all buttons", async () => {
        const el = await mount("wsx-ac-pagination-controls");
        expect(info(el)).toBe("Showing 0 to 0 of 0 results");
        expect(el.querySelector(".pagination-page-info")!.textContent!.replace(/\s+/g, " ").trim()).toBe("Page 1 of 1");
        expect(buttons(el).every((b) => b.disabled)).toBe(true);
        expect(el.i18n).toBeDefined();
    });

    it("navigation buttons call onPageChange with the target page", async () => {
        const pages: number[] = [];
        const el = await mount("wsx-ac-pagination-controls", {
            pageIndex: 2,
            totalRows: 50,
            totalPages: 5,
            onPageChange: (p: number) => pages.push(p),
        });
        el.rerender();
        await waitFor(() => expect(info(el)).toContain("21 to 30"));
        const [first, prev, next, last] = buttons(el);
        first.click();
        prev.click();
        next.click();
        last.click();
        expect(pages).toEqual([0, 1, 3, 4]);
    });

    it("ignores out-of-range page requests and a missing callback", async () => {
        const pages: number[] = [];
        const el = await mount("wsx-ac-pagination-controls", {
            pageIndex: 3,
            totalRows: 20,
            totalPages: 2,
        });
        el.rerender();
        await waitFor(() => expect(buttons(el)[1].disabled).toBe(false));
        // no callback registered: clicking is harmless
        buttons(el)[1].click();
        el.onPageChange = undefined;
        // page 2 is outside [0, totalPages): never reported
        const withCb = await mount("wsx-ac-pagination-controls", {
            pageIndex: 3,
            totalRows: 20,
            totalPages: 2,
        });
        (withCb as any).onPageChange = (p: number) => pages.push(p);
        withCb.rerender();
        await waitFor(() => expect(buttons(withCb)[1].disabled).toBe(false));
        buttons(withCb)[1].click();
        expect(pages).toEqual([]);
    });

    it("page size select change is handled without throwing", async () => {
        const el = await mount("wsx-ac-pagination-controls", { onPageSizeChange: () => {} });
        const select = el.querySelector("select") as HTMLSelectElement;
        select.value = "20";
        expect(() => select.dispatchEvent(new Event("change", { bubbles: true }))).not.toThrow();
    });

    it("uses a custom i18n manager and ignores falsy ones", async () => {
        const custom = { t: (_k: string, _p: any, d: string) => `~${d}` };
        const el = await mount("wsx-ac-pagination-controls", { totalRows: 5, totalPages: 1 });
        el.i18n = custom;
        el.i18n = null;
        expect(el.i18n).toBe(custom);
        el.rerender();
        await waitFor(() => expect(info(el)).toBe("~Showing 1 ~to 5 ~of 5 ~results"));
    });

    it("falls back to the default i18n when none is set", async () => {
        const el = await mount("wsx-ac-pagination-controls");
        el.i18n = { t: (_k: string, _p: any, d: string) => `~${d}` };
        el.rerender();
        await waitFor(() => expect(buttons(el)[0].title).toBe("~First Page"));
        await tick();
        el._i18n = undefined;
        el.rerender();
        await waitFor(() => expect(buttons(el)[0].title).toBe("First Page"));
    });

    it("picks up properties set before connection", async () => {
        const calls: string[] = [];
        const custom = { t: (_k: string, _p: any, d: string) => `#${d}` };
        const el = document.createElement("wsx-ac-pagination-controls") as any;
        preset(el, {
            pageIndex: 1,
            pageSize: 5,
            totalRows: 12,
            totalPages: 3,
            pageSizeOptions: [5, 15],
            i18n: custom,
        });
        el.onPageChange = (p: number) => calls.push(`p${p}`);
        document.body.appendChild(el);
        await tick();
        el.rerender();
        await waitFor(() => expect(buttons(el)[0].title).toBe("#First Page"));
        expect(info(el)).toBe("#Showing 6 #to 10 #of 12 #results");
        buttons(el)[0].click();
        expect(calls).toEqual(["p0"]);
    });

    it("connect with undefined host properties keeps defaults", async () => {
        const el = document.createElement("wsx-ac-pagination-controls") as any;
        preset(el, {
            pageIndex: undefined,
            pageSize: undefined,
            totalRows: undefined,
            totalPages: undefined,
            pageSizeOptions: undefined,
            i18n: undefined,
        });
        document.body.appendChild(el);
        await tick();
        expect(info(el)).toBe("Showing 0 to 0 of 0 results");
    });
});

describe("GlobalSearch", () => {
    const input = (el: HTMLElement) => el.querySelector<HTMLInputElement>(".global-search-input")!;

    it("renders the default placeholder and an empty value", async () => {
        const el = await mount("wsx-ac-global-search");
        expect(input(el).placeholder).toBe("Search all columns...");
        expect(input(el).value).toBe("");
        expect(el.value).toBe("");
        expect(el.onChange).toBeUndefined();
        expect(el.placeholder).toBe("");
        expect(el.i18n).toBeDefined();
    });

    it("custom placeholder wins; value setter updates the input", async () => {
        const el = await mount("wsx-ac-global-search", { placeholder: "Find..." });
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("Find..."));
        el.value = "abc";
        el.value = "abc";
        el.rerender();
        await waitFor(() => expect(input(el).value).toBe("abc"));
        expect(el.value).toBe("abc");
    });

    it("typing calls onChange with the text", async () => {
        const seen: string[] = [];
        const el = await mount("wsx-ac-global-search", { onChange: (v: string) => seen.push(v) });
        input(el).value = "hello";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(seen).toEqual(["hello"]);
    });

    it("typing falls back to the framework listener when onChange is unset", async () => {
        const seen: string[] = [];
        const el = await mount("wsx-ac-global-search");
        el.__wsxListener_change = (v: string) => seen.push(v);
        input(el).value = "x";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(seen).toEqual(["x"]);
    });

    it("typing with no handler at all is harmless", async () => {
        const el = await mount("wsx-ac-global-search");
        input(el).value = "y";
        expect(() => input(el).dispatchEvent(new Event("input", { bubbles: true }))).not.toThrow();
    });

    it("custom i18n supplies the placeholder; falsy i18n ignored; unset falls back", async () => {
        const custom = { t: (_k: string, _p: any, d: string) => `~${d}` };
        const el = await mount("wsx-ac-global-search");
        el.i18n = custom;
        el.i18n = null;
        expect(el.i18n).toBe(custom);
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("~Search all columns..."));
        await tick();
        el._i18n = undefined;
        el.rerender();
        await waitFor(() => expect(input(el).placeholder).toBe("Search all columns..."));
    });

    it("picks up properties set before connection", async () => {
        const seen: string[] = [];
        const custom = { t: (_k: string, _p: any, d: string) => `#${d}` };
        const el = document.createElement("wsx-ac-global-search") as any;
        preset(el, { value: "pre", onChange: (v: string) => seen.push(v), placeholder: "P", i18n: custom });
        document.body.appendChild(el);
        await tick();
        el.rerender();
        await waitFor(() => expect(input(el).value).toBe("pre"));
        expect(input(el).placeholder).toBe("P");
        input(el).value = "z";
        input(el).dispatchEvent(new Event("input", { bubbles: true }));
        expect(seen).toEqual(["z"]);
    });

    it("connect with undefined host properties keeps defaults", async () => {
        const el = document.createElement("wsx-ac-global-search") as any;
        preset(el, { value: undefined, onChange: undefined, placeholder: undefined, i18n: undefined });
        document.body.appendChild(el);
        await tick();
        expect(input(el).placeholder).toBe("Search all columns...");
    });
});

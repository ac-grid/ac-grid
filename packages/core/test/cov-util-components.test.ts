/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    registerComponent,
    registerComponents,
    getRegisteredComponent,
    unregisterComponent,
    clearComponentRegistry,
    resolveComponentRef,
} from "../src/utils/component-registry";
import { renderComponent } from "../src/utils/render-component";
import { ComponentPortal } from "../src/utils/component-portal";
import { flexRender } from "../src/utils/flex-render";
import { resolveHeaderContent } from "../src/utils/resolve-header-content";

beforeEach(() => clearComponentRegistry());

describe("component-registry", () => {
    it("registers, reads, unregisters and clears", () => {
        const fn = () => "x";
        registerComponent("a", fn);
        registerComponents({ b: "my-el", c: fn });
        expect(getRegisteredComponent("a")).toBe(fn);
        expect(getRegisteredComponent("b")).toBe("my-el");
        expect(unregisterComponent("a")).toBe(true);
        expect(unregisterComponent("a")).toBe(false);
        expect(getRegisteredComponent("a")).toBeUndefined();
        clearComponentRegistry();
        expect(getRegisteredComponent("c")).toBeUndefined();
    });
    it("resolves undefined, registered names, unknown names and functions", () => {
        const fn = () => "x";
        registerComponent("a", fn);
        expect(resolveComponentRef(undefined)).toBeUndefined();
        expect(resolveComponentRef("a")).toBe(fn);
        expect(resolveComponentRef("unknown-tag")).toBe("unknown-tag");
        expect(resolveComponentRef(fn)).toBe(fn);
    });
});

describe("renderComponent", () => {
    it("returns null for an undefined component", () => {
        expect(renderComponent(undefined as never)).toBeNull();
    });
    it("calls function components, merging context when provided", () => {
        const fn = vi.fn((p: Record<string, unknown>) => `v${p.n}${p.context ?? ""}`);
        expect(renderComponent(fn, { n: 1 })).toBe("v1");
        expect(fn).toHaveBeenLastCalledWith({ n: 1 });
        expect(renderComponent(fn, { n: 2 }, "C")).toBe("v2C");
        expect(fn).toHaveBeenLastCalledWith({ n: 2, context: "C" });
        expect(renderComponent(fn)).toBe("vundefined");
    });
    it("passes through HTMLElement, number, and null/undefined results", () => {
        const el = document.createElement("b");
        expect(renderComponent(() => el)).toBe(el);
        expect(renderComponent(() => 5)).toBe(5);
        expect(renderComponent(() => null)).toBeNull();
        expect(renderComponent(() => undefined)).toBeNull();
    });
    it("creates a custom element for tag names and assigns params and context", () => {
        const el = renderComponent("x-foo", { a: 1, b: "two" }, { ctx: true }) as HTMLElement & Record<string, unknown>;
        expect(el.tagName).toBe("X-FOO");
        expect(el.a).toBe(1);
        expect(el.b).toBe("two");
        expect(el.context).toEqual({ ctx: true });
        const plain = renderComponent("x-bar") as HTMLElement & Record<string, unknown>;
        expect("context" in plain).toBe(false);
    });
    it("resolves registered names before rendering", () => {
        registerComponent("hello", () => "hi");
        expect(renderComponent("hello")).toBe("hi");
    });
});

describe("ComponentPortal", () => {
    it("mounts elements, text, and nothing for null; unmount clears", () => {
        const portal = new ComponentPortal();
        const host = document.createElement("div");
        host.textContent = "old";
        expect(portal.isMounted()).toBe(false);

        portal.mount(host, () => document.createElement("span"));
        expect(portal.isMounted()).toBe(true);
        expect(host.innerHTML).toBe("<span></span>");

        portal.mount(host, () => 42);
        expect(host.textContent).toBe("42");

        portal.mount(host, () => null);
        expect(host.childNodes.length).toBe(0);
        expect(portal.isMounted()).toBe(true);

        portal.mount(host, (p) => String(p.k), { k: "v" });
        expect(host.textContent).toBe("v");
        portal.unmount();
        expect(host.childNodes.length).toBe(0);
        expect(portal.isMounted()).toBe(false);
        portal.unmount();
    });
    it("clears the previous host when remounting elsewhere", () => {
        const portal = new ComponentPortal();
        const a = document.createElement("div");
        const b = document.createElement("div");
        portal.mount(a, () => "A");
        portal.mount(b, () => "B");
        expect(a.textContent).toBe("");
        expect(b.textContent).toBe("B");
    });
});

describe("flexRender", () => {
    it("returns null for null/undefined", () => {
        expect(flexRender(null, {})).toBeNull();
        expect(flexRender(undefined, {})).toBeNull();
    });
    it("calls functions with the context", () => {
        const el = document.createElement("i");
        expect(flexRender((c: { n: number }) => el && c.n, { n: 3 })).toBe(3);
        expect(flexRender(() => el, {})).toBe(el);
        expect(flexRender(() => "s", {})).toBe("s");
        expect(flexRender(() => null, {})).toBeNull();
        expect(flexRender(() => undefined, {})).toBeNull();
        expect(flexRender(() => 0, {})).toBe(0);
    });
    it("stringifies non-element objects", () => {
        expect(flexRender(() => ({ toString: () => "obj" }), {})).toBe("obj");
        expect(flexRender(() => [1, 2], {})).toBe("1,2");
    });
    it("handles primitives", () => {
        expect(flexRender(true, {})).toBe("true");
        expect(flexRender(false, {})).toBe("false");
        expect(flexRender("t", {})).toBe("t");
        expect(flexRender(7, {})).toBe(7);
    });
});

describe("resolveHeaderContent", () => {
    const mk = (columnDef: Record<string, unknown>) =>
        ({ column: { columnDef }, getContext: () => ({ ctx: 1 }) }) as never;

    it("renders headerComponent with displayName, column and params, passing context", () => {
        const fn = vi.fn(() => "custom");
        const header = mk({ header: "Title", headerComponent: fn, headerComponentParams: { extra: 1 } });
        expect(resolveHeaderContent(header)).toBe("custom");
        expect(fn).toHaveBeenCalledWith({
            displayName: "Title",
            column: (header as { column: unknown }).column,
            extra: 1,
            context: { ctx: 1 },
        });
    });
    it("omits displayName for non-string headers", () => {
        const fn = vi.fn(() => "c");
        resolveHeaderContent(mk({ header: () => "x", headerComponent: fn }));
        expect(fn.mock.calls[0][0].displayName).toBeUndefined();
    });
    it("falls back to flexRender of the column header", () => {
        expect(resolveHeaderContent(mk({ header: "Plain" }))).toBe("Plain");
        expect(resolveHeaderContent(mk({ header: (c: { ctx: number }) => `h${c.ctx}` }))).toBe("h1");
    });
});

/// <reference types="vitest" />
import { describe, it, expect, vi, afterEach } from "vitest";
import "../src/components/Grid.wsx";
import { createGrid } from "../src/utils/create-grid";

type GridEl = HTMLElement & Record<string, any>;
const base = { data: [{ userId: "1" }], columns: [{ accessorKey: "userId", header: "Id" }] };

afterEach(() => vi.restoreAllMocks());

describe("createGrid (options not covered elsewhere)", () => {
    it("returns an unattached grid with data and columns when no options or container are given", () => {
        const grid = createGrid(base) as GridEl;
        expect(grid.tagName.toLowerCase()).toBe("wsx-ac-grid");
        expect(grid.isConnected).toBe(false);
        expect(grid.data).toEqual(base.data);
        expect(grid.columns).toEqual(base.columns);
        expect(grid.className).toBe("");
    });

    it("applies aria label and description", () => {
        const grid = createGrid({ ...base, ariaLabel: "People", ariaDescription: "All people" }) as GridEl;
        expect(grid.ariaLabel).toBe("People");
        expect(grid.ariaDescription).toBe("All people");
    });

    it("applies theme transition settings, including explicit false and zero values", () => {
        const on = createGrid({ ...base, themeTransition: true, themeTransitionDuration: 350 }) as GridEl;
        expect(on.themeTransition).toBe(true);
        expect(on.themeTransitionDuration).toBe(350);
        const off = createGrid({ ...base, themeTransition: false, themeTransitionDuration: 0 }) as GridEl;
        expect(off.themeTransition).toBe(false);
        expect(off.themeTransitionDuration).toBe(0);
    });

    it("applies the initial theme by name", () => {
        const Grid = customElements.get("wsx-ac-grid")!;
        const spy = vi.spyOn(Grid.prototype as any, "applyTheme").mockImplementation(() => {});
        createGrid({ ...base, theme: "dark" });
        expect(spy).toHaveBeenCalledWith("dark");
    });

    it("does not set keyboard navigation flags when unspecified but honours false", () => {
        const off = createGrid({ ...base, enableKeyboardNavigation: false }) as GridEl;
        expect(off.enableKeyboardNavigation).toBe(false);
    });
});

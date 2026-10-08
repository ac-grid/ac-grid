/// <reference types="vitest" />
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { I18nManager, isRtlLocale, enUS, zhCN } from "../src/i18n";
import { createGrid } from "../src/utils/create-grid";
import "../src/components/Grid.wsx";

describe("RFC-0015: Internationalization (i18n)", () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container.parentNode) {
            document.body.removeChild(container);
        }
        container.innerHTML = "";
    });

    describe("I18nManager Unit Tests", () => {
        it("should initialize with default locale en-US", () => {
            const manager = new I18nManager();
            expect(manager.getLocale()).toBe("en-US");
            expect(manager.getDirection()).toBe("ltr");
            expect(manager.t("grid.loading")).toBe("Loading...");
            expect(manager.t("grid.noData")).toBe("No data available");
        });

        it("should switch locale and translate to zh-CN", () => {
            const manager = new I18nManager({ locale: "zh-CN" });
            expect(manager.getLocale()).toBe("zh-CN");
            expect(manager.t("grid.loading")).toBe("加载中...");
            expect(manager.t("grid.noData")).toBe("暂无数据");
            expect(manager.t("grid.sort.asc")).toBe("升序");

            manager.setLocale("en-US");
            expect(manager.getLocale()).toBe("en-US");
            expect(manager.t("grid.sort.asc")).toBe("ascending");
        });

        it("should support parameter interpolation", () => {
            const manager = new I18nManager();
            manager.setMessages({
                "greeting": "Hello, {name}!",
                "showing": "Showing {start} to {end} of {total}",
            });

            expect(manager.t("greeting", { name: "Alice" })).toBe("Hello, Alice!");
            expect(manager.t("showing", { start: 1, end: 10, total: 100 })).toBe("Showing 1 to 10 of 100");
        });

        it("should fallback to en-US when key is missing in target locale", () => {
            const manager = new I18nManager({ locale: "zh-CN" });
            manager.registerLanguagePack({
                locale: "fr-FR",
                messages: {
                    "custom.key": "Bonjour",
                },
            });
            manager.setLocale("fr-FR");
            expect(manager.t("custom.key")).toBe("Bonjour");
            // Missing in fr-FR, fallback to en-US
            expect(manager.t("grid.loading")).toBe("Loading...");
        });

        it("should fallback to default value or key when not found anywhere", () => {
            const manager = new I18nManager();
            expect(manager.t("unknown.key", undefined, "Fallback Text")).toBe("Fallback Text");
            expect(manager.t("unknown.key")).toBe("unknown.key");
        });

        it("should notify locale change listeners", () => {
            const manager = new I18nManager();
            const listener = vi.fn();
            const unsubscribe = manager.onLocaleChange(listener);

            manager.setLocale("zh-CN");
            expect(listener).toHaveBeenCalledWith("zh-CN");

            unsubscribe();
            manager.setLocale("en-US");
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it("should format date correctly using Intl and custom templates", () => {
            const manager = new I18nManager({ locale: "en-US" });
            const testDate = new Date(2026, 0, 24, 15, 30, 0); // 2026-01-24 15:30:00

            const formatted = manager.formatDate(testDate);
            expect(formatted).toBeTruthy();

            // Custom pattern formatting
            const customPattern = manager.formatDate(testDate, "YYYY-MM-DD");
            expect(customPattern).toBe("2026-01-24");

            const customDateTime = manager.formatDate(testDate, "YYYY/MM/DD HH:mm:ss");
            expect(customDateTime).toBe("2026/01/24 15:30:00");
        });

        it("should format number correctly using Intl", () => {
            const manager = new I18nManager({ locale: "en-US" });
            const formatted = manager.formatNumber(1234567.89);
            expect(formatted).toContain("1,234,567");

            // Format with currency options
            const currency = manager.formatNumber(100, {
                style: "currency",
                currency: "USD",
            });
            expect(currency).toContain("$");
            expect(currency).toContain("100");
        });

        it("should identify RTL languages and direction", () => {
            expect(isRtlLocale("ar")).toBe(true);
            expect(isRtlLocale("ar-SA")).toBe(true);
            expect(isRtlLocale("he")).toBe(true);
            expect(isRtlLocale("he-IL")).toBe(true);
            expect(isRtlLocale("en-US")).toBe(false);
            expect(isRtlLocale("zh-CN")).toBe(false);

            const manager = new I18nManager({ locale: "ar-EG" });
            expect(manager.getDirection()).toBe("rtl");

            manager.setLocale("en-US");
            expect(manager.getDirection()).toBe("ltr");

            // Explicit direction override
            manager.setDirection("rtl");
            expect(manager.getDirection()).toBe("rtl");
            manager.setDirection(undefined);
            expect(manager.getDirection()).toBe("ltr");
        });
    });

    describe("Grid Component i18n Integration", () => {
        const testData = [
            { userId: "1", name: "Alice", age: 30, createdAt: new Date("2026-01-01") },
            { userId: "2", name: "Bob", age: 25, createdAt: new Date("2026-02-15") },
            { userId: "3", name: "Charlie", age: 35, createdAt: new Date("2026-03-20") },
        ];

        const testColumns = [
            { accessorKey: "name", header: "Name", enableColumnFilter: true },
            { accessorKey: "age", header: "Age", filterType: "number" as const, enableColumnFilter: true },
        ];

        it("should expose setLocale, getLocale, t, formatDate, formatNumber API on Grid", async () => {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = testData;
            grid.columns = testColumns;
            container.appendChild(grid);

            await waitFor(() => {
                expect(grid.getLocale).toBeTypeOf("function");
                expect(grid.setLocale).toBeTypeOf("function");
                expect(grid.t).toBeTypeOf("function");
                expect(grid.formatDate).toBeTypeOf("function");
                expect(grid.formatNumber).toBeTypeOf("function");
            });

            expect(grid.getLocale()).toBe("en-US");
            expect(grid.t("grid.loading")).toBe("Loading...");

            grid.setLocale("zh-CN");
            expect(grid.getLocale()).toBe("zh-CN");
            expect(grid.t("grid.loading")).toBe("加载中...");
        });

        it("should fire locale-change event when setLocale is called", async () => {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = testData;
            grid.columns = testColumns;
            container.appendChild(grid);

            const localeChangeSpy = vi.fn();
            grid.addEventListener("locale-change", (e: any) => {
                localeChangeSpy(e.detail.locale);
            });

            grid.setLocale("zh-CN");
            expect(localeChangeSpy).toHaveBeenCalledWith("zh-CN");
        });

        it("should apply RTL dir attribute and styling when RTL locale or dir is set", async () => {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = testData;
            grid.columns = testColumns;
            grid.i18nConfig = {
                locale: "ar-EG",
            };
            container.appendChild(grid);

            await waitFor(() => {
                const root = grid.shadowRoot || grid;
                const gridEl = root.querySelector(".ac-grid") || grid;
                expect(grid.getAttribute("dir")).toBe("rtl");
                expect(gridEl.getAttribute("dir")).toBe("rtl");
                expect(gridEl.classList.contains("rtl")).toBe(true);
            });

            // Switch to ltr locale
            grid.setLocale("en-US");
            await waitFor(() => {
                const root = grid.shadowRoot || grid;
                const gridEl = root.querySelector(".ac-grid") || grid;
                expect(grid.getAttribute("dir")).toBe("ltr");
                expect(gridEl.getAttribute("dir")).toBe("ltr");
                expect(gridEl.classList.contains("rtl")).toBe(false);
            });
        });

        it("should translate pagination controls when locale changes", async () => {
            const grid = document.createElement("wsx-ac-grid") as any;
            grid.data = testData;
            grid.columns = testColumns;
            grid.paginationConfig = { enabled: true, pageSize: 2 };
            grid.i18nConfig = { locale: "en-US" };
            container.appendChild(grid);

            await waitFor(() => {
                const root = grid.shadowRoot || grid;
                const paginationInfo = root.querySelector(".pagination-info");
                expect(paginationInfo?.textContent).toContain("Showing");
                expect(paginationInfo?.textContent).toContain("of");
                expect(paginationInfo?.textContent).toContain("results");
            });

            // Switch to Chinese
            grid.setLocale("zh-CN");

            await waitFor(() => {
                const root = grid.shadowRoot || grid;
                const paginationInfo = root.querySelector(".pagination-info");
                expect(paginationInfo?.textContent).toContain("显示第");
                expect(paginationInfo?.textContent).toContain("至");
                expect(paginationInfo?.textContent).toContain("共");
            });
        });

        it("should configure i18n via createGrid helper", async () => {
            const gridEl = createGrid({
                data: testData,
                columns: testColumns,
                locale: "zh-CN",
                messages: {
                    "grid.custom": "自定义文本",
                },
                pagination: { enabled: true, pageSize: 2 },
                container,
            }) as any;

            expect(gridEl.getLocale()).toBe("zh-CN");
            expect(gridEl.t("grid.custom")).toBe("自定义文本");

            await waitFor(() => {
                const root = gridEl.shadowRoot || gridEl;
                const paginationInfo = root.querySelector(".pagination-info");
                expect(paginationInfo?.textContent).toContain("显示第");
            });
        });

        it("should meet performance goal: language switch < 50ms and format < 1ms", () => {
            const manager = new I18nManager();
            const startTime = performance.now();
            manager.setLocale("zh-CN");
            const switchDuration = performance.now() - startTime;
            expect(switchDuration).toBeLessThan(50);

            const formatStartTime = performance.now();
            for (let i = 0; i < 100; i++) {
                manager.formatDate(new Date());
                manager.formatNumber(i * 100);
            }
            const avgFormatDuration = (performance.now() - formatStartTime) / 200;
            expect(avgFormatDuration).toBeLessThan(1);
        });
    });
});

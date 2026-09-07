import { expect, test } from "@playwright/test";

const TOTAL_ROWS = 10_000;
const MAX_DOM_ROWS = 80;

test.describe("RFC-0005 virtual scrolling (browser)", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/?e2e=virtual-scroll");
        await expect(page.getByTestId("virtual-scroll-demo")).toBeVisible({ timeout: 30_000 });
        await expect(page.locator("wsx-ac-grid .grid-body")).toBeVisible({ timeout: 30_000 });
    });

    test("mounts far fewer DOM rows than data rows", async ({ page }) => {
        const rows = page.locator("wsx-ac-grid .grid-body .grid-row");
        await expect(rows.first()).toBeVisible({ timeout: 15_000 });

        const domRowCount = await rows.count();
        expect(domRowCount).toBeGreaterThan(0);
        expect(domRowCount).toBeLessThan(MAX_DOM_ROWS);
        expect(domRowCount).toBeLessThan(TOTAL_ROWS);
    });

    test("keeps DOM row window small after scroll", async ({ page }) => {
        const result = await page.evaluate(() => {
            const grid = (window as unknown as {
                __acGridVirtual?: {
                    scrollToRow?: (i: number) => void;
                    getVisibleRowRange?: () => { start: number; end: number };
                };
            }).__acGridVirtual;
            grid?.scrollToRow?.(5000);
            return {
                range: grid?.getVisibleRowRange?.() ?? null,
                domRowCount: document.querySelectorAll("wsx-ac-grid .grid-body .grid-row")
                    .length,
            };
        });

        expect(result.range).not.toBeNull();
        expect(result.domRowCount).toBeLessThan(MAX_DOM_ROWS);
        expect(result.range!.start).toBeGreaterThan(0);
        expect(result.range!.end).toBeLessThan(TOTAL_ROWS);
    });
});

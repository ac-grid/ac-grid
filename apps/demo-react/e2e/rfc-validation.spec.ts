import { expect, test } from "@playwright/test";

test.describe("RFC validation demos (browser)", () => {
    test.describe("RFC-0002 sorting", () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto("/?rfc=0002");
            await expect(page.locator("wsx-ac-grid .grid-body .grid-row").first()).toBeVisible({
                timeout: 15_000,
            });
        });

        test("reorders visible rows after clicking a sortable header", async ({ page }) => {
            const firstCell = page.locator("wsx-ac-grid .grid-body .grid-row").first().locator(".grid-cell").first();
            const before = (await firstCell.textContent())?.trim();

            await page.locator('.grid-header-cell[data-column-id="firstName"]').click();
            await page.waitForTimeout(300);

            const after = (await firstCell.textContent())?.trim();
            expect(after).toBeTruthy();
            expect(after).not.toBe(before);

            const sortedCheck = await page.evaluate(() => {
                const grid = document.querySelector("wsx-ac-grid") as HTMLElement & {
                    table?: {
                        getState: () => { sorting: Array<{ id: string }> };
                        getRowModel: () => { rows: Array<{ getValue: (id: string) => string }> };
                    };
                };
                const sorting = grid.table?.getState().sorting ?? [];
                const model = grid.table?.getRowModel().rows.slice(0, 5).map((row) => row.getValue("firstName")) ?? [];
                const dom = Array.from(document.querySelectorAll("wsx-ac-grid .grid-row"))
                    .slice(0, 5)
                    .map((row) => row.querySelector(".grid-cell")?.textContent?.trim());

                return { sorting, model, dom };
            });

            expect(sortedCheck.sorting[0]?.id).toBe("firstName");
            expect(sortedCheck.dom).toEqual(sortedCheck.model);
        });
    });

    test.describe("RFC-0002 horizontal scroll", () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 400, height: 600 });
            await page.goto("/?rfc=0002");
            await expect(page.locator("wsx-ac-grid .grid-body .grid-row").first()).toBeVisible({
                timeout: 15_000,
            });
        });

        test("keeps header aligned with body during real mouse wheel horizontal scroll", async ({
            page,
        }) => {
            const readScrollPositions = () =>
                page.evaluate(() => {
                    const bodyEl = document.querySelector("wsx-ac-grid .grid-body") as HTMLElement | null;
                    const headerEl = document.querySelector("wsx-ac-grid .grid-header") as HTMLElement | null;
                    return {
                        body: bodyEl?.scrollLeft ?? 0,
                        header: headerEl?.scrollLeft ?? 0,
                        canScroll: (bodyEl?.scrollWidth ?? 0) > (bodyEl?.clientWidth ?? 0),
                    };
                });

            const body = page.locator("wsx-ac-grid .grid-body");
            await expect(body).toBeVisible();

            const box = await page.waitForFunction(() => {
                const bodyEl = document.querySelector("wsx-ac-grid .grid-body") as HTMLElement | null;
                if (!bodyEl || bodyEl.scrollWidth <= bodyEl.clientWidth) {
                    return null;
                }

                const rect = bodyEl.getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) {
                    return null;
                }

                return {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                };
            });
            const bodyBox = (await box.jsonValue()) as {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            expect(bodyBox.width).toBeGreaterThan(0);

            const before = await readScrollPositions();
            expect(before.canScroll).toBe(true);

            await page.mouse.move(bodyBox.x + 40, bodyBox.y + 40);
            await page.mouse.wheel(220, 0);

            let after = await readScrollPositions();
            if (after.body === before.body) {
                await page.keyboard.down("Shift");
                await page.mouse.wheel(0, 220);
                await page.keyboard.up("Shift");
                after = await readScrollPositions();
            }

            await expect
                .poll(readScrollPositions, { timeout: 3_000 })
                .toMatchObject({
                    body: expect.any(Number),
                    header: expect.any(Number),
                });

            after = await readScrollPositions();
            expect(after.body).toBeGreaterThan(before.body);
            expect(after.header).toBe(after.body);
        });
    });
});

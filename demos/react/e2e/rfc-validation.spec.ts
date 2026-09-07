import { expect, test } from "@playwright/test";

test.describe("RFC validation demos (browser)", () => {
    test("RFC-0001 mounts typed grid through the Web Component entrypoint", async ({ page }) => {
        await page.goto("/?rfc=0001");
        await expect(page.locator("wsx-ac-grid")).toHaveCount(1);
        await expect(page.locator("wsx-ac-grid .grid-row")).toHaveCount(10);
    });

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

    test("RFC-0002 reorders columns after a real header drag", async ({ page }) => {
        await page.goto("/?rfc=0002");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        const source = page.locator('.grid-header-cell[data-column-id="firstName"] .drag-handle-button');
        const target = page.locator('.grid-header-cell[data-column-id="lastName"]');
        const sourceBox = await source.boundingBox();
        const targetBox = await target.boundingBox();
        expect(sourceBox).toBeTruthy();
        expect(targetBox).toBeTruthy();
        await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y + sourceBox!.height / 2);
        await page.mouse.down();
        await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + targetBox!.height / 2, { steps: 12 });
        await page.mouse.up();
        await expect
            .poll(() =>
                page.locator(".grid-header-cell[data-column-id]").evaluateAll((nodes) =>
                    nodes.map((node) => node.getAttribute("data-column-id")),
                ),
            )
            .toEqual(["lastName", "firstName", "age", "status"]);
    });

    test("RFC-0003 filters rows through global search", async ({ page }) => {
        await page.goto("/?rfc=0003");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        const before = await page.locator(".grid-row").count();
        await page.locator(".demo-search").fill("zzzz-no-match");
        await expect.poll(() => page.locator(".grid-row").count()).toBeLessThan(before);
        expect(await page.locator(".grid-row").count()).toBe(0);
    });

    test("RFC-0004 changes column width with its resize handle", async ({ page }) => {
        await page.goto("/?rfc=0004");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        const header = page.locator('.grid-header-cell[data-column-id="firstName"]');
        const resizer = header.locator(".resizer");
        const before = await header.evaluate((element) => element.getBoundingClientRect().width);
        const box = await resizer.boundingBox();
        expect(box).toBeTruthy();
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(box!.x + 60, box!.y + box!.height / 2, { steps: 5 });
        await page.mouse.up();
        await expect
            .poll(() => header.evaluate((element) => element.getBoundingClientRect().width))
            .toBeGreaterThan(before);
    });

    test("RFC-0006 changes page from pagination controls", async ({ page }) => {
        await page.goto("/?rfc=0006");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await page.locator(".pagination-controls button").nth(2).click();
        await expect(page.locator(".pagination-controls")).toContainText("Page 2 of 10");
    });

    test("RFC-0007 selects a row through its checkbox", async ({ page }) => {
        await page.goto("/?rfc=0007");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await page.locator("wsx-ac-selection-checkbox input").nth(1).click();
        await expect
            .poll(() =>
                page.evaluate(() => {
                    const grid = document.querySelector("wsx-ac-grid") as HTMLElement & {
                        getSelectedRowIds?: () => string[];
                    };
                    return grid.getSelectedRowIds?.().length ?? 0;
                }),
            )
            .toBe(1);
    });

    test("RFC-0009 starts editing on cell double click", async ({ page }) => {
        await page.goto("/?rfc=0009");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await page.locator(".grid-row .grid-cell").first().dblclick();
        await expect(page.locator("wsx-ac-cell-editor")).toHaveCount(1);
    });

    test("RFC-0008 pins configured columns", async ({ page }) => {
        await page.setViewportSize({ width: 500, height: 600 });
        await page.goto("/?rfc=0008");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('.grid-header-cell[data-column-id="firstName"]')).toHaveCSS(
            "position",
            "sticky",
        );
        await expect(page.locator('.grid-header-cell[data-column-id="progress"]')).toHaveCSS(
            "position",
            "sticky",
        );
    });

    test("RFC-0019 renders custom header component", async ({ page }) => {
        await page.goto("/?rfc=0019");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText("Custom Name", { exact: true })).toHaveCount(1);
    });

    test("RFC-0016 applies theme variables to the validation grid", async ({ page }) => {
        await page.goto("/?rfc=0016");
        await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
        await expect
            .poll(() => page.locator("wsx-ac-grid").evaluate((element) => getComputedStyle(element).getPropertyValue("--ac-grid-bg-cell")))
            .not.toBe("");
    });

    test("RFC-0030 recalculates formula result after input change", async ({ page }) => {
        await page.goto("/?rfc=0030");
        await expect(page.locator('[data-testid="formula-sum"]')).toHaveText("C1 = SUM(A1:B1) = 15");
        await expect(page.locator('[data-testid="formula-average"]')).toHaveText("C2 = AVG(A2:B2) = 7");
        await expect(page.locator('[data-testid="formula-cycle"]')).toHaveText("C3 = #CYCLE!");
        await page.getByRole("button", { name: "增加 A1" }).click();
        await expect(page.locator('[data-testid="formula-sum"]')).toHaveText("C1 = SUM(A1:B1) = 16");
    });
});

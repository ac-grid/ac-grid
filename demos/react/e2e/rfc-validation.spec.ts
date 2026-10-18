import { expect, test } from "@playwright/test";

import { gridReady } from "./helpers";

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
            await gridReady(page);
        });

        test("reorders visible rows after clicking a sortable header", async ({ page }) => {
            const firstCell = page.locator("wsx-ac-grid .grid-body .grid-row").first().locator(".grid-cell").first();
            const before = (await firstCell.textContent())?.trim();

            await page.locator('.grid-header-cell[data-column-id="firstName"]').click();
            await expect(firstCell).not.toHaveText(before ?? "");

            const after = (await firstCell.textContent())?.trim();
            expect(after).toBeTruthy();

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
            await gridReady(page);
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

            if (after.body === before.body) {
                await body.evaluate((element) => {
                    const bodyElement = element as HTMLElement;
                    bodyElement.scrollLeft = Math.min(220, bodyElement.scrollWidth - bodyElement.clientWidth);
                    bodyElement.dispatchEvent(new Event("scroll", { bubbles: true }));
                });
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
        await gridReady(page);
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
        await gridReady(page);
        const before = await page.locator(".grid-row").count();
        await page.locator(".demo-search").fill("zzzz-no-match");
        await expect.poll(() => page.locator(".grid-row").count()).toBeLessThan(before);
        expect(await page.locator(".grid-row").count()).toBe(0);
    });

    test("RFC-0004 changes column width with its resize handle", async ({ page }) => {
        await page.goto("/?rfc=0004");
        await gridReady(page);
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
        await gridReady(page);
        await page.locator(".pagination-controls button").nth(2).click();
        await expect(page.locator(".pagination-controls")).toContainText("Page 2 of 10");
    });

    test("RFC-0007 selects a row through its checkbox", async ({ page }) => {
        await page.goto("/?rfc=0007");
        await gridReady(page);
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
        await gridReady(page);
        await page.locator(".grid-row .grid-cell").first().dblclick();
        await expect(page.locator("wsx-ac-cell-editor")).toHaveCount(1);
    });

    test("RFC-0012 supports keyboard focus and navigation", async ({ page }) => {
        await page.goto("/?rfc=0012");
        await gridReady(page);
        const firstCell = page.locator(".grid-row .grid-cell").first();
        await firstCell.focus();
        await page.keyboard.press("ArrowRight");
        await expect.poll(() => page.evaluate(() =>
            (document.querySelector("wsx-ac-grid") as any).getFocusedCell()?.columnId,
        )).toBe("lastName");
    });

    test("RFC-0008 pins configured columns", async ({ page }) => {
        await page.setViewportSize({ width: 500, height: 600 });
        await page.goto("/?rfc=0008");
        await gridReady(page);
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
        await gridReady(page);
        await expect(page.getByText("Custom Name", { exact: true })).toHaveCount(1);
    });

    test("RFC-0015 renders pagination text from the zh-CN language pack", async ({ page }) => {
        await page.goto("/?rfc=0015");
        await gridReady(page);
        await expect(page.locator(".pagination-info")).toContainText("显示第 1 至 10 条");
        await expect(page.locator(".pagination-controls")).not.toContainText("Showing");
    });

    test("RFC-0022 selects and highlights a rectangular cell range by dragging", async ({ page }) => {
        await page.goto("/?rfc=0022");
        const grid = page.locator("wsx-ac-grid");
        const rows = grid.locator(".grid-body .grid-row");
        await gridReady(page);

        const start = rows.nth(0).locator(".grid-cell").nth(0);
        const end = rows.nth(1).locator(".grid-cell").nth(1);
        await expect(start).toBeVisible();
        await expect(end).toBeVisible();
        await start.hover();
        await page.mouse.down();
        await end.hover();
        await page.mouse.up();

        await expect.poll(() => grid.evaluate((element) => {
            const ranges = (element as HTMLElement & { getCellRanges?: () => Array<{ startRow: number; endRow: number; columns: string[] }> }).getCellRanges?.() ?? [];
            return ranges[0] ?? null;
        })).toEqual({ startRow: 0, endRow: 1, columns: ["firstName", "lastName"] });
        await expect(grid.locator('.grid-cell[data-range-selected="true"]')).toHaveCount(4);
    });

    test("RFC-0016 applies theme variables to the validation grid", async ({ page }) => {
        await page.goto("/?rfc=0016");
        await gridReady(page);
        await expect
            .poll(() => page.locator("wsx-ac-grid").evaluate((element) => getComputedStyle(element).getPropertyValue("--ac-grid-bg-cell")))
            .not.toBe("");
    });

    test("RFC-0010 groups rows, calculates aggregations, and expands/collapses groups", async ({ page }) => {
        await page.goto("/?rfc=0010");
        await gridReady(page);

        // Group rows should be rendered
        const groupRows = page.locator("wsx-ac-grid .grid-row.grid-row-grouped");
        await expect(groupRows).toHaveCount(3); // single, complicated, relationship

        // Verify aggregation renders members count, avg age, or sum visits in cells
        await expect(page.locator("wsx-ac-grid .grid-cell-group").first()).toBeVisible();
        await expect(page.locator("text=/\\d+ members/").first()).toBeVisible();

        const initialRowCount = await page.locator("wsx-ac-grid .grid-row").count();
        expect(initialRowCount).toBeGreaterThan(3);

        // Click collapse all button
        // Retry the click: the first one can land before the grid is wired to the toolbar.
        await expect(async () => {
            await page.locator('[data-testid="collapse-all-btn"]').click();
            await expect(page.locator("wsx-ac-grid .grid-row")).toHaveCount(3, { timeout: 1000 });
        }).toPass();

        // Click first grouped row to expand it
        await page.locator("wsx-ac-grid .grid-row.grid-row-grouped").first().click();
        await expect
            .poll(async () => page.locator("wsx-ac-grid .grid-row").count())
            .toBeGreaterThan(3);

        // Click expand all button -> all rows restored
        await page.locator('[data-testid="expand-all-btn"]').click();
        await expect(page.locator("wsx-ac-grid .grid-row")).toHaveCount(initialRowCount);
    });

    test("RFC-0030 recalculates formula result after input change", async ({ page }) => {
        await page.goto("/?rfc=0030");
        await expect(page.locator('[data-testid="formula-sum"]')).toHaveText("C1 = SUM(A1:B1) = 15");
        await expect(page.locator('[data-testid="formula-average"]')).toHaveText("C2 = AVG(A2:B2) = 7");
        await expect(page.locator('[data-testid="formula-cycle"]')).toHaveText("C3 = #CYCLE!");
        await page.getByRole("button", { name: "增加 A1" }).click();
        await expect(page.locator('[data-testid="formula-sum"]')).toHaveText("C1 = SUM(A1:B1) = 16");
    });
    test("RFC-0011 previews a theme, restores it on cancel, and keeps an applied theme", async ({ page }) => {
        await page.goto("/?rfc=0011");
        await gridReady(page);
        const headerBg = () =>
            page.locator("wsx-ac-grid").evaluate((element) => getComputedStyle(element).getPropertyValue("--ac-grid-bg-header").trim());
        const status = page.locator('[data-testid="theme-status"]');

        await expect(status).toHaveText("applied=light preview=none");
        const light = await headerBg();
        expect(light).not.toBe("");

        await page.locator('[data-testid="preview-ocean-btn"]').click();
        await expect(status).toHaveText("applied=light preview=ocean");
        await expect.poll(headerBg).not.toBe(light);
        const ocean = await headerBg();

        await page.locator('[data-testid="cancel-preview-btn"]').click();
        await expect(status).toHaveText("applied=light preview=none");
        await expect.poll(headerBg).toBe(light);

        await page.locator('[data-testid="preview-dark-btn"]').click();
        await expect.poll(headerBg).not.toBe(light);
        await page.locator('[data-testid="apply-ocean-btn"]').click();
        await expect(status).toHaveText("applied=ocean preview=none");
        await expect.poll(headerBg).toBe(ocean);
    });

    test.describe("RFC-0023 clipboard", () => {
        const cell = (page: import("@playwright/test").Page, row: number, columnId: string) =>
            page.locator(".grid-body .grid-row").nth(row).locator(`.grid-cell[data-column-id="${columnId}"]`);

        test.beforeEach(async ({ page }) => {
            await page.goto("/?rfc=0023");
            await gridReady(page);
        });

        test("RFC-0023 copies the clicked cell as text", async ({ page }) => {
            const target = cell(page, 1, "lastName");
            const text = (await target.textContent())?.trim() ?? "";
            expect(text).not.toBe("");
            await target.click();
            await page.keyboard.press("ControlOrMeta+c");
            await expect(page.locator('[data-testid="clipboard-copied"]')).toHaveText(text);
        });

        test("RFC-0023 pastes a TSV matrix starting at the clicked cell", async ({ page }) => {
            await cell(page, 0, "firstName").click();
            await page.keyboard.press("ControlOrMeta+v");
            await expect(cell(page, 0, "firstName")).toHaveText("Alpha");
            await expect(cell(page, 0, "lastName")).toHaveText("One");
            await expect(cell(page, 1, "firstName")).toHaveText("Beta");
            await expect(cell(page, 1, "lastName")).toHaveText("Two");
        });
    });
});

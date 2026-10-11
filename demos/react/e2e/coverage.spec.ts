import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

// RFC-0033: every RFC registered on the validation bench needs at least one browser test.
test("every validation demo RFC has an E2E test", () => {
    const specs = ["rfc-validation.spec.ts", "virtual-scrolling.spec.ts"]
        .map((file) => readFileSync(new URL(file, import.meta.url), "utf8"))
        .join("\n");
    // Parse the order list as text: importing the demo module would load the browser-only core bundle.
    const demos = readFileSync(new URL("../src/rfcValidationDemos.ts", import.meta.url), "utf8");
    const order = demos.match(/RFC_VALIDATION_ORDER = \[([^\]]*)\]/)![1].match(/\d{4}/g)!;
    const missing = order.filter((id) => !specs.includes(`RFC-${id}`));
    expect(missing).toEqual([]);
});

test("fixture data is deterministic across reloads", async ({ page }) => {
    await page.goto("/?rfc=0002");
    const first = page.locator(".grid-row").first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    const before = await first.textContent();
    await page.reload();
    await expect(page.locator(".grid-row").first()).toHaveText(before!);
});

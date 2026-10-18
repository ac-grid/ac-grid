import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

// RFC-0033: every completed RFC needs a demo page and a browser test.
// Source of truth is .spec/rfc/completed/, not the demo registry: an RFC with no demo must fail here.
const completedIds = readdirSync(new URL("../../../.spec/rfc/completed/", import.meta.url))
    .map((file) => file.match(/^(\d{4})-/)?.[1])
    .filter((id): id is string => Boolean(id));
// Parse the order list as text: importing the demo module would load the browser-only core bundle.
const demos = readFileSync(new URL("../src/rfcValidationDemos.ts", import.meta.url), "utf8");
const demoIds = demos.match(/RFC_VALIDATION_ORDER = \[([^\]]*)\]/)![1].match(/\d{4}/g)!;
const specs = ["rfc-validation.spec.ts", "virtual-scrolling.spec.ts"]
    .map((file) => readFileSync(new URL(file, import.meta.url), "utf8"))
    .join("\n");

test("every completed RFC has a validation demo", () => {
    expect(completedIds.filter((id) => !demoIds.includes(id))).toEqual([]);
});

test("every completed RFC has an E2E test", () => {
    expect(completedIds.filter((id) => !specs.includes(`RFC-${id}`))).toEqual([]);
});

// The skill is how agents learn each feature, so a completed RFC with no row there is undocumented.
test("every completed RFC is covered by the ac-grid agent skill", () => {
    const skill = readFileSync(new URL("../../../skills/ac-grid/references/features.md", import.meta.url), "utf8");
    expect(completedIds.filter((id) => !skill.includes(`| ${id} |`))).toEqual([]);
});

test("fixture data is deterministic across reloads", async ({ page }) => {
    await page.goto("/?rfc=0002");
    const first = page.locator(".grid-row").first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    const before = await first.textContent();
    await page.reload();
    await expect(page.locator(".grid-row").first()).toHaveText(before!);
});

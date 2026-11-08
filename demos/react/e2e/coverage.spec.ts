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
const matrix = readFileSync(new URL("../../../.spec/rfc/0034-rfc-demo-acceptance-matrix.md", import.meta.url), "utf8");
const matrixRows = new Map<string, { route: string; evidence: string }>();
for (const line of matrix.split("\n")) {
    const columns = line.split("|");
    const id = columns[1]?.match(/\*\*(\d{4})\*\*/)?.[1];
    if (id) {
        matrixRows.set(id, {
            route: columns[3]?.trim().replaceAll("`", "") ?? "",
            evidence: columns[5]?.trim() ?? "",
        });
    }
}
const specs = ["rfc-validation.spec.ts", "virtual-scrolling.spec.ts"]
    .map((file) => readFileSync(new URL(file, import.meta.url), "utf8"))
    .join("\n");
const hasE2eTitle = (id: string) => new RegExp(`(?:test|describe)\\(\\s*["'\`]RFC-${id}\\b`).test(specs);

test("every completed RFC has a validation demo", () => {
    expect(completedIds.filter((id) => !demoIds.includes(id))).toEqual([]);
});

test("every interactive demo RFC has an acceptance matrix row and matching route", () => {
    const missing = demoIds.filter((id) => !matrixRows.has(id));
    const stale = [...matrixRows.keys()].filter((id) => !demoIds.includes(id));
    const wrongRoutes = demoIds.filter((id) => {
        const expected = id === "0005" ? "/?e2e=virtual-scroll" : `/?rfc=${id}`;
        return matrixRows.get(id)?.route !== expected;
    });
    expect({ missing, stale, wrongRoutes }).toEqual({ missing: [], stale: [], wrongRoutes: [] });
});

test("every demo RFC has RFC-specific E2E evidence in its matrix row", () => {
    const missingTitles = demoIds.filter((id) => !hasE2eTitle(id));
    const missingEvidence = demoIds.filter((id) => {
        const file = id === "0005" ? "virtual-scrolling.spec.ts" : "rfc-validation.spec.ts";
        return !matrixRows.get(id)?.evidence.includes(file);
    });
    expect({ missingTitles, missingEvidence }).toEqual({ missingTitles: [], missingEvidence: [] });
});

// The skill is how agents learn each feature, so a completed RFC with no row there is undocumented.
test("every completed RFC is covered by the ac-grid agent skill", () => {
    const skill = readFileSync(new URL("../../../skills/ac-grid/references/features.md", import.meta.url), "utf8");
    expect(completedIds.filter((id) => !skill.includes(`| ${id} |`))).toEqual([]);
});

// RFC-0045: every P0/P1/P2 feature in the ROADMAP needs an E2E. Priorities are read from the ROADMAP, not copied.
const roadmap = readFileSync(new URL("../../../.spec/ROADMAP.md", import.meta.url), "utf8");
const features = new Map<string, { priority: string; implemented: boolean }>();
for (const row of roadmap.matchAll(/\[(\d{4})\]\(([^)]*)\)[^|\n]*\|[^|\n]*\|\s*(P[0-2])\s*\|/g)) {
    const [, id, link, priority] = row;
    const implemented = features.get(id)?.implemented || link.includes("/completed/");
    features.set(id, { priority, implemented });
}
const { pending } = JSON.parse(readFileSync(new URL("feature-matrix.json", import.meta.url), "utf8")) as {
    pending: Record<string, string>;
};
test("ROADMAP lists P0, P1 and P2 features", () => {
    const priorities = new Set([...features.values()].map((feature) => feature.priority));
    expect([...priorities].sort()).toEqual(["P0", "P1", "P2"]);
});

test("every implemented P0, P1 and P2 feature has an E2E titled with its RFC", () => {
    const missing = [...features].filter(([id, f]) => f.implemented && !hasE2eTitle(id)).map(([id, f]) => `${id} (${f.priority})`);
    expect(missing).toEqual([]);
});

test("every unimplemented feature is listed as pending with a reason, and nothing stale is listed", () => {
    const unlisted = [...features].filter(([id, f]) => !f.implemented && !pending[id]).map(([id]) => id);
    const stale = Object.keys(pending).filter((id) => !features.has(id) || features.get(id)!.implemented);
    expect({ unlisted, stale }).toEqual({ unlisted: [], stale: [] });
});

test("fixture data is deterministic across reloads", async ({ page }) => {
    await page.goto("/?rfc=0002");
    const first = page.locator(".grid-row").first();
    await expect(first).toBeVisible({ timeout: 15_000 });
    const before = await first.textContent();
    await page.reload();
    await expect(page.locator(".grid-row").first()).toHaveText(before!);
});

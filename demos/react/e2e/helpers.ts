import { expect, type Page } from "@playwright/test";

/**
 * Resolve once a grid row exists and the DOM has been quiet for `quietMs`.
 * React StrictMode mounts, destroys and re-mounts the grid in one tick, so the first visible row
 * belongs to a grid that is about to be replaced; acting on it splits a click across two nodes.
 */
export async function gridReady(page: Page, quietMs = 200): Promise<void> {
    await expect(page.locator(".grid-row").first()).toBeVisible({ timeout: 15_000 });
    await page.evaluate(
        (quiet) =>
            new Promise<void>((resolve) => {
                let timer = window.setTimeout(done, quiet);
                const observer = new MutationObserver(() => {
                    window.clearTimeout(timer);
                    timer = window.setTimeout(done, quiet);
                });
                function done() {
                    observer.disconnect();
                    resolve();
                }
                observer.observe(document.body, { childList: true, subtree: true, attributes: true });
            }),
        quietMs,
    );
}

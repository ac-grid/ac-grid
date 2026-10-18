import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_TEST_PORT ?? 5201);
const E2E_QUERY = "e2e=virtual-scroll";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // Serial: parallel workers flake RFC-0002/0004/0023 on the shared dev server.
    workers: 1,
    // CI 保留 list 日志，并写出 html 报告供失败时上传。
    reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: `pnpm exec vite --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: `http://127.0.0.1:${PORT}/?${E2E_QUERY}`,
        reuseExistingServer: false,
        timeout: 120_000,
    },
});

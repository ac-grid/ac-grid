import { defineConfig } from "vite";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        wsx({
            debug: process.env.NODE_ENV === "development", // 开发模式启用调试
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }),
        dts({
            tsconfigPath: resolve(__dirname, "./tsconfig.json"),
            outDir: "dist",
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "AcGridCore",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: [
                "@wsxjs/wsx-core",
                "@tanstack/table-core",
                "@atlaskit/pragmatic-drag-and-drop",
                // Singleton: bundling a copy gives core its own empty theme registry.
                "@ac-grid/theme-base",
            ],
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
            loglevel: resolve(__dirname, "./test/loglevel-wrapper.js"),
        },
    },
    test: {
        environment: "jsdom",
        isolate: false,
        fileParallelism: false,
        include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        coverage: {
            provider: "v8",
            // The whole package, not a hand-picked list of files that are already complete.
            include: ["src/**/*.{ts,wsx}"],
            exclude: ["src/**/*.d.ts"],
            reporter: ["text", "text-summary"],
            // Ratchet: the measured floor on 2026-10-18 (lines 58.8, statements 56.5, branches 35.3, functions 55.4).
            // Raise these as coverage improves; never lower them to make a run pass.
            thresholds: {
                lines: 58,
                functions: 55,
                branches: 35,
                statements: 56,
                // Every plain .ts file is fully covered; .wsx is held to the global floor (see #46).
                "src/**/*.ts": { lines: 100, functions: 100, branches: 100, statements: 100 },
            },
        },
        server: {
            deps: {
                inline: true,
            },
        },
    },
});

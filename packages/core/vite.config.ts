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
        include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        coverage: {
            provider: "v8",
            include: [
                "src/utils/virtualizer.ts",
                "src/utils/virtual-scroll.ts",
                "src/utils/create-grid.ts",
                "src/utils/scroll-sync.ts",
                "src/utils/grouping.ts",
            ],
            reporter: ["text", "text-summary"],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
        server: {
            deps: {
                inline: true,
            },
        },
    },
});

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
        },
    },
    test: {
        environment: "jsdom",
        include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    },
});

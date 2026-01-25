import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ACGridThemeDefault",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["@ac-grid/ac-grid-theme-base"],
        },
    },
});

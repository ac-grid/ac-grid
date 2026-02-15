import { defineConfig } from "vite";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import { wsxPress } from "@wsxjs/wsx-press/node";
import UnoCSS from "unocss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    // Set base path for GitHub Pages deployment
    base:
        process.env.NODE_ENV === "production" &&
        process.env.GITHUB_PAGES === "true"
            ? process.env.CUSTOM_DOMAIN === "true"
                ? "/"
                : "/ac-grid/"
            : "/",
    plugins: [
        // wsx-press：从 public/docs 生成 .wsx-press（dev 通过 middleware 提供 /.wsx-press）
        wsxPress({
            docsRoot: path.resolve(__dirname, "public/docs"),
            outputDir: path.resolve(__dirname, ".wsx-press"),
        }) as any,
        UnoCSS() as any,
        wsx({
            debug: false, // Enable debug to see generated code
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }) as any,
    ],
    build: {
        outDir: "dist",
        sourcemap: process.env.NODE_ENV !== "production", // No source maps in production
    },
    optimizeDeps: {
        exclude: [
            "@wsxjs/wsx-core",
            "@wsxjs/wsx-base-components",
            "@wsxjs/wsx-router",
            "@ac-grid/core",
        ],
        // loglevel is CJS-only; pre-bundle so ESM gets a default export
        include: ["loglevel"],
    },
    // Source maps are enabled by default in dev mode
    // Resolve workspace packages to source files in development mode
    // This allows hot reload without needing to build dependencies first
    // In production, Vite will use package.json exports (dist files)
    resolve: {
        alias: [
            // AC Grid 包别名
            {
                find: "@ac-grid/core",
                replacement: path.resolve(
                    __dirname,
                    "../packages/core/src/index.ts",
                ),
            },
            // WSXJS 包别名 - 在开发模式下指向源码以支持 HMR
            // 注意：这些包应该通过 npm 安装，这里只是为开发时的 HMR 优化
            // 如果包不在 workspace 中，Vite 会自动从 node_modules 解析
        ],
    },
    // 开发环境代理配置，解决 CORS 问题
    server: {
        proxy: {
            "/api/github": {
                target: "https://api.github.com",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/github/, ""),
                configure: (proxy, _options) => {
                    proxy.on("error", (err, _req, _res) => {
                        console.error("GitHub API proxy error", err);
                    });
                },
            },
            "/api/npm": {
                target: "https://api.npmjs.org",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/npm/, ""),
            },
        },
    },
});

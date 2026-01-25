import { defineConfig } from "vite";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import UnoCSS from "unocss/vite";
import path from "path";
import { fileURLToPath } from "url";
import { copyFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite 插件：在构建后复制 index.html 为 404.html（用于 GitHub Pages SPA 路由）
// GitHub Pages 使用 404.html 作为找不到页面时的回退，这对于 SPA 路由至关重要
const copy404Plugin = () => {
    return {
        name: "copy-404-for-github-pages",
        apply: "build", // 只在构建时应用
        closeBundle() {
            // closeBundle 在所有 bundle 写入完成后调用，确保 index.html 已被处理
            const distPath = path.resolve(__dirname, "dist");
            const indexPath = path.join(distPath, "index.html");
            const notFoundPath = path.join(distPath, "404.html");
            try {
                copyFileSync(indexPath, notFoundPath);
                console.log(
                    "✅ Generated 404.html from index.html for GitHub Pages SPA routing",
                );
            } catch (error) {
                console.error("❌ Failed to generate 404.html:", error);
                // 不抛出错误，避免中断构建流程
            }
        },
    };
};

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
        UnoCSS() as any,
        wsx({
            debug: false, // Enable debug to see generated code
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }) as any,
        // 构建后自动复制 index.html 为 404.html（用于 GitHub Pages SPA 路由）
        copy404Plugin() as any,
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
            "@ac-grid/ac-grid-core",
        ],
    },
    // Source maps are enabled by default in dev mode
    // Resolve workspace packages to source files in development mode
    // This allows hot reload without needing to build dependencies first
    // In production, Vite will use package.json exports (dist files)
    resolve: {
        alias: [
            // AC Grid 包别名
            {
                find: "@ac-grid/ac-grid-core",
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

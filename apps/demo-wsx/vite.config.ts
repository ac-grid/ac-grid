import { defineConfig, Plugin } from "vite";
import { wsx } from "@wsxjs/wsx-vite-plugin";
import path from "path";

/**
 * Vite 插件：处理 pino 浏览器版本的导入问题
 *
 * 问题：pino/browser.js 是 CommonJS 模块，使用 module.exports，但某些代码可能尝试默认导入
 * 解决：拦截 pino 的导入，重定向到 pino/browser，并确保正确的导出处理
 */
function pinoBrowserPlugin(): Plugin {
    return {
        name: "pino-browser-fix",
        enforce: "pre",
        resolveId(id, importer) {
            // 如果导入的是 pino，重定向到 pino/browser
            if (id === "pino" && importer) {
                return {
                    id: "pino/browser",
                    external: false,
                };
            }
            return null;
        },
        load(id) {
            // 如果加载的是 pino/browser，确保正确处理 CommonJS 导出
            if (id.includes("pino/browser")) {
                return null; // 让 Vite 正常处理
            }
            return null;
        },
    };
}

export default defineConfig({
    plugins: [
        // pino 浏览器版本修复插件 - 必须在最前面
        pinoBrowserPlugin(),
        // wsx 插件 - 处理 .wsx 文件
        wsx({
            debug: process.env.NODE_ENV === "development",
            jsxFactory: "h",
            jsxFragment: "Fragment",
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            // 开发模式：直接使用源码，支持 HMR
            // 注意：alias 指向 src 目录，Vite 会自动解析 index.ts
            ...(process.env.NODE_ENV === "development"
                ? {
                      "@ac-grid/core": path.resolve(
                          __dirname,
                          "../../packages/core/src/index.ts",
                      ),
                      "@ac-grid/ac-grid-theme-base": path.resolve(
                          __dirname,
                          "../../packages/theme-base/src/index.ts",
                      ),
                      "@ac-grid/ac-grid-theme-default": path.resolve(
                          __dirname,
                          "../../packages/theme-default/src/index.ts",
                      ),
                  }
                : {}),
            // 将 pino 替换为空对象，因为它是 Node.js 专用库
            // 处理 pino 浏览器版本导入问题
            // pino 的浏览器版本 (pino/browser) 使用命名导出，不是默认导出
            pino: "pino/browser",
        },
        conditions: ["source", "import", "module", "browser", "default"],
        extensions: [
            ".mjs",
            ".js",
            ".mts",
            ".ts",
            ".jsx",
            ".tsx",
            ".json",
            ".wsx",
        ],
    },
    optimizeDeps: {
        exclude: [
            "@ac-grid/core",
            "@ac-grid/ac-grid-theme-base",
            "@ac-grid/ac-grid-theme-default",
            "@wsxjs/wsx-core",
            "@tanstack/table-core",
            "@atlaskit/pragmatic-drag-and-drop",
        ],
        // 包含 CommonJS 模块以便 Vite 正确转换
        include: ["bind-event-listener", "loglevel"],
        esbuildOptions: {
            // 确保 CommonJS 模块被正确处理
            format: "esm",
        },
    },
    server: {
        port: 5174,
        open: true,
        hmr: {
            protocol: "ws",
            host: "localhost",
            port: 5174,
        },
        watch: {
            // 监听 workspace 包的源码变化
            ignored: ["!**/node_modules/@ac-grid/**", "!**/packages/**"],
        },
    },
    build: {
        outDir: "dist",
        sourcemap: true,
    },
});

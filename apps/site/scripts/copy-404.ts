/**
 * 复制 index.html 到 404.html
 * GitHub Pages 使用 404.html 处理 SPA 客户端路由
 */

import { copyFileSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = resolve(__dirname, "../dist");
const INDEX_HTML = join(DIST_DIR, "index.html");
const NOT_FOUND_HTML = join(DIST_DIR, "404.html");

function copy404(): void {
    if (!existsSync(INDEX_HTML)) {
        console.error("❌ index.html 不存在:", INDEX_HTML);
        console.error("   请先运行构建命令");
        process.exit(1);
    }

    try {
        copyFileSync(INDEX_HTML, NOT_FOUND_HTML);
        console.log("✅ 已复制 index.html 到 404.html");
    } catch (error) {
        console.error("❌ 复制失败:", error);
        process.exit(1);
    }
}

copy404();
